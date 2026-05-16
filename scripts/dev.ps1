$root = Split-Path -Parent $PSScriptRoot

wt `
  new-tab --title "Backend" --tabColor "#1e3a5f" powershell -NoExit -Command "Set-Location '$root\Backend'; Write-Host '>>> Backend iniciando...' -ForegroundColor Cyan; npm run start:dev" `; `
  new-tab --title "Frontend" --tabColor "#1a3a1a" powershell -NoExit -Command "Set-Location '$root\Frontend'; Write-Host '>>> Frontend iniciando...' -ForegroundColor Green; pnpm dev"
