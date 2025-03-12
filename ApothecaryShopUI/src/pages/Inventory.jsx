import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL;
        
        const response = await axios.get(`${apiUrl}/products`, {
          headers: {
            'Authorization': `${token}`
          }
        });
        
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Filter products based on search term and status
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (product.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'low-stock') return matchesSearch && product.stockQuantity <= product.reorderLevel;
    if (filterStatus === 'in-stock') return matchesSearch && product.stockQuantity > product.reorderLevel;
    
    const today = new Date();
    const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;
    
    if (filterStatus === 'expiring-soon') {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
      return matchesSearch && expiryDate && expiryDate <= ninetyDaysFromNow && expiryDate >= today;
    }
    if (filterStatus === 'expired') return matchesSearch && expiryDate && expiryDate < today;
    
    return matchesSearch;
  });

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventory Management</h1>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="w-full sm:w-auto flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Products</option>
            <option value="low-stock">Low Stock</option>
            <option value="in-stock">In Stock</option>
            <option value="expiring-soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
          
          <Link
            to="/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Product
          </Link>
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center w-full">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg w-full">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th scope="col" className="w-[20%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th scope="col" className="w-[8%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => {
                const today = new Date();
                const expiryDate = product.expiryDate ? new Date(product.expiryDate) : new Date();
                const isExpired = expiryDate < today;
                const isExpiringSoon = !isExpired && expiryDate <= new Date(today.setDate(today.getDate() + 90));
                
                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 text-sm font-medium text-gray-900 truncate">{product.sku}</td>
                    <td className="px-3 py-4 text-sm text-gray-900 truncate">
                      <Link to={`/products/${product._id}`} className="text-blue-600 hover:text-blue-900">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 truncate">{product.category}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <span className={product.stockQuantity <= product.reorderLevel ? 'text-red-600 font-bold' : ''}>
                        {product.stockQuantity}
                      </span>
                      {product.stockQuantity <= product.reorderLevel && 
                        <span className="ml-1 px-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Low
                        </span>
                      }
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">${product.unitPrice?.toFixed(2) || '0.00'}</td>
                    <td className="px-3 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.stockQuantity <= product.reorderLevel 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stockQuantity <= product.reorderLevel ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <span className={`${
                        isExpired 
                          ? 'text-red-600' 
                          : isExpiringSoon 
                            ? 'text-yellow-600' 
                            : 'text-gray-900'
                      }`}>
                        {expiryDate.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm font-medium">
                      <Link 
                        to={`/products/${product._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Inventory;