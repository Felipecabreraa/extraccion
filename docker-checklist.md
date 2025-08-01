# ✅ Checklist Docker - Despliegue

## 📋 Preparación
- [ ] VPS o servidor con Docker instalado
- [ ] Dominio configurado (opcional)
- [ ] Acceso SSH al servidor

## 🐳 En el Servidor
- [ ] Instalar Docker: `curl -fsSL https://get.docker.com | sh`
- [ ] Instalar Docker Compose: `sudo apt install docker-compose`
- [ ] Clonar repositorio: `git clone tu-repo`
- [ ] Navegar al directorio: `cd extraccion`

## 🔧 Configurar Variables
- [ ] Editar `docker-compose.yml` con credenciales
- [ ] Configurar variables de entorno
- [ ] Generar JWT_SECRET seguro

## 🚀 Despliegue
```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

## 🔗 Configurar Nginx (Opcional)
- [ ] Instalar Nginx: `sudo apt install nginx`
- [ ] Configurar proxy reverso
- [ ] Configurar SSL con Let's Encrypt
- [ ] Configurar dominio

## 💰 Costos
- [ ] VPS: $5-20/mes (DigitalOcean, Vultr, etc.)
- [ ] Dominio: $10-15/año
- [ ] SSL: Gratis (Let's Encrypt)

## 🔧 Variables de Entorno en Docker
```env
NODE_ENV=production
DB_HOST=mysql
DB_USER=extraccion_user
DB_PASSWORD=extraccion_pass
DB_NAME=extraccion_db
DB_PORT=3306
JWT_SECRET=tu_jwt_secret_muy_seguro
PORT=3000
``` 