const { Planilla, Usuario, Sector, Zona } = require('../src/models');
const sequelize = require('../src/config/database');

async function mostrarEstructuraPlanillas() {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos.');

    // Obtener planillas con información relacionada
    const planillas = await Planilla.findAll({
      include: [
        { 
          model: Usuario, 
          as: 'supervisor', 
          attributes: ['id', 'nombre', 'email', 'rol'] 
        },
        { 
          model: Sector, 
          as: 'Sector', 
          attributes: ['id', 'nombre', 'mt2', 'cantidad_pabellones'],
          include: [
            {
              model: Zona,
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      limit: 5 // Solo mostrar las primeras 5 para el ejemplo
    });

    console.log('\n=== ESTRUCTURA DE DATOS DE PLANILLAS ===\n');

    if (planillas.length === 0) {
      console.log('No hay planillas en la base de datos.');
      console.log('\n=== ESTRUCTURA VACÍA ===');
      console.log(JSON.stringify({
        planillas: [],
        total_registros: 0,
        estructura_campos: {
          id: "INTEGER (Primary Key, Auto Increment)",
          supervisor_id: "INTEGER (Foreign Key -> Usuario.id)",
          sector_id: "INTEGER (Foreign Key -> Sector.id)",
          mt2: "DECIMAL(10,2) - Metros cuadrados",
          pabellones_total: "INTEGER - Total de pabellones",
          pabellones_limpiados: "INTEGER - Pabellones limpiados",
          fecha_inicio: "DATE - Fecha de inicio",
          fecha_termino: "DATE - Fecha de término",
          ticket: "STRING(100) - Número de ticket",
          estado: "ENUM('ABIERTO', 'CERRADO') - Estado de la planilla",
          observacion: "TEXT - Observaciones"
        },
        relaciones: {
          supervisor: "belongsTo Usuario (as: 'supervisor')",
          sector: "belongsTo Sector (as: 'Sector')",
          zona: "A través de Sector -> belongsTo Zona"
        }
      }, null, 2));
      return;
    }

    // Formatear los datos para mostrar la estructura
    const planillasFormateadas = planillas.map(planilla => {
      const planillaData = planilla.toJSON();
      return {
        id: planillaData.id,
        supervisor_id: planillaData.supervisor_id,
        sector_id: planillaData.sector_id,
        mt2: planillaData.mt2,
        pabellones_total: planillaData.pabellones_total,
        pabellones_limpiados: planillaData.pabellones_limpiados,
        fecha_inicio: planillaData.fecha_inicio,
        fecha_termino: planillaData.fecha_termino,
        ticket: planillaData.ticket,
        estado: planillaData.estado,
        observacion: planillaData.observacion,
        supervisor: planillaData.supervisor ? {
          id: planillaData.supervisor.id,
          nombre: planillaData.supervisor.nombre,
          email: planillaData.supervisor.email,
          rol: planillaData.supervisor.rol
        } : null,
        sector: planillaData.Sector ? {
          id: planillaData.Sector.id,
          nombre: planillaData.Sector.nombre,
          mt2: planillaData.Sector.mt2,
          cantidad_pabellones: planillaData.Sector.cantidad_pabellones,
          zona: planillaData.Sector.Zona ? {
            id: planillaData.Sector.Zona.id,
            nombre: planillaData.Sector.Zona.nombre
          } : null
        } : null
      };
    });

    // Obtener estadísticas generales
    const totalPlanillas = await Planilla.count();
    const planillasAbiertas = await Planilla.count({ where: { estado: 'ABIERTO' } });
    const planillasCerradas = await Planilla.count({ where: { estado: 'CERRADO' } });

    const estructuraCompleta = {
      metadata: {
        total_registros: totalPlanillas,
        planillas_abiertas: planillasAbiertas,
        planillas_cerradas: planillasCerradas,
        ejemplo_mostrado: planillas.length
      },
      estructura_campos: {
        id: "INTEGER (Primary Key, Auto Increment)",
        supervisor_id: "INTEGER (Foreign Key -> Usuario.id)",
        sector_id: "INTEGER (Foreign Key -> Sector.id)",
        mt2: "DECIMAL(10,2) - Metros cuadrados del sector",
        pabellones_total: "INTEGER - Total de pabellones en el sector",
        pabellones_limpiados: "INTEGER - Pabellones limpiados hasta el momento",
        fecha_inicio: "DATE - Fecha de inicio de la planilla",
        fecha_termino: "DATE - Fecha de término (puede ser null si está abierta)",
        ticket: "STRING(100) - Número de ticket o referencia",
        estado: "ENUM('ABIERTO', 'CERRADO') - Estado actual de la planilla",
        observacion: "TEXT - Observaciones adicionales"
      },
      relaciones: {
        supervisor: {
          tipo: "belongsTo",
          modelo: "Usuario",
          alias: "supervisor",
          campos: ["id", "nombre", "email", "rol"]
        },
        sector: {
          tipo: "belongsTo", 
          modelo: "Sector",
          alias: "Sector",
          campos: ["id", "nombre", "mt2", "cantidad_pabellones"],
          relaciones_anidadas: {
            zona: {
              tipo: "belongsTo",
              modelo: "Zona",
              campos: ["id", "nombre"]
            }
          }
        }
      },
      planillas: planillasFormateadas
    };

    console.log(JSON.stringify(estructuraCompleta, null, 2));

  } catch (error) {
    console.error('Error al obtener la estructura de planillas:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
mostrarEstructuraPlanillas(); 