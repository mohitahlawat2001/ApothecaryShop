import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
          headers: {
            'Authorization': token
          }
        });
        setProducts(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products'+err);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Delete product
  const deleteProduct = async id => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
          headers: {
            'Authorization': token
          }
        });
        
        setProducts(products.filter(product => product._id !== id));
      } catch (err) {
        setError('Failed to delete product'+err);
      }
    }
  };
  
  // Add new product or update existing
  const saveProduct = async product => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      };
      
      let res;
      
      if (currentProduct) {
        // Update product
        res = await axios.put(
          `${import.meta.env.VITE_API_URL}/products/${currentProduct._id}`,
          product,
          config
        );
        
        setProducts(
          products.map(p => (p._id === currentProduct._id ? res.data : p))
        );
      } else {
        // Add product
        res = await axios.post(`${import.meta.env.VITE_API_URL}/products`, product, config);
        setProducts([...products, res.data]);
      }
      
      setCurrentProduct(null);
      setShowForm(false);
    } catch (err) {
      setError('Failed to save product'+err);
    }
  };
  
  // Edit product
  const editProduct = product => {
    setCurrentProduct(product);
    setShowForm(true);
  };
  
  // Adjust stock
  const adjustStock = async (id, adjustment) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/products/${id}/stock`,
        { adjustment },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        }
      );
      
      setProducts(
        products.map(p => (p._id === id ? res.data : p))
      );
    } catch (err) {
      setError('Failed to adjust stock'+err);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Inventory Management</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-6 transition duration-200" 
        onClick={() => {
          setCurrentProduct(null);
          setShowForm(true);
        }}
      >
        Add New Product
      </button>
      
      {showForm ? (
        <ProductForm 
          product={currentProduct} 
          saveProduct={saveProduct} 
          cancelEdit={() => {
            setShowForm(false);
            setCurrentProduct(null);
          }} 
        />
      ) : loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : (
        <ProductList 
          products={products} 
          deleteProduct={deleteProduct} 
          editProduct={editProduct}
          adjustStock={adjustStock}
        />
      )}
    </div>
  );
};

export default Inventory;