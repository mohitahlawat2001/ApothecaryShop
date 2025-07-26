const Batch = require('../models/Batch');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// Get all batches with filtering and pagination
const getBatches = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      product,
      status,
      expiryStatus,
      supplier,
      sortBy = 'expiryDate',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};
    
    if (product) filter.product = product;
    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;
    
    // Filter by expiry status
    if (expiryStatus === 'expired') {
      filter.expiryDate = { $lt: new Date() };
    } else if (expiryStatus === 'expiring') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filter.expiryDate = { $lte: thirtyDaysFromNow, $gt: new Date() };
    } else if (expiryStatus === 'active') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filter.expiryDate = { $gt: thirtyDaysFromNow };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        { path: 'product', select: 'name genericName category manufacturer' },
        { path: 'supplier', select: 'name contactInfo' },
        { path: 'receivedBy', select: 'name email' }
      ]
    };

    const batches = await Batch.find(filter)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Batch.countDocuments(filter);

    res.json({
      batches,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get batch by ID
const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('product')
      .populate('supplier')
      .populate('receivedBy')
      .populate('purchaseReceipt')
      .populate('alerts.acknowledgedBy', 'name email');

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new batch
const createBatch = async (req, res) => {
  try {
    const batchData = {
      ...req.body,
      receivedBy: req.user.id,
      lastModifiedBy: req.user.id
    };

    const batch = new Batch(batchData);
    await batch.save();
    await batch.populate('product supplier receivedBy');

    // Update product stock if needed
    if (batchData.updateProductStock) {
      const product = await Product.findById(batchData.product);
      if (product) {
        product.stockQuantity += batchData.initialQuantity;
        await product.save();

        // Create stock movement record
        const stockMovement = new StockMovement({
          product: product._id,
          type: 'in',
          quantity: batchData.initialQuantity,
          reason: `New batch received: ${batch.batchNumber}`,
          previousStock: product.stockQuantity - batchData.initialQuantity,
          newStock: product.stockQuantity,
          batchNumber: batch.batchNumber,
          expiryDate: batch.expiryDate,
          createdBy: req.user.id
        });
        await stockMovement.save();
      }
    }

    res.status(201).json(batch);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Batch already exists for this product' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
};

// Update batch
const updateBatch = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      lastModifiedBy: req.user.id
    };

    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('product supplier receivedBy');

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json(batch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update storage conditions (for IoT integration)
const updateStorageConditions = async (req, res) => {
  try {
    const { temperature, humidity, lightExposure } = req.body;
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Update storage conditions
    if (temperature !== undefined) {
      batch.storageConditions.temperature.current = temperature;
      batch.storageConditions.temperature.lastUpdated = new Date();
      
      // Check for temperature violations
      const { min, max } = batch.storageConditions.temperature;
      if (min && temperature < min) {
        await batch.addAlert(
          'temperature_violation',
          `Temperature below minimum: ${temperature}°C (Min: ${min}°C)`,
          'high'
        );
      } else if (max && temperature > max) {
        await batch.addAlert(
          'temperature_violation',
          `Temperature above maximum: ${temperature}°C (Max: ${max}°C)`,
          'high'
        );
      }
    }

    if (humidity !== undefined) {
      batch.storageConditions.humidity.current = humidity;
      batch.storageConditions.humidity.lastUpdated = new Date();
    }

    if (lightExposure) {
      batch.storageConditions.lightExposure = lightExposure;
    }

    batch.lastModifiedBy = req.user.id;
    await batch.save();

    res.json(batch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get expiring batches
const getExpiringBatches = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const batches = await Batch.findExpiringBatches(parseInt(days));
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get expired batches
const getExpiredBatches = async (req, res) => {
  try {
    const batches = await Batch.findExpiredBatches();
    res.json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add alert to batch
const addAlert = async (req, res) => {
  try {
    const { type, message, severity } = req.body;
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    await batch.addAlert(type, message, severity);
    res.json(batch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Acknowledge alert
const acknowledgeAlert = async (req, res) => {
  try {
    const { batchId, alertId } = req.params;
    const batch = await Batch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    await batch.acknowledgeAlert(alertId, req.user.id);
    res.json({ message: 'Alert acknowledged' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get batch analytics
const getBatchAnalytics = async (req, res) => {
  try {
    const analytics = await Batch.aggregate([
      {
        $facet: {
          statusDistribution: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          expiryAnalysis: [
            {
              $addFields: {
                daysUntilExpiry: {
                  $divide: [
                    { $subtract: ['$expiryDate', new Date()] },
                    1000 * 60 * 60 * 24
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                expired: {
                  $sum: { $cond: [{ $lt: ['$daysUntilExpiry', 0] }, 1, 0] }
                },
                expiring30Days: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ['$daysUntilExpiry', 0] },
                          { $lte: ['$daysUntilExpiry', 30] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                active: {
                  $sum: { $cond: [{ $gt: ['$daysUntilExpiry', 30] }, 1, 0] }
                }
              }
            }
          ],
          stockValue: [
            {
              $group: {
                _id: null,
                totalValue: { $sum: { $multiply: ['$currentQuantity', '$unitCost'] } },
                totalQuantity: { $sum: '$currentQuantity' }
              }
            }
          ],
          alertsSummary: [
            { $unwind: '$alerts' },
            {
              $group: {
                _id: '$alerts.type',
                count: { $sum: 1 },
                unacknowledged: {
                  $sum: { $cond: [{ $eq: ['$alerts.acknowledged', false] }, 1, 0] }
                }
              }
            }
          ]
        }
      }
    ]);

    res.json(analytics[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Find batch by barcode/QR code
const findBatchByCode = async (req, res) => {
  try {
    const { code, type } = req.params; // type: 'barcode' or 'qr'
    
    const query = type === 'qr' ? { qrCode: code } : { barcode: code };
    
    const batch = await Batch.findOne(query)
      .populate('product')
      .populate('supplier');

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  updateStorageConditions,
  getExpiringBatches,
  getExpiredBatches,
  addAlert,
  acknowledgeAlert,
  getBatchAnalytics,
  findBatchByCode
};