import React, { useState, useEffect } from 'react';
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
  Hash,
  Cloud,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Trash2,
  Database,
  Server,
  HardDrive
} from 'lucide-react';
import { StoreSettings, ActivityLog, Order, Product } from '../../types';
import { getCloudinaryConfig, saveCloudinaryConfig, testCloudinaryConnection, uploadImage } from '../../lib/cloudinary';
import { useAuth } from '../../context/AuthContext';

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

  const { currentUser } = useAuth();

  // Database status and backup states
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoadingDbStatus, setIsLoadingDbStatus] = useState(false);
  const [isExportingSql, setIsExportingSql] = useState(false);
  const [dbErrorMessage, setDbErrorMessage] = useState('');

  const fetchDbStatus = async () => {
    setIsLoadingDbStatus(true);
    setDbErrorMessage('');
    try {
      const res = await fetch('/api/system/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      } else {
        setDbErrorMessage(isBn ? 'ডাটাবেজ স্ট্যাটাস লোড করা যায়নি।' : 'Failed to fetch database status.');
      }
    } catch (err) {
      console.error("Failed to load db status", err);
      setDbErrorMessage(isBn ? 'ডাটাবেজ সার্ভারে কানেক্ট করা যাচ্ছে না।' : 'Could not reach database status endpoint.');
    } finally {
      setIsLoadingDbStatus(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchDbStatus();
    }
  }, [activeTab]);

  const handleExportBackup = async () => {
    if (!currentUser?.email) {
      alert(isBn ? 'অনুগ্রহ করে প্রথমে লগইন করুন।' : 'Please authenticate first.');
      return;
    }
    setIsExportingSql(true);
    try {
      const url = `/api/system/backup-db?email=${encodeURIComponent(currentUser.email)}`;
      const response = await fetch(url, {
        headers: {
          'x-user-email': currentUser.email
        }
      });
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to download backup');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `taqwa_enterprise_db_backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.sql`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      console.error("Backup failed:", err);
      alert(isBn ? `ব্যাকআপ ব্যর্থ হয়েছে: ${err.message}` : `Backup failed: ${err.message}`);
    } finally {
      setIsExportingSql(false);
    }
  };

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
  const [contactPhone, setContactPhone] = useState(settings?.contactPhone || '01913955452');
  const [businessHours, setBusinessHours] = useState(settings?.businessHours || '10 AM - 10 PM');
  const [socialFacebook, setSocialFacebook] = useState(settings?.socialFacebook || 'https://facebook.com');
  const [socialYoutube, setSocialYoutube] = useState(settings?.socialYoutube || 'https://youtube.com');
  const [shippingChargeDhaka, setShippingChargeDhaka] = useState<number>(settings?.shippingChargeDhaka || 60);
  const [shippingChargeOutside, setShippingChargeOutside] = useState<number>(settings?.shippingChargeOutside || 120);
  const [taxRate, setTaxRate] = useState<number>(settings?.taxRate || 0);

  // Expanded mobile banking states
  const [bkashNumber, setBkashNumber] = useState(settings?.bkashNumber || '01913955452');
  const [bkashType, setBkashType] = useState<'Personal' | 'Agent' | 'Merchant'>(settings?.bkashType || 'Personal');
  const [nagadNumber, setNagadNumber] = useState(settings?.nagadNumber || '01913955452');
  const [nagadType, setNagadType] = useState<'Personal' | 'Agent' | 'Merchant'>(settings?.nagadType || 'Personal');
  const [rocketNumber, setRocketNumber] = useState(settings?.rocketNumber || '01913955452');
  const [rocketType, setRocketType] = useState<'Personal' | 'Agent' | 'Merchant'>(settings?.rocketType || 'Personal');
  
  // Gateway Charge Rates (%)
  const [codChargeRate, setCodChargeRate] = useState<number>(settings?.codChargeRate !== undefined ? settings.codChargeRate : 1.0);
  const [bkashChargeRate, setBkashChargeRate] = useState<number>(settings?.bkashChargeRate !== undefined ? settings.bkashChargeRate : 1.85);
  const [nagadChargeRate, setNagadChargeRate] = useState<number>(settings?.nagadChargeRate !== undefined ? settings.nagadChargeRate : 1.5);
  const [rocketChargeRate, setRocketChargeRate] = useState<number>(settings?.rocketChargeRate !== undefined ? settings.rocketChargeRate : 1.8);

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

  // Clean Reset states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  const handleCleanReset = async () => {
    setIsResetting(true);
    setResetSuccessMsg("");
    try {
      const response = await fetch('/api/system/reset-demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setResetSuccessMsg(isBn ? 'সব ডেমো ডাটা সফলভাবে মুছে ফেলা হয়েছে! দয়া করে ৫ সেকেন্ড অপেক্ষা করুন...' : 'Demo data successfully purged! Reloading catalog in 5 seconds...');
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        const data = await response.json();
        alert(data.error || 'Reset failed.');
      }
    } catch (err: any) {
      alert('Error during reset: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  // Cloudinary Storage Config States
  const [cloudinaryCloudName, setCloudinaryCloudName] = useState('');
  const [cloudinaryUploadPreset, setCloudinaryUploadPreset] = useState('');
  const [isCloudinaryActive, setIsCloudinaryActive] = useState(false);
  const [cloudinaryTestLoading, setCloudinaryTestLoading] = useState(false);
  const [cloudinaryTestResult, setCloudinaryTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    const config = getCloudinaryConfig();
    setCloudinaryCloudName(config.cloudName);
    setCloudinaryUploadPreset(config.uploadPreset);
    setIsCloudinaryActive(config.isConfigured);
  }, []);

  const handleTestCloudinary = async () => {
    if (!cloudinaryCloudName.trim() || !cloudinaryUploadPreset.trim()) {
      alert(isBn ? 'দয়া করে Cloud Name এবং Upload Preset প্রদান করুন।' : 'Please enter Cloud Name and Upload Preset.');
      return;
    }
    setCloudinaryTestLoading(true);
    setCloudinaryTestResult(null);
    try {
      const res = await testCloudinaryConnection(cloudinaryCloudName, cloudinaryUploadPreset);
      setCloudinaryTestResult(res);
      if (res.success) {
        saveCloudinaryConfig(cloudinaryCloudName, cloudinaryUploadPreset);
        setIsCloudinaryActive(true);
      }
    } catch (e: any) {
      setCloudinaryTestResult({ success: false, message: e.message });
    } finally {
      setCloudinaryTestLoading(false);
    }
  };

  // Logo & Favicon Upload States & Handlers
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState<number | null>(null);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [faviconProgress, setFaviconProgress] = useState<number | null>(null);

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLogoUploading(true);
      setLogoProgress(0);

      try {
        const url = await uploadImage(file, {
          onProgress: (percent) => setLogoProgress(percent),
          compress: true
        });
        setLogo(url);
      } catch (err: any) {
        alert(isBn ? `লোগো আপলোড ব্যর্থ হয়েছে: ${err.message}` : `Logo upload failed: ${err.message}`);
      } finally {
        setLogoUploading(false);
        setLogoProgress(null);
      }
    };
    input.click();
  };

  const handleFaviconUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFaviconUploading(true);
      setFaviconProgress(0);

      try {
        const url = await uploadImage(file, {
          onProgress: (percent) => setFaviconProgress(percent),
          compress: true
        });
        setFavicon(url);
      } catch (err: any) {
        alert(isBn ? `ফেভিকন আপলোড ব্যর্থ হয়েছে: ${err.message}` : `Favicon upload failed: ${err.message}`);
      } finally {
        setFaviconUploading(false);
        setFaviconProgress(null);
      }
    };
    input.click();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save Cloudinary configuration
    saveCloudinaryConfig(cloudinaryCloudName, cloudinaryUploadPreset);
    setIsCloudinaryActive(Boolean(cloudinaryCloudName.trim() && cloudinaryUploadPreset.trim()));

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
      // Mobile Banking & COD Settings
      codChargeRate: Number(codChargeRate),
      bkashNumber,
      bkashType,
      bkashChargeRate: Number(bkashChargeRate),
      nagadNumber,
      nagadType,
      nagadChargeRate: Number(nagadChargeRate),
      rocketNumber,
      rocketType,
      rocketChargeRate: Number(rocketChargeRate),
      // Custom payment rules
      paymentInstructionsEn,
      paymentInstructionsBn,
      // Extra business switches
      maintenanceMode,
      orderIdPrefix
    });
    alert(isBn ? 'সেটিংস ও Cloudinary কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!' : 'Store settings & Cloudinary configurations saved successfully!');
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

              {/* Logo and Favicon Configuration with Live Previews & Upload Helpers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50">
                <div className="space-y-1">
                  <label>{isBn ? 'স্টোর লোগো রিসোর্স URL (Logo)' : 'Store Logo URL'}</label>
                  <div className="flex gap-2">
                    <input type="text" value={logo} onChange={(e) => setLogo(e.target.value)} className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[10px]" placeholder="https://..." />
                    <button
                      type="button"
                      onClick={handleLogoUpload}
                      disabled={logoUploading}
                      className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 rounded-xl flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                    >
                      {logoUploading ? <span>{logoProgress}%</span> : <span>Upload</span>}
                    </button>
                  </div>
                  {logo && (
                    <div className="mt-2 p-2 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 h-16 overflow-hidden">
                      <img src={logo} alt="Logo Preview" className="max-h-12 max-w-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label>{isBn ? 'স্টোর ফেভিকন URL (Favicon)' : 'Store Favicon URL'}</label>
                  <div className="flex gap-2">
                    <input type="text" value={favicon} onChange={(e) => setFavicon(e.target.value)} className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[10px]" placeholder="https://..." />
                    <button
                      type="button"
                      onClick={handleFaviconUpload}
                      disabled={faviconUploading}
                      className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 rounded-xl flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                    >
                      {faviconUploading ? <span>{faviconProgress}%</span> : <span>Upload</span>}
                    </button>
                  </div>
                  {favicon && (
                    <div className="mt-2 p-2 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 h-16 overflow-hidden">
                      <img src={favicon} alt="Favicon Preview" className="max-h-12 max-w-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
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
                    <input type="text" value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-pink-600 text-xs font-black" placeholder="e.g. 01913955452" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase">Account Type</label>
                    <select value={bkashType} onChange={(e) => setBkashType(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                      <option value="Personal">Personal (সেন্ড মানি)</option>
                      <option value="Agent">Agent (ক্যাশ আউট)</option>
                      <option value="Merchant">Merchant (পেমেন্ট)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-400 text-[10px] uppercase">Charge Rate (%)</label>
                      <span className="text-[10px] font-bold text-pink-650">ডিফল্ট: ১.৮৫%</span>
                    </div>
                    <input 
                      type="number" 
                      step="0.05" 
                      min="0" 
                      max="10" 
                      value={bkashChargeRate} 
                      onChange={(e) => setBkashChargeRate(Number(e.target.value))} 
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800" 
                      placeholder="1.85" 
                    />
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
                    <input type="text" value={nagadNumber} onChange={(e) => setNagadNumber(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-orange-600 text-xs font-black" placeholder="e.g. 01913955452" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase">Account Type</label>
                    <select value={nagadType} onChange={(e) => setNagadType(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                      <option value="Personal">Personal (সেন্ড মানি)</option>
                      <option value="Agent">Agent (ক্যাশ আউট)</option>
                      <option value="Merchant">Merchant (পেমেন্ট)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-400 text-[10px] uppercase">Charge Rate (%)</label>
                      <span className="text-[10px] font-bold text-orange-650">ডিফল্ট: ১.৫%</span>
                    </div>
                    <input 
                      type="number" 
                      step="0.05" 
                      min="0" 
                      max="10" 
                      value={nagadChargeRate} 
                      onChange={(e) => setNagadChargeRate(Number(e.target.value))} 
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800" 
                      placeholder="1.5" 
                    />
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
                    <input type="text" value={rocketNumber} onChange={(e) => setRocketNumber(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-purple-600 text-xs font-black" placeholder="e.g. 01913955452" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[10px] uppercase">Account Type</label>
                    <select value={rocketType} onChange={(e) => setRocketType(e.target.value as any)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                      <option value="Personal">Personal (সেন্ড মানি)</option>
                      <option value="Agent">Agent (ক্যাশ আউট)</option>
                      <option value="Merchant">Merchant (পেমেন্ট)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-slate-400 text-[10px] uppercase">Charge Rate (%)</label>
                      <span className="text-[10px] font-bold text-purple-650">ডিফল্ট: ১.৮%</span>
                    </div>
                    <input 
                      type="number" 
                      step="0.05" 
                      min="0" 
                      max="10" 
                      value={rocketChargeRate} 
                      onChange={(e) => setRocketChargeRate(Number(e.target.value))} 
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800" 
                      placeholder="1.8" 
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 4. Cloudinary Cloud Storage Configuration Card */}
          <div className="space-y-4 bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-6 rounded-2xl shadow-md border border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <span>{isBn ? 'Cloudinary ক্লাউড ইমেজ স্টোরেজ' : 'Cloudinary Media CDN Storage'}</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 uppercase">
                      {isCloudinaryActive ? (isBn ? 'সক্রিয় (Active)' : 'Active') : (isBn ? 'অফলাইন স্যান্ডবক্স' : 'Local Fallback')}
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-300 font-medium">
                    {isBn ? 'প্রোডাক্ট ছবি, ব্যানার ও অবতার সরাসরি ক্লাউডে সেভ ও সুপারফাস্ট ডেলিভারির জন্য।' : 'High-speed cloud image hosting & optimization for products, banners and avatars.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={cloudinaryTestLoading}
                  onClick={handleTestCloudinary}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${cloudinaryTestLoading ? 'animate-spin' : ''}`} />
                  <span>{cloudinaryTestLoading ? (isBn ? 'যাচাই হচ্ছে...' : 'Testing...') : (isBn ? 'কানেকশন টেস্ট করুন' : 'Test Connection')}</span>
                </button>
              </div>
            </div>

            {/* Form inputs for Cloudinary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {isBn ? 'Cloudinary Cloud Name *' : 'Cloudinary Cloud Name *'}
                </label>
                <input
                  type="text"
                  value={cloudinaryCloudName}
                  onChange={(e) => setCloudinaryCloudName(e.target.value.trim())}
                  placeholder="e.g. dxyz12345"
                  className="w-full p-2.5 bg-slate-800/90 border border-slate-600 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl text-white font-mono text-xs placeholder-slate-500"
                />
                <p className="text-[10px] text-slate-400">
                  {isBn ? 'আপনার Cloudinary Dashboard-এর Cloud Name।' : 'From your Cloudinary Dashboard account overview.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {isBn ? 'Unsigned Upload Preset Name *' : 'Unsigned Upload Preset Name *'}
                </label>
                <input
                  type="text"
                  value={cloudinaryUploadPreset}
                  onChange={(e) => setCloudinaryUploadPreset(e.target.value.trim())}
                  placeholder="e.g. taqwa_unsigned_preset"
                  className="w-full p-2.5 bg-slate-800/90 border border-slate-600 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl text-white font-mono text-xs placeholder-slate-500"
                />
                <p className="text-[10px] text-slate-400">
                  {isBn ? 'Cloudinary Settings > Upload > Upload Presets থেকে তৈরি করা Unsigned Preset।' : 'Must be set to "Unsigned" mode in Cloudinary settings.'}
                </p>
              </div>
            </div>

            {/* Test result banner if available */}
            {cloudinaryTestResult && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                cloudinaryTestResult.success 
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' 
                  : 'bg-red-950/60 border-red-500/50 text-red-300'
              }`}>
                {cloudinaryTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{cloudinaryTestResult.message}</span>
              </div>
            )}
          </div>

          {/* 5. Payment transfer guidelines Custom message */}
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

          {/* 5. Payment transfer guidelines Custom message */}
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

          {/* 6. Live Database Backup & Health Center */}
          <div className="space-y-4 bg-slate-50 border border-slate-150 p-4 sm:p-5 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-2 gap-2">
              <h4 className="text-slate-800 text-sm font-black flex items-center gap-1.5">
                <Database className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
                <span>{isBn ? 'MySQL ডাটাবেজ হেলথ ও ব্যাকআপ প্যানেল' : 'MySQL Database Health & Backup Center'}</span>
              </h4>
              <button 
                type="button" 
                onClick={fetchDbStatus} 
                disabled={isLoadingDbStatus}
                className="text-[10px] font-black text-slate-500 hover:text-emerald-600 flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg shadow-sm transition-all cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingDbStatus ? 'animate-spin text-emerald-600' : ''}`} />
                <span>{isBn ? 'রিফ্রেশ করুন' : 'Refresh Connection'}</span>
              </button>
            </div>

            {dbErrorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-700 text-[11px] font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{dbErrorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Status Spec */}
              <div className="bg-white p-3.5 border border-slate-150 rounded-xl space-y-2">
                <p className="text-[10px] uppercase text-slate-400 tracking-wider font-extrabold">{isBn ? 'সার্ভার কানেকশন' : 'Connection Status'}</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${dbStatus?.mysql?.connected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                  <span className="text-xs font-black text-slate-800">
                    {dbStatus?.mysql?.connected 
                      ? (isBn ? 'কানেক্টেড (MySQL)' : 'Connected (Active MySQL)') 
                      : (isBn ? 'অফলাইন ফলব্যাক মোড' : 'Offline Fallback Active')}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 space-y-0.5 leading-normal">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Server className="w-3 h-3" />
                    <span>Host: {dbStatus?.mysql?.host || 'Local persistent state'}</span>
                  </div>
                  <div>Database: {dbStatus?.mysql?.database || 'None'}</div>
                  <div>Port: {dbStatus?.mysql?.port || 'N/A'}</div>
                </div>
              </div>

              {/* Data Statistics */}
              <div className="bg-white p-3.5 border border-slate-150 rounded-xl space-y-2 col-span-2">
                <p className="text-[10px] uppercase text-slate-400 tracking-wider font-extrabold">{isBn ? 'লাইভ ডাটা রেকর্ড স্ট্যাটিস্টিকস' : 'Active Database Records Metrics'}</p>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-sm font-black text-emerald-700">{dbStatus?.localFilesystem?.productsCount ?? products.length}</span>
                    <span className="text-[9px] text-slate-500 font-extrabold">{isBn ? 'মোট পণ্য' : 'Products'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-sm font-black text-indigo-700">{dbStatus?.localFilesystem?.ordersCount ?? orders.length}</span>
                    <span className="text-[9px] text-slate-500 font-extrabold">{isBn ? 'মোট অর্ডার' : 'Orders'}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-sm font-black text-sky-700">{dbStatus?.localFilesystem?.usersCount ?? 0}</span>
                    <span className="text-[9px] text-slate-500 font-extrabold">{isBn ? 'মোট ইউজার' : 'Staffs'}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  {isBn 
                    ? '* হোস্টিংগার MySQL ডাটাবেজ ডিসকনেক্ট থাকলে সিস্টেম স্বয়ংক্রিয়ভাবে লোকাল ফলব্যাক মোডে ডেটা সেভ রাখবে।' 
                    : '* If MySQL is disconnected, Taqwa Core fallback automatically serves data locally with zero downtime.'}
                </p>
              </div>

            </div>

            {/* Back Up Button Trigger */}
            <div className="pt-2">
              <button 
                type="button"
                onClick={handleExportBackup}
                disabled={isExportingSql || !dbStatus?.mysql?.connected}
                className={`w-full p-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 border shadow-sm transition-all duration-200 cursor-pointer ${
                  dbStatus?.mysql?.connected
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800 hover:scale-[1.005]'
                    : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Download className={`w-4 h-4 ${isExportingSql ? 'animate-bounce' : ''}`} />
                <span>
                  {isExportingSql 
                    ? (isBn ? 'ব্যাকআপ জেনারেট হচ্ছে...' : 'Generating SQL Dump...') 
                    : (isBn ? '১-ক্লিকে ডাটাবেজ ব্যাকআপ ডাউনলোড করুন' : '1-Click Download SQL Database Backup')}
                </span>
              </button>
              <p className="text-[9.5px] text-slate-500 font-medium mt-1.5 leading-relaxed">
                {isBn 
                  ? '⚠️ নিরাপত্তা নির্দেশিকা: লাইভ ডাটাবেজের এই ডাম্প (.sql) ফাইলে কাস্টমার তালিকা, ইনভেন্টরি ক্যাটালগ ও হিসাবের বিবরণী সুরক্ষিত রয়েছে। ব্যাকআপটি বিশ্বস্ত ডিভাইসে ডাউনলোড ও নিরাপদ স্থানে সংরক্ষণ করুন।' 
                  : '⚠️ Security Guideline: This .sql dump file includes complete user directory, product stock inventory, and orders ledger. Keep this file in a highly secure destination.'}
              </p>
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
        <div className="space-y-6 animate-fade-in">
          {/* 1-Click Demo Data Clean Reset Panel */}
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-6 space-y-4">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-rose-950">
                  {isBn ? '১-ক্লিকে টেস্ট ডাটা রিসেট (Demo Data Clean Reset)' : '1-Click Demo Data Clean Reset'}
                </h4>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {isBn 
                    ? 'এই অপারেশনটি আপনার স্টোর থেকে সকল ডেমো পণ্য, কুপন, ভুয়া অর্ডার এবং টেস্ট কাস্টমার অ্যাকাউন্টগুলো ডাটাবেজ থেকে চিরতরে মুছে ফেলবে। এটি সম্পন্ন করার পর আপনার ওয়েবসাইটটি একদম নতুন ও সম্পূর্ণ ফ্রেশ অবস্থায় আপনার আসল পণ্য বিক্রির জন্য প্রস্তুত হবে।' 
                    : 'This utility permanently deletes all dummy products, demo orders, test accounts, and associated statistics from the system database. This action is final and irreversible.'}
                </p>
              </div>
            </div>

            {/* Inline Confirmation Toggle */}
            <div className="pt-2 border-t border-rose-200/40">
              {resetSuccessMsg ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{resetSuccessMsg}</span>
                </div>
              ) : showResetConfirm ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/65 p-4 rounded-xl border border-rose-200 animate-pulse">
                  <span className="text-xs font-black text-rose-900">
                    {isBn ? '⚠️ আপনি কি নিশ্চিতভাবে সব ডেমো ডেটা মুছে দিতে চান?' : '⚠️ Are you absolutely sure you want to wipe all demo records?'}
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={handleCleanReset}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg transition duration-200 flex items-center gap-1"
                    >
                      {isResetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>{isBn ? 'হ্যাঁ, সম্পূর্ণ মুছে ফেলুন' : 'Yes, Delete All'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg transition duration-200"
                    >
                      {isBn ? 'বাতিল' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 transition duration-200 shadow-2xs hover:shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isBn ? 'সব ডেমো ও ডামি ডাটা ডিলিট করুন' : 'Clean & Reset Store Database'}</span>
                </button>
              )}
            </div>
          </div>

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
