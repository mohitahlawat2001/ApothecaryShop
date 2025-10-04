import React, { useState, useEffect, useContext } from 'react';
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
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
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
import LeafLoading from './components/LeafLoading';
import './App.css';
import leafImage from './assets/leaf.png';

// App content component that uses AuthContext
function AppContent() {
  const { isAuthenticated } = useContext(AuthContext);
  
  // Increase the loading time a bit to ensure leaf animation is visible
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Use imported image for preloading
    const img = new Image();
    img.src = leafImage;
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      <LeafLoading isLoading={isLoading} />
      <div className={`container transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/login" element={<Login />} />
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
              <Route path="suppliers" element={<SupplierList />} />
              <Route path="suppliers/new" element={<SupplierForm />} />
              <Route path="suppliers/:id" element={<SupplierDetail />} />
              <Route path="suppliers/:id/edit" element={<SupplierForm />} />
              
              <Route path="purchase-orders" element={<PurchaseOrderList />} />
              <Route path="purchase-orders/new" element={<PurchaseOrderForm />} />
              <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
              <Route path="purchase-orders/:id/edit" element={<PurchaseOrderForm />} />
              
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
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;