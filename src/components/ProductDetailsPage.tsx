import React, { useState, useEffect } from 'react';
import { ChevronLeft, Star, Sparkles, MessageCirclePlus, Weight, FileText, Heart, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsPageProps {
  productId: string;
  products: Product[];
  lang: 'en' | 'bn';
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onReviewSubmit: (productId: string, userName: string, rating: number, comment: string, reviewId?: string) => Promise<void>;
  isFavorite: boolean;
  onToggleWishlist: (product: Product) => void;
}

export default function ProductDetailsPage({
  productId,
  products = [],
  lang,
  onBack,
  onAddToCart,
  onBuyNow,
  onReviewSubmit,
  isFavorite,
  onToggleWishlist
}: ProductDetailsPageProps) {
  const isBn = lang === 'bn';
  const product = products.find(p => p.id === productId || p.slug === productId);

  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Active product states
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');

  useEffect(() => {
    if (product) {
      setActiveProduct(product);
      setActiveImage(product.image);
      setSelectedVariant(product.variants?.[0] || product.weight || 'Default');
      setReviewMessage('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product, productId]);

  if (!activeProduct) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <p className="text-sm font-semibold text-slate-400 italic">
          {isBn ? 'দুঃখিত, এই পণ্যটি পাওয়া যায়নি!' : 'Product not found!'}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'স্টোরে ফিরে যান' : 'Back to Store'}</span>
        </button>
      </div>
    );
  }

  const handleReviewForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage('');

    try {
      await onReviewSubmit(activeProduct.id, userName.trim(), rating, comment.trim(), editingReviewId || undefined);
      setUserName('');
      setComment('');
      setRating(5);
      setEditingReviewId(null);
      setReviewMessage(isBn ? 'রিভিউটি সফলভাবে সংরক্ষণ হয়েছে! ধন্যবাদ।' : 'Review processed successfully! Thank you.');
    } catch (err) {
      setReviewMessage(isBn ? 'দুঃখিত, পুনরায় চেষ্টা করুন।' : 'Failed to submit feedback.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const relatedProducts = products
    .filter(p => p.category === activeProduct.category && p.id !== activeProduct.id)
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in" id="product-details-page-viewport">
      
      {/* Breadcrumb Navigation & Back to Store shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xxs">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold select-none">
          <span className="hover:text-emerald-600 cursor-pointer" onClick={onBack}>{isBn ? 'স্টোর' : 'Store'}</span>
          <span>/</span>
          <span className="capitalize">{activeProduct.category}</span>
          <span>/</span>
          <span className="text-slate-700 truncate max-w-[150px] sm:max-w-xs">{isBn ? activeProduct.banglaName : activeProduct.name}</span>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-650 hover:text-emerald-700 font-extrabold cursor-pointer transition-colors"
          id="back-to-store-btn"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? 'স্টোর ক্যাটালগে ফিরে যান' : 'Back to Store Catalog'}</span>
        </button>
      </div>

      {/* Main Two-Column Card */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left: Beautiful zoom-enabled gallery and primary image */}
        <div className="p-6 sm:p-8 bg-slate-50/50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-150 relative">
          <div className="aspect-square w-full max-w-[400px] rounded-3xl overflow-hidden shadow-sm bg-white border border-slate-200 flex items-center justify-center relative group">
            <img
              src={activeImage}
              alt={activeProduct.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {activeProduct.stock === 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-rose-600 text-white font-black px-5 py-2 rounded-full uppercase tracking-widest text-xs shadow-lg">
                  {isBn ? 'স্টক নেই' : 'Out of Stock'}
                </span>
              </div>
            )}
          </div>

          {/* Gallery Thumbnails Filmstrip */}
          {activeProduct.imagesGallery && activeProduct.imagesGallery.length > 0 && (
            <div className="flex gap-3 mt-6 overflow-x-auto max-w-[400px] pb-1 scrollbar-none justify-center">
              {[activeProduct.image, ...activeProduct.imagesGallery].map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImage === imgUrl ? 'border-emerald-600 scale-105 shadow-md' : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Detailed Product Metadata, variants, stock indicators and write-review form */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-3.5 py-1 rounded-full uppercase tracking-wider">
                {isBn 
                  ? (activeProduct.category === 'birds' ? 'পাখি' : activeProduct.category === 'cats' ? 'বিড়াল' : activeProduct.category === 'fish' ? 'মাছ' : activeProduct.category === 'rabbits' ? 'খরগোশ' : activeProduct.category === 'accessories' ? 'একসেসরিজ' : 'সাপ্লিমেন্ট') 
                  : activeProduct.category}
              </span>
              {activeProduct.subcategory && (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200/55 px-3 py-1 rounded-full uppercase">
                  {activeProduct.subcategory}
                </span>
              )}
              {selectedVariant && (
                <span className="text-[10px] font-semibold text-slate-550 bg-slate-50 border border-slate-200/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Weight className="w-3.5 h-3.5 text-emerald-600" />
                  {selectedVariant}
                </span>
              )}
            </div>

            {/* Title & Brand */}
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {isBn ? activeProduct.banglaName : activeProduct.name}
              </h1>
              {activeProduct.brand && (
                <p className="text-xs text-slate-400 font-bold mt-1">
                  {isBn ? 'ব্র্যান্ড:' : 'Brand:'} <span className="text-emerald-700 uppercase">{activeProduct.brand}</span>
                </p>
              )}
            </div>

            {/* Ratings Summary */}
            <div className="flex items-center space-x-2.5">
              <div className="flex text-amber-450">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`w-4 h-4 ${s <= Math.round(activeProduct.rating) ? 'fill-current' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-xs font-black text-slate-800">{activeProduct.rating}</span>
              <span className="text-[11px] text-slate-400 font-bold">
                ({activeProduct.reviewsCount} {isBn ? 'টি কাস্টমার রিভিউ' : 'customer reviews'})
              </span>
            </div>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/30">
              <span className="text-3xl font-black text-emerald-800">৳{activeProduct.price} BDT</span>
              {activeProduct.originalPrice > activeProduct.price && (
                <span className="text-base text-slate-400 line-through font-semibold">৳{activeProduct.originalPrice}</span>
              )}
              {activeProduct.originalPrice > activeProduct.price && (
                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">
                  {isBn ? 'বিশেষ ডিসকাউন্ট অফার!' : 'Special Promo Deal!'}
                </span>
              )}
            </div>

            {/* Pack Size Variants Selector */}
            {activeProduct.variants && activeProduct.variants.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {isBn ? 'প্যাকেজিং সাইজ / ধরণ নির্বাচন করুন' : 'Select Pack Size / Variant Option:'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeProduct.variants.map((v, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-bold cursor-pointer ${
                        selectedVariant === v
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xxs'
                          : 'border-slate-200 bg-white text-slate-650 hover:border-slate-400'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product description block */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {isBn ? 'পণ্যের আকর্ষণীয় বিবরণ' : 'Product Description Overview'}
              </h3>
              <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                {isBn ? activeProduct.banglaDescription : activeProduct.description}
              </p>
            </div>

            {/* Inventory Status with customized stock progress meters */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>{isBn ? 'ইনভেন্টরি অবস্থা' : 'Stock Status'}</span>
                <span className="font-extrabold text-slate-700">
                  {activeProduct.stock > 0 
                    ? `${activeProduct.stock} ${isBn ? 'পিস স্টক আছে' : 'items left'}` 
                    : (isBn ? 'স্টক শেষ' : 'Out of stock')}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeProduct.stock > 20 
                      ? 'bg-emerald-500' 
                      : activeProduct.stock > 5 
                        ? 'bg-amber-500' 
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (activeProduct.stock / 50) * 100)}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* Primary Call-to-actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onAddToCart(activeProduct)}
              disabled={activeProduct.stock === 0}
              className={`flex-1 py-3.5 text-xs sm:text-sm rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border ${
                activeProduct.stock === 0
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-emerald-50/40 border-emerald-600 text-emerald-850 hover:-translate-y-0.5 shadow-xs'
              }`}
            >
              <Sparkles className="w-4.5 h-4.5 text-emerald-600" />
              <span>{isBn ? 'কার্টে রাখুন' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={() => {
                if (onBuyNow) {
                  onBuyNow(activeProduct);
                } else {
                  onAddToCart(activeProduct);
                }
              }}
              disabled={activeProduct.stock === 0}
              className={`flex-1 py-3.5 text-xs sm:text-sm rounded-xl font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                activeProduct.stock === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:-translate-y-0.5'
              }`}
            >
              <span>⚡</span>
              <span>{isBn ? 'এখনই কিনুন' : 'Buy Now'}</span>
            </button>

            <button
              onClick={() => onToggleWishlist(activeProduct)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${
                isFavorite 
                  ? 'bg-rose-50 border-rose-200 text-rose-500' 
                  : 'bg-white border-slate-250 text-slate-400 hover:text-rose-500'
              }`}
              title={isFavorite ? (isBn ? 'পছন্দ তালিকা থেকে সরান' : 'Remove Favorites') : (isBn ? 'পছন্দে যোগ করুন' : 'Add Favorites')}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Review Submission & Customer Reviews Feed Card */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
          <MessageCirclePlus className="w-5 h-5 text-emerald-600" />
          <span>{isBn ? 'গ্রাহক প্রতিক্রিয়া ও রিভিউ বুক' : 'Customer Reviews & Feedback'}</span>
        </h3>

        {/* Existing reviews */}
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 divide-y divide-slate-100">
          {!activeProduct.reviews || activeProduct.reviews.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">
              {isBn ? 'এই পণ্যে এখনও কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি লিখুন!' : 'No customer feedback yet. Be the first to express your thoughts!'}
            </p>
          ) : (
            activeProduct.reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-800">{rev.userName}</span>
                  <div className="flex text-amber-450">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed font-semibold">{rev.comment}</p>
                <p className="text-[9px] text-slate-400 font-bold">{new Date(rev.date).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>

        {/* Write a review form */}
        <div className="bg-slate-50/50 border border-slate-150 p-6 rounded-2xl space-y-4">
          <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'আপনার মূল্যবান মতামত শেয়ার করুন' : 'Write your Verified Feedback'}</span>
          </h4>

          {reviewMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-100 animate-fade-in">
              {reviewMessage}
            </div>
          )}

          <form onSubmit={handleReviewForm} className="space-y-3.5 text-xs font-bold text-slate-650">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label>{isBn ? 'আপনার নাম *' : 'Your Name *'}</label>
                <input
                  type="text" required value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={isBn ? 'যেমন: আবদুল্লাহ' : 'e.g. Abdullah'}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label>{isBn ? 'রেটিং নির্বাচন করুন' : 'Select Rating Score'}</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                  <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                  <option value="3">⭐⭐⭐ 3 - Satisfactory</option>
                  <option value="2">⭐⭐ 2 - Poor</option>
                  <option value="1">⭐ 1 - Terrible</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label>{isBn ? 'আপনার মন্তব্য *' : 'Your Review Message *'}</label>
              <textarea
                required rows={3} value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isBn ? 'পণ্যটির গুণমান সম্পর্কে আপনার মতামত লিখুন...' : 'Review on feed quality, packaging freshness, bird feedback...'}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
            >
              {submittingReview ? (isBn ? 'সংরক্ষণ করা হচ্ছে...' : 'Submitting Review...') : (isBn ? 'রিভিউ পোস্ট করুন' : 'Post Verified Review')}
            </button>
          </form>
        </div>
      </div>

      {/* Recommended/Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-emerald-600 rounded-full"></div>
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">
              {isBn ? 'অনুরূপ ক্যাটাগরির পণ্যসমূহ' : 'Recommended Related Feeds'}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  window.history.pushState({}, '', `/products/${p.slug || p.id}`);
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="bg-white p-4 rounded-2xl border border-slate-150 hover:border-emerald-600/40 hover:shadow-md transition-all cursor-pointer text-left space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-slate-150">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 min-h-[36px]">
                    {isBn ? p.banglaName : p.name}
                  </h4>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-sm font-black text-emerald-800">৳{p.price}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{p.stock > 0 ? (isBn ? 'স্টক আছে' : 'In stock') : (isBn ? 'স্টক শেষ' : 'Out')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
