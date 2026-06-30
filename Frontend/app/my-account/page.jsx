"use client";

import "./Myaccount.css";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function MyAccount() {
  const { user, loading, login, register, logout } = useAuth();
  const router = useRouter();

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
        title: "Mr.",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
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
              Welcome, <span>{user.firstName}</span>
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
            <div className="ma-avatar">
              {user.firstName.charAt(0).toUpperCase()}
            </div>
            <div className="ma-profile-info">
              <p className="ma-profile-name">
                {user.title} {user.firstName} {user.lastName}
              </p>
              <p className="ma-profile-email">{user.email}</p>
            </div>
          </div>

          {/* Nav Grid */}
          <div className="ma-nav-grid">
            <Link href="/orders" className="ma-nav-card">
              <div className="ma-nav-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="ma-nav-label">My Orders</p>
              <p className="ma-nav-sub">Track & manage orders</p>
              <span className="ma-nav-arrow">→</span>
            </Link>

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

            <Link href="/account/settings" className="ma-nav-card">
              <div className="ma-nav-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="ma-nav-label">Settings</p>
              <p className="ma-nav-sub">Edit your profile</p>
              <span className="ma-nav-arrow">→</span>
            </Link>

            <Link href="/addresses" className="ma-nav-card">
              <div className="ma-nav-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="ma-nav-label">Addresses</p>
              <p className="ma-nav-sub">Manage delivery addresses</p>
              <span className="ma-nav-arrow">→</span>
            </Link>
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