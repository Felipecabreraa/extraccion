#!/usr/bin/env node

/**
 * 🔧 Script de Configuración del Sistema de Reportes Automáticos
 * 
 * Este script ayuda a configurar automáticamente el sistema de reportes:
 * 1. Verifica las dependencias
 * 2. Crea directorios necesarios
 * 3. Verifica la configuración de email
 * 4. Ejecuta pruebas del sistema
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ReportSystemSetup {
  constructor() {
    this.backendDir = path.join(__dirname, '..');
    this.reportsDir = path.join(this.backendDir, 'reports');
    this.logsDir = path.join(this.backendDir, 'logs');
  }

  async run() {
    console.log('🔧 ==========================================');
    console.log('🔧 CONFIGURACIÓN DEL SISTEMA DE REPORTES');
    console.log('🔧 ==========================================');
    console.log('');

    try {
      // Paso 1: Verificar dependencias
      await this.checkDependencies();
      
      // Paso 2: Crear directorios
      await this.createDirectories();
      
      // Paso 3: Verificar configuración
      await this.checkConfiguration();
      
      // Paso 4: Instalar dependencias si es necesario
      await this.installDependencies();
      
      // Paso 5: Ejecutar pruebas
      await this.runTests();
      
      // Paso 6: Mostrar resumen
      this.showSummary();
      
    } catch (error) {
      console.error('❌ Error en la configuración:', error.message);
      process.exit(1);
    }
  }

  async checkDependencies() {
    console.log('📦 Verificando dependencias...');
    
    const requiredPackages = [
      'pdfkit',
      'nodemailer',
      'chartjs-node-canvas'
    ];
    
    const missingPackages = [];
    
    for (const pkg of requiredPackages) {
      try {
        require.resolve(pkg);
        console.log(`  ✅ ${pkg}`);
      } catch (error) {
        missingPackages.push(pkg);
        console.log(`  ❌ ${pkg} - Faltante`);
      }
    }
    
    if (missingPackages.length > 0) {
      console.log(`\n⚠️ Dependencias faltantes: ${missingPackages.join(', ')}`);
      console.log('📦 Se instalarán automáticamente...');
      return false;
    }
    
    console.log('✅ Todas las dependencias están instaladas');
    return true;
  }

  async createDirectories() {
    console.log('\n📁 Creando directorios necesarios...');
    
    const directories = [
      this.reportsDir,
      this.logsDir
    ];
    
    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`  ✅ Creado: ${path.relative(this.backendDir, dir)}`);
      } else {
        console.log(`  ✅ Existe: ${path.relative(this.backendDir, dir)}`);
      }
    }
  }

  async checkConfiguration() {
    console.log('\n🔍 Verificando configuración...');
    
    const requiredEnvVars = [
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS',
      'REPORT_EMAIL_1'
    ];
    
    const missingVars = [];
    const configuredVars = [];
    
    for (const varName of requiredEnvVars) {
      if (process.env[varName]) {
        configuredVars.push(varName);
        console.log(`  ✅ ${varName}: Configurado`);
      } else {
        missingVars.push(varName);
        console.log(`  ❌ ${varName}: No configurado`);
      }
    }
    
    if (missingVars.length > 0) {
      console.log('\n⚠️ Variables de entorno faltantes:');
      missingVars.forEach(varName => {
        console.log(`  - ${varName}`);
      });
      
      console.log('\n📝 Para configurar:');
      console.log('1. Copia env.reports.example como .env');
      console.log('2. Configura las variables de email SMTP');
      console.log('3. Configura los destinatarios de los reportes');
      console.log('4. Ejecuta este script nuevamente');
      
      throw new Error('Configuración incompleta');
    }
    
    console.log('✅ Configuración verificada correctamente');
  }

  async installDependencies() {
    console.log('\n📦 Instalando dependencias faltantes...');
    
    try {
      const result = execSync('npm install', { 
        cwd: this.backendDir,
        stdio: 'pipe',
        encoding: 'utf8'
      });
      console.log('✅ Dependencias instaladas correctamente');
    } catch (error) {
      console.log('⚠️ Error instalando dependencias:', error.message);
      console.log('💡 Ejecuta manualmente: npm install');
    }
  }

  async runTests() {
    console.log('\n🧪 Ejecutando pruebas del sistema...');
    
    try {
      const ReportController = require('../src/controllers/reportController');
      const reportController = new ReportController();
      
      const testResult = await reportController.testSystem();
      
      console.log('📊 Resultados de las pruebas:');
      console.log(`  📧 Conexión de email: ${testResult.results.emailConnection ? '✅' : '❌'}`);
      console.log(`  📊 Generación de PDF: ${testResult.results.pdfGeneration ? '✅' : '❌'}`);
      console.log(`  📧 Email de prueba: ${testResult.results.testEmail ? '✅' : '❌'}`);
      
      if (testResult.success) {
        console.log('✅ Sistema funcionando correctamente');
      } else {
        console.log('❌ Problemas detectados en el sistema');
        console.log('💡 Revisa la configuración de email');
      }
      
      return testResult.success;
      
    } catch (error) {
      console.error('❌ Error en pruebas:', error.message);
      return false;
    }
  }

  showSummary() {
    console.log('\n📊 ==========================================');
    console.log('📊 RESUMEN DE LA CONFIGURACIÓN');
    console.log('📊 ==========================================');
    
    console.log('✅ Sistema configurado correctamente');
    console.log('');
    console.log('🚀 Próximos pasos:');
    console.log('1. Configurar programación automática:');
    console.log('   - Windows: Programador de tareas');
    console.log('   - Linux/Mac: cron');
    console.log('');
    console.log('2. Comandos disponibles:');
    console.log('   - Generar reporte: node scripts/generate-daily-report.js');
    console.log('   - Probar sistema: node scripts/generate-daily-report.js --test');
    console.log('   - Ver estado: node scripts/generate-daily-report.js --status');
    console.log('');
    console.log('3. APIs disponibles:');
    console.log('   - POST /api/reports/generate-and-send');
    console.log('   - GET /api/reports/status');
    console.log('   - GET /api/reports/test');
    console.log('');
    console.log('📧 Configuración de email:');
    console.log(`   - SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`);
    console.log(`   - Usuario: ${process.env.SMTP_USER}`);
    console.log(`   - Destinatarios: ${process.env.REPORT_EMAIL_1}${process.env.REPORT_EMAIL_2 ? ', ' + process.env.REPORT_EMAIL_2 : ''}${process.env.REPORT_EMAIL_3 ? ', ' + process.env.REPORT_EMAIL_3 : ''}`);
    console.log('');
    console.log('📊 ==========================================');
  }

  async showHelp() {
    console.log(`
🔧 Script de Configuración del Sistema de Reportes Automáticos

Uso:
  node scripts/setup-report-system.js

Este script:
1. Verifica las dependencias necesarias
2. Crea directorios para reportes y logs
3. Verifica la configuración de email
4. Instala dependencias faltantes
5. Ejecuta pruebas del sistema
6. Muestra un resumen de la configuración

Requisitos previos:
1. Tener Node.js instalado
2. Tener configurado el archivo .env con las variables de email
3. Tener acceso a la base de datos

Para configurar el archivo .env:
1. Copia env.reports.example como .env
2. Configura las variables de email SMTP
3. Configura los destinatarios de los reportes
4. Ejecuta este script

Ejemplo de configuración Gmail:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación
REPORT_EMAIL_1=gerente@empresa.com
    `);
  }
}

// Función principal
async function main() {
  const setup = new ReportSystemSetup();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    await setup.showHelp();
  } else {
    await setup.run();
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error en configuración:', error);
    process.exit(1);
  });
}

module.exports = ReportSystemSetup; 