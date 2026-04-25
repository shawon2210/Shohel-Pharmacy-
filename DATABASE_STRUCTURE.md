# Database Structure & Workflow

## Complete Database Schema

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (admin, manager, staff),
  fullName: String,
  phone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Medicines Collection
```javascript
{
  _id: ObjectId,
  name: String,
  genericName: String,
  manufacturer: String,
  category: String,
  strength: String,
  unit: String (tablet, capsule, syrup, etc.),
  packSize: String,
  batchNumber: String,
  expiryDate: Date,
  purchasePrice: Number,
  sellingPrice: Number,
  mrp: Number,
  stockQuantity: Number,
  minimumStock: Number,
  location: String,
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Customers Collection
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String (unique),
  email: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  dateOfBirth: Date,
  totalPurchases: Number,
  totalDue: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Suppliers Collection
```javascript
{
  _id: ObjectId,
  name: String,
  contactPerson: String,
  phone: String,
  email: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  licenseNumber: String,
  paymentTerms: String (cash, credit_7, credit_15, credit_30),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Sales Collection
```javascript
{
  _id: ObjectId,
  saleNumber: String (auto-generated),
  customerName: String,
  customerPhone: String,
  items: [{
    medicine: ObjectId (ref: Medicine),
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: Number,
  discount: Number,
  tax: Number,
  totalAmount: Number,
  paidAmount: Number,
  dueAmount: Number,
  paymentMethod: String (cash, card, mobile_banking, mixed),
  saleDate: Date,
  soldBy: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Purchases Collection
```javascript
{
  _id: ObjectId,
  purchaseNumber: String (auto-generated),
  supplierName: String,
  supplierPhone: String,
  supplierAddress: String,
  items: [{
    medicine: ObjectId (ref: Medicine),
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    batchNumber: String,
    expiryDate: Date
  }],
  subtotal: Number,
  discount: Number,
  tax: Number,
  totalAmount: Number,
  paidAmount: Number,
  dueAmount: Number,
  paymentMethod: String (cash, cheque, bank_transfer, credit),
  purchaseDate: Date,
  receivedBy: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Dues Collection
```javascript
{
  _id: ObjectId,
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  sale: ObjectId (ref: Sale),
  dueAmount: Number,
  paidAmount: Number,
  remainingAmount: Number,
  dueDate: Date,
  status: String (pending, partial, paid, overdue),
  paymentHistory: [{
    amount: Number,
    paymentDate: Date,
    paymentMethod: String,
    notes: String
  }],
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Expenses Collection
```javascript
{
  _id: ObjectId,
  category: String (rent, utilities, staff_salary, maintenance, etc.),
  description: String,
  amount: Number,
  expenseDate: Date,
  paymentMethod: String (cash, card, bank_transfer, cheque),
  receiptNumber: String,
  vendor: String,
  recordedBy: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Stock Movements Collection
```javascript
{
  _id: ObjectId,
  medicine: ObjectId (ref: Medicine),
  type: String (purchase, sale, adjustment, return, expired),
  quantity: Number,
  previousStock: Number,
  newStock: Number,
  reference: String,
  referenceId: ObjectId,
  notes: String,
  performedBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Data Flow Workflows

### 1. Sale Process Workflow
```
1. Create Sale → 2. Update Stock → 3. Create Due (if any) → 4. Update Customer
```

**Steps:**
1. **Create Sale**: Record sale transaction with items
2. **Update Stock**: Reduce medicine stock quantities
3. **Create Due**: If payment is partial, create due record
4. **Update Customer**: Update customer's total purchases and dues
5. **Record Stock Movement**: Log all stock changes

### 2. Purchase Process Workflow
```
1. Create Purchase → 2. Update Stock → 3. Update Medicine Info
```

**Steps:**
1. **Create Purchase**: Record purchase transaction
2. **Update Stock**: Increase medicine stock quantities
3. **Update Medicine Info**: Update batch numbers, expiry dates
4. **Record Stock Movement**: Log stock increases

### 3. Due Payment Workflow
```
1. Record Payment → 2. Update Due Status → 3. Update Customer Due
```

**Steps:**
1. **Record Payment**: Add payment to due's payment history
2. **Update Due Status**: Change status based on remaining amount
3. **Update Customer**: Reduce customer's total due amount

### 4. Stock Management Workflow
```
1. Monitor Stock Levels → 2. Generate Alerts → 3. Automatic Reorder Points
```

**Features:**
- Low stock alerts when quantity ≤ minimum stock
- Expiry alerts for medicines expiring within 30 days
- Automatic stock movement tracking
- Stock adjustment capabilities

## Database Indexes

### Performance Indexes
```javascript
// Medicines
{ name: 'text', genericName: 'text', manufacturer: 'text' }
{ stockQuantity: 1, minimumStock: 1 }
{ expiryDate: 1 }

// Sales
{ saleDate: -1 }
{ customerPhone: 1 }
{ saleNumber: 1 }

// Purchases
{ purchaseDate: -1 }
{ supplierName: 1 }

// Dues
{ status: 1, dueDate: 1 }
{ customerPhone: 1 }

// Stock Movements
{ medicine: 1, createdAt: -1 }
{ type: 1, createdAt: -1 }
```

## Analytics & Reporting

### Dashboard Metrics
- Today's sales, purchases, expenses
- Total dues and overdue amounts
- Low stock and expiring medicine alerts
- Monthly profit/loss calculations

### Reports Available
- Sales analytics by period
- Top selling medicines
- Stock movement history
- Customer purchase history
- Supplier purchase history
- Expense categorization
- Profit/loss statements

## Data Validation Rules

### Business Rules
1. **Stock cannot go negative** during sales
2. **Expiry date must be future** for new medicines
3. **Sale amount must match** item totals + tax - discount
4. **Due amount cannot exceed** total sale amount
5. **Payment amount cannot exceed** remaining due amount

### Data Integrity
- Foreign key relationships maintained
- Automatic number generation for sales/purchases
- Transaction-based operations for data consistency
- Audit trail through stock movements

## Backup & Recovery

### Automated Backups
```bash
# Daily backup
mongodump --db shohel_pharmacy --out ./backups/$(date +%Y%m%d)

# Restore from backup
mongorestore --db shohel_pharmacy ./backups/20241201/shohel_pharmacy
```

### Data Migration
- Export/import utilities for data transfer
- Schema versioning for updates
- Data validation during migration