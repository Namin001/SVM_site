'use client';
import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.pageYOffset;
      const scrollPercentage = (currentScroll / totalScroll) * 100;
      setScroll(scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: `${scroll}%`,
      height: '4px',
      background: 'linear-gradient(to right, var(--accent), var(--accent-hover))',
      zIndex: 2000,
      transition: 'width 0.1s ease-out',
      boxShadow: '0 0 10px var(--accent)'
    }} />
  );
}
