const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Zona = require('./zona');

const Sector = sequelize.define('Sector', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  zona_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Zona,
      key: 'id'
    }
  },
  comuna: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cantidad_pabellones: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mt2: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  }
}, {
  tableName: 'sector',
  timestamps: false
});

module.exports = Sector;