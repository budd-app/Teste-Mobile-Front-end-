export type CategoryId = 'drink' | 'cocktail' | 'food' | 'ticket' | 'event' | 'service';

export type PriceLevel = 1 | 2 | 3 | 4;

export type Vibe =
  | 'bar'
  | 'boteco'
  | 'cocktail'
  | 'live'
  | 'rooftop'
  | 'balada'
  | 'pet'
  | 'wine'
  | 'jazz'
  | 'samba'
  | 'craft'
  | 'vegan'
  | 'quiet'
  | 'outdoor';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OpeningHours {
  /** "17:00" */
  opens: string;
  /** "02:00" — pode passar da meia-noite. */
  closes: string;
}

export interface Bar {
  id: string;
  name: string;
  initials: string;
  category: string;
  tagline: string;
  /** Cor de fundo do placeholder de imagem enquanto não há foto. */
  tone: string;
  image?: string;
  rating: number;
  reviews: number;
  priceLevel: PriceLevel;
  distanceKm: number;
  walkMinutes: number;
  address: string;
  neighborhood: string;
  coords: Coordinates;
  hours: OpeningHours;
  vibes: Vibe[];
  amenities: string[];
  acceptsAppOrders: boolean;
  gallery: string[];
  featured?: { label: string };
}

export interface ProductOption {
  id: string;
  label: string;
  extra: number;
}

export interface Product {
  id: string;
  barId: string;
  category: CategoryId;
  name: string;
  description: string;
  price: number;
  tone: string;
  image?: string;
  tags?: string[];
  options?: ProductOption[];
  promo?: { label: string; originalPrice: number };
  popular?: boolean;
}

export interface BarEvent {
  id: string;
  barId: string;
  title: string;
  /** ISO date */
  date: string;
  time: string;
  price: number | null;
  lineup?: string;
}

export interface Promo {
  id: string;
  barId: string;
  title: string;
  subtitle: string;
  badge: string;
  price?: number;
  originalPrice?: number;
  tone: string;
}

export type PaymentMethodId = 'pix' | 'card' | 'wallet';

export interface OrderItem {
  productId: string;
  name: string;
  category: CategoryId;
  qty: number;
  unitPrice: number;
  optionLabel?: string;
}

export type OrderStatus = 'paid' | 'preparing' | 'ready';

export interface Order {
  id: string;
  code: string;
  barId: string;
  barName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  serviceFee: number;
  total: number;
  cashback: number;
  method: PaymentMethodId;
  status: OrderStatus;
  createdAt: number;
}
