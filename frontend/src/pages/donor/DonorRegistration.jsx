import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../auth/Login.css';
import '../auth/SignUp.css';
import './DonorRegistration.css';

/* ── Shared SweetAlert2 theme ─────────────────────────────── */
const swalBase = {
    customClass: {
        popup: 'swal-hopedrop-popup',
        title: 'swal-hopedrop-title',
        htmlContainer: 'swal-hopedrop-html',
        confirmButton: 'swal-hopedrop-confirm',
        icon: 'swal-hopedrop-icon',
    },
    width: 'clamp(260px, 90vw, 380px)',
    padding: 'clamp(1.2rem, 4vw, 2rem)',
};

const DonorRegistration = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        bloodGroup: '',
        gender: '',
        phone: '',
        email: '',
        city: '',
        weight: '',
        nic: '',
        confirmMedical: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const { fullName, dob, bloodGroup, gender, phone, email, city, weight, nic, confirmMedical } = formData;

        /* Basic Required Field Validation */
        if (!fullName || !dob || !bloodGroup || !gender || !phone || !email || !city || !weight || !nic) {
            const msg = 'Please fill all required fields.';
            setError(msg);
            Swal.fire({
                ...swalBase,
                position: 'top-end',
                icon: 'warning',
                title: 'Missing Fields',
                text: msg,
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                toast: true,
            });
            return;
        }

        /* Checkbox Validation */
        if (!confirmMedical) {
            const msg = 'You must confirm that you have no major medical conditions.';
            setError(msg);
            Swal.fire({
                ...swalBase,
                position: 'top-end',
                icon: 'warning',
                title: 'Confirmation Required',
                text: msg,
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                toast: true,
            });
            return;
        }

        /* NIC Validation */
        // Sri Lankan NIC Format: 12 digits OR 9 digits ending in 'V' or 'X' (case insensitive)
        const formatNic = nic.trim().toLowerCase();
        const nicPattern12 = /^\d{12}$/;
        const nicPattern9 = /^\d{9}[vx]$/;

        if (!nicPattern12.test(formatNic) && !nicPattern9.test(formatNic)) {
            const msg = 'Invalid NIC format. Must be 12 numbers (e.g., 123456789012) or 9 numbers ending in v/x (e.g., 123456789v).';
            setError(msg);
            Swal.fire({
                ...swalBase,
                position: 'top-end',
                icon: 'error',
                title: 'Invalid NIC',
                text: msg,
                showConfirmButton: false,
                timer: 3500,
                timerProgressBar: true,
                toast: true,
            });
            return;
        }

        /* Mock API Submission */
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);

            Swal.fire({
                ...swalBase,
                position: 'top-end',
                icon: 'success',
                title: 'Registration Complete!',
                text: `Thank you for registering to donate blood, ${fullName}.`,
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                toast: true,
            }).then(() => {
                // Navigate back to donor dashboard or equivalent upon success
                navigate('/donor');
            });
        }, 1500);
    };

    return (
        <div className="signup-container new-design donor-reg-container">
            <div className="signup-split-card-new donor-split-card">

                {/* ── Left Visual Panel ── */}
                <div className="signup-visual-section-new donor-visual-section">
                    <div className="visual-orbs">
                        <div className="orb orb-1"></div>
                        <div className="orb orb-2"></div>
                        <div className="orb orb-3"></div>
                    </div>
                    <div className="visual-content-new">
                        <div className="visual-badge">
                            🩸&nbsp; HOPEDROP Donor
                        </div>
                        <h1 className="visual-title-new" style={{ fontSize: '2.4rem' }}>
                            Become A<br />Hero Today
                        </h1>
                        <p className="visual-subtitle-new">
                            Your generous donation can save up to 3 lives. Register to find nearby camps and urgent requests.
                        </p>
                        <div className="visual-stats" style={{ flexDirection: 'column', gap: '1rem' }}>
                            <div className="visual-stat">
                                <span className="stat-num" style={{ fontSize: '1.2rem' }}>1 Pint</span>
                                <span className="stat-label">Saves 3 Lives</span>
                            </div>
                            <div className="visual-stat">
                                <span className="stat-num" style={{ fontSize: '1.2rem' }}>Every 2 Seconds</span>
                                <span className="stat-label">Someone needs blood</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Form Panel ── */}
                <div className="signup-form-section-new donor-form-section" style={{ padding: '2.5rem' }}>
                    <div className="auth-header-new">
                        <h2>Donor Registration Form</h2>
                        <p>Join our mission and make a difference.</p>
                    </div>

                    {error && <div className="auth-error-message">⚠️ {error}</div>}

                    {success && (
                        <div className="auth-success-message">
                            <div className="success-icon-check">✓</div>
                            Registered successfully! Redirecting…
                        </div>
                    )}

                    <form className="auth-form-new" onSubmit={handleSubmit}>

                        {/* Row 1: Name & DOB */}
                        <div className="form-row-new">
                            <div className="form-group-new half-width">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                />
                            </div>
                            <div className="form-group-new half-width">
                                <label>Date of Birth *</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    style={{ color: formData.dob ? 'inherit' : '#888' }}
                                />
                            </div>
                        </div>

                        {/* Row 2: Blood Group & Gender */}
                        <div className="form-row-new">
                            <div className="form-group-new half-width">
                                <label>Blood Group *</label>
                                <select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    className="auth-select-new"
                                >
                                    <option value="" disabled>Select blood group</option>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group-new half-width">
                                <label>Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                    className="auth-select-new"
                                >
                                    <option value="" disabled>Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 3: Phone & Email */}
                        <div className="form-row-new">
                            <div className="form-group-new half-width">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Enter your phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                />
                            </div>
                            <div className="form-group-new half-width">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        {/* Row 4: City & Weight */}
                        <div className="form-row-new">
                            <div className="form-group-new half-width">
                                <label>City/Location *</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="Enter your city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                />
                            </div>
                            <div className="form-group-new half-width">
                                <label>Weight (kg) *</label>
                                <input
                                    type="number"
                                    name="weight"
                                    placeholder="Enter your weight"
                                    min="40"
                                    max="200"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        {/* Row 5: NIC Number */}
                        <div className="form-group-new">
                            <label>NIC Number *</label>
                            <input
                                type="text"
                                name="nic"
                                placeholder="eg: 123456789v or 123456789012"
                                value={formData.nic}
                                onChange={handleChange}
                                disabled={loading || success}
                            />
                        </div>

                        {/* Confirmation Checkbox */}
                        <label className="donor-confirm-checkbox mt-2">
                            <input
                                type="checkbox"
                                name="confirmMedical"
                                checked={formData.confirmMedical}
                                onChange={handleChange}
                                disabled={loading || success}
                                style={{ accentColor: '#C62828', width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.88rem', color: 'var(--color-secondary)' }}>
                                I confirm I have no major medical conditions and am eligible to donate blood.
                            </span>
                        </label>

                        <div className="form-actions-new" style={{ marginTop: '1.5rem' }}>
                            <Link to="/donor" className="btn-back-new">CANCEL</Link>
                            <button
                                type="submit"
                                className={`btn-next-new ${loading ? 'loading' : ''}`}
                                disabled={loading || success}
                            >
                                {loading ? <span className="spinner-small"></span> : 'SUBMIT'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DonorRegistration;
