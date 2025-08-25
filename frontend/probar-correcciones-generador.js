const axios = require('axios');

console.log('🔍 Probando correcciones del generador PDF...\n');

// Simular la configuración del frontend
process.env.REACT_APP_API_URL = 'http://localhost:3001/api';
process.env.NODE_ENV = 'development';

// Resolver baseURL como lo hace el frontend
const resolvedBaseURL = 
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://extraccion-backend-test.onrender.com/api'
    : 'http://localhost:3001/api');

console.log('📊 Configuración:');
console.log('   - REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('   - NODE_ENV:', process.env.NODE_ENV);
console.log('   - URL base resuelta:', resolvedBaseURL);

// Crear instancia de axios como en el frontend
const api = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function probarCorrecciones() {
  try {
    console.log('\n🧪 Probando rutas corregidas...\n');

    // 1. Probar listar PDFs (CORREGIDO)
    console.log('1️⃣ Probando /generador-pdf-simple/listar (CORREGIDO)...');
    const listarResponse = await api.get('/generador-pdf-simple/listar');
    console.log('✅ Listar PDFs funciona:', listarResponse.data.success);
    console.log('   - PDFs encontrados:', listarResponse.data.data?.length || 0);
    console.log('   - URL final:', listarResponse.config.url);

    // 2. Probar estadísticas (CORREGIDO)
    console.log('\n2️⃣ Probando /generador-pdf-simple/estadisticas (CORREGIDO)...');
    const statsResponse = await api.get('/generador-pdf-simple/estadisticas');
    console.log('✅ Estadísticas funciona:', statsResponse.data.success);
    console.log('   - Total PDFs:', statsResponse.data.data?.totalPDFs);
    console.log('   - Tamaño total:', statsResponse.data.data?.tamañoTotal);
    console.log('   - URL final:', statsResponse.config.url);

    // 3. Probar generar PDF (CORREGIDO)
    console.log('\n3️⃣ Probando /generador-pdf-simple/generar (CORREGIDO)...');
    const fechaHoy = new Date().toISOString().split('T')[0];
    const generarResponse = await api.post('/generador-pdf-simple/generar', {
      fecha: fechaHoy,
      orientacion: 'vertical'
    });
    console.log('✅ Generar PDF funciona:', generarResponse.data.success);
    console.log('   - Archivo generado:', generarResponse.data.data?.fileName);
    console.log('   - URL final:', generarResponse.config.url);

    console.log('\n🎉 ¡Todas las correcciones funcionan correctamente!');
    console.log('✅ El problema del doble /api ha sido solucionado');
    console.log('✅ Las URLs ahora son correctas:');
    console.log('   - Antes: http://localhost:3001/api/api/generador-pdf-simple/listar');
    console.log('   - Ahora: http://localhost:3001/api/generador-pdf-simple/listar');

  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message);
    
    if (error.response) {
      console.log('   - Status:', error.response.status);
      console.log('   - URL:', error.config.url);
      console.log('   - Data:', error.response.data);
    } else if (error.request) {
      console.log('\n❌ Error de conexión:');
      console.log('   - No se pudo conectar al backend');
      console.log('   - Verifica que el backend esté ejecutándose en puerto 3001');
      console.log('   - URL intentada:', error.config.url);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

probarCorrecciones();

