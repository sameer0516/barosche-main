"use client";
import React, { useState, useEffect, useRef } from "react";
import "./blog-detail.css";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://barosche.com";

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

// Placeholder shell page kisi bhi /blogs/<slug> ke liye serve ho sakta hai
// (jab wo slug build time pe exist nahi karta tha). Isliye real slug hamesha
// browser URL se padho, prop se nahi (prop "placeholder" ho sakta hai).
function getSlugFromURL() {
  if (typeof window === "undefined") return null;
  const parts = window.location.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("blogs");
  if (idx !== -1 && parts[idx + 1]) {
    return decodeURIComponent(parts[idx + 1]);
  }
  return null;
}

// Placeholder page ka baked-in canonical hamesha "/blogs/placeholder/" hota
// hai (build time metadata se). Chunki asli slug wale blogs static export me
// isi placeholder HTML ke through serve hote hain, humein canonical tag ko
// runtime par real slug ke hisaab se manually fix karna padta hai — warna
// JS-rendering crawlers (Screaming Frog etc.) ko galat canonical milta hai.
function updateCanonicalTag(url) {
  if (typeof document === "undefined" || !url) return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

const DEFAULT_UI_TEXTS = {
  byText: "By",
  backText: "← Back to Blogs",
};

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

  // Hamesha fresh data fetch karo — chahe initialBlog mila ho ya na mila ho.
  // Isse edit turant reflect hota hai, aur naye blog (placeholder shell)
  // bhi apna asli slug URL se padhkar load ho jate hain.
  useEffect(() => {
    async function fetchFresh() {
      const realSlug = getSlugFromURL() || slug;

      // Real slug pata chalte hi canonical tag ko turant fix kar do —
      // chahe fetch fail ho jaaye, canonical galat (placeholder) nahi rehna chahiye.
      if (realSlug && realSlug !== "placeholder") {
        updateCanonicalTag(`${SITE_URL}/blogs/${realSlug}/`);
      }

      if (!realSlug || realSlug === "placeholder") {
        if (!initialBlog) setStatus("notfound");
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/blogs/${realSlug}`);
        if (!res.ok) throw new Error("Blog not found");
        const data = await res.json();
        if (!data || data.message === "Blog not found") {
          if (!initialBlog) setStatus("notfound");
          return;
        }
        setRawBlog(data);
        setStatus("translating");
      } catch (err) {
        console.error("Blog client fetch error:", err);
        if (!initialBlog) setStatus("notfound");
      }
    }
    fetchFresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          width={1200}
          height={500}
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