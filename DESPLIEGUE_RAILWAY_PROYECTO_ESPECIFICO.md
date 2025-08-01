# 🚂 Despliegue Específico: Proyecto Extracción en Railway

## 📋 Análisis de tu Proyecto

Basándome en tu estructura actual:

### Backend (Node.js + Express + MySQL)
- ✅ **MySQL2** como driver de base de datos
- ✅ **Sequelize** como ORM
- ✅ **Express** como framework
- ✅ **JWT** para autenticación
- ✅ **Multer** para uploads
- ✅ **CORS** configurado

### Frontend (React + Material-UI)
- ✅ **React 19** con Material-UI
- ✅ **Chart.js** para gráficos
- ✅ **React Router** para navegación
- ✅ **Axios** para API calls
- ✅ **Tailwind CSS** para estilos

---

## 🛠️ Paso 1: Preparación Específica para tu Proyecto

### 1.1 Instalar Railway CLI
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Verificar instalación
railway --version
```

### 1.2 Configurar Railway para tu Estructura
```bash
# Navegar a tu proyecto
cd EXTRACCION

# Inicializar Railway
railway init
```

### 1.3 Crear railway.json Específico
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 1.4 Actualizar package.json del Backend
```json
{
  "scripts": {
    "start": "node src/app.js",
    "build": "npm install",
    "dev": "nodemon src/app.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

---

## 🌐 Paso 2: Configuración de Base de Datos MySQL

### 2.1 Crear Base de Datos en Railway
```bash
# Crear base de datos MySQL
railway add

# Selecciona "MySQL" cuando te pregunte
# Railway creará automáticamente las variables de entorno
```

### 2.2 Actualizar Configuración de Sequelize
En `backend/src/config/database.js`:
```javascript
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'extraccion',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false,
    dialectOptions: {
      // Configuración SSL para Railway
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

module.exports = sequelize;
```

### 2.3 Configurar Variables de Entorno
```bash
# Ver variables actuales
railway variables

# Configurar variables específicas para tu proyecto
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=tu_jwt_secret_muy_seguro_2024
railway variables set PORT=3000
railway variables set CORS_ORIGIN=https://tu-frontend.railway.app
```

---

## 🚀 Paso 3: Desplegar Backend

### 3.1 Conectar Repositorio
```bash
# Conectar tu proyecto
railway link

# Selecciona tu proyecto o crea uno nuevo
```

### 3.2 Desplegar Backend
```bash
# Desplegar aplicación
railway up

# Ver logs en tiempo real
railway logs

# Verificar estado
railway status
```

### 3.3 Ejecutar Migraciones
```bash
# Conectar a la base de datos
railway connect

# Ejecutar migraciones
cd backend
npx sequelize-cli db:migrate

# Crear datos iniciales (si tienes seeders)
npx sequelize-cli db:seed:all
```

---

## 🎨 Paso 4: Configurar Frontend

### 4.1 Actualizar Variables de Entorno del Frontend
En `frontend/.env`:
```env
REACT_APP_API_URL=https://tu-backend.railway.app/api
REACT_APP_ENV=production
```

### 4.2 Actualizar package.json del Frontend
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "https://tu-backend.railway.app"
}
```

### 4.3 Desplegar Frontend (Opcional)
Si quieres desplegar el frontend también en Railway:

```bash
# Crear servicio separado para frontend
railway add

# Configurar para frontend
railway variables set REACT_APP_API_URL=https://tu-backend.railway.app/api
```

---

## 🔧 Paso 5: Configuración Específica para tu Aplicación

### 5.1 Configurar CORS
En `backend/src/app.js`, asegúrate de que CORS esté configurado:
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://tu-frontend.railway.app',
  credentials: true
}));
```

### 5.2 Configurar Uploads
Para los uploads con Multer:
```javascript
// En tu controlador de uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
```

### 5.3 Configurar Health Check
Crear endpoint de health check en `backend/src/routes/health.js`:
```javascript
const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
```

---

## 📊 Paso 6: Monitoreo y Verificación

### 6.1 Verificar Despliegue
```bash
# Ver logs del backend
railway logs

# Verificar health check
curl https://tu-backend.railway.app/api/health

# Verificar base de datos
railway connect
mysql -u $DB_USER -p $DB_NAME
```

### 6.2 Verificar Variables de Entorno
```bash
# Ver todas las variables
railway variables

# Verificar variables específicas
railway variables get DB_HOST
railway variables get DB_USER
railway variables get JWT_SECRET
```

### 6.3 Verificar Conexión a Base de Datos
```bash
# Conectar a MySQL
railway connect

# Verificar tablas
mysql -u $DB_USER -p $DB_NAME -e "SHOW TABLES;"

# Verificar datos
mysql -u $DB_USER -p $DB_NAME -e "SELECT COUNT(*) FROM usuarios;"
```

---

## 🆘 Solución de Problemas Específicos

### Problema: Sequelize no conecta a MySQL
```bash
# Verificar variables de entorno
railway variables

# Verificar configuración
cat backend/src/config/database.js

# Probar conexión
railway connect
mysql -u $DB_USER -p $DB_NAME
```

### Problema: Frontend no conecta al Backend
```bash
# Verificar URL del backend
railway variables get REACT_APP_API_URL

# Verificar CORS
railway logs | grep CORS
```

### Problema: Uploads no funcionan
```bash
# Verificar directorio uploads
railway connect
ls -la uploads/

# Verificar permisos
chmod 755 uploads/
```

### Problema: JWT no funciona
```bash
# Verificar JWT_SECRET
railway variables get JWT_SECRET

# Verificar en logs
railway logs | grep JWT
```

---

## 🔧 Comandos Útiles para tu Proyecto

### Gestión del Backend
```bash
# Ver logs del backend
railway logs

# Reiniciar backend
railway restart

# Ver variables del backend
railway variables
```

### Gestión de Base de Datos
```bash
# Conectar a MySQL
railway connect

# Ejecutar migraciones
cd backend && npx sequelize-cli db:migrate

# Crear backup
railway connect
mysqldump -u $DB_USER -p $DB_NAME > backup.sql
```

### Gestión de Despliegues
```bash
# Ver despliegues recientes
railway deployments

# Revertir a versión anterior
railway rollback

# Ver uso de recursos
railway usage
```

---

## ✅ Checklist Específico para tu Proyecto

- [ ] Railway CLI instalado
- [ ] Proyecto inicializado con `railway init`
- [ ] Base de datos MySQL creada con `railway add`
- [ ] Variables de entorno configuradas (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET)
- [ ] Configuración de Sequelize actualizada con SSL
- [ ] Backend desplegado con `railway up`
- [ ] Migraciones ejecutadas (`npx sequelize-cli db:migrate`)
- [ ] Health check funcionando (`/api/health`)
- [ ] CORS configurado correctamente
- [ ] Frontend configurado para conectar al backend
- [ ] Logs monitoreados y sin errores
- [ ] Base de datos accesible y con datos
- [ ] JWT funcionando correctamente
- [ ] Uploads funcionando (si aplica)

---

## 🎯 Ventajas Específicas para tu Proyecto

### ✅ **Railway es perfecto para tu proyecto porque:**

1. **MySQL Nativo**: Tu proyecto usa MySQL2 y Sequelize - Railway lo soporta nativamente
2. **Node.js 18**: Compatible con tu versión de Node.js
3. **Express**: Funciona perfectamente con tu backend Express
4. **Variables de Entorno**: Gestión segura de credenciales de MySQL
5. **SSL Automático**: Para conexiones seguras a la base de datos
6. **Escalado**: Crece con tu aplicación de extracción

### 🚀 **Flujo de Trabajo para tu Proyecto:**

```bash
# 1. Hacer cambios en tu código
git add .
git commit -m "Nuevas características de extracción"
git push origin main

# 2. Railway automáticamente despliega
# (No necesitas hacer nada más)

# 3. Verificar que todo funcione
railway logs
curl https://tu-backend.railway.app/api/health
```

¿Te gustaría que te ayude a configurar Railway paso a paso con tu proyecto específico? 