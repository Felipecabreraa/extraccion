-- Script para verificar y configurar restricciones de eliminación en cascada
-- para las tablas relacionadas con planillas

-- 1. Verificar restricciones actuales
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
    JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
WHERE 
    kcu.TABLE_SCHEMA = DATABASE()
    AND kcu.REFERENCED_TABLE_NAME = 'planilla'
ORDER BY 
    TABLE_NAME, COLUMN_NAME;

-- 2. Mostrar todas las tablas que referencian a planilla
SELECT DISTINCT
    TABLE_NAME as 'Tabla que referencia planilla',
    COLUMN_NAME as 'Columna de referencia'
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND REFERENCED_TABLE_NAME = 'planilla'
ORDER BY 
    TABLE_NAME;

-- 3. Verificar si existen datos huérfanos
SELECT 
    'barredor' as tabla,
    COUNT(*) as registros_huérfanos
FROM barredor b
LEFT JOIN planilla p ON b.planilla_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'maquina_planilla' as tabla,
    COUNT(*) as registros_huérfanos
FROM maquina_planilla mp
LEFT JOIN planilla p ON mp.planilla_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'pabellon_maquina' as tabla,
    COUNT(*) as registros_huérfanos
FROM pabellon_maquina pm
LEFT JOIN planilla p ON pm.planilla_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'dano' as tabla,
    COUNT(*) as registros_huérfanos
FROM dano d
LEFT JOIN planilla p ON d.planilla_id = p.id
WHERE p.id IS NULL;

-- 4. Configurar eliminación en cascada (ejecutar solo si es necesario)
-- NOTA: Descomentar las siguientes líneas solo si se necesita configurar las restricciones

/*
-- Eliminar restricciones existentes
ALTER TABLE barredor DROP FOREIGN KEY IF EXISTS barredor_ibfk_1;
ALTER TABLE maquina_planilla DROP FOREIGN KEY IF EXISTS maquina_planilla_ibfk_1;
ALTER TABLE pabellon_maquina DROP FOREIGN KEY IF EXISTS pabellon_maquina_ibfk_1;
ALTER TABLE dano DROP FOREIGN KEY IF EXISTS dano_ibfk_1;

-- Agregar restricciones con eliminación en cascada
ALTER TABLE barredor 
ADD CONSTRAINT barredor_planilla_cascade 
FOREIGN KEY (planilla_id) REFERENCES planilla(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE maquina_planilla 
ADD CONSTRAINT maquina_planilla_cascade 
FOREIGN KEY (planilla_id) REFERENCES planilla(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE pabellon_maquina 
ADD CONSTRAINT pabellon_maquina_cascade 
FOREIGN KEY (planilla_id) REFERENCES planilla(id) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE dano 
ADD CONSTRAINT dano_planilla_cascade 
FOREIGN KEY (planilla_id) REFERENCES planilla(id) 
ON DELETE CASCADE ON UPDATE CASCADE;
*/

-- 5. Verificar configuración final
SELECT 
    'Configuración final de restricciones' as info,
    TABLE_NAME,
    COLUMN_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
    JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
        ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
WHERE 
    kcu.TABLE_SCHEMA = DATABASE()
    AND kcu.REFERENCED_TABLE_NAME = 'planilla'
ORDER BY 
    TABLE_NAME, COLUMN_NAME; 