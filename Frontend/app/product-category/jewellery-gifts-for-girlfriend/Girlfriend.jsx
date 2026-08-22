'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './Girlfriend.css';
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
    pageTitle: "Jewellery Gifts for Girlfriend – Romantic & Timeless Style",
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
   { q: "Why is jewellery a good gift for a girlfriend?", a: "Jewellery is a meaningful gift because it represents love, appreciation, and special memories. A carefully chosen piece becomes a lasting reminder of your relationship and the moments you share together." },
    { q: "What is the best jewellery gift for a girlfriend?", a: "The best jewellery gift depends on her personal style. Popular choices include rings, bracelets, earrings, and pendants because they are elegant, versatile, and meaningful." },
    { q: "Is a gold ring gift for girlfriend a good choice?", a: "Yes, a gold ring gift for girlfriend is a timeless and romantic choice. It symbolizes love, commitment, and connection while becoming a cherished piece she can wear for years." },
    { q: "Which jewellery makes the best romantic gift for her?", a: "Rings, personalised pendants, elegant bracelets, and delicate earrings are popular romantic gifts for her because they combine beauty with emotional meaning." },
    { q: "What jewellery should I gift my girlfriend on her birthday?", a: "For birthdays, you can choose a piece that matches her personality, such as a minimalist ring, elegant bracelet, or stylish pendant that reflects her everyday style." },
    { q: "Are jewellery gifts suitable for anniversaries?", a: "Yes, jewellery is one of the most meaningful anniversary gifts. A thoughtfully selected piece can represent your journey together and celebrate your relationship milestones." },
    { q: "How do I choose the right jewellery gift for my girlfriend?", a: "Consider her style, the jewellery she usually wears, her lifestyle, and the occasion. Choosing a piece that matches her personality makes the gift more personal and special." },
    { q: "What type of jewellery is suitable for everyday wear?", a: "Minimalist rings, lightweight bracelets, simple earrings, and delicate pendants are ideal for everyday wear because they are comfortable and easy to style." },
    { q: "Are earrings a good gift for a girlfriend?", a: "Yes, earrings are a versatile gifting option because they do not require sizing and can complement different outfits and personal styles." },
    { q: "Why are rings considered meaningful gifts?", a: "Rings symbolize connection, love, and commitment. A carefully selected ring can represent special memories and important moments in a relationship." },
    { q: "What makes luxury jewellery a special gift for her?", a: "Luxury jewellery combines premium craftsmanship, timeless design, and emotional value, making it a memorable gift that she can cherish for years." },
    { q: "Can I gift jewellery without knowing her exact preferences?", a: "Yes, versatile pieces like classic earrings, minimalist bracelets, and simple pendants are safe choices because they suit a wide range of styles." },
    { q: "Are minimalist jewellery designs good romantic gifts?", a: "Yes, minimalist jewellery is a popular choice because it offers timeless elegance, everyday comfort, and effortless styling." },
    { q: "What occasions are perfect for gifting jewellery to a girlfriend?", a: "Jewellery is suitable for birthdays, anniversaries, Valentine's Day, festivals, relationship milestones, proposals, or simply as a surprise gesture." },
    { q: "How can I make a jewellery gift more personal?", a: "Choose a design that reflects her personality, style, or a special memory you share. A meaningful choice makes the gift feel more thoughtful." },
    { q: "Why choose a bracelet as a gift for a girlfriend?", a: "Bracelets are elegant, comfortable, and versatile. They can be worn daily and styled with different outfits, making them a practical yet meaningful gift." },
    { q: "What makes Barosche jewellery a good gifting choice?", a: "Barosche offers elegant jewellery designs that combine minimalist luxury, premium craftsmanship, and everyday wearability, making each piece suitable for meaningful gifting." },
    { q: "Is jewellery a long-lasting gift?", a: "Yes, quality jewellery is designed to last for years. Beyond its physical beauty, it holds sentimental value and becomes a cherished keepsake." },
    { q: "What jewellery style is best for a girlfriend who prefers simple designs?", a: "Minimalist rings, delicate pendants, subtle earrings, and lightweight bracelets are ideal for someone who prefers simple and elegant jewellery." },
    { q: "Why should I choose jewellery instead of traditional gifts?", a: "Unlike many temporary gifts, jewellery carries emotional significance and lasting value. It becomes a personal reminder of love, memories, and special moments shared together." },
];

// ─────────────────────────────────────────────────────────
//  FASHION JEWELLERY CONTENT DATA — Luxury Jewellery Gifts
// ─────────────────────────────────────────────────────────
const fashionJewelleryContent = [
    { type: 'h', text: "Jewellery Gifts for Girlfriend – Romantic & Meaningful Gifts for Her" },
    { type: 'p', text: "Choosing the perfect <strong>jewellery gift for your girlfriend</strong> is a beautiful way to express love, appreciation, and the special bond you share. Jewellery has always been more than just an accessory—it carries emotions, memories, and personal meaning. A thoughtfully selected piece can become a lasting reminder of your relationship, the moments you have shared, and the feelings behind your gift." },
    { type: 'p', text: "Unlike ordinary presents that may lose their charm over time, jewellery holds sentimental value and becomes a cherished keepsake. Every time she wears the piece, it reminds her of a special moment, a meaningful celebration, or the person who gifted it. This makes jewellery one of the most thoughtful and memorable choices when looking for something truly special." },
    { type: 'p', text: "At Barosche, we offer a carefully curated collection of elegant jewellery designed to make your gifting moments truly special. Whether you are searching for a romantic surprise, a meaningful keepsake, or one of the best <strong>jewellery gifts</strong> for her, our collection combines modern elegance with timeless beauty. Each design is created with attention to detail, ensuring it feels sophisticated, comfortable, and perfect for everyday wear." },
    { type: 'p', text: "From delicate rings and graceful bracelets to elegant earrings and refined pendants, each piece is designed to complement her personal style while adding a touch of sophistication. Whether she prefers minimalist designs or timeless classics, our jewellery collection offers thoughtful options that reflect her personality and make every occasion more memorable." },
    { type: 'p', text: "A beautiful <strong>gold ring gift for girlfriend</strong> can symbolize love, commitment, and connection, while a stylish bracelet or pendant can reflect her individuality and everyday elegance. Jewellery is not just something she wears—it becomes a part of her journey, a treasured piece connected to your special moments and shared memories." },
    { type: 'p', text: "Whether it's her birthday, anniversary, Valentine's Day, a relationship milestone, or simply a surprise to show your love and appreciation, Barosche offers timeless jewellery pieces that help you create unforgettable memories. Choose a gift that goes beyond the occasion and becomes a lasting expression of your love, care, and thoughtfulness." },

    { type: 'h', text: "Why Jewellery Makes the Perfect Gift for Your Girlfriend" },
    { type: 'p', text: "Finding the right gift for someone special is about understanding what makes them feel loved, appreciated, and valued. Jewellery stands out as one of the most meaningful <strong>romantic gifts for her</strong> because it combines beauty, emotion, and lasting value in a way few other gifts can. It is not just an accessory—it is a thoughtful expression of love, care, and the special connection you share." },
    { type: 'p', text: "Unlike temporary gifts that may lose their significance over time, jewellery becomes something she can keep close and wear regularly. Every time she wears the piece, it reminds her of the moment it was gifted, the emotions behind it, and the effort taken to choose something meaningful. This emotional connection is what makes jewellery one of the most cherished gifts for a girlfriend." },
    { type: 'p', text: "A carefully selected jewellery piece reflects your understanding of her personality, style, and preferences. Whether she loves minimal designs, classic elegance, or modern styles, choosing a piece that matches her taste shows thoughtfulness and attention to detail. It transforms a simple gift into a personal memory that she can treasure for years." },

    { type: 'h', text: "What Makes Jewellery Special" },

    { type: 'h', text: "Symbol of Love & Connection" },
    { type: 'p', text: "Jewellery has always been associated with love, affection, and meaningful relationships. A carefully chosen piece represents the bond between two people and expresses emotions that words sometimes cannot capture. Whether it is a ring, bracelet, pendant, or earrings, each piece can carry a special meaning." },

    { type: 'h', text: "Personal & Thoughtful" },
    { type: 'p', text: "Selecting jewellery based on her style makes your gift feel more personal and intentional. Understanding whether she prefers delicate, minimalist pieces or elegant statement designs shows that you truly know her preferences and personality." },

    { type: 'h', text: "Timeless & Long-Lasting" },
    { type: 'p', text: "A beautiful jewellery piece is designed to be enjoyed for years. Unlike many gifts that are forgotten over time, jewellery becomes a lasting keepsake connected to memorable moments, celebrations, and milestones." },

    { type: 'h', text: "Perfect for Every Occasion" },
    { type: 'p', text: "Jewellery is a versatile gift choice that suits every special moment. Whether it is a birthday, anniversary, Valentine's Day, relationship milestone, or a simple surprise to show your appreciation, jewellery adds meaning to every occasion." },
    { type: 'p', text: "Choosing a <strong>jewellery gift for girlfriend</strong> means giving more than just a beautiful piece—it means giving a symbol of your love, your memories, and the special journey you share together. A thoughtfully chosen jewellery gift becomes a timeless reminder of the emotions and moments that make your relationship unique." },

    { type: 'h', text: "Explore Our Jewellery Gifts for Girlfriend Collection" },
    { type: 'p', text: "At Barosche, our jewellery collection is thoughtfully designed to help you find the perfect <strong>jewellery gift for girlfriend</strong> that reflects her personality, style, and the emotions you want to express. Every relationship is unique, and the right jewellery piece can become a meaningful symbol of your love and appreciation." },
    { type: 'p', text: "Our collection focuses on elegance, comfort, and timeless appeal, making each piece suitable for both special celebrations and everyday moments. Whether you are planning a romantic surprise or looking for a thoughtful keepsake, Barosche offers jewellery designs that combine modern sophistication with lasting beauty." },
    { type: 'p', text: "From classic rings and elegant bracelets to refined earrings and meaningful pendants, each piece is created to complement her individual style while adding a touch of luxury to her jewellery collection." },

    { type: 'h', text: "<a href='/product-category/rings/' style='color: #007bff; text-decoration: underline;'>1. Rings – Romantic & Meaningful Gifts</a>" },
    { type: 'p', text: "A ring is one of the most symbolic <strong>jewellery gifts for girlfriend</strong>. It represents love, connection, and commitment, making it a beautiful choice for romantic occasions and memorable milestones. A carefully selected ring can express emotions in a way that feels personal and timeless." },
    { type: 'p', text: "A <strong>gold ring gift for girlfriend</strong> adds elegance and significance to your gesture. Gold rings have always been associated with lasting beauty and meaningful relationships, making them a perfect choice for birthdays, anniversaries, Valentine's Day, or special surprises." },
    { type: 'p', text: "Minimalist gold rings are ideal for everyday wear, offering a subtle and elegant look that complements different outfits. For more memorable occasions, refined designs create a sophisticated impression while becoming a cherished keepsake." },
    { type: 'p', text: "Whether it marks a special milestone or is simply a thoughtful surprise, a beautifully chosen ring becomes a lasting reminder of your relationship and the moments you share together." },

    { type: 'h', text: "<a href='/product-category/bracelets/' style='color: #007bff; text-decoration: underline;'>2. Bracelets – Elegant & Stylish</a>" },
    { type: 'p', text: "Bracelets are versatile jewellery pieces that combine beauty, comfort, and effortless style. They make wonderful <strong>romantic gifts for her</strong> because they can be worn every day while carrying a meaningful connection to the person who gifted them." },
    { type: 'p', text: "From delicate minimal designs to more refined styles, bracelets add a graceful touch to any outfit. They are perfect for girlfriends who appreciate elegant accessories that are easy to style and comfortable to wear." },
    { type: 'p', text: "A thoughtfully chosen bracelet can become an everyday favourite, reminding her of your love and appreciation whenever she wears it. Whether paired with casual outfits or special occasion looks, bracelets offer timeless elegance and everyday versatility." },

    { type: 'h', text: "<a href='/product-category/earrings/' style='color: #007bff; text-decoration: underline;'>3. Earrings – Timeless & Versatile</a>" },
    { type: 'p', text: "Earrings are one of the most popular and appreciated jewellery gifts because they combine style, practicality, and elegance. Since they do not require sizing, they are an easy yet thoughtful choice when selecting a special gift for your girlfriend." },
    { type: 'p', text: "Elegant earrings can enhance her everyday appearance while adding a refined touch to festive and special occasion outfits. From minimal studs to sophisticated designs, earrings offer options for every personality and style preference." },
    { type: 'p', text: "Whether she prefers simple everyday jewellery or elegant statement pieces, a beautiful pair of earrings can make her feel special while becoming a valuable addition to her collection." },

    { type: 'h', text: "<a href='/product-category/pendants/' style='color: #007bff; text-decoration: underline;'>4. Pendants – Personal & Special</a>" },
    { type: 'p', text: "Pendants are meaningful jewellery gifts that allow you to express emotions in a personal and stylish way. They can represent love, memories, special moments, or the unique connection you share." },
    { type: 'p', text: "A beautifully designed pendant can become her everyday favourite piece, adding elegance to her look while carrying sentimental value. Whether worn alone for a minimal appearance or layered with other jewellery, pendants offer timeless versatility." },
    { type: 'p', text: "Choosing a pendant as a <strong>jewellery gift for girlfriend</strong> shows thoughtfulness and care. It is more than just a beautiful accessory—it becomes a lasting reminder of your relationship, your memories, and the special moments you create together." },
    { type: 'p', text: "At Barosche, every jewellery piece is designed to make your gifting experience meaningful, helping you choose a timeless gift that she will love, wear, and cherish for years to come.." },

    { type: 'h', text: "Romantic Jewellery Gifts for Every Special Occasion" },
    { type: 'p', text: "Jewellery is a beautiful way to celebrate the important moments in your relationship and express emotions that words cannot always capture. Whether you want to surprise her with a thoughtful gesture or mark a special milestone, the right <strong>jewellery gift for girlfriend</strong> can make the occasion even more meaningful and unforgettable." },
    { type: 'p', text: "Unlike ordinary presents, jewellery carries emotional value that lasts beyond the moment. A carefully selected piece becomes a reminder of your love, shared memories, and the special bond you both cherish. From elegant rings to stylish bracelets, every jewellery piece can represent a unique story and create a lasting connection." },
    { type: 'p', text: "Whether it is a grand celebration or a simple expression of love, Barosche jewellery offers timeless designs that make every occasion more special. Our collection combines modern elegance with everyday wearability, helping you find the perfect gift that matches her style and personality." },

    { type: 'h', text: "Perfect Occasions for Jewellery Gifts" },

    { type: 'h', text: "1. Birthday Celebrations" },
    { type: 'p', text: "Make her birthday extra special with a jewellery gift that reflects her personality, style, and individuality. A thoughtfully chosen ring, bracelet, pendant, or pair of earrings can become a memorable reminder of your love and appreciation." },
    { type: 'p', text: "A beautiful jewellery piece adds a personal touch to birthday celebrations, making the moment feel more meaningful and showing her how much she means to you." },

    { type: 'h', text: "2. Anniversary Gifts" },
    { type: 'p', text: "Celebrate your journey together with jewellery that represents love, commitment, and shared memories. Anniversaries are a perfect opportunity to gift something timeless that symbolizes the special connection you have built together." },
    { type: 'p', text: "An elegant jewellery piece becomes more than just a gift—it becomes a keepsake that reminds her of your relationship and the beautiful moments you have shared." },

    { type: 'h', text: "3. Valentine's Day Surprises" },
    { type: 'p', text: "A romantic jewellery gift is one of the most timeless ways to express love on Valentine's Day. Whether it is a delicate pendant, a meaningful ring, or an elegant bracelet, jewellery adds a special touch to this celebration of love." },
    { type: 'p', text: "A carefully selected piece shows thoughtfulness and creates a memorable Valentine's Day moment that she can cherish for years." },

    { type: 'h', text: "Relationship Milestones" },
    { type: 'p', text: "Every relationship has special milestones worth celebrating. Whether it is your first anniversary, a personal achievement, or an important moment together, jewellery makes the occasion even more memorable." },
    { type: 'p', text: "A meaningful piece represents your connection, growth, and the memories you continue to create together." },

    { type: 'h', text: "4. Just Because Gifts" },
    { type: 'p', text: "Sometimes the most meaningful gifts are the unexpected ones. You don't always need a special occasion to show your love and appreciation." },
    { type: 'p', text: "A beautiful jewellery piece given as a surprise can create a memorable moment and remind her how much she is valued. These thoughtful gestures often become some of the most cherished memories." },
    { type: 'p', text: "No matter the occasion, a carefully chosen <strong>jewellery gift for girlfriend</strong> is more than just an accessory—it is a symbol of love, appreciation, and the special moments you share together. Barosche helps you find elegant jewellery pieces that turn ordinary moments into unforgettable memories." },

    { type: 'h', text: "How to Choose the Best Jewellery Gift for Your Girlfriend" },
    { type: 'p', text: "Choosing the right <strong>jewellery gift for girlfriend</strong> is about more than selecting something beautiful—it is about finding a piece that reflects her personality, your relationship, and the emotions you want to express. The most meaningful gifts are not always the biggest or most expensive; they are the ones chosen with thought, care, and understanding." },
    { type: 'p', text: "Before selecting a jewellery piece, consider her personal style, daily preferences, and the type of accessories she enjoys wearing. A well-chosen piece should feel natural to her lifestyle while also carrying a special meaning that reminds her of your bond." },

    { type: 'h', text: "Simple Gifting Tips" },

    { type: 'h', text: "Understand Her Style" },
    { type: 'p', text: "Pay attention to the jewellery she already wears. Does she prefer delicate and minimal designs, classic elegance, or bold statement pieces? Choosing a style that matches her personality makes your gift feel more personal and shows that you understand her preferences." },

    { type: 'h', text: "Choose Something Wearable" },
    { type: 'p', text: "Select jewellery that she can enjoy regularly. Everyday pieces such as elegant rings, lightweight bracelets, simple earrings, and refined pendants are versatile choices that can complement different outfits and occasions." },

    { type: 'h', text: "Consider Meaningful Designs" },
    { type: 'p', text: "A thoughtful jewellery gift can represent special memories, shared experiences, or important moments in your relationship. Whether it's a symbolic ring, a meaningful pendant, or a timeless bracelet, choosing a design with emotional value makes the gift even more memorable." },

    { type: 'h', text: "Focus on Quality & Comfort" },
    { type: 'p', text: "Beautiful jewellery should also provide comfort and long-lasting wear. Choose pieces that are carefully crafted, lightweight, and suitable for everyday use so she can enjoy wearing your gift effortlessly." },

    { type: 'h', text: "Match the Occasion" },
    { type: 'p', text: "Consider the reason behind the gift. A romantic surprise, anniversary celebration, birthday, or Valentine's Day gift may call for different styles. Selecting a piece that fits the occasion adds an extra layer of thoughtfulness." },

    { type: 'p', text: "By keeping these details in mind, you can confidently choose a <strong>jewellery gift for girlfriend</strong> that feels elegant, meaningful, and perfectly suited to her. A carefully selected piece from Barosche becomes more than just an accessory—it becomes a lasting symbol of love, appreciation, and unforgettable memories." },

    { type: 'h', text: "Gold Ring Gift for Girlfriend – A Timeless Expression of Love" },
    { type: 'p', text: "A <strong>gold ring gift for girlfriend</strong> is one of the most meaningful and romantic ways to celebrate the special bond you share. Gold has been valued for centuries as a symbol of beauty, purity, and lasting significance, making it a perfect choice when you want to express love, appreciation, and commitment through a thoughtful gift." },
    { type: 'p', text: "Unlike ordinary presents, a gold ring carries emotional meaning. Every time she wears it, it becomes a reminder of your relationship, the memories you have created together, and the special moment when you gifted it to her. Whether it is a birthday surprise, anniversary celebration, Valentine's Day gesture, or simply a way to show your love, a gold ring creates a lasting impression." },
    { type: 'p', text: "A gold ring can symbolize:<br/>• <strong>Love and Affection:</strong> A beautifully chosen gold ring reflects care, admiration, and the special feelings you share. It is a simple yet powerful way to express emotions that words cannot always describe.<br/>• <strong>Commitment and Trust:</strong> Rings have long been associated with connection and commitment. A meaningful design can represent the trust, understanding, and journey you share as a couple.<br/>• <strong>Special Memories:</strong> A gold ring becomes more than just jewellery—it becomes a keepsake connected to a memorable moment. Every time she wears it, it brings back the emotions and happiness associated with that occasion.<br/>• <strong>Personal Milestones:</strong> Whether celebrating a relationship milestone, achievement, or a new chapter in life, a gold ring is a timeless gift that marks important moments in life." },
    { type: 'p', text: "At Barosche, our elegant gold ring designs combine modern sophistication with timeless beauty. Each piece is thoughtfully crafted to complement different styles, from minimal everyday designs to refined classic looks. Whether she prefers subtle jewellery or a more elegant statement piece, a carefully selected gold ring can become a cherished part of her collection." },
    { type: 'p', text: "Choosing a <strong>gold ring gift for girlfriend</strong> means giving more than just an accessory—it means gifting a lasting expression of love, style, and the memories you create together." },

    { type: 'h', text: "Luxury Jewellery Gifts for Her" },
    { type: 'p', text: "When searching for premium and meaningful <strong>romantic gifts for her</strong>, luxury jewellery offers the perfect combination of elegance, emotion, and timeless beauty. A carefully selected jewellery piece is more than just an accessory—it is a thoughtful expression of love, appreciation, and the special connection you share." },
    { type: 'p', text: "Luxury jewellery stands out because it carries a sense of exclusivity and personal meaning. Unlike temporary gifts, a beautifully crafted piece becomes something she can wear, cherish, and remember for years. Every detail, from the design to the finishing, adds to the experience of giving a gift that feels truly special." },
    { type: 'p', text: "Modern luxury is not only about bold or extravagant designs. Today, true luxury is defined by:<br/>• <strong>Elegant Craftsmanship:</strong> High-quality craftsmanship ensures every jewellery piece reflects attention to detail, precision, and lasting beauty. A well-crafted design feels premium while maintaining comfort and practicality.<br/>• <strong>Timeless Designs:</strong> Classic and refined jewellery styles remain beautiful across changing trends. Choosing timeless designs ensures your gift continues to feel elegant and meaningful for years to come.<br/>• <strong>Comfortable Wearability:</strong> Luxury jewellery should not only look beautiful but also feel effortless to wear. Lightweight and versatile designs allow her to enjoy the piece every day, whether for casual outings or special occasions.<br/>• <strong>Personal Significance:</strong> The most memorable gifts are those that hold emotional value. A jewellery piece chosen according to her personality and style becomes a meaningful reminder of your love and the moments you share." },
    { type: 'p', text: "From a refined bracelet that adds everyday elegance to a graceful ring that symbolizes your connection or a delicate pendant with personal meaning, luxury jewellery makes every gifting moment more special." },
    { type: 'p', text: "At Barosche, our collection is designed to combine modern sophistication with timeless appeal. Each piece reflects simplicity, elegance, and thoughtful design—making it a perfect choice when you want to give her a gift that feels luxurious, personal, and unforgettable." },

    { type: 'h', text: "Unique Jewellery Gift Ideas for Your Girlfriend" },
    { type: 'p', text: "Finding a unique<strong>jewellery gift for girlfriend</strong> is about choosing something that reflects her personality and the special connection you share. A thoughtful piece of jewellery can turn an ordinary moment into a memorable celebration." },
    { type: 'p', text: "Instead of choosing a gift based only on trends, consider jewellery that matches her lifestyle, preferences, and personal style. From elegant everyday pieces to meaningful designs for special occasions, the right jewellery can make her feel valued and appreciated." },

    { type: 'h', text: "Thoughtful Jewellery Gift Ideas" },
    { type: 'p', text: "1. <strong>Minimalist Rings:</strong> Simple and elegant rings are perfect for girlfriends who appreciate subtle beauty. Their timeless designs make them suitable for everyday wear while carrying emotional significance.<br/>2. <strong>Elegant Bracelets:</strong> A stylish bracelet is a versatile gift that adds sophistication to any outfit. Lightweight designs are perfect for daily styling and can become her favourite accessory.<br/>3. <strong>Meaningful Pendants:</strong> Pendants offer a personal touch and can represent memories, emotions, or special moments between couples. They are a beautiful way to gift something with sentimental value.<br/>4. <strong>Classic Earrings:</strong> Earrings are effortless, elegant, and suitable for every style. From everyday minimal designs to refined occasion pieces, they make a thoughtful jewellery gift choice." },

    { type: 'p', text: "Choosing a unique jewellery gift shows that you have taken the time to understand her style and select something that truly represents your relationship." },

    { type: 'h', text: "Jewellery Gift Ideas Based on Her Personality" },
    { type: 'p', text: "Every woman has a different style preference, and choosing jewellery based on her personality makes the gift more meaningful. The perfect <strong>jewellery gift for girlfriend</strong> should feel like something made especially for her." },

    { type: 'h', text: "For the Minimalist Girl" },
    { type: 'p', text: "Choose delicate rings, simple earrings, and lightweight bracelets with clean designs. Minimal jewellery offers effortless elegance and suits everyday styling." },

    { type: 'h', text: "For the Classic Style Lover" },
    { type: 'p', text: "Timeless gold rings, elegant pendants, and traditional-inspired designs are perfect for someone who appreciates sophisticated and graceful jewellery." },

    { type: 'h', text: "For the Trendsetter" },
    { type: 'p', text: "Modern statement earrings, layered bracelets, and contemporary designs make excellent choices for someone who loves experimenting with fashion." },

    { type: 'h', text: "For the Romantic Personality" },
    { type: 'p', text: "Heart-inspired designs, meaningful pendants, and symbolic rings can create a deeply personal gifting experience." },
    { type: 'p', text: "Understanding her personality helps you choose jewellery that feels more connected, thoughtful, and memorable." },

    { type: 'h', text: "Best Jewellery Gifts for Long-Distance Girlfriend" },
    { type: 'p', text: "Distance can make special moments challenging, but a meaningful jewellery gift can help maintain a strong emotional connection. A beautiful piece becomes a daily reminder of your love, even when you are apart." },
    { type: 'p', text: "Jewellery is one of the most thoughtful long-distance romantic gifts for her because it is something she can carry with her every day." },
    { type: 'p', text: "Perfect choices include:<br/>• Delicate pendants with personal meaning<br/>• Everyday bracelets she can wear regularly<br/>• Elegant rings representing your connection<br/>• Classic earrings for daily elegance" },
    { type: 'p', text: "A carefully selected jewellery gift helps bridge the distance by creating a lasting emotional connection." },

    { type: 'h', text: "Jewellery Gifts for Different Relationship Milestones" },
    { type: 'p', text: "Every relationship has moments worth celebrating. Jewellery makes these milestones even more meaningful because it represents memories, growth, and the journey you share together." },
    { type: 'p', text: "• <strong>First Date Anniversary:</strong> A delicate bracelet or pendant can beautifully represent the beginning of your relationship.<br/>• <strong>First Relationship Anniversary:</strong> Choose a timeless jewellery piece that celebrates your journey and shared memories.<br/>• <strong>Proposal or Commitment Moment:</strong> A meaningful ring can symbolize love, trust, and the future you are building together.<br/>• <strong>Achievement Celebration:</strong> Celebrate her personal success with elegant jewellery that recognizes her hard work and achievements." },
    { type: 'p', text: "A jewellery gift becomes a symbol of the special chapters you create together." },

    { type: 'h', text: "How to Make a Jewellery Gift More Special" },
    { type: 'p', text: "A jewellery gift becomes even more memorable when it includes personal touches. Small details can transform a beautiful piece into an unforgettable experience." },
    { type: 'p', text: "• <strong>Add a Personal Message:</strong> A heartfelt note expressing your feelings can make the gift emotionally valuable.<br/>• <strong>Choose the Right Moment:</strong> Surprising her during a special occasion or unexpected moment makes the experience more meaningful.<br/>• <strong>Select a Design with Meaning:</strong> Choose jewellery that represents a memory, personality trait, or special connection.<br/>• <strong>Present It Thoughtfully:</strong> Beautiful packaging and a memorable presentation can enhance the excitement of receiving the gift." },
    { type: 'p', text: "The effort behind the gift often becomes as meaningful as the jewellery itself." },

    { type: 'h', text: "Why Jewellery Is Better Than Traditional Gifts" },
    { type: 'p', text: "Many gifts may create temporary happiness, but jewellery offers lasting emotional value. Unlike flowers, chocolates, or other short-term presents, jewellery becomes something she can keep and treasure." },

    { type: 'h', text: "Benefits of Choosing Jewellery Gifts" },
    { type: 'p', text: "• Long-lasting and meaningful<br/>• Suitable for every occasion<br/>• Represents love and appreciation<br/>• Becomes a personal keepsake<br/>• Can be worn and enjoyed regularly" },
    { type: 'p', text: "A <strong>jewellery gift for girlfriend</strong> is not just about beauty—it is about creating a memory that lasts." },

    { type: 'h', text: "Trending Jewellery Styles for Girlfriend Gifts" },
    { type: 'p', text: "Modern jewellery trends focus on designs that combine elegance, comfort, and everyday wearability. Choosing a trendy yet timeless piece ensures your gift feels stylish and meaningful." },
    { type: 'p', text: "Popular styles include:<br/>• <strong>Minimal Gold Jewellery:</strong> Simple gold designs offer timeless elegance and effortless styling.<br/>• <strong>Layered Jewellery Pieces:</strong> Layering allows her to create personalised looks with bracelets and pendants.<br/>• <strong>Elegant Everyday Jewellery:</strong> Lightweight pieces that transition from casual to formal occasions are always appreciated.<br/>• <strong>Modern Classic Designs:</strong> Contemporary jewellery with timeless elements creates a perfect balance between fashion and elegance." },

    { type: 'h', text: "Gift Jewellery for Every Budget" },
    { type: 'p', text: "A meaningful jewellery gift does not always need to be extravagant. Thoughtful designs at different price points can create equally special moments." },

    { type: 'h', text: "Affordable Jewellery Gifts" },
    { type: 'p', text: "• Minimal earrings<br/>• Simple bracelets<br/>• Elegant pendants" },

    { type: 'h', text: "Premium Jewellery Gifts" },
    { type: 'p', text: "• Gold rings<br/>• Luxury bracelets<br/>• Statement jewellery pieces" },

    { type: 'p', text: "The value of a jewellery gift comes from the emotion behind it and the thoughtfulness of the choice." },

    { type: 'h', text: "Why Choose Barosche for Jewellery Gifts for Girlfriend" },
    { type: 'p', text: "At Barosche, we believe that every <strong>jewellery gift for girlfriend</strong> should be more than just a beautiful accessory—it should carry emotions, memories, and a story of your special relationship. A thoughtfully chosen piece of jewellery reflects love, appreciation, and the unique bond you share, making every gifting moment more meaningful." },
    { type: 'p', text: "Our designs are created for modern women who appreciate elegance, simplicity, and timeless style. We focus on creating jewellery that feels special for romantic occasions while remaining comfortable and versatile enough for everyday wear." },

    { type: 'h', text: "What Makes Us Special" },

    { type: 'h', text: "1. Minimalist Luxury Designs" },
    { type: 'p', text: "Our jewellery reflects a modern approach to luxury, featuring refined designs that combine simplicity with sophistication. Each piece is created to enhance her personal style while offering an elegant and timeless appeal." },

    { type: 'h', text: "2. Premium Craftsmanship" },
    { type: 'p', text: "Every Barosche piece is crafted with careful attention to detail, quality, and finishing. From the design process to the final touch, we focus on creating jewellery that offers lasting beauty and a premium feel." },

    { type: 'h', text: "3. Perfect for Romantic Gifting" },
    { type: 'p', text: "Whether it is a birthday, anniversary, Valentine's Day, relationship milestone, or a surprise gesture, our collections are designed to help you find meaningful jewellery gifts that express your feelings in a special way." },

    { type: 'h', text: "4. Everyday Elegance" },
    { type: 'p', text: "We create jewellery that blends beauty with comfort. Lightweight designs and versatile styles allow her to wear your gift effortlessly, making it a part of her everyday moments and special occasions." },

    { type: 'h', text: "5. Timeless Style & Lasting Memories" },
    { type: 'p', text: "At Barosche, we believe the best gifts are those that remain meaningful over time. A carefully selected ring, bracelet, earring, or pendant becomes more than jewellery—it becomes a cherished reminder of your love and the memories you create together." },

    { type: 'p', text: "Choosing Barosche means giving more than just a jewellery piece—it means giving a lasting expression of affection, elegance, and a symbol of your relationship that she can treasure for years to come." },

    { type: 'h', text: "Make Her Feel Special with the Perfect Jewellery Gift" },
    { type: 'p', text: "A carefully selected jewellery gift for a girlfriend is more than just an accessory—it is an expression of love, care, and appreciation. Whether you are searching for a gold ring gift for your girlfriend, a romantic surprise, or timeless jewellery gifts, Barosche offers elegant <a href='https://barosche.com/' style='color: #007bff; text-decoration: underline;'>fine jewellery online</a> designs created to celebrate your special bond." },
    { type: 'p', text: "Explore our collection and find the perfect jewellery piece that makes every moment unforgettable." },
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
export default function Girlfriend() {
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