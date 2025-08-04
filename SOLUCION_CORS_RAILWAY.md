# Solución para Error CORS en Railway

## Problema
El frontend en `http://localhost:3000` no puede conectarse al backend en `https://trn-extraccion-test.up.railway.app/api` debido a restricciones de CORS.

## Soluciones Implementadas

### 1. Configuración CORS Mejorada en Backend
- ✅ Actualizado `backend/src/app.js` para permitir múltiples orígenes
- ✅ Configuración más permisiva en desarrollo
- ✅ Headers CORS completos

### 2. Configuración Frontend Actualizada
- ✅ Actualizado `frontend-test-publico/src/api/axios.js` para usar la URL correcta
- ✅ Configuración de baseURL para Railway Test

### 3. Variables de Entorno
- ✅ Creado `backend/env.production.example` con configuración para Railway
- ✅ Variable `CORS_ORIGIN` configurada para múltiples orígenes

### 4. Scripts de Verificación
- ✅ `scripts/check-railway-cors.js` - Verifica configuración CORS
- ✅ `scripts/update-railway-env.js` - Actualiza variables en Railway

## Pasos para Solucionar

### Paso 1: Verificar Railway
```bash
node scripts/check-railway-cors.js
```

### Paso 2: Actualizar Variables de Entorno en Railway
```bash
# Opción 1: Usar script automático
node scripts/update-railway-env.js

# Opción 2: Configurar manualmente en Railway Dashboard
CORS_ORIGIN=http://localhost:3000,https://trn-extraccion-test.up.railway.app,https://trn-extraccion-production.up.railway.app
```

### Paso 3: Reiniciar Servicio en Railway
```bash
railway up
```

### Paso 4: Verificar Frontend
```bash
cd frontend-test-publico
npm start
```

## Configuración CORS Actual

### Backend (app.js)
```javascript
let corsOrigin;
if (process.env.NODE_ENV === 'development') {
  corsOrigin = true; // Permite cualquier origen en desarrollo
} else {
  corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:3002', 'https://trn-extraccion-test.up.railway.app'];
}

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### Frontend (axios.js)
```javascript
const baseURL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL || 'https://trn-extraccion-test.up.railway.app/api'
  : process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
```

## Variables de Entorno Requeridas

### Railway (Producción)
```env
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000,https://trn-extraccion-test.up.railway.app,https://trn-extraccion-production.up.railway.app
```

### Frontend (Desarrollo)
```env
REACT_APP_API_URL=https://trn-extraccion-test.up.railway.app/api
```

## Verificación

### 1. Verificar Backend
```bash
curl -X OPTIONS https://trn-extraccion-test.up.railway.app/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
```

### 2. Verificar Frontend
- Abrir DevTools en el navegador
- Ir a la pestaña Network
- Intentar hacer login
- Verificar que no hay errores CORS

## Troubleshooting

### Si persiste el error CORS:
1. Verificar que Railway esté ejecutándose
2. Verificar variables de entorno en Railway Dashboard
3. Reiniciar el servicio en Railway
4. Limpiar caché del navegador
5. Verificar que la URL del frontend sea correcta

### Comandos útiles:
```bash
# Verificar estado de Railway
railway status

# Ver logs de Railway
railway logs

# Verificar variables de entorno
railway variables
```

## URLs Importantes
- **Backend Test**: https://trn-extraccion-test.up.railway.app
- **Frontend Local**: http://localhost:3000
- **Railway Dashboard**: https://railway.app/dashboard 