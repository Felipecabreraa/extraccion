#!/usr/bin/env node

const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('🗄️ Completando duplicación de vistas en trn_extraccion_test...');

// Configuración de la base de datos de producción (origen) - trn_extraccion
const sequelizeProd = new Sequelize({
  dialect: 'mysql',
  host: 'trn.cl',
  port: 3306,
  database: 'trn_extraccion',
  username: 'trn_felipe',
  password: 'RioNegro2025@',
  logging: false
});

// Configuración de la base de datos de prueba (destino) - trn_extraccion_test
const sequelizeTest = new Sequelize({
  dialect: 'mysql',
  host: 'trn.cl',
  port: 3306,
  database: 'trn_extraccion_test',
  username: 'trn_felipe',
  password: 'RioNegro2025@',
  logging: false
});

async function completarDuplicacionVistas() {
  try {
    console.log('\n📋 PASO 1: Verificando conexiones...');
    
    await sequelizeProd.authenticate();
    console.log('✅ Conexión a trn_extraccion exitosa');
    
    await sequelizeTest.authenticate();
    console.log('✅ Conexión a trn_extraccion_test exitosa');
    
    console.log('\n📋 PASO 2: Copiando datos de tablas principales...');
    
    // Lista de tablas principales para copiar datos
    const tablasPrincipales = [
      'barredor',
      'barredor_catalogo', 
      'dano',
      'maquina',
      'maquina_planilla',
      'metros_superficie',
      'migracion_ordenes',
      'migracion_ordenes_2025',
      'operador',
      'pabellon',
      'pabellon_maquina',
      'planilla',
      'reporte_danos_mensuales',
      'sector',
      'usuario',
      'zona'
    ];
    
    for (const tabla of tablasPrincipales) {
      console.log(`📋 Copiando datos de: ${tabla}`);
      
      try {
        // Obtener datos de producción
        const [datos] = await sequelizeProd.query(`SELECT * FROM ${tabla}`);
        
        if (datos.length > 0) {
          // Limpiar tabla de prueba
          await sequelizeTest.query(`DELETE FROM ${tabla}`);
          
          // Insertar datos en prueba
          for (const registro of datos) {
            const columnas = Object.keys(registro).join(', ');
            const valores = Object.values(registro).map(val => 
              val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`
            ).join(', ');
            
            await sequelizeTest.query(`INSERT INTO ${tabla} (${columnas}) VALUES (${valores})`);
          }
          console.log(`✅ ${datos.length} registros copiados de ${tabla}`);
        } else {
          console.log(`ℹ️  Tabla ${tabla} está vacía`);
        }
      } catch (error) {
        console.log(`⚠️  Error copiando ${tabla}: ${error.message}`);
      }
    }
    
    console.log('\n📋 PASO 3: Creando vistas...');
    
    // Crear vista vista_danos_acumulados
    try {
      const vistaDanosAcumulados = `
        CREATE VIEW vista_danos_acumulados AS
        SELECT 
          anio,
          mes,
          valor_real,
          valor_ppto,
          valor_anio_ant,
          SUM(valor_real) OVER (PARTITION BY anio ORDER BY mes) as real_acumulado,
          SUM(valor_ppto) OVER (PARTITION BY anio ORDER BY mes) as ppto_acumulado,
          SUM(valor_anio_ant) OVER (PARTITION BY anio ORDER BY mes) as anio_ant_acumulado
        FROM reporte_danos_mensuales
        ORDER BY anio, mes
      `;
      
      await sequelizeTest.query('DROP VIEW IF EXISTS vista_danos_acumulados');
      await sequelizeTest.query(vistaDanosAcumulados);
      console.log('✅ Vista vista_danos_acumulados creada');
    } catch (error) {
      console.log(`⚠️  Error creando vista_danos_acumulados: ${error.message}`);
    }
    
    // Crear vista vw_danos_mes_anio
    try {
      const vistaDanosMesAnio = `
        CREATE VIEW vw_danos_mes_anio AS
        SELECT 
          anio,
          mes,
          valor_real,
          valor_ppto,
          valor_anio_ant
        FROM reporte_danos_mensuales
        ORDER BY anio, mes
      `;
      
      await sequelizeTest.query('DROP VIEW IF EXISTS vw_danos_mes_anio');
      await sequelizeTest.query(vistaDanosMesAnio);
      console.log('✅ Vista vw_danos_mes_anio creada');
    } catch (error) {
      console.log(`⚠️  Error creando vw_danos_mes_anio: ${error.message}`);
    }
    
    console.log('\n📋 PASO 4: Verificando datos...');
    
    // Verificar que los datos se copiaron correctamente
    const [tablasTest] = await sequelizeTest.query('SHOW TABLES');
    console.log(`✅ ${tablasTest.length} tablas en trn_extraccion_test`);
    
    // Verificar vista específica
    const [datosVista] = await sequelizeTest.query('SELECT COUNT(*) as total FROM vista_danos_acumulados');
    console.log(`✅ Vista vista_danos_acumulados: ${datosVista[0].total} registros`);
    
    console.log('\n✅ ¡Base de datos trn_extraccion_test completada exitosamente!');
    console.log('\n🌐 URLs de Prueba:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Base de datos: trn_extraccion_test (en hosting)');
    
    console.log('\n🚀 Comandos disponibles:');
    console.log('   - node scripts/start-development.js    # Iniciar desarrollo');
    console.log('   - npm start (en backend)              # Iniciar backend');
    console.log('   - npm start (en frontend)             # Iniciar frontend');
    
  } catch (error) {
    console.error('\n❌ Error completando duplicación:', error.message);
  } finally {
    await sequelizeProd.close();
    await sequelizeTest.close();
  }
}

completarDuplicacionVistas(); 