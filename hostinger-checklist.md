# ✅ Checklist Hostinger - Despliegue

## 📋 Preparación Local
- [ ] Ejecutar `./setup-hostinger.sh`
- [ ] Configurar `backend/.env` con credenciales reales
- [ ] Generar JWT_SECRET seguro
- [ ] Construir frontend: `cd frontend && npm run build`

## 🌐 En Panel de Hostinger
- [ ] Activar Node.js (Herramientas Avanzadas → Node.js)
- [ ] Crear base de datos MySQL
- [ ] Habilitar SSH (opcional)
- [ ] Configurar dominio y SSL

## 📤 Subir Archivos
- [ ] Usar File Manager o FTP
- [ ] Subir todo el proyecto a `public_html`
- [ ] Dar permisos de ejecución a scripts
- [ ] Verificar estructura de carpetas

## 🗄️ Configurar Base de Datos
- [ ] Ejecutar migraciones via SSH
- [ ] Cargar datos iniciales
- [ ] Probar conexión

## 🚀 Iniciar Aplicación
- [ ] Conectar via SSH
- [ ] Instalar PM2: `npm install -g pm2`
- [ ] Iniciar app: `pm2 start ecosystem.config.js`
- [ ] Guardar configuración: `pm2 save`

## 🔧 Variables de Entorno Necesarias
```env
NODE_ENV=production
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=tu_base_datos
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_muy_seguro
PORT=3000
CORS_ORIGIN=https://tu-dominio.com
``` 