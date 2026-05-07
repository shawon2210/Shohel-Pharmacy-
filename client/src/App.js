import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import SalesManagement from './pages/Sales/SalesManagement';
import NewSale from './pages/Sales/NewSale';
import Products from './pages/Products/Products';
import Dues from './pages/Dues/Dues';
import Purchases from './pages/Purchases/Purchases';
import NewPurchase from './pages/Purchases/NewPurchase';
import PurchaseDetails from './pages/Purchases/PurchaseDetails';
import ExpenseManagement from './pages/Expenses/ExpenseManagement';
import ReportsAnalytics from './pages/Reports/ReportsAnalytics';
import Settings from './pages/Settings/Settings';
import Login from './pages/Auth/Login';
import ExpiryAlert from './pages/Alerts/ExpiryAlert';
import ErrorBoundary from './components/ErrorBoundary';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="sales" element={<SalesManagement />} />
                <Route path="sales/new" element={<NewSale />} />
                <Route path="medicines" element={<Products />} />
                <Route path="dues" element={<Dues />} />
                <Route path="purchases" element={<Purchases />} />
                <Route path="purchases/new" element={<NewPurchase />} />
                <Route path="purchases/:id" element={<PurchaseDetails />} />
                <Route path="expenses" element={<ExpenseManagement />} />
                <Route path="reports" element={<ReportsAnalytics />} />
                <Route path="settings" element={<Settings />} />
                <Route path="expiry-alert" element={<ExpiryAlert />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;