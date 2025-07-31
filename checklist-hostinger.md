# ✅ Checklist Completo: Despliegue en Hostinger

## 📋 Preparación Local

### ✅ Configuración del Proyecto
- [ ] Ejecutar `./setup-hostinger.sh`
- [ ] Verificar que se crearon todos los archivos de configuración
- [ ] Configurar `backend/.env` con credenciales reales
- [ ] Generar JWT_SECRET seguro y único
- [ ] Configurar CORS_ORIGIN con dominio real

### ✅ Archivos Creados
- [ ] `ecosystem.config.js` (configuración PM2)
- [ ] `deploy.sh` (script de despliegue)
- [ ] `nginx.conf` (configuración Nginx)
- [ ] `backend/env.production.example` (variables de entorno)
- [ ] `.htaccess` (redirecciones y seguridad)
- [ ] `start-app.sh` (script de inicio)
- [ ] `backup-db.sh` (script de backup)

## 🌐 Configuración en Hostinger

### ✅ Cuenta y Dominio
- [ ] Tener cuenta activa en Hostinger
- [ ] Dominio registrado y configurado
- [ ] SSL gratuito activado
- [ ] DNS configurado correctamente

### ✅ Panel de Control
- [ ] Acceder al hPanel de Hostinger
- [ ] Verificar plan de hosting (debe incluir Node.js)
- [ ] Activar Node.js en "Herramientas Avanzadas"
- [ ] Seleccionar versión Node.js 18.x o superior

### ✅ Base de Datos MySQL
- [ ] Crear base de datos MySQL
- [ ] Anotar nombre de la base de datos
- [ ] Anotar usuario MySQL
- [ ] Anotar contraseña MySQL
- [ ] Anotar host MySQL (generalmente localhost)
- [ ] Verificar acceso a phpMyAdmin

### ✅ Acceso SSH (Opcional)
- [ ] Habilitar SSH en "Herramientas Avanzadas"
- [ ] Configurar clave SSH si es necesario
- [ ] Probar conexión SSH

## 📤 Subida de Archivos

### ✅ Método de Subida
- [ ] Elegir método: File Manager, FTP, o Git
- [ ] Subir todo el proyecto a `public_html`
- [ ] Mantener estructura de carpetas
- [ ] Verificar que todos los archivos se subieron

### ✅ Permisos de Archivos
- [ ] Dar permisos de ejecución a scripts
- [ ] Verificar permisos de carpetas de logs
- [ ] Verificar permisos de carpeta uploads

## 🗄️ Configuración de Base de Datos

### ✅ Crear Base de Datos
- [ ] Crear base de datos en phpMyAdmin
- [ ] Verificar que la base de datos existe
- [ ] Verificar permisos de usuario

### ✅ Ejecutar Migraciones
- [ ] Conectar via SSH o Terminal
- [ ] Navegar a directorio del proyecto
- [ ] Instalar dependencias: `npm install`
- [ ] Instalar dependencias backend: `cd backend && npm install`
- [ ] Ejecutar migraciones: `npm run migrate` o `npx sequelize-cli db:migrate`
- [ ] Verificar que las tablas se crearon

### ✅ Datos Iniciales
- [ ] Ejecutar scripts de población de datos
- [ ] Verificar que los datos se cargaron
- [ ] Probar conexión desde la aplicación

## 🚀 Despliegue de la Aplicación

### ✅ Instalación de PM2
- [ ] Instalar PM2 globalmente: `npm install -g pm2`
- [ ] Verificar instalación: `pm2 --version`

### ✅ Configuración de Variables
- [ ] Editar `backend/.env` con credenciales reales
- [ ] Verificar que todas las variables están configuradas
- [ ] Probar conexión a base de datos

### ✅ Construcción del Frontend
- [ ] Instalar dependencias frontend: `cd frontend && npm install`
- [ ] Construir aplicación: `npm run build`
- [ ] Verificar que se creó la carpeta `build`

### ✅ Inicio de la Aplicación
- [ ] Iniciar con PM2: `pm2 start ecosystem.config.js`
- [ ] Guardar configuración: `pm2 save`
- [ ] Configurar inicio automático: `pm2 startup`
- [ ] Verificar estado: `pm2 status`

## 🔧 Configuración del Servidor Web

### ✅ Archivo .htaccess
- [ ] Verificar que el archivo `.htaccess` está en la raíz
- [ ] Probar redirección HTTP a HTTPS
- [ ] Probar servido de archivos estáticos

### ✅ Configuración SSL
- [ ] Verificar que SSL está activo
- [ ] Probar acceso HTTPS
- [ ] Verificar certificado SSL

## ✅ Verificación Final

### ✅ Frontend
- [ ] Visitar `https://tu-dominio.com`
- [ ] Verificar que la aplicación React carga
- [ ] Probar navegación entre páginas
- [ ] Verificar que los estilos se cargan correctamente

### ✅ Backend API
- [ ] Visitar `https://tu-dominio.com/api/health`
- [ ] Verificar respuesta "healthy"
- [ ] Probar endpoints principales
- [ ] Verificar autenticación JWT

### ✅ Base de Datos
- [ ] Probar operaciones CRUD
- [ ] Verificar conexión desde aplicación
- [ ] Probar carga de datos
- [ ] Verificar migraciones ejecutadas

### ✅ Funcionalidades Específicas
- [ ] Probar login/logout
- [ ] Probar carga de archivos
- [ ] Probar generación de reportes
- [ ] Probar dashboard y gráficos
- [ ] Probar todas las funcionalidades principales

## 📊 Monitoreo y Mantenimiento

### ✅ Logs y Monitoreo
- [ ] Configurar monitoreo: `pm2 monit`
- [ ] Verificar logs: `pm2 logs extraccion-backend`
- [ ] Configurar alertas si es posible

### ✅ Backups
- [ ] Probar script de backup: `./backup-db.sh`
- [ ] Verificar que los backups se crean
- [ ] Configurar backups automáticos

### ✅ Seguridad
- [ ] Verificar headers de seguridad
- [ ] Probar protección CSRF
- [ ] Verificar rate limiting
- [ ] Probar validación de inputs

## 🆘 Comandos de Verificación

### ✅ Estado del Sistema
```bash
# Verificar estado PM2
pm2 status

# Ver logs en tiempo real
pm2 logs extraccion-backend

# Ver uso de recursos
pm2 monit

# Verificar puertos
netstat -tlnp | grep :3000

# Verificar procesos
ps aux | grep node
```

### ✅ Verificación de Archivos
```bash
# Verificar estructura
ls -la
ls -la backend/
ls -la frontend/build/

# Verificar archivos de configuración
cat backend/.env
cat ecosystem.config.js
```

### ✅ Verificación de Base de Datos
```bash
# Probar conexión MySQL
mysql -u usuario -p base_datos

# Verificar tablas
SHOW TABLES;

# Verificar datos
SELECT COUNT(*) FROM usuarios;
```

## 🎯 Checklist de Funcionalidades

### ✅ Autenticación
- [ ] Login de usuarios
- [ ] Logout
- [ ] Protección de rutas
- [ ] Renovación de tokens

### ✅ Gestión de Datos
- [ ] CRUD de barredores
- [ ] CRUD de máquinas
- [ ] CRUD de operadores
- [ ] CRUD de sectores
- [ ] CRUD de zonas

### ✅ Reportes y Dashboard
- [ ] Dashboard principal
- [ ] Gráficos y estadísticas
- [ ] Generación de reportes
- [ ] Exportación de datos

### ✅ Carga de Archivos
- [ ] Subida de archivos Excel
- [ ] Procesamiento de datos
- [ ] Validación de archivos
- [ ] Manejo de errores

## 🚨 Problemas Comunes

### ✅ Solución de Errores
- [ ] Error "Cannot find module" → Reinstalar dependencias
- [ ] Error "Port already in use" → Cambiar puerto
- [ ] Error "Database connection failed" → Verificar credenciales
- [ ] Error "Frontend not loading" → Verificar build y .htaccess

### ✅ Comandos de Emergencia
```bash
# Reiniciar aplicación
pm2 restart extraccion-backend

# Ver logs de error
pm2 logs extraccion-backend --err

# Backup de emergencia
./backup-db.sh

# Reinstalar desde cero
rm -rf node_modules
npm install
pm2 restart extraccion-backend
```

## 🎉 ¡Despliegue Completado!

### ✅ Documentación
- [ ] Guardar credenciales de forma segura
- [ ] Documentar configuración específica
- [ ] Crear guía de mantenimiento
- [ ] Configurar acceso para el equipo

### ✅ Entrenamiento
- [ ] Entrenar usuarios finales
- [ ] Documentar procedimientos
- [ ] Configurar soporte técnico
- [ ] Establecer protocolos de mantenimiento

---

**✅ ¡Tu sistema está listo para producción! 🚀**

Recuerda:
- Monitorear regularmente
- Hacer backups periódicos
- Mantener actualizaciones de seguridad
- Documentar cambios importantes 