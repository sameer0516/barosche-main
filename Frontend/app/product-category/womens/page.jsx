import Script from "next/script";
import Womens from './Womens';

const SITE_URL = "https://barosche.com";
const PAGE_URL = "https://barosche.com/product-category/womens/";
const OG_IMAGE = "/Meta-image-2.jpg";
const TITLE = "Buy Fashion & Gold Jewellery for Women Online | Barosche";
const DESCRIPTION =
  "Shop fashion & gold jewellery for women online at Barosche. Discover earrings, rings, necklaces & bracelets crafted for elegant everyday style.";

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
        alt: "Barosche Women's Jewellery Collection",
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
        alt: "Barosche Women's Jewellery Collection",
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
  name: "Frequently Asked Questions About Women's Jewellery",
  inLanguage: "en",
  isPartOf: { "@id": `${PAGE_URL}#webpage` },
  mainEntity: [
    { "@type": "Question", name: "What is fashion jewellery for women?", acceptedAnswer: { "@type": "Answer", text: "Fashion jewellery for women includes stylish accessories like earrings, rings, necklaces, and bracelets designed to enhance everyday and occasion wear." } },
    { "@type": "Question", name: "What types of jewellery for women do you offer?", acceptedAnswer: { "@type": "Answer", text: "We offer earrings, rings, necklaces, and bracelets designed for modern styling and everyday elegance." } },
    { "@type": "Question", name: "Is womens gold jewellery suitable for daily wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, lightweight womens gold jewellery is suitable for daily wear, office use, and special occasions." } },
    { "@type": "Question", name: "What are the latest jewellery trends for women?", acceptedAnswer: { "@type": "Answer", text: "Minimalist jewellery, layered necklaces, stacked rings, and mixed-metal designs are currently trending." } },
    { "@type": "Question", name: "Can I wear fashion jewellery every day?", acceptedAnswer: { "@type": "Answer", text: "Yes, fashion jewellery is designed for comfort and can be worn daily without discomfort." } },
    { "@type": "Question", name: "What are earrings for women?", acceptedAnswer: { "@type": "Answer", text: "Earrings are essential accessories that frame the face and enhance overall style." } },
    { "@type": "Question", name: "What are rings for women used for?", acceptedAnswer: { "@type": "Answer", text: "Rings add elegance and can be worn alone or stacked for a modern fashion look." } },
    { "@type": "Question", name: "What are necklaces for women?", acceptedAnswer: { "@type": "Answer", text: "Necklaces enhance the neckline and complete both casual and formal outfits." } },
    { "@type": "Question", name: "What are bracelets for women?", acceptedAnswer: { "@type": "Answer", text: "Bracelets are stylish accessories that add a refined finishing touch to your look." } },
    { "@type": "Question", name: "Is your jewellery suitable for office wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, minimal and elegant designs are perfect for professional and office environments." } },
    { "@type": "Question", name: "Can I wear jewellery for formal occasions?", acceptedAnswer: { "@type": "Answer", text: "Yes, our jewellery is suitable for weddings, parties, and formal events." } },
    { "@type": "Question", name: "What makes womens jewellery comfortable?", acceptedAnswer: { "@type": "Answer", text: "Lightweight materials, smooth finishing, and ergonomic design ensure comfort." } },
    { "@type": "Question", name: "Is fashion jewellery durable?", acceptedAnswer: { "@type": "Answer", text: "Yes, our fashion jewellery is made with high-quality materials for long-lasting use." } },
    { "@type": "Question", name: "Can I mix and match jewellery pieces?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can easily mix and match rings, earrings, necklaces, and bracelets." } },
    { "@type": "Question", name: "Is online jewellery shopping safe?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can safely buy jewellery online with secure checkout options." } },
    { "@type": "Question", name: "What makes your jewellery unique?", acceptedAnswer: { "@type": "Answer", text: "Our jewellery combines modern trends, premium craftsmanship, and versatile styling." } },
    { "@type": "Question", name: "Is jewellery a good gift for women?", acceptedAnswer: { "@type": "Answer", text: "Yes, jewellery is a timeless and meaningful gift for all occasions." } },
    { "@type": "Question", name: "Do you offer minimalist jewellery?", acceptedAnswer: { "@type": "Answer", text: "Yes, we offer minimalist jewellery designed for simple and elegant styling." } },
    { "@type": "Question", name: "Can jewellery be worn for parties and events?", acceptedAnswer: { "@type": "Answer", text: "Yes, statement pieces are perfect for parties and special occasions." } },
    { "@type": "Question", name: "Why should I choose your womens jewellery collection?", acceptedAnswer: { "@type": "Answer", text: "Because we offer a complete range of fashion jewellery for women, combining style, comfort, and modern design trends." } },
  ],
};

// 3. CollectionPage schema
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${PAGE_URL}#webpage`,
  url: PAGE_URL,
  name: TITLE,
  headline: "Women's Fashion & Gold Jewellery – Earrings, Rings, Pendants & More",
  description: DESCRIPTION,
  inLanguage: "en",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  primaryImageOfPage: {
    "@type": "ImageObject",
    "@id": `${PAGE_URL}#primaryimage`,
    url: "https://barosche.com/logo.png",
    contentUrl: "https://barosche.com/logo.png",
    caption: "Barosche Women's Jewellery Collection",
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
    { "@type": "ListItem", position: 2, name: "Womens", item: PAGE_URL },
  ],
};

export default function Page() {
  return (
    <>
      <Script
        id="womens-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="womens-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="womens-collectionpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <Script
        id="womens-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Womens />
    </>
  );
}