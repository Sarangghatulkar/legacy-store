'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StoreLayout from '@/components/StoreLayout';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setLoading(true);

    try {
      if (!configured) {
        toast.success('Signed in successfully (Demo Mode)');
        router.push(redirectTo);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please verify your details or sign up.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data?.user) {
        toast.success('Welcome back to Legacy');
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-neutral-400 block mb-2">
            PRIVATE CLIENT PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.18em] text-black font-sans">
            SIGN IN
          </h1>
          <p className="mt-2 text-xs text-neutral-500 font-sans tracking-wide leading-relaxed">
            Access your horology orders, warranty certificates, and private drop privileges.
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-neutral-200 p-8 sm:p-10 shadow-xs bg-white rounded-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black font-sans mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xs text-xs font-sans placeholder-neutral-400 focus:outline-none focus:border-black text-black bg-neutral-50"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black font-sans">
                  PASSWORD
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-black font-sans transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xs text-xs font-sans placeholder-neutral-400 focus:outline-none focus:border-black text-black bg-neutral-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white hover:bg-neutral-800 transition-colors font-sans text-xs font-bold uppercase tracking-[0.2em] rounded-xs shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Create Account Divider & Link */}
          <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
            <p className="text-xs text-neutral-600 font-sans">
              Don&apos;t have a client account?{' '}
              <Link
                href={`/signup${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="font-black uppercase tracking-wider text-black underline underline-offset-4 hover:opacity-70 transition-opacity"
              >
                CREATE ONE HERE
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
          <span>256-BIT ENCRYPTED SUPABASE AUTHENTICATION</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <StoreLayout>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center text-xs uppercase tracking-widest text-neutral-400">
            Loading Portal...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </StoreLayout>
  );
}
