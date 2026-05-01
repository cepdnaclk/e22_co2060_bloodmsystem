import React from 'react';
import { Droplet, Search } from 'lucide-react';

const AdminInventory = () => {
    return (
        <div className="fade-in" style={{ padding: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Droplet size={24} color="#ef4444" /> Global Blood Inventory</h2>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
                            <Search size={16} color="#64748b" />
                            <input type="text" placeholder="Search Blood Bank..." style={{ background: 'transparent', border: 'none', outline: 'none', marginLeft: '8px' }} />
                        </div>
                        <select style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                            <option>All Blood Groups</option>
                            <option>A+</option><option>A-</option><option>O+</option><option>O-</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Blood Bank</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Location</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Blood Group</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Units Available</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Expiring &lt; 7 Days</th>
                                <th style={{ padding: '12px', fontWeight: '500' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 12px' }}><strong>Central City Regional Bank</strong></td>
                                <td style={{ padding: '16px 12px', color: '#64748b' }}>Downtown Area</td>
                                <td style={{ padding: '16px 12px', color: '#ef4444', fontWeight: 'bold' }}>O-</td>
                                <td style={{ padding: '16px 12px', color: '#ef4444', fontWeight: 'bold' }}>4 Units</td>
                                <td style={{ padding: '16px 12px' }}>0</td>
                                <td style={{ padding: '16px 12px' }}><span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>Low Stock</span></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 12px' }}><strong>Mercy General Hospital</strong></td>
                                <td style={{ padding: '16px 12px', color: '#64748b' }}>Westside</td>
                                <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>A+</td>
                                <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>42 Units</td>
                                <td style={{ padding: '16px 12px', color: '#f59e0b', fontWeight: 'bold' }}>2 Units</td>
                                <td style={{ padding: '16px 12px' }}><span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>Sufficient</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminInventory;

