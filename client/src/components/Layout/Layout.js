import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BottomNavigation from './BottomNavigation';
import TopBar from './TopBar';
import Background3D from '../UI/Background3D';
import './Layout.css';

const Layout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="layout">
      <Background3D variant="medical" />
      <TopBar user={user} />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNavigation currentPath={location.pathname} />
    </div>
  );
};

export default Layout;