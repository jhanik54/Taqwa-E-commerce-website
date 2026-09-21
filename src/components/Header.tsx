import React, { useState } from 'react';
import { Search, ShoppingCart, User, RefreshCw, Languages, Shield, LogOut, MapPin, ChevronDown, Grid, X } from 'lucide-react';
import { CartItem } from '../types';

interface HeaderProps {
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  isLoggedIn: boolean;
  user: any | null;
  setIsLoginModalOpen: (open: boolean) => void;
  logout: () => void;
  setIsAdminView: (admin: boolean) => void;
  isAdminView: boolean;
  syncStatus: any;
  triggerBackUp: () => void;
  isBackingUp: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenProfile?: () => void;
  unreadNotificationsCount?: number;
  allProducts?: any[];
  onViewProduct?: (product: any) => void;
  activeCategory?: string;
  setActiveCategory?: (category: string) => void;
  onOpenCategoryDrawer?: () => void;
  settings?: any;
}

export default function Header({
  lang,
  setLang,
  searchQuery,
  setSearchQuery,
  cart,
  setIsCartOpen,
  isLoggedIn,
  user,
  setIsLoginModalOpen,
  logout,
  setIsAdminView,
  isAdminView,
  syncStatus,
  triggerBackUp,
  isBackingUp,
  activeTab,
  setActiveTab,
  onOpenProfile,
  unreadNotificationsCount = 0,
  allProducts = [],
  onViewProduct,
  activeCategory = 'all',
  setActiveCategory,
  onOpenCategoryDrawer,
  settings
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const suggestions = searchQuery.trim()
    ? allProducts.filter(p => {
        const query = searchQuery.toLowerCase();
        const nameMatch = p.name?.toLowerCase().includes(query);
        const bnNameMatch = p.banglaName?.toLowerCase().includes(query);
        const catMatch = p.category?.toLowerCase().includes(query);
        return nameMatch || bnNameMatch || catMatch;
      }).slice(0, 5)
    : [];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAdminView(false);
    setActiveTab('store');
    const feed = document.getElementById('main-product-feed');
    if (feed) {
      feed.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-xs">
      {/* 1. Top Utility Announcement & Quick Action Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3 text-[11px] sm:text-xs">
          {/* Left: Announcement text with pulse indicator */}
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="flex h-1.5 w-1.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
            </span>
            <p className="truncate text-slate-300 font-medium tracking-normal text-[11px] sm:text-xs">
              {lang === 'bn' 
                ? '🌟 শুধু কুরিয়ার পয়েন্টে দ্রুত পার্সেল ডেলিভারি দেওয়া হয় ইনশাল্লাহ্' 
                : '🌟 Fast parcel delivery to designated courier points InshaAllah!'}
            </p>
          </div>

          {/* Right: Quick actions (Language toggle, Track Order, Sync) */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 font-medium text-slate-300 text-[11px]">
            {/* Language Switch */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              title={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
            >
              <Languages className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            <span className="text-slate-700 select-none">|</span>

            {/* Order Tracking link */}
            <button
              onClick={() => {
                setIsAdminView(false);
                setActiveTab('track');
              }}
              className={`hover:text-white transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'track' && !isAdminView ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{lang === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
            </button>

            <span className="text-slate-700 select-none hidden xs:inline">|</span>

            {/* Cloud Sync Status */}
            <button
              onClick={triggerBackUp}
              disabled={isBackingUp}
              className={`hover:text-white transition-colors items-center gap-1 cursor-pointer hidden xs:flex ${
                isBackingUp ? 'animate-pulse text-amber-300' : ''
              }`}
              title="Cloud Synchronization"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 shrink-0 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span>{lang === 'bn' ? 'সিঙ্ক' : 'Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
          
          {/* Brand Logo & Title */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none" 
            onClick={() => {
              setIsAdminView(false);
              setActiveTab('store');
            }}
          >
            {settings?.logo ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0">
                <img src={settings.logo} alt="Store Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-xs shrink-0">
                T
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-1 truncate">
                {settings?.storeName ? (
                  settings.storeName
                ) : (
                  <>তাকওয়া <span className="text-blue-600">এন্টারপ্রাইজ</span></>
                )}
              </h1>
              <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase leading-none mt-0.5 hidden sm:block truncate">
                {settings?.storeName ? `${settings.storeName} • Online Store` : 'Taqwa Enterprise • Animal & Bird Feeds'}
              </p>
            </div>
          </div>

          {/* Desktop Categories Dropdown Trigger */}
          <div className="hidden lg:block relative shrink-0">
            <button
              onClick={() => setIsMegaOpen(!isMegaOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors text-xs font-semibold cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${isMegaOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMegaOpen && (
              <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                {[
                  { id: 'all', labelEn: 'All Products', labelBn: 'সব পণ্য', descEn: 'Browse complete catalog', descBn: 'আমাদের সকল পণ্য একসাথে দেখুন' },
                  { id: 'pigeons', labelEn: 'Pigeon & Animal Feed', labelBn: 'কবুতর ও প্রাণীর খাবার', descEn: 'Cleaned grains & racing mix', descBn: 'কবুতরের বাছাইকৃত মিক্সড দানা ও গ্রিট' },
                  { id: 'birds', labelEn: 'Bird Feed', labelBn: 'পাখির খাবার', descEn: 'Natural seeds & formula', descBn: 'বাজরিগার, ককাটেল ও পাখির সিড মিক্স' },
                  { id: 'medicine', labelEn: 'Medicine & Care', labelBn: 'ঔষধ ও কেয়ার', descEn: 'Essential drops & vitamins', descBn: 'পাখি ও কবুতরের রোগ প্রতিরোধক ও ভিটামিন' },
                  { id: 'accessories', labelEn: 'Accessories', labelBn: 'এক্সেসরিজ', descEn: 'Feeders & breeding items', descBn: 'খাঁচা, অটো ফিডার ও ব্রিডিং এক্সেসরিজ' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsAdminView(false);
                      setActiveTab('store');
                      if (setActiveCategory) setActiveCategory(item.id);
                      setIsMegaOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-semibold flex flex-col cursor-pointer transition-colors ${
                      activeCategory === item.id ? 'bg-blue-50/60 text-blue-700' : ''
                    }`}
                  >
                    <span className="text-xs">{lang === 'bn' ? item.labelBn : item.labelEn}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{lang === 'bn' ? item.descBn : item.descEn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar - Desktop & Tablet */}
          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative flex items-center">
              <div className="relative w-full h-10">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="search-input-desktop"
                  type="text"
                  placeholder={lang === 'bn' ? 'কবুতর ও পাখির খাবার, সিড মিক্স, ঔষধ বা এক্সেসরিজ খুঁজুন...' : 'Search pigeon feed, bird seeds, medicine & accessories...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setTimeout(() => setSearchFocus(false), 250)}
                  className="w-full h-full pl-10 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all font-medium"
                />
                
                {/* Clear search query button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-20 top-2.5 w-5 h-5 rounded-full text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                    title={lang === 'bn' ? 'সাফ করুন' : 'Clear search'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                >
                  {lang === 'bn' ? 'খুঁজুন' : 'Search'}
                </button>
              </div>
            </form>

            {/* Dynamic Auto-suggestions Dropdown */}
            {searchFocus && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2 space-y-1 max-h-80 overflow-y-auto">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  {lang === 'bn' ? 'দ্রুত সার্চ ফলাফল' : 'Quick Matching Products'}
                </div>
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onMouseDown={() => {
                      if (onViewProduct) onViewProduct(p);
                      setSearchFocus(false);
                    }}
                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {lang === 'bn' ? (p.banglaName || p.name) : p.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium capitalize truncate">
                          {p.category} {p.weight ? `• ${p.weight}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-xs font-bold text-blue-600 block">৳{p.price}</span>
                      {p.originalPrice > p.price && (
                        <span className="text-[10px] text-slate-400 line-through">৳{p.originalPrice}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Header Controls: Cart & Profile/Login */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Cart Icon Button */}
            <button
              id="cart-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
              title={lang === 'bn' ? 'শপিং কার্ট দেখুন' : 'View Shopping Cart'}
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-xs border-2 border-white leading-none">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown or Login Button */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  id="profile-dropdown-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:ring-2 hover:ring-blue-500/30 transition-all cursor-pointer"
                  title="My Account"
                  aria-label="User Account"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs border border-blue-200">
                    {user?.name?.substring(0, 1).toUpperCase() || 'U'}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-fade-in">
                    <div className="px-3.5 py-2.5 border-b border-slate-100 mb-1">
                      <p className="font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.email}</p>
                    </div>

                    {/* Profile & Settings Option */}
                    <button
                      id="my-profile-toggle"
                      onClick={() => {
                        if (onOpenProfile) onOpenProfile();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{lang === 'bn' ? 'প্রোফাইল ও সেটিংস' : 'Profile & Settings'}</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-auto">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </button>

                    {/* My Orders History Option */}
                    <button
                      id="my-orders-toggle"
                      onClick={() => {
                        setIsAdminView(false);
                        setActiveTab('my-orders');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{lang === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}</span>
                    </button>
                    
                    {/* Admin Dashboard Switcher */}
                    {(user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager') && (
                      <button
                        id="admin-dashboard-toggle"
                        onClick={() => {
                          setIsAdminView(!isAdminView);
                          setActiveTab('store');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-blue-700 font-medium flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>
                          {isAdminView 
                            ? (lang === 'bn' ? 'স্টোরে ফিরে যান' : 'Go to Storefront') 
                            : (lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Panel View')}
                        </span>
                      </button>
                    )}

                    {/* Direct mobile links */}
                    <div className="sm:hidden border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setLang(lang === 'bn' ? 'en' : 'bn');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <Languages className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lang === 'en' ? 'বাংলা সংস্করণ' : 'English Version'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsAdminView(false);
                          setActiveTab('track');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-2 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lang === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Track Package'}</span>
                      </button>
                    </div>

                    <button
                      id="user-logout"
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 font-semibold flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-modal-trigger"
                onClick={() => setIsLoginModalOpen(true)}
                className="h-9 px-3 sm:px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লগইন' : 'Login'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Sub-Navigation Bar (Desktop Category Strip) */}
        <div className="hidden md:flex items-center justify-between border-t border-slate-100 pt-2.5 mt-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-1">
            {[
              { id: 'all', labelEn: 'All Feeds & Products', labelBn: 'সকল পণ্য' },
              { id: 'pigeons', labelEn: 'Pigeon & Animal Feed', labelBn: 'কবুতর ও প্রাণীর খাবার' },
              { id: 'birds', labelEn: 'Bird Feed & Seeds', labelBn: 'পাখির খাবার' },
              { id: 'medicine', labelEn: 'Medicine & Care', labelBn: 'ঔষধ ও কেয়ার' },
              { id: 'accessories', labelEn: 'Accessories', labelBn: 'এক্সেসরিজ' },
            ].map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setIsAdminView(false);
                    setActiveTab('store');
                    if (setActiveCategory) setActiveCategory(tab.id);
                  }}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium'
                  }`}
                >
                  {lang === 'bn' ? tab.labelBn : tab.labelEn}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>{lang === 'bn' ? '১০০% পরিষ্কার ও ধুলোমুক্ত দানা' : '100% Dust-free Clean Grains'}</span>
          </div>
        </div>

        {/* 4. Search Bar - Mobile View Only (Fits full width, zero overflow) */}
        <div className="mt-2.5 md:hidden">
          <div className="w-full flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 h-9 min-w-0">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="search-input-mobile"
                type="text"
                placeholder={lang === 'bn' ? 'পণ্য বা খাবারের নাম লিখুন...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full pl-8.5 pr-16 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white font-medium transition-all"
              />
              
              {/* Clear button if search query entered */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-13 top-2 w-5 h-5 rounded-full text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
                  title="Clear"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Compact search action button */}
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold flex items-center justify-center cursor-pointer transition-colors"
              >
                {lang === 'bn' ? 'খুঁজুন' : 'Go'}
              </button>
            </form>

            {/* Category Drawer Trigger Button */}
            {onOpenCategoryDrawer && (
              <button
                type="button"
                onClick={onOpenCategoryDrawer}
                className="h-9 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg flex items-center justify-center gap-1 text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                title={lang === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories'}
              >
                <Grid className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden xs:inline">{lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
