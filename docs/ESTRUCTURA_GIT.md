# Estructura Git y Flujo de Trabajo

## 📋 Resumen

Este documento describe la estructura Git recomendada para el proyecto de Extracción, incluyendo el flujo de trabajo, ramas y estrategias de versionado.

## 🌿 Estructura de Ramas

### Ramas Principales

#### `main` (o `master`)
- **Propósito**: Código de producción estable
- **Protección**: Requiere Pull Request y reviews
- **Deploy**: Automático a producción
- **Merge**: Solo desde `develop` o hotfixes

#### `develop`
- **Propósito**: Integración de features para próxima release
- **Protección**: Requiere Pull Request
- **Deploy**: Automático a staging
- **Merge**: Desde feature branches

### Ramas de Soporte

#### `feature/nombre-feature`
- **Propósito**: Desarrollo de nuevas funcionalidades
- **Origen**: `develop`
- **Destino**: `develop`
- **Nomenclatura**: `feature/dashboard-graficos`, `feature/autenticacion-jwt`

#### `hotfix/nombre-hotfix`
- **Propósito**: Correcciones urgentes de producción
- **Origen**: `main`
- **Destino**: `main` y `develop`
- **Nomenclatura**: `hotfix/fix-login-error`, `hotfix/security-patch`

#### `release/version-x.x.x`
- **Propósito**: Preparación de releases
- **Origen**: `develop`
- **Destino**: `main` y `develop`
- **Nomenclatura**: `release/v1.2.0`, `release/v2.0.0`

## 🔄 Flujo de Trabajo (Git Flow)

### 1. Desarrollo de Features

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear feature branch
git checkout -b feature/nueva-funcionalidad

# 3. Desarrollar y hacer commits
git add .
git commit -m "feat: agregar nueva funcionalidad de dashboard"

# 4. Push y crear Pull Request
git push origin feature/nueva-funcionalidad
```

### 2. Integración de Features

```bash
# 1. Merge a develop via Pull Request
# 2. Actualizar develop local
git checkout develop
git pull origin develop

# 3. Eliminar feature branch
git branch -d feature/nueva-funcionalidad
git push origin --delete feature/nueva-funcionalidad
```

### 3. Preparación de Release

```bash
# 1. Crear release branch
git checkout develop
git checkout -b release/v1.2.0

# 2. Ajustar versiones y documentación
# - Actualizar package.json
# - Actualizar CHANGELOG.md
# - Ajustar configuraciones

# 3. Commit de release
git add .
git commit -m "chore: preparar release v1.2.0"

# 4. Merge a main y develop
git checkout main
git merge release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"

git checkout develop
git merge release/v1.2.0

# 5. Eliminar release branch
git branch -d release/v1.2.0
```

### 4. Hotfixes

```bash
# 1. Crear hotfix branch desde main
git checkout main
git checkout -b hotfix/fix-critical-bug

# 2. Aplicar corrección
git add .
git commit -m "fix: corregir error crítico de autenticación"

# 3. Merge a main y develop
git checkout main
git merge hotfix/fix-critical-bug
git tag -a v1.2.1 -m "Hotfix v1.2.1"

git checkout develop
git merge hotfix/fix-critical-bug

# 4. Eliminar hotfix branch
git branch -d hotfix/fix-critical-bug
```

## 📝 Convenciones de Commits

### Formato
```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[pie opcional]
```

### Tipos de Commit
- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Documentación
- **style**: Formato, punto y coma faltantes, etc.
- **refactor**: Refactorización de código
- **test**: Agregar o corregir tests
- **chore**: Tareas de construcción, configuraciones, etc.

### Ejemplos
```bash
git commit -m "feat(dashboard): agregar gráfico de estadísticas por zona"
git commit -m "fix(auth): corregir validación de token JWT"
git commit -m "docs(readme): actualizar instrucciones de instalación"
git commit -m "refactor(api): optimizar consultas de base de datos"
git commit -m "test(controllers): agregar tests para authController"
git commit -m "chore(deps): actualizar dependencias de seguridad"
```

## 🏷️ Versionado Semántico

### Formato: `MAJOR.MINOR.PATCH`

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nuevas funcionalidades compatibles hacia atrás
- **PATCH**: Correcciones de bugs compatibles hacia atrás

### Ejemplos
- `1.0.0` - Primera versión estable
- `1.1.0` - Nueva funcionalidad agregada
- `1.1.1` - Bug fix
- `2.0.0` - Cambio mayor (breaking changes)

## 🔧 Configuración Git

### .gitignore
```bash
# Verificar que .gitignore esté configurado correctamente
git status --ignored
```

### Hooks de Git
```bash
# Instalar hooks de pre-commit (opcional)
npm install --save-dev husky lint-staged
```

### Configuración de Usuario
```bash
git config user.name "Tu Nombre"
git config user.email "tu.email@ejemplo.com"
```

## 🚀 Automatización CI/CD

### GitHub Actions (ejemplo)
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm run install:all
      - name: Run tests
        run: npm run test
      - name: Run linting
        run: npm run lint
```

## 📋 Checklist de Release

### Antes del Release
- [ ] Todos los tests pasan
- [ ] Linting sin errores
- [ ] Documentación actualizada
- [ ] CHANGELOG.md actualizado
- [ ] Versionado actualizado en package.json
- [ ] Variables de entorno documentadas

### Durante el Release
- [ ] Crear release branch
- [ ] Ejecutar tests de integración
- [ ] Verificar build de producción
- [ ] Merge a main
- [ ] Crear tag
- [ ] Merge a develop

### Después del Release
- [ ] Deploy automático a producción
- [ ] Verificar funcionamiento en producción
- [ ] Notificar al equipo
- [ ] Actualizar documentación de despliegue

## 🛠️ Comandos Útiles

### Verificar Estado
```bash
# Ver ramas
git branch -a

# Ver commits recientes
git log --oneline -10

# Ver diferencias
git diff develop

# Ver archivos modificados
git status
```

### Limpieza
```bash
# Eliminar ramas locales obsoletas
git remote prune origin

# Limpiar archivos no trackeados
git clean -fd

# Reset hard (cuidado)
git reset --hard HEAD
```

### Backup y Recuperación
```bash
# Crear backup de rama
git branch backup/feature-importante

# Recuperar commit específico
git checkout <commit-hash>

# Crear stash
git stash push -m "trabajo en progreso"
git stash pop
```

## 🔍 Troubleshooting

### Problemas Comunes

#### Merge Conflicts
```bash
# Ver archivos con conflictos
git status

# Resolver conflictos manualmente
# Luego:
git add .
git commit -m "resolve merge conflicts"
```

#### Reset de Rama
```bash
# Reset suave (mantiene cambios)
git reset --soft HEAD~1

# Reset duro (pierde cambios)
git reset --hard HEAD~1
```

#### Recuperar Archivo Eliminado
```bash
# Ver commits que modificaron el archivo
git log --oneline -- archivo-eliminado.js

# Recuperar desde commit específico
git checkout <commit-hash> -- archivo-eliminado.js
```

## 📚 Recursos Adicionales

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/) 