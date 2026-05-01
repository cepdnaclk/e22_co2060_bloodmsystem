import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Activity, User, ShieldAlert, LogIn, LogOut, Moon, Sun, Mail, Calendar, ClipboardList, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/auth/useAuth';
import { useTheme } from '../../context/theme/ThemeContext';
import { getRoleConfig, PUBLIC_NAV_ITEMS, ICON_MAP } from '../../config/roleConfig';
import './Navbar.css';
import { LOGOS } from '../../config/imageAssets';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, role, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    // ─── Build nav items based on role ───
    const roleConfig = isAuthenticated ? getRoleConfig(role) : null;
    const roleNavItems = roleConfig ? roleConfig.navItems : [];

    // Highlight active link
    const navLinkClass = (path) =>
        `nav-link ${location.pathname === path ? 'active' : ''}`;

    const mobileLinkClass = (path) =>
        `mobile-link ${location.pathname === path ? 'active' : ''}`;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // ─── Scroll detection ───
    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // ─── Toggle mobile menu ───
    const toggleMenu = () => {
        setMenuOpen(prev => !prev);
        document.body.classList.toggle('menu-open');
    };

    const closeMenu = () => {
        setMenuOpen(false);
        document.body.classList.remove('menu-open');
    };

    /** Render a nav icon by its string name from roleConfig */
    const renderIcon = (iconName, size = 16) => {
        const IconComponent = ICON_MAP[iconName];
        return IconComponent ? <IconComponent size={size} /> : null;
    };

    return (
        <>
            {/* ==================== MAIN NAVIGATION ==================== */}
            <nav className={`nav ${scrolled ? 'scrolled' : ''}`} id="nav">

                {/* LOGO (left side) */}
                <Link to="/" className="nav-logo" onClick={closeMenu}>
                    <img src={LOGOS.icon} alt="HOPEDROP Logo" className="nav-logo-img" />
                    <span className="logo-text">HOPEDROP</span>
                </Link>

                {/* DESKTOP LINKS (center — hidden below 1024px) */}
                <div className="nav-links">
                    {/* Role-specific links (only when logged in) */}
                    {isAuthenticated && roleNavItems.map((item) => (
                        <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
                            {renderIcon(item.icon)}
                            <span>{item.label}</span>
                        </Link>
                    ))}

                    {/* Public links (always visible) */}
                    {PUBLIC_NAV_ITEMS.map((item) => (
                        <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
                            {item.icon && renderIcon(item.icon)}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* ACTIONS (right side) */}
                <div className="nav-actions">
                    {/* Dark Mode Toggle */}
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        aria-label="Toggle dark mode"
                    >
                        <span className={`theme-toggle-track ${theme === 'dark' ? 'dark' : ''}`}>
                            <span className="theme-toggle-thumb">
                                {theme === 'dark'
                                    ? <Moon size={12} />
                                    : <Sun size={12} />
                                }
                            </span>
                        </span>
                    </button>

                    {/* Auth Button */}
                    {isAuthenticated ? (
                        <button className="nav-cta" onClick={handleLogout}>
                            <LogOut size={16} />
                            <span className="cta-text">Logout</span>
                        </button>
                    ) : (
                        <Link to="/login" className="nav-cta" onClick={closeMenu}>
                            <LogIn size={16} />
                            <span className="cta-text">Login</span>
                        </Link>
                    )}

                    {/* SOS Button */}
                    <button className="nav-sos" title="Emergency / Disaster Mode">
                        <ShieldAlert size={16} />
                        <span>SOS</span>
                    </button>
                </div>

                {/* HAMBURGER TOGGLE (visible below 1024px) */}
                <button
                    className={`nav-menu-toggle ${menuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span className="menu-line"></span>
                    <span className="menu-line"></span>
                </button>
            </nav>

            {/* ==================== MOBILE FULLSCREEN MENU ==================== */}
            <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-inner">
                    {/* Role-specific links (only when logged in) */}
                    {isAuthenticated && roleNavItems.map((item) => (
                        <Link key={item.path} to={item.path} className={mobileLinkClass(item.path)} onClick={closeMenu}>
                            {renderIcon(item.icon, 24)} {item.label}
                        </Link>
                    ))}

                    {/* Public links (always visible) */}
                    {PUBLIC_NAV_ITEMS.map((item) => (
                        <Link key={item.path} to={item.path} className={mobileLinkClass(item.path)} onClick={closeMenu}>
                            {item.icon && renderIcon(item.icon, 24)}
                            <span>{item.label}</span>
                        </Link>
                    ))}

                    {/* Mobile auth action */}
                    <div className="mobile-menu-actions">
                        <button
                            className="mobile-theme-toggle"
                            onClick={toggleTheme}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            {theme === 'dark' ? ' Light Mode' : ' Dark Mode'}
                        </button>

                        {isAuthenticated ? (
                            <button className="mobile-auth-btn" onClick={() => { handleLogout(); closeMenu(); }}>
                                <LogOut size={20} /> Logout
                            </button>
                        ) : (
                            <Link to="/login" className="mobile-auth-btn" onClick={closeMenu}>
                                <LogIn size={20} /> Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
