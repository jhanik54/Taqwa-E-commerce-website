import React, { useState } from 'react';
import { Search, ShoppingCart, User, RefreshCw, Languages, Shield, LogOut, Heart, MapPin, Sparkles, ChevronDown, Globe, Grid } from 'lucide-react';
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
  wishlistCount: number;
  onOpenProfile?: () => void;
  unreadNotificationsCount?: number;
  allProducts?: any[];
  onViewProduct?: (product: any) => void;
  activeCategory?: string;
  setActiveCategory?: (category: string) => void;
  onOpenCategoryDrawer?: () => void;
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
  wishlistCount,
  onOpenProfile,
  unreadNotificationsCount = 0,
  allProducts = [],
  onViewProduct,
  activeCategory = 'all',
  setActiveCategory,
  onOpenCategoryDrawer
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const suggestions = searchQuery.trim()
    ? allProducts.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const bnNameMatch = p.banglaName?.toLowerCase().includes(searchQuery.toLowerCase());
        const catMatch = p.category?.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || bnNameMatch || catMatch;
      }).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      {/* 1. Top Utility & Announcement Bar */}
      <div className="bg-emerald-800 text-white text-xs py-2 px-4 border-b border-emerald-900/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 font-medium">
          {/* Left Side: Promotional Message */}
          <div className="flex items-center gap-1.5 truncate">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="truncate tracking-wide text-[11px] sm:text-xs">
              {lang === 'bn' 
                ? '🌟 মাত্র ২৪ ঘণ্টায় ঢাকা সিটিতে নিশ্চিত হোম ডেলিভারি এবং ক্যাশ অন ডেলিভারি!' 
                : '🌟 Free Home Delivery in BD for orders over ৳২০০০! 24-Hour Express Shipping.'}
            </p>
          </div>

          {/* Right Side: Secondary Actions (Hidden on tiny mobile, nice low-profile on tablet/desktop) */}
          <div className="hidden sm:flex items-center gap-4 text-[11px] shrink-0 font-semibold text-emerald-100">
            {/* Language Toggle Link */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            <span className="text-emerald-700/60 font-light">|</span>

            {/* Track Order Tab Link */}
            <button
              onClick={() => {
                setIsAdminView(false);
                setActiveTab('track');
              }}
              className={`hover:text-white transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'track' && !isAdminView ? 'text-white underline underline-offset-4' : ''
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
            </button>

            <span className="text-emerald-700/60 font-light">|</span>

            {/* Cloud Sync Backup status */}
            <button
              onClick={triggerBackUp}
              disabled={isBackingUp}
              className={`hover:text-white transition-colors flex items-center gap-1 cursor-pointer ${
                isBackingUp ? 'animate-pulse text-amber-300' : ''
              }`}
              title="Cloud Synchronization"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span>{lang === 'bn' ? 'সিঙ্ক' : 'Sync'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center space-x-2 cursor-pointer shrink-0" 
            onClick={() => {
              setIsAdminView(false);
              setActiveTab('store');
            }}
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-lg sm:text-2xl font-black tracking-tight">T</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-lg md:text-xl font-black text-emerald-850 tracking-tight flex items-center gap-0.5 sm:gap-1 leading-none">
                তাকওয়া <span className="text-emerald-600">এন্টারপ্রাইজ</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] font-mono text-slate-400 tracking-widest uppercase mt-1 leading-none hidden xs:block">
                Taqwa Enterprise
              </p>
            </div>
          </div>

          {/* Category Mega Dropdown (Desktop Only) */}
          <div className="hidden lg:block relative shrink-0">
            <button
              onClick={() => setIsMegaOpen(!isMegaOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-150/45 rounded-xl transition-all text-xs font-black cursor-pointer shadow-xs"
            >
              <Globe className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>{lang === 'bn' ? 'সব ক্যাটাগরি' : 'Categories'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isMegaOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMegaOpen && (
              <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 text-xs animate-scale-up">
                {[
                  { id: 'all', labelEn: 'All Products', labelBn: 'সব পণ্য', descEn: 'Browse all animal diet mix', descBn: 'আমাদের সকল পণ্য একসাথে দেখুন' },
                  { id: 'cats', labelEn: 'Cats Diet', labelBn: 'বিড়ালের খাবার', descEn: 'Premium food & treats', descBn: 'প্রোটিনযুক্ত ক্যাট ফুড ও ওয়েট ট্রিটস' },
                  { id: 'birds', labelEn: 'Birds Seed', labelBn: 'পাখির দানা', descEn: 'High quality mix seeds', descBn: 'প্রিমিয়াম মিক্সড বীজ ও পুষ্টিকর খাবার' },
                  { id: 'fish', labelEn: 'Fish Pellets', labelBn: 'মাছের খাবার', descEn: 'Nutritious micro pellets', descBn: 'রঙিন মাছের পুষ্টিকর স্পেশাল খাবার' },
                  { id: 'rabbits', labelEn: 'Rabbit Hay', labelBn: 'খরগোশের ঘাস', descEn: 'Natural green hay & pellets', descBn: 'টাটকা ঘাস, লিটার ও প্রয়োজনীয় খাদ্য' },
                  { id: 'accessories', labelEn: 'Accessories', labelBn: 'সাজসজ্জা ও খাঁচা', descEn: 'Cages, feeders & toys', descBn: 'পাখির খাঁচা, ফিডার ও আকর্ষণীয় খেলনা' },
                  { id: 'supplements', labelEn: 'Supplements', labelBn: 'ভিটামিন ও ঔষধ', descEn: 'Vitamins & remedies', descBn: 'পাখি ও বিড়ালের রোগ প্রতিরোধ ওষুধ' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsAdminView(false);
                      setActiveTab('store');
                      if (setActiveCategory) setActiveCategory(item.id);
                      setIsMegaOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold flex flex-col cursor-pointer border-b border-slate-50 last:border-0 ${
                      activeCategory === item.id ? 'bg-emerald-50/50 text-emerald-800' : ''
                    }`}
                  >
                    <span className="text-xs">{lang === 'bn' ? item.labelBn : item.labelEn}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{lang === 'bn' ? item.descBn : item.descEn}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Large, Prominent Search Bar (Desktop / Tablet) */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <div className="w-full relative group">
              <input
                id="search-input-desktop"
                type="text"
                placeholder={lang === 'bn' ? 'পাখি, বিড়াল, মাছ বা খরগোশের পুষ্টিকর খাদ্য খুঁজুন...' : 'Search premium seeds, pellets, pet food & accessories...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setTimeout(() => setSearchFocus(false), 250)}
                className="w-full pl-11 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-emerald-500 focus:bg-white text-sm transition-all text-slate-800 shadow-inner font-medium placeholder:text-slate-400 group-hover:border-slate-300"
              />
              <Search className="absolute left-4 top-3 w-4.5 h-4.5 text-slate-400 group-hover:text-slate-500 transition-colors" />
              <div className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center justify-center cursor-pointer transition-colors shadow-sm select-none">
                {lang === 'bn' ? 'খুঁজুন' : 'Search'}
              </div>

              {/* Dynamic Auto-suggestions search overlay */}
              {searchFocus && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 p-2.5 space-y-1.5 animate-scale-up max-h-[380px] overflow-y-auto">
                  <div className="px-2.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    {lang === 'bn' ? 'সরাসরি পণ্য সার্চ ফলাফল' : 'Quick Suggestion Results'}
                  </div>
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={() => {
                        if (onViewProduct) onViewProduct(p);
                        setSearchFocus(false);
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-left border-b border-slate-50/40 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 line-clamp-1">
                            {lang === 'bn' ? p.banglaName : p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold capitalize">
                            {p.category} • {p.weight || ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-600 block">৳{p.price}</span>
                        {p.originalPrice > p.price && (
                          <span className="text-[9px] text-slate-400 line-through">৳{p.originalPrice}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Essential Conversion-Focused Actions Row */}
          <div className="flex items-center space-x-1 sm:space-x-3.5 shrink-0">
            
            {/* Wishlist Icon Button */}
            <button
              id="wishlist-trigger-btn"
              onClick={() => {
                setIsAdminView(false);
                setActiveTab('wishlist');
              }}
              className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-700 hover:text-rose-500 hover:bg-rose-50/50 transition-colors cursor-pointer"
              title={lang === 'bn' ? 'পছন্দ তালিকা' : 'View Wishlist'}
            >
              <Heart className={`w-5.5 h-5.5 transition-colors ${activeTab === 'wishlist' ? 'text-rose-500 fill-current' : 'text-slate-600'}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon Button */}
            <button
              id="cart-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/50 transition-colors cursor-pointer"
              title={lang === 'bn' ? 'শপিং কার্ট' : 'View Cart'}
            >
              <ShoppingCart className="w-5.5 h-5.5 text-slate-600 hover:text-emerald-600 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Login Dropdown Trigger */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  id="profile-dropdown-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center min-w-[40px] min-h-[40px] p-0.5 rounded-full hover:ring-2 hover:ring-emerald-500/30 transition-all cursor-pointer"
                  title="My Account"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs border border-emerald-200">
                    {user?.name?.substring(0, 1).toUpperCase() || 'U'}
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs animate-scale-up">
                    <div className="px-4 py-3 border-b border-slate-100 mb-1.5">
                      <p className="font-extrabold text-slate-800">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{user?.email}</p>
                    </div>

                    {/* Profile & Settings Option */}
                    <button
                      id="my-profile-toggle"
                      onClick={() => {
                        if (onOpenProfile) onOpenProfile();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center space-x-2.5 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'bn' ? 'প্রোফাইল ও ঠিকানা' : 'Profile & Settings'}</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black ml-auto animate-pulse">
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
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 font-bold flex items-center space-x-2.5 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      <span>{lang === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}</span>
                    </button>
                    
                    {/* SaaS Dashboard Switcher */}
                    {user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' ? (
                      <button
                        id="admin-dashboard-toggle"
                        onClick={() => {
                          setIsAdminView(!isAdminView);
                          setActiveTab('store');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-emerald-700 font-bold flex items-center space-x-2.5 cursor-pointer border-t border-slate-50 mt-1"
                      >
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>
                          {isAdminView 
                            ? (lang === 'bn' ? 'স্টোরে ফিরে যান' : 'Go to Storefront') 
                            : (lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Panel View')}
                        </span>
                      </button>
                    ) : null}

                    {/* Direct mobile links helper */}
                    <div className="sm:hidden border-t border-slate-50 mt-1.5 pt-1.5">
                      <button
                        onClick={() => {
                          setLang(lang === 'bn' ? 'en' : 'bn');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600 font-bold flex items-center space-x-2.5 cursor-pointer"
                      >
                        <Languages className="w-4 h-4 text-slate-400" />
                        <span>{lang === 'en' ? 'বাংলা সংস্করণ' : 'English Version'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsAdminView(false);
                          setActiveTab('track');
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-600 font-bold flex items-center space-x-2.5 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{lang === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Track Package'}</span>
                      </button>
                    </div>

                    <button
                      id="user-logout"
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 font-extrabold flex items-center space-x-2.5 cursor-pointer border-t border-slate-100 mt-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-modal-trigger"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center justify-center space-x-1.5 px-4.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm cursor-pointer hover:-translate-y-0.5"
              >
                <User className="w-4 h-4" />
                <span>{lang === 'bn' ? 'লগইন' : 'Login'}</span>
              </button>
            )}

          </div>
        </div>

        {/* Mobile Search Bar (Only shown on small viewports) */}
        <div className="mt-3 md:hidden relative">
          <div className="w-full relative group flex gap-2">
            <div className="relative flex-1">
              <input
                id="search-input-mobile"
                type="text"
                placeholder={lang === 'bn' ? 'পাখি, বিড়াল, মাছ বা খরগোশের খাদ্য খুঁজুন...' : 'Search premium seeds, animal feeds, supplements...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <div className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 text-white rounded-lg text-[10px] font-black flex items-center justify-center cursor-pointer">
                {lang === 'bn' ? 'সার্চ' : 'Go'}
              </div>
            </div>
            
            <button
              onClick={() => {
                if (onOpenCategoryDrawer) onOpenCategoryDrawer();
              }}
              className="px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 rounded-xl flex items-center justify-center text-xs font-black gap-1 cursor-pointer transition-colors shrink-0"
              title={lang === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Browse Categories'}
            >
              <Grid className="w-4 h-4 text-emerald-600" />
              <span className="hidden xs:inline">{lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</span>
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
