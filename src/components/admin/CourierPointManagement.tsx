import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  Building2, 
  Layers, 
  RefreshCw, 
  X, 
  Save, 
  Check, 
  SlidersHorizontal,
  Navigation,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { CourierPoint } from '../../types';

interface CourierPointManagementProps {
  lang: 'en' | 'bn';
  onPointsUpdated?: () => void;
}

const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Chattogram', 'Gazipur', 'Narayanganj', 'Sylhet', 
  'Rajshahi', 'Khulna', 'Cumilla', 'Barishal', 'Rangpur', 
  'Mymensingh', 'Bogura', 'Cox\'s Bazar', 'Jashore', 'Tangail', 
  'Kushtia', 'Dinajpur', 'Feni', 'Noakhali', 'Brahmanbaria', 'All'
];

const COURIER_SERVICES = [
  { id: 'Sundarban', label: 'Sundarban Courier (সুন্দরবন)', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'Steadfast', label: 'Steadfast Courier (স্টেডফাস্ট)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'Pathao', label: 'Pathao Logistics (পাঠাও)', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { id: 'RedX', label: 'RedX Delivery (রেডেক্স)', color: 'bg-red-50 text-red-800 border-red-200' },
  { id: 'Janani', label: 'Janani Express (জননী)', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'SA Paribahan', label: 'SA Paribahan (এস এ পরিবহন)', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'Paperfly', label: 'Paperfly (পেপারফ্লাই)', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  { id: 'In-House Rider', label: 'In-House Rider (নিজস্ব রাইডার)', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: 'Other', label: 'Other Courier (অন্যান্য)', color: 'bg-slate-50 text-slate-800 border-slate-200' }
];

export default function CourierPointManagement({ lang, onPointsUpdated }: CourierPointManagementProps) {
  const isBn = lang === 'bn';

  // State
  const [points, setPoints] = useState<CourierPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCourier, setSelectedCourier] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPoint, setEditingPoint] = useState<CourierPoint | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formContact, setFormContact] = useState<string>('');
  const [formCourier, setFormCourier] = useState<string>('Sundarban');
  const [formDistrict, setFormDistrict] = useState<string>('Dhaka');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formNotes, setFormNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch points from API
  const fetchPoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/courier-points');
      if (!res.ok) throw new Error('Failed to load courier points');
      const data = await res.json();
      setPoints(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching courier points:', err);
      setError(err.message || 'Error loading points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Open modal for Adding
  const handleOpenAddModal = () => {
    setEditingPoint(null);
    setFormName('');
    setFormAddress('');
    setFormContact('');
    setFormCourier('Sundarban');
    setFormDistrict('Dhaka');
    setFormIsActive(true);
    setFormNotes('');
    setIsModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEditModal = (point: CourierPoint) => {
    setEditingPoint(point);
    setFormName(point.name || '');
    setFormAddress(point.address || '');
    setFormContact(point.contact || '');
    setFormCourier(point.courier || 'Sundarban');
    setFormDistrict(point.district || 'Dhaka');
    setFormIsActive(point.isActive !== false);
    setFormNotes(point.notes || '');
    setIsModalOpen(true);
  };

  // Submit Add or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim() || !formContact.trim()) {
      alert(isBn ? 'অনুগ্রহ করে পয়েন্টের নাম, ঠিকানা ও যোগাযোগের ফোন নম্বর লিখুন' : 'Please provide Point Name, Address, and Contact Number');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        address: formAddress.trim(),
        contact: formContact.trim(),
        courier: formCourier,
        district: formDistrict,
        isActive: formIsActive,
        notes: formNotes.trim()
      };

      if (editingPoint) {
        // Edit
        const res = await fetch(`/api/admin/courier-points/${editingPoint.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update courier point');
        showNotification(isBn ? 'কুরিয়ার পয়েন্ট সফলভাবে হালনাগাদ করা হয়েছে' : 'Courier point updated successfully');
      } else {
        // Add
        const res = await fetch('/api/admin/courier-points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to add courier point');
        showNotification(isBn ? 'নতুন কুরিয়ার পয়েন্ট সফলভাবে যুক্ত হয়েছে' : 'New courier point added successfully');
      }

      setIsModalOpen(false);
      await fetchPoints();
      if (onPointsUpdated) onPointsUpdated();
    } catch (err: any) {
      console.error('Error saving courier point:', err);
      alert(err.message || 'Error saving courier point');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick toggle active / inactive
  const handleToggleActive = async (point: CourierPoint) => {
    try {
      // Optimistic update
      setPoints(prev => prev.map(p => p.id === point.id ? { ...p, isActive: !p.isActive } : p));

      const res = await fetch(`/api/admin/courier-points/toggle/${point.id}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      
      const newStatus = !point.isActive;
      showNotification(
        isBn 
          ? `পয়েন্টটি এখন চেকআউটে ${newStatus ? 'সক্রিয় (দৃশ্যমান)' : 'নিষ্ক্রিয় (লুকানো)'}` 
          : `Point is now ${newStatus ? 'Active' : 'Inactive'} for checkout`
      );
      if (onPointsUpdated) onPointsUpdated();
    } catch (err: any) {
      console.error('Error toggling point status:', err);
      fetchPoints(); // Revert
      alert('Failed to update status');
    }
  };

  // Delete courier point
  const handleDeletePoint = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/courier-points/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete courier point');
      showNotification(isBn ? 'কুরিয়ার পয়েন্ট মুছে ফেলা হয়েছে' : 'Courier point deleted successfully');
      setDeleteConfirmId(null);
      await fetchPoints();
      if (onPointsUpdated) onPointsUpdated();
    } catch (err: any) {
      console.error('Error deleting point:', err);
      alert('Failed to delete courier point');
    }
  };

  // Restore defaults
  const handleResetDefaults = async () => {
    const confirmMsg = isBn 
      ? 'আপনি কি সব ডিফল্ট কুরিয়ার পয়েন্ট রিস্টোর করতে চান? এটি সাধারণ শাখাগুলো পুনরায় লোড করবে।' 
      : 'Are you sure you want to reset/restore the standard default courier points?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      const res = await fetch('/api/admin/courier-points/seed-defaults', {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to seed default points');
      showNotification(isBn ? 'ডিফল্ট কুরিয়ার পয়েন্ট সফলভাবে রিস্টোর হয়েছে' : 'Default courier points restored successfully');
      await fetchPoints();
      if (onPointsUpdated) onPointsUpdated();
    } catch (err: any) {
      console.error('Error resetting points:', err);
      alert('Failed to reset default points');
    } finally {
      setLoading(false);
    }
  };

  // Filtered list
  const filteredPoints = points.filter(p => {
    // Courier filter
    if (selectedCourier !== 'All' && p.courier !== selectedCourier) {
      return false;
    }
    // District filter
    if (selectedDistrict !== 'All' && p.district !== selectedDistrict && p.district !== 'All') {
      return false;
    }
    // Status filter
    if (statusFilter === 'Active' && p.isActive === false) {
      return false;
    }
    if (statusFilter === 'Inactive' && p.isActive !== false) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchAddress = (p.address || '').toLowerCase().includes(q);
      const matchContact = (p.contact || '').toLowerCase().includes(q);
      const matchCourier = (p.courier || '').toLowerCase().includes(q);
      const matchDistrict = (p.district || '').toLowerCase().includes(q);
      return matchName || matchAddress || matchContact || matchCourier || matchDistrict;
    }
    return true;
  });

  // KPI Calculations
  const totalCount = points.length;
  const activeCount = points.filter(p => p.isActive !== false).length;
  const inactiveCount = totalCount - activeCount;
  const uniqueCouriersCount = new Set(points.map(p => p.courier)).size;

  const getCourierBadge = (courierName: string) => {
    const found = COURIER_SERVICES.find(c => c.id.toLowerCase() === (courierName || '').toLowerCase());
    return found ? found.color : 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6" id="courier-point-management-root">
      
      {/* Toast Notification */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-emerald-100 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-2 text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header & Summary Stats */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {isBn ? 'কুরিয়ার পয়েন্ট ও শাখা হাব ব্যবস্থাপনা' : 'Courier Points & Branch Hubs Management'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isBn 
                    ? 'চেকআউট পেজে গ্রাহকদের জন্য সক্রিয় কুরিয়ার পয়েন্টের তালিকা (নাম, ঠিকানা ও যোগাযোগ) পরিচালনা ও সম্পাদন করুন' 
                    : 'Manage and edit the active courier points (name, address, contact) available for customer selection during checkout.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleResetDefaults}
              title={isBn ? 'ডিফল্ট শাখা রিস্টোর' : 'Restore Default Points'}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>{isBn ? 'ডিফল্ট রিস্টোর' : 'Reset Defaults'}</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-sm shadow-emerald-200 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন পয়েন্ট যোগ করুন' : 'Add New Point'}</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isBn ? 'মোট কুরিয়ার পয়েন্ট' : 'Total Points'}</span>
            </p>
            <p className="text-xl font-black text-slate-900 mt-1">{totalCount}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{isBn ? 'ডাটাবেজে সংরক্ষিত' : 'Registered in DB'}</p>
          </div>

          <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-200/60">
            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBn ? 'চেকআউটে সক্রিয়' : 'Active in Checkout'}</span>
            </p>
            <p className="text-xl font-black text-emerald-700 mt-1">{activeCount}</p>
            <p className="text-[10px] text-emerald-600/80 font-semibold mt-0.5">{isBn ? 'গ্রাহকদের জন্য উন্মুক্ত' : 'Available for selection'}</p>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/60">
            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{isBn ? 'নিষ্ক্রিয় পয়েন্ট' : 'Inactive Points'}</span>
            </p>
            <p className="text-xl font-black text-amber-800 mt-1">{inactiveCount}</p>
            <p className="text-[10px] text-amber-600/80 font-semibold mt-0.5">{isBn ? 'চেকআউট থেকে লুকানো' : 'Hidden from checkout'}</p>
          </div>

          <div className="bg-blue-50/60 rounded-2xl p-3.5 border border-blue-200/60">
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>{isBn ? 'কুরিয়ার নেটওয়ার্ক' : 'Couriers Linked'}</span>
            </p>
            <p className="text-xl font-black text-blue-800 mt-1">{uniqueCouriersCount}</p>
            <p className="text-[10px] text-blue-600/80 font-semibold mt-0.5">{isBn ? 'সুন্দরবন, স্টেডফাস্ট ইত্যাদি' : 'Major BD services'}</p>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'পয়েন্টের নাম, ঠিকানা, ফোন নম্বর বা জেলা দিয়ে খুঁজুন...' : 'Search by point name, address, phone or district...'}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Courier Filter */}
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-hidden focus:border-emerald-500"
            >
              <option value="All">{isBn ? 'সব কুরিয়ার (All Couriers)' : 'All Couriers'}</option>
              {COURIER_SERVICES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            {/* District Filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs font-bold py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-hidden focus:border-emerald-500"
            >
              <option value="All">{isBn ? 'সব জেলা (All Districts)' : 'All Districts'}</option>
              {BANGLADESH_DISTRICTS.filter(d => d !== 'All').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Status Filter */}
            <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setStatusFilter('All')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'All' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isBn ? 'সব' : 'All'}
              </button>
              <button
                onClick={() => setStatusFilter('Active')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'Active' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-slate-500 hover:text-emerald-700'
                }`}
              >
                {isBn ? 'সক্রিয়' : 'Active'}
              </button>
              <button
                onClick={() => setStatusFilter('Inactive')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'Inactive' ? 'bg-amber-600 text-white shadow-xs font-black' : 'text-slate-500 hover:text-amber-700'
                }`}
              >
                {isBn ? 'নিষ্ক্রিয়' : 'Inactive'}
              </button>
            </div>

          </div>

        </div>

        {/* Results summary counter */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1 pt-1 border-t border-slate-100">
          <span>
            {isBn 
              ? `${filteredPoints.length}টি কুরিয়ার পয়েন্ট দেখানো হচ্ছে` 
              : `Showing ${filteredPoints.length} courier points`}
          </span>
          {(selectedCourier !== 'All' || selectedDistrict !== 'All' || statusFilter !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCourier('All');
                setSelectedDistrict('All');
                setStatusFilter('All');
                setSearchQuery('');
              }}
              className="text-emerald-600 hover:underline font-bold"
            >
              {isBn ? 'সব ফিল্টার মুছুন' : 'Clear All Filters'}
            </button>
          )}
        </div>
      </div>

      {/* 3. Courier Points List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">
            {isBn ? 'কুরিয়ার পয়েন্ট তালিকা লোড হচ্ছে...' : 'Loading courier points...'}
          </p>
        </div>
      ) : filteredPoints.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800">
              {isBn ? 'কোনো কুরিয়ার পয়েন্ট পাওয়া যায়নি' : 'No Courier Points Found'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {isBn 
                ? 'আপনার সার্চ বা ফিল্টারের সাথে কোনো পয়েন্ট মিলছে না। নতুন পয়েন্ট যোগ করুন অথবা ফিল্টার রিসেট করুন।' 
                : 'No points matched your search query or filters. Add a new point or reset filters.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              {isBn ? 'নতুন পয়েন্ট যোগ করুন' : 'Add Courier Point'}
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              {isBn ? 'ডিফল্ট শাখা রিস্টোর' : 'Restore Defaults'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPoints.map((point) => {
            const isActive = point.isActive !== false;
            return (
              <div 
                key={point.id}
                className={`bg-white rounded-2xl p-4 border transition-all hover:shadow-md flex flex-col justify-between ${
                  isActive 
                    ? 'border-slate-200 hover:border-emerald-300' 
                    : 'border-slate-200/60 bg-slate-50/60 opacity-80'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Card Header: Courier Badge + Active Status Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black border ${getCourierBadge(point.courier)}`}>
                      <Truck className="w-3 h-3 shrink-0" />
                      <span>{point.courier}</span>
                    </span>

                    {/* Active toggle button */}
                    <button
                      onClick={() => handleToggleActive(point)}
                      title={isActive ? (isBn ? 'চেকআউট থেকে নিষ্ক্রিয় করুন' : 'Deactivate in checkout') : (isBn ? 'চেকআউটে সক্রিয় করুন' : 'Activate in checkout')}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isBn ? 'সক্রিয় (Active)' : 'Active'}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-500" />
                          <span>{isBn ? 'নিষ্ক্রিয় (Hidden)' : 'Inactive'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Point Name & District */}
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                      {point.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                        📍 {point.district || 'All Districts'}
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="text-xs text-slate-600 font-medium flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{point.address}</span>
                  </div>

                  {/* Contact Phone */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                      <Phone className="w-3 h-3" />
                    </div>
                    <a 
                      href={`tel:${point.contact}`}
                      className="hover:text-emerald-600 transition-colors"
                      title={isBn ? 'কল করুন' : 'Call branch'}
                    >
                      {point.contact}
                    </a>
                  </div>

                  {/* Notes / Timing if any */}
                  {point.notes && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{point.notes}</span>
                    </div>
                  )}

                </div>

                {/* Card Actions Footer */}
                <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(point)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      {isActive ? (isBn ? 'বন্ধ করুন' : 'Turn Off') : (isBn ? 'চালু করুন' : 'Turn On')}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(point)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                      title={isBn ? 'সম্পাদনা করুন' : 'Edit point'}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {deleteConfirmId === point.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                        <button
                          onClick={() => handleDeletePoint(point.id)}
                          className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black hover:bg-red-700"
                        >
                          {isBn ? 'হ্যাঁ, মুছুন' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-slate-600 text-[10px] font-bold hover:text-slate-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(point.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                        title={isBn ? 'মুছে ফেলুন' : 'Delete point'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. Add / Edit Courier Point Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingPoint 
                      ? (isBn ? 'কুরিয়ার পয়েন্ট সম্পাদনা করুন' : 'Edit Courier Point') 
                      : (isBn ? 'নতুন কুরিয়ার পয়েন্ট যুক্ত করুন' : 'Add New Courier Point')}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isBn 
                      ? 'চেকআউট ড্রপডাউনে প্রদর্শনের জন্য পয়েন্টের সঠিক তথ্য পূরণ করুন' 
                      : 'Provide accurate point details to show in customer checkout selection'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4">
              
              {/* Point Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {isBn ? 'পয়েন্ট / শাখার নাম *' : 'Point / Branch Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={isBn ? 'যেমন: সুন্দরবন কুরিয়ার - মতিঝিল কর্পোরেট শাখা' : 'e.g. Sundarban Courier - Motijheel Branch'}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Courier Service & District (2 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {isBn ? 'কুরিয়ার কোম্পানি *' : 'Courier Service *'}
                  </label>
                  <select
                    value={formCourier}
                    onChange={(e) => setFormCourier(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold cursor-pointer focus:outline-hidden focus:border-emerald-500"
                  >
                    {COURIER_SERVICES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {isBn ? 'জেলা (District) *' : 'District *'}
                  </label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold cursor-pointer focus:outline-hidden focus:border-emerald-500"
                  >
                    {BANGLADESH_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {isBn ? 'বিস্তারিত ঠিকানা *' : 'Detailed Branch Address *'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder={isBn ? 'যেমন: ২৪ দিলকুশা বাণিজ্যিক এলাকা, মতিঝিল, ঢাকা' : 'e.g. 24 Dilkusha C/A, Motijheel, Dhaka'}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {isBn ? 'যোগাযোগের মোবাইল / ফোন নম্বর *' : 'Contact Phone Number *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder={isBn ? 'যেমন: 01711-592001, 01904-445566' : 'e.g. 01711-592001, 01904-445566'}
                    className="w-full pl-9 pr-3 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Notes / Timing (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{isBn ? 'শাখার সময়সূচি বা নির্দেশনা (ঐচ্ছিক)' : 'Working Hours / Special Notes (Optional)'}</span>
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={isBn ? 'যেমন: সকাল ৯:০০ - রাত ৮:০০ পর্যন্ত খোলা' : 'e.g. 9:00 AM - 8:00 PM (Closed Friday)'}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Active Switch */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isBn ? 'চেকআউট অপশনে এই পয়েন্টটি সক্রিয় রাখুন' : 'Keep this point active in checkout'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {isBn ? 'টিক দেওয়া থাকলে গ্রাহকরা অর্ডার করার সময় এটি নির্বাচন করতে পারবেন' : 'When checked, customers can choose this hub/point during checkout.'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-2 transition-all shadow-sm shadow-emerald-200 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {editingPoint 
                      ? (isBn ? 'হালনাগাদ সংরক্ষণ করুন' : 'Save Changes') 
                      : (isBn ? 'পয়েন্ট সংরক্ষণ করুন' : 'Save Point')}
                  </span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
