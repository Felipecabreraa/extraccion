const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function verificarDanosMigracion() {
  try {
    console.log('🔍 Verificando daños en tabla de migración vs vista unificada\n');

    // 1. Verificar daños históricos 2024 (que deberían tener 608 daños)
    console.log('1. Verificando daños históricos 2024:');
    try {
      const historicos2024Response = await axios.get(`${BASE_URL}/dashboard/danos-historicos?year=2024`);
      const historicos2024Data = historicos2024Response.data;
      
      console.log(`   📊 totalDanos: ${historicos2024Data.totalDanos || 'N/A'}`);
      console.log(`   📊 danosPorTipo: ${JSON.stringify(historicos2024Data.danosPorTipo || [])}`);
      console.log(`   📊 totalPlanillas: ${historicos2024Data.totalPlanillas || 'N/A'}`);
    } catch (error) {
      console.log(`   ❌ Error en daños históricos 2024: ${error.response?.status || error.message}`);
    }

    // 2. Verificar daños combinadas 2024
    console.log('\n2. Verificando daños combinadas 2024:');
    try {
      const combinadas2024Response = await axios.get(`${BASE_URL}/dashboard/danos-combinadas?year=2024`);
      const combinadas2024Data = combinadas2024Response.data;
      
      console.log(`   📊 totalDanos: ${combinadas2024Data.totalDanos || 'N/A'}`);
      console.log(`   📊 danosPorTipo: ${JSON.stringify(combinadas2024Data.danosPorTipo || [])}`);
      console.log(`   📊 totalPlanillas: ${combinadas2024Data.totalPlanillas || 'N/A'}`);
    } catch (error) {
      console.log(`   ❌ Error en daños combinadas 2024: ${error.response?.status || error.message}`);
    }

    // 3. Verificar daños históricos 2025
    console.log('\n3. Verificando daños históricos 2025:');
    try {
      const historicos2025Response = await axios.get(`${BASE_URL}/dashboard/danos-historicos?year=2025`);
      const historicos2025Data = historicos2025Response.data;
      
      console.log(`   📊 totalDanos: ${historicos2025Data.totalDanos || 'N/A'}`);
      console.log(`   📊 danosPorTipo: ${JSON.stringify(historicos2025Data.danosPorTipo || [])}`);
      console.log(`   📊 totalPlanillas: ${historicos2025Data.totalPlanillas || 'N/A'}`);
    } catch (error) {
      console.log(`   ❌ Error en daños históricos 2025: ${error.response?.status || error.message}`);
    }

    // 4. Verificar daños combinadas 2025
    console.log('\n4. Verificando daños combinadas 2025:');
    try {
      const combinadas2025Response = await axios.get(`${BASE_URL}/dashboard/danos-combinadas?year=2025`);
      const combinadas2025Data = combinadas2025Response.data;
      
      console.log(`   📊 totalDanos: ${combinadas2025Data.totalDanos || 'N/A'}`);
      console.log(`   📊 danosPorTipo: ${JSON.stringify(combinadas2025Data.danosPorTipo || [])}`);
      console.log(`   📊 totalPlanillas: ${combinadas2025Data.totalPlanillas || 'N/A'}`);
    } catch (error) {
      console.log(`   ❌ Error en daños combinadas 2025: ${error.response?.status || error.message}`);
    }

    // 5. Verificar vista unificada con diferentes orígenes
    console.log('\n5. Verificando vista unificada con diferentes orígenes:');
    const origenes = ['todos', 'historico_2025', 'activo'];
    
    for (const origen of origenes) {
      try {
        const origenResponse = await axios.get(`${BASE_URL}/dashboard/metrics?year=2025&origen=${origen}`);
        const origenData = origenResponse.data;
        
        console.log(`   📊 Origen ${origen}:`);
        console.log(`      - danosMes: ${origenData.danosMes || 'N/A'}`);
        console.log(`      - totalPlanillas: ${origenData.totalPlanillas || 'N/A'}`);
        console.log(`      - totalPabellones: ${origenData.totalPabellones || 'N/A'}`);
      } catch (error) {
        console.log(`   ❌ Error con origen ${origen}: ${error.response?.status || error.message}`);
      }
    }

    // 6. Verificar endpoint específico de daños sin autenticación
    console.log('\n6. Verificando endpoint de daños test (sin autenticación):');
    try {
      const danosTestResponse = await axios.get(`${BASE_URL}/danos/stats/test?year=2025`);
      const danosTestData = danosTestResponse.data;
      
      console.log(`   📊 totalDanos: ${danosTestData.totalDanos || 'N/A'}`);
      console.log(`   📊 danosPorTipo: ${JSON.stringify(danosTestData.danosPorTipo || [])}`);
      console.log(`   📊 danosPorSector: ${JSON.stringify(danosTestData.danosPorSector || [])}`);
    } catch (error) {
      console.log(`   ❌ Error en endpoint de daños test: ${error.response?.status || error.message}`);
    }

    // 7. Verificar endpoint de daños test con año 2024
    console.log('\n7. Verificando endpoint de daños test 2024:');
    try {
      const danosTest2024Response = await axios.get(`${BASE_URL}/danos/stats/test?year=2024`);
      const danosTest2024Data = danosTest2024Response.data;
      
      console.log(`   📊 totalDanos: ${danosTest2024Data.totalDanos || 'N/A'}`);
      console.log(`   📊 danosPorTipo: ${JSON.stringify(danosTest2024Data.danosPorTipo || [])}`);
      console.log(`   📊 danosPorSector: ${JSON.stringify(danosTest2024Data.danosPorSector || [])}`);
    } catch (error) {
      console.log(`   ❌ Error en endpoint de daños test 2024: ${error.response?.status || error.message}`);
    }

    // 8. Resumen final
    console.log('\n8. Resumen de la discrepancia:');
    console.log('   🔢 Daños esperados en 2024: 608');
    console.log('   🔢 Daños esperados en 2025: 584');
    console.log('   📊 Verificar si los datos están en las tablas correctas');
    console.log('   📊 Verificar si los endpoints están consultando las tablas correctas');

  } catch (error) {
    console.error('❌ Error al verificar daños de migración:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

verificarDanosMigracion();





