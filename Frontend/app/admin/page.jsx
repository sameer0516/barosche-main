"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./admin.css";

const API_BASE = "https://api.barosche.com/api/products";
const API_ORDERS = "https://api.barosche.com/api/orders";

// ── Hardcoded credentials ──
const ADMIN_USERNAME = "barosche";
const ADMIN_PASSWORD = "Barosche@2024";
const AUTH_KEY = "barosche_admin_auth";

const CATEGORIES = [
  "Rings", "Jewellery", "Necklaces", "Earrings", "Bracelets", "For Today", "Mens", "Womens", "New",
  "Chosen", "Pendants", "Anklets", "Brooches", "Other",
];

const CATEGORY_ICONS = {
  Rings: "", Jewellery: "", Necklaces: "", Earrings: "",
  Bracelets: "", "For Today": "", Chosen: "", Pendants: "",
  Anklets: "", Brooches: "", Other: "", Mens: "", Womens: "", New: ""
};

const MATERIAL_OPTIONS = [
  "Gold", "Rose Gold", "White Gold", "Silver", "Sterling Silver",
  "Platinum", "Brass", "Copper", "Stainless Steel", "Titanium",
  "14K Gold", "18K Gold", "22K Gold", "24K Gold",
];

const GEMSTONE_OPTIONS = [
  "Diamond", "Ruby", "Emerald", "Sapphire", "Pearl", "Opal",
  "Amethyst", "Topaz", "Garnet", "Turquoise", "Coral", "Jade",
  "Onyx", "Citrine", "Aquamarine", "Moonstone", "Peridot", "Spinel",
  "Tanzanite", "Alexandrite", "Zircon", "Morganite",
];

const METAL_TYPE_OPTIONS = ["Gold", "Silver"];

const slugify = (val) =>
  val.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const fmtPrice = (n) =>
  new Intl.NumberFormat("en-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const emptyVariant = (idx = 0) => ({
  name: idx === 0 ? "Default" : `Variant ${idx + 1}`,
  title: "",
  description: "",
  materials: [],
  gemstones: [],
  metalType: [],
  oldPrice: "",
  newPrice: "",
  isSale: false,
  inStock: true,
  sizes: [],
  existingImages: [],
  newImages: [],
});

const PAYMENT_METHOD_LABELS = {
  card: "Card",
  klarna: "Klarna",
  paypal: "PayPal",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
};

const PAYMENT_STATUS_COLORS = {
  succeeded: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  pending: { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
  failed: { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  refunded: { bg: "#e0f2fe", color: "#075985", border: "#7dd3fc" },
};

// ════════════════════════════════════════════════════════
//  ORDER DETAIL MODAL
// ════════════════════════════════════════════════════════
function OrderDetailModal({ order, onClose }) {
  const ci = order.customerInfo || {};
  const statusStyle = PAYMENT_STATUS_COLORS[order.paymentStatus] || PAYMENT_STATUS_COLORS.pending;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <h2 className="modal-title">Order #{order.orderNumber || order._id?.slice(-8)}</h2>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: "80vh", overflowY: "auto" }}>

          {/* Status + Meta */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <span style={{
              padding: "5px 14px", borderRadius: 20, fontSize: 16, fontWeight: 600,
              background: statusStyle.bg, color: statusStyle.color, border: `1.5px solid ${statusStyle.border}`,
            }}>
              {order.paymentStatus?.toUpperCase()}.
            </span>
            <span style={{
              padding: "5px 14px", borderRadius: 20, fontSize: 16, fontWeight: 500,
              background: "#f3f4f6", color: "#374151", border: "1.5px solid #e5e7eb",
            }}>
              {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || "—"}
            </span>
            <span style={{ fontSize: 13, color: "#6b7280", alignSelf: "center" }}>
               {fmtDate(order.createdAt)}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

            {/* Customer Info */}
            <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 12px" }}>Customer</p>
              <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", color: "#111827" }}>
                {ci.firstName} {ci.lastName}
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}> {ci.email}</p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 4px" }}> {ci.phone}</p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                {ci.streetAddress1}{ci.streetAddress2 ? `, ${ci.streetAddress2}` : ""}<br />
                {ci.city}{ci.state ? `, ${ci.state}` : ""} {ci.zip}<br />
                {ci.country}
              </p>
            </div>

            {/* Payment Info */}
            <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 12px" }}>Payment</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#6b7280" }}>Amount</span>
                  <strong style={{ color: "#111827" }}>{fmtPrice(order.finalTotal)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#6b7280" }}>Method</span>
                  <span>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#6b7280" }}>Status</span>
                  <span style={{ color: statusStyle.color, fontWeight: 600 }}>{order.paymentStatus}</span>
                </div>
                {order.stripeChargeId && (
                  <div style={{ fontSize: 11, color: "#9ca3af", wordBreak: "break-all", borderTop: "1px solid #f3f4f6", paddingTop: 8, marginTop: 4 }}>
                    ID: {order.stripeChargeId}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", background: "#f9fafb", borderBottom: "1.5px solid #e5e7eb" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", margin: 0 }}>
                Order Items ({order.items?.length || 0})
              </p>
            </div>
            {(order.items || []).map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                borderBottom: i < order.items.length - 1 ? "1px solid #f3f4f6" : "none",
              }}>
                {item.image && (
                  <img
                    src={item.image.startsWith("http") ? item.image : `https://api.barosche.com${item.image}`}
                    alt={item.name}
                    style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb", flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 3px", color: "#111827" }}>{item.name}</p>
                  {item.size && <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Size: {item.size}</p>}
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Qty: {item.quantity}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 2px", color: "#111827" }}>
                    {fmtPrice(item.price * item.quantity)}
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
                    {fmtPrice(item.price)} × {item.quantity}
                  </p>
                </div>
              </div>
            ))}
            <div style={{ padding: "14px 16px", background: "#f9fafb", borderTop: "1.5px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{fmtPrice(order.finalTotal)}</span>
            </div>
          </div>

          {order.note && (
            <div style={{ marginTop: 14, padding: 14, background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, fontSize: 13, color: "#92400e" }}>
              📝 <strong>Note:</strong> {order.note}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════
//  ORDERS SECTION
// ════════════════════════════════════════════════════════
function OrdersSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(API_ORDERS);
      const data = await res.json();
      if (data.success) setOrders(data.orders);
      else setError(data.message || "Failed to fetch orders.");
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || (
      (o.orderNumber || "").toLowerCase().includes(q) ||
      (o.customerInfo?.email || "").toLowerCase().includes(q) ||
      (o.customerInfo?.firstName || "").toLowerCase().includes(q) ||
      (o.customerInfo?.lastName || "").toLowerCase().includes(q) ||
      (o.stripeChargeId || "").toLowerCase().includes(q)
    );
    const matchStatus = !filterStatus || o.paymentStatus === filterStatus;
    const matchMethod = !filterMethod || o.paymentMethod === filterMethod;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "succeeded")
    .reduce((s, o) => s + (o.finalTotal || 0), 0);

  const succeededCount = orders.filter((o) => o.paymentStatus === "succeeded").length;
  const pendingCount = orders.filter((o) => o.paymentStatus === "pending").length;

  return (
    <div>
      {/* Stats */}
      <div className="stats-row" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Orders", value: orders.length, icon: "" },
          { label: "Succeeded", value: succeededCount, icon: "" },
          { label: "Pending", value: pendingCount, icon: "" },
          { label: "Total Revenue", value: fmtPrice(totalRevenue), icon: "" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="stat-card">
            <span className="stat-icon">{icon}</span>
            <div>
              <p className="stat-value">{value}</p>
              <p className="stat-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar" style={{ marginBottom: 16 }}>
        <input
          className="filter-input search"
          type="text"
          placeholder="🔍 Search by order #, email, name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="succeeded">Succeeded</option>
          <option value="pending"> Pending</option>
          <option value="failed"> Failed</option>
          <option value="refunded"> Refunded</option>
        </select>
        <select className="filter-input" value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
          <option value="">All Methods</option>
          <option value="card"> Card</option>
          <option value="klarna"> Klarna</option>
          <option value="paypal"> PayPal</option>
          <option value="apple_pay"> Apple Pay</option>
          <option value="google_pay"> Google Pay</option>
        </select>
        <button className="btn-refresh" onClick={fetchOrders}>↺ Refresh</button>
      </div>

      <p className="result-count">
        {loading ? "Loading…" : `${filtered.length} order${filtered.length !== 1 ? "s" : ""} found`}
      </p>

      {error && <div className="error-banner">⚠️ {error}</div>}

      {loading && (
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton-card" style={{ height: 80 }} />)}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <p style={{ fontSize: 48, margin: 0 }}>📭</p>
          <p>No orders found</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((order) => {
            const ci = order.customerInfo || {};
            const statusStyle = PAYMENT_STATUS_COLORS[order.paymentStatus] || PAYMENT_STATUS_COLORS.pending;
            return (
              <div
                key={order._id}
                onClick={() => setDetailOrder(order)}
                style={{
                  background: "white",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "14px 18px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.boxShadow = "0 2px 12px #8b5cf620"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Order # */}
                <div style={{ minWidth: 130 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#8b5cf6", margin: "0 0 2px", letterSpacing: "0.04em" }}>
                    #{order.orderNumber || order._id?.slice(-8)}
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{fmtDate(order.createdAt)}</p>
                </div>

                {/* Customer */}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>
                    {ci.firstName} {ci.lastName}
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{ci.email}</p>
                </div>

                {/* Items count */}
                <div style={{ textAlign: "center", minWidth: 60 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#374151", margin: "0 0 2px" }}>
                    {order.items?.length || 0}
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>item{order.items?.length !== 1 ? "s" : ""}</p>
                </div>

                {/* Payment method */}
                <div style={{ minWidth: 110 }}>
                  <span style={{
                    fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 500,
                    background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
                  }}>
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod || "—"}
                  </span>
                </div>

                {/* Amount */}
                <div style={{ minWidth: 80, textAlign: "right" }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 2px" }}>
                    {fmtPrice(order.finalTotal)}
                  </p>
                </div>

                {/* Status badge */}
                <span style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: statusStyle.bg, color: statusStyle.color, border: `1.5px solid ${statusStyle.border}`,
                  whiteSpace: "nowrap",
                }}>
                  {order.paymentStatus?.toUpperCase()}
                </span>

                <span style={{ color: "#9ca3af", fontSize: 16 }}>›</span>
              </div>
            );
          })}
        </div>
      )}

      {detailOrder && (
        <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />
      )}
    </div>
  );
}


// ════════════════════════════════════════════════════════
//  LOGIN FORM
// ════════════════════════════════════════════════════════
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, "true");
        onLogin();
      } else {
        setError("Invalid username or password.");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: 20,
    }}>
      <div style={{ position: "fixed", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #8b5cf640 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -100, left: -100, width: 350, height: 350, borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{
        width: "100%", maxWidth: 400, border: "1px solid #8b5cf64d", borderRadius: 20,
        padding: "44px 40px", backdropFilter: "blur(20px)",
        boxShadow: "0 25px 60px #00000066, inset 0 1px 0 #ffffff14", position: "relative", zIndex: 1,
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 16, marginBottom: 20 }}>
            <span style={{ fontSize: 28 }}>💍</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#222222", letterSpacing: "0.04em" }}>Barosche Admin</h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#242424ed", letterSpacing: "0.02em" }}>Sign in to manage your catalogue</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 600, color: "#212121d6", letterSpacing: "0.08em", textTransform: "uppercase" }}>Username</label>
            <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} placeholder="Enter username" autoComplete="username" required
              style={{ width: "100%", padding: "12px 16px", borderRadius: 5, border: error ? "1.5px solid #ef4444" : "1.5px solid #8b5cf64d", background: "#ffffff0f", color: "#222121", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={(e) => { if (!error) e.target.style.borderColor = "#8b5cf6cc"; }}
              onBlur={(e) => { if (!error) e.target.style.borderColor = "#8b5cf64d"; }} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 600, color: "#252525e8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Enter password" autoComplete="current-password" required
                style={{ width: "100%", padding: "12px 44px 12px 16px", borderRadius: 5, border: error ? "1.5px solid #ef4444" : "1.5px solid #8b5cf64d", background: "#ffffff0f", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={(e) => { if (!error) e.target.style.borderColor = "#895af6cc"; }}
                onBlur={(e) => { if (!error) e.target.style.borderColor = "#8b5cf64d"; }} />
              <button type="button" onClick={() => setShowPass((p) => !p)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}
                aria-label={showPass ? "Hide password" : "Show password"}>👁</button>
            </div>
          </div>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#ef434326", border: "1px solid #ef44444d", color: "#fca5a5", fontSize: 13 }}>
              <span>⚠</span> {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{ marginTop: 6, padding: "13px", borderRadius: 5, border: "none", background: loading ? "#8b5cf680" : "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "white", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.02em", transition: "all 0.2s", boxShadow: loading ? "none" : "0 4px 16px #8b5cf666" }}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 28, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
          Barosche Fine Jewellery © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   TAG INPUT
═══════════════════════════════════════════════════════ */
function TagSelector({ label, icon, presets, selected, onChange, placeholder }) {
  const [customInput, setCustomInput] = useState("");
  const toggle = (val) => onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) onChange([...selected, trimmed]);
    setCustomInput("");
  };
  const handleKeyDown = (e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } };
  const removeTag = (val) => onChange(selected.filter((s) => s !== val));

  return (
    <div className="form-group full">
      <label className="form-label">
        {icon} {label}
        {selected.length > 0 && <span style={{ color: "#8b5cf6", marginLeft: 8, fontWeight: 400 }}>({selected.length} selected)</span>}
      </label>
      {selected.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {selected.map((tag) => (
            <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: "#f5f3ff", border: "1.5px solid #8b5cf6", color: "#6d28d9", fontSize: 13, fontWeight: 600 }}>
              {tag}
              <button type="button" onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b5cf6", fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }} aria-label={`Remove ${tag}`}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "12px", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fafafa", marginBottom: 10, maxHeight: 160, overflowY: "auto" }}>
        {presets.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} style={{ padding: "5px 14px", borderRadius: 20, border: active ? "1.5px solid #8b5cf6" : "1.5px solid #d1d5db", background: active ? "#8b5cf6" : "white", color: active ? "white" : "#374151", cursor: "pointer", fontSize: 13, fontWeight: active ? 600 : 400, transition: "all 0.15s" }}>{opt}</button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="form-input" type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} style={{ flex: 1 }} />
        <button type="button" onClick={addCustom} disabled={!customInput.trim()} style={{ padding: "0 16px", borderRadius: 8, cursor: "pointer", border: "1.5px solid #8b5cf6", background: "#8b5cf6", color: "white", fontWeight: 600, fontSize: 13, opacity: customInput.trim() ? 1 : 0.45, transition: "opacity 0.15s" }}>+ Add</button>
      </div>
      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 5 }}>Click a preset to toggle, or type a custom value and press Enter / + Add</p>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   PRODUCT FORM
═══════════════════════════════════════════════════════ */
function ProductForm({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [categories, setCategories] = useState(() => {
    if (initial?.categories?.length) return initial.categories;
    if (initial?.category) return [initial.category];
    return [];
  });
  const [materials, setMaterials] = useState(initial?.materials || []);
  const [gemstones, setGemstones] = useState(initial?.gemstones || []);
  const [variants, setVariants] = useState(
    initial?.variants?.length
      ? initial.variants.map((v) => ({
        _id: v._id, name: v.name, title: v.title || "", description: v.description || "",
        materials: v.materials || [], gemstones: v.gemstones || [], metalType: v.metalType || [],
        oldPrice: v.oldPrice ?? "", newPrice: v.newPrice ?? "", isSale: v.isSale || false,
        inStock: v.inStock ?? true, sizes: v.sizes || [], existingImages: v.images || [], newImages: [],
      }))
      : [emptyVariant(0)]
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugStatus, setSlugStatus] = useState("idle");
  const debounceRef = useRef(null);

  const checkSlug = useCallback(async (val) => {
    if (!val) { setSlugStatus("idle"); return; }
    if (isEdit && val === initial?.slug && categories[0] === initial?.category) { setSlugStatus("ok"); return; }
    setSlugStatus("checking");
    try {
      const primaryCategory = categories[0] || "";
      const excludeId = isEdit ? initial._id : "";
      const params = new URLSearchParams({ slug: val });
      if (primaryCategory) params.append("category", primaryCategory);
      if (excludeId) params.append("excludeId", excludeId);
      const res = await fetch(`${API_BASE}/check-slug?${params}`);
      const data = await res.json();
      setSlugStatus(data.exists ? "taken" : "ok");
    } catch { setSlugStatus("idle"); }
  }, [isEdit, initial?.slug, initial?._id, initial?.category, categories]);

  const scheduleSlugCheck = (val) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkSlug(val), 500);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value; setTitle(val);
    if (!isEdit) { const s = slugify(val); setSlug(s); scheduleSlugCheck(s); }
  };
  const handleSlugChange = (e) => { const val = e.target.value; setSlug(val); scheduleSlugCheck(val); };
  const toggleCategory = (cat) => setCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  const setVariantField = (idx, field, value) => setVariants((prev) => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  const addVariant = () => { const next = variants.length; setVariants((prev) => [...prev, emptyVariant(next)]); setActiveIdx(next); };
  const removeVariant = (idx) => { if (variants.length === 1) return; setVariants((prev) => prev.filter((_, i) => i !== idx)); setActiveIdx((prev) => Math.min(prev, variants.length - 2)); };
  const handleVariantImages = (idx, e) => { const files = Array.from(e.target.files); setVariants((prev) => prev.map((v, i) => i === idx ? { ...v, newImages: [...v.newImages, ...files] } : v)); };
  const removeExistingImg = (varIdx, imgIdx) => setVariants((prev) => prev.map((v, i) => i === varIdx ? { ...v, existingImages: v.existingImages.filter((_, j) => j !== imgIdx) } : v));
  const removeNewImg = (varIdx, imgIdx) => setVariants((prev) => prev.map((v, i) => i === varIdx ? { ...v, newImages: v.newImages.filter((_, j) => j !== imgIdx) } : v));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (categories.length === 0) { setError("Please select at least one category."); return; }
    if (slugStatus === "taken") { setError(`Slug "${slug}" is already taken.`); return; }
    if (slugStatus === "checking") { setError("Please wait — checking slug availability…"); return; }
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.name.trim()) { setError(`Variant ${i + 1} needs a name.`); return; }
      if (!v.oldPrice || !v.newPrice) { setError(`Variant "${v.name}" needs both prices.`); return; }
      if (v.existingImages.length + v.newImages.length === 0) { setError(`Variant "${v.name}" needs at least one image.`); return; }
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title); formData.append("slug", slug); formData.append("description", description);
    formData.append("category", categories[0] || ""); formData.append("categories", JSON.stringify(categories));
    formData.append("materials", JSON.stringify(materials)); formData.append("gemstones", JSON.stringify(gemstones));
    const variantsData = variants.map((v) => ({ _id: v._id, name: v.name, title: v.title, description: v.description, materials: v.materials, gemstones: v.gemstones, metalType: v.metalType, oldPrice: v.oldPrice, newPrice: v.newPrice, isSale: v.isSale, inStock: v.inStock, sizes: v.sizes, existingImages: v.existingImages }));
    formData.append("variantsData", JSON.stringify(variantsData));
    variants.forEach((v, i) => v.newImages.forEach((img) => formData.append(`variantImages_${i}`, img)));
    try {
      const url = isEdit ? `${API_BASE}/${initial._id}` : `${API_BASE}/upload`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (res.ok && data.success) { onSaved(); onClose(); }
      else setError(data.message || "Something went wrong.");
    } catch { setError("Network error. Is the server running?"); }
    finally { setLoading(false); }
  };

  const av = variants[activeIdx] || {};
  const slugBorderColor = slugStatus === "taken" ? "#ef4444" : slugStatus === "ok" ? "#10b981" : undefined;
  const slugHint = slugStatus === "checking" ? { color: "#9ca3af", text: "Checking availability…" }
    : slugStatus === "taken" ? { color: "#ef4444", text: `⚠ Slug "${slug}" is already taken.` }
      : slugStatus === "ok" && slug ? { color: "#10b981", text: "✓ Slug is available" } : null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 740 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label">Product Title *</label>
                <input className="form-input" type="text" value={title} onChange={handleTitleChange} required placeholder="e.g. Gold Diamond Ring" />
              </div>
              <div className="form-group full">
                <label className="form-label">Slug</label>
                <input className="form-input mono" type="text" value={slug} onChange={handleSlugChange} required placeholder="gold-diamond-ring" style={{ borderColor: slugBorderColor }} />
                {slugHint && <p style={{ fontSize: 12, color: slugHint.color, marginTop: 4 }}>{slugHint.text}</p>}
              </div>
              <div className="form-group full">
                <label className="form-label">Description *</label>
                <textarea className="form-input textarea" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Describe the product…" rows={3} />
              </div>
              <div className="form-group full">
                <label className="form-label">
                  Categories *
                  {categories.length > 0 && <span style={{ color: "#8b5cf6", marginLeft: 8, fontWeight: 400 }}>{categories.length} selected: {categories.join(", ")}</span>}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 8, padding: "14px", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fafafa", maxHeight: 230, overflowY: "auto" }}>
                  {CATEGORIES.map((cat) => {
                    const checked = categories.includes(cat);
                    return (
                      <div key={cat} onClick={() => toggleCategory(cat)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, cursor: "pointer", border: checked ? "1.5px solid #8b5cf6" : "1.5px solid #e5e7eb", background: checked ? "#f5f3ff" : "white", transition: "all 0.15s", userSelect: "none" }}>
                        <input type="checkbox" checked={checked} onChange={() => { }} style={{ accentColor: "#8b5cf6", width: 15, height: 15, flexShrink: 0, pointerEvents: "none" }} />
                        <span style={{ fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? "#6d28d9" : "#374151", pointerEvents: "none" }}>{CATEGORY_ICONS[cat]} {cat}</span>
                      </div>
                    );
                  })}
                </div>
                {categories.length === 0 && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>⚠ Please select at least one category.</p>}
              </div>
              <TagSelector label="Material (Product Level)" icon="⚙️" presets={MATERIAL_OPTIONS} selected={materials} onChange={setMaterials} placeholder="e.g. Vermeil, Palladium…" />
              <TagSelector label="Gemstone (Product Level)" icon="💎" presets={GEMSTONE_OPTIONS} selected={gemstones} onChange={setGemstones} placeholder="e.g. Labradorite, Kunzite…" />
            </div>

            <div style={{ marginTop: 28 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label className="form-label" style={{ margin: 0 }}>Product Variants * <span style={{ color: "#9ca3af", fontWeight: 400 }}>({variants.length})</span></label>
                <button type="button" onClick={addVariant} style={{ padding: "5px 16px", borderRadius: 8, border: "2px dashed #8b5cf6", background: "transparent", color: "#8b5cf6", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>+ Add Variant</button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {variants.map((v, i) => (
                  <button key={i} type="button" onClick={() => setActiveIdx(i)} style={{ padding: "6px 18px", borderRadius: 20, cursor: "pointer", fontWeight: 500, fontSize: 13, transition: "all 0.15s", border: activeIdx === i ? "2px solid #8b5cf6" : "2px solid #e5e7eb", background: activeIdx === i ? "#8b5cf6" : "transparent", color: activeIdx === i ? "white" : "#6b7280" }}>
                    {v.name || `Variant ${i + 1}`}
                  </button>
                ))}
              </div>
              <div style={{ border: "1.5px solid #e5e7eb", borderRadius: 12, padding: 20, background: "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <span style={{ fontWeight: 600, color: "#374151", fontSize: 14 }}>✏️ Editing: <em>{av.name || `Variant ${activeIdx + 1}`}</em></span>
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(activeIdx)} style={{ padding: "4px 12px", borderRadius: 8, border: "1.5px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🗑 Remove</button>
                  )}
                </div>
                <div className="form-grid">
                  <div className="form-group full"><label className="form-label">Variant Name *</label><input className="form-input" type="text" value={av.name} onChange={(e) => setVariantField(activeIdx, "name", e.target.value)} required placeholder="e.g. Gold, Silver, Rose Gold, Size 6…" /></div>
                  <div className="form-group full"><label className="form-label">Variant Title <span style={{ color: "#9ca3af", marginLeft: 6, fontWeight: 400, fontSize: 12 }}>(optional — overrides product title on detail page)</span></label><input className="form-input" type="text" value={av.title} onChange={(e) => setVariantField(activeIdx, "title", e.target.value)} placeholder="e.g. Gold Diamond Solitaire Ring" /></div>
                  <div className="form-group full"><label className="form-label">Variant Description <span style={{ color: "#9ca3af", marginLeft: 6, fontWeight: 400, fontSize: 12 }}>(optional)</span></label><textarea className="form-input textarea" value={av.description} onChange={(e) => setVariantField(activeIdx, "description", e.target.value)} placeholder="Describe what makes this variant special…" rows={3} /></div>
                  <TagSelector label="Variant Material" icon="⚙️" presets={MATERIAL_OPTIONS} selected={av.materials || []} onChange={(val) => setVariantField(activeIdx, "materials", val)} placeholder="e.g. Vermeil, Palladium…" />
                  <TagSelector label="Variant Gemstone" icon="💎" presets={GEMSTONE_OPTIONS} selected={av.gemstones || []} onChange={(val) => setVariantField(activeIdx, "gemstones", val)} placeholder="e.g. Labradorite, Kunzite…" />
                  <TagSelector label="Metal Type" icon="🥇" presets={METAL_TYPE_OPTIONS} selected={av.metalType || []} onChange={(val) => setVariantField(activeIdx, "metalType", val)} placeholder="e.g. Gold, Silver…" />
                  <div className="form-group"><label className="form-label">Old Price (€) *</label><input className="form-input" type="number" value={av.oldPrice} onChange={(e) => setVariantField(activeIdx, "oldPrice", e.target.value)} required placeholder="0" min="0" /></div>
                  <div className="form-group"><label className="form-label">New Price (€) *</label><input className="form-input" type="number" value={av.newPrice} onChange={(e) => setVariantField(activeIdx, "newPrice", e.target.value)} required placeholder="0" min="0" /></div>
                  <div className="form-group full">
                    <label className="form-label">Available Sizes{av.sizes?.length > 0 && <span style={{ color: "#8b5cf6", marginLeft: 8, fontWeight: 400 }}>({av.sizes.join(", ")})</span>}</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {["4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"].map((size) => {
                        const selected = av.sizes?.includes(size);
                        return (
                          <button key={size} type="button" onClick={() => { const current = av.sizes || []; const updated = selected ? current.filter((s) => s !== size) : [...current, size]; setVariantField(activeIdx, "sizes", updated); }}
                            style={{ padding: "6px 16px", borderRadius: 20, border: selected ? "2px solid #8b5cf6" : "2px solid #e5e7eb", background: selected ? "#8b5cf6" : "transparent", color: selected ? "white" : "#6b7280", cursor: "pointer", fontWeight: 500, fontSize: 13, transition: "all 0.15s" }}>{size}</button>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>Click to toggle sizes for this variant</p>
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Images * — max 10 per variant{(av.existingImages?.length + (av.newImages?.length || 0)) > 0 && <span style={{ color: "#8b5cf6", marginLeft: 8, fontWeight: 400 }}>({av.existingImages.length + (av.newImages?.length || 0)} selected)</span>}</label>
                    <label className="file-upload-label"><span>📁 Choose Images</span><input type="file" accept="image/*" multiple onChange={(e) => handleVariantImages(activeIdx, e)} style={{ display: "none" }} /></label>
                    {(av.existingImages?.length > 0 || av.newImages?.length > 0) && (
                      <div className="img-preview-grid">
                        {(av.existingImages || []).map((src, i) => (<div key={`ex-${i}`} className="img-preview-item"><img src={`https://api.barosche.com${src}`} alt="" className="img-preview-thumb" /><button type="button" className="btn-remove-img" onClick={() => removeExistingImg(activeIdx, i)}>✕</button></div>))}
                        {(av.newImages || []).map((f, i) => (<div key={`nw-${i}`} className="img-preview-item"><img src={URL.createObjectURL(f)} alt="" className="img-preview-thumb" /><button type="button" className="btn-remove-img" onClick={() => removeNewImg(activeIdx, i)}>✕</button></div>))}
                      </div>
                    )}
                  </div>
                  <div className="toggle-row">
                    <label className="toggle-label">
                      <div className={`toggle-track ${av.isSale ? "on-sale" : "off"}`} onClick={() => setVariantField(activeIdx, "isSale", !av.isSale)}><div className={`toggle-thumb ${av.isSale ? "on" : "off"}`} /></div>
                      <span className="toggle-text">On Sale</span>
                    </label>
                    <label className="toggle-label">
                      <div className={`toggle-track ${av.inStock ? "in-stock" : "off"}`} onClick={() => setVariantField(activeIdx, "inStock", !av.inStock)}><div className={`toggle-thumb ${av.inStock ? "on" : "off"}`} /></div>
                      <span className="toggle-text">In Stock</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            {error && <div className="form-error" style={{ marginTop: 16 }}>{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={loading || slugStatus === "taken" || slugStatus === "checking"}>
                {loading ? "Saving…" : isEdit ? "Update Product" : "Publish Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   PRODUCT DETAIL
═══════════════════════════════════════════════════════ */
function ProductDetail({ product, onClose, onEdit, onDelete }) {
  const [selVariant, setSelVariant] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const variant = product.variants?.[selVariant] || {};
  const handleVariantChange = (i) => { setSelVariant(i); setImgIdx(0); };
  const discount = variant.oldPrice > variant.newPrice ? Math.round(((variant.oldPrice - variant.newPrice) / variant.oldPrice) * 100) : 0;
  const displayCategories = product.categories?.length ? product.categories : product.category ? [product.category] : [];
  const displayMaterials = [...new Set([...(product.materials || []), ...(variant.materials || [])])];
  const displayGemstones = [...new Set([...(product.gemstones || []), ...(variant.gemstones || [])])];
  const displayMetalType = variant.metalType || [];
  const displayTitle = variant.title || product.title;
  const displayDesc = variant.description || product.description;

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2 className="modal-title">Product Details</h2>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            <div className="main-img-wrap-container">
              <div className="main-img-wrap">
                {variant.images?.length > 0 && <img src={`https://api.barosche.com${variant.images[imgIdx]}`} alt={displayTitle} className="main-img" />}
                {variant.isSale && <span className="detail-badge-sale">SALE</span>}
                {!variant.inStock && <span className="detail-badge-out">OUT OF STOCK</span>}
              </div>
              {variant.images?.length > 1 && (
                <div className="thumb-row">
                  {variant.images.map((img, i) => (<img key={i} src={`https://api.barosche.com${img}`} alt="" className={`thumb-img ${imgIdx === i ? "active" : ""}`} onClick={() => setImgIdx(i)} />))}
                </div>
              )}
            </div>
            <div className="detail-info">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {displayCategories.map((cat) => <span key={cat} className="category-pill">{CATEGORY_ICONS[cat]} {cat}</span>)}
              </div>
              <h3 className="detail-title">{displayTitle}</h3>
              {product.variants?.length > 0 && (
                <div style={{ margin: "14px 0" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8 }}>{product.variants.length > 1 ? "Select Variant" : "Variant"}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {product.variants.map((v, i) => (<button key={v._id || i} onClick={() => handleVariantChange(i)} style={{ padding: "6px 18px", borderRadius: 20, cursor: "pointer", fontWeight: 500, fontSize: 13, border: selVariant === i ? "2px solid #8b5cf6" : "2px solid #e5e7eb", background: selVariant === i ? "#8b5cf6" : "white", color: selVariant === i ? "white" : "#374151", transition: "all 0.15s" }}>{v.name}</button>))}
                  </div>
                </div>
              )}
              <div className="detail-price-row">
                <span className="detail-new-price">{fmtPrice(variant.newPrice)}</span>
                {discount > 0 && (<><span className="detail-old-price">{fmtPrice(variant.oldPrice)}</span><span className="detail-discount">{discount}% off</span></>)}
              </div>
              <p className="detail-desc">{displayDesc}</p>
              {(displayMaterials.length > 0 || displayGemstones.length > 0 || displayMetalType.length > 0) && (
                <div style={{ margin: "14px 0", display: "flex", flexDirection: "column", gap: 10 }}>
                  {displayMetalType.length > 0 && <div><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>🥇 Metal Type</p><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{displayMetalType.map((m) => <span key={m} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500, background: "#e0f2fe", border: "1px solid #0ea5e9", color: "#075985" }}>{m}</span>)}</div></div>}
                  {displayMaterials.length > 0 && <div><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>⚙️ Material</p><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{displayMaterials.map((m) => <span key={m} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500, background: "#fef3c7", border: "1px solid #f59e0b", color: "#92400e" }}>{m}</span>)}</div></div>}
                  {displayGemstones.length > 0 && <div><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>💎 Gemstone</p><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{displayGemstones.map((g) => <span key={g} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 500, background: "#ede9fe", border: "1px solid #8b5cf6", color: "#5b21b6" }}>{g}</span>)}</div></div>}
                </div>
              )}
              <div className="meta-grid">
                <div className="meta-item"><span className="meta-label">Slug</span><span className="meta-value"><code>{product.slug}</code></span></div>
                <div className="meta-item"><span className="meta-label">Variants</span><span className="meta-value">{product.variants?.length || 1}</span></div>
                <div className="meta-item"><span className="meta-label">Images</span><span className="meta-value">{variant.images?.length || 0} photos</span></div>
                <div className="meta-item"><span className="meta-label">Created</span><span className="meta-value">{new Date(product.createdAt).toLocaleDateString("en-IN")}</span></div>
                <div className="meta-item"><span className="meta-label">Stock</span><span className={`meta-value ${variant.inStock ? "in-stock" : "out-stock"}`}>{variant.inStock ? "✓ Available" : "✗ Out of Stock"}</span></div>
                <div className="meta-item"><span className="meta-label">Materials</span><span className="meta-value">{displayMaterials.length}</span></div>
                <div className="meta-item"><span className="meta-label">Gemstones</span><span className="meta-value">{displayGemstones.length}</span></div>
                <div className="meta-item"><span className="meta-label">Categories</span><span className="meta-value">{displayCategories.length}</span></div>
              </div>
              <div className="detail-actions">
                <button className="btn-detail-edit" onClick={onEdit}>✏️ Edit Product</button>
                <button className="btn-detail-delete" onClick={onDelete}>🗑 Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   DELETE CONFIRM
═══════════════════════════════════════════════════════ */
function DeleteConfirm({ product, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header"><h2 className="modal-title danger">Delete Product</h2><button className="btn-close-modal" onClick={onClose}>✕</button></div>
        <div className="modal-body delete-confirm-body">
          <div className="delete-icon">🗑</div>
          <p className="delete-confirm-sub">Are you sure you want to delete</p>
          <p className="delete-confirm-name">"{product.title}"?</p>
          <p className="delete-confirm-note">This will permanently remove the product and all its variant images.</p>
          <div className="delete-confirm-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-submit danger" onClick={onConfirm} disabled={loading}>{loading ? "Deleting…" : "Yes, Delete"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════════════ */
function ProductCard({ product, onClick, onEdit, onDelete }) {
  const firstVariant = product.variants?.[0] || {};
  const variantCount = product.variants?.length || 1;
  const discount = firstVariant.oldPrice > firstVariant.newPrice ? Math.round(((firstVariant.oldPrice - firstVariant.newPrice) / firstVariant.oldPrice) * 100) : 0;
  const displayCategories = product.categories?.length ? product.categories : product.category ? [product.category] : [];
  const cardMaterials = firstVariant.materials?.length ? firstVariant.materials : (product.materials || []);
  const cardGemstones = firstVariant.gemstones?.length ? firstVariant.gemstones : (product.gemstones || []);
  const cardMetalType = firstVariant.metalType || [];

  return (
    <div className="product-card" onClick={onClick}>
      <div className="card-img-wrap">
        {firstVariant.images?.[0] ? <img src={`https://api.barosche.com${firstVariant.images[0]}`} alt={product.title} className="card-img" /> : <div className="card-img-placeholder">📷</div>}
        {firstVariant.isSale && <span className="badge-sale">SALE</span>}
        {!firstVariant.inStock && <span className="badge-out">OUT OF STOCK</span>}
        {variantCount > 1 && <span className="badge-img-count">{variantCount} variants</span>}
      </div>
      <div className="card-body">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>
          {displayCategories.map((cat) => <p key={cat} className="card-category" style={{ margin: 0 }}>{CATEGORY_ICONS[cat]} {cat}</p>)}
        </div>
        <h3 className="card-title">{firstVariant.title || product.title}</h3>
        {(cardMetalType.length > 0 || cardMaterials.length > 0 || cardGemstones.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
            {cardMetalType.map((mt) => <span key={mt} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#e0f2fe", color: "#075985", fontWeight: 500 }}>🥇 {mt}</span>)}
            {cardMaterials.slice(0, 2).map((m) => <span key={m} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#fef3c7", color: "#92400e", fontWeight: 500 }}>{m}</span>)}
            {cardGemstones.slice(0, 2).map((g) => <span key={g} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#ede9fe", color: "#5b21b6", fontWeight: 500 }}>{g}</span>)}
          </div>
        )}
        <div className="card-price-row">
          <span className="card-new-price">{fmtPrice(firstVariant.newPrice)}</span>
          <span className="card-old-price">{fmtPrice(firstVariant.oldPrice)}</span>
        </div>
      </div>
      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="btn-card-edit" title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(); }}>✏️ Edit</button>
        <button className="btn-card-delete" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>🗑 Delete</button>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   PRODUCTS SECTION
═══════════════════════════════════════════════════════ */
function ProductsSection({ onAddProduct, showAddForm, setShowAddForm, editProduct, setEditProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterSale, setFilterSale] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterGemstone, setFilterGemstone] = useState("");
  const [filterMetalType, setFilterMetalType] = useState("");
  const [detailProduct, setDetailProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (filterCat) params.append("category", filterCat);
      if (filterSale) params.append("isSale", filterSale);
      if (filterMaterial) params.append("material", filterMaterial);
      if (filterGemstone) params.append("gemstone", filterGemstone);
      if (filterMetalType) params.append("metalType", filterMetalType);
      const res = await fetch(`${API_BASE}?${params}`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
      else setError(data.message);
    } catch { setError("Could not connect to server."); }
    finally { setLoading(false); }
  }, [filterCat, filterSale, filterMaterial, filterGemstone, filterMetalType]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { showToast("Product deleted successfully."); setDeleteTarget(null); setDetailProduct(null); fetchProducts(); }
      else showToast(data.message || "Delete failed.", "error");
    } catch { showToast("Network error.", "error"); }
    finally { setDeleting(false); }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) ||
      (p.categories || [p.category]).some((c) => c?.toLowerCase().includes(q)) ||
      (p.materials || []).some((m) => m.toLowerCase().includes(q)) ||
      (p.gemstones || []).some((g) => g.toLowerCase().includes(q)) ||
      (p.variants || []).some((v) =>
        (v.title || "").toLowerCase().includes(q) || (v.description || "").toLowerCase().includes(q) ||
        (v.materials || []).some((m) => m.toLowerCase().includes(q)) ||
        (v.gemstones || []).some((g) => g.toLowerCase().includes(q)) ||
        (v.metalType || []).some((mt) => mt.toLowerCase().includes(q))
      )
    );
  });

  const allMaterials = [...new Set(products.flatMap((p) => [...(p.materials || []), ...(p.variants || []).flatMap((v) => v.materials || [])]))].sort();
  const allGemstones = [...new Set(products.flatMap((p) => [...(p.gemstones || []), ...(p.variants || []).flatMap((v) => v.gemstones || [])]))].sort();
  const allMetalTypes = [...new Set(products.flatMap((p) => (p.variants || []).flatMap((v) => v.metalType || [])))].sort();
  const totalValue = products.reduce((s, p) => s + (p.variants?.[0]?.newPrice || 0), 0);
  const saleCount = products.filter((p) => p.variants?.some((v) => v.isSale)).length;
  const outOfStock = products.filter((p) => p.variants?.every((v) => !v.inStock)).length;

  return (
    <div>
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.type === "success" ? "✓" : "✕"} {toast.msg}</div>}

      <div className="stats-row">
        {[
          { label: "Total Products", value: products.length, icon: "📦" },
          { label: "On Sale", value: saleCount, icon: "🏷" },
          { label: "Out of Stock", value: outOfStock, icon: "⚠️" },
          { label: "Catalogue Value", value: fmtPrice(totalValue), icon: "💰" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="stat-card"><span className="stat-icon">{icon}</span><div><p className="stat-value">{value}</p><p className="stat-label">{label}</p></div></div>
        ))}
      </div>

      <div className="filters-bar">
        <input className="filter-input search" type="text" placeholder="🔍 Search by title, material, gemstone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="filter-input cat" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-input" value={filterMetalType} onChange={(e) => setFilterMetalType(e.target.value)}>
          <option value="">All Metal Types</option>
          {allMetalTypes.map((mt) => <option key={mt} value={mt}>🥇 {mt}</option>)}
        </select>
        <select className="filter-input" value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)}>
          <option value="">All Materials</option>
          {allMaterials.map((m) => <option key={m} value={m}>⚙️ {m}</option>)}
        </select>
        <select className="filter-input" value={filterGemstone} onChange={(e) => setFilterGemstone(e.target.value)}>
          <option value="">All Gemstones</option>
          {allGemstones.map((g) => <option key={g} value={g}>💎 {g}</option>)}
        </select>
        <select className="filter-input sale" value={filterSale} onChange={(e) => setFilterSale(e.target.value)}>
          <option value="">All Products</option>
          <option value="true">On Sale</option>
          <option value="false">Regular</option>
        </select>
        <button className="btn-refresh" onClick={fetchProducts}>↺ Refresh</button>
      </div>

      <p className="result-count">{loading ? "Loading…" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""} found`}</p>
      {error && <div className="error-banner">⚠️ {error}</div>}

      {loading && <div className="skeleton-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton-card" />)}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <p style={{ fontSize: 48, margin: 0 }}>💍</p>
          <p>No products found</p>
          <button className="btn-add-product" style={{ marginTop: 16 }} onClick={() => setShowAddForm(true)}>+ Add First Product</button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p}
              onClick={() => setDetailProduct(p)}
              onEdit={() => { setDetailProduct(null); setEditProduct(p); }}
              onDelete={() => setDeleteTarget(p)} />
          ))}
        </div>
      )}

      {showAddForm && <ProductForm onClose={() => setShowAddForm(false)} onSaved={() => { showToast("Product added successfully!"); fetchProducts(); }} />}
      {editProduct && <ProductForm initial={editProduct} onClose={() => setEditProduct(null)} onSaved={() => { showToast("Product updated successfully!"); fetchProducts(); }} />}
      {detailProduct && <ProductDetail product={detailProduct} onClose={() => setDetailProduct(null)} onEdit={() => { setEditProduct(detailProduct); setDetailProduct(null); }} onDelete={() => { setDeleteTarget(detailProduct); setDetailProduct(null); }} />}
      {deleteTarget && <DeleteConfirm product={deleteTarget} loading={deleting} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   ADMIN DASHBOARD — with tabs
═══════════════════════════════════════════════════════ */
function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("products");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const tabs = [
    { id: "products", label: "📦 Products" },
    { id: "orders", label: "🛍️ Orders" },
  ];

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div>
          <h1 className="admin-header-title">Barosche Admin</h1>
          <p className="admin-header-sub">Manage your product catalogue & orders</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {activeTab === "products" && (
            <button className="btn-add-product" onClick={() => setShowAddForm(true)}>
              + Add New Product
            </button>
          )}
          <button
            onClick={onLogout}
            style={{ padding: "9px 18px", borderRadius: 10, border: "1.5px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(239,68,68,0.18)"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(239,68,68,0.08)"; }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #e5e7eb", paddingBottom: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 24px",
              border: "none",
              background: "none",
              fontSize: 14,
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? "#8b5cf6" : "#6b7280",
              cursor: "pointer",
              borderBottom: activeTab === tab.id ? "2px solid #8b5cf6" : "2px solid transparent",
              marginBottom: -2,
              transition: "all 0.15s",
              letterSpacing: "0.02em",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        <ProductsSection
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          editProduct={editProduct}
          setEditProduct={setEditProduct}
        />
      )}

      {activeTab === "orders" && <OrdersSection />}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   ROOT — Auth Gate
═══════════════════════════════════════════════════════ */
export default function AdminRoot() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(AUTH_KEY) === "true";
    }
    return false;
  });

  if (!isLoggedIn) {
    return <LoginForm onLogin={() => setIsLoggedIn(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsLoggedIn(false)} />;
}