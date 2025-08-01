# Script para deploy del backend en Railway
Write-Host "🚂 Iniciando deploy del backend en Railway..." -ForegroundColor Green

# Verificar si Railway CLI está instalado
try {
    $railwayVersion = railway --version
    Write-Host "✅ Railway CLI encontrado: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Navegar al directorio del backend
Set-Location backend

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json en el directorio backend" -ForegroundColor Red
    exit 1
}

# Instalar dependencias si no están instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Verificar que el proyecto esté configurado para Railway
if (-not (Test-Path "railway.json")) {
    Write-Host "⚠️  Advertencia: No se encontró railway.json" -ForegroundColor Yellow
}

# Login con Railway (si no está logueado)
Write-Host "🔐 Verificando login con Railway..." -ForegroundColor Yellow
railway login

# Ver proyectos disponibles
Write-Host "📋 Proyectos disponibles en Railway:" -ForegroundColor Cyan
railway projects

# Deploy a Railway
Write-Host "🚀 Iniciando deploy en Railway..." -ForegroundColor Green
Write-Host "📝 Nota: Si es la primera vez, necesitarás crear un proyecto" -ForegroundColor Yellow

railway up

Write-Host "✅ Deploy completado!" -ForegroundColor Green
Write-Host "🌐 Tu API estará disponible en la URL proporcionada por Railway" -ForegroundColor Cyan

# Obtener la URL del proyecto
Write-Host "🔗 Obteniendo URL del proyecto..." -ForegroundColor Yellow
railway status

Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Copiar la URL del backend de Railway" -ForegroundColor White
Write-Host "2. Actualizar REACT_APP_API_URL en Vercel" -ForegroundColor White
Write-Host "3. Configurar variables de entorno en Railway" -ForegroundColor White

# Volver al directorio raíz
Set-Location .. 