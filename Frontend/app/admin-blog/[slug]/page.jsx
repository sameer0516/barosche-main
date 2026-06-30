"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import "../admin-blog.css";

const MDXEditorComponent = dynamic(
  () => import("../../../components/Toolbar/MDXEditorComponent"),
  { ssr: false }
);

// HTML ko markdown mein convert karne ka simple helper
function htmlToMarkdown(html) {
  if (!html) return "";
  // Agar already markdown hai (# se shuru ho) to waise hi return karo
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

export default function EditBlogPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (!slug) return;

    fetch(`http://localhost:5000/api/blogs/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setAuthor(data.author);
        // HTML ko markdown mein convert karo editor ke liye
        const markdownContent = htmlToMarkdown(data.content);
        setContent(markdownContent);
        setExistingImage(data.image);
        setEditorKey((prev) => prev + 1);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching blog:", error);
        setLoading(false);
      });
  }, [slug]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      alert("Title and Content required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${slug}`, {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        alert("Blog Updated Successfully! ✅");
        router.push("/admin-blog"); // ← updated path
      } else {
        alert("Failed to update: " + data.message);
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("Server error!");
    }
  };

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center" }}>Loading Blog...</div>
  );

  return (
    <div className="admin-page-wrapper">
      <div className="admin-card">
        <div className="admin-header">
          <h2>✏️ Edit Blog Article</h2>
          <button
            onClick={() => router.push("/admin-blog")}
            className="admin-back-btn"
          >
            ← Back
          </button>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="admin-input-group">
            <label>Blog Title</label>
            <input
              className="admin-input-field"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="admin-input-group">
            <label>Author</label>
            <input
              className="admin-input-field"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="admin-input-group">
            <label>Blog Cover Image</label>
            {existingImage && (
              <div className="admin-existing-image">
                <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "8px" }}>
                  Current Image:
                </p>
                <div style={{ position: "relative", height: "120px", width: "200px" }}>
                  <Image
                    src={`http://localhost:5000${existingImage}`}
                    alt="Current cover"
                    fill
                    style={{ borderRadius: "6px", objectFit: "cover" }}
                    unoptimized
                  />
                </div>
              </div>
            )}
            <input
              className="admin-input-field"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <p style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "4px" }}>
              Nayi image choose karo, warna purani rahegi
            </p>
          </div>

          <div className="admin-input-group">
            <label>Article Content</label>
            <div className="admin-editor-box">
              {!loading && (
                <MDXEditorComponent
                  key={editorKey}
                  initialContent={content}
                  onChange={setContent}
                />
              )}
            </div>
          </div>

          <button type="submit" className="admin-submit-btn">
            Update Blog ✅
          </button>
        </form>
      </div>
    </div>
  );
}