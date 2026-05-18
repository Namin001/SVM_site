'use client';
import { useState } from 'react';
import { Upload, Briefcase, Mail, Phone, User, CheckCircle2, AlertCircle, GraduationCap, Search, Users, ClipboardCheck, ArrowRight, BookOpen, Percent } from 'lucide-react';

export default function CareerPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        domain: '',
        domainOther: '',
        xMark: '',
        xMedium: 'English',
        xiiMark: '',
        xiiMedium: 'English',
        ugCgpa: '',
        ugStream: '',
        pgCgpa: '',
        pgStream: '',
        bedStatus: 'No'
    });
    const [resume, setResume] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const hiringProcess = [
        {
            icon: <Search size={24} />,
            title: "1st Stage: Resume Checking",
            desc: "Our HR team reviews your qualifications and experience against the requirements."
        },
        {
            icon: <Users size={24} />,
            title: "2nd Stage: Interview & Mock Class",
            desc: "Meet with our panel and demonstrate your teaching/working style in a real or mock setting."
        },
        {
            icon: <ClipboardCheck size={24} />,
            title: "3rd Stage: Finalization",
            desc: "Final discussion regarding roles, responsibilities, and official onboarding."
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resume) {
            setStatus({ type: 'error', message: 'Please upload your resume.' });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });
            data.append('resume', resume);

            const res = await fetch('/api/careers', {
                method: 'POST',
                body: data
            });

            if (res.ok) {
                setStatus({ type: 'success', message: 'Application submitted successfully! We will contact you soon.' });
                setFormData({
                    fullName: '', email: '', phone: '', domain: '', domainOther: '',
                    xMark: '', xMedium: 'English', xiiMark: '', xiiMedium: 'English',
                    ugCgpa: '', ugStream: '', pgCgpa: '', pgStream: '', bedStatus: 'No'
                });
                setResume(null);
            } else {
                const err = await res.json();
                setStatus({ type: 'error', message: err.error || 'Submission failed.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container animate-fade-in" style={{ maxWidth: '1000px' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ fontSize: '3.5rem', border: 'none', marginBottom: '1rem' }}>Careers at SVM</h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                    Experience a culture of growth, innovation, and excellence.
                </p>
            </div>

            <div style={{ marginBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        background: 'rgba(10, 54, 104, 0.05)', 
                        padding: '0.5rem 1.25rem', 
                        borderRadius: '30px',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        border: '1px solid rgba(10, 54, 104, 0.1)'
                    }}>
                        <Briefcase size={16} /> Join Our Mission
                    </div>
                </div>
                
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(10, 54, 104, 0.02) 0%, rgba(10, 54, 104, 0.05) 100%)', border: '1px solid rgba(10, 54, 104, 0.08)' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--primary)', maxWidth: '800px', margin: '0 auto', fontWeight: 600, lineHeight: '1.6' }}>
                        Shape the future of education with us. We are looking for passionate individuals to join our academic and administrative teams.
                    </p>
                </div>
            </div>

            {/* HIRING PROCEDURE SECTION */}
            <div style={{ marginBottom: '5rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '3rem', border: 'none' }}>Our Hiring Process</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {hiringProcess.map((step, idx) => (
                        <div key={idx} className="card" style={{ 
                            padding: '2rem', 
                            textAlign: 'center', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            gap: '1rem',
                            position: 'relative',
                            border: '1px solid rgba(10, 54, 104, 0.05)'
                        }}>
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%', 
                                background: 'var(--primary)', 
                                color: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                boxShadow: '0 10px 20px rgba(10, 54, 104, 0.2)'
                            }}>
                                {step.icon}
                            </div>
                            <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--primary)', fontWeight: 800 }}>{step.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ padding: '4rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    
                    {/* SECTION 1: PERSONAL DETAILS */}
                    <section>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none' }}>
                            <User size={24} /> Personal Details
                        </h2>
                        <div className="responsive-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="input" placeholder="Enter your full name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" className="input" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input className="input" placeholder="+91 00000 00000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: TEACHING DOMAIN */}
                    <section>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none' }}>
                            <BookOpen size={24} /> Teaching Domain
                        </h2>
                        <div className="responsive-grid">
                            <div className="form-group">
                                <label className="form-label">Select Subject</label>
                                <select className="input" value={formData.domain} onChange={e => setFormData({...formData, domain: e.target.value})} required>
                                    <option value="">Select Domain...</option>
                                    <option value="Tamil">Tamil</option>
                                    <option value="English">English</option>
                                    <option value="Maths">Maths</option>
                                    <option value="Science">Science</option>
                                    <option value="Social Science">Social Science</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            {formData.domain === 'Others' && (
                                <div className="form-group">
                                    <label className="form-label">Specify Other Subject</label>
                                    <input className="input" placeholder="Please specify your subject" value={formData.domainOther} onChange={e => setFormData({...formData, domainOther: e.target.value})} required />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SECTION 3: ACADEMIC QUALIFICATIONS */}
                    <section>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none' }}>
                            <GraduationCap size={24} /> Academic Record
                        </h2>
                        
                        <div className="responsive-grid" style={{ marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label className="form-label">Xth Standard Mark (%)</label>
                                <input className="input" placeholder="Percentage / CGPA" value={formData.xMark} onChange={e => setFormData({...formData, xMark: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Medium of Education (Xth)</label>
                                <select className="input" value={formData.xMedium} onChange={e => setFormData({...formData, xMedium: e.target.value})}>
                                    <option value="English">English</option>
                                    <option value="Tamil">Tamil</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="responsive-grid" style={{ marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label className="form-label">XIIth Standard Mark (%)</label>
                                <input className="input" placeholder="Percentage / CGPA" value={formData.xiiMark} onChange={e => setFormData({...formData, xiiMark: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Medium of Instruction (XIIth)</label>
                                <select className="input" value={formData.xiiMedium} onChange={e => setFormData({...formData, xiiMedium: e.target.value})}>
                                    <option value="English">English</option>
                                    <option value="Tamil">Tamil</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="responsive-grid" style={{ marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label className="form-label">UG Stream / Degree</label>
                                <input className="input" placeholder="e.g. B.Sc Physics" value={formData.ugStream} onChange={e => setFormData({...formData, ugStream: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">UG CGPA / Mark</label>
                                <input className="input" placeholder="e.g. 8.5 or 85%" value={formData.ugCgpa} onChange={e => setFormData({...formData, ugCgpa: e.target.value})} />
                            </div>
                        </div>

                        <div className="responsive-grid" style={{ marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label className="form-label">PG Stream / Degree</label>
                                <input className="input" placeholder="e.g. M.Sc Physics" value={formData.pgStream} onChange={e => setFormData({...formData, pgStream: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">PG CGPA / Mark</label>
                                <input className="input" placeholder="e.g. 9.0 or 90%" value={formData.pgCgpa} onChange={e => setFormData({...formData, pgCgpa: e.target.value})} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div className="form-group">
                                <label className="form-label">B.Ed Qualification</label>
                                <select className="input" value={formData.bedStatus} onChange={e => setFormData({...formData, bedStatus: e.target.value})}>
                                    <option value="Yes">Yes (Completed)</option>
                                    <option value="No">No</option>
                                    <option value="Pursuing">Pursuing</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: RESUME UPLOAD */}
                    <section>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: 'none' }}>
                            <Upload size={24} /> Documents
                        </h2>
                        <div className="form-group">
                            <label className="form-label">Resume / CV (PDF or Word)</label>
                            <div style={{ 
                                border: '2px dashed var(--border-color)', 
                                borderRadius: '12px', 
                                padding: '3rem', 
                                textAlign: 'center',
                                background: resume ? 'rgba(47, 133, 90, 0.05)' : 'rgba(0,0,0,0.02)',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }} onClick={() => document.getElementById('resume-upload')?.click()}>
                                <input type="file" id="resume-upload" style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files?.[0] || null)} />
                                {resume ? (
                                    <div style={{ color: 'var(--success)', fontWeight: 600 }}>
                                        <CheckCircle2 size={32} style={{ margin: '0 auto 1rem' }} />
                                        {resume.name}
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)' }}>
                                        <Upload size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                        <p>Click to upload your resume</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {status && (
                        <div style={{ 
                            padding: '1rem', 
                            borderRadius: '8px', 
                            background: status.type === 'success' ? 'rgba(47, 133, 90, 0.1)' : 'rgba(229, 62, 62, 0.1)',
                            color: status.type === 'success' ? 'var(--success)' : 'var(--error)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontWeight: 600
                        }}>
                            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            {status.message}
                        </div>
                    )}

                    <button type="submit" className="btn" disabled={isSubmitting} style={{ padding: '1.25rem', width: '100%', fontSize: '1.2rem', fontWeight: 800 }}>
                        {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
}
