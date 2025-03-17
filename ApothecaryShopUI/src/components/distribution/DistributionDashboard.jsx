import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDistributionReports } from '../../services/distributionService';

const DistributionDashboard = () => {
  const [reportData, setReportData] = useState({
    statusCounts: [],
    topRecipients: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getDistributionReports(filters);
      setReportData(data);
    } catch (err) {
      console.error('Error fetching distribution reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: ''
    });
    setTimeout(fetchReports, 0);
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500',
      'processed': 'bg-blue-500',
      'shipped': 'bg-indigo-500',
      'delivered': 'bg-green-500',
      'returned': 'bg-red-500',
      'cancelled': 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-300';
  };

  // Format date range for display
  const getDateRangeText = () => {
    if (filters.startDate && filters.endDate) {
      return `${new Date(filters.startDate).toLocaleDateString()} to ${new Date(filters.endDate).toLocaleDateString()}`;
    } else if (filters.startDate) {
      return `From ${new Date(filters.startDate).toLocaleDateString()}`;
    } else if (filters.endDate) {
      return `Until ${new Date(filters.endDate).toLocaleDateString()}`;
    }
    return 'All Time';
  };

  // Calculate total count for percentage
  const getTotalStatusCount = () => {
    return reportData.statusCounts.reduce((sum, item) => sum + item.count, 0) || 1;
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-gray-700">Distribution Analytics</h4>
        <Link to="/distributions">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            View All Orders
          </button>
        </Link>
      </div>
      
      <div className="p-6">
        <form onSubmit={applyFilters} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <div className="flex space-x-2">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Apply
                </button>
                <button 
                  type="button" 
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h5 className="text-lg font-semibold text-gray-700 mb-3">
                Distribution Status Summary <span className="font-normal text-sm text-gray-500">({getDateRangeText()})</span>
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {reportData.statusCounts.map((status) => {
                      const percentage = Math.round((status.count / getTotalStatusCount()) * 100);
                      return (
                        <div key={status._id} className="relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium capitalize">{status._id}</span>
                            <span className="text-sm text-gray-500">{status.count} ({percentage}%)</span>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div 
                              style={{ width: `${percentage}%` }} 
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getStatusColor(status._id)}`}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {reportData.statusCounts.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No distribution data available
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    {['pending', 'processed', 'shipped', 'delivered', 'returned', 'cancelled'].map(status => {
                      const statusData = reportData.statusCounts.find(s => s._id === status) || { count: 0 };
                      return (
                        <div key={status} className="bg-gray-50 p-4 rounded-lg">
                          <h6 className="text-sm text-gray-500 capitalize">{status}</h6>
                          <p className="text-2xl font-bold">{statusData.count}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-lg font-semibold text-gray-700 mb-3">Top Recipients</h5>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {reportData.topRecipients.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {reportData.topRecipients.map((recipient, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">{recipient._id}</td>
                              <td className="px-4 py-3">{recipient.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No recipient data available
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h5 className="text-lg font-semibold text-gray-700 mb-3">Most Distributed Products</h5>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {reportData.topProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {reportData.topProducts.map((product, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">{product.product?.name || 'Unknown Product'}</div>
                                  <div className="text-sm text-gray-500">{product.product?.code || 'No Code'}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">{product.totalQuantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No product distribution data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DistributionDashboard;