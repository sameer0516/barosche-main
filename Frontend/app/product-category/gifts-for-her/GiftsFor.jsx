'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './GiftsFor.css';
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

// ─────────────────────────────
//  DEFAULT (English) UI STRINGS
// ─────────────────────────────
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
    pageTitle: "Gifts for Her – Thoughtful, Elegant Jewellery for Every Moment",
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
        q: "What are the best gifts for her?",
        a: "The best gifts for her are thoughtful, meaningful, and suited to her personality. Jewellery, such as rings, bracelets, earrings, and pendants, makes a timeless gift choice because it combines beauty, emotion, and lasting value."
    },
    {
        q: "Why is jewellery considered one of the best gifts for women?",
        a: "Jewellery is a meaningful gift because it represents love, appreciation, and special memories. Unlike temporary gifts, jewellery becomes a lasting keepsake that she can wear and cherish for years."
    },
    {
        q: "What are some unique gifts for her?",
        a: "Unique gifts for her include elegant jewellery pieces that reflect her personal style, such as minimalist rings, delicate bracelets, meaningful pendants, and sophisticated earrings."
    },
    {
        q: "What jewellery makes a good gift for her?",
        a: "Rings, bracelets, earrings, and pendants are popular jewellery gifts for her because they are elegant, versatile, and suitable for different personalities and occasions."
    },
    {
        q: "What is a meaningful gift for her?",
        a: "A meaningful gift is something chosen with thought and care. Jewellery becomes meaningful when it reflects her personality, celebrates a special moment, or represents your connection with her."
    },
    {
        q: "What are the best jewellery gift ideas for women?",
        a: "Some of the best jewellery gift ideas for women include elegant gold rings, lightweight bracelets, classic earrings, and timeless pendants that can be worn regularly."
    },
    {
        q: "What should I gift her on her birthday?",
        a: "A birthday jewellery gift such as a beautiful ring, bracelet, earrings, or pendant can make her celebration more special. Choose a design that matches her style and personality."
    },
    {
        q: "Is jewellery a good anniversary gift for her?",
        a: "Yes, jewellery is a perfect anniversary gift because it symbolizes love, commitment, and the memories you have created together as a couple."
    },
    {
        q: "What are some romantic gifts for her?",
        a: "Romantic gifts for her include meaningful jewellery pieces such as a delicate pendant, elegant bracelet, or a ring that represents love and appreciation."
    },
    {
        q: "How do I choose the perfect gift for her?",
        a: "To choose the perfect gift, consider her personal style, lifestyle, preferences, and the occasion. A thoughtful jewellery piece that matches her personality makes the gift more special."
    },
    {
        q: "Are minimalist jewellery designs good gifts for women?",
        a: "Yes, minimalist jewellery designs are excellent gifts because they offer timeless elegance, everyday comfort, and effortless styling."
    },
    {
        q: "What jewellery gift can I buy without knowing her size?",
        a: "Earrings and pendants are great options when you are unsure about size. Bracelets with adjustable designs can also be a thoughtful and practical choice."
    },
    {
        q: "Are gold rings good gifts for her?",
        a: "Yes, gold rings are timeless gifts that symbolize elegance, love, and special connections. They can be worn daily and become cherished keepsakes."
    },
    {
        q: "What makes luxury gifts for her special?",
        a: "Luxury gifts for her stand out because they combine premium craftsmanship, elegant design, and emotional value. A well-crafted jewellery piece creates a memorable gifting experience."
    },
    {
        q: "Can jewellery be an everyday gift for her?",
        a: "Yes, lightweight and versatile jewellery pieces are perfect for everyday wear. Minimal rings, simple earrings, delicate bracelets, and pendants can complement daily outfits."
    },
    {
        q: "What occasions are suitable for gifting jewellery?",
        a: "Jewellery is suitable for birthdays, anniversaries, Valentine’s Day, weddings, festivals, achievements, milestones, and even surprise gestures without a specific occasion."
    },
    {
        q: "Why choose Barosche for gifts for her?",
        a: "Barosche offers thoughtfully designed jewellery that combines minimalist luxury, premium craftsmanship, and everyday elegance, making each piece a meaningful gift choice."
    },
    {
        q: "How can I make a jewellery gift more personal?",
        a: "You can make a jewellery gift more personal by choosing a design that matches her style, represents a special memory, or connects with an important moment in your relationship."
    },
    {
        q: "Are jewellery gifts long-lasting?",
        a: "Yes, quality jewellery is designed to last for years. Beyond its physical beauty, it holds sentimental value and becomes a cherished memory over time."
    },
    {
        q: "Why should I choose jewellery instead of traditional gifts?",
        a: "Jewellery offers lasting emotional and practical value. Unlike many traditional gifts, it becomes a personal keepsake that reminds her of special moments and the thought behind the gesture."
    }
];

// ─────────────────────────────────────────────────────────
//  FASHION JEWELLERY CONTENT DATA — Luxury Jewellery Gifts
// ─────────────────────────────────────────────────────────
const fashionJewelleryContent = [
     { type: 'h2', text: "Gifts for Her – Thoughtful & Meaningful Gift Ideas for Women" },
    { type: 'p', text: "Finding the perfect <strong>gifts for her</strong> is about choosing something that reflects her personality, style, and the special place she holds in your life. A thoughtful gift is not just about the item itself—it is about the emotions, memories, and meaning attached to it. Whether you are celebrating a birthday, anniversary, festival, relationship milestone, or achievement or simply want to show appreciation, the right gift can create a beautiful and lasting memory." },
    { type: 'p', text: "The best gifts are not always the most expensive—they are the ones chosen with genuine care and understanding. A meaningful gift for her should match her preferences, lifestyle, and personality while making her feel valued and appreciated. A carefully selected present shows that you have considered what she loves and what makes her unique." },
    { type: 'p', text: "At Barosche, we offer a thoughtfully curated collection of elegant jewellery designed to make every gifting moment truly special. Our jewellery combines modern sophistication with timeless beauty, offering <strong>best gifts for women</strong> who appreciate refined designs, premium craftsmanship, and effortless elegance. Each piece is created with attention to detail, ensuring it feels luxurious while remaining comfortable for everyday wear." },
    { type: 'p', text: "From delicate rings and graceful bracelets to elegant earrings and timeless pendants, every design is crafted to become more than just an accessory. A thoughtfully chosen jewellery gift becomes a cherished keepsake that she can wear, enjoy, and connect with for years to come. Every piece carries the potential to represent love, appreciation, celebration, and unforgettable moments." },
    { type: 'p', text: "Whether you are searching for <strong>unique gifts for her</strong>, romantic surprises, or elegant everyday jewellery pieces, Barosche helps you discover the perfect gift that expresses your emotions beautifully. Choose a timeless piece that reflects her individuality, celebrates your special bond, and creates memories she will treasure forever." },

    { type: 'h2', text: "Why Jewellery Makes One of the Best Gifts for Her" },
    { type: 'p', text: "Choosing the perfect gift for someone special can sometimes feel challenging, especially when you want something that feels personal, thoughtful, and memorable. Jewellery remains one of the most timeless and meaningful gift choices because it combines beauty, emotion, and lasting value in a way that few other presents can." },
    { type: 'p', text: "Unlike temporary gifts that may lose their charm over time, jewellery becomes a lasting reminder of special moments, relationships, and emotions. A beautifully designed jewellery piece is not just something she wears—it becomes a part of her personal style and a keepsake connected to important memories." },
    { type: 'p', text: "Whether it is a birthday celebration, anniversary, romantic surprise, festival, or simply a gesture to show appreciation, jewellery adds a special meaning to every occasion. Every time she wears the piece, she remembers the thought, care, and emotions behind the gift." },
    { type: 'h3', text: "What Makes Jewellery Special" },
    { type: 'h4', text: "1. Timeless Beauty" },
    { type: 'p', text: "Jewellery never goes out of style. Classic and elegant designs maintain their charm across changing trends, making them a gift that remains beautiful and relevant for years. A well-chosen jewellery piece can become a treasured part of her collection that she continues to enjoy over time." },
    { type: 'h4', text: "2. Personal & Thoughtful" },
    { type: 'p', text: "A carefully selected jewellery piece reflects that you understand her personality, preferences, and unique style. Whether she loves minimal designs, classic elegance, or modern statement pieces, choosing jewellery that matches her taste makes the gift feel more personal and meaningful." },
    { type: 'h4', text: "3. Emotional Value" },
    { type: 'p', text: "Jewellery often becomes connected with the most special moments in life. From relationship milestones and celebrations to personal achievements and unforgettable memories, a meaningful jewellery gift carries sentimental value that grows stronger with time." },
    { type: 'h4', text: "4. Versatile & Elegant" },
    { type: 'p', text: "One of the biggest advantages of jewellery is its versatility. Elegant rings, bracelets, earrings, and pendants can complement everyday outfits as well as special occasion looks. This makes jewellery a practical yet luxurious gift choice that she can enjoy regularly." },
    { type: 'h3', text: "A Lasting Expression of Love & Appreciation" },
    { type: 'p', text: "A jewellery gift represents more than beauty—it represents thoughtfulness, care, and the special bond you share. Whether you are searching for <strong>meaningful gifts for her</strong>, romantic surprises, or elegant keepsakes, jewellery offers the perfect combination of sophistication, emotion, and timeless value. A carefully chosen piece becomes a beautiful reminder of your appreciation that she can cherish for years to come." },

    { type: 'h2', text: "Explore Our Gift Collection for Her" },
    { type: 'p', text: "At Barosche, our jewellery collection is thoughtfully designed to help you discover the perfect <strong>gift ideas for her</strong> that match different personalities, occasions, and individual styles. We understand that every woman is unique, and the right jewellery piece should reflect her taste, elegance, and the special moments you want to celebrate." },
    { type: 'p', text: "Each piece in our collection combines modern sophistication, comfort, and timeless appeal. From everyday elegance to special occasion glamour, our jewellery designs are created to make gifting effortless and meaningful. Whether you are looking for a romantic surprise, a birthday gift, an anniversary keepsake, or simply a beautiful way to show appreciation, Barosche offers jewellery that creates lasting memories." },
    { type: 'h3', text: "1. <a href='https://barosche.com/product-category/rings/' style='color: #007bff; text-decoration: underline;'>Rings – Elegant & Meaningful Gifts</a>" },
    { type: 'p', text: "Rings are among the most symbolic jewellery gifts for women. They represent love, connection, appreciation, and special moments, making them a thoughtful choice for birthdays, anniversaries, milestones, and romantic occasions." },
    { type: 'p', text: "From minimalist everyday rings to refined statement designs, Barosche offers elegant options that complement different styles and personalities. A delicate ring can add a subtle touch of sophistication to everyday looks, while a more detailed design can create a memorable impression for special celebrations." },
    { type: 'p', text: "A beautifully chosen ring becomes more than just jewellery—it becomes a meaningful keepsake connected to emotions, memories, and moments that she can cherish for years." },
    { type: 'h3', text: "2. <a href='https://barosche.com/product-category/earrings/' style='color: #007bff; text-decoration: underline;'>Earrings – Stylish & Versatile Gifts</a>" },
    { type: 'p', text: "Earrings are one of the most popular and appreciated <strong>gifts for her</strong> because they combine elegance, practicality, and timeless beauty. Since they do not require sizing, they are a convenient yet thoughtful choice when selecting a special gift." },
    { type: 'p', text: "From delicate studs and minimal designs to elegant statement pieces, earrings can enhance her personal style effortlessly. They add a refined touch to everyday outfits while also complementing festive and special occasion looks." },
    { type: 'p', text: "Whether she prefers simple elegance or sophisticated designs, a beautiful pair of earrings makes a versatile gift that she can enjoy for every occasion." },
    { type: 'h3', text: "3. <a href='https://barosche.com/product-category/bracelets/' style='color: #007bff; text-decoration: underline;'>Bracelets – Modern & Sophisticated Gifts</a>" },
    { type: 'p', text: "A bracelet is a beautiful way to add elegance and charm to her jewellery collection. Lightweight, stylish, and comfortable, bracelets are perfect for women who appreciate accessories that can be worn effortlessly every day." },
    { type: 'p', text: "From minimal designs for a subtle look to more refined styles for special occasions, Barosche bracelets offer the perfect balance of beauty and sophistication. They can be worn individually for a classic appearance or paired with other jewellery pieces for a modern layered style." },
    { type: 'p', text: "A thoughtfully selected bracelet becomes a daily reminder of your appreciation while adding timeless elegance to her overall look." },
    { type: 'h3', text: "4. <a href='https://barosche.com/product-category/pendants/' style='color: #007bff; text-decoration: underline;'>Pendants – Personal & Timeless Gifts</a>" },
    { type: 'p', text: "Pendants are meaningful jewellery gifts that combine personal expression with elegant design. They can represent memories, emotions, special connections, or important milestones, making them a thoughtful choice when looking for something unique." },
    { type: 'p', text: "A beautifully crafted pendant can become her everyday favourite piece, adding a graceful touch to different outfits while carrying sentimental value. Whether styled alone for a minimal look or layered with other necklaces, pendants offer effortless versatility." },
    { type: 'p', text: "Choosing a pendant as a gift shows thoughtfulness and care, making it more than just an accessory—it becomes a timeless symbol of appreciation and the special bond you share. At Barosche, every jewellery piece is designed to make gifting moments more memorable. Explore our collection and find elegant <strong>gifts for her</strong> that combine beauty, meaning, and timeless sophistication." },

    { type: 'h2', text: "Best Gifts for Women for Every Occasion" },
    { type: 'p', text: "The right gift has the power to make every celebration more meaningful and create memories that last for years. When choosing the <strong>best gifts for women</strong>, it is important to select something that reflects her personality, emotions, and the special moments you share together." },
    { type: 'p', text: "Jewellery remains one of the most versatile and thoughtful gifting choices because it combines elegance, personal meaning, and lasting value. Whether it is a romantic occasion, a personal achievement, or a simple gesture of appreciation, a carefully chosen jewellery piece can make every moment feel more special." },
    { type: 'p', text: "From elegant rings and delicate earrings to graceful bracelets and timeless pendants, Barosche offers beautiful <strong>gifts for her</strong> that are designed to celebrate every occasion with style and sophistication." },

    { type: 'h2', text: "Perfect Occasions for Gifts for Her" },
    { type: 'h3', text: "Birthday Gifts" },
    { type: 'p', text: "A birthday is the perfect opportunity to celebrate her individuality and make her feel appreciated. A thoughtfully selected jewellery piece can reflect her personality, style, and preferences while becoming a memorable keepsake." },
    { type: 'p', text: "Whether it is a delicate ring, elegant bracelet, or timeless pendant, a beautiful jewellery gift adds a personal touch to her special day and reminds her of the love and thought behind your gesture." },
    { type: 'h3', text: "Anniversary Gifts" },
    { type: 'p', text: "Anniversaries celebrate the journey, memories, and connection shared between two people. Jewellery makes a meaningful anniversary gift because it represents love, commitment, and appreciation." },
    { type: 'p', text: "A carefully chosen piece can symbolize your relationship and become a lasting reminder of the special moments you have created together. From classic designs to modern styles, jewellery adds emotional value to every anniversary celebration." },
    { type: 'h3', text: "Valentine's Day Gifts" },
    { type: 'p', text: "Valentine's Day is a beautiful occasion to express love and appreciation through a meaningful gesture. A romantic jewellery gift can communicate emotions in a timeless way while creating a memorable experience." },
    { type: 'p', text: "Whether you choose an elegant ring, a graceful pendant, or a sophisticated bracelet, jewellery makes a thoughtful surprise that she can cherish long after the occasion." },
    { type: 'h3', text: "Wedding & Engagement Gifts" },
    { type: 'p', text: "Weddings and engagements represent new beginnings, love, and lifelong commitments. Elegant jewellery makes a meaningful choice for these special occasions, symbolizing beauty, celebration, and emotional connection." },
    { type: 'p', text: "A refined jewellery piece can be gifted to the bride, partner, or loved one as a timeless reminder of this important milestone." },
    { type: 'h3', text: "Festival Gifts" },
    { type: 'p', text: "Festivals are moments of celebration, togetherness, and sharing happiness with loved ones. Jewellery adds a touch of elegance and thoughtfulness to festive gifting." },
    { type: 'p', text: "A beautiful jewellery piece can complement traditional celebrations while becoming a lasting memory associated with joyful occasions and special moments." },
    { type: 'h3', text: "Achievement & Milestone Gifts" },
    { type: 'p', text: "Recognizing her achievements with a meaningful gift is a wonderful way to show appreciation and encouragement. Jewellery can symbolize success, confidence, growth, and new beginnings." },
    { type: 'p', text: "Whether it is a career milestone, personal achievement, or an important life event, a thoughtfully chosen jewellery gift celebrates her journey and reminds her of how special she is." },
    { type: 'p', text: "No matter the occasion, a carefully selected jewellery gift becomes more than just an accessory—it becomes a symbol of love, appreciation, and unforgettable memories. With Barosche, you can find elegant <strong>gift ideas for her</strong> that make every celebration truly special." },

    { type: 'h2', text: "Unique Gifts for Her – Thoughtful Ideas She Will Love" },
    { type: 'p', text: "Finding <strong>unique gifts for her</strong> is about choosing something that feels personal, meaningful, and different from ordinary presents. The most memorable gifts are not just beautiful—they reflect her personality, celebrate her individuality, and show the thought and care behind your choice." },
    { type: 'p', text: "A thoughtful gift should make her feel appreciated and understood. Whether she prefers minimal elegance, classic designs, or modern styles, choosing something that matches her taste creates a deeper emotional connection. Jewellery makes a wonderful choice because it combines beauty, sentiment, and lasting value, allowing her to enjoy the gift for years to come." },
    { type: 'p', text: "At Barosche, our jewellery collection offers elegant and timeless designs that make perfect <strong>gift ideas for her</strong>. Each piece is created to complement her personal style while adding a touch of sophistication to everyday moments and special occasions." },
    { type: 'h3', text: "Unique Jewellery Gift Ideas" },
    { type: 'h4', text: "1. <a href='https://barosche.com/product-category/rings/' style='color: #007bff; text-decoration: underline;'>Minimalist Gold Rings</a>" },
    { type: 'p', text: "Simple yet elegant, minimalist gold rings are perfect for women who appreciate subtle luxury and effortless style. Their refined designs make them ideal for everyday wear while maintaining a timeless appeal." },
    { type: 'p', text: "A beautifully crafted ring can represent love, appreciation, and special memories, making it a thoughtful gift that she can cherish for years." },
    { type: 'h4', text: "2. <a href='https://barosche.com/product-category/bracelets/' style='color: #007bff; text-decoration: underline;'>Delicate Bracelets</a>" },
    { type: 'p', text: "A lightweight bracelet adds effortless elegance to any jewellery collection. Designed for comfort and versatility, delicate bracelets can be worn daily or styled for special occasions." },
    { type: 'p', text: "Whether paired with casual outfits or elegant looks, a refined bracelet becomes a beautiful reminder of your thoughtfulness and appreciation." },
    { type: 'h4', text: "3. <a href='https://barosche.com/product-category/earrings/' style='color: #007bff; text-decoration: underline;'>Elegant Earrings</a>" },
    { type: 'p', text: "Classic earrings are versatile gifts that suit different personalities and fashion preferences. From simple everyday designs to more sophisticated styles, earrings offer a perfect balance of beauty and practicality." },
    { type: 'p', text: "They are an excellent choice for women who love jewellery that enhances their style while remaining easy to wear." },
    { type: 'h4', text: "4. <a href='https://barosche.com/product-category/pendants/' style='color: #007bff; text-decoration: underline;'>Meaningful Pendants</a>" },
    { type: 'p', text: "A thoughtfully selected pendant can carry emotional significance and represent memories, feelings, or a special connection. Its personal appeal makes it a unique and heartfelt gift choice." },
    { type: 'p', text: "A beautiful pendant can become her everyday favourite piece, adding elegance to her look while holding a meaningful story behind it." },
    { type: 'h3', text: "Thoughtful Gifts Create Lasting Memories" },
    { type: 'p', text: "The most memorable gifts are those that feel personal, thoughtful, and connected to the person receiving them. A carefully chosen jewellery piece is more than just an accessory—it is a lasting expression of love, appreciation, and the special bond you share." },
    { type: 'p', text: "Explore Barosche's collection of elegant jewellery and discover <strong>unique gifts for her</strong> that make every moment unforgettable." },

    { type: 'h2', text: "How to Choose the Perfect Gift for Her" },
    { type: 'p', text: "Selecting the right <strong>gift for her</strong> becomes much easier when you focus on her personality, lifestyle, preferences, and the emotions you want to express. The most meaningful gifts are not always the biggest or most expensive—they are the ones chosen with genuine thought and understanding." },
    { type: 'p', text: "A carefully selected gift shows that you notice the little details about her, understand her choices, and appreciate what makes her unique. Whether you are choosing a present for a birthday, anniversary, celebration, or simply to show your love and appreciation, selecting something that matches her style makes the gesture even more special." },
    { type: 'p', text: "Jewellery is one of the most thoughtful gift choices because it combines elegance, personal meaning, and lasting value. From delicate everyday pieces to refined statement designs, the right jewellery can become a cherished part of her collection." },
    { type: 'h3', text: "Gift Selection Tips" },
    { type: 'h4', text: "1. Understand Her Style" },
    { type: 'p', text: "Pay attention to the type of jewellery and accessories she already enjoys wearing. Does she prefer minimal and delicate designs, classic elegance, or bold statement pieces? Choosing a style that matches her personality ensures the gift feels personal and thoughtfully selected." },
    { type: 'p', text: "A jewellery piece that reflects her taste will not only look beautiful but will also make her feel understood and appreciated." },
    { type: 'h4', text: "2. Choose Something Useful" },
    { type: 'p', text: "Select a gift that she can enjoy regularly. Everyday jewellery pieces such as elegant rings, lightweight bracelets, simple earrings, and timeless pendants offer both beauty and practicality." },
    { type: 'p', text: "A versatile gift that fits naturally into her daily lifestyle becomes something she can wear often and enjoy for years." },
    { type: 'h4', text: "3. Consider Her Interests" },
    { type: 'p', text: "Think about her personality, hobbies, lifestyle, and what makes her unique before choosing a gift. A thoughtful choice should feel connected to who she is rather than being a generic present." },
    { type: 'p', text: "Understanding her preferences helps you select something that feels more personal and meaningful." },
    { type: 'h4', text: "4. Focus on Quality" },
    { type: 'p', text: "A well-crafted gift feels more special and creates a lasting impression. Choosing jewellery with quality materials, refined designs, and excellent craftsmanship ensures it remains beautiful and valuable over time." },
    { type: 'p', text: "A premium-quality piece becomes a meaningful addition to her collection and a lasting reminder of your thoughtful gesture." },
    { type: 'h4', text: "5. Add Personal Meaning" },
    { type: 'p', text: "The best gifts are those connected to emotions and memories. Choose something that represents a special moment, shared experience, relationship milestone, or personal connection." },
    { type: 'p', text: "A jewellery piece with sentimental value becomes more than just an accessory—it becomes a symbol of your bond and the memories you create together." },
    { type: 'p', text: "By considering her style, needs, personality, and preferences, you can choose the perfect <strong>gift for her</strong> that feels elegant, thoughtful, and truly unforgettable. A carefully selected jewellery piece from Barosche transforms a simple gesture into a lasting expression of love and appreciation." },

    { type: 'h2', text: "Luxury Gifts for Her – Elegant & Premium Choices" },
    { type: 'p', text: "Choosing <strong>luxury gifts for her</strong> is about creating a memorable experience and expressing appreciation in a way that feels truly special. A luxury gift is not only about appearance—it is about the emotions, thoughtfulness, and lasting impression it creates. Jewellery perfectly captures this feeling by combining elegance, craftsmanship, and timeless beauty." },
    { type: 'p', text: "Unlike ordinary gifts, luxury jewellery becomes a meaningful part of her personal style. It represents care, sophistication, and the effort taken to choose something unique. Whether it is a birthday, anniversary, romantic occasion, milestone celebration, or simply a gesture to show appreciation, an elegant jewellery piece can make the moment unforgettable." },
    { type: 'p', text: "At Barosche, our jewellery designs are created for women who appreciate refined elegance and modern sophistication. Each piece blends timeless aesthetics with everyday comfort, making it a beautiful choice for those who value quality, style, and individuality." },
    { type: 'h3', text: "What Defines Modern Luxury Jewellery" },
    { type: 'h4', text: "1. Premium Craftsmanship" },
    { type: 'p', text: "True luxury begins with exceptional craftsmanship. Every detail, from the design concept to the final finish, plays an important role in creating jewellery that feels special. Carefully crafted pieces offer lasting beauty, quality, and a premium experience." },
    { type: 'h4', text: "2. Elegant Designs" },
    { type: 'p', text: "Modern luxury focuses on designs that are sophisticated yet effortless. Refined shapes, timeless styles, and thoughtful details create jewellery pieces that remain beautiful beyond changing trends." },
    { type: 'h4', text: "3. Comfortable Wearability" },
    { type: 'p', text: "Luxury jewellery should not only look elegant but also feel comfortable to wear. Lightweight and versatile designs allow her to enjoy the beauty of her jewellery every day, whether for casual outings or special occasions." },
    { type: 'h4', text: "4. Long-Lasting Appeal" },
    { type: 'p', text: "A well-designed jewellery piece maintains its charm over time. Timeless designs ensure that the gift remains meaningful and stylish for years, becoming a cherished part of her collection." },
    { type: 'h4', text: "5. Personal Significance" },
    { type: 'p', text: "The most valuable gifts are those that carry emotional meaning. A carefully selected jewellery piece can represent love, appreciation, achievements, or special memories, making it more personal and memorable." },
    { type: 'p', text: "A refined jewellery piece from Barosche makes a sophisticated <strong>luxury gift for her</strong>, offering the perfect combination of elegance, emotion, and timeless style. Give her something she can treasure—not just today, but for years to come." },

    { type: 'h2', text: "Affordable Yet Elegant Gifts for Her" },
    { type: 'p', text: "A meaningful <strong>gift for her</strong> does not always need to be extravagant or overly expensive. True elegance comes from thoughtful design, quality craftsmanship, and choosing something that reflects her personality and style. Beautiful jewellery can offer a premium and sophisticated feel while remaining practical, comfortable, and suitable for everyday wear." },
    { type: 'p', text: "At Barosche, we believe that modern luxury is about simplicity, versatility, and timeless appeal. A carefully designed jewellery piece can create a lasting impression through its refined details, elegant finish, and effortless beauty. Whether you are looking for a birthday gift, anniversary surprise, romantic gesture, or a thoughtful everyday present, elegant jewellery makes a meaningful choice." },
    { type: 'h3', text: "Thoughtful Gift Choices" },
    { type: 'h4', text: "1. <a href='https://barosche.com/product-category/rings/' style='color: #007bff; text-decoration: underline;'>Minimalist Rings</a>" },
    { type: 'p', text: "Minimalist rings are perfect for women who appreciate subtle elegance and timeless style. Their clean and refined designs make them suitable for everyday wear while adding a sophisticated touch to any look." },
    { type: 'p', text: "A simple yet beautiful ring can become a meaningful keepsake that represents appreciation, love, and special memories." },
    { type: 'h4', text: "2. <a href='https://barosche.com/product-category/bracelets/' style='color: #007bff; text-decoration: underline;'>Lightweight Bracelets</a>" },
    { type: 'p', text: "Lightweight bracelets combine comfort with elegance, making them a wonderful gift choice for women who enjoy effortless style. They can be worn daily, paired with different outfits, and layered with other jewellery pieces for a modern look." },
    { type: 'p', text: "A delicate bracelet adds a graceful touch while remaining practical and versatile." },
    { type: 'h4', text: "3. <a href='https://barosche.com/product-category/earrings/' style='color: #007bff; text-decoration: underline;'>Elegant Earrings</a>" },
    { type: 'p', text: "Elegant earrings are one of the most versatile jewellery gifts for women. From minimal everyday designs to refined statement styles, earrings can enhance her appearance and complement different fashion preferences." },
    { type: 'p', text: "Their timeless appeal makes them a thoughtful gift that she can enjoy for various occasions." },
    { type: 'h4', text: "4. <a href='https://barosche.com/product-category/pendants/' style='color: #007bff; text-decoration: underline;'>Everyday Pendants</a>" },
    { type: 'p', text: "Everyday pendants offer a perfect balance of simplicity and personal meaning. A beautifully designed pendant can become her favourite daily accessory while adding elegance to casual and formal outfits." },
    { type: 'p', text: "Pendants also provide an opportunity to choose a design that reflects her personality, making the gift feel more personal." },
    { type: 'h3', text: "Timeless Elegance Within Reach" },
    { type: 'p', text: "The beauty of a meaningful gift lies in the thought behind it, not just its price. Elegant jewellery designs make it possible to give something stylish, valuable, and memorable without being overwhelming." },
    { type: 'p', text: "These jewellery options make beautiful <strong>gifts for women</strong> who appreciate simplicity, sophistication, and timeless designs. With Barosche, you can find an elegant piece that celebrates her style and creates a lasting memory." },

    { type: 'h2', text: "Styling Tips for Jewellery Gifts" },
    { type: 'p', text: "Jewellery has the power to transform any outfit by adding elegance, personality, and a refined finishing touch. When styled thoughtfully, even simple jewellery pieces can create a sophisticated look suitable for everyday wear as well as special occasions. The beauty of jewellery lies in its versatility—it allows her to express her individuality while enhancing her overall style." },
    { type: 'p', text: "Whether she prefers minimal elegance or a more fashionable layered look, the right jewellery combinations can make every outfit feel more complete. Thoughtfully styled jewellery also helps her get more value from her favourite pieces by making them suitable for different occasions and moods." },
    { type: 'h3', text: "Easy Styling Ideas" },
    { type: 'p', text: "<strong>Stack Rings for a Modern Appearance:</strong> Stacking rings is a stylish way to create a personalized and contemporary look. Combining simple bands with elegant designs adds depth and character while maintaining a sophisticated appearance. Minimal rings can be mixed and matched to create different styles for everyday wear.<br/><br/><strong>Layer Bracelets for an Elegant Style:</strong> Layering bracelets creates a fashionable yet graceful look. Combining delicate bracelets with different textures or designs adds a touch of luxury while keeping the overall appearance balanced and refined. A single bracelet can offer subtle elegance, while layered styles create a more statement look.<br/><br/><strong>Pair Earrings with Casual and Formal Outfits:</strong> Elegant earrings can easily transition from everyday looks to special occasions. Minimal studs add a polished touch to casual outfits, while refined statement earrings can enhance evening wear and celebration looks.<br/><br/><strong>Combine Different Jewellery Pieces for a Personalized Look:</strong> Mixing rings, bracelets, earrings, and pendants allows her to create a unique style that reflects her personality. Coordinating different pieces helps create a balanced jewellery collection that works across various outfits and occasions.<br/><br/><strong>Choose Jewellery That Matches the Occasion:</strong> For everyday styling, lightweight and minimal designs offer comfort and effortless elegance. For special events, refined and luxurious pieces can add sophistication and make the overall look more memorable." },
    { type: 'p', text: "Jewellery is more than an accessory—it is a reflection of confidence, personality, and personal style. With the right styling choices, every jewellery piece can become a beautiful expression of individuality while adding timeless elegance to every look." },

    { type: 'h2', text: "Jewellery Care Tips for Long-Lasting Beauty" },
    { type: 'p', text: "Proper care and maintenance help preserve the shine, elegance, and beauty of your jewellery for years. A thoughtfully chosen jewellery gift is not just an accessory—it carries emotions, memories, and special moments. Taking the right care ensures that each piece continues to look beautiful while maintaining its sentimental and aesthetic value." },
    { type: 'p', text: "With simple daily habits and proper storage, your favourite rings, bracelets, earrings, and pendants can retain their brilliance and remain a cherished part of your jewellery collection for a long time." },
    { type: 'h3', text: "Care Guide" },
    { type: 'p', text: "<strong>Store Properly:</strong> Always store your jewellery in a soft pouch, separate compartment, or dedicated jewellery box to protect it from scratches, dust, and accidental damage. Keeping each piece separately also helps prevent tangling and maintains its original finish.<br/><br/><strong>Avoid Chemicals:</strong> Protect your jewellery from direct contact with perfumes, lotions, cosmetics, and harsh chemicals. These substances can affect the shine and surface quality of jewellery over time.<br/><br/><strong>Remove Before Activities:</strong> Take off your jewellery before swimming, exercising, cleaning, or other types of household tasks where it may come into contact with moisture, impact, or unnecessary friction. Removing jewellery during such activities helps prevent scratches and wear.<br/><br/><strong>Handle with Care:</strong> Always wear and remove jewellery carefully to maintain its structure and appearance. Avoid pulling, bending, or applying excessive pressure, especially with delicate designs." },
    { type: 'p', text: "With proper care and attention, your jewellery gift can continue to reflect elegance, beauty, and special memories for years. A well-maintained jewellery piece remains a timeless keepsake that can be enjoyed and cherished for generations." },

    { type: 'h2', text: "Thoughtful Gift Ideas for Her That Create Lasting Memories" },
    { type: 'p', text: "Choosing the right gift for her is about more than finding something beautiful—it is about selecting something that reflects your emotions, appreciation, and understanding of who she is. The most memorable gifts are those that feel personal and meaningful, creating a connection that lasts beyond the moment." },
    { type: 'p', text: "Whether you are celebrating a special occasion or simply want to make her feel loved, a thoughtfully chosen jewellery piece can become a symbol of your bond. From elegant everyday designs to luxurious statement pieces, the right gift can express feelings that words cannot always describe." },
    { type: 'p', text: "At Barosche, our collection of jewellery gifts for women is designed to help you find something special for every personality and occasion. Each piece combines timeless elegance, modern design, and exceptional craftsmanship to create gifts she will truly appreciate." },

    { type: 'h2', text: "Gift Ideas for Her Based on Her Personality" },

    { type: 'p', text: "Every woman has her own unique style and preferences. Choosing a gift that matches her personality makes the gesture more thoughtful and meaningful." },

    { type: 'h3', text: "For the Woman Who Loves Minimal Elegance" },
    { type: 'p', text: "If she prefers simple and sophisticated styles, minimalist jewellery makes an ideal choice. Delicate rings, subtle earrings, and elegant pendants offer effortless beauty while complementing her everyday looks." },
    { type: 'p', text: "Minimal jewellery pieces are perfect for women who appreciate timeless designs that feel refined without being overwhelming." },

    { type: 'h3', text: " For the Woman Who Loves Classic Styles" },
    { type: 'p', text: "Classic jewellery designs never go out of fashion. Elegant gold rings, traditional-inspired pieces, and timeless bracelets make beautiful gifts for women who appreciate sophistication and graceful style." },
    { type: 'p', text: "These pieces can become treasured additions to her jewellery collection and remain meaningful for years." },

    { type: 'h3', text: " For the Woman Who Loves Modern Trends" },
    { type: 'p', text: "For someone who enjoys contemporary fashion, choose jewellery with modern shapes, unique designs, and stylish details. Statement earrings, layered bracelets, or fashionable rings can add personality to her overall look." },
    { type: 'p', text: "Modern jewellery gifts allow her to express confidence and individuality through her style." },

    { type: 'h3', text: "  For the Woman Who Values Sentimental Gifts" },
    { type: 'p', text: "If she appreciates emotional connections, choose jewellery that carries special meaning. A meaningful pendant, symbolic ring, or personalised-style design can represent memories, milestones, and shared experiences." },
    { type: 'p', text: "A sentimental gift becomes more than jewellery—it becomes a reminder of your relationship." },


    { type: 'h2', text: "Best Gift Ideas for Her That She Will Treasure" },
    { type: 'p', text: "Finding the perfect gift can feel challenging, but timeless jewellery options make the decision easier. Here are some elegant gift ideas that are suitable for different occasions:" },
    { type: 'h3', text: "1. <a href='https://barosche.com/product-category/rings/' style='color: #007bff; text-decoration: underline;'>Elegant Rings</a>" },
    { type: 'p', text: "Rings are one of the most meaningful jewellery gifts for women. They represent connection, appreciation, and special moments. Whether it is a simple everyday ring or an elegant statement design, rings make thoughtful gifts that she can enjoy for years." },
    { type: 'h3', text: "2. <a href='https://barosche.com/product-category/bracelets/' style='color: #007bff; text-decoration: underline;'>Stylish Bracelets</a>" },
    { type: 'p', text: "Bracelets offer the perfect combination of beauty and practicality. A delicate bracelet can become her everyday favourite accessory while adding sophistication to different outfits." },
    { type: 'h3', text: "3. <a href='https://barosche.com/product-category/earrings/' style='color: #007bff; text-decoration: underline;'>Beautiful Earrings</a>" },
    { type: 'p', text: "Earrings are versatile gifts suitable for almost every style. From simple studs to elegant designs, they enhance her appearance and make a thoughtful addition to her jewellery collection." },
    { type: 'h3', text: "4. <a href='https://barosche.com/product-category/pendants/' style='color: #007bff; text-decoration: underline;'>Graceful Pendants</a>" },
    { type: 'p', text: "Pendants allow you to choose something personal and meaningful. A beautifully designed pendant can represent love, memories, or a special connection, making it a memorable gift choice." },

    { type: 'h2', text: "Romantic Gifts for Her to Express Your Love" },
    { type: 'p', text: "Romantic gifting is about creating emotional moments and showing how much she means to you. A beautiful jewellery piece can make these moments even more special." },
    { type: 'p', text: "Whether it is your anniversary, Valentine's Day, birthday, or simply a surprise gesture, jewellery offers a timeless way to express affection." },
    { type: 'p', text: "<strong>A romantic jewellery gift can represent the following:</strong><br/><br/>• Love and appreciation<br/>• Special memories together<br/>• Relationship milestones<br/>• Emotional connection<br/>• A promise of beautiful moments ahead" },
    { type: 'p', text: "Unlike ordinary gifts, jewellery remains connected to the emotions behind the occasion, making it a meaningful keepsake." },

    { type: 'h2', text: "Meaningful Gifts for Her for Every Relationship Stage" },
    { type: 'p', text: "Every relationship has special moments worth celebrating. Choosing a meaningful gift helps you recognize those memories and create new ones." },
    { type: 'h3', text: "1. New Relationship Gifts" },
    { type: 'p', text: "For a new relationship, elegant and simple jewellery pieces are thoughtful choices. Minimal rings, delicate earrings, or graceful pendants show care without being overwhelming." },
    { type: 'h3', text: "2. Long-Term Relationship Gifts" },
    { type: 'p', text: "For couples who have shared many memories, meaningful jewellery pieces can represent appreciation, love, and commitment. Classic rings, bracelets, and premium designs make memorable choices." },
    { type: 'h3', text: "3. Milestone Celebration Gifts" },
    { type: 'p', text: "Celebrate important moments such as anniversaries, achievements, and personal milestones with jewellery that represents growth, success, and shared happiness." },

    { type: 'h2', text: "How Jewellery Makes Every Gift More Special" },
    { type: 'p', text: "A jewellery gift is unique because it combines beauty with emotional significance. It is something she can wear, enjoy, and connect with throughout her life." },
    { type: 'p', text: "<strong>The value of jewellery goes beyond appearance:</strong><br/><br/><strong>Creates Emotional Connections:</strong> Jewellery often becomes associated with important memories and special occasions.<br/><br/><strong>Reflects Personal Style:</strong> A carefully selected piece shows that you understand her preferences and personality.<br/><br/><strong>Offers Long-Term Value:</strong> Quality jewellery remains beautiful and meaningful for years.<br/><br/><strong>Becomes a Personal Keepsake:</strong> Unlike temporary gifts, jewellery becomes something she can treasure and remember." },

    { type: 'h2', text: "Gift Shopping Tips: Finding the Right Present for Her" },
    { type: 'p', text: "<strong>Before choosing a gift, consider these simple tips:</strong><br/><br/><strong>Think About Her Lifestyle:</strong> Choose jewellery that fits naturally into her daily routine. Everyday pieces are practical and meaningful.<br/><br/><strong>Consider Her Existing Collection:</strong> Notice the jewellery styles she already wears. This helps you select something that matches her taste.<br/><br/><strong>Choose Timeless Designs:</strong> Classic jewellery styles remain beautiful for years and can be enjoyed across different occasions.<br/><br/><strong>Select Quality Over Trends:</strong> A well-crafted jewellery piece creates a stronger emotional connection and lasting value." },

    { type: 'h2', text: "Why Jewellery Remains a Favourite Gift Choice for Women" },
    { type: 'p', text: "Jewellery continues to be one of the most loved gifts for women because it combines elegance, emotion, and personal meaning. It is suitable for every occasion and every relationship stage." },
    { type: 'p', text: "Whether you are looking for <strong>the best gifts for women</strong>, <strong>unique gifts for her</strong>, or <strong>meaningful gifts for her</strong>, a beautifully designed jewellery piece from Barosche helps you create a memorable gifting experience." },
    { type: 'p', text: "A thoughtful jewellery gift is not just something she receives—it is something she remembers. It represents love, appreciation, and the special moments that make your relationship unique." },

    { type: 'h2', text: "Why Choose Barosche for Gifts for Her" },
    { type: 'p', text: "At Barosche, we believe that the perfect gift is not just about beauty—it is about the emotions, memories, and meaningful moments connected with it. Every jewellery piece is thoughtfully designed to help you express love, appreciation, and care in a timeless way." },
    { type: 'p', text: "Our collections focus on creating jewellery that blends modern elegance with everyday comfort. From thoughtful surprises to special celebrations, Barosche offers refined designs that make every gifting moment memorable. Each piece is created to reflect sophistication, individuality, and lasting beauty, making it a perfect choice when searching for gifts for her." },
    { type: 'h3', text: "What Makes Barosche Special" },
    { type: 'h4', text: "1. Minimalist Luxury Designs" },
    { type: 'p', text: "Our jewellery reflects a modern approach to luxury through clean, elegant, and sophisticated designs. Each piece is created with timeless appeal, allowing her to <strong>enjoy effortless</strong> style that complements different looks and occasions." },
    { type: 'h4', text: "2. Premium Craftsmanship" },
    { type: 'p', text: "Every Barosche jewellery piece is crafted with attention to detail, quality, and precision. From the initial design concept to the final finish, we focus on creating jewellery that offers a premium feel and lasting elegance." },
    { type: 'h4', text: "3. Perfect for Every Occasion" },
    { type: 'p', text: "Whether you are celebrating a birthday, anniversary, Valentine's Day, festival, milestone achievement, or simply want to show appreciation, our collections provide meaningful gifting options for every special moment." },
    { type: 'h4', text: "4. Everyday Elegance" },
    { type: 'p', text: "We believe luxury should be comfortable and wearable. Our designs are created with versatility in mind, allowing her to enjoy elegant jewellery that fits effortlessly into her everyday lifestyle while maintaining a refined appearance." },
    { type: 'h4', text: "5. Thoughtful & Meaningful Gifting" },
    { type: 'p', text: "A jewellery gift from Barosche represents more than just a beautiful accessory. It becomes a symbol of love, appreciation, and the special memories created together. Each piece is designed to make her feel valued and celebrated." },
    { type: 'p', text: "Choosing Barosche means giving more than jewellery—it means giving a lasting memory, a meaningful emotion, and a timeless expression of appreciation that she can cherish for years to come." },

    { type: 'h2', text: "Find the Perfect Gift for Her" },
    { type: 'p', text: "Whether you are searching for the best gifts for women, unique gifts for her, or meaningful jewellery gifts, Barosche offers elegant <a href='https://barosche.com/' style='color: #007bff; text-decoration: underline;'>fine jewellery</a> designs that make every occasion special." },
    { type: 'p', text: "Explore our collection and discover a timeless gift that she will love, wear, and cherish for years to come." }
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
export default function GiftsFor() {
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