"use client";

import Link from "next/link";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import "./Wishlist.css";

const API_BASE = "https://api.barosche.com";

function getImgSrc(path) {
    if (!path) return "/placeholder.jpg";
    return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

export default function WishlistPage() {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    // Hook ko sidha call karein, conditional operator hatayein
    const { cartItems, updateQty, removeFromCart } = useCart();

    const handleAddToCart = (item) => {
        window.dispatchEvent(new CustomEvent("add-to-cart", { detail: { item: { ...item, qty: 1 } } }));
        setTimeout(() => window.dispatchEvent(new CustomEvent("open-cart-drawer")), 400);
    };

    return (
        <>
            <div className="wl-page">
                <div className="wl-container">
                    {/* Header */}
                    <div className="wl-header">
                        <nav className="wl-breadcrumb">
                            <Link href="/">Home</Link>
                            <span className="wl-bc-sep">/</span>
                            <span>Wishlist</span>
                        </nav>
                        <h1 className="wl-title">My Wishlist</h1>
                        {wishlistItems.length > 0 && (
                            <p className="wl-subtitle">{wishlistItems.length} item{wishlistItems.length > 1 ? "s" : ""} saved</p>
                        )}
                    </div>

                    {wishlistItems.length === 0 ? (
                        /* Empty State */
                        <div className="wl-empty">
                            <div className="wl-empty-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                            </div>
                            <h2 className="wl-empty-title">Your wishlist is empty</h2>
                            <p className="wl-empty-sub">Save your favourite pieces and find them here whenever you're ready.</p>
                            <Link href="/product-category/jewellery" className="wl-btn-primary">
                                EXPLORE COLLECTION
                            </Link>
                        </div>
                    ) : (
                        /* Grid */
                        <div className="wl-grid">
                            {wishlistItems.map((item, idx) => {
                                const rawImg =
                                    Array.isArray(item.images) && item.images.length > 0
                                        ? item.images[0]
                                        : item.img ?? null;
                                const price = item.newPrice ?? item.price ?? 0;
                                const oldPrice = item.oldPrice ?? null;
                                const title = item.title || item.name || "Product";
                                
                                // FIXED: Category ko .toLowerCase() kar diya
                                const category = (item.category || "jewellery").toLowerCase();
                                const slug = item.slug || "";
                                const href = slug ? `/product-category/${category}/${slug}` : "#";

                                return (
                                    <div key={`${item._id}-${item.variantId}-${idx}`} className="wl-card">
                                        {/* Image */}
                                        <Link href={href} className="wl-card-img-wrap">
                                            <img
                                                src={getImgSrc(rawImg)}
                                                alt={title}
                                                className="wl-card-img"
                                                onError={(e) => { 
                                                    // FIXED: Infinite refresh loop ko rokne ke liye onerror null karein
                                                    e.target.onerror = null; 
                                                    e.target.src = "/placeholder.jpg"; 
                                                }}
                                            />
                                            {item.isSale && (
                                                <span className="wl-sale-badge">Sale</span>
                                            )}
                                        </Link>

                                        {/* Remove */}
                                        <button
                                            className="wl-remove-btn"
                                            onClick={() => removeFromWishlist(item._id, item.variantId)}
                                            aria-label="Remove from wishlist"
                                            title="Remove"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>

                                        {/* Info */}
                                        <div className="wl-card-info">
                                            <p className="wl-card-brand">Barosche Fine Jewellery</p>
                                            <Link href={href} className="wl-card-title">{title}</Link>

                                            {/* Variant meta */}
                                            <div className="wl-card-meta">
                                                {item.metal && item.metal !== "All" && (
                                                    <span className="wl-meta-pill">{item.metal}</span>
                                                )}
                                                {item.size && (
                                                    <span className="wl-meta-pill">Size: {item.size}</span>
                                                )}
                                                {item.stone?.name && (
                                                    <span className="wl-meta-pill" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                        <span style={{
                                                            width: 10, height: 10, borderRadius: "50%",
                                                            background: item.stone.hex, display: "inline-block"
                                                        }} />
                                                        {item.stone.name}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Pricing */}
                                            <div className="wl-card-pricing">
                                                {oldPrice && Number(oldPrice) > Number(price) && (
                                                    <del className="wl-old-price">€{Number(oldPrice).toLocaleString("en-IN")}</del>
                                                )}
                                                <span className="wl-new-price">€{Number(price).toLocaleString("en-IN")}</span>
                                            </div>

                                            {/* CTA */}
                                            <div className="wl-card-actions">
                                                <button
                                                    className="wl-btn-add"
                                                    onClick={() => handleAddToCart(item)}
                                                >
                                                    ADD TO BAG
                                                </button>
                                                <Link href={href} className="wl-btn-view">
                                                    VIEW
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}