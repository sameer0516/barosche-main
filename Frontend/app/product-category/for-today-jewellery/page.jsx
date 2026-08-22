import Script from "next/script";
import ForToday from './ForToday';

const SITE_URL = "https://barosche.com";
const PAGE_URL = "https://barosche.com/product-category/for-today-jewellery/";
const OG_IMAGE = "/Meta-image-2.jpg";
const TITLE = "Buy Daily Wear Fine Jewellery for Everyday Use | Barosche";
const DESCRIPTION =
  "Shop everyday fashion gold jewellery for daily wear at Barosche. Discover lightweight, dainty & elegant fine jewellery designed for comfort and modern style.";

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
        width: 2048,
        height: 997,
        alt: "Barosche For Today Jewellery Collection",
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
        alt: "Barosche For Today Jewellery Collection",
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
  "@id": `${PAGE_URL}#product-list`,
  name: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  numberOfItems: 25,
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  itemListElement: [
    { "@type": "ListItem", position: 1, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/#gold-vermeil-product`, name: "Tsavorite Garnet Ring in 18k Gold Vermeil", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/`, image: "https://api.barosche.com/uploads/product-1780743945301-64086007.webp", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/`, price: "369.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 2, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/#sterling-silver-product`, name: "Tsavorite Garnet Ring in 925 Sterling Silver", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/`, image: "https://api.barosche.com/uploads/product-1781166671471-325268961.jpeg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-gemstone-ring/`, price: "249.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 3, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/#citrine-product`, name: "Citrine Cushion Cut Pendant in 18k Gold Vermeil", url: `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/`, image: "https://api.barosche.com/uploads/product-1780748204236-149969810.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/`, price: "159.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 4, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/#swiss-blue-topaz-product`, name: "Swiss Blue Topaz Cushion Cut Pendant in 925 Sterling Silver", url: `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/`, image: "https://api.barosche.com/uploads/product-1781166489628-170839036.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/pendants/cushion-cut-gemstone-pendant/`, price: "249.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 5, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#blue-product`, name: "Tsavorite & Diamond Band Ring in 18K Gold Vermeil (Blue)", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, image: "https://api.barosche.com/uploads/product-1780895710494-301031940.webp", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, price: "449.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 6, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#green-product`, name: "Tsavorite & Diamond Band Ring in 18K Gold Vermeil (Green)", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, image: "https://api.barosche.com/uploads/product-1782468075372-148062620.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, price: "449.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 7, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#red-product`, name: "Tsavorite & Diamond Band Ring in 18K Gold Vermeil (Red)", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, image: "https://api.barosche.com/uploads/product-1782468116341-429902230.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, price: "449.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 8, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/#silver-product`, name: "Tsavorite & Diamond Band Ring in 925 Sterling Silver", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, image: "https://api.barosche.com/uploads/product-1781167277734-126489907.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/rings/tsavorite-garnet-diamond-band-ring/`, price: "449.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 9, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/#product`, name: "Smoky Quartz Stud Earrings in 18K Gold Vermeil", url: `${SITE_URL}/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/`, image: "https://api.barosche.com/uploads/product-1780898749981-710522701.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/`, price: "169.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 10, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/#product`, name: "Blue Turquoise Gold Plated Pendant in 18k Gold Vermeil", url: `${SITE_URL}/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/`, image: "https://api.barosche.com/uploads/product-1780899826602-381003277.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/`, price: "249.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 11, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#amethyst-product`, name: "Cushion Cut Amethyst Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782468017738-598067497.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, price: "299.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 12, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#citrine-product`, name: "Citrine Cushion Drop Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782465917541-565503874.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, price: "299.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 13, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#turquoise-product`, name: "Turquoise Cushion Drop Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782467875927-981423839.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, price: "249.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 14, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#smoky-quartz-product`, name: "Smoky Quartz Drop Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782467804369-298510018.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, price: "299.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 15, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#blue-topaz-product`, name: "Blue Topaz Drop Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782471658714-315426884.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/cushion-cut-gemstone-hoop-earrings/`, price: "299.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 16, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/#citrine-product`, name: "Citrine Trillion Cut & Diamond Drop Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/`, image: "https://api.barosche.com/uploads/product-1782466804238-503805218.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/`, price: "299.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 17, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/#amethyst-product`, name: "Amethyst Trillion Cut Drop Hoop Earrings in 925 Sterling Silver", url: `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/`, image: "https://api.barosche.com/uploads/product-1782736794731-394134343.png", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/citrine-diamond-drop-earrings/`, price: "299.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 18, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/bracelets/freyja-diamond-link-bracelet/#product`, name: "Freyja Diamond Link Bracelet in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/bracelets/freyja-diamond-link-bracelet/`, image: "https://api.barosche.com/uploads/product-1782451784924-120020543.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/bracelets/freyja-diamond-link-bracelet/`, price: "249.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 19, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/saga-signet-ring/#product`, name: "Saga Signet Ring in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/rings/saga-signet-ring/`, image: "https://api.barosche.com/uploads/product-1782452664621-445895308.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/rings/saga-signet-ring/`, price: "129.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 20, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/pendants/eira-oval-pendant/#product`, name: "Eira Oval Pendant in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/pendants/eira-oval-pendant/`, image: "https://api.barosche.com/uploads/product-1782453077052-617197794.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/pendants/eira-oval-pendant/`, price: "149.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 21, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/pendants/sol-spiral-pendant/#product`, name: "Sól Spiral Pendant in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/pendants/sol-spiral-pendant/`, image: "https://api.barosche.com/uploads/product-1782453326085-355591573.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/pendants/sol-spiral-pendant/`, price: "149.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 22, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/rings/vana-wave-ring/#product`, name: "Vana Wave Ring in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/rings/vana-wave-ring/`, image: "https://api.barosche.com/uploads/product-1782453465826-795697720.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/rings/vana-wave-ring/`, price: "149.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 23, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/freyja-teardrop-earrings/#product`, name: "Freyja Teardrop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/freyja-teardrop-earrings/`, image: "https://api.barosche.com/uploads/product-1782453811926-982328024.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/freyja-teardrop-earrings/`, price: "169.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 24, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/valkyrie-hoop-earrings/#product`, name: "Valkyrie Hoop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/valkyrie-hoop-earrings/`, image: "https://api.barosche.com/uploads/product-1782454004823-309551736.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/valkyrie-hoop-earrings/`, price: "199.00", priceCurrency: "EUR" } } },
    { "@type": "ListItem", position: 25, item: { "@type": "Product", "@id": `${SITE_URL}/product-category/earrings/aurora-duo-drop-earrings/#product`, name: "Aurora Duo Drop Earrings in 18kt Gold Vermeil", url: `${SITE_URL}/product-category/earrings/aurora-duo-drop-earrings/`, image: "https://api.barosche.com/uploads/product-1782730319023-201434062.jpg", brand: { "@type": "Brand", name: "Barosche" }, offers: { "@type": "Offer", url: `${SITE_URL}/product-category/earrings/aurora-duo-drop-earrings/`, price: "449.00", priceCurrency: "EUR" } } },
  ],
};

// 2. FAQPage schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${PAGE_URL}#faq`,
  url: `${PAGE_URL}#faq`,
  name: "Frequently Asked Questions About Everyday Fine Jewellery",
  inLanguage: "en",
  isPartOf: { "@id": `${PAGE_URL}#webpage` },
  mainEntity: [
    { "@type": "Question", name: "What is everyday fine jewellery?", acceptedAnswer: { "@type": "Answer", text: "Everyday fine jewellery refers to high-quality, lightweight jewellery designed for daily wear, combining durability with elegant, minimal designs." } },
    { "@type": "Question", name: "Can fine jewellery be worn every day?", acceptedAnswer: { "@type": "Answer", text: "Yes, everyday fine jewellery is specifically designed to be worn daily due to its comfort, durability, and timeless style." } },
    { "@type": "Question", name: "What materials are used in everyday fine jewellery?", acceptedAnswer: { "@type": "Answer", text: "Common materials include gold, sterling silver, platinum, and sometimes semi-precious gemstones." } },
    { "@type": "Question", name: "Is everyday fine jewellery durable?", acceptedAnswer: { "@type": "Answer", text: "Yes, it is crafted with quality materials and strong settings to ensure long-lasting wear." } },
    { "@type": "Question", name: "How is fine jewellery different from fashion jewellery?", acceptedAnswer: { "@type": "Answer", text: "Fine jewellery uses precious metals and stones, while fashion jewellery is typically made from less durable, non-precious materials." } },
    { "@type": "Question", name: "Can I wear fine jewellery while sleeping?", acceptedAnswer: { "@type": "Answer", text: "While possible, it is generally recommended to remove jewellery before sleeping to maintain its condition." } },
    { "@type": "Question", name: "Is everyday fine jewellery suitable for office wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, its minimal and elegant design makes it perfect for professional and office environments." } },
    { "@type": "Question", name: "Does fine jewellery lose its shine over time?", acceptedAnswer: { "@type": "Answer", text: "With proper care, fine jewellery retains its shine for many years." } },
    { "@type": "Question", name: "How should I clean everyday fine jewellery?", acceptedAnswer: { "@type": "Answer", text: "Use a soft cloth, mild soap, and lukewarm water to gently clean your jewellery." } },
    { "@type": "Question", name: "Can I wear fine jewellery while showering?", acceptedAnswer: { "@type": "Answer", text: "It's best to avoid wearing jewellery while showering to prevent exposure to chemicals and moisture." } },
    { "@type": "Question", name: "Is everyday fine jewellery lightweight?", acceptedAnswer: { "@type": "Answer", text: "Yes, it is designed to be lightweight for maximum comfort throughout the day." } },
    { "@type": "Question", name: "Can I layer everyday fine jewellery?", acceptedAnswer: { "@type": "Answer", text: "Absolutely, layering delicate chains, rings, and bracelets is a popular styling trend." } },
    { "@type": "Question", name: "Is fine jewellery a good investment?", acceptedAnswer: { "@type": "Answer", text: "Yes, due to its quality materials and timeless design, it holds long-term value." } },
    { "@type": "Question", name: "What types of jewellery are best for daily wear?", acceptedAnswer: { "@type": "Answer", text: "Stud earrings, thin chains, simple rings, and minimal pendants are ideal choices." } },
    { "@type": "Question", name: "Does everyday jewellery require maintenance?", acceptedAnswer: { "@type": "Answer", text: "Minimal maintenance is needed, but regular cleaning helps preserve its appearance." } },
    { "@type": "Question", name: "Can fine jewellery cause skin irritation?", acceptedAnswer: { "@type": "Answer", text: "High-quality fine jewellery is usually hypoallergenic and safe for sensitive skin." } },
    { "@type": "Question", name: "Is everyday fine jewellery suitable for travel?", acceptedAnswer: { "@type": "Answer", text: "Yes, its lightweight and versatile design makes it ideal for travel." } },
    { "@type": "Question", name: "How do I store fine jewellery properly?", acceptedAnswer: { "@type": "Answer", text: "Store it in a soft pouch or jewellery box to prevent scratches and damage." } },
    { "@type": "Question", name: "Can fine jewellery be worn with both ethnic and western outfits?", acceptedAnswer: { "@type": "Answer", text: "Yes, its versatile design complements both traditional and modern styles." } },
    { "@type": "Question", name: "Why choose everyday fine jewellery?", acceptedAnswer: { "@type": "Answer", text: "It offers the perfect balance of elegance, durability, and comfort for daily use." } },
  ],
};

// 3. CollectionPage schema
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: TITLE,
  headline: "Daily Wear Fine Jewellery – Lightweight, Elegant Everyday Designs",
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    "@id": `${PAGE_URL}#primaryimage`,
    url: "https://barosche.com/logo.png",
    contentUrl: "https://barosche.com/logo.png",
    caption: "Barosche For Today Jewellery Collection",
  },
  breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
  mainEntity: { "@id": `${PAGE_URL}#product-list` },
  hasPart: { "@id": `${PAGE_URL}#faq` },
};

// 4. BreadcrumbList schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${PAGE_URL}#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "For Today", item: PAGE_URL },
  ],
};

export default function Page() {
  return (
    <>
      <Script
        id="fortoday-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="fortoday-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="fortoday-collectionpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <Script
        id="fortoday-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ForToday />
    </>
  );
}