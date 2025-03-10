const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const Product = require('../../models/Product');
const productRoutes = require('../../routes/products');
const jwt = require('jsonwebtoken');

// Mock auth middleware
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  };
});

let mongoServer;
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

// Sample product data for testing
const sampleProduct = {
  name: 'Test Medicine',
  genericName: 'Test Generic',
  category: 'Pain Relief',
  manufacturer: 'Test Labs',
  batchNumber: 'TL20230101',
  expiryDate: '2025-01-01',
  stockQuantity: 100,
  unitPrice: 9.99,
  reorderLevel: 20
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
  await Product.deleteMany({});
});

describe('Products API', () => {
  let productId;
  let token;

  beforeEach(async () => {
    // Create a test product
    const product = new Product(sampleProduct);
    const savedProduct = await product.save();
    productId = savedProduct._id.toString();
    
    // Create a mock JWT token
    token = jwt.sign({ id: 'test-user-id' }, 'test-secret-key');
  });

  describe('GET /api/products', () => {
    test('should return all products', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe(sampleProduct.name);
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return a single product by ID', async () => {
      const res = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', productId);
      expect(res.body.name).toBe(sampleProduct.name);
    });

    test('should return 404 if product not found', async () => {
      const nonExistingId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/products/${nonExistingId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/products', () => {
    test('should create a new product', async () => {
      const newProduct = {
        name: 'New Medicine',
        genericName: 'New Generic',
        category: 'Antibiotics',
        manufacturer: 'New Labs',
        batchNumber: 'NL20230202',
        expiryDate: '2025-02-02',
        stockQuantity: 150,
        unitPrice: 14.99,
        reorderLevel: 30
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProduct);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(newProduct.name);
      
      // Verify product was saved to database
      const savedProduct = await Product.findById(res.body._id);
      expect(savedProduct).toBeTruthy();
    });
  });

  describe('PUT /api/products/:id', () => {
    test('should update a product', async () => {
      const updatedInfo = {
        name: 'Updated Medicine',
        unitPrice: 19.99
      };

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedInfo);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', productId);
      expect(res.body.name).toBe(updatedInfo.name);
      expect(res.body.unitPrice).toBe(updatedInfo.unitPrice);
      
      // Verify fields not included in update remain unchanged
      expect(res.body.genericName).toBe(sampleProduct.genericName);
    });

    test('should return 404 if product not found', async () => {
      const nonExistingId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/products/${nonExistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });
      
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/products/:id', () => {
    test('should delete a product', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Product deleted successfully');
      
      // Verify product was deleted from database
      const deletedProduct = await Product.findById(productId);
      expect(deletedProduct).toBeNull();
    });

    test('should return 404 if product not found', async () => {
      const nonExistingId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/products/${nonExistingId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/products/:id/stock', () => {
    test('should increase stock quantity', async () => {
      const adjustment = { adjustment: 50, reason: 'New shipment' };
      const res = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${token}`)
        .send(adjustment);
      
      expect(res.status).toBe(200);
      expect(res.body.stockQuantity).toBe(sampleProduct.stockQuantity + adjustment.adjustment);
    });

    test('should decrease stock quantity', async () => {
      const adjustment = { adjustment: -30, reason: 'Sales' };
      const res = await request(app)
        .patch(`/api/products/${productId}/stock`)
        .set('Authorization', `Bearer ${token}`)
        .send(adjustment);
      
      expect(res.status).toBe(200);
      expect(res.body.stockQuantity).toBe(sampleProduct.stockQuantity + adjustment.adjustment);
    });

    test('should return 404 if product not found', async () => {
      const nonExistingId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/products/${nonExistingId}/stock`)
        .set('Authorization', `Bearer ${token}`)
        .send({ adjustment: 10 });
      
      expect(res.status).toBe(404);
    });
  });
});
