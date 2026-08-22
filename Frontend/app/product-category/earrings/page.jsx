import { Suspense } from "react";
import Earrings from './Earrings';

const SITE_URL = "https://barosche.com";
const API_BASE = "https://api.barosche.com";
const FETCH_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

const PAGE_URL = "https://barosche.com/product-category/earrings/";
const OG_IMAGE = "/Meta-image-1.jpg";
const TITLE = "Shop Elegant Daily Wear Earrings for Women Online";
const DESCRIPTION =
  "Buy elegant daily wear earrings for women online. Explore minimal, stylish, and statement designs perfect for everyday wear, office looks, and special occasions.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, cache: "no-store" });
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
      console.error(`[EarringsPage] Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS * attempt);
    }
  }
  console.error("[EarringsPage] All retries failed — page will render with empty product list.");
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
        alt: "Barosche Earrings Collection",
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
        alt: "Barosche Earrings Collection",
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

const schemaData = [

  // 1. ItemList schema
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${PAGE_URL}#earring-product-list`,
    name: "Barosche Earrings Collection",
    description: "Explore 11 luxury earrings from Barosche, including gemstone studs, hoop earrings and drop earrings in gold vermeil and sterling silver.",
    url: PAGE_URL,
    numberOfItems: 11,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: [
      {
        "@type": "ListItem", position: 1, url: `${SITE_URL}/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/#product`, name: "Smoky Quartz Stud Earrings in 18K Gold Vermeil", url: `${SITE_URL}/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/`, image: "https://api.barosche.com/uploads/product-1780898749981-710522701.jpg", category: "Earrings", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/#offer`, url: `${SITE_URL}/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/`, price: "169.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 2, url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#amethyst-product`, name: "Cushion Cut Amethyst Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782468017738-598067497.jpg", category: "Earrings", color: "Purple", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#amethyst-offer`, url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, price: "299.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 3, url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#citrine-product`, name: "Citrine Cushion Drop Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782465917541-565503874.jpg", category: "Earrings", color: "Yellow", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#citrine-offer`, url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, price: "299.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 4, url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#turquoise-product`, name: "Turquoise Cushion Drop Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782467875927-981423839.jpg", category: "Earrings", color: "Turquoise", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#turquoise-offer`, url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, price: "249.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 5, url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#smoky-quartz-product`, name: "Smoky Quartz Drop Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782467804369-298510018.jpg", category: "Earrings", color: "Brown", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#smoky-quartz-offer`, url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, price: "299.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 6, url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#blue-topaz-product`, name: "Blue Topaz Drop Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782471658714-315426884.jpg", category: "Earrings", color: "Blue", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#blue-topaz-offer`, url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, price: "299.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 7, url: `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/#citrine-product`, name: "Citrine Trillion Cut & Diamond Drop Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/`, image: "https://api.barosche.com/uploads/product-1782466804238-503805218.jpg", category: "Earrings", color: "Yellow", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/#citrine-offer`, url: `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/`, price: "299.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 8, url: `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/#amethyst-product`, name: "Amethyst Trillion Cut Drop Hoop Earrings in 925 Sterling Silver", url: `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/`, image: "https://api.barosche.com/uploads/product-1782736794731-394134343.png", category: "Earrings", color: "Purple", material: "925 Sterling Silver", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/#amethyst-offer`, url: `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/`, price: "299.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 9, url: `${SITE_URL}/product-category/earrings/freyja-teardrop-earrings/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/freyja-teardrop-earrings/#product`, name: "Freyja Teardrop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/freyja-teardrop-earrings/`, image: "https://api.barosche.com/uploads/product-1782453811926-982328024.jpg", category: "Earrings", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/freyja-teardrop-earrings/#offer`, url: `${SITE_URL}/product-category/earrings/freyja-teardrop-earrings/`, price: "169.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 10, url: `${SITE_URL}/product-category/earrings/valkyrie-hoop-earrings/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/valkyrie-hoop-earrings/#product`, name: "Valkyrie Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/valkyrie-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782454004823-309551736.jpg", category: "Earrings", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/valkyrie-hoop-earrings/#offer`, url: `${SITE_URL}/product-category/earrings/valkyrie-hoop-earrings/`, price: "199.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 11, url: `${SITE_URL}/product-category/earrings/aurora-duo-drop-earrings/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/aurora-duo-drop-earrings/#product`, name: "Aurora Duo Drop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/aurora-duo-drop-earrings/`, image: "https://api.barosche.com/uploads/product-1782730319023-201434062.jpg", category: "Earrings", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/earrings/aurora-duo-drop-earrings/#offer`, url: `${SITE_URL}/product-category/earrings/aurora-duo-drop-earrings/`, price: "449.00", priceCurrency: "EUR" } }
      },
    ],
  },

  // 2. FAQPage schema
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${PAGE_URL}#faq`,
    url: `${PAGE_URL}#faq`,
    name: "Frequently Asked Questions About Earrings",
    inLanguage: "en",
    isPartOf: { "@id": `${PAGE_URL}#webpage` },
    mainEntity: [
      { "@type": "Question", name: "What types of earrings are available online?", acceptedAnswer: { "@type": "Answer", text: "You can find gold earrings, everyday earrings, studs, hoops, drop earrings, and statement designs." } },
      { "@type": "Question", name: "Are gold earrings suitable for daily wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, lightweight gold earrings are perfect for comfortable everyday use." } },
      { "@type": "Question", name: "What are everyday earrings?", acceptedAnswer: { "@type": "Answer", text: "Everyday earrings are lightweight, minimal designs made for long hours of daily wear." } },
      { "@type": "Question", name: "Which earrings are best for office wear?", acceptedAnswer: { "@type": "Answer", text: "Stud earrings and small hoops are best for a clean and professional look." } },
      { "@type": "Question", name: "Are earrings good for gifting?", acceptedAnswer: { "@type": "Answer", text: "Yes, earrings are a timeless and meaningful gift for all occasions." } },
      { "@type": "Question", name: "What materials are used in earrings?", acceptedAnswer: { "@type": "Answer", text: "Common materials include gold, gold-plated alloys, sterling silver, and stainless steel." } },
      { "@type": "Question", name: "What are hoop earrings?", acceptedAnswer: { "@type": "Answer", text: "Hoop earrings are circular or semi-circular designs that offer a trendy and modern look." } },
      { "@type": "Question", name: "Can I wear earrings every day?", acceptedAnswer: { "@type": "Answer", text: "Yes, especially lightweight and skin-friendly designs made for daily use." } },
      { "@type": "Question", name: "Do gold earrings require special care?", acceptedAnswer: { "@type": "Answer", text: "Yes, avoid chemicals and store them safely to maintain shine and quality." } },
      { "@type": "Question", name: "Are earrings available in minimal designs?", acceptedAnswer: { "@type": "Answer", text: "Yes, minimal earrings are widely available for everyday elegance." } },
      { "@type": "Question", name: "What are drop earrings?", acceptedAnswer: { "@type": "Answer", text: "Drop earrings hang below the earlobe and are often worn for elegant or festive looks." } },
      { "@type": "Question", name: "Are earrings comfortable for long wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, everyday earrings are designed for comfort and long-hour use." } },
      { "@type": "Question", name: "Can earrings match both western and ethnic outfits?", acceptedAnswer: { "@type": "Answer", text: "Yes, versatile designs can complement both traditional and modern outfits." } },
      { "@type": "Question", name: "What are statement earrings?", acceptedAnswer: { "@type": "Answer", text: "Statement earrings are bold, eye-catching designs meant to stand out." } },
      { "@type": "Question", name: "Are silver earrings good for daily use?", acceptedAnswer: { "@type": "Answer", text: "Yes, silver earrings are lightweight, durable, and perfect for daily styling." } },
      { "@type": "Question", name: "How do I choose the right earrings?", acceptedAnswer: { "@type": "Answer", text: "Consider style, comfort, material, and occasion before selecting earrings." } },
      { "@type": "Question", name: "Are gold-plated earrings durable?", acceptedAnswer: { "@type": "Answer", text: "Yes, with proper care they remain shiny and durable for long-term use." } },
      { "@type": "Question", name: "Can I wear earrings while sleeping?", acceptedAnswer: { "@type": "Answer", text: "It is recommended to remove earrings while sleeping to avoid damage or discomfort." } },
      { "@type": "Question", name: "What earrings are trending right now?", acceptedAnswer: { "@type": "Answer", text: "Minimal studs, hoops, geometric, and layered designs are currently trending." } },
      { "@type": "Question", name: "Why should I buy earrings online?", acceptedAnswer: { "@type": "Answer", text: "Online shopping offers more variety, better comparison, and convenient access to the latest designs." } },
    ],
  },

  // 3. CollectionPage schema
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: TITLE,
    headline: "Elegant Daily Wear Earrings for Women",
    description: DESCRIPTION,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      "@id": `${PAGE_URL}#primaryimage`,
      url: "https://barosche.com/logo.png",
      contentUrl: "https://barosche.com/logo.png",
      caption: "Barosche Earrings Collection",
    },
    breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    mainEntity: { "@id": `${PAGE_URL}#earring-product-list` },
    hasPart: { "@id": `${PAGE_URL}#faq` },
  },

  // 4. BreadcrumbList schema
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${PAGE_URL}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Earrings", item: PAGE_URL },
    ],
  },
];

async function EarringsData() {
  const initialProducts = await getInitialProducts("Earrings");
  return <Earrings initialProducts={initialProducts} />;
}

export default function Page() {
  return (
    <>
      {schemaData.map((schema, index) => (
        <script
          key={schema["@id"] || index}
          id={`schema-${schema["@type"]}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Suspense fallback={<div>Loading products...</div>}>
        <EarringsData />
      </Suspense>
    </>
  );
}