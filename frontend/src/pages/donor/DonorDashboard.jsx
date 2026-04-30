import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, User, Settings, LogOut, Droplets, History, Calendar, Phone, Hospital, IdCard, Edit2, Camera, QrCode, Menu, X as CloseIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDonorProfile, updateDonorProfile, getDonorDashboard } from '../../services/donorService';
import { getDonorAlerts, markAlertRead } from '../../services/alertService';
import { QRCodeCanvas } from 'qrcode.react';
import Swal from 'sweetalert2';
import { Bell, MapPin, Search, Activity, CheckCircle, XCircle, X as XIcon, AlertTriangle, Info } from 'lucide-react';
import './DonorDashboard.css';
const DonorSideBar = ({ profile, currentView, setView, onUpdate, isMobileOpen, closeMobileMenu }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem('authTokens');
    navigate('/login');
  };
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        await updateDonorProfile({ profile_image: e.target.files[0] });
        Swal.fire({
          icon: 'success', title: 'Avatar Updated', toast: true,
          position: 'top-end', showConfirmButton: false, timer: 3000
        });
        if (onUpdate) onUpdate();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Upload Failed' });
      } finally {
        setIsUploading(false);
      }
    }
  };
  const navClick = (dest) => {
    setView(dest);
    closeMobileMenu();
  };
  return (
    <>
      <div className={`donor-sidebar-overlay ${isMobileOpen ? 'active' : ''}`} onClick={closeMobileMenu}></div>
      <aside className={`donor-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>

          <button className="mobile-close-btn" type="button" onClick={closeMobileMenu}><CloseIcon size={20}/></button>

        <div className="sidebar-profile">
          <div className="profile-avatar-container sidebar-pic-wrapper">
            {profile?.profile_image ? (
              <img src={profile.profile_image} alt="Profile" className="profile-avatar responsive-avatar" />
            ) : (
              <div className="profile-avatar placeholder-avatar">
                {profile?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="avatar-edit-badge" onClick={handleImageClick} title="Update Profile Picture">
              {isUploading ? <div className="spinner-mini"></div> : <Edit2 size={12} />}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} disabled={isUploading} />
          </div>
          <h3 className="profile-name">{profile?.fullName || 'No Name Set'}</h3>
          <span className="profile-blood-badge">{profile?.blood_group || '--'}</span>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <button onClick={() => navClick('dashboard')} className={`nav-button ${currentView === 'dashboard' ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navClick('profile')} className={`nav-button ${currentView === 'profile' ? 'active' : ''}`}>
                <User size={20} /> My Profile
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => navClick('settings')} className={`nav-button ${currentView === 'settings' ? 'active' : ''}`}>
                <Settings size={20} /> Settings
              </button>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};
const ProfileView = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const startEditing = () => {
    // ?? Create independent editable copy
    setEditData({
      phoneNumber: profile?.phoneNumber || '',
      hospital: profile?.hospital || '',
      profile_image: null
    });
    setPreviewImage(profile?.profile_image || '');
    setIsEditing(true);
  };
  const handleCancel = () => {
    // ?? Revert easily back to View Mode
    setIsEditing(false);
    setEditData(null);
    setPreviewImage('');
  };
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditData({ ...editData, profile_image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDonorProfile(editData);
      Swal.fire({ icon: 'success', title: 'Profile Updated', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      onUpdate(); // Reload original
      setIsEditing(false);
      setEditData(null);
    } catch (err) {
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : 'Update Failed';
      Swal.fire({ icon: 'error', title: 'Update Failed', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="profile-page-content animate-in">
      <div className="profile-header-action">
        <h1 className="page-title">Personal Information</h1>
        {!isEditing ? (
          <button className="btn btn-primary edit-mob-btn" onClick={startEditing}>
            <Edit2 size={16} /> <span className="btn-text">Edit Profile</span>
          </button>
        ) : (
          <div className="edit-actions-group">
            <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
      <div className="profile-details-grid grid-responsive">
        <div className="stat-card">
          <label className="stat-label"><IdCard size={14} /> Full Name</label>
          <p className="stat-value">{profile?.fullName || 'Not Provided'}</p>

        </div>
        <div className="stat-card">
          <label className="stat-label"><Droplets size={14} /> Blood Group</label>
          <p className="stat-value">{profile?.blood_group || 'Not Provided'}</p>

        </div>
        <div className="stat-card">
          <label className="stat-label"><IdCard size={14} /> NIC Number</label>
          <p className="stat-value">{profile?.nic_number || 'Not Provided'}</p>

        </div>
        <div className="stat-card">
          <label className="stat-label"><Phone size={14} /> Phone Number</label>
          {isEditing ? (
            <input className="form-input" value={editData.phoneNumber} onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})} />
          ) : (
            <p className="stat-value">{profile?.phoneNumber || 'Not Provided'}</p>
          )}
        </div>
        <div className="stat-card">
          <label className="stat-label"><Hospital size={14} /> Nearest Hospital</label>
          {isEditing ? (
            <input className="form-input" value={editData.hospital} onChange={(e) => setEditData({...editData, hospital: e.target.value})} />
          ) : (
            <p className="stat-value">{profile?.hospital || 'Not Provided'}</p>
          )}
        </div>
        <div className="stat-card">
          <label className="stat-label"><Camera size={14} /> Profile Image</label>
          {isEditing ? (
            <div className="image-edit-container">
              <input type="file" accept="image/*" className="form-input file-input" onChange={handleImageChange} />
              {previewImage && <img src={previewImage} alt="Preview" className="image-preview view-only" />}
            </div>
          ) : (
            <div className="image-view-container">
              {profile?.profile_image ? (
                <img src={profile.profile_image} alt="Profile" className="image-preview view-only" />
              ) : (
                <p className="stat-value text-muted" style={{ color: '#6b7280', fontSize:'0.9rem', marginTop:'8px' }}>No image set</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const DashboardOverview = ({ profile, dashboardStats, alerts, onDismissAlert, onToggleAvailability }) => {
  // Use real server-computed data from /donor/dashboard/ API
  const nextEligible = dashboardStats?.next_eligible
    ? new Date(dashboardStats.next_eligible).toLocaleDateString()
    : 'Eligible Now';
  const isEligible = dashboardStats?.is_eligible ?? true;
  const isAvailable = dashboardStats?.is_available ?? profile?.is_available ?? true;

  // Mock nearby activity (to be replaced by API in Phase 5)
  const nearbyRequests = [
    { id: 1, title: 'Urgent: O+ Blood Needed', location: 'City Hospital (2km)', urgency: '🔴 Urgent' },
    { id: 2, title: 'Blood Camp: Summer Drive', location: 'Town Hall (5km)', urgency: '🟢 Normal' }
  ];

  const alertIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle size={18} />;
      case 'eligibility': return <CheckCircle size={18} />;
      case 'camp': return <MapPin size={18} />;
      default: return <Info size={18} />;
    }
  };

  const alertClass = (type) => {
    switch (type) {
      case 'urgent': return 'alert-card urgent-alert';
      case 'eligibility': return 'alert-card success-alert';
      default: return 'alert-card info-alert';
    }
  };

  const unreadCount = alerts?.filter(a => !a.is_read)?.length || 0;

  return (
    <div className="dashboard-v2 animate-in">
      <div className="welcome-banner">
        <div>
          <h1 className="page-title" style={{ marginBottom: '4px' }}>Hi, {profile?.fullName?.split(' ')[0] || 'Donor'}!</h1>
          <p className="page-subtitle">Your quick donation dashboard.</p>
        </div>
        {unreadCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef2f2', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, color: '#b91c1c' }}>
            <Bell size={16} /> {unreadCount} unread
          </div>
        )}
      </div>

      {alerts && alerts.length > 0 && (
        <div className="alerts-section">
          {alerts.filter(a => !a.is_read).map(a => (
            <div key={a.id} className={alertClass(a.alert_type)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {alertIcon(a.alert_type)}
                <span>{a.message}</span>
              </div>
              <button
                onClick={() => onDismissAlert(a.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', color: 'inherit', opacity: 0.6 }}
                title="Dismiss"
              >
                <XIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 1. Top Section - Summary Cards */}
      <div className="stats-grid grid-responsive-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card">
          <p className="stat-label">Blood Group</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <Droplets size={24} className="icon-red" />
            <h2 className="stat-value" style={{ margin: 0, fontSize: '1.8rem' }}>{profile?.blood_group || '--'}</h2>
          </div>
        </div>
        
        <div className="stat-card">
          <p className="stat-label">Last Donation</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <History size={24} className="icon-blue" />
            <h3 className="stat-value" style={{ margin: 0, fontSize: '1.2rem' }}>
               {profile?.last_donation ? new Date(profile.last_donation).toLocaleDateString() : 'N/A'}
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <p className="stat-label">Next Eligible Date</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <Calendar size={24} className="icon-green" />
            <h3 className="stat-value" style={{ margin: 0, fontSize: '1.2rem', color: nextEligible === 'Eligible Now' ? '#10b981' : 'inherit' }}>
              {nextEligible}
            </h3>
          </div>
        </div>

        <div className="stat-card">
          <p className="stat-label">Status</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            {isAvailable ? <CheckCircle size={24} className="icon-green" /> : <XCircle size={24} color="#6b7280" />}
            <h3 className="stat-value" style={{ margin: 0, fontSize: '1.2rem', color: isAvailable ? '#10b981' : '#6b7280' }}>
              {isAvailable ? 'Available' : 'Unavailable'}
            </h3>
          </div>
          {!isEligible && (
            <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '6px' }}>
              Not eligible until {nextEligible}
            </p>
          )}
        </div>
      </div>

      {/* 2. Middle Section - Main Actions */}
      <h3 className="section-heading" style={{ marginTop: '2rem', marginBottom: '1rem', fontSize: '1.2rem' }}>Quick Actions</h3>
      <div className="main-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <button 
          className="action-btn toggle-status-btn" 
          onClick={isEligible ? onToggleAvailability : null}
          disabled={!isEligible}
          style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #e5e7eb', background: !isEligible ? '#f3f4f6' : isAvailable ? '#fee2e2' : '#dcfce7', cursor: isEligible ? 'pointer' : 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s', opacity: isEligible ? 1 : 0.6 }}
        >
          <Activity size={24} color={!isEligible ? '#9ca3af' : isAvailable ? '#ef4444' : '#10b981'} />
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>
            {!isEligible ? `Not Eligible Yet` : `Mark as ${isAvailable ? 'Unavailable' : 'Available'}`}
          </span>
        </button>

        <button className="action-btn" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Search size={24} className="icon-blue" />
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>Find Blood Requests</span>
        </button>

        <button className="action-btn" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <MapPin size={24} className="icon-red" />
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>Nearby Camps</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {/* 3. Nearby Activity */}
        <div className="nearby-section">
           <h3 className="section-heading" style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Nearby Activity</h3>
           <div className="nearby-list">
             {nearbyRequests.map(item => (
               <div key={item.id} className="nearby-card" style={{ padding: '1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#111827' }}>{item.title}</h4>
                   <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}><MapPin size={12} style={{ display: 'inline', marginRight: '4px' }}/>{item.location}</p>
                 </div>
                 <div style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, background: item.urgency.includes('Urgent') ? '#fee2e2' : '#dcfce7', color: item.urgency.includes('Urgent') ? '#b91c1c' : '#15803d' }}>
                   {item.urgency}
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* 4. QR Code & Stats */}
        <div className="qr-section stat-card centered-card" style={{ margin: 0 }}>
          <div className="qr-header">
            <QrCode size={24} /> <h2 style={{ fontSize: '1.2rem'}}>Your Donor QR Code</h2>
          </div>
          <div className="qr-box">
            {profile?.qr_id ? (
              <QRCodeCanvas 
                value={`${window.location.origin}/donor/scan/${profile.qr_id}`} size={160} level={"H"} includeMargin={true}
                imageSettings={{ src: "/favicon.svg", height: 40, width: 40, excavate: true }}
              />
            ) : (
              <div className="qr-placeholder">QR ID not available</div>
            )}
          </div>
          <div className="qr-id-tag">ID: {profile?.qr_id || 'Generating...'}</div>
          
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', width: '100%' }}>
             <p className="stat-label" style={{ marginBottom: '8px' }}>Total Contributions</p>
             <h3 className="stat-value">{profile?.donations || '0'} Donations</h3>
          </div>
        </div>
      </div>
    </div>
  );
};
const DonorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both profile and dashboard stats in parallel
      const [profileData, statsData] = await Promise.all([
        getDonorProfile(),
        getDonorDashboard(),
      ]);
      setProfile(profileData);
      setDashboardStats(statsData);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile || !dashboardStats?.is_eligible) return;
    try {
      const newStatus = !profile.is_available;
      // Optimistic update
      setProfile({ ...profile, is_available: newStatus });
      setDashboardStats({ ...dashboardStats, is_available: newStatus });
      await updateDonorProfile({ is_available: newStatus });
      Swal.fire({
        icon: 'success',
        title: `You are now ${newStatus ? 'Available' : 'Unavailable'}`,
        toast: true, position: 'top-end', showConfirmButton: false, timer: 2000
      });
    } catch (err) {
      // Revert on error
      setProfile({ ...profile, is_available: !profile.is_available });
      setDashboardStats({ ...dashboardStats, is_available: profile.is_available });
      Swal.fire({ icon: 'error', title: 'Failed to update' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="donor-container flex-layout">
      <DonorSideBar 
        profile={profile} 
        currentView={view} 
        setView={setView} 
        onUpdate={fetchData} 
        isMobileOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      <main className="donor-main">
        <div className="mobile-header">
           <div className="mobile-brand">

           </div>
           <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
             <Menu size={24} />
           </button>
        </div>
        <div className="donor-content-area">
          {loading ? (
            <div className="loader-container centered">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {view === 'dashboard' && <DashboardOverview profile={profile} dashboardStats={dashboardStats} onToggleAvailability={handleToggleAvailability} />}
              {view === 'profile' && <ProfileView profile={profile} onUpdate={fetchData} />}
              {view === 'settings' && (
                <div className="animate-in">
                  <h1 className="page-title">Settings</h1>
                  <p className="page-subtitle">Manage your account preferences.</p>
                  <div className="stat-card">Settings module coming soon...</div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
export default DonorDashboard;
