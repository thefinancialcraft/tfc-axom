import { supabase } from './supabase';

export async function getUserProfile() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned, which is fine for a new user
      console.error('Error fetching user profile:', error);
      return null;
    }

    return { session, profile: data };
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error);
    return null;
  }
}
