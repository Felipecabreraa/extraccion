# 🎯 Trabajo con Vista Unificada vw_ordenes_2025_actual

## 📋 Situación Actual

Tienes una vista unificada `vw_ordenes_2025_actual` que combina:
- **Datos históricos de 2025** (desde `migracion_ordenes_2025`)
- **Datos actuales** (desde `planilla` y tablas relacionadas)

## 🎯 Objetivo

Proyectar la data que tienes en el **Dashboard** y **Daños** existentes, usando la vista unificada `vw_ordenes_2025_actual` como fuente de datos.

## 🏗️ Estructura de la Vista Unificada

### **Campos Disponibles**
```sql
-- Campos principales
idOrdenServicio          -- ID de la orden de servicio
fechaOrdenServicio       -- Fecha de la orden
fechaFinOrdenServicio    -- Fecha de fin
nombreSupervisor         -- Nombre del supervisor
nombreSector             -- Nombre del sector
nombreZona               -- Nombre de la zona
mts2sector               -- Metros cuadrados
cantidadPabellones       -- Total de pabellones
cantLimpiar              -- Pabellones limpiados
nroTicket                -- Número de ticket
nombreEstado             -- Estado de la orden
observacionOrden         -- Observaciones

-- Campos de máquinas y operadores
nombreMaquina            -- Nombre de la máquina
nombreOperador           -- Nombre del operador
odometroInicio           -- Odómetro inicial
odometroFin              -- Odómetro final
litrosPetroleo           -- Consumo de petróleo

-- Campos de barredores
nombreBarredor           -- Nombre del barredor

-- Campos de daños
tipoDano                 -- Tipo de daño
descripcionDano          -- Descripción del daño
cantidadDano             -- Cantidad de daños
observacionDano          -- Observación del daño

-- Campo de origen
source                   -- 'historico_2025' o 'activo'
fechaCreacion            -- Fecha de creación
```

## 🚀 Implementación en Dashboard

### **1. Actualizar getDashboardMetrics**

```javascript
// En dashboardController.js
exports.getDashboardMetrics = async (req, res) => {
  try {
    const { origen, year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Construir filtros para la vista unificada
    let whereClause = 'WHERE YEAR(fechaOrdenServicio) = ?';
    let params = [currentYear];
    
    if (origen) {
      whereClause += ' AND source = ?';
      params.push(origen);
    }
    
    if (month) {
      whereClause += ' AND MONTH(fechaOrdenServicio) = ?';
      params.push(month);
    }
    
    // Consulta desde la vista unificada
    const [resumenResult] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_ordenes,
        COALESCE(SUM(mts2sector), 0) as total_mt2,
        COALESCE(SUM(cantidadPabellones), 0) as total_pabellones,
        COALESCE(SUM(cantLimpiar), 0) as total_pabellones_limpiados,
        COUNT(DISTINCT nombreSector) as sectores_activos,
        COUNT(DISTINCT nombreSupervisor) as supervisores_activos
      FROM vw_ordenes_2025_actual
      ${whereClause}
    `, { replacements: params });
    
    // ... resto de la implementación
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
```

### **2. Actualizar getChartData**

```javascript
// En dashboardController.js
exports.getChartData = async (req, res) => {
  try {
    const { origen, year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Construir filtros
    let whereClause = 'WHERE YEAR(fechaOrdenServicio) = ?';
    let params = [currentYear];
    
    if (origen) {
      whereClause += ' AND source = ?';
      params.push(origen);
    }
    
    // Planillas por estado desde vista unificada
    const [planillasPorEstadoResult] = await sequelize.query(`
      SELECT 
        nombreEstado as estado,
        COUNT(*) as cantidad
      FROM vw_ordenes_2025_actual
      ${whereClause}
      GROUP BY nombreEstado
      ORDER BY cantidad DESC
    `, { replacements: params });
    
    // ... resto de consultas
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
```

## 🔧 Implementación en Daños

### **1. Actualizar Controlador de Daños**

```javascript
// En danoController.js
exports.getDanoStats = async (req, res) => {
  try {
    const { origen, year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    // Construir filtros
    let whereClause = 'WHERE YEAR(fechaOrdenServicio) = ? AND cantidadDano > 0';
    let params = [currentYear];
    
    if (origen) {
      whereClause += ' AND source = ?';
      params.push(origen);
    }
    
    if (month) {
      whereClause += ' AND MONTH(fechaOrdenServicio) = ?';
      params.push(month);
    }
    
    // Daños por tipo desde vista unificada
    const [danosPorTipoResult] = await sequelize.query(`
      SELECT 
        COALESCE(tipoDano, 'Sin tipo') as tipo_dano,
        COUNT(*) as cantidad,
        COALESCE(SUM(cantidadDano), 0) as total_danos
      FROM vw_ordenes_2025_actual
      ${whereClause}
      GROUP BY tipoDano
      ORDER BY total_danos DESC
    `, { replacements: params });
    
    // ... resto de consultas
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
```

## 📊 Consultas Útiles para la Vista Unificada

### **1. Resumen General**
```sql
SELECT 
  source,
  COUNT(*) as total_ordenes,
  COALESCE(SUM(mts2sector), 0) as total_mt2,
  COALESCE(SUM(cantidadDano), 0) as total_danos
FROM vw_ordenes_2025_actual
WHERE YEAR(fechaOrdenServicio) = 2025
GROUP BY source
ORDER BY total_ordenes DESC;
```

### **2. Daños por Tipo y Origen**
```sql
SELECT 
  source,
  COALESCE(tipoDano, 'Sin tipo') as tipo_dano,
  COUNT(*) as cantidad,
  COALESCE(SUM(cantidadDano), 0) as total_danos
FROM vw_ordenes_2025_actual
WHERE YEAR(fechaOrdenServicio) = 2025 
  AND cantidadDano > 0
GROUP BY source, tipoDano
ORDER BY total_danos DESC;
```

### **3. Rendimiento por Sector**
```sql
SELECT 
  nombreSector,
  source,
  COUNT(*) as ordenes,
  COALESCE(SUM(mts2sector), 0) as mt2_total,
  COALESCE(SUM(cantidadDano), 0) as total_danos
FROM vw_ordenes_2025_actual
WHERE YEAR(fechaOrdenServicio) = 2025
GROUP BY nombreSector, source
ORDER BY mt2_total DESC;
```

### **4. Evolución Mensual**
```sql
SELECT 
  DATE_FORMAT(fechaOrdenServicio, '%Y-%m') as periodo,
  source,
  COUNT(*) as ordenes,
  COALESCE(SUM(mts2sector), 0) as mt2_total,
  COALESCE(SUM(cantidadDano), 0) as total_danos
FROM vw_ordenes_2025_actual
WHERE fechaOrdenServicio >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(fechaOrdenServicio, '%Y-%m'), source
ORDER BY periodo ASC;
```

## 🎯 Próximos Pasos

### **1. Implementar en Dashboard**
- [ ] Actualizar `getDashboardMetrics` para usar `vw_ordenes_2025_actual`
- [ ] Actualizar `getChartData` para usar la vista unificada
- [ ] Agregar filtro por `source` (histórico vs activo)

### **2. Implementar en Daños**
- [ ] Actualizar controlador de daños para usar la vista unificada
- [ ] Agregar comparación entre datos históricos y actuales
- [ ] Implementar filtros por origen

### **3. Mejoras en Frontend**
- [ ] Agregar selector de origen (Histórico/Actual/Todos)
- [ ] Mostrar comparativas entre fuentes de datos
- [ ] Implementar gráficos comparativos

## 🔍 Ventajas de Usar la Vista Unificada

### **1. Datos Unificados**
- ✅ Una sola fuente de datos para dashboard y daños
- ✅ Datos históricos y actuales en la misma consulta
- ✅ Fácil comparación entre períodos

### **2. Flexibilidad**
- ✅ Filtro por origen (`source`)
- ✅ Filtro por año y mes
- ✅ Consultas optimizadas

### **3. Mantenibilidad**
- ✅ Vista centralizada
- ✅ Cambios automáticos en todas las consultas
- ✅ Estructura consistente

---

**📅 Fecha**: Enero 2025  
**🎯 Estado**: Pendiente de implementación  
**📋 Objetivo**: Usar `vw_ordenes_2025_actual` en Dashboard y Daños existentes 