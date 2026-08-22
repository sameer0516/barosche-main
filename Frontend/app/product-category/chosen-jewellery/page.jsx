import Script from "next/script";
import Chosen from './Chosen';

const SITE_URL = "https://barosche.com";
const PAGE_URL = "https://barosche.com/product-category/chosen-jewellery/";
const OG_IMAGE = "/barosche-1.webp";
const TITLE = "Buy Fine & Designer Jewellery Gifts for Her Online";
const DESCRIPTION =
  "Buy fine jewellery gifts for her online at Barosche. Explore gold & designer jewellery for special occasions, perfect for wife & girlfriend gifting.";

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
        alt: "Barosche Chosen Jewellery Collection",
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
        alt: "Barosche Chosen Jewellery Collection",
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
  name: "Frequently Asked Questions About Chosen Jewellery",
  inLanguage: "en",
  isPartOf: { "@id": `${PAGE_URL}#webpage` },
  mainEntity: [
    { "@type": "Question", name: "What is chosen jewellery?", acceptedAnswer: { "@type": "Answer", text: "Chosen jewellery is a curated collection of stylish, versatile, and meaningful pieces designed for modern everyday wear and gifting." } },
    { "@type": "Question", name: "What types of jewellery are included in this collection?", acceptedAnswer: { "@type": "Answer", text: "This collection includes designer jewellery, gold plated pieces, minimal everyday jewellery, and gift-worthy accessories." } },
    { "@type": "Question", name: "Is chosen jewellery suitable for daily wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, most pieces are lightweight, comfortable, and designed specifically for everyday use." } },
    { "@type": "Question", name: "Can I gift jewellery from this collection?", acceptedAnswer: { "@type": "Answer", text: "Absolutely, these pieces are perfect for gifting on birthdays, anniversaries, and special occasions." } },
    { "@type": "Question", name: "What makes chosen jewellery different from regular jewellery?", acceptedAnswer: { "@type": "Answer", text: "Chosen jewellery is carefully curated for quality, design, and versatility, ensuring it suits modern lifestyles." } },
    { "@type": "Question", name: "Is gold plated jewellery durable?", acceptedAnswer: { "@type": "Answer", text: "Yes, with proper care, gold plated jewellery maintains its shine and durability for a long time." } },
    { "@type": "Question", name: "How do I choose the right jewellery online?", acceptedAnswer: { "@type": "Answer", text: "Focus on your style, occasion, comfort, and versatility while checking product details and images." } },
    { "@type": "Question", name: "Can I wear these pieces with both western and traditional outfits?", acceptedAnswer: { "@type": "Answer", text: "Yes, the designs are versatile and complement both western and ethnic wear." } },
    { "@type": "Question", name: "Are the designs lightweight?", acceptedAnswer: { "@type": "Answer", text: "Most pieces are designed to be lightweight for maximum comfort throughout the day." } },
    { "@type": "Question", name: "What occasions are suitable for chosen jewellery?", acceptedAnswer: { "@type": "Answer", text: "You can wear these pieces for daily use, office wear, parties, weddings, and festive occasions." } },
    { "@type": "Question", name: "Is designer jewellery suitable for everyday wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, modern designer jewellery is crafted to be both stylish and wearable for daily use." } },
    { "@type": "Question", name: "How do I maintain my jewellery?", acceptedAnswer: { "@type": "Answer", text: "Store it in a dry place, avoid water and chemicals, and clean it gently with a soft cloth." } },
    { "@type": "Question", name: "Can I layer jewellery from this collection?", acceptedAnswer: { "@type": "Answer", text: "Yes, many pieces are perfect for layering and stacking to create a trendy look." } },
    { "@type": "Question", name: "Does online jewellery shopping offer enough variety?", acceptedAnswer: { "@type": "Answer", text: "Yes, online platforms provide a wider range of styles compared to physical stores." } },
    { "@type": "Question", name: "Is jewellery from this collection budget-friendly?", acceptedAnswer: { "@type": "Answer", text: "Yes, it includes affordable options like gold plated jewellery along with premium designs." } },
    { "@type": "Question", name: "Can I find minimal jewellery in this category?", acceptedAnswer: { "@type": "Answer", text: "Yes, the collection includes a variety of minimal and elegant designs for everyday styling." } },
    { "@type": "Question", name: "Are these pieces suitable for office wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, subtle and minimal designs are perfect for professional environments." } },
    { "@type": "Question", name: "What are the latest trends in jewellery available here?", acceptedAnswer: { "@type": "Answer", text: "Trending styles include layered chains, stackable rings, and geometric designs." } },
    { "@type": "Question", name: "Is this jewellery comfortable for long wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, comfort and wearability are key features of this collection." } },
    { "@type": "Question", name: "Why should I buy jewellery online from this collection?", acceptedAnswer: { "@type": "Answer", text: "You get a wide variety, convenience, easy comparison, and access to modern designs—all in one place." } },
  ],
};

// 3. CollectionPage schema
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: TITLE,
  headline: "Fine & Designer Jewellery Gifts for Her – Chosen Collection",
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    "@id": `${PAGE_URL}#primaryimage`,
    url: "https://barosche.com/logo.png",
    contentUrl: "https://barosche.com/logo.png",
    caption: "Barosche Chosen Jewellery Collection",
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
    { "@type": "ListItem", position: 2, name: "Chosen", item: PAGE_URL },
  ],
};

export default function Page() {
  return (
    <>
      <Script
        id="chosen-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="chosen-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="chosen-collectionpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <Script
        id="chosen-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Chosen />
    </>
  );
}