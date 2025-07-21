# Flujo de Trabajo con GitHub para Migración de Planillas

Este documento describe el flujo de trabajo recomendado usando GitHub para mantener un control de versiones seguro durante la migración de planillas.

## 🎯 Objetivos

- ✅ Mantener respaldo seguro en la nube
- ✅ Control de versiones de todos los cambios
- ✅ Poder revertir cambios si algo sale mal
- ✅ Colaboración segura en el equipo
- ✅ Documentación de todo el proceso

## 📋 Flujo de Trabajo Recomendado

### 1. Configuración Inicial

```bash
# Inicializar repositorio (ya hecho)
git init

# Configurar usuario
git config user.name "Tu Nombre"
git config user.emailtu.email@ejemplo.com"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/nombre-repositorio.git
```

### 2er Commit - Estado Actual

```bash
# Agregar todos los archivos (excepto los ignorados)
git add .

# Crear commit inicial
git commit -m "feat: Estado inicial del sistema antes de migración

- Sistema de planillas funcionando
- Scripts de migración creados
- Documentación completa
- Preparado para migración desde TRN"

# Subir a GitHub
git push -u origin main
```

### 3. Crear Rama de Desarrollo

```bash
# Crear y cambiar a rama de desarrollo
git checkout -b desarrollo/migracion-planillas

# Subir rama a GitHub
git push -u origin desarrollo/migracion-planillas
```

### 4. Flujo de Trabajo Durante Migración

#### Antes de Cada Cambio Importante:

```bash
# Asegurar estar en la rama correcta
git checkout desarrollo/migracion-planillas

# Actualizar desde main
git pull origin main
```

#### Después de Cada Paso de Migración:

```bash
# Ver cambios
git status

# Agregar cambios específicos
git add backend/scripts/nuevo-script.js
git add backend/src/models/cambios.js

# Commit descriptivo
git commit -m "feat: Agregar script de migración de planillas

- Script para extraer datos de TRN
- Mapeo automático de campos
- Generación de archivos Excel
- Reportes de migración

Closes #123

# Subir cambios
git push origin desarrollo/migracion-planillas
```

## 🌿 Estructura de Ramas Recomendada

```
main (rama principal - siempre estable)
├── desarrollo/migracion-planillas (rama de trabajo)
├── hotfix/correccion-urgente (correcciones críticas)
└── feature/nueva-funcionalidad (nuevas características)
```

## 📝 Convenciones de Commits

### Formato:
```
tipo(alcance): descripción breve

descripción detallada (opcional)

- Cambio 1
- Cambio 2
- Cambio 3

Closes #123
```

### Tipos de Commit:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato de código
- `refactor`: Refactorización
- `test`: Pruebas
- `chore`: Tareas de mantenimiento

### Ejemplos:

```bash
# Nueva funcionalidad
git commit -mfeat(migracion): agregar script de respaldo automático"

# Corrección
git commit -m "fix(conexion): corregir timeout en conexión TRN

# Documentación
git commit -mdocs(migracion): actualizar README con nuevos pasos"

# Refactorización
git commit -mrefactor(scripts): mejorar manejo de errores en migración
```

## 🔄 Flujo de Trabajo Diario

### Al Iniciar el Día:

```bash
# Actualizar rama principal
git checkout main
git pull origin main

# Actualizar rama de trabajo
git checkout desarrollo/migracion-planillas
git pull origin main
git push origin desarrollo/migracion-planillas
```

### Durante el Desarrollo:

```bash
# Hacer cambios en archivos
# ... trabajar en el código ...

# Verificar estado
git status

# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m feat: descripción del cambio

# Subir cambios
git push origin desarrollo/migracion-planillas
```

### Al Finalizar el Día:

```bash
# Asegurar que todo esté subido
git push origin desarrollo/migracion-planillas

# Crear tag si es un hito importante
git tag -a v1-migracion-inicial -m "Primera versión de migración completa"
git push origin v1-migracion-inicial
```

## 🛡️ Estrategia de Respaldo con Git

### 1. Commits Frecuentes

```bash
# Hacer commits pequeños y frecuentes
git add archivo-especifico.js
git commit -m "feat: agregar validación de datos"

git add otro-archivo.js
git commit -m "fix: corregir error en mapeo de campos
```

### 2. Tags para Puntos Importantes

```bash
# Antes de migración
git tag -a v10-antes-migracion -m "Estado antes de migración"

# Después de respaldo
git tag -a v10-respaldo-completo -m Respaldo completo creado"

# Después de migración exitosa
git tag -a v10-migracion-exitosa -m Migración completada exitosamente"

# Subir tags
git push origin --tags
```

### 3 Ramas de Respaldo

```bash
# Crear rama de respaldo antes de cambios importantes
git checkout -b respaldo/antes-migracion-22415t push origin respaldo/antes-migracion-2024-115# Volver a rama de trabajo
git checkout desarrollo/migracion-planillas
```

## 🔍 Comandos Útiles

### Ver Historial:

```bash
# Ver commits recientes
git log --oneline -10

# Ver cambios en un archivo
git log -p archivo.js

# Ver diferencias entre ramas
git diff main..desarrollo/migracion-planillas
```

### Revertir Cambios:

```bash
# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer último commit (eliminar cambios)
git reset --hard HEAD~1vertir a un commit específico
git revert abc1234# Volver a una rama de respaldo
git checkout respaldo/antes-migracion-2241-15``

### Limpiar:

```bash
# Ver archivos no rastreados
git clean -n

# Eliminar archivos no rastreados
git clean -f

# Eliminar directorios no rastreados
git clean -fd
```

## 📊 Pull Requests (Recomendado)

### Para Cambios Importantes:

1. **Crear Pull Request** desde `desarrollo/migracion-planillas` a `main`
2. **Revisar cambios** antes de mergear
3. **Mergear** solo cuando esté probado
4 **Eliminar rama** después del merge

### Ejemplo de Workflow:

```bash
# En GitHub: Crear Pull Request
# Revisar cambios
# Aprobar y mergear

# Localmente después del merge:
git checkout main
git pull origin main
git branch -d desarrollo/migracion-planillas
```

## 🚨 Situaciones de Emergencia

### Si Algo Sale Mal:

```bash
# 1. Crear rama de emergencia
git checkout -b hotfix/emergencia-migracion

# 2. Revertir a estado anterior
git reset --hard v10-antes-migracion

# 3. Subir cambios de emergencia
git push origin hotfix/emergencia-migracion

# 4. Crear Pull Request de emergencia
# 5rgear a main
```

### Restaurar desde GitHub:

```bash
# Clonar repositorio en nueva ubicación
git clone https://github.com/tu-usuario/nombre-repositorio.git

# Ir a commit específico
git checkout abc1234ir a tag específico
git checkout v1.0es-migracion
```

## 📋 Checklist de Seguridad

### Antes de Cada Commit:

-] Verificar que no hay datos sensibles en el commit
- [ ] Asegurar que `.env` está en `.gitignore`
- Revisar que no hay archivos de respaldo incluidos
- [ ] Mensaje de commit descriptivo

### Antes de Push:

- [ ] `git status` limpio
- ] Tests pasando (si existen)
-cumentación actualizada
- [ ] Backup local creado

### Antes de Merge a Main:

- [ ] Pull Request revisado
- [ ] Cambios probados en desarrollo
-cumentación actualizada
- [ ] Tags creados para puntos importantes

## 🎯 Beneficios de Este Flujo
1**Seguridad**: Respaldo en la nube automático2 **Trazabilidad**: Historial completo de cambios
3. **Reversibilidad**: Poder volver a cualquier punto4 **Colaboración**: Trabajo en equipo seguro
5**Documentación**: Commits como documentación6. **Confianza**: Poder experimentar sin miedo

## 📞 Soporte

Si tienes problemas con Git:

1umentación oficial**: https://git-scm.com/doc
2**GitHub Guides**: https://guides.github.com/
3. **Comandos de ayuda**: `git help <comando>`
4. **Logs detallados**: `git log --graph --oneline --all`

---

**Recuerda**: Git es tu amigo. Usa commits frecuentes y mensajes descriptivos. Nunca es tarde para empezar a usar control de versiones, pero es mejor hacerlo antes de que algo salga mal. 