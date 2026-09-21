import React from 'react';
import { Star, ShoppingBasket, AlertCircle, Zap } from 'lucide-react';
import { Product } from '../types';
import { DEFAULT_PRODUCT_IMAGE } from '../lib/cloudinary';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  lang: 'en' | 'bn';
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  lang, 
  onViewProduct, 
  onAddToCart,
  onBuyNow
}: ProductCardProps) {
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const initialImage = product.image || (product.imagesGallery && product.imagesGallery[0]) || DEFAULT_PRODUCT_IMAGE;
  const [imgSrc, setImgSrc] = React.useState<string>(initialImage);

  React.useEffect(() => {
    const nextImg = product.image || (product.imagesGallery && product.imagesGallery[0]) || DEFAULT_PRODUCT_IMAGE;
    setImgSrc(nextImg);
  }, [product.image, product.imagesGallery]);

  const getCategoryLabel = (category: string) => {
    if (lang === 'bn') {
      switch (category) {
        case 'pigeons': return 'কবুতরের খাবার';
        case 'birds': return 'পাখির খাবার';
        case 'medicine':
        case 'supplements': return 'ঔষধ ও কেয়ার';
        case 'accessories': return 'এক্সেসরিজ';
        case 'cats': return 'বিড়ালের খাবার';
        default: return category;
      }
    }
    switch (category) {
      case 'pigeons': return 'Pigeon Feed';
      case 'birds': return 'Bird Feed';
      case 'medicine':
      case 'supplements': return 'Medicine';
      case 'accessories': return 'Accessories';
      case 'cats': return 'Cat Feed';
      default: return category;
    }
  };

  const displayName = lang === 'bn' 
    ? (product.banglaName || product.name) 
    : (product.name || product.banglaName);

  return (
    <div 
      className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden group cursor-pointer"
      id={`product-card-${product.id}`}
      onClick={() => onViewProduct(product)}
    >
      {/* 1. Consistent Square Product Image Stage (1:1 Aspect Ratio) */}
      <div className="relative w-full aspect-square bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center border-b border-slate-100">
        <img
          src={imgSrc}
          alt={displayName}
          onError={() => {
            if (imgSrc !== DEFAULT_PRODUCT_IMAGE) {
              setImgSrc(DEFAULT_PRODUCT_IMAGE);
            }
          }}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Discount Percentage Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded shadow-xs leading-none">
            -{discountPercent}%
          </div>
        )}
        
        {/* Stock Status Badge / Overlay */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 bg-amber-500/95 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs shadow-xs leading-none">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>{lang === 'bn' ? 'সীমিত স্টক' : 'Low Stock'}</span>
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-2">
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {lang === 'bn' ? 'স্টক শেষ' : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      {/* 2. Structured Product Details Content Area */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between bg-white space-y-2">
        <div className="space-y-1.5">
          {/* Category Tag & Weight Badge */}
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-100/70 px-1.5 py-0.5 rounded capitalize tracking-wide truncate max-w-[120px] sm:max-w-[140px]">
              {getCategoryLabel(product.category)}
            </span>
            {product.weight && (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono shrink-0">
                {product.weight}
              </span>
            )}
          </div>

          {/* Product Name (Equalized 2-line title height across all cards) */}
          <h3 
            className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug min-h-[2.5rem] sm:min-h-[2.75rem] transition-colors"
            title={displayName}
          >
            {displayName}
          </h3>

          {/* Ratings & Review Count */}
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[10px] text-slate-700 font-bold">{product.rating || 5.0}</span>
            <span className="text-[10px] text-slate-400 font-medium">({product.reviewsCount || 0})</span>
          </div>
        </div>

        {/* 3. Pricing & Purchase Action Section */}
        <div className="pt-2 border-t border-slate-100 mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-extrabold text-blue-600 text-sm sm:text-base leading-none tracking-tight">
                ৳{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through leading-none">
                  ৳{product.originalPrice}
                </span>
              )}
            </div>

            {/* Quick Add to Cart Icon Button */}
            <button
              id={`add-to-cart-btn-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={product.stock === 0}
              className={`w-7.5 h-7.5 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${
                product.stock === 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white active:scale-95'
              }`}
              title={lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}
              aria-label="Add to cart"
            >
              <ShoppingBasket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Primary Action Button: Order Now */}
          <button
            id={`order-now-btn-${product.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (product.stock > 0) {
                if (onBuyNow) {
                  onBuyNow(product);
                } else {
                  onAddToCart(product);
                }
              }
            }}
            disabled={product.stock === 0}
            className={`w-full py-1.5 sm:py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
              product.stock === 0
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300 shrink-0" />
            <span className="tracking-wide">
              {product.stock === 0 
                ? (lang === 'bn' ? 'স্টক নেই' : 'Out of Stock') 
                : (lang === 'bn' ? 'অর্ডার করুন' : 'Order Now')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
