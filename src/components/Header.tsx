'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, ChevronDown, ChevronUp, User, LogOut } from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { useAuth } from '@/lib/authContext';
import toast from 'react-hot-toast';

const emptySubscribe = () => () => {};

export default function Header() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const totalItems = useCartStore((state) => state.totalItems());
  const openCart = useCartStore((state) => state.openCart);
  const { user, profile, signOut } = useAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timepiecesExpanded, setTimepiecesExpanded] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-black text-white text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase py-2.5 px-4 text-center select-none border-b border-neutral-900">
        NEW LAUNCH | THE TOURBILLON &amp; ASTRUM SERIES
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Hamburger Menu Icon */}
            <div className="flex items-center">
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 -ml-2 text-black hover:opacity-70 transition-opacity focus:outline-none"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6 stroke-[1.8]" />
              </button>
            </div>

            {/* Center: Brand Logo */}
            <div className="flex-1 flex justify-center items-center">
              <Link
                href="/"
                className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[0.22em] text-black font-sans uppercase select-none hover:opacity-90 transition-opacity"
              >
                LEGACY
              </Link>
            </div>

            {/* Right: Buy Now Button + Account + Cart Icon */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Account / Login Icon */}
              <Link
                href={mounted && user ? '/account' : '/login'}
                className="p-2 text-black hover:opacity-70 transition-opacity"
                aria-label={mounted && user ? 'My Client Account' : 'Client Sign In'}
              >
                <User className="w-5 h-5 stroke-[1.8]" />
              </Link>

              {/* Buy Now Button */}
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-all shadow-xs"
              >
                Buy Now
              </Link>

              {/* Shopping Cart Icon Trigger */}
              <button
                onClick={openCart}
                className="relative p-2 text-black hover:opacity-70 transition-opacity focus:outline-none"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-6 h-6 stroke-[1.8]" />
                {mounted && totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-black h-4 w-4 rounded-full flex items-center justify-center font-mono">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Hamburger Navigation Drawer (From Left) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-left duration-300">
              {/* Drawer Header with Close Button */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
                  <span className="text-xl font-black tracking-[0.2em] text-black uppercase font-sans">
                    LEGACY
                  </span>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 text-black hover:opacity-60 transition-opacity"
                    aria-label="Close Menu"
                  >
                    <X className="w-6 h-6 stroke-[1.8]" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="mt-8 space-y-6 text-sm font-bold uppercase tracking-[0.15em] text-neutral-900 font-sans">
                  <div>
                    <Link
                      href="/products"
                      onClick={() => setDrawerOpen(false)}
                      className="block hover:text-neutral-500 transition-colors"
                    >
                      SHOP ALL
                    </Link>
                  </div>

                  <div>
                    <Link
                      href="/products?category=new-launch"
                      onClick={() => setDrawerOpen(false)}
                      className="block hover:text-neutral-500 transition-colors"
                    >
                      NEW LAUNCH
                    </Link>
                  </div>

                  <div>
                    <Link
                      href="/products?category=automatic-watches"
                      onClick={() => setDrawerOpen(false)}
                      className="block hover:text-neutral-500 transition-colors"
                    >
                      AUTOMATIC WATCHES
                    </Link>
                  </div>

                  <div>
                    <Link
                      href="/products?category=steel-bracelets"
                      onClick={() => setDrawerOpen(false)}
                      className="block hover:text-neutral-500 transition-colors"
                    >
                      STEEL BRACELETS
                    </Link>
                  </div>

                  <div>
                    <Link
                      href="/products?category=collector-sets-and-duos"
                      onClick={() => setDrawerOpen(false)}
                      className="block hover:text-neutral-500 transition-colors"
                    >
                      COLLECTOR SETS
                    </Link>
                  </div>

                  {/* Timepieces Dropdown Accordion */}
                  <div>
                    <button
                      onClick={() => setTimepiecesExpanded(!timepiecesExpanded)}
                      className="w-full flex items-center justify-between text-left hover:text-neutral-500 transition-colors focus:outline-none"
                    >
                      <span>TIMEPIECES</span>
                      {timepiecesExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </button>

                    {timepiecesExpanded && (
                      <div className="mt-3 pl-4 space-y-3 text-xs tracking-widest text-neutral-600 font-semibold border-l border-neutral-200">
                        <Link
                          href="/products/tourbillon-open-heart"
                          onClick={() => setDrawerOpen(false)}
                          className="block hover:text-black transition-colors"
                        >
                          TOURBILLON (41MM)
                        </Link>
                        <Link
                          href="/products/astrum-chrono"
                          onClick={() => setDrawerOpen(false)}
                          className="block hover:text-black transition-colors"
                        >
                          ASTRUM (40MM)
                        </Link>
                        <Link
                          href="/products/noir-monolith"
                          onClick={() => setDrawerOpen(false)}
                          className="block hover:text-black transition-colors"
                        >
                          NOIR (40MM)
                        </Link>
                        <Link
                          href="/products/heritage-rose-gold"
                          onClick={() => setDrawerOpen(false)}
                          className="block hover:text-black transition-colors"
                        >
                          HERITAGE (40MM)
                        </Link>
                        <Link
                          href="/products/apex-automatic"
                          onClick={() => setDrawerOpen(false)}
                          className="block hover:text-black transition-colors"
                        >
                          APEX (42MM)
                        </Link>
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      href="/#philosophy"
                      onClick={() => setDrawerOpen(false)}
                      className="block hover:text-neutral-500 transition-colors"
                    >
                      KNOW LEGACY
                    </Link>
                  </div>

                  <div>
                    <Link
                      href="/contact"
                      onClick={() => setDrawerOpen(false)}
                      className="block hover:text-neutral-500 transition-colors"
                    >
                      CONCIERGE &amp; CONTACT
                    </Link>
                  </div>
                </nav>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-neutral-100 space-y-5">
                {mounted && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-sans text-neutral-500">
                      <span>CLIENT:</span>
                      <strong className="text-black uppercase truncate">
                        {profile?.full_name || user.email?.split('@')[0]}
                      </strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/account"
                        onClick={() => setDrawerOpen(false)}
                        className="py-2.5 px-2 bg-black text-white text-center text-xs font-bold tracking-wider uppercase rounded-xs hover:bg-neutral-800 transition-colors"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="py-2.5 px-2 border border-neutral-300 text-center text-xs font-bold tracking-wider uppercase text-neutral-800 hover:border-black rounded-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/account"
                        onClick={() => setDrawerOpen(false)}
                        className="py-2.5 px-2 border border-neutral-300 text-center text-xs font-bold tracking-wider uppercase text-neutral-900 hover:border-black rounded-xs transition-colors"
                      >
                        Track Order
                      </Link>
                      <Link
                        href="/login"
                        onClick={() => setDrawerOpen(false)}
                        className="py-2.5 px-2 bg-black text-white text-center text-xs font-bold tracking-wider uppercase rounded-xs hover:bg-neutral-800 transition-colors"
                      >
                        Client Login
                      </Link>
                    </div>
                    <div className="text-center">
                      <Link
                        href="/signup"
                        onClick={() => setDrawerOpen(false)}
                        className="text-[11px] text-neutral-500 hover:text-black font-sans uppercase tracking-wider underline"
                      >
                        New Client? Register Here
                      </Link>
                    </div>
                  </div>
                )}

                <div>
                  <span className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2">
                    Follow Legacy
                  </span>
                  <div className="flex items-center space-x-5 text-neutral-800">
                    <span className="cursor-pointer hover:text-black font-sans text-xs font-black">𝕏</span>
                    <span className="cursor-pointer hover:text-black font-serif text-sm font-bold">f</span>
                    <span className="cursor-pointer hover:text-black font-sans text-xs font-bold">IG</span>
                    <span className="cursor-pointer hover:text-black font-sans text-xs font-bold">YT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
