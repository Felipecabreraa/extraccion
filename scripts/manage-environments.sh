#!/bin/bash

# Script para manejar entornos de desarrollo
# Autor: Felipecabreraa

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}🛠️ Gestor de Entornos - EXTRACCION${NC}"
    echo ""
    echo "Uso: $0 [comando] [opciones]"
    echo ""
    echo "Comandos disponibles:"
    echo "  dev          - Iniciar entorno de desarrollo"
    echo "  staging      - Iniciar entorno de staging"
    echo "  prod         - Iniciar entorno de producción"
    echo "  setup        - Configurar entornos"
    echo "  backup       - Crear backup de la base de datos"
    echo "  restore      - Restaurar backup de la base de datos"
    echo "  migrate      - Ejecutar migraciones"
    echo "  test         - Ejecutar tests"
    echo "  clean        - Limpiar archivos temporales"
    echo "  help         - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 dev"
    echo "  $0 setup"
    echo "  $0 migrate dev"
}

# Función para configurar entornos
setup_environments() {
    echo -e "${BLUE}⚙️ Configurando entornos...${NC}"
    
    # Crear directorios de uploads
    mkdir -p backend/uploads/development
    mkdir -p backend/uploads/staging
    mkdir -p backend/uploads/production
    
    # Crear archivos .env si no existen
    if [ ! -f "backend/.env.development" ]; then
        echo -e "${YELLOW}📝 Creando .env.development...${NC}"
        cp backend/env.development.example backend/.env.development
        echo -e "${GREEN}✅ Archivo .env.development creado${NC}"
        echo -e "${YELLOW}⚠️ Edita backend/.env.development con tus configuraciones${NC}"
    fi
    
    if [ ! -f "backend/.env.staging" ]; then
        echo -e "${YELLOW}📝 Creando .env.staging...${NC}"
        cp backend/env.staging.example backend/.env.staging
        echo -e "${GREEN}✅ Archivo .env.staging creado${NC}"
        echo -e "${YELLOW}⚠️ Edita backend/.env.staging con tus configuraciones${NC}"
    fi
    
    if [ ! -f "backend/.env.production" ]; then
        echo -e "${YELLOW}📝 Creando .env.production...${NC}"
        cp backend/env.production.example backend/.env.production
        echo -e "${GREEN}✅ Archivo .env.production creado${NC}"
        echo -e "${YELLOW}⚠️ Edita backend/.env.production con tus configuraciones${NC}"
    fi
    
    # Instalar dependencias
    echo -e "${BLUE}📦 Instalando dependencias...${NC}"
    cd backend && npm install && cd ..
    cd frontend && npm install && cd ..
    
    echo -e "${GREEN}✅ Configuración de entornos completada${NC}"
}

# Función para iniciar entorno de desarrollo
start_dev() {
    echo -e "${BLUE}🚀 Iniciando entorno de desarrollo...${NC}"
    
    # Verificar que existe el archivo .env.development
    if [ ! -f "backend/.env.development" ]; then
        echo -e "${RED}❌ Error: No se encontró backend/.env.development${NC}"
        echo -e "${YELLOW}Ejecuta: $0 setup${NC}"
        exit 1
    fi
    
    # Iniciar backend en desarrollo
    echo -e "${GREEN}🔧 Iniciando backend en modo desarrollo...${NC}"
    cd backend
    NODE_ENV=development npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Esperar un momento para que el backend inicie
    sleep 3
    
    # Iniciar frontend
    echo -e "${GREEN}🎨 Iniciando frontend...${NC}"
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    echo -e "${GREEN}✅ Entorno de desarrollo iniciado${NC}"
    echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:3001${NC}"
    echo ""
    echo -e "${YELLOW}Presiona Ctrl+C para detener${NC}"
    
    # Función para limpiar al salir
    cleanup() {
        echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
        kill $BACKEND_PID 2>/dev/null
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Servicios detenidos${NC}"
        exit 0
    }
    
    # Capturar Ctrl+C
    trap cleanup SIGINT
    
    # Mantener el script corriendo
    wait
}

# Función para iniciar entorno de staging
start_staging() {
    echo -e "${BLUE}🚀 Iniciando entorno de staging...${NC}"
    
    if [ ! -f "backend/.env.staging" ]; then
        echo -e "${RED}❌ Error: No se encontró backend/.env.staging${NC}"
        echo -e "${YELLOW}Ejecuta: $0 setup${NC}"
        exit 1
    fi
    
    cd backend
    NODE_ENV=staging npm run staging &
    BACKEND_PID=$!
    cd ..
    
    echo -e "${GREEN}✅ Entorno de staging iniciado${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:3001${NC}"
    
    cleanup() {
        echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Servicios detenidos${NC}"
        exit 0
    }
    
    trap cleanup SIGINT
    wait
}

# Función para iniciar entorno de producción
start_prod() {
    echo -e "${BLUE}🚀 Iniciando entorno de producción...${NC}"
    
    if [ ! -f "backend/.env.production" ]; then
        echo -e "${RED}❌ Error: No se encontró backend/.env.production${NC}"
        echo -e "${YELLOW}Ejecuta: $0 setup${NC}"
        exit 1
    fi
    
    # Build del frontend
    echo -e "${BLUE}🔨 Construyendo frontend...${NC}"
    cd frontend
    npm run build
    cd ..
    
    # Iniciar backend en producción
    cd backend
    NODE_ENV=production npm run prod &
    BACKEND_PID=$!
    cd ..
    
    echo -e "${GREEN}✅ Entorno de producción iniciado${NC}"
    echo -e "${BLUE}🔧 Backend: http://localhost:3001${NC}"
    
    cleanup() {
        echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Servicios detenidos${NC}"
        exit 0
    }
    
    trap cleanup SIGINT
    wait
}

# Función para ejecutar migraciones
run_migrations() {
    local env=${1:-development}
    echo -e "${BLUE}🔄 Ejecutando migraciones en entorno: $env${NC}"
    
    cd backend
    NODE_ENV=$env npm run db:migrate:$env
    cd ..
    
    echo -e "${GREEN}✅ Migraciones completadas${NC}"
}

# Función para ejecutar tests
run_tests() {
    local env=${1:-development}
    echo -e "${BLUE}🧪 Ejecutando tests en entorno: $env${NC}"
    
    cd backend
    NODE_ENV=$env npm run test:$env
    cd ..
    
    cd frontend
    npm test -- --watchAll=false
    cd ..
    
    echo -e "${GREEN}✅ Tests completados${NC}"
}

# Función para limpiar archivos temporales
clean_files() {
    echo -e "${BLUE}🧹 Limpiando archivos temporales...${NC}"
    
    # Limpiar node_modules (opcional)
    read -p "¿Deseas eliminar node_modules? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf backend/node_modules
        rm -rf frontend/node_modules
        echo -e "${GREEN}✅ node_modules eliminados${NC}"
    fi
    
    # Limpiar archivos de build
    rm -rf frontend/build
    rm -rf backend/uploads/*
    
    # Limpiar logs
    rm -rf backend/logs/*
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Función para backup de base de datos
backup_database() {
    local env=${1:-development}
    echo -e "${BLUE}💾 Creando backup de base de datos ($env)...${NC}"
    
    # Crear directorio de backups si no existe
    mkdir -p backups
    
    # Obtener configuración de la base de datos
    source backend/.env.$env
    
    # Crear backup
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="backups/backup_${env}_${timestamp}.sql"
    
    mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > $backup_file
    
    echo -e "${GREEN}✅ Backup creado: $backup_file${NC}"
}

# Función para restaurar backup
restore_database() {
    local backup_file=$1
    local env=${2:-development}
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ Error: Debes especificar el archivo de backup${NC}"
        echo "Uso: $0 restore archivo_backup.sql [entorno]"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ Error: Archivo de backup no encontrado: $backup_file${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Restaurando backup: $backup_file${NC}"
    
    source backend/.env.$env
    
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < $backup_file
    
    echo -e "${GREEN}✅ Backup restaurado${NC}"
}

# Procesar comandos
case "$1" in
    "dev")
        start_dev
        ;;
    "staging")
        start_staging
        ;;
    "prod")
        start_prod
        ;;
    "setup")
        setup_environments
        ;;
    "migrate")
        run_migrations $2
        ;;
    "test")
        run_tests $2
        ;;
    "clean")
        clean_files
        ;;
    "backup")
        backup_database $2
        ;;
    "restore")
        restore_database $2 $3
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando no reconocido: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac 