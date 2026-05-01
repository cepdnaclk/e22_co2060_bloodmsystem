import React, { useState } from 'react';
import { Search, MapPin, Plus, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminHospitals = () => {
    const handleAdd = () => {
        Swal.fire({
            title: 'Add New Blood Bank',
            html: `
                <div style="text-align: left; font-size: 14px;">
                    <label>Hospital/Bank Name:</label>
                    <input type="text" class="swal2-input" placeholder="e.g. Apollo Hub" style="margin: 5px 0 15px 0;">
                    <label>Location/District:</label>
                    <input type="text" class="swal2-input" placeholder="e.g. Central District" style="margin: 5px 0 15px 0;">
                    <label>Contact Email:</label>
                    <input type="email" class="swal2-input" placeholder="contact@hospital.com" style="margin: 5px 0 15px 0;">
                </div>
            `,
            confirmButtonText: 'Register Hub',
            confirmButtonColor: '#3b82f6',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Added!', 'New blood bank added successfully.', 'success');
            }
        });
    };

    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Blood Banks & Hospitals</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
                            <Search size={16} color="#64748b" />
                            <input type="text" placeholder="Search hospitals..." style={{ background: 'transparent', border: 'none', outline: 'none', marginLeft: '8px' }} />
                        </div>
                        <button className="btn btn-primary" onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={16} /> Add Blood Bank
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Name</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Location</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Contact</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Status</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 12px' }}><strong>Mercy General Hospital</strong></td>
                                <td style={{ padding: '16px 12px', color: '#64748b' }}><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Westside</td>
                                <td style={{ padding: '16px 12px', color: '#64748b' }}>+1 555-0198</td>
                                <td style={{ padding: '16px 12px' }}><span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500' }}>Active</span></td>
                                <td style={{ padding: '16px 12px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>Edit</button>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>Deactivate</button>
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

export default AdminHospitals;

