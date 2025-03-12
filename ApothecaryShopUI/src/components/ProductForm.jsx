import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, saveProduct, cancelEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    batchNumber: '',
    expiryDate: '',
    stockQuantity: 0,
    unitPrice: 0,
    reorderLevel: 0
  });
  
  useEffect(() => {
    if (product) {
      const expiryDate = product.expiryDate 
        ? new Date(product.expiryDate).toISOString().split('T')[0] 
        : '';
        
      setFormData({
        name: product.name,
        genericName: product.genericName,
        category: product.category,
        manufacturer: product.manufacturer,
        batchNumber: product.batchNumber,
        expiryDate,
        stockQuantity: product.stockQuantity,
        unitPrice: product.unitPrice,
        reorderLevel: product.reorderLevel
      });
    }
  }, [product]);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = e => {
    e.preventDefault();
    saveProduct(formData);
  };
  
  return (
    <form onSubmit={onSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Generic Name</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          name="genericName"
          value={formData.genericName}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          name="category"
          value={formData.category}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Manufacturer</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Batch Number</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          name="batchNumber"
          value={formData.batchNumber}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Expiry Date</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="date"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Stock Quantity</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          name="stockQuantity"
          value={formData.stockQuantity}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Unit Price ($)</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          step="0.01"
          name="unitPrice"
          value={formData.unitPrice}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Reorder Level</label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="number"
          name="reorderLevel"
          value={formData.reorderLevel}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="flex items-center justify-between">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200">
          {product ? 'Update Product' : 'Add Product'}
        </button>
        <button 
          type="button" 
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
          onClick={cancelEdit}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;