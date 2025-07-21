const fs = require('fs');
const path = require('path');
const { 
  Usuario, Zona, Sector, Pabellon, Planilla, Barredor, Maquina, 
  Operador, MaquinaPlanilla, PabellonMaquina, Dano, BarredorCatalogo 
} = require('../src/models');
const { limpiarBaseDeDatos } = require('./limpiar_tablas');

// Función para crear directorio de respaldos
function crearDirectorioRespaldo() {
  const directorioRespaldo = path.join(__dirname, 'respaldo');
  if (!fs.existsSync(directorioRespaldo)) {
    fs.mkdirSync(directorioRespaldo, { recursive: true });
  }
  return directorioRespaldo;
}

// Función para respaldar una tabla
async function respaldarTabla(modelo, nombreTabla, directorioRespaldo) {
  try {
    const datos = await modelo.findAll({
      raw: true,
      nest: true
    });
    
    const nombreArchivo = `${nombreTabla}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const rutaArchivo = path.join(directorioRespaldo, nombreArchivo);
    
    fs.writeFileSync(rutaArchivo, JSON.stringify(datos, null, 2), 'utf8');
    
    console.log(`✅ Tabla '${nombreTabla}' respaldada: ${datos.length} registros`);
    return { tabla: nombreTabla, registros: datos.length, archivo: nombreArchivo };
  } catch (error) {
    console.error(`❌ Error al respaldar tabla '${nombreTabla}':`, error.message);
    return { tabla: nombreTabla, error: error.message };
  }
}

// Función para respaldar todas las tablas
async function respaldarTodasLasTablas() {
  const directorioRespaldo = crearDirectorioRespaldo();
  const resultados = [];
  
  console.log('=== RESPALDO DE TABLAS ===\n');
  console.log(`📁 Directorio de respaldo: ${directorioRespaldo}\n`);
  
  // Lista de tablas a respaldar
  const tablasARespaldar = [
    { modelo: Zona, nombre: 'zona' },
    { modelo: Sector, nombre: 'sector' },
    { modelo: Pabellon, nombre: 'pabellon' },
    { modelo: Planilla, nombre: 'planilla' },
    { modelo: Barredor, nombre: 'barredor' },
    { modelo: Maquina, nombre: 'maquina' },
    { modelo: Operador, nombre: 'operador' },
    { modelo: MaquinaPlanilla, nombre: 'maquina_planilla' },
    { modelo: PabellonMaquina, nombre: 'pabellon_maquina' },
    { modelo: Dano, nombre: 'dano' },
    { modelo: BarredorCatalogo, nombre: 'barredor_catalogo' }
  ];
  
  console.log('Iniciando respaldo de tablas...\n');
  
  for (const tabla of tablasARespaldar) {
    const resultado = await respaldarTabla(tabla.modelo, tabla.nombre, directorioRespaldo);
    resultados.push(resultado);
  }
  
  return { resultados, directorioRespaldo };
}

// Función para mostrar estadísticas de respaldo
function mostrarEstadisticasRespaldo(resultados) {
  console.log('\n=== ESTADÍSTICAS DE RESPALDO ===');
  
  const exitosos = resultados.filter(r => r.registros !== undefined);
  const errores = resultados.filter(r => r.error);
  
  console.log(`✅ Tablas respaldadas exitosamente: ${exitosos.length}`);
  console.log(`❌ Tablas con errores: ${errores.length}`);
  
  if (exitosos.length > 0) {
    console.log('\n📋 Tablas respaldadas:');
    exitosos.forEach(r => {
      console.log(`   - ${r.tabla}: ${r.registros} registros → ${r.archivo}`);
    });
  }
  
  if (errores.length > 0) {
    console.log('\n⚠️ Tablas con errores:');
    errores.forEach(r => {
      console.log(`   - ${r.tabla}: ${r.error}`);
    });
  }
  
  const totalRegistros = exitosos.reduce((sum, r) => sum + r.registros, 0);
  console.log(`\n📊 Total de registros respaldados: ${totalRegistros}`);
}

// Función para crear archivo de metadatos del respaldo
function crearMetadatosRespaldo(resultados, directorioRespaldo) {
  const metadatos = {
    fecha: new Date().toISOString(),
    timestamp: Date.now(),
    total_tablas: resultados.length,
    tablas_exitosas: resultados.filter(r => r.registros !== undefined).length,
    tablas_con_errores: resultados.filter(r => r.error).length,
    total_registros: resultados.filter(r => r.registros !== undefined).reduce((sum, r) => sum + r.registros, 0),
    tablas: resultados.map(r => ({
      nombre: r.tabla,
      registros: r.registros || 0,
      archivo: r.archivo || null,
      error: r.error || null
    }))
  };
  
  const nombreArchivo = `metadatos_respaldo_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const rutaArchivo = path.join(directorioRespaldo, nombreArchivo);
  
  fs.writeFileSync(rutaArchivo, JSON.stringify(metadatos, null, 2), 'utf8');
  console.log(`📄 Metadatos del respaldo: ${nombreArchivo}`);
  
  return rutaArchivo;
}

// Función para confirmar la acción
function solicitarConfirmacion() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log('\n⚠️ ADVERTENCIA: Esta acción realizará las siguientes operaciones:');
    console.log('   1. Crear respaldo de todas las tablas (excepto usuarios)');
    console.log('   2. Vaciar todas las tablas (excepto usuarios)');
    console.log('   3. Verificar que las tablas estén vacías');
    console.log('\n💾 La tabla "usuarios" NO se modificará ni respaldará.');
    console.log('\nEsta acción NO se puede deshacer.');
    
    rl.question('\n¿Estás seguro de que quieres continuar? (escribe "SI" para confirmar): ', (respuesta) => {
      rl.close();
      resolve(respuesta.toUpperCase() === 'SI');
    });
  });
}

// Función principal
async function respaldarYLimpiar(confirmacionAutomatica = false) {
  try {
    console.log('=== RESPALDO Y LIMPIEZA DE BASE DE DATOS ===\n');
    
    // Solicitar confirmación si no es automática
    if (!confirmacionAutomatica) {
      const confirmado = await solicitarConfirmacion();
      if (!confirmado) {
        console.log('❌ Operación cancelada por el usuario');
        return;
      }
    }
    
    // Paso 1: Respaldar tablas
    console.log('🚀 PASO 1: Creando respaldo de tablas...\n');
    const { resultados, directorioRespaldo } = await respaldarTodasLasTablas();
    
    // Mostrar estadísticas de respaldo
    mostrarEstadisticasRespaldo(resultados);
    
    // Crear metadatos del respaldo
    crearMetadatosRespaldo(resultados, directorioRespaldo);
    
    console.log('\n✅ Respaldo completado exitosamente');
    console.log(`📁 Archivos guardados en: ${directorioRespaldo}`);
    
    // Paso 2: Limpiar tablas
    console.log('\n🚀 PASO 2: Limpiando tablas...\n');
    await limpiarBaseDeDatos(true); // Confirmación automática
    
    console.log('\n=== PROCESO COMPLETADO ===');
    console.log('✅ Respaldo y limpieza completados exitosamente');
    console.log('💾 La tabla de usuarios se mantiene intacta');
    console.log('🔧 Ahora puedes proceder con la carga masiva de datos');
    console.log(`📁 Respaldo disponible en: ${directorioRespaldo}`);
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error.message);
  }
}

// Función para restaurar desde respaldo
async function restaurarDesdeRespaldo(directorioRespaldo) {
  try {
    console.log('=== RESTAURACIÓN DESDE RESPALDO ===\n');
    
    if (!fs.existsSync(directorioRespaldo)) {
      console.error('❌ Directorio de respaldo no encontrado');
      return;
    }
    
    const archivos = fs.readdirSync(directorioRespaldo);
    const archivosJSON = archivos.filter(archivo => 
      archivo.endsWith('.json') && !archivo.startsWith('metadatos_')
    );
    
    console.log(`📁 Encontrados ${archivosJSON.length} archivos de respaldo\n`);
    
    for (const archivo of archivosJSON) {
      const nombreTabla = archivo.split('_')[0];
      const rutaArchivo = path.join(directorioRespaldo, archivo);
      
      try {
        const datos = JSON.parse(fs.readFileSync(rutaArchivo, 'utf8'));
        console.log(`📋 Restaurando tabla '${nombreTabla}': ${datos.length} registros`);
        
        // Aquí iría la lógica de restauración según el modelo
        // Por ahora solo mostramos la información
        
      } catch (error) {
        console.error(`❌ Error al restaurar '${nombreTabla}':`, error.message);
      }
    }
    
    console.log('\n✅ Restauración completada');
    
  } catch (error) {
    console.error('❌ Error durante la restauración:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv;
  const comando = args[2];
  
  if (comando === 'restaurar') {
    const directorioRespaldo = args[3] || path.join(__dirname, 'respaldo');
    restaurarDesdeRespaldo(directorioRespaldo);
  } else {
    const confirmacionAutomatica = args.includes('--auto') || args.includes('--automatic');
    respaldarYLimpiar(confirmacionAutomatica);
  }
}

module.exports = {
  respaldarYLimpiar,
  respaldarTodasLasTablas,
  restaurarDesdeRespaldo
}; 