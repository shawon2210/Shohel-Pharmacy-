const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Expense = require('../models/Expense');
const Medicine = require('../models/Medicine');
const Due = require('../models/Due');

// Helper function to get date range
const getMatchStage = (startDate, endDate, dateField = 'saleDate') => {
  let matchStage = {};
  if (startDate || endDate) {
    matchStage[dateField] = {};
    if (startDate) matchStage[dateField].$gte = new Date(startDate);
    if (endDate) matchStage[dateField].$lte = new Date(endDate);
  }
  return matchStage;
};

// Comprehensive Overview Report
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const salesMatch = getMatchStage(startDate, endDate, 'saleDate');
    const purchaseMatch = getMatchStage(startDate, endDate, 'purchaseDate');
    const expenseMatch = getMatchStage(startDate, endDate, 'expenseDate');

    // Sales data
    const salesData = await Sale.aggregate([
      { $match: salesMatch },
      { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, totalTransactions: { $sum: 1 }, totalDue: { $sum: '$dueAmount' } } }
    ]);

    // Purchase data
    const purchaseData = await Purchase.aggregate([
      { $match: purchaseMatch },
      { $group: { _id: null, totalPurchases: { $sum: '$totalAmount' }, totalTransactions: { $sum: 1 } } }
    ]);

    // Expense data
    const expenseData = await Expense.aggregate([
      { $match: expenseMatch },
      { $group: { _id: null, totalExpenses: { $sum: '$amount' }, totalTransactions: { $sum: 1 } } }
    ]);

    // Due analysis
    const dueData = await Due.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$remainingAmount' } } }
    ]);

    // Stock alerts
    const stockAlerts = {
      lowStock: await Medicine.countDocuments({ $expr: { $lte: ['$stockQuantity', '$minimumStock'] } }),
      outOfStock: await Medicine.countDocuments({ stockQuantity: 0 }),
      expiringSoon: await Medicine.countDocuments({ expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } })
    };

    const sales = salesData[0] || { totalSales: 0, totalTransactions: 0, totalDue: 0 };
    const purchases = purchaseData[0] || { totalPurchases: 0, totalTransactions: 0 };
    const expenses = expenseData[0] || { totalExpenses: 0, totalTransactions: 0 };
    const profit = sales.totalSales - purchases.totalPurchases - expenses.totalExpenses;

    res.json({ sales, purchases, expenses, profit, dueData, stockAlerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sales Report
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = getMatchStage(startDate, endDate);

    const sales = await Sale.find(matchStage);
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalSales = sales.length;
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    const paymentMethods = await Sale.aggregate([
      { $match: matchStage },
      { $group: { _id: '$paymentMethod', amount: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $addFields: { percentage: { $cond: [ { $eq: [totalRevenue, 0] }, 0, { $multiply: [{ $divide: ['$amount', totalRevenue] }, 100] }] } } },
      { $project: { method: '$_id', amount: 1, count: 1, percentage: 1 } },
    ]);

    const topMedicines = await Sale.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        { $group: { _id: '$items.medicine', totalQuantity: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.totalPrice' } } },
        { $lookup: { from: 'medicines', localField: '_id', foreignField: '_id', as: 'medicine' } },
        { $unwind: '$medicine' },
        { $project: { 'medicine.name': 1, 'medicine.genericName': 1, totalQuantity: 1, totalRevenue: 1 } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
    ]);

    res.json({ totalRevenue, totalSales, averageSale, paymentMethods, topMedicines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Profit & Loss Report
router.get('/profit-loss', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const salesMatchStage = getMatchStage(startDate, endDate, 'saleDate');
    const expenseMatchStage = getMatchStage(startDate, endDate, 'expenseDate');

    const sales = await Sale.find(salesMatchStage).populate('items.medicine');
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    const costOfGoodsSold = sales.reduce((sum, sale) => {
      return sum + sale.items.reduce((itemSum, item) => {
        return itemSum + (item.medicine ? item.medicine.purchasePrice * item.quantity : 0);
      }, 0);
    }, 0);

    const expenses = await Expense.find(expenseMatchStage);
    const operatingExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const grossProfit = totalRevenue - costOfGoodsSold;
    const netProfit = grossProfit - operatingExpenses;

    const expenseBreakdown = await Expense.aggregate([
        { $match: expenseMatchStage },
        { $group: { _id: '$category', amount: { $sum: '$amount' } } },
        { $project: { category: '$_id', amount: 1 } },
    ]);

    res.json({ totalRevenue, costOfGoodsSold, operatingExpenses, grossProfit, netProfit, expenseBreakdown });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Medicine Performance Report
router.get('/medicines', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = getMatchStage(startDate, endDate);

        const totalMedicines = await Medicine.countDocuments();
        const lowStockItems = await Medicine.countDocuments({ $expr: { $lte: ['$stockQuantity', '$minimumStock'] } });
        const expiringSoon = await Medicine.countDocuments({ expiryDate: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
        const outOfStock = await Medicine.countDocuments({ stockQuantity: 0 });

        const topPerforming = await Sale.aggregate([
            { $match: matchStage },
            { $unwind: '$items' },
            { $group: { _id: '$items.medicine', totalSales: { $sum: '$items.quantity' }, revenue: { $sum: '$items.totalPrice' } } },
            { $lookup: { from: 'medicines', localField: '_id', foreignField: '_id', as: 'medicine' } },
            { $unwind: '$medicine' },
            { $project: { name: '$medicine.name', genericName: '$medicine.genericName', totalSales: 1, revenue: 1 } },
            { $sort: { totalSales: -1 } },
            { $limit: 10 },
        ]);

        const categoryPerformance = await Sale.aggregate([
            { $match: matchStage },
            { $unwind: '$items' },
            { $lookup: { from: 'medicines', localField: 'items.medicine', foreignField: '_id', as: 'medicine' } },
            { $unwind: '$medicine' },
            { $group: { _id: '$medicine.category', count: { $sum: '$items.quantity' }, revenue: { $sum: '$items.totalPrice' } } },
            { $project: { category: '$_id', count: 1, revenue: 1 } },
        ]);

        res.json({ totalMedicines, lowStockItems, expiringSoon, outOfStock, topPerforming, categoryPerformance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Customer Analytics Report with Due Integration
router.get('/customers', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = getMatchStage(startDate, endDate);

        const allCustomers = await Sale.distinct('customerPhone', { customerPhone: { $ne: null } });
        const totalCustomers = allCustomers.length;

        const activeCustomersResult = await Sale.aggregate([
            { $match: matchStage },
            { $group: { _id: '$customerPhone' } },
            { $match: { _id: { $ne: null } } },
            { $count: 'count' },
        ]);
        const activeCustomers = activeCustomersResult.length > 0 ? activeCustomersResult[0].count : 0;

        const topCustomers = await Sale.aggregate([
            { $match: { ...matchStage, customerPhone: { $ne: null } } },
            { $group: { _id: { customerName: '$customerName', customerPhone: '$customerPhone' }, totalPurchases: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' }, totalDue: { $sum: '$dueAmount' } } },
            { $lookup: { from: 'dues', localField: '_id.customerPhone', foreignField: 'customerPhone', as: 'dueDetails' } },
            { $addFields: { outstandingDue: { $sum: '$dueDetails.remainingAmount' } } },
            { $project: { customerName: '$_id.customerName', customerPhone: '$_id.customerPhone', totalPurchases: 1, totalSpent: 1, totalDue: 1, outstandingDue: 1 } },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
        ]);

        // Customer segments based on purchase behavior
        const customerSegments = await Sale.aggregate([
            { $match: { ...matchStage, customerPhone: { $ne: null } } },
            { $group: { _id: '$customerPhone', totalSpent: { $sum: '$totalAmount' }, purchaseCount: { $sum: 1 } } },
            { $bucket: {
                groupBy: '$totalSpent',
                boundaries: [0, 1000, 5000, 10000, 50000, Infinity],
                default: 'Other',
                output: { count: { $sum: 1 }, avgPurchases: { $avg: '$purchaseCount' } }
            }}
        ]);

        const sales = await Sale.find(matchStage);
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const averageOrderValue = activeCustomers > 0 ? totalRevenue / activeCustomers : 0;

        res.json({ totalCustomers, activeCustomers, averageOrderValue, topCustomers, customerSegments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Due Management Report
router.get('/dues', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = getMatchStage(startDate, endDate, 'createdAt');

        const duesSummary = await Due.aggregate([
            { $match: matchStage },
            { $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$dueAmount' },
                remainingAmount: { $sum: '$remainingAmount' }
            }}
        ]);

        const overdueCustomers = await Due.aggregate([
            { $match: { status: 'overdue' } },
            { $lookup: { from: 'sales', localField: 'sale', foreignField: '_id', as: 'saleDetails' } },
            { $unwind: '$saleDetails' },
            { $project: {
                customerName: 1,
                customerPhone: 1,
                remainingAmount: 1,
                dueDate: 1,
                daysPastDue: { $divide: [{ $subtract: [new Date(), '$dueDate'] }, 86400000] }
            }},
            { $sort: { daysPastDue: -1 } },
            { $limit: 20 }
        ]);

        const paymentTrends = await Due.aggregate([
            { $unwind: '$paymentHistory' },
            { $match: { 'paymentHistory.paymentDate': { $gte: new Date(startDate), $lte: new Date(endDate) } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentHistory.paymentDate' } },
                totalCollected: { $sum: '$paymentHistory.amount' },
                transactionCount: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        res.json({ duesSummary, overdueCustomers, paymentTrends });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Financial Dashboard
router.get('/financial', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const salesMatch = getMatchStage(startDate, endDate, 'saleDate');
        const purchaseMatch = getMatchStage(startDate, endDate, 'purchaseDate');
        const expenseMatch = getMatchStage(startDate, endDate, 'expenseDate');

        // Daily financial trends
        const dailyTrends = await Sale.aggregate([
            { $match: salesMatch },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
                sales: { $sum: '$totalAmount' },
                transactions: { $sum: 1 },
                cash: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$totalAmount', 0] } },
                card: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, '$totalAmount', 0] } }
            }},
            { $sort: { _id: 1 } }
        ]);

        // Expense breakdown by category
        const expenseBreakdown = await Expense.aggregate([
            { $match: expenseMatch },
            { $group: { _id: '$category', amount: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $sort: { amount: -1 } }
        ]);

        // Profit margins by medicine category
        const profitByCategory = await Sale.aggregate([
            { $match: salesMatch },
            { $unwind: '$items' },
            { $lookup: { from: 'medicines', localField: 'items.medicine', foreignField: '_id', as: 'medicine' } },
            { $unwind: '$medicine' },
            { $group: {
                _id: '$medicine.category',
                revenue: { $sum: '$items.totalPrice' },
                cost: { $sum: { $multiply: ['$items.quantity', '$medicine.purchasePrice'] } },
                quantity: { $sum: '$items.quantity' }
            }},
            { $addFields: { profit: { $subtract: ['$revenue', '$cost'] }, margin: { $multiply: [{ $divide: [{ $subtract: ['$revenue', '$cost'] }, '$revenue'] }, 100] } } },
            { $sort: { profit: -1 } }
        ]);

        res.json({ dailyTrends, expenseBreakdown, profitByCategory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Inventory Movement Report
router.get('/inventory', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const salesMatch = getMatchStage(startDate, endDate, 'saleDate');
        const purchaseMatch = getMatchStage(startDate, endDate, 'purchaseDate');

        // Stock movement analysis
        const stockMovement = await Sale.aggregate([
            { $match: salesMatch },
            { $unwind: '$items' },
            { $lookup: { from: 'medicines', localField: 'items.medicine', foreignField: '_id', as: 'medicine' } },
            { $unwind: '$medicine' },
            { $group: {
                _id: '$items.medicine',
                medicineName: { $first: '$medicine.name' },
                totalSold: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.totalPrice' },
                currentStock: { $first: '$medicine.stockQuantity' },
                minimumStock: { $first: '$medicine.minimumStock' }
            }},
            { $addFields: {
                stockStatus: {
                    $cond: [
                        { $lte: ['$currentStock', 0] }, 'Out of Stock',
                        { $lte: ['$currentStock', '$minimumStock'] }, 'Low Stock',
                        'Normal'
                    ]
                },
                turnoverRate: { $divide: ['$totalSold', { $add: ['$currentStock', '$totalSold'] }] }
            }},
            { $sort: { totalSold: -1 } }
        ]);

        // Purchase vs Sales comparison
        const purchaseVsSales = await Purchase.aggregate([
            { $match: purchaseMatch },
            { $unwind: '$items' },
            { $group: {
                _id: '$items.medicine',
                totalPurchased: { $sum: '$items.quantity' },
                purchaseCost: { $sum: '$items.totalPrice' }
            }},
            { $lookup: {
                from: 'sales',
                let: { medicineId: '$_id' },
                pipeline: [
                    { $match: salesMatch },
                    { $unwind: '$items' },
                    { $match: { $expr: { $eq: ['$items.medicine', '$$medicineId'] } } },
                    { $group: { _id: null, totalSold: { $sum: '$items.quantity' }, salesRevenue: { $sum: '$items.totalPrice' } } }
                ],
                as: 'salesData'
            }},
            { $lookup: { from: 'medicines', localField: '_id', foreignField: '_id', as: 'medicine' } },
            { $unwind: '$medicine' },
            { $addFields: {
                totalSold: { $ifNull: [{ $arrayElemAt: ['$salesData.totalSold', 0] }, 0] },
                salesRevenue: { $ifNull: [{ $arrayElemAt: ['$salesData.salesRevenue', 0] }, 0] }
            }},
            { $project: {
                medicineName: '$medicine.name',
                totalPurchased: 1,
                totalSold: 1,
                purchaseCost: 1,
                salesRevenue: 1,
                netMovement: { $subtract: ['$totalPurchased', '$totalSold'] },
                profitMargin: { $subtract: ['$salesRevenue', '$purchaseCost'] }
            }}
        ]);

        res.json({ stockMovement, purchaseVsSales });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;