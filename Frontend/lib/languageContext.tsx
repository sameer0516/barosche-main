"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
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
  language: "en",
  languageName: "English",
  countryCode: "US",
  isLoading: true,
  setLanguage: () => {},
  t: (k) => k,
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.barosche.com";
const LS_CACHE_KEY = "translationCache_v1";
const LS_LANG_KEY = "userLang";
const LS_LANG_NAME_KEY = "userLangName";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** { nav: { home: "Home" } }  →  { "nav.home": "Home" } */
function flatten(
  obj: Record<string, any>,
  prefix = ""
): Record<string, string> {
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

/** { "nav.home": "होम" }  →  { nav: { home: "होम" } } */
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

function loadCache(): Record<string, Record<string, string>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, Record<string, string>>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage quota exceeded — ignore silently
  }
}

/** Translate all values in `flat` to `lang` via your backend, in chunks of 100 */
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
        body: JSON.stringify({
          texts: chunk,
          targetLanguage: lang,
          sourceLanguage: "en",
        }),
      });
      const data = await res.json();
      translated.push(...(data.success ? data.translations : chunk));
    } catch {
      translated.push(...chunk); // fallback: keep original
    }
  }

  return Object.fromEntries(keys.map((k, i) => [k, translated[i] ?? flat[k]]));
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState("en");
  const [languageName, setLangName] = useState("English");
  const [countryCode, setCountryCode] = useState("US");
  const [isLoading, setIsLoading] = useState(true);

  // Flat English strings loaded once from en.json
  const [enFlat, setEnFlat] = useState<Record<string, string>>({});
  // Current translated message tree
  const [messages, setMessages] = useState<Record<string, any>>({});

  // ── Step 1: Load en.json once ──────────────────────────────────────────
  useEffect(() => {
    // ⚠️  Adjust this import path to match your actual file location:
    //   src/messages/en.json          → "../messages/en.json"
    //   src/app/messages/en.json      → "./messages/en.json"  (if this file is in src/app/)
    import("../app/messages/en.json")
      .then((mod) => {
        const data = mod.default ?? mod;
        setEnFlat(flatten(data as Record<string, any>));
        setMessages(data as Record<string, any>); // start with English
      })
      .catch((err) => {
        console.error("[LanguageProvider] Failed to load en.json:", err);
        setIsLoading(false);
      });
  }, []);

  // ── Helper: apply a language from enFlat ─────────────────────────────
  const applyLang = useCallback(
    async (lang: string, flat: Record<string, string>) => {
      // English → no translation needed
      if (lang === "en") {
        setMessages(unflatten(flat));
        setIsLoading(false);
        return;
      }

      // Check localStorage cache first
      const cache = loadCache();
      if (cache[lang]) {
        setMessages(unflatten(cache[lang]));
        setIsLoading(false);
        return;
      }

      // Fetch translation from backend
      try {
        setIsLoading(true);
        const translated = await translateAll(flat, lang);
        // Persist in cache
        saveCache({ ...cache, [lang]: translated });
        setMessages(unflatten(translated));
      } catch {
        setMessages(unflatten(flat)); // fallback to English
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ── Step 2: Auto-detect / restore language once enFlat is ready ───────
  useEffect(() => {
    if (Object.keys(enFlat).length === 0) return;

    const detect = async () => {
      setIsLoading(true);
      try {
        // Restore manually-chosen language
        const savedLang = localStorage.getItem(LS_LANG_KEY);
        const savedName = localStorage.getItem(LS_LANG_NAME_KEY);
        if (savedLang) {
          setLang(savedLang);
          setLangName(savedName ?? savedLang);
          await applyLang(savedLang, enFlat);
          return;
        }

        // Auto-detect from IP via backend
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
        // Network error → stay in English
        setIsLoading(false);
      }
    };

    detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enFlat]);

  // ── Manual language switch (from LanguageSwitcher dropdown) ──────────
  const setLanguage = useCallback(
    async (lang: string, name?: string) => {
      setLang(lang);
      if (name) {
        setLangName(name);
        localStorage.setItem(LS_LANG_NAME_KEY, name);
      }
      localStorage.setItem(LS_LANG_KEY, lang);
      await applyLang(lang, enFlat);
    },
    [enFlat, applyLang]
  );

  // ── t("contact.title") → translated string ────────────────────────────
  const t = useCallback(
    (key: string): string => {
      const parts = key.split(".");
      let val: any = messages;
      for (const part of parts) {
        if (val && typeof val === "object" && part in val) {
          val = val[part];
        } else {
          return key; // key not found → return key itself as fallback
        }
      }
      return typeof val === "string" ? val : key;
    },
    [messages]
  );

  return (
    <LanguageContext.Provider
      value={{ language, languageName, countryCode, isLoading, setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}