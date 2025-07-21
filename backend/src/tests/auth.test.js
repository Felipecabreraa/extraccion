const request = require('supertest');
const app = require('../app');
const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

describe('Auth Endpoints', () => {
  let testUser;

  beforeAll(async () => {
    // Limpiar base de datos de test
    await Usuario.destroy({ where: {} });
    
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await Usuario.create({
      nombre: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      rol: 'supervisor'
    });
  });

  afterAll(async () => {
    await Usuario.destroy({ where: {} });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('usuario');
      expect(res.body.usuario.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          rol: 'operador'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('usuario');
      expect(res.body.usuario.email).toBe('newuser@example.com');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Duplicate User',
          email: 'test@example.com',
          password: 'password123',
          rol: 'operador'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Incomplete User',
          email: 'incomplete@example.com'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/auth/verify', () => {
    let authToken;

    beforeEach(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = loginRes.body.token;
    });

    it('should verify valid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('usuario');
      expect(res.body.usuario.email).toBe('test@example.com');
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject missing token', async () => {
      const res = await request(app)
        .get('/api/auth/verify');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });
  });
}); 