console.log('🔍 Verificando entorno de desarrollo...');

console.log('📊 Variables de entorno:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('  - PUBLIC_URL:', process.env.PUBLIC_URL);

console.log('📊 Configuración de axios:');
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://extraccion-backend.onrender.com/api'
  : 'http://localhost:3001/api';

console.log('  - baseURL:', baseURL);
console.log('  - timeout: 30000');

console.log('📊 Verificando conectividad...');

const axios = require('axios');

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a:', baseURL);
    
    const response = await api.get('/danos/meta/stats/test', {
      params: {
        year: 2025,
        porcentaje: 5
      }
    });
    
    console.log('✅ Conexión exitosa');
    console.log('📊 Datos recibidos:', {
      anioActual: response.data.configuracion?.anioActual,
      metaAnual: response.data.configuracion?.metaAnual,
      totalRealHastaAhora: response.data.datosAnioActual?.totalRealHastaAhora,
      cumplimientoMeta: response.data.datosAnioActual?.cumplimientoMeta
    });
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📊 Data:', error.response.data);
    }
  }
}

testConnection(); 