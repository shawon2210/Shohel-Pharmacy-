const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Due = require('../models/Due');
const Expense = require('../models/Expense');

const populateAllCollections = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/shohel_pharmacy');
    console.log('✅ Connected to MongoDB');

    // Create Medicine
    const medicine = await Medicine.create({
      name: 'Napa 500mg',
      genericName: 'Paracetamol',
      manufacturer: 'Beximco Pharmaceuticals',
      category: 'Analgesic',
      strength: '500mg',
      unit: 'tablet',
      packSize: '10x10',
      batchNumber: 'NAPA001',
      expiryDate: new Date('2025-12-31'),
      purchasePrice: 2.50,
      sellingPrice: 3.00,
      mrp: 3.50,
      stockQuantity: 100,
      minimumStock: 20,
      location: 'A-1-1'
    });
    console.log('✅ Medicine created');

    // Create Purchase
    const purchase = new Purchase({
      supplierName: 'Square Pharmaceuticals',
      supplierPhone: '01711111111',
      items: [{
        medicine: medicine._id,
        quantity: 100,
        unitPrice: 2.50,
        totalPrice: 250,
        batchNumber: 'NAPA001',
        expiryDate: new Date('2025-12-31')
      }],
      subtotal: 250,
      totalAmount: 250,
      paidAmount: 250,
      receivedBy: 'admin'
    });
    await purchase.save();
    console.log('✅ Purchase created');

    // Create Sale
    const sale = new Sale({
      customerName: 'John Doe',
      customerPhone: '01811111111',
      items: [{
        medicine: medicine._id,
        quantity: 10,
        unitPrice: 3.00,
        totalPrice: 30
      }],
      subtotal: 30,
      totalAmount: 30,
      paidAmount: 20,
      dueAmount: 10,
      soldBy: 'admin'
    });
    await sale.save();
    console.log('✅ Sale created');

    // Create Due
    const due = await Due.create({
      customerName: 'John Doe',
      customerPhone: '01811111111',
      sale: sale._id,
      dueAmount: 10,
      remainingAmount: 10,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    console.log('✅ Due created');

    // Create Expense
    const expense = await Expense.create({
      category: 'rent',
      description: 'Monthly shop rent',
      amount: 25000,
      paymentMethod: 'cash',
      vendor: 'Property Owner',
      recordedBy: 'admin'
    });
    console.log('✅ Expense created');

    console.log('\n🎉 All collections populated successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

populateAllCollections();