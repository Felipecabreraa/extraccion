const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'extraccion',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
    dialectOptions: {
      // Si tu hosting requiere SSL, descomenta la siguiente línea:
      // ssl: { require: true, rejectUnauthorized: false }
    }
  }
);

module.exports = sequelize;