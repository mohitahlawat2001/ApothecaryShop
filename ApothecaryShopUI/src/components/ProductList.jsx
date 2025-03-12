import React from 'react';

const ProductList = ({ products, deleteProduct, editProduct, adjustStock }) => {
  const isLowStock = product => product.stockQuantity <= product.reorderLevel;
  
  const isExpiringSoon = product => {
    const expiryDate = new Date(product.expiryDate);
    const today = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    
    return expiryDate <= ninetyDaysFromNow && expiryDate >= today;
  };
  
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generic Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">No products found</td>
            </tr>
          ) : (
            products.map(product => (
              <tr 
                key={product._id} 
                className={`
                  ${isLowStock(product) ? 'bg-red-50' : ''} 
                  ${isExpiringSoon(product) ? 'bg-yellow-50' : ''}
                  hover:bg-gray-50 transition-colors duration-150
                `}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.genericName}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={isLowStock(product) ? 'text-red-600 font-medium' : 'text-gray-900'}>
                    {product.stockQuantity}
                  </span>
                  <div className="flex space-x-1 mt-1">
                    <button onClick={() => adjustStock(product._id, 1)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded transition duration-200">+</button>
                    <button onClick={() => adjustStock(product._id, -1)} className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 rounded transition duration-200">-</button>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">${product.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={isExpiringSoon(product) ? 'text-yellow-600 font-medium' : 'text-gray-900'}>
                    {new Date(product.expiryDate).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editProduct(product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;