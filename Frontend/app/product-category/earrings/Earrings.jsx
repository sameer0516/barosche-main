'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Earrings.css';
import Link from 'next/link';
import Reviews from '../../../components/Home/Reviews/Reviews';
import { useRouter } from 'next/navigation';
import { useWishlist } from '../../context/WishlistContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const CURRENCY_MAP = {
    US: { code: 'USD', symbol: '$',   rate: 1.08  },
    GB: { code: 'GBP', symbol: '£',   rate: 0.85  },
    IN: { code: 'INR', symbol: '₹',   rate: 90.5  },
    AE: { code: 'AED', symbol: 'AED', rate: 3.97  },
    AU: { code: 'AUD', symbol: 'A$',  rate: 1.65  },
    CA: { code: 'CAD', symbol: 'C$',  rate: 1.47  },
    SG: { code: 'SGD', symbol: 'S$',  rate: 1.45  },
    JP: { code: 'JPY', symbol: '¥',   rate: 162   },
    CH: { code: 'CHF', symbol: 'CHF', rate: 0.97  },
    default: { code: 'EUR', symbol: '€', rate: 1  },
};

function formatPrice(eurPrice, currency) {
    if (!eurPrice && eurPrice !== 0) return null;
    const converted = Math.round(Number(eurPrice) * currency.rate);
    if (currency.code === 'JPY') return `${currency.symbol}${converted.toLocaleString()}`;
    if (currency.code === 'INR') return `${currency.symbol}${converted.toLocaleString('en-IN')}`;
    return `${currency.symbol}${converted.toLocaleString()}`;
}

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
    everydayWear: "Everyday Wear Jewellery",
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
    viewDetails: "View Details",
    qty: "Qty",
};

const flattenUI = (ui) => [
    ui.productCategories, ui.price, ui.loadingText, ui.showText,
    ui.defaultSorting, ui.priceLowHigh, ui.priceHighLow, ui.newest,
    ui.filtersText, ui.everydayWear, ui.faq, ui.retry,
    ui.gridView, ui.addToWishlist, ui.quickView, ui.addToCart,
    ui.sale, ui.noProductsBase, ui.checkConsole, ui.showingOf,
    ui.showingResults, ui.pageTitle,
];

const rebuildUI = (translations) => {
    let i = 0;
    const get = () => translations[i++];
    return {
        productCategories: get(), price: get(), loadingText: get(), showText: get(),
        defaultSorting: get(), priceLowHigh: get(), priceHighLow: get(), newest: get(),
        filtersText: get(), everydayWear: get(), faq: get(), retry: get(),
        gridView: get(), addToWishlist: get(), quickView: get(), addToCart: get(),
        sale: get(), noProductsBase: get(), checkConsole: get(), showingOf: get(),
        showingResults: get(), pageTitle: get(),
        priceOnRequest: "Price on request", viewDetails: "View Details", qty: "Qty",
    };
};

const DEFAULT_CATEGORIES = [
    { name: "Chosen" }, { name: "Earrings" }, { name: "For Today" },
    { name: "Jewellery" }, { name: "Mens" }, { name: "New" },
    { name: "Pendants" }, { name: "Bracelets" }, { name: "Rings" }, { name: "Womens" },
];

const categorySlugMap = {
    "Chosen": "chosen-jewellery", "Earrings": "earrings",
    "For Today": "for-today-jewellery", "Jewellery": "jewellery",
    "Men": "mens", "Mens": "mens", "New": "new-in", "New In": "new-in",
    "Pendants": "pendants", "Bracelets": "bracelets",
    "Rings": "rings", "Women": "womens", "Womens": "womens",
};

const flattenCategories = (cats) => cats.map((c) => c.name);
const rebuildCategories = (originalCats, translatedNames) =>
    originalCats.map((c, i) => ({ ...c, translatedName: translatedNames[i] }));

const faqData = [
    { q: "What types of earrings are available online?", a: "You can find gold earrings, everyday earrings, studs, hoops, drop earrings, and statement designs." },
    { q: "Are gold earrings suitable for daily wear?", a: "Yes, lightweight gold earrings are perfect for comfortable everyday use." },
    { q: "What are everyday earrings?", a: "Everyday earrings are lightweight, minimal designs made for long hours of daily wear." },
    { q: "Which earrings are best for office wear?", a: "Stud earrings and small hoops are best for a clean and professional look." },
    { q: "Are earrings good for gifting?", a: "Yes, earrings are a timeless and meaningful gift for all occasions." },
    { q: "What materials are used in earrings?", a: "Common materials include gold, gold-plated alloys, sterling silver, and stainless steel." },
    { q: "What are hoop earrings?", a: "Hoop earrings are circular or semi-circular designs that offer a trendy and modern look." },
    { q: "Can I wear earrings every day?", a: "Yes, especially lightweight and skin-friendly designs made for daily use." },
    { q: "Do gold earrings require special care?", a: "Yes, avoid chemicals and store them safely to maintain shine and quality." },
    { q: "Are earrings available in minimal designs?", a: "Yes, minimal earrings are widely available for everyday elegance." },
    { q: "What are drop earrings?", a: "Drop earrings hang below the earlobe and are often worn for elegant or festive looks." },
    { q: "Are earrings comfortable for long wear?", a: "Yes, everyday earrings are designed for comfort and long-hour use." },
    { q: "Can earrings match both western and ethnic outfits?", a: "Yes, versatile designs can complement both traditional and modern outfits." },
    { q: "What are statement earrings?", a: "Statement earrings are bold, eye-catching designs meant to stand out." },
    { q: "Are silver earrings good for daily use?", a: "Yes, silver earrings are lightweight, durable, and perfect for daily styling." },
    { q: "How do I choose the right earrings?", a: "Consider style, comfort, material, and occasion before selecting earrings." },
    { q: "Are gold-plated earrings durable?", a: "Yes, with proper care they remain shiny and durable for long-term use." },
    { q: "Can I wear earrings while sleeping?", a: "It is recommended to remove earrings while sleeping to avoid damage or discomfort." },
    { q: "What earrings are trending right now?", a: "Minimal studs, hoops, geometric, and layered designs are currently trending." },
    { q: "Why should I buy earrings online?", a: "Online shopping offers more variety, better comparison, and convenient access to latest designs." },
];

const EarringContent = [
    { type: 'h', text: "Earrings – Elegant Styles for Women & Modern Everyday Fashion" },
    { type: 'p', text: "Discover a beautifully curated collection of <strong>earrings for women online</strong>, thoughtfully designed to blend timeless elegance with modern fashion trends. From <strong>classic gold earrings and minimalist studs</strong> to bold statement pieces and trendy contemporary designs, this collection offers something for every personality, occasion, and lifestyle." },
    { type: 'p', text: "Earrings play a vital role in defining personal style and enhancing overall appearance. The right pair can instantly highlight facial features, add a touch of sophistication, and complete any outfit with effortless charm. Whether you prefer subtle everyday elegance or eye-catching festive styles, this collection ensures you always find the perfect match for your mood and moment." },
    { type: 'p', text: "Designed for modern women, these earrings focus on versatility and wearability. Each piece transitions seamlessly from daily routines to special occasions, allowing you to maintain a consistent sense of style without compromising on comfort or practicality." },
    { type: 'p', text: "Crafted with precision and attention to detail, every design reflects a balance of <strong>aesthetic beauty, lightweight comfort, and long-lasting durability</strong>. Whether worn at work, during travel, or at celebrations, these earrings are made to complement your lifestyle effortlessly while keeping you stylish throughout the day." },
    { type: 'p', text: "More than just accessories, these earrings are a reflection of individuality and confidence—helping you express your personality with elegance in every look." },

    { type: 'h', text: "Explore a Wide Range of Earrings Online" },
    { type: 'p', text: "Shopping for earrings online gives you access to a diverse and ever-evolving collection of modern, traditional, and trend-inspired designs. Whether you prefer <strong>minimal pieces for everyday elegance</strong> or <strong>luxurious statement styles for special occasions</strong>, this collection ensures you always find the perfect pair that matches your personality, outfit, and lifestyle." },
    { type: 'p', text: "Online jewellery shopping also makes it easier to explore the latest fashion trends, compare different styles, and make confident decisions without any hassle. With detailed product descriptions, high-quality visuals, and a wide variety of designs, you can discover earrings that truly reflect your personal style—all from the comfort of your home." },
    { type: 'p', text: "This seamless experience allows you to build a versatile jewellery collection that works for every mood, moment, and occasion." },

    { type: 'h', text: "What You Can Explore:" },
    { type: 'ul', items: [
        "Gold earrings with timeless elegance and traditional charm",
        "Lightweight everyday earrings designed for comfort and daily wear",
        "Fashion-forward designer earrings inspired by modern trends",
        "Elegant gifting pieces perfect for celebrations and special moments"
    ]},

    { type: 'h', text: "Gold Earrings – Timeless Elegance & Luxury Appeal" },
    { type: 'p', text: "<strong>Gold earrings</strong> are a true jewellery classic that never goes out of style. Celebrated for their elegance, cultural significance, and enduring value, they remain one of the most preferred choices for women across generations. A pair of gold earrings effortlessly represents sophistication, tradition, and refined beauty in a single design." },
    { type: 'p', text: "Modern gold earring designs focus on lightweight construction, comfort, and minimal aesthetics, making them ideal for today's fast-paced lifestyle. Whether worn daily or reserved for special occasions, they offer a perfect balance of luxury and practicality. From sleek and simple studs to intricately crafted traditional designs, gold earrings enhance every outfit with a touch of timeless charm." },
    { type: 'p', text: "Their versatility allows them to blend seamlessly with both ethnic and western wear, making them a must-have in every jewellery collection. Whether you're heading to work, attending a celebration, or styling a casual look, gold earrings always add a graceful finishing touch." },

    { type: 'h', text: "Why Choose Gold Earrings:" },
    { type: 'ul', items: [
        "Timeless and elegant appearance that never goes out of fashion",
        "Suitable for both everyday wear and special occasions",
        "Available in minimal, modern, and detailed traditional designs",
        "Pairs beautifully with both ethnic and western outfits"
    ]},

    { type: 'h', text: "Everyday Earrings – Lightweight & Comfortable Style" },
    { type: 'p', text: "<strong>Everyday earrings</strong> are thoughtfully designed for maximum comfort, simplicity, and effortless wearability throughout the day. Crafted with lightweight materials and smooth finishing, these designs ensure you can wear them for long hours without discomfort, making them ideal for busy modern lifestyles." },
    { type: 'p', text: "Perfect for work, travel, college, or casual outings, everyday earrings offer a seamless blend of style and practicality. Their minimal yet elegant designs allow you to maintain a polished and put-together look without the need for heavy or elaborate jewellery." },
    { type: 'p', text: "Modern everyday earrings are all about understated beauty—focusing on clean shapes, subtle detailing, and versatile styling. Whether paired with western outfits or traditional attire, they adapt effortlessly to different looks and occasions." },

    { type: 'h', text: "Key Features:" },
    { type: 'ul', items: [
        "Lightweight and skin-friendly designs for all-day comfort",
        "Easy to wear for long hours without irritation",
        "Minimal, clean, and elegant styling for everyday use",
        "Perfect match for daily outfits, office wear, and casual routines"
    ]},

    { type: 'h', text: "Earrings for Women – Stylish & Versatile Designs" },
    { type: 'p', text: "This curated collection of <strong>earrings for women</strong> features a wide variety of styles designed to suit every mood, personality, and occasion. From subtle everyday elegance to bold and expressive fashion statements, each pair is thoughtfully crafted to enhance natural beauty while adding a modern and stylish touch to your overall look." },
    { type: 'p', text: "Whether you prefer timeless classics or trend-driven designs, these earrings offer the perfect balance of versatility and elegance. Designed to complement different face shapes and outfits, they help you create effortless styling for both casual and special occasions." },
    { type: 'p', text: "Each piece is made with attention to detail, ensuring comfort, durability, and long-lasting shine—making them suitable for regular wear as well as festive styling." },

    { type: 'h', text: "Popular Styles:" },
    { type: 'ul', items: [
        "<strong>Stud earrings</strong> for minimal and everyday elegant looks",
        "<strong>Hoop earrings</strong> for trendy, modern, and stylish appeal",
        "<strong>Drop earrings</strong> for graceful and elegant occasions",
        "<strong>Designer earrings</strong> for bold, standout fashion statements"
    ]},

    { type: 'h', text: "Trending Earrings Styles You Should Explore" },
    { type: 'p', text: "Stay ahead in fashion with the latest <strong>trending earring designs</strong> that beautifully combine creativity, elegance, and modern aesthetics. Today's jewellery trends focus on versatility and self-expression, allowing you to choose styles that match your personality, outfit, and occasion effortlessly." },
    { type: 'p', text: "From minimal everyday essentials to bold statement pieces, these designs are created to enhance your overall look while keeping comfort and wearability in mind. Whether you prefer subtle elegance or standout fashion, there is a trending style for every mood." },

    { type: 'h', text: "1. Minimal Earrings" },
    { type: 'p', text: "Simple, clean, and elegant designs that are perfect for everyday wear and professional settings. Minimal earrings offer effortless sophistication and pair well with any outfit." },

    { type: 'h', text: "2. Hoop Earrings" },
    { type: 'p', text: "Stylish circular designs that add a modern, confident, and trendy touch. Hoops are versatile enough for both casual and semi-formal looks." },

    { type: 'h', text: "3. Drop Earrings" },
    { type: 'p', text: "Graceful and elegant designs that enhance festive, party, and special occasion outfits. Drop earrings bring movement and sophistication to your style." },

    { type: 'h', text: "4. Geometric Earrings" },
    { type: 'p', text: "Contemporary shapes and artistic patterns inspired by modern design trends. These earrings are ideal for those who prefer bold, structured, and fashion-forward accessories." },

    { type: 'h', text: "5. Statement Earrings" },
    { type: 'p', text: "Eye-catching and expressive designs created to stand out. Perfect for special occasions, they instantly elevate even the simplest outfits with bold personality and charm." },

    { type: 'h', text: "Earrings for Everyday Wear – Comfort Meets Style" },
    { type: 'p', text: "<a href=\"#\">Everyday earrings</a> are thoughtfully designed for women who prefer effortless, practical, and stylish fashion. Crafted with lightweight materials and smooth finishing, these earrings ensure maximum comfort, allowing you to wear them throughout the day without irritation or heaviness." },
    { type: 'p', text: "Perfect for modern lifestyles, they are ideal for office wear, casual outings, college, travel, and daily routines. Their simple yet elegant designs offer a refined look that enhances your appearance without being overpowering, making them a reliable everyday jewellery essential." },
    { type: 'p', text: "These versatile earrings are designed to blend seamlessly with both western and traditional outfits. Whether paired with formal attire or casual clothing, they maintain a consistent sense of style and elegance, helping you look polished in every setting with minimal effort." },

    { type: 'h', text: "Gold Earrings – A Symbol of Grace & Tradition" },
    { type: 'p', text: "<strong>Gold earrings</strong> are more than just a fashion accessory—they represent grace, tradition, and timeless beauty that transcends generations. Often associated with cultural heritage and elegance, gold earrings remain a cherished choice for women who value both style and meaning in their jewellery." },
    { type: 'p', text: "Their versatility makes them suitable for a wide range of occasions, from everyday wear to festive celebrations. Whether paired with ethnic attire or modern western outfits, gold earrings effortlessly enhance any look with a touch of sophistication and charm." },
    { type: 'p', text: "Modern gold earring designs are crafted with a focus on lightweight comfort and everyday usability. This ensures they can be worn for long hours without discomfort while still maintaining a premium, elegant appearance. The combination of traditional appeal and contemporary design makes them a must-have in every jewellery collection." },

    { type: 'h', text: "How to Choose the Perfect Earrings Online" },
    { type: 'p', text: "Choosing the right earrings online becomes simple and enjoyable when you focus on a few important factors. With so many styles available today, selecting thoughtfully ensures your earrings not only enhance your appearance but also suit your comfort, lifestyle, and personal fashion preferences." },

    { type: 'h', text: "1. Consider Your Style" },
    { type: 'p', text: "Start by identifying your personal style. Minimal earrings are ideal for everyday wear and professional looks, while bold and statement designs are perfect for occasions and festive events. Choosing according to your style helps you create a consistent and confident look." },

    { type: 'h', text: "2. Choose the Right Material" },
    { type: 'p', text: "The material plays a key role in both comfort and durability. Gold offers timeless elegance, silver provides a modern and versatile appeal, while plated designs offer stylish options at an affordable range. Select based on your comfort and long-term use preference." },

    { type: 'h', text: "3. Focus on Comfort" },
    { type: 'p', text: "Comfort is essential, especially for daily wear. Lightweight earrings with smooth edges ensure you can wear them throughout the day without irritation or heaviness, making them ideal for busy routines." },

    { type: 'h', text: "4. Match with Your Outfits" },
    { type: 'p', text: "Choose earrings that can easily complement multiple outfits. Versatile designs allow you to style them with both western and traditional wear, giving you more value and flexibility from a single pair." },

    { type: 'h', text: "5. Check Craftsmanship" },
    { type: 'p', text: "Always pay attention to finishing, detailing, and build quality. Well-crafted earrings with smooth polish and durable structure ensure long-lasting beauty and reliable everyday use." },

    { type: 'h', text: "Styling Tips – Elevate Your Look with Earrings" },
    { type: 'p', text: "<strong>Earrings</strong> have the power to instantly transform your overall appearance, making even the simplest outfit look more polished and stylish. With the right styling approach, you can enhance your natural features and create looks that feel balanced, modern, and effortlessly elegant." },

    { type: 'h', text: "1. Wear Studs for a Clean & Professional Appearance" },
    { type: 'p', text: "Stud earrings are perfect for office wear and formal settings. Their minimal design adds a touch of elegance without drawing too much attention, helping you maintain a neat and professional look." },

    { type: 'h', text: "2. Choose Hoops for a Trendy, Modern Vibe" },
    { type: 'p', text: "Hoop earrings bring a stylish and confident edge to your outfit. They work beautifully for casual outings and semi-formal looks, adding a modern fashion-forward touch." },

    { type: 'h', text: "3. Pair Statement Earrings with Minimal Outfits" },
    { type: 'p', text: "Statement earrings are bold by nature, so pairing them with simple or neutral outfits ensures they stand out as the focal point of your look without overwhelming your style." },

    { type: 'h', text: "4. Match Earrings with Necklaces for a Coordinated Look" },
    { type: 'p', text: "Coordinating earrings with necklaces creates a balanced and well-put-together appearance. This styling approach works especially well for festive and special occasions." },

    { type: 'h', text: "5. Keep Everyday Styling Simple & Elegant" },
    { type: 'p', text: "For daily wear, opt for lightweight and minimal designs. Simple styling ensures comfort while maintaining a clean, graceful, and effortlessly stylish look throughout the day." },

    { type: 'h', text: "Earrings as a Perfect Gift – A Timeless Expression of Love & Care" },
    { type: 'p', text: "<strong>Earrings</strong> are among the most meaningful and universally loved jewellery gifts. Their elegance, versatility, and emotional value make them a perfect choice for expressing affection, appreciation, and celebration. Unlike ordinary gifts, earrings carry a personal touch that reflects thoughtfulness and emotional connection, making them memorable for years to come." },
    { type: 'p', text: "Whether simple or luxurious, a carefully chosen pair of earrings can beautifully capture special moments and turn them into lasting memories. They are suitable for all ages and styles, which makes them one of the most reliable and cherished gifting options in jewellery." },
    { type: 'p', text: "Earrings also hold a unique advantage as gifts because they can be worn regularly and styled effortlessly with different outfits. This ensures that the recipient not only receives a beautiful present but also a practical accessory that becomes part of their <strong>everyday fashion</strong>." },

    { type: 'h', text: "Perfect For:" },
    { type: 'ul', items: [
        "Birthdays – A stylish and thoughtful surprise that adds joy to the celebration",
        "Anniversaries – A symbol of love, bonding, and shared memories",
        "Festivals – A traditional yet fashionable gifting choice for special occasions",
        "Romantic occasions – A meaningful way to express love and affection",
        "Personal milestones – Celebrating achievements and unforgettable moments"
    ]},
    { type: 'p', text: "A well-selected pair of earrings is more than just jewellery—it becomes a lasting reminder of emotions, relationships, and special occasions. From minimal everyday studs to elegant festive designs, earrings remain a timeless gift that always feels personal, valuable, and unforgettable." },

    { type: 'h', text: "Why Buy Earrings Online?" },
    { type: 'p', text: "<strong>Buying earrings online</strong> has transformed the way people explore and purchase jewellery. Instead of being limited to a few local store options, online shopping opens access to a vast and diverse collection of designs that suit every taste, occasion, and budget. Whether you are looking for minimal everyday studs, elegant gold earrings, trendy hoops, or bold statement pieces, everything is available in one place with just a few clicks." },
    { type: 'p', text: "One of the biggest advantages of online jewellery shopping is the ability to explore styles at your own pace. You can compare multiple designs, check details carefully, and select earrings that truly match your personality and fashion preferences. This makes the decision-making process more informed and stress-free." },
    { type: 'p', text: "Online platforms also keep you updated with the latest jewellery trends. From modern geometric designs to timeless classics, you can easily discover new arrivals and fashion-forward styles that may not always be available in physical stores." },
    { type: 'p', text: "In addition, the convenience factor makes online shopping highly practical. You can browse collections anytime, from anywhere, without the need to visit multiple shops. Secure payment options and reliable delivery systems further enhance the overall experience, making jewellery shopping smooth and trustworthy." },

    { type: 'h', text: "Benefits:" },
    { type: 'ul', items: [
        "Wide range of modern and traditional earring designs in one place",
        "Easy comparison of styles, materials, and prices before buying",
        "Access to latest jewellery trends and new collections",
        "Convenient shopping experience from home or mobile",
        "Secure checkout and safe payment options for worry-free purchasing"
    ]},

    { type: 'h', text: "Care & Maintenance Tips for Earrings" },
    { type: 'p', text: "Proper care ensures your earrings maintain their shine, durability, and beauty over time. Whether you <strong>wear gold earrings, silver pieces, or fashion jewellery</strong>, simple maintenance habits can significantly extend their lifespan." },
    { type: 'p', text: "Always store your earrings in a dry, clean jewellery box to prevent scratches and tarnishing. Avoid direct contact with perfumes, hairsprays, and harsh chemicals, as these can affect the finish and shine. For daily cleaning, gently wipe your earrings with a soft, dry cloth to remove dust and oil buildup." },
    { type: 'p', text: "For delicate designs, especially gemstone or plated earrings, handle them with extra care and avoid wearing them during heavy physical activities or while sleeping. With regular care, your favourite pieces will continue to look elegant for years." },

    { type: 'h', text: "Materials Used in Our Earrings Collection" },
    { type: 'p', text: "Our earrings are crafted using a variety of high-quality materials to ensure durability, comfort, and long-lasting style. Each material is carefully selected to match different fashion preferences and budgets." },
    { type: 'p', text: "<strong>Gold earrings</strong> are designed to offer timeless luxury and cultural elegance. Silver and sterling silver earrings provide a modern, versatile look that suits everyday wear. Gold-plated designs deliver an affordable luxury option with a rich appearance and lightweight feel." },
    { type: 'p', text: "We also use skin-friendly alloys and premium finishes to ensure comfort for sensitive skin, making our collection suitable for all-day wear without irritation." },

    { type: 'h', text: "Earrings for Different Face Shapes" },
    { type: 'p', text: "Choosing the <strong>right earrings</strong> based on face shape can enhance your natural beauty and overall look." },
    { type: 'p', text: "For round faces, long drop earrings or angular designs help create a balanced appearance. Oval faces are versatile and suit almost all earring styles, including studs, hoops, and statement designs. Square faces look great with rounded hoops or soft curved designs that reduce sharpness." },
    { type: 'p', text: "Heart-shaped faces are complemented by teardrop and chandelier earrings that balance wider foreheads. Understanding your face shape helps you choose earrings that naturally enhance your features." },

    { type: 'h', text: "Occasion-Based Earring Guide" },
    { type: 'p', text: "Different occasions call for different earring styles to match your outfit and mood." },
    { type: 'p', text: "For <strong>daily wear, minimal studs and lightweight hoops</strong> are ideal for comfort and simplicity. Office wear works best with subtle, elegant designs that maintain a professional look." },
    { type: 'p', text: "For festive occasions, gold earrings and embellished drop earrings add a traditional and rich touch. Parties and special events are perfect for statement earrings that stand out and elevate your entire outfit." },
    { type: 'p', text: "Choosing earrings based on occasion helps you maintain a well-balanced and stylish appearance at all times." },

    { type: 'h', text: "Lightweight Earrings – Designed for All-Day Comfort" },
    { type: 'p', text: "Lightweight earrings are a must-have for modern lifestyles where comfort and style go hand in hand. These designs are carefully crafted to reduce pressure on the ears while maintaining elegant aesthetics." },
    { type: 'p', text: "Perfect for long working hours, travel, or daily routines, lightweight earrings ensure you stay comfortable without compromising on style. Their minimal structure and smooth finishing make them suitable for extended wear." },
    { type: 'p', text: "Despite being light in weight, these earrings are designed to look stylish and fashionable, making them an essential part of every jewellery collection." },

    { type: 'h', text: "Fashion Trends in Earrings 2026" },
    { type: 'p', text: "<strong>Earring fashion</strong> continues to evolve with modern trends focusing on simplicity, individuality, and versatility." },
    { type: 'p', text: "Minimalist designs are gaining popularity for their clean and elegant appeal. Geometric shapes and asymmetrical styles are also trending for those who prefer bold and artistic looks. Layered and stacked earrings are becoming a favourite among fashion-forward users." },
    { type: 'p', text: "Gold-toned classics and modern silver finishes continue to dominate everyday fashion, while statement earrings remain essential for festive and occasion wear. These trends reflect a shift toward personalized and expressive jewellery styling." },

    { type: 'h', text: "Earrings as a Style Statement" },
    { type: 'p', text: "<strong>Earrings</strong> are no longer just accessories—they are a powerful fashion statement that defines your personality." },
    { type: 'p', text: "A carefully chosen pair of earrings can completely transform your look, adding elegance, confidence, or boldness depending on the style. From subtle studs that enhance professionalism to dramatic statement pieces that express individuality, earrings play a key role in modern fashion." },
    { type: 'p', text: "They help you express your mood, personality, and fashion sense without saying a word, making them one of the most impactful jewellery pieces in any collection." },

    { type: 'h', text: "Gift Packaging & Presentation" },
    { type: 'p', text: "Every pair of earrings <a href=\"#\">deserves beautiful</a> presentation, especially when given as a gift. Elegant packaging enhances the overall gifting experience and makes the moment more special." },
    { type: 'p', text: "Our earrings are thoughtfully packed to ensure safety and aesthetic appeal. Whether it's a birthday, anniversary, or festive celebration, well-designed packaging adds a premium touch to your gift." },
    { type: 'p', text: "A beautifully packaged pair of <strong>earrings</strong> not only looks luxurious but also creates a memorable unboxing experience for the receiver." },

    { type: 'h', text: "Building Your Perfect Earring Collection" },
    { type: 'p', text: "A well-rounded jewellery collection includes a mix of different earring styles to suit every occasion." },
    { type: 'p', text: "Start with essential <strong>everyday studs for daily wear</strong>, add hoops for casual and trendy looks, include gold earrings for traditional occasions, and statement pieces for special events. This combination ensures you are always prepared for any outfit or situation." },

    { type: 'h', text: "Why Choose Our Earrings Collection" },
    { type: 'p', text: "Our earrings collection is thoughtfully designed to bring together <strong>elegance, comfort, and modern fashion trends</strong> in every piece. Each design is carefully curated with attention to detail, ensuring high-quality finishing, smooth edges, and long-lasting durability for everyday as well as occasional wear." },
    { type: 'p', text: "We focus on creating earrings that not only enhance your style but also fit seamlessly into your daily lifestyle. Whether you prefer minimal elegance or bold fashion statements, this collection offers versatile options that complement every mood, outfit, and occasion." },
    { type: 'p', text: "Every piece reflects a perfect balance of style and practicality, making it easy to wear throughout the day without compromising on comfort or appearance." },

    { type: 'h', text: "Highlights:" },
    { type: 'ul', items: [
        "Stylish gold earrings and everyday wearable designs",
        "Lightweight and comfortable pieces for all-day use",
        "Trend-driven styles with a timeless fashion appeal",
        "Suitable for both daily wear and meaningful gifting"
    ]},

    { type: 'h', text: "Shop Earrings Online with Confidence" },
    { type: 'p', text: "Enjoy a smooth and hassle-free shopping experience with a wide variety of earrings designed for modern lifestyles. Our collection makes it easy to explore, compare, and choose the perfect pair that matches your personality and style preferences." },
    { type: 'p', text: "Whether you are shopping for yourself or selecting a thoughtful gift for someone special, this collection ensures a perfect blend of <strong>quality, style, and convenience</strong> in every purchase. With secure checkout and a user-friendly browsing experience, finding your ideal earrings has never been easier." },
    { type: 'p', text: "Building a diverse collection helps you express different styles effortlessly while maximizing the value of your jewellery wardrobe." },
    { type: 'p', text: "Earrings are one of the most versatile and expressive jewellery pieces you can own. Whether your style is minimal, elegant, bold, or trendy, the right pair of earrings can instantly elevate your entire look." },
    { type: 'p', text: "Experimenting with different designs, shapes, and materials allows you to discover your personal style while staying aligned with modern fashion trends. The key is to choose <a href=\"#\">fine jewellery</a> pieces that reflect your personality and make you feel confident every time you wear them." },
];

// ── FIXED: now also flattens/rebuilds 'ul' items correctly ──
const flattenEarringContent = (content) => {
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

const rebuildEarringContent = (originalContent, translatedArr) => {
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
const rebuildFaq = (translatedArr) => { const result = []; for (let i = 0; i < translatedArr.length; i += 2) { result.push({ q: translatedArr[i], a: translatedArr[i + 1] }); } return result; };

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
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'opacity 0.3s ease', opacity: visible ? 1 : 0,
        }}>{message}</div>
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
    const categoryUrl = categorySlugMap[product.category] || 'earrings';

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
                        <span style={{ fontSize: '13px', color: '#555' }}>{ui.qty}:</span>
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
                                <svg width="15" height="14" viewBox="0 0 16 15" fill="none">
                                    <path d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.3" fill={wishlist.includes(product._id) ? 'currentColor' : 'none'} />
                                </svg>
                                {ui.addToWishlist}
                            </button>
                            <Link href={`/product-category/${categoryUrl}/${product.slug}`} onClick={onClose} style={{ flex: 1, textAlign: 'center', border: '1px solid #ddd', background: '#fff', padding: '11px 12px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', textDecoration: 'none', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ui.viewDetails}</Link>
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

    const imgSrc = images.length > 0 ? getImgSrc(images[currentImg]) : '/placeholder.jpg';
    const oldPrice = variant.oldPrice;
    const newPrice = variant.newPrice ?? variant.price;
    const isSale = variant.isSale;
    const categoryUrl = categorySlugMap[p.category] || "earrings";

    return (
        <Link href={`/product-category/${categoryUrl}/${p.slug}`} className="jw-card" onMouseEnter={startHover} onMouseLeave={stopHover}>
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">{ui.sale}</span>}
                <img src={imgSrc} alt={p.title} className="jw-card-img" loading="lazy" onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                {images.length > 1 && (
                    <div className="jw-img-dots">
                        {images.map((_, i) => <span key={i} className={`jw-img-dot ${i === currentImg ? 'jw-img-dot--active' : ''}`} />)}
                    </div>
                )}
                <div className="jw-card-actions">
                    {/* Wishlist */}
                    <button
                        className={`jw-action-btn ${wishlist.includes(p._id) ? 'jw-action-btn--active' : ''}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p._id, { _id: p._id, slug: p.slug, title: p.title, category: p.category, images: variant.images || [], oldPrice: variant.oldPrice, newPrice: variant.newPrice, isSale: variant.isSale }); }}
                        title={ui.addToWishlist} aria-label={ui.addToWishlist}
                    >
                        <svg width="16" height="15" viewBox="0 0 16 15" fill="none">
                            <path d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z" stroke="currentColor" strokeWidth="1.3" fill={wishlist.includes(p._id) ? 'currentColor' : 'none'} />
                        </svg>
                    </button>
                    {/* Quick View */}
                    <button className="jw-action-btn" title={ui.quickView} aria-label={ui.quickView} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(p); }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M1 8C2.5 4 5 2 8 2C11 2 13.5 4 15 8C13.5 12 11 14 8 14C5 14 2.5 12 1 8Z" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                    </button>
                    {/* Add to Cart */}
                    <button className="jw-action-btn jw-add-cart" title={ui.addToCart} aria-label={ui.addToCart} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(p, 1); }}>
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
//  MAIN EARRINGS PAGE
// ─────────────────────────────────────────────────────────
export default function Earrings() {
    const router = useRouter();

    const [ui, setUi] = useState(DEFAULT_UI);
    const [translatedEarringContent, setTranslatedEarringContent] = useState(EarringContent);
    const [translatedFaq, setTranslatedFaq] = useState(faqData);
    const [translatedCategories, setTranslatedCategories] = useState(DEFAULT_CATEGORIES.map((c) => ({ ...c, translatedName: c.name })));
    const [translationStatus, setTranslationStatus] = useState("idle");
    const [currency, setCurrency] = useState(CURRENCY_MAP.default);

    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Earrings");
    const [perPage, setPerPage] = useState(30);
    const [sort, setSort] = useState("default");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Wishlist — WishlistContext ──
    const { wishlistItems, addToWishlist, removeFromWishlist: removeFromWishlistCtx } = useWishlist();
    const wishlist = (wishlistItems || []).map(item => item._id || item);

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

            const allStrings = [...flattenUI(DEFAULT_UI), ...flattenEarringContent(EarringContent), ...flattenFaq(faqData), ...flattenCategories(DEFAULT_CATEGORIES)];
            const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texts: allStrings, targetLanguage: languageCode, sourceLanguage: "en" }) });
            const translateData = await translateRes.json();
            if (!translateData.success) throw new Error("Translation failed");

            const all = translateData.translations;
            const uiCount = flattenUI(DEFAULT_UI).length;
            // FIXED: count must match flattened length (ul items expand into multiple strings)
            const contentCount = flattenEarringContent(EarringContent).length;
            const faqCount = faqData.length * 2;

            setUi(rebuildUI(all.slice(0, uiCount)));
            setTranslatedEarringContent(rebuildEarringContent(EarringContent, all.slice(uiCount, uiCount + contentCount)));
            setTranslatedFaq(rebuildFaq(all.slice(uiCount + contentCount, uiCount + contentCount + faqCount)));
            setTranslatedCategories(rebuildCategories(DEFAULT_CATEGORIES, all.slice(uiCount + contentCount + faqCount)));
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
                const url = `${API_BASE}/api/products?${new URLSearchParams(activeCategory ? { category: activeCategory } : {}).toString()}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Server Error: ${response.status}`);
                const data = await response.json();
                if (data.success) { setProducts(data.products || []); } else { throw new Error(data.message || "Failed to fetch data."); }
            } catch (err) { console.error("[Earrings] Fetch error:", err); setError(err.message); } finally { setLoading(false); }
        };
        fetchProducts();
    }, [activeCategory]);

    // ── Wishlist toggle ──
    const toggleWishlist = useCallback((id, productData) => {
        if (wishlist.includes(id)) { removeFromWishlistCtx(id); } else { addToWishlist(productData || { _id: id }); }
    }, [wishlist, addToWishlist, removeFromWishlistCtx]);

    // ── Add to Cart ──
    const handleAddToCart = useCallback((product, qty = 1) => {
        const variant = getFirstVariant(product);
        window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { item: { _id: product._id, slug: product.slug, title: product.title, category: product.category, images: variant.images || [], oldPrice: variant.oldPrice, newPrice: variant.newPrice, isSale: variant.isSale, qty } } }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-cart-drawer')), 400);
        showToast(`"${product.title}" added to cart`);
    }, [showToast]);

    const openQuickView = useCallback((product) => setQuickViewProduct(product), []);
    const closeQuickView = useCallback(() => setQuickViewProduct(null), []);

    const sortedProducts = [...products].sort((a, b) => {
        const aP = getFirstVariant(a).newPrice || 0, bP = getFirstVariant(b).newPrice || 0;
        if (sort === "price-asc") return aP - bP;
        if (sort === "price-desc") return bP - aP;
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
            const layout = layoutRef.current, sidebar = sidebarRef.current;
            if (!layout || !sidebar) return;
            const scrollY = window.scrollY, layoutTop = layout.offsetTop, layoutH = layout.offsetHeight;
            const sidebarH = sidebar.offsetHeight, sidebarW = sidebar.parentElement?.offsetWidth || sidebar.offsetWidth;
            const contentH = layoutH - (parseFloat(window.getComputedStyle(layout).paddingBottom) || 0);
            const stickStart = layoutTop - TOP_OFFSET, stickEnd = layoutTop + contentH - sidebarH - TOP_OFFSET;
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
                <QuickViewModal product={quickViewProduct} currency={currency} ui={ui} onClose={closeQuickView}
                    onAddToCart={(product, qty) => { handleAddToCart(product, qty); closeQuickView(); }}
                    wishlist={wishlist} onToggleWishlist={toggleWishlist} />
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
                                {[12, 15, 30].map((n) => <button key={n} className={`jw-per-btn ${perPage === n ? 'jw-per-btn--active' : ''}`} onClick={() => setPerPage(n)}>{n}</button>)}
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
                            <button className="jw-grid-toggle" title={ui.gridView}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect width="7" height="7" rx="1" fill="currentColor" /><rect x="9" width="7" height="7" rx="1" fill="currentColor" /><rect y="9" width="7" height="7" rx="1" fill="currentColor" /><rect x="9" y="9" width="7" height="7" rx="1" fill="currentColor" /></svg>
                            </button>
                        </div>
                    </div>

                    {error && <div className="jw-error"><span>⚠️ {error}</span><button onClick={() => setActiveCategory(activeCategory)}>{ui.retry}</button></div>}

                    <div className="jw-grid">
                        {loading ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />) : displayed.length > 0 ? (
                            displayed.map((p) => <ProductCard key={p._id} p={p} wishlist={wishlist} toggleWishlist={toggleWishlist} currency={currency} ui={ui} onQuickView={openQuickView} onAddToCart={handleAddToCart} />)
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
                        <AccordionItem title={ui.everydayWear}>
                            <div className="jw-accordion-text">
                                {translatedEarringContent.map((item, i) => {
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