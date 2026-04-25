
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaPlus, 
  FaTrash, 
  FaCalculator,
  FaUser,
  FaCreditCard,
  FaMoneyBillWave,
  FaPrint,
  FaArrowLeft,
  FaCheckCircle,
  FaShoppingCart
} from 'react-icons/fa';
import Background3D from '../../components/UI/Background3D';
import './NewSale.css';
import { formatCurrency, CURRENCY_SYMBOL } from '../../utils/currency';

const NewSale = () => {
  const navigate = useNavigate();
  
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: ''
  });
  const [paymentDetails, setPaymentDetails] = useState({
    method: 'cash',
    paidAmount: 0,
    discount: 0,
    tax: 0
  });
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (subtotal * paymentDetails.discount) / 100;
    const taxAmount = (subtotal * paymentDetails.tax) / 100;
    const total = subtotal - discountAmount + taxAmount;
    setCartTotal(total);
  }, [cart, paymentDetails.discount, paymentDetails.tax]);

  const addToCart = () => {
    if (!selectedMedicine || quantity <= 0) {
      toast.error('Please select a medicine and enter valid quantity');
      return;
    }

    if (quantity > selectedMedicine.stockQuantity) {
      toast.error(`Insufficient stock. Available: ${selectedMedicine.stockQuantity}`);
      return;
    }

    const existingItem = cart.find(item => item.medicine._id === selectedMedicine._id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > selectedMedicine.stockQuantity) {
        toast.error(`Total quantity exceeds available stock. Available: ${selectedMedicine.stockQuantity}`);
        return;
      }
      
      setCart(prev => prev.map(item => 
        item.medicine._id === selectedMedicine._id 
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
          : item
      ));
    } else {
      const newItem = {
        medicine: selectedMedicine,
        quantity: quantity,
        unitPrice: selectedMedicine.sellingPrice,
        totalPrice: quantity * selectedMedicine.sellingPrice
      };
      setCart(prev => [...prev, newItem]);
    }

    setSelectedMedicine(null);
    setQuantity(1);
    setSearchTerm('');
    setMedicines([]);
    toast.success('Medicine added to cart');
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
    toast.success('Item removed from cart');
  };

  const updateCartQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const item = cart[index];
    if (newQuantity > item.medicine.stockQuantity) {
      toast.error(`Insufficient stock. Available: ${item.medicine.stockQuantity}`);
      return;
    }

    setCart(prev => prev.map((cartItem, i) => 
      i === index 
        ? { ...cartItem, quantity: newQuantity, totalPrice: newQuantity * cartItem.unitPrice }
        : cartItem
    ));
  };

  const handleSubmitSale = async () => {
    if (cart.length === 0) {
      toast.error('Please add at least one medicine to cart');
      return;
    }

    if (paymentDetails.paidAmount < 0) {
      toast.error('Paid amount cannot be negative');
      return;
    }

    try {
      setSubmitting(true);
      
      const saleData = {
        customerName: customerDetails.name || 'Walk-in Customer',
        customerPhone: customerDetails.phone || '',
        items: cart.map(item => ({
          medicine: item.medicine._id,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        subtotal: cart.reduce((sum, item) => sum + item.totalPrice, 0),
        discount: paymentDetails.discount,
        tax: paymentDetails.tax,
        totalAmount: cartTotal,
        paidAmount: paymentDetails.paidAmount,
        dueAmount: getDueAmount(),
        paymentMethod: paymentDetails.method,
        notes: notes,
        soldBy: 'Admin'
      };

      await axios.post('/api/sales', saleData);
      
      toast.success('Sale completed successfully!');
      
      navigate('/sales');
      
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to complete sale');
      }
      console.error('Error creating sale:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getDueAmount = () => {
    return Math.max(0, cartTotal - paymentDetails.paidAmount);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <>
      <Background3D variant="medical" />
      <div className="new-sale-page">
        <div className="page-header">
          <button 
            className="back-button"
            onClick={() => navigate('/sales')}
          >
            <FaArrowLeft /> Back to Sales
          </button>
          <h1><FaShoppingCart /> New Sale / নতুন বিক্রি</h1>
        </div>

      <div className="sale-container">
        <div className="sale-left">
          <div className="medicine-search-section">
            <h3>Search Medicines</h3>
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
                        <p>Stock: {medicine.stockQuantity} | Price: {formatCurrency(medicine.sellingPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedMedicine && (
              <div className="add-to-cart-form">
                <h4>Add to Cart</h4>
                <div className="selected-medicine">
                  <span><strong>{selectedMedicine.name}</strong></span>
                  <span>{formatCurrency(selectedMedicine.sellingPrice)} per {selectedMedicine.unit}</span>
                  <span>Available: {selectedMedicine.stockQuantity}</span>
                </div>
                
                <div className="quantity-input">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedMedicine.stockQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                  <span className="unit">{selectedMedicine.unit}</span>
                </div>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={addToCart}
                >
                  <FaPlus /> Add to Cart
                </button>
              </div>
            )}
          </div>

          <div className="cart-section">
            <h3>Shopping Cart ({cart.length} items)</h3>
            
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>No items in cart. Search and add medicines to get started.</p>
              </div>
            ) : (
              <div className="cart-items">
                {cart.map((item, index) => (
                  <div key={index} className="cart-item">
                    <div className="item-details">
                      <h4>{item.medicine.name}</h4>
                      <p>{item.medicine.genericName} - {item.medicine.strength} {item.medicine.unit}</p>
                      <p className="item-price">{formatCurrency(item.unitPrice)} × {item.quantity} = {formatCurrency(item.totalPrice)}</p>
                    </div>
                    
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateCartQuantity(index, item.quantity - 1)}
                          className="qty-btn"
                        >
                          -
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(index, item.quantity + 1)}
                          className="qty-btn"
                          disabled={item.quantity >= item.medicine.stockQuantity}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(index)}
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

        <div className="sale-right">
          <div className="customer-section">
            <h3><FaUser /> Customer Information</h3>
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Enter customer name (optional)"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number (optional)"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="payment-section">
            <h3><FaCreditCard /> Payment Details</h3>
            
            <div className="payment-methods">
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentDetails.method === 'cash'}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, method: e.target.value }))}
                />
                <FaMoneyBillWave /> Cash
              </label>
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentDetails.method === 'card'}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, method: e.target.value }))}
                />
                <FaCreditCard /> Card
              </label>
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mobile_banking"
                  checked={paymentDetails.method === 'mobile_banking'}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, method: e.target.value }))}
                />
                📱 Mobile Banking
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

          <div className="billing-section">
            <h3><FaCalculator /> Billing Summary</h3>
            
            <div className="bill-details">
              <div className="bill-row">
                <span>Subtotal:</span>
                  <span>{formatCurrency(cart.reduce((sum, item) => sum + item.totalPrice, 0))}</span>
              </div>
              
              {paymentDetails.discount > 0 && (
                <div className="bill-row discount">
                  <span>Discount ({paymentDetails.discount}%):</span>
                  <span>-{formatCurrency((cart.reduce((sum, item) => sum + item.totalPrice, 0) * paymentDetails.discount) / 100)}</span>
                </div>
              )}
              
              {paymentDetails.tax > 0 && (
                <div className="bill-row tax">
                  <span>Tax ({paymentDetails.tax}%):</span>
                  <span>{formatCurrency((cart.reduce((sum, item) => sum + item.totalPrice, 0) * paymentDetails.tax) / 100)}</span>
                </div>
              )}
              
              <div className="bill-row total">
                <span>Total Amount:</span>
                <span>{formatCurrency(cartTotal)}</span>
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
              
              {paymentDetails.paidAmount > cartTotal && (
                <div className="bill-row change">
                  <span>Change:</span>
                    <span>{formatCurrency(paymentDetails.paidAmount - cartTotal)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="notes-section">
            <h3>Notes</h3>
            <textarea
              placeholder="Add any special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
            />
          </div>

          <div className="action-buttons">
            <button 
              className="print-btn"
              onClick={printReceipt}
              disabled={cart.length === 0}
            >
              <FaPrint /> Print Receipt
            </button>
            
            <button 
              className="complete-sale-btn"
              onClick={handleSubmitSale}
              disabled={cart.length === 0 || submitting}
            >
              {submitting ? 'Processing...' : <><FaCheckCircle /> Complete Sale</>}
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default NewSale;
