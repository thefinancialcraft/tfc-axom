'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Wallet, ClipboardList, Activity, Users } from 'lucide-react';

interface MobileNavProps {
  isVisible?: boolean;
  onInteractStart?: () => void;
  onInteractEnd?: () => void;
}

export default function MobileNav({ isVisible = true, onInteractStart, onInteractEnd }: MobileNavProps) {
  const pathname = usePathname();
  const [optimisticPath, setOptimisticPath] = useState(pathname);

  // Sync optimistic path when actual pathname changes
  useEffect(() => {
    setOptimisticPath(pathname);
  }, [pathname]);

  // Don't show nav on auth pages or complete profile
  if (pathname === '/login' || pathname === '/signup' || pathname === '/complete-profile' || pathname === '/forgot-password' || pathname === '/reset-password') {
    return null;
  }

  const navItems = [
    { label: 'Home', icon: <LayoutDashboard size={22} />, href: '/dashboard' },
    { label: 'Attendance', icon: <ClipboardList size={22} />, href: '/attendance-records' },
    { label: 'Activity', icon: <Activity size={22} />, href: '/attendance-activities' },
    { label: 'Salary', icon: <Wallet size={22} />, href: '/salary' },
    { label: 'Users', icon: <Users size={22} />, href: '/users' },
    { label: 'Profile', icon: <User size={22} />, href: '/profile' },
  ];

  return (
    <div 
      className={`mobile-nav ${isVisible ? '' : 'nav-hidden'}`}
      onTouchStart={onInteractStart}
      onTouchEnd={onInteractEnd}
      onMouseEnter={onInteractStart}
      onMouseLeave={onInteractEnd}
    >
      {navItems.map((item) => {
        const isActive = optimisticPath === item.href || optimisticPath.startsWith(item.href + '/');
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setOptimisticPath(item.href)}
          >
            <div className="mobile-nav-icon">
              {item.icon}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
