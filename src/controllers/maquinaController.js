const { Maquina } = require('../models');
const { Op, Sequelize } = require('sequelize');

exports.listar = async (req, res) => {
  const { numero, limit, offset } = req.query;
  const where = {};
  if (numero) where.numero = { [Op.like]: `%${numero}%` };
  const maquinas = await Maquina.findAll({
    where,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
    order: [
      [Sequelize.literal('numero + 0'), 'ASC']
    ]
  });
  res.json(maquinas);
};

exports.obtener = async (req, res) => {
  const maquina = await Maquina.findByPk(req.params.id);
  if (!maquina) return res.status(404).json({ message: 'No encontrada' });
  res.json(maquina);
};

exports.crear = async (req, res) => {
  const nueva = await Maquina.create(req.body);
  res.status(201).json(nueva);
};

exports.actualizar = async (req, res) => {
  const maquina = await Maquina.findByPk(req.params.id);
  if (!maquina) return res.status(404).json({ message: 'No encontrada' });
  await maquina.update(req.body);
  res.json(maquina);
};

exports.eliminar = async (req, res) => {
  const maquina = await Maquina.findByPk(req.params.id);
  if (!maquina) return res.status(404).json({ message: 'No encontrada' });
  await maquina.destroy();
  res.json({ message: 'Eliminada' });
};

// Carga masiva de máquinas
exports.cargaMasiva = async (req, res) => {
  try {
    const { maquinas } = req.body;
    
    if (!maquinas || !Array.isArray(maquinas) || maquinas.length === 0) {
      return res.status(400).json({ 
        message: 'Se requiere un array de máquinas válido' 
      });
    }

    const resultados = {
      exitosos: [],
      errores: []
    };

    // Validar datos requeridos primero
    const maquinasValidas = [];
    const maquinasInvalidas = [];

    for (const maquinaData of maquinas) {
      if (!maquinaData.numero || !maquinaData.marca || !maquinaData.modelo) {
        maquinasInvalidas.push({
          maquina: maquinaData,
          error: 'Número, marca y modelo son requeridos'
        });
      } else {
        maquinasValidas.push({
          numero: maquinaData.numero.trim(),
          marca: maquinaData.marca.trim(),
          modelo: maquinaData.modelo.trim()
        });
      }
    }

    // Agregar errores de validación
    resultados.errores.push(...maquinasInvalidas);

    if (maquinasValidas.length === 0) {
      return res.status(400).json({
        message: 'No hay máquinas válidas para procesar',
        resultados
      });
    }

    // Verificar duplicados en una sola consulta
    const numeros = maquinasValidas.map(m => m.numero);
    const maquinasExistentes = await Maquina.findAll({
      where: {
        numero: { [Op.in]: numeros }
      },
      attributes: ['numero']
    });

    const numerosExistentes = new Set(maquinasExistentes.map(m => m.numero));
    
    // Filtrar máquinas que ya existen
    const maquinasParaCrear = [];
    const maquinasDuplicadas = [];

    for (const maquina of maquinasValidas) {
      if (numerosExistentes.has(maquina.numero)) {
        maquinasDuplicadas.push({
          maquina: maquina,
          error: `La máquina con número "${maquina.numero}" ya existe`
        });
      } else {
        maquinasParaCrear.push(maquina);
      }
    }

    // Agregar errores de duplicados
    resultados.errores.push(...maquinasDuplicadas);

    // Crear máquinas en lote si hay alguna válida
    if (maquinasParaCrear.length > 0) {
      try {
        const maquinasCreadas = await Maquina.bulkCreate(maquinasParaCrear);
        
        resultados.exitosos.push(...maquinasCreadas.map(maquina => ({
          id: maquina.id,
          numero: maquina.numero,
          marca: maquina.marca,
          modelo: maquina.modelo
        })));

      } catch (error) {
        console.error('Error en bulkCreate:', error);
        // Si bulkCreate falla, intentar crear una por una
        for (const maquinaData of maquinasParaCrear) {
          try {
            const nuevaMaquina = await Maquina.create(maquinaData);
            resultados.exitosos.push({
              id: nuevaMaquina.id,
              numero: nuevaMaquina.numero,
              marca: nuevaMaquina.marca,
              modelo: nuevaMaquina.modelo
            });
          } catch (createError) {
            console.error('Error creando máquina individual:', maquinaData, createError);
            resultados.errores.push({
              maquina: maquinaData,
              error: createError.message || 'Error interno del servidor'
            });
          }
        }
      }
    }

    // Devolver respuesta
    if (resultados.exitosos.length > 0) {
      let mensaje = `Carga masiva completada. ${resultados.exitosos.length} máquinas guardadas exitosamente`;
      
      if (resultados.errores.length > 0) {
        mensaje += `, ${resultados.errores.length} con errores`;
      }
      
      return res.status(200).json({
        message: mensaje,
        resultados
      });
    } else {
      return res.status(400).json({
        message: 'No se pudo cargar ninguna máquina. Todos los registros tienen errores.',
        resultados
      });
    }

  } catch (error) {
    console.error('Error en carga masiva de máquinas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: error.message,
      resultados: { errores: [{ maquina: null, error: error.message || 'Error interno del servidor' }], exitosos: [] }
    });
  }
}; 