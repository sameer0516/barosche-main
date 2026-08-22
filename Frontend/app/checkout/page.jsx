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

const CURRENCY_MAP = {
     US: { code: "USD", symbol: "$", rate: 1.14 },
    GB: { code: "GBP", symbol: "£", rate: 0.86 },
    IN: { code: "INR", symbol: "₹", rate: 108.9 },
    AE: { code: "AED", symbol: "AED", rate: 4.20 },
    AU: { code: "AUD", symbol: "A$", rate: 1.66 },
    CA: { code: "CAD", symbol: "C$", rate: 1.62 },
    SG: { code: "SGD", symbol: "S$", rate: 1.48 },
    JP: { code: "JPY", symbol: "¥", rate: 184.6 },
    CH: { code: "CHF", symbol: "CHF", rate: 0.93 },
    default: { code: "EUR", symbol: "€", rate: 1 },
};

const formatPrice = (val, currency = CURRENCY_MAP.default) => {
    if (typeof val !== "number" || isNaN(val)) return `${currency.symbol}0`;
    const converted = Math.round(val * currency.rate);
    if (currency.code === "JPY") return `${currency.symbol}${converted.toLocaleString()}`;
    if (currency.code === "INR") return `${currency.symbol}${converted.toLocaleString("en-IN")}`;
    return `${currency.symbol}${converted.toLocaleString()}`;
};

const FREE_SHIPPING_THRESHOLD = 200;
const STANDARD_SHIPPING_COST = 10;
const EXPRESS_SHIPPING_COST = 50;

const SHIPPING_OPTIONS = [
    {
        id: "standard",
        label: "Standard",
        delivery: "Germany: 2 – 4 Working Days | EU: 4 – 8 Working Days",
    },
    {
        id: "express",
        label: "Express",
        delivery: "Germany: 2–3 Working Days | EU: 2–4 Working Days",
    },
];

const getShippingCost = (method, subtotalAmount) => {
    if (method === "express") return EXPRESS_SHIPPING_COST;
    return subtotalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
};

const getImgSrc = (path) => {
    if (!path) return "/placeholder.jpg";
    return path.startsWith("http") ? path : `${API_URL}${path}`;
};

const getProductUrl = (item) => {
    const category = item.category || item.categorySlug || item.categoryName || "";
    const productSlug = item.slug || item.urlHandle || item.handle || "";

    if (!category || !productSlug) return null;

    const categorySlug = category.toString().toLowerCase().replace(/\s+/g, "-");
    return `/product-category/${categorySlug}/${productSlug}`;
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

const getVariantLabel = (item) => {
    const candidates = [
        item.variantName,
        item.styleName,
        item.style,
        item.variant,
        item.colorName,
        item.color,
        item.selectedStyle,
        item.selectedVariant,
        item.optionName,
    ];
    const found = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
    if (found) return found;
    if (item.metal) return item.metal === "gold" ? "Gold" : "Silver";
    return null;
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
        variantName: getVariantLabel(item) || undefined,
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

const fetchAddressFromIndiaPost = async (pincode) => {
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
        console.error("India Post pincode lookup failed:", err);
        return null;
    }
};

const COUNTRY_PATTERNS = [
    { country: "GB", regex: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/ },
    { country: "NL", regex: /^\d{4}\s?[A-Za-z]{2}$/ },
    { country: "CA", regex: /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/ },
    { country: "JP", regex: /^\d{3}-?\d{4}$/ },
    { country: "BR", regex: /^\d{5}-?\d{3}$/ },
];

const AMBIGUOUS_NUMERIC_CANDIDATES = ["DE", "US", "FR", "ES", "IT", "CH", "AT", "BE", "SE", "PL"];

const fetchAddressForCountry = async (countryIso2, zip) => {
    try {
        const res = await fetch(
            `${API_URL}/api/pincode-lookup?country=${countryIso2.toLowerCase()}&zip=${encodeURIComponent(zip)}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (data?.error) return null;
        return { ...data, country: countryIso2 };
    } catch (err) {
        console.error("Pincode lookup failed:", err);
        return null;
    }
};

const autoDetectAddress = async (raw) => {
    const cleaned = raw.trim();

    if (/^[1-9][0-9]{5}$/.test(cleaned)) {
        const result = await fetchAddressFromIndiaPost(cleaned);
        if (result) return result;
    }

    for (const { country, regex } of COUNTRY_PATTERNS) {
        if (regex.test(cleaned)) {
            const result = await fetchAddressForCountry(country, cleaned);
            if (result) return result;
        }
    }

    if (/^\d{4,6}$/.test(cleaned)) {
        for (const country of AMBIGUOUS_NUMERIC_CANDIDATES) {
            const result = await fetchAddressForCountry(country, cleaned);
            if (result) return result;
        }
    }

    return null;
};

const getPaymentMethodLabel = (successData) => {
    if (!successData) return "Online Payment";
    const raw =
        successData.paymentMethod ||
        successData.paymentMethodType ||
        successData.gateway ||
        successData.paymentBrand ||
        "";
    const val = String(raw).toLowerCase();
    if (val.includes("paypal")) return "PayPal";
    if (val.includes("klarna")) return "Klarna";
    if (val.includes("google")) return "Google Pay";
    if (val.includes("apple")) return "Apple Pay";
    if (val.includes("card")) return "Card";
    return raw || "Online Payment";
};

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
                if (saveData.success) onSuccess({ ...saveData, paymentMethod: "card" });
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
                        application_context: { shipping_preference: "GET_FROM_FILE" },
                    }),
                onApprove: async (data, actions) => {
                    setIsProcessing(true);
                    try {
                        const details = await actions.order.capture();

                        // ── NEW: PayPal se mile payer + shipping details nikaalo ──
                        const payer = details.payer || {};
                        const shippingAddress = details.purchase_units?.[0]?.shipping?.address || {};
                        const shippingName = details.purchase_units?.[0]?.shipping?.name?.full_name || "";
                        const [shipFirst, ...shipRest] = shippingName ? shippingName.split(" ") : [];

                        const paypalDerivedInfo = {
                            firstName: payer.name?.given_name || shipFirst || "Customer",
                            lastName: payer.name?.surname || shipRest.join(" ") || "",
                            email: payer.email_address || "",
                            phone: payer.phone?.phone_number?.national_number || "",
                            country: shippingAddress.country_code || "DE",
                            streetAddress1: shippingAddress.address_line_1 || "",
                            streetAddress2: shippingAddress.address_line_2 || "",
                            city: shippingAddress.admin_area_2 || "",
                            state: shippingAddress.admin_area_1 || "",
                            zip: shippingAddress.postal_code || "",
                        };

                        const hasValue = (v) => typeof v === "string" && v.trim() !== "";
                        const mergedCustomerInfo = { ...paypalDerivedInfo };
                        Object.entries(customerInfo || {}).forEach(([key, value]) => {
                            if (hasValue(value)) mergedCustomerInfo[key] = value;
                        });

                        if (!hasValue(mergedCustomerInfo.phone)) mergedCustomerInfo.phone = "Not provided";
                        if (!hasValue(mergedCustomerInfo.streetAddress1)) mergedCustomerInfo.streetAddress1 = "Not provided";
                        if (!hasValue(mergedCustomerInfo.city)) mergedCustomerInfo.city = "Not provided";
                        if (!hasValue(mergedCustomerInfo.zip)) mergedCustomerInfo.zip = "Not provided";

                        if (!hasValue(mergedCustomerInfo.email)) {
                            onError?.("PayPal account me email nahi mila. Kripya pehle apna email daalein.");
                            setIsProcessing(false);
                            return;
                        }

                        const res = await fetch(`${API_URL}/api/payment/paypal-capture`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                paypalOrderId: details.id,
                                paypalPaymentId: details.purchase_units?.[0]?.payments?.captures?.[0]?.id || details.id,
                                amount: Math.round(subtotal * 100),
                                browserId: getBrowserId(),
                                userId: getLoggedInUserId(),
                                customerInfo: mergedCustomerInfo,
                                items: mapCartItems(cartItems),
                            }),
                        });
                        const saved = await res.json();
                        if (saved.success) onSuccess({ ...saved, paymentMethod: "paypal" });
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

const StripePaymentForm = ({ customerInfo, cartItems, subtotal, currency, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const submittingRef = useRef(false);

    const handlePay = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        if (submittingRef.current) return;
        submittingRef.current = true;
        setLoading(true);
        setError("");

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setError(submitError.message);
                setLoading(false);
                submittingRef.current = false;
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
                if (
                    confirmError.code === "payment_intent_unexpected_state" &&
                    confirmError.payment_intent?.status === "succeeded"
                ) {
                    await finalizeOrder(
                        confirmError.payment_intent.id,
                        customerInfo,
                        cartItems,
                        onSuccess,
                        setError
                    );
                    setLoading(false);
                    submittingRef.current = false;
                    return;
                }

                setError(confirmError.message);
                clearPendingCheckout();
                setLoading(false);
                submittingRef.current = false;
                return;
            }

            if (!paymentIntent) {
                setError("Payment could not be confirmed. Please try again.");
                setLoading(false);
                submittingRef.current = false;
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
            submittingRef.current = false;
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
                <span style={{ fontSize: "18px", fontWeight: 600 }}>{formatPrice(subtotal, currency)}</span>
            </div>

            {currency.code !== "EUR" && (
                <p style={{ fontSize: "11px", color: "#999", textAlign: "center", margin: "-4px 0 12px" }}>
                    You will be charged {formatPrice(subtotal, CURRENCY_MAP.default)} (EUR)
                </p>
            )}

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
                    ) : `PAY ${formatPrice(subtotal, currency)}`}
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
            onSuccess({ ...data, paymentMethod: data.paymentMethod || "card" });
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

    const [currency, setCurrency] = useState(CURRENCY_MAP.default);

    // NEW: selected shipping method — "standard" (default) or "express"
    const [shippingMethod, setShippingMethod] = useState("standard");

    useEffect(() => {
        const detectCurrency = async () => {
            try {
                const res = await fetch(`${API_URL}/api/translate/detect-language`);
                const data = await res.json();
                if (data?.success && data.countryCode && CURRENCY_MAP[data.countryCode]) {
                    setCurrency(CURRENCY_MAP[data.countryCode]);
                } else {
                    setCurrency(CURRENCY_MAP.default);
                }
            } catch (err) {
                console.error("Currency detect error:", err);
            }
        };
        detectCurrency();
    }, []);

    const [formData, setFormData] = useState({
        email: "", firstName: "", lastName: "", phone: "",
        country: "DE", streetAddress1: "", streetAddress2: "",
        city: "", state: "", zip: "", note: "",
    });

    const [successItems, setSuccessItems] = useState([]);

    const [allCountries] = useState(Country.getAllCountries());
    const [states, setStates] = useState([]);

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

    useEffect(() => {
        const raw = (formData.zip || "").trim();

        if (pincodeTimerRef.current) clearTimeout(pincodeTimerRef.current);

        if (!raw || raw.length < 3) {
            setPincodeMsg("");
            return;
        }

        if (raw === lastLookedUpPincode.current) return;

        pincodeTimerRef.current = setTimeout(async () => {
            setPincodeLoading(true);
            setPincodeMsg("");

            const result = await autoDetectAddress(raw);
            lastLookedUpPincode.current = raw;
            setPincodeLoading(false);

            if (!result) {
                setPincodeMsg("Could not detect address for this pincode.");
                return;
            }

            setFormData((prev) => {
                const next = { ...prev, city: result.city || prev.city };

                if (result.country) next.country = result.country;

                const statesForCountry = State.getStatesOfCountry(next.country);
                if (result.stateName && statesForCountry.length > 0) {
                    const matchedState = statesForCountry.find(
                        (st) =>
                            st.name.toLowerCase() === result.stateName.toLowerCase() ||
                            st.isoCode.toLowerCase() === result.stateName.toLowerCase()
                    );
                    if (matchedState) next.state = matchedState.isoCode;
                }

                return next;
            });

            setPincodeMsg("Address detected ✓ (please verify country)");
            setTimeout(() => setPincodeMsg(""), 4000);
        }, 550);

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

    const shippingCost = getShippingCost(shippingMethod, subtotal);
    const orderTotal = subtotal + shippingCost;

    const customerInfoWithShipping = { ...formData, shippingMethod, shippingCost };

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
                    amount: Math.round(orderTotal * 100),
                    paymentMethodTypes: ["card", "klarna"],
                    customerInfo: customerInfoWithShipping,
                    items: mapCartItems(cartItems),
                    browserId: getBrowserId(),
                    shippingMethod,
                    shippingCost,
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
                        const variantLabel = getVariantLabel(item);
                        const productUrl = getProductUrl(item);

                        const rowContent = (
                            <>
                                <div className="product-thumb-container">
                                   <img src={imgSrc} alt={item.title || item.name} className="product-thumb" width={100} height={100} />
                                </div>
                                <div className="sidebar-product-info">
                                    <h3>{item.title || item.name}</h3>
                                    {variantLabel && <p>Variant: {variantLabel}</p>}
                                    {item.size && <p>Size: {item.size}</p>}
                                    <div className="sidebar-qty-row">
                                        <span>Qty: {item.qty ?? item.quantity ?? 1}</span>
                                    </div>
                                </div>
                                <div className="sidebar-product-price">
                                    {formatPrice(price * (item.qty ?? item.quantity ?? 1), currency)}
                                </div>
                            </>
                        );

                        return productUrl ? (
                            <Link
                                href={productUrl}
                                key={`${item._id || item.id}-${idx}`}
                                className="sidebar-product-item"
                                style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                            >
                                {rowContent}
                            </Link>
                        ) : (
                            <div className="sidebar-product-item" key={`${item._id || item.id}-${idx}`}>
                                {rowContent}
                            </div>
                        );
                    })
                )}
                <div className="summary-totals">
                    <div className="total-row"><span>Subtotal</span><span>{formatPrice(subtotal, currency)}</span></div>
                    <div className="total-row">
                        <span>Shipping ({shippingMethod === "express" ? "Express" : "Standard"})</span>
                        <span className={shippingCost === 0 ? "free-text" : ""}>
                            {shippingCost === 0 ? "Free" : formatPrice(shippingCost, currency)}
                        </span>
                    </div>
                    <hr className="summary-divider" />
                    <div className="total-row grand-total"><span>Total</span><span>{formatPrice(orderTotal, currency)}</span></div>
                </div>
                {currency.code !== "EUR" && (
                    <p style={{ fontSize: "11px", color: "#999", marginTop: "8px" }}>
                        Prices shown in {currency.code}. You will be charged {formatPrice(orderTotal, CURRENCY_MAP.default)} (EUR).
                    </p>
                )}
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

    if (step === "success" && successData) {
        const itemCount = successItems.reduce((sum, it) => sum + (it.qty ?? it.quantity ?? 1), 0);
        const paidAmount = successData.amount
            ? successData.amount / 100
            : orderTotal || successItems.reduce((sum, it) => {
                const price = it.newPrice ?? it.price ?? 0;
                return sum + price * (it.qty ?? it.quantity ?? 1);
            }, 0);

        return (
            <div className="checkout-container">
                <div className="order-success-wrap">

                    <div className="success-hero">
                        <span className="success-check-circle">✓</span>
                        <h1 className="success-heading">Yay! Order Received.</h1>
                        <p className="success-subtext">
                            Please check <span className="success-email">{successData.customerEmail || formData.email}</span> email inbox for all order related updates
                        </p>
                    </div>

                    <div className="success-card">
                        <div className="success-card-header">
                            <span className="success-card-icon">🛍️</span>
                            <span>Order Summary&nbsp;|&nbsp;{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                        </div>

                        <div className="success-card-divider" />

                        <div className="success-items-list">
                            {successItems.map((item, idx) => {
                                const price = item.newPrice ?? item.price ?? 0;
                                const qty = item.qty ?? item.quantity ?? 1;
                                const imgSrc =
                                    Array.isArray(item.images) && item.images.length > 0
                                        ? getImgSrc(item.images[0])
                                        : getImgSrc(item.img || item.image);
                                const variantLabel = getVariantLabel(item);
                                const productUrl = getProductUrl(item);

                                const rowContent = (
                                    <>
                                        <div className="success-item-thumb-wrap">
                                            <img src={imgSrc} alt={item.title || item.name} className="success-item-thumb" width={72} height={72} />
                                            <span className="success-item-qty-badge">{qty}</span>
                                        </div>
                                        <div className="success-item-info">
                                            <p className="success-item-name">{item.title || item.name}</p>
                                            {variantLabel && (
                                                <p className="success-item-meta">Variant: {variantLabel}</p>
                                            )}
                                            {item.size && <p className="success-item-meta">Size: {item.size}</p>}
                                        </div>
                                        <span className="success-item-price">{formatPrice(price * qty, currency)}</span>
                                    </>
                                );

                                return productUrl ? (
                                    <Link
                                        href={productUrl}
                                        key={idx}
                                        className="success-item-row"
                                        style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                                    >
                                        {rowContent}
                                    </Link>
                                ) : (
                                    <div className="success-item-row" key={idx}>
                                        {rowContent}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="success-card-divider" />

                        <div className="success-detail-row">
                            <span className="success-detail-label">Shipping Method</span>
                            <span className="success-detail-value">
                                {successData.shippingMethod === "express" || shippingMethod === "express" ? "Express" : "Standard"}
                            </span>
                        </div>
                        <div className="success-detail-row">
                            <span className="success-detail-label">Total Amount Paid</span>
                            <span className="success-detail-value strong">
                                {formatPrice(paidAmount, CURRENCY_MAP.default)}
                                {currency.code !== "EUR" && (
                                    <span style={{ fontSize: "12px", color: "#999", fontWeight: 400, marginLeft: "6px" }}>
                                        (~{formatPrice(paidAmount, currency)})
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="success-detail-row">
                            <span className="success-detail-label">Payment Method</span>
                            <span className="success-detail-value">{getPaymentMethodLabel(successData)}</span>
                        </div>
                        <div className="success-detail-row">
                            <span className="success-detail-label">Order No.</span>
                            <span className="success-detail-value">
                                {successData.orderNumber ? `#${successData.orderNumber}` : "—"}
                            </span>
                        </div>
                    </div>

                    <div className="success-actions">
                        <Link href="/track-order" className="success-pill-btn outline">
                            <span className="success-pill-icon">📍</span> Track Order
                        </Link>
                        <Link href="/" className="success-pill-btn filled">
                            <span className="success-pill-icon">🛒</span> Shop More
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Shipping Step ──
    if (step === "shipping") {
        return (
            <div className="checkout-container">
                <header className="checkout-header">
                    <h1 className="main-title">CHECKOUT</h1>
                </header>
                <div className="checkout-layout">
                    <main className="checkout-main">
                        <section className="checkout-section billing-section">

                            <ExpressCheckoutSection
                                subtotal={orderTotal}
                                cartItems={cartItems}
                                customerInfo={customerInfoWithShipping}
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
                                    <label htmlFor="zip">Postal / PIN / ZIP Code *</label>
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

                                <div
                                    style={{
                                        gridColumn: "1 / -1",
                                        flexBasis: "100%",
                                        width: "100%",
                                        marginTop: "10px",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <p style={{
                                        fontSize: "13px", fontWeight: 600, margin: "0 0 10px 0",
                                        letterSpacing: "0.3px", color: "#111",
                                    }}>
                                        Shipping method
                                    </p>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                                        {SHIPPING_OPTIONS.map((opt) => {
                                            const cost = getShippingCost(opt.id, subtotal);
                                            const isSelected = shippingMethod === opt.id;
                                            const priceLabel = cost === 0 ? "FREE" : formatPrice(cost, currency);

                                            return (
                                                <label
                                                    key={opt.id}
                                                    htmlFor={`shipping-${opt.id}`}
                                                    style={{
                                                        boxSizing: "border-box",
                                                        width: "100%",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        gap: "12px",
                                                        border: isSelected ? "1.5px solid #000" : "1px solid #d9d9d9",
                                                        borderRadius: "6px",
                                                        padding: "14px 16px",
                                                        cursor: "pointer",
                                                        background: isSelected ? "#fafafa" : "#fff",
                                                        transition: "border-color 0.15s ease, background 0.15s ease",
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                                        <input
                                                            type="radio"
                                                            id={`shipping-${opt.id}`}
                                                            name="shippingMethod"
                                                            value={opt.id}
                                                            checked={isSelected}
                                                            onChange={() => setShippingMethod(opt.id)}
                                                            style={{ marginTop: "3px", cursor: "pointer" }}
                                                        />
                                                        <div>
                                                            <div style={{ fontSize: "13px", fontWeight: 600 }}>{opt.label}</div>
                                                            <div style={{ fontSize: "11px", color: "#767676", marginTop: "2px" }}>
                                                                {opt.delivery}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>
                                                        {priceLabel}
                                                    </div>
                                                </label>
                                            );
                                        })}
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
                            subtotal={orderTotal}
                            cartItems={cartItems}
                            customerInfo={customerInfoWithShipping}
                            onSuccess={handleSuccess}
                        />

                        {clientSecret ? (
                            <Elements stripe={stripePromise} options={stripeOptions}>
                                <StripePaymentForm
                                    customerInfo={customerInfoWithShipping}
                                    cartItems={cartItems}
                                    subtotal={orderTotal}
                                    currency={currency}
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