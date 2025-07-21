const mysql = require('mysql2/promise');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { 
  Usuario, Zona, Sector, Pabellon, Planilla, Barredor, Maquina, 
  Operador, MaquinaPlanilla, PabellonMaquina, Dano, BarredorCatalogo 
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

// Función para obtener la estructura de la base de datos externa
async function obtenerEstructuraDB(connection) {
  try {
    console.log('🔍 Analizando estructura de la base de datos externa...');
    
    // Obtener todas las tablas
    const [tablas] = await connection.execute('SHOW TABLES');
    console.log('📋 Tablas encontradas:', tablas.map(t => Object.values(t)[0]));
    
    const estructura = {};
    
    for (const tabla of tablas) {
      const nombreTabla = Object.values(tabla)[0];
      const [columnas] = await connection.execute(`DESCRIBE ${nombreTabla}`);
      estructura[nombreTabla] = columnas;
    }
    
    return estructura;
  } catch (error) {
    console.error('❌ Error al obtener estructura:', error.message);
    throw error;
  }
}

// Función para extraer datos de planillas del sistema externo
async function extraerPlanillasExternas(connection, anioInicio = 2024, anioFin = 2025) {
  try {
    console.log(`📊 Extrayendo planillas de ${anioInicio} a ${anioFin}...`);
    
    // Intentar diferentes nombres de tablas comunes para planillas
    const posiblesTablas = [
      'planillas', 'planilla', 'ordenes', 'orden', 'servicios', 'servicio',
      'trabajos', 'trabajo', 'actividades', 'actividad', 'registros', 'registro'
    ];
    
    let tablaPlanillas = null;
    let estructuraPlanillas = null;
    
    // Buscar la tabla de planillas
    for (const tabla of posiblesTablas) {
      try {
        const [resultado] = await connection.execute(`SELECT COUNT(*) as count FROM ${tabla}`);
        if (resultado[0].count > 0) {
          tablaPlanillas = tabla;
          const [columnas] = await connection.execute(`DESCRIBE ${tabla}`);
          estructuraPlanillas = columnas;
          console.log(`✅ Tabla de planillas encontrada: ${tabla}`);
          break;
        }
      } catch (error) {
        // Continuar con la siguiente tabla
        continue;
      }
    }
    
    if (!tablaPlanillas) {
      throw new Error('No se encontró tabla de planillas en el sistema externo');
    }
    
    // Mostrar estructura de la tabla
    console.log('📋 Estructura de la tabla de planillas:');
    estructuraPlanillas.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    // Extraer datos de planillas
    const query = `
      SELECT * FROM ${tablaPlanillas} 
      WHERE YEAR(fecha) >= ? AND YEAR(fecha) <= ?
      OR YEAR(fecha_inicio) >= ? AND YEAR(fecha_inicio) <= ?
      OR YEAR(fecha_creacion) >= ? AND YEAR(fecha_creacion) <= ?
      ORDER BY fecha DESC, fecha_inicio DESC, fecha_creacion DESC
    `;
    
    const [planillas] = await connection.execute(query, [
      anioInicio, anioFin, anioInicio, anioFin, anioInicio, anioFin
    ]);
    
    console.log(`📈 Se encontraron ${planillas.length} planillas`);
    
    return {
      tabla: tablaPlanillas,
      estructura: estructuraPlanillas,
      datos: planillas
    };
    
  } catch (error) {
    console.error('❌ Error al extraer planillas:', error.message);
    throw error;
  }
}

// Función para mapear datos del sistema externo al sistema actual
function mapearDatosPlanillas(datosExternos, estructura) {
  console.log('🔄 Mapeando datos del sistema externo...');
  
  const planillasMapeadas = [];
  const referencias = {
    supervisores: new Set(),
    sectores: new Set(),
    pabellones: new Set(),
    maquinas: new Set(),
    operadores: new Set()
  };
  
  datosExternos.forEach((planilla, index) => {
    // Mapeo básico de planilla
    const planillaMapeada = {
      // Campos básicos
      supervisor_id: null, // Se completará después
      sector_id: null, // Se completará después
      mt2: planilla.metros_cuadrados || planilla.mt2 || planilla.area || 0,
      pabellones_total: planilla.pabellones_total || planilla.num_pabellones || 0,
      pabellones_limpiados: planilla.pabellones_limpiados || 0,
      fecha_inicio: planilla.fecha_inicio || planilla.fecha || planilla.fecha_creacion || new Date(),
      fecha_termino: planilla.fecha_termino || planilla.fecha_fin || null,
      ticket: planilla.numero || planilla.ticket || planilla.id || `MIG-${Date.now()}-${index}`,
      estado: mapearEstado(planilla.estado || planilla.status || 'PENDIENTE'),
      observacion: planilla.observacion || planilla.comentario || planilla.descripcion || '',
      observacion_validacion: planilla.observacion_validacion || '',
      validado_por: null,
      fecha_validacion: planilla.fecha_validacion || null,
      
      // Datos originales para referencia
      datos_originales: {
        id_original: planilla.id,
        tabla_original: 'planillas_externas',
        campos_originales: planilla
      }
    };
    
    // Extraer referencias
    if (planilla.supervisor) referencias.supervisores.add(planilla.supervisor);
    if (planilla.sector) referencias.sectores.add(planilla.sector);
    if (planilla.zona) referencias.sectores.add(`${planilla.zona} - ${planilla.sector || ''}`);
    
    planillasMapeadas.push(planillaMapeada);
  });
  
  return {
    planillas: planillasMapeadas,
    referencias: Object.fromEntries(
      Object.entries(referencias).map(([key, value]) => [key, Array.from(value)])
    )
  };
}

// Función para mapear estados
function mapearEstado(estadoOriginal) {
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
    'CANCELADA': 'CANCELADA',
    'CANCELLED': 'CANCELADA',
    'ANULADA': 'CANCELADA'
  };
  
  return mapeoEstados[estado] || 'PENDIENTE';
}

// Función para crear archivos Excel de migración
function crearArchivosMigracion(datosMapeados, estructuraOriginal) {
  console.log('📄 Creando archivos Excel para migración...');
  
  const workbook = XLSX.utils.book_new();
  
  // Hoja de Planillas
  const wsPlanillas = XLSX.utils.json_to_sheet(datosMapeados.planillas);
  XLSX.utils.book_append_sheet(workbook, wsPlanillas, 'Planillas');
  
  // Hoja de Referencias
  const referenciasArray = Object.entries(datosMapeados.referencias).map(([tipo, items]) => ({
    tipo,
    items: items.join(', '),
    cantidad: items.length
  }));
  const wsReferencias = XLSX.utils.json_to_sheet(referenciasArray);
  XLSX.utils.book_append_sheet(workbook, wsReferencias, 'Referencias');
  
  // Hoja de Estructura Original
  const estructuraArray = estructuraOriginal.map(col => ({
    campo: col.Field,
    tipo: col.Type,
    nulo: col.Null,
    clave: col.Key,
    default: col.Default,
    extra: col.Extra
  }));
  const wsEstructura = XLSX.utils.json_to_sheet(estructuraArray);
  XLSX.utils.book_append_sheet(workbook, wsEstructura, 'Estructura_Original');
  
  // Guardar archivo
  const nombreArchivo = `migracion_planillas_${new Date().toISOString().split('T')[0]}.xlsx`;
  const rutaArchivo = path.join(__dirname, nombreArchivo);
  
  XLSX.writeFile(workbook, rutaArchivo);
  console.log(`✅ Archivo Excel creado: ${rutaArchivo}`);
  
  return rutaArchivo;
}

// Función para crear script de mapeo manual
function crearScriptMapeoManual(datosMapeados, estructuraOriginal) {
  console.log('📝 Creando script de mapeo manual...');
  
  const script = `
// Script de mapeo manual para migración de planillas
// Generado automáticamente el ${new Date().toISOString()}

const mapeoManual = {
  // Mapeo de supervisores
  supervisores: {
${datosMapeados.referencias.supervisores.map(s => `    "${s}": null, // ID del supervisor en el sistema actual`).join('\n')}
  },
  
  // Mapeo de sectores
  sectores: {
${datosMapeados.referencias.sectores.map(s => `    "${s}": null, // ID del sector en el sistema actual`).join('\n')}
  },
  
  // Mapeo de estados
  estados: {
    "PENDIENTE": "PENDIENTE",
    "ACTIVA": "ACTIVA", 
    "COMPLETADA": "COMPLETADA",
    "CANCELADA": "CANCELADA"
  }
};

// Función para aplicar mapeo manual
function aplicarMapeoManual(planillas) {
  return planillas.map(planilla => {
    // Aplicar mapeo de supervisor
    if (planilla.datos_originales.campos_originales.supervisor) {
      const supervisorOriginal = planilla.datos_originales.campos_originales.supervisor;
      planilla.supervisor_id = mapeoManual.supervisores[supervisorOriginal];
    }
    
    // Aplicar mapeo de sector
    if (planilla.datos_originales.campos_originales.sector) {
      const sectorOriginal = planilla.datos_originales.campos_originales.sector;
      planilla.sector_id = mapeoManual.sectores[sectorOriginal];
    }
    
    return planilla;
  });
}

module.exports = { mapeoManual, aplicarMapeoManual };
`;
  
  const nombreArchivo = `mapeo_manual_${new Date().toISOString().split('T')[0]}.js`;
  const rutaArchivo = path.join(__dirname, nombreArchivo);
  
  fs.writeFileSync(rutaArchivo, script);
  console.log(`✅ Script de mapeo creado: ${rutaArchivo}`);
  
  return rutaArchivo;
}

// Función para crear reporte de migración
function crearReporteMigracion(datosMapeados, estructuraOriginal, archivoExcel, archivoMapeo) {
  console.log('📊 Creando reporte de migración...');
  
  const reporte = `
# REPORTE DE MIGRACIÓN DE PLANILLAS
Fecha: ${new Date().toISOString()}

## RESUMEN
- Total de planillas extraídas: ${datosMapeados.planillas.length}
- Supervisores únicos encontrados: ${datosMapeados.referencias.supervisores.length}
- Sectores únicos encontrados: ${datosMapeados.referencias.sectores.length}

## ARCHIVOS GENERADOS
1. **${path.basename(archivoExcel)}** - Datos mapeados para importación
2. **${path.basename(archivoMapeo)}** - Script de mapeo manual

## ESTRUCTURA ORIGINAL
La tabla original tenía ${estructuraOriginal.length} campos:
${estructuraOriginal.map(col => `- ${col.Field}: ${col.Type}`).join('\n')}

## REFERENCIAS ENCONTRADAS

### Supervisores (${datosMapeados.referencias.supervisores.length})
${datosMapeados.referencias.supervisores.map(s => `- ${s}`).join('\n')}

### Sectores (${datosMapeados.referencias.sectores.length})
${datosMapeados.referencias.sectores.map(s => `- ${s}`).join('\n')}

## PRÓXIMOS PASOS
1. Revisar el archivo Excel generado
2. Completar el script de mapeo manual con los IDs correctos
3. Ejecutar la migración final
4. Verificar la integridad de los datos

## NOTAS IMPORTANTES
- Los IDs de supervisor_id y sector_id están en NULL y deben completarse manualmente
- Revisar los estados mapeados para asegurar que sean correctos
- Verificar que las fechas estén en el formato correcto
- Hacer backup de la base de datos antes de la migración final
`;
  
  const nombreArchivo = `reporte_migracion_${new Date().toISOString().split('T')[0]}.md`;
  const rutaArchivo = path.join(__dirname, nombreArchivo);
  
  fs.writeFileSync(rutaArchivo, reporte);
  console.log(`✅ Reporte creado: ${rutaArchivo}`);
  
  return rutaArchivo;
}

// Función principal
async function migrarPlanillasSistemaExterno(anioInicio = 2024, anioFin = 2025) {
  let connection = null;
  
  try {
    console.log('🚀 Iniciando migración de planillas desde sistema externo...');
    console.log(`📅 Período: ${anioInicio} - ${anioFin}`);
    
    // Conectar a la base de datos externa
    connection = await conectarDBExterna();
    
    // Obtener estructura de la base de datos externa
    const estructura = await obtenerEstructuraDB(connection);
    
    // Extraer planillas del sistema externo
    const datosExternos = await extraerPlanillasExternas(connection, anioInicio, anioFin);
    
    // Mapear datos al formato del sistema actual
    const datosMapeados = mapearDatosPlanillas(datosExternos.datos, datosExternos.estructura);
    
    // Crear archivos de migración
    const archivoExcel = crearArchivosMigracion(datosMapeados, datosExternos.estructura);
    const archivoMapeo = crearScriptMapeoManual(datosMapeados, datosExternos.estructura);
    const archivoReporte = crearReporteMigracion(datosMapeados, datosExternos.estructura, archivoExcel, archivoMapeo);
    
    console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('=====================================');
    console.log(`📊 Planillas extraídas: ${datosMapeados.planillas.length}`);
    console.log(`👥 Supervisores únicos: ${datosMapeados.referencias.supervisores.length}`);
    console.log(`🏢 Sectores únicos: ${datosMapeados.referencias.sectores.length}`);
    console.log('\n📁 Archivos generados:');
    console.log(`   - ${archivoExcel}`);
    console.log(`   - ${archivoMapeo}`);
    console.log(`   - ${archivoReporte}`);
    
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Revisar el archivo Excel generado');
    console.log('2. Completar el script de mapeo manual con los IDs correctos');
    console.log('3. Ejecutar la migración final usando el endpoint de carga masiva');
    console.log('4. Verificar la integridad de los datos migrados');
    
    return {
      planillas: datosMapeados.planillas,
      referencias: datosMapeados.referencias,
      archivos: {
        excel: archivoExcel,
        mapeo: archivoMapeo,
        reporte: archivoReporte
      }
    };
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión a base de datos externa cerrada');
    }
  }
}

// Función para ejecutar desde línea de comandos
async function main() {
  const args = process.argv.slice(2);
  const anioInicio = parseInt(args[0]) || 2024;
  const anioFin = parseInt(args[1]) || 2025;
  
  console.log('🔧 Configuración de migración:');
  console.log(`   Base de datos externa: ${configDBExterna.host}:${configDBExterna.port}/${configDBExterna.database}`);
  console.log(`   Usuario: ${configDBExterna.user}`);
  console.log(`   Período: ${anioInicio} - ${anioFin}`);
  console.log('');
  
  try {
    await migrarPlanillasSistemaExterno(anioInicio, anioFin);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  migrarPlanillasSistemaExterno,
  conectarDBExterna,
  extraerPlanillasExternas,
  mapearDatosPlanillas
}; 