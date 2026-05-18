'use client';
import { useState } from 'react';
import { ArrowRight, CheckCircle, ArrowLeft, User, Users, MapPin, Send } from 'lucide-react';
import Link from 'next/link';
import { PebblesBackground } from '@/components/PebblesBackground';

const CLASS_OPTIONS = [
  'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

export default function ApplyPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    dob: '',
    gender: 'Male',
    grade: '',
    parentName: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsSubmitted(true);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (e) {
      alert('An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="card animate-fade-in" style={{ textAlign: 'center', maxWidth: '500px', padding: '4rem 2rem' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <CheckCircle color="white" size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'Outfit', border: 'none' }}>Application Received!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Thank you for applying to Shubha Vidhyalaya. Our admissions team will review your application and contact you at <strong>{formData.phone}</strong> within 2-3 business days.
          </p>
          <Link href="/">
            <button className="btn" style={{ width: '100%' }}>Return to Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <PebblesBackground />
      
      <div className="page-container" style={{ paddingTop: '6rem', paddingBottom: '8rem', position: 'relative', zIndex: 2 }}>
        
        <div style={{ marginBottom: '3rem' }}>
          <Link href="/admissions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, marginBottom: '1rem' }}>
            <ArrowLeft size={18} /> Back to Admissions
          </Link>
          <h1 style={{ fontSize: '3.5rem', fontFamily: 'Outfit', border: 'none', paddingBottom: 0, marginBottom: '0.5rem' }}>Application Form</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Please provide the basic details to start the admission process.</p>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
          <form onSubmit={handleSubmit}>
            
            {/* Student Details */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <User size={24} />
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'Outfit' }}>Student Information</h3>
              </div>
              
              <div className="form-group">
                <label className="form-label">Full Name of Student</label>
                <input 
                  className="input" 
                  placeholder="Enter full name" 
                  required 
                  value={formData.studentName}
                  onChange={e => setFormData({...formData, studentName: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input 
                    type="date" 
                    className="input" 
                    required 
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select 
                    className="input" 
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Grade Applied For</label>
                <select 
                  className="input" 
                  required
                  value={formData.grade}
                  onChange={e => setFormData({...formData, grade: e.target.value})}
                >
                  <option value="">Select a Grade</option>
                  {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Parent Details */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <Users size={24} />
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'Outfit' }}>Parent / Guardian Information</h3>
              </div>
              
              <div className="form-group">
                <label className="form-label">Parent / Guardian Full Name</label>
                <input 
                  className="input" 
                  placeholder="Enter full name" 
                  required 
                  value={formData.parentName}
                  onChange={e => setFormData({...formData, parentName: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input 
                    type="tel" 
                    className="input" 
                    placeholder="e.g. +91 9876543210" 
                    required 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="input" 
                    placeholder="e.g. parent@example.com" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                <MapPin size={24} />
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'Outfit' }}>Residential Information</h3>
              </div>
              
              <div className="form-group">
                <label className="form-label">Full Address</label>
                <textarea 
                  className="input" 
                  style={{ minHeight: '100px' }} 
                  placeholder="Enter your complete residential address" 
                  required 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="btn" disabled={isSubmitting} style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: '16px', gap: '0.75rem' }}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'} <Send size={20} />
            </button>
            
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              By submitting this form, you agree to our privacy policy and terms of admission.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
