import React from 'react';
import { 
    Activity, Users, AlertTriangle, Database, Bell, TrendingUp, 
    CheckCircle, XCircle, Droplet, Clock, ShieldAlert, BarChart3,
    ArrowRight, MapPin
} from 'lucide-react';
import Swal from 'sweetalert2';
import './AdminDashboard.css';

const AdminDashboard = () => {


    // Simulated Stock Data
    const bloodStock = [
        { type: 'A+', units: 45, status: 'safe' },
        { type: 'A-', units: 12, status: 'low' },
        { type: 'B+', units: 38, status: 'safe' },
        { type: 'B-', units: 8, status: 'low' },
        { type: 'O+', units: 65, status: 'safe' },
        { type: 'O-', units: 2, status: 'critical' },
        { type: 'AB+', units: 20, status: 'safe' },
        { type: 'AB-', units: 4, status: 'critical' },
    ];

    // Priority System Data
    const pendingRequests = [
        { id: 'REQ-809', hospital: 'General Hospital, Colombo', type: 'O-', units: 3, priority: 'Emergency', time: '1 hour' },
        { id: 'REQ-810', hospital: 'Kandy Teaching Hospital', type: 'AB-', units: 2, priority: 'Emergency', time: '2 hours' },
        { id: 'REQ-811', hospital: 'Lanka Hospitals', type: 'A-', units: 5, priority: 'Normal', time: 'Today' },
        { id: 'REQ-812', hospital: 'Nawaloka Hospital', type: 'B+', units: 10, priority: 'Low', time: 'Tomorrow' },
    ];

    // Recent Activity Feed
    const activityFeed = [
        { id: 1, text: 'Admin Sarah approved REQ-808 (O+)', time: '2 mins ago', type: 'system' },
        { id: 2, text: 'New Emergency request from Kandy Hosp', time: '5 mins ago', type: 'alert' },
        { id: 3, text: 'Donor John D. completed A+ donation', time: '12 mins ago', type: 'user' },
        { id: 4, text: 'Stock alert: O- dropped to critical level', time: '18 mins ago', type: 'alert' },
        { id: 5, text: 'Daily system backup completed', time: '1 hour ago', type: 'system' },
    ];

    const handleApprove = (id) => {
        Swal.fire({
            title: 'Approve Request?',
            text: `Allocating units for ${id}. This will deduct from the live stock.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2E7D32',
            cancelButtonColor: '#637381',
            confirmButtonText: 'Yes, Approve'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Approved!', 'The units have been successfully allocated and dispatched.', 'success');
            }
        });
    };

    const handleReject = (id) => {
        Swal.fire({
            title: 'Reject Request?',
            text: `Are you sure you want to reject ${id}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#637381',
            confirmButtonText: 'Yes, Reject'
        });
    };

    return (
        <div className="admin-command-center fade-in" style={{ padding: '20px' }}>

            {/* ── CRITICAL ALERTS (TOP PRIORITY) ── */}
            <section className="acc-section acc-alerts">
                <div className="acc-alert-card critical">
                    <AlertTriangle size={24} className="acc-alert-icon" />
                    <div className="acc-alert-content">
                        <h4>CRITICAL SHORTAGE</h4>
                        <p>O- blood critically low (Only 2 units left in National Reserve)</p>
                    </div>
                    <button className="acc-btn-outline danger">Broadcast Appeal</button>
                </div>
                <div className="acc-alert-card warning">
                    <ShieldAlert size={24} className="acc-alert-icon" />
                    <div className="acc-alert-content">
                        <h4>URGENT REQUESTS PENDING</h4>
                        <p>2 Emergency hospital requests require immediate authorization.</p>
                    </div>
                    <button className="acc-btn-outline warning">Review Now</button>
                </div>
            </section>

            {/* ── LIVE STATS ── */}
            <section className="acc-section acc-stats-grid">
                <div className="acc-stat-card">
                    <div className="acc-stat-icon-wrap primary">
                        <Users size={24} />
                    </div>
                    <div className="acc-stat-details">
                        <p className="acc-stat-label">Total Donors</p>
                        <h3 className="acc-stat-value">1,240</h3>
                        <span className="acc-stat-trend positive"><TrendingUp size={12}/> +12% this week</span>
                    </div>
                </div>
                <div className="acc-stat-card">
                    <div className="acc-stat-icon-wrap success">
                        <Activity size={24} />
                    </div>
                    <div className="acc-stat-details">
                        <p className="acc-stat-label">Active Hospitals</p>
                        <h3 className="acc-stat-value">32</h3>
                        <span className="acc-stat-trend neutral">All nodes online</span>
                    </div>
                </div>
                <div className="acc-stat-card">
                    <div className="acc-stat-icon-wrap warning">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="acc-stat-details">
                        <p className="acc-stat-label">Pending Requests</p>
                        <h3 className="acc-stat-value">14</h3>
                        <span className="acc-stat-trend negative">2 High Priority</span>
                    </div>
                </div>
                <div className="acc-stat-card">
                    <div className="acc-stat-icon-wrap danger">
                        <Droplet size={24} />
                    </div>
                    <div className="acc-stat-details">
                        <p className="acc-stat-label">Total Blood Units</p>
                        <h3 className="acc-stat-value">540</h3>
                        <span className="acc-stat-trend positive"><TrendingUp size={12}/> +45 units today</span>
                    </div>
                </div>
            </section>

            {/* ── MAIN DASHBOARD GRID ── */}
            <div className="acc-main-grid">
                
                {/* LEFT COLUMN */}
                <div className="acc-col-main">
                    {/* Live Blood Stock Chart */}
                    <div className="acc-card">
                        <div className="acc-card-header">
                            <h2>Live Inventory Thresholds</h2>
                            <button className="acc-btn-text">View Full Inventory <ArrowRight size={16}/></button>
                        </div>
                        <div className="acc-card-body">
                            <div className="acc-stock-grid">
                                {bloodStock.map((stock) => (
                                    <div key={stock.type} className={`acc-stock-item ${stock.status}`}>
                                        <div className="acc-stock-top">
                                            <span className="acc-stock-type">{stock.type}</span>
                                            <span className={`acc-stock-badge ${stock.status}`}>
                                                {stock.status === 'safe' ? 'Safe' : stock.status === 'low' ? 'Low' : '⚠️ Critical'}
                                            </span>
                                        </div>
                                        <h2 className="acc-stock-amount">{stock.units} <span>units</span></h2>
                                        <div className="acc-progress-bar">
                                            <div 
                                                className={`acc-progress-fill ${stock.status}`} 
                                                style={{ width: `${Math.min((stock.units / 50) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Pending Hospital Requests */}
                    <div className="acc-card">
                        <div className="acc-card-header">
                            <h2>Hospital Requests Log</h2>
                            <div className="acc-filter-group">
                                <button className="acc-filter-btn active">All</button>
                                <button className="acc-filter-btn emergency-filter">Emergencies</button>
                            </div>
                        </div>
                        <div className="acc-card-body no-pad">
                            <div className="acc-table-container">
                                <table className="acc-table">
                                    <thead>
                                        <tr>
                                            <th>Request ID</th>
                                            <th>Hospital</th>
                                            <th>Required</th>
                                            <th>Deadline</th>
                                            <th>Priority</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingRequests.map((req) => (
                                            <tr key={req.id} className={req.priority === 'Emergency' ? 'acc-row-emergency' : ''}>
                                                <td className="font-medium">{req.id}</td>
                                                <td>
                                                    <div className="acc-table-hospital">
                                                        <MapPin size={14} className="text-muted"/>
                                                        {req.hospital}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="acc-blood-req">
                                                        <span className="acc-blood-pill">{req.type}</span>
                                                        <span>x {req.units}</span>
                                                    </div>
                                                </td>
                                                <td className="text-muted">{req.time}</td>
                                                <td>
                                                    <span className={`acc-priority-badge ${req.priority.toLowerCase()}`}>
                                                        {req.priority === 'Emergency' && <AlertTriangle size={12}/>}
                                                        {req.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="acc-action-buttons">
                                                        <button 
                                                            className="acc-btn-action approve"
                                                            title="Approve & Allocate"
                                                            onClick={() => handleApprove(req.id)}
                                                        >
                                                            <CheckCircle size={18}/>
                                                        </button>
                                                        <button 
                                                            className="acc-btn-action reject"
                                                            title="Reject Request"
                                                            onClick={() => handleReject(req.id)}
                                                        >
                                                            <XCircle size={18}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="acc-col-side">
                    {/* Demand vs Supply Chart (CSS Visual) */}
                    <div className="acc-card">
                        <div className="acc-card-header">
                            <h2>Demand vs Supply</h2>
                            <BarChart3 size={20} className="text-muted" />
                        </div>
                        <div className="acc-card-body">
                            <p className="text-sm text-muted mb-4">Past 7 days volume projection</p>
                            
                            <div className="acc-css-chart">
                                <div className="acc-chart-legend">
                                    <span><div className="legend-dot supply"></div> Supply</span>
                                    <span><div className="legend-dot demand"></div> Demand</span>
                                </div>
                                <div className="acc-chart-bars">
                                    {[
                                        { s: 60, d: 40, day: 'Mon' },
                                        { s: 80, d: 45, day: 'Tue' },
                                        { s: 50, d: 70, day: 'Wed' },
                                        { s: 90, d: 60, day: 'Thu' },
                                        { s: 70, d: 95, day: 'Fri' },
                                        { s: 40, d: 80, day: 'Sat' },
                                    ].map((col, i) => (
                                        <div className="acc-bar-group" key={i}>
                                            <div className="acc-bar-wrapper">
                                                <div className="acc-bar supply" style={{ height: `${col.s}%`}}></div>
                                                <div className="acc-bar demand" style={{ height: `${col.d}%`}}></div>
                                            </div>
                                            <span className="acc-bar-label">{col.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Activity Feed */}
                    <div className="acc-card acc-feed-card">
                        <div className="acc-card-header">
                            <h2>Live Audit Log</h2>
                            <Activity size={20} className="text-muted" />
                        </div>
                        <div className="acc-card-body">
                            <div className="acc-activity-feed">
                                {activityFeed.map((item) => (
                                    <div className="acc-feed-item" key={item.id}>
                                        <div className={`acc-feed-dot ${item.type}`}></div>
                                        <div className="acc-feed-content">
                                            <p className="acc-feed-text">{item.text}</p>
                                            <span className="acc-feed-time">{item.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="acc-btn-block mt-4">View Full Logs</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
