"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./Guide.css";
import Image from "next/image";
import Link from "next/link";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function resolveImage(img) {
  if (!img) return "/placeholder.png";
  return img.startsWith("http") ? img : `${BACKEND_URL}${img}`;
}

function normalizeCategory(cat) {
  return (cat || "Blog").toString().trim().toLowerCase();
}

const DEFAULT_UI_TEXTS = {
  mainHeader: "Jewellery Guides & How-Tos for Everyday Elegance",
  loadingText: "Loading guides...",
  emptyText: "No guides published yet.",
  byText: "By",
  readMore: "Read More"
};

export default function GuidePage() {
  const [blogs, setBlogs] = useState([]);
  const [uiTexts, setUiTexts] = useState(DEFAULT_UI_TEXTS);
  const [translationStatus, setTranslationStatus] = useState("loading");

  const fetchAndTranslateBlogs = useCallback(async () => {
    try {
      setTranslationStatus("loading");

      let fetchedBlogs = [];
      try {
        const res = await fetch(`${BACKEND_URL}/api/blogs`, { cache: "no-store" });
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        fetchedBlogs = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Blog fetch error:", err);
        fetchedBlogs = [];
      }

      fetchedBlogs = fetchedBlogs.filter(
        (blog) => normalizeCategory(blog.category) === "guides"
      );

      if (fetchedBlogs.length === 0) {
        setBlogs([]);
        setTranslationStatus("done");
        return;
      }

      const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
      const detectData = await detectRes.json();

      if (!detectData.success) throw new Error("Language detection failed");

      const { languageCode } = detectData;

      if (languageCode === "en") {
        setBlogs(fetchedBlogs);
        setTranslationStatus("done");
        return;
      }

      const flatTexts = [
        DEFAULT_UI_TEXTS.mainHeader,
        DEFAULT_UI_TEXTS.loadingText,
        DEFAULT_UI_TEXTS.emptyText,
        DEFAULT_UI_TEXTS.byText,
        DEFAULT_UI_TEXTS.readMore
      ];

      fetchedBlogs.forEach(blog => {
        flatTexts.push(blog.title || "");
        flatTexts.push(blog.metaDescription || blog.description || "");
      });

      const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: flatTexts,
          targetLanguage: languageCode,
          sourceLanguage: "en",
        }),
      });

      const translateData = await translateRes.json();
      if (!translateData.success) throw new Error("Translation failed");

      const translations = translateData.translations;
      let i = 0;

      setUiTexts({
        mainHeader: translations[i++],
        loadingText: translations[i++],
        emptyText: translations[i++],
        byText: translations[i++],
        readMore: translations[i++]
      });

      const translatedBlogs = fetchedBlogs.map(blog => ({
        ...blog,
        title: translations[i++],
        description: translations[i++]
      }));

      setBlogs(translatedBlogs);
      setTranslationStatus("done");

    } catch (err) {
      console.error("Guide page error:", err);
      setBlogs([]);
      setTranslationStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchAndTranslateBlogs();
  }, [fetchAndTranslateBlogs]);

  if (translationStatus === "loading") {
    return (
      <div className="blog-container">
        <div className="translation-loading-bar" aria-hidden="true" />
        <h1 className="blog-main-title">Guides</h1>
        <div className="blog-loading">
          <div className="loading-spinner"></div>
          <p>{uiTexts.loadingText}</p>
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="blog-container">
        <h1 className="blog-main-title">Guides</h1>
        <div className="blog-empty">{uiTexts.emptyText}</div>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <h1 className="blog-main-title">{uiTexts.mainHeader}</h1>

      <div className="blog-list">
        {blogs.map((blog, index) => {
          const blogLink = `/blogs/${blog.urlHandle || blog.slug || blog._id}`;

          return (
            <div className="blog-card" key={blog._id}>
              <div className="blog-image-wrapper">
                <Link href={blogLink} className="blog-image-link">
                  <Image
                    src={resolveImage(blog.image)}
                    alt={blog.altTag || blog.title}
                    width={1200}
                    height={600}
                    className="blog-image"
                    unoptimized
                    priority={index === 0}
                  />
                </Link>

                <Link href={blogLink} className="blog-badge">
                  Guide
                </Link>
              </div>

              <div className="blog-content">
                <h2 className="blog-title">
                  <Link href={blogLink} style={{ textDecoration: "none", color: "inherit" }}>
                    {blog.title}
                  </Link>
                </h2>

                <p className="blog-description">
                  {blog.metaDescription || blog.description}
                </p>

                <div className="blog-meta">
                  <span className="blog-author">
                    {uiTexts.byText} {blog.author || "Barosche"}
                  </span>
                  <span className="blog-date">{formatDate(blog.createdAt)}</span>
                </div>

                <Link href={blogLink}>
                  <button className="blog-readmore-btn">
                    {uiTexts.readMore}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}