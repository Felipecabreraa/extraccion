-- Script para configurar la base de datos y permisos
-- Ejecutar este script como administrador (root) en MySQL

-- =====================================================
-- 1. CREAR BASE DE DATOS
-- =====================================================

CREATE DATABASE IF NOT EXISTS extraccion;

-- =====================================================
-- 2. CREAR USUARIO Y OTORGAR PERMISOS
-- =====================================================

-- Opción 1: Crear usuario 'trn_felipe' (si no existe)
CREATE USER IF NOT EXISTS 'trn_felipe'@'localhost' IDENTIFIED BY 'password123';

-- Opción 2: Si el usuario ya existe, cambiar contraseña
-- ALTER USER 'trn_felipe'@'localhost' IDENTIFIED BY 'password123';

-- Otorgar todos los permisos en la base de datos extraccion
GRANT ALL PRIVILEGES ON extraccion.* TO 'trn_felipe'@'localhost';

-- Otorgar permisos para crear bases de datos (opcional)
-- GRANT CREATE ON *.* TO 'trn'@'localhost';

-- Aplicar los cambios
FLUSH PRIVILEGES;

-- =====================================================
-- 3. VERIFICAR CONFIGURACIÓN
-- =====================================================

-- Mostrar bases de datos
SHOW DATABASES;

-- Mostrar usuarios
SELECT User, Host FROM mysql.user WHERE User = 'trn_felipe';

-- Mostrar permisos del usuario
SHOW GRANTS FOR 'trn_felipe'@'localhost';

-- =====================================================
-- 4. MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT '✅ Base de datos configurada exitosamente!' as mensaje;
SELECT '📊 Usuario: trn_felipe@localhost' as usuario;
SELECT '🔑 Contraseña: password123' as password;
SELECT '🗄️ Base de datos: extraccion' as database_name; 