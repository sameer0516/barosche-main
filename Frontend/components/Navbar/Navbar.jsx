"use client";

import "./Navbar.css";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../../app/context/CartContext";
import { useAuth } from "../../app/context/AuthContext";
import { useWishlist } from "../../app/context/WishlistContext";
import { useCurrency } from "../../app/context/CurrencyContext";

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

const searchCategories = [
  { name: "Jewellery", href: "/product-category/jewellery" },
  { name: "Rings",     href: "/product-category/rings" },
  { name: "Earrings",  href: "/product-category/earrings" },
  { name: "Pendants",  href: "/product-category/pendants" },
  { name: "Bracelets", href: "/product-category/bracelets" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_STRINGS = {
  searchPlaceholder:      "Search",
  popularSearches:        "POPULAR SEARCHES",
  myAccount:              "My Account",
  quickLogin:             "Quick Login",
  loginSub:               "Enter your email — we'll send you a 6-digit OTP to sign in or create your account.",
  emailLabel:              "EMAIL*",
  emailPlaceholder:        "your@email.com",
  sending:                 "SENDING...",
  sendOtp:                 "SEND OTP",
  otpSub1:                 "We've sent a 6-digit OTP to",
  otpSub2:                 "Please enter it below to continue.",
  otpLabel:                "OTP CODE*",
  otpPlaceholder:          "Enter 6-digit OTP",
  verifying:               "VERIFYING...",
  verifyOtpBtn:            "VERIFY OTP",
  resendOtp:               "Resend OTP",
  back:                    "BACK",
  myOrders:                "My Orders",
  myWishlist:               "My Wishlist",
  accountSettings:          "Account Settings",
  viewAccount:              "VIEW ACCOUNT",
  logout:                   "LOGOUT",
  shoppingBag:              "Shopping Bag",
  product:                  "Product",
  products:                 "Products",
  cartEmpty:                "Your bag is empty",
  freeShipping:             "Congrats! You Unlocked Free Priority Shipping.",
  remove:                   "Remove",
  total:                    "Total",
  continueCheckout:         "CONTINUE CHECKOUT",
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

function getUserInitial(user) {
  const source = user?.firstName || user?.lastName || user?.email || "U";
  return String(source).charAt(0).toUpperCase();
}

function getUserDisplayName(user) {
  const parts = [user?.title, user?.firstName, user?.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : (user?.email || "");
}

const Navbar = () => {
  const { strings: T, status: tStatus } = useTranslation();
  const { currency, formatPrice } = useCurrency();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [loginOpen,      setLoginOpen]      = useState(false);
  const [mode,           setMode]           = useState("email");
  const [searchQuery,    setSearchQuery]    = useState("");
  const searchInputRef = useRef(null);

  const { user, loading: authLoading, setSession, logout } = useAuth();

  const [emailInput,       setEmailInput]       = useState("");
  const [otpValue,         setOtpValue]         = useState("");
  const [authError,        setAuthError]        = useState("");
  const [authLoaderActive, setAuthLoaderActive] = useState(false);
  const [resetMsg,         setResetMsg]         = useState("");

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
    const handleOpenLogin = () => {
      if (!user) {
        setAuthError("");
        setResetMsg("");
        setMode("email");
        setLoginOpen(true);
      }
    };
    window.addEventListener("open-login-panel", handleOpenLogin);
    return () => window.removeEventListener("open-login-panel", handleOpenLogin);
  }, [user]);

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

  const resetAuthPanel = () => {
    setEmailInput("");
    setOtpValue("");
    setAuthError("");
    setResetMsg("");
  };

  const handleOpenLoginPanel = () => {
    setAuthError("");
    setResetMsg("");
    setMode(user ? "profile" : "email");
    setLoginOpen(true);
  };

  const handleWishlistIconClick = (e) => {
    if (!user) {
      e.preventDefault();
      setAuthError("");
      setResetMsg("");
      setMode("email");
      setLoginOpen(true);
    }
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

  const getProductHref = (item) => {
    const category =
      item.category || item.categorySlug || item.categoryName || "";
    const productSlug =
      item.slug || item.urlHandle || item.handle || "";

    if (!category || !productSlug) return null;

    const categorySlug = category.toString().toLowerCase().replace(/\s+/g, "-");
    return `/product-category/${categorySlug}/${productSlug}`;
  };

  const navigateFromSearch = () => {
    const query = searchQuery.trim().toLowerCase();

    let target = null;
    if (query) {
      target = searchCategories.find((cat) => cat.name.toLowerCase() === query);

      if (!target) {
        target = searchCategories.find((cat) => cat.name.toLowerCase().startsWith(query));
      }

      if (!target) {
        target = searchCategories.find((cat) => query.startsWith(cat.name.toLowerCase()));
      }

      if (!target) {
        const substringMatches = searchCategories.filter((cat) =>
          query.includes(cat.name.toLowerCase()) || cat.name.toLowerCase().includes(query)
        );
        if (substringMatches.length > 0) {
          target = substringMatches.reduce((longest, cat) =>
            cat.name.length > longest.name.length ? cat : longest
          );
        }
      }
    }

    const href = target ? target.href : searchCategories[0].href;

    setSearchOpen(false);
    setSearchQuery("");
    scrollToTop();
    router.push(href);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      navigateFromSearch();
    }
  };

  const handleRequestOTP = async () => {
    setAuthError("");
    setResetMsg("");
    if (!emailInput) {
      setAuthError("Please enter your email.");
      return;
    }

    setAuthLoaderActive(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/request-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: emailInput }),
      });
      const data = await res.json();
      setAuthLoaderActive(false);

      if (data.success) {
        setResetMsg(data.message);
        setMode("otp");
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
    let data;
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: emailInput, otp: otpValue }),
      });
      data = await res.json();
    } catch (err) {
      setAuthLoaderActive(false);
      setAuthError("Server error. Please try again.");
      return;
    }

    setAuthLoaderActive(false);

    if (!data.success) {
      setAuthError(data.message || "Invalid OTP.");
      return;
    }
    setSession(data.token, data.user);
    setLoginOpen(false);
    resetAuthPanel();
    setMode("email");
  };

  const handleResendOTP = async () => {
    setAuthError("");
    setAuthLoaderActive(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: emailInput }),
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

  const handleLogout = () => {
    logout();
    setLoginOpen(false);
  };

  const getPanelTitle = () => {
    if (user) return T.myAccount;
    switch (mode) {
      case "email": return T.quickLogin;
      case "otp":   return "Verify OTP";
      default:      return "";
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
              title={user ? getUserDisplayName(user) : T.quickLogin}
            >
              {user ? (
                <span className="nb-user-avatar">
                  {getUserInitial(user)}
                </span>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </button>

            <Link
              href="/wishlist"
              className="nb-icon-btn"
              aria-label="Wishlist"
              style={{ position: 'relative' }}
              onClick={handleWishlistIconClick}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {user && wishlistCount > 0 && (
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
            <button
              type="button"
              aria-label="Search"
              onClick={navigateFromSearch}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex" }}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={T.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <div className="nb-popular">
            <p>{T.popularSearches}</p>
            <div className="nb-popular-tags">
              {searchCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="nb-popular-tag"
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); scrollToTop(); }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ LOGIN (EMAIL-OTP) / PROFILE PANEL ══ */}
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
                  {getUserInitial(user)}
                </div>
                <div>
                  <p className="nb-profile-name">
                    {getUserDisplayName(user)}
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

          ) : mode === "email" ? (
            <>
              <p className="nb-login-sub">{T.loginSub}</p>

              {resetMsg && <div className="nb-auth-success">{resetMsg}</div>}

              <label className="nb-form-label">{T.emailLabel}</label>
              <input
                className="nb-form-input"
                type="email"
                placeholder={T.emailPlaceholder}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRequestOTP()}
              />

              <button className="nb-btn-primary" onClick={handleRequestOTP} disabled={authLoaderActive}>
                {authLoaderActive ? T.sending : T.sendOtp}
              </button>
            </>

          ) : mode === "otp" ? (
            <>
              <p className="nb-login-sub">
                {T.otpSub1} <strong>{emailInput}</strong>. {T.otpSub2}
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
                onClick={() => { setMode("email"); setAuthError(""); setResetMsg(""); }}>
                {T.back}
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

                  const productHref = getProductHref(item);

                  return (
                    <div key={itemKey} className="nb-cart-item">
                      {productHref ? (
                        <Link
                          href={productHref}
                          className="nb-cart-item-link"
                          style={{ display: "contents" }}
                          onClick={() => setCartOpen(false)}
                        >
                          <div className="nb-cart-item-img">
                            <img
                              src={getImgSrc(rawImg)}
                              alt={title}
                              width={80}
                              height={80}
                              onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                            />
                          </div>
                          <div className="nb-cart-item-info">
                            <div className="nb-cart-item-top">
                              <div>
                                <p className="nb-cart-item-name">{title}</p>
                              </div>
                              <p className="nb-cart-item-price">
                                {formatPrice(price * qty, currency)}
                              </p>
                            </div>
                            <div className="nb-cart-item-bottom">
                              <button
                                className="nb-cart-remove-btn"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeFromCart(item._id, item.variantId, item.metal);
                                }}
                              >
                                {T.remove}
                              </button>
                              <div className="nb-cart-qty-ctrl">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQty(item._id, Math.max(1, qty - 1), item.variantId, item.metal);
                                  }}
                                >
                                  −
                                </button>
                                <span>{qty}</span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    updateQty(item._id, qty + 1, item.variantId, item.metal);
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <>
                          <div className="nb-cart-item-img">
                            <img
                              src={getImgSrc(rawImg)}
                              alt={title}
                              width={80}
                              height={80}
                              onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                            />
                          </div>
                          <div className="nb-cart-item-info">
                            <div className="nb-cart-item-top">
                              <div>
                                <p className="nb-cart-item-name">{title}</p>
                              </div>
                              <p className="nb-cart-item-price">
                                {formatPrice(price * qty, currency)}
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
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="nb-cart-footer">
                <div className="nb-cart-total-row">
                  <span>{T.total}</span>
                  <span>{formatPrice(totalPrice, currency)}</span>
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