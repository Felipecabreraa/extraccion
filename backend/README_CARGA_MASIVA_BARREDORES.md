# Carga Masiva de Barredores

## Descripción
Este módulo permite cargar múltiples barredores al catálogo de forma masiva mediante archivos Excel/CSV o entrada manual.

## Estructura de Datos

### Tabla `barredor_catalogo`
- **id**: Identificador único (auto-increment)
- **nombre**: Nombre del barredor (obligatorio)
- **apellido**: Apellido del barredor (obligatorio)

## Funcionalidades

### 1. Carga Manual
- Agregar filas individuales
- Edición en línea
- Validación en tiempo real
- Eliminación de filas

### 2. Importación de Archivos
- **Formatos soportados**: Excel (.xlsx) y CSV
- **Encabezados requeridos**: rut, nombre, apellido
- **Validación automática** de formato y duplicados

### 3. Exportación
- Descarga de plantilla Excel
- Incluye encabezados correctos
- Datos de ejemplo

### 4. Validaciones

#### Campos Obligatorios
- **Nombre**: No puede estar vacío
- **Apellido**: No puede estar vacío



#### Validaciones de Negocio
- **Duplicados en tabla**: No se permiten nombres completos duplicados en la misma carga
- **Duplicados en BD**: No se permiten barredores que ya existen en el catálogo
- **Formato RUT**: Validación de formato chileno estándar

## API Endpoints

### POST `/api/bulk-upload/barredores-catalogo`
Carga masiva de barredores al catálogo.

**Body:**
```json
{
  "data": [
    {
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Procesados 1 registros",
  "success": 1,
  "errors": 0,
  "details": {
    "success": [
      {
        "id": 1,
        "nombre": "Juan Pérez"
      }
    ],
    "errors": []
  }
}
```

### GET `/api/barredores-catalogo`
Obtiene todos los barredores del catálogo.

## Flujo de Trabajo

1. **Selección de método**:
   - Carga manual (agregar filas)
   - Importación de archivo
   - Descarga de plantilla

2. **Validación**:
   - Campos obligatorios
   - Formato de RUT
   - Duplicados

3. **Guardado**:
   - Solo se guardan registros válidos
   - Reporte de errores detallado
   - Actualización automática de lista

## Archivos de Ejemplo

### plantilla_barredores_vacia.csv
```csv
nombre,apellido
```

### plantilla_barredores_ejemplo.csv
```csv
nombre,apellido
Juan,Pérez
María,González
Carlos,López
```

## Consideraciones Importantes

### Relación con Planillas
- Los barredores del catálogo se pueden asignar a planillas
- La tabla `barredor` conecta barredores con planillas específicas
- Campos adicionales en planillas: `dias`, `horas_extras`

### Seguridad
- Solo usuarios con rol `administrador` pueden acceder
- Validación de autenticación requerida
- Sanitización de datos de entrada

### Rendimiento
- Procesamiento por lotes
- Timeout de 60 segundos para cargas grandes
- Validación previa antes del guardado

## Errores Comunes

1. **"Nombre vacío"**: Campo nombre es obligatorio
2. **"Apellido vacío"**: Campo apellido es obligatorio

4. **"Barredor duplicado en la tabla"**: Mismo nombre completo en la carga
5. **"Ya existe en la base de datos"**: Barredor ya está en el catálogo

## Próximas Funcionalidades

- [ ] Carga masiva de asignación a planillas
- [ ] Validación de RUT con dígito verificador
- [ ] Importación desde sistemas externos
- [ ] Exportación de reportes de barredores 