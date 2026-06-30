"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./About.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
  tabs: {
    about: "About Barosche",
    story: "Our Story",
    mission: "Our Mission",
    connect: "Connect with Us",
  },
  tabData: {
    about: {
      title: "About Us",
      paragraphs: [
        "At Barosché, jewellery is not an accessory. It is a way of being present.",
        "We create fine jewellery for today — not for occasions, not for milestones, and not for someday. Each piece is made to exist within the reality of everyday life: in quiet moments, personal rituals, and the unmarked days that define who we are.",
        "Our approach is simple. Design should feel natural. Craftsmanship should feel certain. Nothing should need an explanation to be worthy of wearing now.",
        "Every Barosché piece is shaped with intention — from gemstone earrings to semi-precious rings and refined, timeless pendants. We work with skilled artisans and trusted partners to ensure each creation holds clarity, balance, and enduring quality.",
        "We do not believe jewellery gains meaning from events. Meaning is already present. Jewellery simply meets it there.",
        "Some pieces are chosen by others. Some are chosen by oneself. Either way, the decision is personal. It does not require permission, timing, or a reason beyond recognition.",
        "For those who seek something more specific, we offer personalised creations — a quieter process of shaping something that already feels like yours. From selecting stones to refining form, the intention remains the same: to create something that belongs immediately.",
        "At its core, Barosché is built on a quiet certainty — that life does not need to be postponed to be meaningful, and that what feels right does not need to wait.",
      ],
    },
    story: {
      title: "Our Story",
      paragraphs: [
        "Barosché began not as a moment, but as a realisation.",
        "For years, we were close to the world of jewellery — its craftsmanship, its traditions, its precision. We saw how every piece was created with care, yet often reserved for occasions that arrived only occasionally.",
        "Over time, something felt incomplete.",
        "Jewellery was being held back for milestones — engagements, anniversaries, celebrations — while everyday life, where most meaning actually exists, was left unacknowledged.",
        "Barosché was created to shift that perspective.",
        "Rooted in a background of traditional craftsmanship, we carry forward the discipline, detail, and understanding that comes from working closely with skilled artisans. But what we create is not bound by tradition alone. It is shaped for the present — for a way of living that does not wait.",
        "Our designs are minimal, intentional, and quietly certain. They are not made to mark events. They are made to exist within life as it is — in ordinary days, personal moments, and the spaces in between.",
        "What began as a small, closely held idea has grown into something shared — not defined by scale, but by alignment. People who understand that meaning is not assigned by occasion, but recognised in the present.",
        "Barosché continues to build from that belief.",
        "Not to redefine jewellery loudly, but to place it where it has always belonged — in today.",
      ],
    },
    mission: {
      title: "Our Mission",
      paragraphs: [
        "Our mission is not to persuade, but to remain clear in what we stand for.",
        "We create fine jewellery that feels right to wear now — shaped with intention, made with care, and designed to exist within everyday life. Quality is not a feature; it is a given. Every piece is held to a standard that does not require explanation.",
        "We choose to work responsibly. Our metals are recycled where possible, and our gemstones are sourced through partners who value transparency, fairness, and long-term impact. Not as a statement, but as a baseline.",
        "We also believe access should not be defined by unnecessary layers. By working directly and intentionally, we remove what does not add value — while preserving what matters: craftsmanship, material integrity, and thoughtful design.",
        "Nothing we create is meant to be saved for later. It is made to belong, immediately.",
        "This is how we approach jewellery. And this is what we continue to refine.",
      ],
    },
    connect: {
      title: "Connect with Us",
      paragraphs: [
        "We are here — without urgency, without insistence.",
        "Whether you are considering a piece, shaping something personal, or simply sharing how it lives with you, the conversation is always open.",
        "Write to us at info@barosche.com.",
        "Follow along at @baroscheofficial.",
        "Or step into our space for a quiet, one-to-one experience.",
        "There is no occasion required.",
      ],
    },
  },
};

const flattenContent = (content) => {
  const flat = [];

  flat.push(content.tabs.about);
  flat.push(content.tabs.story);
  flat.push(content.tabs.mission);
  flat.push(content.tabs.connect);

  ["about", "story", "mission", "connect"].forEach((tab) => {
    flat.push(content.tabData[tab].title);
    content.tabData[tab].paragraphs.forEach((p) => flat.push(p));
  });

  return flat;
};

const rebuildContent = (translations) => {

  let i = 0;
  const get = () => translations[i++];

  const tabs = {
    about: get(),
    story: get(),
    mission: get(),
    connect: get(),
  };

  const tabData = {};
  ["about", "story", "mission", "connect"].forEach((tab) => {
    const title = get();
    const count = DEFAULT_CONTENT.tabData[tab].paragraphs.length;
    const paragraphs = [];
    for (let j = 0; j < count; j++) paragraphs.push(get());
    tabData[tab] = { title, paragraphs };
  });

  return { tabs, tabData };
};

const renderConnectParagraph = (text, index) => {
  if (text.includes("info@barosche.com")) {
    const parts = text.split("info@barosche.com");
    return (
      <p key={index} className="content-text">
        {parts[0]}
        <a href="mailto:info@barosche.com">info@barosche.com</a>
        {parts[1]}
      </p>
    );
  }
  if (text.includes("@baroscheofficial")) {
    const parts = text.split("@baroscheofficial");
    return (
      <p key={index} className="content-text">
        {parts[0]}
        <a
          href="https://www.instagram.com/baroscheofficial/"
          target="_blank"
          rel="noopener noreferrer"
        >
          @baroscheofficial
        </a>
        {parts[1]}
      </p>
    );
  }
  return (
    <p key={index} className="content-text">
      {text}
    </p>
  );
};

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState("about");
  const [content, setContent] = useState(DEFAULT_CONTENT);
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

  const currentTab = content.tabData[activeTab];

  return (
    <div className="about-container">

      {translationStatus === "loading" && (
        <div className="translation-loading-bar" aria-hidden="true" />
      )}

      <nav className="about-tabs-nav">
        <button
          className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          {content.tabs.about}
        </button>
        <button
          className={`tab-btn ${activeTab === "story" ? "active" : ""}`}
          onClick={() => setActiveTab("story")}
        >
          {content.tabs.story}
        </button>
        <button
          className={`tab-btn ${activeTab === "mission" ? "active" : ""}`}
          onClick={() => setActiveTab("mission")}
        >
          {content.tabs.mission}
        </button>
        <button
          className={`tab-btn ${activeTab === "connect" ? "active" : ""}`}
          onClick={() => setActiveTab("connect")}
        >
          {content.tabs.connect}
        </button>
      </nav>

      <main className="about-content-section">
        <h2 className="content-title">{currentTab.title}</h2>
        <div className="content-body">
          {currentTab.paragraphs.map((para, index) =>
            activeTab === "connect"
              ? renderConnectParagraph(para, index)
              : (
                <p key={index} className="content-text">
                  {para}
                </p>
              )
          )}
        </div>
      </main>

    </div>
  );
};

export default AboutPage;