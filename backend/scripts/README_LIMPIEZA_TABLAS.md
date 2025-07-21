# Limpieza de Tablas de Base de Datos

Este conjunto de scripts permite limpiar todas las tablas de la base de datos excepto la tabla de usuarios, con opciones de respaldo automático.

## Scripts Disponibles

### 1. `limpiar_tablas.js` - Limpieza Simple
Limpia todas las tablas sin crear respaldo.

### 2. `respaldar_y_limpiar.js` - Limpieza con Respaldo
Crea un respaldo completo antes de limpiar las tablas.

## Uso

### Opción 1: Limpieza Simple (Sin Respaldo)

```bash
cd backend/scripts
node limpiar_tablas.js
```

**Opciones:**
- `--auto` o `--automatic`: Ejecuta sin confirmación

```bash
node limpiar_tablas.js --auto
```

### Opción 2: Limpieza con Respaldo (Recomendado)

```bash
cd backend/scripts
node respaldar_y_limpiar.js
```

**Opciones:**
- `--auto` o `--automatic`: Ejecuta sin confirmación

```bash
node respaldar_y_limpiar.js --auto
```

### Opción 3: Restaurar desde Respaldo

```bash
node respaldar_y_limpiar.js restaurar [directorio_respaldo]
```

## Tablas que se Limpian

Las siguientes tablas serán **COMPLETAMENTE VACIADAS**:

1. `dano` - Registros de daños
2. `pabellon_maquina` - Relación pabellones-máquinas
3. `maquina_planilla` - Relación máquinas-planillas
4. `barredor` - Registros de barredores
5. `planilla` - Planillas de trabajo
6. `pabellon` - Pabellones
7. `sector` - Sectores
8. `zona` - Zonas
9. `operador` - Operadores
10. `maquina` - Máquinas
11. `barredor_catalogo` - Catálogo de barredores

## Tabla Preservada

La tabla `usuarios` **NO se modificará** en ningún caso.

## Proceso de Limpieza

### Con Respaldo (Recomendado)

1. **Respaldar tablas** - Crea archivos JSON con todos los datos
2. **Crear metadatos** - Archivo con información del respaldo
3. **Deshabilitar FK** - Evita problemas de dependencias
4. **Vaciar tablas** - Elimina todos los registros
5. **Habilitar FK** - Restaura verificación de claves foráneas
6. **Verificar** - Confirma que las tablas estén vacías

### Sin Respaldo

1. **Deshabilitar FK** - Evita problemas de dependencias
2. **Vaciar tablas** - Elimina todos los registros
3. **Habilitar FK** - Restaura verificación de claves foráneas
4. **Verificar** - Confirma que las tablas estén vacías

## Archivos de Respaldo

Si usas la opción con respaldo, se creará un directorio `respaldo/` con:

### Archivos de Datos
- `zona_YYYY-MM-DDTHH-MM-SS.json`
- `sector_YYYY-MM-DDTHH-MM-SS.json`
- `pabellon_YYYY-MM-DDTHH-MM-SS.json`
- `planilla_YYYY-MM-DDTHH-MM-SS.json`
- `barredor_YYYY-MM-DDTHH-MM-SS.json`
- `maquina_YYYY-MM-DDTHH-MM-SS.json`
- `operador_YYYY-MM-DDTHH-MM-SS.json`
- `maquina_planilla_YYYY-MM-DDTHH-MM-SS.json`
- `pabellon_maquina_YYYY-MM-DDTHH-MM-SS.json`
- `dano_YYYY-MM-DDTHH-MM-SS.json`
- `barredor_catalogo_YYYY-MM-DDTHH-MM-SS.json`

### Archivo de Metadatos
- `metadatos_respaldo_YYYY-MM-DDTHH-MM-SS.json`

## Estructura del Archivo de Metadatos

```json
{
  "fecha": "2024-01-15T10:30:00.000Z",
  "timestamp": 1705315800000,
  "total_tablas": 11,
  "tablas_exitosas": 11,
  "tablas_con_errores": 0,
  "total_registros": 150,
  "tablas": [
    {
      "nombre": "zona",
      "registros": 5,
      "archivo": "zona_2024-01-15T10-30-00.json",
      "error": null
    }
  ]
}
```

## Ejemplo de Uso Completo

```bash
# 1. Navegar al directorio de scripts
cd backend/scripts

# 2. Ejecutar limpieza con respaldo
node respaldar_y_limpiar.js

# 3. Confirmar la acción cuando se solicite
# Escribir "SI" para continuar

# 4. Esperar a que se complete el proceso
# Se mostrará el progreso en tiempo real

# 5. Verificar que las tablas estén vacías
# El script mostrará el estado final de cada tabla
```

## Salida del Script

### Ejemplo de Salida Exitosa

```
=== RESPALDO Y LIMPIEZA DE BASE DE DATOS ===

⚠️ ADVERTENCIA: Esta acción realizará las siguientes operaciones:
   1. Crear respaldo de todas las tablas (excepto usuarios)
   2. Vaciar todas las tablas (excepto usuarios)
   3. Verificar que las tablas estén vacías

💾 La tabla "usuarios" NO se modificará ni respaldará.

Esta acción NO se puede deshacer.

¿Estás seguro de que quieres continuar? (escribe "SI" para confirmar): SI

🚀 PASO 1: Creando respaldo de tablas...

=== RESPALDO DE TABLAS ===

📁 Directorio de respaldo: C:\Users\pipe\Desktop\EXTRACCION\backend\scripts\respaldo

Iniciando respaldo de tablas...

✅ Tabla 'zona' respaldada: 5 registros
✅ Tabla 'sector' respaldada: 12 registros
✅ Tabla 'pabellon' respaldada: 25 registros
✅ Tabla 'planilla' respaldada: 8 registros
✅ Tabla 'barredor' respaldada: 15 registros
✅ Tabla 'maquina' respaldada: 10 registros
✅ Tabla 'operador' respaldada: 8 registros
✅ Tabla 'maquina_planilla' respaldada: 20 registros
✅ Tabla 'pabellon_maquina' respaldada: 30 registros
✅ Tabla 'dano' respaldada: 5 registros
✅ Tabla 'barredor_catalogo' respaldada: 12 registros

=== ESTADÍSTICAS DE RESPALDO ===
✅ Tablas respaldadas exitosamente: 11
❌ Tablas con errores: 0

📋 Tablas respaldadas:
   - zona: 5 registros → zona_2024-01-15T10-30-00.json
   - sector: 12 registros → sector_2024-01-15T10-30-00.json
   - pabellon: 25 registros → pabellon_2024-01-15T10-30-00.json
   - planilla: 8 registros → planilla_2024-01-15T10-30-00.json
   - barredor: 15 registros → barredor_2024-01-15T10-30-00.json
   - maquina: 10 registros → maquina_2024-01-15T10-30-00.json
   - operador: 8 registros → operador_2024-01-15T10-30-00.json
   - maquina_planilla: 20 registros → maquina_planilla_2024-01-15T10-30-00.json
   - pabellon_maquina: 30 registros → pabellon_maquina_2024-01-15T10-30-00.json
   - dano: 5 registros → dano_2024-01-15T10-30-00.json
   - barredor_catalogo: 12 registros → barredor_catalogo_2024-01-15T10-30-00.json

📊 Total de registros respaldados: 150
📄 Metadatos del respaldo: metadatos_respaldo_2024-01-15T10-30-00.json

✅ Respaldo completado exitosamente
📁 Archivos guardados en: C:\Users\pipe\Desktop\EXTRACCION\backend\scripts\respaldo

🚀 PASO 2: Limpiando tablas...

=== LIMPIADOR DE BASE DE DATOS ===

🚀 Iniciando limpieza de base de datos...

=== LIMPIEZA DE TABLAS ===

✅ Verificación de claves foráneas deshabilitada
Iniciando limpieza de tablas...

✅ Tabla 'dano' vaciada exitosamente
✅ Tabla 'pabellon_maquina' vaciada exitosamente
✅ Tabla 'maquina_planilla' vaciada exitosamente
✅ Tabla 'barredor' vaciada exitosamente
✅ Tabla 'planilla' vaciada exitosamente
✅ Tabla 'pabellon' vaciada exitosamente
✅ Tabla 'sector' vaciada exitosamente
✅ Tabla 'zona' vaciada exitosamente
✅ Tabla 'operador' vaciada exitosamente
✅ Tabla 'maquina' vaciada exitosamente
✅ Tabla 'barredor_catalogo' vaciada exitosamente
✅ Verificación de claves foráneas habilitada

=== ESTADÍSTICAS DE LIMPIEZA ===
✅ Tablas vaciadas exitosamente: 11
❌ Tablas con errores: 0

📋 Tablas vaciadas:
   - dano
   - pabellon_maquina
   - maquina_planilla
   - barredor
   - planilla
   - pabellon
   - sector
   - zona
   - operador
   - maquina
   - barredor_catalogo

💾 Tabla de usuarios preservada (no se modificó)

=== VERIFICACIÓN DE TABLAS VACÍAS ===
✅ dano: Vacía (0 registros)
✅ pabellon_maquina: Vacía (0 registros)
✅ maquina_planilla: Vacía (0 registros)
✅ barredor: Vacía (0 registros)
✅ planilla: Vacía (0 registros)
✅ pabellon: Vacía (0 registros)
✅ sector: Vacía (0 registros)
✅ zona: Vacía (0 registros)
✅ operador: Vacía (0 registros)
✅ maquina: Vacía (0 registros)
✅ barredor_catalogo: Vacía (0 registros)
✅ usuarios: 3 registros (preservados)

=== PROCESO COMPLETADO ===
✅ Respaldo y limpieza completados exitosamente
💾 La tabla de usuarios se mantiene intacta
🔧 Ahora puedes proceder con la carga masiva de datos
📁 Respaldo disponible en: C:\Users\pipe\Desktop\EXTRACCION\backend\scripts\respaldo
```

## Precauciones

⚠️ **IMPORTANTE**: Esta operación es **IRREVERSIBLE** sin respaldo.

### Antes de Ejecutar

1. **Verifica** que tienes una copia de seguridad de la base de datos
2. **Confirma** que realmente necesitas limpiar todas las tablas
3. **Asegúrate** de que no hay procesos activos usando la base de datos
4. **Revisa** que la tabla de usuarios contiene los datos necesarios

### Después de Ejecutar

1. **Verifica** que las tablas estén realmente vacías
2. **Confirma** que la tabla de usuarios se mantiene intacta
3. **Guarda** los archivos de respaldo en un lugar seguro
4. **Procede** con la carga masiva de datos

## Solución de Problemas

### Error: "Cannot delete or update a parent row"
- El script deshabilita automáticamente la verificación de FK
- Si persiste, verifica que no hay triggers o restricciones adicionales

### Error: "Connection lost"
- Verifica la conexión a la base de datos
- Asegúrate de que el servidor MySQL esté funcionando

### Error: "Permission denied"
- Verifica que el usuario de la base de datos tiene permisos DELETE
- Asegúrate de que tienes permisos de escritura en el directorio

### Tablas no se vacían completamente
- Algunos sistemas pueden tener restricciones adicionales
- Verifica manualmente con `SELECT COUNT(*) FROM tabla`

## Restauración

Si necesitas restaurar los datos:

1. **Localiza** los archivos de respaldo en `scripts/respaldo/`
2. **Ejecuta** el comando de restauración:
   ```bash
   node respaldar_y_limpiar.js restaurar
   ```
3. **Verifica** que los datos se restauraron correctamente

## Notas Técnicas

- **Orden de limpieza**: Las tablas se limpian en orden de dependencias para evitar errores
- **Transacciones**: Cada tabla se limpia en una transacción separada
- **Verificación FK**: Se deshabilita temporalmente para evitar problemas de dependencias
- **Logs**: Todos los pasos se registran en la consola para auditoría
- **Metadatos**: Se crea un archivo con información completa del respaldo 