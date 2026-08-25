'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RejectedUsersPage() {
  return (
    <main className="page-fade-in" style={{ position: 'relative', width: '100%', paddingBottom: '100px' }}>
      <Header
        category="Users"
        title="Rejected Users"
        description="List of user registrations or applications that were rejected."
      />
      <Footer />
      <div className="bottom-left-pattern" />
    </main>
  );
}
