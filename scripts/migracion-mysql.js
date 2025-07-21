const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');

// Configuración de logging
const logFile = path.join(__dirname, '../logs/migracion.log');

class MigracionMySQL {
    constructor() {
        this.connectionOld = null;
        this.connectionNew = null;
        this.stats = {
            total: 0,
            migrados: 0,
            errores: 0,
            inicio: new Date()
        };
    }

    // Configurar conexión a la base de datos antigua
    async conectarBDAnterior(config) {
        try {
            this.connectionOld = await mysql.createConnection({
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database,
                port: config.port || 3306
            });
            
            await this.log(`✅ Conectado a BD anterior: ${config.database}`);
            return true;
        } catch (error) {
            await this.log(`❌ Error conectando a BD anterior: ${error.message}`);
            return false;
        }
    }

    // Configurar conexión a la nueva base de datos
    async conectarBDNueva(config) {
        try {
            this.connectionNew = new Sequelize(
                config.database,
                config.user,
                config.password,
                {
                    host: config.host,
                    dialect: 'mysql',
                    port: config.port || 3306,
                    logging: false
                }
            );
            
            await this.connectionNew.authenticate();
            await this.log(`✅ Conectado a BD nueva: ${config.database}`);
            return true;
        } catch (error) {
            await this.log(`❌ Error conectando a BD nueva: ${error.message}`);
            return false;
        }
    }

    // Función de logging
    async log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage);
        
        try {
            await fs.appendFile(logFile, logMessage + '\n');
        } catch (error) {
            console.error('Error escribiendo log:', error.message);
        }
    }

    // Obtener lista de tablas de la BD anterior
    async obtenerTablas() {
        try {
            const [rows] = await this.connectionOld.execute('SHOW TABLES');
            const tablas = rows.map(row => Object.values(row)[0]);
            await this.log(`📋 Tablas encontradas: ${tablas.join(', ')}`);
            return tablas;
        } catch (error) {
            await this.log(`❌ Error obteniendo tablas: ${error.message}`);
            return [];
        }
    }

    // Obtener estructura de una tabla
    async obtenerEstructura(tabla) {
        try {
            const [rows] = await this.connectionOld.execute(`DESCRIBE ${tabla}`);
            await this.log(`📊 Estructura de ${tabla}: ${rows.length} campos`);
            return rows;
        } catch (error) {
            await this.log(`❌ Error obteniendo estructura de ${tabla}: ${error.message}`);
            return [];
        }
    }

    // Contar registros en una tabla
    async contarRegistros(tabla) {
        try {
            const [rows] = await this.connectionOld.execute(`SELECT COUNT(*) as total FROM ${tabla}`);
            const total = rows[0].total;
            await this.log(`📈 ${tabla}: ${total} registros`);
            return total;
        } catch (error) {
            await this.log(`❌ Error contando registros de ${tabla}: ${error.message}`);
            return 0;
        }
    }

    // Migrar tabla específica
    async migrarTabla(tabla, mapeoCampos = null) {
        try {
            await this.log(`🔄 Iniciando migración de tabla: ${tabla}`);
            
            // Contar registros totales
            const totalRegistros = await this.contarRegistros(tabla);
            this.stats.total += totalRegistros;
            
            if (totalRegistros === 0) {
                await this.log(`⚠️ Tabla ${tabla} está vacía, saltando...`);
                return { success: true, migrados: 0 };
            }

            // Obtener datos en lotes para evitar problemas de memoria
            const batchSize = 1000;
            let offset = 0;
            let migrados = 0;
            let errores = 0;

            while (offset < totalRegistros) {
                try {
                    // Obtener lote de datos
                    const [rows] = await this.connectionOld.execute(
                        `SELECT * FROM ${tabla} LIMIT ${batchSize} OFFSET ${offset}`
                    );

                    if (rows.length === 0) break;

                    // Procesar cada registro
                    for (const row of rows) {
                        try {
                            // Aplicar mapeo de campos si existe
                            const datosProcesados = mapeoCampos ? this.mapearCampos(row, mapeoCampos) : row;
                            
                            // Insertar en nueva BD
                            await this.insertarEnNuevaBD(tabla, datosProcesados);
                            migrados++;
                            
                            // Mostrar progreso cada 100 registros
                            if (migrados % 100 === 0) {
                                await this.log(`📊 ${tabla}: ${migrados}/${totalRegistros} migrados`);
                            }
                        } catch (error) {
                            errores++;
                            await this.log(`❌ Error migrando registro en ${tabla}: ${error.message}`);
                        }
                    }

                    offset += batchSize;
                } catch (error) {
                    await this.log(`❌ Error en lote de ${tabla}: ${error.message}`);
                    break;
                }
            }

            this.stats.migrados += migrados;
            this.stats.errores += errores;

            await this.log(`✅ ${tabla}: ${migrados} migrados, ${errores} errores`);
            return { success: true, migrados, errores };

        } catch (error) {
            await this.log(`❌ Error migrando tabla ${tabla}: ${error.message}`);
            return { success: false, migrados: 0, errores: 1 };
        }
    }

    // Mapear campos entre sistemas
    mapearCampos(datos, mapeo) {
        const datosProcesados = {};
        
        for (const [campoNuevo, campoViejo] of Object.entries(mapeo)) {
            if (datos.hasOwnProperty(campoViejo)) {
                datosProcesados[campoNuevo] = datos[campoViejo];
            }
        }
        
        return datosProcesados;
    }

    // Insertar datos en la nueva BD
    async insertarEnNuevaBD(tabla, datos) {
        try {
            const campos = Object.keys(datos);
            const valores = Object.values(datos);
            const placeholders = campos.map(() => '?').join(', ');
            
            const query = `INSERT INTO ${tabla} (${campos.join(', ')}) VALUES (${placeholders})`;
            await this.connectionNew.query(query, { replacements: valores });
        } catch (error) {
            throw new Error(`Error insertando en ${tabla}: ${error.message}`);
        }
    }

    // Validar migración
    async validarMigracion(tabla) {
        try {
            // Contar registros en BD anterior
            const [oldCount] = await this.connectionOld.execute(`SELECT COUNT(*) as total FROM ${tabla}`);
            
            // Contar registros en BD nueva
            const [newCount] = await this.connectionNew.query(`SELECT COUNT(*) as total FROM ${tabla}`);
            
            const totalAnterior = oldCount[0].total;
            const totalNuevo = newCount[0].total;
            
            if (totalAnterior === totalNuevo) {
                await this.log(`✅ Validación ${tabla}: ${totalNuevo} registros (OK)`);
                return true;
            } else {
                await this.log(`❌ Validación ${tabla}: ${totalAnterior} → ${totalNuevo} registros (ERROR)`);
                return false;
            }
        } catch (error) {
            await this.log(`❌ Error validando ${tabla}: ${error.message}`);
            return false;
        }
    }

    // Generar reporte final
    async generarReporte() {
        const duracion = new Date() - this.stats.inicio;
        const minutos = Math.floor(duracion / 60000);
        const segundos = Math.floor((duracion % 60000) / 1000);

        const reporte = `
📊 REPORTE DE MIGRACIÓN
=======================
Fecha: ${new Date().toISOString()}
Duración: ${minutos}m ${segundos}s

📈 Estadísticas:
- Total registros: ${this.stats.total}
- Migrados exitosamente: ${this.stats.migrados}
- Errores: ${this.stats.errores}
- Tasa de éxito: ${((this.stats.migrados / this.stats.total) * 100).toFixed(2)}%

${this.stats.errores > 0 ? '⚠️ Se encontraron errores. Revisar logs para detalles.' : '✅ Migración completada exitosamente.'}
        `;

        await this.log(reporte);
        return reporte;
    }

    // Cerrar conexiones
    async cerrarConexiones() {
        if (this.connectionOld) {
            await this.connectionOld.end();
        }
        if (this.connectionNew) {
            await this.connectionNew.close();
        }
        await this.log('🔌 Conexiones cerradas');
    }
}

module.exports = MigracionMySQL; 