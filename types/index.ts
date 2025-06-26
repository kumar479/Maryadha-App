// Factory types
export enum LeatherType {
  CowHide = 'CowHide',
  LambSkin = 'LambSkin',
  GoatSkin = 'GoatSkin'
}

export enum TanningType {
  Chrome = 'Chrome',
  Vegetable = 'Vegetable'
}

export enum FinishType {
  Distressed = 'Distressed',
  Matte = 'Matte',
  Pebbled = 'Pebbled',
  Polished = 'Polished',
  Suede = 'Suede'
}

export enum ProductCategory {
  Bags = 'Bags',
  Jackets = 'Jackets',
  Wallets = 'Wallets',
  Belts = 'Belts'
}

export interface Factory {
  id: string;
  name: string;
  location: string;
  description: string;
  founder_story?: string;
  verified: boolean;
  minimum_order_quantity: number;
  leather_types: LeatherType[];
  tanning_types: TanningType[];
  finishes: FinishType[];
  product_categories?: ProductCategory[];
  delivery_timeline?: string;
  certifications?: string[];
  branding_assets?: string[];
  video_url?: string;
  featured_image?: string;
  gallery?: string[];
  tech_pack_guide?: string;
  instagram?: string;
  website?: string;
  rep_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Brand types
export interface Brand {
  id: string;
  name: string;
  email?: string;
  website?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Rep types
export interface Rep {
  id: string;
  name: string;
  email?: string;
  active: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Sample types
export interface Sample {
  id: string;
  factoryId: string;
  factoryName?: string;
  brandId?: string;
  status: string;
  createdAt: string;
  techPack?: string;
  sketch?: string;
  notes?: string;
  preferredMoq?: number;
  quantity?: number;
  finishNotes?: string;
  deliveryAddress?: string;
  productName?: string;
  referenceImages?: string[];
  brands?: { name: string } | null;
  factories?: { name: string } | null;
}

export interface SampleStatusUpdate {
  id?: string;
  sampleId: string;
  status:
    | 'requested'
    | 'invoice_sent'
    | 'sample_paid'
    | 'in_production'
    | 'shipped'
    | 'delivered';
  eta?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface OrderStatusUpdate {
  id?: string;
  orderId: string;
  status: 'confirmed' | 'in_production' | 'quality_check' | 'completed';
  notes?: string | null;
  createdAt: string;
}

// Order types
export interface Order {
  id: string;
  sampleId?: string;
  brandId?: string;
  factoryId?: string;
  repId?: string;
  status: string;
  quantity: number;
  unitPrice?: number;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
  brands?: { name: string; email?: string } | null;
  factories?: { name: string } | null;
  reps?: { name: string; email?: string } | null;
}

// Message types
export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id?: string;
  text: string;
  attachments?: string[];
  created_at: string;
}

// Database message interface for Supabase responses
export interface DatabaseMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id?: string;
  text: string;
  attachments?: string[];
  created_at: string;
}

// Message data for sending
export interface MessageData {
  chat_id: string;
  sender_id: string;
  text: string;
  attachments?: string[];
}

// Chat list type
export interface Chat {
  id?: string;
  factoryId: string;
  factoryName: string;
  brandName?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

// Quality check result
export interface QualityCheck {
  id?: string;
  orderId: string;
  repId?: string;
  passed: boolean;
  notes?: string;
  createdAt?: string;
}
