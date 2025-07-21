#!/bin/bash

# Script para configurar autenticación con GitHub
# Autor: Felipecabreraa

echo "🔐 Configurando autenticación con GitHub..."

# Verificar si Git está configurado
if ! git config --global user.name > /dev/null 2>&1; then
    echo "❌ Error: Git no está configurado. Ejecuta primero:"
    echo "git config --global user.name 'Tu Nombre'"
    echo "git config --global user.email 'tu@email.com'"
    exit 1
fi

echo "✅ Git configurado correctamente"
echo "Usuario: $(git config --global user.name)"
echo "Email: $(git config --global user.email)"

echo ""
echo "🔑 Opciones de autenticación:"
echo "1. Token de Acceso Personal (Recomendado)"
echo "2. SSH Keys"
echo "3. GitHub CLI"
echo ""

read -p "Selecciona una opción (1-3): " option

case $option in
    1)
        echo ""
        echo "📋 Configurando Token de Acceso Personal..."
        echo ""
        echo "Pasos para crear el token:"
        echo "1. Ve a https://github.com/settings/tokens"
        echo "2. Click en 'Generate new token (classic)'"
        echo "3. Selecciona los permisos:"
        echo "   - repo (acceso completo a repositorios)"
        echo "   - workflow (para GitHub Actions)"
        echo "4. Copia el token generado"
        echo ""
        read -p "Pega tu token aquí: " token
        
        if [ -n "$token" ]; then
            # Configurar el token para HTTPS
            git config --global credential.helper store
            echo "https://Felipecabreraa:$token@github.com" > ~/.git-credentials
            echo "✅ Token configurado correctamente"
        else
            echo "❌ No se proporcionó token"
        fi
        ;;
    2)
        echo ""
        echo "🔑 Configurando SSH Keys..."
        
        # Verificar si ya existe una clave SSH
        if [ -f ~/.ssh/id_ed25519 ]; then
            echo "✅ Clave SSH ya existe"
            echo "Clave pública:"
            cat ~/.ssh/id_ed25519.pub
        else
            echo "Generando nueva clave SSH..."
            ssh-keygen -t ed25519 -C "luislagoscabrera@gmail.com" -f ~/.ssh/id_ed25519 -N ""
            echo "✅ Clave SSH generada"
            echo ""
            echo "🔑 Clave pública (cópiala a GitHub):"
            cat ~/.ssh/id_ed25519.pub
        fi
        
        echo ""
        echo "📋 Pasos para agregar la clave a GitHub:"
        echo "1. Ve a https://github.com/settings/keys"
        echo "2. Click en 'New SSH key'"
        echo "3. Pega la clave pública mostrada arriba"
        echo "4. Dale un título descriptivo"
        echo "5. Click en 'Add SSH key'"
        ;;
    3)
        echo ""
        echo "🛠️ Configurando GitHub CLI..."
        
        # Verificar si GitHub CLI está instalado
        if ! command -v gh &> /dev/null; then
            echo "❌ GitHub CLI no está instalado"
            echo "Instálalo desde: https://cli.github.com/"
            exit 1
        fi
        
        echo "Iniciando autenticación con GitHub CLI..."
        gh auth login
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Crear repositorio en GitHub: https://github.com/new"
echo "2. Nombre: EXTRACCION"
echo "3. Descripción: Sistema de gestión de planillas y barredores"
echo "4. Hacer público o privado según prefieras"
echo "5. NO inicializar con README (ya tienes uno)"
echo ""
echo "6. Conectar repositorio local:"
echo "   git remote add origin https://github.com/Felipecabreraa/EXTRACCION.git"
echo ""
echo "7. Hacer primer commit:"
echo "   git add ."
echo "   git commit -m 'feat: inicialización del proyecto EXTRACCION'"
echo ""
echo "8. Subir a GitHub:"
echo "   git push -u origin master" 