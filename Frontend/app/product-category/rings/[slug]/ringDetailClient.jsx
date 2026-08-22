'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import './ringDetail.css';
import Reviews from '../../../../components/Home/Reviews/Reviews';
import { useWishlist } from '../../../context/WishlistContext';
import { useCurrency } from '../../../context/CurrencyContext';

const API_BASE = "https://api.barosche.com";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const ALL_METAL = '__ALL_METAL__';

const CURRENCY_MAP = {
    US: { code: "USD", symbol: "$", rate: 1.14 },
    GB: { code: "GBP", symbol: "£", rate: 0.86 },
    IN: { code: "INR", symbol: "₹", rate: 108.9 },
    AE: { code: "AED", symbol: "AED", rate: 4.20 },
    AU: { code: "AUD", symbol: "A$", rate: 1.66 },
    CA: { code: "CAD", symbol: "C$", rate: 1.62 },
    SG: { code: "SGD", symbol: "S$", rate: 1.48 },
    JP: { code: "JPY", symbol: "¥", rate: 184.6 },
    CH: { code: "CHF", symbol: "CHF", rate: 0.93 },
    default: { code: "EUR", symbol: "€", rate: 1 },
};

function formatPrice(eurPrice, currency) {
    if (!eurPrice && eurPrice !== 0) return null;
    if (!currency) return null;
    const converted = Math.round(Number(eurPrice) * currency.rate);
    if (currency.code === 'JPY') return `${currency.symbol}${converted.toLocaleString()}`;
    if (currency.code === 'INR') return `${currency.symbol}${converted.toLocaleString('en-IN')}`;
    return `${currency.symbol}${converted.toLocaleString()}`;
}

const DEFAULT_STRINGS = {
    home: "Home",
    jewellery: "Jewellery",
    collection: "Collection",
    reviews: "reviews",
    brandTag: "Barosche Fine Jewellery",
    vatIncluded: "VAT included",
    metalTypeLabel: "Metal Type:",
    all: "All",
    styleLabel: "Style:",
    promoText: "This price is up to",
    promoHighlight: "49% lower",
    promoSuffix: "in comparison to traditional jewellery shops.",
    klarnaDesc: "In 3 interest-free installments from",
    klarnaOr: "or flexible payments in up to 12 installments",
    paypalDesc: "In 4 interest-free installments from",
    paypalOr: "or flexible payments in up to 24 installments",
    ringSize: "Ring Size:",
    selectSize: "Select a size",
    needSizing: "Need help with sizing?",
    sizeRequiredError: "Please select a size before adding to bag",
    qty: "Qty:",
    outOfStock: "OUT OF STOCK",
    addedToBag: "✓ ADDED TO BAG",
    addToBag: "ADD TO BAG",
    addToWishlist: "Add to wishlist",
    removeFromWishlist: "Remove from wishlist",
    standardDelivery: "Standard Delivery",
    standardDeliverySub: "Germany: 2 – 4 Working Days | EU: 4 – 8 Working Days",
    free: "Free",
    expressAbove: "On orders above €200",
    expressDelivery: "Express Delivery",
    expressDeliverySub: "Germany: 2 – 3 Working Days | EU: 2 – 4 Working Days",
    productDescription: "Product Description",
    shippingInfo: "Shipping Information",
    careInstructions: "Care Instructions",
    ship1: "Complimentary shipping across Germany",
    ship2: "Worldwide shipping available at checkout",
    ship3: "Presented in eco-conscious, fully paper-based packaging, ready for gifting",
    ship4: "Carefully crafted to be treasured for years to come",
    ship5: "Covered by our 365-day warranty against manufacturing defects",
    care1: "Avoid contact with perfumes, lotions, and chemicals",
    care2: "Clean gently with a soft cloth after use",
    care3: "Store in a dry pouch or box away from sunlight",
    care4: "Handle carefully to prevent scratches or damage",
    descFallback: "An exploration of colour and form, inspired by the pure beauty of hand-set stones and masterful craftsmanship.",
    attrMaterial: "Material",
    attrGemstone: "Gemstone",
    youMayAlsoLike: "You May Also Like",
    productNotFound: "Product Not Found",
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

function useTranslationAndCurrency() {
    const [strings, setStrings] = useState(DEFAULT_STRINGS);
    const [currency, setCurrency] = useState(CURRENCY_MAP.default);
    const [status, setStatus] = useState("idle");

    useEffect(() => {
        let cancelled = false;

        async function run() {
            try {
                setStatus("loading");

                const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
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

                const keys = Object.keys(DEFAULT_STRINGS);
                const allStrings = flattenStrings(DEFAULT_STRINGS);

                const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        texts: allStrings,
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
                console.error("RingDetail translation error:", err.message);
                if (!cancelled) setStatus("error");
            }
        }

        run();
        return () => { cancelled = true; };
    }, []);

    return { strings, currency, status };
}

// ────────
//  HELPERS
// ────────
function getFirstVariant(product) {
    if (product.variants && product.variants.length > 0) return product.variants[0];
    return {
        images: product.images || [],
        videos: product.videos || [],
        oldPrice: product.oldPrice,
        newPrice: product.newPrice ?? product.price,
        isSale: product.isSale || false,
        inStock: product.inStock ?? true,
    };
}


function cleanList(items) {
    if (!items) return [];
    const arr = Array.isArray(items) ? items : [items];
    const seen = new Set();
    const out = [];
    for (const raw of arr) {
        if (raw === null || raw === undefined) continue;
        const val = String(raw).trim();
        if (!val) continue;
        const key = val.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(val);
    }
    return out;
}

function parseDescription(text) {
    if (!text) return null;


    let parts = text.split(/\r\n|\r|\n/).map(p => p.trim()).filter(Boolean);


    if (parts.length <= 1) {
        const starParts = text.split('*').map(p => p.trim()).filter(Boolean);
        if (starParts.length > 1) parts = starParts;
    }


    if (parts.length <= 1) {
        const raw = parts[0] || text;
        const labelBoundary = /(?=(?:^|(?<=\.\s))[A-Z0-9][\w'-]*(?:[\s-][A-Z0-9][\w'-]*){0,4}\s—\s)/g;
        const autoSplit = raw.split(labelBoundary).map(p => p.trim()).filter(Boolean);
        if (autoSplit.length > 1) parts = autoSplit;
    }

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
                            <strong className="jd-desc-label" style={{ fontWeight: 700 }}>{label}</strong>
                            {'—'}
                            {body}
                        </p>
                    );
                }
                return <p key={i} className="jd-desc-plain">{part}</p>;
            })}
        </div>
    );
}

function AttributePills({ label, icon, items }) {
    const cleaned = cleanList(items);
    if (cleaned.length === 0) return null;
    return (
        <div className="jd-attr-group">
            <p className="jd-attr-label">{icon} {label}</p>
            <div className="jd-attr-pills">
                {cleaned.map((item, idx) => (
                    <React.Fragment key={item}>
                        <span className="jd-attr-pill">{item}</span>
                        {idx < cleaned.length - 1 && (
                            <span className="jd-attr-sep" aria-hidden="true"> | </span>
                        )}
                    </React.Fragment>
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

function RatingStars({ rating = 4.8, count = 124, T }) {
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
            <span className="jd-rating-count">({count} {T.reviews})</span>
        </div>
    );
}

function MetalTypeSelector({ metalTypes, selectedMetal, onSelect, T }) {
    if (!metalTypes || metalTypes.length === 0) return null;

    const options = [
        { value: ALL_METAL, label: T.all },
        ...metalTypes.map((m) => ({ value: m, label: m })),
    ];

    const getMetalStyle = (metalValue, isActive) => {
        if (!isActive) {
            return {
                background: 'transparent',
                color: 'var(--lux-black, #1a1a1a)',
                border: '1.5px solid #d4cfc8',
            };
        }
        switch (metalValue) {
            case 'Gold':
            case 'Silver':
                return {
                    background: 'linear-gradient(135deg, #c9a96e 0%, #e8c97a 50%, #b8873a 100%)',
                    color: '#fff',
                    border: '1.5px solid #b8873a',
                    boxShadow: '0 2px 8px #c9a96e73',
                };
            default:
                return {
                    background: 'linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%)',
                    color: '#fff',
                    border: '1.5px solid #1a1a1a',
                    boxShadow: '0 2px 8px #00000040',
                };
        }
    };

    const selectedLabel = selectedMetal === ALL_METAL ? T.all : selectedMetal;

    return (
        <div className="jd-metal-section">
            <p className="jd-metal-label">
                {T.metalTypeLabel} <strong style={{ color: 'var(--lux-black)' }}>{selectedLabel}</strong>
            </p>
            <div className="jd-metal-options">
                {options.map((opt) => {
                    const isActive = selectedMetal === opt.value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            className={`jd-metal-btn${isActive ? ' active' : ''}`}
                            style={{
                                ...getMetalStyle(opt.value, isActive),
                                transition: 'all 0.25s ease',
                                cursor: 'pointer',
                            }}
                            onClick={() => onSelect(opt.value)}
                            aria-pressed={isActive}
                        >
                            <span className="jd-metal-btn-text">{opt.label}</span>
                        </button>
                    );
                })}
            </div>
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
                <div className="jd-delivery-right">
                    <span className="jd-delivery-price jd-delivery-free">{T.free}</span>
                    <span className="jd-delivery-above">{T.expressAbove}</span>
                </div>
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
                    <span className="jd-delivery-price">{formatPrice(50, currency)}</span>
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
                        <p>
                            {T.klarnaDesc} <strong>{klarnaInstallment}</strong> {T.klarnaOr}
                        </p>
                    </div>
                </div>
                <div className="payment-card">
                    <div className="logo-box">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                            alt="PayPal"
                            className="paypal-logo"
                            width={40}
                            height={24}
                        />
                    </div>
                    <div className="info-box">
                        <p>
                            {T.paypalDesc} <strong>{paypalInstallment}</strong> {T.paypalOr}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


function SizeSelector({ sizes, selectedSize, setSelectedSize, T, sizeError, onSizeChange }) {
    if (!sizes || sizes.length === 0) return null;
    return (
        <div className="jd-size-section">
            <span className="jd-swatch-label">{T.ringSize}</span>
            <div
                className="jd-size-dropdown-wrap"
                style={sizeError ? { border: '1.5px solid #c00000', borderRadius: '2px' } : undefined}
            >
                <select
                    className="jd-size-dropdown"
                    value={selectedSize || ''}
                    onChange={(e) => {
                        const val = e.target.value || null;
                        setSelectedSize(val);
                        onSizeChange?.(val);
                    }}
                >
                    <option value="">{T.selectSize}</option>
                    {sizes.map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
                <span className="jd-size-dropdown-arrow">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="7 10 12 5 17 10" />
                        <polyline points="7 14 12 19 17 14" />
                    </svg>
                </span>
            </div>
            {sizeError && (
                <p style={{ color: '#c00000', fontSize: '12px', margin: '6px 0 0' }}>
                    {T.sizeRequiredError}
                </p>
            )}
            <a href="/find-your-ring-size" className="jd-size-guide-link">
                {T.needSizing}
            </a>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE SLIDER — auto-advance logic:
   - Image slides advance after a fixed 3.5s timer (as before).
   - Video slides ONLY advance once the video has finished playing
     (the 'ended' event), not on a timer. A safety fallback timer
     is kept in case a video fails to load/play so the slider never
     gets stuck.
═══════════════════════════════════════════════════════════════ */
function MobileSlider({ media, getImgSrc, productName, isSale, selectedImageIndex, setSelectedImageIndex, onImageClick }) {
    const sliderRef = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const imageTimerRef = useRef(null);
    const videoFallbackRef = useRef(null);
    const videoRefs = useRef([]);

    const goToSlide = useCallback((idx) => {
        const clamped = Math.max(0, Math.min(idx, media.length - 1));
        setSelectedImageIndex(clamped);
    }, [media.length, setSelectedImageIndex]);

    const advanceSlide = useCallback(() => {
        setSelectedImageIndex(prev => (prev + 1) % media.length);
    }, [media.length, setSelectedImageIndex]);

    useEffect(() => {
        clearTimeout(imageTimerRef.current);
        clearTimeout(videoFallbackRef.current);

        if (media.length === 0) return;

        videoRefs.current.forEach((v, idx) => {
            if (!v) return;
            if (idx !== selectedImageIndex) {
                v.pause();
                v.currentTime = 0;
            }
        });

        if (media.length <= 1) return;

        const currentItem = media[selectedImageIndex];

        if (currentItem.type === 'video') {
            const videoEl = videoRefs.current[selectedImageIndex];

            if (!videoEl) {
                imageTimerRef.current = setTimeout(advanceSlide, 3500);
                return;
            }

            const handleEnded = () => advanceSlide();
            videoEl.addEventListener('ended', handleEnded);

            videoEl.currentTime = 0;
            videoEl.play().catch(() => {
                videoFallbackRef.current = setTimeout(advanceSlide, 8000);
            });

            videoFallbackRef.current = setTimeout(advanceSlide, 20000);

            return () => {
                videoEl.removeEventListener('ended', handleEnded);
                clearTimeout(videoFallbackRef.current);
            };
        } else {
            imageTimerRef.current = setTimeout(advanceSlide, 3500);
            return () => clearTimeout(imageTimerRef.current);
        }
    }, [selectedImageIndex, media, advanceSlide]);

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
        }
        touchStartX.current = null;
        touchStartY.current = null;
    };

    if (!media || media.length === 0) return null;

    return (
        <div className="jd-mobile-slider" ref={sliderRef}>
            <div
                className="jd-mobile-slider-track"
                style={{ transform: `translateX(-${selectedImageIndex * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {media.map((item, idx) => (
                    <div className="jd-mobile-slide" key={idx}>
                        {item.type === 'video' ? (
                            <video
                                ref={(el) => { videoRefs.current[idx] = el; }}
                                src={getImgSrc(item.src)}
                                muted
                                playsInline
                                onClick={() => onImageClick && onImageClick(idx)}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in', display: 'block' }}
                                className="jd-gallery-video"
                            />
                        ) : (
                            <img
                                src={getImgSrc(item.src)}
                                alt={`${productName} view ${idx + 1}`}
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                onClick={() => onImageClick && onImageClick(idx)}
                                style={{ cursor: 'zoom-in' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {media.length > 1 && (
                <div className="jd-slider-dots">
                    {media.map((_, idx) => (
                        <button
                            key={idx}
                            className={`jd-slider-dot${selectedImageIndex === idx ? ' active' : ''}`}
                            onClick={() => goToSlide(idx)}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function Lightbox({ media, getImgSrc, productName, startIndex, onClose }) {
    const [index, setIndex] = useState(startIndex || 0);

    useEffect(() => {
        setIndex(startIndex || 0);
    }, [startIndex]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % media.length);
            if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + media.length) % media.length);
        };
        window.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [media.length, onClose]);

    if (!media || media.length === 0) return null;

    const goPrev = (e) => { e.stopPropagation(); setIndex((i) => (i - 1 + media.length) % media.length); };
    const goNext = (e) => { e.stopPropagation(); setIndex((i) => (i + 1) % media.length); };

    const currentItem = media[index];

    return (
        <div
            className="jd-lightbox-overlay"
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.7)',
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
                {media.length > 1 && (
                    <button
                        className="jd-lightbox-nav jd-lightbox-prev"
                        onClick={goPrev}
                        aria-label="Previous item"
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

                {currentItem.type === 'video' ? (
                    <video
                        src={getImgSrc(currentItem.src)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        className="jd-lightbox-img"
                        style={{ maxWidth: '100%', maxHeight: '88vh', objectFit: 'contain', borderRadius: 4 }}
                    />
                ) : (
                    <img
                        src={getImgSrc(currentItem.src)}
                        alt={`${productName} view ${index + 1}`}
                        className="jd-lightbox-img"
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        style={{ maxWidth: '100%', maxHeight: '88vh', objectFit: 'contain', borderRadius: 4 }}
                    />
                )}

                {media.length > 1 && (
                    <button
                        className="jd-lightbox-nav jd-lightbox-next"
                        onClick={goNext}
                        aria-label="Next item"
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

            {media.length > 1 && (
                <div
                    className="jd-lightbox-counter"
                    style={{
                        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                        color: '#fff', fontSize: 14, letterSpacing: 1, opacity: 0.85,
                    }}
                >
                    {index + 1} / {media.length}
                </div>
            )}
        </div>
    );
}
export default function RingDetailClient({ slug, initialProduct = null }) {

    const { strings: T, status: tStatus } = useTranslationAndCurrency();
    const { currency, formatPrice } = useCurrency();

    const [product, setProduct] = useState(initialProduct);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(!initialProduct);
    const [error, setError] = useState(null);
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
    const [qty, setQty] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [openAccordion, setOpenAccordion] = useState('details');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [scrollState, setScrollState] = useState('locked');
    const [isMobile, setIsMobile] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedMetal, setSelectedMetal] = useState(ALL_METAL);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [sizeError, setSizeError] = useState(false);

    const { toggleWishlist, isInWishlist } = useWishlist();
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

    // 🆕 FIX: jab slug badle (client-side navigation, e.g. related product click)
    // toh naye SSR initialProduct ke sath state sync ho jaani chahiye
    useEffect(() => {
        setProduct(initialProduct || null);
        setLoading(!initialProduct);
        setError(null);
    }, [slug, initialProduct]);

    useEffect(() => {
        if (!slug) return;
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/products/${slug}`);
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data = await res.json();
                if (data.success) {
                    setProduct(data.product);
                    setError(null);
                    // 🆕 FIX: sirf tab reset karo jab product actually badla ho
                    // (agar SSR se already same product mila tha, toh selections mat udaao)
                    if (!initialProduct || initialProduct.slug !== data.product.slug) {
                        setSelectedVariantIndex(0);
                        setSelectedImageIndex(0);
                        setSelectedSize(null);
                        setSelectedMetal(ALL_METAL);
                    }
                    if (data.product?.category) {
                        try {
                            const relRes = await fetch(`${API_BASE}/api/products?category=${encodeURIComponent(data.product.category)}`);
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
                } else if (!initialProduct) {
                    throw new Error(data.message || 'Product not found');
                }
            } catch (err) {
                // 🆕 FIX: agar SSR se product mil chuka tha toh client fetch fail hone par
                // "Product Not Found" screen mat dikhao — jo hai use hi render hone do
                if (!initialProduct) setError(err.message);
                console.error('RingDetailClient fetch error:', err.message);
            }
            finally { setLoading(false); }
        };
        fetchProduct();
    }, [slug]);

    useEffect(() => {
        setSelectedImageIndex(0);
        setSelectedSize(null);
        setSizeError(false);
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
            _id: product._id,
            variantId: activeVariant._id || selectedVariantIndex,
            title: activeVariant.title || product.title || product.name,
            newPrice: activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0,
            oldPrice: activeVariant.oldPrice ?? product.oldPrice ?? null,
            images: varImgs,
            img: varImgs[0] || '',
            metal: selectedMetal !== ALL_METAL ? selectedMetal : (activeVariant.metal || null),
            stone: stoneColors[selectedColor] || null,
            size: selectedSize || null,
            slug: product.slug,
            category: product.category,
            isSale: activeVariant.isSale ?? product.isSale ?? false,
        };
    }, [product, selectedVariantIndex, selectedMetal, selectedColor, selectedSize, stoneColors]);

    const wishlisted = product
        ? isInWishlist(product._id, (product.variants?.[selectedVariantIndex])?._id || selectedVariantIndex)
        : false;

    const handleMetalSelect = useCallback((metal) => {
        setSelectedMetal(metal);
        if (!product?.variants) return;
        if (metal === ALL_METAL) return;

        const currentVariant = product.variants[selectedVariantIndex];
        if (currentVariant && variantHasMetal(currentVariant, metal)) return;

        const matchIdx = product.variants.findIndex(v => variantHasMetal(v, metal));
        if (matchIdx !== -1) {
            setSelectedVariantIndex(matchIdx);
            setSelectedImageIndex(0);
        }
    }, [product, selectedVariantIndex]);

    const handleSizeChange = useCallback((val) => {
        if (val) setSizeError(false);
    }, []);

    const handleAddToCart = useCallback(() => {
        if (!product) return;

        const activeVariant = (product.variants && product.variants.length > 0)
            ? product.variants[selectedVariantIndex] || product.variants[0]
            : getFirstVariant(product);
        const sizesAvailable = activeVariant.sizes && activeVariant.sizes.length > 0;
        if (sizesAvailable && !selectedSize) {
            setSizeError(true);
            const sizeSectionEl = document.querySelector('.jd-size-section');
            if (sizeSectionEl) {
                sizeSectionEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        const varImgs = activeVariant.images && activeVariant.images.length > 0
            ? activeVariant.images
            : Array.isArray(product.images) && product.images.length > 0
                ? product.images
                : [product.img].filter(Boolean);

        const cartItem = {
            _id: product._id,
            variantId: activeVariant._id || selectedVariantIndex,
            title: activeVariant.title || product.title || product.name,
            variantName: activeVariant.name || null,
            newPrice: activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0,
            images: varImgs,
            img: varImgs[0] || '',
            metal: selectedMetal !== ALL_METAL ? selectedMetal : (activeVariant.metal || null),
            stone: stoneColors[selectedColor] || null,
            size: selectedSize || null,
            qty,
            slug: product.slug,
            category: product.category,
        };

        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { item: cartItem } }));
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 400);
    }, [product, selectedVariantIndex, qty, selectedColor, selectedSize, selectedMetal, stoneColors]);

    if (loading) return <DetailSkeleton />;
    if (error || !product) {
        return (
            <div className="jd-not-found">
                <h2>{error || T.productNotFound}</h2>
                <Link href="/product-category/jewellery" className="jd-back-link">{T.returnToCollection}</Link>
            </div>
        );
    }

    const activeVariant = (product.variants && product.variants.length > 0)
        ? product.variants[selectedVariantIndex] || product.variants[0]
        : getFirstVariant(product);

    const variantImages = activeVariant.images && activeVariant.images.length > 0 ? activeVariant.images : [];
    const images = variantImages.length > 0
        ? variantImages
        : Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : [product.img].filter(Boolean);

    const variantVideos = activeVariant.videos && activeVariant.videos.length > 0 ? activeVariant.videos : [];
    const videos = variantVideos.length > 0
        ? variantVideos
        : Array.isArray(product.videos) && product.videos.length > 0
            ? product.videos
            : [];

    const galleryMedia = [];
    if (images.length > 0) galleryMedia.push({ type: 'image', src: images[0] });
    if (videos.length > 0) galleryMedia.push({ type: 'video', src: videos[0] });
    images.slice(1).forEach((img) => galleryMedia.push({ type: 'image', src: img }));

    const oldPrice = activeVariant.oldPrice ?? product.oldPrice ?? null;
    const newPrice = activeVariant.newPrice ?? product.newPrice ?? product.price ?? 0;
    const isSale = activeVariant.isSale ?? product.isSale ?? false;
    const variantQtyRaw = activeVariant.quantity;
    const variantQty = variantQtyRaw !== undefined ? Number(variantQtyRaw) : null;
    const inStock = (variantQty !== null ? variantQty > 0 : true)
        && (activeVariant.inStock ?? product.inStock ?? true) !== false;

    const displayTitle = activeVariant.title || product.title || product.name;
    const displayDescription = activeVariant.description || product.description || '';


    const displayMaterials = cleanList(
        (activeVariant.materials && activeVariant.materials.length > 0)
            ? activeVariant.materials
            : (product.materials || [])
    );
    const displayGemstones = cleanList(
        (activeVariant.gemstones && activeVariant.gemstones.length > 0)
            ? activeVariant.gemstones
            : (product.gemstones || [])
    );

    const allMetalTypes = [...new Set(
        (product.variants || []).flatMap(v =>
            Array.isArray(v.metalType) ? v.metalType : v.metalType ? [v.metalType] : []
        )
    )].filter(Boolean);

    const filteredVariants = (product.variants || [])
        .map((v, idx) => ({ ...v, _origIdx: idx }))
        .filter(v => selectedMetal === ALL_METAL || variantHasMetal(v, selectedMetal));

    const getRelatedImgSrc = (rp) => {
        const rv = getFirstVariant(rp);
        const img = (rv.images && rv.images.length > 0) ? rv.images[0] : rp.img || '';
        return getImgSrc(img);
    };
    const getRelatedPrice = (rp) => {
        const rv = getFirstVariant(rp);
        return rv.newPrice ?? rp.newPrice ?? rp.price ?? 0;
    };

    const mediaRows = [];
    for (let i = 0; i < galleryMedia.length; i += 2) {
        mediaRows.push(galleryMedia.slice(i, i + 2));
    }

    const isUnlocked = scrollState === 'unlocked';


    const accordionItems = [
        {
            key: 'details',
            label: T.productDescription,
            content: (
                <>
                    {parseDescription(displayDescription) || (
                        <p>{T.descFallback}</p>
                    )}
                    <div className="jd-desc-meta">

                        {displayMaterials.length > 0 && (
                            <AttributePills label={T.attrMaterial} icon="⚙️" items={displayMaterials} />
                        )}
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
                        <span>{product.category || T.collection}</span>
                        <span className="jd-bc-sep">/</span>
                        <span>{displayTitle}</span>
                    </nav>

                    {/* ══ MOBILE LAYOUT ══ */}
                    {isMobile ? (
                        <div className="jd-mobile-layout">

                            <MobileSlider
                                media={galleryMedia}
                                getImgSrc={getImgSrc}
                                productName={displayTitle}
                                isSale={isSale}
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
                                                const idx = v._origIdx;
                                                const vImg = v.images && v.images.length > 0 ? v.images[0] : null;
                                                return (
                                                    <button
                                                        key={idx}
                                                        className={`jd-variant-card-btn${selectedVariantIndex === idx ? ' active' : ''}`}
                                                        onClick={() => { setSelectedVariantIndex(idx); setSelectedImageIndex(0); }}
                                                        title={v.name || `Option ${idx + 1}`}
                                                    >
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

                                <SizeSelector
                                    sizes={activeVariant.sizes || []}
                                    selectedSize={selectedSize}
                                    setSelectedSize={setSelectedSize}
                                    T={T}
                                    sizeError={sizeError}
                                    onSizeChange={handleSizeChange}
                                />

                                <div className="jd-divider" />

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

                            {/* Fixed Bottom CTA */}
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
                                    {!inStock ? T.outOfStock : addedToCart ? T.addedToBag : T.addToBag}
                                </button>
                            </div>

                        </div>
                    ) : (
                        /* ══ DESKTOP LAYOUT ══ */
                        <div className={`jd-split-wrapper${isUnlocked ? ' unlocked' : ''}`} ref={wrapperRef}>

                            {/* LEFT: Gallery */}
                            <div className="jd-gallery-scroll" ref={galleryRef}>
                                <div className="jd-gallery-inner">
                                    {mediaRows.map((row, rowIdx) => (
                                        <div key={`${selectedVariantIndex}-row-${rowIdx}`} className="jd-img-row">
                                            {row.map((item, colIdx) => {
                                                const globalIdx = rowIdx * 2 + colIdx;
                                                return (
                                                    <div
                                                        key={`${selectedVariantIndex}-media-${globalIdx}`}
                                                        className={`jd-img-cell${selectedImageIndex === globalIdx ? ' selected' : ''}`}
                                                        onClick={() => { setSelectedImageIndex(globalIdx); setLightboxIndex(globalIdx); setLightboxOpen(true); }}
                                                        style={{ cursor: 'zoom-in' }}
                                                    >
                                                        {item.type === 'video' ? (
                                                            <video
                                                                src={getImgSrc(item.src)}
                                                                autoPlay
                                                                loop
                                                                muted
                                                                playsInline
                                                            />
                                                        ) : (
                                                            <img
                                                                src={getImgSrc(item.src)}
                                                                alt={`${displayTitle} view ${globalIdx + 1}`}
                                                                loading={globalIdx < 2 ? 'eager' : 'lazy'}
                                                                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                                            />
                                                        )}
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
                                                    const idx = v._origIdx;
                                                    const vImg = v.images && v.images.length > 0 ? v.images[0] : null;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            className={`jd-variant-card-btn${selectedVariantIndex === idx ? ' active' : ''}`}
                                                            onClick={() => { setSelectedVariantIndex(idx); setSelectedImageIndex(0); }}
                                                            title={v.name || `Option ${idx + 1}`}
                                                        >
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

                                    <SizeSelector
                                        sizes={activeVariant.sizes || []}
                                        selectedSize={selectedSize}
                                        setSelectedSize={setSelectedSize}
                                        T={T}
                                        sizeError={sizeError}
                                        onSizeChange={handleSizeChange}
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
                        <h2 className="jd-related-title">{T.youMayAlsoLike}</h2>
                        <div className="jd-related-grid">
                            {relatedProducts.map((rp) => (
                                <Link
                                    key={rp._id || rp.slug}
                                    href={`/product-category/rings/${rp.slug}`}
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
                    media={galleryMedia}
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