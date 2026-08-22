import ContactPage from './ContactPage';

const PAGE_URL = "https://barosche.com/contact-us/";
const OG_IMAGE = "/logo.png";
const TITLE = "Contact Barosche | Customer Support & Jewellery Enquiries";
const DESCRIPTION =
  "Get in touch with Barosche for product enquiries, order support, or personalised jewellery services. We're here to help you.";

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
        alt: "Contact Barosche - Customer Support & Jewellery Enquiries",
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
        alt: "Contact Barosche - Customer Support & Jewellery Enquiries",
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
  return <ContactPage />;
}