// Configuración global para tests
process.env.NODE_ENV = 'test';
process.env.BASE_URL = 'http://localhost:3001';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Configurar timeouts globales
jest.setTimeout(30000);

// Configurar variables de entorno para testing
process.env.TEST_USER_EMAIL = 'admin@test.com';
process.env.TEST_USER_PASSWORD = 'admin123';

// Configurar logging para tests
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
