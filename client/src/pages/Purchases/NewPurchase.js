import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaPlus, 
  FaTrash, 
  FaCalculator,
  FaBuilding,
  FaCreditCard,
  FaMoneyBillWave,
  FaPrint,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';
import Background3D from '../../components/UI/Background3D';
import './NewPurchase.css';
import { formatCurrency, CURRENCY_SYMBOL } from '../../utils/currency';

const NewPurchase = () => {
  const navigate = useNavigate();
  
  // State for medicines search and selection
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for purchase items
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [purchaseTotal, setPurchaseTotal] = useState(0);
  
  // State for supplier details
  const [supplierDetails, setSupplierDetails] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  // State for payment
  const [paymentDetails, setPaymentDetails] = useState({
    method: 'cash',
    paidAmount: 0,
    discount: 0,
    tax: 0
  });
  
  // State for form
  const [itemForm, setItemForm] = useState({
    quantity: 1,
    unitPrice: 0,
    batchNumber: '',
    expiryDate: ''
  });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch medicines for search
  const fetchMedicines = useCallback(async () => {
    if (!searchTerm.trim()) {
      setMedicines([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/medicines?search=${searchTerm}&limit=10`);
      setMedicines(response.data.medicines);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMedicines();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchMedicines]);

  // Calculate purchase totals
  useEffect(() => {
    const subtotal = purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (subtotal * paymentDetails.discount) / 100;
    const taxAmount = (subtotal * paymentDetails.tax) / 100;
    const total = subtotal - discountAmount + taxAmount;
    
    setPurchaseTotal(total);
  }, [purchaseItems, paymentDetails.discount, paymentDetails.tax]);

  // Add medicine to purchase
  const addToPurchase = () => {
    if (!selectedMedicine || itemForm.quantity <= 0) {
      toast.error('Please select a medicine and enter valid quantity');
      return;
    }

    if (!itemForm.batchNumber.trim()) {
      toast.error('Please enter batch number');
      return;
    }

    if (!itemForm.expiryDate) {
      toast.error('Please enter expiry date');
      return;
    }

    if (itemForm.unitPrice <= 0) {
      toast.error('Please enter valid unit price');
      return;
    }

    // Check if medicine already in purchase
    const existingItem = purchaseItems.find(item => 
      item.medicine._id === selectedMedicine._id && 
      item.batchNumber === itemForm.batchNumber
    );
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + itemForm.quantity;
      setPurchaseItems(prev => prev.map(item => 
        item.medicine._id === selectedMedicine._id && item.batchNumber === itemForm.batchNumber
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
          : item
      ));
    } else {
      const newItem = {
        medicine: selectedMedicine,
        quantity: itemForm.quantity,
        unitPrice: itemForm.unitPrice,
        totalPrice: itemForm.quantity * itemForm.unitPrice,
        batchNumber: itemForm.batchNumber,
        expiryDate: itemForm.expiryDate
      };
      setPurchaseItems(prev => [...prev, newItem]);
    }

    // Reset form
    setSelectedMedicine(null);
    setItemForm({
      quantity: 1,
      unitPrice: 0,
      batchNumber: '',
      expiryDate: ''
    });
    setSearchTerm('');
    setMedicines([]);
    
    toast.success('Medicine added to purchase');
  };

  // Remove item from purchase
  const removeFromPurchase = (index) => {
    setPurchaseItems(prev => prev.filter((_, i) => i !== index));
    toast.success('Item removed from purchase');
  };

  // Update item quantity in purchase
  const updatePurchaseQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromPurchase(index);
      return;
    }

    setPurchaseItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
        : item
    ));
  };

  // Update item unit price
  const updatePurchasePrice = (index, newPrice) => {
    if (newPrice < 0) return;

    setPurchaseItems(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, unitPrice: newPrice, totalPrice: item.quantity * newPrice }
        : item
    ));
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentDetails(prev => ({ ...prev, method }));
  };

  // Calculate due amount
  const getDueAmount = () => {
    return Math.max(0, purchaseTotal - paymentDetails.paidAmount);
  };

  // Submit purchase
  const handleSubmitPurchase = async () => {
    if (purchaseItems.length === 0) {
      toast.error('Please add at least one medicine to purchase');
      return;
    }

    if (!supplierDetails.name.trim()) {
      toast.error('Please enter supplier name');
      return;
    }

    if (paymentDetails.paidAmount < 0) {
      toast.error('Paid amount cannot be negative');
      return;
    }

    try {
      setSubmitting(true);
      
      const purchaseData = {
        supplierName: supplierDetails.name,
        supplierPhone: supplierDetails.phone,
        supplierAddress: supplierDetails.address,
        items: purchaseItems.map(item => ({
          medicine: item.medicine._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate
        })),
        subtotal: purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0),
        discount: paymentDetails.discount,
        tax: paymentDetails.tax,
        totalAmount: purchaseTotal,
        paidAmount: paymentDetails.paidAmount,
        dueAmount: getDueAmount(),
        paymentMethod: paymentDetails.method,
        notes: notes,
        receivedBy: 'Admin' // This should come from auth context in real app
      };

      await axios.post('/api/purchases', purchaseData);
      
      toast.success('Purchase completed successfully!');
      
      // Reset form
      setPurchaseItems([]);
      setSupplierDetails({ name: '', phone: '', address: '' });
      setPaymentDetails({ method: 'cash', paidAmount: 0, discount: 0, tax: 0 });
      setNotes('');
      
      // Navigate to purchases list
      navigate('/purchases');
      
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to complete purchase');
      }
      console.error('Error creating purchase:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Print purchase order (placeholder)
  const printPurchaseOrder = () => {
    window.print();
  };

  // Auto-fill unit price when medicine is selected
  useEffect(() => {
    if (selectedMedicine) {
      setItemForm(prev => ({
        ...prev,
        unitPrice: selectedMedicine.purchasePrice || 0
      }));
    }
  }, [selectedMedicine]);

  return (
    <>
      <Background3D variant="medical" />
      <div className="new-purchase-page">
        <div className="page-header">
          <h1>🏢 New Purchase / নতুন ক্রয়</h1>
          <button 
            className="back-button"
            onClick={() => navigate('/purchases')}
          >
            <FaArrowLeft /> Back to Purchases
          </button>
        </div>

      <div className="purchase-container">
        {/* Left Side - Medicine Selection and Purchase Items */}
        <div className="purchase-left">
          {/* Medicine Search */}
          <div className="medicine-search-section">
            <h3>💊 Search Medicines</h3>
            <div className="search-container">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search medicines by name, generic name, or manufacturer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {loading && <div className="loading-indicator">Searching...</div>}
              
              {medicines.length > 0 && (
                <div className="search-results">
                  {medicines.map(medicine => (
                    <div
                      key={medicine._id}
                      className={`search-result-item ${selectedMedicine?._id === medicine._id ? 'selected' : ''}`}
                      onClick={() => setSelectedMedicine(medicine)}
                    >
                      <div className="medicine-info">
                        <h4>{medicine.name}</h4>
                        <p>{medicine.genericName} - {medicine.strength} {medicine.unit}</p>
                        <p>Manufacturer: {medicine.manufacturer}</p>
                        <p>Current Stock: {medicine.stockQuantity} | Purchase Price: {medicine.purchasePrice ? formatCurrency(medicine.purchasePrice) : 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add to Purchase Form */}
            {selectedMedicine && (
              <div className="add-to-purchase-form">
                <h4>Add to Purchase</h4>
                <div className="selected-medicine">
                  <span><strong>{selectedMedicine.name}</strong></span>
                  <span>{selectedMedicine.genericName} - {selectedMedicine.strength} {selectedMedicine.unit}</span>
                  <span>Manufacturer: {selectedMedicine.manufacturer}</span>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={itemForm.quantity}
                      onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    />
                    <span className="unit">{selectedMedicine.unit}</span>
                  </div>
                  
                  <div className="form-group">
                    <label>Unit Price ({CURRENCY_SYMBOL}):</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemForm.unitPrice}
                      onChange={(e) => setItemForm(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Batch Number:</label>
                    <input
                      type="text"
                      placeholder="Enter batch number"
                      value={itemForm.batchNumber}
                      onChange={(e) => setItemForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Expiry Date:</label>
                    <input
                      type="date"
                      value={itemForm.expiryDate}
                      onChange={(e) => setItemForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <button 
                  className="add-to-purchase-btn"
                  onClick={addToPurchase}
                >
                  <FaPlus /> Add to Purchase
                </button>
              </div>
            )}
          </div>

          {/* Purchase Items */}
          <div className="purchase-items-section">
            <h3>📦 Purchase Items ({purchaseItems.length} items)</h3>
            
            {purchaseItems.length === 0 ? (
              <div className="empty-purchase">
                <p>No items in purchase. Search and add medicines to get started.</p>
              </div>
            ) : (
              <div className="purchase-items">
                {purchaseItems.map((item, index) => (
                  <div key={index} className="purchase-item">
                    <div className="item-details">
                      <h4>{item.medicine.name}</h4>
                      <p>{item.medicine.genericName} - {item.medicine.strength} {item.medicine.unit}</p>
                      <p className="batch-info">
                        <strong>Batch:</strong> {item.batchNumber} | 
                        <strong> Expiry:</strong> {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                      <p className="item-price">{formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.totalPrice)}</p>
                    </div>
                    
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updatePurchaseQuantity(index, item.quantity - 1)}
                          className="qty-btn"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updatePurchaseQuantity(index, parseInt(e.target.value) || 1)}
                          className="qty-input"
                        />
                        <button 
                          onClick={() => updatePurchaseQuantity(index, item.quantity + 1)}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="price-controls">
                        <label>Price:</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updatePurchasePrice(index, parseFloat(e.target.value) || 0)}
                          className="price-input"
                        />
                      </div>
                      
                      <button 
                        onClick={() => removeFromPurchase(index)}
                        className="remove-btn"
                        title="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Supplier Details and Billing */}
        <div className="purchase-right">
          {/* Supplier Details */}
          <div className="supplier-section">
            <h3><FaBuilding /> Supplier Information</h3>
            <div className="form-group">
              <label>Supplier Name *</label>
              <input
                type="text"
                placeholder="Enter supplier name"
                value={supplierDetails.name}
                onChange={(e) => setSupplierDetails(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={supplierDetails.phone}
                onChange={(e) => setSupplierDetails(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                placeholder="Enter supplier address"
                value={supplierDetails.address}
                onChange={(e) => setSupplierDetails(prev => ({ ...prev, address: e.target.value }))}
                rows="3"
              />
            </div>
          </div>

          {/* Payment Details */}
          <div className="payment-section">
            <h3><FaCreditCard /> Payment Details</h3>
            
            <div className="payment-methods">
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentDetails.method === 'cash'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
                <FaMoneyBillWave /> Cash
              </label>
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cheque"
                  checked={paymentDetails.method === 'cheque'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
                <FaCreditCard /> Cheque
              </label>
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={paymentDetails.method === 'bank_transfer'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
                🏦 Bank Transfer
              </label>
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit"
                  checked={paymentDetails.method === 'credit'}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
                📋 Credit
              </label>
            </div>

            <div className="form-group">
              <label>Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={paymentDetails.discount}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="form-group">
              <label>Tax (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={paymentDetails.tax}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, tax: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="form-group">
              <label>Paid Amount ({CURRENCY_SYMBOL})</label>
              <input
                type="number"
                min="0"
                value={paymentDetails.paidAmount}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, paidAmount: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Billing Summary */}
          <div className="billing-section">
            <h3><FaCalculator /> Billing Summary</h3>
            
            <div className="bill-details">
              <div className="bill-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0))}</span>
              </div>
              
              {paymentDetails.discount > 0 && (
                <div className="bill-row discount">
                  <span>Discount ({paymentDetails.discount}%):</span>
                  <span>-{formatCurrency((purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0) * paymentDetails.discount) / 100)}</span>
                </div>
              )}
              
              {paymentDetails.tax > 0 && (
                <div className="bill-row tax">
                  <span>Tax ({paymentDetails.tax}%):</span>
                  <span>{formatCurrency((purchaseItems.reduce((sum, item) => sum + item.totalPrice, 0) * paymentDetails.tax) / 100)}</span>
                </div>
              )}
              
              <div className="bill-row total">
                <span>Total Amount:</span>
                <span>{formatCurrency(purchaseTotal)}</span>
              </div>
              
              <div className="bill-row">
                <span>Paid Amount:</span>
                <span>{formatCurrency(paymentDetails.paidAmount)}</span>
              </div>
              
              {getDueAmount() > 0 && (
                <div className="bill-row due">
                  <span>Due Amount:</span>
                  <span>{formatCurrency(getDueAmount())}</span>
                </div>
              )}
              
              {paymentDetails.paidAmount > purchaseTotal && (
                <div className="bill-row change">
                  <span>Change:</span>
                  <span>{formatCurrency(paymentDetails.paidAmount - purchaseTotal)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="notes-section">
            <h3>Notes</h3>
            <textarea
              placeholder="Add any special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
            />
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="print-btn"
              onClick={printPurchaseOrder}
              disabled={purchaseItems.length === 0}
            >
              <FaPrint /> Print Purchase Order
            </button>
            
            <button 
              className="complete-purchase-btn"
              onClick={handleSubmitPurchase}
              disabled={purchaseItems.length === 0 || submitting}
            >
              {submitting ? 'Processing...' : <><FaCheckCircle /> Complete Purchase</>}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default NewPurchase;