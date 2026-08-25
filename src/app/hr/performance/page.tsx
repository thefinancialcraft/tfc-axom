'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HRPerformancePage() {
  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <Header
        category="H.R & Management"
        title="Performance"
        description="Performance reviews, KPIs, and employee evaluations."
      />
      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
