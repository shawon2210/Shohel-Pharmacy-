import React, { useState, useEffect } from 'react';
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
  FiActivity
} from 'react-icons/fi';
import AnimatedCard from '../../components/UI/AnimatedCard';
import IconGrid from '../../components/UI/IconGrid';
import Background3D from '../../components/UI/Background3D';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/summary');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const featureButtons = [
    {
      id: 'new-sale',
      icon: FiShoppingCart,
      title: 'নতুন বিক্রি',
      subtitle: 'New Sale',
      path: '/sales/new',
      variant: 'secondary',
      description: 'Create new sale transaction',
      priority: 'high',
      badge: dashboardData?.alerts?.lowStock > 0 ? '!' : null,
      tooltip: 'Start a new sale transaction'
    },
    {
      id: 'new-purchase',
      icon: FiPlusCircle,
      title: 'নতুন ক্রয়',
      subtitle: 'New Purchase',
      path: '/purchases/new',
      variant: 'primary',
      description: 'Record new purchase',
      priority: 'high',
      tooltip: 'Add new inventory purchase'
    },
    {
      id: 'medicines',
      icon: FiPackage,
      title: 'পণ্য লিস্ট',
      subtitle: 'Medicine List',
      path: '/medicines',
      variant: 'accent',
      description: 'Manage medicine inventory',
      priority: 'high',
      badge: dashboardData?.alerts?.lowStock || null,
      tooltip: 'Manage medicine inventory'
    },
    {
      id: 'dues',
      icon: FiFileText,
      title: 'ডিউ লিস্ট',
      subtitle: 'Due List',
      path: '/dues',
      variant: 'danger',
      description: 'Track customer dues',
      priority: 'medium',
      badge: dashboardData?.totalDue?.count || null,
      tooltip: 'Track customer payments'
    },
    {
      id: 'expenses',
      icon: FiDollarSign,
      title: 'এক্সপেন্স',
      subtitle: 'Expenses',
      path: '/expenses',
      variant: 'primary',
      description: 'Manage business expenses',
      priority: 'medium',
      tooltip: 'Record business expenses'
    },
    {
      id: 'expiry-alert',
      icon: FiClock,
      title: 'Expiry Alert',
      subtitle: 'Expiring Soon',
      path: '/medicines/alerts/expiring',
      variant: 'danger',
      description: 'Check expiring medicines',
      priority: 'medium',
      badge: dashboardData?.alerts?.expiring || null,
      tooltip: 'Check expiring medicines'
    },
    {
      id: 'reports',
      icon: FiBarChart2,
      title: 'রিপোর্ট',
      subtitle: 'Reports',
      path: '/reports',
      variant: 'primary',
      description: 'View detailed reports',
      priority: 'low',
      tooltip: 'View business analytics'
    },
    {
      id: 'settings',
      icon: FiSettings,
      title: 'সেটিংস',
      subtitle: 'Settings',
      path: '/settings',
      variant: 'glass',
      description: 'System settings',
      priority: 'low',
      tooltip: 'Configure system settings'
    }
  ];

  const handleFeatureClick = (item) => {
    navigate(item.path);
  };

  const getTrendIcon = (change) => {
    if (change > 0) return FiTrendingUp;
    if (change < 0) return FiTrendingDown;
    return FiActivity;
  };

  const getTrendColor = (change) => {
    if (change > 0) return '#10b981';
    if (change < 0) return '#ef4444';
    return '#6b7280';
  };

  if (loading) {
    return (
      <>
        <Background3D variant="medical" />
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Background3D variant="medical" />
      <div className="dashboard">
        <div className="dashboard-container">
          {/* Today's Update Cards */}
          <div className="update-cards">
            <div>
              <AnimatedCard 
                variant="glass" 
                glowColor="#10b981"
                className="sales-card"
              >
                <div className="card-header">
                  <div className="card-icon">
                    <FiShoppingCart />
                  </div>
                  <div className="card-title-section">
                    <h3>আজকের বিক্রি</h3>
                    <span className="card-subtitle">Today's Sales</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="main-stat">
                    ৳{dashboardData?.today?.sales?.amount?.toLocaleString() || '0'}
                  </div>
                  <div className="stat-details">
                    <span className="count">{dashboardData?.today?.sales?.count || 0} বিক্রি</span>
                    <div className={`change-indicator ${dashboardData?.today?.sales?.vsAverage >= 0 ? 'positive' : 'negative'}`}>
                      {React.createElement(getTrendIcon(dashboardData?.today?.sales?.vsAverage), {
                        style: { color: getTrendColor(dashboardData?.today?.sales?.vsAverage) }
                      })}
                      <span className="change-text">
                        {dashboardData?.today?.sales?.vsAverage >= 0 ? '+' : ''}{dashboardData?.today?.sales?.vsAverage || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>

            <div>
              <AnimatedCard 
                variant="glass" 
                glowColor="#3b82f6"
                className="purchase-card"
              >
                <div className="card-header">
                  <div className="card-icon">
                    <FiPlusCircle />
                  </div>
                  <div className="card-title-section">
                    <h3>আজকের ক্রয়</h3>
                    <span className="card-subtitle">Today's Purchase</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="main-stat">
                    ৳{dashboardData?.today?.purchases?.amount?.toLocaleString() || '0'}
                  </div>
                  <div className="stat-details">
                    <span className="count">{dashboardData?.today?.purchases?.count || 0} ক্রয়</span>
                    <div className={`change-indicator ${dashboardData?.today?.purchases?.vsAverage >= 0 ? 'positive' : 'negative'}`}>
                      {React.createElement(getTrendIcon(dashboardData?.today?.purchases?.vsAverage), {
                        style: { color: getTrendColor(dashboardData?.today?.purchases?.vsAverage) }
                      })}
                      <span className="change-text">
                        {dashboardData?.today?.purchases?.vsAverage >= 0 ? '+' : ''}{dashboardData?.today?.purchases?.vsAverage || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>

            <div>
              <AnimatedCard 
                variant="glass" 
                glowColor="#ef4444"
                className="due-card"
              >
                <div className="card-header">
                  <div className="card-icon">
                    <FiFileText />
                  </div>
                  <div className="card-title-section">
                    <h3>মোট ডিউ</h3>
                    <span className="card-subtitle">Total Due</span>
                  </div>
                </div>
                <div className="card-content">
                  <div className="main-stat">
                    ৳{dashboardData?.totalDue?.amount?.toLocaleString() || '0'}
                  </div>
                  <div className="stat-details">
                    <span className="count">{dashboardData?.totalDue?.count || 0} গ্রাহক</span>
                    <div className="change-indicator neutral">
                      <FiActivity style={{ color: '#6b7280' }} />
                      <span className="change-text">মোট</span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </div>

          {/* Feature Buttons Grid */}
          <div className="feature-section">
            <h2 className="section-title">
              <FiActivity className="section-icon" />
              Quick Actions
            </h2>
            <IconGrid
              items={featureButtons}
              columns={{ desktop: 4, tablet: 3, mobile: 2 }}
              gap="1.25rem"
              variant="default"
              onItemClick={handleFeatureClick}
              className="dashboard-grid"
            />
          </div>

          {/* Alerts Section */}
          {(dashboardData?.alerts?.lowStock > 0 || dashboardData?.alerts?.expiring > 0) && (
            <div className="alerts-section">
              <h2 className="section-title">
                <FiAlertTriangle className="section-icon" />
                Alerts
              </h2>
              <div className="alert-cards">
                {dashboardData?.alerts?.lowStock > 0 && (
                  <div>
                    <AnimatedCard 
                      variant="glass" 
                      glowColor="#f59e0b"
                      className="alert-card low-stock"
                    >
                      <div className="alert-icon">
                        <FiAlertTriangle />
                      </div>
                      <div className="alert-content">
                        <h4>Low Stock Alert</h4>
                        <p>{dashboardData.alerts.lowStock} medicines are running low</p>
                      </div>
                      <button 
                        className="alert-action"
                        onClick={() => navigate('/medicines/alerts/low-stock')}
                      >
                        View
                      </button>
                    </AnimatedCard>
                  </div>
                )}
                
                {dashboardData?.alerts?.expiring > 0 && (
                  <div>
                    <AnimatedCard 
                      variant="glass" 
                      glowColor="#ef4444"
                      className="alert-card expiring"
                    >
                      <div className="alert-icon">
                        <FiClock />
                      </div>
                      <div className="alert-content">
                        <h4>Expiry Alert</h4>
                        <p>{dashboardData.alerts.expiring} medicines expiring soon</p>
                      </div>
                      <button 
                        className="alert-action"
                        onClick={() => navigate('/medicines/alerts/expiring')}
                      >
                        View
                      </button>
                    </AnimatedCard>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;