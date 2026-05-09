const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { body, validationResult } = require('express-validator');

<<<<<<< HEAD
// Mock medicines data for when MongoDB is not available
const getMockMedicines = (query = {}, page = 1, limit = 20) => {
  const mockMedicines = [
    { _id: 'mock_med_1', name: 'Napa Extra', genericName: 'Paracetamol', manufacturer: 'Beximco Pharma', category: 'Painkiller', strength: '500mg', unit: 'Tablet', packSize: '50 Tablets', batchNumber: 'B2026A', expiryDate: new Date('2026-12-31'), purchasePrice: 80, sellingPrice: 120, mrp: 130, stockQuantity: 150, minimumStock: 50, isActive: true },
    { _id: 'mock_med_2', name: 'Amoxicillin 500', genericName: 'Amoxicillin', manufacturer: 'Square Pharma', category: 'Antibiotic', strength: '500mg', unit: 'Capsule', packSize: '21 Capsules', batchNumber: 'S2026B', expiryDate: new Date('2026-10-15'), purchasePrice: 120, sellingPrice: 180, mrp: 200, stockQuantity: 30, minimumStock: 40, isActive: true },
    { _id: 'mock_med_3', name: 'Cetirizine', genericName: 'Cetirizine HCL', manufacturer: 'Incepta Pharma', category: 'Antihistamine', strength: '10mg', unit: 'Tablet', packSize: '30 Tablets', batchNumber: 'I2026C', expiryDate: new Date('2027-03-20'), purchasePrice: 60, sellingPrice: 90, mrp: 100, stockQuantity: 200, minimumStock: 60, isActive: true },
    { _id: 'mock_med_4', name: 'Metformin', genericName: 'Metformin HCL', manufacturer: 'Eskayef Pharma', category: 'Antidiabetic', strength: '500mg', unit: 'Tablet', packSize: '60 Tablets', batchNumber: 'E2026D', expiryDate: new Date('2026-08-10'), purchasePrice: 100, sellingPrice: 150, mrp: 170, stockQuantity: 45, minimumStock: 50, isActive: true },
    { _id: 'mock_med_5', name: 'Omeprazole', genericName: 'Omeprazole', manufacturer: 'ACI Pharma', category: 'Antacid', strength: '20mg', unit: 'Capsule', packSize: '30 Capsules', batchNumber: 'A2026E', expiryDate: new Date('2027-01-15'), purchasePrice: 90, sellingPrice: 140, mrp: 160, stockQuantity: 80, minimumStock: 30, isActive: true }
  ];
  
  // Apply filters
  let filtered = [...mockMedicines];
  
  if (query.$or) {
    filtered = filtered.filter(med => 
      query.$or.some(condition => {
        if (condition.name) return med.name.toLowerCase().includes(query.$or[0].name.$regex.toLowerCase());
        if (condition.genericName) return med.genericName.toLowerCase().includes(query.$or[1].genericName.$regex.toLowerCase());
        if (condition.manufacturer) return med.manufacturer.toLowerCase().includes(query.$or[2].manufacturer.$regex.toLowerCase());
        return false;
      })
    );
  }
  
  if (query.category) filtered = filtered.filter(med => med.category === query.category);
  if (query.isActive !== undefined) filtered = filtered.filter(med => med.isActive === query.isActive);
  
  // Low stock filter
  if (query.$expr) {
    filtered = filtered.filter(med => med.stockQuantity <= med.minimumStock);
  }
  
  // Expiry filter
  if (query.expiryDate) {
    filtered = filtered.filter(med => new Date(med.expiryDate) <= new Date(query.expiryDate.$lte));
  }
  
  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));
  
  return { medicines: paginated, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total };
};

// Get all medicines with search and pagination
router.get('/', async (req, res) => {
  // Return mock data if in mock mode
  if (global.mockMode) {
    console.log('💊 Returning MOCK medicines data');
    const { page = 1, limit = 20, search = '', category = '', lowStock = false, expiringSoon = false } = req.query;
    let query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { genericName: { $regex: search, $options: 'i' } }, { manufacturer: { $regex: search, $options: 'i' } }];
    if (category) query.category = category;
    if (lowStock === 'true') query.$expr = { $lte: ['$stockQuantity', '$minimumStock'] };
    if (expiringSoon === 'true') query.expiryDate = { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) };
    return res.json(getMockMedicines(query, page, limit));
  }
  
=======
// Get all medicines with search and pagination
router.get('/', async (req, res) => {
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    const mockMed = getMockMedicines().medicines.find(m => m._id === req.params.id);
    if (!mockMed) return res.status(404).json({ message: 'Medicine not found' });
    return res.json(mockMed);
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💊 MOCK: Creating medicine', req.body.name);
    const newMed = { _id: 'mock_med_' + Date.now(), ...req.body, isActive: true };
    return res.status(201).json(newMed);
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💊 MOCK: Updating medicine', req.params.id);
    const mockMed = { _id: req.params.id, ...req.body, isActive: true };
    return res.json(mockMed);
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💊 MOCK: Updating stock for', req.params.id);
    return res.json({ _id: req.params.id, stockQuantity: 100, ...req.body });
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💊 MOCK: Deleting medicine', req.params.id);
    return res.json({ message: 'Medicine deleted successfully' });
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💊 MOCK: Getting categories');
    const categories = ['Painkiller', 'Antibiotic', 'Antihistamine', 'Antidiabetic', 'Antacid', 'Antidepressant'];
    return res.json(categories);
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  try {
    const categories = await Medicine.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get low stock medicines
router.get('/alerts/low-stock', async (req, res) => {
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💊 MOCK: Getting low stock alerts');
    const mockData = getMockMedicines();
    const lowStock = mockData.medicines.filter(m => m.stockQuantity <= m.minimumStock);
    return res.json(lowStock);
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
  // Mock mode
  if (global.mockMode) {
    console.log('💊 MOCK: Getting expiring alerts');
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const mockData = getMockMedicines();
    const expiring = mockData.medicines.filter(m => new Date(m.expiryDate) <= thirtyDaysFromNow);
    return res.json(expiring);
  }
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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