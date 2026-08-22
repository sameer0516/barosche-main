const API_BASE = "https://api.barosche.com";
 
const FETCH_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
 
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
 
async function fetchWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            cache: "no-store",
        });
        return res;
    } finally {
        clearTimeout(timer);
    }
}
 
async function fetchAllProductsWithRetry() {
    let lastError = null;
 
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/api/products`, FETCH_TIMEOUT_MS);
 
            if (!res.ok) {
                throw new Error(`API responded with status ${res.status}`);
            }
 
            const data = await res.json();

            const products = Array.isArray(data) ? data : data.products;
 
            if (!Array.isArray(products)) {
                throw new Error("API response did not contain a products array");
            }
 
            if (attempt > 1) {
                console.log(`[staticParamsHelper] Succeeded on attempt ${attempt}/${MAX_RETRIES}`);
            }
 
            return products;
        } catch (err) {
            lastError = err;
            console.error(
                `[staticParamsHelper] Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`
            );
            if (attempt < MAX_RETRIES) {
                await sleep(RETRY_DELAY_MS * attempt);
            }
        }
    }
 
    throw lastError;
}
 
function normalizeCategory(cat = "") {
    return String(cat).toLowerCase().trim().replace(/\s+/g, " ");
}

function categoryMatches(productCategory, targetCategory) {
    const p = normalizeCategory(productCategory);
    const t = normalizeCategory(targetCategory);
 
    if (!p) return false;
    if (p === t) return true;
 
    switch (t) {
        case "rings":
            return p.includes("ring");
        case "earrings":
            return p.includes("earring");
        case "bracelets":
            return p.includes("bracelet");
        case "pendants":
            return p.includes("pendant");
        case "chosen":
        case "chosen jewellery":
            return p.includes("chosen");
        case "for today":
        case "for today jewellery":
            return p.includes("for today") || p.includes("fortoday");
        case "new":
        case "new in":
            return p.includes("new");
        case "mens":
        case "men":
            return p === "men" || p === "mens" || p.includes("men pendant");
        case "womens":
        case "women":
            return p === "women" || p === "womens" || p.includes("woman pendant");
        case "jewellery":
        case "jewelry":
            return p.includes("jewellery") || p.includes("jewelry");
        default:
            return false;
    }
}
 
export async function generateCategoryStaticParams(category) {
    try {
        const products = await fetchAllProductsWithRetry();
 
        const seenSlugs = new Set();
        const params = [];
 
        for (const product of products) {
            if (!product.slug) continue;
            if (!categoryMatches(product.category, category)) continue;
            if (seenSlugs.has(product.slug)) continue;
 
            seenSlugs.add(product.slug);
            params.push({ slug: product.slug });
        }
 
        if (params.length === 0) {
            console.warn(
                `[staticParamsHelper] No products matched category "${category}". ` +
                `Check the actual "category" values stored in MongoDB for a mismatch ` +
                `(casing, extra spaces, or a different spelling entirely).`
            );
            return [{ slug: "placeholder" }];
        }
 
        console.log(
            `[staticParamsHelper] Generated ${params.length} static params for category "${category}"`
        );
        return params;
    } catch (err) {
        console.error(
            `[staticParamsHelper] FALLING BACK to placeholder for category "${category}". ` +
            `Reason: ${err.message}. ` +
            `THIS MEANS REAL PRODUCT PAGES FOR THIS CATEGORY WILL 404 UNTIL THE NEXT SUCCESSFUL BUILD.`
        );
        return [{ slug: "placeholder" }];
    }
}