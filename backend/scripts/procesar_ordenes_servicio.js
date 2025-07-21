const path = require('path');
const { convertirOrdenesServicio } = require('./convertir_ordenes_servicio');
const { completarReferencias } = require('./completar_referencias');

// Función principal que ejecuta todo el proceso
async function procesarOrdenesServicio(rutaArchivoJSON, mapeoReferencias = {}) {
  try {
    console.log('=== PROCESAMIENTO DE ÓRDENES DE SERVICIO ===\n');
    
    // Paso 1: Convertir JSON a Excel
    console.log('PASO 1: Convirtiendo archivo JSON a Excel...');
    await convertirOrdenesServicio(rutaArchivoJSON);
    
    // Obtener el nombre del archivo generado
    const fecha = new Date().toISOString().split('T')[0];
    const archivoExcel = path.join(__dirname, `ordenes_servicio_convertidas_${fecha}.xlsx`);
    
    // Paso 2: Completar referencias
    console.log('\nPASO 2: Completando referencias...');
    await completarReferencias(archivoExcel, mapeoReferencias);
    
    console.log('\n=== PROCESAMIENTO COMPLETADO ===');
    console.log('Archivos generados:');
    console.log(`- ${archivoExcel}`);
    console.log(`- ${path.join(__dirname, `ordenes_servicio_completadas_${fecha}.xlsx`)}`);
    console.log(`- ${path.join(__dirname, `mapeo_referencias_${fecha}.xlsx`)}`);
    
    console.log('\n=== PRÓXIMOS PASOS ===');
    console.log('1. Revisa los archivos generados');
    console.log('2. Completa manualmente las referencias faltantes si es necesario');
    console.log('3. Usa el endpoint de carga masiva para importar los datos');
    console.log('4. Verifica la importación en la base de datos');
    
  } catch (error) {
    console.error('Error durante el procesamiento:', error.message);
  }
}

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log('=== PROCESADOR DE ÓRDENES DE SERVICIO ===\n');
  console.log('Uso: node procesar_ordenes_servicio.js <ruta_archivo_json> [opciones]\n');
  console.log('Opciones:');
  console.log('  --supervisor <nombre>    Nombre del supervisor por defecto');
  console.log('  --sector <nombre>        Nombre del sector por defecto');
  console.log('  --pabellon <nombre>      Nombre del pabellón por defecto');
  console.log('  --maquina <numero>       Número de máquina por defecto');
  console.log('  --patente <patente>      Patente de máquina por defecto');
  console.log('  --operador <nombre>      Nombre del operador por defecto');
  console.log('  --help                   Mostrar esta ayuda\n');
  console.log('Ejemplo:');
  console.log('  node procesar_ordenes_servicio.js "C:\\Users\\pipe\\Downloads\\ordenesservicio.json" --supervisor "Juan Pérez" --sector "Sector A"');
}

// Función para parsear argumentos de línea de comandos
function parsearArgumentos(args) {
  const mapeoReferencias = {};
  
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--supervisor':
        mapeoReferencias.supervisor = args[++i];
        break;
      case '--sector':
        mapeoReferencias.sector = args[++i];
        break;
      case '--pabellon':
        mapeoReferencias.pabellon = args[++i];
        break;
      case '--maquina':
        if (!mapeoReferencias.maquina) mapeoReferencias.maquina = {};
        mapeoReferencias.maquina.numero = args[++i];
        break;
      case '--patente':
        if (!mapeoReferencias.maquina) mapeoReferencias.maquina = {};
        mapeoReferencias.maquina.patente = args[++i];
        break;
      case '--operador':
        mapeoReferencias.operador = args[++i];
        break;
      case '--help':
        mostrarAyuda();
        process.exit(0);
        break;
    }
  }
  
  return mapeoReferencias;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv;
  const rutaArchivo = args[2];
  
  if (!rutaArchivo || rutaArchivo === '--help') {
    mostrarAyuda();
    process.exit(1);
  }
  
  const mapeoReferencias = parsearArgumentos(args);
  
  console.log('Configuración de referencias:');
  console.log(mapeoReferencias);
  console.log('');
  
  procesarOrdenesServicio(rutaArchivo, mapeoReferencias);
}

module.exports = {
  procesarOrdenesServicio,
  mostrarAyuda
}; 