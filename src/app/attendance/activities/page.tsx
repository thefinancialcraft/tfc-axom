'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AttendanceActivitiesPage() {
  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <Header
        category="Attendance"
        title="Activities"
        description="Track recent user check-in, check-out, and activity history."
      />
      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
