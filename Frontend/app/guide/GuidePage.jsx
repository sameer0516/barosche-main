"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./Guide.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const INITIAL_GUIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=500&auto=format&fit=crop",
    title: "How to Choose the Right Gemstone Jewellery",
    author: "Barosche",
    description: "Choosing the right gemstone jewellery, whether it's elegant gemstone rings or statement gemstone necklaces, can often feel overwhelming when you're faced with endless designs, colors, and stone types online. Yet the right choice goes far beyond appearance; it's about finding a piece that truly reflects your personality and style. From understanding stone quality to selecting designs that suit your lifestyle."
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=500&auto=format&fit=crop",
    title: "How to Find or Measure Your Ring Size at Home",
    author: "Barosche",
    description: "Selecting the perfect ring size is an essential step in choosing a piece that feels as exceptional as it looks. A ring is more than jewellery; it is a reflection of personal style, emotion, and timeless elegance. At Barosche, we believe that the perfect fit enhances not only comfort but also the overall experience of wearing fine jewellery. A well-fitted"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=500&auto=format&fit=crop",
    title: "How to Buy Jewellery Online Safely (Step-by-Step Guide)",
    author: "Barosche",
    description: "If you're planning to buy jewellery online, you've likely asked yourself: Is it safe? Will the quality match the images? Can I trust the seller? These concerns are valid. Jewellery online shopping offers convenience and access to global designs, but it also comes with risks, such as misleading product descriptions, counterfeit materials, or unreliable sellers. Buying jewellery online safely means"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=500&auto=format&fit=crop",
    title: "What Are the Latest Jewellery Designs in 2026 You Must Try",
    author: "Barosche",
    description: "Jewellery trends evolve fast, and if you're searching for the latest jewellery designs in 2026, you're likely wondering what's actually worth investing in this year. With so many styles flooding the market, it's easy to feel overwhelmed or unsure about what truly defines modern elegance. From bold statement pieces to minimalist everyday essentials, 2026 is all about balance, where individuality"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=500&auto=format&fit=crop",
    title: "What Is Fine Jewellery? Meaning, Types & How to Identify Real Pieces",
    author: "Barosche",
    description: "Not all jewellery that shines is truly valuable. So how do you know if what you're buying is actually fine jewellery? With countless options available, especially when browsing fine jewellery online, it's not always easy to tell the difference between real value and surface-level shine. Understanding fine jewellery goes beyond aesthetics. It's about materials, craftsmanship, durability, and long-term worth. Whether"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=500&auto=format&fit=crop",
    title: "How to Choose the Right Gemstone Earrings for Every Occasion",
    author: "Barosche",
    description: "Ever wondered how the right pair of earrings can completely transform your look? Gemstone earrings are a timeless addition to any jewellery collection, offering elegance, versatility, and personal expression. Whether you're dressing for a casual outing, a professional meeting, or a grand celebration, the right pair of gemstone earrings can instantly elevate your look. With the increasing demand for gemstone"
  }
];

const DEFAULT_CONTENT = {
  mainTitle: "Complete Guide to Choosing, Styling & Caring for Jewellery",
  readMore: "Read More »",
  guides: INITIAL_GUIDES.map(g => ({
    title: g.title,
    author: g.author,
    description: g.description
  }))
};

const flattenContent = (content) => {
  const flat = [];
  flat.push(content.mainTitle);
  flat.push(content.readMore);
  
  content.guides.forEach((guide) => {
    flat.push(guide.title);
    flat.push(guide.author);
    flat.push(guide.description);
  });
  
  return flat;
};

const rebuildContent = (translations) => {
  let i = 0;
  const get = () => translations[i++];

  const mainTitle = get();
  const readMore = get();
  
  const guides = INITIAL_GUIDES.map((g) => ({
    id: g.id,
    image: g.image,
    title: get(),
    author: get(),
    description: get()
  }));

  return { mainTitle, readMore, guides };
};

const GuidePage = () => {
  const [content, setContent] = useState({
    mainTitle: DEFAULT_CONTENT.mainTitle,
    readMore: DEFAULT_CONTENT.readMore,
    guides: INITIAL_GUIDES
  });
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [translationStatus, setTranslationStatus] = useState("idle");

  const translateContent = useCallback(async () => {
    try {
      setTranslationStatus("loading");

      const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
      const detectData = await detectRes.json();

      if (!detectData.success) throw new Error("Language detection failed");

      const { languageCode, languageName } = detectData;
      setDetectedLanguage({ code: languageCode, name: languageName });

      if (languageCode === "en") {
        setTranslationStatus("done");
        return;
      }

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
    <div className="guide-container">
      
      {translationStatus === "loading" && (
        <div className="translation-loading-bar" aria-hidden="true" />
      )}

      <h1 className="guide-main-title">
        {content.mainTitle}
      </h1>

      <div className="guide-grid">
        {content.guides.map((item) => (
          <article key={item.id} className="guide-card">
            <div className="guide-image-wrapper">
              <img src={item.image} alt={item.title} className="guide-img" />
            </div>

            <div className="guide-info">
              <h2 className="guide-card-title">{item.title}</h2>
              <span className="guide-author">{item.author}</span>
              <p className="guide-description">{item.description}</p>
              <a href={`/guide/${item.id}`} className="read-more-link">
                {content.readMore}
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default GuidePage;