const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Due = require('../models/Due');
const Expense = require('../models/Expense');
const StockMovement = require('../models/StockMovement');

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'shohel@pharmacy.com',
    password: 'shawon123',
    role: 'admin',
    fullName: 'System Administrator',
    phone: '01700000000'
  }
  ,{
    username: 'manager',
    email: 'manager@pharmacy.com',
    password: 'manager123',
    role: 'manager',
    fullName: 'Store Manager',
    phone: '01711112222'
  }
];

const sampleSuppliers = [
  {
    name: 'Square Pharmaceuticals Ltd',
    contactPerson: 'Mr. Rahman',
    phone: '01711111111',
    email: 'contact@square.com',
    address: {
      street: '48, Mohakhali C/A',
      city: 'Dhaka',
      state: 'Dhaka',
      zipCode: '1212'
    },
    licenseNumber: 'DL-001',
    paymentTerms: 'credit_30'
  }
];

const sampleCustomers = [
  {
    name: 'আব্দুল করিম',
    phone: '01811111111',
    address: {
      street: 'House 10, Road 5',
      city: 'Dhaka',
      state: 'Dhaka',
      zipCode: '1205'
    }
  }
];

const sampleMedicines = [
  {
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
    stockQuantity: 500,
    minimumStock: 50,
    location: 'A-1-1'
  },
  {
    name: 'Seclo 20mg',
    genericName: 'Omeprazole',
    manufacturer: 'Square Pharmaceuticals',
    category: 'Antacid',
    strength: '20mg',
    unit: 'capsule',
    packSize: '3x10',
    batchNumber: 'SEC001',
    expiryDate: new Date('2025-08-15'),
    purchasePrice: 5.00,
    sellingPrice: 6.00,
    mrp: 7.00,
    stockQuantity: 200,
    minimumStock: 30,
    location: 'B-2-3'
  }
];

const sampleExpenses = [
  {
    category: 'rent',
    description: 'Monthly shop rent',
    amount: 25000,
    paymentMethod: 'bank_transfer',
    vendor: 'Property Owner',
    recordedBy: 'admin'
  }
];

const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Initialize Users
    // Ensure sample users exist (create missing ones)
    console.log('👥 Ensuring sample users...');
    for (const u of sampleUsers) {
      const found = await User.findOne({ username: u.username });
      if (!found) {
        const newUser = new User(u);
        await newUser.save();
        console.log(`   - created user: ${u.username}`);
      } else {
        console.log(`   - user already exists: ${u.username}`);
      }
    }
    console.log('✅ Sample users ensured');

    // Initialize Suppliers
    const existingSuppliers = await Supplier.countDocuments();
    if (existingSuppliers === 0) {
      console.log('🏢 Adding sample suppliers...');
      await Supplier.insertMany(sampleSuppliers);
      console.log('✅ Sample suppliers added');
    }

    // Initialize Customers
    const existingCustomers = await Customer.countDocuments();
    if (existingCustomers === 0) {
      console.log('👤 Adding sample customers...');
      await Customer.insertMany(sampleCustomers);
      console.log('✅ Sample customers added');
    }

    // Initialize Medicines
    const existingMedicines = await Medicine.countDocuments();
    if (existingMedicines === 0) {
      console.log('📦 Adding sample medicines...');
      await Medicine.insertMany(sampleMedicines);
      console.log('✅ Sample medicines added');
    } else {
      console.log('📋 Medicines already exist in database');
    }

    // Initialize Expenses
    const existingExpenses = await Expense.countDocuments();
    if (existingExpenses === 0) {
      console.log('💰 Adding sample expenses...');
      await Expense.insertMany(sampleExpenses);
      console.log('✅ Sample expenses added');
    }

    // Create indexes
    await User.createIndexes();
    await Medicine.createIndexes();
    await Customer.createIndexes();
    await Supplier.createIndexes();
    await Sale.createIndexes();
    await Purchase.createIndexes();
    await Due.createIndexes();
    await Expense.createIndexes();
    await StockMovement.createIndexes();

    console.log('🔍 Database indexes created');
    console.log('✅ Database initialization completed');

  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

module.exports = { initializeDatabase };