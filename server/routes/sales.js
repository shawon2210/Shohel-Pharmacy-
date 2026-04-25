const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const Due = require('../models/Due');
const { body, validationResult } = require('express-validator');

// Get all sales with pagination and filters
router.get('/', async (req, res) => {
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