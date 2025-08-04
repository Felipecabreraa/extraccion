// Usuario de prueba para el ambiente de test
const TEST_USER = {
  id: 999,
  username: 'test_user',
  email: 'test@extraccion.com',
  nombre: 'Usuario de Prueba',
  rol: 'admin',
  activo: true
};

// Token de prueba
const TEST_TOKEN = 'test_token_extraccion_2025';

// Función para obtener credenciales de prueba
const getTestCredentials = () => {
  return {
    user: TEST_USER,
    token: TEST_TOKEN,
    environment: 'test'
  };
};

// Función para verificar si estamos en ambiente de prueba
const isTestEnvironment = () => {
  return process.env.NODE_ENV === 'test' || process.env.ENVIRONMENT === 'test';
};

module.exports = {
  TEST_USER,
  TEST_TOKEN,
  getTestCredentials,
  isTestEnvironment
}; 