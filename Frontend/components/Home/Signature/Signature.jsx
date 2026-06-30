"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./Signature.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  heading: "Signature Pieces For Him & Her",
  buttonText: "Shop Now",
};

const initialProducts = [
  {
    id: 1,
    image: "/main-1.webp",
    alt: "Designed for You",
    title: "Tsavorite Garnet Ring 18k Gold Vermeil",
    descriptions: [
      "This Tsavorite Garnet Ring in 18k gold vermeil brings a vivid green stone and quiet diamond light into a clean, open design—made to be worn today, not saved for an occasion.",
    ],
    url: "/product-category/rings/tsavorite-garnet-gemstone-ring/",
  },
  {
    id: 2,
    image: "/barosche-4.webp",
    alt: "Worn Your Way",
    title: "Tsavorite & Diamond Band Ring 18k Gold Vermeil",
    descriptions: [
      "This Tsavorite & Diamond Band Ring in 18k gold vermeil brings vivid green and quiet brilliance together—made to be worn today, not saved for later.",
    ],
    url: "/product-category/rings/tsavorite-garnet-diamond-band-ring/",
  },
];

export default function Signature() {
  const router = useRouter();

  // States for dynamic translation
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    const translateContent = async () => {
      try {
        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();

        if (!detectData.success) return;

        const { languageCode } = detectData;
        console.log("Detected language:", languageCode);

        if (languageCode === "en") return;

        // 1. Extract static texts
        const textKeys = Object.keys(DEFAULT_CONTENT);
        const textValues = Object.values(DEFAULT_CONTENT);

        // 2. Extract product titles and descriptions
        const productTitles = initialProducts.map((p) => p.title);
        const productDescriptions = initialProducts.map((p) => p.descriptions[0]); // assuming 1st description

        // 3. Combine all for a SINGLE API call
        const allTextsToTranslate = [
          ...textValues,
          ...productTitles,
          ...productDescriptions,
        ];

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

        // 4. Split the translations back into their respective parts
        const translatedTextValues = translations.slice(0, textValues.length);
        const translatedTitles = translations.slice(
          textValues.length,
          textValues.length + productTitles.length
        );
        const translatedDescriptions = translations.slice(
          textValues.length + productTitles.length
        );

        // Update Static Content State
        const translatedContent = {};
        textKeys.forEach((key, index) => {
          translatedContent[key] = translatedTextValues[index] || DEFAULT_CONTENT[key];
        });
        setContent(translatedContent);

        // Update Products State
        const translatedProducts = initialProducts.map((product, index) => ({
          ...product,
          title: translatedTitles[index] || product.title,
          descriptions: [translatedDescriptions[index] || product.descriptions[0]],
        }));
        setProducts(translatedProducts);

      } catch (error) {
        console.error("Translation Error:", error);
      }
    };

    translateContent();
  }, []);

  const handleProductClick = (url) => {
    router.push(url);
  };

  return (
    <>
      <div className="Signature-title">{content.heading}</div>
      <div className="signature-container">
        {products.map((product) => (
          <div className="signature-card" key={product.id}>
            {/* Image click → navigate */}
            <div
              className="signature-image-wrapper"
              onClick={() => handleProductClick(product.url)}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleProductClick(product.url)}
              aria-label={`View ${product.title}`}
            >
              <img
                src={product.image}
                alt={product.alt}
                className="signature-image"
              />
            </div>

            {/* Title click → navigate */}
            <h2
              className="signature-title"
              onClick={() => handleProductClick(product.url)}
              style={{ cursor: "pointer" }}
            >
              {product.title}
            </h2>

            <div className="signature-text-container">
              {product.descriptions.map((desc, i) => (
                <p className="signature-description" key={i}>
                  {desc}
                </p>
              ))}
            </div>

            {/* Button click → navigate */}
            <button
              className="signature-btn"
              onClick={() => handleProductClick(product.url)}
            >
              {content.buttonText}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}