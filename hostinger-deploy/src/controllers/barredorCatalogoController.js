const { BarredorCatalogo } = require('../models');

exports.listar = async (req, res) => {
  const catalogo = await BarredorCatalogo.findAll();
  res.json(catalogo);
};

exports.obtener = async (req, res) => {
  const item = await BarredorCatalogo.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  res.json(item);
};

exports.crear = async (req, res) => {
  const nuevo = await BarredorCatalogo.create(req.body);
  res.status(201).json(nuevo);
};

exports.actualizar = async (req, res) => {
  const item = await BarredorCatalogo.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  await item.update(req.body);
  res.json(item);
};

exports.eliminar = async (req, res) => {
  const item = await BarredorCatalogo.findByPk(req.params.id);
  if (!item) return res.status(404).json({ message: 'No encontrado' });
  await item.destroy();
  res.json({ message: 'Eliminado' });
};

// Carga masiva de barredores
exports.cargaMasiva = async (req, res) => {
  try {
    const { barredores } = req.body;
    
    if (!barredores || !Array.isArray(barredores) || barredores.length === 0) {
      return res.status(400).json({ 
        message: 'Se requiere un array de barredores válido' 
      });
    }

    const resultados = {
      exitosos: [],
      errores: []
    };

    // Procesar cada barredor
    for (const barredorData of barredores) {
      try {
        // Validar datos requeridos
        if (!barredorData.nombre || !barredorData.apellido) {
          resultados.errores.push({
            barredor: barredorData,
            error: 'Nombre y apellido son requeridos'
          });
          continue;
        }

        // Verificar si el barredor ya existe
        const barredorExistente = await BarredorCatalogo.findOne({
          where: {
            nombre: barredorData.nombre.trim(),
            apellido: barredorData.apellido.trim()
          }
        });

        if (barredorExistente) {
          resultados.errores.push({
            barredor: barredorData,
            error: `El barredor "${barredorData.nombre} ${barredorData.apellido}" ya existe`
          });
          continue;
        }

        // Crear el barredor
        const nuevoBarredor = await BarredorCatalogo.create({
          nombre: barredorData.nombre.trim(),
          apellido: barredorData.apellido.trim()
        });

        resultados.exitosos.push({
          id: nuevoBarredor.id,
          nombre: nuevoBarredor.nombre,
          apellido: nuevoBarredor.apellido
        });

      } catch (error) {
        console.error('Error procesando barredor:', barredorData, error);
        resultados.errores.push({
          barredor: barredorData,
          error: error.message || 'Error interno del servidor'
        });
      }
    }

    // Siempre devolver status 200 si al menos un barredor se guardó exitosamente
    if (resultados.exitosos.length > 0) {
      let mensaje = `Carga masiva completada. ${resultados.exitosos.length} barredores guardados exitosamente`;
      
      if (resultados.errores.length > 0) {
        mensaje += `, ${resultados.errores.length} con errores`;
      }
      
      return res.status(200).json({
        message: mensaje,
        resultados
      });
    } else {
      // Solo devolver error 400 si todos fallaron
      return res.status(400).json({
        message: 'No se pudo cargar ningún barredor. Todos los registros tienen errores.',
        resultados
      });
    }

  } catch (error) {
    console.error('Error en carga masiva de barredores:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message,
      resultados: { errores: [{ barredor: null, error: error.message || 'Error interno del servidor' }], exitosos: [] }
    });
  }
}; 