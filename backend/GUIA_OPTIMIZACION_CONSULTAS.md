# 🚀 GUÍA DE OPTIMIZACIÓN DE CONSULTAS - SISTEMA DE EXTRACCIÓN TRN

## 📋 ÍNDICE
1. [Problema Identificado](#problema-identificado)
2. [Buenas Prácticas](#buenas-prácticas)
3. [Patrones a Evitar](#patrones-a-evitar)
4. [Patrones Recomendados](#patrones-recomendados)
5. [Herramientas de Diagnóstico](#herramientas-de-diagnóstico)
6. [Checklist de Optimización](#checklist-de-optimización)
7. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🚨 PROBLEMA IDENTIFICADO

### Síntomas:
- Múltiples consultas canceladas en las herramientas de desarrollo del navegador
- Tiempos de respuesta lentos (5-10 segundos)
- Consultas repetidas innecesariamente
- Alto consumo de recursos del servidor

### Causa Raíz:
El controlador de planillas estaba generando múltiples consultas individuales en lugar de usar JOINs optimizados.

**ANTES (❌ Ineficiente):**
```javascript
// 1 consulta principal + 3 consultas por cada planilla
const planillas = await Planilla.findAll({ where });
const resultado = await Promise.all(planillas.map(async (planilla) => {
  const supervisor = await Usuario.findByPk(planilla.supervisor_id);     // +1 consulta
  const sector = await Sector.findByPk(planilla.sector_id);             // +1 consulta
  const validador = await Usuario.findByPk(planilla.validado_por);      // +1 consulta
  const registros = await PabellonMaquina.findAll({...});               // +1 consulta
}));
```

**Para 1 planilla = 5 consultas totales**
**Para N planillas = 1 + (3 × N) + N consultas**

---

## ✅ BUENAS PRÁCTICAS

### 1. **Usar Includes de Sequelize**
```javascript
// ✅ CORRECTO - Una sola consulta con JOINs
const planillas = await Planilla.findAll({
  where,
  include: [
    { model: Usuario, as: 'supervisor', attributes: ['id', 'nombre'] },
    { model: Sector, attributes: ['id', 'nombre', 'mt2'] }
  ]
});
```

### 2. **Evitar Consultas en Bucles**
```javascript
// ❌ INCORRECTO
for (const item of items) {
  const related = await RelatedModel.findByPk(item.id);
}

// ✅ CORRECTO
const allRelated = await RelatedModel.findAll({
  where: { id: { [Op.in]: itemIds } }
});
```

### 3. **Usar Consultas Agregadas**
```javascript
// ✅ Para contar registros relacionados
const [result] = await sequelize.query(`
  SELECT p.*, COUNT(pm.id) as pabellones_count
  FROM planillas p
  LEFT JOIN pabellon_maquina pm ON p.id = pm.planilla_id
  GROUP BY p.id
`);
```

### 4. **Implementar Cache**
```javascript
// ✅ Cache simple para datos que no cambian frecuentemente
let cache = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

if (cache && (Date.now() - cacheTime) < CACHE_DURATION) {
  return cache;
}
```

---

## ❌ PATRONES A EVITAR

### 1. **Parámetros en Consultas Administrativas**
```javascript
// ❌ INCORRECTO - Causa errores de sintaxis
await connection.execute('SHOW DATABASES LIKE ?', [dbName]);

// ✅ CORRECTO - Interpolación segura
const dbNameSafe = dbName.replace(/'/g, "''");
await connection.query(`SHOW DATABASES LIKE '${dbNameSafe}'`);
```

### 2. **Promise.all con Consultas Individuales**
```javascript
// ❌ INCORRECTO - Múltiples consultas
const results = await Promise.all(
  items.map(item => RelatedModel.findByPk(item.id))
);

// ✅ CORRECTO - Una sola consulta
const results = await RelatedModel.findAll({
  where: { id: { [Op.in]: itemIds } }
});
```

### 3. **Consultas Anidadas Innecesarias**
```javascript
// ❌ INCORRECTO
const planilla = await Planilla.findByPk(id);
const supervisor = await Usuario.findByPk(planilla.supervisor_id);

// ✅ CORRECTO
const planilla = await Planilla.findByPk(id, {
  include: [{ model: Usuario, as: 'supervisor' }]
});
```

---

## ✅ PATRONES RECOMENDADOS

### 1. **Consultas con Includes**
```javascript
// Para obtener datos relacionados
const planillas = await Planilla.findAll({
  include: [
    { model: Usuario, as: 'supervisor' },
    { model: Sector },
    { model: Usuario, as: 'validador' }
  ]
});
```

### 2. **Consultas con Subconsultas**
```javascript
// Para agregar conteos
const planillas = await Planilla.findAll({
  attributes: {
    include: [
      [literal(`(SELECT COUNT(*) FROM pabellon_maquina WHERE planilla_id = Planilla.id)`), 'pabellones_count']
    ]
  }
});
```

### 3. **Paginación Eficiente**
```javascript
// Para listas grandes
const { page = 1, limit = 20 } = req.query;
const offset = (page - 1) * limit;

const planillas = await Planilla.findAndCountAll({
  limit: parseInt(limit),
  offset: parseInt(offset),
  include: [...]
});
```

---

## 🔧 HERRAMIENTAS DE DIAGNÓSTICO

### 1. **Script de Prueba de Conexión**
```bash
node test-connection.js
```

### 2. **Monitoreo de Consultas**
```javascript
// Habilitar logging de consultas en desarrollo
const sequelize = new Sequelize({
  logging: console.log, // Solo en desarrollo
  // ...
});
```

### 3. **Herramientas del Navegador**
- Network tab para ver consultas HTTP
- Performance tab para medir tiempos
- Console para errores

### 4. **Comandos de Diagnóstico**
```bash
# Verificar conectividad
nslookup tu_host_mysql
telnet tu_host_mysql 3306

# Conectar manualmente
mysql -h tu_host -u tu_usuario -p
```

---

## ✅ CHECKLIST DE OPTIMIZACIÓN

### Antes de Implementar:
- [ ] ¿Puedo usar includes en lugar de múltiples consultas?
- [ ] ¿Necesito todos los campos o puedo usar attributes?
- [ ] ¿Puedo implementar cache para datos estáticos?
- [ ] ¿Necesito paginación para listas grandes?

### Durante el Desarrollo:
- [ ] ¿Las consultas usan índices apropiados?
- [ ] ¿Evito consultas en bucles?
- [ ] ¿Uso timeouts apropiados?
- [ ] ¿Manejo errores correctamente?

### Después de Implementar:
- [ ] ¿Probé con diferentes volúmenes de datos?
- [ ] ¿Verifiqué en las herramientas del navegador?
- [ ] ¿Documenté los cambios?
- [ ] ¿Actualicé esta guía si es necesario?

---

## 📝 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Listar Planillas Optimizado
```javascript
// ✅ VERSIÓN OPTIMIZADA
exports.listar = async (req, res) => {
  try {
    const planillas = await Planilla.findAll({
      where: { /* filtros */ },
      include: [
        { model: Usuario, as: 'supervisor', attributes: ['id', 'nombre'] },
        { model: Sector, attributes: ['id', 'nombre', 'mt2'] },
        { model: Usuario, as: 'validador', attributes: ['id', 'nombre'] }
      ],
      attributes: {
        include: [
          [literal(`(SELECT COUNT(DISTINCT pabellon_id) FROM pabellon_maquina WHERE planilla_id = Planilla.id)`), 'pabellones_count']
        ]
      },
      order: [['id', 'DESC']]
    });

    const resultado = planillas.map(planilla => ({
      ...planilla.toJSON(),
      supervisor_nombre: planilla.supervisor?.nombre || '',
      sector_nombre: planilla.Sector?.nombre || '',
      pabellones_limpiados: parseInt(planilla.getDataValue('pabellones_count') || 0)
    }));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Ejemplo 2: Cache para Dashboard
```javascript
// ✅ CACHE PARA DATOS ESTÁTICOS
let metricsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

exports.getDashboardMetrics = async (req, res) => {
  try {
    // Verificar cache
    if (metricsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      return res.json(metricsCache);
    }

    // Obtener datos
    const metrics = await obtenerMetricas();
    
    // Guardar en cache
    metricsCache = metrics;
    cacheTimestamp = Date.now();
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## 🎯 CONCLUSIONES

### Principios Clave:
1. **Una consulta es mejor que múltiples**
2. **Usa includes de Sequelize**
3. **Implementa cache cuando sea apropiado**
4. **Evita consultas en bucles**
5. **Mide el rendimiento antes y después**

### Recordatorio:
- Siempre prueba las optimizaciones antes de implementarlas
- Documenta los cambios realizados
- Mantén esta guía actualizada
- Comparte conocimientos con el equipo

---

**📅 Última actualización:** Enero 2025  
**👥 Equipo:** Sistema de Extracción TRN  
**📧 Contacto:** Equipo de Desarrollo 