# Script para verificar variables de entorno
Write-Host "🔍 Verificando variables de entorno..." -ForegroundColor Green

# Variables que deberían estar configuradas
$requiredVars = @("DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "PORT", "NODE_ENV", "JWT_SECRET")

$allConfigured = $true

Write-Host "`n📋 Estado de las variables:" -ForegroundColor Cyan

foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    
    if ($value) {
        if ($var -eq "DB_PASSWORD" -or $var -eq "JWT_SECRET") {
            Write-Host "   ✅ $var = ***configurada***" -ForegroundColor Green
        } else {
            Write-Host "   ✅ $var = $value" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ $var = NO CONFIGURADA" -ForegroundColor Red
        $allConfigured = $false
    }
}

if ($allConfigured) {
    Write-Host "`n🎉 Todas las variables están configuradas correctamente!" -ForegroundColor Green
    Write-Host "🚀 Puedes ejecutar tu backend sin problemas" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Algunas variables no están configuradas" -ForegroundColor Yellow
    Write-Host "💡 Ejecuta uno de estos scripts:" -ForegroundColor Cyan
    Write-Host "   .\setup-env-session.ps1    (para esta sesión)" -ForegroundColor White
    Write-Host "   .\setup-env-variables.ps1  (permanente, requiere admin)" -ForegroundColor White
}

Write-Host "`n📋 Para probar la conexión a la base de datos:" -ForegroundColor Cyan
Write-Host "   node test-connection.js" -ForegroundColor White 