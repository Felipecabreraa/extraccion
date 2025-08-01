# 🚂 Guía: Desplegar Backend en Railway

## 📋 Prerrequisitos

1. **Cuenta de Railway**: [railway.app](https://railway.app)
2. **GitHub**: Repositorio con el backend
3. **Node.js**: Backend preparado

## 🚀 Pasos para el Deploy

### 1. Preparar el Backend

```bash
# Estructura recomendada
backend/
├── package.json
├── server.js (o app.js)
├── .env
├── .gitignore
└── README.md
```

### 2. Conectar con Railway

1. **Ir a Railway Dashboard**
2. **"New Project"** → **"Deploy from GitHub repo"**
3. **Seleccionar repositorio del backend**
4. **Configurar variables de entorno**

### 3. Variables de Entorno en Railway

```env
# Base de datos
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=extraccion_db

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://frontend-1m7t9y5hl-felipe-lagos-projects-f57024eb.vercel.app

# Puerto
PORT=3000
```

### 4. Configurar Base de Datos

Railway ofrece:
- **PostgreSQL** (recomendado)
- **MySQL**
- **MongoDB**

### 5. Obtener URL del Backend

Una vez desplegado, Railway te dará una URL como:
```
https://tu-backend-production.up.railway.app
```

## 🔗 Conectar Frontend con Backend

### 1. Actualizar Variables de Entorno en Vercel

```bash
# En el dashboard de Vercel
REACT_APP_API_URL=https://tu-backend-production.up.railway.app
```

### 2. Actualizar vercel.json

```json
{
  "env": {
    "REACT_APP_API_URL": "https://tu-backend-production.up.railway.app"
  }
}
```

## 📊 Ventajas de Railway

### ✅ **Para Backend:**
- **Deploy automático** desde GitHub
- **Base de datos incluida**
- **SSL automático**
- **Escalado automático**
- **Logs en tiempo real**
- **Variables de entorno**
- **Custom domains**

### ✅ **Para Frontend (Vercel):**
- **Deploy automático**
- **CDN global**
- **SSL automático**
- **Preview deployments**
- **Analytics integrados**

## 🔧 Configuración CORS

### En el Backend (Railway):

```javascript
// server.js
const cors = require('cors');

app.use(cors({
  origin: [
    'https://frontend-1m7t9y5hl-felipe-lagos-projects-f57024eb.vercel.app',
    'http://localhost:3000' // desarrollo
  ],
  credentials: true
}));
```

## 🚀 Comandos Útiles

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Ver proyectos
railway projects

# Ver logs
railway logs

# Deploy manual
railway up
```

## 📱 Monitoreo

### Railway Dashboard:
- **Deployments**
- **Logs en tiempo real**
- **Variables de entorno**
- **Base de datos**
- **Analytics**

### Vercel Dashboard:
- **Frontend deployments**
- **Performance**
- **Analytics**
- **Domain management**

## 🔄 Workflow Completo

1. **Desarrollar** → Push a GitHub
2. **Railway** → Deploy automático del backend
3. **Vercel** → Deploy automático del frontend
4. **Aplicación** → Funcionando en producción

## 💰 Costos

### Railway:
- **Free tier**: $5/mes incluidos
- **Pro**: $20/mes
- **Enterprise**: Contactar

### Vercel:
- **Hobby**: Gratis
- **Pro**: $20/mes
- **Enterprise**: Contactar

---

**🎉 ¡Railway + Vercel = Combinación perfecta para aplicaciones full-stack!** 