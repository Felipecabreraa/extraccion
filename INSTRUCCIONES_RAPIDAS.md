# 🚀 Instrucciones Rápidas - Sistema de Ambientes

## 📋 **Paso a Paso para Comenzar**

### **1. Descargar y Configurar**

```bash
# 1. Clonar o descargar el proyecto
git clone [URL_DEL_REPOSITORIO]
cd EXTRACCION

# 2. Ejecutar configuración automática
node scripts/setup-ambientes.js
```

### **2. Configurar Base de Datos**

#### **Base de Datos de Staging:**
```sql
-- Conectar a MySQL
mysql -h trn.cl -u extraccion_user -p

-- Crear base de datos de staging
CREATE DATABASE extraccion_staging;

-- Copiar datos de producción
mysqldump -h trn.cl -u extraccion_user -p extraccion_prod > backup_prod.sql
mysql -h trn.cl -u extraccion_user -p extraccion_staging < backup_prod.sql
```

#### **Base de Datos de Desarrollo:**
```sql
-- Instalar MySQL localmente
-- Crear base de datos
CREATE DATABASE extraccion_dev;

-- Copiar estructura (sin datos sensibles)
mysqldump -h trn.cl -u extraccion_user -p --no-data extraccion_prod > structure.sql
mysql -u root -p extraccion_dev < structure.sql
```

### **3. Comandos de Uso**

#### **Desarrollo Local:**
```bash
# Iniciar ambiente de desarrollo
node scripts/start-development.js

# Acceder a: http://localhost:3000
# Credenciales: dev@admin.com / dev123
```

#### **Staging (Pruebas):**
```bash
# Desplegar a staging
node scripts/deploy-staging.js

# Acceder a: https://frontend-staging.vercel.app
# Credenciales: staging@admin.com / staging123
```

#### **Producción:**
```bash
# Desplegar a producción (solo desde rama main)
node scripts/deploy-production.js

# Acceder a: https://frontend-p5lhq0h0n-felipe-lagos-projects-f57024eb.vercel.app
# Credenciales: admin@admin.com / admin123
```

### **4. Flujo de Trabajo**

#### **Desarrollo de Nueva Funcionalidad:**
```bash
# 1. Crear rama
git checkout -b feature/nueva-funcionalidad

# 2. Iniciar desarrollo
node scripts/start-development.js

# 3. Trabajar en localhost:3000
# 4. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

#### **Pruebas en Staging:**
```bash
# 1. Merge a develop
git checkout develop
git merge feature/nueva-funcionalidad

# 2. Desplegar a staging
node scripts/deploy-staging.js

# 3. Probar en staging
# 4. Si hay errores, corregir y repetir
```

#### **Despliegue a Producción:**
```bash
# 1. Merge a main
git checkout main
git merge develop

# 2. Desplegar a producción
node scripts/deploy-production.js

# 3. Verificar funcionamiento
```

### **5. Monitoreo**

#### **Ver Logs:**
```bash
# Railway (Backend)
npx @railway/cli logs

# Vercel (Frontend)
npx vercel logs
```

#### **Ver Estado:**
```bash
# Railway
npx @railway/cli status

# Vercel
npx vercel ls
```

### **6. URLs de Acceso**

| Ambiente | Frontend | Backend | Credenciales |
|----------|----------|---------|--------------|
| **🟢 Desarrollo** | http://localhost:3000 | http://localhost:3001 | dev@admin.com / dev123 |
| **🟡 Staging** | https://frontend-staging.vercel.app | https://backend-staging.up.railway.app | staging@admin.com / staging123 |
| **🔴 Producción** | https://frontend-p5lhq0h0n-felipe-lagos-projects-f57024eb.vercel.app | https://backend-production-6fb4.up.railway.app | admin@admin.com / admin123 |

### **7. Troubleshooting**

#### **Problemas Comunes:**

**Error: "Railway CLI no encontrado"**
```bash
npm install -g @railway/cli
npx @railway/cli login
```

**Error: "Vercel CLI no encontrado"**
```bash
npm install -g vercel
npx vercel login
```

**Error: "Base de datos no conecta"**
```bash
# Verificar variables de entorno
cat backend/.env
cat frontend/.env
```

**Error: "Puerto 3000/3001 ocupado"**
```bash
# Encontrar proceso
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Terminar proceso
taskkill /PID [PID] /F
```

### **8. Comandos Útiles**

```bash
# Verificar estado de todos los servicios
node scripts/check-status.js

# Limpiar cache
npm run clean

# Verificar dependencias
npm audit

# Actualizar dependencias
npm update
```

### **9. Documentación Completa**

Para información detallada, consultar:
- `README_AMBIENTES_COMPLETO.md` - Documentación completa
- `GUIA_AMBIENTES.md` - Guía de uso
- `scripts/` - Scripts de automatización

---

## 🎯 **¡Listo para Usar!**

Una vez configurado, puedes:

✅ **Desarrollar** en localhost sin afectar otros ambientes
✅ **Probar** cambios en staging antes de producción
✅ **Desplegar** a producción de forma segura
✅ **Monitorear** logs y métricas en tiempo real
✅ **Hacer rollback** en caso de problemas

**¡El sistema está configurado y listo para desarrollo profesional!** 🚀 