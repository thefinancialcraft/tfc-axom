'use client';
import React from 'react';

const getDateDetails = () => {
  const today = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return {
    dayName: days[today.getDay()],
    dateStr: `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`
  };
};

export default function DateBanner() {
  const { dayName, dateStr } = getDateDetails();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      margin: '0 24px'
    }}>
      {/* Left: Calendar Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        backgroundColor: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        color: 'var(--color-white)',
        flexShrink: 0
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>

      {/* Middle: Date Details */}
      <div style={{ flex: 1, paddingLeft: '14px', display: 'flex', flexDirection: 'column' }}>
        <span suppressHydrationWarning style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-white)', lineHeight: '1.2' }}>
          {dayName}
        </span>
        <span suppressHydrationWarning style={{ fontSize: '13px', fontWeight: '400', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.2', marginTop: '4px' }}>
          {dateStr}
        </span>
      </div>

      {/* Right: Checkin with Border & Tick Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 4px 4px 14px',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '24px',
        color: 'var(--color-white)',
        fontSize: '13px',
        fontWeight: '400',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}>
        Check In
        <div style={{
          marginLeft: '8px',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}
