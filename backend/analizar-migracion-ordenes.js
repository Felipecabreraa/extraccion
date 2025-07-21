const sequelize = require('./src/config/database');
const { Dano, Planilla, Sector, Maquina, Operador } = require('./src/models');

async function analizarMigracionOrdenes() {
  try {
    console.log('🔍 Analizando tabla migracion_ordenes...');
    
    // Verificar si existe la tabla
    const [tablas] = await sequelize.query("SHOW TABLES LIKE 'migracion_ordenes'");
    
    if (tablas.length === 0) {
      console.log('❌ La tabla migracion_ordenes NO EXISTE');
      console.log('💡 Esta tabla debería contener los datos históricos del 2024');
      return;
    }
    
    console.log('✅ La tabla migracion_ordenes EXISTE');
    
    // Obtener estructura de la tabla
    const [columnas] = await sequelize.query('DESCRIBE migracion_ordenes');
    
    console.log('\n📋 Estructura de la tabla migracion_ordenes:');
    const camposFecha = [];
    const camposDano = [];
    
    columnas.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      
      // Identificar campos de fecha
      if (col.Field.toLowerCase().includes('fecha') || col.Type.includes('date')) {
        camposFecha.push(col.Field);
      }
      
      // Identificar campos relacionados con daños
      if (col.Field.toLowerCase().includes('dano') || 
          col.Field.toLowerCase().includes('daño') ||
          col.Field.toLowerCase().includes('tipo') ||
          col.Field.toLowerCase().includes('descripcion')) {
        camposDano.push(col.Field);
      }
    });
    
    console.log('\n📅 Campos de fecha encontrados:', camposFecha);
    console.log('🔧 Campos relacionados con daños:', camposDano);
    
    // Contar registros totales
    const [conteo] = await sequelize.query('SELECT COUNT(*) as total FROM migracion_ordenes');
    console.log(`\n📊 Total de registros: ${conteo[0].total}`);
    
    // Analizar datos por año
    console.log('\n📈 Análisis por año:');
    for (const campoFecha of camposFecha) {
      try {
        const [datosAnio] = await sequelize.query(`
          SELECT YEAR(${campoFecha}) as anio, COUNT(*) as total
          FROM migracion_ordenes 
          WHERE ${campoFecha} IS NOT NULL
          GROUP BY YEAR(${campoFecha})
          ORDER BY anio DESC
        `);
        
        if (datosAnio.length > 0) {
          console.log(`  Por ${campoFecha}:`);
          datosAnio.forEach(row => {
            console.log(`    ${row.anio}: ${row.total} registros`);
          });
        }
      } catch (error) {
        // Ignorar errores de campos de fecha que no existen
      }
    }
    
    // Analizar tipos de daños si existen
    if (camposDano.length > 0) {
      console.log('\n🔧 Análisis de daños:');
      
      for (const campoDano of camposDano) {
        try {
          const [tiposDano] = await sequelize.query(`
            SELECT ${campoDano}, COUNT(*) as total
            FROM migracion_ordenes 
            WHERE ${campoDano} IS NOT NULL AND ${campoDano} != ''
            GROUP BY ${campoDano}
            ORDER BY total DESC
            LIMIT 10
          `);
          
          if (tiposDano.length > 0) {
            console.log(`  Por ${campoDano}:`);
            tiposDano.forEach(row => {
              console.log(`    ${row[campoDano]}: ${row.total} registros`);
            });
          }
        } catch (error) {
          // Ignorar errores de campos que no existen
        }
      }
    }
    
    // Mostrar algunos registros de ejemplo
    const [muestras] = await sequelize.query('SELECT * FROM migracion_ordenes LIMIT 2');
    
    if (muestras.length > 0) {
      console.log('\n📄 Muestras de registros:');
      muestras.forEach((registro, index) => {
        console.log(`\n  Registro ${index + 1}:`);
        Object.entries(registro).forEach(([campo, valor]) => {
          console.log(`    ${campo}: ${valor}`);
        });
      });
    }
    
    console.log('\n🎯 RECOMENDACIONES PARA INTEGRACIÓN:');
    console.log('=====================================');
    console.log('1. Crear un endpoint específico para datos históricos del 2024');
    console.log('2. Mapear los campos de migracion_ordenes a la estructura de daños');
    console.log('3. Crear una vista unificada que combine datos actuales e históricos');
    console.log('4. Implementar filtros para distinguir entre datos actuales e históricos');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

// Función para crear la integración con el sistema de daños
async function crearIntegracionDanos() {
  try {
    console.log('\n🚀 Creando integración con sistema de daños...');
    
    // Crear un endpoint específico para datos históricos
    const endpointHistorico = `
    // Nuevo endpoint para datos históricos del 2024
    exports.getDanoStatsHistorico = async (req, res) => {
      try {
        const year = req.query.year ? parseInt(req.query.year) : 2024;
        
        // Combinar datos actuales con históricos
        const datosActuales = await obtenerDatosActuales(year);
        const datosHistoricos = await obtenerDatosHistoricos(year);
        
        const response = {
          ...datosActuales,
          datosHistoricos: datosHistoricos,
          totalCombinado: datosActuales.totalAnual.actual + datosHistoricos.total
        };
        
        res.json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
    `;
    
    console.log('✅ Endpoint histórico creado');
    console.log('📝 Código del endpoint:');
    console.log(endpointHistorico);
    
  } catch (error) {
    console.error('❌ Error creando integración:', error.message);
  }
}

// Ejecutar análisis
analizarMigracionOrdenes().then(() => {
  return crearIntegracionDanos();
}); 