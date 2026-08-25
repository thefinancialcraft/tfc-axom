'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Activity,
  CalendarOff,
  Wallet,
  Briefcase,
  Clock,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/profile';

interface SubNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: SubNavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // State to manage open/collapsed categories
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({
    attendance: true,
    'hr-management': true,
    users: true,
  });

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

  const navCategories: NavCategory[] = [
    {
      id: 'attendance',
      title: 'Attendance',
      icon: <ClipboardList size={18} />,
      items: [
        { label: 'Attendance Record', href: '/attendance/records', icon: <ClipboardList size={15} /> },
        { label: 'Activities', href: '/attendance/activities', icon: <Activity size={15} /> },
        { label: 'Paid Leaves', href: '/attendance/paid-leaves', icon: <CalendarOff size={15} /> },
        { label: 'Salary', href: '/attendance/salary', icon: <Wallet size={15} /> },
      ]
    },
    {
      id: 'hr-management',
      title: 'H.R & Management',
      icon: <Briefcase size={18} />,
      items: [
        { label: 'Employees', href: '/hr/employees', icon: <Users size={15} /> },
        { label: 'Attendance', href: '/hr/attendance', icon: <Clock size={15} /> },
        { label: 'Recruitment', href: '/hr/recruitment', icon: <FileText size={15} /> },
        { label: 'Performance', href: '/hr/performance', icon: <TrendingUp size={15} /> },
        { label: 'Payroll', href: '/hr/payroll', icon: <DollarSign size={15} /> },
      ]
    },
    {
      id: 'users',
      title: 'Users',
      icon: <Users size={18} />,
      items: [
        { label: 'Add New', href: '/users/add', icon: <UserPlus size={15} /> },
        { label: 'Live Users', href: '/users/live-users', icon: <UserCheck size={15} /> },
        { label: 'Rejected Users', href: '/users/rejected', icon: <UserX size={15} /> },
      ]
    }
  ];

  // Auto-expand category if current route is inside it
  useEffect(() => {
    navCategories.forEach(category => {
      const hasActiveChild = category.items.some(item =>
        pathname === item.href || (item.href !== '/' && item.href !== '/users' && pathname.startsWith(item.href))
      );
      if (hasActiveChild) {
        setOpenCategories(prev => ({ ...prev, [category.id]: true }));
      }
    });
  }, [pathname]);

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Don't show sidebar on auth pages or complete profile
  if (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/complete-profile' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'
  ) {
    return null;
  }

  const profile = profileData?.profile;
  const session = profileData?.session;
  const userName = profile?.user_name || session?.user?.user_metadata?.full_name || 'User';
  const email = profile?.email || session?.user?.email || '';
  const avatarUrl = profile?.profile_pic_url || "/dm-hr.png";

  const isItemActive = (href: string) => {
    if (href === '/dashboard' || href === '/users') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header" style={{ padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
        <img src="/logo.png" alt="TFC Axom Logo" style={{ width: 'auto', height: '45px', objectFit: 'contain' }} />
      </div>

      <nav className="sidebar-nav">
        {/* Main Dashboard Link */}
        <div style={{ marginBottom: '8px' }}>
          <Link
            href="/dashboard"
            className={`sidebar-link ${isItemActive('/dashboard') ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Categories */}
        {navCategories.map((category) => {
          const isOpen = openCategories[category.id];
          const hasActiveChild = category.items.some(item => isItemActive(item.href));

          return (
            <div key={category.id} className="sidebar-category-group">
              <button
                type="button"
                className={`sidebar-category-btn ${hasActiveChild ? 'has-active' : ''}`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="sidebar-category-left">
                  <span className="sidebar-category-icon">{category.icon}</span>
                  <span className="sidebar-category-title">{category.title}</span>
                </div>
                <span className="sidebar-category-chevron">
                  {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </span>
              </button>

              {isOpen && (
                <div className="sidebar-subnav-container">
                  {category.items.map((item) => {
                    const isActive = isItemActive(item.href);
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`sidebar-sublink ${isActive ? 'active' : ''}`}
                      >
                        <span className="sidebar-sublink-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
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
