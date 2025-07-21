const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configurarDB() {
  console.log('🔧 Configurando conexión a la base de datos...\n');

  try {
    const dbHost = await question('Host de MySQL (default: localhost): ') || 'localhost';
    const dbPort = await question('Puerto de MySQL (default: 3306): ') || '3306';
    const dbName = await question('Nombre de la base de datos (default: extraccion): ') || 'extraccion';
    const dbUser = await question('Usuario de MySQL (default: root): ') || 'root';
    const dbPassword = await question('Contraseña de MySQL: ');

    const envContent = `# Configuración de Base de Datos
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}

# Configuración de JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambialo_en_produccion

# Configuración del Servidor
PORT=3001
NODE_ENV=development

# Configuración de CORS
FRONTEND_URL=http://localhost:3000

# Configuración de Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuración de Logs
LOG_LEVEL=info
LOG_FILE_PATH=./logs

# Configuración de Seguridad
BCRYPT_ROUNDS=12
SESSION_SECRET=tu_session_secret_aqui

# Configuración de Email (opcional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Configuración de Redis (opcional, para cache)
REDIS_URL=`;

    const envPath = path.join(__dirname, '..', '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Archivo .env creado exitosamente!');
    console.log(`📁 Ubicación: ${envPath}`);
    console.log('\n🔧 Ahora puedes ejecutar:');
    console.log('   node agregar_datos_planillas.js');

  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
  } finally {
    rl.close();
  }
}

configurarDB(); 