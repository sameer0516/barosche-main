'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Bracelets.css';
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

// ─────────────────────────────────────────────────────────
//  DEFAULT UI STRINGS
// ─────────────────────────────────────────────────────────
const DEFAULT_UI = {
    productCategories: "Product Categories",
    price: "Price",
    loadingText: "Loading...",
    showText: "Show",
    defaultSorting: "Default sorting",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    newest: "Newest",
    filtersText: "Filters",
    everydayJewellery: "Bracelets",
    faq: "Frequently Asked Questions",
    retry: "Retry",
    gridView: "Grid view",
    addToWishlist: "Add to Wishlist",
    quickView: "Quick View",
    addToCart: "Add to Cart",
    sale: "SALE",
    noProductsBase: "No products found",
    checkConsole: "Check browser console (F12) for errors.",
    showingOf: "Showing",
    showingResults: "results",
    pageTitle: "Bracelets for Men & Women Online – Elegant Everyday & Statement Designs",
    priceOnRequest: "Price on request",
};

const flattenUI = (ui) => [
    ui.productCategories, ui.price, ui.loadingText, ui.showText, ui.defaultSorting,
    ui.priceLowHigh, ui.priceHighLow, ui.newest, ui.filtersText, ui.everydayJewellery,
    ui.faq, ui.retry, ui.gridView, ui.addToWishlist, ui.quickView, ui.addToCart,
    ui.sale, ui.noProductsBase, ui.checkConsole, ui.showingOf, ui.showingResults, ui.pageTitle,
    ui.priceOnRequest,
];

const rebuildUI = (translations) => {
    let i = 0; const get = () => translations[i++];
    return {
        productCategories: get(), price: get(), loadingText: get(), showText: get(), defaultSorting: get(),
        priceLowHigh: get(), priceHighLow: get(), newest: get(), filtersText: get(), everydayJewellery: get(),
        faq: get(), retry: get(), gridView: get(), addToWishlist: get(), quickView: get(), addToCart: get(),
        sale: get(), noProductsBase: get(), checkConsole: get(), showingOf: get(), showingResults: get(),
        pageTitle: get(), priceOnRequest: get(),
    };
};

const categories = [
    { name: "Chosen" }, { name: "Earrings" }, { name: "For Today" }, { name: "Jewellery" },
    { name: "Mens" }, { name: "New" }, { name: "Pendants" }, { name: "Bracelets" }, { name: "Rings" }, { name: "Womens" },
];

const categorySlugMap = {
    "Chosen": "chosen-jewellery", "Earrings": "earrings", "For Today": "for-today-jewellery",
    "Jewellery": "jewellery", "Men": "mens", "Mens": "mens", "New": "new-in", "New In": "new-in",
    "Pendants": "pendants", "Bracelets": "bracelets", "Rings": "rings", "Women": "womens", "Womens": "womens",
};

const flattenCategories = (cats) => cats.map((c) => c.name);
const rebuildCategories = (originalCats, translatedNames) =>
    originalCats.map((c, i) => ({ ...c, translatedName: translatedNames[i] }));

const TOP_OFFSET = 40;

// ─────────────────────────────────────────────────────────
//  FAQ & CONTENT DATA
// ─────────────────────────────────────────────────────────
const faqData = [
    { q: "What types of bracelets are available online?", a: "You can find gold bracelets, silver bracelets, gemstone bracelets, minimal bracelets, and statement designs." },
    { q: "Are bracelets suitable for daily wear?", a: "Yes, many lightweight and minimal bracelets are designed for comfortable everyday use." },
    { q: "What are stackable bracelets?", a: "Stackable bracelets are designed to be worn together to create a layered and trendy look." },
    { q: "Can men wear bracelets daily?", a: "Yes, bracelets for men are designed with durable and comfortable materials for everyday use." },
    { q: "Are gold bracelets good for long-term wear?", a: "Yes, gold bracelets are durable, timeless, and maintain their shine for years with proper care." },
    { q: "What is the difference between minimal and statement bracelets?", a: "Minimal bracelets are simple and subtle, while statement bracelets are bold and designed to stand out." },
    { q: "Are gemstone bracelets real stones?", a: "They may include natural, semi-precious, or synthetic gemstones depending on the design." },
    { q: "How do I choose the right bracelet size?", a: "Measure your wrist and choose a size that fits comfortably without being too tight or loose." },
    { q: "Can I wear multiple bracelets together?", a: "Yes, stacking multiple bracelets is a popular modern fashion trend." },
    { q: "Are bracelets suitable for gifting?", a: "Yes, bracelets are meaningful gifts perfect for birthdays, anniversaries, and special occasions." },
    { q: "Which bracelets are best for office wear?", a: "Minimal and lightweight bracelets are ideal for professional and office settings." },
    { q: "Do bracelets match both western and ethnic outfits?", a: "Yes, versatile bracelet designs can be styled with both western and traditional outfits." },
    { q: "What materials are used in bracelets?", a: "Common materials include gold, silver, stainless steel, alloy, and gemstones." },
    { q: "Are lightweight bracelets durable?", a: "Yes, well-crafted lightweight bracelets are designed for both comfort and durability." },
    { q: "What are geometric bracelets?", a: "Geometric bracelets feature modern shapes and structured designs for a stylish look." },
    { q: "How do I maintain my bracelets?", a: "Avoid water, perfumes, and chemicals, and store them in a dry place to maintain shine." },
    { q: "Are unisex bracelets available?", a: "Yes, many bracelet designs are suitable for both men and women." },
    { q: "What bracelets are trending right now?", a: "Minimal, stackable, geometric, and textured bracelets are currently trending." },
    { q: "Can bracelets be worn at parties and events?", a: "Yes, statement and gemstone bracelets are perfect for special occasions." },
    { q: "Why should I buy bracelets online?", a: "Online shopping offers more variety, better comparison, and access to the latest designs easily." },
];

const bracelets_content = [
    { type: 'h', text: "Bracelets for Men & Women – Timeless Elegance Meets Modern Fashion" },
    { type: 'p', text: "Discover a beautifully curated collection of <strong>bracelets for men and women online</strong>, thoughtfully designed to blend timeless elegance with modern fashion trends. Whether you prefer minimal everyday styles or bold statement pieces, this collection offers versatile designs that suit every personality, occasion, and lifestyle." },
    { type: 'p', text: "Bracelets are more than just accessories—they are a reflection of individuality, confidence, and personal style. From subtle chain designs to eye-catching gemstone details and bold statement pieces, each bracelet is crafted to enhance your look effortlessly while adding a refined finishing touch to your outfit." },
    { type: 'p', text: "Designed for modern fashion needs, these bracelets combine <strong>comfort, durability, and style</strong>, making them ideal for both daily wear and special occasions. Their lightweight construction and smooth finishing ensure all-day comfort, while premium craftsmanship guarantees long-lasting beauty and shine." },
    { type: 'p', text: "Whether you are styling a casual outfit, dressing for work, or preparing for a special event, the right bracelet can instantly elevate your overall appearance. With designs ranging from minimal elegance to bold fashion-forward styles, this collection ensures there is something for every mood and moment." },

    { type: 'h', text: "Explore a Wide Range of Bracelet Styles Online" },
    { type: 'p', text: "Our bracelet collection features a thoughtfully curated variety of designs to match different tastes, personalities, and fashion preferences. Whether you prefer subtle elegance or bold statement pieces, there is something for every style and occasion." },

    { type: 'h', text: "1. Minimal Bracelets for Everyday Elegance" },
    { type: 'p', text: "Minimal bracelets are perfect for those who appreciate clean, simple, and lightweight jewellery. Designed with subtle detailing and refined finishes, they offer effortless elegance without overpowering your overall look. Ideal for daily wear, these bracelets blend seamlessly with both casual and formal outfits." },

    { type: 'h', text: "2. Gold Bracelets – Classic Luxury & Timeless Appeal" },
    { type: 'p', text: "Gold bracelets remain one of the most iconic and timeless jewellery choices. Known for their richness, elegance, and cultural significance, they add a premium touch to any outfit. Whether paired with traditional attire or modern fashion, gold bracelets always maintain their sophisticated charm and never go out of style." },

    { type: 'h', text: "3. Bracelets for Men – Bold & Masculine Designs" },
    { type: 'p', text: "Bracelets for men are designed with strength, simplicity, and modern masculinity in mind. Featuring bold chains, minimal bands, and rugged textures, these designs reflect confidence, individuality, and effortless style. They are perfect for both everyday wear and special occasions." },

    { type: 'h', text: "4. Gold Bracelets for Women – Elegant & Stylish" },
    { type: 'p', text: "Gold bracelets for women are crafted to enhance femininity, grace, and elegance. From delicate chain designs to intricately detailed patterns, these pieces beautifully complement both everyday outfits and festive attire, making them a versatile jewellery essential." },

    { type: 'h', text: "5. Statement Bracelets – Designed to Stand Out" },
    { type: 'p', text: "Statement bracelets feature bold silhouettes, intricate craftsmanship, and artistic detailing. Created for special occasions, they instantly elevate your overall look and become the focal point of your style, adding confidence and personality to any outfit." },

    { type: 'h', text: "6. Gemstone Bracelets – Colorful & Meaningful Designs" },
    { type: 'p', text: "Gemstone bracelets bring color, character, and uniqueness to your jewellery collection. Each stone carries its own natural charm and symbolic meaning, making every bracelet visually distinctive as well as emotionally meaningful. Perfect for adding a vibrant touch to your everyday or festive look." },

    { type: 'h', text: "Bracelets for Everyday Wear – Comfort Meets Style" },
    { type: 'p', text: "Everyday bracelets are thoughtfully designed to offer long-lasting comfort along with effortless, understated style. With lightweight construction, smooth finishing, and skin-friendly designs, they can be worn throughout the day without causing irritation or heaviness, making them ideal for continuous use." },
    { type: 'p', text: "These bracelets focus on simplicity and practicality while still maintaining a refined and elegant appearance. Their minimal yet stylish designs make them suitable for people who prefer subtle fashion that blends naturally with daily life." },
    { type: 'p', text: "They are perfect for a wide range of everyday activities, including:" },
    { type: 'ul', items: [
        "Office wear and professional settings",
        "Daily routines and casual styling",
        "Travel and long-hour comfort",
        "Minimal fashion preferences"
    ]},
    { type: 'p', text: "Their versatile design ensures they pair effortlessly with both western and traditional outfits, allowing you to maintain a polished and consistent look without changing accessories frequently." },

    { type: 'h', text: "Trending Bracelet Styles You Should Explore" },
    { type: 'p', text: "Stay updated with the latest jewellery fashion through modern bracelet designs that combine creativity, elegance, and everyday wearability. These trending styles are designed to help you express your personality while keeping your look fresh, stylish, and up to date." },

    { type: 'h', text: "1. Geometric Bracelets" },
    { type: 'p', text: "Geometric bracelets feature clean lines, structured shapes, and modern symmetry. Their contemporary design gives a sharp, fashion-forward appeal, making them perfect for those who prefer a minimal yet artistic aesthetic." },

    { type: 'h', text: "2. Stackable Bracelets" },
    { type: 'p', text: "Stackable bracelets allow you to layer multiple pieces together to create a personalized and stylish stacked look. By mixing different textures, metals, or designs, you can achieve a trendy and dynamic style that reflects your individuality." },

    { type: 'h', text: "3. Textured & Artistic Bracelets" },
    { type: 'p', text: "These bracelets showcase unique finishes, handcrafted-inspired detailing, and creative patterns. Their distinctive appearance adds depth and character to your jewellery collection, making them ideal for those who love expressive fashion." },

    { type: 'h', text: "4. Minimal Luxe Bracelets" },
    { type: 'p', text: "Minimal luxe bracelets combine simplicity with a premium touch. With clean designs and refined detailing, they offer understated luxury that works perfectly for both everyday wear and subtle, elegant styling." },

    { type: 'h', text: "5. Unisex Bracelets" },
    { type: 'p', text: "<a href=\"#\">Unisex bracelets</a> are designed with versatility in mind, making them suitable for both men and women. Their balanced and modern designs ensure effortless styling across different outfits and occasions." },

    { type: 'h', text: "How to Choose the Perfect Bracelet Online" },
    { type: 'p', text: "Selecting the right bracelet online becomes simple and enjoyable when you focus on a few key factors. With so many modern and traditional designs available, making the right choice ensures your bracelet matches your style, comfort, and everyday needs." },

    { type: 'h', text: "1. Understand Your Style" },
    { type: 'p', text: "Start by identifying your personal fashion preference. Minimal designs are ideal for everyday wear and subtle elegance, while bold and statement styles are better suited for special occasions and standout looks." },

    { type: 'h', text: "2. Select the Right Material" },
    { type: 'p', text: "Material plays an important role in both appearance and durability. Gold offers a luxurious and timeless appeal, silver provides a modern and versatile look, while alloy-based designs offer stylish affordability without compromising on aesthetics." },

    { type: 'h', text: "3. Focus on Fit & Comfort" },
    { type: 'p', text: "A well-fitted bracelet ensures maximum comfort throughout the day. It should neither be too tight nor too loose, allowing you to wear it easily for long hours without discomfort." },

    { type: 'h', text: "4. Consider Versatility" },
    { type: 'p', text: "Choose designs that can be styled with multiple outfits. Versatile bracelets allow you to pair them effortlessly with both casual and formal wear, giving you better value and more styling options." },

    { type: 'h', text: "5. Check Craftsmanship" },
    { type: 'p', text: "Always look for high-quality finishing, smooth edges, and durable construction. Good craftsmanship ensures your bracelet not only looks beautiful but also maintains its shine and strength over time." },

    { type: 'h', text: "Styling Tips – Elevate Your Look with Bracelets" },
    { type: 'p', text: "Bracelets are versatile fashion accessories that can instantly enhance your overall appearance and add a refined finishing touch to any outfit. With the right styling approach, you can create looks that feel balanced, modern, and effortlessly elegant while expressing your personal style." },
    { type: 'ul', items: [
        "Wear a single bracelet for a clean, minimal, and refined everyday look that feels simple yet sophisticated",
        "Stack multiple bracelets together to create a trendy layered style that adds depth, texture, and a fashion-forward edge",
        "Pair bold or statement bracelets with simple outfits to maintain visual balance and allow the jewellery to stand out as the focal point",
        "Match bracelets with watches for a coordinated, polished, and well-put-together appearance",
        "Choose minimal designs for everyday elegance, ensuring comfort, versatility, and effortless styling throughout the day"
    ]},

    { type: 'h', text: "Bracelets as Meaningful Gifts" },
    { type: 'p', text: "Bracelets are timeless and thoughtful gifts that carry deep emotional value and personal significance. More than just a fashion accessory, they symbolize love, connection, care, and lasting memories, making them a meaningful way to express appreciation for someone special." },
    { type: 'p', text: "Their versatile and elegant nature makes them suitable for people of all ages and styles, ensuring they always feel personal and memorable. Whether simple or detailed, a bracelet reflects thoughtfulness and turns any occasion into a lasting memory." },
    { type: 'p', text: "They are ideal for a wide range of special occasions, including:" },
    { type: 'ul', items: [
        "Birthdays",
        "Anniversaries",
        "Festivals",
        "Romantic occasions",
        "Personal milestones"
    ]},
    { type: 'p', text: "A carefully chosen bracelet is not just a piece of jewellery—it becomes a cherished keepsake that holds emotional value and can be treasured for years, keeping special moments alive forever." },

    { type: 'h', text: "Why Buy Bracelets Online?" },
    { type: 'p', text: "Shopping for bracelets online offers a seamless blend of convenience, variety, and informed decision-making, making it easier than ever to find the perfect piece that matches your style and preference. Instead of visiting multiple stores, you can explore a wide range of designs in one place and choose with confidence." },
    { type: 'p', text: "Online jewellery shopping gives you the freedom to browse collections at your own pace, compare different styles, and stay updated with the latest fashion trends—all from the comfort of your home. This makes the entire experience more flexible, time-saving, and enjoyable." },
    { type: 'p', text: "<strong>Benefits include:</strong>" },
    { type: 'ul', items: [
        "Wide collection of modern and traditional bracelet designs in one place",
        "Easy comparison of styles, materials, and prices before purchase",
        "Access to the latest jewellery trends and new arrivals",
        "Convenient shopping experience from home or mobile",
        "Secure checkout and reliable payment options for safe purchasing"
    ]},
    { type: 'p', text: "With these advantages, buying bracelets online becomes not only practical but also a smarter way to discover jewellery that truly fits your personality and lifestyle." },

    { type: 'h', text: "Materials & Craftsmanship in Bracelets" },
    { type: 'p', text: "Every bracelet in this collection is created using carefully selected materials that balance durability, comfort, and style. From premium gold finishes to modern alloy and stainless-steel bases, each piece is designed to maintain long-lasting shine and strength." },
    { type: 'p', text: "Craftsmanship plays a key role in defining quality. Smooth edges, precise detailing, and refined polishing ensure every bracelet feels premium while remaining comfortable for daily wear. Whether it is a minimal chain or a detailed statement design, attention to detail ensures lasting elegance." },

    { type: 'h', text: "Bracelet Size Guide – Find the Perfect Fit" },
    { type: 'p', text: "Choosing the right bracelet size is essential for both comfort and style. A well-fitted bracelet should sit naturally on your wrist without feeling too tight or too loose." },
    { type: 'p', text: "To find your ideal size:" },
    { type: 'ul', items: [
        "Measure your wrist using a flexible measuring tape",
        "Add a small allowance for comfort and movement",
        "Choose snug fit for minimal styles and slightly loose fit for statement designs"
    ]},
    { type: 'p', text: "A perfect fit ensures your bracelet looks elegant while remaining comfortable throughout the day." },

    { type: 'h', text: "Bracelet Care & Maintenance Tips" },
    { type: 'p', text: "Proper care helps maintain the shine and durability of your bracelets over time. Simple habits can keep your jewellery looking new for years." },
    { type: 'p', text: "<strong>Care guidelines:</strong>" },
    { type: 'ul', items: [
        "Avoid direct contact with perfumes, water, and chemicals",
        "Store bracelets in a soft pouch or jewellery box",
        "Clean gently using a soft cloth after use",
        "Remove before heavy physical activities or sleeping"
    ]},
    { type: 'p', text: "With proper care, your bracelets will retain their beauty and finish for a long time." },

    { type: 'h', text: "Seasonal Bracelet Trends You Should Know" },
    { type: 'p', text: "Bracelet fashion evolves with seasons and trends, allowing you to refresh your style throughout the year." },
    { type: 'ul', items: [
        "<strong>Summer Styles:</strong> Lightweight, minimal, and breathable designs",
        "<strong>Winter Looks:</strong> Bold chains, layered styles, and textured finishes",
        "<strong>Festive Trends:</strong> Gemstone and statement bracelets with rich detailing",
        "<strong>Everyday Fashion:</strong> Minimal luxe and unisex designs for daily wear"
    ]},
    { type: 'p', text: "Staying updated with seasonal trends helps you keep your jewellery style fresh and modern." },

    { type: 'h', text: "Layering & Stacking Bracelets Guide" },
    { type: 'p', text: "Stacking bracelets is one of the most popular modern styling trends. It allows you to mix different designs to create a personalized fashion statement." },
    { type: 'p', text: "Styling tips:" },
    { type: 'ul', items: [
        "Combine thin minimal bracelets with bold pieces for balance",
        "Mix textures like chain, beaded, and metal finishes",
        "Keep one focal piece and build around it",
        "Stick to 2–4 bracelets for a clean, stylish stack"
    ]},
    { type: 'p', text: "Layering adds depth and personality to your overall look." },

    { type: 'h', text: "Bracelets for Men – Strong & Modern Styling" },
    { type: 'p', text: "Men's bracelets are designed to reflect confidence, simplicity, and masculinity. These styles focus on bold chains, minimal bands, and structured designs that enhance everyday fashion." },
    { type: 'p', text: "Popular choices include:" },
    { type: 'ul', items: [
        "Leather-inspired designs",
        "Bold chain bracelets",
        "Minimal metallic bands",
        "Geometric and textured styles"
    ]},
    { type: 'p', text: "They pair effortlessly with casual, office, and party outfits, adding a refined masculine edge." },

    { type: 'h', text: "Bracelets for Women – Elegant & Fashion-Forward Designs" },
    { type: 'p', text: "Women's bracelets are crafted to highlight elegance, femininity, and grace. From delicate gold chains to modern gemstone accents, each piece enhances everyday and festive styling." },
    { type: 'p', text: "Popular styles include:" },
    { type: 'ul', items: [
        "Minimal chain bracelets",
        "Gold and gemstone designs",
        "Stackable fashion bracelets",
        "Statement occasion pieces"
    ]},
    { type: 'p', text: "These designs blend beautifully with both traditional and western outfits." },

    { type: 'h', text: "Occasion-Based Bracelet Styling" },
    { type: 'p', text: "Bracelets can be styled differently depending on the occasion, helping you create the perfect look every time." },
    { type: 'ul', items: [
        "<strong>Office Wear:</strong> Minimal and lightweight designs",
        "<strong>Casual Outings:</strong> Simple chain or stackable styles",
        "<strong>Festive Events:</strong> Gold and gemstone statement bracelets",
        "<strong>Parties:</strong> Bold and artistic designs for standout looks",
        "<strong>Gifting:</strong> Elegant minimal or symbolic bracelets"
    ]},
    { type: 'p', text: "Choosing the right style ensures a balanced and appropriate appearance." },

    { type: 'h', text: "The Symbolism of Bracelets" },
    { type: 'p', text: "Bracelets often carry deeper meaning beyond fashion. They are seen as symbols of connection, strength, love, and memory." },
    { type: 'p', text: "Many people choose bracelets to represent the following:" },
    { type: 'ul', items: [
        "Personal milestones",
        "Emotional bonds",
        "Relationships and friendships",
        "Cultural or spiritual beliefs"
    ]},
    { type: 'p', text: "This emotional value makes bracelets more than accessories—they become meaningful keepsakes." },

    { type: 'h', text: "Bracelets as Wardrobe Essentials" },
    { type: 'p', text: "A well-rounded jewellery collection is incomplete without bracelets. Their versatility makes them suitable for nearly every outfit and occasion." },
    { type: 'p', text: "They are essential because:" },
    { type: 'ul', items: [
        "They complement both casual and formal looks",
        "They can be worn alone or stacked",
        "They suit both men and women",
        "They adapt easily to changing fashion trends"
    ]},
    { type: 'p', text: "This makes bracelets a timeless and practical fashion essential." },

    { type: 'h', text: "Why This Bracelet Collection Stands Out" },
    { type: 'p', text: "This collection is designed with a focus on modern fashion needs while maintaining timeless elegance. Each piece is created to offer a perfect balance of style, comfort, and durability." },
    { type: 'p', text: "Key strengths:" },
    { type: 'ul', items: [
        "Wide variety of modern and classic designs",
        "Lightweight and comfortable wear",
        "Trend-driven yet timeless aesthetics",
        "Suitable for everyday wear and gifting",
        "High-quality craftsmanship and finishing"
    ]},
    { type: 'p', text: "It ensures every customer finds a bracelet that matches their personality and lifestyle." },

    { type: 'h', text: "Why Choose Our Bracelets Collection" },
    { type: 'p', text: "Whether you prefer minimal everyday jewellery or bold statement styles, this collection offers versatile options that suit every personality, outfit, and occasion. The designs are made to seamlessly blend with both casual and formal looks, giving you effortless styling flexibility in <a href=\"#\">semi-handmade jewellery</a>." },
    { type: 'h', text: "Highlights:" },
    { type: 'ul', items: [
        "Stylish designs for both men and women",
        "Lightweight and comfortable for all-day wear",
        "Trend-focused yet timeless designs that never go out of style",
        "Durable craftsmanship with premium finishing for long-lasting use",
        "Perfect for daily wear as well as meaningful gifting"
    ]},
    { type: 'p', text: "Each bracelet is created to enhance your personal style while delivering lasting quality, making it a valuable addition to any modern jewellery collection." },
];

const flattenContent = (content) => {
    const arr = [];
    content.forEach((item) => {
        if (item.type === 'ul') {
            item.items.forEach((it) => arr.push(it));
        } else {
            arr.push(item.text);
        }
    });
    return arr;
};

const rebuildContent = (originalContent, translatedArr) => {
    let i = 0;
    return originalContent.map((item) => {
        if (item.type === 'ul') {
            const newItems = item.items.map(() => translatedArr[i++]);
            return { ...item, items: newItems };
        }
        return { ...item, text: translatedArr[i++] };
    });
};

const flattenFaq = (data) => { const arr = []; data.forEach((item) => { arr.push(item.q); arr.push(item.a); }); return arr; };
const rebuildFaq = (translatedArr) => {
    const result = [];
    for (let i = 0; i < translatedArr.length; i += 2) {
        result.push({ q: translatedArr[i], a: translatedArr[i + 1] });
    }
    return result;
};

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────
function getImgSrc(path) {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
}

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
function QuickViewModal({ product, currency, ui, onClose, onAddToCart, wishlist, onToggleWishlist }) {
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const variant = getFirstVariant(product);
    const images = variant.images || [];
    const categoryUrl = categorySlugMap[product.category] || 'bracelets';

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

                <div style={{ flex: '1 1 300px', minWidth: '240px', padding: '24px 16px 24px 24px' }}>
                    <div style={{
                        background: '#f7f6f4', borderRadius: '6px',
                        aspectRatio: '1/1', overflow: 'hidden', marginBottom: '12px',
                    }}>
                        {images.length > 0 ? (
                            <img
                                src={getImgSrc(images[activeImg])}
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
                                        src={getImgSrc(img)}
                                        alt={`view ${i + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ flex: '1 1 280px', padding: '32px 24px 24px 16px', minWidth: '240px' }}>
                    {variant.isSale && (
                        <span style={{
                            background: '#1a1a1a', color: '#fff',
                            fontSize: '11px', letterSpacing: '1px',
                            padding: '3px 8px', borderRadius: '2px',
                            display: 'inline-block', marginBottom: '10px',
                        }}>
                            {ui.sale}
                        </span>
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
                                : ui.priceOnRequest}
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
                        >
                            {ui.addToCart}
                        </button>
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
                                {ui.addToWishlist}
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
//  PRODUCT CARD
// ─────────────────────────────────────────────────────────
function ProductCard({ p, wishlist, toggleWishlist, ui, currency, onQuickView, onAddToCart }) {
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

    const imgSrc = images.length > 0 ? getImgSrc(images[currentImg]) : '/placeholder.jpg';

    const oldPrice = variant.oldPrice;
    const newPrice = variant.newPrice;
    const isSale = variant.isSale;

    const categoryUrl = categorySlugMap[p.category] || 'bracelets';

    return (
        <Link
            href={`/product-category/${categoryUrl}/${p.slug}`}
            className="jw-card"
            onMouseEnter={startHover}
            onMouseLeave={stopHover}
        >
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">{ui.sale}</span>}

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
                            <span
                                key={i}
                                className={`jw-img-dot ${i === currentImg ? 'jw-img-dot--active' : ''}`}
                            />
                        ))}
                    </div>
                )}

                <div className="jw-card-actions">
                    {/* ── WISHLIST BUTTON ── */}
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
                        title={ui.addToWishlist}
                        aria-label={ui.addToWishlist}
                    >
                        <svg width="16" height="15" viewBox="0 0 16 15" fill="none">
                            <path
                                d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z"
                                stroke="currentColor" strokeWidth="1.3"
                                fill={wishlist.includes(p._id) ? 'currentColor' : 'none'}
                            />
                        </svg>
                    </button>

                    {/* ── QUICK VIEW BUTTON ── */}
                    <button
                        className="jw-action-btn"
                        title={ui.quickView}
                        aria-label={ui.quickView}
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

                    {/* ── ADD TO CART BUTTON ── */}
                    <button
                        className="jw-action-btn jw-add-cart"
                        title={ui.addToCart}
                        aria-label={ui.addToCart}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddToCart(p, 1);
                        }}
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
                <h3 className="jw-card-name">{p.title || p.name}</h3>
                <div className="jw-card-price">
                    {oldPrice && (
                        <span className="jw-old-price">
                            {formatPrice(oldPrice, currency)}
                        </span>
                    )}
                    {newPrice !== null && newPrice !== undefined ? (
                        <span className="jw-new-price">
                            {formatPrice(newPrice, currency)}
                        </span>
                    ) : (
                        <span className="jw-new-price jw-price-na">{ui.priceOnRequest}</span>
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
//  MAIN BRACELETS PAGE
// ─────────────────────────────────────────────────────────
export default function Bracelets() {
    const router = useRouter();

    // ── Translation state ──
    const [ui, setUi] = useState(DEFAULT_UI);
    const [translatedBraceletsContent, setTranslatedBraceletsContent] = useState(bracelets_content);
    const [translatedFaq, setTranslatedFaq] = useState(faqData);
    const [translatedCategories, setTranslatedCategories] = useState(
        categories.map((c) => ({ ...c, translatedName: c.name }))
    );
    const [translationStatus, setTranslationStatus] = useState("idle");

    // ── Currency ──
    const [currency, setCurrency] = useState(CURRENCY_MAP.default);

    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Bracelets");

    const [perPage, setPerPage] = useState(30);
    const [sort, setSort] = useState("default");

    // ── Wishlist — WishlistContext se (navbar count auto update hoga) ──
    const { wishlistItems, addToWishlist, removeFromWishlist: removeFromWishlistCtx } = useWishlist();
    const wishlist = (wishlistItems || []).map(item => item._id || item);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Quick View state ──
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    // ── Toast state ──
    const [toast, setToast] = useState({ visible: false, message: '' });
    const toastTimer = useRef(null);

    const layoutRef = useRef(null);
    const sidebarRef = useRef(null);

    // ── Show toast helper ──
    const showToast = useCallback((message) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ visible: true, message });
        toastTimer.current = setTimeout(() => {
            setToast({ visible: false, message: '' });
        }, 2500);
    }, []);

    useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

    // ── Translation ──
    const translateContent = useCallback(async () => {
        try {
            setTranslationStatus("loading");
            const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
            const detectData = await detectRes.json();
            if (!detectData.success) throw new Error("Language detection failed");

            const { languageCode, countryCode } = detectData;
            if (countryCode && CURRENCY_MAP[countryCode]) setCurrency(CURRENCY_MAP[countryCode]);

            if (languageCode === "en") { setTranslationStatus("done"); return; }

            const allStrings = [
                ...flattenUI(DEFAULT_UI),
                ...flattenContent(bracelets_content),
                ...flattenFaq(faqData),
                ...flattenCategories(categories),
            ];

            const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts: allStrings, targetLanguage: languageCode, sourceLanguage: "en" }),
            });
            const translateData = await translateRes.json();
            if (!translateData.success) throw new Error("Translation failed");

            const all = translateData.translations;
            const uiCount = flattenUI(DEFAULT_UI).length;
            const contentCount = flattenContent(bracelets_content).length;
            const faqCount = faqData.length * 2;

            setUi(rebuildUI(all.slice(0, uiCount)));
            setTranslatedBraceletsContent(rebuildContent(bracelets_content, all.slice(uiCount, uiCount + contentCount)));
            setTranslatedFaq(rebuildFaq(all.slice(uiCount + contentCount, uiCount + contentCount + faqCount)));
            setTranslatedCategories(rebuildCategories(categories, all.slice(uiCount + contentCount + faqCount)));
            setTranslationStatus("done");
        } catch (err) {
            console.error("Auto-translate error:", err.message);
            setTranslationStatus("error");
        }
    }, []);

    useEffect(() => { translateContent(); }, [translateContent]);

    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        const urlSlug = categorySlugMap[categoryName] || 'bracelets';
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
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data = await res.json();
                if (data.success) {
                    setProducts(data.products || []);
                } else {
                    throw new Error(data.message || 'Failed to fetch');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [activeCategory]);

    // ── Wishlist toggle — WishlistContext se (WishlistPage jaisa pattern) ──
    const toggleWishlist = useCallback((id, productData) => {
        if (wishlist.includes(id)) {
            removeFromWishlistCtx(id);
        } else {
            addToWishlist(productData || { _id: id });
        }
    }, [wishlist, addToWishlist, removeFromWishlistCtx]);

    // ── Add to Cart — custom event pattern (CartContext picks this up) ──
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

    // ── Quick View open/close ──
    const openQuickView = useCallback((product) => {
        setQuickViewProduct(product);
    }, []);

    const closeQuickView = useCallback(() => {
        setQuickViewProduct(null);
    }, []);

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

            {translationStatus === "loading" && (
                <div className="translation-loading-bar" aria-hidden="true" />
            )}

            {/* ── Toast ── */}
            <Toast message={toast.message} visible={toast.visible} />

            {/* ── Quick View Modal ── */}
            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    currency={currency}
                    ui={ui}
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
                {ui.filtersText}
            </button>

            {sidebarOpen && <div className="jw-overlay" onClick={() => setSidebarOpen(false)} />}

            <div className="jw-layout" ref={layoutRef}>

                <div className="jw-sidebar-wrapper">
                    <aside
                        ref={sidebarRef}
                        className={`jw-sidebar ${sidebarOpen ? 'jw-sidebar--open' : ''}`}
                    >
                        <div className="jw-sidebar-inner">
                            <button className="jw-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>

                            {/* ── Categories ── */}
                            <div className="jw-filter-block">
                                <button
                                    className="jw-filter-heading"
                                    onClick={() => setCatOpen(!catOpen)}
                                    aria-expanded={catOpen}
                                >
                                    <span>{ui.productCategories}</span>
                                    <span className={`jw-chevron ${catOpen ? 'jw-chevron--up' : ''}`}>
                                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                </button>
                                <div className={`jw-filter-body ${catOpen ? 'jw-filter-body--open' : ''}`}>
                                    <ul className="jw-cat-list">
                                        {translatedCategories.map((c) => (
                                            <li key={c.name}>
                                                <button
                                                    className={`jw-cat-item ${activeCategory === c.name ? 'jw-cat-item--active' : ''}`}
                                                    onClick={() => handleCategoryClick(c.name)}
                                                >
                                                    <svg className="jw-cat-arrow" width="6" height="10" viewBox="0 0 6 10" fill="none">
                                                        <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                                    </svg>
                                                    <span className="jw-cat-name">{c.translatedName}</span>
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

                    <h1 className="jw-title">{ui.pageTitle}</h1>

                    {/* ── Toolbar ── */}
                    <div className="jw-toolbar">
                        <span className="jw-results-count">
                            {loading
                                ? ui.loadingText
                                : `${ui.showingOf} ${displayed.length} of ${filtered.length} ${ui.showingResults}`}
                        </span>
                        <div className="jw-toolbar-right">
                            <div className="jw-per-page">
                                <span className="jw-per-label">{ui.showText}</span>
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
                                    <option value="default">{ui.defaultSorting}</option>
                                    <option value="price-asc">{ui.priceLowHigh}</option>
                                    <option value="price-desc">{ui.priceHighLow}</option>
                                    <option value="newest">{ui.newest}</option>
                                </select>
                                <span className="jw-select-arrow">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                    </svg>
                                </span>
                            </div>
                            <button className="jw-grid-toggle" title={ui.gridView}>
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
                            <button onClick={() => setActiveCategory(activeCategory)}>{ui.retry}</button>
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
                                    ui={ui}
                                    currency={currency}
                                    onQuickView={openQuickView}
                                    onAddToCart={handleAddToCart}
                                />
                            ))
                        ) : (
                            <div className="jw-empty">
                                <p>{ui.noProductsBase}{activeCategory ? ` in "${activeCategory}"` : ''}.</p>
                                <p style={{ fontSize: '13px', marginTop: '8px', color: '#aaa' }}>
                                    {ui.checkConsole}
                                </p>
                            </div>
                        )}
                    </div>

                </main>
            </div>
            <Reviews />

            {/* ── Bottom Accordions ── */}
            <div className="jw-bottom-accordions">

                <AccordionItem title={ui.everydayJewellery}>
                    <div className="jw-accordion-text">
                        {translatedBraceletsContent.map((item, i) => {
                            if (item.type === 'h') {
                                return <h3 key={i} className="jw-accordion-heading">{item.text}</h3>;
                            }
                            if (item.type === 'ul') {
                                return (
                                    <ul key={i} className="jw-accordion-ul">
                                        {item.items.map((it, j) => (
                                            <li key={j} dangerouslySetInnerHTML={{ __html: it }} />
                                        ))}
                                    </ul>
                                );
                            }
                            return <p key={i} dangerouslySetInnerHTML={{ __html: item.text }} />;
                        })}
                    </div>
                </AccordionItem>

                <AccordionItem title={ui.faq}>
                    <div className="jw-faq-list">
                        {translatedFaq.map((item, i) => (
                            <div key={i} className="jw-faq-item">
                                <p className="jw-faq-q">{i + 1}. {item.q}</p>
                                <p className="jw-faq-a">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </AccordionItem>

            </div>
        </div>
    );
}