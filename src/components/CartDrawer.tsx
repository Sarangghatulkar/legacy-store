'use client';

import { useCartStore } from '@/lib/cartStore';
import { formatINR } from '@/lib/utils';
import { X, Trash2, Plus, Minus, ChevronRight, Crown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice } = useCartStore();

  if (!isOpen) return null;

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = totalPrice();

  // Tier progress calculations
  // Free Shipping: >= 1 item, Tier 2: >= 2 items (25% off), Tier 3: >= 4 items (40% off)
  const tierProgress = Math.min(100, (totalQuantity / 4) * 100);

  let incentiveText = 'Add 1 product for Free Shipping';
  if (totalQuantity === 1) {
    incentiveText = 'Add 1 more product and Save upto 25%';
  } else if (totalQuantity >= 2 && totalQuantity < 4) {
    incentiveText = `Add ${4 - totalQuantity} more product${4 - totalQuantity > 1 ? 's' : ''} and Save upto 40%`;
  } else if (totalQuantity >= 4) {
    incentiveText = '🎉 Maximum 40% VIP Discount Unlocked!';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-neutral-200 animate-in slide-in-from-right duration-300">
          {/* 1. Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold tracking-[0.15em] text-black uppercase font-sans">
              YOUR CART ({totalQuantity})
            </h2>
            <button
              onClick={closeCart}
              className="p-1.5 text-black hover:opacity-60 transition-opacity"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>

          {/* 2. Prepaid Offer Banner */}
          <div className="bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] py-2 px-4 text-center">
            EXTRA DISCOUNT ON PREPAID ORDERS
          </div>

          {/* 3. Free Shipping & Tiered Savings Progress Bar */}
          <div className="bg-neutral-50 p-4 border-b border-neutral-200">
            <p className="text-xs text-center font-medium text-neutral-800 mb-3">
              {incentiveText}
            </p>

            {/* Interactive Progress Track with Chess King Icon */}
            <div className="relative w-full h-1.5 bg-neutral-200 rounded-full my-4">
              <div
                className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-500"
                style={{ width: `${Math.max(8, tierProgress)}%` }}
              />
              {/* Chess Piece Indicator */}
              <div
                className="absolute -top-3 transition-all duration-500 -ml-2 text-black"
                style={{ left: `${Math.max(4, tierProgress)}%` }}
              >
                <div className="w-5 h-5 bg-white rounded-full border border-black flex items-center justify-center shadow-xs">
                  <Crown className="w-3 h-3 fill-black text-black" />
                </div>
              </div>
            </div>

            {/* Milestones Labels */}
            <div className="grid grid-cols-3 text-[10px] text-center font-medium text-neutral-500 pt-1">
              <span className={totalQuantity >= 1 ? 'text-black font-bold' : ''}>Free Shipping</span>
              <span className={totalQuantity >= 2 ? 'text-black font-bold' : ''}>Buy 2 Save 25%</span>
              <span className={totalQuantity >= 4 ? 'text-black font-bold' : ''}>Buy 4 Save 40%</span>
            </div>
          </div>

          {/* 4. Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <h3 className="text-xl font-bold tracking-tight text-black mb-6 font-sans">
                  Your cart is empty
                </h3>
                <button
                  onClick={closeCart}
                  className="px-8 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              items.map(({ id, product, quantity }) => (
                <div
                  key={id}
                  className="flex space-x-4 pb-4 border-b border-neutral-100 last:border-b-0"
                >
                  {/* Bottle Image */}
                  <div className="relative w-20 h-24 bg-neutral-50 border border-neutral-100 shrink-0 flex items-center justify-center">
                    <Image
                      src={product.images[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300'}
                      alt={product.title}
                      fill
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs sm:text-sm font-bold text-black uppercase tracking-wider leading-tight">
                          {product.title}
                        </h4>
                        <span className="text-xs sm:text-sm font-bold text-black font-mono">
                          {formatINR(product.price * quantity)}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {product.volume || '100ml'} · Parfum
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center border border-neutral-200">
                        <button
                          onClick={() => updateQuantity(id, quantity - 1)}
                          className="p-1 px-2.5 text-neutral-600 hover:text-black hover:bg-neutral-50 text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold font-mono text-black">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(id, quantity + 1)}
                          className="p-1 px-2.5 text-neutral-600 hover:text-black hover:bg-neutral-50 text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(id)}
                        className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-black transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>REMOVE</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 5. Fixed Checkout Footer Bar */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-white border-t border-neutral-200 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-black tracking-wider uppercase">
                <span className="flex items-center space-x-1">
                  <span>Subtotal</span>
                  <span className="text-[10px] text-neutral-400">∨</span>
                </span>
                <span className="text-sm font-black font-mono">{formatINR(total)}</span>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-sm"
              >
                <span>Checkout</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
