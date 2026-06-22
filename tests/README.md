# LBDevz License System Tests

Bu klasör lisans sistemi entegrasyonu için örnek plugin ve test scriptlerini içerir.

## License Validate API
POST /api/v1/license/validate
Body: { licenseKey: "LBD-XXXXXXXX-XXXXXXXX", productId?: "...", ip?: "..." }

## Test Komutu
node tests/license-test.js