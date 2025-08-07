# 🚀 Guía Completa de Variables de Entorno

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Ambientes Disponibles](#ambientes-disponibles)
3. [Configuración Automática](#configuración-automática)
4. [Variables por Ambiente](#variables-por-ambiente)
5. [Configuración Manual](#configuración-manual)
6. [Seguridad](#seguridad)
7. [Despliegue](#despliegue)
8. [Solución de Problemas](#solución-de-problemas)

## 📖 Descripción General

Este proyecto utiliza variables de entorno para configurar diferentes aspectos del sistema según el ambiente de ejecución (desarrollo, staging, producción).

### Estructura de Archivos
```
extraccion/
├── backend/
│   ├── .env                    # Configuración actual del backend
│   ├── .env.development        # Desarrollo local
│   ├── .env.staging           # Ambiente de pruebas
│   ├── .env.production        # Producción
│   └── env.*.example          # Ejemplos de configuración
├── frontend/
│   ├── .env                   # Configuración actual del frontend
│   ├── .env.development       # Desarrollo local
│   ├── .env.staging          # Ambiente de pruebas
│   ├── .env.production       # Producción
│   └── env.*.example         # Ejemplos de configuración
└── .env.global               # Configuración global del proyecto
```

## 🎯 Ambientes Disponibles

### 1. Development (Desarrollo)
- **Propósito**: Desarrollo local
- **Base de datos**: Local (localhost)
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### 2. Staging (Pruebas)
- **Propósito**: Pruebas antes de producción
- **Base de datos**: Copia de producción
- **Frontend**: https://frontend-staging.vercel.app
- **Backend**: https://backend-staging.up.railway.app

### 3. Production (Producción)
- **Propósito**: Ambiente final para usuarios
- **Base de datos**: Producción real
- **Frontend**: https://frontend-production.vercel.app
- **Backend**: https://backend-production.up.railway.app

## ⚡ Configuración Automática

### Ejecutar el Configurador
```bash
node configurar-variables-entorno.js
```

Este script:
- ✅ Crea todos los archivos de configuración
- ✅ Genera ejemplos seguros
- ✅ Configura valores por defecto
- ✅ Proporciona instrucciones claras

### Configuración Rápida
```bash
# 1. Ejecutar el configurador
node configurar-variables-entorno.js

# 2. Revisar archivos generados
ls -la backend/.env*
ls -la frontend/.env*

# 3. Modificar valores según necesidades
nano backend/.env
nano frontend/.env
```

## 🔧 Variables por Ambiente

### Backend Variables

#### Development
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=extraccion_dev
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=dev_secret_key_2024
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

#### Staging
```env
NODE_ENV=staging
PORT=3001
DB_HOST=trn.cl
DB_PORT=3306
DB_NAME=extraccion_staging
DB_USER=extraccion_user
DB_PASSWORD=Extraccion2024!
JWT_SECRET=staging_secret_key_2024
CORS_ORIGIN=https://frontend-staging.vercel.app
LOG_LEVEL=info
```

#### Production
```env
NODE_ENV=production
PORT=3000
DB_HOST=trn.cl
DB_PORT=3306
DB_NAME=trn_extraccion
DB_USER=trn_felipe
DB_PASSWORD=RioNegro2025@
JWT_SECRET=extraccion_jwt_secret_2025_railway_production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://frontend-1m7t9y5hl-felipe-lagos-projects-f57024eb.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
HELMET_ENABLED=true
COMPRESSION_ENABLED=true
```

### Frontend Variables

#### Development
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0-dev
```

#### Staging
```env
REACT_APP_API_URL=https://backend-staging.up.railway.app/api
REACT_APP_ENV=staging
REACT_APP_VERSION=1.0.0-staging
```

#### Production
```env
REACT_APP_API_URL=https://backend-production.up.railway.app/api
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

## 🛠️ Configuración Manual

### 1. Cambiar Ambiente de Backend
```bash
# Cambiar a producción
cp backend/.env.production backend/.env

# Cambiar a staging
cp backend/.env.staging backend/.env

# Cambiar a desarrollo
cp backend/.env.development backend/.env
```

### 2. Cambiar Ambiente de Frontend
```bash
# Cambiar a producción
cp frontend/.env.production frontend/.env

# Cambiar a staging
cp frontend/.env.staging frontend/.env

# Cambiar a desarrollo
cp frontend/.env.development frontend/.env
```

### 3. Crear Script de Cambio Rápido
```bash
# Crear script para cambiar ambiente
cat > cambiar-ambiente.sh << 'EOF'
#!/bin/bash
AMBIENTE=$1

if [ -z "$AMBIENTE" ]; then
    echo "Uso: ./cambiar-ambiente.sh [development|staging|production]"
    exit 1
fi

echo "Cambiando a ambiente: $AMBIENTE"

# Backend
cp backend/.env.$AMBIENTE backend/.env
echo "✅ Backend configurado para $AMBIENTE"

# Frontend
cp frontend/.env.$AMBIENTE frontend/.env
echo "✅ Frontend configurado para $AMBIENTE"

echo "🎉 Ambiente cambiado exitosamente"
EOF

chmod +x cambiar-ambiente.sh
```

## 🔒 Seguridad

### Archivos Sensibles
Los siguientes archivos contienen información sensible y NO deben subirse al repositorio:
- `backend/.env*`
- `frontend/.env*`
- `.env.global`

### Verificar .gitignore
Asegúrate de que tu `.gitignore` incluya:
```gitignore
# Variables de entorno
.env
.env.local
.env.development
.env.staging
.env.production
.env.global
```

### Generar Secretos Seguros
```bash
# Generar JWT secret seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generar password seguro
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🚀 Despliegue

### Railway (Backend)
```bash
# Configurar variables en Railway
railway variables set NODE_ENV=production
railway variables set DB_HOST=trn.cl
railway variables set DB_USER=trn_felipe
railway variables set DB_PASSWORD=RioNegro2025@
railway variables set DB_NAME=trn_extraccion
railway variables set JWT_SECRET=tu_jwt_secret_aqui
```

### Vercel (Frontend)
```bash
# Configurar variables en Vercel
vercel env add REACT_APP_API_URL
vercel env add REACT_APP_ENV
vercel env add REACT_APP_VERSION
```

### Docker
```bash
# Usar archivo .env con Docker
docker run --env-file .env tu-imagen
```

## 🔧 Solución de Problemas

### Problema: Variables no se cargan
```bash
# Verificar que el archivo .env existe
ls -la backend/.env
ls -la frontend/.env

# Verificar sintaxis
cat backend/.env | grep -v "^#" | grep -v "^$"
```

### Problema: CORS errors
```bash
# Verificar CORS_ORIGIN
echo $CORS_ORIGIN

# Actualizar CORS en backend
sed -i 's/CORS_ORIGIN=.*/CORS_ORIGIN=https://tu-dominio.com/' backend/.env
```

### Problema: Base de datos no conecta
```bash
# Verificar variables de BD
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_NAME: $DB_NAME"
echo "DB_USER: $DB_USER"

# Probar conexión
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT 1"
```

### Problema: JWT errors
```bash
# Verificar JWT_SECRET
echo $JWT_SECRET

# Generar nuevo JWT_SECRET
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo "JWT_SECRET=$JWT_SECRET" >> backend/.env
```

## 📝 Comandos Útiles

### Verificar Configuración Actual
```bash
# Backend
echo "=== BACKEND ==="
cat backend/.env | grep -v "^#" | grep -v "^$"

# Frontend
echo "=== FRONTEND ==="
cat frontend/.env | grep -v "^#" | grep -v "^$"
```

### Comparar Ambientes
```bash
# Comparar development vs production
diff backend/.env.development backend/.env.production
diff frontend/.env.development frontend/.env.production
```

### Backup de Configuración
```bash
# Crear backup
cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S)
cp frontend/.env frontend/.env.backup.$(date +%Y%m%d_%H%M%S)
```

## 🎯 Mejores Prácticas

1. **Nunca** subas archivos `.env` al repositorio
2. **Siempre** usa ejemplos (`.env.example`) para documentar variables
3. **Valida** las variables al iniciar la aplicación
4. **Usa** secretos diferentes para cada ambiente
5. **Rota** los secretos regularmente
6. **Monitorea** el uso de variables sensibles
7. **Documenta** cambios en la configuración

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs de la aplicación
2. Verifica que las variables estén correctamente definidas
3. Confirma que los archivos `.env` existen y son legibles
4. Prueba la conexión a la base de datos
5. Verifica la configuración de CORS

---

**Última actualización**: $(date)
**Versión**: 1.0.0 