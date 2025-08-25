const fs = require('fs');

const envContent = `# Configuración de Desarrollo
NODE_ENV=development
PORT=3001

# Base de datos
DB_HOST=trn.cl
DB_PORT=3306
DB_NAME=trn_extraccion_test
DB_USER=trn_felipe
DB_PASSWORD=RioNegro2025@

# JWT Secret para desarrollo
JWT_SECRET=dev_secret_key_2024

# CORS para desarrollo
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Archivo .env creado exitosamente con las credenciales correctas');
} catch (error) {
  console.error('❌ Error creando archivo .env:', error);
}



