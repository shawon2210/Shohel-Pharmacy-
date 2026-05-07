const express = require('express');
const router = express.Router();

// Mock middleware - return empty data in mock mode
const mockModeCheck = (req, res, next) => {
  if (global.mockMode) {
    if (req.method === 'GET') {
      return res.json([]);
    }
    return res.json({ success: true, message: 'Mock mode - no database' });
  }
  next();
};

router.use(mockModeCheck);

const Notification = require('../models/Notification');
const Medicine = require('../models/Medicine');
const Due = require('../models/Due');
const { body, validationResult } = require('express-validator');

// Middleware to get userId from Authorization header (simple)
const getUserIdFromReq = (req) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return null;
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    return decoded.userId;
  } catch (e) {
    return null;
  }
};

// Get notifications for current user
router.get('/', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(100);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a notification (used by other modules or admin tools)
router.post('/',
  [
    body('title').notEmpty(),
    body('type').isIn(['expiry', 'due', 'stock', 'sale', 'purchase', 'info', 'warning', 'danger']).optional()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const userId = getUserIdFromReq(req);
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const payload = {
        user: userId,
        title: req.body.title,
        message: req.body.message || '',
        type: req.body.type || 'info',
        link: req.body.link || null,
        meta: req.body.meta || {}
      };

      const notif = await Notification.create(payload);

      // Emit socket event to connected clients
      try {
        const io = req.app.get('io');
        if (io) {
          io.emit('notification:created', notif);
        }
      } catch (e) {
        console.warn('Failed to emit socket event for notification', e.message || e);
      }

      res.status(201).json(notif);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Mark a notification as read
router.post('/:id/read', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const notif = await Notification.findOneAndUpdate({ _id: req.params.id, user: userId }, { isRead: true }, { new: true });
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.json(notif);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read
router.post('/mark-all-read', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dismiss (delete) a notification
router.delete('/:id', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    await Notification.deleteOne({ _id: req.params.id, user: userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync generated alerts into notifications for the user (idempotent)
router.post('/sync-alerts', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Create low-stock notifications
    const lowStock = await Medicine.find({ isActive: true, $expr: { $lte: ['$stockQuantity', '$minimumStock'] } }).limit(50);
    const expiring = await Medicine.find({ isActive: true, expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }).limit(50);
    const overdue = await Due.find({ status: 'overdue' }).limit(50);

    const toUpsert = [];

    lowStock.forEach(m => toUpsert.push({
      user: userId,
      type: 'warning',
      title: `${m.name} low in stock`,
      message: `Stock: ${m.stockQuantity} (min ${m.minimumStock})`,
      link: `/medicines/${m._id}`,
      meta: { medicineId: m._id }
    }));

    expiring.forEach(m => toUpsert.push({
      user: userId,
      type: 'danger',
      title: `${m.name} expiring soon`,
      message: `Expiry: ${m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'Unknown'}`,
      link: '/expiry-alert',
      meta: { medicineId: m._id }
    }));

    overdue.forEach(d => toUpsert.push({
      user: userId,
      type: 'danger',
      title: `Overdue: ${d.customerName || 'Customer'}`,
      message: `Amount: ${d.remainingAmount ?? d.dueAmount ?? 0}`,
      link: `/dues/${d._id}`,
      meta: { dueId: d._id }
    }));

    // Insert new notifications but avoid duplicates by title+user
    for (const n of toUpsert) {
      const exists = await Notification.findOne({ user: userId, title: n.title });
      if (!exists) {
        await Notification.create(n);
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
