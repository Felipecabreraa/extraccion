# 🏗️ Guía de Ambientes - Sistema de Extracción

## 📋 **Resumen de Ambientes**

| Ambiente | URL Backend | URL Frontend | Base de Datos | Propósito |
|----------|-------------|--------------|---------------|-----------|
| **Desarrollo** | `http://localhost:3001` | `http://localhost:3000` | `extraccion_dev` | Desarrollo local |
| **Staging** | `https://backend-staging.up.railway.app` | `https://frontend-staging.vercel.app` | `extraccion_staging` | Pruebas |
| **Producción** | `https://backend-production-6fb4.up.railway.app` | `https://frontend-p5lhq0h0n-felipe-lagos-projects-f57024eb.vercel.app` | `extraccion_prod` | Producción |

## 🚀 **Comandos de Despliegue**

### **Desarrollo Local**
```bash
# Iniciar ambiente de desarrollo
node scripts/start-development.js

# O manualmente:
cd backend && npm start
cd frontend && npm start
```

### **Staging (Pruebas)**
```bash
# Desplegar a staging
node scripts/deploy-staging.js

# Verificar estado
npx @railway/cli status
```

### **Producción**
```bash
# Desplegar a producción (solo desde rama main)
node scripts/deploy-production.js

# Verificar estado
npx @railway/cli status
```

## 🔄 **Flujo de Trabajo Recomendado**

### **1. Desarrollo de Nuevas Funcionalidades**
```bash
# 1. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 2. Iniciar desarrollo local
node scripts/start-development.js

# 3. Desarrollar y probar localmente
# 4. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### **2. Pruebas en Staging**
```bash
# 1. Merge a develop
git checkout develop
git merge feature/nueva-funcionalidad

# 2. Desplegar a staging
node scripts/deploy-staging.js

# 3. Probar en staging
# 4. Si hay errores, corregir y repetir
```

### **3. Despliegue a Producción**
```bash
# 1. Merge a main
git checkout main
git merge develop

# 2. Desplegar a producción
node scripts/deploy-production.js

# 3. Verificar funcionamiento
```

## 🛠️ **Configuración de Base de Datos**

### **Crear Base de Datos de Staging**
```sql
-- Conectar a MySQL
mysql -h trn.cl -u extraccion_user -p

-- Crear base de datos de staging
CREATE DATABASE extraccion_staging;

-- Copiar estructura y datos de producción
mysqldump -h trn.cl -u extraccion_user -p extraccion_prod > backup_prod.sql
mysql -h trn.cl -u extraccion_user -p extraccion_staging < backup_prod.sql
```

### **Crear Base de Datos de Desarrollo**
```sql
-- Instalar MySQL localmente
-- Crear base de datos
CREATE DATABASE extraccion_dev;

-- Copiar estructura (sin datos sensibles)
mysqldump -h trn.cl -u extraccion_user -p --no-data extraccion_prod > structure.sql
mysql -u root -p extraccion_dev < structure.sql
```

## 🔧 **Variables de Entorno**

### **Backend (.env)**
```bash
# Desarrollo
NODE_ENV=development
DB_HOST=localhost
DB_NAME=extraccion_dev
JWT_SECRET=dev_secret_key_2024

# Staging
NODE_ENV=staging
DB_HOST=trn.cl
DB_NAME=extraccion_staging
JWT_SECRET=staging_secret_key_2024

# Producción
NODE_ENV=production
DB_HOST=trn.cl
DB_NAME=extraccion_prod
JWT_SECRET=production_secret_key_2024
```

### **Frontend (.env)**
```bash
# Desarrollo
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development

# Staging
REACT_APP_API_URL=https://backend-staging.up.railway.app/api
REACT_APP_ENV=staging

# Producción
REACT_APP_API_URL=https://backend-production-6fb4.up.railway.app/api
REACT_APP_ENV=production
```

## 🧪 **Testing y QA**

### **Pruebas Automatizadas**
```bash
# Ejecutar tests del backend
cd backend && npm test

# Ejecutar tests del frontend
cd frontend && npm test

# Ejecutar tests de integración
npm run test:integration
```

### **Pruebas Manuales**
1. **Funcionalidad**: Verificar que todas las funciones trabajen
2. **UI/UX**: Revisar diseño y usabilidad
3. **Performance**: Verificar tiempos de carga
4. **Seguridad**: Verificar autenticación y autorización
5. **Compatibilidad**: Probar en diferentes navegadores

## 📊 **Monitoreo y Logs**

### **Railway (Backend)**
```bash
# Ver logs en tiempo real
npx @railway/cli logs

# Ver logs de un servicio específico
npx @railway/cli logs --service backend
```

### **Vercel (Frontend)**
```bash
# Ver logs de despliegue
npx vercel logs

# Ver analytics
npx vercel analytics
```

## 🚨 **Procedimientos de Emergencia**

### **Rollback de Producción**
```bash
# 1. Identificar el commit anterior estable
git log --oneline

# 2. Revertir a ese commit
git revert <commit-hash>

# 3. Desplegar inmediatamente
node scripts/deploy-production.js
```

### **Restaurar Base de Datos**
```bash
# Restaurar desde backup
mysql -h trn.cl -u extraccion_user -p extraccion_prod < backup_2024-01-01.sql
```

## 📝 **Checklist de Despliegue**

### **Antes del Despliegue**
- [ ] Tests pasando
- [ ] Código revisado
- [ ] Variables de entorno configuradas
- [ ] Base de datos actualizada
- [ ] Documentación actualizada

### **Después del Despliegue**
- [ ] Verificar URLs funcionando
- [ ] Probar login/logout
- [ ] Verificar funcionalidades críticas
- [ ] Revisar logs de errores
- [ ] Notificar al equipo

## 🔐 **Seguridad**

### **Buenas Prácticas**
- ✅ Nunca committear archivos `.env`
- ✅ Usar diferentes JWT secrets por ambiente
- ✅ Rotar claves de acceso regularmente
- ✅ Monitorear logs de acceso
- ✅ Hacer backups regulares

### **Credenciales de Acceso**
- **Desarrollo**: `dev@admin.com` / `dev123`
- **Staging**: `staging@admin.com` / `staging123`
- **Producción**: `admin@admin.com` / `admin123`

---

**📞 Soporte**: Para problemas técnicos, contactar al equipo de desarrollo. 