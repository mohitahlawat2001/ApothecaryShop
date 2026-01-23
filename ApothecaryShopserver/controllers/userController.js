const User = require('../models/user');
const bcrypt = require('bcryptjs');

/**
 * User Management Controller
 * Handles CRUD operations for user management (Admin only)
 */

/**
 * Get all users with pagination and filtering
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    // Build filter query
    const filter = {};
    if (role) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users (excluding passwords)
    const users = await User.find(filter)
      .select('-password')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get a single user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Create a new user (Admin only)
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, provider = 'local' } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        timestamp: new Date().toISOString()
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook
      role,
      provider
    });
    
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle MongoDB unique index violations
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Update a user
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;
    
    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use',
          timestamp: new Date().toISOString()
        });
      }
      user.email = email;
    }
    
    // Update fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }
    
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    // Handle MongoDB unique index violations
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Delete a user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
        timestamp: new Date().toISOString()
      });
    }
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Update user status (activate/deactivate)
 * Note: This requires adding an 'isActive' field to the User model
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user model has isActive field
    if (user.isActive !== undefined) {
      user.isActive = isActive;
      await user.save();
      
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: userResponse,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(501).json({
        success: false,
        message: 'User status toggle not implemented in the model',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get user statistics (for dashboard)
 */
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const inventoryManagerCount = await User.countDocuments({ role: 'inventory_manager' });
    const procurementStaffCount = await User.countDocuments({ role: 'procurement_staff' });
    const distributionStaffCount = await User.countDocuments({ role: 'distribution_staff' });
    // Legacy staff count for backwards compatibility
    const legacyStaffCount = await User.countDocuments({ role: 'staff' });
    
    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Provider statistics
    const localUsers = await User.countDocuments({ provider: 'local' });
    const googleUsers = await User.countDocuments({ provider: 'google' });
    const facebookUsers = await User.countDocuments({ provider: 'facebook' });
    
    res.json({
      success: true,
      data: {
        total: totalUsers,
        byRole: {
          admin: adminCount,
          inventory_manager: inventoryManagerCount,
          procurement_staff: procurementStaffCount,
          distribution_staff: distributionStaffCount,
          staff: legacyStaffCount // Keep for backwards compatibility
        },
        byProvider: {
          local: localUsers,
          google: googleUsers,
          facebook: facebookUsers
        },
        recentUsers
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};
