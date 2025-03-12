import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddStockMovementModal from './AddStockMovementModal';

const ProductDetail = ({ product }) => {
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchStockMovements = async () => {
      if (!product?._id) return;
      
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;
        
        const response = await axios.get(`${apiUrl}/stockMovements/product/${product._id}`, {
          headers: {
            'Authorization': `${token}`
          }
        });
        
        setStockMovements(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stock movements:', err);
        setLoading(false);
      }
    };
    
    fetchStockMovements();
  }, [product]);
  
  const handleAddStockMovement = async (newMovement) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await axios.post(`${apiUrl}/stockMovements`, newMovement, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      // Refresh the stock movements
      const updatedMovementsRes = await axios.get(`${apiUrl}/stockMovements/product/${product._id}`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      setStockMovements(updatedMovementsRes.data);
      setIsModalOpen(false);
      
      // Return the updated product data
      return response.data.product;
    } catch (err) {
      console.error('Error adding stock movement:', err);
      alert(`Error: ${err.response?.data?.message || 'Failed to add stock movement'}`);
      return null;
    }
  };
  
  if (!product) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{product.name} Details</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          Update Stock
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-3">Product Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p><span className="font-medium">SKU:</span> {product.sku}</p>
            <p><span className="font-medium">Category:</span> {product.category}</p>
            <p><span className="font-medium">Price:</span> ${product.unitPrice.toFixed(2)}</p>
            <p><span className="font-medium">Current Stock:</span> {product.stockQuantity}</p>
            <p><span className="font-medium">Reorder Level:</span> {product.reorderLevel}</p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              {product.stockQuantity <= product.reorderLevel ? (
                <span className="text-red-600 font-bold">Low Stock</span>
              ) : (
                <span className="text-green-600 font-bold">In Stock</span>
              )}
            </p>
            <p>
              <span className="font-medium">Expiry Date:</span>{' '}
              {new Date(product.expiryDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Description</h3>
          <p className="bg-gray-50 p-4 rounded-md">{product.description}</p>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-3">Stock Movement History</h3>
      {loading ? (
        <div className="flex justify-center items-center h-32">Loading...</div>
      ) : stockMovements.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockMovements.slice(0, 5).map(movement => (
                <tr key={movement._id} className={movement.type === 'in' ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(movement.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      movement.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.newStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No stock movement records found.</p>
      )}
      
      {/* Add Stock Movement Modal */}
      <AddStockMovementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStockMovement}
        products={[product]}
      />
    </div>
  );
};

export default ProductDetail;
