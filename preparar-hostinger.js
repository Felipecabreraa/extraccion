const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando archivos para Hostinger...');

// Crear carpeta de despliegue
const deployDir = 'hostinger-deploy';
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir);
}

// Copiar archivos del backend
console.log('📁 Copiando archivos del backend...');
const backendFiles = [
  'src',
  'package.json',
  'package-lock.json',
  'Procfile',
  'env.production.example'
];

backendFiles.forEach(file => {
  const source = path.join('backend', file);
  const dest = path.join(deployDir, file);
  
  if (fs.existsSync(source)) {
    if (fs.lstatSync(source).isDirectory()) {
      // Copiar directorio
      copyDir(source, dest);
    } else {
      // Copiar archivo
      fs.copyFileSync(source, dest);
    }
    console.log(`✅ Copiado: ${file}`);
  }
});

// Copiar archivos del frontend (build)
console.log('📁 Copiando archivos del frontend...');
const frontendBuildDir = path.join('frontend', 'build');
const publicDir = path.join(deployDir, 'public');

if (fs.existsSync(frontendBuildDir)) {
  copyDir(frontendBuildDir, publicDir);
  console.log('✅ Frontend copiado a /public');
}

// Crear archivo .env de ejemplo
const envExample = `# Configuración para Hostinger
NODE_ENV=production
PORT=3001

# Base de datos MySQL (Hostinger)
DB_HOST=localhost
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_NAME=tu_nombre_db
DB_PORT=3306

# JWT Secret
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# URL del frontend
FRONTEND_URL=https://tudominio.com

# Configuración de CORS
CORS_ORIGIN=https://tudominio.com

# Configuración de logs
LOG_LEVEL=info`;

fs.writeFileSync(path.join(deployDir, '.env.example'), envExample);

// Crear README para Hostinger
const readme = `# Despliegue en Hostinger

## Pasos para desplegar:

1. **Subir archivos:**
   - Sube TODOS los archivos de esta carpeta a tu hosting de Hostinger
   - Asegúrate de que estén en la carpeta raíz (public_html o similar)

2. **Configurar variables de entorno:**
   - Copia el archivo .env.example a .env
   - Edita .env con tus datos reales de base de datos

3. **Instalar dependencias:**
   - En el panel de Hostinger, ejecuta: npm install

4. **Configurar base de datos:**
   - Crea una base de datos MySQL en Hostinger
   - Actualiza las credenciales en .env

5. **Iniciar la aplicación:**
   - En el panel de Hostinger, ejecuta: npm start

## Estructura de archivos:
- /src - Código del backend
- /public - Archivos del frontend (React build)
- package.json - Dependencias de Node.js
- Procfile - Configuración para Hostinger
- .env - Variables de entorno (crear desde .env.example)

## URLs importantes:
- Frontend: https://tudominio.com
- API: https://tudominio.com/api
- Health check: https://tudominio.com/api/health`;

fs.writeFileSync(path.join(deployDir, 'README-HOSTINGER.md'), readme);

console.log('✅ Archivos preparados en la carpeta: hostinger-deploy');
console.log('📋 Sigue las instrucciones en README-HOSTINGER.md');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
} 