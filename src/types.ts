export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  approved?: boolean;
  reported?: boolean;
}

export interface Product {
  id: string;
  name: string;
  banglaName: string;
  category: 'birds' | 'cats' | 'fish' | 'rabbits' | 'accessories' | 'supplements' | string;
  subcategory?: string;
  price: number; // in BDT
  originalPrice: number; // in BDT
  description: string;
  banglaDescription: string;
  image: string;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  weight?: string;
  stock: number;
  tags: string[];
  variants?: string[];
  imagesGallery?: string[];
  videosGallery?: string[];
  featured?: boolean;
  bestSeller?: boolean;
  recommended?: boolean;
  newArrival?: boolean;
  flashSale?: boolean;
  active?: boolean;
  slug?: string;
  sku?: string;
  barcode?: string;
  shortDescription?: string;
  fullDescription?: string;
  brand?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  trackingId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  district: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Cash on Delivery' | string;
  paymentStatus: 'Pending' | 'Paid';
  paymentTransactionId?: string;
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Refunded' | string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Editor' | 'Viewer' | 'Customer';
  joinedAt: string;
  addresses?: Address[];
  notifications?: StoreNotification[];
  recentlyViewed?: string[];
  avatar?: string;
  status?: 'Active' | 'Inactive' | 'Banned';
  lastLogin?: string;
}

export interface Address {
  id: string;
  label: 'Home' | 'Office' | string;
  addressLine: string;
  district: string;
  phone: string;
}

export interface StoreNotification {
  id: string;
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  type: 'order' | 'promo' | 'coupon' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface Category {
  id: string;
  name: string;
  banglaName: string;
  image?: string;
  icon?: string;
  displayOrder: number;
  enabled: boolean;
  subcategories: string[];
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  oneTime: boolean;
  enabled: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type: 'Homepage Slider' | 'Offer Banner' | 'Popup Banner' | 'Category Banner';
  publishDate?: string;
  status: 'Active' | 'Inactive';
}

export interface FlashSale {
  id: string;
  title: string;
  countdownEndTime: string;
  products: string[];
  startTime: string;
  endTime: string;
  status: 'Active' | 'Inactive';
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: 'Stock Adjustment' | 'Purchase Entry' | 'Damage Entry' | string;
  quantity: number;
  reason: string;
  date: string;
  operator: string;
}

export interface ActivityLog {
  id: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface StoreSettings {
  storeName: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  businessHours: string;
  socialFacebook: string;
  socialYoutube: string;
  shippingChargeDhaka: number;
  shippingChargeOutside: number;
  taxRate: number;
  currency: string;
  language: 'en' | 'bn';
  // Enterprise Extensions
  bkashNumber?: string;
  bkashType?: 'Personal' | 'Agent' | 'Merchant';
  nagadNumber?: string;
  nagadType?: 'Personal' | 'Agent' | 'Merchant';
  rocketNumber?: string;
  rocketType?: 'Personal' | 'Agent' | 'Merchant';
  paymentInstructionsEn?: string;
  paymentInstructionsBn?: string;
  maintenanceMode?: boolean;
  orderIdPrefix?: string;
}
