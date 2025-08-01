# 🌐 Guía de Despliegue en Hostinger

## 📋 Requisitos Previos
- Cuenta en Hostinger con plan que incluya Node.js
- Dominio configurado
- Base de datos MySQL incluida

## 🛠️ Paso 1: Preparación Local

### 1.1 Preparar Archivos
```bash
# Ejecutar script de preparación
./preparar-hosting-simple-final.ps1

# O manualmente:
# 1. Construir frontend
cd frontend
npm run build

# 2. Preparar archivos para hosting
cd ..
mkdir hosting-ready
cp -r backend hosting-ready/
cp -r frontend/build hosting-ready/public
cp nginx.conf hosting-ready/
cp package.json hosting-ready/
```

### 1.2 Configurar Variables de Entorno
Crear `backend/.env`:
```env
NODE_ENV=production
DB_HOST=localhost
DB_USER=tu_usuario_mysql_hostinger
DB_PASSWORD=tu_password_mysql_hostinger
DB_NAME=tu_base_datos_hostinger
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_muy_seguro_y_largo_2024
PORT=3000
HOST=0.0.0.0
```

## 🌐 Paso 2: Configuración en Hostinger

### 2.1 Panel de Control
1. **Acceder al Panel de Control**
   - Inicia sesión en Hostinger
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
   - Selecciona tu dominio
   - Configura versión Node.js 18.x

### 2.2 Subir Archivos
```bash
# Usar FTP o File Manager
# Subir contenido de hosting-ready/ a la raíz del dominio
```

## 🚀 Paso 3: Configuración Final

### 3.1 Instalar Dependencias
```bash
# En el servidor via SSH o Terminal
npm install --production
```

### 3.2 Ejecutar Migraciones
```bash
# Crear tablas en la base de datos
cd backend
npx sequelize-cli db:migrate
```

### 3.3 Iniciar Aplicación
```bash
# Iniciar en modo producción
npm start
```

## 💰 Costos
- **Hostinger**: $3-10/mes
- **Dominio**: Incluido o $10-15/año
- **SSL**: Gratis
- **Total**: ~$3-25/mes

## ✅ Checklist
- [ ] Cuenta Hostinger activa
- [ ] Dominio configurado
- [ ] Base de datos MySQL creada
- [ ] Node.js activado
- [ ] Archivos subidos
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Aplicación funcionando 