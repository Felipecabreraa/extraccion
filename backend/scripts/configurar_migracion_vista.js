const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Función para crear interfaz de lectura
function crearInterfaz() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Función para hacer pregunta
function pregunta(rl, pregunta) {
  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta) => {
      resolve(respuesta);
    });
  });
}

// Función para verificar archivo .env
function verificarArchivoEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ No se encontró archivo .env');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'DB_EXTERNA_HOST',
    'DB_EXTERNA_USER', 
    'DB_EXTERNA_PASSWORD',
    'DB_EXTERNA_NAME',
    'DB_EXTERNA_PORT'
  ];
  
  const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
  
  if (missingVars.length > 0) {
    console.log('❌ Variables faltantes en .env:');
    missingVars.forEach(varName => console.log(`  - ${varName}`));
    return false;
  }
  
  console.log('✅ Archivo .env configurado correctamente');
  return true;
}

// Función para crear template de .env
async function crearTemplateEnv() {
  const rl = crearInterfaz();
  
  console.log('\n🔧 Configuración de Base de Datos Externa');
  console.log('==========================================\n');
  
  const host = await pregunta(rl, 'Host de la base de datos externa (localhost): ') || 'localhost';
  const port = await pregunta(rl, 'Puerto (3306): ') || '3306';
  const user = await pregunta(rl, 'Usuario: ');
  const password = await pregunta(rl, 'Contraseña: ');
  const database = await pregunta(rl, 'Nombre de la base de datos: ');
  
  rl.close();
  
  const envContent = `# Configuración Base de Datos Externa
DB_EXTERNA_HOST=${host}
DB_EXTERNA_PORT=${port}
DB_EXTERNA_USER=${user}
DB_EXTERNA_PASSWORD=${password}
DB_EXTERNA_NAME=${database}

# Configuración Base de Datos Actual (ya existente)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=extraccion
DB_USER=root
DB_PASSWORD=tu_password_aqui

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# Servidor
PORT=3001
NODE_ENV=development

# Seguridad
BCRYPT_ROUNDS=12
`;
  
  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Archivo .env creado exitosamente');
  console.log('📝 Asegúrate de completar la configuración de la base de datos actual');
}

// Función para verificar conexión
async function verificarConexion() {
  const mysql = require('mysql2/promise');
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
  
  const config = {
    host: process.env.DB_EXTERNA_HOST,
    user: process.env.DB_EXTERNA_USER,
    password: process.env.DB_EXTERNA_PASSWORD,
    database: process.env.DB_EXTERNA_NAME,
    port: process.env.DB_EXTERNA_PORT
  };
  
  try {
    console.log('🔍 Verificando conexión a base de datos externa...');
    console.log(`📡 Conectando a: ${config.host}:${config.port}/${config.database}`);
    
    const connection = await mysql.createConnection(config);
    
    // Verificar si existe la vista
    const [vistas] = await connection.execute('SHOW FULL TABLES WHERE Table_type = "VIEW"');
    const vistaExiste = vistas.some(vista => vista[`Tables_in_${config.database}`] === 'vw_PabellonMaquinaDanos');
    
    if (!vistaExiste) {
      console.log('❌ La vista vw_PabellonMaquinaDanos no existe');
      console.log('📋 Vistas disponibles:');
      vistas.forEach(vista => {
        console.log(`  - ${vista[`Tables_in_${config.database}`]}`);
      });
      await connection.end();
      return false;
    }
    
    // Verificar estructura de la vista
    const [columnas] = await connection.execute('DESCRIBE vw_PabellonMaquinaDanos');
    console.log('✅ Vista vw_PabellonMaquinaDanos encontrada');
    console.log('📋 Estructura de la vista:');
    columnas.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    // Verificar datos
    const [datos] = await connection.execute('SELECT COUNT(*) as total FROM vw_PabellonMaquinaDanos');
    console.log(`📊 Total de registros en la vista: ${datos[0].total}`);
    
    // Verificar datos por año
    const [datosPorAnio] = await connection.execute(`
      SELECT YEAR(fechaOrdenServicio) as anio, COUNT(*) as total 
      FROM vw_PabellonMaquinaDanos 
      WHERE fechaOrdenServicio IS NOT NULL
      GROUP BY YEAR(fechaOrdenServicio) 
      ORDER BY anio DESC
    `);
    
    console.log('📅 Registros por año:');
    datosPorAnio.forEach(row => {
      console.log(`  - ${row.anio}: ${row.total} registros`);
    });
    
    await connection.end();
    console.log('✅ Conexión verificada exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error al verificar conexión:', error.message);
    return false;
  }
}

// Función para mostrar ayuda
function mostrarAyuda() {
  console.log(`
🚀 Script de Configuración para Migración de Vista

Uso:
  node configurar_migracion_vista.js [comando]

Comandos disponibles:
  configurar    - Configurar variables de entorno
  verificar     - Verificar conexión y estructura
  ayuda         - Mostrar esta ayuda

Ejemplos:
  node configurar_migracion_vista.js configurar
  node configurar_migracion_vista.js verificar

Pasos para migración:
1. Configurar variables de entorno: node configurar_migracion_vista.js configurar
2. Verificar conexión: node configurar_migracion_vista.js verificar
3. Ejecutar migración: node migracion_vista_pabellon_maquina.js 2024 2025
`);
}

// Función principal
async function main() {
  const comando = process.argv[2] || 'ayuda';
  
  switch (comando) {
    case 'configurar':
      if (verificarArchivoEnv()) {
        console.log('✅ El archivo .env ya está configurado');
        const rl = crearInterfaz();
        const respuesta = await pregunta(rl, '¿Deseas sobrescribirlo? (s/N): ');
        rl.close();
        
        if (respuesta.toLowerCase() === 's' || respuesta.toLowerCase() === 'si') {
          await crearTemplateEnv();
        }
      } else {
        await crearTemplateEnv();
      }
      break;
      
    case 'verificar':
      if (!verificarArchivoEnv()) {
        console.log('❌ Primero debes configurar el archivo .env');
        console.log('💡 Ejecuta: node configurar_migracion_vista.js configurar');
        process.exit(1);
      }
      
      const conexionOk = await verificarConexion();
      if (!conexionOk) {
        console.log('❌ La verificación falló. Revisa la configuración.');
        process.exit(1);
      }
      break;
      
    case 'ayuda':
    default:
      mostrarAyuda();
      break;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Configuración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la configuración:', error.message);
      process.exit(1);
    });
}

module.exports = {
  verificarArchivoEnv,
  crearTemplateEnv,
  verificarConexion
}; 