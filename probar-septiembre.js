const axios = require('axios');

async function probarSeptiembre() {
  try {
    console.log('🧪 Probando que septiembre muestre $0...\n');
    
    const response = await axios.get('http://localhost:3001/api/danos-acumulados?anio=2025');
    
    console.log('📊 Datos de septiembre:');
    const septiembre = response.data.datos_grafico.find(d => d.mes === 9);
    
    if (septiembre) {
      console.log(`  - Valor Real: ${septiembre.valor_real_formateado} (${septiembre.valor_real})`);
      console.log(`  - Real Acumulado: ${septiembre.real_acumulado_formateado} (${septiembre.real_acumulado})`);
      
      if (septiembre.valor_real === 0) {
        console.log('  ✅ CORRECTO: Valor real de septiembre es $0');
      } else {
        console.log('  ❌ INCORRECTO: Valor real de septiembre debería ser $0');
      }
      
      if (septiembre.real_acumulado === 14491541) {
        console.log('  ✅ CORRECTO: Real acumulado mantiene valor de agosto ($14.491.541)');
      } else {
        console.log('  ❌ INCORRECTO: Real acumulado debería mantener valor de agosto');
      }
    }
    
    console.log('\n📋 Estado de datos:');
    console.log(`  - Mes actual: ${response.data.estado_datos?.nombre_mes_actual}`);
    console.log(`  - Mes límite: ${response.data.estado_datos?.nombre_mes_limite}`);
    console.log(`  - Descripción: ${response.data.estado_datos?.descripcion}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Esperar un momento para que el servidor inicie
setTimeout(probarSeptiembre, 3000);

