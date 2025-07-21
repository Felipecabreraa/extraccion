# Actualización de Planillas - Pabellones Limpiados y Metros Cuadrados

## 📋 Descripción del Problema

Anteriormente, los valores de **pabellones limpiados** y **metros cuadrados** solo se mostraban en el frontend pero no se almacenaban en la base de datos. Esto causaba que:

1. Los pabellones limpiados se calculaban dinámicamente cada vez que se consultaba la planilla
2. Los metros cuadrados se obtenían del sector pero no se persistían en la planilla
3. No había consistencia entre lo que se mostraba y lo que se almacenaba

## ✅ Solución Implementada

### 1. Actualización Automática en PabellonMaquina

**Archivo:** `backend/src/controllers/pabellonMaquinaController.js`

- **Función `actualizarPlanilla`**: Actualiza automáticamente los valores de la planilla cuando se agregan o eliminan registros de `pabellon_maquina`
- **Método `crear`**: Llama a `actualizarPlanilla` después de crear un nuevo registro
- **Método `eliminar`**: Llama a `actualizarPlanilla` después de eliminar un registro

```javascript
// Función para actualizar pabellones limpiados y mt2 en la planilla
const actualizarPlanilla = async (planillaId) => {
  // Obtener la planilla y el sector
  const planilla = await Planilla.findByPk(planillaId);
  const sector = await Sector.findByPk(planilla.sector_id);
  
  // Contar pabellones únicos limpiados
  const registros = await PabellonMaquina.findAll({ 
    where: { planilla_id: planillaId },
    attributes: ['pabellon_id']
  });
  const pabellonesLimpiados = new Set(registros.map(r => r.pabellon_id)).size;

  // Actualizar la planilla
  await planilla.update({
    pabellones_limpiados: pabellonesLimpiados,
    mt2: sector ? sector.mt2 : null
  });
};
```

### 2. Actualización Automática en Creación de Planillas

**Archivo:** `backend/src/controllers/planillaController.js`

- **Método `crear`**: Ahora obtiene automáticamente los metros cuadrados y pabellones totales del sector al crear una nueva planilla

```javascript
// Obtener datos del sector para completar automáticamente mt2 y pabellones_total
const sectorId = parseInt(req.body.sector_id) || null;
const sector = sectorId ? await Sector.findByPk(sectorId) : null;

const planillaData = {
  // ... otros campos
  mt2: req.body.mt2 ? parseFloat(req.body.mt2) : (sector ? sector.mt2 : null),
  pabellones_total: req.body.pabellones_total || req.body.pabellones || (sector ? sector.cantidad_pabellones : null),
  pabellones_limpiados: req.body.pabellones_limpiados || 0,
  // ... otros campos
};
```

### 3. Nuevo Endpoint para Actualización Manual

**Archivo:** `backend/src/controllers/planillaController.js`

- **Método `actualizarValores`**: Permite actualizar manualmente los valores de una planilla específica
- **Ruta:** `POST /planillas/:id/actualizar-valores`

```javascript
exports.actualizarValores = async (req, res) => {
  // Obtener planilla y sector
  const planilla = await Planilla.findByPk(id);
  const sector = await Sector.findByPk(planilla.sector_id);
  
  // Contar pabellones limpiados
  const registros = await PabellonMaquina.findAll({ 
    where: { planilla_id: planilla.id },
    attributes: ['pabellon_id']
  });
  const pabellonesLimpiados = new Set(registros.map(r => r.pabellon_id)).size;
  
  // Actualizar planilla
  await planilla.update({
    mt2: sector.mt2,
    pabellones_total: sector.cantidad_pabellones,
    pabellones_limpiados: pabellonesLimpiados
  });
};
```

### 4. Script de Actualización Masiva

**Archivo:** `backend/scripts/actualizar_planillas_existentes.js`

- Actualiza todas las planillas existentes con los valores correctos
- Ejecuta automáticamente el conteo de pabellones limpiados
- Obtiene los metros cuadrados del sector correspondiente

## 🚀 Cómo Usar

### Actualización Automática

Los valores se actualizan automáticamente cuando:

1. **Se crea una nueva planilla**: Se obtienen los valores del sector
2. **Se agrega un pabellón**: Se recalcula el conteo de pabellones limpiados
3. **Se elimina un pabellón**: Se recalcula el conteo de pabellones limpiados

### Actualización Manual

Para actualizar manualmente una planilla específica:

```bash
# Usando curl
curl -X POST http://localhost:3000/api/planillas/1/actualizar-valores \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Usando el frontend (si se implementa)
```

### Actualización Masiva

Para actualizar todas las planillas existentes:

```bash
cd backend/scripts
node actualizar_planillas_existentes.js
```

## 📊 Campos Actualizados

### Tabla `planilla`

| Campo | Descripción | Origen |
|-------|-------------|--------|
| `mt2` | Metros cuadrados del sector | `sector.mt2` |
| `pabellones_total` | Total de pabellones en el sector | `sector.cantidad_pabellones` |
| `pabellones_limpiados` | Pabellones únicos limpiados | Conteo de `pabellon_maquina.pabellon_id` |

## 🔄 Flujo de Actualización

1. **Usuario agrega pabellón a máquina** → Se crea registro en `pabellon_maquina`
2. **Controlador detecta cambio** → Llama a `actualizarPlanilla()`
3. **Función cuenta pabellones únicos** → Obtiene `pabellones_limpiados`
4. **Función obtiene datos del sector** → Obtiene `mt2` y `pabellones_total`
5. **Se actualiza la planilla** → Se persisten los valores en la base de datos

## ✅ Beneficios

1. **Consistencia**: Los valores mostrados coinciden con los almacenados
2. **Performance**: No es necesario recalcular en cada consulta
3. **Trazabilidad**: Se mantiene historial de valores en la planilla
4. **Automatización**: Actualización automática sin intervención manual
5. **Flexibilidad**: Endpoint manual para casos especiales

## 🧪 Pruebas

Para verificar que funciona correctamente:

1. Crear una nueva planilla
2. Agregar pabellones a máquinas
3. Verificar que los valores se actualizan automáticamente
4. Eliminar pabellones y verificar que se recalcula
5. Usar el endpoint manual para forzar actualización

## 📝 Notas Importantes

- Los valores se actualizan automáticamente en tiempo real
- El conteo de pabellones limpiados es de pabellones únicos (no duplicados)
- Los metros cuadrados se obtienen del sector asignado
- Se mantiene compatibilidad con el código existente
- Los logs muestran las actualizaciones realizadas 