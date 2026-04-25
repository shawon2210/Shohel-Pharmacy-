const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Due = require('../models/Due');
const Expense = require('../models/Expense');
const Medicine = require('../models/Medicine');

// Dashboard analytics
const getDashboardData = async () => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const [
    todaySales,
    todayPurchases,
    todayExpenses,
    totalDues,
    lowStockMedicines,
    expiringMedicines
  ] = await Promise.all([
    Sale.aggregate([
      { $match: { saleDate: { $gte: startOfDay, $lt: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]),
    Purchase.aggregate([
      { $match: { purchaseDate: { $gte: startOfDay, $lt: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]),
    Expense.aggregate([
      { $match: { expenseDate: { $gte: startOfDay, $lt: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Due.aggregate([
      { $match: { status: { $in: ['pending', 'partial', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$remainingAmount' }, count: { $sum: 1 } } }
    ]),
    Medicine.find({ $expr: { $lte: ['$stockQuantity', '$minimumStock'] } }).countDocuments(),
    Medicine.find({ 
      expiryDate: { 
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      } 
    }).countDocuments()
  ]);

  // Shape response to match frontend Dashboard component expectations
  return {
    today: {
      sales: {
        amount: todaySales[0] ? todaySales[0].total : 0,
        count: todaySales[0] ? todaySales[0].count : 0,
        vsAverage: 0 // placeholder: can compute vs average later
      },
      purchases: {
        amount: todayPurchases[0] ? todayPurchases[0].total : 0,
        count: todayPurchases[0] ? todayPurchases[0].count : 0,
        vsAverage: 0
      },
      expenses: {
        amount: todayExpenses[0] ? todayExpenses[0].total : 0
      }
    },
    totalDue: {
      amount: totalDues[0] ? totalDues[0].total : 0,
      count: totalDues[0] ? totalDues[0].count : 0
    },
    alerts: {
      lowStock: lowStockMedicines,
      expiring: expiringMedicines
    }
  };
};

// Sales analytics
const getSalesAnalytics = async (startDate, endDate) => {
  return await Sale.aggregate([
    { $match: { saleDate: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
        totalSales: { $sum: '$totalAmount' },
        totalTransactions: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Top selling medicines
const getTopSellingMedicines = async (limit = 10) => {
  return await Sale.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.medicine',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.totalPrice' }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'medicines',
        localField: '_id',
        foreignField: '_id',
        as: 'medicine'
      }
    },
    { $unwind: '$medicine' }
  ]);
};

module.exports = {
  getDashboardData,
  getSalesAnalytics,
  getTopSellingMedicines
};