# Configuración de Ambientes

## 📋 Resumen

Este documento describe la configuración de los diferentes ambientes del proyecto: desarrollo, staging y producción.

## 🌍 Ambientes Disponibles

### 1. Desarrollo (Development)
- **Propósito**: Desarrollo local y testing
- **Base de Datos**: Local (MySQL)
- **API**: http://localhost:3001
- **Frontend**: http://localhost:3000
- **Logs**: Detallados y verbosos
- **Debug**: Habilitado

### 2. Staging
- **Propósito**: Testing de integración y QA
- **Base de Datos**: Servidor de staging
- **API**: https://api-staging.tudominio.com
- **Frontend**: https://staging.tudominio.com
- **Logs**: Moderados
- **Debug**: Limitado

### 3. Producción (Production)
- **Propósito**: Ambiente de usuarios finales
- **Base de Datos**: Servidor de producción
- **API**: https://api.tudominio.com
- **Frontend**: https://app.tudominio.com
- **Logs**: Solo errores y warnings
- **Debug**: Deshabilitado

## ⚙️ Configuración por Ambiente

### Variables de Entorno

#### Backend (.env)

```env
# ========================================
# CONFIGURACIÓN GENERAL
# ========================================
NODE_ENV=development
PORT=3001

# ========================================
# BASE DE DATOS
# ========================================
DB_HOST=localhost
DB_PORT=3306
DB_NAME=extraccion_db
DB_USER=root
DB_PASSWORD=tu_password
DB_DIALECT=mysql

# ========================================
# JWT (JSON Web Tokens)
# ========================================
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# ========================================
# CORS (Cross-Origin Resource Sharing)
# ========================================
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# ========================================
# RATE LIMITING
# ========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ========================================
# UPLOADS
# ========================================
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# ========================================
# LOGGING
# ========================================
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# ========================================
# SEGURIDAD
# ========================================
BCRYPT_ROUNDS=12
SESSION_SECRET=tu_session_secret
```

#### Frontend (.env)

```env
# ========================================
# API CONFIGURATION
# ========================================
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development

# ========================================
# FEATURES
# ========================================
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_MOCK_DATA=true

# ========================================
# EXTERNAL SERVICES
# ========================================
REACT_APP_GOOGLE_ANALYTICS_ID=
REACT_APP_SENTRY_DSN=

# ========================================
# BUILD CONFIGURATION
# ========================================
GENERATE_SOURCEMAP=true
```

### Configuraciones Específicas por Ambiente

#### Desarrollo

```env
# Backend - .env.development
NODE_ENV=development
DB_NAME=extraccion_dev
JWT_SECRET=dev_secret_key
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
```

```env
# Frontend - .env.development
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_MOCK_DATA=true
```

#### Staging

```env
# Backend - .env.staging
NODE_ENV=staging
DB_HOST=staging-db.tudominio.com
DB_NAME=extraccion_staging
JWT_SECRET=staging_secret_key
LOG_LEVEL=info
CORS_ORIGIN=https://staging.tudominio.com
```

```env
# Frontend - .env.staging
REACT_APP_API_URL=https://api-staging.tudominio.com/api
REACT_APP_ENV=staging
REACT_APP_ENABLE_DEBUG=false
REACT_APP_ENABLE_MOCK_DATA=false
```

#### Producción

```env
# Backend - .env.production
NODE_ENV=production
DB_HOST=production-db.tudominio.com
DB_NAME=extraccion_prod
JWT_SECRET=production_secret_key_super_seguro
LOG_LEVEL=error
CORS_ORIGIN=https://app.tudominio.com
```

```env
# Frontend - .env.production
REACT_APP_API_URL=https://api.tudominio.com/api
REACT_APP_ENV=production
REACT_APP_ENABLE_DEBUG=false
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_ENABLE_ANALYTICS=true
```

## 🚀 Scripts de Ejecución

### Package.json (Root)

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm start",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "start:backend": "cd backend && npm start",
    "start:frontend": "cd frontend && npm start",
    "build": "cd frontend && npm run build",
    "test": "concurrently \"npm run test:backend\" \"npm run test:frontend\"",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && npm test",
    "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install"
  }
}
```

### Backend Package.json

```json
{
  "scripts": {
    "dev": "NODE_ENV=development nodemon src/app.js",
    "start": "NODE_ENV=production node src/app.js",
    "start:staging": "NODE_ENV=staging node src/app.js",
    "test": "NODE_ENV=test jest",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:migrate:undo": "npx sequelize-cli db:migrate:undo",
    "db:seed": "npx sequelize-cli db:seed:all"
  }
}
```

### Frontend Package.json

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:staging": "REACT_APP_ENV=staging react-scripts build",
    "build:production": "REACT_APP_ENV=production react-scripts build",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false",
    "eject": "react-scripts eject"
  }
}
```

## 🔧 Configuración de Base de Datos

### Desarrollo
```sql
-- Crear base de datos de desarrollo
CREATE DATABASE extraccion_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario de desarrollo
CREATE USER 'extraccion_dev'@'localhost' IDENTIFIED BY 'dev_password';
GRANT ALL PRIVILEGES ON extraccion_dev.* TO 'extraccion_dev'@'localhost';
FLUSH PRIVILEGES;
```

### Staging
```sql
-- Crear base de datos de staging
CREATE DATABASE extraccion_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario de staging
CREATE USER 'extraccion_staging'@'%' IDENTIFIED BY 'staging_password';
GRANT ALL PRIVILEGES ON extraccion_staging.* TO 'extraccion_staging'@'%';
FLUSH PRIVILEGES;
```

### Producción
```sql
-- Crear base de datos de producción
CREATE DATABASE extraccion_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario de producción
CREATE USER 'extraccion_prod'@'%' IDENTIFIED BY 'production_password_super_seguro';
GRANT ALL PRIVILEGES ON extraccion_prod.* TO 'extraccion_prod'@'%';
FLUSH PRIVILEGES;
```

## 📁 Estructura de Archivos de Configuración

```
EXTRACCION/
├── backend/
│   ├── .env                    # Variables de entorno (no commitear)
│   ├── .env.development        # Configuración de desarrollo
│   ├── .env.staging           # Configuración de staging
│   ├── .env.production        # Configuración de producción
│   ├── .env.test              # Configuración de tests
│   └── src/
│       └── config/
│           ├── database.js     # Configuración de BD
│           ├── auth.js         # Configuración de autenticación
│           └── app.js          # Configuración general
├── frontend/
│   ├── .env                    # Variables de entorno (no commitear)
│   ├── .env.development        # Configuración de desarrollo
│   ├── .env.staging           # Configuración de staging
│   ├── .env.production        # Configuración de producción
│   └── src/
│       └── config/
│           ├── api.js          # Configuración de API
│           └── app.js          # Configuración general
└── scripts/
    ├── setup-env.sh           # Script para configurar ambientes
    └── deploy.sh              # Script de despliegue
```

## 🔐 Seguridad por Ambiente

### Desarrollo
- **JWT Secret**: Clave simple para desarrollo
- **CORS**: Permitir localhost
- **Logs**: Detallados para debugging
- **Debug**: Habilitado

### Staging
- **JWT Secret**: Clave moderadamente segura
- **CORS**: Dominio específico de staging
- **Logs**: Información relevante
- **Debug**: Limitado

### Producción
- **JWT Secret**: Clave altamente segura y compleja
- **CORS**: Dominio específico de producción
- **Logs**: Solo errores críticos
- **Debug**: Completamente deshabilitado
- **HTTPS**: Obligatorio
- **Rate Limiting**: Estricto

## 📊 Monitoreo y Logs

### Configuración de Logs

```javascript
// backend/src/config/logger.js
const winston = require('winston');

const logLevels = {
  development: 'debug',
  staging: 'info',
  production: 'error',
  test: 'error'
};

const logger = winston.createLogger({
  level: logLevels[process.env.NODE_ENV] || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Métricas de Monitoreo

```javascript
// backend/src/middlewares/metrics.js
const prometheus = require('prom-client');

const httpRequestDurationMicroseconds = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

module.exports = { httpRequestDurationMicroseconds, httpRequestsTotal };
```

## 🚀 Despliegue

### Script de Despliegue

```bash
#!/bin/bash
# scripts/deploy.sh

ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
    echo "Uso: ./deploy.sh <environment> <version>"
    echo "Ejemplo: ./deploy.sh staging v1.2.0"
    exit 1
fi

echo "🚀 Desplegando versión $VERSION en ambiente $ENVIRONMENT..."

# Validar ambiente
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo "❌ Ambiente inválido. Use: development, staging, o production"
    exit 1
fi

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm run test

# Build del frontend
echo "🔨 Construyendo frontend..."
cd frontend
npm run build:$ENVIRONMENT
cd ..

# Desplegar según ambiente
case $ENVIRONMENT in
    "development")
        echo "🔄 Reiniciando servicios de desarrollo..."
        pm2 restart all
        ;;
    "staging")
        echo "🚀 Desplegando a staging..."
        # Comandos específicos para staging
        ;;
    "production")
        echo "🚀 Desplegando a producción..."
        # Comandos específicos para producción
        ;;
esac

echo "✅ Despliegue completado!"
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Error de Conexión a Base de Datos
```bash
# Verificar configuración
echo $NODE_ENV
echo $DB_HOST
echo $DB_NAME

# Probar conexión
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1;"
```

#### Error de Variables de Entorno
```bash
# Verificar archivo .env
cat .env

# Verificar que las variables estén cargadas
node -e "console.log(process.env.NODE_ENV)"
```

#### Error de CORS
```bash
# Verificar configuración de CORS
echo $CORS_ORIGIN

# Verificar que el frontend esté en el origen permitido
```

### Logs de Debug

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Ver logs de errores
tail -f logs/error.log

# Buscar errores específicos
grep "ERROR" logs/app.log
```

## 📚 Recursos Adicionales

- [Node.js Environment Variables](https://nodejs.org/api/process.html#processenv)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Sequelize Configuration](https://sequelize.org/master/manual/migrations.html)
- [Winston Logging](https://github.com/winstonjs/winston)
- [PM2 Process Manager](https://pm2.keymetrics.io/) 