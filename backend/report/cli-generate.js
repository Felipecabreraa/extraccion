#!/usr/bin/env node

const yargs = require('yargs');
const dotenv = require('dotenv');
const { generateDailyReportPDF } = require('./generateDailyReport');

// Cargar variables de entorno
dotenv.config();

// Configurar argumentos de línea de comandos
const argv = yargs
  .option('date', {
    alias: 'd',
    type: 'string',
    description: 'Fecha para el reporte (YYYY-MM-DD)',
    default: new Date().toISOString().split('T')[0]
  })
  .option('baseUrl', {
    alias: 'u',
    type: 'string',
    description: 'URL base del frontend',
    default: process.env.BASE_URL || 'http://localhost:3000'
  })
  .option('authToken', {
    alias: 't',
    type: 'string',
    description: 'Token de autenticación Bearer',
    default: process.env.AUTH_TOKEN
  })
  .option('onlyChart', {
    alias: 'c',
    type: 'boolean',
    description: 'Capturar solo gráfico como PNG',
    default: false
  })
  .option('landscape', {
    alias: 'l',
    type: 'boolean',
    description: 'Generar PDF en orientación horizontal',
    default: false
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Directorio de salida personalizado',
    default: './reports'
  })
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .argv;

/**
 * Función principal del CLI
 */
async function main() {
  try {
    console.log('🚀 Iniciando generador de PDF diario...\n');
    
    // Validar fecha
    const fecha = argv.date;
    if (!isValidDate(fecha)) {
      console.error('❌ Error: Formato de fecha inválido. Use YYYY-MM-DD');
      process.exit(1);
    }
    
    // Mostrar configuración
    console.log('📋 Configuración:');
    console.log(`   📅 Fecha: ${fecha}`);
    console.log(`   🌐 URL Base: ${argv.baseUrl}`);
    console.log(`   🔐 Token: ${argv.authToken ? 'Configurado' : 'No configurado'}`);
    console.log(`   📊 Solo Gráfico: ${argv.onlyChart ? 'Sí' : 'No'}`);
    console.log(`   📄 Orientación: ${argv.landscape ? 'Horizontal' : 'Vertical'}`);
    console.log(`   📁 Salida: ${argv.output}\n`);
    
    // Configurar opciones
    const options = {
      date: fecha,
      baseUrl: argv.baseUrl,
      authToken: argv.authToken,
      cookies: [], // Por ahora vacío, se puede expandir
      onlyChart: argv.onlyChart,
      landscape: argv.landscape,
      outputDir: argv.output
    };
    
    // Generar PDF
    console.log('🔄 Generando PDF...');
    const startTime = Date.now();
    
    const filePath = await generateDailyReportPDF(options);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ PDF generado exitosamente!');
    console.log(`📄 Archivo: ${filePath}`);
    console.log(`⏱️  Tiempo: ${duration} segundos`);
    console.log(`📊 Tamaño: ${await getFileSize(filePath)}`);
    
    // Mostrar instrucciones adicionales
    console.log('\n📝 Instrucciones adicionales:');
    console.log('   • El archivo se guarda en el directorio ./reports/');
    console.log('   • Para programar automáticamente, use cron:');
    console.log('     crontab -e');
    console.log('     5 7 * * * cd /ruta/al/proyecto && node backend/report/cli-generate.js --date=$(date +%Y-%m-%d)');
    
  } catch (error) {
    console.error('\n❌ Error generando PDF:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('\n💡 Sugerencias para timeout:');
      console.log('   • Verificar que el servidor esté funcionando');
      console.log('   • Aumentar el timeout en el código');
      console.log('   • Verificar la conectividad de red');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Sugerencias para autenticación:');
      console.log('   • Verificar que AUTH_TOKEN esté configurado');
      console.log('   • Verificar que el token sea válido');
      console.log('   • Verificar permisos de usuario');
    }
    
    process.exit(1);
  }
}

/**
 * Validar formato de fecha
 */
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Obtener tamaño del archivo
 */
async function getFileSize(filePath) {
  try {
    const fs = require('fs').promises;
    const stats = await fs.stat(filePath);
    const sizeInKB = (stats.size / 1024).toFixed(2);
    return `${sizeInKB} KB`;
  } catch (error) {
    return 'N/A';
  }
}

/**
 * Ejemplo de uso con cron (Linux)
 */
function showCronExample() {
  console.log('\n📅 Ejemplo de configuración cron:');
  console.log('   # Generar reporte diario a las 7:05 AM CLT');
  console.log('   5 7 * * * cd /ruta/al/proyecto && node backend/report/cli-generate.js --date=$(date +%Y-%m-%d)');
  console.log('');
  console.log('   # Generar reporte semanal los lunes a las 8:00 AM');
  console.log('   0 8 * * 1 cd /ruta/al/proyecto && node backend/report/cli-generate.js --date=$(date +%Y-%m-%d)');
  console.log('');
  console.log('   # Generar reporte mensual el primer día del mes');
  console.log('   0 9 1 * * cd /ruta/al/proyecto && node backend/report/cli-generate.js --date=$(date +%Y-%m-%d)');
}

// Mostrar ejemplo de cron si se solicita ayuda
if (argv.help) {
  showCronExample();
}

// Ejecutar función principal
if (require.main === module) {
  main();
}

module.exports = {
  main,
  isValidDate,
  getFileSize
};
