const XLSX = require('xlsx');

// Datos de ejemplo
const datos = [
  { anio: 2024, mes: 1, valor_real: 1500000, valor_ppto: 1400000 },
  { anio: 2024, mes: 2, valor_real: 1800000, valor_ppto: 1600000 },
  { anio: 2024, mes: 3, valor_real: 2200000, valor_ppto: 2000000 },
  { anio: 2024, mes: 4, valor_real: 1900000, valor_ppto: 1800000 },
  { anio: 2024, mes: 5, valor_real: 2500000, valor_ppto: 2200000 },
  { anio: 2024, mes: 6, valor_real: 2800000, valor_ppto: 2400000 },
  { anio: 2024, mes: 7, valor_real: 3200000, valor_ppto: 2800000 },
  { anio: 2024, mes: 8, valor_real: 2900000, valor_ppto: 2600000 },
  { anio: 2024, mes: 9, valor_real: 2600000, valor_ppto: 2400000 },
  { anio: 2024, mes: 10, valor_real: 2400000, valor_ppto: 2200000 },
  { anio: 2024, mes: 11, valor_real: 2100000, valor_ppto: 2000000 },
  { anio: 2024, mes: 12, valor_real: 1800000, valor_ppto: 1600000 },
  { anio: 2025, mes: 1, valor_real: 1200000, valor_ppto: 1400000 },
  { anio: 2025, mes: 2, valor_real: 1400000, valor_ppto: 1600000 },
  { anio: 2025, mes: 3, valor_real: 1600000, valor_ppto: 1800000 },
  { anio: 2025, mes: 4, valor_real: 1800000, valor_ppto: 2000000 },
  { anio: 2025, mes: 5, valor_real: 2000000, valor_ppto: 2200000 },
  { anio: 2025, mes: 6, valor_real: 2200000, valor_ppto: 2400000 },
  { anio: 2025, mes: 7, valor_real: 2400000, valor_ppto: 2600000 },
  { anio: 2025, mes: 8, valor_real: 2600000, valor_ppto: 2800000 },
  { anio: 2025, mes: 9, valor_real: 2800000, valor_ppto: 3000000 },
  { anio: 2025, mes: 10, valor_real: 3000000, valor_ppto: 3200000 },
  { anio: 2025, mes: 11, valor_real: 3200000, valor_ppto: 3400000 },
  { anio: 2025, mes: 12, valor_real: 3400000, valor_ppto: 3600000 }
];

// Crear workbook
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(datos);

// Agregar worksheet al workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos_Danos');

// Escribir archivo
XLSX.writeFile(workbook, 'plantilla_danos_acumulados.xlsx');

console.log('✅ Archivo Excel generado: plantilla_danos_acumulados.xlsx');
console.log('📋 Estructura del archivo:');
console.log('   - anio: Año del registro (ej: 2024, 2025)');
console.log('   - mes: Mes del registro (1-12)');
console.log('   - valor_real: Valor real en pesos chilenos');
console.log('   - valor_ppto: Valor presupuestado en pesos chilenos');
console.log('');
console.log('📝 Instrucciones:');
console.log('   1. Abre el archivo Excel generado');
console.log('   2. Reemplaza los datos de ejemplo con tus datos reales');
console.log('   3. Guarda el archivo');
console.log('   4. Usa la función "Carga Masiva" en el sistema'); 