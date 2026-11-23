'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  ShieldCheck,
  Star,
  ExternalLink,
  X,
  MessageSquare,
  DollarSign,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CustomerRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
  orders_count: number;
  total_spent: number;
  last_order_date: string | null;
  city: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'VIP' | 'REPEAT' | 'ADMIN'>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const loadCustomers = async (isRefresh = false) => {
    if (isRefresh) setLoading(true);
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.customers || []);
      } else {
        // Fallback demo data
        setCustomers([
          {
            id: 'c-1',
            full_name: 'Vikramaditya Rathore',
            email: 'vikram.rathore@example.com',
            phone: '+91 98201 12345',
            role: 'customer',
            created_at: '2026-10-12T10:00:00.000Z',
            orders_count: 2,
            total_spent: 13998,
            last_order_date: '2026-11-17T14:30:00.000Z',
            city: 'Mumbai',
          },
          {
            id: 'c-2',
            full_name: 'Aditya Singhania',
            email: 'aditya.singhania@example.com',
            phone: '+91 98110 54321',
            role: 'customer',
            created_at: '2026-10-20T14:20:00.000Z',
            orders_count: 1,
            total_spent: 8999,
            last_order_date: '2026-11-16T11:15:00.000Z',
            city: 'Gurugram',
          },
          {
            id: 'c-3',
            full_name: 'Rohan Mehra',
            email: 'rohan.mehra@example.com',
            phone: '+91 99000 88776',
            role: 'customer',
            created_at: '2026-11-01T08:15:00.000Z',
            orders_count: 1,
            total_spent: 3499,
            last_order_date: '2026-11-14T09:45:00.000Z',
            city: 'Bengaluru',
          },
          {
            id: 'c-4',
            full_name: 'Sarang Ghatulkar',
            email: 'sarangghatulkar.work@gmail.com',
            phone: '+91 98765 43210',
            role: 'admin',
            created_at: '2026-09-01T00:00:00.000Z',
            orders_count: 0,
            total_spent: 0,
            last_order_date: null,
            city: 'Pune',
          },
        ]);
      }
    } catch {
      toast.error('Failed to load live client list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    fetch('/api/admin/customers')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!ignore && json?.customers) {
          setCustomers(json.customers);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const totalClients = customers.length;
  const vipClients = customers.filter((c) => c.total_spent >= 10000).length;
  const repeatClients = customers.filter((c) => c.orders_count > 1).length;
  const totalLTV = customers.reduce((sum, c) => sum + c.total_spent, 0);
  const avgLTV = totalClients > 0 ? Math.round(totalLTV / totalClients) : 0;

  const handleExportCSV = () => {
    const headers = 'Client ID,Name,Email,Phone,Role,City,Orders Count,Total Spent,Created At\n';
    const rows = customers.map(
      (c) =>
        `"${c.id}","${c.full_name}","${c.email}","${c.phone}","${c.role}","${c.city}",${c.orders_count},${c.total_spent},"${c.created_at}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacy_clients_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('Client directory exported to CSV');
  };

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());

    const matchesTier =
      tierFilter === 'ALL' ||
      (tierFilter === 'VIP' && c.total_spent >= 10000) ||
      (tierFilter === 'REPEAT' && c.orders_count > 1) ||
      (tierFilter === 'ADMIN' && c.role === 'admin');

    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-400 block mb-1">
            CLIENT RELATIONS &amp; CRM
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em] text-white font-sans">
            CLIENT DOSSIERS
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Maintain high-touch luxury client relationships, order frequency, and lifetime spend.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-neutral-700 hover:border-white text-xs font-mono text-neutral-300 hover:text-white rounded-xs transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0e1117] border border-neutral-800 rounded-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Registered Clients
          </span>
          <div className="text-2xl font-bold font-mono text-white">{totalClients}</div>
          <span className="text-[10px] text-neutral-500 block mt-1">Supabase Auth Profiles</span>
        </div>

        <div className="p-5 bg-[#0e1117] border border-neutral-800 rounded-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            VIP Spenders (&gt; ₹10k)
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">{vipClients}</div>
          <span className="text-[10px] text-neutral-500 block mt-1">Private Horology Collectors</span>
        </div>

        <div className="p-5 bg-[#0e1117] border border-neutral-800 rounded-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Repeat Collectors
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">{repeatClients}</div>
          <span className="text-[10px] text-neutral-500 block mt-1">Multiple consignments placed</span>
        </div>

        <div className="p-5 bg-[#0e1117] border border-neutral-800 rounded-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
            Average Client LTV
          </span>
          <div className="text-2xl font-bold font-mono text-purple-400">{formatINR(avgLTV)}</div>
          <span className="text-[10px] text-neutral-500 block mt-1">Lifetime Merchandise Value</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#12151b] border border-neutral-800 text-xs text-white placeholder-neutral-500 rounded-xs focus:outline-hidden focus:border-white transition-colors"
          />
        </div>

        {/* Tier Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'VIP', 'REPEAT', 'ADMIN'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 text-[11px] font-mono uppercase rounded-xs transition-colors shrink-0 ${
                tierFilter === tier
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#12151b] text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {tier === 'ALL'
                ? 'All Clients'
                : tier === 'VIP'
                ? 'VIP (>₹10k)'
                : tier === 'REPEAT'
                ? 'Repeat (2+)'
                : 'Admins'}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-[#0e1117] border border-neutral-800 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#12151b] text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Client Dossier</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Consignments</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Last Consignment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 font-mono">
                    Loading client dossiers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 font-mono">
                    No client records match your search query.
                  </td>
                </tr>
              ) : (
                filtered.map((client) => {
                  const isVip = client.total_spent >= 10000;
                  const cleanPhone = client.phone.replace(/[^0-9]/g, '');

                  return (
                    <tr key={client.id} className="hover:bg-[#141820] transition-colors">
                      {/* Name & City */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                            {client.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white block">{client.full_name}</span>
                              {isVip && (
                                <span className="px-1.5 py-0.5 rounded-2xs bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-mono font-bold flex items-center space-x-1">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                                  <span>VIP</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 block mt-0.5">
                              {client.city}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-neutral-300">{client.email}</div>
                        <div className="text-neutral-400 text-[10px] mt-0.5">{client.phone}</div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-2xs text-[10px] font-mono uppercase font-semibold ${
                            client.role === 'admin'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          {client.role}
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 font-mono text-neutral-200">
                        <span className="font-bold text-white">{client.orders_count}</span>{' '}
                        <span className="text-neutral-400 text-[10px]">orders</span>
                      </td>

                      {/* Lifetime Spend */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {formatINR(client.total_spent)}
                      </td>

                      {/* Last Order Date */}
                      <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                        {client.last_order_date
                          ? new Date(client.last_order_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-neutral-400 hover:text-emerald-400 border border-neutral-800 hover:border-emerald-500/30 rounded-xs transition-colors"
                              title="WhatsApp Concierge"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(client.email);
                              toast.success(`Copied ${client.email}`);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded-xs transition-colors"
                            title="Copy Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedCustomer(client)}
                            className="px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-[#141820] hover:bg-neutral-800 border border-neutral-700 rounded-xs transition-colors"
                          >
                            Dossier
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

      {/* Customer Detail Dossier Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1117] border border-neutral-800 rounded-xs max-w-lg w-full p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white text-black font-black text-sm flex items-center justify-center">
                  {selectedCustomer.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedCustomer.full_name}</h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Client ID: {selectedCustomer.id.slice(0, 12)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Stats Ribbon */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#141820] border border-neutral-800 rounded-xs text-xs font-mono">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">Lifetime Value</span>
                <span className="text-base font-bold text-white block mt-0.5">
                  {formatINR(selectedCustomer.total_spent)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">Total Orders</span>
                <span className="text-base font-bold text-white block mt-0.5">
                  {selectedCustomer.orders_count} Consignments
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#12151b] border border-neutral-800 rounded-xs">
                <div className="flex items-center space-x-2 text-neutral-400">
                  <Mail className="w-4 h-4" />
                  <span>Email:</span>
                </div>
                <span className="font-mono text-white">{selectedCustomer.email}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#12151b] border border-neutral-800 rounded-xs">
                <div className="flex items-center space-x-2 text-neutral-400">
                  <Phone className="w-4 h-4" />
                  <span>Phone:</span>
                </div>
                <span className="font-mono text-white">{selectedCustomer.phone}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#12151b] border border-neutral-800 rounded-xs">
                <div className="flex items-center space-x-2 text-neutral-400">
                  <MapPin className="w-4 h-4" />
                  <span>Registered Region:</span>
                </div>
                <span className="text-white">{selectedCustomer.city || 'India'}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#12151b] border border-neutral-800 rounded-xs">
                <div className="flex items-center space-x-2 text-neutral-400">
                  <Calendar className="w-4 h-4" />
                  <span>Client Since:</span>
                </div>
                <span className="font-mono text-white">
                  {new Date(selectedCustomer.created_at).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-200 rounded-xs transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
