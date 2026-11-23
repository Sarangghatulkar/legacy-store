'use client';

import { useState } from 'react';
import {
  TicketPercent,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  Tag,
  AlertCircle,
  X,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  max_uses: number;
  times_used: number;
  expires_at: string;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 'cpn-1',
      code: 'LEGACY10',
      description: '10% welcome discount on first luxury timepiece order',
      type: 'percentage',
      value: 10,
      min_order_amount: 2999,
      max_uses: 500,
      times_used: 142,
      expires_at: '2026-12-31',
      is_active: true,
    },
    {
      id: 'cpn-2',
      code: 'ROYALTY500',
      description: 'Flat ₹500 privileged savings on Collector Sets',
      type: 'fixed',
      value: 500,
      min_order_amount: 4999,
      max_uses: 200,
      times_used: 68,
      expires_at: '2026-12-15',
      is_active: true,
    },
    {
      id: 'cpn-3',
      code: 'HOROLOGY15',
      description: '15% exclusive VIP black-tie promotion',
      type: 'percentage',
      value: 15,
      min_order_amount: 7999,
      max_uses: 100,
      times_used: 34,
      expires_at: '2026-11-30',
      is_active: true,
    },
    {
      id: 'cpn-4',
      code: 'SUMMER2026',
      description: 'Early summer seasonal clearance',
      type: 'percentage',
      value: 20,
      min_order_amount: 3999,
      max_uses: 50,
      times_used: 50,
      expires_at: '2026-08-31',
      is_active: false,
    },
  ]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    min_order_amount: '2999',
    max_uses: '100',
    expires_at: '2026-12-31',
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Copied coupon code ${code}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = !c.is_active;
          toast.success(`Coupon ${c.code} is now ${next ? 'ACTIVE' : 'PAUSED'}`);
          return { ...c, is_active: next };
        }
        return c;
      })
    );
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Revoke promotional code ${code}?`)) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Coupon ${code} revoked`);
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast.error('Code and discount value are required');
      return;
    }

    const newCoupon: Coupon = {
      id: 'cpn-' + Date.now(),
      code: formData.code.toUpperCase().replace(/\s+/g, ''),
      description: formData.description || 'Promotional coupon',
      type: formData.type,
      value: Number(formData.value),
      min_order_amount: Number(formData.min_order_amount) || 0,
      max_uses: Number(formData.max_uses) || 100,
      times_used: 0,
      expires_at: formData.expires_at,
      is_active: true,
    };

    setCoupons([newCoupon, ...coupons]);
    setIsModalOpen(false);
    toast.success(`Promo code ${newCoupon.code} generated successfully`);
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      min_order_amount: '2999',
      max_uses: '100',
      expires_at: '2026-12-31',
    });
  };

  const activeCount = coupons.filter((c) => c.is_active).length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + c.times_used, 0);

  const filtered = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-400 block mb-1">
            CAMPAIGNS &amp; REVENUE DRIVERS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em] text-white font-sans">
            PROMO CODES &amp; DISCOUNTS
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Issue client discount codes, flash sale incentives, and VIP collector vouchers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-sm flex items-center space-x-1.5 self-start sm:self-auto font-sans"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>CREATE PROMO CODE</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#0e1117] border border-neutral-800 rounded-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Active Campaigns
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{activeCount}</div>
          <span className="text-[10px] text-neutral-500 block mt-1">
            {coupons.length} total codes configured
          </span>
        </div>

        <div className="p-5 bg-[#0e1117] border border-neutral-800 rounded-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Total Redemptions
          </span>
          <div className="text-2xl font-bold font-mono text-white">{totalRedemptions}</div>
          <span className="text-[10px] text-neutral-500 block mt-1">Orders discounted at checkout</span>
        </div>

        <div className="p-5 bg-[#0e1117] border border-neutral-800 rounded-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Checkout Integration
          </span>
          <div className="text-2xl font-bold font-mono text-purple-400">ACTIVE</div>
          <span className="text-[10px] text-neutral-500 block mt-1">Live Razorpay price deduction</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search promo codes or descriptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#12151b] border border-neutral-800 text-xs text-white placeholder-neutral-500 rounded-xs focus:outline-hidden focus:border-white transition-colors"
        />
      </div>

      {/* Coupons Table */}
      <div className="bg-[#0e1117] border border-neutral-800 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#12151b] text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Min Spend</th>
                <th className="py-3 px-4">Usage / Cap</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 text-xs">
              {filtered.map((coupon) => {
                const isCopied = copiedId === coupon.id;
                const isExpired = new Date(coupon.expires_at) < new Date();

                return (
                  <tr key={coupon.id} className="hover:bg-[#141820] transition-colors">
                    {/* Code & Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-black tracking-wider text-white bg-white/5 px-2.5 py-1 rounded-2xs border border-white/10">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(coupon.id, coupon.code)}
                          className="p-1 text-neutral-400 hover:text-white transition-colors"
                          title="Copy Code"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-neutral-400 block mt-1">
                        {coupon.description}
                      </span>
                    </td>

                    {/* Discount Value */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                    </td>

                    {/* Min Spend */}
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      {formatINR(coupon.min_order_amount)}
                    </td>

                    {/* Usage / Cap */}
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      <span className="font-bold text-white">{coupon.times_used}</span> / {coupon.max_uses}
                      <div className="w-24 h-1 bg-neutral-800 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (coupon.times_used / coupon.max_uses) * 100)}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* Expiry */}
                    <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                      {coupon.expires_at}
                      {isExpired && (
                        <span className="text-rose-400 block text-[9px] uppercase font-bold">
                          Expired
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(coupon.id)}
                        className={`px-2.5 py-0.5 rounded-2xs text-[10px] font-mono uppercase font-bold tracking-wider transition-colors ${
                          coupon.is_active && !isExpired
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                        }`}
                      >
                        {coupon.is_active && !isExpired ? 'ACTIVE' : 'PAUSED'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                        title="Delete Promo Code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Promo Code Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1117] border border-neutral-800 rounded-xs max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                Create Promotional Code
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                  Promo Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LUXURY20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono uppercase rounded-xs focus:outline-hidden focus:border-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP 20% discount on orders above ₹4,999"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white rounded-xs focus:outline-hidden focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })
                    }
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white rounded-xs focus:outline-hidden focus:border-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder={formData.type === 'percentage' ? '15' : '500'}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono rounded-xs focus:outline-hidden focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono rounded-xs focus:outline-hidden focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono rounded-xs focus:outline-hidden focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 uppercase font-mono text-[10px] mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="w-full px-3 py-2 bg-[#12151b] border border-neutral-800 text-white font-mono rounded-xs focus:outline-hidden focus:border-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-700 hover:border-white text-neutral-300 rounded-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider rounded-xs hover:bg-neutral-200 transition-colors"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
