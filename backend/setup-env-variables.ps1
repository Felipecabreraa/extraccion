# Script para configurar variables de entorno permanentes en Windows
# Ejecutar como Administrador

Write-Host "🔧 Configurando variables de entorno permanentes..." -ForegroundColor Green
Write-Host "⚠️  IMPORTANTE: Ejecuta este script como Administrador" -ForegroundColor Yellow

# Variables a configurar
$variables = @{
    "DB_NAME" = "extraccion"
    "DB_USER" = "root"
    "DB_PASSWORD" = "tu_contraseña_aqui"
    "DB_HOST" = "localhost"
    "DB_PORT" = "3306"
    "PORT" = "3001"
    "NODE_ENV" = "development"
    "JWT_SECRET" = "tu_jwt_secret_aqui"
}

Write-Host "`n📝 Configurando las siguientes variables:" -ForegroundColor Cyan
foreach ($key in $variables.Keys) {
    Write-Host "   $key = $($variables[$key])" -ForegroundColor White
}

Write-Host "`n⚠️  IMPORTANTE: Edita este script y cambia:" -ForegroundColor Yellow
Write-Host "   - DB_PASSWORD: Pon tu contraseña real de MySQL" -ForegroundColor Yellow
Write-Host "   - JWT_SECRET: Pon una cadena secreta para JWT" -ForegroundColor Yellow

Write-Host "`n🔧 Después de editar el script, ejecuta como Administrador:" -ForegroundColor Cyan
Write-Host "   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor White
Write-Host "   .\setup-env-variables.ps1" -ForegroundColor White

# Verificar si se ejecuta como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "`n❌ ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host "💡 Haz clic derecho en PowerShell → 'Ejecutar como administrador'" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Ejecutando como Administrador..." -ForegroundColor Green

# Configurar variables de entorno del sistema
foreach ($key in $variables.Keys) {
    $value = $variables[$key]
    
    try {
        # Configurar variable del sistema
        [Environment]::SetEnvironmentVariable($key, $value, [EnvironmentVariableTarget]::Machine)
        Write-Host "✅ $key configurado correctamente" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error configurando $key : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Variables de entorno configuradas exitosamente!" -ForegroundColor Green
Write-Host "🔄 Reinicia tu terminal/PowerShell para que los cambios tomen efecto" -ForegroundColor Yellow
Write-Host "🚀 Ahora puedes ejecutar tu backend sin problemas" -ForegroundColor Green

Write-Host "`n📋 Para verificar las variables, ejecuta:" -ForegroundColor Cyan
Write-Host "   Get-ChildItem Env: | Where-Object {$_.Name -like 'DB_*' -or $_.Name -like 'JWT_*' -or $_.Name -like 'PORT' -or $_.Name -like 'NODE_ENV'}" -ForegroundColor White 