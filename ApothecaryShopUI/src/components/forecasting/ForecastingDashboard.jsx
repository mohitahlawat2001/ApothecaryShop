import React, { useState, useEffect } from 'react';
import { FaChartLine, FaExclamationTriangle, FaShoppingCart, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const ForecastingDashboard = () => {
  const [analytics, setAnalytics] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [forecast, setForecast] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/forecasting/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/forecasting/recommendations?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductForecast = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/forecasting/product/${productId}?days=30`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setForecast(data);
      }
    } catch (error) {
      console.error('Failed to fetch product forecast:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchRecommendations();
  }, []);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <FaArrowUp className="text-red-500" />;
      case 'decreasing': return <FaArrowDown className="text-green-500" />;
      default: return <span className="text-gray-500">—</span>;
    }
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
          <FaChartLine className="mr-3 text-green-600" />
          Inventory Forecasting
        </h1>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaChartLine className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalProducts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-2xl font-semibold text-red-600">{analytics.lowStockProducts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">%</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock %</p>
              <p className="text-2xl font-semibold text-yellow-600">{analytics.lowStockPercentage || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Reorder Needed</p>
              <p className="text-2xl font-semibold text-green-600">{recommendations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Reorder Recommendations</h2>
          <p className="text-sm text-gray-600">Products requiring immediate attention</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Until Stockout
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suggested Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimated Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recommendations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No reorder recommendations at this time
                  </td>
                </tr>
              ) : (
                recommendations.map((rec) => (
                  <tr key={rec.productId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rec.productName}</div>
                      <div className="text-sm text-gray-500">Stock: {rec.currentStock}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rec.currentStock} units</div>
                      <div className="text-sm text-gray-500">
                        Reorder at: {rec.reorderLevel}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {rec.daysUntilStockOut ? `${rec.daysUntilStockOut} days` : 'Unknown'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(rec.urgency)}`}>
                        {rec.urgency}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rec.suggestedOrderQuantity} units</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${rec.estimatedCost?.toFixed(2)}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => fetchProductForecast(rec.productId)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        View Forecast
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Forecast Detail */}
      {forecast && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Forecast: {forecast.productName}
              </h2>
              <button
                onClick={() => setForecast(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaChartLine className="text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Daily Consumption</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {forecast.dailyConsumptionRate} units/day
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  {getTrendIcon(forecast.trend)}
                  <div className="ml-2">
                    <p className="text-sm font-medium text-green-800">Trend</p>
                    <p className="text-lg font-semibold text-green-900 capitalize">
                      {forecast.trend}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Confidence</p>
                    <p className="text-lg font-semibold text-yellow-900 capitalize">
                      {forecast.confidence}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {forecast.stockOutDate && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Stock Out Warning</h3>
                    <p className="text-red-700">
                      Predicted to run out on {new Date(forecast.stockOutDate).toLocaleDateString()}
                      ({forecast.daysUntilStockOut} days from now)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {forecast.reorderSuggestion && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Reorder Suggestion</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700">
                      <strong>Suggested Quantity:</strong> {forecast.reorderSuggestion.suggestedOrderQuantity} units
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Estimated Cost:</strong> ${forecast.reorderSuggestion.estimatedCost?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">
                      <strong>Urgency:</strong> 
                      <span className={`ml-1 px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(forecast.reorderSuggestion.urgency)}`}>
                        {forecast.reorderSuggestion.urgency}
                      </span>
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Lead Time:</strong> {forecast.reorderSuggestion.leadTimeDays} days
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastingDashboard;