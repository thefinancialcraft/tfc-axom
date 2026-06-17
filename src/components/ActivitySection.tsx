'use client';
import React from 'react';

const activities = [
  { id: '#1', token: '2349887', icon: 'fingerprint', time: '12:00 AM' },
  { id: '#2', token: '2349888', icon: 'camera', time: '12:00 AM' },
  { id: '#3', token: '2349889', icon: 'fingerprint', time: '01:30 PM' },
  { id: '#4', token: '2349890', icon: 'camera', time: '06:00 PM' },
];

const FingerprintIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
    <path d="M2 12a10 10 0 0 1 18-6" />
    <path d="M2 16h.01" />
    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
    <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
  </svg>
);

const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);

export default function ActivitySection() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', marginTop: '32px', padding: '0 24px' }}>
      {/* Background Pattern */}
      <div className="top-right-pattern" style={{ opacity: 0.2, right: 'auto', left: '50%', transform: 'translateX(-50%)', top: '-50px' }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: 0 }}>Activity</h2>
          <button style={{
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            View All
          </button>
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
         

          {/* Activity Items */}
          {activities.map((item, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              transition: 'background-color 0.2s ease',
            }}>
              <div style={{ width: '10%', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', fontWeight: '600' }}>
                {item.id}
              </div>
              <div style={{ width: '40%', color: '#fff', fontSize: '15px', fontWeight: '500', letterSpacing: '0.5px' }}>
                {item.token}
              </div>
              <div style={{ width: '20%', display: 'flex', justifyContent: 'center', color: 'rgba(255, 255, 255, 0.8)' }}>
                {item.icon === 'fingerprint' ? <FingerprintIcon /> : <CameraIcon />}
              </div>
              <div style={{ width: '30%', textAlign: 'right', color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
