const fs = require('fs');
const path = require('path');

// Datos de conexión proporcionados
const DATOS_CONEXION = {
  host: 'trn.cl',
  user: 'trn_extraccion',
  password: 'RioNegro.2021@',
  database: 'trn_extraccion_new',
  port: '3306'
};

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
  
  // Variables de la base de datos externa (TRN)
  contenido += `# Base de datos externa TRN para migración\n`;
  contenido += `DB_EXTERNA_HOST=${DATOS_CONEXION.host}\n`;
  contenido += `DB_EXTERNA_USER=${DATOS_CONEXION.user}\n`;
  contenido += `DB_EXTERNA_PASSWORD=${DATOS_CONEXION.password}\n`;
  contenido += `DB_EXTERNA_NAME=${DATOS_CONEXION.database}\n`;
  contenido += `DB_EXTERNA_PORT=${DATOS_CONEXION.port}\n`;
  contenido += `\n`;
  
  // Otras variables
  contenido += `# Configuración del servidor\n`;
  contenido += `PORT=${variables.PORT || '3001'}\n`;
  contenido += `NODE_ENV=${variables.NODE_ENV || 'development'}\n`;
  contenido += `JWT_SECRET=${variables.JWT_SECRET || 'tu_jwt_secret_aqui'}\n`;
  
  fs.writeFileSync(rutaEnv, contenido);
  console.log(`✅ Archivo .env configurado: ${rutaEnv}`);
}

// Función para probar conexión a la base de datos externa
async function probarConexionTRN() {
  try {
    console.log('🔍 Probando conexión a base de datos TRN...');
    console.log(`   Host: ${DATOS_CONEXION.host}`);
    console.log(`   Usuario: ${DATOS_CONEXION.user}`);
    console.log(`   Base de datos: ${DATOS_CONEXION.database}`);
    console.log('');
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: DATOS_CONEXION.host,
      user: DATOS_CONEXION.user,
      password: DATOS_CONEXION.password,
      database: DATOS_CONEXION.database,
      port: parseInt(DATOS_CONEXION.port)
    });
    
    // Obtener información de la base de datos
    const [resultado] = await connection.execute('SELECT DATABASE() as db, VERSION() as version');
    const [tablas] = await connection.execute('SHOW TABLES');
    
    console.log('✅ Conexión exitosa a TRN');
    console.log(`📊 Base de datos: ${resultado[0].db}`);
    console.log(`🔧 Versión MySQL: ${resultado[0].version}`);
    console.log(`📋 Tablas encontradas: ${tablas.length}`);
    
    // Mostrar algunas tablas para identificar la de planillas
    console.log('\n📋 Tablas disponibles:');
    tablas.slice(0, 10).forEach((tabla, index) => {
      const nombreTabla = Object.values(tabla)[0];
      console.log(`   ${index + 1}. ${nombreTabla}`);
    });
    
    if (tablas.length > 10) {
      console.log(`   ... y ${tablas.length - 10} tablas más`);
    }
    
    await connection.end();
    return true;
    
  } catch (error) {
    console.error('❌ Error de conexión a TRN:', error.message);
    return false;
  }
}

// Función principal
async function configurarMigracionRapida() {
  console.log('⚡ CONFIGURACIÓN RÁPIDA DE MIGRACIÓN TRN');
  console.log('=======================================');
  console.log('');
  console.log('📋 Datos de conexión configurados:');
  console.log(`   Host: ${DATOS_CONEXION.host}`);
  console.log(`   Usuario: ${DATOS_CONEXION.user}`);
  console.log(`   Base de datos: ${DATOS_CONEXION.database}`);
  console.log(`   Puerto: ${DATOS_CONEXION.port}`);
  console.log('');
  
  // Leer configuración existente
  const variablesExistentes = leerArchivoEnv();
  const existeArchivo = fs.existsSync(path.join(__dirname, '..', '.env'));
  
  if (existeArchivo) {
    console.log('📁 Archivo .env existente detectado');
    console.log('📝 Actualizando configuración con datos de TRN...');
  } else {
    console.log('📁 Creando nuevo archivo .env...');
  }
  
  // Probar conexión
  const conexionExitosa = await probarConexionTRN();
  
  if (!conexionExitosa) {
    console.log('');
    console.log('⚠️  ADVERTENCIA: No se pudo conectar a la base de datos TRN');
    console.log('   Verifica que:');
    console.log('   - El servidor esté accesible');
    console.log('   - Las credenciales sean correctas');
    console.log('   - El firewall permita la conexión');
    console.log('');
    
    const continuar = await obtenerEntrada('¿Deseas continuar de todas formas? (s/n): ');
    if (continuar.toLowerCase() !== 's') {
      console.log('❌ Configuración cancelada');
      return;
    }
  }
  
  // Escribir archivo .env
  escribirArchivoEnv(variablesExistentes);
  
  console.log('');
  console.log('🎉 CONFIGURACIÓN COMPLETADA');
  console.log('==========================');
  console.log('');
  console.log('📋 Variables configuradas:');
  console.log(`   DB_EXTERNA_HOST=${DATOS_CONEXION.host}`);
  console.log(`   DB_EXTERNA_USER=${DATOS_CONEXION.user}`);
  console.log(`   DB_EXTERNA_PASSWORD=***`);
  console.log(`   DB_EXTERNA_NAME=${DATOS_CONEXION.database}`);
  console.log(`   DB_EXTERNA_PORT=${DATOS_CONEXION.port}`);
  console.log('');
  console.log('📋 Próximos pasos recomendados:');
  console.log('1. Crear respaldo completo: node crear_respaldo_completo.js');
  console.log('2. Verificar configuración: node migracion_completa_planillas.js verificar');
  console.log('3. Iniciar migración: node migracion_completa_planillas.js');
  console.log('');
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

// Función para ejecutar desde línea de comandos
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('⚡ CONFIGURADOR RÁPIDO DE MIGRACIÓN TRN');
    console.log('=====================================');
    console.log('');
    console.log('Este script configura automáticamente las variables de entorno');
    console.log('para migrar planillas desde la base de datos TRN.');
    console.log('');
    console.log('Datos de conexión preconfigurados:');
    console.log(`   Host: ${DATOS_CONEXION.host}`);
    console.log(`   Usuario: ${DATOS_CONEXION.user}`);
    console.log(`   Base de datos: ${DATOS_CONEXION.database}`);
    console.log('');
    console.log('Uso:');
    console.log('  node configurar_migracion_rapida.js');
    console.log('');
    return;
  }
  
  try {
    await configurarMigracionRapida();
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
  configurarMigracionRapida,
  probarConexionTRN,
  DATOS_CONEXION
}; 