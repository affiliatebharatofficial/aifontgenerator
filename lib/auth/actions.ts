'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export async function sanitizeRedirectUrl(url: string | null | undefined): Promise<string> {
  if (!url || typeof url !== 'string') return '/dashboard';
  const trimmed = url.trim();
  // Reject absolute URLs, protocol-relative URLs, or invalid characters
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.includes(':')) {
    return '/dashboard';
  }
  return trimmed;
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rawRedirect = (formData.get('redirectTo') as string) || '/dashboard';
  const safeRedirect = await sanitizeRedirectUrl(rawRedirect);

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect(safeRedirect);
}

import { getSiteSetting } from '@/lib/admin/settings-service';

export async function signupAction(formData: FormData): Promise<AuthActionResult> {
  const regEnabled = await getSiteSetting<boolean>('registration_enabled', true);
  if (!regEnabled) {
    return { success: false, error: 'User registration is currently disabled by administrator.' };
  }

  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
      },
    },
  });

  if (error) {
    if (error.message.includes('Database error saving new user') || error.message.includes('Database error')) {
      return {
        success: false,
        error:
          'Database tables not initialized. Please run the SQL migration scripts in your Supabase Dashboard SQL Editor (see supabase/migrations/20260812000000_init_schema.sql).',
      };
    }
    return { success: false, error: error.message };
  }

  // Double-check profile insertion in case triggers aren't configured on the database yet
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        email: data.user.email ?? email,
        full_name: fullName || '',
        role: 'user',
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      console.error('Error creating user profile:', profileError.message);
    }
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function updateProfileAction(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized.' };
  }

  const fullName = formData.get('fullName') as string;
  const avatarUrl = formData.get('avatarUrl') as string;

  const { error } = await (supabase.from('profiles') as unknown as {
    update: (data: { full_name?: string; avatar_url?: string | null; updated_at?: string }) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  })
    .update({
      full_name: fullName,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/profile');
  return { success: true };
}
