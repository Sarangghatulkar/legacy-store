'use client';

import StoreLayout from '@/components/StoreLayout';
import Link from 'next/link';
import { Shield, Clock, FileText, ChevronRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <StoreLayout>
      <div className="bg-white min-h-screen text-neutral-900 font-sans">
        {/* Header Hero */}
        <section className="bg-neutral-950 text-white py-16 sm:py-24 border-b border-neutral-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-3">
              LEGAL &amp; COMPLIANCE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-[0.18em] font-sans">
              TERMS &amp; CONDITIONS
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-4 max-w-xl mx-auto leading-relaxed">
              Governing rules, intellectual property, and client commitments for LEGACY Haute Horlogerie consignments.
            </p>
            <span className="text-[11px] font-mono text-neutral-500 block mt-4">
              Last Updated: November 2026 &bull; Compliant with Indian IT Act 2000 &amp; Consumer Protection E-Commerce Rules
            </span>
          </div>
        </section>

        {/* Content Body */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-10">
          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              1. Corporate Entity &amp; Scope of Agreement
            </h2>
            <p>
              This website (<strong className="text-black">legacy.store</strong> / <strong className="text-black">legacytimepieces.com</strong>) is operated by <strong>Brix Lifestyle Private Limited</strong> (trading as <em>LEGACY</em>). Throughout the site, the terms &ldquo;we&rdquo;, &ldquo;us&rdquo;, and &ldquo;our&rdquo; refer to LEGACY.
            </p>
            <p className="mt-2">
              By visiting our site and/or purchasing a timepiece, you engage in our &ldquo;Service&rdquo; and agree to be bound by the following terms and conditions (&ldquo;Terms of Service&rdquo;, &ldquo;Terms&rdquo;). These Terms apply to all users of the site, including browsers, customers, merchants, and contributors of content.
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              2. Eligibility &amp; Client Account
            </h2>
            <p>
              By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence (18 years in the Republic of India). You agree to provide current, complete, and accurate purchase and account information for all purchases made at our store. You are responsible for safeguarding your login credentials.
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              3. Horological Specifications, Pricing &amp; Authenticity
            </h2>
            <p>
              All LEGACY timepieces are engineered using surgical-grade 316L stainless steel, scratch-resistant sapphire crystal, and chronometric calibres. While we strive to display dial hues, sunburst textures, and proportions as accurately as possible, slight visual variations may occur depending on your screen calibrations.
            </p>
            <p className="mt-2">
              Prices for our products are subject to change without prior notice. All prices displayed are in Indian Rupees (INR &bull; &#8377;) and are all-inclusive of applicable Goods and Services Tax (GST 18%).
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              4. Payment &amp; Gateway Security
            </h2>
            <p>
              We accept payments through RBI-authorized payment aggregators (including UPI, PhonePe, Google Pay, Net Banking, Credit Cards, and Debit Cards). All electronic transactions are encrypted using bank-grade 256-bit SSL protocols. We do not store sensitive payment credentials such as CVV or card PINs on our servers.
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              5. 2-Year International Limited Warranty
            </h2>
            <p>
              Each authentic LEGACY watch includes a 2-Year Limited Manufacturer Warranty covering internal mechanical movement failure, manufacturing defects, and dial imperfections. The warranty explicitly excludes:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 text-neutral-600">
              <li>Normal wear and tear (scratches to metal bracelet, leather strap creasing).</li>
              <li>Damage resulting from unauthorized modification, third-party servicing, or accidents.</li>
              <li>Water damage resulting from exceeding stated atmospheric limits (e.g. failing to screw down the crown).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              6. Intellectual Property Rights
            </h2>
            <p>
              The LEGACY name, logo, watch case architectural designs, dial silhouettes, typography, and website editorial photography are the exclusive intellectual property of Brix Lifestyle Private Limited. Any reproduction, distribution, or commercial exploitation without prior written consent is strictly prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-black mb-3 border-b border-neutral-200 pb-2">
              7. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra.
            </p>
          </div>

          <div className="p-6 bg-neutral-100 rounded-xs border border-neutral-200">
            <h3 className="font-bold text-black uppercase tracking-wider text-xs mb-2">
              Questions Regarding Our Terms?
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              For any clarification regarding these terms, contact our corporate legal cell at{' '}
              <a href="mailto:legal@legacy.store" className="text-black font-semibold underline">
                legal@legacy.store
              </a>{' '}
              or reach our concierge desk at +91 98201 12345.
            </p>
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}
