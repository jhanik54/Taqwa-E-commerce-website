import React, { useState } from 'react';
import { 
  Bell, 
  Settings, 
  FileSpreadsheet, 
  ShieldAlert, 
  Plus, 
  X, 
  Check, 
  Send, 
  DollarSign, 
  Activity, 
  Clock, 
  Download,
  AlertTriangle,
  Smartphone,
  Info,
  CreditCard,
  CheckCircle,
  Hash
} from 'lucide-react';
import { StoreSettings, ActivityLog, Order, Product } from '../../types';

interface NotificationAndSettingsProps {
  notifications: any[];
  activityLogs: ActivityLog[];
  settings: StoreSettings;
  orders: Order[];
  products: Product[];
  onSendNotification: (title: string, banglaTitle: string, message: string, banglaMessage: string, type: string) => Promise<void>;
  onUpdateSettings: (newSettings: StoreSettings) => Promise<void>;
  lang: 'en' | 'bn';
}

export default function NotificationAndSettings({
  notifications = [],
  activityLogs = [],
  settings,
  orders = [],
  products = [],
  onSendNotification,
  onUpdateSettings,
  lang
}: NotificationAndSettingsProps) {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings' | 'reports' | 'security'>('notifications');

  // Notification states
  const [notifTitle, setNotifTitle] = useState('');
  const [notifTitleBn, setNotifTitleBn] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifMsgBn, setNotifMsgBn] = useState('');
  const [notifType, setNotifType] = useState<'promo' | 'coupon' | 'system'>('promo');

  const notificationTemplates = [
    {
      name: isBn ? 'ডিসকাউন্ট ক্যাম্পেইন' : 'Discount Promo',
      titleEn: 'Mega Discount Campaign Activated!',
      titleBn: 'মেগা ডিসকাউন্ট ক্যাম্পেইন শুরু হয়েছে!',
      msgEn: 'Get up to 20% off on premium pet food & bird seeds today. Limited stock available!',
      msgBn: 'আজই প্রিমিয়াম পাখির খাবার ও বিড়ালের খাবারে ২০% পর্যন্ত ছাড় পান। সীমিত স্টক রয়েছে!',
      type: 'promo' as const
    },
    {
      name: isBn ? 'নতুন কুপন অফার' : 'New Coupon code',
      titleEn: 'Special Promo Code: TAQWA15',
      titleBn: 'বিশেষ প্রোমো কোড: TAQWA15',
      msgEn: 'Use coupon code TAQWA15 on checkout to get flat 15% discount on all items!',
      msgBn: 'চেকআউট করার সময় TAQWA15 কুপন কোড ব্যবহার করে সকল পণ্যে ফ্ল্যাট ১৫% ছাড় পান!',
      type: 'coupon' as const
    },
    {
      name: isBn ? 'রক্ষণাবেক্ষণ সতর্কবার্তা' : 'Maintenance Alert',
      titleEn: 'Scheduled Server Maintenance',
      titleBn: 'পরিকল্পিত সার্ভার রক্ষণাবেক্ষণ',
      msgEn: 'Taqwa Enterprise will undergo short server maintenance tonight at 11 PM BDT.',
      msgBn: 'আজ রাত ১১ টায় আমাদের ওয়েবসাইট সাময়িক রক্ষণাবেক্ষণের জন্য ডাউন থাকবে।',
      type: 'system' as const
    },
    {
      name: isBn ? 'নতুন পণ্য আগমন' : 'New Arrival Stock',
      titleEn: 'Fresh Premium Bird Seed Mix is Now in Stock!',
      titleBn: 'নতুন প্রিমিয়াম পাখির মিক্সড সীড এখন স্টকে!',
      msgEn: 'We have just restocked our premium breeding formula seeds. Order before it sells out!',
      msgBn: 'আমরা পাখির জন্য ব্রিডিং ফর্মুলা সীড মিক্স রিস্টক করেছি। শেষ হওয়ার আগেই অর্ডার করুন!',
      type: 'promo' as const
    }
  ];

  const applyTemplate = (tpl: typeof notificationTemplates[0]) => {
    setNotifTitle(tpl.titleEn);
    setNotifTitleBn(tpl.titleBn);
    setNotifMsg(tpl.msgEn);
    setNotifMsgBn(tpl.msgBn);
    setNotifType(tpl.type);
  };

  const handleSendNotifSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMsg.trim()) return;

    await onSendNotification(
      notifTitle.trim(),
      notifTitleBn.trim() || notifTitle.trim(),
      notifMsg.trim(),
      notifMsgBn.trim() || notifMsg.trim(),
      notifType
    );
    setNotifTitle('');
    setNotifTitleBn('');
    setNotifMsg('');
    setNotifMsgBn('');
    alert(isBn ? 'বিজ্ঞপ্তিটি সফলভাবে পাঠানো হয়েছে!' : 'Notification campaign dispatched successfully!');
  };

  // Store Settings states
  const [storeName, setStoreName] = useState(settings?.storeName || 'Taqwa Enterprise');
  const [logo, setLogo] = useState(settings?.logo || '');
  const [favicon, setFavicon] = useState(settings?.favicon || '');
  const [contactEmail, setContactEmail] = useState(settings?.contactEmail || 'taqwaenterpriseoffice@gmail.com');
  const [contactPhone, setContactPhone] = useState(settings?.contactPhone || '01999999999');
  const [businessHours, setBusinessHours] = useState(settings?.businessHours || '10 AM - 10 PM');
  const [socialFacebook, setSocialFacebook] = useState(settings?.socialFacebook || 'https://facebook.com');
  const [socialYoutube, setSocialYoutube] = useState(settings?.socialYoutube || 'https://youtube.com');
  const [shippingChargeDhaka, setShippingChargeDhaka] = useState<number>(settings?.shippingChargeDhaka || 60);
  const [shippingChargeOutside, setShippingChargeOutside] = useState<number>(settings?.shippingChargeOutside || 120);
  const [taxRate, setTaxRate] = useState<number>(settings?.taxRate || 0);

  // Expanded mobile banking states
  const [bkashNumber, setBkashNumber] = useState(settings?.bkashNumber || '01999999999');
  const [bkashType, setBkashType] = useState<'Personal' | 'Agent' | 'Merchant'>(settings?.bkashType || 'Personal');
  const [nagadNumber, setNagadNumber] = useState(settings?.nagadNumber || '01888888888');
  const [nagadType, setNagadType] = useState<'Personal' | 'Agent' | 'Merchant'>(settings?.nagadType || 'Personal');
  const [rocketNumber, setRocketNumber] = useState(settings?.rocketNumber || '01777777777');
  const [rocketType, setRocketType] = useState<'Personal' | 'Agent' | 'Merchant'>(settings?.rocketType || 'Personal');
  
  // Custom Transfer Guideline Messages states
  const [paymentInstructionsEn, setPaymentInstructionsEn] = useState(
    settings?.paymentInstructionsEn || 'Please send money to our official number and input the TxnID.'
  );
  const [paymentInstructionsBn, setPaymentInstructionsBn] = useState(
    settings?.paymentInstructionsBn || 'আমাদের অফিসিয়াল নাম্বারে টাকা সেন্ড মানি করে ট্রানজেকশন আইডি প্রদান করুন।'
  );
  
  // Enterprise States
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(settings?.maintenanceMode || false);
  const [orderIdPrefix, setOrderIdPrefix] = useState(settings?.orderIdPrefix || 'TQW');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      storeName,
      logo,
      favicon,
      contactEmail,
      contactPhone,
      businessHours,
      socialFacebook,
      socialYoutube,
      shippingChargeDhaka: Number(shippingChargeDhaka),
      shippingChargeOutside: Number(shippingChargeOutside),
      taxRate: Number(taxRate),
      currency: 'BDT',
      language: 'en',
      // Mobile Banking Settings
      bkashNumber,
      bkashType,
      nagadNumber,
      nagadType,
      rocketNumber,
      rocketType,
      // Custom payment rules
      paymentInstructionsEn,
      paymentInstructionsBn,
      // Extra business switches
      maintenanceMode,
      orderIdPrefix
    });
    alert(isBn ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Core configurations saved successfully!');
  };

  // Reports Excel/CSV export
  const handleExportSalesReport = () => {
    const headers = 'OrderID,TrackingID,Customer,Phone,Total,Payment,Status,Date\n';
    const rows = orders.map(o => 
      `"${o.id}","${o.trackingId}","${o.customerName}",="${o.customerPhone}",${o.totalAmount},"${o.paymentMethod}","${o.orderStatus}","${new Date(o.createdAt).toLocaleDateString()}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Taqwa_Sales_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in" id="settings-notifications-tab">
      
      {/* Mobile-Friendly Scrolling Tabs */}
      <div className="flex border-b border-slate-100 gap-4 overflow-x-auto pb-1 scrollbar-thin select-none">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 relative ${
            activeTab === 'notifications' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{isBn ? 'পুশ নোটিফিকেশন সেন্টার' : 'Alert Dispatcher'}</span>
          {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 relative ${
            activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{isBn ? 'স্টোর ও গেটওয়ে সেটিংস' : 'E-commerce Settings'}</span>
          {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 relative ${
            activeTab === 'reports' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isBn ? 'রিপোর্ট ও স্প্রেডশিট' : 'Revenue Reports'}</span>
          {activeTab === 'reports' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 relative ${
            activeTab === 'security' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isBn ? 'নিরাপত্তা অডিট লগ' : 'Security Log Audit'}</span>
          {activeTab === 'security' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>
      </div>

      {/* =======================================
          NOTIFICATIONS TAB (WITH SMART TEMPLATES)
         ======================================= */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          <div className="lg:col-span-2 space-y-4">
            {/* Template Selector widget */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
              <p className="text-emerald-850 text-xs font-black flex items-center gap-1.5 mb-2">
                <Info className="w-4.5 h-4.5 text-emerald-600" />
                <span>{isBn ? 'স্মার্ট টেম্পলেট ব্যবহার করুন' : 'Load High-Converting Push Templates'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {notificationTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl text-[10px] font-black text-slate-700 cursor-pointer shadow-xs transition-all hover:scale-[1.02]"
                  >
                    🚀 {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dispatcher Form */}
            <form onSubmit={handleSendNotifSubmit} className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4 text-xs font-bold text-slate-600">
              <div>
                <p className="text-slate-800 text-sm font-black flex items-center gap-1">
                  <Send className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                  <span>{isBn ? 'অনলাইন পুশ ব্রডকাস্ট Dispatcher' : 'Dispatch Promotional Broadcast'}</span>
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{isBn ? 'গ্রাহকদের মোবাইল ও ডেস্কটপে ইনস্ট্যান্ট নোটিফিকেশন অ্যালার্ট পাঠান।' : 'Send immediate app notifications to all customers instantly.'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>{isBn ? 'নোটিফিকেশন টাইটেল (English) *' : 'Notification English Title *'}</label>
                  <input type="text" required value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-emerald-500 focus:outline-hidden" placeholder="e.g. Save 15% on supplements" />
                </div>
                <div className="space-y-1">
                  <label>{isBn ? 'নোটিফিকেশন টাইটেল (Bangla)' : 'Bangla Title'}</label>
                  <input type="text" value={notifTitleBn} onChange={(e) => setNotifTitleBn(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-medium focus:border-emerald-500 focus:outline-hidden" placeholder="যেমন: কুপনে ১৫% মূল্যছাড়" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>{isBn ? 'ব্রডকাস্ট বিবরণী কন্টেন্ট (English) *' : 'English Broadcast Message *'}</label>
                  <textarea required value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)} className="w-full h-20 p-2.5 bg-white border border-slate-200 rounded-xl resize-none font-medium focus:border-emerald-500 focus:outline-hidden" placeholder="Description of offer..."></textarea>
                </div>
                <div className="space-y-1">
                  <label>{isBn ? 'ব্রডকাস্ট বিবরণী কন্টেন্ট (Bangla)' : 'Bangla Message'}</label>
                  <textarea value={notifMsgBn} onChange={(e) => setNotifMsgBn(e.target.value)} className="w-full h-20 p-2.5 bg-white border border-slate-200 rounded-xl resize-none font-medium focus:border-emerald-500 focus:outline-hidden" placeholder="অফারের বিস্তারিত..."></textarea>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="block text-slate-400">{isBn ? 'ক্যাম্পেইন ক্যাটাগরি' : 'Campaign Category'}</label>
                  <div className="flex gap-2">
                    {['promo', 'coupon', 'system'].map(cat => (
                      <button
                        key={cat} type="button"
                        onClick={() => setNotifType(cat as any)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase cursor-pointer transition-colors ${
                          notifType === cat 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                  <Send className="w-4 h-4" />
                  <span>{isBn ? 'ব্রডকাস্ট পাঠান' : 'Send BroadCast'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Dispatch history logs */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{isBn ? 'সাম্প্রতিক পুশ বার্তা লগ' : 'Recent Broadcast Logs'}</h5>
            <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto bg-slate-50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic font-semibold text-xs">{isBn ? 'কোন নোটিফিকেশন পাঠানো হয়নি' : 'No previous push campaigns dispatched yet.'}</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 text-[11px] font-bold bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                        {n.type}
                      </span>
                      <span className="text-[8px] text-slate-400 font-mono">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-extrabold text-slate-800 mt-1">{n.title}</p>
                    <p className="text-slate-400 font-semibold text-[10px] mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* =======================================
          SETTINGS TAB (ADVANCED CONFIGURATIONS)
         ======================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-fade-in text-xs font-bold text-slate-600">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Core Shop Information Card */}
            <div className="space-y-4 bg-slate-50 border border-slate-150 p-4 sm:p-5 rounded-2xl">
              <h4 className="text-slate-800 text-sm font-black flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                <Settings className="w-4.5 h-4.5 text-emerald-600" />
                <span>{isBn ? 'স্টোর সাধারণ সেটিংস' : 'General Store Information'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>{isBn ? 'ই-কমার্স ওয়েবসাইটের নাম *' : 'E-commerce Store Title *'}</label>
                  <input type="text" required value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold" />
                </div>
                <div className="space-y-1">
                  <label>{isBn ? 'অফিসিয়াল কাস্টমার সাপোর্ট ইমেইল *' : 'Official Support Email *'}</label>
                  <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>{isBn ? 'অফিসিয়াল হটলাইন ফোন নাম্বার *' : 'Official Support Hotline *'}</label>
                  <input type="text" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px]" />
                </div>
                <div className="space-y-1">
                  <label>{isBn ? 'অফিসিয়াল কর্মঘণ্টা (Business Hours)' : 'Business Working Hours'}</label>
                  <input type="text" value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold" placeholder="e.g. Sat - Thu (10am - 8pm)" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>{isBn ? 'ফেসবুক পেজ লিংক' : 'Facebook Page Link'}</label>
                  <input type="text" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[10px]" />
                </div>
                <div className="space-y-1">
                  <label>{isBn ? 'ইউটিউব চ্যানেল লিংক' : 'Youtube Channel Link'}</label>
                  <input type="text" value={socialYoutube} onChange={(e) => setSocialYoutube(e.target.value)} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[10px]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-emerald-600" />
                    <span>{isBn ? 'অর্ডার আইডি প্রিফিক্স (Prefix)' : 'Order ID Custom Prefix'}</span>
                  </label>
                  <input type="text" value={orderIdPrefix} onChange={(e) => setOrderIdPrefix(e.target.value.toUpperCase())} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-center uppercase tracking-widest text-emerald-800" />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                    <span>{isBn ? 'মেনটেইন্যান্স মোড (Maintenance)' : 'Shop Maintenance Mode'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`w-full py-2.5 rounded-xl font-black text-center border cursor-pointer transition-all ${
                      maintenanceMode 
                        ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100/80 shadow-inner' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    🚫 {maintenanceMode ? (isBn ? 'ওয়েবসাইট বন্ধ আছে' : 'WEBSITE DOWN (Maintenance)') : (isBn ? 'চলতি অবস্থা (Live)' : 'ACTIVE (Live Online)')}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Surcharges, VAT, and Logistics Card */}
            <div className="space-y-4 bg-slate-50 border border-slate-150 p-4 sm:p-5 rounded-2xl">
              <h4 className="text-slate-800 text-sm font-black flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
                <DollarSign className="w-4.5 h-4.5 text-emerald-600" />
                <span>{isBn ? 'ডেলিভারি চার্জ ও ট্যাক্স কনফিগারেশন' : 'Delivery Charges & VAT Tax'}</span>
              </h4>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label>{isBn ? 'ঢাকা সিটির ভেতরে ডেলিভারি ফি (টাকা) *' : 'Home Delivery Charge (Inside Dhaka) *'}</label>
                  <input type="number" required value={shippingChargeDhaka} onChange={(e) => setShippingChargeDhaka(Number(e.target.value))} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-extrabold text-emerald-700 text-sm" />
                </div>

                <div className="space-y-1">
                  <label>{isBn ? 'ঢাকার বাইরে কুরিয়ার ডেলিভারি ফি (টাকা) *' : 'Home Delivery Charge (Outside Dhaka) *'}</label>
                  <input type="number" required value={shippingChargeOutside} onChange={(e) => setShippingChargeOutside(Number(e.target.value))} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-extrabold text-emerald-700 text-sm" />
                </div>

                <div className="space-y-1">
                  <label>{isBn ? 'ভ্যাট / ট্যাক্স সurcharge হার (%) *' : 'VAT / Tax Surcharge Rate (%) *'}</label>
                  <input type="number" required value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-full p-3 bg-white border border-slate-200 rounded-xl font-semibold" />
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-150 rounded-xl text-[10px] text-blue-700 font-semibold space-y-1 leading-relaxed">
                <p className="font-extrabold">📌 {isBn ? 'লজিস্টিকস সহায়িকা:' : 'Logistics Guideline Notes:'}</p>
                <p>{isBn ? 'এখানকার ডেলিভারি রেট সরাসরি গ্রাহকের চেকআউট পেজে কাজ করবে। জেলা নির্বাচন করলে কুরিয়ার চার্জ অটোমেটিক হিসেব হবে।' : 'Rates updated here will directly take effect inside CheckoutModal for live customer checkout computations.'}</p>
              </div>
            </div>

          </div>

          {/* 3. Mobile Banking Gateway Configuration Card */}
          <div className="space-y-4 bg-slate-50 border border-slate-150 p-4 sm:p-5 rounded-2xl">
            <h4 className="text-slate-800 text-sm font-black flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
              <Smartphone className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
              <span>{isBn ? 'মোবাইল ব্যাংকিং পেমেন্ট গেটওয়ে সেটিংস' : 'Mobile Banking Gateway Numbers'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* bKash configuration */}
              <div className="p-4 bg-white border border-pink-100 rounded-2xl space-y-3.5 shadow-xs">
                <div className="flex justify-between items-center border-b border-pink-50 pb-1.5">
                  <span className="font-extrabold text-pink-750 text-xs sm:text-sm">bKash (বিকাশ)</span>
                  <span className="text-[9px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-black uppercase">Active</span>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase">bKash Mobile Number</label>
                    <input type="text" value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-pink-600 text-xs font-black" placeholder="e.g. 019XXXXXXXX" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase">Account Type</label>
                    <select value={bkashType} onChange={(e) => setBkashType(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                      <option value="Personal">Personal (সেন্ড মানি)</option>
                      <option value="Agent">Agent (ক্যাশ আউট)</option>
                      <option value="Merchant">Merchant (পেমেন্ট)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Nagad configuration */}
              <div className="p-4 bg-white border border-orange-100 rounded-2xl space-y-3.5 shadow-xs">
                <div className="flex justify-between items-center border-b border-orange-50 pb-1.5">
                  <span className="font-extrabold text-orange-600 text-xs sm:text-sm">Nagad (নগদ)</span>
                  <span className="text-[9px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-black uppercase">Active</span>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase">Nagad Mobile Number</label>
                    <input type="text" value={nagadNumber} onChange={(e) => setNagadNumber(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-orange-600 text-xs font-black" placeholder="e.g. 018XXXXXXXX" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase">Account Type</label>
                    <select value={nagadType} onChange={(e) => setNagadType(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                      <option value="Personal">Personal (সেন্ড মানি)</option>
                      <option value="Agent">Agent (ক্যাশ আউট)</option>
                      <option value="Merchant">Merchant (পেমেন্ট)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Rocket configuration */}
              <div className="p-4 bg-white border border-purple-100 rounded-2xl space-y-3.5 shadow-xs">
                <div className="flex justify-between items-center border-b border-purple-50 pb-1.5">
                  <span className="font-extrabold text-purple-750 text-xs sm:text-sm">Rocket (রকেট)</span>
                  <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-black uppercase">Active</span>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase">Rocket Mobile Number</label>
                    <input type="text" value={rocketNumber} onChange={(e) => setRocketNumber(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-purple-600 text-xs font-black" placeholder="e.g. 017XXXXXXXX" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase">Account Type</label>
                    <select value={rocketType} onChange={(e) => setRocketType(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                      <option value="Personal">Personal (সেন্ড মানি)</option>
                      <option value="Agent">Agent (ক্যাশ আউট)</option>
                      <option value="Merchant">Merchant (পেমেন্ট)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 4. Payment transfer guidelines Custom message */}
          <div className="space-y-4 bg-slate-50 border border-slate-150 p-4 sm:p-5 rounded-2xl">
            <h4 className="text-slate-800 text-sm font-black flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
              <Info className="w-4.5 h-4.5 text-emerald-600" />
              <span>{isBn ? 'গ্রাহকদের জন্য চেকআউট পেমেন্ট নির্দেশনা' : 'Customer-Facing Payment Instructions'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label>{isBn ? 'ইংলিশ নির্দেশাবলী কন্টেন্ট *' : 'English Payment Instructions *'}</label>
                <textarea required value={paymentInstructionsEn} onChange={(e) => setPaymentInstructionsEn(e.target.value)} className="w-full h-24 p-2.5 bg-white border border-slate-200 rounded-xl resize-none font-medium text-slate-700" placeholder="Instructions seen by english users on checkout..."></textarea>
              </div>
              <div className="space-y-1">
                <label>{isBn ? 'বাংলা নির্দেশাবলী কন্টেন্ট *' : 'Bangla Payment Instructions *'}</label>
                <textarea required value={paymentInstructionsBn} onChange={(e) => setPaymentInstructionsBn(e.target.value)} className="w-full h-24 p-2.5 bg-white border border-slate-200 rounded-xl resize-none font-medium text-slate-700" placeholder="চেকআউট করার সময় বাংলা ব্যবহারকারী যে নির্দেশ দেখতে পাবে..."></textarea>
              </div>
            </div>
          </div>

          {/* Global Settings Save CTA */}
          <div className="flex justify-end pt-2">
            <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]">
              <CheckCircle className="w-5 h-5" />
              <span>{isBn ? 'সকল কনফিগারেশন সংরক্ষণ করুন' : 'Save All Configurations'}</span>
            </button>
          </div>

        </form>
      )}

      {/* =======================================
          REPORTS TAB
         ======================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{isBn ? 'ব্যবসায়িক ট্র্যাকিং ও অডিট রিপোর্ট' : 'Business Reports & Ledger Sheets'}</h4>
              <p className="text-[10px] text-slate-400 font-bold">{isBn ? 'বিক্রয় বিশ্লেষণ, ইনভেন্টরি ও কাস্টমার রিপোর্ট স্প্রেডশিটে এক্সপোর্ট করুন।' : 'Direct CSV spreadsheet compilation and export widgets.'}</p>
            </div>
            <button
              onClick={handleExportSalesReport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>{isBn ? 'বিক্রয় রিপোর্ট এক্সপোর্ট (CSV)' : 'Export Sales Spreadsheet'}</span>
            </button>
          </div>

          {/* Quick Metrics lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-slate-600">
            
            {/* Sales ledger overview */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
              <p className="text-slate-800 text-xs font-black uppercase tracking-wider">{isBn ? 'সর্বোচ্চ মূল্যের প্রোডাক্টসমূহ' : 'Top Performing Products (Price-wise)'}</p>
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-2">
                {[...products]
                  .sort((a, b) => b.price - a.price)
                  .slice(0, 5)
                  .map((p, idx) => (
                    <div key={p.id} className="py-2.5 flex justify-between items-center gap-4">
                      <span className="truncate text-slate-700 font-medium">{isBn && p.banglaName ? p.banglaName : p.name}</span>
                      <span className="text-emerald-700 font-black shrink-0">৳{p.price.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Customer accounts ledger */}
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
              <p className="text-slate-800 text-xs font-black uppercase tracking-wider">{isBn ? 'সাম্প্রতিক অর্ডার ভলিউম' : 'Recent Orders Volume'}</p>
              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-2">
                {orders.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 italic font-semibold">{isBn ? 'কোন অর্ডার পাওয়া যায়নি' : 'No orders found yet.'}</div>
                ) : (
                  orders.slice(0, 5).map(o => (
                    <div key={o.id} className="py-2.5 flex justify-between items-center text-[11px] gap-4">
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 truncate">{o.trackingId}</p>
                        <p className="text-[9px] text-slate-400 font-bold truncate">{o.customerName}</p>
                      </div>
                      <span className="font-black text-slate-700 shrink-0">৳{o.totalAmount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =======================================
          SECURITY TAB (AUDIT LOGS)
         ======================================= */}
      {activeTab === 'security' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{isBn ? 'অ্যাডমিন কার্যক্রম অডিট লগ' : 'Security Activity Audit Trails'}</h4>
            <p className="text-[10px] text-slate-400 font-bold">{isBn ? 'স্টোর ব্যবস্থাপনায় অ্যাডমিনদের সকল কার্যক্রমের বিবরণী ট্র্যাকার।' : 'Cryptographically secure trace records of administrative catalog edits.'}</p>
          </div>

          <div className="border border-slate-150 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-150 text-[10px] select-none">
                  <th className="py-2.5 px-4 uppercase w-1/4">Date / Timestamp</th>
                  <th className="py-2.5 px-4 uppercase w-1/4">Operator Email Identity</th>
                  <th className="py-2.5 px-4 uppercase w-1/6">Action Category</th>
                  <th className="py-2.5 px-4 uppercase">Detailed Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 bg-white">
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">No security activity logs captured yet.</td>
                  </tr>
                ) : (
                  activityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                        {new Date(log.timestamp || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-800 font-mono text-[10px] truncate max-w-[150px]">
                        {log.userEmail}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-150 text-slate-700 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] break-words">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
