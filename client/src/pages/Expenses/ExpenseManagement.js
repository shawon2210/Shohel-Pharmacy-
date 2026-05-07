import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaTimes,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaBuilding,
  FaFileInvoice,
  FaChartBar,
  FaDownload,
  FaFilter,
  FaReceipt,
  FaUser
} from 'react-icons/fa';
import moment from 'moment';
import Background3D from '../../components/UI/Background3D';
import './ExpenseManagement.css';
import { formatCurrency, CURRENCY_SYMBOL } from '../../utils/currency';

const ExpenseManagement = () => {
  // Main state for active tab
  const [activeTab, setActiveTab] = useState('expense-list');
  
  // === EXPENSE LIST STATE ===
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    averageExpense: 0
  });
  // categories list is fetched but not used in current UI

  // === ADD EXPENSE STATE ===
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    expenseDate: moment().format('YYYY-MM-DD'),
    paymentMethod: 'cash',
    receiptNumber: '',
    vendor: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // === EXPENSE DATA FETCHING ===
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        startDate,
        endDate,
        category: selectedCategory,
        search: searchTerm
      };
      
      const response = await axios.get('/api/expenses', { params });
      setExpenses(response.data.expenses);
      setTotalPages(response.data.totalPages);
      setTotalExpenses(response.data.total);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, startDate, endDate, selectedCategory]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await axios.get('/api/expenses/summary/today');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      await axios.get('/api/expenses/categories/list');
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'expense-list') {
      fetchExpenses();
      fetchSummary();
    }
    fetchCategories();
  }, [activeTab, fetchExpenses, fetchSummary, fetchCategories]);

  // === FORM HANDLING ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      category: '',
      description: '',
      amount: '',
      expenseDate: moment().format('YYYY-MM-DD'),
      paymentMethod: 'cash',
      receiptNumber: '',
      vendor: '',
      notes: ''
    });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        recordedBy: 'Admin' // This should come from auth context in real app
      };

      await axios.post('/api/expenses', expenseData);
      
      toast.success('Expense added successfully!');
      resetForm();
      
      // Switch to expense list and refresh
      setActiveTab('expense-list');
      fetchExpenses();
      fetchSummary();
      
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
        });
      } else {
        toast.error('Failed to add expense');
      }
      console.error('Error creating expense:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/expenses/${selectedExpense._id}`, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      toast.success('Expense updated successfully!');
      setShowEditModal(false);
      setSelectedExpense(null);
      resetForm();
      fetchExpenses();
      fetchSummary();
      
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
        });
      } else {
        toast.error('Failed to update expense');
      }
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await axios.delete(`/api/expenses/${id}`);
        fetchExpenses();
        fetchSummary();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  // === UTILITY FUNCTIONS ===
  // use shared formatCurrency imported from ../../utils/currency

  const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <FaMoneyBillWave className="payment-icon cash" />;
      case 'card':
        return <FaCreditCard className="payment-icon card" />;
      case 'bank_transfer':
        return <span className="payment-icon bank">🏦</span>;
      case 'cheque':
        return <span className="payment-icon cheque">📄</span>;
      default:
        return <FaMoneyBillWave className="payment-icon" />;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cheque':
        return 'Cheque';
      default:
        return method;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'rent':
        return '🏠';
      case 'utilities':
        return '⚡';
      case 'staff_salary':
        return '👥';
      case 'maintenance':
        return '🔧';
      case 'marketing':
        return '📢';
      case 'office_supplies':
        return '📋';
      case 'transport':
        return '🚗';
      case 'other':
        return '📦';
      default:
        return '💰';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'rent':
        return 'Rent';
      case 'utilities':
        return 'Utilities';
      case 'staff_salary':
        return 'Staff Salary';
      case 'maintenance':
        return 'Maintenance';
      case 'marketing':
        return 'Marketing';
      case 'office_supplies':
        return 'Office Supplies';
      case 'transport':
        return 'Transport';
      case 'other':
        return 'Other';
      default:
        return category;
    }
  };

  const viewExpenseDetails = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      expenseDate: moment(expense.expenseDate).format('YYYY-MM-DD'),
      paymentMethod: expense.paymentMethod,
      receiptNumber: expense.receiptNumber || '',
      vendor: expense.vendor || '',
      notes: expense.notes || ''
    });
    setShowEditModal(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const exportExpenses = async () => {
    try {
      const params = {
        startDate,
        endDate,
        category: selectedCategory
      };
      
      const response = await axios.get('/api/expenses/export/csv', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Expenses exported successfully!');
    } catch (error) {
      toast.error('Failed to export expenses');
    }
  };

  const expenseCategories = [
    { value: 'rent', label: 'Rent', icon: '🏠' },
    { value: 'utilities', label: 'Utilities', icon: '⚡' },
    { value: 'staff_salary', label: 'Staff Salary', icon: '👥' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
    { value: 'marketing', label: 'Marketing', icon: '📢' },
    { value: 'office_supplies', label: 'Office Supplies', icon: '📋' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  return (
    <>
      <Background3D variant="medical" />
      <div className="expense-management-page">
        <div className="page-header">
          <h1>💵 Expense Management / ব্যয় ব্যবস্থাপনা</h1>
          <div className="header-actions">
            <button 
              className={`tab-button ${activeTab === 'add-expense' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-expense')}
            >
              <FaPlus /> Add Expense / ব্যয় যোগ করুন
            </button>
          <button 
            className={`tab-button ${activeTab === 'expense-list' ? 'active' : ''}`}
            onClick={() => setActiveTab('expense-list')}
          >
            <FaFileInvoice /> Expense List / ব্যয় তালিকা
          </button>
        </div>
      </div>

      {/* ADD EXPENSE TAB */}
      {activeTab === 'add-expense' && (
        <div className="add-expense-container">
          <div className="expense-form-container">
            <div className="form-header">
              <h2>Add New Expense</h2>
              <p>Record a new business expense with detailed information</p>
            </div>

            <form onSubmit={handleAddExpense} className="expense-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {expenseCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Amount ({CURRENCY_SYMBOL}) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter expense description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expense Date *</label>
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="card">💳 Card</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="cheque">📄 Cheque</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Receipt Number</label>
                  <input
                    type="text"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleInputChange}
                    placeholder="Enter receipt number"
                  />
                </div>
                
                <div className="form-group">
                  <label>Vendor</label>
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                    placeholder="Enter vendor name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or comments..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-button" 
                  onClick={resetForm}
                >
                  <FaTimes /> Clear Form
                </button>
                <button 
                  type="submit" 
                  className="primary-button"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : <><FaPlus /> Add Expense</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPENSE LIST TAB */}
      {activeTab === 'expense-list' && (
        <div className="expense-list-container">
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-icon expenses">
                <FaMoneyBillWave />
              </div>
              <div className="summary-content">
                <h3>Total Expenses</h3>
                <p className="summary-number">{summary.totalExpenses}</p>
                <span className="summary-label">Today</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon amount">
                <FaChartBar />
              </div>
              <div className="summary-content">
                <h3>Total Amount</h3>
                <p className="summary-number">{formatCurrency(summary.totalAmount)}</p>
                <span className="summary-label">Today</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon average">
                <FaReceipt />
              </div>
              <div className="summary-content">
                <h3>Average</h3>
                <p className="summary-number">{formatCurrency(summary.averageExpense)}</p>
                <span className="summary-label">Per Expense</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search expenses by description, vendor, or receipt number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <div className="date-filters">
                <div className="date-input">
                  <FaCalendarAlt className="date-icon" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start Date"
                  />
                </div>
                
                <div className="date-input">
                  <FaCalendarAlt className="date-icon" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End Date"
                  />
                </div>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-filter"
              >
                <option value="">All Categories</option>
                {expenseCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>

              <button 
                className="clear-filters-btn"
                onClick={clearFilters}
              >
                <FaFilter /> Clear Filters
              </button>
            </div>
          </div>

          {/* Expenses List */}
          <div className="expenses-content">
            {loading ? (
              <div className="loading">Loading expenses...</div>
            ) : (
              <>
                <div className="expenses-header">
                  <h2>Expense List ({totalExpenses} expenses)</h2>
                  <div className="expenses-actions">
                    <button className="export-btn" onClick={exportExpenses}>
                      <FaDownload /> Export
                    </button>
                  </div>
                </div>

                {expenses.length === 0 ? (
                  <div className="no-expenses">
                    <p>No expenses found. Try adjusting your filters or add a new expense.</p>
                    <button 
                      className="primary-button"
                      onClick={() => setActiveTab('add-expense')}
                    >
                      <FaPlus /> Add New Expense
                    </button>
                  </div>
                ) : (
                  <div className="expenses-grid">
                    {expenses.map(expense => (
                      <div key={expense._id} className="expense-card">
                        <div className="expense-header">
                          <div className="expense-category">
                            <span className="category-icon">{getCategoryIcon(expense.category)}</span>
                            <span className="category-label">{getCategoryLabel(expense.category)}</span>
                          </div>
                          <div className="expense-actions">
                            <button 
                              className="action-btn view-btn"
                              onClick={() => viewExpenseDetails(expense)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="action-btn edit-btn"
                              onClick={() => openEditModal(expense)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteExpense(expense._id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>

                        <div className="expense-info">
                          <h3>{expense.description}</h3>
                          <p className="expense-amount">{formatCurrency(expense.amount)}</p>
                          <p className="expense-date">{formatDate(expense.expenseDate)}</p>
                          {expense.vendor && (
                            <p className="expense-vendor">
                              <FaBuilding /> {expense.vendor}
                            </p>
                          )}
                          {expense.receiptNumber && (
                            <p className="expense-receipt">
                              <FaReceipt /> {expense.receiptNumber}
                            </p>
                          )}
                        </div>

                        <div className="expense-footer">
                          <div className="payment-method">
                            {getPaymentMethodIcon(expense.paymentMethod)}
                            <span>{getPaymentMethodLabel(expense.paymentMethod)}</span>
                          </div>
                          <div className="recorded-by">
                            <FaUser />
                            <span>{expense.recordedBy}</span>
                          </div>
                        </div>
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
        </div>
      )}

      {/* Expense Details Modal */}
      {showViewModal && selectedExpense && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Expense Details</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedExpense(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="expense-details">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{getCategoryIcon(selectedExpense.category)} {getCategoryLabel(selectedExpense.category)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Description:</label>
                    <span>{selectedExpense.description}</span>
                  </div>
                  <div className="detail-item">
                    <label>Amount:</label>
                    <span className="amount">{formatCurrency(selectedExpense.amount)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{formatDate(selectedExpense.expenseDate)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment & Vendor Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Payment Method:</label>
                    <span>{getPaymentMethodIcon(selectedExpense.paymentMethod)} {getPaymentMethodLabel(selectedExpense.paymentMethod)}</span>
                  </div>
                  {selectedExpense.vendor && (
                    <div className="detail-item">
                      <label>Vendor:</label>
                      <span>{selectedExpense.vendor}</span>
                    </div>
                  )}
                  {selectedExpense.receiptNumber && (
                    <div className="detail-item">
                      <label>Receipt Number:</label>
                      <span>{selectedExpense.receiptNumber}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>Recorded By:</label>
                    <span>{selectedExpense.recordedBy}</span>
                  </div>
                </div>
              </div>

              {selectedExpense.notes && (
                <div className="detail-section">
                  <h3>Notes</h3>
                  <p className="expense-notes">{selectedExpense.notes}</p>
                </div>
              )}

              <div className="detail-actions">
                <button 
                  className="primary-button"
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedExpense);
                  }}
                >
                  <FaEdit /> Edit Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditModal && selectedExpense && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Expense</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedExpense(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditExpense} className="expense-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Amount ({CURRENCY_SYMBOL}) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expense Date *</label>
                  <input
                    type="date"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="card">💳 Card</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="cheque">📄 Cheque</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Receipt Number</label>
                  <input
                    type="text"
                    name="receiptNumber"
                    value={formData.receiptNumber}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label>Vendor</label>
                  <input
                    type="text"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="secondary-button" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedExpense(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-button"
                >
                  <FaEdit /> Update Expense
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

export default ExpenseManagement;