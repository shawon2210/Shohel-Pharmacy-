import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiPlus, FiFilter, FiDownload, FiEye,
  FiHome, FiCreditCard, FiDollarSign, FiBox, FiTrendingUp,
  FiSearch, FiCalendar
} from 'react-icons/fi';
import { formatCurrency } from '../../utils/currency';
import './Purchases.css';

const Purchases = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    paymentMethod: '',
    minAmount: '',
    maxAmount: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [sortBy, setSortBy] = useState('purchaseDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Fetch purchases
  const fetchPurchases = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        sortBy,
        sortOrder,
        ...filters
      };
      
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const response = await axios.get('/api/purchases', { params });
      setPurchases(response.data.purchases);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
      setSummary(response.data.summary);
    } catch (error) {
      toast.error('Failed to fetch purchases');
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, filters]);

  // Fetch supplier analytics
  const fetchSupplierAnalytics = async () => {
    try {
      const response = await axios.get('/api/purchases/analytics/top-suppliers', {
        params: { limit: 5 }
      });
      setSuppliers(response.data.topSuppliers);
    } catch (error) {
      console.error('Error fetching supplier analytics:', error);
    }
  };

  // Fetch period analytics
  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/purchases/analytics/period', {
        params: { period: 'month' }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchPurchases();
    fetchSupplierAnalytics();
    fetchAnalytics();
  }, [sortBy, sortOrder, fetchPurchases]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPurchases(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filters, fetchPurchases]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      paymentMethod: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Export purchases
  const exportPurchases = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const response = await axios.get('/api/purchases/export/csv', {
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'purchases-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Purchases exported successfully');
    } catch (error) {
      toast.error('Failed to export purchases');
    }
  };

  // View purchase details
  const viewPurchase = (purchaseId) => {
    navigate(`/purchases/${purchaseId}`);
  };

  // Get payment method display
  const getPaymentMethodDisplay = (method) => {
    const methods = {
      cash: { icon: FiDollarSign, label: 'Cash', color: '#10b981' },
      cheque: { icon: FiCreditCard, label: 'Cheque', color: '#3b82f6' },
      bank_transfer: { icon: FiHome, label: 'Bank Transfer', color: '#8b5cf6' },
      credit: { icon: FiCreditCard, label: 'Credit', color: '#f59e0b' }
    };
    return methods[method] || { icon: FiDollarSign, label: method, color: '#6b7280' };
  };

  return (
    <div className="purchases-page">
      <div className="purchases-container">
        {/* ========== 1. PAGE HEADER ========== */}
        <div className="page-header">
          <div className="header-left">
            <FiBox size={24} />
            <div className="header-text">
              <h1>Purchase Management / <span className="bengali-text">ক্রয় ব্যবস্থাপনা</span></h1>
              <p className="header-subtitle">Manage all purchase transactions and supplier relationships / <span className="bengali-text">সকল ক্রয় লেনদেন এবং সরবরাহকারী সম্পর্ক পরিচালনা করুন</span></p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="secondary-button"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
            >
              <FiFilter /> Filters
            </button>
            <button 
              className="secondary-button"
              onClick={exportPurchases}
              aria-label="Export purchases"
            >
              <FiDownload /> Export
            </button>
            <button 
              className="primary-button pulse-on-hover"
              onClick={() => navigate('/purchases/new')}
              aria-label="Create new purchase"
            >
              <FiPlus /> New Purchase
            </button>
          </div>
        </div>

        {/* ========== 2. SUMMARY CARDS (Horizontal Scroll like Dashboard KPI) ========== */}
        <div className="summary-cards">
          {/* Total Purchases Card */}
          <div className="summary-card glass-card">
            <div className="card-icon purchases">
              <FiBox />
            </div>
            <div className="card-content">
              <h3>মোট ক্রয়</h3>
              <div className="card-value">{summary.totalPurchases || 0}</div>
              <div className="card-subtitle">All time</div>
            </div>
          </div>

          {/* Total Amount Card */}
          <div className="summary-card glass-card">
            <div className="card-icon amount">
              <FiDollarSign />
            </div>
            <div className="card-content">
              <h3>মোট টাকা</h3>
              <div className="card-value">{formatCurrency(summary.totalAmount || 0)}</div>
              <div className="card-subtitle">Total spent</div>
            </div>
          </div>

          {/* Total Paid Card */}
          <div className="summary-card glass-card">
            <div className="card-icon paid">
              <FiCreditCard />
            </div>
            <div className="card-content">
              <h3>প্রদত্ত</h3>
              <div className="card-value">{formatCurrency(summary.totalPaid || 0)}</div>
              <div className="card-subtitle">Payments made</div>
            </div>
          </div>

          {/* Total Due Card */}
          <div className="summary-card glass-card">
            <div className="card-icon due">
              <FiCalendar />
            </div>
            <div className="card-content">
              <h3>বাকি</h3>
              <div className="card-value">{formatCurrency(summary.totalDue || 0)}</div>
              <div className="card-subtitle">Outstanding</div>
            </div>
          </div>
        </div>

        {/* ========== 3. FILTERS SECTION ========== */}
        {showFilters && (
          <div className="filters-section">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Search</label>
                <div className="search-input">
                  <FiSearch />
                  <input
                    type="text"
                    placeholder="Search by supplier name, purchase number..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    aria-label="Search purchases"
                  />
                </div>
              </div>
              
              <div className="filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  aria-label="Start date filter"
                />
              </div>
              
              <div className="filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  aria-label="End date filter"
                />
              </div>
              
              <div className="filter-group">
                <label>Payment Method</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  aria-label="Filter by payment method"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Min Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  aria-label="Minimum amount filter"
                />
              </div>
              
              <div className="filter-group">
                <label>Max Amount</label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  aria-label="Maximum amount filter"
                />
              </div>
            </div>
            
            <div className="filter-actions">
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        )}

        <div className="content-grid">
          {/* ========== 4. MAIN CONTENT (Purchases Table) ========== */}
          <div className="main-content">
            {/* Purchases Table Section */}
            <div className="purchases-table-section">
              <div className="section-header">
                <div className="section-title">
                  <FiBox size={20} />
                  <h2>Purchase Transactions / <span className="bengali-text">ক্রয় লেনদেন</span></h2>
                </div>
                <div className="table-info">
                  Showing {purchases.length} of {pagination.total} purchases
                </div>
              </div>

              {loading ? (
                <div className="purchases-skeleton">
                  <div className="skeleton-header"></div>
                  <div className="skeleton-cards">
                    {[1,2,3].map(i => (
                      <div key={i} className="skeleton-card"></div>
                    ))}
                  </div>
                </div>
              ) : purchases.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon-wrapper">
                    <FiBox className="empty-icon" size={48} />
                  </div>
                  <h3>No purchases found / <span className="bengali-text">কোন ক্রয় পাওয়া যায়নি</span></h3>
                  <p>Start by creating your first purchase transaction / <span className="bengali-text">প্রথম ক্রয় লেনদেন তৈরি করে শুরু করুন</span></p>
                  <button 
                    className="primary-button pulse-on-hover"
                    onClick={() => navigate('/purchases/new')}
                    aria-label="Create first purchase"
                  >
                    <FiPlus /> Create First Purchase
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="table-wrapper desktop-only">
                    <div className="purchases-table">
                      <div className="table-header">
                        <div className="th" onClick={() => handleSort('purchaseNumber')}>
                          Purchase # {sortBy === 'purchaseNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="th" onClick={() => handleSort('supplierName')}>
                          Supplier {sortBy === 'supplierName' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="th" onClick={() => handleSort('totalAmount')}>
                          Amount {sortBy === 'totalAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="th" onClick={() => handleSort('paidAmount')}>
                          Paid {sortBy === 'paidAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="th">Due</div>
                        <div className="th">Payment</div>
                        <div className="th" onClick={() => handleSort('purchaseDate')}>
                          Date {sortBy === 'purchaseDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                        <div className="th">Actions</div>
                      </div>

                      <div className="table-body">
                        {purchases.map((purchase) => {
                          const paymentMethod = getPaymentMethodDisplay(purchase.paymentMethod);
                          const PaymentIcon = paymentMethod.icon;
                          
                          return (
                            <div key={purchase._id} className="table-row">
                              <div className="td">
                                <div className="purchase-number">{purchase.purchaseNumber}</div>
                                <div className="item-count">{purchase.items.length} items</div>
                              </div>
                              <div className="td">
                                <div className="supplier-info">
                                  <div className="supplier-name">{purchase.supplierName}</div>
                                  {purchase.supplierPhone && (
                                    <div className="supplier-phone">{purchase.supplierPhone}</div>
                                  )}
                                </div>
                              </div>
                              <div className="td">
                                <div className="amount total-amount">{formatCurrency(purchase.totalAmount)}</div>
                              </div>
                              <div className="td">
                                <div className="amount paid-amount">{formatCurrency(purchase.paidAmount)}</div>
                              </div>
                              <div className="td">
                                <div className={`amount due-amount ${purchase.dueAmount > 0 ? 'has-due' : 'no-due'}`}>
                                  {formatCurrency(purchase.dueAmount)}
                                </div>
                              </div>
                              <div className="td">
                                <div className="payment-method" style={{ color: paymentMethod.color }}>
                                  <PaymentIcon /> {paymentMethod.label}
                                </div>
                              </div>
                              <div className="td">
                                <div className="purchase-date">
                                  {new Date(purchase.purchaseDate).toLocaleDateString()}
                                </div>
                                <div className="purchase-time">
                                  {new Date(purchase.purchaseDate).toLocaleTimeString()}
                                </div>
                              </div>
                              <div className="td">
                                <div className="action-buttons">
                                  <button 
                                    className="action-btn view-btn"
                                    onClick={() => viewPurchase(purchase._id)}
                                    title="View Details"
                                    aria-label={`View purchase ${purchase.purchaseNumber}`}
                                  >
                                    <FiEye />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="mobile-cards mobile-only">
                    {purchases.map((purchase) => {
                      const paymentMethod = getPaymentMethodDisplay(purchase.paymentMethod);
                      const PaymentIcon = paymentMethod.icon;
                      
                      return (
                        <div key={purchase._id} className="purchase-card glass-card">
                          <div className="card-header">
                            <div className="purchase-number">{purchase.purchaseNumber}</div>
                            <div className={`due-badge ${purchase.dueAmount > 0 ? 'has-due' : 'no-due'}`}>
                              {formatCurrency(purchase.dueAmount)} due
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="supplier-info">
                              <strong>{purchase.supplierName}</strong>
                              {purchase.supplierPhone && <div className="supplier-phone">{purchase.supplierPhone}</div>}
                            </div>
                            <div className="purchase-details">
                              <div className="detail-item">
                                <span className="label">Amount:</span>
                                <span className="value">{formatCurrency(purchase.totalAmount)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Paid:</span>
                                <span className="value">{formatCurrency(purchase.paidAmount)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">Payment:</span>
                                <span className="value" style={{ color: paymentMethod.color }}>
                                  <PaymentIcon /> {paymentMethod.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-btn"
                        disabled={pagination.currentPage === 1}
                        onClick={() => fetchPurchases(pagination.currentPage - 1)}
                      >
                        Previous
                      </button>
                      
                      <div className="pagination-info">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </div>
                      
                      <button 
                        className="pagination-btn"
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => fetchPurchases(pagination.currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ========== 5. SIDEBAR (Suppliers + Analytics) ========== */}
          <div className="sidebar">
            {/* Top Suppliers */}
            {suppliers.length > 0 && (
              <div className="sidebar-section glass-card">
                <h3><FiTrendingUp /> Top Suppliers / <span className="bengali-text">শীর্ষ সরবরাহকারী</span></h3>
                <div className="suppliers-list">
                  {suppliers.map((supplier, index) => (
                    <div key={index} className="supplier-item">
                      <div className="supplier-rank">{index + 1}</div>
                      <div className="supplier-info">
                        <div className="supplier-name">{supplier._id}</div>
                        <div className="supplier-count">{supplier.count} purchases</div>
                      </div>
                      <div className="supplier-amount">
                        {formatCurrency(supplier.total)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Summary */}
            {analytics && (
              <div className="sidebar-section glass-card">
                <h3><FiDollarSign /> Analytics / <span className="bengali-text">বিশ্লেষণ</span></h3>
                <div className="analytics-stats">
                  <div className="stat-item">
                    <span className="stat-label">This Month:</span>
                    <span className="stat-value">{formatCurrency(analytics.totalAmount || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Purchase:</span>
                    <span className="stat-value">{formatCurrency(analytics.avgAmount || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Count:</span>
                    <span className="stat-value">{analytics.count || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchases;
