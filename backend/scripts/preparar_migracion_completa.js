const { crearRespaldoCompleto } = require('./crear_respaldo_completo');
const { configurarMigracionRapida } = require('./configurar_migracion_rapida');
const { verificarConexion } = require('./migracion_completa_planillas');

// Función para obtener entrada del usuario
function obtenerEntrada(pregunta) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta) => {
      rl.close();
      resolve(respuesta);
    });
  });
}

// Función para mostrar menú de preparación
function mostrarMenuPreparacion() {
  console.log('🚀 PREPARACIÓN COMPLETA PARA MIGRACIÓN');
  console.log('=====================================');
  console.log('');
  console.log('Este script prepara todo para la migración de planillas:');
  console.log('');
  console.log('1. Crear respaldo completo del sistema actual');
  console.log('2. Configurar conexión a base de datos TRN');
  console.log('3. Verificar conectividad');
  console.log('4. Iniciar migración');
  console.log('5. Solo crear respaldo');
  console.log('6. Solo configurar conexión');
  console.log('7. Solo verificar conexión');
  console.log('8. Salir');
  console.log('');
}

// Función para crear respaldo
async function ejecutarRespaldo() {
  console.log('🛡️  PASO 1: CREANDO RESPALDO COMPLETO');
  console.log('=====================================');
  console.log('');
  
  try {
    const resultado = await crearRespaldoCompleto();
    console.log('');
    console.log('✅ Respaldo completado exitosamente');
    return resultado;
  } catch (error) {
    console.error('❌ Error en el respaldo:', error.message);
    const continuar = await obtenerEntrada('¿Deseas continuar sin respaldo? (s/n): ');
    return continuar.toLowerCase() === 's' ? null : null;
  }
}

// Función para configurar conexión
async function ejecutarConfiguracion() {
  console.log('⚡ PASO 2: CONFIGURANDO CONEXIÓN TRN');
  console.log('===================================');
  console.log('');
  
  try {
    await configurarMigracionRapida();
    console.log('');
    console.log('✅ Configuración completada exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
    return false;
  }
}

// Función para verificar conexión
async function ejecutarVerificacion() {
  console.log('🔍 PASO 3: VERIFICANDO CONECTIVIDAD');
  console.log('===================================');
  console.log('');
  
  try {
    const resultado = await verificarConexion();
    console.log('');
    if (resultado) {
      console.log('✅ Verificación completada exitosamente');
    } else {
      console.log('❌ Problemas de conectividad detectados');
    }
    return resultado;
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
    return false;
  }
}

// Función para iniciar migración
async function iniciarMigracion() {
  console.log('🚀 PASO 4: INICIANDO MIGRACIÓN');
  console.log('==============================');
  console.log('');
  
  console.log('📋 Opciones de migración:');
  console.log('1. Migración completa (extraer + completar referencias)');
  console.log('2. Solo extraer datos del sistema externo');
  console.log('3. Solo completar referencias de archivo existente');
  console.log('4. Volver al menú principal');
  console.log('');
  
  const opcion = await obtenerEntrada('Selecciona una opción (1-4): ');
  
  switch (opcion.trim()) {
    case '1':
      const anioInicio = parseInt(await obtenerEntrada('Año de inicio (ej: 2024): ')) || 2024;
      const anioFin = parseInt(await obtenerEntrada('Año de fin (ej: 2025): ')) || 2025;
      const crearSupervisores = (await obtenerEntrada('¿Crear supervisores si no existen? (s/n): ')).toLowerCase() === 's';
      const crearSectores = (await obtenerEntrada('¿Crear sectores si no existen? (s/n): ')).toLowerCase() === 's';
      
      console.log('');
      console.log('🚀 Iniciando migración completa...');
      console.log(`📅 Período: ${anioInicio} - ${anioFin}`);
      console.log(`🔧 Opciones: crear supervisores=${crearSupervisores}, crear sectores=${crearSectores}`);
      console.log('');
      
      // Importar y ejecutar migración completa
      const { migracionCompleta } = require('./migracion_completa_planillas');
      await migracionCompleta(anioInicio, anioFin, {
        crearSupervisores,
        crearSectores
      });
      break;
      
    case '2':
      const anioInicio2 = parseInt(await obtenerEntrada('Año de inicio (ej: 2024): ')) || 2024;
      const anioFin2 = parseInt(await obtenerEntrada('Año de fin (ej: 2025): ')) || 2025;
      
      console.log('');
      console.log('📊 Iniciando extracción de datos...');
      
      const { soloExtraerDatos } = require('./migracion_completa_planillas');
      await soloExtraerDatos(anioInicio2, anioFin2);
      break;
      
    case '3':
      const rutaArchivo = await obtenerEntrada('Ruta del archivo Excel de migración: ');
      const crearSupervisores2 = (await obtenerEntrada('¿Crear supervisores si no existen? (s/n): ')).toLowerCase() === 's';
      const crearSectores2 = (await obtenerEntrada('¿Crear sectores si no existen? (s/n): ')).toLowerCase() === 's';
      
      console.log('');
      console.log('🔄 Iniciando completado de referencias...');
      
      const { soloCompletarReferencias } = require('./migracion_completa_planillas');
      await soloCompletarReferencias(rutaArchivo, {
        crearSupervisores: crearSupervisores2,
        crearSectores: crearSectores2
      });
      break;
      
    case '4':
      return false;
      
    default:
      console.log('❌ Opción no válida');
      return false;
  }
  
  return true;
}

// Función principal interactiva
async function prepararMigracionCompleta() {
  console.log('🔧 PREPARACIÓN COMPLETA PARA MIGRACIÓN DE PLANILLAS');
  console.log('==================================================');
  console.log('');
  console.log('Este script te guiará a través de todo el proceso:');
  console.log('1. Crear respaldo completo del sistema actual');
  console.log('2. Configurar conexión a la base de datos TRN');
  console.log('3. Verificar que todo esté funcionando');
  console.log('4. Iniciar la migración de planillas');
  console.log('');
  console.log('⚠️  IMPORTANTE: Se recomienda hacer respaldo antes de continuar');
  console.log('');
  
  while (true) {
    mostrarMenuPreparacion();
    
    const opcion = await obtenerEntrada('Selecciona una opción (1-8): ');
    
    try {
      switch (opcion.trim()) {
        case '1':
          // Proceso completo
          console.log('');
          console.log('🔄 INICIANDO PROCESO COMPLETO');
          console.log('=============================');
          console.log('');
          
          // Paso 1: Respaldo
          const respaldo = await ejecutarRespaldo();
          if (respaldo === null) {
            console.log('❌ Proceso cancelado por el usuario');
            break;
          }
          
          console.log('');
          console.log('='.repeat(50));
          console.log('');
          
          // Paso 2: Configuración
          const configuracion = await ejecutarConfiguracion();
          if (!configuracion) {
            console.log('❌ Error en la configuración, proceso detenido');
            break;
          }
          
          console.log('');
          console.log('='.repeat(50));
          console.log('');
          
          // Paso 3: Verificación
          const verificacion = await ejecutarVerificacion();
          if (!verificacion) {
            console.log('❌ Problemas de conectividad, proceso detenido');
            break;
          }
          
          console.log('');
          console.log('='.repeat(50));
          console.log('');
          
          // Paso 4: Migración
          const migracion = await iniciarMigracion();
          if (!migracion) {
            console.log('❌ Migración cancelada');
            break;
          }
          
          console.log('');
          console.log('🎉 PROCESO COMPLETO FINALIZADO');
          console.log('=============================');
          break;
          
        case '2':
          // Solo respaldo
          await ejecutarRespaldo();
          break;
          
        case '3':
          // Solo configuración
          await ejecutarConfiguracion();
          break;
          
        case '4':
          // Solo verificación
          await ejecutarVerificacion();
          break;
          
        case '5':
          // Solo respaldo
          await ejecutarRespaldo();
          break;
          
        case '6':
          // Solo configuración
          await ejecutarConfiguracion();
          break;
          
        case '7':
          // Solo verificación
          await ejecutarVerificacion();
          break;
          
        case '8':
          console.log('👋 ¡Hasta luego!');
          return;
          
        default:
          console.log('❌ Opción no válida. Por favor selecciona 1-8.');
      }
      
      console.log('\n' + '='.repeat(50));
      const continuar = await obtenerEntrada('¿Deseas realizar otra operación? (s/n): ');
      if (continuar.toLowerCase() !== 's') {
        console.log('👋 ¡Hasta luego!');
        break;
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('\n' + '='.repeat(50));
    }
  }
}

// Función para ejecutar desde línea de comandos
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Modo interactivo
    await prepararMigracionCompleta();
    return;
  }
  
  // Modo línea de comandos
  const comando = args[0];
  
  switch (comando) {
    case 'completo':
      console.log('🔄 Ejecutando proceso completo automáticamente...');
      
      // Respaldo
      await ejecutarRespaldo();
      
      // Configuración
      await ejecutarConfiguracion();
      
      // Verificación
      await ejecutarVerificacion();
      
      // Migración con parámetros por defecto
      const { migracionCompleta } = require('./migracion_completa_planillas');
      await migracionCompleta(2024, 2025, {
        crearSupervisores: true,
        crearSectores: true
      });
      break;
      
    case 'respaldo':
      await ejecutarRespaldo();
      break;
      
    case 'configurar':
      await ejecutarConfiguracion();
      break;
      
    case 'verificar':
      await ejecutarVerificacion();
      break;
      
    default:
      console.log('❌ Uso: node preparar_migracion_completa.js [comando]');
      console.log('');
      console.log('Comandos disponibles:');
      console.log('  completo    - Ejecuta todo el proceso automáticamente');
      console.log('  respaldo    - Solo crear respaldo');
      console.log('  configurar  - Solo configurar conexión');
      console.log('  verificar   - Solo verificar conexión');
      console.log('');
      console.log('Sin argumentos: modo interactivo');
      process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error en la aplicación:', error.message);
    process.exit(1);
  });
}

module.exports = {
  prepararMigracionCompleta,
  ejecutarRespaldo,
  ejecutarConfiguracion,
  ejecutarVerificacion,
  iniciarMigracion
}; 