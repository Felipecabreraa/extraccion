# Banner de Ambiente

Este componente muestra un banner visual para diferenciar entre diferentes ambientes de la aplicación.

## Características

- ✅ Banner pequeño y discreto en la esquina superior derecha
- ✅ Color naranja para ambientes de prueba
- ✅ Solo se muestra cuando estás conectado a la base de datos `trn_extraccion_test`
- ✅ No aparece en producción
- ✅ Compatible con múltiples configuraciones de ambiente
- ✅ Múltiples estilos disponibles: Chip, Alert, Dot

## Ambientes Soportados

| Ambiente | Banner | Condición |
|----------|--------|-----------|
| `test` | "PRUEBA" | Solo si conectado a `trn_extraccion_test` |
| `staging` | "PRUEBA" | Solo si conectado a base de datos de prueba |
| `development` | "PRUEBA" | Solo si conectado a base de datos de prueba |
| `production` | No se muestra | Nunca |

## Cómo Usar

### 1. Cambiar Ambiente Manualmente

```bash
# Cambiar a ambiente de prueba (conectado a trn_extraccion_test)
node scripts/switch-environment.js test

# Cambiar a ambiente de staging
node scripts/switch-environment.js staging

# Cambiar a desarrollo
node scripts/switch-environment.js development

# Cambiar a producción (no mostrará banner)
node scripts/switch-environment.js production

# Verificar ambiente actual
node scripts/check-environment.js
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en el directorio `frontend/` con:

```bash
# Para prueba (conectado a trn_extraccion_test)
REACT_APP_ENV=test
REACT_APP_API_URL=https://backend-test.up.railway.app/api
REACT_APP_DB_NAME=trn_extraccion_test

# Para staging (conectado a base de datos de prueba)
REACT_APP_ENV=staging
REACT_APP_API_URL=https://backend-staging.up.railway.app/api
REACT_APP_DB_NAME=trn_extraccion_staging

# Para desarrollo (conectado a base de datos de prueba)
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_DB_NAME=trn_extraccion_dev

# Para producción (no mostrará banner)
REACT_APP_ENV=production
REACT_APP_API_URL=https://tu-backend-produccion.com/api
REACT_APP_DB_NAME=trn_extraccion_prod
```

### 3. Reiniciar el Servidor

Después de cambiar el ambiente, reinicia el servidor de desarrollo:

```bash
npm start
```

## Personalización

### Cambiar Colores

Edita el archivo `src/components/EnvironmentBanner.jsx`:

```javascript
const getEnvironmentInfo = () => {
  switch (environment) {
    case 'development':
      return {
        title: 'AMBIENTE DE DESARROLLO',
        severity: 'warning',
        color: '#ff9800' // Cambia este color
      };
    // ... otros casos
  }
};
```

### Cambiar Posición

Modifica los estilos en `EnvironmentBanner.jsx`:

```javascript
const StyledAlert = styled(Alert)(({ theme }) => ({
  position: 'fixed',
  top: '10px',        // Cambia la posición vertical
  right: '10px',      // Cambia la posición horizontal
  // ... otros estilos
}));
```

## Archivos Relacionados

- `src/components/EnvironmentBanner.jsx` - Componente principal
- `src/App.js` - Integración del banner
- `scripts/switch-environment.js` - Script para cambiar ambientes
- `env.development` - Configuración de desarrollo
- `env.staging` - Configuración de staging
- `env.test` - Configuración de prueba
- `env.production.example` - Configuración de producción

## Notas Importantes

1. **El banner solo se muestra cuando estás conectado a la base de datos `trn_extraccion_test`**
2. **Es compatible con `REACT_APP_ENV` y `REACT_APP_ENVIRONMENT`**
3. **Se posiciona de forma fija en la esquina superior derecha**
4. **Es pequeño y discreto para no molestar**
5. **No aparece en producción** 