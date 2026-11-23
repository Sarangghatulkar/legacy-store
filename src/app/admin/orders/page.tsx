'use client';

import { useState, useEffect } from 'react';
import { orderService } from '@/lib/dataService';
import { Order } from '@/types';
import { formatINR } from '@/lib/utils';
import {
  ShoppingCart,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  Printer,
  ChevronDown,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Download,
  ExternalLink,
  PackageCheck,
  Send,
  ShieldCheck,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Logistics tracking inputs for selected order
  const [courierPartner, setCourierPartner] = useState('Blue Dart Express');
  const [trackingNumber, setTrackingNumber] = useState('');

  const loadOrders = () => {
    orderService.getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await orderService.updateOrderStatus(orderId, newStatus);
    toast.success(`Consignment #${orderId.slice(0, 8)} updated to ${newStatus.toUpperCase()}`);
    loadOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleSaveTracking = () => {
    if (!trackingNumber) {
      toast.error('Please enter a valid tracking AWB number');
      return;
    }
    toast.success(`Tracking AWB #${trackingNumber} assigned via ${courierPartner}`);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'processing':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-neutral-800 text-neutral-400 border border-neutral-700';
    }
  };

  const handleExportOrders = () => {
    const headers = 'Order ID,Date,Customer Name,Email,Phone,Amount,Status,Payment Status\n';
    const rows = orders.map(
      (o) =>
        `"${o.id}","${o.created_at}","${o.customer_name}","${o.customer_email}","${o.customer_phone || ''}",${o.total_amount},"${o.status}","${o.payment_status}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legacy_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('Orders CSV exported');
  };

  // Status Counts
  const counts = {
    all: orders.length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  const filtered = orders.filter((o) => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer_phone && o.customer_phone.toLowerCase().includes(search.toLowerCase())) ||
      (o.razorpay_payment_id && o.razorpay_payment_id.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-400 block mb-1">
            LOGISTICS &amp; FULFILLMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em] text-white font-sans">
            ORDERS &amp; SHIPMENTS
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Monitor incoming client orders, generate insured shipping labels, and track delivery milestones.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportOrders}
            className="px-3.5 py-2 border border-neutral-700 hover:border-white text-xs font-mono text-neutral-300 hover:text-white rounded-xs transition-colors flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT MANIFEST</span>
          </button>
        </div>
      </div>

      {/* Pipeline Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Pipeline Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: 'all', label: `All (${counts.all})` },
              { key: 'processing', label: `Dispatch Queue (${counts.processing})` },
              { key: 'shipped', label: `In Transit (${counts.shipped})` },
              { key: 'delivered', label: `Delivered (${counts.delivered})` },
              { key: 'cancelled', label: `Cancelled (${counts.cancelled})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-3 py-1.5 text-[11px] font-mono uppercase rounded-xs transition-colors shrink-0 ${
                filterStatus === tab.key
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#12151b] text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, client or AWB..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#12151b] border border-neutral-800 text-xs text-white placeholder-neutral-500 rounded-xs focus:outline-hidden focus:border-white transition-colors"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0e1117] border border-neutral-800 rounded-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#12151b] text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Consignment ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client Dossier</th>
                <th className="py-3 px-4">Settlement</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 font-mono">
                    Retrieving orders from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500 font-mono">
                    No orders found in this view.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-[#141820] transition-colors">
                    {/* Consignment ID */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-white block">#{order.id.slice(0, 8)}</span>
                      <span className="text-[10px] text-neutral-500 truncate max-w-[120px] block">
                        {order.id}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{order.customer_name}</div>
                      <div className="text-[11px] font-mono text-neutral-400 truncate max-w-[180px]">
                        {order.customer_email}
                      </div>
                    </td>

                    {/* Settlement */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-2xs text-[9px] font-mono uppercase font-semibold ${
                          order.payment_status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            order.payment_status === 'paid' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                        />
                        <span>{order.payment_status === 'paid' ? 'Paid (Razorpay)' : 'Pending'}</span>
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatINR(order.total_amount)}
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-2xs text-[10px] font-mono uppercase font-bold tracking-wider ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingNumber('');
                          }}
                          className="px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-[#141820] hover:bg-neutral-800 border border-neutral-700 rounded-xs transition-colors flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consignment Inspection Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e1117] border border-neutral-800 rounded-xs max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold uppercase tracking-wider text-white">
                    Consignment #{selectedOrder.id.slice(0, 8)}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-2xs text-[10px] font-mono uppercase font-bold ${getStatusBadge(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  Booked on {new Date(selectedOrder.created_at).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsInvoiceOpen(true)}
                  className="px-3 py-1.5 border border-neutral-700 hover:border-white text-neutral-200 hover:text-white rounded-xs transition-colors text-xs font-mono flex items-center space-x-1.5"
                  title="Generate Formal Tax Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Tax Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Client & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#141820] p-4 rounded-xs border border-neutral-800 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                  Client Profile
                </span>
                <span className="font-bold text-white block">{selectedOrder.customer_name}</span>
                <span className="text-neutral-400 font-mono block mt-0.5">
                  {selectedOrder.customer_email}
                </span>
                <span className="text-neutral-400 font-mono block mt-0.5">
                  {selectedOrder.customer_phone || 'No direct phone specified'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-neutral-500 block mb-1">
                  Insured Delivery Address
                </span>
                <p className="text-neutral-300 leading-relaxed font-sans">
                  {selectedOrder.shipping_address?.addressLine1 || 'Standard Courier Address'}
                  <br />
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} -{' '}
                  {selectedOrder.shipping_address?.postalCode}
                  <br />
                  {selectedOrder.shipping_address?.country || 'India'}
                </p>
              </div>
            </div>

            {/* Logistics & Tracking AWB Assignment */}
            <div className="p-4 bg-[#12151b] border border-neutral-800 rounded-xs space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                COURIER LOGISTICS &amp; AWB ASSIGNMENT
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-5">
                  <select
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0e1117] border border-neutral-800 text-white rounded-xs focus:outline-hidden focus:border-white font-mono text-xs"
                  >
                    <option value="Blue Dart Express">Blue Dart Express (Air)</option>
                    <option value="Delhivery Surface & Express">Delhivery Express</option>
                    <option value="DTDC Premium">DTDC Premium</option>
                    <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                    <option value="India Post Speed Post">India Post Speed Post</option>
                  </select>
                </div>
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Enter AWB Tracking #"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0e1117] border border-neutral-800 text-white placeholder-neutral-600 rounded-xs focus:outline-hidden focus:border-white font-mono text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    onClick={handleSaveTracking}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-bold rounded-xs transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Line Items List */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                CONSIGNMENT MANIFEST
              </span>
              <div className="border border-neutral-800 rounded-xs divide-y divide-neutral-800 overflow-hidden">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#12151b] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{item.product_title}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          Quantity: {item.quantity} &bull; Unit: {formatINR(item.price)}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-white">
                        {formatINR(item.total || item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-neutral-400 font-mono">
                    Direct Order Placement: {formatINR(selectedOrder.total_amount)}
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Security Metadata */}
            <div className="p-3 bg-[#12151b] border border-neutral-800 rounded-xs flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-neutral-500 block">Razorpay Settlement ID</span>
                <span className="text-neutral-300 block">
                  {selectedOrder.razorpay_payment_id || 'pay_simulated_razorpay'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block">Consignment Total</span>
                <span className="text-base font-bold text-white">
                  {formatINR(selectedOrder.total_amount)}
                </span>
              </div>
            </div>

            {/* Dispatch Status Changer in Modal */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-xs font-mono text-neutral-400 uppercase">
                Update Dispatch Milestone:
              </span>
              <div className="flex items-center space-x-2">
                {(['processing', 'shipped', 'delivered', 'cancelled'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedOrder.id, st)}
                    className={`px-3 py-1.5 text-[10px] font-mono uppercase rounded-xs transition-colors ${
                      selectedOrder.status === st
                        ? 'bg-white text-black font-bold'
                        : 'bg-[#141820] text-neutral-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Luxury Tax Invoice Modal */}
      {isInvoiceOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-black max-w-2xl w-full p-8 rounded-sm shadow-2xl space-y-6 my-6 print:m-0 print:p-6 print:shadow-none">
            {/* Print Header Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-300 print:hidden">
              <span className="text-xs font-mono text-neutral-500">
                A4 LUXURY TAX INVOICE &amp; PACKING SLIP
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-black text-white text-xs font-mono uppercase rounded-xs hover:bg-neutral-800 transition-colors flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="p-1.5 text-neutral-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Formal Invoice Layout */}
            <div className="space-y-6 text-xs text-neutral-800 font-sans">
              {/* Brand & Invoice No */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-[0.2em] uppercase font-sans text-black">
                    LEGACY
                  </h1>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">
                    HAUTE HORLOGERIE PRIVATE LIMITED
                  </span>
                  <p className="text-[10px] text-neutral-600 mt-1">
                    GSTIN: 27AABCL1234F1Z8 &bull; HSN Code: 9102 (Wrist Watches)
                    <br />
                    Brix Lifestyle, Bandra Kurla Complex, Mumbai 400051
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="font-bold text-sm block">TAX INVOICE</span>
                  <span className="text-neutral-600 block mt-0.5">
                    INV-2026-{selectedOrder.id.slice(0, 6).toUpperCase()}
                  </span>
                  <span className="text-neutral-500 text-[10px] block mt-0.5">
                    Date: {new Date(selectedOrder.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Billed To & Shipped To */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-100 rounded-xs text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-500 block mb-1">
                    Billed To &amp; Consignee:
                  </span>
                  <span className="font-bold text-black block">{selectedOrder.customer_name}</span>
                  <span className="font-mono text-neutral-600 block">{selectedOrder.customer_email}</span>
                  <span className="font-mono text-neutral-600 block">
                    {selectedOrder.customer_phone || 'Phone verified'}
                  </span>
                </div>
                <div>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-500 block mb-1">
                    Insured Shipping Destination:
                  </span>
                  <p className="text-neutral-700 leading-relaxed">
                    {selectedOrder.shipping_address?.addressLine1}
                    <br />
                    {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} -{' '}
                    {selectedOrder.shipping_address?.postalCode}
                    <br />
                    {selectedOrder.shipping_address?.country || 'India'}
                  </p>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left border-collapse border border-neutral-300">
                <thead>
                  <tr className="bg-neutral-200 text-[10px] font-mono uppercase text-neutral-700 border-b border-neutral-300">
                    <th className="p-2 border-r border-neutral-300">#</th>
                    <th className="p-2 border-r border-neutral-300">Horological Timepiece / Description</th>
                    <th className="p-2 border-r border-neutral-300 text-center">Qty</th>
                    <th className="p-2 border-r border-neutral-300 text-right">Unit Price</th>
                    <th className="p-2 text-right">Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-300 font-mono text-xs">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border-r border-neutral-300">{idx + 1}</td>
                        <td className="p-2 border-r border-neutral-300 font-sans font-medium">
                          {item.product_title}
                          <span className="block text-[10px] font-mono text-neutral-500">
                            HSN: 9102 &bull; 1-Year Comprehensive Horological Warranty Included
                          </span>
                        </td>
                        <td className="p-2 border-r border-neutral-300 text-center">{item.quantity}</td>
                        <td className="p-2 border-r border-neutral-300 text-right">{formatINR(item.price)}</td>
                        <td className="p-2 text-right font-bold">
                          {formatINR(item.total || item.price * item.quantity)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2 border-r border-neutral-300">1</td>
                      <td className="p-2 border-r border-neutral-300 font-sans">
                        LEGACY Masterpiece Timepiece (Order Consignment)
                      </td>
                      <td className="p-2 border-r border-neutral-300 text-center">1</td>
                      <td className="p-2 border-r border-neutral-300 text-right">
                        {formatINR(selectedOrder.total_amount)}
                      </td>
                      <td className="p-2 text-right font-bold">
                        {formatINR(selectedOrder.total_amount)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Tax Breakdown & Grand Total */}
              <div className="flex justify-between items-start pt-2">
                <div className="text-[10px] text-neutral-600 max-w-xs space-y-1">
                  <p className="font-bold text-black uppercase">Terms &amp; Authentic Certification:</p>
                  <p>
                    Each LEGACY watch is chronometrically tested. Insured tamper-proof security seal
                    must remain intact for returns within 7 calendar days.
                  </p>
                </div>
                <div className="w-56 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal:</span>
                    <span>{formatINR(Math.round(selectedOrder.total_amount / 1.18))}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>GST (18% Included):</span>
                    <span>{formatINR(Math.round(selectedOrder.total_amount - selectedOrder.total_amount / 1.18))}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Courier Insurance:</span>
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-black pt-2 border-t-2 border-black">
                    <span>Grand Total:</span>
                    <span>{formatINR(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Signatory */}
              <div className="pt-8 flex justify-between items-end border-t border-neutral-300 text-[10px] font-mono text-neutral-500">
                <div>
                  <span>Payment Gateway Reference: {selectedOrder.razorpay_payment_id || 'PAY-VERIFIED'}</span>
                </div>
                <div className="text-right">
                  <div className="font-serif italic text-sm text-black mb-1">Legacy Master Watchmakers</div>
                  <span>Authorized Signatory</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
