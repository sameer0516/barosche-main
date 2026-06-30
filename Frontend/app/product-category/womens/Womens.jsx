'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Womens.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reviews from '../../../components/Home/Reviews/Reviews';
import { useWishlist } from '../../context/WishlistContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

// ─────────────────────────────────────────────────────────
//  CURRENCY CONFIG
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

const faqData = [
    { q: "What is fashion jewellery for women?", a: "<strong>Fashion jewellery for women</strong> includes stylish accessories like earrings, rings, necklaces, and bracelets designed to enhance everyday and occasion wear." },
    { q: "What types of jewellery for women do you offer?", a: "We offer earrings, rings, necklaces, and bracelets designed for modern styling and everyday elegance." },
    { q: "Is womens gold jewellery suitable for daily wear?", a: "Yes, lightweight <strong>womens gold jewellery</strong> is suitable for daily wear, office use, and special occasions." },
    { q: "What are the latest jewellery trends for women?", a: "Minimalist jewellery, layered necklaces, stacked rings, and mixed-metal designs are currently trending." },
    { q: "Can I wear fashion jewellery every day?", a: "Yes, fashion jewellery is designed for comfort and can be worn daily without discomfort." },
    { q: "What are earrings for women?", a: "Earrings are essential accessories that frame the face and enhance overall style." },
    { q: "What are rings for women used for?", a: "Rings add elegance and can be worn alone or stacked for a modern fashion look." },
    { q: "What are necklaces for women?", a: "Necklaces enhance the neckline and complete both casual and formal outfits." },
    { q: "What are bracelets for women?", a: "Bracelets are stylish accessories that add a refined finishing touch to your look." },
    { q: "Is your jewellery suitable for office wear?", a: "Yes, minimal and elegant designs are perfect for professional and office environments." },
    { q: "Can I wear jewellery for formal occasions?", a: "Yes, our jewellery is suitable for weddings, parties, and formal events." },
    { q: "What makes womens jewellery comfortable?", a: "Lightweight materials, smooth finishing, and ergonomic design ensure comfort." },
    { q: "Is fashion jewellery durable?", a: "Yes, our fashion jewellery is made with high-quality materials for long-lasting use." },
    { q: "Can I mix and match jewellery pieces?", a: "Yes, you can easily mix and match rings, earrings, necklaces, and bracelets." },
    { q: "Is online jewellery shopping safe?", a: "Yes, you can safely <strong>buy jewellery online</strong> with secure checkout options." },
    { q: "What makes your jewellery unique?", a: "Our jewellery combines modern trends, premium craftsmanship, and versatile styling." },
    { q: "Is jewellery a good gift for women?", a: "Yes, jewellery is a timeless and meaningful gift for all occasions." },
    { q: "Do you offer minimalist jewellery?", a: "Yes, we offer minimalist jewellery designed for simple and elegant styling." },
    { q: "Can jewellery be worn for parties and events?", a: "Yes, statement pieces are perfect for parties and special occasions." },
    { q: "Why should I choose your womens jewellery collection?", a: "Because we offer a complete range of <strong>fashion jewellery for women</strong>, combining style, comfort, and modern design trends." }
];

const womensContent = [
    { type: 'h', text: "Fashion Jewellery for Women – Elegant, Trendy & Versatile Styles" },
    { type: 'p', text: "Discover the world of <strong>fashion jewellery for women</strong>, where elegance, creativity, and modern design come together to define everyday style. At Barosche, we offer a carefully curated collection designed to enhance your personality, elevate your outfits, and bring effortless sophistication to every moment of your life." },
    { type: 'p', text: "Today, <strong>jewellery for women</strong> is no longer limited to special occasions. It has become an essential part of daily styling, helping women express individuality through minimal, trendy, and statement designs. Our collection is built to match this modern shift, offering jewellery that is stylish, comfortable, and versatile for every occasion." },
    { type: 'p', text: "From subtle everyday essentials to bold statement pieces, each design is thoughtfully created to balance beauty with wearability. Whether you are dressing for work, casual outings, festive celebrations, or special events, our jewellery ensures you always look polished, confident, and effortlessly elegant. It is designed to complement different moods, outfits, and lifestyles, making it easy to build a versatile jewellery collection that feels both modern and timeless." },
    { type: 'h', text: "Womens Gold Jewellery – Timeless Elegance & Premium Craftsmanship" },
    { type: 'p', text: "Explore premium <strong>womens gold jewellery</strong> that reflects timeless beauty, refined craftsmanship, and modern sophistication. Gold has always been a symbol of elegance, luxury, and tradition, and our thoughtfully designed collection brings a fresh, contemporary perspective to this classic metal while preserving its everlasting charm." },
    { type: 'p', text: "Each piece is carefully crafted with attention to detail to ensure long-lasting shine, durability, and a premium finish. Our designs focus on balancing traditional inspiration with modern styling, making them suitable for women who appreciate both heritage and fashion-forward aesthetics." },
    { type: 'p', text: "Our <strong>gold jewellery for women</strong> is suitable for:<br/>• Everyday elegant styling with minimal designs<br/>• Office and professional wear for a polished look<br/>• Festive and cultural occasions with traditional appeal<br/>• Weddings and special celebrations for a luxurious touch<br/>• Modern minimalist fashion looks for contemporary styling" },
    { type: 'p', text: "By combining traditional craftsmanship with contemporary aesthetics, our <strong>womens gold jewellery</strong> delivers both timeless appeal and modern versatility, making it an essential addition to every jewellery collection." },
    { type: 'h', text: "Earrings, Rings, Necklaces & Bracelets for Women" },
    { type: 'p', text: "A complete jewellery wardrobe is built on essential pieces that enhance every outfit and allow effortless styling for every occasion. Our curated collection of <strong>earrings for women</strong>, <strong>rings for women</strong>, <strong>necklaces for women</strong>, and <strong>bracelets for women</strong> is designed to offer endless versatility, elegance, and modern fashion appeal." },
    { type: 'p', text: "Each category is thoughtfully designed to balance beauty, comfort, and wearability, helping you create looks that range from minimal everyday styling to bold statement combinations. Whether worn individually or layered together, these pieces allow you to express your personality with confidence and sophistication." },
    { type: 'h', text: "Earrings for Women" },
    { type: 'p', text: "Earrings are one of the most defining accessories in any jewellery collection. From delicate studs to bold hoops and elegant statement designs, they beautifully frame your face and instantly elevate your overall appearance with effortless charm." },
    { type: 'h', text: "Rings for Women" },
    { type: 'p', text: "Our rings collection includes everything from minimal everyday bands to stylish statement designs. Rings can be worn individually for a subtle and elegant look or stacked together to create a modern, layered fashion statement that reflects your personal style." },
    { type: 'h', text: "Necklaces for Women" },
    { type: 'p', text: "Necklaces add balance, depth, and elegance to any outfit. Whether you prefer fine minimal chains or bold layered designs, necklaces enhance your neckline and complete your look with a refined and stylish finish suitable for both casual and formal wear." },
    { type: 'h', text: "Bracelets for Women" },
    { type: 'p', text: "Bracelets bring a graceful finishing touch to your overall style. Designed for comfort and versatility, they are perfect for daily wear as well as special occasions, adding a subtle yet sophisticated element of luxury to your jewellery collection." },
    { type: 'h', text: "Elegant Jewellery Designed for Everyday Confidence" },
    { type: 'p', text: "Our <strong>fashion jewellery for women</strong> is designed to bring elegance into everyday life. Instead of being limited to special occasions, modern jewellery now plays an essential role in daily styling, helping women feel confident, stylish, and effortlessly put-together." },
    { type: 'p', text: "Each piece is thoughtfully created to blend seamlessly with different outfits and moods. Whether you are heading to work, meeting friends, or attending a celebration, our jewellery enhances your appearance with subtle sophistication." },
    { type: 'p', text: "This focus on versatility ensures that every piece becomes a long-term part of your personal style, rather than just a seasonal accessory." },
    { type: 'h', text: "Premium Womens Gold Jewellery with Modern Appeal" },
    { type: 'p', text: "Our collection of <strong>womens gold jewellery</strong> is inspired by timeless tradition but reimagined for modern fashion. Gold remains one of the most loved choices in jewellery due to its elegance, value, and long-lasting appeal." },
    { type: 'p', text: "We combine traditional craftsmanship with contemporary design to create jewellery that feels both classic and current. Each design is carefully polished and finished to ensure lasting shine, durability, and refined beauty." },
    { type: 'p', text: "This makes our gold jewellery suitable for:<br/>• Everyday minimal styling<br/>• Office and professional wear<br/>• Festive celebrations and cultural events<br/>• Weddings and special occasions<br/>• Modern fashion layering looks" },
    { type: 'h', text: "Jewellery for Women – Designed for Style, Comfort & Everyday Wear" },
    { type: 'p', text: "Modern <strong>jewellery for women</strong> is thoughtfully designed with a strong focus on comfort, versatility, and long-term wearability. Every piece is created to blend seamlessly into daily life, ensuring you can enjoy elegant styling without compromising on ease or practicality. Lightweight materials, smooth edges, and refined finishing make each design suitable for all-day wear without discomfort." },
    { type: 'p', text: "Our collection is built to support multiple styling needs, allowing you to transition effortlessly between different occasions and outfits. Whether you prefer minimal everyday elegance or more expressive fashion styling, our jewellery adapts to your lifestyle with ease and sophistication." },
    { type: 'p', text: "Our jewellery supports multiple styling needs:<br/>• Everyday casual styling with minimal and comfortable designs<br/>• Office and professional outfits for a polished appearance<br/>• Festive and cultural occasions with elegant detailing<br/>• Party and evening wear for a refined statement look<br/>• Modern layering and fashion experimentation for trend-driven styling" },
    { type: 'p', text: "Each piece is designed not only to enhance your appearance but also to reflect your personality, confidence, and lifestyle. With a perfect balance of style and practicality, our <strong>jewellery for women</strong> ensures you always look effortlessly elegant in every moment." },
    { type: 'h', text: "Complete Jewellery Styling for Every Woman" },
    { type: 'p', text: "A perfect jewellery collection includes a balance of essentials that can be styled in multiple ways. Our range of <strong>earrings for women</strong>, <strong>rings for women</strong>, <strong>necklaces for women</strong>, and <strong>bracelets for women</strong> is designed to give you complete styling freedom." },
    { type: 'p', text: "Each category is created with attention to detail, comfort, and versatility, ensuring that you can build looks ranging from minimal elegance to bold fashion statements." },
    { type: 'p', text: "This makes it easy to mix and match pieces according to your outfit, occasion, and personal mood, helping you create a signature style that feels uniquely yours." },
    { type: 'h', text: "Modern Trends in Womens Jewellery" },
    { type: 'p', text: "The world of <strong>fashion jewellery for women</strong> continues to evolve rapidly with global fashion influences, lifestyle changes, and modern styling preferences. Today’s jewellery trends focus on simplicity, elegance, and versatility—allowing women to express their individuality while maintaining a refined and timeless appearance." },
    { type: 'p', text: "Modern jewellery is no longer just about aesthetics; it is about adaptability and self-expression. Contemporary designs are created to seamlessly fit into everyday life while still offering a fashionable and sophisticated edge." },
    { type: 'p', text: "Key modern trends include:<br/>• Minimalist jewellery for clean, everyday elegance<br/>• Layered necklaces and stacked rings for a stylish, modern look<br/>• Lightweight gold-inspired designs for effortless daily wear<br/>• Mixed metal contemporary styles for a bold, fashion-forward appeal<br/>• Elegant statement accessories for special occasions and standout styling" },
    { type: 'p', text: "These trends allow women to experiment with different looks, mix and match styles, and create unique combinations while maintaining a polished, balanced, and fashionable appearance. With evolving <strong>womens jewellery</strong> trends, versatility and comfort remain at the core of modern design." },
    { type: 'h', text: "Jewellery That Blends Comfort with Modern Fashion" },
    { type: 'p', text: "Modern jewellery is not just about appearance—it is about how it feels throughout the day. Our <strong>jewellery for women</strong> is designed with lightweight construction, smooth edges, and comfortable fitting to ensure all-day wearability." },
    { type: 'p', text: "This makes it ideal for women with active lifestyles who want jewellery that supports them through work, travel, and social life without discomfort." },
    { type: 'p', text: "At the same time, each piece maintains a strong focus on elegance and modern design, ensuring that comfort never comes at the cost of style." },
    { type: 'h', text: "Why Choose Our Fashion Jewellery for Women" },
    { type: 'p', text: "Our <strong>fashion jewellery for women</strong> collection is thoughtfully designed for modern lifestyles where comfort, quality, and style are equally important. Every piece is carefully crafted to achieve the perfect balance between aesthetics and practicality, ensuring you can enjoy elegant styling in your everyday life." },
    { type: 'p', text: "We focus on creating jewellery that not only follows current trends but also maintains a timeless appeal, allowing you to wear each piece across different seasons, occasions, and outfit styles. Whether you prefer minimal elegance or bold statement designs, our collection offers versatile options that suit every personality." },
    { type: 'p', text: "We focus on delivering:<br/>• Premium craftsmanship with high-quality finishing<br/>• Trend-inspired yet timeless jewellery designs<br/>• Lightweight and comfortable pieces for everyday wear<br/>• Versatile styling suitable for multiple occasions<br/>• Durable materials with long-lasting shine and performance" },
    { type: 'p', text: "Each design is created to offer long-term value while helping you stay updated with the latest fashion trends. Our <strong>fashion jewellery for women</strong> ensures that you always look stylish, confident, and effortlessly elegant." },
    { type: 'h', text: "Stay Ahead with Modern Jewellery Trends" },
    { type: 'p', text: "Fashion is constantly evolving, and so is <strong>fashion jewellery for women</strong>. Our collection reflects the latest global trends while maintaining timeless appeal, ensuring your jewellery always feels fresh and relevant." },
    { type: 'p', text: "Popular styling trends include:<br/>• Minimalist and clean designs<br/>• Layered necklaces and stacked rings<br/>• Lightweight everyday gold-inspired styles<br/>• Mixed metal modern combinations<br/>• Statement pieces for bold styling" },
    { type: 'p', text: "These trends allow women to experiment with different looks while maintaining elegance and balance in their overall appearance." },
    { type: 'h', text: "Buy Jewellery Online with a Trusted Experience" },
    { type: 'p', text: "Shopping for <strong>womens jewellery online</strong> should be simple, secure, and enjoyable. Our platform is designed to give you a smooth browsing and buying experience with complete transparency and convenience." },
    { type: 'p', text: "From product discovery to checkout, every step is optimized to help you make confident decisions." },
    { type: 'p', text: "We provide:<br/>• Secure payment and checkout system<br/>• High-quality product visuals<br/>• Clear and detailed product descriptions<br/>• Easy navigation and category filtering<br/>• Reliable and timely delivery service" },
    { type: 'p', text: "This ensures a stress-free experience every time you choose to <strong>buy jewellery online</strong> with Barosche." },
    { type: 'h', text: "Shop Jewellery for Women Online with Confidence" },
    { type: 'p', text: "Shopping for womens jewellery online at Barosche offers a seamless and secure experience. Our platform is designed to make it easy for you to explore, compare, and choose the perfect <a href='/product-category/jewellery/' style='color: #007bff; text-decoration: underline;'>minimalist jewellery</a> pieces from the comfort of your home." },
    { type: 'p', text: "We ensure:<br/>• Easy navigation and smooth browsing experience<br/>• High-quality product images and detailed descriptions<br/>• Secure checkout and payment options<br/>• Reliable and timely delivery services<br/>• Customer-focused shopping experience" },
    { type: 'p', text: "Whether you are upgrading your jewellery collection or searching for a meaningful gift, you can confidently <strong>buy jewellery online</strong> with trust and convenience." }
];

const TOP_OFFSET = 40;
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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
//  QUICK VIEW MODAL
// ─────────────────────────────────────────────────────────
function QuickViewModal({ product, currency, onClose, onAddToCart, wishlist, onToggleWishlist }) {
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const variant = getFirstVariant(product);
    const images = variant.images || [];
    const categoryUrl = categorySlugMap[product.category] || 'womens';

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

                {/* Images */}
                <div style={{ flex: '1 1 300px', minWidth: '240px', padding: '24px 16px 24px 24px' }}>
                    <div style={{
                        background: '#f7f6f4', borderRadius: '6px',
                        aspectRatio: '1/1', overflow: 'hidden', marginBottom: '12px',
                    }}>
                        {images.length > 0 ? (
                            <img
                                src={`${API_BASE}${images[activeImg]}`}
                                alt={product.title || product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                            />
                        ) : (
                            <img src="/placeholder.jpg" alt="placeholder"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                    </div>
                    {images.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    style={{
                                        width: '54px', height: '54px', padding: 0,
                                        border: i === activeImg ? '2px solid #1a1a1a' : '2px solid transparent',
                                        borderRadius: '4px', overflow: 'hidden', cursor: 'pointer',
                                        background: '#f7f6f4',
                                    }}
                                >
                                    <img
                                        src={`${API_BASE}${img}`}
                                        alt={`view ${i + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                    />
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
                style={{ maxHeight: open ? bodyRef.current?.scrollHeight + 'px' : '0px' }}
            >
                <div className="jw-accordion-content">{children}</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
//  PRODUCT CARD
// ─────────────────────────────────────────────────────────
function ProductCard({ p, wishlist, toggleWishlist, currency, onQuickView, onAddToCart }) {
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

    const imgSrc = images.length > 0 ? `${API_BASE}${images[currentImg]}` : '/placeholder.jpg';
    const oldPrice = variant.oldPrice;
    const newPrice = variant.newPrice;
    const isSale = variant.isSale;
    const categoryUrl = categorySlugMap[p.category] || 'womens';

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
                    alt={p.title || p.name}
                    className="jw-card-img"
                    loading="lazy"
                    onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                />
                {images.length > 1 && (
                    <div className="jw-img-dots">
                        {images.map((_, i) => (
                            <span key={i} className={`jw-img-dot ${i === currentImg ? 'jw-img-dot--active' : ''}`} />
                        ))}
                    </div>
                )}
                <div className="jw-card-actions">
                    {/* Wishlist */}
                    <button
                        className={`jw-action-btn ${wishlist.includes(p._id) ? 'jw-action-btn--active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(p._id, {
                                _id: p._id,
                                slug: p.slug,
                                title: p.title || p.name,
                                category: p.category,
                                images: variant.images || [],
                                oldPrice: variant.oldPrice,
                                newPrice: variant.newPrice,
                                isSale: variant.isSale,
                            });
                        }}
                        title="Add to Wishlist"
                        aria-label="Add to Wishlist"
                    >
                        <svg width="16" height="15" viewBox="0 0 16 15" fill="none">
                            <path
                                d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z"
                                stroke="currentColor" strokeWidth="1.3"
                                fill={wishlist.includes(p._id) ? 'currentColor' : 'none'}
                            />
                        </svg>
                    </button>
                    {/* Quick View */}
                    <button
                        className="jw-action-btn"
                        title="Quick View"
                        aria-label="Quick View"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onQuickView(p);
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M1 8C2.5 4 5 2 8 2C11 2 13.5 4 15 8C13.5 12 11 14 8 14C5 14 2.5 12 1 8Z" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                    </button>
                    {/* Add to Cart */}
                    <button
                        className="jw-action-btn jw-add-cart"
                        title="Add to Cart"
                        aria-label="Add to Cart"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddToCart(p, 1);
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M1 1H3L4.5 9H12.5L14 4H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            <circle cx="6" cy="12" r="1.2" fill="currentColor" />
                            <circle cx="11" cy="12" r="1.2" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="jw-card-body">
                <p className="jw-card-cat">{p.category}</p>
                <h3 className="jw-card-name">{p.title || p.name}</h3>
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
//  MAIN WOMENS PAGE
// ─────────────────────────────────────────────────────────
export default function Womens() {
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
    const [activeCategory, setActiveCategory] = useState("Womens");

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
        const urlSlug = categorySlugMap[categoryName] || 'jewellery';
        router.push(`/product-category/${urlSlug}`);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const queryParams = new URLSearchParams();
                if (activeCategory) queryParams.append('category', activeCategory);
                const url = `${API_BASE}/api/products?${queryParams.toString()}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Server Error: ${response.status}`);
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
            title: product.title || product.name,
            category: product.category,
            images: variant.images || [],
            oldPrice: variant.oldPrice,
            newPrice: variant.newPrice,
            isSale: variant.isSale,
            qty,
        };
        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { item: cartItem } }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 400);
        showToast(`"${product.title || product.name}" added to cart`);
    }, [showToast]);

    const openQuickView = useCallback((product) => setQuickViewProduct(product), []);
    const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

    const sortedProducts = [...products].sort((a, b) => {
        const aPrice = getFirstVariant(a).newPrice || 0;
        const bPrice = getFirstVariant(b).newPrice || 0;
        if (sort === 'price-asc') return aPrice - bPrice;
        if (sort === 'price-desc') return bPrice - aPrice;
        if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
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

    // ── Sticky Sidebar ──
    useEffect(() => {
        const isMobile = () => window.innerWidth <= 768;
        const update = () => {
            if (isMobile()) {
                const sb = sidebarRef.current;
                if (sb) { sb.style.position = ''; sb.style.top = ''; sb.style.width = ''; }
                return;
            }
            const layout = layoutRef.current;
            const sidebar = sidebarRef.current;
            if (!layout || !sidebar) return;
            const scrollY = window.scrollY;
            const layoutTop = layout.offsetTop;
            const layoutH = layout.offsetHeight;
            const sidebarH = sidebar.offsetHeight;
            const sidebarW = sidebar.parentElement?.offsetWidth || sidebar.offsetWidth;
            const paddingBot = parseFloat(window.getComputedStyle(layout).paddingBottom) || 0;
            const contentH = layoutH - paddingBot;
            const stickStart = layoutTop - TOP_OFFSET;
            const stickEnd = layoutTop + contentH - sidebarH - TOP_OFFSET;
            if (scrollY < stickStart) {
                sidebar.style.position = 'relative'; sidebar.style.top = '0'; sidebar.style.width = '';
            } else if (scrollY >= stickEnd) {
                sidebar.style.position = 'absolute'; sidebar.style.top = (contentH - sidebarH) + 'px'; sidebar.style.width = sidebarW + 'px';
            } else {
                sidebar.style.position = 'fixed'; sidebar.style.top = TOP_OFFSET + 'px'; sidebar.style.width = sidebarW + 'px';
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

            {sidebarOpen && <div className="jw-overlay" onClick={() => setSidebarOpen(false)} />}

            <div className="jw-layout" ref={layoutRef}>
                <div className="jw-sidebar-wrapper">
                    <aside ref={sidebarRef} className={`jw-sidebar ${sidebarOpen ? 'jw-sidebar--open' : ''}`}>
                        <div className="jw-sidebar-inner">
                            <button className="jw-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>

                            {/* Categories */}
                            <div className="jw-filter-block">
                                <button className="jw-filter-heading" onClick={() => setCatOpen(!catOpen)} aria-expanded={catOpen}>
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
                        Women's Fashion & Gold Jewellery – Earrings, Rings, Pendants & More
                    </h1>

                    {/* Toolbar */}
                    <div className="jw-toolbar">
                        <span className="jw-results-count">
                            {loading ? 'Loading...' : `Showing ${displayed.length} of ${filtered.length} results`}
                        </span>
                        <div className="jw-toolbar-right">
                            <div className="jw-per-page">
                                <span className="jw-per-label">Show</span>
                                {[12, 15, 30].map((n) => (
                                    <button key={n} className={`jw-per-btn ${perPage === n ? 'jw-per-btn--active' : ''}`} onClick={() => setPerPage(n)}>{n}</button>
                                ))}
                            </div>
                            <div className="jw-sort-wrap">
                                <select className="jw-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
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

                    {/* Error */}
                    {error && (
                        <div className="jw-error">
                            <span>⚠️ {error}</span>
                            <button onClick={() => setActiveCategory(activeCategory)}>Retry</button>
                        </div>
                    )}

                    {/* Product Grid */}
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
                                    onAddToCart={handleAddToCart}
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
            <Reviews />

              {/* Bottom Accordions */}
                    <div className="jw-bottom-accordions">
                        <AccordionItem title="Jewellery for Women">
                            <div className="jw-accordion-text">
                                {womensContent.map((item, i) =>
                                    item.type === 'h'
                                        ? <h3 key={i} className="jw-accordion-heading" dangerouslySetInnerHTML={{ __html: item.text }} />
                                        : <p key={i} dangerouslySetInnerHTML={{ __html: item.text }} />
                                )}
                            </div>
                        </AccordionItem>

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