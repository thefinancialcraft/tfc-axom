'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthHashCleaner() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if the URL contains Supabase auth tokens in the hash
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      // Supabase automatically parses this, so we just need to clean the URL up
      // Add a small delay to ensure Supabase saves the session first
      setTimeout(() => {
        router.replace(pathname || '/dashboard');
      }, 100);
    }
  }, [router, pathname]);

  return null;
}
