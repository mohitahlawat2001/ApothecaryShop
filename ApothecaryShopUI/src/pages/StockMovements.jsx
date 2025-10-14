import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddStockMovementModal from '../components/AddStockMovementModal';
import StockMovementGraph from '../components/StockMovementGraph';
import StockMovementAiAnalysis from '../components/StockMovementAiAnalysis';

const StockMovements = () => {
  const [stockMovements, setStockMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl =
          import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;
        if (!apiUrl) {
          throw new Error(
            "Missing API base URL. Please set VITE_API_BASE_URL in your environment."
          );
        }
        
        // Fetch products for dropdown
        const productsRes = await axios.get(`${apiUrl}/products`, {
          headers: {
            'Authorization': `${token}`
          }
        });
        
        setProducts(productsRes.data);
        
        // If there's a selected product, fetch its stock movements
        if (selectedProduct) {
          const movementsRes = await axios.get(`${apiUrl}/stockMovements/product/${selectedProduct}`, {
            headers: {
              'Authorization': `${token}`
            }
          });
          setStockMovements(movementsRes.data);
          
          // Find the product name for the selected product
          const selectedProd = productsRes.data.find(prod => prod._id === selectedProduct);
          if (selectedProd) {
            setSelectedProductName(selectedProd.name);
          }
        } else {
          setStockMovements([]);
          setSelectedProductName('');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedProduct]);

  const handleAddStockMovement = async (newMovement) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error(
          "Missing API base URL. Please set VITE_API_BASE_URL in your environment."
        );
      }
      
      await axios.post(`${apiUrl}/stockMovements`, newMovement, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      // Refresh the stock movements for the selected product
      if (selectedProduct === newMovement.productId) {
        const movementsRes = await axios.get(`${apiUrl}/stockMovements/product/${selectedProduct}`, {
          headers: {
            'Authorization': `${token}`
          }
        });
        setStockMovements(movementsRes.data);
      }
      
      // Also update the products list to reflect new stock quantities
      const productsRes = await axios.get(`${apiUrl}/products`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      
      setProducts(productsRes.data);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding stock movement:', err);
      alert(`Error: ${err.response?.data?.message || 'Failed to add stock movement'}`);
    }
  };

  if (loading && selectedProduct) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Stock Movements</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Stock Movement
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
          <select
            id="product-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">-- Select a product --</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.name} (Current Stock: {product.stockQuantity})
              </option>
            ))}
          </select>
        </div>
        
        {selectedProduct && (
          <StockMovementGraph stockMovements={stockMovements} />
        )}
        
        {/* Add the AI Analysis component when there are enough stock movements */}
        {selectedProduct && stockMovements.length > 2 && (
          <StockMovementAiAnalysis 
            stockMovements={stockMovements} 
            productName={selectedProductName} 
          />
        )}
        
        {selectedProduct ? (
          stockMovements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Stock</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Stock</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stockMovements.map(movement => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.previousStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.newStock}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movement.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.createdBy?.name || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No stock movements found for this product.</p>
          )
        ) : (
          <p className="text-gray-500">Please select a product to view its stock movements.</p>
        )}
      </div>
      
      {/* Stock Movement Modal */}
      <AddStockMovementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStockMovement}
        products={products}
      />
    </div>
  );
};

export default StockMovements;
