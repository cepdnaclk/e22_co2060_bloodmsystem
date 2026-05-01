import React from 'react';
import { Search, Plus, Edit2, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminUsers = () => {
    const handleBlock = (name) => {
        Swal.fire({
            title: 'Block User?',
            text: `Are you sure you want to block ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, block!'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Blocked!', `${name} has been blocked.`, 'success');
            }
        });
    };

    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>User Management</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
                            <Search size={16} color="#64748b" />
                            <input type="text" placeholder="Search users..." style={{ background: 'transparent', border: 'none', outline: 'none', marginLeft: '8px' }} />
                        </div>
                        <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                            <option>All Roles</option>
                            <option>Doctors</option>
                            <option>Donors</option>
                            <option>Staff</option>
                        </select>
                        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={16} /> Add User
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Name</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Email</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Role</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Status</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Registered</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 12px' }}><strong>Dr. Emily Chen</strong></td>
                                <td style={{ padding: '16px 12px', color: '#64748b' }}>emily.chen@hospital.com</td>
                                <td style={{ padding: '16px 12px' }}><span style={{ background: '#e0f2fe', color: '#2563eb', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>Doctor</span></td>
                                <td style={{ padding: '16px 12px' }}><span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>Active</span></td>
                                <td style={{ padding: '16px 12px', color: '#64748b' }}>Oct 12, 2025</td>
                                <td style={{ padding: '16px 12px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }} title="Edit"><Edit2 size={18} /></button>
                                        <button onClick={() => handleBlock('Dr. Emily Chen')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="Block"><XCircle size={18} /></button>
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

export default AdminUsers;

