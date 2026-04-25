const mongoose = require('mongoose');

const dueSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  customerAddress: {
    type: String,
    trim: true
  },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true
  },
  dueAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'mobile_banking', 'bank_transfer'],
      default: 'cash'
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Update status based on remaining amount and due date
dueSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.remainingAmount <= 0) {
    this.status = 'paid';
  } else if (this.dueDate < now) {
    this.status = 'overdue';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else {
    this.status = 'pending';
  }
  
  next();
});

module.exports = mongoose.model('Due', dueSchema);