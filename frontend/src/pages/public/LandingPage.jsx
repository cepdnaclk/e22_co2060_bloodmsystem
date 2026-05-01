import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Activity, MapPin, Search, PhoneCall, ArrowRight, Shield, Clock, ChevronDown } from 'lucide-react';
import './LandingPage.css';
import { LANDING } from '../../config/imageAssets';
import { PHOTOS } from '../../config/imageAssets';

const LandingPage = () => {
const DEFAULT_STOCK = {
    "A+": "Normal",
    "A-": "Normal",
    "B+": "Normal",
    "B-": "Normal",
    "AB+": "Normal",
    "AB-": "Normal",
    "O+": "Normal",
    "O-": "Normal",
};

const [bloodStock, setBloodStock] = useState(DEFAULT_STOCK);
const [lastUpdated, setLastUpdated] = useState(null);
const [stockLoading, setStockLoading] = useState(true);
const [stockError, setStockError] = useState("");

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const fetchLiveStock = async () => {
    try {
        setStockError("");
        const response = await fetch(`${API_BASE}/blood/live-stock/`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const statusByType = { ...DEFAULT_STOCK };
        (data.stocks || []).forEach((item) => {
            if (item?.bloodType && item?.status) {
                statusByType[item.bloodType] = item.status;
            }
        });

        setBloodStock(statusByType);
        setLastUpdated(data.updatedAt || null);
    } catch (error) {
        setStockError("Unable to load live blood stock right now.");
        console.error("Live stock fetch failed:", error);
    } finally {
        setStockLoading(false);
    }
};

useEffect(() => {
    fetchLiveStock();
    const intervalId = setInterval(fetchLiveStock, 60000); // refresh every 60s
    return () => clearInterval(intervalId);
}, []);


    // Intersection Observer for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const heroImages = [
        PHOTOS.photo1,
        PHOTOS.photo2,
        PHOTOS.photo3,
        PHOTOS.photo4,
        PHOTOS.photo5,
        PHOTOS.photo6,
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
        }, 10000);
        
        return () => clearInterval(interval);
    }, []);
    return (
        <div className="landing-page-new">
            {/* Hero Section */}
            <section 
                className="hero-section-new"
                style={{
                    backgroundImage: `linear-gradient(rgba(18, 25, 33, 0.8), rgba(18, 25, 33, 0.8)), url(${heroImages[currentImageIndex]})`,
                    transition: 'background-image 1s ease-in-out'
                }}
            >
                <div className="hero-container">
                    <div className="hero-content animate-on-scroll">
                        <div className="hero-badge-new">
                            <Shield size={16} /> Sri Lanka National Blood Transfusion Service
                        </div>
                        <h4 className="hero-top-title">Donate Blood, Save Life!</h4>
                        <h1 className="hero-title">
                            Donate Your Blood & <br /> Inspires to Others
                        </h1>

                        {/* This is the part that centers the button */}
                        <div className="hero-actions-new">
                            <Link to="/donor" className="scroll-donate-btn btn-donate-large">
                                DONATE NOW <Heart size={18} style={{ marginLeft: '8px' }} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scroll Down Signal */}
                <div className="hero-scroll-signal">
                    <div className="scroll-indicator" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                        <span className="scroll-text">Scroll Down</span>
                        <ChevronDown size={24} className="bounce-arrow" />
                    </div>
                </div>
            </section>

            {/* Service Cards Section (Moved below Hero) */}
            <section className="services-section">
                <div className="container">
                    <div className="services-cards-wrapper">
                        <div className="services-container">
                            <div className="services-styles-box-inner animate-on-scroll" style={{ transitionDelay: '0.1s' }}>
                                <div className="service-card-wrapper">
                                    <div className="service-img-box">
                                        <img src={LANDING.donorRegistration} alt="Blood Donation" />
                                    </div>
                                    <div className="service-content-main-box">
                                        <div className="service-icon-box bg-dark">
                                            <Heart size={36} color="white" />
                                        </div>
                                        <h3 className="service-box-title">Donor Registration</h3>
                                        <p>Join our community of lifesavers. Register today to seamlessly book your donation appointments.</p>
                                    </div>
                                    <div className="service-read-more">
                                        <Link to="/donor/register">Register Now</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="services-styles-box-inner animate-on-scroll" style={{ transitionDelay: '0.3s' }}>
                                <div className="service-card-wrapper">
                                    <div className="service-img-box">
                                        <img src={LANDING.checkEligibility} alt="Blood Bank" />
                                    </div>
                                    <div className="service-content-main-box">
                                        <div className="service-icon-box bg-dark">
                                            <Shield size={36} color="white" />
                                        </div>
                                        <h3 className="service-box-title">Check Your Eligibility</h3>
                                        <p>Not sure if you can donate blood today? Take our quick, automated health questionnaire to instantly verify your eligibility.</p>
                                    </div>
                                    <div className="service-read-more">
                                        <Link to="/donor/eligibility">Take the Quiz</Link>
                                    </div>
                                </div>
                            </div>
                            <div className="services-styles-box-inner animate-on-scroll" style={{ transitionDelay: '0.5s' }}>
                                <div className="service-card-wrapper">
                                    <div className="service-img-box">
                                        <img src={LANDING.bloodCampDetails} alt="Health Check" />
                                    </div>
                                    <div className="service-content-main-box">
                                        <div className="service-icon-box bg-dark">
                                            <Activity size={36} color="white" />
                                        </div>
                                        <h3 className="service-box-title">Blood Camp Details</h3>
                                        <p>Donating has never been easier. Use our interactive map to discover upcoming blood donation drives hosted in your city.</p>
                                    </div>
                                    <div className="service-read-more">
                                        <Link to="/donor">View Camps</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Blood Stock Section (moved down) */}
            <section className="live-stock-section">
                <div className="container">
                    <div className="stock-panel animate-on-scroll">
                        <h3><Activity size={20} color="var(--color-primary)" /> Live National Stock</h3>
                        <div className="stock-grid">
                            {Object.entries(bloodStock).map(([type, status]) => (
                                <div key={type} className={`stock-card status-${status.toLowerCase()}`}>
                                    <span className="blood-type">{type}</span>
                                    <span className="status-badge">{status}</span>
                                </div>
                            ))}
                        </div>
                        <div className="stock-footer">
                            <span>
                                <Clock size={12} />
                                {" "}
                                {stockLoading
                                    ? "Loading..."
                                    : lastUpdated
                                        ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}`
                                        : "Update time unavailable"}
                            </span>
                            {stockError && <p className="stock-error">{stockError}</p>}

                            <Link to="/donor">View Details</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features/Stats Section */}
            <section className="highlights-section-new">
                <div className="container">
                    <div className="stats-grid-new animate-on-scroll">
                        <div className="stat-item-new">
                            <h2 className="stat-number-new">48<span className="unit">h</span></h2>
                            <p>Predictive Shortage Alerts</p>
                        </div>
                        <div className="stat-item-new divider">
                            <h2 className="stat-number-new">10k+</h2>
                            <p>Registered Active Donors</p>
                        </div>
                        <div className="stat-item-new divider">
                            <h2 className="stat-number-new">85<span>%</span></h2>
                            <p>Wastage Reduction</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Mock Section */}
            <section className="map-section-new animate-on-scroll">
                <div className="container">
                    <div className="map-header">
                        <h2><MapPin size={28} /> Find Nearby Blood Camps</h2>
                        <p>Locate active donation centers and urgent hospital requests in your district.</p>
                    </div>
                    <div className="map-mockup-wrapper" style={{ padding: '0', overflow: 'hidden', height: '400px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
                        <iframe
                            title="National Blood Center Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.671046714073!2d79.85871807469796!3d6.929871593069695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2591146399bd5%3A0xc02cf3c9f53eec0!2sNational%20Blood%20Center!5e0!3m2!1sen!2slk!4v1711200000000!5m2!1sen!2slk"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </section>

            {/* Why Donate Section */}
            <section className="why-donate-section">
                <div className="container why-donate-container">
                    <div className="why-donate-image animate-on-scroll">
                        <img src={LANDING.whyDonate} alt="Hold Blood Drop" />
                    </div>
                    <div className="why-donate-content animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
                        <h5 className="section-subtitle">Why Donate?</h5>
                        <h2 className="section-title">The Life You Save<br />Could Be Someone<br />You Love</h2>
                        <p className="section-description">
                            Aliquam vitae pharetra sapien. Sed et ex convallis, hen dreri enim ac, bibendum veliti. Aliquam ipsum nisi eleif end utine mauris idin aliquam efficitur nulla phas ellorci diam.
                        </p>

                        <div className="benefits-grid">
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <Heart fill="var(--color-primary)" color="var(--color-primary)" size={24} />
                                </div>
                                <h4>Your Blood, Their Second Chance</h4>
                                <p>Namu ante maucb usenaxi nulla dignii a gravding.</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <Activity fill="var(--color-primary)" color="var(--color-primary)" size={24} />
                                </div>
                                <h4>Urgent Need Every Day</h4>
                                <p>Namu ante maucb usenaxi nulla dignii a gravding.</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <Shield fill="var(--color-primary)" color="var(--color-primary)" size={24} />
                                </div>
                                <h4>Save Lives in Minutes</h4>
                                <p>Namu ante maucb usenaxi nulla dignii a gravding.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Mock */}
            <section className="testimonials-section animate-on-scroll">
                <div className="container">
                    <h2 className="section-title">Why We Donate</h2>
                    <div className="testimonial-grid">
                        <div className="testimonial-card">
                            <div className="quote">"HOPEDROP alerted me that my rare AB- blood was needed locally. The process was seamless and I knew exactly who I was helping."</div>
                            <div className="author">- Kamal S., Donor</div>
                        </div>
                        <div className="testimonial-card">
                            <div className="quote">"As a Medical Officer, the 48-hour predictive alerts have completely changed how we manage inventory. We no longer hit critical zero."</div>
                            <div className="author">- Dr. Perera, General Hospital</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-new">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <h2><Heart color="var(--color-primary)" fill="var(--color-primary)" /> HOPEDROP</h2>
                        <p>National Blood Bank Management System of Sri Lanka.</p>
                    </div>
                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <Link to="/donor">Donor Portal</Link>
                        <Link to="/patient">Request Blood</Link>
                        <Link to="/login">Hospital Login</Link>
                        <Link to="/contact">Contact Us</Link>
                    </div>
                    <div className="footer-contact">
                        <h4>Emergency Contact</h4>
                        <p>Hotline: 011 236 9931</p>
                        <p>Email: info@hopedrop.lk</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} HOPEDROP National Blood Transfusion Service. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
