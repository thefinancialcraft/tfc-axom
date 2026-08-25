'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SalaryPage() {
  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <Header
        category="Attendance"
        title="Salary"
        description="View salary details, payslips, and compensation structures."
      />
      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
