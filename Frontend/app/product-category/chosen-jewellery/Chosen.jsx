'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Chosen.css';
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
    chosenJewellery: "Chosen Jewellery",
    faq: "Frequently Asked Questions",
    retry: "Retry",
    gridView: "Grid view",
    addToWishlist: "Add to Wishlist",
    quickView: "Quick View",
    addToCart: "Add to Cart",
    sale: "SALE",
    noProductsBase: "No products found",
    checkConsole: "Check browser console (F12) for errors.",
    showingOf: "Showing",
    showingResults: "results",
    pageTitle: "Jewellery Gift for Her Online – Gold & Designer Jewellery Collection",
    priceOnRequest: "Price on request",
    viewDetails: "View Details",
    qty: "Qty",
};

const flattenUI = (ui) => [
    ui.productCategories, ui.price, ui.loadingText, ui.showText,
    ui.defaultSorting, ui.priceLowHigh, ui.priceHighLow, ui.newest,
    ui.filtersText, ui.chosenJewellery, ui.faq, ui.retry,
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
        filtersText: get(), chosenJewellery: get(), faq: get(), retry: get(),
        gridView: get(), addToWishlist: get(), quickView: get(), addToCart: get(),
        sale: get(), noProductsBase: get(), checkConsole: get(), showingOf: get(),
        showingResults: get(), pageTitle: get(),
        priceOnRequest: "Price on request", viewDetails: "View Details", qty: "Qty",
    };
};

// ─────────────────────────────────────────────────────────
//  CATEGORY / PRICE DATA
// ─────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
    { name: "Chosen" }, { name: "Earrings" }, { name: "For Today" },
    { name: "Jewellery" }, { name: "Mens" }, { name: "New" },
    { name: "Pendants" }, { name: "Bracelets" }, { name: "Rings" }, { name: "Womens" },
];

const categorySlugMap = {
    "Chosen": "chosen-jewellery",
    "Earrings": "earrings",
    "For Today": "for-today-jewellery",
    "Jewellery": "jewellery",
    "Men": "mens", "Mens": "mens",
    "New": "new-in", "New In": "new-in",
    "Pendants": "pendants",
    "Bracelets": "bracelets",
    "Rings": "rings",
    "Women": "womens", "Womens": "womens",
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
//  FAQ DATA (20 items)
// ─────────────────────────────────────────────────────────
const faqData = [
    { q: "What is chosen jewellery?", a: "Chosen jewellery is a curated collection of stylish, versatile, and meaningful pieces designed for modern everyday wear and gifting." },
    { q: "What types of jewellery are included in this collection?", a: "This collection includes designer jewellery, gold plated pieces, minimal everyday jewellery, and gift-worthy accessories." },
    { q: "Is chosen jewellery suitable for daily wear?", a: "Yes, most pieces are lightweight, comfortable, and designed specifically for everyday use." },
    { q: "Can I gift jewellery from this collection?", a: "Absolutely, these pieces are perfect for gifting on birthdays, anniversaries, and special occasions." },
    { q: "What makes chosen jewellery different from regular jewellery?", a: "Chosen jewellery is carefully curated for quality, design, and versatility, ensuring it suits modern lifestyles." },
    { q: "Is gold plated jewellery durable?", a: "Yes, with proper care, gold plated jewellery maintains its shine and durability for a long time." },
    { q: "How do I choose the right jewellery online?", a: "Focus on your style, occasion, comfort, and versatility while checking product details and images." },
    { q: "Can I wear these pieces with both western and traditional outfits?", a: "Yes, the designs are versatile and complement both western and ethnic wear." },
    { q: "Are the designs lightweight?", a: "Most pieces are designed to be lightweight for maximum comfort throughout the day." },
    { q: "What occasions are suitable for chosen jewellery?", a: "You can wear these pieces for daily use, office wear, parties, weddings, and festive occasions." },
    { q: "Is designer jewellery suitable for everyday wear?", a: "Yes, modern designer jewellery is crafted to be both stylish and wearable for daily use." },
    { q: "How do I maintain my jewellery?", a: "Store it in a dry place, avoid water and chemicals, and clean it gently with a soft cloth." },
    { q: "Can I layer jewellery from this collection?", a: "Yes, many pieces are perfect for layering and stacking to create a trendy look." },
    { q: "Does online jewellery shopping offer enough variety?", a: "Yes, online platforms provide a wider range of styles compared to physical stores." },
    { q: "Is jewellery from this collection budget-friendly?", a: "Yes, it includes affordable options like gold plated jewellery along with premium designs." },
    { q: "Can I find minimal jewellery in this category?", a: "Yes, the collection includes a variety of minimal and elegant designs for everyday styling." },
    { q: "Are these pieces suitable for office wear?", a: "Yes, subtle and minimal designs are perfect for professional environments." },
    { q: "What are the latest trends in jewellery available here?", a: "Trending styles include layered chains, stackable rings, and geometric designs." },
    { q: "Is this jewellery comfortable for long wear?", a: "Yes, comfort and wearability are key features of this collection." },
    { q: "Why should I buy jewellery online from this collection?", a: "You get a wide variety, convenience, easy comparison, and access to modern designs—all in one place." },
];

// ─────────────────────────────────────────────────────────
//  CHOSEN JEWELLERY CONTENT DATA
//  type: 'h' (heading), 'p' (paragraph, supports <b>/<a> via dangerouslySetInnerHTML), 'li' (list item, grouped into <ul>)
// ─────────────────────────────────────────────────────────
const chosenJewelleryContent = [
    { type: 'h', text: "Chosen Jewellery – Premium Designs for Modern Style & Meaningful Gifting" },
    { type: 'p', text: "<b>Chosen jewellery</b> represents more than just accessories—it is a carefully curated expression of style, emotion, and individuality. This collection brings together designer jewellery, gold plated pieces, and gifting essentials, all thoughtfully selected to meet the needs of modern consumers who value both aesthetics and practicality. Whether you are shopping for yourself or searching for a meaningful gift, this category offers a refined blend of elegance, versatility, and contemporary fashion that fits seamlessly into today's lifestyle." },
    { type: 'p', text: "In today's evolving fashion landscape, jewellery has become an essential part of everyday styling rather than being limited to special occasions. Chosen jewellery reflects this shift by offering designs that are lightweight, stylish, and suitable for regular wear. Each piece is carefully chosen to ensure it complements a wide range of outfits—from casual and office wear to festive and evening looks—while maintaining a polished and sophisticated appearance." },
    { type: 'p', text: "What makes this collection truly special is its focus on versatility and wearability. The designs are created to transition effortlessly between different settings, allowing you to maintain a consistent and confident style throughout the day. From minimal and elegant pieces to more expressive and statement designs, the collection caters to diverse preferences while keeping comfort at the forefront." },
    { type: 'p', text: "In addition to style, quality and craftsmanship play a key role in defining chosen jewellery. Each piece reflects attention to detail, smooth finishing, and long-lasting appeal, ensuring that your jewellery not only looks beautiful but also stands the test of time. This balance of durability and design makes it ideal for both personal use and gifting purposes." },
    { type: 'p', text: "<b>Chosen jewellery</b> is not just about enhancing your appearance—it is about expressing personality, celebrating moments, and creating lasting impressions. With its combination of modern aesthetics, practical design, and timeless charm, this collection offers everything you need to elevate your everyday style and make every occasion feel special." },

    { type: 'h', text: "Explore a Wide Range of Jewellery Online" },
    { type: 'p', text: "Jewellery online shopping opens the door to an extensive and ever-evolving collection of styles, making it easier than ever to find pieces that truly reflect your personality and fashion preferences. From <b>minimal everyday jewellery</b> that adds subtle elegance to your daily look, to bold designer pieces that make a statement, this collection ensures you always have the perfect accessory for every occasion and mood." },
    { type: 'p', text: "The digital shopping experience brings unmatched convenience, allowing you to browse a wide variety of designs anytime, from anywhere. You can effortlessly explore the latest trends, compare different styles, and select pieces that suit your wardrobe and lifestyle. With detailed product descriptions, high-quality visuals, and well-organized categories, finding the right jewellery becomes simple, efficient, and enjoyable." },
    { type: 'p', text: "Another key advantage of <b>shopping for jewellery online</b> is the ability to discover unique and trending designs that may not always be available in physical stores. This gives you access to a broader selection, helping you stay ahead in fashion while making confident purchasing decisions." },
    { type: 'p', text: "<b>What You Can Explore:</b>" },
    { type: 'li', text: "Designer jewellery featuring modern, trend-inspired aesthetics" },
    { type: 'li', text: "Gold plated jewellery that offers a luxurious look at an affordable price" },
    { type: 'li', text: "Everyday minimal jewellery designed for comfort and daily styling" },
    { type: 'li', text: "Gift-worthy jewellery perfect for special occasions and meaningful moments" },
    { type: 'p', text: "With a seamless browsing experience and a wide variety of options, jewellery online shopping makes it easy to elevate your style, find meaningful gifts, and build a collection that suits every aspect of your life." },

    { type: 'h', text: "Designer Jewellery Online – Where Style Meets Creativity" },
    { type: 'p', text: "<b>Designer jewellery</b> is created to make a lasting impression through its unique designs, artistic craftsmanship, and contemporary inspiration. Unlike mass-produced accessories, these pieces are thoughtfully designed to reflect individuality and refined taste, making them perfect for those who want to express their personality through fashion while maintaining elegance and sophistication." },
    { type: 'p', text: "Modern designer jewellery embraces a balance between creativity and wearability. With clean lines, geometric patterns, and subtle luxury-inspired detailing, these designs offer a fresh and stylish approach to accessorizing. Whether you prefer minimal elegance or eye-catching statement pieces, designer jewellery allows you to elevate your look effortlessly without compromising on comfort." },
    { type: 'p', text: "One of the biggest advantages of <b>designer jewellery</b> is its versatility. These pieces are designed to transition seamlessly across different settings—be it casual outings, professional environments, or special occasions. This adaptability makes them a valuable addition to any jewellery collection, ensuring you always have something stylish to complement your outfit." },
    { type: 'p', text: "In addition to aesthetics, attention to detail plays a crucial role. Each piece is crafted with precision, smooth finishing, and high-quality materials to ensure long-lasting appeal and a premium feel. This combination of design excellence and durability ensures that your jewellery remains both fashionable and reliable over time." },
    { type: 'p', text: "<b>Why Choose Designer Jewellery:</b>" },
    { type: 'li', text: "Unique and exclusive designs that stand out" },
    { type: 'li', text: "High attention to detail with premium finishing" },
    { type: 'li', text: "Suitable for everyday wear as well as special occasions" },
    { type: 'li', text: "Reflects modern fashion trends with timeless appeal" },
    { type: 'p', text: "Designer jewellery is more than just an accessory—it's a creative expression of style that brings elegance, versatility, and individuality to your everyday fashion." },

    { type: 'h', text: "Buy Gold Jewellery Online – Timeless Elegance Made Accessible" },
    { type: 'p', text: "<b>Gold jewellery</b> has long been a symbol of elegance, sophistication, and cultural significance. Today's modern designs reimagine this timeless metal with a focus on lightweight construction, minimal aesthetics, and everyday comfort. This makes gold-inspired jewellery more practical and versatile, allowing you to enjoy its classic beauty without the heaviness of traditional styles." },
    { type: 'p', text: "<b>Buying gold jewellery online</b> offers unmatched convenience and variety. You can explore a wide range of designs—from delicate chains and refined rings to stylish, contemporary accessories—all from the comfort of your home. This accessibility allows you to discover pieces that match your personal style while staying aligned with current fashion trends." },
    { type: 'p', text: "Another key advantage is the ability to compare designs, styles, and features easily. With detailed product descriptions and clear visuals, you can make informed choices and select jewellery that suits both your lifestyle and wardrobe needs. Whether you are looking for subtle everyday pieces or elegant options for special occasions, online platforms provide a seamless and efficient shopping experience." },
    { type: 'p', text: "Modern gold jewellery is also designed for versatility. These pieces can be worn daily, styled with both western and traditional outfits, and effortlessly transitioned from casual to formal settings. Their timeless appeal ensures they remain a valuable addition to your jewellery collection for years to come." },
    { type: 'p', text: "<b>Benefits of Buying Gold Jewellery Online:</b>" },
    { type: 'li', text: "Wide variety of modern and traditional designs" },
    { type: 'li', text: "Easy comparison for better decision-making" },
    { type: 'li', text: "Convenient and time-saving shopping experience" },
    { type: 'li', text: "Suitable for both everyday wear and special occasions" },
    { type: 'p', text: "Gold jewellery continues to evolve with changing trends while retaining its timeless charm, making it an essential choice for those who value both tradition and modern style." },

    { type: 'h', text: "Gold-Plated Jewellery – Affordable Luxury for Everyday Fashion" },
    { type: 'p', text: "<b>Gold-plated jewellery</b> has emerged as a smart and stylish choice for modern consumers who want the rich look of gold without the high investment. Designed with a thin layer of gold over a base metal, these pieces offer the same visual appeal as traditional gold jewellery while being far more accessible and practical for everyday use." },
    { type: 'p', text: "With advancements in plating and finishing techniques, today's gold-plated jewellery delivers impressive shine, smooth texture, and enhanced durability. Many designs are crafted to resist fading and maintain their brilliance over time with proper care, making them a reliable option for regular wear. This blend of beauty and functionality makes gold plated pieces ideal for those who enjoy keeping up with trends without overspending." },
    { type: 'p', text: "Another major advantage is comfort. Gold-plated jewellery is typically lightweight, making it easy to wear throughout the day without discomfort. Whether you're heading to work, meeting friends, or attending a small celebration, these pieces add a touch of elegance without feeling heavy or overwhelming." },
    { type: 'p', text: "The versatility of <b>gold-plated jewellery</b> is what truly sets it apart. From minimal everyday designs to bold statement styles, it can be paired effortlessly with both western and traditional outfits. This flexibility allows you to build a diverse jewellery collection that suits multiple occasions and moods." },
    { type: 'p', text: "<b>Key Advantages:</b>" },
    { type: 'li', text: "Elegant gold-like appearance with a premium finish" },
    { type: 'li', text: "Cost-effective alternative to solid gold jewellery" },
    { type: 'li', text: "Lightweight and comfortable for all-day wear" },
    { type: 'li', text: "Versatile styling for casual, festive, and formal looks" },
    { type: 'p', text: "Gold-plated jewellery perfectly balances affordability and elegance, making it an essential addition to any modern jewellery collection." },

    { type: 'h', text: "Jewellery Gifts – Thoughtful Choices for Every Occasion" },
    { type: 'p', text: "<b>Jewellery</b> has always been one of the most meaningful and timeless gifts you can give. Beyond its visual appeal, it carries deep emotional value, symbolizing love, appreciation, and lasting connections. Whether you are selecting a piece for your partner, a loved one, or a close friend, jewellery makes every occasion feel more special and memorable." },
    { type: 'p', text: "A well-chosen <b>jewellery gift</b> reflects thoughtfulness and attention to detail. From delicate, minimal designs that can be worn every day to elegant statement pieces that stand out on special occasions, there is something to match every personality and style. This variety allows you to find a piece that not only looks beautiful but also feels personal and significant to the recipient." },
    { type: 'p', text: "<b>Modern jewellery gifting</b> focuses on versatility and wearability. Many designs are created to suit both casual and formal settings, ensuring that the recipient can cherish and use the gift regularly. This makes jewellery not just a one-time present but a lasting part of someone's everyday style and memories." },
    { type: 'p', text: "Another reason jewellery remains a popular gifting choice is its universal appeal. It transcends trends and occasions, making it suitable for celebrations big and small. Whether it's a planned surprise or a carefully selected token of love, jewellery always leaves a lasting impression." },
    { type: 'p', text: "<b>Perfect For:</b>" },
    { type: 'li', text: "Birthdays and anniversaries" },
    { type: 'li', text: "Romantic occasions and special moments" },
    { type: 'li', text: "Festive celebrations and cultural events" },
    { type: 'li', text: "Surprise gifts and personal milestones" },
    { type: 'p', text: "Jewellery gifts go beyond material value—they capture emotions, celebrate relationships, and create memories that last a lifetime." },

    { type: 'h', text: "How to Choose the Right Jewellery Online" },
    { type: 'p', text: "Selecting the <b>right jewellery online</b> becomes simple when you focus on a few essential factors like style, purpose, and comfort. With so many options available, making a thoughtful choice ensures that your jewellery not only looks good but also fits seamlessly into your daily lifestyle." },
    { type: 'p', text: "Start by identifying your personal style—whether you prefer minimal, elegant pieces or bold, statement designs. This helps narrow down your options and ensures that the jewellery you choose reflects your personality. It's also important to consider the purpose of your purchase. Are you buying for everyday wear, office use, or special occasions? Knowing this will guide you toward the most suitable designs." },
    { type: 'p', text: "Comfort plays a crucial role, especially if you plan to wear your jewellery regularly. Lightweight and well-crafted pieces are ideal for long hours, while versatile designs can be styled with multiple outfits, giving you better value and flexibility. Paying attention to finishing and material quality also ensures durability and long-lasting shine." },
    { type: 'p', text: "Additionally, take advantage of online shopping features such as product descriptions, images, and customer insights to make informed decisions. Comparing different styles and designs can help you find the perfect piece without any rush." },
    { type: 'p', text: "<b>Tips for Smart Shopping:</b>" },
    { type: 'li', text: "Choose lightweight designs for comfortable daily wear" },
    { type: 'li', text: "Select versatile pieces that match multiple outfits" },
    { type: 'li', text: "Go for minimal designs that remain stylish over time" },
    { type: 'li', text: "Check for high-quality finishing and durability" },
    { type: 'p', text: "By keeping these factors in mind, you can confidently choose jewellery online that complements your style, suits your needs, and stands the test of time." },

    { type: 'h', text: "Styling Tips for Modern Jewellery" },
    { type: 'p', text: "Jewellery styling is all about balance, creativity, and personal expression. The right combination of pieces can elevate your entire look without making it feel overwhelming. Modern jewellery trends focus on mixing simplicity with statement elements, allowing you to create styles that feel both effortless and unique." },
    { type: 'p', text: "One of the easiest ways to enhance your outfit is by layering and stacking. Combining delicate pieces with subtle variations in length or design adds depth and dimension to your look. At the same time, knowing when to keep things minimal is equally important—especially for professional or everyday settings where elegance lies in simplicity." },
    { type: 'p', text: "Your outfit, occasion, and personal comfort should always guide your styling choices. Whether you're dressing for work, a casual outing, or a celebration, selecting the right jewellery helps create a polished and cohesive appearance." },
    { type: 'p', text: "<b>Easy Styling Ideas:</b>" },
    { type: 'li', text: "Layer delicate chains of different lengths for a trendy, modern look" },
    { type: 'li', text: "Stack rings to create a personalized and expressive style" },
    { type: 'li', text: "Keep jewellery minimal and refined for office or everyday wear" },
    { type: 'li', text: "Choose one or two statement pieces to stand out on special occasions" },
    { type: 'p', text: "Modern jewellery styling is about finding your own balance—mixing trends with timeless pieces to create a look that feels authentic, stylish, and uniquely yours." },

    { type: 'h', text: "Trending Jewellery Styles You Should Know" },
    { type: 'p', text: "Fashion trends in <b>jewellery</b> are constantly evolving, and staying updated helps you make better style choices. The chosen jewellery collection reflects current trends while maintaining timeless appeal, ensuring your accessories always feel fresh and relevant." },
    { type: 'p', text: "From minimalist designs to bold statement pieces, modern jewellery focuses on versatility and individuality. These trends allow you to experiment with your look while keeping it elegant and wearable." },
    { type: 'p', text: "<b>Popular Trends Include:</b>" },
    { type: 'li', text: "Minimal and dainty jewellery for everyday elegance" },
    { type: 'li', text: "Layered necklaces and stacked rings" },
    { type: 'li', text: "Geometric and contemporary designs" },
    { type: 'li', text: "Personalized and meaningful jewellery" },

    { type: 'h', text: "Minimal Jewellery for Everyday Elegance" },
    { type: 'p', text: "<b>Minimal jewellery</b> is perfect for those who prefer subtle sophistication. These designs focus on clean lines, simple shapes, and refined detailing, making them ideal for daily wear." },
    { type: 'p', text: "Whether you're heading to work or stepping out casually, minimal jewellery enhances your look without overpowering it. Its timeless appeal ensures it never goes out of style." },
    { type: 'p', text: "<b>Why Choose Minimal Jewellery:</b>" },
    { type: 'li', text: "Easy to style with any outfit" },
    { type: 'li', text: "Lightweight and comfortable" },
    { type: 'li', text: "Perfect for office and daily wear" },
    { type: 'li', text: "Timeless and elegant appeal" },

    { type: 'h', text: "Statement Jewellery for Special Occasions" },
    { type: 'p', text: "While minimal pieces are great for daily wear, <b>statement jewellery</b> is designed to stand out. These bold and eye-catching designs add a unique touch to your outfit, making them perfect for celebrations and events." },
    { type: 'p', text: "Statement pieces can instantly elevate even the simplest outfits, giving you a confident and stylish appearance." },
    { type: 'p', text: "<b>Best Uses:</b>" },
    { type: 'li', text: "Weddings and festive occasions" },
    { type: 'li', text: "Evening parties and events" },
    { type: 'li', text: "Special celebrations" },
    { type: 'li', text: "Fashion-forward styling" },

    { type: 'h', text: "Lightweight Jewellery for All-Day Comfort" },
    { type: 'p', text: "Comfort is an essential factor in <b>modern jewellery</b> design. Lightweight jewellery ensures you can wear your favorite pieces all day without discomfort." },
    { type: 'p', text: "Chosen jewellery prioritizes wearability, making it suitable for long hours—whether at work, travel, or social gatherings." },
    { type: 'p', text: "<b>Benefits:</b>" },
    { type: 'li', text: "Comfortable for extended wear" },
    { type: 'li', text: "Easy to carry and maintain" },
    { type: 'li', text: "Ideal for everyday use" },
    { type: 'li', text: "Stylish without being heavy" },

    { type: 'h', text: "Jewellery Care Tips for Long-Lasting Shine" },
    { type: 'p', text: "Proper care helps maintain the beauty and durability of your jewellery. With a few simple steps, you can keep your pieces looking new for a long time." },
    { type: 'p', text: "<b>Care Tips:</b>" },
    { type: 'li', text: "Store jewellery in a dry and clean place" },
    { type: 'li', text: "Avoid contact with water, perfumes, and chemicals" },
    { type: 'li', text: "Clean gently with a soft cloth" },
    { type: 'li', text: "Keep pieces separately to prevent scratches" },

    { type: 'h', text: "Perfect Jewellery for Every Outfit" },
    { type: 'p', text: "Choosing the right jewellery can transform your entire look. Matching your accessories with your outfit helps create a balanced and polished appearance." },
    { type: 'p', text: "<b>Style Guide:</b>" },
    { type: 'li', text: "Pair minimal jewellery with formal wear" },
    { type: 'li', text: "Use layered pieces for casual outfits" },
    { type: 'li', text: "Add statement jewellery for festive looks" },
    { type: 'li', text: "Mix and match for a modern style" },

    { type: 'h', text: "Why Jewellery is an Essential Fashion Accessory" },
    { type: 'p', text: "Jewellery is more than just an add-on—it plays a key role in defining your personal style. It enhances your outfit, boosts confidence, and helps you express individuality." },
    { type: 'p', text: "From subtle elegance to bold fashion statements, jewellery completes your overall look and adds a unique touch to your personality." },

    { type: 'h', text: "Build Your Personal Jewellery Collection" },
    { type: 'p', text: "Creating a <b>versatile jewellery collection</b> ensures you always have the right piece for every occasion. A balanced collection includes both everyday essentials and standout designs." },
    { type: 'p', text: "<b>Must-Have Pieces:</b>" },
    { type: 'li', text: "Minimal everyday jewellery" },
    { type: 'li', text: "Statement pieces for occasions" },
    { type: 'li', text: "Versatile gold plated designs" },
    { type: 'li', text: "Gift-worthy elegant pieces" },

    { type: 'h', text: "Affordable Luxury for Modern Lifestyles" },
    { type: 'p', text: "Modern consumers look for jewellery that balances style, quality, and affordability. Chosen jewellery offers premium-looking designs without high costs, making luxury accessible." },
    { type: 'p', text: "This allows you to stay fashionable, experiment with trends, and expand your collection without overspending." },

    { type: 'h', text: "Seamless Online Jewellery Shopping Experience" },
    { type: 'p', text: "Shopping online should be easy and enjoyable. A well-designed platform ensures smooth navigation, quick browsing, and hassle-free checkout." },
    { type: 'p', text: "With organized categories and detailed product insights, you can confidently find jewellery that matches your needs and preferences." },

    { type: 'h', text: "Why Our Chosen Jewellery Collection Stands Out" },
    { type: 'p', text: "Our collection is curated with a strong focus on quality, design, and customer satisfaction. Every piece is selected to ensure it meets modern fashion needs while maintaining comfort and durability." },
    { type: 'p', text: "We aim to provide jewellery that fits seamlessly into your lifestyle—whether for everyday wear or meaningful gifting." },
    { type: 'p', text: "<b>What Makes Us Different:</b>" },
    { type: 'li', text: "Carefully curated designer collections" },
    { type: 'li', text: "Focus on comfort and wearability" },
    { type: 'li', text: "Trend-driven yet timeless designs" },
    { type: 'li', text: "Suitable for both personal use and gifting" },

    { type: 'h', text: "Shop Jewellery Online with Confidence" },
    { type: 'p', text: "Shopping for <a href='/product-category/jewellery/' style='color: #007bff; text-decoration: underline;'>minimalist luxury jewellery</a> online should be simple, secure, and enjoyable. Our platform is designed to offer a seamless experience, from browsing to checkout." },
    { type: 'p', text: "With user-friendly navigation, secure payment options, and a wide variety of designs, you can explore and shop with confidence." },
    { type: 'p', text: "<b>Shopping Benefits:</b>" },
    { type: 'li', text: "Easy browsing and quick selection" },
    { type: 'li', text: "Secure and reliable checkout" },
    { type: 'li', text: "Wide range of jewellery styles" },
    { type: 'li', text: "Perfect for modern lifestyle needs" },
    { type: 'p', text: "Chosen jewellery is more than just a collection—it is a reflection of style, emotion, and individuality. Whether you are looking for designer jewellery, gold plated elegance, or the perfect gift, this category offers everything you need to enhance your style and celebrate meaningful moments with confidence." },
];

const flattenContent = (content) => content.map((item) => item.text);
const rebuildContent = (originalContent, translatedTexts) =>
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
            position: 'fixed', bottom: '24px', left: '50%',
            transform: 'translateX(-50%)',
            background: '#1a1a1a', color: '#fff',
            padding: '12px 24px', borderRadius: '4px',
            fontSize: '14px', zIndex: 9999,
            pointerEvents: 'none', whiteSpace: 'nowrap',
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
function QuickViewModal({ product, currency, ui, onClose, onAddToCart, wishlist, onToggleWishlist }) {
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const variant = getFirstVariant(product);
    const images = variant.images || [];
    const categoryUrl = categorySlugMap[product.category] || 'chosen-jewellery';

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
                    position: 'relative', flexWrap: 'wrap',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '12px', right: '16px',
                        background: 'none', border: 'none', fontSize: '22px',
                        cursor: 'pointer', color: '#555', zIndex: 1, lineHeight: 1,
                    }}
                    aria-label="Close"
                >✕</button>

                {/* Images */}
                <div style={{ flex: '1 1 300px', minWidth: '240px', padding: '24px 16px 24px 24px' }}>
                    <div style={{
                        background: '#f7f6f4', borderRadius: '6px',
                        aspectRatio: '1/1', overflow: 'hidden', marginBottom: '12px',
                    }}>
                        {images.length > 0 ? (
                            <img
                                src={`${API_BASE}${images[activeImg]}`}
                                alt={product.title}
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

                {/* Details */}
                <div style={{ flex: '1 1 280px', padding: '32px 24px 24px 16px', minWidth: '240px' }}>
                    {variant.isSale && (
                        <span style={{
                            background: '#1a1a1a', color: '#fff',
                            fontSize: '11px', letterSpacing: '1px',
                            padding: '3px 8px', borderRadius: '2px',
                            display: 'inline-block', marginBottom: '10px',
                        }}>{ui.sale}</span>
                    )}
                    <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>
                        {product.category}
                    </p>
                    <h2 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 14px', lineHeight: 1.3 }}>
                        {product.title}
                    </h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                        {variant.oldPrice && (
                            <span style={{ fontSize: '15px', color: '#aaa', textDecoration: 'line-through' }}>
                                {formatPrice(variant.oldPrice, currency)}
                            </span>
                        )}
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>
                            {variant.newPrice !== null && variant.newPrice !== undefined
                                ? formatPrice(variant.newPrice, currency)
                                : ui.priceOnRequest}
                        </span>
                    </div>
                    {product.description && (
                        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                            {product.description}
                        </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '13px', color: '#555' }}>{ui.qty}:</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px' }}>
                            <button onClick={() => setQty(q => Math.max(1, q - 1))}
                                style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>−</button>
                            <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '14px' }}>{qty}</span>
                            <button onClick={() => setQty(q => q + 1)}
                                style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>+</button>
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
                        >{ui.addToCart}</button>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => onToggleWishlist(product._id, {
                                    _id: product._id,
                                    slug: product.slug,
                                    title: product.title,
                                    category: product.category,
                                    images: variant.images || [],
                                    oldPrice: variant.oldPrice,
                                    newPrice: variant.newPrice,
                                    isSale: variant.isSale,
                                })}
                                style={{
                                    flex: 1, border: '1px solid #ddd', background: '#fff',
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
                                {ui.addToWishlist}
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
                            >{ui.viewDetails}</Link>
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
                style={{ maxHeight: open ? bodyRef.current?.scrollHeight + 'px' : '0px' }}
            >
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

    const imgSrc = images.length > 0 ? `${API_BASE}${images[currentImg]}` : "/placeholder.jpg";
    const oldPrice = variant.oldPrice;
    const newPrice = variant.newPrice;
    const isSale = variant.isSale;
    const categoryUrl = categorySlugMap[p.category] || "chosen-jewellery";

    return (
        <Link
            href={`/product-category/${categoryUrl}/${p.slug}`}
            className="jw-card"
            onMouseEnter={startHover}
            onMouseLeave={stopHover}
        >
            <div className="jw-card-img-wrap">
                {isSale && <span className="jw-sale-badge">{ui.sale}</span>}
                <img
                    src={imgSrc}
                    alt={p.title}
                    className="jw-card-img"
                    loading="lazy"
                    onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                />
                {images.length > 1 && (
                    <div className="jw-img-dots">
                        {images.map((_, i) => (
                            <span key={i} className={`jw-img-dot ${i === currentImg ? 'jw-img-dot--active' : ''}`} />
                        ))}
                    </div>
                )}
                <div className="jw-card-actions">
                    {/* Wishlist */}
                    <button
                        className={`jw-action-btn ${wishlist.includes(p._id) ? 'jw-action-btn--active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(p._id, {
                                _id: p._id,
                                slug: p.slug,
                                title: p.title,
                                category: p.category,
                                images: variant.images || [],
                                oldPrice: variant.oldPrice,
                                newPrice: variant.newPrice,
                                isSale: variant.isSale,
                            });
                        }}
                        title={ui.addToWishlist}
                        aria-label={ui.addToWishlist}
                    >
                        <svg width="16" height="15" viewBox="0 0 16 15" fill="none">
                            <path
                                d="M8 13.5C8 13.5 1 9 1 4.5C1 2.567 2.567 1 4.5 1C5.892 1 7.1 1.8 8 3C8.9 1.8 10.108 1 11.5 1C13.433 1 15 2.567 15 4.5C15 9 8 13.5 8 13.5Z"
                                stroke="currentColor" strokeWidth="1.3"
                                fill={wishlist.includes(p._id) ? 'currentColor' : 'none'}
                            />
                        </svg>
                    </button>
                    {/* Quick View */}
                    <button
                        className="jw-action-btn"
                        title={ui.quickView}
                        aria-label={ui.quickView}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onQuickView(p);
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
                            <path d="M1 8C2.5 4 5 2 8 2C11 2 13.5 4 15 8C13.5 12 11 14 8 14C5 14 2.5 12 1 8Z" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                    </button>
                    {/* Add to Cart */}
                    <button
                        className="jw-action-btn jw-add-cart"
                        title={ui.addToCart}
                        aria-label={ui.addToCart}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddToCart(p, 1);
                        }}
                    >
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
                    {oldPrice && (
                        <span className="jw-old-price">{formatPrice(oldPrice, currency)}</span>
                    )}
                    {newPrice !== null && newPrice !== undefined ? (
                        <span className="jw-new-price">{formatPrice(newPrice, currency)}</span>
                    ) : (
                        <span className="jw-new-price jw-price-na">{ui.priceOnRequest}</span>
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
//  Render helper: groups consecutive 'li' items into a single <ul>
// ─────────────────────────────────────────────────────────
function renderContentBlocks(blocks) {
    const out = [];
    let liBuffer = [];
    let liKeyStart = null;

    const flushLi = () => {
        if (liBuffer.length > 0) {
            out.push(
                <ul key={`ul-${liKeyStart}`} style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                    {liBuffer.map((text, j) => (
                        <li key={j} dangerouslySetInnerHTML={{ __html: text }} />
                    ))}
                </ul>
            );
            liBuffer = [];
            liKeyStart = null;
        }
    };

    blocks.forEach((item, i) => {
        if (item.type === 'li') {
            if (liKeyStart === null) liKeyStart = i;
            liBuffer.push(item.text);
            return;
        }
        flushLi();
        if (item.type === 'h') {
            out.push(
                <h3 key={i} className="jw-accordion-heading" dangerouslySetInnerHTML={{ __html: item.text }} />
            );
        } else if (item.type === 'p') {
            out.push(<p key={i} dangerouslySetInnerHTML={{ __html: item.text }} />);
        }
    });
    flushLi();

    return out;
}

// ─────────────────────────────────────────────────────────
//  MAIN CHOSEN PAGE
// ─────────────────────────────────────────────────────────
export default function Chosen() {
    const router = useRouter();

    // ── Translation state ──
    const [ui, setUi] = useState(DEFAULT_UI);
    const [translatedContent, setTranslatedContent] = useState(chosenJewelleryContent);
    const [translatedFaq, setTranslatedFaq] = useState(faqData);
    const [translatedCategories, setTranslatedCategories] = useState(
        DEFAULT_CATEGORIES.map((c) => ({ ...c, translatedName: c.name }))
    );
    const [translationStatus, setTranslationStatus] = useState("idle");

    // ── Currency ──
    const [currency, setCurrency] = useState(CURRENCY_MAP.default);

    const [catOpen, setCatOpen] = useState(true);
    const [priceOpen, setPriceOpen] = useState(true);
    const [activePrice, setActivePrice] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Chosen");

    const [perPage, setPerPage] = useState(30);
    const [sort, setSort] = useState("default");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ── Wishlist — WishlistContext ──
    const { wishlistItems, addToWishlist, removeFromWishlist: removeFromWishlistCtx } = useWishlist();
    const wishlist = (wishlistItems || []).map(item => item._id || item);

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
        toastTimer.current = setTimeout(() => {
            setToast({ visible: false, message: '' });
        }, 2500);
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

            if (countryCode && CURRENCY_MAP[countryCode]) {
                setCurrency(CURRENCY_MAP[countryCode]);
            }

            if (languageCode === "en") {
                setTranslationStatus("done");
                return;
            }

            const allStrings = [
                ...flattenUI(DEFAULT_UI),
                ...flattenContent(chosenJewelleryContent),
                ...flattenFaq(faqData),
                ...flattenCategories(DEFAULT_CATEGORIES),
            ];

            const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts: allStrings, targetLanguage: languageCode, sourceLanguage: "en" }),
            });
            const translateData = await translateRes.json();
            if (!translateData.success) throw new Error("Translation failed");

            const all = translateData.translations;
            const uiCount = flattenUI(DEFAULT_UI).length;
            const contentCount = chosenJewelleryContent.length;
            const faqCount = faqData.length * 2;
            const catCount = DEFAULT_CATEGORIES.length;

            setUi(rebuildUI(all.slice(0, uiCount)));
            setTranslatedContent(rebuildContent(chosenJewelleryContent, all.slice(uiCount, uiCount + contentCount)));
            setTranslatedFaq(rebuildFaq(all.slice(uiCount + contentCount, uiCount + contentCount + faqCount)));
            setTranslatedCategories(rebuildCategories(DEFAULT_CATEGORIES, all.slice(uiCount + contentCount + faqCount, uiCount + contentCount + faqCount + catCount)));

            setTranslationStatus("done");
        } catch (err) {
            console.error("Auto-translate error:", err.message);
            setTranslationStatus("error");
        }
    }, []);

    useEffect(() => { translateContent(); }, [translateContent]);

    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        const urlSlug = categorySlugMap[categoryName] || "chosen-jewellery";
        router.push(`/product-category/${urlSlug}`);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const queryParams = new URLSearchParams();
                if (activeCategory) queryParams.append("category", activeCategory);
                const url = `${API_BASE}/api/products?${queryParams.toString()}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Server Error: ${response.status}`);
                const data = await response.json();
                if (data.success) {
                    setProducts(data.products || []);
                } else {
                    throw new Error(data.message || "Failed to fetch data.");
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [activeCategory]);

    // ── Wishlist toggle ──
    const toggleWishlist = useCallback((id, productData) => {
        if (wishlist.includes(id)) {
            removeFromWishlistCtx(id);
        } else {
            addToWishlist(productData || { _id: id });
        }
    }, [wishlist, addToWishlist, removeFromWishlistCtx]);

    // ── Add to Cart ──
    const handleAddToCart = useCallback((product, qty = 1) => {
        const variant = getFirstVariant(product);
        const cartItem = {
            _id: product._id,
            slug: product.slug,
            title: product.title,
            category: product.category,
            images: variant.images || [],
            oldPrice: variant.oldPrice,
            newPrice: variant.newPrice,
            isSale: variant.isSale,
            qty,
        };
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

    return (
        <div className="jw-page">

            {/* Translation loading bar */}
            {translationStatus === "loading" && (
                <div className="translation-loading-bar" aria-hidden="true" />
            )}

            {/* Toast */}
            <Toast message={toast.message} visible={toast.visible} />

            {/* Quick View Modal */}
            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    currency={currency}
                    ui={ui}
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
                {ui.filtersText}
            </button>

            {sidebarOpen && <div className="jw-overlay" onClick={() => setSidebarOpen(false)} />}

            <div className="jw-layout" ref={layoutRef}>
                <div className="jw-sidebar-wrapper">
                    <aside ref={sidebarRef} className={`jw-sidebar ${sidebarOpen ? 'jw-sidebar--open' : ''}`}>
                        <div className="jw-sidebar-inner">
                            <button className="jw-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>

                            {/* Categories */}
                            <div className="jw-filter-block">
                                <button className="jw-filter-heading" onClick={() => setCatOpen(!catOpen)} aria-expanded={catOpen}>
                                    <span>{ui.productCategories}</span>
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

                    {/* Toolbar */}
                    <div className="jw-toolbar">
                        <span className="jw-results-count">
                            {loading
                                ? ui.loadingText
                                : `${ui.showingOf} ${displayed.length} of ${filtered.length} ${ui.showingResults}`}
                        </span>
                        <div className="jw-toolbar-right">
                            <div className="jw-per-page">
                                <span className="jw-per-label">{ui.showText}</span>
                                {[12, 15, 30].map((n) => (
                                    <button key={n} className={`jw-per-btn ${perPage === n ? 'jw-per-btn--active' : ''}`} onClick={() => setPerPage(n)}>{n}</button>
                                ))}
                            </div>
                            <div className="jw-sort-wrap">
                                <select className="jw-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                                    <option value="default">{ui.defaultSorting}</option>
                                    <option value="price-asc">{ui.priceLowHigh}</option>
                                    <option value="price-desc">{ui.priceHighLow}</option>
                                    <option value="newest">{ui.newest}</option>
                                </select>
                                <span className="jw-select-arrow">
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                    </svg>
                                </span>
                            </div>
                            <button className="jw-grid-toggle" title={ui.gridView}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect width="7" height="7" rx="1" fill="currentColor" />
                                    <rect x="9" width="7" height="7" rx="1" fill="currentColor" />
                                    <rect y="9" width="7" height="7" rx="1" fill="currentColor" />
                                    <rect x="9" y="9" width="7" height="7" rx="1" fill="currentColor" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="jw-error">
                            <span>⚠️ {error}</span>
                            <button onClick={() => setActiveCategory(activeCategory)}>{ui.retry}</button>
                        </div>
                    )}

                    {/* Product Grid */}
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
                                    currency={currency}
                                    ui={ui}
                                    onQuickView={openQuickView}
                                    onAddToCart={handleAddToCart}
                                />
                            ))
                        ) : (
                            <div className="jw-empty">
                                <p>{ui.noProductsBase}{activeCategory ? ` in "${activeCategory}"` : ''}.</p>
                                <p style={{ fontSize: '13px', marginTop: '8px', color: '#aaa' }}>
                                    {ui.checkConsole}
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Reviews />

             {/* Bottom Accordions */}
                    <div className="jw-bottom-accordions">
                        <AccordionItem title={ui.chosenJewellery}>
                            <div className="jw-accordion-text">
                                {renderContentBlocks(translatedContent)}
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