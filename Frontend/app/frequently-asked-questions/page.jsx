import Faqs from "./Faqs";

export const metadata = {
  title: "FAQ – Frequently Asked Questions | Help & Support",
  description:
    "Find answers to common questions about Barosche jewelry, orders, shipping, and returns in our helpful and detailed FAQ section.",
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
    title: "FAQ – Frequently Asked Questions | Help & Support",
    description:
      "Find answers to common questions about Barosche jewelry, orders, shipping, and returns in our helpful and detailed FAQ section.",
    type: "website",
  },
};

export default function Page() {
  return <Faqs />;
}