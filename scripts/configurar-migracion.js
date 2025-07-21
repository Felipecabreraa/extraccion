const MigracionPersonalizada = require('./migracion-personalizada');
const fs = require('fs').promises;
const path = require('path');

// Configuración de las bases de datos
const configBDAnterior = {
    host: 'localhost',           // Cambiar por IP/host de BD anterior
    user: 'usuario_anterior',    // Usuario de BD anterior
    password: 'password_anterior', // Password de BD anterior
    database: 'sistema_anterior', // Nombre de BD anterior
    port: 3306
};

const configBDNueva = {
    host: 'localhost',           // Host de nueva BD
    user: 'extraccion_user',     // Usuario de nueva BD
    password: 'TuPasswordSeguro123!', // Password de nueva BD
    database: 'extraccion_prod', // Nombre de nueva BD
    port: 3306
};

// Configuración de transformaciones personalizadas
// AJUSTAR SEGÚN LA ESTRUCTURA REAL DE TU SISTEMA ANTERIOR
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

async function analizarSistemaAnterior() {
    const migracion = new MigracionPersonalizada();
    
    try {
        console.log('🔍 ANALIZANDO SISTEMA ANTERIOR');
        console.log('==============================');
        
        // Conectar a BD anterior
        const conexion = await migracion.conectarBDAnterior(configBDAnterior);
        if (!conexion) {
            throw new Error('No se pudo conectar a la BD anterior');
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
        
    } catch (error) {
        console.error('❌ Error durante el análisis:', error.message);
    } finally {
        await migracion.cerrarConexiones();
    }
}

async function ejecutarMigracionPersonalizada() {
    const migracion = new MigracionPersonalizada();
    
    try {
        console.log('🚀 INICIANDO MIGRACIÓN PERSONALIZADA');
        console.log('===================================');
        
        // Conectar a ambas bases de datos
        const conexionAnterior = await migracion.conectarBDAnterior(configBDAnterior);
        const conexionNueva = await migracion.conectarBDNueva(configBDNueva);
        
        if (!conexionAnterior || !conexionNueva) {
            throw new Error('No se pudo conectar a las bases de datos');
        }
        
        // Ejecutar migración personalizada
        await migracion.migrarDatosPersonalizados(configuracionTransformaciones);
        
        // Generar reporte final
        const reporte = await migracion.generarReporte();
        
        // Guardar reporte
        const reporteFile = path.join(__dirname, '../logs/reporte-migracion-personalizada.txt');
        await fs.writeFile(reporteFile, reporte);
        
        console.log('\n🎉 ¡Migración personalizada completada!');
        console.log(`📄 Reporte guardado en: ${reporteFile}`);
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        await migracion.log(`❌ ERROR CRÍTICO: ${error.message}`);
    } finally {
        await migracion.cerrarConexiones();
    }
}

async function generarConfiguracionPersonalizada() {
    try {
        console.log('⚙️ GENERANDO CONFIGURACIÓN PERSONALIZADA');
        console.log('=======================================');
        
        // Crear archivo de configuración personalizada
        const configFile = path.join(__dirname, '../configuracion-migracion-personalizada.json');
        
        const configuracion = {
            fechaGeneracion: new Date().toISOString(),
            configuracionBD: {
                anterior: configBDAnterior,
                nueva: configBDNueva
            },
            transformaciones: configuracionTransformaciones,
            instrucciones: [
                "1. Revisar y ajustar los nombres de tablas en 'tablaOrigen'",
                "2. Verificar el mapeo de campos según tu estructura real",
                "3. Ajustar las transformaciones según tus necesidades",
                "4. Ejecutar primero el análisis para ver la estructura real",
                "5. Probar en ambiente de desarrollo antes de producción"
            ]
        };
        
        await fs.writeFile(configFile, JSON.stringify(configuracion, null, 2));
        
        console.log('✅ Configuración generada en: configuracion-migracion-personalizada.json');
        console.log('\n📋 PRÓXIMOS PASOS:');
        console.log('1. Revisar la configuración generada');
        console.log('2. Ajustar nombres de tablas y campos');
        console.log('3. Ejecutar análisis: node scripts/configurar-migracion.js analizar');
        console.log('4. Ejecutar migración: node scripts/configurar-migracion.js migrar');
        
    } catch (error) {
        console.error('❌ Error generando configuración:', error.message);
    }
}

// Función principal
async function main() {
    const comando = process.argv[2];
    
    console.log('📊 SISTEMA DE MIGRACIÓN PERSONALIZADA');
    console.log('=====================================');
    
    switch (comando) {
        case 'analizar':
            await analizarSistemaAnterior();
            break;
            
        case 'migrar':
            await ejecutarMigracionPersonalizada();
            break;
            
        case 'configurar':
            await generarConfiguracionPersonalizada();
            break;
            
        default:
            console.log('\n📋 COMANDOS DISPONIBLES:');
            console.log('  analizar    - Analizar estructura de BD anterior');
            console.log('  migrar      - Ejecutar migración personalizada');
            console.log('  configurar  - Generar archivo de configuración');
            console.log('\n💡 USO: node scripts/configurar-migracion.js [comando]');
            console.log('\n🔧 PRIMEROS PASOS:');
            console.log('1. Ajustar configuración de BD en este archivo');
            console.log('2. Ejecutar: node scripts/configurar-migracion.js configurar');
            console.log('3. Revisar y ajustar la configuración generada');
            console.log('4. Ejecutar: node scripts/configurar-migracion.js analizar');
            console.log('5. Ejecutar: node scripts/configurar-migracion.js migrar');
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    analizarSistemaAnterior,
    ejecutarMigracionPersonalizada,
    generarConfiguracionPersonalizada
}; 