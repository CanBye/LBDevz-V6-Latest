const http = require('http')

async function post(path, body = {}) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body)
    const req = http.request({
      hostname: 'localhost', port: 3000, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let b = ''; res.on('data', c => b += c)
      res.on('end', () => resolve({ status: res.statusCode }))
    })
    req.on('error', () => resolve({ status: 0 }))
    req.write(data); req.end()
  })
}

async function get(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let b = ''; res.on('data', c => b += c)
      res.on('end', () => resolve({ status: res.statusCode }))
    }).on('error', () => resolve({ status: 0 }))
  })
}

async function runTests() {
  let passed = 0, failed = 0
  const test = async (name, fn, expected) => {
    const result = await fn()
    if (result.status === expected) { console.log(`✅ PASS [${result.status}] ${name}`); passed++ }
    else { console.log(`❌ FAIL [${result.status} vs ${expected}] ${name}`); failed++ }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   LBDevz Full System Test Suite')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  await test('Health Check', () => get('/api/health'), 200)
  await test('Products List', () => get('/api/products'), 200)
  await test('License Validate - empty key', () => post('/api/v1/license/validate', { licenseKey: '' }), 400)
  await test('License Validate - fake key', () => post('/api/v1/license/validate', { licenseKey: 'LBD-FAKE-FAKE' }), 404)
  await test('Coupon Validate - no session', () => post('/api/dashboard/coupon/validate', { code: 'TEST' }), 401)
  await test('Admin Coupons - no session', () => get('/api/admin/coupons'), 401)
  await test('Obf Endpoint - no session', () => post('/api/admin/products/fake/versions/fake/obfuscate'), 401)
  await test('Tickets - no session', () => get('/api/dashboard/tickets'), 401)
  await test('Download - no session', () => get('/api/dashboard/download/LBD-FAKE-FAKE'), 401)
  await test('Me - no session', () => get('/api/me'), 401)
  await test('Dashboard - redirect', () => get('/dashboard'), 307)
  await test('Admin - redirect', () => get('/admin'), 307)

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`   Results: ${passed} passed, ${failed} failed`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  if (failed > 0) process.exit(1)
}

runTests()