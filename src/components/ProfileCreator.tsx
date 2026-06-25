'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfileCreator() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function handleSignup() {
      // Check if we are returning from Google OAuth (either hash or search params for PKCE)
      if (typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
        setCreating(true);
        
        // Delay to allow Supabase to process the token/code and set the session
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Check if user already exists in user_profiles
            const { data, error } = await supabase
              .from('user_profiles')
              .select('user_id')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (!data) {
              // Create the profile since they came through the Signup page
              const { error: insertError } = await supabase.from('user_profiles').insert({
                user_id: session.user.id,
                email: session.user.email,
                user_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                phone: session.user.phone || null,
                profile_pic_url: session.user.user_metadata?.avatar_url || ''
              });

              if (insertError) {
                console.error("Error inserting profile:", insertError);
              }
            }
            
            // Redirect to dashboard after creation
            router.replace('/dashboard');
          } else {
            setCreating(false);
          }
        }, 1000); // 1 second delay to ensure session is ready
      }
    }
    handleSignup();
  }, [router]);

  if (creating) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>Setting up your profile...</div>
      </div>
    );
  }

  return null;
}
