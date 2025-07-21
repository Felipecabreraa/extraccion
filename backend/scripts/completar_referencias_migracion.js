const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { 
  Usuario, Zona, Sector, Pabellon, Planilla, Barredor, Maquina, 
  Operador, MaquinaPlanilla, PabellonMaquina, Dano, BarredorCatalogo 
} = require('../src/models');

// Función para buscar supervisor por nombre
async function buscarSupervisor(nombre) {
  try {
    const supervisor = await Usuario.findOne({
      where: {
        nombre: {
          [require('sequelize').Op.like]: `%${nombre}%`
        },
        rol: 'SUPERVISOR'
      }
    });
    return supervisor ? supervisor.id : null;
  } catch (error) {
    console.error(`Error buscando supervisor ${nombre}:`, error.message);
    return null;
  }
}

// Función para buscar sector por nombre
async function buscarSector(nombre) {
  try {
    const sector = await Sector.findOne({
      where: {
        nombre: {
          [require('sequelize').Op.like]: `%${nombre}%`
        }
      }
    });
    return sector ? sector.id : null;
  } catch (error) {
    console.error(`Error buscando sector ${nombre}:`, error.message);
    return null;
  }
}

// Función para buscar zona por nombre
async function buscarZona(nombre) {
  try {
    const zona = await Zona.findOne({
      where: {
        nombre: {
          [require('sequelize').Op.like]: `%${nombre}%`
        }
      }
    });
    return zona ? zona.id : null;
  } catch (error) {
    console.error(`Error buscando zona ${nombre}:`, error.message);
    return null;
  }
}

// Función para crear sector si no existe
async function crearSectorSiNoExiste(nombre, zonaId = null) {
  try {
    // Buscar si ya existe
    let sector = await Sector.findOne({
      where: {
        nombre: {
          [require('sequelize').Op.like]: `%${nombre}%`
        }
      }
    });
    
    if (!sector) {
      // Crear nuevo sector
      sector = await Sector.create({
        nombre: nombre,
        zona_id: zonaId,
        comuna: null,
        cantidad_pabellones: 0,
        mt2: 0
      });
      console.log(`✅ Sector creado: ${nombre} (ID: ${sector.id})`);
    }
    
    return sector.id;
  } catch (error) {
    console.error(`Error creando sector ${nombre}:`, error.message);
    return null;
  }
}

// Función para crear supervisor si no existe
async function crearSupervisorSiNoExiste(nombre, email = null) {
  try {
    // Buscar si ya existe
    let supervisor = await Usuario.findOne({
      where: {
        nombre: {
          [require('sequelize').Op.like]: `%${nombre}%`
        },
        rol: 'SUPERVISOR'
      }
    });
    
    if (!supervisor) {
      // Crear nuevo supervisor
      supervisor = await Usuario.create({
        nombre: nombre,
        email: email || `${nombre.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
        password: 'password123', // Cambiar por contraseña segura
        rol: 'SUPERVISOR',
        activo: true
      });
      console.log(`✅ Supervisor creado: ${nombre} (ID: ${supervisor.id})`);
    }
    
    return supervisor.id;
  } catch (error) {
    console.error(`Error creando supervisor ${nombre}:`, error.message);
    return null;
  }
}

// Función para leer archivo Excel de migración
function leerArchivoMigracion(rutaArchivo) {
  try {
    console.log(`📖 Leyendo archivo: ${rutaArchivo}`);
    const workbook = XLSX.readFile(rutaArchivo);
    
    // Leer hoja de planillas
    const wsPlanillas = workbook.Sheets['Planillas'];
    if (!wsPlanillas) {
      throw new Error('No se encontró la hoja "Planillas" en el archivo');
    }
    
    const planillas = XLSX.utils.sheet_to_json(wsPlanillas);
    console.log(`📊 Se leyeron ${planillas.length} planillas`);
    
    return planillas;
  } catch (error) {
    console.error('❌ Error leyendo archivo:', error.message);
    throw error;
  }
}

// Función para completar referencias automáticamente
async function completarReferencias(planillas, opciones = {}) {
  console.log('🔄 Completando referencias automáticamente...');
  
  const resultados = {
    planillasCompletadas: [],
    referenciasEncontradas: {
      supervisores: 0,
      sectores: 0,
      zonas: 0
    },
    referenciasCreadas: {
      supervisores: 0,
      sectores: 0
    },
    errores: []
  };
  
  for (let i = 0; i < planillas.length; i++) {
    const planilla = planillas[i];
    console.log(`\n📋 Procesando planilla ${i + 1}/${planillas.length}: ${planilla.ticket}`);
    
    try {
      // Completar supervisor_id
      if (!planilla.supervisor_id && planilla.datos_originales?.campos_originales?.supervisor) {
        const supervisorOriginal = planilla.datos_originales.campos_originales.supervisor;
        
        // Buscar supervisor existente
        let supervisorId = await buscarSupervisor(supervisorOriginal);
        
        // Si no existe y se permite crear, crear nuevo supervisor
        if (!supervisorId && opciones.crearSupervisores) {
          supervisorId = await crearSupervisorSiNoExiste(supervisorOriginal);
          if (supervisorId) {
            resultados.referenciasCreadas.supervisores++;
          }
        }
        
        if (supervisorId) {
          planilla.supervisor_id = supervisorId;
          resultados.referenciasEncontradas.supervisores++;
          console.log(`  ✅ Supervisor asignado: ${supervisorOriginal} (ID: ${supervisorId})`);
        } else {
          console.log(`  ⚠️  Supervisor no encontrado: ${supervisorOriginal}`);
          resultados.errores.push(`Supervisor no encontrado: ${supervisorOriginal}`);
        }
      }
      
      // Completar sector_id
      if (!planilla.sector_id && planilla.datos_originales?.campos_originales?.sector) {
        const sectorOriginal = planilla.datos_originales.campos_originales.sector;
        
        // Buscar sector existente
        let sectorId = await buscarSector(sectorOriginal);
        
        // Si no existe y se permite crear, crear nuevo sector
        if (!sectorId && opciones.crearSectores) {
          sectorId = await crearSectorSiNoExiste(sectorOriginal);
          if (sectorId) {
            resultados.referenciasCreadas.sectores++;
          }
        }
        
        if (sectorId) {
          planilla.sector_id = sectorId;
          resultados.referenciasEncontradas.sectores++;
          console.log(`  ✅ Sector asignado: ${sectorOriginal} (ID: ${sectorId})`);
        } else {
          console.log(`  ⚠️  Sector no encontrado: ${sectorOriginal}`);
          resultados.errores.push(`Sector no encontrado: ${sectorOriginal}`);
        }
      }
      
      // Procesar zona si existe
      if (planilla.datos_originales?.campos_originales?.zona) {
        const zonaOriginal = planilla.datos_originales.campos_originales.zona;
        const zonaId = await buscarZona(zonaOriginal);
        if (zonaId) {
          resultados.referenciasEncontradas.zonas++;
          console.log(`  ✅ Zona encontrada: ${zonaOriginal} (ID: ${zonaId})`);
        }
      }
      
      resultados.planillasCompletadas.push(planilla);
      
    } catch (error) {
      console.error(`  ❌ Error procesando planilla ${planilla.ticket}:`, error.message);
      resultados.errores.push(`Error en planilla ${planilla.ticket}: ${error.message}`);
    }
  }
  
  return resultados;
}

// Función para crear archivo Excel con referencias completadas
function crearArchivoCompletado(planillasCompletadas, resultados) {
  console.log('📄 Creando archivo Excel con referencias completadas...');
  
  const workbook = XLSX.utils.book_new();
  
  // Hoja de Planillas Completadas
  const wsPlanillas = XLSX.utils.json_to_sheet(planillasCompletadas);
  XLSX.utils.book_append_sheet(workbook, wsPlanillas, 'Planillas_Completadas');
  
  // Hoja de Resumen
  const resumen = [
    { campo: 'Total Planillas', valor: planillasCompletadas.length },
    { campo: 'Supervisores Encontrados', valor: resultados.referenciasEncontradas.supervisores },
    { campo: 'Sectores Encontrados', valor: resultados.referenciasEncontradas.sectores },
    { campo: 'Zonas Encontradas', valor: resultados.referenciasEncontradas.zonas },
    { campo: 'Supervisores Creados', valor: resultados.referenciasCreadas.supervisores },
    { campo: 'Sectores Creados', valor: resultados.referenciasCreadas.sectores },
    { campo: 'Errores', valor: resultados.errores.length }
  ];
  const wsResumen = XLSX.utils.json_to_sheet(resumen);
  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
  
  // Hoja de Errores
  if (resultados.errores.length > 0) {
    const erroresArray = resultados.errores.map(error => ({ error }));
    const wsErrores = XLSX.utils.json_to_sheet(erroresArray);
    XLSX.utils.book_append_sheet(workbook, wsErrores, 'Errores');
  }
  
  // Guardar archivo
  const nombreArchivo = `migracion_completada_${new Date().toISOString().split('T')[0]}.xlsx`;
  const rutaArchivo = path.join(__dirname, nombreArchivo);
  
  XLSX.writeFile(workbook, rutaArchivo);
  console.log(`✅ Archivo Excel creado: ${rutaArchivo}`);
  
  return rutaArchivo;
}

// Función para crear reporte de completado
function crearReporteCompletado(resultados, archivoCompletado) {
  console.log('📊 Creando reporte de completado...');
  
  const reporte = `
# REPORTE DE COMPLETADO DE REFERENCIAS
Fecha: ${new Date().toISOString()}

## RESUMEN
- Total de planillas procesadas: ${resultados.planillasCompletadas.length}
- Supervisores encontrados: ${resultados.referenciasEncontradas.supervisores}
- Sectores encontrados: ${resultados.referenciasEncontradas.sectores}
- Zonas encontradas: ${resultados.referenciasEncontradas.zonas}
- Supervisores creados: ${resultados.referenciasCreadas.supervisores}
- Sectores creados: ${resultados.referenciasCreadas.sectores}
- Errores: ${resultados.errores.length}

## ARCHIVO GENERADO
- **${path.basename(archivoCompletado)}** - Planillas con referencias completadas

## REFERENCIAS ENCONTRADAS
- Supervisores: ${resultados.referenciasEncontradas.supervisores}
- Sectores: ${resultados.referenciasEncontradas.sectores}
- Zonas: ${resultados.referenciasEncontradas.zonas}

## REFERENCIAS CREADAS
- Supervisores: ${resultados.referenciasCreadas.supervisores}
- Sectores: ${resultados.referenciasCreadas.sectores}

## ERRORES (${resultados.errores.length})
${resultados.errores.map(error => `- ${error}`).join('\n')}

## PRÓXIMOS PASOS
1. Revisar el archivo Excel generado
2. Verificar que todas las referencias estén correctas
3. Ejecutar la migración final usando el endpoint de carga masiva
4. Verificar la integridad de los datos migrados

## NOTAS IMPORTANTES
- Los supervisores creados tienen contraseña por defecto: 'password123'
- Los sectores creados tienen valores por defecto para comuna, cantidad_pabellones y mt2
- Revisar los errores antes de proceder con la migración final
- Hacer backup de la base de datos antes de la migración final
`;
  
  const nombreArchivo = `reporte_completado_${new Date().toISOString().split('T')[0]}.md`;
  const rutaArchivo = path.join(__dirname, nombreArchivo);
  
  fs.writeFileSync(rutaArchivo, reporte);
  console.log(`✅ Reporte creado: ${rutaArchivo}`);
  
  return rutaArchivo;
}

// Función principal
async function completarReferenciasMigracion(rutaArchivo, opciones = {}) {
  try {
    console.log('🚀 Iniciando completado de referencias...');
    console.log(`📁 Archivo: ${rutaArchivo}`);
    console.log(`🔧 Opciones:`, opciones);
    
    // Leer archivo de migración
    const planillas = leerArchivoMigracion(rutaArchivo);
    
    // Completar referencias
    const resultados = await completarReferencias(planillas, opciones);
    
    // Crear archivo Excel con referencias completadas
    const archivoCompletado = crearArchivoCompletado(resultados.planillasCompletadas, resultados);
    
    // Crear reporte
    const archivoReporte = crearReporteCompletado(resultados, archivoCompletado);
    
    console.log('\n🎉 COMPLETADO DE REFERENCIAS FINALIZADO');
    console.log('========================================');
    console.log(`📊 Planillas procesadas: ${resultados.planillasCompletadas.length}`);
    console.log(`✅ Referencias encontradas: ${resultados.referenciasEncontradas.supervisores + resultados.referenciasEncontradas.sectores}`);
    console.log(`🆕 Referencias creadas: ${resultados.referenciasCreadas.supervisores + resultados.referenciasCreadas.sectores}`);
    console.log(`❌ Errores: ${resultados.errores.length}`);
    console.log('\n📁 Archivos generados:');
    console.log(`   - ${archivoCompletado}`);
    console.log(`   - ${archivoReporte}`);
    
    if (resultados.errores.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS:');
      console.log('Hay errores que deben revisarse antes de proceder con la migración final.');
    }
    
    return {
      planillas: resultados.planillasCompletadas,
      resultados: resultados,
      archivos: {
        excel: archivoCompletado,
        reporte: archivoReporte
      }
    };
    
  } catch (error) {
    console.error('❌ Error durante el completado:', error.message);
    throw error;
  }
}

// Función para ejecutar desde línea de comandos
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Uso: node completar_referencias_migracion.js <archivo_migracion.xlsx> [opciones]');
    console.log('');
    console.log('Opciones:');
    console.log('  --crear-supervisores    Crear supervisores si no existen');
    console.log('  --crear-sectores        Crear sectores si no existen');
    console.log('');
    console.log('Ejemplo:');
    console.log('  node completar_referencias_migracion.js migracion_planillas_2024-01-01.xlsx --crear-supervisores --crear-sectores');
    process.exit(1);
  }
  
  const rutaArchivo = args[0];
  const opciones = {
    crearSupervisores: args.includes('--crear-supervisores'),
    crearSectores: args.includes('--crear-sectores')
  };
  
  console.log('🔧 Configuración:');
  console.log(`   Archivo: ${rutaArchivo}`);
  console.log(`   Crear supervisores: ${opciones.crearSupervisores}`);
  console.log(`   Crear sectores: ${opciones.crearSectores}`);
  console.log('');
  
  try {
    await completarReferenciasMigracion(rutaArchivo, opciones);
  } catch (error) {
    console.error('❌ Error en el completado:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  completarReferenciasMigracion,
  buscarSupervisor,
  buscarSector,
  crearSupervisorSiNoExiste,
  crearSectorSiNoExiste
}; 