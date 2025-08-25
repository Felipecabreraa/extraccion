const axios = require('axios');

async function corregirSeptiembreAPI() {
  try {
    console.log('🔧 Corrigiendo septiembre usando la API...\n');
    
    // 1. Primero verificar datos actuales
    console.log('📊 1. Verificando datos actuales...');
    const responseActual = await axios.get('http://localhost:3001/api/danos-acumulados?anio=2025');
    
    const septiembre = responseActual.data.datos_grafico.find(d => d.mes === 9);
    if (septiembre) {
      console.log(`📋 Septiembre actual:`);
      console.log(`  - Valor Real: ${septiembre.valor_real_formateado} (${septiembre.valor_real})`);
      console.log(`  - Real Acumulado: ${septiembre.real_acumulado_formateado} (${septiembre.real_acumulado})`);
    }
    
    // 2. Corregir septiembre usando la API
    console.log('\n🔧 2. Corrigiendo septiembre...');
    const responseCorreccion = await axios.post('http://localhost:3001/api/danos-acumulados/registro', {
      anio: 2025,
      mes: 9,
      valor_real: 0,
      valor_ppto: 3000000
    });
    
    console.log(`✅ ${responseCorreccion.data.message}`);
    
    // 3. Verificar la corrección
    console.log('\n📊 3. Verificando corrección...');
    const responseCorregido = await axios.get('http://localhost:3001/api/danos-acumulados?anio=2025');
    
    const septiembreCorregido = responseCorregido.data.datos_grafico.find(d => d.mes === 9);
    if (septiembreCorregido) {
      console.log(`📋 Septiembre corregido:`);
      console.log(`  - Valor Real: ${septiembreCorregido.valor_real_formateado} (${septiembreCorregido.valor_real})`);
      console.log(`  - Real Acumulado: ${septiembreCorregido.real_acumulado_formateado} (${septiembreCorregido.real_acumulado})`);
      
      if (septiembreCorregido.valor_real === 0) {
        console.log('  ✅ CORRECTO: Valor real de septiembre es 0');
      } else {
        console.log('  ❌ INCORRECTO: Valor real de septiembre no es 0');
      }
    }
    
    console.log('\n✅ Corrección completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📋 Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar corrección
corregirSeptiembreAPI();

