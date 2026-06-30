'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import './braceletsDetail.css';
import Reviews from '../../../../components/Home/Reviews/Reviews';
import { useWishlist } from '../../../context/WishlistContext';

const API_BASE = "https://api.barosche.com";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

// ─── CURRENCY CONFIG ──────────────────────────────────────────────────────
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

// ─── TRANSLATOR SETUP ────────────────────────────────────────────────────
const DEFAULT_UI = {
  breadcrumb: {
    home: "Home",
    jewellery: "Jewellery",
  },
  labels: {
    brandTag: "Barosche Fine Jewellery",
    metalType: "Metal Type",
    style: "Style",
    option: "Option",
    qty: "Qty",
    outOfStock: "OUT OF STOCK",
    addedToBag: "✓ ADDED TO BAG",
    addToBag: "ADD TO BAG",
    wishlistAdd: "Add to wishlist",
    wishlistRemove: "Remove from wishlist",
    quickView: "Quick view",
    vatIncluded: "VAT included",
    sale: "Sale",
    youMayAlsoLike: "You May Also Like",
    returnToCollection: "← Return to Collection",
    productNotFound: "Product Not Found",
    reviews: "reviews",
    braceletSize: "Bracelet Size:",
    selectSize: "Select a size",
    sizeGuide: "Need help with sizing?",
  },
  delivery: {
    standardTitle: "Standard Delivery",
    standardSub: "Your customized product | 22 – 23 Jun",
    standardPrice: "Free",
    expressTitle: "Express Delivery",
    expressSub: "Browse ready-to-ship variants | 15 – 16 Jun",
    expressVariants: "40 variants",
  },
  installment: {
    promoText: "This price is up to",
    promoHighlight: "49% lower",
    promoSuffix: "in comparison to traditional jewellery shops.",
    klarnaText: "In 3 interest-free installments from {amount} or flexible payments in up to 12 installments",
    paypalText: "In 4 interest-free installments from {amount} or flexible payments in up to 24 installments",
  },
  accordion: {
    details: "Product Description",
    detailsFallback: "An exploration of colour and form, inspired by the pure beauty of hand-set stones and masterful craftsmanship.",
    shipping: "Shipping Information",
    shippingItems: [
      "Complimentary shipping across Germany",
      "Worldwide shipping available at checkout",
      "Presented in eco-conscious, fully paper-based packaging, ready for gifting",
      "Carefully crafted to be treasured for years to come",
      "Covered by our 365-day warranty against manufacturing defects",
    ],
    care: "Care Instructions",
    careItems: [
      "Avoid contact with perfumes, lotions, and chemicals",
      "Clean gently with a soft cloth after use",
      "Store in a dry pouch or box away from sunlight",
      "Handle carefully to prevent scratches or damage",
    ],
    material: "Material",
    gemstone: "Gemstone",
  },
};

const flattenUI = (ui) => [
  ui.breadcrumb.home,
  ui.breadcrumb.jewellery,
  ui.labels.brandTag,
  ui.labels.metalType,
  ui.labels.style,
  ui.labels.option,
  ui.labels.qty,
  ui.labels.outOfStock,
  ui.labels.addedToBag,
  ui.labels.addToBag,
  ui.labels.wishlistAdd,
  ui.labels.wishlistRemove,
  ui.labels.quickView,
  ui.labels.vatIncluded,
  ui.labels.sale,
  ui.labels.youMayAlsoLike,
  ui.labels.returnToCollection,
  ui.labels.productNotFound,
  ui.labels.reviews,
  ui.labels.braceletSize,
  ui.labels.selectSize,
  ui.labels.sizeGuide,
  ui.delivery.standardTitle,
  ui.delivery.standardSub,
  ui.delivery.standardPrice,
  ui.delivery.expressTitle,
  ui.delivery.expressSub,
  ui.delivery.expressVariants,
  ui.installment.promoText,
  ui.installment.promoHighlight,
  ui.installment.promoSuffix,
  ui.installment.klarnaText,
  ui.installment.paypalText,
  ui.accordion.details,
  ui.accordion.detailsFallback,
  ui.accordion.shipping,
  ...ui.accordion.shippingItems,
  ui.accordion.care,
  ...ui.accordion.careItems,
  ui.accordion.material,
  ui.accordion.gemstone,
];

const rebuildUI = (translations) => {
  let i = 0;
  const g = () => translations[i++];
  return {
    breadcrumb: { home: g(), jewellery: g() },
    labels: {
      brandTag: g(), metalType: g(), style: g(), option: g(),
      qty: g(), outOfStock: g(), addedToBag: g(), addToBag: g(),
      wishlistAdd: g(), wishlistRemove: g(), quickView: g(), vatIncluded: g(),
      sale: g(), youMayAlsoLike: g(), returnToCollection: g(),
      productNotFound: g(), reviews: g(), braceletSize: g(),
      selectSize: g(), sizeGuide: g(),
    },
    delivery: {
      standardTitle: g(), standardSub: g(), standardPrice: g(),
      expressTitle: g(), expressSub: g(), expressVariants: g(),
    },
    installment: {
      promoText: g(), promoHighlight: g(), promoSuffix: g(),
      klarnaText: g(), paypalText: g(),
    },
    accordion: {
      details: g(), detailsFallback: g(), shipping: g(),
      shippingItems: [g(), g(), g(), g(), g()],
      care: g(),
      careItems: [g(), g(), g(), g()],
      material: g(), gemstone: g(),
    },
  };
};

// ─── HELPERS ───────────────────────────────────────────────────────────────

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

function AttributePills({ label, icon, items, pillStyle }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="jd-attr-group">
            <p className="jd-attr-label">{icon} {label}</p>
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

function RatingStars({ rating = 4.8, count = 124, reviewsLabel = "reviews" }) {
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
            <span className="jd-rating-count">({count} {reviewsLabel})</span>
        </div>
    );
}

function MetalTypeSelector({ metalTypes, selectedMetal, onSelect, metalTypeLabel }) {
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
                {metalTypeLabel}: <strong style={{ color: 'var(--lux-black)' }}>{selectedMetal}</strong>
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

// ── DeliverySection: currency-aware ──
function DeliverySection({ t, currency }) {
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
                    <span className="jd-delivery-title">{t.delivery.standardTitle}</span>
                    <span className="jd-delivery-sub">{t.delivery.standardSub}</span>
                </div>
                <span className="jd-delivery-price jd-delivery-free">{t.delivery.standardPrice}</span>
            </div>

            <div className="jd-delivery-item">
                <div className="jd-delivery-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <div className="jd-delivery-info">
                    <span className="jd-delivery-title">{t.delivery.expressTitle}</span>
                    <span className="jd-delivery-sub">{t.delivery.expressSub}</span>
                </div>
                <div className="jd-delivery-right">
                    <span className="jd-delivery-price">{formatPrice(24.99, currency)}</span>
                    <span className="jd-delivery-variants">{t.delivery.expressVariants}</span>
                </div>
            </div>
        </div>
    );
}

// ── InstallmentSection: currency-aware ──
function InstallmentSection({ price, t, currency }) {
    const klarnaInstallment = formatPrice(price / 3, currency) || `€${(price / 3).toFixed(2)}`;
    const paypalInstallment = formatPrice(price / 4, currency) || `€${(price / 4).toFixed(2)}`;

    return (
        <div className="installment-container">
            <p className="promo-text">
                {t.installment.promoText} <span className="highlight-text">{t.installment.promoHighlight}</span> {t.installment.promoSuffix}
            </p>
            <div className="cards-wrapper">
                <div className="payment-card">
                    <div className="logo-box klarna-bg">
                        <span className="klarna-text">Klarna.</span>
                    </div>
                    <div className="info-box">
                        <p>
                            {t.installment.klarnaText.replace('{amount}', `<strong>${klarnaInstallment}</strong>`).split(/(<strong>.*?<\/strong>)/g).map((part, i) =>
                                part.startsWith('<strong>') ? <strong key={i}>{klarnaInstallment}</strong> : part
                            )}
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
                            {t.installment.paypalText.replace('{amount}', `<strong>${paypalInstallment}</strong>`).split(/(<strong>.*?<\/strong>)/g).map((part, i) =>
                                part.startsWith('<strong>') ? <strong key={i}>{paypalInstallment}</strong> : part
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SizeSelector({ sizes, selectedSize, setSelectedSize, t }) {
    if (!sizes || sizes.length === 0) return null;
    return (
        <div className="jd-size-section">
            <span className="jd-swatch-label">{t.labels.braceletSize}</span>
            <div className="jd-size-dropdown-wrap">
                <select
                    className="jd-size-dropdown"
                    value={selectedSize || ''}
                    onChange={(e) => setSelectedSize(e.target.value || null)}
                >
                    <option value="">{t.labels.selectSize}</option>
                    {sizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
                <span className="jd-size-dropdown-arrow">&#8964;</span>
            </div>
            <a href="/size-guide" className="jd-size-guide-link">
                {t.labels.sizeGuide}
            </a>
        </div>
    );
}

// ── Hover action icons: wishlist / quick-view / add-to-cart ──
function CardActionIcons({ onWishlist, onQuickView, onAddToCart, wishlisted, t }) {
    return (
        <div className="jd-card-icons">
            <button
                type="button"
                className={`jd-card-icon-btn${wishlisted ? ' active' : ''}`}
                aria-label={wishlisted ? t.labels.wishlistRemove : t.labels.wishlistAdd}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist && onWishlist(); }}
            >
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        fill={wishlisted ? '#c9a96e' : 'none'}
                        stroke={wishlisted ? '#c9a96e' : 'currentColor'}
                        strokeWidth={wishlisted ? '0' : '1.5'}
                    />
                </svg>
            </button>
            <button
                type="button"
                className="jd-card-icon-btn"
                aria-label={t.labels.quickView}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView && onQuickView(); }}
            >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            </button>
            <button
                type="button"
                className="jd-card-icon-btn"
                aria-label={t.labels.addToBag}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart && onAddToCart(); }}
            >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
            </button>
        </div>
    );
}

function MobileSlider({ images, getImgSrc, productName, isSale, selectedImageIndex, setSelectedImageIndex, onImageClick }) {
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
            <div
                className="jd-mobile-slider-track"
                style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {images.map((img, idx) => (
                    <div className="jd-mobile-slide" key={idx}>
                        <img
                            src={getImgSrc(img)}
                            alt={`${productName} view ${idx + 1}`}
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                            onClick={() => onImageClick && onImageClick(idx)}
                            style={{ cursor: 'zoom-in' }}
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function BraceletsDetailClient({ slug }) {
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
    const [selectedSize,         setSelectedSize]         = useState(null);
    const [selectedMetal,        setSelectedMetal]        = useState('All');
    const [lightboxOpen,         setLightboxOpen]         = useState(false);
    const [lightboxIndex,        setLightboxIndex]        = useState(0);
    const { toggleWishlist, isInWishlist } = useWishlist();

    // ── Translator + Currency state ──
    const [t,                 setT]                 = useState(DEFAULT_UI);
    const [currency,          setCurrency]          = useState(CURRENCY_MAP.default);
    const [translationStatus, setTranslationStatus] = useState('idle');

    const galleryRef = useRef(null);
    const infoRef    = useRef(null);
    const wrapperRef = useRef(null);

    const stoneColors = [
        { name: 'Blue Topaz', hex: '#7bc4e1' },
        { name: 'Amethyst',   hex: '#8a4f7d' },
        { name: 'Citrine',    hex: '#e8b84b' },
        { name: 'Peridot',    hex: '#a3be6b' },
        { name: 'Prasiolite', hex: '#c5d0bc' },
        { name: 'Garnet',     hex: '#7a2021' },
    ];
    const [selectedColor, setSelectedColor] = useState(0);

    // ── Auto-translate + currency on mount ──
    useEffect(() => {
        let cancelled = false;

        const translateUI = async () => {
            try {
                setTranslationStatus('loading');

                const detectRes  = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
                const detectData = await detectRes.json();
                if (!detectData.success) throw new Error('Language detection failed');

                const { languageCode, countryCode } = detectData;

                if (!cancelled && countryCode && CURRENCY_MAP[countryCode]) {
                    setCurrency(CURRENCY_MAP[countryCode]);
                }

                if (languageCode === 'en') {
                    if (!cancelled) setTranslationStatus('done');
                    return;
                }

                const allStrings = flattenUI(DEFAULT_UI);

                const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        texts:          allStrings,
                        targetLanguage: languageCode,
                        sourceLanguage: 'en',
                    }),
                });

                const translateData = await translateRes.json();
                if (!translateData.success) throw new Error('Translation failed');

                if (!cancelled) {
                    setT(rebuildUI(translateData.translations));
                    setTranslationStatus('done');
                }
            } catch (err) {
                console.error('Auto-translate error:', err.message);
                if (!cancelled) setTranslationStatus('error');
            }
        };

        translateUI();
        return () => { cancelled = true; };
    }, []);

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
                    setSelectedSize(null);
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
        setSelectedSize(null);
        if (galleryRef.current) galleryRef.current.scrollTop = 0;
        setScrollState('locked');
    }, [selectedVariantIndex]);

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
            const wrapperRect     = wrapper.getBoundingClientRect();
            const midX            = wrapperRect.left + wrapperRect.width / 2;
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
        const handleTouchEnd   = (e) => {
            const delta = touchStartY - e.changedTouches[0].clientY;
            if (delta > 0) {
                const { scrollTop, scrollHeight, clientHeight } = gallery;
                if (scrollHeight - scrollTop - clientHeight < 10) setScrollState('unlocked');
            }
        };
        gallery.addEventListener('touchstart', handleTouchStart, { passive: true });
        gallery.addEventListener('touchend',   handleTouchEnd,   { passive: true });
        return () => {
            gallery.removeEventListener('touchstart', handleTouchStart);
            gallery.removeEventListener('touchend',   handleTouchEnd);
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
            metal:     selectedMetal !== 'All' ? selectedMetal : (activeVariant.metal || null),
            stone:     stoneColors[selectedColor] || null,
            size:      selectedSize || null,
            slug:      product.slug,
            category:  product.category,
            isSale:    activeVariant.isSale ?? product.isSale ?? false,
        };
    }, [product, selectedVariantIndex, selectedMetal, selectedColor, selectedSize, stoneColors]);

    const wishlisted = product
        ? isInWishlist(
            product._id,
            (product.variants?.[selectedVariantIndex])?._id || selectedVariantIndex
          )
        : false;

    const handleMetalSelect = useCallback((metal) => {
        setSelectedMetal(metal);
        if (!product?.variants) return;
        if (metal === 'All') return;
        const currentVariant = product.variants[selectedVariantIndex];
        if (currentVariant && variantHasMetal(currentVariant, metal)) return;
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
            _id:       product._id,
            variantId: activeVariant._id || selectedVariantIndex,
            title:     activeVariant.title || product.title || product.name,
            newPrice:  activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0,
            images:    varImgs,
            img:       varImgs[0] || '',
            metal:     selectedMetal !== 'All' ? selectedMetal : (activeVariant.metal || null),
            stone:     stoneColors[selectedColor] || null,
            size:      selectedSize || null,
            qty,
            slug:      product.slug,
            category:  product.category,
        };

        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { item: cartItem } }));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 400);
    }, [product, selectedVariantIndex, qty, selectedColor, selectedSize, selectedMetal, stoneColors]);

    // ── Related product quick actions ──
    const handleRelatedAddToCart = useCallback((rp) => {
        const rv = getFirstVariant(rp);
        const varImgs = rv.images?.length > 0 ? rv.images : [rp.img].filter(Boolean);
        const cartItem = {
            _id: rp._id,
            variantId: rv._id || 0,
            title: rp.title || rp.name,
            newPrice: rv.newPrice ?? rp.newPrice ?? rp.price ?? 0,
            images: varImgs,
            img: varImgs[0] || '',
            metal: rv.metal || null,
            qty: 1,
            slug: rp.slug,
            category: rp.category,
        };
        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { item: cartItem } }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 400);
    }, []);

    const handleRelatedWishlist = useCallback((rp) => {
        const rv = getFirstVariant(rp);
        const varImgs = rv.images?.length > 0 ? rv.images : [rp.img].filter(Boolean);
        toggleWishlist({
            _id: rp._id,
            variantId: rv._id || 0,
            title: rp.title || rp.name,
            newPrice: rv.newPrice ?? rp.newPrice ?? rp.price ?? 0,
            oldPrice: rv.oldPrice ?? rp.oldPrice ?? null,
            images: varImgs,
            img: varImgs[0] || '',
            slug: rp.slug,
            category: rp.category,
            isSale: rv.isSale ?? rp.isSale ?? false,
        });
    }, [toggleWishlist]);

    if (loading) return <DetailSkeleton />;
    if (error || !product) {
        return (
            <div className="jd-not-found">
                <h2>{error || t.labels.productNotFound}</h2>
                <Link href="/product-category/jewellery" className="jd-back-link">{t.labels.returnToCollection}</Link>
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

    const oldPrice           = activeVariant.oldPrice ?? product.oldPrice ?? null;
    const newPrice           = activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0;
    const isSale             = activeVariant.isSale   ?? product.isSale   ?? false;
    const inStock            = activeVariant.inStock  ?? product.inStock  ?? true;
    const displayTitle       = activeVariant.title       || product.title || product.name;
    const displayDescription = activeVariant.description || product.description || '';
    const displayMaterials   = (activeVariant.materials && activeVariant.materials.length > 0)
        ? activeVariant.materials : (product.materials || []);
    const displayGemstones   = (activeVariant.gemstones && activeVariant.gemstones.length > 0)
        ? activeVariant.gemstones : (product.gemstones || []);

    const allMetalTypes = [...new Set(
        (product.variants || []).flatMap(v =>
            Array.isArray(v.metalType) ? v.metalType : v.metalType ? [v.metalType] : []
        )
    )].filter(Boolean);

    const filteredVariants = (product.variants || [])
        .map((v, idx) => ({ ...v, _origIdx: idx }))
        .filter(v => selectedMetal === 'All' || variantHasMetal(v, selectedMetal));

    const getRelatedImgSrc = (rp) => {
        const rv  = getFirstVariant(rp);
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
            label: t.accordion.details,
            content: (
                <>
                    {parseDescription(displayDescription) || (
                        <p>{t.accordion.detailsFallback}</p>
                    )}
                    <div className="jd-desc-meta">
                        {displayMaterials.length > 0 ? (
                            <AttributePills label={t.accordion.material} icon="⚙️" items={displayMaterials} />
                        ) : product.material ? (
                            <p><strong>{t.accordion.material}:</strong> {product.material}</p>
                        ) : null}

                        {displayGemstones.length > 0 ? (
                            <AttributePills label={t.accordion.gemstone} icon="💎" items={displayGemstones} />
                        ) : (
                            <p><strong>{t.accordion.gemstone}:</strong> {stoneColors[selectedColor]?.name}</p>
                        )}
                    </div>
                </>
            )
        },
        {
            key: 'shipping',
            label: t.accordion.shipping,
            content: (
                <ul className="jd-bullet-list">
                    {t.accordion.shippingItems.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            )
        },
        {
            key: 'care',
            label: t.accordion.care,
            content: (
                <ul className="jd-bullet-list">
                    {t.accordion.careItems.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            )
        }
    ];

    return (
        <>
            {translationStatus === 'loading' && (
                <div className="translation-loading-bar" aria-hidden="true" />
            )}

            <div className="jd-page">
                <div className={`jd-max-container${isMobile ? ' jd-mobile-page' : ''}`}>

                    {/* Breadcrumb */}
                    <nav className="jd-breadcrumb">
                        <Link href="/">{t.breadcrumb.home}</Link>
                        <span className="jd-bc-sep">/</span>
                        <Link href="/product-category/jewellery">{t.breadcrumb.jewellery}</Link>
                        <span className="jd-bc-sep">/</span>
                        <span>{product.category || 'Collection'}</span>
                        <span className="jd-bc-sep">/</span>
                        <span>{displayTitle}</span>
                    </nav>

                    {/* ══ MOBILE LAYOUT ══ */}
                    {isMobile ? (
                        <div className="jd-mobile-layout">

                            <div className="jd-image-wrap">
                                {isSale && <span className="jd-sale-badge-top">{t.labels.sale.toUpperCase()}</span>}
                                <CardActionIcons
                                    wishlisted={wishlisted}
                                    onWishlist={() => product && toggleWishlist(getWishlistItem())}
                                    onQuickView={() => { setLightboxIndex(selectedImageIndex); setLightboxOpen(true); }}
                                    onAddToCart={inStock ? handleAddToCart : undefined}
                                    t={t}
                                />
                                <MobileSlider
                                    images={images}
                                    getImgSrc={getImgSrc}
                                    productName={displayTitle}
                                    isSale={isSale}
                                    selectedImageIndex={selectedImageIndex}
                                    setSelectedImageIndex={setSelectedImageIndex}
                                    onImageClick={(idx) => { setLightboxIndex(idx); setLightboxOpen(true); }}
                                />
                            </div>

                            <div className="jd-mobile-info">
                                <span className="jd-brand-tag">{t.labels.brandTag}</span>
                                <RatingStars rating={4.8} count={124} reviewsLabel={t.labels.reviews} />
                                <h1 className="jd-product-title">{displayTitle}</h1>

                                <div className="jd-pricing-row">
                                    {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                        <span className="jd-old-price">{formatPrice(oldPrice, currency)}</span>
                                    )}
                                    <span className="jd-new-price">{formatPrice(newPrice, currency)}</span>
                                    {isSale && <span className="jd-sale-tag">{t.labels.vatIncluded}</span>}
                                </div>

                                {allMetalTypes.length > 0 && (
                                    <MetalTypeSelector
                                        metalTypes={allMetalTypes}
                                        selectedMetal={selectedMetal}
                                        onSelect={handleMetalSelect}
                                        metalTypeLabel={t.labels.metalType}
                                    />
                                )}

                                {product.variants && product.variants.length > 1 && (
                                    <div className="jd-variant-section">
                                        <span className="jd-variant-label">
                                            {t.labels.style}: <strong style={{ color: 'var(--lux-black)' }}>
                                                {activeVariant.name || `${t.labels.option} ${selectedVariantIndex + 1}`}
                                            </strong>
                                        </span>
                                        <div className="jd-variant-grid">
                                            {filteredVariants.map((v) => {
                                                const idx  = v._origIdx;
                                                const vImg = v.images && v.images.length > 0 ? v.images[0] : null;
                                                return (
                                                    <button
                                                        key={idx}
                                                        className={`jd-variant-card-btn${selectedVariantIndex === idx ? ' active' : ''}`}
                                                        onClick={() => { setSelectedVariantIndex(idx); setSelectedImageIndex(0); }}
                                                        title={v.name || `${t.labels.option} ${idx + 1}`}
                                                    >
                                                        {vImg && (
                                                            <div className="jd-variant-card-img">
                                                                <img src={getImgSrc(vImg)} alt={v.name || `Variant ${idx + 1}`}
                                                                    onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                                                            </div>
                                                        )}
                                                        <span className="jd-variant-card-name">
                                                            {v.name || `${t.labels.option} ${idx + 1}`}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <InstallmentSection price={newPrice} t={t} currency={currency} />
                                <DeliverySection t={t} currency={currency} />

                                <SizeSelector
                                    sizes={activeVariant.sizes || []}
                                    selectedSize={selectedSize}
                                    setSelectedSize={setSelectedSize}
                                    t={t}
                                />

                                <div className="jd-divider" />

                                <div className="jd-mobile-qty-row">
                                    <span className="jd-swatch-label" style={{ marginBottom: 0, alignSelf: 'center' }}>{t.labels.qty}:</span>
                                    <div className="jd-qty-selector">
                                        <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                                        <span>{qty}</span>
                                        <button onClick={() => setQty(qty + 1)}>+</button>
                                    </div>
                                    <button
                                        className={`jd-btn-wishlist${wishlisted ? ' active' : ''}`}
                                        aria-label={wishlisted ? t.labels.wishlistRemove : t.labels.wishlistAdd}
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
                                    <span className="jd-new-price">{formatPrice(newPrice, currency)}</span>
                                    {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                        <span className="jd-old-price jd-old-price--sm">{formatPrice(oldPrice, currency)}</span>
                                    )}
                                </div>
                                <button
                                    className={`jd-btn-primary jd-mobile-add-btn${addedToCart ? ' success' : ''}`}
                                    onClick={inStock ? handleAddToCart : undefined}
                                    disabled={!inStock}
                                >
                                    {!inStock ? t.labels.outOfStock : addedToCart ? t.labels.addedToBag : t.labels.addToBag}
                                </button>
                            </div>

                        </div>
                    ) : (
                        /* ══ DESKTOP LAYOUT ══ */
                        <div className={`jd-split-wrapper${isUnlocked ? ' unlocked' : ''}`} ref={wrapperRef}>

                            {/* LEFT: Gallery */}
                            <div className="jd-gallery-scroll" ref={galleryRef}>
                                <div className="jd-gallery-inner">
                                    {imageRows.map((row, rowIdx) => (
                                        <div key={`${selectedVariantIndex}-row-${rowIdx}`} className="jd-img-row">
                                            {row.map((img, colIdx) => {
                                                const globalIdx = rowIdx * 2 + colIdx;
                                                return (
                                                    <div
                                                        key={`${selectedVariantIndex}-img-${globalIdx}`}
                                                        className={`jd-img-cell${selectedImageIndex === globalIdx ? ' selected' : ''}`}
                                                        style={{ cursor: 'zoom-in', position: 'relative' }}
                                                    >
                                                        {globalIdx === 0 && (
                                                            <CardActionIcons
                                                                wishlisted={wishlisted}
                                                                onWishlist={() => product && toggleWishlist(getWishlistItem())}
                                                                onQuickView={() => { setLightboxIndex(globalIdx); setLightboxOpen(true); }}
                                                                onAddToCart={inStock ? handleAddToCart : undefined}
                                                                t={t}
                                                            />
                                                        )}
                                                        <img
                                                            src={getImgSrc(img)}
                                                            alt={`${displayTitle} view ${globalIdx + 1}`}
                                                            loading={globalIdx < 2 ? 'eager' : 'lazy'}
                                                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                                            onClick={() => { setSelectedImageIndex(globalIdx); setLightboxIndex(globalIdx); setLightboxOpen(true); }}
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
                                    <span className="jd-brand-tag">{t.labels.brandTag}</span>
                                    <RatingStars rating={4.8} count={124} reviewsLabel={t.labels.reviews} />
                                    <h1 className="jd-product-title">{displayTitle}</h1>

                                    <div className="jd-pricing-row">
                                        {oldPrice && Number(oldPrice) > Number(newPrice) && (
                                            <span className="jd-old-price">{formatPrice(oldPrice, currency)}</span>
                                        )}
                                        <span className="jd-new-price">{formatPrice(newPrice, currency)}</span>
                                        {isSale && <span className="jd-sale-tag">{t.labels.vatIncluded}</span>}
                                    </div>

                                    {allMetalTypes.length > 0 && (
                                        <MetalTypeSelector
                                            metalTypes={allMetalTypes}
                                            selectedMetal={selectedMetal}
                                            onSelect={handleMetalSelect}
                                            metalTypeLabel={t.labels.metalType}
                                        />
                                    )}

                                    {product.variants && product.variants.length > 1 && (
                                        <div className="jd-variant-section">
                                            <span className="jd-variant-label">
                                                {t.labels.style}: <strong style={{ color: 'var(--lux-black)' }}>
                                                    {activeVariant.name || `${t.labels.option} ${selectedVariantIndex + 1}`}
                                                </strong>
                                            </span>
                                            <div className="jd-variant-grid">
                                                {filteredVariants.map((v) => {
                                                    const idx  = v._origIdx;
                                                    const vImg = v.images && v.images.length > 0 ? v.images[0] : null;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            className={`jd-variant-card-btn${selectedVariantIndex === idx ? ' active' : ''}`}
                                                            onClick={() => { setSelectedVariantIndex(idx); setSelectedImageIndex(0); }}
                                                            title={v.name || `${t.labels.option} ${idx + 1}`}
                                                        >
                                                            {vImg && (
                                                                <div className="jd-variant-card-img">
                                                                    <img src={getImgSrc(vImg)} alt={v.name || `Variant ${idx + 1}`}
                                                                        onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                                                                </div>
                                                            )}
                                                            <span className="jd-variant-card-name">
                                                                {v.name || `${t.labels.option} ${idx + 1}`}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <InstallmentSection price={newPrice} t={t} currency={currency} />
                                    <DeliverySection t={t} currency={currency} />

                                    <SizeSelector
                                        sizes={activeVariant.sizes || []}
                                        selectedSize={selectedSize}
                                        setSelectedSize={setSelectedSize}
                                        t={t}
                                    />

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
                                            {!inStock ? t.labels.outOfStock : addedToCart ? t.labels.addedToBag : t.labels.addToBag}
                                        </button>
                                        <button
                                            className={`jd-btn-wishlist${wishlisted ? ' active' : ''}`}
                                            aria-label={wishlisted ? t.labels.wishlistRemove : t.labels.wishlistAdd}
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

                {/* ══ RELATED PRODUCTS ══ */}
                {relatedProducts.length > 0 && (
                    <section className="jd-related-section">
                        <h2 className="jd-related-title">{t.labels.youMayAlsoLike}</h2>
                        <div className="jd-related-grid">
                            {relatedProducts.map((rp) => (
                                <Link
                                    key={rp._id || rp.slug}
                                    href={`/product-category/bracelets/${rp.slug}`}
                                    className="jd-related-card"
                                >
                                    <div className="jd-related-img">
                                        {(getFirstVariant(rp).isSale || rp.isSale) && (
                                            <span className="jd-related-sale-badge">{t.labels.sale}</span>
                                        )}
                                        <CardActionIcons
                                            wishlisted={false}
                                            onWishlist={() => handleRelatedWishlist(rp)}
                                            onQuickView={() => { /* navigates via card link */ }}
                                            onAddToCart={() => handleRelatedAddToCart(rp)}
                                            t={t}
                                        />
                                        <img
                                            src={getRelatedImgSrc(rp)}
                                            alt={rp.title || rp.name}
                                            loading="lazy"
                                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                        />
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