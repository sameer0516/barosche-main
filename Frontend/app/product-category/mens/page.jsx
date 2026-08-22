import Script from "next/script";
import Mens from './Mens';

const SITE_URL = "https://barosche.com";
const PAGE_URL = `${SITE_URL}/product-category/mens/`;
const OG_IMAGE = "/barosche-1.webp";
const PRODUCT_IMAGE = "https://api.barosche.com/uploads/product-1782452664621-445895308.jpg";
const TITLE = "Shop Luxury Men’s Jewellery & Accessories Online | Barosche";
const DESCRIPTION =
  "Shop luxury men’s jewellery & accessories online at Barosche. Elevate your style with bold, modern jewellery designs made for confident, stylish men.";

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
        alt: "Barosche Men's Jewellery Collection",
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
        alt: "Barosche Men's Jewellery Collection",
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
  "@id": `${PAGE_URL}#webpage`,
  "url": PAGE_URL,
  "name": TITLE,
  "headline": "Men’s Jewellery – Modern Luxury Accessories & Style",
  "description": DESCRIPTION,
  "inLanguage": "en",
  "isPartOf": {
    "@id": `${SITE_URL}/#website`
  },
  "about": {
    "@id": `${SITE_URL}/#organization`
  },
  "primaryImageOfPage": {
    "@type": "ImageObject",
    "@id": `${PAGE_URL}#primaryimage`,
    "url": "https://barosche.com/logo.png",
    "contentUrl": "https://barosche.com/logo.png",
    "caption": "Barosche Men's Jewellery Collection"
  },
  "breadcrumb": {
    "@id": `${PAGE_URL}#breadcrumb`
  },
  "mainEntity": {
    "@id": `${PAGE_URL}#product-list`
  },
  "hasPart": {
    "@id": `${PAGE_URL}#faq`
  }
};

// 2. BreadcrumbList schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${PAGE_URL}#breadcrumb`,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `${SITE_URL}/`
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Mens",
      "item": PAGE_URL
    }
  ]
};

// 3. ItemList schema
const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${PAGE_URL}#product-list`,
  "name": "Men’s Jewellery",
  "description": "Explore the Barosche collection of modern luxury men’s jewellery and accessories.",
  "url": PAGE_URL,
  "numberOfItems": 1,
  "itemListOrder": "https://schema.org/ItemListOrderAscending",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": `${SITE_URL}/product-category/rings/saga-signet-ring/`,
      "item": {
        "@type": "Product",
        "@id": `${SITE_URL}/product-category/rings/saga-signet-ring/#product`,
        "name": "Saga Signet Ring in 18kt Gold Vermeil",
        "url": `${SITE_URL}/product-category/rings/saga-signet-ring/`,
        "image": [PRODUCT_IMAGE],
        "category": "Men’s Jewellery",
        "brand": {
          "@type": "Brand",
          "name": "Barosche"
        },
        "offers": {
          "@type": "Offer",
          "@id": `${SITE_URL}/product-category/rings/saga-signet-ring/#offer`,
          "url": `${SITE_URL}/product-category/rings/saga-signet-ring/`,
          "price": "129.00",
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
  "@id": `${PAGE_URL}#faq`,
  "url": `${PAGE_URL}#faq`,
  "name": "Frequently Asked Questions About Men’s Jewellery",
  "isPartOf": {
    "@id": `${PAGE_URL}#webpage`
  },
  "inLanguage": "en",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is mens jewellery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mens jewellery includes stylish accessories like rings and modern fashion pieces designed to enhance men’s personal style and confidence."
      }
    },
    {
      "@type": "Question",
      "name": "Is mens jewellery popular today?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, mens jewellery online is a growing trend as modern men increasingly use accessories to express individuality and fashion sense."
      }
    },
    {
      "@type": "Question",
      "name": "What types of mens jewellery do you offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer rings and modern accessories designed for everyday wear, formal occasions, and luxury styling."
      }
    },
    {
      "@type": "Question",
      "name": "What is luxury mens jewellery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Luxury mens jewellery refers to premium-quality designs crafted with fine materials, detailed finishing, and elegant aesthetics."
      }
    },
    {
      "@type": "Question",
      "name": "Can I buy mens jewellery online safely?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can safely buy mens jewellery online through our secure checkout and trusted shopping platform."
      }
    },
    {
      "@type": "Question",
      "name": "What are mens accessories jewellery pieces?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "These are fashion accessories such as rings and modern designs that complement different outfits and styles."
      }
    },
    {
      "@type": "Question",
      "name": "Is mens jewellery suitable for daily wear?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, many designs are lightweight, durable, and perfect for comfortable everyday use."
      }
    },
    {
      "@type": "Question",
      "name": "What are formal accessories for men?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "These are minimal and elegant jewellery pieces designed for professional and corporate settings."
      }
    },
    {
      "@type": "Question",
      "name": "Can I wear mens jewellery in the office?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, subtle and minimalist designs are perfect for office and business environments."
      }
    },
    {
      "@type": "Question",
      "name": "What makes mens luxury accessories special?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "They combine premium craftsmanship, modern design, and refined detailing for a sophisticated look."
      }
    },
    {
      "@type": "Question",
      "name": "Are your mens jewellery designs trendy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our collection includes the latest mens jewellery online trends and modern fashion styles."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer minimalist mens jewellery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer minimalist designs that focus on simplicity, elegance, and everyday comfort."
      }
    },
    {
      "@type": "Question",
      "name": "Are statement jewellery pieces available for men?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our collection includes bold statement designs for men who prefer expressive styling."
      }
    },
    {
      "@type": "Question",
      "name": "Is mens jewellery a good gift option?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, it is a stylish and meaningful gift for birthdays, anniversaries, and special occasions."
      }
    },
    {
      "@type": "Question",
      "name": "What materials are used in mens jewellery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We use high-quality materials designed for durability, comfort, and long-lasting shine."
      }
    },
    {
      "@type": "Question",
      "name": "Can mens jewellery be worn at formal events?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our formal accessories for men are perfect for weddings, meetings, and formal gatherings."
      }
    },
    {
      "@type": "Question",
      "name": "Is mens jewellery comfortable for long wear?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our designs are lightweight and made for all-day comfort."
      }
    },
    {
      "@type": "Question",
      "name": "How do I style mens accessories jewellery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can style them with casual, formal, or modern outfits depending on your look preference."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between luxury and regular mens jewellery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Luxury mens jewellery offers premium craftsmanship, better materials, and more refined designs."
      }
    },
    {
      "@type": "Question",
      "name": "Why should I choose your mens jewellery collection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Because we offer a combination of mens jewellery online, premium design, comfort, and versatile styling for every occasion."
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <Script
        id="mens-collectionpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      <Script
        id="mens-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="mens-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Script
        id="mens-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Mens />
    </>
  );
}