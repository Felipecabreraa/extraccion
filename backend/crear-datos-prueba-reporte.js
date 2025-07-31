const { MetrosSuperficie, Zona, Sector, Usuario } = require('./src/models');

async function crearDatosPruebaReporte() {
  try {
    console.log('🧪 Creando datos de prueba para el reporte detallado...');

    // Verificar que existan zonas y sectores
    const zonas = await Zona.findAll();
    const sectores = await Sector.findAll();
    const usuarios = await Usuario.findAll();

    if (zonas.length === 0 || sectores.length === 0 || usuarios.length === 0) {
      console.log('❌ No hay zonas, sectores o usuarios disponibles');
      return;
    }

    // Limpiar registros existentes
    await MetrosSuperficie.destroy({ where: {} });
    console.log('✅ Registros anteriores eliminados');

    // Datos de prueba para julio 2025
    const datosPrueba = [
      // Primera quincena - Julio 2025
      { fecha: '2025-07-01', zona_id: 1, sector_id: 1, pabellones_limpiados: 7, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-02', zona_id: 2, sector_id: 2, pabellones_limpiados: 6, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-03', zona_id: 1, sector_id: 1, pabellones_limpiados: 6, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-04', zona_id: 2, sector_id: 2, pabellones_limpiados: 12, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-05', zona_id: 1, sector_id: 1, pabellones_limpiados: 6, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-06', zona_id: 2, sector_id: 2, pabellones_limpiados: 0, observacion: 'Domingo' },
      { fecha: '2025-07-07', zona_id: 1, sector_id: 1, pabellones_limpiados: 8, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-08', zona_id: 2, sector_id: 2, pabellones_limpiados: 13, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-09', zona_id: 1, sector_id: 1, pabellones_limpiados: 8, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-10', zona_id: 2, sector_id: 2, pabellones_limpiados: 14, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-11', zona_id: 1, sector_id: 1, pabellones_limpiados: 11, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-12', zona_id: 2, sector_id: 2, pabellones_limpiados: 0, observacion: 'Domingo' },
      { fecha: '2025-07-13', zona_id: 1, sector_id: 1, pabellones_limpiados: 0, observacion: 'Domingo' },
      { fecha: '2025-07-14', zona_id: 2, sector_id: 2, pabellones_limpiados: 13, observacion: 'Prueba 1ra quincena' },
      { fecha: '2025-07-15', zona_id: 1, sector_id: 1, pabellones_limpiados: 8, observacion: 'Prueba 1ra quincena' },

      // Segunda quincena - Julio 2025
      { fecha: '2025-07-16', zona_id: 2, sector_id: 2, pabellones_limpiados: 0, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-17', zona_id: 1, sector_id: 1, pabellones_limpiados: 0, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-18', zona_id: 2, sector_id: 2, pabellones_limpiados: 14, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-19', zona_id: 1, sector_id: 1, pabellones_limpiados: 8, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-20', zona_id: 2, sector_id: 2, pabellones_limpiados: 0, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-21', zona_id: 1, sector_id: 1, pabellones_limpiados: 10, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-22', zona_id: 2, sector_id: 2, pabellones_limpiados: 13, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-23', zona_id: 1, sector_id: 1, pabellones_limpiados: 8, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-24', zona_id: 2, sector_id: 2, pabellones_limpiados: 8, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-25', zona_id: 1, sector_id: 1, pabellones_limpiados: 8, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-26', zona_id: 2, sector_id: 2, pabellones_limpiados: 12, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-27', zona_id: 1, sector_id: 1, pabellones_limpiados: 4, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-28', zona_id: 2, sector_id: 2, pabellones_limpiados: 0, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-29', zona_id: 1, sector_id: 1, pabellones_limpiados: 0, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-30', zona_id: 2, sector_id: 2, pabellones_limpiados: 0, observacion: 'Prueba 2da quincena' },
      { fecha: '2025-07-31', zona_id: 1, sector_id: 1, pabellones_limpiados: 0, observacion: 'Prueba 2da quincena' }
    ];

    // Crear registros
    const registrosCreados = [];
    for (const dato of datosPrueba) {
      try {
        const zona = await Zona.findByPk(dato.zona_id);
        const sector = await Sector.findByPk(dato.sector_id);
        const usuario = usuarios[0]; // Usar el primer usuario disponible

        if (!zona || !sector) {
          console.log(`⚠️ Saltando registro: zona_id=${dato.zona_id}, sector_id=${dato.sector_id}`);
          continue;
        }

        const metros_cuadrados = parseFloat((dato.pabellones_limpiados * parseFloat(sector.mt2)).toFixed(2));

        const registro = await MetrosSuperficie.create({
          fecha: dato.fecha,
          zona_id: dato.zona_id,
          sector_id: dato.sector_id,
          pabellones_limpiados: dato.pabellones_limpiados,
          metros_cuadrados: metros_cuadrados,
          tipo_zona: zona.tipo,
          observacion: dato.observacion,
          creado_por: usuario.id
        });

        registrosCreados.push(registro);
        console.log(`✅ Registro creado: ${dato.fecha} - ${zona.nombre} - ${sector.nombre} - ${dato.pabellones_limpiados} pabellones - ${metros_cuadrados} m²`);

      } catch (error) {
        console.log(`❌ Error creando registro ${dato.fecha}:`, error.message);
      }
    }

    console.log(`\n🎉 Proceso completado:`);
    console.log(`📊 Total registros creados: ${registrosCreados.length}`);
    console.log(`📅 Período: Julio 2025`);
    console.log(`📋 Datos disponibles para el reporte detallado`);

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error.message);
  }
}

crearDatosPruebaReporte();