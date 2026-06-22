require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { Client } = require('pg')
const crypto = require('crypto')

const CANBABA_ID = '235f2d83-75d5-4574-9164-04e3d5aeb1e1'

const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
c.connect().then(async () => {
  const { rows: prod } = await c.query("SELECT id FROM products WHERE slug='gecegorus-plugin' LIMIT 1")
  if (!prod.length) { console.log('Urun bulunamadi'); await c.end(); return }

  const { rows: existing } = await c.query(
    "SELECT license_key FROM licenses WHERE user_id=$1 AND product_id=$2",
    [CANBABA_ID, prod[0].id]
  )
  if (existing.length) {
    console.log('Lisans zaten var:', existing[0].license_key)
    await c.end(); return
  }

  const key = 'LBD-' + crypto.randomBytes(4).toString('hex').toUpperCase() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase()
  await c.query(
    "INSERT INTO licenses (id, user_id, product_id, license_key, license_model, status) VALUES (gen_random_uuid(), $1, $2, $3, 'lifetime', 'active')",
    [CANBABA_ID, prod[0].id, key]
  )
  console.log('Lisans eklendi:', key)
  await c.end()
}).catch(e => { console.error(e.message); process.exit(1) })