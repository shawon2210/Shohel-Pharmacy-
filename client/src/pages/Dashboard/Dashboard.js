import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingCart,
  FiPackage,
  FiPlusCircle,
  FiFileText,
  FiDollarSign,
  FiAlertTriangle,
  FiBarChart2,
  FiSettings,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/summary', {
        params: { date: selectedDate.toISOString() }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Bengali date formatting
  const formatBengaliDate = (date) => {
    const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];
    const months = ['জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুল', 'আগ', 'সেপ্ট', 'অক্ট', 'নভ', 'ডিস'];
    
    const dayName = days[date.getDay()];
    const dateNum = date.getDate();
    const monthName = months[date.getMonth()];
    
    // Convert to Bengali numerals
    const toBengaliNum = (num) => {
      const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return num.toString().split('').map(d => bengaliDigits[parseInt(d)]).join('');
    };
    
    return `${dayName}, ${toBengaliNum(dateNum)} ${monthName}`;
  };

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  // Sparkline data from last 7 days
  const getSparklineData = (type) => {
    if (!dashboardData?.sparklines) return [0, 0, 0, 0, 0, 0, 0];
    
    // If profit type requested, calculate from sales - purchases
    if (type === 'profit') {
      const salesData = dashboardData.sparklines.sales || [0, 0, 0, 0, 0, 0, 0];
      const purchasesData = dashboardData.sparklines.purchases || [0, 0, 0, 0, 0, 0, 0];
      return salesData.map((sale, idx) => sale - (purchasesData[idx] || 0));
    }
    
    return dashboardData.sparklines[type] || [0, 0, 0, 0, 0, 0, 0];
  };

  const getTrendIcon = (change) => {
    if (change > 0) return <FiTrendingUp />;
    if (change < 0) return <FiTrendingDown />;
    return <FiActivity />;
  };

  // Cash flow bar calculation
  const cashFlowData = useMemo(() => {
    if (!dashboardData) return { sales: 0, purchases: 0, due: 0, total: 1 };
    const sales = dashboardData.today?.sales?.amount || 0;
    const purchases = dashboardData.today?.purchases?.amount || 0;
    const due = dashboardData.totalDue?.amount || 0;
    const total = sales + purchases + due || 1;
    return {
      sales,
      purchases,
      due,
      total,
      salesPct: ((sales / total) * 100).toFixed(1),
      purchasesPct: ((purchases / total) * 100).toFixed(1),
      duePct: ((due / total) * 100).toFixed(1)
    };
  }, [dashboardData]);

  // Quick Actions Grid - 4x2 with priority
  const quickActions = [
    {
      id: 'new-sale',
      icon: FiShoppingCart,
      title: 'বিক্রি',
      subtitle: 'New Sale',
      path: '/sales/new',
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-light)',
      badge: null
    },
    {
      id: 'new-purchase',
      icon: FiPlusCircle,
      title: 'ক্রয়',
      subtitle: 'New Purchase',
      path: '/purchases/new',
      color: 'var(--color-info)',
      bgColor: 'var(--color-info-light)',
      badge: null
    },
    {
      id: 'medicines',
      icon: FiPackage,
      title: 'পণ্য',
      subtitle: 'Products',
      path: '/medicines',
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-light)',
      badge: dashboardData?.alerts?.lowStock || null
    },
    {
      id: 'dues',
      icon: FiFileText,
      title: 'ডিউ',
      subtitle: 'Due List',
      path: '/dues',
      color: 'var(--color-danger)',
      bgColor: 'var(--color-danger-light)',
      badge: dashboardData?.totalDue?.count || null
    },
    {
      id: 'expenses',
      icon: FiDollarSign,
      title: 'এক্সপেন্স',
      subtitle: 'Expenses',
      path: '/expenses',
      color: 'var(--color-gray-600)',
      bgColor: 'var(--color-gray-100)',
      badge: null
    },
    {
      id: 'expiry',
      icon: FiClock,
      title: 'মেয়াদ',
      subtitle: 'Expiry',
      path: '/medicines/alerts/expiring',
      color: 'var(--color-danger)',
      bgColor: 'var(--color-danger-light)',
      badge: dashboardData?.alerts?.expiring || null
    },
    {
      id: 'reports',
      icon: FiBarChart2,
      title: 'রিপোর্ট',
      subtitle: 'Reports',
      path: '/reports',
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-light)',
      badge: null
    },
    {
      id: 'settings',
      icon: FiSettings,
      title: 'সেটিংস',
      subtitle: 'Settings',
      path: '/settings',
      color: 'var(--color-gray-600)',
      bgColor: 'var(--color-gray-100)',
      badge: null
    }
  ];

  const handleQuickAction = (action) => {
    navigate(action.path);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: 'মিনিট', seconds: 60 },
      { label: 'ঘন্টা', seconds: 3600 },
      { label: 'দিন', seconds: 86400 }
    ];
    for (let i = intervals.length - 1; i >= 0; i--) {
      const interval = intervals[i];
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        const bengaliNum = count.toString().split('').map(d => 
          ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'][parseInt(d)]
        ).join('');
        return `${bengaliNum} ${interval.label} আগে`;
      }
    }
    return 'এইমাত্র';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-container">
          {/* Sticky Date Strip Skeleton */}
          <div className="date-strip-skeleton">
            <div className="skeleton skeleton-sm" style={{width: '80px'}}></div>
            <div className="skeleton skeleton-md" style={{width: '120px'}}></div>
            <div className="skeleton skeleton-sm" style={{width: '80px'}}></div>
          </div>

          {/* KPI Cards Skeleton */}
          <div className="kpi-cards-skeleton">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton skeleton-icon"></div>
                <div className="skeleton skeleton-text" style={{width: '60%'}}></div>
                <div className="skeleton skeleton-stat"></div>
                <div className="skeleton skeleton-sparkline"></div>
              </div>
            ))}
          </div>

          {/* Cash Flow Bar Skeleton */}
          <div className="skeleton" style={{height: '60px', margin: 'var(--space-4) 0'}}></div>

          {/* Quick Actions Skeleton */}
          <div className="skeleton-grid">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="skeleton skeleton-action"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* ========== 1. STICKY DATE STRIP ========== */}
        <div className="date-strip">
          <button 
            className="date-arrow"
            onClick={() => handleDateChange(-1)}
            aria-label="Previous day"
          >
            <FiChevronLeft />
          </button>
          
          <button 
            className="date-display"
            onClick={() => setShowDatePicker(true)}
            aria-label="Select date"
          >
            <FiCalendar size={14} />
            <span className="bengali-text">{formatBengaliDate(selectedDate)}</span>
          </button>
          
          <button 
            className="date-arrow"
            onClick={() => handleDateChange(1)}
            aria-label="Next day"
          >
            <FiChevronRight />
          </button>
        </div>

        {/* ========== 2. KPI CARDS ========== */}
        <div className="kpi-cards">
          {/* Sales Card */}
          <div className="kpi-card glass-card">
            <div className="kpi-header">
              <div className="kpi-icon sales">
                <FiShoppingCart />
              </div>
              <div className="kpi-title-section">
                <h3>আজকের বিক্রি</h3>
                <span className="kpi-subtitle">Today's Sales</span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-amount">
                ৳{dashboardData?.today?.sales?.amount?.toLocaleString() || '0'}
              </div>
              <div className="kpi-meta">
                <span className="kpi-count">{dashboardData?.today?.sales?.count || 0} বিক্রি</span>
                <div className={`kpi-trend ${dashboardData?.today?.sales?.vsAverage >= 0 ? 'positive' : 'negative'}`}>
                  {getTrendIcon(dashboardData?.today?.sales?.vsAverage)}
                  <span>{dashboardData?.today?.sales?.vsAverage >= 0 ? '+' : ''}{dashboardData?.today?.sales?.vsAverage || 0}%</span>
                </div>
              </div>
              <div className="kpi-sparkline">
                <ResponsiveContainer width={120} height={40}>
                  <AreaChart data={getSparklineData('sales').map((value, index) => ({value, index}))}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--color-success)" 
                      strokeWidth={2}
                      fill="url(#colorSales)"
                      animationDuration={300}
                    />
                    <Tooltip 
                      contentStyle={{display: 'none'}}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Purchase Card */}
          <div className="kpi-card glass-card">
            <div className="kpi-header">
              <div className="kpi-icon purchase">
                <FiPlusCircle />
              </div>
              <div className="kpi-title-section">
                <h3>আজকের ক্রয়</h3>
                <span className="kpi-subtitle">Today's Purchase</span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-amount">
                ৳{dashboardData?.today?.purchases?.amount?.toLocaleString() || '0'}
              </div>
              <div className="kpi-meta">
                <span className="kpi-count">{dashboardData?.today?.purchases?.count || 0} ক্রয়</span>
                <div className={`kpi-trend ${dashboardData?.today?.purchases?.vsAverage >= 0 ? 'positive' : 'negative'}`}>
                  {getTrendIcon(dashboardData?.today?.purchases?.vsAverage)}
                  <span>{dashboardData?.today?.purchases?.vsAverage >= 0 ? '+' : ''}{dashboardData?.today?.purchases?.vsAverage || 0}%</span>
                </div>
              </div>
              <div className="kpi-sparkline">
                <ResponsiveContainer width={120} height={40}>
                  <AreaChart data={getSparklineData('purchases').map((value, index) => ({value, index}))}>
                    <defs>
                      <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--color-info)" 
                      strokeWidth={2}
                      fill="url(#colorPurchase)"
                      animationDuration={300}
                    />
                    <Tooltip 
                      contentStyle={{display: 'none'}}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Due Card */}
          <div className="kpi-card glass-card">
            <div className="kpi-header">
              <div className="kpi-icon due">
                <FiFileText />
              </div>
              <div className="kpi-title-section">
                <h3>মোট ডিউ</h3>
                <span className="kpi-subtitle">Total Due</span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-amount">
                ৳{dashboardData?.totalDue?.amount?.toLocaleString() || '0'}
              </div>
              <div className="kpi-meta">
                <span className="kpi-count">{dashboardData?.totalDue?.count || 0} গ্রাহক</span>
                <div className="kpi-trend neutral">
                  <FiActivity />
                  <span>মোট</span>
                </div>
              </div>
              <div className="kpi-sparkline">
                <ResponsiveContainer width={120} height={40}>
                  <AreaChart data={getSparklineData('due').map((value, index) => ({value, index}))}>
                    <defs>
                      <linearGradient id="colorDue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--color-danger)" 
                      strokeWidth={2}
                      fill="url(#colorDue)"
                      animationDuration={300}
                    />
                    <Tooltip 
                      contentStyle={{display: 'none'}}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Profit Card */}
          <div className="kpi-card glass-card">
            <div className="kpi-header">
              <div className="kpi-icon profit">
                <FiTrendingUp />
              </div>
              <div className="kpi-title-section">
                <h3>আজকের লাভ</h3>
                <span className="kpi-subtitle">Today's Profit</span>
              </div>
            </div>
            <div className="kpi-content">
              <div className="kpi-amount">
                ৳{((dashboardData?.today?.sales?.amount || 0) - (dashboardData?.today?.purchases?.amount || 0)).toLocaleString()}
              </div>
              <div className="kpi-meta">
                <span className="kpi-count">বিক্রি - ক্রয়</span>
                <div className={`kpi-trend ${(dashboardData?.today?.sales?.amount || 0) - (dashboardData?.today?.purchases?.amount || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {getTrendIcon((dashboardData?.today?.sales?.amount || 0) - (dashboardData?.today?.purchases?.amount || 0))}
                  <span>
                    {(dashboardData?.today?.sales?.amount || 0) - (dashboardData?.today?.purchases?.amount || 0) >= 0 ? '+' : ''}
                    {(((dashboardData?.today?.sales?.amount || 0) - (dashboardData?.today?.purchases?.amount || 0)) / (dashboardData?.today?.sales?.amount || 1) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="kpi-sparkline">
                <ResponsiveContainer width={120} height={40}>
                  <AreaChart data={getSparklineData('profit').map((value, index) => ({value, index}))}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--color-warning)" 
                      strokeWidth={2}
                      fill="url(#colorProfit)"
                      animationDuration={300}
                    />
                    <Tooltip 
                      contentStyle={{display: 'none'}}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ========== 3. CASH FLOW BAR ========== */}
        <div className="cash-flow-section">
          <h3 className="section-title">ক্যাশ ফ্লো</h3>
          <div className="cash-flow-bar">
            <div className="cash-flow-segments">
              {cashFlowData.sales > 0 && (
                <div 
                  className="cash-segment sales" 
                  style={{width: `${cashFlowData.salesPct}%`}}
                  title={`Sales: ৳${cashFlowData.sales.toLocaleString()}`}
                ></div>
              )}
              {cashFlowData.purchases > 0 && (
                <div 
                  className="cash-segment purchase" 
                  style={{width: `${cashFlowData.purchasesPct}%`}}
                  title={`Purchases: ৳${cashFlowData.purchases.toLocaleString()}`}
                ></div>
              )}
              {cashFlowData.due > 0 && (
                <div 
                  className="cash-segment due" 
                  style={{width: `${cashFlowData.duePct}%`}}
                  title={`Due: ৳${cashFlowData.due.toLocaleString()}`}
                ></div>
              )}
            </div>
            <div className="cash-flow-labels">
              <span className="cash-label-start">৳{cashFlowData.sales.toLocaleString()}</span>
              <span className="cash-label-end">৳{cashFlowData.due.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ========== 4. QUICK ACTIONS GRID ========== */}
        <div className="quick-actions-section">
          <h3 className="section-title">দ্রুত কাজ</h3>
          <div className="quick-actions-grid">
            {quickActions.map(action => (
              <button
                key={action.id}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action)}
                aria-label={action.title}
              >
                <div className="action-icon-wrapper" style={{backgroundColor: action.bgColor}}>
                  <action.icon size={28} color={action.color} />
                  {action.badge > 0 && (
                    <span className="action-badge">{action.badge}</span>
                  )}
                </div>
                <span className="action-title bengali-text">{action.title}</span>
                <span className="action-subtitle">{action.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========== 5. LAST ACTIVITY FEED ========== */}
        <div className="activity-section">
          <h3 className="section-title">সাম্প্রতিক লেনদেন</h3>
          <div className="activity-feed">
            {dashboardData?.recentTransactions?.slice(0, 5).map((txn, idx) => (
              <div 
                key={idx} 
                className="activity-row"
                onClick={() => navigate(`/${txn.type === 'sale' ? 'sales' : 'purchases'}/${txn.id}`)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && navigate(`/${txn.type === 'sale' ? 'sales' : 'purchases'}/${txn.id}`)}
              >
                <div className="activity-avatar" style={{
                  backgroundColor: txn.type === 'sale' ? 'var(--color-success-light)' : 'var(--color-info-light)',
                  color: txn.type === 'sale' ? 'var(--color-success)' : 'var(--color-info)'
                }}>
                  {getInitials(txn.customerName)}
                </div>
                <div className="activity-details">
                  <div className="activity-type-chip" style={{
                    backgroundColor: txn.type === 'sale' ? 'var(--color-success-light)' : 'var(--color-info-light)',
                    color: txn.type === 'sale' ? 'var(--color-success)' : 'var(--color-info)'
                  }}>
                    {txn.type === 'sale' ? 'বিক্রি' : 'ক্রয়'}
                  </div>
                  <span className="activity-customer bengali-text">{txn.customerName}</span>
                </div>
                <div className="activity-amount-section">
                  <span className="activity-amount" style={{
                    color: txn.type === 'sale' ? 'var(--color-success)' : 'var(--color-danger)'
                  }}>
                    {txn.type === 'sale' ? '+' : '-'}৳{txn.amount?.toLocaleString()}
                  </span>
                  <span className="activity-time">{getTimeAgo(txn.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== 6. ALERT BANNER ========== */}
        {(dashboardData?.alerts?.lowStock > 0 || dashboardData?.alerts?.expiring > 0) && !dismissedAlerts.length && (
          <div className="alert-banner" role="alert">
            <div className="alert-content" onClick={() => navigate('/medicines/alerts')}>
              <FiAlertTriangle size={20} />
              <div className="alert-text">
                {dashboardData?.alerts?.lowStock > 0 && (
                  <span>{dashboardData.alerts.lowStock} পণ্য স্টক কম <strong>•</strong> </span>
                )}
                {dashboardData?.alerts?.expiring > 0 && (
                  <span>{dashboardData.alerts.expiring} পণ্য মেয়াদোত্তীর্ণ হচ্ছে</span>
                )}
              </div>
            </div>
            <button 
              className="alert-dismiss"
              onClick={() => setDismissedAlerts([...dismissedAlerts, 'main'])}
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========== DATE PICKER BOTTOM SHEET ========== */}
        {showDatePicker && (
          <div className="bottom-sheet-overlay" onClick={() => setShowDatePicker(false)}>
            <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="bottom-sheet-handle"></div>
              <h3 className="bengali-text">তারিখ নির্বাচন করুন</h3>
              <div className="date-picker-grid">
                {[...Array(7)].map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - 3 + i);
                  return (
                    <button
                      key={i}
                      className={`date-picker-option ${d.toDateString() === selectedDate.toDateString() ? 'active' : ''}`}
                      onClick={() => handleDateSelect(d)}
                    >
                      <span className="bengali-text">{formatBengaliDate(d)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
