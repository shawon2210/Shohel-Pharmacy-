import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAllItems, setShowAllItems] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mounted, setMounted] = useState(false);
  const [ripple, setRipple] = useState({ x: 0, y: 0, visible: false });
  const navRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    setMounted(true);
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close expanded menu on route change
  useEffect(() => {
    if (showAllItems && isMobile) {
      setShowAllItems(false);
    }
  }, [location.pathname, showAllItems, isMobile]);

  const handleNavigation = useCallback((path, event) => {
    // Haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(10); // Very short vibration for tap feedback
    }
    
    // Ripple effect with precise positioning
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      setRipple({ x, y, visible: true });
      setTimeout(() => setRipple({ x: 0, y: 0, visible: false }), 600);
    }
    
    navigate(path);
  }, [navigate]);

  const navItems = useMemo(() => [
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
  ], []);

  const isActive = useCallback((item) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(item.path.split('/new')[0]);
  }, [location.pathname]);

  const getDisplayItems = useCallback(() => {
    if (!isMobile) {
      return navItems;
    }
    
    if (showAllItems) {
      return navItems;
    }
    
    return navItems.filter(item => item.priority === 'high');
  }, [isMobile, showAllItems, navItems]);

  const displayItems = getDisplayItems();
  const hasMoreItems = isMobile && !showAllItems && navItems.some(item => item.priority !== 'high');

  if (!mounted) return null;

  return (
    <nav 
      className="bottom-navigation" 
      role="navigation" 
      aria-label="Main navigation"
      ref={navRef}
    >
      <div className={`nav-items ${showAllItems ? 'expanded' : ''}`}>
        {displayItems.map((item, index) => {
          const IconComponent = item.icon;
          const active = isActive(item);
          
          return (
            <button
              key={item.path}
              className={`nav-item ${active ? 'active' : ''} ${item.isPrimary ? 'primary' : ''}`}
              type="button"
              onClick={(e) => handleNavigation(item.path, e)}
              title={item.name}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              style={{
                '--item-index': index,
                '--ripple-x': `${ripple.x}px`,
                '--ripple-y': `${ripple.y}px`
              }}
            >
              <span className="nav-icon" aria-hidden="true">
                <IconComponent />
              </span>
              <span className="nav-label">
                {item.label}
              </span>
              
              {active && (
                <div className="active-indicator" />
              )}
              
              {ripple.visible && (
                <div 
                  className="nav-ripple"
                  style={{
                    left: `${ripple.x}px`,
                    top: `${ripple.y}px`
                  }}
                />
              )}
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
            aria-expanded={false}
          >
            <span className="nav-icon" aria-hidden="true">
              <FiMoreHorizontal />
            </span>
            <span className="nav-label">আরো</span>
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
            </span>
            <span className="nav-label">কম</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default React.memo(BottomNavigation);
