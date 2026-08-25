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
  father_name?: string;
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

  // Check if phone number is already registered in user_profiles
  if (userData.phone) {
    const { data: existingPhone } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('phone', userData.phone)
      .limit(1);

    if (existingPhone && existingPhone.length > 0) {
      return { success: false, error: 'Phone number already registered by another user' };
    }
  }

  // Check if email is already registered in user_profiles
  if (userData.email) {
    const { data: existingEmail } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('email', userData.email)
      .limit(1);

    if (existingEmail && existingEmail.length > 0) {
      return { success: false, error: 'A user with this email address has already been registered' };
    }
  }

  // Check if Employee ID is already assigned to another user
  if (userData.employee_id) {
    const { data: existingEmpId } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('employee_id', userData.employee_id)
      .limit(1);

    if (existingEmpId && existingEmpId.length > 0) {
      return { success: false, error: `This Employee ID (${userData.employee_id}) is already assigned to another user.` };
    }
  }
  
  // Create user in Auth (email_confirm: true creates verified account without sending email OTP)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: tempPassword,
    email_confirm: true,
    phone: userData.phone || undefined,
    phone_confirm: !!userData.phone,
    user_metadata: {
      full_name: userData.user_name,
      father_name: userData.father_name || undefined
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
    .upsert({
      user_id: userId,
      email: userData.email,
      user_name: userData.user_name,
      father_name: userData.father_name || null,
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
    }, { onConflict: 'user_id' });

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

export async function getNextEmployeeIdAction() {
  if (!supabaseServiceKey) {
    return { success: true, nextEmployeeId: 'TFC-001' };
  }

  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('employee_id')
    .not('employee_id', 'is', null);

  let maxNum = 0;

  if (data && data.length > 0) {
    data.forEach((row: { employee_id: string | null }) => {
      if (row.employee_id) {
        const match = row.employee_id.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      }
    });
  }

  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(3, '0');
  return { success: true, nextEmployeeId: `TFC-${padded}` };
}

