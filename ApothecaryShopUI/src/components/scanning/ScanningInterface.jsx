import React, { useState } from 'react';
import { FaBarcode, FaQrcode, FaSearch, FaBox, FaCube } from 'react-icons/fa';

const ScanningInterface = () => {
  const [scanType, setScanType] = useState('barcode');
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performScan = async () => {
    if (!scanInput.trim()) {
      setError('Please enter a barcode or QR code');
      return;
    }

    setLoading(true);
    setError('');
    setScanResult(null);

    try {
      const token = localStorage.getItem('token');
      let response;

      if (scanType === 'barcode') {
        response = await fetch(`/api/scanning/barcode/${encodeURIComponent(scanInput)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await fetch('/api/scanning/qr', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ qrCode: scanInput })
        });
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setScanResult(data);
      } else {
        setError(data.message || 'No results found');
      }
    } catch (error) {
      setError('Scanning failed. Please try again.');
      console.error('Scanning error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      performScan();
    }
  };

  const clearResults = () => {
    setScanResult(null);
    setScanInput('');
    setError('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderBatchInfo = (batch) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <FaBox className="text-green-600 mr-3 text-2xl" />
        <h3 className="text-xl font-semibold text-gray-900">Batch Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Batch Number</label>
            <p className="text-lg font-semibold text-gray-900">{batch.batchNumber}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Product</label>
            <p className="text-lg text-gray-900">{batch.product?.name}</p>
            <p className="text-sm text-gray-600">{batch.product?.genericName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Supplier</label>
            <p className="text-lg text-gray-900">{batch.supplier?.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Status</label>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              batch.status === 'active' ? 'bg-green-100 text-green-800' :
              batch.status === 'expired' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {batch.status}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Stock Quantity</label>
            <p className="text-lg font-semibold text-gray-900">
              {batch.currentQuantity} / {batch.initialQuantity} units
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${(batch.currentQuantity / batch.initialQuantity) * 100}%`
                }}
              ></div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Manufacturing Date</label>
            <p className="text-lg text-gray-900">{formatDate(batch.manufacturingDate)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Expiry Date</label>
            <p className="text-lg text-gray-900">{formatDate(batch.expiryDate)}</p>
            {new Date(batch.expiryDate) < new Date() && (
              <p className="text-red-600 text-sm font-medium">⚠️ Expired</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Unit Cost</label>
            <p className="text-lg text-gray-900">${batch.unitCost?.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {batch.storageConditions && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-3">Storage Conditions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {batch.storageConditions.temperature?.current && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Temperature</p>
                <p className="text-lg font-semibold text-blue-900">
                  {batch.storageConditions.temperature.current}°C
                </p>
              </div>
            )}
            {batch.storageConditions.humidity?.current && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-800">Humidity</p>
                <p className="text-lg font-semibold text-green-900">
                  {batch.storageConditions.humidity.current}%
                </p>
              </div>
            )}
            {batch.storageConditions.lightExposure && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Light Exposure</p>
                <p className="text-lg font-semibold text-yellow-900 capitalize">
                  {batch.storageConditions.lightExposure}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderProductInfo = (product) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <FaCube className="text-blue-600 mr-3 text-2xl" />
        <h3 className="text-xl font-semibold text-gray-900">Product Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Product Name</label>
            <p className="text-lg font-semibold text-gray-900">{product.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Generic Name</label>
            <p className="text-lg text-gray-900">{product.genericName}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">SKU</label>
            <p className="text-lg text-gray-900">{product.sku}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Category</label>
            <p className="text-lg text-gray-900">{product.category}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Manufacturer</label>
            <p className="text-lg text-gray-900">{product.manufacturer}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Stock Quantity</label>
            <p className="text-lg font-semibold text-gray-900">{product.stockQuantity} units</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Unit Price</label>
            <p className="text-lg text-gray-900">${product.unitPrice?.toFixed(2)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500">Reorder Level</label>
            <p className="text-lg text-gray-900">{product.reorderLevel} units</p>
            {product.stockQuantity <= product.reorderLevel && (
              <p className="text-red-600 text-sm font-medium">⚠️ Low Stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          {scanType === 'barcode' ? (
            <FaBarcode className="mr-3 text-green-600" />
          ) : (
            <FaQrcode className="mr-3 text-green-600" />
          )}
          Barcode/QR Scanner
        </h1>
      </div>

      {/* Scanning Interface */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-4">
          {/* Scan Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scan Type</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setScanType('barcode')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  scanType === 'barcode'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                } border`}
              >
                <FaBarcode className="mr-2" />
                Barcode
              </button>
              <button
                onClick={() => setScanType('qr')}
                className={`flex items-center px-4 py-2 rounded-md ${
                  scanType === 'qr'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                } border`}
              >
                <FaQrcode className="mr-2" />
                QR Code
              </button>
            </div>
          </div>

          {/* Input Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {scanType === 'barcode' ? 'Barcode' : 'QR Code Data'}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Enter ${scanType === 'barcode' ? 'barcode' : 'QR code data'} here...`}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
              <button
                onClick={performScan}
                disabled={loading || !scanInput.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaSearch className="mr-2" />
                    Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Clear Results Button */}
          {(scanResult || error) && (
            <button
              onClick={clearResults}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Scan Failed</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && scanResult.success && (
        <div className="space-y-4">
          {scanResult.type === 'batch' && renderBatchInfo(scanResult.data)}
          {scanResult.type === 'product' && renderProductInfo(scanResult.data)}
        </div>
      )}
    </div>
  );
};

export default ScanningInterface;