# 📋 Lista Completa de Archivos para Hostinger

## 🎯 **PASO A PASO: Preparar y Subir Archivos**

### **Paso 1: Ejecutar Script de Preparación**

```bash
# En la raíz de tu proyecto
chmod +x preparar-archivos-hosting.sh
./preparar-archivos-hosting.sh
```

### **Paso 2: Archivos que se Crearán**

El script creará una carpeta `hosting-files/` con esta estructura:

```
hosting-files/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Todos los controladores
│   │   ├── models/              # Todos los modelos
│   │   ├── routes/              # Todas las rutas
│   │   ├── middlewares/         # Middlewares de auth
│   │   ├── config/              # Configuración DB
│   │   ├── utils/               # Utilidades
│   │   └── app.js               # Archivo principal
│   ├── migrations/              # Migraciones de DB
│   ├── uploads/                 # Carpeta para uploads
│   ├── logs/                    # Carpeta para logs
│   └── package.json             # Dependencias backend
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   ├── pages/               # Páginas principales
│   │   ├── api/                 # Configuración API
│   │   ├── utils/               # Utilidades frontend
│   │   ├── config/              # Configuración
│   │   ├── context/             # Contextos React
│   │   ├── assets/              # Imágenes y assets
│   │   └── App.js               # Componente principal
│   ├── public/                  # Archivos públicos
│   ├── build/                   # Carpeta para build
│   └── package.json             # Dependencias frontend
├── logs/                        # Logs del sistema
├── ecosystem.config.js           # Configuración PM2
├── deploy.sh                    # Script de despliegue
├── setup-hostinger.sh           # Script de configuración
├── nginx.conf                   # Configuración Nginx
├── .htaccess                    # Headers de seguridad
├── start-app.sh                 # Script de inicio
├── backup-db.sh                 # Script de backup
├── package.json                 # Dependencias principales
└── README-HOSTING.md            # Guía de despliegue
```

### **Paso 3: Archivo Comprimido**

El script también creará:
- `extraccion-hosting.tar.gz` (~8MB)

## 📁 **ARCHIVOS ESPECÍFICOS INCLUIDOS**

### **Backend (src/)**
```
backend/src/
├── app.js                           # Servidor principal
├── controllers/
│   ├── authController.js            # Autenticación
│   ├── barredorController.js        # Gestión barredores
│   ├── dashboardController.js       # Dashboard
│   ├── danoController.js           # Gestión daños
│   ├── maquinaController.js        # Gestión máquinas
│   ├── operadorController.js       # Gestión operadores
│   ├── planillaController.js       # Gestión planillas
│   ├── sectorController.js         # Gestión sectores
│   ├── usuarioController.js        # Gestión usuarios
│   └── zonaController.js           # Gestión zonas
├── models/
│   ├── barredor.js                 # Modelo barredor
│   ├── dano.js                     # Modelo daño
│   ├── maquina.js                  # Modelo máquina
│   ├── operador.js                 # Modelo operador
│   ├── planilla.js                 # Modelo planilla
│   ├── sector.js                   # Modelo sector
│   ├── usuario.js                  # Modelo usuario
│   └── zona.js                     # Modelo zona
├── routes/
│   ├── authRoutes.js               # Rutas de auth
│   ├── barredorRoutes.js           # Rutas barredores
│   ├── dashboardRoutes.js          # Rutas dashboard
│   ├── danoRoutes.js              # Rutas daños
│   ├── maquinaRoutes.js           # Rutas máquinas
│   ├── operadorRoutes.js          # Rutas operadores
│   ├── planillaRoutes.js          # Rutas planillas
│   ├── sectorRoutes.js            # Rutas sectores
│   ├── usuarioRoutes.js           # Rutas usuarios
│   └── zonaRoutes.js              # Rutas zonas
├── middlewares/
│   ├── authMiddleware.js           # Middleware auth
│   ├── errorMiddleware.js          # Middleware errores
│   └── validationMiddleware.js     # Middleware validación
├── config/
│   ├── config.js                   # Configuración general
│   └── database.js                 # Configuración DB
└── utils/
    └── logger.js                   # Sistema de logs
```

### **Frontend (src/)**
```
frontend/src/
├── App.js                          # Componente principal
├── index.js                        # Punto de entrada
├── index.css                       # Estilos globales
├── App.css                         # Estilos del app
├── theme.js                        # Configuración tema
├── components/
│   ├── AlertasInteligentes.jsx     # Componente alertas
│   ├── AnalisisPredictivo.jsx      # Análisis predictivo
│   ├── BarChartKPI.jsx            # Gráfico de barras
│   ├── Dashboard.jsx               # Dashboard principal
│   ├── DonutChart.jsx              # Gráfico donut
│   ├── GraficosPorZona.jsx         # Gráficos por zona
│   ├── HeatmapChart.jsx            # Mapa de calor
│   ├── LineChart.jsx               # Gráfico de líneas
│   ├── Login.jsx                   # Página de login
│   ├── Navbar.jsx                  # Navegación
│   ├── ReporteDanos.jsx            # Reporte daños
│   ├── Sidebar.jsx                 # Barra lateral
│   └── [otros componentes...]
├── pages/
│   ├── Barredores.jsx              # Página barredores
│   ├── BulkUpload.jsx              # Carga masiva
│   ├── Danos.jsx                   # Página daños
│   ├── Dashboard.jsx               # Página dashboard
│   ├── Maquinas.jsx                # Página máquinas
│   ├── Operadores.jsx              # Página operadores
│   ├── Planillas.jsx               # Página planillas
│   ├── Sectores.jsx                # Página sectores
│   ├── Usuarios.jsx                # Página usuarios
│   └── Zonas.jsx                   # Página zonas
├── api/
│   ├── axios.js                    # Configuración axios
│   └── [archivos de API...]
├── utils/
│   ├── dataTransformers.js         # Transformadores
│   └── [utilidades...]
├── config/
│   ├── routerConfig.js             # Configuración router
│   └── routes.js                   # Definición rutas
├── context/
│   ├── AuthContext.jsx             # Contexto auth
│   └── ResponsiveContext.jsx       # Contexto responsive
└── assets/
    └── logo-rionegro.png           # Logo
```

### **Archivos de Configuración**
```
├── package.json                    # Dependencias principales
├── ecosystem.config.js             # Configuración PM2
├── deploy.sh                       # Script despliegue
├── setup-hostinger.sh              # Script configuración
├── nginx.conf                      # Configuración Nginx
├── .htaccess                       # Headers seguridad
├── start-app.sh                    # Script inicio
├── backup-db.sh                    # Script backup
├── backend/
│   ├── package.json                # Dependencias backend
│   └── env.production.example      # Variables entorno
└── frontend/
    ├── package.json                # Dependencias frontend
    ├── tailwind.config.js          # Configuración Tailwind
    ├── postcss.config.js           # Configuración PostCSS
    ├── nginx.conf                  # Configuración Nginx frontend
    └── Dockerfile                  # Docker frontend
```

## 🚨 **ARCHIVOS EXCLUIDOS (No necesarios en producción)**

### **❌ No se Incluyen:**
- `node_modules/` (se instalan en el servidor)
- Archivos de desarrollo (`*.dev.js`, `*.test.js`)
- Archivos de documentación (`*.md`)
- Archivos temporales (`*.tmp`, `*.log`)
- Archivos de configuración local (`.env`)
- Archivos de Git (`.git/`)
- Archivos de IDE (`.vscode/`, `.idea/`)
- Archivos de sistema (`.DS_Store`, `Thumbs.db`)

## 📊 **TAMAÑO ESTIMADO**

| Componente | Tamaño |
|------------|--------|
| Backend (código) | ~2MB |
| Frontend (código) | ~5MB |
| Configuración | ~1MB |
| **Total** | **~8MB** |

## 🚀 **PASOS PARA SUBIR A HOSTINGER**

### **1. Preparar Archivos**
```bash
./preparar-archivos-hosting.sh
```

### **2. Subir a Hostinger**
- **Método A**: Subir `extraccion-hosting.tar.gz` y extraer
- **Método B**: Subir carpeta `hosting-files/` completa

### **3. En Hostinger (via SSH)**
```bash
# Extraer archivos
tar -xzf extraccion-hosting.tar.gz

# Instalar dependencias
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Construir frontend
cd frontend && npm run build && cd ..

# Configurar variables de entorno
cp backend/env.production.example backend/.env
nano backend/.env  # Editar con credenciales reales

# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## ✅ **VERIFICACIÓN FINAL**

### **Comandos de Verificación:**
```bash
# Verificar estado
pm2 status

# Ver logs
pm2 logs extraccion-backend

# Verificar puertos
netstat -tlnp | grep :3000

# Verificar archivos
ls -la
ls -la backend/src/
ls -la frontend/src/
```

### **URLs de Verificación:**
- Frontend: `https://tu-dominio.com`
- Backend API: `https://tu-dominio.com/api/health`
- Dashboard: `https://tu-dominio.com/dashboard`

## 🎯 **RESUMEN**

1. **Ejecutar**: `./preparar-archivos-hosting.sh`
2. **Subir**: `extraccion-hosting.tar.gz` a Hostinger
3. **Extraer**: En `public_html/`
4. **Instalar**: Dependencias
5. **Configurar**: Variables de entorno
6. **Construir**: Frontend
7. **Iniciar**: Con PM2
8. **Verificar**: Funcionamiento

¡Tu sistema estará listo para producción! 🚀 