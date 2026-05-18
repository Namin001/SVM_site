'use client';
import { useState, useEffect } from 'react';
import { User, Shield, GraduationCap, MapPin, Phone, Mail, Calendar, FileText, Wallet, Heart, Users, ChevronRight, Award } from 'lucide-react';
import BookLoader from '@/components/BookLoader';

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const startTime = Date.now();
            try {
                const res = await fetch('/api/profile');
                if (res.ok) {
                    setProfile(await res.json());
                }
            } catch (error) {}
            
            // Ensure at least 5 seconds of loading
            const elapsed = Date.now() - startTime;
            if (elapsed < 5000) {
              await new Promise(resolve => setTimeout(resolve, 5000 - elapsed));
            }
            setIsLoading(false);
        };
        fetchProfile();
    }, []);

    if (isLoading) return <BookLoader text="Accessing your profile..." />;
    if (!profile) return <div className="page-container" style={{ textAlign: 'center', padding: '10rem 2rem' }}><h2>Profile not found. Please log in again.</h2></div>;

    const isStudent = profile.role === 'PARENT';
    const currentYear = new Date().getFullYear();
    const isPromotedThisYear = profile.lastPromotedYear === currentYear;

    return (
        <div className="page-container animate-fade-in" style={{ paddingBottom: '10rem' }}>
            {isPromotedThisYear && (
                <div className="promotion-celebration">
                    <div className="confetti-container">
                        {[...Array(50)].map((_, i) => (
                            <div key={i} className="confetti" style={{ 
                                left: `${Math.random() * 100}%`, 
                                animationDelay: `${Math.random() * 3}s`,
                                backgroundColor: ['#FCA311', '#0A3668', '#2F855A', '#E53E3E'][Math.floor(Math.random() * 4)]
                            }}></div>
                        ))}
                    </div>
                    <div className="popper-message animate-pop-in">
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉 🎊 🎓</div>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)', border: 'none', margin: 0 }}>Congratulations!</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                            You have been promoted to <strong>{profile.className}</strong>!
                        </p>
                        <button className="btn" style={{ marginTop: '1.5rem' }} onClick={() => {
                            document.querySelector('.promotion-celebration')?.remove();
                        }}>Thank You!</button>
                    </div>
                </div>
            )}

            {/* Profile Hero */}
            <div className="card profile-hero">
                <div className="hero-glow" />

                <div className="hero-avatar">
                    {profile.imagePath ? (
                        <img src={profile.imagePath} alt="Profile" className="hero-img" />
                    ) : (
                        <div className="hero-avatar-placeholder">
                            <User size={80} style={{ opacity: 0.5 }} />
                        </div>
                    )}
                </div>

                <div className="hero-content">
                    <div className="hero-meta">
                        <span className="hero-tag">
                            {profile.role === 'PARENT' ? 'STUDENT' : profile.role}
                        </span>
                        <span className="hero-join-date">Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h1 className={`hero-name ${isStudent ? 'student' : ''}`}>
                        {profile.name || profile.username}
                    </h1>
                    <p className="hero-subtitle">
                        {isStudent ? `${profile.className || 'N/A'} • Admission No: ${profile.admissionNo || 'N/A'}` : 'Staff Administrator'}
                    </p>
                </div>
            </div>
            
            <div className="profile-layout">
                <div className="main-info-column">
                    
                    {/* Basic Info */}
                    <div className="card info-card-p">
                        <h2 className="section-header">
                            <Shield size={24} /> Official Records
                        </h2>
                        <div className="info-grid">
                            <div>
                                <div className="info-label">Full Name</div>
                                <div className="info-value">{profile.name || profile.username}</div>
                            </div>
                            <div>
                                <div className="info-label">Username</div>
                                <div className="info-value">@{profile.username}</div>
                            </div>
                            <div>
                                <div className="info-label">Gender</div>
                                <div className="info-value">{profile.gender || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="info-label">Date of Birth</div>
                                <div className="info-value">{profile.dob || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Academic Section */}
                    {isStudent && (
                        <div className="card info-card-p">
                            <h2 className="section-header">
                                <GraduationCap size={24} /> Academic Profile
                            </h2>
                            <div className="info-grid">
                                <div>
                                    <div className="info-label">Current Grade</div>
                                    <div className="info-value">{profile.className || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="info-label">Section</div>
                                    <div className="info-value">{profile.section || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="info-label">Admission Number</div>
                                    <div className="info-value">{profile.admissionNo || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="info-label">Account Status</div>
                                    <div className="info-status">
                                        <Award size={18} /> Active Student
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Demographic Section */}
                    <div className="card info-card-p">
                        <h2 className="section-header">
                            <Users size={24} /> Demographic & Family
                        </h2>
                        <div className="info-grid">
                            <div>
                                <div className="info-label">Father's Name</div>
                                <div className="info-value">{profile.fatherName || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="info-label">Mother's Name</div>
                                <div className="info-value">{profile.motherName || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="info-label">Religion</div>
                                <div className="info-value">{profile.religion || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="info-label">Caste / Category</div>
                                <div className="info-value">{profile.caste || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="side-info-column">
                    
                    {/* Financial Status */}
                    {isStudent && (
                        <div className="card fee-card">
                            <h3 className="sub-section-header">
                                <Wallet size={20} /> Fee Management
                            </h3>
                            <div className="fee-display">
                                <div className="fee-label">Fees Paid (YTD)</div>
                                <div className="fee-amount">₹{profile.feesPaid || 0}</div>
                            </div>
                            <button className="btn fee-btn">
                                View Payment History <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="card contact-card">
                        <h3 className="sub-section-header">
                            <Phone size={20} /> Contact Links
                        </h3>
                        <div className="contact-links-list">
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <div className="contact-label">Father's Phone</div>
                                    <div className="contact-value">{profile.fatherPhone || 'Not Provided'}</div>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <div className="contact-label">Mother's Phone</div>
                                    <div className="contact-value">{profile.motherPhone || 'Not Provided'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    {isStudent && (
                        <div className="card doc-card">
                            <h3 className="sub-section-header">
                                <FileText size={20} /> Documents
                            </h3>
                            <div className="doc-links-container">
                                <a href={profile.birthCertPath} target="_blank" rel="noreferrer" className="doc-link-profile">
                                    <span className="doc-name">Birth Certificate</span>
                                    {profile.birthCertPath ? <CheckCircle size={18} color="var(--success)" /> : <span className="doc-missing">Missing</span>}
                                </a>
                                <a href={profile.aadharPath} target="_blank" rel="noreferrer" className="doc-link-profile">
                                    <span className="doc-name">Aadhar Card</span>
                                    {profile.aadharPath ? <CheckCircle size={18} color="var(--success)" /> : <span className="doc-missing">Missing</span>}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CheckCircle({ size, color }: { size: number, color: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
