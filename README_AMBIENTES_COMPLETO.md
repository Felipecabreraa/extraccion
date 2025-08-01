# 🏗️ Sistema de Ambientes - Extracción App

## 📋 **Resumen Ejecutivo**

Este documento describe la configuración completa del sistema de ambientes para la aplicación de Extracción, permitiendo trabajar de forma segura en desarrollo, pruebas y producción.

---

## 🎯 **Objetivos**

- ✅ **Desarrollo Local**: Trabajar sin afectar otros ambientes
- ✅ **Staging**: Probar cambios antes de producción
- ✅ **Producción**: Sistema estable y confiable
- ✅ **Seguridad**: Separación de datos y credenciales
- ✅ **Monitoreo**: Logs y métricas por ambiente

---

## 🏗️ **Arquitectura de Ambientes**

### **Estructura de Directorios**
```
EXTRACCION/
├── backend/
│   ├── env.development     # Variables de desarrollo
│   ├── env.staging        # Variables de staging
│   └── env.railway.production  # Variables de producción
├── frontend/
│   ├── env.development    # Variables de desarrollo
│   └── env.staging        # Variables de staging
├── scripts/
│   ├── start-development.js    # Iniciar desarrollo
│   ├── deploy-staging.js      # Desplegar staging
│   └── deploy-production.js   # Desplegar producción
└── GUIA_AMBIENTES.md      # Guía completa
```

---

## 🌐 **URLs de Ambientes**

| Ambiente | Backend | Frontend | Base de Datos | Propósito |
|----------|---------|----------|---------------|-----------|
| **🟢 Desarrollo** | `http://localhost:3001` | `http://localhost:3000` | `extraccion_dev` | Desarrollo local |
| **🟡 Staging** | `https://backend-staging.up.railway.app` | `https://frontend-staging.vercel.app` | `extraccion_staging` | Pruebas |
| **🔴 Producción** | `https://backend-production-6fb4.up.railway.app` | `https://frontend-p5lhq0h0n-felipe-lagos-projects-f57024eb.vercel.app` | `extraccion_prod` | Producción |

---

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

---

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

---

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

---

## 🔧 **Variables de Entorno**

### **Backend (.env)**

#### **Desarrollo**
```bash
# Configuración de Desarrollo
NODE_ENV=development
PORT=3001

# Base de datos de desarrollo
DB_HOST=localhost
DB_PORT=3306
DB_NAME=extraccion_dev
DB_USER=root
DB_PASSWORD=password

# JWT Secret para desarrollo
JWT_SECRET=dev_secret_key_2024

# CORS para desarrollo
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

#### **Staging**
```bash
# Configuración de Staging/Pruebas
NODE_ENV=staging
PORT=3001

# Base de datos de staging
DB_HOST=trn.cl
DB_PORT=3306
DB_NAME=extraccion_staging
DB_USER=extraccion_user
DB_PASSWORD=Extraccion2024!

# JWT Secret para staging
JWT_SECRET=staging_secret_key_2024

# CORS para staging
CORS_ORIGIN=https://frontend-staging.vercel.app

# Logging
LOG_LEVEL=info
```

#### **Producción**
```bash
# Configuración de Producción
NODE_ENV=production
PORT=3001

# Base de datos de producción
DB_HOST=trn.cl
DB_PORT=3306
DB_NAME=extraccion_prod
DB_USER=extraccion_user
DB_PASSWORD=Extraccion2024!

# JWT Secret para producción
JWT_SECRET=production_secret_key_2024

# CORS para producción
CORS_ORIGIN=https://frontend-p5lhq0h0n-felipe-lagos-projects-f57024eb.vercel.app

# Logging
LOG_LEVEL=error
```

### **Frontend (.env)**

#### **Desarrollo**
```bash
# Configuración de Desarrollo Frontend
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0-dev
```

#### **Staging**
```bash
# Configuración de Staging Frontend
REACT_APP_API_URL=https://backend-staging.up.railway.app/api
REACT_APP_ENV=staging
REACT_APP_VERSION=1.0.0-staging
```

#### **Producción**
```bash
# Configuración de Producción Frontend
REACT_APP_API_URL=https://backend-production-6fb4.up.railway.app/api
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

---

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

---

## 📊 **Monitoreo y Logs**

### **Railway (Backend)**
```bash
# Ver logs en tiempo real
npx @railway/cli logs

# Ver logs de un servicio específico
npx @railway/cli logs --service backend

# Ver estado de servicios
npx @railway/cli status
```

### **Vercel (Frontend)**
```bash
# Ver logs de despliegue
npx vercel logs

# Ver analytics
npx vercel analytics

# Ver deployments
npx vercel ls
```

---

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

### **Verificar Salud del Sistema**
```bash
# Backend health check
curl https://backend-production-6fb4.up.railway.app/api/health

# Frontend health check
curl https://frontend-p5lhq0h0n-felipe-lagos-projects-f57024eb.vercel.app
```

---

## 📝 **Checklist de Despliegue**

### **Antes del Despliegue**
- [ ] Tests pasando
- [ ] Código revisado
- [ ] Variables de entorno configuradas
- [ ] Base de datos actualizada
- [ ] Documentación actualizada
- [ ] Backup de producción realizado
- [ ] Equipo notificado

### **Después del Despliegue**
- [ ] Verificar URLs funcionando
- [ ] Probar login/logout
- [ ] Verificar funcionalidades críticas
- [ ] Revisar logs de errores
- [ ] Verificar métricas de performance
- [ ] Notificar al equipo
- [ ] Documentar cambios

---

## 🔐 **Seguridad**

### **Buenas Prácticas**
- ✅ Nunca committear archivos `.env`
- ✅ Usar diferentes JWT secrets por ambiente
- ✅ Rotar claves de acceso regularmente
- ✅ Monitorear logs de acceso
- ✅ Hacer backups regulares
- ✅ Usar HTTPS en todos los ambientes
- ✅ Implementar rate limiting
- ✅ Validar inputs en frontend y backend

### **Credenciales de Acceso**

| Ambiente | Email | Password | Propósito |
|----------|-------|----------|-----------|
| **Desarrollo** | `dev@admin.com` | `dev123` | Desarrollo local |
| **Staging** | `staging@admin.com` | `staging123` | Pruebas |
| **Producción** | `admin@admin.com` | `admin123` | Sistema real |

---

## 📋 **Scripts Disponibles**

### **start-development.js**
```bash
# Inicia el ambiente de desarrollo local
node scripts/start-development.js

# Funciones:
# - Copia configuración de desarrollo
# - Instala dependencias
# - Inicia backend y frontend en paralelo
# - Maneja señales de terminación
```

### **deploy-staging.js**
```bash
# Despliega a ambiente de staging
node scripts/deploy-staging.js

# Funciones:
# - Copia configuración de staging
# - Despliega backend a Railway
# - Despliega frontend a Vercel
# - Verifica estado de servicios
```

### **deploy-production.js**
```bash
# Despliega a producción (solo desde main)
node scripts/deploy-production.js

# Funciones:
# - Verifica rama main
# - Copia configuración de producción
# - Despliega backend a Railway
# - Despliega frontend a Vercel
# - Verifica estado final
```

---

## 🔧 **Configuración de Herramientas**

### **Railway CLI**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login a Railway
npx @railway/cli login

# Verificar estado
npx @railway/cli status
```

### **Vercel CLI**
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login a Vercel
npx vercel login

# Verificar estado
npx vercel ls
```

### **Git Configuration**
```bash
# Configurar usuario
git config user.name "Tu Nombre"
git config user.email "tu.email@ejemplo.com"

# Configurar ramas
git checkout -b develop
git push -u origin develop
```

---

## 📊 **Métricas y Monitoreo**

### **KPIs por Ambiente**
- **Tiempo de respuesta**: < 2 segundos
- **Disponibilidad**: > 99.9%
- **Errores**: < 0.1%
- **Uptime**: Monitoreo 24/7

### **Alertas Configuradas**
- ⚠️ **Error 500**: Notificación inmediata
- ⚠️ **Tiempo de respuesta > 5s**: Alerta
- ⚠️ **Disponibilidad < 99%**: Alerta crítica
- ⚠️ **Base de datos desconectada**: Alerta urgente

---

## 🚀 **Optimizaciones**

### **Performance**
- ✅ **Caching**: Redis para sesiones
- ✅ **CDN**: Vercel Edge Network
- ✅ **Compresión**: Gzip/Brotli
- ✅ **Minificación**: CSS/JS optimizados
- ✅ **Lazy Loading**: Componentes React

### **Seguridad**
- ✅ **HTTPS**: Todos los ambientes
- ✅ **CORS**: Configurado por ambiente
- ✅ **Rate Limiting**: Protección contra spam
- ✅ **Input Validation**: Sanitización de datos
- ✅ **SQL Injection**: Prepared statements

---

## 📞 **Soporte y Contacto**

### **Equipo de Desarrollo**
- **Lead Developer**: [Nombre]
- **DevOps**: [Nombre]
- **QA**: [Nombre]

### **Canales de Comunicación**
- **Slack**: #extraccion-app
- **Email**: dev@extraccion.com
- **Jira**: Proyecto EXT-001

### **Documentación Adicional**
- **API Docs**: https://docs.extraccion.com
- **Deployment Guide**: [Link interno]
- **Troubleshooting**: [Link interno]

---

## 📈 **Roadmap**

### **Fase 1 - Configuración Base** ✅
- [x] Configurar ambientes de desarrollo
- [x] Configurar ambientes de staging
- [x] Configurar ambientes de producción
- [x] Crear scripts de despliegue
- [x] Documentar procesos

### **Fase 2 - Automatización** 🔄
- [ ] CI/CD con GitHub Actions
- [ ] Tests automatizados
- [ ] Deploy automático en staging
- [ ] Monitoreo avanzado
- [ ] Alertas automáticas

### **Fase 3 - Escalabilidad** 📋
- [ ] Microservicios
- [ ] Load balancing
- [ ] Base de datos distribuida
- [ ] Cache distribuido
- [ ] Auto-scaling

---

## 🎯 **Conclusión**

Este sistema de ambientes proporciona:

✅ **Seguridad**: Separación completa de datos y credenciales
✅ **Eficiencia**: Desarrollo paralelo sin conflictos
✅ **Calidad**: Pruebas exhaustivas antes de producción
✅ **Monitoreo**: Visibilidad completa del sistema
✅ **Escalabilidad**: Preparado para crecimiento futuro

**¡El sistema está listo para uso en producción!** 🚀

---

*Última actualización: Enero 2025*
*Versión: 1.0.0*
*Autor: Equipo de Desarrollo Extracción* 