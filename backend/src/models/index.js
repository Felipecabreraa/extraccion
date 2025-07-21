const Usuario = require('./usuario');
const Zona = require('./zona');
const Sector = require('./sector');
const Pabellon = require('./pabellon');
const Planilla = require('./planilla');
const Barredor = require('./barredor');
const Maquina = require('./maquina');
const Operador = require('./operador');
const MaquinaPlanilla = require('./maquina_planilla');
const PabellonMaquina = require('./pabellon_maquina');
const Dano = require('./dano');
const BarredorCatalogo = require('./barredor_catalogo');
const sequelize = require('../config/database');
// ... importa los demás modelos

// Relaciones
Zona.hasMany(Sector, { foreignKey: 'zona_id' });
Sector.belongsTo(Zona, { foreignKey: 'zona_id' });

Sector.hasMany(Pabellon, { foreignKey: 'sector_id' });
Pabellon.belongsTo(Sector, { foreignKey: 'sector_id' });

Sector.hasMany(Planilla, { as: 'Planillas', foreignKey: 'sector_id' });
Planilla.belongsTo(Sector, { as: 'Sector', foreignKey: 'sector_id' });

Usuario.hasMany(Planilla, { as: 'planillas_supervisadas', foreignKey: 'supervisor_id' });
Planilla.belongsTo(Usuario, { as: 'supervisor', foreignKey: 'supervisor_id' });

// Asociación para el validador de planillas
Usuario.hasMany(Planilla, { as: 'planillas_validadas', foreignKey: 'validado_por' });
Planilla.belongsTo(Usuario, { as: 'validador', foreignKey: 'validado_por' });

Planilla.hasMany(Barredor, { foreignKey: 'planilla_id' });
Barredor.belongsTo(Planilla, { foreignKey: 'planilla_id' });

Planilla.hasMany(MaquinaPlanilla, { foreignKey: 'planilla_id' });
MaquinaPlanilla.belongsTo(Planilla, { foreignKey: 'planilla_id' });

Maquina.hasMany(MaquinaPlanilla, { foreignKey: 'maquina_id' });
MaquinaPlanilla.belongsTo(Maquina, { foreignKey: 'maquina_id' });

Operador.hasMany(MaquinaPlanilla, { foreignKey: 'operador_id' });
MaquinaPlanilla.belongsTo(Operador, { foreignKey: 'operador_id' });

Planilla.hasMany(PabellonMaquina, { foreignKey: 'planilla_id' });
PabellonMaquina.belongsTo(Planilla, { foreignKey: 'planilla_id' });

Pabellon.hasMany(PabellonMaquina, { foreignKey: 'pabellon_id' });
PabellonMaquina.belongsTo(Pabellon, { foreignKey: 'pabellon_id' });

Maquina.hasMany(PabellonMaquina, { foreignKey: 'maquina_id' });
PabellonMaquina.belongsTo(Maquina, { foreignKey: 'maquina_id' });

Planilla.hasMany(Dano, { foreignKey: 'planilla_id' });
Dano.belongsTo(Planilla, { foreignKey: 'planilla_id' });

Pabellon.hasMany(Dano, { foreignKey: 'pabellon_id' });
Dano.belongsTo(Pabellon, { foreignKey: 'pabellon_id' });

Maquina.hasMany(Dano, { foreignKey: 'maquina_id' });
Dano.belongsTo(Maquina, { foreignKey: 'maquina_id' });

BarredorCatalogo.hasMany(Barredor, { foreignKey: 'barredor_id' });
Barredor.belongsTo(BarredorCatalogo, { foreignKey: 'barredor_id' });

// sequelize.sync({ alter: true }); // <--- Comentado para evitar conflictos

// ... aquí irán las demás relaciones

module.exports = {
  Usuario,
  Zona,
  Sector,
  Pabellon,
  Planilla,
  Barredor,
  Maquina,
  Operador,
  MaquinaPlanilla,
  PabellonMaquina,
  Dano,
  BarredorCatalogo,
  // ... exporta los demás modelos
};