# Gestión de Zonas con Tipos Hembra-Macho

## Descripción

Se ha implementado una nueva funcionalidad para distinguir las zonas por tipo **Hembra** y **Macho** según la regla de negocio de la empresa:

- **Zona 1**: Tipo HEMBRA
- **Zona 2**: Tipo MACHO  
- **Zona 3**: Tipo HEMBRA
- **Zonas adicionales futuras**: Zonas pares = HEMBRA, Zonas impares = MACHO

**Formato de nombres**: Las zonas deben seguir el formato "Zona X" donde X es el número secuencial (Zona 1, Zona 2, Zona 3, etc.)

## Cambios Implementados

### Backend

#### 1. Modelo Zona (`backend/src/models/zona.js`)
- Agregado campo `tipo` con valores ENUM: 'HEMBRA', 'MACHO'
- Valor por defecto: 'HEMBRA'

#### 2. Migración (`backend/migrations/20250103130000-add-tipo-to-zona.js`)
- Agrega el campo `tipo` a la tabla `zona`
- Actualiza zonas existentes según la regla de negocio:
  - Zonas 1 y 3 → HEMBRA
  - Zona 2 → MACHO
  - Zonas adicionales: pares → HEMBRA, impares → MACHO
- Normaliza nombres al formato "Zona X"

#### 3. Controlador (`backend/src/controllers/zonaController.js`)
- Agregado filtro por tipo en el endpoint `GET /zonas`
- Nuevo endpoint `GET /zonas/estadisticas-tipo` para obtener estadísticas

#### 4. Rutas (`backend/src/routes/zonaRoutes.js`)
- Nueva ruta para estadísticas: `/estadisticas-tipo`

### Frontend

#### Página de Zonas (`frontend/src/pages/Zonas.jsx`)
- **Estadísticas visuales**: Cards con contadores por tipo
- **Filtros**: Dropdown para filtrar por tipo (Hembra/Macho)
- **Tabla mejorada**: Nueva columna "Tipo" con chips visuales
- **Formulario actualizado**: Campo de selección de tipo
- **Iconos**: Iconos de hembra/macho para mejor UX

## Instalación y Configuración

### 1. Ejecutar la Migración
```bash
cd backend
npx sequelize-cli db:migrate
```

### 2. Actualizar Zonas Existentes (Opcional)
```bash
cd backend
node scripts/update_zonas_tipo.js
```

### 3. Reiniciar Servicios
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm start
```

## Uso

### Filtros Disponibles
- **Todos**: Muestra todas las zonas
- **Hembra**: Solo zonas tipo HEMBRA
- **Macho**: Solo zonas tipo MACHO

### Crear/Editar Zonas
1. Hacer clic en "Agregar Zona" o editar una existente
2. Completar nombre de la zona (formato: "Zona X")
3. Seleccionar tipo: Hembra o Macho
4. Guardar

### Estadísticas
- Se muestran automáticamente en la parte superior
- Contadores actualizados en tiempo real
- Diseño visual diferenciado por tipo

## API Endpoints

### GET /zonas
**Parámetros de consulta:**
- `tipo`: Filtrar por tipo (HEMBRA/MACHO)
- `nombre`: Filtrar por nombre
- `limit`: Límite de resultados
- `offset`: Desplazamiento

**Ejemplo:**
```
GET /zonas?tipo=HEMBRA
```

### GET /zonas/estadisticas-tipo
**Respuesta:**
```json
[
  {
    "tipo": "HEMBRA",
    "cantidad": 2
  },
  {
    "tipo": "MACHO", 
    "cantidad": 1
  }
]
```

## Consideraciones Técnicas

### Base de Datos
- El campo `tipo` es obligatorio (NOT NULL)
- Valores permitidos: 'HEMBRA', 'MACHO'
- Índice recomendado para optimizar filtros

### Frontend
- Filtros aplicados en tiempo real
- Estadísticas actualizadas automáticamente
- Diseño responsivo para móviles

### Seguridad
- Endpoints protegidos con autenticación
- Validación de roles (administrador, supervisor)

## Mantenimiento

### Agregar Nuevas Zonas
- Al crear una nueva zona, usar formato "Zona X"
- El sistema asignará automáticamente el tipo según la regla:
  - Zonas 1, 3, 4, 6, 8... → HEMBRA
  - Zonas 2, 5, 7, 9... → MACHO

**Nota**: Actualmente solo existen 3 zonas (Zona 1, Zona 2, Zona 3)

### Modificar Tipos Existentes
- Usar el formulario de edición
- Los cambios se reflejan inmediatamente en estadísticas

### Backup
- Realizar backup antes de ejecutar migraciones
- Verificar integridad de datos después de cambios 