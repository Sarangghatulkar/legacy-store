'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Mail, ShieldCheck, ArrowRight, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('sarangghatulkar.work@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      if (!configured) {
        toast.success('Development Demo Mode: Entering Admin Studio');
        router.push('/admin');
        return;
      }

      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        toast.error(error?.message || 'Invalid administrator credentials');
        setLoading(false);
        return;
      }

      // 2. Verify admin role in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      const isRootAdmin = data.user.email === 'sarangghatulkar.work@gmail.com';
      const isAdminRole = profile?.role === 'admin';

      if (!isRootAdmin && !isAdminRole) {
        await supabase.auth.signOut();
        toast.error('Access Denied: This account is not an authorized administrator.');
        setLoading(false);
        return;
      }

      toast.success('Welcome back, Administrator');
      const searchParams = new URLSearchParams(window.location.search);
      const targetUrl = searchParams.get('redirectTo') || '/admin';

      // Perform a full page redirect so all browser session cookies are delivered to middleware
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 300);
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b0e] text-neutral-100 flex flex-col justify-center items-center p-4 sm:p-6 antialiased font-sans">
      <Toaster position="top-right" />

      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-xs bg-white text-black items-center justify-center font-black text-xl tracking-widest font-sans shadow-xl mb-4">
            L
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-1">
            HAUTE HORLOGERIE MERCHANTS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.18em] text-white font-sans">
            LEGACY CONSOLE
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Restricted root management, inventory control, and payment verification.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0e1117] border border-neutral-800 p-8 sm:p-10 rounded-xs shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                ADMINISTRATOR EMAIL
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@legacy.store"
                  className="w-full px-4 py-3 bg-[#141820] border border-neutral-700 rounded-xs text-xs font-sans text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
                <Mail className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                ROOT PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-[#141820] border border-neutral-700 rounded-xs text-xs font-sans text-white placeholder-neutral-500 focus:outline-none focus:border-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black hover:bg-neutral-200 transition-colors font-sans text-xs font-bold uppercase tracking-[0.2em] rounded-xs shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>VERIFYING PRIVILEGES...</span>
              ) : (
                <>
                  <span>ENTER MERCHANT CONSOLE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white transition-colors font-mono uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Storefront</span>
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-500 font-mono tracking-widest uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
          <span>RLS NON-RECURSIVE SERVER AUTHORIZATION ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
