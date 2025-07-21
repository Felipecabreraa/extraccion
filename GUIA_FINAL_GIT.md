# 🚀 Guía Final - Subir Proyecto a Git

## ✅ Estado Actual

Tu proyecto ya tiene configurado:
- ✅ Estructura Git profesional
- ✅ Archivos de configuración (.gitignore, README.md, CHANGELOG.md)
- ✅ Documentación completa (docs/)
- ✅ Scripts de automatización
- ✅ Workflow de GitHub Actions
- ✅ Configuración de ambientes
- ✅ Repositorio Git inicializado

## 📋 Pasos para Completar la Configuración

### 1. Configurar Usuario de Git

```bash
# Configura tu nombre y email
git config user.name "Tu Nombre"
git config user.email "tu.email@ejemplo.com"

# Verificar configuración
git config --list
```

### 2. Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com)
2. Haz clic en "New repository"
3. Nombre: `EXTRACCION` o `sistema-extraccion`
4. Descripción: "Sistema completo de gestión de extracción con frontend y backend"
5. **NO** inicialices con README (ya lo tenemos)
6. Haz clic en "Create repository"

### 3. Conectar Repositorio Local con GitHub

```bash
# Agregar el remote origin (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/EXTRACCION.git

# Verificar que se agregó correctamente
git remote -v
```

### 4. Hacer el Primer Commit

```bash
# Agregar todos los archivos
git add .

# Hacer el commit inicial
git commit -m "feat: configuración inicial del proyecto

- Sistema completo de gestión de extracción
- Frontend con React y Material-UI
- Backend con Node.js y Express
- Base de datos MySQL con Sequelize
- Sistema de autenticación JWT
- Dashboard con gráficos y estadísticas
- Documentación completa y scripts de automatización
- Configuración de ambientes (desarrollo, staging, producción)
- Workflow Git profesional con ramas main/develop
- CI/CD con GitHub Actions"

# Subir a GitHub
git push -u origin develop
git push -u origin main
```

### 5. Configurar Protección de Ramas (Opcional)

En GitHub, ve a Settings > Branches y configura:

**Rama `main`:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

**Rama `develop`:**
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging

### 6. Configurar Variables de Entorno en GitHub

Ve a Settings > Secrets and variables > Actions y agrega:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=test_db
JWT_SECRET=test_secret_key_for_ci
```

### 7. Verificar que Todo Funcione

```bash
# Verificar estado
git status

# Verificar ramas
git branch -a

# Verificar remotes
git remote -v

# Verificar configuración
git config --list
```

## 🔄 Flujo de Trabajo Diario

### Crear Nueva Funcionalidad

```bash
# Usar el script de workflow (Windows)
.\scripts\git-workflow.ps1 feature mi-nueva-funcionalidad

# O manualmente
git checkout develop
git pull origin develop
git checkout -b feature/mi-nueva-funcionalidad

# Desarrollar y hacer commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Subir rama
git push origin feature/mi-nueva-funcionalidad

# Crear Pull Request en GitHub
```

### Completar Funcionalidad

```bash
# Usar el script
.\scripts\git-workflow.ps1 complete-feature mi-nueva-funcionalidad

# O manualmente
git checkout develop
git pull origin develop
git merge feature/mi-nueva-funcionalidad
git push origin develop
git branch -d feature/mi-nueva-funcionalidad
git push origin --delete feature/mi-nueva-funcionalidad
```

### Crear Release

```bash
# Usar el script
.\scripts\git-workflow.ps1 release 1.2.0

# Actualizar versiones en package.json
# Actualizar CHANGELOG.md
# Hacer commit de release

# Completar release
.\scripts\git-workflow.ps1 complete-release 1.2.0
```

## 🌍 Configuración de Ambientes

### Desarrollo Local

```bash
# Backend
cd backend
cp env.development.example .env
# Editar .env con tus configuraciones

# Frontend
cd frontend
# Crear .env con REACT_APP_API_URL=http://localhost:3001/api

# Ejecutar
npm run dev
```

### Staging

```bash
# Configurar variables de entorno para staging
# Desplegar usando el workflow de GitHub Actions
```

### Producción

```bash
# Configurar variables de entorno para producción
# Desplegar usando el workflow de GitHub Actions
```

## 📊 Monitoreo y CI/CD

### GitHub Actions

El workflow automático incluye:
- ✅ Tests del backend y frontend
- ✅ Linting y validación de código
- ✅ Auditoría de seguridad
- ✅ Build de la aplicación
- ✅ Despliegue automático a staging (desde develop)
- ✅ Despliegue automático a producción (desde main)

### Verificar Estado

```bash
# Verificar que los tests pasen
npm run test

# Verificar linting
npm run lint

# Verificar build
npm run build
```

## 🔧 Comandos Útiles

### Git

```bash
# Ver estado
git st

# Ver log
git lg

# Ver ramas
git br

# Hacer commit
git cm "mensaje del commit"

# Hacer commit con todos los cambios
git cam "mensaje del commit"
```

### Scripts de Workflow

```bash
# Ver ayuda
.\scripts\git-workflow.ps1 help

# Crear feature
.\scripts\git-workflow.ps1 feature nombre-feature

# Crear hotfix
.\scripts\git-workflow.ps1 hotfix nombre-hotfix

# Crear release
.\scripts\git-workflow.ps1 release 1.2.0
```

### Desarrollo

```bash
# Instalar dependencias
npm run install:all

# Ejecutar en desarrollo
npm run dev

# Ejecutar tests
npm run test

# Build para producción
npm run build
```

## 📚 Documentación Disponible

- **README.md** - Documentación principal del proyecto
- **CHANGELOG.md** - Historial de cambios
- **docs/ESTRUCTURA_GIT.md** - Estructura Git detallada
- **docs/AMBIENTES.md** - Configuración de ambientes
- **.github/workflows/ci.yml** - Pipeline de CI/CD

## 🚨 Solución de Problemas

### Error de Push

```bash
# Si hay conflictos
git pull origin develop
# Resolver conflictos
git add .
git commit -m "resolve merge conflicts"
git push origin develop
```

### Error de Permisos

```bash
# Verificar configuración de Git
git config --list

# Configurar credenciales si es necesario
git config credential.helper store
```

### Error de Tests

```bash
# Verificar que todas las dependencias estén instaladas
npm run install:all

# Ejecutar tests individualmente
cd backend && npm test
cd ../frontend && npm test
```

## 🎉 ¡Proyecto Listo!

Tu proyecto ahora tiene:

✅ **Control de versiones profesional** con Git Flow
✅ **Documentación completa** y actualizada
✅ **Scripts de automatización** para desarrollo
✅ **CI/CD pipeline** con GitHub Actions
✅ **Configuración de ambientes** (dev/staging/prod)
✅ **Estructura escalable** para crecimiento futuro
✅ **Buenas prácticas** de desarrollo implementadas

### Próximos Pasos Recomendados

1. **Configurar dominio personalizado** para producción
2. **Implementar monitoreo** con herramientas como Sentry
3. **Configurar backups automáticos** de la base de datos
4. **Implementar tests de integración** más completos
5. **Configurar alertas** para el equipo de desarrollo

---

**¡Tu proyecto está listo para el desarrollo profesional! 🚀** 