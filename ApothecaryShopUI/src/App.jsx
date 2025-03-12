import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StockMovements from './pages/StockMovements';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductFormPage from './pages/ProductFormPage';
import Navbar from './components/Navbar';
import { AuthContext } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import './App.css';
// Make sure Tailwind is imported
//import './index.css'; // Add this line to import the main CSS file with Tailwind directives

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: localStorage.getItem('token') ? true : false,
    user: JSON.parse(localStorage.getItem('user'))
  });

  // Helper function to get formatted bearer token
  const getBearerToken = () => {
    const token = auth.token;
    return token ? `Bearer ${token}` : null;
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, getBearerToken }}>
      <Router>
        <div className="app">
          {auth.isAuthenticated && <Navbar />}
          <div className="container">
            <Routes>
              <Route path="/" element={auth.isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/stock-movements" element={<StockMovements />} />
                
                {/* Order matters for these routes - most specific first */}
                <Route path="/products/new" element={<ProductFormPage />} />
                <Route path="/products/edit/:id" element={<ProductFormPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;