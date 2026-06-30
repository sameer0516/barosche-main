'use client'

import React, { useState, useRef, useEffect } from 'react';
import './shop.css';
import Link from 'next/link';

const categories = [
    { name: "Chosen" },
    { name: "Earrings" },
    { name: "For Today" },
    { name: "Jewellery" },
    { name: "Mens" },
    { name: "New" },
    { name: "Pendants" },
    { name: "Rings" },
    { name: "Womens" },
];

const prices = [
    { label: "€1–€500", min: 1, max: 500 },
    { label: "€500–€1000", min: 500, max: 1000 },
    { label: "€1000–€2000", min: 1000, max: 2000 },
    { label: "€2000–€5000", min: 2000, max: 5000 },
    { label: "€5000–€10000", min: 5000, max: 10000 },
    { label: "€10000+", min: 10000, max: 999999 },
];

const TOP_OFFSET = 40;
const API_BASE = "https://api.barosche.com";

function getFirstVariant(product) {
    if (product.variants && product.variants.length > 0) {
        return product.variants[0];
    }

    return {
        images: product.images || [],
        oldPrice: product.oldPrice,
        newPrice: product.newPrice,
        isSale: product.isSale || false,
        inStock: product.inStock ?? true,
    };
}

function ProductCard({ p, wishlist, toggleWishlist }) {
    const variant = getFirstVariant(p);

    const images = variant.images || [];

    const [currentImg, setCurrentImg] = useState(0);
    const intervalRef = useRef(null);

    const startHover = () => {
        if (images.length <= 1) return;
        let idx = 1;
        intervalRef.current = setInterval(() => {
            setCurrentImg(idx);
            idx = (idx + 1) % images.length;
        }, 800);
    };

    const stopHover = () => {
        clearInterval(intervalRef.current);
        setCurrentImg(0);
    };

    useEffect(() => () => clearInterval(intervalRef.current), []);

    const imgSrc =
        images.length > 0
            ? `${API_BASE}${images[currentImg]}`
            : "/placeholder.jpg";

    const oldPrice = variant.oldPrice;
    const newPrice = variant.newPrice;
    const isSale   = variant.isSale;

    return (
        <Link
            href={`/product-category/shop/${p.slug}`}
            className="jw-card"
            onMouseEnter={startHover}
            onMouseLeave={stopHover}
        >
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">SALE!</span>}

                <img
                    src={imgSrc}
                    alt={p.title}
                    className="jw-card-img"
                    loading="lazy"
                    onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                />

                {images.length > 1 && (
                    <div className="jw-img-dots">
                        {images.map((_, i) => (
                            <span
                                key={i}
                                className={`jw-img-dot ${i === currentImg ? 'jw-img-dot--active' : ''}`}
                            />
                        ))}
                    </div>
                )}

                <div className="jw-card-actions">
                    <button
                        className={`jw-action-btn ${wishlist.includes(p._id) ? 'jw-action-btn--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); toggleWishlist(p._id); }}
                        title="Add to Wishlist"
                    >
                        <svg width="16" height="15" viewBox="0 0 16 15" fill="none">
                            <path
                                d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z"
                                stroke="currentColor" strokeWidth="1.3"
                                fill={wishlist.includes(p._id) ? 'currentColor' : 'none'}
                            />
                        </svg>
                    </button>
                    <button
                        className="jw-action-btn"
                        title="Quick View"
                        onClick={(e) => e.preventDefault()}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
                            <path
                                d="M1 8C2.5 4 5 2 8 2C11 2 13.5 4 15 8C13.5 12 11 14 8 14C5 14 2.5 12 1 8Z"
                                stroke="currentColor" strokeWidth="1.3"
                            />
                        </svg>
                    </button>
                    <button
                        className="jw-action-btn jw-add-cart"
                        title="Add to Cart"
                        onClick={(e) => e.preventDefault()}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M1 1H3L4.5 9H12.5L14 4H4"
                                stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
                            />
                            <circle cx="6" cy="12" r="1.2" fill="currentColor" />
                            <circle cx="11" cy="12" r="1.2" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="jw-card-body">
                <p className="jw-card-cat">{p.category}</p>
                <h3 className="jw-card-name">{p.title}</h3>
                <div className="jw-card-price">
                    {oldPrice && (
                        <span className="jw-old-price">
                            €{Number(oldPrice).toLocaleString('en-IN')}
                        </span>
                    )}
                    <span className="jw-new-price">
                        €{Number(newPrice).toLocaleString('en-IN')}
                    </span>
                </div>
            </div>
        </Link>
    );
}

function SkeletonCard() {
    return (
        <div className="jw-card jw-skeleton">
            <div className="jw-skeleton-img" />
            <div className="jw-card-body">
                <div className="jw-skeleton-line jw-skeleton-line--short" />
                <div className="jw-skeleton-line" />
                <div className="jw-skeleton-line jw-skeleton-line--med" />
            </div>
        </div>
    );
}

export default function Shop() {
    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Shop");

    const [perPage, setPerPage] = useState(12);
    const [sort, setSort] = useState("default");
    const [wishlist, setWishlist] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const layoutRef = useRef(null);
    const sidebarRef = useRef(null);

    // ── Backend Data Fetching ──
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const queryParams = new URLSearchParams();
                if (activeCategory) {
                    queryParams.append("category", activeCategory);
                }

                const url = `${API_BASE}/api/products?${queryParams.toString()}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Server Error: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setProducts(data.products || []);
                } else {
                    throw new Error(data.message || "Failed to fetch data.");
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [activeCategory]);

    const sortedProducts = [...products].sort((a, b) => {
        const aPrice = getFirstVariant(a).newPrice || 0;
        const bPrice = getFirstVariant(b).newPrice || 0;

        if (sort === "price-asc")  return aPrice - bPrice;
        if (sort === "price-desc") return bPrice - aPrice;
        if (sort === "newest")     return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
    });

    const filtered = sortedProducts.filter((p) => {
        if (!activePrice) return true;
        const range = prices.find((pr) => pr.label === activePrice);
        if (!range) return true;
        const price = getFirstVariant(p).newPrice || 0;
        return price >= range.min && price <= range.max;
    });

    const displayed = filtered.slice(0, perPage);

    useEffect(() => {
        const isMobile = () => window.innerWidth <= 768;
        const update = () => {
            if (isMobile()) {
                const sb = sidebarRef.current;
                if (sb) { sb.style.position = ''; sb.style.top = ''; sb.style.width = ''; }
                return;
            }
            const layout  = layoutRef.current;
            const sidebar = sidebarRef.current;
            if (!layout || !sidebar) return;

            const scrollY   = window.scrollY;
            const layoutTop = layout.offsetTop;
            const layoutH   = layout.offsetHeight;
            const sidebarH  = sidebar.offsetHeight;
            const sidebarW  = sidebar.parentElement?.offsetWidth || sidebar.offsetWidth;
            const paddingBot = parseFloat(window.getComputedStyle(layout).paddingBottom) || 0;
            const contentH  = layoutH - paddingBot;
            const stickStart = layoutTop - TOP_OFFSET;
            const stickEnd   = layoutTop + contentH - sidebarH - TOP_OFFSET;

            if (scrollY < stickStart) {
                sidebar.style.position = 'relative';
                sidebar.style.top      = '0';
                sidebar.style.width    = '';
            } else if (scrollY >= stickEnd) {
                sidebar.style.position = 'absolute';
                sidebar.style.top      = (contentH - sidebarH) + 'px';
                sidebar.style.width    = sidebarW + 'px';
            } else {
                sidebar.style.position = 'fixed';
                sidebar.style.top      = TOP_OFFSET + 'px';
                sidebar.style.width    = sidebarW + 'px';
            }
        };
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    const toggleWishlist = (id) =>
        setWishlist((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    return (
        <div className="jw-page">

            <button className="jw-filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <span className="jw-filter-icon">
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                        <rect width="18" height="2" rx="1" fill="currentColor" />
                        <rect x="3" y="6" width="12" height="2" rx="1" fill="currentColor" />
                        <rect x="6" y="12" width="6" height="2" rx="1" fill="currentColor" />
                    </svg>
                </span>
                Filters
            </button>

            {sidebarOpen && (
                <div className="jw-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="jw-layout" ref={layoutRef}>

                <div className="jw-sidebar-wrapper">
                    <aside
                        ref={sidebarRef}
                        className={`jw-sidebar ${sidebarOpen ? 'jw-sidebar--open' : ''}`}
                    >
                        <div className="jw-sidebar-inner">
                            <button
                                className="jw-sidebar-close"
                                onClick={() => setSidebarOpen(false)}
                            >✕</button>

                            {/* ── Categories ── */}
                            <div className="jw-filter-block">
                                <button
                                    className="jw-filter-heading"
                                    onClick={() => setCatOpen(!catOpen)}
                                    aria-expanded={catOpen}
                                >
                                    <span>Product Categories</span>
                                    <span className={`jw-chevron ${catOpen ? 'jw-chevron--up' : ''}`}>
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                </button>
                                <div className={`jw-filter-body ${catOpen ? 'jw-filter-body--open' : ''}`}>
                                    <ul className="jw-cat-list">
                                        {categories.map((c) => (
                                            <li key={c.name}>
                                                <button
                                                    className={`jw-cat-item ${activeCategory === c.name ? 'jw-cat-item--active' : ''}`}
                                                    onClick={() => setActiveCategory(c.name)}
                                                >
                                                    <svg className="jw-cat-arrow" width="6" height="10" viewBox="0 0 6 10" fill="none">
                                                        <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                                    </svg>
                                                    <span className="jw-cat-name">{c.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="jw-divider" />

                            {/* ── Price ── */}
                            <div className="jw-filter-block">
                                <button
                                    className="jw-filter-heading"
                                    onClick={() => setPriceOpen(!priceOpen)}
                                    aria-expanded={priceOpen}
                                >
                                    <span>Price</span>
                                    <span className={`jw-chevron ${priceOpen ? 'jw-chevron--up' : ''}`}>
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                </button>
                                <div className={`jw-filter-body ${priceOpen ? 'jw-filter-body--open' : ''}`}>
                                    <ul className="jw-price-list">
                                        {prices.map((pr) => (
                                            <li key={pr.label}>
                                                <button
                                                    className={`jw-price-item ${activePrice === pr.label ? 'jw-price-item--active' : ''}`}
                                                    onClick={() =>
                                                        setActivePrice(
                                                            activePrice === pr.label ? null : pr.label
                                                        )
                                                    }
                                                >
                                                    <span className="jw-price-radio">
                                                        {activePrice === pr.label && (
                                                            <span className="jw-price-radio-dot" />
                                                        )}
                                                    </span>
                                                    {pr.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                        </div>
                    </aside>
                </div>

                <main className="jw-main">

                    <h1 className="jw-title">
                        {activeCategory
                            ? `${activeCategory} – Elegant Semi-Precious & Gold Fashion Jewellery`
                            : "Elegant Semi-Precious & Gold Fashion Jewellery Collection"}
                    </h1>

                    {/* ── Toolbar ── */}
                    <div className="jw-toolbar">
                        <span className="jw-results-count">
                            {loading
                                ? "Loading..."
                                : `Showing ${displayed.length} of ${filtered.length} results`}
                        </span>
                        <div className="jw-toolbar-right">
                            <div className="jw-per-page">
                                <span className="jw-per-label">Show</span>
                                {[12, 15, 30].map((n) => (
                                    <button
                                        key={n}
                                        className={`jw-per-btn ${perPage === n ? 'jw-per-btn--active' : ''}`}
                                        onClick={() => setPerPage(n)}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <div className="jw-sort-wrap">
                                <select
                                    className="jw-sort-select"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                >
                                    <option value="default">Default sorting</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="newest">Newest</option>
                                </select>
                                <span className="jw-select-arrow">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                    </svg>
                                </span>
                            </div>
                            <button className="jw-grid-toggle" title="Grid view">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect width="7" height="7" rx="1" fill="currentColor" />
                                    <rect x="9" width="7" height="7" rx="1" fill="currentColor" />
                                    <rect y="9" width="7" height="7" rx="1" fill="currentColor" />
                                    <rect x="9" y="9" width="7" height="7" rx="1" fill="currentColor" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* ── Error ── */}
                    {error && (
                        <div className="jw-error">
                            <span>⚠️ {error}</span>
                            <button onClick={() => setActiveCategory(activeCategory)}>Retry</button>
                        </div>
                    )}

                    {/* ── Product Grid ── */}
                    <div className="jw-grid">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
                        ) : displayed.length > 0 ? (
                            displayed.map((p) => (
                                <ProductCard
                                    key={p._id}
                                    p={p}
                                    wishlist={wishlist}
                                    toggleWishlist={toggleWishlist}
                                />
                            ))
                        ) : (
                            <div className="jw-empty">
                                <p>No products found{activeCategory ? ` in "${activeCategory}"` : ''}.</p>
                                <p style={{ fontSize: '13px', marginTop: '8px', color: '#aaa' }}>
                                    Check browser console (F12) for errors.
                                </p>
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
}