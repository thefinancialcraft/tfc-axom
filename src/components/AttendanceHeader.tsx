'use client';
import React, { useState } from 'react';

export default function AttendanceHeader() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setCurrentDate(prevDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
  };

  const today = new Date();
  const isToday = currentDate.getDate() === today.getDate() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getFullYear() === today.getFullYear();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')} ${months[currentDate.getMonth()]}`;
  const displayString = isToday ? 'Today' : formattedDate;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', marginBottom: '16px' }}>
      <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: 0 }}>Attendance</h2>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          onClick={handlePrev}
          style={{ 
          background: 'transparent', 
          border: '1px solid rgba(255, 255, 255, 0.4)', 
          color: 'var(--color-white)', 
          width: '32px', 
          height: '32px', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        
        <span suppressHydrationWarning style={{ color: '#fff', fontSize: '15px', fontWeight: '500', minWidth: '55px', textAlign: 'center', marginLeft: '12px' }}>
          {displayString}
        </span>
        
        <div style={{
          width: isToday ? '0px' : '32px',
          marginLeft: isToday ? '0px' : '12px',
          opacity: isToday ? 0 : 1,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          display: 'flex',
        }}>
          <button 
            onClick={handleNext}
            style={{ 
            background: 'transparent', 
            border: '1px solid rgba(255, 255, 255, 0.4)', 
            color: 'var(--color-white)', 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
