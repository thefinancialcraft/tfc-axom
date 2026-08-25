'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AttendanceRecordsPage() {
  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <Header
        category="Attendance"
        title="Attendance Record"
        description="View and manage daily employee attendance records and logs."
      />
      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
