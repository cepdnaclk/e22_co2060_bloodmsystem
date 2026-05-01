import React from 'react';
import { AlertTriangle, Activity } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminEmergency = () => {
    const triggerEmergency = () => {
        Swal.fire({
            title: 'BROADCAST EMERGENCY',
            html: `
                <div style="text-align: left;">
                    <p style="color: #d32f2f; font-weight: bold; margin-bottom: 10px;">Warning: This will alert all donors and connected hospitals.</p>
                    <label style="font-size: 14px; font-weight: 500;">Select Urgency Option:</label>
                    <select style="width: 100%; padding: 10px; margin-top: 5px; margin-bottom: 15px; border-radius: 6px; border: 1px solid #ccc;">
                        <option>City-Wide Critical Shortage (O- / O+)</option>
                        <option>Disaster Response Network Activation</option>
                        <option>Specific Blood Type Emergency</option>
                    </select>
                    <label style="font-size: 14px; font-weight: 500;">Emergency Message:</label>
                    <textarea rows="4" style="width: 100%; padding: 10px; margin-top: 5px; border-radius: 6px; border: 1px solid #ccc; font-family: inherit;"></textarea>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'ACTIVATE BROADCAST PROTOCOL',
            width: '500px'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Alert Sent!', 'Emergency Broadcast has been dispatched to all network nodes and available donors.', 'success');
            }
        });
    };

    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', padding: '30px', borderRadius: '12px', color: 'white', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <AlertTriangle size={48} />
                    <div>
                        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>SYSTEM EMERGENCY OVERRIDE</h1>
                        <p style={{ margin: 0, opacity: 0.9 }}>Activate emergency protocols and broadcast critical shortages to the network.</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
                    <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>Broadcast Emergency Shortage</h3>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <AlertTriangle size={40} color="#ef4444" />
                    </div>
                    <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>Instantly notify all registered donors and interconnected hospital networks about critical shortages.</p>
                    <button onClick={triggerEmergency} className="btn" style={{ background: '#ef4444', color: 'white', width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold' }}>
                        ACTIVATE BROADCAST PROTOCOL
                    </button>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>Active Critical Requests (Urgent)</h3>
                    <div style={{ border: '1px solid #fee2e2', background: '#fef2f2', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                            <Activity size={24} color="#ef4444" style={{ marginTop: '2px' }} />
                            <div>
                                <strong style={{ display: 'block', color: '#991b1b', fontSize: '16px' }}>Patient Maria Garcia (PT-11293)</strong>
                                <span style={{ color: '#b91c1c', fontSize: '14px' }}>Needs 4 units of O- immediately at Mercy General.</span>
                            </div>
                        </div>
                        <button className="btn" style={{ border: '1px solid #ef4444', color: '#ef4444', background: 'white' }}>Manage</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEmergency;

