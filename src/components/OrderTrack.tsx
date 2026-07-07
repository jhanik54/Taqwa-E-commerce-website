import React, { useState } from 'react';
import { Search, MapPin, Truck, Calendar, ShoppingBag, PackageCheck, AlertTriangle } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackProps {
  lang: 'en' | 'bn';
  onTrackOrder: (id: string) => Promise<Order | null>;
  initialTrackingId?: string;
}

export default function OrderTrack({ lang, onTrackOrder, initialTrackingId }: OrderTrackProps) {
  const [trackingInput, setTrackingInput] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [errorText, setErrorText] = useState('');
  const [searching, setSearching] = useState(false);

  // Auto track on mount if initialTrackingId is loaded
  React.useEffect(() => {
    if (initialTrackingId) {
      setTrackingInput(initialTrackingId);
      const autoTrack = async () => {
        setSearching(true);
        setErrorText('');
        setActiveOrder(null);
        try {
          const orderMatch = await onTrackOrder(initialTrackingId);
          if (orderMatch) {
            setActiveOrder(orderMatch);
          } else {
            setErrorText(lang === 'bn' 
              ? 'দুঃখিত, ওই ট্র্যাকিং আইডি দেওয়া কোনো অর্ডার ডিকশনারিতে পাওয়া যায়নি। আবার টাইপ করুন।' 
              : 'Order Tracking ID not found. Ensure ID syntax looks like TQW-78326-DH.');
          }
        } catch (err) {
          setErrorText(lang === 'bn' ? 'অর্ডার ট্র্যাক সফল করা যায়নি।' : 'Tracking search failed.');
        } finally {
          setSearching(false);
        }
      };
      autoTrack();
    }
  }, [initialTrackingId]);

  // Search Action
  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;

    setSearching(true);
    setErrorText('');
    setActiveOrder(null);

    try {
      const orderMatch = await onTrackOrder(trackingInput.trim());
      if (orderMatch) {
        setActiveOrder(orderMatch);
      } else {
        setErrorText(lang === 'bn' 
          ? 'দুঃখিত, ওই ট্র্যাকিং আইডি দেওয়া কোনো অর্ডার ডিকশনারিতে পাওয়া যায়নি। আবার টাইপ করুন।' 
          : 'Order Tracking ID not found. Ensure ID syntax looks like TQW-78326-DH.');
      }
    } catch (err) {
      setErrorText(lang === 'bn' ? 'অর্ডার ট্র্যাক সফল করা যায়নি।' : 'Tracking search failed.');
    } finally {
      setSearching(false);
    }
  };

  // Define track stages
  const steps = [
    { key: 'Pending', enLabel: 'Order Received', bnLabel: 'অর্ডার নথিভুক্ত', descEn: 'We have received your request.', descBn: 'অর্ডারটি আমাদের সিস্টেমে যুক্ত হয়েছে।' },
    { key: 'Processing', enLabel: 'Custom Processing', bnLabel: 'প্যাকেজিং চলছে', descEn: 'Taqwa operators are bagging seeds/access.', descBn: 'অর্ডারের পণ্যসমূহ গুণগতমান বজায় রেখে প্যাকিং করা হচ্ছে।' },
    { key: 'Shipped', enLabel: 'Dispatched / Shipped', bnLabel: 'কুরিয়ারে হস্তান্তর', descEn: 'Handed to express logistics.', descBn: 'পণ্যগুলো দ্রুত হোম ডেলিভারির জন্য কুরিয়ারে পাঠানো হয়েছে।' },
    { key: 'Out for Delivery', enLabel: 'Out for Delivery', bnLabel: 'ডেলিভারি ম্যানের পথে', descEn: 'Rider is carrying to doorstep.', descBn: 'আমাদের ডেলিভারি রাইডার পণ্য নিয়ে আপনার ঠিকানার দিকে রওনা করেছে।' },
    { key: 'Delivered', enLabel: 'Delivered Successfully', bnLabel: 'ডেলিভারি সম্পন্ন', descEn: 'Safely handed over to owner.', descBn: 'পণ্যটি আপনার কাছে সফলভাবে হস্তান্তর করা সম্পন্ন হয়েছে।' }
  ];

  // Map active step
  const activeIndex = activeOrder 
    ? steps.findIndex(s => s.key === activeOrder.orderStatus)
    : 0;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl mx-auto shadow-xs border border-gray-100" id="order-tracking-stage">
      
      {/* Visual Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight flex items-center justify-center gap-2">
          <Truck className="w-6 h-6 text-emerald-600" />
          {lang === 'bn' ? 'রিয়েল-টাইম অর্ডার ট্র্যাকিং' : 'Real-Time Order Tracking'}
        </h2>
        <p className="text-xs text-gray-450 mt-1 font-medium">
          {lang === 'bn' ? 'আপনার অর্ডার নিশ্চিত করার ট্র্যাকিং আইডি দিয়ে লাইভ কুরিয়ার স্ট্যাটাস জানুন' : 'Check status, delivery courier timelines and sync logs instantly.'}
        </p>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleQuery} className="flex flex-col sm:flex-row gap-3.5 mb-8">
        <div className="flex-1 relative">
          <input
            id="order-tracking-input"
            type="text"
            placeholder={lang === 'bn' ? 'যেমন: TQW-78326-DH' : 'e.g. TQW-78326-DH'}
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-sm tracking-widest font-mono text-gray-700 font-bold"
          />
          <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
        </div>
        <button
          id="track-submit-btn"
          type="submit"
          disabled={searching}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-all shadow-xs cursor-pointer tracking-wider flex items-center justify-center gap-1.5 shrink-0"
        >
          {searching ? (lang === 'bn' ? 'খোঁজা হচ্ছে...' : 'Tracking...') : (lang === 'bn' ? 'ট্র্যাক করুন' : 'Track Status')}
        </button>
      </form>

      {/* Error Card */}
      {errorText && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-xs font-semibold flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Live Timeline Display */}
      {activeOrder && (
        <div className="space-y-8 animate-fade-in" id="order-tracking-result">
          
          {/* Order Snapshot Header Card */}
          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">{lang === 'bn' ? 'ট্র্যাকিং আইডি' : 'Tracking ID'}</p>
              <p className="font-mono font-extrabold text-emerald-800 tracking-wide mt-0.5">{activeOrder.trackingId}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">{lang === 'bn' ? 'কাস্টমার নাম' : 'Customer Name'}</p>
              <p className="font-extrabold text-gray-800 mt-0.5 truncate">{activeOrder.customerName}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">{lang === 'bn' ? 'অর্ডার মূল্য' : 'Grand Total'}</p>
              <p className="font-black text-gray-800 mt-0.5">৳{activeOrder.totalAmount}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">{lang === 'bn' ? 'পেমেন্ট গেটওয়ে' : 'Payment'}</p>
              <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${activeOrder.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                {activeOrder.paymentMethod} {activeOrder.paymentStatus === 'Paid' ? `(${lang === 'bn' ? 'পরিশোধিত' : 'Paid'})` : `(${lang === 'bn' ? 'বাকি' : 'Pending'})`}
              </p>
            </div>
          </div>

          {/* Timeline Visual Nodes */}
          <div className="space-y-6 pt-4 PL-3">
            {steps.map((step, idx) => {
              const isPast = idx <= activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={idx} className="flex space-x-4 relative">
                  
                  {/* Timeline connector thread */}
                  {idx < steps.length - 1 && (
                    <div 
                      className={`absolute left-4 top-8 bottom-[-24px] w-0.5 ${
                        idx < activeIndex ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}

                  {/* Icon Node */}
                  <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center border-2 z-10 transition-all ${
                    isCurrent 
                      ? 'bg-emerald-600 text-white border-emerald-600 scale-110 shadow-md animate-pulse'
                      : isPast 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-500' 
                        : 'bg-white text-gray-300 border-gray-200'
                  }`}>
                    {idx === 0 && <ShoppingBag className="w-4 h-4" />}
                    {idx === 1 && <Calendar className="w-4 h-4" />}
                    {idx === 2 && <Truck className="w-4 h-4" />}
                    {idx === 3 && <MapPin className="w-4 h-4" />}
                    {idx === 4 && <PackageCheck className="w-4 h-4" />}
                  </div>

                  {/* Node Label Details */}
                  <div className="flex-1 pb-2">
                    <h4 className={`text-sm font-bold flex items-center gap-2 ${
                      isCurrent ? 'text-emerald-700 text-base' : isPast ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {lang === 'bn' ? step.bnLabel : step.enLabel}
                      {isCurrent && (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce.">
                          {lang === 'bn' ? 'বর্তমান অবস্থা' : 'Active Status'}
                        </span>
                      )}
                    </h4>
                    <p className={`text-xs mt-0.5 leading-relaxed font-semibold ${
                      isPast ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      {lang === 'bn' ? step.descBn : step.descEn}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Delivery Note */}
          <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 leading-relaxed font-medium">
            🚩 <strong>{lang === 'bn' ? 'হোম ডেলিভারি নির্দেশনা:' : 'Delivery Guidelines:'}</strong>{' '}
            {lang === 'bn' 
              ? 'আমাদের ডেলিভারি এজেন্ট ঢাকা সিটিতে ২৪ ঘণ্টার মধ্যে এবং সারাদেশে ২-৩ দিনের মধ্যে হোম ডেলিভারি নিশ্চিত করেন। পণ্য বুঝে পেয়ে রিডারকে মূল্য পরিশোধ করুন। কোনো প্রশ্ন জটিলতায় তাকওয়া লাইভ চ্যাটে আমাদের মেসেজ দিন।' 
              : 'Our executive ensures seamless doorstep handling. Unbox together with rider. For any queries, text via our 24/7 Support Live Chat bubble.'}
          </div>

        </div>
      )}

      {/* Suggestive Default Track Box */}
      {!activeOrder && !errorText && (
        <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Truck className="w-10 h-10 text-emerald-600/30 mx-auto mb-2" />
          <p className="text-xs text-gray-400 font-bold">
            {lang === 'bn' ? 'অর্ডার দেখতে এবং ট্র্যাক করতে ট্র্যাকিং নম্বরে TQW-78326-DH টাইপ করে সার্চ করুন।' : 'Type sample tracking ID TQW-78326-DH to preview timeline nodes immediately.'}
          </p>
        </div>
      )}

    </div>
  );
}
