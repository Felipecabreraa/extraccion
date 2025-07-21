# Carga Masiva de Máquinas

## Descripción
Esta funcionalidad permite agregar múltiples máquinas al sistema de forma masiva, ya sea manualmente o importando archivos CSV/Excel.

## Estructura de la Tabla
La tabla `maquina` tiene la siguiente estructura:
- `id` (INTEGER, AUTO_INCREMENT, PRIMARY KEY)
- `numero` (VARCHAR(50), NOT NULL)
- `patente` (VARCHAR(20), NOT NULL)
- `marca` (VARCHAR(50), NOT NULL)
- `modelo` (VARCHAR(50), NOT NULL)

## Endpoints

### POST /api/maquinas/carga-masiva
Crea múltiples máquinas en una sola operación.

**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "maquinas": [
    {
      "numero": "001",
      "patente": "ABC123",
      "marca": "Toyota",
      "modelo": "Hilux 2020"
    },
    {
      "numero": "002",
      "patente": "XYZ789",
      "marca": "Ford",
      "modelo": "Ranger 2021"
    }
  ]
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "2 máquinas creadas exitosamente",
  "maquinas": [
    {
      "id": 1,
      "numero": "001",
      "patente": "ABC123",
      "marca": "Toyota",
      "modelo": "Hilux 2020"
    },
    {
      "id": 2,
      "numero": "002",
      "patente": "XYZ789",
      "marca": "Ford",
      "modelo": "Ranger 2021"
    }
  ]
}
```

## Validaciones

### Validaciones del Backend
1. **Array requerido**: El campo `maquinas` debe ser un array
2. **Array no vacío**: El array no puede estar vacío
3. **Campos obligatorios**: Cada máquina debe tener `numero`, `patente`, `marca` y `modelo`
4. **Tipos de datos**: Los campos deben ser strings
5. **Campos no vacíos**: Los campos no pueden estar vacíos después de trim()
6. **Longitud máxima**: 
   - `numero`: máximo 50 caracteres
   - `patente`: máximo 20 caracteres
   - `marca`: máximo 50 caracteres
   - `modelo`: máximo 50 caracteres

### Mensajes de Error
- `"Se requiere un array de máquinas"` - Cuando no se envía el array
- `"El array de máquinas no puede estar vacío"` - Cuando el array está vacío
- `"Máquina X: Los campos número, patente, marca y modelo son obligatorios"` - Cuando faltan campos
- `"Máquina X: Todos los campos deben ser texto"` - Cuando los tipos son incorrectos
- `"Máquina X: Ningún campo puede estar vacío"` - Cuando los campos están vacíos
- `"Máquina X: Los campos exceden la longitud máxima permitida"` - Cuando exceden la longitud

## Frontend

### Componente: CargaMasivaMaquinas
Ubicado en: `frontend/src/components/CargaMasivaMaquinas.jsx`

**Funcionalidades:**
- Agregar filas manualmente
- Descargar plantilla CSV
- Importar archivos CSV/Excel
- Validación en tiempo real
- Guardar datos masivamente

### Integración
El componente está integrado en la página `BulkUpload` y se puede acceder seleccionando "Máquinas" en el dropdown.

## Archivos de Plantilla

### plantilla_maquinas_ejemplo.csv
Contiene datos de ejemplo para máquinas:
```csv
Número;Patente;Marca;Modelo
001;ABC123;Toyota;Hilux 2020
002;XYZ789;Ford;Ranger 2021
003;DEF456;Chevrolet;Colorado 2019
004;GHI789;Nissan;Frontier 2022
005;JKL012;Mitsubishi;L200 2021
```

## Scripts de Prueba

### test-carga-masiva-maquinas.js
Script para probar la funcionalidad de carga masiva:
```bash
cd backend
node test-carga-masiva-maquinas.js
```

**Pruebas incluidas:**
1. Carga masiva exitosa
2. Verificación de datos creados
3. Validación de array vacío
4. Validación de campos faltantes
5. Validación de campos vacíos

## Permisos
- **Crear máquinas**: Administrador, Supervisor
- **Carga masiva**: Solo Administrador

## Uso

### 1. Carga Manual
1. Navegar a "Carga Masiva" → "Máquinas"
2. Hacer clic en "Agregar Fila"
3. Completar los campos Número, Patente, Marca y Modelo
4. Repetir para más máquinas
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
- No se permiten duplicados basados en número + patente
- La operación es atómica (todo o nada)
- Se valida cada máquina antes de la inserción
- Se usa punto y coma (;) como separador para compatibilidad con Excel 