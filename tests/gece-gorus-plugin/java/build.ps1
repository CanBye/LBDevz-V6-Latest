# GeceGorus Plugin — Build Script
# Kullanim: cd tests\gece-gorus-plugin\java && .\build.ps1

$SRC_DIR  = "src\main\java"
$RES_DIR  = "src\main\resources"
$OUT_DIR  = "out\classes"
$DIST_DIR = "dist"
$JAR_NAME = "GeceGorus-1.0.0.jar"

Write-Host "╔══════════════════════════════════════╗"
Write-Host "║  GeceGorus Plugin Builder — LBDevz   ║"
Write-Host "╚══════════════════════════════════════╝`n"

# Klasörler
New-Item -ItemType Directory -Force -Path $OUT_DIR  | Out-Null
New-Item -ItemType Directory -Force -Path $DIST_DIR | Out-Null

# 1. Derle
Write-Host "⚙️  Derleniyor..."
$sources = Get-ChildItem -Recurse -Filter "*.java" -Path $SRC_DIR | Select-Object -ExpandProperty FullName
javac --release 11 -d $OUT_DIR $sources
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Derleme başarısız"; exit 1 }
Write-Host "✅ Derleme tamamlandı`n"

# 2. Resources kopyala
Copy-Item -Path "$RES_DIR\*" -Destination $OUT_DIR -Recurse -Force
Write-Host "✅ Resources kopyalandı"

# 3. JAR oluştur
$JAR_PATH = "$DIST_DIR\$JAR_NAME"
jar cfe $JAR_PATH com.lbdevz.gecegorus.GeceGorusPlugin -C $OUT_DIR .
if ($LASTEXITCODE -ne 0) { Write-Host "❌ JAR oluşturma başarısız"; exit 1 }

$size = [math]::Round((Get-Item $JAR_PATH).Length / 1KB, 1)
Write-Host "✅ JAR oluşturuldu: $JAR_PATH ($size KB)`n"

Write-Host "─────────────────────────────────────"
Write-Host "🚀 Test etmek için:"
Write-Host "   `$env:LICENSE_KEY='LBD-1F365365-75723925'; java -jar $DIST_DIR\$JAR_NAME"
Write-Host ""
Write-Host "📦 Minecraft sunucusuna kurmak için:"
Write-Host "   $JAR_NAME → plugins/ klasörüne kopyala"