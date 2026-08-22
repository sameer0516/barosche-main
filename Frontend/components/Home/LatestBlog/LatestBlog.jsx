"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import "./LatestBlog.css";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_UI = {
  heading: "The Barosché Edit",
  subheading: "Thoughts, perspectives, and quiet reflections on living and choosing what feels right now.",
  readMore: "READ MORE",
};

function normalizeCategory(cat) {
  return (cat || "Blog").toString().trim().toLowerCase();
}

function getExcerpt(content = "", length = 110) {
  const plain = content
    .replace(/\r\n/g, " ")
    .replace(/#+\s?/g, "")
    .replace(/\*\*/g, "")
    .replace(/\[<u>|<\/u>\]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= length) return plain;
  return plain.slice(0, length).trim() + "...";
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function getBlogUrlKey(blog) {
  return blog?.urlHandle || blog?.slug || "";
}

export default function LatestBlog() {
  const router = useRouter();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uiText, setUiText] = useState(DEFAULT_UI);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/blogs`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          setBlogs([]);
          return;
        }

        const onlyBlogs = data.filter(
          (b) => normalizeCategory(b.category) === "blog"
        );

        const sorted = [...onlyBlogs].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setBlogs(sorted.slice(0, 3));
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    if (blogs.length === 0) return;

    const translateContent = async () => {
      try {
        const detectRes = await fetch(
          `${BACKEND_URL}/api/translate/detect-language`
        );
        const detectData = await detectRes.json();

        if (!detectData.success) return;

        const { languageCode } = detectData;

        if (languageCode === "en") return;

        const blogTitles = blogs.map((b) => b.title);
        const textsToTranslate = [
          DEFAULT_UI.heading,
          DEFAULT_UI.subheading,
          DEFAULT_UI.readMore,
          ...blogTitles,
        ];

        const translateRes = await fetch(
          `${BACKEND_URL}/api/translate/translate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              texts: textsToTranslate,
              targetLanguage: languageCode,
              sourceLanguage: "en",
            }),
          }
        );

        const translateData = await translateRes.json();

        if (!translateData.success) return;

        const [heading, subheading, readMore, ...translatedTitles] =
          translateData.translations;

        setUiText({ heading, subheading, readMore });

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog, i) => ({
            ...blog,
            translatedTitle: translatedTitles[i] || blog.title,
          }))
        );
      } catch (error) {
        console.error("Translation Error:", error);
      }
    };

    translateContent();
  }, [blogs.length]);

  const handleBlogClick = useCallback(
    (urlKey) => {
      if (!urlKey) return;
      router.push(`/blogs/${urlKey}`);
    },
    [router]
  );

  return (
    <>
     <section className="latest-blog-section">
      <div className="latest-blog-header">
        <h2 className="latest-blog-heading">{uiText.heading}</h2>
        <p className="latest-blog-subheading">{uiText.subheading}</p>
      </div>

      <div className="latest-blog-grid">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div className="blog-card skeleton-card" key={`skeleton-${i}`}>
              <div className="blog-image skeleton-shimmer" />
              <div className="blog-card-body">
                <div className="skeleton-line skeleton-shimmer" style={{ width: "40%" }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: "90%" }} />
                <div className="skeleton-line skeleton-shimmer" style={{ width: "70%" }} />
              </div>
            </div>
          ))}

        {!loading && blogs.length === 0 && (
          <p className="latest-blog-empty">No blogs found.</p>
        )}

        {!loading &&
          blogs.map((blog) => {
            const urlKey = getBlogUrlKey(blog);
            return (
              <div
                className="blog-card"
                key={blog._id}
                role="button"
                tabIndex={0}
                onClick={() => handleBlogClick(urlKey)}
                onKeyDown={(e) => e.key === "Enter" && handleBlogClick(urlKey)}
                style={{ cursor: "pointer" }}
              >
                <div className="blog-image-wrapper">
                  <img
                    src={`${BACKEND_URL}${blog.image}`}
                    alt={blog.altTag || blog.title}
                    className="blog-image"
                    width={400}
                    height={260}
                    loading="lazy"
                  />
                </div>
                <div className="blog-card-body">
                  <span className="blog-date">{formatDate(blog.createdAt)}</span>
                  <h3 className="blog-title">
                    {blog.translatedTitle || blog.title}
                  </h3>
                  <p className="blog-excerpt">{getExcerpt(blog.content)}</p>
                  <span className="blog-readmore">{uiText.readMore} →</span>
                </div>
              </div>
            );
          })}
      </div>
    </section>
    </>
  );
}