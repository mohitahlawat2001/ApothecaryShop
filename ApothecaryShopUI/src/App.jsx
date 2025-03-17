import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StockMovements from './pages/StockMovements';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductFormPage from './pages/ProductFormPage';
import EditProduct from './pages/EditProduct';
import Navbar from './components/Navbar';
import { AuthContext } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import ProcurementLayout from './components/procurement/ProcurementLayout';
import SupplierList from './components/procurement/SupplierList';
import SupplierForm from './components/procurement/SupplierForm';
import PurchaseOrderList from './components/procurement/PurchaseOrderList';
import PurchaseOrderForm from './components/procurement/PurchaseOrderForm';
import PurchaseReceiptForm from './components/procurement/PurchaseReceiptForm';
import PurchaseReceiptList from './components/procurement/PurchaseReceiptList';
import PurchaseOrderDetail from './components/procurement/PurchaseOrderDetail';
import SupplierDetail from './components/procurement/SupplierDetail';
import PurchaseReceiptDetail from './components/procurement/PurchaseReceiptDetail';
import DistributionList from './components/distribution/DistributionList';
import DistributionForm from './components/distribution/DistributionForm';
import DistributionDetail from './components/distribution/DistributionDetail';
import DistributionDashboard from './components/distribution/DistributionDashboard';
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
    return token ? `${token}` : null;
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
                <Route path="/products/:id/edit" element={<EditProduct />} />

                <Route path="/procurement" element={<ProcurementLayout />}>
          {/* Suppliers */}
          <Route path="suppliers" element={<SupplierList />} />
          <Route path="suppliers/new" element={<SupplierForm />} />
          <Route path="suppliers/:id" element={<SupplierDetail />} />
          <Route path="suppliers/:id/edit" element={<SupplierForm />} />
          
          {/* Purchase Orders */}
          <Route path="purchase-orders" element={<PurchaseOrderList />} />
          <Route path="purchase-orders/new" element={<PurchaseOrderForm />} />
          <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
          <Route path="purchase-orders/:id/edit" element={<PurchaseOrderForm />} />
          
          {/* Receipts */}
          <Route path="purchase-receipts" element={<PurchaseReceiptList />} />
          <Route path="receive/:id" element={<PurchaseReceiptForm />} />
          <Route path="purchase-receipts/:id" element={<PurchaseReceiptDetail />} />

          

        </Route>
        <Route path="/distributions" element={<DistributionList />} />
          <Route path="/distributions/new" element={<DistributionForm />} />
          <Route path="/distributions/:id" element={<DistributionDetail />} />
          <Route path="/distribution-dashboard" element={<DistributionDashboard />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;