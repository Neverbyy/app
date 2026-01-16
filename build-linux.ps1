# PowerShell script to build Linux packages via Docker

Write-Host "Building Linux packages (rpm and deb) via Docker..." -ForegroundColor Green

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Docker is not installed or not found in PATH" -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop" -ForegroundColor Red
    exit 1
}

# Build Docker image
Write-Host "`nStep 1: Building Docker image..." -ForegroundColor Yellow
docker build -t sofi-agent-builder .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building Docker image" -ForegroundColor Red
    exit 1
}

# Run container and build packages
Write-Host "`nStep 2: Building packages inside container..." -ForegroundColor Yellow
docker run --rm -v "${PWD}/out:/app/out" sofi-agent-builder
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building packages" -ForegroundColor Red
    exit 1
}

Write-Host "`nDone! Packages saved to ./out folder" -ForegroundColor Green
Write-Host "Check contents:" -ForegroundColor Cyan
Get-ChildItem -Path "./out/make" -Recurse -Include "*.deb","*.rpm" | ForEach-Object {
    Write-Host "  - $($_.FullName)" -ForegroundColor White
}

