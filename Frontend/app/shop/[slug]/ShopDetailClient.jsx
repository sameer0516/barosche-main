'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import './ShopDetail.css';

const API_BASE = "https://api.barosche.com";

function getFirstVariant(product) {
    if (product.variants && product.variants.length > 0) return product.variants[0];
    return {
        images: product.images || [],
        oldPrice: product.oldPrice,
        newPrice: product.newPrice ?? product.price,
        isSale: product.isSale || false,
        inStock: product.inStock ?? true,
    };
}

function DetailSkeleton() {
    return (
        <div className="jd-page">
            <div className="jd-max-container">
                <div className="jd-split-wrapper">
                    <div className="jd-gallery-scroll skeleton-bg" style={{ height: '600px' }} />
                    <div className="jd-info-scroll">
                        <div className="jd-info-inner">
                            <div className="skeleton-line" style={{ width: '60%', height: '32px', marginBottom: '20px' }} />
                            <div className="skeleton-line" style={{ width: '40%', height: '24px', marginBottom: '40px' }} />
                            <div className="skeleton-line" style={{ width: '100%', height: '100px' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Mobile Image Slider ──
function MobileSlider({ images, getImgSrc, productName, isSale, selectedImageIndex, setSelectedImageIndex }) {
    const sliderRef = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const autoPlayRef = useRef(null);

    const goToSlide = useCallback((idx) => {
        const clamped = Math.max(0, Math.min(idx, images.length - 1));
        setSelectedImageIndex(clamped);
    }, [images.length, setSelectedImageIndex]);

    // Auto-play
    useEffect(() => {
        if (images.length <= 1) return;
        autoPlayRef.current = setInterval(() => {
            setSelectedImageIndex(prev => (prev + 1) % images.length);
        }, 3500);
        return () => clearInterval(autoPlayRef.current);
    }, [images.length, setSelectedImageIndex]);

    const resetAutoPlay = useCallback(() => {
        clearInterval(autoPlayRef.current);
        if (images.length <= 1) return;
        autoPlayRef.current = setInterval(() => {
            setSelectedImageIndex(prev => (prev + 1) % images.length);
        }, 3500);
    }, [images.length, setSelectedImageIndex]);

    // Touch swipe
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const dx = touchStartX.current - e.changedTouches[0].clientX;
        const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
        if (Math.abs(dx) > 40 && Math.abs(dx) > dy) {
            if (dx > 0) goToSlide(selectedImageIndex + 1);
            else goToSlide(selectedImageIndex - 1);
            resetAutoPlay();
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="jd-mobile-slider" ref={sliderRef}>
            <div
                className="jd-mobile-slider-track"
                style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {images.map((img, idx) => (
                    <div className="jd-mobile-slide" key={idx}>
                        {idx === 0 && (
                            <span className="jd-most-loved">Most Loved</span>
                        )}
                        {isSale && idx === 1 && (
                            <span className="jd-sale-badge">Sale</span>
                        )}
                        <img
                            src={getImgSrc(img)}
                            alt={`${productName} view ${idx + 1}`}
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        />
                    </div>
                ))}
            </div>

            {/* Dots */}
            {images.length > 1 && (
                <div className="jd-slider-dots">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            className={`jd-slider-dot${selectedImageIndex === idx ? ' active' : ''}`}
                            onClick={() => { goToSlide(idx); resetAutoPlay(); }}
                            aria-label={`Go to image ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Counter */}
            <div className="jd-slider-counter">{selectedImageIndex + 1} / {images.length}</div>
        </div>
    );
}

export default function ShopDetailClient({ slug }) {
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [qty, setQty] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [openAccordion, setOpenAccordion] = useState('details');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [scrollState, setScrollState] = useState('locked');
    const [isMobile, setIsMobile] = useState(false);

    const galleryRef = useRef(null);
    const infoRef = useRef(null);
    const wrapperRef = useRef(null);

    const stoneColors = [
        { name: 'Blue Topaz',  hex: '#7bc4e1' },
        { name: 'Amethyst',    hex: '#8a4f7d' },
        { name: 'Citrine',     hex: '#e8b84b' },
        { name: 'Peridot',     hex: '#a3be6b' },
        { name: 'Prasiolite',  hex: '#c5d0bc' },
        { name: 'Garnet',      hex: '#7a2021' },
    ];
    const [selectedColor, setSelectedColor] = useState(0);

    // ── Detect mobile ──
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // ── Fetch product ──
    useEffect(() => {
        if (!slug) return;
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/api/products/${slug}`);
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data = await res.json();
                if (data.success) {
                    setProduct(data.product);
                    setSelectedVariantIndex(0);
                    setSelectedImageIndex(0);
                    if (data.product?.category) {
                        try {
                            const relRes = await fetch(
                                `${API_BASE}/api/products?category=${encodeURIComponent(data.product.category)}`
                            );
                            if (relRes.ok) {
                                const relData = await relRes.json();
                                if (relData.success) {
                                    setRelatedProducts(
                                        (relData.products || []).filter(p => p.slug !== slug).slice(0, 5)
                                    );
                                }
                            }
                        } catch (e) { console.error('Non-critical error fetching related products:', e); }
                    }
                } else throw new Error(data.message || 'Product not found');
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        fetchProduct();
    }, [slug]);

    // ── Reset on variant change ──
    useEffect(() => {
        setSelectedImageIndex(0);
        if (galleryRef.current) galleryRef.current.scrollTop = 0;
        setScrollState('locked');
    }, [selectedVariantIndex]);

    // ── Independent scroll: wheel intercept (desktop only) ──
    useEffect(() => {
        if (isMobile) return;
        const gallery = galleryRef.current;
        const info = infoRef.current;
        const wrapper = wrapperRef.current;
        if (!gallery || !info || !wrapper) return;

        const isGalleryAtBottom = () => {
            const { scrollTop, scrollHeight, clientHeight } = gallery;
            return scrollHeight - scrollTop - clientHeight < 8;
        };

        const handleWheel = (e) => {
            if (scrollState === 'unlocked') return;
            const wrapperRect = wrapper.getBoundingClientRect();
            const midX = wrapperRect.left + wrapperRect.width / 2;
            const isOnGallerySide = e.clientX < midX;
            e.preventDefault();
            if (isOnGallerySide) {
                gallery.scrollTop += e.deltaY;
                setTimeout(() => {
                    if (isGalleryAtBottom()) setScrollState('unlocked');
                }, 50);
            } else {
                info.scrollTop += e.deltaY;
            }
        };

        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        return () => wrapper.removeEventListener('wheel', handleWheel);
    }, [scrollState, isMobile]);

    // ── Touch support (desktop gallery) ──
    useEffect(() => {
        if (isMobile) return;
        const gallery = galleryRef.current;
        if (!gallery) return;
        let touchStartY = 0;
        const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
        const handleTouchEnd = (e) => {
            const delta = touchStartY - e.changedTouches[0].clientY;
            if (delta > 0) {
                const { scrollTop, scrollHeight, clientHeight } = gallery;
                if (scrollHeight - scrollTop - clientHeight < 10) setScrollState('unlocked');
            }
        };
        gallery.addEventListener('touchstart', handleTouchStart, { passive: true });
        gallery.addEventListener('touchend', handleTouchEnd, { passive: true });
        return () => {
            gallery.removeEventListener('touchstart', handleTouchStart);
            gallery.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile]);

    const getImgSrc = (path) => {
        if (!path) return '/placeholder.jpg';
        return path.startsWith('http') ? path : `${API_BASE}${path}`;
    };

    // ── Add to cart ──
    const handleAddToCart = useCallback(() => {
        if (!product) return;

        const activeVariant = (product.variants && product.variants.length > 0)
            ? product.variants[selectedVariantIndex] || product.variants[0]
            : getFirstVariant(product);

        const varImgs = activeVariant.images && activeVariant.images.length > 0
            ? activeVariant.images
            : Array.isArray(product.images) && product.images.length > 0
                ? product.images
                : [product.img].filter(Boolean);

        const cartItem = {
            _id: product._id,
            variantId: activeVariant._id || selectedVariantIndex,
            title: product.title || product.name,
            newPrice: activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0,
            images: varImgs,
            img: varImgs[0] || '',
            metal: activeVariant.metal || null,
            stone: stoneColors[selectedColor] || null,
            qty,
            slug: product.slug,
            category: product.category,
        };

        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { item: cartItem } }));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 400);
    }, [product, selectedVariantIndex, qty, selectedColor, stoneColors]);

    if (loading) return <DetailSkeleton />;
    if (error || !product) {
        return (
            <div className="jd-not-found">
                <h2>{error || 'Product Not Found'}</h2>
                <Link href="/product-category/jewellery" className="jd-back-link">← Return to Collection</Link>
            </div>
        );
    }

    // ── Active variant & images ──
    const activeVariant = (product.variants && product.variants.length > 0)
        ? product.variants[selectedVariantIndex] || product.variants[0]
        : getFirstVariant(product);

    const variantImages = activeVariant.images && activeVariant.images.length > 0
        ? activeVariant.images : [];
    const images = variantImages.length > 0
        ? variantImages
        : Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : [product.img].filter(Boolean);

    const oldPrice = activeVariant.oldPrice ?? product.oldPrice ?? null;
    const newPrice = activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0;
    const isSale = activeVariant.isSale ?? product.isSale ?? false;
    const inStock = activeVariant.inStock ?? product.inStock ?? true;

    const getRelatedImgSrc = (rp) => {
        const rv = getFirstVariant(rp);
        const img = (rv.images && rv.images.length > 0) ? rv.images[0] : rp.img || '';
        return getImgSrc(img);
    };
    const getRelatedPrice = (rp) => {
        const rv = getFirstVariant(rp);
        return rv.newPrice ?? rp.newPrice ?? rp.price ?? 0;
    };

    // Pair images into rows of 2 (desktop only)
    const imageRows = [];
    for (let i = 0; i < images.length; i += 2) {
        imageRows.push(images.slice(i, i + 2));
    }

    const isUnlocked = scrollState === 'unlocked';

    return (
        <div className="jd-page">
            <div className={`jd-max-container${isMobile ? ' jd-mobile-page' : ''}`}>

                {/* Breadcrumb */}
                <nav className="jd-breadcrumb">
                    <Link href="/">Home</Link>
                    <span className="jd-bc-sep">/</span>
                    <Link href="/product-category/jewellery">Jewellery</Link>
                    <span className="jd-bc-sep">/</span>
                    <span>{product.category || 'Collection'}</span>
                    <span className="jd-bc-sep">/</span>
                    <span>{product.title || product.name}</span>
                </nav>

                {/* ══════════════════════════════════
                    MOBILE LAYOUT
                ══════════════════════════════════ */}
                {isMobile ? (
                    <div className="jd-mobile-layout">

                        {/* Mobile Slider */}
                        <MobileSlider
                            images={images}
                            getImgSrc={getImgSrc}
                            productName={product.title || product.name}
                            isSale={isSale}
                            selectedImageIndex={selectedImageIndex}
                            setSelectedImageIndex={setSelectedImageIndex}
                        />

                        {/* Mobile Info — no add to cart here, it's fixed at bottom */}
                        <div className="jd-mobile-info">
                            <span className="jd-brand-tag">Barosche Fine Jewellery</span>
                            <h1 className="jd-product-title">{product.title || product.name}</h1>
                            <p className="jd-product-subtitle">{product.material || 'Sterling Silver with 18K Yellow Gold'}</p>

                            {/* Price */}
                            <div className="jd-pricing-row">
                                {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                    <span className="jd-old-price">€{Number(oldPrice).toLocaleString('en-IN')}</span>
                                )}
                                <span className="jd-new-price">€{Number(newPrice).toLocaleString('en-IN')}</span>
                                {isSale && <span className="jd-sale-tag">Sale</span>}
                            </div>

                            {/* Variant selector */}
                            {product.variants && product.variants.length > 1 && (
                                <div className="jd-variant-section">
                                    <span className="jd-variant-label">
                                        Style: <strong style={{ color: 'var(--lux-black)' }}>
                                            {product.variants[selectedVariantIndex]?.name || `Option ${selectedVariantIndex + 1}`}
                                        </strong>
                                    </span>
                                    <div className="jd-variant-grid">
                                        {product.variants.map((v, idx) => {
                                            const vImg = v.images && v.images.length > 0 ? v.images[0] : null;
                                            return (
                                                <button
                                                    key={idx}
                                                    className={`jd-variant-card-btn${selectedVariantIndex === idx ? ' active' : ''}`}
                                                    onClick={() => setSelectedVariantIndex(idx)}
                                                    title={v.name || `Option ${idx + 1}`}
                                                >
                                                    {vImg && (
                                                        <div className="jd-variant-card-img">
                                                            <img
                                                                src={getImgSrc(vImg)}
                                                                alt={v.name || `Variant ${idx + 1}`}
                                                                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="jd-variant-card-name">
                                                        {v.name || `Option ${idx + 1}`}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Gemstone Swatches */}
                            <div className="jd-swatch-section">
                                <span className="jd-swatch-label">
                                    Stone: <strong style={{ color: 'var(--lux-black)' }}>{stoneColors[selectedColor]?.name}</strong>
                                </span>
                                <div className="jd-swatch-grid">
                                    {stoneColors.map((stone, idx) => (
                                        <button
                                            key={idx}
                                            className={`jd-swatch-btn${selectedColor === idx ? ' active' : ''}`}
                                            style={{ '--swatch-color': stone.hex }}
                                            title={stone.name}
                                            onClick={() => setSelectedColor(idx)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="jd-divider" />

                            <div className="jd-mobile-qty-row">
                                <span className="jd-swatch-label" style={{ marginBottom: 0, alignSelf: 'center' }}>Qty:</span>
                                <div className="jd-qty-selector">
                                    <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                                    <span>{qty}</span>
                                    <button onClick={() => setQty(qty + 1)}>+</button>
                                </div>
                                <button className="jd-btn-wishlist" aria-label="Add to wishlist">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Accordions */}
                            <div className="jd-accordions">
                                {[
                                    {
                                        key: 'details',
                                        label: 'Details',
                                        content: (
                                            <>
                                                <p>{product.description || 'An exploration of colour and form, inspired by the pure beauty of hand-set stones and masterful craftsmanship.'}</p>
                                                <p style={{ marginTop: '10px' }}><strong>Material:</strong> {product.material || '18K Yellow Gold'}</p>
                                                <p><strong>Gemstone:</strong> {stoneColors[selectedColor]?.name}</p>
                                                {product.category && <p><strong>Category:</strong> {product.category}</p>}
                                                {product.sku && <p><strong>SKU:</strong> {product.sku}</p>}
                                            </>
                                        )
                                    },
                                    {
                                        key: 'shipping',
                                        label: 'Shipping & Complimentary Returns',
                                        content: <p>Complimentary standard shipping and returns on all premium orders. Each piece arrives wrapped in signature luxury box packaging, ready to gift or treasure.</p>
                                    },
                                    {
                                        key: 'care',
                                        label: 'Care Instructions',
                                        content: <p>Store in the provided pouch away from sunlight and moisture. Clean gently with a soft cloth. Avoid contact with perfumes, lotions, and harsh chemicals to preserve the finish.</p>
                                    }
                                ].map(({ key, label, content }) => (
                                    <div className="jd-accordion-item" key={key}>
                                        <button
                                            className="jd-acc-header"
                                            onClick={() => setOpenAccordion(openAccordion === key ? '' : key)}
                                        >
                                            {label.toUpperCase()}
                                            <span className="jd-acc-icon">{openAccordion === key ? '−' : '+'}</span>
                                        </button>
                                        {openAccordion === key && (
                                            <div className="jd-acc-content">{content}</div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Bottom spacer so content isn't hidden behind fixed bar */}
                            <div style={{ height: '90px' }} />
                        </div>

                        {/* ── FIXED BOTTOM CTA (mobile only) ── */}
                        <div className="jd-mobile-fixed-cta">
                            <div className="jd-mobile-cta-price">
                                <span className="jd-new-price">€{Number(newPrice).toLocaleString('en-IN')}</span>
                                {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                    <span className="jd-old-price jd-old-price--sm">€{Number(oldPrice).toLocaleString('en-IN')}</span>
                                )}
                            </div>
                            <button
                                className={`jd-btn-primary jd-mobile-add-btn${addedToCart ? ' success' : ''}`}
                                onClick={inStock ? handleAddToCart : undefined}
                                disabled={!inStock}
                            >
                                {!inStock ? 'OUT OF STOCK' : addedToCart ? '✓ ADDED TO BAG' : 'ADD TO BAG'}
                            </button>
                        </div>

                    </div>
                ) : (
                    /* ══════════════════════════════════
                        DESKTOP LAYOUT (unchanged)
                    ══════════════════════════════════ */
                    <div
                        className={`jd-split-wrapper${isUnlocked ? ' unlocked' : ''}`}
                        ref={wrapperRef}
                    >
                        {/* LEFT: Gallery */}
                        <div className="jd-gallery-scroll" ref={galleryRef}>
                            <div className="jd-gallery-inner">
                                {imageRows.map((row, rowIdx) => (
                                    <div
                                        key={`${selectedVariantIndex}-row-${rowIdx}`}
                                        className="jd-img-row"
                                    >
                                        {row.map((img, colIdx) => {
                                            const globalIdx = rowIdx * 2 + colIdx;
                                            return (
                                                <div
                                                    key={`${selectedVariantIndex}-img-${globalIdx}`}
                                                    className={`jd-img-cell${selectedImageIndex === globalIdx ? ' selected' : ''}`}
                                                    onClick={() => setSelectedImageIndex(globalIdx)}
                                                >
                                                    {globalIdx === 0 && (
                                                        <span className="jd-most-loved">Most Loved</span>
                                                    )}
                                                    {isSale && globalIdx === 1 && (
                                                        <span className="jd-sale-badge">Sale</span>
                                                    )}
                                                    <img
                                                        src={getImgSrc(img)}
                                                        alt={`${product.title || product.name} view ${globalIdx + 1}`}
                                                        loading={globalIdx < 2 ? 'eager' : 'lazy'}
                                                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                                    />
                                                </div>
                                            );
                                        })}
                                        {row.length === 1 && (
                                            <div className="jd-img-cell jd-img-cell-empty" aria-hidden="true" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: Info */}
                        <div className="jd-info-scroll" ref={infoRef}>
                            <div className="jd-info-inner">
                                <span className="jd-brand-tag">Barosche Fine Jewellery</span>
                                <h1 className="jd-product-title">{product.title || product.name}</h1>
                                <p className="jd-product-subtitle">{product.material || 'Sterling Silver with 18K Yellow Gold'}</p>

                                {/* Price */}
                                <div className="jd-pricing-row">
                                    {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                        <span className="jd-old-price">€{Number(oldPrice).toLocaleString('en-IN')}</span>
                                    )}
                                    <span className="jd-new-price">€{Number(newPrice).toLocaleString('en-IN')}</span>
                                    {isSale && <span className="jd-sale-tag">Sale</span>}
                                </div>

                                {/* Variant selector */}
                                {product.variants && product.variants.length > 1 && (
                                    <div className="jd-variant-section">
                                        <span className="jd-variant-label">
                                            Style: <strong style={{ color: 'var(--lux-black)' }}>
                                                {product.variants[selectedVariantIndex]?.name || `Option ${selectedVariantIndex + 1}`}
                                            </strong>
                                        </span>
                                        <div className="jd-variant-grid">
                                            {product.variants.map((v, idx) => {
                                                const vImg = v.images && v.images.length > 0 ? v.images[0] : null;
                                                return (
                                                    <button
                                                        key={idx}
                                                        className={`jd-variant-card-btn${selectedVariantIndex === idx ? ' active' : ''}`}
                                                        onClick={() => setSelectedVariantIndex(idx)}
                                                        title={v.name || `Option ${idx + 1}`}
                                                    >
                                                        {vImg && (
                                                            <div className="jd-variant-card-img">
                                                                <img
                                                                    src={getImgSrc(vImg)}
                                                                    alt={v.name || `Variant ${idx + 1}`}
                                                                    onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                                                />
                                                            </div>
                                                        )}
                                                        <span className="jd-variant-card-name">
                                                            {v.name || `Option ${idx + 1}`}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Gemstone Swatches */}
                                <div className="jd-swatch-section">
                                    <span className="jd-swatch-label">
                                        Stone: <strong style={{ color: 'var(--lux-black)' }}>{stoneColors[selectedColor]?.name}</strong>
                                    </span>
                                    <div className="jd-swatch-grid">
                                        {stoneColors.map((stone, idx) => (
                                            <button
                                                key={idx}
                                                className={`jd-swatch-btn${selectedColor === idx ? ' active' : ''}`}
                                                style={{ '--swatch-color': stone.hex }}
                                                title={stone.name}
                                                onClick={() => setSelectedColor(idx)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="jd-divider" />

                                {/* Cart actions */}
                                <div className="jd-cart-actions">
                                    <div className="jd-qty-selector">
                                        <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                                        <span>{qty}</span>
                                        <button onClick={() => setQty(qty + 1)}>+</button>
                                    </div>
                                    <button
                                        className={`jd-btn-primary${addedToCart ? ' success' : ''}`}
                                        onClick={inStock ? handleAddToCart : undefined}
                                        disabled={!inStock}
                                    >
                                        {!inStock ? 'OUT OF STOCK' : addedToCart ? '✓ ADDED TO BAG' : 'ADD TO BAG'}
                                    </button>
                                    <button className="jd-btn-wishlist" aria-label="Add to wishlist">
                                        <svg viewBox="0 0 24 24">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Accordions */}
                                <div className="jd-accordions">
                                    {[
                                        {
                                            key: 'details',
                                            label: 'Details',
                                            content: (
                                                <>
                                                    <p>{product.description || 'An exploration of colour and form, inspired by the pure beauty of hand-set stones and masterful craftsmanship.'}</p>
                                                    <p style={{ marginTop: '10px' }}><strong>Material:</strong> {product.material || '18K Yellow Gold'}</p>
                                                    <p><strong>Gemstone:</strong> {stoneColors[selectedColor]?.name}</p>
                                                    {product.category && <p><strong>Category:</strong> {product.category}</p>}
                                                    {product.sku && <p><strong>SKU:</strong> {product.sku}</p>}
                                                </>
                                            )
                                        },
                                        {
                                            key: 'shipping',
                                            label: 'Shipping & Care',
                                            content:
                                                <p>
                                                    <ul>
                                                        <li>Complimentary shipping across Germany</li>
                                                        <li>Worldwide shipping available at checkout</li>
                                                        <li>Presented in eco-conscious, fully paper-based packaging, ready for gifting</li>
                                                        <li>Carefully crafted to be treasured for years to come</li>
                                                        <li>Covered by our 365-day warranty against manufacturing defects</li>
                                                    </ul>
                                                </p>
                                        },
                                        {
                                            key: 'care',
                                            label: 'Care Instructions',
                                            content:
                                                <p>
                                                   <ul>
                                                    <li>Avoid contact with perfumes, lotions, and chemicals</li>
                                                    <li>Clean gently with a soft cloth after use</li>
                                                    <li>*Store in a dry pouch or box</li>
                                                    <li>Handle carefully to prevent scratches or damage</li>
                                                   </ul>
                                                </p>
                                        }
                                    ].map(({ key, label, content }) => (
                                        <div className="jd-accordion-item" key={key}>
                                            <button
                                                className="jd-acc-header"
                                                onClick={() => setOpenAccordion(openAccordion === key ? '' : key)}
                                            >
                                                {label.toUpperCase()}
                                                <span className="jd-acc-icon">{openAccordion === key ? '−' : '+'}</span>
                                            </button>
                                            {openAccordion === key && (
                                                <div className="jd-acc-content">{content}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="jd-related-section">
                        <h2 className="jd-related-title">You May Also Like</h2>
                        <div className="jd-related-grid">
                            {relatedProducts.map((rp) => (
                                <Link
                                    href={`/product-category/jewellery/${rp.slug}`}
                                    key={rp._id}
                                    className="jd-related-card"
                                >
                                    <div className="jd-related-img">
                                        <img
                                            src={getRelatedImgSrc(rp)}
                                            alt={rp.title || rp.name}
                                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                        />
                                    </div>
                                    <div>
                                        <p className="jd-related-name">{rp.title || rp.name}</p>
                                        <p className="jd-related-price">€{Number(getRelatedPrice(rp)).toLocaleString('en-IN')}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}