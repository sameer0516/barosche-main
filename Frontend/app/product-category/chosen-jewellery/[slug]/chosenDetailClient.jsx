'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import './chosenDetail.css';
import Reviews from '../../../../components/Home/Reviews/Reviews';

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

function parseDescription(text) {
    if (!text) return null;
    const parts = text.split('*').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return null;
    return (
        <div className="jd-desc-parsed">
            {parts.map((part, i) => {
                const dashIdx = part.indexOf('—');
                if (dashIdx > -1) {
                    const label = part.slice(0, dashIdx).trim();
                    const body = part.slice(dashIdx + 1).trim();
                    return (
                        <p key={i} className="jd-desc-point">
                            <span className="jd-desc-dot" aria-hidden="true">●</span>
                            <span>
                                <strong className="jd-desc-label">{label}</strong>
                                {' — '}
                                {body}
                            </span>
                        </p>
                    );
                }
                return (
                    <p key={i} className="jd-desc-plain">{part}</p>
                );
            })}
        </div>
    );
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

function RatingStars({ rating = 4.8, count = 124 }) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <div className="jd-rating-row">
            <div className="jd-stars">
                {[1, 2, 3, 4, 5].map(i => (
                    <svg
                        key={i}
                        className={`jd-star${i <= full ? ' filled' : half && i === full + 1 ? ' half' : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {half && i === full + 1 ? (
                            <>
                                <defs>
                                    <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                                        <stop offset="50%" stopColor="#c9a96e" />
                                        <stop offset="50%" stopColor="#d4cfc8" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                    fill={`url(#half-${i})`}
                                    stroke="#c9a96e"
                                    strokeWidth="1"
                                />
                            </>
                        ) : (
                            <path
                                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                fill={i <= full ? '#c9a96e' : '#e0dbd3'}
                                stroke={i <= full ? '#c9a96e' : '#d4cfc8'}
                                strokeWidth="1"
                            />
                        )}
                    </svg>
                ))}
            </div>
            <span className="jd-rating-score">{rating}</span>
            <span className="jd-rating-count">({count} reviews)</span>
        </div>
    );
}


function AttributePills({ label, icon, items, pillStyle }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="jd-attr-group">
            <p className="jd-attr-label">{icon} {label} :</p>
            <div className="jd-attr-pills">
                {items.map((item) => (
                    <span key={item} className="jd-attr-pill" style={pillStyle}>
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

function MetalTypeSelector({ metalTypes, selectedMetal, onSelect }) {
    if (!metalTypes || metalTypes.length === 0) return null;

    const options = ['All', ...metalTypes];

    const getMetalStyle = (metal, isActive) => {
        if (!isActive) {
            return {
                background: 'transparent',
                color: 'var(--lux-black, #1a1a1a)',
                border: '1.5px solid #d4cfc8',
            };
        }

        switch (metal) {
            case 'Gold':
                return {
                    background: 'linear-gradient(135deg, #c9a96e 0%, #e8c97a 50%, #b8873a 100%)',
                    color: '#fff',
                    border: '1.5px solid #b8873a',
                    boxShadow: '0 2px 8px rgba(201,169,110,0.45)',
                };
            case 'Silver':
                return {
                    background: 'linear-gradient(135deg, #c9a96e 0%, #e8c97a 50%, #b8873a 100%)',
                    color: '#fff',
                    border: '1.5px solid #b8873a',
                    boxShadow: '0 2px 8px rgba(201,169,110,0.45)',
                };
            default: // 'All'
                return {
                    background: 'linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%)',
                    color: '#fff',
                    border: '1.5px solid #1a1a1a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                };
        }
    };

    return (
        <div className="jd-metal-section">
            <p className="jd-metal-label">
                Metal Type: <strong style={{ color: 'var(--lux-black)' }}>{selectedMetal}</strong>
            </p>
            <div className="jd-metal-options">
                {options.map((metal) => {
                    const isActive = selectedMetal === metal;
                    return (
                        <button
                            key={metal}
                            type="button"
                            className={`jd-metal-btn${isActive ? ' active' : ''}`}
                            style={{
                                ...getMetalStyle(metal, isActive),
                                transition: 'all 0.25s ease',
                                cursor: 'pointer',
                            }}
                            onClick={() => onSelect(metal)}
                            aria-pressed={isActive}
                        >
                            <span className="jd-metal-btn-text">{metal}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function MobileSlider({ images, getImgSrc, productName, isSale, selectedImageIndex, setSelectedImageIndex }) {
    const sliderRef = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const autoPlayRef = useRef(null);

    const goToSlide = useCallback((idx) => {
        const clamped = Math.max(0, Math.min(idx, images.length - 1));
        setSelectedImageIndex(clamped);
    }, [images.length, setSelectedImageIndex]);

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

            <div className="jd-slider-counter">{selectedImageIndex + 1} / {images.length}</div>
        </div>
    );
}

function DeliverySection() {
    return (
        <div className="jd-delivery-section">
            <div className="jd-delivery-item">
                <div className="jd-delivery-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" rx="1" />
                        <path d="M16 8h4l3 5v3h-7V8z" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                </div>
                <div className="jd-delivery-info">
                    <span className="jd-delivery-title">Standard Delivery</span>
                    <span className="jd-delivery-sub">Your customized product | 22 – 23 Jun</span>
                </div>
                <span className="jd-delivery-price jd-delivery-free">Free</span>
            </div>

            <div className="jd-delivery-item">
                <div className="jd-delivery-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <div className="jd-delivery-info">
                    <span className="jd-delivery-title">Express Delivery</span>
                    <span className="jd-delivery-sub">Browse ready-to-ship variants | 15 – 16 Jun</span>
                </div>
                <div className="jd-delivery-right">
                    <span className="jd-delivery-price">+€24.99</span>
                    <span className="jd-delivery-variants">40 variants</span>
                </div>
            </div>
        </div>
    );
}

function InstallmentSection({ price }) {
    const klarnaInstallment = (price / 3).toFixed(2);
    const paypalInstallment = (price / 4).toFixed(2);

    return (
        <div className="installment-container">
            <p className="promo-text">
                This price is up to <span className="highlight-text">49% lower</span> in comparison to traditional jewellery shops.
            </p>
            <div className="cards-wrapper">
                <div className="payment-card">
                    <div className="logo-box klarna-bg">
                        <span className="klarna-text">Klarna.</span>
                    </div>
                    <div className="info-box">
                        <p>
                            In 3 interest-free installments from <strong>€{klarnaInstallment}</strong> or flexible payments in up to 12 installments
                        </p>
                    </div>
                </div>
                <div className="payment-card">
                    <div className="logo-box">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                            alt="PayPal"
                            className="paypal-logo"
                        />
                    </div>
                    <div className="info-box">
                        <p>
                            In 4 interest-free installments from <strong>€{paypalInstallment}</strong> or flexible payments in up to 24 installments
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ChosenDetailClient({ slug }) {
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
    const [selectedMetal, setSelectedMetal] = useState('All');

    const galleryRef = useRef(null);
    const infoRef = useRef(null);
    const wrapperRef = useRef(null);

    const stoneColors = [
        { name: 'Blue Topaz', hex: '#7bc4e1' },
        { name: 'Amethyst', hex: '#8a4f7d' },
        { name: 'Citrine', hex: '#e8b84b' },
        { name: 'Peridot', hex: '#a3be6b' },
        { name: 'Prasiolite', hex: '#c5d0bc' },
        { name: 'Garnet', hex: '#7a2021' },
    ];
    const [selectedColor, setSelectedColor] = useState(0);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

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

                    // ── Default: "All" — dono metal types ke variants dikhenge ──
                    setSelectedMetal('All');

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

    useEffect(() => {
        setSelectedImageIndex(0);
        if (galleryRef.current) galleryRef.current.scrollTop = 0;
        setScrollState('locked');
    }, [selectedVariantIndex]);

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

    // helper: check if a variant belongs to a given metal
    const variantHasMetal = (v, metal) => {
        if (Array.isArray(v.metalType)) return v.metalType.includes(metal);
        if (typeof v.metalType === 'string') return v.metalType === metal;
        return false;
    };

    const handleMetalSelect = useCallback((metal) => {
        setSelectedMetal(metal);
        if (!product?.variants) return;

        if (metal === 'All') return;

        const currentVariant = product.variants[selectedVariantIndex];
        if (currentVariant && variantHasMetal(currentVariant, metal)) {
            return;
        }

        const matchIdx = product.variants.findIndex(v => variantHasMetal(v, metal));

        if (matchIdx !== -1) {
            setSelectedVariantIndex(matchIdx);
            setSelectedImageIndex(0);
        }
    }, [product, selectedVariantIndex]);

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
            title: activeVariant.title || product.title || product.name,
            newPrice: activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0,
            images: varImgs,
            img: varImgs[0] || '',
            metal: selectedMetal !== 'All' ? selectedMetal : (activeVariant.metal || null),
            stone: stoneColors[selectedColor] || null,
            qty,
            slug: product.slug,
            category: product.category,
        };

        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { item: cartItem } }));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 400);
    }, [product, selectedVariantIndex, qty, selectedColor, stoneColors, selectedMetal]);

    if (loading) return <DetailSkeleton />;
    if (error || !product) {
        return (
            <div className="jd-not-found">
                <h2>{error || 'Product Not Found'}</h2>
                <Link href="/product-category/chosen-jewellery" className="jd-back-link">← Return to Collection</Link>
            </div>
        );
    }

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

    const displayTitle       = activeVariant.title       || product.title || product.name;
    const displayDescription = activeVariant.description || product.description || '';
    const displayMaterials   = (activeVariant.materials && activeVariant.materials.length > 0)
        ? activeVariant.materials
        : (product.materials || []);
    const displayGemstones   = (activeVariant.gemstones && activeVariant.gemstones.length > 0)
        ? activeVariant.gemstones
        : (product.gemstones || []);

    const allMetalTypes = [...new Set(
        (product.variants || []).flatMap(v =>
            Array.isArray(v.metalType) ? v.metalType : v.metalType ? [v.metalType] : []
        )
    )].filter(Boolean);

    const filteredVariants = (product.variants || [])
        .map((v, idx) => ({ ...v, _origIdx: idx }))
        .filter(v => selectedMetal === 'All' || variantHasMetal(v, selectedMetal));

    const getRelatedImgSrc = (rp) => {
        const rv = getFirstVariant(rp);
        const img = (rv.images && rv.images.length > 0) ? rv.images[0] : rp.img || '';
        return getImgSrc(img);
    };
    const getRelatedPrice = (rp) => {
        const rv = getFirstVariant(rp);
        return rv.newPrice ?? rp.newPrice ?? rp.price ?? 0;
    };

    const imageRows = [];
    for (let i = 0; i < images.length; i += 2) {
        imageRows.push(images.slice(i, i + 2));
    }

    const isUnlocked = scrollState === 'unlocked';

    const accordionItems = [
        {
            key: 'details',
            label: 'Product Description',
            content: (
                <>
                    {parseDescription(displayDescription) || (
                        <p>An exploration of colour and form, inspired by the pure beauty of hand-set stones and masterful craftsmanship.</p>
                    )}
                    <div className="jd-desc-meta">
                        {displayMaterials.length > 0 ? (
                            <AttributePills
                                label="Material"
                                icon="⚙️"
                                items={displayMaterials}
                            />
                        ) : product.material ? (
                            <p><strong>Material:</strong> {product.material}</p>
                        ) : null}

                        {displayGemstones.length > 0 ? (
                            <AttributePills
                                label="Gemstone"
                                icon="💎"
                                items={displayGemstones}
                            />
                        ) : (
                            <p><strong>Gemstone:</strong> {stoneColors[selectedColor]?.name}</p>
                        )}
                    </div>
                </>
            )
        },
        {
            key: 'shipping',
            label: 'Shipping Information',
            content: (
                <ul className="jd-bullet-list">
                    <li>Complimentary shipping across Germany</li>
                    <li>Worldwide shipping available at checkout</li>
                    <li>Presented in eco-conscious, fully paper-based packaging, ready for gifting</li>
                    <li>Carefully crafted to be treasured for years to come</li>
                    <li>Covered by our 365-day warranty against manufacturing defects</li>
                </ul>
            )
        },
        {
            key: 'care',
            label: 'Care Instructions',
            content: (
                <ul className="jd-bullet-list">
                    <li>Avoid contact with perfumes, lotions, and chemicals</li>
                    <li>Clean gently with a soft cloth after use</li>
                    <li>Store in a dry pouch or box away from sunlight</li>
                    <li>Handle carefully to prevent scratches or damage</li>
                </ul>
            )
        }
    ];

    return (
        <>
            <div className="jd-page">
                <div className={`jd-max-container${isMobile ? ' jd-mobile-page' : ''}`}>

                    {/* Breadcrumb */}
                    <nav className="jd-breadcrumb">
                        <Link href="/">Home</Link>
                        <span className="jd-bc-sep">/</span>
                        <Link href="/product-category/chosen-jewellery">Chosen Jewellery</Link>
                        <span className="jd-bc-sep">/</span>
                        <span>{product.category || 'Collection'}</span>
                        <span className="jd-bc-sep">/</span>
                        <span>{displayTitle}</span>
                    </nav>

                    {/* ══ MOBILE LAYOUT ══ */}
                    {isMobile ? (
                        <div className="jd-mobile-layout">

                            <MobileSlider
                                images={images}
                                getImgSrc={getImgSrc}
                                productName={displayTitle}
                                isSale={isSale}
                                selectedImageIndex={selectedImageIndex}
                                setSelectedImageIndex={setSelectedImageIndex}
                            />

                            <div className="jd-mobile-info">
                                <span className="jd-brand-tag">Barosche Fine Jewellery</span>
                                <RatingStars rating={4.8} count={124} />

                                <h1 className="jd-product-title">{displayTitle}</h1>

                                <div className="jd-pricing-row">
                                    {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                        <span className="jd-old-price">€{Number(oldPrice).toLocaleString('en-IN')}</span>
                                    )}
                                    <span className="jd-new-price">€{Number(newPrice).toLocaleString('en-IN')}</span>
                                    {isSale && <span className="jd-sale-tag">VAT included</span>}
                                </div>

                                {/* ── METAL SELECTOR — MOBILE ── */}
                                {allMetalTypes.length > 0 && (
                                    <MetalTypeSelector
                                        metalTypes={allMetalTypes}
                                        selectedMetal={selectedMetal}
                                        onSelect={handleMetalSelect}
                                    />
                                )}

                                {/* ── VARIANT GRID (filtered by selectedMetal) ── */}
                                {product.variants && product.variants.length > 1 && (
                                    <div className="jd-variant-section">
                                        <span className="jd-variant-label">
                                            Style: <strong style={{ color: 'var(--lux-black)' }}>
                                                {activeVariant.name || `Option ${selectedVariantIndex + 1}`}
                                            </strong>
                                        </span>
                                        <div className="jd-variant-grid">
                                            {filteredVariants.map((v) => {
                                                const idx = v._origIdx;
                                                const vImg = v.images && v.images.length > 0 ? v.images[0] : null;
                                                return (
                                                    <button
                                                        key={idx}
                                                        className={`jd-variant-card-btn${selectedVariantIndex === idx ? ' active' : ''}`}
                                                        onClick={() => {
                                                            setSelectedVariantIndex(idx);
                                                            setSelectedImageIndex(0);
                                                        }}
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

                                {/* ── DYNAMIC INSTALLMENT (Mobile) ── */}
                                <InstallmentSection price={newPrice} />

                                {/* ── DELIVERY SECTION (Mobile) ── */}
                                <DeliverySection />

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

                                <div className="jd-accordions">
                                    {accordionItems.map(({ key, label, content }) => (
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

                                <div style={{ height: '90px' }} />
                            </div>

                            {/* ── FIXED BOTTOM CTA ── */}
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
                        /* ══ DESKTOP LAYOUT ══ */
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
                                                        <img
                                                            src={getImgSrc(img)}
                                                            alt={`${displayTitle} view ${globalIdx + 1}`}
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

                                    <RatingStars rating={4.8} count={124} />

                                    <h1 className="jd-product-title">{displayTitle}</h1>

                                    <div className="jd-pricing-row">
                                        {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                            <span className="jd-old-price">€{Number(oldPrice).toLocaleString('en-IN')}</span>
                                        )}
                                        <span className="jd-new-price">€{Number(newPrice).toLocaleString('en-IN')}</span>
                                        {isSale && <span className="">VAT included</span>}
                                    </div>

                                    {/* ── METAL SELECTOR — DESKTOP ── */}
                                    {allMetalTypes.length > 0 && (
                                        <MetalTypeSelector
                                            metalTypes={allMetalTypes}
                                            selectedMetal={selectedMetal}
                                            onSelect={handleMetalSelect}
                                        />
                                    )}

                                    {/* ── VARIANT GRID (filtered by selectedMetal) ── */}
                                    {product.variants && product.variants.length > 1 && (
                                        <div className="jd-variant-section">
                                            <span className="jd-variant-label">
                                                Style: <strong style={{ color: 'var(--lux-black)' }}>
                                                    {activeVariant.name || `Option ${selectedVariantIndex + 1}`}
                                                </strong>
                                            </span>
                                            <div className="jd-variant-grid">
                                                {filteredVariants.map((v) => {
                                                    const idx = v._origIdx;
                                                    const vImg = v.images && v.images.length > 0 ? v.images[0] : null;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            className={`jd-variant-card-btn${selectedVariantIndex === idx ? ' active' : ''}`}
                                                            onClick={() => {
                                                                setSelectedVariantIndex(idx);
                                                                setSelectedImageIndex(0);
                                                            }}
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

                                    {/* ── DYNAMIC INSTALLMENT (Desktop) ── */}
                                    <InstallmentSection price={newPrice} />

                                    {/* ── DELIVERY SECTION (Desktop) ── */}
                                    <DeliverySection />

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

                                    <div className="jd-accordions">
                                        {accordionItems.map(({ key, label, content }) => (
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
                </div>

                {/* ══ RELATED PRODUCTS SECTION ══ */}
                {relatedProducts.length > 0 && (
                    <section className="jd-related-section">
                        <h2 className="jd-related-title">You May Also Like</h2>
                        <div className="jd-related-grid">
                            {relatedProducts.map((rp) => (
                                <Link
                                    key={rp._id || rp.slug}
                                    href={`/product-category/chosen-jewellery/${rp.slug}`}
                                    className="jd-related-card"
                                >
                                    <div className="jd-related-img">
                                        <img
                                            src={getRelatedImgSrc(rp)}
                                            alt={rp.title || rp.name}
                                            loading="lazy"
                                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                        />
                                        {(getFirstVariant(rp).isSale || rp.isSale) && (
                                            <span className="jd-related-sale-badge">Sale</span>
                                        )}
                                    </div>
                                    <div className="jd-related-info">
                                        <p className="jd-related-name">{rp.title || rp.name}</p>
                                        <div className="jd-related-pricing">
                                            {(() => {
                                                const rv = getFirstVariant(rp);
                                                const op = rv.oldPrice ?? rp.oldPrice ?? null;
                                                const np = getRelatedPrice(rp);
                                                return (
                                                    <>
                                                        {op && Number(op) > Number(np) && (
                                                            <del className="jd-related-old-price">
                                                                €{Number(op).toLocaleString('en-IN')}
                                                           </del>
                                                        )}
                                                        <span className="jd-related-price">€{Number(np).toLocaleString('en-IN')}</span>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
            <Reviews />
        </>
    );
}