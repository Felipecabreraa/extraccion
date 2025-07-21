# 📊 Módulo de Análisis de Daños

## 🎯 Funcionalidades Implementadas

### 📈 Métricas Principales
- **Total Daños Año Actual**: Cantidad de daños registrados en el año en curso
- **Total General**: Cantidad total de daños registrados históricamente
- **Zonas Afectadas**: Número de zonas que han reportado daños
- **Tipos de Daño**: Categorías de daños registrados

### 📊 Análisis Detallado

#### 1. **Resumen Mensual**
- Gráfico de barras mostrando daños por mes del año actual
- Tabla detallada con cantidades por mes
- Nombres de meses en español

#### 2. **Análisis por Zona**
- Gráfico de barras con total anual por zona
- Tabla detallada con estadísticas por zona
- Ordenamiento por cantidad de daños

#### 3. **Tipos de Daño**
- Gráfico de barras por categoría de daño
- Tabla con distribución por tipo
- Tipos disponibles: `infraestructura` y `equipo`

#### 4. **Tendencia Anual**
- Gráfico de línea temporal con últimos 12 meses
- Análisis de tendencias y patrones
- Comparación año a año

### 🔄 Comparación Anual
- Comparación lado a lado entre año actual y anterior
- Cálculo de variación porcentual
- Indicadores visuales de tendencia (subida/bajada)

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js + Express**: API REST
- **Sequelize**: ORM para MySQL
- **MySQL**: Base de datos
- **JWT**: Autenticación

### Frontend
- **React**: Framework principal
- **Material-UI**: Componentes de interfaz
- **Axios**: Cliente HTTP
- **React Router**: Navegación

## 📁 Estructura de Archivos

```
backend/
├── src/
│   ├── controllers/
│   │   └── dashboardController.js    # Endpoint /api/dashboard/danos
│   ├── routes/
│   │   └── dashboardRoutes.js        # Ruta GET /danos
│   └── models/
│       └── dano.js                   # Modelo de datos
├── test-danos.js                     # Script de prueba
└── scripts/
    └── insertar_datos_danos.js       # Datos de prueba

frontend/
├── src/
│   ├── pages/
│   │   └── Danos.jsx                 # Página principal
│   ├── components/
│   │   └── Sidebar.jsx               # Navegación
│   └── config/
│       └── routes.js                 # Configuración de rutas
```

## 🚀 Instalación y Configuración

### 1. Backend
```bash
cd backend
npm install
```

### 2. Base de Datos
```bash
# Crear archivo .env con configuración de MySQL
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_de_datos
```

### 3. Datos de Prueba
```bash
cd backend
node scripts/insertar_datos_danos.js
```

### 4. Probar Endpoint
```bash
cd backend
node test-danos.js
```

### 5. Frontend
```bash
cd frontend
npm install
npm start
```

## 📊 Endpoints API

### GET /api/dashboard/danos
Obtiene todas las estadísticas de daños.

**Headers requeridos:**
```
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "totalAnual": {
    "actual": 15,
    "anterior": 12,
    "variacion": "25.0"
  },
  "porMes": [
    {
      "mes": 1,
      "cantidad": 3,
      "nombreMes": "enero"
    }
  ],
  "porZona": [
    {
      "zona": "Sector Norte",
      "cantidad": 5
    }
  ],
  "totalAnualPorZona": [
    {
      "zona": "Sector Norte",
      "total": 8
    }
  ],
  "totalGeneral": 27,
  "porTipo": [
    {
      "tipo": "infraestructura",
      "cantidad": 15
    }
  ],
  "ultimos12Meses": [
    {
      "periodo": "2024-06",
      "cantidad": 3
    }
  ]
}
```

## 🎨 Características de la Interfaz

### Diseño Moderno
- **Cards con métricas**: Diseño limpio y atractivo
- **Gráficos interactivos**: Barras con hover effects
- **Tabs organizadas**: Navegación intuitiva
- **Responsive**: Adaptable a diferentes pantallas

### Componentes Reutilizables
- `MetricCard`: Tarjetas de métricas principales
- `SimpleBarChart`: Gráficos de barras personalizados
- `DataTable`: Tablas de datos con formato

### Estados de Carga
- **Skeletons**: Indicadores de carga
- **Error handling**: Manejo de errores elegante
- **Refresh**: Botón de actualización manual

## 🔐 Permisos y Roles

- **Administrador**: Acceso completo
- **Supervisor**: Acceso completo
- **Operador**: Sin acceso (no aparece en navegación)

## 📈 Optimizaciones Implementadas

### Backend
- **Cache agresivo**: 10 minutos de cache
- **Timeouts**: Consultas con límite de tiempo
- **Consultas optimizadas**: Uso de índices y joins eficientes
- **Fallback data**: Respuestas de emergencia

### Frontend
- **Memoización**: Uso de useCallback para optimizar re-renders
- **Lazy loading**: Carga diferida de componentes
- **Error boundaries**: Manejo de errores en componentes
- **Skeletons**: Indicadores de carga mejoran UX

## 🧪 Testing

### Scripts de Prueba
1. **test-danos.js**: Prueba el endpoint completo
2. **insertar_datos_danos.js**: Crea datos de prueba

### Comandos de Prueba
```bash
# Probar endpoint
node test-danos.js

# Insertar datos de prueba
node scripts/insertar_datos_danos.js
```

## 🐛 Solución de Problemas

### Error: "Unknown column 'Sector.nombre'"
**Solución**: Usar `Planilla->Sector.nombre` en lugar de `Sector.nombre` en las consultas.

### Error: "No hay datos disponibles"
**Solución**: Ejecutar el script de datos de prueba.

### Error: "Timeout en consultas"
**Solución**: Verificar índices en la base de datos y optimizar consultas.

## 📝 Próximas Mejoras

- [ ] Gráficos más avanzados con Chart.js
- [ ] Exportación a PDF/Excel
- [ ] Filtros por fecha personalizada
- [ ] Alertas automáticas por umbrales
- [ ] Dashboard en tiempo real
- [ ] Notificaciones push

## 🤝 Contribución

Para contribuir al módulo de Daños:

1. Crear una rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Implementar cambios
3. Probar con datos de prueba
4. Crear pull request

## 📞 Soporte

Para soporte técnico o preguntas sobre el módulo de Daños, contactar al equipo de desarrollo. 