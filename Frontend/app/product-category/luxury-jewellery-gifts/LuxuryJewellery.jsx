'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './luxuryJewellery.css';
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
    US: { code: "USD", symbol: "$", rate: 1.14 },
    GB: { code: "GBP", symbol: "£", rate: 0.86 },
    IN: { code: "INR", symbol: "₹", rate: 108.9 },
    AE: { code: "AED", symbol: "AED", rate: 4.20 },
    AU: { code: "AUD", symbol: "A$", rate: 1.66 },
    CA: { code: "CAD", symbol: "C$", rate: 1.62 },
    SG: { code: "SGD", symbol: "S$", rate: 1.48 },
    JP: { code: "JPY", symbol: "¥", rate: 184.6 },
    CH: { code: "CHF", symbol: "CHF", rate: 0.93 },
    default: { code: "EUR", symbol: "€", rate: 1 },
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
    fashionJewellery: "Luxury Jewellery Gifts",
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
    pageTitle: "Luxury Jewellery Gifts for Her – Elegant & Timeless Style ",
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

const DEFAULT_PRICES = [
    { label: "€1–€500", min: 1, max: 500 },
    { label: "€500–€1000", min: 500, max: 1000 },
    { label: "€1000–€2000", min: 1000, max: 2000 },
    { label: "€2000–€5000", min: 2000, max: 5000 },
    { label: "€5000–€10000", min: 5000, max: 10000 },
    { label: "€10000+", min: 10000, max: 999999 },
];

const flattenCategories = (cats) => cats.map((c) => c.name);

const rebuildCategories = (originalCats, translatedNames) =>
    originalCats.map((c, i) => ({ ...c, translatedName: translatedNames[i] }));

// ─────────────────────────────────────────────────────────
//  FAQ DATA — Luxury Jewellery Gifts
// ─────────────────────────────────────────────────────────
const faqData = [
    { q: "Why is luxury jewellery a good gift choice?", a: "Luxury jewellery is a meaningful gift because it combines elegance, emotional value, and timeless beauty. It becomes more than an accessory—it becomes a memorable keepsake that can be cherished for years." },
    { q: "What makes luxury jewellery different from regular jewellery?", a: "Luxury jewellery stands out because of its refined designs, premium craftsmanship, attention to detail, and lasting appeal. It focuses on quality, comfort, and timeless elegance." },
    { q: "What are the best luxury gifts for her?", a: "Some of the best luxury gifts for her include elegant rings, premium earrings, sophisticated bracelets, and timeless pendants that match her personal style." },
    { q: "Is luxury jewellery suitable for everyday wear?", a: "Yes, modern luxury jewellery is designed for both everyday wear and special occasions. Minimalist and lightweight designs offer elegance while remaining comfortable for daily use." },
    { q: "What type of jewellery makes the best luxury gift?", a: "The best luxury jewellery gift depends on her style and preferences. Rings, earrings, bracelets, and pendants are popular choices because they are versatile and meaningful." },
    { q: "Are luxury jewellery gifts suitable for birthdays?", a: "Yes, luxury jewellery makes a thoughtful birthday gift because it adds a personal touch and creates a lasting memory of the special occasion." },
    { q: "What luxury jewellery gift is suitable for an anniversary?", a: "Elegant rings, bracelets, and pendants are excellent anniversary gifts as they symbolize love, appreciation, and the journey shared together." },
    { q: "How do I choose the right luxury jewellery gift for her?", a: "Consider her personal style, the jewellery she already wears, her lifestyle, and whether she prefers minimal, classic, or statement designs." },
    { q: "Are minimalist jewellery pieces considered luxury gifts?", a: "Yes, minimalist jewellery can be luxurious. Modern luxury focuses on refined design, quality craftsmanship, and timeless appeal rather than excessive detailing." },
    { q: "What makes jewellery a meaningful luxury gift?", a: "Jewellery carries emotional value because it represents special moments, relationships, achievements, and memories that last beyond the occasion." },
    { q: "Are luxury earrings a good gift option?", a: "Yes, luxury earrings are a versatile gifting option because they do not require sizing and can complement different outfits and styles." },
    { q: "Why are luxury bracelets popular gifts for women?", a: "Luxury bracelets offer a perfect balance of elegance and practicality. They can be worn daily, layered with other pieces, or styled for special occasions." },
    { q: "Are luxury pendants a personal gift choice?", a: "Yes, pendants are considered personal gifts because they can represent special meanings, memories, or emotions while adding elegance to everyday looks." },
    { q: "Can luxury jewellery be gifted for festivals?", a: "Yes, luxury jewellery is a perfect choice for festive celebrations as it represents elegance, prosperity, and thoughtful gifting." },
    { q: "How should I care for luxury jewellery?", a: "Store jewellery in a soft pouch or jewellery box, avoid contact with chemicals and perfumes, clean gently with a soft cloth, and remove pieces before heavy activities." },
    { q: "Does luxury jewellery go out of style?", a: "No, well-designed luxury jewellery focuses on timeless elegance. Classic designs remain stylish and valuable even as fashion trends change." },
    { q: "What should I look for when buying luxury jewellery gifts?", a: "Look for quality craftsmanship, elegant design, comfort, versatility, and a style that matches the recipient's personality." },
    { q: "Can luxury jewellery be worn on everyday occasions?", a: "Yes, many luxury jewellery designs are created for everyday elegance, allowing the wearer to style them with casual, professional, and formal outfits." },
    { q: "Why choose Barosche for luxury jewellery gifts?", a: "Barosche offers thoughtfully designed jewellery that combines minimalist luxury, premium craftsmanship, everyday comfort, and timeless elegance." },
    { q: "Are luxury jewellery gifts worth choosing over other presents?", a: "Yes, luxury jewellery offers lasting emotional and aesthetic value. Unlike temporary gifts, it becomes a cherished piece connected with meaningful memories." },
];

// ─────────────────────────────────────────────────────────
//  FASHION JEWELLERY CONTENT DATA — Luxury Jewellery Gifts
// ─────────────────────────────────────────────────────────
const fashionJewelleryContent = [
    { type: 'h2', text: "Luxury Jewellery Gifts – Elegant &amp; Premium Gifts for Her" },
    { type: 'p', text: "Choosing <strong>luxury jewellery gifts</strong> is about more than just giving something beautiful—it's about creating a moment that feels truly special, memorable, and deeply personal. Luxury jewellery represents refinement, exclusivity, and timeless elegance, making it one of the most meaningful ways to express love, appreciation, and celebration. It is not just a gift—it is an experience that reflects thoughtfulness and a deep understanding of her style and personality." },
    { type: 'p', text: "Whether you are searching for <strong>luxury gifts for her</strong> for a birthday, anniversary, or a significant milestone, jewellery stands out as a choice that carries both emotional value and lasting beauty. Unlike ordinary presents that may fade over time, luxury jewellery becomes a part of her everyday life—something she can wear, cherish, and connect with on a deeper level. Each piece tells a story, capturing a moment that she can revisit every time she wears it." },
    { type: 'p', text: "At Barosche, our collection is thoughtfully curated to reflect modern sophistication while maintaining timeless appeal. We focus on creating designs that are elegant yet versatile, ensuring they complement both special occasions and everyday wear. Each piece is crafted with precision and attention to detail, offering a premium feel that enhances its beauty and durability. From refined rings and statement earrings to delicate bracelets and meaningful pendants, our jewellery is designed to elevate her style while remaining effortlessly wearable." },
    { type: 'p', text: "What makes luxury jewellery truly special is the emotion it carries. It transforms simple gestures into lasting memories and elevates everyday moments into something extraordinary. A carefully chosen piece can symbolize love, appreciation, success, or a meaningful milestone—making it far more than just an accessory." },
    { type: 'p', text: "Luxury jewellery is also a reflection of individuality. With the right piece, you are not just gifting something elegant—you are celebrating her personality, her journey, and the moments that matter most. Whether subtle and minimal or bold and expressive, each design allows her to showcase her unique style with confidence." },
    { type: 'p', text: "In a world full of temporary gifts, luxury jewellery stands apart as something enduring. It is a timeless keepsake that grows in sentimental value over time, making it one of the most thoughtful and impactful gifts you can give." },

    { type: 'h2', text: "Why Luxury Jewellery Makes the Perfect Gift" },
    { type: 'p', text: "Luxury jewellery continues to be one of the most desired gifting choices because it combines beauty, emotion, and exclusivity in a way few other gifts can. It goes beyond being just an accessory—it becomes a symbol of meaningful moments, personal connections, and lasting memories. Whether you're celebrating love, success, or a special milestone, luxury jewellery adds a sense of significance that makes the occasion truly unforgettable." },
    { type: 'h3', text: "What Makes Luxury Jewellery Special" },
    { type: 'ul', text: "<li><strong>Symbol of Elegance &amp; Status:</strong> Luxury jewellery reflects sophistication and refined taste. It represents a sense of style and exclusivity, making it a standout gift for important occasions and memorable celebrations.</li><li><strong>Timeless Beauty:</strong> Well-crafted jewellery never goes out of style. Its classic appeal ensures it remains elegant and relevant across changing trends, allowing it to be cherished for years.</li><li><strong>Emotional Value:</strong> Luxury pieces often carry deep meaning. They symbolize love, appreciation, and special memories, turning a beautiful object into something emotionally significant.</li><li><strong>Exceptional Craftsmanship:</strong> Every detail is carefully designed and crafted with precision. High-quality materials and expert craftsmanship ensure a premium finish and long-lasting durability.</li>" },
    { type: 'p', text: "Luxury jewellery is not just about how it looks—it's about how it makes her feel. It transforms gifting into an experience, making every moment more special and every memory more lasting." },

    { type: 'h2', text: "Explore Our Luxury Jewellery Gift Collection" },
    { type: 'p', text: "At Barosche, our <strong>luxury jewellery gifts</strong> collection is thoughtfully designed to combine elegance, comfort, and versatility—making each piece suitable for both everyday wear and special occasions. Whether you're selecting a meaningful gift or exploring refined styles, our collection offers timeless designs that elevate every moment." },

    { type: 'h3link', text: "1. Rings – Refined &amp; Meaningful", href: "/product-category/rings/" },
    { type: 'p', text: "Luxury rings are among the most symbolic jewellery pieces, representing love, commitment, and personal connection. From sleek minimalist bands to more detailed designs, rings effortlessly enhance any look while carrying deep emotional value. A well-chosen ring becomes more than just jewellery—it becomes a lasting reminder of a special moment." },

    { type: 'h3link', text: "2. Earrings – Elegant &amp; Versatile", href: "/product-category/earrings/" },
    { type: 'p', text: "Luxury earrings are a perfect gifting option thanks to their versatility and ease of wear. Whether subtle studs for everyday elegance or statement pieces for special occasions, earrings complement every outfit and personal style. They add a refined touch without being overwhelming, making them a timeless addition to any jewellery collection." },

    { type: 'h3link', text: "3. Bracelets – Modern &amp; Sophisticated", href: "/product-category/bracelets/" },
    { type: 'p', text: "Bracelets offer a perfect blend of simplicity and sophistication. Designed for comfort and style, they can be worn alone for a minimal look or layered for a more contemporary feel. A luxury bracelet adds a subtle yet noticeable elegance, making it ideal for both casual and formal settings." },

    { type: 'h3link', text: "4. Pendants – Personal &amp; Timeless", href: "/product-category/pendants/" },
    { type: 'p', text: "Pendants bring a unique combination of meaning and style. Often chosen for their personal significance, they can symbolize emotions, memories, or milestones. Lightweight and versatile, luxury pendants are easy to wear daily while still maintaining a refined and elegant appearance." },
    { type: 'p', text: "Each piece in our collection is created to reflect modern luxury while remaining timeless—ensuring your <strong>luxury gifts for her</strong> feel thoughtful, stylish, and truly unforgettable." },

    { type: 'h2', text: "Perfect Occasions for Luxury Jewellery Gifts" },
    { type: 'p', text: "Luxury jewellery fits beautifully into life's most meaningful celebrations, adding elegance, emotion, and lasting value to every moment. Whether it's a grand occasion or a personal milestone, a thoughtfully chosen piece of jewellery elevates the experience and creates memories that last for years." },
    { type: 'h3', text: "Ideal Gifting Occasions" },
    { type: 'ol', text: "<li><strong>Birthdays:</strong> Celebrate her special day with a gift that feels personal and timeless. Luxury jewellery adds a sense of importance to the occasion, making it truly unforgettable.</li><li><strong>Anniversaries:</strong> Mark the journey of love and togetherness with jewellery that symbolizes commitment and shared memories. It's a meaningful way to honor your relationship.</li><li><strong>Weddings:</strong> Luxury jewellery is a perfect choice for weddings—whether as a gift for the bride, bridesmaids, or loved ones. It reflects elegance and significance.</li><li><strong>Valentine's Day:</strong> Express love and appreciation with a piece that captures emotion and romance, turning a simple gesture into a lasting memory.</li><li><strong>Festive Celebrations:</strong> From traditional festivals to modern celebrations, luxury jewellery enhances the joy of gifting and adds a touch of sophistication.</li><li><strong>Milestone Achievements:</strong> Celebrate personal or professional achievements with jewellery that symbolizes success, growth, and new beginnings.</li>" },
    { type: 'p', text: "A carefully selected <strong>luxury jewellery gift</strong> doesn't just mark the occasion—it transforms it into something truly special, meaningful, and unforgettable." },

    { type: 'h2', text: "How to Choose the Right Luxury Jewellery Gift" },
    { type: 'p', text: "Selecting the perfect <strong>luxury jewellery gift</strong> becomes much easier when you focus on style, quality, and the meaning behind the piece. A well-chosen design not only looks beautiful but also feels personal and thoughtful, making the gift more memorable and valuable over time." },
    { type: 'h3', text: "Gifting Tips" },
    { type: 'ul', text: "<li><strong>Understand Her Style:</strong> Pay attention to what she usually wears. Whether her preference is minimal, bold, or classic, choosing jewellery that reflects her personality ensures the gift feels truly personal.</li><li><strong>Focus on Timeless Designs:</strong> Opt for designs that won't go out of style. Classic jewellery pieces maintain their elegance over time, making them a lasting addition to her collection.</li><li><strong>Choose Versatility:</strong> Select jewellery that can be styled with both everyday outfits and special occasion looks. Versatile pieces offer more value and become part of her regular wardrobe.</li><li><strong>Prioritize Comfort:</strong> Lightweight and easy-to-wear designs are always appreciated. Comfortable jewellery ensures she can wear it daily without inconvenience.</li>" },
    { type: 'p', text: "By keeping these simple tips in mind, you can choose a <strong>luxury jewellery gift</strong> that is not only elegant but also meaningful, practical, and cherished for years to come." },

    { type: 'h2', text: "Affordable Luxury – Elegance Within Reach" },
    { type: 'p', text: "Luxury doesn't always have to mean extravagant or excessive. True luxury is about thoughtful design, exceptional details, and pieces that offer lasting elegance. With carefully crafted jewellery, you can choose a gift that feels premium, sophisticated, and meaningful while still being practical for everyday wear." },
    { type: 'p', text: "At Barosche, we believe modern luxury is defined by simplicity, versatility, and timeless appeal. A beautifully designed jewellery piece can create a luxurious impression through its craftsmanship, refined details, and effortless style." },
    { type: 'h3', text: "Smart Luxury Choices" },
    { type: 'ol', text: "<li><strong>Minimalist Gold &amp; Premium-Finish Rings:</strong> Elegant and timeless, minimalist rings offer a sophisticated look without being overwhelming. Their clean designs make them perfect for everyday styling while maintaining a luxurious feel.</li><li><strong>Elegant Everyday Earrings:</strong> A pair of refined earrings can instantly enhance any look. From subtle designs to contemporary styles, they make a thoughtful luxury gift that she can wear regularly.</li><li><strong>Lightweight Designer Bracelets:</strong> Designer bracelets combine comfort with elegance. Their versatile designs allow them to be worn alone or layered, making them perfect for modern jewellery lovers.</li><li><strong>Refined Pendants:</strong> Pendants add a personal and stylish touch to any jewellery collection. Their timeless appeal makes them suitable for daily wear as well as special occasions.</li>" },
    { type: 'p', text: "Choosing these pieces ensures your <strong>luxury gifts for her</strong> feel elegant, sophisticated, and meaningful without being overwhelming. True luxury lies in the details—a design that reflects personality, quality, and lasting beauty." },

    { type: 'h2', text: "Styling Tips for Luxury Jewellery" },
    { type: 'p', text: "Luxury jewellery has the ability to elevate any outfit by adding sophistication, elegance, and a refined finishing touch. When styled thoughtfully, even simple jewellery pieces can create a polished and fashionable look while reflecting personal style." },
    { type: 'h3', text: "Easy Styling Ideas" },
    { type: 'h4', text: "1. Stack Rings for a Modern and Trendy Look" },
    { type: 'p', text: "Stacking rings is a popular way to create a contemporary and personalized appearance. Combining different ring styles, textures, or designs adds depth and allows you to express your unique fashion sense." },
    { type: 'h4', text: "2. Layer Bracelets for Added Elegance" },
    { type: 'p', text: "Layering bracelets creates a stylish and sophisticated look. Mixing delicate pieces with different finishes or designs can add a touch of luxury while keeping the overall style balanced." },
    { type: 'h4', text: "3. Pair Statement Earrings with Simple Outfits" },
    { type: 'p', text: "Statement earrings can instantly enhance a minimal outfit. Pairing bold or elegant earrings with simple clothing allows the jewellery to become the highlight of your look." },
    { type: 'h4', text: "4. Mix Different Pieces for a Personalized Style" },
    { type: 'p', text: "Combining rings, bracelets, earrings, and pendants helps create a signature style. Mixing and matching jewellery allows you to adapt your look for different occasions while maintaining elegance." },
    { type: 'p', text: "Luxury jewellery makes styling effortless by adding a refined touch to everyday outfits and special occasion looks. With the right combinations, each piece becomes a reflection of confidence, individuality, and timeless sophistication." },

    { type: 'h2', text: "Jewellery Care Tips for Long-Lasting Shine" },
    { type: 'p', text: "Maintaining your <strong>luxury jewellery</strong> properly ensures that each piece continues to preserve its brilliance, elegance, and premium finish over time. With the right care routine, your jewellery can remain beautiful for years while maintaining its sentimental and aesthetic value." },
    { type: 'p', text: "Luxury pieces are designed to be cherished, and simple daily habits can help protect their shine, prevent damage, and keep them looking as stunning as the day you received them." },
    { type: 'h3', text: "Care Guide" },
    { type: 'h4', text: "1. Store in a Soft Pouch or Jewellery Box" },
    { type: 'p', text: "Always store your jewellery in a soft pouch or dedicated jewellery box to protect it from scratches, dust, and accidental damage. Keeping each piece separately also helps prevent tangling and friction." },
    { type: 'h4', text: "2. Avoid Exposure to Chemicals &amp; Perfumes" },
    { type: 'p', text: "Perfumes, lotions, cosmetics, and harsh chemicals can affect the finish and shine of jewellery over time. Apply beauty products before wearing your jewellery to help maintain its original appearance." },
    { type: 'h4', text: "3. Clean Gently with a Soft Cloth" },
    { type: 'p', text: "Regularly wipe your jewellery with a soft, clean cloth to remove oils, dust, and everyday residue. Gentle cleaning helps restore its natural shine without damaging the surface." },
    { type: 'h4', text: "4. Remove Before Heavy Activities" },
    { type: 'p', text: "Take off your jewellery before activities such as workouts, swimming, cleaning, or other tasks that may expose it to impact, moisture, or unnecessary wear." },
    { type: 'p', text: "Proper care preserves the beauty, quality, and value of your <strong>luxury jewellery gifts</strong>, allowing each piece to remain a timeless expression of elegance and a cherished memory for years to come." },

    { type: 'h2', text: "Why Luxury Jewellery is a Meaningful Gift for Her" },
    { type: 'p', text: "A luxury jewellery gift is not just about elegance—it is about creating an emotional connection. The right piece of jewellery reflects thoughtfulness, appreciation, and the special bond you share with someone. Unlike temporary gifts, luxury jewellery becomes a lasting reminder of important moments and feelings." },
    { type: 'p', text: "Whether it is a delicate bracelet, an elegant ring, or a refined pendant, each piece carries its own story. It represents care, attention, and the effort taken to choose something truly special. This makes jewellery one of the most memorable luxury gifts for her." },
    { type: 'p', text: "Luxury jewellery is also a reflection of personal style. A carefully selected piece allows her to express individuality while adding sophistication to her everyday appearance. From minimal designs to statement creations, the right jewellery complements her personality and becomes a cherished part of her collection." },

    { type: 'h2', text: "Luxury Jewellery Gifts for Different Personalities" },
    { type: 'p', text: "Every woman has a unique style, and choosing jewellery that matches her personality makes the gift even more meaningful. Barosche offers elegant designs that suit different preferences and lifestyles." },
    { type: 'h3', text: "1. For the Minimalist Woman" },
    { type: 'p', text: "For someone who prefers subtle elegance, minimalist jewellery is the perfect choice. Clean designs, delicate details, and lightweight pieces offer everyday sophistication without being overwhelming." },
    { type: 'h3', text: "2. For the Classic Style Lover" },
    { type: 'p', text: "Classic jewellery designs never lose their charm. Timeless rings, elegant earrings, and refined pendants are ideal for women who appreciate traditional beauty with a modern touch." },
    { type: 'h3', text: "3. For the Modern Trendsetter" },
    { type: 'p', text: "Contemporary jewellery designs with unique shapes and styling options are perfect for women who enjoy experimenting with fashion. These pieces add confidence and individuality to every look." },
    { type: 'h3', text: "4. For the Everyday Luxury Lover" },
    { type: 'p', text: "Jewellery that combines comfort and elegance is ideal for daily wear. Lightweight bracelets, simple earrings, and versatile pendants allow her to enjoy luxury every day." },
    { type: 'p', text: "Choosing jewellery according to her personality ensures your gift feels thoughtful, personal, and unforgettable." },

    { type: 'h2', text: "What Makes a Luxury Jewellery Gift Different From Regular Jewellery?" },
    { type: 'p', text: "Luxury jewellery stands apart because of its attention to detail, craftsmanship, and timeless design. While regular jewellery may focus mainly on appearance, luxury pieces are created with a deeper focus on quality, comfort, and lasting appeal." },
    { type: 'p', text: "A luxury jewellery gift offers:" },
    { type: 'ul', text: "<li><strong>Premium Design:</strong> Luxury jewellery features refined designs created with attention to every detail, ensuring a sophisticated and elegant appearance.</li><li><strong>Better Craftsmanship:</strong> Every element is carefully considered, from the finishing touches to the overall structure, creating a piece that feels premium and special.</li><li><strong>Long-Term Value:</strong> Luxury jewellery is designed to remain beautiful over time, making it a gift that continues to hold meaning for years.</li><li><strong>Emotional Connection:</strong> A luxury piece often becomes associated with important memories, celebrations, and personal milestones.</li>" },
    { type: 'p', text: "This combination of beauty, quality, and emotion makes luxury jewellery one of the most valuable gifts you can give." },

    { type: 'h2', text: "Luxury Jewellery Gifts That She Can Wear Every Day" },
    { type: 'p', text: "Modern luxury is about creating pieces that are both beautiful and practical. The best luxury gifts for her are designs that fit naturally into her lifestyle while adding elegance to everyday moments." },
    { type: 'p', text: "Everyday luxury jewellery includes:" },
    { type: 'ul', text: "<li>Minimalist rings that complement daily outfits</li><li>Elegant earrings suitable for work and occasions</li><li>Lightweight bracelets for effortless styling</li><li>Classic pendants that add a personal touch</li>" },
    { type: 'p', text: "At Barosche, our jewellery focuses on comfort, versatility, and timeless beauty. Each piece is designed to transition smoothly from everyday wear to special celebrations, ensuring your gift remains meaningful beyond the moment it is received." },

    { type: 'h2', text: "How Luxury Jewellery Creates Lasting Memories" },
    { type: 'p', text: "The value of luxury jewellery goes beyond its appearance. It becomes connected with emotions, milestones, and unforgettable experiences." },
    { type: 'p', text: "A bracelet gifted on an anniversary, a pendant given for a special achievement, or earrings chosen for a meaningful celebration can become treasured reminders of those moments." },
    { type: 'p', text: "Unlike many gifts that lose importance over time, luxury jewellery often becomes more valuable emotionally as memories continue to grow. Every time she wears the piece, it brings back the feeling behind the gift." },
    { type: 'p', text: "This emotional connection is what makes luxury jewellery a truly timeless choice." },

    { type: 'h2', text: "Luxury Jewellery Gift Ideas for Her" },
    { type: 'p', text: "Finding the perfect gift becomes easier when you understand what makes each jewellery piece special." },

    { type: 'h3link', text: "1. Elegant Rings", href: "/product-category/rings/" },
    { type: 'p', text: "A luxury ring is a meaningful choice that represents connection, appreciation, and timeless beauty. It works beautifully for romantic occasions, celebrations, and personal milestones." },
    { type: 'h3link', text: "2. Designer Earrings", href: "/product-category/earrings/" },
    { type: 'p', text: "Luxury earrings are versatile and elegant, making them one of the easiest gifting choices. They add sophistication to both casual and formal looks." },
    { type: 'h3link', text: "3. Premium Bracelets", href: "/product-category/bracelets/" },
    { type: 'p', text: "A luxury bracelet combines style and comfort, making it ideal for women who appreciate subtle elegance and modern designs." },
    { type: 'h3link', text: "4. Refined Pendants", href: "/product-category/pendants/" },
    { type: 'p', text: "A pendant is a personal gift that can hold special meaning. Its timeless appeal makes it suitable for everyday wear and memorable occasions." },

    { type: 'h2', text: "Why Luxury Jewellery Remains a Timeless Investment" },
    { type: 'p', text: "Luxury jewellery is valued not only for its beauty but also for its lasting significance. Unlike short-lived trends, well-designed jewellery remains relevant across seasons and generations." },
    { type: 'p', text: "A carefully chosen luxury jewellery gift offers:" },
    { type: 'ul', text: "<li>Long-lasting beauty</li><li>Emotional significance</li><li>Timeless style</li><li>Versatile wearability</li><li>Memorable value</li>" },
    { type: 'p', text: "This makes luxury jewellery a thoughtful choice for anyone looking to give a gift that continues to feel special for years." },

    { type: 'h2', text: "Why Choose Barosche for Luxury Jewellery Gifts" },
    { type: 'p', text: "At Barosche, we believe that a <strong>luxury jewellery gift</strong> should be more than just a beautiful accessory—it should represent elegance, emotion, and lasting memories. Our designs are created to combine modern sophistication with everyday wearability, ensuring each piece feels special while seamlessly fitting into her lifestyle." },
    { type: 'p', text: "We focus on creating jewellery that reflects refined taste, timeless beauty, and effortless elegance. Every design is thoughtfully developed to offer a perfect balance of premium aesthetics and practical comfort, making it suitable for both meaningful occasions and everyday moments." },
    { type: 'h3', text: "What Makes Us Special" },
    { type: 'ul', text: "<li><strong>Minimalist Luxury Designs:</strong> Our jewellery embraces a modern minimalist approach, featuring clean lines, elegant details, and timeless designs. Each piece is created to offer understated luxury that complements every style.</li><li><strong>Premium Craftsmanship:</strong> Every Barosche piece is crafted with careful attention to detail and quality. From the design process to the final finish, we focus on creating jewellery that reflects excellence and lasting beauty.</li><li><strong>Perfect for Gifting:</strong> Our collections are thoughtfully curated to make every gifting moment special. Whether it's a birthday, anniversary, celebration, or personal milestone, our jewellery makes a meaningful and memorable choice.</li><li><strong>Designed for Everyday Comfort:</strong> Luxury should not be limited to special occasions. Our jewellery is designed to be lightweight, comfortable, and easy to wear, allowing her to enjoy elegance every day.</li>" },
    { type: 'p', text: "Each Barosche piece reflects sophistication, simplicity, and timeless style. Choosing Barosche for your <strong>luxury jewellery gifts</strong> means giving more than jewellery—it means giving a lasting expression of appreciation, beauty, and unforgettable moments." },

    { type: 'h2', text: "Make Every Celebration Special with Luxury Jewellery" },
    { type: 'p', text: "A meaningful gift has the power to transform ordinary moments into unforgettable memories. Luxury jewellery adds elegance and emotion to every celebration, making it a perfect choice for expressing love, gratitude, and appreciation." },
    { type: 'p', text: "Whether you are searching for luxury gifts for her for a birthday, anniversary, festival, or milestone achievement, Barosche offers timeless <a href='https://barosche.com/' style='color: #007bff; text-decoration: underline;'>minimalist luxury jewellery</a> designs created to celebrate every special moment." },
    { type: 'p', text: "Choose a luxury jewellery gift that reflects her style, personality, and the memories you want to create together." },
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

// ───────
//  HELPER — ab videos bhi return karega (Rings.js jaisa pattern)
// ───────
function getFirstVariant(product) {
    if (product.variants && product.variants.length > 0) return product.variants[0];
    return {
        images: product.images || [],
        videos: product.videos || [],
        oldPrice: product.oldPrice,
        newPrice: product.newPrice,
        isSale: product.isSale || false,
        inStock: product.inStock ?? true,
    };
}

// ───────
//  TOAST
// ───────
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
            boxShadow: '0 4px 12px #00000033',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.3s ease',
        }}>
            {message}
        </div>
    );
}

// ─────────────────────────────────────────────────────────
//  QUICK VIEW MODAL — image + video support (Rings.js pattern)
// ─────────────────────────────────────────────────────────
function QuickViewModal({ product, currency, ui, onClose, onAddToCart, wishlist, onToggleWishlist }) {
    const [qty, setQty] = useState(1);
    const variant = getFirstVariant(product);
    const images = variant.images || [];
    const videos = variant.videos || [];
    const categoryUrl = categorySlugMap[product.category] || 'jewellery';

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
        return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
    }, [onClose]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
            <div style={{ background: '#fff', borderRadius: '8px', maxWidth: '860px', width: '100%', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'row', position: 'relative', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: 'absolute', top: '12px', right: '16px', background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#555', zIndex: 1, lineHeight: 1 }} aria-label="Close">✕</button>

                {/* Images / Video */}
                <div style={{ flex: '1 1 300px', minWidth: '240px', padding: '24px 16px 24px 24px' }}>
                    <div style={{ background: '#f7f6f4', borderRadius: '6px', aspectRatio: '1/1', overflow: 'hidden', marginBottom: '12px' }}>
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
                                <img src={`${API_BASE}${activeItem.src}`} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                            )
                        ) : (
                            <img src="/placeholder.jpg" alt="placeholder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                    </div>
                    {mediaList.length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {mediaList.map((item, i) => (
                                <button key={i} onClick={() => setActiveIdx(i)} style={{ width: '54px', height: '54px', padding: 0, border: i === activeIdx ? '2px solid #1a1a1a' : '2px solid transparent', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', background: '#f7f6f4', position: 'relative' }}>
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
                                        <img src={`${API_BASE}${item.src}`} alt={`view ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
                                    )}
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
//  PRODUCT CARD — image + video hover cycling (Rings.js pattern)
// ─────────────────────────────────────────────────────────
function ProductCard({ p, wishlist, toggleWishlist, currency, ui, onQuickView }) {
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
    const categoryUrl = categorySlugMap[p.category] || "jewellery";

    return (
        <Link href={`/product-category/${categoryUrl}/${p.slug}`} className="jw-card" onMouseEnter={startHover} onMouseLeave={stopHover}>
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">{ui.sale}</span>}

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
                        src={currentItem ? `${API_BASE}${currentItem.src}` : "/placeholder.jpg"}
                        alt={p.title}
                        className="jw-card-img"
                        loading="lazy"
                        onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                    />
                )}

                {mediaList.length > 1 && (
                    <div className="jw-img-dots">
                        {mediaList.map((_, i) => <span key={i} className={`jw-img-dot ${i === currentIdx ? 'jw-img-dot--active' : ''}`} />)}
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
export default function LuxuryJewellery() {
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
                                <ProductCard key={p._id} p={p} wishlist={wishlist} toggleWishlist={toggleWishlist} currency={currency} ui={ui} onQuickView={openQuickView} />
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
                                {translatedFashionContent.map((item, i) => {
                                    if (item.type === 'h' || item.type === 'h2') {
                                        return <h2 key={i} className="jw-accordion-heading" dangerouslySetInnerHTML={{ __html: item.text }} />;
                                    }
                                    if (item.type === 'h3') {
                                        return <h3 key={i} className="jw-accordion-subheading" dangerouslySetInnerHTML={{ __html: item.text }} />;
                                    }
                                    if (item.type === 'h3link') {
                                        return (
                                            <h3 key={i} className="jw-accordion-subheading">
                                                <Link href={item.href} style={{ color: '#007bff', textDecoration: 'underline' }}>
                                                    <span dangerouslySetInnerHTML={{ __html: item.text }} />
                                                </Link>
                                            </h3>
                                        );
                                    }
                                    if (item.type === 'h4') {
                                        return <h4 key={i} className="jw-accordion-subsubheading" dangerouslySetInnerHTML={{ __html: item.text }} />;
                                    }
                                    if (item.type === 'ul') {
                                        return <ul key={i} className="jw-accordion-list" dangerouslySetInnerHTML={{ __html: item.text }} />;
                                    }
                                    if (item.type === 'ol') {
                                        return <ol key={i} className="jw-accordion-list" dangerouslySetInnerHTML={{ __html: item.text }} />;
                                    }
                                    return <p key={i} dangerouslySetInnerHTML={{ __html: item.text }} />;
                                })}
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