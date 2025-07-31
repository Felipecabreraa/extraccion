#!/bin/bash

echo "🔧 Configurando sistema para Hostinger..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [[ ! -f "package.json" ]]; then
    error "Debes ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Crear directorios necesarios
log "📁 Creando directorios necesarios..."
mkdir -p logs
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p frontend/build

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado"
    exit 1
fi

log "✅ Node.js version: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
    exit 1
fi

log "✅ npm version: $(npm --version)"

# Instalar PM2 globalmente si no está instalado
if ! command -v pm2 &> /dev/null; then
    log "📦 Instalando PM2..."
    npm install -g pm2
fi

log "✅ PM2 version: $(pm2 --version)"

# Instalar dependencias
log "📦 Instalando dependencias del proyecto..."
npm install

log "📦 Instalando dependencias del backend..."
cd backend && npm install && cd ..

log "📦 Instalando dependencias del frontend..."
cd frontend && npm install && cd ..

# Construir frontend
log "🔨 Construyendo frontend..."
cd frontend && npm run build && cd ..

# Crear archivo .env de producción si no existe
if [[ ! -f "backend/.env" ]]; then
    log "📝 Creando archivo .env de producción..."
    cp backend/env.production.example backend/.env
    warn "⚠️  IMPORTANTE: Edita backend/.env con tus credenciales de Hostinger"
fi

# Crear archivo .htaccess para redirecciones
log "📝 Creando archivo .htaccess..."
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

# Crear script de inicio automático
log "📝 Creando script de inicio automático..."
cat > start-app.sh << 'EOF'
#!/bin/bash
cd /home/tu-usuario/public_html
pm2 start ecosystem.config.js
pm2 save
pm2 startup
EOF

chmod +x start-app.sh

# Crear script de backup
log "📝 Creando script de backup..."
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

# Crear crontab para backups automáticos
log "📝 Configurando backups automáticos..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/tu-usuario/public_html/backup-db.sh") | crontab -

log "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita backend/.env con tus credenciales de Hostinger"
echo "2. Configura tu dominio en el panel de Hostinger"
echo "3. Crea la base de datos MySQL"
echo "4. Ejecuta: ./deploy.sh"
echo ""
echo "🔧 Comandos útiles:"
echo "   Iniciar app: pm2 start ecosystem.config.js"
echo "   Ver logs: pm2 logs extraccion-backend"
echo "   Monitoreo: pm2 monit"
echo "   Reiniciar: pm2 restart extraccion-backend"
echo "   Backup manual: ./backup-db.sh" 