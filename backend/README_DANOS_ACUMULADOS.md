# 📊 Sistema de Reporte de Daños Acumulados por Valores Monetarios

## 🎯 Objetivo

Implementar una funcionalidad que permita registrar, comparar y visualizar los valores monetarios de daños acumulados por año, considerando:

- 🔴 **Valor real acumulado** del año actual (ej: 2025)
- 🔵 **Valor presupuestado acumulado** del año actual  
- 🟡 **Valor real acumulado** del año anterior (ej: 2024)

Esto servirá para reportes mensuales y análisis al cierre del año.

## 🏗️ Estructura Técnica

### 1. Tabla: `reporte_danos_mensuales`

```sql
CREATE TABLE IF NOT EXISTS reporte_danos_mensuales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anio INT NOT NULL,
    mes INT NOT NULL, -- 1 = enero, ..., 12 = diciembre
    valor_real BIGINT DEFAULT 0,        -- Valor real del mes (en pesos)
    valor_ppto BIGINT DEFAULT 0,        -- Valor presupuestado del mes (en pesos)
    valor_anio_ant BIGINT DEFAULT 0,    -- Valor base del mismo mes del año anterior
    fecha_creacion DATETIME DEFAULT NOW(),
    fecha_actualizacion DATETIME DEFAULT NOW(),
    UNIQUE KEY uk_anio_mes (anio, mes)
);
```

### 2. Vista: `vista_danos_acumulados`

Vista que calcula los acumulados mes a mes:

```sql
CREATE OR REPLACE VIEW vista_danos_acumulados AS
SELECT 
    anio,
    mes,
    valor_real,
    valor_ppto,
    valor_anio_ant,

    SUM(valor_real) OVER (
        PARTITION BY anio ORDER BY mes
    ) AS real_acumulado,

    SUM(valor_ppto) OVER (
        PARTITION BY anio ORDER BY mes
    ) AS ppto_acumulado,

    SUM(valor_anio_ant) OVER (
        PARTITION BY anio ORDER BY mes
    ) AS anio_ant_acumulado

FROM reporte_danos_mensuales
ORDER BY anio, mes;
```

## 🔄 Flujo de Datos

### Carga de Datos

1. **Año base** (ej: 2024)
   - Se ingresan en `valor_real`
   - Se usan como `valor_anio_ant` para el siguiente año

2. **Año actual** (ej: 2025)
   - Se ingresan mes a mes en los campos:
     - `valor_real`
     - `valor_ppto`

### Cálculo de Variación Anual

La variación porcentual se calcula el 1 de enero del año siguiente:

```sql
SELECT 
    actual.anio AS anio_actual,
    anterior.anio AS anio_anterior,
    actual.total_real,
    anterior.total_real AS total_anio_anterior,
    ROUND(
        CASE 
            WHEN anterior.total_real = 0 THEN 0
            ELSE (actual.total_real - anterior.total_real) * 100.0 / anterior.total_real
        END
    , 2) AS variacion_anual
FROM (
    SELECT anio, SUM(valor_real) AS total_real
    FROM reporte_danos_mensuales
    GROUP BY anio
) actual
JOIN (
    SELECT anio + 1 AS anio, SUM(valor_real) AS total_real
    FROM reporte_danos_mensuales
    GROUP BY anio
) anterior ON actual.anio = anterior.anio;
```

## 📡 Endpoints de la API

### 1. Obtener Datos de Daños Acumulados
```http
GET /api/danos-acumulados?anio=2025
```

**Respuesta:**
```json
{
  "anio_actual": 2025,
  "anio_anterior": 2024,
  "datos_por_anio": {
    "2025": {
      "anio": 2025,
      "meses": {
        "1": {
          "mes": 1,
          "nombreMes": "Enero",
          "valor_real": 1600000,
          "valor_ppto": 1500000,
          "real_acumulado": 1600000,
          "ppto_acumulado": 1500000,
          "valor_real_formateado": "$1.600.000",
          "real_acumulado_formateado": "$1.600.000"
        }
      },
      "totales": {
        "real": 10400000,
        "ppto": 9500000
      }
    }
  },
  "datos_grafico": [...],
  "kpis": {
    "total_real_actual": 10400000,
    "total_real_actual_formateado": "$10.400.000",
    "total_real_anterior": 28000000,
    "total_real_anterior_formateado": "$28.000.000"
  }
}
```

### 2. Crear/Actualizar Registro Mensual
```http
POST /api/danos-acumulados/registro
Content-Type: application/json

{
  "anio": 2025,
  "mes": 6,
  "valor_real": 2700000,
  "valor_ppto": 2600000
}
```

### 3. Cargar Datos del Año Anterior
```http
POST /api/danos-acumulados/cargar-anio-anterior
Content-Type: application/json

{
  "anio_origen": 2024,
  "anio_destino": 2025
}
```

### 4. Calcular Variación Anual
```http
POST /api/danos-acumulados/calcular-variacion
Content-Type: application/json

{
  "anio_actual": 2025,
  "anio_anterior": 2024
}
```

### 5. Obtener Resumen Ejecutivo
```http
GET /api/danos-acumulados/resumen-ejecutivo?anio=2025
```

## 🚀 Instalación y Configuración

### 1. Ejecutar Migración
```bash
cd backend
npx sequelize-cli db:migrate
```

### 2. Configurar Sistema Completo
```bash
cd backend
node scripts/setup-danos-acumulados.js
```

### 3. Probar Sistema
```bash
cd backend
node scripts/test-danos-acumulados.js
```

## 📊 Estado Actual

| Año | Datos Cargados Hasta | Valor Acumulado Actual | Año Base |
|-----|---------------------|----------------------|----------|
| 2025 | Mayo | $14.071.338 | $19.085.662 |

## 🎨 Visualización Frontend

El frontend debe usar los acumulados para construir:

### Línea Comparativa Mensual
- **Eje X**: Mes
- **Eje Y**: Monto acumulado
- **Series**: Real, Presupuesto, Año Anterior

### Tabla Resumen Final
- Total Real año actual
- Total Real año anterior  
- % de variación

## 🔄 Flujo de Actualización Mensual

1. Se actualiza `valor_real` y `valor_ppto` mes a mes en 2025
2. En enero de 2026:
   - Se calcula el % de variación anual (contra 2024)
   - Se replica el real de 2025 como base (`valor_anio_ant`) para 2026

## 📋 Scripts Disponibles

### `scripts/setup-danos-acumulados.js`
Configuración completa del sistema:
- Ejecuta migración
- Crea vista
- Inserta datos de ejemplo

### `scripts/crear_vista_danos_acumulados.js`
Crea la vista SQL y datos de ejemplo

### `scripts/test-danos-acumulados.js`
Prueba todos los endpoints del sistema

## 🛠️ Modelo de Datos

### ReporteDanosMensuales
```javascript
{
  id: INTEGER (PK),
  anio: INTEGER (NOT NULL),
  mes: INTEGER (NOT NULL, 1-12),
  valor_real: BIGINT (DEFAULT 0),
  valor_ppto: BIGINT (DEFAULT 0),
  valor_anio_ant: BIGINT (DEFAULT 0),
  fecha_creacion: DATETIME,
  fecha_actualizacion: DATETIME
}
```

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante JWT token en el header:
```http
Authorization: Bearer <token>
```

## 📈 Fórmulas de Cálculo

### Variación Porcentual
```
Variación (%) = (Total Real Año Actual - Total Real Año Anterior) / Total Real Año Anterior × 100
```

### Cumplimiento Presupuestario
```
Cumplimiento (%) = (Total Real - Total Presupuesto) / Total Presupuesto × 100
```

## 🎯 Casos de Uso

1. **Reportes Mensuales**: Comparar valores reales vs presupuestados
2. **Análisis de Tendencias**: Ver evolución mes a mes
3. **Cierre Anual**: Calcular variación anual y preparar año siguiente
4. **Dashboard Ejecutivo**: KPIs de cumplimiento y variación

## 🔧 Mantenimiento

### Actualización Mensual
1. Ingresar valores reales y presupuestados del mes
2. Verificar acumulados en la vista
3. Generar reportes de cumplimiento

### Cierre Anual (Enero)
1. Calcular variación anual
2. Cargar datos del año anterior como base
3. Preparar presupuestos del nuevo año

## 📞 Soporte

Para dudas o problemas con el sistema de reporte de daños acumulados, contactar al equipo de desarrollo. 