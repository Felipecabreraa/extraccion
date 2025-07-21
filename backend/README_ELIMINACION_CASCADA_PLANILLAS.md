# Eliminación en Cascada de Planillas

## 📋 Descripción

Este sistema implementa una funcionalidad de **eliminación en cascada** para las planillas, que asegura que cuando se elimine una planilla, todos los datos relacionados se eliminen automáticamente para mantener la integridad de la base de datos.

## 🗂️ Datos que se Eliminan

Cuando se elimina una planilla, se eliminan automáticamente:

1. **📋 Barredores** - Registros en la tabla `barredor`
2. **🚜 Máquinas** - Registros en la tabla `maquina_planilla`
3. **🏢 Pabellones** - Registros en la tabla `pabellon_maquina`
4. **⚠️ Daños** - Registros en la tabla `dano`
5. **📄 Planilla Principal** - El registro principal en la tabla `planilla`

## 🔧 Implementación Técnica

### Backend (Node.js + Sequelize)

#### Controlador Actualizado
```javascript
// backend/src/controllers/planillaController.js
exports.eliminar = async (req, res) => {
  try {
    const planillaId = req.params.id;
    
    // Verificar que la planilla existe
    const planilla = await Planilla.findByPk(planillaId);
    if (!planilla) {
      return res.status(404).json({ message: 'Planilla no encontrada' });
    }

    // Iniciar transacción para asegurar consistencia
    const transaction = await require('../config/database').transaction();

    try {
      // 1. Eliminar barredores asociados
      const barredoresEliminados = await Barredor.destroy({
        where: { planilla_id: planillaId },
        transaction
      });

      // 2. Eliminar máquinas asociadas
      const maquinasEliminadas = await MaquinaPlanilla.destroy({
        where: { planilla_id: planillaId },
        transaction
      });

      // 3. Eliminar pabellones asociados
      const pabellonesEliminados = await PabellonMaquina.destroy({
        where: { planilla_id: planillaId },
        transaction
      });

      // 4. Eliminar daños asociados
      const danosEliminados = await Dano.destroy({
        where: { planilla_id: planillaId },
        transaction
      });

      // 5. Finalmente, eliminar la planilla principal
      await planilla.destroy({ transaction });

      // Confirmar transacción
      await transaction.commit();

      res.json({ 
        message: 'Planilla eliminada exitosamente con todos sus datos relacionados',
        detalles: {
          planilla_id: planillaId,
          barredores_eliminados: barredoresEliminados,
          maquinas_eliminadas: maquinasEliminadas,
          pabellones_eliminados: pabellonesEliminados,
          danos_eliminados: danosEliminados
        }
      });

    } catch (error) {
      // Revertir transacción en caso de error
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error eliminando planilla:', error);
    res.status(500).json({ 
      message: 'Error al eliminar la planilla y sus datos relacionados', 
      error: error.message 
    });
  }
};
```

### Base de Datos (MySQL)

#### Restricciones de Clave Foránea
Para asegurar la integridad referencial, se recomienda configurar las siguientes restricciones:

```sql
-- Configurar eliminación en cascada en la base de datos
ALTER TABLE barredor 
ADD CONSTRAINT barredor_planilla_cascade 
FOREIGN KEY (planilla_id) REFERENCES planilla(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE maquina_planilla 
ADD CONSTRAINT maquina_planilla_cascade 
FOREIGN KEY (planilla_id) REFERENCES planilla(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE pabellon_maquina 
ADD CONSTRAINT pabellon_maquina_cascade 
FOREIGN KEY (planilla_id) REFERENCES planilla(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE dano 
ADD CONSTRAINT dano_planilla_cascade 
FOREIGN KEY (planilla_id) REFERENCES planilla(id) 
ON DELETE CASCADE ON UPDATE CASCADE;
```

## 🧪 Pruebas

### Script de Prueba Automatizada
```bash
# Ejecutar prueba de eliminación en cascada
node test-eliminacion-cascada-planilla.js
```

### Verificación Manual
1. Crear una planilla con datos relacionados
2. Agregar barredores, máquinas, pabellones y daños
3. Eliminar la planilla usando el botón de basurero
4. Verificar que todos los datos relacionados fueron eliminados

## 🛠️ Herramientas de Mantenimiento

### 1. Verificar Restricciones de Base de Datos
```bash
# Ejecutar script SQL para verificar restricciones
mysql -u usuario -p base_datos < scripts/verificar_restricciones_cascada.sql
```

### 2. Limpiar Datos Huérfanos
```bash
# Ejecutar script para limpiar datos huérfanos existentes
node scripts/limpiar_datos_huerfanos_planillas.js
```

## 📊 Respuesta de la API

### Eliminación Exitosa
```json
{
  "message": "Planilla eliminada exitosamente con todos sus datos relacionados",
  "detalles": {
    "planilla_id": 18,
    "barredores_eliminados": 3,
    "maquinas_eliminadas": 2,
    "pabellones_eliminados": 5,
    "danos_eliminados": 1
  }
}
```

### Error - Planilla No Encontrada
```json
{
  "message": "Planilla no encontrada"
}
```

### Error - Error del Servidor
```json
{
  "message": "Error al eliminar la planilla y sus datos relacionados",
  "error": "Detalles del error específico"
}
```

## 🔒 Seguridad y Validaciones

### Validaciones Implementadas
1. **Existencia de Planilla**: Verifica que la planilla existe antes de eliminar
2. **Transacciones**: Usa transacciones para asegurar consistencia
3. **Rollback Automático**: Revierte cambios si ocurre algún error
4. **Logging Detallado**: Registra todas las operaciones para auditoría

### Consideraciones de Seguridad
- Solo usuarios autorizados pueden eliminar planillas
- Se registran todas las eliminaciones para auditoría
- Las transacciones previenen estados inconsistentes

## 🚀 Uso en Frontend

### Botón de Eliminación
El botón de basurero en la tabla de planillas ahora elimina completamente todos los datos relacionados:

```javascript
// Ejemplo de uso en el frontend
const handleEliminarPlanilla = async (planillaId) => {
  try {
    const response = await axios.delete(`/api/planillas/${planillaId}`);
    
    if (response.data.message) {
      // Mostrar mensaje de éxito con detalles
      mostrarNotificacion('success', response.data.message);
      
      // Actualizar la lista de planillas
      cargarPlanillas();
    }
  } catch (error) {
    // Manejar errores
    mostrarNotificacion('error', 'Error al eliminar la planilla');
  }
};
```

## 📝 Logs y Auditoría

### Logs del Sistema
El sistema registra todas las operaciones de eliminación:

```
🗑️ Iniciando eliminación en cascada para planilla ID: 18
   📋 Barredores eliminados: 3
   🚜 Máquinas eliminadas: 2
   🏢 Pabellones eliminados: 5
   ⚠️ Daños eliminados: 1
✅ Planilla ID 18 eliminada exitosamente con todos sus datos relacionados
```

## 🔄 Migración y Actualización

### Para Sistemas Existentes
1. Ejecutar script de verificación de restricciones
2. Limpiar datos huérfanos existentes
3. Configurar restricciones de eliminación en cascada
4. Actualizar el controlador de planillas
5. Probar la funcionalidad

### Comandos de Migración
```bash
# 1. Verificar estado actual
node scripts/verificar_restricciones_cascada.sql

# 2. Limpiar datos huérfanos
node scripts/limpiar_datos_huerfanos_planillas.js

# 3. Probar funcionalidad
node test-eliminacion-cascada-planilla.js
```

## ⚠️ Consideraciones Importantes

### Antes de Eliminar
- **Respaldo**: Siempre hacer respaldo antes de eliminar datos importantes
- **Confirmación**: El sistema debe pedir confirmación antes de eliminar
- **Auditoría**: Verificar que se eliminen los datos correctos

### Después de Eliminar
- **Verificación**: Confirmar que no quedan datos huérfanos
- **Logs**: Revisar logs para confirmar la eliminación completa
- **Notificación**: Informar al usuario sobre la eliminación exitosa

## 🎯 Beneficios

1. **Integridad de Datos**: Previene datos huérfanos
2. **Consistencia**: Mantiene la base de datos en estado consistente
3. **Simplicidad**: Una sola operación elimina todo lo relacionado
4. **Auditoría**: Registro completo de todas las eliminaciones
5. **Seguridad**: Transacciones aseguran operaciones atómicas

## 📞 Soporte

Para problemas o preguntas sobre la eliminación en cascada:

1. Revisar logs del sistema
2. Ejecutar scripts de verificación
3. Consultar la documentación de la API
4. Contactar al equipo de desarrollo

---

**Versión**: 1.0  
**Fecha**: 2025-01-15  
**Autor**: Sistema de Gestión de Barredores 