"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import "./admin-blog.css";

const MDXEditorComponent = dynamic(
  () => import("../../components/Toolbar/MDXEditorComponent"),
  { ssr: false }
);

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Barosché");
  const [image, setImage] = useState(null);
  const [content, setContent] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [seoOpen, setSeoOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [urlHandle, setUrlHandle] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(Array.isArray(data) ? data : []);
        setLoadingBlogs(false);
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setBlogs([]);
        setLoadingBlogs(false);
      });
  }, []);

  useEffect(() => {
    if (title) {
      const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setUrlHandle(slug);
      if (!pageTitle) setPageTitle(title);
    }
  }, [title]);

  const fetchBlogs = () => {
    fetch("http://localhost:5000/api/blogs")
      .then((res) => res.json())
      .then((data) => setBlogs(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Error fetching blogs:", error));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !image) {
      alert("Please fill all fields before publishing!");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("content", content);
    formData.append("image", image);
    formData.append("pageTitle", pageTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("urlHandle", urlHandle);
    try {
      const response = await fetch("http://localhost:5000/api/blogs", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        alert("Blog Published Successfully! 🎉");
        setTitle("");
        setContent("");
        setImage(null);
        setPageTitle("");
        setMetaDescription("");
        setUrlHandle("");
        setSeoOpen(false);
        fetchBlogs();
      } else {
        alert("Failed to publish: " + data.message);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Server error, make sure Node backend is running!");
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${slug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Blog deleted!");
        fetchBlogs();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="admin-layout">

        {/* LEFT: New Blog Form */}
        <div className="admin-card">
          <div className="admin-header">
            <h2>New Blog Article</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-input-group">
              <label>Blog Title</label>
              <input
                className="admin-input-field"
                type="text"
                placeholder="e.g. How to Choose Gemstone Jewellery"
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
              <input
                className="admin-input-field"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />
            </div>

            <div className="admin-input-group">
              <label>Article Content</label>
              <div className="admin-editor-box">
                <MDXEditorComponent onChange={setContent} />
              </div>
            </div>

            {/* SEO DROPDOWN SECTION */}
            <div className="admin-seo-section">
              <button
                type="button"
                className="admin-seo-toggle"
                onClick={() => setSeoOpen(!seoOpen)}
              >
                <div className="admin-seo-toggle-left">
                  <span className="admin-seo-title">Search engine listing</span>
                  <span className="admin-seo-subtitle">
                    Add a title and description to see how this blog post might appear in a search engine listing
                  </span>
                </div>
                <span className="admin-seo-arrow">{seoOpen ? "▲" : "▼"}</span>
              </button>

              {seoOpen && (
                <div className="admin-seo-content">
                  <div className="admin-seo-group">
                    <label>Page title</label>
                    <input
                      className="admin-seo-input"
                      type="text"
                      maxLength={70}
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                    />
                    <span className="admin-seo-char-count">{pageTitle.length} of 70 characters used</span>
                  </div>

                  <div className="admin-seo-group">
                    <label>Meta description</label>
                    <textarea
                      className="admin-seo-textarea"
                      maxLength={160}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                    />
                    <span className="admin-seo-char-count">{metaDescription.length} of 160 characters used</span>
                  </div>

                  <div className="admin-seo-group">
                    <label>URL handle</label>
                    <input
                      className="admin-seo-input"
                      type="text"
                      value={`blogs/${urlHandle}`}
                      onChange={(e) => {
                        const val = e.target.value.replace("blogs/", "");
                        setUrlHandle(val);
                      }}
                      placeholder="blogs/url-handle"
                    />
                    <small className="admin-seo-url-preview">
                      https://barosche.com/blogs/{urlHandle || "url-handle"}
                    </small>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="admin-submit-btn">
              Publish Blog
            </button>
          </form>
        </div>

        {/* RIGHT: Published Blogs */}
        <div className="admin-card admin-blog-list-card">
          <div className="admin-header">
            <h2>Published Blogs</h2>
            <span className="admin-blog-count">{blogs.length}</span>
          </div>

          {loadingBlogs ? (
            <p className="admin-empty">Loading...</p>
          ) : blogs.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon"></div>
              <p>No blogs published yet.</p>
            </div>
          ) : (
            <div className="admin-blog-list">
              {blogs.map((blog) => (
                <div key={blog._id} className="admin-blog-item">
                  <div className="admin-blog-info">
                    <h3>{blog.title}</h3>
                    <p>By {blog.author} · {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}</p>
                  </div>
                  <div className="admin-blog-actions">
                    <Link href={`/admin-blog/${blog.slug}`} className="admin-edit-btn">
                      Edit
                    </Link>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDelete(blog.slug)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}