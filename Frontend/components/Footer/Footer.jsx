"use client";

import React, { useState, useEffect } from "react";
import "./Footer.css";
import { FaApple } from "react-icons/fa";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  subscribeTitle: "Subscribe to BAROSCHE",
  subscribeDesc:
    "Discover our latest collections, exclusive launches, and timeless jewellery stories from the House of BAROSCHE.",
  emailPlaceholder: "Enter your email address",
  subscribeBtn: "Subscribe",
  subscribeBtnLoading: "Subscribing...",
  emptyEmailMsg: "Please enter your email",
  successMsg: "Subscribed successfully!",
  errorMsg: "Something went wrong",
  networkErrorMsg: "Network error, please try again",

  col1Heading: "About",
  col1Links: [
    "About US",
    "Jewellery",
    "Our Services",
    "Size Guide",
    "Guides",
    "Blogs",
    "FAQs",
  ],

  col2Heading: "Browse",
  col2Links: [
    "Rings",
    "Earrings",
    "Pendants",
    "Bracelets",
    "For Today",
    "Chosen",
    "Shop",
  ],

  col3Heading: "Help & Info",
  col3Links: [
    "Imprint",
    "Contact-us",
    "Shipping Information",
    "Return & Cancellation Policy",
    "Sourcing & Manufacturing",
    "Privacy policy",
    "Terms of Service",
  ],

  copyright: "Copyright © 2026 Barosche. All Rights Reserved.",
};

const col1Hrefs = [
  "/about",
  "/product-category/jewellery",
  "/our-services",
  "/size-guide",
  "/blogs",
  "/blogs",
  "/frequently-asked-questions",
];

const col2Hrefs = [
  "/product-category/rings",
  "/product-category/earrings",
  "/product-category/pendants",
  "/product-category/bracelets",
  "/product-category/for-today-jewellery",
  "/product-category/chosen-jewellery",
  "/shop",
];

const col3Hrefs = [
  "/imprint",
  "/contact-us",
  "/shipping",
  "/return-cancellation-policy",
  "/sourcing-manufacturing",
  "/privacy-policy",
  "/terms-of-service",
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "", success: null });
  const [content, setContent] = useState(DEFAULT_CONTENT);

  // ── Translation ─────────────────────────────────────────────────────────
  useEffect(() => {
    const translateContent = async () => {
      try {
        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();
        if (!detectData.success) return;

        const { languageCode } = detectData;
        if (languageCode === "en") return;

        // Saare simple (string) keys aur array keys ko alag karo
        const textKeys = Object.keys(DEFAULT_CONTENT).filter(
          (key) => typeof DEFAULT_CONTENT[key] === "string"
        );
        const textValues = textKeys.map((key) => DEFAULT_CONTENT[key]);

        const arrayKeys = Object.keys(DEFAULT_CONTENT).filter((key) =>
          Array.isArray(DEFAULT_CONTENT[key])
        );
        const arrayValues = arrayKeys.flatMap((key) => DEFAULT_CONTENT[key]);

        const allTexts = [...textValues, ...arrayValues];

        const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            texts: allTexts,
            targetLanguage: languageCode,
            sourceLanguage: "en",
          }),
        });

        const translateData = await translateRes.json();
        if (!translateData.success) return;

        const translations = translateData.translations;

        const translatedContent = {};

        // Simple string keys map back
        textKeys.forEach((key, i) => {
          translatedContent[key] = translations[i] || DEFAULT_CONTENT[key];
        });

        // Array keys map back, preserving each array's own length/order
        let cursor = textKeys.length;
        arrayKeys.forEach((key) => {
          const len = DEFAULT_CONTENT[key].length;
          translatedContent[key] = translations
            .slice(cursor, cursor + len)
            .map((t, i) => t || DEFAULT_CONTENT[key][i]);
          cursor += len;
        });

        setContent(translatedContent);
      } catch (error) {
        console.error("Translation Error:", error);
      }
    };

    translateContent();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatus({ loading: false, message: content.emptyEmailMsg, success: false });
      return;
    }

    setStatus({ loading: true, message: "", success: null });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ loading: false, message: content.successMsg, success: true });
        setEmail("");
      } else {
        setStatus({ loading: false, message: data.message || content.errorMsg, success: false });
      }
    } catch (err) {
      setStatus({ loading: false, message: content.networkErrorMsg, success: false });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <h2>{content.subscribeTitle}</h2>
        <p>{content.subscribeDesc}</p>

        {/* Subscribe Input Section */}
        <form className="subscribe-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            className="subscribe-input"
            placeholder={content.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status.loading}
          />
          <button type="submit" className="subscribe-btn" disabled={status.loading}>
            {status.loading ? content.subscribeBtnLoading : content.subscribeBtn}
          </button>
        </form>

        {status.message && (
          <p className={`subscribe-status ${status.success ? "success" : "error"}`}>
            {status.message}
          </p>
        )}
      </div>

      {/* Main Footer Links Section */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-links-grid">
            {/* Column 1 */}
            <div className="footer-column">
              <h3>{content.col1Heading}</h3>
              <ul>
                {content.col1Links.map((label, i) => (
                  <li key={i}>
                    <a href={col1Hrefs[i]}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 */}
            <div className="footer-column">
              <h3>{content.col2Heading}</h3>
              <ul>
                {content.col2Links.map((label, i) => (
                  <li key={i}>
                    <a href={col2Hrefs[i]}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 */}
            <div className="footer-column">
              <h3>{content.col3Heading}</h3>
              <ul>
                {content.col3Links.map((label, i) => (
                  <li key={i}>
                    <a href={col3Hrefs[i]}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-extras">
            {/* Social Icons */}
            <div className="footer-socials">
              <a href="https://www.instagram.com/baroscheofficial/" aria-label="Instagram">
                <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="https://in.pinterest.com/barosche/" aria-label="Pinterest">
                <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.182 0 7.435 2.979 7.435 6.953 0 4.156-2.618 7.502-6.257 7.502-1.22 0-2.368-.633-2.759-1.382l-.751 2.859c-.272 1.033-1.008 2.327-1.503 3.118 1.164.358 2.4.551 3.682.551 6.621 0 11.988-5.368 11.988-11.988C24.013 5.367 18.638 0 12.017 0z" />
                </svg>
              </a>
              <a href="https://whatsapp.com/channel/0029Vb7sZvo3GJOqkz4lC53I" aria-label="WhatsApp">
                <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
            </div>

            {/* Payment Badges */}
            <div className="footer-payments">
              <div className="pay-badge badge-paypal">PayPal</div>
              <div className="pay-badge badge-klarna">Klarna.</div>
              <div className="pay-badge badge-visa">VISA</div>
              <div className="pay-badge badge-mastercard">
                <div className="mc-red"></div>
                <div className="mc-orange"></div>
              </div>
              <div className="pay-badge badge-apple">
                <FaApple />
                <span>Pay</span>
              </div>
            </div>
          </div>

          <div className="footer-copyright">{content.copyright}</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;