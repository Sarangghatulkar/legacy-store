'use client';

import { useState, useEffect } from 'react';
import StoreLayout from '@/components/StoreLayout';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/lib/dataService';
import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    productService.getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const categories = [
    { label: 'ALL', filter: 'ALL' },
    { label: 'NEW LAUNCH', filter: 'NEW' },
    { label: 'AUTOMATIC', filter: 'AUTOMATIC' },
    { label: 'STEEL BRACELETS', filter: 'STEEL' },
    { label: 'LEATHER & GOLD', filter: 'LEATHER' },
    { label: 'COLLECTOR SETS', filter: 'SETS' },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'NEW') return p.badge === 'NEW' || p.is_new;
    if (activeCategory === 'AUTOMATIC') return p.tags?.includes('AUTOMATIC') || p.category_name?.toLowerCase().includes('auto');
    if (activeCategory === 'STEEL') return p.tags?.includes('STAINLESS STEEL') || p.tags?.includes('STEEL') || p.category_name?.toLowerCase().includes('steel');
    if (activeCategory === 'LEATHER') return p.tags?.includes('LEATHER') || p.tags?.includes('CALFSKIN') || p.category_name?.toLowerCase().includes('leather');
    if (activeCategory === 'SETS') return p.tags?.includes('COLLECTOR SET') || p.tags?.includes('DUO') || p.category_name?.toLowerCase().includes('set');
    return true;
  });

  return (
    <StoreLayout>
      {/* 1. CINEMATIC FULL-SCREEN WATCH HERO BANNER */}
      <section className="relative w-full min-h-[85vh] sm:min-h-[92vh] flex items-center bg-black overflow-hidden select-none">
        {/* Hero Background Image: Watch on Dark Slate with Light Rays */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/legacy/watches/watch-tourbillon.jpg"
            alt="Legacy Luxury Tourbillon Watch"
            fill
            priority
            className="object-cover object-center sm:object-right opacity-90 scale-100"
          />
          {/* High-contrast gradient overlay for readable typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent sm:via-black/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/25" />
        </div>

        {/* Hero Typography & CTA */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
          <div className="max-w-xl">
            {/* Horological Heritage Badge */}
            <div className="inline-flex items-center space-x-2 border border-white/20 bg-white/5 backdrop-blur-md px-3 py-1 rounded-xs mb-4">
              <span className="text-[10px] font-mono tracking-[0.25em] text-neutral-300 uppercase">
                MECHANICAL HOROLOGY
              </span>
            </div>

            {/* Sub-headline */}
            <p className="text-neutral-300 text-lg sm:text-2xl font-light tracking-wide font-sans">
              The essence of
            </p>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-medium text-white tracking-tight leading-[1.08] mt-1">
              Precision <br className="hidden sm:inline" />
              Craftsmanship
            </h1>

            {/* Launch Tagline */}
            <p className="text-xs sm:text-sm font-sans tracking-[0.25em] text-neutral-400 uppercase mt-4 mb-8">
              TOURBILLON &amp; ASTRUM SERIES
            </p>

            {/* White CTA Button */}
            <div>
              <a
                href="#collection"
                className="inline-block px-7 sm:px-9 py-3.5 sm:py-4 bg-white text-black hover:bg-neutral-200 transition-colors font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.2em] rounded-xs shadow-xl"
              >
                EXPLORE NEW LAUNCH
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "SHOP THE COLLECTION" SECTION (Matching SARKAR Grid Layout) */}
      <section id="collection" className="py-16 sm:py-24 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.22em] text-black uppercase font-sans">
              SHOP THE COLLECTION
            </h2>

            {/* Minimal Category Tabs */}
            <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mt-6">
              {categories.map((cat) => (
                <button
                  key={cat.filter}
                  onClick={() => setActiveCategory(cat.filter)}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] transition-all rounded-xs font-sans ${
                    activeCategory === cat.filter
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4-Column Hairline Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square bg-white animate-pulse p-6" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. EDITORIAL LIFESTYLE SECTION (Gentleman Wearing Black Watch on Wrist) */}
      <section className="bg-neutral-950 text-white overflow-hidden border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Column */}
            <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-square rounded-xs overflow-hidden border border-neutral-800 shadow-2xl">
              <Image
                src="/images/legacy/watches/watch-lifestyle.jpg"
                alt="Gentleman Wearing Legacy Apex Timepiece"
                fill
                className="object-cover object-center"
              />
            </div>

            {/* Editorial Philosophy Column */}
            <div className="lg:col-span-6 space-y-6 lg:pl-6">
              <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-neutral-400 block">
                THE PHILOSOPHY
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-[0.16em] text-white font-sans leading-tight">
                ARCHITECTURAL <br />
                PRECISION HOROLOGY
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
                Legacy timepieces are engineered as commanding statements of presence. Forged from cold-hardened 316L surgical stainless steel and capped with double-domed anti-scratch sapphire crystal, every movement is regulated for ruthless accuracy.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-neutral-800">
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider font-sans">Sapphire Glass</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">Scratch-proof diamond-grade crystal with blue anti-glare undercoating.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider font-sans">316L Steel</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">Surgical solid steel with satin brushed and mirror-beveled links.</p>
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider font-sans">100M Water Guard</h4>
                  <p className="text-[11px] text-neutral-400 mt-1">Gasketed screw-down crown and caseback for active endurance.</p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/products"
                  className="inline-flex items-center space-x-3 px-8 py-4 bg-white text-black hover:bg-neutral-200 transition-colors font-sans text-xs font-bold uppercase tracking-[0.2em] rounded-xs"
                >
                  <span>EXPLORE ALL TIMEPIECES</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE HOROLOGICAL TRIO BANNER */}
      <section className="py-20 sm:py-24 bg-[#fafafa] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-neutral-500 block">
                THE ICONIC TRILOGY
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-[0.2em] font-sans mt-2">
                COLLECTOR SETS &amp; DUOS
              </h2>
            </div>
            <Link
              href="/products?category=collector-sets-and-duos"
              className="mt-4 sm:mt-0 text-xs font-bold tracking-[0.2em] uppercase text-black hover:opacity-60 flex items-center space-x-1"
            >
              <span>VIEW ALL SETS</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200">
            {products
              .filter((p) => p.tags?.includes('COLLECTOR SET') || p.tags?.includes('DUO') || p.category_name?.toLowerCase().includes('duo'))
              .slice(0, 4)
              .map((product) => (
                <div key={product.id} className="bg-white">
                  <ProductCard product={product} />
                </div>
              ))}
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}
