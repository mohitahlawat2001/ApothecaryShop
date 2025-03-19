import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSuppliers } from '../../services/supplierService';
import { getPurchaseOrder, createPurchaseOrder, updatePurchaseOrder } from '../../services/purchaseOrderService';
import { getProducts } from '../../services/productService';
import { getExternalProducts } from '../../services/externalProductService';
import DiseaseTrendSuggestions from './DiseaseTrendSuggestions';

function PurchaseOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(isEditMode);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [externalProducts, setExternalProducts] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  const [formData, setFormData] = useState({
    supplier: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    items: [],
    shippingCost: 0,
    discountAmount: 0,
    notes: ''
  });
  
  // Calculate totals
  const subtotal = formData.items.reduce((acc, item) => {
    const totalPrice = item.quantity * item.unitPrice * 
                     (1 - (item.discount || 0) / 100) * 
                     (1 + (item.tax || 0) / 100);
    return acc + totalPrice;
  }, 0);
  
  const totalAmount = subtotal + parseFloat(formData.shippingCost || 0) - parseFloat(formData.discountAmount || 0);
  
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    
    if (isEditMode) {
      fetchPurchaseOrderData();
    }
  }, [isEditMode, id]);
  
  // Load suppliers
  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError('Failed to load suppliers');
      console.error(err);
    }
  };
  
  // Load inventory products
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    }
  };
  
  // Load purchase order data if in edit mode
  const fetchPurchaseOrderData = async () => {
    try {
      const data = await getPurchaseOrder(id);
      setFormData({
        ...data,
        supplier: data.supplier._id,
        orderDate: new Date(data.orderDate).toISOString().split('T')[0],
        expectedDeliveryDate: data.expectedDeliveryDate ? 
          new Date(data.expectedDeliveryDate).toISOString().split('T')[0] : ''
      });
      // Set selected supplier
      setSelectedSupplier(data.supplier);
    } catch (err) {
      setError('Failed to load purchase order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch external products if supplier is JanAushadhi
  useEffect(() => {
    if (selectedSupplier?.isJanAushadhi) {
      fetchExternalProducts();
    }
  }, [selectedSupplier]);
  
  // Modified to accept an optional searchText parameter
  const fetchExternalProducts = async (customSearchTerm = null) => {
    try {
      setLoading(true);
      
      // Use the custom search term if provided, otherwise use the state value
      const searchTextToUse = customSearchTerm !== null ? customSearchTerm : searchTerm;
      
      const response = await getExternalProducts({
        searchText: searchTextToUse,
        pageSize: 100
      });
      if (response && response.responseBody) {
        setExternalProducts(response.responseBody.newProductResponsesList || []);
      }
    } catch (err) {
      console.error('Failed to fetch external products', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'supplier') {
      const selected = suppliers.find(s => s._id === value);
      setSelectedSupplier(selected);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddProduct = (product, isExternal = false) => {
    // Check if product is already in the list
    const existingItemIndex = formData.items.findIndex(item => 
      isExternal ? 
        item.externalProductId === product.productId :
        item.product === product._id
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already exists
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += 1;
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
      return;
    }
    
    // Add new product
    const newItem = isExternal ? {
      externalProductId: product.productId,
      genericName: product.genericName,
      drugCode: product.drugCode,
      groupName: product.groupName,
      unitSize: product.unitSize,
      quantity: 1,
      unitPrice: product.mrp || 0,
      discount: 0,
      tax: 0,
      totalPrice: product.mrp || 0
    } : {
      product: product._id,
      genericName: product.name || product.genericName,
      quantity: 1,
      unitPrice: product.unitPrice || 0,
      discount: 0,
      tax: 0,
      totalPrice: product.unitPrice || 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };
  
  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };
  
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    
        // Recalculate total price
        const item = updatedItems[index];
        item.totalPrice = item.quantity * item.unitPrice *
                         (1 - (item.discount || 0) / 100) *
                         (1 + (item.tax || 0) / 100);
        
        setFormData(prev => ({
          ...prev,
          items: updatedItems
        }));
      };
      
      const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.items.length === 0) {
          setError('Please add at least one item to the purchase order');
          return;
        }
        
        try {
          setLoading(true);
          
          // Prepare data for submission
          const orderData = {
            ...formData,
            subtotal,
            totalAmount
          };
          
          if (isEditMode) {
            await updatePurchaseOrder(id, orderData);
          } else {
            await createPurchaseOrder(orderData);
          }
          
          navigate('/procurement/purchase-orders');
        } catch (err) {
          setError('Failed to save purchase order');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      // Updated handler for AI suggestion selection with improved search functionality
      const handleAISuggestion = (suggestion, searchImmediately = false) => {
        // Update state with the new search term
        setSearchTerm(suggestion);
        
        // If searchImmediately is true, trigger the search right away
        if (searchImmediately && selectedSupplier) {
          if (selectedSupplier.isJanAushadhi) {
            // For JanAushadhi suppliers, directly pass the suggestion to the search
            fetchExternalProducts(suggestion);
          }
          // For regular suppliers, the filter will happen automatically through render
        }
      };
      
      if (loading && isEditMode) return <div className="text-center p-4">Loading purchase order data...</div>;
      
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Purchase Order' : 'Create New Purchase Order'}</h1>
          
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Order Information</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    required
                    disabled={isEditMode} // Can't change supplier in edit mode
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.name} {supplier.isJanAushadhi ? '(JanAushadhi)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
                  <input
                    type="date"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Additional Details */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Additional Details</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Cost</label>
                  <input
                    type="number"
                    name="shippingCost"
                    value={formData.shippingCost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount</label>
                  <input
                    type="number"
                    name="discountAmount"
                    value={formData.discountAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Product Selection */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Add Products</h2>
              
              {selectedSupplier && (
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search for products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {selectedSupplier.isJanAushadhi && (
                      <button
                        type="button"
                        onClick={() => fetchExternalProducts()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Search JanAushadhi Products
                      </button>
                    )}
                  </div>
                  
                  {/* Modified DiseaseTrendSuggestions component */}
                  <DiseaseTrendSuggestions 
                    onProductSelect={handleAISuggestion} 
                    isJanAushadhi={selectedSupplier?.isJanAushadhi} 
                  />
                </div>
              )}
              
              {/* Product Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Regular Products */}
                {!selectedSupplier?.isJanAushadhi && (
                  <div className="border rounded p-4 h-64 overflow-y-auto">
                    <h3 className="text-md font-medium mb-2">Inventory Products</h3>
                    {products.length === 0 ? (
                      <p className="text-gray-500">No products found</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {products
                          .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map(product => (
                            <li key={product._id} className="py-2">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Stock: {product.stockQuantity} • Price: ₹{product.unitPrice}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAddProduct(product)}
                                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                                >
                                  Add
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}
                
                {/* JanAushadhi Products */}
                {selectedSupplier?.isJanAushadhi && (
                  <div className="border rounded p-4 h-64 overflow-y-auto">
                    <h3 className="text-md font-medium mb-2">JanAushadhi Products</h3>
                    {loading ? (
                      <p className="text-center">Loading products...</p>
                    ) : externalProducts.length === 0 ? (
                      <p className="text-gray-500">No products found</p>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {externalProducts.map(product => (
                          <li key={product.productId} className="py-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{product.genericName}</p>
                                <p className="text-sm text-gray-600">
                                  Unit: {product.unitSize} • 
                                  MRP: ₹{product.mrp || 'N/A'} • 
                                  Type: {product.groupName}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddProduct(product, true)}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                              >
                                Add
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                
                {/* Selected Items */}
                <div className="border rounded p-4 h-64 overflow-y-auto">
                  <h3 className="text-md font-medium mb-2">Selected Items ({formData.items.length})</h3>
                  {formData.items.length === 0 ? (
                    <p className="text-gray-500">No items added yet</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <li key={index} className="py-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.genericName}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                  min="1"
                                  className="w-16 p-1 border border-gray-300 rounded text-sm"
                                />
                                <span className="text-sm">×</span>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  className="w-20 p-1 border border-gray-300 rounded text-sm"
                                />
                                <span className="text-sm">=</span>
                                <span className="text-sm font-medium">
                                  ₹{item.totalPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="mt-6 border-t pt-4">
              <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
              
              <div className="flex justify-between items-center mb-2">
                <span>Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>Shipping Cost:</span>
                <span>₹{parseFloat(formData.shippingCost || 0).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>Discount:</span>
                <span>-₹{parseFloat(formData.discountAmount || 0).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center border-t pt-2 mt-2">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold text-lg">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                disabled={loading || formData.items.length === 0}
                className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  (loading || formData.items.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Order' : 'Create Order'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/procurement/purchase-orders')}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      );
    }
    
    export default PurchaseOrderForm;