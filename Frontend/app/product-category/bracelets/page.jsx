import Script from "next/script";
import Bracelets from './Bracelets';

const SITE_URL = "https://barosche.com";
const API_BASE = "https://api.barosche.com";
const FETCH_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const PAGE_URL = "https://barosche.com/product-category/bracelets/";
const OG_IMAGE = "/Meta-image-3.jpg";
const TITLE = "Gold Bracelets for Women & Men | 18K Gold & Minimal Designs";
const DESCRIPTION =
  "Shop modern bracelet designs at Barosche. Find gold bracelets for women, refined men’s styles, and timeless 18K pieces crafted for everyday luxury.";

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
      console.error(`[BraceletsPage] Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  console.error("[BraceletsPage] All retries failed — page will render with empty product list.");
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
        alt: "Barosche Bracelets Collection",
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
        alt: "Barosche Bracelets Collection",
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
  "@id": `${PAGE_URL}#bracelet-product-list`,
  name: "Barosche Bracelet Collection",
  description: "Explore the luxury bracelet collection from Barosche, featuring elegant diamond and gold vermeil designs.",
  url: PAGE_URL,
  numberOfItems: 1,
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      url: `${SITE_URL}/product-category/bracelets/freyja-diamond-link-bracelet/`,
      item: {
        "@type": "Product",
        "@id": `${SITE_URL}/product-category/bracelets/freyja-diamond-link-bracelet/#product`,
        name: "Freyja Diamond Link Bracelet in 18kt Gold Vermeil",
        url: `${SITE_URL}/product-category/bracelets/freyja-diamond-link-bracelet/`,
        image: "https://api.barosche.com/uploads/product-1782451784924-120020543.jpg",
        category: "Bracelets",
        material: "18K Gold Vermeil",
        brand: { "@type": "Brand", name: "Barosche" },
        offers: {
          "@type": "Offer",
          "@id": `${SITE_URL}/product-category/bracelets/freyja-diamond-link-bracelet/#offer`,
          url: `${SITE_URL}/product-category/bracelets/freyja-diamond-link-bracelet/`,
          price: "249.00",
          priceCurrency: "EUR"
        }
      }
    },
  ],
};

// 2. FAQPage schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${PAGE_URL}#faq`,
  url: `${PAGE_URL}#faq`,
  name: "Frequently Asked Questions About Bracelets",
  inLanguage: "en",
  isPartOf: { "@id": `${PAGE_URL}#webpage` },
  mainEntity: [
    { "@type": "Question", name: "What types of bracelets are available online?", acceptedAnswer: { "@type": "Answer", text: "You can find gold bracelets, silver bracelets, gemstone bracelets, minimal bracelets, and statement designs." } },
    { "@type": "Question", name: "Are bracelets suitable for daily wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, many lightweight and minimal bracelets are designed for comfortable everyday use." } },
    { "@type": "Question", name: "What are stackable bracelets?", acceptedAnswer: { "@type": "Answer", text: "Stackable bracelets are designed to be worn together to create a layered and trendy look." } },
    { "@type": "Question", name: "Can men wear bracelets daily?", acceptedAnswer: { "@type": "Answer", text: "Yes, bracelets for men are designed with durable and comfortable materials for everyday use." } },
    { "@type": "Question", name: "Are gold bracelets good for long-term wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, gold bracelets are durable, timeless, and maintain their shine for years with proper care." } },
    { "@type": "Question", name: "What is the difference between minimal and statement bracelets?", acceptedAnswer: { "@type": "Answer", text: "Minimal bracelets are simple and subtle, while statement bracelets are bold and designed to stand out." } },
    { "@type": "Question", name: "Are gemstone bracelets real stones?", acceptedAnswer: { "@type": "Answer", text: "They may include natural, semi-precious, or synthetic gemstones depending on the design." } },
    { "@type": "Question", name: "How do I choose the right bracelet size?", acceptedAnswer: { "@type": "Answer", text: "Measure your wrist and choose a size that fits comfortably without being too tight or loose." } },
    { "@type": "Question", name: "Can I wear multiple bracelets together?", acceptedAnswer: { "@type": "Answer", text: "Yes, stacking multiple bracelets is a popular modern fashion trend." } },
    { "@type": "Question", name: "Are bracelets suitable for gifting?", acceptedAnswer: { "@type": "Answer", text: "Yes, bracelets are meaningful gifts perfect for birthdays, anniversaries, and special occasions." } },
    { "@type": "Question", name: "Which bracelets are best for office wear?", acceptedAnswer: { "@type": "Answer", text: "Minimal and lightweight bracelets are ideal for professional and office settings." } },
    { "@type": "Question", name: "Do bracelets match both western and ethnic outfits?", acceptedAnswer: { "@type": "Answer", text: "Yes, versatile bracelet designs can be styled with both western and traditional outfits." } },
    { "@type": "Question", name: "What materials are used in bracelets?", acceptedAnswer: { "@type": "Answer", text: "Common materials include gold, silver, stainless steel, alloy, and gemstones." } },
    { "@type": "Question", name: "Are lightweight bracelets durable?", acceptedAnswer: { "@type": "Answer", text: "Yes, well-crafted lightweight bracelets are designed for both comfort and durability." } },
    { "@type": "Question", name: "What are geometric bracelets?", acceptedAnswer: { "@type": "Answer", text: "Geometric bracelets feature modern shapes and structured designs for a stylish look." } },
    { "@type": "Question", name: "How do I maintain my bracelets?", acceptedAnswer: { "@type": "Answer", text: "Avoid water, perfumes, and chemicals, and store them in a dry place to maintain shine." } },
    { "@type": "Question", name: "Are unisex bracelets available?", acceptedAnswer: { "@type": "Answer", text: "Yes, many bracelet designs are suitable for both men and women." } },
    { "@type": "Question", name: "What bracelets are trending right now?", acceptedAnswer: { "@type": "Answer", text: "Minimal, stackable, geometric, and textured bracelets are currently trending." } },
    { "@type": "Question", name: "Can bracelets be worn at parties and events?", acceptedAnswer: { "@type": "Answer", text: "Yes, statement and gemstone bracelets are perfect for special occasions." } },
    { "@type": "Question", name: "Why should I buy bracelets online?", acceptedAnswer: { "@type": "Answer", text: "Online shopping offers more variety, better comparison, and access to the latest designs easily." } },
  ],
};

// 3. CollectionPage schema
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: TITLE,
  headline: "Gold Bracelets for Women & Men",
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    "@id": `${PAGE_URL}#primaryimage`,
    url: "https://barosche.com/logo.png",
    contentUrl: "https://barosche.com/logo.png",
    caption: "Barosche Bracelets Collection",
  },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
  mainEntity: { "@id": `${PAGE_URL}#bracelet-product-list` },
  hasPart: { "@id": `${PAGE_URL}#faq` },
};

// 4. BreadcrumbList schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${PAGE_URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Bracelets", item: PAGE_URL },
  ],
};

export default async function Page() {
  const initialProducts = await getInitialProducts("Bracelets");
  return (
    <>
      <Script
        id="bracelets-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="bracelets-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="bracelets-collectionpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <Script
        id="bracelets-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Bracelets initialProducts={initialProducts} />
    </>
  );
}