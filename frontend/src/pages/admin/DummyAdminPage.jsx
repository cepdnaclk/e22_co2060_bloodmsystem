import React from 'react';
import { Settings, Droplet, FileText, Users, HeartPulse, Building2, TrendingUp, ScrollText } from 'lucide-react';
import './DummyAdminPage.css';

const ICON_MAP = {
    'Blood Stock': <Droplet size={48} className="dummy-icon" />,
    'Requests': <FileText size={48} className="dummy-icon" />,
    'Users': <Users size={48} className="dummy-icon" />,
    'Donors': <HeartPulse size={48} className="dummy-icon" />,
    'Hospitals': <Building2 size={48} className="dummy-icon" />,
    'Analytics': <TrendingUp size={48} className="dummy-icon" />,
    'Logs': <ScrollText size={48} className="dummy-icon" />,
    'Settings': <Settings size={48} className="dummy-icon" />,
};

const DummyAdminPage = ({ title }) => {
    return (
        <div className="dummy-page-container fade-in">
            <div className="dummy-content-box">
                <div className="dummy-icon-wrapper">
                    {ICON_MAP[title] || <Settings size={48} className="dummy-icon" />}
                </div>
                <h1 className="dummy-title">{title} Management</h1>
                <p className="dummy-subtitle">
                    This module is currently under construction. Live data integration and backend APIs will be connected soon.
                </p>
                
                <div className="dummy-wireframe">
                    <div className="wireframe-toolbar">
                        <div className="wireframe-btn"></div>
                        <div className="wireframe-search"></div>
                    </div>
                    <div className="wireframe-table">
                        <div className="w-row header"></div>
                        <div className="w-row"></div>
                        <div className="w-row"></div>
                        <div className="w-row"></div>
                        <div className="w-row"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DummyAdminPage;
