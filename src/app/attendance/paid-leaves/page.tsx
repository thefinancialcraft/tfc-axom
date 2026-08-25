'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PaidLeavesPage() {
  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <Header
        category="Attendance"
        title="Paid Leaves"
        description="Manage leave requests, leave quotas, and approvals."
      />
      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
