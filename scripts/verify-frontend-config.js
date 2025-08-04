const fs = require('fs');
const path = require('path');

function verifyFrontendConfig() {
  console.log('🔍 Verificando configuración del frontend...');
  
  try {
    // Verificar archivo .env
    const envPath = path.join(__dirname, '../frontend-test-publico/.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ Archivo .env encontrado');
      console.log('📋 Contenido:', envContent.trim());
    } else {
      console.log('⚠️ Archivo .env no encontrado');
    }
    
    // Verificar configuración de axios
    const axiosPath = path.join(__dirname, '../frontend-test-publico/src/api/axios.js');
    if (fs.existsSync(axiosPath)) {
      const axiosContent = fs.readFileSync(axiosPath, 'utf8');
      
      // Verificar si usa la URL correcta
      if (axiosContent.includes('trn-extraccion-production.up.railway.app')) {
        console.log('✅ Axios configurado con URL correcta');
      } else {
        console.log('❌ Axios no usa la URL correcta');
      }
      
      // Extraer la URL base
      const baseURLMatch = axiosContent.match(/baseURL.*?=.*?['"`]([^'"`]+)['"`]/);
      if (baseURLMatch) {
        console.log('🌐 URL base configurada:', baseURLMatch[1]);
      }
    }
    
    // Verificar package.json
    const packagePath = path.join(__dirname, '../frontend-test-publico/package.json');
    if (fs.existsSync(packagePath)) {
      const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log('📦 Nombre del proyecto:', packageContent.name);
      console.log('📋 Scripts disponibles:', Object.keys(packageContent.scripts || {}));
    }
    
    console.log('\n🎉 Verificación completada!');
    console.log('💡 Para aplicar cambios:');
    console.log('1. Reiniciar el frontend: npm start');
    console.log('2. Verificar en DevTools que no hay errores CORS');
    console.log('3. Probar login con credenciales válidas');
    
  } catch (error) {
    console.error('❌ Error verificando configuración:', error.message);
  }
}

verifyFrontendConfig(); 