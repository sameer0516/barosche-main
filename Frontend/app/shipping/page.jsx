import Shipping from './Shipping';

export const metadata = {
  title: "Shipping Policy & Delivery Information | Barosche",
  description:
    "Learn about Barosche shipping policies, delivery options, and estimated timelines to receive your jewellery orders safely and on time.",
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
    title: "Shipping Policy & Delivery Information | Barosche",
    description:
      "Learn about Barosche shipping policies, delivery options, and estimated timelines to receive your jewellery orders safely and on time.",
    type: "website",
  },
};

export default function Page() {
  return <Shipping />;
}