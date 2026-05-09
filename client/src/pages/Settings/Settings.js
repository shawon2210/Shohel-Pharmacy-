import React, { useState } from 'react';
import { FiUser, FiBell, FiSliders, FiInfo, FiSave, FiAlertTriangle, FiGlobe } from 'react-icons/fi';
import './Settings.css';
import { useTheme } from '../../context/ThemeContext';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const { theme, setTheme } = useTheme();

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
    name: 'Admin User / অ্যাডমিন',
    email: 'admin@pharmacy.com',
    phone: '123-456-7890',
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: theme || 'light',
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
    // Apply theme immediately
    if (setting === 'theme') {
      setTheme(value);
    }
  };

  const handleSave = () => {
    // Simulate save
    alert('Settings saved successfully! / সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings settings={profileSettings} handleChange={handleProfileChange} handleSave={handleSave} />;
      case 'notifications':
        return <NotificationSettings settings={notificationSettings} handleChange={handleNotificationChange} handleSave={handleSave} />;
      case 'appearance':
        return <AppearanceSettings settings={appearanceSettings} handleChange={handleAppearanceChange} handleSave={handleSave} />;
      case 'about':
        return <AboutSection />;
      default:
        return <NotificationSettings settings={notificationSettings} handleChange={handleNotificationChange} handleSave={handleSave} />;
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-left">
          <FiUser size={24} />
          <div className="header-text">
            <h1>Settings / <span className="bengali-text">সেটিংস</span></h1>
            <p className="header-subtitle">Manage your application settings and preferences / <span className="bengali-text">অ্যাপ্লিকেশন সেটিংস এবং পছন্দ ম্যানেজ করুন</span></p>
          </div>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={activeTab === 'profile' ? 'active' : ''}
          >
            <FiUser /> প্রোফাইল / Profile
          </button>
          <button 
            onClick={() => setActiveTab('notifications')} 
            className={activeTab === 'notifications' ? 'active' : ''}
          >
            <FiBell /> নোটিফিকেশন / Notifications
          </button>
          <button 
            onClick={() => setActiveTab('appearance')} 
            className={activeTab === 'appearance' ? 'active' : ''}
          >
            <FiSliders /> অ্যাপিয়ারেন্স / Appearance
          </button>
          <button 
            onClick={() => setActiveTab('language')} 
            className={activeTab === 'language' ? 'active' : ''}
          >
            <FiGlobe /> ভাষা / Language
          </button>
          <button 
            onClick={() => setActiveTab('about')} 
            className={activeTab === 'about' ? 'active' : ''}
          >
            <FiInfo /> সম্পর্কে / About
          </button>
        </div>

        {/* Content Area */}
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

const NotificationSettings = ({ settings, handleChange, handleSave }) => (
  <div className="settings-section">
    <h2><FiBell /> নোটিফিকেশন সেটিংস / <span className="bengali-text">Notification Settings</span></h2>
    <div className="settings-card">
      <Toggle 
        label="সব নোটিফিকেশন চালু করুন / Enable All Notifications" 
        checked={settings.masterSwitch} 
        onChange={() => handleChange('masterSwitch')} 
      />
      <hr />
      <h4>স্টক এলার্ট / Stock Alerts</h4>
      <Toggle 
        label="কম স্টক সতর্কতা / Low Stock Warnings" 
        description="স্টক সীমার নিচে নেমে গেলে নোটিফাই করুন / Notify when stock is below threshold" 
        checked={settings.lowStock} 
        onChange={() => handleChange('lowStock')} 
      />
      <Toggle 
        label="স্টক শেষ / Out of Stock Alerts" 
        description="কোনো আইটেম শেষ হয়ে গেলে জানান / Notify when an item is sold out" 
        checked={settings.outOfStock} 
        onChange={() => handleChange('outOfStock')} 
      />
      <Toggle 
        label="শীঘ্রই মেয়াদ শেষ / Expiring Soon" 
        description="মেয়াদোত্তীর্ণের কাছাকাছি আইটেম সম্পর্কে জানান / Notify about items nearing their expiry date" 
        checked={settings.expiringSoon} 
        onChange={() => handleChange('expiringSoon')} 
      />
      <hr />
      <h4>বাকি রিমাইন্ডার / Due Reminders</h4>
      <Toggle 
        label="আসন্ন বাকি তারিখ / Upcoming Due Dates" 
        description="বাকি তারিখ এর কাছাকাছি এলে রিমাইন্ডার / Reminders for dues approaching their due date" 
        checked={settings.upcomingDues} 
        onChange={() => handleChange('upcomingDues')} 
      />
      <Toggle 
        label="বকেয়া / Overdue Dues" 
        description="বাকি তারিখ পার হয়ে গেলে এলার্ট / Alerts for dues that have passed their due date" 
        checked={settings.overdueDues} 
        onChange={() => handleChange('overdueDues')} 
      />
      <hr />
      <h4>লেনদেন / Transactions</h4>
      <Toggle 
        label="বিক্রয় নিশ্চিতকরণ / Sale Confirmations" 
        description="প্রতিটি বিক্রয়ের জন্য একটি নোটিফিকেশন পান / Receive a notification for every sale" 
        checked={settings.saleConfirmation} 
        onChange={() => handleChange('saleConfirmation')} 
      />
      <Toggle 
        label="ক্রয় নিশ্চিতকরণ / Purchase Confirmations" 
        description="প্রতিটি ক্রয়ের জন্য একটি নোটিফিকেশন পান / Receive a notification for every purchase" 
        checked={settings.purchaseConfirmation} 
        onChange={() => handleChange('purchaseConfirmation')} 
      />
    </div>
    <div className="section-footer">
      <button className="primary-button" onClick={handleSave}>
        <FiSave /> সেভ করুন / <span className="bengali-text">Save Changes</span>
      </button>
    </div>
  </div>
);

const ProfileSettings = ({ settings, handleChange, handleSave }) => (
  <div className="settings-section">
    <h2><FiUser /> প্রোফাইল সেটিংস / <span className="bengali-text">Profile Settings</span></h2>
    <div className="settings-card">
      <div className="form-group">
        <label htmlFor="name">পূর্ণ নাম / <span className="bengali-text">Full Name</span></label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          value={settings.name} 
          onChange={handleChange} 
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">ইমেইল ঠিকানা / <span className="bengali-text">Email Address</span></label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          value={settings.email} 
          onChange={handleChange} 
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone">ফোন নম্বর / <span className="bengali-text">Phone Number</span></label>
        <input 
          type="tel" 
          id="phone" 
          name="phone" 
          value={settings.phone} 
          onChange={handleChange} 
        />
      </div>
    </div>
    <div className="section-footer">
      <button className="primary-button" onClick={handleSave}>
        <FiSave /> সেভ করুন / <span className="bengali-text">Save Changes</span>
      </button>
    </div>
  </div>
);

const AppearanceSettings = ({ settings, handleChange, handleSave }) => (
  <div className="settings-section">
    <h2><FiSliders /> অ্যাপিয়ারেন্স সেটিংস / <span className="bengali-text">Appearance Settings</span></h2>
    <div className="settings-card">
      <h4>থিম / Theme</h4>
      <div className="choice-group">
        <button 
          onClick={() => handleChange('theme', 'light')} 
          className={settings.theme === 'light' ? 'active' : ''}
        >
          লাইট / Light
        </button>
        <button 
          onClick={() => handleChange('theme', 'dark')} 
          className={settings.theme === 'dark' ? 'active' : ''}
        >
          ডার্ক / Dark
        </button>
        <button 
          onClick={() => handleChange('theme', 'system')} 
          className={settings.theme === 'system' ? 'active' : ''}
        >
          সিস্টেম / System
        </button>
      </div>
      <hr />
      <h4>ফন্ট সাইজ / Font Size</h4>
      <div className="choice-group">
        <button 
          onClick={() => handleChange('fontSize', 'small')} 
          className={settings.fontSize === 'small' ? 'active' : ''}
        >
          ছোট / Small
        </button>
        <button 
          onClick={() => handleChange('fontSize', 'medium')} 
          className={settings.fontSize === 'medium' ? 'active' : ''}
        >
          মাঝারি / Medium
        </button>
        <button 
          onClick={() => handleChange('fontSize', 'large')} 
          className={settings.fontSize === 'large' ? 'active' : ''}
        >
          বড় / Large
        </button>
      </div>
    </div>
    <div className="section-footer">
      <button className="primary-button" onClick={handleSave}>
        <FiSave /> সেভ করুন / <span className="bengali-text">Save Changes</span>
      </button>
    </div>
  </div>
);

const AboutSection = () => (
  <div className="settings-section">
    <h2><FiInfo /> সম্পর্কে / <span className="bengali-text">About</span></h2>
    <div className="settings-card about-card">
      <h3>Shohel Pharmacy Management / <span className="bengali-text">শোহেল ফার্মেসি ম্যানেজমেন্ট</span></h3>
      <p>ভার্সন 1.0.0 / Version 1.0.0</p>
      <p>&copy; 2025 Shohel Pharmacy. সমস্ত স্বত্ব সংরক্ষিত / All Rights Reserved.</p>
      <div className="links">
        <a href="#!">ওয়েবসাইট / Website</a>
        <a href="#!">সাপোর্ট / Support</a>
        <a href="#!">প্রাইভেসি পলিসি / Privacy Policy</a>
      </div>
    </div>
    
    {/* Danger Zone */}
    <div className="danger-zone">
      <h3><FiAlertTriangle /> ডেঞ্জার জোন / <span className="bengali-text">Danger Zone</span></h3>
      <p>নিচের বোতামে ক্লিক করলে সমস্ত ডাটা মুছে যাবে। সাবধান! / Clicking the button below will erase all data. Be careful!</p>
      <button className="danger-button">
        <FiAlertTriangle /> সমস্ত ডাটা মুছুন / <span className="bengali-text">Delete All Data</span>
      </button>
    </div>
  </div>
);

export default Settings;
