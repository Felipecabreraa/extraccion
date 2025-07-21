const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando archivo .env para el backend...');

const envContent = `# Configuración de Desarrollo
NODE_ENV=development
PORT=3001

# Base de Datos - Desarrollo Local
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=extraccion
DB_PORT=3306

# JWT
JWT_SECRET=secreto_super_seguro_desarrollo_2024
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug

# Upload
UPLOAD_PATH=./uploads/development
MAX_FILE_SIZE=10485760

# Email (opcional para desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_app
`;

const envPath = path.join(__dirname, '.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('✅ El archivo .env ya existe');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado exitosamente');
  }
  
  console.log('📝 Configuración del archivo .env completada');
  console.log('⚠️  Asegúrate de configurar la contraseña de la base de datos si es necesario');
  
} catch (error) {
  console.error('❌ Error creando el archivo .env:', error.message);
  process.exit(1);
} 