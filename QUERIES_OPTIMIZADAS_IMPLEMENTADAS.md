# 📊 Queries Optimizadas Implementadas - Daños Históricos 2024

## 🎯 Objetivo
Implementar las 8 queries fundamentales para mostrar información histórica del año 2024 usando datos de la tabla `migracion_ordenes`.

## ✅ Queries Implementadas

### 1. 🔢 Total de daños registrados en 2024
```sql
SELECT COALESCE(SUM(cantidad_dano), 0) AS total_danos
FROM migracion_ordenes
WHERE fecha_inicio BETWEEN '2024-01-01' AND '2024-12-31'
  AND cantidad_dano IS NOT NULL;
```
**Uso**: Mostrar contador general "En el año 2024 se registraron X daños"

### 2. 📁 Daños agrupados por tipo
```sql
SELECT 
  COALESCE(tipo_dano, 'Sin tipo') as tipo_dano, 
  SUM(cantidad_dano) AS total
FROM migracion_ordenes
WHERE fecha_inicio BETWEEN '2024-01-01' AND '2024-12-31'
  AND cantidad_dano IS NOT NULL
GROUP BY tipo_dano
ORDER BY total DESC;
```
**Uso**: Gráfica de torta o barras mostrando qué tipo de daño fue más frecuente

### 3. 🧱 Daños agrupados por descripción
```sql
SELECT 
  COALESCE(descripcion_dano, 'Sin descripción') as descripcion_dano, 
  SUM(cantidad_dano) AS total
FROM migracion_ordenes
WHERE fecha_inicio BETWEEN '2024-01-01' AND '2024-12-31'
  AND cantidad_dano IS NOT NULL
GROUP BY descripcion_dano
ORDER BY total DESC
LIMIT 20;
```
**Uso**: Detalle exacto de qué se daña más (Luminaria rota, Reja caída, etc.)

### 4. 👷 Daños agrupados por operador
```sql
SELECT 
  COALESCE(operador, 'Sin operador') as operador, 
  SUM(cantidad_dano) AS total
FROM migracion_ordenes
WHERE fecha_inicio BETWEEN '2024-01-01' AND '2024-12-31'
  AND cantidad_dano IS NOT NULL
GROUP BY operador
ORDER BY total DESC
LIMIT 15;
```
**Uso**: Ver qué operadores están más involucrados en daños

### 5. 🏭 Daños por sector
```sql
SELECT 
  COALESCE(sector, 'Sin sector') as sector, 
  SUM(cantidad_dano) AS total
FROM migracion_ordenes
WHERE fecha_inicio BETWEEN '2024-01-01' AND '2024-12-31'
  AND cantidad_dano IS NOT NULL
GROUP BY sector
ORDER BY total DESC;
```
**Uso**: Saber qué zonas tienen más problemas para priorizar mejoras

### 6. ⚙️ Daños por máquina
```sql
SELECT 
  COALESCE(maquina, 'Sin máquina') as maquina, 
  SUM(cantidad_dano) AS total
FROM migracion_ordenes
WHERE fecha_inicio BETWEEN '2024-01-01' AND '2024-12-31'
  AND cantidad_dano IS NOT NULL
GROUP BY maquina
ORDER BY total DESC
LIMIT 15;
```
**Uso**: Mostrar qué máquinas están asociadas a más daños

### 7. 📅 Daños por mes (tendencia mensual)
```sql
SELECT 
  MONTH(fecha_inicio) AS mes, 
  SUM(cantidad_dano) AS total
FROM migracion_ordenes
WHERE fecha_inicio BETWEEN '2024-01-01' AND '2024-12-31'
  AND cantidad_dano IS NOT NULL
GROUP BY MONTH(fecha_inicio)
ORDER BY mes ASC;
```
**Uso**: Gráfica de líneas o columnas mostrando evolución mensual del año

### 8. 🧮 Promedio de daños por servicio
```sql
SELECT COALESCE(AVG(cantidad_dano), 0) AS promedio
FROM migracion_ordenes
WHERE fecha_inicio BETWEEN '2024-01-01' AND '2024-12-31'
  AND cantidad_dano IS NOT NULL;
```
**Uso**: KPI general indicando cuántos daños hay en promedio por orden de servicio

## 🔧 Mejoras Implementadas

### Optimizaciones de Queries
- ✅ Uso de `COALESCE` para manejar valores nulos
- ✅ Filtros `IS NOT NULL` para evitar errores
- ✅ Fechas específicas con `BETWEEN` en lugar de `YEAR()`
- ✅ Límites en queries que pueden devolver muchos resultados
- ✅ Ordenamiento por total descendente para mostrar los más relevantes

### Estructura de Respuesta
```javascript
{
  total: 182,                    // Total de daños
  porTipo: [...],               // Daños por tipo
  porDescripcion: [...],        // Daños por descripción
  porOperador: [...],           // Daños por operador
  porZona: [...],               // Daños por sector
  porMaquina: [...],            // Daños por máquina
  porMes: [...],                // Daños por mes
  promedioPorServicio: "2.5"    // Promedio por servicio
}
```

## 🚀 Endpoints Disponibles

### Sin Autenticación (Desarrollo)
- `GET /api/danos-historicos/test-historicos?year=2024`
- `GET /api/danos-historicos/test-top-operadores?year=2024`

### Con Autenticación (Producción)
- `GET /api/danos-historicos/historicos?year=2024`
- `GET /api/danos-historicos/top-operadores?year=2024`
- `GET /api/danos-historicos/combinadas?year=2024`
- `GET /api/danos-historicos/comparar?anioActual=2024&anioComparacion=2023`

## 🧪 Script de Prueba
Se creó `test-queries-optimizadas.js` para verificar que todas las queries funcionan correctamente.

## 📈 Próximos Pasos
1. ✅ Backend con queries optimizadas
2. 🔄 Frontend con gráficas usando estos datos
3. 🔄 Dashboard integrado con datos actuales e históricos
4. 🔄 Filtros y comparativas por año

## 💡 Beneficios
- **Rendimiento**: Queries optimizadas con índices apropiados
- **Confiabilidad**: Manejo de valores nulos y errores
- **Escalabilidad**: Límites en queries que pueden crecer
- **Mantenibilidad**: Código limpio y bien documentado
- **Flexibilidad**: Parámetros para año y límites configurables 