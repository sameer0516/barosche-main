import SitemapList from "./SitemapList";

const PAGE_URL = "https://barosche.com/sitemap/";
const OG_IMAGE = "/logo.png";
const TITLE = "HTML Sitemap | Explore All Pages Easily";
const DESCRIPTION =
  "Explore our complete HTML sitemap to easily navigate and find all pages on our website in one place for a better user experience.";

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
        alt: "Barosche Sitemap",
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
        alt: "Barosche Sitemap",
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
  return <SitemapList />;
}