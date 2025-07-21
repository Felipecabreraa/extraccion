const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { 
  Usuario, Zona, Sector, Pabellon, Planilla, Barredor, Maquina, 
  Operador, MaquinaPlanilla, PabellonMaquina, Dano, BarredorCatalogo 
} = require('../src/models');

// Función para leer el archivo JSON
function leerArchivoJSON(rutaArchivo) {
  try {
    const contenido = fs.readFileSync(rutaArchivo, 'utf8');
    return JSON.parse(contenido);
  } catch (error) {
    console.error('Error al leer el archivo JSON:', error.message);
    return null;
  }
}

// Función para mapear datos de órdenes de servicio a la estructura de la DB
function mapearOrdenesServicio(datos) {
  const planillas = [];
  const danos = [];
  const maquinasPlanilla = [];
  const pabellonesMaquina = [];

  datos.forEach((orden, index) => {
    // Mapear a Planilla
    const planilla = {
      supervisor_id: null, // Se debe asignar manualmente o buscar por nombre
      sector_id: null, // Se debe asignar manualmente o buscar por nombre
      mt2: orden.metros_cuadrados || 0,
      pabellones_total: orden.pabellones?.length || 0,
      pabellones_limpiados: 0, // Por defecto
      fecha_inicio: orden.fecha_inicio || new Date(),
      fecha_termino: orden.fecha_termino || null,
      ticket: orden.numero_orden || `ORD-${Date.now()}-${index}`,
      estado: 'ABIERTO',
      observacion: orden.observaciones || orden.descripcion || ''
    };
    planillas.push(planilla);

    // Mapear daños si existen
    if (orden.danos && Array.isArray(orden.danos)) {
      orden.danos.forEach(dano => {
        danos.push({
          planilla_id: null, // Se asignará después de crear la planilla
          pabellon_id: null, // Se debe buscar por nombre
          maquina_id: null, // Se debe buscar por número/patente
          tipo: dano.tipo || 'infraestructura',
          descripcion: dano.descripcion || dano.observacion || '',
          cantidad: dano.cantidad || 1,
          observacion: dano.observacion || ''
        });
      });
    }

    // Mapear máquinas si existen
    if (orden.maquinas && Array.isArray(orden.maquinas)) {
      orden.maquinas.forEach(maquina => {
        maquinasPlanilla.push({
          planilla_id: null, // Se asignará después de crear la planilla
          maquina_id: null, // Se debe buscar por número/patente
          operador_id: null, // Se debe buscar por nombre
          fecha_inicio: maquina.fecha_inicio || orden.fecha_inicio,
          fecha_termino: maquina.fecha_termino || null,
          horas_trabajo: maquina.horas_trabajo || 0,
          observacion: maquina.observacion || ''
        });
      });
    }

    // Mapear pabellones si existen
    if (orden.pabellones && Array.isArray(orden.pabellones)) {
      orden.pabellones.forEach(pabellon => {
        pabellonesMaquina.push({
          planilla_id: null, // Se asignará después de crear la planilla
          pabellon_id: null, // Se debe buscar por nombre
          maquina_id: null, // Se debe buscar por número/patente
          fecha_limpieza: pabellon.fecha_limpieza || orden.fecha_inicio,
          estado: pabellon.estado || 'PENDIENTE',
          observacion: pabellon.observacion || ''
        });
      });
    }
  });

  return { planillas, danos, maquinasPlanilla, pabellonesMaquina };
}

// Función para crear archivos Excel
function crearArchivosExcel(datosMapeados) {
  const workbook = XLSX.utils.book_new();

  // Hoja de Planillas
  if (datosMapeados.planillas.length > 0) {
    const wsPlanillas = XLSX.utils.json_to_sheet(datosMapeados.planillas);
    XLSX.utils.book_append_sheet(workbook, wsPlanillas, 'Planillas');
  }

  // Hoja de Daños
  if (datosMapeados.danos.length > 0) {
    const wsDanos = XLSX.utils.json_to_sheet(datosMapeados.danos);
    XLSX.utils.book_append_sheet(workbook, wsDanos, 'Danos');
  }

  // Hoja de Máquinas Planilla
  if (datosMapeados.maquinasPlanilla.length > 0) {
    const wsMaquinasPlanilla = XLSX.utils.json_to_sheet(datosMapeados.maquinasPlanilla);
    XLSX.utils.book_append_sheet(workbook, wsMaquinasPlanilla, 'MaquinasPlanilla');
  }

  // Hoja de Pabellones Máquina
  if (datosMapeados.pabellonesMaquina.length > 0) {
    const wsPabellonesMaquina = XLSX.utils.json_to_sheet(datosMapeados.pabellonesMaquina);
    XLSX.utils.book_append_sheet(workbook, wsPabellonesMaquina, 'PabellonesMaquina');
  }

  // Guardar archivo
  const nombreArchivo = `ordenes_servicio_convertidas_${new Date().toISOString().split('T')[0]}.xlsx`;
  const rutaArchivo = path.join(__dirname, nombreArchivo);
  
  XLSX.writeFile(workbook, rutaArchivo);
  console.log(`Archivo Excel creado: ${rutaArchivo}`);
  
  return rutaArchivo;
}

// Función para crear archivo de mapeo de referencias
function crearArchivoMapeo(datos) {
  const mapeo = {
    supervisores: [],
    sectores: [],
    pabellones: [],
    maquinas: [],
    operadores: []
  };

  datos.forEach(orden => {
    // Extraer supervisores
    if (orden.supervisor && !mapeo.supervisores.find(s => s.nombre === orden.supervisor)) {
      mapeo.supervisores.push({
        nombre: orden.supervisor,
        email: orden.email_supervisor || '',
        telefono: orden.telefono_supervisor || ''
      });
    }

    // Extraer sectores
    if (orden.sector && !mapeo.sectores.find(s => s.nombre === orden.sector)) {
      mapeo.sectores.push({
        nombre: orden.sector,
        zona: orden.zona || 'Zona Principal'
      });
    }

    // Extraer pabellones
    if (orden.pabellones && Array.isArray(orden.pabellones)) {
      orden.pabellones.forEach(pabellon => {
        if (!mapeo.pabellones.find(p => p.nombre === pabellon.nombre)) {
          mapeo.pabellones.push({
            nombre: pabellon.nombre,
            sector: orden.sector || 'Sector Principal'
          });
        }
      });
    }

    // Extraer máquinas
    if (orden.maquinas && Array.isArray(orden.maquinas)) {
      orden.maquinas.forEach(maquina => {
        if (!mapeo.maquinas.find(m => m.numero === maquina.numero)) {
          mapeo.maquinas.push({
            numero: maquina.numero,
            patente: maquina.patente || '',
            marca: maquina.marca || '',
            modelo: maquina.modelo || ''
          });
        }
      });
    }

    // Extraer operadores
    if (orden.operadores && Array.isArray(orden.operadores)) {
      orden.operadores.forEach(operador => {
        if (!mapeo.operadores.find(o => o.nombre === operador.nombre)) {
          mapeo.operadores.push({
            nombre: operador.nombre,
            rut: operador.rut || '',
            telefono: operador.telefono || '',
            email: operador.email || ''
          });
        }
      });
    }
  });

  // Crear archivo de mapeo
  const workbook = XLSX.utils.book_new();
  
  Object.keys(mapeo).forEach(tabla => {
    if (mapeo[tabla].length > 0) {
      const ws = XLSX.utils.json_to_sheet(mapeo[tabla]);
      XLSX.utils.book_append_sheet(workbook, ws, tabla.charAt(0).toUpperCase() + tabla.slice(1));
    }
  });

  const nombreArchivo = `mapeo_referencias_${new Date().toISOString().split('T')[0]}.xlsx`;
  const rutaArchivo = path.join(__dirname, nombreArchivo);
  
  XLSX.writeFile(workbook, rutaArchivo);
  console.log(`Archivo de mapeo creado: ${rutaArchivo}`);
  
  return rutaArchivo;
}

// Función principal
async function convertirOrdenesServicio(rutaArchivoJSON) {
  try {
    console.log('Iniciando conversión de órdenes de servicio...');
    
    // Leer archivo JSON
    const datos = leerArchivoJSON(rutaArchivoJSON);
    if (!datos) {
      console.error('No se pudo leer el archivo JSON');
      return;
    }

    console.log(`Archivo JSON leído. ${datos.length} órdenes encontradas.`);

    // Mapear datos
    const datosMapeados = mapearOrdenesServicio(datos);
    
    // Crear archivos Excel
    const archivoExcel = crearArchivosExcel(datosMapeados);
    const archivoMapeo = crearArchivoMapeo(datos);

    console.log('\n=== RESUMEN DE CONVERSIÓN ===');
    console.log(`Planillas: ${datosMapeados.planillas.length}`);
    console.log(`Daños: ${datosMapeados.danos.length}`);
    console.log(`Máquinas Planilla: ${datosMapeados.maquinasPlanilla.length}`);
    console.log(`Pabellones Máquina: ${datosMapeados.pabellonesMaquina.length}`);
    console.log('\nArchivos creados:');
    console.log(`- ${archivoExcel}`);
    console.log(`- ${archivoMapeo}`);
    
    console.log('\n=== INSTRUCCIONES ===');
    console.log('1. Revisa el archivo de mapeo para identificar referencias faltantes');
    console.log('2. Completa los IDs de referencia en el archivo principal');
    console.log('3. Usa el endpoint de carga masiva para importar los datos');
    console.log('4. Verifica que todos los registros se importaron correctamente');

  } catch (error) {
    console.error('Error durante la conversión:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const rutaArchivo = process.argv[2];
  
  if (!rutaArchivo) {
    console.log('Uso: node convertir_ordenes_servicio.js <ruta_archivo_json>');
    console.log('Ejemplo: node convertir_ordenes_servicio.js "C:\\Users\\pipe\\Downloads\\ordenesservicio.json"');
    process.exit(1);
  }

  convertirOrdenesServicio(rutaArchivo);
}

module.exports = {
  convertirOrdenesServicio,
  mapearOrdenesServicio,
  crearArchivosExcel,
  crearArchivoMapeo
}; 