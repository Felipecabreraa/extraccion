#!/bin/bash

echo "🚀 Iniciando despliegue en Hostinger..."

# Detener aplicación si está corriendo
pm2 stop extraccion-backend 2>/dev/null || true
pm2 delete extraccion-backend 2>/dev/null || true

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Construir frontend
echo "🔨 Construyendo frontend..."
cd frontend && npm run build && cd ..

# Crear directorio de logs si no existe
mkdir -p logs

# Iniciar aplicación con PM2
echo "🚀 Iniciando aplicación..."
pm2 start ecosystem.config.js

# Guardar configuración PM2
pm2 save

# Mostrar estado
pm2 status

echo "✅ Despliegue completado!"
echo "📊 Monitoreo: pm2 monit"
echo "📋 Logs: pm2 logs extraccion-backend" 