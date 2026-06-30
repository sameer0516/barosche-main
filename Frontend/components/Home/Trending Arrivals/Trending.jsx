"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./Trending.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  mainTitle: "Jewellery To Live In. Latest Handmade Jewellery Collection",
  shopButton: "Shop The Collection",
  saleBadge: "SALE",
};

// Backend product ko slider-friendly format mein convert karta hai
const normalizeProduct = (p) => {
  const firstVariant = p.variants?.[0] || {};
  const primaryCategory = (p.categories?.[0] || p.category || "jewellery")
    .toLowerCase()
    .replace(/\s+/g, "-");

  // Price formatting — backend mein number hai, display ke liye ₹ lagao
  const fmtPrice = (n) =>
    n != null ? `€${Number(n).toLocaleString("en-IN")}` : "";

  return {
    id: p._id,
    title: firstVariant.title || p.title,
    oldPrice: fmtPrice(firstVariant.oldPrice),
    newPrice: fmtPrice(firstVariant.newPrice),
    image: firstVariant.images?.[0]
      ? `${BACKEND_URL}${firstVariant.images[0]}`
      : "/placeholder.jpg",
    isSale: firstVariant.isSale || false,
    url: `/product-category/${primaryCategory}/${p.slug}/`,
    _raw: p,
  };
};

const Trending = () => {
  const router = useRouter();

  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(4);
  const [infiniteProducts, setInfiniteProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const intervalRef = useRef(null);

  // ── swipe/touch refs (manual slide support) ────────────────────────────────
  const touchStartXRef = useRef(0);
  const touchDeltaXRef = useRef(0);
  const isSwipingRef = useRef(false);

  // ── 1. Backend se products fetch karo ──
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/products`);
        const data = await res.json();

        if (data.success && data.products?.length > 0) {
          // 🆕 Backend latest product ko pehle bhejta hai (newest-first).
          // Humein chahiye ki jo product sabse pehle add hua tha wahi pehle dikhe (oldest-first).
          // Agar product me createdAt field hai to usi se sahi tareeke se sort karo,
          // warna simply array ko reverse kar do (fallback).
          const hasCreatedAt = data.products.every((p) => p.createdAt);
          const finalOrder = hasCreatedAt
            ? [...data.products].sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt) // ascending = oldest first
              )
            : [...data.products].reverse();

          const normalized = finalOrder.map(normalizeProduct);
          setProducts(normalized);
          setCurrentIndex(normalized.length); // infinite clone ke liye middle set
        }
      } catch (err) {
        console.error("Products fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ── 2. Translation ──
  useEffect(() => {
    if (products.length === 0) return;

    const translateContent = async () => {
      try {
        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();
        if (!detectData.success) return;

        const { languageCode } = detectData;
        if (languageCode === "en") return;

        const textKeys = Object.keys(DEFAULT_CONTENT);
        const textValues = Object.values(DEFAULT_CONTENT);
        const productTitles = products.map((p) => p.title);
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

        const translatedTextValues = translateData.translations.slice(0, textKeys.length);
        const translatedTitles = translateData.translations.slice(textKeys.length);

        const translatedContent = {};
        textKeys.forEach((key, i) => {
          translatedContent[key] = translatedTextValues[i] || DEFAULT_CONTENT[key];
        });
        setContent(translatedContent);

        setProducts((prev) =>
          prev.map((p, i) => ({
            ...p,
            title: translatedTitles[i] || p.title,
          }))
        );
      } catch (err) {
        console.error("Translation error:", err);
      }
    };

    translateContent();
  }, [products.length]);

  // ── 3. Responsive visibleItems ──
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

  // ── 4. Infinite clone array banao jab products ready ho ──
  useEffect(() => {
    if (products.length === 0) return;
    setInfiniteProducts([...products, ...products, ...products]);
    setCurrentIndex(products.length);
  }, [products]);

  // ── 5. Auto slide ──
  useEffect(() => {
    if (infiniteProducts.length === 0) return;
    intervalRef.current = setInterval(() => nextSlide(), 4000);
    return () => clearInterval(intervalRef.current);
  }, [infiniteProducts.length, currentIndex]);

  // ── 6. Infinite loop reset ──
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

  const handleProductClick = (url) => router.push(url);

  // ── swipe handlers (manual slide, mobile/touch) ─────────────────────────────
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
    isSwipingRef.current = true;
    // pause auto-slide while user is interacting
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
    // auto-slide useEffect (#5) re-runs on currentIndex change and restarts the interval
  };

  // ── Skeleton loader ──
  if (loading) {
    return (
      <section className="jewelry-collection-wrapper">
        <div className="collection-header">
          <h1 className="main-title">{DEFAULT_CONTENT.mainTitle}</h1>
        </div>
        <div
          style={{
            display: "flex",
            gap: 20,
            padding: "0 60px",
            overflow: "hidden",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                flex: "0 0 calc(25% - 15px)",
                borderRadius: 12,
                overflow: "hidden",
                background: "#f0f0f0",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            >
              <div style={{ height: 280, background: "#e0e0e0" }} />
              <div style={{ padding: 16 }}>
                <div
                  style={{
                    height: 14,
                    background: "#e0e0e0",
                    borderRadius: 6,
                    marginBottom: 8,
                  }}
                />
                <div
                  style={{
                    height: 14,
                    width: "60%",
                    background: "#e0e0e0",
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (infiniteProducts.length === 0) return null;

  return (
    <section className="jewelry-collection-wrapper">
      <div className="collection-header">
        <h1 className="main-title">{content.mainTitle}</h1>
        {content.subText1 && (
          <div className="sub-text-block">
            <p>{content.subText1}</p>
            <p>{content.subText2}</p>
            <p>{content.subText3}</p>
          </div>
        )}
        {content.description && (
          <p className="description-paragraph">{content.description}</p>
        )}
        {content.subtitle && (
          <h2 className="section-subtitle">{content.subtitle}</h2>
        )}
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
                className="product-card"
                key={`${product.id}-${index}`}
                style={{
                  flex: `0 0 calc(${100 / visibleItems}% - ${
                    (20 * (visibleItems - 1)) / visibleItems
                  }px)`,
                  cursor: "pointer",
                }}
                onClick={() => handleProductClick(product.url)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleProductClick(product.url)}
                aria-label={`View ${product.title}`}
              >
                <div className="image-wrapper">
                  {product.isSale && (
                    <span className="sale-badge">{content.saleBadge}</span>
                  )}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="product-image"
                    draggable={false}
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg";
                    }}
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <div className="pricing">
                    <span className="old-price">{product.oldPrice}</span>
                    <span className="new-price">{product.newPrice}</span>
                  </div>
                </div>
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

export default Trending;
