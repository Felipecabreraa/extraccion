# Scripts de Datos Ficticios

Este directorio contiene scripts para generar datos ficticios para el sistema de gestión de limpieza.

## Scripts Disponibles

### 1. `setup_datos_desarrollo.js` (Principal)
Script principal que permite limpiar y generar datos ficticios con diferentes opciones.

#### Uso:
```bash
# Solo generar datos ficticios (por defecto)
node setup_datos_desarrollo.js

# Solo limpiar datos existentes
node setup_datos_desarrollo.js limpiar

# Limpiar y generar datos ficticios
node setup_datos_desarrollo.js completo
```

### 2. `generar_datos_ficticios.js`
Script que solo genera datos ficticios sin limpiar los existentes.

#### Uso:
```bash
node generar_datos_ficticios.js
```

### 3. `limpiar_datos.js`
Script que solo limpia todos los datos existentes.

#### Uso:
```bash
node limpiar_datos.js
```

## Datos Generados

Los scripts generan los siguientes datos ficticios:

### Entidades Principales:
- **5 Zonas**: Norte, Sur, Este, Oeste, Central
- **5 Usuarios**: 1 Admin + 4 Supervisores
- **8 Operadores**: Con RUT y teléfonos únicos
- **8 Máquinas**: Barredoras industriales
- **10 Barredores**: En catálogo con datos completos

### Entidades Derivadas:
- **15 Sectores**: 3 por zona (con pabellones automáticos)
- **Planillas**: 2-4 por sector con fechas realistas
- **Registros de Barredores**: 2-6 por planilla
- **Registros de Máquinas**: 1-4 por planilla
- **Registros de Daños**: 30% de probabilidad por planilla

## Características de los Datos

### Planillas:
- Fechas de inicio en los últimos 30 días
- Duración de 1-7 días
- Estados: 70% CERRADO, 30% ABIERTO
- Métricas realistas (m2, pabellones, etc.)

### Registros de Trabajo:
- Días trabajados: 1-7 días
- Horas extras: 0-10 horas
- Odómetros: 1000-12000 km
- Consumo de petróleo: 10-60 litros

### Daños:
- Tipos: infraestructura y equipo
- Descripciones realistas
- Cantidades: 1-5 unidades
- 30% de probabilidad por planilla

## Credenciales de Acceso

### Usuario Administrador:
- **Email**: juan.perez@empresa.com
- **Password**: password123
- **Rol**: ADMIN

### Usuarios Supervisores:
- maria.garcia@empresa.com / password123
- carlos.lopez@empresa.com / password123
- ana.rodriguez@empresa.com / password123
- luis.martinez@empresa.com / password123

## Notas Importantes

1. **Antes de producción**: Ejecutar `limpiar` para eliminar todos los datos ficticios
2. **Relaciones**: Los scripts respetan todas las relaciones entre entidades
3. **Pabellones**: Se crean automáticamente al crear sectores
4. **Datos realistas**: Todos los datos generados son coherentes y realistas
5. **Conexión**: Asegúrate de que la base de datos esté configurada correctamente

## Ejemplo de Uso Completo

```bash
# 1. Navegar al directorio de scripts
cd backend/scripts

# 2. Generar datos ficticios para desarrollo
node setup_datos_desarrollo.js completo

# 3. Verificar que el sistema funcione correctamente
# 4. Cuando esté listo para producción, limpiar datos
node setup_datos_desarrollo.js limpiar
```

## Troubleshooting

### Error de conexión a base de datos:
- Verificar que el archivo `.env` esté configurado correctamente
- Asegurar que la base de datos esté ejecutándose

### Error de foreign keys:
- Los scripts eliminan datos en el orden correcto para respetar las relaciones
- Si hay errores, ejecutar `limpiar` primero

### Datos duplicados:
- Usar `limpiar` antes de `generar` para evitar duplicados
- Los scripts verifican duplicados en barredores y máquinas por planilla 