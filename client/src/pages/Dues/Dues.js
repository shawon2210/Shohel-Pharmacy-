import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FiSearch,
  FiPlus,
  FiEye,
  FiUser,
  FiDollarSign,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
  FiMessageSquare,
  FiX,
  FiPieChart,
  FiPhone
} from 'react-icons/fi';
import './Dues.css';
import { formatCurrency } from '../../utils/currency';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const Dues = () => {
  // State for dues data
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDue, setSelectedDue] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Touch state for swipe gestures
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  
  // Minimum swipe distance (px)
  const minSwipeDistance = 50;
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDues, setTotalDues] = useState(0);
  
  // State for summary with aging
  const [summary, setSummary] = useState({
    pending: { count: 0, amount: 0 },
    partial: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    total: { count: 0, amount: 0 },
    aging: {
      green: { count: 0, amount: 0 }, // 0-7 days
      amber: { count: 0, amount: 0 }, // 8-30 days
      red: { count: 0, amount: 0 }   // 30+ days
    }
  });
  
  // State for payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  // Calculate aging for a due (using native Date)
  const getAgingCategory = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (days <= 7) return 'green';
    if (days <= 30) return 'amber';
    return 'red';
  };

  const getDaysOverdue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return due < now;
  };

  // Fetch dues with filters
  const fetchDues = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        status: statusFilter,
        customerName: searchTerm,
        timeFilter: timeFilter
      };
      
      const response = await axios.get('/api/dues', { params });
      setDues(response.data.dues);
      setTotalPages(response.data.totalPages);
      setTotalDues(response.data.total);
    } catch (error) {
      console.error('Error fetching dues:', error);
      toast.error('দয়া পেতে ব্যর্থ হয়েছে');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, timeFilter]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get('/api/dues/summary/total');
      // Calculate aging breakdown
      const duesRes = await axios.get('/api/dues', { params: { limit: 1000 } });
      const allDues = duesRes.data.dues || [];
      
      const aging = {
        green: { count: 0, amount: 0 },
        amber: { count: 0, amount: 0 },
        red: { count: 0, amount: 0 }
      };
      
      allDues.forEach(due => {
        if (due.remainingAmount <= 0) return;
        const category = getAgingCategory(due.dueDate);
        aging[category].count++;
        aging[category].amount += due.remainingAmount;
      });
      
      setSummary({
        ...res.data,
        aging
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, []);

  useEffect(() => {
    fetchDues();
    fetchSummary();
  }, [currentPage, searchTerm, statusFilter, timeFilter, fetchDues, fetchSummary]);

  // WhatsApp reminder
  const sendWhatsAppReminder = (due) => {
    const days = getDaysOverdue(due.dueDate);
    const message = `প্রিয় ${due.customerName},\n\nআপনার ${formatCurrency(due.remainingAmount)} টাকা বাকি রয়েছে (${days} দিন আগে)।\nদয়া করে দ্রুত পরিশোধ করুন।\n\nধন্যবাদ,\nShohel Pharmacy`;
    
    const url = `https://wa.me/${due.customerPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    if (due.customerPhone) {
      window.open(url, '_blank');
      toast.success('WhatsApp খোলা হয়েছে');
    } else {
      toast.error('ক্রেতার ফোন নম্বর নেই');
    }
  };

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
      toast.error('অনুগ্রহ করে সঠিক পরিমাণ লিখুন');
      return;
    }

    try {
      await axios.post(`/api/dues/${selectedDue._id}/payment`, {
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        notes: paymentForm.notes
      });

      toast.success('পরিশোধ সফল হয়েছে!');
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
        toast.error('পরিশোধ রেকর্ড করতে ব্যর্থ');
      }
      console.error('Error recording payment:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTimeFilter('all');
    setCurrentPage(1);
  };

  // Swipe gesture handlers
  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (due) => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && due.remainingAmount > 0) {
      // Swipe left → Open payment modal
      openPaymentModal(due);
      toast.info('সোয়াইপ লেফট: পরিশোধ খোলা হয়েছে / Swipe left: Payment opened');
    } else if (isRightSwipe && due.customerPhone) {
      // Swipe right → Call customer
      window.location.href = `tel:${due.customerPhone}`;
      toast.info('সোয়াইপ রাইট: কল করা হচ্ছে / Swipe right: Calling customer');
    }
    
    // Reset touch state
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Donut chart calculation
  const donutData = useMemo(() => {
    const total = summary.pending.amount + summary.overdue.amount + summary.paid.amount;
    if (total === 0) return { segments: [], total: 0 };
    
    const segments = [
      { label: 'সংগ্রহিত', value: summary.paid.amount, color: '#10b981' },
      { label: 'বাকি', value: summary.pending.amount + summary.partial.amount, color: '#f59e0b' },
      { label: 'অতিরিক্ত', value: summary.overdue.amount, color: '#ef4444' }
    ].filter(s => s.value > 0);
    
    return { segments, total };
  }, [summary]);

  // Skeleton loader
  if (loading) {
    return (
      <div className="dues-page">
        <div className="dues-page-container">
          <div className="page-header">
            <div className="header-left">
              <FiPieChart size={24} />
              <div className="header-text">
                <h1>বাকি লিস্ট / <span className="bengali-text">Due List</span></h1>
                <p className="header-subtitle">Manage customer dues and payments / <span className="bengali-text">ক্রেতার বাকি ও পরিশোধ পরিচালনা করুন</span></p>
              </div>
            </div>
            <div className="header-actions">
              <button className="primary-button">
                <FiPlus /> নতুন পরিশোধ
              </button>
            </div>
          </div>

          {/* Donut Skeleton */}
          <div className="donut-skeleton">
            <div className="skeleton-circle"></div>
            <div className="skeleton-lines">
              {[1,2,3].map(i => <div key={i} className="skeleton-line"></div>)}
            </div>
          </div>

          {/* Summary Skeleton */}
          <div className="summary-cards">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-icon"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>

          {/* List Skeleton */}
          <div className="dues-grid">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-due-card">
                <div className="skeleton-header"></div>
                <div className="skeleton-body"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dues-page">
      <div className="dues-page-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-left">
            <FiPieChart size={24} />
            <div className="header-text">
              <h1>বাকি লিস্ট / <span className="bengali-text">Due List</span></h1>
              <p className="header-subtitle">
                {totalDues} টি রেকর্ড / <span className="bengali-text">{totalDues} টি রেকর্ড</span>
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="primary-button"
              onClick={() => openPaymentModal({ remainingAmount: 0 })}
            >
              <FiPlus /> নতুন পরিশোধ / <span className="bengali-text">New Payment</span>
            </button>
          </div>
        </div>

        {/* Donut Chart & Summary */}
        <div className="dashboard-top">
          {/* Donut Chart */}
          <div className="donut-section">
            <h3 className="section-title">
              <FiPieChart /> ডায়াগ্রাম / <span className="bengali-text">Donut Chart</span>
            </h3>
            <DonutChart data={donutData} />
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card green">
              <div className="card-icon green">
                <FiCheckCircle />
              </div>
              <div className="card-content">
                <h3>সংগ্রহিত / <span className="bengali-text">Collected</span></h3>
                <div className="card-value">{summary.paid.count}</div>
                <div className="card-subtitle">{formatCurrency(summary.paid.amount)}</div>
              </div>
            </div>

            <div className="summary-card amber">
              <div className="card-icon amber">
                <FiClock />
              </div>
              <div className="card-content">
                <h3>বাকি / <span className="bengali-text">Pending</span></h3>
                <div className="card-value">{summary.pending.count + summary.partial.count}</div>
                <div className="card-subtitle">{formatCurrency(summary.pending.amount + summary.partial.amount)}</div>
              </div>
            </div>

            <div className="summary-card red">
              <div className="card-icon red">
                <FiAlertTriangle />
              </div>
              <div className="card-content">
                <h3>অতিরিক্ত / <span className="bengali-text">Overdue</span></h3>
                <div className="card-value">{summary.overdue.count}</div>
                <div className="card-subtitle">{formatCurrency(summary.overdue.amount)}</div>
              </div>
            </div>

            <div className="summary-card total">
              <div className="card-icon total">
                <FiDollarSign />
              </div>
              <div className="card-content">
                <h3>মোট বাকি / <span className="bengali-text">Total Due</span></h3>
                <div className="card-value">{summary.total.count}</div>
                <div className="card-subtitle">{formatCurrency(summary.total.amount)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="খুজুন... / Search customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search customers"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FiX />
              </button>
            )}
          </div>

          <div className="filter-pills">
            <button 
              className={`pill ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >
              সব / All
            </button>
            <button 
              className={`pill green ${timeFilter === '0-7' ? 'active' : ''}`}
              onClick={() => setTimeFilter('0-7')}
            >
              ০-৭ দিন / 0-7 Days
            </button>
            <button 
              className={`pill amber ${timeFilter === '8-30' ? 'active' : ''}`}
              onClick={() => setTimeFilter('8-30')}
            >
              ৮-৩০ দিন / 8-30 Days
            </button>
            <button 
              className={`pill red ${timeFilter === '30+' ? 'active' : ''}`}
              onClick={() => setTimeFilter('30+')}
            >
              ৩০+ দিন / 30+ Days
            </button>
          </div>

          {(searchTerm || statusFilter || timeFilter !== 'all') && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FiX /> ফিল্টার মুছুন / <span className="bengali-text">Clear Filters</span>
            </button>
          )}
        </div>

        {/* Dues List */}
        <div className="dues-content">
          {dues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration">
                <FiDollarSign />
              </div>
              <h3>কোনো বাকি নেই / <span className="bengali-text">No Dues Found</span></h3>
              <p>ফিল্টার পরিবর্তন করুন অথবা নতুন পরিশোধ যোগ করুন / <span className="bengali-text">Change filters or add new payment</span></p>
            </div>
          ) : (
            <div className="dues-grid">
              {dues.map(due => {
                const agingCategory = getAgingCategory(due.dueDate);
                const daysOverdue = getDaysOverdue(due.dueDate);
                const overdue = isOverdue(due.dueDate);
                
                return (
                  <div 
                    key={due._id} 
                    className={`due-card ${agingCategory}`}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={() => handleTouchEnd(due)}
                  >
                    <div className="due-header">
                      <div className="due-status">
                        <span className={`age-badge ${agingCategory}`}>
                          {daysOverdue} দিন / days
                        </span>
                      </div>
                    </div>

                    <div className="due-info">
                      <div className="customer-details">
                        <h4>
                          <FiUser className="customer-icon" />
                          {due.customerName}
                        </h4>
                        {due.customerPhone && (
                          <p className="customer-phone">
                            <FiPhone /> {due.customerPhone}
                          </p>
                        )}
                      </div>

                      <div className="amount-info">
                        <div className="amount-row">
                          <span>মূল বাকি / Total:</span>
                          <span className="due-amount">{formatCurrency(due.dueAmount)}</span>
                        </div>
                        <div className="amount-row">
                          <span>পরিশোধিত / Paid:</span>
                          <span className="paid-amount">{formatCurrency(due.paidAmount)}</span>
                        </div>
                        <div className="amount-row total">
                          <span>অবশিষ্ট / Remaining:</span>
                          <span className="remaining-amount">{formatCurrency(due.remainingAmount)}</span>
                        </div>
                      </div>

                      {overdue && (
                        <div className="overdue-alert">
                          <FiAlertTriangle /> 
                          {daysOverdue} দিন অতিবাহিত / days overdue
                        </div>
                      )}
                    </div>

                    {/* Thumb-zone action buttons at bottom */}
                    <div className="thumb-zone-actions">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => viewDueDetails(due)}
                        title="বিস্তারিত / View"
                      >
                        <FiEye />
                      </button>
                      
                      {due.remainingAmount > 0 && (
                        <button 
                          className="action-btn payment-btn"
                          onClick={() => openPaymentModal(due)}
                          title="পরিশোধ / Pay"
                        >
                          <FiDollarSign />
                        </button>
                      )}
                      
                      {due.customerPhone && (
                        <button 
                          className="action-btn whatsapp-btn"
                          onClick={() => sendWhatsAppReminder(due)}
                          title="WhatsApp"
                        >
                          <FiMessageSquare />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
                পূর্ববর্তী / Previous
              </button>
              
              <span className="page-info">
                পৃষ্ঠা {currentPage} এর {totalPages} / Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                পরবর্তী / Next
              </button>
            </div>
          )}
        </div>

        {/* View Modal */}
        {showViewModal && selectedDue && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>বাকির বিস্তারিত / <span className="bengali-text">Due Details</span></h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowViewModal(false)}
                  aria-label="Close modal"
                >
                  <FiX />
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <strong>ক্রেতা / Customer:</strong>
                  <span>{selectedDue.customerName}</span>
                </div>
                {selectedDue.customerPhone && (
                  <div className="detail-row">
                    <strong>ফোন / Phone:</strong>
                    <span>{selectedDue.customerPhone}</span>
                  </div>
                )}
                <div className="detail-row">
                  <strong>মূল বাকি / Total Due:</strong>
                  <span className="amount">{formatCurrency(selectedDue.dueAmount)}</span>
                </div>
                <div className="detail-row">
                  <strong>পরিশোধিত / Paid:</strong>
                  <span>{formatCurrency(selectedDue.paidAmount)}</span>
                </div>
                <div className="detail-row">
                  <strong>অবশিষ্ট / Remaining:</strong>
                  <span className="amount">{formatCurrency(selectedDue.remainingAmount)}</span>
                </div>
                <div className="detail-row">
                  <strong>তারিখ / Date:</strong>
                  <span>{new Date(selectedDue.dueDate).toLocaleDateString('en-GB')}</span>
                </div>
                {selectedDue.notes && (
                  <div className="detail-row">
                    <strong>নোট / Notes:</strong>
                    <span>{selectedDue.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedDue && (
          <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>পরিশোধ / <span className="bengali-text">Record Payment</span></h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowPaymentModal(false)}
                  aria-label="Close modal"
                >
                  <FiX />
                </button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="payment-form">
                <div className="form-group">
                  <label>পরিমাণ / <span className="bengali-text">Amount ({formatCurrency(0).charAt(0)})</span></label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>পদ্ধতি / <span className="bengali-text">Payment Method</span></label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                  >
                    <option value="cash">নগদ / Cash</option>
                    <option value="cheque">চেক / Cheque</option>
                    <option value="bank_transfer">ব্যাংক ট্রান্সফার / Bank Transfer</option>
                    <option value="mobile_banking">মোবাইল ব্যাংকিং / Mobile Banking</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>নোট / <span className="bengali-text">Notes</span></label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="secondary-button"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    <FiX /> বাতিল / Cancel
                  </button>
                  <button 
                    type="submit"
                    className="primary-button"
                  >
                    <FiDollarSign /> পরিশোধ করুন / <span className="bengali-text">Pay Now</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// DonutChart component (simplified for this example)
const DonutChart = ({ data }) => {
  const { segments, total } = data;
  
  if (total === 0) {
    return <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>কোন ডাটা নেই / No data available</p>;
  }

  return (
    <div className="donut-chart-recharts">
      <PieChart width={250} height={250}>
        <Pie
          data={segments}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          nameKey="label"
        >
          {segments.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => formatCurrency(value)}
          contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
        />
        <Legend 
          wrapperStyle={{ fontSize: 'var(--text-sm)', paddingTop: '10px' }}
        />
      </PieChart>
      <div className="donut-center-text">
        {formatCurrency(total)}
      </div>
    </div>
  );
};

export default Dues;
