const csv = require('csv-parser');
const fs = require('fs');
const { Zona } = require('../models');
const { Op } = require('sequelize');

exports.descargarPlantilla = (req, res) => {
  const plantillaPath = './plantilla_zonas_ejemplo.csv';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.download(plantillaPath, 'plantilla_zonas.csv', (err) => {
    if (err) {
      console.error('Error descargando plantilla:', err);
      res.status(500).json({ message: 'Error al descargar plantilla' });
    }
  });
};

exports.cargarMasiva = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
  }

  const resultados = {
    exitosos: [],
    errores: [],
    total: 0
  };

  try {
    const datos = [];
    
    // Leer archivo CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          datos.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    resultados.total = datos.length;

    // Validar y procesar cada fila
    for (let i = 0; i < datos.length; i++) {
      const fila = datos[i];
      const numeroFila = i + 2; // +2 porque CSV empieza en 1 y tenemos header

      try {
        // Validaciones
        const errores = validarFilaZona(fila, numeroFila);
        if (errores.length > 0) {
          resultados.errores.push({
            fila: numeroFila,
            datos: fila,
            errores: errores
          });
          continue;
        }

        // Verificar si la zona ya existe
        const zonaExistente = await Zona.findOne({
          where: {
            nombre: { [Op.iLike]: fila.nombre.trim() }
          }
        });

        if (zonaExistente) {
          resultados.errores.push({
            fila: numeroFila,
            datos: fila,
            errores: [`La zona "${fila.nombre}" ya existe`]
          });
          continue;
        }

        // Crear zona
        const nuevaZona = await Zona.create({
          nombre: fila.nombre.trim(),
          tipo: fila.tipo.toUpperCase().trim()
        });

        resultados.exitosos.push({
          fila: numeroFila,
          datos: fila,
          zona: nuevaZona
        });

      } catch (error) {
        console.error(`Error procesando fila ${numeroFila}:`, error);
        resultados.errores.push({
          fila: numeroFila,
          datos: fila,
          errores: ['Error interno del servidor']
        });
      }
    }

    // Limpiar archivo temporal
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'Carga masiva completada',
      resultados: resultados,
      resumen: {
        total: resultados.total,
        exitosos: resultados.exitosos.length,
        errores: resultados.errores.length
      }
    });

  } catch (error) {
    console.error('Error en carga masiva:', error);
    
    // Limpiar archivo temporal si existe
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

function validarFilaZona(fila, numeroFila) {
  const errores = [];

  // Validar nombre
  if (!fila.nombre || fila.nombre.trim() === '') {
    errores.push('El nombre de la zona es obligatorio');
  } else if (fila.nombre.trim().length > 100) {
    errores.push('El nombre de la zona no puede exceder 100 caracteres');
  } else {
    // Validar formato "Zona X"
    const nombreNormalizado = fila.nombre.trim();
    const formatoRegex = /^Zona\s+\d+$/i;
    if (!formatoRegex.test(nombreNormalizado)) {
      errores.push('El nombre debe seguir el formato "Zona X" donde X es un número');
    }
  }

  // Validar tipo
  if (!fila.tipo || fila.tipo.trim() === '') {
    errores.push('El tipo es obligatorio');
  } else {
    const tipoNormalizado = fila.tipo.toUpperCase().trim();
    if (!['HEMBRA', 'MACHO'].includes(tipoNormalizado)) {
      errores.push('El tipo debe ser HEMBRA o MACHO');
    }
  }

  return errores;
}

exports.obtenerEstadisticasCarga = async (req, res) => {
  try {
    const totalZonas = await Zona.count();
    const zonasPorTipo = await Zona.findAll({
      attributes: [
        'tipo',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'cantidad']
      ],
      group: ['tipo'],
      raw: true
    });

    res.json({
      totalZonas,
      zonasPorTipo
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 