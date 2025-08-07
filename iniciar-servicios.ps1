# Script para iniciar servicios de desarrollo
Write-Host "🚀 Iniciando servicios de desarrollo..." -ForegroundColor Green

# Función para verificar si un puerto está en uso
function Test-Port {
    param($Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet
        return $connection.TcpTestSucceeded
    }
    catch {
        return $false
    }
}

# Función para terminar procesos en un puerto
function Stop-ProcessOnPort {
    param($Port)
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($process) {
            $processId = $process.OwningProcess
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Proceso terminado en puerto $Port" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "⚠️  No se pudo terminar proceso en puerto $Port" -ForegroundColor Yellow
    }
}

# Verificar y limpiar puertos
Write-Host "🔍 Verificando puertos..." -ForegroundColor Cyan

if (Test-Port -Port 3001) {
    Write-Host "⚠️  Puerto 3001 en uso, terminando proceso..." -ForegroundColor Yellow
    Stop-ProcessOnPort -Port 3001
}

if (Test-Port -Port 3000) {
    Write-Host "⚠️  Puerto 3000 en uso, terminando proceso..." -ForegroundColor Yellow
    Stop-ProcessOnPort -Port 3000
}

# Iniciar backend
Write-Host "🔧 Iniciando backend en puerto 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Esperar un momento para que el backend inicie
Start-Sleep -Seconds 5

# Verificar que el backend esté funcionando
if (Test-Port -Port 3001) {
    Write-Host "✅ Backend iniciado correctamente en puerto 3001" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Backend no se inició correctamente" -ForegroundColor Red
    exit 1
}

# Iniciar frontend
Write-Host "🎨 Iniciando frontend en puerto 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start" -WindowStyle Normal

# Esperar un momento para que el frontend inicie
Start-Sleep -Seconds 3

# Verificar que el frontend esté funcionando
if (Test-Port -Port 3000) {
    Write-Host "✅ Frontend iniciado correctamente en puerto 3000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend puede estar iniciando..." -ForegroundColor Yellow
}

Write-Host "`n🎯 Servicios iniciados:" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`n📝 Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "   Email: admin@test.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White

Write-Host "`n🔄 Para detener todos los servicios:" -ForegroundColor Yellow
Write-Host "   taskkill /f /im node.exe" -ForegroundColor White 