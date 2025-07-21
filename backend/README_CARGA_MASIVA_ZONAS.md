# Carga Masiva de Zonas

## Descripción

Sistema de carga masiva para zonas que permite importar múltiples zonas desde un archivo CSV, incluyendo el campo tipo (HEMBRA/MACHO).

**Formato de nombres**: Las zonas deben seguir el formato "Zona X" donde X es el número secuencial.

## Características

- ✅ **Descarga de plantilla CSV** con formato correcto
- ✅ **Validación completa** de datos antes de la carga
- ✅ **Reporte detallado** de éxitos y errores
- ✅ **Prevención de duplicados** por nombre
- ✅ **Soporte para tipo Hembra/Macho**
- ✅ **Interfaz intuitiva** con stepper de 3 pasos

## Formato del Archivo CSV

### Estructura Requerida
```csv
nombre,tipo
Zona 1,HEMBRA
Zona 2,MACHO
Zona 3,HEMBRA
Zona 4,MACHO
Zona 5,HEMBRA
Zona 6,MACHO
```

### Campos

| Campo | Tipo | Requerido | Descripción | Valores Permitidos |
|-------|------|-----------|-------------|-------------------|
| `nombre` | String | ✅ | Nombre de la zona | Formato: "Zona X" (X = número) |
| `tipo` | String | ✅ | Tipo de zona | `HEMBRA` o `MACHO` |

### Reglas de Validación

#### Nombre
- **Obligatorio**: No puede estar vacío
- **Formato**: Debe seguir el patrón "Zona X" donde X es un número
- **Longitud**: Máximo 100 caracteres
- **Unicidad**: No puede duplicar una zona existente (comparación case-insensitive)

#### Tipo
- **Obligatorio**: No puede estar vacío
- **Valores permitidos**: `HEMBRA` o `MACHO` (case-insensitive)
- **Normalización**: Se convierte automáticamente a mayúsculas

### Regla de Negocio para Tipos
- **Zona 1**: HEMBRA
- **Zona 2**: MACHO
- **Zona 3**: HEMBRA
- **Zonas adicionales futuras**: Zonas pares = HEMBRA, Zonas impares = MACHO

**Nota**: Actualmente solo existen 3 zonas en el sistema.

## Instalación

### 1. Dependencias
```bash
cd backend
npm install csv-parser multer
```

### 2. Crear directorio de uploads
```bash
mkdir uploads
```

### 3. Configurar permisos
```bash
chmod 755 uploads
```

## Uso

### Frontend

1. **Acceder a la página de Zonas**
2. **Hacer clic en "Carga Masiva"**
3. **Seguir el proceso de 3 pasos:**

#### Paso 1: Descargar Plantilla
- Hacer clic en "Descargar Plantilla"
- Se descarga automáticamente `plantilla_zonas.csv`

#### Paso 2: Cargar Archivo
- Completar la plantilla con los datos
- Seleccionar el archivo CSV
- Hacer clic en "Cargar Archivo"

#### Paso 3: Revisar Resultados
- Ver resumen de éxitos y errores
- Revisar detalles de cada zona creada
- Ver errores específicos por fila

### Backend API

#### Descargar Plantilla
```http
GET /api/zonas-carga-masiva/descargar-plantilla
Authorization: Bearer <token>
```

#### Cargar Archivo
```http
POST /api/zonas-carga-masiva/cargar
Authorization: Bearer <token>
Content-Type: multipart/form-data

archivo: <archivo_csv>
```

#### Obtener Estadísticas
```http
GET /api/zonas-carga-masiva/estadisticas
Authorization: Bearer <token>
```

## Respuestas de la API

### Carga Exitosa
```json
{
  "message": "Carga masiva completada",
  "resultados": {
    "exitosos": [
      {
        "fila": 2,
        "datos": {
          "nombre": "Zona 1",
          "tipo": "HEMBRA"
        },
        "zona": {
          "id": 4,
          "nombre": "Zona 1",
          "tipo": "HEMBRA"
        }
      }
    ],
    "errores": []
  },
  "resumen": {
    "total": 1,
    "exitosos": 1,
    "errores": 0
  }
}
```

### Errores de Validación
```json
{
  "resultados": {
    "errores": [
      {
        "fila": 3,
        "datos": {
          "nombre": "Zona Norte",
          "tipo": "INVALIDO"
        },
        "errores": [
          "El nombre debe seguir el formato 'Zona X'",
          "El tipo debe ser HEMBRA o MACHO"
        ]
      }
    ]
  }
}
```

## Validaciones Implementadas

### Validaciones de Datos
- ✅ Nombre no vacío
- ✅ Nombre sigue formato "Zona X"
- ✅ Nombre máximo 100 caracteres
- ✅ Tipo obligatorio
- ✅ Tipo válido (HEMBRA/MACHO)

### Validaciones de Negocio
- ✅ No duplicar zonas existentes
- ✅ Normalización de tipos a mayúsculas
- ✅ Limpieza de espacios en blanco

### Validaciones de Archivo
- ✅ Solo archivos CSV
- ✅ Tamaño máximo 5MB
- ✅ Formato correcto de columnas

## Manejo de Errores

### Errores de Archivo
- **Tipo incorrecto**: Solo se permiten archivos CSV
- **Tamaño excesivo**: Máximo 5MB
- **Archivo corrupto**: Validación de formato

### Errores de Datos
- **Campos faltantes**: Validación de obligatoriedad
- **Formato incorrecto**: Validación de formato "Zona X"
- **Valores inválidos**: Validación de formato
- **Duplicados**: Verificación de unicidad

### Errores del Sistema
- **Base de datos**: Errores de conexión o transacciones
- **Servidor**: Errores internos del sistema

## Seguridad

### Autenticación
- ✅ Todos los endpoints requieren token JWT
- ✅ Validación de roles (administrador)

### Validación de Archivos
- ✅ Verificación de tipo MIME
- ✅ Validación de extensión
- ✅ Límite de tamaño
- ✅ Limpieza automática de archivos temporales

### Sanitización
- ✅ Limpieza de espacios en blanco
- ✅ Normalización de tipos
- ✅ Prevención de inyección SQL

## Monitoreo y Logs

### Logs del Sistema
```javascript
// Ejemplo de logs generados
logger.info('Carga masiva iniciada', { usuario: req.user.id, archivo: req.file.originalname });
logger.warn('Errores en carga masiva', { errores: resultados.errores.length });
logger.error('Error en carga masiva', { error: error.message });
```

### Métricas
- Total de archivos procesados
- Tasa de éxito/error
- Tiempo de procesamiento
- Errores más comunes

## Mantenimiento

### Limpieza de Archivos
- Los archivos temporales se eliminan automáticamente
- Verificación periódica del directorio uploads

### Backup
- Realizar backup antes de cargas masivas grandes
- Verificar integridad de datos después de la carga

### Optimización
- Para archivos grandes, considerar procesamiento por lotes
- Implementar cola de trabajos para cargas masivas

## Ejemplos de Uso

### Plantilla de Ejemplo
```csv
nombre,tipo
Zona 1,HEMBRA
Zona 2,MACHO
Zona 3,HEMBRA
Zona 4,MACHO
Zona 5,HEMBRA
Zona 6,MACHO
```

### Casos de Uso Comunes
1. **Migración de datos**: Importar zonas desde sistemas legacy
2. **Configuración inicial**: Cargar zonas base del sistema
3. **Actualizaciones masivas**: Agregar nuevas zonas en lote

## Troubleshooting

### Problemas Comunes

#### Error: "El nombre debe seguir el formato 'Zona X'"
- **Causa**: Nombre no sigue el patrón requerido
- **Solución**: Usar formato "Zona 1", "Zona 2", etc.

#### Error: "Solo se permiten archivos CSV"
- **Causa**: Archivo con extensión incorrecta
- **Solución**: Guardar como .csv desde Excel/LibreOffice

#### Error: "El tipo debe ser HEMBRA o MACHO"
- **Causa**: Valor incorrecto en columna tipo
- **Solución**: Usar exactamente HEMBRA o MACHO

#### Error: "La zona ya existe"
- **Causa**: Nombre duplicado en la base de datos
- **Solución**: Verificar nombres únicos o editar zona existente

### Contacto
Para soporte técnico, contactar al equipo de desarrollo. 