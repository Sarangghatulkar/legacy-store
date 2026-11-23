'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StoreLayout from '@/components/StoreLayout';
import { useCartStore } from '@/lib/cartStore';
import { useAuth } from '@/lib/authContext';
import { formatINR } from '@/lib/utils';
import { ShieldCheck, Lock, CreditCard, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const effectiveFullName = formData.fullName || profile?.full_name || '';
  const effectiveEmail = formData.email || user?.email || '';
  const effectivePhone = formData.phone || profile?.phone || '';

  const total = totalPrice();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your shopping bag is empty');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on server — send items so server fetches DB prices (never send amount)
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          customerInfo: {
            userId: user?.id || null,
            fullName: effectiveFullName,
            email: effectiveEmail,
            phone: effectivePhone,
            address: { ...formData, fullName: effectiveFullName, email: effectiveEmail, phone: effectivePhone },
          },
        }),
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || 'Failed to initialize order');

      const internalOrderId: string = orderData.internalOrderId;

      // 2. Load Razorpay Checkout SDK
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || orderData.isMock || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_live')) {
        // Fallback / Dev test mode when real live keys are not actively bound to a merchant
        const confirmed = window.confirm(
          `[Razorpay Payment Gateway Simulation]\n\nMerchant: LEGACY Horology\nAmount Payable: ${formatINR(total)}\nCustomer: ${effectiveFullName}\nPhone: ${effectivePhone}\n\nClick OK to simulate verified Razorpay UPI/Netbanking payment.`
        );

        if (!confirmed) {
          setLoading(false);
          return;
        }

        // Verify via server — server updates DB, sets payment_status = 'paid', deducts stock
        const verifyRes = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.razorpayOrderId,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: 'mock_sig',
            internalOrderId,
          }),
        });
        const verifyData = await verifyRes.json();

        if (!verifyData.verified) {
          toast.error('Order confirmation failed — please contact support');
          setLoading(false);
          return;
        }

        clearCart();
        toast.success('Payment Received! Your luxury timepiece consignment is being prepared.');
        router.push(`/order-success?orderId=${verifyData.orderId || internalOrderId}`);
        return;
      }

      // Live Razorpay modal flow
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'LEGACY Horology',
        description: 'Order Payment - Legacy Luxury Timepieces',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: effectiveFullName,
          email: effectiveEmail,
          contact: effectivePhone,
        },
        theme: {
          color: '#0a0a0a',
        },
        handler: async function (response: any) {
          // Verify server-side — server updates DB and deducts stock
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              internalOrderId,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.verified) {
            clearCart();
            toast.success('Payment verified!');
            router.push(`/order-success?orderId=${verifyData.orderId || internalOrderId}`);
          } else {
            toast.error('Payment verification failed');
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-10">
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-800">
            Secure Payment & Express Dispatch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-950 tracking-tight mt-1">
            Bespoke Wardrobe Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Shipping Form */}
          <div className="lg:col-span-7">
            {!user && (
              <div className="mb-6 p-4 border border-neutral-200 bg-neutral-50 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs text-neutral-600 font-sans">
                  Have a Legacy client account? Sign in for saved addresses and insured order tracking.
                </span>
                <Link
                  href="/login?redirect=/checkout"
                  className="text-xs font-bold uppercase tracking-wider text-black underline shrink-0 hover:opacity-70 transition-opacity"
                >
                  Sign In →
                </Link>
              </div>
            )}
            <form onSubmit={handlePayment} className="space-y-8">
              {/* Contact Card */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/90 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-neutral-950 mb-5 flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-950 text-white text-xs flex items-center justify-center font-mono">
                    1
                  </span>
                  <span>Gentleman&apos;s Contact Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 font-mono">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={effectiveFullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 font-mono">
                      Phone Number (For Courier Updates) *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={effectivePhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 font-mono">
                      Email Address (Invoice & Tracking Sent Here) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={effectiveEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/90 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-neutral-950 mb-5 flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-neutral-950 text-white text-xs flex items-center justify-center font-mono">
                    2
                  </span>
                  <span>Delivery Address Across India</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 font-mono">
                      Flat / Bungalow / Street Address *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      required
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 font-mono">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 font-mono">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5 font-mono">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 text-sm focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Box */}
              <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-300 flex items-start space-x-4">
                <div className="p-3 bg-neutral-950 text-white rounded-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-neutral-950 text-base">
                    Official Razorpay Payment Gateway
                  </h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Direct integration supporting Google Pay, PhonePe, Paytm, BHIM UPI, all Visa / Mastercard / RuPay credit & debit cards, plus major Indian Netbanking portals.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full py-4.5 px-6 rounded-lg bg-neutral-950 hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Connecting to Razorpay...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Pay {formatINR(total)} with Razorpay</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/90 shadow-xs sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <h3 className="font-serif text-lg font-bold text-neutral-950">Wardrobe Selection</h3>
                <span className="text-xs text-neutral-500 font-mono">{items.length} garments</span>
              </div>

              <div className="divide-y divide-neutral-100 max-h-96 overflow-y-auto py-2">
                {items.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-8 text-center font-mono">Your shopping bag is empty</p>
                ) : (
                  items.map(({ id, product, quantity, selectedSize, selectedColor }) => (
                    <div key={id} className="py-4 flex items-center space-x-3">
                      <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                        <Image
                          src={product.images[0] || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200'}
                          alt={product.title}
                          fill
                          className="object-cover object-top"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-bold text-neutral-900 truncate">
                          {product.title}
                        </h4>
                        <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                          Size: {selectedSize} {selectedColor && `• ${selectedColor}`}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          Qty: {quantity} × {formatINR(product.price)}
                        </p>
                      </div>
                      <span className="font-serif text-sm font-bold text-neutral-950">
                        {formatINR(product.price * quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t border-neutral-200 space-y-2.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Garments Subtotal</span>
                  <span className="font-serif font-bold text-neutral-950">{formatINR(total)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Insured Express Shipping</span>
                  <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[11px]">Free</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Goods & Services Tax (GST 12%)</span>
                  <span className="text-neutral-500 font-mono">Included in price</span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-950 pt-4 border-t border-neutral-200 font-serif">
                  <span>Total Payable</span>
                  <span className="text-neutral-950">{formatINR(total)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-100 flex items-center justify-center space-x-2 text-[10px] text-neutral-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit Encrypted Razorpay Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
