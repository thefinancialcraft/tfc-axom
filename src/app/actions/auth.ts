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

export async function createAuthUserAdmin(userData: {
  email: string;
  phone?: string;
  user_name: string;
  password?: string;
  role?: string;
  employee_id?: string;
  department?: string;
  designation?: string;
  in_hand_salary?: number;
  work_type?: string;
  status?: string;
  approval_status?: string;
}) {
  if (!supabaseServiceKey) {
    throw new Error('Supabase Service Role Key is missing.');
  }

  const tempPassword = userData.password || 'TfcAxomPassword123!';
  
  // Create user in Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: tempPassword,
    email_confirm: true,
    phone: userData.phone || undefined,
    phone_confirm: !!userData.phone,
    user_metadata: {
      full_name: userData.user_name,
    }
  });

  if (authError) {
    console.error('Admin create user auth error:', authError);
    return { success: false, error: authError.message };
  }

  const userId = authData.user.id;

  // Create user profile in user_profiles
  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      user_id: userId,
      email: userData.email,
      user_name: userData.user_name,
      phone: userData.phone || null,
      role: userData.role || 'Employee',
      employee_id: userData.employee_id || null,
      department: userData.department || null,
      designation: userData.designation || null,
      in_hand_salary: userData.in_hand_salary || null,
      work_type: userData.work_type || 'Full Time',
      status: userData.status || 'Active',
      approval_status: userData.approval_status || 'Approved',
      profile_complete: false,
    });

  if (profileError) {
    console.error('Admin create user profile error:', profileError);
    // Attempt cleanup if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return { success: false, error: profileError.message };
  }

  return { success: true, data: authData.user };
}

export async function deleteAuthUserAdmin(userId: string) {
  if (!supabaseServiceKey) {
    throw new Error('Supabase Service Role Key is missing.');
  }

  // Delete from user_profiles table first (if cascade is not set up)
  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .delete()
    .eq('user_id', userId);

  if (profileError) {
    console.error('Error deleting profile:', profileError);
  }

  // Delete from Auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
    console.error('Admin delete user error:', authError);
    return { success: false, error: authError.message };
  }

  return { success: true };
}

export async function updateUserProfileAdmin(userId: string, profileUpdates: any) {
  if (!supabaseServiceKey) {
    throw new Error('Supabase Service Role Key is missing.');
  }

  // Update profile details
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update(profileUpdates)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Error updating user profile as admin:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

