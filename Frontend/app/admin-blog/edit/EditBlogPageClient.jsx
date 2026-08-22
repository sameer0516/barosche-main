"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import "../admin-blog.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const MDXEditorComponent = dynamic(
  () => import("../../../components/Toolbar/MDXEditorComponent"),
  { ssr: false }
);

const CATEGORY_OPTIONS = ["Blog", "Guides"];

function htmlToMarkdown(html) {
  if (!html) return "";
  if (html.trim().startsWith("#") || !html.includes("<")) return html;
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, "$1\n")
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, "$1\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function toUrlHandle(str) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function EditBlogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSlug = searchParams.get("slug");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [altTag, setAltTag] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Blog");
  const [loading, setLoading] = useState(true);
  const [editorKey, setEditorKey] = useState(0);
  const [seoOpen, setSeoOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [urlHandle, setUrlHandle] = useState("");
  const [script, setScript] = useState("");

  useEffect(() => {
    if (!currentSlug) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/blogs/${currentSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.message === "Blog not found") {
          alert("Blog nahi mila!");
          router.push("/admin-blog");
          return;
        }
        setTitle(data.title || "");
        setAuthor(data.author || "");
        setContent(htmlToMarkdown(data.content));
        setExistingImage(data.image || "");
        setAltTag(data.altTag || data.title || "");
        setPageTitle(data.pageTitle || data.title || "");
        setMetaDescription(data.metaDescription || "");
        setUrlHandle(data.urlHandle || currentSlug);
        setScript(data.script || "");
        setCategory(CATEGORY_OPTIONS.includes(data.category) ? data.category : "Blog");
        setEditorKey((k) => k + 1);
        setLoading(false);
      })
      .catch(() => { alert("Fetch error!"); setLoading(false); });
  }, [currentSlug]);

  const handleUrlChange = (e) => {
    setUrlHandle(toUrlHandle(e.target.value));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title || !content) { alert("Title and Content required!"); return; }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("author", author);
    fd.append("content", content);
    fd.append("altTag", altTag);
    fd.append("pageTitle", pageTitle);
    fd.append("metaDescription", metaDescription);
    fd.append("urlHandle", urlHandle);
    fd.append("script", script);
    fd.append("category", category);
    if (image) fd.append("image", image);

    try {
      const res  = await fetch(`${API_URL}/api/blogs/${currentSlug}`, { method: "PUT", body: fd });
      const data = await res.json();

      if (data.success) {
        alert("Blog Updated!");
        const newHandle = data.newSlug || urlHandle;
        router.push(newHandle !== currentSlug ? `/admin-blog/edit?slug=${newHandle}` : "/admin-blog");
      } else {
        alert("Update failed: " + data.message);
      }
    } catch {
      alert("Server error!");
    }
  };

  if (!currentSlug) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Invalid page.</p>
        <button onClick={() => router.push("/admin-blog")}>← Back</button>
      </div>
    );
  }

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  return (
    <>
    <style jsx global>{`
      .admin-editor-box {
        position: relative;
      }
      /* @mdxeditor/editor apne toolbar ki class hash karta h (Radix/CSS-modules),
         isliye class name guess karne ke bajaye stable role="toolbar" attribute
         target kiya h - ye kabhi nahi badlega. */
      .admin-editor-box [role="toolbar"] {
        position: sticky !important;
        top: 0;
        z-index: 20;
        background: #1a1a1a;
        border-bottom: 1px solid #333;
      }
    `}</style>

    <div className="admin-page-wrapper">
      <div className="admin-card">
        <div className="admin-header">
          <h2>✏️ Edit Blog Article</h2>
          <button onClick={() => router.push("/admin-blog")} className="admin-back-btn">
            ← Back
          </button>
        </div>

        <form onSubmit={handleUpdate}>

          <div className="admin-input-group">
            <label>Blog Title</label>
            <input className="admin-input-field" type="text" value={title}
              onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="admin-input-group">
            <label>Category</label>
            <select
              className="admin-input-field" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-input-group">
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              URL Handle
              <span style={{ fontSize: "0.7rem", color: "#666" }}>
                (change karo to blog URL bhi badlega)
              </span>
            </label>
            <div style={{ display: "flex" }}>
              <span style={{ padding: "10px 12px", background: "#1a1a1a", border: "1px solid #333",
                borderRight: "none", borderRadius: "6px 0 0 6px", color: "#666",
                fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                blog/
              </span>
              <input className="admin-input-field" type="text" value={urlHandle}
                onChange={handleUrlChange}
                style={{ borderRadius: "0 6px 6px 0", marginBottom: 0 }} />
            </div>
            <small style={{ color: "#666", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
              Live URL:{" "}
              <span style={{ color: "#888" }}>https://barosche.com/blog/{urlHandle}</span>
            </small>
          </div>

          <div className="admin-input-group">
            <label>Author</label>
            <input className="admin-input-field" type="text" value={author}
              onChange={(e) => setAuthor(e.target.value)} />
          </div>

          <div className="admin-input-group">
            <label>Cover Image</label>
            {existingImage && (
              <div className="admin-existing-image" style={{ marginBottom: "10px" }}>
                <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "6px" }}>Current Image:</p>
                <div style={{ position: "relative", height: "120px", width: "200px" }}>
                  <Image
                    src={existingImage.startsWith("http") ? existingImage : `${API_URL}${existingImage}`}
                    alt={altTag || title}
                    fill
                    style={{ borderRadius: "6px", objectFit: "cover" }}
                    unoptimized
                  />
                </div>
              </div>
            )}
            <input className="admin-input-field" type="file" accept="image/*"
              onChange={(e) => setImage(e.target.files[0])} />
            <p style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "4px" }}>
              Select New Image
            </p>
          </div>

          <div className="admin-input-group">
            <label>Image Alt Tag</label>
            <input className="admin-input-field" type="text"
              placeholder=""
              value={altTag} onChange={(e) => setAltTag(e.target.value)} />
          </div>

          <div className="admin-input-group">
            <label>Article Content</label>
            <div
              className="admin-editor-box"
              style={{
                position: "relative",
                resize: "vertical",
                overflow: "auto",
                minHeight: "300px",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
            >
              {!loading && (
                <MDXEditorComponent
                  key={editorKey}
                  initialContent={content}
                  onChange={setContent}
                />
              )}
            </div>
          </div>

          <div className="admin-seo-section">
            <button type="button" className="admin-seo-toggle" onClick={() => setSeoOpen(!seoOpen)}>
              <div className="admin-seo-toggle-left">
                <span className="admin-seo-title">Search engine listing</span>
                <span className="admin-seo-subtitle">Meta title, description aur script</span>
              </div>
              <span className="admin-seo-arrow">{seoOpen ? "▲" : "▼"}</span>
            </button>

            {seoOpen && (
              <div className="admin-seo-content">
                <div className="admin-seo-group">
                  <label>Meta Title</label>
                  <input className="admin-seo-input" type="text"
                    value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
                  <span className="admin-seo-char-count">{pageTitle.length} characters</span>
                </div>
                <div className="admin-seo-group">
                  <label>Meta Description</label>
                  <textarea className="admin-seo-textarea"
                    value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
                  <span className="admin-seo-char-count">{metaDescription.length} characters</span>
                </div>
                <div className="admin-seo-group">
                  <label>Script (JSON-LD / Custom)</label>
                  <textarea className="admin-seo-textarea" value={script}
                    onChange={(e) => setScript(e.target.value)}
                    style={{ minHeight: "120px", fontFamily: "monospace", fontSize: "0.85rem" }} />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="admin-submit-btn">Update Blog</button>
        </form>
      </div>
    </div>
    </>
  );
}