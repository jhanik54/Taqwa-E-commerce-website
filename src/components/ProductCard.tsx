import React from 'react';
import { Star, ShoppingBasket, AlertCircle, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  lang: 'en' | 'bn';
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isFavorite: boolean;
  onToggleWishlist: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  lang, 
  onViewProduct, 
  onAddToCart,
  isFavorite,
  onToggleWishlist
}: ProductCardProps) {
  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-[420px] overflow-hidden group cursor-pointer hover:-translate-y-1"
      id={`product-card-${product.id}`}
      onClick={() => onViewProduct(product)}
    >
      {/* Product Image Stage (62% of Card Height: 260px) */}
      <div className="h-[255px] w-full bg-slate-50 relative overflow-hidden shrink-0">
        <img
          src={product.image}
          alt={lang === 'bn' ? product.banglaName : product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-extrabold rounded-md shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Favorite Heart Toggle Pin */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-8.5 h-8.5 flex items-center justify-center rounded-full bg-white/95 hover:bg-white shadow-xs hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer ${
            isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
          }`}
          title={isFavorite ? (lang === 'bn' ? 'পছন্দ তালিকা থেকে সরান' : 'Remove from Wishlist') : (lang === 'bn' ? 'পছন্দ তালিকায় যোগ করুন' : 'Add to Wishlist')}
        >
          <Heart className={`w-4.5 h-4.5 ${isFavorite ? 'fill-current text-rose-500' : 'text-slate-450'}`} />
        </button>
        
        {/* Stock Level Overlay Tag */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-3 left-3 bg-amber-500/90 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs shadow-sm">
            <AlertCircle className="w-3 h-3" />
            <span>{lang === 'bn' ? 'সীমিত স্টক!' : 'Low Stock!'}</span>
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-xs">
            <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              {lang === 'bn' ? 'স্টক আউট' : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      {/* Product Card Details (Remaining 38% of Card Height) */}
      <div className="flex-1 p-3 flex flex-col justify-between bg-white">
        <div className="space-y-1.5">
          {/* Tag & Category */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md capitalize tracking-wide">
              {lang === 'bn' 
                ? (product.category === 'birds' ? 'পাখি' : product.category === 'cats' ? 'বিড়াল' : product.category === 'fish' ? 'মাছ' : product.category === 'rabbits' ? 'খরগোশ' : product.category === 'accessories' ? 'একসেসরিজ' : 'সাপ্লিমেন্ট')
                : product.category}
            </span>
            {product.weight && (
              <span className="text-[9px] font-bold text-slate-450 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                {product.weight}
              </span>
            )}
          </div>

          {/* Product Name (Exactly Clamped to 2 Lines) */}
          <h3 
            className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700 line-clamp-2 leading-snug h-8 overflow-hidden"
            title={lang === 'bn' ? product.banglaName : product.name}
          >
            {lang === 'bn' ? product.banglaName : product.name}
          </h3>

          {/* Ratings Summary */}
          <div className="flex items-center gap-1">
            <div className="flex text-amber-450">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[10px] text-slate-600 font-extrabold">{product.rating}</span>
            <span className="text-[10px] text-slate-400 font-medium">({product.reviewsCount} {lang === 'bn' ? 'রিভিউ' : 'reviews'})</span>
          </div>
        </div>

        {/* Pricing Section & Purchase Button - Consistently Aligned */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-50 mt-1">
          <div className="flex flex-col justify-center">
            <span className="font-extrabold text-emerald-600 text-sm leading-none">
              ৳{product.price}
            </span>
            {product.originalPrice > product.price ? (
              <span className="text-[10px] text-slate-400 line-through mt-0.5">
                ৳{product.originalPrice}
              </span>
            ) : (
              <span className="text-[10px] text-transparent mt-0.5 select-none leading-none">৳00</span>
            )}
          </div>

          <button
            id={`add-to-cart-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock === 0}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              product.stock === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
            }`}
            title={lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
          >
            <ShoppingBasket className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
