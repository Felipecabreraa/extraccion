const mysql = require('mysql2/promise');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// Configuración de la base de datos original
const configBDOriginal = {
    host: 'localhost',           // Cambiar por IP/host de tu BD anterior
    user: 'usuario_anterior',    // Usuario de BD anterior
    password: 'password_anterior', // Password de BD anterior
    database: 'sistema_anterior', // Nombre de BD anterior
    port: 3306
};

// Configuración de la base de datos de trabajo
const configBDTrabajo = {
    host: 'localhost',           // Host de BD de trabajo
    user: 'extraccion_user',     // Usuario de BD de trabajo
    password: 'TuPasswordSeguro123!', // Password de BD de trabajo
    database: 'sistema_anterior_copia', // Nombre de BD copiada
    port: 3306
};

class DuplicadorBD {
    constructor() {
        this.connection = null;
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    }

    // Función de logging
    async log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        
        try {
            await fs.appendFile(path.join(__dirname, '../logs/duplicacion.log'), logMessage + '\n');
        } catch (error) {
            console.error('Error escribiendo log:', error.message);
        }
    }

    // Conectar a MySQL
    async conectar(config) {
        try {
            this.connection = await mysql.createConnection({
                host: config.host,
                user: config.user,
                password: config.password,
                port: config.port || 3306
            });
            
            await this.log(`✅ Conectado a MySQL en ${config.host}:${config.port}`);
            return true;
        } catch (error) {
            await this.log(`❌ Error conectando a MySQL: ${error.message}`);
            return false;
        }
    }

    // Verificar si la BD original existe
    async verificarBDOriginal() {
        try {
            const [rows] = await this.connection.execute(
                'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
                [configBDOriginal.database]
            );
            
            if (rows.length > 0) {
                await this.log(`✅ Base de datos original encontrada: ${configBDOriginal.database}`);
                return true;
            } else {
                await this.log(`❌ Base de datos original no encontrada: ${configBDOriginal.database}`);
                return false;
            }
        } catch (error) {
            await this.log(`❌ Error verificando BD original: ${error.message}`);
            return false;
        }
    }

    // Crear base de datos de trabajo
    async crearBDTrabajo() {
        try {
            await this.log(`🔄 Creando base de datos de trabajo: ${configBDTrabajo.database}`);
            
            await this.connection.execute(`DROP DATABASE IF EXISTS ${configBDTrabajo.database}`);
            await this.connection.execute(`CREATE DATABASE ${configBDTrabajo.database}`);
            
            await this.log(`✅ Base de datos de trabajo creada: ${configBDTrabajo.database}`);
            return true;
        } catch (error) {
            await this.log(`❌ Error creando BD de trabajo: ${error.message}`);
            return false;
        }
    }

    // Crear backup completo de la BD original
    async crearBackupCompleto() {
        try {
            const backupFile = path.join(__dirname, `../backups/backup_completo_${this.timestamp}.sql`);
            
            // Crear directorio de backups si no existe
            await fs.mkdir(path.dirname(backupFile), { recursive: true });
            
            await this.log(`💾 Creando backup completo: ${backupFile}`);
            
            const comando = `mysqldump -h ${configBDOriginal.host} -u ${configBDOriginal.user} -p${configBDOriginal.password} --port=${configBDOriginal.port} --single-transaction --routines --triggers ${configBDOriginal.database} > ${backupFile}`;
            
            return new Promise((resolve, reject) => {
                exec(comando, (error, stdout, stderr) => {
                    if (error) {
                        this.log(`❌ Error creando backup: ${error.message}`);
                        reject(error);
                    } else {
                        this.log(`✅ Backup completo creado: ${backupFile}`);
                        resolve(backupFile);
                    }
                });
            });
        } catch (error) {
            await this.log(`❌ Error en backup: ${error.message}`);
            throw error;
        }
    }

    // Restaurar backup en BD de trabajo
    async restaurarEnBDTrabajo(backupFile) {
        try {
            await this.log(`🔄 Restaurando backup en BD de trabajo...`);
            
            const comando = `mysql -h ${configBDTrabajo.host} -u ${configBDTrabajo.user} -p${configBDTrabajo.password} --port=${configBDTrabajo.port} ${configBDTrabajo.database} < ${backupFile}`;
            
            return new Promise((resolve, reject) => {
                exec(comando, (error, stdout, stderr) => {
                    if (error) {
                        this.log(`❌ Error restaurando backup: ${error.message}`);
                        reject(error);
                    } else {
                        this.log(`✅ Backup restaurado en BD de trabajo`);
                        resolve();
                    }
                });
            });
        } catch (error) {
            await this.log(`❌ Error restaurando: ${error.message}`);
            throw error;
        }
    }

    // Verificar duplicación
    async verificarDuplicacion() {
        try {
            await this.log(`🔍 Verificando duplicación...`);
            
            // Conectar a BD original
            const conexionOriginal = await mysql.createConnection({
                host: configBDOriginal.host,
                user: configBDOriginal.user,
                password: configBDOriginal.password,
                database: configBDOriginal.database,
                port: configBDOriginal.port
            });
            
            // Conectar a BD de trabajo
            const conexionTrabajo = await mysql.createConnection({
                host: configBDTrabajo.host,
                user: configBDTrabajo.user,
                password: configBDTrabajo.password,
                database: configBDTrabajo.database,
                port: configBDTrabajo.port
            });
            
            // Obtener tablas de BD original
            const [tablasOriginal] = await conexionOriginal.execute('SHOW TABLES');
            const nombresTablasOriginal = tablasOriginal.map(row => Object.values(row)[0]);
            
            // Obtener tablas de BD de trabajo
            const [tablasTrabajo] = await conexionTrabajo.execute('SHOW TABLES');
            const nombresTablasTrabajo = tablasTrabajo.map(row => Object.values(row)[0]);
            
            // Verificar que todas las tablas estén presentes
            const tablasFaltantes = nombresTablasOriginal.filter(tabla => !nombresTablasTrabajo.includes(tabla));
            
            if (tablasFaltantes.length > 0) {
                await this.log(`❌ Tablas faltantes en copia: ${tablasFaltantes.join(', ')}`);
                return false;
            }
            
            // Verificar conteo de registros
            for (const tabla of nombresTablasOriginal) {
                const [conteoOriginal] = await conexionOriginal.execute(`SELECT COUNT(*) as total FROM ${tabla}`);
                const [conteoTrabajo] = await conexionTrabajo.execute(`SELECT COUNT(*) as total FROM ${tabla}`);
                
                if (conteoOriginal[0].total !== conteoTrabajo[0].total) {
                    await this.log(`❌ Diferencia en tabla ${tabla}: ${conteoOriginal[0].total} vs ${conteoTrabajo[0].total}`);
                    return false;
                }
                
                await this.log(`✅ Tabla ${tabla}: ${conteoTrabajo[0].total} registros`);
            }
            
            await conexionOriginal.end();
            await conexionTrabajo.end();
            
            await this.log(`✅ Verificación completada - Duplicación exitosa`);
            return true;
            
        } catch (error) {
            await this.log(`❌ Error en verificación: ${error.message}`);
            return false;
        }
    }

    // Generar reporte de duplicación
    async generarReporteDuplicacion() {
        const reporte = `
📊 REPORTE DE DUPLICACIÓN DE BASE DE DATOS
==========================================
Fecha: ${new Date().toISOString()}
Timestamp: ${this.timestamp}

📋 Configuración:
- BD Original: ${configBDOriginal.database} en ${configBDOriginal.host}
- BD Trabajo: ${configBDTrabajo.database} en ${configBDTrabajo.host}

🔧 Proceso realizado:
1. ✅ Verificación de BD original
2. ✅ Creación de BD de trabajo
3. ✅ Backup completo de BD original
4. ✅ Restauración en BD de trabajo
5. ✅ Verificación de duplicación

📁 Archivos generados:
- Backup: backups/backup_completo_${this.timestamp}.sql
- Log: logs/duplicacion.log

🎯 Estado: DUPLICACIÓN COMPLETADA EXITOSAMENTE

⚠️ IMPORTANTE:
- La BD de trabajo está lista para pruebas de migración
- La BD original permanece intacta
- Usar configBDTrabajo para las pruebas de migración
        `;
        
        await this.log(reporte);
        
        // Guardar reporte en archivo
        const reporteFile = path.join(__dirname, `../logs/reporte-duplicacion-${this.timestamp}.txt`);
        await fs.writeFile(reporteFile, reporte);
        
        return reporte;
    }

    // Cerrar conexión
    async cerrarConexion() {
        if (this.connection) {
            await this.connection.end();
            await this.log('🔌 Conexión cerrada');
        }
    }
}

// Función principal de duplicación
async function duplicarBaseDatos() {
    const duplicador = new DuplicadorBD();
    
    try {
        console.log('🔄 INICIANDO DUPLICACIÓN DE BASE DE DATOS');
        console.log('==========================================');
        
        // 1. Conectar a MySQL
        const conexion = await duplicador.conectar(configBDOriginal);
        if (!conexion) {
            throw new Error('No se pudo conectar a MySQL');
        }
        
        // 2. Verificar BD original
        const bdExiste = await duplicador.verificarBDOriginal();
        if (!bdExiste) {
            throw new Error('La base de datos original no existe');
        }
        
        // 3. Crear BD de trabajo
        const bdCreada = await duplicador.crearBDTrabajo();
        if (!bdCreada) {
            throw new Error('No se pudo crear la BD de trabajo');
        }
        
        // 4. Crear backup completo
        const backupFile = await duplicador.crearBackupCompleto();
        
        // 5. Restaurar en BD de trabajo
        await duplicador.restaurarEnBDTrabajo(backupFile);
        
        // 6. Verificar duplicación
        const verificacion = await duplicador.verificarDuplicacion();
        if (!verificacion) {
            throw new Error('La verificación de duplicación falló');
        }
        
        // 7. Generar reporte
        const reporte = await duplicador.generarReporteDuplicacion();
        
        console.log('\n🎉 ¡DUPLICACIÓN COMPLETADA EXITOSAMENTE!');
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('1. Usar configBDTrabajo para las pruebas de migración');
        console.log('2. Ejecutar: node scripts/configurar-migracion.js analizar');
        console.log('3. Ajustar configuración según la estructura');
        console.log('4. Probar migración en la BD de trabajo');
        
    } catch (error) {
        console.error('❌ Error durante la duplicación:', error.message);
        await duplicador.log(`❌ ERROR CRÍTICO: ${error.message}`);
    } finally {
        await duplicador.cerrarConexion();
    }
}

// Exportar configuración para uso en otros scripts
module.exports = {
    configBDOriginal,
    configBDTrabajo,
    duplicarBaseDatos
};

// Ejecutar si es llamado directamente
if (require.main === module) {
    duplicarBaseDatos().catch(console.error);
} 