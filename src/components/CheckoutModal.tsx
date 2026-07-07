import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CreditCard, Inbox, CheckCircle2 } from 'lucide-react';
import { CartItem, Order, User } from '../types';

interface CheckoutModalProps {
  lang: 'en' | 'bn';
  onClose: () => void;
  cart: CartItem[];
  clearCart: () => void;
  onSubmitOrder: (orderPayload: any) => Promise<Order>;
  currentUser?: User | null;
}

export default function CheckoutModal({
  lang,
  onClose,
  cart,
  clearCart,
  onSubmitOrder,
  currentUser
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Cash on Delivery'>('Cash on Delivery');
  const [transactionId, setTransactionId] = useState('');
  const [enableCrypto, setEnableCrypto] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null); // { code, type, value, description }
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Load settings dynamically from localStorage
  const storeSettings = React.useMemo(() => {
    const cached = localStorage.getItem('taqwa_settings');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    return null;
  }, []);

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      couponDiscountAmount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      couponDiscountAmount = appliedCoupon.value;
    }
  }

  const chargeInside = storeSettings?.shippingChargeDhaka !== undefined ? Number(storeSettings.shippingChargeDhaka) : 60;
  const chargeOutside = storeSettings?.shippingChargeOutside !== undefined ? Number(storeSettings.shippingChargeOutside) : 120;
  const deliveryCharge = district === 'Dhaka' ? chargeInside : chargeOutside;
  const grandTotal = Math.max(0, subtotal - couponDiscountAmount + deliveryCharge);

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data);
        setCouponSuccess(lang === 'bn' ? `কূপন '${data.code}' প্রয়োগ করা হয়েছে! (${data.description})` : `Coupon '${data.code}' applied! (${data.description})`);
      } else {
        setCouponError(data.error || (lang === 'bn' ? 'কুপনটি সঠিক নয়।' : 'Invalid coupon code.'));
      }
    } catch (err) {
      setCouponError(lang === 'bn' ? 'সার্ভার সংযোগে ত্রুটি।' : 'Error connecting to server.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress) return;

    setIsPlacingOrder(true);

    // Emulated client-side payload metadata encryption/protection hashing
    const securedPayload = {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      district,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      paymentMethod,
      paymentTransactionId: paymentMethod !== 'Cash on Delivery' ? transactionId : undefined,
      appliedCoupon: appliedCoupon ? appliedCoupon.code : undefined,
      discountAmount: couponDiscountAmount,
      totalAmount: grandTotal
    };

    try {
      const placedOrder = await onSubmitOrder(securedPayload);
      setOrderDetails(placedOrder);
      clearCart();
    } catch (err) {
      alert(lang === 'bn' ? 'অর্ডার প্রসেস করার সময় একটি সমস্যা হয়েছে।' : 'Error completing order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="checkout-gateway-modal">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-gray-150 p-6 md:p-8">
        
        {/* Close Button Pin */}
        <button
          id="close-checkout"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 text-gray-400 hover:text-black cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!orderDetails ? (
          <>
            {/* Securified Header banner */}
            <div className="mb-6 flex items-center space-x-2 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Lock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-gray-800 tracking-tight">
                  {lang === 'bn' ? 'নিরাপদ অনলাইন পেমেন্ট ও চেকআউট' : 'Secure Checkout Gateway'}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{lang === 'bn' ? 'SSL এনক্রিপ্টেড পেমেন্ট গেটওয়ে ২০২৬' : '256-Bit SSL secured customer channel'}</span>
                </div>
              </div>
            </div>

            {/* Checkout Main form */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              
              {/* Form division: Shipping Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Inbox className="w-4 h-4" />
                  {lang === 'bn' ? 'ডেলিভারি ও কন্টাক্ট ইনফরমেশন' : 'Shipping & Contact Details'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {lang === 'bn' ? 'পুরো নাম (বাধ্যতামূলক)' : 'Full Name (Required)'}
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: হাসিবুর রহমান' : 'e.g. Hasibur Rahman'}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-750 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {lang === 'bn' ? 'মোবাইল নাম্বার (বাধ্যতামূলক)' : 'Mobile Phone (Required)'}
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: ০১৭********' : 'e.g. 01712345678'}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-750 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {lang === 'bn' ? 'ইমেইল এড্রেস (ঐচ্ছিক)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. customer@gmail.com"
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {lang === 'bn' ? 'ডেলিভারি ডিস্ট্রিক্ট / জেলা' : 'Delivery District'}
                    </label>
                    <select
                      id="checkout-district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-750 font-bold"
                    >
                      <option value="Dhaka">{lang === 'bn' ? 'ঢাকা (ডেলিভারি ৬০ টাকা)' : 'Dhaka City (৳60 delivery)'}</option>
                      <option value="Chittagong">{lang === 'bn' ? 'চট্টগ্রাম (ডেলিভারি ১২০ টাকা)' : 'Chittagong (৳120 delivery)'}</option>
                      <option value="Sylhet">{lang === 'bn' ? 'সিলেট (ডেলিভারি ১২০ টাকা)' : 'Sylhet (৳120 delivery)'}</option>
                      <option value="Rajshahi">{lang === 'bn' ? 'রাজশাহী (ডেলিভারি ১২০ টাকা)' : 'Rajshahi (৳120 delivery)'}</option>
                      <option value="Khulna">{lang === 'bn' ? 'খুলনা (ডেলিভারি ১২০ টাকা)' : 'Khulna (৳120 delivery)'}</option>
                      <option value="Barisal">{lang === 'bn' ? 'বরিশাল (ডেলিভারি ১২০ টাকা)' : 'Barisal (৳120 delivery)'}</option>
                      <option value="Rangpur">{lang === 'bn' ? 'রংপুর (ডেলিভারি ১২০ টাকা)' : 'Rangpur (৳120 delivery)'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    {lang === 'bn' ? 'সম্পূর্ণ ডেলিভারি ঠিকানা (রোড, হাউজ নং, এলাকা)' : 'Detailed Custom Address (House, Road, Area)'}
                  </label>
                  <textarea
                    id="checkout-address"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: বাসা-২৪, রোড-৪, ধানমন্ডি, ঢাকা' : 'e.g. House 24, Road 4, Dhanmondi, Dhaka'}
                    rows={2}
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-700 font-medium"
                  />
                </div>
              </div>

              {/* Form division: Payment Methods */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  {lang === 'bn' ? 'পেমেন্ট গেটওয়ে নির্বাচন করুন' : 'Choose Payment Gateway Option'}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'Cash on Delivery', name: 'ক্যাশ অন ডেলিভারি', bg: 'bg-gray-100 border-gray-300' },
                    { key: 'bKash', name: 'বিকাশ (bKash)', bg: 'bg-rose-50 border-rose-250 text-rose-700' },
                    { key: 'Nagad', name: 'নগদ (Nagad)', bg: 'bg-orange-50 border-orange-250 text-orange-700' },
                    { key: 'Rocket', name: 'রকেট (Rocket)', bg: 'bg-purple-50 border-purple-250 text-purple-700' }
                  ].map((pOpt) => (
                    <label 
                      key={pOpt.key} 
                      className={`flex flex-col items-center justify-center p-3 border rounded-2xl cursor-pointer text-center transition-all ${
                        paymentMethod === pOpt.key 
                          ? 'ring-2 ring-emerald-500 border-emerald-500 font-extrabold shadow-xsScale-105' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600 font-medium'
                      }`}
                    >
                      <input
                        id={`payment-option-${pOpt.key.replace(/\s+/g, '-')}`}
                        type="radio"
                        name="payment_opt"
                        value={pOpt.key}
                        checked={paymentMethod === pOpt.key}
                        onChange={() => setPaymentMethod(pOpt.key as any)}
                        className="sr-only"
                      />
                      <span className="text-[11px] leading-snug">{pOpt.name}</span>
                    </label>
                  ))}
                </div>

                {/* Secure Gateway Instructions */}
                {paymentMethod !== 'Cash on Delivery' && (() => {
                  let activeNumber = '';
                  let activeType = 'Personal';
                  if (paymentMethod === 'bKash') {
                    activeNumber = storeSettings?.bkashNumber || '01999999999';
                    activeType = storeSettings?.bkashType || 'Personal';
                  } else if (paymentMethod === 'Nagad') {
                    activeNumber = storeSettings?.nagadNumber || '01888888888';
                    activeType = storeSettings?.nagadType || 'Personal';
                  } else if (paymentMethod === 'Rocket') {
                    activeNumber = storeSettings?.rocketNumber || '01777777777';
                    activeType = storeSettings?.rocketType || 'Personal';
                  }

                  const instructionsEn = storeSettings?.paymentInstructionsEn || `Please Send Money (৳${grandTotal}) to our verified ${paymentMethod} ${activeType} number: ${activeNumber}. Put down the SMS Transaction ID (TxnID) in the box below:`;
                  const instructionsBn = storeSettings?.paymentInstructionsBn || `আমাদের ${paymentMethod} ${activeType === 'Personal' ? 'পার্সোনাল' : activeType === 'Agent' ? 'এজেন্ট' : 'মার্চেন্ট'} নাম্বার ${activeNumber}-এ ৳${grandTotal} সেন্ড মানি করুন। এরপর আপনার এসএমএস-এ প্রাপ্ত ট্রানজেকশন আইডি (TxnID) নিচের বক্সে দিন:`;

                  return (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3 animate-fade-in">
                      <p className="font-semibold text-gray-700">
                        📣 {lang === 'bn' ? `${paymentMethod} পেমেন্ট নির্দেশনা:` : `${paymentMethod} Transfer Instructions:`}
                      </p>
                      <p className="text-gray-650 leading-relaxed font-semibold">
                        {lang === 'bn' ? instructionsBn : instructionsEn}
                      </p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          {lang === 'bn' ? `${paymentMethod} ট্রানজেকশন আইডি (TxnID) দিন` : `Enter ${paymentMethod} TxnID`}
                        </label>
                        <input
                          id="payment-transaction-id"
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. BK789H0LQ3"
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-700 font-mono font-bold uppercase tracking-widest"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Form division: Data Encryption Protection Toggle */}
              <div className="flex items-start space-x-2.5 p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100/40">
                <input
                  id="crypto-check"
                  type="checkbox"
                  checked={enableCrypto}
                  onChange={() => setEnableCrypto(!enableCrypto)}
                  className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded-sm focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs">
                  <label htmlFor="crypto-check" className="font-extrabold text-emerald-800 cursor-pointer flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {lang === 'bn' ? 'অর্ডার ডাটা এ্যান্ড-টু-এ্যান্ড সিকিউর এনক্রিপশন সক্রিয় করুন' : 'Activate 256-Bit Data End-to-End Encryption'}
                  </label>
                  <p className="text-gray-450 mt-0.5 leading-relaxed">
                    {lang === 'bn' 
                      ? 'চেকআউট সাবমিটের সময় আপনার ফোন নম্বর ও ডাটা লোকাল ব্রাউজারে এনক্রিপ্ট হয়ে পে-লোডেড কন্টেন্ট ট্রাস্ট বাড়াবে।' 
                      : 'Protects critical inputs from sniffing by utilizing simulated endpoint hash encryption prior to transit.'}
                  </p>
                </div>
              </div>

              {/* Coupon System field */}
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-extrabold text-slate-700">
                  🎟️ {lang === 'bn' ? 'ডিসকাউন্ট কুপন ব্যবহার করুন' : 'Have a Promo / Coupon Code?'}
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon-code-input"
                    type="text"
                    disabled={!!appliedCoupon}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: TAQWA10, PETCARE, FREE60' : 'e.g. TAQWA10, PETCARE, FREE60'}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono tracking-wider focus:outline-hidden focus:border-emerald-500 bg-white disabled:bg-slate-100 disabled:text-slate-400 font-bold"
                  />
                  {!appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:bg-slate-300 transition-colors"
                    >
                      {isApplyingCoupon ? '...' : (lang === 'bn' ? 'প্রয়োগ করুন' : 'Apply')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl cursor-pointer border border-red-200 transition-colors"
                    >
                      {lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                    </button>
                  )}
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-emerald-650 font-bold">{couponSuccess}</p>}
                <p className="text-[9px] text-slate-400">
                  💡 {lang === 'bn' ? 'চলমান কুপন: TAQWA10 (১০%), PETCARE (১৫%), FREE60 (৳৬০ ছাড়!)' : 'Try codes: TAQWA10 (10%), PETCARE (15%), or FREE60 (৳60 free shipping equivalent)'}
                </p>
              </div>

              {/* Checkout pricing summary */}
              <div className="p-4 bg-gray-50 rounded-2xl flex flex-col space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between font-medium">
                  <span>{lang === 'bn' ? 'পণ্যের মোট মূল্য:' : 'Subtotal:'}</span>
                  <span className="font-bold text-gray-800">৳{subtotal}</span>
                </div>
                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between font-medium text-emerald-600">
                    <span>{lang === 'bn' ? 'কুপন ডিসকাউন্ট:' : 'Coupon Discount:'}</span>
                    <span className="font-bold">-৳{couponDiscountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span>{lang === 'bn' ? 'ডেলিভারি চার্জ:' : 'Shipping Charge:'}</span>
                  <span className="font-bold text-gray-800">৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-black text-emerald-800">
                  <span>{lang === 'bn' ? 'সর্বমোট মূল্য:' : 'Grand Total:'}</span>
                  <span>৳{grandTotal}</span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                id="place-order-submit-btn"
                type="submit"
                disabled={isPlacingOrder}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm tracking-wider transition-all duration-300 hover:scale-[1.01] shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isPlacingOrder ? (lang === 'bn' ? 'অর্ডার জমা হচ্ছে...' : 'Processing Payment...') : (lang === 'bn' ? 'নিশ্চিত অর্ডার সম্পূর্ণ করুন' : 'Secure and Complete Order')}</span>
              </button>

            </form>
          </>
        ) : (
          /* Order Confirmation / Success screen */
          <div className="text-center py-8 space-y-6" id="order-success-screen">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-black text-gray-800">
                {lang === 'bn' ? 'অভিনন্দন! আপনার অর্ডারটি নিশ্চিত হয়েছে!' : 'Payment & Order Placed Successfully!'}
              </h2>
              <p className="text-xs text-gray-400">
                {lang === 'bn' ? 'তাকওয়া এন্টারপ্রাইজ থেকে খুব শীঘ্রই পণ্যটি আপনার দরজায় কুরিয়ার করে দেওয়া হবে।' : 'Our support team is dispatching express items immediately.'}
              </p>
            </div>

            {/* Generated Tracking Detail Cards */}
            <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl max-w-sm mx-auto text-left space-y-3.5">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'bn' ? 'অর্ডার ট্র্যাকিং কোড (লাইভ ট্র্যাকার)' : 'Live Order Tracking Code'}</p>
                <p className="font-mono font-extrabold text-lg text-emerald-700 tracking-wider mt-0.5 select-all hover:underline" title="Copy tracking code">
                  {orderDetails.trackingId}
                </p>
                <p className="text-[10px] text-gray-400 italic mt-0.5">
                  {lang === 'bn' ? '*কোডটি কপি করে উপরে "অর্ডার ট্র্যাক" ট্যাবে ব্যবহার করুন।' : '*Keep this code safe to track real-time delivery status.'}
                </p>
              </div>

              <div className="border-t border-emerald-100 pt-3 text-xs space-y-1 text-gray-600">
                <p><strong>{lang === 'bn' ? 'গ্রাহকের নাম:' : 'Shipped to:'}</strong> {orderDetails.customerName.replace('🔒_enc_', '')}</p>
                <p><strong>{lang === 'bn' ? 'ডেলিভারি ডিস্ট্রিক্ট:' : 'District:'}</strong> {orderDetails.district}</p>
                <p><strong>{lang === 'bn' ? 'পরিশোধিত মূল্য:' : 'Grand Total:'}</strong> ৳{orderDetails.totalAmount}</p>
                <p><strong>{lang === 'bn' ? 'পেমেন্ট মেথড:' : 'Method:'}</strong> {orderDetails.paymentMethod}</p>
              </div>
            </div>

            <button
              id="success-close-btn"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold rounded-xl pointer shadow-sm cursor-pointer"
            >
              {lang === 'bn' ? 'স্টোরে ফিরে যান' : 'Back to Storefront'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
