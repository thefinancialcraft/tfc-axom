'use client';
import React, { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/profile';
import { usePathname } from 'next/navigation';

export default function TopHeader() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const pathname = usePathname();

  useEffect(() => {
    async function loadProfile() {
      const res = await getUserProfile();
      if (res && res.profile) {
        setUserName(res.profile.user_name || res.session?.user?.email?.split('@')[0] || 'User');
        if (res.profile.profile_pic_url) {
          setProfilePic(res.profile.profile_pic_url);
        }
      }
    }
    loadProfile();
  }, [pathname]); // Reload profile pic if path changes (like coming back from profile page)

  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/attendance/records': return 'Attendance Records';
      case '/attendance/activities': return 'Activities';
      case '/attendance/paid-leaves': return 'Paid Leaves';
      case '/attendance/salary': return 'Salary';
      case '/hr/employees': return 'Employees';
      case '/hr/attendance': return 'H.R Attendance';
      case '/hr/recruitment': return 'Recruitment';
      case '/hr/performance': return 'Performance';
      case '/hr/payroll': return 'Payroll';
      case '/users':
      case '/users/live-users': return 'Live Users';
      case '/users/add': return 'Add New User';
      case '/users/rejected': return 'Rejected Users';
      case '/complete-profile': return 'Profile Setup';
      case '/profile': return 'My Profile';
      default:
        if (path.startsWith('/users/')) return 'User Details';
        return '';
    }
  };

  return (
    <header className="app-top-header">
      <div className="header-search">
        <h2 className="header-page-title">
          {getPageTitle(pathname)}
        </h2>
      </div>
      <div className="header-profile">
        <span className="header-username">Hi, {userName}</span>
        <img src={profilePic || '/dm-hr.png'} alt="Profile" className="header-avatar" />
      </div>
    </header>
  );
}
