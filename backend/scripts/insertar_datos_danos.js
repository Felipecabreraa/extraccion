const { Dano, Planilla, Sector, Usuario } = require('../src/models');
const sequelize = require('../src/config/database');

async function insertarDatosDanos() {
  try {
    console.log('🔧 Insertando datos de prueba para daños...\n');

    // Verificar que existan planillas
    const planillas = await Planilla.findAll({
      include: [{ model: Sector, as: 'Sector' }],
      limit: 10
    });

    if (planillas.length === 0) {
      console.log('⚠️  No hay planillas disponibles. Creando planillas de prueba...');
      
      // Crear sectores de prueba si no existen
      const sectores = await Sector.findAll();
      if (sectores.length === 0) {
        console.log('Creando sectores de prueba...');
        await Sector.bulkCreate([
          { nombre: 'Sector Norte', mt2: 1000, cantidad_pabellones: 5, zona_id: 1 },
          { nombre: 'Sector Sur', mt2: 1200, cantidad_pabellones: 6, zona_id: 1 },
          { nombre: 'Sector Este', mt2: 800, cantidad_pabellones: 4, zona_id: 1 },
          { nombre: 'Sector Oeste', mt2: 900, cantidad_pabellones: 5, zona_id: 1 }
        ]);
      }

      // Crear usuarios de prueba si no existen
      const usuarios = await Usuario.findAll();
      if (usuarios.length === 0) {
        console.log('Creando usuarios de prueba...');
        await Usuario.bulkCreate([
          { nombre: 'Supervisor Test', email: 'supervisor@test.com', password: 'test123', rol: 'supervisor' },
          { nombre: 'Operador Test', email: 'operador@test.com', password: 'test123', rol: 'operador' }
        ]);
      }

      // Crear planillas de prueba
      const sectoresDisponibles = await Sector.findAll();
      const supervisores = await Usuario.findAll({ where: { rol: 'supervisor' } });
      
      if (sectoresDisponibles.length > 0 && supervisores.length > 0) {
        const planillasPrueba = [];
        const fechas = [
          new Date(2024, 0, 15), // Enero
          new Date(2024, 1, 20), // Febrero
          new Date(2024, 2, 10), // Marzo
          new Date(2024, 3, 5),  // Abril
          new Date(2024, 4, 12), // Mayo
          new Date(2024, 5, 8),  // Junio
          new Date(2023, 11, 15), // Diciembre 2023
          new Date(2023, 10, 20), // Noviembre 2023
        ];

        for (let i = 0; i < 8; i++) {
          planillasPrueba.push({
            supervisor_id: supervisores[0].id,
            sector_id: sectoresDisponibles[i % sectoresDisponibles.length].id,
            mt2: 800 + (i * 100),
            pabellones_total: 4 + (i % 3),
            pabellones_limpiados: 3 + (i % 2),
            fecha_inicio: fechas[i],
            fecha_termino: new Date(fechas[i].getTime() + 24 * 60 * 60 * 1000), // +1 día
            ticket: `TICKET-${2024 - (i > 5 ? 1 : 0)}-${String(i + 1).padStart(3, '0')}`,
            estado: i % 3 === 0 ? 'completada' : 'activa'
          });
        }

        await Planilla.bulkCreate(planillasPrueba);
        console.log('✅ Planillas de prueba creadas');
      }
    }

    // Obtener planillas actualizadas
    const planillasActualizadas = await Planilla.findAll({
      include: [{ model: Sector, as: 'Sector' }],
      limit: 10
    });

    console.log(`📋 Encontradas ${planillasActualizadas.length} planillas`);

    // Crear daños de prueba
    const tiposDano = ['infraestructura', 'equipo'];
    const descripciones = [
      'Pared dañada',
      'Puerta rota',
      'Ventana fracturada',
      'Equipo de limpieza defectuoso',
      'Sistema eléctrico dañado',
      'Tubería rota',
      'Equipo mecánico averiado',
      'Infraestructura deteriorada'
    ];

    const danosPrueba = [];

    // Crear daños para diferentes meses y años
    planillasActualizadas.forEach((planilla, index) => {
      const cantidadDanos = Math.floor(Math.random() * 3) + 1; // 1-3 daños por planilla
      
      for (let i = 0; i < cantidadDanos; i++) {
        danosPrueba.push({
          planilla_id: planilla.id,
          pabellon_id: null, // Opcional
          maquina_id: null,  // Opcional
          tipo: tiposDano[Math.floor(Math.random() * tiposDano.length)],
          descripcion: descripciones[Math.floor(Math.random() * descripciones.length)],
          cantidad: Math.floor(Math.random() * 5) + 1,
          observacion: `Observación de prueba ${index + 1}-${i + 1}`
        });
      }
    });

    // Insertar daños
    await Dano.bulkCreate(danosPrueba);
    console.log(`✅ ${danosPrueba.length} daños de prueba insertados`);

    // Mostrar resumen
    const totalDanos = await Dano.count();
    const danosPorTipo = await Dano.findAll({
      attributes: [
        'tipo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: ['tipo'],
      raw: true
    });

    console.log('\n📊 Resumen de datos insertados:');
    console.log(`   - Total de daños: ${totalDanos}`);
    danosPorTipo.forEach(item => {
      console.log(`   - ${item.tipo}: ${item.cantidad}`);
    });

    console.log('\n🎉 Datos de prueba de daños insertados correctamente!');
    console.log('💡 Ahora puedes probar la página de Daños en el frontend');

  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
insertarDatosDanos(); 