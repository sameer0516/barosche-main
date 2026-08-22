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

const CURRENCY_MAP = {
  US: { code: "USD", symbol: "$", rate: 1.14 },
  GB: { code: "GBP", symbol: "£", rate: 0.86 },
  IN: { code: "INR", symbol: "₹", rate: 108.91 },
  AE: { code: "AED", symbol: "AED", rate: 4.20 },
  AU: { code: "AUD", symbol: "A$", rate: 1.66 },
  CA: { code: "CAD", symbol: "C$", rate: 1.62 },
  SG: { code: "SGD", symbol: "S$", rate: 1.48 },
  JP: { code: "JPY", symbol: "¥", rate: 184.6 },
  CH: { code: "CHF", symbol: "CHF", rate: 0.93 },
  default: { code: "EUR", symbol: "€", rate: 1 },
};

const FREE_SHIPPING_EUR = 200;

function formatPrice(eurPrice, currency) {
  if (!eurPrice && eurPrice !== 0) return null;
  const converted = Math.round(Number(eurPrice) * currency.rate);
  if (currency.code === "JPY") return `${currency.symbol}${converted.toLocaleString()}`;
  if (currency.code === "INR") return `${currency.symbol}${converted.toLocaleString("en-IN")}`;
  return `${currency.symbol}${converted.toLocaleString()}`;
}

const DEFAULT_CONTENT = {
  usp1: "365-Day Warranty",
  usp2: "Complimentary Shipping on Orders Above",
  usp3: "30-Day Free Returns & Exchanges",
  heading: "What Our Customers Say About Us",
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

  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [reviews, setReviews] = useState(reviewsData);

  const [currency, setCurrency] = useState(CURRENCY_MAP.default);

  useEffect(() => {
    const translateContent = async () => {
      try {
        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();

        if (!detectData.success) return;

        const { languageCode, countryCode } = detectData;
        console.log("Detected language:", languageCode, "Country:", countryCode);

        if (countryCode && CURRENCY_MAP[countryCode]) {
          setCurrency(CURRENCY_MAP[countryCode]);
        } else {
          setCurrency(CURRENCY_MAP.default);
        }

        if (languageCode === "en") return;

        const textKeys = Object.keys(DEFAULT_CONTENT);
        const textValues = Object.values(DEFAULT_CONTENT);

        const reviewTexts = reviewsData.map((r) => r.text);

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

        const translatedTextValues = translations.slice(0, textValues.length);
        const translatedReviewTexts = translations.slice(textValues.length);

        // Update static UI content
        const translatedContent = {};
        textKeys.forEach((key, index) => {
          translatedContent[key] = translatedTextValues[index] || DEFAULT_CONTENT[key];
        });
        setContent(translatedContent);

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
          <img src="/FLASH_SALE_USP_BANNER_ICONS-12.svg" alt="365-Day Warranty icon" width={40} height={40} />
          <p>{content.usp1}</p>
        </div>

        <div className="feature-item">
          <img src="/FLASH_SALE_USP_BANNER_ICONS-13.svg" alt="Free shipping icon" width={40} height={40} />

          <p>
            {content.usp2} {formatPrice(FREE_SHIPPING_EUR, currency)}
          </p>
        </div>

        <div className="feature-item">
          <img src="/FLASH_SALE_USP_BANNER_ICONS-14.svg" alt="Free returns icon" width={40} height={40} />
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
                  <img src={review.image} alt={review.name} width={80} height={80} />
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
                  <p className="reviewer-name">{review.name}</p>
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