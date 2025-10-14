import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { googleAuthService } from '../services/googleAuthService';
import { facebookAuthService } from '../services/facebookAuthService';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

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

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      // Remove confirmPassword from data sent to API
      const registerData = {
        name,
        email,
        password,
        role: 'staff' // Default role
      };

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/register`, registerData);

      // Redirect to login page on successful registration
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to the backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  };

  const handleFacebookSignIn = () => {
    // Redirect to the backend Facebook OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/facebook`;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-4 px-4 sm:px-6 lg:px-8"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </motion.div>
            <motion.p variants={itemVariants} className="text-lg font-medium text-emerald-100 mb-2">Join Us Today</motion.p>
            <motion.h2 variants={itemVariants} className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">ApothecaryShop</motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-emerald-100 leading-relaxed">Start managing your pharmaceutical inventory with our advanced platform</motion.p>
            
            {/* Feature highlights */}
            <motion.div variants={itemVariants} className="mt-8 space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">Advanced analytics dashboard</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">Multi-location support</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                <span className="text-sm text-emerald-100">24/7 customer support</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Form Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-l-none lg:rounded-r-3xl shadow-2xl border border-white/20 p-4 md:p-6"
        >
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Create Account</h1>
            </div>
            <p className="text-gray-600 text-sm">
              Already have an account? <Link to="/" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors duration-200">Sign in here</Link>
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

          <motion.form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
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

            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={onChange}
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Account
              </motion.button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <div className="mt-4">
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
          <div className="mt-3 grid grid-cols-2 gap-3">
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

export default Register;