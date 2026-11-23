'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StoreLayout from '@/components/StoreLayout';
import { useAuth } from '@/lib/authContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatINR } from '@/lib/utils';
import { User, Package, LogOut, Clock, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface OrderRecord {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address?: any;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/account');
      return;
    }

    async function loadOrders() {
      if (!user || !configured) {
        setLoadingOrders(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data && !error) {
          setOrders(data);
        }
      } catch {
        // Table may not be created yet in unmigrated database
      } finally {
        setLoadingOrders(false);
      }
    }

    loadOrders();
  }, [user, authLoading, configured, router]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    router.push('/');
  };

  if (authLoading) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-400">
            AUTHENTICATING PRIVATE CLIENT VAULT...
          </p>
        </div>
      </StoreLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <StoreLayout>
      <div className="bg-white min-h-[80vh] border-b border-neutral-200">
        {/* Account Header */}
        <div className="border-b border-neutral-200 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-neutral-400 block mb-1">
                PRIVATE CLIENT ACCOUNT
              </span>
              <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-[0.16em] text-black font-sans">
                {profile?.full_name || user.email?.split('@')[0] || 'Client'}
              </h1>
              <p className="text-xs text-neutral-500 font-mono mt-1">
                {user.email}
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center space-x-2 px-6 py-3 border border-neutral-300 hover:border-black text-black text-xs font-bold uppercase tracking-[0.18em] rounded-xs transition-colors self-start sm:self-auto font-sans"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 4 Cols: Client Profile & Concierge */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <div className="border border-neutral-200 p-6 rounded-xs bg-[#fafafa]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black font-sans mb-4 pb-2 border-b border-neutral-200 flex items-center justify-between">
                  <span>CLIENT DOSSIER</span>
                  <User className="w-4 h-4 text-neutral-500" />
                </h3>
                <div className="space-y-3 text-xs font-sans">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-mono uppercase block">Full Name</span>
                    <span className="font-bold text-black">{profile?.full_name || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-mono uppercase block">Email Address</span>
                    <span className="font-bold text-black">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-mono uppercase block">Direct Phone</span>
                    <span className="font-bold text-black font-mono">{profile?.phone || 'Not added'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 font-mono uppercase block">Client Status</span>
                    <span className="inline-block bg-black text-white text-[9px] font-mono px-2 py-0.5 rounded-2xs mt-1">
                      VERIFIED CLIENT
                    </span>
                  </div>
                </div>
              </div>

              {/* Warranty & Concierge Card */}
              <div className="border border-neutral-200 p-6 rounded-xs bg-black text-white">
                <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 block mb-2">
                  CONCIERGE &amp; SERVICES
                </span>
                <h4 className="text-sm font-bold uppercase tracking-wider font-sans">
                  2-Year International Warranty
                </h4>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-sans">
                  All timepieces registered under this account are covered by our Swiss/Japanese calibration warranty with complimentary door-to-door servicing.
                </p>
                <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <a
                    href="mailto:support@legacy.store"
                    className="text-white hover:underline uppercase tracking-wider font-bold"
                  >
                    Contact Concierge →
                  </a>
                </div>
              </div>
            </div>

            {/* Right 8 Cols: Order History & Consignments */}
            <div className="lg:col-span-8">
              <div className="border border-neutral-200 p-6 sm:p-8 rounded-xs bg-white">
                <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black font-sans">
                      ORDER HISTORY &amp; CONSIGNMENTS
                    </h3>
                    <p className="text-xs text-neutral-500 font-sans mt-0.5">
                      Insured shipments, payment verification, and dispatch timelines.
                    </p>
                  </div>
                  <Package className="w-5 h-5 text-neutral-400" />
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center text-xs text-neutral-400 font-mono uppercase tracking-widest animate-pulse">
                    Retrieving orders from vault...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center">
                    <Clock className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                    <h4 className="text-xs font-bold uppercase tracking-widest text-black font-sans">
                      No Orders Placed Yet
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto font-sans">
                      Your registered timepieces and order consignments will appear here once placed.
                    </p>
                    <Link
                      href="/products"
                      className="mt-6 inline-flex items-center space-x-2 px-7 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xs hover:bg-neutral-800 transition-colors"
                    >
                      <span>EXPLORE COLLECTION</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200 mt-4">
                    {orders.map((ord) => (
                      <div key={ord.id} className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-black uppercase">
                              #{ord.id.slice(0, 8)}
                            </span>
                            <span className="bg-neutral-100 text-neutral-800 text-[10px] font-mono px-2 py-0.5 rounded-2xs uppercase">
                              {ord.status}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-2xs uppercase ${
                              ord.payment_status === 'paid' ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-700'
                            }`}>
                              {ord.payment_status}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400 font-mono block">
                            {new Date(ord.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="font-mono text-sm font-bold text-black">
                            {formatINR(ord.total_amount)}
                          </span>
                          <Link
                            href={`/order-success?order_id=${ord.id}`}
                            className="p-2 border border-neutral-300 hover:border-black rounded-xs transition-colors"
                            aria-label="View Order"
                          >
                            <ChevronRight className="w-4 h-4 text-black" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
