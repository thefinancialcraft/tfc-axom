'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HRPayrollPage() {
  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <Header
        category="H.R & Management"
        title="Payroll"
        description="Payroll processing, tax deductions, and salary disbarment."
      />
      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
