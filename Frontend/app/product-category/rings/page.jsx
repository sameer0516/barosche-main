import Script from "next/script";
import Rings from './Rings';

const SITE_URL = "https://barosche.com";
const API_BASE = "https://api.barosche.com";
const FETCH_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const PAGE_URL = "https://barosche.com/product-category/rings/";
const OG_IMAGE = "/barosche-1.webp";
const TITLE = "Buy Daily Wear Rings for Men & Women Online";
const DESCRIPTION =
  "Buy rings for men and women online with elegant daily wear and statement designs. Explore minimal, stylish, and gemstone rings for every occasion.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
async function getInitialProducts(category) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/api/products?category=${encodeURIComponent(category)}`,
        FETCH_TIMEOUT_MS
      );
      if (!res.ok) throw new Error(`API responded with status ${res.status}`);
      const data = await res.json();
      if (data.success) return data.products || [];
      throw new Error(data.message || "Failed to fetch products");
    } catch (err) {
      console.error(`[RingsPage] Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  console.error("[RingsPage] All retries failed — page will render with empty product list.");
  return [];
}

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: PAGE_URL,
  },

  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: "Barosche",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: OG_IMAGE,
        width: 480,
        height: 600,
        alt: "Barosche Rings Collection",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    site: "@barosche",
    creator: "@barosche",
    images: [
      {
        url: OG_IMAGE,
        alt: "Barosche Rings Collection",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

// --- SCHEMA DATA ----

// 1. ItemList schema
const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${PAGE_URL}#ring-product-list`,
  name: "Barosche Ring Collection",
  description: "Explore eight luxury rings from Barosche, including gold vermeil, sterling silver, tsavorite and diamond ring designs.",
  url: PAGE_URL,
  numberOfItems: 8,
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  itemListElement: [
    {
      "@type": "ListItem", position: 1, url: `${SITE_URL}/product-category/rings/vana-wave-ring/`,
      item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/vana-wave-ring/#product`, name: "Vana Wave Ring in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/rings/vana-wave-ring/`, image: "https://api.barosche.com/uploads/product-1782453465826-795697720.jpg", category: "Rings", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/rings/vana-wave-ring/#offer`, url: `${SITE_URL}/product-category/rings/vana-wave-ring/`, price: "149.00", priceCurrency: "EUR" } }
    },
    {
      "@type": "ListItem", position: 2, url: `${SITE_URL}/product-category/rings/saga-signet-ring/`,
      item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/saga-signet-ring/#product`, name: "Saga Signet Ring in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/rings/saga-signet-ring/`, image: "https://api.barosche.com/uploads/product-1782452664621-445895308.jpg", category: "Rings", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/rings/saga-signet-ring/#offer`, url: `${SITE_URL}/product-category/rings/saga-signet-ring/`, price: "129.00", priceCurrency: "EUR" } }
    },
    {
      "@type": "ListItem", position: 3, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`,
      item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#blue-product`, name: "Tsavorite & Diamond Band Ring in 18K Gold Vermeil (Blue)", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, image: "https://api.barosche.com/uploads/product-1780895710494-301031940.webp", category: "Rings", color: "Blue", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#blue-offer`, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, price: "449.00", priceCurrency: "EUR" } }
    },
    {
      "@type": "ListItem", position: 4, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`,
      item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#green-product`, name: "Tsavorite & Diamond Band Ring in 18K Gold Vermeil (Green)", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, image: "https://api.barosche.com/uploads/product-1782468075372-148062620.jpg", category: "Rings", color: "Green", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#green-offer`, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, price: "449.00", priceCurrency: "EUR" } }
    },
    {
      "@type": "ListItem", position: 5, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`,
      item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#red-product`, name: "Tsavorite & Diamond Band Ring in 18K Gold Vermeil (Red)", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, image: "https://api.barosche.com/uploads/product-1782468116341-429902230.jpg", category: "Rings", color: "Red", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#red-offer`, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, price: "449.00", priceCurrency: "EUR" } }
    },
    {
      "@type": "ListItem", position: 6, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`,
      item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#silver-product`, name: "Tsavorite & Diamond Band Ring in 925 Sterling Silver", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, image: "https://api.barosche.com/uploads/product-1781167277734-126489907.jpg", category: "Rings", color: "Silver", material: "925 Sterling Silver", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#silver-offer`, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, price: "449.00", priceCurrency: "EUR" } }
    },
    {
      "@type": "ListItem", position: 7, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/`,
      item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/#gold-vermeil-product`, name: "Tsavorite Garnet Ring in 18k Gold Vermeil", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/`, image: "https://api.barosche.com/uploads/product-1780743945301-64086007.webp", category: "Rings", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/#gold-vermeil-offer`, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/`, price: "369.00", priceCurrency: "EUR" } }
    },
    {
      "@type": "ListItem", position: 8, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/`,
      item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/#sterling-silver-product`, name: "Tsavorite Garnet Ring in 925 Sterling Silver", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/`, image: "https://api.barosche.com/uploads/product-1781166671471-325268961.jpeg", category: "Rings", material: "925 Sterling Silver", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/#sterling-silver-offer`, url: `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/`, price: "249.00", priceCurrency: "EUR" } }
    },
  ],
};

// 2. FAQPage schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${PAGE_URL}#faq`,
  url: `${PAGE_URL}#faq`,
  name: "Frequently Asked Questions About Rings",
  inLanguage: "en",
  isPartOf: { "@id": `${PAGE_URL}#webpage` },
  mainEntity: [
    { "@type": "Question", name: "What types of rings are available online?", acceptedAnswer: { "@type": "Answer", text: "You can find a wide range including gold rings, diamond rings, silver rings, statement rings, and everyday minimal rings." } },
    { "@type": "Question", name: "Are gold rings suitable for daily wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, many gold rings are designed to be lightweight and comfortable for everyday use." } },
    { "@type": "Question", name: "What is the difference between a diamond ring and a gemstone ring?", acceptedAnswer: { "@type": "Answer", text: "A diamond ring features diamonds, while gemstone rings include stones like ruby, sapphire, or emerald." } },
    { "@type": "Question", name: "Are silver rings good for everyday use?", acceptedAnswer: { "@type": "Answer", text: "Yes, silver rings and sterling silver rings are durable, stylish, and ideal for daily wear." } },
    { "@type": "Question", name: "Can men wear rings daily?", acceptedAnswer: { "@type": "Answer", text: "Yes, rings for men are designed for comfort and durability, making them suitable for everyday wear." } },
    { "@type": "Question", name: "What are statement rings?", acceptedAnswer: { "@type": "Answer", text: "Statement rings are bold, eye-catching designs meant to stand out and enhance your overall look." } },
    { "@type": "Question", name: "Are rings for women available in minimal designs?", acceptedAnswer: { "@type": "Answer", text: "Yes, rings for women include both minimal and statement styles for different preferences." } },
    { "@type": "Question", name: "How do I choose the right ring size online?", acceptedAnswer: { "@type": "Answer", text: "Measure your finger or use a ring size guide to ensure a comfortable fit." } },
    { "@type": "Question", name: "Can I wear multiple rings at the same time?", acceptedAnswer: { "@type": "Answer", text: "Yes, stacking rings is a popular trend for a stylish and personalized look." } },
    { "@type": "Question", name: "Are diamond rings only for special occasions?", acceptedAnswer: { "@type": "Answer", text: "No, many modern diamond rings are designed for both daily wear and special occasions." } },
    { "@type": "Question", name: "Which ring material is best for long-term use?", acceptedAnswer: { "@type": "Answer", text: "Gold and sterling silver rings are popular for their durability and long-lasting appeal." } },
    { "@type": "Question", name: "Are statement rings suitable for casual outfits?", acceptedAnswer: { "@type": "Answer", text: "Yes, statement rings can elevate casual outfits when styled correctly." } },
    { "@type": "Question", name: "What are stackable rings?", acceptedAnswer: { "@type": "Answer", text: "Stackable rings are designed to be worn together in layers for a trendy appearance." } },
    { "@type": "Question", name: "How do I maintain the shine of my rings?", acceptedAnswer: { "@type": "Answer", text: "Keep them away from water and chemicals, and clean them with a soft cloth regularly." } },
    { "@type": "Question", name: "Are rings a good gift option?", acceptedAnswer: { "@type": "Answer", text: "Yes, rings are timeless gifts perfect for birthdays, anniversaries, and special moments." } },
    { "@type": "Question", name: "Can I mix gold and silver rings together?", acceptedAnswer: { "@type": "Answer", text: "Yes, mixing metals is a modern trend and creates a unique style." } },
    { "@type": "Question", name: "Are lightweight rings durable?", acceptedAnswer: { "@type": "Answer", text: "Yes, well-crafted lightweight rings are designed for both comfort and durability." } },
    { "@type": "Question", name: "What are the latest trends in rings?", acceptedAnswer: { "@type": "Answer", text: "Popular trends include minimal rings, geometric designs, and stackable rings." } },
    { "@type": "Question", name: "Are unisex rings available?", acceptedAnswer: { "@type": "Answer", text: "Yes, many ring designs are versatile and suitable for both men and women." } },
    { "@type": "Question", name: "Why should I buy rings online?", acceptedAnswer: { "@type": "Answer", text: "Online shopping offers more variety, easy comparison, and convenient access to the latest designs." } },
  ],
};

// 3. CollectionPage schema
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: TITLE,
  headline: "Rings for Men & Women – Daily Wear, Statement & Gemstone Designs",
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    "@id": `${PAGE_URL}#primaryimage`,
    url: "https://barosche.com/logo.png",
    contentUrl: "https://barosche.com/logo.png",
    caption: "Barosche Rings Collection",
  },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
  mainEntity: { "@id": `${PAGE_URL}#ring-product-list` },
  hasPart: { "@id": `${PAGE_URL}#faq` },
};

// 4. BreadcrumbList schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${PAGE_URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Rings", item: PAGE_URL },
  ],
};

export default async function Page() {
  const initialProducts = await getInitialProducts("Rings");
  return (
    <>
      <Script
        id="rings-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="rings-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="rings-collectionpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <Script
        id="rings-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Rings initialProducts={initialProducts} />
    </>
  );
}