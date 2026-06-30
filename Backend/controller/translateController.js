const axios = require("axios");

const countryToLanguage = {
    IN: "hi", US: "en", GB: "en", AU: "en", CA: "en",
    DE: "de", FR: "fr", ES: "es", AR: "es", BR: "pt",
    PT: "pt", RU: "ru", CN: "zh", JP: "ja", KR: "ko",
    SA: "ar", AE: "ar", PK: "ur", BD: "bn", IT: "it",
    NL: "nl", TR: "tr", ID: "id", TH: "th", VN: "vi",
    PL: "pl", SE: "sv", NO: "no", DK: "da", FI: "fi",
    GR: "el", CZ: "cs", HU: "hu", RO: "ro", UA: "uk",
    IL: "he", IR: "fa", AF: "ps", NP: "ne", LK: "si",
    MM: "my", KH: "km", ET: "am", NG: "yo", ZA: "zu",
    EG: "ar", MA: "ar", MX: "es", CO: "es", PE: "es",
    VE: "es", CL: "es",
};

const languageNames = {
    hi: "Hindi", en: "English", de: "German", fr: "French",
    es: "Spanish", pt: "Portuguese", ru: "Russian", zh: "Chinese",
    ja: "Japanese", ko: "Korean", ar: "Arabic", ur: "Urdu",
    bn: "Bengali", it: "Italian", nl: "Dutch", tr: "Turkish",
    id: "Indonesian", th: "Thai", vi: "Vietnamese", pl: "Polish",
    sv: "Swedish", no: "Norwegian", da: "Danish", fi: "Finnish",
    el: "Greek", cs: "Czech", hu: "Hungarian", ro: "Romanian",
    uk: "Ukrainian", he: "Hebrew", fa: "Persian", ps: "Pashto",
    ne: "Nepali", si: "Sinhala", my: "Burmese", km: "Khmer",
    am: "Amharic", yo: "Yoruba", zu: "Zulu",
};

// Get country from IP
const getCountryFromIP = async (ip) => {
    try {
        if (
            ip === "127.0.0.1" ||
            ip === "::1" ||
            ip.startsWith("192.168") ||
            ip.startsWith("10.")
        ) {
            return "US";
        }

        const response = await axios.get(`https://ipapi.co/${ip}/json/`, {
            timeout: 5000,
        });

        if (response.data && response.data.country_code) {
            return response.data.country_code;
        }

        return "US";
    } catch (error) {
        console.error("IP lookup error:", error.message);
        return "US";
    }
};

const detectLanguage = async (req, res) => {
    try {
        const ip =
            req.headers["cf-connecting-ip"] ||
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.headers["x-real-ip"] ||
            req.ip ||
            req.socket.remoteAddress;

        const countryCode = await getCountryFromIP(ip.trim());
        const languageCode = countryToLanguage[countryCode] || "en";
        const languageName = languageNames[languageCode] || "English";

        res.json({
            success: true,
            ip: ip.trim(),
            countryCode,
            languageCode,
            languageName,
        });
    } catch (error) {
        console.error("Detect language error:", error);
        res.status(500).json({
            success: false,
            message: "Language detection failed",
            languageCode: "en",
            languageName: "English",
        });
    }
};

const translateText = async (req, res) => {
    try {
        const { texts, targetLanguage, sourceLanguage = "en" } = req.body;

        if (!texts || !Array.isArray(texts) || texts.length === 0) {
            return res.status(400).json({ success: false, message: "texts array is required" });
        }

        if (targetLanguage === "en" || targetLanguage === sourceLanguage) {
            return res.json({ success: true, translations: texts, targetLanguage });
        }

        const CHUNK = 50;
        const allTranslations = [];

        for (let i = 0; i < texts.length; i += CHUNK) {
            const chunk = texts.slice(i, i + CHUNK);
            const joined = chunk.join("\n|||\n");

            try {
                const response = await axios.get(
                    "https://translate.googleapis.com/translate_a/single",
                    {
                        params: {
                            client: "gtx",
                            sl: sourceLanguage,
                            tl: targetLanguage,
                            dt: "t",
                            q: joined,
                        },
                        timeout: 10000,
                    }
                );

                const raw = response.data[0]
                    .map((item) => item[0])
                    .join("")
                    .split("\n|||\n");

                allTranslations.push(...raw.map((t, idx) => t?.trim() || chunk[idx]));
            } catch {
                allTranslations.push(...chunk);
            }
        }

        res.json({ success: true, translations: allTranslations, targetLanguage });

    } catch (error) {
        console.error("Translation error:", error.message);
        res.status(500).json({ success: false, message: "Translation failed" });
    }
};

const getSupportedLanguages = async (req, res) => {
    try {
        const languages = Object.entries(languageNames).map(([code, name]) => ({
            code,
            name,
        }));

        res.json({
            success: true,
            languages,
            total: languages.length,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get languages" });
    }
};

module.exports = {
    detectLanguage,
    translateText,
    getSupportedLanguages,
};