-- Script para crear un usuario administrador
-- Ejecutar este script en MySQL

USE extraccion;

-- =====================================================
-- 1. CREAR USUARIO ADMINISTRADOR
-- =====================================================

-- Insertar usuario administrador (la contraseña es 'password123' hasheada)
INSERT INTO usuario (nombre, email, password, rol) VALUES 
('Administrador Sistema', 'admin@empresa.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uK.G', 'administrador')
ON DUPLICATE KEY UPDATE rol = 'administrador';

-- =====================================================
-- 2. VERIFICAR USUARIO CREADO
-- =====================================================

SELECT id, nombre, email, rol FROM usuario WHERE email = 'admin@empresa.com';

-- =====================================================
-- 3. MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT '✅ Usuario administrador creado exitosamente!' as mensaje;
SELECT '📧 Email: admin@empresa.com' as email;
SELECT '🔑 Contraseña: password123' as password;
SELECT '🔑 Rol: administrador' as rol; 