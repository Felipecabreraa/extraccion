const sequelize = require('../src/config/database');
require('dotenv').config();

// Función para mostrar configuración actual
function mostrarConfiguracion() {
  console.log('=== CONFIGURACIÓN ACTUAL DE BASE DE DATOS ===\n');
  console.log(`DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`DB_PORT: ${process.env.DB_PORT || 3306}`);
  console.log(`DB_NAME: ${process.env.DB_NAME || 'extraccion'}`);
  console.log(`DB_USER: ${process.env.DB_USER || 'root'}`);
  console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '***CONFIGURADA***' : 'NO CONFIGURADA'}`);
  console.log('');
}

// Función para probar conexión
async function probarConexion() {
  try {
    console.log('🔍 Probando conexión a la base de datos...\n');
    
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos');
    
    // Obtener información de la base de datos
    const [results] = await sequelize.query('SELECT DATABASE() as current_db, USER() as current_user, VERSION() as version');
    console.log(`📊 Base de datos actual: ${results[0].current_db}`);
    console.log(`👤 Usuario actual: ${results[0].current_user}`);
    console.log(`🔧 Versión MySQL: ${results[0].version}`);
    
    return true;
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    
    // Proporcionar sugerencias según el error
    if (error.message.includes('Access denied')) {
      console.log('\n💡 SUGERENCIAS PARA SOLUCIONAR:');
      console.log('1. Verifica que la contraseña de MySQL sea correcta');
      console.log('2. Asegúrate de que el usuario tenga permisos en la base de datos');
      console.log('3. Verifica que MySQL esté ejecutándose');
      console.log('4. Revisa el archivo .env en la carpeta backend');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SUGERENCIAS PARA SOLUCIONAR:');
      console.log('1. Verifica que MySQL esté ejecutándose');
      console.log('2. Confirma que el puerto 3306 esté disponible');
      console.log('3. Verifica que el host sea correcto');
    } else if (error.message.includes('Unknown database')) {
      console.log('\n💡 SUGERENCIAS PARA SOLUCIONAR:');
      console.log('1. La base de datos no existe');
      console.log('2. Crea la base de datos: CREATE DATABASE extraccion;');
      console.log('3. O cambia DB_NAME en el archivo .env');
    }
    
    return false;
  }
}

// Función para mostrar comandos de solución
function mostrarComandosSolucion() {
  console.log('\n=== COMANDOS PARA SOLUCIONAR PROBLEMAS ===\n');
  
  console.log('🔧 1. Conectar a MySQL como root:');
  console.log('   mysql -u root -p');
  console.log('');
  
  console.log('🔧 2. Crear base de datos si no existe:');
  console.log('   CREATE DATABASE extraccion;');
  console.log('');
  
  console.log('🔧 3. Crear usuario y dar permisos:');
  console.log('   CREATE USER "extraccion_user"@"localhost" IDENTIFIED BY "tu_password";');
  console.log('   GRANT ALL PRIVILEGES ON extraccion.* TO "extraccion_user"@"localhost";');
  console.log('   FLUSH PRIVILEGES;');
  console.log('');
  
  console.log('🔧 4. Verificar archivo .env:');
  console.log('   El archivo debe estar en: backend/.env');
  console.log('   Contenido mínimo:');
  console.log('   DB_NAME=extraccion');
  console.log('   DB_USER=root');
  console.log('   DB_PASSWORD=tu_contraseña_aqui');
  console.log('   DB_HOST=localhost');
  console.log('   DB_PORT=3306');
  console.log('');
  
  console.log('🔧 5. Crear archivo .env si no existe:');
  console.log('   node setup-env.js');
  console.log('');
}

// Función principal
async function verificarConexion() {
  try {
    console.log('=== VERIFICADOR DE CONEXIÓN A BASE DE DATOS ===\n');
    
    // Mostrar configuración actual
    mostrarConfiguracion();
    
    // Probar conexión
    const conexionExitosa = await probarConexion();
    
    if (conexionExitosa) {
      console.log('\n✅ La base de datos está configurada correctamente');
      console.log('🔧 Puedes proceder con la limpieza de tablas');
    } else {
      console.log('\n❌ La base de datos no está configurada correctamente');
      mostrarComandosSolucion();
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  } finally {
    // Cerrar conexión
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verificarConexion();
}

module.exports = {
  verificarConexion,
  probarConexion,
  mostrarConfiguracion
}; 