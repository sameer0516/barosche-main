const express = require("express");
const router = express.Router();

let fetchFn = global.fetch;
if (!fetchFn) {
    fetchFn = require("node-fetch");
    console.log("[pincode-lookup] global fetch nahi mila, node-fetch fallback use ho raha hai");
}

router.get("/pincode-lookup", async (req, res) => {
    const { country, zip } = req.query;
    console.log(`[pincode-lookup] request => country=${country} zip=${zip}`);

    if (!country || !zip) {
        return res.status(400).json({ error: "country aur zip dono required hain" });
    }

    const tryFetch = async (code) => {
        const url = `https://api.zippopotam.us/${country.toLowerCase()}/${encodeURIComponent(code)}`;
        try {
            const r = await fetchFn(url);
            console.log(`[pincode-lookup] zippopotam status=${r.status} for ${url}`);
            if (!r.ok) return null;
            const data = await r.json();
            const place = data?.places?.[0];
            if (!place) return null;
            return {
                city: place["place name"] || "",
                stateName: place["state"] || place["state abbreviation"] || "",
                country: country.toUpperCase(),
            };
        } catch (err) {
            console.error(`[pincode-lookup] fetch error for ${url}:`, err.message);
            return null;
        }
    };

    try {
        const trimmed = zip.trim();
        const noSpace = trimmed.replace(/\s+/g, "");

        let result = await tryFetch(trimmed);
        if (!result && noSpace !== trimmed) result = await tryFetch(noSpace);
        if (!result && noSpace.length > 3) result = await tryFetch(noSpace.slice(0, 3));

        if (!result) {
            console.log(`[pincode-lookup] no result found for country=${country} zip=${zip}`);
            return res.status(404).json({ error: "Address nahi mila is pincode ke liye" });
        }

        console.log(`[pincode-lookup] success:`, result);
        res.json(result);
    } catch (err) {
        console.error("[pincode-lookup] unexpected error:", err);
        res.status(500).json({ error: "Server error during pincode lookup", details: err.message });
    }
});

module.exports = router;