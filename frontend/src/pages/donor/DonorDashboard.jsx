import React from 'react';
import { MapPin, Calendar, Clock, Award, Droplet, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import './DonorDashboard.css';

const DonorDashboard = () => {
    const nearbyCamps = [
        { name: 'Kandy National Hospital', details: '2.4 miles away • Closes at 6:00 PM' },
        { name: 'Community Center Drive', details: '5.1 miles away • Tomorrow, 9:00 AM' }
    ];
    return (
        <div className="dashboard donor-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="welcome-text">Welcome back, Sarah</h1>
                    <p className="text-muted">Blood Group: <strong style={{ color: 'var(--color-primary)' }}>O Negative (O-)</strong></p>
                </div>
                <div className="eligibility-badge eligible">
                    <CheckCircle size={20} />
                    Eligible to Donate
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Quick Stats */}
                <div className="col-span-12 stats-grid">
                    <div className="stat-box">
                        <Droplet size={24} color="var(--color-primary)" />
                        <div className="stat-content">
                            <h3>4</h3>
                            <p>Total Donations</p>
                        </div>
                    </div>
                    <div className="stat-box">
                        <Award size={24} color="var(--color-warning)" />
                        <div className="stat-content">
                            <h3>12</h3>
                            <p>Lives Saved</p>
                        </div>
                    </div>
                    <div className="stat-box">
                        <Clock size={24} color="var(--color-success)" />
                        <div className="stat-content">
                            <h3>Today</h3>
                            <p>Next Eligible Date</p>
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="col-span-8">
                    <div className="card">
                        <div className="card-header">
                            <h2>Nearby Donation Drives</h2>
                            <button className="btn btn-outline text-sm">View Map</button>
                        </div>
                        <div className="card-body">
                            {nearbyCamps.map((camp, index) => (
                                <div key={index} className="camp-item">
                                    <div className="camp-icon"><MapPin size={24} /></div>
                                    <div className="camp-details">
                                        <h4>{camp.name}</h4>
                                        <p className="text-sm text-muted">{camp.details}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-outline text-sm"
                                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(camp.name)}`, '_blank')}
                                        >
                                            Get Location
                                        </button>
                                        <button
                                            className="btn btn-primary text-sm"
                                            onClick={() => {
                                                Swal.fire({
                                                    title: 'Book Donation Slot',
                                                    text: `Confirm your booking for ${camp.name}?`,
                                                    icon: 'info',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#C62828',
                                                    confirmButtonText: 'Yes, Book it!'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        Swal.fire(
                                                            'Booked!',
                                                            'Your donation slot is confirmed.',
                                                            'success'
                                                        );
                                                    }
                                                });
                                            }}
                                        >Book</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* History Outline */}
                <div className="col-span-4">
                    <div className="card bg-gray">
                        <div className="card-header">
                            <h2>Recent History</h2>
                        </div>
                        <div className="card-body">
                            <div className="history-timeline">
                                <div className="timeline-item">
                                    <div className="timeline-dot bg-green"></div>
                                    <div className="timeline-content">
                                        <h4>Blood Issued</h4>
                                        <p className="text-xs text-muted">A patient received your blood. Thank you!</p>
                                        <span className="text-xs">Oct 12, 2025</span>
                                    </div>
                                </div>
                                <div className="timeline-item">
                                    <div className="timeline-dot bg-red"></div>
                                    <div className="timeline-content">
                                        <h4>Donated</h4>
                                        <p className="text-xs text-muted">Central City Hospital</p>
                                        <span className="text-xs">Oct 10, 2025</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;
