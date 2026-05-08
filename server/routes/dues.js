const express = require('express');
const router = express.Router();
const Due = require('../models/Due');
const Sale = require('../models/Sale');
const { body, validationResult } = require('express-validator');

// Mock dues data for when MongoDB is not available
const getMockDues = (query = {}, page = 1, limit = 20) => {
  const mockDues = [
    { _id: 'mock_due_1', customerName: 'রহিম মিয়া', customerPhone: '01712345678', sale: 'mock_sale_1', dueAmount: 500, remainingAmount: 300, dueDate: new Date(Date.now() + 15*24*60*60*1000), status: 'partial', paymentHistory: [{ amount: 200, paymentMethod: 'cash', date: new Date() }] },
    { _id: 'mock_due_2', customerName: 'করিম উদ্দিন', customerPhone: '01812345678', sale: 'mock_sale_2', dueAmount: 70, remainingAmount: 70, dueDate: new Date(Date.now() - 5*24*60*60*1000), status: 'pending', paymentHistory: [] },
    { _id: 'mock_due_3', customerName: 'ফাতিমা খাতুন', customerPhone: '01912345678', sale: 'mock_sale_3', dueAmount: 0, remainingAmount: 0, dueDate: new Date(Date.now() + 20*24*60*60*1000), status: 'paid', paymentHistory: [] }
  ];
  
  let filtered = [...mockDues];
  if (query.status) filtered = filtered.filter(d => d.status === query.status);
  if (query.customerName) filtered = filtered.filter(d => d.customerName.toLowerCase().includes(query.customerName.$regex.toLowerCase()));
  
  const total = filtered.length;
  const start = (page -1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));
  
  return { dues: paginated, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total };
};

// Get all dues with pagination and filters
router.get('/', async (req, res) => {
  // Mock mode
  if (global.mockMode) {
    console.log('💳 Returning MOCK dues data');
    const { page = 1, limit = 20, status = '', customerName = '' } = req.query;
    let query = {};
    if (status) query.status = status;
    if (customerName) query.customerName = { $regex: customerName, $options: 'i' };
    return res.json(getMockDues(query, page, limit));
  }
  
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
  // Mock mode
  if (global.mockMode) {
    const mockDue = getMockDues().dues.find(d => d._id === req.params.id);
    if (!mockDue) return res.status(404).json({ message: 'Due not found' });
    return res.json(mockDue);
  }
  
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
  // Mock mode
  if (global.mockMode) {
    console.log('💳 MOCK: Creating due for', req.body.customerName);
    const newDue = { _id: 'mock_due_' + Date.now(), ...req.body, remainingAmount: req.body.dueAmount, status: 'pending', paymentHistory: [] };
    return res.status(201).json(newDue);
  }
  
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
  // Mock mode
  if (global.mockMode) {
    console.log('💳 MOCK: Recording payment for', req.params.id);
    return res.json({ _id: req.params.id, remainingAmount: 0, paidAmount: req.body.amount, status: 'paid' });
  }
  
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
  // Mock mode
  if (global.mockMode) {
    console.log('💳 MOCK: Getting dues summary');
    return res.json({
      pending: { count: 1, amount: 300 },
      partial: { count: 1, amount: 70 },
      overdue: { count: 0, amount: 0 },
      paid: { count: 1, amount: 0 },
      total: { count: 3, amount: 370 }
    });
  }
  
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
  // Mock mode
  if (global.mockMode) {
    console.log('💳 MOCK: Getting overdue dues');
    return res.json([
      { _id: 'mock_due_2', customerName: 'করিম উদ্দিন', customerPhone: '01812345678', remainingAmount: 70, dueDate: new Date(Date.now() - 5*24*60*60*1000), status: 'pending' }
    ]);
  }
  
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
  // Mock mode
  if (global.mockMode) {
    console.log('💳 MOCK: Getting dues analytics');
    return res.json({
      period: req.query.period || 'month',
      totalDues: 3,
      totalDueAmount: 370,
      totalPaidAmount: 200,
      totalRemainingAmount: 170,
      collectionRate: 54.1
    });
  }
  
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