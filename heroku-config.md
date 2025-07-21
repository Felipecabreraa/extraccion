# 🔧 Configuración Heroku sin Dominio Propio

## Variables de Entorno para Heroku

```bash
# Obtener la URL automática de Heroku
heroku info --shell

# Configurar variables usando la URL automática
heroku config:set FRONTEND_URL=https://tu-app-extraccion.herokuapp.com
heroku config:set REACT_APP_API_URL=https://tu-app-extraccion.herokuapp.com/api
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=TuJWTSecretSuperSeguroParaProduccion789!@#$%^&*()
heroku config:set BCRYPT_ROUNDS=12
```

## URLs Automáticas

### Antes del Despliegue:
```
Frontend: http://localhost:3000
Backend: http://localhost:3001
```

### Después del Despliegue:
```
Frontend: https://tu-app-extraccion.herokuapp.com
Backend: https://tu-app-extraccion.herokuapp.com/api
```

## Configuración de CORS

En tu backend, configurar CORS para aceptar la URL de Heroku:

```javascript
// En backend/src/app.js
app.use(cors({
  origin: [
    'https://tu-app-extraccion.herokuapp.com',
    'http://localhost:3000' // Para desarrollo
  ],
  credentials: true
}));
```

## Ventajas de la URL Automática

✅ **SSL automático** - https:// incluido
✅ **CDN global** - Carga rápida desde cualquier lugar
✅ **Monitoreo incluido** - Logs y métricas
✅ **Escalado automático** - Se adapta al tráfico
✅ **Backup automático** - Base de datos respaldada 