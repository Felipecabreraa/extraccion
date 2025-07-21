-- Script para cambiar el rol del usuario a administrador
-- Ejecutar este script en MySQL

USE extraccion;

-- =====================================================
-- 1. VER USUARIOS EXISTENTES
-- =====================================================

SELECT id, nombre, email, rol FROM usuario;

-- =====================================================
-- 2. CAMBIAR ROL A ADMINISTRADOR
-- =====================================================

-- Opción 1: Cambiar todos los usuarios a administrador
UPDATE usuario SET rol = 'administrador' WHERE rol IN ('operador', 'supervisor');

-- Opción 2: Cambiar un usuario específico (reemplaza 'tu_email@ejemplo.com')
-- UPDATE usuario SET rol = 'administrador' WHERE email = 'tu_email@ejemplo.com';

-- Opción 3: Cambiar por ID (reemplaza 1 con tu ID de usuario)
-- UPDATE usuario SET rol = 'administrador' WHERE id = 1;

-- =====================================================
-- 3. VERIFICAR CAMBIOS
-- =====================================================

SELECT id, nombre, email, rol FROM usuario;

-- =====================================================
-- 4. MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT '✅ Roles actualizados exitosamente!' as mensaje;
SELECT '🔑 Ahora tienes permisos de administrador' as permisos;
SELECT '🔄 Reinicia la aplicación para aplicar los cambios' as reinicio; 