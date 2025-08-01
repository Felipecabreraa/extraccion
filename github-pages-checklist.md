# ✅ Checklist GitHub Pages + Base de Datos Externa

## 📋 Preparación
- [ ] Repositorio en GitHub
- [ ] Cuenta en Render.com (gratis)
- [ ] Cuenta en PlanetScale.com (gratis)
- [ ] Dominio personalizado (opcional)

## 🌐 Configurar GitHub Pages

### 1. **Preparar Frontend**
- [ ] Construir frontend: `cd frontend && npm run build`
- [ ] Configurar para GitHub Pages
- [ ] Actualizar variables de entorno

### 2. **Configurar GitHub Pages**
- [ ] Ir a Settings → Pages
- [ ] Source: Deploy from a branch
- [ ] Branch: main
- [ ] Folder: /frontend/build
- [ ] Save

### 3. **Configurar Dominio Personalizado**
- [ ] En Settings → Pages
- [ ] Agregar dominio personalizado
- [ ] Configurar DNS
- [ ] Activar HTTPS

## 🗄️ Base de Datos Externa

### 1. **PlanetScale (Recomendado - Gratis)**
- [ ] Crear cuenta en planetscale.com
- [ ] Crear nueva base de datos
- [ ] Obtener URL de conexión
- [ ] Configurar variables de entorno

### 2. **Railway MySQL (Alternativa)**
- [ ] Crear cuenta en railway.app
- [ ] Crear servicio MySQL
- [ ] Obtener credenciales
- [ ] Configurar variables

## ⚡ Backend en Render

### 1. **Crear Servicio en Render**
- [ ] Conectar repositorio GitHub
- [ ] Configurar como Web Service
- [ ] Agregar variables de entorno
- [ ] Configurar build settings

### 2. **Variables de Entorno en Render**
```env
NODE_ENV=production
PORT=10000
DB_HOST=tu-host-mysql.planetscale.com
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_datos
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_muy_seguro
CORS_ORIGIN=https://tu-usuario.github.io
```

## 🔧 Configurar Frontend

### 1. **Actualizar API URL**
- [ ] Editar `frontend/src/api/axios.js`
- [ ] Cambiar URL a Render backend
- [ ] Configurar CORS

### 2. **Variables de Entorno Frontend**
```env
REACT_APP_API_URL=https://tu-backend.onrender.com/api
REACT_APP_ENV=production
```

## 📤 Despliegue Automático

### 1. **Frontend (GitHub Pages)**
- [ ] Push a GitHub
- [ ] GitHub Pages se despliega automáticamente
- [ ] URL: https://tu-usuario.github.io/tu-repo

### 2. **Backend (Render)**
- [ ] Push a GitHub
- [ ] Render detecta cambios
- [ ] Despliega automáticamente
- [ ] URL: https://tu-backend.onrender.com

## 🔗 Configurar Dominio Personalizado

### 1. **Frontend**
- [ ] Comprar dominio (GoDaddy, Namecheap, etc.)
- [ ] Configurar DNS en GitHub Pages
- [ ] Activar HTTPS

### 2. **Backend**
- [ ] En Render Dashboard
- [ ] Agregar dominio personalizado
- [ ] Configurar DNS
- [ ] SSL automático

## 💰 Costos Totales
- [ ] **GitHub Pages**: GRATIS
- [ ] **Render Backend**: GRATIS (hasta 750 horas/mes)
- [ ] **PlanetScale DB**: GRATIS (hasta 1GB)
- [ ] **Dominio**: $10-15/año (opcional)
- [ ] **SSL**: GRATIS (automático)

## 🚀 URLs Finales
- **Frontend**: https://tu-usuario.github.io/tu-repo
- **Backend**: https://tu-backend.onrender.com
- **Base de Datos**: PlanetScale (gratis) 