const { recordStockMovement } = require('../middleware/stockMiddleware');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Due = require('../models/Due');
const Customer = require('../models/Customer');

// Sale workflow
const processSale = async (saleData, performedBy) => {
  const session = require('mongoose').startSession();
  
  try {
    session.startTransaction();

    // Create sale
    const sale = new Sale(saleData);
    await sale.save({ session });

    // Update stock for each item
    for (const item of sale.items) {
      await recordStockMovement(
        item.medicine,
        'sale',
        item.quantity,
        `Sale ${sale.saleNumber}`,
        sale._id,
        performedBy
      );
    }

    // Create due if any
    if (sale.dueAmount > 0) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 days due

      await Due.create([{
        customerName: sale.customerName,
        customerPhone: sale.customerPhone,
        sale: sale._id,
        dueAmount: sale.dueAmount,
        remainingAmount: sale.dueAmount,
        dueDate
      }], { session });
    }

    // Update customer total purchases
    if (sale.customerPhone) {
      await Customer.findOneAndUpdate(
        { phone: sale.customerPhone },
        { 
          $inc: { 
            totalPurchases: sale.totalAmount,
            totalDue: sale.dueAmount 
          }
        },
        { upsert: true, session }
      );
    }

    await session.commitTransaction();
    return sale;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Purchase workflow
const processPurchase = async (purchaseData, performedBy) => {
  const session = require('mongoose').startSession();
  
  try {
    session.startTransaction();

    const purchase = new Purchase(purchaseData);
    await purchase.save({ session });

    // Update stock for each item
    for (const item of purchase.items) {
      await recordStockMovement(
        item.medicine,
        'purchase',
        item.quantity,
        `Purchase ${purchase.purchaseNumber}`,
        purchase._id,
        performedBy
      );
    }

    await session.commitTransaction();
    return purchase;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Due payment workflow
const processDuePayment = async (dueId, paymentAmount, paymentMethod, performedBy) => {
  const session = require('mongoose').startSession();
  
  try {
    session.startTransaction();

    const due = await Due.findById(dueId).session(session);
    if (!due) throw new Error('Due not found');

    const payment = {
      amount: paymentAmount,
      paymentDate: new Date(),
      paymentMethod,
      notes: `Payment by ${performedBy}`
    };

    due.paymentHistory.push(payment);
    due.paidAmount += paymentAmount;
    due.remainingAmount -= paymentAmount;

    if (due.remainingAmount <= 0) {
      due.remainingAmount = 0;
      due.status = 'paid';
    } else {
      due.status = 'partial';
    }

    await due.save({ session });

    // Update customer total due
    if (due.customerPhone) {
      await Customer.findOneAndUpdate(
        { phone: due.customerPhone },
        { $inc: { totalDue: -paymentAmount } },
        { session }
      );
    }

    await session.commitTransaction();
    return due;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  processSale,
  processPurchase,
  processDuePayment
};