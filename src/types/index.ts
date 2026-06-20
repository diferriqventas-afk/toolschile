// ToolsChile — Global TypeScript Types

export interface Product {
  id: string
  sku: string
  name: string
  slug: string
  description?: string
  shortDesc?: string
  isActive: boolean
  isFeatured: boolean
  isOnOffer: boolean
  createdAt: Date
  updatedAt: Date
  category: Category
  brand: Brand
  variants: ProductVariant[]
  images: ProductImage[]
  specs: ProductSpec[]
  reviews: Review[]
  _avg?: { rating: number }
  _count?: { reviews: number }
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  price: number
  comparePrice?: number
  stock: number
  sku?: string
  isDefault: boolean
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  alt?: string
  isPrimary: boolean
  sortOrder: number
}

export interface ProductSpec {
  id: string
  label: string
  value: string
  sortOrder: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string
  parentId?: string
  children?: Category[]
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  website?: string
}

export interface Review {
  id: string
  rating: number
  title?: string
  body?: string
  createdAt: Date
  user: { name?: string }
}

// ─── CART ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string
  product: Product
  variant: ProductVariant
  quantity: number
}

export interface CartState {
  items: CartItem[]
  addItem: (product: Product, variant: ProductVariant, qty?: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, qty: number) => void
  clearCart: () => void
  total: number
  subtotal: number
  itemCount: number
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'WEBPAY' | 'MERCADO_PAGO' | 'BANK_TRANSFER'

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  subtotal: number
  shipping: number
  discount: number
  total: number
  couponCode?: string
  createdAt: Date
  address: Address
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  product: Pick<Product, 'id' | 'slug' | 'images'>
}

// ─── USERS / ADDRESS ──────────────────────────────────────────────────────────

export interface Address {
  id: string
  firstName: string
  lastName: string
  phone: string
  region: string
  comuna: string
  address: string
  apartment?: string
  isDefault: boolean
}

export interface CheckoutFormData {
  firstName: string
  lastName: string
  rut: string
  email: string
  phone: string
  region: string
  comuna: string
  address: string
  apartment?: string
  paymentMethod: PaymentMethod
  couponCode?: string
  notes?: string
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
  recentOrders: Order[]
  topProducts: { product: Product; totalSold: number }[]
}

// ─── FILTERS ──────────────────────────────────────────────────────────────────

export interface ProductFilters {
  search?: string
  categorySlug?: string
  brandId?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  onOffer?: boolean
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'best_rated' | 'best_sellers'
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── CHILE-SPECIFIC ───────────────────────────────────────────────────────────

export const CHILE_REGIONS = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama',
  'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', "O'Higgins",
  'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos',
  'Los Lagos', 'Aysén', 'Magallanes',
] as const

export type ChileRegion = typeof CHILE_REGIONS[number]
