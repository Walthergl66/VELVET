import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types';

/**
 * Cliente de Supabase configurado para la tienda VELVET
 * Incluye tipado completo de la base de datos y funciones auxiliares
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Funciones auxiliares para la base de datos

/**
 * Obtiene el perfil del usuario actual
 */
export const getCurrentUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { data, error };
};

/**
 * Crea o actualiza el perfil del usuario
 */
export const upsertUserProfile = async (profile: {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(profile)
    .select()
    .single();

  return { data, error };
};

/**
 * Obtiene productos con filtros
 */
export const getProducts = async (filters: {
  category_id?: string;
  subcategory_id?: string;
  featured?: boolean;
  search?: string;
  min_price?: number;
  max_price?: number;
  sizes?: string[];
  colors?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
} = {}) => {
  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true);

  // Aplicar filtros
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters.subcategory_id) {
    query = query.eq('subcategory_id', filters.subcategory_id);
  }

  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
  }

  if (filters.min_price !== undefined) {
    query = query.gte('price', filters.min_price);
  }

  if (filters.max_price !== undefined) {
    query = query.lte('price', filters.max_price);
  }

  if (filters.sizes && filters.sizes.length > 0) {
    query = query.overlaps('sizes', filters.sizes);
  }

  if (filters.colors && filters.colors.length > 0) {
    query = query.overlaps('colors', filters.colors);
  }

  // Ordenamiento
  const sortBy = filters.sort_by || 'created_at';
  const sortOrder = filters.sort_order || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Paginación
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data, error, count } = await query;
  return { data, error, count };
};

/**
 * Obtiene un producto por ID
 */
export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single();

  return { data, error };
};

/**
 * Obtiene todas las categorías
 */
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  return { data, error };
};

/**
 * Obtiene el carrito del usuario actual
 */
export const getUserCart = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: [], error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  return { data, error };
};

/**
 * Agrega un producto al carrito
 */
export const addToCart = async (productId: string, quantity: number, size?: string, color?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: 'Usuario no autenticado' };
  }

  // Verificar si ya existe el item con las mismas características
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .eq('size', size || null)
    .eq('color', color || null)
    .single();

  if (existingItem) {
    // Actualizar cantidad
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single();

    return { data, error };
  } else {
    // Crear nuevo item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity,
        size,
        color
      })
      .select()
      .single();

    return { data, error };
  }
};

/**
 * Actualiza la cantidad de un item en el carrito
 */
export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
  if (quantity <= 0) {
    return removeFromCart(itemId);
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single();

  return { data, error };
};

/**
 * Elimina un item del carrito
 */
export const removeFromCart = async (itemId: string) => {
  const { data, error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .select()
    .single();

  return { data, error };
};

/**
 * Limpia todo el carrito del usuario
 */
export const clearCart = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  return { data, error };
};

/**
 * Crea una nueva orden
 */
export const createOrder = async (orderData: {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shipping_address: any;
  billing_address: any;
  payment_method: any;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: 'Usuario no autenticado' };
  }

  // Crear la orden
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      user_id: user.id
    })
    .select()
    .single();

  if (orderError) {
    return { data: null, error: orderError };
  }

  // Obtener items del carrito
  const { data: cartItems, error: cartError } = await getUserCart();
  
  if (cartError || !cartItems) {
    return { data: null, error: 'Error al obtener el carrito' };
  }

  // Crear order items
  const orderItems = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_snapshot: item.product,
    quantity: item.quantity,
    size: item.size,
    color: item.color,
    unit_price: item.product.discount_price || item.product.price,
    total_price: (item.product.discount_price || item.product.price) * item.quantity
  }));

  const { data: orderItemsData, error: orderItemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (orderItemsError) {
    return { data: null, error: orderItemsError };
  }

  // Limpiar el carrito
  await clearCart();

  return { data: order, error: null };
};

/**
 * Obtiene las órdenes del usuario
 */
export const getUserOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: [], error: 'Usuario no autenticado' };
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return { data, error };
};

/**
 * Suscribe al newsletter
 */
export const subscribeToNewsletter = async (email: string, preferences = {
  new_products: true,
  sales: true,
  newsletter: true
}) => {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email, preferences })
    .select()
    .single();

  return { data, error };
};

/**
 * Funciones de autenticación personalizadas
 */
export const signUpWithEmail = async (email: string, password: string, userData: {
  first_name?: string;
  last_name?: string;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });

  if (data.user && !error) {
    // Crear perfil de usuario
    await upsertUserProfile({
      id: data.user.id,
      email: data.user.email!,
      first_name: userData.first_name,
      last_name: userData.last_name
    });
  }

  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export default supabase;
