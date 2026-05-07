const express = require('express');
const router = express.Router();
const Due = require('../models/Due');
const Sale = require('../models/Sale');
const { body, validationResult } = require('express-validator');

// Get all dues with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '', customerName = '' } = req.query;
    
    let query = {};
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Customer name filter
    if (customerName) {
      query.customerName = { $regex: customerName, $options: 'i' };
    }
    
    const dues = await Due.find(query)
      .populate('sale', 'saleNumber saleDate totalAmount')
      .sort({ dueDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Due.countDocuments(query);
    
    res.json({
      dues,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single due
router.get('/:id', async (req, res) => {
  try {
    const due = await Due.findById(req.params.id)
      .populate('sale', 'saleNumber saleDate totalAmount items');
    
    if (!due) {
      return res.status(404).json({ message: 'Due not found' });
    }
    
    res.json(due);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new due (usually created automatically with sale)
router.post('/', [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('sale').isMongoId().withMessage('Valid sale ID is required'),
  body('dueAmount').isNumeric().withMessage('Due amount must be a number'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const due = new Due({
      ...req.body,
      remainingAmount: req.body.dueAmount
    });
    
    await due.save();
    
    const populatedDue = await Due.findById(due._id)
      .populate('sale', 'saleNumber saleDate totalAmount');
    
    res.status(201).json(populatedDue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Record payment for a due
router.post('/:id/payment', [
  body('amount').isNumeric().withMessage('Payment amount must be a number'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'mobile_banking', 'bank_transfer']),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { amount, paymentMethod = 'cash', notes = '' } = req.body;
    
    const due = await Due.findById(req.params.id);
    if (!due) {
      return res.status(404).json({ message: 'Due not found' });
    }
    
    if (amount > due.remainingAmount) {
      return res.status(400).json({ message: 'Payment amount cannot exceed remaining amount' });
    }
    
    // Add payment to history
    due.paymentHistory.push({
      amount,
      paymentMethod,
      notes
    });
    
    // Update amounts
    due.paidAmount += amount;
    due.remainingAmount -= amount;
    
    await due.save();
    
    const populatedDue = await Due.findById(due._id)
      .populate('sale', 'saleNumber saleDate totalAmount');
    
    res.json(populatedDue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get dues summary
router.get('/summary/total', async (req, res) => {
  try {
    const totalDues = await Due.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$remainingAmount' }
        }
      }
    ]);
    
    const summary = {
      pending: { count: 0, amount: 0 },
      partial: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 }
    };
    
    totalDues.forEach(item => {
      if (summary[item._id]) {
        summary[item._id] = {
          count: item.count,
          amount: item.totalAmount
        };
      }
    });
    
    // Calculate totals
    const totalCount = Object.values(summary).reduce((sum, item) => sum + item.count, 0);
    const totalAmount = Object.values(summary).reduce((sum, item) => sum + item.amount, 0);
    
    res.json({
      ...summary,
      total: { count: totalCount, amount: totalAmount }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get overdue dues
router.get('/alerts/overdue', async (req, res) => {
  try {
    const now = new Date();
    const overdueDues = await Due.find({
      status: 'overdue',
      dueDate: { $lt: now }
    })
    .populate('sale', 'saleNumber saleDate')
    .sort({ dueDate: 1 });
    
    res.json(overdueDues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dues analytics
router.get('/analytics/period', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    let startDate, endDate;
    
    const now = new Date();
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }
    
    const dues = await Due.find({
      createdAt: { $gte: startDate, $lt: endDate }
    });
    
    const analytics = {
      period,
      totalDues: dues.length,
      totalDueAmount: dues.reduce((sum, due) => sum + due.dueAmount, 0),
      totalPaidAmount: dues.reduce((sum, due) => sum + due.paidAmount, 0),
      totalRemainingAmount: dues.reduce((sum, due) => sum + due.remainingAmount, 0),
      collectionRate: 0
    };
    
    if (analytics.totalDueAmount > 0) {
      analytics.collectionRate = (analytics.totalPaidAmount / analytics.totalDueAmount) * 100;
    }
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;