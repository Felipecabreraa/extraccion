# Carga Masiva de Sectores

## Descripción
Esta funcionalidad permite cargar múltiples sectores de forma masiva desde un archivo CSV, incluyendo los campos **comuna**, **MT2** y **cantidad de pabellones**.

## Características

### ✅ Campos Incluidos
- **nombre**: Nombre del sector (requerido)
- **comuna**: Nombre de la comuna (opcional, texto)
- **mt2**: Metros cuadrados del sector (opcional, número decimal)
- **cantidad_pabellones**: Número de pabellones del sector (opcional, número entero)

### ✅ Funcionalidades
- Descarga de plantilla CSV con formato correcto
- Validación de datos antes de la carga
- Creación automática de pabellones según la cantidad especificada
- Manejo de errores y duplicados
- Vista previa de datos antes de la carga
- Reporte detallado de resultados

## Formato del Archivo CSV

### Encabezados Requeridos
```csv
nombre,comuna,mt2,cantidad_pabellones
```

### Ejemplo de Datos
```csv
nombre,comuna,mt2,cantidad_pabellones
Sector A,Comuna Norte,1500.50,10
Sector B,Comuna Sur,2200.75,15
Sector C,Comuna Este,1800.25,12
Sector D,Comuna Oeste,3000.00,20
```

### Reglas de Validación

#### Campo `nombre`
- ✅ **Requerido**: No puede estar vacío
- ✅ **Único**: No puede existir otro sector con el mismo nombre en la misma zona
- ✅ **Formato**: Texto libre

#### Campo `comuna`
- ✅ **Opcional**: Puede estar vacío
- ✅ **Formato**: Texto libre

#### Campo `mt2`
- ✅ **Opcional**: Puede estar vacío
- ✅ **Formato**: Número decimal mayor a 0
- ✅ **Ejemplos válidos**: `1500.50`, `2200.75`, `3000.00`

#### Campo `cantidad_pabellones`
- ✅ **Opcional**: Puede estar vacío
- ✅ **Formato**: Número entero mayor a 0
- ✅ **Ejemplos válidos**: `10`, `15`, `20`
- ✅ **Creación automática**: Si se especifica, se crearán automáticamente los pabellones numerados

## Uso en el Frontend

### 1. Acceder a la Funcionalidad
1. Ir a la página de **Sectores**
2. Seleccionar una **Zona**
3. Hacer clic en el botón **"Cargar Masivo"**

### 2. Descargar Plantilla
1. Hacer clic en **"Descargar Plantilla"**
2. Se descargará un archivo CSV con el formato correcto
3. Abrir el archivo en Excel o editor de texto

### 3. Preparar Datos
1. Llenar los datos en el archivo CSV
2. Guardar el archivo
3. Asegurarse de que el archivo tenga extensión `.csv`

### 4. Cargar Archivo
1. Hacer clic en **"Seleccionar Archivo CSV"**
2. Seleccionar el archivo preparado
3. Revisar la vista previa de datos
4. Hacer clic en **"Cargar Sectores"**

### 5. Revisar Resultados
- **Exitosos**: Sectores creados correctamente
- **Errores**: Problemas encontrados con datos específicos
- **Pabellones Creados**: Lista de pabellones creados automáticamente

## Endpoints de la API

### Descargar Plantilla
```
GET /api/sectores/descargar-plantilla
```

### Carga Masiva
```
POST /api/sectores/carga-masiva
```

#### Body de la Petición
```json
{
  "sectores": [
    {
      "nombre": "Sector A",
      "comuna": "Comuna Norte",
      "mt2": "1500.50",
      "cantidad_pabellones": "10"
    }
  ],
  "zona_id": 1
}
```

#### Respuesta
```json
{
  "message": "Carga masiva completada. 4 exitosos, 0 errores",
  "resultados": {
    "exitosos": [
      {
        "id": 1,
        "nombre": "Sector A",
        "comuna": "Comuna Norte",
        "mt2": 1500.50,
        "cantidad_pabellones": 10
      }
    ],
    "errores": [],
    "pabellonesCreados": [
      "Sector A - Pabellón 1",
      "Sector A - Pabellón 2"
    ]
  }
}
```

## Casos de Uso

### ✅ Casos Válidos
- Carga de múltiples sectores con todos los campos
- Carga de sectores solo con nombre (campos opcionales vacíos)
- Carga de sectores con diferentes comunas
- Carga de sectores con diferentes cantidades de pabellones
- Carga de sectores con diferentes valores de MT2

### ❌ Casos de Error
- Nombre de sector vacío
- MT2 con valor no numérico
- Cantidad de pabellones con valor no numérico
- Sector duplicado en la misma zona
- Archivo CSV con formato incorrecto

## Creación Automática de Pabellones

Cuando se especifica `cantidad_pabellones`, el sistema crea automáticamente:

1. **Pabellones numerados**: Pabellón 1, Pabellón 2, Pabellón 3, etc.
2. **Asociación automática**: Los pabellones se asocian al sector creado
3. **Sin duplicados**: Si ya existen pabellones, continúa desde el siguiente número

### Ejemplo
Si un sector tiene `cantidad_pabellones: 5`, se crearán:
- Pabellón 1
- Pabellón 2
- Pabellón 3
- Pabellón 4
- Pabellón 5

## Permisos Requeridos

- **Descargar plantilla**: Administrador, Supervisor
- **Carga masiva**: Solo Administrador

## Archivos Relacionados

### Backend
- `src/controllers/sectorController.js` - Lógica de carga masiva
- `src/routes/sectorRoutes.js` - Rutas de la API
- `src/models/sector.js` - Modelo de datos

### Frontend
- `src/components/CargaMasivaSectores.jsx` - Componente de carga masiva
- `src/pages/Sectores.jsx` - Integración en página de sectores

### Pruebas
- `test-carga-masiva-sectores.js` - Script de pruebas
- `plantilla_sectores_ejemplo.csv` - Archivo de ejemplo

## Solución de Problemas

### Error: "Encabezados faltantes"
- Verificar que el archivo CSV tenga los encabezados correctos
- Asegurarse de que no haya espacios extra en los encabezados

### Error: "MT2 debe ser un número mayor a 0"
- Verificar que el campo MT2 contenga solo números decimales
- Usar punto (.) como separador decimal, no coma (,)

### Error: "Cantidad de pabellones debe ser un número mayor a 0"
- Verificar que el campo cantidad_pabellones contenga solo números enteros
- No usar decimales en este campo

### Error: "El sector ya existe en esta zona"
- Verificar que no haya sectores duplicados en la zona
- Cambiar el nombre del sector o usar una zona diferente 