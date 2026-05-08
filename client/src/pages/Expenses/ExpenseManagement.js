import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiX,
  FiCalendar,
  FiDollarSign,
  FiCreditCard,
  FiHome,
  FiFileText,
  FiBarChart2,
  FiDownload,
  FiFilter,
  FiReceipt,
  FiUser
} from 'react-icons/fi';
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

  // === ADD EXPENSE STATE ===
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
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

  useEffect(() => {
    if (activeTab === 'expense-list') {
      fetchExpenses();
      fetchSummary();
    }
  }, [activeTab, fetchExpenses, fetchSummary]);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === 'expense-list') {
        fetchExpenses();
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchExpenses, activeTab]);

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
      expenseDate: new Date().toISOString().split('T')[0],
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
        toast.success('Expense deleted successfully');
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  // === UTILITY FUNCTIONS ===
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB');
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return <FiDollarSign className="payment-icon cash" />;
      case 'card':
        return <FiCreditCard className="payment-icon card" />;
      case 'bank_transfer':
        return <FiHome className="payment-icon bank" />;
      case 'cheque':
        return <FiCreditCard className="payment-icon cheque" />;
      default:
        return <FiDollarSign className="payment-icon" />;
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
        return <FiHome />;
      case 'utilities':
        return <FiBarChart2 />;
      case 'staff_salary':
        return <FiUser />;
      case 'maintenance':
        return <FiEdit />;
      case 'marketing':
        return <FiBarChart2 />;
      case 'office_supplies':
        return <FiFileText />;
      case 'transport':
        return <FiHome />;
      case 'other':
        return <FiDollarSign />;
      default:
        return <FiDollarSign />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'rent':
        return 'Rent / ভাড়া';
      case 'utilities':
        return 'Utilities / সেবা';
      case 'staff_salary':
        return 'Staff Salary / কর্মচারী বেতন';
      case 'maintenance':
        return 'Maintenance / রক্ষণাবেক্ষণ';
      case 'marketing':
        return 'Marketing / বিপণন';
      case 'office_supplies':
        return 'Office Supplies / অফিস সরবরাহ';
      case 'transport':
        return 'Transport / পরিবহন';
      case 'other':
        return 'Other / অন্যান্য';
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
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
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
    { value: 'rent', label: 'Rent / ভাড়া', icon: <FiHome /> },
    { value: 'utilities', label: 'Utilities / সেবা', icon: <FiBarChart2 /> },
    { value: 'staff_salary', label: 'Staff Salary / কর্মচারী বেতন', icon: <FiUser /> },
    { value: 'maintenance', label: 'Maintenance / রক্ষণাবেক্ষণ', icon: <FiEdit /> },
    { value: 'marketing', label: 'Marketing / বিপণন', icon: <FiBarChart2 /> },
    { value: 'office_supplies', label: 'Office Supplies / অফিস সরবরাহ', icon: <FiFileText /> },
    { value: 'transport', label: 'Transport / পরিবহন', icon: <FiHome /> },
    { value: 'other', label: 'Other / অন্যান্য', icon: <FiDollarSign /> }
  ];

  return (
    <div className="expense-management-page">
      <div className="expense-list-container">
        {/* ========== 1. PAGE HEADER ========== */}
        <div className="page-header">
          <div className="header-left">
            <FiDollarSign size={24} />
            <div className="header-text">
              <h1>Expense Management / <span className="bengali-text">ব্যয় ব্যবস্থাপনা</span></h1>
              <p className="header-subtitle">Track and manage all business expenses / <span className="bengali-text">সকল ব্যবসায়িক ব্যয় ট্র্যাক ও পরিচালনা করুন</span></p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className={`tab-button ${activeTab === 'add-expense' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-expense')}
            >
              <FiPlus /> Add Expense / <span className="bengali-text">ব্যয় যোগ করুন</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'expense-list' ? 'active' : ''}`}
              onClick={() => setActiveTab('expense-list')}
            >
              <FiFileText /> Expense List / <span className="bengali-text">ব্যয় তালিকা</span>
            </button>
          </div>
        </div>

        {/* ========== 2. SUMMARY CARDS (Horizontal Scroll like Dashboard) ========== */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-icon expenses">
              <FiBarChart2 />
            </div>
            <div className="card-content">
              <h3>মোট ব্যয়</h3>
              <div className="card-value">{summary.totalExpenses || 0}</div>
              <div className="card-subtitle">Total expenses</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon amount">
              <FiDollarSign />
            </div>
            <div className="card-content">
              <h3>মোট টাকা</h3>
              <div className="card-value">{formatCurrency(summary.totalAmount || 0)}</div>
              <div className="card-subtitle">Total spent</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-icon average">
              <FiBarChart2 />
            </div>
            <div className="card-content">
              <h3>গড় ব্যয়</h3>
              <div className="card-value">{formatCurrency(summary.averageExpense || 0)}</div>
              <div className="card-subtitle">Average per expense</div>
            </div>
          </div>
        </div>

        {/* ========== 3. ADD EXPENSE TAB ========== */}
        {activeTab === 'add-expense' && (
          <div className="add-expense-container">
            <div className="expense-form-container">
              <div className="form-header">
                <h2>Add New Expense / <span className="bengali-text">নতুন ব্যয় যোগ করুন</span></h2>
                <p>Record a new business expense with detailed information</p>
              </div>

              <form onSubmit={handleAddExpense} className="expense-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Category * / <span className="bengali-text">ক্যাটাগরি</span></label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category / ক্যাটাগরি নির্বাচন করুন</option>
                      {expenseCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
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
                  <label>Description * / <span className="bengali-text">বিবরণ</span></label>
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
                    <label>Expense Date * / <span className="bengali-text">তারিখ</span></label>
                    <input
                      type="date"
                      name="expenseDate"
                      value={formData.expenseDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Payment Method / <span className="bengali-text">পেমেন্ট পদ্ধতি</span></label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                    >
                      <option value="cash">Cash / নগদ</option>
                      <option value="card">Card / কার্ড</option>
                      <option value="bank_transfer">Bank Transfer / ব্যাংক ট্রান্সফার</option>
                      <option value="cheque">Cheque / চেক</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Receipt Number / <span className="bengali-text">রসিদ নম্বর</span></label>
                    <input
                      type="text"
                      name="receiptNumber"
                      value={formData.receiptNumber}
                      onChange={handleInputChange}
                      placeholder="Enter receipt number"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Vendor / <span className="bengali-text">বিক্রেতা</span></label>
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
                  <label>Notes / <span className="bengali-text">নোট</span></label>
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
                    <FiX /> Clear Form
                  </button>
                  <button 
                    type="submit"
                    className="primary-button"
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : <><FiPlus /> Add Expense / <span className="bengali-text">ব্যয় যোগ করুন</span></>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========== 4. EXPENSE LIST TAB ========== */}
        {activeTab === 'expense-list' && (
          <div className="expenses-content">
            {/* Filters Section */}
            <div className="filters-section">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Search / <span className="bengali-text">অনুসন্ধান</span></label>
                  <div className="search-input">
                    <FiSearch />
                    <input
                      type="text"
                      placeholder="Search by description or vendor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search expenses"
                    />
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Start Date / <span className="bengali-text">শুরুর তারিখ</span></label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label="Start date filter"
                  />
                </div>
                
                <div className="filter-group">
                  <label>End Date / <span className="bengali-text">শেষ তারিখ</span></label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label="End date filter"
                  />
                </div>
                
                <div className="filter-group">
                  <label>Category / <span className="bengali-text">ক্যাটাগরি</span></label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories / সকল ক্যাটাগরি</option>
                    {expenseCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="filter-actions">
                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear Filters / <span className="bengali-text">ফিল্টার সাফ করুন</span>
                </button>
                <button className="secondary-button" onClick={exportExpenses}>
                  <FiDownload /> Export / <span className="bengali-text">এক্সপোর্ট</span>
                </button>
              </div>
            </div>

            {/* Expenses Table Section */}
            <div className="expenses-table-section">
              <div className="section-header">
                <div className="section-title">
                  <FiBarChart2 size={20} />
                  <h2>Expense List / <span className="bengali-text">ব্যয় তালিকা</span></h2>
                </div>
                <div className="table-info">
                  Showing {expenses.length} of {totalExpenses} expenses
                </div>
              </div>

              {loading ? (
                <div className="expenses-skeleton">
                  <div className="skeleton-header"></div>
                  <div className="skeleton-cards">
                    {[1,2,3].map(i => (
                      <div key={i} className="skeleton-card"></div>
                    ))}
                  </div>
                </div>
              ) : expenses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon-wrapper">
                    <FiDollarSign className="empty-icon" size={48} />
                  </div>
                  <h3>No expenses found / <span className="bengali-text">কোন ব্যয় পাওয়া যায়নি</span></h3>
                  <p>Start by adding your first expense / <span className="bengali-text">প্রথম ব্যয় যোগ করে শুরু করুন</span></p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="expenses-table">
                    <div className="table-header">
                      <div className="th">Category / <span className="bengali-text">ক্যাটাগরি</span></div>
                      <div className="th">Description / <span className="bengali-text">বিবরণ</span></div>
                      <div className="th">Amount / <span className="bengali-text">পরিমাণ</span></div>
                      <div className="th">Payment / <span className="bengali-text">পেমেন্ট</span></div>
                      <div className="th">Date / <span className="bengali-text">তারিখ</span></div>
                      <div className="th">Actions / <span className="bengali-text">কার্যক্রম</span></div>
                    </div>

                    <div className="table-body">
                      {expenses.map((expense) => (
                        <div key={expense._id} className="table-row">
                          <div className="td">
                            <div className="expense-category">
                              <div className={`category-icon ${expense.category}`}>
                                {getCategoryIcon(expense.category)}
                              </div>
                              <span className="category-label">{getCategoryLabel(expense.category)}</span>
                            </div>
                          </div>
                          <div className="td">
                            <div className="expense-description">
                              <div className="description-text">{expense.description}</div>
                              {expense.vendor && (
                                <div className="expense-vendor">
                                  <FiUser /> {expense.vendor}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="td">
                            <div className="expense-amount">{formatCurrency(expense.amount)}</div>
                          </div>
                          <div className="td">
                            <div className="payment-method">
                              {getPaymentMethodIcon(expense.paymentMethod)}
                              <span>{getPaymentMethodLabel(expense.paymentMethod)}</span>
                            </div>
                          </div>
                          <div className="td">
                            <div className="expense-date">
                              <span className="date-text">{formatDate(expense.expenseDate)}</span>
                            </div>
                          </div>
                          <div className="td">
                            <div className="action-buttons">
                              <button 
                                className="action-btn view-btn"
                                onClick={() => viewExpenseDetails(expense)}
                                title="View Details"
                                aria-label="View expense details"
                              >
                                <FiEye />
                              </button>
                              <button 
                                className="action-btn edit-btn"
                                onClick={() => openEditModal(expense)}
                                title="Edit Expense"
                                aria-label="Edit expense"
                              >
                                <FiEdit />
                              </button>
                              <button 
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteExpense(expense._id)}
                                title="Delete Expense"
                                aria-label="Delete expense"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous / <span className="bengali-text">পূর্ববর্তী</span>
                      </button>
                      
                      <div className="pagination-info">
                        Page {currentPage} of {totalPages}
                      </div>
                      
                      <button 
                        className="pagination-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next / <span className="bengali-text">পরবর্তী</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ========== 5. VIEW MODAL ========== */}
        {showViewModal && selectedExpense && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Expense Details / <span className="bengali-text">ব্যয়ের বিবরণ</span></h2>
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
                  <strong>Category:</strong>
                  <span>{getCategoryIcon(selectedExpense.category)} {getCategoryLabel(selectedExpense.category)}</span>
                </div>
                <div className="detail-row">
                  <strong>Description:</strong>
                  <span>{selectedExpense.description}</span>
                </div>
                <div className="detail-row">
                  <strong>Amount:</strong>
                  <span className="amount">{formatCurrency(selectedExpense.amount)}</span>
                </div>
                <div className="detail-row">
                  <strong>Payment Method:</strong>
                  <span>{getPaymentMethodIcon(selectedExpense.paymentMethod)} {getPaymentMethodLabel(selectedExpense.paymentMethod)}</span>
                </div>
                <div className="detail-row">
                  <strong>Date:</strong>
                  <span>{formatDate(selectedExpense.expenseDate)}</span>
                </div>
                {selectedExpense.vendor && (
                  <div className="detail-row">
                    <strong>Vendor:</strong>
                    <span>{selectedExpense.vendor}</span>
                  </div>
                )}
                {selectedExpense.receiptNumber && (
                  <div className="detail-row">
                    <strong>Receipt Number:</strong>
                    <span>{selectedExpense.receiptNumber}</span>
                  </div>
                )}
                {selectedExpense.notes && (
                  <div className="detail-row">
                    <strong>Notes:</strong>
                    <span>{selectedExpense.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== 6. EDIT MODAL ========== */}
        {showEditModal && selectedExpense && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Expense / <span className="bengali-text">ব্যয় সম্পাদনা</span></h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close modal"
                >
                  <FiX />
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
                      <option value="">Select Category</option>
                      {expenseCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
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
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
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
                    onClick={() => setShowEditModal(false)}
                  >
                    <FiX /> Cancel
                  </button>
                  <button 
                    type="submit"
                    className="primary-button"
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : <><FiEdit /> Update Expense</>}
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

export default ExpenseManagement;
