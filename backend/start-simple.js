#!/usr/bin/env node

// Script de inicio simple para Render
console.log('🚀 Iniciando servidor simple para Render...');

// Forzar variables de entorno críticas
process.env.PORT = '3000';
process.env.NODE_ENV = 'production';

console.log('📊 Variables de entorno forzadas:');
console.log('   PORT:', process.env.PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV);

// Verificar variables de base de datos
const dbVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = dbVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables de BD faltantes:', missingVars);
  process.exit(1);
}

console.log('✅ Variables de BD configuradas');

// Iniciar servidor directamente
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');

const app = express();
const PORT = 3000;

// Configuración básica
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'OK',
      message: 'Health check passed',
      timestamp: new Date().toISOString(),
      port: PORT,
      environment: 'production'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: 'production'
  });
});

// Conectar BD e iniciar servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL exitosa');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
      console.log(`📊 Modo: production`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();
