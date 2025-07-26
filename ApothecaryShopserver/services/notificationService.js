const Batch = require('../models/Batch');
const Product = require('../models/Product');

// Notification model
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['expiry_warning', 'expiry_critical', 'temperature_alert', 'low_stock', 'batch_recall'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  relatedBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionTaken: {
    type: Boolean,
    default: false
  },
  actionNotes: {
    type: String
  },
  scheduledFor: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ type: 1, isRead: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ targetUsers: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

// Notification service class
class NotificationService {
  
  // Create a new notification
  static async createNotification({
    type,
    title,
    message,
    severity = 'medium',
    relatedBatch = null,
    relatedProduct = null,
    targetUsers = [],
    actionRequired = false,
    scheduledFor = null,
    expiresAt = null
  }) {
    try {
      const notification = new Notification({
        type,
        title,
        message,
        severity,
        relatedBatch,
        relatedProduct,
        targetUsers,
        actionRequired,
        scheduledFor: scheduledFor || new Date(),
        expiresAt
      });

      await notification.save();
      return notification;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  // Check for batches expiring soon and create notifications
  static async checkExpiryNotifications() {
    try {
      const today = new Date();
      
      // Check for batches expiring in 30 days (warning)
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringBatches = await Batch.find({
        expiryDate: { $lte: thirtyDaysFromNow, $gt: today },
        status: 'active',
        currentQuantity: { $gt: 0 }
      }).populate('product');

      // Check for batches expiring in 7 days (critical)
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const criticalBatches = await Batch.find({
        expiryDate: { $lte: sevenDaysFromNow, $gt: today },
        status: 'active',
        currentQuantity: { $gt: 0 }
      }).populate('product');

      // Create notifications for 30-day warning
      for (const batch of expiringBatches) {
        const daysUntilExpiry = Math.ceil((batch.expiryDate - today) / (1000 * 60 * 60 * 24));
        
        // Check if notification already exists for this batch
        const existingNotification = await Notification.findOne({
          type: 'expiry_warning',
          relatedBatch: batch._id,
          isRead: false
        });

        if (!existingNotification) {
          await this.createNotification({
            type: 'expiry_warning',
            title: `Product Expiring Soon`,
            message: `Batch ${batch.batchNumber} of ${batch.product.name} expires in ${daysUntilExpiry} days (${batch.expiryDate.toDateString()}). Current stock: ${batch.currentQuantity} units.`,
            severity: 'medium',
            relatedBatch: batch._id,
            relatedProduct: batch.product._id,
            actionRequired: true,
            expiresAt: batch.expiryDate
          });
        }
      }

      // Create notifications for 7-day critical warning
      for (const batch of criticalBatches) {
        const daysUntilExpiry = Math.ceil((batch.expiryDate - today) / (1000 * 60 * 60 * 24));
        
        const existingNotification = await Notification.findOne({
          type: 'expiry_critical',
          relatedBatch: batch._id,
          isRead: false
        });

        if (!existingNotification) {
          await this.createNotification({
            type: 'expiry_critical',
            title: `URGENT: Product Expiring Very Soon`,
            message: `CRITICAL: Batch ${batch.batchNumber} of ${batch.product.name} expires in ${daysUntilExpiry} days! Immediate action required. Current stock: ${batch.currentQuantity} units.`,
            severity: 'critical',
            relatedBatch: batch._id,
            relatedProduct: batch.product._id,
            actionRequired: true,
            expiresAt: batch.expiryDate
          });
        }
      }

      return {
        warningNotifications: expiringBatches.length,
        criticalNotifications: criticalBatches.length
      };
    } catch (error) {
      throw new Error(`Failed to check expiry notifications: ${error.message}`);
    }
  }

  // Check for low stock notifications
  static async checkLowStockNotifications() {
    try {
      const lowStockProducts = await Product.find({
        $expr: { $lte: ['$stockQuantity', '$reorderLevel'] }
      });

      for (const product of lowStockProducts) {
        const existingNotification = await Notification.findOne({
          type: 'low_stock',
          relatedProduct: product._id,
          isRead: false
        });

        if (!existingNotification) {
          await this.createNotification({
            type: 'low_stock',
            title: `Low Stock Alert`,
            message: `${product.name} is running low. Current stock: ${product.stockQuantity}, Reorder level: ${product.reorderLevel}`,
            severity: 'medium',
            relatedProduct: product._id,
            actionRequired: true
          });
        }
      }

      return { lowStockNotifications: lowStockProducts.length };
    } catch (error) {
      throw new Error(`Failed to check low stock notifications: ${error.message}`);
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        type = null,
        isRead = null,
        severity = null
      } = options;

      const filter = {
        $or: [
          { targetUsers: { $in: [userId] } },
          { targetUsers: { $size: 0 } } // Global notifications
        ]
      };

      if (type) filter.type = type;
      if (isRead !== null) filter.isRead = isRead;
      if (severity) filter.severity = severity;

      const notifications = await Notification.find(filter)
        .populate('relatedBatch')
        .populate('relatedProduct')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Notification.countDocuments(filter);

      return {
        notifications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      };
    } catch (error) {
      throw new Error(`Failed to get user notifications: ${error.message}`);
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      // Check if already read by this user
      const alreadyRead = notification.readBy.some(
        read => read.user.toString() === userId.toString()
      );

      if (!alreadyRead) {
        notification.readBy.push({
          user: userId,
          readAt: new Date()
        });

        // If this is the first read, mark as read
        if (!notification.isRead) {
          notification.isRead = true;
        }

        await notification.save();
      }

      return notification;
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  // Get notification statistics
  static async getNotificationStats(userId = null) {
    try {
      const baseFilter = userId ? {
        $or: [
          { targetUsers: { $in: [userId] } },
          { targetUsers: { $size: 0 } }
        ]
      } : {};

      const stats = await Notification.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: {
              $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
            },
            actionRequired: {
              $sum: { $cond: [{ $eq: ['$actionRequired', true] }, 1, 0] }
            },
            critical: {
              $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
            },
            high: {
              $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        unread: 0,
        actionRequired: 0,
        critical: 0,
        high: 0
      };
    } catch (error) {
      throw new Error(`Failed to get notification stats: ${error.message}`);
    }
  }

  // Run all notification checks (to be called by scheduler)
  static async runAllChecks() {
    try {
      const expiryResults = await this.checkExpiryNotifications();
      const lowStockResults = await this.checkLowStockNotifications();
      
      return {
        ...expiryResults,
        ...lowStockResults,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to run notification checks: ${error.message}`);
    }
  }
}

module.exports = {
  Notification,
  NotificationService
};