const { Sector, Pabellon } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

exports.listar = async (req, res) => {
  const { nombre, zona_id, limit, offset } = req.query;
  const where = {};
  if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
  if (zona_id) where.zona_id = zona_id;
  const sectores = await Sector.findAll({
    where,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    order: [['nombre', 'ASC']]
  });
  res.json(sectores);
};

exports.obtener = async (req, res) => {
  const sector = await Sector.findByPk(req.params.id);
  if (!sector) return res.status(404).json({ message: 'No encontrado' });
  res.json(sector);
};

exports.crear = async (req, res) => {
  const nuevo = await Sector.create(req.body);
  let pabellonesCreados = [];
  // Crear pabellones automáticamente
  if (nuevo.cantidad_pabellones && nuevo.cantidad_pabellones > 0) {
    const existentes = await Pabellon.count({ where: { sector_id: nuevo.id } });
    const faltan = nuevo.cantidad_pabellones - existentes;
    if (faltan > 0) {
      const nuevos = [];
      for (let i = existentes + 1; i <= nuevo.cantidad_pabellones; i++) {
        nuevos.push({ nombre: `Pabellón ${i}`, sector_id: nuevo.id });
        pabellonesCreados.push(`Pabellón ${i}`);
      }
      await Pabellon.bulkCreate(nuevos);
    }
  }
  res.status(201).json({
    ...nuevo.toJSON(),
    pabellonesCreados
  });
};

exports.actualizar = async (req, res) => {
  const sector = await Sector.findByPk(req.params.id);
  if (!sector) return res.status(404).json({ message: 'No encontrado' });
  await sector.update(req.body);
  // Crear pabellones automáticamente si aumentó la cantidad
  if (sector.cantidad_pabellones && sector.cantidad_pabellones > 0) {
    const existentes = await Pabellon.count({ where: { sector_id: sector.id } });
    const faltan = sector.cantidad_pabellones - existentes;
    if (faltan > 0) {
      const nuevos = [];
      for (let i = existentes + 1; i <= sector.cantidad_pabellones; i++) {
        nuevos.push({ nombre: `Pabellón ${i}`, sector_id: sector.id });
      }
      await Pabellon.bulkCreate(nuevos);
    }
  }
  res.json(sector);
};

exports.eliminar = async (req, res) => {
  const sector = await Sector.findByPk(req.params.id);
  if (!sector) return res.status(404).json({ message: 'No encontrado' });
  await sector.destroy();
  res.json({ message: 'Eliminado' });
};

// Carga masiva de sectores
exports.cargaMasiva = async (req, res) => {
  try {
    const { sectores, zona_id } = req.body;
    
    if (!sectores || !Array.isArray(sectores) || sectores.length === 0) {
      return res.status(400).json({ 
        message: 'Se requiere un array de sectores válido' 
      });
    }

    if (!zona_id) {
      return res.status(400).json({ 
        message: 'Se requiere el ID de la zona' 
      });
    }

    const resultados = {
      exitosos: [],
      errores: [],
      pabellonesCreados: []
    };

    // Procesar cada sector
    for (const sectorData of sectores) {
      try {
        // Validar datos requeridos
        if (!sectorData.nombre) {
          resultados.errores.push({
            sector: sectorData,
            error: 'Nombre es requerido'
          });
          continue;
        }

        // Validar que comuna sea una cadena válida si se proporciona
        if (sectorData.comuna && typeof sectorData.comuna !== 'string') {
          resultados.errores.push({
            sector: sectorData,
            error: 'Comuna debe ser un texto válido'
          });
          continue;
        }

        // Validar que MT2 sea un número válido
        if (sectorData.mt2 && (isNaN(sectorData.mt2) || parseFloat(sectorData.mt2) <= 0)) {
          resultados.errores.push({
            sector: sectorData,
            error: 'MT2 debe ser un número mayor a 0'
          });
          continue;
        }

        // Validar que cantidad_pabellones sea un número válido
        if (sectorData.cantidad_pabellones && (isNaN(sectorData.cantidad_pabellones) || parseInt(sectorData.cantidad_pabellones) <= 0)) {
          resultados.errores.push({
            sector: sectorData,
            error: 'Cantidad de pabellones debe ser un número mayor a 0'
          });
          continue;
        }

        // Verificar si el sector ya existe en la zona
        const sectorExistente = await Sector.findOne({
          where: {
            nombre: sectorData.nombre,
            zona_id: zona_id
          }
        });

        if (sectorExistente) {
          resultados.errores.push({
            sector: sectorData,
            error: `El sector "${sectorData.nombre}" ya existe en esta zona`
          });
          continue;
        }

        // Crear el sector
        const nuevoSector = await Sector.create({
          nombre: sectorData.nombre.trim(),
          zona_id: zona_id,
          comuna: sectorData.comuna ? sectorData.comuna.trim() : null,
          mt2: sectorData.mt2 ? parseFloat(sectorData.mt2) : null,
          cantidad_pabellones: sectorData.cantidad_pabellones ? parseInt(sectorData.cantidad_pabellones) : null
        });

        // Crear pabellones automáticamente si se especificó cantidad
        if (nuevoSector.cantidad_pabellones && nuevoSector.cantidad_pabellones > 0) {
          const nuevosPabellones = [];
          for (let i = 1; i <= nuevoSector.cantidad_pabellones; i++) {
            nuevosPabellones.push({ 
              nombre: `Pabellón ${i}`, 
              sector_id: nuevoSector.id 
            });
            resultados.pabellonesCreados.push(`${sectorData.nombre} - Pabellón ${i}`);
          }
          await Pabellon.bulkCreate(nuevosPabellones);
        }

        resultados.exitosos.push({
          id: nuevoSector.id,
          nombre: nuevoSector.nombre,
          comuna: nuevoSector.comuna,
          mt2: nuevoSector.mt2,
          cantidad_pabellones: nuevoSector.cantidad_pabellones
        });

      } catch (error) {
        console.error('Error procesando sector:', sectorData, error);
        resultados.errores.push({
          sector: sectorData,
          error: error.message || 'Error interno del servidor'
        });
      }
    }

    // Siempre devolver status 200 si al menos un sector se guardó exitosamente
    if (resultados.exitosos.length > 0) {
      let mensaje = `Carga masiva completada. ${resultados.exitosos.length} sectores guardados exitosamente`;
      
      if (resultados.errores.length > 0) {
        mensaje += `, ${resultados.errores.length} con errores`;
      }
      
      if (resultados.pabellonesCreados.length > 0) {
        mensaje += `. ${resultados.pabellonesCreados.length} pabellones creados automáticamente`;
      }
      
      return res.status(200).json({
        message: mensaje,
        resultados
      });
    } else {
      // Solo devolver error 400 si todos fallaron
      return res.status(400).json({
        message: 'No se pudo cargar ningún sector. Todos los registros tienen errores.',
        resultados
      });
    }

  } catch (error) {
    console.error('Error en carga masiva:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message,
      resultados: { errores: [{ sector: null, error: error.message || 'Error interno del servidor' }], exitosos: [], pabellonesCreados: [] }
    });
  }
};

// Descargar plantilla de carga masiva
exports.descargarPlantilla = async (req, res) => {
  try {
    const plantillaPath = path.join(__dirname, '../../plantilla_sectores_ejemplo.csv');
    // Verificar si el archivo existe
    if (!fs.existsSync(plantillaPath)) {
      console.error('Plantilla no encontrada en:', plantillaPath);
      return res.status(404).json({ 
        message: 'Plantilla no encontrada. Contacte al administrador.' 
      });
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.download(plantillaPath, 'plantilla_sectores.csv', (err) => {
      if (err) {
        console.error('Error descargando plantilla de sectores:', err);
        res.status(500).json({ 
          message: 'Error al descargar plantilla',
          error: err.message 
        });
      }
    });
  } catch (error) {
    console.error('Error descargando plantilla:', error);
    res.status(500).json({ 
      message: 'Error al descargar la plantilla',
      error: error.message 
    });
  }
}; 