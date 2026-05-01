import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader, X, MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { registerUser, resolveHospital } from '../../api/authService';
import { useForm } from '../../hooks/useForm';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../utils/swalUtils';
import { flattenApiErrors, mapApiKeyToFormField } from '../../utils/errorParser';
import { getCountries, getDistricts } from '../../config/locationData';
import { ROLE_OPTIONS } from '../../config/roleConfig';
import { searchHospitalsByName } from '../../utils/overpassApi';

/* ── Validation helpers ── */
const VALIDATORS = {
    role:       (v) => (!v ? 'Please select a role.' : ''),
    username:   (v) => (!v ? 'Username is required.' : v.length < 3 ? 'Username must be at least 3 characters.' : ''),
    nic:        (v) => {
        if (!v) return 'NIC is required.';
        if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(v)) return 'Enter a valid NIC (e.g. 200012345V or 200012345678).';
        return '';
    },
    bloodGroup: (v) => (!v ? 'Blood group is required.' : ''),
    email:      (v) => {
        if (!v) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
        return '';
    },
    phone:      (v) => {
        if (!v) return 'Phone number is required.';
        if (!/^(\+94|0)7[0-9]{8}$/.test(v.replace(/\s/g, ''))) return 'Enter a valid Sri Lankan number (+94XXXXXXXXX or 07XXXXXXXX).';
        return '';
    },
    country:    (v) => (!v ? 'Please select a country.' : ''),
    district:   (v) => (!v ? 'Please select a district.' : ''),
    password:   (v) => {
        if (!v) return 'Password is required.';
        if (v.length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Z]/.test(v)) return 'Password must contain at least one uppercase letter.';
        if (!/[0-9]/.test(v)) return 'Password must contain at least one number.';
        if (!/[^A-Za-z0-9]/.test(v)) return 'Password must contain at least one special character.';
        return '';
    },
    confirmPassword: (v, form) => {
        if (!v) return 'Please confirm your password.';
        if (v !== form.password) return 'Passwords do not match.';
        return '';
    },
};

const SignUp = () => {
    // ---- [Existing UseForm & States] ----
    const {
        formData,
        setFormData,
        fieldErrors,
        setFieldErrors,
        handleChange,
        handleBlur,
        inputClass
    } = useForm({
        role: '',
        username: '',
        nic: '',
        bloodGroup: '',
        email: '',
        phone: '',
        country: '',
        district: '',
        password: '',
        confirmPassword: '',
    }, VALIDATORS);

    const [step, setStep] = useState(1);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [resolvedHospitalId, setResolvedHospitalId] = useState(null);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [districts, setDistricts] = useState([]);
    const navigate = useNavigate();

    /* ── Hospital autocomplete state ── */
    const [hospitalSearch, setHospitalSearch] = useState('');
    const [hospitalSuggestions, setHospitalSuggestions] = useState([]);
    const [hospitalSearching, setHospitalSearching] = useState(false);
    const [showHospitalDropdown, setShowHospitalDropdown] = useState(false);
    const hospitalInputRef = useRef(null);
    const hospitalDropdownRef = useRef(null);
    const hospitalDebounceRef = useRef(null);

    /* ── Countries list ── */
    const countries = getCountries();

    // ---- [Existing Effects] ----
    useEffect(() => {
        if (formData.country) {
            setDistricts(getDistricts(formData.country));
            setFormData((prev) => ({ ...prev, district: '' }));
            setSelectedHospital(null);
            setResolvedHospitalId(null);
        } else {
            setDistricts([]);
        }
    }, [formData.country, setFormData]);

    useEffect(() => {
        let strength = 0;
        const { password } = formData;
        if (password.length > 7) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        setPasswordStrength(strength);
    }, [formData, formData.password]);

    useEffect(() => {
        if (hospitalDebounceRef.current) clearTimeout(hospitalDebounceRef.current);

        if (!hospitalSearch || hospitalSearch.length < 2) {
            setHospitalSuggestions([]);
            setShowHospitalDropdown(false);
            return;
        }

        hospitalDebounceRef.current = setTimeout(async () => {
            setHospitalSearching(true);
            try {
                const results = await searchHospitalsByName(hospitalSearch, formData.district || '');
                setHospitalSuggestions(results);
                setShowHospitalDropdown(true);
            } catch {
                setHospitalSuggestions([]);
                setShowHospitalDropdown(true);
            } finally {
                setHospitalSearching(false);
            }
        }, 400);

        return () => clearTimeout(hospitalDebounceRef.current);
    }, [hospitalSearch, formData.district]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                hospitalDropdownRef.current && !hospitalDropdownRef.current.contains(e.target) &&
                hospitalInputRef.current && !hospitalInputRef.current.contains(e.target)
            ) {
                setShowHospitalDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ---- [Existing Handlers] ----
    const handleSelectHospital = useCallback(async (hospital) => {
        setHospitalSearch(hospital.name);
        setShowHospitalDropdown(false);

        try {
            const response = await resolveHospital({
                place_id: hospital.id,
                name: hospital.name,
                lat: hospital.lat,
                lon: hospital.lon,
                address: hospital.address,
            });

            setSelectedHospital(hospital);
            setResolvedHospitalId(response.data.id);
        } catch {
            setSelectedHospital(null);
            setResolvedHospitalId(null);
            showErrorToast('Hospital Selection Failed', 'Could not resolve selected hospital. Please try another one.', 2500);
        }
    }, []);

    const handleClearHospital = () => {
        setSelectedHospital(null);
        setResolvedHospitalId(null);
        setHospitalSearch('');
        setHospitalSuggestions([]);
        setShowHospitalDropdown(false);
    };

    // ---- [Step Logic & Proceed handlers] ----
    const handleNextStep = () => {
        let isValid = true;
        let stepErrors = {};

        const fieldsToValidate = {
            1: ['role', 'username', 'nic', 'bloodGroup', 'email', 'phone'],
            2: ['country', 'district'] // hospital is optional
        };

        (fieldsToValidate[step] || []).forEach(field => {
            const errorMsg = VALIDATORS[field](formData[field], formData);
            if (errorMsg) {
                isValid = false;
                stepErrors[field] = errorMsg;
            }
        });

        if (!isValid) {
            setFieldErrors(prev => ({ ...prev, ...stepErrors }));
            showWarningToast('Validation Required', 'Please complete all required fields for this step.', 2000);
            return;
        }

        setStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (step !== 3) return; // Only submit on final step

        // Validation for the 3rd step
        let isValid = true;
        let stepErrors = {};
        ['password', 'confirmPassword'].forEach(field => {
            const errorMsg = VALIDATORS[field](formData[field], formData);
            if (errorMsg) {
                isValid = false;
                stepErrors[field] = errorMsg;
            }
        });

        if (!isValid) {
            setFieldErrors(prev => ({ ...prev, ...stepErrors }));
            showWarningToast('Validation Errors', 'Please fix the errors below.', 2000);
            return;
        }

        setLoading(true);

        try {
            let hospitalId = resolvedHospitalId;

            if (selectedHospital && !hospitalId) {
                const response = await resolveHospital({
                    place_id: selectedHospital.id,
                    name: selectedHospital.name,
                    lat: selectedHospital.lat,
                    lon: selectedHospital.lon,
                    address: selectedHospital.address,
                });
                hospitalId = response.data.id;
                setResolvedHospitalId(hospitalId);
            }

            const payload = {
                username: formData.username,
                email: formData.email,
                role: formData.role || 'patient',
                password: formData.password,
                password2: formData.confirmPassword,
                profile: {
                    fullName: formData.username,
                    nic_number: formData.nic,
                    phoneNumber: formData.phone,
                    blood_group: formData.bloodGroup,
                    country: null,
                    district: null,
                    hospital: hospitalId || null,
                },
            };

            await registerUser(payload);
            setSuccess(true);
            showSuccessToast('Account Created!', `Welcome to HOPEDROP, ${formData.username}. Redirecting to login…`, 2200).then(() => {
                navigate('/login');
            });

        } catch (err) {
            const data = err.response?.data;
            let message = 'Registration failed. Please try again.';
            let popupTitle = 'Registration Failed';

            if (data && typeof data === 'object') {
                const flattened = flattenApiErrors(data);
                const inlineErrors = {};
                const messages = flattened.map(({ key, message: msg }) => {
                    const mappedField = mapApiKeyToFormField(key);
                    if (mappedField) {
                        inlineErrors[mappedField] = msg;
                    }
                    return key ? `${key}: ${msg}` : msg;
                });

                if (Object.keys(inlineErrors).length > 0) {
                    setFieldErrors((prev) => ({ ...prev, ...inlineErrors }));
                }

                if (messages.length > 0) {
                    message = messages.join('\n');
                }

                const hasExistingDataError = flattened.some(({ message: msg }) =>
                    /(already|exists|taken|registered|unique)/i.test(msg)
                );
                if (hasExistingDataError) {
                    popupTitle = 'Existing Data Found';
                }
            }
            setError(message);
            showErrorToast(popupTitle, message, 3000);
        } finally {
            setLoading(false);
        }
    };

    // UI Renders for Steps
    const renderStepIndicators = () => (
        <div className="wizard-indicators">
            {[1, 2, 3].map(num => (
                <div key={num} className={`wizard-step ${step >= num ? 'active' : ''} ${step > num ? 'completed' : ''}`}>
                    <div className="step-circle">
                        {step > num ? <Check size={16} /> : num}
                    </div>
                    <span>{num === 1 ? 'Personal' : num === 2 ? 'Location' : 'Security'}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="signup-container new-design wizard-mode">
            <div className="signup-split-card-new">
                
                {/* ── Left Visual Panel ── */}
                <div className="signup-visual-section-new">
                    <div className="visual-orbs">
                        <div className="orb orb-1"></div>
                        <div className="orb orb-2"></div>
                        <div className="orb orb-3"></div>
                    </div>
                    <div className="visual-content-new">
                        <div className="visual-badge">
                            🩸&nbsp; HOPEDROP Platform
                        </div>
                        <h1 className="visual-title-new">
                            Join &amp;<br />Save Lives
                        </h1>
                        <p className="visual-subtitle-new">
                            Register today and become part of Sri Lanka's National Blood Donation Network.
                        </p>
                        <div className="visual-stats">
                            <div className="visual-stat">
                                <span className="stat-num">10k+</span>
                                <span className="stat-label">Donors</span>
                            </div>
                            <div className="visual-stat">
                                <span className="stat-num">250+</span>
                                <span className="stat-label">Hospitals</span>
                            </div>
                            <div className="visual-stat">
                                <span className="stat-num">48h</span>
                                <span className="stat-label">Alerts</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Form Panel (Wizard) ── */}
                <div className="signup-form-section-new">
                    
                    {renderStepIndicators()}

                    <div className="auth-header-new" style={{ marginTop: '1.5rem', marginBottom: '1.2rem'}}>
                        <h2>{step === 1 ? "Let's Get Started!" : step === 2 ? "Where are you located?" : "Secure your account"}</h2>
                        <p>{step === 1 ? "Tell us a little about yourself" : step === 2 ? "Help us customize your nearby requests" : "Create a strong password to protect your data"}</p>
                    </div>

                    {error && <div className="auth-error-message">⚠️ {error}</div>}
                    {success && (
                        <div className="auth-success-message">
                            <div className="success-icon-check">✓</div>
                            Account created! Redirecting…
                        </div>
                    )}

                    <form className="auth-form-new wizard-form-container" onSubmit={handleSubmit}>
                        
                        {/* ── STEP 1: Basic Info ── */}
                        <div className={`wizard-step-content ${step === 1 ? 'active' : ''}`}>
                            <div className="form-group-new">
                                <label>I am registering as *</label>
                                <select name="role" value={formData.role} onChange={handleChange} onBlur={handleBlur} className={`auth-select-new ${inputClass('role')}`}>
                                    <option value="" disabled>Select your role…</option>
                                    {ROLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                {fieldErrors.role && <span className="field-error">{fieldErrors.role}</span>}
                            </div>
                            <div className="form-row-new">
                                <div className="form-group-new half-width">
                                    <label>Username *</label>
                                    <input type="text" name="username" autoComplete="off" value={formData.username} onChange={handleChange} onBlur={handleBlur} className={inputClass('username')} />
                                    {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
                                </div>
                                <div className="form-group-new half-width">
                                    <label>NIC *</label>
                                    <input type="text" name="nic" autoComplete="off" value={formData.nic} onChange={handleChange} onBlur={handleBlur} className={inputClass('nic')} />
                                    {fieldErrors.nic && <span className="field-error">{fieldErrors.nic}</span>}
                                </div>
                            </div>
                            <div className="form-row-new">
                                <div className="form-group-new half-width">
                                    <label>Blood Group *</label>
                                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} onBlur={handleBlur} className={`auth-select-new ${inputClass('bloodGroup')}`}>
                                        <option value="" disabled>Select…</option>
                                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                    {fieldErrors.bloodGroup && <span className="field-error">{fieldErrors.bloodGroup}</span>}
                                </div>
                                <div className="form-group-new half-width">
                                    <label>Email *</label>
                                    <input type="email" name="email" autoComplete="none" value={formData.email} onChange={handleChange} onBlur={handleBlur} className={inputClass('email')} />
                                    {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                                </div>
                            </div>
                            <div className="form-group-new">
                                <label>Phone *</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} className={`w-50 ${inputClass('phone')}`} />
                                {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                            </div>
                        </div>

                        {/* ── STEP 2: Location ── */}
                        <div className={`wizard-step-content ${step === 2 ? 'active' : ''}`}>
                            <div className="form-row-new">
                                <div className="form-group-new half-width">
                                    <label>Country *</label>
                                    <select name="country" value={formData.country} onChange={handleChange} onBlur={handleBlur} className={`auth-select-new ${inputClass('country')}`}>
                                        <option value="" disabled>Select country…</option>
                                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {fieldErrors.country && <span className="field-error">{fieldErrors.country}</span>}
                                </div>
                                <div className="form-group-new half-width">
                                    <label>District *</label>
                                    <select name="district" value={formData.district} onChange={handleChange} onBlur={handleBlur} disabled={!formData.country} className={`auth-select-new ${inputClass('district')}`}>
                                        <option value="" disabled>{formData.country ? 'Select district…' : 'Select country first'}</option>
                                        {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                    </select>
                                    {fieldErrors.district && <span className="field-error">{fieldErrors.district}</span>}
                                </div>
                            </div>

                            <div className="form-group-new">
                                <label>Nearest Hospital</label>
                                <div className="hospital-autocomplete-wrap">
                                    <div className="hospital-search-input-wrap">
                                        <Search size={16} className="hospital-search-icon" />
                                        <input
                                            ref={hospitalInputRef}
                                            type="text"
                                            placeholder={formData.district ? "Type hospital name… (e.g. Colombo General)" : "Select a district first"}
                                            value={hospitalSearch}
                                            onChange={(e) => {
                                                setHospitalSearch(e.target.value);
                                                if (!e.target.value) handleClearHospital();
                                            }}
                                            onFocus={() => { if (hospitalSearch.length >= 2) setShowHospitalDropdown(true); }}
                                            className="hospital-search-input"
                                            autoComplete="off"
                                            disabled={!formData.district}
                                        />
                                        {hospitalSearching && <Loader size={16} className="hospital-input-spinner" />}
                                        {selectedHospital && (
                                            <button type="button" className="hospital-clear-btn" onClick={handleClearHospital} title="Clear selection"><X size={14} /></button>
                                        )}
                                    </div>
                                    {showHospitalDropdown && hospitalSearch.length >= 2 && (
                                        <ul className="hospital-suggestions" ref={hospitalDropdownRef}>
                                            <li className="hospital-suggestions-header">
                                                {hospitalSuggestions.length} result{hospitalSuggestions.length !== 1 ? 's' : ''} for "{hospitalSearch}"
                                            </li>
                                            {hospitalSuggestions.length === 0 && !hospitalSearching && (
                                                <li className="hospital-suggestion-item" style={{ color: '#888', cursor: 'default', justifyContent: 'center', padding: '1rem' }}>
                                                    No hospitals found. Please try another name.
                                                </li>
                                            )}
                                            {hospitalSuggestions.map((h) => (
                                                <li key={h.id} className={`hospital-suggestion-item ${selectedHospital?.id === h.id ? 'selected' : ''}`} onClick={() => handleSelectHospital(h)}>
                                                    <MapPin size={14} className="hospital-item-icon" />
                                                    <div className="hospital-item-info">
                                                        <span className="hospital-item-name">{h.name}</span>
                                                        {h.shortAddress && <span className="hospital-item-address">{h.shortAddress}</span>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {selectedHospital && (
                                    <div className="hospital-selected-badge">
                                        <MapPin size={14} />
                                        <span>Selected: <strong>{selectedHospital.name}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── STEP 3: Security ── */}
                        <div className={`wizard-step-content ${step === 3 ? 'active' : ''}`}>
                            <div className="form-row-new">
                                <div className="form-group-new half-width">
                                    <label>Password *</label>
                                    <input type={showPassword ? 'text' : 'password'} name="password" autoComplete="new-password" value={formData.password} onChange={handleChange} onBlur={handleBlur} className={inputClass('password')} />
                                    {formData.password && (
                                        <div className="password-strength-meter">
                                            <div className={`strength-bar level-${passwordStrength}`}></div>
                                        </div>
                                    )}
                                    {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                                </div>
                                <div className="form-group-new half-width">
                                    <label>Confirm Password *</label>
                                    <input type={showPassword ? 'text' : 'password'} name="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} className={inputClass('confirmPassword')} />
                                    {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                                </div>
                            </div>
                            <label style={{ fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)'}}>
                                <input type="checkbox" style={{ accentColor: '#C62828' }} checked={showPassword} onChange={() => setShowPassword(!showPassword)} /> Show passwords
                            </label>
                        </div>
                        
                        {/* ── Action Buttons ── */}
                        <div className="form-actions-wizard">
                            {step > 1 ? (
                                <button type="button" className="btn-wizard-back" onClick={handlePrevStep} disabled={loading || success}>
                                    <ChevronLeft size={16} /> BACK
                                </button>
                            ) : (
                                <Link to="/login" className="btn-wizard-back">
                                    <ChevronLeft size={16} /> LOGIN
                                </Link>
                            )}

                            {step < 3 ? (
                                <button type="button" className="btn-wizard-next" onClick={handleNextStep}>
                                    NEXT <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button type="submit" className={`btn-wizard-submit ${loading ? 'loading' : ''}`} disabled={loading || success}>
                                    {loading ? <span className="spinner-small"></span> : 'CREATE ACCOUNT'}
                                </button>
                            )}
                        </div>

                    </form>
                    
                </div>
            </div>
        </div>
    );
};

export default SignUp;
