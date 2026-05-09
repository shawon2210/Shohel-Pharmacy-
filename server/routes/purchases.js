const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Medicine = require('../models/Medicine');
const { body, validationResult } = require('express-validator');

<<<<<<< HEAD
// Mock purchases data for when MongoDB is not available
const getMockPurchases = (query = {}, page = 1, limit = 20) => {
  const mockPurchases = [
    { _id: 'mock_pur_1', purchaseNumber: 'PR-2026-001', supplierName: 'MediDist Ltd', supplierPhone: '01512345678', purchaseDate: new Date(), items: [{ medicine: 'mock_med_1', medicineName: 'Napa Extra', quantity: 100, unitPrice: 80, totalPrice: 8000 }], subtotal: 8000, discount: 200, totalAmount: 7800, paidAmount: 7800, dueAmount: 0, paymentMethod: 'bank_transfer', status: 'completed', receivedBy: 'mock_user_123' },
    { _id: 'mock_pur_2', purchaseNumber: 'PR-2026-002', supplierName: 'Square Pharma', supplierPhone: '01612345678', purchaseDate: new Date(Date.now() - 86400000), items: [{ medicine: 'mock_med_2', medicineName: 'Amoxicillin 500', quantity: 50, unitPrice: 120, totalPrice: 6000 }], subtotal: 6000, discount: 0, totalAmount: 6000, paidAmount: 4000, dueAmount: 2000, paymentMethod: 'cash', status: 'partial', receivedBy: 'mock_user_123' }
  ];
  
  let filtered = [...mockPurchases];
  if (query.supplierName) filtered = filtered.filter(p => p.supplierName.toLowerCase().includes(query.supplierName.$regex.toLowerCase()));
  if (query.paymentMethod) filtered = filtered.filter(p => p.paymentMethod === query.paymentMethod);
  
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));
  
  const summary = {
    totalPurchases: filtered.length,
    totalAmount: filtered.reduce((sum, p) => sum + p.totalAmount, 0),
    totalPaid: filtered.reduce((sum, p) => sum + p.paidAmount, 0),
    totalDue: filtered.reduce((sum, p) => sum + p.dueAmount, 0),
    averagePurchase: filtered.length > 0 ? filtered.reduce((sum, p) => sum + p.totalAmount, 0) / filtered.length : 0
  };
  
  return { purchases: paginated, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total, summary };
};

// Get all purchases with pagination and filters
router.get('/', async (req, res) => {
  // Mock mode
  if (global.mockMode) {
    console.log('🛒 Returning MOCK purchases data');
    const { page = 1, limit = 20, supplierName = '', paymentMethod } = req.query;
    let query = {};
    if (supplierName) query.supplierName = { $regex: supplierName, $options: 'i' };
    if (paymentMethod) query.paymentMethod = paymentMethod;
    return res.json(getMockPurchases(query, page, limit));
  }
  
=======
// Get all purchases with pagination and filters
router.get('/', async (req, res) => {
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      supplierName,
      paymentMethod,
      minAmount,
      maxAmount,
      sortBy = 'purchaseDate',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {};
    
    // Date range filter
    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }
    
    // Supplier name filter
    if (supplierName) {
      query.supplierName = { $regex: supplierName, $options: 'i' };
    }
    
    // Payment method filter
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.totalAmount.$lte = parseFloat(maxAmount);
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const purchases = await Purchase.find(query)
      .populate('items.medicine', 'name genericName strength unit')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Purchase.countDocuments(query);
    
    // Calculate summary statistics
    const summary = await Purchase.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          averagePurchase: { $avg: '$totalAmount' }
        }
      }
    ]);
    
    res.json({
      purchases,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      summary: summary[0] || {
        totalPurchases: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        averagePurchase: 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single purchase
router.get('/:id', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    const mockPur = getMockPurchases().purchases.find(p => p._id === req.params.id);
    if (!mockPur) return res.status(404).json({ message: 'Purchase not found' });
    return res.json(mockPur);
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('items.medicine', 'name genericName strength unit');
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new purchase
router.post('/', [
  body('supplierName').notEmpty().withMessage('Supplier name is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.medicine').isMongoId().withMessage('Valid medicine ID is required'),
  body('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
  body('items.*.unitPrice').isNumeric().withMessage('Unit price must be a number'),
  body('items.*.batchNumber').notEmpty().withMessage('Batch number is required'),
  body('items.*.expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  body('subtotal').isNumeric().withMessage('Subtotal must be a number'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('paidAmount').isNumeric().withMessage('Paid amount must be a number'),
  body('receivedBy').notEmpty().withMessage('Received by is required')
], async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('🛒 MOCK: Creating purchase from', req.body.supplierName);
    const newPurchase = { _id: 'mock_pur_' + Date.now(), purchaseNumber: 'PR-2026-' + Date.now().toString().slice(-3), ...req.body, purchaseDate: new Date(), status: 'completed' };
    return res.status(201).json(newPurchase);
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { items, ...purchaseData } = req.body;
    
    // Validate medicines exist
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(400).json({ message: `Medicine with ID ${item.medicine} not found` });
      }
    }
    
    // Create purchase
    const purchase = new Purchase({
      ...purchaseData,
      items: items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      }))
    });
    
    await purchase.save();
    
    // Update stock quantities and medicine details
    for (const item of items) {
      await Medicine.findByIdAndUpdate(
        item.medicine,
        { 
          $inc: { stockQuantity: item.quantity },
          $set: {
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            purchasePrice: item.unitPrice
          }
        }
      );
    }
    
    // Populate the response
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('items.medicine', 'name genericName strength unit');
    
    res.status(201).json(populatedPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get today's purchases summary
router.get('/summary/today', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('🛒 MOCK: Getting today\'s purchases summary');
    return res.json({
      totalPurchases: 2,
      totalAmount: 13800,
      totalPaid: 11800,
      totalDue: 2000,
      averagePurchase: 6900
    });
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayPurchases = await Purchase.find({
      purchaseDate: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const summary = {
      totalPurchases: todayPurchases.length,
      totalAmount: todayPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0),
      totalPaid: todayPurchases.reduce((sum, purchase) => sum + purchase.paidAmount, 0),
      totalDue: todayPurchases.reduce((sum, purchase) => sum + purchase.dueAmount, 0),
      averagePurchase: todayPurchases.length > 0 ? todayPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0) / todayPurchases.length : 0
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get purchase analytics
router.get('/analytics/period', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('🛒 MOCK: Getting purchase analytics');
    return res.json({
      period: req.query.period || 'week',
      totalPurchases: 8,
      totalSpent: 25000,
      totalPaid: 22000,
      totalDue: 3000,
      averagePurchase: 3125,
      topSuppliers: [
        { supplierName: 'MediDist Ltd', totalPurchases: 3, totalAmount: 15000, lastPurchase: new Date() },
        { supplierName: 'Square Pharma', totalPurchases: 2, totalAmount: 8000, lastPurchase: new Date(Date.now() - 86400000) }
      ]
    });
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const { period = 'week' } = req.query;
    let startDate, endDate;
    
    const now = new Date();
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
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
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
    }
    
    const purchases = await Purchase.find({
      purchaseDate: { $gte: startDate, $lt: endDate }
    });
    
    const analytics = {
      period,
      totalPurchases: purchases.length,
      totalSpent: purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0),
      totalPaid: purchases.reduce((sum, purchase) => sum + purchase.paidAmount, 0),
      totalDue: purchases.reduce((sum, purchase) => sum + purchase.dueAmount, 0),
      averagePurchase: purchases.length > 0 ? purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0) / purchases.length : 0,
      topSuppliers: getTopSuppliers(purchases)
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get purchases by date range with detailed analytics
router.get('/analytics/range', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('🛒 MOCK: Getting purchase analytics by range');
    return res.json({
      period: { startDate: req.query.startDate, endDate: req.query.endDate, groupBy: req.query.groupBy || 'day' },
      analytics: [
        { _id: { year: 2026, month: 5, day: 8 }, totalPurchases: 2, totalSpent: 13800, totalPaid: 11800, totalDue: 2000, averagePurchase: 6900 }
      ]
    });
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const matchStage = {
      purchaseDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    let groupStage;
    switch (groupBy) {
      case 'hour':
        groupStage = {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' },
            day: { $dayOfMonth: '$purchaseDate' },
            hour: { $hour: '$purchaseDate' }
          }
        };
        break;
      case 'day':
        groupStage = {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' },
            day: { $dayOfMonth: '$purchaseDate' }
          }
        };
        break;
      case 'week':
        groupStage = {
          _id: {
            year: { $year: '$purchaseDate' },
            week: { $week: '$purchaseDate' }
          }
        };
        break;
      case 'month':
        groupStage = {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' }
          }
        };
        break;
      default:
        groupStage = {
          _id: {
            year: { $year: '$purchaseDate' },
            month: { $month: '$purchaseDate' },
            day: { $dayOfMonth: '$purchaseDate' }
          }
        };
    }
    
    const analytics = await Purchase.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          averagePurchase: { $avg: '$totalAmount' }
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

// Get top suppliers
router.get('/analytics/top-suppliers', async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    let matchStage = {};
    if (startDate || endDate) {
      matchStage.purchaseDate = {};
      if (startDate) matchStage.purchaseDate.$gte = new Date(startDate);
      if (endDate) matchStage.purchaseDate.$lte = new Date(endDate);
    }
    
    const topSuppliers = await Purchase.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$supplierName',
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          averagePurchase: { $avg: '$totalAmount' },
          lastPurchaseDate: { $max: '$purchaseDate' }
        }
      },
      {
        $project: {
          supplierName: '$_id',
          totalPurchases: 1,
          totalSpent: 1,
          totalPaid: 1,
          totalDue: 1,
          averagePurchase: 1,
          lastPurchaseDate: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({ topSuppliers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top purchased medicines
router.get('/analytics/top-medicines', async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    let matchStage = {};
    if (startDate || endDate) {
      matchStage.purchaseDate = {};
      if (startDate) matchStage.purchaseDate.$gte = new Date(startDate);
      if (endDate) matchStage.purchaseDate.$lte = new Date(endDate);
    }
    
    const topMedicines = await Purchase.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          totalQuantity: { $sum: '$items.quantity' },
          totalSpent: { $sum: '$items.totalPrice' },
          purchaseCount: { $sum: 1 },
          averagePrice: { $avg: '$items.unitPrice' }
        }
      },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: '$medicine' },
      {
        $project: {
          medicine: {
            _id: '$medicine._id',
            name: '$medicine.name',
            genericName: '$medicine.genericName',
            strength: '$medicine.strength',
            unit: '$medicine.unit'
          },
          totalQuantity: 1,
          totalSpent: 1,
          purchaseCount: 1,
          averagePrice: 1
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({ topMedicines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export purchases data
router.get('/export/csv', async (req, res) => {
  try {
    const { startDate, endDate, supplierName, paymentMethod } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }
    
    if (supplierName) {
      query.supplierName = { $regex: supplierName, $options: 'i' };
    }
    
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    const purchases = await Purchase.find(query)
      .populate('items.medicine', 'name genericName strength unit')
      .sort({ purchaseDate: -1 });
    
    // Convert to CSV format
    const csvHeader = 'Purchase Number,Supplier Name,Supplier Phone,Items,Total Amount,Paid Amount,Due Amount,Payment Method,Purchase Date,Received By,Notes\n';
    
    const csvData = purchases.map(purchase => {
      const items = purchase.items.map(item => 
        `${item.medicine.name} (${item.quantity}x) - Batch: ${item.batchNumber}`
      ).join('; ');
      
      return [
        purchase.purchaseNumber,
        purchase.supplierName,
        purchase.supplierPhone || '',
        `"${items}"`,
        purchase.totalAmount,
        purchase.paidAmount,
        purchase.dueAmount,
        purchase.paymentMethod,
        purchase.purchaseDate.toISOString(),
        purchase.receivedBy,
        `"${purchase.notes || ''}"`
      ].join(',');
    }).join('\n');
    
    const csv = csvHeader + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=purchases-export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to get top suppliers
function getTopSuppliers(purchases) {
  const supplierStats = {};
  
  purchases.forEach(purchase => {
    const supplier = purchase.supplierName;
    if (!supplierStats[supplier]) {
      supplierStats[supplier] = {
        name: supplier,
        totalPurchases: 0,
        totalAmount: 0
      };
    }
    supplierStats[supplier].totalPurchases += 1;
    supplierStats[supplier].totalAmount += purchase.totalAmount;
  });
  
  return Object.values(supplierStats)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);
}

module.exports = router;