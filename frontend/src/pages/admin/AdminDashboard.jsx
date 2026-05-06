import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users, Building, Droplet, AlertCircle, Heart,
  Search, Download, Edit, Trash2, Bell
} from 'lucide-react';
import { getAdminDashboardStats, getAdminDonors, getAdminCamps } from '../../services/adminDashboardService';
import { getWorkflowNotifications, markWorkflowNotificationRead } from '../../services/campService';
import Swal from 'sweetalert2';
import './AdminDashboard.css';

const StatCard = ({ title, value, color, Icon }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>
      <Icon size={28} />
    </div>
    <div className="stat-content">
      <p className="stat-label">{title}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';

  const [donorSearch, setDonorSearch] = useState('');
  const [campSearch, setCampSearch] = useState('');

  const [dashboardStats, setDashboardStats] = useState({
    total_doctors: 0,
    total_hospitals: 0,
    total_units: 0,
    pending_requests: 0,
    approved_donations: 0,
    workflow_status_counts: {},
    today_donated_count: 0,
    rejection_reason_summary: [],
  });
  const [donors, setDonors] = useState([]);
  const [camps, setCamps] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'overview') {
          const [statsData, notificationData] = await Promise.all([
            getAdminDashboardStats(),
            getWorkflowNotifications(),
          ]);
          setDashboardStats(statsData);
          setNotifications(notificationData);
          const donorsData = await getAdminDonors();
          const campsData = await getAdminCamps();
          setDonors(donorsData);
          setCamps(campsData);
        } else if (activeTab === 'donors') {
          const donorsData = await getAdminDonors();
          setDonors(donorsData);
        } else if (activeTab === 'camps') {
          const campsData = await getAdminCamps();
          setCamps(campsData);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const timer = setInterval(fetchData, 8000);
    return () => clearInterval(timer);
  }, [activeTab]);

  // Handlers for Donors
  const filteredDonors = donors.filter(d =>
    d.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
    d.bloodGroup.toLowerCase().includes(donorSearch.toLowerCase())
  );

  const handleDeleteDonor = (id) => {
    if (window.confirm('Are you sure you want to delete this donor?')) {
      setDonors(donors.filter(d => d.id !== id));
    }
  };

  const handleExportDonors = () => {
    alert("Exporting Donor List to CSV...");
    // Real implementation would generate CSV blob and trigger download
  };

  // Handlers for Camps
  const filteredCamps = camps.filter(c =>
    c.name.toLowerCase().includes(campSearch.toLowerCase()) ||
    c.organizer.toLowerCase().includes(campSearch.toLowerCase())
  );

  const handleDeleteCamp = (id) => {
    if (window.confirm('Are you sure you want to delete this camp organizer?')) {
      setCamps(camps.filter(c => c.id !== id));
    }
  };

  const handleExportCamps = () => {
    alert("Exporting Camp Organizers List to CSV...");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleOpenNotifications = async () => {
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
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Admin Command Center</h2>
        <p className="dashboard-subtitle">Manage inventory, donors, and campaigns seamlessly.</p>
        <button className="export-btn" onClick={handleOpenNotifications}>
          <Bell size={16} /> Notifications ({unreadCount})
        </button>
      </div>



      <div className="tab-content">
        {loading && (
          <div className="overview-section fade-in">
            <p>Loading dashboard data...</p>
          </div>
        )}
        {!loading && activeTab === 'overview' && (
          <div className="overview-section fade-in">
            <div className="stats-grid">
              <StatCard title="Total Donors" value={donors.length} Icon={Users} color="stat-blue" />
              <StatCard title="Active Camps" value={camps.length} Icon={Building} color="stat-purple" />
              <StatCard title="Blood Units" value={dashboardStats.total_units} Icon={Droplet} color="stat-red" />
              <StatCard title="Pending Requests" value={dashboardStats.pending_requests} Icon={AlertCircle} color="stat-orange" />
              <StatCard title="Approved Donations" value={dashboardStats.approved_donations} Icon={Heart} color="stat-green" />
              <StatCard title="Today Donated" value={dashboardStats.today_donated_count} Icon={Heart} color="stat-blue" />
            </div>

            <div className="advanced-stats-placeholder">
              <div className="placeholder-card">
                <h4>Workflow Status Counts</h4>
                <ul className="triage-list">
                  {Object.entries(dashboardStats.workflow_status_counts || {}).map(([key, value]) => (
                    <li key={key}>{key}: {value}</li>
                  ))}
                  {Object.keys(dashboardStats.workflow_status_counts || {}).length === 0 && (
                    <li>No workflow data yet.</li>
                  )}
                </ul>
              </div>
              <div className="placeholder-card">
                <h4>Top Rejection Reasons</h4>
                <ul className="triage-list">
                  {(dashboardStats.rejection_reason_summary || []).map((item) => (
                    <li key={item.rejection_reason}>{item.rejection_reason} ({item.count})</li>
                  ))}
                  {(dashboardStats.rejection_reason_summary || []).length === 0 && (
                    <li>No rejection records.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'donors' && (
          <div className="data-section fade-in">
            <div className="data-toolbar">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search donors by name or blood group..."
                  value={donorSearch}
                  onChange={(e) => setDonorSearch(e.target.value)}
                />
              </div>
              <button className="export-btn" onClick={handleExportDonors}>
                <Download size={18} /> Export CSV
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Blood Group</th>
                    <th>Contact</th>
                    <th>Last Donation</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.map(donor => (
                    <tr key={donor.id}>
                      <td>#{donor.id}</td>
                      <td className="font-medium">{donor.name}</td>
                      <td><span className="blood-badge">{donor.bloodGroup}</span></td>
                      <td>{donor.contact}</td>
                      <td>{donor.lastDonation}</td>
                      <td>
                        <span className={`status-badge ${donor.status.toLowerCase()}`}>
                          {donor.status}
                        </span>
                      </td>
                      <td className="action-cell">
                        <button className="action-btn edit" title="Edit"><Edit size={16} /></button>
                        <button className="action-btn delete" title="Delete" onClick={() => handleDeleteDonor(donor.id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredDonors.length === 0 && (
                    <tr><td colSpan="7" className="text-center">No donors found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'camps' && (
          <div className="data-section fade-in">
            <div className="data-toolbar">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search camps or organizers..."
                  value={campSearch}
                  onChange={(e) => setCampSearch(e.target.value)}
                />
              </div>
              <button className="export-btn" onClick={handleExportCamps}>
                <Download size={18} /> Export CSV
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Camp Name</th>
                    <th>Organizer</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Expected Donors</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCamps.map(camp => (
                    <tr key={camp.id}>
                      <td>#{camp.id}</td>
                      <td className="font-medium">{camp.name}</td>
                      <td>{camp.organizer}</td>
                      <td>{camp.date}</td>
                      <td>{camp.location}</td>
                      <td>{camp.expectedDonors}</td>
                      <td className="action-cell">
                        <button className="action-btn edit" title="Edit"><Edit size={16} /></button>
                        <button className="action-btn delete" title="Delete" onClick={() => handleDeleteCamp(camp.id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredCamps.length === 0 && (
                    <tr><td colSpan="7" className="text-center">No camps found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
