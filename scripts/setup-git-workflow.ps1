# Script para configurar el flujo de trabajo Git del proyecto en Windows
# Autor: Sistema de Extracción
# Fecha: 2024-01-15

# Configurar para salir en caso de error
$ErrorActionPreference = "Stop"

# Colores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Función para imprimir mensajes
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Write-Header {
    Write-Host "=================================" -ForegroundColor $Blue
    Write-Host "  CONFIGURACIÓN GIT WORKFLOW" -ForegroundColor $Blue
    Write-Host "=================================" -ForegroundColor $Blue
}

# Verificar si estamos en el directorio correcto
function Test-Directory {
    if (-not (Test-Path "package.json") -or -not (Test-Path "backend") -or -not (Test-Path "frontend")) {
        Write-Error "Este script debe ejecutarse desde el directorio raíz del proyecto"
        exit 1
    }
}

# Verificar si Git está instalado
function Test-Git {
    try {
        git --version | Out-Null
        Write-Info "Git está instalado"
    }
    catch {
        Write-Error "Git no está instalado. Por favor instala Git primero."
        exit 1
    }
}

# Verificar si el repositorio ya está inicializado
function Test-GitRepo {
    if (-not (Test-Path ".git")) {
        Write-Warning "Repositorio Git no inicializado. Inicializando..."
        git init
        Write-Info "Repositorio Git inicializado"
    }
    else {
        Write-Info "Repositorio Git ya está inicializado"
    }
}

# Configurar .gitignore
function Test-Gitignore {
    if (-not (Test-Path ".gitignore")) {
        Write-Error "Archivo .gitignore no encontrado. Asegúrate de que existe."
        exit 1
    }
    
    Write-Info "Verificando .gitignore..."
    
    $gitignoreContent = Get-Content ".gitignore" -Raw
    
    if ($gitignoreContent -notmatch "node_modules/") {
        Write-Warning "node_modules/ no está en .gitignore"
    }
    
    if ($gitignoreContent -notmatch "\.env") {
        Write-Warning ".env no está en .gitignore"
    }
    
    Write-Info ".gitignore verificado"
}

# Configurar ramas principales
function Set-Branches {
    Write-Info "Configurando ramas principales..."
    
    # Verificar si ya existe la rama main
    $branches = git branch --format="%(refname:short)"
    
    if ($branches -contains "main") {
        Write-Info "Rama main ya existe"
    }
    else {
        # Renombrar master a main si existe
        if ($branches -contains "master") {
            git branch -m master main
            Write-Info "Rama master renombrada a main"
        }
        else {
            # Crear rama main si no existe ninguna
            git checkout -b main
            Write-Info "Rama main creada"
        }
    }
    
    # Crear rama develop si no existe
    if ($branches -notcontains "develop") {
        git checkout -b develop
        Write-Info "Rama develop creada"
    }
    else {
        Write-Info "Rama develop ya existe"
    }
    
    # Volver a main
    git checkout main
}

# Configurar hooks de Git (opcional)
function Set-Hooks {
    Write-Info "Configurando hooks de Git..."
    
    # Crear directorio hooks si no existe
    if (-not (Test-Path ".git/hooks")) {
        New-Item -ItemType Directory -Path ".git/hooks" -Force | Out-Null
    }
    
    # Hook de pre-commit básico
    $preCommitContent = @"
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
"@

    Set-Content -Path ".git/hooks/pre-commit" -Value $preCommitContent
    Write-Info "Hook pre-commit configurado"
}

# Configurar alias útiles
function Set-Aliases {
    Write-Info "Configurando alias de Git..."
    
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
    
    Write-Info "Alias de Git configurados"
}

# Crear archivo de configuración de Git
function New-GitConfig {
    Write-Info "Creando archivo de configuración Git..."
    
    $gitConfigContent = @"
[core]
    editor = code --wait
    autocrlf = true
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
"@

    Set-Content -Path ".gitconfig" -Value $gitConfigContent
    Write-Info "Archivo .gitconfig creado"
}

# Crear script de workflow para Windows
function New-WorkflowScript {
    Write-Info "Creando script de workflow para Windows..."
    
    $workflowContent = @"
# Script de workflow Git para el proyecto en Windows
# Uso: .\scripts\git-workflow.ps1 [comando]

param(
    [Parameter(Mandatory=$false)]
    [string]$Command,
    
    [Parameter(Mandatory=$false)]
    [string]$Name,
    
    [Parameter(Mandatory=$false)]
    [string]$Version
)

# Colores
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Función para crear feature branch
function New-Feature {
    param([string]$FeatureName)
    
    if (-not $FeatureName) {
        Write-Error "Debes especificar el nombre del feature"
        Write-Host "Uso: .\git-workflow.ps1 feature <nombre-feature>"
        exit 1
    }
    
    Write-Info "Creando feature branch: feature/$FeatureName"
    
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$FeatureName"
    
    Write-Info "Feature branch creado: feature/$FeatureName"
    Write-Info "Desarrolla tu feature y luego haz push:"
    Write-Info "git push origin feature/$FeatureName"
}

# Función para crear hotfix
function New-Hotfix {
    param([string]$HotfixName)
    
    if (-not $HotfixName) {
        Write-Error "Debes especificar el nombre del hotfix"
        Write-Host "Uso: .\git-workflow.ps1 hotfix <nombre-hotfix>"
        exit 1
    }
    
    Write-Info "Creando hotfix branch: hotfix/$HotfixName"
    
    git checkout main
    git pull origin main
    git checkout -b "hotfix/$HotfixName"
    
    Write-Info "Hotfix branch creado: hotfix/$HotfixName"
}

# Función para crear release
function New-Release {
    param([string]$ReleaseVersion)
    
    if (-not $ReleaseVersion) {
        Write-Error "Debes especificar la versión del release"
        Write-Host "Uso: .\git-workflow.ps1 release <version>"
        exit 1
    }
    
    Write-Info "Creando release branch: release/$ReleaseVersion"
    
    git checkout develop
    git pull origin develop
    git checkout -b "release/$ReleaseVersion"
    
    Write-Info "Release branch creado: release/$ReleaseVersion"
    Write-Info "Actualiza versiones y documentación antes del merge"
}

# Función para completar feature
function Complete-Feature {
    param([string]$FeatureName)
    
    if (-not $FeatureName) {
        Write-Error "Debes especificar el nombre del feature"
        Write-Host "Uso: .\git-workflow.ps1 complete-feature <nombre-feature>"
        exit 1
    }
    
    Write-Info "Completando feature: $FeatureName"
    
    git checkout develop
    git pull origin develop
    git merge "feature/$FeatureName"
    git push origin develop
    git branch -d "feature/$FeatureName"
    git push origin --delete "feature/$FeatureName"
    
    Write-Info "Feature $FeatureName completado y eliminado"
}

# Función para completar hotfix
function Complete-Hotfix {
    param([string]$HotfixName, [string]$Version)
    
    if (-not $HotfixName) {
        Write-Error "Debes especificar el nombre del hotfix"
        Write-Host "Uso: .\git-workflow.ps1 complete-hotfix <nombre-hotfix> <version>"
        exit 1
    }
    
    if (-not $Version) {
        Write-Error "Debes especificar la versión del tag"
        Write-Host "Uso: .\git-workflow.ps1 complete-hotfix <nombre-hotfix> <version>"
        exit 1
    }
    
    Write-Info "Completando hotfix: $HotfixName"
    
    git checkout main
    git merge "hotfix/$HotfixName"
    git tag -a "v$Version" -m "Hotfix v$Version"
    git push origin main
    git push origin "v$Version"
    
    git checkout develop
    git merge "hotfix/$HotfixName"
    git push origin develop
    
    git branch -d "hotfix/$HotfixName"
    git push origin --delete "hotfix/$HotfixName"
    
    Write-Info "Hotfix $HotfixName completado y eliminado"
}

# Función para completar release
function Complete-Release {
    param([string]$ReleaseVersion)
    
    if (-not $ReleaseVersion) {
        Write-Error "Debes especificar la versión del release"
        Write-Host "Uso: .\git-workflow.ps1 complete-release <version>"
        exit 1
    }
    
    Write-Info "Completando release: v$ReleaseVersion"
    
    git checkout main
    git merge "release/$ReleaseVersion"
    git tag -a "v$ReleaseVersion" -m "Release v$ReleaseVersion"
    git push origin main
    git push origin "v$ReleaseVersion"
    
    git checkout develop
    git merge "release/$ReleaseVersion"
    git push origin develop
    
    git branch -d "release/$ReleaseVersion"
    git push origin --delete "release/$ReleaseVersion"
    
    Write-Info "Release v$ReleaseVersion completado y eliminado"
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host "Script de workflow Git para el proyecto en Windows"
    Write-Host ""
    Write-Host "Comandos disponibles:"
    Write-Host "  feature <nombre>           - Crear feature branch"
    Write-Host "  hotfix <nombre>            - Crear hotfix branch"
    Write-Host "  release <version>          - Crear release branch"
    Write-Host "  complete-feature <nombre>  - Completar feature"
    Write-Host "  complete-hotfix <nombre> <version> - Completar hotfix"
    Write-Host "  complete-release <version> - Completar release"
    Write-Host "  help                       - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\git-workflow.ps1 feature dashboard-graficos"
    Write-Host "  .\git-workflow.ps1 hotfix fix-login-error"
    Write-Host "  .\git-workflow.ps1 release 1.2.0"
    Write-Host "  .\git-workflow.ps1 complete-feature dashboard-graficos"
    Write-Host "  .\git-workflow.ps1 complete-hotfix fix-login-error 1.2.1"
    Write-Host "  .\git-workflow.ps1 complete-release 1.2.0"
}

# Procesar comandos
switch ($Command) {
    "feature" { New-Feature $Name }
    "hotfix" { New-Hotfix $Name }
    "release" { New-Release $Name }
    "complete-feature" { Complete-Feature $Name }
    "complete-hotfix" { Complete-Hotfix $Name $Version }
    "complete-release" { Complete-Release $Name }
    "help" { Show-Help }
    default {
        if ($Command) {
            Write-Error "Comando no reconocido: $Command"
        }
        Show-Help
    }
}
"@

    Set-Content -Path "scripts/git-workflow.ps1" -Value $workflowContent
    Write-Info "Script de workflow creado: scripts/git-workflow.ps1"
}

# Función principal
function Main {
    Write-Header
    
    Write-Info "Iniciando configuración del flujo de trabajo Git..."
    
    Test-Directory
    Test-Git
    Test-GitRepo
    Test-Gitignore
    Set-Branches
    Set-Hooks
    Set-Aliases
    New-GitConfig
    New-WorkflowScript
    
    Write-Info ""
    Write-Info "✅ Configuración completada exitosamente!"
    Write-Info ""
    Write-Info "📋 Próximos pasos:"
    Write-Info "1. Configura tu usuario de Git:"
    Write-Info "   git config user.name 'Tu Nombre'"
    Write-Info "   git config user.email 'tu.email@ejemplo.com'"
    Write-Info ""
    Write-Info "2. Agrega un remote origin:"
    Write-Info "   git remote add origin <url-del-repositorio>"
    Write-Info ""
    Write-Info "3. Haz el primer commit:"
    Write-Info "   git add ."
    Write-Info "   git commit -m 'feat: configuración inicial del proyecto'"
    Write-Info "   git push -u origin main"
    Write-Info "   git push -u origin develop"
    Write-Info ""
    Write-Info "4. Usa el script de workflow:"
    Write-Info "   .\scripts\git-workflow.ps1 feature mi-nueva-funcionalidad"
    Write-Info ""
    Write-Info "📚 Documentación disponible en:"
    Write-Info "   - docs/ESTRUCTURA_GIT.md"
    Write-Info "   - README.md"
    Write-Info "   - CHANGELOG.md"
}

# Ejecutar función principal
Main 