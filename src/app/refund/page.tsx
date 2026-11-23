'use client';

import StoreLayout from '@/components/StoreLayout';
import Link from 'next/link';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function RefundPage() {
  return (
    <StoreLayout>
      <div className="bg-white min-h-screen text-neutral-900 font-sans">
        {/* Header Hero */}
        <section className="bg-neutral-950 text-white py-16 sm:py-24 border-b border-neutral-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-3">
              CLIENT PRIVILEGES &amp; ASSURANCE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-[0.18em] font-sans">
              REFUND &amp; RETURN POLICY
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-4 max-w-xl mx-auto leading-relaxed">
              We stand unreservedly behind the craftsmanship of every LEGACY horological instrument with a 7-day inspection privilege.
            </p>
            <span className="text-[11px] font-mono text-neutral-500 block mt-4">
              7-Day Return Window &bull; Free Insured Reverse Pickup &bull; 100% Direct Bank / UPI Refund
            </span>
          </div>
        </section>

        {/* Content Body */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-10">
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              1. 7-Day Inspection &amp; Return Window
            </h2>
            <p>
              We want you to appreciate the weight, balance, and mechanical beauty of your LEGACY timepiece in person. If you are not completely satisfied with your purchase, you may initiate a return within <strong>7 calendar days</strong> from the date of confirmed delivery.
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              2. Eligibility Criteria for Returns
            </h2>
            <p>
              To qualify for a full refund, the timepiece must be returned in its original, pristine condition:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xs space-y-1.5">
                <span className="font-bold text-black uppercase text-xs block text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Eligible for Full Refund</span>
                </span>
                <ul className="list-disc pl-4 text-xs text-neutral-600 space-y-1">
                  <li>Unworn watch with plastic dial &amp; caseback protective films intact.</li>
                  <li>Metal bracelet unadjusted (no links removed).</li>
                  <li>Complete collector wooden presentation box, cushion, and outer carton.</li>
                  <li>Warranty card with matching serial number and manual included.</li>
                </ul>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xs space-y-1.5">
                <span className="font-bold text-black uppercase text-xs block text-rose-700 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Not Eligible for Return</span>
                </span>
                <ul className="list-disc pl-4 text-xs text-neutral-600 space-y-1">
                  <li>Visible scratches, micro-abrasions, or marks on steel case/bezel.</li>
                  <li>Creased, bent, or stained leather straps.</li>
                  <li>Missing original accessories, warranty booklet, or watch roll.</li>
                  <li>Security seal deliberately removed or modified.</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              3. Damaged or Defective in Transit (48-Hour Protocol)
            </h2>
            <p>
              Every consignment leaves our facility under CCTV audit. In the unlikely event that your timepiece arrives damaged or with mechanical irregularities, notify us within <strong>48 hours</strong> of delivery with clear photographs or an unboxing video.
            </p>
            <p className="mt-2">
              Our concierge team will arrange an immediate priority replacement at zero additional cost, or issue a 100% instant refund based on your preference.
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              4. Reverse Courier Pickup Process
            </h2>
            <p>
              Returning your timepiece is effortless:
            </p>
            <ol className="list-decimal pl-5 mt-2 space-y-2 text-neutral-600">
              <li>Contact our concierge team via WhatsApp (+91 98201 12345) or email (<a href="mailto:support@legacy.store" className="text-black font-semibold underline">support@legacy.store</a>) with your Order ID.</li>
              <li>Our team will schedule a free, insured reverse pickup with Blue Dart Express directly from your residence.</li>
              <li>Hand over the securely packed watch box to the courier agent and collect the physical pickup receipt.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              5. Refund Timeline &amp; Settlement Method
            </h2>
            <p>
              Once your returned watch arrives at our workshop, our master watchmakers conduct a 24-hour verification inspection. Upon successful approval:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-neutral-600">
              <li><strong>Prepaid Orders (UPI / Cards / Net Banking):</strong> Refund is credited directly back to your original source account within <strong>5 to 7 business days</strong>.</li>
              <li><strong>PhonePe / GPay Payments:</strong> Usually reflected within 24 to 48 banking hours.</li>
              <li>A formal refund settlement voucher is automatically emailed with the bank UTR reference number.</li>
            </ul>
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}
