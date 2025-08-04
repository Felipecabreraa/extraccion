#!/bin/bash
echo "🚀 Iniciando servidor en modo: $NODE_ENV"
echo "📊 Puerto: $PORT"
echo "🔗 Base de datos: $DB_NAME"

# Esperar a que la base de datos esté lista
echo "⏳ Esperando conexión a base de datos..."
sleep 5

# Iniciar servidor con manejo de señales mejorado
node src/app.js
