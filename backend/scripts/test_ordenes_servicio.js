const fs = require('fs');
const path = require('path');
const { convertirOrdenesServicio } = require('./convertir_ordenes_servicio');

// Datos de prueba
const datosPrueba = [
  {
    numero_orden: "ORD-TEST-001",
    fecha_inicio: "2024-01-15",
    fecha_termino: "2024-01-16",
    supervisor: "Juan Pérez",
    sector: "Sector A",
    metros_cuadrados: 1500,
    observaciones: "Limpieza de prueba del sector A",
    pabellones: [
      {
        nombre: "Pabellón Test 1",
        estado: "PENDIENTE",
        observacion: "Requiere limpieza general"
      },
      {
        nombre: "Pabellón Test 2",
        estado: "EN_PROCESO",
        observacion: "Limpieza en progreso"
      }
    ],
    maquinas: [
      {
        numero: "M-TEST-001",
        patente: "TEST123",
        marca: "Marca Test",
        modelo: "Modelo Test X",
        horas_trabajo: 8,
        fecha_inicio: "2024-01-15T08:00:00",
        fecha_termino: "2024-01-15T16:00:00"
      }
    ],
    operadores: [
      {
        nombre: "Carlos López",
        rut: "12.345.678-9",
        telefono: "+56912345678",
        email: "carlos.lopez@test.com"
      }
    ],
    danos: [
      {
        tipo: "infraestructura",
        descripcion: "Piso dañado en pabellón 1",
        cantidad: 1,
        observacion: "Requiere reparación urgente"
      },
      {
        tipo: "equipo",
        descripcion: "Máquina con falla menor",
        cantidad: 1,
        observacion: "Mantenimiento preventivo necesario"
      }
    ]
  },
  {
    numero_orden: "ORD-TEST-002",
    fecha_inicio: "2024-01-17",
    fecha_termino: "2024-01-18",
    supervisor: "María González",
    sector: "Sector B",
    metros_cuadrados: 2000,
    observaciones: "Limpieza de prueba del sector B",
    pabellones: [
      {
        nombre: "Pabellón Test 3",
        estado: "COMPLETADO",
        observacion: "Limpieza completada exitosamente"
      }
    ],
    maquinas: [
      {
        numero: "M-TEST-002",
        patente: "TEST456",
        marca: "Marca Test 2",
        modelo: "Modelo Test Y",
        horas_trabajo: 6,
        fecha_inicio: "2024-01-17T09:00:00",
        fecha_termino: "2024-01-17T15:00:00"
      }
    ],
    operadores: [
      {
        nombre: "Ana Rodríguez",
        rut: "98.765.432-1",
        telefono: "+56987654321",
        email: "ana.rodriguez@test.com"
      }
    ],
    danos: [
      {
        tipo: "infraestructura",
        descripcion: "Ventana rota",
        cantidad: 2,
        observacion: "Reemplazo de vidrios necesario"
      }
    ]
  }
];

// Función para crear archivo JSON de prueba
function crearArchivoPrueba() {
  const rutaArchivo = path.join(__dirname, 'datos_prueba_ordenes.json');
  
  try {
    fs.writeFileSync(rutaArchivo, JSON.stringify(datosPrueba, null, 2), 'utf8');
    console.log(`Archivo de prueba creado: ${rutaArchivo}`);
    return rutaArchivo;
  } catch (error) {
    console.error('Error al crear archivo de prueba:', error.message);
    return null;
  }
}

// Función para verificar archivos generados
function verificarArchivosGenerados() {
  const fecha = new Date().toISOString().split('T')[0];
  const archivosEsperados = [
    `ordenes_servicio_convertidas_${fecha}.xlsx`,
    `mapeo_referencias_${fecha}.xlsx`
  ];
  
  console.log('\n=== VERIFICACIÓN DE ARCHIVOS ===');
  
  archivosEsperados.forEach(nombreArchivo => {
    const rutaArchivo = path.join(__dirname, nombreArchivo);
    if (fs.existsSync(rutaArchivo)) {
      const stats = fs.statSync(rutaArchivo);
      console.log(`✅ ${nombreArchivo} - ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log(`❌ ${nombreArchivo} - No encontrado`);
    }
  });
}

// Función para mostrar estadísticas de datos
function mostrarEstadisticas() {
  console.log('\n=== ESTADÍSTICAS DE DATOS DE PRUEBA ===');
  console.log(`Total de órdenes: ${datosPrueba.length}`);
  
  let totalPabellones = 0;
  let totalMaquinas = 0;
  let totalOperadores = 0;
  let totalDanos = 0;
  
  datosPrueba.forEach(orden => {
    totalPabellones += orden.pabellones?.length || 0;
    totalMaquinas += orden.maquinas?.length || 0;
    totalOperadores += orden.operadores?.length || 0;
    totalDanos += orden.danos?.length || 0;
  });
  
  console.log(`Total de pabellones: ${totalPabellones}`);
  console.log(`Total de máquinas: ${totalMaquinas}`);
  console.log(`Total de operadores: ${totalOperadores}`);
  console.log(`Total de daños: ${totalDanos}`);
  
  // Mostrar supervisores únicos
  const supervisores = [...new Set(datosPrueba.map(orden => orden.supervisor))];
  console.log(`Supervisores únicos: ${supervisores.join(', ')}`);
  
  // Mostrar sectores únicos
  const sectores = [...new Set(datosPrueba.map(orden => orden.sector))];
  console.log(`Sectores únicos: ${sectores.join(', ')}`);
}

// Función principal de prueba
async function ejecutarPrueba() {
  try {
    console.log('=== PRUEBA DE PROCESAMIENTO DE ÓRDENES DE SERVICIO ===\n');
    
    // Crear archivo de prueba
    console.log('PASO 1: Creando archivo de prueba...');
    const archivoPrueba = crearArchivoPrueba();
    if (!archivoPrueba) {
      console.error('No se pudo crear el archivo de prueba');
      return;
    }
    
    // Mostrar estadísticas
    mostrarEstadisticas();
    
    // Procesar archivo de prueba
    console.log('\nPASO 2: Procesando archivo de prueba...');
    await convertirOrdenesServicio(archivoPrueba);
    
    // Verificar archivos generados
    verificarArchivosGenerados();
    
    console.log('\n=== PRUEBA COMPLETADA ===');
    console.log('✅ El procesamiento de órdenes de servicio funciona correctamente');
    console.log('📁 Revisa los archivos generados en la carpeta scripts/');
    console.log('🔧 Ahora puedes usar el script con tu archivo JSON real');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarPrueba();
}

module.exports = {
  ejecutarPrueba,
  crearArchivoPrueba,
  verificarArchivosGenerados,
  mostrarEstadisticas
}; 