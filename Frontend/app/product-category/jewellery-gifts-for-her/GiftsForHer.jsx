'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './GiftsForHer.css';
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
  
    {
        q: "What is the best jewellery gift for her?",
        a: " The best <strong>jewellery gift for her</strong> depends on her personal style, but minimalist rings, bracelets, and pendants are always safe and elegant choices."
    },
    {
        q: "Is jewellery a good gift for everyday wear?",
        a: " Yes, especially when it is designed as <strong>jewellery for everyday</strong>—lightweight, versatile, and comfortable for daily use."
    },
    {
        q: "How do I choose the right jewellery for her?",
        a: " Observe her style preferences—whether she likes minimal, bold, or classic designs—and choose something that matches her personality."
    },
    {
        q: "What type of jewellery is most popular for gifting?",
        a: " Bracelets, rings, earrings, and pendants are among the most popular options for a <strong> gift for her jewellery.</strong>."
    },
    {
        q: "Are minimalist jewellery pieces good for gifting?",
        a: " Yes, minimalist jewellery is timeless, versatile, and easy to wear, making it perfect for gifting."
    },
    {
        q: "Can jewellery be worn daily?",
        a: " Absolutely. Many pieces are designed specifically as <strong>jewellery for everyday,</strong> ensuring comfort and durability."
    },
    {
        q: "What makes jewellery a meaningful gift?",
        a: " Jewellery carries emotional value and often represents special memories, making it a lasting and meaningful gift."
    },
    {
        q: "Are bracelets a good jewellery gift for her?",
        a: " Yes, a <strong> bracelet gift for her</strong> is elegant, versatile, and suitable for both casual and formal occasions."
    },
    {
        q: "What occasions are best for gifting jewellery?",
        a: " Jewellery is perfect for birthdays, anniversaries, Valentine's Day, Christmas, and even \"just because\" moments."
    },
    {
        q: "How can I make a jewellery gift more special?",
        a: " Choose a piece that reflects her personality and style to make your <strong>jewellery gift for her</strong> more personal and thoughtful."
    },
    {
        q: "Is jewellery a good last-minute gift?",
        a: " Yes, jewellery is a reliable and thoughtful last-minute gift that still feels meaningful and elegant."
    },
    {
        q: "What type of jewellery suits all outfits?",
        a: " Minimalist and timeless designs easily complement both casual and formal outfits."
    },
    {
        q: "Can I gift jewellery without knowing her exact style?",
        a: " Yes, simple and classic designs are safe options if you are unsure about her preferences."
    },
    {
        q: "Are earrings a good everyday gift?",
        a: " Yes, lightweight and minimal earrings are perfect for everyday wear and add subtle elegance."
    },
    {
        q: "Why are rings a popular jewellery gift?",
        a: " Rings symbolize connection and style, making them a timeless and meaningful choice."
    },
    {
        q: "What should I consider before buying jewellery as a gift?",
        a: " Consider her style, comfort, lifestyle, and whether the piece can be worn daily."
    },
    {
        q: "Is layering jewellery a good trend?",
        a: " Yes, layering rings, necklaces, and bracelets allows for personalized styling and is very popular."
    },
    {
        q: "How long does jewellery typically last?",
        a: " With proper care, high-quality jewellery can last for years while maintaining its beauty."
    },
    {
        q: "Can jewellery be both stylish and comfortable?",
        a: " Yes, modern designs focus on both aesthetics and comfort, making them ideal for everyday wear."
    },
    {
        q: "Why choose Barosche for jewellery gifts?",
        a: " Barosche offers minimalist, high-quality designs that are perfect for both gifting and everyday elegance."
    }
];

// ─────────────────────────────────────────────────────────
//  FASHION JEWELLERY CONTENT DATA — Luxury Jewellery Gifts
// ─────────────────────────────────────────────────────────
const fashionJewelleryContent = [
     { type: 'h', text: "Timeless Jewellery Gifts for Her – Elegant & Meaningful" },
    { type: 'p', text: "Finding the perfect <strong>jewellery gift for her</strong> is more than just selecting a beautiful piece—it's about expressing emotions, creating memories, and showing how much you truly care. Jewellery has a unique way of capturing meaningful moments, making it one of the most thoughtful and lasting gifts you can give. At Barosche, we curate a refined collection of jewellery that transforms everyday accessories into symbols of love, appreciation, and elegance." },
    { type: 'p', text: "Whether you are celebrating a birthday, anniversary, or Valentine's Day or simply want to surprise her with something special, our jewellery is designed to leave a lasting impression. Each piece reflects a blend of modern minimalism and timeless sophistication, ensuring it complements her personal style while standing out with subtle luxury." },
    { type: 'p', text: "Our collection includes elegant rings, delicate necklaces, modern bracelets, and minimalist earrings—carefully crafted to suit her everyday lifestyle. These pieces are designed not only to enhance her look but also to become a part of her daily routine. From simple designs she can wear to work to refined styles perfect for special occasions, Barosche jewellery offers versatility without compromising on elegance." },
    { type: 'p', text: "If you are searching for a <strong>gift for her jewellery</strong> that feels personal, meaningful, and effortlessly stylish, Barosche provides the perfect balance of quality, design, and emotion. Each piece is created to be cherished, making it more than just a gift—it becomes a lasting reminder of your thoughtfulness and care." },

    { type: 'h', text: "Why Jewellery is the Perfect Gift for Her" },
    { type: 'p', text: "Jewellery has always been one of the most meaningful and timeless gifts you can give. Unlike many other presents, it carries deep emotional value and often becomes a cherished part of her everyday life. A thoughtfully chosen <strong>jewellery gift for her</strong> can symbolize love, appreciation, and the special moments you share—turning a simple accessory into a lasting memory." },
    { type: 'p', text: "What makes jewellery truly special is its ability to connect with emotions. Whether it's a delicate bracelet, a minimalist ring, or an elegant pendant, each piece can represent an important milestone—be it a birthday, anniversary, celebration, or even a spontaneous gesture of love. Over time, these pieces become more than just fashion—they become personal keepsakes she can treasure forever." },
    { type: 'p', text: "Another reason jewellery stands out as the perfect gift is its versatility. A well-designed piece can be worn daily, effortlessly complementing both casual and formal outfits. This makes it not only a beautiful gift but also a practical one that she can enjoy again and again. Choosing the right <strong>gift for her jewellery</strong> means selecting something that reflects her personality while fitting seamlessly into her lifestyle." },
    { type: 'p', text: "At Barosche, we focus on minimalist luxury—creating jewellery that is refined, modern, and easy to wear. Our designs are thoughtfully crafted to balance elegance with simplicity, ensuring each piece enhances her natural style without feeling overwhelming. Whether she prefers subtle everyday pieces or understated statement designs, our collection offers something she can wear with confidence." },
    { type: 'p', text: "Barosche jewellery is designed to complement every outfit and occasion, making it ideal for both everyday wear and special moments. When you choose a piece from our collection, you're not just giving jewellery—you're giving a meaningful expression of care, style, and lasting beauty." },

    { type: 'h', text: "Explore Our Jewellery Gift Collection" },
    { type: 'p', text: "At Barosche, our curated range of jewellery is designed to make every <strong>jewellery gift for her</strong> feel thoughtful, elegant, and timeless. Whether you are looking for something minimal for daily wear or a refined piece for special occasions, our collection offers versatile options that suit every style and personality. Each piece is crafted to combine modern aesthetics with lasting comfort, making it a meaningful addition to her jewellery collection." },

    { type: 'h', text: "1. <a href='https://barosche.com/product-category/bracelets/'>Bracelet Gift for Her</a>" },
    { type: 'p', text: "A <strong>bracelet gift for her</strong> is one of the most elegant and versatile choices you can make. Bracelets effortlessly enhance any outfit, adding a subtle touch of sophistication to both casual and formal looks. At Barosche, our bracelets are designed with clean lines and modern aesthetics, making them perfect for stacking or wearing individually. Whether she prefers delicate minimal designs or slightly bold statement styles, our collection offers pieces that reflect her unique taste. These bracelets are lightweight, comfortable, and ideal for everyday wear, ensuring she can carry your gift with her wherever she goes." },

    { type: 'h', text: "2. <a href='https://barosche.com/product-category/rings/'>Rings That Tell a Story</a>" },
    { type: 'p', text: "Rings are timeless symbols of connection, style, and personal expression. A thoughtfully chosen ring can hold deep emotional meaning, making it a perfect <strong>gift for her jewellery</strong>. Our minimalist rings are designed for everyday elegance and can be worn alone for a subtle look or layered to create a more personalized style. From sleek bands to modern designs, each piece is crafted to complement her individuality. A ring from Barosche is more than just jewellery—it becomes a reflection of her personality and a lasting reminder of special moments." },

    { type: 'h', text: "3. <a href='https://barosche.com/product-category/earrings/'>Earrings for Everyday Elegance</a>" },
    { type: 'p', text: "Earrings are an essential part of every jewellery collection and one of the easiest ways to elevate any look. Our collection includes everything from classic studs to contemporary minimalist designs, offering options that suit both daily wear and special occasions. Designed to be lightweight and comfortable, Barosche earrings are perfect for long wear without compromising on style. Whether she prefers subtle elegance or modern charm, these earrings add effortless sophistication to her everyday outfits." },

    { type: 'h', text: "4. <a href='https://barosche.com/product-category/pendants/'>Pendants & Neck Jewellery</a>" },
    { type: 'p', text: "Pendants and neck jewellery are perfect for adding a personal and meaningful touch to her style. These pieces are versatile enough to be worn alone for a clean, minimal look or layered with other chains for a more fashionable statement. At Barosche, our pendants are crafted to blend simplicity with elegance, making them suitable for both everyday wear and special occasions. A beautifully designed pendant not only enhances her outfit but also becomes a piece she can cherish for years to come." },
    { type: 'p', text: "With a focus on versatility, elegance, and modern design, Barosche ensures that every piece in our collection makes the perfect <strong>jewellery gift for her</strong>—something she will love, wear, and remember every day." },

    { type: 'h', text: "Jewellery for Everyday Wear" },
    { type: 'p', text: "When choosing a <strong>jewellery gift for her</strong>, versatility plays a key role. The best pieces are not only beautiful but also practical—designed to be worn effortlessly every day. At Barosche, our collection is thoughtfully created as <strong>jewellery for everyday</strong>, allowing her to style it comfortably from morning to evening, whether she's at work, out for a casual outing, or attending a special event." },
    { type: 'p', text: "Every piece is designed with a focus on comfort and wearability without compromising on elegance. Our jewellery blends seamlessly with different outfits and occasions, making it easy for her to express her personal style in a subtle yet refined way. From minimalist rings and delicate bracelets to elegant earrings and pendants, each design complements her daily routine while adding a touch of understated luxury." },

    { type: 'h', text: "Why Barosche Jewellery is Perfect for Everyday Wear" },
    { type: 'p', text: "<strong>Why Barosche Jewellery is Perfect for Everyday Wear:</strong><br/>• <strong>Lightweight and Comfortable:</strong> Designed for long hours of wear without discomfort<br/>•<strong> Perfect for Daily Styling:</strong> Simple yet elegant designs that suit every outfit<br/>•<strong> Minimal Yet Luxurious: </strong>A refined look that enhances style without being overpowering<br/>• <strong>Easy to Mix and Match:</strong> Pieces that can be layered or styled individually" },
    { type: 'p', text: "Our focus on simplicity and versatility ensures that every <strong>jewellery gift for her</strong> becomes more than just an accessory—it becomes a part of her everyday life. This makes Barosche jewellery a thoughtful and meaningful choice, giving her something she can truly enjoy, style, and cherish every single day." },

    { type: 'h', text: "How to Choose the Right Jewellery Gift for Her" },
    { type: 'p', text: "Selecting the perfect <strong>gift for her jewellery</strong> can sometimes feel overwhelming, especially when you want it to be meaningful, stylish, and something she will truly love. The key is to focus on her personality, lifestyle, and how she likes to express herself through accessories. A thoughtfully chosen <strong>jewellery gift for her</strong> not only enhances her style but also becomes a lasting reminder of your care and attention." },
    { type: 'p', text: "Here are a few simple yet effective tips to help you choose the right piece:" },

    { type: 'h', text: "1. Understand Her Style" },
    { type: 'p', text: "Start by observing her personal style. Does she prefer minimal and delicate pieces, bold statement jewellery, or classic timeless designs? Choosing jewellery that reflects her personality ensures that your gift feels personal and thoughtful. Minimalist designs are often a safe and elegant choice, especially if you are unsure of her exact preferences." },

    { type: 'h', text: "2. Go for Versatility" },
    { type: 'p', text: "Versatile jewellery is always appreciated because it can be worn across different occasions. Look for pieces that she can style with both casual and formal outfits. Everyday wear options, such as simple rings, bracelets, or earrings, make a practical yet beautiful <strong>jewellery gift for her</strong>." },

    { type: 'h', text: "3. Choose Timeless Designs" },
    { type: 'p', text: "Trends may change, but timeless designs remain relevant. Minimalist jewellery, clean shapes, and elegant finishes never go out of style. By choosing classic pieces, you ensure that your gift stays fashionable and wearable for years to come." },

    { type: 'h', text: "4. Consider Layering Options" },
    { type: 'p', text: "Layering has become a popular styling trend in modern jewellery. Pieces that can be stacked or layered—like rings, bracelets, or necklaces—offer more flexibility and creativity in styling. This allows her to mix and match different pieces to create her own unique look." },
    { type: 'p', text: "By keeping these points in mind, you can confidently select a <strong>gift for her jewellery</strong> that feels thoughtful, stylish, and meaningful. The right piece will not only complement her wardrobe but also become something she values and enjoys wearing every day." },

    { type: 'h', text: "Perfect Occasions for Jewellery Gifts" },
    { type: 'p', text: "Jewellery is one of the most versatile and meaningful gifts you can give, making it perfect for celebrating life's most special moments. A thoughtfully chosen <strong>jewellery gift for her</strong> goes beyond the occasion—it becomes a lasting memory she can wear and cherish every day. Whether it's a grand celebration or a simple, heartfelt gesture, jewellery always feels personal and timeless." },

    { type: 'h', text: "Celebrate Every Special Moment" },
    { type: 'p', text: "<strong>Celebrate Every Special Moment:</strong><br/>• <strong>Birthday Gifts:</strong> Make her birthday unforgettable with a piece of jewellery that reflects her personality and style. Whether it's something minimal for everyday wear or a slightly statement design, it's a gift she'll treasure long after the celebration.<br/>• <strong>Anniversary Surprises:</strong> Jewellery beautifully symbolizes love and commitment, making it an ideal anniversary gift. A carefully chosen piece can represent your journey together and serve as a lasting reminder of your bond.<br/>• <strong>Valentine's Day Gifts:</strong> Express your love with elegant and meaningful jewellery. From delicate rings to charming pendants, a <strong>jewellery gift for her</strong> on Valentine's Day adds a romantic and thoughtful touch.<br/>• <strong>Christmas Gifts:</strong> The festive season is the perfect time to give something timeless and special. Jewellery makes for a memorable Christmas gift that she can wear throughout the year.<br/>• <strong>Just Because Moments:</strong> Sometimes, the most meaningful gifts are the unexpected ones. A spontaneous <strong>gift for her jewellery</strong> can brighten her day and show appreciation without needing a specific occasion." },
    { type: 'p', text: "No matter the celebration, a well-chosen <strong>jewellery gift for her</strong> always feels special, thoughtful, and deeply meaningful. It's more than just a present—it's a lasting expression of love, style, and connection that she will carry with her every day." },

    { type: 'h', text: "Trending Jewellery Gift Ideas for Her" },
    { type: 'p', text: "Staying updated with current trends can help you choose a <strong>jewellery gift for her</strong> that feels modern and stylish. While timeless pieces are always a great choice, trending designs add a fresh and fashionable touch to your gift." },
    { type: 'p', text: "<strong>Some popular trends include:</strong><br/>• <strong>Layered Necklaces: </strong>Perfect for creating a stylish, stacked look<br/>• <strong>Stackable Rings:</strong> Minimal rings that can be worn together<br/>•<strong> Charm Bracelets: </strong>Personal and meaningful gifting options<br/>• <strong>Minimal Stud Earrings:</strong> Clean, everyday essentials<br/>• <strong>Dainty Pendants:</strong> Subtle yet elegant statement pieces" },
    { type: 'p', text: "At Barosche, we blend these trends with timeless design, ensuring your gift remains stylish for years to come." },

    { type: 'h', text: "Personalised Jewellery Gifts for Her" },
    { type: 'p', text: "Nothing feels more special than a personalised <strong>gift for her jewellery</strong>. Adding a personal touch transforms a beautiful accessory into a meaningful keepsake." },
    { type: 'p', text: "<strong>You can choose jewellery that reflects the following:</strong><br/>• Her personality and style<br/>• Important milestones or memories<br/>• Everyday preferences and lifestyle" },
    { type: 'p', text: "Even minimalist jewellery can feel deeply personal when chosen thoughtfully. At Barosche, our designs are versatile enough to feel unique to every wearer." },

    { type: 'h', text: "Jewellery Care Tips – Keep Her Gift Shining" },
    { type: 'p', text: "A <strong>jewellery gift for her</strong> becomes even more valuable when it lasts for years. Proper care ensures that each piece maintains its shine and elegance." },
    { type: 'p', text: "<strong>Simple Care Tips:</strong><br/>• Store jewellery in a dry, soft-lined box<br/>• Avoid contact with water, perfumes, and chemicals<br/>• Clean gently with a soft cloth after use<br/>• Remove before workouts or heavy activities" },
    { type: 'p', text: "With the right care, Barosche jewellery will continue to look beautiful and elegant over time." },

    { type: 'h', text: "Why Choose Barosche for Jewellery Gifts?" },
    { type: 'p', text: "At Barosche, we believe jewellery should be more than just visually beautiful—it should be effortlessly wearable, meaningful, and a natural part of everyday life. Our approach focuses on creating pieces that combine modern elegance with practical design, ensuring that every <strong>jewellery gift for her</strong> feels both special and easy to wear." },
    { type: 'p', text: "We understand that today's jewellery needs to be versatile, timeless, and comfortable. That's why every Barosche piece is thoughtfully designed to complement her daily style while still standing out with a refined, luxurious touch. Whether it's for a special occasion or everyday wear, our jewellery is created to fit seamlessly into her lifestyle." },

    { type: 'h', text: "What Makes Us Different" },
    { type: 'p', text: "<br/>•<strong> Minimalist Luxury Designs:</strong> Our jewellery reflects a clean, modern aesthetic that balances simplicity with sophistication—perfect for those who appreciate understated elegance.<br/>•<strong> High-Quality Craftsmanship: </strong>Each piece is carefully crafted with attention to detail, ensuring durability, comfort, and a premium finish that lasts over time.<br/>• <strong>Perfect for Gifting: </strong>Every design is created with gifting in mind, making it easy to find a meaningful <strong>gift for her jewellery</strong> that feels personal and thoughtful.<br/>• <strong>Designed for Everyday Elegance: </strong>Our collections are made to be worn daily, allowing her to enjoy style and comfort without compromise." },
    { type: 'p', text: "Each Barosche piece is a reflection of thoughtful design, combining sophistication with simplicity. When you choose Barosche, you're not just selecting <a href='/https://barosche.com/'>fine jewellery </a>—you're choosing a timeless expression of style, quality, and meaning that she can cherish every day." },
    { type: 'p', text: "A thoughtful jewellery gift for her is more than just an accessory—it's a symbol of love, care, and appreciation. At Barosche, we create jewellery that blends elegance with simplicity, making every piece perfect for gifting and everyday wear." },
    { type: 'p', text: "Explore our collection and find the perfect piece that she will cherish every day." },
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
export default function GiftsForHer() {
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