# ⚡ Configuración Backend para Render

## 📋 Configuración en Render Dashboard

### 1. **Crear Nuevo Servicio**
- Tipo: Web Service
- Nombre: extraccion-backend
- Repositorio: Conectar tu GitHub repo
- Branch: main

### 2. **Configurar Build Settings**
```bash
# Build Command
npm install && cd backend && npm install && cd ../frontend && npm install && npm run build

# Start Command
cd backend && npm start
```

### 3. **Variables de Entorno**
```env
NODE_ENV=production
PORT=10000
DB_HOST=tu-host-mysql.planetscale.com
DB_USER=tu_usuario_planetscale
DB_PASSWORD=tu_password_planetscale
DB_NAME=tu_base_datos_planetscale
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_muy_seguro_para_produccion_2024
CORS_ORIGIN=https://tu-usuario.github.io
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
BCRYPT_ROUNDS=12
```

### 4. **Configurar Health Check**
- Path: `/api/health`
- Timeout: 100 seconds

## 🗄️ Base de Datos PlanetScale

### 1. **Crear Cuenta**
- Ir a planetscale.com
- Crear cuenta gratuita
- Crear nueva base de datos

### 2. **Obtener Credenciales**
```env
DB_HOST=aws.connect.psdb.cloud
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_base_datos
DB_PORT=3306
```

### 3. **Configurar SSL**
- PlanetScale requiere SSL
- Agregar en backend: `ssl: true`

## 🔧 Actualizar Backend

### 1. **Configurar CORS**
```javascript
// En backend/src/app.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://tu-usuario.github.io',
  credentials: true
}));
```

### 2. **Configurar Base de Datos**
```javascript
// En backend/src/config/database.js
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  ssl: true, // Para PlanetScale
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
```

## 📤 Despliegue Automático

### 1. **Push a GitHub**
```bash
git add .
git commit -m "Configurar para Render + GitHub Pages"
git push origin main
```

### 2. **Render Detecta Cambios**
- Render detecta automáticamente el push
- Construye el proyecto
- Despliega en 2-3 minutos

### 3. **URL Final**
- Backend: https://tu-backend.onrender.com
- Frontend: https://tu-usuario.github.io/tu-repo

## 🔗 Configurar Dominio Personalizado

### 1. **Frontend (GitHub Pages)**
- Settings → Pages
- Agregar dominio personalizado
- Configurar DNS

### 2. **Backend (Render)**
- Dashboard → Settings
- Agregar dominio personalizado
- Configurar DNS 