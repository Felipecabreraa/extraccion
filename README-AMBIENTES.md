# 🚀 EXTRACCION - Sistema de Ambientes

## 📋 Descripción

Este proyecto está configurado para trabajar con **3 ambientes diferentes** de forma dinámica:

- 🟢 **Desarrollo** (`development`) - Para desarrollo local
- 🟡 **Pruebas** (`test`) - Para testing y QA
- 🔴 **Producción** (`production`) - Para el ambiente final

## 🏗️ Estructura de Ambientes

```
EXTRACCION/
├── backend/
│   ├── env.development    # Configuración desarrollo
│   ├── env.test          # Configuración pruebas
│   ├── env.production    # Configuración producción
│   └── .env              # Configuración activa
├── frontend/
│   ├── env.development   # Configuración desarrollo
│   ├── env.test         # Configuración pruebas
│   ├── env.production   # Configuración producción
│   └── .env             # Configuración activa
└── scripts/
    ├── switch-to-development.js  # Cambiar a desarrollo
    ├── switch-to-test.js        # Cambiar a pruebas
    ├── switch-to-production.js   # Cambiar a producción
    ├── quick-start.js           # Inicio rápido
    └── verify-environments.js   # Verificar configuración
```

## 🚀 Inicio Rápido

### 1. Configuración Inicial (Primera vez)

```bash
# Configurar todos los ambientes
node scripts/setup-environments.js

# Verificar que todo esté correcto
node scripts/verify-environments.js

# Iniciar desarrollo
node scripts/quick-start.js
```

### 2. Inicio Diario

```bash
# Inicio rápido (recomendado)
node scripts/quick-start.js
```

## 🔄 Cambio de Ambientes

### Cambiar a Desarrollo
```bash
node scripts/switch-to-development.js
```

**Configuración:**
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`
- Base de datos: `trn_extraccion_dev`

### Cambiar a Pruebas
```bash
node scripts/switch-to-test.js
```

**Configuración:**
- Backend: `http://localhost:3002`
- Frontend: `http://localhost:3000`
- Base de datos: `trn_extraccion_test`

### Cambiar a Producción
```bash
node scripts/switch-to-production.js
```

**Configuración:**
- Backend: `[URL de producción]`
- Frontend: `[URL de producción]`
- Base de datos: `trn_extraccion_prod`

## 📝 Comandos Disponibles

### Scripts Principales
```bash
# Configuración
node scripts/setup-environments.js      # Configurar ambientes
node scripts/verify-environments.js     # Verificar configuración

# Cambio de ambientes
node scripts/switch-to-development.js   # Cambiar a desarrollo
node scripts/switch-to-test.js         # Cambiar a pruebas
node scripts/switch-to-production.js    # Cambiar a producción

# Inicio de servidores
node scripts/quick-start.js            # Inicio rápido (desarrollo)
```

### Comandos Manuales
```bash
# Backend
cd backend
npm run dev          # Desarrollo
npm run test:server  # Pruebas
npm start           # Producción

# Frontend
cd frontend
npm start           # Desarrollo
npm run build      # Construir para producción
```

## 🌐 URLs por Ambiente

### 🟢 Desarrollo
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Health**: http://localhost:3001/health
- **Base de datos**: `trn_extraccion_dev`

### 🟡 Pruebas
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3002
- **API Health**: http://localhost:3002/health
- **Base de datos**: `trn_extraccion_test`

### 🔴 Producción
- **Frontend**: [Configurar URL]
- **Backend**: [Configurar URL]
- **Base de datos**: `trn_extraccion_prod`

## 🔧 Configuración de Base de Datos

### Crear Bases de Datos
```sql
-- Desarrollo
CREATE DATABASE trn_extraccion_dev;

-- Pruebas
CREATE DATABASE trn_extraccion_test;

-- Producción
CREATE DATABASE trn_extraccion_prod;
```

### Variables de Entorno Requeridas

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=trn_extraccion_dev
DB_PORT=3306

JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=1.0.0
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error de Base de Datos
```bash
# Verificar que MySQL esté corriendo
# Verificar credenciales en .env
# Verificar que la base de datos exista
```

#### 2. Error de Puerto en Uso
```bash
# Cambiar puerto en .env
# O matar proceso que use el puerto
netstat -ano | findstr :3001
taskkill /PID [PID] /F
```

#### 3. Error de Dependencias
```bash
# Reinstalar dependencias
cd backend && npm install
cd frontend && npm install
```

#### 4. Error de CORS
```bash
# Verificar CORS_ORIGIN en backend/.env
# Verificar REACT_APP_API_URL en frontend/.env
```

### Verificación de Configuración
```bash
# Verificar que todo esté configurado correctamente
node scripts/verify-environments.js
```

## 📚 Workflow de Desarrollo

### 1. Desarrollo Diario
```bash
# 1. Cambiar a desarrollo
node scripts/switch-to-development.js

# 2. Iniciar servidores
node scripts/quick-start.js

# 3. Trabajar en el código
# 4. Probar cambios
# 5. Hacer commit
```

### 2. Testing
```bash
# 1. Cambiar a pruebas
node scripts/switch-to-test.js

# 2. Ejecutar tests
cd backend && npm test
cd frontend && npm test

# 3. Probar funcionalidad
# 4. Reportar bugs
```

### 3. Despliegue a Producción
```bash
# 1. Cambiar a producción
node scripts/switch-to-production.js

# 2. Verificar configuración
node scripts/verify-environments.js

# 3. Construir frontend
cd frontend && npm run build

# 4. Desplegar backend
cd backend && npm start
```

## 🔒 Seguridad

### Variables Sensibles
- **JWT_SECRET**: Cambiar en producción
- **DB_PASSWORD**: Configurar en producción
- **SMTP_CREDENTIALS**: Configurar en producción

### Recomendaciones
- Nunca committear archivos `.env`
- Usar variables de entorno en producción
- Rotar secretos regularmente
- Usar HTTPS en producción

## 📋 Checklist de Configuración

### ✅ Configuración Inicial
- [ ] Ejecutar `node scripts/setup-environments.js`
- [ ] Verificar con `node scripts/verify-environments.js`
- [ ] Configurar base de datos MySQL
- [ ] Probar inicio rápido

### ✅ Configuración de Producción
- [ ] Configurar URLs de producción
- [ ] Configurar base de datos de producción
- [ ] Configurar variables de entorno seguras
- [ ] Configurar SSL/HTTPS
- [ ] Configurar monitoreo

### ✅ Configuración de Testing
- [ ] Configurar base de datos de pruebas
- [ ] Configurar datos de prueba
- [ ] Configurar CI/CD si es necesario

## 🆘 Soporte

### Comandos de Ayuda
```bash
# Verificar estado actual
node scripts/verify-environments.js

# Ver logs
cd backend && npm run dev
cd frontend && npm start

# Debug
node scripts/quick-start.js
```

### Contacto
- **Desarrollador**: [Tu nombre]
- **Email**: [Tu email]
- **Documentación**: [URL de documentación]

---

**Nota**: Este sistema permite trabajar de forma dinámica entre ambientes sin afectar la configuración de otros desarrolladores. 