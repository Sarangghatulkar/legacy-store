'use client';

import StoreLayout from '@/components/StoreLayout';
import Link from 'next/link';
import { ShieldCheck, Lock, EyeOff, Server, Mail } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <StoreLayout>
      <div className="bg-white min-h-screen text-neutral-900 font-sans">
        {/* Header Hero */}
        <section className="bg-neutral-950 text-white py-16 sm:py-24 border-b border-neutral-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-3">
              CLIENT CONFIDENTIALITY
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-[0.18em] font-sans">
              PRIVACY POLICY
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-4 max-w-xl mx-auto leading-relaxed">
              How LEGACY safeguards client records, payment privacy, and personal data under Indian IT and SPDI regulations.
            </p>
            <span className="text-[11px] font-mono text-neutral-500 block mt-4">
              Last Updated: November 2026 &bull; Compliant with Information Technology (SPDI) Rules, 2011
            </span>
          </div>
        </section>

        {/* Content Body */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-10">
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              1. Information We Collect
            </h2>
            <p>
              When you purchase a timepiece or create an account with LEGACY, we collect the following personal information:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-neutral-600">
              <li><strong>Contact Information:</strong> Full name, verified email address, mobile number for courier SMS delivery alerts.</li>
              <li><strong>Shipping &amp; Billing Data:</strong> Street address, city, state, postal code, and country for insured transit.</li>
              <li><strong>Transaction Data:</strong> Razorpay / PhonePe transaction IDs, order amounts, and payment method used. (<em>Note: We never store your full card number, CVV, or bank MPIN on our servers</em>).</li>
              <li><strong>Device &amp; Telemetry Data:</strong> IP address, browser type, and operating system collected via encrypted session cookies.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              2. Purpose of Data Processing
            </h2>
            <p>Your confidential data is utilized solely for legitimate operational purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-neutral-600">
              <li>To dispatch and fulfill your high-value timepiece consignment with transit insurance.</li>
              <li>To generate formal GST-compliant tax invoices and track 2-year warranty records.</li>
              <li>To communicate critical logistics milestones via SMS, WhatsApp, and email.</li>
              <li>To prevent fraudulent card transactions and unauthorized account access.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              3. Data Security &amp; Encryption Standards
            </h2>
            <p>
              We treat client information with the utmost security:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xs">
                <span className="font-bold text-black uppercase text-xs block mb-1 flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit SSL/TLS Encryption</span>
                </span>
                <p className="text-neutral-600 text-xs">All communications between your browser and our server are strictly encrypted.</p>
              </div>
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xs">
                <span className="font-bold text-black uppercase text-xs block mb-1 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Row Level Security (RLS)</span>
                </span>
                <p className="text-neutral-600 text-xs">Our Supabase PostgreSQL cloud database strictly isolates each customer&rsquo;s order history.</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              4. Third-Party Disclosures
            </h2>
            <p>
              We <strong>do not sell, rent, or trade</strong> your personal information to third-party marketing brokers. Information is shared strictly with essential logistical and financial partners:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-neutral-600">
              <li><strong>Authorized Logistics Partners:</strong> Blue Dart Express, Delhivery, DTDC, and DHL for physical consignment delivery.</li>
              <li><strong>RBI-Authorized Payment Aggregators:</strong> PhonePe &amp; Razorpay for PCI-DSS compliant transaction settlement.</li>
              <li><strong>Statutory Authorities:</strong> Only when strictly mandated by Indian law or judicial process.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              5. Grievance Redressal Officer (Mandatory Compliance)
            </h2>
            <p>
              In accordance with the <strong>Information Technology Act, 2000</strong> and rules made thereunder, the contact details of the Grievance Officer are provided below:
            </p>
            <div className="p-4 bg-neutral-100 border border-neutral-300 rounded-xs mt-3 text-xs font-mono space-y-1 text-neutral-800">
              <p><strong>Designation:</strong> Chief Grievance Officer</p>
              <p><strong>Entity:</strong> Brix Lifestyle Private Limited (LEGACY)</p>
              <p><strong>Office:</strong> Bandra Kurla Complex (BKC), Mumbai, Maharashtra 400051, India</p>
              <p><strong>Direct Email:</strong> <a href="mailto:grievance@legacy.store" className="text-black underline">grievance@legacy.store</a></p>
              <p><strong>Response Time:</strong> Acknowledged within 48 hours; resolved within 30 business days.</p>
            </div>
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}
