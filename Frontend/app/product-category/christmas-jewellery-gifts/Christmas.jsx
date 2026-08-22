'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './Christmas.css';
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
    pageTitle: "Luxury Christmas Jewellery Gifts for Her – Timeless & Elegant Style",
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
        q: "What makes jewellery a perfect Christmas gift?",
        a: "Jewellery is timeless, meaningful, and long-lasting. It holds emotional value and becomes a cherished reminder of special moments, making it one of the most thoughtful Christmas gifts."
    },
    {
        q: "What type of jewellery is best for Christmas gifting?",
        a: "Popular choices include bracelets, rings, earrings, and pendants. Minimalist and versatile designs are ideal because they can be worn daily and on special occasions."
    },
    {
        q: "How do I choose the right jewellery for her?",
        a: "Focus on her personal style. Observe whether she prefers minimalist, bold, or classic designs, and choose something that complements her everyday look."
    },
    {
        q: "Are minimalist jewellery pieces good for gifting?",
        a: "Yes, minimalist jewellery is highly versatile, timeless, and suitable for everyday wear, making it a perfect and safe gifting option."
    },
    {
        q: "What are the best Christmas gift ideas for her in jewellery?",
        a: "Bracelets, stackable rings, elegant earrings, and delicate pendants are among the best Christmas jewellery gift ideas for her."
    },
    {
        q: "Is jewellery a good Secret Santa gift?",
        a: "Yes, jewellery is a great Secret Santa option because it's thoughtful, stylish, and suitable for a wide range of preferences."
    },
    {
        q: "Can jewellery be worn every day?",
        a: "Absolutely. High-quality jewellery designed with comfort and durability in mind can be worn daily without compromising style."
    },
    {
        q: "What makes Barosche jewellery unique for gifting?",
        a: "Barosche focuses on minimalist luxury, high-quality craftsmanship, and versatile designs that suit both everyday wear and special occasions."
    },
    {
        q: "Are Barosche jewellery pieces suitable for sensitive skin?",
        a: "Most high-quality jewellery brands design pieces with skin-friendly materials. It's always best to check product details for specific materials used."
    },
    {
        q: "What is the most popular jewellery gift during Christmas?",
        a: "Earrings and bracelets are among the most popular choices because they are easy to style and universally loved."
    },
    {
        q: "Is jewellery considered a luxury Christmas gift?",
        a: "Yes, jewellery is often seen as a luxury gift due to its elegance, durability, and emotional value."
    },
    {
        q: "Can I gift jewellery for someone I don't know very well?",
        a: "Yes, simple and minimalist pieces like stud earrings or delicate bracelets are safe and thoughtful choices."
    },
    {
        q: "How can I make my jewellery gift more special?",
        a: "You can add a personal touch with thoughtful packaging, a handwritten note, or by choosing a design that reflects her personality."
    },
    {
        q: "Are jewellery gifts suitable for all ages?",
        a: "Yes, jewellery is a universal gift that suits all age groups when chosen according to style and preference."
    },
    {
        q: "What are timeless jewellery styles for gifting?",
        a: "Minimalist designs, simple chains, classic studs, and elegant rings are timeless options that never go out of style."
    },
    {
        q: "Can jewellery be layered or styled in different ways?",
        a: "Yes, many modern jewellery pieces are designed for layering, allowing her to create personalized looks."
    },
    {
        q: "Is it better to choose trendy or timeless jewellery?",
        a: "Timeless jewellery is generally a better choice for gifting, as it remains stylish for years and suits multiple occasions."
    },
    {
        q: "Why is jewellery a meaningful gift?",
        a: "Jewellery symbolizes emotions like love, appreciation, and connection, making it a deeply personal and lasting gift."
    },
    {
        q: "Can jewellery be gifted for occasions beyond Christmas?",
        a: "Yes, jewellery is perfect for birthdays, anniversaries, celebrations, and everyday appreciation gifts."
    },
    {
        q: "How do I ensure my Christmas jewellery gift is well received?",
        a: "Choose a versatile, elegant piece that aligns with her style, and focus on quality and simplicity for a thoughtful and memorable gift."
    }
];

// ─────────────────────────────────────────────────────────
//  FASHION JEWELLERY CONTENT DATA — Luxury Jewellery Gifts
// ─────────────────────────────────────────────────────────
const fashionJewelleryContent = [
   { type: 'h', text: "Christmas Jewellery Gifts – Elegant & Meaningful Holiday Surprises" },
    { type: 'p', text: "Finding the perfect <strong>Christmas jewellery gifts</strong> is about more than simply choosing something beautiful—it's about selecting a piece that feels thoughtful, timeless, and truly meaningful. Jewellery has a unique ability to capture emotions and preserve special moments, making it one of the most cherished gifts during the festive season. At Barosche, we offer a carefully curated collection of elegant jewellery designed to make your Christmas gifting both effortless and memorable." },
    { type: 'p', text: "The holiday season is all about celebrating love, connection, and appreciation. A well-chosen piece of jewellery reflects all of these sentiments, turning a simple gift into something deeply personal. Whether it's a delicate bracelet, a minimalist ring, or a refined pendant, each piece carries a sense of intention and care that makes it stand out from ordinary presents." },
    { type: 'p', text: "If you are exploring <strong>christmas gift ideas for her</strong> or searching for a refined and <strong>luxury christmas gift for her</strong>, our collection offers the perfect balance of modern minimalism and timeless elegance. Every design is created to complement her everyday style while adding a subtle touch of sophistication. These are pieces she can wear not only during the festive season but throughout the year, making your gift both beautiful and practical." },
    { type: 'p', text: "At Barosche, we focus on jewellery that blends style with comfort and versatility. Each piece is thoughtfully crafted to be lightweight, durable, and easy to wear, ensuring it fits seamlessly into her daily life. From understated designs for everyday elegance to slightly more refined styles for special occasions, our collection caters to every preference." },
    { type: 'p', text: "Choosing <strong>christmas jewellery gifts</strong> from Barosche means giving more than just an accessory—it means gifting a lasting memory. Every piece is designed to be cherished, worn, and remembered, making your Christmas present something truly special that she will appreciate long after the celebrations are over." },

    { type: 'h', text: "Why Jewellery is the Perfect Christmas Gift for Her" },
    { type: 'p', text: "Christmas is a time of love, celebration, and meaningful connections—a season where every gift carries emotion and intention. Choosing a thoughtful <strong>luxury christmas gift for her</strong> is about more than just the item itself; it's about expressing appreciation, creating memories, and making her feel truly special. Jewellery stands out as one of the most timeless and meaningful gifts you can give during the festive season." },
    { type: 'p', text: "Unlike many other presents, jewellery holds deep emotional value. It often becomes a part of her daily life, reminding her of the moment, the person, and the feeling behind the gift. Whether it's a delicate bracelet, a minimalist ring, or an elegant pendant, each piece tells a story and carries a personal connection that lasts far beyond Christmas." },
    { type: 'h', text: "Why Jewellery Makes the Perfect Gift" },
    { type: 'p', text: "<strong>Emotional & Sentimental Value:</strong> Jewellery is more than an accessory—it represents love, appreciation, and meaningful moments that she can cherish forever.<br/><strong>Long-Lasting & Timeless:</strong> A well-crafted piece can last for years, becoming a keepsake that holds memories of special occasions.<br/><strong>Versatile for Every Occasion:</strong> Jewellery effortlessly complements both everyday outfits and festive looks, making it a practical yet elegant gift.<br/><strong>Personal & Thoughtful:</strong> Choosing the right piece shows attention to her style and personality, making your gift feel unique and meaningful." },
    { type: 'p', text: "From subtle everyday designs to refined statement pieces, jewellery continues to be one of the <strong>best christmas gifts for her</strong>. It combines beauty, meaning, and longevity—making it a gift she will not only love but also wear and remember for years to come." },

    { type: 'h', text: "Explore Our Christmas Jewellery Collection" },
    { type: 'p', text: "At Barosche, our festive collection is thoughtfully curated to help you find the perfect <strong>christmas jewellery gifts</strong> that feel elegant, meaningful, and timeless. Whether you are choosing something subtle for everyday wear or a refined piece for special celebrations, our jewellery is designed to suit every style and occasion. Each piece reflects a balance of modern minimalism and lasting sophistication, making it an ideal gift she will cherish beyond the holiday season." },
    { type: 'h', text: "1. <a href='/product-category/bracelets/' style='color: #007bff; text-decoration: underline;'>Bracelets – Elegant & Versatile Gifts</a>" },
    { type: 'p', text: "A bracelet is a timeless choice when selecting <strong>christmas jewellery gifts</strong>. Elegant and easy to style, bracelets add a refined touch to both casual and festive outfits. At Barosche, our designs focus on clean lines and modern simplicity, making them perfect for layering or wearing individually. Whether she prefers delicate pieces or slightly bold styles, our bracelets offer versatility, comfort, and effortless elegance—making them ideal for daily wear." },
    { type: 'h', text: "2. <a href='/product-category/rings/' style='color: #007bff; text-decoration: underline;'>Rings – Meaningful & Timeless</a>" },
    { type: 'p', text: "Rings are classic gifts that symbolize love, connection, and personal expression. A beautifully crafted ring makes a thoughtful and lasting present during the festive season. Our collection features minimalist designs that can be worn every day or layered to create a more personalized look. Whether simple or modern in style, rings remain one of the most meaningful <strong>christmas gift ideas for her</strong>." },
    { type: 'h', text: "3. <a href='/product-category/earrings/' style='color: #007bff; text-decoration: underline;'>Earrings – Everyday Luxury</a>" },
    { type: 'p', text: "Earrings are among the most loved and versatile jewellery pieces, making them a popular choice for gifting. From understated studs to contemporary minimalist designs, our earrings are lightweight, comfortable, and designed for long wear. They effortlessly enhance everyday outfits while also adding a touch of elegance to festive looks, making them a perfect balance of style and practicality." },
    { type: 'h', text: "4. <a href='/product-category/pendants/' style='color: #007bff; text-decoration: underline;'>Pendants – Personal & Stylish</a>" },
    { type: 'p', text: "Pendants are a beautiful way to add a personal and meaningful touch to any jewellery collection. These pieces can be worn alone for a minimal look or layered for a more fashionable style. At Barosche, our pendants are crafted to combine simplicity with elegance, making them suitable for both everyday wear and special occasions. A thoughtfully chosen pendant becomes more than just a gift—it becomes a cherished keepsake." },
    { type: 'p', text: "With a focus on elegance, comfort, and versatility, Barosche ensures that every piece in our collection makes the perfect <strong>christmas jewellery gift</strong>—something she will love, wear, and remember long after the festive season." },

    { type: 'h', text: "Luxury Christmas Gifts for Women" },
    { type: 'p', text: "If you're searching for <strong>luxury christmas gifts for women</strong>, Barosche offers jewellery that perfectly blends premium craftsmanship with modern, wearable design. Our collection is thoughtfully created to deliver elegance without excess—making each piece feel refined, meaningful, and effortlessly stylish. Whether you're choosing a gift for a loved one or someone special, our jewellery is designed to make a lasting impression during the festive season." },
    { type: 'p', text: "Luxury today is not just about bold statement pieces—it's about subtle sophistication, attention to detail, and timeless appeal. At Barosche, we embrace minimalist luxury, where each design reflects simplicity while maintaining a high-end finish. This ensures that every piece can be worn comfortably, whether for special occasions, holiday gatherings, or everyday styling." },
    { type: 'p', text: "Our jewellery is crafted to suit modern lifestyles, offering versatility without compromising on elegance. From delicate bracelets and sleek rings to refined earrings and pendants, each piece complements her personal style while adding a touch of understated luxury. These are gifts she can wear beyond Christmas, making them both beautiful and practical." },
    { type: 'p', text: "Choosing <strong>luxury christmas gifts for women</strong> from Barosche means selecting something that goes beyond trends. It's about giving a piece that feels personal, timeless, and thoughtfully designed—something she will cherish, wear, and remember long after the festive celebrations are over." },

    { type: 'h', text: "Jewellery for the Festive Season & Beyond" },
    { type: 'p', text: "One of the most beautiful things about gifting jewellery is that it isn't limited to a single moment. A thoughtfully chosen <strong>christmas jewellery gift</strong> becomes something she can wear and enjoy throughout the year—whether she's at work, attending events, or heading out for casual outings. Unlike seasonal gifts, jewellery carries lasting value, making it a meaningful reminder of the festive season every time she wears it." },
    { type: 'p', text: "At Barosche, our designs are created with both celebration and everyday life in mind. Each piece is crafted to transition effortlessly from festive occasions to daily styling, ensuring your gift remains relevant long after Christmas has passed. From subtle elegance to refined simplicity, our jewellery complements a wide range of outfits and moods." },
    { type: 'h', text: "Designed for Lasting Wear" },
    { type: 'p', text: "Our collection focuses on:<br/><strong>Lightweight Comfort:</strong> Pieces that are easy to wear all day without discomfort<br/><strong>Everyday Versatility:</strong> Designs that suit both casual looks and special occasions<br/><strong>Minimal Yet Luxurious Appeal:</strong> A refined aesthetic that adds elegance without being overpowering<br/><strong>Easy Mix-and-Match Styling:</strong> Jewellery that can be layered or styled individually for different looks" },
    { type: 'p', text: "By combining style, comfort, and versatility, Barosche ensures that your <strong>christmas jewellery gift</strong> continues to bring joy well beyond the holiday season. It becomes more than just a festive present—it becomes a part of her everyday style and a lasting symbol of thoughtful gifting." },

    { type: 'h', text: "How to Choose the Best Christmas Gift for Her" },
    { type: 'p', text: "Choosing the right <strong>best christmas gifts for her</strong> doesn't have to be complicated. With a thoughtful approach, you can find a piece of jewellery that feels personal, stylish, and truly meaningful. The key is to focus on her preferences, lifestyle, and how she likes to express herself through accessories. A well-chosen <strong>christmas jewellery gift</strong> not only enhances her style but also becomes something she will cherish long after the festive season." },
    { type: 'p', text: "Here are a few simple tips to help you make the perfect choice:" },
    { type: 'h', text: "1. Know Her Style" },
    { type: 'p', text: "Pay attention to the type of jewellery she usually wears. Does she prefer minimal and delicate designs, bold statement pieces, or classic timeless styles? Choosing something that matches her personality ensures your gift feels thoughtful and personal." },
    { type: 'h', text: "2. Choose Versatile Pieces" },
    { type: 'p', text: "Versatility is essential when selecting <strong>christmas gift ideas for her</strong>. Look for jewellery that she can wear daily as well as on special occasions. Pieces like simple rings, bracelets, or earrings are ideal because they easily complement different outfits." },
    { type: 'h', text: "3. Go for Timeless Designs" },
    { type: 'p', text: "Trendy items may come and go, but timeless designs remain stylish year after year. Minimalist jewellery with clean lines and elegant finishes makes a reliable and long-lasting gift choice." },
    { type: 'h', text: "4. Think About Layering" },
    { type: 'p', text: "Layering is a popular trend in modern jewellery styling. Pieces that can be stacked or layered—such as rings, necklaces, and bracelets—offer more flexibility and allow her to create her own unique look." },
    { type: 'p', text: "By keeping these tips in mind, you can confidently choose one of the <strong>best christmas gifts for her</strong>—a piece that feels elegant, meaningful, and perfectly suited to her style." },

    { type: 'h', text: "Perfect Moments for Christmas Jewellery Gifting" },
    { type: 'p', text: "Christmas is filled with meaningful moments, making it the perfect time to give a thoughtful and lasting gift. A carefully selected <strong>christmas jewellery gift</strong> adds a personal touch to every occasion, turning simple celebrations into unforgettable memories. Whether it's a grand gesture or a small surprise, jewellery always feels special and timeless." },
    { type: 'h', text: "Celebrate Every Festive Moment" },
    { type: 'p', text: "<strong>Holiday Celebrations:</strong> Make festive gatherings even more memorable with elegant jewellery that reflects the joy and warmth of the season.<br/><strong>Secret Santa Gifts:</strong> Jewellery is a thoughtful and versatile option for Secret Santa, offering something stylish yet meaningful that anyone would appreciate.<br/><strong>Romantic Surprises:</strong> Surprise your partner with a beautiful piece of jewellery that expresses love and appreciation during the most magical time of the year.<br/><strong>Family Gifting:</strong> Show your appreciation for loved ones with jewellery that feels personal and lasting—perfect for mothers, sisters, or close family members.<br/><strong>End-of-Year Appreciation Gifts:</strong> Celebrate achievements and milestones with a meaningful gift that marks the end of the year on a special note." },
    { type: 'p', text: "No matter the occasion, a well-chosen <strong>christmas jewellery gift</strong> becomes more than just a present—it becomes a cherished memory she can carry with her every day." },

    { type: 'h', text: "Gift Packaging & Presentation Matters" },
    { type: 'p', text: "A beautiful piece of jewellery becomes even more special when it's presented thoughtfully. At Barosche, we understand that the unboxing experience is part of the gift itself." },
    { type: 'h', text: "Why Packaging Adds Value" },
    { type: 'p', text: "• Creates a memorable first impression<br/>• Enhances the emotional impact of your gift<br/>• Makes gifting effortless and elegant<br/>• Adds a premium, luxury feel" },
    { type: 'p', text: "Every detail—from packaging to presentation—is designed to make your Christmas jewellery gift feel truly special from the moment it's received." },

    { type: 'h', text: "Trending Christmas Jewellery Styles This Year" },
    { type: 'p', text: "Staying updated with current trends can help you choose a gift that feels modern and stylish while still being timeless." },
    { type: 'h', text: "Popular Styles for Christmas Gifting" },
    { type: 'p', text: "• Minimalist gold and silver pieces<br/>• Layered necklaces and stackable rings<br/>• Delicate everyday earrings<br/>• Personalized and symbolic jewellery" },
    { type: 'p', text: "These trends reflect a shift toward <strong>wearable luxury</strong>, where elegance meets practicality." },

    { type: 'h', text: "Personalised Jewellery Gift Ideas" },
    { type: 'p', text: "Adding a personal touch can make your Christmas gift even more meaningful and memorable." },
    { type: 'h', text: "Thoughtful Personalisation Ideas" },
    { type: 'p', text: "• Initial or name pendants<br/>• Birthstone-inspired pieces<br/>• Symbolic charms with meaning<br/>• Layered combinations curated for her style" },
    { type: 'p', text: "<strong>Personalised jewellery</strong> transforms a beautiful gift into something deeply emotional and unique." },

    { type: 'h', text: "Jewellery Care Tips to Keep It Looking New" },
    { type: 'p', text: "A well-maintained piece of jewellery can last for years and continue to shine just like the day it was gifted." },
    { type: 'h', text: "Simple Care Tips" },
    { type: 'p', text: "• Store jewellery in a dry, soft-lined box<br/>• Avoid contact with perfumes and chemicals<br/>• Clean gently with a soft cloth<br/>• Remove before swimming or showering" },
    { type: 'p', text: "Sharing care tips adds value and helps customers feel confident in their purchase." },

    { type: 'h', text: "Last-Minute Christmas Jewellery Gifts" },
    { type: 'p', text: "Running out of time? Jewellery is one of the best last-minute gifts that still feels thoughtful and luxurious." },
    { type: 'h', text: "Why Jewellery Works Last-Minute" },
    { type: 'p', text: "• Universally appreciated<br/>• Easy to choose with minimal sizing concerns<br/>• Instantly elevates gifting value<br/>• Suitable for all relationships" },
    { type: 'p', text: "Even a simple, elegant piece can make a big impression during the holidays." },

    { type: 'h', text: "Jewellery Gifting by Relationship" },
    { type: 'p', text: "Choosing the right jewellery often depends on your relationship with the recipient." },
    { type: 'h', text: "Gift Ideas Based on Relationship" },
    { type: 'p', text: "<strong>For Partner</strong> – Romantic pendants or meaningful rings<br/><strong>For Mother</strong> – Elegant, timeless pieces<br/><strong>For Sister</strong> – Trendy and minimal designs<br/><strong>For Friend</strong> – Simple, everyday jewellery" },
    { type: 'p', text: "This section helps users quickly find relevant gift ideas." },

    { type: 'h', text: "Affordable Luxury: Elegant Gifts Within Budget" },
    { type: 'p', text: "Luxury doesn't always mean expensive. At Barosche, we focus on offering jewellery that feels premium while remaining accessible." },
    { type: 'h', text: "Smart Gifting Tips" },
    { type: 'p', text: "• Choose minimalist designs for timeless appeal<br/>• Opt for versatile pieces she can wear daily<br/>• Focus on craftsmanship over size or boldness" },
    { type: 'p', text: "Affordable luxury ensures your gift feels valuable without overspending." },

    { type: 'h', text: "Sustainable & Thoughtful Gifting" },
    { type: 'p', text: "Modern gifting is not just about beauty—it's also about responsibility." },
    { type: 'h', text: "Why Conscious Gifting Matters" },
    { type: 'p', text: "• Supports mindful consumption<br/>• Encourages long-lasting purchases<br/>• Reduces waste from fast fashion accessories" },
    { type: 'p', text: "Choosing jewellery that lasts aligns with a more sustainable lifestyle." },

    { type: 'h', text: "Why Choose Barosche for Christmas Jewellery Gifts?" },
    { type: 'p', text: "At Barosche, we believe that the perfect <strong>christmas jewellery gift</strong> should be more than just beautiful—it should be meaningful, wearable, and designed to last. Our jewellery is thoughtfully created for modern lifestyles, combining elegance with everyday comfort. This makes every piece an ideal choice for festive gifting, whether you're looking for something subtle or a refined statement." },
    { type: 'p', text: "We focus on designs that feel timeless yet contemporary, ensuring your gift remains stylish well beyond the holiday season. Each piece is crafted with attention to detail, allowing it to seamlessly fit into her daily routine while still carrying the charm of a special Christmas present." },
    { type: 'h', text: "What Makes Us Special" },
    { type: 'p', text: "<strong>Minimalist Luxury Designs:</strong> Clean, modern aesthetics that balance simplicity with sophistication, perfect for effortless styling<br/><strong>High-Quality Craftsmanship:</strong> Carefully crafted pieces designed for durability, comfort, and a premium finish<br/><strong>Perfect for Gifting:</strong> Thoughtful designs that make choosing a meaningful christmas jewellery gift easy and special<br/><strong>Designed for Everyday Elegance:</strong> Jewellery that transitions seamlessly from festive occasions to daily wear" },
    { type: 'p', text: "Every Barosche piece reflects a commitment to simplicity, sophistication, and lasting beauty. When you choose Barosche for your <strong>christmas jewellery gifts</strong>, you're giving more than just jewellery—you're giving a timeless expression of style, care, and celebration that she will cherish every day." },

    { type: 'h', text: "Make This Christmas Unforgettable" },
    { type: 'p', text: "A carefully selected <strong>christmas jewellery gift</strong> is more than just a present—it's a symbol of love, appreciation, and celebration. Whether you're exploring <strong>christmas gift ideas for her</strong> or searching for a <strong>luxury christmas gift for her</strong>, Barosche offers timeless jewellery that she will cherish every day." },

    { type: 'h', text: "Find the Perfect Gift Today" },
    { type: 'p', text: "Make this festive season unforgettable with jewellery that speaks from the heart. Whether you're searching for <strong>christmas gift ideas for her</strong> or a refined <strong>luxury christmas gift for her</strong>, Barosche has something truly special waiting for you when you choose to <a href='https://barosche.com/' style='color: #007bff; text-decoration: underline;'>buy jewellery online</a>." },
    { type: 'p', text: "Explore the collection and choose a gift she'll cherish forever." },
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

function QuickViewModal({ product, currency, ui, onClose, onAddToCart, wishlist, onToggleWishlist }) {
    const [qty, setQty] = useState(1);
    const variant = getFirstVariant(product);
    const images = variant.images || [];
    const videos = variant.videos || [];
    const categoryUrl = categorySlugMap[product.category] || 'jewellery';

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

    useEffect(() => {
        if (activeItem?.type === 'video' && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
        }
    }, [activeIdx, activeItem]);

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
export default function Christmas() {
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