'use client';

import StoreLayout from '@/components/StoreLayout';
import Link from 'next/link';
import { Truck, ShieldCheck, Clock, MapPin, Package, CheckCircle2 } from 'lucide-react';

export default function ShippingPage() {
  return (
    <StoreLayout>
      <div className="bg-white min-h-screen text-neutral-900 font-sans">
        {/* Header Hero */}
        <section className="bg-neutral-950 text-white py-16 sm:py-24 border-b border-neutral-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-3">
              FULFILLMENT &amp; LOGISTICS
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-[0.18em] font-sans">
              ORDERS &amp; SHIPPING POLICY
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-4 max-w-xl mx-auto leading-relaxed">
              Every LEGACY timepiece is dispatched in tamper-evident security packaging with 100% complimentary transit insurance.
            </p>
            <span className="text-[11px] font-mono text-neutral-500 block mt-4">
              Priority Air Dispatch &bull; Pan-India Coverage &bull; Courier Partners: Blue Dart &amp; Delhivery
            </span>
          </div>
        </section>

        {/* Content Body */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-10">
          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4">
            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xs">
              <Truck className="w-5 h-5 text-black mb-2" />
              <h3 className="font-bold text-black uppercase text-xs">Free Priority Shipping</h3>
              <p className="text-neutral-600 text-xs mt-1">100% complimentary air shipping on all watch orders nationwide.</p>
            </div>
            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xs">
              <ShieldCheck className="w-5 h-5 text-black mb-2" />
              <h3 className="font-bold text-black uppercase text-xs">100% Transit Insured</h3>
              <p className="text-neutral-600 text-xs mt-1">Every consignment is fully covered against damage or loss in transit.</p>
            </div>
            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-xs">
              <Clock className="w-5 h-5 text-black mb-2" />
              <h3 className="font-bold text-black uppercase text-xs">24-48 Hr Dispatch</h3>
              <p className="text-neutral-600 text-xs mt-1">Undergoes strict multi-point chronometric inspection before release.</p>
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              1. Processing &amp; Dispatch Timeframe
            </h2>
            <p>
              Before dispatch, every LEGACY timepiece undergoes a 24-point horological diagnostic check (verifying balance-wheel amplitude, power reserve, crown threading, and dial alignment). Orders are packed and dispatched within <strong>24 to 48 business hours</strong> following payment confirmation.
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              2. Estimated Delivery Timelines
            </h2>
            <p>We partner with India&rsquo;s leading express couriers (Blue Dart Express, Delhivery, and DTDC Premium):</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left border-collapse border border-neutral-200 font-mono text-xs">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-800 border-b border-neutral-200">
                    <th className="p-3 border-r border-neutral-200">Destination Region</th>
                    <th className="p-3 border-r border-neutral-200">Courier Partner</th>
                    <th className="p-3">Estimated Transit Window</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="p-3 border-r border-neutral-200 font-sans font-medium">Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata, Pune)</td>
                    <td className="p-3 border-r border-neutral-200">Blue Dart Express (Air)</td>
                    <td className="p-3 font-bold text-black">2 to 4 Business Days</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-r border-neutral-200 font-sans font-medium">Tier 2 &amp; Major State Capitals (Ahmedabad, Jaipur, Chandigarh, Lucknow, Kochi, Indore)</td>
                    <td className="p-3 border-r border-neutral-200">Blue Dart / Delhivery</td>
                    <td className="p-3 font-bold text-black">3 to 5 Business Days</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-r border-neutral-200 font-sans font-medium">Rest of India &amp; Rural Destinations</td>
                    <td className="p-3 border-r border-neutral-200">Delhivery / India Post Speed Post</td>
                    <td className="p-3 font-bold text-black">5 to 7 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              3. Live Tracking &amp; AWB Assignment
            </h2>
            <p>
              Once your timepiece is handed over to the courier partner, an automated confirmation is dispatched via <strong>Email, SMS, and WhatsApp</strong> containing your Air Waybill (AWB) number and a direct tracking link. You can track your parcel in real-time from our fulfillment center to your doorstep.
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              4. Tamper-Evident Security Seal Protocol
            </h2>
            <p>
              Every LEGACY consignment is enclosed inside a branded outer shipping box and secured with a numbered <strong>Tamper-Evident Holographic Security Seal</strong>.
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs mt-3 text-amber-900 text-xs">
              <strong>Important Client Notice:</strong> If the outer security tape or packaging appears torn, tampered with, or retaped upon delivery, please <strong>refuse delivery</strong> and immediately alert our concierge team at +91 98201 12345.
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              5. Delivery Attempts &amp; Undelivered Consignments
            </h2>
            <p>
              Our courier partners attempt delivery up to <strong>3 times</strong> before returning the consignment to our fulfillment facility. Please ensure your mobile number is accessible to receive OTP delivery notifications.
            </p>
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}
