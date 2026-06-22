# LBDevz Obf-Worker Build Script
# Usage: cd apps\obf-worker && .\build.ps1
# Requires: Java 21 (javac + jar) in PATH. No Maven needed.

param(
    [switch]$SkipAsm   # Pass -SkipAsm to build without ASM Katman-1
)

$ROOT      = Split-Path -Parent $MyInvocation.MyCommand.Path
$SRC       = "$ROOT\src\main\java"
$RUNTIME   = "$ROOT\runtime"
$OUT       = "$ROOT\out"
$LOADER_OUT= "$ROOT\loader-classes"
$DIST      = "$ROOT\dist"
$LIB       = "$ROOT\lib"
$JAR_NAME  = "obf-worker.jar"

Write-Host "LBDevz Obf-Worker Builder"
Write-Host "Java: $(java -version 2>&1 | Select-Object -First 1)"
Write-Host ""

# Create dirs
New-Item -ItemType Directory -Force -Path $OUT, $LOADER_OUT, $DIST, $LIB | Out-Null

# ── Step 1: Try download ASM (optional) ──────────────────────────────────────
$ASM_JAR = "$LIB\asm-9.7.jar"
if (-not (Test-Path $ASM_JAR) -and -not $SkipAsm) {
    Write-Host "Downloading ASM 9.7..."
    try {
        Invoke-WebRequest `
            -Uri "https://repo1.maven.org/maven2/org/ow2/asm/asm/9.7/asm-9.7.jar" `
            -OutFile $ASM_JAR -UseBasicParsing -TimeoutSec 15
        $asmSize = (Get-Item $ASM_JAR).Length
        Write-Host "ASM downloaded: $([math]::Round($asmSize/1KB,0)) KB"
    } catch {
        Write-Host "ASM download failed (offline?). Building Katman-2 only."
        $SkipAsm = $true
        if (Test-Path $ASM_JAR) { Remove-Item $ASM_JAR -Force }
    }
}

# ── Step 2: Compile loader stub (no external deps) ───────────────────────────
Write-Host ""
Write-Host "Compiling loader stub..."
$loaderSources = Get-ChildItem -Recurse -Filter "*.java" -Path $RUNTIME |
    Select-Object -ExpandProperty FullName

if ($loaderSources.Count -eq 0) {
    Write-Host "ERROR: No loader sources found in $RUNTIME"; exit 1
}

# Compile Bukkit API stubs (compile-time only — real impl comes from server at runtime)
$STUBS_DIR  = "$ROOT\runtime-stubs"
$STUBS_OUT  = "$ROOT\out\stubs"
New-Item -ItemType Directory -Force -Path $STUBS_OUT | Out-Null
$stubSources = Get-ChildItem -Recurse -Filter "*.java" -Path $STUBS_DIR |
    Select-Object -ExpandProperty FullName
javac --release 11 -d $STUBS_OUT $stubSources
if ($LASTEXITCODE -ne 0) { Write-Host "Bukkit stubs compile FAILED"; exit 1 }
Write-Host "Bukkit stubs compiled OK"

# -XDstringConcat=inline: use StringBuilder (ldc parts) instead of invokedynamic,
# so string-concatenation literals also get string-encrypted by the obfuscator.
javac -XDstringConcat=inline --release 11 -cp $STUBS_OUT -d $LOADER_OUT $loaderSources
if ($LASTEXITCODE -ne 0) { Write-Host "Loader compile FAILED"; exit 1 }
Write-Host "Loader stub compiled OK ($((Get-ChildItem $LOADER_OUT -Recurse -Filter '*.class').Count) classes)"

# ── Step 3: Compile obf-worker ────────────────────────────────────────────────
Write-Host ""
Write-Host "Compiling obf-worker..."
$workerSources = Get-ChildItem -Recurse -Filter "*.java" -Path $SRC |
    Select-Object -ExpandProperty FullName

$CP = "."
if (-not $SkipAsm -and (Test-Path $ASM_JAR)) {
    $CP = $ASM_JAR
    Write-Host "Using ASM classpath: $ASM_JAR"
} else {
    # Remove ASM-dependent sources when building without ASM
    Write-Host "Building without ASM (Katman-1 disabled at compile time)"
    $workerSources = $workerSources | Where-Object {
        $_ -notlike "*StringEncryptTransform*" -and
        $_ -notlike "*RenameTransform*" -and
        $_ -notlike "*JunkCodeTransform*" -and
        $_ -notlike "*AsmPipeline*" -and
        $_ -notlike "*ConstantObfTransform*"
    }
}

javac --release 11 -cp $CP -d $OUT $workerSources
if ($LASTEXITCODE -ne 0) { Write-Host "ObfWorker compile FAILED"; exit 1 }
Write-Host "ObfWorker compiled OK ($((Get-ChildItem $OUT -Recurse -Filter '*.class').Count) classes)"

# ── Step 3b: Extract ASM into $OUT for fat JAR ────────────────────────────────
# This ensures ConstantObfTransform (and all Katman-1 transforms) are always
# available at runtime — no separate ASM jar needed on the classpath.
if (-not $SkipAsm -and (Test-Path $ASM_JAR)) {
    Write-Host "Extracting ASM into output dir (fat JAR)..."
    Push-Location $OUT
    jar xf $ASM_JAR
    Pop-Location
    Write-Host "ASM extracted OK ($((Get-ChildItem $OUT -Recurse -Filter '*.class' | Where-Object { $_.FullName -like '*asm*' -or $_.FullName -like '*objectweb*' }).Count) ASM classes)"
}

# ── Step 4: Package obf-worker.jar (fat JAR) ──────────────────────────────────
Write-Host ""
Write-Host "Packaging $JAR_NAME..."
$JAR_PATH = "$DIST\$JAR_NAME"

# Manifest
$manifestDir = "$OUT\META-INF"
New-Item -ItemType Directory -Force -Path $manifestDir | Out-Null
Set-Content -Path "$manifestDir\MANIFEST.MF" -Value @"
Manifest-Version: 1.0
Main-Class: com.lbdevz.obf.ObfWorker

"@

jar cfm $JAR_PATH "$manifestDir\MANIFEST.MF" -C $OUT . -C $LOADER_OUT .

if ($LASTEXITCODE -ne 0) { Write-Host "JAR packaging FAILED"; exit 1 }

$sz = [math]::Round((Get-Item $JAR_PATH).Length / 1KB, 1)
Write-Host ""
Write-Host "Done: $JAR_PATH ($sz KB)"
Write-Host ""
Write-Host "Test with:"
Write-Host "  java -jar $DIST\$JAR_NAME <input.jar> <output.jar> <productId>"