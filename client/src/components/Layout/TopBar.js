import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut, FiActivity, FiAlertTriangle, FiInfo, FiAlertCircle, FiDollarSign, FiPackage, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import axios from 'axios';
import './TopBar.css';
import { useCallback } from 'react';
import { io as ioClient } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const TopBar = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'expiry':
      case 'warning':
        return <FiAlertTriangle className="notif-icon" />;
      case 'due':
        return <FiDollarSign className="notif-icon" />;
      case 'stock':
        return <FiPackage className="notif-icon" />;
      case 'sale':
      case 'purchase':
        return <FiShoppingCart className="notif-icon" />;
      case 'danger':
        return <FiAlertCircle className="notif-icon" />;
      case 'info':
      default:
        return <FiInfo className="notif-icon" />;
    }
  };

  // Fetch notifications (low stock, expiring, overdue dues)
  const fetchNotifications = useCallback(async () => {
    try {
      // sync server-generated alerts into notifications store
      await axios.post('/api/notifications/sync-alerts');

      // fetch persisted notifications for user
      const resp = await axios.get('/api/notifications');
      const items = resp.data || [];

      // group by type for visuals
      const grouped = items.map(i => ({
        id: i._id,
        type: i.type || 'info',
        title: i.title,
        message: i.message,
        time: i.createdAt,
        link: i.link,
        isRead: i.isRead
      }));

      setNotifications(grouped);
      setNotificationCount(grouped.filter(x => !x.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []); // no external deps; fetch will call server which uses token

  const markAllRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotificationCount(0);
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const dismissNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setNotificationCount(prev => Math.max(prev - 1, 0));
    } catch (e) {
      console.error('Failed to dismiss notification', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds as fallback
    const interval = setInterval(fetchNotifications, 30000);

    // Setup socket.io
    let socket;
    try {
      // Prefer an explicit backend socket URL (set REACT_APP_SOCKET_URL in .env),
      // otherwise default to same host but backend port 5001 which is the server in this repo.
      const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:5001`;
      socket = ioClient(SOCKET_URL, { transports: ['websocket'] });

      socket.on('connect', () => {
        console.debug('Socket connected', socket.id, 'to', SOCKET_URL);
      });

      socket.on('connect_error', (err) => {
        console.warn('Socket connect error', err && (err.message || err));
      });

      socket.on('notification:created', (notif) => {
        // Prepend the incoming notification.
        setNotifications(prev => [{
          id: notif._id || notif.id,
          type: notif.type || 'info',
          title: notif.title,
          message: notif.message,
          time: notif.createdAt || notif.created_at || new Date().toISOString(),
          link: notif.link,
          isRead: notif.isRead
        }, ...prev]);
        setNotificationCount(prev => prev + 1);
      });
    } catch (e) {
      console.warn('Socket.io client failed to initialize', e && (e.message || e));
    }

    return () => {
      clearInterval(interval);
      try { if (socket) socket.disconnect(); } catch (e) {}
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-btn') && !event.target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);


  return (
    <header className="top-bar">
      <div className="top-bar-content">
        <div className="logo-section">
          <div className="logo-icon">
            <FiActivity />
          </div>
          <h1 className="app-title">Shohel Pharmacy</h1>
        </div>
        
        <div className="user-section">
          <div className="user-info">
            <span className="user-name">{user?.name || user?.username}</span>
            <span className="user-role">{user?.role || 'Admin'}</span>
          </div>
          
          <div className="top-bar-actions">
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              aria-label="Notifications"
            >
              <FiBell />
              {notificationCount > 0 && (
                <div className="notification-badge">{notificationCount}</div>
              )}
            </button>
            
            <button 
              className="logout-btn"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="mobile-user-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mobile-user-info">
              <span className="mobile-user-name">{user?.name || user?.username}</span>
              <span className="mobile-user-role">{user?.role || 'Admin'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="notifications-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-controls">
                {notificationCount > 0 && (
                  <button className="mark-all-btn" onClick={markAllRead}>Mark all read</button>
                )}
                <span className="notification-count">{notificationCount}</span>
              </div>
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-item no-notifications">
                  <div className="notification-icon">
                    <FiActivity className="notif-icon" />
                  </div>
                  <div className="notification-content">
                    <p>No new notifications</p>
                    <span className="notification-time">All clear</span>
                  </div>
                </div>
              ) : (
                notifications.map((notification) => {
                  return (
                    <motion.div 
                      key={notification.id}
                      className={`notification-item ${notification.type} ${notification.isRead ? 'read' : 'unread'}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="notification-icon">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-content" onClick={() => {
                        // navigate to link if present
                        if (notification.link) navigate(notification.link);
                        // optionally mark read
                        axios.post(`/api/notifications/${notification.id}/read`).catch(() => {});
                        setNotifications(prev => prev.map(n => n.id === notifi