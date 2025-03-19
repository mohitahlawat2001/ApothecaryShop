import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardAiAnalysis from '../components/DashboardAiAnalysis';

const Dashboard = () => {
  const { auth } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    expiringProducts: 0,
    expiredProducts: 0,
    totalValue: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Add state for procurement data
  const [purchaseOrderStats, setPurchaseOrderStats] = useState({
    openOrders: 0,
    thisMonth: 0
  });
  const [recentPurchaseOrders, setRecentPurchaseOrders] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;
        
        const productsRes = await axios.get(`${apiUrl}/products`, {
          headers: {
            'Authorization': `${token}`
          }
        });
        
        const products = productsRes.data;
        
        // Calculate stats
        const lowStockCount = products.filter(
          p => p.stockQuantity <= p.reorderLevel
        ).length;
        
        const today = new Date();
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
        
        const expiringCount = products.filter(p => {
          const expiryDate = new Date(p.expiryDate);
          return expiryDate <= ninetyDaysFromNow && expiryDate >= today;
        }).length;
        
        // Calculate expired products
        const expiredCount = products.filter(p => {
          const expiryDate = new Date(p.expiryDate);
          return expiryDate < today;
        }).length;
        
        const totalValue = products.reduce(
          (sum, p) => sum + p.stockQuantity * p.unitPrice,
          0
        );
        
        setStats({
          totalProducts: products.length,
          lowStockProducts: lowStockCount,
          expiringProducts: expiringCount,
          expiredProducts: expiredCount,
          totalValue
        });
        
        // Get recent products
        const recent = [...products]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
          
        setRecentProducts(recent);
        
        // Fetch procurement data
        try {
          const purchaseOrdersRes = await axios.get(`${apiUrl}/purchase-orders`, {
            headers: {
              'Authorization': `${token}`
            }
          });
          
          const orders = purchaseOrdersRes.data;
          
          // Calculate open orders (not received or cancelled)
          const openOrders = orders.filter(order => 
            !['received', 'cancelled'].includes(order.status)
          ).length;
          
          // Calculate orders created this month
          const thisMonth = orders.filter(order => {
            const orderDate = new Date(order.orderDate);
            return orderDate.getMonth() === today.getMonth() &&
                  orderDate.getFullYear() === today.getFullYear();
          }).length;
          
          setPurchaseOrderStats({
            openOrders,
            thisMonth
          });
          
          // Get recent purchase orders
          const recentOrders = [...orders]
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, 5);
            
          setRecentPurchaseOrders(recentOrders);
        } catch (err) {
          console.error('Error fetching procurement data:', err);
          // Don't block the entire dashboard if procurement data fails
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Helper function for order status badge colors
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      case 'partially_received':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {auth.user.name}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Products</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Low Stock</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.lowStockProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Expiring Soon</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.expiringProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Expired</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.expiredProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Value</h3>
          <p className="text-3xl font-bold text-gray-800">${stats.totalValue.toFixed(2)}</p>
        </div>
      </div>
      
      {/* AI Analysis Component - Full Width */}
      <div className="mb-6">
        <DashboardAiAnalysis stats={stats} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Recent Products */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recently Added Products</h3>
          {recentProducts.length === 0 ? (
            <p className="text-gray-500">No products found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentProducts.map(product => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stockQuantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(product.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Procurement Statistics Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Procurement</h2>
            <Link 
              to="/procurement/purchase-orders"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Open Orders</p>
              <p className="text-2xl font-bold text-blue-700">{purchaseOrderStats.openOrders || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Orders This Month</p>
              <p className="text-2xl font-bold text-green-700">{purchaseOrderStats.thisMonth || 0}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Purchase Orders</h3>
            {recentPurchaseOrders.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentPurchaseOrders.map(order => (
                  <li key={order._id} className="py-2">
                    <Link
                      to={`/procurement/purchase-orders/${order._id}`}
                      className="flex justify-between items-center hover:bg-gray-50 px-2 py-1 rounded"
                    >
                      <div>
                        <span className="font-medium">{order.poNumber}</span>
                        <span className="text-sm text-gray-500 ml-2">{order.supplier?.name || 'No supplier'}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No recent purchase orders</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-x-4">
        <Link to="/inventory" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Manage Inventory
        </Link>
        <Link to="/stock-movements" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Stock Movements
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;