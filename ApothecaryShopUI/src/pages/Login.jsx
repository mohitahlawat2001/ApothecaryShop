import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { googleAuthService } from '../services/googleAuthService';
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

    handleGoogleCallback();
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
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left Welcome Panel */}
        <motion.div
          variants={panelLeftVariants}
          className="hidden md:flex flex-col justify-center rounded-l-2xl bg-emerald-600 text-white px-8 py-16 shadow-xl"
        >
          <div className="mx-auto text-center max-w-xs">
            <motion.p variants={itemVariants} className="text-lg">Welcome To</motion.p>
            <motion.h2 variants={itemVariants} className="text-3xl font-extrabold">ApothecaryShop</motion.h2>
            <motion.p variants={itemVariants} className="text-lg mt-4 opacity-90">Access your pharmaceutical inventory</motion.p>
          </div>
        </motion.div>

        {/* Right Form Card */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-2xl md:rounded-l-none md:rounded-r-2xl shadow-2xl p-8 md:p-10"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-emerald-800">Sign in to ApothecaryShop</h1>
            <p className="mt-2 text-sm text-gray-600">
              New here? <Link to="/register" className="text-emerald-700 font-medium hover:underline">Create an account</Link>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}

          <motion.form className="mt-6 space-y-5" onSubmit={onSubmit}>
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-2">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                className="w-full px-4 py-2.5 rounded-full bg-emerald-50 border border-emerald-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50/80 transition"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-2">Password</label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  className="w-full pr-10 px-4 py-2.5 rounded-full bg-emerald-50 border border-emerald-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50/80 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-emerald-700/70 hover:text-emerald-800"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-2.5 rounded-full bg-emerald-700 text-white font-medium hover:bg-emerald-800 transition-colors shadow-md"
              >
                Sign In
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
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <div className="mt-6">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex justify-center items-center px-6 py-2.5 border border-emerald-100 rounded-full shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;