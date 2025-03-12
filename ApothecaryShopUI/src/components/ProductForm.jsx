import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, saveProduct, cancelEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    manufacturer: '',
    batchNumber: '',
    sku: '', // Add SKU field
    description: '', // Add description field
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
        genericName: product.genericName || '',
        category: product.category || '',
        manufacturer: product.manufacturer || '',
        batchNumber: product.batchNumber || '',
        sku: product.sku || '',
        description: product.description || '',
        expiryDate,
        stockQuantity: product.stockQuantity || 0,
        unitPrice: product.unitPrice || 0,
        reorderLevel: product.reorderLevel || 0
      });
    }
  }, [product]);
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = e => {
    e.preventDefault();
    
    // Generate SKU if not provided (for new products)
    let updatedData = { ...formData };
    if (!updatedData.sku) {
      const timestamp = Date.now().toString().slice(-6);
      const categoryCode = (updatedData.category || 'GEN').substring(0, 3).toUpperCase();
      updatedData.sku = `AP-${categoryCode}-${timestamp}`;
    }
    
    // Convert numeric fields to numbers
    updatedData.stockQuantity = Number(updatedData.stockQuantity);
    updatedData.unitPrice = Number(updatedData.unitPrice);
    updatedData.reorderLevel = Number(updatedData.reorderLevel);
    
    console.log('Submitting product data:', updatedData);
    saveProduct(updatedData);
  };
  
  return (
    <form onSubmit={onSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label className="block text-gray-700 text-sm font-bold mb-2">SKU</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            name="sku"
            value={formData.sku}
            onChange={onChange}
            placeholder="Leave blank for auto-generation"
          />
          <p className="text-sm text-gray-500 mt-1">If left blank, a SKU will be automatically generated</p>
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
        
        <div className="mb-4">
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
      </div>
      
      <div className="mb-4 col-span-2">
        <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows="4"
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Product description"
        ></textarea>
      </div>
      
      <div className="flex items-center justify-between mt-6">
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