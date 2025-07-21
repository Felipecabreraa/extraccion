const { Dano, Planilla } = require('../src/models');
const sequelize = require('../src/config/database');

async function listarDanos() {
  const danos = await Dano.findAll({
    include: [{
      model: Planilla,
      as: 'Planilla',
      attributes: ['id', 'fecha_inicio']
    }]
  });

  console.log('ID | Año Planilla | Fecha Planilla | Tipo | Descripción');
  danos.forEach(dano => {
    const planilla = dano.Planilla;
    const fecha = planilla ? planilla.fecha_inicio : 'Sin planilla';
    const anio = planilla ? new Date(planilla.fecha_inicio).getFullYear() : 'Sin planilla';
    console.log(`${dano.id} | ${anio} | ${fecha} | ${dano.tipo} | ${dano.descripcion}`);
  });

  await sequelize.close();
}

listarDanos(); 