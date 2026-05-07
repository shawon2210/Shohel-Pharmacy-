import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  FaWhatsapp,
  FaTimes,
  FaChartPie,
  FaPhone
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

  // Calculate aging for a due
  const getAgingCategory = (dueDate) => {
    const days = moment().diff(moment(dueDate), 'days');
    if (days <= 7) return 'green';
    if (days <= 30) return 'amber';
    return 'red';
  };

  const getDaysOverdue = (dueDate) => {
    return moment().diff(moment(dueDate), 'days');
  };

  const isOverdue = (dueDate) => {
    return moment(dueDate).isBefore(moment(), 'day');
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
    const message = `প্রিয় ${due.customerName},\n\nআপনার ${formatCurrency(due.remainingAmount)} টাকা বকেয়া রয়েছে (${days} দিন আগে)।\nদয়া করে দ্রুত পরিশোধ করুন।\n\nধন্যবাদ,\nShohel Pharmacy`;
    
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

  // Donut chart calculation
  const donutData = useMemo(() => {
    const total = summary.pending.amount + summary.overdue.amount + summary.paid.amount;
    if (total === 0) return { segments: [], total: 0 };
    
    const segments = [
      { label: 'সংগ্রহিত', value: summary.paid.amount, color: '#10b981' },
      { label: 'বকেয়া', value: summary.pending.amount + summary.partial.amount, color: '#f59e0b' },
      { label: 'অতিরিক্ত', value: summary.overdue.amount, color: '#ef4444' }
    ].filter(s => s.value > 0);
    
    return { segments, total };
  }, [summary]);

  // Skeleton loader
  if (loading) {
    return (
      <>
        <Background3D variant="medical" />
        <div className="dues-page">
          <div className="page-header">
            <div className="skeleton-title" />
            <div className="skeleton-button" />
          </div>
          
          {/* Donut Skeleton */}
          <div className="donut-skeleton">
            <div className="skeleton-circle" />
            <div className="skeleton-lines">
              {[1,2,3].map(i => <div key={i} className="skeleton-line" />)}
            </div>
          </div>
          
          {/* Summary Skeleton */}
          <div className="summary-cards">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-icon" />
                <div className="skeleton-text" />
              </div>
            ))}
          </div>
          
          {/* List Skeleton */}
          <div className="dues-grid">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-due-card">
                <div className="skeleton-header" />
                <div className="skeleton-body" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Background3D variant="medical" />
      <div className="dues-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>বকেয়া লিস্ট</h1>
            <span className="record-count">{totalDues} টি রেকর্ড</span>
          </div>
          <button 
            className="primary-button"
            onClick={() => openPaymentModal({ remainingAmount: 0 })}
          >
            <FaPlus /> নতুন পরিশোধ
          </button>
        </div>

        {/* Donut Chart & Summary */}
        <div className="dashboard-top">
          {/* Donut Chart */}
          <div className="donut-section">
            <h3 className="section-title">
              <FaChartPie /> ওভারভিউ
            </h3>
            <DonutChart data={donutData} />
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card green">
              <div className="summary-icon green">
                <FaCheckCircle />
              </div>
              <div className="summary-content">
                <h3>সংগ্রহিত</h3>
                <p className="summary-number">{summary.paid.count}</p>
                <span className="summary-amount">{formatCurrency(summary.paid.amount)}</span>
              </div>
            </div>
            
            <div className="summary-card amber">
              <div className="summary-icon amber">
                <FaClock />
              </div>
              <div className="summary-content">
                <h3>বকেয়া</h3>
                <p className="summary-number">{summary.pending.count + summary.partial.count}</p>
                <span className="summary-amount">{formatCurrency(summary.pending.amount + summary.partial.amount)}</span>
              </div>
            </div>
            
            <div className="summary-card red">
              <div className="summary-icon red">
                <FaExclamationTriangle />
              </div>
              <div className="summary-content">
                <h3>অতিরিক্ত</h3>
                <p className="summary-number">{summary.overdue.count}</p>
                <span className="summary-amount">{formatCurrency(summary.overdue.amount)}</span>
              </div>
            </div>
            
            <div className="summary-card total">
              <div className="summary-icon total">
                <FaMoneyBillWave />
              </div>
              <div className="summary-content">
                <h3>মোট বকেয়া</h3>
                <p className="summary-number">{summary.total.count}</p>
                <span className="summary-amount">{formatCurrency(summary.total.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="ক্রেতার নাম খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <FaTimes />
              </button>
            )}
          </div>
          
          <div className="filter-pills">
            <button 
              className={`pill ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >
              সব
            </button>
            <button 
              className={`pill green ${timeFilter === '0-7' ? 'active' : ''}`}
              onClick={() => setTimeFilter('0-7')}
            >
              ০-৭ দিন
            </button>
            <button 
              className={`pill amber ${timeFilter === '8-30' ? 'active' : ''}`}
              onClick={() => setTimeFilter('8-30')}
            >
              ৮-৩০ দিন
            </button>
            <button 
              className={`pill red ${timeFilter === '30+' ? 'active' : ''}`}
              onClick={() => setTimeFilter('30+')}
            >
              ৩০+ দিন
            </button>
          </div>
          
          {(searchTerm || statusFilter || timeFilter !== 'all') && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FaTimes /> ফিল্টার মুছুন
            </button>
          )}
        </div>

        {/* Dues List */}
        <div className="dues-content">
          {dues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration">
                <FaMoneyBillWave />
              </div>
              <h3>কোনো বকেয়া নেই</h3>
              <p>ফিল্টার পরিবর্তন করুন অথবা নতুন পরিশোধ যোগ করুন</p>
            </div>
          ) : (
            <div className="dues-grid">
              {dues.map(due => {
                const agingCategory = getAgingCategory(due.dueDate);
                const daysOverdue = getDaysOverdue(due.dueDate);
                const overdue = isOverdue(due.dueDate);
                
                return (
                  <div key={due._id} className={`due-card ${agingCategory}`}>
                    <div className="due-header">
                      <div className="due-status">
                        <span className={`aging-badge ${agingCategory}`}>
                          {agingCategory === 'green' && '🟢'}
                          {agingCategory === 'amber' && '🟡'}
                          {agingCategory === 'red' && '🔴'}
                          {daysOverdue} দিন
                        </span>
                      </div>
                      
                      <div className="due-actions">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => viewDueDetails(due)}
                          title="বিস্তারিত"
                        >
                          <FaEye />
                        </button>
                        
                        {due.remainingAmount > 0 && (
                          <button 
                            className="action-btn payment-btn"
                            onClick={() => openPaymentModal(due)}
                            title="পরিশোধ"
                          >
                            <FaMoneyBillWave />
                          </button>
                        )}
                        
                        {due.customerPhone && (
                          <button 
                            className="action-btn whatsapp-btn"
                            onClick={() => sendWhatsAppReminder(due)}
                            title="WhatsApp"
                          >
                            <FaWhatsapp />
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
                      </div>

                      <div className="amount-info">
                        <div className="amount-row">
                          <span>মূল বকেয়া:</span>
                          <span className="due-amount">{formatCurrency(due.dueAmount)}</span>
                        </div>
                        <div className="amount-row">
                          <span>পরিশোধিত:</span>
                          <span className="paid-amount">{formatCurrency(due.paidAmount)}</span>
                        </div>
                        <div className="amount-row total">
                          <span>অবশিষ্ট:</span>
                          <span className="remaining-amount">{formatCurrency(due.remainingAmount)}</span>
                        </div>
                      </div>

                      {overdue && (
                        <div className="overdue-alert">
                          <FaExclamationTriangle /> 
                          {daysOverdue} দিন অতিবাহিত
                        </div>
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
                পূর্ববর্তী
              </button>
              
              <span className="page-info">
                পৃষ্ঠা {currentPage} এর {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                পরবর্তী
              </button>
            </div>
          )}
        </div>

        {/* View Modal */}
        {showViewModal && selectedDue && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>বিস্তারিত - {selectedDue.customerName}</h2>
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
                  <h3>ক্রেতার তথ্য</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>নাম:</label>
                      <span>{selectedDue.customerName}</span>
                    </div>
                    <div className="detail-item">
                      <label>ফোন:</label>
                      <span>{selectedDue.customerPhone || 'প্রদান করা হয়নি'}</span>
                    </div>
                    <div className="detail-item">
                      <label>ঠিকানা:</label>
                      <span>{selectedDue.customerAddress || 'প্রদান করা হয়নি'}</span>
                    </div>
                  </div>
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
                <h2>পরিশোধ রেকর্ড - {selectedDue.customerName}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedDue(null);
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="payment-form">
                <div className="form-group">
                  <label>পরিমাণ (৳)</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                <button type="submit" className="submit-btn">
                  পরিশোধ সঠিক করুন
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Donut Chart Component
const DonutChart = ({ data }) => {
  const { segments, total } = data;
  
  if (total === 0) {
    return <div className="donut-empty">কোনো ডাটা নেই</div>;
  }

  let cumulativePercent = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  return (
    <div className="donut-chart">
      <svg width="150" height="150" viewBox="0 0 150 150">
        {segments.map((segment, index) => {
          const percent = segment.value / total;
          const dashArray = `${percent * circumference} ${circumference - (percent * circumference)}`;
          const offset = cumulativePercent * circumference;
          cumulativePercent += percent;
          
          return (
            <circle
              key={index}
              cx="75"
              cy="75"
              r={radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth="25"
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              className="donut-segment"
            />
          );
        })}
        <text x="75" y="75" textAnchor="middle" dominantBaseline="middle" className="donut-center-text">
          {formatCurrency(total)}
        </text>
      </svg>
      
      <div className="donut-legend">
        {segments.map((segment, index) => (
          <div key={index} className="legend-item">
            <span className="legend-color" style={{ background: segment.color }} />
            <span className="legend-label">{segment.label}</span>
            <span className="legend-value">{formatCurrency(segment.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dues;
