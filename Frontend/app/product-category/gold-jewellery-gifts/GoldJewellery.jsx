'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './GoldJewellery.css';
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
    pageTitle: "Gold Jewellery Gifts for Her – Rings, Earrings, Pendants & Bracelets",
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
    { q: "Why is gold jewellery a popular gift choice?", a: "Gold jewellery is valued for its timeless appeal, emotional significance, and long-lasting quality, making it a meaningful gift for any occasion." },
    { q: "Is gold jewellery a good gift for everyday wear?", a: "Yes, modern gold jewellery is designed to be lightweight and versatile, making it perfect for daily use." },
    { q: "What occasions are best for gifting gold jewellery?", a: "Gold jewellery is ideal for birthdays, anniversaries, weddings, festivals, and special milestones." },
    { q: "Is a ring a good gift option?", a: "Yes, a ring as gift symbolizes love, commitment, and connection, making it a highly meaningful choice." },
    { q: "Are earrings a safe gifting option?", a: "Earrings as a gift are a great choice because they do not require sizing and suit almost everyone." },
    { q: "What makes a gold bracelet special?", a: "A gold bracelet gift combines elegance and versatility, making it suitable for both everyday wear and special occasions." },
    { q: "How do I choose the right gold jewellery gift?", a: "Consider the recipient's style, prefer timeless designs, and choose pieces that are comfortable for daily wear." },
    { q: "Is gold jewellery suitable for all age groups?", a: "Yes, gold jewellery designs are available for all age groups, from minimal styles to more refined pieces." },
    { q: "Can gold jewellery be worn daily without damage?", a: "Yes, with proper care, gold jewellery can be worn daily and still maintain its shine and durability." },
    { q: "What type of gold jewellery is best for beginners?", a: "Minimalist rings, simple earrings, and lightweight bracelets are great starting options." },
    { q: "Does gold jewellery go out of fashion?", a: "No, gold jewellery has a timeless appeal and remains stylish across generations." },
    { q: "Is gold jewellery a valuable investment?", a: "Yes, gold retains its value over time, making it both a beautiful and practical gift." },
    { q: "How can I make my gold jewellery gift more personal?", a: "Choose designs that match the recipient's personality or opt for symbolic pieces like rings or pendants." },
    { q: "What is better for gifting: rings or bracelets?", a: "Both are excellent choices—rings are symbolic, while bracelets are versatile and easy to wear." },
    { q: "Is lightweight gold jewellery durable?", a: "Yes, lightweight designs are crafted for comfort and durability, especially for daily wear." },
    { q: "Can gold jewellery be paired with other accessories?", a: "Yes, gold jewellery can be easily mixed and matched with other pieces for a stylish look." },
    { q: "How do I know if gold jewellery suits her style?", a: "Observe her current jewellery preferences—minimal, bold, or classic—and choose accordingly." },
    { q: "Is gold jewellery a romantic gift?", a: "Yes, gold jewellery is often associated with love and emotion, making it perfect for romantic gestures." },
    { q: "How should gold jewellery be stored?", a: "It should be kept in a soft pouch or jewellery box to prevent scratches and maintain shine." },
    { q: "Why choose gold jewellery over other gift options?", a: "Gold jewellery combines beauty, emotional value, and longevity, making it a timeless and meaningful gift choice." },
];

// ─────────────────────────────────────────────────────────
//  FASHION JEWELLERY CONTENT DATA — Luxury Jewellery Gifts
// ─────────────────────────────────────────────────────────
const fashionJewelleryContent = [
      { type: 'h2', text: "Gold Jewellery Gifts – Timeless & Elegant Gifting Ideas" },
    { type: 'p', text: "Choosing a <strong>gold jewellery gift</strong> is one of the most meaningful ways to celebrate life's special moments. Gold has long been associated with elegance, prosperity, and enduring value, making it a timeless choice for gifting across generations. Whether it's a celebration of love, a personal milestone, or a heartfelt gesture, gold jewellery carries emotional significance that goes far beyond the occasion itself." },
    { type: 'p', text: "At Barosche, we offer a thoughtfully curated collection of modern gold jewellery that blends classic beauty with contemporary design. Each piece is crafted to suit today's lifestyle—lightweight, versatile, and effortlessly stylish. Whether you're looking for a <strong>ring as gift</strong>, a refined <strong>gold bracelet gift</strong>, or elegant <strong>earrings as a gift</strong>, our designs are created to complement both everyday wear and special occasions." },
    { type: 'p', text: "What makes gold jewellery truly special is its ability to hold memories. A simple <strong>ring gift</strong> can symbolize love and commitment, while a delicate bracelet or pendant can become a cherished part of her daily style. Unlike many other gifts, gold jewellery doesn't fade with time—it becomes more meaningful as the years go by." },
    { type: 'p', text: "From birthdays and anniversaries to festive celebrations and personal achievements, gold jewellery fits seamlessly into every moment worth celebrating. It is not just about giving something beautiful, but about choosing a gift that reflects thoughtfulness, appreciation, and lasting connection." },
    { type: 'p', text: "Gold jewellery is more than just a present—it's a timeless keepsake that she can treasure for years to come." },

    { type: 'h2', text: "Why Gold Jewellery Makes the Perfect Gift" },
    { type: 'p', text: "Gold jewellery continues to be one of the most preferred gifting choices, not just for its beauty but for the meaning it carries. It goes beyond being a decorative accessory—gold represents emotions, memories, and lasting value, making it a truly thoughtful gift for any occasion." },
    { type: 'h3', text: "What Makes Gold Jewellery Special" },
    { type: 'ol', text: "<li><strong>Timeless Appeal:</strong> Gold never goes out of style. Its classic charm ensures that it can be worn for years without losing its elegance, making it a gift that remains relevant across trends and generations.</li><li><strong>Symbol of Value &amp; Love:</strong> Gold jewellery has always been associated with deep emotions. It symbolizes love, commitment, appreciation, and celebration, making it perfect for expressing feelings that words sometimes cannot.</li><li><strong>Versatile &amp; Elegant:</strong> One of the biggest advantages of gold jewellery is its versatility. Whether styled for everyday wear or reserved for special occasions, it effortlessly enhances any look with a touch of sophistication.</li><li><strong>Long-Lasting Investment:</strong> Unlike many other gifts, gold holds intrinsic value. It is not only beautiful but also a lasting investment, adding a sense of security and significance to your gift.</li>" },
    { type: 'p', text: "Whether you're choosing a meaningful <strong>ring gift</strong> or a refined <strong>gold bracelet gift</strong>, gold jewellery always feels personal, valuable, and special—making every moment you celebrate even more memorable." },

    { type: 'h2', text: "Explore Our Gold Jewellery Gift Collection" },
    { type: 'p', text: "At Barosche, our gold jewellery collection is thoughtfully designed to reflect modern style while preserving timeless elegance. Each piece is crafted to be lightweight, versatile, and suitable for both everyday wear and special occasions—making it easier to find a <strong>gold jewellery gift</strong> that feels both personal and lasting." },

    { type: 'h3link', text: "1. Rings – Meaningful & Stylish", href: "/product-category/rings/" },
    { type: 'p', text: "A <strong>ring as gift</strong> is one of the most meaningful and symbolic choices you can make. Rings often represent love, commitment, and deep emotional connections, making them perfect for birthdays, anniversaries, or milestone celebrations." },
    { type: 'p', text: "Our minimalist gold rings are designed for effortless everyday wear. Their clean and elegant look allows them to be worn alone for a subtle statement or stacked for a more personalized style. A thoughtfully chosen <strong>ring gift</strong> becomes more than just jewellery—it becomes a lasting memory." },

    { type: 'h3link', text: "2. Earrings – Elegant & Versatile", href: "/product-category/earrings/" },
    { type: 'p', text: "Choosing <strong>earrings as a gift</strong> is a safe yet stylish option that suits every personality and occasion. Since they don't require sizing, they are easy to select while still feeling thoughtful and refined." },
    { type: 'p', text: "From delicate studs to more detailed designs, gold earrings offer a perfect balance of simplicity and sophistication. They can be worn daily or styled for special occasions, making them a versatile addition to any jewellery collection." },

    { type: 'h3link', text: "3. Gold Bracelets – Modern & Sophisticated", href: "/product-category/bracelets/" },
    { type: 'p', text: "A <strong>gold bracelet gift</strong> combines modern elegance with everyday comfort. Bracelets are lightweight, easy to wear, and highly versatile—making them ideal for both minimal and layered styling." },
    { type: 'p', text: "Whether worn alone for a subtle look or paired with other pieces, gold bracelets add a refined touch to any outfit. They are especially perfect for those who appreciate understated luxury and effortless style." },

    { type: 'h3link', text: "4. Pendants – Personal & Timeless", href: "/product-category/pendants/" },
    { type: 'p', text: "Gold pendants are a beautiful way to give a gift that feels personal and meaningful. They often carry emotional value and can be chosen to reflect a special moment, memory, or connection." },
    { type: 'p', text: "Designed for everyday elegance, pendants can be styled with different outfits and layered with other necklaces for a modern look. Their timeless appeal makes them a thoughtful and lasting <strong>gold jewellery gift</strong> option." },
    { type: 'p', text: "Each piece in our collection is created to celebrate simplicity, elegance, and lasting beauty—helping you find the perfect gift for every meaningful moment." },

    { type: 'h2', text: "Luxury Gold Jewellery Gifts for Every Occasion" },
    { type: 'p', text: "Gold jewellery fits effortlessly into every celebration, making it one of the most versatile and meaningful gifting choices. Its timeless elegance and lasting value ensure that it is suitable for both grand occasions and intimate moments. Whether you are celebrating a personal milestone or expressing heartfelt emotions, a carefully selected <strong>gold jewellery gift</strong> adds a sense of luxury and significance to the moment." },
    { type: 'h3', text: "Perfect Occasions for Gold Gifts" },
    { type: 'ul', text: "<li><strong>Birthdays:</strong> Celebrate her special day with a piece of gold jewellery that reflects her personality and style. A thoughtful gift becomes a lasting reminder of the occasion.</li><li><strong>Anniversaries:</strong> Gold jewellery beautifully symbolizes love and commitment, making it an ideal way to mark relationship milestones and shared memories.</li><li><strong>Weddings:</strong> A classic choice for weddings, gold jewellery represents prosperity and new beginnings, making it a meaningful and traditional gift.</li><li><strong>Festivals:</strong> Festive occasions are perfect for gifting gold, as it is often associated with positivity, celebration, and good fortune.</li><li><strong>Milestone Celebrations:</strong> Whether it's a career achievement, personal goal, or life event, gold jewellery makes the moment even more special and memorable.</li><li><strong>Romantic Gestures:</strong> A simple yet elegant gold piece can express emotions in a way words cannot, making it perfect for meaningful and romantic surprises.</li>" },
    { type: 'p', text: "A thoughtfully chosen <strong>gold jewellery gift</strong> doesn't just mark an occasion—it creates a memory that can be cherished for years to come." },

    { type: 'h2', text: "How to Choose the Right Gold Jewellery Gift" },
    { type: 'p', text: "Selecting the perfect <strong>gold jewellery gift</strong> doesn't have to be complicated. With a thoughtful approach, you can choose a piece that feels personal, stylish, and meaningful—something she will truly appreciate and wear often." },
    { type: 'h3', text: "Simple Gifting Tips" },
    { type: 'ol', text: "<li><strong>Know Their Style:</strong> Pay attention to what she usually wears. Whether her style is minimal, bold, or classic, choosing jewellery that aligns with her preferences ensures your gift feels thoughtful and well-chosen.</li><li><strong>Pick Versatile Pieces:</strong> Opt for jewellery that can be worn daily as well as on special occasions. Versatile pieces like simple rings, delicate bracelets, or elegant earrings offer more value and usability.</li><li><strong>Choose Timeless Designs:</strong> Avoid overly trendy styles that may go out of fashion quickly. Classic and minimalist designs maintain their appeal over time, making your gift relevant for years.</li><li><strong>Consider Comfort:</strong> Lightweight and easy-to-wear jewellery is always appreciated. Comfortable designs encourage regular use, making your gift a part of her everyday style.</li>" },
    { type: 'p', text: "By keeping these tips in mind, you can confidently select a <strong>ring gift</strong> or bracelet that feels both personal and meaningful, turning a simple gesture into something truly memorable." },

    { type: 'h2', text: "Affordable Yet Elegant Gold Jewellery Gifts" },
    { type: 'p', text: "Luxury doesn't always have to come with a high price tag. With the right approach, you can choose a <strong>gold jewellery gift</strong> that feels refined, meaningful, and premium—while still staying within your budget. The key lies in selecting pieces that focus on simplicity, quality, and everyday usability rather than size or heavy design." },
    { type: 'h3', text: "Smart Choices" },
    { type: 'ul', text: "<li><strong>Minimalist Rings:</strong> Simple and elegant, minimalist rings are perfect for daily wear. Their subtle design makes them timeless and easy to style, making them a thoughtful and versatile gift option.</li><li><strong>Simple Gold Earrings:</strong> Understated yet stylish, gold earrings are one of the easiest gifts to choose. They complement every outfit and are suitable for both casual and formal occasions.</li><li><strong>Lightweight Bracelets:</strong> Delicate and comfortable, lightweight bracelets offer a balance of elegance and practicality. They can be worn alone or layered for a more modern look.</li><li><strong>Everyday Pendants:</strong> Pendants add a personal touch without being overwhelming. Their versatility makes them ideal for regular wear and effortless styling.</li>" },
    { type: 'p', text: "Choosing these options ensures your <strong>gold jewellery gift</strong> feels both practical and stylish—proving that elegance and thoughtfulness matter more than extravagance." },

    { type: 'h2', text: "Styling Tips for Gold Jewellery" },
    { type: 'p', text: "Helping your audience visualize how to wear jewellery makes your <strong>gold jewellery gift</strong> feel more practical, stylish, and desirable. The beauty of gold lies in its versatility—it can elevate both everyday outfits and special occasion looks with minimal effort." },
    { type: 'h3', text: "Easy Styling Ideas" },
    { type: 'ol', text: "<li><strong>Stack Rings for a Modern Look:</strong> Wearing multiple rings together creates a trendy and personalized style. Mixing simple bands with slightly detailed designs adds depth without looking overwhelming.</li><li><strong>Layer Bracelets for Added Elegance:</strong> Layering lightweight gold bracelets creates a chic and sophisticated appearance. Combining different textures or chain styles enhances the overall look while keeping it elegant.</li><li><strong>Pair Earrings with Any Outfit:</strong> Gold earrings work effortlessly with both casual and formal wear. Simple studs can be worn daily, while slightly bolder designs can elevate evening or occasion outfits.</li><li><strong>Mix and Match Pieces for Versatility:</strong> Don't hesitate to combine different jewellery pieces. Pairing rings, bracelets, and pendants together allows for a flexible style that adapts to different moods and occasions.</li>" },
    { type: 'p', text: "Gold jewellery enhances every style effortlessly, making it a perfect choice for gifting and everyday elegance." },

    { type: 'h2', text: "Jewellery Care Tips for Long-Lasting Shine" },
    { type: 'p', text: "Keeping your <strong>gold jewellery gift</strong> in perfect condition ensures it maintains its beauty, shine, and value for years to come. With just a few simple habits, you can preserve the elegance of each piece and keep it looking as good as new." },
    { type: 'h3', text: "Care Guide" },
    { type: 'ul', text: "<li><strong>Store Properly:</strong> Always keep your jewellery in a soft pouch or a separate box to prevent scratches and tangling. Proper storage helps maintain its original finish.</li><li><strong>Avoid Chemicals &amp; Perfumes:</strong> Exposure to harsh chemicals, lotions, and perfumes can dull the shine of gold. It's best to wear your jewellery after applying such products.</li><li><strong>Clean Gently:</strong> Use a soft cloth to gently wipe your jewellery after use. Occasional light cleaning helps remove dirt and oils, restoring its natural shine.</li><li><strong>Remove Before Activities:</strong> Take off your jewellery before heavy activities like workouts, cleaning, or swimming to avoid damage or unnecessary wear.</li>" },
    { type: 'p', text: "With proper care, your <strong>gold bracelet gift</strong>, rings, earrings, and pendants will continue to look radiant—making them timeless pieces you can enjoy every day." },

    { type: 'h2', text: "How Gold Jewellery Enhances Everyday Style" },
    { type: 'p', text: "Gold jewellery is not just reserved for special occasions—it's an essential part of everyday fashion. Its subtle shine and timeless appeal make it easy to incorporate into daily outfits without feeling excessive." },
    { type: 'h3', text: "Everyday Styling Benefits" },
    { type: 'ol', text: "<li><strong>Effortless Elegance:</strong> Even a simple gold piece can elevate a basic outfit, adding a refined and polished touch.</li><li><strong>Perfect for Layering:</strong> Gold jewellery works beautifully when layered, allowing you to create a personalized and modern look.</li><li><strong>Complements Every Outfit:</strong> From casual wear to office attire, gold jewellery blends seamlessly with all styles.</li><li><strong>Seasonless Fashion:</strong> Gold remains stylish throughout the year, making it a reliable choice regardless of trends.</li>" },
    { type: 'p', text: "Adding gold jewellery to daily wear ensures your <strong>gold jewellery gift</strong> becomes a meaningful part of her routine." },

    { type: 'h2', text: "Trending Gold Jewellery Gift Ideas" },
    { type: 'p', text: "If you're looking for something modern yet timeless, staying updated with current trends can help you choose the perfect piece." },
    { type: 'h3', text: "Popular Gift Trends" },
    { type: 'ol', text: "<li><strong>Minimalist Jewellery:</strong> Clean, simple designs that focus on elegance and subtle beauty.</li><li><strong>Layered Looks:</strong> Stackable rings and layered bracelets are increasingly popular for a stylish appearance.</li><li><strong>Personalized Pieces:</strong> Initials, symbols, or meaningful motifs add a personal touch to your gift.</li><li><strong>Lightweight Designs:</strong> Comfortable and easy-to-wear jewellery that fits into everyday life.</li>" },
    { type: 'p', text: "These trends ensure your <strong>gold jewellery gift</strong> feels contemporary while maintaining timeless appeal." },

    { type: 'h2', text: "Gold Jewellery Gift Ideas for Different Personalities" },
    { type: 'p', text: "Choosing jewellery based on personality makes your gift more thoughtful and meaningful." },
    { type: 'h3', text: "Find the Perfect Match" },
    { type: 'ul', text: "<li><strong>For the Minimalist:</strong> Opt for sleek rings, simple studs, or delicate chains that reflect understated elegance.</li><li><strong>For the Trend Lover:</strong> Choose layered bracelets or stackable rings that align with current fashion trends.</li><li><strong>For the Classic Style:</strong> Go for timeless designs that never go out of fashion, such as elegant gold earrings or refined pendants.</li><li><strong>For the Statement Lover:</strong> Select bold yet elegant pieces that stand out while maintaining sophistication.</li>" },
    { type: 'p', text: "Matching jewellery to personality makes your <strong>ring gift</strong> or bracelet feel truly special." },

    { type: 'h2', text: "Benefits of Gifting Gold Jewellery Online" },
    { type: 'p', text: "Shopping for gold jewellery online has become increasingly convenient and reliable, offering a seamless gifting experience." },
    { type: 'h3', text: "Why Choose Online Shopping" },
    { type: 'ol', text: "<li><strong>Wide Variety:</strong> Access a broader range of designs compared to physical stores.</li><li><strong>Convenience:</strong> Shop anytime and find the perfect <strong>gold jewellery gift</strong> without time constraints.</li><li><strong>Easy Comparison:</strong> Compare styles, designs, and options to make an informed decision.</li><li><strong>Hassle-Free Gifting:</strong> Quick selection and easy ordering make last-minute gifting stress-free.</li>" },

    { type: 'h2', text: "Make Every Moment Memorable with Gold Jewellery" },
    { type: 'p', text: "Every special occasion deserves a gift that reflects its importance. Gold jewellery transforms simple moments into lasting memories by combining beauty with emotional value." },
    { type: 'p', text: "Whether it's a <strong>ring as gift</strong>, elegant earrings as a gift, or a delicate <strong>gold bracelet gift</strong>, each piece carries meaning that goes beyond its appearance. It becomes a symbol of connection, appreciation, and celebration." },
    { type: 'p', text: "Choosing gold jewellery is not just about gifting—it's about creating a lasting impression that she will cherish every day." },

    { type: 'h2', text: "Why Choose Barosche for Gold Jewellery Gifts" },
    { type: 'p', text: "At Barosche, we believe that a <strong>gold jewellery gift</strong> should feel as special as the moment it represents. Our approach focuses on blending elegance with everyday usability, so each piece becomes more than just an accessory—it becomes part of her story." },
    { type: 'h3', text: "What Makes Us Special" },
    { type: 'ol', text: "<li><strong>Minimalist Luxury Designs:</strong> Our jewellery is designed with a modern minimalist approach, ensuring each piece looks refined, stylish, and effortlessly elegant without being overwhelming.</li><li><strong>High-Quality Craftsmanship:</strong> Every piece is created with attention to detail and precision, offering durability along with a premium finish that enhances its overall appeal.</li><li><strong>Perfect for Gifting:</strong> Our collections are thoughtfully curated to make gifting easy. Whether it's a ring gift, earrings, or a gold bracelet gift, each design is made to feel meaningful and special.</li><li><strong>Designed for Everyday Wear:</strong> We focus on comfort and versatility, creating jewellery that can be worn daily while still maintaining a sophisticated look.</li>" },
    { type: 'p', text: "Each Barosche piece reflects timeless beauty and modern elegance—making your <strong>gold jewellery gift</strong> a lasting symbol of style, thoughtfulness, and care." },

    { type: 'h2', text: "Find the Perfect Gold Jewellery Gift" },
    { type: 'p', text: "Celebrate life's special moments with jewellery that lasts forever. Whether you're searching for a gold jewellery gift, a meaningful ring gift, or elegant everyday pieces, Barosche offers <a href='https://barosche.com/' style='color: #007bff; text-decoration: underline;'>fine jewellery</a> designs that combine beauty, simplicity, and lasting value." },
    { type: 'p', text: "Explore the collection and choose a gift that will be cherished for years to come." },
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
export default function GoldJewellery() {
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