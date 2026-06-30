"use client";
import React, { useState, useEffect, useCallback } from "react";
import "./Terms.css";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com";

const DEFAULT_CONTENT = {
    title: "Terms and Conditions",
    subtitle: "Last updated: April 30, 2026",
    intro: "Please read these terms and conditions carefully before using Our Service.",
    s1_title: "Interpretation and Definitions",
    s1_h1: "Interpretation",
    s1_p1: "The words whose initial letters are capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.",
    s1_h2: "Definitions",
    s1_p2: "For the purposes of these Terms and Conditions:",
    s1_d1_s: "Affiliate ", s1_d1_t: "means an entity that controls, is controlled by, or is under common control with a party, where “control” means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.",
    s1_d2_s: "Country ", s1_d2_t: "refers to: Niedersachsen, Germany",
    s1_d3_s: "Company ", s1_d3_t: "(referred to as either “the Company”, “We”, “Us” or “Our” in these Terms and Conditions) refers to Barosche, Herrlichkeit 11, Syke, 28857.",
    s1_d4_s: "Device ", s1_d4_t: "means any device that can access the Service such as a computer, a cell phone or a digital tablet.",
    s1_d5_s: "Service ", s1_d5_t: "refers to the Website.",
    s1_d6_s: "Terms and Conditions ", s1_d6_t: "(also referred to as “Terms”) means these Terms and Conditions, including any documents expressly incorporated by reference, which govern Your access to and use of the Service and form the entire agreement between You and the Company regarding the Service. These Terms and Conditions have been created with the help of the Terms and Conditions Generator.",
    s1_d7_s: "Third-Party Social Media Service ", s1_d7_t: "means any services or content (including data, information, products or services) provided by a third party that is displayed, included, made available, or linked to through the Service.",
    s1_d8_s: "Website ", s1_d8_t: "refers to Barosche, accessible from https://barosche.com/",
    s1_d9_s: "You ", s1_d9_t: "means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.",
    s1_h3: "Acknowledgment",
    s1_p3: "These are the Terms and Conditions governing the use of this Service and the agreement between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.",
    s1_p4: "Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.",
    s1_p5: "By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.",
    s1_p6: "You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.",
    s1_p7: "Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service.",
    s2_h1: "Links to Other Websites",
    s2_p1: "Our Service may contain links to third-party websites or services that are not owned or controlled by the Company.",
    s2_p2: "Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.",
    s2_p3: "By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.",
    s2_p4: "You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.",
    s2_p5: "Your access to and use of the Service is also subject to Our Privacy Policy, which describes how We collect, use, and disclose personal information. Please read Our Privacy Policy carefully before using Our Service."
};

const flattenContent = (contentObj) => Object.values(contentObj);

const rebuildContent = (translationsArr, originalObj) => {
    const keys = Object.keys(originalObj);
    return keys.reduce((acc, key, index) => {
        acc[key] = translationsArr[index];
        return acc;
    }, {});
};

export default function Terms() {
    const [content, setContent] = useState(DEFAULT_CONTENT);
    const [translationStatus, setTranslationStatus] = useState("idle");

    const translateContent = useCallback(async () => {
        try {
            setTranslationStatus("loading");
            const detectRes = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
            const detectData = await detectRes.json();
            if (!detectData.success || detectData.languageCode === "en") {
                setTranslationStatus("done");
                return;
            }

            const translateRes = await fetch(`${BACKEND_URL}/api/translate/translate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    texts: flattenContent(DEFAULT_CONTENT),
                    targetLanguage: detectData.languageCode,
                    sourceLanguage: "en",
                }),
            });

            const translateData = await translateRes.json();
            if (translateData.success) {
                setContent(rebuildContent(translateData.translations, DEFAULT_CONTENT));
            }
            setTranslationStatus("done");
        } catch (err) {
            console.error("Translation error:", err);
            setTranslationStatus("error");
        }
    }, []);

    useEffect(() => {
        translateContent();
    }, [translateContent]);

    return (
        <>
            {translationStatus === "loading" && <div className="translation-loading-bar" aria-hidden="true" />}
            <div className="Terms">
                <div className="Terms-title">{content.title}</div>
                <div className="Terms-subtitle">{content.subtitle}</div>
                <div className="Terms-prag">{content.intro}</div>
                <div className="terms-text">
                    <div className="Terms-container-title">{content.s1_title}</div>
                    <h3>{content.s1_h1}</h3>
                    <div className="Terms-container-text">{content.s1_p1}</div>
                    <h3>{content.s1_h2}</h3>
                    <div className="Terms-container-text">{content.s1_p2}</div>
                    <div className="Terms-container-content">
                        <div className="Terms-container-text"><span>{content.s1_d1_s}</span>{content.s1_d1_t}
                            <div className="Terms-container-text"><span>{content.s1_d2_s}</span>{content.s1_d2_t}</div>
                        </div>
                        <div className="Terms-container-text"><span>{content.s1_d3_s}</span>{content.s1_d3_t}</div>
                        <div className="Terms-container-text"><span>{content.s1_d4_s}</span>{content.s1_d4_t}</div>
                        <div className="Terms-container-text"><span>{content.s1_d5_s}</span>{content.s1_d5_t}</div>
                        <div className="Terms-container-text"><span>{content.s1_d6_s}</span>{content.s1_d6_t}</div>
                        <div className="Terms-container-text"><span>{content.s1_d7_s}</span>{content.s1_d7_t}</div>
                        <div className="Terms-container-text"><span>{content.s1_d8_s}</span>{content.s1_d8_t}</div>
                        <div className="Terms-container-text"><span>{content.s1_d9_s}</span>{content.s1_d9_t}</div>
                        <h3>{content.s1_h3}</h3>
                        <div className="Terms-container-text">{content.s1_p3}</div>
                        <div className="Terms-container-text">{content.s1_p4}</div>
                        <div className="Terms-container-text">{content.s1_p5}</div>
                        <div className="Terms-container-text">{content.s1_p6}</div>
                        <div className="Terms-container-text">{content.s1_p7}</div>
                        <h3>{content.s2_h1}</h3>
                        <div className="Terms-container-text">{content.s2_p1}</div>
                        <div className="Terms-container-text">{content.s2_p2}</div>
                        <div className="Terms-container-text">{content.s2_p3}</div>
                        <div className="Terms-container-text">{content.s2_p4}</div>
                        <div className="Terms-container-text">{content.s2_p5}</div>
                    </div>
                </div>
            </div>
        </>
    );
}