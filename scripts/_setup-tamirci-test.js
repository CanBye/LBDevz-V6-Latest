/**
 * End-to-end test setup for the Tamirci plugin against the hardened
 * obfuscation + license flow.
 *
 * Steps:
 *   1. Obfuscate Tamirci-1.0.jar with the baked Ed25519 pubkey (spawns obf-worker).
 *   2. Update the linked product's latest published version with the new KSERVER.
 *   3. Bind 127.0.0.1 + ::1 to the license so IP-binding passes for localhost.
 *   4. Copy the obf jar into the test server's plugins/ folder.
 *
 * The plugin reads the license key from the LICENSE_KEY env var set in baslat.bat.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { Client } = require('pg')
const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const REPO = path.join(__dirname, '..')
const OBF_JAR = path.join(REPO, 'apps', 'obf-worker', 'dist', 'obf-worker.jar')
const INPUT = 'C:\\Users\\CanBye\\Desktop\\Tamirci-1.0.jar'
const OUTPUT = path.join(REPO, 'public', 'downloads', 'tamirci-test-obf.jar')
const PLUGINS_DIR = 'C:\\Users\\CanBye\\Desktop\\LBDev SMP PluginPaketi\\plugins'
const PRODUCT_ID = 'fa7e2061-4da1-4e8e-9190-efcad67293ec'
const LICENSE_KEY = 'LBD-OMV-KZYL-MFRQHKMT'
const PUB = process.env.LICENSE_ED25519_PUBLIC_KEY || ''

function obfuscate() {
  // Pass argv as an array so empty-string args are preserved (PowerShell drops them).
  const args = [
    '-jar', OBF_JAR,
    INPUT,
    OUTPUT,
    PRODUCT_ID,
    'localhost',
    '3000',
    'LICENSE_KEY',
    '',          // mainClass -> auto-detect
    'http',      // scheme
    PUB,         // ed25519 pubkey
  ]
  console.log('[setup] Running obf-worker...')
  const r = spawnSync('java', args, { encoding: 'utf8' })
  if (r.status !== 0) {
    console.error('[setup] obf-worker failed:', r.stderr || r.stdout)
    process.exit(1)
  }
  process.stdout.write(r.stdout)
  const parsed = {}
  for (const line of r.stdout.split('\n')) {
    const i = line.indexOf('=')
    if (i > 0 && /^[A-Z]+$/.test(line.slice(0, i).trim())) {
      parsed[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }
  }
  if (parsed.STATUS !== 'done' || !parsed.KSERVER) {
    console.error('[setup] obfuscation did not complete cleanly:', parsed)
    process.exit(1)
  }
  return parsed
}

async function main() {
  if (!PUB) { console.error('[setup] LICENSE_ED25519_PUBLIC_KEY not set in .env'); process.exit(1) }
  if (!fs.existsSync(INPUT)) { console.error('[setup] Input jar missing:', INPUT); process.exit(1) }

  const parsed = obfuscate()
  console.log('[setup] KSERVER:', parsed.KSERVER.slice(0, 12) + '...')

  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()

  // Latest published version for the product (validate endpoint returns this one)
  const ver = await c.query(
    `SELECT id, version FROM product_versions
     WHERE product_id = $1 AND published = true
     ORDER BY created_at DESC LIMIT 1`, [PRODUCT_ID])
  if (!ver.rows.length) { console.error('[setup] No published version found'); process.exit(1) }
  const versionId = ver.rows[0].id
  console.log('[setup] Target version:', ver.rows[0].version, versionId)

  await c.query(
    `UPDATE product_versions SET server_key_half = $1, obf_status = 'done', published = true WHERE id = $2`,
    [parsed.KSERVER, versionId])
  console.log('[setup] Updated server_key_half on latest version.')

  // License id
  const lic = await c.query('SELECT id FROM licenses WHERE license_key = $1', [LICENSE_KEY])
  if (!lic.rows.length) { console.error('[setup] License not found'); process.exit(1) }
  const licenseId = lic.rows[0].id

  // Bind localhost IPs (idempotent)
  for (const ip of ['127.0.0.1', '::1', '0:0:0:0:0:0:0:1']) {
    const exists = await c.query('SELECT 1 FROM license_ips WHERE license_id = $1 AND ip = $2', [licenseId, ip])
    if (!exists.rows.length) {
      await c.query('INSERT INTO license_ips (license_id, ip, label) VALUES ($1, $2, $3)', [licenseId, ip, 'localhost-test'])
      console.log('[setup] Bound IP:', ip)
    }
  }

  await c.end()

  // Place jar in plugins/ (remove stale copies first)
  const dest = path.join(PLUGINS_DIR, 'Tamirci-v1.0.0.jar')
  fs.copyFileSync(OUTPUT, dest)
  console.log('[setup] Copied obf jar ->', dest)

  console.log('\n[setup] DONE. Start Next.js (npm run dev) then run baslat.bat.')
}

main().catch((e) => { console.error('[setup] ERR', e.message); process.exit(1) })
