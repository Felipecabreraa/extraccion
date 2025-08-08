# Script para deploy a ambiente de pruebas
Write-Host "🚀 Deploy a ambiente de pruebas..." -ForegroundColor Green

# Verificar estado del repositorio
Write-Host "📋 Verificando estado del repositorio..." -ForegroundColor Yellow
git status

# Agregar todos los cambios
Write-Host "📦 Agregando cambios..." -ForegroundColor Yellow
git add .

# Solicitar mensaje de commit
$commitMessage = Read-Host "💬 Ingresa el mensaje del commit"

# Hacer commit
Write-Host "💾 Haciendo commit..." -ForegroundColor Yellow
git commit -m $commitMessage

# Push a develop
Write-Host "📤 Subiendo cambios a develop..." -ForegroundColor Yellow
git push origin develop

Write-Host "✅ Cambios subidos exitosamente!" -ForegroundColor Green
Write-Host "🔄 Render detectará los cambios automáticamente" -ForegroundColor Cyan
Write-Host "⏱️  Despliegue en 2-5 minutos..." -ForegroundColor Cyan
Write-Host "🌐 URL: https://extraccion-frontend-test.onrender.com" -ForegroundColor Cyan 