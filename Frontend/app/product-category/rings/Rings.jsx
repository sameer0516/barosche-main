'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Rings.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Reviews from '../../../components/Home/Reviews/Reviews';
import { useWishlist } from '../../context/WishlistContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

// ─────────────────────────────────────────────────────────
//  CURRENCY CONFIG — same as Jewellery.js
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
//  TRANSLATION HOOK — extended to also return countryCode
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
                console.error("Rings translation error:", err.message);
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
//  73-227 : Main content (headings / paragraphs / list items)
//  228-233: Utilities (SALE, wishlist, quick view, add to cart, price na, "in")
// ─────────────────────────────────────────────────────────
const UI_STRINGS = [
    // 0-17
    "Filters", "Product Categories", "Price",
    "Rings for Men & Women Online – Elegant Everyday & Statement Designs",
    "Loading...", "Showing", "of", "results", "Show",
    "Default sorting", "Price: Low to High", "Price: High to Low", "Newest",
    "No products found", "Check browser console (F12) for errors.", "Retry",
    "Rings", "Frequently Asked Questions",
    // 18-26 categories
    "Chosen", "Earrings", "For Today", "Jewellery", "Mens", "New", "Pendants", "Rings", "Womens",
    // 27-32 price ranges
    "€1–€500", "€500–€1000", "€1000–€2000", "€2000–€5000", "€5000–€10000", "€10000+",

    // ── FAQ Questions (33-52) ──
    "What types of rings are available online?",
    "Are gold rings suitable for daily wear?",
    "What is the difference between a diamond ring and a gemstone ring?",
    "Are silver rings good for everyday use?",
    "Can men wear rings daily?",
    "What are statement rings?",
    "Are rings for women available in minimal designs?",
    "How do I choose the right ring size online?",
    "Can I wear multiple rings at the same time?",
    "Are diamond rings only for special occasions?",
    "Which ring material is best for long-term use?",
    "Are statement rings suitable for casual outfits?",
    "What are stackable rings?",
    "How do I maintain the shine of my rings?",
    "Are rings a good gift option?",
    "Can I mix gold and silver rings together?",
    "Are lightweight rings durable?",
    "What are the latest trends in rings?",
    "Are unisex rings available?",
    "Why should I buy rings online?",

    // ── FAQ Answers (53-72) ──
    "You can find a wide range including gold rings, diamond rings, silver rings, statement rings, and everyday minimal rings.",
    "Yes, many gold rings are designed to be lightweight and comfortable for everyday use.",
    "A diamond ring features diamonds, while gemstone rings include stones like ruby, sapphire, or emerald.",
    "Yes, silver rings and sterling silver rings are durable, stylish, and ideal for daily wear.",
    "Yes, rings for men are designed for comfort and durability, making them suitable for everyday wear.",
    "Statement rings are bold, eye-catching designs meant to stand out and enhance your overall look.",
    "Yes, rings for women include both minimal and statement styles for different preferences.",
    "Measure your finger or use a ring size guide to ensure a comfortable fit.",
    "Yes, stacking rings is a popular trend for a stylish and personalized look.",
    "No, many modern diamond rings are designed for both daily wear and special occasions.",
    "Gold and sterling silver rings are popular for their durability and long-lasting appeal.",
    "Yes, statement rings can elevate casual outfits when styled correctly.",
    "Stackable rings are designed to be worn together in layers for a trendy appearance.",
    "Keep them away from water and chemicals, and clean them with a soft cloth regularly.",
    "Yes, rings are timeless gifts perfect for birthdays, anniversaries, and special moments.",
    "Yes, mixing metals is a modern trend and creates a unique style.",
    "Yes, well-crafted lightweight rings are designed for both comfort and durability.",
    "Popular trends include minimal rings, geometric designs, and stackable rings.",
    "Yes, many ring designs are versatile and suitable for both men and women.",
    "Online shopping offers more variety, easy comparison, and convenient access to the latest designs.",

    // ════════════════════════════════════════════════════
    //  MAIN CONTENT (73 onward)
    // ════════════════════════════════════════════════════

    // 73-78
    "Rings for Men & Women – Timeless Style, Modern Elegance & Everyday Comfort",
    "Discover an exclusive collection of <b>rings for men and women online</b>, thoughtfully designed to combine timeless elegance with modern fashion trends. Whether you are searching for a classic <b>gold ring</b>, a sparkling <b>diamond ring</b>, sleek <b>silver rings</b>, or bold <b>statement rings</b>, this collection offers versatile styles to suit every personality, occasion, and lifestyle.",
    "Rings are more than just accessories—they are a powerful expression of identity, emotion, and personal style. From minimal designs that add subtle sophistication to your everyday look to bold and expressive rings that make a statement, each piece is crafted to enhance your overall appearance effortlessly.",
    "Designed with both aesthetics and comfort in mind, these rings are perfect for all-day wear. Lightweight construction, smooth finishing, and attention to detail ensure that every ring not only looks beautiful but also feels comfortable throughout the day. Whether you're dressing for work, a casual outing, or a special occasion, the right ring can instantly elevate your style.",
    "This collection also reflects the evolving trends of modern jewellery, where versatility plays a key role. Many designs are created to transition seamlessly between different outfits and occasions, making them a practical and stylish addition to your jewellery collection.",
    "Whether you prefer understated elegance or eye-catching designs, these rings offer the perfect balance of durability, comfort, and contemporary appeal—making them ideal for both personal use and meaningful gifting.",

    // 79-81
    "Explore a Wide Range of Rings Online",
    "Shopping for <a href='/product-category/rings/' style='color: #007bff; text-decoration: underline;'>rings online</a> gives you access to a diverse and ever-evolving collection of designs that cater to both classic elegance and modern fashion trends. Whether you prefer subtle, minimal styles for everyday wear or bold, fashion-forward designs that make a statement, this collection ensures you can find the perfect ring for every mood, outfit, and occasion.",
    "Online browsing also allows you to compare styles, explore new trends, and choose pieces that align with your personal taste—all from the comfort of your home. With detailed product insights and a wide variety of options, selecting the right ring becomes simple, convenient, and enjoyable.",

    // 82-94
    "1. Gold Rings – Classic & Timeless Appeal",
    "Gold rings continue to symbolize luxury, tradition, and sophistication. From sleek minimal bands to intricately detailed designs, a <b>gold ring</b> adds a touch of elegance to both everyday outfits and special occasions. Its timeless charm ensures it remains a staple in every jewellery collection.",
    "2. Diamond Rings – Elegant & Eye-Catching",
    "A <b>diamond ring</b> represents brilliance, beauty, and lasting elegance. Whether chosen for a celebration, a milestone, or personal styling, these rings bring a refined and luxurious feel that never goes out of style.",
    "3. Silver Rings – Modern & Versatile",
    "<b>Silver rings</b> and <b>sterling silver rings</b> offer a sleek and contemporary aesthetic that fits perfectly into modern lifestyles. Lightweight, durable, and easy to style, they are ideal for everyday wear and pair effortlessly with both casual and formal outfits.",
    "4. Statement Rings – Bold & Fashion-Forward",
    "<b>Statement rings</b> are designed for those who love to stand out. Featuring bold shapes, artistic designs, and intricate detailing, these rings instantly elevate your look and add a strong sense of personality and confidence.",
    "5. Rings for Men – Strong & Stylish Designs",
    "Explore a wide variety of <b>rings for men</b> crafted with bold, minimal, and rugged aesthetics. These designs focus on strength, simplicity, and individuality, making them perfect for both daily wear and occasion styling.",
    "6. Rings for Women – Elegant & Trendy Styles",
    "From delicate bands to eye-catching statement pieces, <b>rings for women</b> are designed to enhance elegance while keeping up with modern fashion trends. These versatile styles can be worn daily or styled for special occasions, offering the perfect blend of beauty and practicality.",
    "With such a wide selection available, finding the perfect ring becomes effortless—whether you're building your personal collection or searching for a meaningful gift.",

    // 95-107
    "Trending Ring Styles You Should Explore",
    "Stay ahead in fashion with the latest <b>trending ring styles</b> that perfectly combine creativity, elegance, and everyday wearability. Modern rings are no longer just accessories—they are style statements that reflect personality, confidence, and individuality. Whether you prefer minimal elegance or bold artistic designs, there's a style for everyone in today's jewellery trends.",
    "1. Minimal Rings – Clean & Timeless Elegance",
    "Minimal rings feature simple, clean, and refined designs that are perfect for everyday wear. Their understated beauty makes them ideal for those who prefer a subtle yet sophisticated look that complements any outfit effortlessly.",
    "2. Geometric Rings – Modern & Structured Designs",
    "Geometric rings bring a contemporary edge to your jewellery collection with sharp lines, abstract shapes, and modern patterns. These designs are perfect for those who love structured, artistic, and fashion-forward accessories.",
    "3. Stackable Rings – Trendy Layered Styling",
    "Stackable rings allow you to create your own personalized look by layering multiple rings together. Mix and match different styles, metals, or textures to achieve a trendy, dynamic, and fashionable appearance that stands out.",
    "4. Textured & Artistic Rings – Unique Statement Appeal",
    "Textured and artistic rings feature creative finishes, intricate detailing, and handcrafted-inspired designs. These rings are perfect for adding depth, character, and uniqueness to your overall style, making them true conversation starters.",
    "5. Unisex Rings – Versatile & Inclusive Fashion",
    "Unisex rings are designed to suit everyone, regardless of gender. With their versatile and balanced aesthetics, these rings offer a perfect blend of simplicity and style, making them ideal for shared fashion trends and everyday wear.",
    "These trending styles ensure that your ring collection stays modern, versatile, and fashion-forward—perfect for both daily styling and special occasions.",

    // 108-112
    "Rings for Everyday Wear – Comfort Meets Durability",
    "<b>Daily wear rings</b> are thoughtfully designed to deliver the perfect balance of comfort, durability, and effortless style. With lightweight construction, smooth edges, and refined finishing, these rings ensure all-day comfort without causing irritation or heaviness, making them ideal for continuous and long-term use.",
    "Crafted using durable materials and precision detailing, everyday rings are built to withstand the demands of daily routines while maintaining their shine, structure, and elegance over time. Their minimal yet stylish designs make them a reliable choice for individuals who prefer practical fashion without compromising on aesthetics.",
    "These rings are versatile enough to suit every lifestyle—whether you are at work, traveling, attending meetings, or enjoying casual outings. Their simple yet elegant appeal allows them to blend seamlessly with both western and traditional outfits, helping you maintain a polished and consistent look throughout the day.",
    "Designed for modern living, everyday rings eliminate the need for frequent accessory changes while still ensuring you always look effortlessly stylish and put together.",

    // 113-117
    "Statement Rings – Designed to Make an Impression",
    "For those who love bold, expressive, and fashion-forward jewellery, <b>statement rings</b> are the perfect choice. Designed with striking shapes, intricate craftsmanship, and eye-catching detailing, these rings instantly elevate your overall look and bring a powerful sense of confidence and individuality to any outfit.",
    "Statement rings are created to stand out, making them ideal for special occasions, festive events, parties, or moments when you want your jewellery to reflect your personality. Their bold and artistic designs ensure that they naturally draw attention without needing additional accessories.",
    "Despite their standout appeal, statement rings can be styled effortlessly with <b>minimal jewellery</b> to maintain a balanced and elegant appearance. Pairing them with simple earrings or subtle chains allows the ring to remain the focal point while keeping your overall look refined and sophisticated.",
    "Whether matched with casual outfits for a bold fashion touch or worn with elegant ensembles for special occasions, statement rings add depth, character, and personality to your style. They are more than just accessories—they are powerful expressions of confidence, creativity, and individuality that ensure you always leave a lasting impression.",

    // 118-126
    "Ring Size Guide – Find Your Perfect Fit",
    "Choosing the <b>correct ring size</b> is essential for comfort and long-term wear. A well-fitted ring should sit securely on your finger without feeling too tight or too loose.",
    "To ensure the perfect fit, it is recommended to measure your finger at the end of the day when it is at its largest. You can also use a ring you already own and match it with a standard sizing chart.",
    "<b>Key Tips for Accurate Sizing:</b>",
    "Measure your finger in warm conditions for better accuracy",
    "Avoid measuring when fingers are cold",
    "Consider wider bands, which may require a slightly larger size",
    "Always double-check size before placing an order",
    "A perfectly sized ring enhances both comfort and style, ensuring effortless everyday wear.",

    // 127-134
    "Materials Used in Rings – Quality You Can Trust",
    "Our <b>rings</b> are crafted using carefully selected materials that ensure durability, comfort, and long-lasting shine. Each material offers a unique look and feel, allowing you to choose based on your personal style.",
    "<b>Popular Materials Include:</b>",
    "Gold-plated alloys for a luxurious appearance",
    "Sterling silver for modern and minimal elegance",
    "Stainless steel for strength and durability",
    "Gemstone accents for added color and personality",
    "Every material is chosen to balance style, strength, and everyday usability.",

    // 135-142
    "Everyday Ring Care Guide",
    "Proper care helps maintain the shine and beauty of your rings for years. With simple habits, you can keep your jewellery looking as good as new.",
    "<b>Care Instructions:</b>",
    "Avoid contact with water, perfumes, and chemicals",
    "Store rings in a dry jewellery box or soft pouch",
    "Clean gently using a soft, lint-free cloth",
    "Remove rings during heavy physical activities",
    "With minimal care, your rings will maintain their elegance and durability over time.",

    // 143-150
    "Ring Gifting Guide – Choose the Perfect Piece",
    "Rings make meaningful and versatile gifts for all occasions. Selecting the right design based on personality and preference makes the gift even more special.",
    "<b>Gift Suggestions:</b>",
    "Minimal rings for someone who loves simplicity",
    "Diamond or gemstone rings for special milestones",
    "Statement rings for fashion-forward personalities",
    "Silver rings for everyday wear lovers",
    "A thoughtfully chosen ring becomes a lasting symbol of emotion and connection.",

    // 151-158
    "Why Rings Are a Must-Have Jewellery Essential",
    "Rings are one of the most versatile jewellery pieces that can instantly elevate any outfit. Their ability to blend with both casual and formal styles makes them a wardrobe essential.",
    "<b>Reasons to Own Rings:</b>",
    "Suitable for all age groups and styles",
    "Can be worn daily without effort",
    "Enhances both simple and stylish outfits",
    "Works perfectly for layering and stacking",
    "Rings are not just accessories—they are everyday style essentials.",

    // 159-166
    "Sustainable & Responsible Jewellery Choice",
    "Modern jewellery is also about conscious fashion choices. Many ring designs today focus on responsible sourcing and long-lasting value, reducing the need for frequent replacements.",
    "<b>Sustainable Approach Includes:</b>",
    "Durable materials for long-term use",
    "Timeless designs that don't go out of trend",
    "Minimal waste production practices",
    "Focus on quality over quantity",
    "Choosing well-made rings supports a more thoughtful and sustainable lifestyle.",

    // 167-168
    "How to Choose the Perfect Ring Online",
    "Selecting the right <b>ring online</b> becomes simple and enjoyable when you focus on a few important factors. With so many styles available—from minimal everyday designs to bold statement pieces—making the right choice ensures your ring perfectly matches your personality, lifestyle, and fashion needs.",

    // 169-179
    "1. Understand Your Style",
    "Start by identifying your personal style. If you prefer subtle elegance, minimal rings are ideal for daily wear. For those who love bold fashion, statement or designer rings are a better choice for special occasions and standout looks.",
    "2. Choose the Right Material",
    "The material plays a key role in both appearance and durability. Gold rings offer timeless luxury, silver rings provide a modern and versatile look, while gemstone rings add color and individuality to your jewellery collection.",
    "3. Focus on Fit and Comfort",
    "A perfect ring should feel comfortable throughout the day. Always choose the correct ring size to ensure a secure yet comfortable fit that doesn't feel too tight or loose during regular wear.",
    "4. Consider Versatility",
    "Opt for designs that can easily match multiple outfits. Versatile rings allow you to style them with both casual and formal wear, giving you more value and flexibility from a single piece.",
    "5. Check Craftsmanship and Quality",
    "Pay attention to finishing, detailing, and build quality. Smooth edges, durable materials, and precise craftsmanship ensure your ring not only looks beautiful but also lasts longer with regular use.",
    "By keeping these factors in mind, you can confidently choose a ring online that enhances your style, fits your comfort, and suits every occasion effortlessly.",

    // 180-181
    "Styling Tips – Elevate Your Look with Rings",
    "Rings are one of the most versatile jewellery pieces, and the right styling can instantly elevate your overall appearance. Whether you prefer minimal elegance or bold fashion statements, thoughtful ring styling helps you create a look that feels modern, balanced, and uniquely yours.",

    // 182-190
    "1. Wear a Single Minimal Ring for Elegant Simplicity",
    "A single minimal ring can create a clean, refined, and effortless look. This style is perfect for everyday wear, office settings, or occasions where subtle elegance is preferred. It enhances your outfit without overpowering it.",
    "2. Stack Multiple Rings for a Trendy Look",
    "Stacking rings is a popular modern trend that allows you to mix and match different designs. Combining thin bands, textured styles, or gemstone rings creates a personalized and fashionable layered effect that reflects your personality.",
    "3. Pair Statement Rings with Simple Outfits",
    "Statement rings are bold by nature, so pairing them with simple or neutral outfits helps maintain balance. This ensures your ring becomes the focal point of your look while keeping your overall style elegant and well-composed.",
    "4. Mix Metals for a Contemporary Aesthetic",
    "Blending gold, silver, and rose tones creates a modern and stylish contrast. Mixing metals adds depth to your jewellery styling and gives your look a fresh, fashion-forward edge that stands out effortlessly.",
    "By experimenting with these styling ideas, you can easily transform your rings into powerful fashion statements that suit every occasion and mood.",

    // 191-201
    "Rings as a Meaningful Gift",
    "Rings have always been one of the most timeless and meaningful gifts, carrying deep emotional significance beyond their beauty. They symbolize love, commitment, connection, and cherished memories, making them a perfect choice for celebrating life's most important moments.",
    "A thoughtfully chosen ring becomes more than just a piece of jewellery—it turns into a lasting reminder of emotions, relationships, and special milestones shared between people. Whether simple or elaborate, every ring carries a story that stays close to the heart.",
    "Perfect for Every Special Occasion",
    "Rings make an ideal gift for a wide range of meaningful moments, including:",
    "Birthdays – A beautiful way to celebrate someone special",
    "Anniversaries – A symbol of love and lasting commitment",
    "Celebrations – Marking achievements and joyful occasions",
    "Milestones – Commemorating personal or professional success",
    "Romantic occasions – Expressing love, affection, and devotion",
    "From a sparkling <b>diamond ring</b> gifted for a memorable moment to a simple <b>minimal band</b> for everyday elegance, rings continue to hold timeless emotional value. Their ability to blend style with sentiment makes them one of the most cherished and unforgettable gifts across all generations.",

    // 202-205
    "Why Buy Rings Online?",
    "<b>Buying rings online</b> offers unmatched convenience, variety, and flexibility, making it easier than ever to find the perfect design that matches your style and needs. Instead of limited in-store options, online shopping opens the door to a wide and diverse jewellery collection available at your fingertips.",
    "One of the biggest advantages is the ability to explore multiple styles in one place—from minimal everyday rings to bold statement pieces, elegant diamond rings, and modern silver designs. This makes it simple to compare options, evaluate designs, and choose the perfect ring without any pressure.",
    "Online platforms also keep you updated with the latest trends, ensuring you always have access to modern, stylish, and fashion-forward collections. Whether you are shopping for yourself or selecting a meaningful gift, everything can be done easily from the comfort of your home, at any time.",

    // 206-208
    "Craftsmanship & Quality You Can Trust",
    "Every ring in the collection is crafted with precision, care, and attention to detail. High-quality finishing, durable materials, and thoughtful design ensure long-lasting beauty, comfort, and everyday usability.",
    "From elegant <b>sterling silver rings</b> to refined <b>gold-inspired designs</b>, each piece reflects a perfect balance of style, strength, and reliability. These rings are designed not only to enhance your look but also to maintain their charm and quality over time, making them a valuable addition to any jewellery collection.",

    // 209-215
    "Build Your Perfect Ring Collection",
    "A well-rounded collection includes:",
    "Minimal rings for everyday wear",
    "Statement rings for special occasions",
    "Gold rings for timeless elegance",
    "Silver rings for modern styling",
    "Having a mix of styles ensures you always have the right ring for every outfit and occasion.",

    // 216-219
    "Shop Rings for Men & Women Online with Confidence",
    "Enjoy a smooth and hassle-free shopping experience with a wide variety of <a href='/product-category/rings/' style='color: #007bff; text-decoration: underline;'>rings for men and women online</a>, thoughtfully designed to suit modern lifestyles and evolving fashion preferences. Whether you are purchasing a ring for yourself or searching for a meaningful gift, this collection makes it easy to find designs that perfectly match your style, comfort, and personality.",
    "From minimal everyday bands to bold statement pieces, each ring is crafted to offer the right balance of elegance, durability, and wearability. With versatile designs that complement both casual and formal looks, these rings are created to become a natural part of your daily style.",
    "Shopping online also gives you the freedom to explore the latest trends, compare different styles, and make confident choices—all from the comfort of your home.",

    // 220-227
    "Why Choose Our Rings Collection",
    "Our rings collection is carefully curated to deliver quality, style, and versatility in every piece, making it easier to <a href='/product-category/jewellery/' style='color: #007bff; text-decoration: underline;'>buy jewellery online</a> with confidence.",
    "Wide variety including <b>gold rings, diamond rings, and silver rings</b>",
    "Stylish designs for both <b>men and women</b>",
    "Lightweight and comfortable pieces for everyday wear",
    "Trend-driven yet timeless styles that stay fashionable long-term",
    "Perfect for both <b>daily wear and gifting purposes</b>",
    "With a strong focus on craftsmanship, comfort, and modern aesthetics, this collection ensures that every ring adds value to your personal style and becomes a meaningful part of your jewellery journey.",

    // ── Utilities (228-233) ──
    "SALE", "Add to Wishlist", "Quick View", "Add to Cart", "Price on request",
    "in",
];

const RINGS_CONTENT_STRUCTURE = [
    { type: 'h2', idx: 73 }, { type: 'p', idx: 74 }, { type: 'p', idx: 75 }, { type: 'p', idx: 76 }, { type: 'p', idx: 77 }, { type: 'p', idx: 78 },

    { type: 'h2', idx: 79 }, { type: 'p', idx: 80 }, { type: 'p', idx: 81 },

    { type: 'h3', idx: 82 }, { type: 'p', idx: 83 },
    { type: 'h3', idx: 84 }, { type: 'p', idx: 85 },
    { type: 'h3', idx: 86 }, { type: 'p', idx: 87 },
    { type: 'h3', idx: 88 }, { type: 'p', idx: 89 },
    { type: 'h3', idx: 90 }, { type: 'p', idx: 91 },
    { type: 'h3', idx: 92 }, { type: 'p', idx: 93 }, { type: 'p', idx: 94 },

    { type: 'h2', idx: 95 }, { type: 'p', idx: 96 },
    { type: 'h3', idx: 97 }, { type: 'p', idx: 98 },
    { type: 'h3', idx: 99 }, { type: 'p', idx: 100 },
    { type: 'h3', idx: 101 }, { type: 'p', idx: 102 },
    { type: 'h3', idx: 103 }, { type: 'p', idx: 104 },
    { type: 'h3', idx: 105 }, { type: 'p', idx: 106 }, { type: 'p', idx: 107 },

    { type: 'h2', idx: 108 }, { type: 'p', idx: 109 }, { type: 'p', idx: 110 }, { type: 'p', idx: 111 }, { type: 'p', idx: 112 },

    { type: 'h2', idx: 113 }, { type: 'p', idx: 114 }, { type: 'p', idx: 115 }, { type: 'p', idx: 116 }, { type: 'p', idx: 117 },

    { type: 'h2', idx: 118 }, { type: 'p', idx: 119 }, { type: 'p', idx: 120 },
    { type: 'p', idx: 121 }, { type: 'ul', items: [122, 123, 124, 125] }, { type: 'p', idx: 126 },

    { type: 'h2', idx: 127 }, { type: 'p', idx: 128 },
    { type: 'p', idx: 129 }, { type: 'ul', items: [130, 131, 132, 133] }, { type: 'p', idx: 134 },

    { type: 'h2', idx: 135 }, { type: 'p', idx: 136 },
    { type: 'p', idx: 137 }, { type: 'ul', items: [138, 139, 140, 141] }, { type: 'p', idx: 142 },

    { type: 'h2', idx: 143 }, { type: 'p', idx: 144 },
    { type: 'p', idx: 145 }, { type: 'ul', items: [146, 147, 148, 149] }, { type: 'p', idx: 150 },

    { type: 'h2', idx: 151 }, { type: 'p', idx: 152 },
    { type: 'p', idx: 153 }, { type: 'ul', items: [154, 155, 156, 157] }, { type: 'p', idx: 158 },

    { type: 'h2', idx: 159 }, { type: 'p', idx: 160 },
    { type: 'p', idx: 161 }, { type: 'ul', items: [162, 163, 164, 165] }, { type: 'p', idx: 166 },

    { type: 'h2', idx: 167 }, { type: 'p', idx: 168 },
    { type: 'h3', idx: 169 }, { type: 'p', idx: 170 },
    { type: 'h3', idx: 171 }, { type: 'p', idx: 172 },
    { type: 'h3', idx: 173 }, { type: 'p', idx: 174 },
    { type: 'h3', idx: 175 }, { type: 'p', idx: 176 },
    { type: 'h3', idx: 177 }, { type: 'p', idx: 178 }, { type: 'p', idx: 179 },

    { type: 'h2', idx: 180 }, { type: 'p', idx: 181 },
    { type: 'h3', idx: 182 }, { type: 'p', idx: 183 },
    { type: 'h3', idx: 184 }, { type: 'p', idx: 185 },
    { type: 'h3', idx: 186 }, { type: 'p', idx: 187 },
    { type: 'h3', idx: 188 }, { type: 'p', idx: 189 }, { type: 'p', idx: 190 },

    { type: 'h2', idx: 191 }, { type: 'p', idx: 192 }, { type: 'p', idx: 193 },
    { type: 'h3', idx: 194 }, { type: 'p', idx: 195 },
    { type: 'ul', items: [196, 197, 198, 199, 200] }, { type: 'p', idx: 201 },

    { type: 'h2', idx: 202 }, { type: 'p', idx: 203 }, { type: 'p', idx: 204 }, { type: 'p', idx: 205 },

    { type: 'h2', idx: 206 }, { type: 'p', idx: 207 }, { type: 'p', idx: 208 },

    { type: 'h2', idx: 209 }, { type: 'p', idx: 210 },
    { type: 'ul', items: [211, 212, 213, 214] }, { type: 'p', idx: 215 },

    { type: 'h2', idx: 216 }, { type: 'p', idx: 217 }, { type: 'p', idx: 218 }, { type: 'p', idx: 219 },

    { type: 'h2', idx: 220 }, { type: 'p', idx: 221 },
    { type: 'ul', items: [222, 223, 224, 225, 226] }, { type: 'p', idx: 227 },
];

const FAQ_COUNT = 20;
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
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    const categoryUrl = categorySlugMap[product.category] || 'rings';

    // ESC key se close
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
                background: 'rgba(0, 0, 0, 0.34)',
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
                    {/* Thumbnail strip */}
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
                            {T[228]}
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
                                : T[232]}
                        </span>
                    </div>

                    {/* Description if available */}
                    {product.description && (
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                            {product.description}
                        </p>
                    )}

                    {/* Quantity selector */}
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

                    {/* Action Buttons */}
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
                            {T[231]}
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
                                {T[229]}
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

    const imgSrc =
        images.length > 0
            ? `${API_BASE}${images[currentImg]}`
            : '/placeholder.jpg';

    const oldPrice = variant.oldPrice;
    const newPrice = variant.newPrice;
    const isSale = variant.isSale;

    const categoryUrl = categorySlugMap[p.category] || 'rings';

    return (
        <Link
            href={`/product-category/${categoryUrl}/${p.slug}`}
            className="jw-card"
            onMouseEnter={startHover}
            onMouseLeave={stopHover}
        >
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">{T[228]}</span>}

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
                        title={T[229]}
                        aria-label={T[229]}
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
                        title={T[230]}
                        aria-label={T[230]}
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
                        title={T[231]}
                        aria-label={T[231]}
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
                        <span className="jw-new-price jw-price-na">{T[232]}</span>
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
//  MAIN RINGS PAGE
// ─────────────────────────────────────────────────────────
export default function Rings() {
    const router = useRouter();

    // ── Translation + country detection ──
    const { translated: T, status: tStatus, countryCode } = useTranslation(UI_STRINGS);

    // ── Currency — set once countryCode arrives from hook ──
    const [currency, setCurrency] = useState(CURRENCY_MAP.default);
    useEffect(() => {
        if (countryCode && CURRENCY_MAP[countryCode]) {
            setCurrency(CURRENCY_MAP[countryCode]);
        }
    }, [countryCode]);

    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Rings");

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

    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        const urlSlug = categorySlugMap[categoryName] || 'rings';
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

    // ── Add to Cart — WishlistPage jaisa custom event pattern ──
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

            {/* ── Toast ── */}
            <Toast message={toast.message} visible={toast.visible} />

            {/* ── Quick View Modal ── */}
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

                            {/* ── Categories ── */}
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

                    {/* ── Toolbar ── */}
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

                    {/* ── Error ── */}
                    {error && (
                        <div className="jw-error">
                            <span>⚠️ {error}</span>
                            <button onClick={() => setActiveCategory(activeCategory)}>{T[15]}</button>
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
                                    T={T}
                                    currency={currency}
                                    onQuickView={openQuickView}
                                    onAddToCart={handleAddToCart}
                                />
                            ))
                        ) : (
                            <div className="jw-empty">
                                <p>{T[13]}{activeCategory ? ` ${T[233]} "${activeCategory}"` : ''}.</p>
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
                        {RINGS_CONTENT_STRUCTURE.map((item, i) => {
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