"use client";
import React, { useState, useEffect } from "react";
import "./EarringsRings.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  heading: "About Us",
  para1: "At Barosche, we believe jewellery is more than an accessory; it is a reflection of identity, emotion, and timeless elegance. Our collections are thoughtfully designed to celebrate individuality through finely crafted pieces that blend modern aesthetics with classic artistry.",
  para2: "Each creation at Barosche is a testament to expert craftsmanship and attention to detail. From radiant gemstone earrings and intricately handcrafted rings to elegant bracelets and timeless pendants, we curate designs that embody sophistication, durability, and everyday luxury. We work closely with skilled artisans and trusted sourcing partners to ensure every piece meets the highest standards of quality and authenticity.",
  para3: "Our passion lies in creating jewellery that tells a story. Whether it’s a meaningful gift or a personal statement, Barosche offers designs that celebrate life’s most special moments with grace and brilliance.",
  para4: "At the heart of Barosche is a commitment to excellence, transparency, and customer satisfaction. We strive to deliver not just jewellery, but an experience that feels luxurious, memorable, and truly personal.",
  readMore: "Read More",
  readLess: "Read Less",
};

const EarringsRings = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Translation ke liye state
  const [content, setContent] = useState(DEFAULT_CONTENT);

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

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

        // Reconstruct the state with translated values
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
    <div className="jewelry-container">
      {/* Main Header */}
      <h1 className="main-title">{content.heading}</h1>

      <section className="jewelry-section">
        <div className="jewelry-image-container">
          <img
            src="fgf-1000x668.jpg"
            alt="About Baroshe Collection"
            className="jewelry-image"
          />
        </div>
        
        <div className="jewelry-content about-content">
          <p>{content.para1}</p>

          <div className={`extra-content ${isExpanded ? "expanded" : ""}`}>
            <p>{content.para2}</p>
            <p>{content.para3}</p>
            <p>{content.para4}</p>
          </div>

          <button className="read-more-btn" onClick={toggleReadMore}>
            {isExpanded ? content.readLess : content.readMore}
          </button>
        </div>
      </section>
    </div>
  );
};

export default EarringsRings;