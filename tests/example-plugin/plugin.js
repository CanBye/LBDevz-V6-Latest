/**
 * LBDevz Example Plugin
 * License: Commercial — Validate at startup
 */

const os = require('os')

const LICENSE_KEY = process.env.LICENSE_KEY || "LBD-TESTKEY-TESTVAL"
const API_HOST = process.env.API_HOST || "localhost"
const API_PORT = process.env.API_PORT || "3000"

function validateLicense(licenseKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      licenseKey,
      ip: getLocalIP()
    })

    const options = {
      hostname: API_HOST,
      port: parseInt(API_PORT),
      path: '/api/v1/license/validate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }

    // Use http for localhost, https for production
    const protocol = API_HOST === 'localhost' ? require('http') : require('https')

    const req = protocol.request(options, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => {
        try {
          const result = JSON.parse(body)
          resolve(result)
        } catch {
          reject(new Error('Invalid response from license server'))
        }
      })
    })

    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address
      }
    }
  }
  return '127.0.0.1'
}

// Simple XOR obfuscation of the license key at rest
function obfuscateKey(key, seed = 42) {
  return Buffer.from(key).map((b, i) => b ^ ((seed + i) % 256)).toString('base64')
}

function deobfuscateKey(obfuscated, seed = 42) {
  const buf = Buffer.from(obfuscated, 'base64')
  return buf.map((b, i) => b ^ ((seed + i) % 256)).toString()
}

async function startPlugin() {
  console.log('🔐 LBDevz Plugin — Starting license validation...')

  const obfuscated = obfuscateKey(LICENSE_KEY)
  const clearKey = deobfuscateKey(obfuscated)

  let result
  try {
    result = await validateLicense(clearKey)
  } catch (err) {
    console.error('❌ License server unreachable:', err.message)
    console.error('   Make sure LBDevz server is running on', API_HOST + ':' + API_PORT)
    process.exit(1)
  }

  if (!result.valid) {
    console.error('❌ License validation FAILED:', result.error)
    process.exit(1)
  }

  console.log('✅ License VALID!')
  console.log('   Product:', result.product)
  console.log('   License Key:', result.licenseKey)
  console.log('   Status:', result.status)
  console.log('')
  console.log('🚀 Plugin initialized successfully. Enjoy LBDevz software!')

  // Plugin main logic would go here...
  runPluginLogic()
}

function runPluginLogic() {
  console.log('⚙️  Plugin logic running...')
  // Example: periodic heartbeat
  let tick = 0
  const interval = setInterval(() => {
    tick++
    console.log(`   [Tick ${tick}] Plugin heartbeat — all systems nominal`)
    if (tick >= 3) {
      clearInterval(interval)
      console.log('\n✨ Plugin demo completed. Full integration is live.')
    }
  }, 1000)
}

startPlugin()