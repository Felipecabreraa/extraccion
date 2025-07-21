const MigracionMySQL = require('./migracion-mysql');
const fs = require('fs').promises;
const path = require('path');

// Configuración de las bases de datos
const configBDAnterior = {
    host: 'localhost',           // Cambiar por IP/host de BD anterior
    user: 'usuario_anterior',    // Usuario de BD anterior
    password: 'password_anterior', // Password de BD anterior
    database: 'bd_anterior',     // Nombre de BD anterior
    port: 3306
};

const configBDNueva = {
    host: 'localhost',           // Host de nueva BD
    user: 'extraccion_user',     // Usuario de nueva BD
    password: 'TuPasswordSeguro123!', // Password de nueva BD
    database: 'extraccion_prod', // Nombre de nueva BD
    port: 3306
};

// Mapeo de campos entre sistemas (ajustar según tu estructura)
const mapeoCampos = {
    // Ejemplo: campo_nuevo: 'campo_viejo'
    'usuarios': {
        'id': 'id',
        'nombre': 'nombre',
        'email': 'email',
        'password': 'password',
        'rol': 'rol',
        'created_at': 'fecha_creacion',
        'updated_at': 'fecha_actualizacion'
    },
    'planillas': {
        'id': 'id',
        'fecha': 'fecha',
        'operador_id': 'id_operador',
        'maquina_id': 'id_maquina',
        'pabellon_id': 'id_pabellon',
        'estado': 'estado',
        'created_at': 'fecha_creacion'
    },
    'maquinas': {
        'id': 'id',
        'codigo': 'codigo',
        'nombre': 'nombre',
        'tipo': 'tipo',
        'estado': 'estado',
        'created_at': 'fecha_creacion'
    },
    'operadores': {
        'id': 'id',
        'nombre': 'nombre',
        'apellido': 'apellido',
        'rut': 'rut',
        'telefono': 'telefono',
        'email': 'email',
        'estado': 'estado',
        'created_at': 'fecha_creacion'
    },
    'pabellones': {
        'id': 'id',
        'nombre': 'nombre',
        'sector_id': 'id_sector',
        'estado': 'estado',
        'created_at': 'fecha_creacion'
    },
    'sectores': {
        'id': 'id',
        'nombre': 'nombre',
        'zona_id': 'id_zona',
        'estado': 'estado',
        'created_at': 'fecha_creacion'
    },
    'barredores': {
        'id': 'id',
        'codigo': 'codigo',
        'nombre': 'nombre',
        'tipo': 'tipo',
        'estado': 'estado',
        'created_at': 'fecha_creacion'
    }
};

// Orden de migración (importante para mantener integridad referencial)
const ordenMigracion = [
    'sectores',      // Primero las tablas padre
    'pabellones',    // Luego las que dependen
    'usuarios',      // Usuarios independientes
    'operadores',    // Operadores independientes
    'maquinas',      // Máquinas independientes
    'barredores',    // Barredores independientes
    'planillas'      // Al final las que dependen de otras
];

async function ejecutarMigracion() {
    const migracion = new MigracionMySQL();
    
    try {
        console.log('🚀 Iniciando proceso de migración...');
        
        // 1. Conectar a ambas bases de datos
        console.log('🔌 Conectando a bases de datos...');
        const conexionAnterior = await migracion.conectarBDAnterior(configBDAnterior);
        const conexionNueva = await migracion.conectarBDNueva(configBDNueva);
        
        if (!conexionAnterior || !conexionNueva) {
            throw new Error('No se pudo conectar a las bases de datos');
        }
        
        // 2. Obtener lista de tablas de la BD anterior
        console.log('📋 Analizando estructura de BD anterior...');
        const tablas = await migracion.obtenerTablas();
        
        if (tablas.length === 0) {
            throw new Error('No se encontraron tablas en la BD anterior');
        }
        
        // 3. Crear backup antes de migrar
        console.log('💾 Creando backup de BD anterior...');
        await crearBackup(configBDAnterior);
        
        // 4. Ejecutar migración en orden
        console.log('🔄 Iniciando migración de datos...');
        
        for (const tabla of ordenMigracion) {
            if (tablas.includes(tabla)) {
                console.log(`\n📊 Migrando tabla: ${tabla}`);
                
                // Obtener mapeo específico para esta tabla
                const mapeoEspecifico = mapeoCampos[tabla] || null;
                
                // Migrar tabla
                const resultado = await migracion.migrarTabla(tabla, mapeoEspecifico);
                
                if (resultado.success) {
                    console.log(`✅ ${tabla}: ${resultado.migrados} registros migrados`);
                    
                    // Validar migración
                    const validacion = await migracion.validarMigracion(tabla);
                    if (!validacion) {
                        console.log(`⚠️ Advertencia: Validación falló para ${tabla}`);
                    }
                } else {
                    console.log(`❌ Error migrando ${tabla}`);
                }
            } else {
                console.log(`⚠️ Tabla ${tabla} no encontrada en BD anterior`);
            }
        }
        
        // 5. Generar reporte final
        console.log('\n📊 Generando reporte final...');
        const reporte = await migracion.generarReporte();
        
        // 6. Guardar reporte en archivo
        const reporteFile = path.join(__dirname, '../logs/reporte-migracion.txt');
        await fs.writeFile(reporteFile, reporte);
        
        console.log('\n🎉 ¡Migración completada!');
        console.log(`📄 Reporte guardado en: ${reporteFile}`);
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        await migracion.log(`❌ ERROR CRÍTICO: ${error.message}`);
    } finally {
        // Cerrar conexiones
        await migracion.cerrarConexiones();
    }
}

// Función para crear backup
async function crearBackup(config) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(__dirname, `../backups/backup_antes_migracion_${timestamp}.sql`);
    
    try {
        // Crear directorio de backups si no existe
        await fs.mkdir(path.dirname(backupFile), { recursive: true });
        
        // Comando para crear backup (requiere mysqldump instalado)
        const { exec } = require('child_process');
        const comando = `mysqldump -h ${config.host} -u ${config.user} -p${config.password} ${config.database} > ${backupFile}`;
        
        return new Promise((resolve, reject) => {
            exec(comando, (error, stdout, stderr) => {
                if (error) {
                    console.log(`⚠️ No se pudo crear backup automático: ${error.message}`);
                    console.log('💡 Backup manual recomendado antes de continuar');
                    resolve();
                } else {
                    console.log(`✅ Backup creado: ${backupFile}`);
                    resolve();
                }
            });
        });
    } catch (error) {
        console.log(`⚠️ Error creando backup: ${error.message}`);
    }
}

// Función para validar configuración
function validarConfiguracion() {
    console.log('🔍 Validando configuración...');
    
    const errores = [];
    
    if (!configBDAnterior.host || !configBDAnterior.user || !configBDAnterior.password || !configBDAnterior.database) {
        errores.push('Configuración de BD anterior incompleta');
    }
    
    if (!configBDNueva.host || !configBDNueva.user || !configBDNueva.password || !configBDNueva.database) {
        errores.push('Configuración de BD nueva incompleta');
    }
    
    if (errores.length > 0) {
        console.error('❌ Errores de configuración:');
        errores.forEach(error => console.error(`   - ${error}`));
        return false;
    }
    
    console.log('✅ Configuración válida');
    return true;
}

// Función principal
async function main() {
    console.log('📊 SISTEMA DE MIGRACIÓN DE DATOS');
    console.log('================================');
    
    // Validar configuración
    if (!validarConfiguracion()) {
        console.log('\n❌ Corrige los errores de configuración antes de continuar');
        process.exit(1);
    }
    
    // Confirmar ejecución
    console.log('\n⚠️ ADVERTENCIA: Este proceso migrará datos de la BD anterior a la nueva.');
    console.log('   Asegúrate de tener un backup antes de continuar.');
    console.log('\nConfiguración:');
    console.log(`   BD Anterior: ${configBDAnterior.database} en ${configBDAnterior.host}`);
    console.log(`   BD Nueva: ${configBDNueva.database} en ${configBDNueva.host}`);
    
    // Aquí podrías agregar una confirmación interactiva
    // const readline = require('readline');
    // const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    // const respuesta = await new Promise(resolve => rl.question('\n¿Continuar con la migración? (s/N): ', resolve));
    // rl.close();
    
    // if (respuesta.toLowerCase() !== 's' && respuesta.toLowerCase() !== 'si') {
    //     console.log('❌ Migración cancelada');
    //     process.exit(0);
    // }
    
    // Ejecutar migración
    await ejecutarMigracion();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { ejecutarMigracion, validarConfiguracion }; 