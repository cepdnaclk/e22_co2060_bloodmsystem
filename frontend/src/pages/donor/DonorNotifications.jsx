import React, { useEffect, useState } from 'react';
import { getDonorAlerts, markAlertRead } from '../../services/alertService';
import { Bell, MapPin, CheckCircle, X as XIcon, AlertTriangle, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DonorNotifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      const data = await getDonorAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Error fetching alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Live update polling for notifications
    const intervalId = setInterval(() => {
        fetchAlerts();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleDismissAlert = async (alertId) => {
    try {
      await markAlertRead(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (err) {
      console.error("Failed to dismiss alert", err);
    }
  };

  const alertIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle size={20} />;
      case 'eligibility': return <CheckCircle size={20} />;
      case 'camp': return <MapPin size={20} />;
      default: return <Info size={20} />;
    }
  };

  const alertClass = (type) => {
    switch (type) {
      case 'urgent': return 'alert-card urgent-alert';
      case 'eligibility': return 'alert-card success-alert';
      default: return 'alert-card info-alert';
    }
  };

  const unreadAlerts = alerts.filter(a => !a.is_read);

  return (
    <div className="donor-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#f3f4f6' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Notifications</h1>
      </div>

      {loading ? (
        <div className="loader-container centered">
          <div className="spinner"></div>
        </div>
      ) : unreadAlerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <Bell size={48} color="#9ca3af" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#374151', margin: '0 0 10px 0' }}>All Caught Up!</h3>
          <p style={{ color: '#6b7280', margin: 0 }}>You have no new notifications right now.</p>
        </div>
      ) : (
        <div className="alerts-section" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {unreadAlerts.map(a => (
            <div key={a.id} className={alertClass(a.alert_type)} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '15px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>{alertIcon(a.alert_type)}</div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '0.95rem', fontWeight: 500 }}>{a.message}</p>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDismissAlert(a.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', color: 'inherit', opacity: 0.6 }}
                title="Mark as Read"
              >
                <XIcon size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorNotifications;
