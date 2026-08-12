'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/reset-password';
  const [isAuthorized, setIsAuthorized] = useState(isPublicRoute);
  
  // Scroll tracking and auto-hide state for MobileNav
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = React.useRef(0);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearHideTimer = React.useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, []);

  const resetHideTimer = React.useCallback(() => {
    clearHideTimer();
    hideTimeoutRef.current = setTimeout(() => {
      setIsNavVisible(false);
    }, 5000);
  }, [clearHideTimer]);

  // Start the timer on mount, and whenever nav becomes visible or path changes
  useEffect(() => {
    if (isNavVisible) {
      resetHideTimer();
    }
    return () => clearHideTimer();
  }, [isNavVisible, resetHideTimer, clearHideTimer, pathname]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        if (!isPublic) {
          router.replace('/login');
        } else {
          setIsAuthorized(true);
        }
      } else {
        let isRecovery = false;
        if (typeof window !== 'undefined') {
          if (window.location.hash.includes('type=recovery')) {
            if (session.user.email) {
              localStorage.setItem('recovery_pending_for', session.user.email);
            }
            isRecovery = true;
          } else {
            const pendingUser = localStorage.getItem('recovery_pending_for');
            if (pendingUser && pendingUser === session.user.email) {
              isRecovery = true;
            }
          }
        }

        if (isRecovery) {
          if (pathname !== '/reset-password') {
            router.replace('/reset-password');
          } else {
            setIsAuthorized(true);
          }
        } else {
          if (isPublic && pathname !== '/reset-password') {
            router.replace('/dashboard');
          } else {
            setIsAuthorized(true);
          }
        }
      }
    };
    
    checkSession();
 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'INITIAL_SESSION') return;
      
      const isCurrentlyPublic = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/reset-password';
      
      if (!session) {
        localStorage.removeItem('recovery_pending_for');
        if (!isCurrentlyPublic) {
          router.replace('/login');
        }
      } else {
        let isRecovery = false;
        if (typeof window !== 'undefined') {
          if (window.location.hash.includes('type=recovery')) {
            if (session.user.email) {
              localStorage.setItem('recovery_pending_for', session.user.email);
            }
            isRecovery = true;
          } else {
            const pendingUser = localStorage.getItem('recovery_pending_for');
            if (pendingUser && pendingUser === session.user.email) {
              isRecovery = true;
            }
          }
        }

        if (isRecovery) {
          if (pathname !== '/reset-password') {
            router.replace('/reset-password');
          } else {
            setIsAuthorized(true);
          }
        } else {
          if (isCurrentlyPublic && pathname !== '/reset-password') {
            router.replace('/dashboard');
          } else {
            setIsAuthorized(true);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const isPublic = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname === '/reset-password';

  if (!isAuthorized && !isPublic) {
    return (
      <div style={{ 
        position: 'fixed', inset: 0, backgroundColor: '#0F0F0F', zIndex: 9999, 
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
          <img src="/logo.png" alt="Loading" style={{ width: '50px', height: 'auto', filter: 'brightness(0) invert(1)' }} />
        </div>
      </div>
    );
  }

  if (isPublic) {
    return <>{children}</>;
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsNavVisible(false);
    } else if (currentScrollY < lastScrollY.current) {
      setIsNavVisible(true);
      resetHideTimer(); // Reset the 5s countdown on every scroll up tick!
    }
    
    lastScrollY.current = currentScrollY;
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="page-content" onScroll={handleScroll}>
          {children}
        </div>
      </div>
      <MobileNav 
        isVisible={isNavVisible} 
        onInteractStart={clearHideTimer}
        onInteractEnd={resetHideTimer}
      />
    </div>
  );
}
