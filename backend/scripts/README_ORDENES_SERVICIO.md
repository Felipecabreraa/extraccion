# Procesamiento de Órdenes de Servicio

Este conjunto de scripts permite convertir archivos JSON de órdenes de servicio a formato Excel compatible con la estructura de la base de datos para realizar cargas masivas.

## Archivos Incluidos

1. **`convertir_ordenes_servicio.js`** - Convierte JSON a Excel
2. **`completar_referencias.js`** - Completa IDs de referencia automáticamente
3. **`procesar_ordenes_servicio.js`** - Script principal que combina ambos procesos

## Requisitos

- Node.js instalado
- Dependencias del proyecto instaladas (`npm install`)
- Archivo JSON de órdenes de servicio
- Base de datos configurada y funcionando

## Uso Rápido

### Opción 1: Proceso Completo (Recomendado)

```bash
cd backend/scripts
node procesar_ordenes_servicio.js "C:\Users\pipe\Downloads\ordenesservicio.json" --supervisor "Juan Pérez" --sector "Sector A"
```

### Opción 2: Proceso por Pasos

1. **Convertir JSON a Excel:**
```bash
cd backend/scripts
node convertir_ordenes_servicio.js "C:\Users\pipe\Downloads\ordenesservicio.json"
```

2. **Completar referencias:**
```bash
node completar_referencias.js "ordenes_servicio_convertidas_2024-01-01.xlsx"
```

## Opciones Disponibles

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| `--supervisor` | Nombre del supervisor por defecto | `--supervisor "Juan Pérez"` |
| `--sector` | Nombre del sector por defecto | `--sector "Sector A"` |
| `--pabellon` | Nombre del pabellón por defecto | `--pabellon "Pabellón 1"` |
| `--maquina` | Número de máquina por defecto | `--maquina "M001"` |
| `--patente` | Patente de máquina por defecto | `--patente "ABC123"` |
| `--operador` | Nombre del operador por defecto | `--operador "Carlos López"` |

## Archivos Generados

### 1. Archivo Principal de Datos
- **Nombre:** `ordenes_servicio_convertidas_YYYY-MM-DD.xlsx`
- **Contenido:** Datos mapeados a la estructura de la DB
- **Hojas:**
  - `Planillas` - Información de planillas
  - `Danos` - Información de daños
  - `MaquinasPlanilla` - Relación máquinas-planillas
  - `PabellonesMaquina` - Relación pabellones-máquinas

### 2. Archivo de Mapeo de Referencias
- **Nombre:** `mapeo_referencias_YYYY-MM-DD.xlsx`
- **Contenido:** Lista de entidades encontradas en el JSON
- **Hojas:**
  - `Supervisores` - Supervisores identificados
  - `Sectores` - Sectores identificados
  - `Pabellones` - Pabellones identificados
  - `Maquinas` - Máquinas identificadas
  - `Operadores` - Operadores identificados

### 3. Archivo con Referencias Completadas
- **Nombre:** `ordenes_servicio_completadas_YYYY-MM-DD.xlsx`
- **Contenido:** Datos con IDs de referencia completados automáticamente

## Estructura del JSON Esperada

El script espera un JSON con la siguiente estructura:

```json
[
  {
    "numero_orden": "ORD-001",
    "fecha_inicio": "2024-01-01",
    "fecha_termino": "2024-01-02",
    "supervisor": "Juan Pérez",
    "sector": "Sector A",
    "metros_cuadrados": 1000,
    "observaciones": "Limpieza general",
    "pabellones": [
      {
        "nombre": "Pabellón 1",
        "estado": "PENDIENTE",
        "observacion": "Requiere limpieza"
      }
    ],
    "maquinas": [
      {
        "numero": "M001",
        "patente": "ABC123",
        "marca": "Marca A",
        "modelo": "Modelo X",
        "horas_trabajo": 8
      }
    ],
    "operadores": [
      {
        "nombre": "Carlos López",
        "rut": "12.345.678-9"
      }
    ],
    "danos": [
      {
        "tipo": "infraestructura",
        "descripcion": "Piso dañado",
        "cantidad": 1,
        "observacion": "Requiere reparación"
      }
    ]
  }
]
```

## Campos Mapeados

### Planillas
- `supervisor_id` → Busca supervisor por nombre
- `sector_id` → Busca sector por nombre
- `mt2` → `metros_cuadrados`
- `pabellones_total` → Número de pabellones en la orden
- `fecha_inicio` → `fecha_inicio`
- `fecha_termino` → `fecha_termino`
- `ticket` → `numero_orden`
- `observacion` → `observaciones`

### Daños
- `planilla_id` → Se asigna después de crear la planilla
- `pabellon_id` → Busca pabellón por nombre
- `maquina_id` → Busca máquina por número/patente
- `tipo` → `tipo` (infraestructura/equipo)
- `descripcion` → `descripcion`
- `cantidad` → `cantidad`
- `observacion` → `observacion`

### Máquinas Planilla
- `planilla_id` → Se asigna después de crear la planilla
- `maquina_id` → Busca máquina por número/patente
- `operador_id` → Busca operador por nombre
- `fecha_inicio` → `fecha_inicio` de la máquina o planilla
- `horas_trabajo` → `horas_trabajo`

### Pabellones Máquina
- `planilla_id` → Se asigna después de crear la planilla
- `pabellon_id` → Busca pabellón por nombre
- `maquina_id` → Busca máquina por número/patente
- `fecha_limpieza` → `fecha_limpieza` del pabellón o fecha de la planilla
- `estado` → `estado` del pabellón

## Carga Masiva

Una vez generados los archivos Excel, puedes usar los endpoints de carga masiva existentes:

### Endpoints Disponibles

1. **Planillas:** `POST /api/bulk/planillas`
2. **Daños:** `POST /api/bulk/danos`
3. **Máquinas Planilla:** `POST /api/bulk/maquinas-planilla`
4. **Pabellones Máquina:** `POST /api/bulk/pabellones-maquina`

### Ejemplo de Uso

```javascript
// Usando el frontend
// 1. Ve a la página de Carga Masiva
// 2. Selecciona el tipo de datos
// 3. Sube el archivo Excel correspondiente
// 4. Revisa los resultados de la importación
```

## Solución de Problemas

### Error: "No se pudo leer el archivo JSON"
- Verifica que la ruta del archivo sea correcta
- Asegúrate de que el archivo JSON sea válido
- Usa comillas dobles en la ruta si contiene espacios

### Error: "Campos requeridos faltantes"
- Revisa la estructura del JSON
- Asegúrate de que los campos obligatorios estén presentes
- Verifica el formato de las fechas

### Error: "Zona/Sector/Pabellón no encontrado"
- Verifica que las entidades existan en la base de datos
- Revisa el archivo de mapeo de referencias
- Completa manualmente los IDs faltantes

### Error: "Máquina ya existe"
- Verifica que no haya duplicados en la base de datos
- Revisa números de máquina y patentes
- Actualiza los datos duplicados si es necesario

## Verificación Post-Importación

1. **Revisa los logs de importación** para verificar errores
2. **Consulta la base de datos** para confirmar que los datos se importaron
3. **Verifica las relaciones** entre las tablas
4. **Revisa la integridad de los datos** importados

## Notas Importantes

- Los scripts asumen que la base de datos está configurada y funcionando
- Las búsquedas de referencias son case-insensitive y usan LIKE
- Los IDs de planilla se asignan después de crear las planillas
- Es recomendable hacer una copia de seguridad antes de importar
- Revisa siempre los archivos generados antes de la importación

## Soporte

Si encuentras problemas:

1. Revisa los logs de error
2. Verifica la estructura del JSON
3. Confirma que la base de datos esté funcionando
4. Revisa que las dependencias estén instaladas 