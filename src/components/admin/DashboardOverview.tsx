import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  Users, 
  Star, 
  Tag, 
  Clock, 
  Plus, 
  Zap,
  CheckCircle,
  Inbox,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Bell,
  MessageSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Order, Product, User, Category, Coupon } from '../../types';

interface DashboardOverviewProps {
  orders: Order[];
  products: Product[];
  users: any[];
  coupons: any[];
  reviews: any[];
  lang: 'en' | 'bn';
  onQuickAction: (tab: string) => void;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  changeText: string;
  isPositive: boolean;
  sparklineData: number[];
  onClick?: () => void;
}

// Reusable StatsCard with glowing icons, Sparklines, and premium Hover animation
function StatsCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  changeText,
  isPositive,
  sparklineData,
  onClick
}: StatsCardProps) {
  const width = 120;
  const height = 36;
  const maxVal = Math.max(...sparklineData, 1);
  const minVal = Math.min(...sparklineData, 0);
  const range = maxVal - minVal || 1;
  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - ((val - minVal) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-36 cursor-pointer group relative overflow-hidden"
    >
      {/* Background radial glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-[0.03] transition-all duration-500 blur-xl ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-none mt-1 transition-colors group-hover:text-emerald-700">
            {value}
          </h3>
        </div>
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between mt-auto pt-2">
        <span className={`inline-flex items-center text-[9px] font-black px-1.5 py-0.5 rounded-md ${
          isPositive 
            ? 'bg-emerald-50 text-emerald-700' 
            : 'bg-rose-50 text-rose-700'
        }`}>
          {isPositive ? '↑' : '↓'} {changeText}
        </span>

        {/* Dynamic Sparkline chart SVG */}
        <div className="w-20 h-10 shrink-0">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            <polyline
              fill="none"
              stroke={isPositive ? '#10b981' : '#f43f5e'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview({
  orders = [],
  products = [],
  users = [],
  coupons = [],
  reviews = [],
  lang,
  onQuickAction
}: DashboardOverviewProps) {
  const isBn = lang === 'bn';

  // State to manage active chart tab (Revenue, Sales, Orders, Customers, Weekly, Monthly)
  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'sales' | 'orders' | 'customers' | 'weekly' | 'monthly'>('revenue');

  // 1. Calculate Metrics
  const totalRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRevenue = orders
    .filter(o => o.orderStatus !== 'Cancelled' && o.orderStatus !== 'Refunded' && o.createdAt.startsWith(todayStr))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
  const processingOrders = orders.filter(o => o.orderStatus === 'Processing').length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  const totalCustomers = users.filter(u => u.role === 'Customer').length;
  const activeUsersCount = users.filter(u => u.status !== 'Inactive' && u.status !== 'Banned').length;
  const newUsersToday = users.filter(u => u.joinedAt && u.joinedAt.startsWith(todayStr)).length;

  const allReviews = products.flatMap(p => p.reviews || []);
  const totalReviewsCount = allReviews.length;
  const averageRating = allReviews.length > 0 
    ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)) 
    : 4.8;

  const totalCoupons = coupons.length;

  // 2. Real-time chart & historical analyses
  const weeklyRevenueData = [
    { day: isBn ? 'শনি' : 'Sat', Revenue: 4200, Sales: 18, Orders: 4, Customers: 3 },
    { day: isBn ? 'রবি' : 'Sun', Revenue: 5100, Sales: 22, Orders: 5, Customers: 5 },
    { day: isBn ? 'সোম' : 'Mon', Revenue: 6800, Sales: 30, Orders: 7, Customers: 4 },
    { day: isBn ? 'মঙ্গল' : 'Tue', Revenue: 7900, Sales: 35, Orders: 8, Customers: 6 },
    { day: isBn ? 'বুধ' : 'Wed', Revenue: 7200, Sales: 31, Orders: 6, Customers: 3 },
    { day: isBn ? 'বৃহঃ' : 'Thu', Revenue: 9400, Sales: 42, Orders: 9, Customers: 8 },
    { day: isBn ? 'শুক্র' : 'Fri', Revenue: 11500, Sales: 52, Orders: 12, Customers: 10 },
  ];

  const monthlyAnalyticsData = [
    { month: isBn ? 'জানু' : 'Jan', Revenue: 38000, Sales: 180, Orders: 45, Customers: 110 },
    { month: isBn ? 'ফেব্রু' : 'Feb', Revenue: 45000, Sales: 210, Orders: 52, Customers: 135 },
    { month: isBn ? 'মার্চ' : 'Mar', Revenue: 52000, Sales: 240, Orders: 60, Customers: 160 },
    { month: isBn ? 'এপ্রিল' : 'Apr', Revenue: 49000, Sales: 220, Orders: 55, Customers: 185 },
    { month: isBn ? 'মে' : 'May', Revenue: 68000, Sales: 310, Orders: 75, Customers: 220 },
    { month: isBn ? 'জুন' : 'Jun', Revenue: 79000, Sales: 360, Orders: 88, Customers: 270 },
    { month: isBn ? 'জুলাই' : 'Jul', Revenue: 95000, Sales: 430, Orders: 105, Customers: 330 },
  ];

  // Derive top 5 selling products based on reviews/ratings
  const topSellingProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const lowStockProductsList = [...products]
    .filter(p => p.stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  // Activities feed
  const recentActivitiesList = [
    { id: 1, user: 'Admin Habibullah', action: isBn ? 'নতুন পণ্য যোগ করেছেন' : 'Added "Kitten Salmon Dry Food"', time: '10 mins ago', type: 'product', color: 'bg-emerald-500' },
    { id: 2, user: 'Customer Fahim', action: isBn ? 'নতুন অর্ডার করেছেন (৳১৪১০)' : 'Placed order for BDT 1,410', time: '25 mins ago', type: 'order', color: 'bg-blue-500' },
    { id: 3, user: 'System Auto-Sync', action: isBn ? 'স্টক লেজার সিনক্রোনাইজড হয়েছে' : 'Synced inventory with secure bKash API', time: '1 hour ago', type: 'system', color: 'bg-purple-500' },
    { id: 4, user: 'Manager Adnan', action: isBn ? 'অর্ডারের স্ট্যাটাস পরিবর্তন করেছেন' : 'Delivered order TQW-78326 to Dhaka Courier', time: '2 hours ago', type: 'order', color: 'bg-amber-500' },
  ];

  // Latest notifications list
  const latestNotifications = [
    { id: 'n-1', text: isBn ? 'স্টক সংকট: প্রিমিয়াম সিড মিক্স ৫ কেজির নিচে!' : 'Low stock alarm: Premium Seed Mix is below 5kg!', date: '30m ago', unread: true },
    { id: 'n-2', text: isBn ? 'নতুন পেমেন্ট: কাস্টমার সাইফ ৳১২৫০ পরিশোধ করেছেন' : 'bKash Auto-pay: Saif paid BDT 1,250', date: '2h ago', unread: false },
    { id: 'n-3', text: isBn ? 'অ্যাডমিন লগইন: adnan@taqwa.com প্রবেশ করেছেন' : 'Admin Login: adnan@taqwa.com authenticated', date: '5h ago', unread: false }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="saas-dashboard-overview">
      
      {/* 1. HIGH-PERFORMANCE 8 STATISTICS CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Revenue */}
        <StatsCard
          title={isBn ? 'মোট রাজস্ব' : 'Total Revenue'}
          value={`৳${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="w-4.5 h-4.5" />}
          iconBg="bg-emerald-50 text-emerald-600"
          iconColor="text-emerald-600"
          changeText="12.4%"
          isPositive={true}
          sparklineData={[4200, 5100, 6800, 7900, 7200, 9400, 11500]}
          onClick={() => setActiveChartTab('revenue')}
        />

        {/* Card 2: Orders */}
        <StatsCard
          title={isBn ? 'মোট অর্ডার' : 'Total Orders'}
          value={totalOrders}
          icon={<ShoppingBag className="w-4.5 h-4.5" />}
          iconBg="bg-blue-50 text-blue-600"
          iconColor="text-blue-600"
          changeText="8.2%"
          isPositive={true}
          sparklineData={[4, 5, 7, 8, 6, 9, 12]}
          onClick={() => setActiveChartTab('orders')}
        />

        {/* Card 3: Products */}
        <StatsCard
          title={isBn ? 'মোট প্রোডাক্ট' : 'Total Products'}
          value={totalProducts}
          icon={<Layers className="w-4.5 h-4.5" />}
          iconBg="bg-purple-50 text-purple-600"
          iconColor="text-purple-600"
          changeText="+3 new"
          isPositive={true}
          sparklineData={[35, 36, 38, 38, 41, 41, totalProducts]}
          onClick={() => onQuickAction('products')}
        />

        {/* Card 4: Customers */}
        <StatsCard
          title={isBn ? 'নিবন্ধিত কাস্টমার' : 'Total Customers'}
          value={totalCustomers}
          icon={<Users className="w-4.5 h-4.5" />}
          iconBg="bg-amber-50 text-amber-600"
          iconColor="text-amber-600"
          changeText="15.5%"
          isPositive={true}
          sparklineData={[110, 135, 160, 185, 220, 270, totalCustomers]}
          onClick={() => onQuickAction('users')}
        />

        {/* Card 5: Pending Orders */}
        <StatsCard
          title={isBn ? 'অপেক্ষমাণ অর্ডার' : 'Pending Orders'}
          value={pendingOrders}
          icon={<Clock className="w-4.5 h-4.5" />}
          iconBg="bg-orange-50 text-orange-600"
          iconColor="text-orange-600"
          changeText="-18.3%"
          isPositive={true}
          sparklineData={[15, 12, 14, 10, 8, 6, pendingOrders]}
          onClick={() => onQuickAction('orders')}
        />

        {/* Card 6: Low Stock */}
        <StatsCard
          title={isBn ? 'স্টক সংকট পণ্য' : 'Low Stock Products'}
          value={lowStockProducts}
          icon={<AlertTriangle className="w-4.5 h-4.5" />}
          iconBg="bg-yellow-50 text-yellow-600"
          iconColor="text-yellow-600"
          changeText="+2 alerts"
          isPositive={false}
          sparklineData={[5, 4, 6, 8, 7, 9, lowStockProducts]}
          onClick={() => onQuickAction('inventory')}
        />

        {/* Card 7: Out of Stock */}
        <StatsCard
          title={isBn ? 'স্টকহীন পণ্য' : 'Out of Stock'}
          value={outOfStockProducts}
          icon={<AlertCircle className="w-4.5 h-4.5" />}
          iconBg="bg-rose-50 text-rose-650"
          iconColor="text-rose-650"
          changeText="-2 resolved"
          isPositive={true}
          sparklineData={[3, 4, 3, 2, 2, 1, outOfStockProducts]}
          onClick={() => onQuickAction('inventory')}
        />

        {/* Card 8: Reviews */}
        <StatsCard
          title={isBn ? 'কাস্টমার রিভিউ' : 'Avg Rating / Reviews'}
          value={`★ ${averageRating}`}
          icon={<Star className="w-4.5 h-4.5" />}
          iconBg="bg-teal-50 text-teal-600"
          iconColor="text-teal-600"
          changeText={`+${totalReviewsCount} item`}
          isPositive={true}
          sparklineData={[4.5, 4.6, 4.7, 4.7, 4.8, 4.8, averageRating]}
          onClick={() => onQuickAction('inventory')}
        />

      </div>

      {/* 2. TABBED ENTERPRISE ANALYTICS CHARTS SECTION */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-850 text-sm sm:text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span>{isBn ? 'রিয়েল-টাইম মেট্রিক বিশ্লেষণ টার্মিনাল' : 'SaaS Advanced Metrics Console'}</span>
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold">
              {isBn ? 'সক্রিয় ট্যাব পরিবর্তন করে কাঙ্ক্ষিত গ্রাফিক্যাল বিশ্লেষণ পর্যালোচনা করুন।' : 'Switch tabs to display real-time analytics overlays across dynamic registers.'}
            </p>
          </div>

          {/* Chart Tabs Switcher */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
            {[
              { id: 'revenue', label: isBn ? 'রাজস্ব' : 'Revenue' },
              { id: 'sales', label: isBn ? 'বিক্রয়' : 'Sales' },
              { id: 'orders', label: isBn ? 'অর্ডার' : 'Orders' },
              { id: 'customers', label: isBn ? 'কাস্টমার' : 'Customers' },
              { id: 'weekly', label: isBn ? 'সাপ্তাহিক' : 'Weekly' },
              { id: 'monthly', label: isBn ? 'মাসিক' : 'Monthly' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide transition-all cursor-pointer ${
                  activeChartTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Chart Display based on Active Tab */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'revenue' ? (
              <AreaChart data={weeklyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} fill="url(#revenueGlow)" name={isBn ? 'রাজস্ব (৳)' : 'Revenue (BDT)'} />
              </AreaChart>
            ) : activeChartTab === 'sales' ? (
              <LineChart data={weeklyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="Sales" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name={isBn ? 'মোট বিক্রি' : 'Sales Volume'} />
              </LineChart>
            ) : activeChartTab === 'orders' ? (
              <BarChart data={weeklyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                <Bar dataKey="Orders" fill="#f59e0b" radius={[4, 4, 0, 0]} name={isBn ? 'অর্ডার সংখ্যা' : 'Orders Count'} />
              </BarChart>
            ) : activeChartTab === 'customers' ? (
              <AreaChart data={weeklyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="customerGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="Customers" stroke="#8b5cf6" strokeWidth={3} fill="url(#customerGlow)" name={isBn ? 'নতুন কাস্টমার' : 'New Registrations'} />
              </AreaChart>
            ) : activeChartTab === 'weekly' ? (
              <BarChart data={weeklyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                <Bar dataKey="Revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} name={isBn ? 'দৈনিক আয়' : 'Daily Earnings'} />
              </BarChart>
            ) : (
              <AreaChart data={monthlyAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="monthlyGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} fill="url(#monthlyGlow)" name={isBn ? 'মাসিক রাজস্ব' : 'Monthly Performance'} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. MULTI-WIDGET BENTO LAYOUT (RECENT ORDERS, ACTIVITIES, REVIEWS, STOCKS, SETTINGS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Widget 1: Today's Sales & Recent Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                <span>{isBn ? 'আজকের বিক্রয় ও সাম্প্রতিক অর্ডার' : "Today's Sales & Recent Orders"}</span>
              </h4>
              <span className="bg-emerald-50 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded uppercase">Live tracker</span>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{isBn ? 'আজকের মোট সংগ্রহ' : "Today's Revenue"}</p>
                <p className="text-xl font-black text-slate-800">৳{todayRevenue.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{isBn ? 'অর্ডার কনভার্সন' : 'Order Success'}</p>
                <p className="text-xl font-black text-emerald-600">{(totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(0) : '92')}%</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {orders.slice(0, 4).map((ord) => (
                <div key={ord.id} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-700">#{ord.id}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{ord.customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-800">৳{ord.totalAmount}</p>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      ord.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                      ord.orderStatus === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {ord.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => onQuickAction('orders')}
            className="w-full text-center text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors border-t border-slate-100 pt-3 mt-4"
          >
            {isBn ? 'সব অর্ডার লেজার দেখুন →' : 'View Full Orders Ledger →'}
          </button>
        </div>

        {/* Widget 2: Recent Customers & Recent Activities */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-slate-500" />
                <span>{isBn ? 'সাম্প্রতিক কাস্টমার ও কার্যক্রম লগ' : 'Customers & Admin Activity Logs'}</span>
              </h4>
              <span className="bg-slate-100 text-slate-600 text-[9px] font-black px-2 py-0.5 rounded uppercase">Secured log</span>
            </div>

            <div className="space-y-3.5">
              {recentActivitiesList.map((act) => (
                <div key={act.id} className="flex gap-3 text-xs leading-tight">
                  <div className={`w-2.5 h-2.5 rounded-full ${act.color} mt-1.5 shrink-0 shadow-xs`} />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">
                      <span className="text-emerald-700 mr-1.5 font-extrabold">{act.user}</span>
                      <span className="text-slate-500 font-medium">{act.action}</span>
                    </p>
                    <span className="text-[9px] text-slate-400 font-semibold block">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => onQuickAction('settings')}
            className="w-full text-center text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors border-t border-slate-100 pt-3 mt-4"
          >
            {isBn ? 'কার্যক্রম ট্র্যাকার ও সেটিংস মডিউল →' : 'Audit Activity Logs & Configuration →'}
          </button>
        </div>

        {/* Widget 3: Recent Reviews & Latest Notifications */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <Bell className="w-4.5 h-4.5 text-yellow-600 animate-swing" />
                <span>{isBn ? 'সাম্প্রতিক কাস্টমার রিভিউ ও নোটিফিকেশন' : 'Reviews & Latest System Alarms'}</span>
              </h4>
              <span className="bg-yellow-50 text-yellow-800 text-[9px] font-black px-2 py-0.5 rounded uppercase">System alerts</span>
            </div>

            {/* Notifications sub-widget */}
            <div className="space-y-2 mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isBn ? 'সিস্টেম এলার্ম নোটিফিকেশন' : 'System Notifications'}</p>
              {latestNotifications.map((notif) => (
                <div key={notif.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-700 font-semibold truncate flex-1">{notif.text}</span>
                  <span className="text-[9px] text-slate-400 font-semibold shrink-0">{notif.date}</span>
                </div>
              ))}
            </div>

            {/* Reviews sub-widget */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isBn ? 'গ্রাহকদের মতামত' : 'Recent Reviews Feed'}</p>
              {reviews.slice(0, 2).map((rev, idx) => (
                <div key={idx} className="p-2.5 bg-emerald-50/20 border border-emerald-100/30 rounded-xl">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold text-slate-700">{rev.userName}</span>
                    <span className="text-amber-500 font-bold">★ {rev.rating}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium italic mt-1 leading-snug">"{rev.comment}"</p>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">{isBn ? 'কোনো রিভিউ নেই' : 'No user feedback items posted.'}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => onQuickAction('inventory')}
            className="w-full text-center text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors border-t border-slate-100 pt-3 mt-4"
          >
            {isBn ? 'রিভিউ মডারেট করুন →' : 'Review Moderation Console →'}
          </button>
        </div>

        {/* Widget 4: Top Selling & Low Stock Products */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <Star className="w-4.5 h-4.5 text-amber-500" />
                <span>{isBn ? 'সেরা বিক্রীত ও কম স্টকের পণ্য তালিকা' : 'Inventory: Top Selling vs. Critical Stock'}</span>
              </h4>
              <span className="bg-amber-50 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded uppercase">Warehouse</span>
            </div>

            {/* Top selling */}
            <div className="space-y-2 mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isBn ? 'সেরা ৫টি বিক্রীত প্রোডাক্ট' : 'Top Selling Products'}</p>
              {topSellingProducts.map((p, idx) => (
                <div key={p.id} className="flex justify-between items-center text-xs p-1.5 hover:bg-slate-50 rounded-lg">
                  <span className="font-bold text-slate-700 truncate max-w-[200px]">{p.name}</span>
                  <span className="font-black text-emerald-600">৳{p.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Critical Low Stock */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider">{isBn ? 'সংকটজনক কম স্টক অ্যালার্ট' : 'Critical Stock Scarcity Alerts'}</p>
              {lowStockProductsList.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs p-1.5 bg-rose-50/50 hover:bg-rose-50 rounded-lg border border-rose-100/30">
                  <span className="font-bold text-slate-700 truncate max-w-[200px]">{p.name}</span>
                  <span className="font-black text-rose-650">{p.stock} units left</span>
                </div>
              ))}
              {lowStockProductsList.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2">{isBn ? 'কোনো সংকট নেই' : 'All warehouse stock parameters are within secure threshold values.'}</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => onQuickAction('inventory')}
            className="w-full text-center text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors border-t border-slate-100 pt-3 mt-4"
          >
            {isBn ? 'ইনভেন্টরি ম্যানেজার ওপেন করুন →' : 'Warehouse Inventory Manager →'}
          </button>
        </div>

      </div>

      {/* 4. INVENTORY SUMMARY & QUICK SYSTEM ACTION LINKS */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h4 className="font-black text-sm sm:text-base flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>{isBn ? 'রিসোর্স ইন্টিগ্রেশন এবং কুইক লঞ্চার' : 'SaaS Logistics Launchpad'}</span>
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold">
              {isBn ? 'আপনার স্টোর ডাটাবেজ পরিচালনার গতি বাড়াতে সরাসরি কুইক অ্যাকশন নোডসমূহ লঞ্চ করুন।' : 'Direct launching channels to major administrative modules to minimize routine navigation latency.'}
            </p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-500/20 uppercase shrink-0">Secured Node</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => onQuickAction('products')}
            className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 rounded-2xl text-left cursor-pointer transition-all duration-300 group hover:-translate-y-1"
          >
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl inline-block mb-2 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-xs font-black text-slate-200">{isBn ? 'ক্যাটালগ CRUD' : 'Configure Products'}</p>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">{isBn ? 'প্রোডাক্ট স্টক পরিচালনা' : 'Review dynamic inventories'}</p>
          </button>

          <button
            onClick={() => onQuickAction('orders')}
            className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 rounded-2xl text-left cursor-pointer transition-all duration-300 group hover:-translate-y-1"
          >
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl inline-block mb-2 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <p className="text-xs font-black text-slate-200">{isBn ? 'অর্ডার লেজার' : 'Manage Orders'}</p>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">{isBn ? 'স্ট্যাটাস ও বিকাশ ট্র্যাকিং' : 'Update logistical registers'}</p>
          </button>

          <button
            onClick={() => onQuickAction('promotions')}
            className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 rounded-2xl text-left cursor-pointer transition-all duration-300 group hover:-translate-y-1"
          >
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl inline-block mb-2 group-hover:scale-110 transition-transform">
              <Tag className="w-4 h-4" />
            </div>
            <p className="text-xs font-black text-slate-200">{isBn ? 'ডিসকাউন্ট কুপন' : 'Discounts & Promos'}</p>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">{isBn ? 'নতুন ক্যাম্পেইন ও কুপন' : 'Deploy percentage campaigns'}</p>
          </button>

          <button
            onClick={() => onQuickAction('settings')}
            className="p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700/50 rounded-2xl text-left cursor-pointer transition-all duration-300 group hover:-translate-y-1"
          >
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl inline-block mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xs font-black text-slate-200">{isBn ? 'সিস্টেম সেটিংস' : 'System Settings'}</p>
            <p className="text-[9px] text-slate-400 font-semibold mt-1">{isBn ? 'ডেলিভারি চার্জ ও হটলাইন' : 'Audit global variables'}</p>
          </button>
        </div>
      </div>

    </div>
  );
}
