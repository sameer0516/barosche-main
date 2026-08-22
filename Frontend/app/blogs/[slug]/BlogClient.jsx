"use client";
import React, { useState, useEffect, useRef } from "react";
import "./blog-detail.css";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  
function stripUnderlineTags(text) {
  if (!text) return "";
  return text.replace(/<\/?u[^>]*>/gi, "");
}

const DEFAULT_UI_TEXTS = {
  byText: "By",
  backText: "← Back to Blogs",
};

// 🆕 FIX: ReactMarkdown ke liye custom img renderer.
// Markdown se aane wale images ka original size pata nahi hota, isliye
// ek fixed width/height attribute de rahe hain (CLS calculation ke liye)
// aur CSS se ise responsive bana rahe hain (width: 100%, height: auto).
function MarkdownImage({ src, alt, ...props }) {
  const resolvedSrc = src && !src.startsWith("http") ? `${BACKEND_URL}${src}` : src;
  return (
    <img
      src={resolvedSrc}
      alt={alt || ""}
      width={800}
      height={450}
      loading="lazy"
      className="blog-body-img"
      {...props}
    />
  );
}

export default function BlogClient({ initialBlog = null, slug = null }) {
  const [rawBlog, setRawBlog] = useState(initialBlog);
  const [content, setContent] = useState(initialBlog);
  const [uiTexts, setUiTexts] = useState(DEFAULT_UI_TEXTS);
  const [status, setStatus] = useState(initialBlog ? "translating" : "fetching");

  const skippedInitialFetch = useRef(false);

  useEffect(() => {
    async function fetchFallback() {
      if (initialBlog || !slug || slug === "placeholder") {
        return;
      }
      try {
        const res = await fetch(`${BACKEND_URL}/api/blogs/${slug}`);
        if (!res.ok) throw new Error("Blog not found");
        const data = await res.json();
        setRawBlog(data);
        setStatus("translating");
      } catch (err) {
        console.error("Blog client fallback fetch error:", err);
        setStatus("notfound");
      }
    }
    fetchFallback();
  }, [slug, initialBlog]);

  // STEP 2: Translation
  useEffect(() => {
    async function translateBlog() {
      if (!rawBlog) return;

      try {
        skippedInitialFetch.current = true;
        setStatus("translating");

        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();

        if (!detectData.success) throw new Error("Language detection failed");

        const { languageCode } = detectData;

        if (languageCode === "en") {
          setContent(rawBlog);
          setStatus("done");
          return;
        }

        const flatTexts = [
          DEFAULT_UI_TEXTS.byText,
          DEFAULT_UI_TEXTS.backText,
          rawBlog.title || "",
          rawBlog.metaDescription || rawBlog.description || "",
          rawBlog.content || rawBlog.body || "",
        ];

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

        const t = translateData.translations;

        setUiTexts({
          byText: t[0],
          backText: t[1],
        });

        setContent({
          ...rawBlog,
          title: t[2],
          description: t[3],
          content: t[4],
        });

        setStatus("done");
      } catch (err) {
        console.error("Blog detail translation error:", err);
        setContent(rawBlog);
        setStatus("done");
      }
    }

    translateBlog();
  }, [rawBlog]);

  if (status === "fetching") {
    return (
      <div className="blog-detail-container">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <div className="blog-detail-container">
        <p className="error-text">Blog not found.</p>
      </div>
    );
  }

  const activeContent = content || rawBlog || initialBlog;

  if (!activeContent) {
    return (
      <div className="blog-detail-container">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  const cleanedBody = stripUnderlineTags(
    activeContent.content || activeContent.body || activeContent.description || ""
  );

  return (
    <div className="blog-detail-container">
      {activeContent.script && (
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: activeContent.script }}
        />
      )}

      <Link href="/blogs" className="blog-back-btn">
        {uiTexts.backText}
      </Link>

      <h1 className="blog-title">{activeContent.title}</h1>

      <div className="blog-meta">
        <span>{uiTexts.byText} {activeContent.author || "Barosche"}</span>
        {"  •  "}
        <span>{formatDate(activeContent.createdAt)}</span>
      </div>

      <div className="blog-cover-wrapper">
        <Image
          src={resolveImage(activeContent.image)}
          alt={activeContent.altTag || activeContent.title}
          fill
          className="blog-cover-image"
          unoptimized
          priority
        />
      </div>

      <div className="blog-detail-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{ img: MarkdownImage }}
        >
          {cleanedBody}
        </ReactMarkdown>
      </div>
    </div>
  );
}