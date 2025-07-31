const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Configurando sistema de reporte de daños acumulados...');

try {
  // 1. Ejecutar migración para crear la tabla
  console.log('📋 Ejecutando migración para crear tabla reporte_danos_mensuales...');
  execSync('npx sequelize-cli db:migrate', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  // 2. Crear vista y datos de ejemplo
  console.log('🔧 Creando vista y datos de ejemplo...');
  execSync('node scripts/crear_vista_danos_acumulados.js', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  console.log('✅ Sistema de reporte de daños acumulados configurado exitosamente');
  console.log('');
  console.log('📋 Endpoints disponibles:');
  console.log('  - GET /api/danos-acumulados');
  console.log('  - POST /api/danos-acumulados/registro');
  console.log('  - POST /api/danos-acumulados/cargar-anio-anterior');
  console.log('  - POST /api/danos-acumulados/calcular-variacion');
  console.log('  - GET /api/danos-acumulados/resumen-ejecutivo');
  console.log('');
  console.log('📊 Datos de ejemplo cargados:');
  console.log('  - Año 2024: Datos completos (año base)');
  console.log('  - Año 2025: Datos hasta mayo (año actual)');
  console.log('');
  console.log('🔗 Para probar el sistema:');
  console.log('  curl -X GET "http://localhost:3001/api/danos-acumulados?anio=2025"');
  
} catch (error) {
  console.error('❌ Error configurando sistema:', error);
  process.exit(1);
} 