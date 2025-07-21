const mysql = require('mysql2/promise');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { 
  Usuario, Zona, Sector, Planilla, Maquina, 
  Operador, MaquinaPlanilla 
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

// Función para extraer datos de la vista vw_PabellonMaquinaDanos
async function extraerDatosVista(connection, anioInicio = 2024, anioFin = 2025) {
  try {
    console.log(`📊 Extrayendo datos de vw_PabellonMaquinaDanos de ${anioInicio} a ${anioFin}...`);
    
    // Query para extraer datos de la vista
    const query = `
      SELECT * FROM vw_PabellonMaquinaDanos 
      WHERE YEAR(fechaOrdenServicio) >= ? AND YEAR(fechaOrdenServicio) <= ?
      ORDER BY fechaOrdenServicio DESC, idOrdenServicio, nroPabellon, idMaquina
    `;
    
    const [datos] = await connection.execute(query, [anioInicio, anioFin]);
    
    console.log(`📈 Se encontraron ${datos.length} registros`);
    
    // Analizar estructura de datos
    const analisis = analizarEstructuraDatos(datos);
    console.log('📋 Análisis de estructura:', analisis);
    
    return {
      datos: datos,
      analisis: analisis
    };
    
  } catch (error) {
    console.error('❌ Error al extraer datos de la vista:', error.message);
    throw error;
  }
}

// Función para analizar la estructura de datos
function analizarEstructuraDatos(datos) {
  const analisis = {
    totalRegistros: datos.length,
    ordenesServicio: new Set(),
    supervisores: new Set(),
    zonas: new Set(),
    sectores: new Set(),
    maquinas: new Set(),
    operadores: new Set(),
    pabellones: new Set(),
    fechas: {
      inicio: null,
      fin: null
    },
    estadisticas: {
      registrosPorOrden: {},
      maquinasPorOrden: {},
      operadoresPorOrden: {}
    }
  };
  
  datos.forEach(registro => {
    // Contar elementos únicos
    analisis.ordenesServicio.add(registro.idOrdenServicio);
    analisis.supervisores.add(registro.nombreSupervisor);
    analisis.zonas.add(registro.nombreZona);
    analisis.sectores.add(registro.nombreSector);
    analisis.maquinas.add(registro.idMaquina);
    analisis.operadores.add(registro.idOperador);
    analisis.pabellones.add(registro.nroPabellon);
    
    // Fechas
    const fecha = new Date(registro.fechaOrdenServicio);
    if (!analisis.fechas.inicio || fecha < analisis.fechas.inicio) {
      analisis.fechas.inicio = fecha;
    }
    if (!analisis.fechas.fin || fecha > analisis.fechas.fin) {
      analisis.fechas.fin = fecha;
    }
    
    // Estadísticas por orden de servicio
    if (!analisis.estadisticas.registrosPorOrden[registro.idOrdenServicio]) {
      analisis.estadisticas.registrosPorOrden[registro.idOrdenServicio] = 0;
      analisis.estadisticas.maquinasPorOrden[registro.idOrdenServicio] = new Set();
      analisis.estadisticas.operadoresPorOrden[registro.idOrdenServicio] = new Set();
    }
    
    analisis.estadisticas.registrosPorOrden[registro.idOrdenServicio]++;
    analisis.estadisticas.maquinasPorOrden[registro.idOrdenServicio].add(registro.idMaquina);
    analisis.estadisticas.operadoresPorOrden[registro.idOrdenServicio].add(registro.idOperador);
  });
  
  // Convertir Sets a Arrays para mejor visualización
  analisis.ordenesServicio = Array.from(analisis.ordenesServicio);
  analisis.supervisores = Array.from(analisis.supervisores);
  analisis.zonas = Array.from(analisis.zonas);
  analisis.sectores = Array.from(analisis.sectores);
  analisis.maquinas = Array.from(analisis.maquinas);
  analisis.operadores = Array.from(analisis.operadores);
  analisis.pabellones = Array.from(analisis.pabellones);
  
  // Convertir estadísticas
  Object.keys(analisis.estadisticas.maquinasPorOrden).forEach(orden => {
    analisis.estadisticas.maquinasPorOrden[orden] = Array.from(analisis.estadisticas.maquinasPorOrden[orden]);
    analisis.estadisticas.operadoresPorOrden[orden] = Array.from(analisis.estadisticas.operadoresPorOrden[orden]);
  });
  
  return analisis;
}

// Función para agrupar datos por orden de servicio
function agruparDatosPorOrden(datos) {
  console.log('🔄 Agrupando datos por orden de servicio...');
  
  const datosAgrupados = {};
  
  datos.forEach(registro => {
    const ordenServicio = registro.idOrdenServicio;
    
    if (!datosAgrupados[ordenServicio]) {
      // Crear planilla base
      datosAgrupados[ordenServicio] = {
        planilla: {
          // Datos de la planilla (se tomarán del primer registro)
          supervisor_nombre: registro.nombreSupervisor,
          zona_nombre: registro.nombreZona,
          sector_nombre: registro.nombreSector,
          comuna_sector: registro.comunaSector,
          mt2: parseFloat(registro.mts2sector) || 0,
          pabellones_total: parseInt(registro.cantidadPabellones) || 0,
          pabellones_limpiados: parseInt(registro.cantLimpiar) || 0,
          fecha_inicio: registro.fechaOrdenServicio,
          fecha_termino: registro.fechaFinOrdenServicio,
          ticket: registro.nroTicket || `OS-${ordenServicio}`,
          estado: mapearEstado(registro.nombreEstado),
          observacion: registro.observacionOrden || '',
          tipo_faena: registro.tipoFaena || '',
          faena_especial: registro.faenaEspecial || '',
          
          // Datos originales para referencia
          datos_originales: {
            id_orden_servicio: ordenServicio,
            campos_originales: registro
          }
        },
        maquinas_planilla: []
      };
    }
    
    // Agregar registro de máquina/operador
    datosAgrupados[ordenServicio].maquinas_planilla.push({
      nro_pabellon: registro.nroPabellon,
      id_maquina: registro.idMaquina,
      nro_maquina: registro.nroMaquina,
      id_operador: registro.idOperador,
      nombre_operador: registro.nombreOperador,
      odometro_inicio: parseFloat(registro.odometroInicio) || 0,
      odometro_fin: parseFloat(registro.odometroFin) || 0,
      petroleo: parseFloat(registro.litrosPetroleo) || 0,
      
      // Datos de daños (si existen)
      tipo_dano: registro.nombreTipoDano,
      descripcion_dano: registro.nombreDescripcionDano,
      cantidad_dano: registro.cantidadDano,
      observacion_dano: registro.observacion,
      
      // Datos originales para referencia
      datos_originales: {
        campos_originales: registro
      }
    });
  });
  
  console.log(`📊 Se agruparon ${Object.keys(datosAgrupados).length} órdenes de servicio`);
  
  return datosAgrupados;
}

// Función para mapear estados
function mapearEstado(estadoOriginal) {
  if (!estadoOriginal) return 'PENDIENTE';
  
  const estado = String(estadoOriginal).toUpperCase();
  
  const mapeoEstados = {
    'PENDIENTE': 'PENDIENTE',
    'PENDING': 'PENDIENTE',
    'ACTIVA': 'ACTIVA',
    'ACTIVE': 'ACTIVA',
    'EN_PROGRESO': 'ACTIVA',
    'IN_PROGRESS': 'ACTIVA',
    'COMPLETADA': 'COMPLETADA',
    'COMPLETED': 'COMPLETADA',
    'FINALIZADA': 'COMPLETADA',
    'FINISHED': 'COMPLETADA',
    'CERRADO': 'COMPLETADA',
    'CLOSED': 'COMPLETADA',
    'CANCELADA': 'CANCELADA',
    'CANCELLED': 'CANCELADA',
    'ANULADA': 'CANCELADA'
  };
  
  return mapeoEstados[estado] || 'PENDIENTE';
}

// Función para buscar o crear supervisor por NOMBRE (identificador estable)
async function buscarOCrearSupervisor(nombreSupervisor) {
  try {
    // Buscar supervisor existente por NOMBRE (no por ID)
    let supervisor = await Usuario.findOne({
      where: {
        nombre: nombreSupervisor,
        rol: 'supervisor'
      }
    });
    
    if (!supervisor) {
      console.log(`👤 Creando supervisor: ${nombreSupervisor}`);
      
      // Crear supervisor
      supervisor = await Usuario.create({
        nombre: nombreSupervisor,
        email: `${nombreSupervisor.toLowerCase().replace(/\s+/g, '.')}@rionegro.cl`,
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', // 123456
        rol: 'supervisor'
      });
    }
    
    return supervisor.id;
  } catch (error) {
    console.error(`❌ Error al buscar/crear supervisor ${nombreSupervisor}:`, error.message);
    throw error;
  }
}

// Función para buscar o crear zona por NOMBRE (identificador estable)
async function buscarOCrearZona(nombreZona) {
  try {
    // Buscar zona existente por NOMBRE (no por ID)
    let zona = await Zona.findOne({
      where: { nombre: nombreZona }
    });
    
    if (!zona) {
      console.log(`🏘️ Creando zona: ${nombreZona}`);
      
      // Crear zona
      zona = await Zona.create({
        nombre: nombreZona,
        tipo: 'NORMAL' // Valor por defecto
      });
    }
    
    return zona.id;
  } catch (error) {
    console.error(`❌ Error al buscar/crear zona ${nombreZona}:`, error.message);
    throw error;
  }
}

// Función para buscar o crear sector por NOMBRE y COMUNA (identificadores estables)
async function buscarOCrearSector(nombreSector, comunaSector, zonaId, cantidadPabellones, mt2) {
  try {
    // Buscar sector existente por NOMBRE y COMUNA (identificadores estables)
    let sector = await Sector.findOne({
      where: { 
        nombre: nombreSector,
        zona_id: zonaId
      }
    });
    
    // Si no se encuentra por nombre+zona, buscar solo por nombre
    if (!sector) {
      sector = await Sector.findOne({
        where: { nombre: nombreSector }
      });
    }
    
    if (!sector) {
      console.log(`🏢 Creando sector: ${nombreSector} (Zona: ${zonaId}, Comuna: ${comunaSector})`);
      
      // Crear sector
      sector = await Sector.create({
        nombre: nombreSector,
        zona_id: zonaId,
        comuna: comunaSector || null,
        cantidad_pabellones: parseInt(cantidadPabellones) || null,
        mt2: parseFloat(mt2) || null
      });
    } else {
      // Si se encontró pero no tiene zona_id, actualizarlo
      if (!sector.zona_id && zonaId) {
        console.log(`🔄 Actualizando zona del sector ${nombreSector} a zona ${zonaId}`);
        await sector.update({ zona_id: zonaId });
      }
    }
    
    return sector.id;
  } catch (error) {
    console.error(`❌ Error al buscar/crear sector ${nombreSector}:`, error.message);
    throw error;
  }
}

// Función para buscar o crear máquina por NÚMERO (identificador estable)
async function buscarOCrearMaquina(idMaquina, nroMaquina) {
  try {
    // Buscar máquina existente por NÚMERO (no por ID)
    let maquina = await Maquina.findOne({
      where: { numero: nroMaquina }
    });
    
    if (!maquina) {
      console.log(`🚛 Creando máquina: ${nroMaquina}`);
      
      // Crear máquina
      maquina = await Maquina.create({
        numero: nroMaquina,
        patente: `MIG-${idMaquina}`, // Patente temporal
        marca: 'MIGRACION',
        modelo: 'SISTEMA ANTERIOR'
      });
    }
    
    return maquina.id;
  } catch (error) {
    console.error(`❌ Error al buscar/crear máquina ${nroMaquina}:`, error.message);
    throw error;
  }
}

// Función para buscar o crear operador por NOMBRE COMPLETO (identificador estable)
async function buscarOCrearOperador(idOperador, nombreOperador) {
  try {
    // Buscar operador existente por NOMBRE COMPLETO (no por ID)
    const nombres = nombreOperador.split(' ');
    const nombre = nombres[0];
    const apellido = nombres.slice(1).join(' ');
    
    let operador = await Operador.findOne({
      where: { 
        nombre: nombre,
        apellido: apellido
      }
    });
    
    if (!operador) {
      console.log(`👷 Creando operador: ${nombreOperador}`);
      
      // Crear operador
      operador = await Operador.create({
        nombre: nombre,
        apellido: apellido
      });
    }
    
    return operador.id;
  } catch (error) {
    console.error(`❌ Error al buscar/crear operador ${nombreOperador}:`, error.message);
    throw error;
  }
}

// Función para mostrar mapeos de identificadores estables
function mostrarMapeosIdentificadores(datosAgrupados) {
  console.log('\n🔍 MAPEOS DE IDENTIFICADORES ESTABLES:');
  console.log('=====================================');
  
  const mapeos = {
    supervisores: new Set(),
    zonas: new Set(),
    sectores: new Set(),
    maquinas: new Set(),
    operadores: new Set()
  };
  
  Object.values(datosAgrupados).forEach(datos => {
    mapeos.supervisores.add(datos.planilla.supervisor_nombre);
    mapeos.zonas.add(datos.planilla.zona_nombre);
    mapeos.sectores.add(`${datos.planilla.sector_nombre} (${datos.planilla.comuna_sector})`);
    
    datos.maquinas_planilla.forEach(mp => {
      mapeos.maquinas.add(mp.nro_maquina);
      mapeos.operadores.add(mp.nombre_operador);
    });
  });
  
  console.log(`👤 Supervisores (${mapeos.supervisores.size}):`);
  Array.from(mapeos.supervisores).sort().forEach(s => console.log(`  - ${s}`));
  
  console.log(`🏘️ Zonas (${mapeos.zonas.size}):`);
  Array.from(mapeos.zonas).sort().forEach(z => console.log(`  - ${z}`));
  
  console.log(`🏢 Sectores (${mapeos.sectores.size}):`);
  Array.from(mapeos.sectores).sort().forEach(s => console.log(`  - ${s}`));
  
  console.log(`🚛 Máquinas (${mapeos.maquinas.size}):`);
  Array.from(mapeos.maquinas).sort().forEach(m => console.log(`  - ${m}`));
  
  console.log(`👷 Operadores (${mapeos.operadores.size}):`);
  Array.from(mapeos.operadores).sort().forEach(o => console.log(`  - ${o}`));
  
  console.log('');
}

// Función para migrar datos
async function migrarDatos(datosAgrupados) {
  console.log('🚀 Iniciando migración de datos...');
  
  // Mostrar mapeos de identificadores estables
  mostrarMapeosIdentificadores(datosAgrupados);
  
  const resultados = {
    planillasCreadas: 0,
    maquinasPlanillaCreadas: 0,
    errores: [],
    resumen: {}
  };
  
  for (const [ordenServicio, datos] of Object.entries(datosAgrupados)) {
    try {
      console.log(`📋 Procesando orden de servicio: ${ordenServicio}`);
      
      // Buscar o crear referencias
      const supervisorId = await buscarOCrearSupervisor(datos.planilla.supervisor_nombre);
      const zonaId = await buscarOCrearZona(datos.planilla.zona_nombre);
      const sectorId = await buscarOCrearSector(
        datos.planilla.sector_nombre,
        datos.planilla.comuna_sector,
        zonaId,
        datos.planilla.pabellones_total,
        datos.planilla.mt2
      );
      
      // Crear planilla
      const planilla = await Planilla.create({
        supervisor_id: supervisorId,
        sector_id: sectorId,
        mt2: datos.planilla.mt2,
        pabellones_total: datos.planilla.pabellones_total,
        pabellones_limpiados: datos.planilla.pabellones_limpiados,
        fecha_inicio: datos.planilla.fecha_inicio,
        fecha_termino: datos.planilla.fecha_termino,
        ticket: datos.planilla.ticket,
        estado: datos.planilla.estado,
        observacion: datos.planilla.observacion
      });
      
      resultados.planillasCreadas++;
      
      // Crear registros de máquina_planilla
      for (const maquinaData of datos.maquinas_planilla) {
        const maquinaId = await buscarOCrearMaquina(maquinaData.id_maquina, maquinaData.nro_maquina);
        const operadorId = await buscarOCrearOperador(maquinaData.id_operador, maquinaData.nombre_operador);
        
        await MaquinaPlanilla.create({
          planilla_id: planilla.id,
          maquina_id: maquinaId,
          operador_id: operadorId,
          odometro_inicio: maquinaData.odometro_inicio,
          odometro_fin: maquinaData.odometro_fin,
          petroleo: maquinaData.petroleo
        });
        
        resultados.maquinasPlanillaCreadas++;
      }
      
      console.log(`✅ Orden ${ordenServicio} migrada exitosamente`);
      
    } catch (error) {
      console.error(`❌ Error al migrar orden ${ordenServicio}:`, error.message);
      resultados.errores.push({
        ordenServicio,
        error: error.message
      });
    }
  }
  
  return resultados;
}

// Función para generar reporte
function generarReporte(resultados, analisis) {
  const reporte = {
    fecha: new Date().toISOString(),
    resumen: {
      totalRegistrosOriginales: analisis.totalRegistros,
      ordenesServicioProcesadas: analisis.ordenesServicio.length,
      planillasCreadas: resultados.planillasCreadas,
      maquinasPlanillaCreadas: resultados.maquinasPlanillaCreadas,
      errores: resultados.errores.length
    },
    estadisticas: analisis,
    errores: resultados.errores
  };
  
  return reporte;
}

// Función principal
async function migrarVistaPabellonMaquina(anioInicio = 2024, anioFin = 2025) {
  let connection = null;
  
  try {
    console.log('🚀 Iniciando migración desde vista vw_PabellonMaquinaDanos...');
    
    // Conectar a base de datos externa
    connection = await conectarDBExterna();
    
    // Extraer datos de la vista
    const { datos, analisis } = await extraerDatosVista(connection, anioInicio, anioFin);
    
    // Agrupar datos por orden de servicio
    const datosAgrupados = agruparDatosPorOrden(datos);
    
    // Migrar datos
    const resultados = await migrarDatos(datosAgrupados);
    
    // Generar reporte
    const reporte = generarReporte(resultados, analisis);
    
    // Guardar reporte
    const nombreArchivo = `reporte_migracion_vista_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(nombreArchivo, JSON.stringify(reporte, null, 2));
    
    console.log('\n📊 REPORTE DE MIGRACIÓN:');
    console.log('========================');
    console.log(`📈 Total registros originales: ${reporte.resumen.totalRegistrosOriginales}`);
    console.log(`📋 Órdenes de servicio procesadas: ${reporte.resumen.ordenesServicioProcesadas}`);
    console.log(`✅ Planillas creadas: ${reporte.resumen.planillasCreadas}`);
    console.log(`🚛 Registros máquina_planilla creados: ${reporte.resumen.maquinasPlanillaCreadas}`);
    console.log(`❌ Errores: ${reporte.resumen.errores}`);
    console.log(`📄 Reporte guardado en: ${nombreArchivo}`);
    
    if (reporte.errores.length > 0) {
      console.log('\n⚠️ Errores encontrados:');
      reporte.errores.forEach(error => {
        console.log(`  - Orden ${error.ordenServicio}: ${error.error}`);
      });
    }
    
    return reporte;
    
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
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
  
  migrarVistaPabellonMaquina(parseInt(anioInicio), parseInt(anioFin))
    .then(() => {
      console.log('✅ Migración completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en la migración:', error.message);
      process.exit(1);
    });
}

module.exports = {
  migrarVistaPabellonMaquina,
  extraerDatosVista,
  agruparDatosPorOrden,
  migrarDatos
}; 