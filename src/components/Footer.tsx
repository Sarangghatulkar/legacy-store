'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Mail, MessageCircle, ArrowRight } from 'lucide-react';

export default function Footer() {
  const [readMoreOpen, setReadMoreOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-white text-black border-t border-neutral-200 mt-auto">
      {/* 1. Architectural Slate Timepiece Pedestal Banner */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] max-h-[380px] overflow-hidden bg-neutral-900">
        <Image
          src="/images/legacy/watches/watch-trio.jpg"
          alt="Legacy Sculptural Timepieces on Slate"
          fill
          className="object-cover object-center"
        />
      </div>

      {/* 2. Expandable READ MORE Brand Story Accordion */}
      <div className="border-b border-neutral-200">
        <button
          onClick={() => setReadMoreOpen(!readMoreOpen)}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between text-left group"
          aria-expanded={readMoreOpen}
        >
          <span className="text-xs sm:text-sm font-black tracking-[0.2em] uppercase font-sans text-black group-hover:opacity-70 transition-opacity">
            READ MORE
          </span>
          {readMoreOpen ? (
            <ChevronUp className="w-4 h-4 text-neutral-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-600" />
          )}
        </button>

        {readMoreOpen && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-neutral-700 text-xs sm:text-sm leading-relaxed space-y-4 font-sans animate-in fade-in duration-300">
            <p>
              <strong>LEGACY — The Architecture of Modern Horology.</strong> Born from a pursuit of ruthless mechanical precision and commanding aesthetics, Legacy reinvents contemporary luxury timekeeping. Each case is cold-forged from solid 316L surgical stainless steel, hand-beveled along satin-brushed flanks, and capped with double-domed anti-scratch sapphire crystal.
            </p>
            <p>
              Whether you wear the exposed open-heart mechanical rhythm of the Tourbillon, the deep sunburst shifts of the Astrum Blue, or the warmth of the 18K Rose Gold Heritage, every Legacy timepiece is engineered to stand the test of generations. Backed by 100M water resistance and a 2-Year International Warranty.
            </p>
          </div>
        )}
      </div>

      {/* 3. Main Brand Statement Headline */}
      <div className="py-12 sm:py-16 text-center border-b border-neutral-200">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.22em] text-black uppercase font-sans">
          THE ONE & ONLY
        </h2>
      </div>

      {/* 4. Newsletter & 4-Column Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Newsletter / Enter Email */}
          <div className="md:col-span-4 space-y-4">
            <form onSubmit={handleSubscribe} className="relative max-w-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL"
                className="w-full pb-3 border-b border-black text-xs sm:text-sm tracking-[0.2em] uppercase placeholder-neutral-500 bg-transparent focus:outline-none focus:border-black font-sans pr-10"
              />
              <button
                type="submit"
                aria-label="Subscribe to Newsletter"
                className="absolute right-0 bottom-3 text-black hover:opacity-60 transition-opacity"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-neutral-600 font-mono">
                ✓ Thank you. You are now on the Legacy horology private list.
              </p>
            )}
            <p className="text-[11px] text-neutral-500 font-sans tracking-wide leading-relaxed pt-2">
              Subscribe for private release invitations, limited edition serial drops, and private collector trunk show access.
            </p>
          </div>

          {/* Timepieces Column */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-4 font-sans border-b border-black pb-1 inline-block">
              TIMEPIECES
            </h4>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase text-neutral-700 font-sans">
              <li><Link href="/products/tourbillon-open-heart" className="hover:text-black transition-colors">TOURBILLON (41MM)</Link></li>
              <li><Link href="/products/astrum-chrono" className="hover:text-black transition-colors">ASTRUM (40MM)</Link></li>
              <li><Link href="/products/noir-monolith" className="hover:text-black transition-colors">NOIR (40MM)</Link></li>
              <li><Link href="/products/heritage-rose-gold" className="hover:text-black transition-colors">HERITAGE GOLD</Link></li>
              <li><Link href="/products/apex-automatic" className="hover:text-black transition-colors">APEX AUTOMATIC</Link></li>
              <li><Link href="/products/the-legacy-trilogy-set" className="hover:text-black transition-colors">THE TRILOGY SET</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-4 font-sans border-b border-black pb-1 inline-block">
              COMPANY
            </h4>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase text-neutral-700 font-sans">
              <li><Link href="/#philosophy" className="hover:text-black transition-colors">KNOW LEGACY</Link></li>
              <li><Link href="/blog" className="hover:text-black transition-colors">JOURNAL</Link></li>
              <li><Link href="/admin" className="hover:text-black transition-colors text-neutral-400">MERCHANT PORTAL</Link></li>
            </ul>
          </div>

          {/* Policy Column */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-4 font-sans border-b border-black pb-1 inline-block">
              POLICY
            </h4>
            <ul className="space-y-2.5 text-xs tracking-wider uppercase text-neutral-700 font-sans">
              <li><Link href="/privacy" className="hover:text-black transition-colors">PRIVACY POLICY</Link></li>
              <li><Link href="/terms" className="hover:text-black transition-colors">TERMS &amp; CONDITIONS</Link></li>
              <li><Link href="/shipping" className="hover:text-black transition-colors">ORDERS &amp; SHIPPING</Link></li>
              <li><Link href="/cancellation" className="hover:text-black transition-colors">CANCELLATION POLICY</Link></li>
              <li><Link href="/refund" className="hover:text-black transition-colors">REFUND POLICY</Link></li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-4 font-sans border-b border-black pb-1 inline-block">
              CONTACT US
            </h4>
            <ul className="space-y-3 text-xs tracking-wider uppercase text-neutral-800 font-sans">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-black transition-colors font-medium block"
                >
                  CONCIERGE DESK
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@legacy.store"
                  className="flex items-center space-x-2 hover:opacity-70 transition-opacity"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>SUPPORT@LEGACY.STORE</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919820112345"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:opacity-70 transition-opacity"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WHATSAPP CONCIERGE</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. Horizontal Social Links */}
      <div className="border-t border-b border-neutral-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto text-xs font-bold tracking-[0.25em] uppercase text-black">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
            INSTAGRAM
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
            YOUTUBE
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
            FACEBOOK
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity">
            X
          </a>
        </div>
      </div>

      {/* 6. Bottom Copyright Notice */}
      <div className="py-6 px-4 text-center">
        <p className="text-[11px] font-sans tracking-[0.18em] uppercase text-neutral-700">
          © 2026, ALL RIGHTS RESERVED BY LEGACY HOROLOGY PRIVATE LIMITED
        </p>
      </div>
    </footer>
  );
}
