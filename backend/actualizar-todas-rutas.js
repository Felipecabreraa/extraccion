const fs = require('fs');
const path = require('path');

console.log('🔄 ACTUALIZANDO TODAS LAS RUTAS CON ROLEMIDDLEWARE\n');

const archivosRutas = [
  'src/routes/zonaCargaMasivaRoutes.js',
  'src/routes/sectorRoutes.js',
  'src/routes/pabellonRoutes.js',
  'src/routes/pabellonMaquinaRoutes.js',
  'src/routes/operadorRoutes.js',
  'src/routes/maquinaRoutes.js',
  'src/routes/maquinaPlanillaRoutes.js',
  'src/routes/bulkUploadRoutes.js',
  'src/routes/danoRoutes.js'
];

let actualizados = 0;
let errores = 0;

archivosRutas.forEach(archivo => {
  try {
    const rutaCompleta = path.join(__dirname, archivo);
    
    if (!fs.existsSync(rutaCompleta)) {
      console.log(`   ⚠️  No encontrado: ${archivo}`);
      return;
    }
    
    let contenido = fs.readFileSync(rutaCompleta, 'utf8');
    let modificado = false;
    
    // Reemplazar importación
    if (contenido.includes("const roleMiddleware = require('../middlewares/roleMiddleware');")) {
      contenido = contenido.replace(
        "const roleMiddleware = require('../middlewares/roleMiddleware');",
        ""
      );
      modificado = true;
    }
    
    // Actualizar importación de authMiddleware
    if (contenido.includes("const { authenticateToken } = require('../middlewares/authMiddleware');")) {
      contenido = contenido.replace(
        "const { authenticateToken } = require('../middlewares/authMiddleware');",
        "const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');"
      );
      modificado = true;
    }
    
    // Reemplazar roleMiddleware por requireRole en todas las rutas
    if (contenido.includes('roleMiddleware(')) {
      contenido = contenido.replace(/roleMiddleware\(/g, 'requireRole(');
      modificado = true;
    }
    
    if (modificado) {
      fs.writeFileSync(rutaCompleta, contenido);
      console.log(`   ✅ Actualizado: ${archivo}`);
      actualizados++;
    } else {
      console.log(`   ℹ️  Ya actualizado: ${archivo}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Error actualizando ${archivo}: ${error.message}`);
    errores++;
  }
});

console.log(`\n📊 Resumen:`);
console.log(`   - Archivos actualizados: ${actualizados}`);
console.log(`   - Errores: ${errores}`);
console.log(`   - Total procesados: ${archivosRutas.length}`);

console.log('\n✅ Actualización completada');

process.exit(0); 