import ContactPage from './ContactPage';

export const metadata = {
  title: "Contact Barosche | Customer Support & Jewellery Enquiries",
  description:
    "Get in touch with Barosche for product enquiries, order support, or personalised jewellery services. We’re here to help you.",
  keywords: [
    "Barosche Jewellery",
    "About Barosche",
    "Luxury Jewellery",
    "Diamond Jewellery",
    "Gold Jewellery",
    "Custom Jewellery",
    "Fine Jewellery"
  ],
  openGraph: {
    title: "Contact Barosche | Customer Support & Jewellery Enquiries",
    description:
      "Get in touch with Barosche for product enquiries, order support, or personalised jewellery services. We’re here to help you.",
    type: "website",
  },
  icons: {
    icon: "/BaroscheSymbol.png",
  },
};

export default function Page() {
  return <ContactPage />;
}