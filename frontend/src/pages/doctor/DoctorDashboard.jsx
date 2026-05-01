import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth/useAuth';
import {
    AlertCircle, Activity, Search, Ambulance,
    LayoutDashboard, Droplet, ClipboardList, Bell, User, Clock, CheckCircle, XCircle,
    UserCircle, Camera
} from 'lucide-react';
import Swal from 'sweetalert2';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [profileImage, setProfileImage] = useState(null);
    const { user, authTokens } = useAuth();
    const [profileData, setProfileData] = useState(null);

    // Replace with your actual backend base URL if it's different
    const API_BASE = "http://localhost:8000/api/v1/users"; 

    useEffect(() => {
        if (user && user.user_id) {
            fetchDoctorProfile();
        }
    }, [user, authTokens]);

    const fetchDoctorProfile = async () => {
        try {
            const res = await axios.get(`${API_BASE}/doctor/profile/${user.user_id}/`, {
                headers: { Authorization: `Bearer ${authTokens?.access}` }
            });
            setProfileData(res.data);
            if (res.data.profile_pic) {
                setProfileImage(res.data.profile_pic);
            }
        } catch (error) {
            console.error("Error fetching profile", error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            // Assuming your backend model expects 'profile_pic' or 'image'
            formData.append('profile_pic', file);

            try {
                await axios.patch(`${API_BASE}/doctor/profile-pic/`, formData, {
                    headers: {
                        Authorization: `Bearer ${authTokens?.access}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                setProfileImage(URL.createObjectURL(file));
                Swal.fire({
                    title: 'Photo Uploaded!',
                    text: 'Your profile photo has been updated on the server.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error("Upload error", err);
                Swal.fire('Upload Failed', 'Could not save the image. Try again.', 'error');
            }
        }
    };

    const handleEmergencyRequest = () => {
        Swal.fire({
            title: 'EMERGENCY BLOOD REQUEST',
            html: `
                <div style="text-align: left;">
                    <p style="color: #d32f2f; font-weight: bold; margin-bottom: 10px;">Warning: This triggers an immediate high-priority alert to the blood bank.</p>
                    <label>Blood Group Required:</label>
                    <select id="em-blood" style="width: 100%; padding: 8px; margin-bottom: 10px; border-radius: 4px;">
                        <option>O- (Universal Donor)</option>
                        <option>O+</option>
                        <option>A-</option>
                        <option>A+</option>
                        <option>B-</option>
                        <option>B+</option>
                        <option>AB-</option>
                        <option>AB+</option>
                    </select>
                    <label>Units Needed:</label>
                    <input id="em-units" type="number" value="2" style="width: 100%; padding: 8px; margin-top: 5px; margin-bottom: 10px; border-radius: 4px; border: 1px solid #ccc;" />
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d32f2f',
            cancelButtonColor: '#637381',
            confirmButtonText: 'SUBMIT EMERGENCY REQUEST'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Dispatched!', 'Emergency request sent to Blood Bank Admin and Logistics immediately.', 'success');
            }
        });
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'request':
                return (
                    <div className="card fade-in">
                        <div className="card-header">
                            <h2>New Blood Request</h2>
                        </div>
                        <div className="card-body">
                            <form style={{ display: 'grid', gap: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label>Patient Name</label>
                                        <input type="text" className="input-large" placeholder="Enter patient name" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                                    </div>
                                    <div>
                                        <label>Patient ID / MRN</label>
                                        <input type="text" className="input-large" placeholder="E.g. PT-10293" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                                    </div>
                                    <div>
                                        <label>Blood Group Required</label>
                                        <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                                            <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                                            <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Units Needed</label>
                                        <input type="number" min="1" defaultValue="1" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                                    </div>
                                    <div>
                                        <label>Urgency Level</label>
                                        <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                                            <option>Normal (Within 24h)</option>
                                            <option>Urgent (Within 4h)</option>
                                            <option>Critical (Immediate)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Required Date/Time</label>
                                        <input type="datetime-local" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                                    </div>
                                </div>
                                <div>
                                    <label>Reason for Transfusion</label>
                                    <textarea rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} placeholder="Surgery, Accident, Anemia, etc."></textarea>
                                </div>
                                <button type="button" className="btn btn-primary" style={{ padding: '12px', fontSize: '16px', maxWidth: '200px' }} onClick={() => Swal.fire('Success', 'Blood Request Submitted successfully', 'success')}>
                                    Submit Request
                                </button>
                            </form>
                        </div>
                    </div>
                );
            case 'status':
                return (
                    <div className="card fade-in">
                        <div className="card-header">
                            <h2>My Request Status</h2>
                            <div className="search-bar">
                                <Search size={16} />
                                <input type="text" placeholder="Search by patient ID or name..." />
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <table className="data-table" style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Blood Group</th>
                                        <th>Units</th>
                                        <th>Urgency</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>John Doe</strong><br/><span style={{fontSize: '12px', color: '#666'}}>PT-84930</span></td>
                                        <td>A+</td>
                                        <td>2</td>
                                        <td>Urgent</td>
                                        <td><span className="badge warning"><Clock size={12} style={{marginRight: '4px', display: 'inline'}} /> Pending</span></td>
                                        <td><button className="btn btn-outline text-xs">View/Edit</button></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Maria Garcia</strong><br/><span style={{fontSize: '12px', color: '#666'}}>PT-11293</span></td>
                                        <td>O-</td>
                                        <td>4</td>
                                        <td>Critical</td>
                                        <td><span className="badge safe"><CheckCircle size={12} style={{marginRight: '4px', display: 'inline'}} /> Approved</span></td>
                                        <td><button className="btn btn-primary text-xs">Acknowledge</button></td>
                                    </tr>
                                    <tr>
                                        <td><strong>Robert Smith</strong><br/><span style={{fontSize: '12px', color: '#666'}}>PT-33211</span></td>
                                        <td>AB+</td>
                                        <td>1</td>
                                        <td>Normal</td>
                                        <td><span className="badge critical"><XCircle size={12} style={{marginRight: '4px', display: 'inline'}} /> Rejected</span></td>
                                        <td><button className="btn btn-outline text-xs">View Reason</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'availability':
                return (
                    <div className="card fade-in">
                        <div className="card-header">
                            <h2>Check Blood Availability</h2>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '30px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Select Blood Group</label>
                                    <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                                        <option>O-</option><option>O+</option><option>A-</option><option>A+</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary" style={{ padding: '10px 24px' }}>Check Stock</button>
                            </div>

                            <h4>Nearby Blood Banks</h4>
                            <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
                                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>Hospital Blood Bank (Internal)</strong>
                                        <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0 0' }}>Current Stock: <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>High (14 Units)</span></p>
                                    </div>
                                    <button className="btn btn-outline" onClick={() => setActiveTab('request')}>Request Here</button>
                                </div>
                                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>Central City Regional Bank</strong>
                                        <p style={{ color: '#666', fontSize: '14px', margin: '4px 0 0 0' }}>Distance: 5km | Stock: <span style={{ color: '#ed6c02', fontWeight: 'bold' }}>Medium (5 Units)</span></p>
                                    </div>
                                    <button className="btn btn-outline" onClick={() => setActiveTab('request')}>Request Here</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'profile':
                return (
                    <div className="card fade-in">
                        <div className="card-header">
                            <h2>My Profile</h2>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                {/* Photo Upload Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '200px' }}>
                                    <div style={{
                                        width: '150px', height: '150px', borderRadius: '50%', backgroundColor: '#e0e0e0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                                        border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={80} color="#999" />
                                        )}
                                    </div>
                                    <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
                                        <Camera size={16} /> Upload Photo
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                                    </label>
                                </div>

                                {/* Details Section */}
                                <div style={{ flex: 1, minWidth: '300px' }}>
                                    <form style={{ display: 'grid', gap: '20px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                            <div>
                                                <label>Full Name</label>
                                                <input type="text" value={profileData?.full_name || profileData?.user?.first_name || "Doctor"} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                                            </div>
                                            <div>
                                                <label>Email</label>
                                                <input type="email" value={profileData?.user?.email || "doctor@hospital.com"} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                                            </div>
                                            <div>
                                                <label>Hospital</label>
                                                <input type="text" value={profileData?.hospital_name || "Central City Hospital"} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #eee', backgroundColor: '#f9f9f9', color: '#666' }} />
                                            </div>
                                            <div>
                                                <label>Department</label>
                                                <input type="text" value={profileData?.department || "Surgery"} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                                            </div>
                                            <div>
                                                <label>Phone Number</label>
                                                <input type="tel" value={profileData?.phone_number || "+1 (555) 019-2834"} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                                            </div>
                                            <div>
                                                <label>Medical License No.</label>
                                                <input type="text" value={profileData?.license_number || "MD-884920"} readOnly style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #eee', backgroundColor: '#f9f9f9', color: '#666' }} />
                                            </div>
                                        </div>
                                        <button type="button" className="btn btn-primary" style={{ padding: '12px', fontSize: '16px', maxWidth: '200px', marginTop: '10px' }} onClick={() => Swal.fire('Saved', 'Other profile updates should be handled by Admin as per policy.', 'info')}>
                                            Save Changes
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'dashboard':
            default:
                return (
                    <div className="dashboard-grid fade-in">
                        {/* Summary Widgets */}
                        <div className="col-span-4 card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>My Pending Requests</h3>
                            <h1 style={{ fontSize: '36px', color: '#1976d2', margin: '10px 0' }}>4</h1>
                            <button className="btn btn-outline text-xs" onClick={() => setActiveTab('status')}>View All</button>
                        </div>
                        <div className="col-span-4 card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h3 style={{ color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Completed This Week</h3>
                            <h1 style={{ fontSize: '36px', color: '#2e7d32', margin: '10px 0' }}>12</h1>
                            <span style={{ fontSize: '12px', color: '#666' }}>Successful Transfusions</span>
                        </div>
                        <div className="col-span-4 card" style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fff3e0' }}>
                            <h3 style={{ color: '#e65100', fontSize: '14px', textTransform: 'uppercase' }}>Network Alerts</h3>
                            <h1 style={{ fontSize: '36px', color: '#e65100', margin: '10px 0' }}>1</h1>
                            <span style={{ fontSize: '12px', color: '#e65100' }}>O- Shortage in Region</span>
                        </div>

                        {/* Recent Activity */}
                        <div className="col-span-12 card" style={{ marginTop: '20px' }}>
                            <div className="card-header">
                                <h2>Recent Updates</h2>
                            </div>
                            <div className="card-body">
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ padding: '15px 0', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '50%', color: '#2e7d32' }}><CheckCircle size={20} /></div>
                                        <div>
                                            <strong style={{ display: 'block' }}>Request Approved: Patient Maria Garcia (PT-11293)</strong>
                                            <span style={{ color: '#666', fontSize: '13px' }}>Blood Bank has dispatched 4 units of O-. Expected arrival in 15 mins.</span>
                                        </div>
                                        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#999' }}>10 mins ago</span>
                                    </li>
                                    <li style={{ padding: '15px 0', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ background: '#e3f2fd', padding: '10px', borderRadius: '50%', color: '#1976d2' }}><Activity size={20} /></div>
                                        <div>
                                            <strong style={{ display: 'block' }}>Transfusion Completed: Patient Susan Lee (PT-88331)</strong>
                                            <span style={{ color: '#666', fontSize: '13px' }}>1 unit of A+ successfully transfused.</span>
                                        </div>
                                        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#999' }}>2 hours ago</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }} className="doctor-dashboard">
            {/* SIDEBAR */}
            <div style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e0e0e0', padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #eee', marginBottom: '10px' }}>
                    <h2 style={{ fontSize: '20px', color: '#d32f2f', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={24} /> HopeDrop
                    </h2>
                    <span style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Doctor Portal</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 10px' }}>
                    {[
                        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                        { id: 'request', icon: <Droplet size={20} />, label: 'Request Blood' },
                        { id: 'status', icon: <ClipboardList size={20} />, label: 'Request Status' },
                        { id: 'availability', icon: <Search size={20} />, label: 'Check Availability' },
                        { id: 'patients', icon: <User size={20} />, label: 'Patient Records' },
                        { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
                        { id: 'profile', icon: <UserCircle size={20} />, label: 'My Profile' },
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
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: '#333' }}>{profileData?.full_name || profileData?.user?.first_name || "Doctor Dashboard"}</h1>
                        <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>{profileData?.hospital_name || "Central City Hospital"} • Dept of {profileData?.department || "Surgery"}</p>
                    </div>
                    <button
                        onClick={handleEmergencyRequest}
                        style={{
                            backgroundColor: '#d32f2f', color: 'white', border: 'none', padding: '12px 24px',
                            borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
                        }}
                    >
                        <Ambulance size={20} />
                        EMERGENCY REQUEST
                    </button>
                </div>

                {/* Render active tab content */}
                {renderContent()}
            </div>
        </div>
    );
};

export default DoctorDashboard;
