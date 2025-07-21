const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 SOLUCIONANDO TODOS LOS PROBLEMAS IDENTIFICADOS...\n');

try {
  // 1. Instalar dependencias faltantes
  console.log('📦 1. Instalando dependencias...');
  execSync('npm install multer csv-parser', { stdio: 'inherit', cwd: __dirname + '/..' });
  console.log('✅ Dependencias instaladas correctamente\n');

  // 2. Crear directorio uploads si no existe
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 2. Creando directorio uploads...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Directorio uploads creado\n');
  } else {
    console.log('✅ Directorio uploads ya existe\n');
  }

  // 3. Verificar archivo .env
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  3. Archivo .env no encontrado. Creando ejemplo...');
    const envExample = `# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=extraccion
DB_USER=root
DB_PASSWORD=

# Configuración del Servidor
PORT=3001
NODE_ENV=development

# JWT Secret
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Frontend URL
FRONTEND_URL=http://localhost:3000`;
    
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Archivo .env creado. Por favor, configura las variables según tu entorno.\n');
  } else {
    console.log('✅ Archivo .env existe\n');
  }

  // 4. Verificar que las plantillas existen
  console.log('📄 4. Verificando plantillas...');
  const plantillas = [
    '../plantilla_sectores_ejemplo.csv',
    '../plantilla_zonas_ejemplo.csv'
  ];

  plantillas.forEach(plantilla => {
    const ruta = path.join(__dirname, plantilla);
    if (fs.existsSync(ruta)) {
      console.log(`✅ ${plantilla} - Existe`);
    } else {
      console.log(`❌ ${plantilla} - No encontrada`);
    }
  });

  // 5. Verificar estructura de archivos
  console.log('\n📋 5. Verificando estructura de archivos...');
  const archivosNecesarios = [
    '../src/controllers/sectorController.js',
    '../src/routes/sectorRoutes.js',
    '../src/controllers/zonaCargaMasivaController.js',
    '../src/routes/zonaCargaMasivaRoutes.js',
    '../src/config/config.js',
    '../.sequelizerc'
  ];

  archivosNecesarios.forEach(archivo => {
    const ruta = path.join(__dirname, archivo);
    if (fs.existsSync(ruta)) {
      console.log(`✅ ${archivo} - Existe`);
    } else {
      console.log(`❌ ${archivo} - No encontrado`);
    }
  });

  // 6. Verificar migraciones
  console.log('\n🔄 6. Verificando migraciones...');
  const migrationsDir = path.join(__dirname, '../migrations');
  if (fs.existsSync(migrationsDir)) {
    const migrations = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.js'));
    console.log(`✅ Encontradas ${migrations.length} migraciones`);
    migrations.forEach(migration => {
      console.log(`   - ${migration}`);
    });
  } else {
    console.log('❌ Directorio de migraciones no encontrado');
  }

  console.log('\n🎯 INSTRUCCIONES PARA COMPLETAR LA SOLUCIÓN:');
  console.log('\n1. 📝 CONFIGURAR BASE DE DATOS:');
  console.log('   - Asegúrate de que MySQL esté funcionando');
  console.log('   - Verifica que la base de datos "extraccion" existe');
  console.log('   - Configura las credenciales en el archivo .env');
  
  console.log('\n2. 🗄️  EJECUTAR MIGRACIONES:');
  console.log('   cd backend');
  console.log('   npx sequelize-cli db:migrate');
  
  console.log('\n3. 🔄 ACTUALIZAR ZONAS EXISTENTES:');
  console.log('   node scripts/update_zonas_tipo.js');
  
  console.log('\n4. 🚀 REINICIAR SERVICIOS:');
  console.log('   # Backend');
  console.log('   npm start');
  console.log('   # Frontend (en otra terminal)');
  console.log('   cd ../frontend && npm start');
  
  console.log('\n5. ✅ VERIFICAR FUNCIONALIDAD:');
  console.log('   - Probar login en el frontend');
  console.log('   - Verificar que las zonas se cargan correctamente');
  console.log('   - Probar descarga de plantillas de carga masiva');
  console.log('   - Verificar que no hay errores en la consola del navegador');

  console.log('\n✅ Script de diagnóstico completado exitosamente');

} catch (error) {
  console.error('❌ Error ejecutando el script:', error.message);
  process.exit(1);
} 