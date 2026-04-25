const express = require('express');
const router = express.Router();
const { getDashboardData, getSalesAnalytics, getTopSellingMedicines } = require('../database/analytics');

// Get dashboard summary data
router.get('/summary', async (req, res) => {
  try {
    const dashboardData = await getDashboardData();
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Failed to generate dashboard summary.' });
  }
});

// Get recent activities
router.get('/activities', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recent sales
    const recentSales = await Sale.find()
      .populate('items.medicine', 'name')
      .sort({ saleDate: -1 })
      .limit(parseInt(limit) / 2);
    
    // Get recent purchases
    const recentPurchases = await Purchase.find()
      .populate('items.medicine', 'name')
      .sort({ purchaseDate: -1 })
      .limit(parseInt(limit) / 2);
    
    // Combine and sort activities
    const activities = [
      ...recentSales.map(sale => ({
        type: 'sale',
        id: sale._id,
        title: `Sale #${sale.saleNumber}`,
        description: `${sale.items.length} items sold`,
        amount: sale.totalAmount,
        date: sale.saleDate,
        customer: sale.customerName || 'Walk-in Customer'
      })),
      ...recentPurchases.map(purchase => ({
        type: 'purchase',
        id: purchase._id,
        title: `Purchase #${purchase.purchaseNumber}`,
        description: `${purchase.items.length} items purchased`,
        amount: purchase.totalAmount,
        date: purchase.purchaseDate,
        supplier: purchase.supplierName
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(limit));
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top selling medicines
router.get('/top-medicines', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const topMedicines = await getTopSellingMedicines(parseInt(limit));
    res.json(topMedicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sales chart data
router.get('/chart/sales', async (req, res) => {
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
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
    }
    
    const salesData = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' },
            day: { $dayOfMonth: '$saleDate' }
          },
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;