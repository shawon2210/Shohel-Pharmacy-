import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaPrint, FaDownload, FaEdit, FaTrash,
  FaBuilding, FaCalendarAlt, FaCreditCard, FaMoneyBillWave,
  FaBoxes, FaUser, FaPhone, FaMapMarkerAlt, FaFileInvoice
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/currency';
import './PurchaseDetails.css';

const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseDetails();
  }, [id]);

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/purchases/${id}`);
      setPurchase(response.data);
    } catch (error) {
      toast.error('Failed to fetch purchase details');
      console.error('Error fetching purchase:', error);
      navigate('/purchases');
    } finally {
      setLoading(false);
    }
  };

  const printPurchase = () => {
    window.print();
  };

  const downloadPurchase = () => {
    // Implementation for PDF download
    toast.info('PDF download feature coming soon');
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      cash: { icon: FaMoneyBillWave, label: 'Cash Payment', color: '#10b981' },
      cheque: { icon: FaCreditCard, label: 'Cheque Payment', color: '#3b82f6' },
      bank_transfer: { icon: FaBuilding, label: 'Bank Transfer', color: '#8b5cf6' },
      credit: { icon: FaCreditCard, label: 'Credit Purchase', color: '#f59e0b' }
    };
    return methods[method] || { icon: FaMoneyBillWave, label: method, color: '#6b7280' };
  };

  if (loading) {
    return (
      <div className="purchase-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading purchase details...</p>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="purchase-details-page">
        <div className="error-container">
          <h2>Purchase Not Found</h2>
          <p>The requested purchase could not be found.</p>
          <button className="primary-button" onClick={() => navigate('/purchases')}>
            <FaArrowLeft /> Back to Purchases
          </button>
        </div>
      </div>
    );
  }

  const paymentMethod = getPaymentMethodDisplay(purchase.paymentMethod);
  const PaymentIcon = paymentMethod.icon;

  return (
    <div className="purchase-details-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/purchases')}
          >
            <FaArrowLeft /> Back to Purchases
          </button>
          <div className="header-info">
            <h1>Purchase Details</h1>
            <div className="purchase-meta">
              <span className="purchase-number">{purchase.purchaseNumber}</span>
              <span className="purchase-date">
                {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="action-button print-btn" onClick={printPurchase}>
            <FaPrint /> Print
          </button>
          <button className="action-button download-btn" onClick={downloadPurchase}>
            <FaDownload /> Download
          </button>
        </div>
      </div>

      <div className="purchase-content">
        {/* Purchase Summary Cards */}
        <div className="summary-section">
          <div className="summary-card total-card">
            <div className="card-icon">
              <FaFileInvoice />
            </div>
            <div className="card-content">
              <h3>Total Amount</h3>
              <div className="card-value">{formatCurrency(purchase.totalAmount)}</div>
            </div>
          </div>
          
          <div className="summary-card paid-card">
            <div className="card-icon">
              <FaCreditCard />
            </div>
            <div className="card-content">
              <h3>Paid Amount</h3>
              <div className="card-value">{formatCurrency(purchase.paidAmount)}</div>
            </div>
          </div>
          
          <div className="summary-card due-card">
            <div className="card-icon">
              <FaCalendarAlt />
            </div>
            <div className="card-content">
              <h3>Due Amount</h3>
              <div className={`card-value ${purchase.dueAmount > 0 ? 'has-due' : 'no-due'}`}>
                {formatCurrency(purchase.dueAmount)}
              </div>
            </div>
          </div>
          
          <div className="summary-card items-card">
            <div className="card-icon">
              <FaBoxes />
            </div>
            <div className="card-content">
              <h3>Total Items</h3>
              <div className="card-value">{purchase.items.length}</div>
            </div>
          </div>
        </div>

        <div className="details-grid">
          {/* Supplier Information */}
          <div className="details-section supplier-section">
            <div className="section-header">
              <h2><FaBuilding /> Supplier Information</h2>
            </div>
            <div className="section-content">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">
                    <FaUser /> Supplier Name
                  </div>
                  <div className="info-value">{purchase.supplierName}</div>
                </div>
                
                {purchase.supplierPhone && (
                  <div className="info-item">
                    <div className="info-label">
                      <FaPhone /> Phone Number
                    </div>
                    <div className="info-value">{purchase.supplierPhone}</div>
                  </div>
                )}
                
                {purchase.supplierAddress && (
                  <div className="info-item">
                    <div className="info-label">
                      <FaMapMarkerAlt /> Address
                    </div>
                    <div className="info-value">{purchase.supplierAddress}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="details-section payment-section">
            <div className="section-header">
              <h2><PaymentIcon /> Payment Information</h2>
            </div>
            <div className="section-content">
              <div className="payment-method-display" style={{ color: paymentMethod.color }}>
                <PaymentIcon />
                <span>{paymentMethod.label}</span>
              </div>
              
              <div className="payment-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(purchase.subtotal)}</span>
                </div>
                
                {purchase.discount > 0 && (
                  <div className="breakdown-row discount">
                    <span>Discount ({purchase.discount}%):</span>
                    <span>-{formatCurrency((purchase.subtotal * purchase.discount) / 100)}</span>
                  </div>
                )}
                
                {purchase.tax > 0 && (
                  <div className="breakdown-row tax">
                    <span>Tax ({purchase.tax}%):</span>
                    <span>{formatCurrency((purchase.subtotal * purchase.tax) / 100)}</span>
                  </div>
                )}
                
                <div className="breakdown-row total">
                  <span>Total Amount:</span>
                  <span>{formatCurrency(purchase.totalAmount)}</span>
                </div>
                
                <div className="breakdown-row">
                  <span>Paid Amount:</span>
                  <span className="paid-amount">{formatCurrency(purchase.paidAmount)}</span>
                </div>
                
                {purchase.dueAmount > 0 && (
                  <div className="breakdown-row">
                    <span>Due Amount:</span>
                    <span className="due-amount">{formatCurrency(purchase.dueAmount)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Items */}
        <div className="details-section items-section">
          <div className="section-header">
            <h2><FaBoxes /> Purchase Items ({purchase.items.length} items)</h2>
          </div>
          <div className="section-content">
            <div className="items-table">
              <div className="table-header">
                <div className="th">Medicine</div>
                <div className="th">Batch & Expiry</div>
                <div className="th">Quantity</div>
                <div className="th">Unit Price</div>
                <div className="th">Total Price</div>
              </div>
              
              <div className="table-body">
                {purchase.items.map((item, index) => (
                  <div key={index} className="table-row">
                    <div className="td medicine-info">
                      <div className="medicine-name">{item.medicine.name}</div>
                      <div className="medicine-details">
                        {item.medicine.genericName} - {item.medicine.strength} {item.medicine.unit}
                      </div>
                    </div>
                    <div className="td batch-info">
                      <div className="batch-number">Batch: {item.batchNumber}</div>
                      <div className="expiry-date">
                        Exp: {new Date(item.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="td quantity">
                      {item.quantity} {item.medicine.unit}
                    </div>
                    <div className="td unit-price">
                      {formatCurrency(item.unitPrice)}
                    </div>
                    <div className="td total-price">
                      {formatCurrency(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="details-section additional-section">
          <div className="section-header">
            <h2>Additional Information</h2>
          </div>
          <div className="section-content">
            <div className="additional-grid">
              <div className="additional-item">
                <div className="additional-label">Received By</div>
                <div className="additional-value">{purchase.receivedBy}</div>
              </div>
              
              <div className="additional-item">
                <div className="additional-label">Purchase Date</div>
                <div className="additional-value">
                  {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              {purchase.notes && (
                <div className="additional-item notes-item">
                  <div className="additional-label">Notes</div>
                  <div className="additional-value">{purchase.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetails;