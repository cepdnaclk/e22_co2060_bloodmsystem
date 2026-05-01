import React from 'react';
import { Activity, Search, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminRequests = () => {
    const handleAction = (type, id) => {
        Swal.fire({
            title: `${type === 'approve' ? 'Approve' : 'Reject'} Request?`,
            text: `Are you sure you want to ${type} ${id}?`,
            icon: type === 'approve' ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonColor: type === 'approve' ? '#22c55e' : '#ef4444'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire(type === 'approve' ? 'Approved!' : 'Rejected!', '', 'success');
            }
        });
    };

    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>All Blood Requests</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
                            <Search size={16} color="#64748b" />
                            <input type="text" placeholder="Search Requests..." style={{ background: 'transparent', border: 'none', outline: 'none', marginLeft: '8px' }} />
                        </div>
                        <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                            <option>All Statuses</option>
                            <option>Pending</option>
                            <option>Approved</option>
                            <option>Rejected</option>
                            <option>Completed</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Patient / ID</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Blood</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Units</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Doctor</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Status</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 12px' }}><strong>John Doe</strong> <br /><span style={{ fontSize: '12px', color: '#64748b' }}>PT-84930</span></td>
                                <td style={{ padding: '16px 12px' }}><strong>A+</strong></td>
                                <td style={{ padding: '16px 12px' }}>2</td>
                                <td style={{ padding: '16px 12px', color: '#64748b' }}>Dr. Emily Chen</td>
                                <td style={{ padding: '16px 12px' }}><span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>Pending</span></td>
                                <td style={{ padding: '16px 12px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleAction('approve', 'PT-84930')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a' }} title="Approve"><CheckCircle size={18} /></button>
                                        <button onClick={() => handleAction('reject', 'PT-84930')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Reject"><XCircle size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 12px' }}><strong>Maria Garcia</strong> <br /><span style={{ fontSize: '12px', color: '#64748b' }}>PT-11293</span></td>
                                <td style={{ padding: '16px 12px', color: '#ef4444' }}><strong>O-</strong></td>
                                <td style={{ padding: '16px 12px' }}>4</td>
                                <td style={{ padding: '16px 12px', color: '#64748b' }}>Dr. Alan Smith</td>
                                <td style={{ padding: '16px 12px' }}><span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>Critical</span></td>
                                <td style={{ padding: '16px 12px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => handleAction('approve', 'PT-11293')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a' }} title="Approve"><CheckCircle size={18} /></button>
                                        <button onClick={() => handleAction('reject', 'PT-11293')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Reject"><XCircle size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRequests;

