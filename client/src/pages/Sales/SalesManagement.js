import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FiShoppingCart,
  FiDollarSign,
  FiCreditCard,
  FiCalendar,
  FiList,
  FiPlus,
  FiSearch,
  FiEye,
  FiPrinter,
  FiSmartphone
} from 'react-icons/fi';
import './SalesManagement.css';
import { formatCurrency } from '../../utils/currency';

const SalesManagement = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [salesSearchTerm, setSalesSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSales, setTotalSales] = useState(0);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalDue: 0,
    averageSale: 0
  });

  const fetchSales = useCallback(async () => {
    try {
      setSalesLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        startDate,
        endDate,
        customerName: customerName || salesSearchTerm
      };
      
      const response = await axios.get('/api/sales', { params });
      setSales(response.data.sales);
      setTotalPages(response.data.totalPages);
      setTotalSales(response.data.total);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Failed to fetch sales');
    } finally {
      setSalesLoading(false);
    }
  }, [currentPage, salesSearchTerm, startDate, endDate, customerName]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await axios.get('/api/sales/summary/today');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, []);

  useEffect(() => {
    fetchSales();
    fetchSummary();
  }, [fetchSales, fetchSummary]);

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <FiDollarSign className="payment-icon cash" />;
      case 'card':
        return <FiCreditCard className="payment-icon card" />;
      case 'mobile_banking':
        return <FiSmartphone className="payment-icon mobile" />;
      default:
        return <FiDollarSign className="payment-icon" />;
    }
  };

  const viewSaleDetails = (sale) => {
    setSelectedSale(sale);
    setShowViewModal(true);
  };

  const clearFilters = () => {
    setSalesSearchTerm('');
    setStartDate('');
    setEndDate('');
    setCustomerName('');
    setCurrentPage(1);
  };

  return (
    <div className="sales-management-page">
      <div className="sales-management-container">
        {/* ========== 1. PAGE HEADER ========== */}
        <div className="page-header">
          <div className="header-left">
            <FiShoppingCart size={24} />
            <h1>Sales Management / <span className="bengali-text">বিক্রয় ব্যবস্থাপনা</span></h1>
          </div>
          <div className="header-actions">
            <button 
              className="secondary-button"
              onClick={() => navigate('/reports?tab=sales')}
            >
              <FiList /> View Reports
            </button>
            <button 
              className="primary-button"
              onClick={() => navigate('/sales/new')}
            >
              <FiPlus /> New Sale
            </button>
          </div>
        </div>

        {/* ========== 2. SUMMARY CARDS (Horizontal Scroll like Dashboard KPI) ========== */}
        <div className="summary-cards">
          {/* Total Sales Card */}
          <div className="summary-card glass-card">
            <div className="card-icon sales">
              <FiShoppingCart />
            </div>
            <div className="card-content">
              <h3>মোট বিক্রি</h3>
              <div className="card-subtitle">Total Sales</div>
            </div>
            <div className="card-value">
              {summary.totalSales || 0}
            </div>
          </div>

          {/* Revenue Card */}
          <div className="summary-card glass-card">
            <div className="card-icon revenue">
              <FiDollarSign />
            </div>
            <div className="card-content">
              <h3>আয়</h3>
              <div className="card-subtitle">Revenue</div>
            </div>
            <div className="card-value">
              {formatCurrency(summary.totalAmount || 0)}
            </div>
          </div>

          {/* Paid Amount Card */}
          <div className="summary-card glass-card">
            <div className="card-icon paid">
              <FiCreditCard />
            </div>
            <div className="card-content">
              <h3>প্রাপ্ত</h3>
              <div className="card-subtitle">Paid Amount</div>
            </div>
            <div className="card-value">
              {formatCurrency(summary.totalPaid || 0)}
            </div>
          </div>

          {/* Due Amount Card */}
          <div className="summary-card glass-card">
            <div className="card-icon due">
              <FiCalendar />
            </div>
            <div className="card-content">
              <h3>বাকি</h3>
              <div className="card-subtitle">Due Amount</div>
            </div>
            <div className="card-value">
              {formatCurrency(summary.totalDue || 0)}
            </div>
          </div>
        </div>

        {/* ========== 3. FILTERS SECTION ========== */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search by customer name or sale number..."
                  value={salesSearchTerm}
                  onChange={(e) => setSalesSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        {/* ========== 4. SALES TABLE SECTION ========== */}
        <div className="sales-table-section">
          <div className="section-header">
            <h2 className="bengali-text">বিক্রয় লেনদেন</h2>
            <div className="table-info">
              Showing {sales.length} of {totalSales} sales
            </div>
          </div>

          {salesLoading ? (
            <div className="sales-skeleton">
              <div className="skeleton-header"></div>
              <div className="skeleton-cards">
                {[1,2,3].map(i => (
                  <div key={i} className="skeleton-card"></div>
                ))}
              </div>
            </div>
          ) : sales.length === 0 ? (
            <div className="empty-state">
              <FiShoppingCart className="empty-icon" />
              <h3>No sales found</h3>
              <p>Start by creating your first sale transaction</p>
              <button 
                className="primary-button"
                onClick={() => navigate('/sales/new')}
              >
                <FiPlus /> Create First Sale
              </button>
            </div>
          ) : (
            <>
              <div className="sales-table">
                <div className="table-header">
                  <div className="th">Sale #</div>
                  <div className="th">Customer</div>
                  <div className="th">Items</div>
                  <div className="th">Total</div>
                  <div className="th">Paid</div>
                  <div className="th">Due</div>
                  <div className="th">Payment</div>
                  <div className="th">Date</div>
                  <div className="th">Actions</div>
                </div>

                <div className="table-body">
                  {sales.map(sale => {
                    const paymentMethod = getPaymentMethodIcon(sale.paymentMethod);
                    
                    return (
                      <div key={sale._id} className="table-row">
                        <div className="td">
                          <div className="sale-number">{sale.saleNumber}</div>
                        </div>
                        <div className="td">
                          <div className="customer-info">
                            <div className="customer-name">{sale.customerName || 'Walk-in Customer'}</div>
                            {sale.customerPhone && (
                              <div className="customer-phone">{sale.customerPhone}</div>
                            )}
                          </div>
                        </div>
                        <div className="td">
                          <div className="items-count">{sale.items.length} items</div>
                          <div className="items-review">
                            {sale.items.slice(0, 2).map((item, index) => (
                              <span key={index} className="item-name">
                                {item.medicine?.name || 'Unknown'}
                              </span>
                            ))}
                            {sale.items.length > 2 && (
                              <span className="more-items">+{sale.items.length - 2} more</span>
                            )}
                          </div>
                        </div>
                        <div className="td">
                          <div className="amount total-amount">{formatCurrency(sale.totalAmount)}</div>
                        </div>
                        <div className="td">
                          <div className="amount paid-amount">{formatCurrency(sale.paidAmount)}</div>
                        </div>
                        <div className="td">
                          <div className={`amount due-amount ${sale.dueAmount > 0 ? 'has-due' : 'no-due'}`}>
                            {formatCurrency(sale.dueAmount)}
                          </div>
                        </div>
                        <div className="td">
                          <div className="payment-method">
                            {paymentMethod}
                            <span>{sale.paymentMethod === 'cash' ? 'Cash' : sale.paymentMethod === 'card' ? 'Card' : 'Mobile Banking'}</span>
                          </div>
                        </div>
                        <div className="td">
                          <div className="sale-date">
                            {new Date(sale.saleDate).toLocaleDateString()}
                          </div>
                          <div className="sale-time">
                            {new Date(sale.saleDate).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="td">
                          <div className="action-buttons">
                            <button 
                              className="action-btn view-btn"
                              onClick={() => viewSaleDetails(sale)}
                              title="View Details"
                            >
                              <FiEye />
                            </button>
                            <button 
                              className="action-btn print-btn"
                              onClick={() => window.print()}
                              title="Print Receipt"
                            >
                              <FiPrinter />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <button 
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ========== 5. SALE DETAILS MODAL ========== */}
        {showViewModal && selectedSale && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h2>Sale Details - {selectedSale.saleNumber}</h2>
                <button 
                  className="close-btn"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedSale(null);
                  }}
                >
                  ×
                </button>
              </div>

              <div className="sale-details">
                <div className="detail-section">
                  <h3 className="bengali-text">ক্রেতার তথ্য</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedSale.customerName || 'Walk-in Customer'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedSale.customerPhone || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Sale Date:</label>
                      <span>{new Date(selectedSale.saleDate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="bengali-text">বিক্রিত পণ্য</h3>
                  <div className="items-list">
                    {selectedSale.items.map((item, index) => (
                      <div key={index} className="sale-item">
                        <div className="item-header">
                          <h4>{item.medicine?.name || 'Unknown Medicine'}</h4>
                          <span className="item-price">{formatCurrency(item.unitPrice)}</span>
                        </div>
                        <div className="item-details">
                          <span>{item.medicine?.genericName || 'N/A'} - {item.medicine?.strength || 'N/A'} {item.medicine?.unit || 'N/A'}</span>
                          <span>Qty: {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalPrice)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="bengali-text">পেমেন্ট সারসংক্ষেপ</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Subtotal:</label>
                      <span>{formatCurrency(selectedSale.subtotal)}</span>
                    </div>
                    {selectedSale.discount > 0 && (
                      <div className="detail-item">
                        <label>Discount:</label>
                        <span>-{formatCurrency(selectedSale.discount)}</span>
                      </div>
                    )}
                    <div className="detail-item total">
                      <label>Total Amount:</label>
                      <span>{formatCurrency(selectedSale.totalAmount)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Paid Amount:</label>
                      <span>{formatCurrency(selectedSale.paidAmount)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Due Amount:</label>
                      <span className={selectedSale.dueAmount > 0 ? 'due' : 'no-due'}>
                        {selectedSale.dueAmount > 0 ? formatCurrency(selectedSale.dueAmount) : 'No Due'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Payment Method:</label>
                      <span>{selectedSale.paymentMethod === 'cash' ? 'Cash' : selectedSale.paymentMethod === 'card' ? 'Card' : 'Mobile Banking'}</span>
                    </div>
                  </div>
                </div>

                {selectedSale.notes && (
                  <div className="detail-section">
                    <h3 className="bengali-text">নোট</h3>
                    <p className="sale-notes">{selectedSale.notes}</p>
                  </div>
                )}

                <div className="detail-actions">
                  <button 
                    className="print-btn"
                    onClick={() => window.print()}
                  >
                    <FiPrinter /> Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesManagement;
