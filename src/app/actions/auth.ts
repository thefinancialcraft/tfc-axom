'use server';

import { createClient } from '@supabase/supabase-js';

// WARNING: Exposing the service key with NEXT_PUBLIC_ is a major security risk. 
// We are using it here because it's defined this way, but you should rename it to SUPABASE_SERVICE_ROLE_KEY in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function updateAuthUserAdmin(userId: string, updates: { email?: string; phone?: string }) {
  if (!supabaseServiceKey) {
    throw new Error('Supabase Service Role Key is missing.');
  }
  
  if (Object.keys(updates).length === 0) {
    return { success: true };
  }

  // Admin updateUserById bypasses normal email/phone restrictions and OTP requirements
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates);

  if (error) {
    console.error('Admin update error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
