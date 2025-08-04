#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️ Configurando Sistema de Ambientes Completo...');

// Función para crear directorio si no existe
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Creado directorio: ${dir}`);
  }
}

// Función para copiar archivo
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(`✅ Copiado: ${source} → ${destination}`);
  } catch (error) {
    console.error(`❌ Error copiando ${source}:`, error.message);
  }
}

// Función para ejecutar comando
function runCommand(command, cwd = process.cwd()) {
  try {
    console.log(`📦 Ejecutando: ${command}`);
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    console.log(`✅ Comando exitoso: ${command}`);
    return true;
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    return false;
  }
}

// Función para crear archivo de entorno
function createEnvFile(filename, content) {
  try {
    fs.writeFileSync(filename, content);
    console.log(`✅ Creado: ${filename}`);
  } catch (error) {
    console.error(`❌ Error creando ${filename}:`, error.message);
  }
}

async function setupEnvironments() {
  try {
    console.log('\n📋 PASO 1: Creando estructura de directorios...');
    
    // Crear directorios necesarios
    ensureDir('scripts');
    ensureDir('backend');
    ensureDir('frontend');
    ensureDir('backend/config');
    ensureDir('frontend/config');
    
    console.log('\n📋 PASO 2: Creando archivos de configuración de ambientes...');
    
    // Backend - Desarrollo
    const backendDevEnv = `# Ambiente de Desarrollo - Backend
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=trn_extraccion_dev
DB_PORT=3306

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# Email (opcional para desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=uploads/

# Security
BCRYPT_ROUNDS=10
`;

    // Backend - Pruebas
    const backendTestEnv = `# Ambiente de Pruebas - Backend
NODE_ENV=test
PORT=3002
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=trn_extraccion_test
DB_PORT=3306

# JWT
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=1h

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=error
LOG_FILE=logs/test.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=uploads/test/

# Security
BCRYPT_ROUNDS=4
`;

    // Backend - Producción
    const backendProdEnv = `# Ambiente de Producción - Backend
NODE_ENV=production
PORT=3001
DB_HOST=tu-host-produccion
DB_USER=tu-usuario-produccion
DB_PASSWORD=tu-password-produccion
DB_NAME=trn_extraccion_prod
DB_PORT=3306

# JWT
JWT_SECRET=tu-jwt-secret-produccion-muy-seguro
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://tu-frontend-produccion.com

# Logging
LOG_LEVEL=info
LOG_FILE=logs/production.log

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email-produccion@gmail.com
SMTP_PASS=tu-password-produccion

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=uploads/

# Security
BCRYPT_ROUNDS=12
`;

    // Frontend - Desarrollo
    const frontendDevEnv = `# Ambiente de Desarrollo - Frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug

# Configuración de la aplicación
REACT_APP_APP_NAME=EXTRACCION
REACT_APP_COMPANY_NAME=TRN
REACT_APP_SUPPORT_EMAIL=soporte@trn.com

# Características habilitadas
REACT_APP_FEATURE_DASHBOARD=true
REACT_APP_FEATURE_DANOS=true
REACT_APP_FEATURE_PLANILLAS=true
REACT_APP_FEATURE_REPORTES=true
REACT_APP_FEATURE_UPLOAD=true
`;

    // Frontend - Pruebas
    const frontendTestEnv = `# Ambiente de Pruebas - Frontend
REACT_APP_API_URL=http://localhost:3002/api
REACT_APP_ENVIRONMENT=test
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=debug

# Configuración de la aplicación
REACT_APP_APP_NAME=EXTRACCION TEST
REACT_APP_COMPANY_NAME=TRN
REACT_APP_SUPPORT_EMAIL=soporte@trn.com

# Características habilitadas
REACT_APP_FEATURE_DASHBOARD=true
REACT_APP_FEATURE_DANOS=true
REACT_APP_FEATURE_PLANILLAS=true
REACT_APP_FEATURE_REPORTES=true
REACT_APP_FEATURE_UPLOAD=true
`;

    // Frontend - Producción
    const frontendProdEnv = `# Ambiente de Producción - Frontend
REACT_APP_API_URL=https://tu-backend-produccion.com/api
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=error

# Configuración de la aplicación
REACT_APP_APP_NAME=EXTRACCION
REACT_APP_COMPANY_NAME=TRN
REACT_APP_SUPPORT_EMAIL=soporte@trn.com

# Características habilitadas
REACT_APP_FEATURE_DASHBOARD=true
REACT_APP_FEATURE_DANOS=true
REACT_APP_FEATURE_PLANILLAS=true
REACT_APP_FEATURE_REPORTES=true
REACT_APP_FEATURE_UPLOAD=true
`;

    // Crear archivos de entorno
    createEnvFile('backend/env.development', backendDevEnv);
    createEnvFile('backend/env.test', backendTestEnv);
    createEnvFile('backend/env.production', backendProdEnv);
    createEnvFile('frontend/env.development', frontendDevEnv);
    createEnvFile('frontend/env.test', frontendTestEnv);
    createEnvFile('frontend/env.production', frontendProdEnv);

    console.log('\n📋 PASO 3: Creando scripts de gestión de ambientes...');

    // Script para cambiar a desarrollo
    const switchToDevScript = `#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🟢 Cambiando a ambiente de DESARROLLO...');

function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(\`✅ Copiado: \${source} → \${destination}\`);
  } catch (error) {
    console.error(\`❌ Error copiando \${source}: \${error.message}\`);
  }
}

async function switchToDevelopment() {
  try {
    console.log('\\n📋 Configurando archivos de entorno para desarrollo...');
    
    copyFile(
      path.join(__dirname, '../backend/env.development'),
      path.join(__dirname, '../backend/.env')
    );
    
    copyFile(
      path.join(__dirname, '../frontend/env.development'),
      path.join(__dirname, '../frontend/.env')
    );
    
    console.log('\\n✅ ¡Ambiente de desarrollo configurado!');
    console.log('\\n🌐 URLs de Desarrollo:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Base de datos: trn_extraccion_dev');
    
    console.log('\\n🚀 Comandos para iniciar:');
    console.log('   - Backend: cd backend && npm run dev');
    console.log('   - Frontend: cd frontend && npm start');
    
  } catch (error) {
    console.error('\\n❌ Error configurando ambiente de desarrollo:', error.message);
    process.exit(1);
  }
}

switchToDevelopment();
`;

    // Script para cambiar a pruebas
    const switchToTestScript = `#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🟡 Cambiando a ambiente de PRUEBAS...');

function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(\`✅ Copiado: \${source} → \${destination}\`);
  } catch (error) {
    console.error(\`❌ Error copiando \${source}: \${error.message}\`);
  }
}

async function switchToTest() {
  try {
    console.log('\\n📋 Configurando archivos de entorno para pruebas...');
    
    copyFile(
      path.join(__dirname, '../backend/env.test'),
      path.join(__dirname, '../backend/.env')
    );
    
    copyFile(
      path.join(__dirname, '../frontend/env.test'),
      path.join(__dirname, '../frontend/.env')
    );
    
    console.log('\\n✅ ¡Ambiente de pruebas configurado!');
    console.log('\\n🌐 URLs de Pruebas:');
    console.log('   - Backend: http://localhost:3002');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Base de datos: trn_extraccion_test');
    
    console.log('\\n🚀 Comandos para iniciar:');
    console.log('   - Backend: cd backend && npm run test:server');
    console.log('   - Frontend: cd frontend && npm start');
    
  } catch (error) {
    console.error('\\n❌ Error configurando ambiente de pruebas:', error.message);
    process.exit(1);
  }
}

switchToTest();
`;

    // Script para cambiar a producción
    const switchToProdScript = `#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔴 Cambiando a ambiente de PRODUCCIÓN...');

function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    console.log(\`✅ Copiado: \${source} → \${destination}\`);
  } catch (error) {
    console.error(\`❌ Error copiando \${source}: \${error.message}\`);
  }
}

async function switchToProduction() {
  try {
    console.log('\\n📋 Configurando archivos de entorno para producción...');
    
    copyFile(
      path.join(__dirname, '../backend/env.production'),
      path.join(__dirname, '../backend/.env')
    );
    
    copyFile(
      path.join(__dirname, '../frontend/env.production'),
      path.join(__dirname, '../frontend/.env')
    );
    
    console.log('\\n✅ ¡Ambiente de producción configurado!');
    console.log('\\n🌐 URLs de Producción:');
    console.log('   - Backend: [Configurar URL de producción]');
    console.log('   - Frontend: [Configurar URL de producción]');
    console.log('   - Base de datos: trn_extraccion_prod');
    
    console.log('\\n⚠️  IMPORTANTE:');
    console.log('   - Este ambiente usa la base de datos de producción');
    console.log('   - Los cambios afectarán datos reales');
    console.log('   - Usar solo para despliegues finales');
    
  } catch (error) {
    console.error('\\n❌ Error configurando ambiente de producción:', error.message);
    process.exit(1);
  }
}

switchToProduction();
`;

    // Script para iniciar desarrollo
    const startDevScript = `#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando ambiente de DESARROLLO...');

// Función para ejecutar comando en paralelo
function runCommand(command, cwd, name) {
  const [cmd, ...args] = command.split(' ');
  const child = spawn(cmd, args, { 
    cwd, 
    stdio: 'inherit',
    shell: true 
  });
  
  child.on('error', (error) => {
    console.error(\`❌ Error en \${name}:\`, error.message);
  });
  
  child.on('close', (code) => {
    console.log(\`✅ \${name} terminado con código: \${code}\`);
  });
  
  return child;
}

async function startDevelopment() {
  try {
    console.log('\\n📋 PASO 1: Configurando ambiente de desarrollo...');
    
    // Cambiar a ambiente de desarrollo
    const { execSync } = require('child_process');
    execSync('node scripts/switch-to-development.js', { stdio: 'inherit' });
    
    console.log('\\n📋 PASO 2: Instalando dependencias...');
    
    // Instalar dependencias del backend
    console.log('📦 Instalando dependencias del backend...');
    execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
    
    // Instalar dependencias del frontend
    console.log('📦 Instalando dependencias del frontend...');
    execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
    
    console.log('\\n📋 PASO 3: Iniciando servidores...');
    
    // Iniciar backend
    console.log('🚀 Iniciando backend...');
    const backend = runCommand('npm run dev', 'backend', 'Backend');
    
    // Esperar un poco antes de iniciar frontend
    setTimeout(() => {
      console.log('🚀 Iniciando frontend...');
      const frontend = runCommand('npm start', 'frontend', 'Frontend');
    }, 3000);
    
    console.log('\\n✅ ¡Ambiente de desarrollo iniciado!');
    console.log('\\n🌐 URLs:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - API Health: http://localhost:3001/health');
    
    console.log('\\n💡 Para detener: Ctrl+C');
    
  } catch (error) {
    console.error('\\n❌ Error iniciando desarrollo:', error.message);
    process.exit(1);
  }
}

startDevelopment();
`;

    // Crear scripts
    createEnvFile('scripts/switch-to-development.js', switchToDevScript);
    createEnvFile('scripts/switch-to-test.js', switchToTestScript);
    createEnvFile('scripts/switch-to-production.js', switchToProdScript);
    createEnvFile('scripts/start-development.js', startDevScript);

    console.log('\n📋 PASO 4: Configurando package.json scripts...');

    // Actualizar package.json del backend
    const backendPackagePath = 'backend/package.json';
    if (fs.existsSync(backendPackagePath)) {
      const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
      
      backendPackage.scripts = {
        ...backendPackage.scripts,
        "dev": "nodemon src/app.js",
        "start": "node src/app.js",
        "test": "jest",
        "test:server": "NODE_ENV=test node src/app.js",
        "setup:dev": "node ../scripts/switch-to-development.js",
        "setup:test": "node ../scripts/switch-to-test.js",
        "setup:prod": "node ../scripts/switch-to-production.js"
      };
      
      fs.writeFileSync(backendPackagePath, JSON.stringify(backendPackage, null, 2));
      console.log('✅ Package.json del backend actualizado');
    }

    // Actualizar package.json del frontend
    const frontendPackagePath = 'frontend/package.json';
    if (fs.existsSync(frontendPackagePath)) {
      const frontendPackage = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
      
      frontendPackage.scripts = {
        ...frontendPackage.scripts,
        "dev": "react-scripts start",
        "build": "CI=false react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject",
        "setup:dev": "node ../scripts/switch-to-development.js",
        "setup:test": "node ../scripts/switch-to-test.js",
        "setup:prod": "node ../scripts/switch-to-production.js"
      };
      
      fs.writeFileSync(frontendPackagePath, JSON.stringify(frontendPackage, null, 2));
      console.log('✅ Package.json del frontend actualizado');
    }

    console.log('\n📋 PASO 5: Creando archivos de configuración adicionales...');

    // Crear .env.example
    const envExample = `# Archivo de ejemplo - Copiar y renombrar según el ambiente
# Desarrollo: cp env.development .env
# Pruebas: cp env.test .env  
# Producción: cp env.production .env

NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=trn_extraccion_dev
DB_PORT=3306

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:3000

LOG_LEVEL=debug
LOG_FILE=logs/app.log
`;

    createEnvFile('backend/.env.example', envExample);
    createEnvFile('frontend/.env.example', `# Variables de entorno del frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
`);

    console.log('\n✅ ¡Configuración de ambientes completada!');
    console.log('\n🌐 Ambientes Configurados:');
    console.log('   🟢 Desarrollo: http://localhost:3000 (frontend) + http://localhost:3001 (backend)');
    console.log('   🟡 Pruebas: http://localhost:3000 (frontend) + http://localhost:3002 (backend)');
    console.log('   🔴 Producción: [Configurar URLs de producción]');
    
    console.log('\n🚀 Comandos Disponibles:');
    console.log('   - node scripts/switch-to-development.js    # Cambiar a desarrollo');
    console.log('   - node scripts/switch-to-test.js           # Cambiar a pruebas');
    console.log('   - node scripts/switch-to-production.js     # Cambiar a producción');
    console.log('   - node scripts/start-development.js        # Iniciar desarrollo completo');
    
    console.log('\n📋 Próximos Pasos:');
    console.log('   1. Configurar base de datos MySQL');
    console.log('   2. Ejecutar: node scripts/switch-to-development.js');
    console.log('   3. Ejecutar: node scripts/start-development.js');
    console.log('   4. Configurar variables de entorno de producción');
    
  } catch (error) {
    console.error('\n❌ Error en la configuración:', error.message);
    process.exit(1);
  }
}

setupEnvironments(); 