'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Database,
  Users,
  TicketPercent,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Bell,
  Search,
  Menu,
  X,
  Clock,
  Sparkles
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const effectiveEmail = user?.email || 'sarangghatulkar.work@gmail.com';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const configured = isSupabaseConfigured();

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  // Do not show the admin sidebar or console shell on the admin login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Executive Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Timepieces & Stock', href: '/admin/products', icon: Package },
    { label: 'Orders & Logistics', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Client Dossiers (CRM)', href: '/admin/customers', icon: Users },
    { label: 'Promo & Coupons', href: '/admin/coupons', icon: TicketPercent },
    { label: 'Financial Analytics', href: '/admin/analytics', icon: TrendingUp },
    { label: 'Supabase & API Vault', href: '/admin/settings', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#090b0e] text-neutral-100 flex flex-col md:flex-row antialiased font-sans">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12151b',
            color: '#ffffff',
            border: '1px solid #262b36',
            borderRadius: '4px',
            fontSize: '12px',
          },
        }}
      />

      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden bg-[#0e1117] border-b border-neutral-800 px-4 py-3 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-xs bg-white text-black flex items-center justify-center font-black text-xs tracking-widest font-sans shadow-md">
            L
          </div>
          <div>
            <div className="font-black text-xs tracking-[0.2em] uppercase text-white font-sans">
              LEGACY
            </div>
            <span className="text-[9px] text-neutral-400 font-mono">MERCHANT CONSOLE</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/"
            target="_blank"
            className="p-1.5 text-neutral-400 hover:text-white"
            title="View Store"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-neutral-300 hover:text-white focus:outline-hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile Overlay Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 bg-[#0e1117] border-r border-neutral-800/80 p-5 flex flex-col justify-between shrink-0 transform transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-800 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xs bg-white text-black flex items-center justify-center font-black text-sm tracking-widest font-sans shadow-md">
                L
              </div>
              <div>
                <div className="font-black text-sm tracking-[0.2em] uppercase text-white font-sans">
                  LEGACY
                </div>
                <span className="text-[10px] text-neutral-400 font-mono tracking-wider block">
                  MERCHANT CONSOLE
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* System Status Pill */}
          <div className="mb-6 p-2.5 rounded-xs bg-[#141820] border border-neutral-800 text-[11px] font-mono flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-neutral-300">Supabase Cloud</span>
            </div>
            <span className="text-emerald-400 font-bold text-[10px]">CONNECTED</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 px-3 py-1.5 block">
              CONSOLE MODULES
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xs text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-white text-black shadow-sm font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-neutral-800 space-y-3">
          {/* Storefront Jump */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xs text-xs text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
          >
            <span className="font-medium">Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Admin User Profile */}
          <div className="p-2.5 rounded-xs bg-[#141820] border border-neutral-800/80">
            <div className="flex items-center justify-between">
              <div className="truncate mr-2">
                <span className="text-[11px] font-bold text-white block truncate">
                  {profile?.full_name || 'Root Administrator'}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono truncate block">
                  {effectiveEmail}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Header Bar */}
        <header className="h-16 bg-[#0e1117] border-b border-neutral-800/80 px-6 sm:px-8 hidden md:flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              PORTAL: <strong className="text-white">HAUTE HORLOGERIE PRODUCTION</strong>
            </span>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-neutral-400">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>{currentTime}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Live Preview Button */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xs text-[11px] font-bold uppercase tracking-wider bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              <span>View Store</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* Gateway Status Badge */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-widest font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Razorpay Active</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#090b0e]">
          {children}
        </main>
      </div>
    </div>
  );
}
