'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HRRecruitmentPage() {
  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <Header
        category="H.R & Management"
        title="Recruitment"
        description="Job postings, applicant tracking, and recruitment pipelines."
      />
      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
