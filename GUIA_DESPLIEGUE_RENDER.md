# ☁️ Guía de Despliegue en Render

## 📋 ¿Qué es Render?
Render es una plataforma moderna de hosting que ofrece:
- ✅ **Despliegue automático** desde Git
- ✅ **SSL gratuito** automático
- ✅ **Base de datos PostgreSQL** incluida
- ✅ **Escalado automático**
- ✅ **Muy fácil de usar**

## 🛠️ Paso 1: Preparación del Proyecto

### 1.1 Configurar para Render
```bash
# Crear archivo render.yaml en la raíz
touch render.yaml
```

**Crear `render.yaml`:**
```yaml
services:
  # Backend API
  - type: web
    name: extraccion-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DB_HOST
        fromDatabase:
          name: extraccion-db
          property: host
      - key: DB_USER
        fromDatabase:
          name: extraccion-db
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: extraccion-db
          property: password
      - key: DB_NAME
        fromDatabase:
          name: extraccion-db
          property: name
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 10000

  # Frontend
  - type: web
    name: extraccion-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://extraccion-backend.onrender.com/api

databases:
  - name: extraccion-db
    databaseName: extraccion_db
    user: extraccion_user
```

### 1.2 Configurar package.json del Backend
```json
{
  "scripts": {
    "start": "node src/app.js",
    "build": "npm install"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### 1.3 Configurar Variables de Entorno
Crear `backend/.env`:
```env
NODE_ENV=production
DB_HOST=${DB_HOST}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_PORT=5432
JWT_SECRET=${JWT_SECRET}
PORT=10000
```

## 🌐 Paso 2: Configuración en Render

### 2.1 Crear Cuenta
1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub
3. Conecta tu repositorio

### 2.2 Desplegar Base de Datos
1. **Crear Base de Datos PostgreSQL**
   - Click en "New" → "PostgreSQL"
   - Nombre: `extraccion-db`
   - Plan: Free (para empezar)
   - Click "Create Database"

2. **Configurar Base de Datos**
   - Anota: Host, User, Password, Database
   - Estas variables se usarán automáticamente

### 2.3 Desplegar Backend
1. **Crear Web Service**
   - Click en "New" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Nombre: `extraccion-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

2. **Configurar Variables**
   - En "Environment Variables":
   ```
   NODE_ENV=production
   JWT_SECRET=tu_jwt_secret_muy_seguro_2024
   ```

### 2.4 Desplegar Frontend
1. **Crear Static Site**
   - Click en "New" → "Static Site"
   - Conecta tu repositorio
   - Nombre: `extraccion-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

2. **Configurar Variables**
   - En "Environment Variables":
   ```
   REACT_APP_API_URL=https://extraccion-backend.onrender.com/api
   ```

## 🚀 Paso 3: Configuración de Base de Datos

### 3.1 Ejecutar Migraciones
```bash
# Conectar a la base de datos de Render
# Usar las credenciales del panel de Render

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Crear datos iniciales
npx sequelize-cli db:seed:all
```

### 3.2 Configurar Sequelize para PostgreSQL
En `backend/src/config/database.js`:
```javascript
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgresql',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgresql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
```

## 🔧 Paso 4: Configuración de Dominio

### 4.1 Dominio Personalizado (Opcional)
1. En el panel de Render
2. Ve a tu servicio → "Settings"
3. "Custom Domains"
4. Agrega tu dominio
5. Configura DNS según las instrucciones

### 4.2 SSL Automático
- Render proporciona SSL automático
- No necesitas configuración adicional

## 📊 Monitoreo y Logs

### 4.1 Ver Logs
```bash
# En el panel de Render
# Ve a tu servicio → "Logs"
# Puedes ver logs en tiempo real
```

### 4.2 Health Checks
```bash
# Verificar API
curl https://extraccion-backend.onrender.com/api/health

# Verificar frontend
curl https://extraccion-frontend.onrender.com
```

## 💰 Costos
- **Plan Free**: $0/mes (con limitaciones)
- **Plan Starter**: $7/mes
- **Plan Standard**: $25/mes
- **Base de datos**: $7/mes (PostgreSQL)

## ✅ Checklist
- [ ] Cuenta Render creada
- [ ] Repositorio conectado
- [ ] Base de datos PostgreSQL creada
- [ ] Backend desplegado
- [ ] Frontend desplegado
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Dominio configurado (opcional)
- [ ] SSL funcionando
- [ ] Aplicación funcionando

## 🆘 Solución de Problemas

### Problema: Build falla
```bash
# Verificar logs de build
# En Render → Logs → Build Logs

# Verificar package.json
# Asegurar que buildCommand y startCommand sean correctos
```

### Problema: Base de datos no conecta
```bash
# Verificar variables de entorno
# En Render → Environment Variables

# Verificar configuración de Sequelize
# Asegurar que dialect sea 'postgresql'
```

### Problema: Frontend no carga
```bash
# Verificar build del frontend
# En Render → Logs → Build Logs

# Verificar REACT_APP_API_URL
# Asegurar que apunte al backend correcto
``` 