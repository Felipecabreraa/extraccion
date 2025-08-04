# Configuración del Ambiente de Pruebas

## 🎯 Objetivo
Configurar un ambiente de pruebas específico que no afecte a producción, con configuraciones más permisivas para facilitar el desarrollo y testing.

## 📋 Configuración Implementada

### 1. Backend (Railway Test)
- **URL**: https://trn-extraccion-test.up.railway.app
- **Ambiente**: `NODE_ENV=test`
- **CORS**: Permitido para localhost y Railway Test
- **Rate Limit**: 1000 requests/min (más permisivo)
- **Logging**: Debug level
- **JWT**: Secret específico para pruebas

### 2. Frontend (Local)
- **URL**: http://localhost:3000
- **API URL**: https://trn-extraccion-test.up.railway.app/api
- **Ambiente**: Test mode habilitado
- **Debug**: Habilitado

## 🚀 Comandos Rápidos

### Configurar Railway para Pruebas
```bash
npm run setup-test
```

### Verificar Ambiente de Pruebas
```bash
npm run verify-test
```

### Verificar CORS
```bash
npm run check-cors
```

### Iniciar Desarrollo Local
```bash
npm run dev
```

## 🔧 Variables de Entorno

### Backend (Railway Test)
```env
NODE_ENV=test
PORT=3000
DB_HOST=trn.cl
DB_USER=trn_felipe
DB_PASSWORD=RioNegro2025@
DB_NAME=trn_extraccion_test
DB_PORT=3306
JWT_SECRET=test-secret-key-for-testing-only
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,https://trn-extraccion-test.up.railway.app
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
UPLOAD_MAX_SIZE=10485760
BCRYPT_ROUNDS=8
TEST_MODE=true
ALLOW_TEST_USERS=true
```

### Frontend (Local)
```env
REACT_APP_API_URL=https://trn-extraccion-test.up.railway.app/api
REACT_APP_ENVIRONMENT=test
REACT_APP_DEBUG=true
REACT_APP_TEST_MODE=true
```

## 🔒 Configuración CORS por Ambiente

### Desarrollo
```javascript
// Permite cualquier origen
corsOrigin = true;
```

### Pruebas
```javascript
// Orígenes específicos para pruebas
corsOrigin = [
  'http://localhost:3000',
  'http://localhost:3002', 
  'https://trn-extraccion-test.up.railway.app'
];
```

### Producción
```javascript
// Solo orígenes de producción
corsOrigin = [
  'https://trn-extraccion-production.up.railway.app'
];
```

## 📊 Diferencias por Ambiente

| Configuración | Desarrollo | Pruebas | Producción |
|---------------|------------|---------|------------|
| Base de Datos | trn_extraccion | **trn_extraccion_test** | trn_extraccion |
| CORS | Cualquier origen | localhost + Railway Test | Solo Railway Production |
| Rate Limit | 1000/min | 1000/min | 100/min |
| Logging | Debug | Debug | Info |
| JWT Secret | dev-secret | test-secret | production-secret |
| Debug Mode | ✅ | ✅ | ❌ |
| Test Users | ✅ | ✅ | ❌ |

## 🔍 Verificación

### 1. Verificar Backend
```bash
curl https://trn-extraccion-test.up.railway.app/health
```

### 2. Verificar CORS
```bash
curl -X OPTIONS https://trn-extraccion-test.up.railway.app/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"
```

### 3. Verificar Frontend
- Abrir http://localhost:3000
- Intentar hacer login
- Verificar en DevTools que no hay errores CORS

## 🛠️ Troubleshooting

### Error CORS persistente:
1. Ejecutar: `npm run setup-test`
2. Verificar Railway Dashboard
3. Reiniciar servicio: `railway up`
4. Limpiar caché del navegador

### Error de conexión:
1. Verificar que Railway esté ejecutándose
2. Verificar variables de entorno
3. Ejecutar: `npm run verify-test`

### Error de autenticación:
1. Verificar JWT_SECRET en Railway
2. Verificar que el usuario de prueba exista
3. Verificar logs en Railway Dashboard

## 📝 Notas Importantes

- ✅ **Seguro**: No afecta a producción
- ✅ **Aislado**: Configuración específica para pruebas
- ✅ **Permisivo**: Rate limits y CORS más abiertos
- ✅ **Debug**: Logging detallado para troubleshooting
- ✅ **Test Users**: Permite usuarios de prueba

## 🔗 URLs Importantes

- **Backend Test**: https://trn-extraccion-test.up.railway.app
- **Frontend Local**: http://localhost:3000
- **Railway Dashboard**: https://railway.app/dashboard
- **Health Check**: https://trn-extraccion-test.up.railway.app/health 