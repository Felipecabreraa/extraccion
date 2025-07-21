const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Función para obtener entrada del usuario
function obtenerEntrada(pregunta, valorPorDefecto = '') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`${pregunta}${valorPorDefecto ? ` (${valorPorDefecto})` : ''}: `, (respuesta) => {
      rl.close();
      resolve(respuesta || valorPorDefecto);
    });
  });
}

// Función para verificar si existe archivo .env
function verificarArchivoEnv() {
  const rutaEnv = path.join(__dirname, '..', '.env');
  return fs.existsSync(rutaEnv);
}

// Función para leer archivo .env existente
function leerArchivoEnv() {
  const rutaEnv = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(rutaEnv)) {
    return {};
  }
  
  const contenido = fs.readFileSync(rutaEnv, 'utf8');
  const variables = {};
  
  contenido.split('\n').forEach(linea => {
    const [clave, valor] = linea.split('=');
    if (clave && valor) {
      variables[clave.trim()] = valor.trim();
    }
  });
  
  return variables;
}

// Función para escribir archivo .env
function escribirArchivoEnv(variables) {
  const rutaEnv = path.join(__dirname, '..', '.env');
  let contenido = '';
  
  // Variables de la base de datos actual
  contenido += `# Base de datos actual\n`;
  contenido += `DB_HOST=${variables.DB_HOST || 'localhost'}\n`;
  contenido += `DB_USER=${variables.DB_USER || 'root'}\n`;
  contenido += `DB_PASSWORD=${variables.DB_PASSWORD || ''}\n`;
  contenido += `DB_NAME=${variables.DB_NAME || 'extraction_db'}\n`;
  contenido += `DB_PORT=${variables.DB_PORT || '3306'}\n`;
  contenido += `\n`;
  
  // Variables de la base de datos externa
  contenido += `# Base de datos externa para migración\n`;
  contenido += `DB_EXTERNA_HOST=${variables.DB_EXTERNA_HOST || 'localhost'}\n`;
  contenido += `DB_EXTERNA_USER=${variables.DB_EXTERNA_USER || 'root'}\n`;
  contenido += `DB_EXTERNA_PASSWORD=${variables.DB_EXTERNA_PASSWORD || ''}\n`;
  contenido += `DB_EXTERNA_NAME=${variables.DB_EXTERNA_NAME || 'sistema_externo'}\n`;
  contenido += `DB_EXTERNA_PORT=${variables.DB_EXTERNA_PORT || '3306'}\n`;
  contenido += `\n`;
  
  // Otras variables
  contenido += `# Configuración del servidor\n`;
  contenido += `PORT=${variables.PORT || '3001'}\n`;
  contenido += `NODE_ENV=${variables.NODE_ENV || 'development'}\n`;
  contenido += `JWT_SECRET=${variables.JWT_SECRET || 'tu_jwt_secret_aqui'}\n`;
  
  fs.writeFileSync(rutaEnv, contenido);
  console.log(`✅ Archivo .env creado/actualizado: ${rutaEnv}`);
}

// Función para probar conexión a base de datos
async function probarConexion(config) {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port
    });
    
    const [resultado] = await connection.execute('SELECT VERSION() as version');
    await connection.end();
    
    return { exitosa: true, version: resultado[0].version };
  } catch (error) {
    return { exitosa: false, error: error.message };
  }
}

// Función principal
async function configurarMigracion() {
  console.log('🔧 CONFIGURACIÓN DE MIGRACIÓN DE PLANILLAS');
  console.log('==========================================');
  console.log('');
  
  // Verificar archivo .env existente
  const variablesExistentes = leerArchivoEnv();
  const existeArchivo = verificarArchivoEnv();
  
  if (existeArchivo) {
    console.log('📁 Archivo .env encontrado');
    console.log('📋 Variables existentes:');
    Object.keys(variablesExistentes).forEach(clave => {
      if (clave.startsWith('DB_')) {
        const valor = clave.includes('PASSWORD') ? '***' : variablesExistentes[clave];
        console.log(`   ${clave}=${valor}`);
      }
    });
    console.log('');
    
    const actualizar = await obtenerEntrada('¿Deseas actualizar la configuración? (s/n)', 'n');
    if (actualizar.toLowerCase() !== 's') {
      console.log('✅ Configuración mantenida');
      return;
    }
  }
  
  console.log('📝 Configurando variables de entorno...');
  console.log('');
  
  // Configuración de base de datos externa
  console.log('🌐 CONFIGURACIÓN DE BASE DE DATOS EXTERNA');
  console.log('----------------------------------------');
  
  const dbExternaHost = await obtenerEntrada('Host de la base de datos externa', variablesExistentes.DB_EXTERNA_HOST || 'localhost');
  const dbExternaUser = await obtenerEntrada('Usuario de la base de datos externa', variablesExistentes.DB_EXTERNA_USER || 'root');
  const dbExternaPassword = await obtenerEntrada('Contraseña de la base de datos externa', variablesExistentes.DB_EXTERNA_PASSWORD || '');
  const dbExternaName = await obtenerEntrada('Nombre de la base de datos externa', variablesExistentes.DB_EXTERNA_NAME || 'sistema_externo');
  const dbExternaPort = await obtenerEntrada('Puerto de la base de datos externa', variablesExistentes.DB_EXTERNA_PORT || '3306');
  
  console.log('');
  
  // Probar conexión a base de datos externa
  console.log('🔍 Probando conexión a base de datos externa...');
  const resultadoConexion = await probarConexion({
    host: dbExternaHost,
    user: dbExternaUser,
    password: dbExternaPassword,
    database: dbExternaName,
    port: parseInt(dbExternaPort)
  });
  
  if (resultadoConexion.exitosa) {
    console.log('✅ Conexión exitosa');
    console.log(`🔧 Versión MySQL: ${resultadoConexion.version}`);
  } else {
    console.log('❌ Error de conexión:', resultadoConexion.error);
    console.log('');
    const continuar = await obtenerEntrada('¿Deseas continuar de todas formas? (s/n)', 'n');
    if (continuar.toLowerCase() !== 's') {
      console.log('❌ Configuración cancelada');
      return;
    }
  }
  
  console.log('');
  
  // Configuración de base de datos actual (si no existe)
  if (!variablesExistentes.DB_HOST) {
    console.log('🏠 CONFIGURACIÓN DE BASE DE DATOS ACTUAL');
    console.log('--------------------------------------');
    
    const dbHost = await obtenerEntrada('Host de la base de datos actual', 'localhost');
    const dbUser = await obtenerEntrada('Usuario de la base de datos actual', 'root');
    const dbPassword = await obtenerEntrada('Contraseña de la base de datos actual', '');
    const dbName = await obtenerEntrada('Nombre de la base de datos actual', 'extraction_db');
    const dbPort = await obtenerEntrada('Puerto de la base de datos actual', '3306');
    
    // Actualizar variables existentes
    variablesExistentes.DB_HOST = dbHost;
    variablesExistentes.DB_USER = dbUser;
    variablesExistentes.DB_PASSWORD = dbPassword;
    variablesExistentes.DB_NAME = dbName;
    variablesExistentes.DB_PORT = dbPort;
    
    console.log('');
  }
  
  // Actualizar variables de base de datos externa
  variablesExistentes.DB_EXTERNA_HOST = dbExternaHost;
  variablesExistentes.DB_EXTERNA_USER = dbExternaUser;
  variablesExistentes.DB_EXTERNA_PASSWORD = dbExternaPassword;
  variablesExistentes.DB_EXTERNA_NAME = dbExternaName;
  variablesExistentes.DB_EXTERNA_PORT = dbExternaPort;
  
  // Escribir archivo .env
  escribirArchivoEnv(variablesExistentes);
  
  console.log('');
  console.log('🎉 CONFIGURACIÓN COMPLETADA');
  console.log('==========================');
  console.log('');
  console.log('📋 Variables configuradas:');
  console.log(`   DB_EXTERNA_HOST=${dbExternaHost}`);
  console.log(`   DB_EXTERNA_USER=${dbExternaUser}`);
  console.log(`   DB_EXTERNA_PASSWORD=***`);
  console.log(`   DB_EXTERNA_NAME=${dbExternaName}`);
  console.log(`   DB_EXTERNA_PORT=${dbExternaPort}`);
  console.log('');
  console.log('📋 Próximos pasos:');
  console.log('1. Verificar la configuración: node migracion_completa_planillas.js verificar');
  console.log('2. Iniciar migración: node migracion_completa_planillas.js');
  console.log('3. O usar línea de comandos: node migracion_completa_planillas.js completa 2024 2025');
  console.log('');
}

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log('🔧 CONFIGURADOR DE MIGRACIÓN');
  console.log('============================');
  console.log('');
  console.log('Este script configura las variables de entorno necesarias');
  console.log('para migrar planillas desde un sistema externo.');
  console.log('');
  console.log('Uso:');
  console.log('  node configurar_migracion.js');
  console.log('');
  console.log('El script:');
  console.log('1. Detecta configuración existente');
  console.log('2. Solicita datos de conexión a BD externa');
  console.log('3. Prueba la conexión');
  console.log('4. Crea/actualiza el archivo .env');
  console.log('');
  console.log('Variables configuradas:');
  console.log('  DB_EXTERNA_HOST     - Host de la BD externa');
  console.log('  DB_EXTERNA_USER     - Usuario de la BD externa');
  console.log('  DB_EXTERNA_PASSWORD - Contraseña de la BD externa');
  console.log('  DB_EXTERNA_NAME     - Nombre de la BD externa');
  console.log('  DB_EXTERNA_PORT     - Puerto de la BD externa');
  console.log('');
}

// Función para ejecutar desde línea de comandos
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    mostrarAyuda();
    return;
  }
  
  try {
    await configurarMigracion();
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  configurarMigracion,
  verificarArchivoEnv,
  leerArchivoEnv,
  escribirArchivoEnv,
  probarConexion
}; 