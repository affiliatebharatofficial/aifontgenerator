import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Profile } from '@/types/database';

export interface AdminAuthResult {
  user: {
    id: string;
    email: string;
  };
  profile: Profile;
}

/**
 * Server-side helper to strictly verify that the current user is authenticated
 * and possesses an 'admin' role in the database profiles table.
 *
 * Returns the authenticated user and profile record.
 * Throws redirect to /login if unauthenticated.
 * Returns null or throws error for 403 authorization failures.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/admin');
  }

  // Fetch verified profile from database
  const { data, error: dbError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = data as Profile | null;

  if (dbError || !profile || profile.role !== 'admin') {
    throw new Error('UNAUTHORIZED_ADMIN_ACCESS');
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? '',
    },
    profile,
  };
}

/**
 * Utility to fetch current logged-in user profile server-side safely.
 */
export async function getCurrentUserProfile(): Promise<{
  user: { id: string; email: string } | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = data as Profile | null;

  return {
    user: { id: user.id, email: user.email ?? '' },
    profile,
  };
}
