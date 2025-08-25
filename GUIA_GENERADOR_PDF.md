# 📊 Guía del Generador de Informes PDF

## 🎯 Descripción

El Generador de Informes PDF es una funcionalidad que permite crear informes profesionales de daños en formato PDF, replicando exactamente la estructura de los informes que compartiste. El sistema extrae datos diarios de tu base de datos y los presenta en un formato profesional.

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
# Desde la raíz del proyecto
node instalar-dependencias-pdf.js
```

### 2. Reiniciar Servidores

```bash
# Backend
cd backend
npm run dev

# Frontend (en otra terminal)
cd frontend
npm start
```

## 📋 Características Implementadas

### ✅ Secciones del Informe

1. **METROS SUPERFICIE**
   - Tabla detallada por quincenas (1ERA y 2DA QUINCENA)
   - Datos por día del mes
   - Totales por género (Hembra/Macho)
   - Comparación con mes anterior

2. **DAÑOS ACUMULADOS 2025**
   - Gráfico de daños acumulados (Real/Ppto)
   - Gráfico de valores monetarios (Real/Ppto)
   - Leyendas y indicadores de estado

3. **DAÑOS DEL AÑO**
   - Tabla mensual por género
   - Indicadores de estado con colores
   - Totales anuales

4. **CONSOLIDADO HEMBRAS Y MACHOS**
   - Datos por operador
   - Desglose mensual
   - Indicadores de rendimiento

### ✅ Características Técnicas

- **Formato**: PDF profesional A4
- **Motor**: Puppeteer (Chrome headless)
- **Plantillas**: Handlebars para HTML dinámico
- **Datos**: Extracción automática de tu base de datos
- **Estilos**: CSS profesional para impresión

## 🎨 Estructura del Informe

### Header
```
INFORME DE DAÑOS AÑO 2025
[Fecha formateada]
```

### Sección 1: Metros Superficie
- Tabla con días del mes (1-31)
- Columnas: Hembra, Macho, Totales
- Quincenas separadas
- Box de "MES ANTERIOR"

### Sección 2: Gráficos
- Dos gráficos lado a lado
- Datos acumulados por mes
- Leyendas con colores
- Indicadores de estado

### Sección 3: Daños del Año
- Tabla mensual (ENE-DIC)
- Filas: Hembra, Macho, Totales
- Indicadores de color por valor

### Sección 4: Consolidado
- Lista de operadores
- Datos mensuales por operador
- Totales y promedios

## 🔧 Uso del Sistema

### 1. Acceso
- Navega a `/generador-pdf` en tu aplicación
- O busca "Generador PDF" en el menú lateral

### 2. Configuración
- **Tipo de Informe**: Diario o Prueba
- **Fecha**: Selecciona la fecha del informe
- **Formato**: Siempre PDF

### 3. Generación
- **Informe Diario**: Usa datos reales de la fecha seleccionada
- **Informe de Prueba**: Usa datos de ejemplo para pruebas

### 4. Descarga
- El PDF se genera automáticamente
- Se descarga con nombre: `Informe_Danos_YYYY-MM-DD.pdf`

## 📊 Datos Extraídos

### Metros Superficie
```sql
SELECT * FROM metros_superficie 
WHERE fecha = '2025-08-XX'
INCLUDE zona, sector
```

### Daños Acumulados
```sql
SELECT * FROM danos_acumulados 
WHERE year = 2025
ORDER BY month
```

### Daños por Género
```sql
SELECT * FROM danos 
WHERE fecha BETWEEN '2025-01-01' AND '2025-12-31'
INCLUDE zona
GROUP BY MONTH(fecha), zona.tipo
```

### Datos Consolidados
```sql
SELECT operador, COUNT(*) as total
FROM danos 
WHERE fecha BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY operador
ORDER BY total DESC
```

## 🎨 Personalización

### Colores de Indicadores
- **Verde**: 0 daños (excelente)
- **Amarillo**: 1-5 daños (bueno)
- **Naranja**: 6-10 daños (precaución)
- **Rojo**: 11+ daños (crítico)

### Estilos CSS
Los estilos están en `backend/src/templates/informe-danos.hbs`:
- Fuentes: Arial, sans-serif
- Tamaño: A4 con márgenes de 15mm
- Colores corporativos: #1976d2 (azul)

## 🔍 Troubleshooting

### Error: "Puppeteer no encontrado"
```bash
cd backend
npm install puppeteer
```

### Error: "Handlebars no encontrado"
```bash
cd backend
npm install handlebars
```

### Error: "No se puede generar PDF"
- Verifica que Chrome esté instalado
- En Linux: `sudo apt-get install chromium-browser`
- En Windows: Puppeteer descarga Chrome automáticamente

### Error: "Datos no encontrados"
- Verifica que existan datos en la base de datos
- Usa "Informe de Prueba" para verificar el formato
- Revisa los logs del backend

## 📈 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Gráficos interactivos en PDF
- [ ] Múltiples formatos (Excel, Word)
- [ ] Programación automática de informes
- [ ] Envío por email
- [ ] Plantillas personalizables
- [ ] Filtros avanzados

### Optimizaciones
- [ ] Cache de datos para mejor rendimiento
- [ ] Compresión de PDFs
- [ ] Generación en background
- [ ] Preview antes de descarga

## 📞 Soporte

### Logs del Sistema
```bash
# Backend logs
cd backend
tail -f logs/app.log

# Ver errores de PDF
grep "PDF" logs/app.log
```

### Verificación de Datos
```bash
# Verificar datos de metros superficie
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/metros-superficie

# Verificar datos de daños
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/danos
```

## 🎯 Ejemplo de Uso

1. **Accede al sistema**: `http://localhost:3000/generador-pdf`
2. **Selecciona fecha**: 15 de agosto de 2025
3. **Genera informe**: Click en "Generar Informe Diario"
4. **Descarga PDF**: Se descarga automáticamente
5. **Revisa contenido**: Verifica que todos los datos estén correctos

## ✅ Checklist de Verificación

- [ ] Dependencias instaladas
- [ ] Servidores funcionando
- [ ] Base de datos conectada
- [ ] Datos disponibles
- [ ] Ruta accesible
- [ ] Generación de prueba funciona
- [ ] Generación con datos reales funciona
- [ ] PDF se descarga correctamente
- [ ] Formato es correcto
- [ ] Datos son precisos

---

**¡El sistema está listo para generar informes profesionales de daños!** 🎉


