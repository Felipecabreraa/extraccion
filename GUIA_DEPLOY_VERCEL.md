# 🚀 Guía de Despliegue en Vercel

## 📋 Prerrequisitos

1. **Cuenta de Vercel**: [vercel.com](https://vercel.com)
2. **Base de datos MySQL**: Railway, PlanetScale, o similar
3. **Node.js**: Versión 18 o superior
4. **Git**: Para control de versiones

## 🔧 Configuración Inicial

### 1. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

### 2. **Configurar variables de entorno**

Crea un archivo `.env` en el directorio raíz con las siguientes variables:

```env
# Base de datos MySQL
DB_HOST=tu-host-mysql
DB_USER=tu-usuario-mysql
DB_PASSWORD=tu-password-mysql
DB_NAME=tu-nombre-base-datos
DB_PORT=3306

# Configuración del servidor
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=https://tu-dominio-vercel.vercel.app

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro

# Logging
LOG_LEVEL=info
```

### 3. **Actualizar configuración de axios**

En `frontend/src/api/axios.js`, actualiza la URL de producción:

```javascript
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-dominio-vercel.vercel.app/api'  // Tu URL de Vercel
  : 'http://localhost:3001/api';
```

## 🚀 Proceso de Despliegue

### Opción 1: Despliegue Automático

```bash
# Ejecutar script de despliegue
.\deploy-vercel.ps1
```

### Opción 2: Despliegue Manual

1. **Instalar dependencias del backend**:
```bash
cd backend
npm install
cd ..
```

2. **Instalar dependencias del frontend**:
```bash
cd frontend
npm install
npm run build
cd ..
```

3. **Desplegar en Vercel**:
```bash
vercel --prod
```

## ⚙️ Configuración en Vercel Dashboard

### 1. **Variables de Entorno**

En el dashboard de Vercel, ve a tu proyecto y configura las variables de entorno:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`
- `JWT_SECRET`
- `CORS_ORIGIN`

### 2. **Configuración de Build**

En `vercel.json` ya está configurado para:
- Backend: Node.js
- Frontend: Static build

## 🔍 Verificación Post-Despliegue

### 1. **Verificar API**
```bash
curl https://tu-dominio-vercel.vercel.app/api/danos-acumulados?anio=2024
```

### 2. **Verificar Frontend**
- Navegar a la URL de Vercel
- Verificar que los datos de daños acumulados se muestren correctamente
- Probar funcionalidades principales

## 🐛 Solución de Problemas

### Error: "Cannot find module"
- Verificar que todas las dependencias estén en `package.json`
- Ejecutar `npm install` en ambos directorios

### Error: "Database connection failed"
- Verificar variables de entorno en Vercel
- Asegurar que la base de datos MySQL esté accesible desde Vercel

### Error: "CORS policy"
- Verificar `CORS_ORIGIN` en variables de entorno
- Actualizar con la URL correcta de Vercel

## 📊 Monitoreo

### 1. **Logs de Vercel**
- Dashboard → Proyecto → Functions → Ver logs

### 2. **Métricas**
- Dashboard → Proyecto → Analytics

## 🔄 Actualizaciones

Para actualizar la aplicación:

```bash
# Hacer cambios en el código
git add .
git commit -m "Actualización"
git push

# Desplegar automáticamente (si configurado)
# O manualmente:
vercel --prod
```

## 🌐 URLs Importantes

- **Frontend**: `https://tu-dominio-vercel.vercel.app`
- **API**: `https://tu-dominio-vercel.vercel.app/api`
- **Dashboard Vercel**: [vercel.com/dashboard](https://vercel.com/dashboard)

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos MySQL accesible
- [ ] Dependencias instaladas
- [ ] Build del frontend exitoso
- [ ] API funcionando correctamente
- [ ] Datos de daños acumulados mostrándose
- [ ] CORS configurado correctamente
- [ ] SSL/HTTPS funcionando

---

**¡Tu aplicación estará lista para producción en Vercel!** 🎉 