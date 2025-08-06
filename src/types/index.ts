/**
 * Tipos de datos principales para la tienda VELVET integrados con Supabase
 * Incluye definiciones para productos, usuarios, pedidos y carrito de compras
 */

// Tipos base de Supabase
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          product_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          product_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          product_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          discount_price: number | null;
          images: string[];
          category_id: string | null;
          subcategory_id: string | null;
          stock: number;
          featured: boolean;
          tags: string[];
          brand: string | null;
          material: string | null;
          care_instructions: string | null;
          sku: string | null;
          weight: number | null;
          dimensions: any | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          discount_price?: number | null;
          images?: string[];
          category_id?: string | null;
          subcategory_id?: string | null;
          stock?: number;
          featured?: boolean;
          tags?: string[];
          brand?: string | null;
          material?: string | null;
          care_instructions?: string | null;
          sku?: string | null;
          weight?: number | null;
          dimensions?: any | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          discount_price?: number | null;
          images?: string[];
          category_id?: string | null;
          subcategory_id?: string | null;
          stock?: number;
          featured?: boolean;
          tags?: string[];
          brand?: string | null;
          material?: string | null;
          care_instructions?: string | null;
          sku?: string | null;
          weight?: number | null;
          dimensions?: any | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string | null;
          price: number;
          stock: number;
          weight: number | null;
          image_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku?: string | null;
          price: number;
          stock?: number;
          weight?: number | null;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string | null;
          price?: number;
          stock?: number;
          weight?: number | null;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_options: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          type: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          type?: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          type?: string;
          position?: number;
          created_at?: string;
        };
      };
      product_option_values: {
        Row: {
          id: string;
          option_id: string;
          value: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          option_id: string;
          value: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          option_id?: string;
          value?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      variant_option_values: {
        Row: {
          variant_id: string;
          option_value_id: string;
        };
        Insert: {
          variant_id: string;
          option_value_id: string;
        };
        Update: {
          variant_id?: string;
          option_value_id?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          gender: string | null;
          role: 'user' | 'admin';
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          role?: 'user' | 'admin';
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          role?: 'user' | 'admin';
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          size: string | null;
          color: string | null;
          added_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          size?: string | null;
          color?: string | null;
          added_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          size?: string | null;
          color?: string | null;
          added_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: OrderStatus;
          subtotal: number;
          tax: number;
          shipping: number;
          discount: number;
          total: number;
          shipping_address: any;
          billing_address: any;
          payment_method: any;
          payment_status: string;
          payment_id: string | null;
          tracking_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: OrderStatus;
          subtotal: number;
          tax: number;
          shipping: number;
          discount?: number;
          total: number;
          shipping_address: any;
          billing_address: any;
          payment_method: any;
          payment_status?: string;
          payment_id?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: OrderStatus;
          subtotal?: number;
          tax?: number;
          shipping?: number;
          discount?: number;
          total?: number;
          shipping_address?: any;
          billing_address?: any;
          payment_method?: any;
          payment_status?: string;
          payment_id?: string | null;
          tracking_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Tipos derivados para la aplicación
export type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Category;
  subcategory?: Category;
  variants?: ProductVariant[];
  options?: ProductOption[];
};

export type ProductVariant = Database['public']['Tables']['product_variants']['Row'] & {
  option_values?: ProductOptionValue[];
};

export type ProductOption = Database['public']['Tables']['product_options']['Row'] & {
  values?: ProductOptionValue[];
};

export type ProductOptionValue = Database['public']['Tables']['product_option_values']['Row'] & {
  option?: ProductOption;
};

export type Category = Database['public']['Tables']['categories']['Row'] & {
  subcategories?: Category[];
};

export type User = Database['public']['Tables']['user_profiles']['Row'];

export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  product: Product;
  quantity: number;
  size: string | null;
  color: string | null;
  variant_id?: string;
  variant?: ProductVariant;
  added_at: string;
  updated_at: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  shipping_address: Address;
  billing_address: Address;
  payment_method: PaymentMethod;
  payment_status: string;
  payment_id?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_snapshot: Product;
  quantity: number;
  size: string | null;
  color: string | null;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'mercadopago';
  last4?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  user: Pick<User, 'first_name' | 'last_name' | 'avatar_url'>;
  rating: number;
  title?: string;
  comment?: string;
  helpful_count: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  products: Product[];
  created_at: string;
  updated_at: string;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_days: number;
  tracking_available: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Newsletter {
  id: string;
  email: string;
  preferences: {
    new_products: boolean;
    sales: boolean;
    newsletter: boolean;
  };
  is_active: boolean;
  subscribed_at: string;
  unsubscribed_at?: string;
}

// Tipos para formularios
export interface UserPreferences {
  notifications: boolean;
  newsletter: boolean;
  preferred_size: string;
  favorite_categories: string[];
  language: string;
  currency: string;
}

// Tipos para filtros de productos
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  featured?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
  sizes?: string[];
  colors?: string[];
  brands?: string[];
  sort_by?: 'name' | 'price' | 'created_at' | 'featured';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}
