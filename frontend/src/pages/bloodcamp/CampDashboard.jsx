import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  completeCampRegistration,
  createBloodCamp,
  getCampRegistrations,
  getOrganizerCamps,
  getWorkflowNotifications,
  markRegistrationArrived,
  markWorkflowNotificationRead,
  sendRegistrationToScreening,
  getOrganizerDonatedHistory
} from '../../services/campService';
import { LayoutDashboard, Calendar, MapPin, Clock, Plus, CheckCircle, LogOut, User, Activity, Bell, ChevronLeft, Settings, Mail, Power, Moon, Sun, Menu, X, History, Droplet, Users, AlertTriangle, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/auth/useAuth';
import Swal from 'sweetalert2';
import api from '../../api/api';
import './CampDashboard.css';

const CampDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [view, setView] = useState('camps');
  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [processingRegistrationId, setProcessingRegistrationId] = useState(null);
  const [donatedHistory, setDonatedHistory] = useState([]);

  const [newCamp, setNewCamp] = useState({
    title: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    description: '',
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const groupedRegistrations = useMemo(() => ({
    registered: registrations.filter((r) => r.status === 'registered'),
    arrived: registrations.filter((r) => r.status === 'arrived'),
    screening: registrations.filter((r) => r.status === 'screening'),
    approved: registrations.filter((r) => r.status === 'approved'),
    rejected: registrations.filter((r) => r.status === 'rejected'),
    donated: registrations.filter((r) => r.status === 'donated'),
  }), [registrations]);

  const loadProfile = async () => {
    try {
      const response = await api.get('auth/profile/');
      setProfileData(response.data);
    } catch {
      setProfileData(null);
    }
  };

  const loadCamps = async () => {
    const data = await getOrganizerCamps();
    setCamps(data);
  };

  const loadRegistrations = async (campId) => {
    const data = await getCampRegistrations(campId);
    setRegistrations(data);
  };

  const loadNotifications = async () => {
    const data = await getWorkflowNotifications();
    setNotifications(Array.isArray(data) ? data : []);
  };
  
  const loadDonatedHistory = async () => {
    const data = await getOrganizerDonatedHistory();
    setDonatedHistory(data);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadProfile(), loadCamps(), loadNotifications(), loadDonatedHistory()]);
      if (selectedCamp?.id) {
        await loadRegistrations(selectedCamp.id);
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.detail || 'Failed to load camp dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const intervalId = setInterval(() => {
      loadAll();
    }, 8000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamp?.id]);

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    try {
      await createBloodCamp(newCamp);
      Swal.fire('Success', 'Blood Camp created.', 'success');
      setView('camps');
      setNewCamp({ title: '', date: '', start_time: '', end_time: '', location: '', description: '' });
      await loadCamps();
    } catch (error) {
      Swal.fire('Error', error.response?.data?.detail || 'Failed to create camp.', 'error');
    }
  };

  const handleViewRegistrations = async (camp) => {
    setSelectedCamp(camp);
    await loadRegistrations(camp.id);
  };

  const runRegistrationAction = async (registrationId, action) => {
    try {
      setProcessingRegistrationId(registrationId);
      if (action === 'arrive') await markRegistrationArrived(registrationId);
      if (action === 'screening') await sendRegistrationToScreening(registrationId);
      if (action === 'donated') await completeCampRegistration(registrationId);
      await loadRegistrations(selectedCamp.id);
    } catch (error) {
      Swal.fire('Action Failed', error.response?.data?.detail || 'Could not update donor status.', 'error');
    } finally {
      setProcessingRegistrationId(null);
    }
  };

  const handleWorkflowNotifications = async () => {
    const html = notifications.length
      ? `<div style="text-align:left;max-height:300px;overflow:auto;">${notifications.map(
          (n) => `<div style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                    <strong style="color:#991b1b;">${n.event_type}</strong><br/>
                    <span style="color:#334155;">${n.message}</span><br/>
                    <small style="color:#94a3b8;">${new Date(n.created_at).toLocaleString()}</small>
                  </div>`
        ).join('')}</div>`
      : '<p style="color:#64748b;">No notifications.</p>';
    await Swal.fire({ title: 'Workflow Notifications', html, width: 700, confirmButtonColor: '#B22222' });
    await Promise.all(notifications.filter((n) => !n.is_read).map((n) => markWorkflowNotificationRead(n.id)));
    await loadNotifications();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const profileUser = profileData?.user || {};
  const profile = profileData?.profile || {};

  return (
    <div className={`camp-dashboard-container ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <nav className={`sidebar ${isSidebarClosed ? 'close' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <header>
          <div className="brand">
            <div className="logo-text label-text">
              <span className="brand-name">BloodCamp</span>
            </div>
          </div>
          <div className="sidebar-toggle desktop-only" onClick={() => setIsSidebarClosed(!isSidebarClosed)}>
            <ChevronLeft />
          </div>
          <div className="mobile-close-btn mobile-only" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </div>
        </header>

        <div className="sidebar-user">
          <div className="user">
            <div className="user-avatar">
              <User size={30} />
            </div>
            <div className="user-info label-text">
              <h6>{profile?.fullName || profileUser?.username || user?.username || 'Organizer'}</h6>
              <span>{profileUser?.role || user?.role || 'Administrator'}</span>
            </div>
          </div>

          <div className="user-social">
            <ul>
              <li><button title="Settings"><Settings size={18} /></button></li>
              <li><button title="Messages"><Mail size={18} /></button></li>
              <li><button onClick={() => { setView('profile'); setSelectedCamp(null); }} title="Profile"><User size={18} /></button></li>
              <li><button onClick={handleLogout} title="Logout"><Power size={18} /></button></li>
            </ul>
          </div>
        </div>

        <ul className="side-menu">
          <li className={`slide-link ${view === 'camps' && !selectedCamp ? 'active' : ''}`}>
            <button onClick={() => { setView('camps'); setSelectedCamp(null); }}>
              <div className="icon"><LayoutDashboard size={20} /></div>
              <span className="label-text">Overview</span>
            </button>
          </li>
          <li className={`slide-link ${view === 'history' ? 'active' : ''}`}>
            <button onClick={() => { setView('history'); setSelectedCamp(null); }}>
              <div className="icon"><History size={20} /></div>
              <span className="label-text">Donated History</span>
            </button>
          </li>
          <li className={`slide-link ${view === 'create' ? 'active' : ''}`}>
            <button onClick={() => setView('create')}>
              <div className="icon"><Plus size={20} /></div>
              <span className="label-text">Create Camp</span>
            </button>
          </li>
          <li className={`slide-link ${view === 'profile' ? 'active' : ''}`}>
            <button onClick={() => { setView('profile'); setSelectedCamp(null); }}>
              <div className="icon"><User size={20} /></div>
              <span className="label-text">Settings</span>
            </button>
          </li>
        </ul>

        <div className="mode-box">
          <div className="sun-moon-box">
            <Moon className="icon moon-icon" size={18} />
            <Sun className="icon sun-icon" size={18} />
          </div>
          <span className="mode-text label-text">Dark mode</span>
          <div className="toggle-switch" onClick={() => setIsDarkMode(!isDarkMode)}>
            <span className="switch"></span>
          </div>
        </div>
      </nav>

      <div className="main-container">
        <header className="camp-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1>Welcome, {profile?.fullName || profileUser?.username || user?.username}</h1>
          </div>
          <div className="header-status" style={{ display: 'flex', gap: 10 }}>
            <span className="live-badge"><Activity size={12} className="pulse-icon" /> Live Updates On</span>
            <button className="view-regs-btn" onClick={handleWorkflowNotifications}>
              <Bell size={14} /> Notifications ({unreadCount})
            </button>
          </div>
        </header>

        <div className="camp-content">
          {view === 'create' && (
            <div className="camp-form-card animate-in">
              <h2>Create New Blood Camp</h2>
              <form onSubmit={handleCreateCamp}>
                <div className="form-group">
                  <label>Camp Title</label>
                  <input type="text" required value={newCamp.title} onChange={e => setNewCamp({ ...newCamp, title: e.target.value })} placeholder="e.g. Summer Blood Drive" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" required value={newCamp.date} onChange={e => setNewCamp({ ...newCamp, date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" required value={newCamp.start_time} onChange={e => setNewCamp({ ...newCamp, start_time: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" required value={newCamp.end_time} onChange={e => setNewCamp({ ...newCamp, end_time: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" required value={newCamp.location} onChange={e => setNewCamp({ ...newCamp, location: e.target.value })} placeholder="Full Address / Venue" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" value={newCamp.description} onChange={e => setNewCamp({ ...newCamp, description: e.target.value })} />
                </div>
                <button type="submit" className="camp-submit-btn">Publish Camp</button>
              </form>
            </div>
          )}

          {view === 'camps' && !selectedCamp && (
            <div className="dashboard-overview animate-in">
              {/* HERO STATS */}
              <div className="hero-stats">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Total Units Collected</span>
                    <Droplet size={20} color="#dc2626" />
                  </div>
                  <div className="stat-value">4,520</div>
                  <small style={{color: 'var(--main-text-muted)'}}>+12% from last month</small>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Active Donors</span>
                    <Users size={20} color="#0284c7" />
                  </div>
                  <div className="stat-value">245</div>
                  <small style={{color: 'var(--main-text-muted)'}}>Registered this week</small>
                </div>
                <div className="stat-card critical">
                  <div className="stat-header">
                    <span className="stat-title">Critical Stock</span>
                    <AlertTriangle size={20} color="#dc2626" />
                  </div>
                  <div className="stat-value">O- (20%)</div>
                  <small style={{color: '#dc2626'}}>Action Required</small>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Upcoming Camps</span>
                    <CalendarDays size={20} color="#16a34a" />
                  </div>
                  <div className="stat-value">{camps.filter(c => new Date(c.date) >= new Date()).length}</div>
                  <small style={{color: 'var(--main-text-muted)'}}>Scheduled this month</small>
                </div>
              </div>

              {/* MAIN WORKSPACE: F-PATTERN */}
              <div className="main-workspace">
                <div className="camps-list">
                  <h2>Your Camps</h2>
                  {loading ? (
                    <p>Loading camps...</p>
                  ) : camps.length === 0 ? (
                    <div style={{textAlign: 'center', padding: 40, border: '1px dashed var(--border-color)', borderRadius: 12}}>
                      <CalendarDays size={48} color="var(--border-color)" style={{marginBottom: 16}} />
                      <p style={{color: 'var(--main-text-muted)', marginBottom: 16}}>No camps organized yet.</p>
                      <button className="camp-submit-btn" style={{width: 'auto'}} onClick={() => setView('create')}>Schedule a Camp</button>
                    </div>
                  ) : (
                    <div className="camp-grid">
                      {camps.map(camp => (
                        <div key={camp.id} className="camp-card">
                          <h3>{camp.title}</h3>
                          <p><Calendar size={14} /> {camp.date} ({camp.start_time} - {camp.end_time})</p>
                          <p><MapPin size={14} /> {camp.location}</p>
                          <span className="status-badge active" style={{marginTop: 12}}>{camp.status}</span>
                          <button onClick={() => handleViewRegistrations(camp)} className="view-regs-btn" style={{marginTop: 16}}>
                            View Workflow
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <aside className="activity-feed">
                  <h3><Activity size={18} /> Live Activity Feed</h3>
                  {notifications.length === 0 ? (
                    <p style={{color: 'var(--main-text-muted)'}}>No recent activity.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="activity-item">
                        <strong>{n.event_type}</strong>
                        <span>{n.message}</span>
                        <small>{new Date(n.created_at).toLocaleString()}</small>
                      </div>
                    ))
                  )}
                </aside>
              </div>
            </div>
          )}

          {view === 'history' && (
            <div className="registrations-view animate-in">
              <h2>Donated History (Global)</h2>
              <p style={{color: 'var(--main-text-muted)', marginBottom: 20}}>View all past successful blood donations across your camps.</p>
              
              <div className="table-wrapper">
                <table className="camp-table">
                  <thead>
                    <tr>
                      <th>Donor Name</th>
                      <th>Blood Group</th>
                      <th>Camp Location</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donatedHistory.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: 20}}>
                          No donation records yet.
                        </td>
                      </tr>
                    ) : (
                      donatedHistory.map(record => (
                        <tr key={record.id}>
                          <td>{record.donor_name}</td>
                          <td><span className="blood-tag">{record.blood_group}</span></td>
                          <td>{record.camp_location}</td>
                          <td>{new Date(record.donated_at).toLocaleDateString()}</td>
                          <td><span className="status-badge completed">Completed</span></td>
                        </tr>
                        ))
                      )}
                    </tbody>

                </table>
              </div>
            </div>
          )}

          {view === 'profile' && (
            <div className="camp-form-card animate-in">
              <h2>Organizer Profile</h2>
              <div className="profile-details">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={profile?.fullName || profileUser?.username || ''} disabled className="form-input" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={profileUser?.email || user?.email || ''} disabled className="form-input" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={profile?.phoneNumber || 'N/A'} disabled className="form-input" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" value={profileUser?.role || user?.role || ''} disabled className="form-input" style={{ textTransform: 'capitalize' }} />
                </div>
              </div>
            </div>
          )}

          {selectedCamp && view === 'camps' && (
            <div className="registrations-view animate-in">
              <button className="back-btn" onClick={() => setSelectedCamp(null)}>← Back to Camps</button>
              <h2>Donor Workflow: {selectedCamp.title}</h2>

              {registrations.length === 0 ? (
                <p>No donor registrations yet.</p>
              ) : (
                <table className="camp-table">
                  <thead>
                    <tr>
                      <th>Donor Name</th>
                      <th>Blood Group</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg.id}>
                        <td>{reg.donor_name}</td>
                        <td><span className="blood-tag">{reg.donor_blood_group || 'N/A'}</span></td>
                        <td>{reg.donor_phone || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${reg.status}`}>{reg.status}</span>
                          {reg.rejection_reason ? (
                            <div className="appt-time" style={{ fontSize: '0.85rem', color: 'var(--main-text-muted)', marginTop: 4 }}>Reason: {reg.rejection_reason}</div>
                          ) : null}
                          {reg.collected_at ? (
                            <div className="appt-time" style={{ fontSize: '0.85rem', color: 'var(--main-text-muted)', marginTop: 4 }}><Clock size={12} /> {new Date(reg.collected_at).toLocaleString()}</div>
                          ) : null}
                        </td>
                        <td>
                          {reg.status === 'registered' && (
                            <button onClick={() => runRegistrationAction(reg.id, 'arrive')} className="approve-btn" disabled={processingRegistrationId === reg.id}>
                              <CheckCircle size={14} /> Mark Arrived
                            </button>
                          )}
                          {reg.status === 'arrived' && (
                            <button onClick={() => runRegistrationAction(reg.id, 'screening')} className="approve-btn" disabled={processingRegistrationId === reg.id}>
                              <Activity size={14} /> To Screening
                            </button>
                          )}
                          {reg.status === 'approved' && (
                            <button onClick={() => runRegistrationAction(reg.id, 'donated')} className="approve-btn success" disabled={processingRegistrationId === reg.id}>
                              <Droplet size={14} /> Complete Donation
                            </button>
                          )}
                          {(reg.status === 'screening' || reg.status === 'rejected' || reg.status === 'donated') && (
                            <span style={{ color: 'var(--main-text-muted)', fontSize: '0.85rem' }}>No action available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: 16, color: '#475569', fontSize: '0.92rem' }}>
                <strong>Summary:</strong>{' '}
                Registered {groupedRegistrations.registered.length} • Arrived {groupedRegistrations.arrived.length} •
                Screening {groupedRegistrations.screening.length} • Approved {groupedRegistrations.approved.length} •
                Rejected {groupedRegistrations.rejected.length} • Donated {groupedRegistrations.donated.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampDashboard;
