/**
 * LBDevz License System — End-to-End Test Suite
 * Run: node tests/license-test.js [LICENSE_KEY]
 */

const http = require('http')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const TEST_KEY = process.argv[2] || process.env.TEST_LICENSE_KEY || 'LBD-TEST0000-TEST0000'

async function httpPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const url = new URL(path, BASE_URL)

    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }

    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) })
        } catch {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function runTests() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('   LBDevz License System — Test Suite')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  let passed = 0
  let failed = 0

  async function test(name, fn) {
    try {
      await fn()
      console.log(`✅ PASS: ${name}`)
      passed++
    } catch (err) {
      console.log(`❌ FAIL: ${name}`)
      console.log(`   Error: ${err.message}`)
      failed++
    }
  }

  // Test 1: API endpoint reachability
  await test('API endpoint is reachable', async () => {
    const res = await httpPost('/api/v1/license/validate', { licenseKey: '' })
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`)
  })

  // Test 2: Missing license key validation
  await test('Missing license key returns 400', async () => {
    const res = await httpPost('/api/v1/license/validate', {})
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`)
    if (res.data.valid !== false) throw new Error('Expected valid=false')
  })

  // Test 3: Invalid/non-existent key
  await test('Invalid license key returns 404', async () => {
    const res = await httpPost('/api/v1/license/validate', { licenseKey: 'LBD-INVALID-FAKEKEE' })
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`)
    if (res.data.valid !== false) throw new Error('Expected valid=false')
  })

  // Test 4: Real license key (if provided)
  if (TEST_KEY !== 'LBD-TEST0000-TEST0000') {
    await test(`Real license key validation: ${TEST_KEY}`, async () => {
      const res = await httpPost('/api/v1/license/validate', { licenseKey: TEST_KEY })
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}. Response: ${JSON.stringify(res.data)}`)
      if (res.data.valid !== true) throw new Error(`License invalid: ${res.data.error}`)
      console.log(`   Product: ${res.data.product}`)
      console.log(`   Status: ${res.data.status}`)
    })
  } else {
    console.log('⚠️  SKIP: Real key test (pass a real LICENSE_KEY as argument to test)')
    console.log('   Usage: node tests/license-test.js LBD-XXXXXXXX-XXXXXXXX')
  }

  // Test 5: Health check
  await test('API health check endpoint', async () => {
    await new Promise((resolve, reject) => {
      http.get(`${BASE_URL}/api/health`, (res) => {
        if (res.statusCode !== 200) reject(new Error(`Health check failed: ${res.statusCode}`))
        else resolve()
      }).on('error', reject)
    })
  })

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`   Results: ${passed} passed, ${failed} failed`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (failed > 0) process.exit(1)
}

runTests().catch(err => {
  console.error('Test suite error:', err)
  process.exit(1)
})