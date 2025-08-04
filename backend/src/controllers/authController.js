const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Funciones temporales para evitar dependencia de testUser.js
const getTestCredentials = () => {
  return {
    user: {
      id: 999,
      username: 'test_user',
      email: 'test@extraccion.com',
      nombre: 'Usuario de Prueba',
      rol: 'admin',
      activo: true
    },
    token: 'test_token_extraccion_2025',
    environment: 'test'
  };
};

const isTestEnvironment = () => {
  return process.env.NODE_ENV === 'test' || process.env.ENVIRONMENT === 'test';
};

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

// Endpoint para crear usuario de prueba
exports.createTestUser = async (req, res) => {
  try {
    console.log('🔧 Creando usuario de prueba...');
    
    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({ 
      where: { email: 'test@extraccion.com' } 
    });
    
    if (existingUser) {
      console.log('✅ Usuario de prueba ya existe');
      return res.json({ 
        message: 'Usuario de prueba ya existe',
        usuario: {
          id: existingUser.id,
          nombre: existingUser.nombre,
          email: existingUser.email,
          rol: existingUser.rol
        }
      });
    }
    
    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Crear usuario de prueba
    const testUser = await Usuario.create({
      nombre: 'Usuario de Prueba',
      email: 'test@extraccion.com',
      password: hashedPassword,
      rol: 'admin',
      activo: true
    });
    
    console.log('✅ Usuario de prueba creado exitosamente');
    res.json({ 
      message: 'Usuario de prueba creado exitosamente',
      usuario: {
        id: testUser.id,
        nombre: testUser.nombre,
        email: testUser.email,
        rol: testUser.rol
      }
    });
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error);
    res.status(500).json({ message: 'Error creando usuario de prueba', error: error.message });
  }
};

// Endpoint de debug para verificar el ambiente
exports.debug = (req, res) => {
  try {
    const debugInfo = {
      NODE_ENV: process.env.NODE_ENV,
      ENVIRONMENT: process.env.ENVIRONMENT,
      isTestEnvironment: isTestEnvironment(),
      testCredentials: getTestCredentials(),
      timestamp: new Date().toISOString()
    };
    res.json(debugInfo);
  } catch (err) {
    res.status(500).json({ message: 'Error en debug', error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    const hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, email, password: hash, rol });
    res.status(201).json({ message: 'Usuario registrado', usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
  } catch (err) {
    res.status(500).json({ message: 'Error en el registro', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 Login intento:', { email, environment: process.env.NODE_ENV });
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }
    
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      console.log('❌ Contraseña inválida para:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    console.log('✅ Login exitoso para:', email);
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ 
      token, 
      usuario: { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        email: usuario.email, 
        rol: usuario.rol 
      },
      environment: process.env.NODE_ENV || 'production'
    });
  } catch (err) {
    console.error('❌ Error en login:', err);
    res.status(500).json({ message: 'Error en el login', error: err.message });
  }
};

exports.verify = (req, res) => {
  res.json({ usuario: req.usuario });
}; 