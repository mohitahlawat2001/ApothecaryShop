const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });
    console.log(authHeader);
    // Check if Authorization header starts with Bearer
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Extract token by removing 'Bearer ' prefix
    const token = authHeader.substring(7);
    console.log(token);
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    
    // Log JWT secret to debug (remove in production)
    console.log('JWT Secret first 4 chars:', process.env.JWT_SECRET?.substring(0, 4) || 'undefined');
    
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Map token payload to expected structure
    req.user = {
      id: decoded.sub || decoded.id, // Support both 'sub' and 'id' fields
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};