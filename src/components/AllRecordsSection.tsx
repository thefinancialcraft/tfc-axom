import React from 'react';
import { Fingerprint, Camera } from 'lucide-react';

export default function AllRecordsSection() {
  const records = [
    { date: '12 Jun 25', checkIn: '12:10 AM', checkOut: '07:00 PM', status: 'Half Day', mode: 'fingerprint' },
    { date: '13 Jun 25', checkIn: '10:00 AM', checkOut: '07:18 PM', status: 'On time', mode: 'camera' },
    { date: '14 Jun 25', checkIn: '--', checkOut: '--', status: 'Absent', mode: 'none' },
    { date: '15 Jun 25', checkIn: '--', checkOut: '--', status: 'Absent', mode: 'none' },
  ];

  return (
    <div style={{ padding: '0 24px', marginTop: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
      
      {/* Table Container */}
      <div style={{ 
        backgroundColor: '#262626', 
        borderRadius: '16px', 
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>Date</th>
                <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>Check In</th>
                <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>Check Out</th>
                <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>Status</th>
                <th style={{ padding: '16px', color: '#888', fontSize: '13px', fontWeight: '500' }}>Mode</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} style={{ borderBottom: index !== records.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: '16px', color: '#fff', fontSize: '14px', whiteSpace: 'nowrap' }}>{record.date}</td>
                  <td style={{ padding: '16px', color: '#A3A3A3', fontSize: '14px', whiteSpace: 'nowrap' }}>{record.checkIn}</td>
                  <td style={{ padding: '16px', color: '#A3A3A3', fontSize: '14px', whiteSpace: 'nowrap' }}>{record.checkOut}</td>
                  <td style={{ 
                    padding: '16px', 
                    color: record.status.toLowerCase() === 'on time' ? '#4ADE80' : record.status.toLowerCase() === 'absent' ? '#EF4444' : '#FBBF24', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {record.status}
                  </td>
                  <td style={{ padding: '16px', color: '#A3A3A3' }}>
                    {record.mode === 'fingerprint' ? <Fingerprint size={18} /> : record.mode === 'camera' ? <Camera size={18} /> : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
