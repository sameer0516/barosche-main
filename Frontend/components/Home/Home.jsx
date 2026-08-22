import Script from "next/script";
import Header from "@/components/Home/Header/Header";
import Collection from "@/components/Home/Collection/Collection";
import Signature from "@/components/Home/Signature/Signature";
import Category from "@/components/Home/Category/Category";
import Tsavéline from "@/components/Home/Tsavéline/Tsavéline";
import Trending from "@/components/Home/Trending Arrivals/Trending";
import EarringsRings from "@/components/Home/Earrings-Rings/EarringsRings";
import Reviews from "@/components/Home/Reviews/Reviews";
import Faq from "@/components/Home/Faq/Faq";
import LatestBlog from "@/components/Home/LatestBlog/LatestBlog";

const SITE_URL = "https://www.barosche.com";
const PAGE_URL = "https://barosche.com/";
const OG_IMAGE = "/logo.png";
const TITLE = "Buy Minimalist Luxury, Fine and Diamond Jewellery Online";
const DESCRIPTION =
  "Shop minimalist, fine, and diamond jewellery online at Barosche. Discover luxury semi-handcrafted designs, elegant accessories, and timeless jewellery pieces.";

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

const schemaData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Barosche",
    url: `${SITE_URL}/`,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
    },
    sameAs: [
      "https://www.instagram.com/baroscheofficial/",
      "https://in.pinterest.com/barosche/",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+49 1628806158",
      contactType: "customer service",
      email: "info@barosche.com",
      areaServed: "Worldwide",
      availableLanguage: ["English"],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "@id": `${SITE_URL}/#store`,
    name: "Barosche",
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/logo.png`,
    telephone: "+49 1628806158",
    email: "info@barosche.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Herrlichkeit 11",
      addressLocality: "Syke",
      postalCode: "28857",
      addressCountry: "DE",
    },
    sameAs: [
      "https://www.instagram.com/baroscheofficial/",
      "https://in.pinterest.com/barosche/",
    ],
    parentOrganization: {
      "@id": `${SITE_URL}/#organization`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: "Barosche",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?s={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: `${SITE_URL}/`,
    name: "Barosche - Lab-Grown Diamond & Gemstone Jewellery",
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: {
      "@id": `${SITE_URL}/#organization`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `${SITE_URL}/#video`,
    name: "Barosche Custom Jewellery Showcase",
    description:
      "Discover the elegance and craftsmanship of Barosche jewellery including custom designs, rings, pendants, and earrings.",
    thumbnailUrl: `${SITE_URL}/logo.png`,
    uploadDate: "2026-02-24T14:06:40Z",
    duration: "PT2M30S",
    contentUrl: `${SITE_URL}/ring-video.mp4`,
    embedUrl: `${SITE_URL}/`,
    isFamilyFriendly: true,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    mainEntityOfPage: {
      "@id": `${SITE_URL}/#webpage`,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "What type of jewellery does Barosche offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Barosche offers a wide range of jewellery, including rings, pendants, earrings, and bracelets designed with a focus on elegance and modern style.",
        },
      },
      {
        "@type": "Question",
        name: "What is semi-handmade jewellery?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Semi-handmade jewellery combines traditional craftsmanship with modern techniques, ensuring each piece has unique detailing and high-quality finishing.",
        },
      },
      {
        "@type": "Question",
        name: "Do you sell fine jewellery online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Barosche specializes in offering premium fine jewellery online with a seamless and secure shopping experience.",
        },
      },
      {
        "@type": "Question",
        name: "Is your diamond jewellery suitable for everyday wear?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our diamond jewellery is designed for both everyday elegance and special occasions, offering durability along with timeless beauty.",
        },
      },
      {
        "@type": "Question",
        name: "Can I buy jewellery online safely from Barosche?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can safely buy jewellery online from Barosche with secure payment options and a trusted shopping platform.",
        },
      },
      {
        "@type": "Question",
        name: "What makes your minimalist jewellery unique?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our minimalist jewellery focuses on clean designs, subtle elegance, and versatility, making it ideal for modern lifestyles.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer minimalist luxury jewellery?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we offer minimalist luxury jewellery that combines premium materials with understated, sophisticated design.",
        },
      },
      {
        "@type": "Question",
        name: "Are your jewellery pieces suitable for gifting?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely, our jewellery is perfect for gifting on birthdays, anniversaries, and special occasions.",
        },
      },
      {
        "@type": "Question",
        name: "What materials are used in your jewellery?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We use high-quality materials to ensure durability, shine, and long-lasting wear across all our collections.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer jewellery for daily wear?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, our minimalist designs are lightweight and comfortable, making them perfect for everyday use.",
        },
      },
      {
        "@type": "Question",
        name: "How do I choose the right jewellery online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can explore detailed product descriptions, images, and styling suggestions to choose the right piece when you buy jewellery online.",
        },
      },
      {
        "@type": "Question",
        name: "Are your rings available in different styles?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, our rings include minimalist designs, statement pieces, and elegant styles for various occasions.",
        },
      },
      {
        "@type": "Question",
        name: "Can I wear your jewellery for special occasions?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, our fine jewellery and diamond jewellery collections are perfect for weddings, parties, and formal events.",
        },
      },
      {
        "@type": "Question",
        name: "What are luxury accessories in your collection?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our luxury accessories include premium jewellery pieces designed to enhance your overall style with elegance and sophistication.",
        },
      },
      {
        "@type": "Question",
        name: "Is your jewellery durable for long-term use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, our jewellery is crafted with precision and high-quality materials to ensure long-lasting durability.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer versatile jewellery designs?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, our designs are created to be versatile, allowing you to style them for both casual and formal occasions.",
        },
      },
      {
        "@type": "Question",
        name: "Can I layer your jewellery pieces?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely, our minimalist designs are perfect for layering to create a modern and stylish look.",
        },
      },
      {
        "@type": "Question",
        name: "What makes Barosche different from other jewellery brands?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Barosche stands out for its semi-handmade jewellery, premium craftsmanship, and focus on minimalist luxury design.",
        },
      },
      {
        "@type": "Question",
        name: "Do you provide a smooth online shopping experience?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we ensure a user-friendly platform, secure checkout, and reliable delivery for a seamless experience.",
        },
      },
      {
        "@type": "Question",
        name: "Why should I choose Barosche for buying jewellery online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Barosche offers a combination of fine jewellery, diamond jewellery, and luxury accessories, making it a trusted choice to buy jewellery online with confidence.",
        },
      },
    ],
  },
];

export default function Home() {
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

      <Header />
      <Collection />
      <Signature />
      <Category />
      <Tsavéline />
      <Trending />
      <EarringsRings />
      <Reviews />
      <LatestBlog />
      <Faq />
    </>
  );
}