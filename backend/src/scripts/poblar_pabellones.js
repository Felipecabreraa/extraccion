require('dotenv').config();
// Script para poblar la tabla pabellon según la cantidad_pabellones de cada sector
const { Sector, Pabellon } = require('../models');
const sequelize = require('../config/database');

async function poblarPabellones() {
  try {
    await sequelize.authenticate();
    const sectores = await Sector.findAll();
    for (const sector of sectores) {
      const existentes = await Pabellon.count({ where: { sector_id: sector.id } });
      const faltan = sector.cantidad_pabellones - existentes;
      if (faltan > 0) {
        const nuevos = [];
        for (let i = existentes + 1; i <= sector.cantidad_pabellones; i++) {
          nuevos.push({ nombre: `Pabellón ${i}`, sector_id: sector.id });
        }
        await Pabellon.bulkCreate(nuevos);
        console.log(`Sector ${sector.nombre}: agregados ${faltan} pabellones.`);
      } else {
        console.log(`Sector ${sector.nombre}: ya tiene todos los pabellones.`);
      }
    }
    console.log('Poblamiento de pabellones completado.');
    process.exit(0);
  } catch (err) {
    console.error('Error poblando pabellones:', err);
    process.exit(1);
  }
}
poblarPabellones(); 