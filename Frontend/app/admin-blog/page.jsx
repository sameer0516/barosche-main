"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import "./admin-blog.css";

const ADMIN_USERNAME = "barosche";
const ADMIN_PASSWORD = "Barosche@2024";

const MDXEditorComponent = dynamic(
  () => import("../../components/Toolbar/MDXEditorComponent"),
  { ssr: false }
);

function cleanHandle(str) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const CATEGORY_OPTIONS = ["Blog", "Guides"];

export default function AdminPage() {
  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputUsername, setInputUsername] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Blog States
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("Barosché");
  const [image, setImage] = useState(null);
  const [altTag, setAltTag] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Blog");
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [seoOpen, setSeoOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [urlHandle, setUrlHandle] = useState("");
  const [script, setScript] = useState("");
  const [urlHandleTouched, setUrlHandleTouched] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const loggedInStatus = sessionStorage.getItem("admin_authenticated");
    if (loggedInStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetch("https://api.barosche.com/api/blogs")
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
  }, [isAuthenticated]);

  useEffect(() => {
    if (title) {
      if (!urlHandleTouched) {
        setUrlHandle(cleanHandle(title));
      }
      if (!pageTitle) setPageTitle(title);
    }
  }, [title, urlHandleTouched, pageTitle]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputUsername === ADMIN_USERNAME && inputPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid Username or Password!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setInputUsername("");
    setInputPassword("");
  };

  const fetchBlogs = () => {
    fetch("https://api.barosche.com/api/blogs")
      .then((res) => res.json())
      .then((data) => setBlogs(Array.isArray(data) ? data : []))
      .catch((error) => console.error("Error fetching blogs:", error));
  };

  const handleUrlHandleChange = (e) => {
    setUrlHandleTouched(true);
    setUrlHandle(cleanHandle(e.target.value));
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
    formData.append("altTag", altTag);
    formData.append("pageTitle", pageTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("urlHandle", urlHandle);
    formData.append("script", script);
    formData.append("category", category);

    try {
      const response = await fetch("https://api.barosche.com/api/blogs", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        alert("Blog Published Successfully! 🎉");
        setTitle("");
        setContent("");
        setImage(null);
        setAltTag("");
        setPageTitle("");
        setMetaDescription("");
        setUrlHandle("");
        setUrlHandleTouched(false);
        setScript("");
        setCategory("Blog");
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
      const res = await fetch(`https://api.barosche.com/api/blogs/${slug}`, {
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

  if (!isAuthenticated) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h2>Blog Admin</h2>
            <p>Please enter your credentials to access the admin portal.</p>
          </div>

          <form onSubmit={handleLogin} className="admin-login-form">
            {loginError && <div className="admin-login-error">{loginError}</div>}

            <div className="admin-input-group">
              <label>Username</label>
              <input
                type="text"
                className="admin-input-field"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="admin-input-group">
              <label>Password</label>
              <input
                type="password"
                className="admin-input-field"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" className="admin-submit-btn">
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const visibleBlogs =
    categoryFilter === "All"
      ? blogs
      : blogs.filter((blog) => (blog.category || "Blog") === categoryFilter);

  // 🔓 IF AUTHENTICATED: Show Admin Dashboard
  return (
    <div className="admin-page-wrapper">
      <div className="admin-layout">

        {/* LEFT: New Blog Form */}
        <div className="admin-card">
          <div className="admin-header">
            <h2>New Blog Article</h2>
            <button className="admin-logout-btn" onClick={handleLogout}>
              Logout 🔒
            </button>
          </div>

          <form onSubmit={handleSubmit}>
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
              </label>
              <div style={{ display: "flex" }}>
                <span style={{
                  padding: "10px 12px", background: "#1a1a1a", border: "1px solid #333",
                  borderRight: "none", borderRadius: "6px 0 0 6px", color: "#666",
                  fontSize: "0.875rem", whiteSpace: "nowrap"
                }}>
                  blogs/
                </span>
                <input className="admin-input-field" type="text" value={urlHandle}
                  onChange={handleUrlHandleChange}
                  style={{ borderRadius: "0 6px 6px 0", marginBottom: 0 }} />
              </div>
              <small style={{ color: "#666", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                Live URL:
              </small>
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
              <label>Image Alt Tag</label>
              <input
                className="admin-input-field"
                type="text"
                placeholder=""
                value={altTag}
                onChange={(e) => setAltTag(e.target.value)}
              />
            </div>

            <div className="admin-input-group">
              <label>Article Content</label>
              <div
                className="admin-editor-box"
                style={{
                  resize: "vertical",
                  overflow: "auto",
                  minHeight: "300px",
                  border: "1px solid #333",
                  borderRadius: "8px",
                }}
              >
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
                    Meta title, description aur custom script
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
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                    />
                    <span className="admin-seo-char-count">{pageTitle.length} characters</span>
                  </div>

                  <div className="admin-seo-group">
                    <label>Meta description</label>
                    <textarea
                      className="admin-seo-textarea"
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                    />
                    <span className="admin-seo-char-count">{metaDescription.length} characters</span>
                  </div>

                  <div className="admin-seo-group">
                    <label>Script (JSON-LD / Custom)</label>
                    <textarea
                      className="admin-seo-textarea"
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      style={{ minHeight: "120px", fontFamily: "monospace", fontSize: "0.85rem" }}
                    />
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
            <span className="admin-blog-count">{visibleBlogs.length}</span>
          </div>

          <div className="admin-input-group" style={{ padding: "0 0 12px 0" }}>
            <label>Filter by Category</label>
            <select
              className="admin-input-field"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {loadingBlogs ? (
            <p className="admin-empty">Loading...</p>
          ) : visibleBlogs.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon"></div>
              <p>No blogs published yet.</p>
            </div>
          ) : (
            <div className="admin-blog-list">
              {visibleBlogs.map((blog) => {
                const slugForEdit = blog.urlHandle || blog.slug;
                return (
                  <div key={blog._id} className="admin-blog-item">
                    <div className="admin-blog-info">
                      <h3>
                        {blog.title}{" "}
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background: blog.category === "Guides" ? "#2d3a2d" : "#2d2d3a",
                            color: "#ccc",
                            marginLeft: "6px",
                            verticalAlign: "middle",
                          }}
                        >
                          {blog.category || "Blog"}
                        </span>
                      </h3>
                      <p>By {blog.author} · {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}</p>
                    </div>
                    <div className="admin-blog-actions">
                      {slugForEdit ? (
                        <Link href={`/admin-blog/edit?slug=${slugForEdit}`} className="admin-edit-btn">
                          Edit
                        </Link>
                      ) : (
                        <span
                          className="admin-edit-btn"
                          style={{ opacity: 0.4, cursor: "not-allowed" }}
                          title="Yeh blog ka slug missing hai, DB check karo"
                        >
                          Edit
                        </span>
                      )}
                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDelete(blog.slug)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}