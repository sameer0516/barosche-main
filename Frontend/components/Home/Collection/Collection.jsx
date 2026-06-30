"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import "./Collection.css";

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
};

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Converts a backend product document into the flat shape the slider needs.
 * Uses the first variant's images + pricing, falls back gracefully.
 */
const normaliseProduct = (p) => {
  const v = p.variants?.[0] || {};
  const primaryCategory =
    (p.categories?.[0] || p.category || "jewellery")
      .toLowerCase()
      .replace(/\s+/g, "-");

  // Build the storefront URL the same way the rest of the site does:
  //   /product-category/<category>/<slug>/
  const url = `/product-category/${primaryCategory}/${p.slug}/`;

  const imageUrl = v.images?.[0]
    ? `${BACKEND_URL}${v.images[0]}`
    : null;

  return {
    id: p._id,
    title: v.title || p.title,
    oldPrice: v.oldPrice ? `€${Number(v.oldPrice).toLocaleString("en-IN")}` : "",
    newPrice: v.newPrice ? `€${Number(v.newPrice).toLocaleString("en-IN")}` : "",
    image: imageUrl,
    isSale: v.isSale || false,
    url,
    // keep raw fields for translation
    _rawTitle: v.title || p.title,
  };
};

// ─── component ───────────────────────────────────────────────────────────────

const Collection = () => {
  const router = useRouter();

  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [visibleItems, setVisibleItems] = useState(4);
  const [infiniteProducts, setInfiniteProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const intervalRef = useRef(null);

  // ── 1. Fetch latest 7 products from backend ────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
       
        const res = await fetch(`${BACKEND_URL}/api/products`);
        const data = await res.json();

        if (!data.success) throw new Error(data.message || "Failed to fetch products");

        // Sort newest-first, take 7
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

    // Poll every 60 s so newly-added products appear without a manual refresh
    const poll = setInterval(fetchProducts, 60_000);
    return () => clearInterval(poll);
  }, []);

  // ── 2. Translation ─────────────────────────────────────────────────────────
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
          prev.map((p, i) => ({ ...p, title: translatedTitles[i] || p.title }))
        );
      } catch (err) {
        console.error("Translation error:", err);
      }
    };

    translateContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]); // only re-translate when product list length changes

  // ── 3. Responsive visible items ────────────────────────────────────────────
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

  // ── 4. Build infinite product list ────────────────────────────────────────
  useEffect(() => {
    if (products.length === 0) return;
    setInfiniteProducts([...products, ...products, ...products]);
    setCurrentIndex(products.length); // start in the "middle" clone
  }, [products]);

  // ── 5. Auto-slide ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (products.length === 0) return;

    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
    }, 4000);

    return () => clearInterval(intervalRef.current);
  }, [products]);

  // ── 6. Infinite-loop reset ─────────────────────────────────────────────────
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

  // ── handlers ───────────────────────────────────────────────────────────────
  const nextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleProductClick = (url) => {
    router.push(url);
  };

  // ── render guards ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="jewelry-collection-wrapper">
        <div className="collection-header">
          <h1 className="main-title">{DEFAULT_CONTENT.mainTitle}</h1>
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
      <div className="collection-header">
        <h1 className="main-title">{content.mainTitle}</h1>
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

        <div className="slider-track-viewport">
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
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="product-image"
                    />
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
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <div className="pricing">
                    {product.oldPrice && (
                      <span className="old-price">{product.oldPrice}</span>
                    )}
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

export default Collection;