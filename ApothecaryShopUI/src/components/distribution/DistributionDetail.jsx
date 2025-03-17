import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDistributionById, updateDistributionStatus } from '../../services/distributionService';

const DistributionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [distribution, setDistribution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchDistribution();
  }, [id]);

  const fetchDistribution = async () => {
    try {
      const data = await getDistributionById(id);
      setDistribution(data);
    } catch (err) {
      console.error('Error fetching distribution details:', err);
      setError('Failed to load distribution details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
      setUpdatingStatus(true);
      try {
        const updatedDistribution = await updateDistributionStatus(id, newStatus);
        setDistribution(updatedDistribution);
      } catch (err) {
        console.error('Error updating status:', err);
        setError('Failed to update status');
      } finally {
        setUpdatingStatus(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const badgeColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processed': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'returned': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${badgeColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button 
          onClick={() => navigate('/distributions')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Back to List
        </button>
      </div>
    );
  }

  if (!distribution) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center py-8 text-gray-500">
          Distribution order not found
        </div>
        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/distributions')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-gray-700">
          Distribution Order: {distribution.orderNumber}
        </h4>
        <button
          onClick={() => navigate('/distributions')}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Back to List
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="mb-4">
              <h5 className="text-lg font-semibold text-gray-700 mb-2">Order Information</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-1">{getStatusBadge(distribution.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date Created</p>
                    <p className="font-medium">{new Date(distribution.createdAt).toLocaleString()}</p>
                  </div>
                  {distribution.deliveredAt && (
                    <div>
                      <p className="text-sm text-gray-500">Date Delivered</p>
                      <p className="font-medium">{new Date(distribution.deliveredAt).toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="font-medium">{distribution.createdBy?.name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h5 className="text-lg font-semibold text-gray-700 mb-2">Recipient Information</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Recipient Name</p>
                    <p className="font-medium">{distribution.recipient}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recipient Type</p>
                    <p className="font-medium capitalize">{distribution.recipientType}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {distribution.shippingInfo && Object.values(distribution.shippingInfo).some(v => v) && (
              <div className="mb-4">
                <h5 className="text-lg font-semibold text-gray-700 mb-2">Shipping Information</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {distribution.shippingInfo.address && (
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{distribution.shippingInfo.address}</p>
                      </div>
                    )}
                    {distribution.shippingInfo.contactPerson && (
                      <div>
                        <p className="text-sm text-gray-500">Contact Person</p>
                        <p className="font-medium">{distribution.shippingInfo.contactPerson}</p>
                      </div>
                    )}
                    {distribution.shippingInfo.contactNumber && (
                      <div>
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="font-medium">{distribution.shippingInfo.contactNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h5 className="text-lg font-semibold text-gray-700 mb-2">Status Management</h5>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500 mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {['pending', 'processed', 'shipped', 'delivered', 'returned', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updatingStatus || distribution.status === status}
                    className={`px-3 py-1 rounded-md focus:outline-none text-sm 
                    ${distribution.status === status ? 
                      'bg-gray-300 text-gray-500 cursor-not-allowed' : 
                      'bg-blue-500 text-white hover:bg-blue-600'}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              {updatingStatus && (
                <div className="mt-2 text-sm text-blue-500">Updating status...</div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h5 className="text-lg font-semibold text-gray-700 mb-2">Item List</h5>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {distribution.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.product?.code || 'No Code'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.batchNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionDetail;