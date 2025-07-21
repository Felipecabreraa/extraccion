#!/bin/bash

# Script de inicio rápido para configurar control de versiones
# Autor: Felipecabreraa

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    EXTRACCION - CONTROL DE VERSIONES         ║"
echo "║                                                              ║"
echo "║  🚀 Configuración rápida de Git y GitHub                    ║"
echo "║  📋 Flujo de trabajo profesional                            ║"
echo "║  🏗️  Entornos separados (dev/staging/prod)                  ║"
echo "║  🤖 Automatización con GitHub Actions                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar si estamos en un repositorio Git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: No se encontró un repositorio Git${NC}"
    echo -e "${YELLOW}Ejecutando git init...${NC}"
    git init
fi

# Verificar configuración de Git
echo -e "${BLUE}🔍 Verificando configuración de Git...${NC}"
if ! git config --global user.name > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️ Git no está configurado. Configurando...${NC}"
    git config --global user.name "Felipecabreraa"
    git config --global user.email "luislagoscabrera@gmail.com"
    echo -e "${GREEN}✅ Git configurado${NC}"
else
    echo -e "${GREEN}✅ Git ya está configurado${NC}"
    echo -e "${CYAN}Usuario: $(git config --global user.name)${NC}"
    echo -e "${CYAN}Email: $(git config --global user.email)${NC}"
fi

# Dar permisos de ejecución a los scripts
echo -e "${BLUE}🔧 Configurando permisos de scripts...${NC}"
chmod +x scripts/setup-git-workflow.sh
chmod +x scripts/setup-github-auth.sh
chmod +x scripts/manage-environments.sh
echo -e "${GREEN}✅ Permisos configurados${NC}"

# Ejecutar configuración del workflow
echo -e "${BLUE}⚙️ Configurando workflow de Git...${NC}"
./scripts/setup-git-workflow.sh

# Configurar entornos
echo -e "${BLUE}🏗️ Configurando entornos de desarrollo...${NC}"
./scripts/manage-environments.sh setup

# Hacer primer commit si no hay commits
if ! git log --oneline -1 > /dev/null 2>&1; then
    echo -e "${BLUE}📝 Preparando primer commit...${NC}"
    
    # Agregar todos los archivos
    git add .
    
    # Hacer commit inicial
    git commit -m "feat: inicialización del proyecto EXTRACCION

- Sistema de gestión de planillas y barredores
- Backend con Node.js y Express
- Frontend con React
- Configuración de control de versiones
- Entornos separados (dev/staging/prod)
- Automatización con GitHub Actions
- Documentación completa"

    echo -e "${GREEN}✅ Primer commit realizado${NC}"
else
    echo -e "${GREEN}✅ Ya existen commits en el repositorio${NC}"
fi

# Mostrar estado actual
echo -e "${BLUE}📊 Estado actual del repositorio:${NC}"
echo -e "${CYAN}Ramas disponibles:${NC}"
git branch -a

echo -e "${CYAN}Últimos commits:${NC}"
git log --oneline -5

# Mostrar próximos pasos
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    PRÓXIMOS PASOS                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}1. 🔐 Configurar autenticación con GitHub:${NC}"
echo -e "   ./scripts/setup-github-auth.sh"
echo ""

echo -e "${YELLOW}2. 🌐 Crear repositorio en GitHub:${NC}"
echo -e "   - Ve a https://github.com/new"
echo -e "   - Nombre: EXTRACCION"
echo -e "   - Descripción: Sistema de gestión de planillas y barredores"
echo -e "   - NO inicializar con README (ya tienes uno)"
echo ""

echo -e "${YELLOW}3. 🔗 Conectar repositorio local con GitHub:${NC}"
echo -e "   git remote add origin https://github.com/Felipecabreraa/EXTRACCION.git"
echo ""

echo -e "${YELLOW}4. 📤 Subir código a GitHub:${NC}"
echo -e "   git push -u origin master"
echo -e "   git push -u origin develop"
echo ""

echo -e "${YELLOW}5. 🚀 Iniciar desarrollo:${NC}"
echo -e "   ./scripts/manage-environments.sh dev"
echo ""

echo -e "${GREEN}✅ Configuración completada exitosamente!${NC}"
echo ""
echo -e "${CYAN}📖 Documentación disponible:${NC}"
echo -e "   - README_CONTROL_VERSIONES.md (guía completa)"
echo -e "   - GUIA_GIT_GITHUB.md (configuración básica)"
echo -e "   - WORKFLOW_GIT.md (flujo de trabajo)"
echo ""

echo -e "${PURPLE}🎉 ¡Tu proyecto está listo para desarrollo profesional!${NC}" 