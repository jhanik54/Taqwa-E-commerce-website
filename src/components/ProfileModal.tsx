import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User as UserIcon, MapPin, Bell, Trash2, Edit2, Check, Plus, ClipboardCheck, 
  Mail, Phone, Calendar, Info, Shield, Award, Sparkles, Home, Briefcase, 
  CreditCard, ChevronRight, Upload, BellRing, Ticket, Copy, Loader2
} from 'lucide-react';
import { User, Address, StoreNotification } from '../types';
import { uploadImage } from '../lib/cloudinary';

interface ProfileModalProps {
  user: User;
  lang: 'en' | 'bn';
  onClose: () => void;
  onUpdateUser: (updatedFields: Partial<User>) => Promise<void>;
  notifications: StoreNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
];

export default function ProfileModal({
  user,
  lang,
  onClose,
  onUpdateUser,
  notifications = [],
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead
}: ProfileModalProps) {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'notifications'>('profile');
  
  // Profile Form State
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || AVATAR_PRESETS[0]);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState<number | null>(null);

  const handleCustomAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setAvatarProgress(0);
    try {
      const url = await uploadImage(file, {
        folder: 'taqwa_enterprise/avatars',
        onProgress: (percent) => setAvatarProgress(percent),
        compress: true
      });
      setSelectedAvatar(url);
      await onUpdateUser({ avatar: url });
      setProfileSuccessMessage(isBn ? 'ছবি সফলভাবে ক্লাউডে আপলোড ও সেভ হয়েছে!' : 'Avatar uploaded to Cloudinary successfully!');
      setTimeout(() => setProfileSuccessMessage(''), 4000);
    } catch (err: any) {
      alert(isBn ? `ছবি আপলোড ব্যর্থ হয়েছে: ${err.message}` : `Upload failed: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
      setAvatarProgress(null);
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

  // Profile Save
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
      setProfileSuccessMessage(isBn ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'Profile details updated successfully!');
      setTimeout(() => setProfileSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Add or Edit address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine.trim() || !addressPhone.trim()) return;

    const currentAddresses = user.addresses || [];
    let updatedAddresses: Address[] = [];

    if (editingAddressId) {
      // Edit mode
      updatedAddresses = currentAddresses.map(addr => 
        addr.id === editingAddressId 
          ? { ...addr, label: addressLabel, addressLine, district: addressDistrict, phone: addressPhone }
          : addr
      );
    } else {
      // Create mode
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
      // Reset form variables
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

  // Delete saved address
  const handleDeleteAddress = async (addressId: string) => {
    const currentAddresses = user.addresses || [];
    const updated = currentAddresses.filter(addr => addr.id !== addressId);
    try {
      await onUpdateUser({ addresses: updated });
    } catch (err) {
      console.error(err);
    }
  };

  // Load address for edit form
  const handleStartEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    setAddressLine(addr.addressLine);
    setAddressDistrict(addr.district);
    setAddressPhone(addr.phone);
    setShowAddressForm(true);
  };

  // Copy Promo discount texts or coupons to device clipboard
  const handleCopyCoupon = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotificationId(id);
    setTimeout(() => {
      setCopiedNotificationId(null);
    }, 2000);
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-55 bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in" id="profile-container-modal">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[92vh] md:h-auto md:max-h-[88vh] flex flex-col shadow-2xl relative border border-slate-100 overflow-hidden transform scale-100 transition-all duration-300">
        
        {/* Header Ribbon bar */}
        <div className="bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-5 text-white flex justify-between items-center shrink-0 relative">
          <div className="space-y-1 relative z-10">
            <h2 className="text-base font-black flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-emerald-250" />
              <span>{isBn ? 'আমার প্রোফাইল ও সেটিংস' : 'My Account Settings'}</span>
            </h2>
            <p className="text-[10px] text-emerald-100 font-bold">
              {isBn ? 'আপনার ঠিকানা, অফার নোটিফিকেশন ও প্রোফাইল ডাটা সংশোধন করুন' : 'Manage your contact delivery addresses, notifications and credentials'}
            </p>
          </div>
          
          <button
            onClick={onClose}
            id="close-profile-modal-btn"
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white transition-all cursor-pointer shadow-xs relative z-10 hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switchers */}
        <div className="flex border-b border-slate-100 bg-slate-50 shrink-0 text-xs font-black">
          {[
            { id: 'profile', label: isBn ? 'ব্যক্তিগত তথ্য' : 'Information', icon: UserIcon },
            { id: 'addresses', label: isBn ? 'সংরক্ষিত ঠিকানা' : 'Address Book', icon: MapPin, badge: user.addresses?.length },
            { id: 'notifications', label: isBn ? 'ইনবক্স নোটিফিকেশন' : 'Notifications', icon: Bell, badge: unreadNotifications, badgeColor: 'bg-rose-500 text-white animate-bounce' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3.5 text-center flex items-center justify-center gap-1.5 border-b-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${tab.badgeColor || 'bg-emerald-100 text-emerald-800'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Panel Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          
          <AnimatePresence mode="wait">
            
            {/* TAB 1: PROFILE DETAILS */}
            {activeTab === 'profile' && (
              <motion.form 
                key="modal-profile-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onSubmit={handleSaveProfile} 
                className="space-y-5"
              >
                {profileSuccessMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-850 text-xs p-3 rounded-2xl font-bold flex items-center gap-2 animate-fade-in shadow-xxs">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>{profileSuccessMessage}</span>
                  </div>
                )}

                {/* Avatar Preset deck selector */}
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-slate-550 uppercase tracking-wider pl-0.5">
                      {isBn ? 'প্রোফাইল ছবি নির্বাচন বা আপলোড' : 'Select or Upload Profile Picture'}
                    </label>
                    <label className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                      {uploadingAvatar ? (
                        <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>{uploadingAvatar ? `${avatarProgress || 0}%` : (isBn ? 'গ্যালারি থেকে ছবি আপলোড' : 'Upload Image')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCustomAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-emerald-500 bg-white flex items-center justify-center mr-2 shadow-sm shrink-0">
                      <img
                        src={selectedAvatar}
                        alt="Current preview avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_PRESETS.map((preset, idx) => {
                        const isSelected = selectedAvatar === preset;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedAvatar(preset)}
                            className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${
                              isSelected ? 'border-emerald-600 ring-2 ring-emerald-100 scale-105 shadow-xs' : 'border-slate-200 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img src={preset} alt={`Preset option ${idx}`} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Regular Info fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 pl-0.5">
                      {isBn ? 'গ্রাহকের পুরো নাম *' : 'Account Holder Name *'}
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none">
                        <UserIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-3 focus:ring-emerald-500/10 focus:border-emerald-500 text-slate-800 font-extrabold transition-all"
                        placeholder={isBn ? 'যেমন: রাফসান করিম' : 'e.g. Rafsan Karim'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 pl-0.5">
                        {isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                      </label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-2xl focus:outline-hidden focus:ring-3 focus:ring-emerald-500/10 focus:border-emerald-500 text-slate-800 font-extrabold transition-all"
                          placeholder="e.g. 017XXXXXXXX"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-400 pl-0.5">
                        {isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-350 pointer-events-none">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          required
                          disabled
                          value={email}
                          className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-150 bg-slate-100 rounded-2xl text-slate-450 cursor-not-allowed font-extrabold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-[11px] text-slate-500 flex items-start gap-3">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700">{isBn ? 'নিবন্ধিত হয়েছেন: ' : 'Platform Join Date: '}</span>
                      <strong>{user.joinedAt || '21 June 2026'}</strong> | Role: <span className="text-emerald-700 font-extrabold">{user.role || 'Customer'}</span>
                    </div>
                  </div>
                </div>

                {/* Action trigger button */}
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  {updatingProfile ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                      <span>{isBn ? 'হালনাগাদ করা হচ্ছে...' : 'Saving Changes...'}</span>
                    </>
                  ) : (
                    <span>{isBn ? 'পরিবর্তনসমূহ সংরক্ষণ করুন' : 'Save Profiles & Settings'}</span>
                  )}
                </button>
              </motion.form>
            )}

            {/* TAB 2: ADDRESS BOOK */}
            {activeTab === 'addresses' && (
              <motion.div 
                key="modal-addresses-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-5"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">
                    {isBn ? 'আপনার সংরক্ষিত ঠিকানাসমূহ' : 'Your Saved Ship Addresses'}
                  </h3>
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
                      className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-1 hover:bg-emerald-700 transition-colors cursor-pointer shadow-xxs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isBn ? 'নতুন ঠিকানা' : 'New Address'}</span>
                    </button>
                  )}
                </div>

                {/* Form popup dropdown drawer */}
                {showAddressForm && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleSaveAddress} 
                    className="bg-slate-50 border-2 border-dashed border-emerald-500/20 p-4 rounded-2xl space-y-4"
                  >
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>{editingAddressId ? (isBn ? 'ঠিকানা সংশোধন করুণ' : 'Modify Location Parameters') : (isBn ? 'নতুন ডেলিভারি ঠিকানা যোগ করুন' : 'Add New Shipping Location')}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">
                          {isBn ? 'ঠিকানার লেবেল' : 'Location Label'}
                        </label>
                        <select
                          value={addressLabel}
                          onChange={(e) => setAddressLabel(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-extrabold focus:outline-hidden focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Home">🏠 Home</option>
                          <option value="Office">🏢 Office</option>
                          <option value="Billing">💳 Billing</option>
                          <option value="Other">📍 Other</option>
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500">
                          {isBn ? 'প্রাপকের ফোন নম্বর *' : 'Receiver Phone *'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={addressPhone}
                          onChange={(e) => setAddressPhone(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-extrabold text-slate-800"
                          placeholder="e.g. 017********"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">
                        {isBn ? 'বিস্তারিত ঠিকানা লাইন *' : 'Location Address Details *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-extrabold text-slate-800"
                        placeholder="House 20, Road 14, Sector 7, Uttara"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500">
                        {isBn ? 'জেলা' : 'District'}
                      </label>
                      <select
                        value={addressDistrict}
                        onChange={(e) => setAddressDistrict(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-extrabold text-slate-800 cursor-pointer"
                      >
                        <option value="Dhaka">Dhaka (৳60 Delivery)</option>
                        <option value="Chittagong">Chittagong (৳120 Delivery)</option>
                        <option value="Sylhet">Sylhet (৳120 Delivery)</option>
                        <option value="Rajshahi">Rajshahi (৳120 Delivery)</option>
                        <option value="Khulna">Khulna (৳120 Delivery)</option>
                        <option value="Barisal">Barisal (৳120 Delivery)</option>
                        <option value="Rangpur">Rangpur (৳120 Delivery)</option>
                        <option value="Mymensingh">Mymensingh (৳120 Delivery)</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-2 text-xs font-bold pt-1.5 border-t border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {isBn ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        {isBn ? 'ঠিকানা সংরক্ষণ' : 'Save Address'}
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* List of stored addresses */}
                {(!user.addresses || user.addresses.length === 0) ? (
                  <div className="bg-slate-50 border border-slate-150 p-8 rounded-3xl text-center">
                    <p className="text-xs text-slate-400 italic font-bold">
                      {isBn ? 'আপনার কোনো সংরক্ষিত ঠিকানা নেই। নিচের বাটনে ক্লিক করে দ্রুত চেকআউটের জন্য সেটিংস করুন!' : 'No addresses saved yet. Register your locations to speed up purchase checkouts.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => {
                      const isHome = addr.label === 'Home';
                      const isOffice = addr.label === 'Office';
                      
                      return (
                        <div key={addr.id} className="p-4 bg-white border border-slate-150 hover:border-emerald-400 hover:shadow-xs transition-all rounded-2xl relative flex flex-col justify-between gap-3 group">
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase rounded-lg border border-emerald-100">
                              {isHome ? '🏠' : isOffice ? '🏢' : '📍'}
                              <span>{addr.label}</span>
                            </span>
                            <p className="text-xs font-extrabold text-slate-800 leading-snug">{addr.addressLine}</p>
                            <p className="text-[10px] text-slate-450 font-semibold">District: <span className="font-extrabold text-slate-700">{addr.district}</span></p>
                            <p className="text-[10px] text-slate-450 font-semibold">Phone: <span className="font-extrabold text-slate-700">{addr.phone}</span></p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex justify-end gap-2 text-[10px] font-black">
                            <button
                              onClick={() => handleStartEditAddress(addr)}
                              className="px-2 py-1 bg-slate-50 hover:bg-emerald-50 border border-slate-150 rounded-lg text-slate-600 hover:text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3 text-slate-400" />
                              <span>{isBn ? 'এডিট' : 'Edit'}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg text-rose-650 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3 text-rose-500" />
                              <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 3: STORE NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.div 
                key="modal-notifications-tab"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">
                    {isBn ? 'মোট নোটিফিকেশন সমূহ' : 'Notification Inbox Alert Messages'}
                  </h3>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={onMarkAllNotificationsAsRead}
                      className="text-xs text-emerald-700 hover:underline font-extrabold cursor-pointer"
                    >
                      {isBn ? 'সবগুলো পঠিত মার্ক করুন' : 'Mark all as Read'}
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl text-center">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 italic font-bold">
                      {isBn ? 'আপনার ইনবক্স সম্পূর্ণ খালি আছে।' : 'Your inbox is completely clear!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[48vh] overflow-y-auto pr-1">
                    {notifications.map((notif) => {
                      const isPromo = notif.type === 'promo' || notif.type === 'coupon';
                      const couponMatch = notif.message.match(/[A-Z0-9]{4,10}/);
                      const couponText = couponMatch ? couponMatch[0] : 'TAQWA10';

                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (!notif.isRead) onMarkNotificationAsRead(notif.id);
                          }}
                          className={`p-4 rounded-2xl border transition-all relative cursor-pointer ${
                            notif.isRead 
                              ? 'bg-white border-slate-150 opacity-80' 
                              : 'bg-emerald-50/20 border-emerald-100 shadow-xxs'
                          }`}
                        >
                          {!notif.isRead && (
                            <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          )}

                          <div className="flex items-start gap-3">
                            <span className={`p-2 rounded-xl text-xs shrink-0 ${
                              notif.type === 'order' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                              notif.type === 'coupon' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              notif.type === 'promo' ? 'bg-indigo-55 text-indigo-700 border border-indigo-100' : 
                              'bg-slate-100 text-slate-600 border border-slate-150'
                            }`}>
                              {notif.type === 'order' ? '📦' :
                               notif.type === 'coupon' ? '🏷️' :
                               notif.type === 'promo' ? '🎉' : '🔔'}
                            </span>

                            <div className="flex-1 min-w-0">
                              <h4 className={`text-xs font-bold text-slate-800 ${notif.isRead ? '' : 'text-emerald-950 font-black'}`}>
                                {isBn ? (notif.titleBn || notif.title) : notif.title}
                              </h4>
                              
                              <p className="text-[11px] text-slate-550 leading-relaxed mt-1 font-bold">
                                {isBn ? (notif.messageBn || notif.message) : notif.message}
                              </p>
                              
                              {isPromo && (
                                <div className="mt-2.5 flex items-center gap-2 p-2 bg-white/60 border-2 border-dashed border-emerald-200 rounded-xl max-w-xs">
                                  <span className="text-[10px] font-mono font-black tracking-wider text-emerald-800 uppercase pl-1">
                                    {couponText}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyCoupon(couponText, notif.id);
                                    }}
                                    className="text-[10px] text-emerald-700 hover:text-emerald-900 border border-emerald-100 font-extrabold hover:bg-emerald-50 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-colors ml-auto shrink-0"
                                  >
                                    {copiedNotificationId === notif.id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>{isBn ? 'কপি সফল' : 'Copied!'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>{isBn ? 'কপি' : 'Copy'}</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}

                              <span className="text-[9px] font-mono text-slate-400 mt-2 block">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
