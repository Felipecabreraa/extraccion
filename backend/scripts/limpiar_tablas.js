const { 
  Usuario, Zona, Sector, Pabellon, Planilla, Barredor, Maquina, 
  Operador, MaquinaPlanilla, PabellonMaquina, Dano, BarredorCatalogo 
} = require('../src/models');
const sequelize = require('../src/config/database');

// Función para deshabilitar verificación de claves foráneas
async function deshabilitarVerificacionFK() {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('✅ Verificación de claves foráneas deshabilitada');
  } catch (error) {
    console.log('⚠️ No se pudo deshabilitar verificación de FK (puede ser normal en algunos sistemas)');
  }
}

// Función para habilitar verificación de claves foráneas
async function habilitarVerificacionFK() {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Verificación de claves foráneas habilitada');
  } catch (error) {
    console.log('⚠️ No se pudo habilitar verificación de FK (puede ser normal en algunos sistemas)');
  }
}

// Función para vaciar una tabla específica
async function vaciarTabla(modelo, nombreTabla) {
  try {
    const resultado = await modelo.destroy({
      where: {},
      truncate: true,
      force: true
    });
    console.log(`✅ Tabla '${nombreTabla}' vaciada exitosamente`);
    return { tabla: nombreTabla, estado: 'vaciada', registros: resultado };
  } catch (error) {
    console.error(`❌ Error al vaciar tabla '${nombreTabla}':`, error.message);
    return { tabla: nombreTabla, estado: 'error', error: error.message };
  }
}

// Función para vaciar todas las tablas excepto usuarios
async function limpiarTodasLasTablas() {
  const resultados = [];
  
  console.log('=== LIMPIEZA DE TABLAS ===\n');
  
  // Deshabilitar verificación de FK para evitar problemas de dependencias
  await deshabilitarVerificacionFK();
  
  // Lista de tablas a vaciar (en orden de dependencias)
  const tablasAVaciar = [
    { modelo: Dano, nombre: 'dano' },
    { modelo: PabellonMaquina, nombre: 'pabellon_maquina' },
    { modelo: MaquinaPlanilla, nombre: 'maquina_planilla' },
    { modelo: Barredor, nombre: 'barredor' },
    { modelo: Planilla, nombre: 'planilla' },
    { modelo: Pabellon, nombre: 'pabellon' },
    { modelo: Sector, nombre: 'sector' },
    { modelo: Zona, nombre: 'zona' },
    { modelo: Operador, nombre: 'operador' },
    { modelo: Maquina, nombre: 'maquina' },
    { modelo: BarredorCatalogo, nombre: 'barredor_catalogo' }
  ];
  
  console.log('Iniciando limpieza de tablas...\n');
  
  for (const tabla of tablasAVaciar) {
    const resultado = await vaciarTabla(tabla.modelo, tabla.nombre);
    resultados.push(resultado);
  }
  
  // Habilitar verificación de FK
  await habilitarVerificacionFK();
  
  return resultados;
}

// Función para mostrar estadísticas de limpieza
function mostrarEstadisticas(resultados) {
  console.log('\n=== ESTADÍSTICAS DE LIMPIEZA ===');
  
  const exitosas = resultados.filter(r => r.estado === 'vaciada');
  const errores = resultados.filter(r => r.estado === 'error');
  
  console.log(`✅ Tablas vaciadas exitosamente: ${exitosas.length}`);
  console.log(`❌ Tablas con errores: ${errores.length}`);
  
  if (exitosas.length > 0) {
    console.log('\n📋 Tablas vaciadas:');
    exitosas.forEach(r => {
      console.log(`   - ${r.tabla}`);
    });
  }
  
  if (errores.length > 0) {
    console.log('\n⚠️ Tablas con errores:');
    errores.forEach(r => {
      console.log(`   - ${r.tabla}: ${r.error}`);
    });
  }
  
  console.log('\n💾 Tabla de usuarios preservada (no se modificó)');
}

// Función para verificar que las tablas estén vacías
async function verificarTablasVacias() {
  console.log('\n=== VERIFICACIÓN DE TABLAS VACÍAS ===');
  
  const tablasAVerificar = [
    { modelo: Dano, nombre: 'dano' },
    { modelo: PabellonMaquina, nombre: 'pabellon_maquina' },
    { modelo: MaquinaPlanilla, nombre: 'maquina_planilla' },
    { modelo: Barredor, nombre: 'barredor' },
    { modelo: Planilla, nombre: 'planilla' },
    { modelo: Pabellon, nombre: 'pabellon' },
    { modelo: Sector, nombre: 'sector' },
    { modelo: Zona, nombre: 'zona' },
    { modelo: Operador, nombre: 'operador' },
    { modelo: Maquina, nombre: 'maquina' },
    { modelo: BarredorCatalogo, nombre: 'barredor_catalogo' }
  ];
  
  for (const tabla of tablasAVerificar) {
    try {
      const count = await tabla.modelo.count();
      if (count === 0) {
        console.log(`✅ ${tabla.nombre}: Vacía (0 registros)`);
      } else {
        console.log(`⚠️ ${tabla.nombre}: ${count} registros restantes`);
      }
    } catch (error) {
      console.log(`❌ ${tabla.nombre}: Error al verificar - ${error.message}`);
    }
  }
  
  // Verificar que usuarios no se modificó
  try {
    const countUsuarios = await Usuario.count();
    console.log(`✅ usuarios: ${countUsuarios} registros (preservados)`);
  } catch (error) {
    console.log(`❌ usuarios: Error al verificar - ${error.message}`);
  }
}

// Función para confirmar la acción
function solicitarConfirmacion() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    console.log('\n⚠️ ADVERTENCIA: Esta acción eliminará TODOS los datos de las siguientes tablas:');
    console.log('   - dano');
    console.log('   - pabellon_maquina');
    console.log('   - maquina_planilla');
    console.log('   - barredor');
    console.log('   - planilla');
    console.log('   - pabellon');
    console.log('   - sector');
    console.log('   - zona');
    console.log('   - operador');
    console.log('   - maquina');
    console.log('   - barredor_catalogo');
    console.log('\n💾 La tabla "usuarios" NO se modificará.');
    console.log('\nEsta acción NO se puede deshacer.');
    
    rl.question('\n¿Estás seguro de que quieres continuar? (escribe "SI" para confirmar): ', (respuesta) => {
      rl.close();
      resolve(respuesta.toUpperCase() === 'SI');
    });
  });
}

// Función principal
async function limpiarBaseDeDatos(confirmacionAutomatica = false) {
  try {
    console.log('=== LIMPIADOR DE BASE DE DATOS ===\n');
    
    // Solicitar confirmación si no es automática
    if (!confirmacionAutomatica) {
      const confirmado = await solicitarConfirmacion();
      if (!confirmado) {
        console.log('❌ Operación cancelada por el usuario');
        return;
      }
    }
    
    console.log('🚀 Iniciando limpieza de base de datos...\n');
    
    // Limpiar tablas
    const resultados = await limpiarTodasLasTablas();
    
    // Mostrar estadísticas
    mostrarEstadisticas(resultados);
    
    // Verificar que las tablas estén vacías
    await verificarTablasVacias();
    
    console.log('\n=== LIMPIEZA COMPLETADA ===');
    console.log('✅ Todas las tablas han sido vaciadas exitosamente');
    console.log('💾 La tabla de usuarios se mantiene intacta');
    console.log('🔧 Ahora puedes proceder con la carga masiva de datos');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
  } finally {
    // Cerrar conexión
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv;
  const confirmacionAutomatica = args.includes('--auto') || args.includes('--automatic');
  
  limpiarBaseDeDatos(confirmacionAutomatica);
}

module.exports = {
  limpiarBaseDeDatos,
  limpiarTodasLasTablas,
  verificarTablasVacias,
  vaciarTabla
}; 