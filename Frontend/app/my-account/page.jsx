"use client";

import "./Myaccount.css";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "../../app/context/AuthContext";

const API_BASE = "https://api.barosche.com";

// ──
function getUserInitial(user) {
  const source = user?.firstName || user?.lastName || user?.email || "U";
  return String(source).charAt(0).toUpperCase();
}
function getUserDisplayName(user) {
  const parts = [user?.title, user?.firstName, user?.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : (user?.email || "");
}
function isProfileIncomplete(user) {
  return !user?.firstName || !user?.lastName || !user?.phone;
}
function isAddressMissing(user) {
  return !user?.address || !user.address.line1;
}

function authHeaders() {
  const token = localStorage.getItem("jewellery_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatMoney(amount) {
  if (amount == null) return "";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

// ── Reusable modal shell ─────────────────────────────────────────
function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="ma-modal-backdrop" onClick={onClose}>
      <div
        className={`ma-modal ${wide ? "ma-modal-wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ma-modal-header">
          <span className="ma-modal-title">{title}</span>
          <button className="ma-modal-close" onClick={onClose} aria-label="Close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="ma-modal-body">{children}</div>
      </div>
    </div>
  );
}

export default function MyAccount() {
  const { user, loading, login, register, logout, setSession } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoader, setAuthLoader] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    title: "Mr.",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // ── Which modal is open: null | "profile" | "address" | "orders"
  const [activeModal, setActiveModal] = useState(null);

  // Profile edit
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Address edit
  const [addressForm, setAddressForm] = useState({
    line1: "", line2: "", city: "", state: "", postalCode: "", country: "", phone: "",
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleLogin = async () => {
    setAuthError("");
    setSuccessMsg("");
    if (!loginForm.email || !loginForm.password) {
      setAuthError("Please fill in all fields.");
      return;
    }
    setAuthLoader(true);
    const result = await login(loginForm.email, loginForm.password);
    setAuthLoader(false);
    if (result.success) {
      setSuccessMsg("Welcome back!");
      setLoginForm({ email: "", password: "" });
    } else {
      if (result.userNotFound) {
        setMode("register");
        setRegisterForm((prev) => ({ ...prev, email: loginForm.email }));
        setAuthError("No account found. Please create one below.");
      } else {
        setAuthError(result.message || "Login failed.");
      }
    }
  };

  const handleRegister = async () => {
    setAuthError("");
    setSuccessMsg("");
    const { title, firstName, lastName, email, password, confirmPassword } = registerForm;
    if (!firstName || !lastName || !email || !password) {
      setAuthError("Please fill all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    setAuthLoader(true);
    const result = await register({ title, firstName, lastName, email, password });
    setAuthLoader(false);
    if (result.success) {
      setSuccessMsg("Account created successfully!");
      setRegisterForm({
        title: "Mr.", firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
      });
    } else {
      if (result.userExists) {
        setMode("login");
        setLoginForm((prev) => ({ ...prev, email: registerForm.email }));
        setAuthError("Account already exists. Please login.");
      } else {
        setAuthError(result.message || "Registration failed.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    setSuccessMsg("");
    setAuthError("");
    setActiveModal(null);
  };

  // ── PROFILE MODAL ─────────────────────────────────────────────
  const openProfileModal = () => {
    setProfileError("");
    setProfileForm({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setActiveModal("profile");
  };

  const saveProfile = async () => {
    setProfileError("");
    if (!profileForm.firstName || !profileForm.lastName || !profileForm.email) {
      setProfileError("First name, last name and email are required.");
      return;
    }
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      setProfileSaving(false);

      if (data.success) {
        // Backend response me updated user milna chahiye. Agar na mile,
        // to jo form me tha usi se locally user object update kar dete hain.
        const updatedUser = data.user || { ...user, ...profileForm };
        const token = localStorage.getItem("jewellery_token");
        setSession(token, updatedUser);
        setActiveModal(null);
      } else {
        setProfileError(data.message || "Could not update profile.");
      }
    } catch (err) {
      setProfileSaving(false);
      setProfileError("Server error. Please try again.");
    }
  };

  // ── ADDRESS MODAL ─────────────────────────────────────────────
  const openAddressModal = () => {
    setAddressError("");
    setAddressForm({
      line1: user?.address?.line1 || "",
      line2: user?.address?.line2 || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "",
      phone: user?.address?.phone || user?.phone || "",
    });
    setActiveModal("address");
  };

  const saveAddress = async () => {
    setAddressError("");
    if (!addressForm.line1 || !addressForm.city || !addressForm.postalCode || !addressForm.country) {
      setAddressError("Please fill address line, city, postal code and country.");
      return;
    }
    setAddressSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/address`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(addressForm),
      });
      const data = await res.json();
      setAddressSaving(false);

      if (data.success) {
        const updatedUser = data.user || { ...user, address: addressForm };
        const token = localStorage.getItem("jewellery_token");
        setSession(token, updatedUser);
        setActiveModal(null);
      } else {
        setAddressError(data.message || "Could not save address.");
      }
    } catch (err) {
      setAddressSaving(false);
      setAddressError("Server error. Please try again.");
    }
  };

  // ── ORDERS MODAL ──────────────────────────────────────────────
  const openOrdersModal = useCallback(async () => {
    setActiveModal("orders");
    setSelectedOrder(null);
    setOrdersError("");
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders/my`, {
        headers: { ...authHeaders() },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } else {
        setOrdersError(data.message || "Could not load orders.");
      }
    } catch (err) {
      setOrdersError("Server error while loading orders.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="ma-page">
        <div className="ma-loading">
          <span className="ma-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <>
        <div className="ma-page">
          <div className="ma-container">

            {/* Header */}
            <div className="ma-header">
              <p className="ma-eyebrow">MY ACCOUNT</p>
              <h1 className="ma-greeting">
                Welcome, <span>{user.firstName || "there"}</span>
              </h1>
            </div>

            {successMsg && (
              <div className="ma-success">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {successMsg}
              </div>
            )}

            {/* Profile Card */}
            <div className="ma-profile-card">
              <div className="ma-avatar">{getUserInitial(user)}</div>
              <div className="ma-profile-info">
                <p className="ma-profile-name">{getUserDisplayName(user) || "Add your details"}</p>
                <p className="ma-profile-email">{user.email}</p>
              </div>
            </div>

            {/* Nav Grid */}
            <div className="ma-nav-grid">
              <button className="ma-nav-card" onClick={openOrdersModal}>
                <div className="ma-nav-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="ma-nav-label">My Orders</p>
                <p className="ma-nav-sub">Track & manage orders</p>
                <span className="ma-nav-arrow">→</span>
              </button>

              <Link href="/wishlist" className="ma-nav-card">
                <div className="ma-nav-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="ma-nav-label">Wishlist</p>
                <p className="ma-nav-sub">Your saved pieces</p>
                <span className="ma-nav-arrow">→</span>
              </Link>

              {/* SETTINGS ki jagah PROFILE — edit modal kholta hai */}
              <button className="ma-nav-card" onClick={openProfileModal}>
                <div className="ma-nav-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="ma-nav-label">Profile</p>
                <p className="ma-nav-sub">
                  {isProfileIncomplete(user) ? "Complete your profile" : "Edit your profile"}
                </p>
                <span className="ma-nav-arrow">→</span>
              </button>

              <button className="ma-nav-card" onClick={openAddressModal}>
                <div className="ma-nav-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="ma-nav-label">Address</p>
                <p className="ma-nav-sub">
                  {isAddressMissing(user) ? "Add delivery address" : "Edit delivery address"}
                </p>
                <span className="ma-nav-arrow">→</span>
              </button>
            </div>

            <button className="ma-logout-btn" onClick={handleLogout}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              LOGOUT
            </button>
          </div>
        </div>

        {/* ══ PROFILE EDIT MODAL ══ */}
        {activeModal === "profile" && (
          <Modal title="Edit Profile" onClose={() => setActiveModal(null)}>
            {profileError && <div className="ma-error">{profileError}</div>}
            <div className="ma-form">
              <div className="ma-field-row">
                <div className="ma-field">
                  <label className="ma-label">FIRST NAME*</label>
                  <input
                    className="ma-input"
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div className="ma-field">
                  <label className="ma-label">LAST NAME*</label>
                  <input
                    className="ma-input"
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="ma-field">
                <label className="ma-label">EMAIL*</label>
                <input
                  className="ma-input"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="ma-field">
                <label className="ma-label">PHONE NUMBER</label>
                <input
                  className="ma-input"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <button className="ma-btn-primary" onClick={saveProfile} disabled={profileSaving}>
                {profileSaving ? <span className="ma-spinner-sm" /> : null}
                {profileSaving ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          </Modal>
        )}

        {/* ══ ADDRESS EDIT MODAL ══ */}
        {activeModal === "address" && (
          <Modal title={isAddressMissing(user) ? "Add Address" : "Edit Address"} onClose={() => setActiveModal(null)}>
            {addressError && <div className="ma-error">{addressError}</div>}
            <div className="ma-form">
              <div className="ma-field">
                <label className="ma-label">ADDRESS LINE 1*</label>
                <input
                  className="ma-input"
                  type="text"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm((p) => ({ ...p, line1: e.target.value }))}
                />
              </div>
              <div className="ma-field">
                <label className="ma-label">ADDRESS LINE 2</label>
                <input
                  className="ma-input"
                  type="text"
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm((p) => ({ ...p, line2: e.target.value }))}
                />
              </div>
              <div className="ma-field-row">
                <div className="ma-field">
                  <label className="ma-label">CITY*</label>
                  <input
                    className="ma-input"
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                  />
                </div>
                <div className="ma-field">
                  <label className="ma-label">STATE</label>
                  <input
                    className="ma-input"
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                  />
                </div>
              </div>
              <div className="ma-field-row">
                <div className="ma-field">
                  <label className="ma-label">POSTAL CODE*</label>
                  <input
                    className="ma-input"
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm((p) => ({ ...p, postalCode: e.target.value }))}
                  />
                </div>
                <div className="ma-field">
                  <label className="ma-label">COUNTRY*</label>
                  <input
                    className="ma-input"
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
                  />
                </div>
              </div>
              <div className="ma-field">
                <label className="ma-label">PHONE (for delivery)</label>
                <input
                  className="ma-input"
                  type="tel"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <button className="ma-btn-primary" onClick={saveAddress} disabled={addressSaving}>
                {addressSaving ? <span className="ma-spinner-sm" /> : null}
                {addressSaving ? "SAVING..." : "SAVE ADDRESS"}
              </button>
            </div>
          </Modal>
        )}

        {/* ══ ORDERS MODAL ══ */}
        {activeModal === "orders" && (
          <Modal title="My Orders" onClose={closeModal} wide>
            {ordersLoading ? (
              <div className="ma-loading">
                <span className="ma-spinner" />
                <p>Loading orders...</p>
              </div>
            ) : ordersError ? (
              <div className="ma-error">{ordersError}</div>
            ) : orders.length === 0 ? (
              <p className="ma-empty-text">You haven't placed any orders yet.</p>
            ) : (
              <div className="ma-orders-list">
                {orders.map((order) => (
                  <button
                    key={order._id || order.orderNumber}
                    className="ma-order-row"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div>
                      <p className="ma-order-id">#{order.orderNumber || order._id}</p>
                      <p className="ma-order-date">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="ma-order-right">
                      <span className={`ma-order-status ma-status-${(order.status || "pending").toLowerCase()}`}>
                        {order.status || "Pending"}
                      </span>
                      <p className="ma-order-total">{formatMoney(order.totalAmount)}</p>
                    </div>
                    <span className="ma-nav-arrow">→</span>
                  </button>
                ))}
              </div>
            )}
          </Modal>
        )}

        {/* ══ ORDER DETAIL POPUP (orders modal ke upar) ══ */}
        {selectedOrder && (
          <Modal title={`Order #${selectedOrder.orderNumber || selectedOrder._id}`} onClose={() => setSelectedOrder(null)}>
            <div className="ma-order-detail">
              <p className="ma-order-detail-row">
                <span>Date</span>
                <span>{formatDate(selectedOrder.createdAt)}</span>
              </p>
              <p className="ma-order-detail-row">
                <span>Status</span>
                <span className={`ma-order-status ma-status-${(selectedOrder.status || "pending").toLowerCase()}`}>
                  {selectedOrder.status || "Pending"}
                </span>
              </p>
              <p className="ma-order-detail-row">
                <span>Total</span>
                <span>{formatMoney(selectedOrder.totalAmount)}</span>
              </p>

              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 && (
                <>
                  <div className="ma-order-items-title">Items</div>
                  <div className="ma-order-items">
                    {selectedOrder.items.map((item, idx) => (
                      <div className="ma-order-item" key={idx}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title || "Product"}
                            width={48}
                            height={48}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        )}
                        <div>
                          <p className="ma-order-item-title">{item.title || item.name}</p>
                          <p className="ma-order-item-sub">
                            Qty {item.qty ?? 1} · {formatMoney(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedOrder.shippingAddress && (
                <>
                  <div className="ma-order-items-title">Shipping Address</div>
                  <p className="ma-order-address">
                    {[
                      selectedOrder.shippingAddress.line1,
                      selectedOrder.shippingAddress.line2,
                      selectedOrder.shippingAddress.city,
                      selectedOrder.shippingAddress.state,
                      selectedOrder.shippingAddress.postalCode,
                      selectedOrder.shippingAddress.country,
                    ].filter(Boolean).join(", ")}
                  </p>
                </>
              )}
            </div>
          </Modal>
        )}
      </>
    );
  }

  return (
    <>
      <div className="ma-page">
        <div className="ma-auth-wrap">

          {/* Left — decorative */}
          <div className="ma-auth-deco">
            <div className="ma-deco-inner">
              <p className="ma-deco-tagline">YOUR JEWELLERY JOURNEY</p>
              <h2 className="ma-deco-title">Sign in to<br />your world<br />of Barosche.</h2>
              <p className="ma-deco-body">
                Access your exclusive orders, curated wishlist, and personalised recommendations.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div className="ma-auth-form-wrap">
            <div className="ma-auth-tabs">
              <button
                className={`ma-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setAuthError(""); setSuccessMsg(""); }}
              >
                Login
              </button>
              <button
                className={`ma-tab ${mode === "register" ? "active" : ""}`}
                onClick={() => { setMode("register"); setAuthError(""); setSuccessMsg(""); }}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="ma-error">
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {authError}
              </div>
            )}

            {successMsg && (
              <div className="ma-success">
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {successMsg}
              </div>
            )}

            {mode === "login" ? (
              <div className="ma-form">
                <div className="ma-field">
                  <label className="ma-label">EMAIL</label>
                  <input
                    className="ma-input"
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                </div>
                <div className="ma-field">
                  <label className="ma-label">PASSWORD</label>
                  <div className="ma-input-wrap">
                    <input
                      className="ma-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button className="ma-eye" type="button" onClick={() => setShowPassword((p) => !p)}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="ma-forgot-row">
                  <a href="#" className="ma-forgot">Forgot password?</a>
                </div>
                <button className="ma-btn-primary" onClick={handleLogin} disabled={authLoader}>
                  {authLoader ? <span className="ma-spinner-sm" /> : null}
                  {authLoader ? "LOGGING IN..." : "LOG IN"}
                </button>
              </div>
            ) : (
              <div className="ma-form">
                <div className="ma-field">
                  <label className="ma-label">TITLE</label>
                  <select
                    className="ma-select"
                    value={registerForm.title}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, title: e.target.value }))}
                  >
                    <option>Mr.</option>
                    <option>Ms.</option>
                    <option>Mrs.</option>
                    <option>Dr.</option>
                  </select>
                </div>
                <div className="ma-field-row">
                  <div className="ma-field">
                    <label className="ma-label">FIRST NAME*</label>
                    <input
                      className="ma-input"
                      type="text"
                      placeholder="First name"
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm((p) => ({ ...p, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="ma-field">
                    <label className="ma-label">LAST NAME*</label>
                    <input
                      className="ma-input"
                      type="text"
                      placeholder="Last name"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm((p) => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="ma-field">
                  <label className="ma-label">EMAIL*</label>
                  <input
                    className="ma-input"
                    type="email"
                    placeholder="your@email.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="ma-field">
                  <label className="ma-label">PASSWORD*</label>
                  <div className="ma-input-wrap">
                    <input
                      className="ma-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                    />
                    <button className="ma-eye" type="button" onClick={() => setShowPassword((p) => !p)}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="ma-field">
                  <label className="ma-label">CONFIRM PASSWORD*</label>
                  <div className="ma-input-wrap">
                    <input
                      className="ma-input"
                      type={showConfirmPwd ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    />
                    <button className="ma-eye" type="button" onClick={() => setShowConfirmPwd((p) => !p)}>
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button className="ma-btn-primary" onClick={handleRegister} disabled={authLoader}>
                  {authLoader ? <span className="ma-spinner-sm" /> : null}
                  {authLoader ? "CREATING..." : "CREATE ACCOUNT"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}