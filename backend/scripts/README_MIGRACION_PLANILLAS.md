# Migración de Planillas desde Sistema Externo

Este conjunto de scripts permite migrar planillas desde otro sistema MySQL con estructura diferente al sistema actual, cubriendo los años 2024 y 2025.

## 📋 Descripción General

El proceso de migración consta de tres etapas principales:

1. **Extracción de datos** desde la base de datos externa
2. **Mapeo y transformación** de datos al formato del sistema actual
3. **Completado de referencias** y carga masiva final

## 🛠️ Scripts Disponibles

### 1. `migrar_planillas_sistema_externo.js`
Script principal para extraer datos del sistema externo.

**Funcionalidades:**
- Conecta a la base de datos externa
- Detecta automáticamente la tabla de planillas
- Extrae datos de los años especificados
- Mapea campos al formato del sistema actual
- Genera archivos Excel y reportes

### 2. `completar_referencias_migracion.js`
Script para completar referencias automáticamente.

**Funcionalidades:**
- Busca supervisores y sectores existentes
- Crea nuevos supervisores/sectores si es necesario
- Completa IDs de referencia faltantes
- Genera archivos con datos completados

### 3. `migracion_completa_planillas.js`
Script principal que combina todo el proceso.

**Funcionalidades:**
- Interfaz interactiva y línea de comandos
- Proceso completo automatizado
- Verificación de conexión
- Gestión de errores

## 🔧 Configuración Requerida

### Variables de Entorno

Configura las siguientes variables en tu archivo `.env`:

```env
# Base de datos externa
DB_EXTERNA_HOST=localhost
DB_EXTERNA_USER=root
DB_EXTERNA_PASSWORD=tu_password
DB_EXTERNA_NAME=nombre_base_datos
DB_EXTERNA_PORT=3306
```

### Dependencias

Asegúrate de tener instaladas las dependencias:

```bash
cd backend
npm install mysql2 xlsx
```

## 🚀 Uso Rápido

### Opción 1: Proceso Completo (Recomendado)

```bash
cd backend/scripts
node migracion_completa_planillas.js
```

Esto iniciará el modo interactivo que te guiará paso a paso.

### Opción 2: Línea de Comandos

```bash
# Migración completa
node migracion_completa_planillas.js completa 2024 2025 --crear-supervisores --crear-sectores

# Solo extraer datos
node migracion_completa_planillas.js extraer 2024 2025

# Solo completar referencias
node migracion_completa_planillas.js completar migracion_planillas_2024-01-01.xlsx --crear-supervisores

# Verificar conexión
node migracion_completa_planillas.js verificar
```

### Opción 3: Scripts Individuales

```bash
# Extraer datos del sistema externo
node migrar_planillas_sistema_externo.js 2024 2025

# Completar referencias
node completar_referencias_migracion.js migracion_planillas_2024-01-01.xlsx --crear-supervisores --crear-sectores
```

## 📊 Estructura de Datos

### Campos Mapeados

| Campo Original | Campo Destino | Descripción |
|----------------|---------------|-------------|
| `supervisor` | `supervisor_id` | ID del supervisor (se busca por nombre) |
| `sector` | `sector_id` | ID del sector (se busca por nombre) |
| `metros_cuadrados` / `mt2` / `area` | `mt2` | Metros cuadrados |
| `pabellones_total` / `num_pabellones` | `pabellones_total` | Total de pabellones |
| `fecha_inicio` / `fecha` / `fecha_creacion` | `fecha_inicio` | Fecha de inicio |
| `fecha_termino` / `fecha_fin` | `fecha_termino` | Fecha de término |
| `numero` / `ticket` / `id` | `ticket` | Número de ticket |
| `estado` / `status` | `estado` | Estado de la planilla |
| `observacion` / `comentario` / `descripcion` | `observacion` | Observaciones |

### Estados Mapeados

| Estado Original | Estado Destino |
|-----------------|----------------|
| PENDIENTE, PENDING | PENDIENTE |
| ACTIVA, ACTIVE, EN_PROGRESO, IN_PROGRESS | ACTIVA |
| COMPLETADA, COMPLETED, FINALIZADA, FINISHED | COMPLETADA |
| CANCELADA, CANCELLED, ANULADA | CANCELADA |

## 📁 Archivos Generados

### 1. Archivo de Datos Extraídos
- **Nombre:** `migracion_planillas_YYYY-MM-DD.xlsx`
- **Contenido:** Datos mapeados del sistema externo
- **Hojas:**
  - `Planillas` - Datos de planillas
  - `Referencias` - Lista de referencias encontradas
  - `Estructura_Original` - Estructura de la tabla original

### 2. Script de Mapeo Manual
- **Nombre:** `mapeo_manual_YYYY-MM-DD.js`
- **Contenido:** Script para mapeo manual de referencias
- **Uso:** Completar IDs de supervisores y sectores manualmente

### 3. Reporte de Extracción
- **Nombre:** `reporte_migracion_YYYY-MM-DD.md`
- **Contenido:** Resumen de la extracción y próximos pasos

### 4. Archivo con Referencias Completadas
- **Nombre:** `migracion_completada_YYYY-MM-DD.xlsx`
- **Contenido:** Datos con referencias completadas automáticamente
- **Hojas:**
  - `Planillas_Completadas` - Datos listos para importación
  - `Resumen` - Estadísticas del proceso
  - `Errores` - Errores encontrados (si los hay)

### 5. Reporte de Completado
- **Nombre:** `reporte_completado_YYYY-MM-DD.md`
- **Contenido:** Resumen del completado de referencias

## 🔄 Proceso Detallado

### Paso 1: Extracción de Datos

1. **Conexión a BD externa**
   - Verifica variables de entorno
   - Establece conexión MySQL
   - Detecta estructura de la base de datos

2. **Detección de tabla de planillas**
   - Busca en tablas comunes: `planillas`, `planilla`, `ordenes`, etc.
   - Muestra estructura de la tabla encontrada
   - Extrae datos del período especificado

3. **Mapeo de datos**
   - Transforma campos al formato del sistema actual
   - Preserva datos originales para referencia
   - Genera archivos Excel y reportes

### Paso 2: Completado de Referencias

1. **Búsqueda de referencias existentes**
   - Busca supervisores por nombre
   - Busca sectores por nombre
   - Busca zonas por nombre

2. **Creación de referencias faltantes** (opcional)
   - Crea supervisores con contraseña por defecto
   - Crea sectores con valores por defecto
   - Actualiza referencias en los datos

3. **Generación de archivos finales**
   - Archivo Excel con referencias completadas
   - Reporte de estadísticas
   - Lista de errores (si los hay)

### Paso 3: Carga Masiva

1. **Revisión de archivos**
   - Verificar datos mapeados
   - Revisar errores reportados
   - Confirmar referencias correctas

2. **Importación vía endpoint**
   - Usar endpoint de carga masiva de planillas
   - Verificar resultados de importación
   - Validar integridad de datos

## ⚠️ Consideraciones Importantes

### Antes de la Migración

1. **Backup de base de datos**
   ```bash
   mysqldump -u usuario -p nombre_bd > backup_antes_migracion.sql
   ```

2. **Verificar conexión**
   ```bash
   node migracion_completa_planillas.js verificar
   ```

3. **Revisar estructura externa**
   - Confirmar nombres de tablas
   - Verificar campos disponibles
   - Validar tipos de datos

### Durante la Migración

1. **Monitorear logs**
   - Revisar mensajes de progreso
   - Verificar errores reportados
   - Confirmar archivos generados

2. **Validar datos**
   - Revisar archivos Excel generados
   - Verificar mapeo de campos
   - Confirmar referencias completadas

### Después de la Migración

1. **Verificar integridad**
   - Consultar planillas importadas
   - Verificar relaciones entre tablas
   - Validar datos críticos

2. **Actualizar contraseñas**
   - Cambiar contraseñas de supervisores creados
   - Configurar acceso seguro

## 🐛 Solución de Problemas

### Error: "No se pudo conectar a la base de datos externa"

**Causas posibles:**
- Variables de entorno incorrectas
- Base de datos no accesible
- Credenciales incorrectas

**Solución:**
```bash
# Verificar variables de entorno
echo $DB_EXTERNA_HOST
echo $DB_EXTERNA_USER
echo $DB_EXTERNA_PASSWORD

# Probar conexión manual
mysql -h $DB_EXTERNA_HOST -u $DB_EXTERNA_USER -p $DB_EXTERNA_NAME
```

### Error: "No se encontró tabla de planillas"

**Causas posibles:**
- Nombre de tabla diferente
- Base de datos vacía
- Permisos insuficientes

**Solución:**
```sql
-- Verificar tablas disponibles
SHOW TABLES;

-- Verificar contenido de tabla
SELECT COUNT(*) FROM nombre_tabla_planillas;
```

### Error: "Supervisor/Sector no encontrado"

**Causas posibles:**
- Nombres diferentes entre sistemas
- Referencias faltantes en sistema actual
- Problemas de codificación

**Solución:**
```bash
# Usar opción de crear automáticamente
node migracion_completa_planillas.js completa 2024 2025 --crear-supervisores --crear-sectores

# O completar manualmente en el script de mapeo
```

### Error: "Campos requeridos faltantes"

**Causas posibles:**
- Estructura de tabla externa diferente
- Campos obligatorios vacíos
- Problemas de mapeo

**Solución:**
1. Revisar estructura original en archivo Excel
2. Ajustar mapeo en el script
3. Completar datos faltantes manualmente

## 📞 Soporte

### Logs y Debugging

Los scripts generan logs detallados. Para debugging:

```bash
# Ejecutar con más información
DEBUG=* node migracion_completa_planillas.js

# Revisar archivos de log
tail -f backend/logs/error.log
```

### Verificación de Datos

```sql
-- Verificar planillas importadas
SELECT COUNT(*) FROM planilla WHERE ticket LIKE 'MIG-%';

-- Verificar supervisores creados
SELECT * FROM usuario WHERE rol = 'SUPERVISOR' AND nombre LIKE '%NUEVO%';

-- Verificar sectores creados
SELECT * FROM sector WHERE nombre LIKE '%NUEVO%';
```

### Contacto

Si encuentras problemas:

1. Revisa los logs de error
2. Verifica la configuración de variables de entorno
3. Confirma que la base de datos externa esté accesible
4. Revisa los archivos de reporte generados

## 📚 Referencias

- [Documentación de MySQL2](https://github.com/sidorares/node-mysql2)
- [Documentación de XLSX](https://github.com/SheetJS/sheetjs)
- [Guía de Sequelize](https://sequelize.org/docs/v6/)
- [README de Carga Masiva](README_CARGA_MASIVA_BARREDORES.md) 