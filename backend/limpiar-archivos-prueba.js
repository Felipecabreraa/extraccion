const fs = require('fs');
const path = require('path');

console.log('🧹 LIMPIANDO ARCHIVOS DE PRUEBA\n');

const archivosAEliminar = [
  'test-roles-problemas.js',
  'diagnostico-roles-mejorado.js',
  'verificar-usuarios-roles.js',
  'crear-usuarios-prueba.js'
];

let eliminados = 0;
let noEncontrados = 0;

archivosAEliminar.forEach(archivo => {
  const rutaCompleta = path.join(__dirname, archivo);
  
  if (fs.existsSync(rutaCompleta)) {
    try {
      fs.unlinkSync(rutaCompleta);
      console.log(`   ✅ Eliminado: ${archivo}`);
      eliminados++;
    } catch (error) {
      console.log(`   ❌ Error eliminando ${archivo}: ${error.message}`);
    }
  } else {
    console.log(`   ℹ️  No encontrado: ${archivo}`);
    noEncontrados++;
  }
});

console.log(`\n📊 Resumen:`);
console.log(`   - Archivos eliminados: ${eliminados}`);
console.log(`   - Archivos no encontrados: ${noEncontrados}`);
console.log(`   - Archivos restantes: ${archivosAEliminar.length - eliminados - noEncontrados}`);

console.log('\n✅ Limpieza completada');
console.log('\n📋 Archivos de prueba que se mantienen:');
console.log('   - test-roles-final.js (para pruebas futuras)');
console.log('   - test-connection.js (para verificar conexión)');

process.exit(0); 