#!/bin/bash

echo "📦 Preparando archivos para Hostinger..."

# Crear directorio temporal para archivos de hosting
mkdir -p hosting-files
cd hosting-files

# Crear estructura de directorios
mkdir -p backend/src/{controllers,models,routes,middlewares,config,utils}
mkdir -p backend/migrations
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p frontend/src/{components,pages,api,utils,config,context,assets}
mkdir -p frontend/public
mkdir -p frontend/build
mkdir -p logs

echo "📁 Copiando archivos del backend..."

# Copiar archivos principales del backend
cp ../backend/package.json backend/
cp ../backend/src/app.js backend/src/
cp ../backend/src/migrate_barredores_to_catalogo.js backend/src/

# Copiar controladores
cp -r ../backend/src/controllers/* backend/src/controllers/

# Copiar modelos
cp -r ../backend/src/models/* backend/src/models/

# Copiar rutas
cp -r ../backend/src/routes/* backend/src/routes/

# Copiar middlewares
cp -r ../backend/src/middlewares/* backend/src/middlewares/

# Copiar configuraciones
cp -r ../backend/src/config/* backend/src/config/

# Copiar utilidades
cp -r ../backend/src/utils/* backend/src/utils/

# Copiar migraciones
cp -r ../backend/migrations/* backend/migrations/

# Copiar archivos de configuración del backend
cp ../backend/env.production.example backend/

echo "📁 Copiando archivos del frontend..."

# Copiar archivos principales del frontend
cp ../frontend/package.json frontend/
cp ../frontend/tailwind.config.js frontend/
cp ../frontend/postcss.config.js frontend/

# Copiar archivos de configuración
cp ../frontend/nginx.conf frontend/
cp ../frontend/Dockerfile frontend/

# Copiar archivos del frontend src
cp ../frontend/src/App.js frontend/src/
cp ../frontend/src/index.js frontend/src/
cp ../frontend/src/index.css frontend/src/
cp ../frontend/src/App.css frontend/src/
cp ../frontend/src/theme.js frontend/src/
cp ../frontend/src/setupTests.js frontend/src/
cp ../frontend/src/reportWebVitals.js frontend/src/
cp ../frontend/src/App.test.js frontend/src/
cp ../frontend/src/logo.svg frontend/src/

# Copiar directorios del frontend
cp -r ../frontend/src/components/* frontend/src/components/
cp -r ../frontend/src/pages/* frontend/src/pages/
cp -r ../frontend/src/api/* frontend/src/api/
cp -r ../frontend/src/utils/* frontend/src/utils/
cp -r ../frontend/src/config/* frontend/src/config/
cp -r ../frontend/src/context/* frontend/src/context/
cp -r ../frontend/src/assets/* frontend/src/assets/

# Copiar directorio public
cp -r ../frontend/public/* frontend/public/

echo "📁 Copiando archivos de configuración..."

# Copiar archivos de configuración principales
cp ../package.json ./
cp ../ecosystem.config.js ./
cp ../deploy.sh ./
cp ../setup-hostinger.sh ./
cp ../nginx.conf ./

# Crear archivo .htaccess
cat > .htaccess << 'EOF'
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
EOF

# Crear script de inicio
cat > start-app.sh << 'EOF'
#!/bin/bash
cd /home/tu-usuario/public_html
pm2 start ecosystem.config.js
pm2 save
pm2 startup
EOF

chmod +x start-app.sh

# Crear script de backup
cat > backup-db.sh << 'EOF'
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
EOF

chmod +x backup-db.sh

echo "📋 Creando archivo README para hosting..."

# Crear README para hosting
cat > README-HOSTING.md << 'EOF'
# 🚀 Archivos para Hostinger

## 📁 Estructura de Archivos

```
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
```

## 🚀 Pasos para Desplegar

### 1. Subir Archivos
- Subir todo el contenido de `hosting-files/` a `public_html/` en Hostinger
- Mantener la estructura de carpetas

### 2. Configurar Base de Datos
- Crear base de datos MySQL en Hostinger
- Copiar `backend/env.production.example` a `backend/.env`
- Editar `backend/.env` con credenciales reales

### 3. Instalar Dependencias
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 4. Construir Frontend
```bash
cd frontend && npm run build && cd ..
```

### 5. Iniciar Aplicación
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📋 Archivos Incluidos

### ✅ Backend
- ✅ Controladores completos
- ✅ Modelos de base de datos
- ✅ Rutas de API
- ✅ Middlewares de autenticación
- ✅ Configuraciones
- ✅ Migraciones
- ✅ Utilidades

### ✅ Frontend
- ✅ Componentes React
- ✅ Páginas principales
- ✅ Configuración de API
- ✅ Utilidades
- ✅ Assets y estilos
- ✅ Configuración de Tailwind

### ✅ Configuración
- ✅ PM2 ecosystem
- ✅ Scripts de despliegue
- ✅ Configuración Nginx
- ✅ Headers de seguridad
- ✅ Scripts de backup

## 🚨 Archivos Excluidos

### ❌ No Incluidos (No necesarios en producción)
- ❌ `node_modules/` (se instalan en el servidor)
- ❌ Archivos de desarrollo
- ❌ Archivos de prueba
- ❌ Documentación
- ❌ Archivos temporales
- ❌ Logs locales

## 📊 Tamaño Estimado
- Backend: ~2MB
- Frontend: ~5MB
- Configuración: ~1MB
- **Total: ~8MB** (sin node_modules)

## 🔧 Comandos Post-Despliegue

```bash
# Verificar estado
pm2 status

# Ver logs
pm2 logs extraccion-backend

# Reiniciar
pm2 restart extraccion-backend

# Backup
./backup-db.sh
```
EOF

echo "📦 Comprimiendo archivos..."

# Comprimir todo
tar -czf ../extraccion-hosting.tar.gz .

echo "✅ ¡Archivos preparados!"
echo ""
echo "📁 Archivos creados en: hosting-files/"
echo "📦 Archivo comprimido: extraccion-hosting.tar.gz"
echo ""
echo "📋 Próximos pasos:"
echo "1. Subir extraccion-hosting.tar.gz a Hostinger"
echo "2. Extraer en public_html/"
echo "3. Seguir README-HOSTING.md"
echo ""
echo "📊 Tamaño estimado: ~8MB (sin node_modules)" 