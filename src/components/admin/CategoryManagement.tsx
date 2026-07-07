import React, { useState } from 'react';
import { 
  Folder, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  ChevronRight, 
  Tag, 
  Eye, 
  EyeOff, 
  Sliders 
} from 'lucide-react';
import { Category } from '../../types';

interface CategoryManagementProps {
  categories: Category[];
  onAddCategory: (c: any) => Promise<void>;
  onUpdateCategory: (c: any) => Promise<void>;
  onDeleteCategory: (cId: string) => Promise<void>;
  lang: 'en' | 'bn';
}

export default function CategoryManagement({
  categories = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  lang
}: CategoryManagementProps) {
  const isBn = lang === 'bn';

  // States
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form Fields
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [image, setImage] = useState('');
  const [icon, setIcon] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [enabled, setEnabled] = useState(true);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [subInput, setSubInput] = useState('');

  const handleOpenAdd = () => {
    setFormMode('add');
    setSelectedCategory(null);
    setId('');
    setName('');
    setBanglaName('');
    setImage('https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200');
    setIcon('Folder');
    setDisplayOrder(categories.length + 1);
    setEnabled(true);
    setSubcategories([]);
    setSubInput('');
    setShowForm(true);
  };

  const handleOpenEdit = (c: Category) => {
    setFormMode('edit');
    setSelectedCategory(c);
    setId(c.id);
    setName(c.name);
    setBanglaName(c.banglaName || '');
    setImage(c.image || '');
    setIcon(c.icon || 'Folder');
    setDisplayOrder(c.displayOrder || 1);
    setEnabled(c.enabled !== false);
    setSubcategories(c.subcategories || []);
    setSubInput('');
    setShowForm(true);
  };

  const handleAddSub = () => {
    if (subInput.trim() && !subcategories.includes(subInput.trim())) {
      setSubcategories(old => [...old, subInput.trim()]);
      setSubInput('');
    }
  };

  const handleRemoveSub = (idx: number) => {
    setSubcategories(old => old.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      id: formMode === 'add' ? (id.trim() || name.toLowerCase().replace(/\s+/g, '-')) : id,
      name,
      banglaName,
      image,
      icon,
      displayOrder: Number(displayOrder),
      enabled,
      subcategories
    };

    try {
      if (formMode === 'add') {
        await onAddCategory(payload);
      } else {
        await onUpdateCategory(payload);
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in" id="category-management-module">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <Folder className="w-5 h-5 text-emerald-600" />
            <span>{isBn ? 'ক্যাটাগরি ও সাব-ক্যাটাগরি সুবিন্যাস' : 'Category & Sub-Category Architecture'}</span>
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {isBn 
              ? 'স্টোরের সকল মূল ক্যাটাগরি, উপ-ক্যাটাগরি, আইকন সাজানোর ক্রম পরিবর্তন করুন।' 
              : 'Configure storefront taxonomy, assign display order parameters, active flags, and child sub-categories.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? 'নতুন ক্যাটাগরি' : 'Add Category'}</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className={`bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between space-y-4 relative ${
              cat.enabled !== false ? 'border-slate-150' : 'border-red-200 opacity-70 bg-red-50/10'
            }`}
          >
            {/* Status absolute label */}
            <span className={`absolute top-4 right-4 text-[8px] font-black uppercase px-2 py-0.5 rounded ${
              cat.enabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {cat.enabled !== false ? 'Active' : 'Inactive'}
            </span>

            <div className="flex items-start gap-3.5">
              <img src={cat.image || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=200'} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs" />
              <div>
                <p className="font-extrabold text-slate-800 text-xs sm:text-sm">{cat.name}</p>
                <p className="text-slate-400 text-[10px] font-bold mt-0.5">{cat.banglaName || 'বাংলা নাম নেই'}</p>
                <div className="flex gap-2 text-[10px] text-slate-400 font-bold mt-1">
                  <span>Order: {cat.displayOrder || 0}</span>
                  <span>•</span>
                  <span className="font-mono text-emerald-600">ID: {cat.id}</span>
                </div>
              </div>
            </div>

            {/* Subcategories preview */}
            <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Sub Categories</p>
              {cat.subcategories?.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No subcategories</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.subcategories?.map((sub, sidx) => (
                    <span key={sidx} className="bg-slate-50 border border-slate-150 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                      <ChevronRight className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{sub}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 justify-end">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-black rounded-lg cursor-pointer flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Configure</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Remove entire category "${cat.name}"? This might disconnect related products.`)) {
                    onDeleteCategory(cat.id);
                  }
                }}
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black flex items-center gap-1.5">
                  <Folder className="w-5 h-5 text-emerald-400" />
                  <span>{formMode === 'add' ? 'Construct Category' : 'Configure Category'}</span>
                </h4>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-bold text-slate-600">
              
              <div className="space-y-1.5">
                <label>Category Key ID (e.g. birds, cats) *</label>
                <input
                  type="text" required disabled={formMode === 'edit'} value={id}
                  onChange={(e) => setId(e.target.value.toLowerCase().trim().replace(/\s+/g, '-'))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  placeholder="Only letters and hyphens"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Category English Name *</label>
                  <input
                    type="text" required value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label>Bangla Name *</label>
                  <input
                    type="text" required value={banglaName}
                    onChange={(e) => setBanglaName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Banner Image URL</label>
                  <input
                    type="text" value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label>Lucide Icon Name</label>
                  <input
                    type="text" value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    placeholder="Folder, Tag, Heart etc"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div className="space-y-1">
                  <label>Display Sorting Order</label>
                  <input
                    type="number" min="1" value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer mt-4 font-black">
                  <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="rounded" />
                  <span>Category Enabled</span>
                </label>
              </div>

              {/* Subcategories editor */}
              <div className="border border-slate-200/60 p-4 rounded-2xl bg-slate-50 space-y-3">
                <label className="block text-slate-800">Configure Sub-Categories Collection</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subInput}
                    onChange={(e) => setSubInput(e.target.value)}
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-xl"
                    placeholder="e.g. Dry Seeds, Wet Meat"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSub();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSub}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {subcategories.map((sub, sidx) => (
                    <span key={sidx} className="bg-white border border-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold shadow-xs">
                      <span>{sub}</span>
                      <button type="button" onClick={() => handleRemoveSub(sidx)} className="text-red-500 hover:text-red-700 font-extrabold cursor-pointer">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  Confirm Change
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
