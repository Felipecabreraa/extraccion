const mysql = require('mysql2/promise');
const { 
  Usuario, Zona, Sector, Maquina, Operador 
} = require('../src/models');

// Configuración de la base de datos externa
const configDBExterna = {
  host: process.env.DB_EXTERNA_HOST || 'localhost',
  user: process.env.DB_EXTERNA_USER || 'root',
  password: process.env.DB_EXTERNA_PASSWORD || '',
  database: process.env.DB_EXTERNA_NAME || 'sistema_externo',
  port: process.env.DB_EXTERNA_PORT || 3306
};

// Función para conectar a la base de datos externa
async function conectarDBExterna() {
  try {
    const connection = await mysql.createConnection(configDBExterna);
    console.log('✅ Conexión a base de datos externa establecida');
    return connection;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos externa:', error.message);
    throw error;
  }
}

// Función para extraer identificadores únicos de la vista
async function extraerIdentificadoresUnicos(connection, anioInicio = 2024, anioFin = 2025) {
  try {
    console.log(`🔍 Extrayendo identificadores únicos de ${anioInicio} a ${anioFin}...`);
    
    const query = `
      SELECT DISTINCT
        nombreSupervisor,
        nombreZona,
        nombreSector,
        comunaSector,
        nroMaquina,
        nombreOperador
      FROM vw_PabellonMaquinaDanos 
      WHERE YEAR(fechaOrdenServicio) >= ? AND YEAR(fechaOrdenServicio) <= ?
      ORDER BY nombreSupervisor, nombreZona, nombreSector, nroMaquina, nombreOperador
    `;
    
    const [datos] = await connection.execute(query, [anioInicio, anioFin]);
    
    const identificadores = {
      supervisores: new Set(),
      zonas: new Set(),
      sectores: new Set(),
      maquinas: new Set(),
      operadores: new Set()
    };
    
    datos.forEach(registro => {
      if (registro.nombreSupervisor) identificadores.supervisores.add(registro.nombreSupervisor);
      if (registro.nombreZona) identificadores.zonas.add(registro.nombreZona);
      if (registro.nombreSector) {
        const sectorKey = `${registro.nombreSector} (${registro.comunaSector || 'Sin comuna'})`;
        identificadores.sectores.add(sectorKey);
      }
      if (registro.nroMaquina) identificadores.maquinas.add(registro.nroMaquina);
      if (registro.nombreOperador) identificadores.operadores.add(registro.nombreOperador);
    });
    
    return {
      total: datos.length,
      identificadores: Object.fromEntries(
        Object.entries(identificadores).map(([key, value]) => [key, Array.from(value).sort()])
      )
    };
    
  } catch (error) {
    console.error('❌ Error al extraer identificadores:', error.message);
    throw error;
  }
}

// Función para verificar qué identificadores ya existen en el sistema actual
async function verificarIdentificadoresExistentes(identificadores) {
  console.log('\n🔍 VERIFICANDO IDENTIFICADORES EXISTENTES:');
  console.log('==========================================');
  
  const resultados = {
    supervisores: { existentes: [], nuevos: [] },
    zonas: { existentes: [], nuevos: [] },
    sectores: { existentes: [], nuevos: [] },
    maquinas: { existentes: [], nuevos: [] },
    operadores: { existentes: [], nuevos: [] }
  };
  
  // Verificar supervisores
  console.log('👤 Verificando supervisores...');
  for (const supervisor of identificadores.supervisores) {
    const existe = await Usuario.findOne({
      where: { nombre: supervisor, rol: 'supervisor' }
    });
    
    if (existe) {
      resultados.supervisores.existentes.push(supervisor);
    } else {
      resultados.supervisores.nuevos.push(supervisor);
    }
  }
  
  // Verificar zonas
  console.log('🏘️ Verificando zonas...');
  for (const zona of identificadores.zonas) {
    const existe = await Zona.findOne({
      where: { nombre: zona }
    });
    
    if (existe) {
      resultados.zonas.existentes.push(zona);
    } else {
      resultados.zonas.nuevos.push(zona);
    }
  }
  
  // Verificar sectores
  console.log('🏢 Verificando sectores...');
  for (const sectorCompleto of identificadores.sectores) {
    const [nombreSector, comuna] = sectorCompleto.split(' (');
    const comunaLimpia = comuna ? comuna.replace(')', '') : null;
    
    const existe = await Sector.findOne({
      where: { nombre: nombreSector }
    });
    
    if (existe) {
      resultados.sectores.existentes.push(sectorCompleto);
    } else {
      resultados.sectores.nuevos.push(sectorCompleto);
    }
  }
  
  // Verificar máquinas
  console.log('🚛 Verificando máquinas...');
  for (const maquina of identificadores.maquinas) {
    const existe = await Maquina.findOne({
      where: { numero: maquina }
    });
    
    if (existe) {
      resultados.maquinas.existentes.push(maquina);
    } else {
      resultados.maquinas.nuevos.push(maquina);
    }
  }
  
  // Verificar operadores
  console.log('👷 Verificando operadores...');
  for (const operador of identificadores.operadores) {
    const nombres = operador.split(' ');
    const nombre = nombres[0];
    const apellido = nombres.slice(1).join(' ');
    
    const existe = await Operador.findOne({
      where: { nombre: nombre, apellido: apellido }
    });
    
    if (existe) {
      resultados.operadores.existentes.push(operador);
    } else {
      resultados.operadores.nuevos.push(operador);
    }
  }
  
  return resultados;
}

// Función para mostrar reporte de mapeos
function mostrarReporteMapeos(identificadores, resultados) {
  console.log('\n📊 REPORTE DE MAPEOS DE IDENTIFICADORES:');
  console.log('========================================');
  
  Object.entries(resultados).forEach(([tipo, data]) => {
    const total = identificadores[tipo].length;
    const existentes = data.existentes.length;
    const nuevos = data.nuevos.length;
    
    console.log(`\n${getIcono(tipo)} ${tipo.toUpperCase()} (${total} total):`);
    console.log(`  ✅ Existentes: ${existentes}`);
    console.log(`  ➕ Nuevos: ${nuevos}`);
    
    if (data.nuevos.length > 0) {
      console.log(`  📝 Nuevos ${tipo} a crear:`);
      data.nuevos.forEach(item => console.log(`    - ${item}`));
    }
  });
  
  // Resumen general
  const totalIdentificadores = Object.values(identificadores).reduce((sum, arr) => sum + arr.length, 0);
  const totalExistentes = Object.values(resultados).reduce((sum, data) => sum + data.existentes.length, 0);
  const totalNuevos = Object.values(resultados).reduce((sum, data) => sum + data.nuevos.length, 0);
  
  console.log('\n📈 RESUMEN GENERAL:');
  console.log('==================');
  console.log(`📊 Total identificadores: ${totalIdentificadores}`);
  console.log(`✅ Existentes: ${totalExistentes} (${((totalExistentes/totalIdentificadores)*100).toFixed(1)}%)`);
  console.log(`➕ Nuevos: ${totalNuevos} (${((totalNuevos/totalIdentificadores)*100).toFixed(1)}%)`);
}

// Función para obtener icono
function getIcono(tipo) {
  const iconos = {
    supervisores: '👤',
    zonas: '🏘️',
    sectores: '🏢',
    maquinas: '🚛',
    operadores: '👷'
  };
  return iconos[tipo] || '📋';
}

// Función para generar recomendaciones
function generarRecomendaciones(resultados) {
  console.log('\n💡 RECOMENDACIONES:');
  console.log('==================');
  
  const totalNuevos = Object.values(resultados).reduce((sum, data) => sum + data.nuevos.length, 0);
  
  if (totalNuevos === 0) {
    console.log('✅ Todos los identificadores ya existen. La migración será rápida.');
  } else if (totalNuevos < 50) {
    console.log('⚠️ Se crearán algunos registros nuevos. Revisar antes de continuar.');
  } else {
    console.log('🚨 Se crearán muchos registros nuevos. Considerar migración por lotes.');
  }
  
  // Recomendaciones específicas
  if (resultados.supervisores.nuevos.length > 0) {
    console.log('🔐 Supervisores nuevos tendrán contraseña por defecto (123456).');
  }
  
  if (resultados.maquinas.nuevos.length > 0) {
    console.log('🚗 Máquinas nuevas tendrán patente temporal (MIG-{id}).');
  }
  
  if (resultados.sectores.nuevos.length > 0) {
    console.log('🏢 Sectores nuevos se crearán con datos básicos.');
  }
}

// Función principal
async function verificarMapeos(anioInicio = 2024, anioFin = 2025) {
  let connection = null;
  
  try {
    console.log('🔍 Iniciando verificación de mapeos...');
    
    // Conectar a base de datos externa
    connection = await conectarDBExterna();
    
    // Extraer identificadores únicos
    const { total, identificadores } = await extraerIdentificadoresUnicos(connection, anioInicio, anioFin);
    
    console.log(`📊 Se encontraron ${total} registros únicos`);
    
    // Verificar identificadores existentes
    const resultados = await verificarIdentificadoresExistentes(identificadores);
    
    // Mostrar reporte
    mostrarReporteMapeos(identificadores, resultados);
    
    // Generar recomendaciones
    generarRecomendaciones(resultados);
    
    return {
      total,
      identificadores,
      resultados
    };
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const anioInicio = process.argv[2] || 2024;
  const anioFin = process.argv[3] || 2025;
  
  verificarMapeos(parseInt(anioInicio), parseInt(anioFin))
    .then(() => {
      console.log('\n✅ Verificación completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la verificación:', error.message);
      process.exit(1);
    });
}

module.exports = {
  verificarMapeos,
  extraerIdentificadoresUnicos,
  verificarIdentificadoresExistentes
}; 