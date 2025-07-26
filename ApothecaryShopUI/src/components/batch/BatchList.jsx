import React, { useState, useEffect } from 'react';
import { FaBoxes, FaBarcode, FaQrcode, FaExclamationTriangle, FaThermometerHalf } from 'react-icons/fa';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    expiryStatus: 'all',
    sortBy: 'expiryDate',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.expiryStatus !== 'all' && { expiryStatus: filter.expiryStatus })
      });

      const response = await fetch(`/api/batches?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          totalPages: data.totalPages
        }));
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [filter, pagination.page]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'recalled': return 'bg-yellow-100 text-yellow-800';
      case 'depleted': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', text: 'Expired' };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'critical', color: 'text-red-500', text: `${daysUntilExpiry} days` };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', color: 'text-yellow-500', text: `${daysUntilExpiry} days` };
    } else {
      return { status: 'good', color: 'text-green-600', text: `${daysUntilExpiry} days` };
    }
  };

  const handleFilterChange = (key, value) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FaBoxes className="mr-3 text-green-600" />
          Batch Management
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="recalled">Recalled</option>
              <option value="depleted">Depleted</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Status</label>
            <select
              value={filter.expiryStatus}
              onChange={(e) => handleFilterChange('expiryStatus', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All</option>
              <option value="expired">Expired</option>
              <option value="expiring">Expiring Soon</option>
              <option value="active">Good Expiry</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={filter.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="expiryDate">Expiry Date</option>
              <option value="batchNumber">Batch Number</option>
              <option value="currentQuantity">Stock Quantity</option>
              <option value="receivedDate">Received Date</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={filter.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Codes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Storage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => {
                const expiryInfo = getExpiryStatus(batch.expiryDate);
                
                return (
                  <tr key={batch._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {batch.batchNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {batch.supplier?.name || 'Unknown Supplier'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {batch.product?.name || 'Unknown Product'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {batch.product?.genericName}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {batch.currentQuantity} / {batch.initialQuantity}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(batch.currentQuantity / batch.initialQuantity) * 100}%`
                          }}
                        ></div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${expiryInfo.color}`}>
                        {expiryInfo.text}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(batch.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {batch.barcode && (
                          <FaBarcode className="text-gray-600" title="Has Barcode" />
                        )}
                        {batch.qrCode && (
                          <FaQrcode className="text-gray-600" title="Has QR Code" />
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {batch.storageConditions?.temperature?.current && (
                          <div className="flex items-center">
                            <FaThermometerHalf className="text-blue-500 mr-1" />
                            <span className="text-sm text-gray-600">
                              {batch.storageConditions.temperature.current}°C
                            </span>
                          </div>
                        )}
                        {batch.alerts?.some(alert => !alert.acknowledged) && (
                          <FaExclamationTriangle className="text-red-500" title="Has unacknowledged alerts" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchList;