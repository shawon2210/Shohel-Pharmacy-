import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiShoppingCart, 
  FiPackage, 
  FiPlusCircle,
  FiDollarSign,
  FiFileText,
  FiBarChart2,
  FiMoreHorizontal,
  FiChevronUp
} from 'react-icons/fi';
import './BottomNavigation.css';

const BottomNavigation = ({ currentPath }) => {
  const navigate = useNavigate();
  const [showAllItems, setShowAllItems] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    setMounted(true);
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  const navItems = [
    {
      path: '/',
      icon: FiHome,
      label: 'হোম',
      name: 'Home',
      priority: 'high'
    },
    {
      path: '/sales/new',
      icon: FiShoppingCart,
      label: 'বিক্রি',
      name: 'New Sale',
      priority: 'high',
      isPrimary: true
    },
    {
      path: '/medicines',
      icon: FiPackage,
      label: 'পণ্য',
      name: 'Medicines',
      priority: 'high'
    },
    {
      path: '/purchases/new',
      icon: FiPlusCircle,
      label: 'ক্রয়',
      name: 'Purchase',
      priority: 'medium'
    },
    {
      path: '/dues',
      icon: FiFileText,
      label: 'ডিউ',
      name: 'Dues',
      priority: 'medium'
    },
    {
      path: '/expenses',
      icon: FiDollarSign,
      label: 'খরচ',
      name: 'Expenses',
      priority: 'low'
    },
    {
      path: '/reports',
      icon: FiBarChart2,
      label: 'রিপোর্ট',
      name: 'Reports',
      priority: 'low'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getDisplayItems = () => {
    if (!isMobile) {
      return navItems;
    }
    
    if (showAllItems) {
      return navItems;
    }
    
    return navItems.filter(item => item.priority === 'high');
  };

  const displayItems = getDisplayItems();
  const hasMoreItems = isMobile && !showAllItems && navItems.some(item => item.priority !== 'high');

  return (
    <nav className="bottom-navigation">
      <div className="nav-items">
        {displayItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = currentPath === item.path || 
            (item.path === '/sales/new' && currentPath.startsWith('/sales')) ||
            (item.path === '/medicines' && currentPath.startsWith('/medicines')) ||
            (item.path === '/purchases/new' && currentPath.startsWith('/purchases'));
          
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''} ${item.isPrimary ? 'primary' : ''}`}
              type="button"
              onClick={() => handleNavigation(item.path)}
              title={item.name}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              onMouseEnter={(e) => {
                e.currentTarget.style.setProperty('--hover-delay', `${index * 0.1}s`);
              }}
            >
              <span className="nav-icon" aria-hidden="true">
                <IconComponent />
                <div className="icon-glow" />
              </span>
              <span className="nav-label">
                {item.label}
              </span>
              
              {isActive && (
                <div className="active-indicator" />
              )}
              
              <div className="nav-ripple" />
            </button>
          );
        })}
        
        {hasMoreItems && (
          <button
            className="nav-item more-button"
            type="button"
            onClick={() => setShowAllItems(true)}
            title="Show More Options"
            aria-label="Show more navigation options"
          >
            <span className="nav-icon" aria-hidden="true">
              <FiMoreHorizontal />
              <div className="icon-glow" />
            </span>
            <span className="nav-label">আরো</span>
            <div className="nav-ripple" />
          </button>
        )}
        
        {isMobile && showAllItems && (
          <button
            className="nav-item less-button"
            type="button"
            onClick={() => setShowAllItems(false)}
            title="Show Less"
            aria-label="Show fewer navigation options"
          >
            <span className="nav-icon" aria-hidden="true">
              <FiChevronUp />
              <div className="icon-glow" />
            </span>
            <span className="nav-label">কম</span>
            <div className="nav-ripple" />
          </button>
        )}
      </div>
    </nav>
  );
};

export default BottomNavigation;