# 🚀 Guía Completa: Despliegue en Hostinger

## 📋 Requisitos Previos

### 1. **Cuenta en Hostinger**
- [ ] Plan de hosting con soporte para Node.js
- [ ] Base de datos MySQL incluida
- [ ] Acceso SSH habilitado
- [ ] Dominio configurado

### 2. **Dominio y SSL**
- [ ] Dominio registrado en Hostinger
- [ ] Certificado SSL gratuito activado
- [ ] DNS configurado correctamente

## 🛠️ Paso 1: Preparación Local

### 1.1 **Clonar/Preparar el Proyecto**
```bash
# Si tienes el proyecto en Git
git clone tu-repositorio
cd extraccion

# O si ya tienes el proyecto local
cd /ruta/a/tu/proyecto
```

### 1.2 **Ejecutar Script de Configuración**
```bash
# Dar permisos de ejecución
chmod +x setup-hostinger.sh
chmod +x deploy.sh

# Ejecutar configuración
./setup-hostinger.sh
```

### 1.3 **Configurar Variables de Entorno**
Editar `backend/.env` con tus credenciales de Hostinger:

```env
# Configuración de Producción - Hostinger
NODE_ENV=production

# Base de Datos MySQL (Hostinger)
DB_HOST=localhost
DB_USER=tu_usuario_mysql_hostinger
DB_PASSWORD=tu_password_mysql_hostinger
DB_NAME=tu_base_datos_hostinger
DB_PORT=3306

# Configuración del Servidor
PORT=3000
HOST=0.0.0.0

# JWT (GENERAR UNO NUEVO Y SEGURO)
JWT_SECRET=tu_jwt_secret_muy_seguro_y_largo_para_produccion_2024
JWT_EXPIRES_IN=24h

# CORS (TU DOMINIO REAL)
CORS_ORIGIN=https://tu-dominio-real.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=tu_session_secret_muy_seguro_2024
```

## 🌐 Paso 2: Configuración en Hostinger

### 2.1 **Panel de Control de Hostinger**

1. **Acceder al Panel de Control**
   - Inicia sesión en tu cuenta de Hostinger
   - Ve a "Panel de Control" o "hPanel"

2. **Configurar Dominio**
   - Ve a "Dominios" → "Administrar"
   - Configura tu dominio principal
   - Activa SSL gratuito

3. **Crear Base de Datos MySQL**
   - Ve a "Bases de Datos" → "MySQL"
   - Crea una nueva base de datos
   - Anota: nombre, usuario, contraseña, host

4. **Activar Node.js**
   - Ve a "Herramientas Avanzadas" → "Node.js"
   - Activa Node.js para tu dominio
   - Selecciona versión 18.x o superior

### 2.2 **Acceso SSH (Opcional pero Recomendado)**

1. **Habilitar SSH**
   - Ve a "Herramientas Avanzadas" → "SSH"
   - Activa acceso SSH
   - Configura clave SSH si es necesario

2. **Conectar via SSH**
   ```bash
   ssh tu-usuario@tu-servidor.hostinger.com
   ```

## 📤 Paso 3: Subir Archivos

### 3.1 **Método 1: File Manager (Fácil)**

1. **Acceder al File Manager**
   - Ve a "Archivos" → "File Manager"
   - Navega a `public_html`

2. **Subir Archivos**
   - Sube todo el contenido del proyecto
   - Mantén la estructura de carpetas

### 3.2 **Método 2: FTP/SFTP (Recomendado)**

1. **Configurar Cliente FTP**
   - Usa FileZilla, WinSCP, o similar
   - Host: tu-servidor.hostinger.com
   - Usuario: tu-usuario-hostinger
   - Puerto: 21 (FTP) o 22 (SFTP)

2. **Subir Archivos**
   ```bash
   # Conectar via FTP
   ftp tu-servidor.hostinger.com
   
   # Subir archivos
   put -r * /public_html/
   ```

### 3.3 **Método 3: Git (Avanzado)**

1. **Configurar Git en Hostinger**
   ```bash
   # Conectar via SSH
   ssh tu-usuario@tu-servidor.hostinger.com
   
   # Clonar repositorio
   cd public_html
   git clone tu-repositorio-git .
   ```

## 🗄️ Paso 4: Configurar Base de Datos

### 4.1 **Crear Base de Datos**

1. **En el Panel de Hostinger**
   - Ve a "Bases de Datos" → "MySQL"
   - Crea nueva base de datos
   - Anota las credenciales

2. **Acceder a phpMyAdmin**
   - Ve a "Bases de Datos" → "phpMyAdmin"
   - Selecciona tu base de datos

### 4.2 **Ejecutar Migraciones**

1. **Conectar via SSH**
   ```bash
   ssh tu-usuario@tu-servidor.hostinger.com
   cd public_html
   ```

2. **Instalar Dependencias**
   ```bash
   npm install
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   ```

3. **Ejecutar Migraciones**
   ```bash
   cd backend
   npm run migrate
   # O si usas sequelize-cli
   npx sequelize-cli db:migrate
   ```

### 4.3 **Cargar Datos Iniciales**

```bash
# Ejecutar scripts de población de datos
node scripts/poblar_datos_iniciales.js
```

## 🚀 Paso 5: Desplegar Aplicación

### 5.1 **Instalar PM2**

```bash
# Conectar via SSH
ssh tu-usuario@tu-servidor.hostinger.com
cd public_html

# Instalar PM2 globalmente
npm install -g pm2
```

### 5.2 **Configurar Variables de Entorno**

```bash
# Editar archivo .env
nano backend/.env
# Ingresa las credenciales reales de Hostinger
```

### 5.3 **Construir Frontend**

```bash
# Construir aplicación React
cd frontend
npm run build
cd ..
```

### 5.4 **Iniciar Aplicación**

```bash
# Iniciar con PM2
pm2 start ecosystem.config.js

# Guardar configuración PM2
pm2 save

# Configurar inicio automático
pm2 startup
```

## 🔧 Paso 6: Configuración de Nginx/Apache

### 6.1 **Configuración Automática**

El script `setup-hostinger.sh` ya creó el archivo `.htaccess` necesario.

### 6.2 **Configuración Manual (si es necesario)**

Si necesitas configuración personalizada:

1. **Crear archivo `.htaccess`**
   ```apache
   RewriteEngine On
   
   # Redirigir HTTP a HTTPS
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   
   # Servir archivos estáticos
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ /index.html [L]
   
   # Headers de seguridad
   Header always set X-Frame-Options "SAMEORIGIN"
   Header always set X-XSS-Protection "1; mode=block"
   Header always set X-Content-Type-Options "nosniff"
   ```

## ✅ Paso 7: Verificación

### 7.1 **Verificar Funcionamiento**

1. **Frontend**
   - Visita: `https://tu-dominio.com`
   - Debe cargar la aplicación React

2. **Backend API**
   - Visita: `https://tu-dominio.com/api/health`
   - Debe responder con estado "healthy"

3. **Base de Datos**
   - Verifica conexión en la aplicación
   - Revisa logs: `pm2 logs extraccion-backend`

### 7.2 **Comandos de Verificación**

```bash
# Verificar estado de PM2
pm2 status

# Ver logs en tiempo real
pm2 logs extraccion-backend

# Monitoreo
pm2 monit

# Verificar puertos
netstat -tlnp | grep :3000
```

## 🔒 Paso 8: Seguridad

### 8.1 **Configuración SSL**

1. **En Panel de Hostinger**
   - Ve a "Dominios" → "SSL"
   - Activa certificado gratuito
   - Configura redirección HTTPS

### 8.2 **Headers de Seguridad**

El archivo `.htaccess` ya incluye headers básicos de seguridad.

### 8.3 **Backups Automáticos**

El script configuró backups automáticos diarios.

## 📊 Paso 9: Monitoreo

### 9.1 **Comandos Útiles**

```bash
# Ver estado de la aplicación
pm2 status

# Ver logs
pm2 logs extraccion-backend

# Reiniciar aplicación
pm2 restart extraccion-backend

# Ver uso de recursos
pm2 monit

# Backup manual
./backup-db.sh
```

### 9.2 **Logs Importantes**

- **Aplicación**: `pm2 logs extraccion-backend`
- **Nginx/Apache**: Panel de Hostinger → Logs
- **Base de datos**: phpMyAdmin → Logs

## 🆘 Solución de Problemas

### Problema 1: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Problema 2: "Port already in use"
```bash
# Verificar puertos
netstat -tlnp | grep :3000
# Cambiar puerto en .env si es necesario
```

### Problema 3: "Database connection failed"
- Verificar credenciales en `.env`
- Verificar que la base de datos existe
- Verificar permisos de usuario MySQL

### Problema 4: "Frontend not loading"
- Verificar que `npm run build` se ejecutó correctamente
- Verificar archivo `.htaccess`
- Verificar configuración de dominio

## 📞 Soporte

### Recursos de Ayuda
- **Hostinger Support**: Panel de control → Soporte
- **Documentación**: Esta guía
- **Logs**: `pm2 logs extraccion-backend`

### Comandos de Emergencia
```bash
# Reiniciar todo
pm2 restart all

# Ver logs de error
pm2 logs extraccion-backend --err

# Backup de emergencia
./backup-db.sh

# Reinstalar desde cero
rm -rf node_modules
npm install
pm2 restart extraccion-backend
```

## 🎉 ¡Listo!

Tu aplicación está desplegada en Hostinger. Recuerda:

- ✅ Monitorear logs regularmente
- ✅ Hacer backups periódicos
- ✅ Mantener actualizaciones de seguridad
- ✅ Verificar funcionamiento después de cambios

¡Tu sistema de extracción está listo para producción! 🚀 