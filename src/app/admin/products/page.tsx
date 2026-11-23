'use client';

import { useState, useEffect } from 'react';
import { productService } from '@/lib/dataService';
import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { CATEGORIES } from '@/lib/initialData';
import {
  Plus,
  Trash2,
  Package,
  Search,
  X,
  ExternalLink,
  Edit2,
  Check,
  AlertTriangle,
  ArrowUpDown,
  Download,
  Filter,
  Copy,
  Sparkles,
  RefreshCw,
  Eye,
  Star
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Form State for Adding / Editing
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_name: 'Automatic Watches',
    price: '',
    compare_price: '',
    stock: '25',
    specs: '41mm Case · Automatic Calibre · Sapphire Glass · 50M',
    badge: 'NEW',
    tags: 'AUTOMATIC, 41MM, SAPPHIRE',
    tagline: 'Ruthless mechanical precision on your wrist.',
    occasion: 'BOARDROOM · BLACK TIE · EXECUTIVE',
    description: 'Precision-crafted luxury timepiece forged from surgical 316L stainless steel.',
    imageUrl: '/images/legacy/watches/watch-tourbillon.jpg',
    is_featured: true,
    is_trending: true,
  });

  const loadProducts = (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    productService.getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    let ignore = false;
    productService.getProducts().then((data) => {
      if (!ignore) {
        setProducts(data);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Database seeded with 8 luxury timepieces!');
        loadProducts();
      } else {
        toast.error(json.error || 'Seeding failed');
      }
    } catch {
      toast.error('Network error during seeding');
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      slug: '',
      category_name: 'Automatic Watches',
      price: '',
      compare_price: '',
      stock: '25',
      specs: '41mm Case · Automatic Calibre · Sapphire Glass · 50M',
      badge: 'NEW',
      tags: 'AUTOMATIC, 41MM, SAPPHIRE',
      tagline: 'Ruthless mechanical precision on your wrist.',
      occasion: 'BOARDROOM · BLACK TIE · EXECUTIVE',
      description: 'Precision-crafted luxury timepiece forged from surgical 316L stainless steel.',
      imageUrl: '/images/legacy/watches/watch-tourbillon.jpg',
      is_featured: true,
      is_trending: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      slug: p.slug,
      category_name: p.category_name || 'Automatic Watches',
      price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : '',
      stock: String(p.stock),
      specs: p.specs || p.fragrance_notes || '',
      badge: p.badge || '',
      tags: p.tags ? p.tags.join(', ') : '',
      tagline: p.tagline || '',
      occasion: p.occasion || '',
      description: p.description,
      imageUrl: p.images[0] || '/images/legacy/watches/watch-tourbillon.jpg',
      is_featured: p.is_featured ?? true,
      is_trending: p.is_trending ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDuplicateProduct = (p: Product) => {
    setEditingProduct(null);
    setFormData({
      title: `${p.title} (Variant)`,
      slug: `${p.slug}-variant-${Date.now().toString().slice(-4)}`,
      category_name: p.category_name || 'Automatic Watches',
      price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : '',
      stock: '25',
      specs: p.specs || p.fragrance_notes || '',
      badge: 'NEW EDITION',
      tags: p.tags ? p.tags.join(', ') : '',
      tagline: p.tagline || '',
      occasion: p.occasion || '',
      description: p.description,
      imageUrl: p.images[0] || '/images/legacy/watches/watch-tourbillon.jpg',
      is_featured: false,
      is_trending: true,
    });
    setIsModalOpen(true);
    toast('Duplicating timepiece into editor');
  };

  const handleInlineStockChange = async (id: string, delta: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const newStock = Math.max(0, product.stock + delta);
    await productService.updateStock(id, newStock);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );
    toast.success(`Updated ${product.title.split(' ')[1] || 'Watch'} stock to ${newStock}`);
  };

  const handleToggleFeatured = async (p: Product) => {
    const nextFeatured = !p.is_featured;
    await productService.updateProduct(p.id, { is_featured: nextFeatured });
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, is_featured: nextFeatured } : item))
    );
    toast.success(`Marked ${p.title} as ${nextFeatured ? 'FEATURED' : 'STANDARD'}`);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Archive or remove "${title}" from the active catalog?`)) {
      await productService.deleteProduct(id);
      toast.success('Timepiece removed from catalog');
      loadProducts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      toast.error('Title and price are required');
      return;
    }

    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const parsedTags = formData.tags.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);

    const payload = {
      title: formData.title,
      slug,
      description: formData.description || 'Masterpiece horological instrument.',
      price: Number(formData.price),
      compare_price: formData.compare_price ? Number(formData.compare_price) : undefined,
      category_name: formData.category_name,
      stock: Number(formData.stock) || 0,
      images: [formData.imageUrl],
      badge: formData.badge || undefined,
      specs: formData.specs,
      fragrance_notes: formData.specs,
      tags: parsedTags,
      tagline: formData.tagline,
      occasion: formData.occasion,
      is_featured: formData.is_featured,
      is_trending: formData.is_trending,
      is_archived: false,
      rating: 4.9,
      reviews_count: 120,
    };

    if (editingProduct) {
      await productService.updateProduct(editingProduct.id, payload);
      toast.success('Timepiece specifications updated');
    } else {
      await productService.addProduct(payload);
      toast.success('New timepiece published to catalog');
    }

    setIsModalOpen(false);
    loadProducts();
  };

  const handleExportCSV = () => {
    const headers = 'ID,Title,Slug,Category,Price,ComparePrice,Stock,Badge,Specs\n';
    const rows = products.map(
      (p) =>
        `"${p.id}","${p.title}","${p.slug}","${p.category_name || ''}",${p.price},${p.compare_price || ''},${p.stock},"${p.badge || ''}","${p.specs || ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacy_inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('Exported inventory CSV');
  };

  // Filter products
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.specs && p.specs.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      p.category_name?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStock =
      stockFilter === 'ALL' ||
      (stockFilter === 'LOW' && p.stock <= 20 && p.stock > 0) ||
      (stockFilter === 'OUT' && p.stock === 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-400 block mb-1">
            CATALOG &amp; PRODUCTION CONTROL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em] text-white font-sans">
            TIMEPIECES &amp; INVENTORY
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Direct database sync with surgical horology specifications, instant inline stock adjustment, and pricing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="px-3 py-2 border border-purple-500/30 hover:border-purple-400 bg-purple-500/10 text-purple-300 text-xs font-mono rounded-xs transition-colors flex items-center space-x-1.5"
            title="Seed 8 Luxury Timepieces into Supabase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{seeding ? 'SEEDING...' : 'SEED SUPABASE'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 border border-neutral-700 hover:border-white text-xs font-mono text-neutral-300 hover:text-white rounded-xs transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-sm flex items-center space-x-1.5 font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW TIMEPIECE</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search timepiece name, calibre, or specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#12151b] border border-neutral-800 text-xs text-white placeholder-neutral-500 rounded-xs focus:outline-hidden focus:border-white transition-colors font-sans"
          />
        </div>

        {/* Category & Stock Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#12151b] border border-neutral-800 text-xs text-neutral-200 rounded-xs font-mono focus:outline-hidden"
          >
            <option value="ALL">All Categories ({products.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter Pills */}
          <button
            onClick={() => setStockFilter('ALL')}
            className={`px-3 py-1.5 text-[11px] font-mono uppercase rounded-xs transition-colors ${
              stockFilter === 'ALL'
                ? 'bg-white text-black font-bold'
                : 'bg-[#12151b] text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStockFilter('LOW')}
            className={`px-3 py-1.5 text-[11px] font-mono uppercase rounded-xs transition-colors ${
              stockFilter === 'LOW'
                ? 'bg-amber-400 text-black font-bold'
                : 'bg-[#12151b] text-neutral-400 hover:text-amber-400 border border-neutral-800'
            }`}
          >
            Low Stock (&le;20)
          </button>
          <button
            onClick={() => setStockFilter('OUT')}
            className={`px-3 py-1.5 text-[11px] font-mono uppercase rounded-xs transition-colors ${
              stockFilter === 'OUT'
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-[#12151b] text-neutral-400 hover:text-rose-400 border border-neutral-800'
            }`}
          >
            Sold Out (0)
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#0e1117] border border-neutral-800 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#12151b] text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Timepiece</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Instant Stock Control</th>
                <th className="py-3 px-4">Status &amp; Flag</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-mono">
                    Loading timepieces catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-mono">
                    <p className="mb-3">No timepieces match your criteria.</p>
                    <button
                      onClick={handleSeedDatabase}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold rounded-xs transition-colors"
                    >
                      Seed 8 Luxury Timepieces into Supabase
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const isLow = product.stock <= 20 && product.stock > 0;
                  const isOut = product.stock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-[#141820] transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="relative w-12 h-14 bg-neutral-900 border border-neutral-800 shrink-0 overflow-hidden rounded-xs">
                            <Image
                              src={product.images[0] || '/images/legacy/watches/watch-tourbillon.jpg'}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white block">{product.title}</span>
                              {product.badge && (
                                <span className="px-1.5 py-0.5 rounded-2xs bg-white text-black text-[9px] font-mono font-black uppercase tracking-wider">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono block mt-0.5 truncate max-w-[280px]">
                              {product.specs || product.fragrance_notes || 'Haute Horlogerie Spec'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-mono text-neutral-300">
                        {product.category_name || 'Automatic'}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-white block">
                          {formatINR(product.price)}
                        </span>
                        {product.compare_price && (
                          <span className="text-[10px] text-neutral-500 line-through block">
                            {formatINR(product.compare_price)}
                          </span>
                        )}
                      </td>

                      {/* Fast Inline Stock Adjustment */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 font-mono">
                          <button
                            onClick={() => handleInlineStockChange(product.id, -5)}
                            className="w-6 h-6 rounded-xs bg-[#12151b] hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] flex items-center justify-center transition-colors"
                            title="-5 Units"
                          >
                            -5
                          </button>
                          <button
                            onClick={() => handleInlineStockChange(product.id, -1)}
                            className="w-6 h-6 rounded-xs bg-[#12151b] hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs flex items-center justify-center transition-colors"
                            title="-1 Unit"
                          >
                            -1
                          </button>
                          <span
                            className={`min-w-[48px] text-center font-bold px-1.5 py-0.5 rounded-2xs text-xs ${
                              isOut
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : isLow
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'text-white'
                            }`}
                          >
                            {product.stock}
                          </span>
                          <button
                            onClick={() => handleInlineStockChange(product.id, 1)}
                            className="w-6 h-6 rounded-xs bg-[#12151b] hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs flex items-center justify-center transition-colors"
                            title="+1 Unit"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleInlineStockChange(product.id, 5)}
                            className="w-6 h-6 rounded-xs bg-[#12151b] hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] flex items-center justify-center transition-colors"
                            title="+5 Units"
                          >
                            +5
                          </button>
                        </div>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className={`px-2 py-0.5 rounded-2xs text-[10px] font-mono uppercase font-semibold transition-colors flex items-center space-x-1 ${
                            product.is_featured
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                          }`}
                          title="Toggle Hero / Featured Status"
                        >
                          <Star className={`w-2.5 h-2.5 ${product.is_featured ? 'fill-amber-400' : ''}`} />
                          <span>{product.is_featured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                            title="View on Live Store"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDuplicateProduct(product)}
                            className="p-1.5 text-neutral-400 hover:text-purple-400 transition-colors"
                            title="Duplicate Watch"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                            title="Edit Specifications"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.title)}
                            className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                            title="Remove from Catalog"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Timepiece Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1117] border border-neutral-800 rounded-xs max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  {editingProduct ? 'Edit Timepiece Specifications' : 'Publish New Timepiece'}
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">
                  Surgical 316L steel, movement caliber, and pricing metadata.
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Timepiece Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LEGACY CHRONO STEALTH (41MM)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white rounded-xs focus:outline-hidden focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. chrono-stealth-41mm"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono rounded-xs focus:outline-hidden focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white rounded-xs focus:outline-hidden focus:border-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Selling Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="4999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono rounded-xs focus:outline-hidden focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Original Strike Price (INR)
                  </label>
                  <input
                    type="number"
                    placeholder="7999"
                    value={formData.compare_price}
                    onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono rounded-xs focus:outline-hidden focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Units in Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono rounded-xs focus:outline-hidden focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Badge Flag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BESTSELLER / NEW / LIMITED"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono uppercase rounded-xs focus:outline-hidden focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Featured Hero Toggle
                  </label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="feat"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded-xs border-neutral-700 bg-neutral-900"
                    />
                    <label htmlFor="feat" className="text-white cursor-pointer text-xs">
                      Feature on Homepage
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                  Horological Specifications (Case Size · Calibre · Crystal · Water Resistance)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 41mm Case · Automatic Miyota · Sapphire Glass · 50M"
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white rounded-xs focus:outline-hidden focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                  Image Asset Path or Web URL
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="/images/legacy/watches/watch-tourbillon.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono rounded-xs focus:outline-hidden focus:border-white"
                  />
                  <div className="relative w-10 h-10 bg-neutral-900 border border-neutral-800 shrink-0 rounded-xs overflow-hidden">
                    <Image
                      src={formData.imageUrl || '/images/legacy/watches/watch-tourbillon.jpg'}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                  Editorial Story &amp; Craftsmanship Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Masterpiece horological instrument engineered for collectors..."
                  className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white rounded-xs focus:outline-hidden focus:border-white"
                />
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-700 hover:border-white text-neutral-300 rounded-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-200 transition-colors shadow-sm"
                >
                  {editingProduct ? 'Save Specifications' : 'Publish Timepiece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
