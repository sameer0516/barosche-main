import ServicesPage from "./OurServices";

const SITE_URL = "https://barosche.com";
const PAGE_URL = "https://barosche.com/our-services/";
const OG_IMAGE = "/logo.png";
const TITLE = "Custom Jewellery Design & Personalised Jewellery Services";
const DESCRIPTION =
  "Explore custom jewellery design and personalised services, including remaking, resizing, and birthstone jewellery crafted with precision and care.";

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
        alt: "Barosche Custom Jewellery & Personalised Services",
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
        alt: "Barosche Custom Jewellery & Personalised Services",
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

// --- SCHEMA DATA ---

const schemaData = [
  // 1. WebPage schema
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: "Custom Jewellery Design & Personalised Jewellery Services",
    headline: "Custom & Personalised Jewellery Design, Remaking & Resizing Services",
    description:
      "Explore custom jewellery design and personalised services, including remaking, resizing, and birthstone jewellery crafted with precision and care.",
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    mainEntity: { "@id": `${PAGE_URL}#service` },
    hasPart: { "@id": `${PAGE_URL}#custom-jewellery-process` },
  },

  // 2. Rating / Organization schema
  {
    "@context": "https://schema.org/",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Barosche",
    url: PAGE_URL,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "3650",
    },
  },

  // 3. BreadcrumbList schema
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${PAGE_URL}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Our Services", item: PAGE_URL },
    ],
  },

  // 4. Service schema
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${PAGE_URL}#service`,
    name: "Custom Jewellery Design and Personalised Jewellery Services",
    alternateName: "Barosche Custom Jewellery Services",
    url: PAGE_URL,
    description:
      "Barosche provides custom jewellery design, personalised gemstone jewellery, birthstone jewellery, jewellery remaking, redesigning and professional ring resizing services.",
    serviceType: "Custom and personalised jewellery design services",
    provider: { "@id": `${SITE_URL}/#organization` },
    brand: { "@type": "Brand", name: "Barosche" },
    areaServed: { "@type": "Place", name: "Worldwide" },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: PAGE_URL,
      availableLanguage: "English",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      "@id": `${PAGE_URL}#service-catalog`,
      name: "Barosche Custom Jewellery Services",
      numberOfItems: 6,
      itemListElement: [
        {
          "@type": "Offer",
          position: 1,
          itemOffered: {
            "@type": "Service",
            "@id": `${PAGE_URL}#custom-jewellery-design`,
            name: "Custom Jewellery Design",
            description:
              "Exclusive jewellery created according to the customer's ideas, style, gemstone preferences and choice of premium metal.",
          },
        },
        {
          "@type": "Offer",
          position: 2,
          itemOffered: {
            "@type": "Service",
            "@id": `${PAGE_URL}#birthstone-jewellery`,
            name: "Custom Birthstone Jewellery",
            description:
              "Personalised birthstone jewellery designed for birthdays, anniversaries, gifting and meaningful life celebrations.",
          },
        },
        {
          "@type": "Offer",
          position: 3,
          itemOffered: {
            "@type": "Service",
            "@id": `${PAGE_URL}#personalised-gemstone-jewellery`,
            name: "Personalised Gemstone Jewellery",
            description:
              "Personalised jewellery created with gemstones selected according to meaning, colour, personal preference and design style.",
          },
        },
        {
          "@type": "Offer",
          position: 4,
          itemOffered: {
            "@type": "Service",
            "@id": `${PAGE_URL}#gold-birthstone-jewellery`,
            name: "Gold Birthstone Jewellery",
            description:
              "Custom gold jewellery that combines premium gold craftsmanship with personally meaningful birthstones.",
          },
        },
        {
          "@type": "Offer",
          position: 5,
          itemOffered: {
            "@type": "Service",
            "@id": `${PAGE_URL}#jewellery-remaking`,
            name: "Jewellery Remaking and Redesign",
            description:
              "Old, vintage and heirloom jewellery transformed into modern wearable designs while preserving its emotional significance.",
          },
        },
        {
          "@type": "Offer",
          position: 6,
          itemOffered: {
            "@type": "Service",
            "@id": `${PAGE_URL}#ring-resizing`,
            name: "Ring Resizing and Professional Adjustments",
            description:
              "Professional ring resizing and adjustment services carried out carefully to improve fit while maintaining the original craftsmanship.",
          },
        },
      ],
    },
  },

  // 5. HowTo schema
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${PAGE_URL}#custom-jewellery-process`,
    url: `${PAGE_URL}#custom-jewellery-process`,
    name: "How Our Custom Jewellery Process Works",
    description:
      "Learn how to order personalised custom jewellery from Barosche through a simple design, approval, crafting and delivery process.",
    inLanguage: "en",
    totalTime: "P0D",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Share Your Design Idea",
        text: "Provide your jewellery inspiration, sketches, preferred gemstones, metal choices or other design requirements.",
        url: `${PAGE_URL}#step-1`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Design Development and Approval",
        text: "Barosche develops and refines the jewellery concept according to your preferences before requesting final approval.",
        url: `${PAGE_URL}#step-2`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Crafting and Delivery",
        text: "Expert artisans craft and finish the approved jewellery design before securely packaging and delivering it.",
        url: `${PAGE_URL}#step-3`,
      },
    ],
  },

  // 6. FAQPage schema
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${PAGE_URL}#faq`,
    url: `${PAGE_URL}#faq`,
    name: "Frequently Asked Questions About Custom Jewellery Services",
    inLanguage: "en",
    isPartOf: { "@id": `${PAGE_URL}#webpage` },
    about: { "@id": `${PAGE_URL}#service` },
    mainEntity: [
      { "@type": "Question", name: "What is custom jewellery design?", acceptedAnswer: { "@type": "Answer", text: "Custom jewellery design is a service where jewellery is created based on your personal ideas, style, and preferences." } },
      { "@type": "Question", name: "Can I design my own jewellery online?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can share your design idea, and we create a fully customized jewellery piece for you." } },
      { "@type": "Question", name: "What is birthstone jewellery?", acceptedAnswer: { "@type": "Answer", text: "Birthstone jewellery features gemstones associated with a person's birth month, each carrying symbolic meaning." } },
      { "@type": "Question", name: "Is custom jewellery more expensive than ready-made jewellery?", acceptedAnswer: { "@type": "Answer", text: "It depends on design, materials, and gemstones, but it is often more personalized and value-driven." } },
      { "@type": "Question", name: "What materials are used in custom jewellery?", acceptedAnswer: { "@type": "Answer", text: "We use gold, silver, stainless steel, and premium gemstones depending on your selection." } },
      { "@type": "Question", name: "Can I choose my own gemstone for jewellery?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can select gemstones based on color, meaning, or personal preference." } },
      { "@type": "Question", name: "What is personalised gemstone jewellery?", acceptedAnswer: { "@type": "Answer", text: "It is jewellery designed specifically for you using selected gemstones and custom design elements." } },
      { "@type": "Question", name: "Is gold used in birthstone jewellery?", acceptedAnswer: { "@type": "Answer", text: "Yes, gold is commonly used to enhance the beauty and value of birthstone jewellery." } },
      { "@type": "Question", name: "Can I add engraving to custom jewellery?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can add names, initials, dates, or meaningful messages." } },
      { "@type": "Question", name: "Is birthstone jewellery suitable for gifting?", acceptedAnswer: { "@type": "Answer", text: "Yes, it is one of the most meaningful and personalized gift options." } },
      { "@type": "Question", name: "How do I choose the right birthstone?", acceptedAnswer: { "@type": "Answer", text: "Birthstones are selected based on your birth month or personal preference." } },
      { "@type": "Question", name: "Can I redesign old jewellery into new designs?", acceptedAnswer: { "@type": "Answer", text: "Yes, old jewellery can be redesigned into modern custom pieces." } },
      { "@type": "Question", name: "How long does custom jewellery take to make?", acceptedAnswer: { "@type": "Answer", text: "Production time depends on design complexity and material selection." } },
      { "@type": "Question", name: "Are gemstone meanings important?", acceptedAnswer: { "@type": "Answer", text: "Many customers choose gemstones based on their symbolic or emotional significance." } },
      { "@type": "Question", name: "Can I request a unique jewellery design?", acceptedAnswer: { "@type": "Answer", text: "Yes, every custom jewellery piece is designed uniquely based on your idea." } },
      { "@type": "Question", name: "Is custom jewellery durable?", acceptedAnswer: { "@type": "Answer", text: "Yes, it is made using high-quality materials and professional craftsmanship." } },
      { "@type": "Question", name: "Can I order matching jewellery sets?", acceptedAnswer: { "@type": "Answer", text: "Yes, matching rings, pendants, and bracelets can be designed." } },
      { "@type": "Question", name: "What occasions is custom jewellery best for?", acceptedAnswer: { "@type": "Answer", text: "It is perfect for birthdays, weddings, anniversaries, and personal milestones." } },
      { "@type": "Question", name: "Can I preview my jewellery before final production?", acceptedAnswer: { "@type": "Answer", text: "Yes, design previews or sketches are shared before final creation." } },
      { "@type": "Question", name: "Why should I choose custom jewellery over ready-made pieces?", acceptedAnswer: { "@type": "Answer", text: "Custom jewellery offers uniqueness, emotional value, and a personal connection that ready-made jewellery cannot match." } },
    ],
  },
];

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
      <ServicesPage />
    </>
  );
}