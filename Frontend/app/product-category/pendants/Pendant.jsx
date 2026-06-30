'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Pendants.css';
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
    everydayJewellery: "Everyday Wear Jewellery",
    faq: "Frequently Asked Questions",
    retry: "Retry",
    gridView: "Grid view",
    addToWishlist: "Add to Wishlist",
    quickView: "Quick View",
    addToCart: "Add to Cart",
    sale: "SALE",
    noProductsBase: "No products found",
    checkConsole: "Check browser console (F12) for API response.",
    showingOf: "Showing",
    showingResults: "results",
    pageTitle: "Lightweight Daily Wear Fine Jewellery for Everyday Style",
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
    { q: "What are pendants in jewellery?", a: "Pendants are decorative jewellery pieces that hang from a chain and enhance the beauty of a necklace." },
    { q: "Can pendants be worn daily?", a: "Yes, minimal and lightweight pendants are perfect for everyday wear." },
    { q: "What types of pendants are available?", a: "You can find gold pendants, gemstone pendants, minimalist pendants, and statement designs." },
    { q: "What is a gold pendant?", a: "A gold pendant is crafted in gold or gold-plated material, offering a timeless and elegant look." },
    { q: "Are gemstone pendants suitable for daily wear?", a: "Yes, lightweight gemstone pendants can be worn daily, but they are especially popular for special occasions." },
    { q: "How do I choose the right pendant?", a: "Choose based on your style, outfit, occasion, and comfort preference." },
    { q: "Are pendants good for gifting?", a: "Yes, pendants are meaningful, stylish, and perfect for birthdays, anniversaries, and celebrations." },
    { q: "What is a minimalist pendant?", a: "A minimalist pendant features simple and clean designs ideal for subtle everyday elegance." },
    { q: "Can I wear a pendant with any chain?", a: "Yes, but it is best to match the chain thickness and length with the pendant design." },
    { q: "What chain length is best for pendants?", a: "Short chains create a minimal look, while medium and long chains are great for layering styles." },
    { q: "Are pendants suitable for office wear?", a: "Yes, simple and elegant pendants are perfect for professional and office looks." },
    { q: "Can pendants be layered together?", a: "Yes, layering multiple pendants is a modern and stylish trend." },
    { q: "What materials are used in pendants?", a: "Common materials include gold, silver, stainless steel, and alloy with gemstone detailing." },
    { q: "Do pendants go out of fashion?", a: "No, pendants are timeless jewellery pieces that always remain in style." },
    { q: "Are gemstone pendants real stones?", a: "They can include natural, semi-precious, or synthetic stones depending on the design." },
    { q: "Can men wear pendants?", a: "Yes, many pendant designs are unisex and suitable for men as well." },
    { q: "How do I take care of my pendant?", a: "Keep it away from moisture, perfumes, and chemicals to maintain shine and durability." },
    { q: "Are minimalist pendants trending?", a: "Yes, minimalist jewellery is one of the most popular modern fashion trends." },
    { q: "Can I wear a pendant with ethnic outfits?", a: "Yes, pendants pair beautifully with both ethnic and western outfits." },
    { q: "Why should I buy pendants online?", a: "Online shopping offers more variety, better price comparison, and access to the latest designs in one place." },
];

const pendantsContent = [
    { type: 'h', text: "Pendant Necklaces – Effortless Elegance for Every Look" },
    { type: 'p', text: "<strong>Pendant necklaces</strong> are one of the most versatile and timeless jewellery essentials, offering a perfect blend of simplicity, elegance, and everyday practicality. Designed to rest gracefully along the neckline, they enhance your overall appearance with a subtle charm that feels effortless yet refined. Unlike heavy or overly elaborate jewellery, pendant necklaces focus on clean design and graceful detailing that naturally complements your style without overpowering it." },
    { type: 'p', text: "Whether styled with western outfits, traditional attire, or casual everyday wear, pendant necklaces adapt seamlessly to every look. A simple <strong>minimal pendant</strong> can elevate a basic outfit, while a slightly more detailed design can add sophistication to festive or evening wear. This flexibility makes them a must-have accessory in every modern jewellery collection." },
    { type: 'p', text: "Modern pendant necklaces are crafted with a strong focus on comfort and durability. Lightweight chains, smooth finishing, and carefully designed pendants ensure they can be worn comfortably throughout the day without irritation. At the same time, attention to fine detailing gives each piece a premium and polished appearance that stands out in a subtle way." },
    { type: 'p', text: "From delicate chains with tiny symbolic charms to bold artistic and contemporary designs, <strong>pendant necklaces</strong> offer something for every personality and occasion. Whether you prefer understated elegance or expressive fashion statements, these pieces reflect individuality, confidence, and timeless beauty in every design." },

    { type: 'h', text: "Minimalist Pendants – Subtle Luxury for Everyday Style" },
    { type: 'p', text: "<strong>Minimalist pendants</strong> are designed for those who appreciate clean, understated fashion and the beauty of simplicity. Instead of heavy detailing or bold designs, these pieces focus on subtle elegance, fine craftsmanship, and balanced proportions that feel effortless yet refined. Their charm lies in how naturally they blend into everyday styling while still adding a polished finishing touch to your overall look." },
    { type: 'p', text: "Perfect for <strong>daily wear, minimalist pendants</strong> are crafted with lightweight materials and smooth finishes that ensure comfort throughout the day. You can wear them for long hours without feeling heaviness or irritation, making them ideal for busy routines such as office work, college, travel, or casual outings. Despite their simplicity, they elevate even the most basic outfits with a quiet sense of sophistication." },
    { type: 'p', text: "These pendants are especially popular among professionals and students who prefer effortless styling without over-accessorizing. A single minimal pendant can complete a look on its own while still maintaining a clean and professional appearance suitable for any environment." },
    { type: 'p', text: "Minimalist designs also work beautifully with modern layering trends. You can combine multiple delicate chains of varying lengths to create a soft, stylish layered look that feels contemporary and personalized. This flexibility makes minimalist pendants not only timeless but also highly adaptable to evolving fashion styles." },

    { type: 'h', text: "Gold Pendants – Classic Beauty with Modern Design" },
    { type: 'p', text: "<strong>Gold pendants</strong> remain one of the most timeless and cherished jewellery choices, symbolizing elegance, tradition, and understated luxury. Their appeal lies in their ability to stay relevant across generations while still adapting to modern fashion sensibilities. Today's gold pendant designs beautifully combine classic inspiration with contemporary minimal aesthetics, making them suitable not only for special occasions but also for everyday wear." },
    { type: 'p', text: "Modern gold pendants are crafted with a focus on versatility and simplicity. From sleek gold bars and clean geometric shapes to delicate motifs inspired by traditional artistry, each design offers a unique way to express personal style. This blend of old and new ensures that gold pendants never feel outdated, instead evolving with changing fashion trends while retaining their timeless charm." },
    { type: 'p', text: "One of the biggest strengths of gold pendants is their adaptability. They pair effortlessly with both ethnic and western outfits, making them a reliable accessory for all kinds of occasions. Whether worn with a casual everyday look, office attire, or festive clothing, a gold pendant adds a subtle touch of sophistication without overpowering the outfit." },
    { type: 'p', text: "Beyond style, <strong>gold pendants</strong> also carry emotional and gifting value. Their lasting appeal and precious nature make them a thoughtful choice for meaningful occasions, representing love, celebration, and lasting memories. This combination of beauty, versatility, and significance makes gold pendants a true staple in any jewellery collection." },

    { type: 'h', text: "Gemstone Pendants – Colorful Expression of Personality" },
    { type: 'p', text: "<strong>Gemstone pendants</strong> are a vibrant celebration of color, individuality, and personal expression. Unlike plain metal designs, each gemstone carries its own natural character, texture, and charm, making every pendant feel unique and meaningful. This individuality is what makes gemstone jewellery so special—it's not just about style, but also about identity and expression." },
    { type: 'p', text: "These pendants range from soft, pastel-hued stones that offer a subtle elegance to rich, bold tones that instantly draw attention. Whether you prefer calming blues, passionate reds, or earthy greens, gemstone pendants allow you to reflect your mood and personality through colour. This makes them a perfect choice for those who enjoy adding a creative and expressive touch to their jewellery collection." },
    { type: 'p', text: "Gemstone pendants are especially popular for festive wear and special occasions, where a touch of colour can elevate even the simplest outfit. They bring a refreshing contrast to neutral clothing and enhance traditional as well as modern styles effortlessly. Whether paired with ethnic attire or contemporary outfits, they always stand out in a graceful way." },
    { type: 'p', text: "Beyond aesthetics, many <strong>gemstone pendants</strong> are also chosen for their symbolic and emotional meanings. People often associate specific stones with positivity, strength, love, or protection, which adds a deeper layer of significance. This makes them not only beautiful accessories but also thoughtful and meaningful gifts for birthdays, anniversaries, and personal milestones." },

    { type: 'h', text: "Everyday Pendants – Lightweight & Comfortable Styling" },
    { type: 'p', text: "<strong>Everyday pendants</strong> are thoughtfully designed for comfort, durability, and effortless daily styling. Built with lightweight materials and smooth finishing, they ensure a pleasant wearing experience throughout long hours without causing irritation or heaviness. This makes them an ideal choice for individuals who prefer jewellery that feels as natural as it looks stylish." },
    { type: 'p', text: "Their simple and minimal designs are what make them so versatile. Whether you're heading to the office, attending college, traveling, or stepping out for casual plans, everyday pendants add a subtle touch of elegance without overpowering your outfit. They blend seamlessly with both western and traditional wear, helping you maintain a neat and polished appearance all day long." },
    { type: 'p', text: "Unlike heavier statement pieces, everyday pendants focus on practicality while still maintaining a refined aesthetic. This balance of style and function makes them suitable for consistent use, especially for people with active routines who don't want to change accessories frequently." },
    { type: 'p', text: "Ultimately, <strong>everyday pendants</strong> are a staple for modern jewellery wardrobes—offering effortless beauty, long-lasting comfort, and a clean, minimal look that works in almost every setting." },

    { type: 'h', text: "Trending Pendant Styles You Should Explore" },
    { type: 'p', text: "Trending pendant styles are constantly evolving with modern fashion, blending creativity, symbolism, and everyday wearability. Today's jewellery trends focus on self-expression and versatility, allowing you to choose designs that match your personality, outfit, and occasion effortlessly. Whether you prefer minimal elegance or bold fashion statements, these styles help you stay current while maintaining a timeless appeal." },
    { type: 'p', text: "<strong>1. Geometric pendants</strong> are among the most popular modern choices, featuring clean lines, structured shapes, and contemporary symmetry. Their minimal yet artistic look makes them perfect for those who appreciate a modern aesthetic that feels both stylish and refined." },
    { type: 'p', text: "<strong>2. Layered pendants</strong> are ideal for creating a trendy, fashion-forward look. By combining multiple chains and pendants of varying lengths, you can achieve a stylish stacked effect that adds depth and personality to your outfit. This style works especially well with both casual and semi-formal wear." },
    { type: 'p', text: "<strong>3. Symbolic pendants</strong> carry deeper meaning through designs such as hearts, initials, crosses, or spiritual motifs. These pieces are not just decorative but also personal, often representing love, beliefs, or important life connections, making them highly meaningful and emotional." },
    { type: 'p', text: "<strong>4. Nature-inspired pendants</strong> draw creativity from the natural world, featuring floral patterns, leaves, vines, and organic shapes. These designs bring a soft, graceful touch to your jewellery collection and are perfect for those who prefer calm, elegant styling." },
    { type: 'p', text: "<strong>5. Statement pendants</strong> are bold, expressive, and designed to stand out. With artistic shapes and eye-catching details, they instantly become the focal point of any outfit, making them perfect for special occasions or when you want your jewellery to reflect confidence and individuality." },

    { type: 'h', text: "How to Style Pendants for a Modern Look" },
    { type: 'p', text: "<strong>Styling pendants</strong> the right way can instantly transform your outfit and enhance your overall appearance. A well-chosen pendant not only completes your look but also adds personality, balance, and elegance to your style. Whether you prefer minimal fashion or bold statement pieces, the right styling approach can make a significant difference." },
    { type: 'p', text: "<strong>1.</strong> Wear a <strong>single minimal pendant</strong> for a clean, elegant, and effortless everyday look. This style works perfectly for office wear, casual outfits, and situations where subtle sophistication is preferred." },
    { type: 'p', text: "<strong>2.</strong> Layer multiple pendants of different lengths to create a trendy, fashion-forward appearance. Layering adds depth and dimension to your neckline, giving your outfit a modern and stylish edge." },
    { type: 'p', text: "<strong>3.</strong> Pair <a href=\"#\">gemstone pendants</a> with solid-colored outfits to create a balanced and visually appealing contrast. The natural colors of gemstones stand out beautifully when matched with simple clothing tones." },
    { type: 'p', text: "<strong>4.</strong> Use <strong>statement pendants</strong> as the focal point of your outfit. Keep the rest of your jewellery minimal so the pendant becomes the highlight of your overall look, especially for parties or special occasions." },
    { type: 'p', text: "<strong>5.</strong> Match <strong>gold pendants</strong> with warm-toned clothing such as beige, brown, maroon, or earthy shades to achieve a rich, classic, and elegant aesthetic that feels timeless and refined." },

    { type: 'h', text: "Pendants as Meaningful Jewellery Gifts" },
    { type: 'p', text: "<strong>Pendants</strong> are one of the most timeless and thoughtful jewellery gifts, cherished for both their beauty and emotional significance. Unlike many accessories, a pendant carries a personal touch that reflects care, affection, and a deeper emotional connection, making it a meaningful choice for every special moment." },
    { type: 'p', text: "Their universal appeal makes them suitable for people of all ages, styles, and preferences. Whether simple and minimal or detailed and expressive, pendants can easily match the personality of the receiver, making the gift feel more personal and special." },
    { type: 'p', text: "Whether you are celebrating a birthday, anniversary, festival, or personal milestone, a pendant serves as a lasting reminder of love and togetherness. It symbolizes memories shared and emotions expressed, turning a simple piece of jewellery into something truly meaningful." },
    { type: 'p', text: "One of the biggest advantages of gifting pendants is their everyday usability. They can be worn regularly with both casual and formal outfits, ensuring that the sentiment behind the gift stays close to the wearer every day. Over time, they become more than just jewellery—they become a cherished memory that lasts for years." },

    { type: 'h', text: "Pendant Chains – Perfect Pairing for Every Pendant" },
    { type: 'p', text: "<strong>Pendant chains</strong> play a crucial role in enhancing the overall look of your jewellery. The right chain not only supports the pendant but also defines its style and visual appeal. From delicate fine chains to bold link designs, each option creates a different fashion statement." },
    { type: 'p', text: "Thin chains are ideal for minimal and lightweight pendants, offering a subtle and elegant look. Medium and slightly thicker chains work well with gemstone or statement pendants, adding balance and presence. Choosing the right chain ensures your pendant sits perfectly and complements your neckline beautifully." },
    { type: 'p', text: "Modern pendant chains are designed for comfort and durability, making them suitable for daily wear as well as special occasions." },

    { type: 'h', text: "Pendant Necklaces for Women – Elegant Everyday Fashion" },
    { type: 'p', text: "<strong>Pendant necklaces for women</strong> are designed to combine beauty, comfort, and versatility in one timeless accessory. They enhance feminine elegance while remaining simple enough for everyday styling." },
    { type: 'p', text: "These necklaces are perfect for modern women who want jewellery that transitions effortlessly between different roles—office wear, casual outings, festive events, or evening gatherings. A single pendant necklace can elevate even the simplest outfit with a touch of sophistication." },
    { type: 'p', text: "From minimal designs to stylish modern patterns, these pieces reflect personality, confidence, and effortless charm." },

    { type: 'h', text: "Lightweight Pendants – Designed for All-Day Comfort" },
    { type: 'p', text: "<strong>Lightweight pendants</strong> are ideal for those who prefer jewellery that feels easy and comfortable throughout the day. Crafted with fine detailing and minimal weight, they ensure you can wear them for long hours without discomfort." },
    { type: 'p', text: "These pendants are perfect for office professionals, students, travelers, and anyone with an active lifestyle. Despite their light structure, they maintain a polished and elegant appearance that enhances your overall look." },
    { type: 'p', text: "Their simplicity makes them versatile, allowing them to match both casual and formal outfits effortlessly." },

    { type: 'h', text: "Pendant Jewellery for Office Wear – Subtle & Professional Style" },
    { type: 'p', text: "Pendant jewellery for office wear focuses on minimal elegance and clean design. These pieces are crafted to enhance your professional look without appearing too bold or distracting." },
    { type: 'p', text: "<strong>Simple geometric pendants, small gemstone accents, or minimal gold designs</strong> are ideal choices for workplace styling. They add just the right amount of sophistication while maintaining a neat and polished appearance." },
    { type: 'p', text: "These designs are especially suitable for daily professional use, helping you maintain confidence and style in a subtle way." },

    { type: 'h', text: "Statement Pendants – Bold Designs That Stand Out" },
    { type: 'p', text: "<strong>Statement pendants</strong> are designed for those who love expressive and fashion-forward jewellery. With bold shapes, artistic detailing, and eye-catching designs, they instantly become the focal point of any outfit." },
    { type: 'p', text: "Perfect for parties, celebrations, and special occasions, statement pendants help you showcase personality and confidence. They pair best with simple outfits, allowing the pendant to stand out beautifully without competition." },
    { type: 'p', text: "These designs are ideal for making a strong style impression." },

    { type: 'h', text: "Pendant Jewellery Trends 2026" },
    { type: 'p', text: "Modern pendant trends focus on simplicity, personalization, and versatility. Some of the most popular trends include:" },
    { type: 'ul', items: [
        "Minimal geometric pendants with clean shapes",
        "Layered necklace styling with multiple pendants",
        "Initial and name pendants for personalization",
        "Nature-inspired designs like leaves and florals",
        "Mixed-metal pendant styles for modern fashion appeal"
    ]},
    { type: 'p', text: "These trends reflect the shift toward jewellery that is both stylish and meaningful, suitable for everyday wear." },

    { type: 'h', text: "How to Care for Pendant Jewellery" },
    { type: 'p', text: "Proper care helps maintain the shine and durability of your pendants for a long time. Always store your jewellery in a dry place, preferably in a soft pouch or box to avoid scratches." },
    { type: 'p', text: "Avoid contact with water, perfumes, and harsh chemicals, as they may affect the finish. Clean your pendants gently with a soft cloth to preserve their shine and detailing." },
    { type: 'p', text: "With proper care, your pendant jewellery will continue to look beautiful and elegant for years." },

    { type: 'h', text: "Why Pendant Jewellery Is a Smart Fashion Investment" },
    { type: 'p', text: "<strong>Pendant jewellery</strong> is not just a style accessory—it is a long-term fashion investment. Its timeless appeal ensures it never goes out of trend, making it a reliable part of any jewellery collection." },
    { type: 'p', text: "Pendants offer excellent versatility, allowing you to style them in multiple ways with different outfits. Whether minimal or bold, they adapt easily to changing fashion trends while maintaining their classic charm." },
    { type: 'p', text: "This makes pendants a smart choice for both personal use and gifting purposes." },

    { type: 'h', text: "Why Pendants Are a Must-Have Jewellery Essential" },
    { type: 'p', text: "<strong>Pendants</strong> are among the most versatile and essential jewellery pieces, valued for their ability to adapt effortlessly to different styles and occasions. Their simple yet elegant design allows them to be worn in countless ways, making them a foundational element in any modern jewellery collection." },
    { type: 'p', text: "One of their biggest strengths is their flexibility. Pendants pair beautifully with all types of chains, from delicate minimal styles to bold statement links. They also work perfectly for layered necklace looks, allowing you to mix different lengths and designs to create a trendy, personalized style. At the same time, a single pendant worn alone can deliver a clean and refined aesthetic that never goes out of fashion." },
    { type: 'p', text: "Pendants also transition seamlessly between casual and formal wear. A minimal design can enhance everyday outfits like office wear or casual looks, while more detailed or gemstone styles can elevate festive or special occasion outfits. This adaptability makes them a reliable choice for any setting." },
    { type: 'p', text: "Whether your style is simple and understated or bold and expressive, pendants offer something for everyone. Their combination of elegance, practicality, and timeless appeal ensures they remain a must-have <a href=\"#\">fine jewellery online</a> essential in every collection." },
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
            position: 'fixed', bottom: '24px', left: '50%',
            transform: 'translateX(-50%)',
            background: '#1a1a1a', color: '#fff',
            padding: '12px 24px', borderRadius: '4px',
            fontSize: '14px', zIndex: 9999,
            pointerEvents: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease',
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

    const categoryArr = Array.isArray(product.category) ? product.category : [product.category];
    const categoryUrl = categoryArr.map(c => categorySlugMap[c]).find(Boolean) || 'pendants';

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
                    position: 'relative', flexWrap: 'wrap',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
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
                                        borderRadius: '4px', overflow: 'hidden',
                                        cursor: 'pointer', background: '#f7f6f4',
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

                {/* Details */}
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
                        {Array.isArray(product.category) ? product.category.join(', ') : product.category}
                    </p>
                    <h2 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 14px', lineHeight: 1.3 }}>
                        {product.title || product.name}
                    </h2>

                    {/* Price */}
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

                    {/* Qty */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '13px', color: '#555' }}>Qty:</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>−</button>
                            <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '14px' }}>{qty}</span>
                            <button onClick={() => setQty(q => q + 1)}
                                style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>+</button>
                        </div>
                    </div>

                    {/* Actions */}
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
//  ACCORDION
// ─────────────────────────────────────────────────────────
function AccordionItem({ title, children }) {
    const [open, setOpen] = useState(false);
    const bodyRef = useRef(null);
    return (
        <div className="jw-accordion-item">
            <button className={`jw-accordion-trigger ${open ? 'jw-accordion-trigger--open' : ''}`}
                onClick={() => setOpen(!open)} aria-expanded={open}>
                <span className="jw-accordion-arrow">
                    <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                </span>
                <span>{title}</span>
            </button>
            <div ref={bodyRef} className="jw-accordion-body"
                style={{ maxHeight: open ? bodyRef.current?.scrollHeight + 'px' : '0px' }}>
                <div className="jw-accordion-content">{children}</div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
//  PRODUCT CARD
// ─────────────────────────────────────────────────────────
function ProductCard({ p, wishlist, toggleWishlist, currency, ui, onQuickView, onAddToCart }) {
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

    const categoryArr = Array.isArray(p.category) ? p.category : [p.category];
    const categoryUrl = categoryArr.map(c => categorySlugMap[c]).find(Boolean) || 'pendants';

    return (
        <Link href={`/product-category/${categoryUrl}/${p.slug}`} className="jw-card"
            onMouseEnter={startHover} onMouseLeave={stopHover}>
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">{ui.sale}</span>}
                <img src={imgSrc} alt={p.title} className="jw-card-img" loading="lazy"
                    onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
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
                            e.preventDefault(); e.stopPropagation();
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
                            <path d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z"
                                stroke="currentColor" strokeWidth="1.3"
                                fill={wishlist.includes(p._id) ? 'currentColor' : 'none'} />
                        </svg>
                    </button>

                    {/* Quick View */}
                    <button
                        className="jw-action-btn"
                        title={ui.quickView}
                        aria-label={ui.quickView}
                        onClick={(e) => {
                            e.preventDefault(); e.stopPropagation();
                            onQuickView(p);
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M1 8C2.5 4 5 2 8 2C11 2 13.5 4 15 8C13.5 12 11 14 8 14C5 14 2.5 12 1 8Z"
                                stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                    </button>

                    {/* Add to Cart */}
                    <button
                        className="jw-action-btn jw-add-cart"
                        title={ui.addToCart}
                        aria-label={ui.addToCart}
                        onClick={(e) => {
                            e.preventDefault(); e.stopPropagation();
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
                <p className="jw-card-cat">{Array.isArray(p.category) ? p.category.join(', ') : p.category}</p>
                <h3 className="jw-card-name">{p.title}</h3>
                <div className="jw-card-price">
                    {oldPrice && <span className="jw-old-price">{formatPrice(oldPrice, currency)}</span>}
                    {newPrice !== null && newPrice !== undefined ? (
                        <span className="jw-new-price">{formatPrice(newPrice, currency)}</span>
                    ) : (
                        <span className="jw-new-price jw-price-na">{ui.priceOnRequest}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ─────────────────────────────────────────────────────────
//  SKELETON
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
//  MAIN PENDANTS PAGE
// ─────────────────────────────────────────────────────────
export default function Pendant() {
    const router = useRouter();

    // ── Translation state ──
    const [ui, setUi] = useState(DEFAULT_UI);
    const [translatedPendantsContent, setTranslatedPendantsContent] = useState(pendantsContent);
    const [translatedFaq, setTranslatedFaq] = useState(faqData);
    const [translatedCategories, setTranslatedCategories] = useState(
        categories.map((c) => ({ ...c, translatedName: c.name }))
    );
    const [translationStatus, setTranslationStatus] = useState("idle");

    // ── Currency ──
    const [currency, setCurrency] = useState(CURRENCY_MAP.default);

    // ── WishlistContext (navbar badge auto-update) ──
    const { wishlistItems, addToWishlist, removeFromWishlist: removeFromWishlistCtx } = useWishlist();
    const wishlist = (wishlistItems || []).map(item => item._id || item);

    // ── Filter / sort state ──
    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Pendants");
    const [perPage, setPerPage] = useState(30);
    const [sort, setSort] = useState("default");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ── Product state ──
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

    // ── Toast helper ──
    const showToast = useCallback((message) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ visible: true, message });
        toastTimer.current = setTimeout(() => setToast({ visible: false, message: '' }), 2500);
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
                ...flattenContent(pendantsContent),
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
            // FIXED: count must match flattened length (ul items expand into multiple strings)
            const contentCount = flattenContent(pendantsContent).length;
            const faqCount = faqData.length * 2;

            setUi(rebuildUI(all.slice(0, uiCount)));
            setTranslatedPendantsContent(rebuildContent(pendantsContent, all.slice(uiCount, uiCount + contentCount)));
            setTranslatedFaq(rebuildFaq(all.slice(uiCount + contentCount, uiCount + contentCount + faqCount)));
            setTranslatedCategories(rebuildCategories(categories, all.slice(uiCount + contentCount + faqCount)));
            setTranslationStatus("done");
        } catch (err) {
            console.error("Auto-translate error:", err.message);
            setTranslationStatus("error");
        }
    }, []);

    useEffect(() => { translateContent(); }, [translateContent]);

    // ── Category click ──
    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        router.push(`/product-category/${categorySlugMap[categoryName] || 'jewellery'}`);
    };

    // ── Fetch products ──
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true); setError(null);
                const queryParams = new URLSearchParams();
                if (activeCategory) queryParams.append("category", activeCategory);
                const res = await fetch(`${API_BASE}/api/products?${queryParams.toString()}`);
                if (!res.ok) throw new Error(`Server Error: ${res.status}`);
                const data = await res.json();
                if (data.success) setProducts(data.products || []);
                else throw new Error(data.message || "Failed to fetch data.");
            } catch (err) {
                console.error("[Pendants] Fetch error:", err);
                setError(err.message);
            } finally { setLoading(false); }
        };
        fetchProducts();
    }, [activeCategory]);

    // ── Wishlist toggle (WishlistContext) ──
    const toggleWishlist = useCallback((id, productData) => {
        if (wishlist.includes(id)) {
            removeFromWishlistCtx(id);
        } else {
            addToWishlist(productData || { _id: id });
        }
    }, [wishlist, addToWishlist, removeFromWishlistCtx]);

    // ── Add to Cart (custom event — CartContext se connect hoga) ──
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

    // ── Quick View ──
    const openQuickView = useCallback((product) => setQuickViewProduct(product), []);
    const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

    // ── Sort + filter + paginate ──
    const sortedProducts = [...products].sort((a, b) => {
        const aP = getFirstVariant(a).newPrice || 0;
        const bP = getFirstVariant(b).newPrice || 0;
        if (sort === "price-asc") return aP - bP;
        if (sort === "price-desc") return bP - aP;
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

    // ── Sticky sidebar ──
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
            {translationStatus === "loading" && <div className="translation-loading-bar" aria-hidden="true" />}

            {/* Toast */}
            <Toast message={toast.message} visible={toast.visible} />

            {/* Quick View Modal */}
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
                    <aside ref={sidebarRef} className={`jw-sidebar ${sidebarOpen ? 'jw-sidebar--open' : ''}`}>
                        <div className="jw-sidebar-inner">
                            <button className="jw-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>

                            {/* Categories */}
                            <div className="jw-filter-block">
                                <button className="jw-filter-heading" onClick={() => setCatOpen(!catOpen)} aria-expanded={catOpen}>
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

                    {/* Toolbar */}
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
                                    <button key={n}
                                        className={`jw-per-btn ${perPage === n ? 'jw-per-btn--active' : ''}`}
                                        onClick={() => setPerPage(n)}>{n}</button>
                                ))}
                            </div>
                            <div className="jw-sort-wrap">
                                <select className="jw-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
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

                    {/* Error */}
                    {error && (
                        <div className="jw-error">
                            <span>⚠️ {error}</span>
                            <button onClick={() => setActiveCategory(activeCategory)}>{ui.retry}</button>
                        </div>
                    )}

                    {/* Grid */}
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
                                    ui={ui}
                                    onQuickView={openQuickView}
                                    onAddToCart={handleAddToCart}
                                />
                            ))
                        ) : (
                            <div className="jw-empty">
                                <p>{ui.noProductsBase}{activeCategory ? ` in "${activeCategory}"` : ''}.</p>
                                <p style={{ fontSize: '13px', marginTop: '8px', color: '#aaa' }}>{ui.checkConsole}</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Reviews />

             {/* Bottom Accordions */}
                    <div className="jw-bottom-accordions">
                        <AccordionItem title={ui.everydayJewellery}>
                            <div className="jw-accordion-text">
                                {translatedPendantsContent.map((item, i) => {
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