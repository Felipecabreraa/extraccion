const { Dano, Planilla, Sector, Usuario, Zona } = require('../src/models');
const sequelize = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function verificarYCrearDatos() {
  try {
    console.log('🔍 Verificando datos existentes en el sistema...\n');

    // 1. Verificar zonas
    const zonas = await Zona.findAll();
    console.log(`📍 Zonas encontradas: ${zonas.length}`);
    if (zonas.length === 0) {
      console.log('Creando zona de prueba...');
      await Zona.create({ nombre: 'Zona Principal' });
      console.log('✅ Zona creada');
    }

    // 2. Verificar sectores
    const sectores = await Sector.findAll();
    console.log(`🏢 Sectores encontrados: ${sectores.length}`);
    if (sectores.length === 0) {
      console.log('Creando sectores de prueba...');
      const zonaId = (await Zona.findOne()).id;
      await Sector.bulkCreate([
        { nombre: 'Sector Norte', mt2: 1000, cantidad_pabellones: 5, zona_id: zonaId },
        { nombre: 'Sector Sur', mt2: 1200, cantidad_pabellones: 6, zona_id: zonaId },
        { nombre: 'Sector Este', mt2: 800, cantidad_pabellones: 4, zona_id: zonaId },
        { nombre: 'Sector Oeste', mt2: 900, cantidad_pabellones: 5, zona_id: zonaId }
      ]);
      console.log('✅ Sectores creados');
    }

    // 3. Verificar usuarios
    const usuarios = await Usuario.findAll();
    console.log(`👥 Usuarios encontrados: ${usuarios.length}`);
    if (usuarios.length === 0) {
      console.log('Creando usuarios de prueba...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Usuario.bulkCreate([
        { nombre: 'Admin Test', email: 'admin@test.com', password: hashedPassword, rol: 'administrador' },
        { nombre: 'Supervisor Test', email: 'supervisor@test.com', password: hashedPassword, rol: 'supervisor' }
      ]);
      console.log('✅ Usuarios creados');
    }

    // 4. Verificar planillas
    const planillas = await Planilla.findAll({
      include: [{ model: Sector, as: 'Sector' }]
    });
    console.log(`📋 Planillas encontradas: ${planillas.length}`);

    if (planillas.length === 0) {
      console.log('Creando planillas de prueba...');
      const sectoresDisponibles = await Sector.findAll();
      const supervisores = await Usuario.findAll({ where: { rol: 'supervisor' } });
      
      if (sectoresDisponibles.length > 0 && supervisores.length > 0) {
        const planillasPrueba = [];
        const fechas = [
          new Date(2024, 0, 15), // Enero 2024
          new Date(2024, 1, 20), // Febrero 2024
          new Date(2024, 2, 10), // Marzo 2024
          new Date(2024, 3, 5),  // Abril 2024
          new Date(2024, 4, 12), // Mayo 2024
          new Date(2024, 5, 8),  // Junio 2024
          new Date(2023, 11, 15), // Diciembre 2023
          new Date(2023, 10, 20), // Noviembre 2023
          new Date(2023, 9, 10),  // Octubre 2023
          new Date(2023, 8, 5),   // Septiembre 2023
        ];

        for (let i = 0; i < 10; i++) {
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

    // 5. Verificar daños existentes
    const danosExistentes = await Dano.count();
    console.log(`⚠️  Daños existentes: ${danosExistentes}`);

    if (danosExistentes === 0) {
      console.log('Creando daños de prueba...');
      
      // Obtener planillas actualizadas
      const planillasActualizadas = await Planilla.findAll({
        include: [{ model: Sector, as: 'Sector' }],
        limit: 10
      });

      const tiposDano = ['infraestructura', 'equipo'];
      const descripciones = [
        'Pared dañada',
        'Puerta rota',
        'Ventana fracturada',
        'Equipo de limpieza defectuoso',
        'Sistema eléctrico dañado',
        'Tubería rota',
        'Equipo mecánico averiado',
        'Infraestructura deteriorada',
        'Piso agrietado',
        'Techo con filtraciones'
      ];

      const danosPrueba = [];

      // Crear daños para diferentes meses y años
      planillasActualizadas.forEach((planilla, index) => {
        const cantidadDanos = Math.floor(Math.random() * 4) + 1; // 1-4 daños por planilla
        
        for (let i = 0; i < cantidadDanos; i++) {
          danosPrueba.push({
            planilla_id: planilla.id,
            pabellon_id: null,
            maquina_id: null,
            tipo: tiposDano[Math.floor(Math.random() * tiposDano.length)],
            descripcion: descripciones[Math.floor(Math.random() * descripciones.length)],
            cantidad: Math.floor(Math.random() * 5) + 1,
            observacion: `Observación de prueba ${index + 1}-${i + 1}`
          });
        }
      });

      await Dano.bulkCreate(danosPrueba);
      console.log(`✅ ${danosPrueba.length} daños de prueba insertados`);
    }

    // 6. Mostrar resumen final
    console.log('\n📊 RESUMEN FINAL DEL SISTEMA:');
    
    const totalZonas = await Zona.count();
    const totalSectores = await Sector.count();
    const totalUsuarios = await Usuario.count();
    const totalPlanillas = await Planilla.count();
    const totalDanos = await Dano.count();

    console.log(`   - Zonas: ${totalZonas}`);
    console.log(`   - Sectores: ${totalSectores}`);
    console.log(`   - Usuarios: ${totalUsuarios}`);
    console.log(`   - Planillas: ${totalPlanillas}`);
    console.log(`   - Daños: ${totalDanos}`);

    // Mostrar daños por tipo
    const danosPorTipo = await Dano.findAll({
      attributes: [
        'tipo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: ['tipo'],
      raw: true
    });

    console.log('\n📈 Distribución de daños por tipo:');
    danosPorTipo.forEach(item => {
      console.log(`   - ${item.tipo}: ${item.cantidad}`);
    });

    // Mostrar planillas por año
    const planillasPorAno = await Planilla.findAll({
      attributes: [
        [sequelize.fn('YEAR', sequelize.col('fecha_inicio')), 'ano'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: [sequelize.fn('YEAR', sequelize.col('fecha_inicio'))],
      raw: true
    });

    console.log('\n📅 Planillas por año:');
    planillasPorAno.forEach(item => {
      console.log(`   - ${item.ano}: ${item.cantidad} planillas`);
    });

    console.log('\n🎉 Sistema verificado y preparado correctamente!');
    console.log('💡 Ahora puedes probar la página de Daños en el frontend');
    console.log('🔑 Credenciales de prueba: admin@test.com / admin123');

  } catch (error) {
    console.error('❌ Error verificando/creando datos:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
verificarYCrearDatos(); 