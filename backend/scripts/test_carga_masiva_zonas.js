const fs = require('fs');
const path = require('path');

// Crear archivo CSV de prueba
const crearArchivoPrueba = () => {
  const contenido = `nombre,tipo
Zona de Prueba 1,HEMBRA
Zona de Prueba 2,MACHO
Zona de Prueba 3,HEMBRA
Zona de Prueba 4,MACHO
Zona con Nombre Largo para Probar Validación de Longitud,HEMBRA
,HEMBRA
Zona Sin Tipo,
Zona Tipo Invalido,INVALIDO`;

  const rutaArchivo = path.join(__dirname, 'test_zonas.csv');
  fs.writeFileSync(rutaArchivo, contenido);
  
  console.log('✅ Archivo de prueba creado:', rutaArchivo);
  console.log('📄 Contenido del archivo:');
  console.log(contenido);
  
  return rutaArchivo;
};

// Simular validaciones
const simularValidaciones = () => {
  console.log('\n🔍 Simulando validaciones...');
  
  const datosPrueba = [
    { nombre: 'Zona de Prueba 1', tipo: 'HEMBRA' },
    { nombre: 'Zona de Prueba 2', tipo: 'MACHO' },
    { nombre: '', tipo: 'HEMBRA' }, // Error: nombre vacío
    { nombre: 'Zona Sin Tipo', tipo: '' }, // Error: tipo vacío
    { nombre: 'Zona Tipo Invalido', tipo: 'INVALIDO' }, // Error: tipo inválido
    { nombre: 'Zona con Nombre Largo para Probar Validación de Longitud', tipo: 'HEMBRA' } // Error: nombre muy largo
  ];

  datosPrueba.forEach((dato, index) => {
    const errores = [];
    
    // Validar nombre
    if (!dato.nombre || dato.nombre.trim() === '') {
      errores.push('El nombre de la zona es obligatorio');
    } else if (dato.nombre.trim().length > 100) {
      errores.push('El nombre de la zona no puede exceder 100 caracteres');
    }
    
    // Validar tipo
    if (!dato.tipo || dato.tipo.trim() === '') {
      errores.push('El tipo es obligatorio');
    } else {
      const tipoNormalizado = dato.tipo.toUpperCase().trim();
      if (!['HEMBRA', 'MACHO'].includes(tipoNormalizado)) {
        errores.push('El tipo debe ser HEMBRA o MACHO');
      }
    }
    
    console.log(`Fila ${index + 2}: ${errores.length > 0 ? '❌' : '✅'} ${dato.nombre || 'N/A'} - ${dato.tipo || 'N/A'}`);
    if (errores.length > 0) {
      errores.forEach(error => console.log(`   • ${error}`));
    }
  });
};

// Mostrar instrucciones de uso
const mostrarInstrucciones = () => {
  console.log('\n📋 INSTRUCCIONES DE USO:');
  console.log('1. Ejecutar migración: npx sequelize-cli db:migrate');
  console.log('2. Actualizar zonas existentes: node scripts/update_zonas_tipo.js');
  console.log('3. Instalar dependencias: npm install csv-parser multer');
  console.log('4. Crear directorio uploads: mkdir uploads');
  console.log('5. Reiniciar servidor backend');
  console.log('6. Probar carga masiva desde el frontend');
};

// Función principal
const main = () => {
  console.log('🧪 PRUEBA DE CARGA MASIVA DE ZONAS');
  console.log('=====================================\n');
  
  crearArchivoPrueba();
  simularValidaciones();
  mostrarInstrucciones();
  
  console.log('\n✅ Prueba completada. Revisa los archivos generados.');
};

main(); 