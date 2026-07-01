'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfileCheck() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      // Check if Supabase returned an OAuth error in the URL (e.g. signup disabled)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        if (urlParams.get('error') === 'access_denied' || hashParams.get('error') === 'access_denied' || urlParams.get('error') === 'account_not_found') {
          // Clear the ugly URL
          router.replace('/login');
          setShowPopup(true);
          setChecking(false);
          if (typeof document !== 'undefined') {
            document.body.classList.remove('hide-dashboard');
          }
          return;
        }
      }

      // Small delay to ensure Supabase parsed the hash
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // No session, just stop checking
          setChecking(false);
          if (typeof document !== 'undefined') {
            document.body.classList.remove('hide-dashboard');
          }
          return;
        }

        // We have a session, check user_profiles
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!data) {
          // Profile not found: 
          // 1. Delete their newly created auth.users entry from Supabase backend
          const { error: rpcError } = await supabase.rpc('delete_self_account');
          if (rpcError) {
            console.error('Failed to delete ghost account:', rpcError);
          }
          
          // 2. Sign them out
          await supabase.auth.signOut();
          // Force clear local storage tokens just in case backend deletion caused signOut to fail locally
          if (typeof window !== 'undefined') {
            for (let key in localStorage) {
              if (key.startsWith('sb-')) {
                localStorage.removeItem(key);
              }
            }
          }
          
          // Redirect to login with error parameter to trigger popup on a clean URL
          router.replace('/login?error=account_not_found');
          return;
        } else {
          // Profile found: redirect to dashboard
          router.replace('/dashboard');
        }
        setChecking(false);
        if (typeof document !== 'undefined') {
          document.body.classList.remove('hide-dashboard');
        }
      }, 500); // 500ms delay to allow supabase to parse hash
    }

    checkProfile();
  }, [router]);

  if (checking) {
    if (typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.search.includes('error='))) {
      return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>Verifying your account...</div>
        </div>
      );
    }
  }

  if (showPopup) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 99999
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '32px',
          borderRadius: '16px',
          maxWidth: '400px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '22px', color: '#000', fontWeight: '700' }}>Account Not Found</h2>
          <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#555', lineHeight: '1.5' }}>
            You don't have an active profile registered with us. Please create an account or contact your Admin to get access.
          </p>
          <button 
            onClick={() => {
              setShowPopup(false);
              router.replace('/login');
            }}
            style={{
              padding: '14px 24px',
              backgroundColor: '#1C1C1C',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Okay
          </button>
        </div>
      </div>
    );
  }

  return null;
}
