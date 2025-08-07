# 🚀 INSTRUCCIONES COMPLETAS - Configuración y Ejecución del Proyecto

## 📋 Índice
1. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
2. [Configuración de Base de Datos](#configuración-de-base-de-datos)
3. [Configuración de Frontend](#configuración-de-frontend)
4. [Ejecución del Proyecto](#ejecución-del-proyecto)
5. [Scripts Automatizados](#scripts-automatizados)
6. [Solución de Problemas](#solución-de-problemas)

## 🔧 Configuración de Variables de Entorno

### 1. Configuración Automática
```bash
# Ejecutar configurador automático
node configurar-variables-entorno.js
```

### 2. Verificar Configuración
```bash
# Verificar que todo esté correcto
node verificar-variables-entorno.js
```

### 3. Cambiar Ambiente
```bash
# Cambiar a producción
./cambiar-ambiente.sh production

# Cambiar a staging
./cambiar-ambiente.sh staging

# Cambiar a desarrollo
./cambiar-ambiente.sh development

# Verificar configuración actual
./cambiar-ambiente.sh check
```

## 🗄️ Configuración de Base de Datos

### Base de Datos Confirmada
```env
DB_HOST=trn.cl
DB_PORT=3306
DB_NAME=trn_extraccion
DB_USER=trn_felipe
DB_PASSWORD=RioNegro2025@
```

### Configuración Automática de BD
```bash
# Configurar base de datos y ejecutar migraciones
node configurar-base-datos.js
```

### Configuración Manual de BD
```bash
# 1. Verificar conexión
mysql -h trn.cl -P 3306 -u trn_felipe -pRioNegro2025@ trn_extraccion -e "SELECT 1"

# 2. Ejecutar migraciones
cd backend
npx sequelize-cli db:migrate

# 3. Verificar estado de migraciones
npx sequelize-cli db:migrate:status

# 4. Ejecutar seeders (si existen)
npx sequelize-cli db:seed:all
```

## 🎨 Configuración de Frontend

### Variables de Entorno del Frontend
```env
# Desarrollo
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development

# Staging
REACT_APP_API_URL=https://backend-staging.up.railway.app/api
REACT_APP_ENV=staging

# Producción
REACT_APP_API_URL=https://backend-production.up.railway.app/api
REACT_APP_ENV=production
```

### Configuración Automática del Frontend
```bash
# Configurar archivos .env del frontend
node configurar-frontend.js
```

### Configuración Manual del Frontend
```bash
# Crear archivo .env en el directorio frontend
cd frontend
echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
echo "REACT_APP_ENV=development" >> .env
```

## 🚀 Ejecución del Proyecto

### Opción 1: Ejecución Automática
```bash
# Ejecutar todo automáticamente
node ejecutar-proyecto.js
```

### Opción 2: Ejecución Manual

#### Desarrollo (ambos servicios)
```bash
npm run dev
```

#### Por separado:
```bash
# Backend (Puerto 3001)
npm run dev:backend

# Frontend (Puerto 3000)
npm run dev:frontend
```

#### Ejecución manual por separado:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🤖 Scripts Automatizados

### Scripts Disponibles
- ✅ `configurar-variables-entorno.js` - Configuración completa de variables
- ✅ `verificar-variables-entorno.js` - Verificación y validación
- ✅ `cambiar-ambiente.sh` - Cambio rápido de ambiente
- ✅ `configurar-frontend.js` - Configuración específica del frontend
- ✅ `configurar-base-datos.js` - Configuración de BD y migraciones
- ✅ `ejecutar-proyecto.js` - Ejecución automática del proyecto

### Flujo de Trabajo Completo
```bash
# 1. Configurar variables de entorno
node configurar-variables-entorno.js

# 2. Verificar configuración
node verificar-variables-entorno.js

# 3. Configurar base de datos
node configurar-base-datos.js

# 4. Configurar frontend
node configurar-frontend.js

# 5. Ejecutar proyecto
node ejecutar-proyecto.js
```

## 📁 Estructura de Archivos

### Backend
```
backend/
├── .env                    # Configuración actual
├── .env.development        # Desarrollo local
├── .env.staging           # Ambiente de pruebas
├── .env.production        # Producción
└── env.*.example          # Ejemplos seguros
```

### Frontend
```
frontend/
├── .env                   # Configuración actual
├── .env.development       # Desarrollo local
├── .env.staging          # Ambiente de pruebas
├── .env.production       # Producción
└── env.*.example         # Ejemplos seguros
```

## 🔒 Configuración de Seguridad

### Variables Sensibles
```env
# Base de datos
DB_HOST=trn.cl
DB_PORT=3306
DB_NAME=trn_extraccion
DB_USER=trn_felipe
DB_PASSWORD=RioNegro2025@

# JWT
JWT_SECRET=extraccion_jwt_secret_2025_railway_production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://frontend-1m7t9y5hl-felipe-lagos-projects-f57024eb.vercel.app
```

### Protecciones Implementadas
- ✅ Archivos `.env` en `.gitignore`
- ✅ Ejemplos seguros (sin credenciales reales)
- ✅ Validación automática de secretos
- ✅ Diferentes configuraciones por ambiente

## 🔧 Solución de Problemas

### Problema: Variables no se cargan
```bash
# Verificar archivos
ls -la backend/.env*
ls -la frontend/.env*

# Verificar sintaxis
cat backend/.env | grep -v "^#" | grep -v "^$"
```

### Problema: Base de datos no conecta
```bash
# Probar conexión
mysql -h trn.cl -P 3306 -u trn_felipe -pRioNegro2025@ trn_extraccion -e "SELECT 1"

# Verificar variables
grep DB_ backend/.env
```

### Problema: Migraciones fallan
```bash
# Verificar Sequelize CLI
cd backend
npx sequelize-cli --version

# Verificar estado de migraciones
npx sequelize-cli db:migrate:status

# Revertir última migración si es necesario
npx sequelize-cli db:migrate:undo
```

### Problema: Frontend no conecta al backend
```bash
# Verificar URL del API
grep REACT_APP_API_URL frontend/.env

# Verificar que el backend esté corriendo
curl http://localhost:3001/api/health
```

### Problema: CORS errors
```bash
# Verificar CORS_ORIGIN
grep CORS_ORIGIN backend/.env

# Actualizar CORS si es necesario
sed -i 's/CORS_ORIGIN=.*/CORS_ORIGIN=http:\/\/localhost:3000/' backend/.env
```

## 📞 Comandos Útiles

### Verificar Estado
```bash
# Verificar configuración actual
./cambiar-ambiente.sh check

# Verificar conexión BD
mysql -h trn.cl -P 3306 -u trn_felipe -pRioNegro2025@ trn_extraccion -e "SELECT 1"

# Verificar puertos
netstat -tulpn | grep :300
```

### Backup y Restauración
```bash
# Backup de configuración
cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
cp frontend/.env frontend/.env.backup.$(date +%Y%m%d_%H%M%S)

# Restaurar configuración
cp backend/.env.backup.20250101_120000 backend/.env
cp frontend/.env.backup.20250101_120000 frontend/.env
```

### Generar Secretos Seguros
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Password
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🎯 Flujo de Trabajo Recomendado

### Desarrollo Local
1. `./cambiar-ambiente.sh development`
2. `node configurar-base-datos.js`
3. `npm run dev`

### Pruebas (Staging)
1. `./cambiar-ambiente.sh staging`
2. `node configurar-base-datos.js`
3. `npm run dev`

### Producción
1. `./cambiar-ambiente.sh production`
2. `node configurar-base-datos.js`
3. `npm run dev`

## 📖 Documentación Adicional

- **Guía Variables**: `GUIA_VARIABLES_ENTORNO.md`
- **Resumen Configuración**: `RESUMEN_CONFIGURACION_VARIABLES.md`
- **Instrucciones Rápidas**: `INSTRUCCIONES_RAPIDAS_VARIABLES.md`

---

**¡Todo listo para usar!** 🚀

**Base de datos**: `trn_extraccion` ✅  
**Backend**: Puerto 3001 ✅  
**Frontend**: Puerto 3000 ✅  
**Configuración**: Automática ✅ 