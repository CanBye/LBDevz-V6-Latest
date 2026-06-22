/**
 * GeceGorus Plugin Obfuscator
 * Kullanım: node tests/gece-gorus-plugin/obfuscate.js
 */
const JavaScriptObfuscator = require('javascript-obfuscator')
const fs   = require('fs')
const path = require('path')

const SRC  = path.join(__dirname, 'src', 'plugin.js')
const DIST = path.join(__dirname, 'dist', 'plugin.obf.js')

fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true })

const source = fs.readFileSync(SRC, 'utf8')

console.log('🔒 Obfuscation başlatılıyor...')
console.log(`   Kaynak : ${SRC}`)
console.log(`   Boyut  : ${(source.length / 1024).toFixed(1)} KB\n`)

const result = JavaScriptObfuscator.obfuscate(source, {
  // Temel karıştırma
  compact                        : true,
  controlFlowFlattening          : true,
  controlFlowFlatteningThreshold : 0.9,

  // String şifreleme
  stringArray                    : true,
  stringArrayCallsTransform      : true,
  stringArrayCallsTransformThreshold: 1,
  stringArrayEncoding            : ['rc4'],
  stringArrayIndexShift          : true,
  stringArrayRotate              : true,
  stringArrayShuffle             : true,
  stringArrayWrappersCount       : 5,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 5,
  stringArrayWrappersType        : 'function',
  stringArrayThreshold           : 1,

  // Dead code enjeksiyonu
  deadCodeInjection              : true,
  deadCodeInjectionThreshold     : 0.4,

  // İsim karıştırma
  identifierNamesGenerator       : 'hexadecimal',
  renameGlobals                  : false,

  // Sayı dönüşümü
  numbersToExpressions           : true,

  // Kod split
  splitStrings                   : true,
  splitStringsChunkLength        : 5,

  // Debugger koruması
  debugProtection                : true,
  debugProtectionInterval        : 4000,

  // Self-defend (eval koruması)
  selfDefending                  : true,

  // Transform obfuscation
  transformObjectKeys            : true,
  unicodeEscapeSequence          : false,

  seed: 0x4c424456,  // LBDV
})

const obfCode = result.getObfuscatedCode()
fs.writeFileSync(DIST, obfCode, 'utf8')

const ratio = ((1 - source.length / obfCode.length) * 100).toFixed(1)
console.log('✅ Obfuscation tamamlandı!')
console.log(`   Çıktı  : ${DIST}`)
console.log(`   Boyut  : ${(obfCode.length / 1024).toFixed(1)} KB`)
console.log(`   Büyüme : +${ratio}% (dead code + wrappers)`)
console.log('\n📋 İlk 120 karakter önizleme:')
console.log('   ' + obfCode.slice(0, 120) + '...')
console.log('\n💡 Çalıştırmak için:')
console.log('   LICENSE_KEY=<lisans-key> node tests/gece-gorus-plugin/dist/plugin.obf.js')