# Script de despliegue para Vercel
Write-Host "🚀 Iniciando despliegue en Vercel..." -ForegroundColor Green

# 1. Verificar que Vercel CLI esté instalado
Write-Host "📋 Verificando Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI no encontrado. Instalando..." -ForegroundColor Red
    npm install -g vercel
}

# 2. Verificar que estemos en el directorio correcto
Write-Host "📁 Verificando estructura del proyecto..." -ForegroundColor Yellow
if (!(Test-Path "backend") -or !(Test-Path "frontend")) {
    Write-Host "❌ Estructura del proyecto incorrecta" -ForegroundColor Red
    exit 1
}

# 3. Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# 4. Instalar dependencias del frontend
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# 5. Construir el frontend
Write-Host "🔨 Construyendo frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

# 6. Desplegar en Vercel
Write-Host "🚀 Desplegando en Vercel..." -ForegroundColor Green
vercel --prod

Write-Host "✅ Despliegue completado!" -ForegroundColor Green
Write-Host "🌐 Tu aplicación estará disponible en la URL proporcionada por Vercel" -ForegroundColor Cyan 