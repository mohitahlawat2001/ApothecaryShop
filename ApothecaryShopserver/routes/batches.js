const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const auth = require('../middleware/auth'); // Assuming auth middleware exists

// Get all batches with filtering
router.get('/', auth, batchController.getBatches);

// Get batch analytics
router.get('/analytics', auth, batchController.getBatchAnalytics);

// Get expiring batches
router.get('/expiring', auth, batchController.getExpiringBatches);

// Get expired batches
router.get('/expired', auth, batchController.getExpiredBatches);

// Find batch by barcode/QR code
router.get('/scan/:type/:code', auth, batchController.findBatchByCode);

// Get batch by ID
router.get('/:id', auth, batchController.getBatchById);

// Create new batch
router.post('/', auth, batchController.createBatch);

// Update batch
router.put('/:id', auth, batchController.updateBatch);

// Update storage conditions
router.patch('/:id/storage', auth, batchController.updateStorageConditions);

// Add alert to batch
router.post('/:id/alerts', auth, batchController.addAlert);

// Acknowledge alert
router.patch('/:batchId/alerts/:alertId/acknowledge', auth, batchController.acknowledgeAlert);

module.exports = router;