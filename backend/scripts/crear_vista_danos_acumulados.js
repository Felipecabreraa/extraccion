const sequelize = require('../src/config/database');

async function crearVistaDanosAcumulados() {
  try {
    console.log('🔧 Creando vista vista_danos_acumulados...');
    
    // Crear la vista que calcula los acumulados mes a mes
    await sequelize.query(`
      CREATE OR REPLACE VIEW vista_danos_acumulados AS
      SELECT 
        anio,
        mes,
        valor_real,
        valor_ppto,
        valor_anio_ant,

        SUM(valor_real) OVER (
          PARTITION BY anio ORDER BY mes
        ) AS real_acumulado,

        SUM(valor_ppto) OVER (
          PARTITION BY anio ORDER BY mes
        ) AS ppto_acumulado,

        SUM(valor_anio_ant) OVER (
          PARTITION BY anio ORDER BY mes
        ) AS anio_ant_acumulado

      FROM reporte_danos_mensuales
      ORDER BY anio, mes
    `);
    
    console.log('✅ Vista vista_danos_acumulados creada exitosamente');
    
    // Verificar que la vista se creó correctamente
    const [resultado] = await sequelize.query(`
      SELECT COUNT(*) as total_registros
      FROM vista_danos_acumulados
    `);
    
    console.log(`📊 Total de registros en la vista: ${resultado[0].total_registros}`);
    
    // Mostrar estructura de la vista
    const [estructura] = await sequelize.query(`
      DESCRIBE vista_danos_acumulados
    `);
    
    console.log('📋 Estructura de la vista:');
    estructura.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
  } catch (error) {
    console.error('❌ Error creando vista de daños acumulados:', error);
    throw error;
  }
}

async function insertarDatosEjemplo() {
  try {
    console.log('📝 Insertando datos de ejemplo...');
    
    // Datos de ejemplo para 2024 (año base)
    const datos2024 = [
      { anio: 2024, mes: 1, valor_real: 1500000, valor_ppto: 1400000, valor_anio_ant: 0 },
      { anio: 2024, mes: 2, valor_real: 1800000, valor_ppto: 1600000, valor_anio_ant: 0 },
      { anio: 2024, mes: 3, valor_real: 2200000, valor_ppto: 2000000, valor_anio_ant: 0 },
      { anio: 2024, mes: 4, valor_real: 1900000, valor_ppto: 1800000, valor_anio_ant: 0 },
      { anio: 2024, mes: 5, valor_real: 2500000, valor_ppto: 2200000, valor_anio_ant: 0 },
      { anio: 2024, mes: 6, valor_real: 2800000, valor_ppto: 2500000, valor_anio_ant: 0 },
      { anio: 2024, mes: 7, valor_real: 3200000, valor_ppto: 2800000, valor_anio_ant: 0 },
      { anio: 2024, mes: 8, valor_real: 2900000, valor_ppto: 2600000, valor_anio_ant: 0 },
      { anio: 2024, mes: 9, valor_real: 2600000, valor_ppto: 2400000, valor_anio_ant: 0 },
      { anio: 2024, mes: 10, valor_real: 2400000, valor_ppto: 2200000, valor_anio_ant: 0 },
      { anio: 2024, mes: 11, valor_real: 2100000, valor_ppto: 2000000, valor_anio_ant: 0 },
      { anio: 2024, mes: 12, valor_real: 1800000, valor_ppto: 1700000, valor_anio_ant: 0 }
    ];
    
    // Datos de ejemplo para 2025 (año actual)
    const datos2025 = [
      { anio: 2025, mes: 1, valor_real: 1600000, valor_ppto: 1500000, valor_anio_ant: 1500000 },
      { anio: 2025, mes: 2, valor_real: 1900000, valor_ppto: 1700000, valor_anio_ant: 1800000 },
      { anio: 2025, mes: 3, valor_real: 2300000, valor_ppto: 2100000, valor_anio_ant: 2200000 },
      { anio: 2025, mes: 4, valor_real: 2000000, valor_ppto: 1900000, valor_anio_ant: 1900000 },
      { anio: 2025, mes: 5, valor_real: 2600000, valor_ppto: 2300000, valor_anio_ant: 2500000 },
      { anio: 2025, mes: 6, valor_real: 0, valor_ppto: 2600000, valor_anio_ant: 2800000 },
      { anio: 2025, mes: 7, valor_real: 0, valor_ppto: 2900000, valor_anio_ant: 3200000 },
      { anio: 2025, mes: 8, valor_real: 0, valor_ppto: 2700000, valor_anio_ant: 2900000 },
      { anio: 2025, mes: 9, valor_real: 0, valor_ppto: 2500000, valor_anio_ant: 2600000 },
      { anio: 2025, mes: 10, valor_real: 0, valor_ppto: 2300000, valor_anio_ant: 2400000 },
      { anio: 2025, mes: 11, valor_real: 0, valor_ppto: 2100000, valor_anio_ant: 2100000 },
      { anio: 2025, mes: 12, valor_real: 0, valor_ppto: 1800000, valor_anio_ant: 1800000 }
    ];
    
    // Insertar datos de 2024
    for (const dato of datos2024) {
      await sequelize.query(`
        INSERT INTO reporte_danos_mensuales (anio, mes, valor_real, valor_ppto, valor_anio_ant, fecha_creacion, fecha_actualizacion)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          valor_real = VALUES(valor_real),
          valor_ppto = VALUES(valor_ppto),
          fecha_actualizacion = NOW()
      `, {
        replacements: [dato.anio, dato.mes, dato.valor_real, dato.valor_ppto, dato.valor_anio_ant]
      });
    }
    
    // Insertar datos de 2025
    for (const dato of datos2025) {
      await sequelize.query(`
        INSERT INTO reporte_danos_mensuales (anio, mes, valor_real, valor_ppto, valor_anio_ant, fecha_creacion, fecha_actualizacion)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          valor_real = VALUES(valor_real),
          valor_ppto = VALUES(valor_ppto),
          valor_anio_ant = VALUES(valor_anio_ant),
          fecha_actualizacion = NOW()
      `, {
        replacements: [dato.anio, dato.mes, dato.valor_real, dato.valor_ppto, dato.valor_anio_ant]
      });
    }
    
    console.log('✅ Datos de ejemplo insertados exitosamente');
    
    // Verificar datos insertados
    const [totalRegistros] = await sequelize.query(`
      SELECT 
        anio,
        COUNT(*) as total_meses,
        SUM(valor_real) as total_real,
        SUM(valor_ppto) as total_ppto
      FROM reporte_danos_mensuales
      GROUP BY anio
      ORDER BY anio
    `);
    
    console.log('📊 Resumen de datos insertados:');
    totalRegistros.forEach(row => {
      console.log(`  - Año ${row.anio}: ${row.total_meses} meses, Real: $${row.total_real.toLocaleString()}, Ppto: $${row.total_ppto.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error insertando datos de ejemplo:', error);
    throw error;
  }
}

async function probarVista() {
  try {
    console.log('🧪 Probando vista de daños acumulados...');
    
    // Probar consulta básica
    const [resultado] = await sequelize.query(`
      SELECT 
        anio,
        mes,
        valor_real,
        valor_ppto,
        valor_anio_ant,
        real_acumulado,
        ppto_acumulado,
        anio_ant_acumulado
      FROM vista_danos_acumulados
      WHERE anio IN (2024, 2025)
      ORDER BY anio, mes
      LIMIT 10
    `);
    
    console.log('📋 Primeros 10 registros de la vista:');
    resultado.forEach(row => {
      console.log(`  ${row.anio}-${row.mes.toString().padStart(2, '0')}: Real=$${row.valor_real.toLocaleString()}, Acumulado=$${row.real_acumulado.toLocaleString()}`);
    });
    
    // Probar cálculo de variación anual
    const [variacion] = await sequelize.query(`
      SELECT 
        actual.anio AS anio_actual,
        anterior.anio AS anio_anterior,
        actual.total_real,
        anterior.total_real AS total_anio_anterior,
        ROUND(
          CASE 
            WHEN anterior.total_real = 0 THEN 0
            ELSE (actual.total_real - anterior.total_real) * 100.0 / anterior.total_real
          END
        , 2) AS variacion_anual
      FROM (
        SELECT anio, SUM(valor_real) AS total_real
        FROM reporte_danos_mensuales
        GROUP BY anio
      ) actual
      JOIN (
        SELECT anio + 1 AS anio, SUM(valor_real) AS total_real
        FROM reporte_danos_mensuales
        GROUP BY anio
      ) anterior ON actual.anio = anterior.anio
    `);
    
    if (variacion.length > 0) {
      console.log('📊 Variación anual calculada:');
      variacion.forEach(row => {
        console.log(`  ${row.anio_actual} vs ${row.anio_anterior}: ${row.variacion_anual}%`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error probando vista:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando configuración del sistema de reporte de daños acumulados...');
    
    // 1. Crear vista
    await crearVistaDanosAcumulados();
    
    // 2. Insertar datos de ejemplo
    await insertarDatosEjemplo();
    
    // 3. Probar vista
    await probarVista();
    
    console.log('✅ Configuración completada exitosamente');
    console.log('📋 Endpoints disponibles:');
    console.log('  - GET /api/danos-acumulados');
    console.log('  - POST /api/danos-acumulados/registro');
    console.log('  - POST /api/danos-acumulados/cargar-anio-anterior');
    console.log('  - POST /api/danos-acumulados/calcular-variacion');
    console.log('  - GET /api/danos-acumulados/resumen-ejecutivo');
    
  } catch (error) {
    console.error('❌ Error en la configuración:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  crearVistaDanosAcumulados,
  insertarDatosEjemplo,
  probarVista
}; 