#!/bin/bash

echo "🚀 Iniciando desarrollo local..."

# Verificar que estamos en la rama develop
current_branch=$(git branch --show-current)
if [ "$current_branch" != "develop" ]; then
    echo "⚠️  Estás en la rama $current_branch. Cambiando a develop..."
    git checkout develop
fi

# Instalar dependencias si es necesario
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    cd frontend && npm install && cd ..
fi

# Ejecutar en modo desarrollo
echo "🔧 Iniciando servicios de desarrollo..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener los servicios"
echo ""

# Ejecutar ambos servicios
npm run dev 