'use client';
import React, { useState } from 'react';
import MeteorShower from './MeteorShower';

export default function CalendarSection() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => {
    const prevDate = new Date(currentDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    setCurrentDate(prevDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    setCurrentDate(nextDate);
  };

  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
                         currentDate.getFullYear() === today.getFullYear();

  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonth = `${monthsShort[currentDate.getMonth()]} ${currentDate.getFullYear().toString().slice(-2)}`;
  const displayString = formattedMonth;

  // Calendar Mock Data exactly matching the image
  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const calendarDays = [
    // Row 1
    { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'empty' }, { type: 'green', date: 1 }, { type: 'green', date: 2 },
    // Row 2
    { type: 'green', date: 3 }, { type: 'striped' }, { type: 'striped' }, { type: 'green', date: 5 }, { type: 'green', date: 6 }, { type: 'striped' }, { type: 'striped' },
    // Row 3
    { type: 'green', date: 9 }, { type: 'green', date: 10 }, { type: 'sun' }, { type: 'sun' }, { type: 'sun' }, { type: 'sun' }, { type: 'sun' },
    // Row 4
    { type: 'sun' }, { type: 'sun' }, { type: 'green', date: 18 }, { type: 'red', date: 19 }, { type: 'striped' }, { type: 'striped' }, { type: 'green', date: 22 },
    // Row 5
    { type: 'green', date: 23 }, { type: 'striped' }, { type: 'yellow', date: 25 }, { type: 'yellow', date: 26 }, { type: 'red', date: 27 }, { type: 'striped' }, { type: 'empty' }
  ];

  const renderDay = (day: any, index: number) => {
    let bg = 'transparent';
    let border = 'none';
    let content = day.date || '';
    let color = '#fff';

    if (day.type === 'empty') {
      border = '1px solid #2A2A2A';
    } else if (day.type === 'green') {
      bg = '#34BB88'; // matching the teal/green from image
    } else if (day.type === 'red') {
      bg = '#FD6579';
    } else if (day.type === 'yellow') {
      bg = '#FFE76B';
      color = '#000';
    } else if (day.type === 'striped') {
      bg = 'repeating-linear-gradient(45deg, #1A1A1A, #1A1A1A 4px, #2A2A2A 4px, #2A2A2A 8px)';
    } else if (day.type === 'sun') {
      bg = '#2A2A2A';
      content = (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"></circle>
          <line x1="12" y1="2" x2="12" y2="4"></line>
          <line x1="12" y1="20" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
          <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="4" y2="12"></line>
          <line x1="20" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line>
          <line x1="17.66" y1="4.93" x2="19.07" y2="6.34"></line>
        </svg>
      );
    }

    return (
      <div key={index} style={{
        width: '100%',
        aspectRatio: '1/1',
        borderRadius: '50%',
        background: bg,
        border: border,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        fontSize: '14px',
        fontWeight: '600',
        boxSizing: 'border-box'
      }}>
        {content}
      </div>
    );
  };

  return (
    <div className="calendar-table-container" style={{ padding: '0 24px', marginTop: '10px', marginBottom: '10px', display: 'flex', flexDirection: 'column' }}>
      
      {/* Calendar Card */}
      <div className="calendar-card">
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--text-color)', fontSize: '20px', fontWeight: '600', margin: 0 }}>Calendar</h2>
          
          {/* Month Filter matching SummarySection */}
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
            
            <span suppressHydrationWarning style={{ color: 'var(--text-color)', fontSize: '15px', fontWeight: '500', minWidth: '55px', textAlign: 'center', marginLeft: '12px' }}>
              {displayString}
            </span>
            
            <div style={{
              width: isCurrentMonth ? '0px' : '32px',
              marginLeft: isCurrentMonth ? '0px' : '12px',
              opacity: isCurrentMonth ? 0 : 1,
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
        
        {/* Calendar Grid */}
        <div style={{ marginTop: '10px' }}>
          {/* Weekdays */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {weekdays.map(wd => (
              <div key={wd} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '500' }}>
                {wd}
              </div>
            ))}
          </div>
          
          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {calendarDays.map((day, index) => renderDay(day, index))}
          </div>
        </div>
      </div>

      {/* Date - Final Status Table (Desktop Only) */}
      <div className="status-table-card desktop-only" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h2 style={{ color: 'var(--text-color)', fontSize: '20px', fontWeight: '600', margin: 0, marginBottom: '20px' }}>Final Status</h2>
        <div style={{ backgroundColor: '#000000', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '24px', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
          <div className="top-right-pattern" style={{ opacity: 0.15, right: 'auto', left: '-20px', top: '-20px', zIndex: 0 }}></div>
          <MeteorShower />
          
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '24px', color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <span>Date</span>
            <span style={{ textAlign: 'center' }}>Final Status</span>
            <span style={{ textAlign: 'right' }}>Decision</span>
          </div>
          {/* Table Body */}
          <div className="status-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1, paddingRight: '8px', minHeight: 0, maxHeight: '300px' }}>
            {[
              { date: '27 July, Monday', status: 'Present', color: '#4ADE80' },
              { date: '26 July, Sunday', status: 'Holiday', color: '#FF9800' },
              { date: '25 July, Saturday', status: 'Absent', color: '#FD6579' },
              { date: '24 July, Friday', status: 'Halfday', color: '#FFE76B' },
              { date: '23 July, Thursday', status: 'Present', color: '#4ADE80' },
              { date: '22 July, Wednesday', status: 'Present', color: '#4ADE80' },
              { date: '21 July, Tuesday', status: 'Present', color: '#4ADE80' },
              { date: '20 July, Monday', status: 'Absent', color: '#FD6579' },
              { date: '19 July, Sunday', status: 'Holiday', color: '#FF9800' },
              { date: '18 July, Saturday', status: 'Present', color: '#4ADE80' },
              { date: '17 July, Friday', status: 'Present', color: '#4ADE80' },
              { date: '16 July, Thursday', status: 'Halfday', color: '#FFE76B' },
              { date: '15 July, Wednesday', status: 'Present', color: '#4ADE80' },
              { date: '14 July, Tuesday', status: 'Present', color: '#4ADE80' },
              { date: '13 July, Monday', status: 'Present', color: '#4ADE80' }
            ].map((row, i) => {
              const [dayNum, ...restArr] = row.date.split(' ');
              const restDate = restArr.join(' ');
              return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '24px', alignItems: 'center', fontFamily: 'var(--font-lufga)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: `${row.color}20`, 
                    color: row.color,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '14px', 
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {dayNum}
                  </div>
                  <span style={{ color: 'var(--text-color)', fontSize: '15px' }}>{restDate}</span>
                </div>
                <span style={{ color: row.color, fontSize: '15px', fontWeight: '600', textAlign: 'center' }}>{row.status}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'right' }}>By System</span>
              </div>
            )})}
          </div>
        </div>
      </div>

    </div>
  );
}
