# 🐳 Guía de Despliegue con Docker

## 📋 Requisitos Previos
- VPS o servidor con Docker instalado
- Dominio configurado (opcional)
- Acceso SSH al servidor

## 🛠️ Paso 1: Preparación del Servidor

### 1.1 Instalar Docker
```bash
# Conectar al servidor via SSH
ssh usuario@tu-servidor.com

# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt update
sudo apt install docker-compose -y

# Reiniciar sesión para aplicar cambios
exit
ssh usuario@tu-servidor.com
```

### 1.2 Clonar el Proyecto
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/EXTRACCION.git
cd EXTRACCION

# Dar permisos de ejecución
chmod +x deploy.sh
```

## 🔧 Paso 2: Configuración

### 2.1 Configurar Variables de Entorno
```bash
# Editar docker-compose.yml con tus credenciales
nano docker-compose.yml
```

**Configuración recomendada:**
```yaml
version: '3.8'

services:
  mysql:
    environment:
      MYSQL_ROOT_PASSWORD: tu_password_root_seguro
      MYSQL_DATABASE: extraccion_db
      MYSQL_USER: extraccion_user
      MYSQL_PASSWORD: tu_password_mysql_seguro

  app:
    environment:
      - JWT_SECRET=tu_jwt_secret_muy_seguro_y_largo_2024
      - DB_PASSWORD=tu_password_mysql_seguro
```

### 2.2 Configurar Dominio (Opcional)
```bash
# Editar nginx.conf con tu dominio
nano nginx.conf
```

## 🚀 Paso 3: Despliegue

### 3.1 Construir y Ejecutar
```bash
# Construir imágenes y ejecutar contenedores
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Verificar que todo esté funcionando
docker-compose ps
```

### 3.2 Verificar Funcionamiento
```bash
# Verificar API
curl http://localhost:3000/api/health

# Verificar frontend
curl http://localhost:80

# Ver logs de cada servicio
docker-compose logs app
docker-compose logs mysql
docker-compose logs nginx
```

## 🔧 Paso 4: Configuración de Producción

### 4.1 Configurar SSL con Let's Encrypt
```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 4.2 Configurar Firewall
```bash
# Instalar ufw
sudo apt install ufw -y

# Configurar reglas
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📊 Comandos Útiles

### Gestión de Contenedores
```bash
# Ver contenedores activos
docker-compose ps

# Reiniciar servicios
docker-compose restart

# Detener todos los servicios
docker-compose down

# Ver logs específicos
docker-compose logs -f app
docker-compose logs -f mysql

# Actualizar aplicación
git pull
docker-compose up -d --build
```

### Backup de Base de Datos
```bash
# Crear backup
docker-compose exec mysql mysqldump -u root -p extraccion_db > backup.sql

# Restaurar backup
docker-compose exec -T mysql mysql -u root -p extraccion_db < backup.sql
```

## 🔍 Monitoreo y Mantenimiento

### 4.1 Health Checks
```bash
# Verificar estado de salud
docker-compose exec app curl -f http://localhost:3000/api/health

# Verificar logs de errores
docker-compose logs --tail=100 app | grep ERROR
```

### 4.2 Actualizaciones
```bash
# Actualizar aplicación
git pull origin main
docker-compose down
docker-compose up -d --build

# Actualizar solo frontend
docker-compose build frontend
docker-compose up -d frontend
```

## 💰 Costos Estimados
- **VPS**: $5-20/mes (DigitalOcean, Vultr, Linode)
- **Dominio**: $10-15/año
- **SSL**: Gratis (Let's Encrypt)
- **Total**: ~$15-35/mes

## 🆘 Solución de Problemas

### Problema: Contenedores no inician
```bash
# Verificar logs
docker-compose logs

# Verificar puertos
netstat -tulpn | grep :3000
netstat -tulpn | grep :80

# Reiniciar Docker
sudo systemctl restart docker
```

### Problema: Base de datos no conecta
```bash
# Verificar MySQL
docker-compose exec mysql mysql -u root -p

# Verificar variables de entorno
docker-compose exec app env | grep DB
```

### Problema: Frontend no carga
```bash
# Verificar build
docker-compose exec nginx ls -la /usr/share/nginx/html

# Reconstruir frontend
docker-compose build frontend
docker-compose up -d frontend
```

## ✅ Checklist Final
- [ ] Docker instalado y funcionando
- [ ] Proyecto clonado y configurado
- [ ] Variables de entorno configuradas
- [ ] Contenedores ejecutándose
- [ ] SSL configurado (opcional)
- [ ] Dominio configurado (opcional)
- [ ] Backup configurado
- [ ] Monitoreo activo 