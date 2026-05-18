'use client';
import { Target, Eye, Heart, Award, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Hero Section */}
      <div className="about-hero" style={{
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
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
            zIndex: -2
          }}
        >
          <source src="/videos/345137_medium.mp4" type="video/mp4" />
        </video>
        
        {/* Overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(rgba(10, 54, 104, 0.4), rgba(10, 54, 104, 0.8))',
          zIndex: -1
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }} className="animate-fade-in about-hero-content">
          <h1 className="about-hero-title">
            SVM
          </h1>
          <p className="about-hero-subtitle">
            A legacy of excellence, a future of innovation. Discover our unwavering commitment to nurturing brilliance and building the leaders of tomorrow.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: '8rem', paddingBottom: '10rem', position: 'relative', zIndex: 1 }}>

        {/* Vision, Mission, Motive Grid */}
        <div className="vision-mission-grid">
          {/* Mission */}
          <div className="card" style={{
            padding: '4rem 3rem',
            borderTop: '8px solid var(--accent)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(252, 163, 17, 0.1)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <Target size={40} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1.25rem', color: 'var(--primary)', border: 'none', fontFamily: 'Outfit' }}>Our Mission</h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-main)', lineHeight: '1.9', fontWeight: 500 }}>
              To provide transformative education that empowers students to reach their full potential, fostering an enduring love for learning, critical thinking, and social responsibility.
            </p>
          </div>

          {/* Vision */}
          <div className="card" style={{
            padding: '4rem 3rem',
            borderTop: '8px solid var(--primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(10, 54, 104, 0.1)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <Eye size={40} style={{ color: 'var(--primary)' }} />
            </div>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1.25rem', color: 'var(--primary)', border: 'none', fontFamily: 'Outfit' }}>Our Vision</h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-main)', lineHeight: '1.9', fontWeight: 500 }}>
              To be a globally recognized center of educational excellence, shaping ethical, innovative, and resilient leaders who will positively impact the world.
            </p>
          </div>

          {/* Motive */}
          <div className="card" style={{
            padding: '4rem 3rem',
            borderTop: '8px solid #2F855A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'rgba(47, 133, 90, 0.1)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <Heart size={40} style={{ color: '#2F855A' }} />
            </div>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '1.25rem', color: 'var(--primary)', border: 'none', fontFamily: 'Outfit' }}>Our Motive</h2>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-main)', lineHeight: '1.9', fontWeight: 500 }}>
              To nurture the unique spirit and character of every child, ensuring they grow into confident, compassionate individuals equipped for the challenges of tomorrow.
            </p>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="philosophy-grid">
          <div>
            <h2 className="section-title" style={{
              textAlign: 'left',
              fontSize: '3rem',
              marginBottom: '2.5rem',
              background: 'linear-gradient(135deg, var(--primary) 0%, #4a90e2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              border: 'none'
            }}>
              Core Philosophy
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flexShrink: 0, marginTop: '0.25rem' }}>
                  <Award size={40} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: 'var(--primary)', fontFamily: 'Outfit' }}>Excellence Without Compromise</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                    We maintain rigorous academic and behavioral standards, providing the tools and mentorship needed for every student to surpass their own expectations.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flexShrink: 0, marginTop: '0.25rem' }}>
                  <Users size={40} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', color: 'var(--primary)', fontFamily: 'Outfit' }}>Holistic Development</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                    Our education extends beyond textbooks. We prioritize emotional intelligence, physical fitness, and artistic expression to develop well-rounded individuals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            position: 'relative',
            padding: '1.5rem',
            background: 'white',
            borderRadius: '32px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
              <img
                src="/about_us.jpg"
                alt="Students at SV"
                style={{ width: '100%', display: 'block', transform: 'scale(1.05)' }}
              />
            </div>
            {/* Decorative Floaties */}
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              padding: '1.5rem 2rem',
              background: 'var(--accent)',
              color: 'var(--primary)',
              borderRadius: '16px',
              fontWeight: 800,
              boxShadow: '0 10px 20px rgba(252, 163, 17, 0.3)',
              zIndex: 2,
              fontFamily: 'Outfit'
            }}>
              ESTD. 2004
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
