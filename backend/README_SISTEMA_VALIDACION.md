# Sistema de Validación por Roles - Planillas

## 🎯 Descripción General

El sistema implementa un **flujo de validación por roles** que asegura que las planillas pasen por un proceso de revisión antes de ser aprobadas para trabajo. Esto garantiza la calidad de los datos y previene errores en la ejecución.

## 👥 Roles y Permisos

### **Supervisor** 👷‍♂️
- **Crear** planillas nuevas
- **Editar** planillas en estados: `PENDIENTE`, `PENDIENTE_VALIDACION`, `RECHAZADA`
- **Agregar** barredores, máquinas, pabellones y daños a sus planillas
- **Ver** todas las planillas pendientes de validación
- **No puede** cambiar el estado de validación

### **Administrador** 👨‍💼
- **Ver** todas las planillas del sistema
- **Validar/Rechazar** planillas pendientes de validación
- **Editar** cualquier planilla
- **Eliminar** planillas en estado `PENDIENTE`
- **Cambiar** estados de planillas
- **Agregar observaciones** de validación

## 🔄 Estados del Sistema

### **Flujo de Estados**
```
PENDIENTE → PENDIENTE_VALIDACION → VALIDADA → COMPLETADA
    ↓              ↓                    ↓
  CANCELADA     RECHAZADA           (Final)
    ↓              ↓
  (Final)    PENDIENTE_VALIDACION
```

### **Descripción de Estados**

| Estado | Descripción | Quién puede cambiar | Acciones permitidas |
|--------|-------------|-------------------|-------------------|
| `PENDIENTE` | Planilla creada pero sin datos completos | Supervisor | Editar, Eliminar |
| `PENDIENTE_VALIDACION` | Planilla completa, esperando validación | Administrador | Validar, Rechazar |
| `VALIDADA` | Planilla aprobada por administrador | Administrador | Cambiar a ACTIVA/COMPLETADA |
| `ACTIVA` | Planilla en ejecución | Administrador | Cambiar a COMPLETADA/PAUSADA |
| `COMPLETADA` | Planilla finalizada | - | Solo lectura |
| `RECHAZADA` | Planilla rechazada por administrador | Supervisor | Editar para corregir |
| `CANCELADA` | Planilla cancelada | Administrador | Solo lectura |
| `PAUSADA` | Planilla pausada temporalmente | Administrador | Cambiar a ACTIVA |

## 🎛️ Filtros de Visualización

### **Filtros Disponibles**
- **Todas las Planillas**: Muestra todas las planillas del sistema
- **Pendientes de Validación**: Solo planillas que requieren validación
- **Validadas**: Planillas aprobadas listas para trabajo
- **En Progreso**: Planillas activas en ejecución
- **Completadas**: Planillas finalizadas
- **Rechazadas**: Planillas que requieren corrección
- **Canceladas**: Planillas canceladas
- **Pausadas**: Planillas pausadas temporalmente

### **Filtrado por Rol**
- **Supervisor**: Ve sus planillas + todas las pendientes de validación
- **Administrador**: Ve todas las planillas del sistema

## 🔧 Implementación Técnica

### **Base de Datos**

#### **Nuevos Campos en Tabla `planilla`**
```sql
-- Campo para observaciones del validador
observacion_validacion TEXT COMMENT 'Observaciones del administrador al validar/rechazar'

-- Campo para registrar quién validó
validado_por INT REFERENCES usuario(id) COMMENT 'ID del administrador que validó la planilla'

-- Campo para fecha de validación
fecha_validacion DATETIME COMMENT 'Fecha cuando se validó la planilla'

-- ENUM actualizado para estados
estado ENUM('PENDIENTE', 'PENDIENTE_VALIDACION', 'VALIDADA', 'ACTIVA', 'COMPLETADA', 'CANCELADA', 'PAUSADA', 'RECHAZADA')
```

### **API Endpoints**

#### **GET /api/planillas**
```javascript
// Parámetros de consulta
{
  estado: 'PENDIENTE_VALIDACION', // Filtro por estado
  rol_usuario: 'supervisor'        // Filtro por rol
}

// Respuesta incluye
{
  id: 1,
  supervisor_nombre: "Juan Pérez",
  sector_nombre: "Sector A",
  estado: "PENDIENTE_VALIDACION",
  validador_nombre: null, // Solo si fue validada
  // ... otros campos
}
```

#### **POST /api/planillas/:id/validar**
```javascript
// Solo para administradores
{
  estado: "VALIDADA" | "RECHAZADA",
  observacion_validacion: "Observaciones del validador"
}
```

### **Frontend**

#### **Componentes Actualizados**
- **Filtros de estado**: Dropdown con todos los estados disponibles
- **Chips de estado**: Colores diferenciados por estado
- **Botones de validación**: Solo visibles para administradores
- **Modal de validación**: Para agregar observaciones
- **Permisos dinámicos**: Botones habilitados/deshabilitados según rol y estado

## 📋 Proceso de Validación

### **Paso 1: Creación por Supervisor**
1. Supervisor crea nueva planilla
2. Sistema asigna estado `PENDIENTE_VALIDACION` automáticamente
3. Supervisor puede agregar barredores, máquinas, pabellones y daños

### **Paso 2: Revisión por Administrador**
1. Administrador ve planillas en `PENDIENTE_VALIDACION`
2. Revisa todos los datos ingresados
3. Decide validar o rechazar

### **Paso 3: Validación/Rechazo**
1. **Si VALIDA**: Planilla pasa a estado `VALIDADA`
2. **Si RECHAZA**: Planilla pasa a estado `RECHAZADA` con observaciones
3. Se registra quién validó y cuándo

### **Paso 4: Corrección (si fue rechazada)**
1. Supervisor ve observaciones de rechazo
2. Corrige los datos según observaciones
3. Planilla vuelve a `PENDIENTE_VALIDACION`

### **Paso 5: Ejecución**
1. Planilla validada puede pasar a `ACTIVA`
2. Durante ejecución puede pasar a `COMPLETADA` o `PAUSADA`

## 🚀 Instalación y Configuración

### **1. Ejecutar Migración**
```bash
cd backend
npm run migrate
```

### **2. Actualizar Estados Existentes**
```bash
node scripts/actualizar_estados_validacion.js
```

### **3. Verificar Usuarios**
- Asegurar que existan usuarios con rol `administrador`
- Asegurar que existan usuarios con rol `supervisor`

## 📊 Beneficios del Sistema

### **Control de Calidad**
- ✅ Validación obligatoria antes de ejecución
- ✅ Prevención de errores en datos
- ✅ Trazabilidad de quién validó qué

### **Organización**
- ✅ Separación clara de responsabilidades
- ✅ Filtros para mejor visualización
- ✅ Estados que reflejan el progreso real

### **Auditoría**
- ✅ Registro de validaciones
- ✅ Observaciones de rechazo
- ✅ Historial de cambios de estado

## 🔍 Monitoreo y Reportes

### **Métricas Disponibles**
- Planillas pendientes de validación
- Tiempo promedio de validación
- Tasa de rechazo por supervisor
- Planillas por estado

### **Alertas Recomendadas**
- Planillas pendientes de validación > 24 horas
- Supervisor con alta tasa de rechazo
- Planillas sin supervisor asignado

## 🛠️ Mantenimiento

### **Limpieza Periódica**
```sql
-- Planillas completadas antiguas (más de 6 meses)
DELETE FROM planilla 
WHERE estado = 'COMPLETADA' 
AND fecha_termino < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Observaciones de validación muy antiguas
UPDATE planilla 
SET observacion_validacion = NULL 
WHERE fecha_validacion < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### **Backup de Validaciones**
```sql
-- Crear tabla de historial de validaciones
CREATE TABLE planilla_validacion_historial (
  id INT AUTO_INCREMENT PRIMARY KEY,
  planilla_id INT,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  validado_por INT,
  observacion TEXT,
  fecha_validacion DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Próximas Mejoras

### **Funcionalidades Futuras**
- [ ] Notificaciones por email de validaciones pendientes
- [ ] Dashboard específico para validadores
- [ ] Aprobación en lote de planillas
- [ ] Plantillas de observaciones predefinidas
- [ ] Validación automática por reglas de negocio

### **Integración**
- [ ] Webhooks para sistemas externos
- [ ] API para integración con ERP
- [ ] Reportes automáticos por email

---

**Versión**: 1.0  
**Fecha**: Enero 2025  
**Autor**: Sistema de Gestión de Planillas 