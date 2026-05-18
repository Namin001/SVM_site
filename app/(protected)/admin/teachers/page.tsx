'use client';

import { useState, useEffect } from 'react';
import { 
    UserPlus, 
    Users, 
    Mail, 
    Phone, 
    Calendar, 
    BookOpen, 
    Award, 
    FileText, 
    CheckCircle, 
    XCircle, 
    Upload, 
    ArrowLeft,
    Trash2,
    Search
} from 'lucide-react';
import Link from 'next/link';

export default function TeacherRegistrationPage() {
    const [activeTab, setActiveTab] = useState<'register' | 'registry'>('register');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        dob: '',
        joiningDate: '',
        gender: 'Male',
        stream: '',
        contactDetails: '',
        maritalStatus: 'Single',
        ugDegree: '',
        ugStream: '',
        pgDetails: '',
        bedStatus: 'No'
    });

    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setTeachers(data.users.filter((u: any) => u.role === 'TEACHER'));
            }
        } catch (err) {
            console.error('Failed to fetch teachers', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        const body = new FormData();
        Object.entries(formData).forEach(([key, value]) => body.append(key, value));
        body.append('role', 'TEACHER');

        if (certificateFile) body.append('certificate', certificateFile);
        if (profilePhoto) body.append('image', profilePhoto);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                body
            });

            if (res.ok) {
                setMessage('Teacher registered successfully!');
                setFormData({
                    username: '',
                    password: '',
                    name: '',
                    dob: '',
                    joiningDate: '',
                    gender: 'Male',
                    stream: '',
                    contactDetails: '',
                    maritalStatus: 'Single',
                    ugDegree: '',
                    ugStream: '',
                    pgDetails: '',
                    bedStatus: 'No'
                });
                setCertificateFile(null);
                setProfilePhoto(null);
                fetchTeachers();
                setTimeout(() => setMessage(''), 5000);
            } else {
                const data = await res.json();
                setMessage(data.error || 'Failed to register teacher');
            }
        } catch (err) {
            setMessage('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteTeacher = async (id: string) => {
        if (!confirm('Are you sure you want to delete this teacher record?')) return;
        try {
            const res = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id })
            });
            if (res.ok) {
                setMessage('Teacher deleted successfully');
                fetchTeachers();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            alert('Delete failed');
        }
    };

    const toggleTeacherStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id, isActive: !currentStatus })
            });
            if (res.ok) {
                setMessage(`Teacher marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
                fetchTeachers();
                setTimeout(() => setMessage(''), 3000);
            } else {
                alert('Status update failed');
            }
        } catch (err) {
            alert('Status update failed');
        }
    };

    const filteredTeachers = teachers.filter(t => 
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.stream?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-container animate-fade-in">
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/admin" className="btn" style={{ background: 'rgba(10, 54, 104, 0.05)', color: 'var(--primary)', padding: '0.5rem' }}>
                    <ArrowLeft size={20} />
                </Link>
                <h1 style={{ margin: 0, border: 'none' }}>Teacher Management</h1>
            </div>

            {message && <div className="admin-banner">{message}</div>}

            <div className="admin-nav" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <button 
                    className={`admin-nav-btn ${activeTab === 'register' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('register')}
                >
                    <UserPlus size={18} style={{ marginRight: '8px' }} />
                    Register New Teacher
                </button>
                <button 
                    className={`admin-nav-btn ${activeTab === 'registry' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('registry')}
                >
                    <Users size={18} style={{ marginRight: '8px' }} />
                    Teacher Registry ({teachers.length})
                </button>
            </div>

            {activeTab === 'register' && (
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        {/* Section 1: Basic Account */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(10, 54, 104, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={18} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Account Information</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">User ID / Username *</label>
                                <input 
                                    className="input" 
                                    name="username" 
                                    value={formData.username} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="e.g. teacher_john"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password *</label>
                                <input 
                                    className="input" 
                                    type="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Profile Photo</label>
                                <input 
                                    type="file" 
                                    className="input" 
                                    onChange={e => setProfilePhoto(e.target.files?.[0] || null)} 
                                    accept="image/*"
                                />
                            </div>
                        </div>

                        {/* Section 2: Personal Details */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(10, 54, 104, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={18} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Personal Details</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input 
                                    className="input" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input 
                                    type="date" 
                                    className="input" 
                                    name="dob" 
                                    value={formData.dob} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date of Joining</label>
                                <input 
                                    type="date" 
                                    className="input" 
                                    name="joiningDate" 
                                    value={formData.joiningDate} 
                                    onChange={handleInputChange} 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select className="input" name="gender" value={formData.gender} onChange={handleInputChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Marital Status</label>
                                <select className="input" name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stream / Department</label>
                                <input 
                                    className="input" 
                                    name="stream" 
                                    value={formData.stream} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g. Science, Commerce, Arts"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contact Details (Phone/Email)</label>
                                <input 
                                    className="input" 
                                    name="contactDetails" 
                                    value={formData.contactDetails} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter contact info"
                                />
                            </div>
                        </div>

                        {/* Section 3: Academic Qualifications */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(10, 54, 104, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Award size={18} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Academic Qualifications</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">UG Degree</label>
                                <input 
                                    className="input" 
                                    name="ugDegree" 
                                    value={formData.ugDegree} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g. B.Sc, B.A, B.Com"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">UG Stream</label>
                                <input 
                                    className="input" 
                                    name="ugStream" 
                                    value={formData.ugStream} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g. Physics, History"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">PG Details (Degree/Stream)</label>
                                <input 
                                    className="input" 
                                    name="pgDetails" 
                                    value={formData.pgDetails} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g. M.Sc Physics"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">B.Ed Status</label>
                                <select className="input" name="bedStatus" value={formData.bedStatus} onChange={handleInputChange}>
                                    <option value="No">No</option>
                                    <option value="Yes">Completed (Yes)</option>
                                    <option value="Pursuing">Pursuing</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Upload Certificate (UG/PG/B.Ed)</label>
                                <div style={{ 
                                    border: '2px dashed var(--border-color)', 
                                    padding: '1.5rem', 
                                    borderRadius: '8px', 
                                    textAlign: 'center',
                                    background: 'rgba(0,0,0,0.02)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }} onClick={() => document.getElementById('cert-upload')?.click()}>
                                    <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        {certificateFile ? certificateFile.name : 'Click to upload certificate (PDF, JPG, PNG)'}
                                    </p>
                                    <input 
                                        id="cert-upload"
                                        type="file" 
                                        className="input" 
                                        style={{ display: 'none' }}
                                        onChange={e => setCertificateFile(e.target.files?.[0] || null)} 
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn" 
                            disabled={isSubmitting} 
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 10px 20px rgba(10, 54, 104, 0.1)' }}
                        >
                            {isSubmitting ? 'Registering Teacher...' : 'Complete Registration'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'registry' && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ margin: 0 }}>Faculty Registry</h2>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                className="input" 
                                placeholder="Search faculty..." 
                                style={{ paddingLeft: '2.5rem' }}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Faculty</th>
                                    <th>Department</th>
                                    <th>Qualifications</th>
                                    <th>B.Ed</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeachers.length > 0 ? filteredTeachers.map((teacher) => (
                                    <tr key={teacher.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(10, 54, 104, 0.1)', overflow: 'hidden' }}>
                                                    {teacher.imagePath ? <img src={teacher.imagePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={20} style={{ margin: '10px', color: 'var(--primary)' }} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{teacher.name}</div>
                                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>@{teacher.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="tag" style={{ background: 'rgba(10, 54, 104, 0.05)', color: 'var(--primary)' }}>
                                                {teacher.stream || 'General'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <strong>{teacher.ugDegree}</strong> {teacher.ugStream && `(${teacher.ugStream})`}
                                                {teacher.pgDetails && <div style={{ opacity: 0.7 }}>{teacher.pgDetails}</div>}
                                            </div>
                                        </td>
                                        <td>
                                            {teacher.bedStatus === 'Yes' ? (
                                                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    <CheckCircle size={14} /> Completed
                                                </span>
                                            ) : teacher.bedStatus === 'Pursuing' ? (
                                                <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    <Calendar size={14} /> Pursuing
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                                                    <XCircle size={14} /> No
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                {teacher.contactDetails ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Phone size={12} /> {teacher.contactDetails}
                                                    </span>
                                                ) : 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={teacher.isActive ?? true} 
                                                    onChange={() => toggleTeacherStatus(teacher.id, teacher.isActive ?? true)} 
                                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                                />
                                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: (teacher.isActive ?? true) ? 'var(--success, #10b981)' : 'var(--text-muted)' }}>
                                                    {(teacher.isActive ?? true) ? 'Active' : 'Inactive'}
                                                </span>
                                            </label>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {teacher.certificatePath && (
                                                    <a 
                                                        href={teacher.certificatePath} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="btn" 
                                                        style={{ padding: '0.4rem', background: 'rgba(252, 163, 11, 0.1)', color: 'var(--accent)' }}
                                                        title="View Certificate"
                                                    >
                                                        <FileText size={16} />
                                                    </a>
                                                )}
                                                <button 
                                                    className="btn danger" 
                                                    style={{ padding: '0.4rem' }}
                                                    onClick={() => deleteTeacher(teacher.id)}
                                                    title="Delete Faculty"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                            <Users size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                            <p>No teachers found in the registry.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style jsx>{`
                .admin-nav-btn {
                    padding: 0.75rem 1.25rem;
                    background: none;
                    border: none;
                    font-family: 'Outfit', sans-serif;
                    font-weight: 600;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    border-radius: 8px;
                }
                .admin-nav-btn:hover {
                    color: var(--primary);
                    background: rgba(10, 54, 104, 0.05);
                }
                .admin-nav-btn.active {
                    color: var(--primary);
                    background: rgba(10, 54, 104, 0.1);
                }
                .tag {
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
            `}</style>
        </div>
    );
}
