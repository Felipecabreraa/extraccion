# Guía de Configuración Git y GitHub

## 1. Configuración Inicial de Git

Tu configuración actual:
- Usuario: Felipecabreraa
- Email: luislagoscabrera@gmail.com

## 2. Autenticación con GitHub

### Opción A: Token de Acceso Personal (Recomendado)

1. Ve a GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos:
   - repo (acceso completo a repositorios)
   - workflow (para GitHub Actions)
3. Copia el token generado

### Opción B: SSH Keys (Alternativa)

1. Generar clave SSH:
   ```bash
   ssh-keygen -t ed25519 -C "luislagoscabrera@gmail.com"
   ```

2. Agregar la clave pública a GitHub:
   - Settings → SSH and GPG keys → New SSH key

## 3. Flujo de Trabajo con Ramas

### Estructura de Ramas Recomendada:

```
master (main)          ← Producción
├── develop            ← Desarrollo/Integración
├── feature/nueva-funcionalidad
├── hotfix/correccion-urgente
└── release/v1.0.0
```

### Comandos para Crear el Flujo:

```bash
# Crear rama de desarrollo
git checkout -b develop

# Crear rama para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# Crear rama para correcciones urgentes
git checkout -b hotfix/correccion-urgente
```

## 4. Primer Commit y Push

```bash
# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "feat: Inicialización del proyecto EXTRACCION

- Backend con Node.js y Express
- Frontend con React
- Sistema de planillas y barredores
- Configuración de base de datos
- Documentación completa"

# Crear repositorio en GitHub (desde la web)
# Luego conectar el repositorio local
git remote add origin https://github.com/Felipecabreraa/EXTRACCION.git

# Subir a GitHub
git push -u origin master
```

## 5. Workflow de Desarrollo

### Para Desarrollo Diario:

```bash
# 1. Actualizar rama develop
git checkout develop
git pull origin develop

# 2. Crear rama para nueva funcionalidad
git checkout -b feature/mi-nueva-funcionalidad

# 3. Trabajar y hacer commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 4. Subir rama de feature
git push origin feature/mi-nueva-funcionalidad

# 5. Crear Pull Request en GitHub
# 6. Merge a develop después de revisión
```

### Para Producción:

```bash
# 1. Desde develop, crear rama de release
git checkout develop
git checkout -b release/v1.0.0

# 2. Hacer ajustes finales
git commit -m "chore: preparar release v1.0.0"

# 3. Merge a master
git checkout master
git merge release/v1.0.0

# 4. Crear tag
git tag -a v1.0.0 -m "Release v1.0.0"

# 5. Push a producción
git push origin master
git push origin v1.0.0
```

## 6. Comandos Útiles

### Ver Estado del Repositorio:
```bash
git status
git log --oneline -10
git branch -a
```

### Deshacer Cambios:
```bash
# Descartar cambios en archivo específico
git checkout -- archivo.js

# Descartar todos los cambios
git checkout -- .

# Revertir último commit (mantiene historial)
git revert HEAD

# Resetear a commit anterior (cuidado: pierde historial)
git reset --hard HEAD~1
```

### Trabajar con Ramas:
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

## 7. Configuración de Entornos

### Variables de Entorno:
- `.env.development` - Para desarrollo local
- `.env.staging` - Para pruebas
- `.env.production` - Para producción

### Scripts de Package.json:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development npm start",
    "staging": "NODE_ENV=staging npm start",
    "prod": "NODE_ENV=production npm start"
  }
}
```

## 8. GitHub Actions (CI/CD)

Crear `.github/workflows/deploy.yml` para automatizar:
- Tests automáticos
- Build del proyecto
- Deploy a staging/producción

## 9. Buenas Prácticas

### Commits:
- Usar prefijos: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Mensajes descriptivos y en español
- Un commit por funcionalidad

### Ramas:
- `master/main`: Solo código de producción
- `develop`: Integración de features
- `feature/*`: Nuevas funcionalidades
- `hotfix/*`: Correcciones urgentes
- `release/*`: Preparación de releases

### Archivos:
- Mantener `.gitignore` actualizado
- No subir archivos sensibles (contraseñas, keys)
- Documentar cambios importantes 