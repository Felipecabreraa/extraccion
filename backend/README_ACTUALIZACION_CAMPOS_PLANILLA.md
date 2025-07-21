# Actualización Automática de Campos en Planillas

## 📋 Descripción

Este sistema implementa la **actualización automática** de los campos `pabellones_limpiados` y `mt2` en las planillas, asegurando que estos valores se mantengan sincronizados con los datos reales de la base de datos.

## 🎯 Campos que se Actualizan

### 1. `pabellones_limpiados`
- **Cálculo**: Número de pabellones únicos asignados a máquinas en la tabla `pabellon_maquina`
- **Actualización**: Automática cada vez que se agrega o elimina una asignación pabellón-máquina
- **Fuente**: Tabla `pabellon_maquina` filtrada por `planilla_id`

### 2. `mt2` (Metros Cuadrados)
- **Cálculo**: Valor del campo `mt2` del sector asociado a la planilla
- **Actualización**: Automática cuando se crea la planilla o se actualiza el sector
- **Fuente**: Campo `mt2` de la tabla `sector`

## 🔧 Implementación Técnica

### Backend (Node.js + Sequelize)

#### Controlador de Pabellón-Máquina (`pabellonMaquinaController.js`)

```javascript
// Función para actualizar pabellones limpiados y mt2 en la planilla
const actualizarPlanilla = async (planillaId) => {
  try {
    // Obtener la planilla
    const planilla = await Planilla.findByPk(planillaId);
    
    // Obtener el sector para los metros cuadrados
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
      mt2: sector.mt2
    });
  } catch (error) {
    console.error('Error actualizando planilla:', error);
  }
};
```

#### Métodos que Actualizan Automáticamente

1. **Crear asignación pabellón-máquina** (`POST /pabellon_maquina`)
2. **Eliminar asignación pabellón-máquina** (`DELETE /pabellon_maquina/:id`)
3. **Listar asignaciones** (`GET /pabellon_maquina?planilla_id=X`)

#### Endpoint para Forzar Actualización

```javascript
// POST /api/planillas/:id/actualizar-campos-calculados
exports.actualizarCamposCalculados = async (req, res) => {
  // Fuerza la actualización de campos calculados
};
```

## 🚀 Flujo de Actualización

### 1. Creación de Planilla
```
Usuario crea planilla → Se obtiene mt2 del sector → Se establece pabellones_limpiados = 0
```

### 2. Asignación de Pabellones
```
Usuario asigna pabellón a máquina → Se actualiza pabellones_limpiados automáticamente
```

### 3. Eliminación de Asignaciones
```
Usuario elimina asignación → Se actualiza pabellones_limpiados automáticamente
```

### 4. Consulta de Planilla
```
Usuario consulta planilla → Se muestran valores actualizados de la base de datos
```

## 📊 Scripts de Utilidad

### 1. Actualizar Planillas Existentes
```bash
cd backend/scripts
node actualizar_campos_planillas_existentes.js
```

**Funcionalidad:**
- Actualiza todas las planillas existentes con los valores correctos
- Calcula `pabellones_limpiados` basado en asignaciones reales
- Establece `mt2` basado en el sector correspondiente

### 2. Probar Actualización
```bash
cd backend
node test-actualizacion-campos-planilla.js
```

**Funcionalidad:**
- Prueba la actualización automática de campos
- Verifica que los valores se guarden correctamente
- Simula el flujo completo de asignación de pabellones

## 🔍 Verificación de Funcionamiento

### 1. Verificar en Base de Datos
```sql
-- Verificar valores actuales
SELECT id, pabellones_limpiados, mt2, sector_id 
FROM planilla 
WHERE id = [PLANILLA_ID];

-- Verificar asignaciones de pabellones
SELECT COUNT(DISTINCT pabellon_id) as pabellones_limpiados
FROM pabellon_maquina 
WHERE planilla_id = [PLANILLA_ID];

-- Verificar mt2 del sector
SELECT mt2 
FROM sector 
WHERE id = [SECTOR_ID];
```

### 2. Verificar en Frontend
- Los valores se muestran correctamente en la tabla de planillas
- Los valores se actualizan automáticamente al asignar/eliminar pabellones
- Los valores persisten después de recargar la página

## ⚠️ Consideraciones Importantes

### 1. Transacciones
- Las actualizaciones se realizan dentro de transacciones para garantizar consistencia
- Si falla la actualización, no se afecta la operación principal

### 2. Logging
- Todas las actualizaciones se registran en los logs del servidor
- Se pueden monitorear los cambios en tiempo real

### 3. Performance
- Las actualizaciones son eficientes y no afectan el rendimiento
- Se utilizan consultas optimizadas para contar pabellones únicos

### 4. Manejo de Errores
- Si falla la actualización automática, no se interrumpe el flujo principal
- Los errores se registran para debugging posterior

## 🛠️ Solución de Problemas

### Problema: Los campos no se actualizan
**Solución:**
1. Verificar que el backend esté corriendo
2. Revisar los logs del servidor
3. Ejecutar el script de actualización manual
4. Verificar que las relaciones entre tablas sean correctas

### Problema: Valores incorrectos
**Solución:**
1. Ejecutar el script de actualización de planillas existentes
2. Verificar que los sectores tengan valores de `mt2` correctos
3. Revisar las asignaciones de pabellones en `pabellon_maquina`

### Problema: Actualización lenta
**Solución:**
1. Verificar el rendimiento de la base de datos
2. Revisar si hay muchas asignaciones de pabellones
3. Considerar optimizar las consultas si es necesario

## 📈 Monitoreo

### Logs a Revisar
```
🔄 Actualizando planilla ID: [ID]
📊 Datos calculados: pabellones_limpiados=[X], mt2=[Y]
✅ Planilla [ID] actualizada exitosamente
```

### Métricas a Seguir
- Número de actualizaciones automáticas por día
- Tiempo promedio de actualización
- Errores de actualización
- Consistencia de datos

## 🎉 Beneficios

1. **Datos Consistentes**: Los valores siempre reflejan el estado real
2. **Actualización Automática**: No requiere intervención manual
3. **Trazabilidad**: Se puede rastrear cuándo y cómo se actualizaron los valores
4. **Confiabilidad**: Sistema robusto con manejo de errores
5. **Eficiencia**: Actualizaciones rápidas y optimizadas 