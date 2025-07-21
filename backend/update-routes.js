const fs = require('fs');
const path = require('path');

console.log('🔄 Actualizando rutas con nueva estructura de middleware...\n');

// Lista de archivos de rutas a actualizar
const routeFiles = [
  'src/routes/zonaRoutes.js',
  'src/routes/usuarioRoutes.js',
  'src/routes/sectorRoutes.js',
  'src/routes/planillaRoutes.js',
  'src/routes/pabellonRoutes.js',
  'src/routes/pabellonMaquinaRoutes.js',
  'src/routes/operadorRoutes.js',
  'src/routes/maquinaRoutes.js',
  'src/routes/maquinaPlanillaRoutes.js',
  'src/routes/danoRoutes.js',
  'src/routes/barredorRoutes.js',
  'src/routes/barredorCatalogoRoutes.js'
];

function updateRouteFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`   ⚠️  ${filePath} - No encontrado`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;

    // Actualizar importación del middleware de autenticación
    if (content.includes("const authMiddleware = require('../middlewares/authMiddleware');")) {
      content = content.replace(
        "const authMiddleware = require('../middlewares/authMiddleware');",
        "const { authenticateToken } = require('../middlewares/authMiddleware');"
      );
      updated = true;
    }

    // Actualizar uso de authMiddleware por authenticateToken
    if (content.includes('authMiddleware,')) {
      content = content.replace(/authMiddleware,/g, 'authenticateToken,');
      updated = true;
    }

    // Actualizar router.use(authMiddleware)
    if (content.includes('router.use(authMiddleware)')) {
      content = content.replace(
        'router.use(authMiddleware)',
        'router.use(authenticateToken)'
      );
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(fullPath, content);
      console.log(`   ✅ ${filePath} - Actualizado`);
      return true;
    } else {
      console.log(`   ℹ️  ${filePath} - Ya actualizado`);
      return true;
    }

  } catch (error) {
    console.log(`   ❌ ${filePath} - Error: ${error.message}`);
    return false;
  }
}

// Actualizar todos los archivos
let successCount = 0;
let totalCount = routeFiles.length;

routeFiles.forEach(file => {
  if (updateRouteFile(file)) {
    successCount++;
  }
});

console.log(`\n📊 Resumen:`);
console.log(`   ✅ Actualizados: ${successCount}/${totalCount}`);
console.log(`   ❌ Errores: ${totalCount - successCount}`);

if (successCount === totalCount) {
  console.log('\n🎉 ¡Todas las rutas actualizadas correctamente!');
  console.log('💡 Ahora puedes reiniciar el servidor backend.');
} else {
  console.log('\n⚠️  Algunas rutas no se pudieron actualizar.');
  console.log('💡 Revisa los errores y actualiza manualmente si es necesario.');
} 