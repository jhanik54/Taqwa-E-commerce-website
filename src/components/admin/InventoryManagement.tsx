import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Printer, 
  Truck, 
  DollarSign, 
  Layers, 
  Clock, 
  X, 
  Edit3, 
  FileText,
  Barcode,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { Product, InventoryLog, Supplier, PurchaseOrder, DamageWaste } from '../../types';

interface InventoryManagementProps {
  products: Product[];
  inventoryLogs: InventoryLog[];
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  damages: DamageWaste[];
  onAdjustStock: (pId: string, quantity: number, type: string, reason: string) => Promise<void>;
  onAddPurchase: (payload: any) => Promise<void>;
  onAddDamage: (payload: any) => Promise<void>;
  onDeleteDamage?: (id: string) => Promise<void>;
  currentUserEmail?: string;
  lang: 'en' | 'bn';
}

export default function InventoryManagement({
  products = [],
  inventoryLogs = [],
  suppliers = [],
  purchases = [],
  damages = [],
  onAdjustStock,
  onAddPurchase,
  onAddDamage,
  onDeleteDamage,
  currentUserEmail = '',
  lang
}: InventoryManagementProps) {
  const isBn = lang === 'bn';

  // Sub-tabs: 'stock_list' | 'stock_in' | 'adjustments' | 'damages' | 'audit_print'
  const [activeSubTab, setActiveSubTab] = useState<'stock_list' | 'stock_in' | 'adjustments' | 'damages' | 'audit_print'>('stock_list');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockHealthFilter, setStockHealthFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Quick Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'Stock Adjustment' | 'Purchase Entry' | 'Damage Entry'>('Stock Adjustment');
  const [adjustReason, setAdjustReason] = useState('');

  // Purchase / Stock-In Modal
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSupplierId, setPurchaseSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseProductId, setPurchaseProductId] = useState(products[0]?.id || '');
  const [purchaseQty, setPurchaseQty] = useState<number>(20);
  const [purchaseCostPrice, setPurchaseCostPrice] = useState<number>(500);
  const [purchaseSellPrice, setPurchaseSellPrice] = useState<number>(650);
  const [purchasePaidAmount, setPurchasePaidAmount] = useState<number>(10000);
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState<'Cash' | 'bKash' | 'Bank' | 'Nagad'>('Cash');
  const [purchaseBatchNo, setPurchaseBatchNo] = useState(`BATCH-${Date.now().toString().slice(-4)}`);
  const [purchaseNotes, setPurchaseNotes] = useState('');

  // Damage Entry Modal
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [damageProductId, setDamageProductId] = useState(products[0]?.id || '');
  const [damageQty, setDamageQty] = useState<number>(1);
  const [damageCostPerUnit, setDamageCostPerUnit] = useState<number>(0);
  const [damageReason, setDamageReason] = useState<'Broken/Damaged' | 'Expired' | 'Spoiled/Rotten' | 'Missing/Audit Mismatch' | 'Sample/Test'>('Broken/Damaged');
  const [damageNotes, setDamageNotes] = useState('');

  // KPIs
  const totalValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  }, [products]);

  const totalStockUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.stock || 0), 0);
  }, [products]);

  const lowStockItems = useMemo(() => {
    return products.filter(p => p.stock > 0 && p.stock <= 10);
  }, [products]);

  const outOfStockItems = useMemo(() => {
    return products.filter(p => p.stock === 0);
  }, [products]);

  const totalDamagesLoss = useMemo(() => {
    return damages.reduce((sum, d) => sum + (d.totalLoss || 0), 0);
  }, [damages]);

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !search || 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        (p.banglaName && p.banglaName.toLowerCase().includes(search.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
        (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));

      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;

      let matchesHealth = true;
      if (stockHealthFilter === 'in_stock') matchesHealth = p.stock > 10;
      else if (stockHealthFilter === 'low_stock') matchesHealth = p.stock > 0 && p.stock <= 10;
      else if (stockHealthFilter === 'out_of_stock') matchesHealth = p.stock === 0;

      return matchesSearch && matchesCat && matchesHealth;
    });
  }, [products, search, categoryFilter, stockHealthFilter]);

  // Handle Quick Adjust Stock Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId || adjustQty <= 0) return;
    await onAdjustStock(adjustProductId, Number(adjustQty), adjustType, adjustReason || 'Inventory Audit Routine');
    setShowAdjustModal(false);
    setAdjustReason('');
  };

  // Handle Purchase Submit
  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseSupplierId || !purchaseProductId || purchaseQty <= 0) return;

    const prod = products.find(p => p.id === purchaseProductId);
    const subtotal = purchaseQty * purchaseCostPrice;

    const payload = {
      supplierId: purchaseSupplierId,
      items: [{
        productId: purchaseProductId,
        productName: prod ? prod.name : 'Item',
        quantity: Number(purchaseQty),
        costPrice: Number(purchaseCostPrice),
        sellPrice: Number(purchaseSellPrice),
        subtotal
      }],
      paidAmount: Number(purchasePaidAmount),
      paymentMethod: purchasePaymentMethod,
      batchNo: purchaseBatchNo,
      notes: purchaseNotes,
      invoiceDate: new Date().toISOString()
    };

    await onAddPurchase(payload);
    setShowPurchaseModal(false);
    setPurchaseNotes('');
  };

  // Handle Damage Submit
  const handleDamageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageProductId || damageQty <= 0) return;
    const prod = products.find(p => p.id === damageProductId);
    const unitCost = damageCostPerUnit > 0 ? damageCostPerUnit : (prod ? Math.round(prod.price * 0.75) : 100);

    const payload = {
      productId: damageProductId,
      quantity: Number(damageQty),
      costPerUnit: unitCost,
      reason: damageReason,
      notes: damageNotes
    };

    await onAddDamage(payload);
    setShowDamageModal(false);
    setDamageNotes('');
  };

  // Print Inventory Sheet
  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in" id="inventory-management-root">
      
      {/* 1. TOP KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Valuation */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'মোট স্টক ভ্যালুয়েশন' : 'Total Stock Valuation'}
            </p>
            <h3 className="text-xl font-black text-slate-800 mt-1">৳{totalValuation.toLocaleString()}</h3>
            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>{products.length} {isBn ? 'টি পণ্য ক্যাটালগে' : 'products cataloged'}</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Total Stock Units */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'মোট মজুদ ইউনিট' : 'Total Units in Stock'}
            </p>
            <h3 className="text-xl font-black text-slate-800 mt-1">{totalStockUnits.toLocaleString()} <span className="text-xs text-slate-400 font-bold">Pcs</span></h3>
            <span className="text-[10px] text-blue-600 font-extrabold flex items-center gap-0.5 mt-0.5">
              <Package className="w-3 h-3" />
              <span>{isBn ? 'গুদাম ও শো-রুম' : 'Warehouse & Store'}</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200/80 bg-amber-50/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              {isBn ? 'কম মজুদের সতর্কতা' : 'Low Stock (≤ 10)'}
            </p>
            <h3 className="text-xl font-black text-amber-900 mt-1">{lowStockItems.length} <span className="text-xs text-amber-700 font-bold">Items</span></h3>
            <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-0.5 mt-0.5">
              <AlertTriangle className="w-3 h-3" />
              <span>{isBn ? 'রি-অর্ডার প্রয়োজন' : 'Reorder recommended'}</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white rounded-2xl p-4 border border-rose-200/80 bg-rose-50/20 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
              {isBn ? 'স্টক শেষ (০ ইউনিট)' : 'Out of Stock (0)'}
            </p>
            <h3 className="text-xl font-black text-rose-900 mt-1">{outOfStockItems.length} <span className="text-xs text-rose-700 font-bold">Items</span></h3>
            <span className="text-[10px] text-rose-600 font-extrabold flex items-center gap-0.5 mt-0.5">
              <ShieldAlert className="w-3 h-3" />
              <span>{isBn ? 'গ্রাহক কিনতে পারছে না' : 'Unavailable to customers'}</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Damages / Loss */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'ক্ষয়ক্ষতি ও অপচয়' : 'Damages & Waste'}
            </p>
            <h3 className="text-xl font-black text-slate-800 mt-1">৳{totalDamagesLoss.toLocaleString()}</h3>
            <span className="text-[10px] text-slate-500 font-extrabold flex items-center gap-0.5 mt-0.5">
              <span>{damages.length} {isBn ? 'টি এন্ট্রি রাইট অফ' : 'entries written off'}</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Trash2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. SUB-NAVIGATION TOOLBAR & ACTION BUTTONS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'stock_list', label: isBn ? 'লাইভ স্টক রেজিস্টার' : 'Live Stock Register', icon: Package },
            { id: 'stock_in', label: isBn ? 'ক্রয় চালান ও ইনভয়েস (PO)' : 'Purchase Stock In (PO)', icon: Truck },
            { id: 'adjustments', label: isBn ? 'স্টক অডিট ও মুভমেন্ট লগ' : 'Audit Movement Logs', icon: Clock },
            { id: 'damages', label: isBn ? 'ক্ষয়ক্ষতি ও অপচয় খাতা' : 'Damages & Spoilage', icon: Trash2 },
            { id: 'audit_print', label: isBn ? 'স্টক অডিট শিট ও বারকোড' : 'Audit Sheet & Print', icon: Barcode },
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

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (products.length > 0) {
                setAdjustProductId(products[0].id);
              }
              setShowAdjustModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-850 text-white hover:bg-slate-900 rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBn ? 'স্টক অ্যাডজাস্ট' : 'Adjust Stock'}</span>
          </button>

          <button
            onClick={() => {
              if (products.length > 0) setPurchaseProductId(products[0].id);
              if (suppliers.length > 0) setPurchaseSupplierId(suppliers[0].id);
              setShowPurchaseModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-emerald-950/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isBn ? 'নতুন স্টক ইন (ক্রয়)' : '+ New Stock In'}</span>
          </button>
        </div>

      </div>

      {/* 3. SUB-TAB CONTENT VIEWS */}

      {/* =========================================================================
          VIEW 1: LIVE WAREHOUSE STOCK LIST
         ========================================================================= */}
      {activeSubTab === 'stock_list' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
          
          {/* Search & Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isBn ? 'পণ্য নাম, SKU বা বারকোড দিয়ে খুঁজুন...' : 'Search by name, SKU or barcode...'}
                className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">{isBn ? 'সব ক্যাটাগরি' : 'All Categories'}</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>

              {/* Health Filter */}
              <select
                value={stockHealthFilter}
                onChange={(e) => setStockHealthFilter(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">{isBn ? 'সব মজুদ অবস্থা' : 'All Stock Health'}</option>
                <option value="in_stock">{isBn ? 'পর্যাপ্ত মজুদ (>10)' : 'In Stock (>10)'}</option>
                <option value="low_stock">{isBn ? 'কম মজুদ (১-১০)' : 'Low Stock (1-10)'}</option>
                <option value="out_of_stock">{isBn ? 'স্টক শেষ (০)' : 'Out of Stock (0)'}</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">{isBn ? 'পণ্য ও SKU' : 'Product & SKU'}</th>
                  <th className="py-3 px-3">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th className="py-3 px-3">{isBn ? 'বিক্রয় মূল্য' : 'Retail Price'}</th>
                  <th className="py-3 px-3 text-center">{isBn ? 'বর্তমান স্টক' : 'Current Stock'}</th>
                  <th className="py-3 px-3">{isBn ? 'স্টক অবস্থা' : 'Stock Health'}</th>
                  <th className="py-3 px-3">{isBn ? 'মোট স্টক মূল্য' : 'Valuation'}</th>
                  <th className="py-3 px-4 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => {
                  const val = p.price * (p.stock || 0);
                  const isOut = p.stock === 0;
                  const isLow = p.stock > 0 && p.stock <= 10;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.image || "https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&q=80&w=200"} 
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-800 text-xs truncate">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-bold">{p.banglaName || p.weight || '1 Pcs'}</span>
                              {p.sku && (
                                <span className="text-[9px] bg-slate-100 text-slate-600 font-mono font-bold px-1.5 py-0.5 rounded">
                                  {p.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {p.category}
                        </span>
                      </td>

                      {/* Retail Price */}
                      <td className="py-3 px-3 font-bold text-slate-700">
                        ৳{p.price.toLocaleString()}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block font-black text-sm px-2.5 py-0.5 rounded-lg ${
                          isOut ? 'bg-rose-100 text-rose-800' :
                          isLow ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-50 text-emerald-800'
                        }`}>
                          {p.stock} <span className="text-[10px] font-normal">Pcs</span>
                        </span>
                      </td>

                      {/* Health Badge */}
                      <td className="py-3 px-3">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{isBn ? 'স্টক শেষ' : 'Out of Stock'}</span>
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{isBn ? 'কম মজুদ' : 'Low Stock'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{isBn ? 'পর্যাপ্ত' : 'Healthy'}</span>
                          </span>
                        )}
                      </td>

                      {/* Total Value */}
                      <td className="py-3 px-3 font-extrabold text-slate-800">
                        ৳{val.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setAdjustProductId(p.id);
                            setShowAdjustModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{isBn ? 'অ্যাডজাস্ট' : 'Adjust'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-bold">
                      {isBn ? 'কোনো পণ্য খুঁজে পাওয়া যায়নি।' : 'No products found matching filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: PURCHASE ORDERS & STOCK IN (PO)
         ========================================================================= */}
      {activeSubTab === 'stock_in' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {isBn ? 'ক্রয় চালান ও ভেন্ডর ইনভয়েস হিস্টোরি' : 'Purchase Orders & Stock Intake Invoices'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isBn ? 'সাপ্লায়ার থেকে ক্রয়কৃত নতুন পণ্যের চালানের পূর্ণাঙ্গ তালিকা' : 'Complete ledger of vendor purchase batches with cost and payment status'}
              </p>
            </div>

            <button
              onClick={() => {
                if (products.length > 0) setPurchaseProductId(products[0].id);
                if (suppliers.length > 0) setPurchaseSupplierId(suppliers[0].id);
                setShowPurchaseModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isBn ? 'নতুন ক্রয় চালান যোগ করুন' : '+ Create Purchase Bill'}</span>
            </button>
          </div>

          {/* Purchases List */}
          <div className="space-y-3">
            {purchases.map(po => (
              <div key={po.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition-all space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-mono font-bold text-xs">
                      PO
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-slate-800 text-xs">{po.poNumber}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          po.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          po.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {po.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">
                        {isBn ? 'সরবরাহকারী' : 'Supplier'}: <span className="text-slate-700 font-black">{po.supplierName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold">
                      {new Date(po.invoiceDate).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                    </p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">
                      ৳{po.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Items in PO */}
                <div className="border-t border-slate-200/60 pt-2.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {po.items.map((item, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-xl border border-slate-200/60 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-700 truncate max-w-[150px]">{item.productName}</p>
                        <span className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity} × ৳{item.costPrice}</span>
                      </div>
                      <span className="font-black text-slate-800">৳{item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Footer status summary */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 border-t border-dashed border-slate-200 font-bold">
                  <div className="flex items-center gap-3">
                    <span>{isBn ? 'পরিশোধিত' : 'Paid'}: <strong className="text-emerald-700">৳{po.paidAmount.toLocaleString()}</strong> ({po.paymentMethod})</span>
                    {po.dueAmount > 0 && (
                      <span>{isBn ? 'বাকি' : 'Due'}: <strong className="text-rose-700">৳{po.dueAmount.toLocaleString()}</strong></span>
                    )}
                    {po.batchNo && <span className="font-mono text-slate-400">Batch: {po.batchNo}</span>}
                  </div>
                  {po.notes && <span className="italic text-slate-400">{po.notes}</span>}
                </div>
              </div>
            ))}

            {purchases.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-bold">
                {isBn ? 'কোনো ক্রয় চালান পাওয়া যায়নি।' : 'No purchase orders recorded yet.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: STOCK ADJUSTMENT & AUDIT LOGS
         ========================================================================= */}
      {activeSubTab === 'adjustments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {isBn ? 'স্টক মুভমেন্ট ও অডিট ট্রেইল' : 'Stock Audit & Movement Logs'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isBn ? 'প্রতিটি স্টক ইন, স্টক আউট ও সমন্বয়ের রেকর্ড' : 'Audited log of stock entries, damages, order reductions and physical adjustments'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
              {inventoryLogs.length} {isBn ? 'টি এন্ট্রি' : 'entries'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">{isBn ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                  <th className="py-3 px-3">{isBn ? 'পণ্য নাম' : 'Product Name'}</th>
                  <th className="py-3 px-3">{isBn ? 'ধরণ' : 'Type'}</th>
                  <th className="py-3 px-3 text-center">{isBn ? 'পরিমাণ (পিস)' : 'Qty'}</th>
                  <th className="py-3 px-3">{isBn ? 'কারণ / নোট' : 'Reason / Note'}</th>
                  <th className="py-3 px-4 text-right">{isBn ? 'অপারেটর' : 'Operator'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventoryLogs.map(log => {
                  const isStockIn = log.type.includes('In') || log.type.includes('Purchase');
                  const isDamage = log.type.includes('Damage') || log.type.includes('Waste');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(log.date || Date.now()).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 max-w-xs truncate">
                        {log.productName}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                          isStockIn ? 'bg-emerald-50 text-emerald-700' :
                          isDamage ? 'bg-rose-50 text-rose-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {isStockIn ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span>{log.type}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-black">
                        <span className={isStockIn ? 'text-emerald-600' : isDamage ? 'text-rose-600' : 'text-slate-700'}>
                          {isStockIn ? '+' : '-'}{log.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        {log.reason || 'Audit Adjustment'}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 text-[11px] font-bold">
                        {log.operator || currentUserEmail || 'Admin'}
                      </td>
                    </tr>
                  );
                })}

                {inventoryLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-bold">
                      {isBn ? 'কোনো অডিট লগ এখনো পাওয়া যায়নি।' : 'No inventory logs recorded.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: DAMAGES & WASTE MANAGEMENT
         ========================================================================= */}
      {activeSubTab === 'damages' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {isBn ? 'ক্ষয়ক্ষতি, অপচয় ও নষ্ট পণ্যের তালিকা' : 'Damages, Expiry & Spoilage Write-Offs'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isBn ? 'পরিবহনে ক্ষতিগ্রস্ত বা মেয়াদোত্তীর্ণ পণ্যের আর্থিক ক্ষতি হিসাব' : 'Track monetary inventory losses, damaged goods disposal and write-off audits'}
              </p>
            </div>

            <button
              onClick={() => {
                if (products.length > 0) setDamageProductId(products[0].id);
                setShowDamageModal(true);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'নতুন ক্ষতি এন্ট্রি' : '+ Record Damage'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {damages.map(dmg => (
              <div key={dmg.id} className="p-4 rounded-2xl border border-rose-100 bg-rose-50/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{dmg.productName}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
                      <span className="text-rose-700 font-black">{dmg.quantity} Pcs</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-bold">Unit Cost: ৳{dmg.costPerUnit}</span>
                      <span className="text-slate-400">•</span>
                      <span className="bg-rose-100/80 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">{dmg.reason}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">
                    {new Date(dmg.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                  </span>
                  <span className="text-sm font-black text-rose-700 mt-0.5 block">
                    -৳{dmg.totalLoss.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}

            {damages.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-bold">
                {isBn ? 'কোনো ক্ষয়ক্ষতির এন্ট্রি নেই।' : 'No damage or write-off entries recorded.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: PRINTABLE STOCK AUDIT & BARCODE SHEET
         ========================================================================= */}
      {activeSubTab === 'audit_print' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                {isBn ? 'স্টক অডিট শিট ও বারকোড প্রিন্টার' : 'Stock Audit Verification Sheet & Barcodes'}
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                {isBn ? 'দোকানে সরাসরি গুদাম মিলানোর জন্য প্রিন্টযোগ্য পূর্ণাঙ্গ স্টক তালিকা' : 'Printable stock verification worksheet for monthly physical count audits'}
              </p>
            </div>

            <button
              onClick={handlePrintAudit}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition-all"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'শিট প্রিন্ট করুন' : 'Print Audit Sheet'}</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-4">
            <div className="text-center border-b border-slate-200 pb-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">TAQWA ENTERPRISE</h2>
              <p className="text-xs text-slate-500 font-bold">Physical Warehouse Stock Audit Worksheet</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Audit Date: {new Date().toLocaleDateString()} | Auditor: {currentUserEmail || 'Admin'}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 font-extrabold uppercase text-[10px]">
                    <th className="py-2 px-2">SL</th>
                    <th className="py-2 px-2">SKU / Barcode</th>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-2">Category</th>
                    <th className="py-2 px-2 text-right">System Qty</th>
                    <th className="py-2 px-3 text-center">Physical Count (Pencil)</th>
                    <th className="py-2 px-2 text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((p, idx) => (
                    <tr key={p.id} className="text-[11px]">
                      <td className="py-2 px-2 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-2 font-mono font-bold text-slate-700">{p.sku || `TQW-SKU-${p.id}`}</td>
                      <td className="py-2 px-3 font-bold text-slate-800">{p.name}</td>
                      <td className="py-2 px-2 uppercase text-slate-500 font-bold text-[10px]">{p.category}</td>
                      <td className="py-2 px-2 text-right font-black text-slate-700">{p.stock}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="inline-block w-24 h-6 border-b border-dashed border-slate-400"></span>
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-slate-700">৳{p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs text-slate-600 font-bold">
              <div>
                <p>Auditor Signature: _______________________</p>
                <p className="mt-1">Date: _______________________</p>
              </div>
              <div className="text-right">
                <p>Store Manager Approval: _______________________</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: QUICK STOCK ADJUSTMENT
         ========================================================================= */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">
                {isBn ? 'স্টক পরিমাণ সমন্বয় / অ্যাডজাস্ট' : 'Stock Quantity Adjustment'}
              </h3>
              <button 
                onClick={() => setShowAdjustModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'পণ্য নির্বাচন করুন' : 'Select Product'}
                </label>
                <select
                  value={adjustProductId}
                  onChange={(e) => setAdjustProductId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.stock} Pcs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'অ্যাডজাস্টমেন্ট ধরণ' : 'Adjustment Type'}
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Purchase Entry">{isBn ? 'স্টক ইন (+ যোগ)' : 'Stock In (+ Add)'}</option>
                    <option value="Stock Adjustment">{isBn ? 'সমন্বয় (+ যোগ)' : 'Physical Count Adjustment (+)'}</option>
                    <option value="Damage Entry">{isBn ? 'ড্যামেজ (- বিয়োগ)' : 'Damage (- Deduct)'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'পরিমাণ (Pcs)' : 'Quantity (Pcs)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'কারণ / রেফারেন্স' : 'Reason / Reference Note'}
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={isBn ? 'যেমনঃ ফিজিক্যাল অডিট বা নতুন কার্টন' : 'e.g. Physical inventory count correction'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Confirm Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: PURCHASE STOCK IN (PO)
         ========================================================================= */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">
                {isBn ? 'নতুন ক্রয় চালান এন্ট্রি ও স্টক ইন' : 'New Purchase Order & Stock In'}
              </h3>
              <button 
                onClick={() => setShowPurchaseModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'সরবরাহকারী / ভেন্ডর' : 'Supplier / Vendor'}
                </label>
                <select
                  value={purchaseSupplierId}
                  onChange={(e) => setPurchaseSupplierId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                  required
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName || s.name} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'পণ্য' : 'Product to Stock In'}
                </label>
                <select
                  value={purchaseProductId}
                  onChange={(e) => {
                    setPurchaseProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod) {
                      setPurchaseSellPrice(prod.price);
                      setPurchaseCostPrice(Math.round(prod.price * 0.75));
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'পরিমাণ (Pcs)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'ক্রয়মূল্য (৳)' : 'Cost Price (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={purchaseCostPrice}
                    onChange={(e) => setPurchaseCostPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'বিক্রয়মূল্য (৳)' : 'Sell Price (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={purchaseSellPrice}
                    onChange={(e) => setPurchaseSellPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Total Calculation banner */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">{isBn ? 'চালানের মোট মূল্যঃ' : 'Total Purchase Bill:'}</span>
                <span className="font-black text-base text-emerald-800">৳{(purchaseQty * purchaseCostPrice).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'পরিশোধিত টাকা (৳)' : 'Paid Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={purchaseQty * purchaseCostPrice}
                    value={purchasePaidAmount}
                    onChange={(e) => setPurchasePaidAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'পেমেন্ট মাধ্যম' : 'Payment Method'}
                  </label>
                  <select
                    value={purchasePaymentMethod}
                    onChange={(e) => setPurchasePaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'ব্যাচ নাম্বার' : 'Batch No'}
                  </label>
                  <input
                    type="text"
                    value={purchaseBatchNo}
                    onChange={(e) => setPurchaseBatchNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'নোট / চালান নম্বর' : 'Invoice / Notes'}
                  </label>
                  <input
                    type="text"
                    value={purchaseNotes}
                    onChange={(e) => setPurchaseNotes(e.target.value)}
                    placeholder="Challan #882"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  {isBn ? 'চালান যুক্ত করুন' : 'Confirm Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: RECORD DAMAGE / WASTE
         ========================================================================= */}
      {showDamageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800">
                {isBn ? 'ক্ষয়ক্ষতি ও নষ্ট পণ্য এন্ট্রি' : 'Record Damaged / Expired Product'}
              </h3>
              <button 
                onClick={() => setShowDamageModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDamageSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'পণ্য নির্বাচন করুন' : 'Select Product'}
                </label>
                <select
                  value={damageProductId}
                  onChange={(e) => {
                    setDamageProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) setDamageCostPerUnit(Math.round(p.price * 0.75));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  required
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock} Pcs)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'ক্ষতির পরিমাণ (Pcs)' : 'Damaged Qty (Pcs)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={damageQty}
                    onChange={(e) => setDamageQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isBn ? 'ইউনিট ক্ষতিমূল্য (৳)' : 'Cost Per Unit (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={damageCostPerUnit}
                    onChange={(e) => setDamageCostPerUnit(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'ক্ষতির কারণ' : 'Reason for Damage'}
                </label>
                <select
                  value={damageReason}
                  onChange={(e) => setDamageReason(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="Broken/Damaged">{isBn ? 'ভাঙা / প্যাকেজিং নষ্ট' : 'Broken / Packaging Torn'}</option>
                  <option value="Expired">{isBn ? 'মেয়াদোত্তীর্ণ (Expired)' : 'Expired Date Exceeded'}</option>
                  <option value="Spoiled/Rotten">{isBn ? 'নষ্ট / পচে যাওয়া' : 'Spoiled / Rotten Feed'}</option>
                  <option value="Missing/Audit Mismatch">{isBn ? 'অডিট অমিল / নিখোঁজ' : 'Missing / Audit Discrepancy'}</option>
                  <option value="Sample/Test">{isBn ? 'নমুনা বা টেস্টে ব্যবহৃত' : 'Sample / Quality Testing'}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isBn ? 'বিস্তারিত নোট' : 'Detailed Notes'}
                </label>
                <input
                  type="text"
                  value={damageNotes}
                  onChange={(e) => setDamageNotes(e.target.value)}
                  placeholder={isBn ? 'যেমনঃ কুরিয়ার ডেলিভারিতে প্যাকেট ফেটে গেছে' : 'e.g. Carton wet during transport'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/60 flex items-center justify-between text-xs">
                <span className="font-bold text-rose-900">{isBn ? 'মোট আর্থিক ক্ষতিঃ' : 'Total Loss Amount:'}</span>
                <span className="font-black text-base text-rose-800">৳{(damageQty * (damageCostPerUnit || 100)).toLocaleString()}</span>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDamageModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  {isBn ? 'ক্ষতি এন্ট্রি করুন' : 'Record & Write Off'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
