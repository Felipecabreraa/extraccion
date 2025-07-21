# 🔄 Guía de Duplicación y Migración Segura

## 🎯 Objetivo
Duplicar la base de datos anterior de forma segura y realizar pruebas de migración sin afectar los datos originales.

## 🛡️ Ventajas de este Enfoque

### Seguridad
- ✅ **BD original intacta** - No se modifica en ningún momento
- ✅ **Backup automático** - Se crea antes de cualquier operación
- ✅ **Pruebas seguras** - Puedes experimentar sin riesgos
- ✅ **Rollback fácil** - Siempre puedes volver al estado original

### Flexibilidad
- ✅ **Múltiples intentos** - Puedes probar diferentes configuraciones
- ✅ **Limpieza automática** - Reiniciar pruebas fácilmente
- ✅ **Análisis detallado** - Ver estructura real antes de migrar
- ✅ **Validación completa** - Verificar que todo esté correcto

## 📋 Flujo de Trabajo Completo

### Paso 1: Configurar Conexiones
Editar `scripts/duplicar-bd.js`:

```javascript
// Configuración de tu BD anterior
const configBDOriginal = {
    host: '192.168.1.100',        // IP de tu servidor MySQL anterior
    user: 'usuario_anterior',      // Usuario de BD anterior
    password: 'password_anterior', // Password de BD anterior
    database: 'sistema_anterior',  // Nombre de tu BD anterior
    port: 3306
};
```

### Paso 2: Duplicar Base de Datos
```bash
# Crear directorios necesarios
mkdir -p logs backups

# Duplicar BD anterior
node scripts/duplicar-bd.js
```

**Esto hará:**
- ✅ Verificar que la BD original existe
- ✅ Crear backup completo automático
- ✅ Crear BD de trabajo: `sistema_anterior_copia`
- ✅ Restaurar backup en BD de trabajo
- ✅ Verificar que la duplicación fue exitosa

### Paso 3: Analizar Estructura
```bash
# Analizar la BD duplicada
node scripts/migracion-bd-trabajo.js analizar
```

**Esto generará:**
- `logs/analisis-estructura.json` - Estructura completa
- Información de todas las tablas y campos
- Muestras de datos reales

### Paso 4: Ajustar Configuración
Basándote en el análisis, editar `scripts/migracion-bd-trabajo.js`:

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

### Paso 5: Probar Migración
```bash
# Ejecutar migración de prueba
node scripts/migracion-bd-trabajo.js migrar
```

### Paso 6: Verificar Resultados
```bash
# Ver logs de migración
tail -f logs/migracion-personalizada.log

# Ver reporte final
cat logs/reporte-migracion-prueba.txt
```

### Paso 7: Probar Nuevo Sistema
- Acceder al nuevo sistema
- Verificar que los datos migraron correctamente
- Probar funcionalidades

### Paso 8: Si hay errores, limpiar y repetir
```bash
# Limpiar BD nueva para nueva prueba
node scripts/migracion-bd-trabajo.js limpiar

# Ajustar configuración y repetir desde paso 5
```

## 🔧 Comandos Disponibles

### Duplicación
```bash
# Duplicar BD anterior
node scripts/duplicar-bd.js
```

### Análisis
```bash
# Analizar estructura de BD de trabajo
node scripts/migracion-bd-trabajo.js analizar
```

### Migración
```bash
# Ejecutar migración de prueba
node scripts/migracion-bd-trabajo.js migrar
```

### Limpieza
```bash
# Limpiar BD nueva para nuevas pruebas
node scripts/migracion-bd-trabajo.js limpiar
```

## 📊 Estructura de Archivos Generados

```
EXTRACCION/
├── logs/
│   ├── duplicacion.log                    # Log de duplicación
│   ├── analisis-estructura.json           # Estructura analizada
│   ├── migracion-personalizada.log        # Log de migración
│   ├── reporte-duplicacion-*.txt          # Reporte de duplicación
│   └── reporte-migracion-prueba.txt       # Reporte de migración
├── backups/
│   └── backup_completo_*.sql              # Backup de BD original
└── scripts/
    ├── duplicar-bd.js                     # Script de duplicación
    └── migracion-bd-trabajo.js            # Script de migración
```

## 🔍 Verificación de Duplicación

### Verificar que la duplicación fue exitosa:
```bash
# Ver log de duplicación
cat logs/duplicacion.log

# Ver reporte de duplicación
cat logs/reporte-duplicacion-*.txt

# Verificar que ambas BD tienen las mismas tablas
mysql -u usuario -p -e "SHOW TABLES FROM sistema_anterior;"
mysql -u usuario -p -e "SHOW TABLES FROM sistema_anterior_copia;"
```

## ⚠️ Consideraciones Importantes

### Antes de Duplicar
- [ ] **Verificar espacio en disco** - Necesitas espacio para la copia
- [ ] **Verificar permisos** - Usuario debe tener permisos de CREATE, DROP
- [ ] **Verificar mysqldump** - Debe estar instalado en el sistema
- [ ] **Backup manual** - Siempre es bueno tener un backup manual

### Durante el Proceso
- [ ] **No interrumpir** - El proceso puede tomar tiempo
- [ ] **Monitorear logs** - Ver progreso en tiempo real
- [ ] **Verificar conexiones** - Asegurar que las conexiones sean estables

### Después de Duplicar
- [ ] **Verificar integridad** - Confirmar que la copia es idéntica
- [ ] **Probar conexiones** - Verificar que puedes conectar a ambas BD
- [ ] **Documentar configuración** - Guardar configuraciones exitosas

## 🛠️ Solución de Problemas

### Error: No se puede conectar a BD original
```bash
# Verificar conectividad
mysql -h [HOST] -u [USUARIO] -p

# Verificar que la BD existe
mysql -h [HOST] -u [USUARIO] -p -e "SHOW DATABASES;"
```

### Error: Permisos insuficientes
```sql
-- Otorgar permisos necesarios
GRANT CREATE, DROP, SELECT, INSERT, UPDATE, DELETE ON *.* TO 'usuario'@'host';
FLUSH PRIVILEGES;
```

### Error: mysqldump no encontrado
```bash
# Instalar mysqldump (Ubuntu/Debian)
sudo apt install mysql-client

# Instalar mysqldump (CentOS/RHEL)
sudo yum install mysql
```

### Error: Espacio insuficiente
```bash
# Verificar espacio disponible
df -h

# Limpiar archivos temporales si es necesario
rm -rf /tmp/*
```

## 📈 Monitoreo y Logs

### Logs Importantes
- `logs/duplicacion.log` - Proceso de duplicación
- `logs/migracion-personalizada.log` - Proceso de migración
- `logs/analisis-estructura.json` - Estructura analizada

### Comandos de Monitoreo
```bash
# Ver progreso en tiempo real
tail -f logs/duplicacion.log

# Ver errores específicos
grep "ERROR\|❌" logs/duplicacion.log

# Ver estadísticas
grep "migrados\|registros" logs/migracion-personalizada.log
```

## 🎯 Checklist de Duplicación

### Preparación
- [ ] Configuración de conexiones verificada
- [ ] Espacio en disco suficiente
- [ ] Permisos de usuario verificados
- [ ] mysqldump instalado

### Duplicación
- [ ] BD original verificada
- [ ] BD de trabajo creada
- [ ] Backup completo generado
- [ ] Restauración exitosa
- [ ] Verificación de integridad

### Post-Duplicación
- [ ] Análisis de estructura ejecutado
- [ ] Configuración ajustada
- [ ] Pruebas de migración realizadas
- [ ] Sistema nuevo verificado

## 📞 Soporte

### En Caso de Problemas
1. **Revisar logs** en `logs/duplicacion.log`
2. **Verificar configuración** de conexiones
3. **Comprobar permisos** de usuario
4. **Verificar espacio** en disco

### Información de Contacto
- **Desarrollador:** [Tu nombre]
- **Email:** [tu-email]
- **Documentación:** Esta guía

---

**⚠️ IMPORTANTE:** Este enfoque garantiza que tus datos originales permanezcan seguros mientras experimentas con la migración. 