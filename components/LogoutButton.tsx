'use client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // We call an API route to clear the cookie since we're on the client
    const res = await fetch('/api/logout', { method: 'POST' });
    if (res.ok) {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      className="btn danger" 
      style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
    >
      Logout
    </button>
  );
}
