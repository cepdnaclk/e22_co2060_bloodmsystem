import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrganizerCamps, createBloodCamp, getCampRegistrations, approveCampRegistration } from '../../services/campService';
import { LayoutDashboard, Users, Calendar, MapPin, Clock, Plus, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/auth/useAuth';
import Swal from 'sweetalert2';
import './CampDashboard.css';

const CampDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [view, setView] = useState('camps'); // 'camps' or 'create'
  
  // New Camp Form
  const [newCamp, setNewCamp] = useState({
    title: '', date: '', start_time: '', end_time: '', location: '', description: ''
  });

  const loadCamps = async () => {
    try {
      const data = await getOrganizerCamps();
      setCamps(data);
    } catch (err) {
      console.error("Error loading camps:", err);
    }
  };

  useEffect(() => {
    loadCamps();
  }, []);

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    try {
      await createBloodCamp(newCamp);
      Swal.fire('Success', 'Blood Camp Created!', 'success');
      setView('camps');
      loadCamps();
      setNewCamp({ title: '', date: '', start_time: '', end_time: '', location: '', description: '' });
    } catch (err) {
      Swal.fire('Error', 'Failed to create camp', 'error');
    }
  };

  const handleViewRegistrations = async (camp) => {
    try {
      const data = await getCampRegistrations(camp.id);
      setRegistrations(data);
      setSelectedCamp(camp);
    } catch (err) {
      console.error("Error loading registrations:", err);
    }
  };

  const handleApprove = async (reg) => {
    const { value: time } = await Swal.fire({
      title: 'Set Appointment Time',
      input: 'time',
      inputLabel: 'Time for donor to arrive',
      inputPlaceholder: 'Select time',
      showCancelButton: true
    });

    if (time) {
      try {
        await approveCampRegistration(reg.id, time);
        Swal.fire('Approved!', 'Donor has been notified.', 'success');
        handleViewRegistrations(selectedCamp); // refresh
      } catch (err) {
        Swal.fire('Error', 'Approval failed.', 'error');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          <h1>Welcome, {user?.username}</h1>
        </header>

        <div className="camp-content">
          {view === 'create' && (
            <div className="camp-form-card animate-in">
              <h2>Create New Blood Camp</h2>
              <form onSubmit={handleCreateCamp}>
                <div className="form-group">
                  <label>Camp Title</label>
                  <input type="text" required value={newCamp.title} onChange={e => setNewCamp({...newCamp, title: e.target.value})} placeholder="e.g. Summer Blood Drive" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" required value={newCamp.date} onChange={e => setNewCamp({...newCamp, date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" required value={newCamp.start_time} onChange={e => setNewCamp({...newCamp, start_time: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" required value={newCamp.end_time} onChange={e => setNewCamp({...newCamp, end_time: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" required value={newCamp.location} onChange={e => setNewCamp({...newCamp, location: e.target.value})} placeholder="Full Address / Venue" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea rows="3" value={newCamp.description} onChange={e => setNewCamp({...newCamp, description: e.target.value})}></textarea>
                </div>
                <button type="submit" className="camp-submit-btn">Publish Camp</button>
              </form>
            </div>
          )}

          {view === 'camps' && !selectedCamp && (
            <div className="camps-list animate-in">
              <h2>Your Upcoming Camps</h2>
              {camps.length === 0 ? (
                <p>No camps organized yet.</p>
              ) : (
                <div className="camp-grid">
                  {camps.map(camp => (
                    <div key={camp.id} className="camp-card">
                      <h3>{camp.title}</h3>
                      <p><Calendar size={14}/> {camp.date} ({camp.start_time} - {camp.end_time})</p>
                      <p><MapPin size={14}/> {camp.location}</p>
                      <span className="camp-status">{camp.status}</span>
                      <button onClick={() => handleViewRegistrations(camp)} className="view-regs-btn">
                        View Donor Requests
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedCamp && (
            <div className="registrations-view animate-in">
              <button className="back-btn" onClick={() => setSelectedCamp(null)}>← Back to Camps</button>
              <h2>Donor Requests for: {selectedCamp.title}</h2>
              
              {registrations.length === 0 ? (
                <p>No donors have requested to join this camp yet.</p>
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
                          {reg.appointment_time && <div className="appt-time"><Clock size={12}/> {reg.appointment_time}</div>}
                        </td>
                        <td>
                          {reg.status === 'pending' && (
                            <button onClick={() => handleApprove(reg)} className="approve-btn">
                              <CheckCircle size={16} /> Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CampDashboard;
