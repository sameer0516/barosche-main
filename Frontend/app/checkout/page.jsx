"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    PaymentRequestButtonElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "../context/CartContext";
import { Country, State } from "country-state-city";
import "./checkout.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";
const PENDING_ORDER_KEY = "barosche_pending_checkout";

const formatPrice = (val) =>
    typeof val === "number"
        ? new Intl.NumberFormat("en-DE", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
        }).format(val)
        : "€0";

const getImgSrc = (path) => {
    if (!path) return "/placeholder.jpg";
    return path.startsWith("http") ? path : `${API_URL}${path}`;
};

const getBrowserId = () =>
    (typeof window !== "undefined" &&
        (localStorage.getItem("browserId") || sessionStorage.getItem("browserId"))) ||
    `browser_${Date.now()}`;

const getLoggedInUserId = () => {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?._id || parsed?.userId || parsed?.id || null;
    } catch {
        return null;
    }
};

const mapCartItems = (cartItems) =>
    cartItems.map((item) => ({
        productId: item._id || item.id || item.productId || item.cartId,
        name: item.title || item.name,
        image:
            Array.isArray(item.images) && item.images.length > 0
                ? item.images[0]
                : item.img || item.image || "",
        price: parseFloat(item.newPrice ?? item.price ?? 0),
        quantity: parseInt(item.qty ?? item.quantity ?? 1),
        size: item.size || undefined,
    }));

const savePendingCheckout = (customerInfo, cartItems, subtotal) => {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(
            PENDING_ORDER_KEY,
            JSON.stringify({ customerInfo, items: mapCartItems(cartItems), subtotal })
        );
    } catch (e) {
        console.error("Could not persist pending checkout:", e);
    }
};

const loadPendingCheckout = () => {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const clearPendingCheckout = () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(PENDING_ORDER_KEY);
};

// ─── Pincode → Address Auto-Detect Helper (India Post API) ───
// Works for Indian 6-digit PIN codes. Free, no API key required.
const fetchAddressFromPincode = async (pincode) => {
    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();
        if (
            Array.isArray(data) &&
            data[0]?.Status === "Success" &&
            Array.isArray(data[0]?.PostOffice) &&
            data[0].PostOffice.length > 0
        ) {
            const po = data[0].PostOffice[0];
            return {
                city: po.District || po.Block || po.Name || "",
                stateName: po.State || "",
                country: "IN",
            };
        }
        return null;
    } catch (err) {
        console.error("Pincode lookup failed:", err);
        return null;
    }
};

// ─── Google Pay / Apple Pay via Stripe PaymentRequest ───
const GoogleApplePayButton = ({ subtotal, cartItems, customerInfo, onSuccess, onError }) => {
    const stripe = useStripe();
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!stripe || subtotal <= 0) { setChecked(true); return; }
        const pr = stripe.paymentRequest({
            country: "DE",
            currency: "eur",
            total: { label: "Barosche", amount: Math.round(subtotal * 100) },
            requestPayerName: true,
            requestPayerEmail: true,
            requestPayerPhone: true,
        });

        pr.canMakePayment().then((result) => {
            setChecked(true);
            if (result) setPaymentRequest(pr);
        });

        pr.on("paymentmethod", async (ev) => {
            try {
                const intentRes = await fetch(`${API_URL}/api/payment/create-intent`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: Math.round(subtotal * 100),
                        paymentMethodTypes: ["card"],
                        customerInfo: customerInfo || {
                            email: ev.payerEmail || "",
                            firstName: ev.payerName?.split(" ")[0] || "",
                            lastName: ev.payerName?.split(" ").slice(1).join(" ") || "",
                        },
                        items: mapCartItems(cartItems),
                        browserId: getBrowserId(),
                    }),
                });
                const intentData = await intentRes.json();
                if (!intentData.clientSecret) {
                    ev.complete("fail");
                    onError?.("Could not initialize payment.");
                    return;
                }

                const { error, paymentIntent } = await stripe.confirmCardPayment(
                    intentData.clientSecret,
                    { payment_method: ev.paymentMethod.id },
                    { handleActions: false }
                );

                if (error) {
                    ev.complete("fail");
                    onError?.(error.message);
                    return;
                }

                ev.complete("success");

                let finalIntent = paymentIntent;
                if (paymentIntent.status === "requires_action") {
                    const result = await stripe.confirmCardPayment(intentData.clientSecret);
                    if (result.error) {
                        onError?.(result.error.message);
                        return;
                    }
                    finalIntent = result.paymentIntent;
                }

                if (finalIntent.status !== "succeeded") {
                    onError?.(`Payment status: ${finalIntent.status}. Please try again.`);
                    return;
                }

                const builtCustomerInfo = customerInfo || {
                    email: ev.payerEmail || "",
                    firstName: ev.payerName?.split(" ")[0] || "",
                    lastName: ev.payerName?.split(" ").slice(1).join(" ") || "",
                    phone: ev.payerPhone || "",
                    country: "DE",
                    streetAddress1: ev.shippingAddress?.addressLine?.[0] || "",
                    city: ev.shippingAddress?.city || "",
                    state: ev.shippingAddress?.region || "",
                    zip: ev.shippingAddress?.postalCode || "",
                };

                const saveRes = await fetch(`${API_URL}/api/payment/confirm-intent`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        paymentIntentId: finalIntent.id,
                        browserId: getBrowserId(),
                        userId: getLoggedInUserId(),
                        customerInfo: builtCustomerInfo,
                        items: mapCartItems(cartItems),
                    }),
                });
                const saveData = await saveRes.json();
                if (saveData.success) onSuccess(saveData);
                else onError?.(saveData.message || "Order save failed");
            } catch (err) {
                ev.complete("fail");
                onError?.(err.message || "Payment failed");
            }
        });

        return () => pr.off("paymentmethod");
    }, [stripe, subtotal]);

    if (!checked || !paymentRequest) return null;

    return (
        <PaymentRequestButtonElement
            options={{
                paymentRequest,
                style: {
                    paymentRequestButton: { type: "buy", theme: "dark", height: "48px" },
                },
            }}
        />
    );
};

// ─── PayPal Button ───
const PayPalButton = ({ subtotal, cartItems, customerInfo, onSuccess, onError }) => {
    const reactId = useId();
    const containerId = "paypal-container-" + reactId.replace(/:/g, "");
    const containerRef = useRef(null);
    const renderedRef = useRef(false);
    const [sdkReady, setSdkReady] = useState(false);
    const [sdkError, setSdkError] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.paypal) { setSdkReady(true); return; }

        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        if (!clientId || clientId === "test") { setSdkError(true); return; }

        if (document.querySelector(`script[src*="paypal.com/sdk"]`)) {
            const check = setInterval(() => {
                if (window.paypal) { setSdkReady(true); clearInterval(check); }
            }, 200);
            return () => clearInterval(check);
        }

        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&intent=capture&components=buttons&disable-funding=card,credit`;
        script.onload = () => setSdkReady(true);
        script.onerror = () => setSdkError(true);
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!sdkReady || !window.paypal) return;
        if (renderedRef.current) return;
        if (!containerRef.current) return;

        renderedRef.current = true;
        containerRef.current.innerHTML = "";

        try {
            window.paypal.Buttons({
                style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 48, tagline: false },
                createOrder: (data, actions) =>
                    actions.order.create({
                        purchase_units: [{
                            amount: { currency_code: "EUR", value: subtotal.toFixed(2) },
                            description: "Barosche Order",
                        }],
                        application_context: { shipping_preference: "NO_SHIPPING" },
                    }),
                onApprove: async (data, actions) => {
                    setIsProcessing(true);
                    try {
                        const details = await actions.order.capture();
                        const res = await fetch(`${API_URL}/api/payment/paypal-capture`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                paypalOrderId: details.id,
                                paypalPaymentId: details.purchase_units?.[0]?.payments?.captures?.[0]?.id || details.id,
                                amount: Math.round(subtotal * 100),
                                browserId: getBrowserId(),
                                userId: getLoggedInUserId(),
                                customerInfo: customerInfo || {},
                                items: mapCartItems(cartItems),
                            }),
                        });
                        const saved = await res.json();
                        if (saved.success) onSuccess(saved);
                        else throw new Error(saved.message || "Order save failed");
                    } catch (err) {
                        onError?.(err.message || "PayPal order save failed");
                    } finally {
                        setIsProcessing(false);
                    }
                },
                onError: (err) => {
                    console.error("PayPal error:", err);
                    onError?.("PayPal payment failed. Please try another method.");
                },
            }).render(containerRef.current);
        } catch (err) {
            console.error("PayPal render error:", err);
            renderedRef.current = false;
        }
    }, [sdkReady]);

    if (sdkError) return null;

    return (
        <div style={{ width: "100%", minHeight: "48px", position: "relative" }}>
            {isProcessing && (
                <div style={{
                    position: "absolute", inset: 0, background: "rgba(255,255,255,0.85)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10,
                }}>
                    <span style={{ fontSize: "13px" }}>Saving order…</span>
                </div>
            )}
            <div ref={containerRef} style={{ width: "100%", minHeight: "48px" }} />
        </div>
    );
};

const ExpressCheckoutSection = ({ subtotal, cartItems, customerInfo, onSuccess }) => {
    const [error, setError] = useState("");

    const handleError = (msg) => {
        setError(msg);
        setTimeout(() => setError(""), 6000);
    };

    if (subtotal <= 0) return null;

    return (
        <div style={{ marginBottom: "24px" }}>
            <p style={{
                fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase",
                color: "#767676", textAlign: "center", margin: "0 0 12px 0",
            }}>
                Express Checkout
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                <Elements
                    stripe={stripePromise}
                    options={{
                        mode: "payment",
                        amount: Math.max(Math.round(subtotal * 100), 50),
                        currency: "eur",
                    }}
                >
                    <GoogleApplePayButton
                        subtotal={subtotal}
                        cartItems={cartItems}
                        customerInfo={customerInfo}
                        onSuccess={onSuccess}
                        onError={handleError}
                    />
                </Elements>

                <PayPalButton
                    subtotal={subtotal}
                    cartItems={cartItems}
                    customerInfo={customerInfo}
                    onSuccess={onSuccess}
                    onError={handleError}
                />

                {error && (
                    <div style={{
                        background: "#fff5f5", border: "1px solid #ffcccc",
                        padding: "10px 14px", fontSize: "12px", color: "#c00000",
                    }}>
                        ⚠️ {error}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Stripe Payment Form (Card + Klarna ONLY) ───
const StripePaymentForm = ({ customerInfo, cartItems, subtotal, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePay = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setLoading(true);
        setError("");

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setError(submitError.message);
                setLoading(false);
                return;
            }

            savePendingCheckout(customerInfo, cartItems, subtotal);

            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: "if_required",
                confirmParams: {
                    return_url: `${typeof window !== "undefined" ? window.location.origin : ""}/checkout`,
                    payment_method_data: {
                        billing_details: {
                            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                            email: customerInfo.email,
                            phone: customerInfo.phone,
                            address: {
                                line1: customerInfo.streetAddress1,
                                line2: customerInfo.streetAddress2 || undefined,
                                city: customerInfo.city,
                                state: customerInfo.state,
                                postal_code: customerInfo.zip,
                                country: customerInfo.country,
                            },
                        },
                    },
                },
            });

            if (confirmError) {
                setError(confirmError.message);
                clearPendingCheckout();
                setLoading(false);
                return;
            }

            if (!paymentIntent) {
                setError("Payment could not be confirmed. Please try again.");
                setLoading(false);
                return;
            }

            if (paymentIntent.status === "succeeded") {
                await finalizeOrder(paymentIntent.id, customerInfo, cartItems, onSuccess, setError);
            } else if (paymentIntent.status === "processing") {
                setError("Your payment is processing. You'll receive a confirmation email shortly.");
            } else {
                setError(`Payment status: ${paymentIntent.status}. Please try again.`);
            }
        } catch (err) {
            setError(err.message || "Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handlePay} noValidate>
            <PaymentElement
                options={{
                    layout: { type: "tabs", defaultCollapsed: false },
                    paymentMethodOrder: ["card", "klarna"],
                    wallets: { googlePay: "never", applePay: "never" },
                }}
            />

            {error && (
                <div style={{
                    background: "#fff5f5", border: "1px solid #ffcccc",
                    padding: "12px 16px", fontSize: "13px", color: "#c00000", marginTop: "12px",
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                borderTop: "1px solid #e5e5e5", borderBottom: "1px solid #e5e5e5",
                padding: "16px 0", margin: "16px 0 8px",
            }}>
                <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
                    Total Due
                </span>
                <span style={{ fontSize: "18px", fontWeight: 600 }}>{formatPrice(subtotal)}</span>
            </div>

            <div className="bottom-action-container">
                <button
                    type="submit"
                    className="primary-submit-btn"
                    disabled={loading || !stripe}
                    style={{ opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                >
                    {loading ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                            <span style={{
                                width: 14, height: 14, border: "2px solid #ffffff66",
                                borderTopColor: "#fff", borderRadius: "50%",
                                display: "inline-block", animation: "spin 0.7s linear infinite",
                            }} />
                            PROCESSING…
                        </span>
                    ) : `PAY ${formatPrice(subtotal)}`}
                </button>
            </div>

            <p style={{ fontSize: "11px", color: "#767676", textAlign: "center", marginTop: "12px" }}>
                🔒 Your payment details are never stored on our servers
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>
    );
};

const finalizeOrder = async (paymentIntentId, customerInfo, cartItems, onSuccess, setError) => {
    try {
        const res = await fetch(`${API_URL}/api/payment/confirm-intent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                paymentIntentId,
                browserId: getBrowserId(),
                userId: getLoggedInUserId(),
                customerInfo,
                items: mapCartItems(cartItems),
                note: customerInfo?.note || "",
            }),
        });
        const data = await res.json();
        if (data.success) {
            clearPendingCheckout();
            onSuccess(data);
        } else {
            setError?.(data.message || "Order save failed. Please contact support with your payment ID: " + paymentIntentId);
        }
    } catch (err) {
        setError?.("Network error while saving your order. Please contact support with your payment ID: " + paymentIntentId);
    }
};

// ─── Main Checkout Component ───
const CheckoutInner = () => {
    const { cartItems, clearCart } = useCart();
    const [step, setStep] = useState("shipping");
    const [successData, setSuccessData] = useState(null);
    const [clientSecret, setClientSecret] = useState("");
    const [intentLoading, setIntentLoading] = useState(false);
    const [intentError, setIntentError] = useState("");
    const [recovering, setRecovering] = useState(false);

    const [formData, setFormData] = useState({
        email: "", firstName: "", lastName: "", phone: "",
        country: "DE", streetAddress1: "", streetAddress2: "",
        city: "", state: "", zip: "", note: "",
    });

    const [successItems, setSuccessItems] = useState([]);

    const [allCountries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);

    // ── Pincode auto-detect state ──
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [pincodeMsg, setPincodeMsg] = useState("");
    const pincodeTimerRef = useRef(null);
    const lastLookedUpPincode = useRef("");

    useEffect(() => {
        const s = State.getStatesOfCountry(formData.country);
        setStates(s);
        if (s.length > 0 && !s.find((st) => st.isoCode === formData.state)) {
            setFormData((prev) => ({ ...prev, state: s[0].isoCode }));
        } else if (s.length === 0) {
            setFormData((prev) => ({ ...prev, state: "" }));
        }
    }, [formData.country]);

    // ── Auto-detect city/state from PIN code (debounced) ──
    useEffect(() => {
        const raw = (formData.zip || "").trim();

        if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current);

        // Only run for Indian 6-digit numeric pincodes; skip if already looked up
        const isIndianPincode = /^[1-9][0-9]{5}$/.test(raw);
        if (!isIndianPincode) {
            setPincodeMsg("");
            return;
        }
        if (raw === lastLookedUpPincode.current) return;

        pincodeTimerRef.current = setTimeout(async () => {
            setPincodeLoading(true);
            setPincodeMsg("");
            const result = await fetchAddressFromPincode(raw);
            lastLookedUpPincode.current = raw;
            setPincodeLoading(false);

            if (!result) {
                setPincodeMsg("Could not detect address for this pincode.");
                return;
            }

            setFormData((prev) => {
                const next = { ...prev, country: "IN", city: result.city || prev.city };

                const statesForIN = State.getStatesOfCountry("IN");
                const matchedState = statesForIN.find(
                    (st) => st.name.toLowerCase() === result.stateName.toLowerCase()
                );
                if (matchedState) next.state = matchedState.isoCode;

                return next;
            });

            setPincodeMsg("Address detected ✓");
            setTimeout(() => setPincodeMsg(""), 3000);
        }, 500);

        return () => {
            if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current);
        };
    }, [formData.zip]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const raw = localStorage.getItem("userInfo") || localStorage.getItem("user");
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed?.email) {
                setFormData((prev) => ({
                    ...prev,
                    email: prev.email || parsed.email || "",
                    firstName: prev.firstName || parsed.firstName || "",
                    lastName: prev.lastName || parsed.lastName || "",
                    phone: prev.phone || parsed.phone || "",
                }));
            }
        } catch {
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const url = new URL(window.location.href);
        const redirectStatus = url.searchParams.get("redirect_status");
        const paymentIntentId = url.searchParams.get("payment_intent");

        if (!redirectStatus || !paymentIntentId) return;

        window.history.replaceState({}, "", url.pathname);

        if (redirectStatus !== "succeeded") {
            setIntentError(`Payment was not completed (status: ${redirectStatus}). Please try again.`);
            clearPendingCheckout();
            return;
        }

        const pending = loadPendingCheckout();
        if (!pending) {
            setRecovering(true);
            finalizeOrder(
                paymentIntentId,
                formData,
                cartItems,
                (data) => {
                    setSuccessItems([...cartItems]);
                    setSuccessData(data);
                    clearCart?.();
                    setStep("success");
                    setRecovering(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
                (msg) => { setIntentError(msg); setRecovering(false); }
            );
            return;
        }

        setRecovering(true);
        finalizeOrder(
            paymentIntentId,
            pending.customerInfo,
            pending.items.map((i) => ({ ...i, qty: i.quantity })),
            (data) => {
                setSuccessItems(pending.items.map((i) => ({ ...i, qty: i.quantity })));
                setSuccessData(data);
                clearCart?.();
                setStep("success");
                setRecovering(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
            (msg) => { setIntentError(msg); setRecovering(false); }
        );
    }, []);

    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.newPrice ?? item.price ?? 0;
        return sum + price * (item.qty ?? item.quantity ?? 1);
    }, 0);

    const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleShippingSubmit = async (e) => {
        e.preventDefault();
        const required = ["email", "firstName", "lastName", "phone", "streetAddress1", "city", "zip"];
        for (const f of required) {
            if (!formData[f]?.trim()) {
                alert(`Please fill in: ${f.replace(/([A-Z])/g, " $1").toLowerCase()}`);
                return;
            }
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            alert("Please enter a valid email address.");
            return;
        }

        setIntentLoading(true);
        setIntentError("");

        try {
            const res = await fetch(`${API_URL}/api/payment/create-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Math.round(subtotal * 100),
                    paymentMethodTypes: ["card", "klarna"],
                    customerInfo: formData,
                    items: mapCartItems(cartItems),
                    browserId: getBrowserId(),
                }),
            });
            const data = await res.json();
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setStep("payment");
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setIntentError(data.error || "Could not initialize payment. Please try again.");
            }
        } catch (err) {
            setIntentError("Network error. Please check your connection.");
        } finally {
            setIntentLoading(false);
        }
    };

    const handleSuccess = (data) => {
        setSuccessItems([...cartItems]);
        setSuccessData(data);
        clearCart?.();
        clearPendingCheckout();
        setStep("success");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // ── Sidebar ──
    const Sidebar = () => (
        <aside className="checkout-sidebar">
            <div className="sidebar-sticky-wrapper">
                <h2 className="sidebar-title">ORDER SUMMARY</h2>
                {cartItems.length === 0 ? (
                    <p className="empty-cart-msg">Your cart is empty.</p>
                ) : (
                    cartItems.map((item, idx) => {
                        const price = item.newPrice ?? item.price ?? 0;
                        const imgSrc =
                            Array.isArray(item.images) && item.images.length > 0
                                ? getImgSrc(item.images[0])
                                : getImgSrc(item.img || item.image);
                        return (
                            <div className="sidebar-product-item" key={`${item._id || item.id}-${idx}`}>
                                <div className="product-thumb-container">
                                    <img src={imgSrc} alt={item.title || item.name} className="product-thumb" />
                                </div>
                                <div className="sidebar-product-info">
                                    <h3>{item.title || item.name}</h3>
                                    {item.variantName && <p>Variant: {item.variantName}</p>}
                                    {item.stone && <p>Stone: {item.stone.name}</p>}
                                    {item.metal && <p>Metal: {item.metal === "gold" ? "Gold" : "Silver"}</p>}
                                    {item.size && <p>Size: {item.size}</p>}
                                    <div className="sidebar-qty-row">
                                        <span>Qty: {item.qty ?? item.quantity ?? 1}</span>
                                    </div>
                                </div>
                                <div className="sidebar-product-price">
                                    {formatPrice(price * (item.qty ?? item.quantity ?? 1))}
                                </div>
                            </div>
                        );
                    })
                )}
                <div className="summary-totals">
                    <div className="total-row"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                    <div className="total-row"><span>Shipping</span><span className="free-text">Free</span></div>
                    <hr className="summary-divider" />
                    <div className="total-row grand-total"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
                </div>
                <div className="trust-badges">
                    <div className="badge-item"><span className="badge-icon">🛡️</span> Insured Shipping</div>
                    <div className="badge-item"><span className="badge-icon">🔄</span> 30-Day Free Returns & Exchanges</div>
                    <div className="badge-item"><span className="badge-icon">🏬</span> 365-Day Warranty</div>
                    <div className="badge-item"><span className="badge-icon">🔒</span> Complimentary Shipping on Orders Above €200</div>
                </div>
            </div>
        </aside>
    );

    if (recovering) {
        return (
            <div className="checkout-container">
                <header className="checkout-header">
                    <Link href="/" className="checkout-logo"><span className="logo-text">BAROSCHE</span></Link>
                    <h1 className="main-title">CONFIRMING YOUR PAYMENT…</h1>
                </header>
                <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
                    <span style={{
                        width: 28, height: 28, border: "3px solid #e5e5e5",
                        borderTopColor: "#000", borderRadius: "50%",
                        display: "inline-block", animation: "spin 0.8s linear infinite",
                    }} />
                    <p style={{ marginTop: 18, fontSize: 13, color: "#767676" }}>
                        Please wait, we're finalizing your order…
                    </p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ── Success Screen ──
    if (step === "success" && successData) {
        return (
            <div className="checkout-container">
                <header className="checkout-header">
                    <Link href="/" className="checkout-logo"><span className="logo-text">BAROSCHE</span></Link>
                    <h1 className="main-title">ORDER CONFIRMED</h1>
                    <div className="breadcrumb" />
                </header>

                <div style={{ maxWidth: 560, margin: "60px auto", textAlign: "center", padding: "0 20px" }}>
                    <div style={{ fontSize: 48, marginBottom: 16, animation: "pop 0.5s cubic-bezier(.34,1.56,.64,1)" }}>✦</div>
                    <h2 style={{ fontSize: 24, fontWeight: 400, letterSpacing: "1px", marginBottom: 10 }}>
                        Thank You For Your Order
                    </h2>
                    <p style={{ fontSize: 14, color: "#767676", marginBottom: 32, lineHeight: 1.6 }}>
                        A confirmation has been sent to <strong>{successData.customerEmail || formData.email}</strong>
                    </p>

                    <div style={{ border: "1px solid #e5e5e5", marginBottom: 32, textAlign: "left" }}>

                        {/* Order Meta */}
                        {successData.orderNumber && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
                                <span style={{ color: "#767676" }}>Order Number</span>
                                <strong>{successData.orderNumber}</strong>
                            </div>
                        )}
                        {successData.amount && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
                                <span style={{ color: "#767676" }}>Amount Charged</span>
                                <strong>{formatPrice(successData.amount / 100)}</strong>
                            </div>
                        )}
                        {successData.paymentId && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
                                <span style={{ color: "#767676" }}>Payment ID</span>
                                <strong style={{ fontSize: 11, wordBreak: "break-all", maxWidth: "60%", textAlign: "right" }}>{successData.paymentId}</strong>
                            </div>
                        )}

                        {successItems.length > 0 && (
                            <div style={{ padding: "16px 20px" }}>
                                <p style={{
                                    fontSize: 11, letterSpacing: "1px", textTransform: "uppercase",
                                    color: "#767676", margin: "0 0 14px 0",
                                }}>
                                    Items Ordered
                                </p>
                                {successItems.map((item, idx) => {
                                    const price = item.newPrice ?? item.price ?? 0;
                                    const qty = item.qty ?? item.quantity ?? 1;
                                    const imgSrc =
                                        Array.isArray(item.images) && item.images.length > 0
                                            ? getImgSrc(item.images[0])
                                            : getImgSrc(item.img || item.image);
                                    return (
                                        <div key={idx} style={{
                                            display: "flex", alignItems: "center", gap: 14,
                                            paddingBottom: idx < successItems.length - 1 ? 14 : 0,
                                            marginBottom: idx < successItems.length - 1 ? 14 : 0,
                                            borderBottom: idx < successItems.length - 1 ? "1px solid #f5f5f5" : "none",
                                        }}>
                                            <img
                                                src={imgSrc}
                                                alt={item.title || item.name}
                                                style={{
                                                    width: 54, height: 54, objectFit: "cover",
                                                    border: "1px solid #e5e5e5", flexShrink: 0,
                                                }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: 13, fontWeight: 600, margin: "0 0 3px 0" }}>
                                                    {item.title || item.name}
                                                </p>
                                                {item.metal && (
                                                    <p style={{ fontSize: 11, color: "#767676", margin: "0 0 2px 0" }}>
                                                        Metal: {item.metal === "gold" ? "Gold" : "Silver"}
                                                    </p>
                                                )}
                                                {item.stone?.name && (
                                                    <p style={{ fontSize: 11, color: "#767676", margin: "0 0 2px 0" }}>
                                                        Stone: {item.stone.name}
                                                    </p>
                                                )}
                                                {item.size && (
                                                    <p style={{ fontSize: 11, color: "#767676", margin: "0 0 2px 0" }}>
                                                        Size: {item.size}
                                                    </p>
                                                )}
                                                <p style={{ fontSize: 11, color: "#767676", margin: 0 }}>Qty: {qty}</p>
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                                                {formatPrice(price * qty)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <Link
                        href="/"
                        className="primary-submit-btn"
                        style={{ display: "inline-block", textDecoration: "none", padding: "14px 48px", fontSize: 12, letterSpacing: "1px" }}
                    >
                        CONTINUE SHOPPING
                    </Link>
                </div>
                <style>{`@keyframes pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
            </div>
        );
    }

    // ── Shipping Step ──
    if (step === "shipping") {
        return (
            <div className="checkout-container">
                <header className="checkout-header">
                    <Link href="/" className="checkout-logo"><span className="logo-text">BAROSCHE</span></Link>
                    <h1 className="main-title">CHECKOUT</h1>
                    <div className="breadcrumb">
                        <span className="active-step">Shipping</span>
                        <span className="separator">&gt;</span>
                        <span className="disabled-step">Payment</span>
                    </div>
                </header>
                <div className="checkout-layout">
                    <main className="checkout-main">
                        <section className="checkout-section billing-section">

                            <ExpressCheckoutSection
                                subtotal={subtotal}
                                cartItems={cartItems}
                                customerInfo={formData}
                                onSuccess={handleSuccess}
                            />

                            <h2 className="section-title">CHECKOUT</h2>
                            <p className="section-subtitle">Shipping Information</p>

                            <form className="shipping-form" onSubmit={handleShippingSubmit} noValidate>
                                <div className="form-group full-width">
                                    <input type="email" id="email" name="email" required placeholder=" " value={formData.email} onChange={handleChange} />
                                    <label htmlFor="email">Email Address *</label>
                                </div>

                                <div className="form-group checkbox-group full-width">
                                    <input type="checkbox" id="marketing" />
                                    <label htmlFor="marketing">
                                        Sign up to receive email updates from Barosche about the latest collections and news. You can unsubscribe at any time. See our{" "}
                                        <a href="/privacy-policy">Privacy Policy</a>.
                                    </label>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <input type="text" id="firstName" name="firstName" required placeholder=" " value={formData.firstName} onChange={handleChange} />
                                        <label htmlFor="firstName">First Name *</label>
                                    </div>
                                    <div className="form-group">
                                        <input type="text" id="lastName" name="lastName" required placeholder=" " value={formData.lastName} onChange={handleChange} />
                                        <label htmlFor="lastName">Last Name *</label>
                                    </div>
                                </div>

                                <div className="form-group full-width">
                                    <input type="tel" id="phone" name="phone" required placeholder=" " value={formData.phone} onChange={handleChange} />
                                    <label htmlFor="phone">Phone Number *</label>
                                </div>

                                <div className="form-group full-width select-group">
                                    <select id="country" name="country" value={formData.country} onChange={handleChange} required>
                                        {allCountries.map((c) => (
                                            <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                        ))}
                                    </select>
                                    <label htmlFor="country">Country *</label>
                                    <span className="select-arrow" />
                                </div>

                                {/* ── PIN Code moved above street address for instant auto-detect ── */}
                                <div className="form-group full-width" style={{ position: "relative" }}>
                                    <input
                                        type="text"
                                        id="zip"
                                        name="zip"
                                        required
                                        placeholder=" "
                                        value={formData.zip}
                                        onChange={handleChange}
                                        maxLength={10}
                                    />
                                    <label htmlFor="zip">Postal / PIN Code *</label>
                                    {pincodeLoading && (
                                        <span style={{
                                            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                            fontSize: 11, color: "#767676",
                                        }}>
                                            Detecting…
                                        </span>
                                    )}
                                    {!pincodeLoading && pincodeMsg && (
                                        <span style={{
                                            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                                            fontSize: 11,
                                            color: pincodeMsg.includes("✓") ? "#1a7d34" : "#c00000",
                                        }}>
                                            {pincodeMsg}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group full-width">
                                    <input type="text" id="streetAddress1" name="streetAddress1" required placeholder=" " value={formData.streetAddress1} onChange={handleChange} />
                                    <label htmlFor="streetAddress1">Street Address (no P.O. Box / APO / FPO) *</label>
                                </div>

                                <div className="form-group full-width">
                                    <input type="text" id="streetAddress2" name="streetAddress2" placeholder=" " value={formData.streetAddress2} onChange={handleChange} />
                                    <label htmlFor="streetAddress2">Apartment / Suite / Floor (optional)</label>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <input type="text" id="city" name="city" required placeholder=" " value={formData.city} onChange={handleChange} />
                                        <label htmlFor="city">City *</label>
                                    </div>
                                    <div className="form-group select-group">
                                        {states.length > 0 ? (
                                            <>
                                                <select id="state" name="state" value={formData.state} onChange={handleChange} required>
                                                    <option value="" disabled hidden></option>
                                                    {states.map((s) => (
                                                        <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                                    ))}
                                                </select>
                                                <label htmlFor="state">State / Province *</label>
                                                <span className="select-arrow" />
                                            </>
                                        ) : (
                                            <>
                                                <input type="text" id="state" name="state" placeholder=" " value={formData.state} onChange={handleChange} />
                                                <label htmlFor="state">State / Province</label>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <input type="text" id="note" name="note" placeholder=" " value={formData.note} onChange={handleChange} />
                                        <label htmlFor="note">Order Note (optional)</label>
                                    </div>
                                </div>

                                {intentError && (
                                    <div style={{ background: "#fff5f5", border: "1px solid #ffcccc", padding: "12px 16px", fontSize: "13px", color: "#c00000" }}>
                                        ⚠️ {intentError}
                                    </div>
                                )}

                                <div className="bottom-action-container">
                                    <button type="submit" className="primary-submit-btn" disabled={intentLoading}
                                        style={{ opacity: intentLoading ? 0.65 : 1, cursor: intentLoading ? "not-allowed" : "pointer" }}>
                                        {intentLoading ? (
                                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                                <span style={{ width: 14, height: 14, border: "2px solid #ffffff66", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                                                PREPARING…
                                            </span>
                                        ) : "CONTINUE TO PAYMENT →"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </main>
                    <Sidebar />
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ── Payment Step ──
    const stripeOptions = {
        clientSecret,
        appearance: {
            theme: "stripe",
            variables: {
                colorPrimary: "#000000",
                colorBackground: "#ffffff",
                colorText: "#000000",
                colorDanger: "#c00000",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                borderRadius: "0px",
            },
            rules: {
                ".Input": { border: "1px solid #cccccc", boxShadow: "none" },
                ".Input:focus": { border: "1px solid #000", boxShadow: "none" },
                ".Label": { fontSize: "11px", letterSpacing: "0.5px", textTransform: "uppercase", color: "#767676" },
                ".Tab": { border: "1px solid #e5e5e5", borderRadius: "0px", boxShadow: "none" },
                ".Tab--selected": { border: "1px solid #000000", boxShadow: "none" },
            },
        },
    };

    return (
        <div className="checkout-container">
            <header className="checkout-header">
                <Link href="/" className="checkout-logo"><span className="logo-text">BAROSCHE</span></Link>
                <h1 className="main-title">CHECKOUT</h1>
                <div className="breadcrumb">
                    <span className="disabled-step" style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setStep("shipping")}>
                        Shipping
                    </span>
                    <span className="separator">&gt;</span>
                    <span className="active-step">Payment</span>
                </div>
            </header>

            <div className="checkout-layout">
                <main className="checkout-main">
                    <section className="checkout-section billing-section">
                        <h2 className="section-title">🔒 PAYMENT</h2>
                        <p className="section-subtitle">Choose your payment method</p>

                        <ExpressCheckoutSection
                            subtotal={subtotal}
                            cartItems={cartItems}
                            customerInfo={formData}
                            onSuccess={handleSuccess}
                        />

                        {clientSecret ? (
                            <Elements stripe={stripePromise} options={stripeOptions}>
                                <StripePaymentForm
                                    customerInfo={formData}
                                    cartItems={cartItems}
                                    subtotal={subtotal}
                                    onSuccess={handleSuccess}
                                />
                            </Elements>
                        ) : (
                            <div style={{ padding: "40px 0", textAlign: "center", color: "#767676", fontSize: "13px" }}>
                                Loading payment options…
                            </div>
                        )}

                        <div style={{ marginTop: "16px" }}>
                            <button type="button" onClick={() => setStep("shipping")}
                                style={{ background: "none", border: "none", fontSize: "12px", color: "#767676", cursor: "pointer", textDecoration: "underline", letterSpacing: "0.5px" }}>
                                ← Back to Shipping
                            </button>
                        </div>
                    </section>
                </main>
                <Sidebar />
            </div>
        </div>
    );
};

export default function Checkout() {
    return <CheckoutInner />;
}