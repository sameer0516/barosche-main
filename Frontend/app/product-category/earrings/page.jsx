import Earrings from './Earrings';
export const metadata = {
  title: "Shop Elegant Daily Wear Earrings for Women Online",
  description:
    "Buy elegant daily wear earrings for women online. Explore minimal, stylish, and statement designs perfect for everyday wear, office looks, and special occasions.",
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
    title: "Shop Elegant Daily Wear Earrings for Women Online",
    description:
      "Buy elegant daily wear earrings for women online. Explore minimal, stylish, and statement designs perfect for everyday wear, office looks, and special occasions.",
    type: "website",
  },
  icons: {
    icon: "/BaroscheSymbol.png",
  },
};

export default function Page() {
  return <Earrings />;
}