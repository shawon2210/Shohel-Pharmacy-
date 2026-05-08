import React, { createContext, useContext, useEffect, useState } from 'react';

const LocaleContext = createContext();

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('shohel-pharmacy-locale');
    if (savedLocale && ['en', 'bn'].includes(savedLocale)) {
      return savedLocale;
    }
    return 'bn'; // Default to Bengali (Bangladesh market)
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('shohel-pharmacy-locale', locale);
    
    // Set html lang attribute
    document.documentElement.lang = locale === 'bn' ? 'bn-BD' : 'en';
    
    // Add/remove Bengali font class
    if (locale === 'bn') {
      document.documentElement.classList.add('locale-bengali');
    } else {
      document.documentElement.classList.remove('locale-bengali');
    }
  }, [locale]);

  // Translation dictionary
  const translations = {
    en: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.products': 'Products',
      'nav.sales': 'Sales',
      'nav.purchases': 'Purchases',
      'nav.expenses': 'Expenses',
      'nav.reports': 'Reports',
      'nav.dues': 'Dues',
      'nav.settings': 'Settings',
      
      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.view': 'View',
      'common.search': 'Search...',
      'common.loading': 'Loading...',
      'common.noData': 'No data found',
      'common.total': 'Total',
      'common.amount': 'Amount',
      'common.date': 'Date',
      'common.actions': 'Actions',
      
      // Currency
      'currency.symbol': '₹',
    },
    bn: {
      // Navigation
      'nav.dashboard': 'ড্যাশবোর্ড',
      'nav.products': 'পণ্যসমূহ',
      'nav.sales': 'বিক্রয়',
      'nav.purchases': 'ক্রয়',
      'nav.expenses': 'খরচ',
      'nav.reports': 'রিপোর্ট',
      'nav.dues': 'বাকি',
      'nav.settings': 'সেটিংস',
      
      // Common
      'common.save': 'সেভ করুন',
      'common.cancel': 'বাতিল',
      'common.delete': 'মুছুন',
      'common.edit': 'এডিট',
      'common.view': 'দেখুন',
      'common.search': 'খুজুন...',
      'common.loading': 'লোড হচ্ছে...',
      'common.noData': 'কোনো ডাটা পাওয়া যায়নি',
      'common.total': 'মোট',
      'common.amount': 'পরিমাণ',
      'common.date': 'তারিখ',
      'common.actions': 'একশন',
      
      // Currency
      'currency.symbol': '৳',
    }
  };

  const t = (key) => {
    return translations[locale][key] || key;
  };

  const value = {
    locale,
    setLocale,
    t,
    isBengali: locale === 'bn'
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};
