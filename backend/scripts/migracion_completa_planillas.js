const path = require('path');
const fs = require('fs');
const { migrarPlanillasSistemaExterno } = require('./migrar_planillas_sistema_externo');
const { completarReferenciasMigracion } = require('./completar_referencias_migracion');

// Función para configurar variables de entorno
function configurarVariablesEntorno() {
  console.log('🔧 Configurando variables de entorno...');
  
  // Verificar si existen las variables de entorno necesarias
  const variablesRequeridas = [
    'DB_EXTERNA_HOST',
    'DB_EXTERNA_USER', 
    'DB_EXTERNA_PASSWORD',
    'DB_EXTERNA_NAME'
  ];
  
  const variablesFaltantes = variablesRequeridas.filter(varName => !process.env[varName]);
  
  if (variablesFaltantes.length > 0) {
    console.log('⚠️  Variables de entorno faltantes:');
    variablesFaltantes.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('');
    console.log('📝 Configura las variables de entorno o usa el archivo .env');
    console.log('');
    console.log('Ejemplo de configuración:');
    console.log('DB_EXTERNA_HOST=localhost');
    console.log('DB_EXTERNA_USER=root');
    console.log('DB_EXTERNA_PASSWORD=tu_password');
    console.log('DB_EXTERNA_NAME=nombre_base_datos');
    console.log('DB_EXTERNA_PORT=3306');
    console.log('');
    
    return false;
  }
  
  console.log('✅ Variables de entorno configuradas correctamente');
  return true;
}

// Función para mostrar menú de opciones
function mostrarMenu() {
  console.log('🚀 MIGRACIÓN COMPLETA DE PLANILLAS');
  console.log('==================================');
  console.log('');
  console.log('Opciones disponibles:');
  console.log('1. Migración completa (extraer + completar referencias)');
  console.log('2. Solo extraer datos del sistema externo');
  console.log('3. Solo completar referencias de archivo existente');
  console.log('4. Verificar conexión a base de datos externa');
  console.log('5. Salir');
  console.log('');
}

// Función para verificar conexión a base de datos externa
async function verificarConexion() {
  try {
    console.log('🔍 Verificando conexión a base de datos externa...');
    
    const { conectarDBExterna } = require('./migrar_planillas_sistema_externo');
    const connection = await conectarDBExterna();
    
    // Obtener información de la base de datos
    const [resultado] = await connection.execute('SELECT DATABASE() as db, VERSION() as version');
    const [tablas] = await connection.execute('SHOW TABLES');
    
    console.log('✅ Conexión exitosa');
    console.log(`📊 Base de datos: ${resultado[0].db}`);
    console.log(`🔧 Versión MySQL: ${resultado[0].version}`);
    console.log(`📋 Tablas encontradas: ${tablas.length}`);
    
    await connection.end();
    return true;
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

// Función para migración completa
async function migracionCompleta(anioInicio, anioFin, opciones) {
  try {
    console.log('🚀 Iniciando migración completa...');
    console.log(`📅 Período: ${anioInicio} - ${anioFin}`);
    console.log(`🔧 Opciones:`, opciones);
    console.log('');
    
    // Paso 1: Extraer datos del sistema externo
    console.log('📊 PASO 1: Extrayendo datos del sistema externo...');
    const resultadoExtraccion = await migrarPlanillasSistemaExterno(anioInicio, anioFin);
    
    // Paso 2: Completar referencias
    console.log('\n🔄 PASO 2: Completando referencias...');
    const resultadoCompletado = await completarReferenciasMigracion(
      resultadoExtraccion.archivos.excel,
      opciones
    );
    
    console.log('\n🎉 MIGRACIÓN COMPLETA FINALIZADA');
    console.log('================================');
    console.log(`📊 Planillas extraídas: ${resultadoExtraccion.planillas.length}`);
    console.log(`✅ Referencias completadas: ${resultadoCompletado.resultados.referenciasEncontradas.supervisores + resultadoCompletado.resultados.referenciasEncontradas.sectores}`);
    console.log(`🆕 Referencias creadas: ${resultadoCompletado.resultados.referenciasCreadas.supervisores + resultadoCompletado.resultados.referenciasCreadas.sectores}`);
    console.log(`❌ Errores: ${resultadoCompletado.resultados.errores.length}`);
    
    console.log('\n📁 Archivos generados:');
    console.log(`   - ${resultadoExtraccion.archivos.excel} (datos extraídos)`);
    console.log(`   - ${resultadoExtraccion.archivos.mapeo} (script de mapeo)`);
    console.log(`   - ${resultadoExtraccion.archivos.reporte} (reporte de extracción)`);
    console.log(`   - ${resultadoCompletado.archivos.excel} (datos completados)`);
    console.log(`   - ${resultadoCompletado.archivos.reporte} (reporte de completado)`);
    
    if (resultadoCompletado.resultados.errores.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS:');
      console.log('Hay errores que deben revisarse antes de proceder con la migración final.');
    }
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Revisar los archivos generados');
    console.log('2. Verificar que todas las referencias estén correctas');
    console.log('3. Usar el endpoint de carga masiva para importar los datos');
    console.log('4. Verificar la integridad de los datos migrados');
    
    return {
      extraccion: resultadoExtraccion,
      completado: resultadoCompletado
    };
    
  } catch (error) {
    console.error('❌ Error en migración completa:', error.message);
    throw error;
  }
}

// Función para extraer solo datos
async function soloExtraerDatos(anioInicio, anioFin) {
  try {
    console.log('📊 Extrayendo solo datos del sistema externo...');
    const resultado = await migrarPlanillasSistemaExterno(anioInicio, anioFin);
    
    console.log('\n✅ Extracción completada');
    console.log(`📊 Planillas extraídas: ${resultado.planillas.length}`);
    console.log(`📁 Archivo generado: ${resultado.archivos.excel}`);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en extracción:', error.message);
    throw error;
  }
}

// Función para completar solo referencias
async function soloCompletarReferencias(rutaArchivo, opciones) {
  try {
    console.log('🔄 Completando solo referencias...');
    const resultado = await completarReferenciasMigracion(rutaArchivo, opciones);
    
    console.log('\n✅ Completado de referencias finalizado');
    console.log(`📊 Planillas procesadas: ${resultado.resultados.planillasCompletadas.length}`);
    console.log(`📁 Archivo generado: ${resultado.archivos.excel}`);
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en completado de referencias:', error.message);
    throw error;
  }
}

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

// Función principal interactiva
async function mainInteractivo() {
  console.log('🔧 Configuración inicial...');
  
  // Verificar variables de entorno
  if (!configurarVariablesEntorno()) {
    console.log('❌ No se pueden continuar sin las variables de entorno necesarias');
    return;
  }
  
  while (true) {
    mostrarMenu();
    
    const opcion = await obtenerEntrada('Selecciona una opción (1-5): ');
    
    try {
      switch (opcion.trim()) {
        case '1':
          // Migración completa
          const anioInicio = parseInt(await obtenerEntrada('Año de inicio (ej: 2024): ')) || 2024;
          const anioFin = parseInt(await obtenerEntrada('Año de fin (ej: 2025): ')) || 2025;
          
          const crearSupervisores = (await obtenerEntrada('¿Crear supervisores si no existen? (s/n): ')).toLowerCase() === 's';
          const crearSectores = (await obtenerEntrada('¿Crear sectores si no existen? (s/n): ')).toLowerCase() === 's';
          
          await migracionCompleta(anioInicio, anioFin, {
            crearSupervisores,
            crearSectores
          });
          break;
          
        case '2':
          // Solo extraer
          const anioInicio2 = parseInt(await obtenerEntrada('Año de inicio (ej: 2024): ')) || 2024;
          const anioFin2 = parseInt(await obtenerEntrada('Año de fin (ej: 2025): ')) || 2025;
          
          await soloExtraerDatos(anioInicio2, anioFin2);
          break;
          
        case '3':
          // Solo completar referencias
          const rutaArchivo = await obtenerEntrada('Ruta del archivo Excel de migración: ');
          const crearSupervisores2 = (await obtenerEntrada('¿Crear supervisores si no existen? (s/n): ')).toLowerCase() === 's';
          const crearSectores2 = (await obtenerEntrada('¿Crear sectores si no existen? (s/n): ')).toLowerCase() === 's';
          
          await soloCompletarReferencias(rutaArchivo, {
            crearSupervisores: crearSupervisores2,
            crearSectores: crearSectores2
          });
          break;
          
        case '4':
          // Verificar conexión
          await verificarConexion();
          break;
          
        case '5':
          console.log('👋 ¡Hasta luego!');
          return;
          
        default:
          console.log('❌ Opción no válida. Por favor selecciona 1-5.');
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
    await mainInteractivo();
    return;
  }
  
  // Modo línea de comandos
  const comando = args[0];
  
  switch (comando) {
    case 'completa':
      const anioInicio = parseInt(args[1]) || 2024;
      const anioFin = parseInt(args[2]) || 2025;
      const crearSupervisores = args.includes('--crear-supervisores');
      const crearSectores = args.includes('--crear-sectores');
      
      await migracionCompleta(anioInicio, anioFin, {
        crearSupervisores,
        crearSectores
      });
      break;
      
    case 'extraer':
      const anioInicio2 = parseInt(args[1]) || 2024;
      const anioFin2 = parseInt(args[2]) || 2025;
      
      await soloExtraerDatos(anioInicio2, anioFin2);
      break;
      
    case 'completar':
      const rutaArchivo = args[1];
      if (!rutaArchivo) {
        console.log('❌ Uso: node migracion_completa_planillas.js completar <archivo.xlsx> [opciones]');
        process.exit(1);
      }
      
      const crearSupervisores2 = args.includes('--crear-supervisores');
      const crearSectores2 = args.includes('--crear-sectores');
      
      await soloCompletarReferencias(rutaArchivo, {
        crearSupervisores: crearSupervisores2,
        crearSectores: crearSectores2
      });
      break;
      
    case 'verificar':
      await verificarConexion();
      break;
      
    default:
      console.log('❌ Uso: node migracion_completa_planillas.js [comando] [opciones]');
      console.log('');
      console.log('Comandos disponibles:');
      console.log('  completa [año_inicio] [año_fin] [--crear-supervisores] [--crear-sectores]');
      console.log('  extraer [año_inicio] [año_fin]');
      console.log('  completar <archivo.xlsx> [--crear-supervisores] [--crear-sectores]');
      console.log('  verificar');
      console.log('');
      console.log('Ejemplos:');
      console.log('  node migracion_completa_planillas.js completa 2024 2025 --crear-supervisores');
      console.log('  node migracion_completa_planillas.js extraer 2024 2025');
      console.log('  node migracion_completa_planillas.js completar migracion_planillas_2024-01-01.xlsx');
      console.log('  node migracion_completa_planillas.js verificar');
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
  migracionCompleta,
  soloExtraerDatos,
  soloCompletarReferencias,
  verificarConexion,
  configurarVariablesEntorno
}; 