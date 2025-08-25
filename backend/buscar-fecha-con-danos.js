const { Op, fn, col } = require('sequelize');
const VwOrdenesUnificadaCompleta = require('./src/models/vwOrdenesUnificadaCompleta');

async function buscarFechaConDanos() {
  try {
    console.log('🔍 Buscando fechas con daños registrados...\n');

    // Buscar fechas con daños
    const fechasConDanos = await VwOrdenesUnificadaCompleta.findAll({
      where: {
        tipo_dano: {
          [Op.ne]: null
        }
      },
      attributes: [
        [fn('DATE', col('fecha_inicio')), 'fecha'],
        [fn('COUNT', col('id')), 'total']
      ],
      group: [fn('DATE', col('fecha_inicio'))],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10
    });

    console.log('📅 FECHAS CON MÁS DAÑOS:');
    fechasConDanos.forEach(item => {
      console.log(`   • ${item.dataValues.fecha}: ${item.dataValues.total} daños`);
    });

    // Tomar la primera fecha con más daños
    if (fechasConDanos.length > 0) {
      const fechaConMasDanos = fechasConDanos[0].dataValues.fecha;
      console.log(`\n🎯 Fecha seleccionada para prueba: ${fechaConMasDanos}`);
      
      // Verificar detalles de esa fecha
      console.log('\n📊 DETALLES DE LA FECHA SELECCIONADA:');
      const detallesFecha = await VwOrdenesUnificadaCompleta.findAll({
        where: {
          fecha_inicio: {
            [Op.between]: [
              new Date(fechaConMasDanos + ' 00:00:00'),
              new Date(fechaConMasDanos + ' 23:59:59')
            ]
          },
          tipo_dano: {
            [Op.ne]: null
          }
        },
        attributes: [
          'sector',
          'operador',
          'descripcion_dano',
          'tipo_dano'
        ],
        limit: 5
      });

      detallesFecha.forEach(item => {
        console.log(`   • ${item.sector || 'Sin sector'} - ${item.operador || 'Sin operador'}: ${item.descripcion_dano || 'Sin descripción'}`);
      });
    }

    console.log('\n✅ Búsqueda completada');

  } catch (error) {
    console.error('❌ Error buscando fechas:', error);
  }
}

buscarFechaConDanos();



