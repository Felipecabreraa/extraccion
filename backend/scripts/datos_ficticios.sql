-- Script SQL para insertar datos ficticios en el sistema de limpieza
-- Ejecutar este script directamente en MySQL Workbench o phpMyAdmin

-- =====================================================
-- 0. CREAR BASE DE DATOS Y OTORGAR PERMISOS
-- =====================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS extraccion;

-- Otorgar permisos al usuario (ajusta según tu configuración)
-- GRANT ALL PRIVILEGES ON extraccion.* TO 'trn'@'localhost';
-- FLUSH PRIVILEGES;

USE extraccion;

-- =====================================================
-- 1. INSERTAR SECTORES (3 por cada zona existente)
-- =====================================================

INSERT INTO sector (nombre, zona_id, cantidad_pabellones, mt2) VALUES
('Providencia', 1, 8, 3500.00),
('Ñuñoa', 1, 6, 2800.00),
('Las Condes', 1, 10, 4200.00),
('La Florida', 2, 7, 3100.00),
('Puente Alto', 2, 9, 3800.00),
('San Bernardo', 2, 5, 2200.00),
('Maipú', 3, 12, 4800.00),
('Peñalolén', 3, 8, 3200.00),
('La Reina', 3, 11, 4100.00);

-- =====================================================
-- 2. INSERTAR MÁQUINAS
-- =====================================================

INSERT INTO maquina (numero, patente, marca, modelo) VALUES
('BI-2023-A1', 'ABCD12', 'Hako', 'Citymaster 1450'),
('BI-2023-A2', 'EFGH34', 'Hako', 'Citymaster 1450'),
('BI-2023-A3', 'IJKL56', 'Hako', 'Citymaster 1450'),
('BI-2023-A4', 'MNOP78', 'Hako', 'Citymaster 1450'),
('BI-2023-A5', 'QRST90', 'Hako', 'Citymaster 1450'),
('BI-2023-A6', 'UVWX12', 'Hako', 'Citymaster 1450'),
('BI-2023-A7', 'YZAB34', 'Hako', 'Citymaster 1450'),
('BI-2023-A8', 'CDEF56', 'Hako', 'Citymaster 1450');

-- =====================================================
-- 3. INSERTAR OPERADORES
-- =====================================================

INSERT INTO operador (nombre, apellido) VALUES
('Roberto', 'Silva'),
('Patricia', 'Morales'),
('Fernando', 'Herrera'),
('Carmen', 'Vega'),
('Miguel', 'Torres'),
('Elena', 'Castro'),
('Diego', 'Rojas'),
('Sofia', 'Mendoza');

-- =====================================================
-- 4. INSERTAR BARREDORES AL CATÁLOGO
-- =====================================================

INSERT INTO barredor_catalogo (nombre, apellido, rut) VALUES
('Pedro', 'González', '11111111-1'),
('Rosa', 'Jiménez', '22222222-2'),
('Héctor', 'Ruiz', '33333333-3'),
('Isabel', 'Moreno', '44444444-4'),
('Francisco', 'Díaz', '55555555-5'),
('Lucía', 'Soto', '66666666-6'),
('Ricardo', 'Flores', '77777777-7'),
('Mónica', 'Valdez', '88888888-8'),
('Alberto', 'Reyes', '99999999-9'),
('Carmen', 'Ortega', '10101010-0');

-- =====================================================
-- 5. INSERTAR PABELLONES
-- =====================================================

INSERT INTO pabellon (nombre, sector_id) VALUES
-- Providencia (sector_id = 1)
('Pabellón 1', 1),
('Pabellón 2', 1),
('Pabellón 3', 1),
('Pabellón 4', 1),
('Pabellón 5', 1),
('Pabellón 6', 1),
('Pabellón 7', 1),
('Pabellón 8', 1),
-- Ñuñoa (sector_id = 2)
('Pabellón 1', 2),
('Pabellón 2', 2),
('Pabellón 3', 2),
('Pabellón 4', 2),
('Pabellón 5', 2),
('Pabellón 6', 2),
-- Las Condes (sector_id = 3)
('Pabellón 1', 3),
('Pabellón 2', 3),
('Pabellón 3', 3),
('Pabellón 4', 3),
('Pabellón 5', 3),
('Pabellón 6', 3),
('Pabellón 7', 3),
('Pabellón 8', 3),
('Pabellón 9', 3),
('Pabellón 10', 3),
-- La Florida (sector_id = 4)
('Pabellón 1', 4),
('Pabellón 2', 4),
('Pabellón 3', 4),
('Pabellón 4', 4),
('Pabellón 5', 4),
('Pabellón 6', 4),
('Pabellón 7', 4),
-- Puente Alto (sector_id = 5)
('Pabellón 1', 5),
('Pabellón 2', 5),
('Pabellón 3', 5),
('Pabellón 4', 5),
('Pabellón 5', 5),
('Pabellón 6', 5),
('Pabellón 7', 5),
('Pabellón 8', 5),
('Pabellón 9', 5),
-- San Bernardo (sector_id = 6)
('Pabellón 1', 6),
('Pabellón 2', 6),
('Pabellón 3', 6),
('Pabellón 4', 6),
('Pabellón 5', 6),
-- Maipú (sector_id = 7)
('Pabellón 1', 7),
('Pabellón 2', 7),
('Pabellón 3', 7),
('Pabellón 4', 7),
('Pabellón 5', 7),
('Pabellón 6', 7),
('Pabellón 7', 7),
('Pabellón 8', 7),
('Pabellón 9', 7),
('Pabellón 10', 7),
('Pabellón 11', 7),
('Pabellón 12', 7),
-- Peñalolén (sector_id = 8)
('Pabellón 1', 8),
('Pabellón 2', 8),
('Pabellón 3', 8),
('Pabellón 4', 8),
('Pabellón 5', 8),
('Pabellón 6', 8),
('Pabellón 7', 8),
('Pabellón 8', 8),
-- La Reina (sector_id = 9)
('Pabellón 1', 9),
('Pabellón 2', 9),
('Pabellón 3', 9),
('Pabellón 4', 9),
('Pabellón 5', 9),
('Pabellón 6', 9),
('Pabellón 7', 9),
('Pabellón 8', 9),
('Pabellón 9', 9),
('Pabellón 10', 9),
('Pabellón 11', 9);

-- =====================================================
-- 6. INSERTAR PLANILLAS DE PRODUCCIÓN
-- =====================================================

INSERT INTO planilla (supervisor_id, sector_id, mt2, pabellones_total, pabellones_limpiados, fecha_inicio, fecha_termino, ticket, estado, observacion) VALUES
(2, 1, 3500.00, 8, 7, '2024-01-15', '2024-01-18', 'TKT-PROD-001', 'CERRADO', 'Planilla completada satisfactoriamente'),
(2, 2, 2800.00, 6, 5, '2024-01-16', '2024-01-19', 'TKT-PROD-002', 'CERRADO', 'Planilla completada satisfactoriamente'),
(3, 3, 4200.00, 10, 9, '2024-01-17', '2024-01-20', 'TKT-PROD-003', 'CERRADO', 'Planilla completada satisfactoriamente'),
(2, 4, 3100.00, 7, 6, '2024-01-18', '2024-01-21', 'TKT-PROD-004', 'CERRADO', 'Planilla completada satisfactoriamente'),
(3, 5, 3800.00, 9, 8, '2024-01-19', '2024-01-22', 'TKT-PROD-005', 'CERRADO', 'Planilla completada satisfactoriamente'),
(2, 6, 2200.00, 5, 4, '2024-01-20', '2024-01-23', 'TKT-PROD-006', 'CERRADO', 'Planilla completada satisfactoriamente'),
(3, 7, 4800.00, 12, 11, '2024-01-21', '2024-01-24', 'TKT-PROD-007', 'CERRADO', 'Planilla completada satisfactoriamente'),
(2, 8, 3200.00, 8, 7, '2024-01-22', '2024-01-25', 'TKT-PROD-008', 'CERRADO', 'Planilla completada satisfactoriamente'),
(3, 9, 4100.00, 11, 10, '2024-01-23', '2024-01-26', 'TKT-PROD-009', 'CERRADO', 'Planilla completada satisfactoriamente'),
(2, 1, 3600.00, 8, 8, '2024-01-24', '2024-01-27', 'TKT-PROD-010', 'CERRADO', 'Planilla completada satisfactoriamente'),
(3, 2, 2900.00, 6, 6, '2024-01-25', '2024-01-28', 'TKT-PROD-011', 'CERRADO', 'Planilla completada satisfactoriamente'),
(2, 3, 4300.00, 10, 9, '2024-01-26', '2024-01-29', 'TKT-PROD-012', 'CERRADO', 'Planilla completada satisfactoriamente'),
(3, 4, 3300.00, 7, 7, '2024-01-27', '2024-01-30', 'TKT-PROD-013', 'CERRADO', 'Planilla completada satisfactoriamente'),
(2, 5, 3900.00, 9, 8, '2024-01-28', '2024-01-31', 'TKT-PROD-014', 'CERRADO', 'Planilla completada satisfactoriamente'),
(3, 6, 2400.00, 5, 5, '2024-01-29', '2024-02-01', 'TKT-PROD-015', 'ABIERTO', NULL);

-- =====================================================
-- 7. INSERTAR BARREDORES EN PLANILLAS
-- =====================================================

INSERT INTO barredor (planilla_id, barredor_id, dias, horas_extras) VALUES
-- Planilla 1
(1, 1, 4, 2.50),
(1, 2, 4, 1.00),
(1, 3, 3, 0.50),
-- Planilla 2
(2, 4, 4, 3.00),
(2, 5, 3, 1.50),
-- Planilla 3
(3, 6, 4, 2.00),
(3, 7, 4, 1.00),
(3, 8, 3, 0.50),
-- Planilla 4
(4, 9, 4, 2.50),
(4, 10, 3, 1.00),
-- Planilla 5
(5, 1, 4, 2.00),
(5, 2, 4, 1.50),
(5, 3, 3, 0.50),
-- Planilla 6
(6, 4, 3, 1.00),
(6, 5, 3, 0.50),
-- Planilla 7
(7, 6, 4, 2.50),
(7, 7, 4, 1.50),
(7, 8, 4, 1.00),
-- Planilla 8
(8, 9, 4, 2.00),
(8, 10, 3, 1.00),
-- Planilla 9
(9, 1, 4, 2.50),
(9, 2, 4, 1.50),
(9, 3, 3, 0.50),
-- Planilla 10
(10, 4, 4, 2.00),
(10, 5, 4, 1.00),
-- Planilla 11
(11, 6, 4, 2.50),
(11, 7, 3, 1.00),
-- Planilla 12
(12, 8, 4, 2.00),
(12, 9, 4, 1.50),
(12, 10, 3, 0.50),
-- Planilla 13
(13, 1, 4, 2.50),
(13, 2, 3, 1.00),
-- Planilla 14
(14, 3, 4, 2.00),
(14, 4, 4, 1.50),
(14, 5, 3, 0.50),
-- Planilla 15
(15, 6, 2, 1.00),
(15, 7, 2, 0.50);

-- =====================================================
-- 8. INSERTAR MÁQUINAS EN PLANILLAS
-- =====================================================

INSERT INTO maquina_planilla (planilla_id, maquina_id, operador_id, dias_trabajados, horas_extras, odometro_inicio, odometro_fin, petroleo) VALUES
-- Planilla 1
(1, 1, 1, 4, 2.00, 1500.00, 1650.00, 25.00),
(1, 2, 2, 3, 1.50, 2200.00, 2350.00, 30.00),
-- Planilla 2
(2, 3, 3, 4, 2.50, 1800.00, 1950.00, 28.00),
-- Planilla 3
(3, 4, 4, 4, 2.00, 2100.00, 2250.00, 32.00),
(3, 5, 5, 3, 1.00, 1900.00, 2050.00, 26.00),
-- Planilla 4
(4, 6, 6, 4, 2.50, 1600.00, 1750.00, 29.00),
-- Planilla 5
(5, 7, 7, 4, 2.00, 2400.00, 2550.00, 35.00),
(5, 8, 8, 3, 1.50, 1700.00, 1850.00, 27.00),
-- Planilla 6
(6, 1, 1, 3, 1.00, 2000.00, 2150.00, 24.00),
-- Planilla 7
(7, 2, 2, 4, 2.50, 1800.00, 1950.00, 31.00),
(7, 3, 3, 4, 2.00, 2200.00, 2350.00, 33.00),
(7, 4, 4, 3, 1.50, 1900.00, 2050.00, 28.00),
-- Planilla 8
(8, 5, 5, 4, 2.00, 2100.00, 2250.00, 30.00),
-- Planilla 9
(9, 6, 6, 4, 2.50, 1700.00, 1850.00, 29.00),
(9, 7, 7, 4, 2.00, 2300.00, 2450.00, 34.00),
-- Planilla 10
(10, 8, 8, 4, 2.00, 2000.00, 2150.00, 31.00),
-- Planilla 11
(11, 1, 1, 4, 2.50, 1800.00, 1950.00, 27.00),
-- Planilla 12
(12, 2, 2, 4, 2.00, 2200.00, 2350.00, 32.00),
(12, 3, 3, 3, 1.50, 1900.00, 2050.00, 26.00),
-- Planilla 13
(13, 4, 4, 4, 2.50, 2100.00, 2250.00, 30.00),
-- Planilla 14
(14, 5, 5, 4, 2.00, 1700.00, 1850.00, 28.00),
(14, 6, 6, 3, 1.50, 2400.00, 2550.00, 33.00),
-- Planilla 15
(15, 7, 7, 2, 1.00, 2000.00, 2150.00, 22.00);

-- =====================================================
-- 9. INSERTAR DAÑOS
-- =====================================================

INSERT INTO dano (planilla_id, pabellon_id, maquina_id, tipo, descripcion, cantidad, observacion) VALUES
(1, 1, 1, 'infraestructura', 'Pared rayada', 2, 'Daño reportado y en proceso de reparación'),
(3, 3, 4, 'equipo', 'Equipo de limpieza averiado', 1, 'Daño reportado y en proceso de reparación'),
(5, 5, 7, 'infraestructura', 'Puerta dañada', 1, 'Daño reportado y en proceso de reparación'),
(7, 7, 2, 'equipo', 'Sistema eléctrico dañado', 1, 'Daño reportado y en proceso de reparación'),
(9, 9, 6, 'infraestructura', 'Ventana rota', 1, 'Daño reportado y en proceso de reparación'),
(11, 11, 1, 'equipo', 'Equipo mecánico fallando', 1, 'Daño reportado y en proceso de reparación'),
(13, 13, 4, 'infraestructura', 'Piso deteriorado', 3, 'Daño reportado y en proceso de reparación');

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

SELECT '✅ Datos ficticios insertados exitosamente!' as mensaje;
SELECT '📊 Resumen de datos insertados:' as resumen;
SELECT '  - 9 sectores (3 por zona)' as dato1;
SELECT '  - 8 máquinas' as dato2;
SELECT '  - 8 operadores' as dato3;
SELECT '  - 10 barredores en catálogo' as dato4;
SELECT '  - 15 planillas de producción' as dato5;
SELECT '  - 35 registros de barredores' as dato6;
SELECT '  - 25 registros de máquinas' as dato7;
SELECT '  - 7 registros de daños' as dato8;
SELECT '🔑 Credenciales: juan.perez@empresa.com / password123' as credenciales; 