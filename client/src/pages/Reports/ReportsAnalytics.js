import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiBarChart2, 
  FiPieChart, 
  FiFileText, 
  FiDownload, 
  FiDollarSign, 
  FiShoppingCart, 
  FiUsers, 
  FiBox
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../../utils/currency';
import ReportPlaceholder from '../../components/Reports/ReportPlaceholder';

const SimpleLoader = () => (
  <div className="reports-skeleton">
    <div className="skeleton-header"></div>
    <div className="skeleton-cards">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card"></div>
      ))}
    </div>
  </div>
);

const ReportsAnalytics = () => {
  const [activeReport, setActiveReport] = useState('overview');
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period: 'month',
  });

  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [duesData, setDuesData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        period: filters.period,
      };

      let response;
      switch (activeReport) {
        case 'overview':
          response = await axios.get('/api/reports/overview', { params });
          setOverviewData(response.data);
          break;
        case 'sales':
          response = await axios.get('/api/reports/sales', { params });
          setSalesData(response.data);
          break;
        case 'customers':
          response = await axios.get('/api/reports/customers', { params });
          setCustomerData(response.data);
          break;
        case 'dues':
          response = await axios.get('/api/reports/dues', { params });
          setDuesData(response.data);
          break;
        case 'financial':
          response = await axios.get('/api/reports/financial', { params });
          setFinancialData(response.data);
          break;
        case 'inventory':
          response = await axios.get('/api/reports/inventory', { params });
          setInventoryData(response.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeReport} data:`, error);
      toast.error(`Failed to fetch ${activeReport} data`);
    } finally {
      setLoading(false);
    }
  }, [activeReport, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const exportToExcel = () => {
    const getCurrentData = () => {
      switch (activeReport) {
        case 'overview': return overviewData;
        case 'sales': return salesData;
        case 'financial': return financialData;
        case 'inventory': return inventoryData;
        case 'customers': return customerData;
        case 'dues': return duesData;
        default: return null;
      }
    };

    const data = getCurrentData();
    if (!data) return;

    const wb = XLSX.utils.book_new();
    const reportName = activeReport.charAt(0).toUpperCase() + activeReport.slice(1);

    if (activeReport === 'overview') {
      const wsData = [{
        'Total Sales': data.sales?.totalSales || 0,
        'Total Transactions': data.sales?.totalTransactions || 0,
        'Net Profit': data.profit || 0
      }];
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Business Summary');
    }

    if (activeReport === 'sales') {
      if (data.topMedicines) {
        const wsData = data.topMedicines.map(item => ({
          'Medicine': item.medicine?.name || 'N/A',
          'Quantity': item.totalQuantity,
          'Revenue': item.totalRevenue
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Top Medicines');
      }
      if (data.paymentMethods) {
        const wsData2 = data.paymentMethods.map(method => ({
          'Payment Method': method.method,
          'Amount': method.amount,
          'Percentage': method.percentage
        }));
        const ws2 = XLSX.utils.json_to_sheet(wsData2);
        XLSX.utils.book_append_sheet(wb, ws2, 'Payment Methods');
      }
    }

    if (activeReport === 'financial') {
      if (data.dailyTrends) {
        const wsData = data.dailyTrends.slice(-7).map(trend => ({
          'Date': formatDate(trend._id),
          'Sales': trend.sales,
          'Transactions': trend.transactions,
          'Cash': trend.cash,
          'Card': trend.card
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Daily Trends');
      }
      if (data.expenseBreakdown) {
        const wsData2 = data.expenseBreakdown.map(expense => ({
          'Category': expense._id,
          'Amount': expense.amount,
          'Transactions': expense.count
        }));
        const ws2 = XLSX.utils.json_to_sheet(wsData2);
        XLSX.utils.book_append_sheet(wb, ws2, 'Expenses');
      }
    }

    if (activeReport === 'inventory') {
      if (data.stockMovement) {
        const wsData = data.stockMovement.slice(0, 10).map(item => ({
          'Medicine': item.medicineName,
          'Sold': item.totalSold,
          'Revenue': item.revenue,
          'Current Stock': item.currentStock,
          'Status': item.stockStatus
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Stock Movement');
      }
    }

    if (activeReport === 'customers') {
      if (data.topCustomers) {
        const wsData = data.topCustomers.map(customer => ({
          'Customer Name': customer.customerName,
          'Phone': customer.customerPhone,
          'Total Purchases': customer.totalPurchases,
          'Total Spent': customer.totalSpent,
          'Outstanding Due': customer.outstandingDue || 0
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Top Customers');
      }
    }

    if (activeReport === 'dues') {
      if (data.duesSummary?.length > 0) {
        const wsData = data.duesSummary.map(due => ({
          'Status': due._id || 'PENDING',
          'Total Amount': due.totalAmount || 0,
          'Remaining Amount': due.remainingAmount || 0,
          'Customer Count': due.count || 0
        }));
        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Dues Summary');
      }
    }

    XLSX.writeFile(wb, `${reportName}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const getCurrentData = () => {
      switch (activeReport) {
        case 'overview': return overviewData;
        case 'sales': return salesData;
        case 'financial': return financialData;
        case 'inventory': return inventoryData;
        case 'customers': return customerData;
        case 'dues': return duesData;
        default: return null;
      }
    };

    const data = getCurrentData();
    if (!data) return;

    const doc = new jsPDF();
    const reportName = activeReport.charAt(0).toUpperCase() + activeReport.slice(1);

    doc.setFontSize(20);
    doc.text(`${reportName} Report / ${'রিপোর্ট'}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on / ${'তৈরির তারিখ'}: ${new Date().toLocaleDateString('en-GB')}`, 20, 30);

    let startY = 40;

    if (activeReport === 'overview') {
      const tableData = [[
        formatCurrency(data.sales?.totalSales || 0),
        (data.sales?.totalTransactions || 0).toString(),
        formatCurrency(data.profit || 0)
      ]];

      autoTable(doc, {
        head: [['Total Sales / মোট বিক্রি', 'Total Transactions / মোট লেনদেন', 'Net Profit / নিট লাভ']],
        body: tableData,
        startY: startY
      });
    }

    if (activeReport === 'sales') {
      if (data.topMedicines) {
        const tableData = data.topMedicines.map(item => [
          item.medicine?.name || 'N/A',
          item.totalQuantity.toString(),
          formatCurrency(item.totalRevenue)
        ]);

        autoTable(doc, {
          head: [['Medicine / ঔষধ', 'Quantity / পরিমাণ', 'Revenue / আয়']],
          body: tableData,
          startY: startY
        });
        startY = doc.lastAutoTable.finalY + 10;
      }
    }

    doc.save(`${reportName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const reportTypes = [
    { id: 'overview', title: 'Overview / সংক্ষিপ্ত', subtitle: 'Business Summary / ব্যবসায়িক সারাংশ', icon: <FiBarChart2 />, color: '#4CAF50' },
    { id: 'sales', title: 'Sales / বিক্রি', subtitle: 'Sales Analytics / বিক্রয় বিশ্লেষণ', icon: <FiShoppingCart />, color: '#2196F3' },
    { id: 'financial', title: 'Financial / আৰ্থিক', subtitle: 'Financial Trends / আৰ্থিক প্রবণতা', icon: <FiDollarSign />, color: '#FF9800' },
    { id: 'customers', title: 'Customers / গ্রাহক', subtitle: 'Customer Insights / গ্রাহক তথ্য', icon: <FiUsers />, color: '#F44336' },
    { id: 'dues', title: 'Dues / বাকি', subtitle: 'Due Management / বাকি ব্যবস্থাপনা', icon: <FiPieChart />, color: '#795548' },
    { id: 'inventory', title: 'Inventory / ইনভেন্টরি', subtitle: 'Stock Management / স্টক ব্যবস্থাপনা', icon: <FiBox />, color: '#9C27B0' }
  ];

  const renderReportContent = () => {
    if (loading) {
      return <SimpleLoader />;
    }

    const reportTitles = {
      overview: 'Overview Report / সংক্ষিপ্ত রিপোর্ট',
      sales: 'Sales Report / বিক্রয় রিপোর্ট',
      financial: 'Financial Report / আর্থিক রিপোর্ট',
      inventory: 'Inventory Report / ইনভেন্টরি রিপোর্ট',
      customers: 'Customer Report / কাস্টমার রিপোর্ট',
      dues: 'Dues Report / বকেয়া রিপোর্ট'
    };

    const getDataForReport = () => {
      switch (activeReport) {
        case 'overview': return overviewData;
        case 'sales': return salesData;
        case 'financial': return financialData;
        case 'inventory': return inventoryData;
        case 'customers': return customerData;
        case 'dues': return duesData;
        default: return null;
      }
    };

    return <ReportPlaceholder title={reportTitles[activeReport]} data={getDataForReport()} formatCurrency={formatCurrency} />;
  };

  return (
    <div className="reports-page">
      <div className="reports-page-container">
        {/* ========== 1. PAGE HEADER ========== */}
        <div className="page-header">
          <div className="header-left">
            <FiBarChart2 size={24} />
            <div className="header-text">
              <h1>Reports & Analytics / <span className="bengali-text">রিপোর্ট ও বিশ্লেষণ</span></h1>
              <p className="header-subtitle">Business insights and data analytics / <span className="bengali-text">ব্যবসায়িক তথ্য ও বিশ্লেষণ</span></p>
            </div>
          </div>
          <div className="header-actions">
            <button className="export-button" onClick={exportToExcel}>
              <FiFileText /> Export Excel / <span className="bengali-text">এক্সেল</span>
            </button>
            <button className="export-button" onClick={exportToPDF}>
              <FiDownload /> Export PDF / <span className="bengali-text">পিডিএফ</span>
            </button>
          </div>
        </div>

        {/* ========== 2. TAB NAVIGATION ========== */}
        <div className="tab-navigation">
          {reportTypes.map(report => (
            <button
              key={report.id}
              className={`tab-button ${activeReport === report.id ? 'active' : ''}`}
              onClick={() => setActiveReport(report.id)}
              style={{ borderLeft: `3px solid ${report.color}` }}
            >
              <div className="tab-icon">{report.icon}</div>
              <div className="tab-title">{report.title}</div>
              <div className="tab-subtitle">{report.subtitle}</div>
            </button>
          ))}
        </div>

        {/* ========== 3. FILTERS SECTION ========== */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Start Date / <span className="bengali-text">শুরুর তারিখ</span></label>
            <input
              className="form-control"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              aria-label="Start date"
            />
          </div>
          <div className="filter-group">
            <label>End Date / <span className="bengali-text">শেষ তারিখ</span></label>
            <input
              className="form-control"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              aria-label="End date"
            />
          </div>
          <div className="filter-group">
            <label>Period / <span className="bengali-text">সময়কাল</span></label>
            <select
              className="form-control"
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              aria-label="Select period"
            >
              <option value="day">Daily / দৈনিক</option>
              <option value="week">Weekly / সাপ্তাহিক</option>
              <option value="month">Monthly / মাসিক</option>
              <option value="year">Yearly / বার্ষিক</option>
            </select>
          </div>
        </div>

        {/* ========== 4. REPORT CONTENT ========== */}
        <div className="report-content">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
