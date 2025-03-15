const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const supplierRoutes = require('../../routes/suppliers');
const Supplier = require('../../models/supplier');
const auth = require('../../middleware/auth');
const { adminOnly, staffAccess } = require('../../middleware/roleCheck');

// Mock middleware
jest.mock('../../middleware/auth', () => {
  return jest.fn((req, res, next) => next());
});

jest.mock('../../middleware/roleCheck', () => ({
  adminOnly: jest.fn((req, res, next) => next()),
  staffAccess: jest.fn((req, res, next) => next())
}));

// Sample data for testing
const mockSupplier = {
  name: "Test Pharmaceuticals",
  contactPerson: "Test Person",
  email: "test@testpharma.com",
  phone: "123-456-7890",
  address: {
    street: "123 Test St",
    city: "Test City",
    state: "Test State",
    zipCode: "123456",
    country: "Test Country"
  },
  taxId: "TEST1234G",
  isJanAushadhi: false,
  paymentTerms: "Net 30",
  rating: 4,
  status: "active"
};

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/api/suppliers', supplierRoutes);

// Setup in-memory database for testing
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Supplier.deleteMany({});
});

describe('Supplier Routes', () => {
  describe('GET /api/suppliers', () => {
    test('should return all suppliers', async () => {
      // Create test suppliers
      await Supplier.create(mockSupplier);
      await Supplier.create({
        ...mockSupplier, 
        name: "Another Supplier",
        email: "another@test.com"
      });

      const response = await request(app).get('/api/suppliers');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
      expect(auth).toHaveBeenCalled();
      expect(staffAccess).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      // Force an error
      jest.spyOn(Supplier, 'find').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/api/suppliers');
      
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Database error');
    });
  });

  describe('GET /api/suppliers/:id', () => {
    test('should return a single supplier', async () => {
      const supplier = await Supplier.create(mockSupplier);
      
      const response = await request(app).get(`/api/suppliers/${supplier._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(mockSupplier.name);
      expect(auth).toHaveBeenCalled();
      expect(staffAccess).toHaveBeenCalled();
    });

    test('should return 404 if supplier not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app).get(`/api/suppliers/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Supplier not found');
    });
  });

  describe('POST /api/suppliers', () => {
    test('should create a new supplier', async () => {
      const response = await request(app)
        .post('/api/suppliers')
        .send(mockSupplier);
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(mockSupplier.name);
      expect(auth).toHaveBeenCalled();
      expect(adminOnly).toHaveBeenCalled();

      // Verify supplier was saved to database
      const supplierInDb = await Supplier.findById(response.body._id);
      expect(supplierInDb).toBeTruthy();
    });

    test('should handle validation errors', async () => {
      // Use empty object to trigger validation errors
      const invalidSupplier = {};
      
      // Mock the save method to simulate validation error
      jest.spyOn(mongoose.Model.prototype, 'save').mockImplementationOnce(() => {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        throw error;
      });
      
      const response = await request(app)
        .post('/api/suppliers')
        .send(invalidSupplier);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBeTruthy();
      
      // Restore the mock
      mongoose.Model.prototype.save.mockRestore();
    });
  });

  describe('PUT /api/suppliers/:id', () => {
    test('should update an existing supplier', async () => {
      const supplier = await Supplier.create(mockSupplier);
      const updates = {
        name: "Updated Supplier Name",
        rating: 5
      };
      
      const response = await request(app)
        .put(`/api/suppliers/${supplier._id}`)
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updates.name);
      expect(response.body.rating).toBe(updates.rating);
      expect(auth).toHaveBeenCalled();
      expect(adminOnly).toHaveBeenCalled();
    });

    test('should return 404 if supplier not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/suppliers/${nonExistentId}`)
        .send({ name: "Updated Name" });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Supplier not found');
    });
  });

  describe('DELETE /api/suppliers/:id', () => {
    test('should delete a supplier', async () => {
      const supplier = await Supplier.create(mockSupplier);
      
      const response = await request(app)
        .delete(`/api/suppliers/${supplier._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Supplier deleted successfully');
      expect(auth).toHaveBeenCalled();
      expect(adminOnly).toHaveBeenCalled();

      // Verify supplier was removed from database
      const supplierInDb = await Supplier.findById(supplier._id);
      expect(supplierInDb).toBeNull();
    });

    test('should return 404 if supplier not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/suppliers/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Supplier not found');
    });
  });
});
