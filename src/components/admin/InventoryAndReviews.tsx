import React, { useState } from 'react';
import { 
  Package, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Star, 
  Search, 
  Sliders, 
  TrendingUp, 
  History 
} from 'lucide-react';
import { Product, Review, InventoryLog } from '../../types';

interface InventoryAndReviewsProps {
  products: Product[];
  inventoryLogs: InventoryLog[];
  onAdjustStock: (pId: string, quantity: number, type: string, reason: string) => Promise<void>;
  onApproveReview: (pId: string, revId: string) => Promise<void>;
  onRejectReview: (pId: string, revId: string) => Promise<void>;
  onDeleteReview: (pId: string, revId: string) => Promise<void>;
  lang: 'en' | 'bn';
}

export default function InventoryAndReviews({
  products = [],
  inventoryLogs = [],
  onAdjustStock,
  onApproveReview,
  onRejectReview,
  onDeleteReview,
  lang
}: InventoryAndReviewsProps) {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'inventory' | 'reviews'>('inventory');

  // Search
  const [search, setSearch] = useState('');

  // Stock adjustments fields
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'Purchase Entry' | 'Stock Adjustment' | 'Damage Entry'>('Purchase Entry');
  const [adjustReason, setAdjustReason] = useState('');

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || adjustQty <= 0) return;

    await onAdjustStock(selectedProductId, Number(adjustQty), adjustType, adjustReason || 'Routine Entry');
    setShowAdjustModal(false);
  };

  // Low/Out list
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  // Reviews list flatten from products
  const allReviews = products.flatMap(p => 
    (p.reviews || []).map(r => ({
      ...r,
      productId: p.id,
      productName: p.name
    }))
  );

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in" id="inventory-reviews-tab">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-4">
        <button
          onClick={() => { setActiveTab('inventory'); setSearch(''); }}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'inventory' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{isBn ? 'স্টক ইনভেন্টরি লগ' : 'Warehouse Stock Ledger'}</span>
          {activeTab === 'inventory' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>

        <button
          onClick={() => { setActiveTab('reviews'); setSearch(''); }}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'reviews' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isBn ? 'গ্রাহক রিভিউ ও ফিডব্যাক' : 'Feedback Moderation'}</span>
          {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>
      </div>

      {/* =======================================
          INVENTORY TAB
         ======================================= */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{isBn ? 'স্টক ও ইনভেন্টরি ট্র্যাকার' : 'Live Warehouse Inventory Logs'}</h4>
              <p className="text-[10px] text-slate-400 font-bold">{isBn ? 'নতুন পণ্য সরবরাহ, নষ্ট হওয়া পণ্য এবং স্টক পরিবর্তন ট্র্যাকিং।' : 'Track purchase entries, damaged stock records, or adjustment values.'}</p>
            </div>
            <button
              onClick={() => {
                setSelectedProductId(products[0]?.id || '');
                setAdjustQty(10);
                setAdjustType('Purchase Entry');
                setAdjustReason('Periodic Supplier Re-stock');
                setShowAdjustModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Stock Transaction</span>
            </button>
          </div>

          {/* Quick Alert cards */}
          {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outOfStockProducts.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                  <p className="text-rose-800 text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4.5 h-4.5 animate-pulse text-rose-600" />
                    <span>Out of Stock Alerts ({outOfStockProducts.length})</span>
                  </p>
                  <div className="max-h-24 overflow-y-auto text-[11px] font-bold text-rose-700 space-y-1">
                    {outOfStockProducts.map(p => (
                      <p key={p.id}>• {p.name}</p>
                    ))}
                  </div>
                </div>
              )}

              {lowStockProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <p className="text-amber-800 text-xs font-black flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                    <span>Low Stock Warning ({lowStockProducts.length})</span>
                  </p>
                  <div className="max-h-24 overflow-y-auto text-[11px] font-bold text-amber-700 space-y-1">
                    {lowStockProducts.map(p => (
                      <p key={p.id}>• {p.name} (Only {p.stock} units remaining)</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stock History Log ledger */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-black text-slate-400 uppercase flex items-center gap-1">
              <History className="w-4 h-4 text-slate-500" />
              <span>Warehouse Transactions Feed</span>
            </h5>

            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-150 text-[10px] select-none">
                    <th className="py-2.5 px-4 uppercase">Date / Operator</th>
                    <th className="py-2.5 px-4 uppercase">Product Details</th>
                    <th className="py-2.5 px-4 uppercase">Type</th>
                    <th className="py-2.5 px-4 text-center uppercase">Adjustment Qty</th>
                    <th className="py-2.5 px-4 uppercase">Notes / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {inventoryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">No warehouse logs recorded yet.</td>
                    </tr>
                  ) : (
                    inventoryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                          <p>{new Date(log.date || Date.now()).toLocaleString()}</p>
                          <p className="text-slate-400">By: {log.operator || 'System'}</p>
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-800">{log.productName}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            log.type === 'Damage Entry' 
                              ? 'bg-rose-50 text-rose-800 border border-rose-100' 
                              : log.type === 'Purchase Entry' 
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                                : 'bg-slate-100 text-slate-800'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-black text-slate-900">
                          {log.type === 'Damage Entry' ? '-' : '+'}{log.quantity} units
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">{log.reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =======================================
          REVIEWS TAB
         ======================================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">{isBn ? 'গ্রাহক রিভিউ ও মতামত মডারেটর' : 'Customer Review Moderation Panel'}</h4>
            <p className="text-[10px] text-slate-400 font-bold">{isBn ? 'স্টোরে প্রকাশিত কাস্টমার মতামতসমূহ ফিল্টার এবং অ্যাপ্রুভ করুন।' : 'Verify customer reviews, approve ratings, or remove spam.'}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {allReviews.length === 0 ? (
              <p className="py-8 text-center text-slate-400 italic text-xs bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                No customer ratings logged yet.
              </p>
            ) : (
              allReviews.map((rev) => (
                <div key={rev.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3 relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 text-xs">{rev.userName}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{rev.date}</span>
                      <span className="bg-amber-50 text-amber-700 font-black text-[10px] px-1.5 rounded flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{rev.rating}</span>
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-bold text-[11px] italic">"{rev.comment}"</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase">On Product: <span className="text-slate-600 font-extrabold">{rev.productName}</span></p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 shrink-0 justify-end">
                    {rev.approved === false ? (
                      <button
                        onClick={() => onApproveReview(rev.productId, rev.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Review</span>
                      </button>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    )}

                    <button
                      onClick={() => onDeleteReview(rev.productId, rev.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                      title="Spam Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==============================================================
          MODALS
         ============================================================== */}

      {/* Stock Adjust Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <span className="text-xs font-black">Record Stock Transaction</span>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-xs font-bold text-slate-600">
              <div className="space-y-1">
                <label>Select Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.stock})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Transaction Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Purchase Entry">Purchase Entry (+)</option>
                    <option value="Stock Adjustment">Stock Adjustment (+)</option>
                    <option value="Damage Entry">Damage Entry (-)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label>Quantity *</label>
                  <input type="number" required min="1" value={adjustQty} onChange={(e) => setAdjustQty(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800" />
                </div>
              </div>

              <div className="space-y-1">
                <label>Notes / Explanatory Reason *</label>
                <input type="text" required value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. Received from vendor lot A-10" />
              </div>

              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer">Post Transaction</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
