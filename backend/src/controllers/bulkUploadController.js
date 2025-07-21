const { 
  Usuario, Zona, Sector, Pabellon, Planilla, Barredor, Maquina, 
  Operador, MaquinaPlanilla, PabellonMaquina, Dano, BarredorCatalogo 
} = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Función auxiliar para validar datos requeridos
const validateRequiredFields = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
  }
};

// Función auxiliar para validar formato de email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función auxiliar para validar RUT chileno
const validateRut = (rut) => {
  if (!rut) return true; // RUT es opcional
  const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/;
  return rutRegex.test(rut);
};

exports.uploadZonas = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Los datos deben ser un array' });
    }

    const results = { success: [], errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        validateRequiredFields(item, ['nombre']);

        // Verificar si ya existe
        const existing = await Zona.findOne({ where: { nombre: item.nombre } });
        if (existing) {
          results.errors.push({ row: i + 1, error: 'Zona ya existe' });
          continue;
        }

        const zona = await Zona.create(item);
        results.success.push({ id: zona.id, nombre: zona.nombre });
      } catch (error) {
        results.errors.push({ row: i + 1, error: error.message });
      }
    }

    res.json({
      message: `Procesados ${data.length} registros`,
      success: results.success.length,
      errors: results.errors.length,
      details: results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadSectores = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Los datos deben ser un array' });
    }

    const results = { success: [], errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        validateRequiredFields(item, ['nombre', 'zona_id']);

        // Verificar que la zona existe
        const zona = await Zona.findByPk(item.zona_id);
        if (!zona) {
          results.errors.push({ row: i + 1, error: 'Zona no encontrada' });
          continue;
        }

        // Verificar si ya existe
        const existing = await Sector.findOne({ 
          where: { 
            nombre: item.nombre,
            zona_id: item.zona_id 
          } 
        });
        if (existing) {
          results.errors.push({ row: i + 1, error: 'Sector ya existe en esta zona' });
          continue;
        }

        const sector = await Sector.create(item);
        results.success.push({ id: sector.id, nombre: sector.nombre });
      } catch (error) {
        results.errors.push({ row: i + 1, error: error.message });
      }
    }

    res.json({
      message: `Procesados ${data.length} registros`,
      success: results.success.length,
      errors: results.errors.length,
      details: results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadPabellones = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Los datos deben ser un array' });
    }

    const results = { success: [], errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        validateRequiredFields(item, ['nombre', 'sector_id']);

        // Verificar que el sector existe
        const sector = await Sector.findByPk(item.sector_id);
        if (!sector) {
          results.errors.push({ row: i + 1, error: 'Sector no encontrado' });
          continue;
        }

        // Verificar si ya existe
        const existing = await Pabellon.findOne({ 
          where: { 
            nombre: item.nombre,
            sector_id: item.sector_id 
          } 
        });
        if (existing) {
          results.errors.push({ row: i + 1, error: 'Pabellón ya existe en este sector' });
          continue;
        }

        const pabellon = await Pabellon.create(item);
        results.success.push({ id: pabellon.id, nombre: pabellon.nombre });
      } catch (error) {
        results.errors.push({ row: i + 1, error: error.message });
      }
    }

    res.json({
      message: `Procesados ${data.length} registros`,
      success: results.success.length,
      errors: results.errors.length,
      details: results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadMaquinas = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Los datos deben ser un array' });
    }

    const results = { success: [], errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        validateRequiredFields(item, ['numero', 'marca', 'modelo']);

        // Verificar si ya existe por número o patente
        const existing = await Maquina.findOne({ 
          where: { 
            [Op.or]: [
              { numero: item.numero },
              { patente: item.patente }
            ]
          } 
        });
        if (existing) {
          results.errors.push({ row: i + 1, error: 'Máquina ya existe (número o patente duplicada)' });
          continue;
        }

        const maquina = await Maquina.create(item);
        results.success.push({ id: maquina.id, numero: maquina.numero, patente: maquina.patente });
      } catch (error) {
        results.errors.push({ row: i + 1, error: error.message });
      }
    }

    res.json({
      message: `Procesados ${data.length} registros`,
      success: results.success.length,
      errors: results.errors.length,
      details: results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadOperadores = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Los datos deben ser un array' });
    }

    const results = { success: [], errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        validateRequiredFields(item, ['nombre', 'apellido']);

        // Validar RUT si se proporciona
        if (item.rut && !validateRut(item.rut)) {
          results.errors.push({ row: i + 1, error: 'Formato de RUT inválido' });
          continue;
        }

        // Verificar si ya existe por RUT o nombre completo
        const whereClause = {};
        if (item.rut) {
          whereClause.rut = item.rut;
        } else {
          whereClause[Op.and] = [
            { nombre: item.nombre },
            { apellido: item.apellido }
          ];
        }

        const existing = await Operador.findOne({ where: whereClause });
        if (existing) {
          results.errors.push({ row: i + 1, error: 'Operador ya existe' });
          continue;
        }

        const operador = await Operador.create(item);
        results.success.push({ id: operador.id, nombre: `${operador.nombre} ${operador.apellido}` });
      } catch (error) {
        results.errors.push({ row: i + 1, error: error.message });
      }
    }

    res.json({
      message: `Procesados ${data.length} registros`,
      success: results.success.length,
      errors: results.errors.length,
      details: results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadUsuarios = async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Los datos deben ser un array' });
    }

    const results = { success: [], errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        validateRequiredFields(item, ['nombre', 'apellido', 'email', 'password', 'rol']);

        // Validar email
        if (!validateEmail(item.email)) {
          results.errors.push({ row: i + 1, error: 'Formato de email inválido' });
          continue;
        }

        // Validar rol
        const rolesValidos = ['administrador', 'supervisor', 'operador'];
        if (!rolesValidos.includes(item.rol)) {
          results.errors.push({ row: i + 1, error: 'Rol inválido' });
          continue;
        }

        // Verificar si ya existe
        const existing = await Usuario.findOne({ where: { email: item.email } });
        if (existing) {
          results.errors.push({ row: i + 1, error: 'Usuario ya existe' });
          continue;
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(item.password, 10);
        const usuario = await Usuario.create({
          ...item,
          password: hashedPassword
        });

        results.success.push({ id: usuario.id, email: usuario.email });
      } catch (error) {
        results.errors.push({ row: i + 1, error: error.message });
      }
    }

    res.json({
      message: `Procesados ${data.length} registros`,
      success: results.success.length,
      errors: results.errors.length,
      details: results
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadBarredoresCatalogo = async (req, res) => {
  try {
    console.log('🔍 uploadBarredoresCatalogo iniciado');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const { data } = req.body;
    if (!Array.isArray(data)) {
      console.log('❌ Error: data no es un array');
      return res.status(400).json({ message: 'Los datos deben ser un array' });
    }

    console.log(`📊 Procesando ${data.length} registros`);
    const results = { success: [], errors: [] };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        console.log(`🔍 Procesando item ${i + 1}:`, JSON.stringify(item, null, 2));
        
        validateRequiredFields(item, ['nombre', 'apellido']);
        console.log('✅ Validación de campos requeridos exitosa');

        // Verificar si ya existe
        const existing = await BarredorCatalogo.findOne({ 
          where: { 
            [Op.and]: [
              { nombre: item.nombre },
              { apellido: item.apellido }
            ]
          } 
        });
        
        if (existing) {
          console.log(`⚠️ Barredor ya existe: ${item.nombre} ${item.apellido}`);
          results.errors.push({ row: i + 1, error: 'Barredor ya existe en el catálogo' });
          continue;
        }

        console.log('📝 Creando barredor en la base de datos...');
        const barredor = await BarredorCatalogo.create(item);
        console.log('✅ Barredor creado exitosamente:', JSON.stringify(barredor.toJSON(), null, 2));
        
        results.success.push({ id: barredor.id, nombre: `${barredor.nombre} ${barredor.apellido}` });
      } catch (error) {
        console.log(`❌ Error procesando item ${i + 1}:`, error.message);
        console.log('   Stack:', error.stack);
        results.errors.push({ row: i + 1, error: error.message });
      }
    }

    console.log('📊 Resultados finales:', JSON.stringify(results, null, 2));
    
    const response = {
      message: `Procesados ${data.length} registros`,
      success: results.success.length,
      errors: results.errors.length,
      details: results
    };
    
    console.log('📤 Enviando respuesta:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.log('💥 Error general en uploadBarredoresCatalogo:', error.message);
    console.log('   Stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

// Función para obtener plantillas de datos
exports.getTemplates = async (req, res) => {
  try {
    const { entity } = req.params;
    
    const templates = {
      zonas: [
        { nombre: 'Zona Norte' },
        { nombre: 'Zona Sur' },
        { nombre: 'Zona Este' },
        { nombre: 'Zona Oeste' }
      ],
      sectores: [
        { nombre: 'Sector A', zona_id: 1 },
        { nombre: 'Sector B', zona_id: 1 },
        { nombre: 'Sector C', zona_id: 2 }
      ],
      pabellones: [
        { nombre: 'Pabellón 1', sector_id: 1 },
        { nombre: 'Pabellón 2', sector_id: 1 },
        { nombre: 'Pabellón 3', sector_id: 2 }
      ],
      maquinas: [
        { numero: '001', patente: 'ABCD12', marca: 'Caterpillar', modelo: '320D' },
        { numero: '002', patente: 'EFGH34', marca: 'Komatsu', modelo: 'PC200' }
      ],
      operadores: [
        { nombre: 'Juan', apellido: 'Pérez', rut: '12.345.678-9' },
        { nombre: 'María', apellido: 'González', rut: '98.765.432-1' }
      ],
      usuarios: [
        { nombre: 'Admin', apellido: 'Sistema', email: 'admin@empresa.com', password: 'admin123', rol: 'administrador' },
        { nombre: 'Supervisor', apellido: 'General', email: 'supervisor@empresa.com', password: 'super123', rol: 'supervisor' }
      ],
      barredores_catalogo: [
        { nombre: 'Carlos', apellido: 'López' },
        { nombre: 'Ana', apellido: 'Martínez' }
      ]
    };

    if (!templates[entity]) {
      return res.status(400).json({ message: 'Entidad no válida' });
    }

    res.json({
      template: templates[entity],
      fields: Object.keys(templates[entity][0])
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 