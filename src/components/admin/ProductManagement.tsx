import React, { useState, useRef } from 'react';
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
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Loader2,
  Check,
  CheckCircle
} from 'lucide-react';
import { Product } from '../../types';
import { uploadImage, CompressionStats, DEFAULT_PRODUCT_IMAGE } from '../../lib/cloudinary';

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
  const [category, setCategory] = useState('pigeons');
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
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingPrimary, setIsDraggingPrimary] = useState(false);
  const [primaryImageError, setPrimaryImageError] = useState(false);
  const [deviceImageAttached, setDeviceImageAttached] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');
  const [imageCompressionInfo, setImageCompressionInfo] = useState<CompressionStats | null>(null);
  const currentUploadPromiseRef = useRef<Promise<string> | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Hidden file input refs for robust mobile & desktop triggering
  const primaryFileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

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
    setPrimaryImage('');
    setPrimaryImageError(false);
    setDeviceImageAttached(false);
    setUploadSuccessMessage('');
    currentUploadPromiseRef.current = null;
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
    setPrimaryImageError(false);
    setDeviceImageAttached(false);
    setUploadSuccessMessage('');
    currentUploadPromiseRef.current = null;
    setImagesGallery(p.imagesGallery || []);
    setVideosGallery(p.videosGallery || []);
    setShowForm(true);
  };

  // Centralized File Upload Processor supporting direct DOM inputs, drag-and-drop, and fallback
  const processUploadFile = async (file: File, type: 'image' | 'video' | 'gallery') => {
    if (!file) return;

    // Immediate local preview so user sees their selected photo instantly with zero lag
    if (type === 'image') {
      setDeviceImageAttached(true);
      setUploadSuccessMessage(isBn ? 'ছবি লোড হচ্ছে...' : 'Loading image...');
      try {
        const localUrl = URL.createObjectURL(file);
        setPrimaryImage(localUrl);
        setPrimaryImageError(false);
      } catch (e) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setPrimaryImage(ev.target.result as string);
            setPrimaryImageError(false);
          }
        };
        reader.readAsDataURL(file);
      }
    }

    setUploadProgress(0);
    setIsUploading(true);
    setCloudinaryStatus(isBn ? 'ডিভাইস থেকে ছবি প্রস্তুত ও আপলোড হচ্ছে...' : 'Processing and uploading image...');

    const uploadPromise = uploadImage(file, {
      onProgress: (percent) => {
        setUploadProgress(percent);
        setCloudinaryStatus(
          percent < 70 
            ? (isBn ? `ইমেজ প্রস্তুত ও কম্প্রেস হচ্ছে: ${percent}%` : `Composing & compressing: ${percent}%`)
            : (isBn ? `ফায়ারস্টোর ক্লাউডে সংরক্ষণ হচ্ছে: ${percent}%` : `Saving to Firestore Cloud: ${percent}%`)
        );
      },
      compress: type !== 'video',
      onCompression: (stats) => {
        if (type === 'image') {
          setImageCompressionInfo(stats);
        }
      }
    });

    currentUploadPromiseRef.current = uploadPromise;

    try {
      const url = await uploadPromise;
      setUploadProgress(null);
      setCloudinaryStatus('');
      setIsUploading(false);

      if (type === 'image') {
        setPrimaryImage(url);
        setPrimaryImageError(false);
        setDeviceImageAttached(true);
        setUploadSuccessMessage(
          isBn 
            ? '✓ ফায়ারস্টোর ক্লাউডে ছবি সফলভাবে সংরক্ষিত হয়েছে!' 
            : '✓ Image stored in Firestore Cloud successfully!'
        );
      } else if (type === 'gallery') {
        setImagesGallery(old => [...old, url]);
      } else {
        setVideosGallery(old => [...old, url]);
      }
    } catch (err: any) {
      setUploadProgress(null);
      setCloudinaryStatus('');
      setIsUploading(false);
      console.warn('[IMAGE UPLOAD ISSUE, using local fallback]', err);
      // Fallback is handled gracefully by uploadImage
    }
  };

  // Trigger file picker safely using persistent ref or dynamic fallback
  const handleCloudinaryUpload = (type: 'image' | 'video' | 'gallery') => {
    if (type === 'image' && primaryFileInputRef.current) {
      primaryFileInputRef.current.click();
      return;
    }
    if (type === 'gallery' && galleryFileInputRef.current) {
      galleryFileInputRef.current.click();
      return;
    }
    if (type === 'video' && videoFileInputRef.current) {
      videoFileInputRef.current.click();
      return;
    }

    // Dynamic fallback if ref is temporarily unavailable
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'video' ? 'video/*' : 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) processUploadFile(file, type);
    };
    input.click();
  };

  // Handle Form Submit & Direct Confirm Save Product
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      alert(isBn ? 'অনুগ্রহ করে সঠিক পণ্যের নাম প্রদান করুন!' : 'Please enter valid product name.');
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
      return;
    }

    setIsSaving(true);

    let finalImageUrl = primaryImage;

    // 1. If upload is in flight, gracefully await it instead of erroring out
    if (isUploading && currentUploadPromiseRef.current) {
      try {
        const resolvedUrl = await currentUploadPromiseRef.current;
        if (resolvedUrl) {
          finalImageUrl = resolvedUrl;
        }
      } catch (uploadWaitErr) {
        console.warn('Awaiting upload in-flight fallback:', uploadWaitErr);
      }
    }

    // 2. Prevent saving temporary blob: URLs into persistent DB by converting to persistent server asset
    if (finalImageUrl && finalImageUrl.startsWith('blob:')) {
      try {
        const blobRes = await fetch(finalImageUrl);
        const blob = await blobRes.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: base64, filename: 'device_product.jpg' })
        });

        if (uploadRes.ok) {
          const uData = await uploadRes.json();
          if (uData.url) {
            finalImageUrl = uData.url;
            setPrimaryImage(uData.url);
          }
        } else {
          // If server upload failed, directly retain the device base64 image data
          finalImageUrl = base64;
          setPrimaryImage(base64);
        }
      } catch (blobConvErr) {
        console.warn('Blob URL conversion fallback:', blobConvErr);
      }
    }

    const tagsArr = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const safeImage = finalImageUrl || selectedProduct?.image || '';

    const payload = {
      id: selectedProduct?.id || `prod-${Date.now()}`,
      name: name.trim(),
      banglaName: (banglaName || name).trim(),
      slug: (slug || name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `prod-${Date.now()}`,
      sku: sku || `TQW-${Math.floor(100000 + Math.random() * 900000)}`,
      barcode: barcode || `880123${Math.floor(1000000 + Math.random() * 9000000)}`,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      description: fullDesc || shortDesc || 'তাকওয়া প্রিমিয়াম পণ্য বিবরণী',
      banglaDescription: isBn ? (fullDesc || shortDesc) : 'তাকওয়া প্রিমিয়াম পণ্য বিবরণী',
      category,
      subcategory,
      brand,
      price: Number(price) >= 0 ? Number(price) : 0,
      originalPrice: Number(discountPrice || price) >= 0 ? Number(discountPrice || price) : 0,
      stock: Number(stock) >= 0 ? Number(stock) : 0,
      weight: weight || '1 Kg',
      tags: tagsArr.length > 0 ? tagsArr : [category],
      featured,
      bestSeller,
      newArrival,
      flashSale,
      active,
      image: safeImage,
      imagesGallery: imagesGallery.length > 0 ? imagesGallery : (safeImage ? [safeImage] : []),
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
    } catch (err: any) {
      console.error('[PRODUCT SAVE FAILED]', err);
      alert(isBn ? `পণ্য সংরক্ষণে সমস্যা: ${err?.message || 'সার্ভারে সংরক্ষণ করা যায়নি'}` : `Failed to save product: ${err?.message || 'Server error'}`);
    } finally {
      setIsSaving(false);
    }
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
                  ref={nameInputRef}
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
                  <option value="pigeons">{isBn ? 'কবুতরের খাবার' : 'Pigeon Feed'}</option>
                  <option value="birds">{isBn ? 'পাখির খাবার' : 'Bird Feed'}</option>
                  <option value="medicine">{isBn ? 'ঔষধ' : 'Medicine'}</option>
                  <option value="accessories">{isBn ? 'এক্সেসরিজ' : 'Accessories'}</option>
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

            {/* Cloudinary & Media Upload Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>{isBn ? 'পণ্যের ছবি ও মিডিয়া আপলোড' : 'Product Image & Media Upload'}</span>
                </p>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  {isBn ? 'সক্রিয় ও প্রস্তুত' : 'Ready to Upload'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hidden File Inputs for Reliable Mobile/Desktop File Triggering */}
                <input
                  type="file"
                  ref={primaryFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processUploadFile(file, 'image');
                    e.target.value = '';
                  }}
                />
                <input
                  type="file"
                  ref={galleryFileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []) as File[];
                    files.forEach(f => processUploadFile(f, 'gallery'));
                    e.target.value = '';
                  }}
                />
                <input
                  type="file"
                  ref={videoFileInputRef}
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processUploadFile(file, 'video');
                    e.target.value = '';
                  }}
                />

                {/* Primary Image Uploader & Preview */}
                <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{isBn ? '১. মূল পণ্যের ছবি (Primary Image)' : '1. Primary Product Image'}</span>
                      {primaryImage && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Image active" />
                      )}
                    </label>
                    {isUploading && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {cloudinaryStatus || (isBn ? 'আপলোড হচ্ছে...' : 'Uploading...')}
                      </span>
                    )}
                  </div>
                  
                  {primaryImage ? (
                    <div className="space-y-2">
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center group shadow-inner">
                        {primaryImageError ? (
                          <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 bg-amber-50/90 w-full h-full">
                            <AlertCircle className="w-8 h-8 text-amber-500" />
                            <p className="text-xs font-bold text-amber-900">
                              {isBn ? 'ছবিটি প্রদর্শন করা যাচ্ছে না' : 'Image failed to display'}
                            </p>
                            <p className="text-[10px] text-amber-700 max-w-xs">
                              {isBn ? 'লিঙ্কটি বা ফাইলের পাথটি সঠিক নয়। নিচে থেকে নতুন ছবি আপলোড বা নির্বাচন করুন।' : 'URL is invalid or missing. Please re-upload or select an image below.'}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => handleCloudinaryUpload('image')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{isBn ? 'ডিভাইস থেকে আপলোড' : 'Upload from Device'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <img 
                              src={primaryImage} 
                              alt="Primary Preview" 
                              className="w-full h-full object-contain p-1.5 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                              onError={() => {
                                setPrimaryImageError(true);
                              }}
                            />
                            {/* Overlay Controls for desktop hover */}
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 sm:flex hidden items-center justify-center gap-2 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleCloudinaryUpload('image')}
                                disabled={isUploading}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>{isBn ? 'ছবি পরিবর্তন' : 'Change'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPrimaryImage('');
                                  setPrimaryImageError(false);
                                }}
                                disabled={isUploading}
                                className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Mobile & Quick Actions Bar (Always Visible on screen) */}
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleCloudinaryUpload('image')}
                          disabled={isUploading || isSaving}
                          className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isBn ? 'ডিভাইস থেকে নতুন ছবি আপলোড' : 'Upload New from Device'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPrimaryImage('');
                            setPrimaryImageError(false);
                            setDeviceImageAttached(false);
                            setUploadSuccessMessage('');
                          }}
                          disabled={isUploading || isSaving}
                          className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title={isBn ? 'ছবি মুছুন' : 'Remove Image'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Direct Confirm Save Product Button Box */}
                      <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-400 rounded-xl space-y-2 shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-black text-emerald-900">
                              {uploadSuccessMessage || (deviceImageAttached 
                                ? (isBn ? 'ডিভাইস থেকে ছবি সফলভাবে যুক্ত হয়েছে' : 'Device Image Attached') 
                                : (isBn ? 'পণ্য ও ছবি প্রস্তুত রয়েছে' : 'Product Image Ready'))}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                              {isBn ? 'ফায়ারস্টোর স্টোরেজ' : 'Firestore Cloud'}
                            </span>
                            {deviceImageAttached && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                                {isBn ? 'ডিভাইস ফাইল' : 'Device Asset'}
                              </span>
                            )}
                          </div>
                        </div>

                        {imageCompressionInfo && imageCompressionInfo.isCompressed && (
                          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-white/80 border border-emerald-300/80 rounded-lg text-[11px] text-emerald-900">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-semibold">
                                {isBn 
                                  ? `সাইজ কম্প্রেস: ${imageCompressionInfo.originalSize} → ${imageCompressionInfo.compressedSize}` 
                                  : `Size Optimized: ${imageCompressionInfo.originalSize} → ${imageCompressionInfo.compressedSize}`}
                              </span>
                            </div>
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                              {isBn ? `${imageCompressionInfo.savings} সাশ্রয়` : `${imageCompressionInfo.savings} saved`}
                            </span>
                          </div>
                        )}

                        <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                          {isBn 
                            ? 'ছবিটি পণ্যের সাথে নিশ্চিত হয়েছে। নিচের বাটনে চাপ দিয়ে সরাসরি সম্পূর্ণ পণ্য সংরক্ষণ করুন:' 
                            : 'Image successfully attached. Click below to confirm and save this product immediately:'}
                        </p>

                        <button
                          type="button"
                          onClick={() => handleSubmit()}
                          disabled={isSaving}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-75"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{isBn ? 'পণ্য সংরক্ষণ করা হচ্ছে...' : 'Saving Product...'}</span>
                            </>
                          ) : isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{isBn ? 'ছবি ও পণ্য সংরক্ষণ হচ্ছে...' : 'Uploading & Saving Product...'}</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>{isBn ? '✓ নিশ্চিত পণ্য সংরক্ষণ করুন (Confirm Save Product)' : '✓ Confirm Save Product'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => !isUploading && handleCloudinaryUpload('image')}
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingPrimary(true); }}
                      onDragLeave={() => setIsDraggingPrimary(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingPrimary(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          processUploadFile(file, 'image');
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center min-h-[140px] ${
                        isDraggingPrimary 
                          ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]' 
                          : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {isUploading ? (
                            cloudinaryStatus || (isBn ? 'ছবি আপলোড হচ্ছে...' : 'Uploading Image...')
                          ) : (
                            isBn ? 'ডিভাইস (ক্যামেরা/গ্যালারি) থেকে ছবি আপলোড করুন' : 'Click to Upload from Device / Camera'
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400">JPG, PNG, WebP (Automatic Compression)</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-1.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-slate-500 font-semibold">{isBn ? 'অথবা ছবির সরাসরি লিঙ্ক (URL):' : 'Or direct Image URL:'}</span>
                    </div>
                    <input
                      type="text" 
                      value={primaryImage}
                      onChange={(e) => {
                        setPrimaryImage(e.target.value);
                        setPrimaryImageError(false);
                      }}
                      placeholder={isBn ? "ডিভাইস থেকে আপলোড করা ফাইল বা সরাসরি ইমেজ ইউআরএল..." : "Device upload URL or direct image link..."}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10px] text-slate-700 focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isBn ? '💡 ডিভাইস থেকে ছবি আপলোড করতে উপরের বাটনে ক্লিক করুন। এটি ফায়ারবেস স্টোরেজে সংরক্ষিত হবে।' : '💡 Click "Upload from Device" above to attach an image from your device.'}
                    </p>
                  </div>
                </div>

                {/* Additional Gallery Images & Videos */}
                <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block">
                    {isBn ? '২. গ্যালারি ছবি ও ভিডিও (Gallery Media)' : '2. Gallery Media (Optional)'}
                  </label>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCloudinaryUpload('gallery')}
                      className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>{isBn ? '+ গ্যালারি ছবি যোগ করুন' : '+ Add Gallery Image'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCloudinaryUpload('video')}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer transition-colors"
                    >
                      <VideoIcon className="w-4 h-4 text-slate-600" />
                      <span>{isBn ? '+ ভিডিও যোগ করুন' : '+ Add Video'}</span>
                    </button>
                  </div>

                  {imagesGallery.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        {isBn ? `যুক্তকৃত গ্যালারি ছবিসমূহ (${imagesGallery.length}টি)` : `Gallery Items (${imagesGallery.length})`}
                      </p>
                      <div className="grid grid-cols-4 gap-2 border border-slate-100 p-2 rounded-xl bg-slate-50">
                        {imagesGallery.map((img, index) => (
                          <div key={index} className="group relative aspect-square bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xxs hover:border-emerald-500 transition-colors">
                            <img src={img} alt="Gallery item" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
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
                                  className="p-1 bg-white hover:bg-slate-100 text-slate-800 rounded text-xs cursor-pointer"
                                  title="Move left"
                                >
                                  &larr;
                                </button>
                              )}
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
                                  className="p-1 bg-white hover:bg-slate-100 text-slate-800 rounded text-xs cursor-pointer"
                                  title="Move right"
                                >
                                  &rarr;
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setImagesGallery(imagesGallery.filter((_, i) => i !== index));
                                }}
                                className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer"
                                title="Remove image"
                              >
                                <Trash2 className="w-3 h-3" />
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
                <div className="space-y-1.5 animate-pulse bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <div className="flex justify-between text-xs font-bold text-emerald-800">
                    <span>{cloudinaryStatus}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
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

            {/* Sticky Action Footer */}
            <div className="sticky bottom-0 z-30 -mx-6 -mb-6 mt-4 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg flex items-center justify-end gap-3 text-xs font-bold">
              <button
                type="button" 
                onClick={() => setShowForm(false)}
                disabled={isSaving}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-7 py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 text-white font-black text-xs ${
                  isSaving 
                    ? 'bg-emerald-500 opacity-80 cursor-wait' 
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'পণ্য সংরক্ষণ করা হচ্ছে...' : 'Saving Product...'}</span>
                  </>
                ) : isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isBn ? 'ছবি ও পণ্য সংরক্ষণ হচ্ছে...' : 'Uploading & Saving Product...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isBn ? 'পণ্য নিশ্চিত সংরক্ষণ করুন' : 'Confirm Save Product'}</span>
                  </>
                )}
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
            {['pigeons', 'birds', 'medicine', 'accessories'].map(cat => (
              <option key={cat} value={cat}>
                {cat === 'pigeons' ? (isBn ? 'কবুতরের খাবার' : 'Pigeon Feed') :
                 cat === 'birds' ? (isBn ? 'পাখির খাবার' : 'Bird Feed') :
                 cat === 'medicine' ? (isBn ? 'ঔষধ' : 'Medicine') :
                 (isBn ? 'এক্সেসরিজ' : 'Accessories')}
              </option>
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
                      <img 
                        src={p.image} 
                        alt={p.name}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                      />
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
              <img 
                src={previewProduct.image} 
                alt={previewProduct.name}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                }}
                className="w-full h-56 object-cover" 
              />
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
