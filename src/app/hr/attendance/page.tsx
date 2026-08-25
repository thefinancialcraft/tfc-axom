'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HRAttendancePage() {
  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <Header
        category="H.R & Management"
        title="Attendance"
        description="HR oversight of team attendance, shift allocations, and anomalies."
      />
      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
