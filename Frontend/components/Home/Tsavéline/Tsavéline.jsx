"use client";
import React, { useState, useEffect } from 'react';
import "./Tsavéline.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  mainHeading: "Featured Products - Picked Just For You",
  subHeading: "Tsavéline Pavé Edition",
  buttonText: "SHOP NOW",
};

const Tsavéline = () => {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    const translateContent = async () => {
      try {
        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();

        if (!detectData.success) return;

        const { languageCode } = detectData;
        console.log("Detected language:", languageCode);

        if (languageCode === "en") return;

        // Extract values to translate
        const textKeys = Object.keys(DEFAULT_CONTENT);
        const textValues = Object.values(DEFAULT_CONTENT);

        const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            texts: textValues,
            targetLanguage: languageCode,
            sourceLanguage: "en",
          }),
        });

        const translateData = await translateRes.json();

        if (!translateData.success) return;

        const translatedContent = {};
        textKeys.forEach((key, index) => {
          translatedContent[key] = translateData.translations[index] || DEFAULT_CONTENT[key];
        });

        setContent(translatedContent);
      } catch (error) {
        console.error("Translation Error:", error);
      }
    };

    translateContent();
  }, []);

  return (
    <>
      <h2 className="Tsaveline-Ttitle">{content.mainHeading}</h2>

      {/* Desktop banner - image CSS me background hai */}
      <div className="tsaveline-banner tsaveline-banner-desktop">
        <div className="tsaveline-content">
          <h3 className="tsaveline-title">{content.subHeading}</h3>
          <a href="/product-category/rings/">
            <button className="hero-btn">{content.buttonText}</button>
          </a>
        </div>
      </div>

      {/* Mobile banner - alag image */}
      <div className="tsaveline-banner tsaveline-banner-mobile">
        <div className="tsaveline-content">
          <h3 className="tsaveline-title">{content.subHeading}</h3>
          <a href="/product-category/rings/">
            <button className="hero-btn">{content.buttonText}</button>
          </a>
        </div>
      </div>
    </>
  );
}

export default Tsavéline;