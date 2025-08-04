# 🧪 Ambiente de Pruebas Público

## 📋 Descripción
Este ambiente permite que cualquier persona con credenciales pueda probar el sistema de EXTRACCION.

## 🚀 Configuración

### **Rama Git:**
- **Rama:** `test`
- **URL Frontend:** `https://frontend-puce-eta-70-git-test.vercel.app`
- **URL Backend:** `https://trn-extraccion-test.up.railway.app`

### **Configuración Automática:**
```bash
# Configurar ambiente de pruebas
npm run setup:test-public

# O manualmente:
npm run env:test
```

## 🔧 Variables de Entorno

### **Frontend (.env):**
```env
REACT_APP_API_URL=https://trn-extraccion-test.up.railway.app/api
REACT_APP_ENVIRONMENT=test
REACT_APP_APP_NAME=EXTRACCION TEST
```

### **Backend (.env):**
```env
NODE_ENV=test
PORT=3002
DB_NAME=trn_extraccion_test
CORS_ORIGIN=https://frontend-puce-eta-70-git-test.vercel.app
```

## 🎯 Características del Ambiente de Pruebas

### **✅ Habilitado:**
- Dashboard completo
- Gestión de daños
- Planillas
- Reportes
- Carga masiva
- Todas las funcionalidades principales

### **🔒 Seguridad:**
- Base de datos separada (`trn_extraccion_test`)
- JWT con expiración de 1 hora
- Rate limiting reducido
- Logs de error únicamente

### **📊 Datos:**
- Base de datos de pruebas
- Datos de ejemplo
- Sin datos de producción

## 🚀 Despliegue

### **1. Configurar Backend en Railway:**
- Crear nuevo proyecto en Railway
- Conectar repositorio
- Configurar variables de entorno
- Deploy automático desde rama `test`

### **2. Configurar Frontend en Vercel:**
- El proyecto ya existe
- Configurar para usar rama `test`
- Variables de entorno automáticas

### **3. Variables de Entorno en Railway:**
```env
NODE_ENV=test
PORT=3002
DB_HOST=trn.cl
DB_USER=trn_felipe
DB_PASSWORD=RioNegro2025@
DB_NAME=trn_extraccion_test
DB_PORT=3306
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=1h
CORS_ORIGIN=https://frontend-puce-eta-70-git-test.vercel.app
LOG_LEVEL=error
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=uploads/test/
BCRYPT_ROUNDS=4
```

## 🔄 Flujo de Trabajo

### **Para Actualizar el Ambiente de Pruebas:**
1. Hacer cambios en la rama `test`
2. Ejecutar: `npm run setup:test-public`
3. Commit y push: `git add . && git commit -m "Actualizar ambiente de pruebas" && git push origin test`
4. Vercel y Railway harán deploy automático

### **Para Probar Localmente:**
1. `git checkout test`
2. `npm run setup:test-public`
3. `cd backend && npm run test:server`
4. `cd frontend && npm start`

## 📞 Soporte
- **Email:** soporte@trn.com
- **Ambiente:** Test
- **Versión:** 1.0.0 