# ☁️ Guía de Despliegue en Render con MySQL

## 📋 ¿Qué es Render?
Render es una plataforma moderna de hosting que ofrece:
- ✅ **Despliegue automático** desde Git
- ✅ **SSL gratuito** automático
- ✅ **Base de datos MySQL** (externa)
- ✅ **Escalado automático**
- ✅ **Muy fácil de usar**

## ⚠️ Importante: MySQL en Render
Render **NO** proporciona MySQL nativo. Tienes estas opciones:

### Opción 1: **Base de Datos Externa** (Recomendado)
- **PlanetScale** (MySQL compatible)
- **AWS RDS**
- **DigitalOcean Managed MySQL**
- **Hostinger MySQL**

### Opción 2: **Migrar a PostgreSQL** (Más fácil)
- Render tiene PostgreSQL nativo
- Tu proyecto es compatible con ambos

## 🛠️ Paso 1: Preparación del Proyecto

### 1.1 Configurar para Render con MySQL Externo
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
        value: tu-host-mysql-externo.com
      - key: DB_USER
        value: tu_usuario_mysql
      - key: DB_PASSWORD
        sync: false
      - key: DB_NAME
        value: extraccion_db
      - key: DB_PORT
        value: 3306
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
DB_HOST=tu-host-mysql-externo.com
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=extraccion_db
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_muy_seguro_2024
PORT=10000
```

## 🌐 Paso 2: Configuración de Base de Datos MySQL

### 2.1 Opción A: PlanetScale (Recomendado)
```bash
# Instalar PlanetScale CLI
npm install -g pscale

# Login
pscale auth login

# Crear base de datos
pscale database create extraccion-db

# Crear branch
pscale branch create extraccion-db main

# Obtener credenciales
pscale connect extraccion-db main
```

### 2.2 Opción B: AWS RDS MySQL
1. **Crear instancia RDS MySQL**
2. **Configurar grupo de seguridad**
3. **Obtener endpoint y credenciales**

### 2.3 Opción C: DigitalOcean Managed MySQL
1. **Crear Managed MySQL Database**
2. **Configurar firewall**
3. **Obtener credenciales**

## 🌐 Paso 3: Configuración en Render

### 3.1 Crear Cuenta
1. Ve a [render.com](https://render.com)
2. Regístrate con GitHub
3. Conecta tu repositorio

### 3.2 Desplegar Backend
1. **Crear Web Service**
   - Click en "New" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Nombre: `extraccion-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

2. **Configurar Variables de Entorno**
   - En "Environment Variables":
   ```
   NODE_ENV=production
   DB_HOST=tu-host-mysql-externo.com
   DB_USER=tu_usuario_mysql
   DB_PASSWORD=tu_password_mysql
   DB_NAME=extraccion_db
   DB_PORT=3306
   JWT_SECRET=tu_jwt_secret_muy_seguro_2024
   ```

### 3.3 Desplegar Frontend
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

## 🚀 Paso 4: Configuración de Base de Datos

### 4.1 Ejecutar Migraciones
```bash
# Conectar a tu base de datos MySQL externa
# Usar las credenciales de tu proveedor

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Crear datos iniciales
npx sequelize-cli db:seed:all
```

### 4.2 Configurar Sequelize para MySQL
En `backend/src/config/database.js`:
```javascript
module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
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

## 🔧 Paso 5: Configuración de Dominio

### 5.1 Dominio Personalizado (Opcional)
1. En el panel de Render
2. Ve a tu servicio → "Settings"
3. "Custom Domains"
4. Agrega tu dominio
5. Configura DNS según las instrucciones

### 5.2 SSL Automático
- Render proporciona SSL automático
- No necesitas configuración adicional

## 📊 Monitoreo y Logs

### 5.1 Ver Logs
```bash
# En el panel de Render
# Ve a tu servicio → "Logs"
# Puedes ver logs en tiempo real
```

### 5.2 Health Checks
```bash
# Verificar API
curl https://extraccion-backend.onrender.com/api/health

# Verificar frontend
curl https://extraccion-frontend.onrender.com
```

## 💰 Costos
- **Render**: $0-25/mes
- **PlanetScale MySQL**: $0-29/mes
- **AWS RDS MySQL**: $15-50/mes
- **DigitalOcean MySQL**: $15-30/mes

## ✅ Checklist
- [ ] Cuenta Render creada
- [ ] Base de datos MySQL externa configurada
- [ ] Repositorio conectado
- [ ] Backend desplegado
- [ ] Frontend desplegado
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Dominio configurado (opcional)
- [ ] SSL funcionando
- [ ] Aplicación funcionando

## 🆘 Solución de Problemas

### Problema: Base de datos no conecta
```bash
# Verificar variables de entorno
# En Render → Environment Variables

# Verificar conexión MySQL
mysql -h tu-host -u tu-usuario -p tu-base-datos

# Verificar configuración de Sequelize
# Asegurar que dialect sea 'mysql'
```

### Problema: Build falla
```bash
# Verificar logs de build
# En Render → Logs → Build Logs

# Verificar package.json
# Asegurar que buildCommand y startCommand sean correctos
```

### Problema: Frontend no carga
```bash
# Verificar build del frontend
# En Render → Logs → Build Logs

# Verificar REACT_APP_API_URL
# Asegurar que apunte al backend correcto
```

## 🎯 Recomendación de Base de Datos

### Para tu proyecto con MySQL, recomiendo:

1. **PlanetScale** - Muy fácil, compatible con MySQL
2. **AWS RDS** - Muy estable, pero más complejo
3. **DigitalOcean Managed MySQL** - Buen equilibrio
4. **Hostinger MySQL** - Económico, fácil

¿Te gustaría que te ayude a configurar alguna de estas opciones de base de datos específicamente? 