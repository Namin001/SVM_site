'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (res.ok) {
      router.push('/');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* HIGH QUALITY UI BANNER BACKGROUND */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        padding: '2.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Modern UI Blobs */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '50%',
          height: '140%',
          background: 'radial-gradient(circle, rgba(252,163,17,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          borderRadius: '50%',
          animation: 'blobFloat 15s infinite alternate'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          right: '-5%',
          width: '60%',
          height: '120%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)',
          filter: 'blur(80px)',
          borderRadius: '50%',
          animation: 'blobFloat 20s infinite alternate-reverse'
        }} />
        
        <div style={{ zIndex: 10, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'white', borderRadius: '50%', padding: '0.5rem', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
            <img src="/svm_logo.png" alt="Shubha Vidyalaya Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: 'white', margin: 0, fontSize: '2.25rem', textShadow: '0 2px 4px rgba(0,0,0,0.4)', border: 'none', paddingBottom: 0, fontFamily: 'Outfit' }}>Shubha Vidhyalaya</h1>
          <p style={{ fontSize: '1.1rem', marginTop: '0.25rem', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.4)', marginBottom: '1rem' }}>Excellence in Education</p>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Secure Portal</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Sign in to continue</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input 
                id="username"
                className="input" 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input 
                id="password"
                className="input" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            
            {error && <div className="error-text" style={{ marginBottom: '1rem' }}>{error}</div>}
            
            <button type="submit" className="btn" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
              Access Portal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
