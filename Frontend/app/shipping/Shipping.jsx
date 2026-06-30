"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./Shipping.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
    title: "Barosché Shipping Policy",
    effectiveDate: "Effective Date: 02 May 2026",
    intro: "At Barosché, we are committed to delivering your jewellery safely, securely, and with the highest level of care. Each order is carefully packaged to ensure protection during transit.",
    coverage: { title: "Shipping Coverage", p1: "We offer worldwide shipping.", l1: "Germany: Nationwide delivery", l2: "International: Available to most countries" },
    charges: { title: "Shipping Charges", l1: "Free standard shipping within Germany", l2: "International shipping costs (if applicable) are calculated at checkout", p1: "Shipping fees are non-refundable unless required by law." },
    processing: { title: "Order Processing", p1: "All orders undergo quality inspection before dispatch.", l1: "Standard processing: 1–3 business days", l2: "Made-to-order/custom pieces: 5–10 business days", p2: "Orders are processed after successful payment confirmation." },
    estimated: { title: "Estimated Delivery Times", p1: "Delivery times depend on destination:", l1: "Germany: 3–7 business days", l2: "International: 7–15 business days", p2: "Please note:", l3: "Delivery times are estimates, not guarantees", l4: "Remote locations may require additional time" },
    express: { title: "Express Shipping", p1: "Express shipping options may be available at checkout.", l1: "Faster dispatch and transit", l2: "Additional charges may apply", p2: "Express shipping reduces delivery time but does not guarantee a fixed delivery date." },
    tracking: { title: "Tracking", p1: "Once your order is shipped:", l1: "You will receive a tracking link via email", l2: "Real-time tracking is available", p2: "If you do not receive tracking details, please check your spam folder or contact us." },
    secure: { title: "Secure & Insured Delivery", p1: "All orders are securely packaged and shipped.", l1: "Insured during transit", l2: "Tamper-resistant packaging", p2: "For high-value orders, a signature or OTP confirmation may be required upon delivery." },
    guidelines: { title: "Delivery Guidelines", p1: "Please ensure:", l1: "Accurate shipping address", l2: "Someone available to receive the package", p2: "Delivery to P.O. Boxes may not be available depending on the carrier.", p3: "Delays may occur due to:", l3: "* Courier issues", l4: "Weather conditions", l5: "Regulatory restrictions" },
    address: { title: "Address Changes", p1: "If you need to update your shipping details, please contact us immediately:", p2: "We will try to accommodate changes if the order has not yet been processed or dispatched." },
    failed: { title: "Failed Delivery Attempts", p1: "If delivery fails due to:", l1: "Incorrect address", l2: "Customer unavailability", p2: "The courier may attempt re-delivery.", p3: "Additional shipping charges may apply for re-dispatch." },
    international: { title: "International Shipping & Customs", p1: "For international orders:", l1: "Customs duties, import taxes, and local charges may apply", l2: "These are the responsibility of the customer", l3: "Charges are not included in the product price", p2: "Barosché is not responsible for delays caused by customs authorities." },
    delays: { title: "Delays & Exceptions", p1: "Delays may occur due to:", l1: "High order volume", l2: "Custom-made items", l3: "Courier or logistics issues", l4: "Unforeseen circumstances", p2: "We will always do our best to assist and keep you informed." },
    lost: { title: "Lost or Damaged Shipments", p1: "All shipments are insured during transit.", p2: "If your package arrives damaged:", l1: "If possible, refuse delivery or document the condition", l2: "Contact us within 48 hours", l3: "Provide photos (and unboxing video if available)", p3: "We will assist in resolving the issue and offer a suitable solution.", p4: "If there are issues after delivery, please contact us — we will work with the carrier to investigate and resolve the matter." },
    contact: { title: "Contact", p1: "For any shipping-related questions:", p2: "Barosché is not responsible for delays caused by customs authorities." }
};

const flattenContent = (content) => [
    content.title, content.effectiveDate, content.intro,
    content.coverage.title, content.coverage.p1, content.coverage.l1, content.coverage.l2,
    content.charges.title, content.charges.l1, content.charges.l2, content.charges.p1,
    content.processing.title, content.processing.p1, content.processing.l1, content.processing.l2, content.processing.p2,
    content.estimated.title, content.estimated.p1, content.estimated.l1, content.estimated.l2, content.estimated.p2, content.estimated.l3, content.estimated.l4,
    content.express.title, content.express.p1, content.express.l1, content.express.l2, content.express.p2,
    content.tracking.title, content.tracking.p1, content.tracking.l1, content.tracking.l2, content.tracking.p2,
    content.secure.title, content.secure.p1, content.secure.l1, content.secure.l2, content.secure.p2,
    content.guidelines.title, content.guidelines.p1, content.guidelines.l1, content.guidelines.l2, content.guidelines.p2, content.guidelines.p3, content.guidelines.l3, content.guidelines.l4, content.guidelines.l5,
    content.address.title, content.address.p1, content.address.p2,
    content.failed.title, content.failed.p1, content.failed.l1, content.failed.l2, content.failed.p2, content.failed.p3,
    content.international.title, content.international.p1, content.international.l1, content.international.l2, content.international.l3, content.international.p2,
    content.delays.title, content.delays.p1, content.delays.l1, content.delays.l2, content.delays.l3, content.delays.l4, content.delays.p2,
    content.lost.title, content.lost.p1, content.lost.p2, content.lost.l1, content.lost.l2, content.lost.l3, content.lost.p3, content.lost.p4,
    content.contact.title, content.contact.p1, content.contact.p2
];

const rebuildContent = (translations) => {
    let i = 0;
    const get = () => translations[i++];
    return {
        title: get(), effectiveDate: get(), intro: get(),
        coverage: { title: get(), p1: get(), l1: get(), l2: get() },
        charges: { title: get(), l1: get(), l2: get(), p1: get() },
        processing: { title: get(), p1: get(), l1: get(), l2: get(), p2: get() },
        estimated: { title: get(), p1: get(), l1: get(), l2: get(), p2: get(), l3: get(), l4: get() },
        express: { title: get(), p1: get(), l1: get(), l2: get(), p2: get() },
        tracking: { title: get(), p1: get(), l1: get(), l2: get(), p2: get() },
        secure: { title: get(), p1: get(), l1: get(), l2: get(), p2: get() },
        guidelines: { title: get(), p1: get(), l1: get(), l2: get(), p2: get(), p3: get(), l3: get(), l4: get(), l5: get() },
        address: { title: get(), p1: get(), p2: get() },
        failed: { title: get(), p1: get(), l1: get(), l2: get(), p2: get(), p3: get() },
        international: { title: get(), p1: get(), l1: get(), l2: get(), l3: get(), p2: get() },
        delays: { title: get(), p1: get(), l1: get(), l2: get(), l3: get(), l4: get(), p2: get() },
        lost: { title: get(), p1: get(), p2: get(), l1: get(), l2: get(), l3: get(), p3: get(), p4: get() },
        contact: { title: get(), p1: get(), p2: get() }
    };
};

export default function Shipping() {
    const [content, setContent] = useState(DEFAULT_CONTENT);
    const [translationStatus, setTranslationStatus] = useState("idle");

    const translateContent = useCallback(async () => {
        try {
            setTranslationStatus("loading");

            const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
            const detectData = await detectRes.json();

            if (!detectData.success) throw new Error("Language detection failed");

            const { languageCode } = detectData;

            if (languageCode === "en") {
                setTranslationStatus("done");
                return;
            }

            const allStrings = flattenContent(DEFAULT_CONTENT);

            const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texts: allStrings,
                    targetLanguage: languageCode,
                    sourceLanguage: "en",
                }),
            });

            const translateData = await translateRes.json();
            if (!translateData.success) throw new Error("Translation failed");

            const translatedContent = rebuildContent(translateData.translations);
            setContent(translatedContent);
            setTranslationStatus("done");
        } catch (err) {
            console.error("Auto-translate error:", err.message);
            setTranslationStatus("error");
        }
    }, []);

    useEffect(() => {
        translateContent();
    }, [translateContent]);

    return (
        <>
            {translationStatus === "loading" && (
                <div className="translation-loading-bar" aria-hidden="true" />
            )}
            <div className="Shipping">
                <div className="Shipping-container">
                    <div className="row">
                        <div className="col-12">
                            <div className="Shipping-title">{content.title}</div>
                            <div className="">
                                <div className="Effective">{content.effectiveDate}</div>
                                <div className="Effective-prag">{content.intro}</div>

                                {/* Shipping Coverage */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.coverage.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.coverage.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.coverage.l1}</li>
                                        <li>{content.coverage.l2}</li>
                                    </div>
                                </div>

                                {/* Shipping Charges */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.charges.title}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.charges.l1}</li>
                                        <li>{content.charges.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.charges.p1}</div>
                                </div>

                                {/* Order Processing */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.processing.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.processing.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.processing.l1}</li>
                                        <li>{content.processing.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.processing.p2}</div>
                                </div>

                                {/* Estimated Delivery Times */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.estimated.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.estimated.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.estimated.l1}</li>
                                        <li>{content.estimated.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.estimated.p2}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.estimated.l3}</li>
                                        <li>{content.estimated.l4}</li>
                                    </div>
                                </div>

                                {/* Express Shipping */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.express.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.express.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.express.l1}</li>
                                        <li>{content.express.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.express.p2}</div>
                                </div>

                                {/* Tracking */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.tracking.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.tracking.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.tracking.l1}</li>
                                        <li>{content.tracking.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.tracking.p2}</div>
                                </div>

                                {/* Secure & Insured Delivery */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.secure.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.secure.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.secure.l1}</li>
                                        <li>{content.secure.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.secure.p2}</div>
                                </div>

                                {/* Delivery Guidelines */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.guidelines.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.guidelines.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.guidelines.l1}</li>
                                        <li>{content.guidelines.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.guidelines.p2}</div>
                                    <div className="Shipping-Coverage-prag">{content.guidelines.p3}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.guidelines.l3}</li>
                                        <li>{content.guidelines.l4}</li>
                                        <li>{content.guidelines.l5}</li>
                                    </div>
                                </div>

                                {/* Address Changes */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.address.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.address.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li><a href="mailto:support@barosche.com">support@barosche.com</a></li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.address.p2}</div>
                                </div>

                                {/* Failed Delivery Attempts */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.failed.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.failed.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.failed.l1}</li>
                                        <li>{content.failed.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.failed.p2}</div>
                                    <div className="Shipping-Coverage-prag">{content.failed.p3}</div>
                                </div>

                                {/* International Shipping & Customs */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.international.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.international.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.international.l1}</li>
                                        <li>{content.international.l2}</li>
                                        <li>{content.international.l3}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.international.p2}</div>
                                </div>

                                {/* Delays & Exceptions */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.delays.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.delays.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.delays.l1}</li>
                                        <li>{content.delays.l2}</li>
                                        <li>{content.delays.l3}</li>
                                        <li>{content.delays.l4}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.delays.p2}</div>
                                </div>

                                {/* Lost or Damaged Shipments */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.lost.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.lost.p1}</div>
                                    <div className="Shipping-Coverage-prag">{content.lost.p2}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.lost.l1}</li>
                                        <li>{content.lost.l2}</li>
                                        <li>{content.lost.l3}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.lost.p3}</div>
                                    <div className="Shipping-Coverage-prag">{content.lost.p4}</div>
                                </div>

                                {/* Contact */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.contact.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.contact.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li><a href="mailto:support@barosche.com">support@barosche.com</a></li>
                                        <li><a href="https://barosche.com/" target="_blank" rel="noopener noreferrer">https://barosche.com/</a></li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.contact.p2}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}