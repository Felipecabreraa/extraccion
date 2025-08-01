# 🚂 Guía Completa: Railway desde Cero

## 📋 ¿Qué es Railway?

**Railway** es una plataforma moderna de despliegue que te permite:

- ✅ **Desplegar aplicaciones** desde Git automáticamente
- ✅ **Base de datos MySQL** incluida nativamente
- ✅ **SSL gratuito** automático
- ✅ **Escalado automático**
- ✅ **Muy fácil de usar**
- ✅ **Plan free generoso** (500 horas/mes)

### 🎯 **¿Para qué sirve Railway?**

1. **Despliegue Automático**: Cada vez que haces push a Git, se despliega automáticamente
2. **Base de Datos**: Proporciona MySQL, PostgreSQL, Redis, etc.
3. **Variables de Entorno**: Gestión segura de credenciales
4. **Logs en Tiempo Real**: Monitoreo completo de tu aplicación
5. **Dominios Personalizados**: Con SSL automático
6. **Escalado**: Aumenta recursos automáticamente según demanda

---

## 🛠️ Paso 1: Preparación del Proyecto

### 1.1 Instalar Railway CLI
```bash
# Instalar Railway CLI globalmente
npm install -g @railway/cli

# Verificar instalación
railway --version
```

### 1.2 Configurar tu Proyecto para Railway
```bash
# Navegar a tu proyecto
cd EXTRACCION

# Inicializar Railway en tu proyecto
railway init
```

### 1.3 Crear archivo de configuración
```bash
# Crear railway.json en la raíz del proyecto
touch railway.json
```

**Crear `railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 1.4 Configurar package.json del Backend
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

---

## 🌐 Paso 2: Crear Cuenta en Railway

### 2.1 Registrarse
1. Ve a [railway.app](https://railway.app)
2. Click en "Get Started"
3. Regístrate con GitHub (recomendado)
4. Autoriza Railway para acceder a tus repositorios

### 2.2 Login desde CLI
```bash
# Login desde la terminal
railway login

# Verificar que estás conectado
railway whoami
```

---

## 🚀 Paso 3: Desplegar tu Proyecto

### 3.1 Conectar Repositorio
```bash
# En tu proyecto
railway link

# Selecciona tu proyecto cuando te pregunte
# O crea uno nuevo si es la primera vez
```

### 3.2 Crear Base de Datos MySQL
```bash
# Crear base de datos MySQL
railway add

# Selecciona "MySQL" cuando te pregunte
# Railway creará automáticamente las variables de entorno
```

### 3.3 Configurar Variables de Entorno
```bash
# Ver variables actuales
railway variables

# Agregar variables manualmente
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=tu_jwt_secret_muy_seguro_2024
railway variables set REACT_APP_API_URL=https://tu-app.railway.app/api
```

### 3.4 Desplegar Aplicación
```bash
# Desplegar tu aplicación
railway up

# Ver logs en tiempo real
railway logs

# Ver estado del despliegue
railway status
```

---

## 🔧 Paso 4: Configuración Específica para tu Proyecto

### 4.1 Configurar Variables de Entorno
Railway automáticamente crea estas variables para MySQL:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`

**Verificar variables:**
```bash
# Ver todas las variables
railway variables

# Ver variables específicas
railway variables get DB_HOST
railway variables get DB_USER
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

### 4.3 Ejecutar Migraciones
```bash
# Conectar a la base de datos de Railway
railway connect

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Crear datos iniciales
npx sequelize-cli db:seed:all
```

---

## 📊 Paso 5: Monitoreo y Logs

### 5.1 Ver Logs
```bash
# Ver logs en tiempo real
railway logs

# Ver logs específicos
railway logs --service backend

# Ver logs de errores
railway logs | grep ERROR
```

### 5.2 Health Checks
```bash
# Verificar que tu aplicación esté funcionando
curl https://tu-app.railway.app/api/health

# Verificar base de datos
railway connect
mysql -u $DB_USER -p $DB_NAME
```

### 5.3 Ver Métricas
```bash
# Ver información del proyecto
railway status

# Ver uso de recursos
railway usage
```

---

## 🌐 Paso 6: Configuración de Dominio

### 6.1 Dominio Personalizado
```bash
# Ver dominio actual
railway domain

# Agregar dominio personalizado
railway domain add tu-dominio.com

# Verificar SSL
railway domain ls
```

### 6.2 Configurar DNS
1. Ve a tu proveedor de dominios
2. Agrega registro CNAME:
   - **Nombre**: `@` o `www`
   - **Valor**: `tu-app.railway.app`
3. Espera propagación (puede tomar hasta 24 horas)

---

## 💰 Costos y Planes

### Plan Free
- ✅ **500 horas/mes** de ejecución
- ✅ **1GB** de almacenamiento
- ✅ **MySQL** incluido
- ✅ **SSL** gratuito
- ✅ **Dominios** personalizados

### Plan Pro ($5/mes)
- ✅ **Horas ilimitadas**
- ✅ **5GB** de almacenamiento
- ✅ **Más recursos** de CPU/RAM
- ✅ **Soporte prioritario**

### Plan Team ($20/mes)
- ✅ **Todo del plan Pro**
- ✅ **Colaboración** en equipo
- ✅ **Múltiples proyectos**

---

## 🔧 Comandos Útiles

### Gestión del Proyecto
```bash
# Ver información del proyecto
railway status

# Ver variables de entorno
railway variables

# Ver logs
railway logs

# Reiniciar aplicación
railway restart
```

### Base de Datos
```bash
# Conectar a MySQL
railway connect

# Ver información de la base de datos
railway service

# Backup de base de datos
railway connect
mysqldump -u $DB_USER -p $DB_NAME > backup.sql
```

### Despliegue
```bash
# Desplegar cambios
railway up

# Ver despliegues recientes
railway deployments

# Revertir a versión anterior
railway rollback
```

---

## 🆘 Solución de Problemas

### Problema: Build falla
```bash
# Ver logs de build
railway logs

# Verificar railway.json
cat railway.json

# Verificar package.json
cat backend/package.json
```

### Problema: Base de datos no conecta
```bash
# Verificar variables de entorno
railway variables

# Verificar conexión
railway connect
mysql -u $DB_USER -p $DB_NAME

# Verificar configuración Sequelize
cat backend/src/config/database.js
```

### Problema: Aplicación no inicia
```bash
# Ver logs de inicio
railway logs

# Verificar comando de inicio
cat railway.json

# Reiniciar aplicación
railway restart
```

### Problema: Variables de entorno no se cargan
```bash
# Ver todas las variables
railway variables

# Agregar variable manualmente
railway variables set NOMBRE_VARIABLE=valor

# Verificar en la aplicación
railway logs
```

---

## ✅ Checklist de Despliegue

- [ ] Railway CLI instalado
- [ ] Cuenta Railway creada
- [ ] Proyecto inicializado con `railway init`
- [ ] Repositorio conectado con `railway link`
- [ ] Base de datos MySQL creada con `railway add`
- [ ] Variables de entorno configuradas
- [ ] Aplicación desplegada con `railway up`
- [ ] Migraciones ejecutadas
- [ ] Health check funcionando
- [ ] Dominio configurado (opcional)
- [ ] SSL funcionando
- [ ] Logs monitoreados

---

## 🎯 Ventajas de Railway para tu Proyecto

### ✅ **Por qué Railway es perfecto para tu proyecto:**

1. **MySQL Nativo**: No necesitas configurar base de datos externa
2. **Muy Fácil**: Configuración mínima, despliegue automático
3. **Económico**: Plan free generoso para empezar
4. **Escalable**: Crece con tu proyecto
5. **Confiable**: Muy estable y rápido

### 🚀 **Flujo de Trabajo Típico:**

```bash
# 1. Hacer cambios en tu código
git add .
git commit -m "Nuevas características"
git push origin main

# 2. Railway automáticamente despliega
# (No necesitas hacer nada más)

# 3. Verificar que todo funcione
railway logs
curl https://tu-app.railway.app/api/health
```

¿Te gustaría que te ayude a configurar Railway paso a paso con tu proyecto específico? 