const axios = require('axios');

// Configurar la URL base según el entorno
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function probarDanosPorOperador() {
  try {
    console.log('🔍 Probando panel de Daños por Operador...');
    console.log('📡 URL base:', API_BASE_URL);
    
    const currentYear = new Date().getFullYear();
    
    // Probar endpoint de daños por operador
    console.log(`\n📊 Probando endpoint: /dashboard/danos/test-por-operador?year=${currentYear}`);
    
    const response = await api.get(`/dashboard/danos/test-por-operador?year=${currentYear}`);
    const data = response.data;
    
    console.log('✅ Respuesta recibida exitosamente');
    console.log('📋 Estructura de datos:');
    console.log(`   - Resumen anual tipo: ${Object.keys(data.resumenAnualTipo || {}).length} tipos`);
    console.log(`   - Operadores mensuales: ${data.operadoresMensuales?.length || 0} operadores`);
    console.log(`   - Top operadores: ${data.topOperadores?.length || 0} operadores`);
    console.log(`   - Total operadores: ${data.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${data.totalesAnuales?.totalDanos || 0}`);
    console.log(`   - Promedio por operador: ${data.totalesAnuales?.promedioDanosPorOperador || 0}`);
    
    // Mostrar resumen por tipo
    if (data.resumenAnualTipo) {
      console.log('\n📈 Resumen por tipo:');
      Object.entries(data.resumenAnualTipo).forEach(([tipo, info]) => {
        console.log(`   - ${tipo}: ${info.total} daños`);
      });
    }
    
    // Mostrar top 5 operadores
    if (data.topOperadores && data.topOperadores.length > 0) {
      console.log('\n🏆 Top 5 operadores:');
      data.topOperadores.slice(0, 5).forEach((op, index) => {
        console.log(`   ${index + 1}. ${op.nombreCompleto}: ${op.cantidadTotalDanos} daños`);
      });
    }
    
    // Verificar datos mensuales
    if (data.operadoresMensuales && data.operadoresMensuales.length > 0) {
      console.log('\n📅 Verificando datos mensuales:');
      const primerOperador = data.operadoresMensuales[0];
      console.log(`   - Primer operador: ${primerOperador.nombre}`);
      console.log(`   - Tipo zona: ${primerOperador.tipoZona}`);
      console.log(`   - Total anual: ${primerOperador.totalAnual}`);
      console.log(`   - Meses con datos: ${Object.keys(primerOperador.meses || {}).length}`);
    }
    
    console.log('\n✅ Panel de Daños por Operador funcionando correctamente');
    
  } catch (error) {
    console.error('❌ Error al probar panel de Daños por Operador:', error.message);
    
    if (error.response) {
      console.error('📡 Respuesta del servidor:', error.response.status, error.response.statusText);
      console.error('📋 Datos de error:', error.response.data);
    }
  }
}

// Ejecutar la prueba
probarDanosPorOperador();



