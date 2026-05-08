const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { body, validationResult } = require('express-validator');

// Mock expenses data for when MongoDB is not available
const getMockExpenses = (query = {}, page = 1, limit = 20) => {
  const mockExpenses = [
    { _id: 'mock_exp_1', description: 'Electricity Bill', vendor: 'DESCO', amount: 5000, expenseDate: new Date(), category: 'Utilities', paymentMethod: 'bank_transfer', receiptNumber: 'REC-001' },
    { _id: 'mock_exp_2', description: 'Staff Salary', vendor: 'John Doe', amount: 15000, expenseDate: new Date(Date.now() - 86400000), category: 'Salaries', paymentMethod: 'cash', receiptNumber: 'REC-002' },
    { _id: 'mock_exp_3', description: 'Medicine Transport', vendor: 'Fast Logistics', amount: 2000, expenseDate: new Date(Date.now() - 172800000), category: 'Transportation', paymentMethod: 'mobile_banking', receiptNumber: 'REC-003' }
  ];
  
  let filtered = [...mockExpenses];
  if (query.category) filtered = filtered.filter(e => e.category === query.category);
  if (query.$or) filtered = filtered.filter(e => 
    query.$or.some(q => {
      if (q.description) return e.description.toLowerCase().includes(q.description.$regex.toLowerCase());
      if (q.vendor) return e.vendor.toLowerCase().includes(q.vendor.$regex.toLowerCase());
      return false;
    })
  );
  
  const total = filtered.length;
  const start = (page -1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));
  
  const summary = {
    totalExpenses: filtered.length,
    totalAmount: filtered.reduce((sum, e) => sum + e.amount, 0),
    averageExpense: filtered.length > 0 ? filtered.reduce((sum, e) => sum + e.amount, 0) / filtered.length : 0
  };
  
  return { expenses: paginated, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total, summary };
};

// Get all expenses with pagination and filters
router.get('/', async (req, res) => {
  // Mock mode
  if (global.mockMode) {
    console.log('💸 Returning MOCK expenses data');
    const { page = 1, limit = 20, category = '', search = '' } = req.query;
    let query = {};
    if (category) query.category = category;
    if (search) query.$or = [{ description: { $regex: search, $options: 'i' } }, { vendor: { $regex: search, $options: 'i' } }];
    return res.json(getMockExpenses(query, page, limit));
  }
  
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      category = '',
      search = '',
      paymentMethod,
      minAmount,
      maxAmount,
      sortBy = 'expenseDate',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {};
    
    // Date range filter
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } },
        { receiptNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const expenses = await Expense.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Expense.countDocuments(query);
    
    // Calculate summary statistics
    const summary = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageExpense: { $avg: '$amount' }
        }
      }
    ]);
    
    res.json({
      expenses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      summary: summary[0] || {
        totalExpenses: 0,
        totalAmount: 0,
        averageExpense: 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single expense
router.get('/:id', async (req, res) => {
  // Mock mode
  if (global.mockMode) {
    const mockExp = getMockExpenses().expenses.find(e => e._id === req.params.id);
    if (!mockExp) return res.status(404).json({ message: 'Expense not found' });
    return res.json(mockExp);
  }
  
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new expense
router.post('/', [
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('expenseDate').optional().isISO8601().withMessage('Valid expense date is required'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'bank_transfer', 'cheque']),
  body('recordedBy').notEmpty().withMessage('Recorded by is required')
], async (req, res) => {
  // Mock mode
  if (global.mockMode) {
    console.log('💸 MOCK: Creating expense', req.body.description);
    const newExpense = { _id: 'mock_exp_' + Date.now(), ...req.body, expenseDate: new Date() };
    return res.status(201).json(newExpense);
  }
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const expense = new Expense(req.body);
    await expense.save();
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  // Mock mode
  if (global.mockMode) {
    console.log('💸 MOCK: Updating expense', req.params.id);
    return res.json({ _id: req.params.id, ...req.body });
  }
  
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  // Mock mode
  if (global.mockMode) {
    console.log('💸 MOCK: Deleting expense', req.params.id);
    return res.json({ message: 'Expense deleted successfully' });
  }
  
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's expenses summary
router.get('/summary/today', async (req, res) => {
  // Mock mode
  if (global.mockMode) {
    console.log('💸 MOCK: Getting today\'s expenses summary');
    return res.json({
      totalExpenses: 3,
      totalAmount: 22000,
      averageExpense: 7333,
      categoryBreakdown: [
        { category: 'Utilities', total: 5000, count: 1 },
        { category: 'Salaries', total: 15000, count: 1 }
      ]
    });
  }
  
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayExpenses = await Expense.find({
      expenseDate: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const summary = {
      totalExpenses: todayExpenses.length,
      totalAmount: todayExpenses.reduce((sum, expense) => sum + expense.amount, 0),
      averageExpense: todayExpenses.length > 0 ? todayExpenses.reduce((sum, expense) => sum + expense.amount, 0) / todayExpenses.length : 0,
      categoryBreakdown: getCategoryBreakdown(todayExpenses)
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expense analytics
router.get('/analytics/period', async (req, res) => {
  // Mock mode
  if (global.mockMode) {
    console.log('💸 MOCK: Getting expense analytics');
    return res.json({
      period: req.query.period || 'month',
      totalExpenses: 10,
      totalAmount: 65000,
      averageExpense: 6500,
      categoryBreakdown: [
        { category: 'Utilities', total: 15000, count: 3 },
        { category: 'Salaries', total: 30000, count: 2 },
        { category: 'Transportation', total: 20000, count: 5 }
      ]
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
    
    const expenses = await Expense.find({
      expenseDate: { $gte: startDate, $lt: endDate }
    });
    
    const analytics = {
      period,
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
      averageExpense: expenses.length > 0 ? expenses.reduce((sum, expense) => sum + expense.amount, 0) / expenses.length : 0,
      categoryBreakdown: getCategoryBreakdown(expenses),
      monthlyTrend: await getMonthlyTrend(startDate, endDate)
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to get category breakdown
function getCategoryBreakdown(expenses) {
  const breakdown = {};
  
  expenses.forEach(expense => {
    if (!breakdown[expense.category]) {
      breakdown[expense.category] = {
        count: 0,
        amount: 0
      };
    }
    breakdown[expense.category].count += 1;
    breakdown[expense.category].amount += expense.amount;
  });
  
  return breakdown;
}

// Helper function to get monthly trend
async function getMonthlyTrend(startDate, endDate) {
  const trend = await Expense.aggregate([
    {
      $match: {
        expenseDate: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$expenseDate' },
          month: { $month: '$expenseDate' },
          day: { $dayOfMonth: '$expenseDate' }
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);
  
  return trend;
}

// Get expenses by date range with detailed analytics
router.get('/analytics/range', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const matchStage = {
      expenseDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    let groupStage;
    switch (groupBy) {
      case 'hour':
        groupStage = {
          _id: {
            year: { $year: '$expenseDate' },
            month: { $month: '$expenseDate' },
            day: { $dayOfMonth: '$expenseDate' },
            hour: { $hour: '$expenseDate' }
          }
        };
        break;
      case 'day':
        groupStage = {
          _id: {
            year: { $year: '$expenseDate' },
            month: { $month: '$expenseDate' },
            day: { $dayOfMonth: '$expenseDate' }
          }
        };
        break;
      case 'week':
        groupStage = {
          _id: {
            year: { $year: '$expenseDate' },
            week: { $week: '$expenseDate' }
          }
        };
        break;
      case 'month':
        groupStage = {
          _id: {
            year: { $year: '$expenseDate' },
            month: { $month: '$expenseDate' }
          }
        };
        break;
      default:
        groupStage = {
          _id: {
            year: { $year: '$expenseDate' },
            month: { $month: '$expenseDate' },
            day: { $dayOfMonth: '$expenseDate' }
          }
        };
    }
    
    const analytics = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          totalExpenses: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageExpense: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);
    
    res.json({
      period: { startDate, endDate, groupBy },
      analytics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top expense categories
router.get('/analytics/top-categories', async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    let matchStage = {};
    if (startDate || endDate) {
      matchStage.expenseDate = {};
      if (startDate) matchStage.expenseDate.$gte = new Date(startDate);
      if (endDate) matchStage.expenseDate.$lte = new Date(endDate);
    }
    
    const topCategories = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalExpenses: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalExpenses: 1,
          totalAmount: 1,
          averageAmount: 1
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({ topCategories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expense trends by category
router.get('/analytics/category-trends', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    if (!startDate || !endDate || !category) {
      return res.status(400).json({ message: 'Start date, end date, and category are required' });
    }
    
    const trends = await Expense.aggregate([
      {
        $match: {
          expenseDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          },
          category: category
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$expenseDate' },
            month: { $month: '$expenseDate' },
            day: { $dayOfMonth: '$expenseDate' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    res.json({ trends });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export expenses data
router.get('/export/csv', async (req, res) => {
  try {
    const { startDate, endDate, category, paymentMethod } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }
    
    if (category) {
      query.category = category;
    }
    
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    const expenses = await Expense.find(query).sort({ expenseDate: -1 });
    
    // Convert to CSV format
    const csvHeader = 'Category,Description,Amount,Expense Date,Payment Method,Receipt Number,Vendor,Recorded By,Notes\n';
    
    const csvData = expenses.map(expense => {
      return [
        expense.category,
        `"${expense.description}"`,
        expense.amount,
        expense.expenseDate.toISOString(),
        expense.paymentMethod,
        expense.receiptNumber || '',
        expense.vendor || '',
        expense.recordedBy,
        `"${expense.notes || ''}"`
      ].join(',');
    }).join('\n');
    
    const csv = csvHeader + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses-export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expense categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Expense.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;