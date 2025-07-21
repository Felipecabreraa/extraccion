# Script para configurar variables de entorno solo para esta sesión
# No requiere permisos de administrador

Write-Host "🔧 Configurando variables de entorno para esta sesión..." -ForegroundColor Green

# Variables a configurar (cambia estos valores)
$env:DB_NAME = "extraccion"
$env:DB_USER = "root"
$env:DB_PASSWORD = "tu_contraseña_aqui"  # CAMBIA ESTO
$env:DB_HOST = "localhost"
$env:DB_PORT = "3306"
$env:PORT = "3001"
$env:NODE_ENV = "development"
$env:JWT_SECRET = "tu_jwt_secret_aqui"   # CAMBIA ESTO

Write-Host "✅ Variables configuradas para esta sesión:" -ForegroundColor Green
Write-Host "   DB_NAME = $env:DB_NAME" -ForegroundColor White
Write-Host "   DB_USER = $env:DB_USER" -ForegroundColor White
Write-Host "   DB_PASSWORD = ***configurada***" -ForegroundColor White
Write-Host "   DB_HOST = $env:DB_HOST" -ForegroundColor White
Write-Host "   DB_PORT = $env:DB_PORT" -ForegroundColor White
Write-Host "   PORT = $env:PORT" -ForegroundColor White
Write-Host "   NODE_ENV = $env:NODE_ENV" -ForegroundColor White
Write-Host "   JWT_SECRET = ***configurada***" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANTE: Edita este script y cambia:" -ForegroundColor Yellow
Write-Host "   - DB_PASSWORD: Pon tu contraseña real de MySQL" -ForegroundColor Yellow
Write-Host "   - JWT_SECRET: Pon una cadena secreta para JWT" -ForegroundColor Yellow

Write-Host "`n🚀 Ahora puedes ejecutar tu backend:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   o" -ForegroundColor White
Write-Host "   node src/app.js" -ForegroundColor White

Write-Host "`n📋 Para probar la conexión:" -ForegroundColor Cyan
Write-Host "   node test-connection.js" -ForegroundColor White

Write-Host "`n💡 Nota: Estas variables solo existen en esta ventana de PowerShell" -ForegroundColor Yellow
Write-Host "   Si cierras esta ventana, tendrás que ejecutar el script nuevamente" -ForegroundColor Yellow 