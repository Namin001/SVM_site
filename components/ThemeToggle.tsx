'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const saved = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!mounted) return <div style={{width: '40px', height: '40px'}} />;
  
  // Strictly only show on home page
  if (pathname !== '/') return null;

  return (
    <button 
      onClick={toggleTheme} 
      style={{
        background: 'transparent',
        border: '1px solid var(--border-color)',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
        color: 'var(--text-main)',
        transition: 'all 0.2s',
        backgroundColor: 'var(--card-bg)'
      }}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
