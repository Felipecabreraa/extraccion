# 🚀 Despliegue en Heroku

## Prerrequisitos
- Cuenta en Heroku (gratis)
- Git instalado
- Heroku CLI instalado

## Pasos de Despliegue

### 1. Instalar Heroku CLI
```bash
# Windows
winget install --id=Heroku.HerokuCLI

# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Login en Heroku
```bash
heroku login
```

### 3. Crear aplicación en Heroku
```bash
heroku create tu-app-extraccion
```

### 4. Agregar base de datos MySQL
```bash
heroku addons:create jawsdb:kitefin
```

### 5. Configurar variables de entorno
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=TuJWTSecretSuperSeguro
heroku config:set BCRYPT_ROUNDS=12
heroku config:set FRONTEND_URL=https://tu-app-extraccion.herokuapp.com
```

### 6. Desplegar
```bash
git add .
git commit -m "Preparar para Heroku"
git push heroku main
```

### 7. Ejecutar migraciones
```bash
heroku run npm run migrate
```

## Ventajas de Heroku
- ✅ Despliegue automático desde GitHub
- ✅ Base de datos MySQL incluida
- ✅ SSL gratuito
- ✅ Escalado automático
- ✅ Monitoreo integrado
- ✅ Logs en tiempo real

## Costos
- **Hobby Dyno**: $7/mes
- **MySQL**: $10/mes
- **Total**: ~$17/mes 