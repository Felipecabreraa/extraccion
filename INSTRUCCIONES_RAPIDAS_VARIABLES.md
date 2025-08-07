# ⚡ INSTRUCCIONES RÁPIDAS - Variables de Entorno

## 🚀 Configuración Inmediata

### 1. Ejecutar Configurador
```bash
node configurar-variables-entorno.js
```

### 2. Verificar Configuración
```bash
node verificar-variables-entorno.js
```

### 3. Cambiar a Producción
```bash
./cambiar-ambiente.sh production
```

### 4. Ejecutar Proyecto
```bash
# Backend
cd backend && npm start

# Frontend (en otra terminal)
cd frontend && npm start
```

## 📋 Comandos Esenciales

### Verificar Estado Actual
```bash
./cambiar-ambiente.sh check
```

### Cambiar Ambiente
```bash
./cambiar-ambiente.sh development  # Desarrollo local
./cambiar-ambiente.sh staging      # Pruebas
./cambiar-ambiente.sh production   # Producción
```

### Probar Conexión BD
```bash
mysql -h trn.cl -P 3306 -u trn_felipe -pRioNegro2025@ trn_extraccion -e "SELECT 1"
```

## 🔧 Configuración de Base de Datos

### Producción (Confirmada)
```env
DB_HOST=trn.cl
DB_PORT=3306
DB_NAME=trn_extraccion
DB_USER=trn_felipe
DB_PASSWORD=RioNegro2025@
```

## 📁 Archivos Importantes

- `configurar-variables-entorno.js` - Configurador automático
- `verificar-variables-entorno.js` - Verificador
- `cambiar-ambiente.sh` - Cambio de ambiente
- `GUIA_VARIABLES_ENTORNO.md` - Guía completa

## 🎯 Flujo de Trabajo

1. **Desarrollo**: `./cambiar-ambiente.sh development`
2. **Pruebas**: `./cambiar-ambiente.sh staging`
3. **Producción**: `./cambiar-ambiente.sh production`

## 🔒 Seguridad

- ✅ Archivos `.env` en `.gitignore`
- ✅ Ejemplos seguros
- ✅ Validación automática
- ✅ Diferentes secretos por ambiente

## 📞 Si hay problemas

1. Verificar archivos: `ls -la backend/.env*`
2. Verificar sintaxis: `cat backend/.env`
3. Probar conexión BD: `mysql -h trn.cl -P 3306 -u trn_felipe -pRioNegro2025@ trn_extraccion -e "SELECT 1"`

---

**¡Listo para usar!** 🚀 