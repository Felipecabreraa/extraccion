# 🔧 Solución para Railway Test Environment

## 🚨 **Problema Identificado**
- **Proyecto:** `trn-extraccion-test`
- **Estado:** `CRASHED`
- **URL:** `trn-extracción-prueba-producción.up.railway.app`
- **Problema:** Configurado como "producción" en lugar de "test"

## 🚀 **Solución Automática**

### **Paso 1: Ejecutar Script de Solución**
```bash
cd backend
npm run fix:railway
```

Este script hará automáticamente:
- ✅ Configurar ambiente local
- ✅ Hacer commit y push
- ✅ Proporcionar pasos para Railway

## 📋 **Solución Manual Paso a Paso**

### **1. Configurar Variables de Entorno en Railway**

1. **Ir a Railway Dashboard:** https://railway.app/dashboard
2. **Seleccionar proyecto:** `trn-extraccion-test`
3. **Ir a:** Variables → "+ Nueva variable"
4. **Agregar las siguientes variables una por una:**

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

### **2. Actualizar Código y Hacer Deploy**

```bash
# Configurar ambiente local
cd backend
npm run setup:test-public

# Hacer commit y push
git add .
git commit -m "Fix: Configurar Railway para ambiente de pruebas"
git push origin test
```

### **3. Restart en Railway**

1. **En Railway Dashboard:**
   - Hacer click en **"Restart"**
   - Esperar a que el deployment termine
   - Verificar que el estado cambie de "CRASHED" a "RUNNING"

### **4. Verificar Funcionamiento**

1. **Backend:** `https://trn-extracción-prueba-producción.up.railway.app`
2. **Frontend:** `https://frontend-puce-eta-70-git-test.vercel.app`
3. **Probar login** con credenciales de prueba

## 🎯 **Resultado Esperado**

### **✅ Después de la solución:**
- Railway funcionando en modo TEST
- Base de datos: `trn_extraccion_test`
- Puerto: 3002
- CORS configurado para el frontend de Vercel
- Estado: RUNNING (no más CRASHED)

### **🔍 Para verificar:**
1. **Railway Dashboard:** Estado "RUNNING"
2. **Backend URL:** Responde correctamente
3. **Frontend:** Se conecta al backend sin errores
4. **Login:** Funciona con credenciales de prueba

## 🆘 **Si el problema persiste**

### **Verificar en Railway:**
- **Logs:** Revisar logs del deployment
- **Variables:** Confirmar que todas las variables estén agregadas
- **Estado:** Verificar que el restart haya funcionado

### **Comandos de diagnóstico:**
```bash
# Verificar configuración local
cd backend && cat .env
cd ../frontend && cat .env

# Verificar estado del repositorio
git status
git log --oneline -3
```

## 📞 **Soporte**
- **Email:** soporte@trn.com
- **Ambiente:** Test
- **Problema:** Railway CRASHED 