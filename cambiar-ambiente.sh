#!/bin/bash

# Colores para la consola
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_color() {
    echo -e "${2}${1}${NC}"
}

# Función para mostrar ayuda
show_help() {
    print_color "\n🚀 CAMBIADOR DE AMBIENTE" "$BLUE"
    print_color "========================\n" "$BLUE"
    print_color "Uso: $0 [development|staging|production|check|help]" "$CYAN"
    print_color "\nOpciones:" "$YELLOW"
    print_color "  development  - Cambiar a ambiente de desarrollo" "$GREEN"
    print_color "  staging      - Cambiar a ambiente de pruebas" "$GREEN"
    print_color "  production   - Cambiar a ambiente de producción" "$GREEN"
    print_color "  check        - Verificar configuración actual" "$GREEN"
    print_color "  help         - Mostrar esta ayuda" "$GREEN"
    print_color "\nEjemplos:" "$YELLOW"
    print_color "  $0 development" "$CYAN"
    print_color "  $0 production" "$CYAN"
    print_color "  $0 check" "$CYAN"
}

# Función para verificar si existe un archivo
check_file() {
    if [ -f "$1" ]; then
        return 0
    else
        return 1
    fi
}

# Función para cambiar ambiente
change_environment() {
    local env=$1
    
    print_color "\n🔧 Cambiando a ambiente: $env" "$MAGENTA"
    print_color "================================\n" "$MAGENTA"
    
    # Verificar que el ambiente es válido
    case $env in
        development|staging|production)
            ;;
        *)
            print_color "❌ Ambiente inválido: $env" "$RED"
            print_color "Ambientes válidos: development, staging, production" "$YELLOW"
            exit 1
            ;;
    esac
    
    # Cambiar backend
    local backend_source="backend/.env.$env"
    local backend_target="backend/.env"
    
    if check_file "$backend_source"; then
        cp "$backend_source" "$backend_target"
        print_color "✅ Backend configurado para $env" "$GREEN"
    else
        print_color "❌ Archivo no encontrado: $backend_source" "$RED"
        print_color "Ejecuta primero: node configurar-variables-entorno.js" "$YELLOW"
        exit 1
    fi
    
    # Cambiar frontend
    local frontend_source="frontend/.env.$env"
    local frontend_target="frontend/.env"
    
    if check_file "$frontend_source"; then
        cp "$frontend_source" "$frontend_target"
        print_color "✅ Frontend configurado para $env" "$GREEN"
    else
        print_color "❌ Archivo no encontrado: $frontend_source" "$RED"
        print_color "Ejecuta primero: node configurar-variables-entorno.js" "$YELLOW"
        exit 1
    fi
    
    print_color "\n🎉 Ambiente cambiado exitosamente a: $env" "$GREEN"
    
    # Mostrar información del ambiente
    print_color "\n📋 Información del ambiente:" "$CYAN"
    case $env in
        development)
            print_color "  • Base de datos: Local (localhost)" "$YELLOW"
            print_color "  • Backend: http://localhost:3001" "$YELLOW"
            print_color "  • Frontend: http://localhost:3000" "$YELLOW"
            ;;
        staging)
            print_color "  • Base de datos: Staging (trn.cl)" "$YELLOW"
            print_color "  • Backend: https://backend-staging.up.railway.app" "$YELLOW"
            print_color "  • Frontend: https://frontend-staging.vercel.app" "$YELLOW"
            ;;
        production)
            print_color "  • Base de datos: Producción (trn.cl)" "$YELLOW"
            print_color "  • Backend: https://backend-production.up.railway.app" "$YELLOW"
            print_color "  • Frontend: https://frontend-production.vercel.app" "$YELLOW"
            ;;
    esac
    
    print_color "\n🚀 Para ejecutar el proyecto:" "$BLUE"
    print_color "  Backend:  cd backend && npm start" "$CYAN"
    print_color "  Frontend: cd frontend && npm start" "$CYAN"
}

# Función para verificar configuración actual
check_current_config() {
    print_color "\n🔍 VERIFICANDO CONFIGURACIÓN ACTUAL" "$BLUE"
    print_color "==================================\n" "$BLUE"
    
    # Verificar backend
    print_color "📁 Backend:" "$CYAN"
    if check_file "backend/.env"; then
        print_color "  ✅ Archivo .env encontrado" "$GREEN"
        
        # Mostrar algunas variables importantes
        if command -v grep >/dev/null 2>&1; then
            print_color "  📋 Variables principales:" "$YELLOW"
            grep -E "^(NODE_ENV|PORT|DB_HOST|DB_NAME|JWT_SECRET)=" backend/.env | while read line; do
                # Ocultar valores sensibles
                if [[ $line == *"JWT_SECRET"* ]]; then
                    key=$(echo "$line" | cut -d'=' -f1)
                    print_color "    $key=***oculto***" "$YELLOW"
                else
                    print_color "    $line" "$YELLOW"
                fi
            done
        fi
    else
        print_color "  ❌ Archivo .env no encontrado" "$RED"
    fi
    
    # Verificar frontend
    print_color "\n📁 Frontend:" "$CYAN"
    if check_file "frontend/.env"; then
        print_color "  ✅ Archivo .env encontrado" "$GREEN"
        
        # Mostrar variables del frontend
        if command -v grep >/dev/null 2>&1; then
            print_color "  📋 Variables principales:" "$YELLOW"
            grep -E "^(REACT_APP_API_URL|REACT_APP_ENV|REACT_APP_VERSION)=" frontend/.env | while read line; do
                print_color "    $line" "$YELLOW"
            done
        fi
    else
        print_color "  ❌ Archivo .env no encontrado" "$RED"
    fi
    
    # Verificar archivos de ambiente disponibles
    print_color "\n📁 Archivos de ambiente disponibles:" "$CYAN"
    
    print_color "  Backend:" "$YELLOW"
    for env in development staging production; do
        if check_file "backend/.env.$env"; then
            print_color "    ✅ .env.$env" "$GREEN"
        else
            print_color "    ❌ .env.$env" "$RED"
        fi
    done
    
    print_color "  Frontend:" "$YELLOW"
    for env in development staging production; do
        if check_file "frontend/.env.$env"; then
            print_color "    ✅ .env.$env" "$GREEN"
        else
            print_color "    ❌ .env.$env" "$RED"
        fi
    done
    
    print_color "\n💡 Para configurar archivos faltantes:" "$BLUE"
    print_color "  node configurar-variables-entorno.js" "$CYAN"
}

# Función principal
main() {
    case $1 in
        development|staging|production)
            change_environment $1
            ;;
        check)
            check_current_config
            ;;
        help|--help|-h)
            show_help
            ;;
        "")
            print_color "❌ Debes especificar un ambiente" "$RED"
            print_color "Uso: $0 [development|staging|production|check|help]" "$YELLOW"
            exit 1
            ;;
        *)
            print_color "❌ Opción inválida: $1" "$RED"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@" 