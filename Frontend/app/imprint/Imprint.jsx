"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./Imprint.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";


const DEFAULT_CONTENT = {
  title: "Imprint & Legal Information",
  labels: {
    email: "Email:",
    mobile: "Mobile:",
    legalName: "Full Legal Name:",
    address: "Full Address:",
    representedBy: "Represented by:",
  },
};

const flattenContent = (content) => [
  content.title,
  content.labels.email,
  content.labels.mobile,
  content.labels.legalName,
  content.labels.address,
  content.labels.representedBy,
];

const rebuildContent = (translations) => {
  let i = 0;
  return {
    title: translations[i++],
    labels: {
      email: translations[i++],
      mobile: translations[i++],
      legalName: translations[i++],
      address: translations[i++],
      representedBy: translations[i++],
    },
  };
};

export default function Imprint() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [translationStatus, setTranslationStatus] = useState("idle");

  const translateContent = useCallback(async () => {
    try {
      setTranslationStatus("loading");

      const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
      const detectData = await detectRes.json();

      if (!detectData.success) throw new Error("Language detection failed");

      const { languageCode } = detectData;

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
    <>
      {translationStatus === "loading" && (
        <div className="translation-loading-bar" aria-hidden="true" />
      )}
      <div className="Imprint">
        <div className="Imprint-container">
          <div className="row">
            <div className="col-12">
              <div className="Imprint-title">{content.title}</div>
              <div className="Imprint-des">
                <div className="Imprint-input">
                  <span>{content.labels.email}</span> info@barosche.com
                </div>
                <div className="Imprint-input">
                  <span>{content.labels.mobile}</span> +49 1628806158
                </div>
                <div className="Imprint-input">
                  <span>{content.labels.legalName}</span> Barosche GbR
                </div>
                <div className="Imprint-input">
                  <span>{content.labels.address}</span> Herrlichkeit 11, Syke, 28857 Germany
                </div>
              </div>

              <div className="Imprint-des">
                <div className="Imprint-input ">
                  <span>{content.labels.representedBy}</span> Babar Khan & Roshan Kumar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}