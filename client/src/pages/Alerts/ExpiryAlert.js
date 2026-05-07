import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';

const ExpiryAlert = () => {
  const navigate = useNavigate();
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiringMedicines();
  }, []);

  const fetchExpiringMedicines = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/medicines/alerts/expiring');
      setExpiringMedicines(response.data || []);
    } catch (error) {
      console.error('Error fetching expiring medicines:', error);
      toast.error('Failed to fetch expiring medicines');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (daysUntilExpiry) => {
    if (daysUntilExpiry < 0) return { status: 'expired', color: '#ef4444' };
    if (daysUntilExpiry <= 7) return { status: 'critical', color: '#ef4444' };
    if (daysUntilExpiry <= 30) return { status: 'warning', color: '#f59e0b' };
    return { status: 'normal', color: '#10b981' };
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.5rem 1rem', background: 'transparent', 
            border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' 
          }}
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1 style={{ marginLeft: '1rem', fontSize: '2rem', fontWeight: '700' }}>
          ⏰ Expiry Alerts
        </h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ 
            width: '40px', height: '40px', border: '3px solid #f3f4f6', 
            borderTop: '3px solid #6366f1', borderRadius: '50%', 
            animation: 'spin 1s linear infinite', margin: '0 auto 1rem' 
          }}></div>
          <p>Loading expiring medicines...</p>
        </div>
      ) : expiringMedicines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <FaCalendarAlt style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '1rem' }} />
          <h3>No expiring medicines found</h3>
          <p>All medicines are within safe expiry periods</p>
        </div>
      ) : (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(20px)', 
          border: '1px solid rgba(255, 255, 255, 0.2)', 
          borderRadius: '16px', 
          overflow: 'hidden' 
        }}>
          <div style={{ 
            padding: '1.5rem', 
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
              ⏰ Expiring Medicines
            </h2>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {expiringMedicines.length} medicines
            </div>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            {expiringMedicines.map((medicine, index) => {
              const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);
              const expiryStatus = getExpiryStatus(daysUntilExpiry);
              
              return (
                <div 
                  key={index} 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
                    gap: '1rem', 
                    padding: '1rem', 
                    borderBottom: index < expiringMedicines.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                    alignItems: 'center' 
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                      {medicine.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {medicine.genericName} - {medicine.strength} {medicine.unit}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem' }}>
                    {medicine.stockQuantity} {medicine.unit}
                  </div>
                  <div style={{ fontSize: '0.875rem' }}>
                    {new Date(medicine.expiryDate).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: expiryStatus.color, fontWeight: '600' }}>
                    {daysUntilExpiry < 0 ? 'Expired' : `${daysUntilExpiry} days`}
                  </div>
                  <div>
                    <span 
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: '600', 
                        color: 'white', 
                        backgroundColor: expiryStatus.color 
                      }}
                    >
                      {expiryStatus.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryAlert;