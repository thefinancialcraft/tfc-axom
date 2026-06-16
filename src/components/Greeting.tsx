'use client';

import React from 'react';

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
        Deepak Kumar
      </h2>
    </div>
  );
}
