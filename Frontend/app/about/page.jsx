import AboutPage from "./AboutPage";

const PAGE_URL = "https://barosche.com/about/";
const OG_IMAGE = "/logo.png";
const TITLE = "About Barosche | Minimalist Luxury Jewellery Brand";
const DESCRIPTION =
  "Learn about Barosche – a modern jewellery brand crafting minimalist, elegant, and timeless pieces designed for individuality and everyday luxury.";

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
        alt: "About Barosche - Minimalist Luxury Jewellery Brand",
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
        alt: "About Barosche - Minimalist Luxury Jewellery Brand",
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

export default function Page() {
  return <AboutPage />;
}