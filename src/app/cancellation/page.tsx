'use client';

import StoreLayout from '@/components/StoreLayout';
import Link from 'next/link';
import { XCircle, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function CancellationPage() {
  return (
    <StoreLayout>
      <div className="bg-white min-h-screen text-neutral-900 font-sans">
        {/* Header Hero */}
        <section className="bg-neutral-950 text-white py-16 sm:py-24 border-b border-neutral-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-3">
              CLIENT ORDER MANAGEMENT
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-[0.18em] font-sans">
              CANCELLATION POLICY
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-4 max-w-xl mx-auto leading-relaxed">
              Clear, transparent cancellation guidelines for your timepiece orders prior to dispatch and transit.
            </p>
            <span className="text-[11px] font-mono text-neutral-500 block mt-4">
              Pre-Dispatch Immediate Cancellation &bull; 100% Refund Guarantee &bull; Concierge Assistance
            </span>
          </div>
        </section>

        {/* Content Body */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-10">
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              1. Cancellation Prior to Consignment Dispatch
            </h2>
            <p>
              You can cancel your order at any time before it has been handed over to our courier partners for dispatch.
            </p>
            <p className="mt-2">
              To cancel, simply log in to your <Link href="/account" className="text-black font-semibold underline">Client Account</Link> or send a WhatsApp / Email message to our concierge with your Order ID.
            </p>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xs mt-3 text-emerald-900 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span><strong>100% Instant Refund:</strong> For pre-dispatch cancellations, 100% of your payment is refunded immediately without any cancellation fee or deduction.</span>
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              2. Cancellation After Consignment Has Been Dispatched
            </h2>
            <p>
              Once your timepiece has been dispatched from our Mumbai fulfillment center and an AWB tracking number has been generated, it is actively in express air transit and cannot be cancelled mid-route.
            </p>
            <p className="mt-2">
              In this scenario, you may either:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-neutral-600">
              <li>Refuse delivery when the courier partner arrives at your address. The consignment will be safely returned to us, and your full refund processed upon receipt.</li>
              <li>Accept the parcel, inspect the watch, and initiate a return within 7 calendar days under our <Link href="/refund" className="text-black underline font-semibold">Refund &amp; Return Policy</Link>.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              3. Cancellation by LEGACY
            </h2>
            <p>
              Under exceptional circumstances, LEGACY reserves the right to cancel an order due to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-neutral-600">
              <li>Unforeseen manufacturing stock shortages or limited-edition serial allocation depletion.</li>
              <li>Inability to verify client delivery address or unserviceable pincode.</li>
              <li>Suspected fraudulent transaction flags raised by the payment gateway security firewall.</li>
            </ul>
            <p className="mt-2">
              In any such event, our team will notify you immediately via phone/email, and a <strong>100% complete refund</strong> will be remitted to your source bank account within 24 to 48 hours.
            </p>
          </div>

          <div className="p-6 bg-neutral-100 rounded-xs border border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-black uppercase tracking-wider text-xs">
                Need to Cancel or Modify an Order?
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Reach our concierge desk immediately via WhatsApp or Email for instant assistance.
              </p>
            </div>
            <a
              href="https://wa.me/919820112345?text=Hello%20LEGACY%20Concierge,%20I%20wish%20to%20cancel%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-black text-white text-xs font-mono uppercase tracking-wider rounded-xs hover:bg-neutral-800 transition-colors shrink-0 flex items-center space-x-1.5"
            >
              <span>WhatsApp Concierge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}
