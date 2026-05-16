$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalando dependencias do projeto..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/2] Backend (npm)..." -ForegroundColor Yellow
Set-Location "$root\Backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao instalar dependencias do Backend." -ForegroundColor Red
    exit 1
}
Write-Host "Backend OK" -ForegroundColor Green

Write-Host ""
Write-Host "[2/2] Frontend (pnpm)..." -ForegroundColor Yellow
Set-Location "$root\Frontend"
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao instalar dependencias do Frontend." -ForegroundColor Red
    exit 1
}
Write-Host "Frontend OK" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Tudo instalado! Rode: npm run dev:all " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
