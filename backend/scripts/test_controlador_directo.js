const { MetrosSuperficie, Zona, Sector } = require('../src/models');
const { Op } = require('sequelize');
const sequelize = require('../src/config/database');

async function testControladorDirecto() {
  try {
    console.log('🧪 Probando controlador directamente...\n');

    // 1. Verificar datos en la tabla
    console.log('1. Verificando datos en metros_superficie...');
    const totalRegistros = await MetrosSuperficie.count();
    console.log(`   📊 Total registros: ${totalRegistros}`);

    if (totalRegistros === 0) {
      console.log('   ⚠️  No hay datos en la tabla');
      return;
    }

    // 2. Probar método obtenerEstadisticas
    console.log('\n2. Probando obtenerEstadisticas...');
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const primerDia = new Date(currentYear, currentMonth - 1, 1);
      const ultimoDia = new Date(currentYear, currentMonth, 0);

      const datosMes = await MetrosSuperficie.findAll({
        where: {
          fecha: {
            [Op.between]: [primerDia, ultimoDia]
          }
        },
        include: [
          {
            model: Zona,
            as: 'Zona',
            attributes: ['id', 'nombre', 'tipo']
          },
          {
            model: Sector,
            as: 'Sector',
            attributes: ['id', 'nombre', 'mt2']
          }
        ],
        order: [['fecha', 'ASC']]
      });

      console.log(`   ✅ Datos encontrados: ${datosMes.length} registros`);

      const totales = {
        HEMBRA: { pabellones: 0, metros: 0 },
        MACHO: { pabellones: 0, metros: 0 }
      };

      datosMes.forEach(registro => {
        const tipo = registro.tipo_zona;
        if (totales[tipo]) {
          totales[tipo].pabellones += registro.pabellones_limpiados;
          totales[tipo].metros += parseFloat(registro.metros_cuadrados);
        }
      });

      const totalGeneral = {
        pabellones: totales.HEMBRA.pabellones + totales.MACHO.pabellones,
        metros: totales.HEMBRA.metros + totales.MACHO.metros
      };

      console.log('   📊 Resultados:');
      console.log(`      - HEMBRA: ${totales.HEMBRA.pabellones} pabellones, ${totales.HEMBRA.metros} m²`);
      console.log(`      - MACHO: ${totales.MACHO.pabellones} pabellones, ${totales.MACHO.metros} m²`);
      console.log(`      - Total: ${totalGeneral.pabellones} pabellones, ${totalGeneral.metros} m²`);

    } catch (error) {
      console.log('   ❌ Error en obtenerEstadisticas:', error.message);
    }

    // 3. Probar método obtenerMesAnterior
    console.log('\n3. Probando obtenerMesAnterior...');
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      let mesAnterior = currentMonth - 1;
      let yearAnterior = currentYear;
      
      if (mesAnterior === 0) {
        mesAnterior = 12;
        yearAnterior = currentYear - 1;
      }

      const primerDiaMesAnterior = new Date(yearAnterior, mesAnterior - 1, 1);
      const ultimoDiaMesAnterior = new Date(yearAnterior, mesAnterior, 0);

      const resultado = await MetrosSuperficie.findOne({
        where: {
          fecha: {
            [Op.between]: [primerDiaMesAnterior, ultimoDiaMesAnterior]
          }
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('metros_cuadrados')), 'total_metros']
        ],
        raw: true
      });

      const totalMesAnterior = parseFloat(resultado?.total_metros || 0);

      console.log(`   ✅ Mes anterior (${yearAnterior}-${mesAnterior}): ${totalMesAnterior} m²`);

    } catch (error) {
      console.log('   ❌ Error en obtenerMesAnterior:', error.message);
    }

    // 4. Verificar algunos registros de ejemplo
    console.log('\n4. Verificando registros de ejemplo...');
    try {
      const registros = await MetrosSuperficie.findAll({
        include: [
          { model: Zona, as: 'Zona', attributes: ['nombre'] },
          { model: Sector, as: 'Sector', attributes: ['nombre'] }
        ],
        limit: 5,
        order: [['fecha', 'DESC']]
      });

      console.log('   📋 Últimos registros:');
      registros.forEach(registro => {
        const fecha = registro.fecha instanceof Date ? registro.fecha.toISOString().split('T')[0] : registro.fecha;
        console.log(`      - ${fecha}: ${registro.pabellones_limpiados} pabellones, ${registro.metros_cuadrados} m² (${registro.tipo_zona})`);
      });

    } catch (error) {
      console.log('   ❌ Error obteniendo registros:', error.message);
    }

    console.log('\n✅ Pruebas del controlador completadas!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await sequelize.close();
  }
}

testControladorDirecto(); 