'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StoreLayout from '@/components/StoreLayout';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/lib/dataService';
import { CATEGORIES } from '@/lib/initialData';
import { Product } from '@/types';
import { Search, SlidersHorizontal, Filter } from 'lucide-react';

function ProductsCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'shop-all';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  useEffect(() => {
    productService.getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filtered = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'shop-all' ||
      selectedCategory === 'all' ||
      (selectedCategory === 'new-launch' && (p.badge === 'NEW' || p.is_new)) ||
      (selectedCategory === 'automatic-watches' && (p.tags?.includes('AUTOMATIC') || p.category_name?.toLowerCase().includes('auto'))) ||
      (selectedCategory === 'steel-bracelets' && (p.tags?.includes('STAINLESS STEEL') || p.tags?.includes('STEEL') || p.category_name?.toLowerCase().includes('steel'))) ||
      (selectedCategory === 'leather-and-gold' && (p.tags?.includes('LEATHER') || p.tags?.includes('CALFSKIN') || p.tags?.includes('ROSE GOLD'))) ||
      (selectedCategory === 'collector-sets-and-duos' && (p.tags?.includes('COLLECTOR SET') || p.tags?.includes('DUO') || p.category_name?.toLowerCase().includes('set')));

    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      (p.fragrance_notes && p.fragrance_notes.toLowerCase().includes(search.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return b.is_featured ? 1 : -1;
  });

  return (
    <div className="bg-white min-h-screen">
      {/* Editorial Header */}
      <div className="border-b border-neutral-200 py-12 sm:py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-neutral-400 block mb-2">
            THE ARCHITECTURE OF SCENT
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-[0.2em] text-black font-sans">
            ALL COLLECTIONS
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto font-sans leading-relaxed">
            Formulated in Grasse with 30% Extrait de Parfum concentration. Sculptural chess pieces engineered for commanding elegance.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between pb-8 border-b border-neutral-200">
          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] whitespace-nowrap transition-all rounded-xs font-sans ${
                  selectedCategory === cat.slug
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-black hover:bg-neutral-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center space-x-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="SEARCH NOTES, BOTTLES..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xs text-[11px] font-sans uppercase tracking-wider focus:outline-none focus:border-black text-black placeholder-neutral-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-50 border border-neutral-200 rounded-xs px-3 py-2 text-[11px] font-sans uppercase tracking-wider text-black focus:outline-none focus:border-black"
              >
                <option value="featured">FEATURED</option>
                <option value="price-asc">PRICE: LOW TO HIGH</option>
                <option value="price-desc">PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hairline Products Grid */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-6">
            <span>SHOWING {sorted.length} FRAGRANCE TALISMANS</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="aspect-square bg-white animate-pulse p-6" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 border border-neutral-200">
              <Filter className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-black">
                No matching fragrances found
              </h3>
              <p className="text-xs text-neutral-500 mt-1">Try resetting your filters or search keywords.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('shop-all');
                }}
                className="mt-4 px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xs hover:bg-neutral-800"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200">
              {sorted.map((product) => (
                <div key={product.id} className="bg-white">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <StoreLayout>
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs uppercase tracking-widest text-neutral-400">
            Loading Fragrance Catalog...
          </div>
        }
      >
        <ProductsCatalogContent />
      </Suspense>
    </StoreLayout>
  );
}
