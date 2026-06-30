'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Jewellery.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reviews from '../../../components/Home/Reviews/Reviews';
import { useWishlist } from '../../context/WishlistContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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

// ─────────────────────────────────────────────────────────
//  DEFAULT (English) UI STRINGS
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
    fashionJewellery: "Fashion Jewellery",
    faq: "Frequently Asked Questions",
    retry: "Retry",
    gridView: "Grid view",
    addToWishlist: "Add to Wishlist",
    quickView: "Quick View",
    addToCart: "Add to Cart",
    sale: "SALE",
    noProductsBase: "No products found",

    showingOf: "Showing",
    showingResults: "results",
    pageTitle: "Elegant Semi-Precious & Gold Fashion Jewellery Collection",
    priceOnRequest: "Price on request",
};

const flattenUI = (ui) => [
    ui.productCategories,
    ui.price,
    ui.loadingText,
    ui.showText,
    ui.defaultSorting,
    ui.priceLowHigh,
    ui.priceHighLow,
    ui.newest,
    ui.filtersText,
    ui.fashionJewellery,
    ui.faq,
    ui.retry,
    ui.gridView,
    ui.addToWishlist,
    ui.quickView,
    ui.addToCart,
    ui.sale,
    ui.noProductsBase,
    ui.checkConsole,
    ui.showingOf,
    ui.showingResults,
    ui.pageTitle,
    ui.priceOnRequest,
];

const rebuildUI = (translations) => {
    let i = 0;
    const get = () => translations[i++];
    return {
        productCategories: get(),
        price: get(),
        loadingText: get(),
        showText: get(),
        defaultSorting: get(),
        priceLowHigh: get(),
        priceHighLow: get(),
        newest: get(),
        filtersText: get(),
        fashionJewellery: get(),
        faq: get(),
        retry: get(),
        gridView: get(),
        addToWishlist: get(),
        quickView: get(),
        addToCart: get(),
        sale: get(),
        noProductsBase: get(),
        checkConsole: get(),
        showingOf: get(),
        showingResults: get(),
        pageTitle: get(),
        priceOnRequest: get(),
    };
};

// ─────────────────────────────────────────────────────────
//  CATEGORY / PRICE DATA
// ─────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
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
    "Women": "jewellery",
};

const flattenCategories = (cats) => cats.map((c) => c.name);

const rebuildCategories = (originalCats, translatedNames) =>
    originalCats.map((c, i) => ({ ...c, translatedName: translatedNames[i] }));

// ─────────────────────────────────────────────────────────
//  FAQ DATA
// ─────────────────────────────────────────────────────────
const faqData = [
    {
        q: " What is fine silver jewellery?",
        a: " Fine silver jewellery is made using high-quality silver known for its bright shine, smooth finish, and elegant appearance, making it suitable for both daily and occasion wear."
    },
    {
        q: "Is fine silver jewellery suitable for everyday use?",
        a: " Yes, fine silver jewellery is lightweight and comfortable, making it ideal for everyday wear when handled with proper care."
    },
    {
        q: " What is jewellery with gold?",
        a: " Jewellery with gold includes pieces that feature gold elements or gold-inspired finishes, offering a luxurious and timeless look."
    },
    {
        q: " What is gold fashion jewellery?",
        a: "Gold fashion jewellery refers to lightweight, modern designs inspired by traditional gold jewellery, created for everyday styling and comfort."
    },
    {
        q: " Is gold fashion jewellery durable?",
        a: " Yes, gold fashion jewellery is designed for regular use and can maintain its appearance with proper care and storage."
    },
    {
        q: "What is semi precious gemstone jewellery?",
        a: " It is jewellery made using natural stones like amethyst, quartz, or turquoise, known for their unique colors and patterns."
    },
    {
        q: "Are semi precious stones real?",
        a: " Yes, semi precious stones are natural gemstones, each with its own unique characteristics and appearance."
    },
    {
        q: "Can I wear semi precious jewellery daily?",
        a: " Yes, many semi precious jewellery pieces are designed for daily wear, especially lightweight and minimal designs."
    },
    {
        q: "How do I style semi precious stones jewellery?",
        a: " You can style them with casual outfits for a subtle look or use bold pieces as statement accessories for special occasions."
    },
    {
        q: " Can I mix silver and gold jewellery together?",
        a: " Yes, mixing metals like silver and gold is a popular trend that creates a modern and stylish layered look."
    },


     {
        q: " How should I care for silver jewellery?",
        a: "  Store it in a dry place, avoid moisture, and clean it gently to maintain its shine and prevent tarnishing."
    },
    {
        q: " Does gold fashion jewellery fade over time?",
        a: "  With proper care, gold fashion jewellery retains its finish for a long time, though exposure to chemicals should be avoided."
    },
    {
        q: " What makes gemstone jewellery unique?",
        a: "  Each gemstone has natural variations in color and texture, making every piece one-of-a-kind."
    },
    {
        q: "  Is your jewellery suitable for sensitive skin?",
        a: " Most modern jewellery is designed with skin-friendly materials, but it’s always best to check product details."
    },
    {
        q: "Can jewellery be worn for both casual and formal occasions? ",
        a: " Yes, the versatility of modern jewellery allows it to complement casual, office, and formal outfits. "
    },
    {
        q: "Is your jewellery lightweight?",
        a: " Yes, the collection focuses on lightweight designs for maximum comfort during long hours of wear. "
    },
    {
        q: "What are the latest jewellery trends?",
        a: "  Popular trends include minimalist designs, layered necklaces, stacked rings, and mixed metal styling."
    },
    {
        q: " Is jewellery a good gift option?",
        a: " Yes, jewellery is a timeless and meaningful gift suitable for birthdays, anniversaries, and special occasions. "
    },
    {
        q: "Can I wear multiple jewellery pieces together?",
        a: " Absolutely, layering and stacking jewellery pieces is a popular styling technique for a modern look. "
    },
    {
        q: " Is it safe to shop jewellery online?",
        a: " Yes, shopping online is safe when done through a trusted platform with secure payment options and clear product details. "
    }
];

// ─────────────────────────────────────────────────────────
//  FASHION JEWELLERY CONTENT DATA
// ─────────────────────────────────────────────────────────
const fashionJewelleryContent = [
    { type: 'h', text: "Fine Silver Jewellery, Gold & Semi Precious Jewellery – Elegant & Modern Designs" },
    { type: 'p', text: "Explore a thoughtfully curated collection of <strong>fine silver jewellery</strong>, <strong>jewellery with gold</strong>, and <strong>semi precious gemstone jewellery</strong> that brings together elegance, craftsmanship, and contemporary style. Each piece in our collection is designed to reflect modern fashion sensibilities while preserving the timeless charm that jewellery is known for. Whether you are looking for everyday essentials or statement pieces for special occasions, our designs offer the perfect blend of versatility and sophistication." },
    { type: 'p', text: "<strong>Fine silver jewellery</strong> stands out for its clean, polished finish and understated elegance, making it an ideal choice for minimal and refined styling. Jewellery with gold adds a touch of warmth and luxury, effortlessly elevating both casual and formal looks. Meanwhile, semi precious gemstone jewellery introduces color, character, and individuality, allowing you to express your unique sense of style through beautifully crafted pieces." },
    { type: 'p', text: "Our collection is designed with attention to detail, ensuring comfort, durability, and long-lasting shine. Lightweight materials and smooth finishes make each piece suitable for all-day wear, while versatile designs allow easy styling across different outfits and occasions. From office wear and casual outings to festive celebrations and evening events, our jewellery adapts seamlessly to your lifestyle." },
    { type: 'p', text: "With a focus on quality craftsmanship and trend-inspired aesthetics, we aim to offer jewellery that not only enhances your appearance but also reflects your confidence and personality. Whether you prefer subtle elegance or bold fashion statements, this collection provides endless possibilities to create looks that are both modern and timeless." },
    { type: 'h', text: "Fine Silver Jewellery – Timeless Elegance with Modern Craftsmanship" },
    { type: 'p', text: "<strong>Fine silver jewellery</strong> continues to be a symbol of understated luxury, admired for its refined appearance, durability, and effortless versatility. With its naturally bright finish and sophisticated tone, silver jewellery remains a staple in modern fashion, offering a perfect balance between simplicity and elegance. It seamlessly complements a wide range of styles, making it an essential addition to every jewellery collection." },
    { type: 'p', text: "Designed to evolve with changing trends, fine silver jewellery ranges from delicate minimalist pieces to bold contemporary designs. Whether it's a sleek chain, an elegant ring, or a statement accessory, silver jewellery enhances your look without overwhelming it. Its neutral color makes it easy to pair with casual outfits, office wear, and even formal ensembles, allowing you to transition effortlessly from day to night." },
    { type: 'p', text: "Beyond its aesthetic appeal, <strong>fine silver jewellery</strong> is also valued for its comfort and practicality. Lightweight construction ensures ease of wear throughout the day, while high-quality finishing techniques provide a smooth, polished surface that feels as good as it looks. With proper care, silver jewellery retains its shine and beauty over time, making it a reliable choice for long-term use." },
    { type: 'p', text: "<strong>Key Highlights:</strong><br/>• Premium craftsmanship with precise detailing and smooth finishing<br/>• Lightweight design for all-day comfort<br/>• Versatile styling suitable for casual, office, and formal looks<br/>• Retains long-lasting shine with proper care and maintenance" },
    { type: 'p', text: "Fine silver jewellery is more than just an accessory—it is a timeless expression of style that adapts to your lifestyle while maintaining its classic elegance." },
    { type: 'h', text: "Latest Trends in Fashion Jewellery" },
    { type: 'p', text: "The world of fashion jewellery is constantly evolving, with new trends redefining how jewellery is styled and worn. Today’s trends emphasize simplicity, layering, and versatility, allowing individuals to create personalized looks that suit their style." },
    { type: 'p', text: "Minimalist jewellery continues to dominate everyday fashion, while layered necklaces and stacked rings offer a more expressive and modern approach. Mixed metals, including silver and gold combinations, are also gaining popularity for their contemporary appeal." },
    { type: 'p', text: "<strong>Trending Styles Include:</strong><br/>• Minimalist and delicate jewellery pieces<br/>• Layered necklaces and stacked rings<br/>• Mixed metal styling (silver + gold)<br/>• Lightweight statement jewellery<br/>• Gemstone accents for color and uniqueness" },
    { type: 'h', text: "Modern Jewellery for Women – Designed for Everyday Elegance" },
    { type: 'p', text: "Modern jewellery for women is no longer limited to occasional wear—it is designed to be a part of your daily lifestyle. Today’s designs focus on combining style with comfort, ensuring that each piece feels as good as it looks. Lightweight construction, smooth edges, and skin-friendly finishes make it easy to wear jewellery throughout the day without discomfort." },
    { type: 'p', text: "Whether you're heading to work, meeting friends, or attending an event, modern jewellery adapts effortlessly to your routine. From subtle elegance to bold fashion statements, these pieces allow you to express your personality while staying comfortable and confident." },
    { type: 'p', text: "<strong>Why It Works for Daily Wear:</strong><br/>• Lightweight and easy to wear for long hours<br/>• Minimal designs for effortless styling<br/>• Comfortable finishes suitable for all skin types<br/>• Perfect balance of fashion and functionality" },
    { type: 'h', text: "Jewellery with Gold – Classic Luxury Meets Modern Style" },
    { type: 'p', text: "<strong>Jewellery with gold</strong> has always been a symbol of elegance, sophistication, and timeless beauty. Blending traditional charm with modern design sensibilities, today’s gold jewellery offers a refined yet contemporary appeal that suits a wide range of styles and occasions. Whether you prefer subtle detailing or eye-catching statement pieces, <strong>gold jewellery</strong> effortlessly enhances your overall look with a touch of luxury." },
    { type: 'p', text: "Modern jewellery with gold is designed to be more versatile and wearable than ever before. From delicate chains and minimal accents to bold, fashion-forward designs, these pieces cater to both classic and contemporary preferences. Gold fashion jewellery, in particular, has gained popularity for its lightweight construction and stylish appearance, making it ideal for everyday wear without compromising on elegance." },
    { type: 'p', text: "One of the key strengths of gold jewellery is its adaptability. It pairs beautifully with casual outfits, complements professional attire, and adds sophistication to festive and evening wear. This flexibility allows you to transition seamlessly between different looks while maintaining a polished and confident style." },
    { type: 'p', text: "Beyond aesthetics, jewellery with gold is crafted with attention to comfort and durability. Modern techniques ensure smooth finishes and long-lasting shine, allowing each piece to retain its beauty over time. This makes gold jewellery not only a fashion choice but also a practical addition to your collection." },
    { type: 'p', text: "<strong>Key Highlights:</strong><br/>• Elegant and luxurious gold-inspired designs<br/>• Perfect balance of style and everyday practicality<br/>• Suitable for both daily wear and special occasions<br/>• Trend-driven designs with timeless appeal" },
    { type: 'p', text: "Jewellery with gold offers the perfect combination of heritage and modern fashion, allowing you to express your style with confidence, grace, and enduring elegance." },
    { type: 'h', text: "Semi Precious Gemstone Jewellery – Natural Beauty & Unique Designs" },
    { type: 'p', text: "<strong>Semi precious gemstone jewellery</strong> beautifully captures the essence of nature through vibrant colors, organic textures, and one-of-a-kind patterns. Each gemstone is naturally formed, giving every piece its own distinct identity and charm. This uniqueness makes gemstone jewellery an excellent choice for those who appreciate individuality and artistic expression in their accessories." },
    { type: 'p', text: "Designed to showcase the natural brilliance of stones, these jewellery pieces strike a perfect balance between elegance and durability. Skilled craftsmanship ensures that each gemstone is carefully set and polished, enhancing its visual appeal while maintaining comfort for everyday wear. Whether you prefer soft, subtle tones or bold, eye-catching colors, gemstone jewellery allows you to create looks that truly reflect your personality." },
    { type: 'p', text: "Versatility is another key advantage of <strong>semi precious gemstone jewellery</strong>. It can effortlessly complement casual outfits, add a refined touch to office wear, or become the highlight of your look for festive occasions and evening events. From minimal designs to statement pieces, these accessories offer endless styling possibilities for modern fashion enthusiasts." },
    { type: 'p', text: "<strong>Key Highlights:</strong><br/>• Unique designs featuring natural, one-of-a-kind gemstones<br/>• Rich colors with strong artistic and visual appeal<br/>• Durable craftsmanship designed for comfort and long-term wear<br/>• Suitable for both everyday styling and special occasions" },
    { type: 'p', text: "Semi precious gemstone jewellery is more than just an accessory—it is a reflection of natural beauty and personal style, allowing you to stand out with elegance and confidence." },
    { type: 'h', text: "Semi Precious Stones Jewellery – Trendy, Versatile & Expressive" },
    { type: 'p', text: "<strong>Semi precious stones jewellery</strong> brings together the beauty of nature and the creativity of modern design, offering a diverse range of styles, colors, and patterns. Known for its versatility and expressive appeal, this category has become a favorite among those who enjoy experimenting with fashion while maintaining a sense of elegance. Each piece is thoughtfully crafted to highlight the natural charm of the stones while aligning with contemporary trends." },
    { type: 'p', text: "From soft, minimal designs to bold, statement-making accessories, semi precious stones jewellery caters to a wide spectrum of style preferences. The variety of stones available allows you to explore different looks—whether you prefer subtle tones for <strong>everyday wear</strong> or vibrant hues that stand out during special occasions. This flexibility makes it easy to build a jewellery collection that reflects your personality and evolves with your style." },
    { type: 'p', text: "One of the key advantages of semi precious stones jewellery is its ability to mix and match effortlessly. These pieces can be layered, paired with other metals, or styled individually to create unique combinations. Whether you're dressing for a casual day out, a professional setting, or a festive event, they adapt seamlessly to different outfits and occasions." },
    { type: 'p', text: "Crafted with a focus on comfort and durability, these jewellery pieces are suitable for regular wear while maintaining their visual appeal over time. Their combination of trend-driven design and practical usability ensures that you can enjoy both style and convenience in your everyday accessories." },
    { type: 'p', text: "<strong>Key Highlights:</strong><br/>• Wide variety of stones, colors, and design options<br/>• Trendy, contemporary styles for modern fashion<br/>• Easy to mix, match, and layer with different outfits<br/>• Ideal for both daily wear and special occasions" },
    { type: 'p', text: "Semi precious stones jewellery offers endless possibilities for self-expression, allowing you to create looks that are stylish, modern, and uniquely yours." },
    { type: 'h', text: "Gold Fashion Jewellery – Modern Luxury for Everyday Styling" },
    { type: 'p', text: "<strong>Gold fashion jewellery</strong> brings a fresh perspective to traditional luxury by combining the timeless appeal of gold with modern, wearable designs. Created for today’s fast-paced lifestyles, these pieces offer elegance without the heaviness of conventional jewellery, making them perfect for daily use. They allow you to enjoy the richness of gold-inspired styling while maintaining comfort and ease throughout the day." },
    { type: 'p', text: "With a strong focus on contemporary aesthetics, gold fashion jewellery features sleek silhouettes, minimal detailing, and trend-driven designs that align with current fashion preferences. Whether you choose delicate chains, stylish earrings, or bold statement pieces, each design is crafted to enhance your look while remaining practical for regular wear. This makes it easy to incorporate a touch of luxury into your everyday outfits." },
    { type: 'p', text: "Another key advantage of <strong>gold fashion jewellery</strong> is its versatility. These pieces transition effortlessly from casual settings to office environments and even evening occasions. You can wear them individually for a subtle look or layer them for a more expressive style, allowing you to adapt your jewellery to different moods and outfits." },
    { type: 'p', text: "Designed with attention to quality and comfort, gold fashion jewellery uses lightweight materials and smooth finishes to ensure long-lasting wearability. It offers an accessible way to enjoy premium aesthetics without compromising on functionality, making it a smart and stylish addition to any jewellery collection." },
    { type: 'p', text: "<strong>Key Highlights:</strong><br/>• Lightweight designs for all-day comfort<br/>• Modern, trend-driven styles<br/>• Perfect for everyday wear and versatile styling<br/>• Affordable luxury with a refined, premium look" },
    { type: 'p', text: "Gold fashion jewellery is the ideal choice for those who want to embrace modern luxury in a practical and stylish way, enhancing everyday fashion with effortless elegance." },
    { type: 'h', text: "How to Style Your Jewellery for Different Occasions" },
    { type: 'p', text: "Styling jewellery correctly can enhance your entire look. The key is to match your jewellery with the occasion while maintaining balance and elegance." },
    { type: 'p', text: "For everyday wear, opt for minimal and lightweight pieces that add subtle charm. In professional settings, choose refined and elegant jewellery that complements your outfit without being overpowering. For festive and evening events, you can experiment with bold designs, layered styles, or gemstone pieces to create a statement look." },
    { type: 'p', text: "<strong>Quick Styling Tips:</strong><br/>• Keep it minimal for daily wear<br/>• Choose elegant designs for office outfits<br/>• Go bold with statement pieces for events<br/>• Mix and layer jewellery for a modern look" },
    { type: 'h', text: "Jewellery Care Tips – Maintain Shine & Longevity" },
    { type: 'p', text: "Proper care is essential to keep your jewellery looking new and maintaining its shine over time. Whether it’s silver, gold fashion jewellery, or gemstone pieces, simple maintenance can significantly extend their lifespan." },
    { type: 'p', text: "Avoid exposure to moisture, perfumes, and harsh chemicals, as these can affect the finish and durability. Always store jewellery in a clean, dry place, preferably in separate pouches to prevent scratches." },
    { type: 'p', text: "<strong>Care Tips:</strong><br/>• Store jewellery in a dry, airtight space<br/>• Avoid contact with water and chemicals<br/>• Clean gently with a soft cloth<br/>• Remove jewellery before workouts or sleep" },
    { type: 'h', text: "Perfect Jewellery Gift Guide" },
    { type: 'p', text: "Jewellery is one of the most meaningful and timeless gifts you can give. Whether you're celebrating a birthday, anniversary, or special milestone, the right piece of jewellery can create lasting memories." },
    { type: 'p', text: "Fine silver jewellery makes a great choice for elegant gifting, while gold fashion jewellery offers a luxurious yet practical option. Semi precious gemstone jewellery is perfect for those who love unique and expressive designs." },
    { type: 'p', text: "<strong>Best Gifting Ideas:</strong><br/>• Minimal silver jewellery for everyday elegance<br/>• Gold fashion jewellery for modern luxury<br/>• Gemstone jewellery for unique personality-based gifts<br/>• Versatile pieces suitable for all occasions" },
    { type: 'h', text: "Why Our Jewellery Stands Out" },
    { type: 'p', text: "Our jewellery collection is thoughtfully designed to deliver a premium experience that combines style, comfort, and durability. Every piece reflects attention to detail and a commitment to quality, ensuring that you receive jewellery that looks beautiful and lasts longer." },
    { type: 'p', text: "We understand the needs of modern consumers, which is why our designs focus on versatility and practicality while staying aligned with current fashion trends." },
    {
        type: 'p', text: "<strong>What Makes Us Different:</strong><br/>• Carefully crafted, high-quality designs<br/>• Trend-focused yet timeless aesthetics<br/>• Comfortable for everyday wear<br/>• Wide variety for every style preference<br/>•Long-lasting shine and durability"
    },

    { type: 'h', text: "Why Choose Our Jewellery Collection" },
    { type: 'p', text: "Our jewellery collection is designed to meet the needs of modern consumers who value style, quality, and versatility. Each piece is crafted with precision to ensure durability, elegance, and long-term value." },
    { type: 'p', text: "We offer a wide range of options, including fine silver jewellery, jewellery with gold, and semi precious jewellery, ensuring there is something for every style preference." },
    { type: 'p', text: "<strong>We Focus On:</strong><br/>• High-quality craftsmanship and finishing<br/>• Modern and trending designs<br/>• Comfortable everyday wear<br/>•Versatile styling for multiple occasions<br/>•Long-lasting durability and shine" },
    { type: 'h', text: "Shop Jewellery Online – Easy, Secure & Convenient" },
    { type: 'p', text: "Shopping for jewellery online has never been easier. Explore a wide range of fine silver jewellery, gold fashion jewellery, and semi precious stones jewellery from the comfort of your home." },
    { type: 'p', text: "<strong>Benefits:</strong><br/>• Smooth browsing and easy navigation<br/>• Secure checkout and payment options<br/>•Detailed product descriptions and images<br/>•Reliable delivery services<br/>" },
    { type: 'p', text: "Whether you're updating your collection or searching for a meaningful gift, our platform ensures a seamless shopping experience." },
];

const flattenFashionContent = (content) => content.map((item) => item.text);
const rebuildFashionContent = (originalContent, translatedTexts) =>
    originalContent.map((item, i) => ({ ...item, text: translatedTexts[i] }));

const flattenFaq = (data) => {
    const arr = [];
    data.forEach((item) => { arr.push(item.q); arr.push(item.a); });
    return arr;
};
const rebuildFaq = (translatedArr) => {
    const result = [];
    for (let i = 0; i < translatedArr.length; i += 2) {
        result.push({ q: translatedArr[i], a: translatedArr[i + 1] });
    }
    return result;
};

const TOP_OFFSET = 40;

// ─────────────────────────────────────────────────────────
//  HELPER
// ─────────────────────────────────────────────────────────
function getFirstVariant(product) {
    if (product.variants && product.variants.length > 0) return product.variants[0];
    return {
        images: product.images || [],
        oldPrice: product.oldPrice,
        newPrice: product.newPrice,
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
    const categoryUrl = categorySlugMap[product.category] || 'jewellery';

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

                {/* Images */}
                <div style={{ flex: '1 1 300px', minWidth: '240px', padding: '24px 16px 24px 24px' }}>
                    <div style={{ background: '#f7f6f4', borderRadius: '6px', aspectRatio: '1/1', overflow: 'hidden', marginBottom: '12px' }}>
                        {images.length > 0
                            ? <img src={`${API_BASE}${images[activeImg]}`} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                            : <img src="/placeholder.jpg" alt="placeholder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    {images.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {images.map((img, i) => (
                                <button key={i} onClick={() => setActiveImg(i)} style={{ width: '54px', height: '54px', padding: 0, border: i === activeImg ? '2px solid #1a1a1a' : '2px solid transparent', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', background: '#f7f6f4' }}>
                                    <img src={`${API_BASE}${img}`} alt={`view ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div style={{ flex: '1 1 280px', padding: '32px 24px 24px 16px', minWidth: '240px' }}>
                    {variant.isSale && <span style={{ background: '#1a1a1a', color: '#fff', fontSize: '11px', letterSpacing: '1px', padding: '3px 8px', borderRadius: '2px', display: 'inline-block', marginBottom: '10px' }}>{ui.sale}</span>}
                    <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>{product.category}</p>
                    <h2 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 14px', lineHeight: 1.3 }}>{product.title}</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                        {variant.oldPrice && <span style={{ fontSize: '15px', color: '#aaa', textDecoration: 'line-through' }}>{formatPrice(variant.oldPrice, currency)}</span>}
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>
                            {variant.newPrice !== null && variant.newPrice !== undefined ? formatPrice(variant.newPrice, currency) : ui.priceOnRequest}
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
                        <button onClick={() => onAddToCart(product, qty)} style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '13px 20px', fontSize: '13px', letterSpacing: '0.5px', cursor: 'pointer', borderRadius: '4px', textTransform: 'uppercase' }}>{ui.addToCart}</button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => onToggleWishlist(product._id, { _id: product._id, slug: product.slug, title: product.title, category: product.category, images: variant.images || [], oldPrice: variant.oldPrice, newPrice: variant.newPrice, isSale: variant.isSale })}
                                style={{ flex: 1, border: '1px solid #ddd', background: '#fff', padding: '11px 12px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: wishlist.includes(product._id) ? '#c0392b' : '#555' }}
                            >
                                <svg width="15" height="14" viewBox="0 0 16 15" fill="none"><path d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.3" fill={wishlist.includes(product._id) ? 'currentColor' : 'none'} /></svg>
                                {ui.addToWishlist}
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

    const imgSrc = images.length > 0 ? `${API_BASE}${images[currentImg]}` : "/placeholder.jpg";
    const oldPrice = variant.oldPrice;
    const newPrice = variant.newPrice;
    const isSale = variant.isSale;
    const categoryUrl = categorySlugMap[p.category] || "jewellery";

    return (
        <Link href={`/product-category/${categoryUrl}/${p.slug}`} className="jw-card" onMouseEnter={startHover} onMouseLeave={stopHover}>
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">{ui.sale}</span>}
                <img src={imgSrc} alt={p.title} className="jw-card-img" loading="lazy" onError={(e) => { e.target.src = "/placeholder.jpg"; }} />
                {images.length > 1 && (
                    <div className="jw-img-dots">
                        {images.map((_, i) => <span key={i} className={`jw-img-dot ${i === currentImg ? 'jw-img-dot--active' : ''}`} />)}
                    </div>
                )}
                <div className="jw-card-actions">
                    <button
                        className={`jw-action-btn ${wishlist.includes(p._id) ? 'jw-action-btn--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p._id, { _id: p._id, slug: p.slug, title: p.title, category: p.category, images: variant.images || [], oldPrice: variant.oldPrice, newPrice: variant.newPrice, isSale: variant.isSale }); }}
                        title={ui.addToWishlist}
                    >
                        <svg width="16" height="15" viewBox="0 0 16 15" fill="none"><path d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.3" fill={wishlist.includes(p._id) ? 'currentColor' : 'none'} /></svg>
                    </button>
                    <button className="jw-action-btn" title={ui.quickView} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(p); }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" /><path d="M1 8C2.5 4 5 2 8 2C11 2 13.5 4 15 8C13.5 12 11 14 8 14C5 14 2.5 12 1 8Z" stroke="currentColor" strokeWidth="1.3" /></svg>
                    </button>
                    <button className="jw-action-btn jw-add-cart" title={ui.addToCart} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(p, 1); }}>
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
                        : <span className="jw-new-price jw-price-na">{ui.priceOnRequest}</span>}
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
//  MAIN JEWELLERY PAGE
// ─────────────────────────────────────────────────────────
export default function Jewellery() {
    const router = useRouter();

    const [ui, setUi] = useState(DEFAULT_UI);
    const [translatedFashionContent, setTranslatedFashionContent] = useState(fashionJewelleryContent);
    const [translatedFaq, setTranslatedFaq] = useState(faqData);
    const [translatedCategories, setTranslatedCategories] = useState(DEFAULT_CATEGORIES.map((c) => ({ ...c, translatedName: c.name })));
    const [detectedLanguage, setDetectedLanguage] = useState(null);
    const [translationStatus, setTranslationStatus] = useState("idle");
    const [currency, setCurrency] = useState(CURRENCY_MAP.default);

    // ── WishlistContext ──
    const { wishlistItems, addToWishlist, removeFromWishlist: removeFromWishlistCtx } = useWishlist();
    const wishlist = (wishlistItems || []).map(item => item._id || item);

    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Jewellery");
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

    const translateContent = useCallback(async () => {
        try {
            setTranslationStatus("loading");
            const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
            const detectData = await detectRes.json();
            if (!detectData.success) throw new Error("Language detection failed");
            const { languageCode, languageName, countryCode } = detectData;
            setDetectedLanguage({ code: languageCode, name: languageName });
            if (countryCode && CURRENCY_MAP[countryCode]) setCurrency(CURRENCY_MAP[countryCode]);
            if (languageCode === "en") { setTranslationStatus("done"); return; }

            const allStrings = [
                ...flattenUI(DEFAULT_UI),
                ...flattenFashionContent(fashionJewelleryContent),
                ...flattenFaq(faqData),
                ...flattenCategories(DEFAULT_CATEGORIES),
            ];
            const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts: allStrings, targetLanguage: languageCode, sourceLanguage: "en" }),
            });
            const translateData = await translateRes.json();
            if (!translateData.success) throw new Error("Translation failed");

            const all = translateData.translations;
            const uiCount = flattenUI(DEFAULT_UI).length;
            const fashionCount = fashionJewelleryContent.length;
            const faqCount = faqData.length * 2;
            const catCount = DEFAULT_CATEGORIES.length;

            setUi(rebuildUI(all.slice(0, uiCount)));
            setTranslatedFashionContent(rebuildFashionContent(fashionJewelleryContent, all.slice(uiCount, uiCount + fashionCount)));
            setTranslatedFaq(rebuildFaq(all.slice(uiCount + fashionCount, uiCount + fashionCount + faqCount)));
            setTranslatedCategories(rebuildCategories(DEFAULT_CATEGORIES, all.slice(uiCount + fashionCount + faqCount, uiCount + fashionCount + faqCount + catCount)));
            setTranslationStatus("done");
        } catch (err) {
            console.error("Auto-translate error:", err.message);
            setTranslationStatus("error");
        }
    }, []);

    useEffect(() => { translateContent(); }, [translateContent]);

    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        router.push(`/product-category/${categorySlugMap[categoryName] || "jewellery"}`);
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
                console.error("Fetch Error:", err);
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
        const range = DEFAULT_PRICES.find((pr) => pr.label === activePrice);
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
            {translationStatus === "loading" && <div className="translation-loading-bar" aria-hidden="true" />}

            <Toast message={toast.message} visible={toast.visible} />

            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct} currency={currency} ui={ui}
                    onClose={closeQuickView}
                    onAddToCart={(product, qty) => { handleAddToCart(product, qty); closeQuickView(); }}
                    wishlist={wishlist} onToggleWishlist={toggleWishlist}
                />
            )}

            <button className="jw-filter-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <span className="jw-filter-icon"><svg width="18" height="14" viewBox="0 0 18 14" fill="none"><rect width="18" height="2" rx="1" fill="currentColor" /><rect x="3" y="6" width="12" height="2" rx="1" fill="currentColor" /><rect x="6" y="12" width="6" height="2" rx="1" fill="currentColor" /></svg></span>
                {ui.filtersText}
            </button>

            {sidebarOpen && <div className="jw-overlay" onClick={() => setSidebarOpen(false)} />}

            <div className="jw-layout" ref={layoutRef}>
                <div className="jw-sidebar-wrapper">
                    <aside ref={sidebarRef} className={`jw-sidebar ${sidebarOpen ? 'jw-sidebar--open' : ''}`}>
                        <div className="jw-sidebar-inner">
                            <button className="jw-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>

                            <div className="jw-filter-block">
                                <button className="jw-filter-heading" onClick={() => setCatOpen(!catOpen)} aria-expanded={catOpen}>
                                    <span>{ui.productCategories}</span>
                                    <span className={`jw-chevron ${catOpen ? 'jw-chevron--up' : ''}`}><svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></span>
                                </button>
                                <div className={`jw-filter-body ${catOpen ? 'jw-filter-body--open' : ''}`}>
                                    <ul className="jw-cat-list">
                                        {translatedCategories.map((c) => (
                                            <li key={c.name}>
                                                <button className={`jw-cat-item ${activeCategory === c.name ? 'jw-cat-item--active' : ''}`} onClick={() => handleCategoryClick(c.name)}>
                                                    <svg className="jw-cat-arrow" width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
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

                    <div className="jw-toolbar">
                        <span className="jw-results-count">{loading ? ui.loadingText : `${ui.showingOf} ${displayed.length} of ${filtered.length} ${ui.showingResults}`}</span>
                        <div className="jw-toolbar-right">
                            <div className="jw-per-page">
                                <span className="jw-per-label">{ui.showText}</span>
                                {[12, 15, 30].map((n) => (<button key={n} className={`jw-per-btn ${perPage === n ? 'jw-per-btn--active' : ''}`} onClick={() => setPerPage(n)}>{n}</button>))}
                            </div>
                            <div className="jw-sort-wrap">
                                <select className="jw-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                                    <option value="default">{ui.defaultSorting}</option>
                                    <option value="price-asc">{ui.priceLowHigh}</option>
                                    <option value="price-desc">{ui.priceHighLow}</option>
                                    <option value="newest">{ui.newest}</option>
                                </select>
                                <span className="jw-select-arrow"><svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></span>
                            </div>
                            <button className="jw-grid-toggle" title={ui.gridView}><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect width="7" height="7" rx="1" fill="currentColor" /><rect x="9" width="7" height="7" rx="1" fill="currentColor" /><rect y="9" width="7" height="7" rx="1" fill="currentColor" /><rect x="9" y="9" width="7" height="7" rx="1" fill="currentColor" /></svg></button>
                        </div>
                    </div>

                    {error && <div className="jw-error"><span>⚠️ {error}</span><button onClick={() => setActiveCategory(activeCategory)}>{ui.retry}</button></div>}

                    <div className="jw-grid">
                        {loading ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />) : displayed.length > 0 ? (
                            displayed.map((p) => (
                                <ProductCard key={p._id} p={p} wishlist={wishlist} toggleWishlist={toggleWishlist} currency={currency} ui={ui} onQuickView={openQuickView} onAddToCart={handleAddToCart} />
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

              <div className="jw-bottom-accordions">
                        <AccordionItem title={ui.fashionJewellery}>
                            <div className="jw-accordion-text">
                                {translatedFashionContent.map((item, i) =>
                                    item.type === 'h'
                                        ? <h3 key={i} className="jw-accordion-heading" dangerouslySetInnerHTML={{ __html: item.text }} />
                                        : <p key={i} dangerouslySetInnerHTML={{ __html: item.text }} />
                                )}
                            </div>
                        </AccordionItem>
                        <AccordionItem title={ui.faq}>
                            <div className="jw-faq-list">
                                {translatedFaq.map((item, i) => (
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