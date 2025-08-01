# 🚀 Guía de Despliegue Completo - Vercel + Railway

## 📋 Estado Actual

### ✅ Frontend (Vercel)
- **URL:** https://frontend-1m7t9y5hl-felipe-lagos-projects-f57024eb.vercel.app
- **Estado:** ✅ Desplegado y funcionando
- **Configuración:** Optimizada para producción

### 🔄 Backend (Railway) - Pendiente
- **Estado:** ⏳ Listo para desplegar
- **Configuración:** Preparada para Railway

## 🚂 Paso 1: Desplegar Backend en Railway

### 1.1 Preparar Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login con Railway
railway login
```

### 1.2 Desplegar Backend

```bash
# Navegar al directorio backend
cd backend

# Verificar configuración
ls railway.json

# Deploy a Railway
railway up
```

### 1.3 Configurar Variables de Entorno en Railway

Una vez desplegado, ir al dashboard de Railway y configurar:

```env
# Base de datos (Railway te proporcionará estos valores)
DB_HOST=tu-host-railway
DB_USER=tu-user-railway
DB_PASSWORD=tu-password-railway
DB_NAME=tu-database-railway
DB_PORT=3306

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://frontend-1m7t9y5hl-felipe-lagos-projects-f57024eb.vercel.app
```

### 1.4 Obtener URL del Backend

Railway te proporcionará una URL como:
```
https://tu-backend-production.up.railway.app
```

## 🔗 Paso 2: Conectar Frontend con Backend

### 2.1 Actualizar Variables de Entorno en Vercel

```bash
# En el dashboard de Vercel
REACT_APP_API_URL=https://tu-backend-production.up.railway.app
```

### 2.2 Actualizar vercel.json

```json
{
  "env": {
    "REACT_APP_API_URL": "https://tu-backend-production.up.railway.app"
  }
}
```

### 2.3 Redeploy Frontend

```bash
# Navegar al directorio frontend
cd frontend

# Deploy con nueva configuración
npx vercel --prod
```

## 🗄️ Paso 3: Configurar Base de Datos

### 3.1 Opciones de Base de Datos en Railway

Railway ofrece:
- **PostgreSQL** (recomendado)
- **MySQL**
- **MongoDB**

### 3.2 Configurar MySQL en Railway

1. En el dashboard de Railway
2. "New Service" → "Database" → "MySQL"
3. Railway te proporcionará las credenciales
4. Actualizar variables de entorno con las nuevas credenciales

## 🔧 Paso 4: Verificar Configuración

### 4.1 Probar Backend

```bash
# Probar endpoint de salud
curl https://tu-backend-production.up.railway.app/api/health
```

### 4.2 Probar Frontend

```bash
# Abrir en navegador
https://frontend-1m7t9y5hl-felipe-lagos-projects-f57024eb.vercel.app
```

## 📊 Monitoreo

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

## 🚀 Comandos Útiles

### Railway
```bash
# Ver proyectos
railway projects

# Ver logs
railway logs

# Ver status
railway status

# Deploy manual
railway up
```

### Vercel
```bash
# Ver deployments
npx vercel ls

# Ver logs
npx vercel logs --follow

# Deploy manual
npx vercel --prod
```

## 🔄 Workflow Automático

Una vez configurado:

1. **Desarrollar** → Push a GitHub
2. **Railway** → Deploy automático del backend
3. **Vercel** → Deploy automático del frontend
4. **Aplicación** → Funcionando en producción

## 🛠️ Troubleshooting

### Problemas Comunes:

1. **CORS Error**
   - Verificar configuración CORS en backend
   - Asegurar que la URL del frontend esté en la lista de orígenes permitidos

2. **Database Connection Error**
   - Verificar variables de entorno en Railway
   - Asegurar que la base de datos esté creada

3. **Build Failed**
   - Verificar logs en Railway/Vercel
   - Asegurar que todas las dependencias estén instaladas

## 💰 Costos Estimados

### Railway:
- **Free tier**: $5/mes incluidos
- **Pro**: $20/mes

### Vercel:
- **Hobby**: Gratis
- **Pro**: $20/mes

## 📋 Checklist de Despliegue

- [ ] Railway CLI instalado
- [ ] Backend desplegado en Railway
- [ ] Variables de entorno configuradas en Railway
- [ ] Base de datos configurada
- [ ] URL del backend obtenida
- [ ] REACT_APP_API_URL actualizada en Vercel
- [ ] Frontend redeployado
- [ ] Aplicación funcionando
- [ ] Pruebas realizadas

---

**🎉 ¡Una vez completados estos pasos, tendrás tu aplicación full-stack funcionando en producción!** 