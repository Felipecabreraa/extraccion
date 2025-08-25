const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function verificarConfiguracionesFiltros() {
  try {
    console.log('🔍 VERIFICANDO CONFIGURACIONES Y FILTROS PARA EXPLICAR DIFERENCIAS\n');

    // 1. Análisis de la discrepancia
    console.log('1. ANÁLISIS DE LA DISCREPANCIA:');
    console.log('   📊 Excel: 608 daños (Hembra: 347, Macho: 261)');
    console.log('   📊 Sistema: 584 daños (Hembra: 446, Macho: 129)');
    console.log('   📊 Diferencia total: 24 daños');
    console.log('   📊 Diferencia Hembra: +99 daños en sistema');
    console.log('   📊 Diferencia Macho: -132 daños en sistema');

    // 2. Verificar configuraciones de la vista unificada
    console.log('\n2. VERIFICANDO CONFIGURACIONES DE LA VISTA UNIFICADA:');
    console.log('   📋 Consulta 1 - Estructura de la vista:');
    console.log('   SHOW CREATE VIEW vw_ordenes_2025_actual;');
    
    console.log('\n   📋 Consulta 2 - Filtros aplicados:');
    console.log('   SELECT COUNT(*) as total_registros');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL;');

    // 3. Verificar clasificación por género
    console.log('\n3. VERIFICANDO CLASIFICACIÓN POR GÉNERO:');
    console.log('   📋 Consulta 3 - Daños por género en tabla original:');
    console.log('   SELECT');
    console.log('     tipo_operador,');
    console.log('     COUNT(*) as total_registros,');
    console.log('     SUM(cantidad_dano) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano > 0');
    console.log('   GROUP BY tipo_operador;');

    // 4. Verificar zonas y sectores
    console.log('\n4. VERIFICANDO ZONAS Y SECTORES:');
    console.log('   📋 Consulta 4 - Daños por zona:');
    console.log('   SELECT');
    console.log('     zona,');
    console.log('     COUNT(*) as total_registros,');
    console.log('     SUM(cantidad_dano) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano > 0');
    console.log('   GROUP BY zona;');

    // 5. Verificar fechas y períodos
    console.log('\n5. VERIFICANDO FECHAS Y PERÍODOS:');
    console.log('   📋 Consulta 5 - Rango de fechas:');
    console.log('   SELECT');
    console.log('     MIN(fecha_inicio) as fecha_minima,');
    console.log('     MAX(fecha_inicio) as fecha_maxima,');
    console.log('     COUNT(*) as total_registros');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano > 0;');

    // 6. Verificar operadores específicos
    console.log('\n6. VERIFICANDO OPERADORES ESPECÍFICOS:');
    console.log('   📋 Consulta 6 - Top 10 operadores:');
    console.log('   SELECT');
    console.log('     nombre_operador,');
    console.log('     tipo_operador,');
    console.log('     zona,');
    console.log('     COUNT(*) as total_registros,');
    console.log('     SUM(cantidad_dano) as total_danos');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano > 0');
    console.log('   GROUP BY nombre_operador, tipo_operador, zona');
    console.log('   ORDER BY total_danos DESC');
    console.log('   LIMIT 10;');

    // 7. Verificar registros duplicados o inconsistentes
    console.log('\n7. VERIFICANDO REGISTROS DUPLICADOS:');
    console.log('   📋 Consulta 7 - Registros duplicados:');
    console.log('   SELECT');
    console.log('     id_orden_servicio,');
    console.log('     COUNT(*) as cantidad_duplicados');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano > 0');
    console.log('   GROUP BY id_orden_servicio');
    console.log('   HAVING COUNT(*) > 1;');

    // 8. Verificar campos NULL o vacíos
    console.log('\n8. VERIFICANDO CAMPOS NULL O VACÍOS:');
    console.log('   📋 Consulta 8 - Campos problemáticos:');
    console.log('   SELECT');
    console.log('     COUNT(*) as total_registros,');
    console.log('     SUM(CASE WHEN nombre_operador IS NULL OR nombre_operador = \'\' THEN 1 ELSE 0 END) as sin_operador,');
    console.log('     SUM(CASE WHEN tipo_operador IS NULL OR tipo_operador = \'\' THEN 1 ELSE 0 END) as sin_tipo,');
    console.log('     SUM(CASE WHEN zona IS NULL OR zona = \'\' THEN 1 ELSE 0 END) as sin_zona');
    console.log('   FROM migracion_ordenes_2025');
    console.log('   WHERE fecha_inicio IS NOT NULL AND cantidad_dano > 0;');

    // 9. Hipótesis sobre las diferencias
    console.log('\n9. HIPÓTESIS SOBRE LAS DIFERENCIAS:');
    console.log('   💡 Hipótesis 1: Diferentes criterios de clasificación por género');
    console.log('      - Excel podría usar un criterio diferente para Hembra/Macho');
    console.log('      - Sistema podría tener una lógica de clasificación distinta');
    
    console.log('\n   💡 Hipótesis 2: Diferentes períodos de tiempo');
    console.log('      - Excel podría incluir datos de otro período');
    console.log('      - Sistema podría tener filtros de fecha más restrictivos');
    
    console.log('\n   💡 Hipótesis 3: Diferentes fuentes de datos');
    console.log('      - Excel podría consolidar datos de múltiples fuentes');
    console.log('      - Sistema podría usar solo migracion_ordenes_2025');
    
    console.log('\n   💡 Hipótesis 4: Diferentes métodos de consolidación');
    console.log('      - Excel podría usar fórmulas o cálculos específicos');
    console.log('      - Sistema podría tener filtros adicionales');

    // 10. Plan de verificación
    console.log('\n10. PLAN DE VERIFICACIÓN:');
    console.log('    📋 Paso 1: Ejecutar consultas 1-8 para obtener datos detallados');
    console.log('    📋 Paso 2: Comparar criterios de clasificación por género');
    console.log('    📋 Paso 3: Verificar períodos de tiempo y fechas');
    console.log('    📋 Paso 4: Identificar diferencias en zonas o sectores');
    console.log('    📋 Paso 5: Verificar si hay registros duplicados o inconsistentes');

    // 11. Recomendación
    console.log('\n11. RECOMENDACIÓN:');
    console.log('    🎯 Ejecutar las consultas SQL para obtener información detallada');
    console.log('    🎯 Comparar criterios de clasificación entre Excel y sistema');
    console.log('    🎯 Verificar si hay diferencias en períodos o fuentes de datos');
    console.log('    🎯 Identificar la causa raíz de las diferencias');

    console.log('\n✅ ANÁLISIS COMPLETO: Listo para verificar configuraciones y filtros');

  } catch (error) {
    console.error('❌ Error al verificar configuraciones:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

verificarConfiguracionesFiltros();





