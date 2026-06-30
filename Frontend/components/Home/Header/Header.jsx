"use client";
import React, { useState, useEffect } from "react";
import "./Header.css";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  title: "The Valdorian Signet Ring",
  button: "SHOP NOW",
};

export default function Header() {
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    const translateContent = async () => {
      try {
        // ✅ FIXED: "detect-languag" → "detect-language"
        const detectRes = await fetch(
          `${BACKEND_URL}/api/translate/detect-language`
        );
        const detectData = await detectRes.json();

        if (!detectData.success) return;

        const { languageCode } = detectData;
        console.log("Detected language:", languageCode);

        if (languageCode === "en") return;

        const translateRes = await fetch(
          `${BACKEND_URL}/api/translate/translate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              texts: [DEFAULT_CONTENT.title, DEFAULT_CONTENT.button],
              targetLanguage: languageCode,
              sourceLanguage: "en",
            }),
          }
        );

        const translateData = await translateRes.json();

        if (!translateData.success) return;

        setContent({
          title: translateData.translations[0],
          button: translateData.translations[1],
        });
      } catch (error) {
        console.error("Translation Error:", error);
      }
    };

    translateContent();
  }, []);

  return (
    <section className="hero-section">
      <video autoPlay loop muted playsInline className="hero-video desktop-video">
        <source src="/ring-video.mp4" type="video/mp4" />
      </video>

      <video autoPlay loop muted playsInline className="hero-video mobile-video">
        <source src="/Sequence 05.mp4" type="video/mp4" />
      </video>
{/* header section me translation wala section add kiya h us type se collection wali file me bi add karna h please generate tha full code collections.jsx file */}
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1 className="hero-title">{content.title}</h1>
        <a href="/product-category/rings/">
          <button className="hero-btn">{content.button}</button>
        </a>
      </div>
    </section>
  );
}