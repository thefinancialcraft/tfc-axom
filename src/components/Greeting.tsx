'use client';

import React, { useEffect, useState } from 'react';
import { getUserProfile, getCachedProfile } from '@/lib/profile';

const getGreeting = () => {
  if (typeof window === 'undefined') return 'Good Morning'; // Default for SSR
  const currentHour = new Date().getHours();
  if (currentHour < 12) return 'Good Morning';
  if (currentHour < 17) return 'Good Afternoon';
  if (currentHour < 21) return 'Good Evening';
  return 'Good Night';
};

export default function Greeting() {
  const greeting = getGreeting();
  
  const cached = getCachedProfile();
  const initialName = cached?.profile?.user_name || cached?.session?.user?.user_metadata?.full_name || null;

  const [userName, setUserName] = useState<string | null>(initialName);

  useEffect(() => {
    if (userName) return; // Already have name

    const fetchProfile = async () => {
      const data = await getUserProfile();
      if (data?.profile?.user_name) {
        setUserName(data.profile.user_name);
      } else if (data?.session?.user?.user_metadata?.full_name) {
        setUserName(data.session.user.user_metadata.full_name);
      } else {
        setUserName('User');
      }
    };
    fetchProfile();
  }, [userName]);

  return (
    <div style={{ padding: '90px 24px 20px 24px', width: '100%', textAlign: 'left' }}>
      <h1 
        suppressHydrationWarning 
        style={{ 
          fontSize: '18px', 
          fontWeight: '300', 
          margin: '0 0 10px 0', 
          color: 'rgba(255, 255, 255, 0.6)'
        }}
      >
        {greeting}
      </h1>
      <h2 style={{
        fontSize: '36px',
        fontWeight: '500',
        margin: '4px 0 0 0',
        color: 'var(--color-white)',
        letterSpacing: '-1px',
        lineHeight: '1.1'
      }}>
        {userName ? userName : (
          <div style={{
            height: '40px',
            width: '200px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            animation: 'pulse 1.5s infinite ease-in-out'
          }} />
        )}
      </h2>
    </div>
  );
}
