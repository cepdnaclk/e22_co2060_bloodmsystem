import React from 'react';
import { Users, Building, Droplet, AlertCircle, Heart } from 'lucide-react';
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
  // Mock data - replace with API call when backend is ready
  const dashboardStats = {
    total_doctors: 24,
    total_hospitals: 8,
    total_units: 342,
    pending_requests: 12,
    approved_donations: 156,
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard Overview</h2>
        <p className="dashboard-subtitle">Real-time blood bank statistics</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Doctors" 
          value={dashboardStats.total_doctors} 
          Icon={Users} 
          color="stat-blue" 
        />
        <StatCard 
          title="Hospital Officers" 
          value={dashboardStats.total_hospitals} 
          Icon={Building} 
          color="stat-purple" 
        />
        <StatCard 
          title="Blood Units" 
          value={dashboardStats.total_units} 
          Icon={Droplet} 
          color="stat-red" 
        />
        <StatCard 
          title="Pending Requests" 
          value={dashboardStats.pending_requests} 
          Icon={AlertCircle} 
          color="stat-orange" 
        />
        <StatCard 
          title="Approved Donations" 
          value={dashboardStats.approved_donations} 
          Icon={Heart} 
          color="stat-green" 
        />
      </div>
    </div>
  );
};

export default AdminDashboard;