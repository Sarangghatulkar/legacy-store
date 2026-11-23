'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StoreLayout from '@/components/StoreLayout';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') || 'ORD-VERIFIED';

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
        Payment Verified via Razorpay
      </span>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
        Thank You for Your Order!
      </h1>

      <p className="mt-3 text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
        Your payment has been processed successfully. We have dispatched a confirmation email and SMS with invoice details.
      </p>

      <div className="mt-8 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-left max-w-md mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs text-slate-500">Order Reference</span>
          <span className="text-sm font-bold text-slate-900 font-mono">{orderId}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-slate-100">
          <span className="text-xs text-slate-500">Payment Status</span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
            Paid (Razorpay)
          </span>
        </div>
        <div className="flex items-center justify-between pt-3">
          <span className="text-xs text-slate-500">Expected Delivery</span>
          <span className="text-xs font-semibold text-slate-800">2-4 Business Days</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-100"
        >
          <Package className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>View in Admin Orders</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <StoreLayout>
      <Suspense fallback={<div className="text-center py-24 text-slate-500">Loading order details...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </StoreLayout>
  );
}

