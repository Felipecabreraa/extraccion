const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sector = require('./sector');

const Pabellon = sequelize.define('Pabellon', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  sector_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Sector,
      key: 'id'
    }
  }
}, {
  tableName: 'pabellon',
  timestamps: false
});

module.exports = Pabellon;
