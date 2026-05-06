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
} from '../../services/campService';
import { LayoutDashboard, Calendar, MapPin, Clock, Plus, CheckCircle, LogOut, User, Activity, Bell } from 'lucide-react';
import { useAuth } from '../../context/auth/useAuth';
import Swal from 'sweetalert2';
import api from '../../api/api';
import './CampDashboard.css';

const CampDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('camps');
  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [processingRegistrationId, setProcessingRegistrationId] = useState(null);

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

  const loadAll = async () => {
    try {
      setLoading(true);
      await Promise.all([loadProfile(), loadCamps(), loadNotifications()]);
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
          (n) => `<div style="padding:8px 0;border-bottom:1px solid #eee;">
                    <strong>${n.event_type}</strong><br/>
                    <span>${n.message}</span><br/>
                    <small>${new Date(n.created_at).toLocaleString()}</small>
                  </div>`
        ).join('')}</div>`
      : '<p>No notifications.</p>';
    await Swal.fire({ title: 'Workflow Notifications', html, width: 700 });
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
    <div className="camp-dashboard-container">
      <aside className="camp-sidebar">
        <div className="sidebar-logo">
          <h2>BloodCamp Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button onClick={() => { setView('camps'); setSelectedCamp(null); }} className={view === 'camps' && !selectedCamp ? 'active' : ''}>
                <LayoutDashboard size={20} /> My Camps
              </button>
            </li>
            <li>
              <button onClick={() => setView('create')} className={view === 'create' ? 'active' : ''}>
                <Plus size={20} /> Create Camp
              </button>
            </li>
            <li>
              <button onClick={() => { setView('profile'); setSelectedCamp(null); }} className={view === 'profile' ? 'active' : ''}>
                <User size={20} /> My Profile
              </button>
            </li>
          </ul>
        </nav>
        <div className="sidebar-bottom">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="camp-main">
        <header className="camp-header">
          <h1>Welcome, {profile?.fullName || profileUser?.username || user?.username}</h1>
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
            <div className="camps-list animate-in">
              <h2>Your Camps</h2>
              {loading ? (
                <p>Loading camps...</p>
              ) : camps.length === 0 ? (
                <p>No camps organized yet.</p>
              ) : (
                <div className="camp-grid">
                  {camps.map(camp => (
                    <div key={camp.id} className="camp-card">
                      <h3>{camp.title}</h3>
                      <p><Calendar size={14} /> {camp.date} ({camp.start_time} - {camp.end_time})</p>
                      <p><MapPin size={14} /> {camp.location}</p>
                      <span className="camp-status">{camp.status}</span>
                      <button onClick={() => handleViewRegistrations(camp)} className="view-regs-btn">
                        View Workflow
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                            <div className="appt-time">Reason: {reg.rejection_reason}</div>
                          ) : null}
                          {reg.collected_at ? (
                            <div className="appt-time"><Clock size={12} /> {new Date(reg.collected_at).toLocaleString()}</div>
                          ) : null}
                        </td>
                        <td>
                          {reg.status === 'registered' && (
                            <button onClick={() => runRegistrationAction(reg.id, 'arrive')} className="approve-btn" disabled={processingRegistrationId === reg.id}>
                              <CheckCircle size={16} /> Mark Arrived
                            </button>
                          )}
                          {reg.status === 'arrived' && (
                            <button onClick={() => runRegistrationAction(reg.id, 'screening')} className="approve-btn" disabled={processingRegistrationId === reg.id}>
                              <CheckCircle size={16} /> Send to Doctor
                            </button>
                          )}
                          {reg.status === 'approved' && (
                            <button onClick={() => runRegistrationAction(reg.id, 'donated')} className="approve-btn" style={{ background: '#10b981', color: 'white', borderColor: '#059669' }} disabled={processingRegistrationId === reg.id}>
                              <CheckCircle size={16} /> Mark Donated
                            </button>
                          )}
                          {(reg.status === 'screening' || reg.status === 'rejected' || reg.status === 'donated') && (
                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>No staff action</span>
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
      </main>
    </div>
  );
};

export default CampDashboard;
