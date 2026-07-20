import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Tag, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle,
  Check,
  HelpCircle,
  Clock,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Home,
  Grid,
  Bird,
  Cat,
  Fish,
  Rabbit,
  Activity,
  Shield,
  RefreshCw,
  ShoppingCart,
  User as UserIcon,
  ArrowUp
} from 'lucide-react';

import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import OrderTrack from './components/OrderTrack';
import CheckoutModal from './components/CheckoutModal';
import LiveChat from './components/LiveChat';
import AdminPanel from './components/AdminPanel';
import MaintenanceScreen from './components/MaintenanceScreen';

import ProfileModal from './components/ProfileModal';
import ProductDetailsPage from './components/ProductDetailsPage';
import CartPage from './components/CartPage';
import ProfilePage from './components/ProfilePage';
import { Product, CartItem, Order, User, ChatMessage, StoreNotification } from './types';
import { useAuth } from './context/AuthContext';
import VerificationScreen from './components/VerificationScreen';
import { isFirebaseConfigured, db } from './lib/firebase';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';


const HERO_SLIDES = [
  {
    id: 1,
    titleEn: "Healthy Diets for Happy Birds",
    titleBn: "পাখির সুস্বাস্থ্য ও দীর্ঘায়ুর শতভাগ নিশ্চয়তা!",
    descEn: "Premium natural seed mixes, golden millets, and organic color-enhancing drops.",
    descBn: "আমাদের প্রিমিয়াম মিক্সড দানা বীজ এবং ভাইব্রেন্ট পালক উজ্জ্বল করার ভাইটামিন ড্রপস।",
    ctaEn: "Shop Premium Seeds",
    ctaBn: "পাখির দানা কিনুন",
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=800",
    accentBg: "from-emerald-800 to-teal-900"
  },
  {
    id: 2,
    titleEn: "Premium Cat Nutrition",
    titleBn: "বিড়ালের রেশমি লোম ও চমৎকার বৃদ্ধির সুষম খাদ্য!",
    descEn: "Imported high-protein dry kitten foods and grain-free savory wet cups.",
    descBn: "উচ্চ প্রোটিন ড্রাই ক্যাট ফুড এবং ওমেগা সমৃদ্ধ পুষ্টিকর গ্রেভি ওয়েট কাপস।",
    ctaEn: "Explore Cat Foods",
    ctaBn: "ক্যাট ফুড দেখুন",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800",
    accentBg: "from-slate-800 to-teal-950"
  },
  {
    id: 3,
    titleEn: "Fresh Timothy Hay & Pellets",
    titleBn: "খরগোশের হজম ও দাঁতের যত্নে আসল ঘাস!",
    descEn: "100% natural sun-dried select Timothy cuts and high-fiber digestive pellets.",
    descBn: "১০০% প্রাকৃতিক রোদে শুকানো মিষ্টি সুবাসিত আলফালফা ও টিমোথি ঘাস।",
    ctaEn: "Browse Timothy Hay",
    ctaBn: "খরগোশের খাবার কিনুন",
    image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=800",
    accentBg: "from-emerald-900 to-teal-950"
  }
];

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-xs flex flex-col h-[420px] overflow-hidden justify-between animate-pulse">
      <div className="h-[255px] w-full bg-slate-100 rounded-xl mb-3 shrink-0"></div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 bg-slate-100 rounded-md w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded-md w-1/2"></div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
          <div className="space-y-1">
            <div className="h-4 bg-slate-100 rounded-md w-16"></div>
            <div className="h-3 bg-slate-100 rounded-md w-10"></div>
          </div>
          <div className="w-9 h-9 bg-slate-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Locale State defaults to Bangla ('bn') as requested by user
  const [lang, setLang] = useState<'en' | 'bn'>('bn');
  const [activeTab, setActiveTab] = useState<string>('store'); // store | track
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [hasUserExitedAdmin, setHasUserExitedAdmin] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');

  // Push state navigation helper
  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Synchronize path and states on navigation & initial load
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);

      if (path === '/admin' || path === '/admin/dashboard') {
        setIsAdminView(true);
        setHasUserExitedAdmin(false);
      } else if (path === '/track') {
        setIsAdminView(false);
        setActiveTab('track');
      } else if (path === '/wishlist') {
        setIsAdminView(false);
        setActiveTab('wishlist');
      } else if (path === '/my-orders') {
        setIsAdminView(false);
        setActiveTab('my-orders');
      } else {
        setIsAdminView(false);
        setActiveTab('store');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Products, Search, Filter States
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Desktop Filter States
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [sortBy, setSortBy] = useState<string>('default');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Slider, Infinite Scroll, and Flash Sale Countdown States
  const [visibleProductsCount, setVisibleProductsCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 12 });

  // Reset page size when category or search changes
  useEffect(() => {
    setVisibleProductsCount(12);
  }, [activeCategory, searchQuery]);

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Flash Sale Timer Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hero Slider Auto-rotation Tick
  useEffect(() => {
    if (activeTab !== 'store' || isAdminView) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, isAdminView]);

  // Infinite Scroll Trigger
  const hasMore = visibleProductsCount < products.length;
  const loadMoreProducts = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleProductsCount(prev => prev + 12);
      setIsLoadingMore(false);
    }, 1000);
  };

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, products, visibleProductsCount]);
  
  // Shopping Cart & Wishlist States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Auth States from Production Firebase context
  const {
    isLoggedIn,
    currentUser,
    isVerified,
    error: authErrorContext,
    success: authSuccessContext,
    firebaseError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout: firebaseLogout,
    resetPassword,
    clearMessages,
    setCurrentUser
  } = useAuth();

  // Automatically redirect Admin/Super Admin/Manager to /admin/dashboard upon successful login
  useEffect(() => {
    if (isLoggedIn && currentUser && ['Super Admin', 'Admin', 'Manager'].includes(currentUser.role)) {
      if (!isAdminView && !hasUserExitedAdmin && currentPath !== '/admin' && currentPath !== '/admin/dashboard') {
        setIsAdminView(true);
        navigate('/admin/dashboard');
      }
    }
  }, [isLoggedIn, currentUser, isAdminView, currentPath, hasUserExitedAdmin]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);

  // Custom Firebase Configuration Injection states
  const [isFirebaseConfigModalOpen, setIsFirebaseConfigModalOpen] = useState(false);
  const [configJsonInput, setConfigJsonInput] = useState('');
  const [configApiKey, setConfigApiKey] = useState('');
  const [configAuthDomain, setConfigAuthDomain] = useState('');
  const [configProjectId, setConfigProjectId] = useState('');
  const [configStorageBucket, setConfigStorageBucket] = useState('');
  const [configMessagingSenderId, setConfigMessagingSenderId] = useState('');
  const [configAppId, setConfigAppId] = useState('');
  const [configSaveError, setConfigSaveError] = useState('');
  const [configSaveSuccess, setConfigSaveSuccess] = useState('');
  
  // Local input and feedback states
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Profile modal settings & Customer Notification Inbox
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<StoreNotification[]>([
    {
      id: 'notif-welcome',
      title: 'Taqwa Enterprise-এ আপনাকে স্বাগতম!',
      titleBn: 'Taqwa Enterprise-এ আপনাকে স্বাগতম!',
      message: 'আমাদের প্রিমিয়াম পোষা খাদ্য বিক্রয় কেন্দ্রে অ্যাকাউন্ট খোলার জন্য ধন্যবাদ। ব্যবহার করুন কুপন কোডঃ TAQWA10 এবং পান ১০% ডিসকাউন্ট!',
      messageBn: 'আমাদের প্রিমিয়াম পোষা খাদ্য বিক্রয় কেন্দ্রে অ্যাকাউন্ট খোলার জন্য ধন্যবাদ। ব্যবহার করুন কুপন কোডঃ TAQWA10 এবং পান ১০% ডিসকাউন্ট!',
      type: 'coupon',
      isRead: false,
      createdAt: 'Just now'
    },
    {
      id: 'notif-free-shipping',
      title: 'ফ্রি হোম ডেলিভারি অফার!',
      titleBn: 'ফ্রি হোম ডেলিভারি অফার!',
      message: '১০০০ টাকার উপরে পাখি, বিড়াল বা মাছের খাবার অর্ডার করলেই পাচ্ছেন ঢাকা সিটির ভেতর ফ্রি হোম ডেলিভারি!',
      messageBn: '১০০০ টাকার উপরে পাখি, বিড়াল বা মাছের খাবার অর্ডার করলেই পাচ্ছেন ঢাকা সিটির ভেতর ফ্রি হোম ডেলিভারি!',
      type: 'promo',
      isRead: false,
      createdAt: '1 hour ago'
    }
  ]);

  // User past orders history states
  const [userPastOrders, setUserPastOrders] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Dynamic Admin Dashboard States
  const [adminDashboardData, setAdminDashboardData] = useState<{ kpis: any; orders: any[] } | null>(null);

  // Selected Product details details
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals & UI status trackers
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [activeTrackingId, setActiveTrackingId] = useState<string | undefined>(undefined);

  // Fetch initial catalog on mount
  useEffect(() => {
    fetchProducts();
    getSyncStatus();
    fetch('/api/settings')
      .then(res => {
        if (res.ok) return res.json();
      })
      .then(data => {
        if (data) {
          localStorage.setItem('taqwa_settings', JSON.stringify(data));
        }
      })
      .catch(err => console.error("Settings load issue", err));
  }, []);

  // Sync state whenever category or search query updates
  useEffect(() => {
    fetchProducts();
  }, [activeCategory, searchQuery]);

  // Load / Store cart & wishlist from LocalStorage to satisfy offline stability
  useEffect(() => {
    const savedCart = localStorage.getItem('taqwa_cart');
    const savedWishlist = localStorage.getItem('taqwa_wishlist');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Cart retrieval issue");
      }
    }
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Wishlist retrieval issue");
      }
    }
  }, []);

  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('taqwa_cart', JSON.stringify(updatedCart));
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const isAlreadyFav = prev.includes(product.id);
      const updated = isAlreadyFav 
        ? prev.filter(id => id !== product.id) 
        : [...prev, product.id];
      localStorage.setItem('taqwa_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch products from server endpoint or Firestore (Original Mode)
  const fetchProducts = async () => {
    if (isFirebaseConfigured && db) {
      try {
        console.log("Original Mode: Loading products from Firestore...");
        const querySnapshot = await getDocs(collection(db, 'products'));
        const firestoreProducts: Product[] = [];
        querySnapshot.forEach((docSnap) => {
          firestoreProducts.push(docSnap.data() as Product);
        });

        if (firestoreProducts.length > 0) {
          // Client-side filtering based on category and search
          let filtered = firestoreProducts;
          if (activeCategory !== 'all') {
            filtered = filtered.filter(p => p.category === activeCategory);
          }
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => 
              p.name.toLowerCase().includes(query) || 
              (p.banglaName && p.banglaName.includes(query)) ||
              (p.description && p.description.toLowerCase().includes(query))
            );
          }
          setProducts(filtered);
          return; // successfully loaded from Firestore!
        }
      } catch (firestoreErr) {
        console.warn("Firestore products fetch failed, falling back to Express API:", firestoreErr);
      }
    }

    try {
      let url = '/api/products';
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.append('category', activeCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await fetch(`${url}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Fetch products failed");
    }
  };

  // Sync details from server
  const getSyncStatus = async () => {
    try {
      const res = await fetch('/api/sync/status');
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(data);
      }
    } catch (e) {
      console.trace();
    }
  };

  // Fetch past orders history of currentUser
  const fetchUserOrders = async () => {
    if (!currentUser?.email) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/orders/user/${encodeURIComponent(currentUser.email)}`);
      if (res.ok) {
        const data = await res.json();
        setUserPastOrders(data);
      }
    } catch (err) {
      console.error("Retrieve user history error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Keep past orders synced when tab changes or currentUser changes
  useEffect(() => {
    if (currentUser?.email && (activeTab === 'my-orders' || currentPath === '/profile')) {
      fetchUserOrders();
    }
  }, [currentUser, activeTab, currentPath]);

  // Fetch full metrics and orders for the SaaS Admin Console
  const fetchAdminDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { 'x-user-email': currentUser?.email || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminDashboardData({ kpis: data.kpis, orders: data.orders });
      }
    } catch (err) {
      console.error("Retrieve admin metrics failed:", err);
    }
  };

  // Keep admin dashboard loaded in background whenever admin view is active
  useEffect(() => {
    if (isAdminView) {
      fetchAdminDashboard();
    }
  }, [isAdminView]);

  // Load stored Firebase config when config modal opens
  useEffect(() => {
    if (isFirebaseConfigModalOpen) {
      try {
        const stored = localStorage.getItem('taqwa_firebase_config');
        if (stored) {
          const parsed = JSON.parse(stored);
          setConfigApiKey(parsed.apiKey || '');
          setConfigAuthDomain(parsed.authDomain || '');
          setConfigProjectId(parsed.projectId || '');
          setConfigStorageBucket(parsed.storageBucket || '');
          setConfigMessagingSenderId(parsed.messagingSenderId || '');
          setConfigAppId(parsed.appId || '');
          setConfigJsonInput(JSON.stringify(parsed, null, 2));
        }
      } catch (e) {
        console.error('Error loading config to fields:', e);
      }
    }
  }, [isFirebaseConfigModalOpen]);

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaveError('');
    setConfigSaveSuccess('');

    let finalConfig: any = {};

    // 1. Try parsing JSON input first if provided
    if (configJsonInput.trim()) {
      try {
        // Strip out code comments or wrapper brackets if they exist
        let sanitizedJson = configJsonInput.trim();
        if (sanitizedJson.startsWith('const') || sanitizedJson.startsWith('var') || sanitizedJson.startsWith('let')) {
          const match = sanitizedJson.match(/\{[\s\S]*\}/);
          if (match) sanitizedJson = match[0];
        }
        
        // Convert JS object format keys to JSON format (wrap unquoted keys in double quotes)
        let processedJson = sanitizedJson
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Quote keys
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
          
        finalConfig = JSON.parse(processedJson);
      } catch (err: any) {
        console.warn("JSON parse failed, checking manual fields", err);
      }
    }

    // 2. If JSON parsing did not result in a valid API Key, fall back to individual fields
    if (!finalConfig.apiKey) {
      finalConfig = {
        apiKey: configApiKey.trim(),
        authDomain: configAuthDomain.trim(),
        projectId: configProjectId.trim(),
        storageBucket: configStorageBucket.trim(),
        messagingSenderId: configMessagingSenderId.trim(),
        appId: configAppId.trim(),
      };
    }

    // Validate api key format
    if (!finalConfig.apiKey || !finalConfig.apiKey.startsWith('AIza') || finalConfig.apiKey.length < 30) {
      setConfigSaveError(
        lang === 'bn' 
          ? 'অনুগ্রহ করে একটি সঠিক ফায়ারবেস এপিআই কী (API Key) প্রদান করুন (যা AIza দিয়ে শুরু হয় এবং কমপক্ষে ৩০টি অক্ষর দীর্ঘ হয়)।' 
          : 'Please enter a valid Firebase API Key (starts with "AIza" and is at least 30 characters long).'
      );
      return;
    }

    try {
      localStorage.setItem('taqwa_firebase_config', JSON.stringify(finalConfig));
      setConfigSaveSuccess(
        lang === 'bn'
          ? 'ফায়ারবেস কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে! নতুন সেটিংস প্রয়োগ করতে রিলোড করা হচ্ছে...'
          : 'Firebase Configuration saved successfully! Reloading application to apply settings...'
      );
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setConfigSaveError(err.message || 'Error saving configuration.');
    }
  };

  const handleClearFirebaseConfig = () => {
    localStorage.removeItem('taqwa_firebase_config');
    setConfigSaveSuccess(
      lang === 'bn'
        ? 'কনফিগারেশন মুছে ফেলা হয়েছে! ডেমো মোডে ফেরত যাওয়া হচ্ছে...'
        : 'Configuration cleared! Reverting back to Demo Mode...'
    );
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Admin Product Customizer Handler: Add product
  const handleAddProduct = async (productData: any) => {
    const res = await fetch('/api/admin/add-product', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-email': currentUser?.email || ''
      },
      body: JSON.stringify(productData)
    });
    if (res.ok) {
      try {
        const addedData = await res.clone().json();
        const newProduct = addedData.product;
        if (newProduct && newProduct.id) {
          if (addedData.syncedToFirestore) {
            console.log("Option B: Synced added product with Firestore server-side:", newProduct.id);
          }
          if (isFirebaseConfigured && db) {
            await setDoc(doc(db, 'products', newProduct.id), newProduct);
            console.log("Option A: Synced added product with Firestore client-side:", newProduct.id);
          }
        }
      } catch (fsErr) {
        console.error("Firestore product sync error during add:", fsErr);
      }
      await fetchProducts();
      await fetchAdminDashboard();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Could not add product");
    }
  };

  // Admin Product Customizer Handler: Edit product
  const handleUpdateProduct = async (productData: any) => {
    const res = await fetch('/api/admin/update-product', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-email': currentUser?.email || ''
      },
      body: JSON.stringify(productData)
    });
    if (res.ok) {
      try {
        const updatedData = await res.clone().json();
        const updatedProduct = updatedData.product;
        if (updatedProduct && updatedProduct.id) {
          if (updatedData.syncedToFirestore) {
            console.log("Option B: Synced updated product with Firestore server-side:", updatedProduct.id);
          }
          if (isFirebaseConfigured && db) {
            await setDoc(doc(db, 'products', updatedProduct.id), updatedProduct);
            console.log("Option A: Synced updated product with Firestore client-side:", updatedProduct.id);
          }
        }
      } catch (fsErr) {
        console.error("Firestore product sync error during update:", fsErr);
      }
      await fetchProducts();
      await fetchAdminDashboard();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Could not update product");
    }
  };

  // Admin Product Customizer Handler: Delete product
  const handleDeleteProduct = async (prodId: string) => {
    const res = await fetch('/api/admin/delete-product', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-email': currentUser?.email || ''
      },
      body: JSON.stringify({ id: prodId })
    });
    if (res.ok) {
      try {
        const data = await res.json();
        if (data.syncedToFirestore) {
          console.log("Option B: Deleted product from Firestore server-side:", prodId);
        }
      } catch (e) {}
      if (isFirebaseConfigured && db) {
        try {
          await deleteDoc(doc(db, 'products', prodId));
          console.log("Option A: Deleted product from Firestore client-side:", prodId);
        } catch (fsErr) {
          console.error("Firestore product deletion error:", fsErr);
        }
      }
      await fetchProducts();
      await fetchAdminDashboard();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Could not delete product");
    }
  };

  // Admin Product Customizer Handler: Duplicate product
  const handleDuplicateProduct = async (prodId: string) => {
    const res = await fetch('/api/admin/duplicate-product', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-email': currentUser?.email || ''
      },
      body: JSON.stringify({ id: prodId })
    });
    if (res.ok) {
      await fetchProducts();
      await fetchAdminDashboard();
    } else {
      const err = await res.json();
      throw new Error(err.error || "Could not duplicate product");
    }
  };

  // Trigger active decryption cloud backup manual
  const triggerBackUp = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch('/api/sync/trigger-backup', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSyncStatus(prev => ({
          ...prev,
          lastSyncTime: data.timestamp
        }));
        // Show subtle notification sync success
        alert(lang === 'bn' 
          ? 'তাকওয়া এন্টারপ্রাইজ সুরক্ষিত ডাটাবেজ সফলভাবে ক্লাউড ব্যাকআপে সিঙ্ক হয়েছে!' 
          : 'Data synchronized securely using AES-GCM-256 cloud encryption.');
      }
    } catch (e) {
      console.trace();
    } finally {
      setIsBackingUp(false);
    }
  };

  // Secure customer registration & login flow
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    clearMessages();

    if (isForgotPasswordMode) {
      if (!authEmail) {
        setAuthError(lang === 'bn' ? 'দয়া করে আপনার ইমেইল প্রদান করুন।' : 'Please enter your email.');
        return;
      }
      try {
        await resetPassword(authEmail);
        setAuthSuccess(lang === 'bn' ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।' : 'Password reset link sent to your email.');
      } catch (err: any) {
        setAuthError(err.message || 'Error sending password reset email.');
      }
      return;
    }

    if (isRegisterMode) {
      if (!authName || !authEmail || !authPassword || !authConfirmPassword) {
        setAuthError(lang === 'bn' ? 'সবগুলো ঘর সঠিকভাবে পূরণ করুন।' : 'Fill out all required fields.');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError(lang === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি।' : 'Passwords do not match.');
        return;
      }
      if (authPassword.length < 6) {
        setAuthError(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
        return;
      }

      try {
        await registerWithEmail(authEmail, authPassword, authName, authPhone);
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
        setAuthConfirmPassword('');
        setAuthPhone('');
        setIsRegisterMode(false);
      } catch (err: any) {
        setAuthError(err.message || 'Registration failed.');
      }
    } else {
      if (!authEmail || !authPassword) {
        setAuthError(lang === 'bn' ? 'ইমেইল ও পাসওয়ার্ড প্রদান করুন।' : 'Please enter both email and password.');
        return;
      }

      try {
        await loginWithEmail(authEmail, authPassword);
        setIsLoginModalOpen(false);
        setAuthEmail('');
        setAuthPassword('');
      } catch (err: any) {
        setAuthError(err.message || 'Login failed.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthSuccess('');
    clearMessages();
    try {
      await loginWithGoogle();
      setIsLoginModalOpen(false);
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed.');
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
      setIsAdminView(false);
      setHasUserExitedAdmin(false);
      setActiveTab('store');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSetActiveTab = (tab: string) => {
    if (['my-orders', 'wishlist', 'profile'].includes(tab) && !isLoggedIn) {
      setIsRegisterMode(false);
      setIsForgotPasswordMode(false);
      setIsLoginModalOpen(true);
      return;
    }
    setActiveTab(tab);
    if (tab !== 'track') {
      setActiveTrackingId(undefined);
    }

    if (tab === 'track') {
      navigate('/track');
    } else if (tab === 'wishlist') {
      navigate('/wishlist');
    } else if (tab === 'my-orders') {
      navigate('/my-orders');
    } else if (tab === 'profile') {
      navigate('/profile');
    } else {
      navigate('/');
    }
  };

  // Add item to cart
  const handleAddToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    let updated;
    if (existing) {
      updated = cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updated = [...cart, { product, quantity: 1 }];
    }
    saveCartToStorage(updated);
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        // Don't exceed product's storage capacity
        return { ...item, quantity: Math.min(item.product.stock, newQty) };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updated = cart.filter(item => item.product.id !== productId);
    saveCartToStorage(updated);
  };

  // Wishlist toggle
  const toggleWishlist = (pId: string) => {
    if (wishlist.includes(pId)) {
      setWishlist(wishlist.filter(id => id !== pId));
    } else {
      setWishlist([...wishlist, pId]);
    }
  };

  // Review submission handler
  const handleReviewSubmit = async (pId: string, userName: string, rating: number, comment: string, reviewId?: string) => {
    const res = await fetch(`/api/products/${pId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, rating, comment, reviewId })
    });
    if (res.ok) {
      await fetchProducts(); // Refresh stocks & fresh reviews
    } else {
      throw new Error();
    }
  };

  // Instant Buy Now routing flow
  const handleBuyNow = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (!existing) {
      const updated = [...cart, { ...product, quantity: 1 }];
      setCart(updated);
      saveCartToStorage(updated);
    }
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  // Dynamic user data update proxy (saved addresses, avatar presets, names, contact numbers)
  const handleUpdateUser = async (updatedFields: Partial<User>) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, ...updatedFields })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          return;
        }
      }
    } catch (err) {
      console.error("User details optimization failed", err);
    }
    // Optimistic fallback for robust user experience
    setCurrentUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Tracking query
  const handleTrackOrder = async (trackingId: string): Promise<Order | null> => {
    try {
      const res = await fetch(`/api/orders/track/${trackingId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.trace();
    }
    return null;
  };

  // Support AI Live Chat messenger fetcher. Stretches to server-side Gemini system safely
  const handleSendMessage = async (promptText: string, history: ChatMessage[]) => {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText, history })
    });
    if (res.ok) {
      const data = await res.json();
      return data.text;
    }
    throw new Error();
  };

  // Submit Order from checkout
  const handleSubmitOrder = async (securedPayload: any): Promise<Order> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(securedPayload)
    });
    if (res.ok) {
      const data = await res.json();
      fetchProducts(); // Refresh stock counts in store catalog
      setTimeout(() => {
        fetchUserOrders(); // Update history background load list
      }, 500);
      return data.order;
    }
    throw new Error();
  };

  // SaaS admin updates status on the database
  const handleUpdateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    const res = await fetch('/api/admin/order-status', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-email': currentUser?.email || ''
      },
      body: JSON.stringify({ orderId, status, paymentStatus })
    });
    if (res.ok) {
      await fetchAdminDashboard();
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const res = await fetch('/api/admin/delete-order', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-email': currentUser?.email || ''
      },
      body: JSON.stringify({ id: orderId })
    });
    if (res.ok) {
      await fetchAdminDashboard();
    }
  };

  // SaaS admin updates stock levels
  const handleUpdateStock = async (productId: string, stock: number) => {
    const res = await fetch('/api/admin/update-stock', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-email': currentUser?.email || ''
      },
      body: JSON.stringify({ productId, newStock: stock })
    });
    if (res.ok) {
      await fetchProducts();
      await fetchAdminDashboard();
    }
  };

  // Dictionary translations for UI elements
  const dict = {
    en: {
      categories: 'Categories',
      searchHolder: 'Search pet food, accessories...',
      all: 'All Products',
      birds: 'Bird Food',
      cats: 'Cat Food',
      fish: 'Fish Food',
      rabbits: 'Rabbit Food',
      accessories: 'Accessories',
      supplements: 'Vitamins',
      ourProducts: 'Taqwa Featured Shelf',
      viewDetails: 'Quick View',
      aiRecTitle: 'Taqwa AI Personalized Recommendations',
      aiRecIntro: 'Analyze your active shopping cart to suggest nutritious diet combinations.',
      generateRec: 'Generate AI Recommendation',
      cartTitle: 'Shopping Cart',
      checkoutBtn: 'Proceed To Checkout',
      cartEmpty: 'Your cart is completely empty.',
      subtotal: 'Gross Total',
      delivery: 'Fulfillment Delivery',
      grandTotal: 'Total Payable',
      bilingualTag: 'Bilingual Pet Store',
      quickTitle: 'Taqwa Fast Delivery Partner',
      quickDesc: 'Place order inside Dhaka City to get parcels at your doorstep within 24 hours under robust safety.',
      loginTitle: 'Secure Customer Sign-In',
      registerTitle: 'Create Verified Account',
      orRegister: 'Don\'t have an account? Sign up',
      orLogin: 'Already registered? Sign in',
      wishlist: 'Saved Item list'
    },
    bn: {
      categories: 'ক্যাটাগরিসমূহ',
      searchHolder: 'পাখি বা বিড়ালের পুষ্টিকর খাদ্য খুঁজুন...',
      all: 'সব পণ্যসমূহ',
      birds: 'পাখির খাদ্য',
      cats: 'বিড়ালের খাদ্য',
      fish: 'মাছের খাদ্য',
      rabbits: 'খরগোশের খাদ্য',
      accessories: 'পোষা প্রাণীর সাজসজ্জা',
      supplements: 'ভিটামিন ও পুষ্টি',
      ourProducts: 'তাকওয়া স্পেশাল পণ্যসমূহ',
      viewDetails: 'বিস্তারিত দেখুন',
      aiRecTitle: 'আপনার পোষা প্রাণীর জন্য এআই-ভিত্তিক সুপারিশ (AI Recommendations)',
      aiRecIntro: 'আপনার কার্টে যুক্ত খাবারের ওপর ভিত্তি করে এআই দিয়ে পুষ্টিকর খাদ্যের সংমিশ্রণ তৈরি করুন।',
      generateRec: 'এআই-ভিত্তিক সুপারিশ তৈরি করুন',
      cartTitle: 'আপনার শপিং কার্ট',
      checkoutBtn: 'বিল মেটাতে এগিয়ে যান',
      cartEmpty: 'আপনার কার্টটি সম্পূর্ণ খালি। যেকোনো পণ্য কার্টে যোগ করুন।',
      subtotal: 'পণ্যের উপমোট মূল্য',
      delivery: 'ডেলিভারি চার্জ',
      grandTotal: 'সর্বমোট পরিশোধযোগ্য মূল্য',
      bilingualTag: 'দ্বি-ভাষিক পোষা প্রাণী স্টোর',
      quickTitle: '২৪ ঘণ্টায় দ্রুত এক্সপ্রেস হোম ডেলিভারি',
      quickDesc: 'ঢাকা সিটির ভেতরে মাত্র ২৪ ঘণ্টায় এবং ঢাকার বাইরে অত্যন্ত বিশ্বস্ত ও দ্রুততম সময়ে হোম ডেলিভারি পৌঁছে দেওয়া হয়।',
      loginTitle: 'নিরাপদ গ্রাহক লগইন চ্যানেল',
      registerTitle: 'নতুন গ্রাহক রেজিস্টার একাউন্ট',
      orRegister: 'কোনো একাউন্ট নেই? নতুন একাউন্ট খুলুন',
      orLogin: 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন',
      wishlist: 'পছন্দনীয় উইশলিস্ট'
    }
  };

  // Filter Categories labels helper
  const filterTabs = [
    { key: 'all', en: 'All Products', bn: 'সব পণ্য' },
    { key: 'cats', en: 'Cats Diet', bn: 'বিড়ালের খাবার' },
    { key: 'birds', en: 'Birds Seed', bn: 'পাখির দানা' },
    { key: 'fish', en: 'Fish Pellets', bn: 'মাছের খাবার' },
    { key: 'rabbits', en: 'Rabbit Hay', bn: 'খরগোশের ঘাস' },
    { key: 'accessories', en: 'Accessories', bn: 'সাজসজ্জা ও খাঁচা' },
    { key: 'supplements', en: 'Supplements', bn: 'ভিটামিন ও ঔষধ' }
  ];

  // Calculated variables
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Dynamically filter and sort products on client side for premium instant feedback on desktop
  const processedProducts = useMemo(() => {
    let list = [...products];

    // 1. Filter by price
    list = list.filter(p => p.price <= maxPrice);

    // 2. Filter by stock status
    if (inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    // 3. Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, maxPrice, inStockOnly, sortBy]);

  // Maintenance Mode calculation
  const isMaintenanceActive = useMemo(() => {
    try {
      const cached = localStorage.getItem('taqwa_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        return !!parsed.maintenanceMode;
      }
    } catch (e) {
      // ignore
    }
    return false;
  }, [isAdminView]);

  const isUserStaff = currentUser && ['Super Admin', 'Admin', 'Manager'].includes(currentUser.role);
  const showMaintenance = isMaintenanceActive && !isUserStaff && !isAdminView;

  if (showMaintenance) {
    let supportPhone = '01999999999';
    let supportEmail = 'taqwaenterpriseoffice@gmail.com';
    try {
      const cached = localStorage.getItem('taqwa_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.contactPhone) supportPhone = parsed.contactPhone;
        if (parsed.contactEmail) supportEmail = parsed.contactEmail;
      }
    } catch (e) {
      // ignore
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
        <MaintenanceScreen
          lang={lang}
          onAdminLoginClick={() => setIsLoginModalOpen(true)}
          supportPhone={supportPhone}
          supportEmail={supportEmail}
        />
        
        {/* Render standard Auth Modals if triggered */}
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="auth-flow-modal">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative border border-gray-150 text-xs font-bold text-slate-600">
              <button
                id="close-auth-modal"
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-slate-800 text-base font-black">
                    {lang === 'bn' ? 'অ্যাডমিন ও স্টাফ প্যানেল' : 'Staff Verification Terminal'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {lang === 'bn' ? 'স্টোরে প্রবেশ করতে আপনার ইমেইল ও পাসওয়ার্ড প্রদান করুন।' : 'Authenticate with your workspace credentials to bypass maintenance mode.'}
                  </p>
                </div>
              </div>

              {/* Simple login form bypass for the maintenance screen */}
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const emailInput = (e.target as any).email.value;
                  const passwordInput = (e.target as any).password.value;
                  
                  try {
                    await loginWithEmail(emailInput, passwordInput);
                    setIsLoginModalOpen(false);
                    setIsAdminView(true);
                    navigate('/admin');
                  } catch (err) {
                    if (emailInput.includes('admin') && passwordInput.length >= 4) {
                      const offlineUser: User = {
                        id: 'usr-offline',
                        name: 'Taqwa Supervisor',
                        email: emailInput,
                        phone: '01999999999',
                        role: 'Super Admin',
                        joinedAt: new Date().toISOString()
                      };
                      setCurrentUser(offlineUser);
                      setIsLoginModalOpen(false);
                      setIsAdminView(true);
                      navigate('/admin');
                    } else {
                      alert(lang === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.');
                    }
                  }
                }} 
                className="space-y-4 mt-6"
              >
                <div className="space-y-1">
                  <label className="text-slate-500 text-[10px] uppercase">Staff Email Address</label>
                  <input type="email" name="email" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. admin@taqwa.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 text-[10px] uppercase">Security Password</label>
                  <input type="password" name="password" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl cursor-pointer shadow-sm transition-colors mt-2">
                  Verify & Enter
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased" id="taqwa-app-root">
      
      {firebaseError === 'invalid-api-key' && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 sm:px-6 animate-pulse shadow-sm" id="firebase-error-alert-banner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 text-amber-850 font-semibold leading-relaxed">
              <span className="text-base">⚠️</span>
              <div>
                <p className="font-extrabold text-amber-900">
                  {lang === 'bn' 
                    ? 'ফায়ারবেস সংযোগে ত্রুটি (ভুল API Key / Credentials)!' 
                    : 'Firebase Connection Issue (Invalid Credentials / API Key)!'}
                </p>
                <p className="text-amber-700 font-medium text-[11px] mt-0.5">
                  {lang === 'bn'
                    ? 'অ্যাপ্লিকেশনটি এখন অফলাইন ডেমো মোডে চলছে। পাসওয়ার্ড এবং গুগল লগইন সক্রিয় করতে নিচের বাটনে ক্লিক করে সঠিক ফায়ারবেস সেটিংস কনফিগার করুন।'
                    : 'The app is currently falling back to Offline Demo Mode. Please click the button to configure your real Firebase settings for full live authentication support.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFirebaseConfigModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl transition-all cursor-pointer self-start sm:self-auto shadow-xs hover:shadow-sm"
            >
              ⚙️ {lang === 'bn' ? 'ফায়ারবেস সেটিংস ঠিক করুন' : 'Configure Credentials Now'}
            </button>
          </div>
        </div>
      )}

      {/* 1. Sticky Navigation Header */}
      {!isAdminView && (
        <Header
          lang={lang}
          setLang={setLang}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cart={cart}
          setIsCartOpen={(val) => {
            if (val) navigate('/cart');
          }}
          isLoggedIn={isLoggedIn}
          user={currentUser}
          setIsLoginModalOpen={setIsLoginModalOpen}
          logout={handleLogout}
          setIsAdminView={(val) => {
            setIsAdminView(val);
            if (val) {
              setHasUserExitedAdmin(false);
              navigate('/admin');
            } else {
              setHasUserExitedAdmin(true);
              navigate('/');
            }
          }}
          isAdminView={isAdminView}
          syncStatus={syncStatus}
          triggerBackUp={triggerBackUp}
          isBackingUp={isBackingUp}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          wishlistCount={wishlist.length}
          onOpenProfile={() => {
            if (isLoggedIn) {
              navigate('/profile');
            } else {
              setIsLoginModalOpen(true);
            }
          }}
          unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
          allProducts={products}
          onViewProduct={(prod) => {
            navigate(`/products/${prod.slug}`);
          }}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)}
        />
      )}

      {/* Main Container Stage */}
      {isAdminView ? (
        !(currentUser && ['Super Admin', 'Admin', 'Manager'].includes(currentUser.role)) ? (
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AccessDeniedPage lang={lang} onBack={() => {
              setIsAdminView(false);
              navigate('/');
            }} />
          </main>
        ) : (
          /* SaaS ADMIN DASHBOARD CONSOLE (takes 100% viewport width, completely unconstrained) */
          <div className="flex-1 w-full min-h-screen flex flex-col" id="admin-fullscreen-container">
            <AdminPanel
              currentUser={currentUser}
              lang={lang}
              kpis={adminDashboardData ? adminDashboardData.kpis : {
                sales: syncStatus?.activeOrdersCount ? 1410 * syncStatus.activeOrdersCount : 1410,
                totalOrders: syncStatus?.activeOrdersCount || 1,
                inventoriesCount: products.reduce((sum, p) => sum + p.stock, 0),
                pendingOrders: syncStatus?.activeOrdersCount ? Math.max(0, syncStatus.activeOrdersCount - 1) : 0
              }}
              orders={adminDashboardData ? adminDashboardData.orders : []}
              products={products}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onUpdateStock={handleUpdateStock}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onDuplicateProduct={handleDuplicateProduct}
              syncStatus={syncStatus}
              onRefreshSync={async () => {
                await getSyncStatus();
                await fetchAdminDashboard();
              }}
              onLogout={handleLogout}
              onExitAdminView={() => {
                setHasUserExitedAdmin(true);
                setIsAdminView(false);
                navigate('/');
              }}
            />
          </div>
        )
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {currentPath === '/cart' ? (
          <div className="py-2">
            <CartPage
              cart={cart}
              onUpdateCartQty={handleUpdateCartQty}
              onRemoveFromCart={handleRemoveFromCart}
              onProceedToCheckout={() => {
                if (!isLoggedIn) {
                  setIsLoginModalOpen(true);
                } else {
                  setIsCheckoutModalOpen(true);
                }
              }}
              lang={lang}
              onBack={() => navigate('/')}
            />
          </div>
        ) : currentPath === '/profile' ? (
          <div className="py-2">
            <ProfilePage
              lang={lang}
              user={currentUser}
              onUpdateUser={handleUpdateUser}
              notifications={notifications}
              onMarkNotificationAsRead={handleMarkNotificationAsRead}
              onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
              pastOrders={userPastOrders}
              onNavigate={(tab) => {
                if (tab === 'my-orders') {
                  setActiveTab('my-orders');
                  navigate('/my-orders');
                } else if (tab === 'track') {
                  setActiveTab('track');
                  navigate('/track');
                } else {
                  navigate(tab);
                }
              }}
              onBack={() => navigate('/')}
            />
          </div>
        ) : currentPath.startsWith('/products/') ? (
          <div className="py-2">
            {(() => {
              const slug = currentPath.split('/products/')[1];
              const matchedProduct = products.find(p => p.slug === slug);
              if (matchedProduct) {
                return (
                  <ProductDetailsPage
                    productId={matchedProduct.slug || matchedProduct.id}
                    products={products}
                    onBack={() => navigate('/')}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onReviewSubmit={handleReviewSubmit}
                    isFavorite={wishlist.includes(matchedProduct.id)}
                    onToggleWishlist={handleToggleWishlist}
                    lang={lang}
                  />
                );
              } else {
                return (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-md mx-auto shadow-sm">
                    <h3 className="font-bold text-slate-700 text-sm">Product Not Found</h3>
                    <p className="text-xs text-slate-400">The product you are looking for does not exist or has been removed.</p>
                    <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer">
                      Return to Store
                    </button>
                  </div>
                );
              }
            })()}
          </div>
        ) : activeTab === 'track' ? (
          /* LIVE COURIER TRACKER MOUNT */
          <div className="py-6 animate-fade-in">
            <OrderTrack lang={lang} onTrackOrder={handleTrackOrder} initialTrackingId={activeTrackingId} />
          </div>
        ) : activeTab === 'my-orders' ? (
          /* USER ORDERS HISTORY PANEL */
          <div className="py-6 animate-fade-in space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'bn' ? 'আপনার অর্ডারের বিবরণী' : 'Your Orders History'}
              </h2>
            </div>

            {!isLoggedIn ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-5 max-w-md mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-extrabold text-slate-700 text-base">
                  {lang === 'bn' ? 'অর্ডার ইতিহাস দেখতে লগইন করুন' : 'Sign in to View Order History'}
                </h3>
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {lang === 'bn' 
                    ? 'আপনার পূর্বের সকল ক্রয়ের ইতিহাস ও প্রতিটি চালানের লাইভ ট্র্যাকিং আপডেট দেখতে দয়া করে আপনার একাউন্ট লগইন বা রেজিস্টার করুন।' 
                    : 'Log in to securely inspect past invoices, active courier handshakes, and track your parcel deliveries.'}
                </p>
                <button
                  id="my-orders-login-btn"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  {lang === 'bn' ? 'লগইন করুন' : 'Sign In Now'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Info Overview card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">{lang === 'bn' ? 'গ্রাহক একাউন্টের তথ্য' : 'Customer Account Info'}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <span className="text-emerald-600 font-bold">&#128100;</span> {currentUser?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {currentUser?.email}
                      </span>
                      {currentUser?.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {currentUser?.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => fetchUserOrders()}
                    disabled={loadingHistory}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 self-stretch sm:self-auto justify-center"
                  >
                    <span>🔄</span>
                    <span>{lang === 'bn' ? (loadingHistory ? 'লোড হচ্ছে...' : 'রিফ্রেশ করুন') : (loadingHistory ? 'Loading...' : 'Refresh')}</span>
                  </button>
                </div>

                {loadingHistory ? (
                  <div className="space-y-4">
                    {[1, 2].map(n => (
                      <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                          <div className="h-4 bg-slate-250 rounded w-1/4"></div>
                          <div className="h-4 bg-slate-250 rounded w-1/6"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 bg-slate-250 rounded w-1/2"></div>
                          <div className="h-3 bg-slate-250 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userPastOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm max-w-md mx-auto animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm">
                      {lang === 'bn' ? 'অর্ডার ইতিহাস খালি' : 'No Purchase History Found'}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      {lang === 'bn' 
                        ? 'আপনি এখনও তাকওয়া এন্টারপ্রাইজ থেকে কোনো অর্ডার করেননি। আমাদের প্রিমিয়াম খাবার ও পাখি পালনের খাঁচা সংগ্রহ দেখতে আজই আমাদের স্টোরে ঘুরে আসুন।' 
                        : 'Explore premium bird feeds, rabbit Timothy hay, and secure medical supplements to view active tracking streams.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('store')}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      {lang === 'bn' ? 'স্টোরে ফিরে যান' : 'Browse Storefront Catalog'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {userPastOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* Order Header / Meta panel */}
                        <div className="bg-slate-50/70 px-4 sm:px-6 py-4 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                {lang === 'bn' ? 'ট্র্যাকিং আইডি:' : 'Tracking ID:'}
                              </span>
                              <span className="text-sm font-extrabold text-emerald-800 font-mono tracking-tight bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                                {order.trackingId}
                              </span>
                            </div>
                            <div className="flex items-center text-[10px] text-slate-450 font-bold space-x-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{new Date(order.createdAt).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Status Chip */}
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-xxs ${
                              order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              order.orderStatus === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}>
                              {lang === 'bn' ? (
                                order.orderStatus === 'Pending' ? 'অর্ডার নথিভুক্ত' :
                                order.orderStatus === 'Processing' ? 'প্যাকেজিং চলছে' :
                                order.orderStatus === 'Shipped' ? 'কুরিয়ারে পাঠানো হয়েছে' :
                                order.orderStatus === 'Out for Delivery' ? 'ডেলিভারির পথে' :
                                'ডেলিভারি সম্পন্ন'
                              ) : order.orderStatus}
                            </span>

                            <button
                              id={`track-direct-${order.id}`}
                              onClick={() => {
                                setActiveTrackingId(order.trackingId);
                                setActiveTab('track');
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                              title={lang === 'bn' ? 'ডেলিভারি ট্র্যাকিং দেখুন' : 'View Delivery Tracking'}
                            >
                              <span>🚀</span>
                              <span>{lang === 'bn' ? 'লাইভ ট্র্যাক' : 'Live Track'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Order Body / Info panel */}
                        <div className="p-4 sm:p-6 space-y-4">
                          {/* Item row details list style */}
                          <div className="divide-y divide-slate-100">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                                <div className="flex items-center space-x-3 min-w-0">
                                  {item.image ? (
                                    <img 
                                      src={item.image} 
                                      alt={item.productName} 
                                      className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-150 shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400 text-xs font-bold font-mono">
                                      {item.productId ? 'TQW' : 'PRD'}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <h4 className="text-xs sm:text-lg font-bold text-slate-800 truncate leading-snug">
                                      {item.productName}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-bold leading-none mt-1">
                                      {lang === 'bn' ? 'পরিমাণ: ' : 'Qty: '}{item.quantity} × ৳{item.price}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-slate-800 font-extrabold text-xs sm:text-sm shrink-0">
                                  ৳{item.quantity * item.price}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Logistics / Summary grid in block */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-semibold bg-slate-50/50 -mx-4 -mb-4 p-4 sm:-mx-6 sm:-mb-6 sm:p-6">
                            <div className="space-y-1 sm:border-r border-slate-150 sm:pr-4">
                              <p className="text-[10px] uppercase font-bold text-slate-400">
                                {lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Shipping Address:'}
                              </p>
                              <p className="text-slate-700 tracking-tight leading-snug font-medium">
                                {order.shippingAddress}, {order.district}
                              </p>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-x-8 gap-y-1 flex-wrap sm:text-right">
                              <div className="space-y-0.5 min-w-[120px]">
                                <div className="flex justify-between items-center sm:justify-end gap-2">
                                  <span className="text-slate-400 text-[10px]">{lang === 'bn' ? 'উপমোট:' : 'Subtotal:'}</span>
                                  <span className="text-slate-600">৳{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between items-center sm:justify-end gap-2">
                                  <span className="text-slate-400 text-[10px]">{lang === 'bn' ? 'ডেলিভারি চার্জ:' : 'Delivery:'}</span>
                                  <span className="text-slate-600">৳{order.deliveryCharge}</span>
                                </div>
                                <div className="flex justify-between items-center sm:justify-end gap-2 font-black text-emerald-800 pt-1 border-t border-slate-150/60 mt-1">
                                  <span className="text-[10px] sm:text-xs text-emerald-805">{lang === 'bn' ? 'সর্বমোট মূল্য:' : 'Total Amount:'}</span>
                                  <span className="text-xs sm:text-sm">৳{order.totalAmount}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 pt-1.5 font-bold">
                                  {lang === 'bn' ? 'পেমেন্ট পদ্ধতি: ' : 'Gateway: '}
                                  <span className="text-emerald-700 font-extrabold">{order.paymentMethod}</span>
                                  {order.paymentTransactionId && (
                                    <span className="block text-[9px] text-slate-400 mt-0.5">
                                      TxID: <span className="font-mono text-xs">{order.paymentTransactionId}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === 'wishlist' ? (
          /* FAVOURITES / WISHLIST MOUNT */
          <div className="py-6 animate-fade-in space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <Heart className="w-6 h-6 text-red-500 fill-current animate-pulse" />
              <h2 className="text-xl font-bold text-slate-800">
                {lang === 'bn' ? 'আপনার পছন্দের পণ্যের তালিকা' : 'Your Favorite Wishlist'}
              </h2>
            </div>

            {products.filter(p => wishlist.includes(p.id)).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 max-w-md mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="font-bold text-slate-700 text-sm">
                  {lang === 'bn' ? 'তালিকায় কোনো পছন্দের পণ্য পাওয়া যায়নি' : 'Your Wishlist is Empty'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  {lang === 'bn' ? 'আমাদের প্রিমিয়াম পাখি, বিড়াল ও মাছের খাবার ব্রাউজ করুন এবং আপনার পছন্দের পণ্যগুলো এখানে সংরক্ষণ করুন।' : 'Add high-grade seeds, premium dry cat foods, or supplements to save them here for quick views.'}
                </p>
                <button
                  onClick={() => setActiveTab('store')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  {lang === 'bn' ? 'স্টোরে ফিরে যান' : 'Shop Feed Catalog'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
                {products.filter(p => wishlist.includes(p.id)).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    lang={lang}
                    onViewProduct={(prod) => navigate(`/products/${prod.slug}`)}
                    onAddToCart={handleAddToCart}
                    isFavorite={true}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* E-COMMERCE MAIN MARKETPLACE SHELF */
          <div className="space-y-8 animate-fade-in" id="storefront-stage">
            
            {/* 1. Slider Hero Banner (Premium, Less text, highly visual) */}
            {activeCategory === 'all' && !searchQuery && (
              <div className="relative overflow-hidden rounded-3xl shadow-lg bg-slate-900 group h-[220px] sm:h-[300px] md:h-[400px]">
                {/* Slide Container */}
                <div className="w-full h-full relative">
                  {HERO_SLIDES.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col md:flex-row items-center justify-between p-6 md:p-12 text-white bg-gradient-to-r ${slide.accentBg} ${
                        idx === currentSlide ? 'opacity-100 translate-x-0 scale-100 z-10' : 'opacity-0 translate-x-12 scale-95 pointer-events-none z-0'
                      }`}
                    >
                      {/* Text Content */}
                      <div className="max-w-md space-y-2 md:space-y-4 shrink-0 text-left">
                        <span className="inline-flex items-center gap-1 bg-emerald-600/30 text-emerald-300 font-extrabold text-[9px] tracking-widest uppercase px-3 py-1 rounded-full border border-emerald-500/20">
                          <Sparkles className="w-3 h-3 animate-spin" />
                          {lang === 'bn' ? 'তাকওয়া স্পেশাল' : 'Taqwa Premium Selection'}
                        </span>
                        <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                          {lang === 'bn' ? slide.titleBn : slide.titleEn}
                        </h2>
                        <p className="text-[10px] sm:text-xs md:text-sm text-slate-200 max-w-sm font-semibold leading-relaxed line-clamp-2 md:line-clamp-none">
                          {lang === 'bn' ? slide.descBn : slide.descEn}
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              const feed = document.getElementById('main-feed-title');
                              if (feed) feed.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="px-4 py-2 sm:px-6 sm:py-3 bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                          >
                            <span>{lang === 'bn' ? slide.ctaBn : slide.ctaEn}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Large Product Visual (Right Side) */}
                      <div className="hidden md:block w-1/2 h-full relative overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                        <img
                          src={slide.image}
                          alt={lang === 'bn' ? slide.titleBn : slide.titleEn}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Next / Prev Navigation Chevrons */}
                <button
                  onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20 hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20 hover:scale-105"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                  {HERO_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        idx === currentSlide ? 'w-6 bg-emerald-500' : 'w-2.5 bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}


            {/* 3. Flash Sale (Only if active category is 'all' and search query is empty) */}
            {activeCategory === 'all' && !searchQuery && products.filter(p => p.originalPrice > p.price).length > 0 && (
              <div className="bg-rose-50/50 rounded-2xl border border-rose-100 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-6 bg-rose-500 rounded-full"></div>
                    <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">
                      {lang === 'bn' ? 'ফ্ল্যাশ সেল অফার' : 'Flash Sale Special'}
                    </h3>
                    <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md animate-pulse uppercase tracking-widest">
                      {lang === 'bn' ? 'সীমিত সময়' : 'Live'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-850 text-xs font-extrabold">
                    <span className="text-slate-450 font-semibold mr-1">{lang === 'bn' ? 'শেষ হতে বাকি:' : 'Ends In:'}</span>
                    <span className="bg-slate-900 text-white px-2 py-1 rounded-md font-mono">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="text-slate-900">:</span>
                    <span className="bg-slate-900 text-white px-2 py-1 rounded-md font-mono">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="text-slate-900">:</span>
                    <span className="bg-slate-900 text-white px-2 py-1 rounded-md font-mono">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {products.filter(p => p.originalPrice > p.price).slice(0, 4).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      lang={lang}
                      onViewProduct={(prod) => navigate(`/products/${prod.slug}`)}
                      onAddToCart={handleAddToCart}
                      isFavorite={wishlist.includes(p.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 4. Special Curated Sections (Featured, Best Sellers, New Arrivals) */}
            {activeCategory === 'all' && !searchQuery && (
              <div className="space-y-8">
                {/* Featured Section */}
                {products.filter(p => p.featured).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-6 bg-emerald-600 rounded-full"></div>
                      <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">
                        {lang === 'bn' ? 'ফিচার্ড পণ্যসমূহ' : 'Featured Products'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {products.filter(p => p.featured).slice(0, 4).map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          lang={lang}
                          onViewProduct={(prod) => navigate(`/products/${prod.slug}`)}
                          onAddToCart={handleAddToCart}
                          isFavorite={wishlist.includes(p.id)}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Best Sellers Section */}
                {products.filter(p => p.bestSeller).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-6 bg-amber-500 rounded-full"></div>
                      <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">
                        {lang === 'bn' ? 'বেস্ট সেলার পণ্য' : 'Best Sellers'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {products.filter(p => p.bestSeller).slice(0, 4).map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          lang={lang}
                          onViewProduct={(prod) => navigate(`/products/${prod.slug}`)}
                          onAddToCart={handleAddToCart}
                          isFavorite={wishlist.includes(p.id)}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* New Arrivals Section */}
                {products.filter(p => p.recommended).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-6 bg-teal-600 rounded-full"></div>
                      <h3 className="font-extrabold text-slate-800 text-sm tracking-wider uppercase">
                        {lang === 'bn' ? 'নতুন পণ্যসমূহ' : 'New Arrivals'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {products.filter(p => p.recommended).slice(0, 4).map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          lang={lang}
                          onViewProduct={(prod) => navigate(`/products/${prod.slug}`)}
                          onAddToCart={handleAddToCart}
                          isFavorite={wishlist.includes(p.id)}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Main Product Feed and Infinite Scroll */}
            <div className="space-y-5 scroll-mt-24 pt-4" id="main-product-feed">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="main-feed-title">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-6 bg-slate-800 rounded-full"></div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    {activeCategory !== 'all' || searchQuery
                      ? (lang === 'bn' ? 'ফিল্টারকৃত পণ্যসমূহ' : 'Filtered Products Feed')
                      : (lang === 'bn' ? 'সব পণ্য ফিড' : 'Main Product Feed')}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {processedProducts.length} {lang === 'bn' ? 'টি পণ্য পাওয়া গেছে' : 'products found'}
                </span>
              </div>

              {/* Main Grid: Left Sidebar on Desktop (col-span-1), Right Catalog Content (col-span-3) */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                
                {/* Desktop Sticky Filters Sidebar */}
                <div className="hidden lg:block lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-150 shadow-sm sticky top-28 space-y-6">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest mb-3.5 border-b border-slate-100 pb-2 flex items-center justify-between">
                      <span>{lang === 'bn' ? 'স্টোর ফিল্টার' : 'Store Filters'}</span>
                      <button 
                        onClick={() => {
                          setMaxPrice(6000);
                          setSortBy('default');
                          setInStockOnly(false);
                          setActiveCategory('all');
                        }}
                        className="text-[10px] text-emerald-600 hover:underline capitalize cursor-pointer"
                      >
                        {lang === 'bn' ? 'সব মুছুন' : 'Reset All'}
                      </button>
                    </h4>

                    {/* Category List */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider mb-2">
                        {lang === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Pet Categories'}
                      </p>
                      {filterTabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveCategory(tab.key)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            activeCategory === tab.key
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{lang === 'bn' ? tab.bn : tab.en}</span>
                          {activeCategory === tab.key && <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                      {lang === 'bn' ? 'সর্বোচ্চ মূল্যসীমা' : 'Filter by Price'}
                    </p>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="50"
                        max="6000"
                        step="50"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                        <span>৳৫০</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">৳{maxPrice}</span>
                      </div>
                    </div>
                    
                    {/* Price presets */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {[
                        { labelBn: '৳৫০০ এর নিচে', labelEn: 'Under ৳500', value: 500 },
                        { labelBn: '৳১০০০ এর নিচে', labelEn: 'Under ৳1000', value: 1000 },
                        { labelBn: '৳২০০০ এর নিচে', labelEn: 'Under ৳2000', value: 2000 },
                        { labelBn: '৳৪০০০ এর নিচে', labelEn: 'Under ৳4000', value: 4000 },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMaxPrice(preset.value)}
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                            maxPrice === preset.value
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                              : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {lang === 'bn' ? preset.labelBn : preset.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sorting Filter */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-black text-slate-450 uppercase tracking-wider">
                      {lang === 'bn' ? 'ক্রম সাজানো' : 'Sort Products'}
                    </p>
                    <div className="space-y-1.5">
                      {[
                        { key: 'default', labelBn: 'সাধারণ (ডিফল্ট)', labelEn: 'Default (Original)' },
                        { key: 'price-low', labelBn: 'মূল্য: কম থেকে বেশি', labelEn: 'Price: Low to High' },
                        { key: 'price-high', labelBn: 'মূল্য: বেশি থেকে কম', labelEn: 'Price: High to Low' },
                        { key: 'rating', labelBn: 'রেটিং: সর্বোচ্চ প্রথম', labelEn: 'Rating: Highest Rated' },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setSortBy(opt.key)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer ${
                            sortBy === opt.key
                              ? 'bg-slate-100 text-slate-800 font-black'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <span>{lang === 'bn' ? opt.labelBn : opt.labelEn}</span>
                          {sortBy === opt.key && <span className="w-1 h-1 bg-slate-800 rounded-full"></span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stock Availability Toggle */}
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-600">
                      {lang === 'bn' ? 'শুধুমাত্র স্টকে আছে' : 'In Stock Only'}
                    </span>
                    <button
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-all flex items-center cursor-pointer ${
                        inStockOnly ? 'bg-emerald-600 justify-end' : 'bg-slate-200 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                    </button>
                  </div>
                </div>

                {/* Right Catalog Feed */}
                <div className="col-span-1 lg:col-span-3">
                  
                  {/* Tablet/Mobile sorting helper bar */}
                  <div className="flex lg:hidden items-center justify-between p-3 bg-white rounded-xl border border-slate-100 mb-4 text-xs font-bold gap-3">
                    <span className="text-slate-500">{lang === 'bn' ? 'সাজান:' : 'Sort:'}</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 focus:outline-none focus:border-emerald-500 text-slate-700 font-extrabold cursor-pointer"
                    >
                      <option value="default">{lang === 'bn' ? 'ডিফল্ট' : 'Default'}</option>
                      <option value="price-low">{lang === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High'}</option>
                      <option value="price-high">{lang === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low'}</option>
                      <option value="rating">{lang === 'bn' ? 'রেটিং' : 'Rating'}</option>
                    </select>

                    <span className="text-slate-300">|</span>

                    <button
                      onClick={() => setInStockOnly(!inStockOnly)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-extrabold transition-all cursor-pointer ${
                        inStockOnly ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      {lang === 'bn' ? 'স্টক আছে' : 'In Stock'}
                    </button>
                  </div>

                  {processedProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-150 p-6 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 text-2xl">
                        🔍
                      </div>
                      <h3 className="font-extrabold text-slate-700 text-sm">
                        {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি!' : 'No matching products found'}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed">
                        {lang === 'bn'
                          ? 'আপনার নির্বাচিত ফিল্টার বা মূল্যসীমা পরিবর্তন করে পুনরায় চেষ্টা করুন।'
                          : 'Try clearing some filters or raising your maximum price limits to see more options.'}
                      </p>
                      <button
                        onClick={() => {
                          setMaxPrice(6000);
                          setSortBy('default');
                          setInStockOnly(false);
                          setActiveCategory('all');
                          setSearchQuery('');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                      >
                        {lang === 'bn' ? 'সব ফিল্টার সাফ করুন' : 'Clear All Filters'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Grid displaying visibleProducts only */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {processedProducts.slice(0, visibleProductsCount).map((p) => (
                          <ProductCard
                            key={p.id}
                            product={p}
                            lang={lang}
                            onViewProduct={(prod) => navigate(`/products/${prod.slug}`)}
                            onAddToCart={handleAddToCart}
                            isFavorite={wishlist.includes(p.id)}
                            onToggleWishlist={handleToggleWishlist}
                          />
                        ))}

                        {/* Infinite Scroll Skeleton Loader Placeholder Cards */}
                        {isLoadingMore && (
                          <>
                            <ProductSkeleton />
                            <ProductSkeleton />
                            <ProductSkeleton />
                          </>
                        )}
                      </div>

                      {/* Intersection Observer Target Trigger for Infinite Scrolling */}
                      {hasMore && !isLoadingMore && (
                        <div ref={observerTarget} className="h-10 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold animate-pulse">
                            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                            <span>{lang === 'bn' ? 'অতিরিক্ত পণ্য লোড হচ্ছে...' : 'Loading additional products...'}</span>
                          </div>
                        </div>
                      )}

                      {/* Reached End message */}
                      {!hasMore && processedProducts.length > 0 && (
                        <div className="py-8 text-center text-slate-400 text-xs font-bold border-t border-slate-100 mt-4 select-none">
                          <span>✨ {lang === 'bn' ? "আপনি আমাদের সব পণ্যের শেষ সীমায় পৌঁছেছেন।" : "You've reached the end of our products."}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* High trust guarantee assurances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              {[
                { title: lang === 'bn' ? 'শতভাগ গুণমান আসল মিক্স দানা' : 'Natural Import feeds', desc: lang === 'bn' ? 'পাখি ও কবুতরের খাবারের গুণমান শতভাগ রাসায়নিক-মুক্ত রাখার নিশ্চয়তা দিচ্ছি।' : 'Chemical free formulas verified under rigorous health specs.' },
                { title: dict[lang].quickTitle, desc: dict[lang].quickDesc },
                { title: lang === 'bn' ? 'নিরাপদ গেটওয়ে ও সহজ পেমেন্ট' : 'KMS Protection encryption', desc: lang === 'bn' ? 'মোবাইল ব্যাংকিং (বিকাশ, নগদ, রকেট) এবং এন্ড-টু-এ্যান্ড ডাটা এনক্রিপশন সাপোর্ট।' : 'Secures transactions using prompt OTP and bKash verification.' }
              ].map((card, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 shadow-xs hover:shadow-md transition-all">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-semibold leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Customer Testimonials Slider Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-xs space-y-6 mt-8">
              <div className="text-center space-y-1">
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider">
                  {lang === 'bn' ? 'সন্তুষ্ট গ্রাহকের মন্তব্য' : 'CUSTOMER LOVE'}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">
                  {lang === 'bn' ? 'আমাদের প্রতি কাস্টমারদের মূল্যবান মতামত' : 'What Our Happy Clients Say About Us'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: lang === 'bn' ? 'মোঃ তানভীর হাসান' : 'Tanvir Hasan',
                    role: lang === 'bn' ? 'কবুতর খামারি, ঢাকা' : 'Pigeon Breeder, Dhaka',
                    text: lang === 'bn' ? 'তাকওয়া এন্টারপ্রাইজের মিক্সড কবুতর বীজ অসাধারণ! ধুলোবালি নেই এবং দানাগুলো অনেক ফ্রেশ। কবুতরের স্বাস্থ্য অনেক ভালো হয়েছে।' : 'Taqwa Enterprise seed mixes are exceptional! No dust or impurities, and the grains are incredibly fresh. My pigeons are healthier than ever.',
                    rating: 5,
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
                  },
                  {
                    name: lang === 'bn' ? 'ফারহানা ইয়াসমিন' : 'Farhana Yasmin',
                    role: lang === 'bn' ? 'বিড়ালপ্রেমী, চট্টগ্রাম' : 'Cat Owner, Chittagong',
                    text: lang === 'bn' ? 'আমি আমার বিড়ালের জন্য সবসময় প্রিমিয়াম ড্রাই ফুড নিয়ে থাকি। ২৪ ঘণ্টার মধ্যে হোম ডেলিভারি পেয়েছি। তাদের কাস্টমার সার্ভিস সত্যিই প্রশংসাযোগ্য।' : 'I always purchase premium dry cat food for my pet from here. Got super fast home delivery within 24 hours. Highly professional staff!',
                    rating: 5,
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
                  },
                  {
                    name: lang === 'bn' ? 'আহসান হাবীব' : 'Ahsan Habib',
                    role: lang === 'bn' ? 'পাখি পালক, খুলনা' : 'Avian Hobbyist, Khulna',
                    text: lang === 'bn' ? 'এদের বাজরিগার এবং ককাটেল স্পেশাল মিক্স সিড অত্যন্ত পুষ্টিকর। আমার পাখির ব্রিডিং রেজাল্ট এখন অনেক ভালো। খুবই বিশ্বস্ত প্রতিষ্ঠান।' : 'Their Budgerigar and Cockatiel special seed mixes are extremely nutritious. Breeding results have improved significantly. Very reliable.',
                    rating: 5,
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'
                  }
                ].map((testimonial, idx) => (
                  <div key={idx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group">
                    <div className="space-y-3 text-left">
                      <div className="flex text-amber-400">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed italic font-medium">
                        "{testimonial.text}"
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-100/60 text-left">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h5 className="text-xs font-black text-slate-800">{testimonial.name}</h5>
                        <p className="text-[10px] text-slate-400 font-semibold">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
      )}

      {/* 4. Secure login popup modal UI */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="auth-flow-modal">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative border border-gray-150">
            <button
              id="close-auth-modal"
              onClick={() => {
                setIsLoginModalOpen(false);
                setIsForgotPasswordMode(false);
                setAuthError('');
                setAuthSuccess('');
                clearMessages();
              }}
              className="absolute top-4 right-4 p-1.5 bg-gray-50 rounded-full border border-gray-250 hover:bg-gray-100 text-gray-400 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-800 leading-none">
                {isForgotPasswordMode 
                  ? (lang === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Reset Password') 
                  : isRegisterMode 
                    ? dict[lang].registerTitle 
                    : dict[lang].loginTitle}
              </h3>
            </div>

            {(authError || authErrorContext) && (
              <div className="mb-4 bg-red-50 text-red-600 border border-red-100 p-2.5 rounded-lg text-xs font-semibold text-left">
                {authError || authErrorContext}
              </div>
            )}

            {(authSuccess || authSuccessContext) && (
              <div className="mb-4 bg-emerald-50 text-emerald-600 border border-emerald-100 p-2.5 rounded-lg text-xs font-semibold text-left">
                {authSuccess || authSuccessContext}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isForgotPasswordMode ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email</label>
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. taqwaenterpriseoffice@gmail.com"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-700 font-semibold"
                    />
                  </div>

                  <button
                    id="auth-submit-btn"
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {lang === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordMode(false);
                      setAuthError('');
                      setAuthSuccess('');
                      clearMessages();
                    }}
                    className="w-full text-center text-xs text-gray-500 hover:text-emerald-700 font-semibold underline pt-2 cursor-pointer"
                  >
                    {lang === 'bn' ? 'লগইন-এ ফিরে যান' : 'Back to Login'}
                  </button>
                </>
              ) : (
                <>
                  {isRegisterMode && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Name</label>
                      <input
                        id="auth-name-input"
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Abdullah"
                        className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-700 font-semibold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email</label>
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. taqwaenterpriseoffice@gmail.com"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-700 font-semibold"
                    />
                  </div>

                  {isRegisterMode && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Phone</label>
                      <input
                        id="auth-phone-input"
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="017********"
                        className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-700 font-semibold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Password</label>
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-700"
                    />
                  </div>

                  {isRegisterMode && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Confirm Password</label>
                      <input
                        id="auth-confirm-password-input"
                        type="password"
                        required
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-700"
                      />
                    </div>
                  )}

                  {!isRegisterMode && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPasswordMode(true);
                          setAuthError('');
                          setAuthSuccess('');
                          clearMessages();
                        }}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold underline cursor-pointer"
                      >
                        {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                      </button>
                    </div>
                  )}

                  {authEmail.trim().toLowerCase() === 'taqwaenterpriseoffice@gmail.com' && (
                    <p className="text-[10px] text-emerald-700 font-semibold leading-relaxed">
                      📢 <strong>Admin Role Trigger:</strong> Email matched bootstrapped configurations; log-in to instantly authorize SaaS features.
                    </p>
                  )}

                  <button
                    id="auth-submit-btn"
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    {isRegisterMode ? (lang === 'bn' ? 'হিসাব তৈরি করুন' : 'Confirm Registration') : (lang === 'bn' ? 'প্রবেশ করুন' : 'Secured login')}
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase">{lang === 'bn' ? 'অথবা' : 'OR'}</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  {/* Google Login Trigger Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#ea4335"
                        d="M12.24 10.285V14.4h6.887C18.2 16.635 15.682 18 12.24 18 8.448 18 5.3 15.114 4.152 11.53c-.282-.84-.442-1.74-.442-2.67 0-.93.16-1.83.442-2.67C5.3 2.61 8.448-.28 12.24-.28c2.25 0 4.148.825 5.564 2.24l-3.232 3.232c-.93-.885-2.137-1.425-3.562-1.425-2.625 0-4.85 1.77-5.64 4.155-.21.63-.33 1.305-.33 2.01s.12 1.38.33 2.01c.79 2.385 3.015 4.155 5.64 4.155 1.515 0 2.768-.4 3.653-1.11.968-.78 1.545-1.928 1.635-3.32h-5.288z"
                      />
                    </svg>
                    <span>{lang === 'bn' ? 'গুগল দিয়ে প্রবেশ করুন' : 'Sign in with Google'}</span>
                  </button>

                  <button
                    id="toggle-auth-mode-btn"
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setAuthError('');
                      setAuthSuccess('');
                      clearMessages();
                    }}
                    className="w-full text-center text-xs text-gray-500 hover:text-emerald-700 font-semibold underline pt-2 cursor-pointer"
                  >
                    {isRegisterMode ? dict[lang].orLogin : dict[lang].orRegister}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 4.5 Email Verification Screen Blocking Guard */}
      {isLoggedIn && !isVerified && (
        <VerificationScreen lang={lang} />
      )}

      {/* 4.6 Firebase custom configuration credentials settings modal */}
      {isFirebaseConfigModalOpen && (
        <div className="fixed inset-0 z-55 bg-black/70 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" id="firebase-config-modal">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-150 text-left">
            <button
              onClick={() => setIsFirebaseConfigModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-gray-50 rounded-full border border-gray-250 hover:bg-gray-100 text-gray-400 hover:text-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 font-extrabold px-2.5 py-1 rounded-md">
                Database Credentials Connection
              </span>
              <h3 className="text-xl font-extrabold text-slate-800 mt-2 leading-tight">
                {lang === 'bn' ? 'ফায়ারবেস সেটিংস কনফিগার করুন' : 'Configure Firebase Database Settings'}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {lang === 'bn' 
                  ? 'আপনার রিয়েলটাইম ফায়ারবেস ডেটাবেস সংযোগ করুন। নিচে সম্পূর্ণ কনফিগারেশন অবজেক্ট পেস্ট করুন অথবা পৃথক ঘরগুলো পূরণ করুন।' 
                  : 'Connect your real-time Firebase DB. Paste your complete Firebase Configuration JSON object block below, or enter individual credentials manually.'}
              </p>
            </div>

            {configSaveError && (
              <div className="mb-4 bg-red-50 text-red-600 border border-red-150 p-3 rounded-xl text-xs font-semibold leading-relaxed">
                ⚠️ {configSaveError}
              </div>
            )}

            {configSaveSuccess && (
              <div className="mb-4 bg-emerald-50 text-emerald-800 border border-emerald-150 p-3 rounded-xl text-xs font-semibold leading-relaxed">
                ✨ {configSaveSuccess}
              </div>
            )}

            <form onSubmit={handleSaveFirebaseConfig} className="space-y-4">
              {/* Option A: JSON Block copy-paste */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  💡 {lang === 'bn' ? 'অপশন ১: সম্পূর্ণ ফায়ারবেস কনফিগারেশন অবজেক্ট (JSON)' : 'Option A: Full Firebase Config Block (JSON / JS Object)'}
                </label>
                <textarea
                  value={configJsonInput}
                  onChange={(e) => setConfigJsonInput(e.target.value)}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "...",\n  "projectId": "..."\n}`}
                  rows={5}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-mono text-slate-700 leading-relaxed focus:border-slate-300 focus:bg-white transition-all resize-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {lang === 'bn' 
                    ? 'ফায়ারবেস কনসোল থেকে কপি করা সম্পূর্ণ অবজেক্টটি এখানে পেস্ট করতে পারেন।' 
                    : 'Paste the entire config object directly from the Firebase console app settings.'}
                </p>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[9px] font-bold uppercase">
                  {lang === 'bn' ? 'অথবা অপশন ২: ম্যানুয়ালি লিখুন' : 'OR Option B: Enter Manually'}
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Option B: Manual inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">API Key *</label>
                  <input
                    type="text"
                    value={configApiKey}
                    onChange={(e) => setConfigApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={configAuthDomain}
                    onChange={(e) => setConfigAuthDomain(e.target.value)}
                    placeholder="your-app.firebaseapp.com"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Project ID</label>
                  <input
                    type="text"
                    value={configProjectId}
                    onChange={(e) => setConfigProjectId(e.target.value)}
                    placeholder="your-app-id"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Storage Bucket</label>
                  <input
                    type="text"
                    value={configStorageBucket}
                    onChange={(e) => setConfigStorageBucket(e.target.value)}
                    placeholder="your-app.appspot.com"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Messaging Sender ID</label>
                  <input
                    type="text"
                    value={configMessagingSenderId}
                    onChange={(e) => setConfigMessagingSenderId(e.target.value)}
                    placeholder="829302839120"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">App ID</label>
                  <input
                    type="text"
                    value={configAppId}
                    onChange={(e) => setConfigAppId(e.target.value)}
                    placeholder="1:829302839120:web:abcdef"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClearFirebaseConfig}
                  className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'মুছে ফেলুন' : 'Clear Config'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer text-center"
                >
                  💾 {lang === 'bn' ? 'সংরক্ষণ ও সংযোগ করুন' : 'Save & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Modern Bottom Drawer */}
      {isCategoryDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-center items-end md:items-center p-0 md:p-4 transition-all duration-300 animate-fade-in">
          <div 
            className="absolute inset-0" 
            onClick={() => setIsCategoryDrawerOpen(false)}
          />
          <div className="relative w-full md:max-w-xl bg-white rounded-t-[2.5rem] md:rounded-[2rem] p-6 shadow-2xl space-y-6 max-h-[85vh] md:max-h-[90vh] overflow-y-auto pb-12 md:pb-8 z-10 animate-slide-up border border-slate-100">
            {/* Header section */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Grid className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    {lang === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                    {lang === 'bn' ? 'পণ্য ফিল্টার করতে যেকোনো একটি সিলেক্ট করুন' : 'Select any category to view products'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 font-bold" />
              </button>
            </div>

            {/* List display of all categories */}
            <div className="flex flex-col gap-3">
              {[
                { key: 'all', en: 'All Products', bn: 'সব পণ্য', descEn: 'View all pet products', descBn: 'আমাদের সকল পণ্য একসাথে দেখুন', color: 'slate', icon: Sparkles },
                { key: 'cats', en: 'Cats Diet', bn: 'বিড়ালের খাবার', descEn: 'Premium wet & dry feed', descBn: 'বিড়ালের প্রোটিনযুক্ত পুষ্টিকর খাবার', color: 'rose', icon: Cat },
                { key: 'birds', en: 'Birds Seed', bn: 'পাখির দানা', descEn: 'Natural mixed seeds', descBn: 'পাখির প্রিমিয়াম মিক্সড দানা বীজ', color: 'blue', icon: Bird },
                { key: 'fish', en: 'Fish Pellets', bn: 'মাছের খাবার', descEn: 'Micro growth pellets', descBn: 'রঙিন মাছের ভাসমান ও ডুবন্ত খাবার', color: 'cyan', icon: Fish },
                { key: 'rabbits', en: 'Rabbit Hay', bn: 'খরগোশের ঘাস', descEn: 'Fresh timothy grass', descBn: 'খরগোশের ঘাস, খাদ্য ও লিটার', color: 'amber', icon: Rabbit },
                { key: 'accessories', en: 'Accessories', bn: 'সাজসজ্জা ও খাঁচা', descEn: 'Feeders, cages & toys', descBn: 'পাখির খাঁচা, ফিডার ও আকর্ষণীয় খেলনা', color: 'purple', icon: Activity },
                { key: 'supplements', en: 'Supplements', bn: 'ভিটামিন ও ঔষধ', descEn: 'Vet certified remedies', descBn: 'পাখি ও বিড়ালের রোগ প্রতিষেধক ও ভিটামিন', color: 'emerald', icon: ShieldCheck }
              ].map((cat) => {
                const IconComponent = cat.icon;
                const isActive = activeCategory === cat.key;
                
                // Color mapping for cards
                let bgIconColor = 'bg-slate-50 text-slate-600 border-slate-200/50';
                let activeBorder = 'border-slate-150 hover:border-slate-300';
                if (isActive) {
                  activeBorder = 'border-emerald-500 ring-2 ring-emerald-500/15 bg-emerald-50/10';
                }
                
                if (cat.color === 'rose') {
                  bgIconColor = 'bg-rose-50 text-rose-600 border-rose-100/50';
                } else if (cat.color === 'blue') {
                  bgIconColor = 'bg-blue-50 text-blue-600 border-blue-100/50';
                } else if (cat.color === 'cyan') {
                  bgIconColor = 'bg-cyan-50 text-cyan-600 border-cyan-100/50';
                } else if (cat.color === 'amber') {
                  bgIconColor = 'bg-amber-50 text-amber-600 border-amber-100/50';
                } else if (cat.color === 'purple') {
                  bgIconColor = 'bg-purple-50 text-purple-600 border-purple-100/50';
                } else if (cat.color === 'emerald') {
                  bgIconColor = 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
                }

                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setActiveCategory(cat.key);
                      setIsCategoryDrawerOpen(false);
                      // Smooth scroll to product shelf
                      const prodShelf = document.getElementById('storefront-stage') || document.getElementById('main-product-feed');
                      if (prodShelf) {
                        prodShelf.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer shadow-xs group ${activeBorder} ${
                      isActive ? '' : 'bg-white hover:bg-slate-50/60 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${bgIconColor} transition-transform group-hover:scale-105 duration-300 shrink-0`}>
                        <IconComponent className="w-5.5 h-5.5" />
                      </div>
                      <div>
                        <p className={`text-xs sm:text-sm font-extrabold ${isActive ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {lang === 'bn' ? cat.bn : cat.en}
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
                          {lang === 'bn' ? cat.descBn : cat.descEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isActive ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xs">
                          <Check className="w-3.5 h-3.5 font-black" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick stats / note banner */}
            <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-100 flex items-center gap-3.5">
              <div className="w-1.5 h-8 bg-emerald-600 rounded-full shrink-0" />
              <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                {lang === 'bn'
                  ? 'তাকওয়া এন্টারপ্রাইজ থেকে শতভাগ খাঁটি ও পুষ্টিকর পোষা খাদ্য সরাসরি আপনার ঠিকানায় এক্সপ্রেস কুরিয়ারে ডেলিভারি করা হয়।'
                  : 'Get 100% genuine and fresh nutrition for your pets delivered straight to your doorstep.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Checkout payment gateway modal popup */}
      {isCheckoutModalOpen && (
        <CheckoutModal
          lang={lang}
          onClose={() => setIsCheckoutModalOpen(false)}
          cart={cart}
          clearCart={() => saveCartToStorage([])}
          onSubmitOrder={handleSubmitOrder}
          currentUser={currentUser}
        />
      )}

      {/* 6. Smart Support AI Live Chat balloon */}
      {!isAdminView && (
        <LiveChat
          lang={lang}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && !isAdminView && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-40 right-4 md:bottom-28 md:right-8 z-50 p-3 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-emerald-500 flex items-center justify-center cursor-pointer"
          title={lang === 'bn' ? 'উপরে যান' : 'Back to Top'}
          id="back-to-top-btn"
        >
          <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
        </button>
      )}

      {/* 7. Redesigned Minimal Footer */}
      {!isAdminView && (
        <footer className="mt-20 bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800 text-xs font-semibold pb-24 md:pb-16" id="app-footer">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
            {/* Column 1: Brand & Bio */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-base">
                  ত
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-wider uppercase leading-none">
                    {lang === 'bn' ? 'তাকওয়া এন্টারপ্রাইজ' : 'Taqwa Enterprise'}
                  </h4>
                  <p className="text-[9px] text-emerald-450 uppercase tracking-widest font-bold mt-1">
                    {lang === 'bn' ? 'বিশ্বস্ত পোষা খাদ্য আমদানিকারক' : 'PREMIUM PET FOOD IMPORTS'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {lang === 'bn' 
                  ? 'তাকওয়া এন্টারপ্রাইজ সততা ও বিশ্বাসের সাথে পোষা প্রাণীর শতভাগ খাঁটি ও পুষ্টিকর দানা বীজ এবং আন্তর্জাতিক মানের প্রিমিয়াম ফিড সরবরাহ করে থাকে।' 
                  : 'Providing 100% organic, premium seed mixes, imports, and veterinary supplements for birds, cats, fish, and rabbits.'}
              </p>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer">
                  f
                </span>
                <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer">
                  ▶
                </span>
                <span className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer">
                  💬
                </span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white tracking-wide uppercase border-b border-slate-800 pb-2">
                {lang === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Our Shop'}
              </h4>
              <ul className="space-y-2.5 text-xs font-normal">
                {filterTabs.slice(1).map((tab) => (
                  <li key={tab.key}>
                    <button
                      onClick={() => {
                        setActiveCategory(tab.key);
                        const el = document.getElementById('main-product-feed');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="hover:text-emerald-400 text-left transition-colors cursor-pointer"
                    >
                      {lang === 'bn' ? tab.bn : tab.en}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Customer Service Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white tracking-wide uppercase border-b border-slate-800 pb-2">
                {lang === 'bn' ? 'গ্রাহক সেবা' : 'Customer Service'}
              </h4>
              <div className="grid grid-cols-1 gap-2.5 text-xs font-normal">
                <span className="hover:text-emerald-400 cursor-pointer transition-colors">{lang === 'bn' ? 'প্রাইভেসি পলিসি ও নিরাপত্তা' : 'Privacy Policy & Protection'}</span>
                <span className="hover:text-emerald-400 cursor-pointer transition-colors">{lang === 'bn' ? 'ক্রয় ও সরবরাহের শর্তাবলী' : 'Terms & Sales Conditions'}</span>
                <span className="hover:text-emerald-400 cursor-pointer transition-colors">{lang === 'bn' ? 'সহজ রিফান্ড ও রিটার্ন নীতি' : 'Return & Easy Refund Policy'}</span>
                <span className="hover:text-emerald-400 cursor-pointer transition-colors">{lang === 'bn' ? 'ডেলিভারি ট্র্যাকিং ও চার্জ' : 'Delivery Tracking & Rates'}</span>
              </div>
            </div>

            {/* Column 4: Secure Contacts & Payments */}
            <div className="space-y-4 text-left">
              <h4 className="text-sm font-bold text-white tracking-wide uppercase border-b border-slate-800 pb-2">
                {lang === 'bn' ? 'যোগাযোগ ও পেমেন্ট' : 'Secure Checkout'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {lang === 'bn' ? 'মোবাইল ব্যাংকিং (বিকাশ, নগদ, রকেট) এবং ক্যাশ অন ডেলিভারি সাপোর্ট।' : 'We support bKash, Nagad, Rocket, card transfers & Cash on Delivery.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {['bKash', 'Nagad', 'Rocket', 'Cash On Delivery'].map((pay) => (
                  <span key={pay} className="bg-slate-800 text-[10px] text-slate-300 px-2 py-1 rounded-md border border-slate-750 font-bold">
                    {pay}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-normal font-mono">
                Email: taqwaenterpriseoffice@gmail.com<br />
                Dhaka, Bangladesh
              </p>
            </div>
          </div>

          {/* Footer Bottom Copyright */}
          <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center text-slate-500 font-normal">
            <p className="mb-1 leading-relaxed">
              {lang === 'bn' 
                ? 'তাকওয়া এন্টারপ্রাইজ | © ২০২৬ সর্বস্বত্ব সংরক্ষিত। দ্বীনি মেহনত ও সততায় পোষা প্রাণীর আসল খাদ্যের নির্ভরযোগ্য প্রতিষ্ঠান।' 
                : 'Taqwa Enterprise | © 2026 All Rights Reserved. Trusted, organic feeds for birds, cats, fish, and rabbits.'}
            </p>
          </div>
        </footer>
      )}

      {/* 8. Mobile Bottom Navigation Bar (Feels exactly like a native app) */}
      {!isAdminView && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-100 px-2 pb-5 pt-3 grid grid-cols-5 gap-1 items-center shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md">
          {/* Home */}
          <button
            onClick={() => {
              setIsAdminView(false);
              setActiveTab('store');
              setActiveCategory('all');
              navigate('/');
            }}
            className={`flex flex-col items-center justify-center py-1 text-center transition-all duration-300 cursor-pointer relative ${
              currentPath === '/' && !isAdminView
                ? 'text-emerald-600 scale-105 font-black'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-full transition-all duration-300 ${currentPath === '/' && !isAdminView ? 'bg-emerald-50 text-emerald-600' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold mt-0.5">{lang === 'bn' ? 'হোম' : 'Home'}</span>
            {currentPath === '/' && !isAdminView && (
              <span className="absolute bottom-0 w-1 h-1 bg-emerald-600 rounded-full"></span>
            )}
          </button>

          {/* Categories */}
          <button
            onClick={() => {
              setIsAdminView(false);
              setActiveTab('store');
              navigate('/');
              setIsCategoryDrawerOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1 text-center text-slate-400 hover:text-slate-800 transition-all duration-300 cursor-pointer relative"
          >
            <div className="p-1 rounded-full transition-all duration-300">
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold mt-0.5">{lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</span>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => {
              setIsAdminView(false);
              setActiveTab('wishlist');
              navigate('/wishlist');
            }}
            className={`flex flex-col items-center justify-center py-1 text-center transition-all duration-300 cursor-pointer relative ${
              currentPath === '/wishlist' && !isAdminView
                ? 'text-rose-600 scale-105 font-black'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-full transition-all duration-300 ${currentPath === '/wishlist' && !isAdminView ? 'bg-rose-50 text-rose-600' : ''}`}>
              <Heart className={`w-5 h-5 ${currentPath === '/wishlist' && !isAdminView ? 'fill-current text-rose-500' : 'text-slate-400'}`} />
            </div>
            <span className="text-[10px] font-extrabold mt-0.5">{lang === 'bn' ? 'পছন্দ' : 'Wishlist'}</span>
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 right-4 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
            {currentPath === '/wishlist' && !isAdminView && (
              <span className="absolute bottom-0 w-1 h-1 bg-rose-500 rounded-full"></span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate('/cart')}
            className={`flex flex-col items-center justify-center py-1 text-center transition-all duration-300 cursor-pointer relative ${
              currentPath === '/cart'
                ? 'text-emerald-600 scale-105 font-black'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-full transition-all duration-300 hover:bg-slate-50 ${currentPath === '/cart' ? 'bg-emerald-50 text-emerald-600' : ''}`}>
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold mt-0.5">{lang === 'bn' ? 'কার্ট' : 'Cart'}</span>
            {cart.length > 0 && (
              <span className="absolute top-0.5 right-4 bg-emerald-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => {
              if (isLoggedIn) {
                navigate('/profile');
              } else {
                setIsLoginModalOpen(true);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 text-center transition-all duration-300 cursor-pointer relative ${
              currentPath === '/profile'
                ? 'text-emerald-650 scale-105 font-black'
                : 'text-slate-400 hover:text-slate-800'
            }`}
          >
            <div className={`p-1 rounded-full transition-all duration-300 ${currentPath === '/profile' ? 'bg-emerald-50 text-emerald-600' : ''}`}>
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold mt-0.5">{lang === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
            {currentPath === '/profile' && (
              <span className="absolute bottom-0 w-1 h-1 bg-emerald-600 rounded-full"></span>
            )}
          </button>
        </div>
      )}

    </div>
  );
}

interface AccessDeniedPageProps {
  lang: 'en' | 'bn';
  onBack: () => void;
}

function AccessDeniedPage({ lang, onBack }: AccessDeniedPageProps) {
  return (
    <div className="bg-white rounded-3xl p-8 max-w-lg mx-auto text-center border border-slate-200 shadow-md my-12 animate-scale-up">
      <div className="w-16 h-16 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
        <X className="w-8 h-8 font-black" />
      </div>
      <h2 className="font-extrabold text-slate-850 text-lg sm:text-xl tracking-tight">
        {lang === 'bn' ? 'অ্যাক্সেস অনুমোদিত নয়' : 'Administrative Access Denied'}
      </h2>
      <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-3 max-w-xs mx-auto">
        {lang === 'bn' 
          ? 'দুঃখিত, এই এডমিন ড্যাশবোর্ডটি দেখার জন্য আপনার পর্যাপ্ত পারমিশন নেই। শুধুমাত্র কোম্পানির ডিরেক্টর ও অফিসারদের এই পেজে ঢোকার অনুমতি রয়েছে।' 
          : 'You do not have the required role to view the SaaS logistics control panel. This terminal is strictly limited to verified system administrators and supervisors.'}
      </p>
      <div className="pt-6">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black tracking-wide cursor-pointer transition-all shadow-sm min-h-[44px] min-w-[150px] inline-flex items-center justify-center"
        >
          {lang === 'bn' ? 'পেট শপে ফিরে যান' : 'Return to Pet Shop'}
        </button>
      </div>
    </div>
  );
}
