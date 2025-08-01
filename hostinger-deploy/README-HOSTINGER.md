# Despliegue en Hostinger

## Pasos para desplegar:

1. **Subir archivos:**
   - Sube TODOS los archivos de esta carpeta a tu hosting de Hostinger
   - Asegúrate de que estén en la carpeta raíz (public_html o similar)

2. **Configurar variables de entorno:**
   - Copia el archivo .env.example a .env
   - Edita .env con tus datos reales de base de datos

3. **Instalar dependencias:**
   - En el panel de Hostinger, ejecuta: npm install

4. **Configurar base de datos:**
   - Crea una base de datos MySQL en Hostinger
   - Actualiza las credenciales en .env

5. **Iniciar la aplicación:**
   - En el panel de Hostinger, ejecuta: npm start

## Estructura de archivos:
- /src - Código del backend
- /public - Archivos del frontend (React build)
- package.json - Dependencias de Node.js
- Procfile - Configuración para Hostinger
- .env - Variables de entorno (crear desde .env.example)

## URLs importantes:
- Frontend: https://tudominio.com
- API: https://tudominio.com/api
- Health check: https://tudominio.com/api/health