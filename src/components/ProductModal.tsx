import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles, MessageCirclePlus, Weight, FileText, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product;
  lang: 'en' | 'bn';
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onReviewSubmit: (productId: string, userName: string, rating: number, comment: string, reviewId?: string) => Promise<void>;
  isFavorite: boolean;
  onToggleWishlist: (product: Product) => void;
  products?: Product[];
}

export default function ProductModal({
  product,
  lang,
  onClose,
  onAddToCart,
  onBuyNow,
  onReviewSubmit,
  isFavorite,
  onToggleWishlist,
  products = []
}: ProductModalProps) {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // Active product states for variants and gallery switching inside modal itself
  const [activeProduct, setActiveProduct] = useState<Product>(product);
  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || product.weight || 'Default');

  useEffect(() => {
    setActiveProduct(product);
    setActiveImage(product.image);
    setSelectedVariant(product.variants?.[0] || product.weight || 'Default');
    setReviewMessage('');
  }, [product]);

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
      setReviewMessage(lang === 'bn' ? 'রিভিউটি সফলভাবে সংরক্ষণ হয়েছে! ধন্যবাদ।' : 'Review action processed successfully! Thank you.');
    } catch (err) {
      setReviewMessage(lang === 'bn' ? 'দুঃখিত, পুনরায় চেষ্টা করুন।' : 'Failed to submit feedback.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto animate-fade-in"
      id={`product-modal-${activeProduct.id}`}
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full my-8 shadow-2xl relative border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Close Button Pin */}
        <button
          id="close-product-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full border border-gray-200 text-gray-500 hover:text-black hover:scale-105 transition-all shadow-xs cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Upper Two-Column Layout */}
        <div className="flex flex-col md:flex-row border-b border-gray-100">
          
          {/* Left Side: Product Shot & Gallery */}
          <div className="w-full md:w-1/2 p-6 md:p-8 bg-gray-50 flex flex-col items-center justify-center relative">
            <div className="aspect-square w-full max-w-[340px] rounded-2xl overflow-hidden shadow-xs bg-white border border-gray-150 flex items-center justify-center relative">
              <img
                src={activeImage}
                alt={activeProduct.name}
                className="w-full h-full object-cover transition-all"
                referrerPolicy="no-referrer"
              />
              {activeProduct.stock === 0 && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="bg-red-650 text-white font-bold px-4 py-1.5 rounded-full uppercase tracking-wider text-xs shadow-md">
                    {lang === 'bn' ? 'স্টক নেই' : 'Out of Stock'}
                  </span>
                </div>
              )}
            </div>

            {/* Gallery Filmstrip */}
            {activeProduct.imagesGallery && activeProduct.imagesGallery.length > 0 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto max-w-[340px] pb-1 scrollbar-thin">
                {activeProduct.imagesGallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImage === imgUrl ? 'border-emerald-600 scale-105 shadow-xs' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Product Details & Variant selectors */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Category & Subcategory Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase">
                  {lang === 'bn' 
                    ? (activeProduct.category === 'birds' ? 'পাখি' : activeProduct.category === 'cats' ? 'বিড়াল' : activeProduct.category === 'fish' ? 'মাছ' : activeProduct.category === 'rabbits' ? 'खरগোশ' : activeProduct.category === 'accessories' ? 'একসেসরিজ' : 'সাপ্লিমেন্ট') 
                    : activeProduct.category}
                </span>
                {activeProduct.subcategory && (
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase">
                    {activeProduct.subcategory}
                  </span>
                )}
                {selectedVariant && (
                  <span className="text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    {selectedVariant}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg md:text-xl font-black text-gray-950 leading-tight mb-2">
                {lang === 'bn' ? activeProduct.banglaName : activeProduct.name}
              </h2>

              {/* Ratings summary */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex text-amber-450">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      className={`w-3.5 h-3.5 ${s <= Math.round(activeProduct.rating) ? 'fill-current' : 'text-gray-200'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-800">{activeProduct.rating}</span>
                <span className="text-[11px] text-gray-400">({activeProduct.reviewsCount} {lang === 'bn' ? 'গ্রাহক রিভিউ' : 'customer reviews'})</span>
              </div>

              {/* Prices */}
              <div className="flex items-baseline space-x-2.5 mb-4 p-3.5 bg-emerald-50/50 rounded-2xl">
                <span className="text-2xl font-black text-emerald-800">৳{activeProduct.price}</span>
                {activeProduct.originalPrice > activeProduct.price && (
                  <span className="text-sm text-gray-400 line-through font-semibold">৳{activeProduct.originalPrice}</span>
                )}
                {activeProduct.originalPrice > activeProduct.price && (
                  <span className="text-xs font-extrabold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                    {lang === 'bn' ? 'বিশেষ ছাড়!' : 'Special Discount!'}
                  </span>
                )}
              </div>

              {/* Variants Selector */}
              {activeProduct.variants && activeProduct.variants.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {lang === 'bn' ? 'প্যাকেজিং সাইজ / ধরণ নির্বাচন করুন' : 'Choose Pack Size / Variant:'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeProduct.variants.map((v, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all font-semibold cursor-pointer ${
                          selectedVariant === v
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Tab */}
              <div className="mb-4.5">
                <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {lang === 'bn' ? 'পণ্যের বিবরণ' : 'Product Details'}
                </h3>
                <p className="text-xs text-gray-650 leading-relaxed font-medium">
                  {lang === 'bn' ? activeProduct.banglaDescription : activeProduct.description}
                </p>
              </div>

              {/* Stock Level Warning Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[11px] font-medium text-gray-500 mb-1">
                  <span>{lang === 'bn' ? 'ইনভেন্টরি অবস্থা' : 'Stock Availability'}</span>
                  <span className="font-semibold">{activeProduct.stock > 0 ? `${activeProduct.stock} ${lang === 'bn' ? 'পিস স্টক আছে' : 'items left'}` : (lang === 'bn' ? 'স্টক শেষ' : 'Out of stock')}</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeProduct.stock > 20 
                        ? 'bg-emerald-500' 
                        : activeProduct.stock > 5 
                          ? 'bg-amber-500' 
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (activeProduct.stock / 50) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              {/* Action button triggers (Add to Cart, Buy Now, Wishlist) */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  id={`modal-add-to-cart-btn-${activeProduct.id}`}
                  onClick={() => {
                    onAddToCart(activeProduct);
                    onClose();
                  }}
                  disabled={activeProduct.stock === 0}
                  className={`flex-1 py-3 text-xs sm:text-sm rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border ${
                    activeProduct.stock === 0
                      ? 'bg-gray-150 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white hover:bg-emerald-50/50 border-emerald-600 text-emerald-800 hover:-translate-y-0.5'
                  }`}
                >
                  <Sparkles className="w-4.5 h-4.5 text-emerald-600" />
                  <span>{lang === 'bn' ? 'কার্টে রাখুন' : 'Add to Cart'}</span>
                </button>

                <button
                  id={`modal-buy-now-btn-${activeProduct.id}`}
                  onClick={() => {
                    if (onBuyNow) {
                      onBuyNow(activeProduct);
                    } else {
                      onAddToCart(activeProduct);
                    }
                    onClose();
                  }}
                  disabled={activeProduct.stock === 0}
                  className={`flex-1 py-3 text-xs sm:text-sm rounded-xl font-black flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    activeProduct.stock === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-750 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  <span>⚡</span>
                  <span>{lang === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}</span>
                </button>

                <button
                  onClick={() => onToggleWishlist(activeProduct)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${
                    isFavorite 
                      ? 'bg-red-50 border-red-200 text-red-500' 
                      : 'bg-white border-gray-200 text-slate-400 hover:text-red-400'
                  }`}
                  title={isFavorite ? (lang === 'bn' ? 'পছন্দ তালিকা থেকে সরান' : 'Remove from Favorites') : (lang === 'bn' ? 'পছন্দে যোগ করুন' : 'Add to Favorites')}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

            {/* Dynamic Write Review Section */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-1.5">
                <MessageCirclePlus className="w-4.5 h-4.5 text-emerald-600" />
                {lang === 'bn' ? 'গ্রাহক মতামত ও রিভিউ লিখুন' : 'Submit Product Review'}
              </h3>
              
              {reviewMessage && (
                <div className="mb-4 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  {reviewMessage}
                </div>
              )}

              <form onSubmit={handleReviewForm} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
                    </label>
                    <input
                      id="review-name"
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: রাফসান আহমেদ' : 'e.g. John Doe'}
                      className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {lang === 'bn' ? 'রেটিং দিন (স্টার)' : 'Product Rating'}
                    </label>
                    <select
                      id="review-rating"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500 text-gray-700 font-semibold"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (৫/৫)</option>
                      <option value="4">⭐⭐⭐⭐ (৪/৫)</option>
                      <option value="3">⭐⭐⭐ (৩/৫)</option>
                      <option value="2">⭐⭐ (২/৫)</option>
                      <option value="1">⭐ (১/৫)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    {lang === 'bn' ? 'আপনার মূল্যবান মন্তব্য' : 'Comment'}
                  </label>
                  <textarea
                    id="review-comment"
                    required
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={lang === 'bn' ? 'এই পোষা খাদ্যের মান ও কার্যকারিতা নিয়ে আপনার অনুভূতি লিখুন...' : 'Write about product freshness, quality, packing...'}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-700"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="submit-review-btn"
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold cursor-pointer transition-colors"
                  >
                    {submittingReview ? (lang === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...') : (
                      editingReviewId 
                        ? (lang === 'bn' ? 'রিভিউ হালনাগাদ করুন' : 'Update Review') 
                        : (lang === 'bn' ? 'রিভিউ ও মন্তব্য যোগ করুন' : 'Submit Review')
                    )}
                  </button>
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReviewId(null);
                        setUserName('');
                        setRating(5);
                        setComment('');
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                    >
                      {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                  )}
                </div>
              </form>
            </div>
 
            {/* Historic Reviews Shelf */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center justify-between">
                <span>{lang === 'bn' ? 'অন্যান্য গ্রাহক রিভিউসমূহ' : 'Recent Reviews'} ({activeProduct.reviews?.length || 0})</span>
                {editingReviewId && (
                  <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 animate-pulse">
                    {lang === 'bn' ? '✍️ সম্পাদনা মুড সক্রিয়' : '✍️ Edit Mode Active'}
                  </span>
                )}
              </h3>
              
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                {(!activeProduct.reviews || activeProduct.reviews.length === 0) ? (
                  <p className="text-xs text-gray-400 italic">
                    {lang === 'bn' ? 'এই প্রোডাক্টে এখনও কোনো রিভিউ নেই। আপনার রিভিউ প্রথম যোগ করুন!' : 'No reviews yet. Be the first to leave a feedback!'}
                  </p>
                ) : (
                  activeProduct.reviews.map((rev) => (
                    <div key={rev.id} className="bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100 relative group animate-fade-in">
                      <div className="flex justify-between items-start mb-1.5">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-extrabold text-gray-850">{rev.userName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReviewId(rev.id);
                                setUserName(rev.userName);
                                setRating(rev.rating);
                                setComment(rev.comment);
                                // scroll form into view
                                const formEl = document.getElementById('review-name');
                                if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }}
                              className="text-[10px] text-emerald-600 hover:text-emerald-800 font-extrabold underline cursor-pointer"
                              title={lang === 'bn' ? 'রিভিউটি সংশোধন করুন' : 'Edit comments'}
                            >
                              {lang === 'bn' ? 'সংশোধন' : 'Edit'}
                            </button>
                          </div>
                          <div className="flex text-amber-400 text-[10px] mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">{rev.date}</span>
                      </div>
                      <p className="text-xs text-gray-650 leading-relaxed font-medium">"{rev.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        </div> {/* Closes upper row flex flex-col md:flex-row container */}

        {/* RELATED PRODUCTS DRAWER (Bottom shelf) */}
        {products && products.filter(p => p.category === activeProduct.category && p.id !== activeProduct.id).length > 0 && (
          <div className="bg-slate-50 p-6 md:p-8 border-t border-gray-150 rounded-b-3xl">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-650 animate-pulse" />
              {lang === 'bn' ? 'সংশ্লিষ্ট অন্যান্য পণ্যসমূহ (Related Products)' : 'Related Premium Products'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {products
                .filter(p => p.category === activeProduct.category && p.id !== activeProduct.id)
                .slice(0, 3)
                .map((relProd) => (
                  <div
                    key={relProd.id}
                    onClick={() => {
                      setActiveProduct(relProd);
                      setActiveImage(relProd.image);
                      setSelectedVariant(relProd.variants?.[0] || relProd.weight || 'Default');
                      // Scroll to top of modal container
                      const m = document.getElementById(`product-modal-${activeProduct.id}`);
                      if (m) m.scrollTop = 0;
                    }}
                    className="bg-white p-3.5 rounded-2xl border border-gray-150 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3.5 group"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                      <img
                        src={relProd.image}
                        alt={relProd.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                        {lang === 'bn' ? relProd.banglaName : relProd.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-black text-emerald-800">৳{relProd.price}</span>
                        {relProd.originalPrice > relProd.price && (
                          <span className="text-[10px] text-gray-450 line-through">৳{relProd.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
