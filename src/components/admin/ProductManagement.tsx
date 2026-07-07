import React, { useState } from 'react';
import { 
  Box, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Tag, 
  X, 
  AlertTriangle,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { Product } from '../../types';

interface ProductManagementProps {
  products: Product[];
  categories: any[];
  brands: any[];
  onAddProduct: (pData: any) => Promise<void>;
  onUpdateProduct: (pData: any) => Promise<void>;
  onDeleteProduct: (pId: string) => Promise<void>;
  onDuplicateProduct: (pId: string) => Promise<void>;
  lang: 'en' | 'bn';
}

export default function ProductManagement({
  products = [],
  categories = [],
  brands = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onDuplicateProduct,
  lang
}: ProductManagementProps) {
  const isBn = lang === 'bn';

  // State Management
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Form Field States
  const [name, setName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [category, setCategory] = useState('birds');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [weight, setWeight] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // Advanced features
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [flashSale, setFlashSale] = useState(false);
  const [active, setActive] = useState(true);

  // Gallery Lists
  const [primaryImage, setPrimaryImage] = useState('');
  const [imagesGallery, setImagesGallery] = useState<string[]>([]);
  const [videosGallery, setVideosGallery] = useState<string[]>([]);

  // Cloudinary Upload Simulation
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [cloudinaryStatus, setCloudinaryStatus] = useState('');

  // Bulk operation triggers
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');

  // Premium modal confirmation state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'delete' | 'duplicate' | 'generic';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'generic',
    onConfirm: () => {}
  });

  // Generate Slug automatically on name change
  const handleNameChange = (val: string) => {
    setName(val);
    if (formMode === 'add') {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  // Open Form for Adding
  const handleOpenAdd = () => {
    setFormMode('add');
    setSelectedProduct(null);
    setName('');
    setBanglaName('');
    setSlug('');
    setSku(`TQW-${Math.floor(100000 + Math.random() * 900000)}`);
    setBarcode(`${Math.floor(100000000000 + Math.random() * 900000000000)}`);
    setShortDesc('');
    setFullDesc('');
    setCategory('birds');
    setSubcategory('');
    setBrand('');
    setPrice(100);
    setDiscountPrice(90);
    setStock(20);
    setWeight('1 Kg');
    setTagsInput('bird, seed');
    setFeatured(false);
    setBestSeller(false);
    setNewArrival(true);
    setFlashSale(false);
    setActive(true);
    setPrimaryImage('https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600');
    setImagesGallery([]);
    setVideosGallery([]);
    setShowForm(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (p: Product) => {
    setFormMode('edit');
    setSelectedProduct(p);
    setName(p.name);
    setBanglaName(p.banglaName || '');
    setSlug(p.slug || p.id);
    setSku(p.sku || `TQW-${Math.floor(100000 + Math.random() * 900000)}`);
    setBarcode(p.barcode || '');
    setShortDesc(p.shortDescription || p.description?.slice(0, 80) || '');
    setFullDesc(p.fullDescription || p.description || '');
    setCategory(p.category);
    setSubcategory(p.subcategory || '');
    setBrand(p.brand || '');
    setPrice(p.price);
    setDiscountPrice(p.originalPrice);
    setStock(p.stock);
    setWeight(p.weight || '');
    setTagsInput(p.tags ? p.tags.join(', ') : '');
    setFeatured(p.featured || false);
    setBestSeller(p.bestSeller || false);
    setNewArrival(p.newArrival || false);
    setFlashSale(p.flashSale || false);
    setActive(p.active !== false);
    setPrimaryImage(p.image);
    setImagesGallery(p.imagesGallery || []);
    setVideosGallery(p.videosGallery || []);
    setShowForm(true);
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0 || stock < 0) {
      alert(isBn ? 'অনুগ্রহ করে সঠিক তথ্য প্রদান করুন!' : 'Please enter valid details.');
      return;
    }

    const tagsArr = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const payload = {
      id: selectedProduct?.id || `prod-${Date.now()}`,
      name,
      banglaName,
      slug,
      sku,
      barcode,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      description: fullDesc || shortDesc,
      banglaDescription: isBn ? fullDesc : 'তাকওয়া প্রিমিয়াম পণ্য বিবরণী',
      category,
      subcategory,
      brand,
      price: Number(price),
      originalPrice: Number(discountPrice || price),
      stock: Number(stock),
      weight,
      tags: tagsArr,
      featured,
      bestSeller,
      newArrival,
      flashSale,
      active,
      image: primaryImage,
      imagesGallery: imagesGallery.length > 0 ? imagesGallery : [primaryImage],
      videosGallery,
      rating: selectedProduct?.rating || 4.8,
      reviewsCount: selectedProduct?.reviewsCount || 0,
      reviews: selectedProduct?.reviews || []
    };

    try {
      if (formMode === 'add') {
        await onAddProduct(payload);
      } else {
        await onUpdateProduct(payload);
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Real Cloudinary and Canvas-Compressed Upload Handler with Local Sandbox Fallback
  const handleCloudinaryUpload = (type: 'image' | 'video' | 'gallery') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'video' ? 'video/*' : 'image/*';
    
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadProgress(0);
      setCloudinaryStatus(isBn ? 'চিত্র সংকুচিত করা হচ্ছে...' : 'Compressing image...');

      try {
        const { uploadImage } = await import('../../lib/cloudinary');
        
        const url = await uploadImage(file, {
          onProgress: (percent) => {
            setUploadProgress(percent);
            setCloudinaryStatus(
              percent < 100 
                ? (isBn ? `আপলোড হচ্ছে: ${percent}%` : `Uploading: ${percent}%`)
                : (isBn ? 'সম্পন্ন হচ্ছে...' : 'Finalizing...')
            );
          },
          compress: type !== 'video'
        });

        setUploadProgress(null);
        setCloudinaryStatus('');

        if (type === 'image') {
          setPrimaryImage(url);
        } else if (type === 'gallery') {
          setImagesGallery(old => [...old, url]);
        } else {
          setVideosGallery(old => [...old, url]);
        }
      } catch (err: any) {
        setUploadProgress(null);
        setCloudinaryStatus('');
        alert(isBn ? `আপলোড ব্যর্থ হয়েছে: ${err.message}` : `Upload failed: ${err.message}`);
      }
    };

    input.click();
  };

  // Bulk Export CSV
  const handleBulkExport = () => {
    const headers = 'ID,Name,SKU,Category,Subcategory,RegularPrice,DiscountPrice,Stock,Weight,Tags,Featured,Active\n';
    const rows = products.map(p => 
      `"${p.id}","${p.name}","${p.sku || ''}","${p.category}","${p.subcategory || ''}",${p.price},${p.originalPrice || p.price},${p.stock},"${p.weight || ''}","${p.tags ? p.tags.join(',') : ''}",${p.featured || false},${p.active !== false}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Taqwa_Products_Catalog_${Date.now()}.csv`;
    link.click();
  };

  // Bulk Import Products (JSON)
  const handleBulkImportSubmit = async () => {
    if (!bulkImportText.trim()) return;
    try {
      const parsed = JSON.parse(bulkImportText.trim());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      
      for (const item of items) {
        await onAddProduct({
          id: item.id || `prod-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          name: item.name || 'Imported Product',
          banglaName: item.banglaName || 'আমদানিকৃত পণ্য',
          price: Number(item.price) || 100,
          originalPrice: Number(item.originalPrice) || 100,
          stock: Number(item.stock) || 10,
          category: item.category || 'accessories',
          image: item.image || 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=600',
          tags: Array.isArray(item.tags) ? item.tags : [],
          reviews: []
        });
      }
      setShowBulkImport(false);
      setBulkImportText('');
      alert(isBn ? 'সফলভাবে বাল্ক ইম্পোর্ট করা হয়েছে!' : 'Bulk Import parsed and saved successfully!');
    } catch (e: any) {
      alert(`Invalid JSON: ${e.message}`);
    }
  };

  // Filter and Sort Calculations
  const filteredProducts = products.filter(p => {
    const query = search.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(query) ||
      (p.banglaName && p.banglaName.toLowerCase().includes(query)) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.barcode && p.barcode.includes(query)) ||
      p.tags.some(t => t.toLowerCase().includes(query));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let fieldA: any = a[sortBy];
    let fieldB: any = b[sortBy];

    if (typeof fieldA === 'string') {
      return sortOrder === 'asc' 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    } else {
      return sortOrder === 'asc' 
        ? (fieldA || 0) - (fieldB || 0) 
        : (fieldB || 0) - (fieldA || 0);
    }
  });

  const toggleSort = (field: 'name' | 'price' | 'stock') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6 animate-fade-in" id="product-editor-workspace">
        {/* Breadcrumb Navigation bar */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white p-3.5 rounded-2xl border border-slate-150 shadow-xxs select-none">
          <button type="button" onClick={() => setShowForm(false)} className="hover:text-emerald-600 cursor-pointer">Products Catalog</button>
          <span>/</span>
          <span className="text-slate-700">{formMode === 'add' ? 'Add New Product' : `Edit Product Settings (${sku || 'N/A'})`}</span>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-150">
          {/* Editor Header */}
          <div className="bg-slate-900 text-white px-6 py-4.5 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black flex items-center gap-1.5">
                <Box className="w-5 h-5 text-emerald-400" />
                <span>{formMode === 'add' ? 'Construct New Product Node' : 'Configure Product Settings & Asset Fields'}</span>
              </h4>
              <p className="text-[10px] text-slate-400">Manage rich product description, inventory levels, pricing, subcategory groupings and images.</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-bold text-slate-650">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label>Product English Name *</label>
                <input
                  type="text" required value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label>Slug URL (Automatic)</label>
                <input
                  type="text" required value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[10px]"
                />
              </div>
              <div className="space-y-1">
                <label>SKU Code</label>
                <input
                  type="text" value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1">
                <label>Barcode ID</label>
                <input
                  type="text" value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
                >
                  <option value="birds">Birds</option>
                  <option value="cats">Cats</option>
                  <option value="fish">Fish</option>
                  <option value="rabbits">Rabbits</option>
                  <option value="accessories">Accessories</option>
                  <option value="supplements">Supplements</option>
                </select>
              </div>
              <div className="space-y-1">
                <label>Sub Category</label>
                <input
                  type="text" value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Dry Food"
                />
              </div>
              <div className="space-y-1">
                <label>Brand Manufacturer</label>
                <input
                  type="text" value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Lara, SmartHeart"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <label>Price (৳ BDT) *</label>
                <input
                  type="number" required min="1" value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-750"
                />
              </div>
              <div className="space-y-1">
                <label>Discount Price (৳ BDT)</label>
                <input
                  type="number" min="0" value={discountPrice}
                  onChange={(e) => setDiscountPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label>Stock Qty *</label>
                <input
                  type="number" required min="0" value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label>Weight (Size)</label>
                <input
                  type="text" value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. 1.5 Kg"
                />
              </div>
            </div>

            {/* Cloudinary Upload Simulated Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Cloudinary CDN Assets Integrator</span>
                </p>
                <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 rounded uppercase">Connected</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label>Primary Image URL</label>
                  <input
                    type="text" value={primaryImage}
                    onChange={(e) => setPrimaryImage(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[10px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleCloudinaryUpload('image')}
                    className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Primary Image (Cloudinary)</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label>Gallery (Images/Videos) URLs</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCloudinaryUpload('gallery')}
                      className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Add Gallery Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCloudinaryUpload('video')}
                      className="flex-1 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center justify-center gap-1 text-[10px] cursor-pointer"
                    >
                      <VideoIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Add Gallery Video</span>
                    </button>
                  </div>
                  {imagesGallery.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        {isBn ? 'গ্যালারি ছবিসমূহ (রি-অর্ডার এবং ডিলিট করুন)' : 'Gallery Images (Reorder and delete)'}
                      </p>
                      <div className="grid grid-cols-4 gap-2 border border-slate-150 p-2 rounded-2xl bg-slate-50/50">
                        {imagesGallery.map((img, index) => (
                          <div key={index} className="group relative aspect-square bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xxs hover:border-emerald-500 transition-colors">
                            <img src={img} alt="Gallery item" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                              {/* Reorder Left */}
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...imagesGallery];
                                    const temp = next[index];
                                    next[index] = next[index - 1];
                                    next[index - 1] = temp;
                                    setImagesGallery(next);
                                  }}
                                  className="p-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer text-xs"
                                  title="Move left"
                                >
                                  &larr;
                                </button>
                              )}
                              {/* Reorder Right */}
                              {index < imagesGallery.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...imagesGallery];
                                    const temp = next[index];
                                    next[index] = next[index + 1];
                                    next[index + 1] = temp;
                                    setImagesGallery(next);
                                  }}
                                  className="p-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer text-xs"
                                  title="Move right"
                                >
                                  &rarr;
                                </button>
                              )}
                              {/* Delete Item */}
                              <button
                                type="button"
                                onClick={() => {
                                  setImagesGallery(imagesGallery.filter((_, i) => i !== index));
                                }}
                                className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer flex items-center justify-center"
                                title="Remove image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {uploadProgress !== null && (
                <div className="space-y-1.5 animate-pulse">
                  <div className="flex justify-between text-[10px] font-mono text-emerald-700">
                    <span>{cloudinaryStatus}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label>Short Description</label>
              <input
                type="text" value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Summarized bullet line points..."
              />
            </div>

            <div className="space-y-1.5">
              <label>Full Specification Description</label>
              <textarea
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                className="w-full h-20 p-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none font-medium"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label>Keywords Search Tags (Comma separated)</label>
              <input
                type="text" value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
                <span>Featured</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)} className="rounded" />
                <span>Best Seller</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="rounded" />
                <span>New Arrival</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={flashSale} onChange={(e) => setFlashSale(e.target.checked)} className="rounded" />
                <span>Flash Sale</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="rounded" />
                <span>Active Item</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
              <button
                type="button" onClick={() => setShowForm(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
              >
                Confirm Save Product
              </button>
            </div>

          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in" id="product-management-module">
      
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <Box className="w-5 h-5 text-emerald-600" />
            <span>{isBn ? 'পণ্য ভাণ্ডার ও ইনভেন্টরি কন্ট্রোল' : 'Product Warehouse & CRUD Customizer'}</span>
          </h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-1">
            {isBn 
              ? 'স্টোরের সকল পণ্যের বিবরণী, ছবির গ্যালারি, কাস্টম ভিডিও, এসকেইউ ও বারকোড পরিচালনা করুন।' 
              : 'Add, update, duplicate, and configure catalog tags, multi-images, or video reels with automated SKU codes.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isBn ? 'বাল্ক ইম্পোর্ট' : 'Bulk Import'}</span>
          </button>
          
          <button
            onClick={handleBulkExport}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isBn ? 'এক্সপোর্ট ক্যাটালগ (CSV)' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] transition-transform shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{isBn ? 'নতুন পণ্য যোগ' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Bulk Import Section */}
      {showBulkImport && (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 space-y-3 animate-scale-up">
          <p className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'বাল্ক ইম্পোর্ট JSON এডিটর' : 'Bulk Import JSON array format:'}</span>
          </p>
          <textarea
            value={bulkImportText}
            onChange={(e) => setBulkImportText(e.target.value)}
            placeholder='[ { "name": "Timothy Grass Pellets", "price": 420, "stock": 50, "category": "rabbits" } ]'
            className="w-full h-24 p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono"
          ></textarea>
          <div className="flex justify-end gap-2 text-xs font-bold">
            <button onClick={() => setShowBulkImport(false)} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg cursor-pointer">Cancel</button>
            <button onClick={handleBulkImportSubmit} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer">Parse Import</button>
          </div>
        </div>
      )}

      {/* 2. Search, Filter, Sort Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isBn ? 'নাম, এসকেইউ বা বারকোড দিয়ে খুঁজুন...' : 'Search items by name, tags, SKU, barcode...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none w-full sm:w-auto cursor-pointer"
          >
            <option value="All">{isBn ? 'সব ক্যাটাগরি' : 'All Categories'}</option>
            {['birds', 'cats', 'fish', 'rabbits', 'accessories', 'supplements'].map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Product Grid/Table Catalog */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-150 text-[10px] select-none">
              <th className="py-3 px-4 uppercase cursor-pointer" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Product Name</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 uppercase">SKU / Code</th>
              <th className="py-3 px-4 uppercase text-center cursor-pointer" onClick={() => toggleSort('price')}>
                <div className="flex items-center justify-center gap-1">
                  <span>Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 uppercase text-center cursor-pointer" onClick={() => toggleSort('stock')}>
                <div className="flex items-center justify-center gap-1">
                  <span>Stock</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 uppercase">Tags</th>
              <th className="py-3 px-4 uppercase">Status</th>
              <th className="py-3 px-4 uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                  {isBn ? 'কোনো প্রোডাক্ট মেলেনি!' : 'No products match your searches.'}
                </td>
              </tr>
            ) : (
              sortedProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                      <div className="truncate">
                        <p className="font-extrabold text-slate-850 text-xs truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.category} | {p.weight || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                    <p>{p.sku || 'N/A'}</p>
                    <p className="text-slate-400">{p.barcode || ''}</p>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <p className="font-extrabold text-emerald-700">৳{p.price}</p>
                    {p.originalPrice > p.price && (
                      <p className="text-[10px] text-red-500 line-through font-bold">৳{p.originalPrice}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[11px] font-black ${
                      p.stock === 0 
                        ? 'text-red-650 bg-red-50 px-2 py-0.5 rounded-full' 
                        : p.stock <= 10 
                          ? 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full' 
                          : 'text-slate-800'
                    }`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {p.tags?.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      p.active !== false 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {p.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex justify-center items-center gap-1">
                      <button
                        onClick={() => setPreviewProduct(p)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: isBn ? 'পণ্য ডুপ্লিকেট নিশ্চিত করুন' : 'Confirm Product Duplication',
                            message: isBn 
                              ? `আপনি কি নিশ্চিতভাবে "${p.name}" পণ্যটি ডুপ্লিকেট বা কপি করতে চান?` 
                              : `Are you sure you want to create a duplicated copy of "${p.name}"?`,
                            type: 'duplicate',
                            onConfirm: () => {
                              onDuplicateProduct(p.id);
                              setConfirmModal(prev => ({ ...prev, isOpen: false }));
                            }
                          });
                        }}
                        className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: isBn ? 'পণ্য মুছে ফেলা নিশ্চিত করুন' : 'Confirm Permanent Deletion',
                            message: isBn 
                              ? `আপনি কি নিশ্চিতভাবে "${p.name}" পণ্যটি ক্যাটালগ থেকে চিরতরে মুছে ফেলতে চান? এই কাজটি আর ফিরিয়ে আনা যাবে না!` 
                              : `Are you absolutely sure you want to permanently delete "${p.name}" from the catalog? This operation cannot be undone.`,
                            type: 'delete',
                            onConfirm: () => {
                              onDeleteProduct(p.id);
                              setConfirmModal(prev => ({ ...prev, isOpen: false }));
                            }
                          });
                        }}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg cursor-pointer"
                        title="Purge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 5. PREVIEW MODAL */}
      {previewProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            <div className="relative">
              <img src={previewProduct.image} className="w-full h-56 object-cover" />
              <button
                onClick={() => setPreviewProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/40 text-white hover:bg-slate-900/60 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-emerald-600 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full shadow-sm">
                {previewProduct.category}
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">{previewProduct.name}</h4>
                <p className="text-slate-400 font-bold mt-0.5">{previewProduct.banglaName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-3 font-bold text-slate-600">
                <div>
                  <p className="text-[10px] text-slate-400">Regular Selling Price</p>
                  <p className="text-sm font-black text-emerald-700 mt-0.5">৳{previewProduct.price}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Current Warehouse Stock</p>
                  <p className="text-sm font-black text-slate-850 mt-0.5">{previewProduct.stock} units</p>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-500">
                <p className="font-extrabold text-slate-800 uppercase text-[10px]">Specifications Description</p>
                <p className="leading-relaxed">{previewProduct.description || 'No description provided.'}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {previewProduct.tags?.map((t, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded-full font-bold">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Confirm Modal Dialog */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 animate-scale-up p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className={`p-2.5 rounded-xl ${confirmModal.type === 'delete' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800">{confirmModal.title}</h4>
            </div>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">{confirmModal.message}</p>
            <div className="flex justify-end gap-2 text-xs font-extrabold pt-2">
              <button 
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button 
                onClick={confirmModal.onConfirm} 
                className={`px-4 py-2 text-white rounded-xl cursor-pointer shadow-sm ${
                  confirmModal.type === 'delete' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isBn ? 'নিশ্চিত করুন' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
