'use client';

import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { Cart, CartItem, Product } from '@/types';
import { 
  getUserCart, 
  addToCart as addToCartDB, 
  updateCartItemQuantity, 
  removeFromCart as removeFromCartDB,
  clearCart as clearCartDB,
  supabase 
} from '@/lib/supabase';

/**
 * Contexto del carrito de compras para la tienda VELVET integrado con Supabase
 * Maneja el estado global del carrito, sincronizando con la base de datos
 */

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  isInCart: (productId: string, size: string, color: string) => boolean;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CART':
      return { ...state, items: action.payload, loading: false, error: null };
    
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.product_id === action.payload.product_id && 
                item.size === action.payload.size && 
                item.color === action.payload.color
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        };
        return { ...state, items: updatedItems };
      } else {
        return { ...state, items: [...state.items, action.payload] };
      }
    }
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    default:
      return state;
  }
};

// Función para calcular totales del carrito
const calculateCartTotals = (items: CartItem[]): Pick<Cart, 'subtotal' | 'tax' | 'shipping' | 'discount' | 'total'> => {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discount_price || item.product.price;
    return sum + (price * item.quantity);
  }, 0);

  const tax = subtotal * 0.16; // 16% IVA México
  const shipping = subtotal > 1000 ? 0 : 150; // Envío gratis arriba de $1000
  const discount = 0; // Se puede implementar lógica de descuentos
  const total = subtotal + tax + shipping - discount;

  return {
    subtotal,
    tax,
    shipping,
    discount,
    total,
  };
};

// Estado inicial del carrito
const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito inicial del usuario autenticado
  useEffect(() => {
    const loadUserCart = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const { data: cartItems, error } = await getUserCart();
        
        if (error) {
          // Si el usuario no está autenticado, cargar desde localStorage
          if (error === 'Usuario no autenticado') {
            const savedCart = localStorage.getItem('velvet-cart');
            if (savedCart) {
              const parsedCart = JSON.parse(savedCart);
              dispatch({ type: 'SET_CART', payload: parsedCart.items || [] });
            } else {
              dispatch({ type: 'SET_CART', payload: [] });
            }
          } else {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Error desconocido';
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
          }
        } else {
          dispatch({ type: 'SET_CART', payload: cartItems || [] });
        }
      } catch (err) {
        console.error('Error al cargar el carrito:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el carrito';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    };

    loadUserCart();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Usuario se autenticó, cargar carrito de la BD
        loadUserCart();
      } else if (event === 'SIGNED_OUT') {
        // Usuario cerró sesión, limpiar carrito
        dispatch({ type: 'CLEAR_CART' });
        localStorage.removeItem('velvet-cart');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Guardar en localStorage cuando el carrito cambie (para usuarios no autenticados)
  useEffect(() => {
    const totals = calculateCartTotals(state.items);
    const cartData = { items: state.items, ...totals };
    localStorage.setItem('velvet-cart', JSON.stringify(cartData));
  }, [state.items]);

  const addToCart = async (product: Product, size: string, color: string, quantity: number = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await addToCartDB(product.id, quantity, size, color);
      
      if (error) {
        // Si el usuario no está autenticado, usar localStorage
        if (typeof error === 'string' && error === 'Usuario no autenticado') {
          const cartItem: CartItem = {
            id: `${product.id}-${size}-${color}-${Date.now()}`,
            user_id: 'guest',
            product_id: product.id,
            product,
            quantity,
            size,
            color,
            added_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          dispatch({ type: 'ADD_ITEM', payload: cartItem });
        } else {
          const errorMessage = typeof error === 'string' ? error : error.message || 'Error desconocido';
          dispatch({ type: 'SET_ERROR', payload: errorMessage });
        }
      } else {
        // Recargar carrito completo después de agregar
        const { data: updatedCart } = await getUserCart();
        dispatch({ type: 'SET_CART', payload: updatedCart || [] });
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al agregar al carrito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const removeFromCart = async (itemId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await removeFromCartDB(itemId);
      
      if (error && !(typeof error === 'string' && error === 'Usuario no autenticado')) {
        const errorMessage = typeof error === 'string' ? error : error.message || 'Error desconocido';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } else {
        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      }
    } catch (err) {
      console.error('Error al eliminar del carrito:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar del carrito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await updateCartItemQuantity(itemId, quantity);
      
      if (error && !(typeof error === 'string' && error === 'Usuario no autenticado')) {
        const errorMessage = typeof error === 'string' ? error : error.message || 'Error desconocido';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } else {
        dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
      }
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cantidad';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await clearCartDB();
      
      if (error && !(typeof error === 'string' && error === 'Usuario no autenticado')) {
        const errorMessage = typeof error === 'string' ? error : error.message || 'Error desconocido';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      } else {
        dispatch({ type: 'CLEAR_CART' });
        localStorage.removeItem('velvet-cart');
      }
    } catch (err) {
      console.error('Error al limpiar carrito:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al limpiar carrito';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productId: string, size: string, color: string) => {
    return state.items.some(
      item => item.product_id === productId && 
               item.size === size && 
               item.color === color
    );
  };

  const totals = calculateCartTotals(state.items);
  const cart: Cart = {
    items: state.items,
    ...totals,
  };

  const value: CartContextType = useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    isInCart,
    loading: state.loading,
    error: state.error,
  }), [cart, state.loading, state.error]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
