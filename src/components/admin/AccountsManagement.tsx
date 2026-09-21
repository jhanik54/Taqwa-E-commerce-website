import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  Building, 
  Receipt, 
  Plus, 
  Search, 
  Calendar, 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X,
  PieChart,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { Expense, Supplier, AccountTransaction, Order, DamageWaste } from '../../types';

interface AccountsManagementProps {
  expenses: Expense[];
  suppliers: Supplier[];
  transactions: AccountTransaction[];
  orders: Order[];
  damages?: DamageWaste[];
  onAddExpense: (payload: any) => Promise<void>;
  onDeleteExpense?: (id: string) => Promise<void>;
  onPaySupplier: (supplierId: string, amount: number, paymentMethod: string, notes?: string) => Promise<void>;
  onAddTransaction: (payload: any) => Promise<void>;
  onDeleteTransaction?: (id: string) => Promise<void>;
  currentUserEmail?: string;
  lang: 'en' | 'bn';
}

export default function AccountsManagement({
  expenses = [],
  suppliers = [],
  transactions = [],
  orders = [],
  damages = [],
  onAddExpense,
  onDeleteExpense,
  onPaySupplier,
  onAddTransaction,
  onDeleteTransaction,
  currentUserEmail = '',
  lang
}: AccountsManagementProps) {
  const isBn = lang === 'bn';

  // Sub-tabs: 'overview' | 'expenses' | 'suppliers' | 'transactions' | 'customer_dues' | 'statement_print'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'expenses' | 'suppliers' | 'transactions' | 'customer_dues' | 'statement_print'>('overview');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'this_month' | 'this_year'>('all');

  // Add Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expTitleBn, setExpTitleBn] = useState('');
  const [expCategory, setExpCategory] = useState<string>('Rent');
  const [expAmount, setExpAmount] = useState<number>(1000);
  const [expMethod, setExpMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank'>('Cash');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expRef, setExpRef] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // Pay Supplier Modal
  const [showPaySupplierModal, setShowPaySupplierModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierPayAmount, setSupplierPayAmount] = useState<number>(5000);
  const [supplierPayMethod, setSupplierPayMethod] = useState<'Cash' | 'bKash' | 'Bank' | 'Nagad'>('Bank');
  const [supplierPayNotes, setSupplierPayNotes] = useState('');

  // Add Transaction Modal
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
  const [txCategory, setTxCategory] = useState('Offline Counter Sale');
  const [txAmount, setTxAmount] = useState<number>(1500);
  const [txMethod, setTxMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank'>('Cash');
  const [txDescription, setTxDescription] = useState('');

  // Financial Calculations
  const deliveredOrders = useMemo(() => {
    return orders.filter(o => o.orderStatus === 'Delivered');
  }, [orders]);

  const totalOrderRevenue = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [deliveredOrders]);

  const manualSales = useMemo(() => {
    return transactions
      .filter(t => t.type === 'Income' && t.category === 'Offline Counter Sale')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const totalGrossRevenue = totalOrderRevenue + manualSales;

  // Estimated COGS (~70% of gross revenue)
  const estimatedCOGS = Math.round(totalGrossRevenue * 0.70);
  const grossProfit = totalGrossRevenue - estimatedCOGS;

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const netProfit = grossProfit - totalExpenses;

  const totalSupplierDue = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (Number(s.dueBalance) || 0), 0);
  }, [suppliers]);

  const pendingCodReceivables = useMemo(() => {
    return orders
      .filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  // Payment Inflows breakdown
  const paymentMethodsSummary = useMemo(() => {
    const methods: { [key: string]: number } = {
      'Cash in Hand': 0,
      'bKash Merchant': 0,
      'Nagad Personal': 0,
      'Rocket': 0,
      'Bank Account': 0
    };

    deliveredOrders.forEach(o => {
      const m = o.paymentMethod || 'Cash';
      const amt = Number(o.totalAmount) || 0;
      if (m.toLowerCase().includes('bkash')) methods['bKash Merchant'] += amt;
      else if (m.toLowerCase().includes('nagad')) methods['Nagad Personal'] += amt;
      else if (m.toLowerCase().includes('rocket')) methods['Rocket'] += amt;
      else if (m.toLowerCase().includes('bank')) methods['Bank Account'] += amt;
      else methods['Cash in Hand'] += amt;
    });

    // Add manual counter sales to Cash in Hand
    methods['Cash in Hand'] += manualSales;

    return methods;
  }, [deliveredOrders, manualSales]);

  // Handle Add Expense
  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || expAmount <= 0) return;

    await onAddExpense({
      title: expTitle,
      titleBn: expTitleBn || expTitle,
      category: expCategory,
      amount: Number(expAmount),
      paymentMethod: expMethod,
      date: new Date(expDate).toISOString(),
      referenceNo: expRef,
      notes: expNotes
    });

    setShowExpenseModal(false);
    setExpTitle('');
    setExpTitleBn('');
    setExpNotes('');
    setExpRef('');
  };

  // Handle Supplier Payment
  const handleSupplierPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || supplierPayAmount <= 0) return;

    await onPaySupplier(selectedSupplierId, Number(supplierPayAmount), supplierPayMethod, supplierPayNotes);
    setShowPaySupplierModal(false);
    setSupplierPayNotes('');
  };

  // Handle Add Transaction
  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0) return;

    await onAddTransaction({
      type: txType,
      category: txCategory,
      amount: Number(txAmount),
      method: txMethod,
      description: txDescription || `${txType} Transaction`
    });

    setShowTxModal(false);
    setTxDescription('');
  };

  return (
    <div className="space-y-6 animate-fade-in" id="accounts-management-root">
      
      {/* 1. FINANCIAL DASHBOARD KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
        
        {/* Gross Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {isBn ? 'মোট বিক্রয় আয় (Revenue)' : 'Total Revenue'}
          </p>
          <h3 className="text-lg font-black text-slate-800 mt-1">৳{totalGrossRevenue.toLocaleString()}</h3>
          <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>{deliveredOrders.length} {isBn ? 'টি ডেলিভারড অর্ডার' : 'orders delivered'}</span>
          </span>
        </div>

        {/* Cost of Goods Sold */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {isBn ? 'পণ্য ক্রয় ব্যয় (COGS)' : 'Cost of Goods (COGS)'}
          </p>
          <h3 className="text-lg font-black text-slate-700 mt-1">৳{estimatedCOGS.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-400 font-bold mt-0.5 block">
            ~70% of retail sales
          </span>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {isBn ? 'পরিচালন ব্যয় (Expenses)' : 'Operating Expenses'}
          </p>
          <h3 className="text-lg font-black text-rose-700 mt-1">৳{totalExpenses.toLocaleString()}</h3>
          <span className="text-[10px] text-rose-600 font-extrabold flex items-center gap-0.5 mt-0.5">
            <TrendingDown className="w-3 h-3" />
            <span>{expenses.length} {isBn ? 'টি ব্যয় এন্ট্রি' : 'expense entries'}</span>
          </span>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
            {isBn ? 'নিট লাভ (Net Profit)' : 'Net Profit'}
          </p>
          <h3 className={`text-lg font-black mt-1 ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            ৳{netProfit.toLocaleString()}
          </h3>
          <span className="text-[10px] text-emerald-700 font-black mt-0.5 block">
            {totalGrossRevenue > 0 ? `${Math.round((netProfit / totalGrossRevenue) * 100)}% Net Margin` : '0% Margin'}
          </span>
        </div>

        {/* Supplier Due */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50/20 shadow-xs">
          <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
            {isBn ? 'মহাজন বাকি (Payable)' : 'Supplier Due'}
          </p>
          <h3 className="text-lg font-black text-amber-900 mt-1">৳{totalSupplierDue.toLocaleString()}</h3>
          <span className="text-[10px] text-amber-700 font-extrabold mt-0.5 block">
            {suppliers.length} {isBn ? 'জন ভেন্ডর' : 'active vendors'}
          </span>
        </div>

        {/* Pending COD */}
        <div className="bg-white rounded-2xl p-4 border border-blue-200 bg-blue-50/20 shadow-xs">
          <p className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">
            {isBn ? 'কুরিয়ারে বাকি (COD Due)' : 'Pending COD Due'}
          </p>
          <h3 className="text-lg font-black text-blue-900 mt-1">৳{pendingCodReceivables.toLocaleString()}</h3>
          <span className="text-[10px] text-blue-700 font-extrabold mt-0.5 block">
            {orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length} {isBn ? 'পার্সেল পথে রয়েছে' : 'parcels in transit'}
          </span>
        </div>

      </div>

      {/* 2. SUB-TABS NAVIGATION & ACTION BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'overview', label: isBn ? 'আর্থিক চিত্র ও লাভ-ক্ষতি' : 'P&L Overview', icon: PieChart },
            { id: 'expenses', label: isBn ? 'ব্যয় ও খরচের খাতা' : 'Expense Tracker', icon: Receipt },
            { id: 'suppliers', label: isBn ? 'সরবরাহকারী বাকি খাতা' : 'Suppliers Ledger', icon: Building },
            { id: 'transactions', label: isBn ? 'ক্যাশ ও ব্যাংক খাতা' : 'Cashbook & Bank', icon: Wallet },
            { id: 'customer_dues', label: isBn ? 'কাস্টমার ও COD পাওনা' : 'Receivables & COD', icon: Users },
            { id: 'statement_print', label: isBn ? 'আর্থিক স্টেটমেন্ট প্রিন্ট' : 'Income Statement', icon: Printer },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  active 
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/20' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTxModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBn ? 'কাউন্টার সেল / ইনকাম' : '+ Record Income'}</span>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-emerald-950/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isBn ? 'নতুন খরচ যোগ করুন' : '+ Record Expense'}</span>
          </button>
        </div>

      </div>

      {/* 3. SUB-TAB VIEWS */}

      {/* =========================================================================
          VIEW 1: FINANCIAL P&L & CASH INFLOW OVERVIEW
         ========================================================================= */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Comprehensive Profit & Loss Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-800">
                  {isBn ? 'আর্থিক বিবরণী ও লাভ-ক্ষতি হিসাব (P&L)' : 'Income Statement & Profit / Loss Statement'}
                </h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  {isBn ? 'বিক্রয় আয়, ক্র‍য় ব্যয় এবং পরিচালন খরচের সমন্বিত হিসাব' : 'Consolidated financial balance sheet summary from verified orders and ledgers'}
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                LIVE SYNCED
              </span>
            </div>

            {/* Structured P&L Table */}
            <div className="space-y-3 text-xs">
              
              {/* Gross Revenue section */}
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 border border-slate-200/60">
                <div className="flex justify-between font-extrabold text-slate-800">
                  <span>1. {isBn ? 'মোট বিক্রয় আয় (Gross Sales Revenue)' : 'Gross Sales Revenue'}</span>
                  <span className="text-emerald-700">৳{totalGrossRevenue.toLocaleString()}</span>
                </div>
                <div className="pl-4 space-y-1 text-[11px] text-slate-500 font-semibold">
                  <div className="flex justify-between">
                    <span>• {isBn ? 'ডেলিভারড অনলাইন অর্ডার থেকে আয়' : 'Delivered Online Orders'}</span>
                    <span>৳{totalOrderRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• {isBn ? 'কাউন্টার ও সরাসরি অফলাইন বিক্রয়' : 'Offline Direct Counter Sales'}</span>
                    <span>৳{manualSales.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* COGS section */}
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 border border-slate-200/60">
                <div className="flex justify-between font-extrabold text-slate-800">
                  <span>2. {isBn ? 'পণ্য ক্রয় ও আমদানি খরচ (Cost of Goods Sold - COGS)' : 'Cost of Goods Sold (COGS)'}</span>
                  <span className="text-rose-700">-৳{estimatedCOGS.toLocaleString()}</span>
                </div>
                <div className="pl-4 text-[11px] text-slate-500 font-semibold">
                  <p>• {isBn ? 'গড় পণ্য উৎপাদন ও পাইকারি ক্রয় ব্যয়' : 'Direct wholesale procurement expenditure for delivered items'}</p>
                </div>
              </div>

              {/* Gross Profit highlight */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex justify-between font-black text-emerald-950 text-sm">
                <span>= {isBn ? 'মোট লাভ (Gross Profit)' : 'Gross Profit'}</span>
                <span>৳{grossProfit.toLocaleString()}</span>
              </div>

              {/* Operating Expenses section */}
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-2 border border-slate-200/60">
                <div className="flex justify-between font-extrabold text-slate-800">
                  <span>3. {isBn ? 'পরিচালন ও অফিস ব্যয় (Operating Expenses)' : 'Operating Expenses'}</span>
                  <span className="text-rose-700">-৳{totalExpenses.toLocaleString()}</span>
                </div>
                <div className="pl-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-500 font-semibold">
                  {expenses.slice(0, 6).map(e => (
                    <div key={e.id} className="flex justify-between">
                      <span className="truncate">• {e.titleBn || e.title}</span>
                      <span>৳{e.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Net Profit highlight */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center shadow-lg">
                <div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                    {isBn ? 'সর্বশেষ নিট লাভ (Net Profit)' : 'Final Net Profit'}
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {isBn ? 'সকল ব্যয় ও দেনা বাদ দেওয়ার পর প্রকৃত লাভ' : 'Actual bottom-line profit after subtracting all expenses'}
                  </p>
                </div>
                <span className="text-2xl font-black text-emerald-400">
                  ৳{netProfit.toLocaleString()}
                </span>
              </div>

            </div>
          </div>

          {/* Right 1 Col: Cash Inflow Breakdown by Payment Gateways */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-800">
                {isBn ? 'পেমেন্ট মাধ্যম অনুযায়ী ক্যাশ ব্যালেন্স' : 'Payment Gateways Breakdown'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isBn ? 'কোন মাধ্যমে কত টাকা জমা হয়েছে' : 'Channel-wise income inflow breakdown'}
              </p>
            </div>

            <div className="space-y-3">
              {Object.entries(paymentMethodsSummary).map(([method, amt]) => {
                const numAmt = Number(amt) || 0;
                const percentage = totalGrossRevenue > 0 ? Math.round((numAmt / totalGrossRevenue) * 100) : 0;
                return (
                  <div key={method} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 font-black text-slate-800">
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{method}</span>
                      </div>
                      <span className="font-black text-slate-900">৳{numAmt.toLocaleString()}</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>{percentage}% of total income</span>
                      <span>Verified</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: EXPENSE TRACKER (ব্যয় ও খরচের খাতা)
         ========================================================================= */}
      {activeSubTab === 'expenses' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {isBn ? 'দৈনন্দিন ব্যবসায়িক খরচের খাতা' : 'Daily Business Expense Ledger'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isBn ? 'দোকান ভাড়া, বেতন, বিদ্যুৎ, প্যাকেজিং ও কুরিয়ার ব্যয়ের হিসাব' : 'Record and manage operational overheads, utilities, salaries and maintenance'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                <option value="Rent">{isBn ? 'দোকান ভাড়া (Rent)' : 'Rent'}</option>
                <option value="Salary">{isBn ? 'বেতন (Salary)' : 'Salary'}</option>
                <option value="Utilities">{isBn ? 'বিদ্যুৎ ও বিল (Utilities)' : 'Utilities'}</option>
                <option value="Courier">{isBn ? 'কুরিয়ার বুকিং (Courier)' : 'Courier'}</option>
                <option value="Packaging">{isBn ? 'প্যাকেজিং (Packaging)' : 'Packaging'}</option>
                <option value="Feeding & Care">{isBn ? 'প্রাণী পরিচর্যা (Pet Care)' : 'Feeding & Care'}</option>
                <option value="Marketing">{isBn ? 'বিজ্ঞাপন ও বুস্টিং (Marketing)' : 'Marketing'}</option>
                <option value="Other">{isBn ? 'অন্যান্য (Other)' : 'Other'}</option>
              </select>

              <button
                onClick={() => setShowExpenseModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBn ? 'খরচ এন্ট্রি' : '+ Record Expense'}</span>
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">{isBn ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3 px-3">{isBn ? 'খরচের বিবরণ' : 'Expense Details'}</th>
                  <th className="py-3 px-3">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th className="py-3 px-3">{isBn ? 'পেমেন্ট মাধ্যম' : 'Method'}</th>
                  <th className="py-3 px-3">{isBn ? 'ভাউচার / রেফারেন্স' : 'Ref No'}</th>
                  <th className="py-3 px-3 text-right">{isBn ? 'টাকার পরিমাণ' : 'Amount'}</th>
                  <th className="py-3 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expenses
                  .filter(e => expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter)
                  .map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(exp.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{exp.titleBn || exp.title}</p>
                        {exp.notes && <span className="text-[10px] text-slate-400 font-semibold">{exp.notes}</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-600">
                        {exp.paymentMethod}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {exp.referenceNo || '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-rose-700 text-sm">
                        ৳{exp.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {onDeleteExpense && (
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-bold">
                      {isBn ? 'কোনো খরচের এন্ট্রি পাওয়া যায়নি।' : 'No expense records found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: SUPPLIERS / VENDOR LEDGER (সরবরাহকারী বাকি খাতা)
         ========================================================================= */}
      {activeSubTab === 'suppliers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {isBn ? 'সরবরাহকারী ও মহাজন বাকি খাতা' : 'Suppliers & Vendor Payables Ledger'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isBn ? 'ভেন্ডরদের মোট ক্রয়, পরিশোধিত টাকা ও বকেয়া দেনার পূর্ণাঙ্গ লেজার' : 'Track vendor balances, cumulative purchases, paid sums and record installment payments'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {isBn ? 'মোট মহাজন বাকি' : 'Total Outstanding Payables'}
              </span>
              <span className="text-lg font-black text-rose-700">
                ৳{totalSupplierDue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map(sup => (
              <div key={sup.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{sup.companyName}</h4>
                    <p className="text-xs text-slate-500 font-bold">{sup.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{sup.phone}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    sup.dueBalance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {sup.dueBalance === 0 ? 'Fully Paid' : 'Due Pending'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/60 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">{isBn ? 'মোট ক্রয়' : 'Total'}</span>
                    <strong className="font-black text-slate-800 text-[11px]">৳{sup.totalPurchases.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-emerald-600 font-bold uppercase block">{isBn ? 'পরিশোধ' : 'Paid'}</span>
                    <strong className="font-black text-emerald-700 text-[11px]">৳{sup.paidAmount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-rose-600 font-bold uppercase block">{isBn ? 'বকেয়া' : 'Due'}</span>
                    <strong className="font-black text-rose-700 text-[11px]">৳{sup.dueBalance.toLocaleString()}</strong>
                  </div>
                </div>

                {sup.address && (
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    📍 {sup.address}
                  </p>
                )}

                <button
                  onClick={() => {
                    setSelectedSupplierId(sup.id);
                    setSupplierPayAmount(sup.dueBalance > 0 ? sup.dueBalance : 5000);
                    setShowPaySupplierModal(true);
                  }}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isBn ? 'টাকা পরিশোধ করুন' : 'Record Payment'}</span>
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 4: CASHBOOK & TRANSACTIONS (ক্যাশ ও লেনদেন খাতা)
         ========================================================================= */}
      {activeSubTab === 'transactions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {isBn ? 'ক্যাশ ও ব্যাংক লেনদেন বিবরণী' : 'Cashbook & Bank Account Statement'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isBn ? 'প্রতিটি ইনকাম এবং এক্সপেন্স ট্রানজেকশনের অডিট খাতা' : 'Detailed double-entry cashflow transactions audit ledger'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              {transactions.length} {isBn ? 'টি ট্রানজেকশন' : 'transactions'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">{isBn ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                  <th className="py-3 px-3">{isBn ? 'বিবরণ' : 'Description'}</th>
                  <th className="py-3 px-3">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th className="py-3 px-3">{isBn ? 'মাধ্যম' : 'Method'}</th>
                  <th className="py-3 px-3 text-right">{isBn ? 'টাকার পরিমাণ' : 'Amount'}</th>
                  <th className="py-3 px-4 text-right">{isBn ? 'অপারেটর' : 'Recorded By'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.map(tx => {
                  const isIncome = tx.type === 'Income';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(tx.date).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {tx.description}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-600">
                        {tx.method}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-sm">
                        <span className={isIncome ? 'text-emerald-700' : 'text-rose-700'}>
                          {isIncome ? '+' : '-'}৳{tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 text-[11px] font-bold">
                        {tx.operator || currentUserEmail || 'Admin'}
                      </td>
                    </tr>
                  );
                })}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-bold">
                      {isBn ? 'কোনো লেনদেন পাওয়া যায়নি।' : 'No transactions recorded.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 5: CUSTOMER DUES & COD RECEIVABLES
         ========================================================================= */}
      {activeSubTab === 'customer_dues' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {isBn ? 'কাস্টমার ও কুরিয়ার COD পাওনা খাতা' : 'Customer Receivables & COD Dues'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isBn ? 'অনলাইন অর্ডার যার টাকা এখনো কুরিয়ার থেকে সংগ্রহ হয়নি' : 'Active shipped & processing orders awaiting delivery collection payment'}
              </p>
            </div>
            <span className="text-sm font-black text-blue-700">
              {isBn ? 'মোট পাওনাঃ ' : 'Total Pending: '} ৳{pendingCodReceivables.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">{isBn ? 'ট্র্যাকিং আইডি' : 'Tracking ID'}</th>
                  <th className="py-3 px-3">{isBn ? 'গ্রাহকের নাম ও ফোন' : 'Customer & Phone'}</th>
                  <th className="py-3 px-3">{isBn ? 'ঠিকানা ও জেলা' : 'Location'}</th>
                  <th className="py-3 px-3">{isBn ? 'অর্ডার স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3 px-3">{isBn ? 'পেমেন্ট মেথড' : 'Method'}</th>
                  <th className="py-3 px-4 text-right">{isBn ? 'টাকার পরিমাণ' : 'Due Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders
                  .filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled')
                  .map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {ord.trackingId || ord.id}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{ord.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {ord.district || 'Dhaka'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-600">
                        {ord.paymentMethod || 'Cash on Delivery'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-800 text-sm">
                        ৳{ord.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 6: PRINTABLE FINANCIAL STATEMENT (আর্থিক স্টেটমেন্ট প্রিন্ট)
         ========================================================================= */}
      {activeSubTab === 'statement_print' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {isBn ? 'প্রিন্টযোগ্য অফিসিয়াল আর্থিক স্টেটমেন্ট' : 'Official Printable Financial Statement'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isBn ? 'অডিট ও মাসিক মিটিংয়ের জন্য প্রস্তুত ব্যালেন্স শিট' : 'Formatted formal financial statement ready for management review'}
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'স্টেটমেন্ট প্রিন্ট করুন' : 'Print Statement'}</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl p-8 bg-slate-50/50 space-y-6 max-w-3xl mx-auto">
            <div className="text-center border-b border-slate-300 pb-4">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">TAQWA ENTERPRISE</h2>
              <p className="text-xs text-slate-500 font-bold">Comprehensive Profit & Loss Statement</p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">Generated: {new Date().toLocaleDateString()} | Admin: {currentUserEmail}</p>
            </div>

            {/* Income Statement Table */}
            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="uppercase text-slate-500 font-extrabold">Particulars</span>
                <span className="uppercase text-slate-500 font-extrabold">Amount (BDT)</span>
              </div>

              <div className="flex justify-between">
                <span>1. Gross Sales Revenue (Delivered Orders)</span>
                <span>৳{totalOrderRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>2. Offline Showroom Counter Sales</span>
                <span>৳{manualSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Gross Inflow:</span>
                <span>৳{totalGrossRevenue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-rose-700 pt-2">
                <span>3. Less: Cost of Goods Sold (COGS)</span>
                <span>-৳{estimatedCOGS.toLocaleString()}</span>
              </div>

              <div className="flex justify-between font-black text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                <span>Gross Profit Margin:</span>
                <span>৳{grossProfit.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-rose-700">
                <span>4. Less: Total Operating Expenses</span>
                <span>-৳{totalExpenses.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-rose-700">
                <span>5. Less: Damaged Goods & Spoilage Write-Off</span>
                <span>-৳{damages.reduce((sum, d) => sum + d.totalLoss, 0).toLocaleString()}</span>
              </div>

              <div className="flex justify-between font-black text-base text-slate-900 border-t-2 border-slate-900 pt-3">
                <span>NET PROFIT / LOSS:</span>
                <span className="text-emerald-700">৳{netProfit.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-300 flex justify-between text-xs text-slate-600 font-bold">
              <div>
                <p>Prepared By: _____________________</p>
                <p className="mt-1">Accounts Officer</p>
              </div>
              <div className="text-right">
                <p>Approved By: _____________________</p>
                <p className="mt-1">Managing Director</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD EXPENSE
         ========================================================================= */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">
                {isBn ? 'নতুন খরচ / ব্যয় এন্ট্রি' : 'Record Business Expense'}
              </h3>
              <button 
                onClick={() => setShowExpenseModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'খরচের শিরোনাম' : 'Expense Title (English / Bangla)'}
                </label>
                <input
                  type="text"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder={isBn ? 'যেমনঃ দোকান ভাড়া / বিদ্যুৎ বিল' : 'e.g. Store Rent / DESCO Bill'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Rent">{isBn ? 'দোকান ভাড়া' : 'Rent'}</option>
                    <option value="Salary">{isBn ? 'কর্মচারী বেতন' : 'Salary'}</option>
                    <option value="Utilities">{isBn ? 'বিদ্যুৎ ও পানি' : 'Utilities'}</option>
                    <option value="Courier">{isBn ? 'কুরিয়ার বুকিং' : 'Courier'}</option>
                    <option value="Packaging">{isBn ? 'প্যাকেজিং বক্স' : 'Packaging'}</option>
                    <option value="Feeding & Care">{isBn ? 'প্রাণী পরিচর্যা' : 'Feeding & Care'}</option>
                    <option value="Marketing">{isBn ? 'বিজ্ঞাপন ও বুস্টিং' : 'Marketing'}</option>
                    <option value="Office Supplies">{isBn ? 'অফিস স্টেশনারি' : 'Office Supplies'}</option>
                    <option value="Other">{isBn ? 'অন্যান্য' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                  </label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'ভাউচার / রেফারেন্স নং' : 'Receipt / Voucher No'}
                  </label>
                  <input
                    type="text"
                    value={expRef}
                    onChange={(e) => setExpRef(e.target.value)}
                    placeholder="e.g. VOUCHER-992"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'নোট' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="e.g. Paid in full for May"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  {isBn ? 'খরচ সংরক্ষণ করুন' : 'Confirm Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: PAY SUPPLIER (সরবরাহকারী বাকি পরিশোধ)
         ========================================================================= */}
      {showPaySupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">
                {isBn ? 'সরবরাহকারীকে টাকা পরিশোধ' : 'Record Supplier Installment Payment'}
              </h3>
              <button 
                onClick={() => setShowPaySupplierModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSupplierPaymentSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'সরবরাহকারী / ভেন্ডর' : 'Supplier'}
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => {
                    setSelectedSupplierId(e.target.value);
                    const s = suppliers.find(sup => sup.id === e.target.value);
                    if (s) setSupplierPayAmount(s.dueBalance > 0 ? s.dueBalance : 5000);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName || s.name} (Due: ৳{s.dueBalance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'পরিশোধের পরিমাণ (৳)' : 'Payment Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={supplierPayAmount}
                    onChange={(e) => setSupplierPayAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'মাধ্যম' : 'Payment Method'}
                  </label>
                  <select
                    value={supplierPayMethod}
                    onChange={(e) => setSupplierPayMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Bank">Bank Transfer</option>
                    <option value="bKash">bKash</option>
                    <option value="Cash">Cash</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'নোট / চেক নম্বর' : 'Notes / Cheque No'}
                </label>
                <input
                  type="text"
                  value={supplierPayNotes}
                  onChange={(e) => setSupplierPayNotes(e.target.value)}
                  placeholder="e.g. Cheque #8841 City Bank"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaySupplierModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  {isBn ? 'পরিশোধ নিশ্চিত করুন' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: RECORD INCOME / OFFLINE COUNTER SALE
         ========================================================================= */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">
                {isBn ? 'কাউন্টার সেল / সরাসরি ইনকাম রেকর্ড' : 'Record Direct Counter Sale / Income'}
              </h3>
              <button 
                onClick={() => setShowTxModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'লেনদেনের ধরণ' : 'Type'}
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Income">Income (+ আয়)</option>
                    <option value="Expense">Expense (- ব্যয়)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Offline Counter Sale">Offline Counter Sale</option>
                    <option value="Customer Due Recovery">Customer Due Recovery</option>
                    <option value="Capital Inflow">Capital Inflow</option>
                    <option value="Operating Expense">Operating Expense</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'টাকার পরিমাণ (৳)' : 'Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'মাধ্যম' : 'Method'}
                  </label>
                  <select
                    value={txMethod}
                    onChange={(e) => setTxMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'বিবরণ' : 'Description'}
                </label>
                <input
                  type="text"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder={isBn ? 'যেমনঃ শোরুমে ক্যাশ বিক্রি' : 'e.g. Showroom walk-in sale'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Confirm Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
