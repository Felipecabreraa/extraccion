const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { 
  Usuario, Zona, Sector, Pabellon, Planilla, Barredor, Maquina, 
  Operador, MaquinaPlanilla, PabellonMaquina, Dano, BarredorCatalogo 
} = require('../src/models');

// Función para leer archivo Excel
function leerArchivoExcel(rutaArchivo) {
  try {
    const workbook = XLSX.readFile(rutaArchivo);
    const hojas = {};
    
    workbook.SheetNames.forEach(nombreHoja => {
      const worksheet = workbook.Sheets[nombreHoja];
      hojas[nombreHoja] = XLSX.utils.sheet_to_json(worksheet);
    });
    
    return hojas;
  } catch (error) {
    console.error('Error al leer el archivo Excel:', error.message);
    return null;
  }
}

// Función para buscar supervisor por nombre
async function buscarSupervisor(nombre) {
  if (!nombre) return null;
  
  try {
    const supervisor = await Usuario.findOne({
      where: {
        nombre: { [require('sequelize').Op.like]: `%${nombre}%` },
        rol: 'SUPERVISOR'
      }
    });
    return supervisor ? supervisor.id : null;
  } catch (error) {
    console.error('Error buscando supervisor:', error.message);
    return null;
  }
}

// Función para buscar sector por nombre
async function buscarSector(nombre) {
  if (!nombre) return null;
  
  try {
    const sector = await Sector.findOne({
      where: {
        nombre: { [require('sequelize').Op.like]: `%${nombre}%` }
      }
    });
    return sector ? sector.id : null;
  } catch (error) {
    console.error('Error buscando sector:', error.message);
    return null;
  }
}

// Función para buscar pabellón por nombre
async function buscarPabellon(nombre) {
  if (!nombre) return null;
  
  try {
    const pabellon = await Pabellon.findOne({
      where: {
        nombre: { [require('sequelize').Op.like]: `%${nombre}%` }
      }
    });
    return pabellon ? pabellon.id : null;
  } catch (error) {
    console.error('Error buscando pabellón:', error.message);
    return null;
  }
}

// Función para buscar máquina por número o patente
async function buscarMaquina(numero, patente) {
  if (!numero && !patente) return null;
  
  try {
    const whereClause = {};
    if (numero) whereClause.numero = numero;
    if (patente) whereClause.patente = patente;
    
    const maquina = await Maquina.findOne({ where: whereClause });
    return maquina ? maquina.id : null;
  } catch (error) {
    console.error('Error buscando máquina:', error.message);
    return null;
  }
}

// Función para buscar operador por nombre
async function buscarOperador(nombre) {
  if (!nombre) return null;
  
  try {
    const operador = await Operador.findOne({
      where: {
        nombre: { [require('sequelize').Op.like]: `%${nombre}%` }
      }
    });
    return operador ? operador.id : null;
  } catch (error) {
    console.error('Error buscando operador:', error.message);
    return null;
  }
}

// Función para completar referencias en planillas
async function completarReferenciasPlanillas(planillas, mapeoReferencias) {
  const planillasCompletadas = [];
  
  for (const planilla of planillas) {
    const planillaCompletada = { ...planilla };
    
    // Buscar supervisor si no está asignado
    if (!planillaCompletada.supervisor_id && mapeoReferencias.supervisor) {
      planillaCompletada.supervisor_id = await buscarSupervisor(mapeoReferencias.supervisor);
    }
    
    // Buscar sector si no está asignado
    if (!planillaCompletada.sector_id && mapeoReferencias.sector) {
      planillaCompletada.sector_id = await buscarSector(mapeoReferencias.sector);
    }
    
    planillasCompletadas.push(planillaCompletada);
  }
  
  return planillasCompletadas;
}

// Función para completar referencias en daños
async function completarReferenciasDanos(danos, mapeoReferencias) {
  const danosCompletados = [];
  
  for (const dano of danos) {
    const danoCompletado = { ...dano };
    
    // Buscar pabellón si no está asignado
    if (!danoCompletado.pabellon_id && mapeoReferencias.pabellon) {
      danoCompletado.pabellon_id = await buscarPabellon(mapeoReferencias.pabellon);
    }
    
    // Buscar máquina si no está asignada
    if (!danoCompletado.maquina_id && mapeoReferencias.maquina) {
      danoCompletado.maquina_id = await buscarMaquina(
        mapeoReferencias.maquina.numero, 
        mapeoReferencias.maquina.patente
      );
    }
    
    danosCompletados.push(danoCompletado);
  }
  
  return danosCompletados;
}

// Función para completar referencias en máquinas planilla
async function completarReferenciasMaquinasPlanilla(maquinasPlanilla, mapeoReferencias) {
  const maquinasPlanillaCompletadas = [];
  
  for (const maquinaPlanilla of maquinasPlanilla) {
    const maquinaPlanillaCompletada = { ...maquinaPlanilla };
    
    // Buscar máquina si no está asignada
    if (!maquinaPlanillaCompletada.maquina_id && mapeoReferencias.maquina) {
      maquinaPlanillaCompletada.maquina_id = await buscarMaquina(
        mapeoReferencias.maquina.numero, 
        mapeoReferencias.maquina.patente
      );
    }
    
    // Buscar operador si no está asignado
    if (!maquinaPlanillaCompletada.operador_id && mapeoReferencias.operador) {
      maquinaPlanillaCompletada.operador_id = await buscarOperador(mapeoReferencias.operador);
    }
    
    maquinasPlanillaCompletadas.push(maquinaPlanillaCompletada);
  }
  
  return maquinasPlanillaCompletadas;
}

// Función para completar referencias en pabellones máquina
async function completarReferenciasPabellonesMaquina(pabellonesMaquina, mapeoReferencias) {
  const pabellonesMaquinaCompletados = [];
  
  for (const pabellonMaquina of pabellonesMaquina) {
    const pabellonMaquinaCompletado = { ...pabellonMaquina };
    
    // Buscar pabellón si no está asignado
    if (!pabellonMaquinaCompletado.pabellon_id && mapeoReferencias.pabellon) {
      pabellonMaquinaCompletado.pabellon_id = await buscarPabellon(mapeoReferencias.pabellon);
    }
    
    // Buscar máquina si no está asignada
    if (!pabellonMaquinaCompletado.maquina_id && mapeoReferencias.maquina) {
      pabellonMaquinaCompletado.maquina_id = await buscarMaquina(
        mapeoReferencias.maquina.numero, 
        mapeoReferencias.maquina.patente
      );
    }
    
    pabellonesMaquinaCompletados.push(pabellonMaquinaCompletado);
  }
  
  return pabellonesMaquinaCompletados;
}

// Función para crear archivo Excel con referencias completadas
function crearArchivoCompletado(datosCompletados) {
  const workbook = XLSX.utils.book_new();
  
  // Hoja de Planillas
  if (datosCompletados.planillas && datosCompletados.planillas.length > 0) {
    const wsPlanillas = XLSX.utils.json_to_sheet(datosCompletados.planillas);
    XLSX.utils.book_append_sheet(workbook, wsPlanillas, 'Planillas');
  }
  
  // Hoja de Daños
  if (datosCompletados.danos && datosCompletados.danos.length > 0) {
    const wsDanos = XLSX.utils.json_to_sheet(datosCompletados.danos);
    XLSX.utils.book_append_sheet(workbook, wsDanos, 'Danos');
  }
  
  // Hoja de Máquinas Planilla
  if (datosCompletados.maquinasPlanilla && datosCompletados.maquinasPlanilla.length > 0) {
    const wsMaquinasPlanilla = XLSX.utils.json_to_sheet(datosCompletados.maquinasPlanilla);
    XLSX.utils.book_append_sheet(workbook, wsMaquinasPlanilla, 'MaquinasPlanilla');
  }
  
  // Hoja de Pabellones Máquina
  if (datosCompletados.pabellonesMaquina && datosCompletados.pabellonesMaquina.length > 0) {
    const wsPabellonesMaquina = XLSX.utils.json_to_sheet(datosCompletados.pabellonesMaquina);
    XLSX.utils.book_append_sheet(workbook, wsPabellonesMaquina, 'PabellonesMaquina');
  }
  
  // Guardar archivo
  const nombreArchivo = `ordenes_servicio_completadas_${new Date().toISOString().split('T')[0]}.xlsx`;
  const rutaArchivo = path.join(__dirname, nombreArchivo);
  
  XLSX.writeFile(workbook, rutaArchivo);
  console.log(`Archivo Excel completado creado: ${rutaArchivo}`);
  
  return rutaArchivo;
}

// Función principal
async function completarReferencias(rutaArchivoExcel, mapeoReferencias) {
  try {
    console.log('Iniciando completado de referencias...');
    
    // Leer archivo Excel
    const hojas = leerArchivoExcel(rutaArchivoExcel);
    if (!hojas) {
      console.error('No se pudo leer el archivo Excel');
      return;
    }
    
    const datosCompletados = {};
    
    // Completar referencias en cada hoja
    if (hojas.Planillas) {
      console.log('Completando referencias en Planillas...');
      datosCompletados.planillas = await completarReferenciasPlanillas(hojas.Planillas, mapeoReferencias);
    }
    
    if (hojas.Danos) {
      console.log('Completando referencias en Daños...');
      datosCompletados.danos = await completarReferenciasDanos(hojas.Danos, mapeoReferencias);
    }
    
    if (hojas.MaquinasPlanilla) {
      console.log('Completando referencias en Máquinas Planilla...');
      datosCompletados.maquinasPlanilla = await completarReferenciasMaquinasPlanilla(hojas.MaquinasPlanilla, mapeoReferencias);
    }
    
    if (hojas.PabellonesMaquina) {
      console.log('Completando referencias en Pabellones Máquina...');
      datosCompletados.pabellonesMaquina = await completarReferenciasPabellonesMaquina(hojas.PabellonesMaquina, mapeoReferencias);
    }
    
    // Crear archivo completado
    const archivoCompletado = crearArchivoCompletado(datosCompletados);
    
    console.log('\n=== RESUMEN DE COMPLETADO ===');
    console.log(`Planillas procesadas: ${datosCompletados.planillas?.length || 0}`);
    console.log(`Daños procesados: ${datosCompletados.danos?.length || 0}`);
    console.log(`Máquinas Planilla procesadas: ${datosCompletados.maquinasPlanilla?.length || 0}`);
    console.log(`Pabellones Máquina procesados: ${datosCompletados.pabellonesMaquina?.length || 0}`);
    console.log(`\nArchivo completado: ${archivoCompletado}`);
    
  } catch (error) {
    console.error('Error durante el completado de referencias:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const rutaArchivo = process.argv[2];
  
  if (!rutaArchivo) {
    console.log('Uso: node completar_referencias.js <ruta_archivo_excel>');
    console.log('Ejemplo: node completar_referencias.js "ordenes_servicio_convertidas_2024-01-01.xlsx"');
    process.exit(1);
  }
  
  // Mapeo de referencias (se puede personalizar según los datos)
  const mapeoReferencias = {
    supervisor: 'Nombre del Supervisor', // Reemplazar con el nombre real
    sector: 'Nombre del Sector', // Reemplazar con el nombre real
    pabellon: 'Nombre del Pabellón', // Reemplazar con el nombre real
    maquina: {
      numero: 'Número de Máquina', // Reemplazar con el número real
      patente: 'Patente de Máquina' // Reemplazar con la patente real
    },
    operador: 'Nombre del Operador' // Reemplazar con el nombre real
  };
  
  completarReferencias(rutaArchivo, mapeoReferencias);
}

module.exports = {
  completarReferencias,
  buscarSupervisor,
  buscarSector,
  buscarPabellon,
  buscarMaquina,
  buscarOperador
}; 