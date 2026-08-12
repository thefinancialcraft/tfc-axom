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

  return (
    <header className="app-top-header">
      <div className="header-search">
        <h2 className="header-page-title">
          {pathname === '/dashboard' ? 'Dashboard' : pathname === '/complete-profile' ? 'Profile Setup' : ''}
        </h2>
      </div>
      <div className="header-profile">
        <span className="header-username">Hi, {userName}</span>
        <img src={profilePic || '/dm-hr.png'} alt="Profile" className="header-avatar" />
      </div>
    </header>
  );
}
