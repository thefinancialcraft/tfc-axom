'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfileCheck() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [checking, setChecking] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkProfile() {
      // Check if Supabase returned an OAuth error in the URL (e.g. signup disabled)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        if (urlParams.get('error') === 'access_denied' || hashParams.get('error') === 'access_denied') {
          // Clear the ugly URL
          router.replace('/login');
          setShowPopup(true);
          setChecking(false);
          return;
        }
      }

      // Small delay to ensure Supabase parsed the hash
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // No session, just stop checking
          setChecking(false);
          return;
        }

        // We have a session, check user_profiles
        const { data, error } = await supabase
          .from('user_profiles')
          .select('user_id, profile_complete')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (!data) {
          // Profile not found: 
          // ... 
          const { error: rpcError } = await supabase.rpc('delete_self_account');
          if (rpcError) console.error('Failed to delete ghost account:', rpcError);
          
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/login');
          }
          await supabase.auth.signOut();
          if (typeof window !== 'undefined') {
            for (let key in localStorage) {
              if (key.startsWith('sb-')) localStorage.removeItem(key);
            }
          }
          setShowPopup(true);
          setChecking(false);
        } else {
          // Profile found: check if complete
          if (data.profile_complete === true) {
            router.replace('/dashboard');
            return; // Do not hide splash screen while redirecting
          } else {
            router.replace('/complete-profile');
            return; // Do not hide splash screen while redirecting
          }
        }
      }, 500); // 500ms delay to allow supabase to parse hash
    }

    checkProfile();
  }, [router]);

  if (checking) {
    return (
      <div style={{ 
        position: 'fixed', inset: 0, backgroundColor: '#0F0F0F', zIndex: 9999, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'splash-fade-in 0.8s ease-out', overflow: 'hidden'
      }}>
        <style>{`
          @keyframes splash-fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes splash-scale-up {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        
        {/* Background Elements */}
        <div className="top-right-pattern" style={{ opacity: 0.3 }}></div>
        <div className="bottom-left-pattern" style={{ opacity: 0.3 }}></div>
        <div className="star-layer stars-1"></div>
        <div className="star-layer stars-2"></div>
        <div className="star-layer stars-3"></div>
        <div className="star-layer stars-4"></div>
        <div className="star-layer stars-5"></div>
        <div className="star-layer stars-6"></div>

        {/* Center Logo & Spinner */}
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, animation: 'splash-scale-up 1s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <svg className="snake-spinner" viewBox="25 25 50 50" style={{ position: 'absolute', width: '120px', height: '120px' }}>
            <circle className="snake-spinner-circle" cx="50" cy="50" r="20" fill="none" strokeWidth="1.5" strokeMiterlimit="10" />
          </svg>
          <img src="/logo.png" alt="Axom" style={{ width: '50px', height: 'auto', filter: 'brightness(0) invert(1)' }} />
        </div>
      </div>
    );
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
            onClick={() => setShowPopup(false)}
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
