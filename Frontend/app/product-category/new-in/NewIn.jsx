'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './NewIn.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reviews from '../../../components/Home/Reviews/Reviews';
import { useWishlist } from '../../context/WishlistContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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

// ─────────────────────────────────────────────────────────
//  FAQ DATA (UPDATED)
// ─────────────────────────────────────────────────────────
const faqData = [
    { q: "What is included in the new in jewellery collection?", a: "Our <strong>new in jewellery collection</strong> includes the latest jewellery designs such as rings, earrings, pendants, and bracelets inspired by current fashion trends." },
    { q: "How often is the new jewellery collection updated?", a: "We regularly update our collection with fresh arrivals to ensure you always have access to the <strong>latest jewellery designs</strong>." },
    { q: "What are the latest jewellery designs available?", a: "The latest designs include minimalist jewellery, statement pieces, and modern fashion jewellery suitable for all occasions." },
    { q: "What is trending jewellery for women right now?", a: "<strong>Trending jewellery for women</strong> includes minimalist styles, layered designs, and elegant statement accessories inspired by global fashion trends." },
    { q: "Is your new fashion jewellery suitable for daily wear?", a: "Yes, our <strong>new fashion jewellery</strong> is lightweight, durable, and designed for comfortable everyday wear." },
    { q: "Can I wear new in jewellery for special occasions?", a: "Yes, many pieces in our collection are perfect for parties, weddings, and festive occasions." },
    { q: "Do you offer minimalist jewellery in new arrivals?", a: "Yes, our collection includes a wide range of <strong>minimalist jewellery</strong> designed for simple and elegant everyday styling." },
    { q: "Can I buy the latest jewellery designs online?", a: "Yes, you can easily explore and <strong>buy jewellery online</strong> through our secure and user-friendly platform." },
    { q: "What makes your new in jewellery collection unique?", a: "Our collection focuses on fresh designs, premium craftsmanship, and a balance of modern and timeless styles." },
    { q: "Are your jewellery pieces lightweight and comfortable?", a: "Yes, our jewellery is designed to be lightweight and comfortable for all-day wear." },
    { q: "Do you offer jewellery for gifting purposes?", a: "Yes, our new collection is perfect for gifting on birthdays, anniversaries, and special occasions." },
    { q: "What types of jewellery are included in new arrivals?", a: "Our new arrivals include rings, earrings, pendants, and bracelets in modern and trendy designs." },
    { q: "Is your jewellery suitable for office wear?", a: "Yes, many pieces are designed for professional and office wear with a clean, elegant look." },
    { q: "Can I find bold statement jewellery in this collection?", a: "Yes, our collection includes both minimalist and bold statement jewellery styles." },
    { q: "Is your online jewellery shopping secure?", a: "Yes, we provide a secure checkout system to ensure safe <strong>online jewellery buying</strong> transactions." },
    { q: "Do you provide high-quality product images?", a: "Yes, we offer clear and high-resolution images to help you choose the right jewellery easily." },
    { q: "Are your jewellery designs long-lasting?", a: "Yes, we focus on durability and quality craftsmanship for long-lasting wear." },
    { q: "Can I mix and match your jewellery pieces?", a: "Yes, our designs are versatile and perfect for layering and styling in different ways." },
    { q: "What is the difference between fashion jewellery and fine jewellery?", a: "Fashion jewellery focuses on trendy, stylish designs, while fine jewellery emphasizes premium materials and craftsmanship." },
    { q: "Why should I choose your new in jewellery collection?", a: "Because we offer <strong>latest jewellery designs</strong>, trending styles, premium quality, and a trusted platform to <strong>buy jewellery online</strong> with confidence." }
];

// ─────────────────────────────────────────────────────────
//  NEW IN JEWELLERY CONTENT DATA (UPDATED)
// ─────────────────────────────────────────────────────────
const newInJewelleryContent = [
    { type: 'h', text: "Latest Jewellery Designs & New In Jewellery Collection Online" },
    { type: 'p', text: "Discover the <strong>latest jewellery designs</strong> at Barosche, where modern trends blend seamlessly with timeless elegance. Our carefully curated <strong>new in jewellery collection</strong> is designed to keep your style fresh, updated, and aligned with evolving fashion trends. Each piece is thoughtfully selected to offer versatility, allowing you to wear it effortlessly across everyday looks, office styling, and special occasions." },
    { type: 'p', text: "From minimal everyday essentials to bold statement accessories, every design reflects a perfect balance of creativity, craftsmanship, and comfort. The collection is built to suit modern lifestyles, where jewellery needs to be both stylish and practical, offering easy wearability without compromising on elegance." },
    { type: 'p', text: "Whether you are upgrading your personal collection or exploring something new, our range of <strong>new fashion jewellery</strong> ensures that you always stay ahead in style. These designs are inspired by contemporary fashion trends while maintaining a timeless appeal, making them suitable for long-term wear and repeated styling. Each piece is created to enhance your individuality and add a refined touch to your overall look." },
    { type: 'h', text: "Explore Latest Jewellery Designs for Modern Styling" },
    { type: 'p', text: "Our collection showcases the <strong>latest jewellery designs</strong> inspired by evolving global fashion trends and modern aesthetics. Each piece is thoughtfully created to bring freshness, elegance, and versatility to your look while maintaining long-lasting appeal and timeless wearability." },
    { type: 'p', text: "Designed with attention to detail, craftsmanship, and finish, these jewellery pieces are made to complement a wide range of personal styles. Whether you prefer subtle minimalism or bold statement looks, our collection ensures that you always find something that matches your fashion preferences." },
    { type: 'p', text: "These designs are perfect for:<br/>• Everyday modern styling<br/>• Office and professional wear<br/>• Casual and festive occasions<br/>• Minimalist and statement looks" },
    { type: 'p', text: "With a strong focus on precision and refined detailing, every piece enhances your personality with effortless charm. Our <strong>latest jewellery designs</strong> are created to help you stay stylish, confident, and fashion-forward in every moment of your life." },
    { type: 'h', text: "Discover Jewellery That Defines Modern Fashion" },
    { type: 'p', text: "Our <strong>latest jewellery designs</strong> are created to reflect the evolving world of modern fashion. Every piece in our <strong>new in jewellery collection</strong> is inspired by global style trends, ensuring that your jewellery always feels fresh, relevant, and fashion-forward." },
    { type: 'p', text: "Unlike traditional collections, our new arrivals are designed with a strong focus on versatility and everyday usability. This means you can wear the same piece across different occasions—whether it’s a casual outing, office meeting, or evening celebration." },
    { type: 'p', text: "Each design is carefully developed to balance elegance with practicality, making it easy to style without effort while still maintaining a premium and sophisticated look." },
    { type: 'h', text: "Designed for Modern Women with Evolving Style" },
    { type: 'p', text: "Today’s <strong>trending jewellery for women</strong> is all about simplicity, elegance, and personal expression. Our collection is created for women who want jewellery that adapts to their lifestyle rather than limiting it." },
    { type: 'p', text: "From minimal everyday designs to bold fashion statements, our jewellery supports every mood and moment. Whether you prefer subtle elegance or expressive styling, our <strong>new fashion jewellery</strong> ensures that you always have the perfect piece to complete your look." },
    { type: 'p', text: "This modern approach to jewellery design focuses on:<br/>• Everyday comfort and wearability<br/>• Fashion-forward aesthetics<br/>• Easy styling with multiple outfits<br/>• Long-lasting design appeal" },
    { type: 'p', text: "Each piece becomes a reflection of your personality and fashion identity." },
    { type: 'h', text: "New In Jewellery Collection – Fresh Styles for Every Occasion" },
    { type: 'p', text: "Our <strong>new in jewellery collection</strong> is regularly updated with the latest arrivals, ensuring you always have access to fresh, modern, and trending designs. Each piece is carefully selected to reflect current fashion preferences while maintaining timeless appeal and long-term usability." },
    { type: 'p', text: "Designed for today’s dynamic lifestyles, this collection brings together versatility and elegance in every design. Whether you prefer subtle everyday pieces or bold statement accessories, our range offers something for every mood, outfit, and occasion." },
    { type: 'p', text: "This collection includes a variety of styles such as <strong>rings, earrings, pendants, and bracelets</strong>, thoughtfully designed for both minimalist and bold styling preferences. Each piece is crafted to offer comfort, durability, and effortless styling, making it suitable for daily wear as well as special events." },
    { type: 'p', text: "Stay updated with:<br/>• Newly launched jewellery designs<br/>• Seasonal fashion trends<br/>• Modern everyday essentials<br/>• Elegant occasion-ready pieces" },
    { type: 'p', text: "With a continuous focus on innovation and style, our <strong>new in jewellery</strong> range ensures that your collection always feels fresh, relevant, and fashion-forward." },
    { type: 'h', text: "Trending Jewellery for Women – Stay Fashion Forward" },
    { type: 'p', text: "Explore <strong>trending jewellery for women</strong> that is thoughtfully designed to enhance both everyday styling and special occasion looks. Each piece is inspired by current global fashion movements, helping you stay stylish, confident, and effortlessly modern in your appearance." },
    { type: 'p', text: "Our trending collection focuses on versatility and elegance, ensuring that every design can be styled in multiple ways. Whether you're dressing for work, casual outings, or festive events, these pieces adapt seamlessly to your wardrobe and personal style." },
    { type: 'p', text: "Our trending collection includes:<br/>• Minimalist jewellery for daily wear<br/>• Elegant statement accessories<br/>• Modern layered designs<br/>• Versatile fashion jewellery pieces" },
    { type: 'p', text: "Each design is created to allow easy mixing, matching, and layering, giving you complete freedom to express your personal fashion preferences. With a strong focus on comfort, quality, and contemporary appeal, our <strong>trending jewellery for women</strong> ensures you always stay ahead in style." },
    { type: 'h', text: "Fresh Arrivals That Keep Your Style Updated" },
    { type: 'p', text: "Our <strong>new in jewellery collection</strong> is updated regularly to ensure that you always have access to the latest and most in-demand designs. Every new arrival is carefully selected based on current fashion trends, customer preferences, and seasonal style shifts." },
    { type: 'p', text: "This ensures your jewellery collection never feels outdated. Instead, it evolves with time, allowing you to stay ahead in fashion effortlessly." },
    { type: 'p', text: "Whether you're looking for minimalist pieces, statement accessories, or everyday essentials, our new arrivals offer something unique for every style preference." },
    { type: 'h', text: "Jewellery for Every Style, Mood & Occasion" },
    { type: 'p', text: "Our collection is designed to support every lifestyle need with ease. From subtle everyday pieces to bold occasion-ready designs, the <strong>latest jewellery designs</strong> in our store are made for all moments of life." },
    { type: 'p', text: "You can style our jewellery for:<br/>• Daily wear and casual outings<br/>• Office and professional environments<br/>• Parties and festive celebrations<br/>• Weddings and special occasions<br/>• Modern fashion layering and styling" },
    { type: 'p', text: "This versatility makes our <strong>new fashion jewellery</strong> a perfect addition to any wardrobe, giving you unlimited styling possibilities." },
    { type: 'h', text: "New Fashion Jewellery for Everyday Elegance" },
    { type: 'p', text: "Our <strong>new fashion jewellery</strong> collection is designed for modern lifestyles where style, comfort, and versatility come together effortlessly. Each piece is thoughtfully crafted to be lightweight, durable, and easy to wear, making it ideal for daily use without compromising on elegance or quality." },
    { type: 'p', text: "Inspired by contemporary fashion trends, these designs are created to complement a wide range of outfits—from casual daywear to more refined evening looks. The focus is on delivering jewellery that feels comfortable for long hours while still adding a polished and stylish touch to your appearance." },
    { type: 'p', text: "Whether you prefer subtle elegance or bold expression, this collection offers a wide variety of options to suit every mood, outfit, and occasion. With its balance of simplicity and modern appeal, our <strong>new fashion jewellery</strong> helps you stay effortlessly stylish every day." },
    { type: 'h', text: "Why Choose Our New In Jewellery Collection?" },
    { type: 'p', text: "Our <strong>new in jewellery</strong> category is thoughtfully designed to keep your style fresh, modern, and always relevant. We focus on delivering jewellery that reflects the latest fashion direction while maintaining timeless elegance, making it easy for you to stay ahead in style without effort." },
    { type: 'p', text: "Every piece in this collection is carefully curated to balance aesthetics, comfort, and durability. From everyday essentials to statement designs, our jewellery is made to suit evolving fashion needs while offering long-lasting value and wearability." },
    { type: 'p', text: "We focus on delivering:<br/>• Regularly updated <strong>latest jewellery designs</strong> inspired by current trends<br/>• High-quality craftsmanship with refined finishing<br/>• Trend-driven yet timeless styling that never goes out of fashion<br/>• Versatile jewellery suitable for all occasions and outfits<br/>• Comfortable, lightweight, and long-lasting wear" },
    { type: 'p', text: "Each piece is carefully crafted to ensure it not only looks beautiful but also offers durability, versatility, and lasting value—making our <strong>new in jewellery collection</strong> a reliable choice for modern jewellery lovers." },
    { type: 'h', text: "Buy Latest Jewellery Online with Confidence" },
    { type: 'p', text: "We make it simple and secure to <strong>buy jewellery online</strong> with complete confidence. Our platform is designed to offer a smooth, transparent, and convenient shopping experience from start to finish." },
    { type: 'p', text: "Every product in our <strong>new in jewellery collection</strong> is presented with clear images, detailed descriptions, and accurate styling information to help you make the right choice." },
    { type: 'p', text: "We ensure:<br/>• Safe and secure checkout experience<br/>• Easy browsing and product discovery<br/>• High-quality visuals for better selection<br/>• Fast and reliable delivery service<br/>• Customer-focused support experience" },
    { type: 'p', text: "This ensures that your online jewellery shopping journey is not only easy but also completely trustworthy and enjoyable." },
    { type: 'h', text: "Shop Latest Jewellery Online with Confidence" },
    { type: 'p', text: "Shopping for the latest <a href='/product-category/jewellery/' style='color: #007bff; text-decoration: underline;'>fine jewellery</a> designs has never been easier or more convenient. Our platform is designed to give you a seamless experience where you can effortlessly explore, compare, and buy jewellery online with complete confidence." },
    { type: 'p', text: "We focus on creating a smooth and user-friendly shopping journey that helps you find the perfect piece quickly and easily. From browsing new arrivals to completing your purchase, every step is optimized for clarity, convenience, and trust." },
    { type: 'p', text: "We ensure:<br/>• Easy and intuitive browsing experience<br/>• Secure and safe checkout process<br/>• Detailed product descriptions for informed decisions<br/>• High-quality product visuals for clear understanding<br/>• Reliable and timely delivery service" },
    { type: 'p', text: "With a strong focus on customer satisfaction, we aim to make your jewellery shopping experience smooth, secure, and enjoyable. Whether you're searching for <strong>new in jewellery</strong>, <strong>trending jewellery for women</strong>, or timeless pieces, our platform ensures a trustworthy and effortless online shopping experience." }
];

const TOP_OFFSET = 40;

function getImgSrc(path) {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
}

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

// ─────────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────────
function Toast({ message, visible }) {
    if (!visible) return null;
    return (
        <div style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            background: '#1a1a1a', color: '#fff', padding: '12px 24px', borderRadius: '4px',
            fontSize: '14px', zIndex: 9999, pointerEvents: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
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
    const categoryUrl = categorySlugMap[product.category] || 'new-in';

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
    }, [onClose]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
            <div style={{ background: '#fff', borderRadius: '8px', maxWidth: '860px', width: '100%', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'row', position: 'relative', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#555', zIndex: 1, lineHeight: 1 }} aria-label="Close">✕</button>

                <div style={{ flex: '1 1 300px', minWidth: '240px', padding: '24px 16px 24px 24px' }}>
                    <div style={{ background: '#f7f6f4', borderRadius: '6px', aspectRatio: '1/1', overflow: 'hidden', marginBottom: '12px' }}>
                        {images.length > 0
                            ? <img src={getImgSrc(images[activeImg])} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                            : <img src="/placeholder.jpg" alt="placeholder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    {images.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {images.map((img, i) => (
                                <button key={i} onClick={() => setActiveImg(i)} style={{ width: '54px', height: '54px', padding: 0, border: i === activeImg ? '2px solid #1a1a1a' : '2px solid transparent', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', background: '#f7f6f4' }}>
                                    <img src={getImgSrc(img)} alt={`view ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ flex: '1 1 280px', padding: '32px 24px 24px 16px', minWidth: '240px' }}>
                    {variant.isSale && <span style={{ background: '#1a1a1a', color: '#fff', fontSize: '11px', letterSpacing: '1px', padding: '3px 8px', borderRadius: '2px', display: 'inline-block', marginBottom: '10px' }}>SALE</span>}
                    <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>{product.category}</p>
                    <h2 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 14px', lineHeight: 1.3 }}>{product.title}</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                        {variant.oldPrice && <span style={{ fontSize: '15px', color: '#aaa', textDecoration: 'line-through' }}>{formatPrice(variant.oldPrice, currency)}</span>}
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>
                            {variant.newPrice !== null && variant.newPrice !== undefined ? formatPrice(variant.newPrice, currency) : 'Price on request'}
                        </span>
                    </div>
                    {product.description && <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>{product.description}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '13px', color: '#555' }}>Qty:</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>−</button>
                            <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '14px' }}>{qty}</span>
                            <button onClick={() => setQty(q => q + 1)} style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>+</button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button onClick={() => onAddToCart(product, qty)} style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '13px 20px', fontSize: '13px', letterSpacing: '0.5px', cursor: 'pointer', borderRadius: '4px', textTransform: 'uppercase' }}>Add to Cart</button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => onToggleWishlist(product._id, { _id: product._id, slug: product.slug, title: product.title, category: product.category, images: variant.images || [], oldPrice: variant.oldPrice, newPrice: variant.newPrice, isSale: variant.isSale })}
                                style={{ flex: 1, border: '1px solid #ddd', background: '#fff', padding: '11px 12px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: wishlist.includes(product._id) ? '#c0392b' : '#555' }}
                            >
                                <svg width="15" height="14" viewBox="0 0 16 15" fill="none"><path d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.3" fill={wishlist.includes(product._id) ? 'currentColor' : 'none'} /></svg>
                                Add to Wishlist
                            </button>
                            <Link href={`/product-category/${categoryUrl}/${product.slug}`} onClick={onClose} style={{ flex: 1, textAlign: 'center', border: '1px solid #ddd', background: '#fff', padding: '11px 12px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', textDecoration: 'none', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>View Details</Link>
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
            <button className={`jw-accordion-trigger ${open ? 'jw-accordion-trigger--open' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
                <span className="jw-accordion-arrow"><svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg></span>
                <span>{title}</span>
            </button>
            <div ref={bodyRef} className="jw-accordion-body" style={{ maxHeight: open ? bodyRef.current?.scrollHeight + 'px' : '0px' }}>
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
        intervalRef.current = setInterval(() => { setCurrentImg(idx); idx = (idx + 1) % images.length; }, 800);
    };
    const stopHover = () => { clearInterval(intervalRef.current); setCurrentImg(0); };
    useEffect(() => () => clearInterval(intervalRef.current), []);

    const imgSrc = images.length > 0 ? getImgSrc(images[currentImg]) : '/placeholder.jpg';
    const oldPrice = variant.oldPrice;
    const newPrice = variant.newPrice ?? variant.price;
    const isSale = variant.isSale;
    const categoryUrl = categorySlugMap[p.category] || 'new-in';

    return (
        <Link href={`/product-category/${categoryUrl}/${p.slug}`} className="jw-card" onMouseEnter={startHover} onMouseLeave={stopHover}>
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">SALE</span>}
                <img src={imgSrc} alt={p.title} className="jw-card-img" loading="lazy" onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                {images.length > 1 && (
                    <div className="jw-img-dots">
                        {images.map((_, i) => <span key={i} className={`jw-img-dot ${i === currentImg ? 'jw-img-dot--active' : ''}`} />)}
                    </div>
                )}
                <div className="jw-card-actions">
                    <button
                        className={`jw-action-btn ${wishlist.includes(p._id) ? 'jw-action-btn--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p._id, { _id: p._id, slug: p.slug, title: p.title, category: p.category, images: variant.images || [], oldPrice: variant.oldPrice, newPrice: variant.newPrice, isSale: variant.isSale }); }}
                        title="Add to Wishlist"
                    >
                        <svg width="16" height="15" viewBox="0 0 16 15" fill="none"><path d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.3" fill={wishlist.includes(p._id) ? 'currentColor' : 'none'} /></svg>
                    </button>
                    <button className="jw-action-btn" title="Quick View" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(p); }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" /><path d="M1 8C2.5 4 5 2 8 2C11 2 13.5 4 15 8C13.5 12 11 14 8 14C5 14 2.5 12 1 8Z" stroke="currentColor" strokeWidth="1.3" /></svg>
                    </button>
                    <button className="jw-action-btn jw-add-cart" title="Add to Cart" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(p, 1); }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1H3L4.5 9H12.5L14 4H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><circle cx="6" cy="12" r="1.2" fill="currentColor" /><circle cx="11" cy="12" r="1.2" fill="currentColor" /></svg>
                    </button>
                </div>
            </div>
            <div className="jw-card-body">
                <p className="jw-card-cat">{p.category}</p>
                <h3 className="jw-card-name">{p.title}</h3>
                <div className="jw-card-price">
                    {oldPrice && <span className="jw-old-price">{formatPrice(oldPrice, currency)}</span>}
                    {newPrice !== null && newPrice !== undefined
                        ? <span className="jw-new-price">{formatPrice(newPrice, currency)}</span>
                        : <span className="jw-new-price jw-price-na">Price on request</span>}
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
//  MAIN NEW IN PAGE
// ─────────────────────────────────────────────────────────
export default function NewIn() {
    const router = useRouter();

    // ── Currency (detect karo backend se) ──
    const [currency, setCurrency] = useState(CURRENCY_MAP.default);

    // ── WishlistContext ──
    const { wishlistItems, addToWishlist, removeFromWishlist: removeFromWishlistCtx } = useWishlist();
    const wishlist = (wishlistItems || []).map(item => item._id || item);

    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("New");
    const [perPage, setPerPage] = useState(30);
    const [sort, setSort] = useState("default");
    const [sidebarOpen, setSidebarOpen] = useState(false);
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
        toastTimer.current = setTimeout(() => setToast({ visible: false, message: '' }), 2500);
    }, []);

    useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

    // ── Currency detect (NewIn me translation nahi tha, sirf currency detect) ──
    useEffect(() => {
        const detectCurrency = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
                const data = await res.json();
                if (data.success && data.countryCode && CURRENCY_MAP[data.countryCode]) {
                    setCurrency(CURRENCY_MAP[data.countryCode]);
                }
            } catch (err) {
                console.error('Currency detect error:', err.message);
            }
        };
        detectCurrency();
    }, []);

    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        router.push(`/product-category/${categorySlugMap[categoryName] || 'new-in'}`);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true); setError(null);
                const queryParams = new URLSearchParams();
                if (activeCategory) queryParams.append("category", activeCategory);
                const response = await fetch(`${API_BASE}/api/products?${queryParams.toString()}`);
                if (!response.ok) throw new Error(`Server Error: ${response.status}`);
                const data = await response.json();
                if (data.success) setProducts(data.products || []);
                else throw new Error(data.message || "Failed to fetch data.");
            } catch (err) {
                console.error("[NewIn] Fetch error:", err);
                setError(err.message);
            } finally { setLoading(false); }
        };
        fetchProducts();
    }, [activeCategory]);

    // ── Wishlist toggle ──
    const toggleWishlist = useCallback((id, productData) => {
        if (wishlist.includes(id)) removeFromWishlistCtx(id);
        else addToWishlist(productData || { _id: id });
    }, [wishlist, addToWishlist, removeFromWishlistCtx]);

    // ── Add to Cart ──
    const handleAddToCart = useCallback((product, qty = 1) => {
        const variant = getFirstVariant(product);
        const cartItem = { _id: product._id, slug: product.slug, title: product.title, category: product.category, images: variant.images || [], oldPrice: variant.oldPrice, newPrice: variant.newPrice, isSale: variant.isSale, qty };
        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { item: cartItem } }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 400);
        showToast(`"${product.title}" added to cart`);
    }, [showToast]);

    const openQuickView = useCallback((product) => setQuickViewProduct(product), []);
    const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

    const sortedProducts = [...products].sort((a, b) => {
        const aPrice = getFirstVariant(a).newPrice || 0;
        const bPrice = getFirstVariant(b).newPrice || 0;
        if (sort === "price-asc") return aPrice - bPrice;
        if (sort === "price-desc") return bPrice - aPrice;
        if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
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
            if (isMobile()) { const sb = sidebarRef.current; if (sb) { sb.style.position = ''; sb.style.top = ''; sb.style.width = ''; } return; }
            const layout = layoutRef.current; const sidebar = sidebarRef.current;
            if (!layout || !sidebar) return;
            const scrollY = window.scrollY; const layoutTop = layout.offsetTop; const layoutH = layout.offsetHeight;
            const sidebarH = sidebar.offsetHeight; const sidebarW = sidebar.parentElement?.offsetWidth || sidebar.offsetWidth;
            const paddingBot = parseFloat(window.getComputedStyle(layout).paddingBottom) || 0;
            const contentH = layoutH - paddingBot; const stickStart = layoutTop - TOP_OFFSET; const stickEnd = layoutTop + contentH - sidebarH - TOP_OFFSET;
            if (scrollY < stickStart) { sidebar.style.position = 'relative'; sidebar.style.top = '0'; sidebar.style.width = ''; }
            else if (scrollY >= stickEnd) { sidebar.style.position = 'absolute'; sidebar.style.top = (contentH - sidebarH) + 'px'; sidebar.style.width = sidebarW + 'px'; }
            else { sidebar.style.position = 'fixed'; sidebar.style.top = TOP_OFFSET + 'px'; sidebar.style.width = sidebarW + 'px'; }
        };
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
        return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
    }, []);

    return (
        <div className="jw-page">
            <Toast message={toast.message} visible={toast.visible} />

            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct} currency={currency}
                    onClose={closeQuickView}
                    onAddToCart={(product, qty) => { handleAddToCart(product, qty); closeQuickView(); }}
                    wishlist={wishlist} onToggleWishlist={toggleWishlist}
                />
            )}

            <button className="jw-filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <span className="jw-filter-icon"><svg width="18" height="14" viewBox="0 0 18 14" fill="none"><rect width="18" height="2" rx="1" fill="currentColor" /><rect x="3" y="6" width="12" height="2" rx="1" fill="currentColor" /><rect x="6" y="12" width="6" height="2" rx="1" fill="currentColor" /></svg></span>
                Filters
            </button>

            {sidebarOpen && <div className="jw-overlay" onClick={() => setSidebarOpen(false)} />}

            <div className="jw-layout" ref={layoutRef}>
                <div className="jw-sidebar-wrapper">
                    <aside ref={sidebarRef} className={`jw-sidebar ${sidebarOpen ? 'jw-sidebar--open' : ''}`}>
                        <div className="jw-sidebar-inner">
                            <button className="jw-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>

                            <div className="jw-filter-block">
                                <button className="jw-filter-heading" onClick={() => setCatOpen(!catOpen)} aria-expanded={catOpen}>
                                    <span>Product Categories</span>
                                    <span className={`jw-chevron ${catOpen ? 'jw-chevron--up' : ''}`}><svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
                                </button>
                                <div className={`jw-filter-body ${catOpen ? 'jw-filter-body--open' : ''}`}>
                                    <ul className="jw-cat-list">
                                        {categories.map((c) => (
                                            <li key={c.name}>
                                                <button className={`jw-cat-item ${activeCategory === c.name ? 'jw-cat-item--active' : ''}`} onClick={() => handleCategoryClick(c.name)}>
                                                    <svg className="jw-cat-arrow" width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
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
                    <h1 className="jw-title">New In Jewellery – Latest & Trending Fashion Jewellery Designs</h1>

                    <div className="jw-toolbar">
                        <span className="jw-results-count">{loading ? "Loading..." : `Showing ${displayed.length} of ${filtered.length} results`}</span>
                        <div className="jw-toolbar-right">
                            <div className="jw-per-page">
                                <span className="jw-per-label">Show</span>
                                {[12, 15, 30].map((n) => (<button key={n} className={`jw-per-btn ${perPage === n ? 'jw-per-btn--active' : ''}`} onClick={() => setPerPage(n)}>{n}</button>))}
                            </div>
                            <div className="jw-sort-wrap">
                                <select className="jw-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                                    <option value="default">Default sorting</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="newest">Newest</option>
                                </select>
                                <span className="jw-select-arrow"><svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></span>
                            </div>
                            <button className="jw-grid-toggle" title="Grid view"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect width="7" height="7" rx="1" fill="currentColor" /><rect x="9" width="7" height="7" rx="1" fill="currentColor" /><rect y="9" width="7" height="7" rx="1" fill="currentColor" /><rect x="9" y="9" width="7" height="7" rx="1" fill="currentColor" /></svg></button>
                        </div>
                    </div>

                    {error && <div className="jw-error"><span>⚠️ {error}</span><button onClick={() => setActiveCategory(activeCategory)}>Retry</button></div>}

                    <div className="jw-grid">
                        {loading ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />) : displayed.length > 0 ? (
                            displayed.map((p) => (
                                <ProductCard key={p._id} p={p} wishlist={wishlist} toggleWishlist={toggleWishlist} currency={currency} onQuickView={openQuickView} onAddToCart={handleAddToCart} />
                            ))
                        ) : (
                            <div className="jw-empty">
                                <p>No products found{activeCategory ? ` in "${activeCategory}"` : ''}.</p>
                                <p style={{ fontSize: '13px', marginTop: '8px', color: '#aaa' }}>Check browser console (F12) for API response.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Reviews />

             <div className="jw-bottom-accordions">
                        <AccordionItem title="New In Jewellery">
                            <div className="jw-accordion-text">
                                {newInJewelleryContent.map((item, i) =>
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
                                        {/* Added i+1 here manually to ensure numbering continues properly while maintaining innerHTML support */}
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