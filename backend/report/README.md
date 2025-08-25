# 📊 Generador de PDF - Sistema de Gestión de Daños

## 🎯 Descripción

Generador automático de reportes PDF diarios que extrae datos reales del sistema de gestión de daños y los presenta en un formato profesional y estructurado.

## 📋 Características

### ✅ Datos Extraídos del Sistema

1. **📋 REPORTE DETALLADO - METROS SUPERFICIE**
   - 1ERA QUINCENA (Hembra/Macho/Total)
   - 2DA QUINCENA (Hembra/Macho/Total)
   - MES ANTERIOR (Hembra/Macho/Total)

2. **📊 DAÑOS ACUMULADOS - REPORTE DE DAÑOS ACUMULADOS**
   - Datos mensuales (ENE-DIC)
   - Comparación Real vs Presupuesto
   - Valores monetarios

3. **🎯 METAS DE DAÑOS - METAS Y PROYECCIONES**
   - Meta anual y mensual
   - Actual vs Meta
   - Porcentaje de cumplimiento

4. **👥 DAÑOS POR OPERADOR - VISTA GENERAL**
   - Top 10 operadores
   - Total daños por operador
   - Órdenes afectadas
   - Meses con daños

5. **🏗️ CONSOLIDADO (ZONAS 1-2-3)**
   - Daños por zona
   - Tipo de zona (HEMBRA/MACHO)
   - Órdenes afectadas

6. **👩 HEMBRA (ZONA 1 Y 3)**
   - Daños específicos zona Hembra
   - Detalle por zona

7. **👨 MACHO (ZONA 2)**
   - Daños específicos zona Macho
   - Detalle por zona

## 🏗️ Estructura de Archivos

```
backend/report/
├── generateDailyReport.js    # Generador principal
├── cli-generate.js          # Script CLI
├── printStyles.css          # Estilos de impresión
├── sendMail.js              # Envío por correo (opcional)
└── README.md               # Esta documentación
```

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
cd backend
npm install puppeteer yargs nodemailer
```

### 2. Configurar Variables de Entorno

Crear o editar `.env` en el directorio `backend/`:

```env
# Configuración básica
BASE_URL=http://localhost:3000
AUTH_TOKEN=tu-token-de-autenticacion

# Configuración de correo (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-app
REPORT_RECIPIENTS=admin@empresa.com,gerente@empresa.com
WEEKLY_REPORT_RECIPIENTS=admin@empresa.com,gerencia@empresa.com
MONTHLY_REPORT_RECIPIENTS=admin@empresa.com,gerencia@empresa.com,directores@empresa.com
```

## 📖 Uso

### 1. Uso Básico

```bash
# Generar reporte para hoy
node backend/report/cli-generate.js

# Generar reporte para fecha específica
node backend/report/cli-generate.js --date=2025-01-15

# Ver ayuda
node backend/report/cli-generate.js --help
```

### 2. Opciones Avanzadas

```bash
# Con URL personalizada
node backend/report/cli-generate.js --baseUrl=https://mi-dominio.cl

# Con token de autenticación
node backend/report/cli-generate.js --authToken=mi-token

# Orientación horizontal
node backend/report/cli-generate.js --landscape

# Solo capturar gráfico
node backend/report/cli-generate.js --onlyChart

# Directorio de salida personalizado
node backend/report/cli-generate.js --output=/ruta/personalizada
```

### 3. Uso Programático

```javascript
const { generateDailyReportPDF } = require('./backend/report/generateDailyReport');

// Generar PDF
const filePath = await generateDailyReportPDF({
  date: '2025-01-15',
  baseUrl: 'http://localhost:3000',
  authToken: 'mi-token'
});

console.log('PDF generado:', filePath);
```

## 📅 Programación Automática (Cron)

### 1. Reporte Diario

```bash
# Editar crontab
crontab -e

# Agregar línea para reporte diario a las 7:05 AM
5 7 * * * cd /ruta/al/proyecto && node backend/report/cli-generate.js --date=$(date +%Y-%m-%d)
```

### 2. Reporte Semanal

```bash
# Reporte semanal los lunes a las 8:00 AM
0 8 * * 1 cd /ruta/al/proyecto && node backend/report/cli-generate.js --date=$(date +%Y-%m-%d)
```

### 3. Reporte Mensual

```bash
# Reporte mensual el primer día del mes
0 9 1 * * cd /ruta/al/proyecto && node backend/report/cli-generate.js --date=$(date +%Y-%m-%d)
```

## 📧 Envío por Correo

### 1. Configuración SMTP

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-app
REPORT_RECIPIENTS=admin@empresa.com,gerente@empresa.com
```

### 2. Uso con Correo

```javascript
const { generateDailyReportPDF } = require('./backend/report/generateDailyReport');
const { sendDailyReport } = require('./backend/report/sendMail');

// Generar y enviar reporte
const date = new Date().toISOString().split('T')[0];
const filePath = await generateDailyReportPDF({ date });
await sendDailyReport(filePath, date);
```

### 3. Cron con Envío por Correo

```bash
# Reporte diario con envío automático
5 7 * * * cd /ruta/al/proyecto && node -e "
  const { generateDailyReportPDF } = require('./backend/report/generateDailyReport');
  const { sendDailyReport } = require('./backend/report/sendMail');
  (async () => {
    const date = new Date().toISOString().split('T')[0];
    const filePath = await generateDailyReportPDF({ date });
    await sendDailyReport(filePath, date);
  })();
"
```

## 🔧 Configuración de la Base de Datos

### 1. Vista Unificada Requerida

El sistema utiliza la vista `vw_ordenes_unificada_completa` que debe contener:

```sql
-- Campos principales
idOrdenServicio          -- ID de la orden
fechaOrdenServicio       -- Fecha de la orden
nombreSector             -- Nombre del sector
nombreOperador           -- Nombre del operador
cantidadDano             -- Cantidad de daños
source                   -- Origen de datos

-- Campos adicionales
fechaFinOrdenServicio    -- Fecha de fin
nombreSupervisor         -- Supervisor
cantidadPabellones       -- Pabellones
cantLimpiar              -- Pabellones limpiados
```

### 2. Tablas Relacionadas

- `metros_superficie` - Datos de metros cuadrados
- `zona` - Zonas (HEMBRA/MACHO)
- `sector` - Sectores
- `planilla` - Planillas de trabajo
- `dano` - Registros de daños

## 🎨 Personalización

### 1. Estilos CSS

Editar `printStyles.css` para personalizar la apariencia del PDF:

```css
/* Personalizar colores */
.bg-primary { background-color: #tu-color !important; }

/* Personalizar tipografías */
body { font-family: 'Tu-Fuente', Arial, sans-serif; }

/* Personalizar márgenes */
@page { margin: 20mm 15mm; }
```

### 2. Plantilla HTML

Modificar la función `generarHTMLConDatos()` en `generateDailyReport.js` para cambiar la estructura del reporte.

### 3. Datos Personalizados

Agregar nuevas consultas en las funciones de extracción de datos para incluir información adicional.

## 🐛 Solución de Problemas

### 1. Error de Timeout

```bash
# Aumentar timeout en el código
await page.waitForSelector('#elemento', { timeout: 60000 });
```

### 2. Error de Autenticación

```bash
# Verificar token
echo $AUTH_TOKEN

# Usar token directamente
node backend/report/cli-generate.js --authToken=mi-token
```

### 3. Error de Base de Datos

```bash
# Verificar conexión
node -e "require('./backend/src/config/database').authenticate()"

# Verificar vista unificada
node -e "require('./backend/src/config/database').query('SELECT COUNT(*) FROM vw_ordenes_unificada_completa')"
```

### 4. Error de Puppeteer

```bash
# Reinstalar Puppeteer
npm uninstall puppeteer
npm install puppeteer

# En sistemas Linux, instalar dependencias
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## 📊 Validación de Datos

### 1. Verificar Datos Extraídos

```bash
# Verificar metros superficie
node -e "
const { MetrosSuperficie } = require('./backend/src/models/metrosSuperficie');
MetrosSuperficie.findAll({ where: { fecha: '2025-01-15' } }).then(console.log);
"

# Verificar daños
node -e "
const sequelize = require('./backend/src/config/database');
sequelize.query('SELECT COUNT(*) as total FROM vw_ordenes_unificada_completa WHERE YEAR(fechaOrdenServicio) = 2025').then(console.log);
"
```

### 2. Verificar PDF Generado

```bash
# Verificar tamaño del archivo
ls -lh backend/reports/reporte_danos_2025-01-15.pdf

# Verificar que el archivo se puede abrir
file backend/reports/reporte_danos_2025-01-15.pdf
```

## 🔒 Seguridad

### 1. Autenticación

- Usar tokens JWT válidos
- Configurar permisos de usuario
- Validar acceso a datos sensibles

### 2. Variables de Entorno

- No hardcodear credenciales
- Usar archivos `.env` seguros
- Rotar tokens regularmente

### 3. Acceso a Archivos

- Configurar permisos de directorio
- Validar rutas de archivos
- Limpiar archivos temporales

## 📈 Monitoreo

### 1. Logs

```bash
# Ver logs del generador
tail -f backend/logs/pdf-generator.log

# Ver logs de errores
grep "ERROR" backend/logs/pdf-generator.log
```

### 2. Métricas

- Tiempo de generación
- Tamaño de archivos
- Tasa de éxito
- Uso de recursos

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:

- 📧 Email: soporte@empresa.com
- 📱 Teléfono: +56 9 XXXX XXXX
- 💬 Slack: #soporte-sistema-danos

---

**Desarrollado con ❤️ para el Sistema de Gestión de Daños**
