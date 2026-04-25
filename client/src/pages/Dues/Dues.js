import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaPlus, 
  FaEye, 
  FaUser,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
  FaHistory,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import moment from 'moment';
import Background3D from '../../components/UI/Background3D';
import './Dues.css';
import { formatCurrency } from '../../utils/currency';

const Dues = () => {
  // State for dues data
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDue, setSelectedDue] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerName, setCustomerName] = useState('');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDues, setTotalDues] = useState(0);
  
  // State for summary
  const [summary, setSummary] = useState({
    pending: { count: 0, amount: 0 },
    partial: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    total: { count: 0, amount: 0 }
  });

  // State for payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  

  const fetchDues = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        status: statusFilter,
        customerName: customerName || searchTerm
      };
      
      const response = await axios.get('/api/dues', { params });
      setDues(response.data.dues);
      setTotalPages(response.data.totalPages);
      setTotalDues(response.data.total);
    } catch (error) {
      console.error('Error fetching dues:', error);
      toast.error('Failed to fetch dues');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, customerName]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get('/api/dues/summary/total');
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, []);

  useEffect(() => {
    fetchDues();
    fetchSummary();
  }, [currentPage, searchTerm, statusFilter, customerName, fetchDues, fetchSummary]);

  const viewDueDetails = (due) => {
    setSelectedDue(due);
    setShowViewModal(true);
  };

  const openPaymentModal = (due) => {
    setSelectedDue(due);
    setPaymentForm({
      amount: due.remainingAmount.toString(),
      paymentMethod: 'cash',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      await axios.post(`/api/dues/${selectedDue._id}/payment`, {
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes
      });

      toast.success('Payment recorded successfully!');
      setShowPaymentModal(false);
      setSelectedDue(null);
      setPaymentForm({ amount: '', paymentMethod: 'cash', notes: '' });
      
      // Refresh data
      fetchDues();
      fetchSummary();
      
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to record payment');
      }
      console.error('Error recording payment:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCustomerName('');
    setCurrentPage(1);
  };

  // use shared formatCurrency

  const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="status-icon pending" />;
      case 'partial':
        return <FaMoneyBillWave className="status-icon partial" />;
      case 'paid':
        return <FaCheckCircle className="status-icon paid" />;
      case 'overdue':
        return <FaExclamationTriangle className="status-icon overdue" />;
      default:
        return <FaClock className="status-icon" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'partial':
        return 'Partial';
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  const isOverdue = (dueDate) => {
    return moment(dueDate).isBefore(moment(), 'day');
  };

  const getDaysOverdue = (dueDate) => {
    return moment().diff(moment(dueDate), 'days');
  };

  return (
    <>
      <Background3D variant="medical" />
      <div className="dues-page">
        <div className="page-header">
          <h1>Due Management</h1>
          <button 
            className="primary-button"
            onClick={() => openPaymentModal({ remainingAmount: 0 })}
          >
            <FaPlus /> Add Payment
          </button>
        </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon pending">
            <FaClock />
          </div>
          <div className="summary-content">
            <h3>Pending</h3>
            <p className="summary-number">{summary.pending.count}</p>
            <span className="summary-amount">{formatCurrency(summary.pending.amount)}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon partial">
            <FaMoneyBillWave />
          </div>
          <div className="summary-content">
            <h3>Partial</h3>
            <p className="summary-number">{summary.partial.count}</p>
            <span className="summary-amount">{formatCurrency(summary.partial.amount)}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon overdue">
            <FaExclamationTriangle />
          </div>
          <div className="summary-content">
            <h3>Overdue</h3>
            <p className="summary-number">{summary.overdue.count}</p>
            <span className="summary-amount">{formatCurrency(summary.overdue.amount)}</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon total">
            <FaMoneyBillWave />
          </div>
          <div className="summary-content">
            <h3>Total Due</h3>
            <p className="summary-number">{summary.total.count}</p>
            <span className="summary-amount">{formatCurrency(summary.total.amount)}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>

          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Dues List */}
      <div className="dues-content">
        {loading ? (
          <div className="loading">Loading dues...</div>
        ) : (
          <>
            <div className="dues-header">
              <h2>Due List ({totalDues} records)</h2>
            </div>

            {dues.length === 0 ? (
              <div className="no-dues">
                <p>No dues found. Try adjusting your filters or create a new due entry.</p>
              </div>
            ) : (
              <div className="dues-grid">
                {dues.map(due => (
                  <div key={due._id} className="due-card">
                    <div className="due-header">
                      <div className="due-status">
                        {getStatusIcon(due.status)}
                        <span className={`status-label ${due.status}`}>
                          {getStatusLabel(due.status)}
                        </span>
                      </div>
                      
                      <div className="due-actions">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => viewDueDetails(due)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        
                        {due.remainingAmount > 0 && (
                          <button 
                            className="action-btn payment-btn"
                            onClick={() => openPaymentModal(due)}
                            title="Record Payment"
                          >
                            <FaMoneyBillWave />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="due-info">
                      <div className="customer-details">
                        <h4>
                          <FaUser className="customer-icon" />
                          {due.customerName}
                        </h4>
                        {due.customerPhone && (
                          <p className="customer-phone">
                            <FaPhone /> {due.customerPhone}
                          </p>
                        )}
                        {due.customerAddress && (
                          <p className="customer-address">
                            <FaMapMarkerAlt /> {due.customerAddress}
                          </p>
                        )}
                      </div>

                      <div className="sale-info">
                        <p><strong>Sale #:</strong> {due.sale?.saleNumber || 'N/A'}</p>
                        <p><strong>Sale Date:</strong> {due.sale?.saleDate ? formatDate(due.sale.saleDate) : 'N/A'}</p>
                      </div>

                      <div className="amount-info">
                        <div className="amount-row">
                          <span>Original Due:</span>
                          <span className="due-amount">{formatCurrency(due.dueAmount)}</span>
                        </div>
                        <div className="amount-row">
                          <span>Paid:</span>
                          <span className="paid-amount">{formatCurrency(due.paidAmount)}</span>
                        </div>
                        <div className="amount-row total">
                          <span>Remaining:</span>
                          <span className="remaining-amount">{formatCurrency(due.remainingAmount)}</span>
                        </div>
                      </div>

                      <div className="due-date-info">
                        <p><strong>Due Date:</strong> {formatDate(due.dueDate)}</p>
                        {isOverdue(due.dueDate) && (
                          <p className="overdue-alert">
                            <FaExclamationTriangle /> 
                            {getDaysOverdue(due.dueDate)} days overdue
                          </p>
                        )}
                      </div>
                    </div>

                    {due.paymentHistory && due.paymentHistory.length > 0 && (
                      <div className="payment-history">
                        <h5><FaHistory /> Recent Payments</h5>
                        <div className="history-items">
                          {due.paymentHistory.slice(-2).map((payment, index) => (
                            <div key={index} className="history-item">
                              <span>{formatCurrency(payment.amount)}</span>
                              <span className="payment-date">{formatDate(payment.paymentDate)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  Previous
                </button>
                
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Due Details Modal */}
      {showViewModal && selectedDue && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Due Details - {selectedDue.customerName}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedDue(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="due-details">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedDue.customerName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{selectedDue.customerPhone || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Address:</label>
                    <span>{selectedDue.customerAddress || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedDue.status}`}>
                      {getStatusLabel(selectedDue.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Sale Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Sale Number:</label>
                    <span>{selectedDue.sale?.saleNumber || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Sale Date:</label>
                    <span>{selectedDue.sale?.saleDate ? formatDate(selectedDue.sale.saleDate) : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Sale Amount:</label>
                    <span>{selectedDue.sale?.totalAmount ? formatCurrency(selectedDue.sale.totalAmount) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Due Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Original Due:</label>
                    <span>{formatCurrency(selectedDue.dueAmount)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Paid Amount:</label>
                    <span>{formatCurrency(selectedDue.paidAmount)}</span>
                  </div>
                  <div className="detail-item total">
                    <label>Remaining Amount:</label>
                    <span>{formatCurrency(selectedDue.remainingAmount)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Due Date:</label>
                    <span className={isOverdue(selectedDue.dueDate) ? 'overdue' : ''}>
                      {formatDate(selectedDue.dueDate)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedDue.paymentHistory && selectedDue.paymentHistory.length > 0 && (
                <div className="detail-section">
                  <h3>Payment History</h3>
                  <div className="payment-history-list">
                    {selectedDue.paymentHistory.map((payment, index) => (
                      <div key={index} className="payment-history-item">
                        <div className="payment-info">
                          <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                          <span className="payment-method">{payment.paymentMethod}</span>
                          <span className="payment-date">{formatDate(payment.paymentDate)}</span>
                        </div>
                        {payment.notes && (
                          <p className="payment-notes">{payment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDue.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <p className="due-notes">{selectedDue.notes}</p>
                </div>
              )}

              <div className="detail-actions">
                {selectedDue.remainingAmount > 0 && (
                  <button 
                    className="primary-button"
                    onClick={() => {
                      setShowViewModal(false);
                      openPaymentModal(selectedDue);
                    }}
                  >
                    <FaMoneyBillWave /> Record Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedDue && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Record Payment</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedDue(null);
                  setPaymentForm({ amount: '', paymentMethod: 'cash', notes: '' });
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="payment-form">
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={selectedDue.customerName || ''}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Remaining Amount</label>
                <input
                  type="text"
                  value={formatCurrency(selectedDue.remainingAmount || 0)}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label>Payment Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedDue.remainingAmount || 0}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  placeholder="Enter payment amount"
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile_banking">Mobile Banking</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this payment..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedDue(null);
                    setPaymentForm({ amount: '', paymentMethod: 'cash', notes: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default Dues;