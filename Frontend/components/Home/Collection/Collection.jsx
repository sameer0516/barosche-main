"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./Collection.css";
import { useWishlist } from "../../../app/context/WishlistContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  mainTitle: "Modern Fine Jewellery. Minimal. Intentional. Yours.",
  subText1: "Not for everyone.",
  subText2: "Just for the ones who know.",
  subText3: "Crafted with intention. Chosen with certainty",
  description:
    "Each piece at Barosche is designed to reflect modern elegance and timeless simplicity. Minimal in form, powerful in presence — made for those who value detail, quality, and individuality. Discover jewellery that feels personal, effortless, and truly yours.",
  subtitle: "New & Trending Arrivals",
  shopButton: "Shop The Collection",
  saleBadge: "SALE",
  wishlistLabel: "Add to Wishlist",
  quickViewLabel: "Quick View",
  addToCartLabel: "Add to Cart",
  priceNaLabel: "Price on request",
};

const CURRENCY_MAP = {
  US: { code: "USD", symbol: "$", rate: 1.08 },
  GB: { code: "GBP", symbol: "£", rate: 0.85 },
  IN: { code: "INR", symbol: "₹", rate: 90.5 },
  AE: { code: "AED", symbol: "AED", rate: 3.97 },
  AU: { code: "AUD", symbol: "A$", rate: 1.65 },
  CA: { code: "CAD", symbol: "C$", rate: 1.47 },
  SG: { code: "SGD", symbol: "S$", rate: 1.45 },
  JP: { code: "JPY", symbol: "¥", rate: 162 },
  CH: { code: "CHF", symbol: "CHF", rate: 0.97 },
  default: { code: "EUR", symbol: "€", rate: 1 },
};

function formatPrice(eurPrice, currency) {
  if (!eurPrice && eurPrice !== 0) return null;
  const converted = Math.round(Number(eurPrice) * currency.rate);
  if (currency.code === "JPY") return `${currency.symbol}${converted.toLocaleString()}`;
  if (currency.code === "INR") return `${currency.symbol}${converted.toLocaleString("en-IN")}`;
  return `${currency.symbol}${converted.toLocaleString()}`;
}

const normaliseProduct = (p) => {
  const v = p.variants?.[0] || {};
  const primaryCategory = (p.categories?.[0] || p.category || "jewellery")
    .toLowerCase()
    .replace(/\s+/g, "-");

  const url = `/product-category/${primaryCategory}/${p.slug}/`;

  const images = v.images && v.images.length > 0 ? v.images : p.images || [];
  const videos = v.videos && v.videos.length > 0 ? v.videos : p.videos || [];
  const imageUrl = images?.[0] ? `${BACKEND_URL}${images[0]}` : null;

  return {
    id: p._id,
    _id: p._id,
    slug: p.slug,
    category: p.categories?.[0] || p.category || "Jewellery",
    title: v.title || p.title || p.name,
    _rawTitle: v.title || p.title || p.name,
    oldPrice: v.oldPrice ?? null,
    newPrice: v.newPrice ?? null,
    isSale: v.isSale || false,
    images,
    videos,
    image: imageUrl,
    url,
    description: p.description || v.description || "",
  };
};

/* ───────────────────────── Quick View Modal (with video support) ───────────────────────── */

function QuickViewModal({ product, currency, content, onClose, onAddToCart, wishlist, onToggleWishlist }) {
  const [qty, setQty] = useState(1);

  const images = product.images || [];
  const videos = product.videos || [];

  // pehli image, phir video (agar hai), phir baaki images — Rings.js wala hi order
  const mediaList = useMemo(() => {
    const list = [];
    if (images.length > 0) list.push({ type: "image", src: images[0] });
    if (videos.length > 0) list.push({ type: "video", src: videos[0] });
    images.slice(1).forEach((img) => list.push({ type: "image", src: img }));
    return list;
  }, [images, videos]);

  const [activeIdx, setActiveIdx] = useState(0);
  const videoRef = useRef(null);
  const activeItem = mediaList[activeIdx] || null;

  // active slide video ho to play karo
  useEffect(() => {
    if (activeItem?.type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [activeIdx, activeItem]);

  // slide change / unmount pe video pause
  useEffect(() => {
    return () => {
      if (videoRef.current) videoRef.current.pause();
    };
  }, [activeIdx]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "#00000057",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          maxWidth: "860px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          display: "flex",
          flexDirection: "row",
          position: "relative",
          flexWrap: "wrap",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "22px",
            cursor: "pointer",
            color: "#555",
            zIndex: 1,
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Images / Video Left Side */}
        <div style={{ flex: "1 1 300px", minWidth: "240px", padding: "24px 16px 24px 24px" }}>
          <div
            style={{
              background: "#f7f6f4",
              borderRadius: "6px",
              aspectRatio: "1/1",
              overflow: "hidden",
              marginBottom: "12px",
            }}
          >
            {activeItem ? (
              activeItem.type === "video" ? (
                <video
                  ref={videoRef}
                  src={`${BACKEND_URL}${activeItem.src}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  muted
                  playsInline
                  loop
                  controls
                />
              ) : (
                <img
                  src={`${BACKEND_URL}${activeItem.src}`}
                  alt={product.title}
                  width={600}
                  height={600}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                />
              )
            ) : (
              <img
                src="/placeholder.jpg"
                alt="placeholder"
                width={600}
                height={600}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>

          {/* Thumbnail strip — image + video dono */}
          {mediaList.length > 1 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {mediaList.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  style={{
                    width: "54px",
                    height: "54px",
                    padding: 0,
                    border: i === activeIdx ? "2px solid #1a1a1a" : "2px solid transparent",
                    borderRadius: "4px",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#f7f6f4",
                    position: "relative",
                  }}
                >
                  {item.type === "video" ? (
                    <>
                      <video
                        src={`${BACKEND_URL}${item.src}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        muted
                        playsInline
                      />
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.25)",
                          pointerEvents: "none",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="#fff">
                          <path d="M4 2.5v11l10-5.5-10-5.5z" />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <img
                      src={`${BACKEND_URL}${item.src}`}
                      alt={`view ${i + 1}`}
                      width={54}
                      height={54}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Right Side */}
        <div style={{ flex: "1 1 280px", padding: "32px 24px 24px 16px", minWidth: "240px" }}>
          {product.isSale && (
            <span
              style={{
                background: "#1a1a1a",
                color: "#fff",
                fontSize: "11px",
                letterSpacing: "1px",
                padding: "3px 8px",
                borderRadius: "2px",
                display: "inline-block",
                marginBottom: "10px",
              }}
            >
              {content.saleBadge}
            </span>
          )}
          <p
            style={{
              fontSize: "12px",
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "1px",
              margin: "0 0 6px",
            }}
          >
            {product.category}
          </p>
          <h2 style={{ fontSize: "20px", fontWeight: "500", margin: "0 0 14px", lineHeight: 1.3 }}>
            {product.title}
          </h2>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px" }}>
            {product.oldPrice && (
              <span style={{ fontSize: "15px", color: "#aaa", textDecoration: "line-through" }}>
                {formatPrice(product.oldPrice, currency)}
              </span>
            )}
            <span style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>
              {product.newPrice !== null && product.newPrice !== undefined
                ? formatPrice(product.newPrice, currency)
                : content.priceNaLabel}
            </span>
          </div>

          {product.description && (
            <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, marginBottom: "20px" }}>
              {product.description}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", color: "#555" }}>Qty:</span>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "4px" }}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{ width: "32px", height: "32px", border: "none", background: "none", cursor: "pointer", fontSize: "16px" }}
              >
                −
              </button>
              <span style={{ minWidth: "28px", textAlign: "center", fontSize: "14px" }}>{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                style={{ width: "32px", height: "32px", border: "none", background: "none", cursor: "pointer", fontSize: "16px" }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={() => onAddToCart(product, qty)}
              style={{
                background: "#1a1a1a",
                color: "#fff",
                border: "none",
                padding: "13px 20px",
                fontSize: "13px",
                letterSpacing: "0.5px",
                cursor: "pointer",
                borderRadius: "4px",
                textTransform: "uppercase",
              }}
            >
              {content.addToCartLabel}
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() =>
                  onToggleWishlist(product._id, {
                    _id: product._id,
                    slug: product.slug,
                    title: product.title,
                    category: product.category,
                    images: product.images || [],
                    oldPrice: product.oldPrice,
                    newPrice: product.newPrice,
                    isSale: product.isSale,
                  })
                }
                style={{
                  flex: 1,
                  border: "1px solid #ddd",
                  background: "#fff",
                  padding: "11px 12px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  color: wishlist.includes(product._id) ? "#c0392b" : "#555",
                }}
              >
                <svg width="15" height="14" viewBox="0 0 16 15" fill="none">
                  <path
                    d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    fill={wishlist.includes(product._id) ? "currentColor" : "none"}
                  />
                </svg>
                {content.wishlistLabel}
              </button>
              <Link
                href={product.url}
                onClick={onClose}
                style={{
                  flex: 1,
                  textAlign: "center",
                  border: "1px solid #ddd",
                  background: "#fff",
                  padding: "11px 12px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "#555",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#1a1a1a",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: "4px",
        fontSize: "14px",
        zIndex: 9999,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 12px #00000033",
        transition: "opacity 0.3s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      {message}
    </div>
  );
}

/* ───────────────────────── Product Card (image + video hover slideshow) ───────────────────────── */

function ProductCard({ product, content, currency, wishlist, onToggleWishlist, onQuickView, onCardClick }) {
  const images = product.images || [];
  const videos = product.videos || [];

  // pehli image, phir video (agar hai), phir baaki images
  const mediaList = useMemo(() => {
    const list = [];
    if (images.length > 0) list.push({ type: "image", src: images[0] });
    if (videos.length > 0) list.push({ type: "video", src: videos[0] });
    images.slice(1).forEach((img) => list.push({ type: "image", src: img }));
    return list;
  }, [images, videos]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef(null);
  const imageTimerRef = useRef(null);
  const hoveringRef = useRef(false);

  const clearImageTimer = () => {
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }
  };

  const advanceTo = (idx) => {
    setCurrentIdx(idx);
    scheduleFrom(idx);
  };

  const scheduleFrom = (idx) => {
    clearImageTimer();
    const item = mediaList[idx];
    if (!item || mediaList.length <= 1) return;
    if (item.type === "image") {
      imageTimerRef.current = setTimeout(() => {
        if (!hoveringRef.current) return;
        const next = (idx + 1) % mediaList.length;
        advanceTo(next);
      }, 800);
    }
  };

  const handleVideoEnded = () => {
    if (!hoveringRef.current) return;
    const next = (currentIdx + 1) % mediaList.length;
    advanceTo(next);
  };

  const startHover = () => {
    setHovered(true);
    if (mediaList.length <= 1) return;
    hoveringRef.current = true;
    const next = 1 % mediaList.length;
    advanceTo(next);
  };

  const stopHover = () => {
    setHovered(false);
    hoveringRef.current = false;
    clearImageTimer();
    setCurrentIdx(0);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // jab bhi current slide video ho, use (re)play karo
  useEffect(() => {
    const item = mediaList[currentIdx];
    if (item?.type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentIdx, mediaList]);

  useEffect(() => () => clearImageTimer(), []);

  const currentItem =
    mediaList[currentIdx] || (images.length > 0 ? { type: "image", src: images[0] } : null);

  const iconBtnStyle = {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#fff",
    border: "none",
    boxShadow: "0 2px 6px #00000026",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#333",
  };

  return (
    <div
      className="product-card"
      style={{ cursor: "pointer", position: "relative" }}
      onClick={() => onCardClick(product.url)}
      onMouseEnter={startHover}
      onMouseLeave={stopHover}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onCardClick(product.url)}
      aria-label={`View ${product.title}`}
    >
      <div className="image-wrapper" style={{ position: "relative" }}>
        {product.isSale && <span className="sale-badge">{content.saleBadge}</span>}

        {currentItem ? (
          currentItem.type === "video" ? (
            <video
              ref={videoRef}
              src={`${BACKEND_URL}${currentItem.src}`}
              className="product-image"
              muted
              playsInline
              autoPlay
              onEnded={handleVideoEnded}
            />
          ) : (
            <img
              src={`${BACKEND_URL}${currentItem.src}`}
              alt={product.title}
              className="product-image"
              width={400}
              height={400}
              draggable={false}
              onError={(e) => { e.target.src = "/placeholder.jpg"; }}
            />
          )
        ) : (
          <div
            className="product-image"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f3f0fb",
              fontSize: 48,
              color: "#8b5cf6",
            }}
          >
            💍
          </div>
        )}

        {/* dots — jitne media items utne dots, active wala highlight */}
        {mediaList.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "5px",
              zIndex: 1,
            }}
          >
            {mediaList.map((_, i) => (
              <span
                key={i}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: i === currentIdx ? "#1a1a1a" : "#ffffffb3",
                  boxShadow: "0 0 2px #00000040",
                  transition: "background 0.2s ease",
                }}
              />
            ))}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateX(0)" : "translateX(6px)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          <button
            style={{
              ...iconBtnStyle,
              color: wishlist.includes(product._id) ? "#c0392b" : "#333",
            }}
            title={content.wishlistLabel}
            aria-label={content.wishlistLabel}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist(product._id, {
                _id: product._id,
                slug: product.slug,
                title: product.title,
                category: product.category,
                images: product.images || [],
                oldPrice: product.oldPrice,
                newPrice: product.newPrice,
                isSale: product.isSale,
              });
            }}
          >
            <svg width="16" height="15" viewBox="0 0 16 15" fill="none">
              <path
                d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z"
                stroke="currentColor"
                strokeWidth="1.3"
                fill={wishlist.includes(product._id) ? "currentColor" : "none"}
              />
            </svg>
          </button>

          <button
            style={iconBtnStyle}
            title={content.quickViewLabel}
            aria-label={content.quickViewLabel}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M1 8C2.5 4 5 2 8 2C11 2 13.5 4 15 8C13.5 12 11 14 8 14C5 14 2.5 12 1 8Z"
                stroke="currentColor"
                strokeWidth="1.3"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <div className="pricing">
          {product.oldPrice && <span className="old-price">{formatPrice(product.oldPrice, currency)}</span>}
          <span className="new-price">
            {product.newPrice !== null && product.newPrice !== undefined
              ? formatPrice(product.newPrice, currency)
              : content.priceNaLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Main Collection Component ───────────────────────── */

const Collection = () => {
  const router = useRouter();

  const { wishlistItems, addToWishlist, removeFromWishlist: removeFromWishlistCtx } = useWishlist();
  const wishlist = (wishlistItems || []).map((item) => item._id || item);

  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState(CURRENCY_MAP.default);
  const [visibleItems, setVisibleItems] = useState(4);
  const [infiniteProducts, setInfiniteProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const toastTimer = useRef(null);
  const intervalRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchDeltaXRef = useRef(0);
  const isSwipingRef = useRef(false);

  const showToast = useCallback((message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message });
    toastTimer.current = setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  }, []);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BACKEND_URL}/api/products`);
        const data = await res.json();

        if (!data.success) throw new Error(data.message || "Failed to fetch products");

        const sorted = [...(data.products || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const latest7 = sorted.slice(0, 7).map(normaliseProduct);
        setProducts(latest7);
      } catch (err) {
        console.error("Collection fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    const poll = setInterval(fetchProducts, 60_000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (products.length === 0) return;

    const detectAndTranslate = async () => {
      try {
        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();
        if (!detectData.success) return;

        const { languageCode, countryCode } = detectData;

        if (countryCode && CURRENCY_MAP[countryCode]) {
          setCurrency(CURRENCY_MAP[countryCode]);
        } else {
          setCurrency(CURRENCY_MAP.default);
        }

        if (languageCode === "en") return;

        const textKeys = Object.keys(DEFAULT_CONTENT);
        const textValues = Object.values(DEFAULT_CONTENT);
        const productTitles = products.map((p) => p._rawTitle);

        const allTexts = [...textValues, ...productTitles];

        const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texts: allTexts,
            targetLanguage: languageCode,
            sourceLanguage: "en",
          }),
        });
        const translateData = await translateRes.json();
        if (!translateData.success) return;

        const translatedStatic = translateData.translations.slice(0, textKeys.length);
        const translatedTitles = translateData.translations.slice(textKeys.length);

        const translatedContent = {};
        textKeys.forEach((key, i) => {
          translatedContent[key] = translatedStatic[i] || DEFAULT_CONTENT[key];
        });
        setContent(translatedContent);

        setProducts((prev) =>
          prev.map((p, i) => ({
            ...p,
            title: translatedTitles[i] || p.title,
          }))
        );
      } catch (err) {
        console.error("Translation/currency detect error:", err);
      }
    };

    detectAndTranslate();
  }, [products.length]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisibleItems(2);
      else if (window.innerWidth < 1024) setVisibleItems(2);
      else setVisibleItems(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    setInfiniteProducts([...products, ...products, ...products]);
    setCurrentIndex(products.length);
  }, [products]);

  // ── auto-slide ──
  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 4000);
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    startAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [products, startAutoSlide]);

  useEffect(() => {
    if (infiniteProducts.length === 0) return;

    let timeout;
    if (currentIndex >= infiniteProducts.length - visibleItems) {
      timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(products.length);
      }, 500);
    } else if (currentIndex <= 0) {
      timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(products.length);
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [currentIndex, visibleItems, infiniteProducts.length, products.length]);

  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => setIsTransitioning(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [isTransitioning]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  // ── product click: slider turant stop, phir navigate ──
  const handleProductClick = (url) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    router.push(url);
  };

  const toggleWishlist = useCallback(
    (id, productData) => {
      if (wishlist.includes(id)) {
        removeFromWishlistCtx(id);
      } else {
        addToWishlist(productData || { _id: id });
      }
    },
    [wishlist, addToWishlist, removeFromWishlistCtx]
  );

  const handleAddToCart = useCallback(
    (product, qty = 1) => {
      const cartItem = {
        _id: product._id,
        slug: product.slug,
        title: product.title,
        category: product.category,
        images: product.images || [],
        oldPrice: product.oldPrice,
        newPrice: product.newPrice,
        isSale: product.isSale,
        qty,
      };
      window.dispatchEvent(new CustomEvent("add-to-cart", { detail: { item: cartItem } }));
      setTimeout(() => window.dispatchEvent(new CustomEvent("open-cart-drawer")), 400);
      showToast(`"${product.title}" added to cart`);
    },
    [showToast]
  );

  const openQuickView = useCallback((product) => setQuickViewProduct(product), []);
  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

  // ── swipe handlers (manual slide, mobile/touch) ─────────────────────────────
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
    isSwipingRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleTouchMove = (e) => {
    if (!isSwipingRef.current) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;

    const SWIPE_THRESHOLD = 40; // px
    if (touchDeltaXRef.current > SWIPE_THRESHOLD) {
      prevSlide();
    } else if (touchDeltaXRef.current < -SWIPE_THRESHOLD) {
      nextSlide();
    }
    touchDeltaXRef.current = 0;
    startAutoSlide();
  };

  // ── render guards ──
  if (loading) {
    return (
      <section className="jewelry-collection-wrapper">
        <div className="collection-header">
          <h2 className="main-title">{DEFAULT_CONTENT.mainTitle}</h2>
        </div>
        {/* Skeleton cards */}
        <div
          style={{
            display: "flex",
            gap: 20,
            padding: "0 48px",
            overflow: "hidden",
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: "0 0 calc(25% - 15px)",
                borderRadius: 12,
                background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
                height: 340,
              }}
            />
          ))}
        </div>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </section>
    );
  }

  if (error || products.length === 0 || infiniteProducts.length === 0) return null;

  // ── main render ────────────────────────────────────────────────────────────
  return (
    <section className="jewelry-collection-wrapper">
      <Toast message={toast.message} visible={toast.visible} />

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          currency={currency}
          content={content}
          onClose={closeQuickView}
          onAddToCart={(product, qty) => {
            handleAddToCart(product, qty);
            closeQuickView();
          }}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
        />
      )}

      <div className="collection-header">
        <h2 className="main-title">{content.mainTitle}</h2>
        <div className="sub-text-block">
          <p>{content.subText1}</p>
          <p>{content.subText2}</p>
          <p>{content.subText3}</p>
        </div>
        <p className="description-paragraph">{content.description}</p>
        <h2 className="section-subtitle">{content.subtitle}</h2>
      </div>

      <div className="slider-container">
        <button className="nav-btn prev-btn" onClick={prevSlide} aria-label="Previous">
          &#8592;
        </button>

        <div
          className="slider-track-viewport"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="slider-track"
            style={{
              transform: `translateX(calc(-${currentIndex * (100 / visibleItems)}% - ${
                currentIndex * (20 / visibleItems)
              }px))`,
              transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
            }}
          >
            {infiniteProducts.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                style={{
                  flex: `0 0 calc(${100 / visibleItems}% - ${
                    (20 * (visibleItems - 1)) / visibleItems
                  }px)`,
                }}
              >
                <ProductCard
                  product={product}
                  content={content}
                  currency={currency}
                  wishlist={wishlist}
                  onToggleWishlist={toggleWishlist}
                  onQuickView={openQuickView}
                  onCardClick={handleProductClick}
                />
              </div>
            ))}
          </div>
        </div>

        <button className="nav-btn next-btn" onClick={nextSlide} aria-label="Next">
          &#8594;
        </button>
      </div>

      <div className="Shop-btn">
        <a href="/product-category/jewellery/">
          <button className="hero-btn">{content.shopButton}</button>
        </a>
      </div>
    </section>
  );
};

export default Collection;