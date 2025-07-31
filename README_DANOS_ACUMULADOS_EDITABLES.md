# 📊 Sistema de Reporte de Daños Acumulados - EDITABLE

## 🎯 Funcionalidades Implementadas

### ✅ **Edición de Registros**
- **Edición individual**: Cada registro puede ser editado haciendo clic en "Editar"
- **Modal mejorado**: Formulario que maneja tanto creación como edición
- **Validación**: Campos con validación y formato de moneda chilena
- **Feedback visual**: Chips que indican si los datos están cargados

### ✅ **Carga Masiva de Datos**
- **Importación Excel**: Sube archivos Excel (.xlsx) con tus datos reales
- **Vista previa**: Revisa los datos antes de cargarlos
- **Validación automática**: Verifica que las columnas requeridas estén presentes
- **Procesamiento en lote**: Carga múltiples registros de una vez

### ✅ **Gestión de Datos**
- **Tabla interactiva**: Muestra todos los registros con botones de edición
- **Indicadores visuales**: Chips que muestran el estado de los datos
- **Formato de moneda**: Valores formateados en pesos chilenos
- **Cálculos automáticos**: Acumulados y variaciones calculadas automáticamente

## 📋 Estructura del Archivo Excel

El archivo debe tener las siguientes columnas:

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `anio` | Número | Año del registro | 2024, 2025 |
| `mes` | Número | Mes del registro (1-12) | 1, 2, 3... |
| `valor_real` | Número | Valor real en pesos chilenos | 1500000 |
| `valor_ppto` | Número | Valor presupuestado en pesos chilenos | 1400000 |

## 🚀 Cómo Usar el Sistema

### 1. **Acceder al Sistema**
- URL: `http://localhost:3000/danos-acumulados`
- Navega a "Daños Acumulados" en el menú

### 2. **Editar Registros Individuales**
1. En la tabla, busca el mes que quieres editar
2. Haz clic en el botón "Editar"
3. Modifica los valores en el modal
4. Haz clic en "Actualizar"

### 3. **Cargar Datos Masivamente**
1. Prepara tu archivo Excel con la estructura correcta
2. Haz clic en "Carga Masiva" en la tabla
3. Selecciona tu archivo Excel
4. Revisa la vista previa
5. Haz clic en "Cargar Datos"

### 4. **Crear Nuevos Registros**
1. Haz clic en "Agregar Registro"
2. Completa los campos en el modal
3. Haz clic en "Guardar"

## 📁 Archivos Generados

### **Plantilla Excel**
- **Ubicación**: `backend/plantilla_danos_acumulados.xlsx`
- **Contenido**: Datos de ejemplo para 2024 y 2025
- **Uso**: Reemplaza con tus datos reales

### **Estructura del Archivo**
```excel
anio | mes | valor_real | valor_ppto
2024 | 1   | 1500000   | 1400000
2024 | 2   | 1800000   | 1600000
...
```

## 🔧 Funcionalidades Técnicas

### **Backend (Puerto 3001)**
- ✅ API endpoints para CRUD de registros
- ✅ Validación de datos
- ✅ Cálculos automáticos de acumulados
- ✅ Vista SQL para cálculos complejos

### **Frontend (Puerto 3000)**
- ✅ Interfaz responsive con Material-UI
- ✅ Gráficos interactivos con Recharts
- ✅ Formularios con validación
- ✅ Carga masiva con vista previa

### **Base de Datos**
- ✅ Tabla `reporte_danos_mensuales`
- ✅ Vista `vista_danos_acumulados`
- ✅ Índices optimizados
- ✅ Datos de ejemplo cargados

## 📊 KPIs y Métricas

### **Indicadores Principales**
- **Total Real Actual**: Suma de valores reales del año seleccionado
- **Total Presupuesto**: Suma de valores presupuestados del año seleccionado
- **Total Año Anterior**: Comparación con el año anterior
- **Variación Anual**: Porcentaje de cambio año a año

### **Gráficos Disponibles**
- **Línea Acumulada**: Evolución mensual de los tres valores
- **Barras Mensuales**: Comparación mensual directa
- **Resumen Ejecutivo**: Tabla con métricas clave

## 🛠️ Comandos Útiles

### **Generar Plantilla Excel**
```bash
cd backend
node generar-plantilla-excel.js
```

### **Verificar Estado del Sistema**
```bash
# Backend
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:3000
```

### **Reiniciar Servidores**
```bash
# Detener todos los procesos Node.js
taskkill /F /IM node.exe

# Iniciar sistema completo
npm start
```

## 📝 Notas Importantes

### **Formato de Datos**
- Los valores deben estar en pesos chilenos (sin puntos ni comas)
- Los meses deben ser números del 1 al 12
- Los años deben ser números de 4 dígitos

### **Validaciones**
- El sistema valida que las columnas requeridas estén presentes
- Los valores numéricos se convierten automáticamente
- Se muestran errores si los datos no son válidos

### **Rendimiento**
- La carga masiva procesa registros en paralelo
- Los gráficos se actualizan automáticamente
- Los cálculos se realizan en tiempo real

## 🎯 Próximos Pasos

1. **Cargar tus datos reales** usando la plantilla Excel
2. **Editar registros individuales** según sea necesario
3. **Revisar los gráficos** para análisis visual
4. **Exportar reportes** cuando sea necesario

¡El sistema está listo para usar con tus datos reales! 🚀 