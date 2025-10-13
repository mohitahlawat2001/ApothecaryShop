// Quick validation test
const Joi = require('joi');
const { validate } = require('./middleware/validation');
const { userSchemas, productSchemas } = require('./validation/schemas');

console.log('🧪 Testing validation system...\n');

// Test 1: User registration validation
console.log('Test 1: User Registration Validation');
try {
  const mockReq = {
    body: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      role: 'staff'
    }
  };
  
  const { error } = userSchemas.register.validate(mockReq.body);
  if (error) {
    console.log('❌ Failed:', error.details[0].message);
  } else {
    console.log('✅ Valid user registration data passed');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

// Test 2: Invalid email format
console.log('\nTest 2: Invalid Email Validation');
try {
  const mockReq = {
    body: {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'SecurePass123!',
      role: 'staff'
    }
  };
  
  const { error } = userSchemas.register.validate(mockReq.body);
  if (error) {
    console.log('✅ Correctly rejected invalid email:', error.details[0].message);
  } else {
    console.log('❌ Should have failed validation');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

// Test 3: Product creation validation
console.log('\nTest 3: Product Creation Validation');
try {
  const mockReq = {
    body: {
      name: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      category: 'Pain Relief',
      manufacturer: 'PharmaCorp Ltd',
      batchNumber: 'PCM20231015',
      expiryDate: '2025-12-31',
      stockQuantity: 100,
      unitPrice: 5.99,
      reorderLevel: 20,
      description: 'Over-the-counter pain reliever'
    }
  };
  
  const { error } = productSchemas.create.validate(mockReq.body);
  if (error) {
    console.log('❌ Failed:', error.details[0].message);
  } else {
    console.log('✅ Valid product data passed');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

// Test 4: Invalid product data
console.log('\nTest 4: Invalid Product Data');
try {
  const mockReq = {
    body: {
      name: 'A', // Too short
      genericName: 'Paracetamol',
      category: 'Pain Relief',
      manufacturer: 'PharmaCorp Ltd',
      batchNumber: 'PCM20231015',
      expiryDate: '2020-12-31', // Past date
      stockQuantity: -5, // Negative
      unitPrice: -1.99, // Negative
      reorderLevel: 20
    }
  };
  
  const { error } = productSchemas.create.validate(mockReq.body, { abortEarly: false });
  if (error) {
    console.log('✅ Correctly rejected invalid product data:');
    error.details.forEach(detail => {
      console.log(`   - ${detail.path.join('.')}: ${detail.message}`);
    });
  } else {
    console.log('❌ Should have failed validation');
  }
} catch (err) {
  console.log('❌ Error:', err.message);
}

console.log('\n🎉 Validation system test completed!');
console.log('\n📖 For full documentation, see: docs/VALIDATION.md');
