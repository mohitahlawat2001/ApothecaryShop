import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { googleAuthService } from '../services/googleAuthService';
import { facebookAuthService } from '../services/facebookAuthService';
/* eslint-disable-next-line no-unused-vars */
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const { email, password } = formData;
  
  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const panelLeftVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 140, damping: 18 } }
  };
  const cardVariants = {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 140, damping: 18 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.22 } }
  };
  
  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const googleCallback = googleAuthService.checkGoogleCallback();
      if (googleCallback) {
        try {
          const result = await googleAuthService.handleGoogleCallback(googleCallback.token, googleCallback.user);
          if (result.success) {
            // Update auth context
            setAuth({
              token: result.token,
              isAuthenticated: true,
              user: result.user
            });
            
            // Clear URL parameters
            googleAuthService.clearCallbackParams();
            
            // Redirect to dashboard
            navigate('/dashboard');
          } else {
            setError('Google authentication failed');
          }
        } catch (error) {
          console.error('Google auth callback error:', error);
          setError('Google authentication failed');
        }
      }
    };

    // Handle Facebook OAuth callback
    const handleFacebookCallback = async () => {
      const facebookCallback = facebookAuthService.checkFacebookCallback();
      if (facebookCallback) {
        try {
          const result = await facebookAuthService.handleFacebookCallback(facebookCallback.token, facebookCallback.user);
          if (result.success) {
            // Update auth context
            setAuth({
              token: result.token,
              isAuthenticated: true,
              user: result.user
            });
            
            // Clear URL parameters
            facebookAuthService.clearCallbackParams();
            
            // Redirect to dashboard
            navigate('/dashboard');
          } else {
            setError('Facebook authentication failed');
          }
        } catch (error) {
          console.error('Facebook auth callback error:', error);
          setError('Facebook authentication failed');
        }
      }
    };

    handleGoogleCallback();
    handleFacebookCallback();
  }, [navigate, setAuth]);
  
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, formData);
      
      const token = res.data.token;
      // Set Bearer token in localStorage with proper format
      localStorage.setItem('token', `Bearer ${token}`);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Set default Authorization header for all future axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setAuth({
        token: token,
        isAuthenticated: true,
        user: res.data.user
      });
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to the backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleFacebookSignIn = () => {
    // Redirect to the backend Facebook OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook`;
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-6 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left Welcome Panel */}
        <motion.div
          variants={panelLeftVariants}
          className="hidden lg:flex flex-col justify-center relative overflow-hidden rounded-l-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white px-12 py-20 shadow-2xl"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute top-32 right-16 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-20 left-16 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-32 right-10 w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 mx-auto text-center max-w-sm">
            <motion.div variants={itemVariants} className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            </motion.div>
            <motion.p variants={itemVariants} className="text-lg font-medium text-emerald-100 mb-2">Welcome To</motion.p>
            <motion.h2 variants={itemVariants} className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">ApothecaryShop</motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-emerald-100 leading-relaxed">Streamline your pharmaceutical inventory management with our comprehensive platform</motion.p>
            
            {/* Feature highlights */}
            <motion.div variants={itemVariants} className="mt-8 space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">Real-time inventory tracking</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">Automated stock alerts</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">Secure data management</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Form Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-l-none lg:rounded-r-3xl shadow-2xl border border-white/20 p-6 md:p-8"
        >
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Welcome Back</h1>
            </div>
            <p className="text-gray-600 text-base">
              New to our platform? <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors duration-200">Create your account</Link>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm"
              role="alert"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="block sm:inline font-medium">{error}</span>
              </div>
            </motion.div>
          )}

          <motion.form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  placeholder="Enter your email"
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200">
                Forgot password?
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In to Dashboard
              </motion.button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>
          </div>

          {/* OAuth Buttons - Side by Side */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* Google Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleSignIn}
              className="flex justify-center items-center px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition-all duration-200"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm">Google</span>
              </div>
            </motion.button>

            {/* Facebook Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleFacebookSignIn}
              className="flex justify-center items-center px-4 py-3 border-2 border-blue-600 rounded-xl shadow-sm bg-blue-600 text-white font-semibold hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm">Facebook</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;