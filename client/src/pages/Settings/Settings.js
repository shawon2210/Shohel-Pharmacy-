import React, { useState } from 'react';
import { FaUser, FaBell, FaPalette, FaInfoCircle, FaSave } from 'react-icons/fa';
import './Settings.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('notifications');

  const [notificationSettings, setNotificationSettings] = useState({
    masterSwitch: true,
    lowStock: true,
    outOfStock: false,
    expiringSoon: true,
    upcomingDues: true,
    overdueDues: true,
    saleConfirmation: true,
    purchaseConfirmation: false,
  });

  const [profileSettings, setProfileSettings] = useState({
    name: 'Admin User',
    email: 'admin@pharmacy.com',
    phone: '123-456-7890',
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
  });

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleProfileChange = (e) => {
    setProfileSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAppearanceChange = (setting, value) => {
    setAppearanceSettings(prev => ({ ...prev, [setting]: value }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings settings={profileSettings} handleChange={handleProfileChange} />;
      case 'notifications':
        return <NotificationSettings settings={notificationSettings} handleChange={handleNotificationChange} />;
      case 'appearance':
        return <AppearanceSettings settings={appearanceSettings} handleChange={handleAppearanceChange} />;
      case 'about':
        return <AboutSection />;
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your application settings and preferences.</p>
      </div>
      <div className="settings-layout">
        <div className="settings-sidebar">
          <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}><FaUser /> Profile</button>
          <button onClick={() => setActiveTab('notifications')} className={activeTab === 'notifications' ? 'active' : ''}><FaBell /> Notifications</button>
          <button onClick={() => setActiveTab('appearance')} className={activeTab === 'appearance' ? 'active' : ''}><FaPalette /> Appearance</button>
          <button onClick={() => setActiveTab('about')} className={activeTab === 'about' ? 'active' : ''}><FaInfoCircle /> About</button>
        </div>
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="toggle-switch">
    <div className="toggle-info">
      <label>{label}</label>
      {description && <span>{description}</span>}
    </div>
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  </div>
);

const NotificationSettings = ({ settings, handleChange }) => (
  <div className="settings-section">
    <h2><FaBell /> Notification Settings</h2>
    <div className="settings-card">
      <Toggle label="Enable All Notifications" checked={settings.masterSwitch} onChange={() => handleChange('masterSwitch')} />
      <hr />
      <h4>Stock Alerts</h4>
      <Toggle label="Low Stock Warnings" description="Notify when stock is below threshold" checked={settings.lowStock} onChange={() => handleChange('lowStock')} />
      <Toggle label="Out of Stock Alerts" description="Notify when an item is sold out" checked={settings.outOfStock} onChange={() => handleChange('outOfStock')} />
      <Toggle label="Expiring Soon" description="Notify about items nearing their expiry date" checked={settings.expiringSoon} onChange={() => handleChange('expiringSoon')} />
      <hr />
      <h4>Due Reminders</h4>
      <Toggle label="Upcoming Due Dates" description="Reminders for dues approaching their due date" checked={settings.upcomingDues} onChange={() => handleChange('upcomingDues')} />
      <Toggle label="Overdue Dues" description="Alerts for dues that have passed their due date" checked={settings.overdueDues} onChange={() => handleChange('overdueDues')} />
      <hr />
      <h4>Transactions</h4>
      <Toggle label="Sale Confirmations" description="Receive a notification for every sale" checked={settings.saleConfirmation} onChange={() => handleChange('saleConfirmation')} />
      <Toggle label="Purchase Confirmations" description="Receive a notification for every purchase" checked={settings.purchaseConfirmation} onChange={() => handleChange('purchaseConfirmation')} />
    </div>
    <div className="section-footer">
        <button className="save-btn"><FaSave /> Save Changes</button>
    </div>
  </div>
);

const ProfileSettings = ({ settings, handleChange }) => (
    <div className="settings-section">
        <h2><FaUser /> Profile Settings</h2>
        <div className="settings-card">
            <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" value={settings.name} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" value={settings.email} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" value={settings.phone} onChange={handleChange} />
            </div>
        </div>
        <div className="section-footer">
            <button className="save-btn"><FaSave /> Save Changes</button>
        </div>
    </div>
);

const AppearanceSettings = ({ settings, handleChange }) => (
    <div className="settings-section">
        <h2><FaPalette /> Appearance</h2>
        <div className="settings-card">
            <h4>Theme</h4>
            <div className="choice-group">
                <button onClick={() => handleChange('theme', 'light')} className={settings.theme === 'light' ? 'active' : ''}>Light</button>
                <button onClick={() => handleChange('theme', 'dark')} className={settings.theme === 'dark' ? 'active' : ''}>Dark</button>
                <button onClick={() => handleChange('theme', 'system')} className={settings.theme === 'system' ? 'active' : ''}>System</button>
            </div>
            <hr />
            <h4>Font Size</h4>
            <div className="choice-group">
                <button onClick={() => handleChange('fontSize', 'small')} className={settings.fontSize === 'small' ? 'active' : ''}>Small</button>
                <button onClick={() => handleChange('fontSize', 'medium')} className={settings.fontSize === 'medium' ? 'active' : ''}>Medium</button>
                <button onClick={() => handleChange('fontSize', 'large')} className={settings.fontSize === 'large' ? 'active' : ''}>Large</button>
            </div>
        </div>
        <div className="section-footer">
            <button className="save-btn"><FaSave /> Save Changes</button>
        </div>
    </div>
);

const AboutSection = () => (
    <div className="settings-section">
        <h2><FaInfoCircle /> About</h2>
        <div className="settings-card about-card">
            <h3>Shohel Pharmacy Management</h3>
            <p>Version 1.0.0</p>
            <p>&copy; 2025 Shohel Pharmacy. All Rights Reserved.</p>
            <div className="links">
                <a href="#!">Website</a>
                <a href="#!">Support</a>
                <a href="#!">Privacy Policy</a>
            </div>
        </div>
    </div>
);

export default Settings;
