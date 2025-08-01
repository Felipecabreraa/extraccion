# ✅ Checklist Render - Despliegue

## 📋 Preparación
- [ ] Cuenta en render.com (gratis)
- [ ] Repositorio en GitHub
- [ ] Base de datos MySQL externa (PlanetScale, Railway, etc.)

## 🌐 En Render Dashboard
- [ ] Crear nuevo servicio "Web Service"
- [ ] Conectar repositorio GitHub
- [ ] Configurar build settings
- [ ] Agregar variables de entorno

## 🗄️ Base de Datos Externa
- [ ] Crear cuenta en PlanetScale (gratis)
- [ ] Crear base de datos MySQL
- [ ] Obtener URL de conexión
- [ ] Configurar variables de entorno

## 🔧 Variables de Entorno en Render
```env
NODE_ENV=production
PORT=10000
DB_HOST=tu-host-mysql.planetscale.com
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_datos
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_muy_seguro
CORS_ORIGIN=https://tu-app.onrender.com
```

## 📤 Despliegue Automático
- [ ] Render detecta cambios en GitHub
- [ ] Construye automáticamente
- [ ] Despliega en 2-3 minutos
- [ ] URL automática: tu-app.onrender.com

## 🔗 Configurar Dominio Personalizado
- [ ] En Render Dashboard
- [ ] Agregar dominio personalizado
- [ ] Configurar DNS
- [ ] SSL automático incluido 