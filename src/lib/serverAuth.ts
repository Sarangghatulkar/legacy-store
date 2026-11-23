import { NextResponse } from 'next/server';
import { getServiceSupabase, isSupabaseConfigured } from './supabase';

export interface AdminAuthResult {
  authorized: boolean;
  user?: any;
  error?: string;
  status?: number;
}

/**
 * Server-side admin verification utility.
 * Validates the caller is an authenticated user with 'admin' role in public.profiles.
 */
export async function verifyAdminRequest(request: Request): Promise<AdminAuthResult> {
  if (!isSupabaseConfigured()) {
    // Development / unconfigured fallback
    return { authorized: true, user: { id: 'dev-admin', email: 'admin@dev.local' } };
  }

  // 1. Extract bearer token or cookie
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');

  if (!token) {
    // Check cookies for Supabase token
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/sb-[a-zA-Z0-9_-]+-auth-token=([^;]+)/);
    if (tokenMatch && tokenMatch[1]) {
      try {
        const decoded = decodeURIComponent(tokenMatch[1]);
        const parsed = JSON.parse(decoded);
        token = parsed?.[0] || parsed?.access_token || parsed;
      } catch {
        token = tokenMatch[1];
      }
    }
  }

  if (!token) {
    return { authorized: false, error: 'Unauthorized: Missing session token', status: 401 };
  }

  try {
    const supabase = getServiceSupabase();

    // 2. Validate token with Supabase Auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return { authorized: false, error: 'Unauthorized: Invalid session token', status: 401 };
    }

    // 3. Verify user has role='admin' in public.profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return { authorized: false, error: 'Forbidden: Admin privilege required', status: 403 };
    }

    return { authorized: true, user };
  } catch (err: any) {
    console.error('Admin verification error:', err);
    return { authorized: false, error: 'Internal authorization error', status: 500 };
  }
}
