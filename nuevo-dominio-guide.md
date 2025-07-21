# 🚀 Proyecto con Dominio Nuevo - Guía Completa

## 📋 Plan de Acción

### 1. Registrar Dominio Nuevo
**Opciones recomendadas:**
- `extraccion.cl` - $15/año
- `sistema-extraccion.cl` - $15/año
- `mineria-sistema.cl` - $15/año

### 2. Contratar VPS
**Proveedores recomendados:**
- **DigitalOcean**: $5-10/mes
- **Vultr**: $2.50-6/mes
- **Linode**: $5-10/mes

### 3. Configurar DNS
```
Tipo    Nombre    Valor
A       @         [IP-DEL-VPS]
A       www       [IP-DEL-VPS]
A       api       [IP-DEL-VPS]
A       admin     [IP-DEL-VPS]
```

### 4. URLs Finales
```
Frontend: https://extraccion.cl
API: https://api.extraccion.cl
Admin: https://admin.extraccion.cl
```

## 💰 Costos Totales

| Servicio | Costo |
|----------|-------|
| **Dominio nuevo** | $15/año |
| **VPS** | $5-10/mes |
| **SSL** | Gratis |
| **Total mensual** | $6-11 |

## 🎯 Ventajas de Dominio Nuevo

✅ **Branding limpio** - sin asociación con proyectos anteriores
✅ **SEO optimizado** - dominio específico para tu industria
✅ **Profesional** - imagen corporativa
✅ **Escalable** - crece con tu negocio
✅ **Control total** - sin dependencias externas

## 🔧 Configuración Técnica

### Paso 1: Registrar Dominio
1. Ir a NIC Chile o proveedor de dominios
2. Buscar disponibilidad del dominio
3. Registrar por 1-2 años
4. Configurar DNS

### Paso 2: Configurar VPS
```bash
# Conectar al VPS
ssh root@[IP-DEL-VPS]

# Instalar dependencias
apt update && apt upgrade -y
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# Configurar Docker
systemctl enable docker
systemctl start docker
```

### Paso 3: Desplegar Aplicación
```bash
# Clonar tu proyecto
git clone [tu-repositorio] /opt/extraccion
cd /opt/extraccion

# Configurar variables de entorno
cp env.production.example .env.production
nano .env.production

# Desplegar con Docker
docker-compose --env-file .env.production up -d --build
```

### Paso 4: Configurar SSL
```bash
# Obtener certificados SSL
certbot --nginx -d extraccion.cl -d www.extraccion.cl -d api.extraccion.cl -d admin.extraccion.cl

# Renovar automáticamente
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## 📊 Comparación de Opciones

| Aspecto | Dominio Actual (trn.cl) | Dominio Nuevo |
|---------|-------------------------|---------------|
| **Costo dominio** | $10-15/año | $15/año |
| **Branding** | Asociado a proyecto anterior | Limpio y específico |
| **SEO** | Puede tener historial | Comienza desde cero |
| **Profesionalismo** | Medio | Alto |
| **Flexibilidad** | Limitado por dominio existente | Total |

## 🚀 Próximos Pasos

1. **Elegir nombre de dominio** (ej: extraccion.cl)
2. **Verificar disponibilidad** en NIC Chile
3. **Registrar dominio** por 1-2 años
4. **Contratar VPS** en DigitalOcean
5. **Configurar DNS** en el proveedor del dominio
6. **Desplegar aplicación** en el VPS
7. **Configurar SSL** automático

## 🎯 Mi Recomendación

**Ve con dominio nuevo** porque:
- ✅ **Branding limpio** para tu proyecto
- ✅ **SEO optimizado** desde el inicio
- ✅ **Imagen profesional** independiente
- ✅ **Control total** del proyecto
- ✅ **Escalabilidad** sin limitaciones

¿Qué nombre de dominio te gustaría para tu proyecto? 