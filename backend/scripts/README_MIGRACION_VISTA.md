# Migración desde Vista vw_PabellonMaquinaDanos

Este conjunto de scripts permite migrar datos desde la vista `vw_PabellonMaquinaDanos` del sistema anterior al nuevo sistema de planillas, manejando la complejidad de datos subdivididos por máquinas y operadores.

## 🎯 **Descripción del Problema**

### **Estructura del Sistema Anterior**
La vista `vw_PabellonMaquinaDanos` contiene datos donde **una orden de servicio** puede tener **múltiples registros** por:

- **Diferentes máquinas** (`idMaquina`, `nroMaquina`)
- **Diferentes operadores** (`idOperador`, `nombreOperador`) 
- **Diferentes pabellones** (`nroPabellon`)
- **Diferentes lecturas de odómetro** (`odometroInicio`, `odometroFin`)
- **Diferente consumo de petróleo** (`litrosPetroleo`)

### **Ejemplo de Datos**
```
idOrdenServicio: 18895
├── Máquina 11 + Operador Manuel Pérez (odómetro 407-413)
├── Máquina 11 + Operador Marcos Mella (odómetro 403-408)  
├── Máquina 10 + Operador Juan Quezada (odómetro 634-638)
└── etc...
```

### **Estructura del Sistema Nuevo**
- **Planilla** (nivel principal): Una planilla por orden de servicio
- **MaquinaPlanilla** (nivel detalle): Múltiples registros por máquina/operador

## 🚀 **Estrategia de Migración**

### **Opción 1: Migración Agregada (Implementada)**
- **Una planilla** por `idOrdenServicio`
- **Múltiples registros** en `maquina_planilla` por cada combinación máquina/operador

### **🎯 Identificadores Estables (Solución al Problema de IDs)**
Para evitar problemas con IDs que han cambiado en el sistema anterior, usamos **identificadores estables**:

| Entidad | Identificador Estable | Descripción |
|---------|---------------------|-------------|
| **Supervisores** | `nombreSupervisor` | Nombre completo del supervisor |
| **Zonas** | `nombreZona` | Nombre de la zona (ej: "ZONA 2") |
| **Sectores** | `nombreSector` + `comunaSector` | Nombre y comuna del sector |
| **Máquinas** | `nroMaquina` | Número de máquina (ej: "Maquina Nro. 11") |
| **Operadores** | `nombreOperador` | Nombre completo del operador |

**Ventajas:**
- ✅ No dependen de IDs que pueden cambiar
- ✅ Permiten mapeo confiable entre sistemas
- ✅ Manejan automáticamente duplicados
- ✅ Crean referencias si no existen

### **Mapeo de Datos**
| Campo Vista | Campo Sistema Nuevo | Descripción |
|-------------|-------------------|-------------|
| `idOrdenServicio` | `planilla.id` | ID único de la planilla |
| `nombreSupervisor` | `planilla.supervisor_id` | Supervisor (se busca/crea) |
| `nombreZona` | `planilla.sector_id` → `zona_id` | Zona (se busca/crea) |
| `nombreSector` | `planilla.sector_id` | Sector (se busca/crea) |
| `mts2sector` | `planilla.mt2` | Metros cuadrados |
| `cantidadPabellones` | `planilla.pabellones_total` | Total de pabellones |
| `cantLimpiar` | `planilla.pabellones_limpiados` | Pabellones limpiados |
| `fechaOrdenServicio` | `planilla.fecha_inicio` | Fecha de inicio |
| `fechaFinOrdenServicio` | `planilla.fecha_termino` | Fecha de término |
| `nroTicket` | `planilla.ticket` | Número de ticket |
| `nombreEstado` | `planilla.estado` | Estado de la planilla |
| `observacionOrden` | `planilla.observacion` | Observaciones |

### **Mapeo MaquinaPlanilla**
| Campo Vista | Campo Sistema Nuevo | Descripción |
|-------------|-------------------|-------------|
| `idMaquina` + `nroMaquina` | `maquina_planilla.maquina_id` | Máquina (se busca/crea) |
| `idOperador` + `nombreOperador` | `maquina_planilla.operador_id` | Operador (se busca/crea) |
| `odometroInicio` | `maquina_planilla.odometro_inicio` | Odómetro inicial |
| `odometroFin` | `maquina_planilla.odometro_fin` | Odómetro final |
| `litrosPetroleo` | `maquina_planilla.petroleo` | Consumo de petróleo |

## 🛠️ **Scripts Disponibles**

### **1. `configurar_migracion_vista.js`**
Script de configuración y verificación.

**Funcionalidades:**
- Configurar variables de entorno para BD externa
- Verificar conexión a la base de datos externa
- Verificar existencia y estructura de la vista
- Mostrar estadísticas de datos disponibles

### **2. `verificar_mapeos_vista.js`**
Script para verificar mapeos de identificadores estables.

**Funcionalidades:**
- Extraer identificadores únicos de la vista
- Verificar qué identificadores ya existen en el sistema actual
- Mostrar reporte detallado de mapeos
- Generar recomendaciones antes de la migración

### **3. `migracion_vista_pabellon_maquina.js`**
Script principal de migración.

**Funcionalidades:**
- Extraer datos de la vista `vw_PabellonMaquinaDanos`
- Agrupar datos por orden de servicio
- Crear planillas y registros de máquina_planilla
- Buscar/crear referencias automáticamente usando identificadores estables
- Generar reportes detallados

## 🔧 **Configuración Requerida**

### **Variables de Entorno**

Configura las siguientes variables en tu archivo `.env`:

```env
# Base de datos externa (sistema anterior)
DB_EXTERNA_HOST=localhost
DB_EXTERNA_USER=root
DB_EXTERNA_PASSWORD=tu_password
DB_EXTERNA_NAME=nombre_base_datos_anterior
DB_EXTERNA_PORT=3306

# Base de datos actual (sistema nuevo)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=extraccion
DB_USER=root
DB_PASSWORD=tu_password
```

### **Dependencias**

```bash
cd backend
npm install mysql2 xlsx
```

## 🚀 **Proceso de Migración**

### **Paso 1: Configuración**
```bash
cd backend/scripts

# Configurar variables de entorno
node configurar_migracion_vista.js configurar
```

### **Paso 2: Verificación de Conexión**
```bash
# Verificar conexión y estructura
node configurar_migracion_vista.js verificar
```

### **Paso 3: Verificación de Mapeos (NUEVO)**
```bash
# Verificar identificadores estables y mapeos
node verificar_mapeos_vista.js 2024 2025

# Verificar solo 2024
node verificar_mapeos_vista.js 2024 2024

# Verificar solo 2025
node verificar_mapeos_vista.js 2025 2025
```

### **Paso 4: Migración**
```bash
# Migrar datos de 2024 y 2025
node migracion_vista_pabellon_maquina.js 2024 2025

# Migrar solo 2024
node migracion_vista_pabellon_maquina.js 2024 2024

# Migrar solo 2025
node migracion_vista_pabellon_maquina.js 2025 2025
```

## 📊 **Reportes Generados**

### **1. Reporte JSON**
- **Archivo:** `reporte_migracion_vista_YYYY-MM-DD.json`
- **Contenido:** Resumen completo de la migración

```json
{
  "fecha": "2025-01-15T10:30:00.000Z",
  "resumen": {
    "totalRegistrosOriginales": 1500,
    "ordenesServicioProcesadas": 45,
    "planillasCreadas": 45,
    "maquinasPlanillaCreadas": 1500,
    "errores": 0
  },
  "estadisticas": {
    "supervisores": ["Daniel Quezada", "Otro Supervisor"],
    "zonas": ["ZONA 1", "ZONA 2"],
    "sectores": ["ALHUE", "Otro Sector"],
    "maquinas": [43, 39, 42],
    "operadores": [30, 27, 26, 31]
  },
  "errores": []
}
```

### **2. Logs en Consola**
```
🚀 Iniciando migración desde vista vw_PabellonMaquinaDanos...
✅ Conexión a base de datos externa establecida
📊 Extrayendo datos de vw_PabellonMaquinaDanos de 2024 a 2025...
📈 Se encontraron 1500 registros
🔄 Agrupando datos por orden de servicio...
📊 Se agruparon 45 órdenes de servicio
🚀 Iniciando migración de datos...
👤 Creando supervisor: Daniel Quezada
🏘️ Creando zona: ZONA 2
🏢 Creando sector: ALHUE (Zona: 1)
🚛 Creando máquina: Maquina Nro. 11
👷 Creando operador: MANUEL PEREZ GONZALEZ
📋 Procesando orden de servicio: 18895
✅ Orden 18895 migrada exitosamente
...
📊 REPORTE DE MIGRACIÓN:
========================
📈 Total registros originales: 1500
📋 Órdenes de servicio procesadas: 45
✅ Planillas creadas: 45
🚛 Registros máquina_planilla creados: 1500
❌ Errores: 0
📄 Reporte guardado en: reporte_migracion_vista_2025-01-15.json
```

## 🔍 **Verificación Post-Migración**

### **1. Verificar Planillas Creadas**
```sql
SELECT 
  p.id,
  p.ticket,
  p.fecha_inicio,
  p.estado,
  u.nombre as supervisor,
  s.nombre as sector,
  COUNT(mp.id) as total_maquinas
FROM planilla p
JOIN usuario u ON p.supervisor_id = u.id
JOIN sector s ON p.sector_id = s.id
LEFT JOIN maquina_planilla mp ON p.id = mp.planilla_id
GROUP BY p.id
ORDER BY p.fecha_inicio DESC;
```

### **2. Verificar MaquinaPlanilla**
```sql
SELECT 
  mp.id,
  p.ticket,
  m.numero as maquina,
  CONCAT(o.nombre, ' ', o.apellido) as operador,
  mp.odometro_inicio,
  mp.odometro_fin,
  mp.petroleo
FROM maquina_planilla mp
JOIN planilla p ON mp.planilla_id = p.id
JOIN maquina m ON mp.maquina_id = m.id
JOIN operador o ON mp.operador_id = o.id
ORDER BY p.fecha_inicio DESC, mp.id;
```

### **3. Verificar Referencias Creadas**
```sql
-- Supervisores creados
SELECT nombre, email, rol FROM usuario WHERE rol = 'supervisor';

-- Zonas creadas
SELECT nombre, tipo FROM zona;

-- Sectores creados
SELECT s.nombre, s.comuna, z.nombre as zona 
FROM sector s 
JOIN zona z ON s.zona_id = z.id;

-- Máquinas creadas
SELECT numero, patente, marca, modelo FROM maquina;

-- Operadores creados
SELECT nombre, apellido FROM operador;
```

## ⚠️ **Consideraciones Importantes**

### **1. Datos Duplicados**
- El script maneja automáticamente la creación de referencias duplicadas
- Busca primero si existe, si no, crea nuevo registro

### **2. Contraseñas de Supervisores**
- Los supervisores creados tienen contraseña por defecto: `123456`
- **IMPORTANTE:** Cambiar contraseñas después de la migración

### **3. Patentes de Máquinas**
- Las máquinas creadas tienen patente temporal: `MIG-{idMaquina}`
- **IMPORTANTE:** Actualizar patentes reales después de la migración

### **4. Estados de Planillas**
- `CERRADO` → `COMPLETADA`
- `PENDIENTE` → `PENDIENTE`
- Estados no reconocidos → `PENDIENTE`

### **5. Datos de Daños**
- Los datos de daños se preservan en `datos_originales`
- No se migran al sistema actual (requiere implementación adicional)

## 🔧 **Solución de Problemas**

### **Error de Conexión**
```bash
# Verificar configuración
node configurar_migracion_vista.js verificar

# Revisar variables de entorno
cat .env
```

### **Error de Vista No Encontrada**
```sql
-- Verificar si existe la vista
SHOW FULL TABLES WHERE Table_type = "VIEW";

-- Verificar estructura
DESCRIBE vw_PabellonMaquinaDanos;
```

### **Error de Permisos**
```sql
-- Verificar permisos del usuario
SHOW GRANTS FOR 'usuario'@'host';
```

### **Error de Memoria**
- Para datasets grandes, considerar migración por lotes
- Ajustar configuración de MySQL si es necesario

## 📈 **Optimización para Datasets Grandes**

### **Migración por Lotes**
```javascript
// Modificar el script para procesar por lotes
const LOTE_SIZE = 1000;

for (let i = 0; i < datos.length; i += LOTE_SIZE) {
  const lote = datos.slice(i, i + LOTE_SIZE);
  await procesarLote(lote);
}
```

### **Índices Recomendados**
```sql
-- Índices para mejorar rendimiento
CREATE INDEX idx_planilla_fecha ON planilla(fecha_inicio);
CREATE INDEX idx_maquina_planilla_planilla ON maquina_planilla(planilla_id);
CREATE INDEX idx_usuario_rol ON usuario(rol);
CREATE INDEX idx_sector_zona ON sector(zona_id);
```

## 🎯 **Próximos Pasos**

1. **Ejecutar migración de prueba** con un subconjunto de datos
2. **Verificar integridad** de los datos migrados
3. **Actualizar referencias** (patentes, contraseñas)
4. **Implementar migración de daños** si es necesario
5. **Configurar respaldos** automáticos
6. **Documentar proceso** para futuras migraciones

---

**¿Necesitas ayuda con algún paso específico?** ¡Estoy aquí para ayudarte! 🚀 