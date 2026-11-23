import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const normalizeUrl = (url: string) => {
  if (!url) return '';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
};

const rawCleanUrl = normalizeUrl(rawUrl);

export const isSupabaseConfigured = () => {
  return (
    (rawCleanUrl.startsWith('http://') || rawCleanUrl.startsWith('https://')) &&
    Boolean(rawAnon) &&
    rawAnon !== 'your_supabase_anon_key' &&
    rawAnon !== 'placeholder-anon-key'
  );
};

const safeUrl = (rawCleanUrl.startsWith('http://') || rawCleanUrl.startsWith('https://'))
  ? rawCleanUrl
  : 'https://placeholder-project.supabase.co';

const safeAnon = rawAnon && rawAnon !== 'your_supabase_anon_key'
  ? rawAnon
  : 'placeholder-anon-key';

// Client-side / public Supabase client (respects RLS and writes auth cookies for Next.js SSR / Middleware)
export const supabase =
  typeof window !== 'undefined'
    ? createBrowserClient(safeUrl, safeAnon)
    : createClient(safeUrl, safeAnon, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

// Server-side privileged client (bypasses RLS for secure server workflows)
// MUST only be called from server environments (API routes, server actions)
export const getServiceSupabase = () => {
  if (typeof window !== 'undefined') {
    throw new Error('FATAL: getServiceSupabase cannot be invoked on the client side.');
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey === 'your_supabase_service_role_key') {
    // Return fallback client for demo / non-configured environments
    return createClient(safeUrl, 'placeholder-service-key');
  }

  return createClient(safeUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
