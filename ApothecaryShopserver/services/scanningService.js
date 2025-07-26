const Batch = require('../models/Batch');
const Product = require('../models/Product');

// Barcode/QR scanning service
class ScanningService {
  
  // Generate barcode for a batch
  static generateBarcode(batchNumber, productId) {
    // Simple barcode format: AP-{PRODUCT_ID_LAST_6}-{BATCH_NUMBER}
    const productIdShort = productId.toString().slice(-6);
    return `AP-${productIdShort}-${batchNumber}`;
  }

  // Generate QR code data for a batch
  static generateQRCode(batch) {
    // QR code contains JSON data with batch information
    const qrData = {
      type: 'pharmaceutical_batch',
      batchNumber: batch.batchNumber,
      productId: batch.product,
      manufacturingDate: batch.manufacturingDate,
      expiryDate: batch.expiryDate,
      supplier: batch.supplier,
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(qrData);
  }

  // Scan and lookup batch by barcode
  static async scanBarcode(barcode) {
    try {
      // First try direct barcode lookup
      let batch = await Batch.findOne({ barcode })
        .populate('product')
        .populate('supplier');

      if (batch) {
        return {
          success: true,
          type: 'batch',
          data: batch
        };
      }

      // If not found, try to parse barcode and find by batch number
      const parts = barcode.split('-');
      if (parts.length >= 3 && parts[0] === 'AP') {
        const batchNumber = parts.slice(2).join('-');
        batch = await Batch.findOne({ batchNumber })
          .populate('product')
          .populate('supplier');

        if (batch) {
          return {
            success: true,
            type: 'batch',
            data: batch
          };
        }
      }

      // Try to find product by SKU if it matches barcode format
      const product = await Product.findOne({ sku: barcode });
      if (product) {
        return {
          success: true,
          type: 'product',
          data: product
        };
      }

      return {
        success: false,
        message: 'No batch or product found for this barcode'
      };
    } catch (error) {
      throw new Error(`Scanning error: ${error.message}`);
    }
  }

  // Scan and lookup batch by QR code
  static async scanQRCode(qrCode) {
    try {
      // First try direct QR code lookup
      let batch = await Batch.findOne({ qrCode })
        .populate('product')
        .populate('supplier');

      if (batch) {
        return {
          success: true,
          type: 'batch',
          data: batch
        };
      }

      // Try to parse QR code as JSON
      try {
        const qrData = JSON.parse(qrCode);
        
        if (qrData.type === 'pharmaceutical_batch' && qrData.batchNumber) {
          batch = await Batch.findOne({ batchNumber: qrData.batchNumber })
            .populate('product')
            .populate('supplier');

          if (batch) {
            return {
              success: true,
              type: 'batch',
              data: batch,
              qrData: qrData
            };
          }
        }
      } catch (parseError) {
        // QR code is not JSON, try as plain text
      }

      return {
        success: false,
        message: 'No batch found for this QR code'
      };
    } catch (error) {
      throw new Error(`QR scanning error: ${error.message}`);
    }
  }

  // Update batch with barcode/QR code
  static async updateBatchCodes(batchId, options = {}) {
    try {
      const batch = await Batch.findById(batchId);
      if (!batch) {
        throw new Error('Batch not found');
      }

      const updates = {};

      // Generate barcode if requested or not present
      if (options.generateBarcode || !batch.barcode) {
        updates.barcode = this.generateBarcode(batch.batchNumber, batch.product);
      }

      // Generate QR code if requested or not present
      if (options.generateQRCode || !batch.qrCode) {
        updates.qrCode = this.generateQRCode(batch);
      }

      // Allow custom codes
      if (options.customBarcode) {
        updates.barcode = options.customBarcode;
      }
      
      if (options.customQRCode) {
        updates.qrCode = options.customQRCode;
      }

      const updatedBatch = await Batch.findByIdAndUpdate(
        batchId,
        updates,
        { new: true }
      ).populate('product supplier');

      return updatedBatch;
    } catch (error) {
      throw new Error(`Failed to update batch codes: ${error.message}`);
    }
  }

  // Get scanning statistics
  static async getScanningStats() {
    try {
      const stats = await Batch.aggregate([
        {
          $group: {
            _id: null,
            totalBatches: { $sum: 1 },
            withBarcode: {
              $sum: {
                $cond: [
                  { $and: [{ $ne: ['$barcode', null] }, { $ne: ['$barcode', ''] }] },
                  1,
                  0
                ]
              }
            },
            withQRCode: {
              $sum: {
                $cond: [
                  { $and: [{ $ne: ['$qrCode', null] }, { $ne: ['$qrCode', ''] }] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const result = stats[0] || { totalBatches: 0, withBarcode: 0, withQRCode: 0 };
      
      return {
        ...result,
        barcodePercentage: result.totalBatches > 0 ? (result.withBarcode / result.totalBatches * 100).toFixed(2) : 0,
        qrCodePercentage: result.totalBatches > 0 ? (result.withQRCode / result.totalBatches * 100).toFixed(2) : 0
      };
    } catch (error) {
      throw new Error(`Failed to get scanning stats: ${error.message}`);
    }
  }

  // Batch generate codes for existing batches without codes
  static async batchGenerateCodes(options = {}) {
    try {
      const filter = {};
      
      if (options.missingBarcode) {
        filter.$or = filter.$or || [];
        filter.$or.push({ barcode: { $in: [null, ''] } });
      }
      
      if (options.missingQRCode) {
        filter.$or = filter.$or || [];
        filter.$or.push({ qrCode: { $in: [null, ''] } });
      }

      const batches = await Batch.find(filter);
      const updated = [];

      for (const batch of batches) {
        const updates = {};
        
        if (!batch.barcode || batch.barcode === '') {
          updates.barcode = this.generateBarcode(batch.batchNumber, batch.product);
        }
        
        if (!batch.qrCode || batch.qrCode === '') {
          updates.qrCode = this.generateQRCode(batch);
        }

        if (Object.keys(updates).length > 0) {
          await Batch.findByIdAndUpdate(batch._id, updates);
          updated.push(batch._id);
        }
      }

      return {
        processed: batches.length,
        updated: updated.length,
        batchIds: updated
      };
    } catch (error) {
      throw new Error(`Failed to batch generate codes: ${error.message}`);
    }
  }
}

module.exports = ScanningService;