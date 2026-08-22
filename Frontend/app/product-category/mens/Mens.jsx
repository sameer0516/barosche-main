'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './Mens.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reviews from '../../../components/Home/Reviews/Reviews';
import { useWishlist } from '../../context/WishlistContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

// ─────────────────────────────────────────────────────────
//  CURRENCY CONFIG — country-based price display
// ─────────────────────────────────────────────────────────
const CURRENCY_MAP = {
    US: { code: 'USD', symbol: '$', rate: 1.08 },
    GB: { code: 'GBP', symbol: '£', rate: 0.85 },
    IN: { code: 'INR', symbol: '₹', rate: 90.5 },
    AE: { code: 'AED', symbol: 'AED', rate: 3.97 },
    AU: { code: 'AUD', symbol: 'A$', rate: 1.65 },
    CA: { code: 'CAD', symbol: 'C$', rate: 1.47 },
    SG: { code: 'SGD', symbol: 'S$', rate: 1.45 },
    JP: { code: 'JPY', symbol: '¥', rate: 162 },
    CH: { code: 'CHF', symbol: 'CHF', rate: 0.97 },
    default: { code: 'EUR', symbol: '€', rate: 1 },
};

function formatPrice(eurPrice, currency) {
    if (!eurPrice && eurPrice !== 0) return null;
    const converted = Math.round(Number(eurPrice) * currency.rate);
    if (currency.code === 'JPY') return `${currency.symbol}${converted.toLocaleString()}`;
    if (currency.code === 'INR') return `${currency.symbol}${converted.toLocaleString('en-IN')}`;
    return `${currency.symbol}${converted.toLocaleString()}`;
}

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

const prices = [
    { label: "Under ₹5,000", min: 0, max: 5000 },
    { label: "₹5,000 - ₹15,000", min: 5000, max: 15000 },
    { label: "₹15,000 - ₹30,000", min: 15000, max: 30000 },
    { label: "Above ₹30,000", min: 30000, max: Infinity },
];

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
    { type: 'p', text: "<strong>Our jewellery focuses on:</strong>" },
    { type: 'p', text: "• Lightweight and comfortable wear for all-day use<br/>• Durable materials designed for long-lasting performance<br/>• Clean, modern, and masculine design aesthetics<br/>• Versatile styling suitable for both daily and occasion wear" },
    { type: 'p', text: "From minimal rings to refined accessories, every piece is created to enhance your personal style effortlessly while reflecting confidence, individuality, and modern sophistication." },
    { type: 'h', text: "Designed for Modern Masculinity & Style Evolution" },
    { type: 'p', text: "The concept of <strong>mens accessories jewellery</strong> has evolved significantly in modern fashion. It is no longer limited to traditional designs but now represents a bold expression of individuality and lifestyle." },
    { type: 'p', text: "Our collection is designed for men who appreciate clean aesthetics, modern structure, and timeless appeal. Each piece blends minimalism with sophistication, making it suitable for both professional and casual styling." },
    { type: 'p', text: "<strong>Key design focuses include the following:</strong>" },
    { type: 'p', text: "• Strong masculine aesthetics with modern detailing<br/>• Clean and structured design language<br/>• Balanced minimal and bold styling options<br/>• Everyday versatility across outfits" },
    { type: 'p', text: "This evolution in <strong>mens jewellery online</strong> ensures that men can express themselves confidently through fashion without overcomplicating their style." },
    { type: 'h', text: "Luxury Mens Jewellery for Everyday & Occasion Wear" },
    { type: 'p', text: "Our <strong>luxury mens jewellery</strong> collection is designed for men who value elegance, refinement, and modern sophistication. Each piece is crafted with premium attention to detail, combining high-quality materials with contemporary design aesthetics to create jewellery that feels both stylish and timeless." },
    { type: 'p', text: "This collection is made to suit every aspect of modern life, from daily wear to special occasions. Whether you are dressing for work, social events, or formal gatherings, these designs add a subtle yet powerful touch of sophistication to your overall look." },
    { type: 'p', text: "Luxury jewellery today is no longer limited to special occasions—it has become an essential part of everyday fashion. Our designs focus on delivering understated elegance that enhances your style without being overpowering, allowing you to express confidence and individuality with ease." },
    { type: 'p', text: "With a perfect balance of comfort, durability, and refined design, our <strong>luxury mens jewellery</strong> helps you maintain a polished appearance in every situation, making it a valuable addition to any modern wardrobe." },
    { type: 'h', text: "Formal Accessories for Men with Premium Styling" },
    { type: 'p', text: "A well-dressed man understands the importance of subtle details. Our <strong>formal accessories for men</strong> are designed to complement professional attire with elegance and restraint." },
    { type: 'p', text: "These pieces are ideal for office environments, business meetings, and formal gatherings where first impressions matter. Clean lines, smooth finishes, and minimal detailing ensure a polished and professional appearance." },
    { type: 'p', text: "<strong>Designed for:</strong>" },
    { type: 'p', text: "• Corporate and business settings<br/>• Formal events and presentations<br/>• Professional daily office wear" },
    { type: 'p', text: "Each accessory enhances your outfit while maintaining a sophisticated and understated look." },
    { type: 'h', text: "Luxury Mens Jewellery That Defines Refinement" },
    { type: 'p', text: "Our <strong>luxury mens jewellery</strong> collection is crafted for men who value sophistication, detail, and premium quality. Every design is created with precision, ensuring a perfect balance between elegance and durability." },
    { type: 'p', text: "Luxury jewellery today is about subtle impact rather than excess. Our pieces are designed to enhance your look without overpowering it, making them suitable for both everyday and occasion wear." },
    { type: 'p', text: "Whether paired with formal attire or casual outfits, luxury jewellery adds a refined edge that elevates your entire appearance with effortless confidence." },
    { type: 'h', text: "Mens Accessories Jewellery – Style with Confidence" },
    { type: 'p', text: "Upgrade your wardrobe with premium <strong>mens accessories jewellery</strong> designed to complement every outfit with effortless style and sophistication. Each piece is thoughtfully crafted to enhance your personality, whether you prefer a minimalist look or bold, statement-making designs." },
    { type: 'p', text: "Our collection is created for modern men who value versatility, allowing you to transition seamlessly between casual, professional, and formal settings while maintaining a refined appearance. Every design adds a subtle yet powerful touch that elevates your overall style." },
    { type: 'p', text: "<strong>Our collection includes:</strong>" },
    { type: 'p', text: "• Minimalist rings for subtle elegance and everyday wear<br/>• Statement designs for bold and confident styling<br/>• Versatile accessories suitable for daily use and multiple occasions<br/>• Contemporary, fashion-forward pieces inspired by modern trends" },
    { type: 'p', text: "These carefully designed pieces allow you to express individuality while maintaining a polished, balanced, and modern appearance. With a strong focus on quality, comfort, and craftsmanship, our <strong>mens accessories jewellery</strong> ensures you always look confident and well-styled." },
    { type: 'h', text: "Mens Luxury Accessories – Refined & Contemporary Styling" },
    { type: 'p', text: "Our <strong>mens luxury accessories</strong> collection is thoughtfully crafted for modern men who appreciate sophistication, precision, and attention to detail. Each piece is designed to enhance your overall look effortlessly while maintaining a clean, elegant, and contemporary finish that suits today’s style standards." },
    { type: 'p', text: "This collection focuses on delivering a refined balance between minimalism and statement design, allowing you to express your personality with confidence in any setting. Whether for everyday wear or special occasions, these accessories elevate your appearance with subtle luxury." },
    { type: 'p', text: "<strong>Key highlights include:</strong>" },
    { type: 'p', text: "• Premium craftsmanship with refined detailing<br/>• High-quality materials ensuring durability and long-lasting wear<br/>• Versatile designs suitable for multiple occasions<br/>• Balanced mix of minimalist and statement styles" },
    { type: 'p', text: "Each piece is carefully designed to transition seamlessly from casual outfits to formal attire, making our <strong>mens luxury accessories</strong> a versatile and essential part of the modern wardrobe." },
    { type: 'h', text: "Versatile Jewellery for Every Occasion" },
    { type: 'p', text: "Our <strong>mens jewellery online</strong> collection is built around versatility, ensuring that every piece adapts to different moments of your life. From casual wear to formal occasions, our designs transition effortlessly across styles." },
    { type: 'p', text: "<strong>You can style our jewellery for:</strong>" },
    { type: 'p', text: "• Daily wear and casual outings<br/>• Office and business meetings<br/>• Parties and social events<br/>• Weddings and celebrations<br/>• Fashion-forward styling combinations" },
    { type: 'p', text: "This versatility makes our <strong>mens luxury accessories</strong> collection an essential part of every modern wardrobe." },
    { type: 'h', text: "Formal Accessories for Men – Professional & Elegant Look" },
    { type: 'p', text: "Our <strong>formal accessories for men</strong> are designed to create a polished, confident, and professional appearance for modern lifestyles. Crafted with a focus on subtle elegance and refined detailing, these pieces enhance formal attire without overpowering your overall look, ensuring a balanced and sophisticated finish." },
    { type: 'p', text: "Each design reflects a clean and minimal aesthetic, making it ideal for men who prefer understated style with a premium touch. Whether paired with suits, office wear, or formal ensembles, these accessories add a refined edge that elevates your presence effortlessly." },
    { type: 'p', text: "<strong>Ideal for:</strong>" },
    { type: 'p', text: "• Business meetings and corporate presentations<br/>• Corporate environments and daily office wear<br/>• Formal events, gatherings, and professional occasions" },
    { type: 'p', text: "With minimal designs, smooth finishes, and clean structural elements, every piece is created to deliver a refined appearance that reflects confidence, professionalism, and attention to detail. Our <strong>formal accessories for men</strong> ensure you always present yourself with a strong and elegant impression." },
    { type: 'h', text: "Shop Mens Jewellery Online with a Trusted Experience" },
    { type: 'p', text: "Buying <strong>mens jewellery online</strong> should be simple, secure, and reliable. That is why our platform is designed to provide a smooth shopping experience from browsing to checkout." },
    { type: 'p', text: "We ensure a customer-first approach with clear product presentation and safe transactions, helping you make confident decisions every time you shop." },
    { type: 'p', text: "<strong>We provide:</strong>" },
    { type: 'p', text: "• Secure and encrypted checkout system<br/>• High-resolution product visuals<br/>• Clear and detailed product descriptions<br/>• Fast and reliable delivery service<br/>• Easy browsing and category navigation" },
    { type: 'p', text: "Whether you are exploring <strong>mens accessories jewellery</strong> or upgrading your personal style, our platform ensures a seamless and trustworthy experience." },
    { type: 'h', text: "Why Choose Our Mens Jewellery Collection" },
    { type: 'p', text: "Our <strong>mens jewellery collection</strong> is thoughtfully designed for modern lifestyles where style, comfort, and versatility are equally important. Each piece is crafted to meet high standards of quality, ensuring a refined balance between durability, aesthetics, and everyday usability." },
    { type: 'p', text: "We focus on creating jewellery that not only enhances your appearance but also integrates seamlessly into your daily life. From minimal essentials to bold statement pieces, our designs are made to complement different outfits, occasions, and personal style preferences." },
    { type: 'p', text: "<strong>We focus on:</strong>" },
    { type: 'p', text: "• Premium craftsmanship with refined finishing<br/>• Modern and trend-driven designs inspired by contemporary fashion<br/>• Comfortable everyday wear suitable for long hours<br/>• Versatile styling options for both casual and formal looks" },
    { type: 'p', text: "Each piece is carefully created to deliver long-lasting value while enhancing your personal style with confidence, sophistication, and a modern edge." },
    { type: 'h', text: "Shop Mens Accessories Jewellery Online with Confidence" },
    { type: 'p', text: "Shopping for <strong>mens accessories jewellery online</strong> has never been easier. Our platform offers a seamless experience where you can explore, compare, and purchase jewellery with complete confidence." },
    { type: 'p', text: "<strong>We ensure:</strong>" },
    { type: 'p', text: "• Secure checkout and payments<br/>• High-quality product images and descriptions<br/>• Easy browsing and navigation<br/>• Reliable and timely delivery" },
    { type: 'p', text: "Whether you're upgrading your style or gifting someone special, our platform makes the experience smooth and trustworthy for anyone looking to <a href='/product-category/jewellery/' style='color: #007bff; text-decoration: underline;'>buy jewellery online</a>." }
];

const TOP_OFFSET = 40;
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// ── Helper — ab videos bhi return karega (Rings.js jaisa pattern) ──
function getFirstVariant(product) {
    if (product.variants && product.variants.length > 0) {
        return product.variants[0];
    }
    return {
        images: product.images || [],
        videos: product.videos || [],
        oldPrice: product.oldPrice,
        newPrice: product.newPrice,
        isSale: product.isSale || false,
        inStock: product.inStock ?? true,
    };
}

// ─────────────────────────────────────────────────────────
//  TOAST NOTIFICATION
// ─────────────────────────────────────────────────────────
function Toast({ message, visible }) {
    if (!visible) return null;
    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1a1a1a',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '4px',
            fontSize: '14px',
            zIndex: 9999,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'opacity 0.3s ease',
            opacity: visible ? 1 : 0,
        }}>
            {message}
        </div>
    );
}

// ─────────────────────────────────────────────────────────
//  QUICK VIEW MODAL — image + video support (Rings.js pattern)
// ─────────────────────────────────────────────────────────
function QuickViewModal({ product, currency, onClose, onAddToCart, wishlist, onToggleWishlist }) {
    const [qty, setQty] = useState(1);
    const variant = getFirstVariant(product);
    const images = variant.images || [];
    const videos = variant.videos || [];
    const categoryUrl = categorySlugMap[product.category] || 'mens';

    // ── mediaList: pehli image, phir video (agar hai), phir baaki images ──
    const mediaList = useMemo(() => {
        const list = [];
        if (images.length > 0) list.push({ type: 'image', src: images[0] });
        if (videos.length > 0) list.push({ type: 'video', src: videos[0] });
        images.slice(1).forEach((img) => list.push({ type: 'image', src: img }));
        return list;
    }, [images, videos]);

    const [activeIdx, setActiveIdx] = useState(0);
    const videoRef = useRef(null);
    const activeItem = mediaList[activeIdx] || null;

    // Jab active slide video ho, use play karo (aur reset se)
    useEffect(() => {
        if (activeItem?.type === 'video' && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
        }
    }, [activeIdx, activeItem]);

    // Modal band hote hi video pause ho jaye
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.pause();
            }
        };
    }, [activeIdx]);

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9000,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff', borderRadius: '8px',
                    maxWidth: '860px', width: '100%',
                    maxHeight: '90vh', overflow: 'auto',
                    display: 'flex', flexDirection: 'row',
                    position: 'relative',
                    flexWrap: 'wrap',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '12px', right: '16px',
                        background: 'none', border: 'none', fontSize: '22px',
                        cursor: 'pointer', color: '#555', zIndex: 1, lineHeight: 1,
                    }}
                    aria-label="Close"
                >✕</button>

                {/* Images / Video */}
                <div style={{ flex: '1 1 300px', minWidth: '240px', padding: '24px 16px 24px 24px' }}>
                    <div style={{
                        background: '#f7f6f4', borderRadius: '6px',
                        aspectRatio: '1/1', overflow: 'hidden', marginBottom: '12px',
                    }}>
                        {activeItem ? (
                            activeItem.type === 'video' ? (
                                <video
                                    ref={videoRef}
                                    src={`${API_BASE}${activeItem.src}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    muted
                                    playsInline
                                    loop
                                    controls
                                />
                            ) : (
                                <img
                                    src={`${API_BASE}${activeItem.src}`}
                                    alt={product.title || product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                />
                            )
                        ) : (
                            <img src="/placeholder.jpg" alt="placeholder"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                    </div>
                    {mediaList.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {mediaList.map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIdx(i)}
                                    style={{
                                        width: '54px', height: '54px', padding: 0,
                                        border: i === activeIdx ? '2px solid #1a1a1a' : '2px solid transparent',
                                        borderRadius: '4px', overflow: 'hidden', cursor: 'pointer',
                                        background: '#f7f6f4', position: 'relative',
                                    }}
                                >
                                    {item.type === 'video' ? (
                                        <>
                                            <video
                                                src={`${API_BASE}${item.src}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                muted
                                                playsInline
                                            />
                                            <span style={{
                                                position: 'absolute', inset: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'rgba(0,0,0,0.25)', pointerEvents: 'none',
                                            }}>
                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="#fff">
                                                    <path d="M4 2.5v11l10-5.5-10-5.5z" />
                                                </svg>
                                            </span>
                                        </>
                                    ) : (
                                        <img
                                            src={`${API_BASE}${item.src}`}
                                            alt={`view ${i + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div style={{ flex: '1 1 280px', padding: '32px 24px 24px 16px', minWidth: '240px' }}>
                    {variant.isSale && (
                        <span style={{
                            background: '#1a1a1a', color: '#fff',
                            fontSize: '11px', letterSpacing: '1px',
                            padding: '3px 8px', borderRadius: '2px',
                            display: 'inline-block', marginBottom: '10px',
                        }}>SALE</span>
                    )}
                    <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>
                        {product.category}
                    </p>
                    <h2 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 14px', lineHeight: 1.3 }}>
                        {product.title || product.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                        {variant.oldPrice && (
                            <span style={{ fontSize: '15px', color: '#aaa', textDecoration: 'line-through' }}>
                                {formatPrice(variant.oldPrice, currency)}
                            </span>
                        )}
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>
                            {variant.newPrice !== null && variant.newPrice !== undefined
                                ? formatPrice(variant.newPrice, currency)
                                : 'Price on request'}
                        </span>
                    </div>
                    {product.description && (
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                            {product.description}
                        </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '13px', color: '#555' }}>Qty:</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <button
                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
                            >−</button>
                            <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '14px' }}>{qty}</span>
                            <button
                                onClick={() => setQty(q => q + 1)}
                                style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}
                            >+</button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            onClick={() => onAddToCart(product, qty)}
                            style={{
                                background: '#1a1a1a', color: '#fff',
                                border: 'none', padding: '13px 20px',
                                fontSize: '13px', letterSpacing: '0.5px',
                                cursor: 'pointer', borderRadius: '4px',
                                textTransform: 'uppercase',
                            }}
                        >Add to Cart</button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => onToggleWishlist(product._id, {
                                    _id: product._id,
                                    slug: product.slug,
                                    title: product.title || product.name,
                                    category: product.category,
                                    images: variant.images || [],
                                    oldPrice: variant.oldPrice,
                                    newPrice: variant.newPrice,
                                    isSale: variant.isSale,
                                })}
                                style={{
                                    flex: 1,
                                    border: '1px solid #ddd', background: '#fff',
                                    padding: '11px 12px', borderRadius: '4px',
                                    fontSize: '13px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    color: wishlist.includes(product._id) ? '#c0392b' : '#555',
                                }}
                            >
                                <svg width="15" height="14" viewBox="0 0 16 15" fill="none">
                                    <path d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z"
                                        stroke="currentColor" strokeWidth="1.3"
                                        fill={wishlist.includes(product._id) ? 'currentColor' : 'none'} />
                                </svg>
                                Add to Wishlist
                            </button>
                            <Link
                                href={`/product-category/${categoryUrl}/${product.slug}`}
                                onClick={onClose}
                                style={{
                                    flex: 1, textAlign: 'center',
                                    border: '1px solid #ddd', background: '#fff',
                                    padding: '11px 12px', borderRadius: '4px',
                                    fontSize: '13px', cursor: 'pointer',
                                    textDecoration: 'none', color: '#555',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >View Details</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
//  ACCORDION ITEM
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
//  PRODUCT CARD — image + video hover cycling (Rings.js pattern)
// ─────────────────────────────────────────────────────────
function ProductCard({ p, wishlist, toggleWishlist, currency, onQuickView }) {
    const variant = getFirstVariant(p);
    const images = variant.images || [];
    const videos = variant.videos || [];

    const mediaList = useMemo(() => {
        const list = [];
        if (images.length > 0) list.push({ type: 'image', src: images[0] });
        if (videos.length > 0) list.push({ type: 'video', src: videos[0] });
        images.slice(1).forEach((img) => list.push({ type: 'image', src: img }));
        return list;
    }, [images, videos]);

    const [currentIdx, setCurrentIdx] = useState(0);
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
        if (item.type === 'image') {
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
        if (mediaList.length <= 1) return;
        hoveringRef.current = true;
        const next = 1 % mediaList.length;
        advanceTo(next);
    };

    const stopHover = () => {
        hoveringRef.current = false;
        clearImageTimer();
        setCurrentIdx(0);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    // Jab bhi current slide video ho, use (re)play karo
    useEffect(() => {
        const item = mediaList[currentIdx];
        if (item?.type === 'video' && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
        }
    }, [currentIdx, mediaList]);

    useEffect(() => () => clearImageTimer(), []);

    const currentItem = mediaList[currentIdx] || (images.length > 0 ? { type: 'image', src: images[0] } : null);

    const oldPrice = variant.oldPrice;
    const newPrice = variant.newPrice;
    const isSale = variant.isSale;
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

                {currentItem?.type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={`${API_BASE}${currentItem.src}`}
                        className="jw-card-img"
                        muted
                        playsInline
                        autoPlay
                        onEnded={handleVideoEnded}
                    />
                ) : (
                    <img
                        src={currentItem ? `${API_BASE}${currentItem.src}` : '/placeholder.jpg'}
                        alt={p.title}
                        className="jw-card-img"
                        loading="lazy"
                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                )}

                {mediaList.length > 1 && (
                    <div className="jw-img-dots">
                        {mediaList.map((_, i) => (
                            <span
                                key={i}
                                className={`jw-img-dot ${i === currentIdx ? 'jw-img-dot--active' : ''}`}
                            />
                        ))}
                    </div>
                )}

                <div className="jw-card-actions">
                    <button
                        className={`jw-action-btn ${wishlist.includes(p._id) ? 'jw-action-btn--active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(p._id, {
                                _id: p._id,
                                slug: p.slug,
                                title: p.title,
                                category: p.category,
                                images: variant.images || [],
                                oldPrice: variant.oldPrice,
                                newPrice: variant.newPrice,
                                isSale: variant.isSale,
                            });
                        }}
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
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onQuickView(p);
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
                            <path
                                d="M1 8C2.5 4 5 2 8 2C11 2 13.5 4 15 8C13.5 12 11 14 8 14C5 14 2.5 12 1 8Z"
                                stroke="currentColor" strokeWidth="1.3"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="jw-card-body">
                <p className="jw-card-cat">{p.category}</p>
                <h3 className="jw-card-name">{p.title}</h3>
                <div className="jw-card-price">
                    {oldPrice && (
                        <span className="jw-old-price">{formatPrice(oldPrice, currency)}</span>
                    )}
                    {newPrice !== null && newPrice !== undefined ? (
                        <span className="jw-new-price">{formatPrice(newPrice, currency)}</span>
                    ) : (
                        <span className="jw-new-price jw-price-na">Price on request</span>
                    )}
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

export default function Mens() {
    const router = useRouter();

    // ── Currency — detect from IP ──
    const [currency, setCurrency] = useState(CURRENCY_MAP.default);

    useEffect(() => {
        const detectCurrency = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
                const data = await res.json();
                if (data.success && data.countryCode && CURRENCY_MAP[data.countryCode]) {
                    setCurrency(CURRENCY_MAP[data.countryCode]);
                }
            } catch (err) {
                // silent fail, default EUR stays
            }
        };
        detectCurrency();
    }, []);

    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Mens");

    const [perPage, setPerPage] = useState(30);
    const [sort, setSort] = useState("default");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ── Wishlist — WishlistContext ──
    const { wishlistItems, addToWishlist, removeFromWishlist: removeFromWishlistCtx } = useWishlist();
    const wishlist = (wishlistItems || []).map(item => item._id || item);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Quick View ──
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // ── Toast ──
    const [toast, setToast] = useState({ visible: false, message: '' });
    const toastTimer = useRef(null);

    const layoutRef = useRef(null);
    const sidebarRef = useRef(null);

    const showToast = useCallback((message) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ visible: true, message });
        toastTimer.current = setTimeout(() => {
            setToast({ visible: false, message: '' });
        }, 2500);
    }, []);

    useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        const urlSlug = categorySlugMap[categoryName] || 'mens';
        router.push(`/product-category/${urlSlug}`);
    };

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

    // ── Wishlist toggle ──
    const toggleWishlist = useCallback((id, productData) => {
        if (wishlist.includes(id)) {
            removeFromWishlistCtx(id);
        } else {
            addToWishlist(productData || { _id: id });
        }
    }, [wishlist, addToWishlist, removeFromWishlistCtx]);

    // ── Add to Cart ──
    const handleAddToCart = useCallback((product, qty = 1) => {
        const variant = getFirstVariant(product);
        const cartItem = {
            _id: product._id,
            slug: product.slug,
            title: product.title,
            category: product.category,
            images: variant.images || [],
            oldPrice: variant.oldPrice,
            newPrice: variant.newPrice,
            isSale: variant.isSale,
            qty,
        };
        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { item: cartItem } }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 400);
        showToast(`"${product.title}" added to cart`);
    }, [showToast]);

    const openQuickView = useCallback((product) => setQuickViewProduct(product), []);
    const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

    const sortedProducts = [...products].sort((a, b) => {
        const aPrice = getFirstVariant(a).newPrice || 0;
        const bPrice = getFirstVariant(b).newPrice || 0;

        if (sort === 'price-asc')  return aPrice - bPrice;
        if (sort === 'price-desc') return bPrice - aPrice;
        if (sort === 'newest')     return new Date(b.createdAt) - new Date(a.createdAt);
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

    return (
        <div className="jw-page">

            {/* Toast */}
            <Toast message={toast.message} visible={toast.visible} />

            {/* Quick View Modal */}
            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    currency={currency}
                    onClose={closeQuickView}
                    onAddToCart={(product, qty) => {
                        handleAddToCart(product, qty);
                        closeQuickView();
                    }}
                    wishlist={wishlist}
                    onToggleWishlist={toggleWishlist}
                />
            )}

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
                                    currency={currency}
                                    onQuickView={openQuickView}
                                />
                            ))
                        ) : (
                            <div className="jw-empty">
                                <p>No products found{activeCategory ? ` in "${activeCategory}"` : ''}.</p>
                               
                            </div>
                        )}
                    </div>

                </main>
            </div>
             <Reviews/>

               <div className="jw-bottom-accordions">

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
        </div>
    );
}