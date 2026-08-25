'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  Activity,
  CalendarOff,
  Wallet,
  Users,
  Clock,
  FileText,
  TrendingUp,
  DollarSign,
  UserPlus,
  UserCheck,
  UserX
} from 'lucide-react';

interface TabItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const attendanceTabs: TabItem[] = [
  { label: 'Attendance Record', href: '/attendance/records', icon: <ClipboardList size={16} /> },
  { label: 'Activities', href: '/attendance/activities', icon: <Activity size={16} /> },
  { label: 'Paid Leaves', href: '/attendance/paid-leaves', icon: <CalendarOff size={16} /> },
  { label: 'Salary', href: '/attendance/salary', icon: <Wallet size={16} /> },
];

const hrTabs: TabItem[] = [
  { label: 'Employees', href: '/hr/employees', icon: <Users size={16} /> },
  { label: 'Attendance', href: '/hr/attendance', icon: <Clock size={16} /> },
  { label: 'Recruitment', href: '/hr/recruitment', icon: <FileText size={16} /> },
  { label: 'Performance', href: '/hr/performance', icon: <TrendingUp size={16} /> },
  { label: 'Payroll', href: '/hr/payroll', icon: <DollarSign size={16} /> },
];

const usersTabs: TabItem[] = [
  { label: 'Live Users', href: '/users/live-users', icon: <UserCheck size={16} /> },
  { label: 'Add New', href: '/users/add', icon: <UserPlus size={16} /> },
  { label: 'Rejected Users', href: '/users/rejected', icon: <UserX size={16} /> },
];

export default function CategoryTabs() {
  const pathname = usePathname();

  let tabs: TabItem[] = [];
  if (pathname.startsWith('/attendance')) {
    tabs = attendanceTabs;
  } else if (pathname.startsWith('/hr')) {
    tabs = hrTabs;
  } else if (pathname.startsWith('/users')) {
    tabs = usersTabs;
  }

  if (tabs.length === 0) return null;

  return (
    <div style={{ padding: '0 24px', marginBottom: '28px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '6px',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          maxWidth: '100%',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/users' && pathname.startsWith(tab.href + '/'));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#000000' : 'rgba(255, 255, 255, 0.65)',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? '0 4px 14px rgba(255, 255, 255, 0.2)' : 'none'
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7, display: 'flex', alignItems: 'center' }}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
