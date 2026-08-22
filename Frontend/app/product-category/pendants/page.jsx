import Script from "next/script";
import Pendant from './Pendant';

const SITE_URL = "https://barosche.com";
const API_BASE = "https://api.barosche.com";
const FETCH_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const PAGE_URL = "https://barosche.com/product-category/pendants/";
const OG_IMAGE = "/Meta-image-2.jpg";
const TITLE = "Shop Stylish Minimal & Gemstone Daily-Wear Pendants for Women";
const DESCRIPTION =
  "Shop pendants jewellery online with elegant, minimal, and gemstone designs. Perfect for daily wear, gifting, and adding effortless style to any outfit.";

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
        alt: "Barosche Pendants Collection",
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
        alt: "Barosche Pendants Collection",
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
    "@id": `${PAGE_URL}#pendant-product-list`,
    name: "Barosche Pendant Collection",
    description: "Explore five luxury pendants from Barosche, including gemstone, gold vermeil and sterling silver pendant designs.",
    url: PAGE_URL,
    numberOfItems: 5,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: [
      {
        "@type": "ListItem", position: 1, url: `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/#citrine-product`, name: "Citrine Cushion Cut Pendant in 18k Gold Vermeil", url: `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/`, image: "https://api.barosche.com/uploads/product-1780748204236-149969810.jpg", category: "Pendants", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/#citrine-offer`, url: `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/`, price: "159.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 2, url: `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/#swiss-blue-topaz-product`, name: "Swiss Blue Topaz Cushion Cut Pendant in 925 Sterling Silver", url: `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/`, image: "https://api.barosche.com/uploads/product-1781166489628-170839036.jpg", category: "Pendants", color: "Blue", material: "925 Sterling Silver", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/#swiss-blue-topaz-offer`, url: `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/`, price: "249.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 3, url: `${SITE_URL}/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/#product`, name: "Blue Turquoise Gold Plated Pendant in 18k Gold Vermeil", url: `${SITE_URL}/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/`, image: "https://api.barosche.com/uploads/product-1780899826602-381003277.jpg", category: "Pendants", color: "Blue", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/#offer`, url: `${SITE_URL}/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/`, price: "249.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 4, url: `${SITE_URL}/product-category/pendants/eira-oval-pendant/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/pendants/eira-oval-pendant/#product`, name: "Eira Oval Pendant in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/pendants/eira-oval-pendant/`, image: "https://api.barosche.com/uploads/product-1782453077052-617197794.jpg", category: "Pendants", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/pendants/eira-oval-pendant/#offer`, url: `${SITE_URL}/product-category/pendants/eira-oval-pendant/`, price: "149.00", priceCurrency: "EUR" } }
      },
      {
        "@type": "ListItem", position: 5, url: `${SITE_URL}/product-category/pendants/sol-spiral-pendant/`,
        item: { "@type": "Product", "@id": `${SITE_URL}/product-category/pendants/sol-spiral-pendant/#product`, name: "Sól Spiral Pendant in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/pendants/sol-spiral-pendant/`, image: "https://api.barosche.com/uploads/product-1782453326085-355591573.jpg", category: "Pendants", material: "18K Gold Vermeil", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", "@id": `${SITE_URL}/product-category/pendants/sol-spiral-pendant/#offer`, url: `${SITE_URL}/product-category/pendants/sol-spiral-pendant/`, price: "149.00", priceCurrency: "EUR" } }
      },
    ],
  },

  // 2. FAQPage schema
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${PAGE_URL}#faq`,
    url: `${PAGE_URL}#faq`,
    name: "Frequently Asked Questions About Pendants",
    inLanguage: "en",
    isPartOf: { "@id": `${PAGE_URL}#webpage` },
    mainEntity: [
      { "@type": "Question", name: "What are pendants in jewellery?", acceptedAnswer: { "@type": "Answer", text: "Pendants are decorative jewellery pieces that hang from a chain and enhance the beauty of a necklace." } },
      { "@type": "Question", name: "Can pendants be worn daily?", acceptedAnswer: { "@type": "Answer", text: "Yes, minimal and lightweight pendants are perfect for everyday wear." } },
      { "@type": "Question", name: "What types of pendants are available?", acceptedAnswer: { "@type": "Answer", text: "You can find gold pendants, gemstone pendants, minimalist pendants, and statement designs." } },
      { "@type": "Question", name: "What is a gold pendant?", acceptedAnswer: { "@type": "Answer", text: "A gold pendant is crafted in gold or gold-plated material, offering a timeless and elegant look." } },
      { "@type": "Question", name: "Are gemstone pendants suitable for daily wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, lightweight gemstone pendants can be worn daily, but they are especially popular for special occasions." } },
      { "@type": "Question", name: "How do I choose the right pendant?", acceptedAnswer: { "@type": "Answer", text: "Choose based on your style, outfit, occasion, and comfort preference." } },
      { "@type": "Question", name: "Are pendants good for gifting?", acceptedAnswer: { "@type": "Answer", text: "Yes, pendants are meaningful, stylish, and perfect for birthdays, anniversaries, and celebrations." } },
      { "@type": "Question", name: "What is a minimalist pendant?", acceptedAnswer: { "@type": "Answer", text: "A minimalist pendant features simple and clean designs ideal for subtle everyday elegance." } },
      { "@type": "Question", name: "Can I wear a pendant with any chain?", acceptedAnswer: { "@type": "Answer", text: "Yes, but it is best to match the chain thickness and length with the pendant design." } },
      { "@type": "Question", name: "What chain length is best for pendants?", acceptedAnswer: { "@type": "Answer", text: "Short chains create a minimal look, while medium and long chains are great for layering styles." } },
      { "@type": "Question", name: "Are pendants suitable for office wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, simple and elegant pendants are perfect for professional and office looks." } },
      { "@type": "Question", name: "Can pendants be layered together?", acceptedAnswer: { "@type": "Answer", text: "Yes, layering multiple pendants is a modern and stylish trend." } },
      { "@type": "Question", name: "What materials are used in pendants?", acceptedAnswer: { "@type": "Answer", text: "Common materials include gold, silver, stainless steel, and alloy with gemstone detailing." } },
      { "@type": "Question", name: "Do pendants go out of fashion?", acceptedAnswer: { "@type": "Answer", text: "No, pendants are timeless jewellery pieces that always remain in style." } },
      { "@type": "Question", name: "Are gemstone pendants real stones?", acceptedAnswer: { "@type": "Answer", text: "They can include natural, semi-precious, or synthetic stones depending on the design." } },
      { "@type": "Question", name: "Can men wear pendants?", acceptedAnswer: { "@type": "Answer", text: "Yes, many pendant designs are unisex and suitable for men as well." } },
      { "@type": "Question", name: "How do I take care of my pendant?", acceptedAnswer: { "@type": "Answer", text: "Keep it away from moisture, perfumes, and chemicals to maintain shine and durability." } },
      { "@type": "Question", name: "Are minimalist pendants trending?", acceptedAnswer: { "@type": "Answer", text: "Yes, minimalist jewellery is one of the most popular modern fashion trends." } },
      { "@type": "Question", name: "Can I wear a pendant with ethnic outfits?", acceptedAnswer: { "@type": "Answer", text: "Yes, pendants pair beautifully with both ethnic and western outfits." } },
      { "@type": "Question", name: "Why should I buy pendants online?", acceptedAnswer: { "@type": "Answer", text: "Online shopping offers more variety, better price comparison, and access to the latest designs in one place." } },
    ],
  },

  // 3. CollectionPage schema
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: TITLE,
    headline: "Minimal & Gemstone Daily-Wear Pendants for Women",
    description: DESCRIPTION,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      "@id": `${PAGE_URL}#primaryimage`,
      url: "https://barosche.com/logo.png",
      contentUrl: "https://barosche.com/logo.png",
      caption: "Barosche Pendants Collection",
    },
    breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    mainEntity: { "@id": `${PAGE_URL}#pendant-product-list` },
    hasPart: { "@id": `${PAGE_URL}#faq` },
  },

  // 4. BreadcrumbList schema
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${PAGE_URL}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Pendants", item: PAGE_URL },
    ],
  },
];

export default async function Page() {
  const initialProducts = await getInitialProducts("Pendant");
  return (
    <>
      {schemaData.map((schema, index) => (
        <Script
          key={schema["@id"] || index}
          id={`schema-${schema["@type"]}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Pendant initialProducts={initialProducts} />
    </>
  );
}