'use client';

import { useState } from 'react';
import StoreLayout from '@/components/StoreLayout';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ShieldCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Consignment Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Your message has been dispatched to the LEGACY Concierge');
    }, 600);
  };

  return (
    <StoreLayout>
      <div className="bg-white min-h-screen text-neutral-900 font-sans">
        {/* Header Hero */}
        <section className="bg-neutral-950 text-white py-16 sm:py-24 border-b border-neutral-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-neutral-400 block mb-3">
              HAUTE HORLOGERIE CONCIERGE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-[0.18em] font-sans">
              CONTACT &amp; CONCIERGE
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-4 max-w-xl mx-auto leading-relaxed">
              Our horological advisors are available 6 days a week for acquisition guidance, bespoke commissions, and consignment tracking.
            </p>
          </div>
        </section>

        {/* Content Body: 2 Column Layout */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Direct Contact Info & Corporate Details (5 Cols) */}
            <div className="lg:col-span-5 space-y-8 text-xs sm:text-sm">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                  CORPORATE HEADQUARTERS
                </span>
                <h2 className="text-xl font-bold uppercase tracking-wider text-black">
                  LEGACY TIMEPIECES
                </h2>
                <span className="text-xs text-neutral-500 block mt-0.5">
                  Brix Lifestyle Private Limited &bull; CIN: U74999MH2024PTC123456
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3.5 p-4 bg-neutral-50 border border-neutral-200 rounded-xs">
                  <MapPin className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-black block text-xs uppercase tracking-wider">Registered Corporate Office:</strong>
                    <p className="text-neutral-600 text-xs mt-1 leading-relaxed">
                      Tower 3, Level 8, Platina Complex,<br />
                      Bandra Kurla Complex (BKC), Bandra East,<br />
                      Mumbai, Maharashtra 400051, India.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-4 bg-neutral-50 border border-neutral-200 rounded-xs">
                  <Mail className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-black block text-xs uppercase tracking-wider">Official Email Channels:</strong>
                    <div className="mt-1 space-y-0.5 text-xs font-mono">
                      <div>Concierge: <a href="mailto:support@legacy.store" className="text-black underline font-semibold">support@legacy.store</a></div>
                      <div>Orders: <a href="mailto:orders@legacy.store" className="text-black underline font-semibold">orders@legacy.store</a></div>
                      <div>Legal Cell: <a href="mailto:legal@legacy.store" className="text-black underline font-semibold">legal@legacy.store</a></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-4 bg-neutral-50 border border-neutral-200 rounded-xs">
                  <Phone className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-black block text-xs uppercase tracking-wider">Direct Telephone &amp; WhatsApp:</strong>
                    <p className="text-neutral-600 text-xs mt-1 font-mono">
                      +91 98201 12345 / +91 98110 54321
                    </p>
                    <a
                      href="https://wa.me/919820112345"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-emerald-700 font-bold text-xs mt-2 hover:underline"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat with Concierge on WhatsApp &rarr;</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-4 bg-neutral-50 border border-neutral-200 rounded-xs">
                  <Clock className="w-5 h-5 text-black shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-black block text-xs uppercase tracking-wider">Concierge Operating Hours:</strong>
                    <p className="text-neutral-600 text-xs mt-1">
                      Monday to Saturday: 10:00 AM – 7:00 PM IST<br />
                      Sunday: Reserved for VIP Trunk Shows &amp; Private Consultations
                    </p>
                  </div>
                </div>
              </div>

              {/* Grievance Box for RBI / Consumer Protection Compliance */}
              <div className="p-4 bg-neutral-100 border border-neutral-300 rounded-xs text-xs">
                <span className="font-bold text-black uppercase tracking-wider text-[11px] block mb-1">
                  Statutory Grievance Redressal Officer
                </span>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  Designated Officer: <strong>Aditya Singhania</strong><br />
                  Email: <a href="mailto:grievance@legacy.store" className="text-black underline">grievance@legacy.store</a><br />
                  Response SLA: Acknowledged within 48 hours as mandated by Indian E-Commerce Rules, 2020.
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Inquiry Form (7 Cols) */}
            <div className="lg:col-span-7 bg-neutral-50 border border-neutral-200 p-6 sm:p-10 rounded-xs">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 block mb-1">
                DISPATCH A MESSAGE
              </span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-black font-sans mb-2">
                CLIENT CONCIERGE DESK
              </h3>
              <p className="text-xs text-neutral-600 mb-6 leading-relaxed">
                Send an inquiry regarding watch specifications, sizing assistance, or order status. Our team responds within 4 business hours.
              </p>

              {submitted ? (
                <div className="p-8 bg-white border border-neutral-300 rounded-xs text-center space-y-3">
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold uppercase tracking-wider text-base text-black">
                    Inquiry Received
                  </h4>
                  <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                    Thank you, {form.name}. Your dossier reference has been logged. An advisor will contact you at {form.email} shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', phone: '', subject: 'Order Consignment Inquiry', message: '' });
                    }}
                    className="mt-4 px-4 py-2 border border-black text-xs uppercase font-mono tracking-wider hover:bg-black hover:text-white transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase font-mono text-[10px] text-neutral-600 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vikramaditya Rathore"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block uppercase font-mono text-[10px] text-neutral-600 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. vikram@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase font-mono text-[10px] text-neutral-600 mb-1">
                        Contact Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98201 00000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black font-mono"
                      />
                    </div>

                    <div>
                      <label className="block uppercase font-mono text-[10px] text-neutral-600 mb-1">
                        Inquiry Subject *
                      </label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xs text-black focus:outline-none focus:border-black"
                      >
                        <option value="Order Consignment Inquiry">Order Consignment Inquiry</option>
                        <option value="Watch Specifications & Sizing">Watch Specifications &amp; Sizing</option>
                        <option value="Warranty & Servicing">Warranty &amp; Servicing</option>
                        <option value="Returns & Exchanges">Returns &amp; Exchanges</option>
                        <option value="Bespoke Collector Commission">Bespoke Collector Commission</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block uppercase font-mono text-[10px] text-neutral-600 mb-1">
                      Your Message / Consignment Reference *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Please provide your Order ID or describe your horological inquiry in detail..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xs text-black placeholder-neutral-400 focus:outline-none focus:border-black leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xs transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'DISPATCHING...' : 'DISPATCH MESSAGE TO CONCIERGE'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}
