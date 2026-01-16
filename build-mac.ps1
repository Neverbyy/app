# PowerShell script to build Mac ZIP archive via Docker for x64 architecture

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message, [string]$Color = "Yellow")
    Write-Host "`n$Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  macOS Build Script for Sofi Agent" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Validate Docker installation
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "Error: Docker is not installed or not found in PATH"
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-ErrorMsg "Error: Docker is not running. Please start Docker Desktop"
    exit 1
}

# Build Docker image
Write-Step "Step 1: Building Docker image..." "Yellow"
docker build -t sofi-agent-builder . | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Error building Docker image"
    exit 1
}
Write-Success "Docker image built successfully"

# Build for macOS x64
Write-Step "Step 2: Building ZIP archive for Mac x64..." "Yellow"

$packageCmd = "npm run package -- --platform darwin --arch x64"
$makeCmd = "npm run make -- --platform darwin --arch x64"
$buildCmd = "$packageCmd && $makeCmd"

$buildOutput = docker run --rm -v "${PWD}/out:/app/out" sofi-agent-builder sh -c $buildCmd 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Error building ZIP archive"
    Write-Host $buildOutput -ForegroundColor Red
    exit 1
}

Write-Success "Build completed successfully"

# Display results
Write-Step "`nBuild completed successfully!" "Green"
Write-Host "`nOutput files:" -ForegroundColor Cyan
$zipFiles = Get-ChildItem -Path "./out/make" -Recurse -Include "*.zip" -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -like "*darwin*x64*" } | 
    Sort-Object FullName

if ($zipFiles) {
    foreach ($file in $zipFiles) {
        $size = [math]::Round($file.Length / 1MB, 2)
        $sizeStr = "$size MB"
        Write-Host "  - $($file.FullName) ($sizeStr)" -ForegroundColor White
    }
} else {
    Write-Host "  No ZIP files found in ./out/make" -ForegroundColor Yellow
}

# Check for DMG files (if built on macOS)
$dmgFiles = Get-ChildItem -Path "./out/make" -Recurse -Include "*.dmg" -ErrorAction SilentlyContinue
if ($dmgFiles) {
    Write-Host "`nDMG installers:" -ForegroundColor Cyan
    foreach ($file in $dmgFiles) {
        $size = [math]::Round($file.Length / 1MB, 2)
        $sizeStr = "$size MB"
        Write-Host "  - $($file.FullName) ($sizeStr)" -ForegroundColor White
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
