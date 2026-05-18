'use client';
import { useState, useEffect } from 'react';
import { X, Info, Megaphone, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface FloaterSettings {
  enabled: boolean;
  message: string;
  link?: string;
  type: 'info' | 'warning' | 'success';
}

export default function FloatingNotice() {
  const [settings, setSettings] = useState<FloaterSettings | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/floaters');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          if (data.enabled) {
            // Delay visibility for a nice entry effect
            setTimeout(() => setIsVisible(true), 1500);
          }
        }
      } catch (e) {
        console.error('Failed to fetch floater settings', e);
      }
    };
    fetchSettings();
  }, []);

  if (!settings || !settings.enabled || isDismissed) return null;

  const getIcon = () => {
    switch (settings.type) {
      case 'warning': return <Megaphone style={{ color: 'var(--accent)' }} size={20} />;
      case 'success': return <Star style={{ color: 'var(--success)' }} size={20} />;
      default: return <Info style={{ color: 'var(--primary)' }} size={20} />;
    }
  };

  const getBgColor = () => {
    switch (settings.type) {
      case 'warning': return 'rgba(252, 163, 17, 0.15)';
      case 'success': return 'rgba(47, 133, 90, 0.15)';
      default: return 'rgba(10, 54, 104, 0.1)';
    }
  };

  return (
    <div 
      className={`floating-notice-wrapper ${isVisible ? 'visible' : ''}`}
      style={{
        position: 'fixed',
        top: '180px',
        right: '30px',
        zIndex: 1000,
        maxWidth: '400px',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(100px) scale(0.9)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'all' : 'none',
      }}
    >
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '24px',
        padding: '1.25rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Accent Blob */}
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '-10px',
          width: '60px',
          height: '60px',
          background: getBgColor(),
          borderRadius: '50%',
          filter: 'blur(20px)',
          zIndex: 0
        }} />

        <div style={{ 
          background: 'white', 
          width: '44px', 
          height: '44px', 
          borderRadius: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          flexShrink: 0,
          zIndex: 1,
          border: '1px solid rgba(0,0,0,0.03)'
        }}>
          {getIcon()}
        </div>

        <div style={{ flex: 1, zIndex: 1 }}>
          <p style={{ 
            margin: 0, 
            fontSize: '0.95rem', 
            fontWeight: 700, 
            color: 'var(--primary)',
            lineHeight: '1.4',
            fontFamily: 'Outfit, sans-serif'
          }}>
            {settings.message}
          </p>
          {settings.link && (
            <Link 
              href={settings.link}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: 'var(--accent)',
                marginTop: '0.5rem',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Take Action <ExternalLink size={12} />
            </Link>
          )}
        </div>

        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => setIsDismissed(true), 600);
          }}
          style={{
            background: 'rgba(0,0,0,0.05)',
            border: 'none',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(229, 62, 62, 0.1)';
            e.currentTarget.style.color = 'var(--error)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <X size={16} />
        </button>
      </div>

      <style jsx>{`
        .floating-notice-wrapper {
            will-change: transform, opacity;
        }
        .floating-notice-wrapper:hover {
          transform: translateY(-8px) scale(1.03) !important;
        }
      `}</style>
    </div>
  );
}

