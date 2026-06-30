"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./Sourcing.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
    title: "How We Source & Manufacture Jewellery",
    intro: "At Barosché, we are committed to delivering your jewellery safely, securely, and with the highest level of care. Each order is carefully packaged to ensure protection during transit.",
    points: {
        l1: "We use certified 925 silver and 9K, 14K, and 18K gold.",
        l2: "All gemstones are carefully selected for authenticity and brilliance.",
        l3: "Every piece is handcrafted with strict quality control.",
        l4: "Ethical sourcing practices guide our material selection."
    },
    outro: "Each jewellery item undergoes inspection before shipping and is delivered with an official authentication certificate."
};

const flattenContent = (content) => [
    content.title,
    content.intro,
    content.points.l1,
    content.points.l2,
    content.points.l3,
    content.points.l4,
    content.outro
];

const rebuildContent = (translations) => {
    let i = 0;
    const get = () => translations[i++];
    return {
        title: get(),
        intro: get(),
        points: {
            l1: get(),
            l2: get(),
            l3: get(),
            l4: get()
        },
        outro: get()
    };
};

export default function Sourcing() {
    const [content, setContent] = useState(DEFAULT_CONTENT);
    const [translationStatus, setTranslationStatus] = useState("idle");

    const translateContent = useCallback(async () => {
        try {
            setTranslationStatus("loading");

            // 1. Detect language
            const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
            const detectData = await detectRes.json();

            if (!detectData.success) throw new Error("Language detection failed");

            const { languageCode } = detectData;

           
            if (languageCode === "en") {
                setTranslationStatus("done");
                return;
            }

            // 2. Translate strings
            const allStrings = flattenContent(DEFAULT_CONTENT);

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

            // 3. Rebuild and set content
            const translatedContent = rebuildContent(translateData.translations);
            setContent(translatedContent);
            setTranslationStatus("done");
        } catch (err) {
            console.error("Auto-translate error:", err.message);
            setTranslationStatus("error");
        }
    }, []);

    useEffect(() => {
        translateContent();
    }, [translateContent]);

    return (
        <>
            {translationStatus === "loading" && (
                <div className="translation-loading-bar" aria-hidden="true" />
            )}
            <div className="Shipping">
                <div className="Shipping-container">
                    <div className="row">
                        <div className="col-12">
                            <div className="Shipping-title">{content.title}</div>
                            <div className="">
                                <div className="Effective-prag">{content.intro}</div>
                                <div className="Coverage-container">
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.points.l1}</li>
                                        <li>{content.points.l2}</li>
                                        <li>{content.points.l3}</li>
                                        <li>{content.points.l4}</li>
                                    </div>
                                    <p>{content.outro}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}