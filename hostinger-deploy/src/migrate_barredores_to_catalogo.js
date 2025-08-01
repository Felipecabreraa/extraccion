const { Barredor, BarredorCatalogo, sequelize } = require('./models');

async function migrateBarredores() {
  try {
    // 1. Obtener todos los barredores únicos por nombre, apellido y rut
    const barredoresUnicos = await Barredor.findAll({
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('nombre')), 'nombre'],
        'apellido',
        'rut'
      ]
    });

    // 2. Insertar en el catálogo si no existe
    for (const b of barredoresUnicos) {
      const [cat] = await BarredorCatalogo.findOrCreate({
        where: {
          nombre: b.nombre,
          apellido: b.apellido,
          rut: b.rut
        }
      });
    }

    // 3. Actualizar cada barredor de planilla con el id del catálogo
    const barredores = await Barredor.findAll();
    for (const b of barredores) {
      const cat = await BarredorCatalogo.findOne({
        where: {
          nombre: b.nombre,
          apellido: b.apellido,
          rut: b.rut
        }
      });
      if (cat) {
        b.barredor_id = cat.id;
        await b.save();
      }
    }

    console.log('Migración completada.');
    process.exit(0);
  } catch (err) {
    console.error('Error en la migración:', err);
    process.exit(1);
  }
}

migrateBarredores(); 