// Script temporal para configurar variables de entorno
process.env.DB_HOST = 'trn.cl';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'trn_extraccion_test';
process.env.DB_USER = 'trn_felipe';
process.env.DB_PASSWORD = 'RioNegro2025@';
process.env.PORT = '3000';
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'tu_jwt_secret_super_seguro_aqui';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.LOG_LEVEL = 'info';

console.log('✅ Variables de entorno configuradas temporalmente');
console.log('📊 Configuración de BD:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '***' : 'sin contraseña'
});
