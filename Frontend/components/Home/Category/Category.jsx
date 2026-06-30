"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./Category.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  mainTitle: "Shop By Category",
};

const initialCategories = [
  { id: 1, name: "Bracelets", count: 1, img: "/3.jpeg", url: "/product-category/bracelets/" },
  { id: 2, name: "Pendants", count: 4, img: "/4.jpeg", url: "/product-category/pendants/" },
  { id: 3, name: "Earrings", count: 3, img: "/2.jpeg", url: "/product-category/earrings/" },
  { id: 4, name: "Rings", count: 3, img: "/5.jpeg", url: "/product-category/rings/" },
];

export default function Category() {
  const router = useRouter();

  // States for translation
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [categories, setCategories] = useState(initialCategories);

  useEffect(() => {
    const translateContent = async () => {
      try {
        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();

        if (!detectData.success) return;

        const { languageCode } = detectData;
        console.log("Detected language:", languageCode);

        if (languageCode === "en") return;

        // 1. Extract texts to translate
        const textValues = Object.values(DEFAULT_CONTENT); // ["Shop By Category"]
        const categoryNames = initialCategories.map((c) => c.name); // ["Jewellery", "Pendants", ...]

        // 2. Combine all for a SINGLE API call
        const allTextsToTranslate = [...textValues, ...categoryNames];

        const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            texts: allTextsToTranslate,
            targetLanguage: languageCode,
            sourceLanguage: "en",
          }),
        });

        const translateData = await translateRes.json();

        if (!translateData.success) return;

        const translations = translateData.translations;

        // 3. Split the translations back
        const translatedTitle = translations[0]; // First item is the main title
        const translatedCategoryNames = translations.slice(1); // Rest are category names

        // Update main title state
        setContent({ mainTitle: translatedTitle || DEFAULT_CONTENT.mainTitle });

        // Update categories state with new translated names
        const translatedCategories = initialCategories.map((item, index) => ({
          ...item,
          name: translatedCategoryNames[index] || item.name,
        }));
        
        setCategories(translatedCategories);

      } catch (error) {
        console.error("Translation Error:", error);
      }
    };

    translateContent();
  }, []);

  const handleClick = (url) => {
    router.push(url);
  };

  return (
    <>
      <div className="category-section">
        <h1 className="category-main-title">{content.mainTitle}</h1>

        <div className="category-grid">
          {categories.map((item) => (
            <div
              key={item.id}
              className="category-card"
              onClick={() => handleClick(item.url)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleClick(item.url)}
              aria-label={`Shop ${item.name}`}
              style={{ cursor: "pointer" }}
            >
              <div className="category-image-wrapper">
                <img
                  src={item.img}
                  alt={item.name}
                  className="category-image"
                />
              </div>

              <div className="category-info">
                <span className="category-name">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}