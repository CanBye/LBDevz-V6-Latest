require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { Client } = require('pg')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
client.connect().then(async () => {
  const jarPath = path.join(__dirname, '../public/downloads/gecegorus-v1.0.0.jar')
  const buf = fs.readFileSync(jarPath)
  const checksum = crypto.createHash('sha256').update(buf).digest('hex')

  await client.query(
    `UPDATE product_versions SET file_key=$1, blob_key=$2, checksum=$3 WHERE version='1.0.0'`,
    ['gecegorus-v1.0.0.jar', 'gecegorus-v1.0.0.jar', checksum]
  )
  console.log('DB guncellendi.')
  console.log('SHA256:', checksum.slice(0, 16) + '...')
  console.log('Dosya:', jarPath)
  console.log('Boyut:', (buf.length / 1024).toFixed(1) + ' KB')
  await client.end()
}).catch(err => { console.error(err.message); process.exit(1) })