'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Wallet, CalendarOff, ClipboardList, Activity, LogOut, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/profile';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getUserProfile();
      if (data) {
        setProfileData(data);
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { label: 'Activities', icon: <Activity size={20} />, href: '/attendance-activities' },
    { label: 'Attendance', icon: <ClipboardList size={20} />, href: '/attendance-records' },
    { label: 'Paid Leaves', icon: <CalendarOff size={20} />, href: '/paid-leaves' },
    { label: 'Salary', icon: <Wallet size={20} />, href: '/salary' },
    { label: 'Users', icon: <Users size={20} />, href: '/users' },
  ];

  // Don't show sidebar on auth pages or complete profile
  if (pathname === '/login' || pathname === '/signup' || pathname === '/complete-profile' || pathname === '/forgot-password' || pathname === '/reset-password') {
    return null;
  }

  const profile = profileData?.profile;
  const session = profileData?.session;
  const userName = profile?.user_name || session?.user?.user_metadata?.full_name || 'User';
  const email = profile?.email || session?.user?.email || '';
  const avatarUrl = profile?.profile_pic_url || "/dm-hr.png";

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header" style={{ padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
        <img src="/logo.png" alt="TFC Axom Logo" style={{ width: 'auto', height: '45px', objectFit: 'contain' }} />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.label} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ padding: '16px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '16px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <img
            src={avatarUrl}
            alt="Profile"
            style={{
              marginLeft: '-4px',
              width: '48px', height: '60px', borderRadius: '4px', objectFit: 'cover', objectPosition: 'bottom', filter: 'grayscale(100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
              opacity: isLoading ? 0.3 : 1,
              transition: 'opacity 0.3s'
            }}
          />
          <div style={{ flex: 1, overflow: 'hidden', opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>ID: TFC-011</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <button
            onClick={() => router.push('/profile')}
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            title="Profile"
          >
            <User size={16} />
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{ flex: 1, height: '40px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: 'rgba(253,101,121,0.1)', border: '1px solid rgba(253,101,121,0.2)', borderRadius: '12px', color: '#FD6579', cursor: isLoggingOut ? 'not-allowed' : 'pointer', transition: 'all 0.2s', fontSize: '14px', fontWeight: '500', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', opacity: isLoggingOut ? 0.7 : 1 }}
            onMouseOver={(e) => !isLoggingOut && (e.currentTarget.style.background = 'rgba(253,101,121,0.2)')}
            onMouseOut={(e) => !isLoggingOut && (e.currentTarget.style.background = 'rgba(253,101,121,0.1)')}
            title="Logout"
          >
            {isLoggingOut ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(253,101,121,0.3)', borderTopColor: '#FD6579', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <LogOut size={16} />
            )}
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
