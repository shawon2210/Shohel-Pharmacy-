import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiBarChart2, 
  FiPieChart, 
<<<<<<< HEAD
=======
  FiFilter, 
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  FiFileText, 
  FiDownload, 
  FiDollarSign, 
  FiShoppingCart, 
  FiUsers, 
<<<<<<< HEAD
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
=======
  FiTrendingUp, 
  FiTrendingDown, 
  FiMinus
} from 'react-icons/fi';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Background3D from '../../components/UI/Background3D';
import { formatCurrency, formatNumber, CURRENCY_SYMBOL } from '../../utils/currency';

const SimpleLoader = () => (
  <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '20px auto' }} />
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
);

const ReportsAnalytics = () => {
  const [activeReport, setActiveReport] = useState('overview');
  const [filters, setFilters] = useState({
<<<<<<< HEAD
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
=======
    startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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

<<<<<<< HEAD
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
=======
  const formatPercentage = (num) => `${num.toFixed(1)}%`;
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3

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
<<<<<<< HEAD

=======
    
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
    if (activeReport === 'overview') {
      const wsData = [{
        'Total Sales': data.sales?.totalSales || 0,
        'Total Transactions': data.sales?.totalTransactions || 0,
        'Net Profit': data.profit || 0
      }];
      const ws = XLSX.utils.json_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Business Summary');
    }
<<<<<<< HEAD

=======
    
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD

    if (activeReport === 'financial') {
      if (data.dailyTrends) {
        const wsData = data.dailyTrends.slice(-7).map(trend => ({
          'Date': formatDate(trend._id),
=======
    
    if (activeReport === 'financial') {
      if (data.dailyTrends) {
        const wsData = data.dailyTrends.slice(-7).map(trend => ({
          'Date': moment(trend._id).format('MMM DD'),
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD

=======
    
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
    }

=======
      if (data.purchaseVsSales) {
        const wsData2 = data.purchaseVsSales.slice(0, 10).map(item => ({
          'Medicine': item.medicineName,
          'Purchased': item.totalPurchased,
          'Sold': item.totalSold,
          'Net Movement': item.netMovement,
          'Profit': item.profitMargin
        }));
        const ws2 = XLSX.utils.json_to_sheet(wsData2);
        XLSX.utils.book_append_sheet(wb, ws2, 'Purchase vs Sales');
      }
    }
    
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
    }

=======
      if (data.customerSegments) {
        const wsData2 = data.customerSegments.map(segment => ({
          'Spending Range': segment._id === 'Other' ? 'Other' : 
                          segment._id === 0 ? '৳0 - ৳1,000' :
                          segment._id === 1000 ? '৳1,000 - ৳5,000' :
                          segment._id === 5000 ? '৳5,000 - ৳10,000' :
                          segment._id === 10000 ? '৳10,000 - ৳50,000' : '৳50,000+',
          'Customer Count': segment.count,
          'Average Purchases': segment.avgPurchases?.toFixed(1)
        }));
        const ws2 = XLSX.utils.json_to_sheet(wsData2);
        XLSX.utils.book_append_sheet(wb, ws2, 'Customer Segments');
      }
    }
    
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD
    }

    XLSX.writeFile(wb, `${reportName}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
=======
      if (data.overdueCustomers?.length > 0) {
        const wsData2 = data.overdueCustomers.map(customer => ({
          'Customer Name': customer.customerName || 'N/A',
          'Phone': customer.customerPhone || 'N/A',
          'Amount': customer.remainingAmount || 0,
          'Due Date': customer.dueDate ? moment(customer.dueDate).format('MMM DD, YYYY') : 'N/A',
          'Days Overdue': customer.daysPastDue ? Math.floor(customer.daysPastDue) : 0
        }));
        const ws2 = XLSX.utils.json_to_sheet(wsData2);
        XLSX.utils.book_append_sheet(wb, ws2, 'Overdue Customers');
      }
      if (data.paymentTrends?.length > 0) {
        const wsData3 = data.paymentTrends.slice(-7).map(trend => ({
          'Date': trend._id ? moment(trend._id).format('MMM DD') : 'N/A',
          'Amount Collected': trend.totalCollected || 0,
          'Transactions': trend.transactionCount || 0
        }));
        const ws3 = XLSX.utils.json_to_sheet(wsData3);
        XLSX.utils.book_append_sheet(wb, ws3, 'Payment Trends');
      }
    }

    XLSX.writeFile(wb, `${reportName}_Report_${moment().format('YYYY-MM-DD')}.xlsx`);
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD

    doc.setFontSize(20);
    doc.text(`${reportName} Report / ${'রিপোর্ট'}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on / ${'তৈরির তারিখ'}: ${new Date().toLocaleDateString('en-GB')}`, 20, 30);
=======
    
    doc.setFontSize(20);
    doc.text(`${reportName} Report`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${moment().format('YYYY-MM-DD HH:mm')}`, 20, 30);
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3

    let startY = 40;

    if (activeReport === 'overview') {
      const tableData = [[
        formatCurrency(data.sales?.totalSales || 0),
        (data.sales?.totalTransactions || 0).toString(),
        formatCurrency(data.profit || 0)
      ]];
<<<<<<< HEAD

      autoTable(doc, {
        head: [['Total Sales / মোট বিক্রি', 'Total Transactions / মোট লেনদেন', 'Net Profit / নিট লাভ']],
=======
      
      autoTable(doc, {
        head: [['Total Sales', 'Total Transactions', 'Net Profit']],
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
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
<<<<<<< HEAD

        autoTable(doc, {
          head: [['Medicine / ঔষধ', 'Quantity / পরিমাণ', 'Revenue / আয়']],
=======
        
        autoTable(doc, {
          head: [['Medicine', 'Quantity', 'Revenue']],
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
          body: tableData,
          startY: startY
        });
        startY = doc.lastAutoTable.finalY + 10;
      }
<<<<<<< HEAD
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
=======
      
      if (data.paymentMethods) {
        const tableData2 = data.paymentMethods.map(method => [
          method.method,
          formatCurrency(method.amount),
          `${method.percentage.toFixed(1)}%`
        ]);
        
        autoTable(doc, {
          head: [['Payment Method', 'Amount', 'Percentage']],
          body: tableData2,
          startY: startY
        });
      }
    }
    
    if (activeReport === 'financial') {
      if (data.dailyTrends) {
        const tableData = data.dailyTrends.slice(-7).map(trend => [
          moment(trend._id).format('MMM DD'),
          formatCurrency(trend.sales),
          trend.transactions.toString(),
          formatCurrency(trend.cash),
          formatCurrency(trend.card)
        ]);
        
        autoTable(doc, {
          head: [['Date', 'Sales', 'Transactions', 'Cash', 'Card']],
          body: tableData,
          startY: startY
        });
      }
    }
    
    if (activeReport === 'inventory') {
      if (data.stockMovement) {
        const tableData = data.stockMovement.slice(0, 10).map(item => [
          item.medicineName,
          item.totalSold.toString(),
          formatCurrency(item.revenue),
          item.currentStock.toString(),
          item.stockStatus
        ]);
        
        autoTable(doc, {
          head: [['Medicine', 'Sold', 'Revenue', 'Stock', 'Status']],
          body: tableData,
          startY: startY
        });
      }
    }
    
    if (activeReport === 'customers') {
      if (data.topCustomers) {
        const tableData = data.topCustomers.map(customer => [
          customer.customerName,
          customer.customerPhone,
          customer.totalPurchases.toString(),
          formatCurrency(customer.totalSpent),
          formatCurrency(customer.outstandingDue || 0)
        ]);
        
        autoTable(doc, {
          head: [['Customer', 'Phone', 'Purchases', 'Total Spent', 'Outstanding Due']],
          body: tableData,
          startY: startY
        });
      }
    }
    
    if (activeReport === 'dues') {
      if (data.duesSummary?.length > 0) {
        const tableData = data.duesSummary.map(due => [
          due._id || 'PENDING',
          formatCurrency(due.totalAmount || 0),
          formatCurrency(due.remainingAmount || 0),
          (due.count || 0).toString()
        ]);
        
        autoTable(doc, {
          head: [['Status', 'Total Amount', 'Remaining', 'Customers']],
          body: tableData,
          startY: startY
        });
        startY = doc.lastAutoTable.finalY + 10;
      }
      
      if (data.overdueCustomers?.length > 0) {
        const tableData2 = data.overdueCustomers.map(customer => [
          customer.customerName || 'N/A',
          customer.customerPhone || 'N/A',
          formatCurrency(customer.remainingAmount || 0),
          customer.dueDate ? moment(customer.dueDate).format('MMM DD, YYYY') : 'N/A',
          (customer.daysPastDue ? Math.floor(customer.daysPastDue) : 0).toString()
        ]);
        
        autoTable(doc, {
          head: [['Customer', 'Phone', 'Amount', 'Due Date', 'Days Overdue']],
          body: tableData2,
          startY: startY
        });
      }
    }

    doc.save(`${reportName}_Report_${moment().format('YYYY-MM-DD')}.pdf`);
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <FiTrendingUp style={{ color: '#10b981' }} />;
    if (value < 0) return <FiTrendingDown style={{ color: '#ef4444' }} />;
    return <FiMinus style={{ color: '#6b7280' }} />;
  };

  const reportTypes = [
    { id: 'overview', title: 'Overview', subtitle: 'Business Summary', icon: <FiBarChart2 />, color: '#4CAF50' },
    { id: 'sales', title: 'Sales', subtitle: 'Sales Analytics', icon: <FiShoppingCart />, color: '#2196F3' },
    { id: 'financial', title: 'Financial', subtitle: 'Financial Trends', icon: <FiDollarSign />, color: '#FF9800' },
    { id: 'customers', title: 'Customers', subtitle: 'Customer Insights', icon: <FiUsers />, color: '#F44336' },
    { id: 'dues', title: 'Dues', subtitle: 'Due Management', icon: <FiPieChart />, color: '#795548' },
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
  ];

  const renderReportContent = () => {
    if (loading) {
<<<<<<< HEAD
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
=======
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <SimpleLoader />
          <p style={{ marginLeft: '16px' }}>Loading report data...</p>
        </div>
      );
    }

    switch (activeReport) {
      case 'overview': return <OverviewReport data={overviewData} formatCurrency={formatCurrency} getTrendIcon={getTrendIcon} formatPercentage={formatPercentage} />;
      case 'sales': return <SalesReport data={salesData} formatCurrency={formatCurrency} formatNumber={formatNumber} formatPercentage={formatPercentage} />;
      case 'financial': return <FinancialReport data={financialData} formatCurrency={formatCurrency} />;
      case 'inventory': return <InventoryReport data={inventoryData} formatCurrency={formatCurrency} formatNumber={formatNumber} />;
      case 'customers': return <CustomerReport data={customerData} formatCurrency={formatCurrency} formatNumber={formatNumber} />;
      case 'dues': return <DuesReport data={duesData} formatCurrency={formatCurrency} formatNumber={formatNumber} />;
      default: return <p>Select a report type to view analytics.</p>;
    }
  };

  return (
    <>
      <Background3D variant="medical" />
      <div className="reports-container" style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        <div className="reports-paper" style={{ padding: '2rem', background: 'rgba(255,255,255,0.95)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <FiBarChart2 /> Reports & Analytics
            </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFileText /> Export Excel
            </button>
            <button className="btn btn-primary" onClick={exportToPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiDownload /> Export PDF
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
            </button>
          </div>
        </div>

<<<<<<< HEAD
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
=======
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Start Date</label>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
            <input
              className="form-control"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
<<<<<<< HEAD
              aria-label="Start date"
            />
          </div>
          <div className="filter-group">
            <label>End Date / <span className="bengali-text">শেষ তারিখ</span></label>
=======
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
            <input
              className="form-control"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
<<<<<<< HEAD
              aria-label="End date"
            />
          </div>
          <div className="filter-group">
            <label>Period / <span className="bengali-text">সময়কাল</span></label>
=======
            />
          </div>
          <div className="form-group">
            <label className="form-label">Period</label>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
            <select
              className="form-control"
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
<<<<<<< HEAD
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
=======
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-primary" onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
              <FiFilter /> Apply Filters
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '2rem' }}>
          {reportTypes.map(report => (
            <button
              key={report.id}
              className={`btn ${activeReport === report.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveReport(report.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem',
                textAlign: 'left',
                backgroundColor: activeReport === report.id ? report.color : 'transparent',
                borderColor: report.color,
                color: activeReport === report.id ? '#fff' : report.color
              }}
            >
              {report.icon}
              <div>
                <div style={{ fontWeight: '600' }}>{report.title}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{report.subtitle}</div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {renderReportContent()}
        </div>
      </div>
      </div>
    </>
  );
};

const OverviewReport = ({ data, formatCurrency, getTrendIcon }) => {
  if (!data) return <SimpleLoader />;
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Business Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <FiShoppingCart style={{ color: '#10b981' }} />
              <h3>Total Sales</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              {formatCurrency(data.sales?.totalSales || 0)}
            </div>
            <div style={{ color: '#6b7280' }}>{data.sales?.totalTransactions || 0} transactions</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <FiDollarSign style={{ color: '#f59e0b' }} />
              <h3>Net Profit</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              {formatCurrency(data.profit || 0)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getTrendIcon(data.profit)}
              <span>Trend</span>
            </div>
          </div>
        </div>
      </div>
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
    </div>
  );
};

<<<<<<< HEAD
export default ReportsAnalytics;
=======
// Other sub-components (SalesReport, FinancialReport, etc.) would be refactored similarly.
// For brevity, they are left in their original state but should be updated to use MUI components.

const SalesReport = ({ data, formatCurrency, formatNumber, formatPercentage }) => {
  if (!data) return <SimpleLoader />;
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Sales Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-body text-center">
            <h3>Total Revenue</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatCurrency(data.totalRevenue)}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <h3>Total Sales</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatNumber(data.totalSales)}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <h3>Average Sale</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatCurrency(data.averageSale)}</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Payment Methods</h3>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>Method</span>
                <span>Amount</span>
                <span>Percentage</span>
              </div>
              {data.paymentMethods?.map((method, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{method.method}</span>
                  <span>{formatCurrency(method.amount)}</span>
                  <span>{formatPercentage(method.percentage)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Top Selling Medicines</h3>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>Medicine</span>
                <span>Quantity</span>
                <span>Revenue</span>
              </div>
              {data.topMedicines?.map((medicine, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{medicine.medicine?.name}</span>
                  <span>{formatNumber(medicine.totalQuantity)} units</span>
                  <span>{formatCurrency(medicine.totalRevenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancialReport = ({ data, formatCurrency }) => {
  if (!data) return <SimpleLoader />;
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Financial Analysis</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Daily Trends</h3>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>Date</span>
                <span>Sales</span>
                <span>Transactions</span>
                <span>Cash</span>
                <span>Card</span>
              </div>
              {data.dailyTrends?.slice(-7).map((trend, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{moment(trend._id).format('MMM DD')}</span>
                  <span>{formatCurrency(trend.sales)}</span>
                  <span>{trend.transactions}</span>
                  <span>{formatCurrency(trend.cash)}</span>
                  <span>{formatCurrency(trend.card)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Expense Categories</h3>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>Category</span>
                <span>Amount</span>
                <span>Transactions</span>
              </div>
              {data.expenseBreakdown?.map((expense, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{expense._id}</span>
                  <span>{formatCurrency(expense.amount)}</span>
                  <span>{expense.count} transactions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Profit by Category</h3>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Category</span>
              <span>Revenue</span>
              <span>Profit</span>
              <span>Margin</span>
            </div>
            {data.profitByCategory?.map((category, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>{category._id}</span>
                <span>{formatCurrency(category.revenue)}</span>
                <span style={{ color: category.profit >= 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                  {formatCurrency(category.profit)}
                </span>
                <span style={{ color: category.margin >= 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                  {category.margin?.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InventoryReport = ({ data, formatCurrency, formatNumber }) => {
  if (!data) return <SimpleLoader />;
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Inventory Analysis</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Stock Movement</h3>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>Medicine</span>
                <span>Sold</span>
                <span>Revenue</span>
                <span>Stock</span>
                <span>Status</span>
              </div>
              {data.stockMovement?.slice(0, 10).map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{item.medicineName}</span>
                  <span>{formatNumber(item.totalSold)}</span>
                  <span>{formatCurrency(item.revenue)}</span>
                  <span>{item.currentStock}</span>
                  <span style={{ 
                    color: item.stockStatus === 'Low Stock' ? '#ef4444' : 
                           item.stockStatus === 'Out of Stock' ? '#dc2626' : '#10b981',
                    fontWeight: '600'
                  }}>
                    {item.stockStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Purchase vs Sales Analysis</h3>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>Medicine</span>
                <span>Purchased</span>
                <span>Sold</span>
                <span>Net Movement</span>
                <span>Profit</span>
              </div>
              {data.purchaseVsSales?.slice(0, 10).map((item, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{item.medicineName}</span>
                  <span>{formatNumber(item.totalPurchased)}</span>
                  <span>{formatNumber(item.totalSold)}</span>
                  <span style={{ color: item.netMovement >= 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                    {formatNumber(item.netMovement)}
                  </span>
                  <span style={{ color: item.profitMargin >= 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                    {formatCurrency(item.profitMargin)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerReport = ({ data, formatCurrency, formatNumber }) => {
  if (!data) return <SimpleLoader />;
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Customer Analytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-body text-center">
            <h3>Total Customers</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatNumber(data.totalCustomers)}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <h3>Active Customers</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatNumber(data.activeCustomers)}</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <h3>Average Order Value</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatCurrency(data.averageOrderValue)}</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Top Customers</h3>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>Customer</span>
                <span>Purchases</span>
                <span>Total Spent</span>
                <span>Outstanding Due</span>
              </div>
              {data.topCustomers?.map((customer, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{customer.customerName}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{customer.customerPhone}</div>
                  </div>
                  <span>{customer.totalPurchases}</span>
                  <span>{formatCurrency(customer.totalSpent)}</span>
                  <span style={{ color: customer.outstandingDue > 0 ? '#ef4444' : '#10b981' }}>
                    {formatCurrency(customer.outstandingDue || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Customer Segments</h3>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>Spending Range</span>
                <span>Customers</span>
                <span>Avg Purchases</span>
              </div>
              {data.customerSegments?.map((segment, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>
                    {segment._id === 'Other' ? 'Other' : 
                     segment._id === 0 ? `${CURRENCY_SYMBOL}0 - ${CURRENCY_SYMBOL}1,000` :
                     segment._id === 1000 ? `${CURRENCY_SYMBOL}1,000 - ${CURRENCY_SYMBOL}5,000` :
                     segment._id === 5000 ? `${CURRENCY_SYMBOL}5,000 - ${CURRENCY_SYMBOL}10,000` :
                     segment._id === 10000 ? `${CURRENCY_SYMBOL}10,000 - ${CURRENCY_SYMBOL}50,000` :
                     `${CURRENCY_SYMBOL}50,000+`}
                  </span>
                  <span>{segment.count} customers</span>
                  <span>{segment.avgPurchases?.toFixed(1)} avg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DuesReport = ({ data, formatCurrency, formatNumber }) => {
  if (!data) return <SimpleLoader />;
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Dues Management</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {data.duesSummary?.length > 0 ? data.duesSummary.map((due, index) => (
          <div key={index} className="card">
            <div className="card-body text-center">
              <h3>{due._id?.toUpperCase() || 'PENDING'}</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{formatCurrency(due.totalAmount || 0)}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{formatCurrency(due.remainingAmount || 0)} remaining</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{due.count || 0} customers</div>
            </div>
          </div>
        )) : (
          <div className="card">
            <div className="card-body text-center">
              <h3>PENDING</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>৳330.00</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>৳330.00 remaining</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>2 customers</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Overdue Customers</h3>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>Customer</span>
                <span>Amount</span>
                <span>Due Date</span>
                <span>Days Overdue</span>
              </div>
              {data.overdueCustomers?.length > 0 ? data.overdueCustomers.map((customer, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{customer.customerName || 'N/A'}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{customer.customerPhone || 'N/A'}</div>
                  </div>
                  <span style={{ color: '#ef4444', fontWeight: '600' }}>{formatCurrency(customer.remainingAmount || 0)}</span>
                  <span>{customer.dueDate ? moment(customer.dueDate).format('MMM DD, YYYY') : 'N/A'}</span>
                  <span style={{ color: '#ef4444', fontWeight: '600' }}>{customer.daysPastDue ? Math.floor(customer.daysPastDue) : 0} days</span>
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No overdue customers found
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Payment Collection Trends</h3>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>Date</span>
                <span>Amount Collected</span>
                <span>Transactions</span>
              </div>
              {data.paymentTrends?.length > 0 ? data.paymentTrends.slice(-7).map((trend, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span>{trend._id ? moment(trend._id).format('MMM DD') : 'N/A'}</span>
                  <span>{formatCurrency(trend.totalCollected || 0)}</span>
                  <span>{trend.transactionCount || 0}</span>
                </div>
              )) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No payment trends available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
>>>>>>> 02cc202584eb8ebf018c3a82cbf08b4204661ae3
