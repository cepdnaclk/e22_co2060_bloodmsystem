import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth/useAuth';
import {
    Activity, Search, Ambulance,
    LayoutDashboard, Droplet, ClipboardList, Bell, User,
    UserCircle, Camera, QrCode, Stethoscope
} from 'lucide-react';
import Swal from 'sweetalert2';
import './DoctorDashboard.scss';
import QRScanner from '../../components/doctor/QRScanner';
import { getDoctorRequests, createBloodRequest } from '../../api/bloodRequestService';
import { getBloodStock } from '../../api/inventoryService';
import api from '../../api/api';
import {
    approveCampRegistration,
    getScreeningQueue,
    getWorkflowNotifications,
    markWorkflowNotificationRead,
    rejectCampRegistration,
} from '../../services/campService';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [profileImage, setProfileImage] = useState(null);
    const { user } = useAuth();
    const [profileData, setProfileData] = useState(null);

    const [requests, setRequests] = useState([]);
    const [inventory, setInventory] = useState({});
    const [screeningQueue, setScreeningQueue] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [queueActionLoading, setQueueActionLoading] = useState(null);

    const [userProfileData, setUserProfileData] = useState(null);

    useEffect(() => {
        if (user && user.user_id) {
            fetchDoctorProfile();
            fetchDashboardData();
            const timer = setInterval(fetchDashboardData, 8000);
            return () => clearInterval(timer);
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        const [reqRes, invRes, queueRes, notiRes] = await Promise.all([
            getDoctorRequests(),
            getBloodStock(),
            getScreeningQueue(),
            getWorkflowNotifications(),
        ]);

        if (reqRes.success) setRequests(reqRes.data);
        if (invRes.success) setInventory(invRes.data);
        setScreeningQueue(Array.isArray(queueRes) ? queueRes : []);
        setNotifications(Array.isArray(notiRes) ? notiRes : []);
        setLoading(false);
    };

    const fetchDoctorProfile = async () => {
        try {
            const [doctorRes, profileRes] = await Promise.all([
                api.get(`adminDashboard/doctor/profile/${user.user_id}/`),
                api.get('auth/profile/'),
            ]);
            setProfileData(doctorRes.data);
            setUserProfileData(profileRes.data);
            if (doctorRes.data.profile_pic) {
                setProfileImage(doctorRes.data.profile_pic);
            }
        } catch (error) {
            try {
                const profileRes = await api.get('auth/profile/');
                setUserProfileData(profileRes.data);
                setProfileData(null);
            } catch {
                setUserProfileData(null);
                setProfileData(null);
            }
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_pic', file);

        try {
            await api.patch('medicalOfficers/doctor/profile-pic/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setProfileImage(URL.createObjectURL(file));
            Swal.fire({
                title: 'Photo Uploaded!',
                text: 'Your profile photo has been updated.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire('Upload Failed', 'Could not save the image. Try again.', 'error');
        }
    };

    const handleEmergencyRequest = () => {
        Swal.fire({
            title: 'EMERGENCY BLOOD REQUEST',
            html: `
                <div style="text-align: left;">
                    <p style="color: #d32f2f; font-weight: bold; margin-bottom: 10px;">This triggers an immediate high-priority alert to the blood bank AND eligible donors.</p>
                    <label>Blood Group Required:</label>
                    <select id="em-blood" class="swal2-select" style="display: flex; width: 100%;">
                        <option>O-</option><option>O+</option><option>A-</option><option>A+</option>
                        <option>B-</option><option>B+</option><option>AB-</option><option>AB+</option>
                    </select>
                    <label style="margin-top: 10px; display: block;">Units Needed:</label>
                    <input id="em-units" type="number" value="2" class="swal2-input" style="display: flex; width: 100%;" />
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d32f2f',
            confirmButtonText: 'SUBMIT EMERGENCY REQUEST',
            preConfirm: () => ({
                blood_group: document.getElementById('em-blood').value,
                units_requested: document.getElementById('em-units').value,
                priority_level: 'CRITICAL'
            })
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            const res = await createBloodRequest(result.value);
            if (res.success) {
                Swal.fire('Dispatched!', 'Emergency request sent.', 'success');
                fetchDashboardData();
            } else {
                Swal.fire('Error', 'Failed to dispatch emergency request.', 'error');
            }
        });
    };

    const handleBloodRequestSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.priority_level = data.urgency === 'Critical (Immediate)' ? 'CRITICAL' : (data.urgency === 'Urgent (Within 4h)' ? 'HIGH' : 'NORMAL');

        const res = await createBloodRequest(data);
        if (res.success) {
            Swal.fire('Success', 'Blood Request Submitted successfully', 'success');
            fetchDashboardData();
            setActiveTab('requests');
        } else {
            Swal.fire('Error', res.error?.detail || 'Submission failed', 'error');
        }
    };

    const handleApproveDonor = async (registrationId) => {
        try {
            setQueueActionLoading(registrationId);
            await approveCampRegistration(registrationId);
            await fetchDashboardData();
            Swal.fire('Approved', 'Donor approved for collection.', 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.detail || 'Could not approve donor.', 'error');
        } finally {
            setQueueActionLoading(null);
        }
    };

    const handleRejectDonor = async (registrationId) => {
        const result = await Swal.fire({
            title: 'Reject Donor',
            input: 'text',
            inputLabel: 'Reason for rejection',
            inputPlaceholder: 'e.g. Hb below threshold',
            showCancelButton: true,
            preConfirm: (reason) => {
                if (!reason) Swal.showValidationMessage('Rejection reason is required');
                return reason;
            },
        });
        if (!result.isConfirmed) return;

        try {
            setQueueActionLoading(registrationId);
            await rejectCampRegistration(registrationId, result.value);
            await fetchDashboardData();
            Swal.fire('Rejected', 'Donor rejected with reason.', 'info');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.detail || 'Could not reject donor.', 'error');
        } finally {
            setQueueActionLoading(null);
        }
    };

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
        await Swal.fire({ title: 'Notifications', html, width: 700 });
        await Promise.all(notifications.filter((n) => !n.is_read).map((n) => markWorkflowNotificationRead(n.id)));
        await fetchDashboardData();
    };

    const displayName = profileData?.full_name || userProfileData?.profile?.fullName || profileData?.user?.first_name || user?.username || "Doctor Dashboard";
    const displayEmail = profileData?.user?.email || userProfileData?.user?.email || "";
    const displayHospital = profileData?.hospital || userProfileData?.profile?.hospital || "Hospital";
    const displayDepartment = profileData?.specialization || "Dept";

    const renderContent = () => {
        switch (activeTab) {
            case 'screening-queue':
                return (
                    <div className="card fade-in">
                        <div className="card-header">
                            <h2>Screening Queue</h2>
                        </div>
                        <div className="card-body p-0 data-table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Camp</th>
                                        <th>Donor</th>
                                        <th>Blood Group</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {screeningQueue.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No donors waiting for screening.</td></tr>
                                    ) : screeningQueue.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.camp_title}</td>
                                            <td>{item.donor_name}</td>
                                            <td>{item.donor_blood_group || 'N/A'}</td>
                                            <td>{item.donor_phone || 'N/A'}</td>
                                            <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                                            <td style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleApproveDonor(item.id)}
                                                    disabled={queueActionLoading === item.id}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn"
                                                    style={{ backgroundColor: '#d32f2f', color: '#fff' }}
                                                    onClick={() => handleRejectDonor(item.id)}
                                                    disabled={queueActionLoading === item.id}
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'request-blood':
                return (
                    <div className="card fade-in">
                        <div className="card-header">
                            <h2>New Blood Request</h2>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleBloodRequestSubmit} className="form-grid">
                                <div>
                                    <label>Blood Group Required</label>
                                    <select name="blood_group" className="input-field" required>
                                        <option value="A+">A+</option><option value="A-">A-</option>
                                        <option value="B+">B+</option><option value="B-">B-</option>
                                        <option value="O+">O+</option><option value="O-">O-</option>
                                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Units Needed</label>
                                    <input name="units_requested" type="number" min="1" defaultValue="1" className="input-field" required />
                                </div>
                                <div>
                                    <label>Urgency Level</label>
                                    <select name="urgency" className="input-field">
                                        <option>Normal (Within 24h)</option>
                                        <option>Urgent (Within 4h)</option>
                                        <option>Critical (Immediate)</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Reason for Transfusion</label>
                                    <textarea name="reason" rows="2" className="input-field" placeholder="Surgery, Accident, etc." required />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '16px' }}>
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            case 'requests':
                return (
                    <div className="card fade-in">
                        <div className="card-header">
                            <h2>My Requests</h2>
                        </div>
                        <div className="card-body p-0 data-table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Blood Group</th>
                                        <th>Units</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.length === 0 ? (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No requests found.</td></tr>
                                    ) : requests.map(req => (
                                        <tr key={req.id}>
                                            <td>{new Date(req.created_at).toLocaleDateString()}</td>
                                            <td>{req.blood_group}</td>
                                            <td>{req.units_requested}</td>
                                            <td>{req.priority_level}</td>
                                            <td><span className={`badge ${req.status}`}>{req.status}</span></td>
                                            <td>{req.status === 'REJECTED' ? req.rejection_note : (req.status === 'APPROVED' ? req.approval_note : '-')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'availability':
                return (
                    <div className="card fade-in">
                        <div className="card-header">
                            <h2>Blood Availability (Live Inventory)</h2>
                        </div>
                        <div className="card-body">
                            {Object.keys(inventory).length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                    <p>Inventory data currently unavailable.</p>
                                    <button className="btn btn-outline" onClick={fetchDashboardData}>Retry Fetch</button>
                                </div>
                            ) : (
                                <div className="blood-type-grid">
                                    {Object.entries(inventory).map(([group, data]) => (
                                        <div key={group} className={`stock-card status-${data.status}`}>
                                            <h3>{group}</h3>
                                            <div className="units">{data.units} Units</div>
                                            <div className="status">{data.status}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'scanner':
                return <QRScanner />;
            case 'profile':
                return (
                    <div className="card fade-in">
                        <div className="card-header">
                            <h2>My Profile</h2>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                    <div style={{
                                        width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#e0e0e0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                    }}>
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : <User size={80} color="#999" />}
                                    </div>
                                    <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'flex', gap: '8px' }}>
                                        <Camera size={16} /> Upload Photo
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <div style={{ flex: 1, minWidth: '250px' }} className="form-grid">
                                    <div>
                                        <label>Full Name</label>
                                        <input type="text" value={displayName} className="input-field" readOnly />
                                    </div>
                                    <div>
                                        <label>Email</label>
                                        <input type="email" value={displayEmail} className="input-field" readOnly />
                                    </div>
                                    <div>
                                        <label>Hospital</label>
                                        <input type="text" value={displayHospital} className="input-field" readOnly />
                                    </div>
                                    <div>
                                        <label>Department</label>
                                        <input type="text" value={displayDepartment} className="input-field" readOnly />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'dashboard':
            default:
                const pendingCount = requests.filter(r => r.status === 'PENDING').length;
                const completedCount = requests.filter(r => r.status === 'FULFILLED' || r.status === 'COMPLETED').length;

                return (
                    <div className="dashboard-grid fade-in">
                        <div className="col-span-4 card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Total Requests</h3>
                            <h1 style={{ fontSize: '36px', color: '#333', margin: '10px 0' }}>{requests.length}</h1>
                        </div>
                        <div className="col-span-4 card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Pending Requests</h3>
                            <h1 style={{ fontSize: '36px', color: '#ed6c02', margin: '10px 0' }}>{pendingCount}</h1>
                        </div>
                        <div className="col-span-4 card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Donors Waiting Screening</h3>
                            <h1 style={{ fontSize: '36px', color: '#1976d2', margin: '10px 0' }}>{screeningQueue.length}</h1>
                        </div>
                        <div className="col-span-12 card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Completed Requests</h3>
                            <h1 style={{ fontSize: '36px', color: '#2e7d32', margin: '10px 0' }}>{completedCount}</h1>
                        </div>
                    </div>
                );
        }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="doctor-dashboard">
            <div className="doctor-sidebar">
                <div className="sidebar-header" style={{ padding: '0 20px 20px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                    <h2 style={{ fontSize: '20px', color: '#d32f2f', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={24} /> HopeDrop
                    </h2>
                    <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Doctor Portal</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 10px' }}>
                    {[
                        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                        { id: 'screening-queue', icon: <Stethoscope size={20} />, label: 'Screening Queue' },
                        { id: 'request-blood', icon: <Droplet size={20} />, label: 'Request Blood' },
                        { id: 'requests', icon: <ClipboardList size={20} />, label: 'My Requests' },
                        { id: 'availability', icon: <Search size={20} />, label: 'Blood Availability' },
                        { id: 'scanner', icon: <QrCode size={20} />, label: 'Donor Scanner' },
                        { id: 'profile', icon: <UserCircle size={20} />, label: 'Profile' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '500',
                                backgroundColor: activeTab === item.id ? '#e3f2fd' : 'transparent',
                                color: activeTab === item.id ? '#1976d2' : '#555',
                                textAlign: 'left', transition: 'all 0.2s'
                            }}
                        >
                            {item.icon} <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="main-content">
                <div className="header-actions">
                    <div>
                        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: '#333' }}>
                            {displayName}
                        </h1>
                        <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
                            {displayHospital} • {displayDepartment}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleOpenNotifications}>
                            <Bell size={24} color="#555" />
                            <span style={{ position: 'absolute', top: -5, right: -5, background: '#d32f2f', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>
                        </div>
                        <button
                            onClick={handleEmergencyRequest}
                            className="btn"
                            style={{
                                backgroundColor: '#d32f2f', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
                            }}
                        >
                            <Ambulance size={20} />
                            EMERGENCY REQUEST
                        </button>
                    </div>
                </div>

                {loading ? <p>Loading data...</p> : renderContent()}
            </div>
        </div>
    );
};

export default DoctorDashboard;
