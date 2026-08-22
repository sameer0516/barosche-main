import GuidePage from './GuidePage';

const PAGE_URL = "https://barosche.com/guide/";
const OG_IMAGE = "/logo.png";
const TITLE = "Jewellery Buying Guide | Expert Tips & Style Advice – Barosché";
const DESCRIPTION = "Learn how to choose the perfect jewellery with our complete guide. Discover styling tips, care advice, and expert insights from Barosché.";

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
        alt: "Barosche Jewellery Buying Guide",
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
        alt: "Barosche Jewellery Buying Guide",
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
  return <GuidePage />;
}