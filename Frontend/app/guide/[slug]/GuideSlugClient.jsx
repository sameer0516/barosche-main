"use client";
import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import GuideClient from "./GuideClient";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

function getSlugFromURL() {
  if (typeof window === "undefined") return null;
  const parts = window.location.pathname.split("/").filter(Boolean);
  const blogsIndex = parts.indexOf("blogs");
  if (blogsIndex !== -1 && parts[blogsIndex + 1]) {
    return decodeURIComponent(parts[blogsIndex + 1]);
  }
  return null;
}

export default function GuideSlugClient() {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const slug = getSlugFromURL();

    if (!slug || slug === "placeholder") {
      setLoading(false);
      setFailed(true);
      return;
    }

    fetch(`${BACKEND_URL}/api/blogs/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Blog not found");
        return res.json();
      })
      .then((data) => {
        setBlog(data);
        setLoading(false);
      })
      .catch(() => {
        setFailed(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (blog) {
      document.title = blog.pageTitle || blog.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", blog.metaDescription || "");
    }
  }, [blog]);

  if (loading) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>Loading Blog...</div>
    );
  }

  if (failed || !blog) {
    return notFound();
  }

  return <GuideClient blog={blog} />;
}