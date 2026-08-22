"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const [wishlistItems, setWishlistItems] = useState([]);

    const { user } = useAuth();

    useEffect(() => {
        try {
            const saved = localStorage.getItem("barosche_wishlist");
            if (saved) setWishlistItems(JSON.parse(saved));
        } catch (e) {}
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem("barosche_wishlist", JSON.stringify(wishlistItems));
        } catch (e) {}
    }, [wishlistItems]);
    const requireLogin = useCallback(() => {
        if (!user) {
            window.dispatchEvent(new CustomEvent("open-login-panel"));
            return false;
        }
        return true;
    }, [user]);

    const addToWishlist = useCallback((item) => {
        if (!requireLogin()) return;

        setWishlistItems(prev => {
            const exists = prev.find(
                w => w._id === item._id && w.variantId === item.variantId
            );
            if (exists) return prev;
            return [...prev, { ...item, addedAt: Date.now() }];
        });
    }, [requireLogin]);

    const removeFromWishlist = useCallback((_id, variantId) => {
        setWishlistItems(prev =>
            prev.filter(w => !(w._id === _id && w.variantId === variantId))
        );
    }, []);

    const isInWishlist = useCallback((_id, variantId) => {
        return wishlistItems.some(
            w => w._id === _id && w.variantId === variantId
        );
    }, [wishlistItems]);

    const toggleWishlist = useCallback((item) => {
        if (!requireLogin()) return;

        if (isInWishlist(item._id, item.variantId)) {
            removeFromWishlist(item._id, item.variantId);
        } else {
            addToWishlist(item);
        }
    }, [requireLogin, isInWishlist, addToWishlist, removeFromWishlist]);

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist,
            wishlistCount: wishlistItems.length,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
}