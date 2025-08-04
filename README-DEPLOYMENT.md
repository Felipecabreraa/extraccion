# 🚀 Guía de Despliegue - Configuración desde Cero

## 📋 Opciones de Despliegue Disponibles

### 1. **Railway (Recomendado para Backend)**
- **Ventajas**: Fácil configuración, base de datos incluida, SSL automático
- **URL**: https://railway.app
- **Configuración**: Ya configurado en el proyecto

### 2. **Render (Alternativa para Backend)**
- **Ventajas**: Generoso plan gratuito, fácil configuración
- **URL**: https://render.com
- **Configuración**: Requiere configuración manual

### 3. **Netlify (Recomendado para Frontend)**
- **Ventajas**: Excelente para React, CDN global, SSL automático
- **URL**: https://netlify.com
- **Configuración**: Requiere configuración manual

### 4. **Vercel (Alternativa para Frontend)**
- **Ventajas**: Optimizado para React, excelente rendimiento
- **URL**: https://vercel.com
- **Configuración**: Requiere configuración manual

## 🔧 Configuración Inicial

### Backend (Railway)
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicializar proyecto
cd backend
railway init

# 4. Configurar variables de entorno
railway variables set NODE_ENV=production
railway variables set DB_HOST=tu-host
railway variables set DB_USER=tu-usuario
railway variables set DB_PASSWORD=tu-password
railway variables set DB_NAME=tu-database

# 5. Desplegar
railway up
```

### Frontend (Netlify)
```bash
# 1. Construir el proyecto
cd frontend
npm run build

# 2. Desplegar a Netlify
# Opción A: Drag & Drop
# - Ir a netlify.com
# - Arrastrar la carpeta 'build' al área de deploy

# Opción B: CLI
npm install -g netlify-cli
netlify deploy --dir=build --prod
```

## 🌐 Variables de Entorno Requeridas

### Backend (.env)
```env
NODE_ENV=production
PORT=3000
DB_HOST=tu-host
DB_USER=tu-usuario
DB_PASSWORD=tu-password
DB_NAME=tu-database
JWT_SECRET=tu-jwt-secret
CORS_ORIGIN=https://tu-frontend.netlify.app
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://tu-backend.railway.app
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
```

## 📝 Scripts de Despliegue

### Despliegue Manual
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run build
```

### Despliegue Automático
```bash
# Usar los scripts existentes
node scripts/deploy-production.js
```

## 🔍 Verificación Post-Despliegue

1. **Backend**: Verificar que la API responde en `/health`
2. **Frontend**: Verificar que carga correctamente
3. **Base de datos**: Verificar conexión y tablas
4. **CORS**: Verificar que el frontend puede comunicarse con el backend

## 🚨 Troubleshooting

### Problemas Comunes
- **CORS Error**: Verificar `CORS_ORIGIN` en backend
- **Database Connection**: Verificar variables de entorno
- **Build Failures**: Verificar dependencias y Node.js version

### Logs y Debugging
```bash
# Railway logs
railway logs

# Netlify logs
netlify logs
```

## 📚 Recursos Adicionales

- [Railway Documentation](https://docs.railway.app/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)

---

**Nota**: Esta configuración está lista para un nuevo despliegue limpio sin dependencias de Vercel. 