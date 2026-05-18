'use client';
import { useState, useEffect } from 'react';
import { ArrowRight, Info, CheckCircle, Clock, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { PebblesBackground } from '@/components/PebblesBackground';
import BookLoader from '@/components/BookLoader';

export default function AdmissionsPage() {
  const [admissionText, setAdmissionText] = useState('');
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState('/admission_hero.jpg');

  useEffect(() => {
    const fetchInitialData = async () => {
      const startTime = Date.now();
      try {
        const [contentRes, bannerRes] = await Promise.all([
          fetch('/api/content'),
          fetch('/api/admissions/banner')
        ]);

        if (contentRes.ok) {
          const data = await contentRes.json();
          const record = data.find((r: any) => r.pageId === 'admission');
          if (record) setAdmissionText(record.content);
          const statusRec = data.find((r: any) => r.pageId === 'admission_status');
          setIsAdmissionOpen(statusRec?.content === 'OPEN');
        }

        if (bannerRes.ok) {
          const data = await bannerRes.json();
          setBannerUrl(data.url);
        }
      } catch (e) { }

      // Ensure at least 5 seconds of loading
      const elapsed = Date.now() - startTime;
      if (elapsed < 5000) {
        await new Promise(resolve => setTimeout(resolve, 5000 - elapsed));
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  if (isLoading) return <BookLoader text="Preparing Admissions Portal..." />;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Hero Section */}
      <div className="admissions-hero" style={{
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0a3668'
      }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        >
          <source src="/videos/347325_medium.mp4" type="video/mp4" />
        </video>

        {/* Overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(rgba(10, 54, 104, 0.6), rgba(10, 54, 104, 0.8))',
          zIndex: 1
        }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', margin: '0 auto' }} className="animate-fade-in admissions-hero-content">
          <h1 className="admissions-title">
            Begin Your Journey
          </h1>
          <p className="admissions-subtitle">
            Join a community dedicated to excellence, character, and lifelong learning. Our admission process is designed to find the best fit for your child's potential.
          </p>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(180deg, var(--card-bg) 0%, var(--bg-color) 100%)',
        width: '100%',
        position: 'relative'
      }}>
        <PebblesBackground />

        <div className="page-container" style={{ paddingTop: '5rem', paddingBottom: '10rem', position: 'relative', zIndex: 2 }}>

          {/* Main Admission Status */}
          <div className="admission-hub" style={{ padding: 0 }}>
            <div className="hub-card" style={{ background: 'white', border: '1px solid var(--border-color)' }}>
              <div className="hub-header">
                <div className="hub-title-group">
                  <span className="hub-badge" style={{ background: isAdmissionOpen ? 'var(--success)' : 'var(--error)', color: 'white' }}>
                    {isAdmissionOpen ? 'Admission Open' : 'Admission Closed'}
                  </span>
                  <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', color: 'var(--primary)', marginBottom: '0.5rem', border: 'none', paddingBottom: 0 }}>
                    Official Notice
                  </h2>
                  <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 600 }}>
                    {admissionText || 'General admissions for the current academic year are currently closed. Please check back later or contact our office for special inquiries.'}
                  </p>
                </div>
                {isAdmissionOpen && (
                  <Link href="/admissions/apply">
                    <button className="btn" style={{ padding: '1rem 2rem', borderRadius: '16px', gap: '0.75rem' }}>
                      Apply Online Now <ArrowRight size={18} />
                    </button>
                  </Link>
                )}
              </div>

              <div className="hub-grid" style={{ marginTop: '3rem' }}>
                <div className="step-card">
                  <div className="step-num">1</div>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontFamily: 'Outfit' }}>Submit Inquiry</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Fill out the online inquiry form or visit our campus reception desk to get started.</p>
                </div>
                <div className="step-card">
                  <div className="step-num">2</div>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontFamily: 'Outfit' }}>Campus Visit</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Scheduled interaction with the academic coordinators and a tour of our facilities.</p>
                </div>
                <div className="step-card">
                  <div className="step-num">3</div>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontFamily: 'Outfit' }}>Evaluation</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>A comprehensive assessment of the student's skills and potential for the applied grade.</p>
                </div>
                <div className="step-card">
                  <div className="step-num">4</div>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontFamily: 'Outfit' }}>Finalization</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Completion of documentation and fee payment to secure the seat.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Sections */}
          <div className="admissions-info-grid">
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2rem' }}>Required Documents</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '1.1rem' }}>
                  <CheckCircle color="var(--success)" size={24} /> Birth Certificate (Original & Copy)
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '1.1rem' }}>
                  <CheckCircle color="var(--success)" size={24} /> Transfer Certificate from previous school
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '1.1rem' }}>
                  <CheckCircle color="var(--success)" size={24} /> Passport size photographs (4 nos)
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '1.1rem' }}>
                  <CheckCircle color="var(--success)" size={24} /> Previous academic transcripts/reports
                </li>
                <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '1.1rem' }}>
                  <CheckCircle color="var(--success)" size={24} /> Immunization Records
                </li>
              </ul>
            </div>

            <div className="card questions-card" style={{ background: 'rgba(10, 54, 104, 0.05)', border: '1px solid rgba(10, 54, 104, 0.1)' }}>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1.5rem', fontFamily: 'Outfit' }}>Questions?</h3>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Our admissions team is here to help you every step of the way. Feel free to reach out for any clarifications.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'white', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <Clock size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Office Hours</div>
                    <div style={{ fontWeight: 700 }}>Mon - Sat: 8:00 AM - 5:00 PM</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: 'white', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <FileText size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Inquiry</div>
                    <div style={{ fontWeight: 700 }}>tvrsvmhss@gmail.com</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
