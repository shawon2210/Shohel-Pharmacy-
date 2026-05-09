import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
<<<<<<< HEAD
  FaPlus, 
  FaSearch,
  FaTimes,
  FaEdit
} from 'react-icons/fa';
import { FiEye, FiEdit, FiTrash2, FiAlertTriangle, FiClock } from 'react-icons/fi';
import Background3D from '../../components/UI/Background3D';
=======
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiX, 
  FiAlertTriangle, 
  FiClock,
  FiBox
} from 'react-icons/fi';
import { 
  FaTimes, 
  FaEdit,
  FaEye
} from 'react-icons/fa';
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
import './Products.css';
import { formatCurrency, CURRENCY_SYMBOL } from '../../utils/currency';

const Products = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    category: '',
    strength: '',
    unit: 'tablet',
    packSize: '',
    batchNumber: '',
    expiryDate: '',
    purchasePrice: '',
    sellingPrice: '',
    mrp: '',
    stockQuantity: '',
    minimumStock: '',
    location: '',
    description: ''
  });

  const units = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'powder', 'other'];

  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        category: selectedCategory,
        lowStock: showLowStock,
        expiringSoon: showExpiringSoon
      };
      
      const response = await axios.get('/api/medicines', { params });
      setMedicines(response.data.medicines);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error('Failed to fetch medicines');
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, showLowStock, showExpiringSoon]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('/api/medicines/categories/list');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
  }, [fetchMedicines, fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      genericName: '',
      manufacturer: '',
      category: '',
      strength: '',
      unit: 'tablet',
      packSize: '',
      batchNumber: '',
      expiryDate: '',
      purchasePrice: '',
      sellingPrice: '',
      mrp: '',
      stockQuantity: '',
      minimumStock: '',
      location: '',
      description: ''
    });
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/medicines', formData);
      toast.success('Medicine added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchMedicines();
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
        });
      } else {
        toast.error('Failed to add medicine');
      }
    }
  };

  const handleEditMedicine = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/medicines/${selectedMedicine._id}`, formData);
      toast.success('Medicine updated successfully!');
      setShowEditModal(false);
      setSelectedMedicine(null);
      resetForm();
      fetchMedicines();
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => {
          toast.error(err.msg);
        });
      } else {
        toast.error('Failed to update medicine');
      }
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await axios.delete(`/api/medicines/${id}`);
        toast.success('Medicine deleted successfully!');
        fetchMedicines();
      } catch (error) {
        toast.error('Failed to delete medicine');
      }
    }
  };

  const openEditModal = (medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      genericName: medicine.genericName,
      manufacturer: medicine.manufacturer,
      category: medicine.category,
      strength: medicine.strength,
      unit: medicine.unit,
      packSize: medicine.packSize,
      batchNumber: medicine.batchNumber,
      expiryDate: medicine.expiryDate.split('T')[0],
      purchasePrice: medicine.purchasePrice,
      sellingPrice: medicine.sellingPrice,
      mrp: medicine.mrp,
      stockQuantity: medicine.stockQuantity,
      minimumStock: medicine.minimumStock,
      location: medicine.location || '',
      description: medicine.description || ''
    });
    setShowEditModal(true);
  };

  const openViewModal = (medicine) => {
    setSelectedMedicine(medicine);
    setShowViewModal(true);
  };

  const isExpiringSoon = (expiryDate) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(expiryDate) <= thirtyDaysFromNow;
  };

  const isLowStock = (medicine) => {
    return medicine.stockQuantity <= medicine.minimumStock;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setShowLowStock(false);
    setShowExpiringSoon(false);
    setCurrentPage(1);
  };

<<<<<<< HEAD
  return (
    <>
      <Background3D variant="medical" />
      <div className="products-page">
        <div className="page-header">
          <h1>Medicine Management</h1>
          <button 
            className="primary-button"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Add Medicine
          </button>
=======
return (
    <div className="products-page">
        <div className="page-header">
            <div className="header-left">
                <FiBox size={24} />
                <h1>Medicine Management</h1>
            </div>
            <button 
                className="primary-button"
                onClick={() => setShowAddModal(true)}
            >
                <FiPlus /> Add Medicine
            </button>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
        </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
<<<<<<< HEAD
          <FaSearch className="search-icon" />
=======
          <FiSearch className="search-icon" />
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
            />
            Low Stock
          </label>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={showExpiringSoon}
              onChange={(e) => setShowExpiringSoon(e.target.checked)}
            />
            Expiring Soon
          </label>

          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
          >
<<<<<<< HEAD
            <FaTimes /> Clear
=======
            <FiX /> Clear
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
          </button>
        </div>
      </div>

      {/* Medicines List */}
      <div className="page-content">
        {loading ? (
<<<<<<< HEAD
          <div className="loading">Loading medicines...</div>
         ) : (
              <div className="products-content">
              <div className="medicines-grid">
=======
              <div className="product-skeleton">
                <div className="skeleton-header"></div>
                <div className="skeleton-card">
                  <div className="skeleton-icon"></div>
                  <div className="skeleton-text medium"></div>
                  <div className="skeleton-stat"></div>
                </div>
                <div className="skeleton-card">
                  <div className="skeleton-icon"></div>
                  <div className="skeleton-text short"></div>
                  <div className="skeleton-stat"></div>
                </div>
              </div>
            ) : (
          <>
            <div className="medicines-grid">
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
              {medicines.map(medicine => (
                <div key={medicine._id} className="medicine-card">
                  <div className="medicine-header">
                    <h3>{medicine.name}</h3>
                    <div className="medicine-actions">
<<<<<<< HEAD
                        <button
                          className="action-btn view-btn"
                          onClick={() => openViewModal(medicine)}
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                      <button
=======
                      <button 
                        className="action-btn view-btn"
                        onClick={() => openViewModal(medicine)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                        className="action-btn edit-btn"
                        onClick={() => openEditModal(medicine)}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
<<<<<<< HEAD
                      <button
=======
                      <button 
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteMedicine(medicine._id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>

                  <div className="medicine-info">
                    <p><strong>Generic:</strong> {medicine.genericName}</p>
                    <p><strong>Manufacturer:</strong> {medicine.manufacturer}</p>
                    <p><strong>Strength:</strong> {medicine.strength} {medicine.unit}</p>
                    <p><strong>Pack Size:</strong> {medicine.packSize}</p>
                    <p><strong>Stock:</strong> {medicine.stockQuantity}</p>
                    <p><strong>Price:</strong> {formatCurrency(medicine.sellingPrice)}</p>
                  </div>

                  <div className="medicine-alerts">
                    {isLowStock(medicine) && (
                      <span className="alert low-stock">
                        <FiAlertTriangle /> Low Stock
                      </span>
                    )}
                    {isExpiringSoon(medicine.expiryDate) && (
                      <span className="alert expiring">
                        <FiClock /> Expiring Soon
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {medicines.length === 0 && (
              <div className="no-medicines">
                <p>No medicines found. Try adjusting your filters or add a new medicine.</p>
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
<<<<<<< HEAD
            </div>
            )}
=======
          </>
        )}
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Medicine</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
<<<<<<< HEAD
                <FaTimes />
=======
                <FiX />
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
              </button>
            </div>
            <form onSubmit={handleAddMedicine} className="medicine-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Generic Name *</label>
                  <input
                    type="text"
                    name="genericName"
                    value={formData.genericName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Manufacturer *</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Strength *</label>
                  <input
                    type="text"
                    name="strength"
                    value={formData.strength}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pack Size *</label>
                  <input
                    type="text"
                    name="packSize"
                    value={formData.packSize}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Batch Number *</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Shelf/Rack location"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Purchase Price ({CURRENCY_SYMBOL}) *</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Selling Price ({CURRENCY_SYMBOL}) *</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>MRP ({CURRENCY_SYMBOL}) *</label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Stock *</label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Additional notes..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medicine Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Medicine</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedMedicine(null);
                  resetForm();
                }}
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditMedicine} className="medicine-form">
              {/* Same form fields as Add Modal */}
              <div className="form-row">
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Generic Name *</label>
                  <input
                    type="text"
                    name="genericName"
                    value={formData.genericName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Manufacturer *</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Strength *</label>
                  <input
                    type="text"
                    name="strength"
                    value={formData.strength}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>
                        {unit.charAt(0).toUpperCase() + unit.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pack Size *</label>
                  <input
                    type="text"
                    name="packSize"
                    value={formData.packSize}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Batch Number *</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Shelf/Rack location"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Purchase Price ({CURRENCY_SYMBOL}) *</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Selling Price ({CURRENCY_SYMBOL}) *</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>MRP ({CURRENCY_SYMBOL}) *</label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Stock *</label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Additional notes..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-button" onClick={() => {
                  setShowEditModal(false);
                  setSelectedMedicine(null);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Update Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Medicine Modal */}
      {showViewModal && selectedMedicine && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Medicine Details</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMedicine(null);
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="medicine-details">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedMedicine.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Generic Name:</label>
                    <span>{selectedMedicine.genericName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Manufacturer:</label>
                    <span>{selectedMedicine.manufacturer}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{selectedMedicine.category}</span>
                  </div>
                  <div className="detail-item">
                    <label>Strength:</label>
                    <span>{selectedMedicine.strength} {selectedMedicine.unit}</span>
                  </div>
                  <div className="detail-item">
                    <label>Pack Size:</label>
                    <span>{selectedMedicine.packSize}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Stock & Pricing</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Current Stock:</label>
                    <span className={isLowStock(selectedMedicine) ? 'low-stock' : ''}>
                      {selectedMedicine.stockQuantity}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Minimum Stock:</label>
                    <span>{selectedMedicine.minimumStock}</span>
                  </div>
                  <div className="detail-item">
                    <label>Purchase Price:</label>
                    <span>{formatCurrency(selectedMedicine.purchasePrice)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Selling Price:</label>
                    <span>{formatCurrency(selectedMedicine.sellingPrice)}</span>
                  </div>
                  <div className="detail-item">
                    <label>MRP:</label>
                    <span>{formatCurrency(selectedMedicine.mrp)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Batch Number:</label>
                    <span>{selectedMedicine.batchNumber}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Additional Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Expiry Date:</label>
                    <span className={isExpiringSoon(selectedMedicine.expiryDate) ? 'expiring' : ''}>
                      {new Date(selectedMedicine.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Location:</label>
                    <span>{selectedMedicine.location || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Description:</label>
                    <span>{selectedMedicine.description || 'No description'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Added:</label>
                    <span>{new Date(selectedMedicine.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{new Date(selectedMedicine.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="detail-actions">
                <button 
                  className="primary-button"
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedMedicine);
                  }}
                >
                  <FaEdit /> Edit Medicine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
<<<<<<< HEAD
    </>
=======
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  );
};

export default Products;