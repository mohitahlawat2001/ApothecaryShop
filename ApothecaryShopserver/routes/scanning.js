const express = require('express');
const router = express.Router();
const scanningController = require('../controllers/scanningController');
const auth = require('../middleware/auth');

// Scan barcode
router.get('/barcode/:barcode', auth, scanningController.scanBarcode);

// Scan QR code
router.post('/qr', auth, scanningController.scanQRCode);

// Get scanning statistics
router.get('/stats', auth, scanningController.getScanningStats);

// Generate codes for a specific batch
router.post('/generate/:batchId', auth, scanningController.generateBatchCodes);

// Batch generate codes for multiple batches
router.post('/batch-generate', auth, scanningController.batchGenerateCodes);

module.exports = router;