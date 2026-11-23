'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StoreLayout from '@/components/StoreLayout';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Eye, EyeOff, ArrowRight, ShieldCheck, User, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreed) {
      toast.error('Please accept the Terms & Conditions');
      return;
    }

    setLoading(true);

    try {
      if (!configured) {
        toast.success('Account created successfully (Demo Mode)');
        router.push(redirectTo);
        return;
      }

      // 1. Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            role: 'customer',
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data?.user) {
        // Attempt to upsert into public.profiles if table exists
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email.trim(),
            full_name: fullName.trim(),
            phone: phone.trim() || null,
            role: 'customer',
            created_at: new Date().toISOString(),
          });
        } catch {
          // Table might not be migrated yet; auth metadata preserves details
        }

        if (data.session) {
          toast.success('Welcome to Legacy! Your client account is active.');
          router.push(redirectTo);
          router.refresh();
        } else {
          // Email confirmation is required by Supabase settings
          toast.success(
            'Account created! If confirmation is enabled, please verify your email before signing in.',
            { duration: 6000 }
          );
          router.push(`/login?email=${encodeURIComponent(email)}`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-neutral-400 block mb-2">
            PRIVATE CLIENT PRIVILEGE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.18em] text-black font-sans">
            CREATE ACCOUNT
          </h1>
          <p className="mt-2 text-xs text-neutral-500 font-sans tracking-wide leading-relaxed">
            Register to unlock insured tracking, collector allocations, and 2-year warranty records.
          </p>
        </div>

        {/* Form Card */}
        <div className="border border-neutral-200 p-8 sm:p-10 shadow-xs bg-white rounded-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black font-sans mb-1.5">
                FULL NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rathore"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xs text-xs font-sans placeholder-neutral-400 focus:outline-none focus:border-black text-black bg-neutral-50"
                />
                <User className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black font-sans mb-1.5">
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

            {/* Phone Number (Optional) */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black font-sans mb-1.5">
                PHONE NUMBER <span className="text-neutral-400 font-normal">(FOR DISPATCH UPDATES)</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xs text-xs font-sans placeholder-neutral-400 focus:outline-none focus:border-black text-black bg-neutral-50 font-mono"
                />
                <Phone className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black font-sans mb-1.5">
                PASSWORD <span className="text-neutral-400 font-normal">(MIN. 6 CHARACTERS)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xs text-xs font-sans placeholder-neutral-400 focus:outline-none focus:border-black text-black bg-neutral-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black font-sans mb-1.5">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xs text-xs font-sans placeholder-neutral-400 focus:outline-none focus:border-black text-black bg-neutral-50"
                />
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded-2xs border-neutral-300 text-black focus:ring-black accent-black"
              />
              <label htmlFor="terms" className="text-[11px] text-neutral-600 font-sans leading-tight">
                I agree to the{' '}
                <Link href="/terms" className="underline text-black">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline text-black">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white hover:bg-neutral-800 transition-colors font-sans text-xs font-bold uppercase tracking-[0.2em] rounded-xs shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
            >
              {loading ? (
                <span>REGISTERING ACCOUNT...</span>
              ) : (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Already have an account */}
          <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
            <p className="text-xs text-neutral-600 font-sans">
              Already have an account?{' '}
              <Link
                href={`/login${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                className="font-black uppercase tracking-wider text-black underline underline-offset-4 hover:opacity-70 transition-opacity"
              >
                SIGN IN HERE
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
          <span>CONFIDENTIAL CLIENT DATA ENCRYPTION</span>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <StoreLayout>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center text-xs uppercase tracking-widest text-neutral-400">
            Loading Portal...
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </StoreLayout>
  );
}
