const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Solucionando dependencias y verificando funcionalidad...\n');

try {
  // 1. Instalar dependencias faltantes
  console.log('📦 Instalando dependencias...');
  execSync('npm install multer csv-parser', { stdio: 'inherit', cwd: __dirname + '/..' });
  console.log('✅ Dependencias instaladas correctamente\n');

  // 2. Crear directorio uploads si no existe
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Creando directorio uploads...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Directorio uploads creado\n');
  } else {
    console.log('✅ Directorio uploads ya existe\n');
  }

  // 3. Verificar que las plantillas existen
  const plantillas = [
    '../plantilla_sectores_ejemplo.csv',
    '../plantilla_zonas_ejemplo.csv'
  ];

  console.log('📄 Verificando plantillas...');
  plantillas.forEach(plantilla => {
    const ruta = path.join(__dirname, plantilla);
    if (fs.existsSync(ruta)) {
      console.log(`✅ ${plantilla} - Existe`);
    } else {
      console.log(`❌ ${plantilla} - No encontrada`);
    }
  });

  // 4. Verificar estructura de archivos
  console.log('\n📋 Verificando estructura de archivos...');
  const archivosNecesarios = [
    '../src/controllers/sectorController.js',
    '../src/routes/sectorRoutes.js',
    '../src/controllers/zonaCargaMasivaController.js',
    '../src/routes/zonaCargaMasivaRoutes.js'
  ];

  archivosNecesarios.forEach(archivo => {
    const ruta = path.join(__dirname, archivo);
    if (fs.existsSync(ruta)) {
      console.log(`✅ ${archivo} - Existe`);
    } else {
      console.log(`❌ ${archivo} - No encontrado`);
    }
  });

  console.log('\n🎯 INSTRUCCIONES PARA PROBAR:');
  console.log('1. Reiniciar el servidor backend: npm start');
  console.log('2. Probar descarga de plantilla de sectores desde el frontend');
  console.log('3. Verificar que no hay errores en la consola del navegador');
  console.log('4. Probar carga masiva de zonas y sectores');

  console.log('\n✅ Script completado exitosamente');

} catch (error) {
  console.error('❌ Error ejecutando el script:', error.message);
  process.exit(1);
} 