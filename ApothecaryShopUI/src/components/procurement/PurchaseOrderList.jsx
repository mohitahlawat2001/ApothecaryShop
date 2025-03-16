import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getPurchaseOrders, updatePurchaseOrderStatus } from '../../services/purchaseOrderService';
import { getCurrentUser } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';

function PurchaseOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [userRole, setUserRole] = useState('');
  
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    fetchOrders();
    fetchUserRole();
  }, []);

  // Fetch user role from AuthContext or authService
  const fetchUserRole = () => {
    // First try to get from context
    if (auth && auth.user && auth.user.role) {
      setUserRole(auth.user.role);
    } else {
      // Fallback to authService if not available in context
      const user = getCurrentUser();
      if (user && user.role) {
        setUserRole(user.role);
      }
    }
  };

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseOrders();
      // Ensure orders is always an array
      setOrders(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to load purchase orders');
      console.error(err);
      setOrders([]); // Set orders to empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updatePurchaseOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus } 
          : order
      ));
      showToast(`Order status updated to ${newStatus.replace('_', ' ')}`, 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      setError(errorMessage);
      showToast(errorMessage);
      console.error(err);
    }
  };

  // Ensure filteredOrders is always an array
  const filteredOrders = Array.isArray(orders) ? 
    (filter === 'all' 
      ? orders 
      : orders.filter(order => order.status === filter))
    : [];

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

  if (loading) return <div className="text-center p-4">Loading purchase orders...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Custom Toast Notification */}
      {toast.show && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded shadow-lg transition-all transform translate-x-0 
            ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <div className="flex items-center">
            {toast.type === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <p>{toast.message}</p>
            <button 
              onClick={() => setToast({ ...toast, show: false })} 
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 011.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Link 
          to="/procurement/purchase-orders/new" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Order
        </Link>
      </div>

      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded ${
              filter === 'draft' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2 rounded ${
              filter === 'submitted' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Submitted
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded ${
              filter === 'approved' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('shipped')}
            className={`px-4 py-2 rounded ${
              filter === 'shipped' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => setFilter('received')}
            className={`px-4 py-2 rounded ${
              filter === 'received' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Received
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-gray-500">No purchase orders found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/procurement/purchase-orders/${order._id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      {order.poNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.supplier?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₹{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusBadgeClass(order.status)
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link
                        to={`/procurement/purchase-orders/${order._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                      
                      {order.status === 'draft' && (
                        <>
                          <Link
                            to={`/procurement/purchase-orders/${order._id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleStatusChange(order._id, 'submitted')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Submit
                          </button>
                        </>
                      )}
                      
                      {order.status === 'submitted' && userRole === 'admin' && (
                        <button
                          onClick={() => handleStatusChange(order._id, 'approved')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                      )}
                      
                      {order.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(order._id, 'shipped')}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Mark as Shipped
                        </button>
                      )}
                      
                      {order.status === 'shipped' && (
                        <Link
                          to={`/procurement/receive/${order._id}`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Receive Items
                        </Link>
                      )}
                      
                      {(order.status === 'draft' || order.status === 'submitted') && (
                        <button
                          onClick={() => handleStatusChange(order._id, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrderList;