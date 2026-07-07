import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, MapPin, Bell, Trash2, Edit2, Check, Plus, Mail, Phone, 
  ArrowLeft, Sparkles, Shield, Award, Map, Copy, CheckSquare,
  Home, Briefcase, CreditCard, ChevronRight, Upload, Info, BellRing, Ticket,
  Package, Truck, MessageSquare, Headphones, LogOut, Settings, Clock, AlertCircle
} from 'lucide-react';
import { User, Address, StoreNotification, Order } from '../types';

interface ProfilePageProps {
  user: User;
  lang: 'en' | 'bn';
  onBack: () => void;
  onUpdateUser: (updatedFields: Partial<User>) => Promise<void>;
  notifications: StoreNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  pastOrders?: Order[];
  onNavigate?: (tab: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
];

const t = {
  bn: {
    verifiedMember: 'ভেরিফাইড মেম্বার',
    accountCreated: 'নিবন্ধিত হয়েছেন',
    addresses: 'ঠিকানা বুক',
    alerts: 'নোটিফিকেশন',
    unread: 'ইনবক্স',
    myOrders: 'আমার অর্ডার সমূহ',
    viewAllOrders: 'সবগুলো দেখুন',
    toPay: 'পেমেন্ট করুন',
    toShip: 'অপেক্ষারত',
    toReceive: 'গ্রহণের অপেক্ষায়',
    toReview: 'রিভিউ দিন',
    accountServices: 'অ্যাকাউন্ট সার্ভিস সমূহ',
    personalProfile: 'প্রোফাইল সংশোধন',
    personalProfileDesc: 'আপনার নাম, ফোন ও প্রোফাইল ছবি পরিবর্তন করুন',
    addressBook: 'ঠিকানা বুক',
    addressBookDesc: 'ডেলিভারি ঠিকানা যুক্ত ও এডিট করুন',
    notifications: 'নোটিফিকেশন ও অফার',
    notificationsDesc: 'অফার কুপন ও ডিসকাউন্ট কোড সমূহ',
    orderTracking: 'অর্ডার ট্র্যাকিং',
    orderTrackingDesc: 'অর্ডারের অবস্থান লাইভ ট্র্যাকিং করুন',
    support: 'হেল্প সেন্টার ও চ্যাট',
    supportDesc: 'আমাদের সাথে সরাসরি যোগাযোগ করুন',
    backToShop: 'স্টোরে ফিরে যান',
    backToShopDesc: 'তাকওয়া এন্টারপ্রাইজ প্রধান শপ',
    modifyProfile: 'ব্যক্তিগত প্রোফাইল তথ্য সংশোধন',
    modifyProfileDesc: 'আপনার প্রোফাইল নাম, মোবাইল নাম্বার এবং একটি চমৎকার অবতার ছবি নির্বাচন করুন।',
    profileSuccess: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!',
    avatarPresets: 'অবতার ছবি গ্যালারি থেকে নির্বাচন করুন',
    holderName: 'গ্রাহকের পুরো নাম *',
    phoneNum: 'মোবাইল নাম্বার *',
    registeredEmail: 'নিবন্ধিত ইমেইল অ্যাড্রেস',
    emailLockHint: '💡 সুরক্ষার খাতিরে মূল অ্যাকাউন্ট ইমেইল পরিবর্তনযোগ্য নয়।',
    saveSettings: 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন',
    saving: 'সংরক্ষণ করা হচ্ছে...',
    savedAddresses: 'সংরক্ষিত ডেলিভারি ঠিকানা বুক',
    addressBookHint: 'দ্রুত চেকআউটের জন্য আপনার স্থায়ী ও অস্থায়ী ঠিকানা বুক সেটআপ করুন।',
    addNewAddress: 'নতুন ঠিকানা যোগ করুন',
    editAddress: 'ঠিকানা বুক হালনাগাদ করুন',
    registerAddress: 'নতুন ডেলিভারি ঠিকানা নথিভুক্ত করুন',
    addressLabel: 'ঠিকানার লেবেল বা ধরন',
    districtSelect: 'জেলা নির্বাচন করুন *',
    detailsAddress: 'বিস্তারিত ডেলিভারি ঠিকানা *',
    recipientPhone: 'প্রাপকের মোবাইল নাম্বার *',
    cancel: 'বাতিল',
    confirmSave: 'ঠিকানাটি সংরক্ষণ করুন',
    noAddresses: 'কোনো সংরক্ষিত ঠিকানা পাওয়া যায়নি। চেকআউটে সাহায্য করতে একটি ঠিকানা যোগ করুন।',
    contactNum: 'যোগাযোগ নম্বর: ',
    edit: 'সংশোধন',
    delete: 'মুছুন',
    broadcastCenter: 'নোটিফিকেশন ও অফার এলার্ম',
    broadcastDesc: 'তাকওয়া এন্টারপ্রাইজ থেকে পাঠানো সাম্প্রতিক অফার, নোটিফিকেশন ও ডিসকাউন্ট কুপন কোড সমূহ।',
    markAllRead: 'সবগুলো পঠিত মার্ক করুন',
    noNotifications: 'কোনো নোটিফিকেশন বা অফার এলার্ম পাওয়া যায়নি।',
    promoTicket: 'ডিসকাউন্ট কুপন',
    copied: 'কপি হয়েছে',
    copyCode: 'কুপন কপি',
    backToDashboard: 'ড্যাশবোর্ডে ফিরে যান'
  },
  en: {
    verifiedMember: 'Verified Member',
    accountCreated: 'Account Created',
    addresses: 'Addresses',
    alerts: 'Alerts',
    unread: 'Unread',
    myOrders: 'My Orders',
    viewAllOrders: 'View All',
    toPay: 'To Pay',
    toShip: 'To Ship',
    toReceive: 'To Receive',
    toReview: 'To Review',
    accountServices: 'Account Services',
    personalProfile: 'Edit Profile',
    personalProfileDesc: 'Modify your name, phone number, and photo',
    addressBook: 'Address Book',
    addressBookDesc: 'Manage your saved delivery locations',
    notifications: 'Inbox & Offers',
    notificationsDesc: 'Promo coupons, discounts, and news',
    orderTracking: 'Order Tracking',
    orderTrackingDesc: 'Live status tracking of your parcel',
    support: 'Help Center & Chat',
    supportDesc: 'Get in touch with support instantly',
    backToShop: 'Back to Shop',
    backToShopDesc: 'Return to Taqwa Enterprise main shop',
    modifyProfile: 'Modify Personal Profile Credentials',
    modifyProfileDesc: 'Establish your account holder credentials and personalized avatar displays.',
    profileSuccess: 'Profile details updated successfully!',
    avatarPresets: 'Choose Dynamic Avatar Preset:',
    holderName: 'Account Holder Name *',
    phoneNum: 'Mobile Phone Number *',
    registeredEmail: 'Registered Email ID',
    emailLockHint: '💡 Registered email address is locked for account verification security.',
    saveSettings: 'Save Account Settings',
    saving: 'Saving updates...',
    savedAddresses: 'Saved Shipping Locations',
    addressBookHint: 'Register and manage saved delivery parameters to accelerate checkout speeds.',
    addNewAddress: 'Add New Address',
    editAddress: 'Edit Shipping Location Parameters',
    registerAddress: 'Register New Shipping Location',
    addressLabel: 'Location Nickname Label',
    districtSelect: 'District/Region *',
    detailsAddress: 'Delivery Address Details *',
    recipientPhone: 'Recipient Phone Number *',
    cancel: 'Cancel',
    confirmSave: 'Confirm Save Location',
    noAddresses: 'No addresses registered yet. Save shipping credentials below for instant checkouts.',
    contactNum: 'Contact: ',
    edit: 'Edit',
    delete: 'Delete',
    broadcastCenter: 'Broadcast Center & Promos',
    broadcastDesc: 'Track active system notifications, discount structures, and localized order summaries.',
    markAllRead: 'Mark All As Read',
    noNotifications: 'Your inbox is completely clear! No announcements active currently.',
    promoTicket: 'Promo Ticket Code',
    copied: 'Copied!',
    copyCode: 'Copy Code',
    backToDashboard: 'Back to Dashboard'
  }
};

export default function ProfilePage({
  user,
  lang,
  onBack,
  onUpdateUser,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  pastOrders = [],
  onNavigate
}: ProfilePageProps) {
  const isBn = lang === 'bn';
  const labels = isBn ? t.bn : t.en;

  // Active view: on mobile we show a list of services (null = Dashboard list)
  // Clicking a service changes the subview so that mobile remains ultra clean, backable, and robust.
  // On desktop we can keep a side-by-side split layout.
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'notifications'>('profile');
  const [mobileSubView, setMobileSubView] = useState<'profile' | 'addresses' | 'notifications' | null>(null);

  // Profile Form State
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || AVATAR_PRESETS[0]);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');

  // Custom Cloudinary Avatar State
  const [avatarProgress, setAvatarProgress] = useState<number | null>(null);
  const [avatarStatus, setAvatarStatus] = useState('');

  // Sync state if user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setSelectedAvatar(user.avatar || AVATAR_PRESETS[0]);
    }
  }, [user]);

  const handleCustomAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarProgress(0);
    setAvatarStatus(isBn ? 'প্রোফাইল ছবি প্রস্তুত করা হচ্ছে...' : 'Processing profile picture...');

    try {
      const { uploadImage } = await import('../lib/cloudinary');
      
      const url = await uploadImage(file, {
        onProgress: (percent) => {
          setAvatarProgress(percent);
          setAvatarStatus(
            percent < 100 
              ? (isBn ? `আপলোড হচ্ছে: ${percent}%` : `Uploading: ${percent}%`)
              : (isBn ? 'সম্পন্ন হচ্ছে...' : 'Finalizing...')
          );
        },
        compress: true
      });

      setSelectedAvatar(url);
      setAvatarProgress(null);
      setAvatarStatus('');
      
      // Save instantly
      await onUpdateUser({ avatar: url });
    } catch (err: any) {
      setAvatarProgress(null);
      setAvatarStatus('');
      alert(isBn ? `আপলোড ব্যর্থ হয়েছে: ${err.message}` : `Upload failed: ${err.message}`);
    }
  };

  // Address Desk Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [addressDistrict, setAddressDistrict] = useState('Dhaka');
  const [addressPhone, setAddressPhone] = useState('');

  const [copiedNotificationId, setCopiedNotificationId] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccessMessage('');
    try {
      await onUpdateUser({
        name,
        phone,
        email,
        avatar: selectedAvatar
      });
      setProfileSuccessMessage(labels.profileSuccess);
      setTimeout(() => setProfileSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim() || !addressPhone.trim()) return;

    const currentAddresses = user.addresses || [];
    let updatedAddresses: Address[] = [];

    if (editingAddressId) {
      updatedAddresses = currentAddresses.map(addr => 
        addr.id === editingAddressId 
          ? { ...addr, label: addressLabel, addressLine, district: addressDistrict, phone: addressPhone }
          : addr
      );
    } else {
      const newAddress: Address = {
        id: `addr-${Date.now()}`,
        label: addressLabel,
        addressLine,
        district: addressDistrict,
        phone: addressPhone
      };
      updatedAddresses = [...currentAddresses, newAddress];
    }

    try {
      await onUpdateUser({ addresses: updatedAddresses });
      setAddressLabel('Home');
      setAddressLine('');
      setAddressDistrict('Dhaka');
      setAddressPhone('');
      setEditingAddressId(null);
      setShowAddressForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const currentAddresses = user.addresses || [];
    const updated = currentAddresses.filter(addr => addr.id !== addressId);
    try {
      await onUpdateUser({ addresses: updated });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    setAddressLine(addr.addressLine);
    setAddressDistrict(addr.district);
    setAddressPhone(addr.phone);
    setShowAddressForm(true);
  };

  const handleCopyCoupon = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotificationId(id);
    setTimeout(() => {
      setCopiedNotificationId(null);
    }, 2000);
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Calculate Daraz-style Order Status Counts
  const toPayCount = pastOrders.filter(
    (o) => o.paymentStatus === 'Pending' && o.paymentMethod !== 'Cash on Delivery' && o.orderStatus !== 'Cancelled'
  ).length;

  const toShipCount = pastOrders.filter(
    (o) => ['Pending', 'Confirmed', 'Processing'].includes(o.orderStatus)
  ).length;

  const toReceiveCount = pastOrders.filter(
    (o) => ['Shipped', 'Out for Delivery'].includes(o.orderStatus)
  ).length;

  const toReviewCount = pastOrders.filter(
    (o) => ['Delivered', 'Completed'].includes(o.orderStatus)
  ).length;

  // Shared Header Content
  const renderHeader = () => (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white shadow-xl">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          
          {/* Avatar frame */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/45 ring-4 ring-white/15 bg-slate-100 flex items-center justify-center shadow-lg relative">
              <img 
                src={selectedAvatar} 
                alt={user.name || 'User'} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              
              {avatarProgress !== null && (
                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white p-1 text-center">
                  <span className="text-[10px] font-black">{avatarProgress}%</span>
                  <span className="text-[7px] text-emerald-350 font-medium animate-pulse truncate max-w-full">{avatarStatus}</span>
                </div>
              )}
            </div>
            
            {/* Camera trigger */}
            <label className="absolute -bottom-1 -right-1 bg-emerald-600 hover:bg-emerald-700 border-2 border-white text-white p-2 rounded-full cursor-pointer shadow-md transition-transform scale-95 hover:scale-105">
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleCustomAvatarUpload} className="hidden" />
            </label>
          </div>

          {/* User basic details */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl font-black tracking-tight">{user.name || (isBn ? 'সম্মানিত গ্রাহক' : 'Customer')}</h1>
              <span className="inline-flex items-center gap-1 bg-white/15 border border-white/25 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                <Shield className="w-3 h-3 text-emerald-350 fill-emerald-350" />
                <span>{labels.verifiedMember}</span>
              </span>
            </div>
            
            <p className="text-emerald-100 text-xs font-semibold flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 opacity-85 shrink-0" />
              <span>{user.email}</span>
              {user.phone && (
                <>
                  <span className="opacity-40">|</span>
                  <Phone className="w-3.5 h-3.5 opacity-85 shrink-0" />
                  <span>{user.phone}</span>
                </>
              )}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-[11px] text-emerald-100/90 font-bold">
              <Award className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>{labels.accountCreated}: {user.joinedAt || '2026-06-21'}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] uppercase tracking-wider font-extrabold ml-1">
                {user.role || 'Customer'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Block */}
        <div className="grid grid-cols-3 gap-3 self-center bg-white/10 border border-white/10 p-3.5 rounded-2xl backdrop-blur-xs max-w-full md:max-w-xs w-full text-center">
          <div className="space-y-0.5">
            <p className="text-[9px] text-emerald-100 font-bold uppercase tracking-wider">{labels.addresses}</p>
            <p className="text-lg font-black">{user.addresses?.length || 0}</p>
          </div>
          <div className="space-y-0.5 border-x border-white/10">
            <p className="text-[9px] text-emerald-100 font-bold uppercase tracking-wider">{labels.alerts}</p>
            <p className="text-lg font-black">{notifications.length}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[9px] text-emerald-100 font-bold uppercase tracking-wider">{labels.unread}</p>
            <p className="text-lg font-black text-rose-300 font-mono animate-pulse">{unreadNotifications}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-3 sm:px-4 py-4" id="profile-page-viewport">
      
      {/* 1. Mobile & Tablet Modern Dashboard Mode */}
      {/* If subview is null on mobile, display the primary Daraz Account Hub. If not, render the specific nested subview with a beautiful header. */}
      <div className="block lg:hidden space-y-6">
        {mobileSubView === null ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-5"
          >
            {/* User Identity Header Card */}
            {renderHeader()}

            {/* 2. Daraz-style My Orders Section */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4.5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <Package className="w-4.5 h-4.5 text-emerald-600" />
                  <span>{labels.myOrders}</span>
                </h3>
                <button 
                  onClick={() => onNavigate?.('my-orders')}
                  className="text-[11px] font-black text-emerald-600 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>{labels.viewAllOrders}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 4 Order Status Nodes Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { id: 'toPay', label: labels.toPay, count: toPayCount, icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
                  { id: 'toShip', label: labels.toShip, count: toShipCount, icon: Clock, color: 'text-blue-600 bg-blue-50' },
                  { id: 'toReceive', label: labels.toReceive, count: toReceiveCount, icon: Truck, color: 'text-indigo-600 bg-indigo-50' },
                  { id: 'toReview', label: labels.toReview, count: toReviewCount, icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate?.('my-orders')}
                      className="flex flex-col items-center gap-2 p-2 hover:bg-slate-50 rounded-xl transition-all relative group cursor-pointer"
                    >
                      <div className={`p-3 rounded-2xl ${item.color} relative transition-transform group-hover:scale-105`}>
                        <Icon className="w-5 h-5 stroke-[2]" />
                        {item.count > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                            {item.count}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-600 leading-tight">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. High Density Services Grid */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4.5 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                {labels.accountServices}
              </h3>

              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { id: 'profile', title: labels.personalProfile, desc: labels.personalProfileDesc, icon: UserIcon, color: 'bg-emerald-50 text-emerald-600' },
                  { id: 'addresses', title: labels.addressBook, desc: labels.addressBookDesc, icon: MapPin, color: 'bg-indigo-50 text-indigo-600', badge: user.addresses?.length },
                  { id: 'notifications', title: labels.notifications, desc: labels.notificationsDesc, icon: Bell, color: 'bg-rose-50 text-rose-600', badge: unreadNotifications },
                  { id: 'track', title: labels.orderTracking, desc: labels.orderTrackingDesc, icon: Truck, color: 'bg-amber-50 text-amber-600' },
                  { id: 'support', title: labels.support, desc: labels.supportDesc, icon: Headphones, color: 'bg-purple-50 text-purple-600' }
                ].map((serv) => {
                  const Icon = serv.icon;
                  return (
                    <button
                      key={serv.id}
                      onClick={() => {
                        if (serv.id === 'track') {
                          onNavigate?.('track');
                        } else if (serv.id === 'support') {
                          // Jump to contact or assistant chat if possible, or support trigger
                          onNavigate?.('track'); // typical support link or similar
                        } else {
                          setActiveTab(serv.id as any);
                          setMobileSubView(serv.id as any);
                        }
                      }}
                      className="flex flex-col items-start p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-250 rounded-2xl text-left transition-all relative group cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <span className={`p-2 rounded-xl ${serv.color}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        {serv.badge !== undefined && serv.badge > 0 && (
                          <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                            {serv.badge}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-[11px] font-black text-slate-800 leading-tight mb-1">
                        {serv.title}
                      </h4>
                      <p className="text-[9px] font-semibold text-slate-400 leading-snug">
                        {serv.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exit Action Panel */}
            <button
              onClick={onBack}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xxs flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>{labels.backToShop}</span>
            </button>
          </motion.div>
        ) : (
          /* Mobile Nested Subview Content with direct Back to Dashboard Button on Top */
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Nav Back Header */}
            <button
              onClick={() => setMobileSubView(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-2xl text-xs font-black transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>{labels.backToDashboard}</span>
            </button>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              {mobileSubView === 'profile' && renderProfileForm()}
              {mobileSubView === 'addresses' && renderAddressesForm()}
              {mobileSubView === 'notifications' && renderNotificationsForm()}
            </div>
          </motion.div>
        )}
      </div>

      {/* 2. Desktop Mode Side-by-Side Control Center Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-8">
        
        {/* Left Hand: Sleek Side Control Panel (Bento Sidebar) */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-4.5 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
              {isBn ? 'মেনু কন্ট্রোল প্যানেল' : 'Dashboard Hub'}
            </h3>
            
            <div className="space-y-1.5">
              {[
                { id: 'profile', label: labels.personalProfile, desc: labels.personalProfileDesc, icon: UserIcon },
                { id: 'addresses', label: labels.addressBook, desc: labels.addressBookDesc, icon: MapPin, badge: user.addresses?.length },
                { id: 'notifications', label: labels.notifications, desc: labels.notificationsDesc, icon: Bell, badge: unreadNotifications, badgeColor: 'bg-rose-500' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-[1.01]'
                        : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-700 hover:text-slate-900 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`p-2 rounded-xl transition-colors ${
                        isSelected ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="text-xs font-black leading-tight">{tab.label}</p>
                        <p className={`text-[9px] font-bold mt-0.5 ${isSelected ? 'text-emerald-100/80' : 'text-slate-400'}`}>{tab.desc}</p>
                      </div>
                    </div>
                    
                    {tab.badge !== undefined && tab.badge > 0 ? (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black leading-none ${
                        isSelected 
                          ? 'bg-white text-emerald-800 shadow-xs' 
                          : (tab.badgeColor || 'bg-emerald-100 text-emerald-800')
                      }`}>
                        {tab.badge}
                      </span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-white' : 'text-slate-300 group-hover:translate-x-0.5'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Support Card inside Sidebar */}
          <div className="bg-gradient-to-br from-indigo-550 to-indigo-700 rounded-3xl p-5 text-white shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full blur-lg" />
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-emerald-300 animate-pulse" />
              <h4 className="text-xs font-black">{isBn ? 'সহায়তা দরকার?' : 'Need Help?'}</h4>
            </div>
            <p className="text-[10px] leading-relaxed font-bold text-slate-100">
              {isBn ? 'আপনার যেকোনো জিজ্ঞাসা বা ডেলিভারির আপডেট পেতে আমাদের সাপোর্ট সেন্টারে সরাসরি কল করতে পারেন।' : 'Directly query active delivery pipelines or dispatch statuses.'}
            </p>
            <div className="pt-1.5 flex flex-col gap-1 text-[10px] font-mono font-black text-emerald-200">
              <span className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg">📞 01700-000000</span>
            </div>
          </div>

          {/* Return Store action block */}
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-xxs"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>{labels.backToShop}</span>
          </button>
        </div>

        {/* Right Hand Workspace content center */}
        <div className="col-span-3 space-y-6">
          {renderHeader()}

          {/* Daraz-style My Orders Section inside desktop too for complete consistency */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>{labels.myOrders}</span>
              </h3>
              <button 
                onClick={() => onNavigate?.('my-orders')}
                className="text-xs font-black text-emerald-600 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>{labels.viewAllOrders}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Order Status Nodes Grid */}
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { id: 'toPay', label: labels.toPay, count: toPayCount, icon: CreditCard, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100/50' },
                { id: 'toShip', label: labels.toShip, count: toShipCount, icon: Clock, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100/50' },
                { id: 'toReceive', label: labels.toReceive, count: toReceiveCount, icon: Truck, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100/50' },
                { id: 'toReview', label: labels.toReview, count: toReviewCount, icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100/50' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate?.('my-orders')}
                    className="flex flex-col items-center gap-3.5 p-3 rounded-2xl border border-slate-50 hover:border-slate-200 transition-all relative group cursor-pointer"
                  >
                    <div className={`p-4 rounded-2xl ${item.color} relative transition-transform group-hover:scale-105`}>
                      <Icon className="w-6 h-6 stroke-[2]" />
                      {item.count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ring-2 ring-white">
                          {item.count}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-black text-slate-700">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm relative overflow-hidden min-h-[420px]">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile-tab-desktop"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderProfileForm()}
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses-tab-desktop"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderAddressesForm()}
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications-tab-desktop"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {renderNotificationsForm()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );

  // RENDERING HELPERS: PERSONAL PROFILE
  function renderProfileForm() {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <UserIcon className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-black text-slate-800">{labels.modifyProfile}</h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              {labels.modifyProfileDesc}
            </p>
          </div>
        </div>

        {profileSuccessMessage && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-extrabold border border-emerald-100 flex items-center gap-3.5 shadow-xxs"
          >
            <Sparkles className="w-5 h-5 text-emerald-600 animate-bounce shrink-0" />
            <span>{profileSuccessMessage}</span>
          </motion.div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6 text-xs font-extrabold text-slate-650">
          
          {/* Avatar Preset Grid */}
          <div className="space-y-3.5">
            <label className="text-slate-400 uppercase tracking-wider text-[10px] block pl-1">
              {labels.avatarPresets}
            </label>
            
            <div className="flex flex-wrap gap-3 p-4 bg-slate-50/75 border border-slate-100 rounded-2xl">
              {AVATAR_PRESETS.map((preset, idx) => {
                const isSelected = selectedAvatar === preset;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(preset)}
                    className={`w-14 h-14 rounded-full overflow-hidden border-3 transition-all cursor-pointer relative shadow-xxs shrink-0 ${
                      isSelected ? 'border-emerald-600 scale-105 shadow-md shadow-emerald-500/10' : 'border-white hover:border-slate-350'
                    }`}
                  >
                    <img src={preset} alt="Avatar preset option" className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-emerald-600/35 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white stroke-[3.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inputs Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-slate-500 pl-1">{labels.holderName}</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-3 focus:ring-emerald-500/10 focus:border-emerald-500 rounded-2xl font-extrabold text-slate-850 transition-all outline-hidden text-xs"
                  placeholder={isBn ? 'যেমন: রাফসান করিম' : 'Rafsan Karim'}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-slate-500 pl-1">{labels.phoneNum}</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017********"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-3 focus:ring-emerald-500/10 focus:border-emerald-500 rounded-2xl font-extrabold text-slate-850 transition-all outline-hidden text-xs"
                />
              </div>
            </div>
          </div>

          {/* Locked Registered Email */}
          <div className="space-y-1.5">
            <label className="text-slate-400 pl-1">{labels.registeredEmail}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-350 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email" 
                required 
                disabled 
                value={email}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl font-extrabold text-slate-450 cursor-not-allowed outline-hidden text-xs"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-bold leading-normal block px-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{labels.emailLockHint}</span>
            </span>
          </div>

          {/* Action Trigger */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={updatingProfile}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl font-black transition-all shadow-md shadow-emerald-600/15 cursor-pointer flex items-center gap-2 hover:scale-[1.01]"
            >
              {updatingProfile ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{labels.saving}</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span>{labels.saveSettings}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // RENDERING HELPERS: SAVED ADDRESSES
  function renderAddressesForm() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-800">{labels.savedAddresses}</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {labels.addressBookHint}
              </p>
            </div>
          </div>

          {!showAddressForm && (
            <button
              onClick={() => {
                setEditingAddressId(null);
                setAddressLabel('Home');
                setAddressLine('');
                setAddressDistrict('Dhaka');
                setAddressPhone(user.phone || '');
                setShowAddressForm(true);
              }}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-black transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{labels.addNewAddress}</span>
            </button>
          )}
        </div>

        {/* Address edit form */}
        {showAddressForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleSaveAddress} 
            className="bg-slate-50/50 border-2 border-dashed border-emerald-500/20 p-5 rounded-2xl text-xs font-extrabold text-slate-650 space-y-4 shadow-inner"
          >
            <h4 className="text-xs font-black text-slate-850 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>{editingAddressId ? labels.editAddress : labels.registerAddress}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-500 pl-1">{labels.addressLabel}</label>
                <div className="relative">
                  <select
                    value={addressLabel}
                    onChange={(e) => setAddressLabel(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-extrabold text-slate-700 cursor-pointer focus:ring-3 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-hidden appearance-none"
                  >
                    <option value="Home">🏠 Home (বাসা)</option>
                    <option value="Office">🏢 Office (অফিস)</option>
                    <option value="Billing">💳 Billing (পেমেন্ট)</option>
                    <option value="Other">📍 Other (অন্যান্য)</option>
                  </select>
                  <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 font-bold">▼</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 pl-1">{labels.districtSelect}</label>
                <div className="relative">
                  <select
                    value={addressDistrict}
                    onChange={(e) => setAddressDistrict(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-extrabold text-slate-700 cursor-pointer focus:ring-3 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-hidden appearance-none"
                  >
                    <option value="Dhaka">Dhaka City (৳60 Delivery)</option>
                    <option value="Chittagong">Chittagong Region (৳120 Delivery)</option>
                    <option value="Sylhet">Sylhet Region (৳120 Delivery)</option>
                    <option value="Rajshahi">Rajshahi Region (৳120 Delivery)</option>
                    <option value="Khulna">Khulna Region (৳120 Delivery)</option>
                    <option value="Barisal">Barisal Region (৳120 Delivery)</option>
                    <option value="Rangpur">Rangpur Region (৳120 Delivery)</option>
                    <option value="Mymensingh">Mymensingh Region (৳120 Delivery)</option>
                  </select>
                  <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 font-bold">▼</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 pl-1">{labels.detailsAddress}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <MapPin className="w-4 h-4" />
                </span>
                <input
                  type="text" 
                  required 
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder={isBn ? 'যেমন: ফ্ল্যাট ৪এ, বাড়ি নং- ২৪, রোড নং- ২, ব্লক সি, উত্তরা' : 'e.g. Flat 4A, House 24, Road 2, Block C, Uttara'}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-3 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-hidden text-xs font-extrabold text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-500 pl-1">{labels.recipientPhone}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel" 
                  required 
                  value={addressPhone}
                  onChange={(e) => setAddressPhone(e.target.value)}
                  placeholder="017********"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-3 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-hidden text-xs font-extrabold text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-200/50">
              <button
                type="button"
                onClick={() => {
                  setEditingAddressId(null);
                  setShowAddressForm(false);
                }}
                className="px-4 py-2 bg-white border border-slate-250 text-slate-650 rounded-xl font-bold hover:bg-slate-100 cursor-pointer"
              >
                {labels.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
              >
                {labels.confirmSave}
              </button>
            </div>
          </motion.form>
        )}

        {/* Address Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {!user.addresses || user.addresses.length === 0 ? (
            <div className="sm:col-span-2 text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/40">
              <Map className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-400 italic font-bold">
                {labels.noAddresses}
              </p>
            </div>
          ) : (
            user.addresses.map((addr) => {
              const isHome = addr.label === 'Home';
              const isOffice = addr.label === 'Office';
              const isBilling = addr.label === 'Billing';
              
              return (
                <div 
                  key={addr.id} 
                  className="bg-white border border-slate-150 hover:border-emerald-500 p-5 rounded-2xl relative shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-md group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-xl ${
                        isHome ? 'bg-blue-50 text-blue-800 border border-blue-100' :
                        isOffice ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                        isBilling ? 'bg-purple-50 text-purple-800 border border-purple-100' :
                        'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      }`}>
                        {isHome && <Home className="w-3.5 h-3.5" />}
                        {isOffice && <Briefcase className="w-3.5 h-3.5" />}
                        {isBilling && <CreditCard className="w-3.5 h-3.5" />}
                        {!isHome && !isOffice && !isBilling && <MapPin className="w-3.5 h-3.5" />}
                        <span>{addr.label}</span>
                      </span>
                      
                      <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        {addr.district}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-750 font-extrabold leading-relaxed pr-1">
                      {addr.addressLine}
                    </p>
                    
                    <p className="text-[10px] text-slate-450 font-bold flex items-center gap-1.5 bg-slate-50/50 p-2 rounded-xl border border-slate-100/50">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{labels.contactNum} <strong className="text-slate-750">{addr.phone}</strong></span>
                    </p>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 pt-3 justify-end text-xs font-black">
                    <button
                      onClick={() => handleStartEditAddress(addr)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-250 text-slate-600 rounded-xl cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-450 group-hover:text-emerald-600" />
                      <span>{labels.edit}</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="px-3 py-1.5 bg-rose-50/50 border border-rose-100 hover:bg-rose-100 hover:border-rose-300 text-rose-650 rounded-xl cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>{labels.delete}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // RENDERING HELPERS: PROMOS & NOTIFICATIONS
  function renderNotificationsForm() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <BellRing className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-800">{labels.broadcastCenter}</h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {labels.broadcastDesc}
              </p>
            </div>
          </div>

          {notifications.some(n => !n.isRead) && (
            <button
              onClick={onMarkAllNotificationsAsRead}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-700 cursor-pointer transition-colors shadow-xxs"
            >
              {labels.markAllRead}
            </button>
          )}
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/40 rounded-3xl border border-dashed border-slate-200">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-400 italic font-bold">
                {labels.noNotifications}
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isPromo = notif.type === 'promo';
              const isCoupon = notif.type === 'coupon';
              const isOrder = notif.type === 'order';
              
              const couponMatch = notif.message.match(/[A-Z0-9]{4,10}/);
              const couponCode = couponMatch ? couponMatch[0] : 'TAQWA10';

              return (
                <div 
                  key={notif.id}
                  onClick={() => {
                    if (!notif.isRead) {
                      onMarkNotificationAsRead(notif.id);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition-all relative flex flex-col md:flex-row md:items-start gap-4 cursor-pointer hover:shadow-xs group ${
                    notif.isRead 
                      ? 'bg-white border-slate-150 opacity-80 hover:opacity-100' 
                      : 'bg-linear-to-b from-emerald-50/20 to-white border-emerald-100 shadow-xxs'
                  }`}
                >
                  {!notif.isRead && (
                    <span className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100 animate-pulse"></span>
                  )}

                  <div className={`p-3 rounded-2xl shrink-0 self-start ${
                    isOrder ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    isCoupon ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    isPromo ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                    'bg-slate-50 text-slate-600 border border-slate-150'
                  }`}>
                    {isOrder && <CheckSquare className="w-5 h-5" />}
                    {isCoupon && <Ticket className="w-5 h-5" />}
                    {isPromo && <Sparkles className="w-5 h-5" />}
                    {!isOrder && !isCoupon && !isPromo && <Info className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <span className={`text-sm font-black leading-tight ${notif.isRead ? 'text-slate-800' : 'text-emerald-950 font-black'}`}>
                        {isBn ? (notif.titleBn || notif.title) : notif.title}
                      </span>
                      
                      <span className="text-[9px] font-mono font-bold text-slate-400">
                        {notif.createdAt}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-550 leading-relaxed font-bold">
                      {isBn ? (notif.messageBn || notif.message) : notif.message}
                    </p>

                    {(isPromo || isCoupon) && (
                      <div className="inline-flex items-center gap-3 p-3 bg-linear-to-r from-emerald-50 to-teal-50/50 border-2 border-dashed border-emerald-250 rounded-2xl max-w-sm mt-1 relative">
                        <div className="space-y-0.5">
                          <p className="text-[8px] text-emerald-700 font-extrabold uppercase tracking-widest">{labels.promoTicket}</p>
                          <span className="font-mono text-emerald-900 font-black text-xs tracking-wider select-all uppercase">{couponCode}</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCoupon(couponCode, notif.id);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black cursor-pointer flex items-center gap-1 transition-all shadow-xs shrink-0"
                        >
                          {copiedNotificationId === notif.id ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>{labels.copied}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{labels.copyCode}</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
}
