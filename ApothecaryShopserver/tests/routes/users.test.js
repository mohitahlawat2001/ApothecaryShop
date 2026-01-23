const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const User = require('../../models/user');
const userRoutes = require('../../routes/users');

// Mock auth middleware - simulating admin user
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { 
      id: 'test-admin-id',
      role: 'admin'
    };
    next();
  };
});

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Sample user data for testing
const sampleAdminUser = {
  name: 'Admin User',
  email: 'admin@test.com',
  password: 'AdminPass123!',
  role: 'admin'
};

const sampleStaffUser = {
  name: 'Staff User',
  email: 'staff@test.com',
  password: 'StaffPass123!',
  role: 'staff'
};

// Setup database connection
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Close database connection
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database after each test
afterEach(async () => {
  await User.deleteMany({});
});

describe('User Management API Tests', () => {
  
  describe('POST /api/users - Create User', () => {
    it('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/users')
        .send(sampleStaffUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.email).toBe(sampleStaffUser.email);
      expect(response.body.data).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should prevent duplicate email registration', async () => {
      // Create first user
      await request(app)
        .post('/api/users')
        .send(sampleStaffUser)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/users')
        .send(sampleStaffUser)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already registered');
    });

    it('should validate required fields', async () => {
      const invalidUser = {
        name: 'Test',
        email: 'invalid-email', // Invalid email format
        password: '123', // Too short password
        role: 'staff'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate role enum', async () => {
      const invalidUser = {
        ...sampleStaffUser,
        role: 'invalid-role'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users - Get All Users', () => {
    beforeEach(async () => {
      // Create some test users
      await User.create(sampleAdminUser);
      await User.create(sampleStaffUser);
      await User.create({
        name: 'Another Staff',
        email: 'staff2@test.com',
        password: 'StaffPass123!',
        role: 'staff'
      });
    });

    it('should get all users with pagination', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toHaveProperty('total', 3);
      expect(response.body.pagination).toHaveProperty('pages');
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ role: 'staff' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every(user => user.role === 'staff')).toBe(true);
    });

    it('should search users by name or email', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ search: 'Admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('Admin');
    });

    it('should not return passwords in user data', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(user => {
        expect(user).not.toHaveProperty('password');
      });
    });
  });

  describe('GET /api/users/:id - Get User By ID', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create(sampleStaffUser);
      userId = user._id.toString();
    });

    it('should get a user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(userId);
      expect(response.body.data.email).toBe(sampleStaffUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id - Update User', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create(sampleStaffUser);
      userId = user._id.toString();
    });

    it('should update user details', async () => {
      const updates = {
        name: 'Updated Name',
        role: 'admin'
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.data.name).toBe(updates.name);
      expect(response.body.data.role).toBe(updates.role);
    });

    it('should update user password', async () => {
      const updates = {
        password: 'NewPassword123!'
      };

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Verify password was hashed
      const user = await User.findById(userId);
      expect(user.password).not.toBe(updates.password);
    });

    it('should prevent duplicate email on update', async () => {
      // Create another user
      await User.create({
        name: 'Another User',
        email: 'another@test.com',
        password: 'AnotherPass123!',
        role: 'staff'
      });

      // Try to update to existing email
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .send({ email: 'another@test.com' })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email already in use');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/users/${fakeId}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id - Delete User', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create(sampleStaffUser);
      userId = user._id.toString();
    });

    it('should delete a user', async () => {
      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user was deleted
      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/stats - Get User Statistics', () => {
    beforeEach(async () => {
      // Create test users with different roles and providers
      await User.create({
        name: 'Admin 1',
        email: 'admin1@test.com',
        password: 'AdminPass123!',
        role: 'admin',
        provider: 'local'
      });

      await User.create({
        name: 'Admin 2',
        email: 'admin2@test.com',
        password: 'AdminPass123!',
        role: 'admin',
        provider: 'google',
        googleId: 'google123'
      });

      await User.create({
        name: 'Staff 1',
        email: 'staff1@test.com',
        password: 'StaffPass123!',
        role: 'staff',
        provider: 'local'
      });

      await User.create({
        name: 'Staff 2',
        email: 'staff2@test.com',
        password: 'StaffPass123!',
        role: 'staff',
        provider: 'facebook',
        facebookId: 'fb123'
      });
    });

    it('should get user statistics', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total', 4);
      expect(response.body.data.byRole).toHaveProperty('admin', 2);
      expect(response.body.data.byRole).toHaveProperty('staff', 2);
      expect(response.body.data.byProvider).toHaveProperty('local', 2);
      expect(response.body.data.byProvider).toHaveProperty('google', 1);
      expect(response.body.data.byProvider).toHaveProperty('facebook', 1);
      expect(response.body.data).toHaveProperty('recentUsers');
    });
  });

  describe('PATCH /api/users/:id/status - Toggle User Status', () => {
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        ...sampleStaffUser,
        isActive: true
      });
      userId = user._id.toString();
    });

    it('should toggle user status if isActive field exists', async () => {
      // Check if user model has isActive field
      const user = await User.findById(userId);
      
      if (user.isActive !== undefined) {
        const response = await request(app)
          .patch(`/api/users/${userId}/status`)
          .send({ isActive: false })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.isActive).toBe(false);
      } else {
        // Expected behavior when field doesn't exist
        const response = await request(app)
          .patch(`/api/users/${userId}/status`)
          .send({ isActive: false })
          .expect(501);

        expect(response.body.success).toBe(false);
      }
    });
  });
});
