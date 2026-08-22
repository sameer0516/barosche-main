"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/languageContext";

const LANGUAGES = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "pt", name: "Portuguese", flag: "🇧🇷" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "tr", name: "Turkish", flag: "🇹🇷" },
    { code: "ur", name: "Urdu", flag: "🇵🇰" },
    { code: "bn", name: "Bengali", flag: "🇧🇩" },
    { code: "id", name: "Indonesian", flag: "🇮🇩" },
    { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
    { code: "nl", name: "Dutch", flag: "🇳🇱" },
];

export default function LanguageSelector() {
    const { language, languageName, setLanguage, isLoading } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Outside click se close karo
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const current = LANGUAGES.find((l) => l.code === language);

    const handleSelect = async (code: string, name: string) => {
        setOpen(false);
        await setLanguage(code, name);
    };

    return (
        <>
            <div ref={ref} className="relative inline-block">
                {/* Trigger Button */}
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition text-sm font-medium text-gray-700 shadow-sm disabled:opacity-60"
                    aria-label="Select language"
                >
                    <span className="text-base leading-none">{current?.flag ?? "🌐"}</span>
                    <span className="hidden sm:inline">{current?.name ?? languageName}</span>
                    {isLoading ? (
                        <svg className="animate-spin h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                    ) : (
                        <svg
                            className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                            viewBox="0 0 20 20" fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>

                {/* Dropdown */}
                {open && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg z-50 py-1 overflow-hidden">
                        <div className="px-3 py-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wider border-b border-gray-100">
                            Select Language
                        </div>
                        <ul className="max-h-64 overflow-y-auto">
                            {LANGUAGES.map((lang) => (
                                <li key={lang.code}>
                                    <button
                                        onClick={() => handleSelect(lang.code, lang.name)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition text-left ${language === lang.code
                                                ? "text-indigo-600 font-semibold bg-indigo-50"
                                                : "text-gray-700"
                                            }`}
                                    >
                                        <span className="text-base">{lang.flag}</span>
                                        <span>{lang.name}</span>
                                        {language === lang.code && (
                                            <svg className="ml-auto h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.704 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
}