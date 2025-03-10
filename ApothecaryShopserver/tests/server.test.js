const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test_user@example.com',
  password: 'password123',
  role: 'staff'
};

// Clear test users before and after tests
beforeAll(async () => {
  const User = mongoose.model('User');
  await User.deleteMany({ email: testUser.email });
});

afterAll(async () => {
  const User = mongoose.model('User');
  await User.deleteMany({ email: testUser.email });
  await mongoose.connection.close();
  server.close();
});

describe('Auth Endpoints', () => {
  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/register')
        .send(testUser)
        .expect(201);
      
      expect(res.body.message).toBe('User registered successfully');
    });

    it('should fail registering with existing email', async () => {
      const res = await request(app)
        .post('/api/register')
        .send(testUser);
      
      expect(res.status).not.toBe(201);
    });
  });

  describe('POST /api/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);
      
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).toHaveProperty('role', testUser.role);
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(400);
      
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        })
        .expect(400);
      
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
