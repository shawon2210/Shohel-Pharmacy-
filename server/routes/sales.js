const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Due = require('../models/Due');
const { body, validationResult } = require('express-validator');

<<<<<<< HEAD
// Mock sales data for when MongoDB is not available
const getMockSales = (query = {}, page = 1, limit = 20) => {
  const mockSales = [
    { _id: 'mock_sale_1', saleNumber: 'SL-2026-001', customerName: 'রহিম মিয়া', customerPhone: '01712345678', saleDate: new Date(), items: [{ medicine: 'mock_med_1', medicineName: 'Napa Extra', quantity: 2, unitPrice: 120, totalPrice: 240 }], subtotal: 240, discount: 0, totalAmount: 240, paidAmount: 240, dueAmount: 0, paymentMethod: 'cash', status: 'completed', soldBy: 'mock_user_123' },
    { _id: 'mock_sale_2', saleNumber: 'SL-2026-002', customerName: 'করিম উদ্দিন', customerPhone: '01812345678', saleDate: new Date(Date.now() - 86400000), items: [{ medicine: 'mock_med_2', medicineName: 'Amoxicillin 500', quantity: 1, unitPrice: 180, totalPrice: 180 }], subtotal: 180, discount: 10, totalAmount: 170, paidAmount: 100, dueAmount: 70, paymentMethod: 'mobile_banking', status: 'partial', soldBy: 'mock_user_123' },
    { _id: 'mock_sale_3', saleNumber: 'SL-2026-003', customerName: 'ফাতিমা খাতুন', customerPhone: '01912345678', saleDate: new Date(Date.now() - 172800000), items: [{ medicine: 'mock_med_3', medicineName: 'Cetirizine', quantity: 3, unitPrice: 90, totalPrice: 270 }], subtotal: 270, discount: 20, totalAmount: 250, paidAmount: 250, dueAmount: 0, paymentMethod: 'cash', status: 'completed', soldBy: 'mock_user_123' }
  ];
  
  // Apply filters (simplified)
  let filtered = [...mockSales];
  if (query.customerName) filtered = filtered.filter(s => s.customerName.toLowerCase().includes(query.customerName.$regex.toLowerCase()));
  if (query.paymentMethod) filtered = filtered.filter(s => s.paymentMethod === query.paymentMethod);
  
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));
  
  const summary = {
    totalSales: filtered.length,
    totalAmount: filtered.reduce((sum, s) => sum + s.totalAmount, 0),
    totalPaid: filtered.reduce((sum, s) => sum + s.paidAmount, 0),
    totalDue: filtered.reduce((sum, s) => sum + s.dueAmount, 0),
    averageSale: filtered.length > 0 ? filtered.reduce((sum, s) => sum + s.totalAmount, 0) / filtered.length : 0
  };
  
  return { sales: paginated, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total, summary };
};

// Get all sales with pagination and filters
router.get('/', async (req, res) => {
  // Mock mode
  if (global.mockMode) {
    console.log('💰 Returning MOCK sales data');
    const { page = 1, limit = 20, customerName = '', paymentMethod } = req.query;
    let query = {};
    if (customerName) query.customerName = { $regex: customerName, $options: 'i' };
    if (paymentMethod) query.paymentMethod = paymentMethod;
    return res.json(getMockSales(query, page, limit));
  }
  
=======
// Get all sales with pagination and filters
router.get('/', async (req, res) => {
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      customerName, 
      paymentMethod,
      minAmount,
      maxAmount,
      sortBy = 'saleDate',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {};
    
    // Date range filter
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }
    
    // Customer name filter
    if (customerName) {
      query.customerName = { $regex: customerName, $options: 'i' };
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
    
    const sales = await Sale.find(query)
      .populate('items.medicine', 'name genericName strength unit')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Sale.countDocuments(query);
    
    // Calculate summary statistics
    const summary = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          averageSale: { $avg: '$totalAmount' }
        }
      }
    ]);
    
    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      summary: summary[0] || {
        totalSales: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0,
        averageSale: 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single sale
router.get('/:id', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    const mockSale = getMockSales().sales.find(s => s._id === req.params.id);
    if (!mockSale) return res.status(404).json({ message: 'Sale not found' });
    return res.json(mockSale);
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('items.medicine', 'name genericName strength unit');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new sale
router.post('/', [
  body('customerName').optional().isString(),
  body('customerPhone').optional().isString(),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.medicine').isMongoId().withMessage('Valid medicine ID is required'),
  body('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
  body('items.*.unitPrice').isNumeric().withMessage('Unit price must be a number'),
  body('subtotal').isNumeric().withMessage('Subtotal must be a number'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
  body('paidAmount').isNumeric().withMessage('Paid amount must be a number'),
  body('soldBy').notEmpty().withMessage('Sold by is required')
], async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💰 MOCK: Creating sale for', req.body.customerName);
    const newSale = { _id: 'mock_sale_' + Date.now(), saleNumber: 'SL-2026-' + Date.now().toString().slice(-3), ...req.body, saleDate: new Date(), status: 'completed' };
    return res.status(201).json(newSale);
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { items, ...saleData } = req.body;
    
    // Validate stock availability and update stock
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(400).json({ message: `Medicine with ID ${item.medicine} not found` });
      }
      
      if (medicine.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stockQuantity}, Required: ${item.quantity}` 
        });
      }
    }
    
    // Create sale
    const sale = new Sale({
      ...saleData,
      items: items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice
      }))
    });
    
    await sale.save();
    
    // Update stock quantities
    for (const item of items) {
      await Medicine.findByIdAndUpdate(
        item.medicine,
        { $inc: { stockQuantity: -item.quantity } }
      );
    }
    
    // Create due entry if there's a due amount
    if (sale.dueAmount > 0) {
      const due = new Due({
        customerName: sale.customerName || 'Unknown Customer',
        customerPhone: sale.customerPhone,
        sale: sale._id,
        dueAmount: sale.dueAmount,
        remainingAmount: sale.dueAmount,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
      await due.save();
    }
    
    // Populate the response
    const populatedSale = await Sale.findById(sale._id)
      .populate('items.medicine', 'name genericName strength unit');

    // Create a notification for the new sale
    try {
      const Notification = require('../models/Notification');
      const notif = await Notification.create({
        user: req.body.soldByUserId || null, // optional: attach to the user who sold
        type: 'sale',
        title: `New sale: ${populatedSale._id}`,
        message: `${populatedSale.customerName || 'Customer'} - ৳${populatedSale.totalAmount}`,
        link: `/sales/${populatedSale._id}`,
        meta: { saleId: populatedSale._id }
      });

      // Emit via socket.io if available
      try {
        const io = req.app.get('io');
        if (io) io.emit('notification:created', notif);
      } catch (e) {
        console.warn('Failed to emit sale notification', e.message || e);
      }
    } catch (e) {
      // non-fatal
      console.warn('Failed to create sale notification', e.message || e);
    }

    res.status(201).json(populatedSale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get today's sales summary
router.get('/summary/today', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💰 MOCK: Getting today\'s sales summary');
    return res.json({
      totalSales: 3,
      totalAmount: 660,
      totalPaid: 590,
      totalDue: 70,
      averageSale: 220
    });
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todaySales = await Sale.find({
      saleDate: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const summary = {
      totalSales: todaySales.length,
      totalAmount: todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      totalPaid: todaySales.reduce((sum, sale) => sum + sale.paidAmount, 0),
      totalDue: todaySales.reduce((sum, sale) => sum + sale.dueAmount, 0),
      averageSale: todaySales.length > 0 ? todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0) / todaySales.length : 0
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales analytics
router.get('/analytics/period', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💰 MOCK: Getting sales analytics');
    return res.json({
      period: req.query.period || 'week',
      totalSales: 15,
      totalRevenue: 4500,
      totalPaid: 4200,
      totalDue: 300,
      averageSale: 300,
      topSellingMedicines: [
        { medicine: { _id: 'mock_med_1', name: 'Napa Extra', genericName: 'Paracetamol' }, totalQuantity: 50, totalRevenue: 6000, saleCount: 10 },
        { medicine: { _id: 'mock_med_3', name: 'Cetirizine', genericName: 'Cetirizine HCL' }, totalQuantity: 30, totalRevenue: 2700, saleCount: 8 }
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
    
    const sales = await Sale.find({
      saleDate: { $gte: startDate, $lt: endDate }
    });
    
    const analytics = {
      period,
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      totalPaid: sales.reduce((sum, sale) => sum + sale.paidAmount, 0),
      totalDue: sales.reduce((sum, sale) => sum + sale.dueAmount, 0),
      averageSale: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / sales.length : 0,
      topSellingMedicines: await getTopSellingMedicines(sales)
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales by date range with detailed analytics
router.get('/analytics/range', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💰 MOCK: Getting sales analytics by range');
    return res.json({
      period: { startDate: req.query.startDate, endDate: req.query.endDate, groupBy: req.query.groupBy || 'day' },
      analytics: [
        { _id: { year: 2026, month: 5, day: 8 }, totalSales: 5, totalRevenue: 1500, totalPaid: 1400, totalDue: 100, averageSale: 300 }
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
      saleDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    let groupStage;
    switch (groupBy) {
      case 'hour':
        groupStage = {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' },
            day: { $dayOfMonth: '$saleDate' },
            hour: { $hour: '$saleDate' }
          }
        };
        break;
      case 'day':
        groupStage = {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' },
            day: { $dayOfMonth: '$saleDate' }
          }
        };
        break;
      case 'week':
        groupStage = {
          _id: {
            year: { $year: '$saleDate' },
            week: { $week: '$saleDate' }
          }
        };
        break;
      case 'month':
        groupStage = {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' }
          }
        };
        break;
      default:
        groupStage = {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' },
            day: { $dayOfMonth: '$saleDate' }
          }
        };
    }
    
    const analytics = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          averageSale: { $avg: '$totalAmount' }
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

// Get top selling medicines
router.get('/analytics/top-medicines', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💰 MOCK: Getting top selling medicines');
    return res.json({
      topMedicines: [
        { medicine: { _id: 'mock_med_1', name: 'Napa Extra', genericName: 'Paracetamol', strength: '500mg', unit: 'Tablet' }, totalQuantity: 50, totalRevenue: 6000, saleCount: 10 },
        { medicine: { _id: 'mock_med_3', name: 'Cetirizine', genericName: 'Cetirizine HCL', strength: '10mg', unit: 'Tablet' }, totalQuantity: 30, totalRevenue: 2700, saleCount: 8 }
      ]
    });
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    let matchStage = {};
    if (startDate || endDate) {
      matchStage.saleDate = {};
      if (startDate) matchStage.saleDate.$gte = new Date(startDate);
      if (endDate) matchStage.saleDate.$lte = new Date(endDate);
    }
    
    const topMedicines = await Sale.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          saleCount: { $sum: 1 }
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
          totalRevenue: 1,
          saleCount: 1
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

// Get customer analytics
router.get('/analytics/customers', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💰 MOCK: Getting customer analytics');
    return res.json({
      customerAnalytics: [
        { customerName: 'রহিম মিয়া', customerPhone: '01712345678', totalPurchases: 5, totalSpent: 1200, totalPaid: 1000, totalDue: 200, lastPurchaseDate: new Date(), averagePurchase: 240 },
        { customerName: 'করিম উদ্দিন', customerPhone: '01812345678', totalPurchases: 3, totalSpent: 800, totalPaid: 800, totalDue: 0, lastPurchaseDate: new Date(Date.now() - 86400000), averagePurchase: 267 }
      ]
    });
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    let matchStage = {};
    if (startDate || endDate) {
      matchStage.saleDate = {};
      if (startDate) matchStage.saleDate.$gte = new Date(startDate);
      if (endDate) matchStage.saleDate.$lte = new Date(endDate);
    }
    
    const customerAnalytics = await Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            customerName: '$customerName',
            customerPhone: '$customerPhone'
          },
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$dueAmount' },
          lastPurchaseDate: { $max: '$saleDate' },
          averagePurchase: { $avg: '$totalAmount' }
        }
      },
      {
        $project: {
          customerName: '$_id.customerName',
          customerPhone: '$_id.customerPhone',
          totalPurchases: 1,
          totalSpent: 1,
          totalPaid: 1,
          totalDue: 1,
          lastPurchaseDate: 1,
          averagePurchase: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.json({ customerAnalytics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export sales data
router.get('/export/csv', async (req, res) => {
  try {
    const { startDate, endDate, customerName, paymentMethod } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }
    
    if (customerName) {
      query.customerName = { $regex: customerName, $options: 'i' };
    }
    
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    const sales = await Sale.find(query)
      .populate('items.medicine', 'name genericName strength unit')
      .sort({ saleDate: -1 });
    
    // Convert to CSV format
    const csvHeader = 'Sale Number,Customer Name,Customer Phone,Items,Total Amount,Paid Amount,Due Amount,Payment Method,Sale Date,Sold By,Notes\n';
    
    const csvData = sales.map(sale => {
      const items = sale.items.map(item => 
        `${item.medicine.name} (${item.quantity}x)`
      ).join('; ');
      
      return [
        sale.saleNumber,
        sale.customerName || 'Walk-in Customer',
        sale.customerPhone || '',
        `"${items}"`,
        sale.totalAmount,
        sale.paidAmount,
        sale.dueAmount,
        sale.paymentMethod,
        sale.saleDate.toISOString(),
        sale.soldBy,
        `"${sale.notes || ''}"`
      ].join(',');
    }).join('\n');
    
    const csv = csvHeader + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-export.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to get top selling medicines
async function getTopSellingMedicines(sales) {
  const medicineSales = {};
  
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const medicineId = item.medicine.toString();
      if (!medicineSales[medicineId]) {
        medicineSales[medicineId] = {
          medicine: item.medicine,
          totalQuantity: 0,
          totalRevenue: 0
        };
      }
      medicineSales[medicineId].totalQuantity += item.quantity;
      medicineSales[medicineId].totalRevenue += item.totalPrice;
    });
  });
  
  const topMedicines = Object.values(medicineSales)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);
  
  // Populate medicine details
  const medicineIds = topMedicines.map(item => item.medicine);
  const medicines = await Medicine.find({ _id: { $in: medicineIds } }, 'name genericName');
  
  return topMedicines.map(item => {
    const medicine = medicines.find(m => m._id.toString() === item.medicine.toString());
    return {
      ...item,
      medicine: medicine
    };
  });
}

module.exports = router;