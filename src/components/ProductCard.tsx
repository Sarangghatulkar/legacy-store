'use client';

import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { useCartStore } from '@/lib/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`Added ${product.title} to cart`);
    openCart();
  };

  return (
    <div className="group relative bg-white border border-neutral-200 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:border-black">
      {/* 1. Top Media Frame */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-[#fbfbfb] overflow-hidden">
        {/* Badge in Top Corner */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-black text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-xs">
              {product.badge}
            </span>
          </div>
        )}

        {/* Product Image */}
        <div className="relative w-full h-full p-6 flex items-center justify-center">
          <Image
            src={product.images[0] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800'}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>
      </Link>

      {/* 2. Text Details & Specifications */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-center bg-white">
        <div>
          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-black text-black uppercase tracking-[0.12em] hover:text-neutral-600 transition-colors line-clamp-1 font-sans">
              {product.title}
            </h3>
          </Link>

          {/* Fragrance Olfactory Notes / Subtitle */}
          {product.fragrance_notes && (
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium tracking-wider uppercase mt-1">
              {product.fragrance_notes}
            </p>
          )}

          {/* Pill Tags: [UNISEX] [100ML] [PARFUM] */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-neutral-300 text-neutral-600 text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. Pricing & Add To Cart Button */}
        <div className="mt-4 pt-3 flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-2 font-mono">
            <span className="text-sm sm:text-base font-bold text-black">
              {formatINR(product.price)}
            </span>
            {product.compare_price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatINR(product.compare_price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 px-4 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.15em] rounded-xs transition-colors shadow-xs"
          >
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}
