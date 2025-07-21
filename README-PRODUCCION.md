# 🚀 Guía de Despliegue a Producción - Sistema de Extracción

Esta guía te ayudará a desplegar tu sistema de extracción en un entorno de producción de manera segura y escalable.

## 📋 Prerrequisitos

### Software Requerido
- **Docker** (versión 20.10 o superior)
- **Docker Compose** (versión 2.0 o superior)
- **Git** (para clonar el repositorio)
- **Dominio** (para SSL/HTTPS)

### Recursos del Servidor
- **CPU**: Mínimo 2 cores, recomendado 4 cores
- **RAM**: Mínimo 4GB, recomendado 8GB
- **Almacenamiento**: Mínimo 20GB SSD
- **Sistema Operativo**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

## 🔧 Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone <tu-repositorio>
cd EXTRACCION
```

### 2. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp env.production.example .env.production

# Editar las variables según tu entorno
nano .env.production
```

### 3. Variables de Entorno Importantes

#### Base de Datos
```bash
DB_HOST=mysql
DB_PORT=3306
DB_NAME=extraccion_prod
DB_USER=extraccion_user
DB_PASSWORD=TuPasswordSuperSeguro123!
DB_ROOT_PASSWORD=RootPasswordSuperSeguro456!
```

#### Seguridad
```bash
JWT_SECRET=TuJWTSecretSuperSeguroParaProduccion789!@#$%^&*()
SESSION_SECRET=TuSessionSecretSuperSeguroParaProduccion
BCRYPT_ROUNDS=12
```

#### URLs
```bash
FRONTEND_URL=https://tu-dominio.com
REACT_APP_API_URL=https://tu-dominio.com/api
```

## 🚀 Despliegue

### Despliegue Automático
```bash
# Dar permisos de ejecución al script
chmod +x deploy.sh

# Ejecutar despliegue
./deploy.sh production
```

### Despliegue Manual
```bash
# 1. Crear directorios necesarios
mkdir -p backend/logs nginx/logs nginx/ssl

# 2. Construir y levantar servicios
docker-compose --env-file .env.production up -d --build

# 3. Verificar estado
docker-compose ps
```

## 🔒 Configuración de SSL/HTTPS

### Opción 1: Let's Encrypt (Gratuito)
```bash
# Instalar Certbot
sudo apt update
sudo apt install certbot

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com -d www.tu-dominio.com

# Copiar certificados a Nginx
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem nginx/ssl/key.pem
```

### Opción 2: Certificado Comercial
1. Comprar certificado SSL
2. Copiar archivos a `nginx/ssl/`
3. Renombrar como `cert.pem` y `key.pem`

## 📊 Monitoreo y Logs

### Ver Logs en Tiempo Real
```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Health Checks
```bash
# Backend
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:80/health

# Base de datos
docker exec extraccion_mysql mysqladmin ping -h localhost
```

## 🔄 Backup y Restauración

### Backup Automático de Base de Datos
```bash
# Crear script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec extraccion_mysql mysqldump -u root -p"$DB_ROOT_PASSWORD" "$DB_NAME" > "backup_${DATE}.sql"
gzip "backup_${DATE}.sql"
# Eliminar backups antiguos (más de 30 días)
find . -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Agregar al crontab (backup diario a las 2 AM)
echo "0 2 * * * /ruta/completa/a/backup.sh" | crontab -
```

### Restaurar Base de Datos
```bash
# Descomprimir backup
gunzip backup_20241201_020000.sql.gz

# Restaurar
docker exec -i extraccion_mysql mysql -u root -p"$DB_ROOT_PASSWORD" "$DB_NAME" < backup_20241201_020000.sql
```

## 🔧 Mantenimiento

### Actualizar el Sistema
```bash
# 1. Hacer backup
./backup.sh

# 2. Obtener cambios del repositorio
git pull origin main

# 3. Reconstruir y reiniciar
docker-compose down
docker-compose --env-file .env.production up -d --build

# 4. Verificar funcionamiento
./deploy.sh production
```

### Limpiar Recursos
```bash
# Limpiar imágenes no utilizadas
docker image prune -f

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar volúmenes no utilizados
docker volume prune -f
```

## 🛡️ Seguridad

### Firewall
```bash
# Configurar UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Actualizaciones de Seguridad
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Actualizar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io
```

## 📈 Escalabilidad

### Escalar Servicios
```bash
# Escalar backend a 3 instancias
docker-compose up -d --scale backend=3

# Escalar frontend a 2 instancias
docker-compose up -d --scale frontend=2
```

### Load Balancer (Opcional)
Para mayor escalabilidad, considera usar:
- **Nginx Plus**
- **HAProxy**
- **Traefik**

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Servicios no inician
```bash
# Verificar logs
docker-compose logs [servicio]

# Verificar variables de entorno
docker-compose config
```

#### 2. Problemas de conectividad de base de datos
```bash
# Verificar red Docker
docker network ls
docker network inspect extraccion_extraccion_network

# Verificar conectividad
docker exec extraccion_backend ping mysql
```

#### 3. Problemas de memoria
```bash
# Verificar uso de recursos
docker stats

# Ajustar límites en docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

## 📞 Soporte

### Información de Contacto
- **Email**: soporte@tu-empresa.com
- **Teléfono**: +XX XXX XXX XXXX
- **Documentación**: [URL de documentación]

### Logs Importantes
- **Backend**: `backend/logs/`
- **Nginx**: `nginx/logs/`
- **Docker**: `docker-compose logs`

## 📝 Checklist de Producción

- [ ] Variables de entorno configuradas
- [ ] SSL/HTTPS configurado
- [ ] Backup automático configurado
- [ ] Firewall configurado
- [ ] Monitoreo configurado
- [ ] Logs configurados
- [ ] Tests ejecutados
- [ ] Documentación actualizada
- [ ] Equipo notificado del despliegue

---

**¡Tu sistema está listo para producción! 🎉**

Recuerda revisar regularmente los logs y realizar mantenimiento preventivo. 