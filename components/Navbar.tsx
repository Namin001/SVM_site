'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from './LogoutButton';
import { useState, useEffect } from 'react';
import { Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';

export function Navbar({ session }: { session: any }) {
  const pathname = usePathname();
  const isForum = pathname?.startsWith('/forum');
  const useOverlay = true;

  const [theme, setTheme] = useState('light');
  const [isVisible, setIsVisible] = useState(isForum ? false : true); // Hidden by default on forum
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;

    const startTimer = () => {
      if (isForum) return; // Don't auto-hide/show based on timer for forum if manually managed
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const handleScroll = () => {
      if (isForum) return; // Disable scroll-based hiding for forum
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
          startTimer();
        }
        setLastScrollY(currentScrollY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isForum) return; // Disable mouse-move based showing for forum
      if (e.clientY < 100) {
        setIsVisible(true);
        startTimer();
      }
    };

    if (!isForum) {
      startTimer();
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimeout);
    };
  }, [lastScrollY, isForum]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!session || session.role === 'ADMIN') return;

    // Request notification permission
    if (typeof window !== 'undefined' && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    const checkUnread = async () => {
      try {
        const res = await fetch('/api/groups');
        if (res.ok) {
          const data = await res.json();
          const count = data.reduce((acc: number, g: any) => acc + (g.unreadCount || 0), 0);

          // If count increased, show browser notification
          if (count > totalUnread && !isForum) {
            if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
              const newGroups = data.filter((g: any) => g.unreadCount > 0);
              const latestGroup = newGroups[0];
              if (latestGroup) {
                new Notification(`New Message in ${latestGroup.name}`, {
                  body: latestGroup.messages?.[0]?.content || "You have a new message",
                  icon: "/svm_logo.png"
                });
              }
            }
          }

          setTotalUnread(count);
        }
      } catch { }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [session, totalUnread, isForum]);

  return (
    <>
      {/* PULL BUTTON FOR FORUM */}
      {isForum && (
        <button
          onClick={() => setIsVisible(!isVisible)}
          className={`nav-pull-btn ${isVisible ? 'active' : ''}`}
          title={isVisible ? "Hide Navbar" : "Show Navbar"}
        >
          {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      )}

      <nav className={`navbar ${useOverlay ? 'overlay' : ''} ${isVisible ? '' : 'nav-hidden'}`}>
        <Link href="/" className="nav-brand">
          <div style={{
            height: isForum ? '40px' : '65px',
            width: isForum ? '40px' : '65px',
            background: useOverlay ? 'linear-gradient(135deg, #ffffff 0%, #bdc3c7 50%, #7f8c8d 100%)' : 'linear-gradient(135deg, #7f8c8d 0%, #bdc3c7 50%, #ffffff 100%)',
            WebkitMaskImage: 'url(/svm_logo.png)',
            maskImage: 'url(/svm_logo.png)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            transition: 'all 0.3s ease'
          }} />
          <span className="brand-text" style={{ fontSize: isForum ? '1.2rem' : '1.5rem', transition: 'all 0.3s ease' }}>Shubha Vidyalaya</span>
        </Link>

        <button className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link href="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/about" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          <Link href="/newsletter" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Newsletter</Link>
          <Link href="/career" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Careers</Link>
          <Link href="/admissions" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Admission / Contact us</Link>
          {session ? (
            <>
              <Link href="/forum" className="nav-link" style={{
                color: useOverlay ? 'var(--accent)' : 'var(--accent)',
                fontWeight: 700,
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }} onClick={() => setIsMobileMenuOpen(false)}>
                Forum
                {totalUnread > 0 && !isForum && (
                  <span className="nav-badge">{totalUnread}</span>
                )}
              </Link>
              <Link href="/profile" className="nav-link" style={{ fontWeight: 700 }} onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
              {session.role === 'ADMIN' && (
                <Link href="/admin" className="nav-link" style={{ color: 'var(--success)' }} onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
              )}
            </>
          ) : null}

          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: useOverlay ? 'white' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem'
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {session ? (
            <LogoutButton />
          ) : (
            <Link href="/login" className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
          )}
        </div>
      </nav>
    </>
  );
}
