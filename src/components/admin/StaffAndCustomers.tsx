import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Plus, 
  Trash2, 
  Edit, 
  Ban, 
  CheckCircle, 
  X, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  Lock,
  UserCheck
} from 'lucide-react';
import { User, Order } from '../../types';

interface StaffAndCustomersProps {
  users: any[];
  orders: Order[];
  onAddUser: (u: any) => Promise<void>;
  onUpdateUserRole: (uId: string, role: string, permissions?: string[]) => Promise<void>;
  onToggleUserStatus: (uId: string, status: 'Active' | 'Inactive' | 'Banned') => Promise<void>;
  onDeleteUser: (uId: string) => Promise<void>;
  lang: 'en' | 'bn';
}

export default function StaffAndCustomers({
  users = [],
  orders = [],
  onAddUser,
  onUpdateUserRole,
  onToggleUserStatus,
  onDeleteUser,
  lang
}: StaffAndCustomersProps) {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'customers' | 'staff'>('customers');

  // Search/Filters
  const [search, setSearch] = useState('');

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [profileCustomer, setProfileCustomer] = useState<any | null>(null);

  // User form states
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<'Admin' | 'Manager' | 'Editor' | 'Viewer'>('Admin');

  // Permission selection
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['read_products', 'read_orders']);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    await onAddUser({
      id: `user-${Date.now()}`,
      name: userName,
      email: userEmail.trim().toLowerCase(),
      phone: userPhone,
      role: userRole,
      status: 'Active',
      joinedAt: new Date().toISOString(),
      permissions: selectedPermissions,
      avatar: `https://images.unsplash.com/photo-${['1534528741775-53994a69daeb', '1507003211169-0a1dd7228f2d', '1500648767791-00dcc994a43e'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&q=80&w=200`
    });
    setShowUserModal(false);
  };

  const handleTogglePerm = (perm: string) => {
    setSelectedPermissions(old => 
      old.includes(perm) ? old.filter(p => p !== perm) : [...old, perm]
    );
  };

  const customersList = users.filter(u => u.role === 'Customer');
  const staffList = users.filter(u => u.role !== 'Customer');

  const filteredUsers = (activeTab === 'customers' ? customersList : staffList).filter(u => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
  });

  // Calculate Customer Stats
  const getCustomerStats = (email: string) => {
    const custOrders = orders.filter(o => o.customerEmail?.toLowerCase() === email.toLowerCase());
    const totalSpent = custOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      orderCount: custOrders.length,
      totalSpent,
      lastOrderDate: custOrders.length > 0 ? new Date(custOrders[0].createdAt).toLocaleDateString() : 'Never'
    };
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in" id="users-staff-tab">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-100 gap-4">
        <button
          onClick={() => { setActiveTab('customers'); setSearch(''); }}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'customers' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isBn ? 'গ্রাহক তালিকা' : 'Registered Customers'}</span>
          {activeTab === 'customers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>

        <button
          onClick={() => { setActiveTab('staff'); setSearch(''); }}
          className={`pb-3 text-xs font-black flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'staff' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>{isBn ? 'অ্যাডমিন ও স্টাফ প্যানেল' : 'Super & Sub Admins / Staff'}</span>
          {activeTab === 'staff' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>}
        </button>
      </div>

      {/* Action Area */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'customers' ? 'Search customers by name, phone...' : 'Search admins/managers...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        {activeTab === 'staff' && (
          <button
            onClick={() => {
              setUserName('');
              setUserEmail('');
              setUserPhone('');
              setUserRole('Admin');
              setSelectedPermissions(['read_products', 'read_orders', 'write_products']);
              setShowUserModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-1 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Staff / Admin</span>
          </button>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((u) => {
          const stats = getCustomerStats(u.email);
          return (
            <div key={u.id} className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between space-y-4 relative">
              <span className={`absolute top-4 right-4 text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                u.status === 'Banned' ? 'bg-red-100 text-red-850' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {u.status || 'Active'}
              </span>

              <div className="flex items-start gap-3">
                <img src={u.avatar || 'https://images.unsplash.com/photo-1535268647977-a403b69fc756?auto=format&fit=crop&q=80&w=200'} className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs shrink-0" />
                <div className="truncate">
                  <p className="font-extrabold text-slate-800 text-xs sm:text-sm truncate">{u.name}</p>
                  <p className="text-emerald-700 text-[10px] font-black uppercase tracking-wider">{u.role}</p>
                  <p className="text-slate-400 font-mono text-[10px] truncate mt-0.5">{u.email}</p>
                  <p className="text-slate-400 text-[10px] font-semibold">{u.phone || 'No Phone'}</p>
                </div>
              </div>

              {activeTab === 'customers' ? (
                <div className="bg-white p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
                  <div>
                    <p className="text-slate-400">Total Spent</p>
                    <p className="text-slate-800 font-black">৳{stats.totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Orders Total</p>
                    <p className="text-slate-800 font-black">{stats.orderCount} Orders</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Assigned Rights</p>
                  <div className="flex flex-wrap gap-1">
                    {(u.permissions || ['read_catalog', 'process_orders']).map((p: string, pidx: number) => (
                      <span key={pidx} className="bg-slate-50 border border-slate-200 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400">Joined: {new Date(u.joinedAt || '2026-01-01').toLocaleDateString()}</span>
                <div className="flex gap-1">
                  {activeTab === 'customers' && (
                    <button
                      onClick={() => setProfileCustomer(u)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700 cursor-pointer flex items-center gap-0.5"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Profile</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const targetStatus = u.status === 'Banned' ? 'Active' : 'Banned';
                      if (confirm(`Change status of "${u.name}" to ${targetStatus}?`)) {
                        onToggleUserStatus(u.id, targetStatus);
                      }
                    }}
                    className={`p-1 rounded cursor-pointer ${
                      u.status === 'Banned' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                    title={u.status === 'Banned' ? 'Unban' : 'Ban User'}
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Permanently wipe user "${u.name}" account logs from system?`)) {
                        onDeleteUser(u.id);
                      }
                    }}
                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ==============================================================
          MODALS
         ============================================================== */}

      {/* 1. Add Staff Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <span className="text-xs font-black">Register Staff Identity</span>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs font-bold text-slate-600">
              <div className="space-y-1">
                <label>Staff English Name *</label>
                <input type="text" required value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label>Email Address Identity *</label>
                <input type="email" required value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Contact Phone</label>
                  <input type="text" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label>Sub Role assignment</label>
                  <select value={userRole} onChange={(e) => setUserRole(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </div>

              {/* Rights Matrix Checklist */}
              <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50 space-y-2">
                <label className="block text-slate-800">Rights Assignment Matrix</label>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  {[
                    { id: 'write_products', label: 'Create/Edit Products' },
                    { id: 'delete_products', label: 'Purge Warehouse Catalog' },
                    { id: 'process_orders', label: 'Process Order Couriers' },
                    { id: 'manage_coupons', label: 'Generate Promo Codes' },
                    { id: 'view_reports', label: 'Examine Sales Analytics' },
                    { id: 'system_settings', label: 'Configure Core Charges' }
                  ].map(perm => (
                    <label key={perm.id} className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700">
                      <input 
                        type="checkbox" 
                        checked={selectedPermissions.includes(perm.id)} 
                        onChange={() => handleTogglePerm(perm.id)} 
                        className="rounded" 
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer">Register Identity</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Customer Profile Detail Modal */}
      {profileCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <span className="text-xs font-black">Customer Profile Card</span>
              <button onClick={() => setProfileCustomer(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-3">
                <img src={profileCustomer.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow" />
                <div>
                  <h5 className="text-sm font-black text-slate-800">{profileCustomer.name}</h5>
                  <p className="text-slate-400 font-semibold">{profileCustomer.phone || 'No Phone Number'}</p>
                  <p className="text-slate-400 font-mono">{profileCustomer.email}</p>
                </div>
              </div>

              {/* Addresses if any */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Registered Shipping Addresses</p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <p className="font-extrabold text-slate-700 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Home Destination Address</span>
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    {profileCustomer.addresses && profileCustomer.addresses.length > 0 
                      ? `${profileCustomer.addresses[0].addressLine}, ${profileCustomer.addresses[0].district}`
                      : 'House 43, Road 12, Mirpur 10, Dhaka'}
                  </p>
                </div>
              </div>

              {/* Order History ledger */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black">Recent Order History</p>
                <div className="border border-slate-150 rounded-2xl overflow-hidden text-[11px]">
                  {orders.filter(o => o.customerEmail?.toLowerCase() === profileCustomer.email.toLowerCase()).length === 0 ? (
                    <p className="p-3 text-center text-slate-400 italic">No orders logged.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {orders
                        .filter(o => o.customerEmail?.toLowerCase() === profileCustomer.email.toLowerCase())
                        .map(o => (
                          <div key={o.id} className="p-2.5 flex justify-between items-center bg-slate-50 hover:bg-slate-100">
                            <div>
                              <p className="font-black text-slate-800">{o.trackingId}</p>
                              <p className="text-[9px] text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className="font-extrabold text-emerald-700">৳{o.totalAmount}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
