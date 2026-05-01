import React, { useState, useEffect, Suspense } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    Activity, Users, Database, Settings, LayoutDashboard, 
    Droplet, MapPin, Search, Bell, Moon, Sun, Menu, 
    ChevronLeft, LogOut, ShieldCheck, Calculator, TrendingUp, ScrollText, UserSquare2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/auth/useAuth';
import { useTheme } from '../../context/theme/ThemeContext';
import ModernCalculator from '../widgets/ModernCalculator';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Sidebar states
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCalcOpen, setIsCalcOpen] = useState(false);
    
    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobileOpen) setIsMobileOpen(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const sidebarLinks = [
        {
            group: 'MAIN',
            items: [
                { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                { path: '/admin/emergency', icon: <AlertTriangle size={20} />, label: 'Emergency Hub' },
                { path: '/admin/stock', icon: <Droplet size={20} />, label: 'Blood Stock' },
                { path: '/admin/requests', icon: <Activity size={20} />, label: 'Requests' },
            ]
        },
        {
            group: 'MANAGEMENT',
            items: [
                { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
                { path: '/admin/donors', icon: <UserSquare2 size={20} />, label: 'Donors' },
                { path: '/admin/hospitals', icon: <MapPin size={20} />, label: 'Hospitals' },
            ]
        },
        {
            group: 'SYSTEM',
            items: [
                { path: '/admin/analytics', icon: <TrendingUp size={20} />, label: 'Analytics' },
                { path: '/admin/logs', icon: <ScrollText size={20} />, label: 'Logs' },
                { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
            ]
        }
    ];

    return (
        <div className={`admin-layout-wrapper ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            
            {/* OVERLAY FOR MOBILE */}
            <div 
                className={`admin-mobile-overlay ${isMobileOpen ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
            ></div>

            {/* ── SIDEBAR ── */}
            <aside className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Droplet className="logo-icon" size={24} />
                        {!isCollapsed && <span className="logo-text">HOPEDROP</span>}
                    </div>
                    <button 
                        className="sidebar-collapse-btn desktop-only" 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        <ChevronLeft size={20} className={`collapse-icon ${isCollapsed ? 'rotate' : ''}`} />
                    </button>
                    <button 
                        className="sidebar-close-btn mobile-only" 
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>

                <div className="sidebar-nav">
                    {sidebarLinks.map((group, idx) => (
                        <div className="sidebar-group" key={idx}>
                            {!isCollapsed && <p className="sidebar-group-label">{group.group}</p>}
                            {isCollapsed && <div className="sidebar-group-divider"></div>}
                            
                            {group.items.map((link) => (
                                <NavLink 
                                    to={link.path} 
                                    key={link.path}
                                    end={link.path === '/admin'}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                    title={isCollapsed ? link.label : ''}
                                >
                                    <span className="sidebar-link-icon">{link.icon}</span>
                                    {!isCollapsed && <span className="sidebar-link-text">{link.label}</span>}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <button className="sidebar-logout-btn" onClick={handleLogout} title={isCollapsed ? "Logout" : ""}>
                        <LogOut size={20} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT AREA ── */}
            <div className="admin-main-wrapper">
                
                {/* ── TOPBAR ── */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button 
                            className="mobile-menu-btn" 
                            onClick={() => setIsMobileOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        
                        <div className="topbar-search">
                            <Search size={18} className="search-icon" />
                            <input type="text" placeholder="Search hospitals, users, requests..." />
                        </div>
                    </div>

                    <div className="topbar-right">
                        {/* Calculator Toggle */}
                        <button className="topbar-icon-btn" onClick={() => setIsCalcOpen(true)} title="Quick Calculator">
                            <Calculator size={20} />
                        </button>

                        {/* Theme Toggle */}
                        <button className="topbar-icon-btn" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Notifications */}
                        <button className="topbar-icon-btn notifications" title="Notifications">
                            <Bell size={20} />
                            <span className="notif-badge">3</span>
                        </button>

                        {/* Profile Dropdown (Simplified visually for layout) */}
                        <div className="topbar-profile">
                            <div className="profile-avatar">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="profile-details desktop-only">
                                <span className="profile-name">{user?.username || 'Admin User'}</span>
                                <span className="profile-role">System Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── DYNAMIC PAGE CONTENT ── */}
                <main className="admin-content-area">
                    <Suspense fallback={
                        <div className="admin-loading-skeleton">
                            <div className="skeleton-header"></div>
                            <div className="skeleton-grid">
                                <div className="skeleton-card"></div>
                                <div className="skeleton-card"></div>
                                <div className="skeleton-card"></div>
                                <div className="skeleton-card"></div>
                            </div>
                            <div className="skeleton-main-body"></div>
                        </div>
                    }>
                        <Outlet />
                    </Suspense>
                </main>
            </div>

            {/* FLOATING TOOLS */}
            <ModernCalculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
        </div>
    );
};

export default AdminLayout;
