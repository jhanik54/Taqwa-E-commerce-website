import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Printer, 
  Eye, 
  Edit, 
  X, 
  FileText, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertOctagon, 
  Mail, 
  Phone,
  Trash2
} from 'lucide-react';
import { Order } from '../../types';

interface OrderManagementProps {
  orders: Order[];
  onUpdateOrderStatus: (oId: string, status: string, paymentStatus?: 'Pending' | 'Paid') => Promise<void>;
  onDeleteOrder?: (oId: string) => Promise<void>;
  lang: 'en' | 'bn';
}

export default function OrderManagement({
  orders = [],
  onUpdateOrderStatus,
  onDeleteOrder,
  lang
}: OrderManagementProps) {
  const isBn = lang === 'bn';

  // Search/Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase();
    const matchesSearch = 
      o.trackingId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.id && o.id.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
      'Confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'Processing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Shipped': 'bg-purple-100 text-purple-800 border-purple-200',
      'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Cancelled': 'bg-rose-100 text-rose-800 border-rose-200',
      'Refunded': 'bg-slate-100 text-slate-800 border-slate-200',
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status] || 'bg-slate-50 text-slate-500'}`}>
        {status}
      </span>
    );
  };

  const handlePrint = (divId: string) => {
    const printContent = document.getElementById(divId)?.innerHTML;
    const originalContent = document.body.innerHTML;
    if (printContent) {
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Restore React state cleanly
    }
  };

  const handleDownloadInvoice = (o: Order) => {
    alert(isBn ? 'ইনভয়েস পিডিএফ ডাউনলোড শুরু হয়েছে...' : 'Initiating Invoice PDF Render and Download...');
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in" id="order-management-module">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <span>{isBn ? 'গ্রাহক অর্ডার লেজার বুক' : 'Store Order Ledger & Courier Sync'}</span>
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {isBn 
              ? 'অর্ডারের ডেলিভারি অবস্থা পরিবর্তন, ট্র্যাকিং আইডি বরাদ্দ ও চালান প্রিন্ট করুন।' 
              : 'Review invoices, update courier progress markers, process payment verifications, and download invoices.'}
          </p>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isBn ? 'অর্ডার আইডি বা মোবাইল নং দিয়ে খুঁজুন...' : 'Search by tracking ID, customer name, mobile...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none w-full sm:w-auto cursor-pointer"
        >
          <option value="All">{isBn ? 'সব স্ট্যাটাস' : 'All Order Statuses'}</option>
          {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map(st => (
            <option key={st} value={st}>{st.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-150 text-[10px] select-none">
              <th className="py-3 px-4 uppercase">Tracking Code / Date</th>
              <th className="py-3 px-4 uppercase">Customer Identity</th>
              <th className="py-3 px-4 uppercase text-center">Items Qty</th>
              <th className="py-3 px-4 uppercase text-center">Invoiced Total</th>
              <th className="py-3 px-4 uppercase text-center">Payment Status</th>
              <th className="py-3 px-4 uppercase">Delivery Status</th>
              <th className="py-3 px-4 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  {isBn ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No store orders logged yet.'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono">
                    <p className="font-extrabold text-slate-800">{o.trackingId}</p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-slate-800">{o.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{o.customerPhone}</p>
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-500 font-bold">
                    {o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0}
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-emerald-700">
                    ৳{o.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      o.paymentStatus === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-800' 
                        : 'bg-amber-50 text-amber-850'
                    }`}>
                      {o.paymentStatus}
                    </span>
                    {o.paymentTransactionId && (
                      <p className="text-[8px] font-mono text-slate-400 font-bold block mt-0.5">{o.paymentTransactionId}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(o.orderStatus)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex justify-center items-center gap-1">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                        title="Configure Progress"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setInvoiceOrder(o)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer"
                        title="Invoice Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteOrder && (
                        <button
                          onClick={() => {
                            if (confirm(isBn ? `আপনি কি নিশ্চিতভাবে "${o.trackingId}" অর্ডার ডিলিট করতে চান?` : `Are you sure you want to delete order "${o.trackingId}"?`)) {
                              onDeleteOrder(o.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                          title={isBn ? "অর্ডার মুছুন" : "Delete Order History"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 1. VIEW & CHANGE STATUS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black">Configure Order Ledger</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">ID: {selectedOrder.trackingId}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-bold text-slate-600">
              
              <div className="space-y-1">
                <p className="text-slate-400">Order Delivery Status Stage</p>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => onUpdateOrderStatus(selectedOrder.id, e.target.value, selectedOrder.paymentStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'].map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400">Payment Status Marker</p>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => onUpdateOrderStatus(selectedOrder.id, selectedOrder.orderStatus, e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* Delivery info summary */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <p className="text-slate-800 text-[10px] uppercase font-black tracking-wider">Shipment Credentials</p>
                <p className="font-extrabold text-slate-700 flex items-center gap-1">
                  <span>Name:</span>
                  <span className="text-slate-600">{selectedOrder.customerName}</span>
                </p>
                <p className="font-extrabold text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600">{selectedOrder.customerPhone}</span>
                </p>
                <p className="font-extrabold text-slate-700 flex items-start gap-1">
                  <span>Address:</span>
                  <span className="text-slate-500 leading-relaxed">{selectedOrder.shippingAddress}, {selectedOrder.district}</span>
                </p>
              </div>

              {/* Items listing */}
              <div className="space-y-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Ordered Products</p>
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100 text-[11px]">
                      <span className="text-slate-700 font-extrabold truncate max-w-[200px]">{item.productName}</span>
                      <span className="text-slate-500 font-bold">Qty {item.quantity} × ৳{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  type="button" onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Close Settings
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. PRINTABLE INVOICE RECEIPT MODAL */}
      {invoiceOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 animate-scale-up max-h-[90vh] flex flex-col">
            
            <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
              <span className="text-xs font-black flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Invoice Ledger Receipt</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrint('invoice-print-stage')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => handleDownloadInvoice(invoiceOrder)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-black cursor-pointer"
                >
                  Download PDF
                </button>
                <button onClick={() => setInvoiceOrder(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Inner Content Area */}
            <div className="overflow-y-auto p-6" id="invoice-print-stage">
              <div className="space-y-6 text-slate-700 font-medium">
                
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase">Taqwa Enterprise</h2>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">High-Grade Pet food and Care Products</p>
                    <p className="text-[10px] text-slate-500 font-bold">Dhaka, Bangladesh | Phone: 01999999999</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900 text-sm">INVOICE RECEIPT</p>
                    <p className="text-xs font-mono font-bold text-slate-500 mt-1">{invoiceOrder.trackingId}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Date: {new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Billing Addresses Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="space-y-1.5">
                    <p className="text-[9px] text-slate-400 uppercase font-black">Shipment Destination</p>
                    <p className="text-slate-850 text-sm font-extrabold">{invoiceOrder.customerName}</p>
                    <p className="text-slate-600 font-bold">{invoiceOrder.customerPhone}</p>
                    {invoiceOrder.customerEmail && <p className="text-slate-500 font-mono text-[10px]">{invoiceOrder.customerEmail}</p>}
                    <p className="text-slate-500 font-medium leading-relaxed">{invoiceOrder.shippingAddress}, {invoiceOrder.district}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase font-black">Transactional Info</p>
                    <p className="text-slate-700">Payment: <span className="text-slate-850 font-black">{invoiceOrder.paymentMethod}</span></p>
                    <p className="text-slate-700">Status: <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded uppercase">{invoiceOrder.paymentStatus}</span></p>
                    {invoiceOrder.paymentTransactionId && <p className="text-[10px] font-mono text-slate-500 mt-1">TrxID: {invoiceOrder.paymentTransactionId}</p>}
                  </div>
                </div>

                {/* Items Ledger Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 font-black text-slate-500 border-b border-slate-200 text-[10px]">
                        <th className="py-2.5 px-4 uppercase">Description</th>
                        <th className="py-2.5 px-4 text-center uppercase">Price</th>
                        <th className="py-2.5 px-4 text-center uppercase">Qty</th>
                        <th className="py-2.5 px-4 text-right uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 font-semibold text-slate-700">
                      {invoiceOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-4 font-extrabold text-slate-800 max-w-[250px] truncate">{item.productName}</td>
                          <td className="py-2.5 px-4 text-center">৳{item.price}</td>
                          <td className="py-2.5 px-4 text-center font-black">{item.quantity}</td>
                          <td className="py-2.5 px-4 text-right font-extrabold">৳{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Ledger Calculations */}
                <div className="flex justify-end pt-2 text-xs font-bold text-slate-600">
                  <div className="w-56 space-y-2">
                    <div className="flex justify-between">
                      <span>Cart Subtotal</span>
                      <span>৳{invoiceOrder.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Surcharge</span>
                      <span>৳{invoiceOrder.deliveryCharge?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-850 font-black text-sm border-t border-slate-200 pt-2 text-emerald-700">
                      <span>Grand Total Amount</span>
                      <span>৳{invoiceOrder.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Signature line */}
                <div className="pt-8 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <p>Thank you for choosing Taqwa Enterprise!</p>
                  <p>Authorized Signature: _____________________</p>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
