# 📊 Guía de Migración Personalizada - Sistemas Diferentes

## 🎯 Objetivo
Migrar datos de un sistema anterior completamente diferente (sin autenticación) al nuevo sistema de extracción.

## 🔍 Análisis del Problema

### Sistema Anterior (Sin Autenticación)
- ❌ No tiene sistema de usuarios/login
- ❌ Estructura de tablas diferente
- ❌ Nombres de campos diferentes
- ❌ Sin roles ni permisos
- ❌ Datos en formato diferente

### Nuevo Sistema
- ✅ Sistema de autenticación completo
- ✅ Estructura normalizada
- ✅ Roles y permisos
- ✅ Interfaz moderna

## 🚀 Solución: Migración Personalizada

### Características del Sistema
- **Análisis automático** de estructura anterior
- **Mapeo personalizable** de campos
- **Transformaciones inteligentes** de datos
- **Creación automática** de usuarios por defecto
- **Validación completa** post-migración

## 📋 Proceso de Migración

### Paso 1: Preparación
```bash
# Instalar dependencias
npm install mysql2 sequelize bcryptjs

# Crear directorios
mkdir -p logs backups
```

### Paso 2: Configurar Conexiones
Editar `scripts/configurar-migracion.js`:

```javascript
const configBDAnterior = {
    host: '192.168.1.100',        // IP de tu BD anterior
    user: 'usuario_anterior',      // Usuario de BD anterior
    password: 'password_anterior', // Password de BD anterior
    database: 'sistema_anterior',  // Nombre de BD anterior
    port: 3306
};
```

### Paso 3: Analizar Estructura Anterior
```bash
# Analizar automáticamente la estructura
node scripts/configurar-migracion.js analizar
```

**Esto generará:**
- `logs/analisis-estructura.json` - Estructura completa
- Información de todas las tablas y campos
- Muestras de datos reales

### Paso 4: Ajustar Configuración
Basándote en el análisis, ajustar en `scripts/configurar-migracion.js`:

```javascript
const configuracionTransformaciones = [
    {
        nombre: 'Migrar Personal a Operadores',
        tablaOrigen: 'trabajadores', // Nombre real de tu tabla
        tablaDestino: 'operadores',
        mapeo: {
            'id': 'id_trabajador',        // Campo real de tu BD
            'nombre': 'nombre_trabajador', // Campo real de tu BD
            'apellido': 'apellido_trabajador',
            'rut': 'rut_trabajador',
            'telefono': 'fono_trabajador',
            'email': 'email_trabajador'
        },
        transformaciones: [
            {
                tipo: 'concatenar',
                campo1: 'nombre',
                campo2: 'apellido',
                campoDestino: 'nombre'
            }
        ]
    }
];
```

### Paso 5: Ejecutar Migración
```bash
# Ejecutar migración personalizada
node scripts/configurar-migracion.js migrar
```

## 🔧 Tipos de Transformaciones Disponibles

### 1. Concatenar Campos
```javascript
{
    tipo: 'concatenar',
    campo1: 'nombre',
    campo2: 'apellido',
    campoDestino: 'nombre_completo'
}
```

### 2. Formatear Fechas
```javascript
{
    tipo: 'formatear_fecha',
    campoOrigen: 'fecha_ingreso',
    campoDestino: 'created_at'
}
```

### 3. Valores por Defecto
```javascript
{
    tipo: 'valor_por_defecto',
    campoDestino: 'estado',
    valor: 'activo'
}
```

### 4. Mapear Estados
```javascript
{
    tipo: 'mapear_estado',
    campoOrigen: 'estado_actual',
    campoDestino: 'estado',
    mapeo: {
        'ACTIVO': 'activo',
        'INACTIVO': 'inactivo',
        'SUSPENDIDO': 'suspendido'
    }
}
```

### 5. Generar Códigos
```javascript
{
    tipo: 'generar_codigo',
    campoOrigen: 'id',
    campoDestino: 'codigo',
    prefijo: 'MAQ-'
}
```

## 👥 Usuarios por Defecto

El sistema crea automáticamente:

### Usuario Administrador
- **Email:** admin@sistema.com
- **Password:** admin123
- **Rol:** admin

### Usuario Operador
- **Email:** operador@sistema.com
- **Password:** operador123
- **Rol:** operador

## 📊 Ejemplos de Mapeo Común

### Sistema de Personal
```
Sistema Anterior → Nuevo Sistema
├── trabajadores → operadores
├── empleados → operadores
├── personal → operadores
└── funcionarios → operadores
```

### Sistema de Equipos
```
Sistema Anterior → Nuevo Sistema
├── equipos → maquinas
├── maquinarias → maquinas
├── herramientas → barredores
└── instrumentos → barredores
```

### Sistema de Ubicaciones
```
Sistema Anterior → Nuevo Sistema
├── areas → sectores
├── zonas → sectores
├── ubicaciones → pabellones
├── lugares → pabellones
└── sectores → sectores
```

## 🔍 Comandos de Análisis

### Ver Estructura Completa
```bash
node scripts/configurar-migracion.js analizar
```

### Ver Logs Detallados
```bash
tail -f logs/migracion-personalizada.log
```

### Ver Análisis de Estructura
```bash
cat logs/analisis-estructura.json
```

## ⚠️ Consideraciones Importantes

### Antes de la Migración
- [ ] **Backup completo** de BD anterior
- [ ] **Analizar estructura** real
- [ ] **Mapear campos** correctamente
- [ ] **Probar en desarrollo**

### Durante la Migración
- [ ] **No interrumpir** el proceso
- [ ] **Monitorear logs** en tiempo real
- [ ] **Verificar transformaciones**
- [ ] **Validar datos** migrados

### Después de la Migración
- [ ] **Verificar usuarios** por defecto
- [ ] **Probar login** del nuevo sistema
- [ ] **Validar relaciones** entre datos
- [ ] **Documentar** transformaciones

## 🛠️ Solución de Problemas

### Error: Tabla no encontrada
```bash
# Verificar nombres reales de tablas
node scripts/configurar-migracion.js analizar
```

### Error: Campo no existe
```bash
# Revisar estructura en logs/analisis-estructura.json
cat logs/analisis-estructura.json | grep -A 10 "tabla_problema"
```

### Error: Datos no válidos
```javascript
// Agregar transformación de limpieza
{
    tipo: 'valor_por_defecto',
    campoDestino: 'campo_problema',
    valor: 'valor_por_defecto'
}
```

## 📈 Monitoreo y Validación

### Archivos de Log
- `logs/migracion-personalizada.log` - Log detallado
- `logs/analisis-estructura.json` - Estructura analizada
- `logs/reporte-migracion-personalizada.txt` - Reporte final

### Validaciones Automáticas
- ✅ Conteo de registros por tabla
- ✅ Integridad de datos transformados
- ✅ Creación de usuarios por defecto
- ✅ Validación de relaciones

## 🎯 Checklist de Migración

### Preparación
- [ ] Backup de BD anterior
- [ ] Configuración de conexiones
- [ ] Análisis de estructura ejecutado
- [ ] Mapeo de campos verificado

### Ejecución
- [ ] Migración ejecutada sin errores
- [ ] Usuarios por defecto creados
- [ ] Transformaciones aplicadas
- [ ] Validaciones exitosas

### Post-Migración
- [ ] Login funcionando con usuarios por defecto
- [ ] Datos migrados verificados
- [ ] Relaciones entre tablas correctas
- [ ] Funcionalidades del nuevo sistema probadas

## 📞 Soporte

### En Caso de Problemas
1. **Revisar logs** en `logs/migracion-personalizada.log`
2. **Verificar análisis** en `logs/analisis-estructura.json`
3. **Ajustar configuración** según estructura real
4. **Probar transformaciones** individualmente

### Información de Contacto
- **Desarrollador:** [Tu nombre]
- **Email:** [tu-email]
- **Documentación:** Esta guía

---

**⚠️ IMPORTANTE:** Siempre hacer backup antes de migrar datos críticos y probar en desarrollo primero. 