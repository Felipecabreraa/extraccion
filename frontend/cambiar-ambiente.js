const fs = require('fs');
const path = require('path');

// Configuraciones de ambientes
const environments = {
  development: {
    backendUrl: 'http://localhost:3001/api',
    description: 'Ambiente de desarrollo local'
  },
  production: {
    backendUrl: 'https://tu-backend-produccion.com/api',
    description: 'Ambiente de producción'
  },
  staging: {
    backendUrl: 'https://tu-backend-staging.com/api',
    description: 'Ambiente de pruebas (staging)'
  }
};

function cambiarAmbiente(ambiente) {
  const config = environments[ambiente];
  if (!config) {
    console.error('❌ Ambiente no válido. Opciones disponibles:');
    Object.keys(environments).forEach(env => {
      console.log(`   - ${env}: ${environments[env].description}`);
    });
    return;
  }

  const axiosPath = path.join(__dirname, 'src', 'api', 'axios.js');
  
  try {
    let content = fs.readFileSync(axiosPath, 'utf8');
    
    // Reemplazar la configuración de baseURL
    const newBaseURL = `const baseURL = process.env.NODE_ENV === 'production' 
  ? '${config.backendUrl}'  // URL de producción
  : '${config.backendUrl}';  // URL actual (${ambiente})`;

    // Buscar y reemplazar la línea de baseURL
    content = content.replace(
      /const baseURL = process\.env\.NODE_ENV === 'production'[\s\S]*?;[\s\S]*?\/\/ URL actual.*?;/,
      newBaseURL
    );

    fs.writeFileSync(axiosPath, content);
    
    console.log(`✅ Ambiente cambiado a: ${ambiente.toUpperCase()}`);
    console.log(`📡 URL del backend: ${config.backendUrl}`);
    console.log(`📝 Descripción: ${config.description}`);
    console.log('\n🔄 Reinicia el servidor de desarrollo para aplicar los cambios:');
    console.log('   npm start');
    
  } catch (error) {
    console.error('❌ Error cambiando ambiente:', error.message);
  }
}

// Obtener el ambiente desde los argumentos de línea de comandos
const ambiente = process.argv[2];

if (!ambiente) {
  console.log('🔧 Script para cambiar ambientes');
  console.log('\nUso: node cambiar-ambiente.js <ambiente>');
  console.log('\nAmbientes disponibles:');
  Object.keys(environments).forEach(env => {
    console.log(`   - ${env}: ${environments[env].description}`);
  });
  console.log('\nEjemplo: node cambiar-ambiente.js production');
} else {
  cambiarAmbiente(ambiente);
} 