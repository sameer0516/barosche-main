'use client'

import React, { useState, useRef, useEffect } from 'react';
import './Mens.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reviews from '../../../components/Home/Reviews/Reviews';

const categories = [
    { name: "Chosen" },
    { name: "Earrings" },
    { name: "For Today" },
    { name: "Jewellery" },
    { name: "Mens" },
    { name: "New" },
    { name: "Pendants" },
     { name: "Bracelets" },
    { name: "Rings" },
    { name: "Womens" },
];

// ─────────────────────────────────────────────────────────
//  CATEGORY NAME → URL SLUG MAP
// ─────────────────────────────────────────────────────────
const categorySlugMap = {
    "Chosen": "chosen-jewellery",
    "Earrings": "earrings",
    "For Today": "for-today-jewellery",
    "Jewellery": "jewellery",
    "Men": "mens",
    "Mens": "mens",
    "New": "new-in",
    "New In": "new-in",
    "Pendants": "pendants",
    "Bracelets": "bracelets",
    "Rings": "rings",
    "Women": "womens",
    "Womens": "womens",
};

// ─────────────────────────────────────────────────────────
//  FAQ DATA
// ─────────────────────────────────────────────────────────
const faqData = [
    { q: "What is mens jewellery?", a: "Mens jewellery includes stylish accessories like rings and modern fashion pieces designed to enhance men’s personal style and confidence." },
    { q: "Is mens jewellery popular today?", a: "Yes, <strong>mens jewellery online</strong> is a growing trend as modern men increasingly use accessories to express individuality and fashion sense." },
    { q: "What types of mens jewellery do you offer?", a: "We offer rings and modern accessories designed for everyday wear, formal occasions, and luxury styling." },
    { q: "What is luxury mens jewellery?", a: "<strong>Luxury mens jewellery</strong> refers to premium-quality designs crafted with fine materials, detailed finishing, and elegant aesthetics." },
    { q: "Can I buy mens jewellery online safely?", a: "Yes, you can safely <strong>buy mens jewellery online</strong> through our secure checkout and trusted shopping platform." },
    { q: "What are mens accessories jewellery pieces?", a: "These are fashion accessories such as rings and modern designs that complement different outfits and styles." },
    { q: "Is mens jewellery suitable for daily wear?", a: "Yes, many designs are lightweight, durable, and perfect for comfortable everyday use." },
    { q: "What are formal accessories for men?", a: "These are minimal and elegant jewellery pieces designed for professional and corporate settings." },
    { q: "Can I wear mens jewellery in the office?", a: "Yes, subtle and minimalist designs are perfect for office and business environments." },
    { q: "What makes mens luxury accessories special?", a: "They combine premium craftsmanship, modern design, and refined detailing for a sophisticated look." },
    { q: "Are your mens jewellery designs trendy?", a: "Yes, our collection includes the latest <strong>mens jewellery online</strong> trends and modern fashion styles." },
    { q: "Do you offer minimalist mens jewellery?", a: "Yes, we offer minimalist designs that focus on simplicity, elegance, and everyday comfort." },
    { q: "Are statement jewellery pieces available for men?", a: "Yes, our collection includes bold statement designs for men who prefer expressive styling." },
    { q: "Is mens jewellery a good gift option?", a: "Yes, it is a stylish and meaningful gift for birthdays, anniversaries, and special occasions." },
    { q: "What materials are used in mens jewellery?", a: "We use high-quality materials designed for durability, comfort, and long-lasting shine." },
    { q: "Can mens jewellery be worn at formal events?", a: "Yes, our <strong>formal accessories for men</strong> are perfect for weddings, meetings, and formal gatherings." },
    { q: "Is mens jewellery comfortable for long wear?", a: "Yes, our designs are lightweight and made for all-day comfort." },
    { q: "How do I style mens accessories jewellery?", a: "You can style them with casual, formal, or modern outfits depending on your look preference." },
    { q: "What is the difference between luxury and regular mens jewellery?", a: "Luxury mens jewellery offers premium craftsmanship, better materials, and more refined designs." },
    { q: "Why should I choose your mens jewellery collection?", a: "Because we offer a combination of <strong>mens jewellery online</strong>, premium design, comfort, and versatile styling for every occasion." }
];

// ─────────────────────────────────────────────────────────
//  MENS JEWELLERY CONTENT DATA
//  type: 'h' = heading, type: 'p' = paragraph
// ─────────────────────────────────────────────────────────
const mensJewelleryContent = [
    { type: 'h', text: "Mens Jewellery Online – Modern Style & Luxury Designs" },
    { type: 'p', text: "Explore premium <strong>mens jewellery online</strong> at Barosche, where modern design meets timeless sophistication. Today’s men use jewellery as a powerful expression of personality, confidence, and individual style, making it an essential part of modern fashion rather than just an accessory." },
    { type: 'p', text: "Our carefully curated collection includes everything from minimalist everyday pieces to bold statement designs that redefine contemporary masculinity. Each piece is thoughtfully crafted with attention to detail, comfort, and durability, ensuring long-lasting wear along with a refined, premium finish." },
    { type: 'p', text: "Designed for the modern lifestyle, our collection of <strong>mens accessories jewellery</strong> is suitable for work, casual outings, and formal events. Whether you prefer subtle elegance or a more expressive style, each design helps you elevate your overall appearance with confidence and effortless sophistication." },
    { type: 'p', text: "From clean, minimalist styles to modern statement pieces, our jewellery is created to blend seamlessly with different outfits and occasions. This versatility allows you to build a personal style that feels both modern and timeless." },
    { type: 'h', text: "Modern Mens Jewellery for Everyday Confidence" },
    { type: 'p', text: "Modern <strong>mens jewellery online</strong> is no longer just about accessories—it is about confidence, identity, and personal expression. Today’s fashion-forward men choose jewellery that reflects their personality while enhancing everyday style effortlessly." },
    { type: 'p', text: "Our collection is designed for real-life wearability, meaning every piece is suitable for daily use without compromising comfort or durability. Whether you are heading to work, meeting friends, or attending events, our jewellery ensures you always look refined and well-styled." },
    { type: 'p', text: "From subtle minimal designs to bold statement pieces, each item is created to help you build a strong and versatile personal style that works across every situation." },
    { type: 'h', text: "Shop Mens Jewellery Online with Modern Craftsmanship" },
    { type: 'p', text: "Discover a wide range of <strong>mens jewellery online</strong> crafted with precision, attention to detail, and a strong focus on comfort and durability. Each piece is thoughtfully designed to complement modern lifestyles while maintaining a premium and refined aesthetic that suits today’s fashion-forward men." },
    { type: 'p', text: "Our collection is built around the idea that jewellery should not only look good but also feel comfortable for everyday wear. Whether you are styling for work, casual outings, or special occasions, each design ensures a perfect balance of elegance and practicality." },
    { type: 'p', text: "Our jewellery focuses on:<br/>• Lightweight and comfortable wear for all-day use<br/>• Durable materials designed for long-lasting performance<br/>• Clean, modern, and masculine design aesthetics<br/>• Versatile styling suitable for both daily and occasion wear" },
    { type: 'p', text: "From minimal rings to refined accessories, every piece is created to enhance your personal style effortlessly while reflecting confidence, individuality, and modern sophistication." },
    { type: 'h', text: "Designed for Modern Masculinity & Style Evolution" },
    { type: 'p', text: "The concept of <strong>mens accessories jewellery</strong> has evolved significantly in modern fashion. It is no longer limited to traditional designs but now represents a bold expression of individuality and lifestyle." },
    { type: 'p', text: "Our collection is designed for men who appreciate clean aesthetics, modern structure, and timeless appeal. Each piece blends minimalism with sophistication, making it suitable for both professional and casual styling." },
    { type: 'p', text: "Key design focus includes:<br/>• Strong masculine aesthetics with modern detailing<br/>• Clean and structured design language<br/>• Balanced minimal and bold styling options<br/>• Everyday versatility across outfits" },
    { type: 'p', text: "This evolution in <strong>mens jewellery online</strong> ensures that men can express themselves confidently through fashion without overcomplicating their style." },
    { type: 'h', text: "Luxury Mens Jewellery for Everyday & Occasion Wear" },
    { type: 'p', text: "Our <strong>luxury mens jewellery</strong> collection is designed for men who value elegance, refinement, and modern sophistication. Each piece is crafted with premium attention to detail, combining high-quality materials with contemporary design aesthetics to create jewellery that feels both stylish and timeless." },
    { type: 'p', text: "This collection is made to suit every aspect of modern life, from daily wear to special occasions. Whether you are dressing for work, social events, or formal gatherings, these designs add a subtle yet powerful touch of sophistication to your overall look." },
    { type: 'p', text: "Luxury jewellery today is no longer limited to special occasions—it has become an essential part of everyday fashion. Our designs focus on delivering understated elegance that enhances your style without being overpowering, allowing you to express confidence and individuality with ease." },
    { type: 'p', text: "With a perfect balance of comfort, durability, and refined design, our <strong>luxury mens jewellery</strong> helps you maintain a polished appearance in every situation, making it a valuable addition to any modern wardrobe." },
    { type: 'h', text: "Formal Accessories for Men with Premium Styling" },
    { type: 'p', text: "A well-dressed man understands the importance of subtle details. Our <strong>formal accessories for men</strong> are designed to complement professional attire with elegance and restraint." },
    { type: 'p', text: "These pieces are ideal for office environments, business meetings, and formal gatherings where first impressions matter. Clean lines, smooth finishes, and minimal detailing ensure a polished and professional appearance." },
    { type: 'p', text: "Designed for:<br/>• Corporate and business settings<br/>• Formal events and presentations<br/>• Professional daily office wear" },
    { type: 'p', text: "Each accessory enhances your outfit while maintaining a sophisticated and understated look." },
    { type: 'h', text: "Luxury Mens Jewellery That Defines Refinement" },
    { type: 'p', text: "Our <strong>luxury mens jewellery</strong> collection is crafted for men who value sophistication, detail, and premium quality. Every design is created with precision, ensuring a perfect balance between elegance and durability." },
    { type: 'p', text: "Luxury jewellery today is about subtle impact rather than excess. Our pieces are designed to enhance your look without overpowering it, making them suitable for both everyday and occasion wear." },
    { type: 'p', text: "Whether paired with formal attire or casual outfits, luxury jewellery adds a refined edge that elevates your entire appearance with effortless confidence." },
    { type: 'h', text: "Mens Accessories Jewellery – Style with Confidence" },
    { type: 'p', text: "Upgrade your wardrobe with premium <strong>mens accessories jewellery</strong> designed to complement every outfit with effortless style and sophistication. Each piece is thoughtfully crafted to enhance your personality, whether you prefer a minimalist look or bold, statement-making designs." },
    { type: 'p', text: "Our collection is created for modern men who value versatility, allowing you to transition seamlessly between casual, professional, and formal settings while maintaining a refined appearance. Every design adds a subtle yet powerful touch that elevates your overall style." },
    { type: 'p', text: "Our collection includes:<br/>• Minimalist rings for subtle elegance and everyday wear<br/>• Statement designs for bold and confident styling<br/>• Versatile accessories suitable for daily use and multiple occasions<br/>• Contemporary, fashion-forward pieces inspired by modern trends" },
    { type: 'p', text: "These carefully designed pieces allow you to express individuality while maintaining a polished, balanced, and modern appearance. With a strong focus on quality, comfort, and craftsmanship, our <strong>mens accessories jewellery</strong> ensures you always look confident and well-styled." },
    { type: 'h', text: "Mens Luxury Accessories – Refined & Contemporary Styling" },
    { type: 'p', text: "Our <strong>mens luxury accessories</strong> collection is thoughtfully crafted for modern men who appreciate sophistication, precision, and attention to detail. Each piece is designed to enhance your overall look effortlessly while maintaining a clean, elegant, and contemporary finish that suits today’s style standards." },
    { type: 'p', text: "This collection focuses on delivering a refined balance between minimalism and statement design, allowing you to express your personality with confidence in any setting. Whether for everyday wear or special occasions, these accessories elevate your appearance with subtle luxury." },
    { type: 'p', text: "Key highlights include:<br/>• Premium craftsmanship with refined detailing<br/>• High-quality materials ensuring durability and long-lasting wear<br/>• Versatile designs suitable for multiple occasions<br/>• Balanced mix of minimalist and statement styles" },
    { type: 'p', text: "Each piece is carefully designed to transition seamlessly from casual outfits to formal attire, making our <strong>mens luxury accessories</strong> a versatile and essential part of the modern wardrobe." },
    { type: 'h', text: "Versatile Jewellery for Every Occasion" },
    { type: 'p', text: "Our <strong>mens jewellery online</strong> collection is built around versatility, ensuring that every piece adapts to different moments of your life. From casual wear to formal occasions, our designs transition effortlessly across styles." },
    { type: 'p', text: "You can style our jewellery for:<br/>• Daily wear and casual outings<br/>• Office and business meetings<br/>• Parties and social events<br/>• Weddings and celebrations<br/>• Fashion-forward styling combinations" },
    { type: 'p', text: "This versatility makes our <strong>mens luxury accessories</strong> collection an essential part of every modern wardrobe." },
    { type: 'h', text: "Formal Accessories for Men – Professional & Elegant Look" },
    { type: 'p', text: "Our <strong>formal accessories for men</strong> are designed to create a polished, confident, and professional appearance for modern lifestyles. Crafted with a focus on subtle elegance and refined detailing, these pieces enhance formal attire without overpowering your overall look, ensuring a balanced and sophisticated finish." },
    { type: 'p', text: "Each design reflects a clean and minimal aesthetic, making it ideal for men who prefer understated style with a premium touch. Whether paired with suits, office wear, or formal ensembles, these accessories add a refined edge that elevates your presence effortlessly." },
    { type: 'p', text: "Ideal for:<br/>• Business meetings and corporate presentations<br/>• Corporate environments and daily office wear<br/>• Formal events, gatherings, and professional occasions" },
    { type: 'p', text: "With minimal designs, smooth finishes, and clean structural elements, every piece is created to deliver a refined appearance that reflects confidence, professionalism, and attention to detail. Our <strong>formal accessories for men</strong> ensure you always present yourself with a strong and elegant impression." },
    { type: 'h', text: "Shop Mens Jewellery Online with a Trusted Experience" },
    { type: 'p', text: "Buying <strong>mens jewellery online</strong> should be simple, secure, and reliable. That is why our platform is designed to provide a smooth shopping experience from browsing to checkout." },
    { type: 'p', text: "We ensure a customer-first approach with clear product presentation and safe transactions, helping you make confident decisions every time you shop." },
    { type: 'p', text: "We provide:<br/>• Secure and encrypted checkout system<br/>• High-resolution product visuals<br/>• Clear and detailed product descriptions<br/>• Fast and reliable delivery service<br/>• Easy browsing and category navigation" },
    { type: 'p', text: "Whether you are exploring <strong>mens accessories jewellery</strong> or upgrading your personal style, our platform ensures a seamless and trustworthy experience." },
    { type: 'h', text: "Why Choose Our Mens Jewellery Collection" },
    { type: 'p', text: "Our <strong>mens jewellery collection</strong> is thoughtfully designed for modern lifestyles where style, comfort, and versatility are equally important. Each piece is crafted to meet high standards of quality, ensuring a refined balance between durability, aesthetics, and everyday usability." },
    { type: 'p', text: "We focus on creating jewellery that not only enhances your appearance but also integrates seamlessly into your daily life. From minimal essentials to bold statement pieces, our designs are made to complement different outfits, occasions, and personal style preferences." },
    { type: 'p', text: "We focus on:<br/>• Premium craftsmanship with refined finishing<br/>• Modern and trend-driven designs inspired by contemporary fashion<br/>• Comfortable everyday wear suitable for long hours<br/>• Versatile styling options for both casual and formal looks" },
    { type: 'p', text: "Each piece is carefully created to deliver long-lasting value while enhancing your personal style with confidence, sophistication, and a modern edge." },
    { type: 'h', text: "Shop Mens Accessories Jewellery Online with Confidence" },
    { type: 'p', text: "Shopping for <strong>mens accessories jewellery online</strong> has never been easier. Our platform offers a seamless experience where you can explore, compare, and purchase jewellery with complete confidence." },
    { type: 'p', text: "We ensure:<br/>• Secure checkout and payments<br/>• High-quality product images and descriptions<br/>• Easy browsing and navigation<br/>• Reliable and timely delivery" },
    { type: 'p', text: "Whether you're upgrading your style or gifting someone special, our platform makes the experience smooth and trustworthy for anyone looking to <a href='/product-category/jewellery/' style='color: #007bff; text-decoration: underline;'>buy jewellery online</a>." }
];

const TOP_OFFSET = 40;
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ─────────────────────────────────────────────────────────
//  HELPER: extract first variant's data safely
// ─────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────
//  ACCORDION ITEM – reusable
// ─────────────────────────────────────────────────────────
function AccordionItem({ title, children }) {
    const [open, setOpen] = useState(false);
    const bodyRef = useRef(null);

    return (
        <div className="jw-accordion-item">
            <button
                className={`jw-accordion-trigger ${open ? 'jw-accordion-trigger--open' : ''}`}
                onClick={() => setOpen(!open)}
                aria-expanded={open}
            >
                <span className="jw-accordion-arrow">
                    <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                </span>
                <span>{title}</span>
            </button>
            <div
                ref={bodyRef}
                className="jw-accordion-body"
                style={{
                    maxHeight: open ? bodyRef.current?.scrollHeight + 'px' : '0px',
                }}
            >
                <div className="jw-accordion-content">
                    {children}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
//  PRODUCT CARD
//  Uses product's own category slug for correct URL
// ─────────────────────────────────────────────────────────
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
            : '/placeholder.jpg';

    const oldPrice = variant.oldPrice;
    const newPrice = variant.newPrice;
    const isSale   = variant.isSale;

    // Use product's own category to build correct URL
    const categoryUrl = categorySlugMap[p.category] || 'mens';

    return (
        <Link
            href={`/product-category/${categoryUrl}/${p.slug}`}
            className="jw-card"
            onMouseEnter={startHover}
            onMouseLeave={stopHover}
        >
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">SALE</span>}

                <img
                    src={imgSrc}
                    alt={p.title}
                    className="jw-card-img"
                    loading="lazy"
                    onError={(e) => { e.target.src = '/placeholder.jpg'; }}
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

// ─────────────────────────────────────────────────────────
//  SKELETON CARD
// ─────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────
//  MAIN MENS PAGE
// ─────────────────────────────────────────────────────────
export default function Mens() {
    const router = useRouter();

    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Mens");

    const [perPage, setPerPage] = useState(30);
    const [sort, setSort] = useState("default");
    const [wishlist, setWishlist] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const layoutRef = useRef(null);
    const sidebarRef = useRef(null);

    // ─────────────────────────────────────────────────────────
    //  Category click → update state + navigate to correct URL
    // ─────────────────────────────────────────────────────────
    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        const urlSlug = categorySlugMap[categoryName] || 'mens';
        router.push(`/product-category/${urlSlug}`);
    };

    // ── Backend Data Fetching ──
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const queryParams = new URLSearchParams();
                if (activeCategory) {
                    queryParams.append('category', activeCategory);
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
                    throw new Error(data.message || 'Failed to fetch data.');
                }
            } catch (err) {
                console.error('Fetch Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [activeCategory]);

    // ── Client Side Sorting ──
    const sortedProducts = [...products].sort((a, b) => {
        const aPrice = getFirstVariant(a).newPrice || 0;
        const bPrice = getFirstVariant(b).newPrice || 0;

        if (sort === 'price-asc')  return aPrice - bPrice;
        if (sort === 'price-desc') return bPrice - aPrice;
        if (sort === 'newest')     return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
    });

    // ── Client Side Price Range Filtering ──
    const filtered = sortedProducts.filter((p) => {
        if (!activePrice) return true;
        const range = prices.find((pr) => pr.label === activePrice);
        if (!range) return true;
        const price = getFirstVariant(p).newPrice || 0;
        return price >= range.min && price <= range.max;
    });

    const displayed = filtered.slice(0, perPage);

    // ── JS Sticky Sidebar Logic ──
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

            const scrollY    = window.scrollY;
            const layoutTop  = layout.offsetTop;
            const layoutH    = layout.offsetHeight;
            const sidebarH   = sidebar.offsetHeight;
            const sidebarW   = sidebar.parentElement?.offsetWidth || sidebar.offsetWidth;
            const paddingBot = parseFloat(window.getComputedStyle(layout).paddingBottom) || 0;
            const contentH   = layoutH - paddingBot;
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
                                                    onClick={() => handleCategoryClick(c.name)}
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

                        </div>
                    </aside>
                </div>

                <main className="jw-main">

                    <h1 className="jw-title">
                        Modern Luxury Men's Jewellery & Accessories Collection
                    </h1>

                    {/* ── Toolbar ── */}
                    <div className="jw-toolbar">
                        <span className="jw-results-count">
                            {loading
                                ? 'Loading...'
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
                               
                            </div>
                        )}
                    </div>

                    {/* ─────────────────────────────────────────────────────────
                         BOTTOM ACCORDION SECTIONS
                    ───────────────────────────────────────────────────────── */}

                </main>
            </div>
             <Reviews/>

               <div className="jw-bottom-accordions">

                        {/* ── Mens Jewellery Content ── */}
                        <AccordionItem title="Mens Jewellery">
                            <div className="jw-accordion-text">
                                {mensJewelleryContent.map((item, i) =>
                                    item.type === 'h'
                                        ? <h3 key={i} className="jw-accordion-heading" dangerouslySetInnerHTML={{ __html: item.text }} />
                                        : <p key={i} dangerouslySetInnerHTML={{ __html: item.text }} />
                                )}
                            </div>
                        </AccordionItem>

                        {/* ── FAQ ── */}
                        <AccordionItem title="Frequently Asked Questions">
                            <div className="jw-faq-list">
                                {faqData.map((item, i) => (
                                    <div key={i} className="jw-faq-item">
                                        <p className="jw-faq-q" dangerouslySetInnerHTML={{ __html: `${i + 1}. ${item.q}` }} />
                                        <p className="jw-faq-a" dangerouslySetInnerHTML={{ __html: item.a }} />
                                    </div>
                                ))}
                            </div>
                        </AccordionItem>

                    </div>
                    {/* ── END BOTTOM ACCORDIONS ── */}
        </div>
    );
}