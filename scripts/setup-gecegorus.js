/**
 * GeceGorus Plugin — DB setup + lisans oluşturma
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { Client } = require('pg')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('✅ Neon PostgreSQL bağlandı\n')

  // 1. CanBaba kullanıcısını bul
  const { rows: users } = await client.query(
    `SELECT id, email, name, username FROM users ORDER BY created_at ASC LIMIT 20`
  )
  console.log('👤 Kullanıcılar:')
  users.forEach(u => console.log(`   ${u.id} — ${u.email} (${u.username || u.name})`))

  const canbaba = users.find(u =>
    (u.username && u.username.toLowerCase().includes('canbaba')) ||
    (u.name && u.name.toLowerCase().includes('can')) ||
    (u.email && u.email.toLowerCase().includes('can'))
  ) || users[0]

  if (!canbaba) { console.error('❌ Kullanıcı bulunamadı'); await client.end(); process.exit(1) }
  console.log(`\n🎯 Hedef kullanıcı: ${canbaba.email} (${canbaba.id})\n`)

  // 2. Admin (owner) kullanıcı
  const adminUser = users[0]

  // 3. Ürün oluştur (GeceGorus)
  const productSlug = 'gecegorus-plugin'
  const { rows: existingProducts } = await client.query(`SELECT id FROM products WHERE slug = $1`, [productSlug])

  let productId
  if (existingProducts.length > 0) {
    productId = existingProducts[0].id
    console.log(`♻️  Ürün zaten var: ${productId}`)
  } else {
    const { rows: products } = await client.query(`
      INSERT INTO products (id, slug, name, description, type, price_credits, owner_id, license_model, visibility, status, category, featured, enable_license, enable_obf)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id
    `, [
      productSlug,
      'GeceGorus Plugin',
      'Oyuncularınıza /gecegorus komutu ile gece görüşü efekti verin. LBDevz lisans korumalı, obfuscated plugin.',
      'minecraft_plugin',
      500,
      adminUser.id,
      'lifetime',
      'public',
      'active',
      'Minecraft',
      true,
      true,
      true,
    ])
    productId = products[0].id
    console.log(`✅ Ürün oluşturuldu: ${productId}`)
  }

  // 4. Plugin dosyasını public/downloads klasörüne kopyala
  const distFile = path.join(__dirname, '../tests/gece-gorus-plugin/dist/plugin.obf.js')
  const downloadsDir = path.join(__dirname, '../public/downloads')
  fs.mkdirSync(downloadsDir, { recursive: true })

  const fileKey = `gecegorus-v1.0.0.js`
  const destFile = path.join(downloadsDir, fileKey)
  fs.copyFileSync(distFile, destFile)
  console.log(`✅ Dosya kopyalandı: public/downloads/${fileKey}`)

  // 5. Checksum hesapla
  const fileBuffer = fs.readFileSync(destFile)
  const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex')
  console.log(`   SHA256: ${checksum.slice(0, 16)}...`)

  // 6. Product version oluştur
  const { rows: existingVersions } = await client.query(
    `SELECT id FROM product_versions WHERE product_id = $1 AND version = '1.0.0'`, [productId]
  )

  let versionId
  if (existingVersions.length > 0) {
    versionId = existingVersions[0].id
    await client.query(`
      UPDATE product_versions SET file_key = $1, blob_key = $2, checksum = $3, obf_status = 'done', published = true
      WHERE id = $4
    `, [fileKey, fileKey, checksum, versionId])
    console.log(`♻️  Versiyon güncellendi: ${versionId}`)
  } else {
    const { rows: versions } = await client.query(`
      INSERT INTO product_versions (id, product_id, version, changelog, file_key, blob_key, checksum, obf_status, published)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      productId, '1.0.0',
      'İlk sürüm — /gecegorus komutu, IP binding desteği, RC4 + control flow obfuscation.',
      fileKey, fileKey, checksum, 'done', true
    ])
    versionId = versions[0].id
    console.log(`✅ Versiyon oluşturuldu: ${versionId}`)
  }

  // 7. Lisans oluştur (CanBaba için)
  const licenseKey = `LBD-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

  const { rows: existingLicenses } = await client.query(
    `SELECT id, license_key FROM licenses WHERE user_id = $1 AND product_id = $2`, [canbaba.id, productId]
  )

  let finalLicenseKey
  if (existingLicenses.length > 0) {
    finalLicenseKey = existingLicenses[0].license_key
    console.log(`♻️  Lisans zaten var: ${finalLicenseKey}`)
  } else {
    await client.query(`
      INSERT INTO licenses (id, user_id, product_id, license_key, license_model, status)
      VALUES (gen_random_uuid(), $1, $2, $3, 'lifetime', 'active')
    `, [canbaba.id, productId, licenseKey])
    finalLicenseKey = licenseKey
    console.log(`✅ Lisans oluşturuldu: ${finalLicenseKey}`)
  }

  console.log(`\n${'═'.repeat(52)}`)
  console.log(`  🎮 GeceGorus Plugin Kurulum Tamamlandı`)
  console.log(`${'═'.repeat(52)}`)
  console.log(`  Kullanıcı  : ${canbaba.email}`)
  console.log(`  Ürün       : GeceGorus Plugin`)
  console.log(`  Lisans Key : ${finalLicenseKey}`)
  console.log(`  İndir      : /api/dashboard/download/${finalLicenseKey}`)
  console.log(`${'═'.repeat(52)}`)
  console.log(`\n🔑 Obfuscated plugin'i lisans ile test et:`)
  console.log(`   $env:LICENSE_KEY="${finalLicenseKey}"; node tests/gece-gorus-plugin/dist/plugin.obf.js`)

  await client.end()
}

run().catch(err => { console.error('Hata:', err.message); process.exit(1) })