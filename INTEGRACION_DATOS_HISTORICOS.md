# 📊 Integración de Datos Históricos de Daños - 2024

## 🎯 Objetivo

Integrar los datos históricos de daños del año 2024 desde la tabla `migracion_ordenes` al sistema de análisis de daños, permitiendo:

- **Visualizar** la cantidad total de daños ocurridos durante el 2024
- **Comparar** con otros años y datos actuales
- **Tener un resumen visual** sin modificar los datos originales
- **Mantener separados** los datos históricos de los actuales

## 🏗️ Arquitectura de la Solución

### **Fuentes de Datos**

1. **Datos Actuales**: Tabla `dano` del sistema nuevo
2. **Datos Históricos**: Tabla `migracion_ordenes` del sistema anterior

### **Endpoints Creados**

| Endpoint | Descripción | Parámetros |
|----------|-------------|------------|
| `GET /api/dashboard/danos/combinadas` | Datos actuales + históricos | `year`, `month` |
| `GET /api/dashboard/danos/historicos` | Solo datos históricos | `year`, `month` |
| `GET /api/dashboard/danos/comparar` | Comparación entre años | `anioActual`, `anioComparacion` |

## 🚀 Funcionalidades Implementadas

### **1. Análisis Combinado**
- **Total Combinado**: Suma de datos actuales + históricos
- **Separación por Fuente**: Distingue entre sistema nuevo y anterior
- **Metadatos**: Información sobre las fuentes de datos

### **2. Análisis Histórico Puro**
- **Datos del 2024**: Solo información de `migracion_ordenes`
- **Estructura Adaptativa**: Detecta automáticamente campos de la tabla
- **Filtros Temporales**: Por año y mes

### **3. Comparación de Años**
- **Comparación Lado a Lado**: Dos años específicos
- **Cálculo de Variaciones**: Diferencia y porcentaje
- **Indicadores de Tendencia**: Incremento/decremento

## 📋 Estructura de la Tabla `migracion_ordenes`

### **Campos Detectados Automáticamente**

El sistema detecta automáticamente los siguientes tipos de campos:

- **Campos de Fecha**: `fecha_servicio`, `fecha_inicio`, `fecha`, etc.
- **Campos de Zona**: `zona`, `sector`, `nombre_zona`, etc.
- **Campos de Tipo**: `tipo_dano`, `tipo`, `categoria`, etc.
- **Campos de Descripción**: `descripcion`, `observacion`, `comentario`, etc.

### **Ejemplo de Estructura Esperada**

```sql
CREATE TABLE migracion_ordenes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fecha_servicio DATE,
  zona VARCHAR(100),
  sector VARCHAR(100),
  tipo_dano VARCHAR(50),
  descripcion TEXT,
  cantidad INT,
  observacion TEXT,
  -- otros campos...
);
```

## 🛠️ Implementación Técnica

### **Backend**

#### **1. Controlador Principal**
```javascript
// backend/src/controllers/danoHistoricoController.js
exports.getDanoStatsCombinadas = async (req, res) => {
  // Combina datos actuales + históricos
};

exports.getDanoStatsHistoricos = async (req, res) => {
  // Solo datos históricos
};

exports.compararAnios = async (req, res) => {
  // Comparación entre años
};
```

#### **2. Detección Automática de Campos**
```javascript
// Identifica campos relevantes automáticamente
const campoFecha = campos.find(c => 
  c.toLowerCase().includes('fecha') && 
  !c.toLowerCase().includes('creacion')
);

const campoZona = campos.find(c => 
  c.toLowerCase().includes('zona') || 
  c.toLowerCase().includes('sector')
);
```

#### **3. Consultas SQL Dinámicas**
```sql
-- Ejemplo de consulta adaptativa
SELECT 
  MONTH(${campoFecha}) as mes,
  COUNT(*) as cantidad
FROM migracion_ordenes 
WHERE YEAR(${campoFecha}) = ?
GROUP BY MONTH(${campoFecha})
ORDER BY mes ASC
```

### **Frontend**

#### **1. Página Principal**
```javascript
// frontend/src/pages/DanosHistoricos.jsx
const [tipoDatos, setTipoDatos] = useState('combinadas');
// 'combinadas', 'historicos', 'comparar'
```

#### **2. Componentes de Visualización**
- **KPIs Combinados**: Total actual + histórico
- **Gráficos Comparativos**: Lado a lado
- **Información de Fuentes**: Metadatos expandibles

#### **3. Controles de Filtrado**
- **Selector de Tipo**: Combinados/Históricos/Comparar
- **Selector de Año**: Años disponibles
- **Selector de Mes**: Filtro mensual (opcional)

## 📊 Visualizaciones Disponibles

### **1. KPIs Principales**
- **Total Combinado**: Actual + Histórico
- **Datos Actuales**: Solo sistema nuevo
- **Datos Históricos**: Solo sistema anterior (2024)
- **Zonas Afectadas**: Total de zonas

### **2. Gráficos**
- **Barras por Mes**: Evolución temporal
- **Donut por Zona**: Distribución geográfica
- **Comparación Lado a Lado**: Dos años
- **Heatmap**: Intensidad por día/mes

### **3. Información de Fuentes**
- **Fuente Actual**: Tabla `dano`
- **Fuente Histórica**: Tabla `migracion_ordenes`
- **Timestamp**: Última actualización

## 🔧 Configuración y Uso

### **1. Verificar Tabla Histórica**
```bash
cd backend
node analizar-migracion-ordenes.js
```

### **2. Acceder a la Interfaz**
1. Navegar a `/danos-historicos`
2. Seleccionar tipo de datos
3. Configurar filtros
4. Visualizar resultados

### **3. Endpoints de Prueba**
```bash
# Datos combinados
curl "http://localhost:3001/api/dashboard/danos/combinadas?year=2024"

# Solo históricos
curl "http://localhost:3001/api/dashboard/danos/historicos?year=2024"

# Comparación
curl "http://localhost:3001/api/dashboard/danos/comparar?anioActual=2024&anioComparacion=2023"
```

## 📈 Beneficios de la Integración

### **1. Visibilidad Completa**
- ✅ Datos históricos del 2024 visibles
- ✅ Comparación con datos actuales
- ✅ Análisis temporal completo

### **2. Flexibilidad**
- ✅ Datos separados por fuente
- ✅ Filtros configurables
- ✅ Visualizaciones adaptativas

### **3. Mantenibilidad**
- ✅ No modifica datos originales
- ✅ Detección automática de campos
- ✅ Código reutilizable

### **4. Escalabilidad**
- ✅ Fácil agregar más años históricos
- ✅ Estructura extensible
- ✅ APIs bien definidas

## 🚨 Consideraciones Importantes

### **1. Dependencias**
- La tabla `migracion_ordenes` debe existir
- Debe tener al menos un campo de fecha
- Los datos deben ser del 2024

### **2. Rendimiento**
- Consultas optimizadas con índices
- Cache automático del dashboard
- Timeouts configurados

### **3. Seguridad**
- Autenticación requerida
- Validación de parámetros
- Manejo de errores robusto

## 🔄 Próximos Pasos

### **1. Migración de Datos**
- Crear tabla `migracion_ordenes` si no existe
- Migrar datos del sistema anterior
- Validar integridad de datos

### **2. Mejoras Futuras**
- Agregar más años históricos
- Implementar cache avanzado
- Crear reportes automáticos

### **3. Monitoreo**
- Logs de consultas
- Métricas de rendimiento
- Alertas de errores

## 📞 Soporte

Para dudas o problemas con la integración:

1. **Verificar logs**: `backend/logs/`
2. **Revisar estructura**: Ejecutar script de análisis
3. **Probar endpoints**: Usar curl o Postman
4. **Consultar documentación**: Este README

---

**🎯 Resultado Final**: Sistema completo de análisis de daños que combina datos actuales e históricos del 2024, proporcionando una visión completa y comparativa sin modificar los datos originales. 