'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  const addToCart = (product, options = {}) => {
    const { qty = 1, variantId, variantName, metal, stone } = options;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        item =>
          item._id === product._id &&
          item.variantId === variantId &&
          item.metal === metal
      );

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: (updated[existingIdx].qty ?? 1) + qty,
        };
        return updated;
      }

      const variant = product.variants?.find(v => v._id === variantId) || {};
      const newItem = {
        _id: product._id,
        title: product.title || product.name,
        images: variant.images?.length ? variant.images : product.images || [],
        img: product.img,
        newPrice: variant.newPrice ?? product.newPrice ?? product.price,
        price: product.price,
        qty,
        variantId,
        variantName,
        metal,
        stone,
        slug: product.slug,
        category: product.category,
      };
      return [...prev, newItem];
    });
  };

  useEffect(() => {
    const handleAddToCartEvent = (e) => {
      const item = e.detail?.item;
      if (!item) return;

      setCartItems(prev => {
        const existingIdx = prev.findIndex(
          i =>
            i._id === item._id &&
            i.variantId === item.variantId &&
            i.metal === item.metal
        );

        if (existingIdx !== -1) {
          // Already in cart → increase qty
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            qty: (updated[existingIdx].qty ?? 1) + (item.qty ?? 1),
          };
          return updated;
        }

        // New item → add to cart
        return [...prev, { ...item }];
      });
    };

    window.addEventListener('add-to-cart', handleAddToCartEvent);
    return () => window.removeEventListener('add-to-cart', handleAddToCartEvent);
  }, []);

  const removeFromCart = (productId, variantId, metal) => {
    setCartItems(prev =>
      prev.filter(item => {
        if (variantId !== undefined && metal !== undefined) {
          return !(item._id === productId && item.variantId === variantId && item.metal === metal);
        }
        return item._id !== productId;
      })
    );
  };

  const updateQty = (productId, newQty, variantId, metal) => {
    if (newQty < 1) return;
    setCartItems(prev =>
      prev.map(item => {
        if (variantId !== undefined && metal !== undefined) {
          if (item._id === productId && item.variantId === variantId && item.metal === metal) {
            return { ...item, qty: newQty };
          }
          return item;
        }
        if (item._id === productId) return { ...item, qty: newQty };
        return item;
      })
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

export default CartContext;