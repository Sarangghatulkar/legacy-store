'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StoreLayout from '@/components/StoreLayout';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/lib/dataService';
import { Product } from '@/types';
import { formatINR } from '@/lib/utils';
import { useCartStore } from '@/lib/cartStore';
import {
  Plus,
  Minus,
  Check,
  Star,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Accordion states
  const [specsOpen, setSpecsOpen] = useState(false);
  const [faqsOpen, setFaqsOpen] = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  useEffect(() => {
    productService.getProducts().then((data) => {
      setAllProducts(data);
    });

    if (slug) {
      productService.getProductBySlug(slug).then((data) => {
        setProduct(data);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-square bg-neutral-100 rounded-xs" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-3/4" />
            <div className="h-5 bg-neutral-200 rounded w-1/3" />
            <div className="h-12 bg-neutral-200 rounded w-full" />
            <div className="h-16 bg-neutral-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center">
        <h2 className="font-sans text-3xl font-black uppercase tracking-[0.2em] text-neutral-900">
          Timepiece Not Found
        </h2>
        <p className="mt-2 text-xs text-neutral-500 font-sans">
          This piece may be sold out or retired from the collection.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center space-x-2 px-8 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xs"
        >
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${product.title} to cart`);
    openCart();
  };

  const watchVariants = allProducts.filter((p) =>
    ['tourbillon-open-heart', 'astrum-chrono', 'noir-monolith', 'heritage-rose-gold', 'apex-automatic'].includes(p.slug)
  );

  const recommendations = allProducts.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <div className="bg-white">
      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ================= LEFT COLUMN: MEDIA GALLERY & HOROLOGICAL DETAILS ================= */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Main High-Resolution Watch View */}
            <div className="relative aspect-square w-full bg-[#0a0a0a] border border-neutral-200 overflow-hidden flex items-center justify-center">
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-black text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-xs">
                    {product.badge}
                  </span>
                </div>
              )}
              <Image
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.title}
                fill
                priority
                className="object-cover object-center transition-all duration-300"
              />
            </div>

            {/* Thumbnail Row */}
            {product.images.length > 1 && (
              <div className="flex items-center space-x-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 border overflow-hidden rounded-xs ${activeImageIndex === idx ? 'border-black ring-1 ring-black' : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* 2. Side-by-Side Macro Horology & Video Player Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Macro Horology Stone Display */}
              <div className="relative aspect-square bg-neutral-900 overflow-hidden border border-neutral-200">
                <Image
                  src="/images/legacy/watches/watch-trio.jpg"
                  alt="Macro Horology Display"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-xs">
                  <span className="text-[10px] text-white font-mono tracking-widest uppercase">
                    316L SURGICAL OYSTER STEEL
                  </span>
                </div>
              </div>

              {/* Wrist Lifestyle Video Player Preview */}
              <div className="relative aspect-square bg-neutral-800 overflow-hidden border border-neutral-200 group">
                <Image
                  src="/images/legacy/watches/watch-lifestyle.jpg"
                  alt="Timepiece on Wrist"
                  fill
                  className="object-cover brightness-95"
                />
                {/* Video UI Overlay */}
                <div className="absolute inset-0 bg-black/35 flex flex-col justify-between p-4">
                  <div className="flex justify-between items-center text-white">
                    <span className="text-[10px] font-mono tracking-widest uppercase bg-black/60 px-2 py-0.5 rounded-xs">
                      WRIST FILM &amp; MOVEMENT
                    </span>
                    <button
                      onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                      className="p-1.5 bg-black/60 hover:bg-black rounded-full transition-colors"
                      aria-label="Sound"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>

                  {/* Play Control & Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-white">
                      <button
                        onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                        className="w-7 h-7 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                        aria-label="Play/Pause"
                      >
                        {isPlayingVideo ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                      </button>
                      <span className="text-[11px] font-mono tracking-wider">
                        0:02 / 0:30
                      </span>
                    </div>
                    {/* Scrub bar */}
                    <div className="w-full h-1 bg-white/40 rounded-full overflow-hidden">
                      <div className="w-1/6 h-full bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Horological Architecture Breakdown */}
            <div className="border border-neutral-200 p-6 bg-[#fafafa]">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-black font-sans mb-4">
                HOROLOGICAL ARCHITECTURE
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div className="border-l-2 border-black pl-3">
                  <span className="font-bold uppercase tracking-wider block text-neutral-800">DIAL &amp; INDICES</span>
                  <p className="text-neutral-500 mt-1 text-[11px]">Sunray metallic face, diamond-cut rhodium indices, Super-LumiNova luminescence.</p>
                </div>
                <div className="border-l-2 border-neutral-400 pl-3">
                  <span className="font-bold uppercase tracking-wider block text-neutral-800">CASE &amp; SAPPHIRE</span>
                  <p className="text-neutral-500 mt-1 text-[11px]">Surgical-grade 316L cold-forged stainless steel with anti-scratch double-domed sapphire.</p>
                </div>
                <div className="border-l-2 border-neutral-300 pl-3">
                  <span className="font-bold uppercase tracking-wider block text-neutral-800">CALIBRE CALIBRATION</span>
                  <p className="text-neutral-500 mt-1 text-[11px]">Calibrated mechanical movement with 42-hour power reserve and 100M water guard.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: STICKY PURCHASE PANEL ================= */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div>
              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.14em] text-black font-sans">
                {product.title}
              </h1>

              {/* Tag Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {(product.tags || ['AUTOMATIC', '40MM', 'SAPPHIRE']).map((tag) => (
                  <span
                    key={tag}
                    className="border border-neutral-300 text-neutral-600 text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Occasion and Description */}
              {product.occasion && (
                <p className="text-[11px] text-neutral-500 font-mono tracking-wider uppercase mt-3">
                  {product.occasion}
                </p>
              )}
              {product.tagline && (
                <p className="text-xs text-neutral-600 italic font-sans mt-1">
                  &ldquo;{product.tagline}&rdquo;
                </p>
              )}

              {/* Price */}
              <div className="flex items-baseline space-x-3 mt-4 pt-2">
                <span className="text-2xl font-bold font-mono text-black">
                  {formatINR(product.price)}
                </span>
                {product.compare_price && (
                  <span className="text-sm font-mono text-neutral-400 line-through">
                    {formatINR(product.compare_price)}
                  </span>
                )}
                <span className="text-[11px] text-neutral-500 font-sans tracking-wide">
                  Incl. of all taxes &amp; Free Shipping
                </span>
              </div>
            </div>

            {/* CHOOSE VARIANTS SELECTOR (Row of mini watch thumbnails) */}
            <div className="pt-4 border-t border-neutral-200">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-black block mb-3 font-sans">
                CHOOSE SILHOUETTE
              </span>
              <div className="grid grid-cols-5 gap-2">
                {watchVariants.map((variant) => {
                  const isSelected = variant.slug === product.slug;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => router.push(`/products/${variant.slug}`)}
                      className={`relative aspect-square border p-1 rounded-xs flex flex-col items-center justify-between text-center transition-all ${isSelected
                          ? 'border-black bg-neutral-50 ring-1 ring-black'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white'
                        }`}
                    >
                      {variant.badge && (
                        <span className="absolute -top-1.5 left-1 bg-black text-white text-[7px] font-bold tracking-widest uppercase px-1 rounded-2xs">
                          {variant.badge}
                        </span>
                      )}
                      <div className="relative w-full h-3/4">
                        <Image
                          src={variant.images[0]}
                          alt={variant.title}
                          fill
                          className="object-cover p-0.5 rounded-2xs"
                        />
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-black font-sans truncate w-full">
                        {variant.title.split(' ')[1] || variant.title.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUANTITY STEPPER & ADD TO CART */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center space-x-3">
                {/* Stepper */}
                <div className="flex items-center border border-neutral-300 rounded-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-neutral-600 hover:text-black transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-bold text-black">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-neutral-600 hover:text-black transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add To Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 bg-black hover:bg-neutral-800 text-white font-sans text-xs font-bold uppercase tracking-[0.2em] rounded-xs transition-colors shadow-md flex items-center justify-center space-x-2"
                >
                  <span>ADD TO CART</span>
                </button>
              </div>
            </div>

            {/* OFFERS GIFT CARD (Complimentary Leather Watch Roll) */}
            <div className="mt-6 border border-neutral-200 rounded-xs overflow-hidden flex bg-white shadow-xs">
              <div className="bg-black text-white px-2.5 py-4 flex items-center justify-center select-none">
                <span className="text-[9px] font-black tracking-[0.25em] uppercase [writing-mode:vertical-lr] rotate-180">
                  GIFT · INCLUDED
                </span>
              </div>

              <div className="p-4 flex-1 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black font-sans">
                    A complimentary surprise for you
                  </h4>
                  <p className="text-[11px] text-neutral-600 font-sans mt-0.5">
                    Get an Italian Leather Travel Watch Roll with your order
                  </p>
                  <div className="flex items-center space-x-1 text-[10px] text-black font-mono font-bold mt-2">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>APPLIED AT CHECKOUT</span>
                  </div>
                </div>

                {/* Minimalist watch roll preview */}
                <div className="w-12 h-14 relative bg-neutral-900 rounded-xs border border-neutral-800 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center">
                    <span className="text-[8px] font-mono text-neutral-400">ROLL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACCORDIONS: SPECIFICATIONS, FAQS, WARRANTY */}
            <div className="border-t border-neutral-200 divide-y divide-neutral-200 pt-2 font-sans">
              {/* Technical Specifications */}
              <div>
                <button
                  onClick={() => setSpecsOpen(!specsOpen)}
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-black group-hover:opacity-60 transition-opacity">
                    TECHNICAL SPECIFICATIONS
                  </span>
                  {specsOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
                {specsOpen && (
                  <div className="pb-4 text-xs text-neutral-600 leading-relaxed space-y-1.5 animate-in fade-in duration-200">
                    <p>• <strong>Case Diameter:</strong> 40mm / 41mm (Thickness: 10.5mm)</p>
                    <p>• <strong>Material:</strong> Cold-forged 316L Surgical Stainless Steel</p>
                    <p>• <strong>Glass:</strong> Double-Domed Sapphire Crystal with Anti-Reflective Undercoat</p>
                    <p>• <strong>Water Resistance:</strong> 10 ATM / 100 Meters with Screw-Down Gasket</p>
                    <p>• <strong>Luminescence:</strong> Swiss Super-LumiNova BGW9 on Hands and Indices</p>
                  </div>
                )}
              </div>

              {/* FAQs & Care */}
              <div>
                <button
                  onClick={() => setFaqsOpen(!faqsOpen)}
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-black group-hover:opacity-60 transition-opacity">
                    FAQS &amp; WATER RESISTANCE
                  </span>
                  {faqsOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
                {faqsOpen && (
                  <div className="pb-4 text-xs text-neutral-600 leading-relaxed space-y-2 animate-in fade-in duration-200">
                    <p><strong>Q: Can I swim or shower with this watch?</strong><br />A: Yes, our steel timepieces feature 100M water resistance suitable for swimming and showering (ensure the crown is pushed fully in).</p>
                    <p><strong>Q: How do I adjust the bracelet size?</strong><br />A: Every order includes a precision pin-removal tool to add or remove links effortlessly at home.</p>
                  </div>
                )}
              </div>

              {/* 2-Year International Warranty */}
              <div>
                <button
                  onClick={() => setWarrantyOpen(!warrantyOpen)}
                  className="w-full py-4 flex items-center justify-between text-left group"
                >
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-black group-hover:opacity-60 transition-opacity">
                    2-YEAR INTERNATIONAL WARRANTY
                  </span>
                  {warrantyOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
                {warrantyOpen && (
                  <div className="pb-4 text-[11px] text-neutral-500 leading-relaxed space-y-1.5 animate-in fade-in duration-200">
                    <p>Every Legacy watch includes a serial-numbered certificate card granting 24 months of comprehensive movement warranty covering timekeeping accuracy and manufacturing tolerances.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= YOU MAY ALSO LIKE ================= */}
      <section className="py-16 sm:py-24 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-3xl font-black uppercase tracking-[0.22em] text-black font-sans text-center mb-10">
            YOU MAY ALSO LIKE
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200">
            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white">
                <ProductCard product={rec} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CUSTOMER REVIEWS ================= */}
      <section className="py-16 sm:py-20 bg-[#fafafa] border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-[0.22em] text-black font-sans">
              CUSTOMER REVIEWS
            </h2>
            <div className="flex items-center justify-center space-x-2 mt-3">
              <div className="flex text-black">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-black text-black" />
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-black">4.9 / 5.0</span>
              <span className="text-xs text-neutral-500 font-sans">
                (Based on 480 verified timepiece owners)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 border border-neutral-200 rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-black">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-black text-black" />
                  ))}
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">3 days ago</span>
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-black font-sans">
                Finishing competes with \$2,000 Swiss pieces
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                &ldquo;The chamfered polishing along the lugs and the way the sunray dial hits the sunlight is breathtaking. Weight feels extremely solid without being bulky.&rdquo;
              </p>
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                <span className="font-bold text-black font-sans">Aditya R.</span>
                <span className="text-green-700 font-mono text-[10px]">✓ Verified Buyer</span>
              </div>
            </div>

            <div className="bg-white p-6 border border-neutral-200 rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-black">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-black text-black" />
                  ))}
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">1 week ago</span>
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-black font-sans">
                The open-heart tourbillon is mesmerizing
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                &ldquo;Watching the balance wheel oscillate while working at my desk never gets old. Leather strap broke in within two days and feels like high-grade glove leather.&rdquo;
              </p>
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                <span className="font-bold text-black font-sans">Kabir M.</span>
                <span className="text-green-700 font-mono text-[10px]">✓ Verified Buyer</span>
              </div>
            </div>

            <div className="bg-white p-6 border border-neutral-200 rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-black">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-black text-black" />
                  ))}
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">2 weeks ago</span>
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-black font-sans">
                Unboxing was pure luxury
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                &ldquo;The wooden box, warranty card, and complimentary travel roll made this feel like receiving a timepiece five times the price. Outstanding execution.&rdquo;
              </p>
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                <span className="font-bold text-black font-sans">Siddharth N.</span>
                <span className="text-green-700 font-mono text-[10px]">✓ Verified Buyer</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <StoreLayout>
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs uppercase tracking-widest text-neutral-400">
            Loading Timepiece...
          </div>
        }
      >
        <ProductDetailContent />
      </Suspense>
    </StoreLayout>
  );
}
