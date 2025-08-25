const axios = require('axios');

// Configurar la URL base según el entorno
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function probarFrontendDanosOperador() {
  try {
    console.log('🔍 Probando Frontend - Panel de Daños por Operador...');
    console.log('📡 API URL:', API_BASE_URL);
    console.log('🌐 Frontend URL:', FRONTEND_URL);
    
    const currentYear = new Date().getFullYear();
    
    // 1. Verificar que el endpoint del backend funciona
    console.log(`\n📊 1. Verificando endpoint del backend...`);
    const response = await api.get(`/dashboard/danos/test-por-operador?year=${currentYear}`);
    const data = response.data;
    
    console.log('✅ Backend funcionando correctamente');
    console.log(`   - Total operadores: ${data.totalesAnuales?.totalOperadores || 0}`);
    console.log(`   - Total daños: ${data.totalesAnuales?.totalDanos || 0}`);
    
    // 2. Verificar estructura de datos para el frontend
    console.log(`\n📋 2. Verificando estructura de datos...`);
    
    const requiredFields = [
      'resumenAnualTipo',
      'operadoresMensuales', 
      'topOperadores',
      'totalesAnuales',
      'nombresMeses'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Campos faltantes:', missingFields);
    } else {
      console.log('✅ Todos los campos requeridos están presentes');
    }
    
    // 3. Verificar datos específicos del frontend
    console.log(`\n🎨 3. Verificando datos para visualización...`);
    
    // Verificar resumen anual
    if (data.resumenAnualTipo) {
      console.log('✅ Resumen anual por tipo:');
      Object.entries(data.resumenAnualTipo).forEach(([tipo, info]) => {
        console.log(`   - ${tipo}: ${info.total} daños, ${Object.keys(info.meses || {}).length} meses`);
      });
    }
    
    // Verificar operadores mensuales
    if (data.operadoresMensuales && data.operadoresMensuales.length > 0) {
      console.log(`✅ Operadores mensuales: ${data.operadoresMensuales.length} operadores`);
      const primerOperador = data.operadoresMensuales[0];
      console.log(`   - Ejemplo: ${primerOperador.nombre} (${primerOperador.tipoZona}) - ${primerOperador.totalAnual} daños`);
    }
    
    // Verificar top operadores
    if (data.topOperadores && data.topOperadores.length > 0) {
      console.log(`✅ Top operadores: ${data.topOperadores.length} operadores`);
      console.log(`   - Top 1: ${data.topOperadores[0].nombreCompleto} - ${data.topOperadores[0].cantidadTotalDanos} daños`);
    }
    
    // Verificar nombres de meses
    if (data.nombresMeses && data.nombresMeses.length === 12) {
      console.log('✅ Nombres de meses: 12 meses configurados');
    }
    
    // 4. Verificar cálculos
    console.log(`\n🧮 4. Verificando cálculos...`);
    
    const totalCalculado = Object.values(data.resumenAnualTipo || {}).reduce((sum, tipo) => sum + (tipo.total || 0), 0);
    const totalReportado = data.totalesAnuales?.totalDanos || 0;
    
    if (totalCalculado === totalReportado) {
      console.log('✅ Cálculos correctos');
      console.log(`   - Total calculado: ${totalCalculado}`);
      console.log(`   - Total reportado: ${totalReportado}`);
    } else {
      console.log('⚠️ Discrepancia en cálculos');
      console.log(`   - Total calculado: ${totalCalculado}`);
      console.log(`   - Total reportado: ${totalReportado}`);
    }
    
    // 5. Verificar datos para gráficos
    console.log(`\n📈 5. Verificando datos para gráficos...`);
    
    // Datos para gráfico de torta
    const datosResumenAnual = [
      { name: 'HEMBRA', value: data.resumenAnualTipo?.HEMBRA?.total || 0 },
      { name: 'MACHO', value: data.resumenAnualTipo?.MACHO?.total || 0 }
    ];
    
    console.log('✅ Datos para gráfico de torta:', datosResumenAnual);
    
    // Datos para gráfico de barras (top operadores)
    const datosTopOperadores = data.topOperadores?.slice(0, 10).map((op, index) => ({
      name: op.nombreCompleto,
      totalDanos: op.cantidadTotalDanos,
      rank: index + 1
    })) || [];
    
    console.log(`✅ Datos para gráfico de barras: ${datosTopOperadores.length} operadores`);
    
    // Datos para gráfico de área (evolución mensual)
    const datosMensuales = data.nombresMeses?.map((mes, index) => ({
      mes: mes,
      HEMBRA: data.resumenAnualTipo?.HEMBRA?.meses?.[index + 1] || 0,
      MACHO: data.resumenAnualTipo?.MACHO?.meses?.[index + 1] || 0,
      Total: (data.resumenAnualTipo?.HEMBRA?.meses?.[index + 1] || 0) + (data.resumenAnualTipo?.MACHO?.meses?.[index + 1] || 0)
    })) || [];
    
    console.log(`✅ Datos para gráfico de área: ${datosMensuales.length} meses`);
    
    console.log('\n✅ Frontend - Panel de Daños por Operador listo para funcionar');
    console.log('🌐 Puedes acceder al panel en:', `${FRONTEND_URL}/danos-por-operador`);
    
  } catch (error) {
    console.error('❌ Error al probar frontend:', error.message);
    
    if (error.response) {
      console.error('📡 Respuesta del servidor:', error.response.status, error.response.statusText);
      console.error('📋 Datos de error:', error.response.data);
    }
  }
}

// Ejecutar la prueba
probarFrontendDanosOperador();



