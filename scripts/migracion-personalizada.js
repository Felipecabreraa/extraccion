const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

// Configuración de logging
const logFile = path.join(__dirname, '../logs/migracion-personalizada.log');

class MigracionPersonalizada {
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

    // Analizar estructura de la BD anterior
    async analizarEstructuraAnterior() {
        try {
            await this.log('🔍 Analizando estructura de BD anterior...');
            
            // Obtener todas las tablas
            const [tablas] = await this.connectionOld.execute('SHOW TABLES');
            const nombresTablas = tablas.map(row => Object.values(row)[0]);
            
            await this.log(`📋 Tablas encontradas: ${nombresTablas.join(', ')}`);
            
            // Analizar estructura de cada tabla
            const estructura = {};
            for (const tabla of nombresTablas) {
                const [campos] = await this.connectionOld.execute(`DESCRIBE ${tabla}`);
                const [conteo] = await this.connectionOld.execute(`SELECT COUNT(*) as total FROM ${tabla}`);
                
                estructura[tabla] = {
                    campos: campos,
                    totalRegistros: conteo[0].total,
                    muestra: await this.obtenerMuestraDatos(tabla)
                };
                
                await this.log(`📊 ${tabla}: ${campos.length} campos, ${conteo[0].total} registros`);
            }
            
            // Guardar análisis en archivo
            await fs.writeFile(
                path.join(__dirname, '../logs/analisis-estructura.json'),
                JSON.stringify(estructura, null, 2)
            );
            
            await this.log('✅ Análisis de estructura guardado en logs/analisis-estructura.json');
            return estructura;
            
        } catch (error) {
            await this.log(`❌ Error analizando estructura: ${error.message}`);
            return {};
        }
    }

    // Obtener muestra de datos de una tabla
    async obtenerMuestraDatos(tabla, limite = 5) {
        try {
            const [rows] = await this.connectionOld.execute(`SELECT * FROM ${tabla} LIMIT ${limite}`);
            return rows;
        } catch (error) {
            await this.log(`❌ Error obteniendo muestra de ${tabla}: ${error.message}`);
            return [];
        }
    }

    // Crear usuarios por defecto basados en datos existentes
    async crearUsuariosPorDefecto() {
        try {
            await this.log('👥 Creando usuarios por defecto...');
            
            // Crear usuario administrador
            const adminPassword = await bcrypt.hash('admin123', 12);
            await this.connectionNew.query(`
                INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at) 
                VALUES (?, ?, ?, ?, NOW(), NOW())
            `, {
                replacements: ['Administrador', 'admin@sistema.com', adminPassword, 'admin']
            });
            
            // Crear usuario operador
            const operadorPassword = await bcrypt.hash('operador123', 12);
            await this.connectionNew.query(`
                INSERT INTO usuarios (nombre, email, password, rol, created_at, updated_at) 
                VALUES (?, ?, ?, ?, NOW(), NOW())
            `, {
                replacements: ['Operador', 'operador@sistema.com', operadorPassword, 'operador']
            });
            
            await this.log('✅ Usuarios por defecto creados');
            
        } catch (error) {
            await this.log(`❌ Error creando usuarios: ${error.message}`);
        }
    }

    // Migrar datos con transformación personalizada
    async migrarDatosPersonalizados(configuracion) {
        try {
            await this.log('🔄 Iniciando migración personalizada...');
            
            // Crear usuarios por defecto primero
            await this.crearUsuariosPorDefecto();
            
            // Ejecutar cada transformación configurada
            for (const transformacion of configuracion) {
                await this.ejecutarTransformacion(transformacion);
            }
            
        } catch (error) {
            await this.log(`❌ Error en migración personalizada: ${error.message}`);
        }
    }

    // Ejecutar una transformación específica
    async ejecutarTransformacion(transformacion) {
        try {
            await this.log(`🔄 Ejecutando transformación: ${transformacion.nombre}`);
            
            const { tablaOrigen, tablaDestino, mapeo, transformaciones } = transformacion;
            
            // Obtener datos de la tabla origen
            const [datos] = await this.connectionOld.execute(`SELECT * FROM ${tablaOrigen}`);
            
            await this.log(`📊 ${tablaOrigen}: ${datos.length} registros a procesar`);
            
            let migrados = 0;
            let errores = 0;
            
            for (const registro of datos) {
                try {
                    // Aplicar mapeo de campos
                    const datosMapeados = this.aplicarMapeo(registro, mapeo);
                    
                    // Aplicar transformaciones personalizadas
                    const datosTransformados = await this.aplicarTransformaciones(
                        datosMapeados, 
                        transformaciones
                    );
                    
                    // Insertar en tabla destino
                    await this.insertarEnTablaDestino(tablaDestino, datosTransformados);
                    migrados++;
                    
                    // Mostrar progreso
                    if (migrados % 100 === 0) {
                        await this.log(`📊 ${transformacion.nombre}: ${migrados}/${datos.length} procesados`);
                    }
                    
                } catch (error) {
                    errores++;
                    await this.log(`❌ Error procesando registro en ${transformacion.nombre}: ${error.message}`);
                }
            }
            
            this.stats.migrados += migrados;
            this.stats.errores += errores;
            
            await this.log(`✅ ${transformacion.nombre}: ${migrados} migrados, ${errores} errores`);
            
        } catch (error) {
            await this.log(`❌ Error en transformación ${transformacion.nombre}: ${error.message}`);
        }
    }

    // Aplicar mapeo de campos
    aplicarMapeo(datos, mapeo) {
        const datosMapeados = {};
        
        for (const [campoNuevo, campoViejo] of Object.entries(mapeo)) {
            if (datos.hasOwnProperty(campoViejo)) {
                datosMapeados[campoNuevo] = datos[campoViejo];
            }
        }
        
        return datosMapeados;
    }

    // Aplicar transformaciones personalizadas
    async aplicarTransformaciones(datos, transformaciones) {
        let datosTransformados = { ...datos };
        
        for (const transformacion of transformaciones || []) {
            switch (transformacion.tipo) {
                case 'concatenar':
                    datosTransformados[transformacion.campoDestino] = 
                        `${datosTransformados[transformacion.campo1]} ${datosTransformados[transformacion.campo2]}`;
                    break;
                    
                case 'formatear_fecha':
                    const fecha = new Date(datosTransformados[transformacion.campoOrigen]);
                    datosTransformados[transformacion.campoDestino] = fecha.toISOString();
                    break;
                    
                case 'valor_por_defecto':
                    if (!datosTransformados[transformacion.campoDestino]) {
                        datosTransformados[transformacion.campoDestino] = transformacion.valor;
                    }
                    break;
                    
                case 'mapear_estado':
                    const mapeoEstados = transformacion.mapeo;
                    const estadoViejo = datosTransformados[transformacion.campoOrigen];
                    datosTransformados[transformacion.campoDestino] = mapeoEstados[estadoViejo] || 'activo';
                    break;
                    
                case 'generar_codigo':
                    datosTransformados[transformacion.campoDestino] = 
                        `${transformacion.prefijo}${datosTransformados[transformacion.campoOrigen]}`;
                    break;
            }
        }
        
        return datosTransformados;
    }

    // Insertar en tabla destino
    async insertarEnTablaDestino(tabla, datos) {
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

    // Generar reporte final
    async generarReporte() {
        const duracion = new Date() - this.stats.inicio;
        const minutos = Math.floor(duracion / 60000);
        const segundos = Math.floor((duracion % 60000) / 1000);

        const reporte = `
📊 REPORTE DE MIGRACIÓN PERSONALIZADA
=====================================
Fecha: ${new Date().toISOString()}
Duración: ${minutos}m ${segundos}s

📈 Estadísticas:
- Total registros procesados: ${this.stats.total}
- Migrados exitosamente: ${this.stats.migrados}
- Errores: ${this.stats.errores}
- Tasa de éxito: ${((this.stats.migrados / this.stats.total) * 100).toFixed(2)}%

🔧 Transformaciones realizadas:
- Usuarios por defecto creados
- Datos migrados con transformaciones personalizadas
- Estructura adaptada al nuevo sistema

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

module.exports = MigracionPersonalizada; 