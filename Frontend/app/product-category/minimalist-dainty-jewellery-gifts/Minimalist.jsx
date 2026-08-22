'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './Minimalist.css';
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
    pageTitle: "Minimalist Gold Jewellery Gifts – Dainty Everyday Elegance",
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
     {
        q: "What are minimalist dainty jewellery gifts?",
        a: "Minimalist dainty jewellery gifts are elegant jewellery pieces designed with simple details, delicate shapes, and refined finishes. They are perfect for women who appreciate subtle elegance and timeless accessories that can be worn every day."
    },
    {
        q: "Why is minimalist jewellery a good gift for her?",
        a: "Minimalist jewellery makes a thoughtful gift because it combines beauty, simplicity, and emotional value. A delicate jewellery piece can represent love, appreciation, and special memories while becoming a part of her everyday style."
    },
    {
        q: "What are the best minimalist jewellery gifts for women?",
        a: "Popular minimalist jewellery gifts for women include delicate gold rings, lightweight bracelets, elegant earrings, and dainty pendants. These pieces are versatile, stylish, and suitable for different personalities and occasions."
    },
    {
        q: "What makes dainty gold jewellery a meaningful gift?",
        a: "A dainty gold jewellery gift combines timeless beauty with sentimental value. Its elegant design makes it a thoughtful way to express love, appreciation, and care while offering a piece she can cherish for years."
    },
    {
        q: "Is minimalist jewellery suitable for everyday wear?",
        a: "Yes, minimalist jewellery is ideal for everyday wear because of its lightweight designs and comfortable style. Delicate rings, bracelets, earrings, and pendants can easily complement daily outfits without feeling heavy."
    },
    {
        q: "What is an everyday jewellery gift?",
        a: "An everyday jewellery gift is a piece designed for regular use while maintaining elegance and comfort. Minimalist rings, fine bracelets, subtle earrings, and simple pendants are excellent choices for everyday wear."
    },
    {
        q: "Are minimalist gold rings good gifts for her?",
        a: "Yes, minimalist gold rings are beautiful gifts for women who appreciate simple and elegant designs. They can symbolize love, appreciation, special memories, or important milestones."
    },
    {
        q: "What occasions are suitable for gifting minimalist jewellery?",
        a: "Minimalist jewellery is suitable for birthdays, anniversaries, Valentine’s Day, festivals, relationship milestones, achievements, and even surprise gifts without a specific occasion."
    },
    {
        q: "Why are dainty jewellery gifts becoming popular?",
        a: "Dainty jewellery gifts are popular because they offer a perfect balance of elegance, comfort, and versatility. Their subtle designs suit modern lifestyles and can be styled with different outfits."
    },
    {
        q: "What jewellery should I gift if she prefers simple designs?",
        a: "If she prefers simple jewellery, consider minimalist gold rings, delicate bracelets, small earrings, or elegant pendants. These designs provide a refined look while matching her understated style."
    },
    {
        q: "Can minimalist jewellery be worn with different outfits?",
        a: "Yes, minimalist jewellery is highly versatile and can be paired with casual, professional, and special occasion outfits. Its timeless design allows it to complement different fashion styles effortlessly."
    },
    {
        q: "How do I choose the right minimalist jewellery gift for her?",
        a: "To choose the right gift, consider her personal style, the jewellery she already wears, her lifestyle, and the occasion. Selecting a piece that matches her preferences makes the gift more meaningful."
    },
    {
        q: "Are minimalist jewellery pieces suitable for romantic gifts?",
        a: "Yes, minimalist jewellery makes a romantic gift because it represents thoughtfulness, affection, and the special connection between two people. A delicate piece can become a lasting reminder of your relationship."
    },
    {
        q: "What is included in an everyday fine jewellery gift set?",
        a: "An everyday fine jewellery gift set may include coordinated pieces such as delicate earrings, elegant rings, fine bracelets, and minimalist pendants designed to complement each other."
    },
    {
        q: "Why choose minimalist gold jewellery over bold designs?",
        a: "Minimalist gold jewellery offers timeless elegance and everyday versatility. Unlike bold statement pieces, delicate designs can be worn regularly and remain stylish across changing trends."
    },
    {
        q: "Are minimalist jewellery gifts suitable for all age groups?",
        a: "Yes, minimalist jewellery gifts are suitable for women of different ages because their elegant and timeless designs complement various styles and preferences."
    },
    {
        q: "How can I make a minimalist jewellery gift more personal?",
        a: "You can make the gift more personal by choosing a design that reflects her personality, selecting a piece connected to a special memory, or choosing jewellery that matches her everyday style."
    },
    {
        q: "Why choose Barosche for minimalist jewellery gifts?",
        a: "Barosche offers thoughtfully designed minimalist jewellery that combines refined aesthetics, premium craftsmanship, comfort, and timeless appeal. Each piece is created to make gifting moments more meaningful."
    },
    {
        q: "How should minimalist jewellery be cared for?",
        a: "To maintain the beauty of minimalist jewellery, store pieces in a jewellery box or soft pouch, avoid contact with harsh chemicals, clean gently with a soft cloth, and remove jewellery during heavy activities."
    },
    {
        q: "Why is minimalist jewellery considered a timeless gift?",
        a: "Minimalist jewellery is considered timeless because its simple and elegant designs remain beautiful beyond changing trends. A carefully chosen piece becomes a lasting keepsake filled with memories and emotional value."
    }
];

// ─────────────────────────────────────────────────────────
//  FASHION JEWELLERY CONTENT DATA — Luxury Jewellery Gifts
// ─────────────────────────────────────────────────────────
const fashionJewelleryContent = [
    { type: 'h', text: "Minimalist Dainty Jewellery Gifts – Elegant Everyday Jewellery for Her" },
    { type: 'p', text: "Finding the perfect gift for her becomes more meaningful when you choose something that reflects her personality, lifestyle, and everyday elegance. <strong>Minimalist dainty jewellery gifts</strong> are a beautiful way to express love, appreciation, and thoughtfulness through timeless designs that feel personal, sophisticated, and effortlessly stylish." },
    { type: 'p', text: "Unlike bold statement pieces, minimalist jewellery focuses on simplicity, subtle beauty, and refined details. Its charm lies in the delicate craftsmanship, clean designs, and elegant appearance that make each piece suitable for everyday wear. A carefully selected jewellery piece can complement her personal style while carrying emotional value, making it a thoughtful gift she can wear and cherish for years." },
    { type: 'p', text: "Minimalist jewellery is perfect for women who appreciate understated luxury and timeless designs. Whether she prefers simple accessories, classic elegance, or modern fashion, delicate jewellery pieces blend beautifully with different styles and occasions. A lightweight ring, graceful bracelet, elegant earrings, or refined pendant can become an everyday favourite while reminding her of the special person who gifted it." },
    { type: 'p', text: "At Barosche, we offer a carefully curated collection of elegant <strong>minimalist gold jewellery</strong> designed for modern women who appreciate refined beauty, effortless sophistication, and timeless appeal. Each piece is thoughtfully crafted with attention to detail, combining premium craftsmanship, comfortable wearability, and versatile designs that suit everyday moments as well as special occasions." },
    { type: 'p', text: "Whether you are searching for a <strong>dainty gold jewellery gift</strong>, a romantic surprise, or an <strong>everyday jewellery gift</strong>, Barosche helps you discover meaningful pieces that celebrate her individuality. Our collection includes delicate rings, graceful bracelets, elegant earrings, and refined pendants designed to add a subtle touch of luxury to her jewellery collection." },
    { type: 'p', text: "A <strong>minimalist jewellery gift for her</strong> is more than just an accessory—it is a symbol of care, appreciation, and the beautiful moments you share together. Unlike temporary gifts, a timeless jewellery piece becomes a lasting keepsake connected to memories, emotions, and special occasions." },
    { type: 'p', text: "Whether it is her birthday, anniversary, Valentine’s Day, a relationship milestone, or simply a thoughtful gesture to show your love, minimalist jewellery makes a meaningful choice. Choose an elegant jewellery piece from Barosche that enhances her everyday style, reflects her personality, and creates memories she will cherish forever." },

    // ── SECTION 2 ──
    { type: 'h', text: "Why Minimalist Jewellery Makes the Perfect Gift for Her" },
    { type: 'p', text: "Minimalist jewellery has become a popular choice for women who appreciate elegant designs that are simple, sophisticated, and timeless. Unlike bold statement pieces, minimalist jewellery focuses on subtle beauty, refined details, and effortless style. Its charm comes from the ability to add a touch of elegance without overpowering her overall look." },
    { type: 'p', text: "When choosing a gift for someone special, many people look for something that feels meaningful, personal, and memorable without being overly extravagant. <strong>Minimalist jewellery offers the perfect balance between elegance, practicality, and emotional value</strong>, making it an ideal choice for birthdays, anniversaries, romantic occasions, milestones, or thoughtful everyday surprises." },
    { type: 'p', text: "A carefully selected delicate jewellery piece is not just an accessory—it becomes a reflection of her personality, a reminder of special moments, and a lasting symbol of appreciation. From simple gold rings to graceful bracelets, elegant earrings, and refined pendants, minimalist designs offer beauty that she can enjoy every day." },
    { type: 'h3', text: "1. Timeless & Elegant Designs" },
    { type: 'p', text: "Minimalist jewellery is created with simplicity and sophistication in mind. Clean lines, delicate shapes, and refined finishes create pieces that remain stylish beyond changing fashion trends. The beauty of minimalist designs lies in their ability to look elegant today while maintaining their charm for years to come." },
    { type: 'p', text: "A dainty jewellery piece can become a long-lasting favourite because of its effortless appeal and versatility. Whether paired with casual outfits or special occasion looks, minimalist jewellery adds a graceful finishing touch while maintaining a sophisticated appearance." },
    { type: 'h3', text: "2. Perfect for Everyday Wear" },
    { type: 'p', text: "One of the biggest advantages of minimalist jewellery is its comfort and everyday versatility. Lightweight rings, delicate bracelets, subtle earrings, and elegant pendants are designed to be worn comfortably throughout the day." },
    { type: 'p', text: "An <strong>everyday jewellery gift</strong> allows her to enjoy your thoughtful gesture regularly while adding a refined touch to her daily style. Whether she is heading to work, meeting friends, or attending a special event, its comfortable design and timeless appeal mean dainty jewellery often becomes a part of her everyday routine, making it a meaningful gift that she can continue to appreciate." },
    { type: 'h3', text: "3. Personal & Meaningful" },
    { type: 'p', text: "Small details often create the biggest emotional impact. A carefully chosen minimalist jewellery piece reflects attention, understanding, and appreciation for her unique personality and style." },
    { type: 'p', text: "Whether it represents love, a special memory, a relationship milestone, or a personal achievement, a delicate jewellery gift carries a deeper emotional connection. Every time she wears the piece, it can remind her of the thoughtful gesture and the special moment behind the gift." },
    { type: 'p', text: "A meaningful jewellery choice shows that you have considered her preferences and selected something that truly represents her." },
    { type: 'h3', text: "4. Matches Every Style" },
    { type: 'p', text: "One of the reasons minimalist jewellery makes such a perfect gift is its ability to complement different personalities and fashion preferences. Whether she loves classic elegance, modern fashion, or simple everyday looks, dainty jewellery blends beautifully with her personal style." },
    { type: 'p', text: "Minimalist gold jewellery can be styled individually for a subtle appearance or combined with other jewellery pieces for a layered and fashionable look. Its versatility makes it suitable for women of all styles and ages." },
    { type: 'p', text: "Choosing minimalist jewellery means giving her a gift that feels elegant, personal, and timeless—something she can wear, enjoy, and cherish for years to come." },

    // ── SECTION 3 ──
    { type: 'h', text: "Explore Our Minimalist Dainty Jewellery Gifts Collection" },
    { type: 'p', text: "At Barosche, our <strong>minimalist dainty jewellery gifts</strong> collection is thoughtfully designed for women who appreciate understated luxury, elegant simplicity, and timeless beauty. Each piece reflects modern sophistication through delicate designs, refined details, and comfortable craftsmanship, making it perfect for everyday moments as well as special occasions." },
    { type: 'p', text: "Minimalist jewellery celebrates the beauty of simplicity. Instead of bold designs, these pieces focus on subtle elegance, allowing her personal style to shine through. Whether she prefers classic jewellery, modern accessories, or effortless everyday looks, our collection offers versatile designs that complement different personalities and fashion preferences." },
    { type: 'p', text: "Our collection includes elegant jewellery pieces that make thoughtful gifts for birthdays, anniversaries, Valentine’s Day, relationship milestones, festivals, achievements, or simply as a surprise to show your love and appreciation. Each piece is created to become more than just an accessory—it becomes a meaningful reminder of special moments and emotions." },
    { type: 'p', text: "From delicate gold rings and graceful bracelets to elegant earrings and refined pendants, Barosche offers timeless jewellery gifts that combine beauty, comfort, and sentimental value." },
    { type: 'h3', text: "1. <a href='/product-category/rings/' style='color: #007bff; text-decoration: underline;'>Minimalist Gold Rings</a> – Elegant Everyday Gifts" },
    { type: 'p', text: "A <strong>minimalist gold ring</strong> is a beautiful choice for women who love subtle elegance and timeless sophistication. Designed with clean details, delicate shapes, and refined finishes, these rings offer a graceful look that works effortlessly for everyday wear." },
    { type: 'p', text: "Unlike traditional statement rings, minimalist gold rings focus on simplicity and versatility. Their elegant designs allow them to be worn alone for a sophisticated appearance or paired with other rings to create a modern layered style." },
    { type: 'p', text: "A delicate gold ring can symbolize love, appreciation, connection, and special memories. Whether gifted for a birthday, anniversary, romantic occasion, or simply as a thoughtful surprise, it becomes a meaningful piece she can cherish for years." },
    { type: 'p', text: "A <strong>dainty gold jewellery gift</strong> like a minimalist ring is perfect for someone who appreciates classic beauty with a contemporary touch. Its timeless design makes it suitable for different outfits, occasions, and personal styles." },
    { type: 'h3', text: "2. <a href='/product-category/bracelets/' style='color: #007bff; text-decoration: underline;'>Delicate Gold Bracelets</a> – Simple Yet Sophisticated" },
    { type: 'p', text: "Minimalist bracelets are elegant gifts that combine beauty, comfort, and everyday versatility. Their lightweight designs make them ideal for women who prefer jewellery that feels effortless while adding a refined touch to their appearance." },
    { type: 'p', text: "A delicate gold bracelet can enhance both casual and formal looks. Whether worn individually for a minimal style or layered with other bracelets for a fashionable appearance, it offers endless styling possibilities." },
    { type: 'p', text: "As an <strong>everyday jewellery gift</strong>, a minimalist bracelet provides both practicality and emotional value. Every time she wears it, it becomes a reminder of the thought and care behind your gift." },
    { type: 'p', text: "Perfect for birthdays, anniversaries, romantic gestures, or everyday surprises, a graceful bracelet is a timeless addition to her jewellery collection." },
    { type: 'h3', text: "3. <a href='/product-category/earrings/' style='color: #007bff; text-decoration: underline;'>Minimalist Earrings</a> – Timeless Everyday Elegance" },
    { type: 'p', text: "Dainty earrings are among the most versatile jewellery gifts for her. Their elegant and simple designs make them suitable for different occasions, from daily wear to special celebrations." },
    { type: 'p', text: "Minimalist earrings add a polished finishing touch without overpowering her overall style. They are perfect for women who appreciate refined accessories that offer effortless beauty and comfort." },
    { type: 'p', text: "From subtle studs to elegant designs, minimalist earrings can complement different fashion choices and personalities. They are easy to wear, easy to style, and suitable for almost every occasion." },
    { type: 'p', text: "A pair of delicate earrings makes a thoughtful jewellery gift that she can enjoy regularly while adding timeless elegance to her everyday looks." },
    { type: 'h3', text: "4. <a href='/product-category/pendants/' style='color: #007bff; text-decoration: underline;'>Dainty Gold Pendants</a> – Meaningful & Personal Gifts" },
    { type: 'p', text: "A delicate pendant is a meaningful jewellery gift that allows you to express emotions in a personal and elegant way. Pendants can represent love, memories, special connections, or important milestones, making them a thoughtful choice for someone special." },
    { type: 'p', text: "<strong>Minimalist gold pendants</strong> offer a refined appearance while maintaining a timeless appeal. Their subtle designs make them perfect for everyday wear, whether styled alone for a simple look or layered with other necklaces for a modern fashion statement." },
    { type: 'p', text: "A carefully selected pendant becomes more than just jewellery—it becomes a personal keepsake connected to special moments and emotions. Every time she wears it, it can remind her of the memories and feelings associated with the gift." },
    { type: 'h3', text: "5. <a href='/product-category/jewellery/' style='color: #007bff; text-decoration: underline;'>Everyday Fine Jewellery Gift Set</a> – Complete Elegant Gift Choice" },
    { type: 'p', text: "An <strong>everyday fine jewellery gift set</strong> is a perfect option for those looking to give a complete and coordinated jewellery experience. Carefully matched pieces create a sophisticated collection that she can style in multiple ways." },
    { type: 'p', text: "<strong>A minimalist jewellery set can include:</strong><br/>• Delicate gold earrings<br/>• Elegant rings<br/>• Graceful bracelets<br/>• Refined pendants" },
    { type: 'p', text: "These pieces are designed to work beautifully together while offering versatility for everyday styling." },
    { type: 'p', text: "An everyday fine jewellery gift set makes a thoughtful choice for women who appreciate elegant designs, effortless fashion, and timeless accessories." },

    // ── SECTION 4 ──
    { type: 'h', text: "Everyday Fine Jewellery Gift Set – A Complete Elegant Choice" },
    { type: 'p', text: "An <strong>everyday fine jewellery gift set</strong> is an excellent choice when you want to give something coordinated, meaningful, and effortlessly stylish. Instead of selecting a single piece, a thoughtfully curated jewellery set allows her to enjoy multiple elegant designs that can be worn together or styled individually for different occasions." },
    { type: 'p', text: "A minimalist jewellery set combines simplicity, sophistication, and versatility, making it perfect for women who appreciate refined beauty and timeless accessories. Each piece is designed to complement her personal style while adding a subtle touch of luxury to her everyday looks." },
    { type: 'p', text: "Unlike heavy statement jewellery, an everyday fine jewellery gift set focuses on delicate craftsmanship, comfortable designs, and effortless elegance. These pieces are lightweight, easy to style, and suitable for daily wear, making them a thoughtful gift choice that she can enjoy regularly." },
    { type: 'p', text: "<strong>A minimalist jewellery set can include:</strong><br/>• <strong>Delicate Gold Earrings:</strong> Elegant gold earrings add a refined finishing touch to any outfit. Their subtle designs make them perfect for everyday wear while offering a sophisticated appearance for special occasions.<br/>• <strong>Elegant Rings:</strong> Minimalist rings bring timeless beauty through clean designs and graceful details. They can be worn individually for a simple look or combined with other rings to create a modern layered style.<br/>• <strong>Fine Bracelets:</strong> A delicate bracelet adds charm and elegance to her jewellery collection. Designed for comfort and versatility, it can be styled with casual outfits as well as formal looks.<br/>• <strong>Minimal Pendants:</strong> A refined pendant adds a personal touch to everyday jewellery styling. Its simple yet elegant design makes it a meaningful piece that can represent special memories and connections." },
    { type: 'p', text: "These pieces are designed to complement each other while offering endless styling possibilities. She can wear the complete set for a coordinated, elegant look or mix individual pieces with her existing jewellery collection to create a personalized style." },
    { type: 'p', text: "An <strong>everyday fine jewellery gift set</strong> is perfect for women who appreciate understated luxury, refined designs, and effortless elegance. Whether gifted for a birthday, anniversary, Valentine’s Day, relationship milestone, or simply as a thoughtful surprise, a beautifully crafted jewellery set becomes a timeless expression of love, appreciation, and care." },

    // ── SECTION 5 ──
    { type: 'h', text: "Minimalist Jewellery Gifts for Every Occasion" },
    { type: 'p', text: "Minimalist jewellery is one of the most versatile gifting choices because of its timeless beauty, subtle elegance, and everyday wearability. Unlike trend-focused accessories, delicate jewellery pieces maintain their charm over time and can become a meaningful part of her personal collection. Whether you are celebrating a special milestone or simply want to show your appreciation, a thoughtfully chosen minimalist jewellery gift can create a lasting emotional connection." },
    { type: 'p', text: "At Barosche, our minimalist gold jewellery designs are created for modern women who appreciate simplicity, sophistication, and effortless style. Each piece is designed to complement different occasions while offering the perfect balance of elegance and comfort." },
    { type: 'h3', text: "1. Birthday Gifts" },
    { type: 'p', text: "A birthday is a beautiful opportunity to celebrate her personality, style, and individuality. A delicate jewellery piece makes a thoughtful birthday gift because it reflects care, attention, and the effort behind choosing something special." },
    { type: 'p', text: "A minimalist gold ring, elegant bracelet, refined earrings, or dainty pendant can add a personal touch to her celebration. These timeless designs become more than just accessories—they become cherished reminders of the special day and the emotions behind your gift." },
    { type: 'h3', text: "2. Anniversary Gifts" },
    { type: 'p', text: "Anniversaries celebrate love, connection, and the beautiful journey two people share together. A minimalist jewellery gift is a meaningful way to express appreciation and celebrate the memories you have created." },
    { type: 'p', text: "A delicate gold jewellery piece can symbolize your bond, commitment, and the special moments you have experienced together. Whether it is a simple ring, graceful bracelet, or elegant pendant, minimalist jewellery creates a timeless reminder of your relationship." },
    { type: 'h3', text: "3. Valentine’s Day Gifts" },
    { type: 'p', text: "Valentine’s Day is a perfect occasion to express love and affection through a thoughtful gesture. A dainty jewellery gift offers a romantic yet elegant way to show how much she means to you." },
    { type: 'p', text: "A minimalist gold jewellery piece combines beauty with emotional meaning, making it a memorable surprise she can wear and cherish. From delicate earrings to meaningful pendants, each design adds a personal touch to this special celebration of love." },
    { type: 'h3', text: "4. Everyday Surprise Gifts" },
    { type: 'p', text: "The most meaningful gifts are sometimes the ones given without a specific occasion. A simple jewellery surprise can turn an ordinary day into a memorable moment and show her how much you appreciate her." },
    { type: 'p', text: "An everyday jewellery gift such as a lightweight bracelet, minimalist ring, or delicate pendant allows her to enjoy your thoughtful gesture regularly. These subtle designs blend effortlessly with her daily style while carrying the emotional value of your appreciation." },
    { type: 'h3', text: "5. Achievement Gifts" },
    { type: 'p', text: "Celebrating her achievements with a meaningful gift is a wonderful way to show pride, encouragement, and support. Whether it is a career milestone, personal accomplishment, or a new beginning, minimalist jewellery makes a sophisticated choice." },
    { type: 'p', text: "A refined jewellery piece represents confidence, growth, and success while becoming a lasting reminder of her achievements. A carefully selected dainty gold jewellery gift allows you to celebrate her journey with elegance and thoughtfulness." },
    { type: 'h3', text: "<strong>Thoughtful Gifts That Last Beyond the Occasion</strong>" },
    { type: 'p', text: "No matter the celebration, minimalist jewellery offers a beautiful combination of simplicity, elegance, and emotional value. A carefully chosen piece from Barosche becomes more than a gift—it becomes a timeless symbol of appreciation, love, and unforgettable memories she can cherish for years." },

    // ── SECTION 6 ──
    { type: 'h', text: "How to Choose the Perfect Minimalist Jewellery Gift for Her" },
    { type: 'p', text: "Choosing the right minimalist jewellery gift for her is about finding a piece that reflects her personality, lifestyle, and the special bond you share. The beauty of minimalist jewellery lies in its simplicity—it does not need to be bold or extravagant to make a meaningful impression. A carefully selected delicate piece can express love, appreciation, and thoughtfulness while becoming a timeless part of her jewellery collection." },
    { type: 'p', text: "Before selecting a gift, consider her everyday style, the type of jewellery she enjoys wearing, and the occasions where she would love to wear it. A meaningful jewellery gift should feel personal, comfortable, and naturally connected to her preferences." },
    { type: 'h3', text: "1. Understand Her Style" },
    { type: 'p', text: "Every woman has her own unique sense of style. Pay attention to the jewellery she already wears and notice whether she prefers simple, classic, elegant, or modern designs." },
    { type: 'p', text: "If she enjoys subtle accessories, minimalist gold rings, delicate bracelets, and dainty pendants can be perfect choices. For someone who prefers a little more elegance, refined designs with thoughtful details can add a sophisticated touch while still maintaining a minimalist appeal." },
    { type: 'p', text: "Choosing a jewellery piece that matches her personality shows that you understand her preferences and have selected something especially for her." },
    { type: 'h3', text: "2. Select Comfortable Designs" },
    { type: 'p', text: "Comfort plays an important role when choosing everyday jewellery. Minimalist jewellery is loved because of its lightweight designs and effortless wearability." },
    { type: 'p', text: "Delicate rings, fine bracelets, subtle earrings, and elegant pendants are ideal choices for women who enjoy jewellery that feels comfortable throughout the day. A comfortable jewellery piece allows her to wear and enjoy your gift regularly, making it a meaningful part of her everyday style." },
    { type: 'h3', text: "3. Choose Timeless Pieces" },
    { type: 'p', text: "The best jewellery gifts are those that remain beautiful beyond changing trends. Minimalist designs are known for their timeless appeal, making them a valuable addition to any jewellery collection. Classic gold jewellery, simple geometric designs, and elegant fine jewellery pieces maintain their charm over the years. Choosing a timeless design ensures that your gift continues to feel special and stylish for a long time." },
    { type: 'h3', text: "4. Consider the Meaning Behind the Gift" },
    { type: 'p', text: "A jewellery gift becomes even more special when it carries emotional meaning. Think about the memories you share, important milestones, or the feelings you want to express through your gift." },
    { type: 'p', text: "A delicate pendant can represent a special connection, a gold ring can symbolize love and appreciation, and a bracelet can become a reminder of a beautiful moment together. Choosing a piece with personal significance transforms it from a simple accessory into a cherished keepsake." },
    { type: 'h3', text: "5. Match the Occasion" },
    { type: 'p', text: "Consider the reason behind gifting the jewellery. A romantic occasion, birthday, anniversary, achievement, or simple surprise may inspire different choices." },
    { type: 'p', text: "For everyday gifts, minimalist designs offer versatility and comfort, while slightly more refined pieces can make special occasions feel even more memorable." },
    { type: 'h3', text: "6. Focus on Quality & Craftsmanship" },
    { type: 'p', text: "Even simple jewellery designs require attention to detail and quality craftsmanship. Choose pieces that combine elegant design, durability, and a premium finish to ensure they remain beautiful over time." },
    { type: 'p', text: "A well-crafted minimalist jewellery gift reflects thoughtfulness and allows her to enjoy a piece that feels special every time she wears it." },
    { type: 'h3', text: "7. Create a Meaningful Gift Experience" },
    { type: 'p', text: "A thoughtfully chosen minimalist jewellery piece is more than just an accessory—it is a symbol of love, appreciation, and the memories you create together. By considering her style, comfort, preferences, and the meaning behind the gift, you can choose a timeless piece that she will love, wear, and cherish for years." },

    // ── SECTION 7 ──
    { type: 'h', text: "Why Choose Barosche for Minimalist Jewellery Gifts" },
    { type: 'p', text: "At Barosche, we believe that true elegance lies in simplicity, thoughtful design, and exceptional craftsmanship. Our minimalist jewellery collection is created for modern women who appreciate understated luxury, timeless beauty, and jewellery that feels personal. Each piece is thoughtfully designed to complement her individual style while adding a refined touch to everyday moments." },
    { type: 'p', text: "Whether you are searching for a <strong>minimalist jewellery gift for her</strong>, a <strong>dainty gold jewellery gift</strong>, or an elegant <strong>everyday jewellery gift</strong>, Barosche offers carefully crafted designs that combine sophistication, comfort, and lasting beauty." },
    { type: 'h3', text: "1. Refined Minimalist Designs" },
    { type: 'p', text: "Our minimalist jewellery collection focuses on clean lines, delicate details, and effortless elegance. Each design is created to offer a sophisticated appearance without being overly bold, making it perfect for women who appreciate subtle luxury." },
    { type: 'p', text: "From delicate gold rings and elegant bracelets to graceful earrings and timeless pendants, every piece reflects a modern approach to jewellery design. These versatile styles can easily complement different outfits, making them suitable for both everyday wear and special occasions." },
    { type: 'h3', text: "2. Premium Craftsmanship" },
    { type: 'p', text: "At Barosche, every jewellery piece is created with careful attention to detail and quality. Our designs focus on achieving a beautiful finish, refined appearance, and lasting appeal." },
    { type: 'p', text: "From the initial concept to the final design, each piece reflects thoughtful craftsmanship and a commitment to creating jewellery that feels special. A well-crafted minimalist jewellery piece becomes more than an accessory—it becomes a treasured addition to her collection." },
    { type: 'h3', text: "3. Perfect Everyday Wear" },
    { type: 'p', text: "Minimalist jewellery is loved for its comfort, versatility, and effortless style. At Barosche, our designs are created to fit seamlessly into her daily lifestyle while maintaining a sophisticated look." },
    { type: 'p', text: "Lightweight rings, delicate bracelets, subtle earrings, and elegant pendants allow her to enjoy beautiful jewellery throughout the day. Whether paired with casual outfits, workwear, or special occasion looks, our pieces add a refined touch without feeling overwhelming." },
    { type: 'h3', text: "4. Meaningful Gifting Options" },
    { type: 'p', text: "A jewellery gift becomes truly special when it carries emotion and personal meaning. Barosche offers elegant minimalist designs that help you express love, appreciation, and thoughtfulness through timeless pieces." },
    { type: 'p', text: "Whether you want to celebrate a birthday, anniversary, Valentine’s Day, relationship milestone, achievement, or simply surprise someone special, our collection offers meaningful gifting options for every occasion." },
    { type: 'p', text: "A <strong>dainty gold jewellery gift</strong> can represent love and appreciation, while an <strong>everyday jewellery gift</strong> can become a beautiful reminder of your thoughtfulness that she enjoys wearing regularly." },
    { type: 'h3', text: "Timeless Jewellery That Creates Memories" },
    { type: 'p', text: "Choosing Barosche means giving more than just jewellery—it means giving a symbol of elegance, emotion, and unforgettable moments. Our minimalist jewellery designs are created to be cherished for years, making every gift a meaningful expression of your special bond." },

    // ── SECTION 8 ──
    { type: 'h', text: "Minimalist Gold Jewellery Trends for Modern Women" },
    { type: 'p', text: "Minimalist gold jewellery has become a favourite choice among modern women who prefer elegant designs with a subtle touch of luxury. Today’s jewellery trends focus on simplicity, versatility, and pieces that can be styled effortlessly for different occasions." },
    { type: 'p', text: "Unlike traditional heavy jewellery, minimalist designs highlight refined craftsmanship, delicate details, and everyday comfort. These timeless pieces allow women to express their personal style while maintaining an elegant and sophisticated appearance." },
    { type: 'p', text: "<strong>Modern minimalist jewellery trends include:</strong><br/>1. <strong>Delicate Gold Chains:</strong> Fine gold chains offer a simple yet elegant look that works beautifully for everyday styling. They can be worn alone for a minimal appearance or layered with pendants for a more personalized style.<br/>2. <strong>Stackable Rings:</strong> Stackable minimalist rings allow women to create unique combinations that reflect their personality. Mixing different designs creates a fashionable yet sophisticated jewellery look.<br/>3. <strong>Tiny Stud Earrings:</strong> Small gold stud earrings remain a timeless choice because they provide effortless elegance and comfortable everyday wear.<br/>4. <strong>Fine Bracelet Designs:</strong> Slim and delicate bracelets add a graceful touch to the wrist without appearing too bold, making them perfect for modern everyday fashion." },
    { type: 'p', text: "Minimalist gold jewellery continues to grow in popularity because it combines elegance, practicality, and timeless beauty." },

    // ── SECTION 9 ──
    { type: 'h', text: "Why Dainty Jewellery Gifts Are Perfect for Everyday Elegance" },
    { type: 'p', text: "A dainty jewellery gift offers the perfect balance between beauty and practicality. These delicate pieces are designed to enhance her natural style without overpowering her appearance." },
    { type: 'p', text: "Many women prefer jewellery that can transition effortlessly from daily routines to special occasions. A minimalist piece allows her to enjoy elegance every day while keeping her look sophisticated and refined." },
    { type: 'h3', text: "1. Lightweight & Comfortable" },
    { type: 'p', text: "Dainty jewellery is designed with comfort in mind. Lightweight rings, bracelets, earrings, and pendants can be worn throughout the day without feeling heavy or uncomfortable." },
    { type: 'h3', text: "2. Easy to Style" },
    { type: 'p', text: "Minimal jewellery works beautifully with different outfits, from casual clothing and office wear to evening dresses and festive looks." },
    { type: 'h3', text: "3. Suitable for Daily Use" },
    { type: 'p', text: "Unlike statement jewellery reserved for special occasions, dainty jewellery becomes a regular part of her lifestyle, making it a meaningful and practical gift." },
    { type: 'h3', text: "4. Elegant Without Being Overwhelming" },
    { type: 'p', text: "The beauty of minimalist jewellery lies in its subtle charm. It adds sophistication while allowing her personality and confidence to shine." },

    // ── SECTION 10 ──
    { type: 'h', text: "Romantic Minimalist Jewellery Gifts for Her" },
    { type: 'p', text: "A romantic gift is not defined by its size or price but by the emotions behind it. Minimalist jewellery makes a beautiful romantic choice because each piece can represent love, appreciation, and connection." },
    { type: 'p', text: "Whether you are celebrating a relationship milestone or simply want to surprise someone special, a delicate jewellery piece creates a memorable gifting experience." },
    { type: 'h3', text: "Romantic Gift Ideas:" },
    { type: 'p', text: "1. <a href='/product-category/rings/' style='color: #007bff; text-decoration: underline;'>Minimal Gold Ring</a>: A simple gold ring represents affection, commitment, and the special bond you share.<br/>2. <a href='/product-category/pendants/' style='color: #007bff; text-decoration: underline;'>Heart-Inspired Pendant</a>: A delicate pendant can symbolize love, connection, and meaningful memories.<br/>3. <a href='/product-category/bracelets/' style='color: #007bff; text-decoration: underline;'>Elegant Bracelet</a>: A graceful bracelet serves as a daily reminder of your appreciation and care.<br/>4. <a href='/product-category/earrings/' style='color: #007bff; text-decoration: underline;'>Classic Earrings</a>: Timeless earrings offer a beautiful way to celebrate her elegance and individuality." },
    { type: 'p', text: "A romantic minimalist jewellery gift becomes more than an accessory—it becomes a symbol of your emotions." },

    // ── SECTION 11 ──
    { type: 'h', text: "Minimalist Jewellery Gift Ideas Based on Her Personality" },
    { type: 'p', text: "Choosing jewellery according to her personality makes the gift more thoughtful and meaningful." },
    { type: 'h3', text: "<strong>For Women Who Love Simplicity</strong>" },
    { type: 'p', text: "Choose:<br/>• Minimal gold rings<br/>• Small earrings<br/>• Fine bracelets<br/>• Simple pendants" },
    { type: 'p', text: "These designs match women who appreciate clean and elegant styles." },
    { type: 'h3', text: "<strong>For Fashion-Focused Women</strong>" },
    { type: 'p', text: "Choose:<br/>• Layered necklaces<br/>• Stackable rings<br/>• Modern bracelet designs<br/>• Contemporary earrings" },
    { type: 'p', text: "These pieces allow her to experiment with different looks." },
    { type: 'h3', text: "<strong>For Classic Style Lovers</strong>" },
    { type: 'p', text: "Choose:<br/>• Timeless gold jewellery<br/>• Elegant pendants<br/>• Sophisticated earrings<br/>• Refined ring designs" },
    { type: 'p', text: "Classic jewellery remains beautiful across generations." },
    { type: 'h3', text: "<strong>For Everyday Jewellery Lovers</strong>" },
    { type: 'p', text: "Choose:<br/>• Lightweight bracelets<br/>• Comfortable rings<br/>• Minimal earrings<br/>• Everyday fine jewellery sets" },
    { type: 'p', text: "These pieces become part of her daily routine." },

    // ── SECTION 12 ──
    { type: 'h', text: "How Minimalist Jewellery Creates Emotional Connections" },
    { type: 'p', text: "Jewellery often carries memories that last much longer than the moment it is gifted. A minimalist jewellery piece may look simple, but its emotional value can be incredibly meaningful." },
    { type: 'p', text: "A delicate ring may remind her of a special celebration. A pendant may represent a shared memory. A bracelet may become a symbol of appreciation and love." },
    { type: 'p', text: "The emotional value of minimalist jewellery comes from:<br/>• The thought behind choosing the piece<br/>• The occasion connected with the gift<br/>• The memories created together<br/>• The personal meaning attached to the design" },
    { type: 'p', text: "This makes minimalist jewellery a timeless gift that continues to hold sentimental value." },

    // ── SECTION 13 (TABLE) ──
    { type: 'h', text: "Minimalist Jewellery Gift Guide: What to Choose?" },
    { type: 'p', text: "Choosing the right jewellery gift depends on her preferences, lifestyle, and the occasion." },
    {
        type: 'table',
        headers: ["Occasion", "Recommended Jewellery Gift"],
        rows: [
            ["Birthday", "Minimal gold ring or elegant earrings"],
            ["Anniversary", "Meaningful pendant or bracelet"],
            ["Valentine’s Day", "Romantic gold jewellery piece"],
            ["Everyday Surprise", "Lightweight bracelet or earrings"],
            ["Achievement Celebration", "Premium minimalist jewellery set"],
            ["Festival Gift", "Elegant gold jewellery design"],
        ],
    },
    { type: 'p', text: "A carefully selected jewellery piece from Barosche helps you celebrate every special moment beautifully." },

    // ── SECTION 14 ──
    { type: 'h', text: "How to Style Minimalist Gold Jewellery for Different Looks" },
    { type: 'p', text: "Minimalist jewellery offers endless styling possibilities because of its simple and elegant designs." },
    { type: 'p', text: "• <strong>Everyday Casual Look:</strong> Pair delicate earrings with a simple pendant and lightweight bracelet for an effortless daily style.<br/>• <strong>Office & Professional Style:</strong> Choose subtle rings and fine bracelets to create a polished and sophisticated appearance.<br/>• <strong>Evening & Special Occasion Look:</strong> Combine elegant earrings with layered necklaces or refined jewellery sets for a more elevated style.<br/>• <strong>Layered Jewellery Style:</strong> Mix different minimalist pieces together to create a personalized and fashionable look." },
    { type: 'p', text: "The versatility of minimalist jewellery allows her to express her individuality through every outfit." },

    // ── SECTION 15 (TABLE) ──
    { type: 'h', text: "The Difference Between Minimalist Jewellery and Statement Jewellery" },
    { type: 'p', text: "While statement jewellery focuses on bold designs and dramatic appearances, minimalist jewellery celebrates simplicity and elegance." },
    {
        type: 'table',
        headers: ["Minimalist Jewellery", "Statement Jewellery"],
        rows: [
            ["Simple designs", "Bold designs"],
            ["Everyday wear", "Occasion-focused"],
            ["Lightweight comfort", "Larger appearance"],
            ["Timeless appeal", "Trend-based styles"],
            ["Subtle elegance", "Eye-catching looks"],
        ],
    },
    { type: 'p', text: "For women who prefer versatile and long-lasting jewellery, minimalist designs are often the perfect choice." },

    // ── SECTION 16 ──
    { type: 'h', text: "Gift Packaging & Creating a Memorable Jewellery Experience" },
    { type: 'p', text: "A beautiful jewellery gift is not only about the piece itself but also about the overall experience. Thoughtful presentation can make the moment even more special." },
    { type: 'p', text: "<strong>A memorable jewellery gifting experience includes:</strong><br/>• Elegant packaging<br/>• A personal message<br/>• Choosing a meaningful design<br/>• Selecting a piece that matches her style" },
    { type: 'p', text: "At Barosche, every jewellery gift represents elegance, emotion, and thoughtful appreciation." },

    // ── SECTION 17 ──
    { type: 'h', text: "Make Every Moment Special with Minimalist Jewellery Gifts" },
    { type: 'p', text: "A beautiful jewellery gift does not need to be extravagant to feel special. Sometimes, the simplest designs carry the deepest emotions." },
    { type: 'p', text: "A <strong>minimalist gold jewellery gift</strong> represents elegance, thoughtfulness, and timeless beauty. Whether it is a delicate ring, bracelet, earrings, or pendant, the right piece becomes a lasting reminder of your appreciation through <a href='https://barosche.com/' style='color: #007bff; text-decoration: underline;'>minimalist jewellery</a>." },
    { type: 'p', text: "Explore Barosche’s collection of <strong>minimalist dainty jewellery gifts</strong> and discover elegant designs that she will love wearing and cherish for years to come." },
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
export default function Minimalist() {
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