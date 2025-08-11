# Script de despliegue para Render
Write-Host "🚀 Iniciando despliegue en Render..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "render.yaml")) {
    Write-Host "❌ Error: No se encontró render.yaml" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configuración de Render encontrada" -ForegroundColor Green

# Verificar que el repositorio está actualizado
Write-Host "📋 Verificando estado del repositorio..." -ForegroundColor Yellow
git status

# Mostrar información de despliegue
Write-Host "`n📊 Información de despliegue:" -ForegroundColor Cyan
Write-Host "   Backend: https://extraccion-backend-test.onrender.com" -ForegroundColor White
Write-Host "   Frontend: https://extraccion-frontend-test.onrender.com" -ForegroundColor White
Write-Host "   API URL: https://extraccion-backend-test.onrender.com/api" -ForegroundColor White

Write-Host "`n🔧 Configuración actual:" -ForegroundColor Yellow
Write-Host "   - Backend: Node.js con MySQL" -ForegroundColor White
Write-Host "   - Frontend: React con build estático" -ForegroundColor White
Write-Host "   - Base de datos: trn.cl (MySQL)" -ForegroundColor White

Write-Host "`n📝 Pasos para completar el despliegue:" -ForegroundColor Cyan
Write-Host "1. Ve a https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Conecta tu repositorio de GitHub" -ForegroundColor White
Write-Host "3. Render detectará automáticamente el render.yaml" -ForegroundColor White
Write-Host "4. Los servicios se desplegarán automáticamente" -ForegroundColor White

Write-Host "`n⚙️ Variables de entorno configuradas:" -ForegroundColor Yellow
Write-Host "   Backend:" -ForegroundColor White
Write-Host "     - NODE_ENV=production" -ForegroundColor Gray
Write-Host "     - DB_HOST=trn.cl" -ForegroundColor Gray
Write-Host "     - DB_USER=trn_felipe" -ForegroundColor Gray
Write-Host "     - DB_NAME=trn_extraccion_test" -ForegroundColor Gray
Write-Host "     - JWT_SECRET=tu_jwt_secret_super_seguro_2024" -ForegroundColor Gray
Write-Host "     - CORS_ORIGIN=https://extraccion-frontend-test.onrender.com" -ForegroundColor Gray

Write-Host "`n   Frontend:" -ForegroundColor White
Write-Host "     - REACT_APP_API_URL=https://extraccion-backend-test.onrender.com/api" -ForegroundColor Gray
Write-Host "     - NODE_ENV=production" -ForegroundColor Gray
Write-Host "     - CI=false" -ForegroundColor Gray
Write-Host "     - GENERATE_SOURCEMAP=false" -ForegroundColor Gray

Write-Host "`n✅ El código está listo para ser desplegado en Render!" -ForegroundColor Green
Write-Host "🌐 URLs finales:" -ForegroundColor Cyan
Write-Host "   Frontend: https://extraccion-frontend-test.onrender.com" -ForegroundColor White
Write-Host "   Backend API: https://extraccion-backend-test.onrender.com/api" -ForegroundColor White

Write-Host "`n📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ve a Render Dashboard" -ForegroundColor White
Write-Host "2. Conecta tu repositorio" -ForegroundColor White
Write-Host "3. Render detectará el render.yaml automáticamente" -ForegroundColor White
Write-Host "4. Los servicios se desplegarán en paralelo" -ForegroundColor White
Write-Host "5. Espera 5-10 minutos para que se complete el despliegue" -ForegroundColor White 