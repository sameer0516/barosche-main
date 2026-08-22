// app/blogs/[slug]/BlogClient.jsx
"use client";
import React, { useState, useEffect } from "react";
import "./guide-detail.css";
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

export default function GuideClient({ blog }) {
  const [content, setContent] = useState(blog);
  const [uiTexts, setUiTexts] = useState(DEFAULT_UI_TEXTS);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function translateBlog() {
      try {
        setStatus("loading");

        if (!blog) {
          setStatus("done");
          return;
        }

        const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();

        if (!detectData.success) throw new Error("Language detection failed");

        const { languageCode } = detectData;

        if (languageCode === "en") {
          setContent(blog);
          setStatus("done");
          return;
        }

        const flatTexts = [
          DEFAULT_UI_TEXTS.byText,
          DEFAULT_UI_TEXTS.backText,
          blog.title || "",
          blog.metaDescription || blog.description || "",
          blog.content || blog.body || "",
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
          ...blog,
          title: t[2],
          description: t[3],
          content: t[4],
        });

        setStatus("done");
      } catch (err) {
        console.error("Blog detail translation error:", err);
        setContent(blog);
        setStatus("done");
      }
    }

    translateBlog();
  }, [blog]);

  if (status === "loading") {
    return (
      <div className="blog-detail-container">
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="blog-detail-container">
        <p className="error-text">Blog not found.</p>
      </div>
    );
  }

  const cleanedBody = stripUnderlineTags(
    content.content || content.body || content.description || ""
  );

  return (
    <div className="blog-detail-container">
      <Link href="/blogs" className="blog-back-btn">
        {uiTexts.backText}
      </Link>

      <h1 className="blog-title">{content.title}</h1>

      <div className="blog-meta">
        <span>{uiTexts.byText} {content.author || "Barosche"}</span>
        {"  •  "}
        <span>{formatDate(content.createdAt)}</span>
      </div>

      <div className="blog-cover-wrapper">
        <Image
          src={resolveImage(content.image)}
          alt={content.altTag || content.title}
          fill
          className="blog-cover-image"
          unoptimized
          priority
        />
      </div>

      <div className="blog-detail-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {cleanedBody}
        </ReactMarkdown>
      </div>
    </div>
  );
}