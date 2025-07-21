# Script de PowerShell para configurar el archivo .env
Write-Host "🔧 Configurando archivo .env para el backend..." -ForegroundColor Green

# Contenido del archivo .env
$envContent = @"
# Configuración de la base de datos MySQL
DB_NAME=extraccion
DB_USER=root
DB_PASSWORD=tu_contraseña_aqui
DB_HOST=localhost
DB_PORT=3306

# Configuración del servidor
PORT=3001
NODE_ENV=development

# JWT Secret (para autenticación)
JWT_SECRET=tu_jwt_secret_aqui
"@

# Ruta del archivo .env
$envPath = Join-Path $PSScriptRoot ".env"

try {
    # Crear el archivo .env
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "✅ Archivo .env creado exitosamente en: $envPath" -ForegroundColor Green
    
    Write-Host "`n📝 IMPORTANTE: Edita el archivo .env y cambia:" -ForegroundColor Yellow
    Write-Host "   - DB_PASSWORD: Pon tu contraseña real de MySQL" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET: Pon una cadena secreta para JWT" -ForegroundColor Yellow
    
    Write-Host "`n🔧 Si el archivo está bloqueado:" -ForegroundColor Cyan
    Write-Host "   1. Haz clic derecho en .env → Propiedades" -ForegroundColor Cyan
    Write-Host "   2. Marca 'Desbloquear' si aparece la opción" -ForegroundColor Cyan
    Write-Host "   3. O crea el archivo manualmente con el contenido anterior" -ForegroundColor Cyan
    
    Write-Host "`n🚀 Después de configurar .env, ejecuta: node test-connection.js" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error al crear el archivo .env: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n🔧 Crea manualmente el archivo .env en la carpeta backend con este contenido:" -ForegroundColor Yellow
    Write-Host "`n" + "="*50 -ForegroundColor Gray
    Write-Host $envContent -ForegroundColor White
    Write-Host "="*50 -ForegroundColor Gray
    Write-Host "`n📝 Recuerda cambiar DB_PASSWORD y JWT_SECRET por valores reales" -ForegroundColor Yellow
} 