const express = require('express');
const router = express.Router();
const { NotificationService } = require('../services/notificationService');
const auth = require('../middleware/auth');

// Get notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const { page, limit, type, isRead, severity } = req.query;
    const result = await NotificationService.getUserNotifications(
      req.user.id,
      { page, limit, type, isRead: isRead === 'true' ? true : isRead === 'false' ? false : null, severity }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notification statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await NotificationService.getNotificationStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Run notification checks manually (admin only)
router.post('/check', auth, async (req, res) => {
  try {
    // You might want to add role checking here
    const results = await NotificationService.runAllChecks();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;