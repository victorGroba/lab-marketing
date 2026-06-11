# Script de inicializacao local (Windows)
# Uso: .\iniciar.ps1

Write-Host "Lab Marketing - Inicializando..." -ForegroundColor Cyan

# Verifica .env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host ".env criado a partir do .env.example. Edite antes de continuar." -ForegroundColor Yellow
    Write-Host "Abra o arquivo .env e configure o NEXTAUTH_SECRET." -ForegroundColor Yellow
    exit 1
}

Write-Host "Subindo containers..." -ForegroundColor Cyan
docker compose up -d --build

Write-Host "Aguardando banco ficar pronto..." -ForegroundColor Cyan
Start-Sleep -Seconds 8

Write-Host "Rodando migrations..." -ForegroundColor Cyan
docker compose exec app npx prisma migrate deploy

Write-Host "Rodando seed..." -ForegroundColor Cyan
docker compose exec app npx prisma db seed

Write-Host ""
Write-Host "Pronto! Acesse http://localhost:3000" -ForegroundColor Green
Write-Host "Login: ti@laboratorio.com / lab@2025" -ForegroundColor Green
Write-Host "Login: diretor@laboratorio.com / lab@2025" -ForegroundColor Green
