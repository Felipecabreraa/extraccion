import axios from 'axios';

// Función para hacer peticiones con manejo de errores
const makeRequest = async (method, endpoint, data = null, params = null) => {
  try {
    const config = {
      method,
      url: `/api${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    };
    
    if (data) config.data = data;
    if (params) config.params = params;
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error en ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
};

// Función para probar el sistema completo
export const testDanosAcumulados = async () => {
  console.log('🧪 Iniciando pruebas del sistema de daños acumulados...\n');
  
  const resultados = {
    exitosos: 0,
    fallidos: 0,
    detalles: []
  };

  // 1. Probar obtención de datos
  console.log('1️⃣ Probando GET /api/danos-acumulados...');
  const datosAcumulados = await makeRequest('GET', '/danos-acumulados', null, { anio: 2025 });
  
  if (datosAcumulados) {
    console.log('✅ Datos obtenidos exitosamente');
    console.log(`📊 Año actual: ${datosAcumulados.anio_actual}`);
    console.log(`📊 Total real: ${datosAcumulados.kpis?.total_real_actual_formateado || '$0'}`);
    console.log(`📊 Meses con datos: ${datosAcumulados.datos_grafico?.length || 0}`);
    resultados.exitosos++;
    resultados.detalles.push('GET /api/danos-acumulados - EXITOSO');
  } else {
    console.log('❌ Error obteniendo datos');
    resultados.fallidos++;
    resultados.detalles.push('GET /api/danos-acumulados - FALLIDO');
  }

  // 2. Probar resumen ejecutivo
  console.log('\n2️⃣ Probando GET /api/danos-acumulados/resumen-ejecutivo...');
  const resumenEjecutivo = await makeRequest('GET', '/danos-acumulados/resumen-ejecutivo', null, { anio: 2025 });
  
  if (resumenEjecutivo) {
    console.log('✅ Resumen ejecutivo obtenido exitosamente');
    console.log(`📊 Total real: ${resumenEjecutivo.resumen?.total_real_actual_formateado || '$0'}`);
    console.log(`📊 Variación anual: ${resumenEjecutivo.variacion?.porcentual || 0}%`);
    resultados.exitosos++;
    resultados.detalles.push('GET /api/danos-acumulados/resumen-ejecutivo - EXITOSO');
  } else {
    console.log('❌ Error obteniendo resumen ejecutivo');
    resultados.fallidos++;
    resultados.detalles.push('GET /api/danos-acumulados/resumen-ejecutivo - FALLIDO');
  }

  // 3. Probar creación de registro
  console.log('\n3️⃣ Probando POST /api/danos-acumulados/registro...');
  const nuevoRegistro = await makeRequest('POST', '/danos-acumulados/registro', {
    anio: 2025,
    mes: 6,
    valor_real: 2700000,
    valor_ppto: 2600000
  });
  
  if (nuevoRegistro?.success) {
    console.log('✅ Registro creado/actualizado exitosamente');
    console.log(`📊 Mes: ${nuevoRegistro.data?.nombre_mes}`);
    console.log(`📊 Valor real: ${nuevoRegistro.data?.valor_real_formateado}`);
    resultados.exitosos++;
    resultados.detalles.push('POST /api/danos-acumulados/registro - EXITOSO');
  } else {
    console.log('❌ Error creando registro');
    resultados.fallidos++;
    resultados.detalles.push('POST /api/danos-acumulados/registro - FALLIDO');
  }

  // 4. Probar cálculo de variación
  console.log('\n4️⃣ Probando POST /api/danos-acumulados/calcular-variacion...');
  const variacionAnual = await makeRequest('POST', '/danos-acumulados/calcular-variacion', {
    anio_actual: 2025,
    anio_anterior: 2024
  });
  
  if (variacionAnual) {
    console.log('✅ Variación anual calculada exitosamente');
    console.log(`📊 Variación: ${variacionAnual.variacion?.porcentual || 0}%`);
    console.log(`📊 Interpretación: ${variacionAnual.variacion?.interpretacion || 'Sin datos'}`);
    resultados.exitosos++;
    resultados.detalles.push('POST /api/danos-acumulados/calcular-variacion - EXITOSO');
  } else {
    console.log('❌ Error calculando variación');
    resultados.fallidos++;
    resultados.detalles.push('POST /api/danos-acumulados/calcular-variacion - FALLIDO');
  }

  // 5. Probar carga de año anterior
  console.log('\n5️⃣ Probando POST /api/danos-acumulados/cargar-anio-anterior...');
  const cargarAnioAnterior = await makeRequest('POST', '/danos-acumulados/cargar-anio-anterior', {
    anio_origen: 2024,
    anio_destino: 2025
  });
  
  if (cargarAnioAnterior?.success) {
    console.log('✅ Datos del año anterior cargados exitosamente');
    console.log(`📊 Registros procesados: ${cargarAnioAnterior.data?.registros_procesados || 0}`);
    resultados.exitosos++;
    resultados.detalles.push('POST /api/danos-acumulados/cargar-anio-anterior - EXITOSO');
  } else {
    console.log('❌ Error cargando año anterior');
    resultados.fallidos++;
    resultados.detalles.push('POST /api/danos-acumulados/cargar-anio-anterior - FALLIDO');
  }

  // 6. Verificar datos actualizados
  console.log('\n6️⃣ Verificando datos actualizados...');
  const datosActualizados = await makeRequest('GET', '/danos-acumulados', null, { anio: 2025 });
  
  if (datosActualizados) {
    console.log('✅ Datos actualizados verificados');
    console.log(`📊 Total real actual: ${datosActualizados.kpis?.total_real_actual_formateado || '$0'}`);
    console.log(`📊 Meses con datos: ${datosActualizados.datos_grafico?.filter(d => d.real_acumulado > 0).length || 0}`);
    resultados.exitosos++;
    resultados.detalles.push('Verificación datos actualizados - EXITOSO');
  } else {
    console.log('❌ Error verificando datos actualizados');
    resultados.fallidos++;
    resultados.detalles.push('Verificación datos actualizados - FALLIDO');
  }

  // Resumen final
  console.log('\n📋 RESUMEN DE PRUEBAS:');
  console.log(`✅ Exitosos: ${resultados.exitosos}`);
  console.log(`❌ Fallidos: ${resultados.fallidos}`);
  console.log(`📊 Total: ${resultados.exitosos + resultados.fallidos}`);
  console.log(`🎯 Tasa de éxito: ${((resultados.exitosos / (resultados.exitosos + resultados.fallidos)) * 100).toFixed(1)}%`);

  console.log('\n📝 DETALLES:');
  resultados.detalles.forEach(detalle => {
    console.log(`  - ${detalle}`);
  });

  if (resultados.fallidos === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('✅ Sistema de daños acumulados funcionando correctamente');
  } else {
    console.log('\n⚠️ Algunas pruebas fallaron. Revisar configuración.');
  }

  return resultados;
};

// Función para probar endpoints específicos
export const testEndpoint = async (endpoint, method = 'GET', data = null, params = null) => {
  console.log(`🧪 Probando ${method} ${endpoint}...`);
  
  const resultado = await makeRequest(method, endpoint, data, params);
  
  if (resultado) {
    console.log('✅ Éxito');
    console.log('📊 Datos:', resultado);
    return true;
  } else {
    console.log('❌ Falló');
    return false;
  }
};

// Función para validar estructura de datos
export const validarEstructuraDatos = (datos) => {
  const errores = [];
  
  if (!datos) {
    errores.push('Datos es null o undefined');
    return errores;
  }

  // Validar estructura básica
  if (!datos.anio_actual) errores.push('Falta anio_actual');
  if (!datos.anio_anterior) errores.push('Falta anio_anterior');
  if (!datos.kpis) errores.push('Falta kpis');
  if (!datos.datos_grafico) errores.push('Falta datos_grafico');

  // Validar KPIs
  if (datos.kpis) {
    if (typeof datos.kpis.total_real_actual !== 'number') errores.push('total_real_actual debe ser número');
    if (typeof datos.kpis.total_ppto_actual !== 'number') errores.push('total_ppto_actual debe ser número');
    if (typeof datos.kpis.total_real_anterior !== 'number') errores.push('total_real_anterior debe ser número');
  }

  // Validar datos de gráfico
  if (datos.datos_grafico && Array.isArray(datos.datos_grafico)) {
    datos.datos_grafico.forEach((mes, index) => {
      if (!mes.nombreMes) errores.push(`Mes ${index}: Falta nombreMes`);
      if (typeof mes.real_acumulado !== 'number') errores.push(`Mes ${index}: real_acumulado debe ser número`);
      if (typeof mes.ppto_acumulado !== 'number') errores.push(`Mes ${index}: ppto_acumulado debe ser número`);
    });
  }

  return errores;
};

// Función para generar reporte de pruebas
export const generarReportePruebas = (resultados) => {
  const reporte = {
    fecha: new Date().toISOString(),
    resumen: {
      total: resultados.exitosos + resultados.fallidos,
      exitosos: resultados.exitosos,
      fallidos: resultados.fallidos,
      tasaExito: ((resultados.exitosos / (resultados.exitosos + resultados.fallidos)) * 100).toFixed(1)
    },
    detalles: resultados.detalles,
    estado: resultados.fallidos === 0 ? 'PASÓ' : 'FALLÓ'
  };

  console.log('\n📄 REPORTE DE PRUEBAS:');
  console.log(JSON.stringify(reporte, null, 2));

  return reporte;
};

const testUtils = {
  testDanosAcumulados,
  testEndpoint,
  validarEstructuraDatos,
  generarReportePruebas
};

export default testUtils; 