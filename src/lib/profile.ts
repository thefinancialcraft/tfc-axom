import { supabase } from './supabase';

let profileCache: any = null;
let profilePromise: Promise<any> | null = null;

export async function getUserProfile(forceRefresh = false) {
  if (profileCache && !forceRefresh) return profileCache;
  if (profilePromise && !forceRefresh) return profilePromise;

  profilePromise = (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        profilePromise = null;
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        profilePromise = null;
        return null;
      }

      profileCache = { session, profile: data };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_profile_cache', JSON.stringify(profileCache));
      }
      return profileCache;
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      profilePromise = null;
      return null;
    }
  })();

  return profilePromise;
}

export function getCachedProfile() {
  if (profileCache) return profileCache;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user_profile_cache');
    if (stored) {
      try {
        profileCache = JSON.parse(stored);
        return profileCache;
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}
