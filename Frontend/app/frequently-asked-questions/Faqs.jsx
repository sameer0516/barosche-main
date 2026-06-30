"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./Faqs.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_TITLE = "Frequently Asked Questions";

const INITIAL_FAQ_DATA = [
    {
        question: "What type of jewellery do you offer online?",
        answer: "We offer a wide variety of high-quality jewellery online, including rings, necklaces, bracelets, and earrings crafted to perfection."
    },
    {
        question: "Is it safe to buy jewellery online from your website?",
        answer: "Yes, it is completely safe. We use secure payment gateways and provide certified, insured shipping for all orders."
    },
    {
        question: "Do you specialize in fine jewellery online?",
        answer: "Absolutely. We specialize in premium fine jewellery crafted with precious metals and high-grade gemstones."
    },
    {
        question: "What is semi-handmade jewellery and how is it different?",
        answer: "Semi-handmade jewellery combines advanced modern casting with hand-finished polishing and stone setting for the perfect balance of precision and artistry."
    },
    {
        question: "Do you offer diamond jewellery collections?",
        answer: "Yes, we offer a range of diamond jewellery designed with elegance and sophistication. These pieces are perfect for both special occasions and refined everyday styling."
    },
    {
        question: "Where can I find the latest jewellery designs?",
        answer: "You can find our newest arrivals directly on our homepage under the 'New Arrivals' section or by browsing our latest collections tab."
    },
    {
        question: "Do you update your jewellery collection regularly?",
        answer: "Yes, we update our collections regularly to keep up with the latest trends and seasonal styles."
    },
    {
        question: "Do you offer trending jewellery for women?",
        answer: "Yes, we have a dedicated selection of trending and modern jewellery designs tailored specifically for women."
    },
    {
        question: "Is there a dedicated collection for men’s jewellery?",
        answer: "Yes, we offer a specialized collection for men, including rings, chains, and minimalist bracelets."
    },
    {
        question: "What are the best luxury mens accessories available?",
        answer: "Our best luxury accessories for men include premium cufflinks, classic signet rings, and heavy-gauge bracelets."
    },
    {
        question: "Do you offer minimalist jewellery for everyday use?",
        answer: "Yes, we have a beautiful selection of lightweight, minimalist pieces designed comfortably for everyday wear."
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
            
            <h2 className="faq-title">{title}</h2>
            
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