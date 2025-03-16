import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Fixed import path

function ProcurementLayout() {
  const { auth } = useContext(AuthContext); // Access auth instead of user
  const isAdmin = auth?.user?.role === 'admin'; // Check if user is an admin
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Procurement Management</h1>
      
      <div className="flex mb-6 border-b pb-2">
        {isAdmin && (
          <NavLink 
            to="/procurement/suppliers" 
            className={({ isActive }) => 
              `mr-6 pb-2 ${isActive 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
                : 'text-gray-600 hover:text-blue-500'}`
            }
          >
            Suppliers
          </NavLink>
        )}
        <NavLink 
          to="/procurement/purchase-orders" 
          className={({ isActive }) => 
            `mr-6 pb-2 ${isActive 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-600 hover:text-blue-500'}`
          }
        >
          Purchase Orders
        </NavLink>
        <NavLink 
          to="/procurement/purchase-receipts" 
          className={({ isActive }) => 
            `mr-6 pb-2 ${isActive 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
              : 'text-gray-600 hover:text-blue-500'}`
          }
        >
          Receipts
        </NavLink>
      </div>
      
      <Outlet />
    </div>
  );
}

export default ProcurementLayout;