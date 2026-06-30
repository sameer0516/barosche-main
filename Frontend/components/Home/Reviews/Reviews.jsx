"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Swiper styles import
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import "./Reviews.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  usp1: "365-Day Warranty",
  usp2: "Complimentary Shipping on Orders Above €200",
  usp3: "30-Day Free Returns & Exchanges",
  heading: "WHAT OUR CUSTOMERS SAY ABOUT US",
};

const reviewsData = [
  {
    id: 1,
    name: "Baktygul Tageva",
    image: "/Review-1.jpeg",
    text: "I was looking for something different from the usual diamond rings, and this was exactly it. The craftsmanship is beautiful, the fit is perfect, and the tsavorite catches the light in such a subtle but stunning way.",
  },
  {
    id: 2,
    name: "Medea Eichberger",
    image: "/Review-2.jpeg",
    text: "These earrings add the perfect pop of color without feeling too bold. They’re lightweight, comfortable enough to wear all day, and the turquoise is absolutely beautiful.",
  },
  {
    id: 3,
    name: "Elvira",
    image: "/Review-3.jpeg",
    text: "Das Design ist zeitlos und die Edelsteine verleihen den Ohrringen einen schönen, dezenten Glanz. Sie sind sehr angenehm zu tragen und schnell zu meinen Lieblingsohrringen geworden.",
  },
];

const Reviews = () => {
  // States for translation
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [reviews, setReviews] = useState(reviewsData);

  useEffect(() => {
    const translateContent = async () => {
      try {
        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();

        if (!detectData.success) return;

        const { languageCode } = detectData;
        console.log("Detected language:", languageCode);

        if (languageCode === "en") return;

        // 1. Extract static USP texts and headings
        const textKeys = Object.keys(DEFAULT_CONTENT);
        const textValues = Object.values(DEFAULT_CONTENT);

        // 2. Extract review texts
        const reviewTexts = reviewsData.map((r) => r.text);

        // 3. Combine everything for a SINGLE API call
        const allTextsToTranslate = [...textValues, ...reviewTexts];

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

        // 4. Split translations back to USP content and review text
        const translatedTextValues = translations.slice(0, textValues.length);
        const translatedReviewTexts = translations.slice(textValues.length);

        // Update static UI content
        const translatedContent = {};
        textKeys.forEach((key, index) => {
          translatedContent[key] = translatedTextValues[index] || DEFAULT_CONTENT[key];
        });
        setContent(translatedContent);

        // Update reviews array state with translated review texts
        const translatedReviews = reviewsData.map((review, index) => ({
          ...review,
          text: translatedReviewTexts[index] || review.text,
        }));
        setReviews(translatedReviews);

      } catch (error) {
        console.error("Translation Error:", error);
      }
    };

    translateContent();
  }, []);

  return (
    <section className="reviews-section">
      {/* Features Bar */}
      <div className="features-container">
        <div className="feature-item">
          <img src="/FLASH_SALE_USP_BANNER_ICONS-12.svg" alt="" />
          <p>{content.usp1}</p>
        </div>

        <div className="feature-item">
          <img src="/FLASH_SALE_USP_BANNER_ICONS-13.svg" alt="" />
          <p>{content.usp2}</p>
        </div>

        <div className="feature-item">
          <img src="/FLASH_SALE_USP_BANNER_ICONS-14.svg" alt="" />
          <p>{content.usp3}</p>
        </div>
      </div>

      <h2 className="reviews-heading">{content.heading}</h2>

      <div className="slider-container-wrapper">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={32}
          slidesPerView={1}
          loop={true}
          speed={600}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          navigation={{
            nextEl: ".custom-next",
            prevEl: ".custom-prev",
          }}
          pagination={{
            el: ".custom-pagination",
            clickable: true,
          }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
          className="reviews-swiper"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id}>
              <div className="review-card">
                {/* Image Section */}
                <div className="review-image-wrapper">
                  <img src={review.image} alt={review.name} />
                </div>

                {/* Content Section */}
                <div className="review-body">
                  <p className="review-text">{review.text}</p>
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#edb852"
                        stroke="#edb852"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <h4 className="reviewer-name">{review.name}</h4>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="slider-arrow custom-prev">&#10094;</button>
        <button className="slider-arrow custom-next">&#10095;</button>
      </div>

      <div className="custom-pagination"></div>
    </section>
  );
};

export default Reviews;