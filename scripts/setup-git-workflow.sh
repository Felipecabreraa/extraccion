#!/bin/bash

# Script para configurar el flujo de trabajo Git del proyecto
# Autor: Sistema de Extracción
# Fecha: 2024-01-15

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  CONFIGURACIÓN GIT WORKFLOW${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Verificar si estamos en el directorio correcto
check_directory() {
    if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        print_error "Este script debe ejecutarse desde el directorio raíz del proyecto"
        exit 1
    fi
}

# Verificar si Git está instalado
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git no está instalado. Por favor instala Git primero."
        exit 1
    fi
}

# Verificar si el repositorio ya está inicializado
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_warning "Repositorio Git no inicializado. Inicializando..."
        git init
        print_message "Repositorio Git inicializado"
    else
        print_message "Repositorio Git ya está inicializado"
    fi
}

# Configurar .gitignore
setup_gitignore() {
    if [ ! -f ".gitignore" ]; then
        print_error "Archivo .gitignore no encontrado. Asegúrate de que existe."
        exit 1
    fi
    
    print_message "Verificando .gitignore..."
    
    # Verificar que archivos importantes estén en .gitignore
    if ! grep -q "node_modules/" .gitignore; then
        print_warning "node_modules/ no está en .gitignore"
    fi
    
    if ! grep -q ".env" .gitignore; then
        print_warning ".env no está en .gitignore"
    fi
    
    print_message ".gitignore verificado"
}

# Configurar ramas principales
setup_branches() {
    print_message "Configurando ramas principales..."
    
    # Verificar si ya existe la rama main
    if git branch | grep -q "main"; then
        print_message "Rama main ya existe"
    else
        # Renombrar master a main si existe
        if git branch | grep -q "master"; then
            git branch -m master main
            print_message "Rama master renombrada a main"
        else
            # Crear rama main si no existe ninguna
            git checkout -b main
            print_message "Rama main creada"
        fi
    fi
    
    # Crear rama develop si no existe
    if ! git branch | grep -q "develop"; then
        git checkout -b develop
        print_message "Rama develop creada"
    else
        print_message "Rama develop ya existe"
    fi
    
    # Volver a main
    git checkout main
}

# Configurar hooks de Git (opcional)
setup_hooks() {
    print_message "Configurando hooks de Git..."
    
    # Crear directorio hooks si no existe
    mkdir -p .git/hooks
    
    # Hook de pre-commit básico
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "Ejecutando pre-commit hooks..."

# Verificar que no hay archivos .env en el commit
if git diff --cached --name-only | grep -q "\.env$"; then
    echo "ERROR: No se pueden commitear archivos .env"
    echo "Asegúrate de que .env esté en .gitignore"
    exit 1
fi

# Verificar que no hay node_modules en el commit
if git diff --cached --name-only | grep -q "node_modules/"; then
    echo "ERROR: No se pueden commitear node_modules"
    echo "Asegúrate de que node_modules/ esté en .gitignore"
    exit 1
fi

echo "Pre-commit hooks pasaron exitosamente"
EOF

    chmod +x .git/hooks/pre-commit
    print_message "Hook pre-commit configurado"
}

# Configurar alias útiles
setup_aliases() {
    print_message "Configurando alias de Git..."
    
    # Alias para ver el estado de forma más clara
    git config alias.st "status -s"
    
    # Alias para ver el log de forma más clara
    git config alias.lg "log --oneline --graph --decorate"
    
    # Alias para ver las ramas
    git config alias.br "branch -a"
    
    # Alias para hacer un commit con mensaje
    git config alias.cm "commit -m"
    
    # Alias para hacer un commit con todos los cambios
    git config alias.cam "commit -am"
    
    print_message "Alias de Git configurados"
}

# Crear archivo de configuración de Git
create_git_config() {
    print_message "Creando archivo de configuración Git..."
    
    cat > .gitconfig << 'EOF'
[core]
    editor = code --wait
    autocrlf = input
    safecrlf = warn

[init]
    defaultBranch = main

[pull]
    rebase = false

[push]
    default = simple
    autoSetupRemote = true

[merge]
    ff = false

[rebase]
    autoStash = true

[alias]
    st = status -s
    lg = log --oneline --graph --decorate
    br = branch -a
    cm = commit -m
    cam = commit -am
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk

[color]
    ui = auto

[color "branch"]
    current = yellow reverse
    local = yellow
    remote = green

[color "diff"]
    meta = yellow bold
    frag = magenta bold
    old = red bold
    new = green bold

[color "status"]
    added = yellow
    changed = green
    untracked = cyan
EOF

    print_message "Archivo .gitconfig creado"
}

# Crear script de workflow
create_workflow_script() {
    print_message "Creando script de workflow..."
    
    cat > scripts/git-workflow.sh << 'EOF'
#!/bin/bash

# Script de workflow Git para el proyecto
# Uso: ./scripts/git-workflow.sh [comando]

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para crear feature branch
create_feature() {
    if [ -z "$1" ]; then
        print_error "Debes especificar el nombre del feature"
        echo "Uso: $0 feature <nombre-feature>"
        exit 1
    fi
    
    print_message "Creando feature branch: feature/$1"
    
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$1"
    
    print_message "Feature branch creado: feature/$1"
    print_message "Desarrolla tu feature y luego haz push:"
    print_message "git push origin feature/$1"
}

# Función para crear hotfix
create_hotfix() {
    if [ -z "$1" ]; then
        print_error "Debes especificar el nombre del hotfix"
        echo "Uso: $0 hotfix <nombre-hotfix>"
        exit 1
    fi
    
    print_message "Creando hotfix branch: hotfix/$1"
    
    git checkout main
    git pull origin main
    git checkout -b "hotfix/$1"
    
    print_message "Hotfix branch creado: hotfix/$1"
}

# Función para crear release
create_release() {
    if [ -z "$1" ]; then
        print_error "Debes especificar la versión del release"
        echo "Uso: $0 release <version>"
        exit 1
    fi
    
    print_message "Creando release branch: release/$1"
    
    git checkout develop
    git pull origin develop
    git checkout -b "release/$1"
    
    print_message "Release branch creado: release/$1"
    print_message "Actualiza versiones y documentación antes del merge"
}

# Función para completar feature
complete_feature() {
    if [ -z "$1" ]; then
        print_error "Debes especificar el nombre del feature"
        echo "Uso: $0 complete-feature <nombre-feature>"
        exit 1
    fi
    
    print_message "Completando feature: $1"
    
    git checkout develop
    git pull origin develop
    git merge "feature/$1"
    git push origin develop
    git branch -d "feature/$1"
    git push origin --delete "feature/$1"
    
    print_message "Feature $1 completado y eliminado"
}

# Función para completar hotfix
complete_hotfix() {
    if [ -z "$1" ]; then
        print_error "Debes especificar el nombre del hotfix"
        echo "Uso: $0 complete-hotfix <nombre-hotfix> <version>"
        exit 1
    fi
    
    if [ -z "$2" ]; then
        print_error "Debes especificar la versión del tag"
        echo "Uso: $0 complete-hotfix <nombre-hotfix> <version>"
        exit 1
    fi
    
    print_message "Completando hotfix: $1"
    
    git checkout main
    git merge "hotfix/$1"
    git tag -a "v$2" -m "Hotfix v$2"
    git push origin main
    git push origin "v$2"
    
    git checkout develop
    git merge "hotfix/$1"
    git push origin develop
    
    git branch -d "hotfix/$1"
    git push origin --delete "hotfix/$1"
    
    print_message "Hotfix $1 completado y eliminado"
}

# Función para completar release
complete_release() {
    if [ -z "$1" ]; then
        print_error "Debes especificar la versión del release"
        echo "Uso: $0 complete-release <version>"
        exit 1
    fi
    
    print_message "Completando release: v$1"
    
    git checkout main
    git merge "release/$1"
    git tag -a "v$1" -m "Release v$1"
    git push origin main
    git push origin "v$1"
    
    git checkout develop
    git merge "release/$1"
    git push origin develop
    
    git branch -d "release/$1"
    git push origin --delete "release/$1"
    
    print_message "Release v$1 completado y eliminado"
}

# Función para mostrar ayuda
show_help() {
    echo "Script de workflow Git para el proyecto"
    echo ""
    echo "Comandos disponibles:"
    echo "  feature <nombre>           - Crear feature branch"
    echo "  hotfix <nombre>            - Crear hotfix branch"
    echo "  release <version>          - Crear release branch"
    echo "  complete-feature <nombre>  - Completar feature"
    echo "  complete-hotfix <nombre> <version> - Completar hotfix"
    echo "  complete-release <version> - Completar release"
    echo "  help                       - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 feature dashboard-graficos"
    echo "  $0 hotfix fix-login-error"
    echo "  $0 release 1.2.0"
    echo "  $0 complete-feature dashboard-graficos"
    echo "  $0 complete-hotfix fix-login-error 1.2.1"
    echo "  $0 complete-release 1.2.0"
}

# Procesar comandos
case "$1" in
    "feature")
        create_feature "$2"
        ;;
    "hotfix")
        create_hotfix "$2"
        ;;
    "release")
        create_release "$2"
        ;;
    "complete-feature")
        complete_feature "$2"
        ;;
    "complete-hotfix")
        complete_hotfix "$2" "$3"
        ;;
    "complete-release")
        complete_release "$2"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Comando no reconocido: $1"
        show_help
        exit 1
        ;;
esac
EOF

    chmod +x scripts/git-workflow.sh
    print_message "Script de workflow creado: scripts/git-workflow.sh"
}

# Función principal
main() {
    print_header
    
    print_message "Iniciando configuración del flujo de trabajo Git..."
    
    check_directory
    check_git
    check_git_repo
    setup_gitignore
    setup_branches
    setup_hooks
    setup_aliases
    create_git_config
    create_workflow_script
    
    print_message ""
    print_message "✅ Configuración completada exitosamente!"
    print_message ""
    print_message "📋 Próximos pasos:"
    print_message "1. Configura tu usuario de Git:"
    print_message "   git config user.name 'Tu Nombre'"
    print_message "   git config user.email 'tu.email@ejemplo.com'"
    print_message ""
    print_message "2. Agrega un remote origin:"
    print_message "   git remote add origin <url-del-repositorio>"
    print_message ""
    print_message "3. Haz el primer commit:"
    print_message "   git add ."
    print_message "   git commit -m 'feat: configuración inicial del proyecto'"
    print_message "   git push -u origin main"
    print_message "   git push -u origin develop"
    print_message ""
    print_message "4. Usa el script de workflow:"
    print_message "   ./scripts/git-workflow.sh feature mi-nueva-funcionalidad"
    print_message ""
    print_message "📚 Documentación disponible en:"
    print_message "   - docs/ESTRUCTURA_GIT.md"
    print_message "   - README.md"
    print_message "   - CHANGELOG.md"
}

# Ejecutar función principal
main "$@" 