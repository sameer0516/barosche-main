import Script from "next/script";
import NewIn from './NewIn';

const SITE_URL = "https://barosche.com";
const PAGE_URL = "https://barosche.com/product-category/new-in/";
const OG_IMAGE = "/barosche-1.webp";
const TITLE = "Shop Latest & Trending Jewellery for Women Online | Barosche";
const DESCRIPTION =
  "Shop latest & trending jewellery for women at Barosche. Discover new fashion jewellery, elegant designs & modern accessories crafted for everyday style.";

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
        alt: "Shop Minimalist Luxury, Fine and Diamond Jewellery",
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
        alt: "Shop Minimalist Luxury, Fine and Diamond Jewellery",
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

// 1. CollectionPage schema
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://barosche.com/product-category/new-in/#webpage",
  "url": "https://barosche.com/product-category/new-in/",
  "name": "Shop Latest & Trending Jewellery for Women Online | Barosche",
  "headline": "New In Jewellery – Latest & Trending Fashion Jewellery Designs",
  "description": "Shop latest & trending jewellery for women at Barosche. Discover new fashion jewellery, elegant designs & modern accessories crafted for everyday style.",
  "inLanguage": "en",
  "isPartOf": {
    "@id": "https://barosche.com/#website"
  },
  "about": {
    "@id": "https://barosche.com/#organization"
  },
  "primaryImageOfPage": {
    "@type": "ImageObject",
    "@id": "https://barosche.com/product-category/new-in/#primaryimage",
    "url": "https://barosche.com/logo.png",
    "contentUrl": "https://barosche.com/logo.png",
    "caption": "Barosche New Jewellery Collection"
  },
  "breadcrumb": {
    "@id": "https://barosche.com/product-category/new-in/#breadcrumb"
  },
  "mainEntity": {
    "@id": "https://barosche.com/product-category/new-in/#product-list"
  },
  "hasPart": {
    "@id": "https://barosche.com/product-category/new-in/#faq"
  }
};

// Rating schema
const ratingSchema = {
  "@context": "https://schema.org/",
  "@type": "Organization",
  "@id": "https://barosche.com/#organization",
  "name": "Barosche",
  "url": "https://barosche.com/product-category/new-in/",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "2649"
  }
};

// 2. BreadcrumbList schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://barosche.com/product-category/new-in/#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://barosche.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "New In",
      "item": "https://barosche.com/product-category/new-in/"
    }
  ]
};

// 3. ItemList schema
const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": "https://barosche.com/product-category/new-in/#product-list",
  "name": "New Jewellery Collection",
  "description": "Explore 25 latest jewellery designs from the Barosche New In collection.",
  "url": "https://barosche.com/product-category/new-in/",
  "numberOfItems": 25,
  "itemListOrder": "https://schema.org/ItemListOrderAscending",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/rings/tsavorite-garnet-gemstone-ring/#gold-vermeil-product",
        "name": "Tsavorite Garnet Ring in 18k Gold Vermeil",
        "url": "https://barosche.com/product-category/rings/tsavorite-garnet-gemstone-ring/",
        "image": "https://api.barosche.com/uploads/product-1780743945301-64086007.webp",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/rings/tsavorite-garnet-gemstone-ring/",
          "price": "369.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/rings/tsavorite-garnet-gemstone-ring/#sterling-silver-product",
        "name": "Tsavorite Garnet Ring in 925 Sterling Silver",
        "url": "https://barosche.com/product-category/rings/tsavorite-garnet-gemstone-ring/",
        "image": "https://api.barosche.com/uploads/product-1781166671471-325268961.jpeg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/rings/tsavorite-garnet-gemstone-ring/",
          "price": "249.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/pendants/cushion-cut-gemstone-pendant/#citrine-product",
        "name": "Citrine Cushion Cut Pendant in 18k Gold Vermeil",
        "url": "https://barosche.com/product-category/pendants/cushion-cut-gemstone-pendant/",
        "image": "https://api.barosche.com/uploads/product-1780748204236-149969810.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/pendants/cushion-cut-gemstone-pendant/",
          "price": "159.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 4,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/pendants/cushion-cut-gemstone-pendant/#swiss-blue-topaz-product",
        "name": "Swiss Blue Topaz Cushion Cut Pendant in 925 Sterling Silver",
        "url": "https://barosche.com/product-category/pendants/cushion-cut-gemstone-pendant/",
        "image": "https://api.barosche.com/uploads/product-1781166489628-170839036.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/pendants/cushion-cut-gemstone-pendant/",
          "price": "249.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 5,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/#blue-product",
        "name": "Tsavorite & Diamond Band Ring in 18K Gold Vermeil (Blue)",
        "url": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/",
        "image": "https://api.barosche.com/uploads/product-1780895710494-301031940.webp",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/",
          "price": "449.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 6,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/#green-product",
        "name": "Tsavorite & Diamond Band Ring in 18K Gold Vermeil (Green)",
        "url": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/",
        "image": "https://api.barosche.com/uploads/product-1782468075372-148062620.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/",
          "price": "449.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 7,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/#red-product",
        "name": "Tsavorite & Diamond Band Ring in 18K Gold Vermeil (Red)",
        "url": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/",
        "image": "https://api.barosche.com/uploads/product-1782468116341-429902230.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/",
          "price": "449.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 8,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/#silver-product",
        "name": "Tsavorite & Diamond Band Ring in 925 Sterling Silver",
        "url": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/",
        "image": "https://api.barosche.com/uploads/product-1781167277734-126489907.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/rings/tsavorite-garnet-diamond-band-ring/",
          "price": "449.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 9,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/#product",
        "name": "Smoky Quartz Stud Earrings in 18K Gold Vermeil",
        "url": "https://barosche.com/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/",
        "image": "https://api.barosche.com/uploads/product-1780898749981-710522701.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/smoky-quartz-stud-earrings-18k-gold-vermeil/",
          "price": "169.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 10,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/#product",
        "name": "Blue Turquoise Gold Plated Pendant in 18k Gold Vermeil",
        "url": "https://barosche.com/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/",
        "image": "https://api.barosche.com/uploads/product-1780899826602-381003277.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/pendants/blue-turquoise-gold-plated-pendant-18k-gold-vermeil/",
          "price": "249.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 11,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#amethyst-product",
        "name": "Cushion Cut Amethyst Hoop Earrings in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/",
        "image": "https://api.barosche.com/uploads/product-1782468017738-598067497.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/",
          "price": "299.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 12,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#citrine-product",
        "name": "Citrine Cushion Drop Hoop Earrings in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/",
        "image": "https://api.barosche.com/uploads/product-1782465917541-565503874.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/",
          "price": "299.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 13,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#turquoise-product",
        "name": "Turquoise Cushion Drop Hoop Earrings in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/",
        "image": "https://api.barosche.com/uploads/product-1782467875927-981423839.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/",
          "price": "249.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 14,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#smoky-quartz-product",
        "name": "Smoky Quartz Drop Hoop Earrings in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/",
        "image": "https://api.barosche.com/uploads/product-1782467804369-298510018.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/",
          "price": "299.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 15,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/#blue-topaz-product",
        "name": "Blue Topaz Drop Hoop Earrings in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/",
        "image": "https://api.barosche.com/uploads/product-1782471658714-315426884.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/cushion-cut-gemstone-hoop-earrings/",
          "price": "299.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 16,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/citrine-diamond-drop-earrings/#citrine-product",
        "name": "Citrine Trillion Cut & Diamond Drop Hoop Earrings in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/earrings/citrine-diamond-drop-earrings/",
        "image": "https://api.barosche.com/uploads/product-1782466804238-503805218.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/citrine-diamond-drop-earrings/",
          "price": "299.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 17,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/citrine-diamond-drop-earrings/#amethyst-product",
        "name": "Amethyst Trillion Cut Drop Hoop Earrings in 925 Sterling Silver",
        "url": "https://barosche.com/product-category/earrings/citrine-diamond-drop-earrings/",
        "image": "https://api.barosche.com/uploads/product-1782736794731-394134343.png",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/citrine-diamond-drop-earrings/",
          "price": "299.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 18,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/bracelets/freyja-diamond-link-bracelet/#product",
        "name": "Freyja Diamond Link Bracelet in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/bracelets/freyja-diamond-link-bracelet/",
        "image": "https://api.barosche.com/uploads/product-1782451784924-120020543.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/bracelets/freyja-diamond-link-bracelet/",
          "price": "249.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 19,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/rings/saga-signet-ring/#product",
        "name": "Saga Signet Ring in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/rings/saga-signet-ring/",
        "image": "https://api.barosche.com/uploads/product-1782452664621-445895308.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/rings/saga-signet-ring/",
          "price": "129.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 20,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/pendants/eira-oval-pendant/#product",
        "name": "Eira Oval Pendant in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/pendants/eira-oval-pendant/",
        "image": "https://api.barosche.com/uploads/product-1782453077052-617197794.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/pendants/eira-oval-pendant/",
          "price": "149.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 21,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/pendants/sol-spiral-pendant/#product",
        "name": "Sól Spiral Pendant in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/pendants/sol-spiral-pendant/",
        "image": "https://api.barosche.com/uploads/product-1782453326085-355591573.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/pendants/sol-spiral-pendant/",
          "price": "149.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 22,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/rings/vana-wave-ring/#product",
        "name": "Vana Wave Ring in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/rings/vana-wave-ring/",
        "image": "https://api.barosche.com/uploads/product-1782453465826-795697720.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/rings/vana-wave-ring/",
          "price": "149.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 23,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/freyja-teardrop-earrings/#product",
        "name": "Freyja Teardrop Earrings in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/earrings/freyja-teardrop-earrings/",
        "image": "https://api.barosche.com/uploads/product-1782453811926-982328024.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/freyja-teardrop-earrings/",
          "price": "169.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 24,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/valkyrie-hoop-earrings/#product",
        "name": "Valkyrie Hoop Earrings in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/earrings/valkyrie-hoop-earrings/",
        "image": "https://api.barosche.com/uploads/product-1782454004823-309551736.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/valkyrie-hoop-earrings/",
          "price": "199.00",
          "priceCurrency": "EUR"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 25,
      "item": {
        "@type": "Product",
        "@id": "https://barosche.com/product-category/earrings/aurora-duo-drop-earrings/#product",
        "name": "Aurora Duo Drop Earrings in 18kt Gold Vermeil",
        "url": "https://barosche.com/product-category/earrings/aurora-duo-drop-earrings/",
        "image": "https://api.barosche.com/uploads/product-1782730319023-201434062.jpg",
        "brand": { "@type": "Brand", "name": "Barosche" },
        "offers": {
          "@type": "Offer",
          "url": "https://barosche.com/product-category/earrings/aurora-duo-drop-earrings/",
          "price": "449.00",
          "priceCurrency": "EUR"
        }
      }
    }
  ]
};

// 4. FAQPage schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": "https://barosche.com/product-category/new-in/#faq",
  "url": "https://barosche.com/product-category/new-in/#faq",
  "name": "Frequently Asked Questions About New In Jewellery",
  "isPartOf": {
    "@id": "https://barosche.com/product-category/new-in/#webpage"
  },
  "inLanguage": "en",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is included in the new in jewellery collection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our new in jewellery collection includes the latest jewellery designs such as rings, earrings, pendants, and bracelets inspired by current fashion trends."
      }
    },
    {
      "@type": "Question",
      "name": "How often is the new jewellery collection updated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We regularly update our collection with fresh arrivals to ensure you always have access to the latest jewellery designs."
      }
    },
    {
      "@type": "Question",
      "name": "What are the latest jewellery designs available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The latest designs include minimalist jewellery, statement pieces, and modern fashion jewellery suitable for all occasions."
      }
    },
    {
      "@type": "Question",
      "name": "What is trending jewellery for women right now?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trending jewellery for women includes minimalist styles, layered designs, and elegant statement accessories inspired by global fashion trends."
      }
    },
    {
      "@type": "Question",
      "name": "Is your new fashion jewellery suitable for daily wear?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our new fashion jewellery is lightweight, durable, and designed for comfortable everyday wear."
      }
    },
    {
      "@type": "Question",
      "name": "Can I wear new in jewellery for special occasions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, many pieces in our collection are perfect for parties, weddings, and festive occasions."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer minimalist jewellery in new arrivals?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our collection includes a wide range of minimalist jewellery designed for simple and elegant everyday styling."
      }
    },
    {
      "@type": "Question",
      "name": "Can I buy the latest jewellery designs online?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can easily explore and buy jewellery online through our secure and user-friendly platform."
      }
    },
    {
      "@type": "Question",
      "name": "What makes your new in jewellery collection unique?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our collection focuses on fresh designs, premium craftsmanship, and a balance of modern and timeless styles."
      }
    },
    {
      "@type": "Question",
      "name": "Are your jewellery pieces lightweight and comfortable?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our jewellery is designed to be lightweight and comfortable for all-day wear."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer jewellery for gifting purposes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our new collection is perfect for gifting on birthdays, anniversaries, and special occasions."
      }
    },
    {
      "@type": "Question",
      "name": "What types of jewellery are included in new arrivals?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our new arrivals include rings, earrings, pendants, and bracelets in modern and trendy designs."
      }
    },
    {
      "@type": "Question",
      "name": "Is your jewellery suitable for office wear?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, many pieces are designed for professional and office wear with a clean, elegant look."
      }
    },
    {
      "@type": "Question",
      "name": "Can I find bold statement jewellery in this collection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our collection includes both minimalist and bold statement jewellery styles."
      }
    },
    {
      "@type": "Question",
      "name": "Is your online jewellery shopping secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we provide a secure checkout system to ensure safe online jewellery buying transactions."
      }
    },
    {
      "@type": "Question",
      "name": "Do you provide high-quality product images?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer clear and high-resolution images to help you choose the right jewellery easily."
      }
    },
    {
      "@type": "Question",
      "name": "Are your jewellery designs long-lasting?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we focus on durability and quality craftsmanship for long-lasting wear."
      }
    },
    {
      "@type": "Question",
      "name": "Can I mix and match your jewellery pieces?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our designs are versatile and perfect for layering and styling in different ways."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between fashion jewellery and fine jewellery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fashion jewellery focuses on trendy, stylish designs, while fine jewellery emphasizes premium materials and craftsmanship."
      }
    },
    {
      "@type": "Question",
      "name": "Why should I choose your new in jewellery collection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Because we offer latest jewellery designs, trending styles, premium quality, and a trusted platform to buy jewellery online with confidence."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <Script
        id="new-in-collectionpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <Script
        id="new-in-rating-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ratingSchema) }}
      />
      <Script
        id="new-in-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="new-in-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="new-in-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <NewIn />
    </>
  );
}