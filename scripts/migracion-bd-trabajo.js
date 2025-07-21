const MigracionPersonalizada = require('./migracion-personalizada');
const { configBDTrabajo } = require('./duplicar-bd');
const fs = require('fs').promises;
const path = require('path');

// Configuración de la nueva base de datos (sistema final)
const configBDNueva = {
    host: 'localhost',           // Host de nueva BD
    user: 'extraccion_user',     // Usuario de nueva BD
    password: 'TuPasswordSeguro123!', // Password de nueva BD
    database: 'extraccion_prod', // Nombre de nueva BD
    port: 3306
};

// Configuración de transformaciones para BD de trabajo
// AJUSTAR SEGÚN LA ESTRUCTURA REAL DE TU BD DUPLICADA
const configuracionTransformaciones = [
    {
        nombre: 'Migrar Personal/Empleados a Operadores',
        tablaOrigen: 'empleados', // Cambiar por el nombre real de tu tabla
        tablaDestino: 'operadores',
        mapeo: {
            'id': 'id_empleado',
            'nombre': 'nombre_empleado',
            'apellido': 'apellido_empleado',
            'rut': 'rut_empleado',
            'telefono': 'telefono_empleado',
            'email': 'email_empleado',
            'estado': 'estado_empleado',
            'created_at': 'fecha_ingreso'
        },
        transformaciones: [
            {
                tipo: 'concatenar',
                campo1: 'nombre',
                campo2: 'apellido',
                campoDestino: 'nombre'
            },
            {
                tipo: 'valor_por_defecto',
                campoDestino: 'estado',
                valor: 'activo'
            },
            {
                tipo: 'formatear_fecha',
                campoOrigen: 'created_at',
                campoDestino: 'created_at'
            }
        ]
    },
    {
        nombre: 'Migrar Equipos/Máquinas',
        tablaOrigen: 'equipos', // Cambiar por el nombre real de tu tabla
        tablaDestino: 'maquinas',
        mapeo: {
            'id': 'id_equipo',
            'codigo': 'codigo_equipo',
            'nombre': 'nombre_equipo',
            'tipo': 'tipo_equipo',
            'estado': 'estado_equipo',
            'created_at': 'fecha_adquisicion'
        },
        transformaciones: [
            {
                tipo: 'generar_codigo',
                campoOrigen: 'codigo',
                campoDestino: 'codigo',
                prefijo: 'MAQ-'
            },
            {
                tipo: 'valor_por_defecto',
                campoDestino: 'estado',
                valor: 'activo'
            }
        ]
    },
    {
        nombre: 'Migrar Áreas/Zonas a Sectores',
        tablaOrigen: 'areas', // Cambiar por el nombre real de tu tabla
        tablaDestino: 'sectores',
        mapeo: {
            'id': 'id_area',
            'nombre': 'nombre_area',
            'zona_id': 'id_zona',
            'estado': 'estado_area',
            'created_at': 'fecha_creacion'
        },
        transformaciones: [
            {
                tipo: 'valor_por_defecto',
                campoDestino: 'estado',
                valor: 'activo'
            }
        ]
    },
    {
        nombre: 'Migrar Ubicaciones a Pabellones',
        tablaOrigen: 'ubicaciones', // Cambiar por el nombre real de tu tabla
        tablaDestino: 'pabellones',
        mapeo: {
            'id': 'id_ubicacion',
            'nombre': 'nombre_ubicacion',
            'sector_id': 'id_area',
            'estado': 'estado_ubicacion',
            'created_at': 'fecha_creacion'
        },
        transformaciones: [
            {
                tipo: 'valor_por_defecto',
                campoDestino: 'estado',
                valor: 'activo'
            }
        ]
    },
    {
        nombre: 'Migrar Herramientas a Barredores',
        tablaOrigen: 'herramientas', // Cambiar por el nombre real de tu tabla
        tablaDestino: 'barredores',
        mapeo: {
            'id': 'id_herramienta',
            'codigo': 'codigo_herramienta',
            'nombre': 'nombre_herramienta',
            'tipo': 'tipo_herramienta',
            'estado': 'estado_herramienta',
            'created_at': 'fecha_adquisicion'
        },
        transformaciones: [
            {
                tipo: 'generar_codigo',
                campoOrigen: 'codigo',
                campoDestino: 'codigo',
                prefijo: 'BAR-'
            },
            {
                tipo: 'valor_por_defecto',
                campoDestino: 'estado',
                valor: 'activo'
            }
        ]
    },
    {
        nombre: 'Migrar Registros de Trabajo a Planillas',
        tablaOrigen: 'registros_trabajo', // Cambiar por el nombre real de tu tabla
        tablaDestino: 'planillas',
        mapeo: {
            'id': 'id_registro',
            'fecha': 'fecha_trabajo',
            'operador_id': 'id_empleado',
            'maquina_id': 'id_equipo',
            'pabellon_id': 'id_ubicacion',
            'estado': 'estado_registro',
            'created_at': 'fecha_creacion'
        },
        transformaciones: [
            {
                tipo: 'formatear_fecha',
                campoOrigen: 'fecha',
                campoDestino: 'fecha'
            },
            {
                tipo: 'valor_por_defecto',
                campoDestino: 'estado',
                valor: 'completada'
            }
        ]
    }
];

async function analizarBDTrabajo() {
    const migracion = new MigracionPersonalizada();
    
    try {
        console.log('🔍 ANALIZANDO BD DE TRABAJO');
        console.log('===========================');
        console.log(`📊 BD de trabajo: ${configBDTrabajo.database}`);
        
        // Conectar a BD de trabajo
        const conexion = await migracion.conectarBDAnterior(configBDTrabajo);
        if (!conexion) {
            throw new Error('No se pudo conectar a la BD de trabajo');
        }
        
        // Analizar estructura
        const estructura = await migracion.analizarEstructuraAnterior();
        
        console.log('\n📊 RESUMEN DEL ANÁLISIS:');
        console.log('========================');
        
        for (const [tabla, info] of Object.entries(estructura)) {
            console.log(`\n📋 Tabla: ${tabla}`);
            console.log(`   Campos: ${info.campos.length}`);
            console.log(`   Registros: ${info.totalRegistros}`);
            console.log(`   Campos disponibles:`);
            
            info.campos.forEach(campo => {
                console.log(`     - ${campo.Field} (${campo.Type})`);
            });
            
            if (info.muestra.length > 0) {
                console.log(`   Muestra de datos:`);
                console.log(`     ${JSON.stringify(info.muestra[0], null, 2)}`);
            }
        }
        
        console.log('\n✅ Análisis completado. Revisa logs/analisis-estructura.json para más detalles.');
        console.log('\n💡 PRÓXIMOS PASOS:');
        console.log('1. Revisar la estructura real de las tablas');
        console.log('2. Ajustar configuracionTransformaciones en este archivo');
        console.log('3. Ejecutar migración de prueba');
        
    } catch (error) {
        console.error('❌ Error durante el análisis:', error.message);
    } finally {
        await migracion.cerrarConexiones();
    }
}

async function ejecutarMigracionPrueba() {
    const migracion = new MigracionPersonalizada();
    
    try {
        console.log('🚀 INICIANDO MIGRACIÓN DE PRUEBA');
        console.log('================================');
        console.log(`📊 Desde: ${configBDTrabajo.database} (BD de trabajo)`);
        console.log(`📊 Hacia: ${configBDNueva.database} (Nuevo sistema)`);
        
        // Conectar a ambas bases de datos
        const conexionTrabajo = await migracion.conectarBDAnterior(configBDTrabajo);
        const conexionNueva = await migracion.conectarBDNueva(configBDNueva);
        
        if (!conexionTrabajo || !conexionNueva) {
            throw new Error('No se pudo conectar a las bases de datos');
        }
        
        // Ejecutar migración personalizada
        await migracion.migrarDatosPersonalizados(configuracionTransformaciones);
        
        // Generar reporte final
        const reporte = await migracion.generarReporte();
        
        // Guardar reporte
        const reporteFile = path.join(__dirname, '../logs/reporte-migracion-prueba.txt');
        await fs.writeFile(reporteFile, reporte);
        
        console.log('\n🎉 ¡Migración de prueba completada!');
        console.log(`📄 Reporte guardado en: ${reporteFile}`);
        console.log('\n💡 PRÓXIMOS PASOS:');
        console.log('1. Verificar que los datos se migraron correctamente');
        console.log('2. Probar el nuevo sistema con los datos migrados');
        console.log('3. Si todo está bien, ejecutar migración final');
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        await migracion.log(`❌ ERROR CRÍTICO: ${error.message}`);
    } finally {
        await migracion.cerrarConexiones();
    }
}

async function limpiarBDNueva() {
    const migracion = new MigracionPersonalizada();
    
    try {
        console.log('🧹 LIMPIANDO BD NUEVA PARA PRUEBAS');
        console.log('==================================');
        
        // Conectar solo a BD nueva
        const conexion = await migracion.conectarBDNueva(configBDNueva);
        if (!conexion) {
            throw new Error('No se pudo conectar a la BD nueva');
        }
        
        // Lista de tablas a limpiar (en orden de dependencias)
        const tablas = [
            'planillas',
            'pabellones',
            'sectores',
            'operadores',
            'maquinas',
            'barredores',
            'usuarios'
        ];
        
        for (const tabla of tablas) {
            try {
                await migracion.connectionNew.query(`DELETE FROM ${tabla}`);
                await migracion.log(`✅ Tabla ${tabla} limpiada`);
            } catch (error) {
                await migracion.log(`⚠️ No se pudo limpiar ${tabla}: ${error.message}`);
            }
        }
        
        await migracion.log('✅ Limpieza completada');
        console.log('✅ BD nueva limpiada para nuevas pruebas');
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error.message);
    } finally {
        await migracion.cerrarConexiones();
    }
}

// Función principal
async function main() {
    const comando = process.argv[2];
    
    console.log('📊 SISTEMA DE MIGRACIÓN CON BD DE TRABAJO');
    console.log('==========================================');
    
    switch (comando) {
        case 'analizar':
            await analizarBDTrabajo();
            break;
            
        case 'migrar':
            await ejecutarMigracionPrueba();
            break;
            
        case 'limpiar':
            await limpiarBDNueva();
            break;
            
        default:
            console.log('\n📋 COMANDOS DISPONIBLES:');
            console.log('  analizar  - Analizar estructura de BD de trabajo');
            console.log('  migrar    - Ejecutar migración de prueba');
            console.log('  limpiar   - Limpiar BD nueva para nuevas pruebas');
            console.log('\n💡 USO: node scripts/migracion-bd-trabajo.js [comando]');
            console.log('\n🔧 FLUJO DE TRABAJO:');
            console.log('1. Primero duplicar BD: node scripts/duplicar-bd.js');
            console.log('2. Analizar estructura: node scripts/migracion-bd-trabajo.js analizar');
            console.log('3. Ajustar configuración según análisis');
            console.log('4. Probar migración: node scripts/migracion-bd-trabajo.js migrar');
            console.log('5. Si hay errores, limpiar y repetir: node scripts/migracion-bd-trabajo.js limpiar');
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    analizarBDTrabajo,
    ejecutarMigracionPrueba,
    limpiarBDNueva,
    configuracionTransformaciones
}; 