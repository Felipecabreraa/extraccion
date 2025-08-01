# 🚀 Guía de Despliegue en Heroku

## 📋 ¿Qué es Heroku?
Heroku es una plataforma PaaS que ofrece:
- ✅ **Despliegue automático** desde Git
- ✅ **SSL gratuito** automático
- ✅ **Base de datos PostgreSQL** incluida
- ✅ **Escalado fácil**
- ✅ **Muy estable y confiable**

## 🛠️ Paso 1: Preparación del Proyecto

### 1.1 Instalar Heroku CLI
```bash
# Windows (PowerShell)
winget install --id=Heroku.HerokuCLI

# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### 1.2 Configurar para Heroku
```bash
# Crear Procfile en la raíz
echo "web: cd backend && npm start" > Procfile

# Crear app.json
touch app.json
```

**Crear `app.json`:**
```json
{
  "name": "extraccion-app",
  "description": "Sistema de Extracción",
  "repository": "https://github.com/tu-usuario/EXTRACCION",
  "logo": "https://node-js-sample.herokuapp.com/node.png",
  "keywords": ["node", "express", "react", "mysql"],
  "env": {
    "NODE_ENV": {
      "description": "Environment",
      "value": "production"
    },
    "JWT_SECRET": {
      "description": "JWT Secret",
      "generator": "secret"
    }
  },
  "addons": [
    {
      "plan": "heroku-postgresql:mini"
    }
  ],
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ]
}
```

### 1.3 Configurar package.json del Backend
```json
{
  "scripts": {
    "start": "node src/app.js",
    "heroku-postbuild": "cd frontend && npm install && npm run build"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### 1.4 Configurar Variables de Entorno
Crear `backend/.env`:
```env
NODE_ENV=production
DB_HOST=${DATABASE_URL}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_PORT=5432
JWT_SECRET=${JWT_SECRET}
PORT=${PORT}
```

## 🌐 Paso 2: Configuración en Heroku

### 2.1 Crear Cuenta y App
```bash
# Login a Heroku
heroku login

# Crear aplicación
heroku create extraccion-app

# Verificar remoto
git remote -v
```

### 2.2 Configurar Base de Datos
```bash
# Agregar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Ver información de la base de datos
heroku config | grep DATABASE_URL
```

### 2.3 Configurar Variables de Entorno
```bash
# Configurar variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=tu_jwt_secret_muy_seguro_2024
heroku config:set REACT_APP_API_URL=https://extraccion-app.herokuapp.com/api

# Ver todas las variables
heroku config
```

## 🚀 Paso 3: Despliegue

### 3.1 Desplegar Aplicación
```bash
# Hacer commit de cambios
git add .
git commit -m "Configuración para Heroku"

# Desplegar
git push heroku main

# Ver logs
heroku logs --tail
```

### 3.2 Ejecutar Migraciones
```bash
# Ejecutar migraciones en Heroku
heroku run npx sequelize-cli db:migrate

# Crear datos iniciales
heroku run npx sequelize-cli db:seed:all
```

### 3.3 Verificar Despliegue
```bash
# Abrir aplicación
heroku open

# Verificar logs
heroku logs --tail

# Verificar estado
heroku ps
```

## 🔧 Paso 4: Configuración de Base de Datos

### 4.1 Configurar Sequelize para PostgreSQL
En `backend/src/config/database.js`:
```javascript
const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  // Heroku PostgreSQL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  // Desarrollo local
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false
    }
  );
}

module.exports = sequelize;
```

### 4.2 Configurar Migraciones
```bash
# Crear archivo .sequelizerc en la raíz
echo "const path = require('path');

module.exports = {
  'config': path.resolve('backend/src/config', 'database.js'),
  'models-path': path.resolve('backend/src', 'models'),
  'seeders-path': path.resolve('backend', 'seeders'),
  'migrations-path': path.resolve('backend', 'migrations')
};" > .sequelizerc
```

## 📊 Monitoreo y Logs

### 4.1 Ver Logs
```bash
# Ver logs en tiempo real
heroku logs --tail

# Ver logs específicos
heroku logs --source app
heroku logs --source heroku
```

### 4.2 Health Checks
```bash
# Verificar API
curl https://extraccion-app.herokuapp.com/api/health

# Verificar aplicación
curl https://extraccion-app.herokuapp.com
```

### 4.3 Monitoreo
```bash
# Ver métricas
heroku addons:open papertrail

# Ver base de datos
heroku pg:info
heroku pg:psql
```

## 💰 Costos
- **Plan Free**: $0/mes (descontinuado)
- **Plan Basic**: $7/mes
- **Plan Standard**: $25/mes
- **PostgreSQL Mini**: $5/mes
- **PostgreSQL Basic**: $9/mes

## ✅ Checklist
- [ ] Heroku CLI instalado
- [ ] Cuenta Heroku creada
- [ ] Aplicación creada
- [ ] PostgreSQL agregado
- [ ] Variables de entorno configuradas
- [ ] Código desplegado
- [ ] Migraciones ejecutadas
- [ ] Aplicación funcionando
- [ ] SSL funcionando
- [ ] Logs monitoreados

## 🆘 Solución de Problemas

### Problema: Build falla
```bash
# Ver logs de build
heroku logs --tail

# Verificar Procfile
cat Procfile

# Verificar package.json
cat package.json
```

### Problema: Base de datos no conecta
```bash
# Verificar variables de entorno
heroku config

# Verificar conexión a PostgreSQL
heroku pg:psql

# Verificar migraciones
heroku run npx sequelize-cli db:migrate:status
```

### Problema: Aplicación no inicia
```bash
# Ver logs de inicio
heroku logs --tail

# Verificar puerto
heroku config:get PORT

# Reiniciar aplicación
heroku restart
```

### Problema: Frontend no carga
```bash
# Verificar build
heroku logs --tail

# Verificar variables de entorno
heroku config:get REACT_APP_API_URL

# Reconstruir
git commit --allow-empty -m "Trigger rebuild"
git push heroku main
```

## 🔧 Comandos Útiles

### Gestión de la Aplicación
```bash
# Ver información
heroku info

# Ver variables de entorno
heroku config

# Reiniciar aplicación
heroku restart

# Ver dynos activos
heroku ps
```

### Base de Datos
```bash
# Ver información de PostgreSQL
heroku pg:info

# Conectar a PostgreSQL
heroku pg:psql

# Backup de base de datos
heroku pg:backups:capture

# Restaurar backup
heroku pg:backups:restore
```

### Logs y Monitoreo
```bash
# Ver logs en tiempo real
heroku logs --tail

# Ver logs de errores
heroku logs --source app --tail | grep ERROR

# Ver métricas
heroku addons:open papertrail
``` 