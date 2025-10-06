const express = require('express');
const router = express.Router();
const Supplier = require('../models/supplier');
const { adminOnly, staffAccess } = require('../middleware/roleCheck');

// GET http://localhost:5000/api/suppliers
// Headers: { "Authorization": "Bearer YOUR_TOKEN_HERE" }
router.get('/', staffAccess, async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET http://localhost:5000/api/suppliers/SUPPLIER_ID_HERE
// Headers: { "Authorization": "Bearer YOUR_TOKEN_HERE" }
router.get('/:id', staffAccess, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/*
POST http://localhost:5000/api/suppliers
Headers: { "Authorization": "Bearer YOUR_TOKEN_HERE", "Content-Type": "application/json" }
Body: 
{
  "name": "ABC Pharmaceuticals",
  "contactPerson": "John Doe",
  "email": "john@abcpharma.com",
  "phone": "123-456-7890",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "taxId": "ABCDE1234F",
  "isJanAushadhi": false,
  "paymentTerms": "Net 30",
  "rating": 4,
  "status": "active"
}
*/
router.post('/', adminOnly, async (req, res) => {
  const supplier = new Supplier(req.body);
  try {
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
/*
PUT http://localhost:5000/api/suppliers/SUPPLIER_ID_HERE
Headers: { "Authorization": "Bearer YOUR_TOKEN_HERE", "Content-Type": "application/json" }
Body: 
{
  "name": "ABC Pharmaceuticals Updated",
  "contactPerson": "Jane Smith",
  "rating": 5
}
  */
router.put('/:id', adminOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE http://localhost:5000/api/suppliers/SUPPLIER_ID_HERE
// Headers: { "Authorization": "Bearer YOUR_TOKEN_HERE" }
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;