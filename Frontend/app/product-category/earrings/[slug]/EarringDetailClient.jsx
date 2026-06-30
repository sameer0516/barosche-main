'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import './earringDetail.css';
import Reviews from '../../../../components/Home/Reviews/Reviews';
import { useWishlist } from '../../../context/WishlistContext';

const API_BASE = "https://api.barosche.com";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

// ─────────────────────────────────────────────────────────
//  CURRENCY CONFIG — Rings.js pattern
// ─────────────────────────────────────────────────────────
const CURRENCY_MAP = {
    US: { code: 'USD', symbol: '$',   rate: 1.08 },
    GB: { code: 'GBP', symbol: '£',   rate: 0.85 },
    IN: { code: 'INR', symbol: '₹',   rate: 90.5 },
    AE: { code: 'AED', symbol: 'AED', rate: 3.97 },
    AU: { code: 'AUD', symbol: 'A$',  rate: 1.65 },
    CA: { code: 'CAD', symbol: 'C$',  rate: 1.47 },
    SG: { code: 'SGD', symbol: 'S$',  rate: 1.45 },
    JP: { code: 'JPY', symbol: '¥',   rate: 162  },
    CH: { code: 'CHF', symbol: 'CHF', rate: 0.97 },
    default: { code: 'EUR', symbol: '€', rate: 1 },
};

function formatPrice(eurPrice, currency) {
    if (!eurPrice && eurPrice !== 0) return null;
    if (!currency) return null;
    const converted = Math.round(Number(eurPrice) * currency.rate);
    if (currency.code === 'JPY') return `${currency.symbol}${converted.toLocaleString()}`;
    if (currency.code === 'INR') return `${currency.symbol}${converted.toLocaleString('en-IN')}`;
    return `${currency.symbol}${converted.toLocaleString()}`;
}

// ─────────────────────────────────────────────────────────
//  ALL TRANSLATABLE STRINGS
// ─────────────────────────────────────────────────────────
const DEFAULT_STRINGS = {
    // Breadcrumb
    home:               "Home",
    jewellery:          "Jewellery",
    earrings:           "Earrings",
    // Rating
    reviews:            "reviews",
    // Brand
    brandTag:           "Barosche Fine Jewellery",
    // Price / Sale
    vatIncluded:        "VAT included",
    // Metal selector
    metalTypeLabel:     "Metal Type:",
    all:                "All",
    // Variant
    styleLabel:         "Style:",
    // Installment
    promoText:          "This price is up to",
    promoHighlight:     "49% lower",
    promoSuffix:        "in comparison to traditional jewellery shops.",
    klarnaDesc:         "In 3 interest-free installments from",
    klarnaOr:           "or flexible payments in up to 12 installments",
    paypalDesc:         "In 4 interest-free installments from",
    paypalOr:           "or flexible payments in up to 24 installments",
    // Cart
    qty:                "Qty:",
    outOfStock:         "OUT OF STOCK",
    addedToBag:         "✓ ADDED TO BAG",
    addToBag:           "ADD TO BAG",
    addToWishlist:      "Add to wishlist",
    removeFromWishlist: "Remove from wishlist",
    // Delivery
    standardDelivery:   "Standard Delivery",
    standardDeliverySub:"Your customized product | 22 – 23 Jun",
    free:               "Free",
    expressDelivery:    "Express Delivery",
    expressDeliverySub: "Browse ready-to-ship variants | 15 – 16 Jun",
    expressVariants:    "40 variants",
    // Accordion labels
    productDescription: "Product Description",
    shippingInfo:       "Shipping Information",
    careInstructions:   "Care Instructions",
    // Shipping bullets
    ship1:              "Complimentary shipping across Germany",
    ship2:              "Worldwide shipping available at checkout",
    ship3:              "Presented in eco-conscious, fully paper-based packaging, ready for gifting",
    ship4:              "Carefully crafted to be treasured for years to come",
    ship5:              "Covered by our 365-day warranty against manufacturing defects",
    // Care bullets
    care1:              "Avoid contact with perfumes, lotions, and chemicals",
    care2:              "Clean gently with a soft cloth after use",
    care3:              "Store in a dry pouch or box away from sunlight",
    care4:              "Handle carefully to prevent scratches or damage",
    // Description fallback
    descFallback:       "An exploration of colour and form, inspired by the pure beauty of hand-set stones and masterful craftsmanship.",
    // Attributes
    attrMaterial:       "Material",
    attrGemstone:       "Gemstone",
    // Related
    youMayAlsoLike:     "You May Also Like",
    // Error
    productNotFound:    "Product Not Found",
    returnToCollection: "← Return to Collection",
};

function flattenStrings(obj) {
    return Object.values(obj);
}

function rebuildStrings(keys, translations) {
    const result = {};
    keys.forEach((key, i) => {
        result[key] = translations[i] || DEFAULT_STRINGS[key];
    });
    return result;
}

// ─────────────────────────────────────────────────────────
//  TRANSLATION + CURRENCY HOOK — Rings.js pattern
// ─────────────────────────────────────────────────────────
function useTranslationAndCurrency() {
    const [strings,  setStrings]  = useState(DEFAULT_STRINGS);
    const [currency, setCurrency] = useState(CURRENCY_MAP.default);
    const [status,   setStatus]   = useState("idle");

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                setStatus("loading");

                const detectRes  = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
                const detectData = await detectRes.json();
                if (!detectData.success) throw new Error("Language detection failed");

                const { languageCode, countryCode } = detectData;

                if (!cancelled && countryCode && CURRENCY_MAP[countryCode]) {
                    setCurrency(CURRENCY_MAP[countryCode]);
                }

                if (languageCode === "en") {
                    if (!cancelled) setStatus("done");
                    return;
                }

                const keys       = Object.keys(DEFAULT_STRINGS);
                const allStrings = flattenStrings(DEFAULT_STRINGS);

                const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
                    method:  "POST",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify({
                        texts:          allStrings,
                        targetLanguage: languageCode,
                        sourceLanguage: "en",
                    }),
                });

                const translateData = await translateRes.json();
                if (!translateData.success) throw new Error("Translation failed");

                if (!cancelled) {
                    setStrings(rebuildStrings(keys, translateData.translations));
                    setStatus("done");
                }
            } catch (err) {
                console.error("EarringDetail translation error:", err.message);
                if (!cancelled) setStatus("error");
            }
        }

        run();
        return () => { cancelled = true; };
    }, []);

    return { strings, currency, status };
}

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
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
                return <p key={i} className="jd-desc-plain">{part}</p>;
            })}
        </div>
    );
}

function AttributePills({ label, icon, items }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="jd-attr-group">
            <p className="jd-attr-label">{icon} {label}</p>
            <div className="jd-attr-pills">
                {items.map((item) => (
                    <span key={item} className="jd-attr-pill">{item}</span>
                ))}
            </div>
        </div>
    );
}

function MetalTypeSelector({ metalTypes, selectedMetal, onSelect, T }) {
    if (!metalTypes || metalTypes.length === 0) return null;

    const options = [T.all, ...metalTypes];

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
            case 'Silver':
                return {
                    background: 'linear-gradient(135deg, #c9a96e 0%, #e8c97a 50%, #b8873a 100%)',
                    color: '#fff',
                    border: '1.5px solid #b8873a',
                    boxShadow: '0 2px 8px rgba(201,169,110,0.45)',
                };
            default:
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
                {T.metalTypeLabel} <strong style={{ color: 'var(--lux-black)' }}>{selectedMetal}</strong>
            </p>
            <div className="jd-metal-options">
                {options.map((metal) => {
                    const isActive = selectedMetal === metal;
                    return (
                        <button
                            key={metal}
                            type="button"
                            className={`jd-metal-btn${isActive ? ' active' : ''}`}
                            style={{ ...getMetalStyle(metal, isActive), transition: 'all 0.25s ease', cursor: 'pointer' }}
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

function RatingStars({ rating = 4.8, count = 124, T }) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
        <div className="jd-rating-row">
            <div className="jd-stars">
                {[1, 2, 3, 4, 5].map(i => (
                    <svg key={i}
                        className={`jd-star${i <= full ? ' filled' : half && i === full + 1 ? ' half' : ''}`}
                        viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {half && i === full + 1 ? (
                            <>
                                <defs>
                                    <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                                        <stop offset="50%" stopColor="#c9a96e" />
                                        <stop offset="50%" stopColor="#d4cfc8" />
                                    </linearGradient>
                                </defs>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                    fill={`url(#half-${i})`} stroke="#c9a96e" strokeWidth="1" />
                            </>
                        ) : (
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                fill={i <= full ? '#c9a96e' : '#e0dbd3'}
                                stroke={i <= full ? '#c9a96e' : '#d4cfc8'} strokeWidth="1" />
                        )}
                    </svg>
                ))}
            </div>
            <span className="jd-rating-score">{rating}</span>
            <span className="jd-rating-count">({count} {T.reviews})</span>
        </div>
    );
}

function MobileSlider({ images, getImgSrc, productName, selectedImageIndex, setSelectedImageIndex, onImageClick }) {
    const sliderRef   = useRef(null);
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
            <div className="jd-mobile-slider-track"
                style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
                onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {images.map((img, idx) => (
                    <div className="jd-mobile-slide" key={idx}>
                        <img src={getImgSrc(img)} alt={`${productName} view ${idx + 1}`}
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                            onClick={() => onImageClick && onImageClick(idx)}
                            style={{ cursor: 'zoom-in' }} />
                    </div>
                ))}
            </div>
            {images.length > 1 && (
                <div className="jd-slider-dots">
                    {images.map((_, idx) => (
                        <button key={idx}
                            className={`jd-slider-dot${selectedImageIndex === idx ? ' active' : ''}`}
                            onClick={() => { goToSlide(idx); resetAutoPlay(); }}
                            aria-label={`Go to image ${idx + 1}`} />
                    ))}
                </div>
            )}
            <div className="jd-slider-counter">{selectedImageIndex + 1} / {images.length}</div>
        </div>
    );
}

function Lightbox({ images, getImgSrc, productName, startIndex, onClose }) {
    const [index, setIndex] = useState(startIndex || 0);

    useEffect(() => {
        setIndex(startIndex || 0);
    }, [startIndex]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
            if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
        };
        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [images.length, onClose]);

    if (!images || images.length === 0) return null;

    const goPrev = (e) => { e.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length); };
    const goNext = (e) => { e.stopPropagation(); setIndex((i) => (i + 1) % images.length); };

    return (
        <div
            className="jd-lightbox-overlay"
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <button
                className="jd-lightbox-close"
                onClick={onClose}
                aria-label="Close"
                style={{
                    position: 'absolute', top: 20, right: 20, zIndex: 2,
                    background: 'transparent', border: 'none', color: '#fff',
                    cursor: 'pointer', padding: 8,
                }}
            >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="5" y1="5" x2="19" y2="19" />
                    <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
            </button>

            <div
                className="jd-lightbox-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', maxWidth: '90vw', maxHeight: '88vh',
                }}
            >
                {images.length > 1 && (
                    <button
                        className="jd-lightbox-nav jd-lightbox-prev"
                        onClick={goPrev}
                        aria-label="Previous image"
                        style={{
                            position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%', width: 40, height: 40, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                )}

                <img
                    src={getImgSrc(images[index])}
                    alt={`${productName} view ${index + 1}`}
                    className="jd-lightbox-img"
                    onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    style={{ maxWidth: '100%', maxHeight: '88vh', objectFit: 'contain', borderRadius: 4 }}
                />

                {images.length > 1 && (
                    <button
                        className="jd-lightbox-nav jd-lightbox-next"
                        onClick={goNext}
                        aria-label="Next image"
                        style={{
                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%', width: 40, height: 40, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                )}
            </div>

            {images.length > 1 && (
                <div
                    className="jd-lightbox-counter"
                    style={{
                        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                        color: '#fff', fontSize: 14, letterSpacing: 1, opacity: 0.85,
                    }}
                >
                    {index + 1} / {images.length}
                </div>
            )}
        </div>
    );
}

function DeliverySection({ T, currency }) {
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
                    <span className="jd-delivery-title">{T.standardDelivery}</span>
                    <span className="jd-delivery-sub">{T.standardDeliverySub}</span>
                </div>
                <span className="jd-delivery-price jd-delivery-free">{T.free}</span>
            </div>
            <div className="jd-delivery-item">
                <div className="jd-delivery-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <div className="jd-delivery-info">
                    <span className="jd-delivery-title">{T.expressDelivery}</span>
                    <span className="jd-delivery-sub">{T.expressDeliverySub}</span>
                </div>
                <div className="jd-delivery-right">
                    <span className="jd-delivery-price">{formatPrice(24.99, currency)}</span>
                    <span className="jd-delivery-variants">{T.expressVariants}</span>
                </div>
            </div>
        </div>
    );
}

function InstallmentSection({ price, T, currency }) {
    const klarnaInstallment = formatPrice(price / 3, currency) || `€${(price / 3).toFixed(2)}`;
    const paypalInstallment = formatPrice(price / 4, currency) || `€${(price / 4).toFixed(2)}`;
    return (
        <div className="installment-container">
            <p className="promo-text">
                {T.promoText} <span className="highlight-text">{T.promoHighlight}</span> {T.promoSuffix}
            </p>
            <div className="cards-wrapper">
                <div className="payment-card">
                    <div className="logo-box klarna-bg">
                        <span className="klarna-text">Klarna.</span>
                    </div>
                    <div className="info-box">
                        <p>{T.klarnaDesc} <strong>{klarnaInstallment}</strong> {T.klarnaOr}</p>
                    </div>
                </div>
                <div className="payment-card">
                    <div className="logo-box">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="paypal-logo" />
                    </div>
                    <div className="info-box">
                        <p>{T.paypalDesc} <strong>{paypalInstallment}</strong> {T.paypalOr}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export default function EarringDetailClient({ slug }) {

    // ── Translation + Currency ──
    const { strings: T, currency, status: tStatus } = useTranslationAndCurrency();

    const [product,              setProduct]              = useState(null);
    const [relatedProducts,      setRelatedProducts]      = useState([]);
    const [loading,              setLoading]              = useState(true);
    const [error,                setError]                = useState(null);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [qty,                  setQty]                  = useState(1);
    const [addedToCart,          setAddedToCart]          = useState(false);
    const [openAccordion,        setOpenAccordion]        = useState('details');
    const [selectedImageIndex,   setSelectedImageIndex]   = useState(0);
    const [scrollState,          setScrollState]          = useState('locked');
    const [isMobile,             setIsMobile]             = useState(false);
    const [selectedMetal,        setSelectedMetal]        = useState('All');
    const [lightboxOpen,         setLightboxOpen]         = useState(false);
    const [lightboxIndex,        setLightboxIndex]        = useState(0);

    const { toggleWishlist, isInWishlist } = useWishlist();
    const galleryRef = useRef(null);
    const infoRef    = useRef(null);
    const wrapperRef = useRef(null);

    // ── Mobile check ──
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
                    const p = data.product;
                    setProduct(p);
                    setSelectedVariantIndex(0);
                    setSelectedImageIndex(0);
                    setSelectedMetal(T.all || 'All');

                    if (p?.category) {
                        try {
                            const relRes = await fetch(`${API_BASE}/api/products?category=${encodeURIComponent(p.category)}`);
                            if (relRes.ok) {
                                const relData = await relRes.json();
                                if (relData.success) {
                                    setRelatedProducts((relData.products || []).filter(rp => rp.slug !== slug).slice(0, 5));
                                }
                            }
                        } catch (e) { console.error('Related products error:', e); }
                    }
                } else throw new Error(data.message || 'Product not found');
            } catch (err) { setError(err.message); }
            finally { setLoading(false); }
        };
        fetchProduct();
    }, [slug]);

    // ── Reset gallery scroll on variant change ──
    useEffect(() => {
        setSelectedImageIndex(0);
        if (galleryRef.current) galleryRef.current.scrollTop = 0;
        setScrollState('locked');
    }, [selectedVariantIndex]);

    // ── Desktop wheel scroll logic ──
    useEffect(() => {
        if (isMobile) return;
        const gallery = galleryRef.current;
        const info    = infoRef.current;
        const wrapper = wrapperRef.current;
        if (!gallery || !info || !wrapper) return;
        const isGalleryAtBottom = () => {
            const { scrollTop, scrollHeight, clientHeight } = gallery;
            return scrollHeight - scrollTop - clientHeight < 8;
        };
        const handleWheel = (e) => {
            if (scrollState === 'unlocked') return;
            const wrapperRect = wrapper.getBoundingClientRect();
            const isOnGallerySide = e.clientX < wrapperRect.left + wrapperRect.width / 2;
            e.preventDefault();
            if (isOnGallerySide) {
                gallery.scrollTop += e.deltaY;
                setTimeout(() => { if (isGalleryAtBottom()) setScrollState('unlocked'); }, 50);
            } else {
                info.scrollTop += e.deltaY;
            }
        };
        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        return () => wrapper.removeEventListener('wheel', handleWheel);
    }, [scrollState, isMobile]);

    // ── Desktop touch scroll logic ──
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

    const variantHasMetal = (v, metal) => {
        if (Array.isArray(v.metalType)) return v.metalType.includes(metal);
        if (typeof v.metalType === 'string') return v.metalType === metal;
        return false;
    };

    const getWishlistItem = useCallback(() => {
        const activeVariant = (product.variants && product.variants.length > 0)
            ? product.variants[selectedVariantIndex] || product.variants[0]
            : getFirstVariant(product);

        const varImgs = activeVariant.images?.length > 0
            ? activeVariant.images
            : Array.isArray(product.images) && product.images.length > 0
                ? product.images
                : [product.img].filter(Boolean);

        return {
            _id:       product._id,
            variantId: activeVariant._id || selectedVariantIndex,
            title:     activeVariant.title || product.title || product.name,
            newPrice:  activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0,
            oldPrice:  activeVariant.oldPrice ?? product.oldPrice ?? null,
            images:    varImgs,
            img:       varImgs[0] || '',
            metal:     selectedMetal !== (T.all || 'All') ? selectedMetal : (activeVariant.metal || null),
            slug:      product.slug,
            category:  product.category,
            isSale:    activeVariant.isSale ?? product.isSale ?? false,
        };
    }, [product, selectedVariantIndex, selectedMetal, T.all]);

    const wishlisted = product
        ? isInWishlist(product._id, (product.variants?.[selectedVariantIndex])?._id || selectedVariantIndex)
        : false;

    const handleMetalSelect = useCallback((metal) => {
        setSelectedMetal(metal);
        if (!product?.variants) return;
        if (metal === (T.all || 'All')) return;

        const currentVariant = product.variants[selectedVariantIndex];
        if (currentVariant && variantHasMetal(currentVariant, metal)) return;

        const matchIdx = product.variants.findIndex(v => variantHasMetal(v, metal));
        if (matchIdx !== -1) {
            setSelectedVariantIndex(matchIdx);
            setSelectedImageIndex(0);
        }
    }, [product, selectedVariantIndex, T.all]);

    const handleAddToCart = useCallback(() => {
        if (!product) return;
        const activeVariant = product.variants?.[selectedVariantIndex] || getFirstVariant(product);
        const varImgs = activeVariant.images?.length > 0
            ? activeVariant.images
            : product.images?.length > 0 ? product.images : [product.img].filter(Boolean);

        const cartItem = {
            _id:       product._id,
            variantId: activeVariant._id || selectedVariantIndex,
            title:     activeVariant.title || product.title || product.name,
            newPrice:  activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0,
            images:    varImgs,
            img:       varImgs[0] || '',
            metal:     selectedMetal !== (T.all || 'All') ? selectedMetal : null,
            qty,
            slug:      product.slug,
            category:  product.category,
        };
        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { item: cartItem } }));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 400);
    }, [product, selectedVariantIndex, qty, selectedMetal, T.all]);

    if (loading) return <DetailSkeleton />;
    if (error || !product) {
        return (
            <div className="jd-not-found">
                <h2>{error || T.productNotFound}</h2>
                <Link href="/product-category/jewellery" className="jd-back-link">{T.returnToCollection}</Link>
            </div>
        );
    }

    const activeVariant      = product.variants?.[selectedVariantIndex] || getFirstVariant(product);
    const images             = activeVariant.images?.length > 0 ? activeVariant.images : product.images?.length > 0 ? product.images : [product.img].filter(Boolean);
    const oldPrice           = activeVariant.oldPrice ?? product.oldPrice ?? null;
    const newPrice           = activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0;
    const isSale             = activeVariant.isSale   ?? product.isSale   ?? false;
    const inStock            = activeVariant.inStock  ?? product.inStock  ?? true;
    const displayTitle       = activeVariant.title    || product.title || product.name;
    const displayDescription = activeVariant.description || product.description || '';
    const displayMaterials   = activeVariant.materials?.length > 0 ? activeVariant.materials : (product.materials || []);
    const displayGemstones   = activeVariant.gemstones?.length > 0 ? activeVariant.gemstones : (product.gemstones || []);

    const allMetalTypes = [...new Set(
        (product.variants || []).flatMap(v =>
            Array.isArray(v.metalType) ? v.metalType : v.metalType ? [v.metalType] : []
        )
    )].filter(Boolean);

    const filteredVariants = (product.variants || [])
        .map((v, idx) => ({ ...v, _origIdx: idx }))
        .filter(v => selectedMetal === (T.all || 'All') || variantHasMetal(v, selectedMetal));

    const getRelatedImgSrc = (rp) => {
        const rv = getFirstVariant(rp);
        return getImgSrc(rv.images?.[0] || rp.img || '');
    };
    const getRelatedPrice = (rp) => {
        const rv = getFirstVariant(rp);
        return rv.newPrice ?? rp.newPrice ?? rp.price ?? 0;
    };

    const imageRows = [];
    for (let i = 0; i < images.length; i += 2) imageRows.push(images.slice(i, i + 2));
    const isUnlocked = scrollState === 'unlocked';

    // ── Accordions — translated strings ──
    const accordionItems = [
        {
            key: 'details',
            label: T.productDescription,
            content: (
                <>
                    {parseDescription(displayDescription) || <p>{T.descFallback}</p>}
                    <div className="jd-desc-meta">
                        {displayMaterials.length > 0
                            ? <AttributePills label={T.attrMaterial} icon="⚙️" items={displayMaterials} />
                            : product.material ? <p><strong>{T.attrMaterial}:</strong> {product.material}</p> : null}
                        {displayGemstones.length > 0 && (
                            <AttributePills label={T.attrGemstone} icon="💎" items={displayGemstones} />
                        )}
                    </div>
                </>
            )
        },
        {
            key: 'shipping',
            label: T.shippingInfo,
            content: (
                <ul className="jd-bullet-list">
                    <li>{T.ship1}</li>
                    <li>{T.ship2}</li>
                    <li>{T.ship3}</li>
                    <li>{T.ship4}</li>
                    <li>{T.ship5}</li>
                </ul>
            )
        },
        {
            key: 'care',
            label: T.careInstructions,
            content: (
                <ul className="jd-bullet-list">
                    <li>{T.care1}</li>
                    <li>{T.care2}</li>
                    <li>{T.care3}</li>
                    <li>{T.care4}</li>
                </ul>
            )
        }
    ];

    return (
        <>
            <div className="jd-page">

                {/* Translation loading bar */}
                {tStatus === "loading" && (
                    <div className="translation-loading-bar" aria-hidden="true" />
                )}

                <div className={`jd-max-container${isMobile ? ' jd-mobile-page' : ''}`}>

                    {/* Breadcrumb */}
                    <nav className="jd-breadcrumb">
                        <Link href="/">{T.home}</Link>
                        <span className="jd-bc-sep">/</span>
                        <Link href="/product-category/jewellery">{T.jewellery}</Link>
                        <span className="jd-bc-sep">/</span>
                        <Link href="/product-category/earrings">{product.category || T.earrings}</Link>
                        <span className="jd-bc-sep">/</span>
                        <span>{displayTitle}</span>
                    </nav>

                    {/* ══ MOBILE ══ */}
                    {isMobile ? (
                        <div className="jd-mobile-layout">
                            <MobileSlider
                                images={images}
                                getImgSrc={getImgSrc}
                                productName={displayTitle}
                                selectedImageIndex={selectedImageIndex}
                                setSelectedImageIndex={setSelectedImageIndex}
                                onImageClick={(idx) => { setLightboxIndex(idx); setLightboxOpen(true); }}
                            />

                            <div className="jd-mobile-info">
                                <span className="jd-brand-tag">{T.brandTag}</span>
                                <RatingStars rating={4.8} count={124} T={T} />
                                <h1 className="jd-product-title">{displayTitle}</h1>

                                <div className="jd-pricing-row">
                                    {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                        <span className="jd-old-price">{formatPrice(oldPrice, currency)}</span>
                                    )}
                                    <span className="jd-new-price">{formatPrice(newPrice, currency)}</span>
                                    {isSale && <span className="jd-sale-tag">{T.vatIncluded}</span>}
                                </div>

                                {allMetalTypes.length > 0 && (
                                    <MetalTypeSelector
                                        metalTypes={allMetalTypes}
                                        selectedMetal={selectedMetal}
                                        onSelect={handleMetalSelect}
                                        T={T}
                                    />
                                )}

                                {product.variants && product.variants.length > 1 && (
                                    <div className="jd-variant-section">
                                        <span className="jd-variant-label">
                                            {T.styleLabel} <strong style={{ color: 'var(--lux-black)' }}>
                                                {activeVariant.name || `Option ${selectedVariantIndex + 1}`}
                                            </strong>
                                        </span>
                                        <div className="jd-variant-grid">
                                            {filteredVariants.map((v) => {
                                                const idx  = v._origIdx;
                                                const vImg = v.images?.[0] || null;
                                                return (
                                                    <button key={idx}
                                                        className={`jd-variant-card-btn${selectedVariantIndex === idx ? ' active' : ''}`}
                                                        onClick={() => { setSelectedVariantIndex(idx); setSelectedImageIndex(0); }}
                                                        title={v.name || `Option ${idx + 1}`}>
                                                        {vImg && (
                                                            <div className="jd-variant-card-img">
                                                                <img src={getImgSrc(vImg)} alt={v.name || `Variant ${idx + 1}`}
                                                                    onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
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

                                <InstallmentSection price={newPrice} T={T} currency={currency} />
                                <DeliverySection T={T} currency={currency} />

                                <div className="jd-mobile-qty-row">
                                    <span className="jd-swatch-label" style={{ marginBottom: 0, alignSelf: 'center' }}>{T.qty}</span>
                                    <div className="jd-qty-selector">
                                        <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                                        <span>{qty}</span>
                                        <button onClick={() => setQty(qty + 1)}>+</button>
                                    </div>
                                    <button
                                        className={`jd-btn-wishlist${wishlisted ? ' active' : ''}`}
                                        aria-label={wishlisted ? T.removeFromWishlist : T.addToWishlist}
                                        onClick={() => product && toggleWishlist(getWishlistItem())}
                                    >
                                        <svg viewBox="0 0 24 24">
                                            <path
                                                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                                fill={wishlisted ? '#c9a96e' : 'none'}
                                                stroke={wishlisted ? '#c9a96e' : 'currentColor'}
                                                strokeWidth={wishlisted ? '0' : '1.5'}
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <div className="jd-accordions">
                                    {accordionItems.map(({ key, label, content }) => (
                                        <div className="jd-accordion-item" key={key}>
                                            <button className="jd-acc-header"
                                                onClick={() => setOpenAccordion(openAccordion === key ? '' : key)}>
                                                {label.toUpperCase()}
                                                <span className="jd-acc-icon">{openAccordion === key ? '−' : '+'}</span>
                                            </button>
                                            {openAccordion === key && <div className="jd-acc-content">{content}</div>}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ height: '90px' }} />
                            </div>

                            {/* Fixed bottom CTA */}
                            <div className="jd-mobile-fixed-cta">
                                <div className="jd-mobile-cta-price">
                                    <span className="jd-new-price">{formatPrice(newPrice, currency)}</span>
                                    {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                        <span className="jd-old-price jd-old-price--sm">{formatPrice(oldPrice, currency)}</span>
                                    )}
                                </div>
                                <button
                                    className={`jd-btn-primary jd-mobile-add-btn${addedToCart ? ' success' : ''}`}
                                    onClick={inStock ? handleAddToCart : undefined}
                                    disabled={!inStock}>
                                    {!inStock ? T.outOfStock : addedToCart ? T.addedToBag : T.addToBag}
                                </button>
                            </div>
                        </div>

                    ) : (
                        /* ══ DESKTOP ══ */
                        <div className={`jd-split-wrapper${isUnlocked ? ' unlocked' : ''}`} ref={wrapperRef}>

                            {/* LEFT: Gallery */}
                            <div className="jd-gallery-scroll" ref={galleryRef}>
                                <div className="jd-gallery-inner">
                                    {imageRows.map((row, rowIdx) => (
                                        <div key={`${selectedVariantIndex}-row-${rowIdx}`} className="jd-img-row">
                                            {row.map((img, colIdx) => {
                                                const globalIdx = rowIdx * 2 + colIdx;
                                                return (
                                                    <div key={`${selectedVariantIndex}-img-${globalIdx}`}
                                                        className={`jd-img-cell${selectedImageIndex === globalIdx ? ' selected' : ''}`}
                                                        onClick={() => { setSelectedImageIndex(globalIdx); setLightboxIndex(globalIdx); setLightboxOpen(true); }}
                                                        style={{ cursor: 'zoom-in' }}>
                                                        <img src={getImgSrc(img)}
                                                            alt={`${displayTitle} view ${globalIdx + 1}`}
                                                            loading={globalIdx < 2 ? 'eager' : 'lazy'}
                                                            onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                                                    </div>
                                                );
                                            })}
                                            {row.length === 1 && <div className="jd-img-cell jd-img-cell-empty" aria-hidden="true" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT: Info */}
                            <div className="jd-info-scroll" ref={infoRef}>
                                <div className="jd-info-inner">
                                    <span className="jd-brand-tag">{T.brandTag}</span>
                                    <RatingStars rating={4.8} count={124} T={T} />
                                    <h1 className="jd-product-title">{displayTitle}</h1>

                                    <div className="jd-pricing-row">
                                        {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                            <span className="jd-old-price">{formatPrice(oldPrice, currency)}</span>
                                        )}
                                        <span className="jd-new-price">{formatPrice(newPrice, currency)}</span>
                                        {isSale && <span className="jd-sale-tag">{T.vatIncluded}</span>}
                                    </div>

                                    {allMetalTypes.length > 0 && (
                                        <MetalTypeSelector
                                            metalTypes={allMetalTypes}
                                            selectedMetal={selectedMetal}
                                            onSelect={handleMetalSelect}
                                            T={T}
                                        />
                                    )}

                                    {product.variants && product.variants.length > 1 && (
                                        <div className="jd-variant-section">
                                            <span className="jd-variant-label">
                                                {T.styleLabel} <strong style={{ color: 'var(--lux-black)' }}>
                                                    {activeVariant.name || `Option ${selectedVariantIndex + 1}`}
                                                </strong>
                                            </span>
                                            <div className="jd-variant-grid">
                                                {filteredVariants.map((v) => {
                                                    const idx  = v._origIdx;
                                                    const vImg = v.images?.[0] || null;
                                                    return (
                                                        <button key={idx}
                                                            className={`jd-variant-card-btn${selectedVariantIndex === idx ? ' active' : ''}`}
                                                            onClick={() => { setSelectedVariantIndex(idx); setSelectedImageIndex(0); }}
                                                            title={v.name || `Option ${idx + 1}`}>
                                                            {vImg && (
                                                                <div className="jd-variant-card-img">
                                                                    <img src={getImgSrc(vImg)} alt={v.name || `Variant ${idx + 1}`}
                                                                        onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
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

                                    <InstallmentSection price={newPrice} T={T} currency={currency} />
                                    <DeliverySection T={T} currency={currency} />

                                    <div className="jd-cart-actions">
                                        <div className="jd-qty-selector">
                                            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                                            <span>{qty}</span>
                                            <button onClick={() => setQty(qty + 1)}>+</button>
                                        </div>
                                        <button
                                            className={`jd-btn-primary${addedToCart ? ' success' : ''}`}
                                            onClick={inStock ? handleAddToCart : undefined}
                                            disabled={!inStock}>
                                            {!inStock ? T.outOfStock : addedToCart ? T.addedToBag : T.addToBag}
                                        </button>
                                        <button
                                            className={`jd-btn-wishlist${wishlisted ? ' active' : ''}`}
                                            aria-label={wishlisted ? T.removeFromWishlist : T.addToWishlist}
                                            onClick={() => product && toggleWishlist(getWishlistItem())}
                                        >
                                            <svg viewBox="0 0 24 24">
                                                <path
                                                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                                    fill={wishlisted ? '#c9a96e' : 'none'}
                                                    stroke={wishlisted ? '#c9a96e' : 'currentColor'}
                                                    strokeWidth={wishlisted ? '0' : '1.5'}
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="jd-accordions">
                                        {accordionItems.map(({ key, label, content }) => (
                                            <div className="jd-accordion-item" key={key}>
                                                <button className="jd-acc-header"
                                                    onClick={() => setOpenAccordion(openAccordion === key ? '' : key)}>
                                                    {label.toUpperCase()}
                                                    <span className="jd-acc-icon">{openAccordion === key ? '−' : '+'}</span>
                                                </button>
                                                {openAccordion === key && <div className="jd-acc-content">{content}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ══ RELATED PRODUCTS ══ */}
                {relatedProducts.length > 0 && (
                    <section className="jd-related-section">
                        <h2 className="jd-related-title">{T.youMayAlsoLike}</h2>
                        <div className="jd-related-grid">
                            {relatedProducts.map((rp) => (
                                <Link key={rp._id || rp.slug}
                                    href={`/product-category/earrings/${rp.slug}`}
                                    className="jd-related-card">
                                    <div className="jd-related-img">
                                        <img src={getRelatedImgSrc(rp)} alt={rp.title || rp.name}
                                            loading="lazy"
                                            onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
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
                                                                {formatPrice(op, currency)}
                                                            </del>
                                                        )}
                                                        <span className="jd-related-price">{formatPrice(np, currency)}</span>
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

            {lightboxOpen && (
                <Lightbox
                    images={images}
                    getImgSrc={getImgSrc}
                    productName={displayTitle}
                    startIndex={lightboxIndex}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
            <Reviews />
        </>
    );
}