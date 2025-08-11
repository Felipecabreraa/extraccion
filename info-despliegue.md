# 🚀 Despliegue en Render - Información Completa

## ✅ Estado Actual
- ✅ Código subido a GitHub
- ✅ Errores de build corregidos
- ✅ Configuración de Render lista
- ✅ Variables de entorno configuradas

## 📊 URLs de Despliegue
- **Frontend**: https://extraccion-frontend-test.onrender.com
- **Backend**: https://extraccion-backend-test.onrender.com
- **API**: https://extraccion-backend-test.onrender.com/api

## 🔧 Configuración Técnica

### Backend (Node.js)
- **Runtime**: Node.js
- **Base de datos**: MySQL (trn.cl)
- **Puerto**: 3001
- **Variables de entorno**:
  - NODE_ENV=production
  - DB_HOST=trn.cl
  - DB_USER=trn_felipe
  - DB_PASSWORD=RioNegro2025@
  - DB_NAME=trn_extraccion_test
  - DB_PORT=3306
  - JWT_SECRET=tu_jwt_secret_super_seguro_2024
  - CORS_ORIGIN=https://extraccion-frontend-test.onrender.com
  - PORT=3001

### Frontend (React)
- **Runtime**: Static Site
- **Build Command**: node build-direct.js
- **Publish Path**: ./build
- **Variables de entorno**:
  - REACT_APP_API_URL=https://extraccion-backend-test.onrender.com/api
  - NODE_ENV=production
  - CI=false
  - GENERATE_SOURCEMAP=false

## 📋 Pasos para Completar el Despliegue

### 1. Acceder a Render Dashboard
- Ve a https://dashboard.render.com
- Inicia sesión con tu cuenta

### 2. Conectar Repositorio
- Haz clic en "New +"
- Selecciona "Blueprint"
- Conecta tu repositorio de GitHub: `Felipecabreraa/extraccion`

### 3. Configuración Automática
- Render detectará automáticamente el archivo `render.yaml`
- Se crearán dos servicios automáticamente:
  - `extraccion-backend-test`
  - `extraccion-frontend-test`

### 4. Despliegue
- Los servicios se desplegarán en paralelo
- Tiempo estimado: 5-10 minutos
- El backend se desplegará primero
- El frontend se desplegará después

## 🔍 Verificación Post-Despliegue

### Backend
```bash
# Verificar que el backend responde
curl https://extraccion-backend-test.onrender.com/api/health
```

### Frontend
```bash
# Verificar que el frontend carga
curl https://extraccion-frontend-test.onrender.com
```

## 🛠️ Comandos Útiles

### Verificar estado del repositorio
```bash
git status
git log --oneline -5
```

### Verificar configuración local
```bash
# Backend
cd backend
npm run start

# Frontend
cd frontend
npm run build
```

## 📞 Soporte
Si encuentras problemas durante el despliegue:
1. Revisa los logs en Render Dashboard
2. Verifica que las variables de entorno estén correctas
3. Asegúrate de que la base de datos esté accesible

## 🎯 URLs Finales
Una vez completado el despliegue, tu aplicación estará disponible en:
- **Aplicación Principal**: https://extraccion-frontend-test.onrender.com
- **API Backend**: https://extraccion-backend-test.onrender.com/api 