$root = Split-Path -Parent $PSScriptRoot

$b = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes("Set-Location '$root\Backend'; Write-Host '>>> Backend iniciando...' -ForegroundColor Cyan; npm run start:dev"))
$f = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes("Set-Location '$root\Frontend'; Write-Host '>>> Frontend iniciando...' -ForegroundColor Green; npm run dev"))

$wt = Get-Command wt -ErrorAction SilentlyContinue

if ($wt) {
    wt new-tab --title "Backend" --tabColor "#1e3a5f" powershell -NoExit -EncodedCommand $b `; new-tab --title "Frontend" --tabColor "#1a3a1a" powershell -NoExit -EncodedCommand $f
} else {
    Write-Host "Windows Terminal nao encontrado. Abrindo em janelas separadas..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit -EncodedCommand $b"
    Start-Process powershell -ArgumentList "-NoExit -EncodedCommand $f"
}
