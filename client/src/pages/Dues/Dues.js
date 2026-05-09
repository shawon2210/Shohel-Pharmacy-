import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
<<<<<<< HEAD
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
=======
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
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3

const Dues = () => {
  // State for dues data
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDue, setSelectedDue] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
<<<<<<< HEAD
  // Touch state for swipe gestures
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  
  // Minimum swipe distance (px)
  const minSwipeDistance = 50;
  
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
  
=======

>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  // State for payment form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

<<<<<<< HEAD
  // Calculate aging for a due (using native Date)
  const getAgingCategory = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
=======
  // Calculate aging for a due
  const getAgingCategory = (dueDate) => {
    const days = moment().diff(moment(dueDate), 'days');
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
    if (days <= 7) return 'green';
    if (days <= 30) return 'amber';
    return 'red';
  };

  const getDaysOverdue = (dueDate) => {
<<<<<<< HEAD
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = now.getTime() - due.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return due < now;
=======
    return moment().diff(moment(dueDate), 'days');
  };

  const isOverdue = (dueDate) => {
    return moment(dueDate).isBefore(moment(), 'day');
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
    const message = `প্রিয় ${due.customerName},\n\nআপনার ${formatCurrency(due.remainingAmount)} টাকা বাকি রয়েছে (${days} দিন আগে)।\nদয়া করে দ্রুত পরিশোধ করুন।\n\nধন্যবাদ,\nShohel Pharmacy`;
=======
    const message = `প্রিয় ${due.customerName},\n\nআপনার ${formatCurrency(due.remainingAmount)} টাকা বকেয়া রয়েছে (${days} দিন আগে)।\nদয়া করে দ্রুত পরিশোধ করুন।\n\nধন্যবাদ,\nShohel Pharmacy`;
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
    
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

<<<<<<< HEAD
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

=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  // Donut chart calculation
  const donutData = useMemo(() => {
    const total = summary.pending.amount + summary.overdue.amount + summary.paid.amount;
    if (total === 0) return { segments: [], total: 0 };
    
    const segments = [
      { label: 'সংগ্রহিত', value: summary.paid.amount, color: '#10b981' },
<<<<<<< HEAD
      { label: 'বাকি', value: summary.pending.amount + summary.partial.amount, color: '#f59e0b' },
=======
      { label: 'বকেয়া', value: summary.pending.amount + summary.partial.amount, color: '#f59e0b' },
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
      { label: 'অতিরিক্ত', value: summary.overdue.amount, color: '#ef4444' }
    ].filter(s => s.value > 0);
    
    return { segments, total };
  }, [summary]);

  // Skeleton loader
  if (loading) {
    return (
<<<<<<< HEAD
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

=======
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
          
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
          {/* Summary Skeleton */}
          <div className="summary-cards">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton-card">
<<<<<<< HEAD
                <div className="skeleton-icon"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>

=======
                <div className="skeleton-icon" />
                <div className="skeleton-text" />
              </div>
            ))}
          </div>
          
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
          {/* List Skeleton */}
          <div className="dues-grid">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-due-card">
<<<<<<< HEAD
                <div className="skeleton-header"></div>
                <div className="skeleton-body"></div>
=======
                <div className="skeleton-header" />
                <div className="skeleton-body" />
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
              </div>
            ))}
          </div>
        </div>
<<<<<<< HEAD
      </div>
=======
      </>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
    );
  }

  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
        </div>

        {/* Donut Chart & Summary */}
        <div className="dashboard-top">
          {/* Donut Chart */}
          <div className="donut-section">
            <h3 className="section-title">
<<<<<<< HEAD
              <FiPieChart /> ডায়াগ্রাম / <span className="bengali-text">Donut Chart</span>
=======
              <FaChartPie /> ওভারভিউ
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
            </h3>
            <DonutChart data={donutData} />
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card green">
<<<<<<< HEAD
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
=======
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
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="search-box">
<<<<<<< HEAD
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

=======
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
          
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
          <div className="filter-pills">
            <button 
              className={`pill ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >
<<<<<<< HEAD
              সব / All
=======
              সব
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
            </button>
            <button 
              className={`pill green ${timeFilter === '0-7' ? 'active' : ''}`}
              onClick={() => setTimeFilter('0-7')}
            >
<<<<<<< HEAD
              ০-৭ দিন / 0-7 Days
=======
              ০-৭ দিন
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
            </button>
            <button 
              className={`pill amber ${timeFilter === '8-30' ? 'active' : ''}`}
              onClick={() => setTimeFilter('8-30')}
            >
<<<<<<< HEAD
              ৮-৩০ দিন / 8-30 Days
=======
              ৮-৩০ দিন
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
            </button>
            <button 
              className={`pill red ${timeFilter === '30+' ? 'active' : ''}`}
              onClick={() => setTimeFilter('30+')}
            >
<<<<<<< HEAD
              ৩০+ দিন / 30+ Days
            </button>
          </div>

          {(searchTerm || statusFilter || timeFilter !== 'all') && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FiX /> ফিল্টার মুছুন / <span className="bengali-text">Clear Filters</span>
=======
              ৩০+ দিন
            </button>
          </div>
          
          {(searchTerm || statusFilter || timeFilter !== 'all') && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FaTimes /> ফিল্টার মুছুন
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
            </button>
          )}
        </div>

        {/* Dues List */}
        <div className="dues-content">
          {dues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-illustration">
<<<<<<< HEAD
                <FiDollarSign />
              </div>
              <h3>কোনো বাকি নেই / <span className="bengali-text">No Dues Found</span></h3>
              <p>ফিল্টার পরিবর্তন করুন অথবা নতুন পরিশোধ যোগ করুন / <span className="bengali-text">Change filters or add new payment</span></p>
=======
                <FaMoneyBillWave />
              </div>
              <h3>কোনো বকেয়া নেই</h3>
              <p>ফিল্টার পরিবর্তন করুন অথবা নতুন পরিশোধ যোগ করুন</p>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
            </div>
          ) : (
            <div className="dues-grid">
              {dues.map(due => {
                const agingCategory = getAgingCategory(due.dueDate);
                const daysOverdue = getDaysOverdue(due.dueDate);
                const overdue = isOverdue(due.dueDate);
                
                return (
<<<<<<< HEAD
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
=======
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
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                    </div>

                    <div className="due-info">
                      <div className="customer-details">
                        <h4>
<<<<<<< HEAD
                          <FiUser className="customer-icon" />
=======
                          <FaUser className="customer-icon" />
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                          {due.customerName}
                        </h4>
                        {due.customerPhone && (
                          <p className="customer-phone">
<<<<<<< HEAD
                            <FiPhone /> {due.customerPhone}
=======
                            <FaPhone /> {due.customerPhone}
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                          </p>
                        )}
                      </div>

                      <div className="amount-info">
                        <div className="amount-row">
<<<<<<< HEAD
                          <span>মূল বাকি / Total:</span>
                          <span className="due-amount">{formatCurrency(due.dueAmount)}</span>
                        </div>
                        <div className="amount-row">
                          <span>পরিশোধিত / Paid:</span>
                          <span className="paid-amount">{formatCurrency(due.paidAmount)}</span>
                        </div>
                        <div className="amount-row total">
                          <span>অবশিষ্ট / Remaining:</span>
=======
                          <span>মূল বকেয়া:</span>
                          <span className="due-amount">{formatCurrency(due.dueAmount)}</span>
                        </div>
                        <div className="amount-row">
                          <span>পরিশোধিত:</span>
                          <span className="paid-amount">{formatCurrency(due.paidAmount)}</span>
                        </div>
                        <div className="amount-row total">
                          <span>অবশিষ্ট:</span>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                          <span className="remaining-amount">{formatCurrency(due.remainingAmount)}</span>
                        </div>
                      </div>

                      {overdue && (
                        <div className="overdue-alert">
<<<<<<< HEAD
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
=======
                          <FaExclamationTriangle /> 
                          {daysOverdue} দিন অতিবাহিত
                        </div>
                      )}
                    </div>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
<<<<<<< HEAD
              <button 
=======
              <button
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="page-btn"
              >
<<<<<<< HEAD
                পূর্ববর্তী / Previous
              </button>
              
              <span className="page-info">
                পৃষ্ঠা {currentPage} এর {totalPages} / Page {currentPage} of {totalPages}
              </span>
              
              <button 
=======
                পূর্ববর্তী
              </button>
              
              <span className="page-info">
                পৃষ্ঠা {currentPage} এর {totalPages}
              </span>
              
              <button
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
<<<<<<< HEAD
                পরবর্তী / Next
=======
                পরবর্তী
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
              </button>
            </div>
          )}
        </div>

        {/* View Modal */}
        {showViewModal && selectedDue && (
<<<<<<< HEAD
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
=======
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
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedDue && (
<<<<<<< HEAD
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
=======
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
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                </button>
              </div>
              <form onSubmit={handlePaymentSubmit} className="payment-form">
                <div className="form-group">
<<<<<<< HEAD
                  <label>পরিমাণ / <span className="bengali-text">Amount ({formatCurrency(0).charAt(0)})</span></label>
=======
                  <label>পরিমাণ (৳)</label>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
<<<<<<< HEAD
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
=======
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                <button type="submit" className="submit-btn">
                  পরিশোধ সঠিক করুন
                </button>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
              </form>
            </div>
          </div>
        )}
      </div>
<<<<<<< HEAD
    </div>
  );
};

// DonutChart component (simplified for this example)
=======
    </>
  );
};

// Donut Chart Component
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
const DonutChart = ({ data }) => {
  const { segments, total } = data;
  
  if (total === 0) {
<<<<<<< HEAD
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
=======
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
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
      </div>
    </div>
  );
};

export default Dues;
