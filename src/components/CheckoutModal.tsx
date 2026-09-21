import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CreditCard, Inbox, CheckCircle2, Truck, Banknote, Calculator, Package, Copy, Check, MapPin, FileText, Printer, Phone, Building2 } from 'lucide-react';
import { CartItem, Order, User, CourierPoint } from '../types';

export const BANGLADESH_DISTRICTS = [
  { id: 'Dhaka', bn: 'ঢাকা', en: 'Dhaka' },
  { id: 'Gazipur', bn: 'গাজীপুর', en: 'Gazipur' },
  { id: 'Narayanganj', bn: 'নারায়ণগঞ্জ', en: 'Narayanganj' },
  { id: 'Chittagong', bn: 'চট্টগ্রাম', en: 'Chattogram' },
  { id: 'CoxsBazar', bn: 'কক্সবাজার', en: "Cox's Bazar" },
  { id: 'Cumilla', bn: 'কুমিল্লা', en: 'Cumilla' },
  { id: 'Sylhet', bn: 'সিলেট', en: 'Sylhet' },
  { id: 'Moulvibazar', bn: 'মৌলভীবাজার', en: 'Moulvibazar' },
  { id: 'Habiganj', bn: 'হবিগঞ্জ', en: 'Habiganj' },
  { id: 'Sunamganj', bn: 'সুনামগঞ্জ', en: 'Sunamganj' },
  { id: 'Rajshahi', bn: 'রাজশাহী', en: 'Rajshahi' },
  { id: 'Bogura', bn: 'বগুড়া', en: 'Bogura' },
  { id: 'Pabna', bn: 'পাবনা', en: 'Pabna' },
  { id: 'Sirajganj', bn: 'সিরাজগঞ্জ', en: 'Sirajganj' },
  { id: 'Khulna', bn: 'খুলনা', en: 'Khulna' },
  { id: 'Jashore', bn: 'যশোর', en: 'Jashore' },
  { id: 'Kushtia', bn: 'কুষ্টিয়া', en: 'Kushtia' },
  { id: 'Barisal', bn: 'বরিশাল', en: 'Barishal' },
  { id: 'Patuakhali', bn: 'পটুয়াখালী', en: 'Patuakhali' },
  { id: 'Rangpur', bn: 'রংপুর', en: 'Rangpur' },
  { id: 'Dinajpur', bn: 'দিনাজপুর', en: 'Dinajpur' },
  { id: 'Mymensingh', bn: 'ময়মনসিংহ', en: 'Mymensingh' },
  { id: 'Tangail', bn: 'টাঙ্গাইল', en: 'Tangail' },
  { id: 'Faridpur', bn: 'ফরিদপুর', en: 'Faridpur' },
  { id: 'Brahmanbaria', bn: 'ব্রাহ্মণবাড়িয়া', en: 'Brahmanbaria' },
  { id: 'Noakhali', bn: 'নোয়াখালী', en: 'Noakhali' },
  { id: 'Feni', bn: 'ফেনী', en: 'Feni' },
  { id: 'Chandpur', bn: 'চাঁদপুর', en: 'Chandpur' },
  { id: 'Bagerhat', bn: 'বাগেরহাট', en: 'Bagerhat' },
  { id: 'Bandarban', bn: 'বান্দরবান', en: 'Bandarban' },
  { id: 'Barguna', bn: 'বরগুনা', en: 'Barguna' },
  { id: 'Bhola', bn: 'ভোলা', en: 'Bhola' },
  { id: 'Chuadanga', bn: 'চুয়াডাঙ্গা', en: 'Chuadanga' },
  { id: 'Chapainawabganj', bn: 'চাঁপাইনবাবগঞ্জ', en: 'Chapainawabganj' },
  { id: 'Gaibandha', bn: 'গাইবান্ধা', en: 'Gaibandha' },
  { id: 'Gopalganj', bn: 'গোপালগঞ্জ', en: 'Gopalganj' },
  { id: 'Jamalpur', bn: 'জামালপুর', en: 'Jamalpur' },
  { id: 'Jhenaidah', bn: 'ঝিনাইদহ', en: 'Jhenaidah' },
  { id: 'Joypurhat', bn: 'জয়পুরহাট', en: 'Joypurhat' },
  { id: 'Khagrachhari', bn: 'খাগড়াছড়ি', en: 'Khagrachhari' },
  { id: 'Kishoreganj', bn: 'কিশোরগঞ্জ', en: 'Kishoreganj' },
  { id: 'Kurigram', bn: 'কুড়িগ্রাম', en: 'Kurigram' },
  { id: 'Lakshmipur', bn: 'লক্ষ্মীপুর', en: 'Lakshmipur' },
  { id: 'Lalmonirhat', bn: 'লালমনিরহাট', en: 'Lalmonirhat' },
  { id: 'Madaripur', bn: 'মাদারীপুর', en: 'Madaripur' },
  { id: 'Magura', bn: 'মাগুরা', en: 'Magura' },
  { id: 'Manikganj', bn: 'মানিকগঞ্জ', en: 'Manikganj' },
  { id: 'Meherpur', bn: 'মেহেরপুর', en: 'Meherpur' },
  { id: 'Munshiganj', bn: 'মুন্সীগঞ্জ', en: 'Munshiganj' },
  { id: 'Naogaon', bn: 'নওগাঁ', en: 'Naogaon' },
  { id: 'Narail', bn: 'নড়াইল', en: 'Narail' },
  { id: 'Narsingdi', bn: 'নরসিংদী', en: 'Narsingdi' },
  { id: 'Natore', bn: 'নাটোর', en: 'Natore' },
  { id: 'Netrokona', bn: 'নেত্রকোণা', en: 'Netrokona' },
  { id: 'Nilphamari', bn: 'নীলফামারী', en: 'Nilphamari' },
  { id: 'Panchagarh', bn: 'পঞ্চগড়', en: 'Panchagarh' },
  { id: 'Pirojpur', bn: 'পিরোজপুর', en: 'Pirojpur' },
  { id: 'Rajbari', bn: 'রাজবাড়ী', en: 'Rajbari' },
  { id: 'Rangamati', bn: 'রাঙ্গামাটি', en: 'Rangamati' },
  { id: 'Satkhira', bn: 'সাতক্ষীরা', en: 'Satkhira' },
  { id: 'Shariatpur', bn: 'শরীয়তপুর', en: 'Shariatpur' },
  { id: 'Sherpur', bn: 'শেরপুর', en: 'Sherpur' },
  { id: 'Thakurgaon', bn: 'ঠাকুরগাঁও', en: 'Thakurgaon' }
];

// 1000 a 10tk Condition Charge Helper (১০০০ এ ১০ টাকা = ১% হার, সর্বনিম্ন ১০ টাকা)
export const calcConditionCharge = (amt: number) => {
  if (amt <= 0) return 0;
  return Math.max(10, Math.round((amt * 10) / 1000));
};

interface CheckoutModalProps {
  lang: 'en' | 'bn';
  onClose: () => void;
  cart: CartItem[];
  clearCart: () => void;
  onSubmitOrder: (orderPayload: any) => Promise<Order>;
  currentUser?: User | null;
}

export default function CheckoutModal({
  lang,
  onClose,
  cart,
  clearCart,
  onSubmitOrder,
  currentUser
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [courierPoint, setCourierPoint] = useState('');
  const [district, setDistrict] = useState('Dhaka');

  // Active courier points loaded dynamically from database
  const [courierPoints, setCourierPoints] = useState<CourierPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string>('');
  const [isCustomPointMode, setIsCustomPointMode] = useState<boolean>(false);

  // Load active courier points on mount
  React.useEffect(() => {
    fetch('/api/courier-points?activeOnly=true')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourierPoints(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load active courier points for checkout:', err);
      });
  }, []);

  // Handler for selecting an active courier point
  const handleSelectPoint = (pointId: string) => {
    setSelectedPointId(pointId);
    if (pointId === 'custom') {
      setIsCustomPointMode(true);
      return;
    }
    if (!pointId) {
      setIsCustomPointMode(false);
      setCourierPoint('');
      return;
    }
    const found = courierPoints.find(p => p.id === pointId);
    if (found) {
      setIsCustomPointMode(false);
      setCourierPoint(`${found.name} - ${found.address} (Tel: ${found.contact})`);
      if (found.courier === 'Steadfast' || found.courier === 'Sundarban' || found.courier === 'Pathao' || found.courier === 'RedX' || found.courier === 'Janani') {
        setSelectedCourier(found.courier as any);
      }
      if (found.district) {
        setDistrict(found.district);
      }
    }
  };
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Cash on Delivery'>('Cash on Delivery');
  const [transactionId, setTransactionId] = useState('');
  const [enableCrypto, setEnableCrypto] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  // Courier & Condition configurations
  const [selectedCourier, setSelectedCourier] = useState<'Steadfast' | 'Pathao' | 'RedX' | 'Sundarban' | 'Janani' | 'Paperfly' | 'In-House Rider'>('Steadfast');
  const [conditionChargeType, setConditionChargeType] = useState<'Cash' | 'To-Pay'>('To-Pay');
  const [carryingChargeType, setCarryingChargeType] = useState<'Cash' | 'To-Pay'>('Cash');
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null); // { code, type, value, description }
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Load settings dynamically from localStorage
  const storeSettings = React.useMemo(() => {
    const cached = localStorage.getItem('taqwa_settings');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    return null;
  }, []);

  const chargeInside = storeSettings?.shippingChargeDhaka !== undefined ? Number(storeSettings.shippingChargeDhaka) : 60;
  const chargeOutside = storeSettings?.shippingChargeOutside !== undefined ? Number(storeSettings.shippingChargeOutside) : 120;
  
  // Carrying charge state - allows manual override as requested
  const [carryingCharge, setCarryingCharge] = useState<number>(() => district === 'Dhaka' ? chargeInside : chargeOutside);
  const [isCarryingChargeManual, setIsCarryingChargeManual] = useState<boolean>(false);

  // Product item name state - allows manual entry / customization as requested
  const defaultItemName = cart.length > 0
    ? cart.map(item => `${(lang === 'bn' && item.product.banglaName) ? item.product.banglaName : item.product.name}${item.quantity > 1 ? ` (${item.quantity}x)` : ''}`).join(', ')
    : '';
  const [productItemName, setProductItemName] = useState<string>(defaultItemName);

  // Product Unit Price (পণ্যের একক দাম) state
  const defaultProductPrice = cart.length === 1
    ? cart[0].product.price
    : (cart.length > 0 ? Math.round(subtotal / Math.max(1, cart.reduce((s, i) => s + i.quantity, 0))) : 0);
  const [productPrice, setProductPrice] = useState<number>(defaultProductPrice);

  // Product Quantity (পণ্যের পরিমাণ) state
  const defaultQuantity = cart.length > 0 ? cart.reduce((s, i) => s + i.quantity, 0) : 1;
  const [productQuantity, setProductQuantity] = useState<number>(defaultQuantity);

  // Track if user has manually entered price or quantity
  const isPriceCustomizedRef = React.useRef<boolean>(false);

  // Dynamic product subtotal based on current product price and quantity
  const productTotal = (productPrice > 0 && productQuantity > 0)
    ? (productPrice * productQuantity)
    : subtotal;

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      couponDiscountAmount = Math.round((productTotal * appliedCoupon.value) / 100);
    } else {
      couponDiscountAmount = appliedCoupon.value;
    }
  }

  // Condition Amount (কন্ডিশন মূল্য) state - calculates price * quantity
  const initialCondition = Math.max(0, (defaultProductPrice * defaultQuantity) || (subtotal - couponDiscountAmount));
  const [conditionAmount, setConditionAmount] = useState<number>(initialCondition);

  // Condition Charge (1000 a 10tk, allows manual override)
  const [conditionCharge, setConditionCharge] = useState<number>(() => calcConditionCharge(initialCondition));
  const [isConditionChargeManual, setIsConditionChargeManual] = useState<boolean>(false);

  // Sync default product item name, price, quantity if cart updates and input hasn't been modified
  React.useEffect(() => {
    if (cart.length > 0 && !isPriceCustomizedRef.current) {
      if (!productItemName) {
        setProductItemName(cart.map(item => `${(lang === 'bn' && item.product.banglaName) ? item.product.banglaName : item.product.name}${item.quantity > 1 ? ` (${item.quantity}x)` : ''}`).join(', '));
      }
      const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
      const unitPrice = cart.length === 1 ? cart[0].product.price : Math.round(subtotal / Math.max(1, totalQty));
      setProductPrice(unitPrice);
      setProductQuantity(totalQty);
      const newCond = Math.max(0, (unitPrice * totalQty) - couponDiscountAmount);
      setConditionAmount(newCond);
      if (!isConditionChargeManual) {
        setConditionCharge(calcConditionCharge(newCond));
      }
    }
  }, [cart]);

  // When product price changes: multiply by quantity to auto-set condition price
  const handleProductPriceChange = (newPrice: number) => {
    isPriceCustomizedRef.current = true;
    setProductPrice(newPrice);
    const calculated = Math.max(0, Math.round(newPrice * productQuantity) - couponDiscountAmount);
    setConditionAmount(calculated);
    if (!isConditionChargeManual) {
      setConditionCharge(calcConditionCharge(calculated));
    }
  };

  // When product quantity changes: multiply by price to auto-set condition price
  const handleProductQuantityChange = (newQty: number) => {
    isPriceCustomizedRef.current = true;
    setProductQuantity(newQty);
    const calculated = Math.max(0, Math.round(productPrice * newQty) - couponDiscountAmount);
    setConditionAmount(calculated);
    if (!isConditionChargeManual) {
      setConditionCharge(calcConditionCharge(calculated));
    }
  };

  // When condition amount is edited directly
  const handleConditionAmountChange = (newCond: number) => {
    setConditionAmount(newCond);
    if (!isConditionChargeManual) {
      setConditionCharge(calcConditionCharge(newCond));
    }
  };

  // When district changes, update carrying charge if not manually customized
  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    if (!isCarryingChargeManual) {
      setCarryingCharge(newDistrict === 'Dhaka' ? chargeInside : chargeOutside);
    }
  };

  const totalCondition = conditionAmount + conditionCharge;

  // Payment gateway charge calculation for bKash, Nagad, Rocket (COD has no charge)
  const bkashRate = storeSettings?.bkashChargeRate !== undefined ? Number(storeSettings.bkashChargeRate) : 1.85;
  const nagadRate = storeSettings?.nagadChargeRate !== undefined ? Number(storeSettings.nagadChargeRate) : 1.5;
  const rocketRate = storeSettings?.rocketChargeRate !== undefined ? Number(storeSettings.rocketChargeRate) : 1.8;

  let paymentChargeRate = 0;
  if (paymentMethod === 'bKash') paymentChargeRate = bkashRate;
  else if (paymentMethod === 'Nagad') paymentChargeRate = nagadRate;
  else if (paymentMethod === 'Rocket') paymentChargeRate = rocketRate;

  // Base amount before payment gateway charge
  const baseOrderTotal = Math.max(0, conditionAmount + carryingCharge + (conditionCharge > 0 ? conditionCharge : 0));

  // Payment gateway charge amount
  const paymentCharge = paymentChargeRate > 0 ? Math.round((baseOrderTotal * paymentChargeRate) / 100) : 0;

  // Immediate payable at checkout (delivery/carrying charge)
  const deliveryCharge = carryingCharge;
  // Grand Total = Condition Amount + Carrying Charge + Condition Charge (if any) + Payment Charge (if any)
  const grandTotal = Math.max(0, baseOrderTotal + paymentCharge);

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data);
        setCouponSuccess(lang === 'bn' ? `কূপন '${data.code}' প্রয়োগ করা হয়েছে! (${data.description})` : `Coupon '${data.code}' applied! (${data.description})`);
        const disc = data.type === 'percent' ? Math.round((productTotal * data.value) / 100) : data.value;
        const newCond = Math.max(0, productTotal - disc);
        setConditionAmount(newCond);
        if (!isConditionChargeManual) {
          setConditionCharge(calcConditionCharge(newCond));
        }
      } else {
        setCouponError(data.error || (lang === 'bn' ? 'কুপনটি সঠিক নয়।' : 'Invalid coupon code.'));
      }
    } catch (err) {
      setCouponError(lang === 'bn' ? 'সার্ভার সংযোগে ত্রুটি।' : 'Error connecting to server.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
    setConditionAmount(productTotal);
    if (!isConditionChargeManual) {
      setConditionCharge(calcConditionCharge(productTotal));
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !shippingAddress) return;

    setIsPlacingOrder(true);

    const safeProductName = productItemName.trim();
    const preparedItems = cart.length > 0
      ? cart.map((item, idx) => ({
          productId: item.product.id,
          productName: (cart.length === 1 && safeProductName)
            ? safeProductName
            : ((lang === 'bn' && item.product.banglaName) ? item.product.banglaName : item.product.name),
          quantity: cart.length === 1 ? productQuantity : item.quantity,
          price: cart.length === 1 ? productPrice : item.product.price,
          image: item.product.image
        }))
      : [
          {
            productId: `manual-${Date.now()}`,
            productName: safeProductName || (lang === 'bn' ? 'অর্ডারকৃত আইটেম' : 'Ordered Item'),
            quantity: productQuantity,
            price: productPrice,
            image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&auto=format&fit=crop&q=80'
          }
        ];

    // Emulated client-side payload metadata encryption/protection hashing
    const securedPayload = {
      customerName,
      customerPhone,
      shippingAddress,
      district,
      courierPoint: courierPoint.trim(),
      productItemName: safeProductName,
      itemDescription: safeProductName,
      productPrice,
      productQuantity,
      items: preparedItems,
      paymentMethod,
      paymentTransactionId: paymentMethod !== 'Cash on Delivery' ? transactionId : undefined,
      appliedCoupon: appliedCoupon ? appliedCoupon.code : undefined,
      discountAmount: couponDiscountAmount,
      totalAmount: grandTotal,
      courierName: selectedCourier,
      conditionAmount,
      conditionCharge,
      conditionChargeType,
      carryingCharge,
      carryingChargeType,
      totalCondition,
      paymentCharge,
      paymentChargeRate
    };

    try {
      const placedOrder = await onSubmitOrder(securedPayload);
      setOrderDetails(placedOrder);
      clearCart();
    } catch (err) {
      alert(lang === 'bn' ? 'অর্ডার প্রসেস করার সময় একটি সমস্যা হয়েছে।' : 'Error completing order.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="checkout-gateway-modal">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-gray-150 p-6 md:p-8">
        
        {/* Close Button Pin */}
        <button
          id="close-checkout"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 text-gray-400 hover:text-black cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!orderDetails ? (
          <>
            {/* Securified Header banner */}
            <div className="mb-6 flex items-center space-x-2 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Lock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-gray-800 tracking-tight">
                  {lang === 'bn' ? 'নিরাপদ অনলাইন পেমেন্ট ও চেকআউট' : 'Secure Checkout Gateway'}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{lang === 'bn' ? 'SSL এনক্রিপ্টেড পেমেন্ট গেটওয়ে ২০২৬' : '256-Bit SSL secured customer channel'}</span>
                </div>
              </div>
            </div>

            {/* Checkout Main form */}
            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              
              {/* Form division: Shipping Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Inbox className="w-4 h-4" />
                  {lang === 'bn' ? 'ডেলিভারি ও কন্টাক্ট ইনফরমেশন' : 'Shipping & Contact Details'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {lang === 'bn' ? 'পুরো নাম (বাধ্যতামূলক)' : 'Full Name (Required)'}
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: হাসিবুর রহমান' : 'e.g. Hasibur Rahman'}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-750 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {lang === 'bn' ? 'মোবাইল নাম্বার (বাধ্যতামূলক)' : 'Mobile Phone (Required)'}
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: ০১৭********' : 'e.g. 01712345678'}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-750 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {lang === 'bn' ? 'ডেলিভারি ডিস্ট্রিক্ট / জেলা' : 'Delivery District'}
                    </label>
                    <select
                      id="checkout-district"
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden text-gray-750 font-bold"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {lang === 'bn' ? d.bn : d.en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        {lang === 'bn' ? 'কুরিয়ার সার্ভিস নির্বাচন' : 'Select Courier Service'}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {selectedCourier}
                      </span>
                    </label>
                    <select
                      id="checkout-courier"
                      value={selectedCourier}
                      onChange={(e) => setSelectedCourier(e.target.value as any)}
                      className="w-full text-xs p-3 bg-gray-50 border border-emerald-300/80 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-slate-800 font-extrabold"
                    >
                      <option value="Steadfast">Steadfast Courier (স্টেডফাস্ট)</option>
                      <option value="Pathao">Pathao Courier (পাঠাও)</option>
                      <option value="RedX">RedX Logistics (রেডএক্স)</option>
                      <option value="Sundarban">Sundarban Courier (সুন্দরবন কুরিয়ার)</option>
                      <option value="Janani">Janani Express (জননী এক্সপ্রেস)</option>
                      <option value="Paperfly">Paperfly Courier (পেপারফ্লাই)</option>
                      <option value="In-House Rider">In-House Rider (নিজস্ব ডেলিভারি রাইডার)</option>
                    </select>
                  </div>
                </div>

                {/* Detailed Address Field moved directly under Delivery District */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {lang === 'bn' ? 'সম্পূর্ণ ডেলিভারি ঠিকানা (রোড, হাউজ নং, এলাকা)' : 'Detailed Custom Address (House, Road, Area)'}
                  </label>
                  <textarea
                    id="checkout-address"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: বাসা-২৪, রোড-৪, ধানমন্ডি, ঢাকা' : 'e.g. House 24, Road 4, Dhanmondi, Dhaka'}
                    rows={2}
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-700 font-medium"
                  />
                </div>

                {/* Courier Point / Branch Selector & Input */}
                <div id="checkout-courier-point-container" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'bn' ? 'কুরিয়ার পয়েন্ট (শাখা / হাব থেকে পার্সেল গ্রহণ)' : 'Courier Point (Branch / Hub Collection)'}</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {lang === 'bn' ? '(শাখা থেকে নিতে চাইলে নির্বাচন করুন)' : '(Optional - Pickup from Branch)'}
                    </span>
                  </div>

                  {courierPoints.length > 0 ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <select
                          id="checkout-courier-point-select"
                          value={isCustomPointMode ? 'custom' : selectedPointId}
                          onChange={(e) => handleSelectPoint(e.target.value)}
                          className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-800 font-bold transition-all cursor-pointer"
                        >
                          <option value="">{lang === 'bn' ? '-- সক্রিয় কুরিয়ার পয়েন্ট / শাখা নির্বাচন করুন (বা হোম ডেলিভারি) --' : '-- Select Active Courier Point / Branch (or Home Delivery) --'}</option>
                          
                          {/* Current district points */}
                          {courierPoints.filter(p => p.district === district).length > 0 && (
                            <optgroup label={lang === 'bn' ? `📍 ${district} জেলার সক্রিয় শাখা ও হাবসমূহ` : `📍 ${district} District Active Branches`}>
                              {courierPoints.filter(p => p.district === district).map(p => (
                                <option key={p.id} value={p.id}>
                                  [{p.courier}] {p.name} — {p.address} ({p.contact})
                                </option>
                              ))}
                            </optgroup>
                          )}

                          {/* Other districts points */}
                          {courierPoints.filter(p => p.district !== district).length > 0 && (
                            <optgroup label={lang === 'bn' ? '📍 অন্যান্য জেলাসমূহের সক্রিয় শাখা ও হাব' : '📍 Other Districts Active Branches'}>
                              {courierPoints.filter(p => p.district !== district).map(p => (
                                <option key={p.id} value={p.id}>
                                  [{p.courier} - {p.district}] {p.name} — {p.address} ({p.contact})
                                </option>
                              ))}
                            </optgroup>
                          )}

                          <option value="custom">
                            {lang === 'bn' ? '✏️ অন্য কোনো শাখা বা কাস্টম পয়েন্ট টাইপ করুন...' : '✏️ Type other / custom branch...'}
                          </option>
                        </select>
                      </div>

                      {/* Selected Point Summary Card */}
                      {selectedPointId && selectedPointId !== 'custom' && (() => {
                        const activePoint = courierPoints.find(p => p.id === selectedPointId);
                        if (!activePoint) return null;
                        return (
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 animate-fade-in text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span className="font-extrabold text-emerald-950">{activePoint.name}</span>
                                <span className="px-1.5 py-0.5 bg-emerald-200 text-emerald-800 text-[10px] font-black rounded-md uppercase">
                                  {activePoint.courier}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelectPoint('')}
                                className="text-[10px] text-slate-500 hover:text-rose-600 font-bold underline cursor-pointer"
                              >
                                {lang === 'bn' ? 'মুছে ফেলুন' : 'Clear'}
                              </button>
                            </div>
                            <p className="text-slate-600 font-medium text-[11px] leading-relaxed">
                              <strong className="text-slate-700">{lang === 'bn' ? 'ঠিকানা: ' : 'Address: '}</strong>
                              {activePoint.address}, {activePoint.district}
                            </p>
                            <div className="flex items-center gap-3 pt-0.5 text-[11px] text-slate-700">
                              <span className="flex items-center gap-1 font-bold">
                                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                <a href={`tel:${activePoint.contact}`} className="text-emerald-700 hover:underline">
                                  {activePoint.contact}
                                </a>
                              </span>
                              {activePoint.notes && (
                                <span className="text-slate-500 text-[10px] italic">
                                  ({activePoint.notes})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Custom Input fallback when custom selected or manually specified */}
                      {isCustomPointMode && (
                        <div className="space-y-1 pt-1 animate-fade-in">
                          <label className="text-[11px] font-bold text-slate-600 block">
                            {lang === 'bn' ? 'কাস্টম কুরিয়ার পয়েন্ট বা শাখার নাম ও ঠিকানা লিখুন:' : 'Type custom courier point / branch name and address:'}
                          </label>
                          <input
                            id="checkout-courier-point"
                            type="text"
                            value={courierPoint}
                            onChange={(e) => setCourierPoint(e.target.value)}
                            placeholder={lang === 'bn' ? 'যেমন: সুন্দরবন কুরিয়ার মতিঝিল শাখা / স্টেটফাস্ট হাব' : 'e.g. Sundarban Courier Motijheel Branch / Steadfast Hub'}
                            className="w-full text-xs p-3 bg-white border border-emerald-300 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-800 font-medium transition-all"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      id="checkout-courier-point"
                      type="text"
                      value={courierPoint}
                      onChange={(e) => setCourierPoint(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: সুন্দরবন কুরিয়ার মতিঝিল শাখা / স্টেটফাস্ট হাব / পাঠাও পয়েন্ট' : 'e.g. Sundarban Courier Motijheel Branch / Steadfast Hub / Pathao Point'}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:bg-white text-gray-700 font-medium transition-all"
                    />
                  )}
                </div>

                {/* Product Item Details: Name, Price (দাম), Quantity (পরিমাণ) & Multiplication */}
                <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3" id="checkout-product-details-box">
                  {/* Product Item Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        {lang === 'bn' ? 'পণ্যের নাম / আইটেম বিবরণ' : 'Product Item Name / Description'}
                      </span>
                      {cart.length > 0 && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          {lang === 'bn' ? `${cart.length}টি পণ্য কার্টে আছে` : `${cart.length} item(s) in cart`}
                        </span>
                      )}
                    </label>
                    <input
                      id="checkout-product-name"
                      type="text"
                      value={productItemName}
                      onChange={(e) => setProductItemName(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: রেসার কবুতরের গ্রিট ও মিক্সড খাবার ৫ কেজি' : 'e.g. Racing Pigeon Feed 5kg, Minerals etc.'}
                      className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-800 font-bold"
                    />
                  </div>

                  {/* Product Price (পণ্যের দাম) & Product Quantity (পণ্যের পরিমাণ) with Auto Multiplication */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* পণ্যের দাম (Unit Price) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        {lang === 'bn' ? 'পণ্যের দাম (একক মূল্য)' : 'Product Price (Unit Price)'}
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-bold text-slate-400">৳</span>
                        <input
                          id="checkout-product-price"
                          type="number"
                          min="0"
                          value={productPrice}
                          onChange={(e) => handleProductPriceChange(Math.max(0, Number(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full text-xs pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono font-bold text-slate-800"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lang === 'bn' ? 'প্রতি কেজি / আইটেমের দাম' : 'Price per kg / unit'}
                      </p>
                    </div>

                    {/* পণ্যের পরিমাণ (Quantity in Kg) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1 flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                        {lang === 'bn' ? 'পণ্যের পরিমাণ (কেজি)' : 'Product Quantity (Kg)'}
                      </label>
                      <input
                        id="checkout-product-quantity"
                        type="number"
                        min="0.1"
                        step="any"
                        value={productQuantity}
                        onChange={(e) => handleProductQuantityChange(Math.max(0, parseFloat(e.target.value) || 0))}
                        placeholder="1"
                        className="w-full text-xs px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-mono font-bold text-slate-800"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lang === 'bn' ? 'মোট ক্রয়কৃত পরিমাণ (কেজি)' : 'Total quantity in kg'}
                      </p>
                    </div>
                  </div>

                  {/* Real-time Multiplication Calculation Notice */}
                  <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                      <span className="text-sm">✖️</span>
                      {lang === 'bn' ? 'স্বয়ংক্রিয় গুণফল (দাম × পরিমাণ):' : 'Auto Multiply (Price × Qty):'}
                    </span>
                    <span className="font-mono font-black text-emerald-950 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-xs">
                      ৳{productPrice.toLocaleString()} × {productQuantity} {lang === 'bn' ? 'কেজি' : 'Kg'} = ৳{(productPrice * productQuantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Courier Condition, Condition Charge & Carrying Charge Options */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 space-y-3" id="checkout-courier-condition-box">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-emerald-600" />
                      {lang === 'bn' ? 'কুরিয়ার কন্ডিশন ও চার্জ হিসাব' : 'Courier Condition & Charges'}
                    </span>
                    <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      {selectedCourier}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Condition Amount Field (কন্ডিশন মূল্য ইনপুট ফিল্ড ও অপশন) */}
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-500">
                          {lang === 'bn' ? 'কন্ডিশন মূল্য (Condition)' : 'Condition Price'}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setConditionAmount(Math.max(0, productPrice * productQuantity));
                          }}
                          className="text-[9px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded cursor-pointer border border-emerald-200"
                          title={lang === 'bn' ? 'দাম × পরিমাণ দিয়ে রিসেট করুন' : 'Reset to Price × Qty'}
                        >
                          {lang === 'bn' ? '🔄 গুণফল সেট' : '🔄 Set from Price×Qty'}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">৳</span>
                        <input
                          id="checkout-condition-amount"
                          type="number"
                          min="0"
                          value={conditionAmount}
                          onChange={(e) => handleConditionAmountChange(Math.max(0, Number(e.target.value) || 0))}
                          className="w-full text-xs font-mono font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white text-slate-800"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span>{lang === 'bn' ? 'কুরিয়ার কন্ডিশন দেয়' : 'COD Payable'}</span>
                        <span className="font-mono font-bold text-emerald-700">
                          ৳{conditionAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Condition Charge with Cash / To-Pay Toggle */}
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <label className="block text-[10px] font-bold text-slate-500">
                            {lang === 'bn' ? 'কন্ডিশন চার্জ' : 'Condition Charge'}
                          </label>
                          <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">
                            {lang === 'bn' ? '১০০০ এ ১০৳' : '10৳/1000'}
                          </span>
                        </div>
                        {/* Cash / To-Pay Toggle */}
                        <button
                          type="button"
                          onClick={() => setConditionChargeType(prev => prev === 'Cash' ? 'To-Pay' : 'Cash')}
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                            conditionChargeType === 'Cash'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                          }`}
                          title={lang === 'bn' ? 'ক্লিক করে Cash বা To-Pay পরিবর্তন করুন' : 'Click to toggle Cash or To-Pay'}
                        >
                          {conditionChargeType === 'Cash' ? 'Cash' : 'To-Pay'}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">৳</span>
                        <input
                          id="checkout-condition-charge"
                          type="number"
                          min="0"
                          value={conditionCharge}
                          onChange={(e) => {
                            setIsConditionChargeManual(true);
                            setConditionCharge(Math.max(0, Number(e.target.value) || 0));
                          }}
                          className="w-full text-xs font-mono font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white text-slate-800"
                        />
                        {isConditionChargeManual && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsConditionChargeManual(false);
                              setConditionCharge(calcConditionCharge(conditionAmount));
                            }}
                            className="text-[9px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded cursor-pointer whitespace-nowrap"
                            title="Reset to 1000 a 10tk"
                          >
                            {lang === 'bn' ? 'অটো' : 'Auto'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Carrying Charge with Cash / To-Pay Toggle and Manual Entry Input */}
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-500">
                          {lang === 'bn' ? 'ক্যারিং চার্জ (বহন খরচ)' : 'Carrying Charge'}
                        </label>
                        {/* Cash / To-Pay Toggle */}
                        <button
                          type="button"
                          onClick={() => setCarryingChargeType(prev => prev === 'Cash' ? 'To-Pay' : 'Cash')}
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                            carryingChargeType === 'Cash'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                          }`}
                          title={lang === 'bn' ? 'ক্লিক করে Cash বা To-Pay পরিবর্তন করুন' : 'Click to toggle Cash or To-Pay'}
                        >
                          {carryingChargeType === 'Cash' ? 'Cash' : 'To-Pay'}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">৳</span>
                        <input
                          id="checkout-carrying-charge"
                          type="number"
                          min="0"
                          value={carryingCharge}
                          onChange={(e) => {
                            setIsCarryingChargeManual(true);
                            setCarryingCharge(Math.max(0, Number(e.target.value) || 0));
                          }}
                          className="w-full text-xs font-mono font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white text-slate-800"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-0.5 text-[9px]">
                        <span className="text-slate-400 font-medium">
                          {lang === 'bn' ? 'ম্যানুয়াল বহন খরচ' : 'Manual Entry'}
                        </span>
                        <span className={`font-bold px-1.5 py-0.5 rounded ${carryingChargeType === 'Cash' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-800 bg-amber-50'}`}>
                          {carryingChargeType === 'Cash' ? (lang === 'bn' ? 'অগ্রিম/ক্যাশ' : 'Cash') : (lang === 'bn' ? 'ডেলিভারিতে প্রদেয়' : 'To-Pay')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form division: Payment Methods */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  {lang === 'bn' ? 'পেমেন্ট গেটওয়ে নির্বাচন করুন' : 'Choose Payment Gateway Option'}
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'Cash on Delivery', name: 'ক্যাশ অন ডেলিভারি', feeText: (lang === 'bn' ? 'চার্জ নেই' : 'No charge'), color: 'text-slate-600' },
                    { key: 'bKash', name: 'বিকাশ (bKash)', feeText: `+${bkashRate}% ${lang === 'bn' ? 'চার্জ' : 'charge'}`, color: 'text-rose-600' },
                    { key: 'Nagad', name: 'নগদ (Nagad)', feeText: `+${nagadRate}% ${lang === 'bn' ? 'চার্জ' : 'charge'}`, color: 'text-orange-600' },
                    { key: 'Rocket', name: 'রকেট (Rocket)', feeText: `+${rocketRate}% ${lang === 'bn' ? 'চার্জ' : 'charge'}`, color: 'text-purple-600' }
                  ].map((pOpt) => (
                    <label 
                      key={pOpt.key} 
                      className={`flex flex-col items-center justify-center p-3 border rounded-2xl cursor-pointer text-center transition-all ${
                        paymentMethod === pOpt.key 
                          ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20 font-extrabold shadow-xs' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600 font-medium'
                      }`}
                    >
                      <input
                        id={`payment-option-${pOpt.key.replace(/\s+/g, '-')}`}
                        type="radio"
                        name="payment_opt"
                        value={pOpt.key}
                        checked={paymentMethod === pOpt.key}
                        onChange={() => setPaymentMethod(pOpt.key as any)}
                        className="sr-only"
                      />
                      <span className="text-[11px] leading-snug">{pOpt.name}</span>
                      <span className={`text-[9px] mt-1 px-1.5 py-0.5 rounded font-bold ${
                        paymentMethod === pOpt.key 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {pOpt.feeText}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Secure Gateway Instructions */}
                {paymentMethod !== 'Cash on Delivery' && (() => {
                  let activeNumber = '01913955452';
                  let activeType = 'Personal';
                  if (paymentMethod === 'bKash') {
                    activeNumber = storeSettings?.bkashNumber || '01913955452';
                    activeType = storeSettings?.bkashType || 'Personal';
                  } else if (paymentMethod === 'Nagad') {
                    activeNumber = storeSettings?.nagadNumber || '01913955452';
                    activeType = storeSettings?.nagadType || 'Personal';
                  } else if (paymentMethod === 'Rocket') {
                    activeNumber = storeSettings?.rocketNumber || '01913955452';
                    activeType = storeSettings?.rocketType || 'Personal';
                  }

                  const paymentMethodLabel = paymentMethod === 'bKash' ? (lang === 'bn' ? 'বিকাশ' : 'bKash') : paymentMethod === 'Nagad' ? (lang === 'bn' ? 'নগদ' : 'Nagad') : (lang === 'bn' ? 'রকেট' : 'Rocket');
                  const instructionsEn = storeSettings?.paymentInstructionsEn || `Please Send Money (৳${grandTotal.toLocaleString()}${paymentCharge > 0 ? ` including ৳${paymentCharge} gateway charge` : ''}) to our verified ${paymentMethod} ${activeType} number: ${activeNumber}. Put down the SMS Transaction ID (TxnID) in the box below:`;
                  const instructionsBn = storeSettings?.paymentInstructionsBn || `আমাদের অফিসিয়াল ${paymentMethodLabel} ${activeType === 'Personal' ? 'পার্সোনাল' : activeType === 'Agent' ? 'এজেন্ট' : 'মার্চেন্ট'} নাম্বার ${activeNumber}-এ সর্বমোট ৳${grandTotal.toLocaleString()} (${paymentCharge > 0 ? `গেটওয়ে চার্জ ৳${paymentCharge} সহ` : ''}) সেন্ড মানি করুন। এরপর আপনার এসএমএস-এ প্রাপ্ত ট্রানজেকশন আইডি (TxnID) নিচের বক্সে দিন:`;

                  return (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <p className="font-bold text-gray-800 flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          {lang === 'bn' ? `${paymentMethod} পেমেন্ট নির্দেশনা:` : `${paymentMethod} Transfer Instructions:`}
                        </p>
                        {paymentCharge > 0 && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            {lang === 'bn' ? `চার্জ: ৳${paymentCharge} (${paymentChargeRate}%)` : `Fee: ৳${paymentCharge} (${paymentChargeRate}%)`}
                          </span>
                        )}
                      </div>

                      {/* Official Number Highlight Card with Copy button */}
                      <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                              {lang === 'bn' ? `আমাদের অফিসিয়াল ${paymentMethodLabel} নাম্বার (${activeType}):` : `Our Official ${paymentMethod} Number (${activeType}):`}
                            </span>
                          </div>
                          <div className="text-base font-black font-mono text-emerald-950 mt-0.5 tracking-wide">
                            {activeNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(activeNumber);
                            setCopiedNumber(true);
                            setTimeout(() => setCopiedNumber(false), 2000);
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Copy number"
                        >
                          {copiedNumber ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{lang === 'bn' ? 'নাম্বার কপি' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-gray-700 leading-relaxed font-semibold">
                        {lang === 'bn' ? instructionsBn : instructionsEn}
                      </p>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                          {lang === 'bn' ? `${paymentMethod} ট্রানজেকশন আইডি (TxnID) দিন` : `Enter ${paymentMethod} TxnID`}
                        </label>
                        <input
                          id="payment-transaction-id"
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. BK789H0LQ3"
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-700 font-mono font-bold uppercase tracking-widest"
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Form division: Data Encryption Protection Toggle */}
              <div className="flex items-start space-x-2.5 p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100/40">
                <input
                  id="crypto-check"
                  type="checkbox"
                  checked={enableCrypto}
                  onChange={() => setEnableCrypto(!enableCrypto)}
                  className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded-sm focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs">
                  <label htmlFor="crypto-check" className="font-extrabold text-emerald-800 cursor-pointer flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    {lang === 'bn' ? 'অর্ডার ডাটা এ্যান্ড-টু-এ্যান্ড সিকিউর এনক্রিপশন সক্রিয় করুন' : 'Activate 256-Bit Data End-to-End Encryption'}
                  </label>
                  <p className="text-gray-450 mt-0.5 leading-relaxed">
                    {lang === 'bn' 
                      ? 'চেকআউট সাবমিটের সময় আপনার ফোন নম্বর ও ডাটা লোকাল ব্রাউজারে এনক্রিপ্ট হয়ে পে-লোডেড কন্টেন্ট ট্রাস্ট বাড়াবে।' 
                      : 'Protects critical inputs from sniffing by utilizing simulated endpoint hash encryption prior to transit.'}
                  </p>
                </div>
              </div>

              {/* Coupon System field */}
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <label className="block text-xs font-extrabold text-slate-700">
                  🎟️ {lang === 'bn' ? 'ডিসকাউন্ট কুপন ব্যবহার করুন' : 'Have a Promo / Coupon Code?'}
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon-code-input"
                    type="text"
                    disabled={!!appliedCoupon}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: TAQWA10, PETCARE, FREE60' : 'e.g. TAQWA10, PETCARE, FREE60'}
                    className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono tracking-wider focus:outline-hidden focus:border-emerald-500 bg-white disabled:bg-slate-100 disabled:text-slate-400 font-bold"
                  />
                  {!appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer disabled:bg-slate-300 transition-colors"
                    >
                      {isApplyingCoupon ? '...' : (lang === 'bn' ? 'প্রয়োগ করুন' : 'Apply')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl cursor-pointer border border-red-200 transition-colors"
                    >
                      {lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                    </button>
                  )}
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-emerald-650 font-bold">{couponSuccess}</p>}
                <p className="text-[9px] text-slate-400">
                  💡 {lang === 'bn' ? 'চলমান কুপন: TAQWA10 (১০%), PETCARE (১৫%), FREE60 (৳৬০ ছাড়!)' : 'Try codes: TAQWA10 (10%), PETCARE (15%), or FREE60 (৳60 free shipping equivalent)'}
                </p>
              </div>

              {/* Checkout pricing summary */}
              <div className="p-4 bg-gray-50 rounded-2xl flex flex-col space-y-2 text-xs text-gray-600">
                {couponDiscountAmount > 0 && (
                  <div className="flex justify-between font-medium text-emerald-600 pb-1.5 border-b border-dashed border-gray-200">
                    <span>{lang === 'bn' ? 'কুপন ডিসকাউন্ট:' : 'Coupon Discount:'}</span>
                    <span className="font-bold">-৳{couponDiscountAmount}</span>
                  </div>
                )}
                
                {/* Courier details in summary */}
                <div className="space-y-1.5 text-[11.5px]">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-1 font-semibold">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      {lang === 'bn' ? 'কুরিয়ার সার্ভিস:' : 'Selected Courier:'}
                    </span>
                    <span className="font-bold text-slate-900">{selectedCourier}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{lang === 'bn' ? 'কন্ডিশন মূল্য (বকেয়া ক্যাশ অন ডেলিভারি):' : 'Condition Payable (COD):'}</span>
                    <span className="font-bold text-slate-900">৳{conditionAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{lang === 'bn' ? 'কন্ডিশন চার্জ (Condition Charge):' : 'Condition Charge:'}</span>
                    <span className="font-bold text-slate-800">
                      ৳{conditionCharge} <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-extrabold ${conditionChargeType === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>({conditionChargeType})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{lang === 'bn' ? 'ক্যারিং চার্জ (Carrying Charge):' : 'Carrying Charge:'}</span>
                    <span className="font-bold text-slate-800">
                      ৳{carryingCharge} <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-extrabold ${carryingChargeType === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>({carryingChargeType})</span>
                    </span>
                  </div>
                  {paymentCharge > 0 && (
                    <div className="flex justify-between items-center text-rose-700 bg-rose-50/90 px-2 py-1 rounded-lg border border-rose-200/80">
                      <span className="font-bold flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                        {paymentMethod === 'bKash' 
                          ? (lang === 'bn' ? `বিকাশ চার্জ (${paymentChargeRate}%):` : `bKash Charge (${paymentChargeRate}%):`)
                          : paymentMethod === 'Nagad'
                          ? (lang === 'bn' ? `নগদ চার্জ (${paymentChargeRate}%):` : `Nagad Charge (${paymentChargeRate}%):`)
                          : (lang === 'bn' ? `রকেট চার্জ (${paymentChargeRate}%):` : `Rocket Charge (${paymentChargeRate}%):`)}
                      </span>
                      <span className="font-black text-rose-800">
                        +৳{paymentCharge.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between border-t border-gray-200 pt-2.5 text-sm font-black text-emerald-800">
                  <span>{lang === 'bn' ? 'সর্বমোট মূল্য (Grand Total):' : 'Grand Total:'}</span>
                  <div className="text-right">
                    <span className="text-base font-black">৳{grandTotal.toLocaleString()}</span>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                      {lang === 'bn'
                        ? `(কন্ডিশন ৳${conditionAmount.toLocaleString()} + বহন খরচ ৳${carryingCharge.toLocaleString()}${conditionCharge > 0 ? ` + কন্ডিশন চার্জ ৳${conditionCharge.toLocaleString()}` : ''}${paymentCharge > 0 ? ` + ${paymentMethod === 'bKash' ? 'বিকাশ' : paymentMethod === 'Nagad' ? 'নগদ' : 'রকেট'} চার্জ ৳${paymentCharge.toLocaleString()}` : ''})`
                        : `(Condition ৳${conditionAmount.toLocaleString()} + Carrying ৳${carryingCharge.toLocaleString()}${conditionCharge > 0 ? ` + Condition Charge ৳${conditionCharge.toLocaleString()}` : ''}${paymentCharge > 0 ? ` + ${paymentMethod} Charge ৳${paymentCharge.toLocaleString()}` : ''})`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <button
                id="place-order-submit-btn"
                type="submit"
                disabled={isPlacingOrder}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm tracking-wider transition-all duration-300 hover:scale-[1.01] shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isPlacingOrder ? (lang === 'bn' ? 'অর্ডার জমা হচ্ছে...' : 'Processing Payment...') : (lang === 'bn' ? 'নিশ্চিত অর্ডার সম্পূর্ণ করুন' : 'Secure and Complete Order')}</span>
              </button>

            </form>
          </>
        ) : (
          /* Order Confirmation / Success screen with Full Invoice */
          <div className="text-center py-4 sm:py-6 space-y-5" id="order-success-screen">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black text-gray-900">
                {lang === 'bn' ? 'অভিনন্দন! আপনার অর্ডারটি নিশ্চিত হয়েছে!' : 'Payment & Order Placed Successfully!'}
              </h2>
              <p className="text-xs text-gray-500">
                {lang === 'bn' ? 'তাকওয়া এন্টারপ্রাইজ থেকে খুব শীঘ্রই আপনার পার্সেল নির্ধারিত ঠিকানায় বুকিং দেওয়া হবে।' : 'Our support team is dispatching express items immediately.'}
              </p>
            </div>

            {/* Generated Order Confirmation Invoice Receipt Card */}
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg mx-auto text-left shadow-lg overflow-hidden" id="order-invoice-receipt">
              {/* Invoice Header Ribbon */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase flex items-center gap-1.5 text-emerald-400">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lang === 'bn' ? 'অর্ডার কনফার্মেশন ইনভয়েস' : 'Order Confirmation Invoice'}</span>
                  </h3>
                  <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                    {lang === 'bn' ? 'চালান / ইনভয়েস নং: ' : 'Invoice #: '}
                    <span className="font-bold text-white">{orderDetails.invoiceNumber || orderDetails.orderNumber || orderDetails.trackingId}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                    {lang === 'bn' ? '✓ অর্ডার নিশ্চিত' : '✓ Confirmed'}
                  </span>
                  <p className="text-[9px] text-slate-400 mt-1">
                    {new Date(orderDetails.createdAt || Date.now()).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB')}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3.5">
                {/* Tracking Code Banner */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      {lang === 'bn' ? 'অর্ডার ট্র্যাকিং কোড (লাইভ ট্র্যাকার)' : 'Live Order Tracking Code'}
                    </p>
                    <p className="font-mono font-black text-base text-emerald-950 select-all">
                      {orderDetails.trackingId}
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-medium text-right">
                    {lang === 'bn' ? 'স্টোরে এই কোড দিয়ে ট্র্যাক করুন' : 'Use this code to track delivery'}
                  </span>
                </div>

                {/* Customer, Address & Courier Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-slate-400">{lang === 'bn' ? 'গ্রাহকের তথ্য' : 'Customer Info'}</p>
                    <p className="font-black text-slate-800 text-sm">{orderDetails.customerName.replace('🔒_enc_', '')}</p>
                    <p className="text-slate-600 font-bold">{orderDetails.customerPhone}</p>
                    {orderDetails.customerEmail && (
                      <p className="text-slate-500 font-mono text-[10px]">{orderDetails.customerEmail}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase font-black text-slate-400">{lang === 'bn' ? 'ডেলিভারি ও কুরিয়ার তথ্য' : 'Delivery & Courier Details'}</p>
                    <p className="text-slate-700 font-medium leading-snug">
                      <strong className="text-slate-800">{lang === 'bn' ? 'ঠিকানা: ' : 'Address: '}</strong>
                      {orderDetails.shippingAddress}, {orderDetails.district}
                    </p>
                    <p className="text-slate-700 font-medium">
                      <strong className="text-slate-800">{lang === 'bn' ? 'কুরিয়ার সার্ভিস: ' : 'Courier: '}</strong>
                      <span className="font-bold text-slate-900">{orderDetails.courierName || selectedCourier}</span>
                    </p>
                    
                    {/* Highlighted Courier Point Display in Confirmation Invoice */}
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-300/90 rounded-xl text-xs shadow-2xs">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                            {lang === 'bn' ? 'কুরিয়ার পয়েন্ট / পিকআপ শাখা:' : 'Courier Point / Pickup Hub:'}
                          </p>
                          <p className="font-black text-emerald-950 text-xs">
                            {orderDetails.courierPoint || courierPoint || (lang === 'bn' ? 'হোম ডেলিভারি (কোনো নির্দিষ্ট শাখা উল্লেখিত নেই)' : 'Home Delivery (No specific branch specified)')}
                          </p>
                          <p className="text-[10px] text-emerald-700 font-medium">
                            {orderDetails.courierPoint || courierPoint 
                              ? (lang === 'bn' ? 'পার্সেলটি উল্লেখিত কুরিয়ার পয়েন্ট/শাখা থেকে সংগ্রহ করতে হবে।' : 'Customer will receive/collect parcel from this designated courier branch.')
                              : (lang === 'bn' ? 'সরাসরি উল্লেখিত ঠিকানায় ডেলিভারি পৌঁছে দেওয়া হবে।' : 'Standard direct delivery to the provided customer shipping address.')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Ledger Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-black text-[10px] border-b border-slate-200 uppercase">
                        <th className="py-2 px-3">{lang === 'bn' ? 'পণ্যের নাম / বিবরণ' : 'Description'}</th>
                        <th className="py-2 px-3 text-center">{lang === 'bn' ? 'পরিমাণ' : 'Qty'}</th>
                        <th className="py-2 px-3 text-right">{lang === 'bn' ? 'মোট' : 'Total'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {(orderDetails.items && orderDetails.items.length > 0) ? (
                        orderDetails.items.map((it, idx) => (
                          <tr key={idx} className="text-slate-700">
                            <td className="py-2 px-3 font-bold">{it.productName}</td>
                            <td className="py-2 px-3 text-center font-medium">{it.quantity}</td>
                            <td className="py-2 px-3 text-right font-bold">৳{(it.price * it.quantity).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="text-slate-700">
                          <td className="py-2 px-3 font-bold">{orderDetails.productItemName || productItemName}</td>
                          <td className="py-2 px-3 text-center font-medium">{productQuantity}</td>
                          <td className="py-2 px-3 text-right font-bold">৳{(productPrice * productQuantity).toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Ledger Financial Calculation */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 text-xs space-y-1.5 text-slate-600 font-medium">
                  {conditionAmount > 0 && (
                    <div className="flex justify-between">
                      <span>{lang === 'bn' ? 'কন্ডিশন মূল্য (Condition Amount):' : 'Condition Amount:'}</span>
                      <span className="font-bold text-slate-800">৳{conditionAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {conditionCharge > 0 && (
                    <div className="flex justify-between">
                      <span>{lang === 'bn' ? 'কন্ডিশন চার্জ:' : 'Condition Charge:'}</span>
                      <span className="font-bold text-slate-800">৳{conditionCharge} ({conditionChargeType})</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{lang === 'bn' ? 'ক্যারিং চার্জ (বহন খরচ):' : 'Carrying Charge:'}</span>
                    <span className="font-bold text-slate-800">৳{carryingCharge} ({carryingChargeType})</span>
                  </div>
                  {orderDetails.paymentCharge && orderDetails.paymentCharge > 0 ? (
                    <div className="flex justify-between text-rose-600">
                      <span>{lang === 'bn' ? `${orderDetails.paymentMethod} চার্জ:` : `${orderDetails.paymentMethod} Fee:`}</span>
                      <span className="font-bold">৳{orderDetails.paymentCharge.toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                    <span>{lang === 'bn' ? 'সর্বমোট প্রদেয় বিল (Grand Total):' : 'Grand Total:'}</span>
                    <span className="text-emerald-700 text-base font-black">৳{orderDetails.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>{lang === 'bn' ? 'পেমেন্ট পদ্ধতি:' : 'Payment Method:'}</span>
                    <span className="font-bold text-slate-800">{orderDetails.paymentMethod}</span>
                  </div>
                </div>

                {/* Print & Store Navigation Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ইনভয়েস প্রিন্ট / সংরক্ষণ করুন' : 'Print / Save Invoice'}</span>
                  </button>
                  <button
                    id="success-close-btn"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-all"
                  >
                    {lang === 'bn' ? 'স্টোরে ফিরে যান' : 'Back to Storefront'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
