import SizePage from "./SizePage";

const PAGE_URL = "https://barosche.com/size-guide/";
const OG_IMAGE = "/logo.png";
const TITLE = "Jewellery Size Guide – Rings & Necklaces | Barosche";
const DESCRIPTION =
  "Find your perfect fit with Barosche's detailed jewellery size guide for rings, necklaces, and other accessories for accurate sizing.";

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
        alt: "Barosche Jewellery Size Guide - Rings & Necklaces",
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
        alt: "Barosche Jewellery Size Guide - Rings & Necklaces",
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
  return <SizePage />;
}