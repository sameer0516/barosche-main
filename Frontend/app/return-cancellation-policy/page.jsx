import ReturnPolicy from "./ReturnPolicy";

const PAGE_URL = "https://barosche.com/return-cancellation-policy/";
const OG_IMAGE = "/logo.png";
const TITLE = "Return & Cancellation Policy | Barosche Jewellery India";
const DESCRIPTION =
  "Check Barosche's return and cancellation policy for a simple, secure, and hassle-free process on all your jewelry purchases.";

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
        alt: "Barosche Return & Cancellation Policy",
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
        alt: "Barosche Return & Cancellation Policy",
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
  return <ReturnPolicy />;
}