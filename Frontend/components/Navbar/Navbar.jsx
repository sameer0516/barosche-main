"use client";

import "./Navbar.css";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../app/context/CartContext";
import { useAuth } from "../../app/context/AuthContext";
import { useWishlist } from "../../app/context/WishlistContext";

const menuItems = [
  "JEWELLERY", "RINGS", "EARRINGS", "PENDANTS", "BRACELETS",
  "FOR TODAY", "JOURNAL", "CONTACT US",
];

const collectionItems = [
  "JEWELLERY", "RINGS", "EARRINGS", "PENDANTS", "BRACELETS", "FOR TODAY", 
];

const slugOverrides = {
  "FOR TODAY": "for-today-jewellery",
  "CHOSEN": "chosen-jewellery",
  "JOURNAL": "blogs",
};

const popularSearches = [
  "Women Pendants", "Men Pendants", "Earrings", "Rings", "Bracelets",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

// ─────────────────────────────────────────────────────────
//  ALL TRANSLATABLE STRINGS — Navbar
// ─────────────────────────────────────────────────────────
const DEFAULT_STRINGS = {
  // Search
  searchPlaceholder:      "Search",
  popularSearches:        "POPULAR SEARCHES",
  // Panel titles
  myAccount:              "My Account",
  quickLogin:             "Quick Login",
  createAccount:          "Create New Account",
  resetPassword:          "Reset Password",
  verifyOtp:              "Verify OTP",
  setNewPassword:         "Set New Password",
  // Login
  loginSub:               "Sign in to return to what you've chosen for today — your orders, wishlist, and exclusive offers.",
  emailLabel:             "EMAIL*",
  passwordLabel:          "PASSWORD*",
  emailPlaceholder:       "your@email.com",
  passwordPlaceholder:    "••••••••",
  forgotPassword:         "Forgot password?",
  rememberMe:             "Remember me",
  loggingIn:              "LOGGING IN...",
  logIn:                  "LOG IN",
  createAccountBtn:       "CREATE ACCOUNT",
  // Register
  registerSub:            "Create your account to stay close to new collections and updates designed for today.",
  titleLabel:             "TITLE",
  firstNameLabel:         "FIRST NAME*",
  lastNameLabel:          "LAST NAME*",
  firstNamePlaceholder:   "Insert your name",
  lastNamePlaceholder:    "Insert your last name",
  confirmPasswordLabel:   "CONFIRM PASSWORD*",
  createPasswordPlaceholder: "Create a password",
  confirmPasswordPlaceholder: "Confirm your password",
  creating:               "CREATING...",
  backToLogin:            "BACK TO LOGIN",
  // Forgot password
  forgotSub:              "Enter your registered email address. We'll send you a 6-digit OTP to reset your password.",
  sending:                "SENDING...",
  sendOtp:                "SEND OTP",
  // OTP
  otpSub1:                "We've sent a 6-digit OTP to",
  otpSub2:                "Please enter it below to continue.",
  otpLabel:               "OTP CODE*",
  otpPlaceholder:         "Enter 6-digit OTP",
  verifying:              "VERIFYING...",
  verifyOtpBtn:           "VERIFY OTP",
  resendOtp:              "Resend OTP",
  back:                   "BACK",
  // Reset password
  resetSub:               "Create a new password for your account.",
  newPasswordLabel:       "NEW PASSWORD*",
  confirmNewPasswordLabel:"CONFIRM NEW PASSWORD*",
  newPasswordPlaceholder: "Enter new password",
  confirmNewPasswordPlaceholder: "Confirm new password",
  resetting:              "RESETTING...",
  resetPasswordBtn:       "RESET PASSWORD",
  // Profile
  myOrders:               "My Orders",
  myWishlist:             "My Wishlist",
  accountSettings:        "Account Settings",
  viewAccount:            "VIEW ACCOUNT",
  logout:                 "LOGOUT",
  // Cart
  shoppingBag:            "Shopping Bag",
  product:                "Product",
  products:               "Products",
  cartEmpty:              "Your bag is empty",
  freeShipping:           "Congrats! You Unlocked Free Priority Shipping.",
  remove:                 "Remove",
  total:                  "Total",
  continueCheckout:       "CONTINUE CHECKOUT",
};

function flattenStrings(obj) {
  return Object.values(obj);
}

function rebuildStrings(keys, translations) {
  const result = {};
  keys.forEach((key, i) => {
    result[key] = translations[i] || DEFAULT_STRINGS[key];
  });
  return result;
}

// ─────────────────────────────────────────────────────────
//  TRANSLATION HOOK
// ─────────────────────────────────────────────────────────
function useTranslation() {
  const [strings, setStrings] = useState(DEFAULT_STRINGS);
  const [status,  setStatus]  = useState("idle");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setStatus("loading");

        const detectRes  = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const detectData = await detectRes.json();
        if (!detectData.success) throw new Error("Language detection failed");

        const { languageCode } = detectData;

        if (languageCode === "en") {
          if (!cancelled) setStatus("done");
          return;
        }

        const keys       = Object.keys(DEFAULT_STRINGS);
        const allStrings = flattenStrings(DEFAULT_STRINGS);

        const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            texts:          allStrings,
            targetLanguage: languageCode,
            sourceLanguage: "en",
          }),
        });

        const translateData = await translateRes.json();
        if (!translateData.success) throw new Error("Translation failed");

        if (!cancelled) {
          setStrings(rebuildStrings(keys, translateData.translations));
          setStatus("done");
        }
      } catch (err) {
        console.error("Navbar translation error:", err.message);
        if (!cancelled) setStatus("error");
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return { strings, status };
}

// ─────────────────────────────────────────────────────────
//  NAVBAR COMPONENT
// ─────────────────────────────────────────────────────────
const Navbar = () => {
  const { strings: T, status: tStatus } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [loginOpen,      setLoginOpen]      = useState(false);
  const [mode,           setMode]           = useState("login");
  const [showPassword,   setShowPassword]   = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const searchInputRef = useRef(null);

  const { user, loading: authLoading, login, register, logout } = useAuth();

  const [loginForm,    setLoginForm]    = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    title: "Mr.", firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
  });
  const [authError,        setAuthError]        = useState("");
  const [authLoaderActive, setAuthLoaderActive] = useState(false);

  // Forgot Password states
  const [forgotEmail,         setForgotEmail]         = useState("");
  const [otpValue,            setOtpValue]            = useState("");
  const [newPassword,         setNewPassword]         = useState("");
  const [confirmNewPassword,  setConfirmNewPassword]  = useState("");
  const [showNewPwd,          setShowNewPwd]          = useState(false);
  const [showConfirmNewPwd,   setShowConfirmNewPwd]   = useState(false);
  const [resetMsg,            setResetMsg]            = useState("");

  const {
    cartItems,
    cartOpen,
    setCartOpen,
    updateQty,
    removeFromCart,
  } = useCart();
  const { wishlistCount } = useWishlist();

  const totalItems = cartItems.reduce((sum, item) => sum + (item.qty ?? 1), 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = item.newPrice ?? item.price ?? 0;
    return sum + price * (item.qty ?? 1);
  }, 0);

  useEffect(() => {
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener("open-cart-drawer", handleOpenCart);
    return () => window.removeEventListener("open-cart-drawer", handleOpenCart);
  }, [setCartOpen]);

  useEffect(() => {
    const isOpen = searchOpen || loginOpen || cartOpen || mobileMenuOpen;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [searchOpen, loginOpen, cartOpen, mobileMenuOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const handleOpenLoginPanel = () => {
    setAuthError("");
    setResetMsg("");
    setMode(user ? "profile" : "login");
    setLoginOpen(true);
  };

  const scrollToTop = () =>
    typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" });

  const closeAll = () => {
    setSearchOpen(false);
    setLoginOpen(false);
    setCartOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const getImgSrc = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const handleLogin = async () => {
    setAuthError("");
    if (!loginForm.email || !loginForm.password) {
      setAuthError("Please fill in all fields.");
      return;
    }
    setAuthLoaderActive(true);
    const result = await login(loginForm.email, loginForm.password);
    setAuthLoaderActive(false);

    if (result.success) {
      setLoginOpen(false);
      setLoginForm({ email: "", password: "" });
    } else {
      if (result.userNotFound) {
        setMode("register");
        setRegisterForm(prev => ({ ...prev, email: loginForm.email }));
        setAuthError("No account found. Please create one below.");
      } else {
        setAuthError(result.message || "Login failed.");
      }
    }
  };

  const handleRegister = async () => {
    setAuthError("");
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

    setAuthLoaderActive(true);
    const result = await register({ title, firstName, lastName, email, password });
    setAuthLoaderActive(false);

    if (result.success) {
      setLoginOpen(false);
      setRegisterForm({
        title: "Mr.", firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
      });
    } else {
      if (result.userExists) {
        setMode("login");
        setLoginForm(prev => ({ ...prev, email: registerForm.email }));
        setAuthError("Account already exists. Please login.");
      } else {
        setAuthError(result.message || "Registration failed.");
      }
    }
  };

  const handleLogout = () => {
    logout();
    setLoginOpen(false);
  };

  const handleForgotPassword = async () => {
    setAuthError("");
    setResetMsg("");
    if (!forgotEmail) {
      setAuthError("Please enter your email.");
      return;
    }
    setAuthLoaderActive(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setAuthLoaderActive(false);
      if (data.success) {
        setResetMsg(data.message);
        setMode("forgot-otp");
      } else {
        setAuthError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setAuthLoaderActive(false);
      setAuthError("Server error. Please try again.");
    }
  };

  const handleVerifyOTP = async () => {
    setAuthError("");
    if (!otpValue || otpValue.length !== 6) {
      setAuthError("Please enter the 6-digit OTP.");
      return;
    }
    setAuthLoaderActive(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: forgotEmail, otp: otpValue }),
      });
      const data = await res.json();
      setAuthLoaderActive(false);
      if (data.success) {
        setResetMsg("");
        setMode("forgot-reset");
      } else {
        setAuthError(data.message || "Invalid OTP.");
      }
    } catch (err) {
      setAuthLoaderActive(false);
      setAuthError("Server error. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    setAuthError("");
    if (!newPassword || !confirmNewPassword) {
      setAuthError("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    setAuthLoaderActive(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: forgotEmail, otp: otpValue, newPassword }),
      });
      const data = await res.json();
      setAuthLoaderActive(false);
      if (data.success) {
        setLoginForm(prev => ({ ...prev, email: forgotEmail, password: "" }));
        setForgotEmail("");
        setOtpValue("");
        setNewPassword("");
        setConfirmNewPassword("");
        setAuthError("");
        setResetMsg("Password reset successfully! Please login.");
        setMode("login");
      } else {
        setAuthError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setAuthLoaderActive(false);
      setAuthError("Server error. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    setAuthError("");
    setAuthLoaderActive(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setAuthLoaderActive(false);
      if (data.success) {
        setResetMsg("OTP resent successfully.");
      } else {
        setAuthError(data.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setAuthLoaderActive(false);
      setAuthError("Server error. Please try again.");
    }
  };

  // Panel title helper
  const getPanelTitle = () => {
    if (user) return T.myAccount;
    switch (mode) {
      case "login":        return T.quickLogin;
      case "register":     return T.createAccount;
      case "forgot-email": return T.resetPassword;
      case "forgot-otp":   return T.verifyOtp;
      case "forgot-reset": return T.setNewPassword;
      default:             return "";
    }
  };

  return (
    <>
      <header className="nb-header">
        <div className="nb-wrap">

          <div className="nb-logo">
            <Link href="/" onClick={scrollToTop}>
              <Image src="/logo.png" alt="Brand Logo" width={200} height={56} priority />
            </Link>
          </div>

          <nav>
            <ul className="nb-links">
              {menuItems.filter(item => item !== "JEWELLERY").map((item) => {
                const slug = slugOverrides[item] ?? item.toLowerCase().replace(/\s+/g, "-");
                const href = collectionItems.includes(item)
                  ? `/product-category/${slug}` : `/${slug}`;
                return (
                  <li key={item}>
                    <Link href={href} onClick={scrollToTop}>{item}</Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="nb-icons">
            <button className="nb-icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button
              className="nb-icon-btn"
              aria-label="Login"
              onClick={handleOpenLoginPanel}
              title={user ? `${user.firstName} ${user.lastName}` : T.quickLogin}
            >
              {user ? (
                <span className="nb-user-avatar">
                  {user.firstName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </button>

            <Link href="/wishlist" className="nb-icon-btn" aria-label="Wishlist" style={{ position: 'relative' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="nb-cart-badge">{wishlistCount}</span>
              )}
            </Link>

            <button className="nb-icon-btn nb-cart-icon-btn" aria-label="Cart"
              onClick={() => setCartOpen(true)}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="nb-cart-badge">{totalItems}</span>
              )}
            </button>

            <button
              className={`nb-hamburger ${mobileMenuOpen ? "open" : ""}`}
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(prev => !prev)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="nb-mobile-overlay" onClick={closeMobileMenu} />
      )}

      <div className={`nb-mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        {menuItems.filter(item => item !== "JEWELLERY").map((item) => {
          const slug = slugOverrides[item] ?? item.toLowerCase().replace(/\s+/g, "-");
          const href = collectionItems.includes(item) ? `/product-category/${slug}` : `/${slug}`;
          return (
            <Link key={item} href={href}
              onClick={() => { scrollToTop(); setMobileMenuOpen(false); }}>
              {item}
            </Link>
          );
        })}
      </div>

      <div
        className={`nb-backdrop ${(loginOpen || cartOpen) ? "visible" : ""}`}
        onClick={closeAll}
      />

      {/* ══ SEARCH OVERLAY ══ */}
      <div className={`nb-search-overlay ${searchOpen ? "visible" : ""}`}>
        <button className="nb-search-close" onClick={() => setSearchOpen(false)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
          CLOSE
        </button>
        <div className="nb-search-inner">
          <div className="nb-search-box">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={T.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
            />
          </div>
          <div className="nb-popular">
            <h4>{T.popularSearches}</h4>
            <div className="nb-popular-tags">
              {popularSearches.map((tag) => (
                <button key={tag} className="nb-popular-tag"
                  onClick={() => setSearchQuery(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ LOGIN / REGISTER / PROFILE / FORGOT PASSWORD PANEL ══ */}
      <div className={`nb-panel ${loginOpen ? "visible" : ""}`}>
        <div className="nb-panel-header">
          <span className="nb-panel-title">{getPanelTitle()}</span>
          <button className="nb-panel-close" onClick={() => setLoginOpen(false)}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="nb-panel-body">

          {authError && (
            <div className="nb-auth-error">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {authError}
            </div>
          )}

          {/* ── PROFILE ── */}
          {user ? (
            <>
              <div className="nb-profile-welcome">
                <div className="nb-profile-avatar-lg">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="nb-profile-name">
                    {user.title} {user.firstName} {user.lastName}
                  </p>
                  <p className="nb-profile-email">{user.email}</p>
                </div>
              </div>

              <div className="nb-profile-links">
                <Link href="/orders" className="nb-profile-link" onClick={() => setLoginOpen(false)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {T.myOrders}
                </Link>
                <Link href="/wishlist" className="nb-profile-link" onClick={() => setLoginOpen(false)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {T.myWishlist}
                </Link>
                <Link href="/my-account" className="nb-profile-link" onClick={() => setLoginOpen(false)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {T.accountSettings}
                </Link>
              </div>

              <Link href="/my-account" className="nb-btn-outline nb-logout-btn" onClick={() => setLoginOpen(false)}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {T.viewAccount}
              </Link>

              <button className="nb-btn-outline nb-logout-btn" onClick={handleLogout}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {T.logout}
              </button>
            </>

          ) : mode === "login" ? (
            <>
              <p className="nb-login-sub">{T.loginSub}</p>

              {resetMsg && <div className="nb-auth-success">{resetMsg}</div>}

              <label className="nb-form-label">{T.emailLabel}</label>
              <input
                className="nb-form-input"
                type="email"
                placeholder={T.emailPlaceholder}
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <label className="nb-form-label">{T.passwordLabel}</label>
              <div className="nb-input-wrap">
                <input
                  className="nb-form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder={T.passwordPlaceholder}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button className="nb-eye-btn" type="button" onClick={() => setShowPassword(p => !p)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <div className="nb-forgot-row">
                <a href="#" className="nb-forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthError(""); setResetMsg("");
                    setForgotEmail(loginForm.email || "");
                    setMode("forgot-email");
                  }}>
                  {T.forgotPassword}
                </a>
                <label className="nb-remember"><input type="checkbox" /> {T.rememberMe}</label>
              </div>
              <button className="nb-btn-primary" onClick={handleLogin} disabled={authLoaderActive}>
                {authLoaderActive ? T.loggingIn : T.logIn}
              </button>
              <div className="nb-divider"><span>or</span></div>
              <button className="nb-btn-outline" onClick={() => { setMode("register"); setAuthError(""); setResetMsg(""); }}>
                {T.createAccountBtn}
              </button>
            </>

          ) : mode === "register" ? (
            <>
              <p className="nb-register-sub">{T.registerSub}</p>

              <label className="nb-form-label">{T.titleLabel}</label>
              <select
                className="nb-form-select"
                value={registerForm.title}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, title: e.target.value }))}
              >
                <option>Mr.</option><option>Ms.</option>
                <option>Mrs.</option><option>Dr.</option>
              </select>

              <label className="nb-form-label">{T.firstNameLabel}</label>
              <input
                className="nb-form-input"
                type="text"
                placeholder={T.firstNamePlaceholder}
                value={registerForm.firstName}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
              />
              <label className="nb-form-label">{T.lastNameLabel}</label>
              <input
                className="nb-form-input"
                type="text"
                placeholder={T.lastNamePlaceholder}
                value={registerForm.lastName}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
              />
              <label className="nb-form-label">{T.emailLabel}</label>
              <input
                className="nb-form-input"
                type="email"
                placeholder={T.emailPlaceholder}
                value={registerForm.email}
                onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
              />
              <label className="nb-form-label">{T.passwordLabel}</label>
              <div className="nb-input-wrap">
                <input
                  className="nb-form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder={T.createPasswordPlaceholder}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                />
                <button className="nb-eye-btn" type="button" onClick={() => setShowPassword(p => !p)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <label className="nb-form-label">{T.confirmPasswordLabel}</label>
              <div className="nb-input-wrap">
                <input
                  className="nb-form-input"
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder={T.confirmPasswordPlaceholder}
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
                <button className="nb-eye-btn" type="button" onClick={() => setShowConfirmPwd(p => !p)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <button className="nb-btn-primary" style={{ marginTop: 28 }} onClick={handleRegister} disabled={authLoaderActive}>
                {authLoaderActive ? T.creating : T.createAccountBtn}
              </button>
              <button className="nb-btn-outline" onClick={() => { setMode("login"); setAuthError(""); }}>
                {T.backToLogin}
              </button>
            </>

          ) : mode === "forgot-email" ? (
            <>
              <p className="nb-login-sub">{T.forgotSub}</p>
              {resetMsg && <div className="nb-auth-success">{resetMsg}</div>}

              <label className="nb-form-label">{T.emailLabel}</label>
              <input
                className="nb-form-input"
                type="email"
                placeholder={T.emailPlaceholder}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
              />
              <button className="nb-btn-primary" onClick={handleForgotPassword} disabled={authLoaderActive}>
                {authLoaderActive ? T.sending : T.sendOtp}
              </button>
              <button className="nb-btn-outline" onClick={() => { setMode("login"); setAuthError(""); setResetMsg(""); }}>
                {T.backToLogin}
              </button>
            </>

          ) : mode === "forgot-otp" ? (
            <>
              <p className="nb-login-sub">
                {T.otpSub1} <strong>{forgotEmail}</strong>. {T.otpSub2}
              </p>
              {resetMsg && <div className="nb-auth-success">{resetMsg}</div>}

              <label className="nb-form-label">{T.otpLabel}</label>
              <input
                className="nb-form-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={T.otpPlaceholder}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
              />
              <button className="nb-btn-primary" onClick={handleVerifyOTP} disabled={authLoaderActive}>
                {authLoaderActive ? T.verifying : T.verifyOtpBtn}
              </button>
              <div className="nb-forgot-row">
                <a href="#" className="nb-forgot-link"
                  onClick={(e) => { e.preventDefault(); handleResendOTP(); }}>
                  {T.resendOtp}
                </a>
              </div>
              <button className="nb-btn-outline"
                onClick={() => { setMode("forgot-email"); setAuthError(""); setResetMsg(""); }}>
                {T.back}
              </button>
            </>

          ) : mode === "forgot-reset" ? (
            <>
              <p className="nb-login-sub">{T.resetSub}</p>

              <label className="nb-form-label">{T.newPasswordLabel}</label>
              <div className="nb-input-wrap">
                <input
                  className="nb-form-input"
                  type={showNewPwd ? "text" : "password"}
                  placeholder={T.newPasswordPlaceholder}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button className="nb-eye-btn" type="button" onClick={() => setShowNewPwd(p => !p)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>

              <label className="nb-form-label">{T.confirmNewPasswordLabel}</label>
              <div className="nb-input-wrap">
                <input
                  className="nb-form-input"
                  type={showConfirmNewPwd ? "text" : "password"}
                  placeholder={T.confirmNewPasswordPlaceholder}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                />
                <button className="nb-eye-btn" type="button" onClick={() => setShowConfirmNewPwd(p => !p)}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>

              <button className="nb-btn-primary" style={{ marginTop: 28 }} onClick={handleResetPassword} disabled={authLoaderActive}>
                {authLoaderActive ? T.resetting : T.resetPasswordBtn}
              </button>
            </>

          ) : null}
        </div>
      </div>

      {/* ══ CART PANEL ══ */}
      <div className={`nb-panel nb-cart-panel ${cartOpen ? "visible" : ""}`}>
        <div className="nb-panel-header">
          <span className="nb-panel-title">
            {T.shoppingBag}
            {totalItems > 0 && (
              <span className="nb-cart-count-label">
                {totalItems} {totalItems > 1 ? T.products : T.product}
              </span>
            )}
          </span>
          <button className="nb-panel-close" onClick={() => setCartOpen(false)}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="nb-panel-body nb-cart-body">
          {cartItems.length === 0 ? (
            <div className="nb-cart-empty">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>{T.cartEmpty}</p>
            </div>
          ) : (
            <>
              <div className="nb-cart-delivery">
                <p className="nb-cart-delivery-title">{T.freeShipping}</p>
              </div>

              <div className="nb-cart-items">
                {cartItems.map((item, idx) => {
                  const title  = item.title || item.name || "Produit";
                  const price  = item.newPrice ?? item.price ?? 0;
                  const qty    = item.qty ?? 1;
                  const rawImg = Array.isArray(item.images) && item.images.length > 0
                    ? item.images[0] : item.img ?? null;
                  const itemKey = `${item._id}-${item.variantId ?? ""}-${item.metal ?? ""}-${idx}`;

                  return (
                    <div key={itemKey} className="nb-cart-item">
                      <div className="nb-cart-item-img">
                        <img
                          src={getImgSrc(rawImg)}
                          alt={title}
                          onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                        />
                      </div>
                      <div className="nb-cart-item-info">
                        <div className="nb-cart-item-top">
                          <div>
                            <p className="nb-cart-item-name">{title}</p>
                          </div>
                          <p className="nb-cart-item-price">
                            €{(price * qty).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="nb-cart-item-bottom">
                          <button
                            className="nb-cart-remove-btn"
                            onClick={() => removeFromCart(item._id, item.variantId, item.metal)}
                          >
                            {T.remove}
                          </button>
                          <div className="nb-cart-qty-ctrl">
                            <button onClick={() => updateQty(item._id, Math.max(1, qty - 1), item.variantId, item.metal)}>−</button>
                            <span>{qty}</span>
                            <button onClick={() => updateQty(item._id, qty + 1, item.variantId, item.metal)}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="nb-cart-footer">
                <div className="nb-cart-total-row">
                  <span>{T.total}</span>
                  <span>€{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <Link href="/checkout" className="nb-cart-checkout-btn" onClick={() => setCartOpen(false)}>
                  {T.continueCheckout}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;