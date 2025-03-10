import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Navbar from './components/Navbar';
import { AuthContext } from './context/AuthContext';
import PrivateRoute from './components/routing/PrivateRoute';
import './App.css';

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
            <Switch>
              <Route exact path="/" render={() => 
                auth.isAuthenticated ? <Redirect to="/dashboard" /> : <Login />
              } />
              <Route exact path="/register" component={Register} />
              <PrivateRoute exact path="/dashboard" component={Dashboard} />
              <PrivateRoute exact path="/inventory" component={Inventory} />
            </Switch>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;