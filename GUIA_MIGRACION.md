# 📊 Guía de Migración de Datos - MySQL

## 🎯 Objetivo
Migrar todos los datos del sistema anterior (MySQL) al nuevo sistema sin pérdida de información.

## 📋 Prerrequisitos

### Software Requerido
- **Node.js** (versión 14 o superior)
- **MySQL** (cliente y servidor)
- **mysqldump** (para backups)

### Dependencias
```bash
# Instalar dependencias de migración
npm install mysql2 sequelize
```

## 🔧 Configuración

### 1. Configurar Conexiones

Editar `scripts/ejecutar-migracion.js`:

```javascript
// Configuración de la BD anterior
const configBDAnterior = {
    host: '192.168.1.100',        // IP/host de tu BD anterior
    user: 'usuario_anterior',      // Usuario de BD anterior
    password: 'password_anterior', // Password de BD anterior
    database: 'sistema_anterior',  // Nombre de BD anterior
    port: 3306
};

// Configuración de la nueva BD
const configBDNueva = {
    host: 'localhost',             // Host de nueva BD
    user: 'extraccion_user',       // Usuario de nueva BD
    password: 'TuPasswordSeguro123!', // Password de nueva BD
    database: 'extraccion_prod',   // Nombre de nueva BD
    port: 3306
};
```

### 2. Mapear Campos

Ajustar el mapeo de campos en `scripts/ejecutar-migracion.js`:

```javascript
const mapeoCampos = {
    'usuarios': {
        'id': 'id',                    // Campo nuevo: campo viejo
        'nombre': 'nombre_completo',   // Si los nombres son diferentes
        'email': 'correo_electronico',
        'password': 'contrasena',
        'rol': 'tipo_usuario',
        'created_at': 'fecha_creacion',
        'updated_at': 'fecha_actualizacion'
    },
    // ... más tablas
};
```

## 🚀 Proceso de Migración

### Paso 1: Preparación
```bash
# 1. Crear directorios necesarios
mkdir -p logs backups

# 2. Verificar conexiones
node scripts/ejecutar-migracion.js
```

### Paso 2: Backup Manual (Recomendado)
```bash
# Crear backup completo de BD anterior
mysqldump -h [HOST_ANTERIOR] -u [USUARIO] -p [BD_ANTERIOR] > backup_completo_$(date +%Y%m%d_%H%M%S).sql
```

### Paso 3: Migración de Prueba
```bash
# Ejecutar migración en ambiente de prueba
node scripts/ejecutar-migracion.js
```

### Paso 4: Validación
```bash
# Revisar logs de migración
cat logs/migracion.log

# Revisar reporte final
cat logs/reporte-migracion.txt
```

### Paso 5: Migración a Producción
```bash
# Una vez validado, ejecutar en producción
node scripts/ejecutar-migracion.js
```

## 📊 Estructura de Migración

### Orden de Migración (Importante)
1. **sectores** - Tablas padre primero
2. **pabellones** - Dependen de sectores
3. **usuarios** - Independientes
4. **operadores** - Independientes
5. **maquinas** - Independientes
6. **barredores** - Independientes
7. **planillas** - Dependen de otras tablas

### Tablas Críticas
```
✅ usuarios - Usuarios del sistema
✅ planillas - Planillas de trabajo
✅ maquinas - Catálogo de máquinas
✅ operadores - Operadores del sistema
✅ pabellones - Pabellones de extracción
✅ sectores - Sectores de trabajo
✅ barredores - Catálogo de barredores
```

## 🔍 Validación de Datos

### Verificaciones Automáticas
- ✅ Conteo de registros por tabla
- ✅ Integridad referencial
- ✅ Validación de campos críticos
- ✅ Logs detallados de errores

### Verificaciones Manuales
```sql
-- Comparar conteos
SELECT 'usuarios' as tabla, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'planillas', COUNT(*) FROM planillas
UNION ALL
SELECT 'maquinas', COUNT(*) FROM maquinas;

-- Verificar relaciones
SELECT COUNT(*) FROM planillas p 
JOIN operadores o ON p.operador_id = o.id
JOIN maquinas m ON p.maquina_id = m.id;
```

## ⚠️ Consideraciones Importantes

### Antes de la Migración
- [ ] **Backup completo** de BD anterior
- [ ] **Validar estructura** de tablas
- [ ] **Probar en ambiente** de desarrollo
- [ ] **Verificar permisos** de usuario

### Durante la Migración
- [ ] **No interrumpir** el proceso
- [ ] **Monitorear logs** en tiempo real
- [ ] **Verificar espacio** en disco
- [ ] **Mantener conexión** estable

### Después de la Migración
- [ ] **Validar todos** los datos
- [ ] **Probar funcionalidades** del nuevo sistema
- [ ] **Comparar reportes** con sistema anterior
- [ ] **Documentar** cualquier problema

## 🛠️ Solución de Problemas

### Error de Conexión
```bash
# Verificar conectividad
mysql -h [HOST] -u [USUARIO] -p [BD]

# Verificar puertos
telnet [HOST] 3306
```

### Error de Permisos
```sql
-- Verificar permisos del usuario
SHOW GRANTS FOR 'usuario'@'host';

-- Otorgar permisos si es necesario
GRANT SELECT, INSERT ON bd_anterior.* TO 'usuario'@'host';
GRANT ALL PRIVILEGES ON bd_nueva.* TO 'usuario'@'host';
```

### Error de Memoria
```javascript
// Reducir tamaño de lote en migracion-mysql.js
const batchSize = 500; // Cambiar de 1000 a 500
```

### Error de Caracteres
```javascript
// Agregar configuración de charset
const configBDAnterior = {
    // ... otras configuraciones
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
};
```

## 📈 Monitoreo y Logs

### Archivos de Log
- `logs/migracion.log` - Log detallado del proceso
- `logs/reporte-migracion.txt` - Reporte final
- `backups/backup_*.sql` - Backups automáticos

### Comandos de Monitoreo
```bash
# Ver progreso en tiempo real
tail -f logs/migracion.log

# Ver estadísticas
grep "migrados\|errores" logs/migracion.log

# Ver errores específicos
grep "ERROR\|❌" logs/migracion.log
```

## 🎯 Checklist de Migración

### Preparación
- [ ] Backup completo de BD anterior
- [ ] Configuración de conexiones
- [ ] Mapeo de campos verificado
- [ ] Pruebas en ambiente de desarrollo

### Ejecución
- [ ] Migración ejecutada sin errores
- [ ] Todas las tablas migradas
- [ ] Validaciones exitosas
- [ ] Reporte final generado

### Post-Migración
- [ ] Datos verificados manualmente
- [ ] Funcionalidades del nuevo sistema probadas
- [ ] Usuarios pueden acceder normalmente
- [ ] Documentación actualizada

## 📞 Soporte

### En Caso de Problemas
1. **Revisar logs** en `logs/migracion.log`
2. **Verificar configuración** de conexiones
3. **Restaurar backup** si es necesario
4. **Contactar soporte** técnico

### Información de Contacto
- **Desarrollador:** [Tu nombre]
- **Email:** [tu-email]
- **Documentación:** Esta guía

---

**⚠️ IMPORTANTE:** Siempre hacer backup antes de migrar datos críticos. 