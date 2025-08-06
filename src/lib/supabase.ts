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
    .select(`
      *,
      category:categories!products_category_id_fkey(id, name, slug),
      subcategory:categories!products_subcategory_id_fkey(id, name, slug)
    `, { count: 'exact' })
    .eq('active', true);

  if (filters.category_id) query = query.eq('category_id', filters.category_id);
  if (filters.subcategory_id) query = query.eq('subcategory_id', filters.subcategory_id);
  if (filters.featured !== undefined) query = query.eq('featured', filters.featured);
  if (filters.search) query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
  if (filters.min_price !== undefined) query = query.gte('price', filters.min_price);
  if (filters.max_price !== undefined) query = query.lte('price', filters.max_price);
  // Los filtros de sizes y colors ahora se manejan a través del sistema de variantes y opciones
  // if (filters.sizes?.length) query = query.overlaps('sizes', filters.sizes);
  // if (filters.colors?.length) query = query.overlaps('colors', filters.colors);

  const sortBy = filters.sort_by || 'created_at';
  const sortOrder = filters.sort_order || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);

  const { data, error, count } = await query;
  return { data, error, count };
};

/**
 * Obtiene productos con variantes y opciones completas (para páginas de detalle)
 */
export const getProductsWithVariants = async (filters: {
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
    .select(`
      *,
      category:categories!products_category_id_fkey(id, name, slug),
      subcategory:categories!products_subcategory_id_fkey(id, name, slug),
      variants:product_variants(id, sku, price, stock, weight, image_url, active),
      options:product_options(
        id, 
        name, 
        type, 
        position,
        values:product_option_values(id, value, color_hex, image_url, position)
      )
    `, { count: 'exact' })
    .eq('active', true);

  if (filters.category_id) query = query.eq('category_id', filters.category_id);
  if (filters.subcategory_id) query = query.eq('subcategory_id', filters.subcategory_id);
  if (filters.featured !== undefined) query = query.eq('featured', filters.featured);
  if (filters.search) query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
  if (filters.min_price !== undefined) query = query.gte('price', filters.min_price);
  if (filters.max_price !== undefined) query = query.lte('price', filters.max_price);

  const sortBy = filters.sort_by || 'created_at';
  const sortOrder = filters.sort_order || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);

  const { data, error, count } = await query;
  return { data, error, count };
};

export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories!products_category_id_fkey(id, name, slug),
      subcategory:categories!products_subcategory_id_fkey(id, name, slug),
      variants:product_variants(id, sku, price, stock, weight, image_url, active),
      options:product_options(
        id, 
        name, 
        type, 
        position,
        values:product_option_values(id, value, color_hex, image_url, position)
      )
    `)
    .eq('id', id)
    .eq('active', true)
    .single();

  return { data, error };
};

/**
 * Obtiene las variantes de un producto específico
 */
export const getProductVariants = async (productId: string) => {
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      *,
      option_values:variant_option_values(
        *,
        option_value:product_option_values(
          *,
          option:product_options(*)
        )
      )
    `)
    .eq('product_id', productId)
    .eq('active', true);

  return { data, error };
};

/**
 * Obtiene las opciones de un producto específico
 */
export const getProductOptions = async (productId: string) => {
  const { data, error } = await supabase
    .from('product_options')
    .select(`
      *,
      values:product_option_values(*)
    `)
    .eq('product_id', productId)
    .order('position');

  return { data, error };
};

/**
 * Busca una variante específica basada en las opciones seleccionadas
 */
export const findVariantByOptions = async (productId: string, selectedOptions: Record<string, string>) => {
  // Esta función requiere lógica más compleja para encontrar la variante correcta
  // basada en las opciones seleccionadas a través de la tabla variant_option_values
  const optionValueIds = Object.values(selectedOptions);
  
  if (optionValueIds.length === 0) {
    return { data: null, error: 'No se han seleccionado opciones' };
  }

  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      *,
      variant_option_values!inner(
        option_value_id
      )
    `)
    .eq('product_id', productId)
    .eq('active', true)
    .in('variant_option_values.option_value_id', optionValueIds);

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
 * Obtiene el carrito del usuario actual con información de productos y variantes
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
      product:products(*),
      variant:product_variants(*)
    `)
    .eq('user_id', user.id)
    .order('added_at', { ascending: false });

  return { data, error };
};

/**
 * Agrega un producto al carrito con soporte para variantes
 */
export const addToCart = async (
  productId: string, 
  quantity: number, 
  variantId?: string,
  size?: string, 
  color?: string
) => {
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
    .eq('variant_id', variantId || null)
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
        variant_id: variantId || null,
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
 * Obtiene estadísticas del usuario para el dashboard
 */
export const getUserStats = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { data: null, error: 'Usuario no autenticado' };
  }

  try {
    // Obtener total de pedidos y suma de totales
    const { data: orderStats, error: orderError } = await supabase
      .from('orders')
      .select('total, status')
      .eq('user_id', user.id)
      .in('status', ['confirmed', 'processing', 'shipped', 'delivered']);

    if (orderError) {
      console.error('Error obteniendo estadísticas de pedidos:', orderError);
      return { data: null, error: orderError.message };
    }

    // Obtener número de favoritos
    const { count: favoritesCount, error: favoritesError } = await supabase
      .from('wishlist_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (favoritesError) {
      console.error('Error obteniendo favoritos:', favoritesError);
    }

    // Calcular estadísticas
    const totalOrders = orderStats?.length || 0;
    const totalSpent = orderStats?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
    const favorites = favoritesCount || 0;

    return {
      data: {
        totalOrders,
        totalSpent,
        favorites
      },
      error: null
    };
  } catch (error) {
    console.error('Error en getUserStats:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
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

// Storage functions

/**
 * Sube una imagen al storage de Supabase
 */
export const uploadImage = async (file: File, folder: string = 'products'): Promise<{ url?: string; error?: string }> => {
  try {
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Subir archivo
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { error: error.message };
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { url: publicUrl };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

/**
 * Elimina una imagen del storage
 */
export const deleteImage = async (url: string): Promise<{ error?: string }> => {
  try {
    // Extraer el path de la URL
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'product-images');
    if (bucketIndex === -1) {
      return { error: 'URL de imagen inválida' };
    }
    
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

/**
 * Lista archivos en un folder específico
 */
export const listImages = async (folder: string = 'products') => {
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .list(folder);

    if (error) {
      return { data: null, error: error.message };
    }

    // Convertir a URLs públicas
    const imageUrls = data?.map(file => {
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(`${folder}/${file.name}`);
      return publicUrl;
    }) || [];

    return { data: imageUrls, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

/**
 * Funciones para gestión de direcciones
 */

/**
 * Obtiene todas las direcciones del usuario actual
 */
export const getUserAddresses = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

/**
 * Crea una nueva dirección
 */
export const createAddress = async (addressData: {
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country?: string;
  is_default?: boolean;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    // Si esta dirección se marca como predeterminada, desmarcar las demás
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        ...addressData,
        user_id: user.id,
        country: addressData.country || 'Ecuador'
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

/**
 * Actualiza una dirección existente
 */
export const updateAddress = async (id: string, addressData: {
  type?: 'shipping' | 'billing';
  street?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_default?: boolean;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    // Si esta dirección se marca como predeterminada, desmarcar las demás
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabase
      .from('addresses')
      .update({
        ...addressData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

/**
 * Elimina una dirección
 */
export const deleteAddress = async (id: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    return { data: null, error };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

/**
 * Establece una dirección como predeterminada
 */
export const setDefaultAddress = async (id: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    // Desmarcar todas las direcciones como predeterminadas
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);

    // Marcar la dirección especificada como predeterminada
    const { data, error } = await supabase
      .from('addresses')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

export default supabase;
