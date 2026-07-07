import React from 'react';
import { ArrowLeft, Trash2, Plus, Minus, Lock, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartPageProps {
  cart: CartItem[];
  lang: 'en' | 'bn';
  onUpdateCartQty: (productId: string, delta: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onBack: () => void;
  onProceedToCheckout: () => void;
}

export default function CartPage({
  cart = [],
  lang,
  onUpdateCartQty,
  onRemoveFromCart,
  onBack,
  onProceedToCheckout
}: CartPageProps) {
  const isBn = lang === 'bn';

  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="py-20 text-center space-y-6 max-w-md mx-auto animate-fade-in" id="cart-page-empty">
        <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-extrabold text-slate-800 text-base">
            {isBn ? 'আপনার শপিং কার্ট খালি!' : 'Your Shopping Cart is Empty!'}
          </h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            {isBn 
              ? 'তাকওয়া এন্টারপ্রাইজ থেকে শতভাগ খাঁটি ও আমদানিকৃত বীজ, পাখির প্রিমিয়াম ফিড, এবং প্রয়োজনীয় এক্সেসরিজ পছন্দ করতে আমাদের স্টোর ভিজিট করুন।' 
              : 'Add chemical-free import feeds, Timothy hays, or veterinary capsules to initiate your custom checkout ledger.'}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
        >
          {isBn ? 'স্টোরে ফিরে যান' : 'Browse Storefront Catalog'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="cart-page-viewport">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-600" />
            <span>{isBn ? 'আপনার শপিং কার্ট' : 'Your Shopping Cart'}</span>
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">
            {isBn 
              ? 'আপনার নির্বাচিত পণ্যসমূহের পরিমাণ সংশোধন করুন এবং অর্ডারে অগ্রসর হোন।' 
              : 'Review your selected premium products, packaging adjustments, and subtotal calculations.'}
          </p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-650 hover:text-emerald-700 font-extrabold cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? 'আরও পণ্য যোগ করুন' : 'Continue Shopping'}</span>
        </button>
      </div>

      {/* Main Grid: Left Column for items, Right Column for pricing invoice summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Items container card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-4 sm:p-6 divide-y divide-slate-100">
            {cart.map((item) => (
              <div 
                key={item.product.id} 
                className="py-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                {/* Product Meta */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-800 truncate leading-snug">
                      {isBn ? item.product.banglaName : item.product.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {isBn ? 'ইউনিট মূল্য: ' : 'Unit Price: '} 
                      <span className="text-emerald-700 font-extrabold">৳{item.product.price}</span>
                    </p>
                  </div>
                </div>

                {/* Pricing & Controls */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-x-6 gap-y-2 flex-wrap shrink-0">
                  
                  {/* Quantity Toggles */}
                  <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
                    <button
                      onClick={() => onUpdateCartQty(item.product.id, -1)}
                      className="p-1.5 hover:bg-white text-slate-500 hover:text-black rounded-md transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-black text-slate-800 px-2.5 min-w-[24px] text-center font-mono">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateCartQty(item.product.id, 1)}
                      className="p-1.5 hover:bg-white text-slate-500 hover:text-black rounded-md transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total line */}
                  <div className="text-right min-w-[80px]">
                    <p className="text-sm font-black text-slate-800">৳{item.product.price * item.quantity}</p>
                  </div>

                  {/* Delete trigger button */}
                  <button
                    onClick={() => onRemoveFromCart(item.product.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                    title={isBn ? 'কার্ট থেকে সরান' : 'Remove from cart'}
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>

                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pricing calculations invoices ledger summaries */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              {isBn ? 'অর্ডার ইনভয়েস সারসংক্ষেপ' : 'Order Invoice Summary'}
            </h3>

            <div className="space-y-2.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>{isBn ? 'উপমোট মূল্য:' : 'Subtotal:'}</span>
                <span className="font-extrabold text-slate-800">৳{cartSubtotal} BDT</span>
              </div>
              <div className="flex justify-between">
                <span>{isBn ? 'শিপিং কুরিয়ার চার্জ:' : 'Estimated Shipping:'}</span>
                <span className="font-bold text-slate-700">৳{isBn ? '৬০ / ১২০ BDT' : '60 / 120 BDT'}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-normal mt-1 border-b border-slate-50 pb-2.5">
                {isBn 
                  ? '💡 ঢাকা সিটির ভিতরে ৬০ টাকা এবং ঢাকা সিটির বাইরে ১২০ টাকা।' 
                  : '💡 Dhaka city delivery is 60 BDT, outside of Dhaka is 120 BDT.'}
              </p>
              <div className="flex justify-between text-sm font-black text-emerald-850 pt-2">
                <span>{isBn ? 'সর্বমোট প্রদেয় মূল্য (আনুমানিক):' : 'Estimated Total:'}</span>
                <span>৳{cartSubtotal} BDT</span>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
              id="cart-checkout-proceed-btn"
            >
              <Lock className="w-4 h-4" />
              <span>{isBn ? 'চেকআউটে অগ্রসর হোন' : 'Proceed to Secure Checkout'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
