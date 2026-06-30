"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./Return.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
    title: "Returns, Exchanges, Cancellation & Warranty Policy",
    effectiveDate: "Effective Date: 02 May 2026",
    intro: "At Barosché, we stand behind the quality of every piece we create. Each item is carefully inspected before dispatch to ensure it meets our standards of craftsmanship and design.",
    returns: {
        title: "Returns & Exchanges",
        p1: "We offer a 30-day return window from the date of delivery.",
        p2: "In accordance with EU law, you also have a 14-day right of withdrawal, allowing you to return your order without providing a reason.",
        p3: "To be eligible for a return:",
        l1: "Item must be unused and unworn",
        l2: "Returned in original condition and packaging",
        l3: "Include any certificates, tags, and proof of purchase",
        p4: "You may inspect your jewellery as you would in-store. Items showing signs of wear beyond this may be subject to a deduction for loss of value."
    },
    nonReturnable: {
        title: "Non-Returnable Items",
        p1: "For hygiene and customization reasons, the following items cannot be returned:",
        l1: "Customized or personalized jewellery",
        l2: "Engraved or made-to-order pieces",
        l3: "Earrings that have been worn or unsealed"
    },
    returnShipping: {
        title: "Return Shipping",
        l1: "Return shipping costs are borne by the customer",
        l2: "If the item is defective or incorrect, we will cover return shipping",
        p1: "We recommend using a trackable and insured shipping method, as we cannot be responsible for lost return shipments."
    },
    refunds: {
        title: "Refunds",
        p1: "Once your return is received and inspected, refunds are processed within 7–10 business days to the original payment method.",
        p2: "Original shipping charges are non-refundable unless required by law."
    },
    exchanges: {
        title: "Exchanges",
        p1: "We offer exchanges for:",
        l1: "Defective or damaged items",
        l2: "Incorrect products",
        p2: "Exchanges are subject to availability. If unavailable, a refund or store credit will be issued."
    },
    cancellation: {
        title: "Order Cancellation",
        l1: "Orders may be cancelled within 24 hours of placing the order, provided they have not yet been processed or dispatched.",
        l2: "After dispatch, cancellation is no longer possible. However, your right of withdrawal still applies.",
        p1: "To cancel an order, contact:"
    },
    damaged: {
        title: "Damaged or Incorrect Orders",
        p1: "If your order arrives damaged or incorrect, please contact us within 48 hours of delivery.",
        p2: "Include:",
        l1: "Order ID",
        l2: "Unboxing video (if available)",
        p3: "We will arrange a replacement, repair, or refund."
    },
    international: {
        title: "International Orders",
        p1: "For orders outside the EU:",
        l1: "Customs duties and taxes are the customer’s responsibility",
        l2: "Delivery delays due to customs are beyond our control"
    },
    warranty: {
        title: "365-Day Warranty",
        p1: "All Barosché jewellery is covered by a 365-day limited warranty.",
        p2: "Covered:",
        l1: "Manufacturing defects",
        l2: "Loose stones (due to manufacturing fault)",
        l3: "Faulty clasps or structural issues",
        p3: "Not covered:",
        l4: "Normal wear and tear",
        l5: "Scratches, dents, or discoloration",
        l6: "Damage from chemicals, water, or improper care",
        l7: "Plating wear over time (gold vermeil)",
        l8: "Third-party repairs or modifications",
        p4: "All claims are subject to inspection."
    },
    contact: {
        title: "Contact",
        p1: "For any questions or support:"
    }
};

const flattenContent = (content) => [
    content.title, content.effectiveDate, content.intro,
    content.returns.title, content.returns.p1, content.returns.p2, content.returns.p3, content.returns.l1, content.returns.l2, content.returns.l3, content.returns.p4,
    content.nonReturnable.title, content.nonReturnable.p1, content.nonReturnable.l1, content.nonReturnable.l2, content.nonReturnable.l3,
    content.returnShipping.title, content.returnShipping.l1, content.returnShipping.l2, content.returnShipping.p1,
    content.refunds.title, content.refunds.p1, content.refunds.p2,
    content.exchanges.title, content.exchanges.p1, content.exchanges.l1, content.exchanges.l2, content.exchanges.p2,
    content.cancellation.title, content.cancellation.l1, content.cancellation.l2, content.cancellation.p1,
    content.damaged.title, content.damaged.p1, content.damaged.p2, content.damaged.l1, content.damaged.l2, content.damaged.p3,
    content.international.title, content.international.p1, content.international.l1, content.international.l2,
    content.warranty.title, content.warranty.p1, content.warranty.p2, content.warranty.l1, content.warranty.l2, content.warranty.l3, content.warranty.p3, content.warranty.l4, content.warranty.l5, content.warranty.l6, content.warranty.l7, content.warranty.l8, content.warranty.p4,
    content.contact.title, content.contact.p1
];

const rebuildContent = (translations) => {
    let i = 0;
    const get = () => translations[i++];
    return {
        title: get(), effectiveDate: get(), intro: get(),
        returns: { title: get(), p1: get(), p2: get(), p3: get(), l1: get(), l2: get(), l3: get(), p4: get() },
        nonReturnable: { title: get(), p1: get(), l1: get(), l2: get(), l3: get() },
        returnShipping: { title: get(), l1: get(), l2: get(), p1: get() },
        refunds: { title: get(), p1: get(), p2: get() },
        exchanges: { title: get(), p1: get(), l1: get(), l2: get(), p2: get() },
        cancellation: { title: get(), l1: get(), l2: get(), p1: get() },
        damaged: { title: get(), p1: get(), p2: get(), l1: get(), l2: get(), p3: get() },
        international: { title: get(), p1: get(), l1: get(), l2: get() },
        warranty: { title: get(), p1: get(), p2: get(), l1: get(), l2: get(), l3: get(), p3: get(), l4: get(), l5: get(), l6: get(), l7: get(), l8: get(), p4: get() },
        contact: { title: get(), p1: get() }
    };
};

export default function ReturnPolicy() {
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

                                {/* Returns & Exchanges */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.returns.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.returns.p1}</div>
                                    <div className="Shipping-Coverage-prag">{content.returns.p2}</div>
                                    <div className="Shipping-Coverage-prag">{content.returns.p3}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.returns.l1}</li>
                                        <li>{content.returns.l2}</li>
                                        <li>{content.returns.l3}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.returns.p4}</div>
                                </div>

                                {/* Non-Returnable Items */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.nonReturnable.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.nonReturnable.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.nonReturnable.l1}</li>
                                        <li>{content.nonReturnable.l2}</li>
                                        <li>{content.nonReturnable.l3}</li>
                                    </div>
                                </div>

                                {/* Return Shipping */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.returnShipping.title}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.returnShipping.l1}</li>
                                        <li>{content.returnShipping.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.returnShipping.p1}</div>
                                </div>

                                {/* Refunds */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.refunds.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.refunds.p1}</div>
                                    <div className="Shipping-Coverage-prag">{content.refunds.p2}</div>
                                </div>

                                {/* Exchanges */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.exchanges.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.exchanges.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.exchanges.l1}</li>
                                        <li>{content.exchanges.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.exchanges.p2}</div>
                                </div>

                             
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.cancellation.title}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.cancellation.l1}</li>
                                        <li>{content.cancellation.l2}</li>
                                        <li><a href="/barosche.com">https://barosche.com/</a></li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.cancellation.p1}</div>
                                </div>

                                {/* Damaged or Incorrect Orders */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.damaged.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.damaged.p1}</div>
                                    <div className="Shipping-Coverage-prag">{content.damaged.p2}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.damaged.l1}</li>
                                        <li>{content.damaged.l2}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.damaged.p3}</div>
                                </div>

                                {/* International Orders */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.international.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.international.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.international.l1}</li>
                                        <li>{content.international.l2}</li>
                                    </div>
                                </div>

                                {/* 365-Day Warranty */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.warranty.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.warranty.p1}</div>
                                    <div className="Shipping-Coverage-prag">{content.warranty.p2}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.warranty.l1}</li>
                                        <li>{content.warranty.l2}</li>
                                        <li>{content.warranty.l3}</li>
                                    </div>

                                    <div className="Shipping-Coverage-prag">{content.warranty.p3}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li>{content.warranty.l4}</li>
                                        <li>{content.warranty.l5}</li>
                                        <li>{content.warranty.l6}</li>
                                        <li>{content.warranty.l7}</li>
                                        <li>{content.warranty.l8}</li>
                                    </div>
                                    <div className="Shipping-Coverage-prag">{content.warranty.p4}</div>
                                </div>

                                {/* Contact */}
                                <div className="Coverage-container">
                                    <div className="Coverage-title">{content.contact.title}</div>
                                    <div className="Shipping-Coverage-prag">{content.contact.p1}</div>
                                    <div className="Shipping-Coverage-list">
                                        <li><a href="/barosche.com">https://barosche.com/</a></li>
                                        <li><a href="/barosche.com">https://barosche.com/</a></li>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}