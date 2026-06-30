// app/blog/[slug]/BlogClient.jsx
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import "../blog.css";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderBlock(block, idx) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={idx} className="blog-body-paragraph">
          {block.text}
        </p>
      );

    case "h2":
      return (
        <h2 key={idx} className="blog-body-h2">
          {block.text}
        </h2>
      );

    case "h3":
      return (
        <h3 key={idx} className="blog-body-h3">
          {block.text}
        </h3>
      );

    case "list":
      return (
        <ul key={idx} className="blog-body-list">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case "checklist":
      return (
        <ul key={idx} className="blog-body-checklist">
          {block.items.map((item, i) => (
            <li key={i}>
              <span className="checklist-icon">✓</span>
              <span>
                <strong>{item.title}:</strong> {item.desc}
              </span>
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div key={idx} className="blog-table-wrapper">
          {block.caption && (
            <p className="blog-table-caption">{block.caption}</p>
          )}
          <table className="blog-table">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "cta":
      return (
        <div key={idx} className="blog-cta-block">
          <p>{block.text}</p>
          <Link href={block.linkHref} className="blog-cta-link">
            {block.linkText} →
          </Link>
        </div>
      );

    case "readmore":
      return (
        <p key={idx} className="blog-readmore-inline">
          {block.text}{" "}
          <Link href={block.linkHref} className="blog-inline-link">
            {block.linkText}
          </Link>
        </p>
      );

    case "faq":
      return (
        <div key={idx} className="blog-faq-list">
          {block.items.map((item, i) => (
            <div key={i} className="blog-faq-item">
              <p className="blog-faq-q">
                {i + 1}. {item.q}
              </p>
              <p className="blog-faq-a">{item.a}</p>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

export default function BlogClient({ blog }) {
  return (
    <div className="blog-detail-container">
      {/* Back Button */}
      <Link href="/blog" className="blog-back-btn">
        ← Back to Blog
      </Link>

      <article className="blog-article">
        {/* Hero Image */}
        <div className="blog-detail-image-wrapper">
          <Image
            src={blog.image || "/placeholder.png"}
            alt={blog.altTag || blog.title}
            width={1200}
            height={600}
            className="blog-detail-image"
            priority
          />
        </div>

        {/* Badge + Date */}
        <div className="blog-detail-meta">
          <span className="blog-badge-detail">Blog</span>
          <span className="blog-detail-date">{formatDate(blog.createdAt)}</span>
        </div>

        {/* H1 Title */}
        <h1 className="blog-detail-title">{blog.title}</h1>

        {/* Author */}
        <p className="blog-detail-author">By {blog.author || "Barosche"}</p>

        {/* All Content Blocks */}
        <div className="blog-detail-body">
          {blog.content.map((block, idx) => renderBlock(block, idx))}
        </div>
      </article>
    </div>
  );
}