import React, { useState, useRef } from 'react';
import {
    LayoutDashboard, Activity, Search, AlertCircle, Droplet, 
    Users, FileText, Settings, Bell, ChevronRight, 
    Check, X, Eye, Clock, Phone, Mail, MapPin, Search as SearchIcon
} from 'lucide-react';
import Swal from 'sweetalert2';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [filterGroup, setFilterGroup] = useState('All');
    const [filterUrgency, setFilterUrgency] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    // Refs for scrolling
    const dashboardRef = useRef(null);
    const requestsRef = useRef(null);
    const emergencyRef = useRef(null);
    const patientsRef = useRef(null);
    const inventoryRef = useRef(null);
    const reportsRef = useRef(null);
    const settingsRef = useRef(null);

    const scrollToSection = (id) => {
        setActiveTab(id);
        const refs = {
            dashboard: dashboardRef,
            requests: requestsRef,
            emergency: emergencyRef,
            patients: patientsRef,
            inventory: inventoryRef,
            reports: reportsRef,
            settings: settingsRef
        };
        if (refs[id] && refs[id].current) {
            refs[id].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Dummy Data
    const requests = [
        { id: 'REQ-101', patient: 'John Doe', group: 'A+', units: 2, ward: 'ICU-A', urgency: 'Urgent', status: 'Pending', date: '2026-04-27', diagnosis: 'Severe Anemia' },
        { id: 'REQ-102', patient: 'Sarah Smith', group: 'O-', units: 4, ward: 'Surgery', urgency: 'Critical', status: 'Pending', date: '2026-04-27', diagnosis: 'Trauma' },
        { id: 'REQ-103', patient: 'Michael Lee', group: 'B+', units: 1, ward: 'General', urgency: 'Normal', status: 'Approved', date: '2026-04-26', diagnosis: 'Routine Surgery' },
        { id: 'REQ-104', patient: 'Emma Watson', group: 'AB+', units: 3, ward: 'Maternity', urgency: 'Urgent', status: 'Rejected', date: '2026-04-25', diagnosis: 'Complications' },
        { id: 'REQ-105', patient: 'David Clark', group: 'O+', units: 2, ward: 'ER', urgency: 'Critical', status: 'Pending', date: '2026-04-27', diagnosis: 'Accident' },
    ];

    const inventory = [
        { type: 'A+', units: 45, status: 'Good' },
        { type: 'A-', units: 12, status: 'Low' },
        { type: 'B+', units: 30, status: 'Good' },
        { type: 'B-', units: 8, status: 'Critical' },
        { type: 'O+', units: 50, status: 'Good' },
        { type: 'O-', units: 5, status: 'Critical' },
        { type: 'AB+', units: 20, status: 'Good' },
        { type: 'AB-', units: 15, status: 'Good' },
    ];

    const donorMatches = [
        { name: 'Alice Cooper', group: 'O-', distance: '2.5 km', lastDonated: '3 months ago', status: 'Available' },
        { name: 'Tom Hardy', group: 'O-', distance: '4.1 km', lastDonated: '5 months ago', status: 'Available' },
        { name: 'Nina Dobrev', group: 'A+', distance: '1.2 km', lastDonated: '2 months ago', status: 'Busy' },
    ];

    const notifications = [
        { id: 1, title: 'New Emergency Request', message: 'Patient Sarah Smith needs 4 units O-', time: '5m ago', type: 'critical' },
        { id: 2, title: 'Inventory Alert', message: 'O- stock is critically low (5 units left)', time: '1h ago', type: 'warning' },
        { id: 3, title: 'Request Approved', message: 'Michael Lee request fulfilled', time: '2h ago', type: 'success' },
    ];

    const timeline = [
        { action: 'Approved request for Michael Lee', time: '10:30 AM' },
        { action: 'Rejected request due to low stock (Emma W.)', time: '09:15 AM' },
        { action: 'Emergency case added: Sarah Smith', time: '08:45 AM' },
        { action: 'Logged in to system', time: '08:00 AM' }
    ];

    const handleAction = (action, request) => {
        if (action === 'view') {
            setSelectedPatient(request);
            return;
        }

        const actionText = action === 'accept' ? 'Approve' : 'Reject';
        const confirmColor = action === 'accept' ? '#22c55e' : '#ef4444';

        Swal.fire({
            title: `Confirm ${actionText}`,
            text: `Are you sure you want to ${actionText.toLowerCase()} the request for ${request.patient}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: confirmColor,
            cancelButtonColor: '#6b7280',
            confirmButtonText: `Yes, ${actionText}`
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Success', `Request has been ${actionText.toLowerCase()}ed.`, 'success');
            }
        });
    };

    const QuickApprove = (name) => {
        Swal.fire('Quick Approved!', `Emergency request for ${name} has been immediately approved. Blood Bank is notified.`, 'success');
    };

    // Filter Logic
    const filteredRequests = requests.filter(req => {
        if (filterGroup !== 'All' && req.group !== filterGroup) return false;
        if (filterUrgency !== 'All' && req.urgency !== filterUrgency) return false;
        if (filterStatus !== 'All' && req.status !== filterStatus) return false;
        return true;
    });

    const renderPatientModal = () => {
        if (!selectedPatient) return null;
        return (
            <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
                <div className="modal-content glass-effect" onClick={e => e.stopPropagation()}>
                    <button className="modal-close" onClick={() => setSelectedPatient(null)}><X size={24} /></button>
                    <h2>Patient Details</h2>
                    <div className="patient-detail-grid">
                        <div className="detail-item">
                            <span className="label">Patient Name</span>
                            <span className="value">{selectedPatient.patient}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Blood Required</span>
                            <span className="value text-primary font-bold">{selectedPatient.group}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Units Needed</span>
                            <span className="value">{selectedPatient.units} Units</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Urgency</span>
                            <span className={`badge ${selectedPatient.urgency.toLowerCase()}`}>{selectedPatient.urgency}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Diagnosis</span>
                            <span className="value">{selectedPatient.diagnosis}</span>
                        </div>
                        <div className="detail-item">
                            <span className="label">Hospital / Ward</span>
                            <span className="value">{selectedPatient.ward}</span>
                        </div>
                        <div className="detail-item full-width">
                            <span className="label">Doctor Notes</span>
                            <div className="notes-box">
                                Patient requires immediate transfusion. Ensure cross-matching is done urgently. History of minor allergic reactions to plasma.
                            </div>
                        </div>
                    </div>
                    
                    <h3 className="mt-4 mb-2">Smart Donor Match Suggestion ⭐</h3>
                    <div className="donor-suggestions">
                        {donorMatches.filter(d => d.group === selectedPatient.group || d.group === 'O-').map((donor, idx) => (
                            <div key={idx} className="donor-card">
                                <div className="donor-info">
                                    <strong>{donor.name}</strong>
                                    <span>{donor.group} • {donor.distance}</span>
                                    <small>Last Donated: {donor.lastDonated}</small>
                                </div>
                                <button className="btn-small btn-primary">Contact</button>
                            </div>
                        ))}
                        {donorMatches.filter(d => d.group === selectedPatient.group || d.group === 'O-').length === 0 && (
                            <p className="text-muted">No immediate nearby matches found.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderMainContent = () => {
        return (
            <div className="main-content-scroll fade-in">
                {/* Dashboard Section */}
                <div ref={dashboardRef} className="section-container" style={{ paddingTop: '10px' }}>
                    <div className="summary-cards">
                        <div className="card glass-card summary-card">
                            <div className="card-icon pending"><Clock size={24} /></div>
                            <div className="card-info">
                                <h3>Pending Requests</h3>
                                <h2>12</h2>
                            </div>
                        </div>
                        <div className="card glass-card summary-card">
                            <div className="card-icon approved"><Check size={24} /></div>
                            <div className="card-info">
                                <h3>Approved Requests</h3>
                                <h2>45</h2>
                            </div>
                        </div>
                        <div className="card glass-card summary-card emergency-pulse">
                            <div className="card-icon emergency"><Activity size={24} /></div>
                            <div className="card-info">
                                <h3>Emergency Requests</h3>
                                <h2 className="text-critical">3</h2>
                            </div>
                        </div>
                        <div className="card glass-card summary-card">
                            <div className="card-icon inventory"><Droplet size={24} /></div>
                            <div className="card-info">
                                <h3>Available Units</h3>
                                <h2>187</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Emergency Section */}
                {requests.some(r => r.urgency === 'Critical') && (
                    <div ref={emergencyRef} className="section-container" style={{ paddingTop: '20px' }}>
                        <div className="emergency-section glass-card critical-glow">
                            <div className="emergency-header">
                                <h2 className="flex items-center gap-2"><AlertCircle className="animate-pulse" /> CRITICAL EMERGENCY CASES</h2>
                            </div>
                            <div className="emergency-list">
                                {requests.filter(r => r.urgency === 'Critical').map(req => (
                                    <div key={req.id} className="emergency-item">
                                        <div className="em-info">
                                            <strong>{req.patient}</strong>
                                            <span>{req.ward} • Need {req.units} units of {req.group}</span>
                                        </div>
                                        <button className="btn btn-critical animate-pulse-btn" onClick={() => QuickApprove(req.patient)}>
                                            Quick Approve
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Request Management Table */}
                <div ref={requestsRef} className="section-container" style={{ paddingTop: '20px' }}>
                    <div className="card glass-card mt-6">
                        <div className="card-header flex justify-between items-center">
                            <h2>Blood Request Management</h2>
                            <div className="filters">
                                <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}>
                                    <option value="All">All Groups</option>
                                    <option value="A+">A+</option><option value="O-">O-</option>
                                    <option value="B+">B+</option><option value="AB+">AB+</option>
                                </select>
                                <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)}>
                                    <option value="All">All Urgency</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="Critical">Critical</option>
                                </select>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="All">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Patient Name</th>
                                        <th>Blood Group</th>
                                        <th>Units</th>
                                        <th>Ward</th>
                                        <th>Urgency</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map(req => (
                                        <tr key={req.id}>
                                            <td className="font-medium">{req.patient}</td>
                                            <td><span className="blood-drop-badge">{req.group}</span></td>
                                            <td>{req.units}</td>
                                            <td>{req.ward}</td>
                                            <td><span className={`badge ${req.urgency.toLowerCase()}`}>{req.urgency}</span></td>
                                            <td><span className={`status-dot ${req.status.toLowerCase()}`}>{req.status}</span></td>
                                            <td>
                                                <div className="action-buttons">
                                                    {req.status === 'Pending' && (
                                                        <>
                                                            <button className="btn-icon accept" onClick={() => handleAction('accept', req)} title="Accept"><Check size={16} /></button>
                                                            <button className="btn-icon reject" onClick={() => handleAction('reject', req)} title="Reject"><X size={16} /></button>
                                                        </>
                                                    )}
                                                    <button className="btn-icon view" onClick={() => handleAction('view', req)} title="View Details"><Eye size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredRequests.length === 0 && <div className="no-data">No requests found matching filters.</div>}
                        </div>
                    </div>
                </div>

            </div>
        );
    };

    return (
        <div className="doctor-dashboard-modern">
            {/* Sidebar */}
            <aside className="sidebar glass-effect">
                <div className="sidebar-header">
                    <div className="doctor-profile-mini">
                        <div className="avatar">DR</div>
                        <div className="info">
                            <strong>Dr. E. Chen</strong>
                            <span>Chief Surgeon</span>
                        </div>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    {[
                        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                        { id: 'requests', icon: <Droplet size={20} />, label: 'Blood Requests' },
                        { id: 'emergency', icon: <AlertCircle size={20} />, label: 'Emergency Cases' },
                    ].map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => scrollToSection(item.id)}
                        >
                            {item.icon} <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

            </aside>

            {/* Main Area */}
            <main className="main-area">
                <header className="topbar glass-effect">
                    <div className="search-wrapper">
                        <SearchIcon size={18} />
                        <input type="text" placeholder="Search patients, requests, ID..." />
                    </div>
                    <div className="topbar-actions">
                        <button className="icon-btn relative">
                            <Bell size={20} />
                            <span className="notification-dot"></span>
                        </button>
                    </div>
                </header>

                <div className="dashboard-layout">
                    <div className="left-column">
                        {renderMainContent()}
                    </div>
                    
                    {/* Right Side Panel */}
                    <div className="right-column">
                        {/* Inventory Snapshot */}
                        <div className="side-panel glass-card">
                            <h3>Inventory Snapshot</h3>
                            <div className="inventory-grid">
                                {inventory.map(item => (
                                    <div key={item.type} className={`inv-item ${item.status.toLowerCase()}`}>
                                        <span className="type">{item.type}</span>
                                        <span className="units">{item.units}U</span>
                                    </div>
                                ))}
                            </div>
                            <div className="inv-legend">
                                <span className="legend-item"><span className="dot good"></span> Healthy</span>
                                <span className="legend-item"><span className="dot low"></span> Low</span>
                                <span className="legend-item"><span className="dot critical"></span> Critical</span>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="side-panel glass-card mt-4">
                            <h3>Recent Notifications</h3>
                            <div className="notification-list">
                                {notifications.map(notif => (
                                    <div key={notif.id} className={`notif-item ${notif.type}`}>
                                        <div className="notif-content">
                                            <strong>{notif.title}</strong>
                                            <p>{notif.message}</p>
                                            <span className="time">{notif.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="side-panel glass-card mt-4 flex-grow">
                            <h3>Activity Timeline</h3>
                            <div className="timeline">
                                {timeline.map((item, idx) => (
                                    <div key={idx} className="timeline-item">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <p>{item.action}</p>
                                            <span className="time">{item.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {renderPatientModal()}
        </div>
    );
};

export default DoctorDashboard;
