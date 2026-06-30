'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ForToday.css';
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
//  TRANSLATION HOOK
// ─────────────────────────────────────────────────────────
function useTranslation(strings) {
    const [translated, setTranslated] = useState(strings);
    const [status, setStatus] = useState("idle");
    const [countryCode, setCountryCode] = useState(null);

    const key = JSON.stringify(strings);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            if (!strings || strings.length === 0) return;
            try {
                setStatus("loading");

                const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
                const detectData = await detectRes.json();
                if (!detectData.success) throw new Error("Language detection failed");

                const { languageCode, countryCode: cc } = detectData;
                if (!cancelled && cc) setCountryCode(cc);

                if (languageCode === "en") {
                    if (!cancelled) { setTranslated(strings); setStatus("done"); }
                    return;
                }

                const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        texts: strings,
                        targetLanguage: languageCode,
                        sourceLanguage: "en",
                    }),
                });

                const translateData = await translateRes.json();
                if (!translateData.success) throw new Error("Translation failed");

                if (!cancelled) {
                    setTranslated(translateData.translations);
                    setStatus("done");
                }
            } catch (err) {
                console.error("Translation error:", err.message);
                if (!cancelled) { setTranslated(strings); setStatus("error"); }
            }
        }
        run();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { translated, status, countryCode };
}

// ─────────────────────────────────────────────────────────
//  STATIC DATA
// ─────────────────────────────────────────────────────────
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
//  UI_STRINGS
//  0-32   : fixed UI labels / categories / price ranges
//  33-52  : FAQ Questions (20)
//  53-72  : FAQ Answers (20)
//  73-229 : Main content (headings / paragraphs / list items / links)
//  230-235: Utilities (SALE, wishlist, quick view, add to cart, price na, "in")
// ─────────────────────────────────────────────────────────
const UI_STRINGS = [
    // 0-17
    "Filters", "Product Categories", "Price",
    "Lightweight Daily Wear Fine Jewellery for Everyday Style",
    "Loading...", "Showing", "of", "results", "Show",
    "Default sorting", "Price: Low to High", "Price: High to Low", "Newest",
    "No products found", "Check browser console (F12) for errors.", "Retry",
    "Everyday Wear Jewellery", "Frequently Asked Questions",
    // 18-26 categories
    "Chosen", "Earrings", "For Today", "Jewellery", "Mens", "New", "Pendants", "Rings", "Womens",
    // 27-32 price ranges
    "€1–€500", "€500–€1000", "€1000–€2000", "€2000–€5000", "€5000–€10000", "€10000+",

    // ── FAQ Questions (33-52) ──
    "What is everyday fine jewellery?",
    "Can fine jewellery be worn every day?",
    "What materials are used in everyday fine jewellery?",
    "Is everyday fine jewellery durable?",
    "How is fine jewellery different from fashion jewellery?",
    "Can I wear fine jewellery while sleeping?",
    "Is everyday fine jewellery suitable for office wear?",
    "Does fine jewellery lose its shine over time?",
    "How should I clean everyday fine jewellery?",
    "Can I wear fine jewellery while showering?",
    "Is everyday fine jewellery lightweight?",
    "Can I layer everyday fine jewellery?",
    "Is fine jewellery a good investment?",
    "What types of jewellery are best for daily wear?",
    "Does everyday jewellery require maintenance?",
    "Can fine jewellery cause skin irritation?",
    "Is everyday fine jewellery suitable for travel?",
    "How do I store fine jewellery properly?",
    "Can fine jewellery be worn with both ethnic and western outfits?",
    "Why choose everyday fine jewellery?",

    // ── FAQ Answers (53-72) ──
    "Everyday fine jewellery refers to high-quality, lightweight jewellery designed for daily wear, combining durability with elegant, minimal designs.",
    "Yes, everyday fine jewellery is specifically designed to be worn daily due to its comfort, durability, and timeless style.",
    "Common materials include gold, sterling silver, platinum, and sometimes semi-precious gemstones.",
    "Yes, it is crafted with quality materials and strong settings to ensure long-lasting wear.",
    "Fine jewellery uses precious metals and stones, while fashion jewellery is typically made from less durable, non-precious materials.",
    "While possible, it is generally recommended to remove jewellery before sleeping to maintain its condition.",
    "Yes, its minimal and elegant design makes it perfect for professional and office environments.",
    "With proper care, fine jewellery retains its shine for many years.",
    "Use a soft cloth, mild soap, and lukewarm water to gently clean your jewellery.",
    "It's best to avoid wearing jewellery while showering to prevent exposure to chemicals and moisture.",
    "Yes, it is designed to be lightweight for maximum comfort throughout the day.",
    "Absolutely, layering delicate chains, rings, and bracelets is a popular styling trend.",
    "Yes, due to its quality materials and timeless design, it holds long-term value.",
    "Stud earrings, thin chains, simple rings, and minimal pendants are ideal choices.",
    "Minimal maintenance is needed, but regular cleaning helps preserve its appearance.",
    "High-quality fine jewellery is usually hypoallergenic and safe for sensitive skin.",
    "Yes, its lightweight and versatile design makes it ideal for travel.",
    "Store it in a soft pouch or jewellery box to prevent scratches and damage.",
    "Yes, its versatile design complements both traditional and modern styles.",
    "It offers the perfect balance of elegance, durability, and comfort for daily use.",

    // ════════════════════════════════════════════════════
    //  MAIN CONTENT (73 onward)
    // ════════════════════════════════════════════════════

    // 73-77
    "Daily Wear Jewellery – Lightweight, Stylish & Perfect for Everyday Use",
    "Discover a thoughtfully curated collection of <b>daily wear jewellery</b>, including <b>daily wear gold jewellery</b>, <b>dainty jewellery</b>, and <b>everyday fine jewellery</b> designed to bring together comfort, simplicity, and modern style. Created for today's fast-paced lifestyle, our jewellery blends elegance with practicality, allowing you to look polished, confident, and effortlessly stylish every day without compromising on comfort.",
    "Each piece in our collection is crafted with a focus on lightweight construction, smooth finishing, and minimal design, making it ideal for long hours of wear. Whether you prefer subtle elegance or a slightly layered look, our jewellery offers versatile styling options that seamlessly adapt to your daily routine. From delicate chains and refined rings to minimal earrings and understated pendants, every design is created to enhance your natural style without feeling heavy or overwhelming.",
    "Whether you are heading to work, attending casual outings, traveling, or managing your day-to-day activities, our jewellery for everyday wear is designed to complement your lifestyle effortlessly. Its clean and modern aesthetic ensures that it pairs beautifully with both western and traditional outfits, making it a reliable choice for any setting.",
    "Beyond style, durability and ease of maintenance are key features of our <b>everyday jewellery</b> collection. Each piece is made to retain its shine and quality over time, allowing you to enjoy long-lasting wear with minimal effort. This combination of comfort, versatility, and timeless appeal makes our daily wear jewellery an essential part of your everyday wardrobe.",

    // 78-88 Daily Wear Gold Jewellery
    "Daily Wear Gold Jewellery – Effortless Elegance for Everyday Lifestyle",
    "<b>Daily wear gold jewellery</b> is thoughtfully designed for those who appreciate the timeless elegance of gold while prioritizing comfort and simplicity in their everyday style. Unlike traditional heavy pieces, modern designs focus on lightweight construction, clean lines, and minimal aesthetics, making them easy to wear throughout the day without feeling bulky or restrictive.",
    "Blending subtle luxury with practical design, today's <b>gold jewellery for daily use</b> is perfect for a variety of settings. Whether you're at the office, heading out for casual outings, traveling, or managing your daily routine, these pieces add a refined touch to your look without appearing excessive. Their understated elegance helps you maintain a polished and confident appearance with minimal effort.",
    "Another key advantage of daily wear gold jewellery is its versatility. These pieces pair effortlessly with both western and ethnic outfits, allowing you to maintain a consistent style across different occasions. From delicate chains and simple earrings to minimal rings and pendants, each design is created to enhance your natural style while offering maximum comfort.",
    "Crafted with attention to detail, these jewellery pieces are designed to provide long-lasting shine and durability. Smooth finishes and lightweight materials ensure ease of wear, while quality craftsmanship makes them suitable for regular use, making them an essential part of any modern jewellery collection.",
    "<b>Key Highlights:</b>",
    "Lightweight designs for all-day comfort",
    "Minimal yet elegant gold-inspired styling",
    "Ideal for office, travel, and daily routine",
    "Easy to pair with western and ethnic outfits",
    "Daily wear gold jewellery offers the perfect balance of elegance and practicality, making it a reliable choice for enhancing your everyday style with effortless sophistication.",

    // 89-99 Daily Wear Jewellery – Modern Minimal Fashion Essentials
    "Daily Wear Jewellery – Modern Minimal Fashion Essentials",
    "<b>Daily wear jewellery</b> reflects a modern approach to fashion where simplicity, comfort, and elegance come together effortlessly. Designed for everyday use, these pieces focus on clean aesthetics and lightweight construction, making them ideal for long hours of wear. From dainty rings and minimal earrings to delicate chains and subtle pendants, each design enhances your natural look without appearing too bold or overwhelming.",
    "This category is built around versatility and ease. <b>Daily wear jewellery</b> is created to blend seamlessly with a variety of outfits, allowing you to maintain a consistent and polished style without the need to frequently change accessories. Whether you prefer a minimal, understated look or enjoy layering pieces for a more contemporary style, these designs offer flexibility to suit your personal preference.",
    "Another key aspect of modern daily wear jewellery is its timeless appeal. While inspired by current fashion trends, the designs remain simple enough to stay relevant over time. This ensures that your jewellery continues to complement your wardrobe season after season, making it a practical and stylish investment.",
    "Crafted with attention to comfort and durability, these pieces are suitable for students, professionals, and anyone looking for effortless everyday styling. Their lightweight feel and refined finish make them easy to wear throughout the day, whether at work, during travel, or in casual settings.",
    "<b>Key Highlights:</b>",
    "Comfortable jewellery designed for everyday use",
    "Simple, clean, and modern design aesthetics",
    "Ideal for students, professionals, and daily routines",
    "Long-lasting style with timeless appeal",
    "Daily wear jewellery is more than just an accessory—it's an essential part of your everyday style, offering a perfect balance of practicality, elegance, and modern fashion.",

    // 100-110 Jewellery for Everyday Use
    "Jewellery for Everyday Use – Practical, Durable & Stylish",
    "<b>Jewellery for everyday use</b> is thoughtfully designed to combine durability, comfort, and effortless style. Created for regular wear, these pieces are perfect for individuals who prefer a consistent and refined look without the need for heavy or occasion-specific accessories. With a focus on practicality, everyday jewellery allows you to maintain a polished appearance throughout your daily routine.",
    "This category includes essential pieces such as stud earrings, thin chains, minimal rings, and subtle pendants—each crafted to be easy to wear and simple to style. The designs are intentionally minimal, ensuring they complement your natural look while blending seamlessly with a wide range of outfits. Whether you're dressing for work, casual outings, or travel, these pieces adapt effortlessly to your lifestyle.",
    "Durability is a key feature of jewellery for everyday use. Made with quality materials and careful craftsmanship, these pieces are built to withstand daily activities while maintaining their shine and appeal. Their low-maintenance nature makes them especially convenient, allowing you to enjoy stylish accessories without the need for frequent care or upkeep.",
    "In addition to practicality, everyday jewellery offers timeless design. Its clean and versatile aesthetic ensures that it remains relevant across changing fashion trends, making it a reliable choice for long-term use.",
    "<b>Key Highlights:</b>",
    "Durable craftsmanship designed for regular, everyday use",
    "Easy to match with casual, formal, and traditional outfits",
    "Low-maintenance designs for hassle-free wear",
    "Ideal for work, travel, and daily activities",
    "Jewellery for everyday use is more than just a fashion choice—it's a dependable style essential that combines function, comfort, and elegance for modern living.",

    // 111-120 Best Jewellery for Everyday Wear
    "Best Jewellery for Everyday Wear – Comfort Meets Style",
    "The best jewellery for everyday wear is all about achieving the perfect balance between comfort, elegance, and versatility. These pieces are thoughtfully designed to become a seamless part of your daily routine, enhancing your look without ever feeling heavy or overwhelming. Whether you're heading to work, meeting friends, or managing a busy day, the right jewellery adds a subtle touch of refinement to your overall appearance.",
    "Modern everyday jewellery embraces minimalism, focusing on lightweight designs, smooth finishes, and clean aesthetics. This ensures maximum comfort for long hours of wear while maintaining a polished and stylish look. From delicate chains and simple studs to sleek rings and understated pendants, these essentials are easy to mix, match, and layer according to your personal style.",
    "Another key advantage of <b>everyday jewellery</b> is its adaptability. These pieces effortlessly transition from casual to formal settings, allowing you to maintain a consistent and elegant style throughout the day. Designed with both function and fashion in mind, they offer a practical yet sophisticated solution for modern lifestyles.",
    "<b>Key Highlights:</b>",
    "Trendy minimalist jewellery with a modern aesthetic",
    "Perfect balance of style, comfort, and practicality",
    "Lightweight designs suitable for all-day wear",
    "Essential accessories for a clean and refined everyday look",
    "Everyday jewellery is more than just an accessory—it's a style essential that brings effortless elegance and confidence to your daily life.",

    // 121-127 Trending Styles
    "Trending Styles in Everyday Jewellery",
    "Stay updated with the latest trends in <b>everyday jewellery</b> that combine minimalism with modern fashion. From layered chains to stackable rings and tiny statement studs, these styles are perfect for elevating your daily look without overdoing it. Trend-inspired yet timeless, these designs allow you to express your personality while keeping your style effortless and refined.",
    "<b>Popular Trends:</b>",
    "Layered necklaces for a modern look",
    "Stackable rings for personalized styling",
    "Minimal hoop and stud earrings",
    "Sleek and delicate bracelets",

    // 128-138 Dainty Jewellery
    "Dainty Jewellery – Delicate & Elegant Everyday Style",
    "<b>Dainty jewellery</b> is the perfect expression of subtle elegance, designed for those who appreciate refined, lightweight, and minimalist accessories. Known for its delicate craftsmanship and understated charm, dainty jewellery enhances your natural look without appearing bold or overpowering, making it ideal for everyday wear.",
    "These pieces are thoughtfully created with fine details, slim profiles, and soft finishes that provide both comfort and sophistication. Whether it's a thin chain, petite pendant, minimal ring, or tiny stud earrings, dainty jewellery offers a graceful touch that effortlessly complements your personal style.",
    "One of the biggest advantages of dainty jewellery is its versatility. You can wear a single piece for a clean, minimal aesthetic or layer multiple items to create a more contemporary and fashion-forward look. Its adaptability makes it suitable for a wide range of settings—from casual outings to office wear—allowing you to maintain a polished appearance with ease.",
    "In addition to its style appeal, <b>dainty jewellery</b> is designed for convenience. Lightweight and comfortable, it can be worn throughout the day without discomfort, making it a practical choice for modern lifestyles.",
    "<b>Key Highlights:</b>",
    "Delicate, lightweight designs for a refined look",
    "Perfect for layering, stacking, and styling versatility",
    "Subtle yet elegant aesthetic suitable for all occasions",
    "Ideal for everyday wear, from casual to professional settings",
    "Dainty jewellery is more than just an accessory—it's a timeless style choice that brings effortless elegance and sophistication to your everyday fashion.",

    // 139-145 How to Style Everyday Jewellery
    "How to Style Everyday Jewellery",
    "Styling everyday jewellery is all about balance and simplicity. Choose pieces that complement your outfit rather than overpower it. For a minimal look, wear a single delicate chain or stud earrings. For a more fashionable approach, layer multiple pieces while keeping the overall look clean and coordinated.",
    "<b>Styling Tips:</b>",
    "Mix and match delicate pieces for layering",
    "Stick to one focal point for a balanced look",
    "Pair gold tones with warm outfits and silver with cool tones",
    "Keep it simple for professional settings",

    // 146-156 Everyday Fine Jewellery
    "Everyday Fine Jewellery – Timeless Pieces for Daily Wear",
    "<b>Everyday fine jewellery</b> is the perfect blend of premium craftsmanship, refined design, and practical wearability. Created for those who appreciate subtle luxury, these pieces offer an elegant yet understated look that fits effortlessly into your daily routine. Unlike heavy or occasion-specific jewellery, everyday fine jewellery focuses on simplicity, comfort, and long-term value.",
    "Designed with high-quality materials and expert finishing, these pieces are built to last while maintaining their shine and sophistication over time. From delicate chains and classic studs to minimal rings and elegant pendants, each item is crafted to deliver both durability and style without compromising on comfort.",
    "One of the defining features of <b>everyday fine jewellery</b> is its timeless appeal. With clean lines and minimal aesthetics, these designs remain relevant across changing trends, making them a smart investment for long-term use. Whether you're dressing for work, casual outings, or special moments, these versatile pieces adapt effortlessly to every occasion.",
    "Comfort is equally important, as these lightweight designs are made for extended wear. You can rely on them to complement your look throughout the day while maintaining a polished and graceful appearance.",
    "<b>Key Highlights:</b>",
    "High-quality craftsmanship with premium finishing",
    "Durable designs with long-lasting shine",
    "Minimal, elegant styles with timeless appeal",
    "Perfect for daily wear and versatile styling across occasions",
    "Everyday fine jewellery is more than just an accessory—it's a dependable expression of style, offering lasting elegance, comfort, and sophistication for modern living.",

    // 157-159 Perfect Jewellery for Work & Office Wear (heading, intro, list label)
    "Perfect Jewellery for Work & Office Wear",
    "Office jewellery should be subtle, elegant, and distraction-free. <b>Everyday jewellery</b> is ideal for professional environments as it enhances your appearance without being too flashy.",
    "<b>Best Picks for Office Wear:</b>",
    // 160-163 link labels (rendered as styled links, see OFFICE_LINKS below)
    "Small stud earrings",
    "Thin chains with simple pendants",
    "Minimal rings",
    "Lightweight bracelets",

    // 164-170 Jewellery Care Tips
    "Jewellery Care Tips for Daily Wear",
    "Taking proper care of your <b>everyday jewellery</b> helps maintain its shine and longevity. Even though these pieces are designed for regular use, simple care practices can keep them looking new for years.",
    "<b>Care Tips:</b>",
    "Store jewellery in a dry, soft pouch",
    "Avoid contact with perfumes and chemicals",
    "Clean regularly with a soft cloth",
    "Remove before heavy activities",

    // 171-177 Gifting
    "Gifting Everyday Jewellery – A Perfect Choice",
    "<b>Everyday jewellery</b> makes an excellent gift due to its versatility and practicality. Whether for birthdays, anniversaries, or special occasions, these pieces are thoughtful and easy to wear.",
    "<b>Why It's a Great Gift:</b>",
    "Suitable for all age groups",
    "Easy to style with any outfit",
    "Timeless and long-lasting",
    "Ideal for daily use",

    // 178-184 Who Should Buy
    "Who Should Buy Everyday Jewellery?",
    "<b>Everyday jewellery</b> is designed for anyone who values comfort, simplicity, and style in their daily life.",
    "<b>Ideal For:</b>",
    "Students looking for simple accessories",
    "Working professionals needing polished looks",
    "Travelers who prefer lightweight jewellery",
    "Minimalist fashion lovers",

    // 185-191 Materials Used
    "Materials Used in Everyday Jewellery",
    "Understanding materials helps customers make informed choices. <b>Everyday jewellery</b> is crafted using high-quality metals and finishes that ensure durability and comfort.",
    "<b>Common Materials:</b>",
    "Gold and gold-plated metals",
    "Sterling silver",
    "Stainless steel",
    "Semi-precious stones",

    // 192-198 Benefits of Lightweight Jewellery
    "Benefits of Lightweight Jewellery",
    "Lightweight jewellery is not just about comfort—it enhances your overall experience of wearing accessories daily.",
    "<b>Key Benefits:</b>",
    "Comfortable for long hours",
    "Easy to carry while traveling",
    "Reduces strain on ears and neck",
    "Ideal for daily routines",

    // 199-205 Why Minimal Jewellery is Trending
    "Why Minimal Jewellery is Trending",
    "<b>Minimal jewellery</b> has become a major fashion trend due to its clean, elegant, and versatile appeal. It aligns perfectly with modern lifestyles that value simplicity and functionality.",
    "<b>Reasons for Popularity:</b>",
    "Easy to style",
    "Works for multiple occasions",
    "Timeless and elegant",
    "Complements all fashion styles",

    // 206-212 Build Your Everyday Jewellery Collection
    "Build Your Everyday Jewellery Collection",
    "Creating a capsule jewellery collection helps simplify your styling routine while ensuring you always look put together.",
    "<b>Must-Have Pieces:</b>",
    "A pair of classic studs",
    "A delicate chain necklace",
    "A minimal ring",
    "A lightweight bracelet",

    // 213-221 Why Choose Our Everyday Jewellery Collection
    "Why Choose Our Everyday Jewellery Collection",
    "Our <b>everyday jewellery collection</b> is designed to meet the needs of modern lifestyles where comfort, style, and durability are equally important. Each piece is carefully crafted to ensure a perfect balance between aesthetics and functionality.",
    "We focus on delivering jewellery that you can wear every day with confidence, without worrying about discomfort or maintenance. From minimal designs to slightly detailed styles, our collection offers something for every preference.",
    "<b>We Offer:</b>",
    "High-quality everyday craftsmanship",
    "Lightweight and comfortable designs",
    "Trend-inspired yet timeless styles",
    "Versatile jewellery for all occasions",
    "Durable pieces with long-lasting appeal",

    // 222-229 Shop Everyday Jewellery Online
    "Shop Everyday Jewellery Online – Simple, Fast & Secure",
    "Shopping for daily wear <a href='/product-category/jewellery/' style='color: #007bff; text-decoration: underline;'>minimalist jewellery</a> online provides a convenient and efficient way to explore a wide range of minimal and stylish designs. Our platform ensures a smooth browsing experience, allowing you to find the perfect jewellery for your daily needs.",
    "With secure payment options and easy navigation, you can shop confidently from anywhere and enjoy a hassle-free experience.",
    "<b>Benefits:</b>",
    "Quick and easy browsing",
    "Wide variety of everyday jewellery",
    "Secure checkout process",
    "Ideal for personal styling and gifting",

    // ── Utilities (230-235) ──
    "SALE", "Add to Wishlist", "Quick View", "Add to Cart", "Price on request", "in",
];

// Office wear list has links — kept as static hrefs alongside translated labels (idx 160-163)
const OFFICE_LINKS = [
    { idx: 160, href: '/product-category/earrings/' },
    { idx: 161, href: '/product-category/pendants/' },
    { idx: 162, href: '/product-category/rings/' },
    { idx: 163, href: '/product-category/bracelets/' },
];

const FOR_TODAY_CONTENT_STRUCTURE = [
    { type: 'h2', idx: 73 }, { type: 'p', idx: 74 }, { type: 'p', idx: 75 }, { type: 'p', idx: 76 }, { type: 'p', idx: 77 },

    { type: 'h3', idx: 78 }, { type: 'p', idx: 79 }, { type: 'p', idx: 80 }, { type: 'p', idx: 81 }, { type: 'p', idx: 82 },
    { type: 'p', idx: 83 }, { type: 'ul', items: [84, 85, 86, 87] }, { type: 'p', idx: 88 },

    { type: 'h3', idx: 89 }, { type: 'p', idx: 90 }, { type: 'p', idx: 91 }, { type: 'p', idx: 92 }, { type: 'p', idx: 93 },
    { type: 'p', idx: 94 }, { type: 'ul', items: [95, 96, 97, 98] }, { type: 'p', idx: 99 },

    { type: 'h3', idx: 100 }, { type: 'p', idx: 101 }, { type: 'p', idx: 102 }, { type: 'p', idx: 103 }, { type: 'p', idx: 104 },
    { type: 'p', idx: 105 }, { type: 'ul', items: [106, 107, 108, 109] }, { type: 'p', idx: 110 },

    { type: 'h3', idx: 111 }, { type: 'p', idx: 112 }, { type: 'p', idx: 113 }, { type: 'p', idx: 114 },
    { type: 'p', idx: 115 }, { type: 'ul', items: [116, 117, 118, 119] }, { type: 'p', idx: 120 },

    { type: 'h3', idx: 121 }, { type: 'p', idx: 122 }, { type: 'p', idx: 123 }, { type: 'ul', items: [124, 125, 126, 127] },

    { type: 'h3', idx: 128 }, { type: 'p', idx: 129 }, { type: 'p', idx: 130 }, { type: 'p', idx: 131 }, { type: 'p', idx: 132 },
    { type: 'p', idx: 133 }, { type: 'ul', items: [134, 135, 136, 137] }, { type: 'p', idx: 138 },

    { type: 'h3', idx: 139 }, { type: 'p', idx: 140 }, { type: 'p', idx: 141 }, { type: 'ul', items: [142, 143, 144, 145] },

    { type: 'h3', idx: 146 }, { type: 'p', idx: 147 }, { type: 'p', idx: 148 }, { type: 'p', idx: 149 }, { type: 'p', idx: 150 },
    { type: 'p', idx: 151 }, { type: 'ul', items: [152, 153, 154, 155] }, { type: 'p', idx: 156 },

    { type: 'h3', idx: 157 }, { type: 'p', idx: 158 }, { type: 'p', idx: 159 }, { type: 'ul-links', links: OFFICE_LINKS },

    { type: 'h3', idx: 164 }, { type: 'p', idx: 165 }, { type: 'p', idx: 166 }, { type: 'ul', items: [167, 168, 169, 170] },

    { type: 'h3', idx: 171 }, { type: 'p', idx: 172 }, { type: 'p', idx: 173 }, { type: 'ul', items: [174, 175, 176, 177] },

    { type: 'h3', idx: 178 }, { type: 'p', idx: 179 }, { type: 'p', idx: 180 }, { type: 'ul', items: [181, 182, 183, 184] },

    { type: 'h3', idx: 185 }, { type: 'p', idx: 186 }, { type: 'p', idx: 187 }, { type: 'ul', items: [188, 189, 190, 191] },

    { type: 'h3', idx: 192 }, { type: 'p', idx: 193 }, { type: 'p', idx: 194 }, { type: 'ul', items: [195, 196, 197, 198] },

    { type: 'h3', idx: 199 }, { type: 'p', idx: 200 }, { type: 'p', idx: 201 }, { type: 'ul', items: [202, 203, 204, 205] },

    { type: 'h3', idx: 206 }, { type: 'p', idx: 207 }, { type: 'p', idx: 208 }, { type: 'ul', items: [209, 210, 211, 212] },

    { type: 'h3', idx: 213 }, { type: 'p', idx: 214 }, { type: 'p', idx: 215 }, { type: 'p', idx: 216 }, { type: 'ul', items: [217, 218, 219, 220, 221] },

    { type: 'h3', idx: 222 }, { type: 'p', idx: 223 }, { type: 'p', idx: 224 }, { type: 'p', idx: 225 }, { type: 'ul', items: [226, 227, 228, 229] },
];

const FAQ_COUNT = 20;
const TOP_OFFSET = 40;

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
function QuickViewModal({ product, currency, T, onClose, onAddToCart, wishlist, onToggleWishlist }) {
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const variant = getFirstVariant(product);
    const images = variant.images || [];
    const categoryUrl = categorySlugMap[product.category] || 'for-today-jewellery';

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
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '12px', right: '16px',
                        background: 'none', border: 'none', fontSize: '22px',
                        cursor: 'pointer', color: '#555', zIndex: 1, lineHeight: 1,
                    }}
                    aria-label="Close"
                >✕</button>

                {/* Images Left Side */}
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

                {/* Details Right Side */}
                <div style={{ flex: '1 1 280px', padding: '32px 24px 24px 16px', minWidth: '240px' }}>
                    {variant.isSale && (
                        <span style={{
                            background: '#1a1a1a', color: '#fff',
                            fontSize: '11px', letterSpacing: '1px',
                            padding: '3px 8px', borderRadius: '2px',
                            display: 'inline-block', marginBottom: '10px',
                        }}>
                            {T[230]}
                        </span>
                    )}
                    <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>
                        {product.category}
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
                                : T[234]}
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
                            {T[233]}
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
                                {T[231]}
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
function ProductCard({ p, wishlist, toggleWishlist, T, currency, onQuickView, onAddToCart }) {
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
    const categoryUrl = categorySlugMap[p.category] || 'for-today-jewellery';

    return (
        <Link
            href={`/product-category/${categoryUrl}/${p.slug}`}
            className="jw-card"
            onMouseEnter={startHover}
            onMouseLeave={stopHover}
        >
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">{T[230]}</span>}

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
                        title={T[231]}
                        aria-label={T[231]}
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
                        title={T[232]}
                        aria-label={T[232]}
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

                    <button
                        className="jw-action-btn jw-add-cart"
                        title={T[233]}
                        aria-label={T[233]}
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
                        <span className="jw-new-price jw-price-na">{T[234]}</span>
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
//  MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────
export default function ForToday() {
    const router = useRouter();

    const { translated: T, status: tStatus, countryCode } = useTranslation(UI_STRINGS);

    const [currency, setCurrency] = useState(CURRENCY_MAP.default);
    useEffect(() => {
        if (countryCode && CURRENCY_MAP[countryCode]) {
            setCurrency(CURRENCY_MAP[countryCode]);
        }
    }, [countryCode]);

    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("For Today");

    const [perPage, setPerPage] = useState(30);
    const [sort, setSort] = useState("default");

    //  Wishlist implementation properly set up 
    const { wishlistItems, addToWishlist, removeFromWishlist: removeFromWishlistCtx } = useWishlist();
    const wishlist = (wishlistItems || []).map(item => item._id || item);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [quickViewProduct, setQuickViewProduct] = useState(null);
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
        const urlSlug = categorySlugMap[categoryName] || 'for-today-jewellery';
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

    const toggleWishlist = useCallback((id, productData) => {
        if (wishlist.includes(id)) {
            removeFromWishlistCtx(id);
        } else {
            addToWishlist(productData || { _id: id });
        }
    }, [wishlist, addToWishlist, removeFromWishlistCtx]);

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

    const catIndexMap = {
        "Chosen": 18, "Earrings": 19, "For Today": 20, "Jewellery": 21,
        "Mens": 22, "New": 23, "Pendants": 24, "Rings": 25, "Womens": 26,
    };

    const translatedCategories = categories.map((c) => ({
        ...c,
        displayName: catIndexMap[c.name] !== undefined ? T[catIndexMap[c.name]] : c.name,
    }));

    return (
        <div className="jw-page">

            {tStatus === "loading" && (
                <div className="translation-loading-bar" aria-hidden="true" />
            )}

            <Toast message={toast.message} visible={toast.visible} />

            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    currency={currency}
                    T={T}
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
                {T[0]}
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

                            <div className="jw-filter-block">
                                <button
                                    className="jw-filter-heading"
                                    onClick={() => setCatOpen(!catOpen)}
                                    aria-expanded={catOpen}
                                >
                                    <span>{T[1]}</span>
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
                                                    <span className="jw-cat-name">{c.displayName}</span>
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

                    <h1 className="jw-title">{T[3]}</h1>

                    <div className="jw-toolbar">
                        <span className="jw-results-count">
                            {loading
                                ? T[4]
                                : `${T[5]} ${displayed.length} ${T[6]} ${filtered.length} ${T[7]}`}
                        </span>
                        <div className="jw-toolbar-right">
                            <div className="jw-per-page">
                                <span className="jw-per-label">{T[8]}</span>
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
                                    <option value="default">{T[9]}</option>
                                    <option value="price-asc">{T[10]}</option>
                                    <option value="price-desc">{T[11]}</option>
                                    <option value="newest">{T[12]}</option>
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

                    {error && (
                        <div className="jw-error">
                            <span>⚠️ {error}</span>
                            <button onClick={() => setActiveCategory(activeCategory)}>{T[15]}</button>
                        </div>
                    )}

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
                                    T={T}
                                    currency={currency}
                                    onQuickView={openQuickView}
                                    onAddToCart={handleAddToCart}
                                />
                            ))
                        ) : (
                            <div className="jw-empty">
                                <p>{T[13]}{activeCategory ? ` ${T[235]} "${activeCategory}"` : ''}.</p>
                                <p style={{ fontSize: '13px', marginTop: '8px', color: '#aaa' }}>
                                    {T[14]}
                                </p>
                            </div>
                        )}
                    </div>

                </main>
            </div>
            <Reviews />

            {/* ── Bottom Accordions ── */}
                    <div className="jw-bottom-accordions">

                        <AccordionItem title={T[16]}>
                            <div className="jw-accordion-text">
                                {FOR_TODAY_CONTENT_STRUCTURE.map((item, i) => {
                                    if (item.type === 'h2') {
                                        return <h2 key={i} className="jw-accordion-heading" dangerouslySetInnerHTML={{ __html: T[item.idx] }} />;
                                    }
                                    if (item.type === 'h3') {
                                        return <h3 key={i} className="jw-accordion-heading" style={{ marginTop: '20px', fontSize: '18px' }} dangerouslySetInnerHTML={{ __html: T[item.idx] }} />;
                                    }
                                    if (item.type === 'p') {
                                        return <p key={i} dangerouslySetInnerHTML={{ __html: T[item.idx] }} />;
                                    }
                                    if (item.type === 'ul') {
                                        return (
                                            <ul key={i} style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                                                {item.items.map((liIdx, j) => (
                                                    <li key={j} dangerouslySetInnerHTML={{ __html: T[liIdx] }} />
                                                ))}
                                            </ul>
                                        );
                                    }
                                    if (item.type === 'ul-links') {
                                        return (
                                            <ul key={i} style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                                                {item.links.map((lnk, j) => (
                                                    <li key={j}>
                                                        <Link
                                                            href={lnk.href}
                                                            style={{ color: '#007bff', textDecoration: 'underline' }}
                                                        >
                                                            {T[lnk.idx]}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </AccordionItem>

                        <AccordionItem title={T[17]}>
                            <div className="jw-faq-list">
                                {Array.from({ length: FAQ_COUNT }, (_, i) => (
                                    <div key={i} className="jw-faq-item">
                                        <p className="jw-faq-q">{i + 1}. {T[33 + i]}</p>
                                        <p className="jw-faq-a">{T[53 + i]}</p>
                                    </div>
                                ))}
                            </div>
                        </AccordionItem>

                    </div>
        </div>
    );
}