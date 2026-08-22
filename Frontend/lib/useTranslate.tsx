"use client";

import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from "react";

interface LanguageContextType {
  language: string;
  languageName: string;
  countryCode: string;
  isLoading: boolean;
  setLanguage: (lang: string, name?: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en", languageName: "English",
  countryCode: "US", isLoading: true,
  setLanguage: () => {}, t: (k) => k,
});

const BACKEND_URL = "https://api.barosche.com";

// { nav: { home: "Home" } } → { "nav.home": "Home" }
function flatten(obj: Record<string, any>, prefix = ""): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, key) => {
    const k = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(acc, flatten(obj[key], k));
    } else {
      acc[k] = String(obj[key]);
    }
    return acc;
  }, {});
}

// { "nav.home": "होम" } → { nav: { home: "होम" } }
function unflatten(flat: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(flat)) {
    const keys = key.split(".");
    let cur = result;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = value;
  }
  return result;
}

// en.json ke saare values ko Google Translate se translate karo
async function translateAll(
  flat: Record<string, string>,
  lang: string
): Promise<Record<string, string>> {
  const keys = Object.keys(flat);
  const values = Object.values(flat);
  const CHUNK = 100;
  const translated: string[] = [];

  for (let i = 0; i < values.length; i += CHUNK) {
    const chunk = values.slice(i, i + CHUNK);
    try {
      const res = await fetch(`${BACKEND_URL}/api/translate/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: chunk, targetLanguage: lang, sourceLanguage: "en" }),
      });
      const data = await res.json();
      translated.push(...(data.success ? data.translations : chunk));
    } catch {
      translated.push(...chunk);
    }
  }

  return Object.fromEntries(keys.map((k, i) => [k, translated[i] || flat[k]]));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState("en");
  const [languageName, setLangName] = useState("English");
  const [countryCode, setCountryCode] = useState("US");
  const [isLoading, setIsLoading] = useState(true);
  const [enFlat, setEnFlat] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Record<string, any>>({});
  // Cache: { "hi": { "nav.home": "होम" }, "fr": {...} }
  const [cache, setCache] = useState<Record<string, Record<string, string>>>({});

  // Sirf en.json ek baar load karo
  useEffect(() => {
    import("../app/messages/en.json")
      .then((mod) => {
        const data = mod.default || mod;
        setEnFlat(flatten(data));
        setMessages(data); // default = English
      })
      .catch(console.error);
  }, []);

  // Language apply karo
  const applyLang = useCallback(
    async (lang: string, flat: Record<string, string>) => {
      if (lang === "en") {
        setMessages(unflatten(flat));
        setIsLoading(false);
        return;
      }
      // Cache hit → no API call
      if (cache[lang]) {
        setMessages(unflatten(cache[lang]));
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const translated = await translateAll(flat, lang);
        setCache((prev) => ({ ...prev, [lang]: translated }));
        setMessages(unflatten(translated));
      } catch {
        setMessages(unflatten(flat));
      } finally {
        setIsLoading(false);
      }
    },
    [cache]
  );

  // en.json load hone ke baad language detect karo
  useEffect(() => {
    if (Object.keys(enFlat).length === 0) return;

    const detect = async () => {
      setIsLoading(true);
      try {
        // User ne pehle manually choose kiya tha?
        const savedLang = localStorage.getItem("userLang");
        const savedName = localStorage.getItem("userLangName");
        if (savedLang) {
          setLang(savedLang);
          setLangName(savedName || savedLang);
          await applyLang(savedLang, enFlat);
          return;
        }

        // IP se detect karo (local pe DEFAULT_COUNTRY use hoga)
        const res = await fetch(`${BACKEND_URL}/api/translate/detect-language`);
        const data = await res.json();
        if (data.success) {
          setLang(data.languageCode);
          setLangName(data.languageName);
          setCountryCode(data.countryCode);
          await applyLang(data.languageCode, enFlat);
        } else {
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    };

    detect();
  }, [enFlat]); // enFlat load hone par ek baar chalega

  // Manual language switch (dropdown se)
  const setLanguage = useCallback(
    async (lang: string, name?: string) => {
      setLang(lang);
      if (name) { setLangName(name); localStorage.setItem("userLangName", name); }
      localStorage.setItem("userLang", lang);
      await applyLang(lang, enFlat);
    },
    [enFlat, applyLang]
  );

  // t("nav.home") → translated string
  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let val: any = messages;
      for (const k of keys) {
        if (val && typeof val === "object" && k in val) val = val[k];
        else return key;
      }
      return typeof val === "string" ? val : key;
    },
    [messages]
  );

  return (
    <LanguageContext.Provider value={{ language, languageName, countryCode, isLoading, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
}