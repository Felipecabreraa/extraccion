# Script de despliegue final para Vercel
Write-Host "🚀 Iniciando despliegue final en Vercel..." -ForegroundColor Green

# 1. Verificar estructura del proyecto
Write-Host "📁 Verificando estructura del proyecto..." -ForegroundColor Yellow
if (!(Test-Path "backend") -or !(Test-Path "frontend")) {
    Write-Host "❌ Estructura del proyecto incorrecta" -ForegroundColor Red
    exit 1
}

# 2. Limpiar archivos temporales
Write-Host "🧹 Limpiando archivos temporales..." -ForegroundColor Yellow
if (Test-Path "frontend/build") {
    Remove-Item -Recurse -Force "frontend/build"
}

# 3. Instalar dependencias del backend
Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias del backend" -ForegroundColor Red
    exit 1
}

# 4. Instalar dependencias del frontend
Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias del frontend" -ForegroundColor Red
    exit 1
}

# 5. Construir el frontend
Write-Host "🔨 Construyendo el frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error construyendo el frontend" -ForegroundColor Red
    exit 1
}

# 6. Volver al directorio raíz
Set-Location ..

# 7. Desplegar en Vercel
Write-Host "🚀 Desplegando en Vercel..." -ForegroundColor Green
npx vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Despliegue exitoso!" -ForegroundColor Green
    Write-Host "🌐 Tu aplicación está disponible en la URL mostrada arriba" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error en el despliegue" -ForegroundColor Red
    exit 1
} 