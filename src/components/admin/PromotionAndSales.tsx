import React, { useState } from 'react';
import { 
  Tag, 
  Image as ImageIcon, 
  Zap, 
  Plus, 
  Trash2, 
  Edit, 
  Clock, 
  CheckCircle, 
  X, 
  Percent, 
  Gift, 
  Flame 
} from 'lucide-react';
import { Coupon, Banner, FlashSale, Product } from '../../types';

interface PromotionAndSalesProps {
  coupons: Coupon[];
  banners: Banner[];
  flashSales: FlashSale[];
  products: Product[];
  onAddCoupon: (c: any) => Promise<void>;
  onDeleteCoupon: (cId: string) => Promise<void>;
  onAddBanner: (b: any) => Promise<void>;
  onDeleteBanner: (bId: string) => Promise<void>;
  onAddFlashSale: (f: any) => Promise<void>;
  onDeleteFlashSale: (fId: string) => Promise<void>;
  lang: 'en' | 'bn';
}

export default function PromotionAndSales({
  coupons = [],
  banners = [],
  flashSales = [],
  products = [],
  onAddCoupon,
  onDeleteCoupon,
  onAddBanner,
  onDeleteBanner,
  onAddFlashSale,
  onDeleteFlashSale,
  lang
}: PromotionAndSalesProps) {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'coupons' | 'banners' | 'flash_sales'>('coupons');

  // Coupon states
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState<number>(10);
  const [couponMinPurchase, setCouponMinPurchase] = useState<number>(500);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState<number>(150);
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponUsageLimit, setCouponUsageLimit] = useState<number>(100);
  const [couponOneTime, setCouponOneTime] = useState(true);

  // Banner states
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerType, setBannerType] = useState<'Homepage Slider' | 'Offer Banner' | 'Popup Banner' | 'Category Banner'>('Homepage Slider');
  const [bannerSchedule, setBannerSchedule] = useState('');

  // Banner Cloudinary upload states
  const [bannerProgress, setBannerProgress] = useState<number | null>(null);
  const [bannerStatus, setBannerStatus] = useState('');

  const handleBannerUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setBannerProgress(0);
      setBannerStatus(isBn ? 'চিত্র সংকুচিত করা হচ্ছে...' : 'Compressing image...');

      try {
        const { uploadImage } = await import('../../lib/cloudinary');
        
        const url = await uploadImage(file, {
          onProgress: (percent) => {
            setBannerProgress(percent);
            setBannerStatus(
              percent < 100 
                ? (isBn ? `আপলোড হচ্ছে: ${percent}%` : `Uploading: ${percent}%`)
                : (isBn ? 'সম্পন্ন হচ্ছে...' : 'Finalizing...')
            );
          },
          compress: true
        });

        setBannerProgress(null);
        setBannerStatus('');
        setBannerImage(url);
      } catch (err: any) {
        setBannerProgress(null);
        setBannerStatus('');
        alert(isBn ? `আপলোড ব্যর্থ হয়েছে: ${err.message}` : `Upload failed: ${err.message}`);
      }
    };

    input.click();
  };

  // Flash Sale states
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [flashTitle, setFlashTitle] = useState('');
  const [flashEndTime, setFlashEndTime] = useState('');
  const [flashProducts, setFlashProducts] = useState<string[]>([]);

  // 1. Handlers for Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    await onAddCoupon({
      id: `c-${Date.now()}`,
      code: couponCode.trim().toUpperCase(),
      type: couponType,
      value: Number(couponValue),
      minPurchase: Number(couponMinPurchase),
      maxDiscount: couponType === 'percentage' ? Number(couponMaxDiscount) : undefined,
      expiryDate: couponExpiry || '2026-12-31',
      usageLimit: Number(couponUsageLimit),
      usedCount: 0,
      oneTime: couponOneTime,
      enabled: true
    });
    setShowCouponModal(false);
  };

  // 2. Handlers for Banner
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImage.trim()) return;

    await onAddBanner({
      id: `b-${Date.now()}`,
      title: bannerTitle,
      subtitle: bannerSubtitle,
      image: bannerImage,
      type: bannerType,
      publishDate: bannerSchedule || new Date().toISOString().slice(0, 10),
      status: 'Active'
    });
    setShowBannerModal(false);
  };

  // 3. Handlers for Flash Sale
  const handleCreateFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashTitle.trim() || !flashEndTime || flashProducts.length === 0) {
      alert('Please fill flash fields & select at least 1 product');
      return;
    }

    await onAddFlashSale({
      id: `fs-${Date.now()}`,
      title: flashTitle,
      countdownEndTime: new Date(flashEndTime).toISOString(),
      products: flashProducts,
      startTime: new Date().toISOString(),
      endTime: new Date(flashEndTime).toISOString(),
      status: 'Active'
    });
    setShowFlashModal(false);
  };

  const handleProductSelect = (pId: string) => {
    setFlashProducts(old => 
      old.includes(pId) ? old.filter(id => id !== pId) : [...old, pId]
    );
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in" id="promotions-sales-tab">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-100 gap-4">
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'coupons' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{isBn ? 'কুপন ভাউচার' : 'Coupons Ledger'}</span>
          {activeTab === 'coupons' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'banners' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{isBn ? 'বিজ্ঞাপন ব্যানার' : 'Campaign Banners'}</span>
          {activeTab === 'banners' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>

        <button
          onClick={() => setActiveTab('flash_sales')}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'flash_sales' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{isBn ? 'ফ্ল্যাশ সেল' : 'Flash Sales Campaign'}</span>
          {activeTab === 'flash_sales' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>
      </div>

      {/* ====================================
          COUPONS TAB CONTENTS
         ==================================== */}
      {activeTab === 'coupons' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{isBn ? 'স্টোর ডিসকাউন্ট কুপন কোড' : 'Store Promo Coupons & Gifts'}</h4>
              <p className="text-[10px] text-slate-400 font-bold">{isBn ? 'শতকরা ও ফ্ল্যাট মূল্য ছাড়ে কুপন পরিচালনা করুন।' : 'Direct percentage deduction or flat checkout discounts.'}</p>
            </div>
            <button
              onClick={() => {
                setCouponCode('');
                setCouponType('percentage');
                setCouponValue(15);
                setCouponMinPurchase(500);
                setCouponMaxDiscount(100);
                setCouponExpiry('2026-12-31');
                setCouponUsageLimit(100);
                setCouponOneTime(true);
                setShowCouponModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between space-y-4 relative">
                <span className={`absolute top-4 right-4 text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                  c.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {c.enabled ? 'Active' : 'Disabled'}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-black">
                    <Percent className="w-4 h-4" />
                    <span className="font-mono text-sm tracking-wide bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-lg">{c.code}</span>
                  </div>
                  <p className="text-slate-800 font-extrabold text-xs pt-2">
                    {c.type === 'percentage' ? `${c.value}% Off Discount` : `Flat ৳${c.value} Off`}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    Min Spend: ৳{c.minPurchase} {c.maxDiscount ? `| Max: ৳${c.maxDiscount}` : ''}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>Used: {c.usedCount} / {c.usageLimit || '∞'}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Delete coupon code "${c.code}"?`)) onDeleteCoupon(c.id);
                    }}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================
          BANNERS TAB CONTENTS
         ==================================== */}
      {activeTab === 'banners' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{isBn ? 'বিজ্ঞাপন ব্যানার স্লাইডার' : 'Home-screen & Promotion Banners'}</h4>
              <p className="text-[10px] text-slate-400 font-bold">{isBn ? 'নতুন কালেকশন ও অফার ব্যানার শিডিউল করুন।' : 'Add home sliders or active modal overlays.'}</p>
            </div>
            <button
              onClick={() => {
                setBannerTitle('');
                setBannerSubtitle('');
                setBannerImage('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=1200');
                setBannerType('Homepage Slider');
                setBannerSchedule('2026-07-01');
                setShowBannerModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="border border-slate-150 rounded-2xl overflow-hidden bg-slate-50 flex flex-col justify-between">
                <img src={b.image} className="w-full h-36 object-cover" />
                <div className="p-4 space-y-3">
                  <div>
                    <span className="bg-slate-200 text-slate-700 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                      {b.type}
                    </span>
                    <p className="font-extrabold text-slate-800 text-xs mt-1.5">{b.title}</p>
                    <p className="text-slate-400 text-[10px] font-bold">{b.subtitle}</p>
                  </div>

                  <div className="border-t border-slate-150 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>Schedule: {b.publishDate || 'Immediate'}</span>
                    <button
                      onClick={() => {
                        if (confirm(`Remove campaign banner?`)) onDeleteBanner(b.id);
                      }}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================
          FLASH SALES TAB CONTENTS
         ==================================== */}
      {activeTab === 'flash_sales' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{isBn ? 'ফ্ল্যাশ সেল ডিসকাউন্ট ক্যাম্পেইন' : 'Flash Sale Timers & Expiries'}</h4>
              <p className="text-[10px] text-slate-400 font-bold">{isBn ? 'সীমিত সময়ের কাউন্টডাউন এবং ডিসকাউন্ট প্রাইস সেট করুন।' : 'Countdown schedules coupled with flash items.'}</p>
            </div>
            <button
              onClick={() => {
                setFlashTitle('');
                setFlashEndTime('2026-12-31T23:59');
                setFlashProducts([]);
                setShowFlashModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Configure Flash Sale</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashSales.map((fs) => (
              <div key={fs.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between space-y-4 relative">
                <span className="absolute top-4 right-4 bg-red-100 text-red-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-red-600 animate-pulse" />
                  <span>{fs.status}</span>
                </span>

                <div className="space-y-1.5">
                  <p className="font-extrabold text-slate-850 text-xs">{fs.title}</p>
                  <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expires: {new Date(fs.countdownEndTime).toLocaleString()}</span>
                  </p>
                  <div className="pt-2">
                    <p className="text-[9px] text-slate-400 font-black uppercase">Enlisted Products Count</p>
                    <p className="text-slate-600 font-extrabold text-[11px]">{fs.products?.length || 0} Products active in timer</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm(`Terminate and remove flash sale "${fs.title}"?`)) onDeleteFlashSale(fs.id);
                    }}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          MODALS
         ============================================================== */}

      {/* 1. Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <span className="text-xs font-black">Construct Coupon Code</span>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4 text-xs font-bold text-slate-600">
              <div className="space-y-1">
                <label>Coupon Promotional Code *</label>
                <input type="text" required value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase" placeholder="e.g. MONSOON15" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Type</label>
                  <select value={couponType} onChange={(e) => setCouponType(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <option value="percentage">Percentage %</option>
                    <option value="fixed">Fixed Flat (৳)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label>Value *</label>
                  <input type="number" required min="1" value={couponValue} onChange={(e) => setCouponValue(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Min Purchase Spend (৳)</label>
                  <input type="number" value={couponMinPurchase} onChange={(e) => setCouponMinPurchase(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label>Max Discount (৳)</label>
                  <input type="number" value={couponMaxDiscount} onChange={(e) => setCouponMaxDiscount(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Usage Limit Total</label>
                  <input type="number" value={couponUsageLimit} onChange={(e) => setCouponUsageLimit(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label>Expiry Date</label>
                  <input type="date" value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer">Generate Code</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <span className="text-xs font-black">Publish Banner Campaign</span>
              <button onClick={() => setShowBannerModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateBanner} className="p-6 space-y-4 text-xs font-bold text-slate-600">
              <div className="space-y-1">
                <label>Banner Title Heading *</label>
                <input type="text" required value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label>Banner Subtitle / Description</label>
                <input type="text" value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label>Image Resource URL *</label>
                <div className="flex gap-2">
                  <input type="text" required value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px]" />
                  <button
                    type="button"
                    onClick={handleBannerUpload}
                    className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                  >
                    <span>Upload</span>
                  </button>
                </div>
                {bannerProgress !== null && (
                  <div className="space-y-1 mt-1.5 animate-pulse">
                    <div className="flex justify-between text-[9px] font-mono text-emerald-700">
                      <span>{bannerStatus}</span>
                      <span>{bannerProgress}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-150 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${bannerProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Banner Placement Type</label>
                  <select value={bannerType} onChange={(e) => setBannerType(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="Homepage Slider">Homepage Slider</option>
                    <option value="Offer Banner">Offer Banner</option>
                    <option value="Popup Banner">Popup Banner</option>
                    <option value="Category Banner">Category Banner</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label>Scheduled Date</label>
                  <input type="date" value={bannerSchedule} onChange={(e) => setBannerSchedule(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer">Publish Banner</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Flash Sale Modal */}
      {showFlashModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <span className="text-xs font-black">Configure Flash Sale Campaign</span>
              <button onClick={() => setShowFlashModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateFlashSale} className="p-6 space-y-4 text-xs font-bold text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Campaign Title *</label>
                  <input type="text" required value={flashTitle} onChange={(e) => setFlashTitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. Monsoon Midnight 25%" />
                </div>
                <div className="space-y-1">
                  <label>Countdown End Date/Time *</label>
                  <input type="datetime-local" required value={flashEndTime} onChange={(e) => setFlashEndTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              {/* Product select checkbox area */}
              <div className="space-y-1.5">
                <label className="block text-slate-800">Select Eligible Products *</label>
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 max-h-44 overflow-y-auto space-y-1.5">
                  {products.map(p => (
                    <label key={p.id} className="flex items-center gap-2 font-bold cursor-pointer text-[11px] hover:text-emerald-700">
                      <input 
                        type="checkbox" 
                        checked={flashProducts.includes(p.id)} 
                        onChange={() => handleProductSelect(p.id)} 
                        className="rounded" 
                      />
                      <span className="truncate">{p.name} (৳{p.price})</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer">Activate Campaign</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
