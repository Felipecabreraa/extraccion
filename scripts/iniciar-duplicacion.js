#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Crear interfaz de lectura
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para hacer pregunta
function pregunta(pregunta) {
    return new Promise((resolve) => {
        rl.question(pregunta, resolve);
    });
}

// Función para validar IP
function validarIP(ip) {
    const regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!regex.test(ip)) return false;
    
    const octetos = ip.split('.');
    return octetos.every(octeto => {
        const num = parseInt(octeto);
        return num >= 0 && num <= 255;
    });
}

// Función para validar puerto
function validarPuerto(puerto) {
    const num = parseInt(puerto);
    return num >= 1 && num <= 65535;
}

// Función principal
async function iniciarDuplicacion() {
    console.log('🔄 CONFIGURADOR DE DUPLICACIÓN DE BASE DE DATOS');
    console.log('================================================');
    console.log('Este script te ayudará a configurar la duplicación de tu BD anterior.\n');
    
    try {
        // 1. Obtener información de la BD original
        console.log('📊 CONFIGURACIÓN DE BASE DE DATOS ORIGINAL');
        console.log('==========================================');
        
        const hostOriginal = await pregunta('Host/IP de la BD original (ej: 192.168.1.100): ');
        if (!validarIP(hostOriginal) && hostOriginal !== 'localhost') {
            throw new Error('IP inválida. Debe ser una IP válida o "localhost"');
        }
        
        const puertoOriginal = await pregunta('Puerto de la BD original (default: 3306): ') || '3306';
        if (!validarPuerto(puertoOriginal)) {
            throw new Error('Puerto inválido. Debe estar entre 1 y 65535');
        }
        
        const usuarioOriginal = await pregunta('Usuario de la BD original: ');
        if (!usuarioOriginal.trim()) {
            throw new Error('El usuario no puede estar vacío');
        }
        
        const passwordOriginal = await pregunta('Password de la BD original: ');
        if (!passwordOriginal.trim()) {
            throw new Error('El password no puede estar vacío');
        }
        
        const databaseOriginal = await pregunta('Nombre de la BD original: ');
        if (!databaseOriginal.trim()) {
            throw new Error('El nombre de la BD no puede estar vacío');
        }
        
        // 2. Obtener información de la BD de trabajo
        console.log('\n📊 CONFIGURACIÓN DE BASE DE DATOS DE TRABAJO');
        console.log('=============================================');
        
        const hostTrabajo = await pregunta('Host de la BD de trabajo (default: localhost): ') || 'localhost';
        const puertoTrabajo = await pregunta('Puerto de la BD de trabajo (default: 3306): ') || '3306';
        const usuarioTrabajo = await pregunta('Usuario de la BD de trabajo (default: extraccion_user): ') || 'extraccion_user';
        const passwordTrabajo = await pregunta('Password de la BD de trabajo: ') || 'TuPasswordSeguro123!';
        const databaseTrabajo = await pregunta('Nombre de la BD de trabajo (default: sistema_anterior_copia): ') || 'sistema_anterior_copia';
        
        // 3. Crear directorios necesarios
        console.log('\n📁 Creando directorios necesarios...');
        await fs.mkdir(path.join(__dirname, '../logs'), { recursive: true });
        await fs.mkdir(path.join(__dirname, '../backups'), { recursive: true });
        
        // 4. Actualizar configuración en duplicar-bd.js
        console.log('🔧 Actualizando configuración...');
        
        const duplicarBDContent = await fs.readFile(path.join(__dirname, 'duplicar-bd.js'), 'utf8');
        
        const nuevaConfigOriginal = `const configBDOriginal = {
    host: '${hostOriginal}',
    user: '${usuarioOriginal}',
    password: '${passwordOriginal}',
    database: '${databaseOriginal}',
    port: ${puertoOriginal}
};`;
        
        const nuevaConfigTrabajo = `const configBDTrabajo = {
    host: '${hostTrabajo}',
    user: '${usuarioTrabajo}',
    password: '${passwordTrabajo}',
    database: '${databaseTrabajo}',
    port: ${puertoTrabajo}
};`;
        
        // Reemplazar configuraciones
        let nuevoContenido = duplicarBDContent
            .replace(/const configBDOriginal = \{[\s\S]*?\};/, nuevaConfigOriginal)
            .replace(/const configBDTrabajo = \{[\s\S]*?\};/, nuevaConfigTrabajo);
        
        await fs.writeFile(path.join(__dirname, 'duplicar-bd.js'), nuevoContenido);
        
        // 5. Actualizar configuración en migracion-bd-trabajo.js
        console.log('🔧 Actualizando configuración de migración...');
        
        const migracionContent = await fs.readFile(path.join(__dirname, 'migracion-bd-trabajo.js'), 'utf8');
        
        const nuevaConfigNueva = `const configBDNueva = {
    host: '${hostTrabajo}',
    user: '${usuarioTrabajo}',
    password: '${passwordTrabajo}',
    database: 'extraccion_prod',
    port: ${puertoTrabajo}
};`;
        
        nuevoContenido = migracionContent
            .replace(/const configBDNueva = \{[\s\S]*?\};/, nuevaConfigNueva);
        
        await fs.writeFile(path.join(__dirname, 'migracion-bd-trabajo.js'), nuevoContenido);
        
        // 6. Crear archivo de configuración
        const configuracion = {
            fecha: new Date().toISOString(),
            bdOriginal: {
                host: hostOriginal,
                user: usuarioOriginal,
                database: databaseOriginal,
                port: parseInt(puertoOriginal)
            },
            bdTrabajo: {
                host: hostTrabajo,
                user: usuarioTrabajo,
                database: databaseTrabajo,
                port: parseInt(puertoTrabajo)
            },
            bdNueva: {
                host: hostTrabajo,
                user: usuarioTrabajo,
                database: 'extraccion_prod',
                port: parseInt(puertoTrabajo)
            }
        };
        
        await fs.writeFile(
            path.join(__dirname, '../logs/configuracion-duplicacion.json'),
            JSON.stringify(configuracion, null, 2)
        );
        
        // 7. Mostrar resumen
        console.log('\n✅ CONFIGURACIÓN COMPLETADA');
        console.log('===========================');
        console.log('\n📊 RESUMEN DE CONFIGURACIÓN:');
        console.log(`BD Original: ${hostOriginal}:${puertoOriginal}/${databaseOriginal}`);
        console.log(`BD Trabajo: ${hostTrabajo}:${puertoTrabajo}/${databaseTrabajo}`);
        console.log(`BD Nueva: ${hostTrabajo}:${puertoTrabajo}/extraccion_prod`);
        
        console.log('\n📁 Archivos actualizados:');
        console.log('- scripts/duplicar-bd.js');
        console.log('- scripts/migracion-bd-trabajo.js');
        console.log('- logs/configuracion-duplicacion.json');
        
        // 8. Preguntar si quiere ejecutar duplicación
        const ejecutar = await pregunta('\n¿Quieres ejecutar la duplicación ahora? (s/n): ');
        
        if (ejecutar.toLowerCase() === 's' || ejecutar.toLowerCase() === 'si') {
            console.log('\n🚀 INICIANDO DUPLICACIÓN...');
            console.log('==========================');
            
            // Importar y ejecutar duplicación
            const { duplicarBaseDatos } = require('./duplicar-bd');
            await duplicarBaseDatos();
            
        } else {
            console.log('\n💡 PRÓXIMOS PASOS:');
            console.log('1. Verificar la configuración en los archivos');
            console.log('2. Ejecutar: node scripts/duplicar-bd.js');
            console.log('3. Analizar: node scripts/migracion-bd-trabajo.js analizar');
            console.log('4. Migrar: node scripts/migracion-bd-trabajo.js migrar');
        }
        
    } catch (error) {
        console.error('\n❌ Error durante la configuración:', error.message);
        console.log('\n💡 Verifica que:');
        console.log('- Los datos ingresados sean correctos');
        console.log('- Tengas permisos para escribir archivos');
        console.log('- La conexión a la BD original sea posible');
    } finally {
        rl.close();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    iniciarDuplicacion().catch(console.error);
}

module.exports = { iniciarDuplicacion }; 