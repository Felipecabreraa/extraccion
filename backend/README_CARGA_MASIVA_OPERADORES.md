# Carga Masiva de Operadores

## Descripción
Esta funcionalidad permite agregar múltiples operadores al sistema de forma masiva, ya sea manualmente o importando archivos CSV/Excel.

## Estructura de la Tabla
La tabla `operador` tiene la siguiente estructura:
- `id` (INTEGER, AUTO_INCREMENT, PRIMARY KEY)
- `nombre` (VARCHAR(50), NOT NULL)
- `apellido` (VARCHAR(50), NOT NULL)

## Endpoints

### POST /api/operadores/carga-masiva
Crea múltiples operadores en una sola operación.

**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "operadores": [
    {
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    {
      "nombre": "María",
      "apellido": "González"
    }
  ]
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "2 operadores creados exitosamente",
  "operadores": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    {
      "id": 2,
      "nombre": "María",
      "apellido": "González"
    }
  ]
}
```

## Validaciones

### Validaciones del Backend
1. **Array requerido**: El campo `operadores` debe ser un array
2. **Array no vacío**: El array no puede estar vacío
3. **Campos obligatorios**: Cada operador debe tener `nombre` y `apellido`
4. **Tipos de datos**: Los campos deben ser strings
5. **Campos no vacíos**: Los campos no pueden estar vacíos después de trim()
6. **Longitud máxima**: Los campos no pueden exceder 50 caracteres

### Mensajes de Error
- `"Se requiere un array de operadores"` - Cuando no se envía el array
- `"El array de operadores no puede estar vacío"` - Cuando el array está vacío
- `"Operador X: Los campos nombre y apellido son obligatorios"` - Cuando faltan campos
- `"Operador X: Los campos nombre y apellido deben ser texto"` - Cuando los tipos son incorrectos
- `"Operador X: Los campos nombre y apellido no pueden estar vacíos"` - Cuando los campos están vacíos
- `"Operador X: Los campos nombre y apellido no pueden exceder 50 caracteres"` - Cuando exceden la longitud

## Frontend

### Componente: CargaMasivaOperadores
Ubicado en: `frontend/src/components/CargaMasivaOperadores.jsx`

**Funcionalidades:**
- Agregar filas manualmente
- Descargar plantilla CSV
- Importar archivos CSV/Excel
- Validación en tiempo real
- Guardar datos masivamente

### Integración
El componente está integrado en la página `BulkUpload` y se puede acceder seleccionando "Operadores" en el dropdown.

## Archivos de Plantilla

### plantilla_operadores_ejemplo.csv
Contiene datos de ejemplo para operadores:
```csv
Nombre;Apellido
Juan;Pérez
María;González
Carlos;Rodríguez
Ana;López
Luis;Martínez
```

## Scripts de Prueba

### test-carga-masiva-operadores.js
Script para probar la funcionalidad de carga masiva:
```bash
cd backend
node test-carga-masiva-operadores.js
```

**Pruebas incluidas:**
1. Carga masiva exitosa
2. Verificación de datos creados
3. Validación de array vacío
4. Validación de campos faltantes
5. Validación de campos vacíos

## Permisos
- **Crear operadores**: Administrador, Supervisor
- **Carga masiva**: Solo Administrador

## Uso

### 1. Carga Manual
1. Navegar a "Carga Masiva" → "Operadores"
2. Hacer clic en "Agregar Fila"
3. Completar los campos Nombre y Apellido
4. Repetir para más operadores
5. Hacer clic en "Guardar Datos"

### 2. Carga por Archivo
1. Descargar la plantilla con "Descargar Plantilla"
2. Completar el archivo CSV con los datos
3. Hacer clic en "Importar Excel/CSV"
4. Seleccionar el archivo
5. Revisar los datos importados
6. Hacer clic en "Guardar Datos"

## Notas Técnicas
- Los IDs se generan automáticamente
- No se permiten duplicados basados en nombre + apellido
- La operación es atómica (todo o nada)
- Se valida cada operador antes de la inserción 