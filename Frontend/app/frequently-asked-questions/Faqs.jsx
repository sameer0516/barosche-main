"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./Faqs.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_TITLE = "Frequently Asked Questions";

const INITIAL_FAQ_DATA = [
    {
        question: "What is semi-handmade jewellery?",
        answer: "Semi-handmade jewellery combines machine precision with skilled craftsmanship, ensuring unique designs with consistent quality."
    },
    {
        question: "What types of luxury accessories does Barosche offer?",
        answer: "Barosche offers premium luxury accessories, including fine jewellery, minimalist pieces, and statement designs for men and women"
    },
    {
        question: "What is considered fine jewellery?",
        answer: "Fine jewellery is made using high-quality metals like gold and silver, often paired with gemstones or diamonds for lasting value."
    },
    {
        question: "Does Barosche offer diamond jewellery?",
        answer: "Yes, Barosche features elegant diamond jewellery, including rings, pendants, and earrings."
    },
    {
        question: " Is it safe to buy jewellery online from Barosche?",
        answer: "Yes, Barosche ensures secure jewellery online shopping with trusted payment methods and quality assurance."
    },
    {
        question: "What is minimalist jewellery?",
        answer: "Minimalist jewellery features simple, elegant designs that are perfect for everyday wear and modern styling."
    },
    {
        question: "What is minimalist luxury jewellery?",
        answer: "It blends minimal design with premium materials like gold, diamonds, or gemstones."
    },
    {
        question: "Can I buy fine jewellery online from Barosche?",
        answer: "Yes, you can explore and purchase fine jewellery online with ease."
    },
    {
        question: "Where can I find the latest jewellery designs?",
        answer: "You can browse the “New In Jewellery Collection” section for the latest designs"
    },
    {
        question: "What is trending jewellery for women right now?",
        answer: "Trending jewellery includes dainty necklaces, statement rings, and minimalist earrings"
    },
    {
        question: "Does Barosche offer new fashion jewellery regularly?",
        answer: "Yes, new fashion jewellery is added frequently to keep up with trends."
    },
    {
        question: "What is included in the new in jewellery collection?",
        answer: "It includes trending jewellery for women, new designs, and seasonal collections."
    },
    {
        question: "Does Barosche offer mens jewellery online?",
        answer: "Yes, Barosche offers a wide range of mens jewellery online."
    },
    {
        question: "What types of mens accessories jewellery are available?",
        answer: "Options include bracelets, rings, and formal accessories for men."
    },
    {
        question: "What is luxury mens jewellery?",
        answer: "Luxury mens jewellery includes premium gold, silver, and gemstone pieces designed for style and sophistication."
    },
    {
        question: "What are formal accessories for men?",
        answer: "These include sleek bracelets, rings, and subtle jewellery suitable for formal wear."
    },
    {
        question: "What types of fashion jewellery for women are available?",
        answer: "Barosche offers earrings, rings, necklaces, and bracelets for women."
    },
    {
        question: "Does Barosche offer womens gold jewellery?",
        answer: "Yes, there is a wide collection of womens gold jewellery including daily wear and statement pieces."
    },
    {
        question: "What are the best earrings for women?",
        answer: "Minimalist studs, hoops, and gemstone earrings are popular choices."
    },
    {
        question: "What types of rings for women are trending?",
        answer: "Statement rings, gold rings, and gemstone rings are currently trending."
    },
    {
        question: "What necklaces for women are available?",
        answer: "Barosche offers minimalist, layered, and gemstone necklaces."
    },
    {
        question: "What are popular bracelets for women?",
        answer: "Gold bracelets, dainty bracelets, and charm bracelets are popular."
    },
    {
        question: "What is fine silver jewellery?",
        answer: "Fine silver jewellery is made from high-purity silver, offering durability and elegance."
    },
    {
        question: "What is jewellery with gold?",
        answer: "Jewellery crafted with gold or gold plating for a luxurious look."
    },
    {
        question: "What is semi precious gemstone jewellery?",
        answer: "Jewellery made with semi-precious stones like amethyst, topaz, and turquoise."
    },
    {
        question: "What are semi precious stones jewellery pieces?",
        answer: "These include rings, pendants, and bracelets featuring natural gemstones."
    },
    {
        question: "What is gold fashion jewellery?",
        answer: "Gold fashion jewellery combines trendy designs with gold plating or accents."
    },
    {
        question: "What is daily wear gold jewellery?",
        answer: "Lightweight gold jewellery suitable for everyday use."
    },
    {
        question: "What is everyday jewellery?",
        answer: "Jewellery designed for comfort and daily wear."
    },
    {
        question: "What is the best jewellery for everyday wear?",
        answer: "Dainty necklaces, simple rings, and stud earrings are ideal."
    },
    {
        question: "What is dainty jewellery?",
        answer: "Delicate, lightweight jewellery with subtle elegance."
    },
    {
        question: "What is everyday fine jewellery?",
        answer: "High-quality jewellery designed for daily wear."
    },
    {
        question: "How does jewellery online shopping work?",
        answer: "Browse, select, add to cart, and checkout securely."
    },
    {
        question: "Does Barosche offer designer jewellery online?",
        answer: "Yes, you can explore exclusive designer jewellery collections online."
    },
    {
        question: "Can I buy gold jewellery online?",
        answer: "Yes, Barosche offers secure options to buy gold jewellery online."
    },
    {
        question: "What is the best jewellery gift for a wife?",
        answer: "Gold necklaces, diamond rings, and personalised jewellery are great options."
    },
    {
        question: "What is a good jewellery gift for a girlfriend?",
        answer: "Dainty rings, bracelets, or gemstone pendants are popular choices."
    },
    {
        question: "What is the best jewellery gift for her?",
        answer: "Minimalist luxury jewellery and personalised designs make perfect gifts."
    },
    {
        question: "Does Barosche offer custom jewellery design?",
        answer: "Yes, you can create custom jewellery tailored to your style."
    },
    {
        question: "Can I order custom birthstone jewellery?",
        answer: "Yes, Barosche offers custom birthstone jewellery services."
    },
    {
        question: "What is personalised gemstone jewellery?",
        answer: "Jewellery customised with gemstones of your choice."
    },
    {
        question: "What is gold birthstone jewellery?",
        answer: "Gold jewellery featuring birthstones for personal significance."
    },
    {
        question: "What is lab grown diamond jewellery?",
        answer: "Ethically created diamonds with the same quality as natural ones."
    },
    {
        question: "Can I buy gemstone jewellery online?",
        answer: "Yes, Barosche offers a wide range of gemstone jewellery online."
    },
    {
        question: "What types of bracelets are available?",
        answer: "Gold bracelets, bracelets for men, and ladies bracelets in gold."
    },
    {
        question: "What types of rings are available?",
        answer: "Gold rings, diamond rings, sterling silver rings, and statement rings."
    },
    {
        question: "What types of pendants are available?",
        answer: "Gold pendants, gemstone pendants, and minimalist pendants."
    },
    {
        question: "What types of earrings are available?",
        answer: "Gold earrings, everyday earrings, and stylish designs for women."
    },
    {
        question: "How do I choose the right jewellery online?",
        answer: "Consider style, material, occasion, and personal preference."
    },
    {
        question: "Why choose Barosche for jewellery online?",
        answer: "Barosche offers premium quality, modern designs, secure shopping, and a wide variety of fine jewellery and luxury accessories."
    }

];

const flattenContent = (title, faqs) => {
    const flat = [title];
    faqs.forEach(faq => {
        flat.push(faq.question);
        flat.push(faq.answer);
    });
    return flat;
};

const rebuildContent = (translations) => {
    let i = 0;
    const title = translations[i++];
    const faqs = [];
    
    for (let j = 0; j < INITIAL_FAQ_DATA.length; j++) {
        faqs.push({
            question: translations[i++],
            answer: translations[i++]
        });
    }
    
    return { title, faqs };
};

const Faqs = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [title, setTitle] = useState(DEFAULT_TITLE);
    const [faqData, setFaqData] = useState(INITIAL_FAQ_DATA);
    const [translationStatus, setTranslationStatus] = useState("idle");

    const translateContent = useCallback(async () => {
        try {
            setTranslationStatus("loading");

            const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
            const detectData = await detectRes.json();

            if (!detectData.success) throw new Error("Language detection failed");

            const { languageCode } = detectData;

            if (languageCode === "en") {
                setTranslationStatus("done");
                return;
            }

            const allStrings = flattenContent(DEFAULT_TITLE, INITIAL_FAQ_DATA);

            const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texts: allStrings,
                    targetLanguage: languageCode,
                    sourceLanguage: "en",
                }),
            });

            const translateData = await translateRes.json();
            if (!translateData.success) throw new Error("Translation failed");

            const translatedContent = rebuildContent(translateData.translations);
            setTitle(translatedContent.title);
            setFaqData(translatedContent.faqs);
            setTranslationStatus("done");
        } catch (err) {
            console.error("Auto-translate error:", err.message);
            setTranslationStatus("error");
        }
    }, []);

    useEffect(() => {
        translateContent();
    }, [translateContent]);

    const toggleAccordion = (index) => {
        if (activeIndex === index) {
            setActiveIndex(null);
        } else {
            setActiveIndex(index);
        }
    };

    return (
        <div className="faq-container">
            {translationStatus === "loading" && (
                <div className="translation-loading-bar" aria-hidden="true" />
            )}
            
            <h1 className="faq-title">{title}</h1>
            
            <div className="faq-list">
                {faqData.map((item, index) => (
                    <div 
                        key={index} 
                        className={`faq-item ${activeIndex === index ? "active" : ""}`}
                    >
                        <div className="faq-header" onClick={() => toggleAccordion(index)}>
                            <span className="faq-question">{item.question}</span>
                            <span className="faq-icon">
                                {activeIndex === index ? "−" : "+"}
                            </span>
                        </div>
                        
                        {activeIndex === index && (
                            <div className="faq-body">
                                <p className="faq-answer">{item.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Faqs;