# Sistema de Extracción - Frontend y Backend

Sistema completo de gestión de extracción con interfaz web moderna y API REST robusta.

## 🚀 Características

- **Frontend**: React con Material-UI y Tailwind CSS
- **Backend**: Node.js con Express y Sequelize
- **Base de Datos**: MySQL
- **Autenticación**: JWT
- **Gráficos**: Chart.js y React-Chartjs-2
- **Responsive**: Diseño adaptativo para móviles y desktop

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd EXTRACCION
```

### 2. Instalar dependencias

```bash
# Instalar todas las dependencias (root, backend y frontend)
npm run install:all

# O instalar por separado:
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configurar variables de entorno

#### Backend (.env)
```bash
# Copiar el archivo de ejemplo
cp backend/env.development.example backend/.env

# Editar las variables según tu configuración
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=extraccion_db
JWT_SECRET=tu_jwt_secret
PORT=3001
```

#### Frontend (.env)
```bash
# Crear archivo .env en el directorio frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
```

### 4. Configurar base de datos

```bash
# Crear la base de datos
mysql -u root -p
CREATE DATABASE extraccion_db;
```

```bash
# Ejecutar migraciones
cd backend
npx sequelize-cli db:migrate
```

### 5. Ejecutar el proyecto

```bash
# Desarrollo (ambos servicios)
npm run dev

# O por separado:
npm run dev:backend  # Puerto 3001
npm run dev:frontend # Puerto 3000
```

## 🌍 Configuración de Ambientes

### Desarrollo
```bash
# Backend
NODE_ENV=development npm run dev:backend

# Frontend
REACT_APP_ENV=development npm run dev:frontend
```

### Producción
```bash
# Backend
NODE_ENV=production npm run start:backend

# Frontend
REACT_APP_ENV=production npm run build
```

### Staging
```bash
# Backend
NODE_ENV=staging npm run start:backend

# Frontend
REACT_APP_ENV=staging npm run build
```

## 📁 Estructura del Proyecto

```
EXTRACCION/
├── backend/                 # API REST
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rutas de la API
│   │   ├── middlewares/    # Middlewares
│   │   ├── config/         # Configuración
│   │   └── utils/          # Utilidades
│   ├── migrations/         # Migraciones de BD
│   ├── scripts/           # Scripts de utilidad
│   └── tests/             # Tests del backend
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── context/       # Contextos React
│   │   ├── api/           # Cliente API
│   │   ├── utils/         # Utilidades
│   │   └── config/        # Configuración
│   └── public/            # Archivos públicos
├── nginx/                 # Configuración Nginx
├── scripts/               # Scripts de despliegue
└── docs/                  # Documentación
```

## 🔧 Scripts Disponibles

### Root
- `npm run install:all` - Instalar todas las dependencias
- `npm run dev` - Ejecutar en modo desarrollo
- `npm run start` - Ejecutar en modo producción

### Backend
- `npm run dev` - Desarrollo con nodemon
- `npm run start` - Producción
- `npm run test` - Ejecutar tests
- `npm run lint` - Linting del código

### Frontend
- `npm run start` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run test` - Ejecutar tests

## 🗄️ Base de Datos

### Migraciones
```bash
cd backend

# Crear nueva migración
npx sequelize-cli migration:generate --name nombre-migracion

# Ejecutar migraciones
npx sequelize-cli db:migrate

# Revertir última migración
npx sequelize-cli db:migrate:undo
```

### Seeders
```bash
cd backend

# Crear seeder
npx sequelize-cli seed:generate --name nombre-seeder

# Ejecutar seeders
npx sequelize-cli db:seed:all
```

## 🧪 Testing

### Backend
```bash
cd backend
npm run test              # Tests unitarios
npm run test:coverage     # Tests con cobertura
npm run test:watch        # Tests en modo watch
```

### Frontend
```bash
cd frontend
npm run test              # Tests unitarios
npm run test -- --coverage # Tests con cobertura
```

## 🚀 Despliegue

### Heroku
```bash
# Configurar variables de entorno en Heroku
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=tu_host
heroku config:set DB_USER=tu_usuario
heroku config:set DB_PASSWORD=tu_password
heroku config:set DB_NAME=tu_base_datos

# Desplegar
git push heroku main
```

### Docker
```bash
# Construir imagen
docker build -t extraccion-app .

# Ejecutar contenedor
docker run -p 3000:3000 -p 3001:3001 extraccion-app
```

## 📝 Variables de Entorno

### Backend (.env)
```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=extraccion_db
DB_PORT=3306

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Servidor
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
# API
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development

# Características
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG=true
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación en `/docs`
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

## 🔄 Changelog

### v1.0.0
- Implementación inicial del sistema
- Frontend con React y Material-UI
- Backend con Node.js y Express
- Sistema de autenticación JWT
- Gestión de barredores, máquinas y operadores
- Dashboard con gráficos y estadísticas
