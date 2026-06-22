/**
 * GeceGorus Plugin — LBDevz License Protected
 * Komut: /gecegorus
 * Versiyon: 1.0.0
 */

const http = require('http')
const os   = require('os')

// ─── Konfigürasyon ────────────────────────────────────────────────────────────
const CONFIG = {
  LICENSE_KEY : process.env.LICENSE_KEY  || 'LBD-TEST0000-TEST0000',
  API_HOST    : process.env.API_HOST     || 'localhost',
  API_PORT    : parseInt(process.env.API_PORT || '3000'),
  PLUGIN_NAME : 'GeceGorus',
  VERSION     : '1.0.0',
  AUTHOR      : 'LBDevz',
}

// ─── Lisans Doğrulama ─────────────────────────────────────────────────────────
function getLocalIP() {
  const ifaces = os.networkInterfaces()
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (!iface.internal && iface.family === 'IPv4') return iface.address
    }
  }
  return '127.0.0.1'
}

function validateLicense(key) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ licenseKey: key, ip: getLocalIP() })
    const req  = http.request(
      {
        hostname: CONFIG.API_HOST,
        port    : CONFIG.API_PORT,
        path    : '/api/v1/license/validate',
        method  : 'POST',
        headers : { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let raw = ''
        res.on('data', (c) => (raw += c))
        res.on('end', () => {
          try { resolve(JSON.parse(raw)) }
          catch { reject(new Error('Invalid server response')) }
        })
      }
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ─── XOR Obfuscation (key storage) ───────────────────────────────────────────
const _seed = [0x4c, 0x42, 0x44, 0x65, 0x76, 0x7a]
function _xk(s) {
  return Buffer.from(s)
    .map((b, i) => b ^ _seed[i % _seed.length])
    .toString('base64')
}
function _dk(e) {
  return Buffer.from(e, 'base64')
    .map((b, i) => b ^ _seed[i % _seed.length])
    .toString()
}

// ─── Oyun Motoru Simülasyonu ─────────────────────────────────────────────────
class Player {
  constructor(name) {
    this.name       = name
    this.effects    = new Map()
    this.online     = true
  }

  addPotionEffect(effect, duration, amplifier) {
    this.effects.set(effect, { duration, amplifier })
    console.log(
      `  [Effect] ${this.name} → ${effect} (süre: ${duration}s, güç: ${amplifier})`
    )
  }

  sendMessage(msg) {
    console.log(`  [MSG → ${this.name}] ${msg}`)
  }

  hasPermission(perm) {
    // Gerçek sunucuda permission sistemi kontrol edilir
    return this.name === 'Admin' || perm === 'gecegorus.use'
  }
}

class PluginServer {
  constructor() {
    this.players = [new Player('Admin'), new Player('Oyuncu1'), new Player('Oyuncu2')]
    this.commands = new Map()
  }

  registerCommand(name, handler) {
    this.commands.set(name.toLowerCase(), handler)
    console.log(`  [Server] Komut kayıt edildi: /${name}`)
  }

  dispatchCommand(playerName, commandLine) {
    const parts   = commandLine.trim().split(/\s+/)
    const cmd     = parts[0].replace(/^\//, '').toLowerCase()
    const args    = parts.slice(1)
    const player  = this.players.find((p) => p.name === playerName)
    if (!player)  { console.log(`  [Server] Oyuncu bulunamadı: ${playerName}`); return }
    const handler = this.commands.get(cmd)
    if (handler)  handler(player, args)
    else          console.log(`  [Server] Bilinmeyen komut: /${cmd}`)
  }

  broadcastMessage(msg) {
    console.log(`  [Broadcast] ${msg}`)
  }
}

// ─── GeceGorus Plugin Sınıfı ─────────────────────────────────────────────────
class GeceGorusPlugin {
  constructor(server) {
    this.server     = server
    this.enabled    = false
    this.activeList = new Set()        // gece görüşü aktif oyuncular
    this.NIGHT_VISION_DURATION = 300   // saniye
    this.NIGHT_VISION_AMP      = 1
  }

  onEnable() {
    console.log(`\n  [${CONFIG.PLUGIN_NAME}] v${CONFIG.VERSION} etkinleştiriliyor...`)

    this.server.registerCommand('gecegorus', (player, args) => {
      this._handleCommand(player, args)
    })

    this.enabled = true
    this.server.broadcastMessage(
      `§a[GeceGorus] §fPlugin başarıyla yüklendi! §7(/gecegorus)`
    )
    console.log(`  [${CONFIG.PLUGIN_NAME}] Hazır.\n`)
  }

  onDisable() {
    this.enabled = false
    this.activeList.clear()
    console.log(`  [${CONFIG.PLUGIN_NAME}] Devre dışı bırakıldı.`)
  }

  _handleCommand(player, args) {
    if (!player.hasPermission('gecegorus.use')) {
      player.sendMessage('§cBu komutu kullanmak için izniniz yok!')
      return
    }

    const sub = (args[0] || 'toggle').toLowerCase()

    if (sub === 'toggle' || sub === 'aç' || sub === 'ac') {
      if (this.activeList.has(player.name)) {
        this._removeNightVision(player)
      } else {
        this._applyNightVision(player)
      }
      return
    }

    if (sub === 'kapat' || sub === 'off') {
      this._removeNightVision(player)
      return
    }

    if (sub === 'ver' && args[1]) {
      const target = this.server.players.find(
        (p) => p.name.toLowerCase() === args[1].toLowerCase()
      )
      if (!target) { player.sendMessage('§cOyuncu bulunamadı: ' + args[1]); return }
      this._applyNightVision(target)
      player.sendMessage(`§a${target.name} §fadlı oyuncuya gece görüşü verildi.`)
      return
    }

    // Yardım
    player.sendMessage('§6[GeceGorus] Kullanım:')
    player.sendMessage('§f  /gecegorus §7— Aç/kapat')
    player.sendMessage('§f  /gecegorus ver <oyuncu> §7— Başkasına ver')
    player.sendMessage('§f  /gecegorus kapat §7— Kapat')
  }

  _applyNightVision(player) {
    player.addPotionEffect('NIGHT_VISION', this.NIGHT_VISION_DURATION, this.NIGHT_VISION_AMP)
    this.activeList.add(player.name)
    player.sendMessage('§a[GeceGorus] §fGece görüşü §aaktif§f!')
  }

  _removeNightVision(player) {
    player.effects.delete('NIGHT_VISION')
    this.activeList.delete(player.name)
    player.sendMessage('§c[GeceGorus] §fGece görüşü §ckapatıldı§f.')
  }
}

// ─── Ana Başlatıcı ────────────────────────────────────────────────────────────
async function main() {
  console.log('╔════════════════════════════════════════════╗')
  console.log('║     GeceGorus Plugin  —  LBDevz            ║')
  console.log('╚════════════════════════════════════════════╝\n')

  // Lisans doğrulama
  console.log('🔐 Lisans doğrulanıyor...')
  const storedKey = _dk(_xk(CONFIG.LICENSE_KEY))   // store → retrieve (obf sonrası)

  let licenseResult
  try {
    licenseResult = await validateLicense(storedKey)
  } catch (err) {
    console.error(`❌ Lisans sunucusuna bağlanılamadı: ${err.message}`)
    console.error('   Sunucunun çalıştığından emin olun:', CONFIG.API_HOST + ':' + CONFIG.API_PORT)
    process.exit(1)
  }

  if (!licenseResult.valid) {
    console.error(`❌ Lisans geçersiz: ${licenseResult.error}`)
    process.exit(1)
  }

  console.log(`✅ Lisans geçerli!`)
  console.log(`   Ürün  : ${licenseResult.product || 'GeceGorus'}`)
  console.log(`   Durum : ${licenseResult.status}`)
  console.log(`   Key   : ${licenseResult.licenseKey}\n`)

  // Plugin başlat
  const server = new PluginServer()
  const plugin = new GeceGorusPlugin(server)
  plugin.onEnable()

  // Demo komutlar
  console.log('─── Komut Demo ────────────────────────────────')
  server.dispatchCommand('Admin',    '/gecegorus')
  server.dispatchCommand('Oyuncu1',  '/gecegorus aç')
  server.dispatchCommand('Admin',    '/gecegorus ver Oyuncu2')
  server.dispatchCommand('Oyuncu1',  '/gecegorus kapat')
  server.dispatchCommand('Admin',    '/gecegorus')

  console.log('\n─── Aktif Oyuncular ────────────────────────────')
  if (plugin.activeList.size === 0) {
    console.log('  Şu an aktif gece görüşü yok.')
  } else {
    for (const name of plugin.activeList) console.log(`  ✓ ${name}`)
  }

  console.log('\n✨ Plugin demo tamamlandı.')
  plugin.onDisable()
}

main().catch((err) => { console.error('Kritik hata:', err); process.exit(1) })
