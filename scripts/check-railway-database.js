#!/usr/bin/env node

const https = require('https');

console.log('🔍 VERIFICANDO BASE DE DATOS DE RAILWAY');
console.log('========================================\n');

const BASE_URL = 'https://trn-extraccion-test-production.up.railway.app';

async function checkRailwayDatabase() {
  return new Promise((resolve) => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(`${BASE_URL}/api/health`, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('📊 INFORMACIÓN DEL BACKEND:');
          console.log(`   Status: ${jsonData.status || 'N/A'}`);
          console.log(`   Database: ${jsonData.database || 'N/A'}`);
          console.log(`   Environment: ${jsonData.environment || 'N/A'}`);
          console.log(`   Timestamp: ${jsonData.timestamp || 'N/A'}`);
          console.log(`   Uptime: ${jsonData.uptime || 'N/A'}`);
          
          if (jsonData.memory) {
            console.log(`   Memory: ${JSON.stringify(jsonData.memory, null, 2)}`);
          }
          
          resolve({ success: true, data: jsonData });
        } catch (e) {
          console.log(`❌ Error parseando respuesta: ${e.message}`);
          console.log(`📥 Response: ${data}`);
          resolve({ success: false, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Error de conexión: ${error.message}`);
      resolve({ success: false, error: error.message });
    });

    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.end();
  });
}

async function checkEnvironment() {
  console.log('🌍 VERIFICANDO VARIABLES DE ENTORNO:');
  console.log('=====================================\n');
  
  // Verificar archivo railway.env
  const fs = require('fs');
  const path = require('path');
  
  const railwayEnvPath = path.join(__dirname, '..', 'railway.env');
  if (fs.existsSync(railwayEnvPath)) {
    console.log('📋 Variables de entorno en railway.env:');
    const railwayEnv = fs.readFileSync(railwayEnvPath, 'utf8');
    const lines = railwayEnv.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    lines.forEach(line => {
      if (line.includes('DB_')) {
        console.log(`   ${line}`);
      }
    });
  }
  
  console.log('\n💡 ANÁLISIS:');
  console.log('1. Railway puede estar usando una base de datos interna');
  console.log('2. Las variables de entorno pueden no estar configuradas correctamente');
  console.log('3. El backend puede estar usando valores por defecto');
  
  console.log('\n🔧 SOLUCIONES:');
  console.log('1. Verificar Railway Dashboard para ver las variables de entorno');
  console.log('2. Configurar manualmente las variables en Railway');
  console.log('3. Usar credenciales existentes en el sistema');
  console.log('4. Crear usuario directamente en Railway si es posible');
}

async function runCheck() {
  await checkRailwayDatabase();
  console.log('');
  await checkEnvironment();
}

runCheck().catch(console.error); 