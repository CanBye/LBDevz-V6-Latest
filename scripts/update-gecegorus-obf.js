require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { Client } = require('pg')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

// Latest Kserver from obfuscation run
const KSERVER_B64 = process.argv[2] || 'BrBKuInznDjo168FeC8rYwVaAVfLPLuMcrLCyDkeqbA='

const SRC = path.join(__dirname, '../tests/gece-gorus-plugin/java/dist/GeceGorus-1.0.0-obf.jar')
const DST = path.join(__dirname, '../public/downloads/gecegorus-v1.0.0.jar')

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
c.connect().then(async () => {
  // Copy obf jar to public/downloads
  fs.copyFileSync(SRC, DST)
  const buf = fs.readFileSync(DST)
  const checksum = crypto.createHash('sha256').update(buf).digest('hex')

  await c.query(
    `UPDATE product_versions SET
      file_key=$1, blob_key=$2, checksum=$3, server_key_half=$4, obf_status='done'
     WHERE version='1.0.0'`,
    ['gecegorus-v1.0.0.jar', 'gecegorus-v1.0.0.jar', checksum, KSERVER_B64]
  )
  console.log('DB guncellendi (hardened obf JAR).')
  console.log('Kserver:', KSERVER_B64)
  console.log('SHA256:', checksum.slice(0, 16) + '...')
  console.log('Boyut:', (buf.length / 1024).toFixed(1), 'KB')
  await c.end()
}).catch(e => { console.error(e.message); process.exit(1) })