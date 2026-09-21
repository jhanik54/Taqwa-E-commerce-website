import React, { useState } from 'react';
import { Search, MapPin, Truck, Calendar, ShoppingBag, PackageCheck, AlertTriangle, FileText, Printer, X, Building2 } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackProps {
  lang: 'en' | 'bn';
  onTrackOrder: (id: string) => Promise<Order | null>;
  initialTrackingId?: string;
}

export default function OrderTrack({ lang, onTrackOrder, initialTrackingId }: OrderTrackProps) {
  const [trackingInput, setTrackingInput] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [activeParcel, setActiveParcel] = useState<any | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [searching, setSearching] = useState(false);

  // Search Action
  const performSearch = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    setSearching(true);
    setErrorText('');
    setActiveOrder(null);
    setActiveParcel(null);

    try {
      // 1. First check server endpoint
      const orderMatch = await onTrackOrder(q);
      
      // 2. Also check local courier parcels (taqwa_courier_parcels) for rich CN details
      let parcelMatch: any = null;
      try {
        const rawParcels = localStorage.getItem('taqwa_courier_parcels');
        if (rawParcels) {
          const parcelsList = JSON.parse(rawParcels);
          if (Array.isArray(parcelsList)) {
            const cleanQ = q.toUpperCase();
            parcelMatch = parcelsList.find((p: any) => 
              (p.consignmentId && p.consignmentId.trim().toUpperCase() === cleanQ) ||
              (p.trackingId && p.trackingId.trim().toUpperCase() === cleanQ) ||
              (p.orderId && p.orderId.trim().toUpperCase() === cleanQ) ||
              (p.customerPhone && p.customerPhone.replace(/[^0-9]/g, '') === q.replace(/[^0-9]/g, ''))
            );
          }
        }
      } catch (e) {
        console.warn("Local parcel search error", e);
      }

      if (orderMatch) {
        setActiveOrder(orderMatch);
        setActiveParcel(parcelMatch || orderMatch);
      } else if (parcelMatch) {
        // Synthesize an Order object from the parcel record
        const synthOrder: Order = {
          id: parcelMatch.orderId || parcelMatch.id,
          trackingId: parcelMatch.trackingId || `CN-${parcelMatch.consignmentId}`,
          customerName: parcelMatch.customerName,
          customerPhone: parcelMatch.customerPhone,
          customerEmail: parcelMatch.customerEmail || 'customer@taqwa.com',
          shippingAddress: parcelMatch.shippingAddress,
          district: parcelMatch.district || 'Comilla',
          items: [
            {
              productId: 'manual-feed',
              productName: parcelMatch.itemsSummary || '1 Bosta Feed',
              quantity: 1,
              price: parcelMatch.codAmount || 2820,
              image: '/uploads/tqw_1789295462226_r3t7o_1000008385_jpg.jpg'
            }
          ],
          subtotal: parcelMatch.codAmount || 2820,
          deliveryCharge: parcelMatch.deliveryCharge || 160,
          totalAmount: (parcelMatch.codAmount || 2820) + (parcelMatch.deliveryCharge || 160) + (parcelMatch.conditionCharge || 0),
          paymentMethod: 'Cash on Delivery (Condition)',
          paymentStatus: parcelMatch.trackingStatus === 'Delivered' ? 'Paid' : 'Pending',
          orderStatus: parcelMatch.trackingStatus === 'Delivered' ? 'Delivered' : 'Shipped',
          createdAt: parcelMatch.bookedAt || new Date().toISOString()
        };
        setActiveOrder(synthOrder);
        setActiveParcel(parcelMatch);
      } else {
        setErrorText(lang === 'bn' 
          ? 'দুঃখিত, এই ট্র্যাকিং নম্বর, ফোন বা চালান (CN) আইডি দিয়ে কোনো পার্সেল পাওয়া যায়নি। সঠিক নম্বর দিন।' 
          : 'Order Tracking ID, Phone, or Courier CN number not found. Please verify and try again.');
      }
    } catch (err) {
      setErrorText(lang === 'bn' ? 'অর্ডার ট্র্যাক সফল করা যায়নি।' : 'Tracking search failed.');
    } finally {
      setSearching(false);
    }
  };

  // Auto track on mount if initialTrackingId is loaded
  React.useEffect(() => {
    if (initialTrackingId) {
      setTrackingInput(initialTrackingId);
      performSearch(initialTrackingId);
    }
  }, [initialTrackingId]);

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(trackingInput);
  };

  // Print CN Voucher
  const handlePrintVoucher = () => {
    const printElement = document.getElementById('cn-voucher-print-content');
    if (!printElement) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Courier CN Voucher - ${activeParcel?.consignmentId || 'Slip'}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { margin: 0; padding: 12px; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                @page { size: auto; margin: 6mm; }
              }
            </style>
          </head>
          <body class="bg-white text-slate-900 font-sans">
            ${printElement.innerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 350);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  // Define track stages
  const steps = [
    { key: 'Pending', enLabel: 'Order Received', bnLabel: 'অর্ডার নথিভুক্ত', descEn: 'We have received your request.', descBn: 'অর্ডারটি আমাদের সিস্টেমে যুক্ত হয়েছে।' },
    { key: 'Processing', enLabel: 'Custom Processing', bnLabel: 'প্যাকেজিং চলছে', descEn: 'Taqwa operators are bagging seeds/access.', descBn: 'অর্ডারের পণ্যসমূহ গুণগতমান বজায় রেখে প্যাকিং করা হচ্ছে।' },
    { key: 'Shipped', enLabel: 'Dispatched / Shipped', bnLabel: 'কুরিয়ারে হস্তান্তর (চালান কাটা হয়েছে)', descEn: 'Handed to express logistics.', descBn: 'পণ্যগুলো দ্রুত ডেলিভারির জন্য কুরিয়ারে বুকিং ও চালান প্রস্তুত করা হয়েছে।' },
    { key: 'Out for Delivery', enLabel: 'Out for Delivery', bnLabel: 'ডেলিভারি ম্যানের পথে', descEn: 'Rider is carrying to doorstep / Hub delivery.', descBn: 'আমাদের ডেলিভারি রাইডার বা শাখা কাউন্টারে পণ্য পৌঁছানোর প্রক্রিয়া চলমান।' },
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
          {lang === 'bn' ? 'রিয়েল-টাইম অর্ডার ও কুরিয়ার ট্র্যাকিং' : 'Real-Time Order & Courier Tracking'}
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          {lang === 'bn' 
            ? 'অর্ডার ট্র্যাকিং আইডি, কাস্টমার ফোন নম্বর অথবা কুরিয়ার চালান (CN) নম্বর দিয়ে লাইভ স্ট্যাটাস জানুন' 
            : 'Check live status via Order Tracking ID, Phone Number, or Courier CN Number.'}
        </p>

        {/* Quick Sample Clickable Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
          <span className="text-[11px] text-slate-400 font-bold">{lang === 'bn' ? 'নমুনা সার্চ:' : 'Quick Sample:'}</span>
          <button
            type="button"
            onClick={() => {
              setTrackingInput('19518142');
              performSearch('19518142');
            }}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-mono font-black cursor-pointer transition-all"
          >
            জননী CN: 19518142
          </button>
          <button
            type="button"
            onClick={() => {
              setTrackingInput('TQW-78326-DH');
              performSearch('TQW-78326-DH');
            }}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-mono font-black cursor-pointer transition-all"
          >
            TQW-78326-DH
          </button>
          <button
            type="button"
            onClick={() => {
              setTrackingInput('01724791612');
              performSearch('01724791612');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-mono font-black cursor-pointer transition-all"
          >
            01724791612
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleQuery} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            id="order-tracking-input"
            type="text"
            placeholder={lang === 'bn' ? 'যেমন: চালান (CN) নং 19518142 অথবা TQW-78326-DH' : 'e.g. Courier CN No 19518142 or TQW-78326-DH'}
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-sm tracking-wide font-mono text-gray-800 font-bold"
          />
          <Search className="absolute left-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
        </div>
        <button
          id="track-submit-btn"
          type="submit"
          disabled={searching}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl text-xs transition-all shadow-xs cursor-pointer tracking-wider flex items-center justify-center gap-1.5 shrink-0"
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

      {/* Live Timeline & CN Details Display */}
      {activeOrder && (
        <div className="space-y-6 animate-fade-in" id="order-tracking-result">
          
          {/* COURIER & CN CONSIGNMENT BANNER (IF AVAILABLE) */}
          {(activeParcel?.consignmentId || (activeOrder as any)?.courierConsignmentId) && (
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-blue-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-600/30 border border-blue-400/40 rounded-xl text-amber-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                      {lang === 'bn' ? 'কুরিয়ার চালান (CN) রশিদ' : 'Courier Consignment (CN) Slip'}
                    </span>
                    <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                      <span>{activeParcel?.courier || (activeOrder as any)?.courier || 'Janani'} Courier</span>
                      <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                        CN: {activeParcel?.consignmentId || (activeOrder as any)?.courierConsignmentId}
                      </span>
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>{lang === 'bn' ? '📜 চালান কপি দেখুন / প্রিন্ট' : 'View / Print CN Voucher'}</span>
                </button>
              </div>

              {/* Route & Charges Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">{lang === 'bn' ? 'বুকিং শাখা' : 'Booking Hub'}</p>
                  <p className="font-extrabold text-slate-100">{activeParcel?.placeOfBooking || (activeOrder as any)?.placeOfBooking || 'Konabari'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">{lang === 'bn' ? 'গন্তব্য শাখা / জেলা' : 'Destination Hub'}</p>
                  <p className="font-extrabold text-slate-100">{activeParcel?.destinationBranch || activeOrder.district || 'Laksam'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">{lang === 'bn' ? 'কন্ডিশন টাকা (COD)' : 'Condition Amount'}</p>
                  <p className="font-mono font-black text-amber-300">৳{activeParcel?.codAmount || (activeOrder as any)?.subtotal || activeOrder.totalAmount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold">{lang === 'bn' ? 'ক্যারিং চার্জ' : 'Carrying Charge'}</p>
                  <p className="font-mono font-bold text-slate-200">৳{activeParcel?.deliveryCharge || activeOrder.deliveryCharge || 160}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Snapshot Header Card */}
          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">{lang === 'bn' ? 'ট্র্যাকিং আইডি' : 'Tracking ID'}</p>
              <p className="font-mono font-extrabold text-emerald-800 tracking-wide mt-0.5">{activeOrder.trackingId}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">{lang === 'bn' ? 'কাস্টমার নাম' : 'Customer Name'}</p>
              <p className="font-extrabold text-gray-800 mt-0.5 truncate">{activeOrder.customerName}</p>
              <p className="font-mono text-[11px] text-gray-500">{activeOrder.customerPhone}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">{lang === 'bn' ? 'মোট দেয় মূল্য' : 'Grand Total'}</p>
              <p className="font-black text-gray-800 mt-0.5 font-mono text-sm">৳{activeOrder.totalAmount}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">{lang === 'bn' ? 'পেমেন্ট অবস্থা' : 'Payment Status'}</p>
              <p className="font-bold text-gray-800 mt-0.5 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${activeOrder.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                {activeOrder.paymentMethod} {activeOrder.paymentStatus === 'Paid' ? `(${lang === 'bn' ? 'পরিশোধিত' : 'Paid'})` : `(${lang === 'bn' ? 'বাকি' : 'Pending'})`}
              </p>
            </div>
          </div>

          {/* Timeline Visual Nodes */}
          <div className="space-y-6 pt-2 pl-3">
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
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
            🚩 <strong>{lang === 'bn' ? 'ডেলিভারি সংক্রান্ত নির্দেশনা:' : 'Delivery Guidelines:'}</strong>{' '}
            {lang === 'bn' 
              ? 'কুরিয়ার কাউন্টার বা হোম ডেলিভারির সময় পণ্যের চালান ও প্যাকিং অক্ষত আছে কিনা যাচাই করে নিন। কোনো সহায়তার জন্য আমাদের হটলাইন বা লাইভ চ্যাটে যোগাযোগ করুন।' 
              : 'Please check your parcel packaging upon receipt. For any courier query, contact our 24/7 support.'}
          </div>

        </div>
      )}

      {/* Suggestive Default Track Box */}
      {!activeOrder && !errorText && (
        <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Truck className="w-10 h-10 text-emerald-600/30 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-bold">
            {lang === 'bn' 
              ? 'চালান (CN) নম্বর (যেমন: 19518142) অথবা ট্র্যাকিং কোড (যেমন: TQW-78326-DH) লিখে ট্র্যাক করুন।' 
              : 'Type CN consignment number (e.g. 19518142) or tracking code (e.g. TQW-78326-DH) to track.'}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL CN CUSTOMER COPY VOUCHER PREVIEW & PRINT */}
      {/* ========================================================================= */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up max-h-[95vh] flex flex-col">
            
            <div className="bg-slate-950 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/40 border border-blue-500/50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-black">
                    {lang === 'bn' ? 'অফিসিয়াল কুরিয়ার বুকিং কপি (CN Booking Copy)' : 'Official Courier CN Booking Copy'}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    CN: {activeParcel?.consignmentId || (activeOrder as any)?.courierConsignmentId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintVoucher}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs font-black cursor-pointer flex items-center gap-1.5 shadow-xs text-white"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'প্রিন্ট চালান' : 'Print Slip'}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)} 
                  className="p-1 text-slate-400 hover:text-white cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Stage Content */}
            <div className="p-5 overflow-y-auto bg-slate-100 flex-1 flex justify-center" id="cn-voucher-print-content">
              <div className="w-full max-w-xl bg-white p-5 border border-slate-300 shadow-sm rounded-lg text-slate-900 font-sans text-xs space-y-3">

                {/* Taqwa Enterprise Booking Copy Voucher */}
                <div className="border-2 border-slate-800 p-3.5 space-y-3 bg-white">
                  {/* Taqwa Enterprise Top Header */}
                  <div className="flex justify-between items-start border-b border-slate-800 pb-2.5 gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {/* Monogram Seal TE */}
                      <div className="w-11 h-11 rounded-full border-2 border-blue-900 flex flex-col items-center justify-center shrink-0 bg-blue-50/60 relative mt-0.5">
                        <span className="text-[10px] leading-none text-amber-600 font-serif">👑</span>
                        <span className="text-xs font-black tracking-tighter text-blue-950 font-serif">TE</span>
                        <div className="absolute inset-0.5 rounded-full border border-blue-900/30 border-dashed pointer-events-none"></div>
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-black text-blue-950 tracking-tight leading-none font-sans">
                            তাক্বওয়া এন্টারপ্রাইজ
                          </h2>
                          <span className="inline-block border border-blue-900/60 rounded-full px-2.5 py-0.5 text-[9.5px] font-bold text-blue-950 bg-blue-50/50 leading-tight">
                            প্রোঃ হাজী মোঃ আব্দুল মালেক মোল্লা
                          </span>
                        </div>

                        <div className="text-[9.5px] text-slate-800 space-y-0.5">
                          <p className="font-semibold text-slate-700 leading-tight">
                            📍 হাজী ইয়াকুব মোল্লা সুপার মার্কেট, সারদাগঞ্জ, মিশন গেট, ৪নং ওয়ার্ড, কাশিমপুর, গাজীপুর সিটি।
                          </p>
                          <p className="font-black text-blue-950 font-mono text-[10px] leading-tight">
                            📞 মোবাঃ <span className="underline decoration-blue-900 underline-offset-2">01718-105642</span> <span className="font-sans font-bold text-[9px] text-slate-700">(ইমো/হোয়াটসঅ্যাপ)</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Place of Booking & Memo No */}
                    <div className="border border-slate-800 text-center text-[10px] shrink-0 w-44">
                      <div className="grid grid-cols-2 border-b border-slate-800">
                        <span className="px-1.5 py-0.5 font-bold border-r border-slate-800 bg-slate-50 text-[9.5px]">Place of Booking</span>
                        <span className="px-1.5 py-0.5 font-black bg-blue-900 text-white uppercase tracking-wider text-[9.5px]">BOOKING COPY</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="px-1.5 py-1 font-bold border-r border-slate-800 text-slate-800 text-[10px]">
                          {activeParcel?.placeOfBooking || 'Konabari'}
                        </span>
                        <span className="px-1.5 py-1 font-mono font-black text-red-600 text-[11px]">
                          Memo No: {activeParcel?.consignmentId || (activeOrder as any)?.courierConsignmentId || '260001'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Column Details */}
                  <div className="grid grid-cols-3 gap-2 text-[10px] border-b border-slate-800 pb-2">
                    <div className="space-y-0.5 border-r border-slate-300 pr-1">
                      <p><span className="font-bold text-slate-700">Sender :</span> <span className="font-extrabold">{activeParcel?.senderName || 'Abdul Malek Molla (Taqwa Enterprise)'}</span></p>
                      <p><span className="font-bold text-slate-700">Address :</span> {activeParcel?.senderAddress || 'হাজী ইয়াকুব মোল্লা সুপার মার্কেট, সারদাগঞ্জ, কাশিমপুর, গাজীপুর'}</p>
                      <p><span className="font-bold text-slate-700">Mobile :</span> <span className="font-mono font-bold text-blue-950">{activeParcel?.senderPhone || '01718-105642'}</span></p>
                    </div>

                    <div className="space-y-0.5 border-r border-slate-300 pr-1">
                      <p><span className="font-bold text-slate-700">Receiver :</span> <span className="font-extrabold">{activeParcel?.customerName || activeOrder?.customerName}</span></p>
                      <p><span className="font-bold text-slate-700">Address :</span> {activeParcel?.shippingAddress || activeOrder?.shippingAddress}</p>
                      <p><span className="font-bold text-slate-700">Mobile :</span> <span className="font-mono">{activeParcel?.customerPhone || activeOrder?.customerPhone}</span></p>
                    </div>

                    <div className="space-y-0.5">
                      <p><span className="font-bold text-slate-700">Booking Date :</span> {activeParcel?.bookingDateStr || '01-9-2026, 12:23 pm'}</p>
                      <p><span className="font-bold text-slate-700">Delivery Location :</span> <span className="font-extrabold">{activeParcel?.destinationBranch || activeOrder?.district || 'Laksam'}</span></p>
                      <p><span className="font-bold text-slate-700">Delivery Type :</span> <span className="font-bold uppercase">{activeParcel?.deliveryType || 'O/D'}</span></p>
                    </div>
                  </div>

                  {/* Financial Charges Table */}
                  <div className="border border-slate-800 text-[9px]">
                    <table className="w-full border-collapse text-center">
                      <thead>
                        <tr className="bg-slate-100 text-red-700 font-bold border-b border-slate-800">
                          <th className="border-r border-slate-800 p-1 text-left">Products Details</th>
                          <th className="border-r border-slate-800 p-1">QTY.</th>
                          <th className="border-r border-slate-800 p-1">Condition Amount</th>
                          <th className="border-r border-slate-800 p-1" colSpan={2}>Condition Charge</th>
                          <th className="border-r border-slate-800 p-1">Total Condition</th>
                          <th className="border-r border-slate-800 p-1" colSpan={2}>Carrying Charge</th>
                          <th className="border-r border-slate-800 p-1">VAT</th>
                          <th className="p-1" colSpan={2}>Total</th>
                        </tr>
                        <tr className="bg-slate-50 text-[8px] font-bold border-b border-slate-800 text-slate-700">
                          <th className="border-r border-slate-800"></th>
                          <th className="border-r border-slate-800"></th>
                          <th className="border-r border-slate-800"></th>
                          <th className="border-r border-slate-800 p-0.5">Cash</th>
                          <th className="border-r border-slate-800 p-0.5">To-Pay</th>
                          <th className="border-r border-slate-800"></th>
                          <th className="border-r border-slate-800 p-0.5">Cash</th>
                          <th className="border-r border-slate-800 p-0.5">To-Pay</th>
                          <th className="border-r border-slate-800"></th>
                          <th className="border-r border-slate-800 p-0.5">Paid</th>
                          <th className="p-0.5">Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="font-mono text-[9px] border-b border-slate-800">
                          <td className="border-r border-slate-800 p-1.5 text-left font-sans font-bold">
                            {activeParcel?.itemsSummary || '1 Bosta Feed'}
                          </td>
                          <td className="border-r border-slate-800 p-1">1</td>
                          <td className="border-r border-slate-800 p-1 font-bold">{activeParcel?.codAmount || 2820}</td>
                          <td className="border-r border-slate-800 p-1">0</td>
                          <td className="border-r border-slate-800 p-1 font-bold">{activeParcel?.conditionCharge ?? 30}</td>
                          <td className="border-r border-slate-800 p-1 font-bold">{(activeParcel?.codAmount || 2820) + (activeParcel?.conditionCharge ?? 30)}</td>
                          <td className="border-r border-slate-800 p-1">0</td>
                          <td className="border-r border-slate-800 p-1 font-bold">{activeParcel?.deliveryCharge || 160}</td>
                          <td className="border-r border-slate-800 p-1">0</td>
                          <td className="border-r border-slate-800 p-1">0</td>
                          <td className="p-1 font-bold text-red-600">{activeParcel?.deliveryCharge || 160}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* In Words & Total Payable */}
                  <div className="flex justify-between items-center text-[9px] border-b border-slate-800 pb-1 font-bold">
                    <div>
                      <span className="text-slate-600">In word : </span>
                      <span className="uppercase text-slate-900">{activeParcel?.amountInWords || 'three thousand and ten'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-600">Total Payable: </span>
                      <span className="font-mono text-xs font-black text-blue-900">৳{((activeParcel?.codAmount || 2820) + (activeParcel?.conditionCharge ?? 30) + (activeParcel?.deliveryCharge || 160)).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between items-end pt-3 text-[9px]">
                    <div className="text-center">
                      <div className="w-32 border-t border-slate-800 pt-0.5"></div>
                      <p className="font-bold text-slate-800">Consignment Signature</p>
                    </div>
                    <div className="text-center">
                      <p className="font-mono font-bold text-[8.5px] text-blue-950 mb-0.5">{activeParcel?.bookingOfficer || 'Md. Rakib'}</p>
                      <div className="w-28 border-t border-slate-800 pt-0.5"></div>
                      <p className="font-bold text-slate-800">Booking Officer</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
