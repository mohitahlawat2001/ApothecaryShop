import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPurchaseOrder, updatePurchaseOrderStatus } from '../../services/purchaseOrderService';
// Removing the date-fns import and using built-in date formatting

function PurchaseOrderDetail() {
  const { id } = useParams();
  //const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Helper function to format dates without date-fns
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };
  
  useEffect(() => {
    fetchOrderData();
  }, [id]);
  
  const fetchOrderData = async () => {
    try {
      const data = await getPurchaseOrder(id);
      setOrder(data);
      setError(null);
    } catch (err) {
      setError('Failed to load purchase order details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (newStatus) => {
    if (window.confirm(`Are you sure you want to mark this order as ${newStatus.replace('_', ' ')}?`)) {
      try {
        await updatePurchaseOrderStatus(id, newStatus);
        fetchOrderData(); // Refresh data
      } catch (err) {
        setError('Failed to update order status');
        console.error(err);
      }
    }
  };
  
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
  
  if (loading) return <div className="text-center p-4">Loading purchase order details...</div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  if (!order) return <div className="text-center p-4">Purchase order not found</div>;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Order: {order.poNumber}</h1>
        
        <div className="flex space-x-2">
          {order.status === 'draft' && (
            <>
              <Link
                to={`/procurement/purchase-orders/${id}/edit`}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
              >
                Edit
              </Link>
              <button
                onClick={() => handleStatusChange('submitted')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
              >
                Submit for Approval
              </button>
            </>
          )}
          
          {order.status === 'submitted' && (
            <button
              onClick={() => handleStatusChange('approved')}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700"
            >
              Approve
            </button>
          )}
          
          {order.status === 'approved' && (
            <button
              onClick={() => handleStatusChange('shipped')}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-700"
            >
              Mark as Shipped
            </button>
          )}
          
          {order.status === 'shipped' && (
            <Link
              to={`/procurement/receive/${id}`}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
            >
              Receive Items
            </Link>
          )}
          
          {(order.status === 'draft' || order.status === 'submitted') && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            >
              Cancel Order
            </button>
          )}
          
          <Link
            to="/procurement/purchase-orders"
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
          Status: {order.status.replace('_', ' ')}
        </span>
      </div>
      
      {/* Order Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Supplier</p>
            <p className="font-medium">{order.supplier?.name || 'Unknown Supplier'}</p>
            {order.supplier?.contactPerson && (
              <p className="text-sm">{order.supplier.contactPerson}</p>
            )}
            {order.supplier?.phone && (
              <p className="text-sm">{order.supplier.phone}</p>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium">{formatDate(order.orderDate)}</p>
            
            <p className="text-sm text-gray-500 mt-2">Expected Delivery</p>
            <p className="font-medium">{formatDate(order.expectedDeliveryDate)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Created By</p>
            <p className="font-medium">{order.createdBy?.name || 'Unknown'}</p>
            
            {order.approvedBy?.name && (
              <>
                <p className="text-sm text-gray-500 mt-2">Approved By</p>
                <p className="font-medium">{order.approvedBy.name}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(order.approvalDate)}
                </p>
              </>
            )}
          </div>
        </div>
        
        {order.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Notes</p>
            <p>{order.notes}</p>
          </div>
        )}
      </div>
      
      {/* Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items && order.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium">{item?.genericName || 'Unknown Product'}</p>
                      {item?.groupName && (
                        <p className="text-xs text-gray-500">{item.groupName}</p>
                      )}
                      {item?.unitSize && (
                        <p className="text-xs text-gray-500">{item.unitSize}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item?.quantity || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₹{(item?.unitPrice || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item?.discount ? `${item.discount}%` : '0%'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item?.tax ? `${item.tax}%` : '0%'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    ₹{(item?.totalPrice || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item?.receivedQuantity || 0} / {item?.quantity || 0}
                    {item?.receivedQuantity > 0 && item?.receivedQuantity < item?.quantity && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Partial
                      </span>
                    )}
                    {item?.receivedQuantity >= item?.quantity && item?.quantity > 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Complete
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {(!order.items || order.items.length === 0) && (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No items found in this purchase order
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
        
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b">
              <span>Subtotal:</span>
              <span className="font-medium">₹{(order.subtotal || 0).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <span>Shipping Cost:</span>
              <span>₹{order.shippingCost ? order.shippingCost.toFixed(2) : '0.00'}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <span>Tax Amount:</span>
              <span>₹{order.taxAmount ? order.taxAmount.toFixed(2) : '0.00'}</span>
            </div>
            
            <div className="flex justify-between py-3 font-bold">
              <span>Total Amount:</span>
              <span>₹{(order.totalAmount || 0).toFixed(2)}</span>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span>Payment Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : order.paymentStatus === 'partially_paid'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {(order.paymentStatus || 'pending').replace('_', ' ')}
                </span>
              </div>
              
              {order.invoiceNumber && (
                <div className="flex justify-between text-sm mt-2">
                  <span>Invoice Number:</span>
                  <span>{order.invoiceNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseOrderDetail;
