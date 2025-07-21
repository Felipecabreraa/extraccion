#!/bin/bash

# Script de despliegue para el sistema de extracción
# Uso: ./deploy.sh [production|staging]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Verificar argumentos
ENVIRONMENT=${1:-production}
if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "staging" ]]; then
    error "Ambiente debe ser 'production' o 'staging'"
    exit 1
fi

log "🚀 Iniciando despliegue en ambiente: $ENVIRONMENT"

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado"
    exit 1
fi

# Verificar archivo de variables de entorno
if [[ ! -f ".env.$ENVIRONMENT" ]]; then
    error "Archivo .env.$ENVIRONMENT no encontrado"
    log "Copia env.production.example a .env.$ENVIRONMENT y configura las variables"
    exit 1
fi

# Crear directorios necesarios
log "📁 Creando directorios necesarios..."
mkdir -p backend/logs
mkdir -p nginx/logs
mkdir -p nginx/ssl

# Backup de la base de datos existente (si existe)
if docker ps -q -f name=extraccion_mysql | grep -q .; then
    log "💾 Creando backup de la base de datos..."
    docker exec extraccion_mysql mysqldump -u root -p"$DB_ROOT_PASSWORD" "$DB_NAME" > "backup_$(date +%Y%m%d_%H%M%S).sql" 2>/dev/null || warn "No se pudo crear backup"
fi

# Detener servicios existentes
log "🛑 Deteniendo servicios existentes..."
docker-compose down --remove-orphans

# Limpiar imágenes no utilizadas
log "🧹 Limpiando imágenes no utilizadas..."
docker image prune -f

# Construir y levantar servicios
log "🔨 Construyendo y levantando servicios..."
docker-compose --env-file ".env.$ENVIRONMENT" up -d --build

# Esperar a que los servicios estén listos
log "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los servicios
log "🔍 Verificando estado de los servicios..."

# Verificar MySQL
if docker exec extraccion_mysql mysqladmin ping -h localhost --silent; then
    log "✅ MySQL está funcionando"
else
    error "❌ MySQL no está funcionando"
    exit 1
fi

# Verificar Backend
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    log "✅ Backend está funcionando"
else
    error "❌ Backend no está funcionando"
    exit 1
fi

# Verificar Frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    log "✅ Frontend está funcionando"
else
    error "❌ Frontend no está funcionando"
    exit 1
fi

# Ejecutar migraciones si es necesario
log "🔄 Ejecutando migraciones..."
docker exec extraccion_backend npm run migrate 2>/dev/null || warn "No se encontraron migraciones para ejecutar"

# Mostrar información del despliegue
log "🎉 ¡Despliegue completado exitosamente!"
echo ""
echo -e "${BLUE}📊 Información del sistema:${NC}"
echo -e "   Frontend: http://localhost:80"
echo -e "   Backend API: http://localhost:3001"
echo -e "   Health Check: http://localhost:3001/api/health"
echo ""
echo -e "${BLUE}🔧 Comandos útiles:${NC}"
echo -e "   Ver logs: docker-compose logs -f"
echo -e "   Ver logs específicos: docker-compose logs -f [servicio]"
echo -e "   Detener: docker-compose down"
echo -e "   Reiniciar: docker-compose restart"
echo ""
echo -e "${YELLOW}⚠️  Recuerda:${NC}"
echo -e "   - Configurar SSL/HTTPS para producción"
echo -e "   - Configurar backup automático de la base de datos"
echo -e "   - Configurar monitoreo y alertas"
echo -e "   - Revisar logs regularmente" 