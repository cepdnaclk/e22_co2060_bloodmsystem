import React, { useState } from 'react';
import { Activity, Clock, Building, ArrowRight, Ambulance } from 'lucide-react';
import Swal from 'sweetalert2';
import './PatientDashboard.css';

const PatientDashboard = () => {
    const [requests, setRequests] = useState([
        { id: 'REQ-10492', type: 'AB-', units: 2, status: 'Processing', hospital: 'General Hospital Colombo', date: 'Oct 24, 2025' }
    ]);

    const handleNewRequest = () => {
        Swal.fire({
            title: 'Request Blood',
            html: `
                <div style="text-align: left; margin-bottom: 10px;">
                    <label>Blood Group Needed</label>
                    <select id="req-type" class="swal2-select" style="width: 100%; font-size: 1rem; margin-top: 5px;">
                        <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                        <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                    </select>
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label>Units Required</label>
                    <input type="number" id="req-units" class="swal2-input" min="1" value="1" style="width: 100%; box-sizing: border-box; display: flex;">
                </div>
                <div style="text-align: left; margin-bottom: 10px;">
                    <label>Receiving Hospital</label>
                    <select id="req-hosp" class="swal2-select" style="width: 100%; font-size: 1rem; margin-top: 5px;">
                        <option>General Hospital Colombo</option>
                        <option>Kandy Teaching Hospital</option>
                        <option>Karapitiya Teaching Hospital</option>
                        <option>Galle General Clinic</option>
                    </select>
                </div>
                <div style="text-align: left;">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="req-emergency" style="width: 20px; height: 20px;">
                        <span style="color: #C62828; font-weight: bold;">This is an Emergency (Life Threatening)</span>
                    </label>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#C62828',
            cancelButtonColor: '#637381',
            confirmButtonText: 'Submit Request',
            preConfirm: () => {
                const type = document.getElementById('req-type').value;
                const units = document.getElementById('req-units').value;
                const hosp = document.getElementById('req-hosp').value;
                const emergency = document.getElementById('req-emergency').checked;
                return { type, units, hosp, emergency };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const newReq = {
                    id: 'REQ-' + Math.floor(Math.random() * 90000 + 10000),
                    type: result.value.type,
                    units: result.value.units,
                    hospital: result.value.hosp,
                    status: 'Pending Verification',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    isEmergency: result.value.emergency
                };
                setRequests([newReq, ...requests]);

                if (result.value.emergency) {
                    Swal.fire({
                        title: 'EMERGENCY REQUEST LOGGED',
                        text: 'Your request has been prioritized and routed to the nearest available National Grid nodes.',
                        icon: 'warning',
                        confirmButtonColor: '#C62828'
                    });
                } else {
                    Swal.fire(
                        'Request Submitted',
                        'Your request is pending medical officer verification.',
                        'success'
                    );
                }
            }
        });
    };

    return (
        <div className="dashboard patient-dashboard fade-in">
            <div className="dashboard-header flex-between align-center">
                <div>
                    <h1 className="welcome-text">Patient Portal</h1>
                    <p className="text-muted">Direct Blood Request and Tracking System</p>
                </div>
                <button className="btn btn-primary" onClick={handleNewRequest} style={{ padding: '12px 24px', fontSize: '1rem' }}>
                    <Activity size={20} style={{ marginRight: '8px' }} />
                    Request Blood
                </button>
            </div>

            <div className="dashboard-grid">
                {/* Active Requests */}
                <div className="col-span-8">
                    <div className="card">
                        <div className="card-header">
                            <h2>Your Active Requests</h2>
                        </div>
                        <div className="card-body p-0">
                            {requests.length === 0 ? (
                                <div className="p-6 text-center text-muted">
                                    <p>You have no active blood requests.</p>
                                </div>
                            ) : (
                                <div className="request-list">
                                    {requests.map(req => (
                                        <div key={req.id} className={`request-item p-4 border-bottom ${req.isEmergency ? 'emergency-bg' : ''}`}>
                                            <div className="flex-between align-center mb-2">
                                                <div className="flex-align-center gap-2">
                                                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: req.isEmergency ? '#C62828' : 'var(--color-secondary)' }}>{req.id}</h3>
                                                    {req.isEmergency && <span className="badge critical pulse-border">EMERGENCY</span>}
                                                </div>
                                                <span className={`badge ${req.status.includes('Pending') ? 'warning' : 'safe'}`}>{req.status}</span>
                                            </div>
                                            <div className="request-details flex-row gap-6 text-sm text-muted mt-2">
                                                <div className="detail-item">
                                                    <strong className="block text-primary" style={{ fontSize: '1.3rem' }}>{req.units} Units of {req.type}</strong>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="flex-align-center gap-1"><Building size={16} /> {req.hospital}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="flex-align-center gap-1"><Clock size={16} /> Requested: {req.date}</span>
                                                </div>
                                            </div>

                                            {/* Static Mock Timeline */}
                                            <div className="tracking-timeline mt-4 pt-3 border-top">
                                                <div className="track-step completed">1. Requested</div>
                                                <ArrowRight size={14} className="text-gray-300 mx-2" />
                                                <div className={`track-step ${req.status !== 'Pending Verification' ? 'completed' : 'active'}`}>2. Verified</div>
                                                <ArrowRight size={14} className="text-gray-300 mx-2" />
                                                <div className="track-step pending">3. Dispatched</div>
                                                <ArrowRight size={14} className="text-gray-300 mx-2" />
                                                <div className="track-step pending">4. Arrived</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Support & Info */}
                <div className="col-span-4">
                    <div className="card bg-gray">
                        <div className="card-header">
                            <h2><Ambulance size={18} className="mr-2 inline" /> Emergency Support</h2>
                        </div>
                        <div className="card-body">
                            <p className="text-sm mb-4">If your situation is life-threatening and your hospital is experiencing critical delays, contact the National Blood Grid Authority directly.</p>

                            <div className="contact-box bg-white p-4 border-radius-md border-left-red shadow-sm mb-3">
                                <h4 className="text-primary-dark mb-1">National Hotline</h4>
                                <a href="tel:119" className="text-xl font-bold" style={{ color: 'var(--color-secondary)' }}>011 236 9931</a>
                            </div>

                            <div className="contact-box bg-white p-4 border-radius-md border-left-gray shadow-sm">
                                <h4 className="mb-1">Colombo Central Bank</h4>
                                <p className="text-sm text-muted">011 236 9935</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
