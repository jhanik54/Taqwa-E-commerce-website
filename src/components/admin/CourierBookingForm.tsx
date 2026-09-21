import React, { useState, useEffect, useRef } from 'react';
import {
  Truck,
  Package,
  Send,
  User,
  Phone,
  MapPin,
  Building2,
  Calendar,
  FileText,
  DollarSign,
  Printer,
  Copy,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Zap,
  Clock,
  Search,
  Layers,
  Edit3,
  Trash2,
  X,
  XCircle
} from 'lucide-react';
import { Order, CourierParcel, CourierSettings } from '../../types';
import {
  getNextAutoMemoNumber,
  commitMemoNumber,
  isMemoNumberDuplicate
} from '../../lib/memoSequence';

// Bangladesh 64 Districts List with Divisions for clean quick select
export const BD_DISTRICTS = [
  // Dhaka Division
  'Dhaka', 'Gazipur', 'Narayanganj', 'Tangail', 'Narsingdi', 'Faridpur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Rajbari', 'Shariatpur',
  // Chittagong Division
  'Chattogram', 'Cumilla', 'Cox\'s Bazar', 'Brahmanbaria', 'Chandpur', 'Noakhali', 'Feni', 'Lakshmipur', 'Khagrachhari', 'Rangamati', 'Bandarban',
  // Rajshahi Division
  'Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Naogaon', 'Natore', 'Chapai Nawabganj', 'Joypurhat',
  // Khulna Division
  'Khulna', 'Jashore', 'Kushtia', 'Satkhira', 'Bagerhat', 'Chuadanga', 'Jhenaidah', 'Magura', 'Meherpur', 'Narail',
  // Sylhet Division
  'Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj',
  // Barishal Division
  'Barishal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Barguna', 'Jhalokati',
  // Rangpur Division
  'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon',
  // Mymensingh Division
  'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'
];

interface CourierBookingFormProps {
  orders: Order[];
  courierSettings?: CourierSettings;
  recentParcels?: CourierParcel[];
  onSaveParcel: (parcel: CourierParcel) => Promise<void>;
  onDeleteParcel?: (parcelId: string) => Promise<void> | void;
  onPrintParcel: (parcel: CourierParcel, format?: 'voucher' | 'thermal') => void;
  lang: 'en' | 'bn';
  initialOrder?: Order | null;
  onClearInitialOrder?: () => void;
}

export default function CourierBookingForm({
  orders = [],
  courierSettings,
  recentParcels = [],
  onSaveParcel,
  onDeleteParcel,
  onPrintParcel,
  lang,
  initialOrder,
  onClearInitialOrder
}: CourierBookingFormProps) {
  const isBn = lang === 'bn';

  // Form reference for smooth scrolling during edit
  const formRef = useRef<HTMLFormElement>(null);

  // Available store orders for quick fill
  const eligibleOrders = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');

  // Form States
  const [selectedOrderId, setSelectedOrderId] = useState<string>(initialOrder ? initialOrder.id : '');
  
  // 1. Courier & Delivery Type
  const [courier, setCourier] = useState<'Janani' | 'Sundarban' | 'Steadfast' | 'Pathao' | 'RedX' | 'SA Paribahan' | 'Karatoa' | 'In-House Rider'>('Janani');
  const [deliveryType, setDeliveryType] = useState<'Home Delivery' | 'Branch / Office Pickup' | 'O/D' | 'H/D'>('O/D');
  const [paymentMode, setPaymentMode] = useState<'Condition (COD)' | 'Prepaid (Paid)'>('Condition (COD)');
  
  // 2. Customer Details
  const [customerName, setCustomerName] = useState('Abdur Rahamn');
  const [customerPhone, setCustomerPhone] = useState('01724791612');
  const [customerAltPhone, setCustomerAltPhone] = useState('');
  const [district, setDistrict] = useState('Cumilla');
  const [destinationBranch, setDestinationBranch] = useState('Laksam');
  const [shippingAddress, setShippingAddress] = useState('Laksam, Cumilla');
  
  // 3. Sender Details (Taqwa Enterprise default)
  const [senderName, setSenderName] = useState(courierSettings?.senderName || 'Abdul Malek Molla');
  const [senderPhone, setSenderPhone] = useState(courierSettings?.senderPhone || '01718-105642');
  const [senderAddress, setSenderAddress] = useState(courierSettings?.senderAddress || 'হাজী ইয়াকুব মোল্লা সুপার মার্কেট, সারদাগঞ্জ, কাশিমপুর, গাজীপুর সিটি');
  const [placeOfBooking, setPlaceOfBooking] = useState('Konabari');
  
  // 4. Products & Package Details
  const [itemsSummary, setItemsSummary] = useState('1 Bosta Feed (25kg Pigeon / Bird Feed)');
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [packageType, setPackageType] = useState<'ব্যাগ/বস্তা' | 'কার্টুন' | 'প্যাকেট/বক্স' | 'অন্যান্য'>('ব্যাগ/বস্তা');
  const [weightKg, setWeightKg] = useState<number>(25);
  const [specialInstructions, setSpecialInstructions] = useState('তরল/কাঁচ নয়, সাবধানে হ্যান্ডেল করুন');
  
  // 5. Financials & Charges
  const [conditionAmount, setConditionAmount] = useState<number>(2820);
  const [conditionCharge, setConditionCharge] = useState<number>(30);
  const [conditionChargeType, setConditionChargeType] = useState<'To-Pay' | 'Cash'>('To-Pay');
  const [carryingCharge, setCarryingCharge] = useState<number>(160);
  const [carryingChargeType, setCarryingChargeType] = useState<'To-Pay' | 'Cash'>('To-Pay');
  const [vat, setVat] = useState<number>(0);
  const [amountInWords, setAmountInWords] = useState('three thousand and ten');
  const [bookingOfficer, setBookingOfficer] = useState('Md. Rakib');
  
  // 6. Memo / Consignment Serial Number (Starting from 260001, strictly non-duplicate)
  const [customCnNumber, setCustomCnNumber] = useState<string>(() => getNextAutoMemoNumber(recentParcels));
  const [bookingDateStr, setBookingDateStr] = useState('01-9-2026, 12:23 pm');

  // Edit & Delete States
  const [editingParcelId, setEditingParcelId] = useState<string | null>(null);
  const [editingSettlementStatus, setEditingSettlementStatus] = useState<'Settled' | 'Unsettled'>('Unsettled');
  const [deleteConfirmParcel, setDeleteConfirmParcel] = useState<CourierParcel | null>(null);
  const [quickEditParcel, setQuickEditParcel] = useState<CourierParcel | null>(null);

  // Keep memo number auto-incremented and up to date when not manually editing an existing parcel
  useEffect(() => {
    if (!editingParcelId) {
      setCustomCnNumber(prev => {
        // If empty or default placeholder, populate with next free serial
        if (!prev || prev === '19518142') {
          return getNextAutoMemoNumber(recentParcels);
        }
        return prev;
      });
    }
  }, [recentParcels, editingParcelId]);

  // UI status
  const [saving, setSaving] = useState(false);
  const [lastSavedParcel, setLastSavedParcel] = useState<CourierParcel | null>(null);
  const [savedSuccessModal, setSavedSuccessModal] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [quickEditData, setQuickEditData] = useState({
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
    destinationBranch: '',
    district: '',
    courier: 'Janani',
    itemsSummary: '',
    productQuantity: 1,
    weightKg: 1,
    codAmount: 0,
    conditionAmount: 0,
    conditionCharge: 0,
    conditionChargeType: 'To-Pay' as 'Cash' | 'To-Pay',
    carryingCharge: 0,
    carryingChargeType: 'To-Pay' as 'Cash' | 'To-Pay',
    vat: 0,
    status: 'In Transit' as CourierParcel['status'],
    settlementStatus: 'Unsettled' as 'Settled' | 'Unsettled',
    consignmentId: '',
    deliveryType: 'O/D'
  });

  // Ledger Table View Mode: Full Official Voucher Ledger vs Compact View
  const [ledgerViewMode, setLedgerViewMode] = useState<'voucher' | 'compact'>('voucher');
  const [ledgerSearch, setLedgerSearch] = useState('');

  // Number to English Words helper
  const numToWords = (num: number): string => {
    if (!num || isNaN(num) || num <= 0) return 'zero';
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (num < 20) return a[num] || `${num}`;
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + (a[num % 10] || '') : '');
    if (num < 1000) return (a[Math.floor(num / 100)] || '') + ' hundred' + (num % 100 !== 0 ? ' and ' + numToWords(num % 100) : '');
    if (num < 100000) return numToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 !== 0 ? ' ' + numToWords(num % 1000) : '');
    return `${num}`;
  };

  // Recalculate Amount in words and total collectible
  const totalPayableByCustomer = (paymentMode === 'Condition (COD)' ? conditionAmount : 0) + 
    (conditionChargeType === 'To-Pay' ? conditionCharge : 0) + 
    (carryingChargeType === 'To-Pay' ? carryingCharge : 0);

  useEffect(() => {
    if (totalPayableByCustomer > 0) {
      setAmountInWords(`${numToWords(totalPayableByCustomer)} taka only`);
    }
  }, [totalPayableByCustomer]);

  // Load from initial order if provided
  useEffect(() => {
    if (initialOrder) {
      populateFromOrder(initialOrder);
    }
  }, [initialOrder]);

  const populateFromOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone);
    setShippingAddress(order.shippingAddress);
    setDistrict(order.district || 'Dhaka');
    setDestinationBranch(order.district ? `${order.district} Branch` : 'Dhaka Main Branch');
    
    // Items
    const itemsDesc = order.items?.map(i => `${i.productName} (${i.quantity}x)`).join(', ') || 'Pet Food & Supplies';
    setItemsSummary(itemsDesc);
    const totalQty = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1;
    setProductQuantity(totalQty);
    setWeightKg(Math.max(1, Math.round(totalQty * 0.8)));

    // Amounts
    const isPaid = order.paymentStatus === 'Paid';
    if (isPaid) {
      setPaymentMode('Prepaid (Paid)');
      setConditionAmount(0);
      setConditionCharge(0);
    } else {
      setPaymentMode('Condition (COD)');
      const condAmt = order.conditionAmount !== undefined ? order.conditionAmount : (order.totalAmount || order.subtotal || 0);
      setConditionAmount(condAmt);
      const condChg = order.conditionCharge !== undefined 
        ? order.conditionCharge 
        : (condAmt > 0 ? Math.max(10, Math.round((condAmt * 10) / 1000)) : 0);
      setConditionCharge(condChg);
      if (order.conditionChargeType) {
        setConditionChargeType(order.conditionChargeType);
      }
    }

    // Carrying charge estimate
    if (order.carryingCharge !== undefined) {
      setCarryingCharge(order.carryingCharge);
      if (order.carryingChargeType) {
        setCarryingChargeType(order.carryingChargeType);
      }
    } else {
      const isInsideDhaka = (order.district || '').toLowerCase().includes('dhaka');
      setCarryingCharge(isInsideDhaka ? 60 : 160);
    }

    // Memo ID (Auto sequential 260001 series)
    setCustomCnNumber(getNextAutoMemoNumber(recentParcels));
    setBookingDateStr(new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
  };

  // Quick Preset: Load Janani Slip Demo
  const handleLoadJananiDemo = () => {
    setSelectedOrderId('');
    setCourier('Janani');
    setDeliveryType('O/D');
    setPaymentMode('Condition (COD)');
    setCustomerName('Abdur Rahamn');
    setCustomerPhone('01724791612');
    setCustomerAltPhone('');
    setDistrict('Cumilla');
    setDestinationBranch('Laksam');
    setShippingAddress('Laksam, Cumilla');
    setSenderName('Abdul Malek Molla');
    setSenderPhone('01718-105642');
    setSenderAddress('হাজী ইয়াকুব মোল্লা সুপার মার্কেট, সারদাগঞ্জ, কাশিমপুর, গাজীপুর সিটি');
    setPlaceOfBooking('Konabari');
    setItemsSummary('1 Bosta Feed (25kg Pigeon / Bird Feed)');
    setProductQuantity(1);
    setPackageType('ব্যাগ/বস্তা');
    setWeightKg(25);
    setSpecialInstructions('কাঁচ বা তরল জাতীয় পণ্য নয়, শুকনো পোল্ট্রি/পাখির খাদ্য');
    setConditionAmount(2820);
    setConditionCharge(30);
    setConditionChargeType('To-Pay');
    setCarryingCharge(160);
    setCarryingChargeType('To-Pay');
    setVat(0);
    setAmountInWords('three thousand and ten taka only');
    setBookingOfficer('Md. Rakib');
    setCustomCnNumber(getNextAutoMemoNumber(recentParcels));
    setBookingDateStr('01-9-2026, 12:23 pm');
    setErrorMessage('');
    setEditingParcelId(null);
  };

  // Reset form to blank
  const handleResetForm = () => {
    setSelectedOrderId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAltPhone('');
    setDistrict('Dhaka');
    setDestinationBranch('');
    setShippingAddress('');
    setItemsSummary('');
    setProductQuantity(1);
    setWeightKg(1);
    setConditionAmount(0);
    setConditionCharge(0);
    setCarryingCharge(60);
    setCustomCnNumber(getNextAutoMemoNumber(recentParcels));
    setBookingDateStr(new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
    setErrorMessage('');
    setEditingParcelId(null);
    if (onClearInitialOrder) onClearInitialOrder();
  };

  // Cancel Edit mode
  const handleCancelEdit = () => {
    setEditingParcelId(null);
    handleResetForm();
    setSuccessToast(isBn ? 'এডিট মোড বাতিল করা হয়েছে।' : 'Edit mode cancelled.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Populate & scroll to full booking form for edit
  const handleStartEditInFullForm = (p: CourierParcel) => {
    setEditingParcelId(p.id);
    setSelectedOrderId(p.orderId || '');
    setCourier((p.courier as any) || 'Janani');
    setDeliveryType((p.deliveryType as any) || 'O/D');
    setPaymentMode(p.codAmount > 0 || p.conditionAmount ? 'Condition (COD)' : 'Prepaid (Paid)');
    setCustomerName(p.customerName || '');
    setCustomerPhone(p.customerPhone || '');
    setDistrict(p.district || 'Cumilla');
    
    const branchClean = (p.destinationBranch || p.deliveryLocation || '')
      .replace(' Branch (O/D)', '')
      .replace(' Branch (H/D)', '')
      .replace(' Branch', '')
      .trim();
    setDestinationBranch(branchClean);
    setShippingAddress(p.shippingAddress || '');
    
    setSenderName(p.senderName || courierSettings?.senderName || 'Abdul Malek Molla');
    setSenderPhone(p.senderPhone || courierSettings?.senderPhone || '01718-105642');
    setSenderAddress(p.senderAddress || courierSettings?.senderAddress || 'হাজী ইয়াকুব মোল্লা সুপার মার্কেট, সারদাগঞ্জ, কাশিমপুর, গাজীপুর সিটি');
    setPlaceOfBooking(p.placeOfBooking || 'Konabari');
    
    setItemsSummary(p.itemsSummary || '');
    setProductQuantity(p.productQuantity || 1);
    setWeightKg(p.weightKg || 1);
    
    setConditionAmount(p.conditionAmount || p.codAmount || 0);
    setConditionCharge(p.conditionCharge || p.codFee || 0);
    setConditionChargeType((p.conditionChargeType as any) || 'To-Pay');
    setCarryingCharge(p.carryingCharge || p.deliveryCharge || 0);
    setCarryingChargeType((p.carryingChargeType as any) || 'To-Pay');
    setVat(p.vat || 0);
    setAmountInWords(p.amountInWords || '');
    setBookingOfficer(p.bookingOfficer || 'Md. Rakib');
    setCustomCnNumber(p.cnNumber || p.consignmentId || '');
    setBookingDateStr(p.bookingDateStr || new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
    setEditingSettlementStatus(p.settlementStatus || 'Unsettled');
    
    setErrorMessage('');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Open Quick Edit Modal
  const openQuickEdit = (p: CourierParcel) => {
    setQuickEditParcel(p);
    const branchClean = (p.destinationBranch || p.deliveryLocation || '')
      .replace(' Branch (O/D)', '')
      .replace(' Branch (H/D)', '')
      .replace(' Branch', '')
      .trim();

    setQuickEditData({
      customerName: p.customerName || '',
      customerPhone: p.customerPhone || '',
      shippingAddress: p.shippingAddress || '',
      destinationBranch: branchClean,
      district: p.district || 'Cumilla',
      courier: p.courier || 'Janani',
      itemsSummary: p.itemsSummary || '',
      productQuantity: p.productQuantity || 1,
      weightKg: p.weightKg || 1,
      codAmount: p.codAmount || p.conditionAmount || 0,
      conditionAmount: p.conditionAmount || p.codAmount || 0,
      conditionCharge: p.conditionCharge || p.codFee || 0,
      conditionChargeType: (p.conditionChargeType as any) || 'To-Pay',
      carryingCharge: p.carryingCharge || p.deliveryCharge || 0,
      carryingChargeType: (p.carryingChargeType as any) || 'To-Pay',
      vat: p.vat || 0,
      status: p.status || 'In Transit',
      settlementStatus: p.settlementStatus || 'Unsettled',
      consignmentId: p.consignmentId || p.cnNumber || '',
      deliveryType: (p.deliveryType as any) || 'O/D'
    });
  };

  // Save changes from Quick Edit Modal
  const handleSaveQuickEdit = async () => {
    if (!quickEditParcel) return;
    const branchName = quickEditData.destinationBranch.trim() 
      ? `${quickEditData.destinationBranch.trim()} Branch (${quickEditData.deliveryType})` 
      : `${quickEditData.district.trim()} Branch (${quickEditData.deliveryType})`;

    const condAmt = Number(quickEditData.conditionAmount) || Number(quickEditData.codAmount) || 0;
    const condChg = Number(quickEditData.conditionCharge) || 0;
    const carryChg = Number(quickEditData.carryingCharge) || 0;
    const condChgType = quickEditData.conditionChargeType || 'To-Pay';
    const carryChgType = quickEditData.carryingChargeType || 'To-Pay';
    const totCond = condAmt + condChg;
    const vatVal = Number(quickEditData.vat) || 0;
    const paidCalc = (condChgType === 'Cash' ? condChg : 0) + (carryChgType === 'Cash' ? carryChg : 0);
    const dueCalc = totCond + (carryChgType === 'To-Pay' ? carryChg : 0) + vatVal - paidCalc;

    const updated: CourierParcel = {
      ...quickEditParcel,
      customerName: quickEditData.customerName.trim(),
      customerPhone: quickEditData.customerPhone.trim(),
      shippingAddress: quickEditData.shippingAddress.trim(),
      destinationBranch: branchName,
      district: quickEditData.district.trim(),
      courier: quickEditData.courier as any,
      itemsSummary: quickEditData.itemsSummary.trim(),
      productQuantity: Number(quickEditData.productQuantity) || 1,
      weightKg: Number(quickEditData.weightKg) || 1,
      codAmount: condAmt,
      conditionAmount: condAmt,
      conditionCharge: condChg,
      conditionChargeType: condChgType,
      totalCondition: totCond,
      carryingCharge: carryChg,
      carryingChargeType: carryChgType,
      deliveryCharge: carryChg,
      codFee: condChg,
      vat: vatVal,
      totalPaid: paidCalc,
      totalDue: dueCalc,
      status: quickEditData.status,
      settlementStatus: quickEditData.settlementStatus || 'Unsettled',
      consignmentId: quickEditData.consignmentId.trim(),
      cnNumber: quickEditData.consignmentId.trim(),
      deliveryType: quickEditData.deliveryType as any,
      lastUpdated: new Date().toISOString()
    };

    setSaving(true);
    try {
      await onSaveParcel(updated);
      setQuickEditParcel(null);
      setSuccessToast(isBn ? `চালান #${updated.consignmentId} সফলভাবে আপডেট হয়েছে!` : `Consignment #${updated.consignmentId} updated!`);
      setTimeout(() => setSuccessToast(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Confirm delete handler
  const handleDeleteParcelConfirmed = async () => {
    if (!deleteConfirmParcel) return;
    setSaving(true);
    try {
      if (onDeleteParcel) {
        await onDeleteParcel(deleteConfirmParcel.id);
      }
      if (editingParcelId === deleteConfirmParcel.id) {
        setEditingParcelId(null);
        handleResetForm();
      }
      setSuccessToast(isBn ? `চালান #${deleteConfirmParcel.consignmentId || deleteConfirmParcel.cnNumber} সফলভাবে মুছে ফেলা হয়েছে!` : 'Consignment deleted successfully!');
      setTimeout(() => setSuccessToast(''), 4000);
      setDeleteConfirmParcel(null);
    } finally {
      setSaving(false);
    }
  };

  // Auto Generate Sequential Unique Memo Number (260001, 260002, 260003...)
  const handleGenerateCn = () => {
    const nextSeq = getNextAutoMemoNumber(recentParcels);
    setCustomCnNumber(nextSeq);
  };

  // Auto calculate carrying charge
  const handleEstimateDeliveryCharge = (targetDistrict: string, weight: number) => {
    const isInsideDhaka = targetDistrict.toLowerCase().includes('dhaka');
    let base = isInsideDhaka ? 60 : 140;
    if (weight > 1) {
      base += Math.round((weight - 1) * (isInsideDhaka ? 15 : 25));
    }
    setCarryingCharge(base);
  };

  // Save Booking Handler
  const handleSaveBooking = async (e?: React.FormEvent, openReceiptImmediately: boolean = false) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!customerName.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে কাস্টমারের নাম প্রদান করুন।' : 'Customer name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে কাস্টমারের মোবাইল নম্বর প্রদান করুন।' : 'Customer phone number is required.');
      return;
    }
    if (!shippingAddress.trim() && !destinationBranch.trim()) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে ডেলিভারি ঠিকানা বা শাখা উল্লেখ করুন।' : 'Delivery address or branch is required.');
      return;
    }
    if (!itemsSummary.trim()) {
      setErrorMessage(isBn ? 'পণ্যের নাম ও বিবরণ দিন।' : 'Product items summary is required.');
      return;
    }

    // Ensure unique, non-duplicate sequential Memo Number
    let finalCn = customCnNumber.trim();
    if (!finalCn) {
      finalCn = getNextAutoMemoNumber(recentParcels);
      setCustomCnNumber(finalCn);
    } else if (!editingParcelId && isMemoNumberDuplicate(finalCn, recentParcels, editingParcelId)) {
      finalCn = getNextAutoMemoNumber(recentParcels);
      setCustomCnNumber(finalCn);
    }
    
    // Tracking URL builder
    let trackUrl = '';
    if (courier === 'Janani') {
      trackUrl = `https://jananigroupbd.com/tracking?consignment=${finalCn}`;
    } else if (courier === 'Sundarban') {
      trackUrl = `https://sundarbancourierltd.com/tracking?cn=${finalCn}`;
    } else if (courier === 'Steadfast') {
      trackUrl = `https://steadfast.com.bd/t/${finalCn}`;
    } else if (courier === 'Pathao') {
      trackUrl = `https://merchant.pathao.com/tracking?consignment_id=${finalCn}`;
    } else if (courier === 'RedX') {
      trackUrl = `https://redx.com.bd/track/${finalCn}`;
    } else {
      trackUrl = `/track?id=${finalCn}`;
    }

    const existingParcel = editingParcelId ? recentParcels.find(p => p.id === editingParcelId) : null;
    const orderIdToUse = existingParcel?.orderId || selectedOrderId || `ord-manual-${Date.now().toString().slice(-5)}`;
    const trackingIdToUse = existingParcel?.trackingId || `TQW-${courier.slice(0, 3).toUpperCase()}-${finalCn.slice(-5)}`;

    const totalCond = conditionAmount + conditionCharge;
    const totalDueCalc = (conditionChargeType === 'To-Pay' ? conditionCharge : 0) + (carryingChargeType === 'To-Pay' ? carryingCharge : 0);

    const newParcel: CourierParcel = {
      id: editingParcelId || `cp-${Date.now()}`,
      orderId: orderIdToUse,
      trackingId: trackingIdToUse,
      consignmentId: finalCn,
      cnNumber: finalCn,
      courier,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim() || destinationBranch.trim(),
      district: district.trim() || 'Dhaka',
      deliveryLocation: destinationBranch.trim() || district.trim(),
      destinationBranch: destinationBranch.trim() ? `${destinationBranch.trim()} Branch (${deliveryType})` : `${district.trim()} Branch (${deliveryType})`,
      deliveryType: deliveryType === 'Branch / Office Pickup' || deliveryType === 'O/D' ? 'O/D' : 'H/D',
      itemsSummary: itemsSummary.trim(),
      productQuantity: productQuantity || 1,
      weightKg: weightKg || 1,
      codAmount: paymentMode === 'Condition (COD)' ? totalPayableByCustomer : 0,
      conditionAmount: paymentMode === 'Condition (COD)' ? conditionAmount : 0,
      conditionCharge,
      conditionChargeType,
      totalCondition: totalCond,
      carryingCharge,
      carryingChargeType,
      deliveryCharge: carryingCharge,
      codFee: conditionCharge,
      vat,
      totalPaid: carryingChargeType === 'Cash' ? carryingCharge : 0,
      totalDue: totalDueCalc,
      totalPayableByCourier: conditionAmount,
      amountInWords: amountInWords.trim() || `${numToWords(totalPayableByCustomer)} taka only`,
      status: existingParcel?.status || 'In Transit',
      trackingUrl: trackUrl,
      bookedAt: existingParcel?.bookedAt || new Date().toISOString(),
      bookingDateStr: bookingDateStr || new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      placeOfBooking: placeOfBooking.trim() || 'Konabari',
      senderName: senderName.trim() || 'Abdul Malek Molla',
      senderPhone: senderPhone.trim() || '01718-105642',
      senderAddress: senderAddress.trim() || 'হাজী ইয়াকুব মোল্লা সুপার মার্কেট, সারদাগঞ্জ, কাশিমপুর, গাজীপুর সিটি',
      bookingOfficer: bookingOfficer.trim() || 'Md. Rakib',
      lastUpdated: new Date().toISOString(),
      settlementStatus: editingParcelId ? editingSettlementStatus : (existingParcel?.settlementStatus || 'Unsettled'),
      notes: `${itemsSummary} - [${packageType}]`
    };

    setSaving(true);
    try {
      await onSaveParcel(newParcel);
      commitMemoNumber(finalCn);
      setLastSavedParcel(newParcel);
      setEditingParcelId(null);
      // Auto-increment memo number for the next booking immediately
      const nextSerial = getNextAutoMemoNumber([...recentParcels, newParcel]);
      setCustomCnNumber(nextSerial);
      if (openReceiptImmediately) {
        onPrintParcel(newParcel, 'voucher');
      } else {
        setSavedSuccessModal(true);
      }
    } catch (err) {
      setErrorMessage(isBn ? 'বুকিং সেভ করতে ত্রুটি হয়েছে।' : 'Error saving courier booking.');
    } finally {
      setSaving(false);
    }
  };

  // Generate Customer SMS / WhatsApp message
  const customerMessageText = lastSavedParcel 
    ? `সম্মানিত ${lastSavedParcel.customerName},\nতাকওয়া এন্টারপ্রাইজ থেকে আপনার পার্সেলটি [${lastSavedParcel.courier}] কুরিয়ারে সফলভাবে বুকিং করা হয়েছে।\n\n📌 মেমো নং: ${lastSavedParcel.consignmentId}\n📦 পণ্য: ${lastSavedParcel.itemsSummary}\n💰 কন্ডিশন / দেয় মূল্য: ৳${lastSavedParcel.codAmount || lastSavedParcel.conditionAmount}\n🚚 গন্তব্য শাখা: ${lastSavedParcel.destinationBranch || lastSavedParcel.district}\n\nঅনলাইনে লাইভ পার্সেল স্ট্যাটাস দেখতে ক্লিক করুন:\nhttps://taqwaenterprise.com/track?id=${lastSavedParcel.consignmentId}\n\nধন্যবাদ,\nতাকওয়া এন্টারপ্রাইজ\nহটলাইন: 01718-105642`
    : '';

  const handleCopyCustomerSms = () => {
    if (!customerMessageText) return;
    navigator.clipboard.writeText(customerMessageText);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      
      {/* 2. ORDER LINK / PRE-FILL SELECTOR (IF ORDERS AVAILABLE) */}
      {eligibleOrders.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950">
                {isBn ? 'পেন্ডিং স্টোর অর্ডার থেকে তথ্য আনুন:' : 'Auto-fill from Pending Store Orders:'}
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold">
                {isBn ? 'অর্ডার নির্বাচন করলে কাস্টমারের নাম, ফোন, ঠিকানা ও মূল্য স্বয়ংক্রিয়ভাবে পূরণ হবে।' : 'Select an order to pre-populate customer, address & COD amounts automatically.'}
              </p>
            </div>
          </div>

          <div className="min-w-[260px]">
            <select
              value={selectedOrderId}
              onChange={(e) => {
                const target = eligibleOrders.find(o => o.id === e.target.value);
                if (target) {
                  populateFromOrder(target);
                } else {
                  setSelectedOrderId('');
                }
              }}
              className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">{isBn ? '-- সরাসরি ম্যানুয়াল কাস্টমার বুকিং --' : '-- Direct Manual Booking --'}</option>
              {eligibleOrders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.trackingId} • {o.customerName} (৳{o.totalAmount}) - {o.district || 'Dhaka'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 font-black shadow-md animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800 font-bold animate-shake">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. MAIN COURIER BOOKING FORM */}
      <form ref={formRef} onSubmit={handleSaveBooking} className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        
        {/* EDIT MODE ACTIVE BANNER */}
        {editingParcelId && (
          <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-950">
                  {isBn ? '✏️ চালান এডিট মোড সক্রিয়' : '✏️ Parcel Edit Mode Active'} • CN #{customCnNumber}
                </p>
                <p className="text-xs text-amber-800 font-semibold mt-0.5">
                  {isBn 
                    ? `প্রাপক: ${customerName || '---'} (${customerPhone || '---'}) | কুরিয়ার: ${courier} — কাঙ্ক্ষিত তথ্য সংশোধন করে নিচে সেভ করুন।` 
                    : `Customer: ${customerName || '---'} | Courier: ${courier} — Update details and save below.`}
                </p>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center bg-white/90 p-1 rounded-xl border border-amber-300 gap-1 text-xs shadow-2xs">
                <span className="text-[11px] font-bold text-slate-600 px-1.5">{isBn ? 'সিওডি হিসাব:' : 'COD Status:'}</span>
                <button
                  type="button"
                  onClick={() => setEditingSettlementStatus('Settled')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                    editingSettlementStatus === 'Settled'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-700 bg-transparent'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>{isBn ? 'হিসাবভুক্ত' : 'Settled'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSettlementStatus('Unsettled')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                    editingSettlementStatus === 'Unsettled'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-amber-700 bg-transparent'
                  }`}
                >
                  <XCircle className="w-3 h-3" />
                  <span>{isBn ? 'অন্তর্ভুক্ত নয়' : 'Not Included'}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                {isBn ? '✕ এডিট বাতিল করুন' : '✕ Cancel Edit'}
              </button>
            </div>
          </div>
        )}
        
        {/* SECTION 1: COURIER SERVICE SELECTION & DELIVERY TYPE */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center">১</span>
            <h3 className="text-sm font-extrabold text-slate-900">
              {isBn ? 'কুরিয়ার সার্ভিস ও ডেলিভারির ধরন নির্বাচন' : 'Select Courier Service & Delivery Type'}
            </h3>
          </div>

          {/* Courier Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'Janani', name: isBn ? 'জননী এক্সপ্রেস' : 'Janani Express', badge: 'JEPS • স্লিপ প্রিন্ট', color: 'border-blue-600 bg-blue-50/70 text-blue-900' },
              { id: 'Sundarban', name: isBn ? 'সুন্দরবন কুরিয়ার' : 'Sundarban', badge: 'SCS • শাখা/হোম', color: 'border-teal-700 bg-teal-50/70 text-teal-950' },
              { id: 'Steadfast', name: isBn ? 'স্টিডফাস্ট' : 'Steadfast', badge: 'STF • হোম ডেলিভারি', color: 'border-emerald-600 bg-emerald-50/70 text-emerald-950' },
              { id: 'Pathao', name: isBn ? 'পাঠাও কুরিয়ার' : 'Pathao', badge: 'PTH • দ্রুততম', color: 'border-indigo-600 bg-indigo-50/70 text-indigo-950' },
              { id: 'SA Paribahan', name: isBn ? 'এস এ পরিবহন' : 'SA Paribahan', badge: 'SAP • কন্ডিশন', color: 'border-amber-600 bg-amber-50/70 text-amber-950' },
              { id: 'In-House Rider', name: isBn ? 'নিজস্ব রাইডার' : 'In-House Rider', badge: 'মিরপুর/ঢাকা লোকাল', color: 'border-slate-700 bg-slate-100 text-slate-900' },
            ].map(c => {
              const isSelected = courier === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCourier(c.id as any)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[76px] ${
                    isSelected 
                      ? `${c.color} shadow-sm ring-2 ring-blue-500/20` 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{c.name}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-blue-600" />}
                  </div>
                  <span className="text-[10px] font-bold opacity-75 mt-1 block font-mono">{c.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Delivery Type & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isBn ? 'ডেলিভারির ধরন (Delivery Type)' : 'Delivery Type'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('O/D')}
                  className={`py-2 px-3 rounded-xl border text-xs font-black cursor-pointer text-center transition-all ${
                    deliveryType === 'O/D' || deliveryType === 'Branch / Office Pickup'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  🏢 {isBn ? 'শাখা / অফিস ডেলিভারি (O/D)' : 'Branch Pickup (O/D)'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('H/D')}
                  className={`py-2 px-3 rounded-xl border text-xs font-black cursor-pointer text-center transition-all ${
                    deliveryType === 'H/D' || deliveryType === 'Home Delivery'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  🏠 {isBn ? 'হোম ডেলিভারি (H/D)' : 'Home Delivery (H/D)'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isBn ? 'পেমেন্ট শর্ত (Payment Mode)' : 'Payment Mode'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('Condition (COD)')}
                  className={`py-2 px-3 rounded-xl border text-xs font-black cursor-pointer text-center transition-all ${
                    paymentMode === 'Condition (COD)'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  💵 {isBn ? 'কন্ডিশন / সিওডি (COD)' : 'Condition (COD)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode('Prepaid (Paid)');
                    setConditionAmount(0);
                    setConditionCharge(0);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-black cursor-pointer text-center transition-all ${
                    paymentMode === 'Prepaid (Paid)'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  💳 {isBn ? 'প্রিপেইড / ক্যাশ পেইড' : 'Prepaid / Paid'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CUSTOMER / RECIPIENT INFORMATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">২</span>
            <h3 className="text-sm font-extrabold text-slate-900">
              {isBn ? 'প্রাপক / কাস্টমারের বিবরণ (Receiver Information)' : 'Customer / Receiver Details'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{isBn ? 'কাস্টমারের পুরো নাম *' : 'Customer Full Name *'}</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Abdur Rahamn"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{isBn ? 'মোবাইল নম্বর (প্রধান) *' : 'Primary Phone *'}</span>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="01724791612"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black font-mono text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{isBn ? 'বিকল্প মোবাইল নম্বর (ঐচ্ছিক)' : 'Alternative Mobile (Optional)'}</span>
              </label>
              <input
                type="tel"
                value={customerAltPhone}
                onChange={(e) => setCustomerAltPhone(e.target.value)}
                placeholder="018..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{isBn ? 'জেলা (District) *' : 'District *'}</span>
              </label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  if (!destinationBranch || destinationBranch === `${district} Branch`) {
                    setDestinationBranch(e.target.value);
                  }
                  handleEstimateDeliveryCharge(e.target.value, weightKg);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-hidden cursor-pointer"
              >
                {BD_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{isBn ? 'গন্তব্য শাখা / কুরিয়ার হাব *' : 'Destination Branch / Hub *'}</span>
              </label>
              <input
                type="text"
                required
                value={destinationBranch}
                onChange={(e) => setDestinationBranch(e.target.value)}
                placeholder="e.g. Laksam / Mirpur / Gazipur"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{isBn ? 'বিস্তারিত ডেলিভারি ঠিকানা *' : 'Detailed Address *'}</span>
              </label>
              <input
                type="text"
                required
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="e.g. Laksam, Comilla (Near Central Mosque)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: SENDER INFORMATION (TAQWA ENTERPRISE / PRESET) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-xs font-black flex items-center justify-center">৩</span>
            <h3 className="text-sm font-extrabold text-slate-900">
              {isBn ? 'প্রেরকের তথ্য (Sender / Shop Details)' : 'Sender Information'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{isBn ? 'প্রেরকের নাম' : 'Sender Name'}</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{isBn ? 'মোবাইল নম্বর' : 'Sender Mobile'}</label>
              <input
                type="text"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{isBn ? 'বুকিং কাউন্টার / শাখা' : 'Place of Booking'}</label>
              <input
                type="text"
                value={placeOfBooking}
                onChange={(e) => setPlaceOfBooking(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{isBn ? 'প্রেরকের ঠিকানা' : 'Sender Address'}</label>
              <input
                type="text"
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PRODUCT & PACKAGE SPECIFICATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">৪</span>
            <h3 className="text-sm font-extrabold text-slate-900">
              {isBn ? 'পণ্য ও প্যাকেজের বিবরণ (Parcel Items & Specs)' : 'Parcel Specification & Items'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">{isBn ? 'পণ্যের নাম ও বিবরণ *' : 'Products Details *'}</label>
              <input
                type="text"
                required
                value={itemsSummary}
                onChange={(e) => setItemsSummary(e.target.value)}
                placeholder="e.g. 1 Bosta Feed (25kg Pigeon / Bird Feed)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{isBn ? 'ওজন (কেজি) *' : 'Weight (Kg) *'}</label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                required
                value={weightKg}
                onChange={(e) => {
                  const w = Number(e.target.value) || 1;
                  setWeightKg(w);
                  handleEstimateDeliveryCharge(district, w);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black font-mono text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">{isBn ? 'পরিমাণ (Qty)' : 'Quantity'}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={productQuantity}
                  onChange={(e) => setProductQuantity(Number(e.target.value) || 1)}
                  className="w-20 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black font-mono text-slate-900 text-center"
                />
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value as any)}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value="ব্যাগ/বস্তা">ব্যাগ/বস্তা</option>
                  <option value="কার্টুন">কার্টুন</option>
                  <option value="প্যাকেট/বক্স">প্যাকেট/বক্স</option>
                  <option value="অন্যান্য">অন্যান্য</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">{isBn ? 'বিশেষ নির্দেশনা বা সতর্কতা' : 'Special Delivery Instructions'}</label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. ভঙ্গুর / কাঁচ নয় / দ্রুত ডেলিভারি নিশ্চিত করুন"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
            />
          </div>
        </div>

        {/* SECTION 5: FINANCIALS & CHARGES CALCULATION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-black flex items-center justify-center">৫</span>
            <h3 className="text-sm font-extrabold text-slate-900">
              {isBn ? 'আর্থিক হিসাব ও ভাউচার চার্জেস (Financials & Voucher Details)' : 'Financials, COD & Voucher Charges'}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Condition Amount */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">{isBn ? 'কন্ডিশন মূল্য (COD) ৳' : 'Condition Amount ৳'}</label>
              <input
                type="number"
                value={conditionAmount}
                disabled={paymentMode === 'Prepaid (Paid)'}
                onChange={(e) => setConditionAmount(Number(e.target.value) || 0)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-black font-mono text-emerald-700"
              />
            </div>

            {/* Condition Charge (Cash / To-Pay) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>{isBn ? 'কন্ডিশন চার্জ ৳' : 'Condition Charge ৳'}</span>
                <button
                  type="button"
                  onClick={() => setConditionChargeType(prev => prev === 'To-Pay' ? 'Cash' : 'To-Pay')}
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded cursor-pointer ${conditionChargeType === 'To-Pay' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-green-100 text-green-900 border border-green-300'}`}
                  title="Toggle Cash / To-Pay"
                >
                  {conditionChargeType}
                </button>
              </div>
              <input
                type="number"
                value={conditionCharge}
                onChange={(e) => setConditionCharge(Number(e.target.value) || 0)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono text-slate-800"
              />
            </div>

            {/* Total Condition */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-blue-900">{isBn ? 'মোট কন্ডিশন ৳ (Total Condition)' : 'Total Condition ৳'}</label>
              <div className="w-full p-2 bg-blue-50/70 border border-blue-200 rounded-lg text-xs font-black font-mono text-blue-900">
                ৳{(conditionAmount + conditionCharge).toLocaleString()}
              </div>
            </div>

            {/* Carrying Charge (Cash / To-Pay) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>{isBn ? 'ক্যারিং চার্জ ৳' : 'Carrying Charge ৳'}</span>
                <button
                  type="button"
                  onClick={() => setCarryingChargeType(prev => prev === 'To-Pay' ? 'Cash' : 'To-Pay')}
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded cursor-pointer ${carryingChargeType === 'To-Pay' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-green-100 text-green-900 border border-green-300'}`}
                  title="Toggle Cash / To-Pay"
                >
                  {carryingChargeType}
                </button>
              </div>
              <input
                type="number"
                value={carryingCharge}
                onChange={(e) => setCarryingCharge(Number(e.target.value) || 0)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono text-slate-800"
              />
            </div>

            {/* VAT */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">{isBn ? 'ভ্যাট (VAT) ৳' : 'VAT ৳'}</label>
              <input
                type="number"
                value={vat}
                onChange={(e) => setVat(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono text-slate-800"
              />
            </div>

            {/* Total Paid */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-emerald-700">{isBn ? 'পরিশোধিত (Paid) ৳' : 'Total Paid ৳'}</label>
              <div className="w-full p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-black font-mono text-emerald-800">
                ৳{((conditionChargeType === 'Cash' ? conditionCharge : 0) + (carryingChargeType === 'Cash' ? carryingCharge : 0)).toLocaleString()}
              </div>
            </div>

            {/* Total Due */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-rose-700">{isBn ? 'বাকি/প্রদেয় (Due) ৳' : 'Total Due ৳'}</label>
              <div className="w-full p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs font-black font-mono text-rose-800">
                ৳{((conditionAmount + conditionCharge) + (carryingChargeType === 'To-Pay' ? carryingCharge : 0) + vat - ((conditionChargeType === 'Cash' ? conditionCharge : 0) + (carryingChargeType === 'Cash' ? carryingCharge : 0))).toLocaleString()}
              </div>
            </div>

            {/* Booking Officer */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600">{isBn ? 'বুকিং কর্মকর্তা' : 'Booking Officer'}</label>
              <input
                type="text"
                value={bookingOfficer}
                onChange={(e) => setBookingOfficer(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* SECTION 6: MEMO NUMBER & DATES */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center">৬</span>
            <h3 className="text-sm font-extrabold text-slate-900">
              {isBn ? 'মেমো নম্বর ও রসিদ সময় (Memo No. & Booking Details)' : 'Memo Number & Booking Details'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {isBn ? 'মেমো নম্বর (Memo No.) *' : 'Memo Number (Memo No.) *'}
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCn}
                  className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  <span>{isBn ? 'অটো মেমো নং' : 'Auto Memo No'}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={customCnNumber}
                onChange={(e) => setCustomCnNumber(e.target.value)}
                placeholder="e.g. 260001"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black font-mono text-red-600 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-500 font-medium">
                {isBn ? 'স্বয়ংক্রিয় ধারাবাহিক মেমো নম্বর (যেমন: 260001, 260002, 260003)। কোনো ডুপ্লিকেট হবে না।' : 'Sequential unique Memo No. (e.g. 260001, 260002, 260003). Guaranteed no duplicates.'}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{isBn ? 'বুকিং তারিখ ও সময়' : 'Booking Date & Time'}</span>
              </label>
              <input
                type="text"
                value={bookingDateStr}
                onChange={(e) => setBookingDateStr(e.target.value)}
                placeholder="01-9-2026, 12:23 pm"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPREHENSIVE BOTTOM ACTION SECTION: বুকিং সংরক্ষণ ও রশিদ দেখুন */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t-2 border-slate-200 space-y-4">

          {/* Real-time Parcel Booking Summary Data Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {isBn ? 'পার্সেল বুকিং সারাংশ ও লাইভ চার্জ ডাটা' : 'Parcel Booking Summary & COD Data'}
                </span>
              </div>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-lg text-xs font-black uppercase font-mono">
                {courier} • {deliveryType}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'প্রাপক / কাস্টমার' : 'Customer'}</p>
                <p className="font-extrabold text-slate-800 text-sm">
                  {customerName.trim() ? customerName : (isBn ? 'নাম লিখুন' : 'Enter name')}
                </p>
                <p className="text-[11px] font-mono font-bold text-slate-500">{customerPhone || '---'}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'গন্তব্য শাখা / ঠিকানা' : 'Destination / Branch'}</p>
                <p className="font-extrabold text-slate-800">
                  {destinationBranch || district || (isBn ? 'শাখা/জেলা নির্বাচন করুন' : 'Select branch')}
                </p>
                <p className="text-[11px] text-slate-500 truncate max-w-[200px]" title={shippingAddress}>
                  {shippingAddress || '---'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'পণ্য ও মেমো নং' : 'Items & Memo #'}</p>
                <p className="font-bold text-slate-700 truncate max-w-[200px]" title={itemsSummary}>
                  {itemsSummary || '---'} ({weightKg} kg)
                </p>
                <p className="text-[11px] font-mono font-bold text-blue-700">
                  Memo: {customCnNumber || 'Auto-generated'}
                </p>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-xl p-2.5 flex flex-col justify-center">
                <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">
                  {isBn ? 'কাস্টমার থেকে আদায়যোগ্য (COD)' : 'Total Collectible / COD'}
                </p>
                <div className="text-xl font-black font-mono text-emerald-700">
                  ৳{totalPayableByCustomer.toLocaleString()}
                </div>
                <p className="text-[9px] text-emerald-600 font-semibold truncate">
                  {amountInWords}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            
            <div className="flex flex-wrap items-center gap-2 order-2 sm:order-1">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isBn ? 'রিসেট / ক্লিয়ার' : 'Clear Form'}</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {saving ? (
                  <span>{isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{isBn ? '💾 শুধু বুকিং সংরক্ষণ' : 'Save Booking Only'}</span>
                  </>
                )}
              </button>

              {lastSavedParcel && (
                <button
                  type="button"
                  onClick={() => onPrintParcel(lastSavedParcel, 'voucher')}
                  className="px-4 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ring-1 ring-amber-400/40"
                  title="সর্বশেষ চালানের রশিদ দেখুন"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isBn ? `রশিদ (মেমো #${lastSavedParcel.consignmentId})` : `Receipt (Memo #${lastSavedParcel.consignmentId})`}</span>
                </button>
              )}
            </div>

            {/* PRIMARY HIGHLIGHTED BUTTON: বুকিং সংরক্ষণ ও রশিদ দেখুন */}
            <div className="order-1 sm:order-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveBooking(undefined, true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-sm sm:text-base rounded-2xl cursor-pointer flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all ring-2 ring-amber-500/60 hover:scale-[1.01]"
                id="btn-save-and-view-receipt"
              >
                {saving ? (
                  <span>{isBn ? 'সংরক্ষণ ও রশিদ তৈরি হচ্ছে...' : 'Saving & Generating Receipt...'}</span>
                ) : (
                  <>
                    <FileText className="w-5 h-5 text-slate-950" />
                    <span>
                      {editingParcelId 
                        ? (isBn ? '💾 পরিবর্তন সংরক্ষণ ও রশিদ দেখুন' : 'Save Changes & View Receipt')
                        : (isBn ? '📜 বুকিং সংরক্ষণ ও রশিদ দেখুন' : 'Save Booking & View Receipt')}
                    </span>
                  </>
                )}
              </button>
            </div>

          </div>

          <p className="text-[11px] text-slate-400 text-center sm:text-left font-medium pt-1">
            {isBn 
              ? '💡 "বুকিং সংরক্ষণ ও রশিদ দেখুন" বাটনে চাপ দিলে চালানটি ট্র্যাকিং লেজারে সংরক্ষিত হবে এবং সাথে সাথে প্রিন্ট/রশিদ ভিউয়ার প্রদর্শিত হবে।' 
              : '💡 Clicking "Save Booking & View Receipt" records the consignment and opens the official printable receipt.'}
          </p>

        </div>

      </form>

      {/* ========================================================================= */}
      {/* 4. RECENT BOOKED CONSIGNMENTS & TRACKING LEDGER SECTION */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-900 text-amber-300 rounded-2xl shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>{isBn ? 'সাম্প্রতিক বুকিংকৃত পার্সেল লেজার ও চালান ডাটা' : 'Recent Booked Parcels & Consignment Records'}</span>
                <span className="bg-blue-100 text-blue-950 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-blue-200">
                  {recentParcels.length} {isBn ? 'টি রেকর্ড' : 'Parcels'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isBn 
                  ? 'অফিসিয়াল ভাউচারের প্রতিটি হিসাব (Products Details, QTY, Condition, Charges, VAT, Paid/Due) এই লেজারে প্রদর্শিত হচ্ছে।' 
                  : 'Full voucher breakdown with Products Details, QTY, Condition Amount, Charges, VAT and Paid/Due.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle: Full Voucher Ledger vs Compact */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setLedgerViewMode('voucher')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
                  ledgerViewMode === 'voucher'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isBn ? 'অফিসিয়াল ভাউচার লেজার ভিউ' : 'Full Voucher Ledger'}
              >
                <FileText className="w-3.5 h-3.5 text-amber-300" />
                <span>{isBn ? '📜 ভাউচার লেজার' : 'Voucher Ledger'}</span>
              </button>
              <button
                type="button"
                onClick={() => setLedgerViewMode('compact')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
                  ledgerViewMode === 'compact'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isBn ? 'সংক্ষিপ্ত সারসংক্ষেপ ভিউ' : 'Compact View'}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{isBn ? '📋 সাধারণ ভিউ' : 'Compact View'}</span>
              </button>
            </div>

            {/* Quick Search in Ledger */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                placeholder={isBn ? 'মেমো / কাস্টমার / ফোন...' : 'Search memo / customer...'}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 w-44 sm:w-56 focus:bg-white focus:outline-hidden"
              />
              {ledgerSearch && (
                <button
                  type="button"
                  onClick={() => setLedgerSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {recentParcels.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-2">
            <Package className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              {isBn ? 'এখনো কোনো পার্সেল বুকিং রেকর্ড সেভ করা হয়নি।' : 'No parcel booking records saved yet.'}
            </p>
            <p className="text-[11px] text-slate-400">
              {isBn ? 'উপরের ফরম পূরণ করে "বুকিং সংরক্ষণ ও রশিদ দেখুন" বাটনে চাপ দিলে এখানে চালান ডাটা দেখা যাবে।' : 'Fill in the form above and click "Save Booking & View Receipt" to see records here.'}
            </p>
          </div>
        ) : (
          (() => {
            const filteredLedgerParcels = recentParcels.filter(p => {
              if (!ledgerSearch.trim()) return true;
              const q = ledgerSearch.toLowerCase().trim();
              return (
                (p.consignmentId || '').toLowerCase().includes(q) ||
                (p.cnNumber || '').toLowerCase().includes(q) ||
                (p.customerName || '').toLowerCase().includes(q) ||
                (p.customerPhone || '').toLowerCase().includes(q) ||
                (p.destinationBranch || '').toLowerCase().includes(q) ||
                (p.district || '').toLowerCase().includes(q) ||
                (p.itemsSummary || '').toLowerCase().includes(q)
              );
            });

            if (filteredLedgerParcels.length === 0) {
              return (
                <div className="p-6 text-center border border-slate-200 rounded-2xl bg-slate-50 text-slate-500 text-xs">
                  {isBn ? `"${ledgerSearch}" এর সাথে মিল রয়েছে এমন কোনো চালান পাওয়া যায়নি।` : `No parcels match "${ledgerSearch}".`}
                </div>
              );
            }

            if (ledgerViewMode === 'voucher') {
              return (
                <div className="overflow-x-auto border-2 border-slate-600 rounded-xl shadow-xs">
                  <table className="w-full text-left text-xs border-collapse font-sans min-w-[980px]">
                    <thead>
                      {/* TIER 1 HEADER */}
                      <tr className="bg-slate-100 text-slate-800 font-extrabold border-b border-slate-600 text-[10.5px]">
                        <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-600 text-center uppercase tracking-wider bg-slate-200/70">
                          {isBn ? 'মেমো / কুরিয়ার' : 'Memo / Courier'}
                        </th>
                        <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-600 uppercase tracking-wider bg-slate-200/70">
                          {isBn ? 'প্রাপক ও শাখা' : 'Receiver & Branch'}
                        </th>
                        <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-600 text-left font-black text-red-700 text-xs tracking-wide">
                          Products Details
                        </th>
                        <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-600 text-center font-black text-red-700 text-xs tracking-wide">
                          QTY.
                        </th>
                        <th rowSpan={2} className="py-2.5 px-2.5 border-r border-slate-600 text-right font-black text-red-700 text-xs tracking-wide">
                          Condition Amount
                        </th>
                        <th colSpan={2} className="py-1 px-2 border-r border-slate-600 text-center font-black text-red-700 text-xs tracking-wide">
                          Condition Charge
                        </th>
                        <th rowSpan={2} className="py-2.5 px-2.5 border-r border-slate-600 text-right font-black text-red-700 text-xs tracking-wide">
                          Total Condition
                        </th>
                        <th colSpan={2} className="py-1 px-2 border-r border-slate-600 text-center font-black text-red-700 text-xs tracking-wide">
                          Carrying Charge
                        </th>
                        <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-600 text-center font-black text-red-700 text-xs tracking-wide">
                          VAT
                        </th>
                        <th colSpan={2} className="py-1 px-2 border-r border-slate-600 text-center font-black text-red-700 text-xs tracking-wide">
                          Total
                        </th>
                        <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-600 text-center bg-slate-200/70 uppercase">
                          {isBn ? 'স্ট্যাটাস' : 'Status'}
                        </th>
                        <th rowSpan={2} className="py-2.5 px-3 text-center bg-slate-200/70 uppercase">
                          {isBn ? 'রশিদ ও অ্যাকশন' : 'Receipt & Actions'}
                        </th>
                      </tr>

                      {/* TIER 2 SUB-HEADER */}
                      <tr className="bg-slate-50 text-[10px] font-black border-b border-slate-600 text-slate-800">
                        <th className="py-1 px-2 border-r border-slate-600 text-center font-bold text-slate-700">Cash</th>
                        <th className="py-1 px-2 border-r border-slate-600 text-center font-bold text-slate-700">To-Pay</th>
                        <th className="py-1 px-2 border-r border-slate-600 text-center font-bold text-slate-700">Cash</th>
                        <th className="py-1 px-2 border-r border-slate-600 text-center font-bold text-slate-700">To-Pay</th>
                        <th className="py-1 px-2 border-r border-slate-600 text-center font-bold text-slate-700">Paid</th>
                        <th className="py-1 px-2 border-r border-slate-600 text-center font-bold text-slate-700">Due</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-300 text-slate-800 font-semibold">
                      {filteredLedgerParcels.map(p => {
                        const condAmount = p.conditionAmount ?? p.codAmount ?? 0;
                        const condCharge = p.conditionCharge ?? p.codFee ?? 0;
                        const isCondCash = p.conditionChargeType === 'Cash';
                        const totCond = p.totalCondition || (condAmount + condCharge);
                        const carryCharge = p.carryingCharge ?? p.deliveryCharge ?? 0;
                        const isCarryCash = p.carryingChargeType === 'Cash';
                        const vatVal = p.vat || 0;
                        const paidVal = p.totalPaid !== undefined ? p.totalPaid : ((isCondCash ? condCharge : 0) + (isCarryCash ? carryCharge : 0));
                        const dueVal = p.totalDue !== undefined ? p.totalDue : (totCond + (!isCarryCash ? carryCharge : 0) + vatVal - paidVal);

                        return (
                          <tr key={p.id} className="hover:bg-amber-50/50 transition-colors">
                            {/* Memo / Courier */}
                            <td className="py-2.5 px-3 border-r border-slate-300">
                              <div className="font-mono font-black text-blue-950 text-xs">
                                {p.consignmentId || p.cnNumber}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                                  p.courier === 'Steadfast' ? 'bg-emerald-100 text-emerald-900' :
                                  p.courier === 'Pathao' ? 'bg-indigo-100 text-indigo-900' :
                                  p.courier === 'RedX' ? 'bg-rose-100 text-rose-900' :
                                  p.courier === 'Sundarban' ? 'bg-teal-100 text-teal-900' :
                                  'bg-blue-100 text-blue-900'
                                }`}>
                                  {p.courier}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {p.bookingDateStr?.split(',')[0] || new Date(p.bookedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </td>

                            {/* Receiver & Branch */}
                            <td className="py-2.5 px-3 border-r border-slate-300">
                              <p className="font-black text-slate-900 text-xs">{p.customerName}</p>
                              <p className="text-[10px] font-mono text-slate-600">{p.customerPhone}</p>
                              <p className="text-[10px] text-blue-900 font-bold truncate max-w-[140px]" title={p.destinationBranch || p.district}>
                                📍 {p.destinationBranch || p.district}
                              </p>
                            </td>

                            {/* Products Details */}
                            <td className="py-2.5 px-3 border-r border-slate-300 max-w-[180px]">
                              <p className="font-bold text-slate-900 truncate" title={p.itemsSummary}>
                                {p.itemsSummary || 'Pigeon / Bird Feed'}
                              </p>
                              {p.weightKg && (
                                <span className="text-[10px] text-slate-500 font-mono">({p.weightKg} kg)</span>
                              )}
                            </td>

                            {/* QTY. */}
                            <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono font-black text-slate-900">
                              {p.productQuantity || 1}
                            </td>

                            {/* Condition Amount */}
                            <td className="py-2.5 px-2.5 border-r border-slate-300 text-right font-mono font-black text-emerald-800">
                              ৳{condAmount.toLocaleString()}
                            </td>

                            {/* Condition Charge: Cash */}
                            <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono text-[11px]">
                              {isCondCash && condCharge > 0 ? (
                                <span className="font-black text-emerald-700">৳{condCharge}</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* Condition Charge: To-Pay */}
                            <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono text-[11px]">
                              {!isCondCash && condCharge > 0 ? (
                                <span className="font-black text-amber-800">৳{condCharge}</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* Total Condition */}
                            <td className="py-2.5 px-2.5 border-r border-slate-300 text-right font-mono font-black text-blue-950 bg-blue-50/40">
                              ৳{totCond.toLocaleString()}
                            </td>

                            {/* Carrying Charge: Cash */}
                            <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono text-[11px]">
                              {isCarryCash && carryCharge > 0 ? (
                                <span className="font-black text-emerald-700">৳{carryCharge}</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* Carrying Charge: To-Pay */}
                            <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono text-[11px]">
                              {!isCarryCash && carryCharge > 0 ? (
                                <span className="font-black text-amber-800">৳{carryCharge}</span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>

                            {/* VAT */}
                            <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono text-[11px]">
                              {vatVal > 0 ? `৳${vatVal}` : <span className="text-slate-300">0</span>}
                            </td>

                            {/* Total: Paid */}
                            <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono font-black text-emerald-800 bg-emerald-50/40">
                              {paidVal > 0 ? `৳${paidVal.toLocaleString()}` : <span className="text-slate-400">0</span>}
                            </td>

                            {/* Total: Due */}
                            <td className="py-2.5 px-2 border-r border-slate-300 text-center font-mono font-black text-rose-700 bg-rose-50/40">
                              ৳{dueVal.toLocaleString()}
                            </td>

                            {/* Status */}
                            <td className="py-2.5 px-2 border-r border-slate-300 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black ${
                                p.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                                p.status === 'In Transit' ? 'bg-purple-100 text-purple-800' :
                                p.status === 'Picked Up' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {p.status}
                              </span>
                              <span className={`block mt-1 text-[8.5px] font-bold ${
                                p.settlementStatus === 'Settled' ? 'text-emerald-700' : 'text-amber-700'
                              }`}>
                                {p.settlementStatus === 'Settled' ? '✓ হিসাবভুক্ত' : 'অমীমাংসিত'}
                              </span>
                            </td>

                            {/* Actions & Receipt */}
                            <td className="py-2.5 px-2.5 text-center">
                              <div className="flex items-center justify-center gap-1 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => onPrintParcel(p, 'voucher')}
                                  className="px-2 py-1 bg-blue-950 hover:bg-blue-900 text-white rounded-lg text-[10.5px] font-black cursor-pointer flex items-center gap-1 shadow-xs ring-1 ring-amber-400/50"
                                  title={isBn ? 'অফিসিয়াল CN রশিদ দেখুন ও প্রিন্ট করুন' : 'View & Print Receipt'}
                                >
                                  <FileText className="w-3 h-3 text-amber-300" />
                                  <span>{isBn ? 'রশিদ' : 'Receipt'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openQuickEdit(p)}
                                  className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs cursor-pointer border border-amber-300"
                                  title={isBn ? 'চালান তথ্য দ্রুত এডিট' : 'Edit Parcel'}
                                >
                                  <Edit3 className="w-3 h-3 text-amber-700" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmParcel(p)}
                                  className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs cursor-pointer border border-rose-200"
                                  title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                                >
                                  <Trash2 className="w-3 h-3 text-rose-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* TFOOT TOTALS */}
                    <tfoot>
                      <tr className="bg-slate-100 font-black text-slate-900 text-[10px] border-t-2 border-slate-700">
                        <td colSpan={3} className="py-2.5 px-3 border-r border-slate-600 text-right uppercase tracking-wider bg-slate-200/80">
                          {isBn ? 'সর্বমোট (Total Ledger Summary):' : 'Total Ledger Summary:'}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-600 text-center font-mono text-xs">
                          {filteredLedgerParcels.reduce((sum, p) => sum + (p.productQuantity || 1), 0)}
                        </td>
                        <td className="py-2.5 px-2.5 border-r border-slate-600 text-right font-mono text-emerald-800 text-xs">
                          ৳{filteredLedgerParcels.reduce((sum, p) => sum + (p.conditionAmount ?? p.codAmount ?? 0), 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-600 text-center font-mono text-emerald-700">
                          ৳{filteredLedgerParcels.reduce((sum, p) => sum + (p.conditionChargeType === 'Cash' ? (p.conditionCharge || 0) : 0), 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-600 text-center font-mono text-amber-800">
                          ৳{filteredLedgerParcels.reduce((sum, p) => sum + (p.conditionChargeType !== 'Cash' ? (p.conditionCharge || 0) : 0), 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2.5 border-r border-slate-600 text-right font-mono text-blue-950 bg-blue-100/60 text-xs">
                          ৳{filteredLedgerParcels.reduce((sum, p) => sum + (p.totalCondition || ((p.conditionAmount ?? p.codAmount ?? 0) + (p.conditionCharge || 0))), 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-600 text-center font-mono text-emerald-700">
                          ৳{filteredLedgerParcels.reduce((sum, p) => sum + (p.carryingChargeType === 'Cash' ? (p.carryingCharge || p.deliveryCharge || 0) : 0), 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-600 text-center font-mono text-amber-800">
                          ৳{filteredLedgerParcels.reduce((sum, p) => sum + (p.carryingChargeType !== 'Cash' ? (p.carryingCharge || p.deliveryCharge || 0) : 0), 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-600 text-center font-mono">
                          ৳{filteredLedgerParcels.reduce((sum, p) => sum + (p.vat || 0), 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-600 text-center font-mono text-emerald-800 bg-emerald-100/60 text-xs">
                          ৳{filteredLedgerParcels.reduce((sum, p) => {
                            const isCondCash = p.conditionChargeType === 'Cash';
                            const isCarryCash = p.carryingChargeType === 'Cash';
                            const condCharge = p.conditionCharge || p.codFee || 0;
                            const carryCharge = p.carryingCharge || p.deliveryCharge || 0;
                            const paid = p.totalPaid !== undefined ? p.totalPaid : ((isCondCash ? condCharge : 0) + (isCarryCash ? carryCharge : 0));
                            return sum + paid;
                          }, 0).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 border-r border-slate-600 text-center font-mono text-rose-800 bg-rose-100/60 text-xs">
                          ৳{filteredLedgerParcels.reduce((sum, p) => {
                            const condAmount = p.conditionAmount ?? p.codAmount ?? 0;
                            const condCharge = p.conditionCharge ?? p.codFee ?? 0;
                            const isCondCash = p.conditionChargeType === 'Cash';
                            const totCond = p.totalCondition || (condAmount + condCharge);
                            const carryCharge = p.carryingCharge ?? p.deliveryCharge ?? 0;
                            const isCarryCash = p.carryingChargeType === 'Cash';
                            const vatVal = p.vat || 0;
                            const paidVal = p.totalPaid !== undefined ? p.totalPaid : ((isCondCash ? condCharge : 0) + (isCarryCash ? carryCharge : 0));
                            const dueVal = p.totalDue !== undefined ? p.totalDue : (totCond + (!isCarryCash ? carryCharge : 0) + vatVal - paidVal);
                            return sum + dueVal;
                          }, 0).toLocaleString()}
                        </td>
                        <td colSpan={2} className="py-2.5 px-3 text-center text-slate-600 font-bold text-[10px] bg-slate-200/80">
                          {filteredLedgerParcels.length} {isBn ? 'টি চালান' : 'Parcels'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            }

            // Compact View
            return (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-3.5">Consignment / Courier</th>
                      <th className="py-3 px-3">Customer & Phone</th>
                      <th className="py-3 px-3">Branch / Location</th>
                      <th className="py-3 px-3 text-center">Items & Weight</th>
                      <th className="py-3 px-3 text-right">COD / Payable</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3.5 text-center">Receipt & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {filteredLedgerParcels.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-slate-900">{p.consignmentId || p.cnNumber}</span>
                          </div>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                            p.courier === 'Steadfast' ? 'bg-emerald-100 text-emerald-900' :
                            p.courier === 'Pathao' ? 'bg-indigo-100 text-indigo-900' :
                            p.courier === 'RedX' ? 'bg-rose-100 text-rose-900' :
                            p.courier === 'Sundarban' ? 'bg-teal-100 text-teal-900' :
                            'bg-blue-100 text-blue-900'
                          }`}>
                            {p.courier}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-extrabold text-slate-900 text-xs">{p.customerName}</p>
                          <p className="text-[11px] font-mono text-slate-500">{p.customerPhone}</p>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-800 text-xs">{p.destinationBranch || p.district}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[160px]" title={p.shippingAddress}>
                            {p.shippingAddress}
                          </p>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-slate-800">{p.productQuantity || 1} pcs</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{p.weightKg || 1} kg</span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <span className="font-mono font-black text-emerald-700 text-sm">
                            ৳{(p.codAmount || p.conditionAmount || 0).toLocaleString()}
                          </span>
                          <span className="block text-[9px] text-slate-400 uppercase">{p.codAmount ? 'COD' : 'PAID'}</span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            p.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'In Transit' ? 'bg-purple-100 text-purple-800' :
                            p.status === 'Picked Up' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => onPrintParcel(p, 'voucher')}
                              className="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-[11px] font-bold cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
                              title={isBn ? 'চালান রশিদ দেখুন ও প্রিন্ট করুন' : 'View & Print Receipt'}
                            >
                              <FileText className="w-3 h-3 text-amber-300" />
                              <span>{isBn ? 'রশিদ' : 'Receipt'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onPrintParcel(p, 'thermal')}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs cursor-pointer border border-slate-300 transition-colors"
                              title={isBn ? 'থার্মাল স্টিকার প্রিন্ট' : 'Thermal Sticker Print'}
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            {p.trackingUrl && (
                              <a
                                href={p.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
                                title={isBn ? 'লাইভ ট্র্যাক করুন' : 'Track Consignment'}
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => openQuickEdit(p)}
                              className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-[11px] font-extrabold cursor-pointer border border-amber-300 flex items-center gap-1 transition-colors"
                              title={isBn ? 'চালান তথ্য এডিট করুন' : 'Edit Parcel'}
                            >
                              <Edit3 className="w-3 h-3 text-amber-700" />
                              <span>{isBn ? 'এডিট' : 'Edit'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmParcel(p)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs cursor-pointer border border-rose-200 transition-colors"
                              title={isBn ? 'পার্সেল রেকর্ড মুছে ফেলুন' : 'Delete Parcel Record'}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: POST-SAVE SUCCESS & INSTANT PRINT / SHARE ACTION */}
      {/* ========================================================================= */}
      {savedSuccessModal && lastSavedParcel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-scale-up p-6 space-y-5">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                {isBn ? 'কুরিয়ার বুকিং সফলভাবে সংরক্ষিত হয়েছে!' : 'Courier Booking Successfully Saved!'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isBn 
                  ? `মেমো #${lastSavedParcel.consignmentId} ডাটাবেজ ও পার্সেল ট্র্যাকিং লেজারে সেভ করা হয়েছে।` 
                  : `Memo #${lastSavedParcel.consignmentId} has been securely saved to the database and tracking ledger.`}
              </p>
            </div>

            {/* Quick Parcel Snapshot */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">{isBn ? 'কুরিয়ার ও মেমো নং:' : 'Courier & Memo:'}</span>
                <span className="font-extrabold text-blue-900 font-mono">{lastSavedParcel.courier} • {lastSavedParcel.consignmentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">{isBn ? 'প্রাপক:' : 'Customer:'}</span>
                <span className="font-extrabold text-slate-800">{lastSavedParcel.customerName} ({lastSavedParcel.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">{isBn ? 'গন্তব্য শাখা:' : 'Branch:'}</span>
                <span className="font-bold text-slate-700">{lastSavedParcel.destinationBranch || lastSavedParcel.district}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                <span className="text-slate-600">{isBn ? 'মোট কন্ডিশন / দেয়:' : 'Condition Amount:'}</span>
                <span className="font-mono text-emerald-700 font-black text-sm">৳{lastSavedParcel.codAmount || lastSavedParcel.conditionAmount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSavedSuccessModal(false);
                  onPrintParcel(lastSavedParcel, 'voucher');
                }}
                className="p-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2 shadow-sm ring-1 ring-amber-400/40"
              >
                <FileText className="w-4 h-4 text-amber-300" />
                <span>{isBn ? '📜 বুকিং রশিদ দেখুন ও প্রিন্ট' : 'View & Print Memo Receipt'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSavedSuccessModal(false);
                  onPrintParcel(lastSavedParcel, 'thermal');
                }}
                className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>{isBn ? '🏷️ ৪x৬ থার্মাল স্টিকার প্রিন্ট' : 'Print Thermal Label'}</span>
              </button>
            </div>

            {/* Copy SMS to Customer */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyCustomerSms}
                className="w-full p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2 border border-slate-300 transition-all"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{copiedSms ? (isBn ? '✓ মেসেজ কপি সম্পন্ন!' : '✓ Message Copied!') : (isBn ? '📲 কাস্টমারের জন্য SMS / WhatsApp মেসেজ কপি করুন' : 'Copy SMS / WhatsApp Text')}</span>
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setSavedSuccessModal(false);
                  handleResetForm();
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন ও আরেকটি বুকিং করুন' : 'Close & Book Another'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK EDIT PARCEL */}
      {/* ========================================================================= */}
      {quickEditParcel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 my-8 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500 text-white rounded-xl">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {isBn ? 'মেমো ও পার্সেল তথ্য দ্রুত এডিট করুন' : 'Quick Edit Parcel'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    মেমো #{quickEditParcel.consignmentId || quickEditParcel.cnNumber} • {quickEditParcel.courier}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditParcel(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'কাস্টমারের নাম' : 'Customer Name'}</label>
                <input
                  type="text"
                  value={quickEditData.customerName}
                  onChange={e => setQuickEditData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'মোবাইল নম্বর' : 'Phone Number'}</label>
                <input
                  type="text"
                  value={quickEditData.customerPhone}
                  onChange={e => setQuickEditData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'জেলা' : 'District'}</label>
                <select
                  value={quickEditData.district}
                  onChange={e => setQuickEditData(prev => ({ ...prev, district: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  {BD_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'গন্তব্য শাখা / ব্রাঞ্চ' : 'Destination Branch'}</label>
                <input
                  type="text"
                  value={quickEditData.destinationBranch}
                  onChange={e => setQuickEditData(prev => ({ ...prev, destinationBranch: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  placeholder="e.g. Laksam"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'ডেলিভারি ঠিকানা' : 'Shipping Address'}</label>
                <input
                  type="text"
                  value={quickEditData.shippingAddress}
                  onChange={e => setQuickEditData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'পণ্যের বিবরণ (Products Details)' : 'Products Details'}</label>
                <input
                  type="text"
                  value={quickEditData.itemsSummary}
                  onChange={e => setQuickEditData(prev => ({ ...prev, itemsSummary: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'পরিমাণ (QTY.)' : 'Quantity (QTY.)'}</label>
                <input
                  type="number"
                  value={quickEditData.productQuantity}
                  onChange={e => setQuickEditData(prev => ({ ...prev, productQuantity: Number(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'কন্ডিশন মূল্য ৳ (Condition Amount)' : 'Condition Amount ৳'}</label>
                <input
                  type="number"
                  value={quickEditData.conditionAmount}
                  onChange={e => setQuickEditData(prev => ({ ...prev, conditionAmount: Number(e.target.value) || 0, codAmount: Number(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-black text-emerald-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-bold">{isBn ? 'কন্ডিশন চার্জ ৳' : 'Condition Charge ৳'}</label>
                  <button
                    type="button"
                    onClick={() => setQuickEditData(prev => ({ ...prev, conditionChargeType: prev.conditionChargeType === 'Cash' ? 'To-Pay' : 'Cash' }))}
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded cursor-pointer ${quickEditData.conditionChargeType === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                  >
                    {quickEditData.conditionChargeType}
                  </button>
                </div>
                <input
                  type="number"
                  value={quickEditData.conditionCharge}
                  onChange={e => setQuickEditData(prev => ({ ...prev, conditionCharge: Number(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-600 font-bold">{isBn ? 'ক্যারিং চার্জ ৳' : 'Carrying Charge ৳'}</label>
                  <button
                    type="button"
                    onClick={() => setQuickEditData(prev => ({ ...prev, carryingChargeType: prev.carryingChargeType === 'Cash' ? 'To-Pay' : 'Cash' }))}
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded cursor-pointer ${quickEditData.carryingChargeType === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                  >
                    {quickEditData.carryingChargeType}
                  </button>
                </div>
                <input
                  type="number"
                  value={quickEditData.carryingCharge}
                  onChange={e => setQuickEditData(prev => ({ ...prev, carryingCharge: Number(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'ভ্যাট ৳ (VAT)' : 'VAT ৳'}</label>
                <input
                  type="number"
                  value={quickEditData.vat}
                  onChange={e => setQuickEditData(prev => ({ ...prev, vat: Number(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'স্ট্যাটাস' : 'Status'}</label>
                <select
                  value={quickEditData.status}
                  onChange={e => setQuickEditData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  <option value="Booked">Booked</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Returned">Returned</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">{isBn ? 'মেমো (Memo) নং' : 'Memo Number'}</label>
                <input
                  type="text"
                  value={quickEditData.consignmentId}
                  onChange={e => setQuickEditData(prev => ({ ...prev, consignmentId: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-blue-900"
                />
              </div>

              {/* Live calculations preview in Quick Edit */}
              <div className="sm:col-span-2 grid grid-cols-3 gap-2 p-2.5 bg-slate-100/70 rounded-xl border border-slate-200 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Total Condition</span>
                  <span className="text-xs font-black text-blue-900">৳{(quickEditData.conditionAmount + quickEditData.conditionCharge).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Total Paid</span>
                  <span className="text-xs font-black text-emerald-700">
                    ৳{((quickEditData.conditionChargeType === 'Cash' ? quickEditData.conditionCharge : 0) + (quickEditData.carryingChargeType === 'Cash' ? quickEditData.carryingCharge : 0)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-sans font-bold">Total Due</span>
                  <span className="text-xs font-black text-rose-700">
                    ৳{((quickEditData.conditionAmount + quickEditData.conditionCharge) + (quickEditData.carryingChargeType === 'To-Pay' ? quickEditData.carryingCharge : 0) + quickEditData.vat - ((quickEditData.conditionChargeType === 'Cash' ? quickEditData.conditionCharge : 0) + (quickEditData.carryingChargeType === 'Cash' ? quickEditData.carryingCharge : 0))).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Settlement Status: হিসাবভুক্ত ar pase অন্তর্ভুক্ত নয় */}
              <div className="sm:col-span-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between text-xs">
                  <span>{isBn ? 'সিওডি হিসাব সমন্বয় (COD Settlement)' : 'COD Settlement Status'}</span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {quickEditData.settlementStatus === 'Settled' ? (isBn ? '✓ ক্যাশবুকে হিসাবভুক্ত' : 'Settled') : (isBn ? '✕ হিসাবভুক্ত নয়' : 'Not Included')}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickEditData(prev => ({ ...prev, settlementStatus: 'Settled' }))}
                    className={`py-2 px-3 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-1.5 transition-all border ${
                      quickEditData.settlementStatus === 'Settled'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isBn ? 'হিসাবভুক্ত' : 'Settled'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickEditData(prev => ({ ...prev, settlementStatus: 'Unsettled' }))}
                    className={`py-2 px-3 rounded-xl text-xs font-black cursor-pointer flex items-center justify-center gap-1.5 transition-all border ${
                      quickEditData.settlementStatus === 'Unsettled' || !quickEditData.settlementStatus
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{isBn ? 'অন্তর্ভুক্ত নয়' : 'Not Included'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = quickEditParcel;
                  setQuickEditParcel(null);
                  handleStartEditInFullForm(target);
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isBn ? 'সম্পূর্ণ বুকিং ফর্মে এডিট' : 'Edit in Full Form'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setQuickEditParcel(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuickEdit}
                  disabled={saving}
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  {saving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? '💾 পরিবর্তন সংরক্ষণ' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {deleteConfirmParcel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                {isBn ? 'পার্সেল রেকর্ড ডিলিট করবেন?' : 'Delete Parcel Record?'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isBn 
                  ? 'এই চালান রেকর্ডটি লেজার ও তালিকা থেকে স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?' 
                  : 'This consignment record will be permanently deleted from the ledger. Are you sure?'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'মেমো নং:' : 'Memo No:'}</span>
                <span className="font-mono font-bold text-slate-800">{deleteConfirmParcel.consignmentId || deleteConfirmParcel.cnNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'কুরিয়ার:' : 'Courier:'}</span>
                <span className="font-bold text-blue-900">{deleteConfirmParcel.courier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'প্রাপক:' : 'Customer:'}</span>
                <span className="font-bold text-slate-800">{deleteConfirmParcel.customerName} ({deleteConfirmParcel.customerPhone})</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span className="text-slate-500">{isBn ? 'কন্ডিশন মূল্য:' : 'Condition Amount:'}</span>
                <span className="font-mono font-bold text-emerald-700">৳{deleteConfirmParcel.codAmount || deleteConfirmParcel.conditionAmount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmParcel(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                {isBn ? 'না, বাতিল' : 'No, Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteParcelConfirmed}
                disabled={saving}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{saving ? (isBn ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (isBn ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
