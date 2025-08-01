Write-Host "📦 Preparando archivos para Hostinger..." -ForegroundColor Green

# Crear directorio temporal para archivos de hosting
if (Test-Path "hosting-files") {
    Remove-Item "hosting-files" -Recurse -Force
}
New-Item -ItemType Directory -Path "hosting-files" -Force | Out-Null
Set-Location "hosting-files"

# Crear estructura de directorios
New-Item -ItemType Directory -Path "backend/src/controllers" -Force | Out-Null
New-Item -ItemType Directory -Path "backend/src/models" -Force | Out-Null
New-Item -ItemType Directory -Path "backend/src/routes" -Force | Out-Null
New-Item -ItemType Directory -Path "backend/src/middlewares" -Force | Out-Null
New-Item -ItemType Directory -Path "backend/src/config" -Force | Out-Null
New-Item -ItemType Directory -Path "backend/src/utils" -Force | Out-Null
New-Item -ItemType Directory -Path "backend/migrations" -Force | Out-Null
New-Item -ItemType Directory -Path "backend/uploads" -Force | Out-Null
New-Item -ItemType Directory -Path "backend/logs" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/components" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/pages" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/api" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/utils" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/config" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/context" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src/assets" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/public" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/build" -Force | Out-Null
New-Item -ItemType Directory -Path "logs" -Force | Out-Null

Write-Host "📁 Copiando archivos del backend..." -ForegroundColor Yellow

# Copiar archivos principales del backend
if (Test-Path "../backend/package.json") {
    Copy-Item "../backend/package.json" "backend/" -Force
}
if (Test-Path "../backend/src/app.js") {
    Copy-Item "../backend/src/app.js" "backend/src/" -Force
}
if (Test-Path "../backend/src/migrate_barredores_to_catalogo.js") {
    Copy-Item "../backend/src/migrate_barredores_to_catalogo.js" "backend/src/" -Force
}

# Copiar controladores
if (Test-Path "../backend/src/controllers") {
    Copy-Item "../backend/src/controllers/*" "backend/src/controllers/" -Recurse -Force
}

# Copiar modelos
if (Test-Path "../backend/src/models") {
    Copy-Item "../backend/src/models/*" "backend/src/models/" -Recurse -Force
}

# Copiar rutas
if (Test-Path "../backend/src/routes") {
    Copy-Item "../backend/src/routes/*" "backend/src/routes/" -Recurse -Force
}

# Copiar middlewares
if (Test-Path "../backend/src/middlewares") {
    Copy-Item "../backend/src/middlewares/*" "backend/src/middlewares/" -Recurse -Force
}

# Copiar configuraciones
if (Test-Path "../backend/src/config") {
    Copy-Item "../backend/src/config/*" "backend/src/config/" -Recurse -Force
}

# Copiar utilidades
if (Test-Path "../backend/src/utils") {
    Copy-Item "../backend/src/utils/*" "backend/src/utils/" -Recurse -Force
}

# Copiar migraciones
if (Test-Path "../backend/migrations") {
    Copy-Item "../backend/migrations/*" "backend/migrations/" -Recurse -Force
}

# Copiar archivos de configuración del backend
if (Test-Path "../backend/env.production.example") {
    Copy-Item "../backend/env.production.example" "backend/" -Force
}

Write-Host "📁 Copiando archivos del frontend..." -ForegroundColor Yellow

# Copiar archivos principales del frontend
if (Test-Path "../frontend/package.json") {
    Copy-Item "../frontend/package.json" "frontend/" -Force
}
if (Test-Path "../frontend/tailwind.config.js") {
    Copy-Item "../frontend/tailwind.config.js" "frontend/" -Force
}
if (Test-Path "../frontend/postcss.config.js") {
    Copy-Item "../frontend/postcss.config.js" "frontend/" -Force
}

# Copiar archivos de configuración
if (Test-Path "../frontend/nginx.conf") {
    Copy-Item "../frontend/nginx.conf" "frontend/" -Force
}
if (Test-Path "../frontend/Dockerfile") {
    Copy-Item "../frontend/Dockerfile" "frontend/" -Force
}

# Copiar archivos del frontend src
if (Test-Path "../frontend/src/App.js") {
    Copy-Item "../frontend/src/App.js" "frontend/src/" -Force
}
if (Test-Path "../frontend/src/index.js") {
    Copy-Item "../frontend/src/index.js" "frontend/src/" -Force
}
if (Test-Path "../frontend/src/index.css") {
    Copy-Item "../frontend/src/index.css" "frontend/src/" -Force
}
if (Test-Path "../frontend/src/App.css") {
    Copy-Item "../frontend/src/App.css" "frontend/src/" -Force
}
if (Test-Path "../frontend/src/theme.js") {
    Copy-Item "../frontend/src/theme.js" "frontend/src/" -Force
}
if (Test-Path "../frontend/src/setupTests.js") {
    Copy-Item "../frontend/src/setupTests.js" "frontend/src/" -Force
}
if (Test-Path "../frontend/src/reportWebVitals.js") {
    Copy-Item "../frontend/src/reportWebVitals.js" "frontend/src/" -Force
}
if (Test-Path "../frontend/src/App.test.js") {
    Copy-Item "../frontend/src/App.test.js" "frontend/src/" -Force
}
if (Test-Path "../frontend/src/logo.svg") {
    Copy-Item "../frontend/src/logo.svg" "frontend/src/" -Force
}

# Copiar directorios del frontend
if (Test-Path "../frontend/src/components") {
    Copy-Item "../frontend/src/components/*" "frontend/src/components/" -Recurse -Force
}
if (Test-Path "../frontend/src/pages") {
    Copy-Item "../frontend/src/pages/*" "frontend/src/pages/" -Recurse -Force
}
if (Test-Path "../frontend/src/api") {
    Copy-Item "../frontend/src/api/*" "frontend/src/api/" -Recurse -Force
}
if (Test-Path "../frontend/src/utils") {
    Copy-Item "../frontend/src/utils/*" "frontend/src/utils/" -Recurse -Force
}
if (Test-Path "../frontend/src/config") {
    Copy-Item "../frontend/src/config/*" "frontend/src/config/" -Recurse -Force
}
if (Test-Path "../frontend/src/context") {
    Copy-Item "../frontend/src/context/*" "frontend/src/context/" -Recurse -Force
}
if (Test-Path "../frontend/src/assets") {
    Copy-Item "../frontend/src/assets/*" "frontend/src/assets/" -Recurse -Force
}

# Copiar directorio public
if (Test-Path "../frontend/public") {
    Copy-Item "../frontend/public/*" "frontend/public/" -Recurse -Force
}

Write-Host "📁 Copiando archivos de configuración..." -ForegroundColor Yellow

# Copiar archivos de configuración principales
if (Test-Path "../package.json") {
    Copy-Item "../package.json" "./" -Force
}
if (Test-Path "../ecosystem.config.js") {
    Copy-Item "../ecosystem.config.js" "./" -Force
}
if (Test-Path "../deploy.sh") {
    Copy-Item "../deploy.sh" "./" -Force
}
if (Test-Path "../setup-hostinger.sh") {
    Copy-Item "../setup-hostinger.sh" "./" -Force
}
if (Test-Path "../nginx.conf") {
    Copy-Item "../nginx.conf" "./" -Force
}

# Crear archivo .htaccess
$htaccessContent = @"
RewriteEngine On

# Redirigir HTTP a HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Servir archivos estáticos
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Headers de seguridad
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "no-referrer-when-downgrade"

# Cache para archivos estáticos
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>
"@

$htaccessContent | Out-File -FilePath ".htaccess" -Encoding UTF8

# Crear script de inicio
$startAppContent = @"
#!/bin/bash
cd /home/tu-usuario/public_html
pm2 start ecosystem.config.js
pm2 save
pm2 startup
"@

$startAppContent | Out-File -FilePath "start-app.sh" -Encoding UTF8

# Crear script de backup
$backupContent = @"
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/tu-usuario/backups"
mkdir -p $BACKUP_DIR

# Backup de la base de datos
mysqldump -u tu_usuario_mysql -p tu_base_datos > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz uploads/ logs/

# Mantener solo los últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
"@

$backupContent | Out-File -FilePath "backup-db.sh" -Encoding UTF8

# Crear README simple
$readmeContent = "Archivos para Hostinger - Sistema de Extraccion`n`nPasos:`n1. Subir archivos a public_html/`n2. Instalar dependencias: npm install`n3. Configurar .env`n4. Construir frontend: cd frontend && npm run build`n5. Iniciar: pm2 start ecosystem.config.js"
$readmeContent | Out-File -FilePath "README-HOSTING.md" -Encoding UTF8

Write-Host "📦 Comprimiendo archivos..." -ForegroundColor Yellow

# Comprimir todo usando PowerShell
Compress-Archive -Path "*" -DestinationPath "../extraccion-hosting.zip" -Force

Write-Host "✅ ¡Archivos preparados!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Archivos creados en: hosting-files/" -ForegroundColor Cyan
Write-Host "📦 Archivo comprimido: extraccion-hosting.zip" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Subir extraccion-hosting.zip a Hostinger" -ForegroundColor White
Write-Host "2. Extraer en public_html/" -ForegroundColor White
Write-Host "3. Seguir README-HOSTING.md" -ForegroundColor White
Write-Host ""
Write-Host "📊 Tamaño estimado: ~8MB (sin node_modules)" -ForegroundColor Cyan

# Volver al directorio original
Set-Location .. 