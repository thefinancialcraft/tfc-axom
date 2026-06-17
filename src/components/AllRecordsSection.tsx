import React from 'react';

export default function AllRecordsSection() {
  return (
    <div style={{ padding: '0 24px', marginTop: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: 0 }}>All Records</h2>
        <span style={{ 
          backgroundColor: '#fff',
          color: '#000',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '13px', 
          fontWeight: '600', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px' 
        }}>
          View all
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
      </div>
      
      {/* List of records will be added here */}
    </div>
  );
}
