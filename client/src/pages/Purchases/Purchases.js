import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaSearch, FaFilter, FaDownload, FaEye, FaEdit, FaTrash,
  FaBuilding, FaCalendarAlt, FaCreditCard, FaMoneyBillWave,
  FaFileExport, FaChartLine, FaBoxes, FaUsers
} from 'react-icons/fa';
import Background3D from '../../components/UI/Background3D';
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
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Fetch purchases
  const fetchPurchases = async (page = 1) => {
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
  };

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
  }, [sortBy, sortOrder]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPurchases(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

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
      cash: { icon: FaMoneyBillWave, label: 'Cash', color: '#10b981' },
      cheque: { icon: FaCreditCard, label: 'Cheque', color: '#3b82f6' },
      bank_transfer: { icon: FaBuilding, label: 'Bank Transfer', color: '#8b5cf6' },
      credit: { icon: FaCreditCard, label: 'Credit', color: '#f59e0b' }
    };
    return methods[method] || { icon: FaMoneyBillWave, label: method, color: '#6b7280' };
  };

  return (
    <>
      <Background3D variant="medical" />
      <div className="purchases-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>📦 Purchase Management</h1>
            <p>Manage all purchase transactions and supplier relationships</p>
          </div>
        <div className="header-actions">
          <button 
            className="secondary-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>
          <button 
            className="secondary-button"
            onClick={exportPurchases}
          >
            <FaDownload /> Export
          </button>
          <button 
            className="primary-button"
            onClick={() => navigate('/purchases/new')}
          >
            <FaPlus /> New Purchase
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon purchases">
            <FaBoxes />
          </div>
          <div className="card-content">
            <h3>Total Purchases</h3>
            <div className="card-value">{summary.totalPurchases || 0}</div>
            <div className="card-subtitle">All time</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon amount">
            <FaMoneyBillWave />
          </div>
          <div className="card-content">
            <h3>Total Amount</h3>
            <div className="card-value">{formatCurrency(summary.totalAmount || 0)}</div>
            <div className="card-subtitle">Total spent</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon paid">
            <FaCreditCard />
          </div>
          <div className="card-content">
            <h3>Total Paid</h3>
            <div className="card-value">{formatCurrency(summary.totalPaid || 0)}</div>
            <div className="card-subtitle">Payments made</div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-icon due">
            <FaCalendarAlt />
          </div>
          <div className="card-content">
            <h3>Total Due</h3>
            <div className="card-value">{formatCurrency(summary.totalDue || 0)}</div>
            <div className="card-subtitle">Outstanding</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search by supplier name, purchase number..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
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
              />
            </div>
            
            <div className="filter-group">
              <label>Max Amount</label>
              <input
                type="number"
                placeholder="No limit"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
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
        {/* Main Content */}
        <div className="main-content">
          {/* Purchases Table */}
          <div className="purchases-table-section">
            <div className="section-header">
              <h2>📥 Purchase Transactions</h2>
              <div className="table-info">
                Showing {purchases.length} of {pagination.total} purchases
              </div>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading purchases...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div className="empty-state">
                <FaBoxes className="empty-icon" />
                <h3>No purchases found</h3>
                <p>Start by creating your first purchase transaction</p>
                <button 
                  className="primary-button"
                  onClick={() => navigate('/purchases/new')}
                >
                  <FaPlus /> Create First Purchase
                </button>
              </div>
            ) : (
              <>
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
                              >
                                <FaEye />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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

        {/* Sidebar */}
        <div className="sidebar">
          {/* Top Suppliers */}
          <div className="sidebar-section">
            <h3><FaUsers /> Top Suppliers</h3>
            {suppliers.length === 0 ? (
              <p className="no-data">No supplier data available</p>
            ) : (
              <div className="suppliers-list">
                {suppliers.map((supplier, index) => (
                  <div key={index} className="supplier-item">
                    <div className="supplier-rank">#{index + 1}</div>
                    <div className="supplier-details">
                      <div className="supplier-name">{supplier.supplierName}</div>
                      <div className="supplier-stats">
                        <span>{supplier.totalPurchases} purchases</span>
                        <span>{formatCurrency(supplier.totalSpent)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Analytics */}
          {analytics && (
            <div className="sidebar-section">
              <h3><FaChartLine /> This Month</h3>
              <div className="analytics-grid">
                <div className="analytics-item">
                  <div className="analytics-label">Purchases</div>
                  <div className="analytics-value">{analytics.totalPurchases}</div>
                </div>
                <div className="analytics-item">
                  <div className="analytics-label">Total Spent</div>
                  <div className="analytics-value">{formatCurrency(analytics.totalSpent)}</div>
                </div>
                <div className="analytics-item">
                  <div className="analytics-label">Average</div>
                  <div className="analytics-value">{formatCurrency(analytics.averagePurchase)}</div>
                </div>
                <div className="analytics-item">
                  <div className="analytics-label">Outstanding</div>
                  <div className="analytics-value">{formatCurrency(analytics.totalDue)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="sidebar-section">
            <h3>🚀 Quick Actions</h3>
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/purchases/new')}
              >
                <FaPlus /> New Purchase
              </button>
              <button 
                className="quick-action-btn"
                onClick={exportPurchases}
              >
                <FaFileExport /> Export Data
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => navigate('/reports?tab=purchases')}
              >
                <FaChartLine /> View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Purchases;