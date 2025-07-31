# 🗺️ Implementación de Filtro por Zona - Análisis de Daños

## 🎯 Objetivo

Implementar un filtro por zona que permita visualizar los daños agrupados según la zona correspondiente de cada sector, mapeando la relación entre sectores y zonas para proporcionar análisis más detallados y organizados.

## 📊 Estructura de Datos

### **Relación Sector-Zona**
```sql
-- Tabla sector
sector (id, nombre, zona_id, comuna, cantidad_pabellones, mt2)

-- Tabla zona  
zona (id, nombre, tipo) -- tipo: HEMBRA/MACHO

-- Relación
sector.zona_id → zona.id
```

### **Vista Unificada**
```sql
vw_ordenes_2025_actual (
  idOrdenServicio,
  nombreSector,  -- Nombre del sector (para mapeo)
  cantidadDano,
  nombreTipoDano,
  fechaOrdenServicio,
  source,
  ...
)
```

## 🔧 Implementación Backend

### **1. Nuevo Controlador: `danoStatsController.js`**

#### **Método `getDanoStatsPorZona`**
```javascript
exports.getDanoStatsPorZona = async (req, res) => {
  // Parámetros: origen, year, month, zona_id
  // Retorna: estadísticas agrupadas por zona
}
```

#### **Método `getZonasDisponibles`**
```javascript
exports.getZonasDisponibles = async (req, res) => {
  // Retorna: lista de zonas con información de sectores
}
```

### **2. Consultas SQL Implementadas**

#### **Obtener Zonas con Sectores**
```sql
SELECT 
  z.id as zona_id,
  z.nombre as zona_nombre,
  z.tipo as zona_tipo,
  COUNT(DISTINCT s.id) as total_sectores
FROM zona z
LEFT JOIN sector s ON z.id = s.zona_id
GROUP BY z.id, z.nombre, z.tipo
ORDER BY z.id ASC
```

#### **Sectores con Daños por Zona**
```sql
SELECT 
  s.id as sector_id,
  s.nombre as sector_nombre,
  s.zona_id,
  z.nombre as zona_nombre,
  z.tipo as zona_tipo,
  COALESCE(SUM(v.cantidadDano), 0) as total_danos,
  COUNT(DISTINCT v.idOrdenServicio) as ordenes_con_danos
FROM sector s
LEFT JOIN zona z ON s.zona_id = z.id
LEFT JOIN vw_ordenes_2025_actual v ON s.nombre = v.nombreSector
WHERE YEAR(v.fechaOrdenServicio) = 2025 AND v.cantidadDano > 0
GROUP BY s.id, s.nombre, s.zona_id, z.nombre, z.tipo
HAVING total_danos > 0
ORDER BY total_danos DESC
```

#### **Filtro por Zona Específica**
```sql
-- Agregar WHERE s.zona_id = ? para filtrar por zona específica
WHERE s.zona_id = ? AND YEAR(v.fechaOrdenServicio) = 2025 AND v.cantidadDano > 0
```

### **3. Rutas Agregadas**

#### **`backend/src/routes/danoRoutes.js`**
```javascript
// Estadísticas por zona
router.get('/stats/por-zona', authenticateToken, danoStatsController.getDanoStatsPorZona);
router.get('/stats/por-zona/test', danoStatsController.getDanoStatsPorZona);

// Zonas disponibles
router.get('/zonas', authenticateToken, danoStatsController.getZonasDisponibles);
router.get('/zonas/test', danoStatsController.getZonasDisponibles);
```

## 🎨 Implementación Frontend

### **1. Nuevo Componente: `GraficosPorZona.jsx`**

#### **Características**
- ✅ **Selector de zona**: Dropdown con todas las zonas disponibles
- ✅ **Gráfico de dona**: Distribución de daños por zona
- ✅ **Gráfico de barras**: Comparación de daños por zona
- ✅ **Gráfico de tipos**: Tipos de daños por zona seleccionada
- ✅ **Cards detalladas**: Información específica por zona
- ✅ **Chips informativos**: KPIs principales

#### **Funcionalidades**
```javascript
// Cargar zonas disponibles
const fetchZonas = async () => {
  const response = await axios.get('/danos/zonas/test');
  setZonas(response.data.zonas || []);
};

// Cargar datos por zona
const fetchDatosPorZona = async (zonaId = '') => {
  const params = {};
  if (zonaId) params.zona_id = zonaId;
  const response = await axios.get('/danos/stats/por-zona/test', { params });
  setDatosPorZona(response.data);
};
```

### **2. Integración en Página de Daños**

#### **Nueva Pestaña: "Análisis por Zona"**
```javascript
// En Danos.jsx
<Tab label="Análisis por Zona" icon={<LocationIcon />} />

// Contenido de la pestaña
{activeTab === 4 && (
  <GraficosPorZona />
)}
```

## 📊 Estructura de Respuesta

### **Endpoint `/danos/stats/por-zona`**
```json
{
  "resumen": {
    "total_ordenes_con_danos": 545,
    "total_danos": 221,
    "tipos_danos_diferentes": 2,
    "sectores_con_danos": 10
  },
  "zonas": [
    {
      "zona_id": 1,
      "zona_nombre": "Zona 1",
      "zona_tipo": "HEMBRA",
      "total_sectores": 3,
      "sectores_con_danos": [
        {
          "sector_id": 1,
          "sector_nombre": "SAN IGNACIO",
          "total_danos": 33,
          "ordenes_con_danos": 15
        }
      ],
      "total_danos": 72,
      "total_ordenes": 45
    }
  ],
  "danosPorTipo": [
    {
      "tipo": "INFRAESTRUCTURA",
      "cantidad": 391,
      "total_danos": 156
    }
  ],
  "metadata": {
    "origen": "todos",
    "year": 2025,
    "month": null,
    "zona_id": null,
    "timestamp": "2025-01-15T10:30:00.000Z",
    "fuente": "vw_ordenes_2025_actual"
  }
}
```

### **Endpoint `/danos/zonas`**
```json
{
  "zonas": [
    {
      "id": 1,
      "nombre": "Zona 1",
      "tipo": "HEMBRA",
      "total_sectores": 3,
      "sectores_con_datos": 3
    }
  ],
  "metadata": {
    "total_zonas": 3,
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

## 🎯 Funcionalidades Implementadas

### **1. Filtrado Dinámico**
- ✅ **Todas las zonas**: Muestra datos de todas las zonas
- ✅ **Zona específica**: Filtra por zona seleccionada
- ✅ **Filtros combinados**: Origen + Año + Mes + Zona

### **2. Visualizaciones**
- ✅ **Distribución por zona**: Gráfico de dona con colores por tipo
- ✅ **Comparación de zonas**: Gráfico de barras
- ✅ **Tipos por zona**: Análisis de tipos de daños por zona
- ✅ **Detalle por zona**: Cards con información específica

### **3. Información Contextual**
- ✅ **Tipo de zona**: HEMBRA/MACHO con chips de colores
- ✅ **Sectores por zona**: Lista detallada de sectores afectados
- ✅ **KPIs por zona**: Totales y métricas específicas

## 🔍 Mapeo de Datos

### **Proceso de Mapeo**
1. **Obtener sectores** desde tabla `sector`
2. **Relacionar con zonas** mediante `zona_id`
3. **Mapear con vista unificada** mediante `nombreSector`
4. **Agrupar por zona** y calcular estadísticas
5. **Filtrar por zona** si se especifica

### **Ejemplo de Mapeo**
```
Sector: "SAN IGNACIO" (zona_id: 1)
  ↓
Zona: "Zona 1" (tipo: HEMBRA)
  ↓
Vista: nombreSector = "SAN IGNACIO"
  ↓
Daños: 33 daños en 15 órdenes
```

## 🚀 Beneficios de la Implementación

### **1. Análisis Organizado**
- 📊 **Agrupación lógica**: Daños organizados por zona geográfica
- 🎯 **Filtrado preciso**: Análisis específico por zona
- 📈 **Comparativas**: Comparación entre zonas

### **2. Toma de Decisiones**
- 🏆 **Zonas críticas**: Identificación de zonas con más daños
- 📋 **Planificación**: Distribución de recursos por zona
- 🎯 **Priorización**: Enfoque en zonas problemáticas

### **3. Experiencia de Usuario**
- 👁️ **Visualización clara**: Gráficos intuitivos por zona
- 🎨 **Diseño atractivo**: Colores diferenciados por tipo de zona
- 📱 **Interactividad**: Filtros dinámicos y responsivos

## 🔧 Pruebas y Verificación

### **Script de Prueba: `test-filtro-por-zona.js`**
```bash
cd backend
node test-filtro-por-zona.js
```

### **Verificaciones Realizadas**
- ✅ **Zonas disponibles**: Lista correcta de zonas
- ✅ **Sectores por zona**: Mapeo correcto sector-zona
- ✅ **Daños por zona**: Cálculo correcto de estadísticas
- ✅ **Filtro específico**: Funcionamiento del filtro por zona
- ✅ **Tipos por zona**: Análisis de tipos por zona

## 📝 Uso del Sistema

### **1. Acceso a la Funcionalidad**
1. Ir a **Panel de Control → Daños**
2. Seleccionar pestaña **"Análisis por Zona"**
3. Usar filtro **"Filtrar por Zona"** para análisis específico

### **2. Interpretación de Datos**
- **Gráfico de dona**: Distribución porcentual por zona
- **Gráfico de barras**: Comparación absoluta de daños
- **Cards de zona**: Detalle específico por zona
- **Tipos de daños**: Análisis de tipos por zona seleccionada

### **3. Filtros Disponibles**
- **Todas las zonas**: Vista general
- **Zona específica**: Análisis detallado por zona
- **Combinación**: Origen + Año + Mes + Zona

## 🎯 Resultado Final

La implementación del filtro por zona proporciona:

1. **📊 Análisis organizado** de daños por zona geográfica
2. **🎯 Filtrado dinámico** para análisis específicos
3. **📈 Visualizaciones claras** con gráficos intuitivos
4. **🏆 Identificación de zonas críticas** para toma de decisiones
5. **📱 Experiencia de usuario mejorada** con interfaz atractiva

**El sistema ahora permite un análisis completo y detallado de daños organizados por zona, facilitando la identificación de áreas problemáticas y la planificación de recursos.** 