# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere al [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentación completa de estructura Git
- Configuración de ambientes (desarrollo, staging, producción)
- Scripts de automatización para instalación y despliegue

### Changed
- Mejorada la estructura del proyecto
- Actualizado README.md con instrucciones completas
- Optimizado .gitignore para mejor gestión de archivos

## [1.0.0] - 2024-01-15

### Added
- Sistema completo de gestión de extracción
- Frontend con React y Material-UI
- Backend con Node.js y Express
- Base de datos MySQL con Sequelize ORM
- Sistema de autenticación JWT
- Dashboard con gráficos y estadísticas
- Gestión de barredores, máquinas y operadores
- Sistema de planillas de trabajo
- Gestión de sectores y zonas
- API REST completa
- Interfaz responsive para móviles y desktop
- Sistema de roles y permisos
- Validaciones de datos con Joi
- Middleware de seguridad con Helmet
- Rate limiting para protección
- Logs detallados del sistema
- Tests unitarios y de integración
- Documentación técnica completa

### Features Principales
- **Dashboard en tiempo real** con métricas y gráficos
- **Gestión de planillas** de trabajo
- **Control de barredores** y operadores
- **Seguimiento de máquinas** y equipos
- **Gestión de sectores** y zonas
- **Sistema de alertas** y notificaciones
- **Autenticación JWT** con roles
- **API REST** completa
- **Interfaz moderna** con Material-UI

### Technical Stack
- **Frontend**: React 19, Material-UI, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express, Sequelize, MySQL
- **Autenticación**: JWT, bcryptjs
- **Validación**: Joi
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Testing**: Jest, Supertest
- **Build Tools**: Webpack, Babel

## [0.9.0] - 2024-01-10

### Added
- Versión beta del sistema
- Funcionalidades básicas de CRUD
- Autenticación básica
- Interfaz de usuario inicial

### Changed
- Mejoras en la estructura de base de datos
- Optimización de consultas SQL

## [0.8.0] - 2024-01-05

### Added
- Primera versión alpha
- Estructura básica del proyecto
- Configuración inicial de base de datos

### Fixed
- Correcciones menores en la configuración

---

## Notas de Versión

### Convenciones de Versionado
- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nuevas funcionalidades compatibles hacia atrás
- **PATCH**: Correcciones de bugs compatibles hacia atrás

### Tipos de Cambios
- **Added**: Nuevas funcionalidades
- **Changed**: Cambios en funcionalidades existentes
- **Deprecated**: Funcionalidades que serán eliminadas
- **Removed**: Funcionalidades eliminadas
- **Fixed**: Correcciones de bugs
- **Security**: Mejoras de seguridad

### Fechas de Release
- Las fechas siguen el formato YYYY-MM-DD
- Las versiones unreleased se mantienen en la parte superior
- Cada versión incluye fecha de lanzamiento

### Enlaces
- [Comparar versiones](https://github.com/usuario/repositorio/compare/v1.0.0...HEAD)
- [Release v1.0.0](https://github.com/usuario/repositorio/releases/tag/v1.0.0) 