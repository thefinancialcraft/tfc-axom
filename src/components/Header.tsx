import React from 'react';

export default function Header() {
  return (
    <header style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-white)' }}>Attendance</h1>
    </header>
  );
}

