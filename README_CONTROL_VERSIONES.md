# Sistema de Control de Versiones - EXTRACCION

## 🎯 Objetivo

Este documento describe cómo trabajar con Git y GitHub para mantener un control eficiente de versiones, permitiendo desarrollo paralelo, pruebas separadas y despliegues controlados a producción.

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Estructura de Ramas](#estructura-de-ramas)
3. [Flujo de Trabajo](#flujo-de-trabajo)
4. [Entornos de Desarrollo](#entornos-de-desarrollo)
5. [Comandos Útiles](#comandos-útiles)
6. [Automatización](#automatización)
7. [Buenas Prácticas](#buenas-prácticas)

## 🚀 Configuración Inicial

### 1. Configurar Git

```bash
# Verificar configuración actual
git config --global --list

# Configurar usuario (si no está configurado)
git config --global user.name "Felipecabreraa"
git config --global user.email "luislagoscabrera@gmail.com"
```

### 2. Autenticación con GitHub

#### Opción A: Token de Acceso Personal (Recomendado)

1. Ve a [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click en "Generate new token (classic)"
3. Selecciona permisos:
   - `repo` (acceso completo a repositorios)
   - `workflow` (para GitHub Actions)
4. Copia el token generado

#### Opción B: SSH Keys

```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "luislagoscabrera@gmail.com"

# Ver clave pública
cat ~/.ssh/id_ed25519.pub
```

Luego agrega la clave pública a GitHub en Settings > SSH and GPG keys.

### 3. Configurar el Proyecto

```bash
# Ejecutar script de configuración
chmod +x scripts/setup-git-workflow.sh
./scripts/setup-git-workflow.sh

# Configurar autenticación
chmod +x scripts/setup-github-auth.sh
./scripts/setup-github-auth.sh
```

## 🌿 Estructura de Ramas

```
master (main)          ← Producción (solo código estable)
├── develop            ← Integración de features
├── feature/*          ← Nuevas funcionalidades
├── hotfix/*           ← Correcciones urgentes
└── release/*          ← Preparación de releases
```

### Descripción de Ramas

- **`master`**: Código de producción, siempre estable
- **`develop`**: Integración de features, rama principal de desarrollo
- **`feature/nombre-funcionalidad`**: Desarrollo de nuevas funcionalidades
- **`hotfix/correccion-urgente`**: Correcciones críticas para producción
- **`release/v1.0.0`**: Preparación de releases

## 🔄 Flujo de Trabajo

### Desarrollo de Features

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Crear rama de feature
git checkout -b feature/mi-nueva-funcionalidad

# 3. Trabajar y hacer commits
git add .
git commit -m "feat: agregar nueva funcionalidad de planillas"

# 4. Subir rama
git push origin feature/mi-nueva-funcionalidad

# 5. Crear Pull Request en GitHub
# 6. Code review y merge a develop
```

### Release a Producción

```bash
# 1. Desde develop, crear rama de release
git checkout develop
git checkout -b release/v1.0.0

# 2. Ajustes finales (versionado, documentación)
git commit -m "chore: preparar release v1.0.0"

# 3. Merge a master
git checkout master
git merge release/v1.0.0

# 4. Crear tag
git tag -a v1.0.0 -m "Release v1.0.0 - Sistema de planillas completo"

# 5. Push a producción
git push origin master
git push origin v1.0.0

# 6. Merge release a develop
git checkout develop
git merge release/v1.0.0
git push origin develop
```

### Hotfix (Corrección Urgente)

```bash
# 1. Desde master, crear rama de hotfix
git checkout master
git checkout -b hotfix/correccion-critica

# 2. Corregir el problema
git commit -m "fix: corrección crítica en autenticación"

# 3. Merge a master y develop
git checkout master
git merge hotfix/correccion-critica
git tag -a v1.0.1 -m "Hotfix v1.0.1"

git checkout develop
git merge hotfix/correccion-critica

# 4. Push
git push origin master
git push origin v1.0.1
git push origin develop
```

## 🏗️ Entornos de Desarrollo

### Configuración de Entornos

```bash
# Configurar todos los entornos
chmod +x scripts/manage-environments.sh
./scripts/manage-environments.sh setup
```

### Iniciar Entornos

```bash
# Desarrollo (frontend + backend)
./scripts/manage-environments.sh dev

# Staging (solo backend)
./scripts/manage-environments.sh staging

# Producción (build + backend)
./scripts/manage-environments.sh prod
```

### Variables de Entorno

- **Desarrollo**: `backend/.env.development`
- **Staging**: `backend/.env.staging`
- **Producción**: `backend/.env.production`

## 🛠️ Comandos Útiles

### Ver Estado del Repositorio

```bash
# Estado actual
git status

# Historial de commits
git log --oneline -10

# Ver todas las ramas
git branch -a

# Ver diferencias
git diff
```

### Deshacer Cambios

```bash
# Descartar cambios en archivo específico
git checkout -- archivo.js

# Descartar todos los cambios
git checkout -- .

# Revertir último commit (mantiene historial)
git revert HEAD

# Resetear a commit anterior (cuidado: pierde historial)
git reset --hard HEAD~1

# Resetear a commit específico
git reset --hard abc1234
```

### Trabajar con Ramas

```bash
# Ver todas las ramas
git branch -a

# Cambiar de rama
git checkout nombre-rama

# Crear y cambiar a nueva rama
git checkout -b nueva-rama

# Eliminar rama local
git branch -d nombre-rama

# Eliminar rama remota
git push origin --delete nombre-rama
```

### Stash (Guardar cambios temporales)

```bash
# Guardar cambios sin commit
git stash

# Ver stashes guardados
git stash list

# Aplicar último stash
git stash pop

# Aplicar stash específico
git stash apply stash@{0}
```

## 🤖 Automatización

### GitHub Actions

El proyecto incluye un workflow automático en `.github/workflows/deploy.yml` que:

- Ejecuta tests automáticamente
- Construye el proyecto
- Despliega a staging cuando se hace push a `develop`
- Despliega a producción cuando se hace push a `master`

### Hooks de Git

- **Pre-commit**: Verifica sintaxis y archivos sensibles
- **Post-merge**: Instala dependencias automáticamente

### Scripts Automatizados

```bash
# Gestión de entornos
./scripts/manage-environments.sh

# Backup de base de datos
./scripts/manage-environments.sh backup development

# Restaurar backup
./scripts/manage-environments.sh restore backups/backup_dev_20240101_120000.sql development

# Ejecutar migraciones
./scripts/manage-environments.sh migrate development

# Ejecutar tests
./scripts/manage-environments.sh test development
```

## 📝 Buenas Prácticas

### Commits

Usar prefijos descriptivos:

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Documentación
- `style:` - Formato de código
- `refactor:` - Refactorización
- `test:` - Tests
- `chore:` - Tareas de mantenimiento

Ejemplos:
```bash
git commit -m "feat: agregar sistema de carga masiva de barredores"
git commit -m "fix: corregir validación de RUT en formulario"
git commit -m "docs: actualizar README con nuevas funcionalidades"
```

### Mensajes de Commit

- Usar imperativo: "agregar" no "agregado"
- Ser específico y descriptivo
- En español para consistencia
- Máximo 50 caracteres en la primera línea

### Archivos

- Mantener `.gitignore` actualizado
- No subir archivos sensibles (`.env`, `.key`, `.pem`)
- Documentar cambios importantes
- Usar archivos de ejemplo para configuraciones

### Ramas

- Usar nombres descriptivos para features
- Mantener ramas actualizadas con develop
- Eliminar ramas después del merge
- No trabajar directamente en master

## 🚨 Manejo de Errores

### Conflictos de Merge

```bash
# Ver archivos con conflictos
git status

# Resolver conflictos manualmente
# Luego agregar archivos resueltos
git add archivo_resuelto.js

# Completar merge
git commit -m "fix: resolver conflictos de merge"
```

### Revertir Push

```bash
# Revertir último push (mantiene historial)
git revert HEAD
git push origin master

# Revertir a commit específico (cuidado: pierde historial)
git reset --hard abc1234
git push --force origin master
```

### Recuperar Archivos Eliminados

```bash
# Ver commits que modificaron un archivo
git log -- archivo_eliminado.js

# Recuperar archivo de commit específico
git checkout abc1234 -- archivo_eliminado.js
```

## 📊 Monitoreo y Métricas

### Estadísticas del Repositorio

```bash
# Ver contribuciones
git shortlog -sn

# Ver actividad por fecha
git log --pretty=format:"%ad" --date=short | sort | uniq -c

# Ver archivos más modificados
git log --pretty=format: --name-only | sort | uniq -c | sort -nr
```

### Herramientas Recomendadas

- **GitHub Desktop**: Interfaz gráfica para Git
- **SourceTree**: Cliente Git avanzado
- **GitKraken**: Cliente Git con visualización de ramas
- **VS Code**: Editor con integración Git

## 🔒 Seguridad

### Protección de Datos Sensibles

- Nunca committear archivos `.env`
- Usar variables de entorno en producción
- Rotar tokens y claves regularmente
- Usar `.gitignore` para archivos sensibles

### Acceso al Repositorio

- Configurar colaboradores con permisos apropiados
- Usar branch protection rules en GitHub
- Requerir code review para merges
- Configurar webhooks para notificaciones

## 📞 Soporte

Si tienes problemas con el control de versiones:

1. Revisa este documento
2. Consulta la documentación de Git
3. Revisa los logs de GitHub Actions
4. Contacta al equipo de desarrollo

---

**Nota**: Este sistema está diseñado para facilitar el desarrollo colaborativo y mantener la estabilidad del código en producción. Sigue las buenas prácticas para obtener los mejores resultados. 