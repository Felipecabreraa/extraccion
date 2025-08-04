const { MetrosSuperficie, Zona, Sector, Usuario } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Validaciones mejoradas
const validarRegistro = async (fecha, zona_id, sector_id, pabellones_limpiados) => {
  const errores = [];

  console.log('🔍 Validando registro:', { fecha, zona_id, sector_id, pabellones_limpiados });

  // Validar que el sector existe y obtener sus datos
  const sector = await Sector.findByPk(sector_id);
  if (!sector) {
    errores.push('Sector no encontrado');
  } else {
    // Validar que no se exceda la cantidad de pabellones del sector
    if (pabellones_limpiados > sector.cantidad_pabellones) {
      errores.push(`No puede limpiar más de ${sector.cantidad_pabellones} pabellones en este sector`);
    }
  }

  // Validar que la zona existe
  const zona = await Zona.findByPk(zona_id);
  if (!zona) {
    errores.push('Zona no encontrada');
  }

  // Validar que la fecha no sea futura (permitir hasta el día actual)
  const fechaRegistro = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999); // Permitir hasta el final del día actual
  
  console.log('📅 Comparando fechas:', {
    fechaRegistro: fechaRegistro.toISOString(),
    hoy: hoy.toISOString(),
    esFutura: fechaRegistro > hoy
  });

  if (fechaRegistro > hoy) {
    errores.push('No puede registrar fechas futuras');
  }

  // Validar que pabellones_limpiados sea positivo
  if (pabellones_limpiados <= 0) {
    errores.push('Debe limpiar al menos 1 pabellón');
  }

  console.log('✅ Validación completada, errores:', errores);
  return { errores, sector, zona };
};

// Función para calcular metros cuadrados con precisión
const calcularMetrosCuadrados = (pabellones_limpiados, mt2_sector) => {
  return parseFloat((pabellones_limpiados * parseFloat(mt2_sector)).toFixed(2));
};

// Listar registros de metros superficie con filtros mejorados
exports.listar = async (req, res) => {
  try {
    const { 
      fecha_inicio, 
      fecha_fin, 
      zona_id, 
      sector_id, 
      tipo_zona,
      search, // Nueva búsqueda por texto
      limit = 50, 
      offset = 0 
    } = req.query;

    const where = {};
    
    // Filtros de fecha
    if (fecha_inicio && fecha_fin) {
      where.fecha = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    } else if (fecha_inicio) {
      where.fecha = {
        [Op.gte]: fecha_inicio
      };
    } else if (fecha_fin) {
      where.fecha = {
        [Op.lte]: fecha_fin
      };
    }

    // Filtros adicionales
    if (zona_id) where.zona_id = zona_id;
    if (sector_id) where.sector_id = sector_id;
    if (tipo_zona) where.tipo_zona = tipo_zona;

    // Búsqueda por texto (en observaciones)
    if (search) {
      where.observacion = {
        [Op.like]: `%${search}%`
      };
    }

    const registros = await MetrosSuperficie.findAll({
      where,
      include: [
        {
          model: Zona,
          as: 'Zona',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Sector,
          as: 'Sector',
          attributes: ['id', 'nombre', 'mt2', 'cantidad_pabellones']
        },
        {
          model: Usuario,
          as: 'creador',
          attributes: ['id', 'nombre', 'email']
        }
      ],
      order: [['fecha', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Contar total de registros para paginación
    const total = await MetrosSuperficie.count({ where });

    // Calcular totales para el período filtrado
    const totales = await MetrosSuperficie.findAll({
      where,
      attributes: [
        'tipo_zona',
        [sequelize.fn('SUM', sequelize.col('pabellones_limpiados')), 'total_pabellones'],
        [sequelize.fn('SUM', sequelize.col('metros_cuadrados')), 'total_metros']
      ],
      group: ['tipo_zona'],
      raw: true
    });

    res.json({
      registros,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      totales: totales.reduce((acc, item) => {
        acc[item.tipo_zona] = {
          pabellones: parseInt(item.total_pabellones),
          metros: parseFloat(item.total_metros)
        };
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Error al listar metros superficie:', error);
    res.status(500).json({ 
      message: 'Error al listar registros de metros superficie',
      error: error.message 
    });
  }
};

// Obtener un registro específico
exports.obtener = async (req, res) => {
  try {
    console.log(`🔍 Método obtener llamado con ID: ${req.params.id}`);
    const registro = await MetrosSuperficie.findByPk(req.params.id, {
      include: [
        {
          model: Zona,
          as: 'Zona',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Sector,
          as: 'Sector',
          attributes: ['id', 'nombre', 'mt2', 'cantidad_pabellones']
        },
        {
          model: Usuario,
          as: 'creador',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });

    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    res.json(registro);

  } catch (error) {
    console.error('Error al obtener registro:', error);
    res.status(500).json({ 
      message: 'Error al obtener registro',
      error: error.message 
    });
  }
};

// Crear nuevo registro
exports.crear = async (req, res) => {
  try {
    const { 
      fecha, 
      zona_id, 
      sector_id, 
      pabellones_limpiados, 
      observacion 
    } = req.body;

    // Validar los datos antes de crear el registro
    const { errores, sector, zona } = await validarRegistro(fecha, zona_id, sector_id, pabellones_limpiados);

    if (errores.length > 0) {
      return res.status(400).json({ message: 'Error al crear registro', errores });
    }

    // Calcular metros cuadrados
    const metros_cuadrados = calcularMetrosCuadrados(pabellones_limpiados, sector.mt2);

    // Verificar si ya existe un registro para la misma fecha, zona y sector
    const registroExistente = await MetrosSuperficie.findOne({
      where: {
        fecha,
        zona_id,
        sector_id
      }
    });

    if (registroExistente) {
      return res.status(400).json({ 
        message: 'Ya existe un registro para esta fecha, zona y sector' 
      });
    }

    // Crear el registro
    const nuevoRegistro = await MetrosSuperficie.create({
      fecha,
      zona_id,
      sector_id,
      pabellones_limpiados,
      metros_cuadrados,
      tipo_zona: zona.tipo,
      observacion,
      creado_por: req.usuario?.id || null
    });

    // Obtener el registro creado con las relaciones
    const registroCreado = await MetrosSuperficie.findByPk(nuevoRegistro.id, {
      include: [
        {
          model: Zona,
          as: 'Zona',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Sector,
          as: 'Sector',
          attributes: ['id', 'nombre', 'mt2', 'cantidad_pabellones']
        }
      ]
    });

    res.status(201).json({
      message: 'Registro creado exitosamente',
      registro: registroCreado
    });

  } catch (error) {
    console.error('Error al crear registro:', error);
    res.status(500).json({ 
      message: 'Error al crear registro',
      error: error.message 
    });
  }
};

// Actualizar registro
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      fecha, 
      zona_id, 
      sector_id, 
      pabellones_limpiados, 
      observacion 
    } = req.body;

    const registro = await MetrosSuperficie.findByPk(id);
    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    // Validar los datos antes de actualizar el registro
    const { errores, sector, zona } = await validarRegistro(fecha, zona_id, sector_id, pabellones_limpiados);

    if (errores.length > 0) {
      return res.status(400).json({ message: 'Error al actualizar registro', errores });
    }

    // Calcular metros cuadrados
    const metros_cuadrados = calcularMetrosCuadrados(pabellones_limpiados, sector.mt2);

    // Verificar si ya existe otro registro para la misma fecha, zona y sector
    const registroExistente = await MetrosSuperficie.findOne({
      where: {
        fecha,
        zona_id,
        sector_id,
        id: { [Op.ne]: id } // Excluir el registro actual
      }
    });

    if (registroExistente) {
      return res.status(400).json({ 
        message: 'Ya existe otro registro para esta fecha, zona y sector' 
      });
    }

    // Actualizar el registro
    await registro.update({
      fecha,
      zona_id,
      sector_id,
      pabellones_limpiados,
      metros_cuadrados,
      tipo_zona: zona.tipo,
      observacion
    });

    // Obtener el registro actualizado con las relaciones
    const registroActualizado = await MetrosSuperficie.findByPk(id, {
      include: [
        {
          model: Zona,
          as: 'Zona',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Sector,
          as: 'Sector',
          attributes: ['id', 'nombre', 'mt2', 'cantidad_pabellones']
        }
      ]
    });

    res.json({
      message: 'Registro actualizado exitosamente',
      registro: registroActualizado
    });

  } catch (error) {
    console.error('Error al actualizar registro:', error);
    res.status(500).json({ 
      message: 'Error al actualizar registro',
      error: error.message 
    });
  }
};

// Eliminar registro
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const registro = await MetrosSuperficie.findByPk(id);
    if (!registro) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await registro.destroy();

    res.json({ message: 'Registro eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar registro:', error);
    res.status(500).json({ 
      message: 'Error al eliminar registro',
      error: error.message 
    });
  }
};

// Obtener estadísticas generales
exports.obtenerEstadisticas = async (req, res) => {
  try {
    console.log('🚀 Método obtenerEstadisticas ejecutándose');
    const { year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    console.log(`🔍 Buscando datos para: ${currentYear}-${currentMonth}`);

    // Calcular fechas del mes
    const primerDia = new Date(currentYear, currentMonth - 1, 1);
    const ultimoDia = new Date(currentYear, currentMonth, 0);

    // Obtener datos del mes
    const datosMes = await MetrosSuperficie.findAll({
      where: {
        fecha: {
          [Op.between]: [primerDia, ultimoDia]
        }
      },
      include: [
        {
          model: Zona,
          as: 'Zona',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Sector,
          as: 'Sector',
          attributes: ['id', 'nombre', 'mt2']
        }
      ],
      order: [['fecha', 'ASC']]
    });

    // Calcular totales por tipo de zona
    const totales = {
      HEMBRA: { pabellones: 0, metros: 0 },
      MACHO: { pabellones: 0, metros: 0 }
    };

    datosMes.forEach(registro => {
      const tipo = registro.tipo_zona;
      if (totales[tipo]) {
        totales[tipo].pabellones += registro.pabellones_limpiados;
        totales[tipo].metros += parseFloat(registro.metros_cuadrados);
      }
    });

    // Calcular totales generales
    const totalGeneral = {
      pabellones: totales.HEMBRA.pabellones + totales.MACHO.pabellones,
      metros: totales.HEMBRA.metros + totales.MACHO.metros
    };

    console.log(`✅ Enviando respuesta para ${currentYear}-${currentMonth}: ${datosMes.length} registros`);
    res.json({
      year: currentYear,
      month: currentMonth,
      totales,
      totalGeneral,
      registros: datosMes.length
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      message: 'Error obteniendo estadísticas',
      error: error.message 
    });
  }
};

// Obtener estadísticas por quincena
exports.obtenerEstadisticasQuincena = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Calcular fechas de quincenas
    const primerDia = new Date(currentYear, currentMonth - 1, 1);
    const ultimoDia = new Date(currentYear, currentMonth, 0);
    
    const quincena1Inicio = new Date(currentYear, currentMonth - 1, 1);
    const quincena1Fin = new Date(currentYear, currentMonth - 1, 15);
    const quincena2Inicio = new Date(currentYear, currentMonth - 1, 16);
    const quincena2Fin = new Date(currentYear, currentMonth - 1, ultimoDia.getDate());

    // Obtener datos de primera quincena
    const datosQuincena1 = await MetrosSuperficie.findAll({
      where: {
        fecha: {
          [Op.between]: [quincena1Inicio, quincena1Fin]
        }
      },
      include: [
        {
          model: Zona,
          as: 'Zona',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Sector,
          as: 'Sector',
          attributes: ['id', 'nombre', 'mt2']
        }
      ],
      order: [['fecha', 'ASC']]
    });

    // Obtener datos de segunda quincena
    const datosQuincena2 = await MetrosSuperficie.findAll({
      where: {
        fecha: {
          [Op.between]: [quincena2Inicio, quincena2Fin]
        }
      },
      include: [
        {
          model: Zona,
          as: 'Zona',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Sector,
          as: 'Sector',
          attributes: ['id', 'nombre', 'mt2']
        }
      ],
      order: [['fecha', 'ASC']]
    });

    // Calcular totales por tipo de zona
    const calcularTotales = (datos) => {
      const totales = {
        HEMBRA: { pabellones: 0, metros: 0 },
        MACHO: { pabellones: 0, metros: 0 }
      };

      datos.forEach(registro => {
        const tipo = registro.tipo_zona;
        totales[tipo].pabellones += registro.pabellones_limpiados;
        totales[tipo].metros += parseFloat(registro.metros_cuadrados);
      });

      return totales;
    };

    const totalesQuincena1 = calcularTotales(datosQuincena1);
    const totalesQuincena2 = calcularTotales(datosQuincena2);

    // Calcular totales mensuales
    const totalesMensuales = {
      HEMBRA: {
        pabellones: totalesQuincena1.HEMBRA.pabellones + totalesQuincena2.HEMBRA.pabellones,
        metros: totalesQuincena1.HEMBRA.metros + totalesQuincena2.HEMBRA.metros
      },
      MACHO: {
        pabellones: totalesQuincena1.MACHO.pabellones + totalesQuincena2.MACHO.pabellones,
        metros: totalesQuincena1.MACHO.metros + totalesQuincena2.MACHO.metros
      }
    };

    res.json({
      year: currentYear,
      month: currentMonth,
      quincena1: {
        fecha_inicio: quincena1Inicio.toISOString().split('T')[0],
        fecha_fin: quincena1Fin.toISOString().split('T')[0],
        datos: datosQuincena1,
        totales: totalesQuincena1
      },
      quincena2: {
        fecha_inicio: quincena2Inicio.toISOString().split('T')[0],
        fecha_fin: quincena2Fin.toISOString().split('T')[0],
        datos: datosQuincena2,
        totales: totalesQuincena2
      },
      totales_mensuales: totalesMensuales
    });

  } catch (error) {
    console.error('Error al obtener estadísticas por quincena:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas',
      error: error.message 
    });
  }
};

// Obtener datos para el mes anterior
exports.obtenerMesAnterior = async (req, res) => {
  try {
    console.log('🚀 Método obtenerMesAnterior ejecutándose');
    const { year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Calcular mes anterior
    let mesAnterior = currentMonth - 1;
    let yearAnterior = currentYear;
    
    if (mesAnterior === 0) {
      mesAnterior = 12;
      yearAnterior = currentYear - 1;
    }

    const primerDiaMesAnterior = new Date(yearAnterior, mesAnterior - 1, 1);
    const ultimoDiaMesAnterior = new Date(yearAnterior, mesAnterior, 0);

    // Obtener total de metros cuadrados del mes anterior
    const resultado = await MetrosSuperficie.findOne({
      where: {
        fecha: {
          [Op.between]: [primerDiaMesAnterior, ultimoDiaMesAnterior]
        }
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('metros_cuadrados')), 'total_metros']
      ],
      raw: true
    });

    const totalMesAnterior = parseFloat(resultado?.total_metros || 0);

    console.log(`✅ Enviando respuesta mes anterior: ${yearAnterior}-${mesAnterior}: ${totalMesAnterior} m²`);
    res.json({
      year: yearAnterior,
      month: mesAnterior,
      total_metros: totalMesAnterior,
      registros: resultado ? 1 : 0
    });

  } catch (error) {
    console.error('Error al obtener datos del mes anterior:', error);
    res.status(500).json({ 
      message: 'Error al obtener datos del mes anterior',
      error: error.message 
    });
  }
};

// Obtener sectores por zona
exports.obtenerSectoresPorZona = async (req, res) => {
  try {
    const { zona_id } = req.params;

    const sectores = await Sector.findAll({
      where: { zona_id },
      attributes: ['id', 'nombre', 'mt2', 'cantidad_pabellones'],
      order: [['nombre', 'ASC']]
    });

    res.json(sectores);

  } catch (error) {
    console.error('Error al obtener sectores por zona:', error);
    res.status(500).json({ 
      message: 'Error al obtener sectores',
      error: error.message 
    });
  }
};

// Obtener reporte detallado por quincenas
exports.obtenerReporteDetallado = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Calcular fechas de quincenas
    const primerDiaMes = new Date(currentYear, currentMonth - 1, 1);
    const ultimoDiaMes = new Date(currentYear, currentMonth, 0);
    
    // Primera quincena: 1 al 15
    const quincena1Inicio = new Date(currentYear, currentMonth - 1, 1);
    const quincena1Fin = new Date(currentYear, currentMonth - 1, 15);
    
    // Segunda quincena: 16 al último día del mes
    const quincena2Inicio = new Date(currentYear, currentMonth - 1, 16);
    const quincena2Fin = new Date(currentYear, currentMonth - 1, ultimoDiaMes.getDate());

    // Obtener todos los registros del mes
    const registrosMes = await MetrosSuperficie.findAll({
      where: {
        fecha: {
          [Op.between]: [quincena1Inicio.toISOString().split('T')[0], ultimoDiaMes.toISOString().split('T')[0]]
        }
      },
      include: [
        {
          model: Zona,
          as: 'Zona',
          attributes: ['id', 'nombre', 'tipo']
        },
        {
          model: Sector,
          as: 'Sector',
          attributes: ['id', 'nombre', 'mt2']
        }
      ],
      order: [['fecha', 'ASC']]
    });

    // Función para generar datos por día
    const generarDatosPorDia = (fechaInicio, fechaFin, registros) => {
      const datosPorDia = {};
      const fechaActual = new Date(fechaInicio);
      
      while (fechaActual <= fechaFin) {
        const fechaStr = fechaActual.toISOString().split('T')[0];
        const registrosDelDia = registros.filter(r => r.fecha === fechaStr);
        
        const hebra = registrosDelDia
          .filter(r => r.tipo_zona === 'HEMBRA')
          .reduce((sum, r) => sum + parseFloat(r.metros_cuadrados), 0);
        
        const macho = registrosDelDia
          .filter(r => r.tipo_zona === 'MACHO')
          .reduce((sum, r) => sum + parseFloat(r.metros_cuadrados), 0);
        
        datosPorDia[fechaStr] = {
          hebra: parseFloat(hebra.toFixed(2)),
          macho: parseFloat(macho.toFixed(2)),
          total: parseFloat((hebra + macho).toFixed(2))
        };
        
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
      
      return datosPorDia;
    };

    // Generar datos para cada quincena
    const datosQuincena1 = generarDatosPorDia(quincena1Inicio, quincena1Fin, registrosMes);
    const datosQuincena2 = generarDatosPorDia(quincena2Inicio, quincena2Fin, registrosMes);

    // Calcular totales por quincena
    const calcularTotales = (datos) => {
      return Object.values(datos).reduce((acc, dia) => {
        acc.hebra += dia.hebra;
        acc.macho += dia.macho;
        acc.total += dia.total;
        return acc;
      }, { hebra: 0, macho: 0, total: 0 });
    };

    const totalesQuincena1 = calcularTotales(datosQuincena1);
    const totalesQuincena2 = calcularTotales(datosQuincena2);
    const totalesMensuales = {
      hebra: totalesQuincena1.hebra + totalesQuincena2.hebra,
      macho: totalesQuincena1.macho + totalesQuincena2.macho,
      total: totalesQuincena1.total + totalesQuincena2.total
    };

    // Obtener mes anterior para comparación
    let mesAnterior = currentMonth - 1;
    let yearAnterior = currentYear;
    if (mesAnterior === 0) {
      mesAnterior = 12;
      yearAnterior = currentYear - 1;
    }

    const registrosMesAnterior = await MetrosSuperficie.findAll({
      where: {
        fecha: {
          [Op.between]: [
            new Date(yearAnterior, mesAnterior - 1, 1).toISOString().split('T')[0],
            new Date(yearAnterior, mesAnterior, 0).toISOString().split('T')[0]
          ]
        }
      }
    });

    const totalMesAnterior = registrosMesAnterior.reduce((sum, r) => 
      sum + parseFloat(r.metros_cuadrados), 0);

    res.json({
      year: currentYear,
      month: currentMonth,
      quincena1: {
        fecha_inicio: quincena1Inicio.toISOString().split('T')[0],
        fecha_fin: quincena1Fin.toISOString().split('T')[0],
        datos_por_dia: datosQuincena1,
        totales: {
          hebra: parseFloat(totalesQuincena1.hebra.toFixed(2)),
          macho: parseFloat(totalesQuincena1.macho.toFixed(2)),
          total: parseFloat(totalesQuincena1.total.toFixed(2))
        }
      },
      quincena2: {
        fecha_inicio: quincena2Inicio.toISOString().split('T')[0],
        fecha_fin: quincena2Fin.toISOString().split('T')[0],
        datos_por_dia: datosQuincena2,
        totales: {
          hebra: parseFloat(totalesQuincena2.hebra.toFixed(2)),
          macho: parseFloat(totalesQuincena2.macho.toFixed(2)),
          total: parseFloat(totalesQuincena2.total.toFixed(2))
        }
      },
      totales_mensuales: {
        hebra: parseFloat(totalesMensuales.hebra.toFixed(2)),
        macho: parseFloat(totalesMensuales.macho.toFixed(2)),
        total: parseFloat(totalesMensuales.total.toFixed(2))
      },
      mes_anterior: parseFloat(totalMesAnterior.toFixed(2))
    });

  } catch (error) {
    console.error('Error al obtener reporte detallado:', error);
    res.status(500).json({ 
      message: 'Error al obtener reporte detallado',
      error: error.message 
    });
  }
};