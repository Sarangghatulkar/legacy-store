'use client';

import { useState } from 'react';
import Link from 'next/link';
import StoreLayout from '@/components/StoreLayout';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Mail, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      if (!configured) {
        setSubmitted(true);
        toast.success('Password reset link sent (Demo Mode)');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setSubmitted(true);
      toast.success('Password recovery email dispatched');
    } catch (err: any) {
      toast.error(err.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-neutral-400 block mb-2">
              SECURITY &amp; ACCESS RECOVERY
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.18em] text-black font-sans">
              RESET PASSWORD
            </h1>
            <p className="mt-2 text-xs text-neutral-500 font-sans tracking-wide leading-relaxed">
              Enter your registered client email to receive secure password recovery instructions.
            </p>
          </div>

          <div className="border border-neutral-200 p-8 sm:p-10 shadow-xs bg-white rounded-xs">
            {submitted ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-black">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-black font-sans">
                  CHECK YOUR INBOX
                </h3>
                <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                  We have dispatched recovery instructions to <strong>{email}</strong>. Follow the link in the email to set a new password.
                </p>
                <div className="pt-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-black underline underline-offset-4"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Sign In</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-black font-sans mb-2">
                    REGISTERED EMAIL
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black text-white hover:bg-neutral-800 transition-colors font-sans text-xs font-bold uppercase tracking-[0.2em] rounded-xs shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>DISPATCHING LINK...</span>
                  ) : (
                    <>
                      <span>SEND RECOVERY LINK</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-4 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-black font-sans"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </form>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
            <span>PROTECTED BY SUPABASE SECURITY</span>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
