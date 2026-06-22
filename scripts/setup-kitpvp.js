/**
 * Creates a KitPvP product + version + license in the DB
 * and stores the Kserver from the latest obf run.
 *
 * Usage: node setup-kitpvp.js <kserver_base64>
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { Client } = require('pg')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const KSERVER_B64 = process.argv[2]
if (!KSERVER_B64) { console.error('Usage: node setup-kitpvp.js <kserver_base64>'); process.exit(1) }

const JAR_PATH = "C:\\Users\\CanBye\\Desktop\\KitPvP-1.0.0-obf.jar"

async function run() {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await c.connect()

  // 1. Find admin user (ownerId for the product)
  const ownerRes = await c.query(`SELECT id FROM users ORDER BY created_at ASC LIMIT 1`)
  if (!ownerRes.rows.length) { console.error('No users found'); process.exit(1) }
  const ownerId = ownerRes.rows[0].id
  console.log('Owner:', ownerId)

  // 2. Upsert KitPvP product
  const prodRes = await c.query(`
    INSERT INTO products (slug, name, description, type, price_credits, owner_id,
      license_model, enable_license, enable_obf, status, visibility)
    VALUES ('kitpvp', 'KitPvP', 'LBDevz KitPvP Plugin', 'minecraft_plugin', 0,
      $1, 'lifetime', true, true, 'active', 'unlisted')
    ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name
    RETURNING id
  `, [ownerId])
  const productId = prodRes.rows[0].id
  console.log('Product ID:', productId)

  // 3. Checksum of obf JAR
  let checksum = null
  try {
    const buf = fs.readFileSync(JAR_PATH)
    checksum = crypto.createHash('sha256').update(buf).digest('hex')
    console.log('Checksum:', checksum.slice(0,16) + '...')
  } catch(e) { console.log('JAR not found at', JAR_PATH, '- checksum skipped') }

  // 4. Upsert product version
  const verRes = await c.query(`
    INSERT INTO product_versions (product_id, version, file_key, blob_key,
      checksum, obf_status, server_key_half, published)
    VALUES ($1, '1.0.0', 'kitpvp-v1.0.0.jar', 'kitpvp-v1.0.0.jar', $2,
      'done', $3, true)
    ON CONFLICT DO NOTHING
    RETURNING id
  `, [productId, checksum, KSERVER_B64])

  if (!verRes.rows.length) {
    // Version exists — just update the kServer
    await c.query(`
      UPDATE product_versions SET server_key_half=$1, obf_status='done', published=true
      WHERE product_id=$2 AND version='1.0.0'
    `, [KSERVER_B64, productId])
    console.log('Updated existing version with new kServer.')
  } else {
    console.log('Version created:', verRes.rows[0].id)
  }

  // 5. Generate a license key for KitPvP
  const licKey = 'LBD-KITPVP00-TEST0001'
  await c.query(`
    INSERT INTO licenses (license_key, product_id, user_id, status, license_model)
    VALUES ($1, $2, $3, 'active', 'lifetime')
    ON CONFLICT DO NOTHING
  `, [licKey, productId, ownerId])
  console.log('License key:', licKey)
  console.log('')
  console.log('Add to baslat.bat:  set LICENSE_KEY=' + licKey)

  await c.end()
}

run().catch(e => { console.error(e.message); process.exit(1) })