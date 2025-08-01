Write-Host "📦 Preparando archivos para Hostinger..." -ForegroundColor Green

# Crear directorio temporal para archivos de hosting
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
Copy-Item "../backend/package.json" "backend/" -Force
Copy-Item "../backend/src/app.js" "backend/src/" -Force
Copy-Item "../backend/src/migrate_barredores_to_catalogo.js" "backend/src/" -Force

# Copiar controladores
Copy-Item "../backend/src/controllers/*" "backend/src/controllers/" -Recurse -Force

# Copiar modelos
Copy-Item "../backend/src/models/*" "backend/src/models/" -Recurse -Force

# Copiar rutas
Copy-Item "../backend/src/routes/*" "backend/src/routes/" -Recurse -Force

# Copiar middlewares
Copy-Item "../backend/src/middlewares/*" "backend/src/middlewares/" -Recurse -Force

# Copiar configuraciones
Copy-Item "../backend/src/config/*" "backend/src/config/" -Recurse -Force

# Copiar utilidades
Copy-Item "../backend/src/utils/*" "backend/src/utils/" -Recurse -Force

# Copiar migraciones
Copy-Item "../backend/migrations/*" "backend/migrations/" -Recurse -Force

# Copiar archivos de configuración del backend
Copy-Item "../backend/env.production.example" "backend/" -Force

Write-Host "📁 Copiando archivos del frontend..." -ForegroundColor Yellow

# Copiar archivos principales del frontend
Copy-Item "../frontend/package.json" "frontend/" -Force
Copy-Item "../frontend/tailwind.config.js" "frontend/" -Force
Copy-Item "../frontend/postcss.config.js" "frontend/" -Force

# Copiar archivos de configuración
Copy-Item "../frontend/nginx.conf" "frontend/" -Force
Copy-Item "../frontend/Dockerfile" "frontend/" -Force

# Copiar archivos del frontend src
Copy-Item "../frontend/src/App.js" "frontend/src/" -Force
Copy-Item "../frontend/src/index.js" "frontend/src/" -Force
Copy-Item "../frontend/src/index.css" "frontend/src/" -Force
Copy-Item "../frontend/src/App.css" "frontend/src/" -Force
Copy-Item "../frontend/src/theme.js" "frontend/src/" -Force
Copy-Item "../frontend/src/setupTests.js" "frontend/src/" -Force
Copy-Item "../frontend/src/reportWebVitals.js" "frontend/src/" -Force
Copy-Item "../frontend/src/App.test.js" "frontend/src/" -Force
Copy-Item "../frontend/src/logo.svg" "frontend/src/" -Force

# Copiar directorios del frontend
Copy-Item "../frontend/src/components/*" "frontend/src/components/" -Recurse -Force
Copy-Item "../frontend/src/pages/*" "frontend/src/pages/" -Recurse -Force
Copy-Item "../frontend/src/api/*" "frontend/src/api/" -Recurse -Force
Copy-Item "../frontend/src/utils/*" "frontend/src/utils/" -Recurse -Force
Copy-Item "../frontend/src/config/*" "frontend/src/config/" -Recurse -Force
Copy-Item "../frontend/src/context/*" "frontend/src/context/" -Recurse -Force
Copy-Item "../frontend/src/assets/*" "frontend/src/assets/" -Recurse -Force

# Copiar directorio public
Copy-Item "../frontend/public/*" "frontend/public/" -Recurse -Force

Write-Host "📁 Copiando archivos de configuración..." -ForegroundColor Yellow

# Copiar archivos de configuración principales
Copy-Item "../package.json" "./" -Force
Copy-Item "../ecosystem.config.js" "./" -Force
Copy-Item "../deploy.sh" "./" -Force
Copy-Item "../setup-hostinger.sh" "./" -Force
Copy-Item "../nginx.conf" "./" -Force

# Crear archivo .htaccess
@"
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
"@ | Out-File -FilePath ".htaccess" -Encoding UTF8

# Crear script de inicio
@"
#!/bin/bash
cd /home/tu-usuario/public_html
pm2 start ecosystem.config.js
pm2 save
pm2 startup
"@ | Out-File -FilePath "start-app.sh" -Encoding UTF8

# Crear script de backup
@"
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
"@ | Out-File -FilePath "backup-db.sh" -Encoding UTF8

Write-Host "📋 Creando archivo README para hosting..." -ForegroundColor Yellow

# Crear README para hosting
$readmeContent = @"
# Archivos para Hostinger

## Estructura de Archivos

hosting-files/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── config/
│   │   ├── utils/
│   │   └── app.js
│   ├── migrations/
│   ├── uploads/
│   ├── logs/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── utils/
│   │   ├── config/
│   │   ├── context/
│   │   ├── assets/
│   │   └── App.js
│   ├── public/
│   ├── build/
│   └── package.json
├── logs/
├── ecosystem.config.js
├── deploy.sh
├── setup-hostinger.sh
├── nginx.conf
├── .htaccess
├── start-app.sh
├── backup-db.sh
└── package.json

## Pasos para Desplegar

### 1. Subir Archivos
* Subir todo el contenido de hosting-files/ a public_html/ en Hostinger
* Mantener la estructura de carpetas

### 2. Configurar Base de Datos
* Crear base de datos MySQL en Hostinger
* Copiar backend/env.production.example a backend/.env
* Editar backend/.env con credenciales reales

### 3. Instalar Dependencias
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

### 4. Construir Frontend
cd frontend && npm run build && cd ..

### 5. Iniciar Aplicación
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

## Archivos Incluidos

### Backend
* Controladores completos
* Modelos de base de datos
* Rutas de API
* Middlewares de autenticación
* Configuraciones
* Migraciones
* Utilidades

### Frontend
* Componentes React
* Páginas principales
* Configuración de API
* Utilidades
* Assets y estilos
* Configuración de Tailwind

### Configuración
* PM2 ecosystem
* Scripts de despliegue
* Configuración Nginx
* Headers de seguridad
* Scripts de backup

## Archivos Excluidos

### No Incluidos (No necesarios en producción)
* node_modules/ (se instalan en el servidor)
* Archivos de desarrollo
* Archivos de prueba
* Documentación
* Archivos temporales
* Logs locales

## Tamaño Estimado
* Backend: ~2MB
* Frontend: ~5MB
* Configuración: ~1MB
* Total: ~8MB (sin node_modules)

## Comandos Post-Despliegue

# Verificar estado
pm2 status

# Ver logs
pm2 logs extraccion-backend

# Reiniciar
pm2 restart extraccion-backend

# Backup
./backup-db.sh
"@

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
Set-Location ".." 