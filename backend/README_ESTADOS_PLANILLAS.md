# Sistema de Estados de Planillas

## 📋 Descripción

Este documento describe el sistema de estados implementado para las planillas del sistema de gestión de barredores.

## 🎯 Estados Disponibles

### 1. **PENDIENTE** 📋
- **Descripción**: Planilla creada pero no iniciada
- **Características**:
  - Es el estado por defecto al crear una nueva planilla
  - No se ha comenzado el trabajo
  - Se puede editar completamente
  - Se puede cambiar a cualquier otro estado

### 2. **ACTIVA** 🚀
- **Descripción**: Planilla en ejecución (trabajando)
- **Características**:
  - El trabajo está en progreso
  - Se están registrando barredores, máquinas, pabellones
  - Se pueden agregar daños
  - Se puede pausar o completar

### 3. **COMPLETADA** ✅
- **Descripción**: Planilla terminada exitosamente
- **Características**:
  - Todo el trabajo ha sido realizado
  - Se puede ver como histórico
  - No se puede editar (solo consulta)
  - Se puede reabrir si es necesario

### 4. **CANCELADA** ❌
- **Descripción**: Planilla cancelada
- **Características**:
  - El trabajo no se realizará
  - Se mantiene como registro histórico
  - No se puede reactivar
  - Se puede consultar para auditoría

### 5. **PAUSADA** ⏸️
- **Descripción**: Planilla temporalmente suspendida
- **Características**:
  - El trabajo está en pausa temporal
  - Se puede reanudar más tarde
  - Se mantienen todos los datos registrados
  - Se puede cambiar a ACTIVA o CANCELADA

## 🔄 Flujo de Estados

```
PENDIENTE → ACTIVA → COMPLETADA
    ↓         ↓         ↓
  CANCELADA  PAUSADA   (Final)
    ↓         ↓
  (Final)   ACTIVA
```

### Transiciones Permitidas:

1. **PENDIENTE** puede cambiar a:
   - ACTIVA (iniciar trabajo)
   - CANCELADA (cancelar antes de iniciar)

2. **ACTIVA** puede cambiar a:
   - COMPLETADA (terminar trabajo)
   - PAUSADA (pausar temporalmente)
   - CANCELADA (cancelar trabajo en progreso)

3. **PAUSADA** puede cambiar a:
   - ACTIVA (reanudar trabajo)
   - CANCELADA (cancelar definitivamente)

4. **COMPLETADA** y **CANCELADA** son estados finales

## 🛠️ Implementación Técnica

### Base de Datos
```sql
-- Estructura del campo estado
estado ENUM('PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA', 'PAUSADA')
NOT NULL DEFAULT 'PENDIENTE'
```

### Modelo Sequelize
```javascript
estado: {
  type: DataTypes.ENUM('PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA', 'PAUSADA'),
  allowNull: false,
  defaultValue: 'PENDIENTE'
}
```

### Frontend
```javascript
// Opciones en el formulario
<MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
<MenuItem value="ACTIVA">ACTIVA</MenuItem>
<MenuItem value="COMPLETADA">COMPLETADA</MenuItem>
<MenuItem value="CANCELADA">CANCELADA</MenuItem>
<MenuItem value="PAUSADA">PAUSADA</MenuItem>
```

## 📊 Dashboard y Reportes

### Métricas por Estado
- **Planillas Pendientes**: Planillas creadas pero no iniciadas
- **Planillas Activas**: Planillas en ejecución
- **Planillas Completadas**: Planillas terminadas exitosamente
- **Planillas Canceladas**: Planillas canceladas

### Filtros Disponibles
- Por estado específico
- Por rango de fechas
- Por supervisor
- Por sector/zona

## 🔒 Validaciones y Restricciones

### Creación de Planillas
- Estado por defecto: **PENDIENTE**
- Solo usuarios autorizados pueden cambiar estados

### Edición de Planillas
- **PENDIENTE**: Edición completa permitida
- **ACTIVA**: Edición limitada (no cambiar datos básicos)
- **PAUSADA**: Edición limitada
- **COMPLETADA**: Solo consulta
- **CANCELADA**: Solo consulta

### Eliminación
- Solo planillas **PENDIENTE** pueden ser eliminadas
- Planillas con otros estados requieren cancelación previa

## 🎨 Interfaz de Usuario

### Colores por Estado
- **PENDIENTE**: 🟡 Amarillo
- **ACTIVA**: 🟢 Verde
- **COMPLETADA**: 🔵 Azul
- **CANCELADA**: 🔴 Rojo
- **PAUSADA**: 🟠 Naranja

### Iconos por Estado
- **PENDIENTE**: 📋
- **ACTIVA**: 🚀
- **COMPLETADA**: ✅
- **CANCELADA**: ❌
- **PAUSADA**: ⏸️

## 📈 Beneficios del Sistema

1. **Control de Proceso**: Seguimiento claro del estado de cada planilla
2. **Auditoría**: Historial completo de cambios de estado
3. **Reportes**: Métricas precisas por estado
4. **Flexibilidad**: Manejo de situaciones especiales (pausas, cancelaciones)
5. **Integridad**: Prevención de cambios no autorizados

## 🔄 Migración de Datos

### Estados Anteriores
- **ABIERTO** → **PENDIENTE**
- **CERRADO** → **COMPLETADA**

### Script de Migración
```bash
node scripts/actualizar_estados_planillas.js
```

## 📞 Soporte

Para problemas o preguntas sobre el sistema de estados:

1. Revisar logs del sistema
2. Verificar permisos de usuario
3. Consultar la documentación de la API
4. Contactar al equipo de desarrollo

---

**Versión**: 2.0  
**Fecha**: 2025-01-15  
**Autor**: Sistema de Gestión de Barredores 