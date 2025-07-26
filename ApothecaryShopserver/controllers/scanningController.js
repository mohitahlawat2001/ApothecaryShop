const ScanningService = require('../services/scanningService');

// Scan barcode
const scanBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    const result = await ScanningService.scanBarcode(barcode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Scan QR code
const scanQRCode = async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({ error: 'QR code data is required' });
    }

    const result = await ScanningService.scanQRCode(qrCode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate codes for a batch
const generateBatchCodes = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { generateBarcode, generateQRCode, customBarcode, customQRCode } = req.body;

    const updatedBatch = await ScanningService.updateBatchCodes(batchId, {
      generateBarcode,
      generateQRCode,
      customBarcode,
      customQRCode
    });

    res.json(updatedBatch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get scanning statistics
const getScanningStats = async (req, res) => {
  try {
    const stats = await ScanningService.getScanningStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Batch generate codes for multiple batches
const batchGenerateCodes = async (req, res) => {
  try {
    const { missingBarcode = true, missingQRCode = true } = req.body;
    
    const result = await ScanningService.batchGenerateCodes({
      missingBarcode,
      missingQRCode
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  scanBarcode,
  scanQRCode,
  generateBatchCodes,
  getScanningStats,
  batchGenerateCodes
};