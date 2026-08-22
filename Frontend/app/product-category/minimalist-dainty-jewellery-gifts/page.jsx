import Script from "next/script";
import Minimalist from './Minimalist';

const SITE_URL = "https://barosche.com";
const PAGE_URL = "https://barosche.com/product-category/minimalist-dainty-jewellery-gifts/ ";
const OG_IMAGE = "/Meta-image-1.jpg";
const TITLE = " Dainty Minimalist Gold Jewellery Gifts – Everyday Elegance ";
const DESCRIPTION =
  "Shop dainty minimalist gold jewellery gifts at Barosche. Discover delicate, refined pieces designed for effortless everyday wear and thoughtful, meaningful gifting. ";

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
        alt: "Barosche Jewellery Collection",
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
        alt: "Barosche Jewellery Collection",
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

  // 1. ItemList schema (dynamic — unchanged)
  {
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
  },

  // 2. FAQPage schema — updated to match the Minimalist Dainty Jewellery Gifts FAQ content
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${PAGE_URL}#faq`,
    mainEntity: [
      { "@type": "Question", name: "What are minimalist dainty jewellery gifts?", acceptedAnswer: { "@type": "Answer", text: "Minimalist dainty jewellery gifts are elegant jewellery pieces designed with simple details, delicate shapes, and refined finishes. They are perfect for women who appreciate subtle elegance and timeless accessories that can be worn every day." } },
      { "@type": "Question", name: "Why is minimalist jewellery a good gift for her?", acceptedAnswer: { "@type": "Answer", text: "Minimalist jewellery makes a thoughtful gift because it combines beauty, simplicity, and emotional value. A delicate jewellery piece can represent love, appreciation, and special memories while becoming a part of her everyday style." } },
      { "@type": "Question", name: "What are the best minimalist jewellery gifts for women?", acceptedAnswer: { "@type": "Answer", text: "Popular minimalist jewellery gifts for women include delicate gold rings, lightweight bracelets, elegant earrings, and dainty pendants. These pieces are versatile, stylish, and suitable for different personalities and occasions." } },
      { "@type": "Question", name: "What makes dainty gold jewellery a meaningful gift?", acceptedAnswer: { "@type": "Answer", text: "A dainty gold jewellery gift combines timeless beauty with sentimental value. Its elegant design makes it a thoughtful way to express love, appreciation, and care while offering a piece she can cherish for years." } },
      { "@type": "Question", name: "Is minimalist jewellery suitable for everyday wear?", acceptedAnswer: { "@type": "Answer", text: "Yes, minimalist jewellery is ideal for everyday wear because of its lightweight designs and comfortable style. Delicate rings, bracelets, earrings, and pendants can easily complement daily outfits without feeling heavy." } },
      { "@type": "Question", name: "What is an everyday jewellery gift?", acceptedAnswer: { "@type": "Answer", text: "An everyday jewellery gift is a piece designed for regular use while maintaining elegance and comfort. Minimalist rings, fine bracelets, subtle earrings, and simple pendants are excellent choices for everyday wear." } },
      { "@type": "Question", name: "Are minimalist gold rings good gifts for her?", acceptedAnswer: { "@type": "Answer", text: "Yes, minimalist gold rings are beautiful gifts for women who appreciate simple and elegant designs. They can symbolize love, appreciation, special memories, or important milestones." } },
      { "@type": "Question", name: "What occasions are suitable for gifting minimalist jewellery?", acceptedAnswer: { "@type": "Answer", text: "Minimalist jewellery is suitable for birthdays, anniversaries, Valentine's Day, festivals, relationship milestones, achievements, and even surprise gifts without a specific occasion." } },
      { "@type": "Question", name: "Why are dainty jewellery gifts becoming popular?", acceptedAnswer: { "@type": "Answer", text: "Dainty jewellery gifts are popular because they offer a perfect balance of elegance, comfort, and versatility. Their subtle designs suit modern lifestyles and can be styled with different outfits." } },
      { "@type": "Question", name: "What jewellery should I gift if she prefers simple designs?", acceptedAnswer: { "@type": "Answer", text: "If she prefers simple jewellery, consider minimalist gold rings, delicate bracelets, small earrings, or elegant pendants. These designs provide a refined look while matching her understated style." } },
      { "@type": "Question", name: "Can minimalist jewellery be worn with different outfits?", acceptedAnswer: { "@type": "Answer", text: "Yes, minimalist jewellery is highly versatile and can be paired with casual, professional, and special occasion outfits. Its timeless design allows it to complement different fashion styles effortlessly." } },
      { "@type": "Question", name: "How do I choose the right minimalist jewellery gift for her?", acceptedAnswer: { "@type": "Answer", text: "To choose the right gift, consider her personal style, the jewellery she already wears, her lifestyle, and the occasion. Selecting a piece that matches her preferences makes the gift more meaningful." } },
      { "@type": "Question", name: "Are minimalist jewellery pieces suitable for romantic gifts?", acceptedAnswer: { "@type": "Answer", text: "Yes, minimalist jewellery makes a romantic gift because it represents thoughtfulness, affection, and the special connection between two people. A delicate piece can become a lasting reminder of your relationship." } },
      { "@type": "Question", name: "What is included in an everyday fine jewellery gift set?", acceptedAnswer: { "@type": "Answer", text: "An everyday fine jewellery gift set may include coordinated pieces such as delicate earrings, elegant rings, fine bracelets, and minimalist pendants designed to complement each other." } },
      { "@type": "Question", name: "Why choose minimalist gold jewellery over bold designs?", acceptedAnswer: { "@type": "Answer", text: "Minimalist gold jewellery offers timeless elegance and everyday versatility. Unlike bold statement pieces, delicate designs can be worn regularly and remain stylish across changing trends." } },
      { "@type": "Question", name: "Are minimalist jewellery gifts suitable for all age groups?", acceptedAnswer: { "@type": "Answer", text: "Yes, minimalist jewellery gifts are suitable for women of different ages because their elegant and timeless designs complement various styles and preferences." } },
      { "@type": "Question", name: "How can I make a minimalist jewellery gift more personal?", acceptedAnswer: { "@type": "Answer", text: "You can make the gift more personal by choosing a design that reflects her personality, selecting a piece connected to a special memory, or choosing jewellery that matches her everyday style." } },
      { "@type": "Question", name: "Why choose Barosche for minimalist jewellery gifts?", acceptedAnswer: { "@type": "Answer", text: "Barosche offers thoughtfully designed minimalist jewellery that combines refined aesthetics, premium craftsmanship, comfort, and timeless appeal. Each piece is created to make gifting moments more meaningful." } },
      { "@type": "Question", name: "How should minimalist jewellery be cared for?", acceptedAnswer: { "@type": "Answer", text: "To maintain the beauty of minimalist jewellery, store pieces in a jewellery box or soft pouch, avoid contact with harsh chemicals, clean gently with a soft cloth, and remove jewellery during heavy activities." } },
      { "@type": "Question", name: "Why is minimalist jewellery considered a timeless gift?", acceptedAnswer: { "@type": "Answer", text: "Minimalist jewellery is considered timeless because its simple and elegant designs remain beautiful beyond changing trends. A carefully chosen piece becomes a lasting keepsake filled with memories and emotional value." } },
    ],
  },

  // 3. CollectionPage schema — headline updated to match the current page content
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: TITLE,
    headline: "Minimalist Dainty Jewellery Gifts – Elegant Everyday Jewellery for Her",
    description: DESCRIPTION,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      "@id": `${PAGE_URL}#primaryimage`,
      url: "https://barosche.com/logo.png",
      contentUrl: "https://barosche.com/logo.png",
      caption: "Barosche Jewellery Collection",
    },
    breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
    mainEntity: { "@id": `${PAGE_URL}#product-list` },
    hasPart: { "@id": `${PAGE_URL}#faq` },
  },

  // 4. BreadcrumbList schema (dynamic — unchanged)
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${PAGE_URL}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Jewellery", item: PAGE_URL },
    ],
  },
];

export default function Page() {
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
      <Minimalist />
    </>
  );
}