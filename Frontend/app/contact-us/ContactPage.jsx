"use client";
import React, { useState } from "react";
import "./contact.css";
import { useLanguage } from "../../lib/languageContext";

const initialForm = {
  title: "",
  firstName: "",
  lastName: "",
  email: "",
  telephone: "",
  preferredLanguage: "",
  natureOfEnquiry: "",
  country: "germany",
  subject: "",
  details: "",
  receiveUpdates: false,
  agreeToPolicy: false,
};

const ContactPage = () => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? e.target.checked : false;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = t("contact.errorFirstName");
    if (!formData.lastName.trim()) errors.lastName = t("contact.errorLastName");
    if (!formData.email.trim()) {
      errors.email = t("contact.errorEmail");
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      errors.email = t("contact.errorEmailInvalid");
    }
    if (!formData.natureOfEnquiry) errors.natureOfEnquiry = t("contact.errorNature");
    if (!formData.subject.trim()) errors.subject = t("contact.errorSubject");
    if (!formData.details.trim()) errors.details = t("contact.errorDetails");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://api.barosche.com"}/api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          setErrorMsg(data.errors.join(" "));
        } else {
          setErrorMsg(data.message || t("common.error"));
        }
      } else {
        setSuccessMsg(data.message || t("contact.successMsg"));
        setFormData(initialForm);
        setFieldErrors({});
      }
    } catch {
      setErrorMsg(t("contact.errorNetwork"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="contact-container">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="contact-header-section">
          <h1 className="main-title">{t("contact.pageTitle")}</h1>

          <div className="contact-info-grid">
            <div className="contact-info-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <a href="mailto:info@barosche.com">info@barosche.com</a>
            </div>

            <div className="contact-info-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07
                19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3
                a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09
                9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0
                2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a href="tel:+491628806158">+49 1628806158</a>
            </div>

            <div className="contact-info-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Herrlichkeit+11+Syke+28857+Germany"
                target="_blank"
                rel="noopener noreferrer"
              >
                Herrlichkeit 11 Syke 28857 Germany
              </a>
            </div>
          </div>
        </div>

        {/* ── Form Section ───────────────────────────────────────────── */}
        <div className="contact-form-section">
          <h2 className="form-title">{t("contact.formTitle")}</h2>
          <p className="form-subtitle">{t("contact.formSubtitle")}</p>

          {successMsg && (
            <div className="form-banner success-banner" role="alert">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="form-banner error-banner" role="alert">
              {errorMsg}
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-grid">

              {/* Title */}
              <select
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
              >
                <option value="" disabled hidden>{t("contact.titleField")}</option>
                <option value="mr">{t("contact.titleMr")}</option>
                <option value="ms">{t("contact.titleMs")}</option>
                <option value="mrs">{t("contact.titleMrs")}</option>
                <option value="dr">{t("contact.titleDr")}</option>
              </select>

              {/* Email */}
              <div className="field-wrap">
                <input
                  type="email"
                  name="email"
                  className={`form-input${fieldErrors.email ? " input-error" : ""}`}
                  placeholder={`${t("contact.email")} *`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && (
                  <span className="field-error">{fieldErrors.email}</span>
                )}
              </div>

              {/* First Name */}
              <div className="field-wrap">
                <input
                  type="text"
                  name="firstName"
                  className={`form-input${fieldErrors.firstName ? " input-error" : ""}`}
                  placeholder={`${t("contact.firstName")} *`}
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {fieldErrors.firstName && (
                  <span className="field-error">{fieldErrors.firstName}</span>
                )}
              </div>

              {/* Last Name */}
              <div className="field-wrap">
                <input
                  type="text"
                  name="lastName"
                  className={`form-input${fieldErrors.lastName ? " input-error" : ""}`}
                  placeholder={`${t("contact.lastName")} *`}
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {fieldErrors.lastName && (
                  <span className="field-error">{fieldErrors.lastName}</span>
                )}
              </div>

              {/* Phone */}
              <input
                type="tel"
                name="telephone"
                className="form-input"
                placeholder={t("contact.telephone")}
                value={formData.telephone}
                onChange={handleChange}
              />

              {/* Preferred Language */}
              <select
                name="preferredLanguage"
                className="form-input"
                value={formData.preferredLanguage}
                onChange={handleChange}
              >
                <option value="" disabled hidden>{t("contact.preferredLanguage")}</option>
                <option value="english">{t("contact.langEnglish")}</option>
                <option value="german">{t("contact.langGerman")}</option>
              </select>

              {/* Nature of Enquiry */}
              <div className="field-wrap">
                <select
                  name="natureOfEnquiry"
                  className={`form-input${fieldErrors.natureOfEnquiry ? " input-error" : ""}`}
                  value={formData.natureOfEnquiry}
                  onChange={handleChange}
                >
                  <option value="" disabled hidden>
                    {t("contact.natureOfEnquiry")} *
                  </option>
                  <option value="general">{t("contact.enquiryGeneral")}</option>
                  <option value="sales">{t("contact.enquirySales")}</option>
                  <option value="support">{t("contact.enquirySupport")}</option>
                </select>
                {fieldErrors.natureOfEnquiry && (
                  <span className="field-error">{fieldErrors.natureOfEnquiry}</span>
                )}
              </div>

              {/* Country */}
              <select
                name="country"
                className="form-input"
                value={formData.country}
                onChange={handleChange}
              >
                <option value="india">{t("contact.countryIndia")}</option>
                <option value="germany">{t("contact.countryGermany")}</option>
                <option value="usa">{t("contact.countryUsa")}</option>
              </select>

              {/* Subject */}
              <div className="field-wrap full-width">
                <input
                  type="text"
                  name="subject"
                  className={`form-input full-width${fieldErrors.subject ? " input-error" : ""}`}
                  placeholder={`${t("contact.subject")} *`}
                  value={formData.subject}
                  onChange={handleChange}
                />
                {fieldErrors.subject && (
                  <span className="field-error">{fieldErrors.subject}</span>
                )}
              </div>

              {/* Details */}
              <div className="field-wrap full-width">
                <textarea
                  name="details"
                  className={`form-input full-width textarea${fieldErrors.details ? " input-error" : ""}`}
                  placeholder={`${t("contact.details")} *`}
                  rows={6}
                  value={formData.details}
                  onChange={handleChange}
                />
                {fieldErrors.details && (
                  <span className="field-error">{fieldErrors.details}</span>
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="receiveUpdates"
                  checked={formData.receiveUpdates}
                  onChange={handleChange}
                />
                <span>{t("contact.receiveUpdates")}</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeToPolicy"
                  checked={formData.agreeToPolicy}
                  onChange={handleChange}
                />
                <span>{t("contact.agreeToPolicy")}</span>
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? t("contact.sending") : t("contact.sendEnquiry")}
            </button>
          </form>
        </div>

        {/* ── Map Section ────────────────────────────────────────────── */}
        <div className="map-section">
          <iframe
            src="https://maps.google.com/maps?q=Herrlichkeit%2011,%2028857%20Syke,%20Germany&t=&z=10&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="500"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Barosche Location Map"
          />
        </div>
      </div>
    </>
  );
};

export default ContactPage;