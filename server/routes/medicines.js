const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { body, validationResult } = require('express-validator');

// Get all medicines with search and pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category = '', lowStock = false, expiringSoon = false } = req.query;
    
    let query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter low stock medicines
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stockQuantity', '$minimumStock'] };
    }
    
    // Filter expiring soon medicines (within 30 days)
    if (expiringSoon === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query.expiryDate = { $lte: thirtyDaysFromNow };
    }
    
    const medicines = await Medicine.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Medicine.countDocuments(query);
    
    res.json({
      medicines,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single medicine
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new medicine
router.post('/', [
  body('name').notEmpty().withMessage('Medicine name is required'),
  body('genericName').notEmpty().withMessage('Generic name is required'),
  body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('strength').notEmpty().withMessage('Strength is required'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('packSize').notEmpty().withMessage('Pack size is required'),
  body('batchNumber').notEmpty().withMessage('Batch number is required'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  body('purchasePrice').isNumeric().withMessage('Purchase price must be a number'),
  body('sellingPrice').isNumeric().withMessage('Selling price must be a number'),
  body('mrp').isNumeric().withMessage('MRP must be a number'),
  body('stockQuantity').isNumeric().withMessage('Stock quantity must be a number'),
  body('minimumStock').isNumeric().withMessage('Minimum stock must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update medicine
router.put('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update stock quantity
router.patch('/:id/stock', [
  body('quantity').isNumeric().withMessage('Quantity must be a number'),
  body('operation').isIn(['add', 'subtract']).withMessage('Operation must be add or subtract')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { quantity, operation } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    if (operation === 'add') {
      medicine.stockQuantity += quantity;
    } else {
      if (medicine.stockQuantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      medicine.stockQuantity -= quantity;
    }
    
    await medicine.save();
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete medicine (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Medicine.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get low stock medicines
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const medicines = await Medicine.find({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$minimumStock'] }
    }).sort({ stockQuantity: 1 });
    
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get expiring soon medicines
router.get('/alerts/expiring', async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const medicines = await Medicine.find({
      isActive: true,
      expiryDate: { $lte: thirtyDaysFromNow }
    }).sort({ expiryDate: 1 });
    
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;